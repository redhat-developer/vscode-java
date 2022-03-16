'use strict';

import { StatusBarItem, window, StatusBarAlignment, version, languages } from "vscode";
import { Commands } from "./commands";
import { Disposable } from "vscode-languageclient";
import * as semver from "semver";
import { LanguageStatusItemFactory, StatusCommands, CleanServerStatusItemFactory } from "./languageStatusItemFactory";

class ServerStatusBarProvider implements Disposable {
	private statusBarItem: StatusBarItem;
	private languageStatusItem: any;
	private cleanServerStatusItem: any;
	// Adopt new API for status bar item, meanwhile keep the compatibility with Theia.
	// See: https://github.com/redhat-developer/vscode-java/issues/1982
	private isAdvancedStatusBarItem: boolean;
	// Adopt new API for language status item, meanwhile keep the compatibility with Theia.
	private languageStatusItemAPI: any;

	constructor() {
		this.languageStatusItemAPI = (languages as any).createLanguageStatusItem;
		this.isAdvancedStatusBarItem = semver.gte(version, "1.57.0");
	}

	public initialize(): void {
		if (this.languageStatusItemAPI) {
			this.languageStatusItem = LanguageStatusItemFactory.create();
		} else {
			if (this.isAdvancedStatusBarItem) {
				this.statusBarItem = (window.createStatusBarItem as any)("java.serverStatus", StatusBarAlignment.Right, Number.MIN_VALUE);
			} else {
				this.statusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, Number.MIN_VALUE);
			}
		}
	}

	public showLightWeightStatus(): void {
		if (this.languageStatusItemAPI) {
			LanguageStatusItemFactory.showLightWeightStatus(this.languageStatusItem);
		} else {
			if (this.isAdvancedStatusBarItem) {
				(this.statusBarItem as any).name = "Java Server Mode";
			}
			this.statusBarItem.text = StatusIcon.LightWeight;
			this.statusBarItem.command = StatusCommands.switchToStandardCommand;
			this.statusBarItem.tooltip = "Java language server is running in LightWeight mode, click to switch to Standard mode";
			this.statusBarItem.show();
		}
	}

	public showStandardStatus(): void {
		if (this.languageStatusItemAPI) {
			LanguageStatusItemFactory.showStandardStatus(this.languageStatusItem);
			LanguageStatusItemFactory.setBusy(this.languageStatusItem);
		} else {
			if (this.isAdvancedStatusBarItem) {
				(this.statusBarItem as any).name = "Java Server Status";
			}
			this.statusBarItem.text = StatusIcon.Busy;
			this.statusBarItem.command = Commands.SHOW_SERVER_TASK_STATUS;
			this.statusBarItem.tooltip = "";
			this.statusBarItem.show();
		}
	}

	public setBusy(): void {
		if (this.languageStatusItemAPI) {
			LanguageStatusItemFactory.setBusy(this.languageStatusItem);
		} else {
			this.statusBarItem.text = StatusIcon.Busy;
		}
	}

	public setError(): void {
		if (this.languageStatusItemAPI) {
			LanguageStatusItemFactory.setError(this.languageStatusItem);
			this.showCleanItem();
		} else {
			this.statusBarItem.text = StatusIcon.Error;
			this.statusBarItem.command = Commands.OPEN_LOGS;
		}
	}

	public setWarning(): void {
		if (this.languageStatusItemAPI) {
			LanguageStatusItemFactory.setWarning(this.languageStatusItem);
			this.showCleanItem();
		} else {
			this.statusBarItem.text = StatusIcon.Warning;
			this.statusBarItem.command = "workbench.panel.markers.view.focus";
			this.statusBarItem.tooltip = "Errors occurred in project configurations, click to show the PROBLEMS panel";
		}
	}

	public setReady(): void {
		if (this.languageStatusItemAPI) {
			LanguageStatusItemFactory.setReady(this.languageStatusItem);
			this.hideCleanItem();
		} else {
			this.statusBarItem.text = StatusIcon.Ready;
			this.statusBarItem.command = Commands.SHOW_SERVER_TASK_STATUS;
			this.statusBarItem.tooltip = "ServiceReady";
		}
	}

	public updateTooltip(tooltip: string): void {
		if (!this.languageStatusItemAPI) {
			this.statusBarItem.tooltip = tooltip;
		}
	}

	private showCleanItem(): void {
		if (this.cleanServerStatusItem) {
			return;
		}
		this.cleanServerStatusItem = CleanServerStatusItemFactory.create();
	}

	private hideCleanItem(): void {
		this.cleanServerStatusItem?.dispose();
		this.cleanServerStatusItem = undefined;
	}

	public dispose(): void {
		this.statusBarItem?.dispose();
		this.languageStatusItem?.dispose();
		this.cleanServerStatusItem?.dispose();
	}
}

export enum StatusIcon {
	LightWeight = "$(rocket)",
	Busy = "$(sync~spin)",
	Ready = "$(thumbsup)",
	Warning = "$(thumbsdown)",
	Error = "$(thumbsdown)"
}

export const serverStatusBarProvider: ServerStatusBarProvider = new ServerStatusBarProvider();
