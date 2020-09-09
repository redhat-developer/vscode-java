'use strict';

import { lstatSync } from 'fs-extra';
import * as path from 'path';
import { workspace, FileCreateEvent, ExtensionContext, window, TextDocument, SnippetString, commands, Uri, FileRenameEvent, ProgressLocation, WorkspaceEdit as CodeWorkspaceEdit, FileWillRenameEvent, Position, FileType, ConfigurationTarget } from 'vscode';
import { LanguageClient, WorkspaceEdit as LsWorkspaceEdit, CreateFile, RenameFile, DeleteFile, TextDocumentEdit } from 'vscode-languageclient';
import { ListCommandResult } from './buildpath';
import { Commands } from './commands';
import { DidRenameFiles, WillRenameFiles } from './protocol';
import { Converter as ProtocolConverter } from 'vscode-languageclient/lib/protocolConverter';
import { getJavaConfiguration } from './utils';
import { userInfo } from 'os';
import * as stringInterpolate from 'fmtr';

let serverReady: boolean = false;
let pendingEditPromise: Promise<LsWorkspaceEdit>;

const PREFERENCE_KEY = "java.refactor.renameFromFileExplorer";
const enum Preference {
    Never = "never",
    AlwaysAutoApply = "autoApply",
    AlwaysPreview = "preview",
    Prompt = "prompt"
}

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

    if (workspace.onWillRenameFiles) {
        context.subscriptions.push(workspace.onWillRenameFiles((e: FileWillRenameEvent) => handleWillRenameFiles(e, client)));
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
                snippets.push(`public \${1|class,interface,enum|} ${typeName} {`);
            } else {
                snippets.push(`public \${1|class ${typeName},interface ${typeName},enum ${typeName},record ${typeName}()|} {`);
            }
            snippets.push("\t${0}");
            snippets.push("}");
            snippets.push("");
        }
        const textEditor = await window.showTextDocument(textDocuments[i]);
        textEditor.insertSnippet(new SnippetString(snippets.join("\n")));
    }
}

function isRenameRefactoringEnabled(): boolean {
    return workspace.getConfiguration().get<Preference>(PREFERENCE_KEY) !== Preference.Never;
}

function isPreviewRenameRefactoring(): boolean {
    const preference = workspace.getConfiguration().get<Preference>(PREFERENCE_KEY);
    return preference === Preference.AlwaysPreview || preference === Preference.Prompt;
}

function needsConfirmRenameRefactoring(): boolean {
    return workspace.getConfiguration().get<Preference>(PREFERENCE_KEY) === Preference.Prompt;
}

async function handleWillRenameFiles(e: FileWillRenameEvent, client: LanguageClient) {
    if (!serverReady || !isRenameRefactoringEnabled()) {
        return;
    }

    /**
     * The refactor package name needs to be counted out before the rename, so use onWillRenameFiles
     * listener for package rename cases.
     *
     * In addition, the client only gives 5s to the file event participants by default, which comes
     * with a setting files.participants.timeout. If the computation has not been completed within
     * that time limit, waitUntil will auto return and then emit didRename event.
     *
     * For these reasons, the onWillRenameFiles listener just computes the workspace edit and saves
     * it to a temporary variable. The onDidRenameFiles listener will check whether there is ongoing
     * computation, wait for it to complete, and then preview and apply the edit.
     */
    e.waitUntil(new Promise(async (resolve) => {
        try {
            const javaRenameEvents: Array<{ oldUri: string, newUri: string }> = [];
            for (const file of e.files) {
                if (await isPackageWillRename(file.oldUri, file.newUri)) {
                    javaRenameEvents.push({
                        oldUri: file.oldUri.toString(),
                        newUri: file.newUri.toString(),
                    });
                }
            }

            if (!javaRenameEvents.length) {
                return;
            }

            pendingEditPromise = client.sendRequest(WillRenameFiles.type, {
                files: javaRenameEvents
            });
            await pendingEditPromise;
        } catch (err) {
            // ignore
        } finally {
            resolve();
        }
    }));
}

async function handleRenameFiles(e: FileRenameEvent, client: LanguageClient) {
    if (!serverReady || !isRenameRefactoringEnabled()) {
        return;
    }

    // If the edit is already computed by onWillRename listeners, then apply it directly.
    if (pendingEditPromise) {
        const edit = await window.withProgress<LsWorkspaceEdit>({ location: ProgressLocation.Window }, async (p) => {
            return new Promise(async (resolve) => {
                p.report({ message: "Computing rename updates..." });
                let edit: LsWorkspaceEdit;
                try {
                    edit = await pendingEditPromise;
                } catch (err) {
                    // do nothing.
                } finally {
                    pendingEditPromise = null;
                    resolve(edit);
                }
            });
        });

        if (edit) {
            askForConfirmation();
            const codeEdit = asPreviewWorkspaceEdit(edit, client.protocol2CodeConverter, isPreviewRenameRefactoring(), "Rename updates", e.files);
            workspace.applyEdit(codeEdit);
        }

        return;
    }

    const javaRenameEvents: Array<{ oldUri: string, newUri: string }> = [];
    for (const file of e.files) {
        if (await isJavaFileRename(file.oldUri, file.newUri)) {
            javaRenameEvents.push({
                oldUri: file.oldUri.toString(),
                newUri: file.newUri.toString(),
            });
        }
    }

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

                const codeEdit = asPreviewWorkspaceEdit(edit, client.protocol2CodeConverter, isPreviewRenameRefactoring(), "Rename updates");
                if (codeEdit) {
                    askForConfirmation();
                    workspace.applyEdit(codeEdit);
                }
            } finally {
                resolve();
            }
        });
    });
}

