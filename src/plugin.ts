'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import { Commands } from './commands';
import { extensions } from 'vscode';

export let existingExtensions: Array<string> = [];
export let buildFilePatterns: Array<string> = [];

let javaShortcuts: Array<IJavaShortcut> | undefined;
export interface IJavaShortcut {
	title: string;
	command: string;
	arguments?: any[];
}
export function getShortcuts(): Array<IJavaShortcut> {
	if (javaShortcuts === undefined) {
		javaShortcuts = [];
		const selfOwnedShortcuts = getShortcutsRegistration(extensions.getExtension(EXTENSION_ID));
		if (selfOwnedShortcuts) {
			javaShortcuts.push(...selfOwnedShortcuts);
		}
		for (const extension of extensions.all) {
			if (extension.id === EXTENSION_ID) {
				continue;
			}
			const shortcuts = getShortcutsRegistration(extension);
			if (shortcuts) {
				javaShortcuts.push(...shortcuts);
			}
		}
	}
	return javaShortcuts;
}

function getShortcutsRegistration(extension: vscode.Extension<any>): Array<IJavaShortcut> | undefined {
	if (!extension) {
		return undefined;
	}
	const contributesSection = extension.packageJSON['contributes'];
	if (contributesSection) {
		const shortcuts = contributesSection['javaShortcuts'];
		if (shortcuts && Array.isArray(shortcuts) && shortcuts.length) {
			return shortcuts;
		}
	}
	return undefined;
}

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
	buildFilePatterns = result.slice();
	return result;
}

export function getBundlesToReload(): string[] {
	const previousContributions: string[] = [...existingExtensions];
	const currentContributions = collectJavaExtensions(extensions.all);
	if (isContributedPartUpdated(previousContributions, currentContributions)) {
		return currentContributions;
	}

	return [];
}

export async function onExtensionChange(extensions: readonly vscode.Extension<any>[]): Promise<void> {
	if (isContributedPartUpdated(buildFilePatterns, collectBuildFilePattern(extensions))) {
		return promptToReload();
	}

	const bundlesToRefresh: string[] = getBundlesToReload();
	if (bundlesToRefresh.length) {
		const success = await vscode.commands.executeCommand(Commands.EXECUTE_WORKSPACE_COMMAND, Commands.REFRESH_BUNDLES, bundlesToRefresh);
		if (!success) {
			// if hot refreshing bundle fails, fallback to reload window.
			return promptToReload();
		}
	}
}

function promptToReload() {
	const msg = `Java Extension Contributions changed, reloading ${vscode.env.appName} is required for the changes to take effect.`;
	const action = 'Reload';
	const restartId = Commands.RELOAD_WINDOW;
	vscode.window.showWarningMessage(msg, action).then((selection) => {
		if (action === selection) {
			vscode.commands.executeCommand(restartId);
		}
	});
}

export function isContributedPartUpdated(oldContributedPart: Array<string>, newContributedPart: Array<string>) {
	if (!oldContributedPart) {
		return false;
	}
	const oldContribution = new Set(oldContributedPart.slice());
	const newContribution = newContributedPart;
	const hasChanged = (oldContribution.size !== newContribution.length);
	if (!hasChanged) {
		for (const newExtension of newContribution) {
			if (!oldContribution.has(newExtension)) {
				return true;
			}
		}
	}
	return hasChanged;
}

export function getContributedBuildTools(): IBuildTool[] {
	const buildTypes: IBuildTool[] = [];
	for (const extension of extensions.all) {
		const javaBuildTools: IBuildTool[] = extension.packageJSON.contributes?.javaBuildTools;
		if (!Array.isArray(javaBuildTools)) {
			continue;
		}

		for (const buildType of javaBuildTools) {
			if (!isValidBuildTypeConfiguration(buildType)) {
				continue;
			}
			buildTypes.push(buildType);
		}
	}
	return buildTypes;
}

export interface IBuildTool {
	displayName: string;
	buildFileNames: string[];
}

function isValidBuildTypeConfiguration(buildType: IBuildTool): boolean {
	return !!buildType.displayName && !!buildType.buildFileNames;
}

const EXTENSION_ID = 'redhat.java';
