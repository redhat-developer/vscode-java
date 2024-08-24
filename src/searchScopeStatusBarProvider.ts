'use strict';

import { StatusBarAlignment, StatusBarItem, window, workspace } from "vscode";
import { Disposable } from "vscode-languageclient";
import { Commands } from "./commands";

class SearchScopeStatusBarProvider implements Disposable {
    private statusBarItem: StatusBarItem;

    constructor() {
        this.statusBarItem = window.createStatusBarItem("java.searchScope", StatusBarAlignment.Right);
        this.statusBarItem.show();
        this.statusBarItem.command = {
            title: "%java.change.searchScope%",
            command: Commands.CHANGE_JAVA_SEARCH_SCOPE,
        };
		this.update();
    }

    public dispose(): void {
        this.statusBarItem?.dispose();
    }

	public update() {
		const value = workspace.getConfiguration().get("java.search.scope");
		switch(value) {
			case "main": {
				this.statusBarItem.text = `\$(search) Java: Main`;
				this.statusBarItem.tooltip = "Current java search scope : Search only on main classpath entries";
				break;
			}
			default: {
				this.statusBarItem.text = `\$(search) Java: All`;
				this.statusBarItem.tooltip = "Current java search scope : Search only on all classpath entries";
				break;
			}
		}
	}
}

export const searchScopeBarProvider: SearchScopeStatusBarProvider = new SearchScopeStatusBarProvider();
