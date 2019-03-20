'use strict';

import { commands, window, ExtensionContext, Range, ViewColumn, Uri, Disposable} from 'vscode';
import { CodeActionParams, LanguageClient } from 'vscode-languageclient';
import { Commands } from './commands';
import { applyWorkspaceEdit } from './extension';
import { ListOverridableMethodsRequest, AddOverridableMethodsRequest, CheckHashCodeEqualsStatusRequest, GenerateHashCodeEqualsRequest,
OrganizeImportsRequest, ImportChoice } from './protocol';

export function registerCommands(languageClient: LanguageClient, context: ExtensionContext) {
    registerOverrideMethodsCommand(languageClient, context);
    registerHashCodeEqualsCommand(languageClient, context);
    registerOrganizeImportsCommand(languageClient, context);
    registerChooseImportCommand(context);
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
    context.subscriptions.push(commands.registerCommand(Commands.CHOOSE_IMPORT, async (importChoices: ImportChoice[][], ranges: Range[], uri: string) => {
        const chosen: ImportChoice[] = [];
        for (let i = 0; i < importChoices.length; i++) {
            // Move the cursor to the code line with ambiguous import choices.
            await window.showTextDocument(Uri.parse(uri), { preserveFocus: true, selection: ranges[i], viewColumn: ViewColumn.One });
            const items = importChoices[i].map((item) => {
                return {
                    label: item.qualifiedName,
                    origin: item
                };
            });
            const qualifiedName = importChoices[i].length ? importChoices[i][0].qualifiedName : "";
            const typeName = qualifiedName.substring(qualifiedName.lastIndexOf(".") + 1);
            const disposables: Disposable[] = [];
            try {
                const pick = await new Promise<any>((resolve, reject) => {
                    const input = window.createQuickPick();
                    input.title = "Organize Imports";
                    input.step = i + 1;
                    input.totalSteps = importChoices.length;
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
