'use strict';

import { commands, window, ExtensionContext, Range, ViewColumn, Uri, Disposable } from 'vscode';
import { CodeActionParams, LanguageClient } from 'vscode-languageclient';
import { Commands } from './commands';
import { applyWorkspaceEdit } from './extension';
import { ListOverridableMethodsRequest, AddOverridableMethodsRequest, CheckHashCodeEqualsStatusRequest, GenerateHashCodeEqualsRequest,
OrganizeImportsRequest, ImportCandidate, ImportSelection, GenerateToStringRequest, CheckToStringStatusRequest, VariableField } from './protocol';

export function registerCommands(languageClient: LanguageClient, context: ExtensionContext) {
    registerOverrideMethodsCommand(languageClient, context);
    registerHashCodeEqualsCommand(languageClient, context);
    registerOrganizeImportsCommand(languageClient, context);
    registerChooseImportCommand(context);
    registerGenerateToStringCommand(languageClient, context);
}

function registerOverrideMethodsCommand(languageClient: LanguageClient, context: ExtensionContext): void {
    context.subscriptions.push(commands.registerCommand(Commands.OVERRIDE_METHODS_PROMPT, async (params: CodeActionParams) => {
        const result = await languageClient.sendRequest(ListOverridableMethodsRequest.type, params);
        if (!result || !result.methods || !result.methods.length) {
            window.showWarningMessage('No overridable methods found in the super type.');
            return;
        }

        result.methods.sort((a, b) => {
            const declaringClass = a.declaringClass.localeCompare(b.declaringClass);
            if (declaringClass !== 0) {
                return declaringClass;
            }

            const methodName = a.name.localeCompare(b.name);
            if (methodName !== 0) {
                return methodName;
            }

            return a.parameters.length - b.parameters.length;
        });

        const quickPickItems = result.methods.map(method => {
            return {
                label: `${method.name}(${method.parameters.join(',')})`,
                description: `${method.declaringClassType}: ${method.declaringClass}`,
                picked: method.unimplemented,
                originalMethod: method,
            };
        });

        const selectedItems = await window.showQuickPick(quickPickItems, {
            canPickMany: true,
            placeHolder: `Select methods to override or implement in ${result.type}`
        });
        if (!selectedItems.length) {
            return;
        }

        const workspaceEdit = await languageClient.sendRequest(AddOverridableMethodsRequest.type, {
            context: params,
            overridableMethods: selectedItems.map((item) => item.originalMethod),
        });
        applyWorkspaceEdit(workspaceEdit, languageClient);
    }));
}

function registerHashCodeEqualsCommand(languageClient: LanguageClient, context: ExtensionContext): void {
    context.subscriptions.push(commands.registerCommand(Commands.HASHCODE_EQUALS_PROMPT, async (params: CodeActionParams) => {
        const result = await languageClient.sendRequest(CheckHashCodeEqualsStatusRequest.type, params);
        if (!result || !result.fields || !result.fields.length) {
            window.showErrorMessage(`The operation is not applicable to the type ${result.type}.`);
            return;
        }

        let regenerate = false;
        if (result.existingMethods && result.existingMethods.length) {
            const ans = await window.showInformationMessage(`Methods ${result.existingMethods.join(' and ')} already ${result.existingMethods.length === 1 ? 'exists' : 'exist'} in the Class '${result.type}'. `
                + 'Do you want to regenerate the implementation?', 'Regenerate', 'Cancel');
            if (ans !== 'Regenerate') {
                return;
            }

            regenerate = true;
        }

        const fieldItems = result.fields.map((field) => {
            return {
                label: `${field.name}: ${field.type}`,
                picked: true,
                originalField: field
            };
        });
        const selectedFields = await window.showQuickPick(fieldItems, {
            canPickMany: true,
            placeHolder:  'Select the fields to include in the hashCode() and equals() methods.'
        });
        if (!selectedFields.length) {
            return;
        }

        const workspaceEdit = await languageClient.sendRequest(GenerateHashCodeEqualsRequest.type, {
            context: params,
            fields: selectedFields.map((item) => item.originalField),
            regenerate
        });
        applyWorkspaceEdit(workspaceEdit, languageClient);
    }));
}

function registerOrganizeImportsCommand(languageClient: LanguageClient, context: ExtensionContext): void {
    context.subscriptions.push(commands.registerCommand(Commands.ORGANIZE_IMPORTS, async (params: CodeActionParams) => {
        const workspaceEdit = await languageClient.sendRequest(OrganizeImportsRequest.type, params);
        applyWorkspaceEdit(workspaceEdit, languageClient);
    }));
}

function registerChooseImportCommand(context: ExtensionContext): void {
    context.subscriptions.push(commands.registerCommand(Commands.CHOOSE_IMPORTS, async (uri: string, selections: ImportSelection[]) => {
        const chosen: ImportCandidate[] = [];
        const fileUri: Uri = Uri.parse(uri);
        for (let i = 0; i < selections.length; i++) {
            const selection: ImportSelection = selections[i];
            // Move the cursor to the code line with ambiguous import choices.
            await window.showTextDocument(fileUri, { preserveFocus: true, selection: selection.range, viewColumn: ViewColumn.One });
            const candidates: ImportCandidate[] = selection.candidates;
            const items = candidates.map((item) => {
                return {
                    label: item.fullyQualifiedName,
                    origin: item
                };
            });

            const fullyQualifiedName = candidates[0].fullyQualifiedName;
            const typeName = fullyQualifiedName.substring(fullyQualifiedName.lastIndexOf(".") + 1);
            const disposables: Disposable[] = [];
            try {
                const pick = await new Promise<any>((resolve, reject) => {
                    const input = window.createQuickPick();
                    input.title = "Organize Imports";
                    input.step = i + 1;
                    input.totalSteps = selections.length;
                    input.placeholder = `Choose type '${typeName}' to import`;
                    input.items = items;
                    disposables.push(
                        input.onDidChangeSelection(items => resolve(items[0])),
                        input.onDidHide(() => {
                            reject(undefined);
                        }),
                        input
                    );
                    input.show();
                });
                chosen.push(pick ? pick.origin : null);
            } catch (err) {
                break;
            } finally {
                disposables.forEach(d => d.dispose());
            }
        }

        return chosen;
    }));
}

function registerGenerateToStringCommand(languageClient: LanguageClient, context: ExtensionContext): void {
    context.subscriptions.push(commands.registerCommand(Commands.GENERATE_TOSTRING_PROMPT, async (params: CodeActionParams) => {
        const result = await languageClient.sendRequest(CheckToStringStatusRequest.type, params);
        if (!result) {
            return;
        }

        if (result.exists) {
            const ans = await window.showInformationMessage(`Method 'toString()' already exists in the Class '${result.type}'. `
                + 'Do you want to replace the implementation?', 'Replace', 'Cancel');
            if (ans !== 'Replace') {
                return;
            }
        }

        let fields: VariableField[] = [];
        if (result.fields && result.fields.length) {
            const fieldItems = result.fields.map((field) => {
                return {
                    label: `${field.name}: ${field.type}`,
                    picked: true,
                    originalField: field
                };
            });
            const selectedFields = await window.showQuickPick(fieldItems, {
                canPickMany: true,
                placeHolder:  'Select the fields to include in the toString() method.'
            });
            if (!selectedFields) {
                return;
            }

            fields = selectedFields.map((item) => item.originalField);
        }

        const workspaceEdit = await languageClient.sendRequest(GenerateToStringRequest.type, {
            context: params,
            fields,
        });
        applyWorkspaceEdit(workspaceEdit, languageClient);
    }));
}
