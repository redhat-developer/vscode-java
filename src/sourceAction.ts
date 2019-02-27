'use strict';

import { commands, window } from 'vscode';
import { CodeActionParams, LanguageClient } from 'vscode-languageclient';
import { Commands } from './commands';
import { applyWorkspaceEdit } from './extension';
import { ListOverridableMethodsRequest, AddOverridableMethodsRequest, CheckHashCodeEqualsStatusRequest, GenerateHashCodeEqualsRequest } from './protocol';

export function registerCommands(languageClient: LanguageClient) {
    registerOverrideMethodsCommand(languageClient);
    registerHashCodeEqualsCommand(languageClient);
}

function registerOverrideMethodsCommand(languageClient: LanguageClient): void {
    commands.registerCommand(Commands.OVERRIDE_METHODS_PROMPT, async (params: CodeActionParams) => {
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
    });
}

function registerHashCodeEqualsCommand(languageClient: LanguageClient): void {
    commands.registerCommand(Commands.HASHCODE_EQUALS_PROMPT, async (params: CodeActionParams) => {
        const result = await languageClient.sendRequest(CheckHashCodeEqualsStatusRequest.type, params);
        if (!result || !result.fields || !result.fields.length) {
            window.showErrorMessage(`The operation is not applicable to the type ${result.type}.`);
            return;
        }

        if (result.foundHashCode || result.foundEquals) {
            const methods = [];
            if (result.foundHashCode) {
                methods.push('\'int hashCode()\'');
            }

            if (result.foundEquals) {
                methods.push('\'boolean equals(Object)\'');
            }

            const ans = await window.showInformationMessage(`Methods ${methods.join(' and ')} already exist in the Class '${result.type}'. `
                + 'Do you want to regenerate the implementation?', 'YES', 'NO');
            if (ans !== 'YES') {
                return;
            }

            result.settings.regenerate = true;
        }

        if (result.settings && result.settings.useJ7HashEquals !== undefined) {
            const template = await window.showQuickPick([
                'Use Objects.hash and Objects.equals methods (Java 7 or higher)',
                'Default template'
            ], {
                placeHolder: 'Select the template to generate the hashCode and equals methods.'
            });

            if (!template) {
                return;
            } else {
                result.settings.useJ7HashEquals = (template !== 'Default template');
            }
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
            settings: result.settings
        });
        applyWorkspaceEdit(workspaceEdit, languageClient);
    });
}