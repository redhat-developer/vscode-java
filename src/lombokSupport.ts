'use strict';

import * as fse from "fs-extra";
import * as path from "path";
import * as vscode from "vscode";
import { ExtensionContext, window, commands, Uri, Position, Location, Selection, env, Extension } from "vscode";
import { Commands } from "./commands";
import { apiManager } from "./apiManager";
import { supportsLanguageStatus } from "./languageStatusItemFactory";
import { runtimeStatusBarProvider } from './runtimeStatusBarProvider';
import htmlparser2 = require("htmlparser2");

export const JAVA_LOMBOK_PATH = "java.lombokPath";

const languageServerDocumentSelector = [
	{ scheme: 'file', language: 'java' },
	{ scheme: 'jdt', language: 'java' },
	{ scheme: 'untitled', language: 'java' },
	{ pattern: '**/pom.xml' },
	{ pattern: '**/{build,settings}.gradle'},
	{ pattern: '**/{build,settings}.gradle.kts'}
];

const lombokJarRegex = /lombok-\d+.*\.jar/;

let activeLombokPath: string = undefined;
let isLombokCommandInitialized: boolean = false;
let isExtensionLombok: boolean = false;		// whether use extension's lombok or not
let projectLombokPath: string = undefined;	// the project's lombok classpath

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

function getExtensionInstance(): Extension<any> {
	const extensionId = `redhat.java`;
	const instance = vscode.extensions.getExtension(extensionId);
	if (!instance) {
		throw new Error("Could not get extension instance with id " + extensionId);
	}
	return instance;
}

function getExtensionLombokPath(): string {
	const files = fse.readdirSync(path.join(getExtensionInstance().extensionPath, "lombok"));
	return path.join(getExtensionInstance().extensionPath, "lombok", files[0]);
}

function lombokPath2Version(lombokPath: string): string {
	const lombokVersion = lombokJarRegex.exec(lombokPath)[0].split('.jar')[0];
	return lombokVersion;
}

export function getLombokVersion(): string {
	return lombokPath2Version(activeLombokPath);
}

export function addLombokParam(context: ExtensionContext, params: string[]) {
	// Exclude user setting lombok agent parameter
	const reg = /-javaagent:.*[\\|/]lombok.*\.jar/;
	const deleteIndex = [];
	for (let i = 0; i<params.length; i++) {
		if (reg.test(params[i])) {
			deleteIndex.push(i);
		}
	}
	for (let i = deleteIndex.length - 1; i>=0; i--) {
		params.splice(deleteIndex[i], 1);
	}
	// add -javaagent arg to support lombok
	let lombokJarPath: string;
	if (context.workspaceState.get(JAVA_LOMBOK_PATH)) {
		isExtensionLombok = false;
		lombokJarPath = context.workspaceState.get(JAVA_LOMBOK_PATH);
	}
	else {
		isExtensionLombok = true;
		lombokJarPath = getExtensionLombokPath();
	}
	const lombokAgentParam = '-javaagent:' + lombokJarPath;
	params.push(lombokAgentParam);
	updateActiveLombokPath(lombokJarPath);
}

