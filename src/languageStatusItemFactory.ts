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
		arguments: ["Standard"],
		tooltip: "LightWeight mode only provides limited features, please load projects to get full feature set"
	};

	export const showServerStatusCommand = {
		title: "Show Build Status",
		command: Commands.SHOW_SERVER_TASK_STATUS,
		tooltip: "Show build status"
	};

	export const configureJavaRuntimeCommand = {
		title: "Configure Java Runtime",
		command: "workbench.action.openSettings",
		arguments: ["java.configuration.runtimes"],
		tooltip: "Configure Java Runtime"
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
		item.text = StatusIcon.LightWeight;
		item.detail = "Lightweight Mode";
		item.command = StatusCommands.switchToStandardCommand;
	}

	export function showStandardStatus(item: any): void {
		item.severity = vscode.LanguageStatusSeverity?.Information;
		item.command = StatusCommands.showServerStatusCommand;
	}

	export function setBusy(item: any): void {
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
		item.text = StatusIcon.Error;
		item.detail = "Errors occurred in initializing language server";
	}

	export function setWarning(item: any): void {
		item.busy = false;
		item.severity = vscode.LanguageStatusSeverity?.Error;
		item.command = {
			title: "Show PROBLEMS panel",
			command: "workbench.panel.markers.view.focus",
			tooltip: "Errors occurred in project configurations, click to show the PROBLEMS panel"
		};
		item.text = StatusIcon.Warning;
		item.detail = "Project configuration error";
	}

	export function setReady(item: any): void {
		item.busy = false;
		item.severity = vscode.LanguageStatusSeverity?.Information;
		item.command = StatusCommands.showServerStatusCommand;
		item.text = StatusIcon.Ready;
		item.detail = "";
	}
}

export namespace CleanServerStatusItemFactory {
	export function create(): any {
		if (supportsLanguageStatus()) {
			const item = vscode.languages.createLanguageStatusItem("javaServerCleanItem", languageServerDocumentSelector);
			item.name = "Clean Java language server workspace";
			item.command = {
				title: "Clean workspace",
				command: Commands.CLEAN_WORKSPACE,
				tooltip: "Click to clean Java language server workspace"
			};
			item.severity = vscode.LanguageStatusSeverity?.Error;
			item.text = "Project out of sync";
			return item;
		}
		return undefined;
	}
}

export namespace RuntimeStatusItemFactory {
	export function create(text: string): any {
		if (supportsLanguageStatus()) {
			const item = vscode.languages.createLanguageStatusItem("javaRuntimeStatusItem", languageServerDocumentSelector);
			item.severity = vscode.LanguageStatusSeverity?.Information;
			item.name = "Java Runtime";
			item.text = text;
			item.command = StatusCommands.configureJavaRuntimeCommand;
			return item;
		}
		return undefined;
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
			item.command = {
				title: `Open config file`,
				command: Commands.OPEN_BROWSER,
				arguments: [vscode.Uri.file(buildFilePath)],
				tooltip: `Open config file`
			};
			return item;
		}
		return undefined;
	}
}