function askForConfirmation() {
    if (needsConfirmRenameRefactoring()) {
        window.showInformationMessage("Do you want to automatically apply refactoring when renaming?",
            "Refactor automatically", "Always preview changes").then(async (answer) => {
            if (!answer) {
                return;
            }

            if (answer === "Refactor automatically") {
                workspace.getConfiguration().update(PREFERENCE_KEY, Preference.AlwaysAutoApply, ConfigurationTarget.Global);
                try {
                    commands.executeCommand("refactorPreview.apply");
                } catch (error) {
                    console.error(error);
                }
            } else if (answer === "Always preview changes") {
                workspace.getConfiguration().update(PREFERENCE_KEY, Preference.AlwaysPreview, ConfigurationTarget.Global);
            }
        });
    }
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

async function isJavaFileRename(oldUri: Uri, newUri: Uri): Promise<boolean> {
    if (isInSameDirectory(oldUri, newUri)) {
        return await isFile(newUri) && isJavaFile(oldUri) && isJavaFile(newUri);
    }

    return false;
}

async function isPackageWillRename(oldUri: Uri, newUri: Uri): Promise<boolean> {
    return isInSameDirectory(oldUri, newUri) && await isDirectory(oldUri);
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

/**
 * This function reference the implementation of asWorkspaceEdit() from 'vscode-languageclient/lib/protocolConverter'.
 */
function asPreviewWorkspaceEdit(item: LsWorkspaceEdit, converter: ProtocolConverter, enablePreview: boolean, label: string, renamedFiles?: ReadonlyArray<{ oldUri: Uri, newUri: Uri }>) {
    if (!item) {
        return undefined;
    }

    const result = new CodeWorkspaceEdit();
    if (item.documentChanges) {
        item.documentChanges.forEach(change => {
            if (CreateFile.is(change)) {
                result.createFile(converter.asUri(change.uri), change.options, {
                    needsConfirmation: false,
                    label,
                });
            } else if (RenameFile.is(change)) {
                result.renameFile(converter.asUri(change.oldUri), converter.asUri(change.newUri), change.options, {
                    needsConfirmation: false,
                    label,
                });
            } else if (DeleteFile.is(change)) {
                result.deleteFile(converter.asUri(change.uri), change.options, {
                    needsConfirmation: false,
                    label,
                });
            } else if (TextDocumentEdit.is(change)) {
                if (change.edits) {
                    change.edits.forEach(edit => {
                        result.replace(adjustUri(converter.asUri(change.textDocument.uri), renamedFiles), converter.asRange(edit.range), edit.newText, {
                            needsConfirmation: false,
                            label,
                        });
                    });
                }
            } else {
                console.error(`Unknown workspace edit change received:\n${JSON.stringify(change, undefined, 4)}`);
            }
        });
    } else if (item.changes) {
        Object.keys(item.changes).forEach(key => {
            if (item.changes[key]) {
                item.changes[key].forEach(edit => {
                    result.replace(adjustUri(converter.asUri(key), renamedFiles), converter.asRange(edit.range), edit.newText, {
                        needsConfirmation: false,
                        label,
                    });
                });
            }
        });
    }

    /**
     * See the issue https://github.com/microsoft/vscode/issues/94650.
     * The current vscode doesn't provide a way for the extension to pre-select all changes.
     *
     * As a workaround, this extension would append a dummy text edit that needs a confirm,
     * and then make all others text edits not need a confirm. This will ensure that
     * the REFACTOR PREVIEW panel can be triggered and all valid changes pre-selected.
     */
    const textEditEntries = result.entries();
    if (enablePreview && textEditEntries && textEditEntries.length) {
        const dummyNodeUri: Uri = textEditEntries[textEditEntries.length - 1][0];
        result.insert(dummyNodeUri, new Position(0, 0), "", {
            needsConfirmation: true,
            label: "Dummy node used to enable preview"
        });
    }

    return result;
}

// Correct the uri to the value after rename.
function adjustUri(originUri: Uri, renamedFiles: ReadonlyArray<{ oldUri: Uri, newUri: Uri }>): Uri {
    if (renamedFiles) {
        for (const file of renamedFiles) {
            if (isPrefix(file.oldUri.fsPath, originUri.fsPath)) {
                const relativePath = path.relative(file.oldUri.fsPath, originUri.fsPath);
                const newPath = path.join(file.newUri.fsPath, relativePath);
                return Uri.file(newPath);
            }
        }
    }

    return originUri;
}
