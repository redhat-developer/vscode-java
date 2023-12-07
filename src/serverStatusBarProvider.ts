'use strict';

import { StatusBarItem, window, StatusBarAlignment } from "vscode";
import { Commands } from "./commands";
import { Disposable } from "vscode-languageclient";
import { StatusCommands } from "./languageStatusItemFactory";

class ServerStatusBarProvider implements Disposable {
	private statusBarItem: StatusBarItem;

	constructor() {
		this.statusBarItem = window.createStatusBarItem("java.serverStatus", StatusBarAlignment.Right, Number.MIN_VALUE);
	}

	public showLightWeightStatus(): void {
		this.statusBarItem.name = "Java Server Mode";
		this.statusBarItem.text = StatusIcon.lightWeight;
		this.statusBarItem.command = StatusCommands.switchToStandardCommand;
		this.statusBarItem.tooltip = "Java language server is running in LightWeight mode, click to switch to Standard mode";
		this.statusBarItem.show();
	}

	public showNotImportedStatus(): void {
		this.statusBarItem.name = "No projects are imported";
		this.statusBarItem.text = StatusIcon.notImported;
		this.statusBarItem.command = StatusCommands.startStandardServerCommand;
		this.statusBarItem.tooltip = "No projects are imported, click to load projects";
		this.statusBarItem.show();
	}

	public showStandardStatus(): void {
		this.statusBarItem.name = "Java Server Status";
		this.statusBarItem.text = StatusIcon.busy;
		this.statusBarItem.command = Commands.SHOW_SERVER_TASK_STATUS;
		this.statusBarItem.tooltip = "";
		this.statusBarItem.show();
	}

	public setBusy(): void {
		this.statusBarItem.text = StatusIcon.busy;
	}

	public setError(): void {
		this.statusBarItem.text = StatusIcon.error;
		this.statusBarItem.command = Commands.OPEN_LOGS;
	}

	public setWarning(): void {
		this.statusBarItem.text = StatusIcon.warning;
		this.statusBarItem.command = "workbench.panel.markers.view.focus";
		this.statusBarItem.tooltip = "Errors occurred in project configurations, click to show the PROBLEMS panel";
	}

	public setReady(): void {
		this.statusBarItem.text = StatusIcon.ready;
		this.statusBarItem.command = Commands.SHOW_SERVER_TASK_STATUS;
		this.statusBarItem.tooltip = "ServiceReady";
	}

	public updateTooltip(tooltip: string): void {
		this.statusBarItem.tooltip = tooltip;
	}

	public dispose(): void {
		this.statusBarItem?.dispose();
	}
}

export enum StatusIcon {
	lightWeight = "$(rocket)",
	busy = "$(sync~spin)",
	ready = "$(thumbsup)",
	warning = "$(thumbsdown)",
	error = "$(thumbsdown)",
	notImported = "$(info)"
}

export const serverStatusBarProvider: ServerStatusBarProvider = new ServerStatusBarProvider();
