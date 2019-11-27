import { EventEmitter, Progress } from "vscode";
import { ProgressReport } from "./protocol";

const findIndex = require("lodash.findindex");

let tasks: ProgressReport[] = [];

const emitter = new EventEmitter<ProgressReport[]>();
let suggestedTaskEntrySize = 10;

export namespace serverTasks {
	export const onDidUpdateServerTask = emitter.event;

	export function updateServerTask(report: ProgressReport) {
		applyReport(report);
		emitter.fire(tasks);
	}

	export function suggestTaskEntrySize(size: number) {
		if (size > suggestedTaskEntrySize) {
			suggestedTaskEntrySize = size;
		}
	}

	export function getHistory(): ProgressReport[] {
		return tasks;
	}
}

function organizeTasks() {
	let newArray = tasks;
	if (tasks.length > suggestedTaskEntrySize) {
		newArray = recycleTasks(tasks, suggestedTaskEntrySize);
	}

	// make sure in-progress items are always at the end
	newArray.sort((a, b) => {
		const ai = a.complete ? 0 : 1, bi = a.complete ? 0 : 1;
		return ai - bi;
	});

	tasks = newArray;
}

function recycleTasks(tasks: ProgressReport[], length: number) {
	const newArray = [], delta = tasks.length - length;
	let skipped = 0;

	tasks.forEach(task => {
		if (skipped < delta && task.complete) {
			skipped++;
			return;
		}

		newArray.push(task);
	});

	return newArray;
}

function applyReport(report: ProgressReport) {
	const index = findIndex(tasks, task => task.id === report.id);
	if (index === -1) {
		tasks.push(report);
	} else {
		tasks[index] = report;
	}

	organizeTasks();
}
