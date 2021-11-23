import { SmaliDecompiler } from "./SmaliDecompiler"
import { OutputChannel } from "vscode";
import { exec } from "child_process"
import { join } from "path";
import { promises as fs } from "fs"

export class JadxDecompiler implements SmaliDecompiler {
    constructor(public jadxPath: String, public sourceOutputDir: string, public smaliClassName: string) { }
    async decompile(inputFilePath: string, outputChannel: OutputChannel, options?: string): Promise<string> {
        const outputFilePath = join(this.sourceOutputDir, this.smaliClassName + ".java")
        try {
            await fs.stat(outputFilePath)
            await fs.unlink(outputFilePath)
        } catch { }
        return new Promise<string>((resolve, reject) => {
            exec(`${this.jadxPath} "${inputFilePath}" -ds "${this.sourceOutputDir}" ${options ?? ""}`, async (err, stdout, stderr) => {
                outputChannel.append(stdout)
                if (err || stderr.length > 0) {
                    outputChannel.show()
                    outputChannel.append(stderr)
                    reject()
                    return
                }
                try {
                    await fs.stat(outputFilePath)
                } catch {
                    reject()
                    return
                }
                resolve(outputFilePath)
            })
        })
    }
}