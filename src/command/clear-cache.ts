import { join } from "path"
import { ExtensionContext, window } from "vscode"
import { promises as fsAsync } from "fs"

export default (context: ExtensionContext) => async () => {
    const tempPath = join(context.globalStorageUri.fsPath, "decompiled")
    await fsAsync.rmdir(tempPath, { recursive: true })
    window.showInformationMessage("Decompiled files has been cleared")
}