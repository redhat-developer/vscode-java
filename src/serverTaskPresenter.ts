import { tasks, Task, TaskScope, Pseudoterminal, CustomExecution, TaskExecution, TaskRevealKind, TaskPanelKind, EventEmitter, Event, TerminalDimensions } from "vscode";
import * as vscode from "vscode";
import { serverTasks } from "./serverTasks";
import { Disposable } from "vscode-languageclient";
import { ProgressReport } from "./protocol";

const JAVA_SERVER_TASK_PRESENTER_TASK_NAME = "Java Build Status";

export namespace serverTaskPresenter {
	export async function presentServerTaskView() {
		const execution = await getPresenterTaskExecution();
		const terminals = vscode.window.terminals;
		const presenterTerminals = terminals.filter(terminal => terminal.name.endsWith(execution.task.name));
		if (presenterTerminals.length > 0) {
			presenterTerminals[0].show();
		}
	}
}

let presenterTaskExecution: TaskExecution = null;

async function getPresenterTaskExecution(): Promise<TaskExecution> {
	if (!!presenterTaskExecution) {
		return Promise.resolve(presenterTaskExecution);
	}

	const presenterTask = new Task({ type: "Java" }, TaskScope.Workspace, JAVA_SERVER_TASK_PRESENTER_TASK_NAME, "Java", new CustomExecution(async () => {
		return new ServerTaskTerminal();
	}));

	presenterTask.presentationOptions = {
		reveal: TaskRevealKind.Always,
		panel: TaskPanelKind.Dedicated,
		clear: true,
		echo: false,
		focus: false
	};

	return presenterTaskExecution = await tasks.executeTask(presenterTask);
}

class ServerTaskTerminal implements Pseudoterminal {
	private _onDidWriteEvent = new EventEmitter<string>();
	private _onDidCloseEvent = new EventEmitter<number | void>();
	private _subscription: Disposable  = null;
	private _rows: number = 1;

	onDidWrite: Event<string> = this._onDidWriteEvent.event;
	onDidClose?: Event<number | void> = this._onDidCloseEvent.event;

	constructor() {
		this._subscription = serverTasks.onDidUpdateServerTask(serverTasks => {
			this.printTasks(serverTasks);
		});
	}

	private printTasks(tasks: ProgressReport[]) {
		this.clearScreen();
		tasks.forEach(task => this.printTask(task));
	}

	private clearScreen() {
		this._onDidWriteEvent.fire("\u001Bc");
	}

	private printTask(report: ProgressReport) {
		if (report.complete) {
			this._onDidWriteEvent.fire(`${report.id.slice(0, 8)} ${report.task} [Done]\r\n`);
			return;
		}

		this._onDidWriteEvent.fire(`${report.id.slice(0, 8)} ${report.task}: ${report.status} [${report.workDone}/${report.totalWork}]\r\n`);
	}

	open(initialDimensions: TerminalDimensions): void {
		serverTasks.suggestTaskEntrySize(initialDimensions.rows - 1);
		const tasks = serverTasks.getHistory();
		this.printTasks(tasks);
	}

	close(): void {
		presenterTaskExecution.terminate();
		presenterTaskExecution = null;
		this._subscription.dispose();
		this._onDidCloseEvent.fire();
	}

	setDimensions(dimensions: TerminalDimensions) {
		serverTasks.suggestTaskEntrySize(dimensions.rows - 1);
	}
}
