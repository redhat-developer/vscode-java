'use strict';

import * as fse from "fs-extra";
import * as path from "path";
import * as vscode from "vscode";
import { ExtensionContext, window, commands, Uri, Position, Location, Selection, env } from "vscode";
import { Commands } from "./commands";
import { apiManager } from "./apiManager";
import { supportsLanguageStatus } from "./languageStatusItemFactory";
import htmlparser2 = require("htmlparser2");
import { CodeLensResolveRequest } from "vscode-languageclient";

export const JAVA_LOMBOK_PATH = "java.lombokPath";

const languageServerDocumentSelector = [
	{ scheme: 'file', language: 'java' },
	{ scheme: 'jdt', language: 'java' },
	{ scheme: 'untitled', language: 'java' },
	{ pattern: '**/pom.xml' },
	{ pattern: '**/{build,settings}.gradle'},
	{ pattern: '**/{build,settings}.gradle.kts'}
];

let activeLombokPath: string = undefined;
let isLombokCommandInitialized: boolean = false;

export function isLombokSupportEnabled(): boolean {
	return vscode.workspace.getConfiguration().get("java.jdt.ls.lombokSupport.enabled");
}

export function isLombokImported(context: ExtensionContext): boolean {
	return context.workspaceState.get(JAVA_LOMBOK_PATH)!==undefined;
}

export function updateActiveLombokPath(path: string) {
	activeLombokPath = path;
}

export function isLombokActive(context: ExtensionContext): boolean {
	return activeLombokPath!==undefined;
}

export function cleanupLombokCache(context: ExtensionContext): boolean {
	const result = isLombokImported(context);
	context.workspaceState.update(JAVA_LOMBOK_PATH, undefined);
	return result;
}

export function getLombokVersion(context: ExtensionContext): string {
	const reg = /lombok-.*\.jar/;
	const lombokVersion = reg.exec(activeLombokPath)[0].split('.jar')[0];
	return lombokVersion;
}

export function addLombokParam(context: ExtensionContext, params: string[]) {
	if (isLombokImported(context)) {
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
		const lombokAgentParam = '-javaagent:' + context.workspaceState.get(JAVA_LOMBOK_PATH);
		params.push(lombokAgentParam);
		updateActiveLombokPath(context.workspaceState.get(JAVA_LOMBOK_PATH));
	}
}

