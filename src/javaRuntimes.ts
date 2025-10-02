import { getRuntime } from "jdk-utils";
import * as vscode from "vscode";
import { getSupportedJreNames } from "./jdkUtils";


export namespace JavaRuntimes {
    export async function initialize(context: vscode.ExtensionContext): Promise<void> {
        context.subscriptions.push(vscode.commands.registerCommand('java.runtimes.add', async () => {
            const directory = await vscode.window.showOpenDialog({
                canSelectFiles: false,
                canSelectFolders: true,
                canSelectMany: false,
                title: 'Select JDK Directory',
            });
            if (directory) {
                const runtime = await getRuntime(directory[0].fsPath);
                if (runtime) {
                    const config = vscode.workspace.getConfiguration('java.configuration').get('runtimes');
                    if (Array.isArray(config)) {
                        if (config.some(r => r.path === directory[0].fsPath)) {
                            vscode.window.showErrorMessage(`JDK Directory ${directory[0].fsPath} already configured`);
                        } else {
                            const name = await vscode.window.showQuickPick(getSupportedJreNames(), {
                                title: 'Select Java Runtime',
                            });
                            if (name) {
                                config.push({
                                    name: name,
                                    path: directory[0].fsPath,
                                });
                            }
                            vscode.workspace.getConfiguration('java.configuration').update('runtimes', config, vscode.ConfigurationTarget.Global);
                            vscode.window.showInformationMessage(`JDK Directory ${directory[0].fsPath} added`);
                        }
                    }
                } else {
                    vscode.window.showErrorMessage(`Invalid JDK Directory ${directory[0].fsPath}`);
                }
            }
        }));
    }
}