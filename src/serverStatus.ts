import { EventEmitter } from "vscode";
import { serverTasks } from "./serverTasks";

export enum ServerStatusKind {
	Ready = "Ready",
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
	export enum ServerStatus {
		Ready = "Ready",
		Error = "Error",
		Busy = "Busy",
	}

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

		_status = status;
		fireEvent();
	}
}
