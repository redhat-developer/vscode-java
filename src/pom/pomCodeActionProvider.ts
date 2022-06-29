'use strict';

import { CodeActionProvider, CodeAction, TextDocument, Range, Selection, CodeActionContext, CancellationToken, ProviderResult, Command, CodeActionKind, Diagnostic, WorkspaceEdit, EndOfLine, ExtensionContext, commands, CodeActionProviderMetadata, workspace, Uri, window, TextEditor } from "vscode";
import { Commands } from "../commands";

export class PomCodeActionProvider implements CodeActionProvider<CodeAction> {
	constructor(context: ExtensionContext) {
		context.subscriptions.push(commands.registerCommand("_java.projectConfiguration.saveAndUpdate", async (uri: Uri) => {
			const document: TextDocument = await workspace.openTextDocument(uri);
			await document.save();
			commands.executeCommand(Commands.CONFIGURATION_UPDATE, uri);
		}));
	}

	provideCodeActions(document: TextDocument, range: Range | Selection, context: CodeActionContext, token: CancellationToken): ProviderResult<(Command | CodeAction)[]> {
		if (context?.diagnostics?.length && context.diagnostics[0].source === "Java") {
			return this.collectCodeActionsForNotCoveredExecutions(document, context.diagnostics);
		}

		return undefined;
	}

	private collectCodeActionsForNotCoveredExecutions(document: TextDocument, diagnostics: readonly Diagnostic[]): CodeAction[] {
		const codeActions: CodeAction[] = [];
		for (const diagnostic of diagnostics) {
			if (diagnostic.message?.startsWith("Plugin execution not covered by lifecycle configuration")) {
				const indentation = this.getNewTextIndentation(document, diagnostic);
				const saveAndUpdateConfigCommand: Command = {
					title: "Save and reload project",
					command: "_java.projectConfiguration.saveAndUpdate",
					arguments: [document.uri],
				};

				const action1 = new CodeAction("Enable this execution in project configuration phase", CodeActionKind.QuickFix.append("pom"));
				action1.edit = new WorkspaceEdit();
				action1.edit.insert(document.uri, diagnostic.range.end, indentation + "<?m2e execute onConfiguration?>");
				action1.command = saveAndUpdateConfigCommand;
				codeActions.push(action1);

				const action2 = new CodeAction("Enable this execution in project build phase", CodeActionKind.QuickFix.append("pom"));
				action2.edit = new WorkspaceEdit();
				action2.edit.insert(document.uri, diagnostic.range.end, indentation + "<?m2e execute onConfiguration,onIncremental?>");
				action2.command = saveAndUpdateConfigCommand;
				codeActions.push(action2);

				const action3 = new CodeAction("Mark this execution as ignored in pom.xml", CodeActionKind.QuickFix.append("pom"));
				action3.edit = new WorkspaceEdit();
				action3.edit.insert(document.uri, diagnostic.range.end, indentation + "<?m2e ignore?>");
				action3.command = saveAndUpdateConfigCommand;
				codeActions.push(action3);
			}
		}

		return codeActions;
	}

	private getNewTextIndentation(document: TextDocument, diagnostic: Diagnostic): string {
		const textline = document.lineAt(diagnostic.range.end.line);
		if (textline.text.lastIndexOf("</execution>") > diagnostic.range.end.character) {
			return "";
		}

		let tabSize: number = 2; // default value
		let insertSpaces: boolean = true; // default value
		const activeEditor: TextEditor | undefined = window.activeTextEditor;
		if (activeEditor && activeEditor.document.uri.toString() === document.uri.toString()) {
			tabSize = Number(activeEditor.options.tabSize);
			insertSpaces = Boolean(activeEditor.options.insertSpaces);
		}

		const lineSeparator = document.eol === EndOfLine.LF ? "\r" : "\r\n";
		let newIndentation = lineSeparator + textline.text.substring(0, textline.firstNonWhitespaceCharacterIndex);
		if (insertSpaces) {
			for (let i = 0; i < tabSize; i++) {
				newIndentation += ' '; // insert a space char.
			}
		} else {
			newIndentation += '	'; // insert a tab char.
		}

		return newIndentation;
	}
}

export const pomCodeActionMetadata: CodeActionProviderMetadata = {
	providedCodeActionKinds: [
		CodeActionKind.QuickFix.append("pom")
	],
	documentation: [
		{
			kind: CodeActionKind.QuickFix.append("pom"),
			command: {
				title: "Learn more about not covered Maven execution",
				command: Commands.NOT_COVERED_EXECUTION
			}
		}
	],
};
