'use strict';

import { StatusBarItem, window, StatusBarAlignment, ThemeColor, commands, QuickPickItem, QuickPickItemKind } from "vscode";
import { Disposable } from "vscode-languageclient";
import { StatusCommands } from "./languageStatusItemFactory";
import { Commands } from "./commands";
import { ServerStatusKind } from "./serverStatus";

class ServerStatusBarProvider implements Disposable {
	private statusBarItem: StatusBarItem;

	constructor() {
		this.statusBarItem = window.createStatusBarItem("java.serverStatus", StatusBarAlignment.Left);
		this.statusBarItem.show();
	}

	public showLightWeightStatus(): void {
		this.statusBarItem.name = "Java Server Mode";
		this.statusBarItem.text = `${StatusIcon.lightWeight} Java: Lightweight Mode`;
		this.statusBarItem.command = StatusCommands.switchToStandardCommand;
		this.statusBarItem.tooltip = "Java language server is running in LightWeight mode, click to switch to Standard mode";
	}

	public showNotImportedStatus(): void {
		this.statusBarItem.name = "No projects are imported";
		this.statusBarItem.text = `${StatusIcon.notImported} Java: No Projects Imported`;
		this.statusBarItem.command = StatusCommands.startStandardServerCommand;
		this.statusBarItem.tooltip = "No projects are imported, click to load projects";
	}

	public setBusy(process: string): void {
		this.statusBarItem.text = `${StatusIcon.busy} Java: ${process}`;
		this.statusBarItem.tooltip = process;
		this.statusBarItem.command = {
			title: "Show Java status menu",
			command: Commands.OPEN_STATUS_SHORTCUT,
			tooltip: "Show Java status menu",
			arguments: [ServerStatusKind.busy],
		};
	}

	public setError(): void {
		this.statusBarItem.text = `${StatusIcon.java} Java: Error`;
		this.statusBarItem.tooltip = "Show Java status menu";
		this.statusBarItem.command = {
			title: "Show Java status menu",
			command: Commands.OPEN_STATUS_SHORTCUT,
			tooltip: "Show Java status menu",
			arguments: [ServerStatusKind.error],
		};
	}

	public setWarning(): void {
		this.statusBarItem.text = `${StatusIcon.java} Java: Warning`;
		this.statusBarItem.tooltip = "Show Java status menu";
		this.statusBarItem.command = {
			title: "Show Java status menu",
			command: Commands.OPEN_STATUS_SHORTCUT,
			tooltip: "Show Java status menu",
			arguments: [ServerStatusKind.warning],
		};
	}

	public setReady(): void {
		this.statusBarItem.text = `${StatusIcon.java} Java: Ready`;
		this.statusBarItem.tooltip = "Show Java status menu";
		this.statusBarItem.command = {
			title: "Show Java status menu",
			command: Commands.OPEN_STATUS_SHORTCUT,
			tooltip: "Show Java status menu",
			arguments: ["Ready"],
		};
	}

	public dispose(): void {
		this.statusBarItem?.dispose();
	}
}

export enum StatusIcon {
	lightWeight = "$(rocket)",
	notImported = "$(info)",
	busy = "$(sync~spin)",
	java = "$(coffee)",
}

export interface ShortcutQuickPickItem extends QuickPickItem {
	command: string;
	args?: any[];
}

export const serverStatusBarProvider: ServerStatusBarProvider = new ServerStatusBarProvider();
