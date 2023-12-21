'use strict';

import * as fse from "fs-extra";
import * as path from "path";
import * as semver from 'semver';
import * as vscode from "vscode";
import { ExtensionContext, window, commands, Uri } from "vscode";
import { Commands } from "./commands";
import { apiManager } from "./apiManager";
import { languageStatusBarProvider } from './runtimeStatusBarProvider';
import { logger } from './log';
import { getAllJavaProjects } from "./utils";

export const JAVA_LOMBOK_PATH = "java.lombokPath";

const languageServerDocumentSelector = [
	{ scheme: 'file', language: 'java' },
	{ scheme: 'jdt', language: 'java' },
	{ scheme: 'untitled', language: 'java' },
	{ pattern: '**/pom.xml' },
	{ pattern: '**/{build,settings}.gradle'},
	{ pattern: '**/{build,settings}.gradle.kts'}
];

const lombokJarRegex = /lombok-\d+.*\.jar$/;
const compatibleVersion = '1.18.4';
let activeLombokPath: string = undefined;
let isLombokStatusBarInitialized: boolean = false;
let isLombokCommandInitialized: boolean = false;
let isExtensionLombok: boolean = false;		// whether use extension's Lombok or not
let projectLombokPath: string = undefined;	// the project's Lombok classpath

export function isLombokSupportEnabled(): boolean {
	return vscode.workspace.getConfiguration().get("java.jdt.ls.lombokSupport.enabled");
}

export function isLombokImported(): boolean {
	return projectLombokPath!==undefined;
}

export function updateActiveLombokPath(path: string) {
	activeLombokPath = path;
}

export function isLombokActive(context: ExtensionContext): boolean {
	return activeLombokPath!==undefined;
}

export function cleanupLombokCache(context: ExtensionContext) {
	context.workspaceState.update(JAVA_LOMBOK_PATH, undefined);
}

function getExtensionLombokPath(context: ExtensionContext): string {
	if (!fse.pathExistsSync(context.asAbsolutePath("lombok"))) {
		return undefined;
	}
	const files = fse.readdirSync(context.asAbsolutePath("lombok"));
	if (!files.length) {
		return undefined;
	}
	return path.join(context.asAbsolutePath("lombok"), files[0]);
}

function lombokPath2Version(lombokPath: string): string {
	const lombokVersion = lombokJarRegex.exec(lombokPath)[0].split('.jar')[0];
	return lombokVersion;
}

function lombokPath2VersionNumber(lombokPath: string): string {
	const lombokVersioNumber = lombokPath2Version(lombokPath).split('-')[1];
	return lombokVersioNumber;
}

export function getLombokVersion(): string {
	return lombokPath2Version(activeLombokPath);
}

function isCompatibleLombokVersion(currentVersion: string): boolean {
	return semver.gte(currentVersion, compatibleVersion);
}

export function addLombokParam(context: ExtensionContext, params: string[]) {
	// Exclude user setting Lombok agent parameter
	const reg = /-javaagent:.*[\\|/]lombok.*\.jar/;
	const deleteIndex = [];
	for (let i = 0; i < params.length; i++) {
		if (reg.test(params[i])) {
			deleteIndex.push(i);
		}
	}
	for (let i = deleteIndex.length - 1; i >= 0; i--) {
		params.splice(deleteIndex[i], 1);
	}
	// add -javaagent arg to support Lombok.
	// use the extension's Lombok version by default.
	isExtensionLombok = true;
	let lombokJarPath: string = context.workspaceState.get(JAVA_LOMBOK_PATH);
	if (lombokJarPath && fse.existsSync(lombokJarPath)) {
		if (isCompatibleLombokVersion(lombokPath2VersionNumber(lombokJarPath))) {
			isExtensionLombok = false;
		}
		else {
			cleanupLombokCache(context);
			logger.warn(`The project's Lombok version ${lombokPath2VersionNumber(lombokJarPath)} is not supported, Falling back to the built-in Lombok version ${lombokPath2VersionNumber(getExtensionLombokPath(context))}`);
		}
	}
	if (isExtensionLombok) {
		lombokJarPath = getExtensionLombokPath(context);
	}
	// check if the Lombok.jar exists.
	if (!lombokJarPath) {
		logger.warn("Could not find lombok.jar path.");
		return;
	}
	const lombokAgentParam = `-javaagent:${lombokJarPath}`;
	params.push(lombokAgentParam);
	updateActiveLombokPath(lombokJarPath);
}

