import { tasks, Task, TaskScope, Pseudoterminal, CustomExecution, TaskExecution, TaskRevealKind, TaskPanelKind, EventEmitter, Event, TerminalDimensions, window, Progress, ProgressLocation, workspace } from "vscode";
import { serverTasks } from "./serverTasks";
import { Disposable } from "vscode-languageclient";
import { ProgressReport, ProgressKind } from "./protocol";
import { Commands } from "./commands";
import { getJavaConfiguration } from "./utils";

const JAVA_SERVER_TASK_PRESENTER_TASK_NAME = "Java Build Status";

export namespace serverTaskPresenter {
	export async function presentServerTaskView(preserveFocus?: boolean) {
		const execution = await getPresenterTaskExecution();
		const terminals = window.terminals;
		const presenterTerminals = terminals.filter(terminal => terminal.name.indexOf(execution.task.name) >= 0);
		if (presenterTerminals.length > 0) {
			presenterTerminals[0].show(preserveFocus);
		}
		activationProgressNotification.hide();
	}
}

let presenterTaskExecution: TaskExecution = null;

async function getPresenterTaskExecution(): Promise<TaskExecution> {
	await killExistingExecutions();

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
	presenterTask.isBackground = true;

	return presenterTaskExecution = await tasks.executeTask(presenterTask);
}

// Fix #1180. When switching to multiroot workspace by "Add Folder to Workspace...", vscode restarts the extension
// host without deactivating the extension. See https://github.com/microsoft/vscode/issues/69335
// This is to clean up the existing task execution and terminal created by previous extension instance because they
// are no longer accessible to the current extension instance after the restart.
// TODO - As mentioned in https://github.com/microsoft/vscode/issues/69335, vscode will no long restart because of
// workspace changes. We can revisit this issue to see if we can remove the fix.
async function killExistingExecutions() {
	if (!!presenterTaskExecution) {
		return;
	}

	let execs = tasks.taskExecutions;
	execs = execs.filter(exec => exec.task.name.indexOf(JAVA_SERVER_TASK_PRESENTER_TASK_NAME) >= 0);
	execs.forEach(exec => exec.terminate());
	await new Promise(resolve => setTimeout(resolve, 0));

	let terminals = window.terminals;
	terminals = terminals.filter(terminal => terminal.name.indexOf(JAVA_SERVER_TASK_PRESENTER_TASK_NAME) >= 0);
	terminals.forEach(terminal => terminal.dispose());
	await new Promise(resolve => setTimeout(resolve, 0));
}

class ServerTaskTerminal implements Pseudoterminal {
	private onDidWriteEvent = new EventEmitter<string>();
	private onDidCloseEvent = new EventEmitter<number | void>();
	private subscription: Disposable  = null;

	onDidWrite: Event<string> = this.onDidWriteEvent.event;
	onDidClose?: Event<number | void> = this.onDidCloseEvent.event;

	constructor() {
		this.subscription = serverTasks.onDidUpdateServerTask(serverTasks => {
			this.printTasks(serverTasks);
		});
	}

	private printTasks(tasks: ProgressReport[]) {
		this.clearScreen();
		tasks.forEach(task => this.printTask(task));
	}

	private clearScreen() {
		this.onDidWriteEvent.fire("\u001Bc");
	}

	private printTask(report: ProgressReport) {
		if (report.complete) {
			this.onDidWriteEvent.fire(`${report.token.slice(0, 8)} ${report.value.message} [Done]\r\n`);
			return;
		}

		const taskMsg = `${report.token.slice(0, 8)} ${report.value.message}`;

		this.onDidWriteEvent.fire(`${taskMsg}\r\n`);
	}

	open(initialDimensions: TerminalDimensions): void {
		serverTasks.suggestTaskEntrySize(initialDimensions.rows - 1);
		const tasks = serverTasks.getHistory();
		this.printTasks(tasks);
	}

	close(): void {
		presenterTaskExecution.terminate();
		presenterTaskExecution = null;
		this.subscription.dispose();
		this.onDidCloseEvent.fire();
	}

	setDimensions(dimensions: TerminalDimensions) {
		serverTasks.suggestTaskEntrySize(dimensions.rows - 1);
	}
}

export class ActivationProgressNotification {
	private hideEmitter = new EventEmitter<void>();
	private onHide = this.hideEmitter.event;
	private disposables: Disposable[] = [];

	public showProgress() {
		if (!workspace.workspaceFolders) {
			return;
		}
		const showBuildStatusEnabled = getJavaConfiguration().get("showBuildStatusOnStart.enabled");
		if (typeof showBuildStatusEnabled === "string" || showBuildStatusEnabled instanceof String) {
			if (showBuildStatusEnabled !== "notification") {
				return;
			}
		} else if (!showBuildStatusEnabled) {
			return;
		}
		const title = "Opening Java Projects";
		window.withProgress({
			location: ProgressLocation.Notification,
			title,
			cancellable: false,
		}, (progress: Progress<{ message?: string; increment?: number }>) => {
			return new Promise<void>((resolve) => {
				progress.report({
					message: `[check details](command:${Commands.SHOW_SERVER_TASK_STATUS})`
				});
				this.onHide(() => {
					for (const disposable of this.disposables) {
						disposable.dispose();
					}
					return resolve();
				});
			});
		});
	}

	public hide() {
		this.hideEmitter.fire();
	}
}

export const activationProgressNotification = new ActivationProgressNotification();
