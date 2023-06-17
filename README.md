# Smali2Java

Smali2Java is a vscode extension that allows you to decompile a single `smali` file into Java code, which can be useful especially if you want to check that your modified smali code is correct.

[中文说明](/README_CN.md)

## Usage

1. Configure the path to the `jadx` executable in `smali2java.decompiler.jadx.path`. 

> [Jadx](https://github.com/skylot/jadx) is an excellent Java bytecode decompiler. Smali2Java uses it for decompilation. More decompilation tools will be supported in future releases.

Download [Jadx](https://github.com/skylot/jadx), unzip it somewhere, and modify the configuration item `smali2java.decompiler.jadx.path` to point to the path of the Jadx executable (not jadx-gui).
- example: C:/Program Files/jadx/bin/jadx.bat

2. Open a smali file using vscode.Then select `Decompile This File` from the editor context menu. Or just click the `Decompile` in the editor title bar.

![Usage](./res/snapshot/usage.gif)

## Extension Settings

* `smali2java.decompiler.jadx.path`: Path to jadx (or jadx.bat for windows).
* `smali2java.decompiler.jadx.options`: Options used to run jadx decompilation command (will be appended directly to the end of the command).
