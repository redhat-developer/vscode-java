'use strict';

import * as vscode from "vscode";
import { LanguageClient } from "vscode-languageclient/node";
import { CheckExtractInterfaceStatusRequest, CheckExtractInterfaceStatusResponse, RefactorWorkspaceEdit } from "../protocol";

enum Step {
    selectMember,
    specifyInterfaceName,
    selectPackage,
}

export async function getExtractInterfaceArguments(languageClient: LanguageClient, params: any): Promise<any[]> {
    if (!params || !params.range) {
        return [];
    }
    const extractInterfaceResponse: CheckExtractInterfaceStatusResponse = await languageClient.sendRequest(CheckExtractInterfaceStatusRequest.type, params);
    if (!extractInterfaceResponse) {
        return [];
    }
    let step: Step = Step.selectMember;
    // step results, initialized as undefined
    let resultHandleIdentifiers: any[] | undefined;
    let interfaceName: string | undefined;
    let selectPackageNodeItem: SelectPackageQuickPickItem | undefined;
    while (step !== undefined) {
        switch (step) {
            case Step.selectMember:
                const items = extractInterfaceResponse.members.map((item) => {
                    return {
                        label: item.parameters ? `${item.name}(${item.parameters.join(", ")})` : item.name,
                        description: item.typeName,
                        handleIdentifier: item.handleIdentifier,
                        picked: resultHandleIdentifiers === undefined ? false : resultHandleIdentifiers.includes(item.handleIdentifier),
                    };
                });
                const members = await vscode.window.showQuickPick(items, {
                    title: "Extract Interface: Select members",
                    placeHolder: "Please select members to declare in the interface: ",
                    matchOnDescription: true,
                    ignoreFocusOut: true,
                    canPickMany: true,
                });
                if (!members) {
                    return [];
                }
                resultHandleIdentifiers = members.map((item) => item.handleIdentifier);
                if (!resultHandleIdentifiers) {
                    return [];
                }
                step = Step.specifyInterfaceName;
                break;
            case Step.specifyInterfaceName:
                const specifyInterfaceNameDisposables = [];
                const specifyInterfaceNamePromise = new Promise<string | boolean | undefined>((resolve, _reject) => {
                    const inputBox = vscode.window.createInputBox();
                    inputBox.title = "Extract Interface: Specify interface name";
                    inputBox.placeholder = "Please specify the new interface name: ";
                    inputBox.ignoreFocusOut = true;
                    inputBox.value = interfaceName === undefined ? extractInterfaceResponse.subTypeName : interfaceName;
                    inputBox.buttons = [(vscode.QuickInputButtons.Back)];
                    specifyInterfaceNameDisposables.push(
                        inputBox,
                        inputBox.onDidTriggerButton((button) => {
                            if (button === vscode.QuickInputButtons.Back) {
                                step = Step.selectMember;
                                resolve(false);
                            }
                        }),
                        inputBox.onDidAccept(() => {
                            resolve(inputBox.value);
                        }),
                        inputBox.onDidHide(() => {
                            resolve(undefined);
                        })
                    );
                    inputBox.show();
                });
                try {
                    const result = await specifyInterfaceNamePromise;
                    if (result === false) {
                        // go back
                        step = Step.selectMember;
                    } else if (result === undefined) {
                        // cancelled
                        return [];
                    } else {
                        interfaceName = result as string;
                        step = Step.selectPackage;
                    }
                } finally {
                    specifyInterfaceNameDisposables.forEach(d => d.dispose());
                }
                break;
            case Step.selectPackage:
                const selectPackageDisposables = [];
                const packageNodeItems = extractInterfaceResponse.destinationResponse.destinations.sort((node1, node2) => {
                    return node1.isParentOfSelectedFile ? -1 : 0;
                }).map((packageNode) => {
                    const packageUri: vscode.Uri = packageNode.uri ? vscode.Uri.parse(packageNode.uri) : null;
                    const displayPath: string = packageUri ? vscode.workspace.asRelativePath(packageUri, true) : packageNode.path;
                    return {
                        label: (packageNode.isParentOfSelectedFile ? '* ' : '') + packageNode.displayName,
                        description: displayPath,
                        packageNode,
                    };
                });
                const selectPackagePromise = new Promise<SelectPackageQuickPickItem | boolean | undefined>((resolve, _reject) => {
                    const quickPick = vscode.window.createQuickPick<SelectPackageQuickPickItem>();
                    quickPick.items = packageNodeItems;
                    quickPick.title = "Extract Interface: Specify package";
                    quickPick.placeholder = "Please select the target package for extracted interface.";
                    quickPick.ignoreFocusOut = true;
                    quickPick.buttons = [(vscode.QuickInputButtons.Back)];
                    selectPackageDisposables.push(
                        quickPick,
                        quickPick.onDidTriggerButton((button) => {
                            if (button === vscode.QuickInputButtons.Back) {
                                resolve(false);
                                step = Step.specifyInterfaceName;
                            }
                        }),
                        quickPick.onDidAccept(() => {
                            if (quickPick.selectedItems.length > 0) {
                                resolve(quickPick.selectedItems[0] as SelectPackageQuickPickItem);
                            }
                        }),
                        quickPick.onDidHide(() => {
                            resolve(undefined);
                        }),
                    );
                    quickPick.show();
                });
                try {
                    const result = await selectPackagePromise;
                    if (result === false) {
                        // go back
                        step = Step.specifyInterfaceName;
                    } else if (result === undefined) {
                        // cancelled
                        return [];
                    } else {
                        selectPackageNodeItem = result as SelectPackageQuickPickItem;
                        step = undefined;
                    }
                } finally {
                    selectPackageDisposables.forEach(d => d.dispose());
                }
                break;
            default:
                return [];
        }
    }
    return [resultHandleIdentifiers, interfaceName, selectPackageNodeItem.packageNode];
}

export async function revealExtractedInterface(refactorEdit: RefactorWorkspaceEdit) {
    if (refactorEdit?.edit?.documentChanges) {
        for (const change of refactorEdit.edit.documentChanges) {
            if ("kind" in change && change.kind === "create") {
                for (const document of vscode.workspace.textDocuments) {
                    if (document.uri.toString() === vscode.Uri.parse(change.uri).toString()) {
                        await vscode.window.showTextDocument(document);
                        return;
                    }
                }
            }
        }
    }
}

interface SelectPackageQuickPickItem extends vscode.QuickPickItem {
    packageNode: any;
}
