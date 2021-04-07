'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import { Commands } from './commands';
import { buildFilePatterns } from './standardLanguageClient';

let existingExtensions: Array<string>;

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
	return result;
}

export function onExtensionChange(extensions: readonly vscode.Extension<any>[]) {
	if (isContributedPartUpdated(collectJavaExtensions(extensions), existingExtensions) || isContributedPartUpdated(collectBuildFilePattern(extensions), buildFilePatterns)) {
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

function isContributedPartUpdated(newContributedPart: Array<string>, oldContributedPart: Array<string>) {
	if (!oldContributedPart) {
		return false;
	}
	const oldExtensions = new Set(oldContributedPart.slice());
	const newExtensions = newContributedPart;
	const hasChanged = (oldExtensions.size !== newExtensions.length);
	if (!hasChanged) {
		for (const newExtension of newExtensions) {
			if (!oldExtensions.has(newExtension)) {
				return true;
			}
		}
	}
	return hasChanged;
}
