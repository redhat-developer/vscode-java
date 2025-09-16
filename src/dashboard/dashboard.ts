import { prepareExecutable } from '../javaServerStarter';
import { getComputedJavaConfig, getExecutable, getWorkspacePath } from '../extension';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { getNonce, getUri } from '../webviewUtils';
import { DashboardState, DiagnosticInfo, JVM, UpdateMessage } from '../webviewProtocol/toDashboard';
import { isLombokSupportEnabled, Lombok } from '../lombokSupport';
import { Commands } from '../commands';
import { apiManager } from '../apiManager';

const currentState: DashboardState = {
};

export namespace Dashboard {
	export function initialize(context: vscode.ExtensionContext): void {
		console.log('registering dashboard webview provider');
		let webview: vscode.Webview;

		context.subscriptions.push(vscode.window.registerWebviewViewProvider('java.dashboard', {
			resolveWebviewView: async function (webviewView: vscode.WebviewView, webviewContext: vscode.WebviewViewResolveContext, token: vscode.CancellationToken): Promise<void> {
				vscode.commands.executeCommand('setContext', 'java:dashboard', true);
				webview = webviewView.webview;
				webviewView.webview.options = {
					enableScripts: true,
					enableCommandUris: true,
					localResourceRoots: [context.extensionUri]
				};

				webviewView.webview.html = await getWebviewContent(webviewView.webview, context);
				webviewView.onDidDispose(() => {
					vscode.commands.executeCommand('setContext', 'java:dashboard', false);
				});
			}
		}));

		context.subscriptions.push(vscode.commands.registerCommand('java.dashboard.refresh', async () => {
			refreshLSInfo(webview);
		}));

		context.subscriptions.push(vscode.commands.registerCommand('java.dashboard.revealFileInOS', async (arg: { path: string }) => {
			await vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(arg.path));
		}));

		context.subscriptions.push(vscode.commands.registerCommand('java.dashboard.dumpState', async () => {
			await vscode.workspace.openTextDocument({
				language: 'json',
				content: JSON.stringify(currentState, null, 2)
			});
		}));

		console.log('registered dashboard webview provider');
	}
}

async function getJvms(): Promise<JVM[]> {
	const config = await getComputedJavaConfig();
	const jres: JVM[] = config.configuration.runtimes.map(jre => ({
		name: jre.name,
		version: jre.version,
		path: jre.path,
	}));
	return jres;

}

function getWebviewContent(webview: vscode.Webview, context: vscode.ExtensionContext) {
	setWebviewMessageListener(webview);

	const scriptUri = getUri(webview, context.extensionUri, [
		"dist",
		"dashboard.js",
	]);

	const nonce = getNonce();

	return /* html*/ `
  <!DOCTYPE html>
  <html lang="en">
	<head>
	  <meta charset="utf-8">
	  <meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
	  <meta name="theme-color" content="#000000">
	  <title>Dashboard</title>
	</head>
	<body>
	  <div id="root"></div>
	  <script nonce="${nonce}" src="${scriptUri}"></script>
	</body>
  </html>
`;
}
async function refreshLSInfo(webview: vscode.Webview): Promise<void> {
	try {
		vscode.commands.executeCommand<DiagnosticInfo>(Commands.EXECUTE_WORKSPACE_COMMAND, Commands.GET_TROUBLESHOOTING_INFO).then(info => {
			currentState.diagnosticInfo = info;
			const msg: UpdateMessage = {
				type: "update",
				diagnosticInfo: info
			};
			webview.postMessage(msg);
		});
	} catch (e) {
		console.error('Failed to get diagnostic info', e);
	}
}

function setWebviewMessageListener(webview: vscode.Webview) {

	vscode.workspace.onDidChangeConfiguration(e => {
		if (e.affectsConfiguration('java.jdt.ls.lombokSupport.enabled')) {
			currentState.lombokEnabled = isLombokSupportEnabled();
			const msg: UpdateMessage = {
				type: "update",
				lombokEnabled: isLombokSupportEnabled()
			};
			webview.postMessage(msg);
		}
		if (e.affectsConfiguration('java')) {
			setTimeout(() => refreshLSInfo(webview), 1000); // wait for LS to pick up the config change
		}
	});

	webview.onDidReceiveMessage(
		async (message: any) => {
			const command = message.command;
			switch (command) {
				case "webviewReady": {
					await apiManager.getApiInstance().serverReady;
					currentState.lombokEnabled = isLombokSupportEnabled();
					currentState.activeLombokPath = Lombok.getActiveLombokPath();
					currentState.workspacePath = getWorkspacePath();
					const message: UpdateMessage = {
						type: "update",
						lombokEnabled: isLombokSupportEnabled(),
						activeLombokPath: Lombok.getActiveLombokPath(),
						workspacePath: getWorkspacePath(),
					};
					await webview.postMessage(message);
					getJvms().then(jvms => {
						currentState.jvms = jvms;
						const msg: UpdateMessage = {
							type: "update",
							jvms: jvms
						};

						webview.postMessage(msg);
					});

					refreshLSInfo(webview);
					break;
				}
			}
		}
	);
}
