import { ExtensionContext, MessageItem, QuickPickItem, QuickPickItemKind, Uri, WorkspaceFolder, window, workspace } from "vscode";
import { convertToGlob, getExclusionGlob, getInclusionPatternsFromNegatedExclusion } from "./utils";
import * as path from "path";
import { IBuildTool, getContributedBuildTools } from "./plugin";
import { ACTIVE_BUILD_TOOL_STATE } from "./settings";

export const PICKED_BUILD_FILES = "java.pickedBuildFiles";
export const BUILD_TOOL_FOR_CONFLICTS = "java.buildToolForConflicts";
export const IMPORT_METHOD = "java.importMethod";
export class BuildFileSelector {
	/**
	 * The build tools that are contributed/supported by extensions.
	 */
	private buildTools: IBuildTool[] = [];
	/**
	 * The extension context.
	 */
	private context: ExtensionContext;
	/**
	 * Glob pattern that needs to be excluded from the search.
	 */
	private exclusionGlobPattern: string;
	/**
	 * Glob pattern to search build files.
	 */
	private searchPattern: string;
	/**
	 * Glob pattern for build files that are explicitly
	 * included from the setting: "java.import.exclusions" (negated exclusion).
	 */
	private negatedExclusionSearchPattern: string | undefined;

	/**
	 * string array for the imported folder paths.
	 */
	private importedFolderPaths: string[];

	/**
	 * Mark if the selector is used during initialization.
	 */
	private isInitialization: boolean;

	/**
	 * The build files that are found in the workspace.
	 */
	private foundBuildFiles: Uri[] = [];

	/**
	 * @param context The extension context.
	 * @param isInitialization Mark if the selector is used during initialization.
	 */
	constructor(context: ExtensionContext, importedFolderUris: string[], isInitialization: boolean = true) {
		this.context = context;
		this.importedFolderPaths = importedFolderUris.map(uri => Uri.parse(uri).fsPath);
		this.isInitialization = isInitialization;
		const buildTool = this.context.workspaceState.get<IBuildTool>(BUILD_TOOL_FOR_CONFLICTS);
		if (!buildTool) {
			this.buildTools = getContributedBuildTools();
		} else {
			this.buildTools.push(buildTool);
		}
		// TODO: should we introduce the exclusion globs into the contribution point?
		this.exclusionGlobPattern = getExclusionGlob(["**/target/**", "**/bin/**", "**/build/**"]);
		this.searchPattern = `**/{${this.buildTools.map(buildTool => buildTool.buildFileNames.join(","))}}`;
		const inclusionFolderPatterns: string[] = getInclusionPatternsFromNegatedExclusion();
		if (inclusionFolderPatterns.length > 0) {
			const buildFileNames: string[] = [];
			this.buildTools.forEach(buildTool => buildFileNames.push(...buildTool.buildFileNames));
			this.negatedExclusionSearchPattern = convertToGlob(buildFileNames, inclusionFolderPatterns);
		}
	}

	/**
	 * @returns `true` if there are build files in the workspace, `false` otherwise.
	 */
	public async hasBuildFiles(): Promise<boolean> {
		if (this.buildTools.length === 0) {
			return false;
		}

		let uris: Uri[];
		if (this.negatedExclusionSearchPattern) {
			uris = await workspace.findFiles(this.negatedExclusionSearchPattern, null /* force not use default exclusion */, 1);
			if (uris.length > 0) {
				return true;
			}
		}
		uris = await workspace.findFiles(this.searchPattern, this.exclusionGlobPattern, 1);
		if (uris.length > 0) {
			return true;
		}
		return false;
	}

	/**
	 * Get the uri strings for the build files that the user selected.
	 * @returns An array of uri string for the build files that the user selected.
	 * An empty array means user canceled the selection. Or `undefined` on cancellation.
	 */
	public async selectBuildFiles(): Promise<string[] | undefined> {
		const choices = await this.chooseBuildFilePickers();
		if (choices === undefined) {
			return undefined;
		}
		const pickedUris = await this.eliminateBuildToolConflict(choices);
		this.context.workspaceState.update(PICKED_BUILD_FILES, pickedUris);
		return pickedUris;
	}

