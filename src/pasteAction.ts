'use strict';

import { commands, env, ExtensionContext, Range, TextEditor, window } from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';

import { Commands } from './commands';

export function registerCommands(languageClient: LanguageClient, context: ExtensionContext) {
	context.subscriptions.push(commands.registerCommand(Commands.CLIPBOARD_ONPASTE, () => {
		registerOrganizeImportsOnPasteCommand();
	}));
}

export async function registerOrganizeImportsOnPasteCommand(): Promise<void> {
	const clipboardText: string = await env.clipboard.readText();
	const editor: TextEditor = window.activeTextEditor;
	const documentText: string = editor.document.getText();
	const numCursors = editor.selections.length;
	let bits: string[] = [];
	if (numCursors > 1) {
		bits = clipboardText.split(/\r?\n/);
	}
	const action = editor.edit(textInserter => {
		for (let i = 0; i < numCursors; i++) {
			const selection = editor.selections[i];
			const isCursorOnly = selection.isEmpty;
			const text = bits.length === numCursors ? bits[i] : clipboardText;
			if (isCursorOnly) {
				textInserter.insert(selection.start, text);
			}
			else {
				const start = selection.start;
				const end = selection.end;
				textInserter.replace(new Range(start, end), text);
			}
		}
	});

	action.then((wasApplied) => {
		const fileURI = editor.document.uri.toString();
		if (wasApplied && fileURI.endsWith(".java")) {
			const hasText: boolean = documentText !== null && /\S/.test(documentText);
			if (hasText) {
				// Organize imports silently to avoid surprising the user
				commands.executeCommand(Commands.ORGANIZE_IMPORTS_SILENTLY, fileURI);
			} else {
				commands.executeCommand(Commands.ORGANIZE_IMPORTS, { textDocument: { uri: fileURI } });
			}
		}
	});
}