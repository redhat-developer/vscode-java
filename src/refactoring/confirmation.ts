import { window } from 'vscode';
import { RefactorWorkspaceEdit } from '../protocol';

export async function requestWithConfirmation<T extends { confirmationToken?: string }>(
    params: T,
    request: (params: T) => Promise<RefactorWorkspaceEdit>,
): Promise<RefactorWorkspaceEdit | undefined> {
    const refactorEdit = await request(params);
    if (!refactorEdit?.confirmationToken) {
        return refactorEdit;
    }

    const continueAction = 'Continue';
    const detail = `Review the details below before continuing:\n\n${refactorEdit.errorMessage}`;
    const selection = await window.showWarningMessage(
        'This refactoring may change program behavior. Continue anyway?',
        { modal: true, detail },
        continueAction,
    );
    if (selection !== continueAction) {
        return undefined;
    }

    return request({
        ...params,
        confirmationToken: refactorEdit.confirmationToken,
    });
}
