// Copyright (c) Microsoft Corporation. All rights reserved.

'use strict';

import * as vscode from "vscode";
import { IHandler } from "./handler";

const KEY_RECOMMENDATION_USER_CHOICE_MAP = "recommendationUserChoice";

function isExtensionInstalled( extName: string) {
	return !!vscode.extensions.getExtension(extName);
}

async function installExtensionCmdHandler(extensionName: string, displayName: string) {
	return vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: `Installing ${displayName||extensionName}...`}, progress => {
		return vscode.commands.executeCommand("workbench.extensions.installExtension", extensionName);
	}).then(() => {
		vscode.window.showInformationMessage(`Successfully installed ${displayName||extensionName}.`);
	});
}

export class HandlerImpl implements IHandler {
	context: vscode.ExtensionContext;
	constructor(context: vscode.ExtensionContext) {
		this.context = context;
	}

	async handle(extName: string, message: string): Promise<void> {
		if (isExtensionInstalled(extName)) {
			return;
		}

		const action = ["Install", "Never", "Later"];
		const choice: { [key: string]: string; } = this.context.globalState.get(KEY_RECOMMENDATION_USER_CHOICE_MAP, {});
		if (choice && choice[extName] === action[1]) {
			return;
		}

		const answer = await vscode.window.showInformationMessage(message, ...action);
		if (answer === action[0]) {
			await installExtensionCmdHandler(extName, extName);
		}

		choice[extName] = answer;

		this.context.globalState.update(KEY_RECOMMENDATION_USER_CHOICE_MAP, choice);
	}
}
