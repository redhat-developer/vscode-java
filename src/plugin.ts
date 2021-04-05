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
	if (isExistingExtensionsUpdated(extensions) || isExistingBuildFilePatternsUpdated(extensions)) {
		const msg = `Java Extension Contributions changed, reloading ${vscode.env.appName} is required for the changes to take effect.`;
		const action = 'Reload';
		const restartId = Commands.RELOAD_WINDOW;
		vscode.window.showWarningMessage(msg, action).then((selection) => {
			if (action === selection) {
				vscode.commands.executeCommand(restartId);
			}
		});
	}
}

function isExistingExtensionsUpdated(extensions: readonly vscode.Extension<any>[]) {
	if (!existingExtensions) {
		return false;
	}
	const oldExtensions = new Set(existingExtensions.slice());
	const newExtensions = collectJavaExtensions(extensions);
	const hasChanged = ( oldExtensions.size !== newExtensions.length);
	if (!hasChanged) {
		for (const newExtension of newExtensions) {
			if (!oldExtensions.has(newExtension)) {
				return true;
			}
		}
	}
}

function isExistingBuildFilePatternsUpdated(extensions: readonly vscode.Extension<any>[]) {
	if (!existingBuildFilePatterns) {
		return false;
	}
	const oldPatterns = new Set(existingBuildFilePatterns.slice());
	const newPatterns = collectBuildFilePattern(extensions);
	const hasChanged = ( oldPatterns.size !== newPatterns.length);
	if (!hasChanged) {
		for (const newPattern of newPatterns) {
			if (!oldPatterns.has(newPattern)) {
				return true;
			}
		}
	}
}
