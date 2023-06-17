import { workspace, ExtensionContext, commands } from 'vscode';
import JavaCodeProvider from './provider/JavaCodeProvider';
import DecompileCommand from './command/decompile';
import clearCacheCommand from './command/clear-cache';

export function activate(context: ExtensionContext) {
	const provider = new JavaCodeProvider();
	context.subscriptions.push(
		workspace.registerTextDocumentContentProvider(JavaCodeProvider.scheme, provider),
		commands.registerCommand("smali2java.decompileThisFile", DecompileCommand(context, provider)),
		commands.registerCommand("smali2java.clearCache", clearCacheCommand(context))
	);
}

export function deactivate() { }