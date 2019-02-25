'use strict';

import { commands, window } from 'vscode';
import { CodeActionParams, LanguageClient } from 'vscode-languageclient';
import { Commands } from './commands';
import { applyWorkspaceEdit } from './extension';
import { ListOverridableMethodsRequest, AddOverridableMethodsRequest } from './protocol';

export function registerCommands(languageClient: LanguageClient) {
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
