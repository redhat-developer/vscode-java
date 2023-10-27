'use strict';

import * as path from "path";
import * as vscode from "vscode";
import { Commands } from "./commands";
import { StatusIcon } from "./serverStatusBarProvider";

const languageServerDocumentSelector = [
	{ scheme: 'file', language: 'java' },
	{ scheme: 'jdt', language: 'java' },
	{ scheme: 'untitled', language: 'java' },
	{ pattern: '**/pom.xml' },
	{ pattern: '**/{build,settings}.gradle'},
	{ pattern: '**/{build,settings}.gradle.kts'}
];

export function supportsLanguageStatus(): boolean {
	return !!vscode.languages.createLanguageStatusItem;
}

export namespace StatusCommands {
	export const switchToStandardCommand = {
		title: "Load Projects",
		command: Commands.SWITCH_SERVER_MODE,
		arguments: ['Standard', true],
		tooltip: "LightWeight mode only provides limited features, please load projects to get full feature set"
	};

	export const showServerStatusCommand = {
		title: "Show Build Status",
		command: Commands.SHOW_SERVER_TASK_STATUS,
		tooltip: "Show Build Status"
	};

	export const configureJavaRuntimeCommand = {
		title: "Configure Java Runtime",
		command: "workbench.action.openSettings",
		arguments: ["java.configuration.runtimes"],
		tooltip: "Configure Java Runtime"
	};

	export const startStandardServerCommand = {
		title: "Load Projects",
		command: Commands.SWITCH_SERVER_MODE,
		arguments: ['Standard', true],
		tooltip: "Load Projects"
	};
}

export namespace ServerStatusItemFactory {
	export function create(): any {
		if (supportsLanguageStatus()) {
			const item = vscode.languages.createLanguageStatusItem("JavaServerStatusItem", languageServerDocumentSelector);
			item.name = "Java Language Server Status";
			return item;
		}
		return undefined;
	}

	export function showLightWeightStatus(item: any): void {
		item.severity = vscode.LanguageStatusSeverity?.Warning;
		item.text = StatusIcon.lightWeight;
		item.detail = "Lightweight Mode";
		item.command = StatusCommands.switchToStandardCommand;
	}

	export function showNotImportedStatus(item: any): void {
		item.severity = vscode.LanguageStatusSeverity?.Warning;
		item.text = StatusIcon.notImported;
		item.detail = "No projects are Imported";
		item.command = StatusCommands.startStandardServerCommand;
	}

	export function showStandardStatus(item: any): void {
		item.severity = vscode.LanguageStatusSeverity?.Information;
		item.command = StatusCommands.showServerStatusCommand;
	}

	export function setBusy(item: any): void {
		if (item.busy === true) {
			return;
		}
		item.text = "Building";
		item.busy = true;
	}

	export function setError(item: any): void {
		item.busy = false;
		item.severity = vscode.LanguageStatusSeverity?.Error;
		item.command = {
			title: "Open logs",
			command: Commands.OPEN_LOGS
		};
		item.text = StatusIcon.error;
		item.detail = "Errors occurred in initializing language server";
	}

	export function setWarning(item: any): void {
		item.busy = false;
		item.severity = vscode.LanguageStatusSeverity?.Error;
		item.command = {
			title: "Show PROBLEMS Panel",
			command: "workbench.panel.markers.view.focus",
			tooltip: "Errors occurred in project configurations, click to show the PROBLEMS panel"
		};
		item.text = StatusIcon.warning;
		item.detail = "Project Configuration Error";
	}

	export function setReady(item: any): void {
		if (item.text === StatusIcon.ready) {
			return;
		}
		item.busy = false;
		item.severity = vscode.LanguageStatusSeverity?.Information;
		item.command = StatusCommands.showServerStatusCommand;
		item.text = StatusIcon.ready;
		item.detail = "";
	}
}

export namespace RuntimeStatusItemFactory {
	export function create(text: string, vmInstallPath: string): any {
		if (supportsLanguageStatus()) {
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
		return undefined;
	}

	export function update(item: any, text: string, vmInstallPath: string): void {
		item.text = text;
		item.command.tooltip = vmInstallPath ? `Language Level: ${text} <${vmInstallPath}>` : "Configure Java Runtime";
	}
}

export namespace BuildFileStatusItemFactory {
	export function create(buildFilePath: string): any {
		if (supportsLanguageStatus()) {
			const fileName = path.basename(buildFilePath);
			const item = vscode.languages.createLanguageStatusItem("javaBuildFileStatusItem", languageServerDocumentSelector);
			item.severity = vscode.LanguageStatusSeverity?.Information;
			item.name = "Java Build File";
			item.text = fileName;
			item.command = getOpenBuildFileCommand(buildFilePath);
			return item;
		}
		return undefined;
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
