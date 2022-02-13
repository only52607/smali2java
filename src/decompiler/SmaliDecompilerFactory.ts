import { SmaliDecompiler } from "./SmaliDecompiler";

// TODO: Support more decompiler 
export type DecompilerName = "jadx"

export interface SmaliDecompilerFactory {
    getSmailDecompiler(decompilerName: DecompilerName): SmaliDecompiler
}