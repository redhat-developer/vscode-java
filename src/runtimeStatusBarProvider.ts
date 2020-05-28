'use strict';

import { StatusBarItem, window, StatusBarAlignment, TextEditor, Uri, commands, Event, workspace } from "vscode";
import { Commands } from "./commands";
import { Disposable } from "vscode-languageclient";
import * as path from "path";

class RuntimeStatusBarProvider implements Disposable {
	private statusBarItem: StatusBarItem;
	private javaProjects: Map<string, IProjectInfo>;
	private fileProjectMapping: Map<string, string>;
	private storagePath: string | undefined;
	private disposables: Disposable[];

	constructor() {
		this.javaProjects = new Map<string, IProjectInfo>();
		this.fileProjectMapping = new Map<string, string>();
		this.disposables = [];
	}

	public async initialize(onClasspathUpdate: Event<Uri>, onProjectsImport: Event<Uri[]>, storagePath?: string): Promise<void> {
		// ignore the hash part to make it compatible in debug mode.
		if (storagePath) {
			this.storagePath = Uri.file(path.join(storagePath, "..", "..")).fsPath;
		}

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

		this.disposables.push(window.onDidChangeActiveTextEditor((textEditor) => {
			this.updateItem(textEditor);
		}));

		this.disposables.push(onProjectsImport(async (uris: Uri[]) => {
			for (const uri of uris) {
				this.javaProjects.set(uri.fsPath, this.javaProjects.get(uri.fsPath));
			}
			await this.updateItem(window.activeTextEditor);
		}));

		this.disposables.push(onClasspathUpdate(async (e: Uri) => {
			for (const projectPath of this.javaProjects.keys()) {
				if (path.relative(projectPath, e.fsPath) === '') {
					this.javaProjects.set(projectPath, undefined);
					await this.updateItem(window.activeTextEditor);
					return;
				}
			}
		}));

		await this.updateItem(window.activeTextEditor);
	}

	public dispose(): void {
		this.statusBarItem.dispose();
		for (const disposable of this.disposables) {
			disposable.dispose();
		}
	}

	private findOwnerProject(uri: Uri): string {
		let ownerProjectPath: string | undefined = this.fileProjectMapping.get(uri.fsPath);
		if (ownerProjectPath) {
			return ownerProjectPath;
		}

		const isInWorkspaceFolder: boolean = !!workspace.getWorkspaceFolder(uri);
		for (const projectPath of this.javaProjects.keys()) {
			if (!isInWorkspaceFolder && this.isDefaultProjectPath(projectPath)) {
				ownerProjectPath = projectPath;
				break;
			}

			if (uri.fsPath.startsWith(projectPath)) {
				if (!ownerProjectPath) {
					ownerProjectPath = projectPath;
					continue;
				}

				if (projectPath.length > ownerProjectPath.length) {
					ownerProjectPath = projectPath;
				}
			}
		}

		if (ownerProjectPath) {
			this.fileProjectMapping.set(uri.fsPath, ownerProjectPath);
		}

		return ownerProjectPath;
	}

	private async getProjectInfo(projectPath: string): Promise<IProjectInfo> {
		let projectInfo: IProjectInfo | undefined = this.javaProjects.get(projectPath);
		if (projectInfo) {
			return projectInfo;
		}

		try {
			const settings: {} = await commands.executeCommand<{}>(Commands.EXECUTE_WORKSPACE_COMMAND, Commands.GET_PROJECT_SETTINGS, Uri.file(projectPath).toString(), [SOURCE_LEVEL_KEY, VM_INSTALL_PATH]);
			projectInfo = {
				sourceLevel: settings[SOURCE_LEVEL_KEY],
				vmInstallPath: settings[VM_INSTALL_PATH]
			};

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
		const projectPath: string = this.findOwnerProject(uri);
		if (!projectPath) {
			this.statusBarItem.hide();
			return;
		}

		const projectInfo: IProjectInfo = await this.getProjectInfo(projectPath);
		if (!projectInfo) {
			this.statusBarItem.hide();
			return;
		}

		this.statusBarItem.text = this.getJavaRuntimeFromVersion(projectInfo.sourceLevel);
		this.statusBarItem.tooltip = projectInfo.vmInstallPath ? projectInfo.vmInstallPath : "Configure Java Runtime";
		this.statusBarItem.show();
	}

	private isDefaultProjectPath(fsPath: string) {
		// this.storagePath === undefined indicates that it's in standalone file mode
		return !this.storagePath ||
			fsPath.startsWith(this.storagePath) && fsPath.indexOf("jdt.ls-java-project") > -1;
	}

	private getJavaRuntimeFromVersion(ver: string) {
		if (!ver) {
			return "";
		}

		if (ver === "1.5") {
			return "J2SE-1.5";
		}

		return `JavaSE-${ver}`;
	}
}

interface IProjectInfo {
	sourceLevel: string;
	vmInstallPath: string;
}

const SOURCE_LEVEL_KEY = "org.eclipse.jdt.core.compiler.source";
const VM_INSTALL_PATH = "org.eclipse.jdt.ls.core.vm.location";

export const runtimeStatusBarProvider: RuntimeStatusBarProvider = new RuntimeStatusBarProvider();