	private async chooseBuildFilePickers(): Promise<IBuildFilePicker[]> {
		return window.showQuickPick(this.getBuildFilePickers(), {
			placeHolder: "Note: Currently only Maven projects can be partially imported.",
			title: "Select build files to import",
			ignoreFocusOut: true,
			canPickMany: true,
			matchOnDescription: true,
			matchOnDetail: true,
		});
	}

	/**
	 * Get pickers for all build files in the workspace.
	 */
	private async getBuildFilePickers(): Promise<IBuildFilePicker[]> {
		const addedFolders: Map<string, IBuildFilePicker> = new Map<string, IBuildFilePicker>();
		const uris: Uri[] = await workspace.findFiles(this.searchPattern, this.exclusionGlobPattern);
		if (this.negatedExclusionSearchPattern) {
			uris.push(...await workspace.findFiles(this.negatedExclusionSearchPattern, null /* force not use default exclusion */));
		}
		this.foundBuildFiles.push(...uris);

		for (const uri of uris) {
			const containingFolder = path.dirname(uri.fsPath);
			const buildTool = this.buildTools.find(buildTool => buildTool.buildFileNames.includes(path.basename(uri.fsPath)));
			if (!buildTool) {
				continue;
			}
			if (addedFolders.has(containingFolder)) {
				const picker = addedFolders.get(containingFolder);
				if (!picker.buildToolAndUri.has(buildTool)) {
					picker.buildToolAndUri.set(buildTool, uri);
				}
			} else {
				addedFolders.set(containingFolder, {
					label: path.basename(containingFolder),
					detail: "", // update later
					description: "", // update later
					buildToolAndUri: new Map<IBuildTool, Uri>([[buildTool, uri]]),
				});
			}
		}
		const pickers: IBuildFilePicker[] = Array.from(addedFolders.values());
		await this.setPickerUiComponents(pickers);
		return this.addSeparator(pickers);
	}

	private isImported(uri: Uri): boolean {
		return this.importedFolderPaths.some(importedFolderPath =>
				path.relative(importedFolderPath, path.dirname(uri.fsPath)) === "");
	}

	/**
	 * Update the picker's UI components, including detail, description and picked flag.
	 */
	private async setPickerUiComponents(pickers: IBuildFilePicker[]) {
		for (const picker of pickers) {
			const buildTools = Array.from(picker.buildToolAndUri.keys())
				.sort((a, b) => a.displayName.localeCompare(b.displayName));

			const details = buildTools.map(buildTool => workspace.asRelativePath(picker.buildToolAndUri.get(buildTool)));
			const descriptions = buildTools.map(buildTool => buildTool.displayName);

			picker.detail = details.join(', ');
			picker.description = descriptions.join(', ');
			picker.picked = this.isInitialization || this.isImported(picker.buildToolAndUri.values().next().value);
		}
	}

	/**
	 * Add a separator pickers between pickers that belong to different workspace folders.
	 */
	private addSeparator(pickers: IBuildFilePicker[]): IBuildFilePicker[] {
		// group pickers by their containing workspace folder
		const workspaceFolders = new Map<WorkspaceFolder, IBuildFilePicker[]>();
		for (const picker of pickers) {
			const folder = workspace.getWorkspaceFolder(picker.buildToolAndUri.values().next().value);
			if (folder) {
			  workspaceFolders.set(folder, [...(workspaceFolders.get(folder) || []), picker]);
			}
		}

		const newPickers: IBuildFilePicker[] = [];
		const folderArray = Array.from(workspaceFolders.keys());
		folderArray.sort((a, b) => a.name.localeCompare(b.name));
		for (const folder of folderArray) {
			const pickersInFolder = workspaceFolders.get(folder);
			newPickers.push({
				label: folder.name,
				kind: QuickPickItemKind.Separator,
				buildToolAndUri: null
			});
			newPickers.push(...this.sortPickers(pickersInFolder));
		}
		return newPickers;
	}

