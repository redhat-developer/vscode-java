import * as vscode from 'vscode';
import { apiManager } from '../apiManager';
import { Commands } from '../commands';
import { getComputedJavaConfig, getWorkspacePath } from '../extension';
import { isLombokSupportEnabled, Lombok } from '../lombokSupport';
import { DashboardState, DiagnosticInfo, JVM, UpdateMessage } from '../webviewProtocol/toDashboard';
import { getNonce, getUri } from '../webviewUtils';

const currentState: DashboardState = {
};


class DashboardPanel {
	private disposables: vscode.Disposable[] = [];

	constructor(private webView: vscode.Webview, private readonly context: vscode.ExtensionContext) {
		this.init();
	}

	private init(): void {
		this.disposables.push(vscode.workspace.onDidChangeConfiguration(e => {
			if (e.affectsConfiguration('java.jdt.ls.lombokSupport.enabled')) {
				currentState.lombokEnabled = isLombokSupportEnabled();
				const msg: UpdateMessage = {
					type: "update",
					lombokEnabled: isLombokSupportEnabled()
				};
				this.postMessage(msg);
			}
			if (e.affectsConfiguration('java')) {
				setTimeout(() => this.refreshLSInfo(), 1000); // wait for LS to pick up the config change
			}
		}));
		this.setWebviewMessageListener();
		this.webView.html = this.getWebviewContent();
		this.disposables.push(vscode.commands.registerCommand('java.dashboard.refresh', async () => {
			this.refreshLSInfo();
		}));

		this.disposables.push(vscode.commands.registerCommand('java.dashboard.revealFileInOS', async (arg: { path: string }) => {
			await vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(arg.path));
		}));

		this.disposables.push(vscode.commands.registerCommand('java.dashboard.dumpState', async () => {
			const doc = await vscode.workspace.openTextDocument({
				language: 'json',
				content: JSON.stringify(currentState, null, 2)
			});
			vscode.window.showTextDocument(doc);
		}));
	}

	private postMessage(message: UpdateMessage) {
		if (this.webView) {
			this.webView.postMessage(message);
		}
	}

	private setWebviewMessageListener() {
		this.webView.onDidReceiveMessage(
			async (message: any) => {
				const command = message.command;
				switch (command) {
					case "webviewReady": {
						await apiManager.getApiInstance().serverReady();
						currentState.lombokEnabled = isLombokSupportEnabled();
						currentState.activeLombokPath = Lombok.getActiveLombokPath();
						currentState.workspacePath = getWorkspacePath();
						const message: UpdateMessage = {
							type: "update",
							lombokEnabled: isLombokSupportEnabled(),
							activeLombokPath: Lombok.getActiveLombokPath(),
							workspacePath: getWorkspacePath(),
						};
						await this.postMessage(message);
						this.getJvms().then(jvms => {
							currentState.jvms = jvms;
							const msg: UpdateMessage = {
								type: "update",
								jvms: jvms
							};

							this.postMessage(msg);
						});

						this.refreshLSInfo();
						break;
					}
				}
			}
		);
	}

	public dispose(): void {
		this.webView = undefined;
		for (const disposable of this.disposables) {
			disposable.dispose();
		}
	}

	private async getJvms(): Promise<JVM[]> {
		const config = await getComputedJavaConfig();
		const jres: JVM[] = config.configuration.runtimes.map(jre => ({
			name: jre.name,
			version: jre.version,
			path: jre.path,
		}));
		return jres;

	}

	private getWebviewContent(): string {
		const scriptUri = getUri(this.webView, this.context.extensionUri, [
			"dist",
			"dashboard.js",
		]);

		const nonce = getNonce();
		const codiconsUri = this.webView.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'node_modules', '@vscode/codicons', 'dist', 'codicon.css'));

		return /* html*/ `
	  <!DOCTYPE html>
	  <html lang="en">
		<head>
		  <meta charset="utf-8">
		  <meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
		  <meta name="theme-color" content="#000000">
		  <link href="${codiconsUri}" rel="stylesheet" />
		  <title>Dashboard</title>
		</head>
		<body>
		  <div id="root"></div>
		  <script nonce="${nonce}" src="${scriptUri}"></script>
		</body>
	  </html>
	`;
	}

	private async refreshLSInfo(): Promise<void> {
		if (!this.webView) {
			return;
		}
		try {
			vscode.commands.executeCommand<DiagnosticInfo>(Commands.EXECUTE_WORKSPACE_COMMAND, Commands.GET_TROUBLESHOOTING_INFO).then(info => {
				currentState.diagnosticInfo = info;
				const msg: UpdateMessage = {
					type: "update",
					diagnosticInfo: info
				};
				this.postMessage(msg);
			});
		} catch (e) {
			console.error('Failed to get diagnostic info', e);
		}
	}
}

export namespace Dashboard {
	export function initialize(context: vscode.ExtensionContext): void {
		console.log('registering dashboard webview provider');
		let dashboardPanel: DashboardPanel;
		let webviewPanel: vscode.WebviewPanel;

		context.subscriptions.push(vscode.commands.registerCommand(Commands.OPEN_JAVA_DASHBOARD, async () => {
			if (!dashboardPanel) {
				webviewPanel = vscode.window.createWebviewPanel('java.dashboard', 'Java Dashboard', vscode.ViewColumn.Active, {
					enableScripts: true,
					enableCommandUris: true,
					retainContextWhenHidden: true,
					localResourceRoots: [context.extensionUri]
				});
				dashboardPanel = new DashboardPanel(webviewPanel.webview, context);

				webviewPanel.onDidDispose(() => {
					dashboardPanel.dispose();
					dashboardPanel = undefined;
					webviewPanel = undefined;
					vscode.commands.executeCommand('setContext', 'java:dashboard', false);
				}, undefined, context.subscriptions);
			} else {
				webviewPanel.reveal();
			}
		}));
		console.log('registered dashboard webview provider');
	}
}
