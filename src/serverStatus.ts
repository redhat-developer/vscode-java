'use strict';

import { EventEmitter } from "vscode";
import { serverTasks } from "./serverTasks";

export enum ServerStatusKind {
	Ready = "Ready",
	Warning = "Warning",
	Error = "Error",
	Busy = "Busy",
}

const _emitter = new EventEmitter<ServerStatusKind>();
let _status: ServerStatusKind = ServerStatusKind.Ready;
let _isBusy: boolean = false;

function fireEvent() {
	if (_isBusy) {
		_emitter.fire(ServerStatusKind.Busy);
		return;
	}

	_emitter.fire(_status);
}

export namespace serverStatus {

	let hasError: boolean = false;

	export const onServerStatusChanged = _emitter.event;

	export function initialize() {
		serverTasks.onDidUpdateServerTask(tasks => {
			_isBusy = tasks.some(task => !task.complete);
			fireEvent();
		});
	}

	export function updateServerStatus(status: ServerStatusKind) {
		if (status === ServerStatusKind.Busy) {
			throw new Error("Busy status cannot be set directly.");
		}

		if (status === ServerStatusKind.Error || status === ServerStatusKind.Warning) {
			hasError = true;
		} else if (hasError) {
			return;
		}

		_status = status;
		fireEvent();
	}

	export function hasErrors() {
		return hasError;
	}

	export function errorResolved() {
		hasError = false;
	}
}
