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
        const outputFilePath = this.getOutputFilePath(smaliClassName)
        const { stdout, stderr } = await execAsync(`${await config.path} ${this.quote(smaliFileUri.fsPath)} -ds ${this.quote(this.sourceOutputDir)} ${config.options ?? ""}`)
        this.outputChannel.append(stdout)
        if (stderr && stderr.length > 0) {
            this.outputChannel.show()
            this.outputChannel.append(stderr)
            throw new DecompileError("View the output for details")
        }
        try {
            await fsAsync.stat(outputFilePath)
        } catch(e) {
            throw new DecompileError(`Error is caught when reading ${outputFilePath}: ${e}`)
        }
        return Uri.from({
            scheme: JavaCodeProvider.scheme,
            path: outputFilePath
        })
    }

    private quote(str: string) {
        if (process.platform == "win32") {
            return `"${str}"`
        }
        return `'${str}'`
    }
}