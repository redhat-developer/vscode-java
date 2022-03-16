'use strict';

import * as fse from "fs-extra";
import { StatusBarItem, window, StatusBarAlignment, TextEditor, Uri, commands, workspace, version, languages, Command, ExtensionContext } from "vscode";
import { Commands } from "./commands";
import { Disposable } from "vscode-languageclient";
import * as path from "path";
import { apiManager } from "./apiManager";
import * as semver from "semver";
import { ACTIVE_BUILD_TOOL_STATE } from "./settings";
import { BuildFileStatusItemFactory, RuntimeStatusItemFactory, StatusCommands } from "./languageStatusItemFactory";

class RuntimeStatusBarProvider implements Disposable {
	private statusBarItem: StatusBarItem;
	private runtimeStatusItem: any;
	private buildFileStatusItem: any;
	private javaProjects: Map<string, IProjectInfo>;
	private fileProjectMapping: Map<string, string>;
	private storagePath: string | undefined;
	private disposables: Disposable[];
	// Adopt new API for status bar item, meanwhile keep the compatibility with Theia.
	// See: https://github.com/redhat-developer/vscode-java/issues/1982
	private isAdvancedStatusBarItem: boolean;
	private languageStatusItemAPI: any;

	constructor() {
		this.javaProjects = new Map<string, IProjectInfo>();
		this.fileProjectMapping = new Map<string, string>();
		this.disposables = [];
		this.isAdvancedStatusBarItem = semver.gte(version, "1.57.0");
		this.languageStatusItemAPI = (languages as any).createLanguageStatusItem;
	}

	public async initialize(context: ExtensionContext): Promise<void> {
		// ignore the hash part to make it compatible in debug mode.
		const storagePath = context.storagePath;
		if (storagePath) {
			this.storagePath = Uri.file(path.join(storagePath, "..", "..")).fsPath;
		}

		if (!this.languageStatusItemAPI) {
			if (this.isAdvancedStatusBarItem) {
				this.statusBarItem = (window.createStatusBarItem as any)("java.runtimeStatus", StatusBarAlignment.Right, 0);
				(this.statusBarItem as any).name = "Java Runtime Configuration";
			} else {
				this.statusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 0);
			}
		}

		let projectUriStrings: string[];
		try {
			projectUriStrings = await commands.executeCommand<string[]>(Commands.EXECUTE_WORKSPACE_COMMAND, Commands.GET_ALL_JAVA_PROJECTS);
		} catch (e) {
			return;
		}

		for (const uri of projectUriStrings) {
			this.javaProjects.set(Uri.parse(uri).fsPath, undefined);
		}

		if (!this.languageStatusItemAPI) {
			this.statusBarItem.command = StatusCommands.configureJavaRuntimeCommand;
		}

		this.disposables.push(window.onDidChangeActiveTextEditor((textEditor) => {
			this.updateItem(context, textEditor);
		}));

		this.disposables.push(apiManager.getApiInstance().onDidProjectsImport(async (uris: Uri[]) => {
			for (const uri of uris) {
				this.javaProjects.set(uri.fsPath, this.javaProjects.get(uri.fsPath));
			}
			await this.updateItem(context, window.activeTextEditor);
		}));

		this.disposables.push(apiManager.getApiInstance().onDidClasspathUpdate(async (e: Uri) => {
			for (const projectPath of this.javaProjects.keys()) {
				if (path.relative(projectPath, e.fsPath) === '') {
					this.javaProjects.set(projectPath, undefined);
					await this.updateItem(context, window.activeTextEditor);
					return;
				}
			}
		}));

		await this.updateItem(context, window.activeTextEditor);
	}

	private hideRuntimeStatusItem(): void {
		this.runtimeStatusItem?.dispose();
		this.runtimeStatusItem = undefined;
	}

	private hideBuildFileStatusItem(): void {
		this.buildFileStatusItem?.dispose();
		this.buildFileStatusItem = undefined;
	}

	public dispose(): void {
		this.statusBarItem?.dispose();
		this.runtimeStatusItem?.dispose();
		this.buildFileStatusItem?.dispose();
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

	private async updateItem(context: ExtensionContext, textEditor: TextEditor): Promise<void> {
		if (!textEditor || path.extname(textEditor.document.fileName) !== ".java" && !this.languageStatusItemAPI) {
			this.statusBarItem?.hide();
			return;
		}

		const uri: Uri = textEditor.document.uri;
		const projectPath: string = this.findOwnerProject(uri);
		if (!projectPath) {
			if (this.languageStatusItemAPI) {
				this.hideRuntimeStatusItem();
				this.hideBuildFileStatusItem();
			} else {
				this.statusBarItem?.hide();
			}
			return;
		}

		const projectInfo: IProjectInfo = await this.getProjectInfo(projectPath);
		if (!projectInfo) {
			if (this.languageStatusItemAPI) {
				this.hideRuntimeStatusItem();
				this.hideBuildFileStatusItem();
			} else {
				this.statusBarItem?.hide();
			}
			return;
		}

		const text = this.getJavaRuntimeFromVersion(projectInfo.sourceLevel);
		if (this.languageStatusItemAPI) {
			if (!this.runtimeStatusItem) {
				this.runtimeStatusItem = RuntimeStatusItemFactory.create(text);
				const buildFilePath = await this.getBuildFilePath(context, projectPath);
				if (buildFilePath) {
					this.buildFileStatusItem = BuildFileStatusItemFactory.create(buildFilePath);
				}

			}
		} else {
			this.statusBarItem.text = text;
			this.statusBarItem.tooltip = projectInfo.vmInstallPath ? `Language Level: ${this.statusBarItem.text} <${projectInfo.vmInstallPath}>` : "Configure Java Runtime";
			this.statusBarItem.show();
		}
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

	private async getBuildFilePath(context: ExtensionContext, projectPath: string): Promise<string | undefined> {
		let buildFilePath: string | undefined;
		const activeBuildTool: string | undefined = context.workspaceState.get(ACTIVE_BUILD_TOOL_STATE);
		if (!activeBuildTool) {
			// only one build tool exists in the project
			buildFilePath = await this.getBuildFilePathFromNames(projectPath, ["pom.xml", "build.gradle", "build.gradle.kts", "settings.gradle", "settings.gradle.kts"]);
		} else if (activeBuildTool.toLocaleLowerCase().includes("maven")) {
			buildFilePath = await this.getBuildFilePathFromNames(projectPath, ["pom.xml"]);
		} else if (activeBuildTool.toLocaleLowerCase().includes("gradle")) {
			buildFilePath = await this.getBuildFilePathFromNames(projectPath, ["build.gradle", "build.gradle.kts", "settings.gradle", "settings.gradle.kts"]);
		}
		if (!buildFilePath) {
			return undefined;
		}
		return buildFilePath;
	}

	private async getBuildFilePathFromNames(projectPath: string, buildFileNames: string[]): Promise<string> {
		for (const buildFileName of buildFileNames) {
			const buildFilePath = path.join(projectPath, buildFileName);
			if (await fse.pathExists(buildFilePath)) {
				return buildFilePath;
			}
		}
		return undefined;
	}
}

interface IProjectInfo {
	sourceLevel: string;
	vmInstallPath: string;
}

const SOURCE_LEVEL_KEY = "org.eclipse.jdt.core.compiler.source";
const VM_INSTALL_PATH = "org.eclipse.jdt.ls.core.vm.location";

export const runtimeStatusBarProvider: RuntimeStatusBarProvider = new RuntimeStatusBarProvider();
