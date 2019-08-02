'use strict';

import { existsSync } from 'fs';
import * as path from 'path';
import { commands, ExtensionContext, Position, TextDocument, Uri, window, workspace } from 'vscode';
import { FormattingOptions, LanguageClient, WorkspaceEdit, CreateFile, RenameFile, DeleteFile, TextDocumentEdit } from 'vscode-languageclient';
import { Commands as javaCommands } from './commands';
import { GetRefactorEditRequest, MoveRequest, RefactorWorkspaceEdit, RenamePosition, GetMoveDestinationsRequest } from './protocol';

export function registerCommands(languageClient: LanguageClient, context: ExtensionContext) {
    registerApplyRefactorCommand(languageClient, context);
}

function registerApplyRefactorCommand(languageClient: LanguageClient, context: ExtensionContext): void {
    context.subscriptions.push(commands.registerCommand(javaCommands.RENAME_COMMAND, async (position: RenamePosition) => {
        try {
            const uri: Uri = Uri.parse(position.uri);
            const document: TextDocument = await workspace.openTextDocument(uri);
            if (document === null) {
                return;
            }

            const renamePosition: Position = document.positionAt(position.offset);
            await commands.executeCommand('editor.action.rename', [
                document.uri,
                renamePosition,
            ]);
        } catch (error) {
            // do nothing.
        }
    }));

    context.subscriptions.push(commands.registerCommand(javaCommands.APPLY_REFACTORING_COMMAND, async (command: string, params: any, commandInfo: any) => {
        if (command === 'extractVariable'
            || command === 'extractVariableAllOccurrence'
            || command === 'extractConstant'
            || command === 'extractMethod'
            || command === 'extractField'
            || command === 'convertVariableToField'
            || command === 'invertVariable') {
            const currentEditor = window.activeTextEditor;
            if (!currentEditor || !currentEditor.options) {
                return;
            }

            const formattingOptions: FormattingOptions = {
                tabSize: <number> currentEditor.options.tabSize,
                insertSpaces: <boolean> currentEditor.options.insertSpaces,
            };
            const commandArguments: any[] = [];
            if (command === 'extractField' || command === 'convertVariableToField') {
                if (commandInfo.initializedScopes && Array.isArray(commandInfo.initializedScopes)) {
                    const scopes: any[] = commandInfo.initializedScopes;
                    let initializeIn: string;
                    if (scopes.length === 1) {
                        initializeIn = scopes[0];
                    } else if (scopes.length > 1) {
                        initializeIn = await window.showQuickPick(scopes, {
                            placeHolder: "Initialize the field in",
                        });

                        if (!initializeIn) {
                            return;
                        }
                    }

                    commandArguments.push(initializeIn);
                }
            }

            const result: RefactorWorkspaceEdit = await languageClient.sendRequest(GetRefactorEditRequest.type, {
                command,
                context: params,
                options: formattingOptions,
                commandArguments,
            });

            await applyRefactorEdit(languageClient, result);
        } else if (command === 'moveFile') {
            if (!commandInfo || !commandInfo.uri) {
                return;
            }

            await moveFile(languageClient, [Uri.parse(commandInfo.uri)]);
        }
    }));
}

async function applyRefactorEdit(languageClient: LanguageClient, refactorEdit: RefactorWorkspaceEdit) {
    if (!refactorEdit) {
        return;
    }

    if (refactorEdit.errorMessage) {
        window.showErrorMessage(refactorEdit.errorMessage);
        return;
    }

    if (refactorEdit.edit) {
        const edit = languageClient.protocol2CodeConverter.asWorkspaceEdit(refactorEdit.edit);
        if (edit) {
            await workspace.applyEdit(edit);
        }
    }

    if (refactorEdit.command) {
        if (refactorEdit.command.arguments) {
            await commands.executeCommand(refactorEdit.command.command, ...refactorEdit.command.arguments);
        } else {
            await commands.executeCommand(refactorEdit.command.command);
        }
    }
}

