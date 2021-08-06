# Smali2Java

Smali2Java is a vscode extension that allows you to decompile a single `smali` file into Java code, which can be useful especially if you want to check that your modified smali code is correct.

## Usage

1. Configure the path to the `jadx` executable in `smali2java.jadxPath`.

> [jadx](https://github.com/skylot/jadx) is an excellent Java bytecode decompiler. Learn more about configuring it at `Requirement`.

2. Open a smali file using vscode.Then select `Decompile to Java` from the editor context menu. Or just click the `Decompile` in the editor title bar.

![Usage](./res/snapshot/usage.gif)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Requirements

Download [jadx](https://github.com/skylot/jadx), unzip it somewhere, and modify the configuration item `smali2java.jadxPath` to point to the path of the Jadx executable (not jadx-gui).
- example: C:/Program Files/jadx/bin/jadx.bat

## Extension Settings

* `smali2java.jadxPath`: Specifies the jadx executable path which use to decompile smali.
* `smali2java.jadxOptions`: Specifies additional command line arguments required for decompilation
