import { TextDocument } from "vscode";

export function getSmaliDocumentClassName(document: TextDocument) {
    const count = document.lineCount;
    for (let i = 0; i < count; i++) {
        const line = document.lineAt(i).text;
        const result = line.match(/\.class.*? L(.+);/);
        if (result && result.length == 2) {
            return result[1];
        }
    }
    return undefined;
}