export async function checkLombokDependency(context: ExtensionContext) {
	if (!isLombokSupportEnabled()) {
		return;
	}
	let needReload: boolean = false;
	let versionChange: boolean = false;
	let currentLombokVersion: string = undefined;
	let previousLombokVersion: string = undefined;
	let currentLombokClasspath: string = undefined;
	const projectUris: string[] = await commands.executeCommand<string[]>(Commands.EXECUTE_WORKSPACE_COMMAND, Commands.GET_ALL_JAVA_PROJECTS);
	for (const projectUri of projectUris) {
		const classpathResult = await apiManager.getApiInstance().getClasspaths(projectUri, {scope: 'runtime'});
		for (const classpath of classpathResult.classpaths) {
			if (lombokJarRegex.test(classpath)) {
				currentLombokClasspath = classpath;
				if (context.workspaceState.get(JAVA_LOMBOK_PATH)) {
					currentLombokVersion = lombokJarRegex.exec(classpath)[0];
					previousLombokVersion = lombokJarRegex.exec(context.workspaceState.get(JAVA_LOMBOK_PATH))[0];
					if (currentLombokVersion!==previousLombokVersion) {
						needReload = true;
						versionChange = true;
					}
				}
				else {
					needReload = true;
				}
				break;
			}
		}
		if (needReload) {
			break;
		}
	}
	projectLombokPath = currentLombokClasspath;
	/* if projectLombokPath is undefined, it means that this project has not imported lombok.
	 * We don't need initalize lombok status bar in this case.
	*/
	if (!isLombokCommandInitialized&&projectLombokPath) {
		runtimeStatusBarProvider.initializeLombokStatusBar(context);
		isLombokCommandInitialized = true;
	}
	if (needReload&&!isExtensionLombok) {
		if (versionChange) {
			context.workspaceState.update(JAVA_LOMBOK_PATH, currentLombokClasspath);
			const msg = `Lombok version changed from ${previousLombokVersion.split('.jar')[0].split('-')[1]} to ${currentLombokVersion.split('.jar')[0].split('-')[1]} \
							. Do you want to reload the window to load the new lombok version?`;
			const action = 'Reload Now';
			const restartId = Commands.RELOAD_WINDOW;
			window.showInformationMessage(msg, action).then((selection) => {
				if (action === selection) {
					commands.executeCommand(restartId);
				}
			});
		}
	}
}

export function registerLombokConfigureCommand(context: ExtensionContext) {
	context.subscriptions.push(commands.registerCommand(Commands.LOMBOK_CONFIGURE, async (buildFilePath: string) => {
		const extensionLombokPath: string = getExtensionLombokPath();
		/* Usually, the users change the project's lombok version before they change the lombok classpath.
		   It is necessary to search the project's lombok classpath each time*/
		await window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: "Searching the project's lombok classpath...",
			cancellable: false,
		}, async() => {
			await checkLombokDependency(context);
		});
		const lombokPathItems = [
			{
				label: 'Use Extension\'s Version',
				description: lombokPath2Version(extensionLombokPath),
				detail: extensionLombokPath
			},
			{
				label: 'Use Project\'s Version',
				description: lombokPath2Version(projectLombokPath),
				detail: projectLombokPath
			}
		];
		const selectLombokPathItem = await window.showQuickPick(lombokPathItems, {
			placeHolder: 'Select Lombok Version'
		});
		let shouldReload: boolean = false;
		if (!selectLombokPathItem) {
			return;
		}
		if (selectLombokPathItem.label==='Use Extension\'s Version') {
			if (!isExtensionLombok) {
				shouldReload = true;
				cleanupLombokCache(context);
			}
		}
		else {
			if (isExtensionLombok) {
				shouldReload = true;
				isExtensionLombok = false;
				context.workspaceState.update(JAVA_LOMBOK_PATH, projectLombokPath);
			}
		}
		if (shouldReload) {
			const msg = `Lombok classpath has changed, please reload the window.`;
			const action = 'Reload Now';
			const restartId = Commands.RELOAD_WINDOW;
			window.showInformationMessage(msg, action).then((selection) => {
				if (action === selection) {
						commands.executeCommand(restartId);
				}
			});
		}
		else {
			const msg = `Current lombok version is ${isExtensionLombok?'extension\'s' : 'project\'s'} version. Nothing to do.`;
			window.showInformationMessage(msg);
		}
	}));
}

export namespace LombokVersionItemFactory {
	export function create(text: string): any {
		if (supportsLanguageStatus()) {
			const item = vscode.languages.createLanguageStatusItem("javaLombokVersionItem", languageServerDocumentSelector);
			item.severity = vscode.LanguageStatusSeverity?.Information;
			item.name = "Lombok Version";
			item.text = text;
			item.command = getLombokChangeCommand();
			return item;
		}
		return undefined;
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