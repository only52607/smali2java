import { join } from "path";
import { OutputChannel, window } from "vscode";
import { SmaliDecompiler } from "../SmaliDecompiler";
import { SmaliDecompilerFactory } from "../SmaliDecompilerFactory";
import { JadxDecompiler } from "./JadxDecompiler";

export class SmaliDecompilerFactoryImpl implements SmaliDecompilerFactory {
    outputChannel: OutputChannel;
    constructor(
        public decompileTempPath: string
    ) {
        this.outputChannel = window.createOutputChannel("Smali2Java")
    }
    getSmailDecompiler(decompilerName: "jadx"): SmaliDecompiler {
        switch (decompilerName) {
            case "jadx": 
                return new JadxDecompiler(join(this.decompileTempPath, "jadx"), this.outputChannel)
        }
    }
}