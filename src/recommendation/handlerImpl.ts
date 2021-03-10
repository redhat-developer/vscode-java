// Copyright (c) Microsoft Corporation. All rights reserved.

'use strict';

import * as vscode from "vscode";
import { IHandler } from "./handler";

const KEY_RECOMMENDATION_USER_CHOICE_MAP = "recommendationUserChoice";

async function installExtensionCmdHandler(extensionName: string, displayName: string) {
	return vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: `Installing ${displayName||extensionName}...`}, progress => {
		return vscode.commands.executeCommand("workbench.extensions.installExtension", extensionName);
	}).then(() => {
		vscode.window.showInformationMessage(`Successfully installed ${displayName||extensionName}.`);
	});
}

enum UserChoice {
	Install = "Install",
	Never = "Never",
	Later = "Later",
}

export class HandlerImpl implements IHandler {
	userChoice: any;
	storeUserChoice: any;
	constructor(context: vscode.ExtensionContext) {
		this.userChoice = () => {
			return context.globalState.get(KEY_RECOMMENDATION_USER_CHOICE_MAP, {});
		};

		this.storeUserChoice = (choice: object) => {
			context.globalState.update(KEY_RECOMMENDATION_USER_CHOICE_MAP, choice);
		};
	}

	isExtensionInstalled(extName: string): boolean {
		return !!vscode.extensions.getExtension(extName);
	}

	canRecommendExtension(extName: string): boolean {
		return this.userChoice()[extName] !== UserChoice.Never && !this.isExtensionInstalled(extName);
	}

	async handle(extName: string, message: string): Promise<void> {
		if (this.isExtensionInstalled(extName)) {
			return;
		}

		const choice = this.userChoice();
		if (choice[extName] === UserChoice.Never) {
			return;
		}

		const actions: Array<string> = Object.keys(UserChoice);
		const answer = await vscode.window.showInformationMessage(message, ...actions);
		if (answer === UserChoice.Install) {
			await installExtensionCmdHandler(extName, extName);
		}

		choice[extName] = answer;
		this.storeUserChoice(choice);
	}
}
