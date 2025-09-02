import { prepareExecutable } from '../javaServerStarter';
import { getComputedJavaConfig, getExecutable } from '../extension';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { getNonce, getUri } from '../webviewUtils';
import { InitializeMessage, JVM, SettingChangedMessage } from '../webviewProtocol/toDashboard';
import { isLombokSupportEnabled } from '../lombokSupport';


async function getJvms(): Promise<JVM[]> {
	const config = await getComputedJavaConfig();
	const jres: JVM[] = config.configuration.runtimes.map(jre => ({
		name: jre.name,
		version: jre.version,
		path: jre.path,
	}));
	return jres;

}

export function getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {
	setWebviewMessageListener(webview);

	const scriptUri = getUri(webview, extensionUri, [
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

function setWebviewMessageListener(webview: vscode.Webview)	 {
	vscode.workspace.onDidChangeConfiguration(e => {
		if (e.affectsConfiguration('java.jdt.ls.lombokSupport.enabled')) {
			const msg: SettingChangedMessage = {
				type: "settingsChanged",
				lombokEnabled: isLombokSupportEnabled()
			}
			webview.postMessage(msg);
		}
	});

	webview.onDidReceiveMessage(
		async (message: any) => {
			const command = message.command;
			switch (command) {
				case "webviewReady":
					const message: InitializeMessage = {
						type: "initialize",
						jvms: await getJvms(),
						lombokEnabled: isLombokSupportEnabled()
					};
					await webview.postMessage(message);
					break;
			}
		}
	);
}
