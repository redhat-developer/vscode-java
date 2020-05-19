'use strict';

import { StatusBarItem, window, StatusBarAlignment, TextEditor, Uri, commands, Event, FileSystemProvider } from "vscode";
import { Commands } from "./commands";
import { Disposable } from "vscode-languageclient";
import * as path from "path";
import { getJavaRuntimeFromVersion } from "./javaRuntime";

class RuntimeStatusBarProvider implements Disposable {
	private statusBarItem: StatusBarItem;
	private javaProjects: Map<string, IProjectInfo>;
	private fileProjectMapping: Map<string, string>;
	private disposables: Disposable[];

	constructor() {
		this.javaProjects = new Map<string, IProjectInfo>();
		this.fileProjectMapping = new Map<string, string>();
		this.disposables = [];
	}

	public async initialize(onClasspathUpdate: Event<Uri>): Promise<void> {
		this.statusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 0);
		let projectUriStrings: string[];
		try {
			projectUriStrings = await commands.executeCommand<string[]>(Commands.EXECUTE_WORKSPACE_COMMAND, Commands.GET_ALL_JAVA_PROJECTS);
		} catch (e) {
			return;
		}

		for (const uri of projectUriStrings) {
			this.javaProjects.set(Uri.parse(uri).fsPath, undefined);
		}

		this.statusBarItem.command = {
			title: "Configure Java Runtime",
			command: "workbench.action.openSettings",
			arguments: ["java.configuration.runtimes"],
		};
		this.statusBarItem.tooltip = "Configure Java Runtime";

		this.disposables.push(window.onDidChangeActiveTextEditor((textEditor) => {
			this.updateItem(textEditor);
		}));

		onClasspathUpdate(async (e) => {
			for (const projectPath of this.javaProjects.keys()) {
				if (path.relative(projectPath, e.fsPath) === '') {
					this.javaProjects.set(projectPath, undefined);
					await this.updateItem(window.activeTextEditor);
					return;
				}
			}
		});

		await this.updateItem(window.activeTextEditor);
	}

	public dispose(): void {
		this.statusBarItem.dispose();
		for (const disposable of this.disposables) {
			disposable.dispose();
		}
	}

	private findBelongingProject(uri: Uri): string {
		if (this.fileProjectMapping.has(uri.fsPath)) {
			return this.fileProjectMapping.get(uri.fsPath);
		}

		let belongingProjectPath: string;
		for (const projectPath of this.javaProjects.keys()) {
			if (uri.fsPath.startsWith(projectPath)) {
				if (!belongingProjectPath) {
					belongingProjectPath = projectPath;
					continue;
				}

				if (projectPath.length > belongingProjectPath.length) {
					belongingProjectPath = projectPath;
				}
			}
		}

		if (belongingProjectPath) {
			this.fileProjectMapping.set(uri.fsPath, belongingProjectPath);
		}

		return belongingProjectPath;
	}

	private async getProjectInfo(projectPath: string): Promise<IProjectInfo> {
		if (this.javaProjects.get(projectPath)) {
			return this.javaProjects.get(projectPath);
		}

		try {
			const settings: {} = await commands.executeCommand<{}>(Commands.EXECUTE_WORKSPACE_COMMAND, Commands.GET_PROJECT_SETTINGS, Uri.file(projectPath).toString(), ["org.eclipse.jdt.core.compiler.source"]);
			const sourceLevel: string = settings["org.eclipse.jdt.core.compiler.source"];
			if (!sourceLevel) {
				return undefined;
			}

			const projectInfo: IProjectInfo = { sourceLevel };
			this.javaProjects.set(projectPath, projectInfo);
			return projectInfo;

		} catch (e) {
			// do nothing
		}

		return undefined;
	}

	private async updateItem(textEditor: TextEditor): Promise<void> {
		if (!textEditor || path.extname(textEditor.document.fileName) !== ".java") {
			this.statusBarItem.hide();
			return;
		}

		const uri: Uri = textEditor.document.uri;
		const projectPath: string = this.findBelongingProject(uri);
		if (!projectPath) {
			this.statusBarItem.hide();
			return;
		}

		const projectInfo: IProjectInfo = await this.getProjectInfo(projectPath);
		if (!projectInfo) {
			this.statusBarItem.hide();
			return;
		}

		this.statusBarItem.text = getJavaRuntimeFromVersion(projectInfo.sourceLevel);
		this.statusBarItem.show();
	}
}

interface IProjectInfo {
	sourceLevel: string;
}

export const runtimeStatusBarProvider: RuntimeStatusBarProvider = new RuntimeStatusBarProvider();