export async function checkLombokDependency(context: ExtensionContext, projectUri?: Uri) {
	if (!isLombokSupportEnabled()) {
		return;
	}
	let versionChange: boolean = false;
	let lombokFound: boolean = false;
	let currentLombokVersion: string = undefined;
	let previousLombokVersion: string = undefined;
	let currentLombokClasspath: string = undefined;
	const projectUris: string[] = projectUri ? [projectUri.toString()] : await getAllJavaProjects();
	for (const projectUri of projectUris) {
		const classpathResult = await apiManager.getApiInstance().getClasspaths(projectUri, {scope: 'test'});
		for (const classpath of classpathResult.classpaths) {
			if (lombokJarRegex.test(classpath)) {
				currentLombokClasspath = classpath;
				if (activeLombokPath && !isExtensionLombok) {
					currentLombokVersion = lombokJarRegex.exec(classpath)[0];
					previousLombokVersion = lombokJarRegex.exec(activeLombokPath)[0];
					if (currentLombokVersion !== previousLombokVersion) {
						versionChange = true;
					}
				}
				lombokFound = true;
				break;
			}
		}
		if (lombokFound) {
			break;
		}
	}
	projectLombokPath = currentLombokClasspath;
	/* if projectLombokPath is undefined, it means that this project has not imported Lombok.
	 * We don't need initalize Lombok status bar in this case.
	*/
	if (!isLombokStatusBarInitialized && projectLombokPath) {
		if (!isLombokCommandInitialized) {
			registerLombokConfigureCommand(context);
			isLombokCommandInitialized = true;
		}
		languageStatusBarProvider.initializeLombokStatusBar();
		isLombokStatusBarInitialized = true;
	}
	if (isLombokStatusBarInitialized && !projectLombokPath) {
		languageStatusBarProvider.destroyLombokStatusBar();
		isLombokStatusBarInitialized = false;
		cleanupLombokCache(context);
	}
	if (versionChange && !isExtensionLombok) {
		context.workspaceState.update(JAVA_LOMBOK_PATH, currentLombokClasspath);
		const msg = `Lombok version changed from ${previousLombokVersion.split('.jar')[0].split('-')[1]} to ${currentLombokVersion.split('.jar')[0].split('-')[1]} \
						. Do you want to reload the window to load the new Lombok version?`;
		const action = 'Reload';
		const restartId = Commands.RELOAD_WINDOW;
		window.showInformationMessage(msg, action).then((selection) => {
			if (action === selection) {
				commands.executeCommand(restartId);
			}
		});
	}
}

export function registerLombokConfigureCommand(context: ExtensionContext) {
	context.subscriptions.push(commands.registerCommand(Commands.LOMBOK_CONFIGURE, async (buildFilePath: string) => {
		const extensionLombokPath: string = getExtensionLombokPath(context);
		if (!extensionLombokPath || !projectLombokPath) {
			return;
		}
		const extensionItemLabel = 'Use Extension\'s Version';
		const extensionItemLabelCheck = `• ${extensionItemLabel}`;
		const projectItemLabel = 'Use Project\'s Version';
		const projectItemLabelCheck = `• ${projectItemLabel}`;
		const lombokPathItems = [
			{
				label: isExtensionLombok? extensionItemLabelCheck : extensionItemLabel,
				description: lombokPath2Version(extensionLombokPath)
			},
			{
				label: isExtensionLombok? projectItemLabel : projectItemLabelCheck,
				description: lombokPath2Version(projectLombokPath),
				detail: projectLombokPath
			}
		];
		const selectLombokPathItem = await window.showQuickPick(lombokPathItems, {
			placeHolder: 'Select the Lombok version used in the Java extension'
		});
		let shouldReload: boolean = false;
		if (!selectLombokPathItem) {
			return;
		}
		if (selectLombokPathItem.label === extensionItemLabel || selectLombokPathItem.label === extensionItemLabelCheck) {
			if (!isExtensionLombok) {
				shouldReload = true;
				cleanupLombokCache(context);
			}
		}
		else {
			if (isExtensionLombok) {
				const projectLombokVersion = lombokPath2VersionNumber(projectLombokPath);
				if (!isCompatibleLombokVersion(projectLombokVersion)) {
					const msg = `The project's Lombok version ${projectLombokVersion} is not supported. Falling back to the built-in Lombok version in the extension.`;
					window.showWarningMessage(msg);
					return;
				}
				else {
					shouldReload = true;
					context.workspaceState.update(JAVA_LOMBOK_PATH, projectLombokPath);
				}
			}
		}
		if (shouldReload) {
			const msg = `The Lombok version used in Java extension has changed, please reload the window.`;
			const action = 'Reload';
			const restartId = Commands.RELOAD_WINDOW;
			window.showInformationMessage(msg, action).then((selection) => {
				if (action === selection) {
					commands.executeCommand(restartId);
				}
			});
		}
		else {
			const msg = `Current Lombok version is ${isExtensionLombok?'extension\'s' : 'project\'s'} version. Nothing to do.`;
			window.showInformationMessage(msg);
		}
	}));
}

export namespace LombokVersionItemFactory {
	export function create(text: string): vscode.LanguageStatusItem {
		const item = vscode.languages.createLanguageStatusItem("javaLombokVersionItem", languageServerDocumentSelector);
		item.severity = vscode.LanguageStatusSeverity?.Information;
		item.name = "Lombok Version";
		item.text = text;
		item.command = getLombokChangeCommand();
		return item;
	}

	export function update(item: any, text: string): void {
		item.text = text;
	}

	function getLombokChangeCommand(): vscode.Command {
		return {
			title: `Configure Version`,
			command: Commands.LOMBOK_CONFIGURE,
			tooltip: `Configure Lombok Version`
		};
	}
}