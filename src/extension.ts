import { window, workspace, ExtensionContext, commands, Uri, languages, ProgressLocation, Progress, CancellationToken, TextDocument } from 'vscode';
import { getSmaliDocumentClassName } from './util/smali-util';
import { promises as fs } from 'fs';
import { JadxDecompiler } from './decompiler/JadxDecompiler';
import { join } from "path"
import JavaCodeProvider from './provider';

export function activate(context: ExtensionContext) {
	const provider = new JavaCodeProvider()
	workspace.registerTextDocumentContentProvider(JavaCodeProvider.scheme, provider);
	const outputChannel = window.createOutputChannel("Smali2Java")
	let decompileCommandRegistration = commands.registerCommand("smali2java.decompileCurrentSmaliToJava", async (uri: Uri) => {
		const jadxPath: string | undefined = workspace.getConfiguration("smali2java").get("jadxPath")
		if (!jadxPath) {
			window.showErrorMessage("Please configure the jadx executable path first")
			return
		}
		if (!(await fs.stat(jadxPath)).isFile()) {
			window.showErrorMessage("Invalid jadx executable path")
			return
		}
		const document = window.activeTextEditor?.document
		if (!document) {
			window.showErrorMessage("No editor is active")
			return
		}
		const className = getSmaliDocumentClassName(document)
		if (!className) {
			window.showErrorMessage("Invalid smali file")
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
				const resultUri = Uri.parse(`${JavaCodeProvider.scheme}:${resultJavaFilePath}`)
				const loadedDocument = workspace.textDocuments.find(document => !document.isClosed && document.uri.toString() == resultUri.toString())
				if (loadedDocument) {
					provider.onDidChangeEmitter.fire(resultUri)
					await window.showTextDocument(loadedDocument)
					return 
				}
				const textDoc = await workspace.openTextDocument(resultUri);
				const javaDoc = await languages.setTextDocumentLanguage(textDoc, "java")
				await window.showTextDocument(javaDoc)
			} catch(err) {
				window.showErrorMessage("Decompile failed")
			}
		})
	});
	context.subscriptions.push(decompileCommandRegistration);
}


export function deactivate() { }
