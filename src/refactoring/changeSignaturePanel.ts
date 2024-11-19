import * as path from "path";
import { Disposable, Webview, WebviewPanel, window, Uri, ViewColumn, workspace, WorkspaceEdit } from "vscode";
import { LanguageClient } from "vscode-languageclient/node";
import { GetRefactorEditRequest, RefactorWorkspaceEdit } from "../protocol";
import { getNonce, getUri } from "../webviewUtils";

interface MethodParameter {
	type: string;
	name: string;
	defaultValue: string;
	originalIndex: number;
}

interface MethodException {
	type: string;
	typeHandleIdentifier: string;
}

export class ChangeSignaturePanel {
	public static type = "java.refactor.changeSignature";
	public static title = "Refactor: Change Method Signature";
	public static currentPanel: ChangeSignaturePanel | undefined;
	private readonly panel: WebviewPanel;
	private disposables: Disposable[] = [];

	// method metadata
	private methodIdentifier: string | undefined;
	private methodName: string | undefined;
	private modifier: string | undefined;
	private returnType: string | undefined;
	private parameters: MethodParameter[] | undefined;
	private exceptions: MethodException[] | undefined;

	// refactor metadata
	private languageClient: LanguageClient;
	private params: any;
	private formattingOptions: any;
	private command: any;

	private constructor(panel: WebviewPanel, extensionUri: Uri) {
		this.panel = panel;
		this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
		this.panel.webview.html = this.getWebviewContent(this.panel.webview, extensionUri);
		this.setWebviewMessageListener(this.panel.webview);
	}

	public static render(extensionUri: Uri, languageClient: LanguageClient, command: any, params: any, formattingOptions: any, commandInfo: any) {
		if (ChangeSignaturePanel.currentPanel) {
			if (!commandInfo?.methodIdentifier) {
				// the new method to do refactoring is not available, just reveal the current panel.
				ChangeSignaturePanel.currentPanel.panel.reveal(ViewColumn.Beside);
				return;
			}
			if (commandInfo.methodIdentifier === ChangeSignaturePanel.currentPanel.methodIdentifier) {
				// the new method to do refactoring is the same as the old one, just reveal the current panel.
				ChangeSignaturePanel.currentPanel.panel.reveal(ViewColumn.Beside);
				return;
			} else {
				window.showInformationMessage(`Change Method Signature for '${ChangeSignaturePanel.currentPanel.methodName}' is in process. Would you like to reveal or abort it?`, "Reveal", "Abort").then(async (selection) => {
					if (selection === "Reveal") {
						ChangeSignaturePanel.currentPanel.panel.reveal(ViewColumn.Beside);
					} else if (selection === "Abort") {
						ChangeSignaturePanel.currentPanel.dispose();
						ChangeSignaturePanel.render(extensionUri, languageClient, command, params, formattingOptions, commandInfo);
					}
				});
			}
		} else {
			const panel = window.createWebviewPanel(
				ChangeSignaturePanel.type,
				ChangeSignaturePanel.title,
				ViewColumn.Beside,
				{
					enableCommandUris: true,
					enableScripts: true,
					localResourceRoots: [Uri.joinPath(extensionUri, "dist")],
					retainContextWhenHidden: true,
				}
			);
			panel.iconPath = Uri.file(path.join(extensionUri.fsPath, "icons", "icon128.png"));
			ChangeSignaturePanel.currentPanel = new ChangeSignaturePanel(panel, extensionUri);
			ChangeSignaturePanel.currentPanel.setMetadata(languageClient, command, params, formattingOptions, commandInfo);
		}
	}

	public setMetadata(languageClient: LanguageClient, command: any, params: any, formattingOptions: any, commandInfo: any) {
		this.languageClient = languageClient;
		this.command = command;
		this.params = params;
		this.formattingOptions = formattingOptions;
		this.methodIdentifier = commandInfo.methodIdentifier;
		this.methodName = commandInfo.methodName as string;
		this.modifier = commandInfo.modifier as string;
		this.returnType = commandInfo.returnType as string;
		this.parameters = commandInfo.parameters as MethodParameter[];
		this.exceptions = commandInfo.exceptions as MethodException[];
	}

	public dispose() {
		ChangeSignaturePanel.currentPanel = undefined;
		this.panel.dispose();
		while (this.disposables.length) {
			const disposable = this.disposables.pop();
			if (disposable) {
				disposable.dispose();
			}
		}
	}

	private getWebviewContent(webview: Webview, extensionUri: Uri) {

		const scriptUri = getUri(webview, extensionUri, [
			"dist",
			"changeSignature.js",
		]);

		const nonce = getNonce();

		return /* html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
          <meta name="theme-color" content="#000000">
          <title>Change Signature</title>
        </head>
        <body>
          <div id="root"></div>
          <script nonce="${nonce}" src="${scriptUri}"></script>
        </body>
      </html>
    `;
	}

	private setWebviewMessageListener(webview: Webview) {
		webview.onDidReceiveMessage(
			async (message: any) => {
				const command = message.command;
				switch (command) {
					case "webviewReady":
						await this.panel.webview.postMessage({
							command: "setInitialState",
							methodIdentifier: this.methodIdentifier,
							methodName: this.methodName,
							modifier: this.modifier,
							returnType: this.returnType,
							parameters: this.parameters,
							exceptions: this.exceptions
						});
						break;
					case "doRefactor":
						if (await this.doRefactor(message.methodIdentifier, message.isDelegate, message.methodName, message.accessType, message.returnType, message.parameters, message.exceptions, message.preview)) {
							this.dispose();
						}
						break;
				}
			},
			undefined,
			this.disposables
		);
	}

	/**
	 * refactor the method with the given parameters.
	 *
	 * @param methodIdentifier the handle identifier of the method to refactor.
	 * @param isDelegate if true, the method will be refactored to a delegate method.
	 * @param methodName the new name of the method.
	 * @param accessType the new access type of the method.
	 * @param returnType the new return type of the method.
	 * @param parameters the new parameters of the method.
	 * @param exceptions the new exceptions of the method.
	 * @param preview if true, the refactoring will be previewed before applied.
	 * @returns true if the refactoring is successful, false otherwise.
	 */
	private async doRefactor(methodIdentifier: string, isDelegate: boolean, methodName: string, accessType: string, returnType: string, parameters: MethodParameter[], exceptions: MethodException[], preview: boolean): Promise<boolean> {
		const clientWorkspaceEdit: RefactorWorkspaceEdit = await this.languageClient.sendRequest(GetRefactorEditRequest.type, {
			command: this.command,
			context: this.params,
			options: this.formattingOptions,
			commandArguments: [methodIdentifier, isDelegate, methodName, accessType, returnType, parameters, exceptions, preview]
		});
		if (clientWorkspaceEdit?.edit) {
			const codeEdit: WorkspaceEdit = await this.languageClient.protocol2CodeConverter.asWorkspaceEdit(clientWorkspaceEdit.edit);
			if (codeEdit) {
				return workspace.applyEdit(codeEdit);
			}
		}
		return false;
	}
}
