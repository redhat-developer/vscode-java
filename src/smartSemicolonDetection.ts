'use strict';

import { commands, ExtensionContext, Position, Range, Selection, window } from 'vscode';
import { Commands } from './commands';
import { getJavaConfiguration } from './utils';

let oldPosition: Position = null;
let newPosition: Position = null;

export function registerSmartSemicolonDetection(context: ExtensionContext) {
	context.subscriptions.push(commands.registerCommand(Commands.SMARTSEMICOLON_DETECTION_CMD, async () => {
		if (!didSmartSemicolonInsertion() && enabled()) {
			const params: SmartDetectionParams = {
				uri: window.activeTextEditor.document.uri.toString(),
				position: window.activeTextEditor!.selection.active,
			};
			const response: SmartDetectionParams = await commands.executeCommand(Commands.EXECUTE_WORKSPACE_COMMAND, Commands.SMARTSEMICOLON_DETECTION, JSON.stringify(params));
			if (response !== null) {
				window.activeTextEditor!.edit(editBuilder => {
					oldPosition = window.activeTextEditor!.selection.active;
					editBuilder.insert(response.position, ";");
					window.activeTextEditor.selections = [new Selection(response.position, response.position)];
					newPosition = window.activeTextEditor!.selection.active;
				});
				return;
			}
		}
		window.activeTextEditor!.edit(editBuilder => {
			editBuilder.insert(window.activeTextEditor!.selection.active, ";");
		});
		newPosition = null;
		oldPosition = null;
	}));
	context.subscriptions.push(commands.registerCommand(Commands.SMARTSEMICOLON_DETECTION_UNDO, async () => {
		if (didSmartSemicolonInsertion() && enabled()) {
			window.activeTextEditor!.edit(editBuilder => {
				editBuilder.insert(oldPosition, ";");
				const delRange = new Range(newPosition, new Position(newPosition.line, newPosition.character + 1));
				editBuilder.delete(delRange);
				window.activeTextEditor.selections = [new Selection(oldPosition, oldPosition)];
				oldPosition = null;
				newPosition = null;
			});
			return;
		}
		window.activeTextEditor!.edit(() => {
			commands.executeCommand("deleteLeft");
		});
		oldPosition = null;
		newPosition = null;
	}));
}

interface SmartDetectionParams {
	uri: String;
	position: Position;
}

function didSmartSemicolonInsertion() {
	const smartSemicolonInsertion = window.activeTextEditor.selections.length === 1 && enabled() && oldPosition !== null && newPosition !== null;
	if (smartSemicolonInsertion) {
		const active = window.activeTextEditor!.selection.active;
		const prev = new Position(active.line, active.character === 0 ? 0 : active.character - 1);
		return newPosition.isEqual(prev);
	}
	return smartSemicolonInsertion;
}

function enabled() {
	return getJavaConfiguration().get<boolean>("edit.smartSemicolonDetection.enabled");
}

export function setSmartSemiColonDetectionState(oldPos: Position, newPos: Position) {
	oldPosition = oldPos;
	newPos = newPos;
}