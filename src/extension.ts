import { window, workspace, ExtensionContext, commands, Uri, TextDocumentContentProvider, languages, ProgressLocation, Progress, CancellationToken } from 'vscode';
import { getSmaliDocumentClassName } from './util/smali-util';
import { promises as fs } from 'fs';
import { JadxDecompiler } from './decompiler/JadxDecompiler';
import { join } from "path"

export function activate(context: ExtensionContext) {
	workspace.registerTextDocumentContentProvider("smali2java", new (class implements TextDocumentContentProvider {
		async provideTextDocumentContent(uri: Uri): Promise<string> {
			const buffer = await fs.readFile(uri.path)
			return buffer.toString()
		}
	})());
	const outputChannel = window.createOutputChannel("Smali2Java")
	let disposable = commands.registerCommand("smali2java.decompileCurrentSmaliToJava", async (uri: Uri) => {
		const jadxPath: string | undefined = workspace.getConfiguration("smali2java").get("jadxPath")
		if (!jadxPath) {
			window.showErrorMessage("Please configure the jadx executable path first.")
			return
		}
		if (!(await fs.stat(jadxPath)).isFile()) {
			window.showErrorMessage("Invalid jadx executable path.")
			return
		}
		const document = window.activeTextEditor?.document
		if (!document) {
			window.showErrorMessage("No editor is active.")
			return
		}
		const className = getSmaliDocumentClassName(document)
		if (!className) {
			window.showErrorMessage("Invalid smali file.")
			return
		}
		window.withProgress({
			location: ProgressLocation.Notification,
			title: "Decompiling",
			cancellable: true
		},async (progress: Progress<{ message?: string; increment?: number }>, token: CancellationToken) => {
			const decompiler = new JadxDecompiler(jadxPath, join(context.globalStorageUri.fsPath, "decompiled", "temp"), className)
			try {
				const resultJavaFilePath = await decompiler.decompile(uri.fsPath, outputChannel)
				const textDoc = await workspace.openTextDocument(Uri.parse(`smali2java:${resultJavaFilePath}`));
				const javaDoc = await languages.setTextDocumentLanguage(textDoc, "java")
				await window.showTextDocument(javaDoc, { preview: false })
			} catch(err) {
				window.showErrorMessage("Decompile failed.")
			}
		})
	});
	context.subscriptions.push(disposable);
}


export function deactivate() { }
