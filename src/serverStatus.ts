'use strict';

import { EventEmitter } from "vscode";
import { serverTasks } from "./serverTasks";
import { serverStatusBarProvider } from "./serverStatusBarProvider";

export enum ServerStatusKind {
	ready = "Ready",
	warning = "Warning",
	error = "Error",
	busy = "Busy",
}

const emitter = new EventEmitter<ServerStatusKind>();
let status: ServerStatusKind = ServerStatusKind.ready;
let isBusy: boolean = false;

function fireEvent() {
	if (isBusy) {
		emitter.fire(ServerStatusKind.busy);
		return;
	}

	emitter.fire(status);
}

export namespace serverStatus {

	let hasError: boolean = false;

	export const onServerStatusChanged = emitter.event;

	export function initialize() {
		serverTasks.onDidUpdateServerTask(tasks => {
			const busyTask = tasks.find(task => !task.complete);
			isBusy = !!busyTask;
			if (isBusy) {
				serverStatusBarProvider.setBusy(busyTask.value.message);
			}
			fireEvent();
		});
	}

	export function updateServerStatus(newStatus: ServerStatusKind) {
		if (newStatus === ServerStatusKind.busy) {
			throw new Error("Busy status cannot be set directly.");
		}

		if (newStatus === ServerStatusKind.error || newStatus === ServerStatusKind.warning) {
			hasError = true;
		} else if (hasError) {
			return;
		}

		status = newStatus;
		fireEvent();
	}

	export function hasErrors() {
		return hasError;
	}

	export function errorResolved() {
		hasError = false;
	}
}