export async function checkLombokDependency(context: ExtensionContext) {
	if (!isLombokSupportEnabled()) {
		return;
	}
	const reg = /lombok-.*\.jar/;
	let needReload = false;
	let versionChange = false;
	let currentLombokVersion = "";
	let previousLombokVersion = "";
	let currentLombokClasspath = "";
	const projectUris: string[] = await commands.executeCommand<string[]>(Commands.EXECUTE_WORKSPACE_COMMAND, Commands.GET_ALL_JAVA_PROJECTS);
	for (const projectUri of projectUris) {
		const classpathResult = await apiManager.getApiInstance().getClasspaths(projectUri, {scope: 'runtime'});
		for (const classpath of classpathResult.classpaths) {
			if (reg.test(classpath)) {
				currentLombokClasspath = classpath;
				if (isLombokImported(context)) {
					currentLombokVersion = reg.exec(classpath)[0];
					previousLombokVersion = reg.exec(context.workspaceState.get(JAVA_LOMBOK_PATH))[0];
					if (currentLombokVersion!==previousLombokVersion) {
						needReload = true;
						versionChange = true;
						context.workspaceState.update(JAVA_LOMBOK_PATH, classpath);
					}
				}
				else {
					needReload = true;
					context.workspaceState.update(JAVA_LOMBOK_PATH, currentLombokClasspath);
				}
				break;
			}
		}
		if (needReload) {
			break;
		}
	}
	if (needReload) {
		if (versionChange) {
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
		else {
			const msg = `Lombok is detected in your project, please reload the window to enable lombok support.`;
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

async function getParentBuildFilePath(buildFilePath: string, relativePath: string) {
	const parentBuildFilePath = path.join(path.dirname(buildFilePath), relativePath, path.basename(buildFilePath));
	if (await fse.pathExists(parentBuildFilePath)) {
		return parentBuildFilePath;
	}
	return undefined;
}

export function registerLombokConfigureCommand(context: ExtensionContext) {
	if (isLombokCommandInitialized) {
		return;
	}
	context.subscriptions.push(commands.registerCommand(Commands.LOMBOK_CONFIGURE, async (buildFilePath: string) => {
		if (isMavenProject(buildFilePath)) {
			let pos = 0;
			while (true) {
				const document = await vscode.workspace.openTextDocument(Uri.file(buildFilePath));
				const fullText = document.getText();
				let tagList: [string, number][] = [];
				let hasParent: boolean = false;
				let getRelativePath: boolean = false;
				let relativePath: string = '..';
				const parser = new htmlparser2.Parser({
					onopentag(name, attributes) {
						if (name==="dependency"||tagList.length>0) {
							tagList.push([name, parser.startIndex]);
						}
						if (name==="parent") {
							hasParent = true;
						}
						if (hasParent&&name==="relativePath") {
							getRelativePath = true;
						}
					},
					ontext(text) {
						if (tagList.length) {
							tagList.push([text, parser.startIndex]);
						}
						if (getRelativePath) {
							relativePath = text;
						}
					},
					onclosetag(name) {
						if (name==="dependency") {
							tagList.push([name, parser.startIndex]);
							let lombokIndex = -1;
							let versionIndex = -1;
							for (let i = 0; i<tagList.length-1; i++) {
								if (tagList[i][0]==="artifactid"&&tagList[i+1][0]==="lombok") {
									lombokIndex = tagList[i+1][1];
								}
								if (tagList[i][0]==="version") {
									versionIndex = tagList[i+1][1];
								}
							}
							if (lombokIndex>=0) {
								pos = lombokIndex;
								if (versionIndex>=0) {
									pos = versionIndex;
									parser.end();
								}
							}
							tagList = [];
						}
						if (getRelativePath&&name==="relativePath") {
							getRelativePath = false;
						}
					},
				});
				parser.write(fullText);
				parser.end();
				if (pos>0) {
					break;
				}
				if (hasParent) {
					buildFilePath = await getParentBuildFilePath(buildFilePath, relativePath);
					if (buildFilePath===undefined) {
						break;
					}
				}
				else {
					break;
				}
			}
			if (buildFilePath) {
				await commands.executeCommand(Commands.OPEN_BROWSER, Uri.file(buildFilePath));
				if (pos>0) {
					gotoLombokLocation(pos, buildFilePath);
				}
			}
		}
		else if (isGradleProject(buildFilePath)) {
			while (true) {
				const document = await vscode.workspace.openTextDocument(Uri.file(buildFilePath));
				const fullText = document.getText();
				const deleteCommentReg = /\/\/.*|(\/\*[\s\S]*?\*\/)/g;
				const content = fullText.replace(deleteCommentReg, (match) => {
					let newString = '';
					for (const letter of match) {
						newString += '@';
					}
					return newString;
				});
				const lombokReg = /org.projectlombok/;
				const result = lombokReg.exec(content);
				if (result) {
					const pos = result.index;
					await commands.executeCommand(Commands.OPEN_BROWSER, Uri.file(buildFilePath));
					gotoLombokLocation(pos, buildFilePath);
					break;
				}
				else {
					const currentBuildFilePath = buildFilePath;
					buildFilePath = await getParentBuildFilePath(buildFilePath, "..");
					if (buildFilePath===undefined) {
						await commands.executeCommand(Commands.OPEN_BROWSER, Uri.file(currentBuildFilePath));
						break;
					}
				}
			}
		}
	}));
	isLombokCommandInitialized = true;
}

export namespace LombokVersionItemFactory {
	export function create(text: string, buildFilePath: string): any {
		if (supportsLanguageStatus()) {
			const item = vscode.languages.createLanguageStatusItem("javaLombokVersionItem", languageServerDocumentSelector);
			item.severity = vscode.LanguageStatusSeverity?.Information;
			item.name = "Lombok Version";
			item.text = text;
			if (buildFilePath) {
				item.command = getLombokChangeCommand(buildFilePath);
			}
			return item;
		}
		return undefined;
	}

	export function update(item: any, text: string, buildFilePath: string): void {
		item.text = text;
		if (buildFilePath) {
			item.command = getLombokChangeCommand(buildFilePath);
		}
	}

	function getLombokChangeCommand(buildFilePath: string): vscode.Command {
		const relativePath = vscode.workspace.asRelativePath(buildFilePath);
		return {
			title: `Configure Lombok Version`,
			command: Commands.LOMBOK_CONFIGURE,
			arguments: [buildFilePath],
			tooltip: `Open ${relativePath}`
		};
	}
}

function gotoLombokLocation(position: number, buildFilePath: string): void {
	const newPosition = window.activeTextEditor.document.positionAt(position);
	const newSelection = new Selection(newPosition, newPosition);
	window.activeTextEditor.selection = newSelection;
	const newLocation = new Location(Uri.file(buildFilePath), newPosition);
	commands.executeCommand(
		Commands.GOTO_LOCATION,
		window.activeTextEditor.document.uri,
		window.activeTextEditor.selection.active,
		[newLocation],
		'goto'
	);
}

function isMavenProject(buildFilePath: string): boolean {
	const buildFileNames = ["pom.xml"];
	for (const buildFileName of buildFileNames) {
		if (buildFilePath.indexOf(buildFileName)>=0) {
			return true;
		}
	}
	return false;
}

function isGradleProject(buildFilePath: string): boolean {
	const buildFileNames = ["build.gradle", "build.gradle.kts", "settings.gradle", "settings.gradle.kts"];
	for (const buildFileName of buildFileNames) {
		if (buildFilePath.indexOf(buildFileName)>=0) {
			return true;
		}
	}
	return false;
}
