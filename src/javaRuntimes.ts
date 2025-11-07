import { getRuntime, IJavaRuntime } from "jdk-utils";
import * as vscode from "vscode";
import { getSupportedJreNames } from "./jdkUtils";
import { Commands } from "./commands";
import * as path from "path";


export namespace JavaRuntimes {
    function compatible(runtime: IJavaRuntime, jreName: string): boolean {
        if (!runtime.version) {
            return true;
        }
        const majorVersion = runtime.version.major;
        if (majorVersion === 8) {
            return jreName === 'JavaSE-1.8';
        }
        const versionStrings = /[0-9]+/g.exec(jreName);
        if (versionStrings && versionStrings.length > 0) {
            return majorVersion >= parseInt(versionStrings[0]);
        }
        return false;
    }

    export async function initialize(context: vscode.ExtensionContext): Promise<void> {
        context.subscriptions.push(vscode.commands.registerCommand(Commands.ADD_JAVA_RUNTIME, async () => {
            const  lastSelectedDirectory: vscode.Uri | undefined = context.workspaceState.get('java.runtimes.lastSelectedDirectory');
            const directory = await vscode.window.showOpenDialog({
                canSelectFiles: false,
                canSelectFolders: true,
                canSelectMany: false,
                title: 'Select JDK Directory',
                defaultUri: lastSelectedDirectory,
            });
            if (directory) {
                context.workspaceState.update('java.runtimes.lastSelectedDirectory', vscode.Uri.file(path.dirname(directory[0].fsPath)));
                const runtime = await getRuntime(directory[0].fsPath, {withVersion: true});
                if (runtime) {
                    const config = vscode.workspace.getConfiguration('java.configuration').get('runtimes');
                    if (Array.isArray(config)) {
                        const candidates = getSupportedJreNames().filter(name => !config.some(r => r.name === name) && compatible(runtime, name));
                        if (candidates.length > 0) {
                            const name = await vscode.window.showQuickPick(candidates, {
                                title: 'Select Java Runtime',
                            });
                            if (name) {
                                config.push({
                                    name: name,
                                    path: directory[0].fsPath,
                                });
                                vscode.workspace.getConfiguration('java.configuration').update('runtimes', config, vscode.ConfigurationTarget.Global);
                                vscode.window.showInformationMessage(`JDK Directory ${directory[0].fsPath} added`);
                            }
                        } else {
                            vscode.window.showErrorMessage('No compatible environment available');
                        }
                    }
                } else {
                    vscode.window.showErrorMessage(`Invalid JDK Directory ${directory[0].fsPath}`);
                }
            }
        }));
    }
}