async function moveFile(languageClient: LanguageClient, fileUris: Uri[]) {
    if (!hasCommonParent(fileUris)) {
        window.showErrorMessage("Moving files from different directories are not supported. Please make sure they are from the same directory.");
        return;
    }

    const moveDestinations = await languageClient.sendRequest(GetMoveDestinationsRequest.type, {
        destinationKind: 'package',
        sourceUris: fileUris.map(uri => uri.toString())
    });
    if (!moveDestinations || !moveDestinations.destinations || !moveDestinations.destinations.length) {
        window.showErrorMessage("Cannot find available Java packages to move the selected files to.");
        return;
    }

    const packageNodeItems = moveDestinations.destinations.map((packageNode) => {
        const packageUri: Uri = packageNode.uri ? Uri.parse(packageNode.uri) : null;
        const displayPath: string = packageUri ? workspace.asRelativePath(packageUri, true) : packageNode.path;
        return {
            label: (packageNode.isParentOfSelectedFile ? '* ' : '') + packageNode.displayName,
            description: displayPath,
            packageNode,
        }
    });

    let placeHolder = (fileUris.length === 1) ? `Choose the target package for ${getFileNameFromUri(fileUris[0])}.`
                    : `Choose the target package for ${fileUris.length} selected files.`;
    let selectPackageNodeItem = await window.showQuickPick(packageNodeItems, {
        placeHolder,
    });
    if (!selectPackageNodeItem) {
        return;
    }

    const packageUri: Uri = selectPackageNodeItem.packageNode.uri ? Uri.parse(selectPackageNodeItem.packageNode.uri) : null;
    if (packageUri && packageUri.fsPath) {
        const duplicatedFiles: string[] = [];
        const moveUris: Uri[] = [];
        for (const uri of fileUris) {
            const fileName: string = getFileNameFromUri(uri);
            if (existsSync(path.join(packageUri.fsPath, fileName))) {
                duplicatedFiles.push(fileName);
            } else {
                moveUris.push(uri);
            }
        }

        if (duplicatedFiles.length) {
            window.showWarningMessage(`The files '${duplicatedFiles.join(',')}' already exist in the package '${selectPackageNodeItem.packageNode.displayName}'. The move operation will ignore them.`);
        }

        if (!moveUris.length) {
            return;
        }

        fileUris = moveUris;
    }

    const refactorEdit: RefactorWorkspaceEdit = await languageClient.sendRequest(MoveRequest.type, {
        moveKind: 'moveResource',
        sourceUris: fileUris.map(uri => uri.toString()),
        destination: selectPackageNodeItem.packageNode,
        updateReferences: true,
    });

    await applyRefactorEdit(languageClient, refactorEdit);
    if (refactorEdit && refactorEdit.edit) {
        await saveEdit(refactorEdit.edit);
    }
}

function getFileNameFromUri(uri: Uri): string {
    return uri.fsPath.replace(/^.*[\\\/]/, '');
}

function hasCommonParent(uris: Uri[]): boolean {
    if (uris == null || uris.length <= 1) {
        return true;
    }

    const firstParent: string = path.dirname(uris[0].fsPath);
    for (let i = 1; i < uris.length; i++) {
        const parent = path.dirname(uris[i].fsPath);
        if (path.relative(firstParent, parent) !== '.') {
            return false;
        }
    }

    return true;
}

async function saveEdit(edit: WorkspaceEdit) {
    if (!edit) {
        return;
    }

    const touchedFiles: Set<string> = new Set<string>();
    if (edit.changes) {
        for (const uri of Object.keys(edit.changes)) {
            touchedFiles.add(uri);
        }
    }

    if (edit.documentChanges) {
        for (const change of edit.documentChanges) {
            const kind = (<any> change).kind;
            if (kind === 'rename') {
                if (touchedFiles.has((<RenameFile> change).oldUri)) {
                    touchedFiles.delete((<RenameFile> change).oldUri);
                    touchedFiles.add((<RenameFile> change).newUri);
                }
            } else if (kind === 'delete') {
                if (touchedFiles.has((<DeleteFile> change).uri)) {
                    touchedFiles.delete((<DeleteFile> change).uri);
                }
            } else if (!kind) {
                touchedFiles.add((<TextDocumentEdit> change).textDocument.uri);
            }
        }
    }

    for (const fileUri of touchedFiles) {
        const uri: Uri = Uri.parse(fileUri);
        const document: TextDocument = await workspace.openTextDocument(uri);
        if (document == null) {
            continue;
        }

        await document.save();
    }
}
