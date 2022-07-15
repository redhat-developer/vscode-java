'use strict';

import { commands, QuickPickItem, Uri, window } from "vscode";
import * as path from "path";
import { TextDocumentIdentifier } from "vscode-languageclient";
import { LanguageClient } from "vscode-languageclient/node";
import { buildFilePatterns } from "./plugin";
import { ProjectConfigurationUpdateRequest } from "./protocol";
import { Commands } from "./commands";

export async function projectConfigurationUpdate(languageClient: LanguageClient, uris?: TextDocumentIdentifier | Uri | Uri[]) {
	let resources = [];
	if (!uris) {
		const activeFileUri: Uri | undefined = window.activeTextEditor?.document.uri;

		if (activeFileUri && isJavaConfigFile(activeFileUri.fsPath)) {
			resources = [activeFileUri];
		} else {
			resources = await askForProjects(activeFileUri, "Please select the project(s) to update.");
		}
	} else if (uris instanceof Uri) {
		resources.push(uris);
	} else if (Array.isArray(uris)) {
		for (const uri of uris) {
			if (uri instanceof Uri) {
				resources.push(uri);
			}
		}
	} else if ("uri" in uris) {
		resources.push(Uri.parse(uris.uri));
	}

	if (resources.length === 1) {
		languageClient.sendNotification(ProjectConfigurationUpdateRequest.type, {
			uri: resources[0].toString(),
		});
	} else if (resources.length > 1) {
		languageClient.sendNotification(ProjectConfigurationUpdateRequest.typeV2, {
			identifiers: resources.map(r => {
				return { uri: r.toString() };
			}),
		});
	}
}

function isJavaConfigFile(filePath: string) {
	const fileName = path.basename(filePath);
	const regEx = new RegExp(buildFilePatterns.map(r => `(${r})`).join('|'), 'i');
	return regEx.test(fileName);
}

/**
 * Ask user to select projects and return the selected projects' uris.
 * @param activeFileUri the uri of the active file.
 * @param placeHolder message to be shown in quick pick.
 */
export async function askForProjects(activeFileUri: Uri | undefined, placeHolder: string): Promise<Uri[]> {
	const projectPicks: QuickPickItem[] = await generateProjectPicks(activeFileUri);
	if (!projectPicks?.length) {
		return [];
	} else if (projectPicks.length === 1) {
		return [Uri.file(projectPicks[0].detail)];
	} else {
		const choices: QuickPickItem[] | undefined = await window.showQuickPick(projectPicks, {
			matchOnDetail: true,
			placeHolder: placeHolder,
			ignoreFocusOut: true,
			canPickMany: true,
		});

		if (choices?.length) {
			return choices.map(c => Uri.file(c.detail));
		}
	}

	return [];
}

/**
 * Generate the quick picks for projects selection. An `undefined` value will be return if
 * it's failed to generate picks.
 * @param activeFileUri the uri of the active document.
 */
async function generateProjectPicks(activeFileUri: Uri | undefined): Promise<QuickPickItem[] | undefined> {
	let projectUriStrings: string[];
	try {
		projectUriStrings = await commands.executeCommand<string[]>(Commands.EXECUTE_WORKSPACE_COMMAND, Commands.GET_ALL_JAVA_PROJECTS);
	} catch (e) {
		return undefined;
	}

	const projectPicks: QuickPickItem[] = projectUriStrings.map(uriString => {
		const projectPath = Uri.parse(uriString).fsPath;
		if (path.basename(projectPath) === "jdt.ls-java-project") {
			return undefined;
		}

		return {
			label: path.basename(projectPath),
			detail: projectPath,
		};
	}).filter(Boolean);

	// pre-select an active project based on the uri candidate.
	if (activeFileUri?.scheme === "file") {
		const candidatePath = activeFileUri.fsPath;
		let belongingIndex = -1;
		for (let i = 0; i < projectPicks.length; i++) {
			if (candidatePath.startsWith(projectPicks[i].detail)) {
				if (belongingIndex < 0
						|| projectPicks[i].detail.length > projectPicks[belongingIndex].detail.length) {
					belongingIndex = i;
				}
			}
		}
		if (belongingIndex >= 0) {
			projectPicks[belongingIndex].picked = true;
		}
	}

	return projectPicks;
}
