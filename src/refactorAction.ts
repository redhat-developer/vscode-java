'use strict';

import { commands, window, ExtensionContext, workspace, Position, Uri, TextDocument } from 'vscode';
import { LanguageClient, FormattingOptions } from 'vscode-languageclient';
import { Commands as javaCommands } from './commands';
import { GetRefactorEditRequest, RefactorWorkspaceEdit, RenamePosition } from './protocol';

export function registerCommands(languageClient: LanguageClient, context: ExtensionContext) {
    registerApplyRefactorCommand(languageClient, context);
}

function registerApplyRefactorCommand(languageClient: LanguageClient, context: ExtensionContext): void {
    context.subscriptions.push(commands.registerCommand(javaCommands.RENAME_COMMAND, async (position: RenamePosition) => {
        try {
            const uri: Uri = Uri.parse(position.uri);
            const document: TextDocument = await workspace.openTextDocument(uri);
            if (document == null) {
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

    context.subscriptions.push(commands.registerCommand(javaCommands.APPLY_REFACTORING_COMMAND, async (command: string, params: any) => {
        if (command === 'extractVariable'
            || command === 'extractVariableAllOccurrence'
            || command === 'extractConstant'
            || command === 'extractMethod') {
            const currentEditor = window.activeTextEditor;
            if (!currentEditor || !currentEditor.options) {
                return;
            }

            const formattingOptions: FormattingOptions = {
                tabSize: <number> currentEditor.options.tabSize,
                insertSpaces: <boolean> currentEditor.options.insertSpaces,
            };
            const result: RefactorWorkspaceEdit = await languageClient.sendRequest(GetRefactorEditRequest.type, {
                command,
                context: params,
                options: formattingOptions,
            });

            if (!result || !result.edit) {
                return;
            }

            const edit = languageClient.protocol2CodeConverter.asWorkspaceEdit(result.edit);
            if (edit) {
                await workspace.applyEdit(edit);
            }
            
            if (result.command) {
                if (result.command.arguments) {
                    await commands.executeCommand(result.command.command, ...result.command.arguments);
                } else {
                    await commands.executeCommand(result.command.command);
                }
            }
        }
    }));
}
