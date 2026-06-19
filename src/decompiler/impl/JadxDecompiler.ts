import { DecompileError, SmaliDecompiler } from "../SmaliDecompiler"
import { OutputChannel, Uri, workspace } from "vscode";
import { join } from "path";
import { promises as fsAsync } from "fs"
import JavaCodeProvider from "../../provider/JavaCodeProvider";
import { promisify } from 'util'
import { exec } from "child_process"
import { getSmaliDocumentClassNameFromUri } from "../../util/smali-util";

const execAsync = promisify(exec)

interface JadxConfig {
    path?: string,
    options?: string
}

export class JadxDecompiler implements SmaliDecompiler {
    constructor(
        public sourceOutputDir: string,
        public outputChannel: OutputChannel,
    ) {
    }

    private getOutputFilePath(smaliClassName: string) {
        return join(this.sourceOutputDir, (smaliClassName.includes("/") ? "" : "defpackage/") + smaliClassName + ".java")
    }

    private async collectJavaFiles(directoryPath: string): Promise<string[]> {
        const entries = await fsAsync.readdir(directoryPath, { withFileTypes: true })
        const results: string[] = []
        for (const entry of entries) {
            const entryPath = join(directoryPath, entry.name)
            if (entry.isDirectory()) {
                results.push(...await this.collectJavaFiles(entryPath))
            } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".java")) {
                results.push(entryPath)
            }
        }
        return results
    }

    private async findGeneratedOutputFilePath(smaliClassName: string): Promise<string> {
        const expectedOutputFilePath = this.getOutputFilePath(smaliClassName)
        try {
            await fsAsync.stat(expectedOutputFilePath)
            return expectedOutputFilePath
        } catch {
            try {
                const javaCandidates = await this.collectJavaFiles(this.sourceOutputDir)
                const normalizedExpectedOutputFilePath = expectedOutputFilePath.replace(/\\/g, "/")
                const normalizedExpectedBaseName = expectedOutputFilePath.split(/[\\/]/).pop()!.toLowerCase()
                const suffixMatchedCandidates = javaCandidates.filter((candidatePath) => candidatePath.replace(/\\/g, "/").endsWith(normalizedExpectedOutputFilePath))
                if (suffixMatchedCandidates.length === 1) {
                    return suffixMatchedCandidates[0]
                }
                const baseNameMatchedCandidates = javaCandidates.filter((candidatePath) => candidatePath.split(/[\\/]/).pop()!.toLowerCase() === normalizedExpectedBaseName)
                if (baseNameMatchedCandidates.length === 1) {
                    return baseNameMatchedCandidates[0]
                }
                const jadxPrefixedBaseNameMatchedCandidates = javaCandidates.filter((candidatePath) => candidatePath.split(/[\\/]/).pop()!.toLowerCase() === `c${normalizedExpectedBaseName}`)
                if (jadxPrefixedBaseNameMatchedCandidates.length === 1) {
                    return jadxPrefixedBaseNameMatchedCandidates[0]
                }
                const suffixWithoutRootDirectoryMatchedCandidates = javaCandidates.filter((candidatePath) => candidatePath.replace(/\\/g, "/").endsWith(`/${normalizedExpectedOutputFilePath.split("/").slice(-2).join("/").replace(normalizedExpectedBaseName, `c${normalizedExpectedBaseName}`)}`))
                if (suffixWithoutRootDirectoryMatchedCandidates.length === 1) {
                    return suffixWithoutRootDirectoryMatchedCandidates[0]
                }
                if (javaCandidates.length === 1) {
                    return javaCandidates[0]
                }
            } catch {
            }
            throw new DecompileError(`Error is caught when reading ${expectedOutputFilePath}: file not found`)
        }
    }

    private async loadConfig(): Promise<JadxConfig> {
        const config = workspace.getConfiguration("smali2java.decompiler.jadx")
        return {
            path: config.get("path"),
            options: config.get("options")
        }
    }

    async decompile(smaliFileUri: Uri): Promise<Uri> {
        const smaliClassName = await getSmaliDocumentClassNameFromUri(smaliFileUri)
        if (!smaliClassName) throw new DecompileError("Illegal smali file")
        const config = await this.loadConfig()
        if (!config.path) throw new DecompileError("The jadx executable path has not been configured")
        if (!(await fsAsync.stat(config.path)).isFile()) throw new DecompileError("Illegal jadx executable path")
        const { stdout, stderr } = await execAsync(`${await config.path} ${this.quote(smaliFileUri.fsPath)} -ds ${this.quote(this.sourceOutputDir)} ${config.options ?? ""}`)
        this.outputChannel.append(stdout)
        if (stderr && stderr.length > 0) {
            this.outputChannel.show()
            this.outputChannel.append(stderr)
            throw new DecompileError("View the output for details")
        }
        const outputFilePath = await this.findGeneratedOutputFilePath(smaliClassName)
        try {
            await fsAsync.stat(outputFilePath)
        } catch(e) {
            throw new DecompileError(`Error is caught when reading ${outputFilePath}: ${e}`)
        }
        return Uri.from({
            scheme: JavaCodeProvider.scheme,
            path: process.platform == "win32" ? outputFilePath.replace(/\\/g, "/") : outputFilePath
        })
    }

    private quote(str: string) {
        if (process.platform == "win32") {
            return `"${str}"`
        }
        return `'${str}'`
    }
}