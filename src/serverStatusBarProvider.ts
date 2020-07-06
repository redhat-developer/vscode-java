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
		this.statusBarItem.text = "$(rocket)";
		this.statusBarItem.command = {
			title: "Switch to Standard mode",
			command: Commands.SWITCH_SERVER_MODE,
			arguments: [ServerMode.STANDARD],
		};
		this.statusBarItem.tooltip = "Java language server is running in LightWeight mode, click to switch to Standard mode";
		this.statusBarItem.show();
	}

	public showStandardStatus(): void {
		this.statusBarItem.text = "$(sync~spin)";
		this.statusBarItem.command = Commands.SHOW_SERVER_TASK_STATUS;
		this.statusBarItem.tooltip = "";
		this.statusBarItem.show();
	}

	public updateText(text: string): void {
		this.statusBarItem.text = text;
	}

	public setBusy(): void {
		this.statusBarItem.text = '$(sync~spin)';
	}

	public setError(): void {
		this.statusBarItem.text = '$(thumbsdown)';
	}

	public setReady(): void {
		this.statusBarItem.text = '$(thumbsup)';
	}

	public updateTooltip(tooltip: string): void {
		this.statusBarItem.tooltip = tooltip;
	}

	public dispose(): void {
		this.statusBarItem.dispose();
	}
}

export const serverStatusBarProvider: ServerStatusBarProvider = new ServerStatusBarProvider();
