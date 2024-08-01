'use strict';

import { TextEncoder } from 'util';
import { commands, env, ExtensionContext, Range, TextEditor, Uri, window, workspace } from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';
import { apiManager } from './apiManager';
import { Commands } from './commands';
import fs = require('fs');

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
		if (wasApplied && editor.document.languageId === "java") {
			const fileURI = editor.document.uri.toString();
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

let serverReady = false;

export async function pasteFile(folder: fs.PathLike): Promise<void>  {
	const clipboardText: string = await env.clipboard.readText();
	let filePath = folder.toString();
	fs.stat(folder, async (err, stats) => {
		// If given path to selected folder is invalid (no folder is selected)
		if (filePath === clipboardText || stats.isFile() || (filePath === "." && workspace.workspaceFolders !== undefined)) {
			filePath = workspace.workspaceFolders[0].uri.fsPath;
		}
		if (!serverReady) {
			await apiManager.getApiInstance().serverReady().then( async () => {
				serverReady = true;
			});
		}
		const fileString: string = await commands.executeCommand(Commands.EXECUTE_WORKSPACE_COMMAND, Commands.RESOLVE_PASTED_TEXT, filePath, clipboardText);
		const fileUri = fileString !== null ? Uri.file(fileString) : null;
		if (fileUri !== null){
			try {
				await workspace.fs.writeFile(fileUri, new TextEncoder().encode(clipboardText));
				window.showTextDocument(fileUri, { preview: false });
			} catch (error: unknown) {
				// Do nothing (file does not have write permissions)
			}
		}
	});
}