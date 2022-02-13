import { window, workspace, ExtensionContext, Uri, languages, ProgressLocation, Progress, CancellationToken } from 'vscode';
import JavaCodeProvider from '../provider/JavaCodeProvider';
import { SmaliDecompilerFactoryImpl } from '../decompiler/impl/SmaliDecompilerFactoryImpl';
import { SmaliDecompilerFactory } from '../decompiler/SmaliDecompilerFactory';
import { join } from 'path';

async function showDecompileResult(uri: Uri, provider: JavaCodeProvider) {
    const loadedDocument = workspace.textDocuments.find(document => !document.isClosed && document.uri.toString() == uri.toString())
    if (loadedDocument) {
        provider.onDidChangeEmitter.fire(uri)
        await window.showTextDocument(loadedDocument)
        return 
    }
    const textDoc = await workspace.openTextDocument(uri);
    const javaDoc = await languages.setTextDocumentLanguage(textDoc, "java")
    await window.showTextDocument(javaDoc)
}

export default (context: ExtensionContext, provider: JavaCodeProvider) => {
    const decompilerFactory: SmaliDecompilerFactory = new SmaliDecompilerFactoryImpl(join(context.globalStorageUri.fsPath, "decompiled"))
    const decompileProgressOptions = {
        location: ProgressLocation.Notification,
        title: "Decompiling",
        cancellable: true
    }
    return async (uri: Uri) => window.withProgress(decompileProgressOptions, async (progress: Progress<{ message?: string; increment?: number }>, token: CancellationToken) => {
        try {
            const decompiler = decompilerFactory.getSmailDecompiler("jadx")
            const resultUri = await decompiler.decompile(uri)
            showDecompileResult(resultUri, provider)
        } catch(err: any) {
            window.showErrorMessage(`Decompile failed: ${err.message}`)
        }
    })
}