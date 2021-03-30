'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import { Commands } from './commands';

let existingExtensions: Array<string>;
let existingBuildFilePatterns: Array<string>;

export function collectJavaExtensions(extensions: readonly vscode.Extension<any>[]): string[] {
	const result = [];
	if (extensions && extensions.length) {
		for (const extension of extensions) {
			const contributesSection = extension.packageJSON['contributes'];
			if (contributesSection) {
				const javaExtensions = contributesSection['javaExtensions'];
				if (Array.isArray(javaExtensions) && javaExtensions.length) {
					for (const javaExtensionPath of javaExtensions) {
						result.push(path.resolve(extension.extensionPath, javaExtensionPath));
					}
				}
			}
		}
	}
	// Make a copy of extensions:
	existingExtensions = result.slice();
	return result;
}

export function collectBuildFilePattern(extensions: readonly vscode.Extension<any>[]) {
	const result = [];
	if (extensions && extensions.length) {
		for (const extension of extensions) {
			const contributesSection = extension.packageJSON['contributes'];
			if (contributesSection) {
				const buildFilePatterns = contributesSection['javaBuildFilePatterns'];
				if (Array.isArray(buildFilePatterns) && buildFilePatterns.length) {
					result.push(...buildFilePatterns);
				}
			}
		}
	}
	// Make a copy of build file patterns:
	existingBuildFilePatterns = result.slice();
	return result;
}

export function onExtensionChange(extensions: readonly vscode.Extension<any>[]) {
	updateExistingExtensions(extensions);
	updateExistinguildFilePatterns(extensions);

}

function updateExistingExtensions(extensions: readonly vscode.Extension<any>[]) {
	if (!existingExtensions) {
		return;
	}
	const oldExtensions = new Set(existingExtensions.slice());
	const newExtensions = collectJavaExtensions(extensions);
	let hasChanged = ( oldExtensions.size !== newExtensions.length);
	if (!hasChanged) {
		for (const newExtension of newExtensions) {
			if (!oldExtensions.has(newExtension)) {
				hasChanged = true;
				break;
			}
		}
	}

	if (hasChanged) {
		const msg = `Extensions to the Java Language Server changed, reloading ${vscode.env.appName} is required for the changes to take effect.`;
		const action = 'Reload';
		const restartId = Commands.RELOAD_WINDOW;
		vscode.window.showWarningMessage(msg, action).then((selection) => {
			if (action === selection) {
				vscode.commands.executeCommand(restartId);
			}
		});
	}

}

function updateExistinguildFilePatterns(extensions: readonly vscode.Extension<any>[]) {
	if (!existingBuildFilePatterns) {
		return;
	}
	const oldPatterns = new Set(existingBuildFilePatterns.slice());
	const newPatterns = collectBuildFilePattern(extensions);
	let hasChanged = ( oldPatterns.size !== newPatterns.length);
	if (!hasChanged) {
		for (const newPattern of newPatterns) {
			if (!oldPatterns.has(newPattern)) {
				hasChanged = true;
				break;
			}
		}
	}

	if (hasChanged) {
		const msg = `Java build file patterns changed, reloading ${vscode.env.appName} is required for the changes to take effect.`;
		const action = 'Reload';
		const restartId = Commands.RELOAD_WINDOW;
		vscode.window.showWarningMessage(msg, action).then((selection) => {
			if (action === selection) {
				vscode.commands.executeCommand(restartId);
			}
		});
	}

}
