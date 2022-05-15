# Smali2Java ![vscode](https://vsmarketplacebadge.apphb.com/version/ooooonly.smali2java.svg)

Smali2Java is a vscode extension that allows you to decompile a single `smali` file into Java code, which can be useful especially if you want to check that your modified smali code is correct.

[中文说明](/README_CN.md)

## Usage

1. Configure the path to the `jadx` executable in `smali2java.jadxPath`. 

> [Jadx](https://github.com/skylot/jadx) is an excellent Java bytecode decompiler. Smali2Java uses it for decompilation. More decompilation tools will be supported in future releases.

Download [Jadx](https://github.com/skylot/jadx), unzip it somewhere, and modify the configuration item `smali2java.jadxPath` to point to the path of the Jadx executable (not jadx-gui).
- example: C:/Program Files/jadx/bin/jadx.bat

2. Open a smali file using vscode.Then select `Decompile to Java` from the editor context menu. Or just click the `Decompile` in the editor title bar.

![Usage](./res/snapshot/usage.gif)

## Extension Settings

* `smali2java.jadxPath`: Specifies the jadx executable path which use to decompile smali.
* `smali2java.jadxOptions`: Specifies additional command line arguments required for decompilation
