import { Uri, TextDocumentContentProvider, EventEmitter } from 'vscode';
import { promises as fs } from 'fs';

export default class JavaCodeProvider implements TextDocumentContentProvider {
    static scheme = 'smali2java';

    onDidChangeEmitter = new EventEmitter<Uri>()
    onDidChange = this.onDidChangeEmitter.event

    dispose() {
        this.onDidChangeEmitter.dispose()
    }

    async provideTextDocumentContent(uri: Uri): Promise<string> {
        const buffer = await fs.readFile(uri.path)
        return buffer.toString()
    }
}