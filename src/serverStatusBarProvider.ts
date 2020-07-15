'use strict';

import { StatusBarItem, window, StatusBarAlignment } from "vscode";
import { Commands } from "./commands";
import { Disposable } from "vscode-languageclient";
import { ServerMode } from "./settings";

class ServerStatusBarProvider implements Disposable {
	private statusBarItem: StatusBarItem;

	constructor() {
		this.statusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, Number.MIN_VALUE);
	}

	public showLightWeightStatus(): void {
		this.statusBarItem.text = StatusIcon.LightWeight;
		this.statusBarItem.command = {
			title: "Switch to Standard mode",
			command: Commands.SWITCH_SERVER_MODE,
			arguments: [ServerMode.STANDARD],
		};
		this.statusBarItem.tooltip = "Java language server is running in LightWeight mode, click to switch to Standard mode";
		this.statusBarItem.show();
	}

	public showStandardStatus(): void {
		this.statusBarItem.text = StatusIcon.Busy;
		this.statusBarItem.command = Commands.SHOW_SERVER_TASK_STATUS;
		this.statusBarItem.tooltip = "";
		this.statusBarItem.show();
	}

	public updateText(text: string): void {
		this.statusBarItem.text = text;
	}

	public setBusy(): void {
		this.statusBarItem.text = StatusIcon.Busy;
	}

	public setError(): void {
		this.statusBarItem.text = StatusIcon.Error;
	}

	public setReady(): void {
		this.statusBarItem.text = StatusIcon.Ready;
	}

	public updateTooltip(tooltip: string): void {
		this.statusBarItem.tooltip = tooltip;
	}

	public dispose(): void {
		this.statusBarItem.dispose();
	}
}

enum StatusIcon {
	LightWeight = "$(rocket)",
	Busy = "$(sync~spin)",
	Ready = "$(thumbsup)",
	Error = "$(thumbsdown)"
}

export const serverStatusBarProvider: ServerStatusBarProvider = new ServerStatusBarProvider();
