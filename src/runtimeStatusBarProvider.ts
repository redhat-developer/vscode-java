'use strict';

import * as fse from "fs-extra";
import { StatusBarItem, window, StatusBarAlignment, TextEditor, Uri, commands, workspace, version, languages, Command, ExtensionContext } from "vscode";
import { Commands } from "./commands";
import { Disposable } from "vscode-languageclient";
import * as path from "path";
import { apiManager } from "./apiManager";
import * as semver from "semver";
import { ACTIVE_BUILD_TOOL_STATE } from "./settings";
import { BuildFileStatusItemFactory, RuntimeStatusItemFactory, StatusCommands, supportsLanguageStatus } from "./languageStatusItemFactory";
import { getJavaConfiguration } from "./utils";
import { hasBuildToolConflicts } from "./extension";
import { addLombokChangeVersionCommand, LombokVersionItemFactory, importedLombok, getLombokVersion, enableLombokSupport } from "./lombokSupport";

class RuntimeStatusBarProvider implements Disposable {
	private statusBarItem: StatusBarItem;
	private runtimeStatusItem: any;
	private buildFileStatusItem: any;
	private lombokVersionItem: any;
	private javaProjects: Map<string, IProjectInfo>;
	private fileProjectMapping: Map<string, string>;
	private storagePath: string | undefined;
	private disposables: Disposable[];
	// Adopt new API for status bar item, meanwhile keep the compatibility with Theia.
	// See: https://github.com/redhat-developer/vscode-java/issues/1982
	private isAdvancedStatusBarItem: boolean;

	constructor() {
		this.javaProjects = new Map<string, IProjectInfo>();
		this.fileProjectMapping = new Map<string, string>();
		this.disposables = [];
		this.isAdvancedStatusBarItem = semver.gte(version, "1.57.0");
	}

	public async initialize(context: ExtensionContext): Promise<void> {
		// ignore the hash part to make it compatible in debug mode.
		const storagePath = context.storagePath;
		if (storagePath) {
			this.storagePath = Uri.file(path.join(storagePath, "..", "..")).fsPath;
		}

		if (!supportsLanguageStatus()) {
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

		if (!supportsLanguageStatus()) {
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

	private hideLombokVersionItem(): void {
		this.lombokVersionItem?.dispose();
		this.lombokVersionItem = undefined;
	}

	public dispose(): void {
		this.statusBarItem?.dispose();
		this.runtimeStatusItem?.dispose();
		this.buildFileStatusItem?.dispose();
		this.lombokVersionItem?.dispose();
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
		if (!textEditor || path.extname(textEditor.document.fileName) !== ".java" && !supportsLanguageStatus()) {
			this.statusBarItem?.hide();
			return;
		}

		if (enableLombokSupport()&&importedLombok(context)) {
			addLombokChangeVersionCommand(context);
		}

		const uri: Uri = textEditor.document.uri;
		const projectPath: string = this.findOwnerProject(uri);
		if (!projectPath) {
			if (supportsLanguageStatus()) {
				this.hideRuntimeStatusItem();
				this.hideBuildFileStatusItem();
				this.hideLombokVersionItem();
			} else {
				this.statusBarItem?.hide();
			}
			return;
		}

		const projectInfo: IProjectInfo = await this.getProjectInfo(projectPath);
		if (!projectInfo) {
			if (supportsLanguageStatus()) {
				this.hideRuntimeStatusItem();
				this.hideBuildFileStatusItem();
				this.hideLombokVersionItem();
			} else {
				this.statusBarItem?.hide();
			}
			return;
		}

		const text = this.getJavaRuntimeFromVersion(projectInfo.sourceLevel);
		if (supportsLanguageStatus()) {
			const buildFilePath = await this.getBuildFilePath(context, projectPath);
			if (!this.runtimeStatusItem) {
				this.runtimeStatusItem = RuntimeStatusItemFactory.create(text, projectInfo.vmInstallPath);
				if (buildFilePath) {
					this.buildFileStatusItem = BuildFileStatusItemFactory.create(buildFilePath);
				}
				if (enableLombokSupport()&&importedLombok(context)) {
					this.lombokVersionItem = LombokVersionItemFactory.create(getLombokVersion(context), buildFilePath);
				}
			} else {
				RuntimeStatusItemFactory.update(this.runtimeStatusItem, text, projectInfo.vmInstallPath);
				if (buildFilePath) {
					BuildFileStatusItemFactory.update(this.buildFileStatusItem, buildFilePath);
				}
				if (enableLombokSupport()&&importedLombok(context)) {
					LombokVersionItemFactory.update(this.lombokVersionItem, getLombokVersion(context), buildFilePath);
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
		const isMavenEnabled: boolean = getJavaConfiguration().get<boolean>("import.maven.enabled");
		const isGradleEnabled: boolean = getJavaConfiguration().get<boolean>("import.gradle.enabled");
		if (isMavenEnabled && isGradleEnabled) {
			let buildFilePath: string | undefined;
			const activeBuildTool: string | undefined = context.workspaceState.get(ACTIVE_BUILD_TOOL_STATE);
			if (!activeBuildTool) {
				if (!(await hasBuildToolConflicts())) {
					// only one build tool exists in the project
					buildFilePath = await this.getBuildFilePathFromNames(projectPath, ["pom.xml", "build.gradle", "build.gradle.kts", "settings.gradle", "settings.gradle.kts"]);
				} else {
					// the user has not resolved build conflicts yet
					return undefined;
				}
			} else if (activeBuildTool.toLocaleLowerCase().includes("maven")) {
				buildFilePath = await this.getBuildFilePathFromNames(projectPath, ["pom.xml"]);
			} else if (activeBuildTool.toLocaleLowerCase().includes("gradle")) {
				buildFilePath = await this.getBuildFilePathFromNames(projectPath, ["build.gradle", "build.gradle.kts", "settings.gradle", "settings.gradle.kts"]);
			}
			return buildFilePath;
		} else if (isMavenEnabled) {
			return this.getBuildFilePathFromNames(projectPath, ["pom.xml"]);
		} else if (isGradleEnabled) {
			return this.getBuildFilePathFromNames(projectPath, ["build.gradle", "build.gradle.kts", "settings.gradle", "settings.gradle.kts"]);
		} else {
			return undefined;
		}
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
