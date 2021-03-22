'use strict';

import { lstatSync } from 'fs-extra';
import * as path from 'path';
import { workspace, FileCreateEvent, ExtensionContext, window, TextDocument, SnippetString, commands, Uri, FileRenameEvent, ProgressLocation, WorkspaceEdit as CodeWorkspaceEdit, FileWillRenameEvent, Position, FileType, ConfigurationTarget, Disposable } from 'vscode';
import { LanguageClient, WorkspaceEdit as LsWorkspaceEdit } from 'vscode-languageclient';
import { ListCommandResult } from './buildpath';
import { Commands } from './commands';
import { WillRenameFiles } from './protocol';
import { getJavaConfiguration } from './utils';
import { userInfo } from 'os';
import * as stringInterpolate from 'fmtr';

let serverReady: boolean = false;

export function setServerStatus(ready: boolean) {
    serverReady = ready;
}

export function registerFileEventHandlers(client: LanguageClient, context: ExtensionContext) {
    if (workspace.onDidCreateFiles) {// Theia doesn't support workspace.onDidCreateFiles yet
        context.subscriptions.push(workspace.onDidCreateFiles(handleNewJavaFiles));
    }

    if (workspace.onWillRenameFiles) {
        context.subscriptions.push(workspace.onWillRenameFiles(getWillRenameHandler(client)));
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

    const formatNumber = (num => num > 9 ? String(num) : `0${num}`);
    for (let i = 0; i < emptyFiles.length; i++) {
        const typeName: string = resolveTypeName(textDocuments[i].fileName);
        const isPackageInfo = typeName === 'package-info';
        const isModuleInfo = typeName === 'module-info';
        const date = new Date();
        const context: any = {
            file_name: path.basename(textDocuments[i].fileName),
            package_name: "",
            type_name: typeName,
            user: userInfo().username,
            date: date.toLocaleDateString(),
            time: date.toLocaleTimeString(),
            year: date.getFullYear(),
            month: formatNumber(date.getMonth()),
            day: formatNumber(date.getDay()),
            hour: formatNumber(date.getHours()),
            minute: formatNumber(date.getMinutes()),
        };

        if (!isModuleInfo) {
            context.package_name = resolvePackageName(sourcePaths, emptyFiles[i].fsPath);
        }

        const snippets: string[] = [];
        const fileHeader = getJavaConfiguration().get<string[]>("templates.fileHeader");
        if (fileHeader && fileHeader.length) {
            for (const template of fileHeader) {
                snippets.push(stringInterpolate(template, context));
            }
        }

        if (!isModuleInfo) {
            if (context.package_name) {
                snippets.push(`package ${context.package_name};`);
                snippets.push("");
            }
        }
        if (!isPackageInfo) {
            const typeComment = getJavaConfiguration().get<string[]>("templates.typeComment");
            if (typeComment && typeComment.length) {
                for (const template of typeComment) {
                    snippets.push(stringInterpolate(template, context));
                }
            }

            if (isModuleInfo) {
                snippets.push(`module \${1:name} {`);
            } else if (!serverReady || await isVersionLessThan(emptyFiles[i].toString(), 14)) {
                snippets.push(`public \${1|class,interface,enum,abstract class,@interface|} ${typeName} {`);
            } else {
                snippets.push(`public \${1|class ${typeName},interface ${typeName},enum ${typeName},record ${typeName}(),abstract class ${typeName},@interface ${typeName}|} {`);
            }
            snippets.push("\t${0}");
            snippets.push("}");
            snippets.push("");
        }
        const textEditor = await window.showTextDocument(textDocuments[i]);
        textEditor.insertSnippet(new SnippetString(snippets.join("\n")));
    }
}

function getWillRenameHandler(client: LanguageClient) {
    return function handleWillRenameFiles(e: FileWillRenameEvent): void {
        if (!serverReady) {
            return;
        }

        e.waitUntil(new Promise(async (resolve, reject) => {
            try {
                const javaRenameEvents: Array<{ oldUri: string, newUri: string }> = [];
                for (const file of e.files) {
                    if (await isJavaFileWillRename(file.oldUri, file.newUri)
                        || await isFolderWillRename(file.oldUri, file.newUri)
                        || await isJavaWillMove(file.oldUri, file.newUri)) {
                        javaRenameEvents.push({
                            oldUri: file.oldUri.toString(),
                            newUri: file.newUri.toString(),
                        });
                    }
                }

                if (!javaRenameEvents.length) {
                    resolve(undefined);
                    return;
                }

                const edit = await client.sendRequest(WillRenameFiles.type, {
                    files: javaRenameEvents
                });
                resolve(client.protocol2CodeConverter.asWorkspaceEdit(edit));
            } catch (ex) {
                reject(ex);
            }
        }));
    };
}

function isJavaFile(uri: Uri): boolean {
    return uri.fsPath && uri.fsPath.endsWith(".java");
}

async function isFile(uri: Uri): Promise<boolean> {
    try {
        return (await workspace.fs.stat(uri)).type === FileType.File;
    } catch {
        return lstatSync(uri.fsPath).isFile();
    }
}

async function isDirectory(uri: Uri): Promise<boolean> {
    try {
        return (await workspace.fs.stat(uri)).type === FileType.Directory;
    } catch {
        return lstatSync(uri.fsPath).isDirectory();
    }
}

async function isJavaFileWillRename(oldUri: Uri, newUri: Uri): Promise<boolean> {
    if (isInSameDirectory(oldUri, newUri)) {
        return await isFile(oldUri) && isJavaFile(oldUri) && isJavaFile(newUri);
    }

    return false;
}

async function isFolderWillRename(oldUri: Uri, newUri: Uri): Promise<boolean> {
    return await isDirectory(oldUri);
}

async function isJavaWillMove(oldUri: Uri, newUri: Uri): Promise<boolean> {
    return await isFile(oldUri) && isJavaFile(oldUri) && isJavaFile(newUri)
        && !isInSameDirectory(oldUri, newUri);
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
    return !relative || (!relative.startsWith('..') && !path.isAbsolute(relative));
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
