'use strict';

import * as path from 'path';
import { workspace, FileCreateEvent, ExtensionContext, window, TextDocument, SnippetString, commands, Uri, FileRenameEvent, ProgressLocation } from 'vscode';
import { LanguageClient } from 'vscode-languageclient';
import { ListCommandResult } from './buildpath';
import { Commands } from './commands';
import { DidRenameFiles } from './protocol';

let serverReady: boolean = false;

export function setServerStatus(ready: boolean) {
    serverReady = ready;
}

export function registerFileEventHandlers(client: LanguageClient, context: ExtensionContext, ) {
    if (workspace.onDidCreateFiles) {// Theia doesn't support workspace.onDidCreateFiles yet
        context.subscriptions.push(workspace.onDidCreateFiles(handleNewJavaFiles));
    }

    if (workspace.onDidRenameFiles) {
        context.subscriptions.push(workspace.onDidRenameFiles((e: FileRenameEvent) => handleRenameFiles(e, client)));
    }
}

async function handleNewJavaFiles(e: FileCreateEvent) {
    const emptyFiles: Uri[] = [];
    const textDocuments: TextDocument[] = [];
    for (const uri of e.files) {
        if (!isJavaFile(uri)) {
            continue;
        }

        const textDocument = await workspace.openTextDocument(uri);
        if (textDocument.getText()) { // ignore the non-empty files
            continue;
        }

        emptyFiles.push(uri);
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
        const packageName = resolvePackageName(sourcePaths, emptyFiles[i].fsPath);
        const typeName: string = resolveTypeName(textDocuments[i].fileName);
        const snippets: string[] = [];
        if (packageName) {
            snippets.push(`package ${packageName};`);
        }
        snippets.push("");
        if (!serverReady || await isVersionLessThan(emptyFiles[i].toString(), 14)) {
            snippets.push(`public \${1|class,interface,enum|} ${typeName} {`);
        } else {
            snippets.push(`public \${1|class ${typeName},interface ${typeName},enum ${typeName},record ${typeName}()|} {`);
        }
        snippets.push("");
        snippets.push("}");
        const textEditor = await window.showTextDocument(textDocuments[i]);
        textEditor.insertSnippet(new SnippetString(snippets.join("\n")));
    }
}

async function handleRenameFiles(e: FileRenameEvent, client: LanguageClient) {
    if (!serverReady) {
        return;
    }

    const javaRenameEvents: Array<{ oldUri: string, newUri: string }> = e.files.filter(event =>
        isJavaFile(event.oldUri) && isJavaFile(event.newUri)
        && isInSameDirectory(event.oldUri, event.newUri)
    ).map(event => {
        return {
            oldUri: event.oldUri.toString(),
            newUri: event.newUri.toString(),
        };
    });

    if (!javaRenameEvents.length) {
        return;
    }

    window.withProgress({ location: ProgressLocation.Window }, async (p) => {
        return new Promise(async (resolve, reject) => {
            p.report({ message: "Computing rename updates..." });
            try {
                const edit = await client.sendRequest(DidRenameFiles.type, {
                    files: javaRenameEvents
                });
                const codeEdit = client.protocol2CodeConverter.asWorkspaceEdit(edit);
                if (codeEdit) {
                    workspace.applyEdit(codeEdit);
                }
            } finally {
                resolve();
            }
        });
    });
}

function isJavaFile(uri: Uri): boolean {
    return uri.fsPath && uri.fsPath.endsWith(".java");
}

function isInSameDirectory(oldUri: Uri, newUri: Uri): boolean {
    const oldDir = path.dirname(oldUri.fsPath);
    const newDir = path.dirname(newUri.fsPath);
    return !path.relative(oldDir, newDir);
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

const COMPLIANCE = "org.eclipse.jdt.core.compiler.compliance";
async function isVersionLessThan(fileUri: string, targetVersion: number): Promise<boolean> {
    let projectSettings = {};
    try {
        projectSettings = await commands.executeCommand<Object>(
            Commands.EXECUTE_WORKSPACE_COMMAND, Commands.GET_PROJECT_SETTINGS, fileUri, [ COMPLIANCE ]);
    } catch (err) {
        // do nothing.
    }

    let javaVersion = 0;
    let complianceVersion = projectSettings[COMPLIANCE];
    if (complianceVersion) {
        // Ignore '1.' prefix for legacy Java versions
        if (complianceVersion.startsWith('1.')) {
            complianceVersion = complianceVersion.substring(2);
        }

        // look into the interesting bits now
        const regexp = /\d+/g;
        const match = regexp.exec(complianceVersion);
        if (match) {
            javaVersion = parseInt(match[0]);
        }
    }

    return javaVersion < targetVersion;
}
