import { Uri } from "vscode";

export interface SmaliDecompiler {
    decompile(smaliFileUri: Uri, options?: any): Promise<Uri>
}

export class DecompileError extends Error {
    constructor(msg: string) {
        super(msg);
        Object.setPrototypeOf(this, DecompileError.prototype);
    }
}