	private sortPickers(pickers: IBuildFilePicker[]): IBuildFilePicker[] {
		return pickers.sort((a, b) => {
			const pathA = path.dirname(a.buildToolAndUri.values().next().value.fsPath);
			const pathB = path.dirname(b.buildToolAndUri.values().next().value.fsPath);
			return pathA.localeCompare(pathB);
		});
	}

	/**
	 * Ask user to choose a build tool when there are multiple build tools in the same folder.
	 */
	private async eliminateBuildToolConflict(choices?: IBuildFilePicker[]): Promise<string[]> {
		// group uris by build tool
		const conflictBuildToolAndUris = new Map<IBuildTool, Uri[]>();
		const result: string[] = [];
		for (const picker of choices) {
			if (picker.buildToolAndUri.size > 1) {
			  picker.buildToolAndUri.forEach((uri, buildTool) => {
				conflictBuildToolAndUris.set(buildTool, [...(conflictBuildToolAndUris.get(buildTool) || []), uri]);
			  });
			} else {
			  result.push(picker.buildToolAndUri.values().next().value.toString());
			}
		}

		if (conflictBuildToolAndUris.size > 0) {
			const buildTool = this.context.workspaceState.get<IBuildTool>(BUILD_TOOL_FOR_CONFLICTS);
			if (buildTool) {
				result.push(...this.filterByCachedBuildTool(conflictBuildToolAndUris, buildTool));
			} else {
				result.push(...await this.askToResolveConflicts(conflictBuildToolAndUris));
			}
		}
		return result;
	}

	private filterByCachedBuildTool(conflictBuildToolAndUris: Map<IBuildTool, Uri[]>, buildTool: IBuildTool): string[] {
		const result: string[] = [];
		if (conflictBuildToolAndUris.has(buildTool)) {
			result.push(...conflictBuildToolAndUris.get(buildTool)!.map(uri => uri.toString()));
		}
		return result;
	}

	private async askToResolveConflicts(conflictBuildToolAndUris: Map<IBuildTool, Uri[]>): Promise<string[]> {
		const result: string[] = [];
		const conflictItems: IConflictItem[] = [];
		for (const buildTool of conflictBuildToolAndUris.keys()) {
			conflictItems.push({
				title: buildTool.displayName,
				buildTool: buildTool,
				uris: conflictBuildToolAndUris.get(buildTool),
			});
		}
		conflictItems.sort((a, b) => a.title.localeCompare(b.title));
		conflictItems.push({
			title: "Skip",
			uris: [],
			isCloseAffordance: true,
		});

		const choice = await window.showInformationMessage<IConflictItem>(
			"Which build tool would you like to use for the workspace?",
			{
				modal: true,
			},
			...conflictItems
		);

		if (choice?.title !== "Skip") {
			result.push(...choice.uris.map(uri => uri.toString()));
			this.context.workspaceState.update(BUILD_TOOL_FOR_CONFLICTS, choice.buildTool);
		}
		return result;
	}

	public getAllFoundBuildFiles(): Uri[] {
		return this.foundBuildFiles;
	}
}

interface IConflictItem extends MessageItem {
	uris: Uri[];
	buildTool?: IBuildTool;
}

interface IBuildFilePicker extends QuickPickItem {
	buildToolAndUri: Map<IBuildTool, Uri>;
}

export function cleanupWorkspaceState(context: ExtensionContext) {
	context.workspaceState.update(PICKED_BUILD_FILES, undefined);
	context.workspaceState.update(BUILD_TOOL_FOR_CONFLICTS, undefined);
	context.workspaceState.update(IMPORT_METHOD, undefined);
	context.workspaceState.update(ACTIVE_BUILD_TOOL_STATE, undefined);
}
