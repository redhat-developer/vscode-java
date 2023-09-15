'use strict';

import { commands, Position, Range, Selection, window } from 'vscode';
import { Commands } from './commands';
import { getJavaConfiguration } from './utils';
let active = false;

export async function smartSemicolonDetection() {
	if (enabled()) {
		const params: SmartDetectionParams = {
			uri: window.activeTextEditor.document.uri.toString(),
			position: window.activeTextEditor!.selection.active,
		};
		setActive(true);
		const response: SmartDetectionParams = await commands.executeCommand(Commands.EXECUTE_WORKSPACE_COMMAND, Commands.SMARTSEMICOLON_DETECTION, JSON.stringify(params));
		if (response !== null) {
			window.activeTextEditor!.edit(editBuilder => {
				const oldPosition = window.activeTextEditor!.selection.active;
				editBuilder.delete(new Range(new Position(oldPosition.line, oldPosition.character - 1), oldPosition));
				const newPos = new Position(response.position.line, response.position.character + 1);
				editBuilder.insert(newPos, ";");
				window.activeTextEditor.selections = [new Selection(newPos, newPos)];
				// newPosition = window.activeTextEditor!.selection.active;
			});
			return;
		}
	}
}

interface SmartDetectionParams {
	uri: String;
	position: Position;
}

function enabled() {
	return getJavaConfiguration().get<boolean>("edit.smartSemicolonDetection.enabled");
}

export function isActive() {
	return active;
}

export function setActive(pActive: boolean) {
	active = pActive;
}