import { ExtensionContext, window } from "vscode";
import { ValidateDocumentNotification } from "./protocol";
import { LanguageClient } from "vscode-languageclient/node";

export function registerDocumentValidationListener(context: ExtensionContext, languageClient: LanguageClient) {
	context.subscriptions.push(window.onDidChangeActiveTextEditor(textEditor => {
		// Refresh the diagnostics when the focus is switched to a Java file.
		if (textEditor.document.uri?.scheme === "file" && textEditor.document.languageId === "java") {
			languageClient.sendNotification(ValidateDocumentNotification.type, {
				textDocument: {
					uri: textEditor.document.uri.toString(),
				},
			});
		}
	}));
}
