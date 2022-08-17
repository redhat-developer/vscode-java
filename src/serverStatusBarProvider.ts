'use strict';

import { StatusBarItem, window, StatusBarAlignment, version } from "vscode";
import { Commands } from "./commands";
import { Disposable } from "vscode-languageclient";
import * as semver from "semver";
import { ServerStatusItemFactory, StatusCommands, supportsLanguageStatus } from "./languageStatusItemFactory";

class ServerStatusBarProvider implements Disposable {
	private statusBarItem: StatusBarItem;
	private languageStatusItem: any;
	// Adopt new API for status bar item, meanwhile keep the compatibility with Theia.
	// See: https://github.com/redhat-developer/vscode-java/issues/1982
	private isAdvancedStatusBarItem: boolean;

	constructor() {
		this.isAdvancedStatusBarItem = semver.gte(version, "1.57.0");
	}

	public initialize(): void {
		if (supportsLanguageStatus()) {
			this.languageStatusItem = ServerStatusItemFactory.create();
		} else {
			if (this.isAdvancedStatusBarItem) {
				this.statusBarItem = (window.createStatusBarItem as any)("java.serverStatus", StatusBarAlignment.Right, Number.MIN_VALUE);
			} else {
				this.statusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, Number.MIN_VALUE);
			}
		}
	}

	public showLightWeightStatus(): void {
		if (supportsLanguageStatus()) {
			ServerStatusItemFactory.showLightWeightStatus(this.languageStatusItem);
		} else {
			if (this.isAdvancedStatusBarItem) {
				(this.statusBarItem as any).name = "Java Server Mode";
			}
			this.statusBarItem.text = StatusIcon.lightWeight;
			this.statusBarItem.command = StatusCommands.switchToStandardCommand;
			this.statusBarItem.tooltip = "Java language server is running in LightWeight mode, click to switch to Standard mode";
			this.statusBarItem.show();
		}
	}

	public showStandardStatus(): void {
		if (supportsLanguageStatus()) {
			ServerStatusItemFactory.showStandardStatus(this.languageStatusItem);
			ServerStatusItemFactory.setBusy(this.languageStatusItem);
		} else {
			if (this.isAdvancedStatusBarItem) {
				(this.statusBarItem as any).name = "Java Server Status";
			}
			this.statusBarItem.text = StatusIcon.busy;
			this.statusBarItem.command = Commands.SHOW_SERVER_TASK_STATUS;
			this.statusBarItem.tooltip = "";
			this.statusBarItem.show();
		}
	}

	public setBusy(): void {
		if (supportsLanguageStatus()) {
			ServerStatusItemFactory.setBusy(this.languageStatusItem);
		} else {
			this.statusBarItem.text = StatusIcon.busy;
		}
	}

	public setError(): void {
		if (supportsLanguageStatus()) {
			ServerStatusItemFactory.setError(this.languageStatusItem);
		} else {
			this.statusBarItem.text = StatusIcon.error;
			this.statusBarItem.command = Commands.OPEN_LOGS;
		}
	}

	public setWarning(): void {
		if (supportsLanguageStatus()) {
			ServerStatusItemFactory.setWarning(this.languageStatusItem);
		} else {
			this.statusBarItem.text = StatusIcon.warning;
			this.statusBarItem.command = "workbench.panel.markers.view.focus";
			this.statusBarItem.tooltip = "Errors occurred in project configurations, click to show the PROBLEMS panel";
		}
	}

	public setReady(): void {
		if (supportsLanguageStatus()) {
			ServerStatusItemFactory.setReady(this.languageStatusItem);
		} else {
			this.statusBarItem.text = StatusIcon.ready;
			this.statusBarItem.command = Commands.SHOW_SERVER_TASK_STATUS;
			this.statusBarItem.tooltip = "ServiceReady";
		}
	}

	public updateTooltip(tooltip: string): void {
		if (!supportsLanguageStatus()) {
			this.statusBarItem.tooltip = tooltip;
		}
	}

	public dispose(): void {
		this.statusBarItem?.dispose();
		this.languageStatusItem?.dispose();
	}
}

export enum StatusIcon {
	lightWeight = "$(rocket)",
	busy = "$(sync~spin)",
	ready = "$(thumbsup)",
	warning = "$(thumbsdown)",
	error = "$(thumbsdown)"
}

export const serverStatusBarProvider: ServerStatusBarProvider = new ServerStatusBarProvider();
