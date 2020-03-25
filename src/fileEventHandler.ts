'use strict';

import * as path from 'path';
import { workspace, FileCreateEvent, ExtensionContext, FileRenameEvent, window, TextDocument, SnippetString, commands, Uri } from 'vscode';
import { LanguageClient } from 'vscode-languageclient';
import { ListCommandResult } from './buildpath';
import { Commands } from './commands';

let serverReady: boolean = false;

export function setServerStatus(onReady: boolean) {
    serverReady = onReady;
}

export function registerFileEventHandlers(client: LanguageClient, context: ExtensionContext, ) {
    context.subscriptions.push(workspace.onDidCreateFiles(didCreateFiles));
}

async function didCreateFiles(e: FileCreateEvent) {
    const emptyFiles: string[] = [];
    const textDocuments: TextDocument[] = [];
    for (const uri of e.files) {
        if (!uri.fsPath || !uri.fsPath.endsWith(".java")) {
            continue;
        }

        const textDocument = await workspace.openTextDocument(uri);
        if (textDocument.getText()) { // ignore the non-empty files
            continue;
        }

        emptyFiles.push(uri.fsPath);
        textDocuments.push(textDocument);
    }

    if (!emptyFiles.length) {
        return;
    }

    let sourcePaths: string[] = [];
    if (serverReady) {
        const result: ListCommandResult = await commands.executeCommand<ListCommandResult>(Commands.EXECUTE_WORKSPACE_COMMAND, Commands.LIST_SOURCEPATHS);
        if (result && result.data && result.data.length) {
            sourcePaths = result.data.map((sourcePath) => sourcePath.path).sort((a, b) => b.length - a.length);
        }
    }

    for (let i = 0; i < emptyFiles.length; i++) {
        const snippets: string[] = [];
        const packageName = resolvePackageName(sourcePaths, emptyFiles[i]);
        if (packageName) {
            snippets.push(`package ${packageName};`);
        }

        const typeName: string = resolveTypeName(textDocuments[i].fileName);
        snippets.push(...[
            "",
            `public \${1|class,interface,enum|} ${typeName} {`,
            "",
            "}"
        ]);
        const textEditor = await window.showTextDocument(textDocuments[i]);
        textEditor.insertSnippet(new SnippetString(snippets.join("\n")));
    }
}

function resolveTypeName(filePath: string): string {
    const fileName: string = path.basename(filePath);
    const extName: string = path.extname(fileName);
    return fileName.substring(0, fileName.length - extName.length);
}

function resolvePackageName(sourcePaths: string[], filePath: string): string {
    if (!sourcePaths || !sourcePaths.length) {
        return "";
    }

    for (const sourcePath of sourcePaths) {
        if (isPrefix(sourcePath, filePath)) {
            const relative = path.relative(sourcePath, path.dirname(filePath));
            return relative.replace(/[\/\\]/g, ".");
        }
    }

    return "";
}

function isPrefix(parentPath: string, filePath: string): boolean {
    const relative = path.relative(parentPath, filePath);
    return relative && !relative.startsWith('..') && !path.isAbsolute(relative);
}
