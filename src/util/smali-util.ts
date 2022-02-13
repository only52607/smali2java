import { TextDocument, Uri } from "vscode";
import * as fs from "fs"
import * as readline from "readline"

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

export async function getSmaliDocumentClassNameFromUri(uri: Uri): Promise<string | undefined> {
    const readStream = fs.createReadStream(uri.fsPath)
    const reader = readline.createInterface({
        input: readStream,
        output: process.stdout,
        terminal: false
    });
    return await new Promise<string>(resolve => {
        reader.on('line', (line) => {
            const result = line.match(/\.class.*? L(.+);/);
            if (result && result.length == 2) {
                resolve(result[1])
                // It doesn't work
                reader.close()
                readStream.close()
                readStream.destroy()
            }
        });
    })
}