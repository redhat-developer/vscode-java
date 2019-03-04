'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import { Commands } from './commands';

let existingExtensions: Array<string>;

export function collectJavaExtensions(extensions: vscode.Extension<any>[]): string[] {
	existingExtensions = [];
	if (extensions && extensions.length) {
		for (let extension of extensions) {
			let contributesSection = extension.packageJSON['contributes'];
			if (contributesSection) {
				let javaExtensions = contributesSection['javaExtensions'];
				if (Array.isArray(javaExtensions) && javaExtensions.length) {
					for (let javaExtensionPath of javaExtensions) {
						existingExtensions.push(path.resolve(extension.extensionPath, javaExtensionPath));
					}
				}
			}
		}
	}
	return existingExtensions;
}

export function onExtensionChange(extensions: vscode.Extension<any>[]) {
	if (!existingExtensions) {
		return;
	}
	const oldExtensions = existingExtensions.slice();
	const newExtensions = collectJavaExtensions(extensions);
	for (const newExtension of newExtensions) {
		if (oldExtensions.indexOf(newExtension) < 0) {
			let msg = 'Java Language Server has new extension installed or updated, please restart VS Code to enable it.';
			let action = 'Restart Now';
			let restartId = Commands.RELOAD_WINDOW;
			vscode.window.showWarningMessage(msg, action).then((selection) => {
				if (action === selection) {
					vscode.commands.executeCommand(restartId);
				}
			});
			break;
		}
	}
}
