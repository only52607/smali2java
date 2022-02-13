import { DecompileError, SmaliDecompiler } from "../SmaliDecompiler"
import { OutputChannel, Uri, workspace } from "vscode";
import { join } from "path";
import { promises as fsAsync } from "fs"
import JavaCodeProvider from "../../provider/JavaCodeProvider";
import { promisify } from 'util'
import { exec } from "child_process"
import { getSmaliDocumentClassNameFromUri } from "../../util/smali-util";

const execAsync = promisify(exec)

export class JadxDecompiler implements SmaliDecompiler {
    constructor(
        public sourceOutputDir: string,
        public outputChannel: OutputChannel,
    ) {
        
    }

    private getOutputFilePath(smaliClassName: string) {
        return join(this.sourceOutputDir, (smaliClassName.includes("/") ? "" : "defpackage/") + smaliClassName + ".java")
    }

    private async getJadxPath(): Promise<string> {
        const jadxPath: string | undefined = workspace.getConfiguration("smali2java").get("jadxPath")
        if (!jadxPath) throw new DecompileError("The jadx executable path has not been configured")
        if (!(await fsAsync.stat(jadxPath)).isFile()) throw new DecompileError("Illegal jadx executable path")
        return jadxPath
    }

    async decompile(smaliFileUri: Uri, options?: any): Promise<Uri> {
        const smaliClassName = await getSmaliDocumentClassNameFromUri(smaliFileUri)
        if (!smaliClassName) throw new DecompileError("Illegal smali file")
        const outputFilePath = this.getOutputFilePath(smaliClassName)
        const { stdout, stderr } = await execAsync(`${await this.getJadxPath()} "${smaliFileUri.fsPath}" -ds "${this.sourceOutputDir}" ${options ?? ""}`)
        this.outputChannel.append(stdout)
        if (stderr && stderr.length > 0) {
            this.outputChannel.show()
            this.outputChannel.append(stderr)
            throw new DecompileError("View the output for details")
        }
        try {
            await fsAsync.stat(outputFilePath)
        } catch {
            throw new DecompileError("The compiled file is not found")
        }
        return Uri.from({
            scheme: JavaCodeProvider.scheme,
            path: outputFilePath
        })
    }
}