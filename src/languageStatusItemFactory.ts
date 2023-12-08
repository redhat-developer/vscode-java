'use strict';

import * as path from "path";
import * as vscode from "vscode";
import { Commands } from "./commands";

const languageServerDocumentSelector = [
	{ scheme: 'file', language: 'java' },
	{ scheme: 'jdt', language: 'java' },
	{ scheme: 'untitled', language: 'java' },
	{ pattern: '**/pom.xml' },
	{ pattern: '**/{build,settings}.gradle'},
	{ pattern: '**/{build,settings}.gradle.kts'}
];

export namespace StatusCommands {
	export const switchToStandardCommand = {
		title: "Load Projects",
		command: Commands.SWITCH_SERVER_MODE,
		arguments: ['Standard', true],
		tooltip: "LightWeight mode only provides limited features, please load projects to get full feature set"
	};

	export const configureJavaRuntimeCommand = {
		title: "Configure Java Runtime",
		command: "workbench.action.openSettings",
		arguments: ["java.configuration.runtimes"],
		tooltip: "Configure Java Runtime"
	};

	export const startStandardServerCommand = {
		title: "Select Projects...",
		command: Commands.SWITCH_SERVER_MODE,
		arguments: ['Standard', true],
		tooltip: "Select Projects..."
	};
}

export namespace RuntimeStatusItemFactory {
	export function create(text: string, vmInstallPath: string): vscode.LanguageStatusItem {
		const item = vscode.languages.createLanguageStatusItem("javaRuntimeStatusItem", languageServerDocumentSelector);
		item.severity = vscode.LanguageStatusSeverity?.Information;
		item.name = "Java Runtime";
		item.text = text;
		item.command = StatusCommands.configureJavaRuntimeCommand;
		if (vmInstallPath) {
			item.command.tooltip = `Language Level: ${text} <${vmInstallPath}>`;
		}
		return item;
	}

	export function update(item: any, text: string, vmInstallPath: string): void {
		item.text = text;
		item.command.tooltip = vmInstallPath ? `Language Level: ${text} <${vmInstallPath}>` : "Configure Java Runtime";
	}
}

export namespace BuildFileStatusItemFactory {
	export function create(buildFilePath: string): vscode.LanguageStatusItem {
		const fileName = path.basename(buildFilePath);
		const item = vscode.languages.createLanguageStatusItem("javaBuildFileStatusItem", languageServerDocumentSelector);
		item.severity = vscode.LanguageStatusSeverity?.Information;
		item.name = "Java Build File";
		item.text = fileName;
		item.command = getOpenBuildFileCommand(buildFilePath);
		return item;
	}

	export function update(item: any, buildFilePath: string): void {
		const fileName = path.basename(buildFilePath);
		item.text = fileName;
		item.command = getOpenBuildFileCommand(buildFilePath);
	}

	function getOpenBuildFileCommand(buildFilePath: string): vscode.Command {
		const relativePath = vscode.workspace.asRelativePath(buildFilePath);
		return {
			title: `Open Config File`,
			command: Commands.OPEN_BROWSER,
			arguments: [vscode.Uri.file(buildFilePath)],
			tooltip: `Open ${relativePath}`
		};
	}
}
