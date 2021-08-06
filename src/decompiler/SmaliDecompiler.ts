import { OutputChannel } from "vscode";

export interface SmaliDecompiler {
    decompile(inputFilePath: string, outputChannel: OutputChannel, options?: any): Promise<string>
}