'use strict';

import * as fs from 'fs';
import * as vscode from 'vscode';
import * as path from 'path';
import { Commands } from './commands';
import { extensions } from 'vscode';
import { getServerHome } from './javaServerStarter';
import { logger } from './log';

export let existingExtensions: Array<string> = [];
export let buildFilePatterns: Array<string> = [];
// collectJavaExtensions runs several times per session, so each skipped bundle is logged once.
const loggedSkippedBundles = new Set<string>();

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

/**
 * Collects the bundles that extensions contribute through `contributes.javaExtensions`.
 *
 * A contributed jar is left out when the server's `plugins` folder already has a jar with the
 * same file name. p2 names jars `<symbolicName>_<version>.jar`, so that is the same bundle at the
 * same version, and installing it again fails with "A bundle is already installed".
 */
export function collectJavaExtensions(extensions: readonly vscode.Extension<any>[], serverPluginsDir: string = path.join(getServerHome(), 'plugins')): string[] {
	const result = [];
	if (extensions && extensions.length) {
		const serverJars = listJars(serverPluginsDir);
		for (const extension of extensions) {
			const contributesSection = extension.packageJSON['contributes'];
			if (contributesSection) {
				const javaExtensions = contributesSection['javaExtensions'];
				if (Array.isArray(javaExtensions) && javaExtensions.length) {
					for (const javaExtensionPath of javaExtensions) {
						const bundlePath = path.resolve(extension.extensionPath, javaExtensionPath);
						if (serverJars.has(path.basename(bundlePath))) {
							if (!loggedSkippedBundles.has(bundlePath)) {
								loggedSkippedBundles.add(bundlePath);
								logger.info(`Skipping ${bundlePath} contributed by ${extension.id}: the server already has ${path.basename(bundlePath)}`);
							}
							continue;
						}
						result.push(bundlePath);
					}
				}
			}
		}
	}
	// Make a copy of extensions:
	existingExtensions = result.slice();
	return result;
}

function listJars(folder: string): Set<string> {
	try {
		return new Set(fs.readdirSync(folder).filter(file => file.endsWith('.jar')));
	} catch {
		// No server folder (for example, JDT LS started separately): skip nothing.
		return new Set();
	}
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
