import { ExtensionContext, MessageItem, QuickPickItem, QuickPickItemKind, Uri, WorkspaceFolder, extensions, window, workspace } from "vscode";
import { convertToGlob, getExclusionGlob as getExclusionGlobPattern, getInclusionPatternsFromNegatedExclusion } from "./utils";
import * as path from "path";

export const PICKED_BUILD_FILES = "java.pickedBuildFiles";
export class BuildFileSelector {
	private buildTypes: IBuildTool[] = [];
	private context: ExtensionContext;
	private exclusionGlobPattern: string;
	// cached glob pattern for build files.
	private searchPattern: string;
	// cached glob pattern for build files that are explicitly
	// included from the setting: "java.import.exclusions" (negated exclusion).
	private negatedExclusionSearchPattern: string | undefined;

	constructor(context: ExtensionContext) {
		this.context = context;
		// TODO: should we introduce the exclusion globs into the contribution point?
		this.exclusionGlobPattern = getExclusionGlobPattern(["**/target/**", "**/bin/**", "**/build/**"]);
		for (const extension of extensions.all) {
			const javaBuildTools: IBuildTool[] = extension.packageJSON.contributes?.javaBuildTools;
			if (!Array.isArray(javaBuildTools)) {
				continue;
			}

			for (const buildType of javaBuildTools) {
				if (!this.isValidBuildTypeConfiguration(buildType)) {
					continue;
				}

				this.buildTypes.push(buildType);
			}
		}
		this.searchPattern = `**/{${this.buildTypes.map(buildType => buildType.buildFileNames.join(","))}}`;
		const inclusionFolderPatterns: string[] = getInclusionPatternsFromNegatedExclusion();
		if (inclusionFolderPatterns.length > 0) {
			const buildFileNames: string[] = [];
			this.buildTypes.forEach(buildType => buildFileNames.push(...buildType.buildFileNames));
			this.negatedExclusionSearchPattern = convertToGlob(buildFileNames, inclusionFolderPatterns);
		}
	}

	/**
	 * @returns `true` if there are build files in the workspace, `false` otherwise.
	 */
	public async hasBuildFiles(): Promise<boolean> {
		if (this.buildTypes.length === 0) {
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
	 * An empty array means user canceled the selection.
	 */
	public async getBuildFiles(): Promise<string[] | undefined> {
		const cache = this.context.workspaceState.get<string[]>(PICKED_BUILD_FILES);
		if (cache !== undefined) {
			return cache;
		}

		const choice = await this.chooseBuildFilePickers();
		const pickedUris = await this.eliminateBuildToolConflict(choice);
		if (pickedUris.length > 0) {
			this.context.workspaceState.update(PICKED_BUILD_FILES, pickedUris);
		}
		return pickedUris;
	}

	private isValidBuildTypeConfiguration(buildType: IBuildTool): boolean {
		return !!buildType.displayName && !!buildType.buildFileNames;
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
		const uris: Uri[] = await workspace.findFiles(this.searchPattern, this.exclusionGlobPattern);
		if (this.negatedExclusionSearchPattern) {
			uris.push(...await workspace.findFiles(this.negatedExclusionSearchPattern, null /* force not use default exclusion */));
		}

		// group build files by build tool and then sort them by build tool name.
		const groupByBuildTool = new Map<IBuildTool, Uri[]>();
		for (const uri of uris) {
			const buildType = this.buildTypes.find(buildType => buildType.buildFileNames.includes(path.basename(uri.fsPath)));
			if (!buildType) {
				continue;
			}
			if (!groupByBuildTool.has(buildType)) {
				groupByBuildTool.set(buildType, []);
			}
			groupByBuildTool.get(buildType)?.push(uri);
		}

		const buildTypeArray = Array.from(groupByBuildTool.keys());
		buildTypeArray.sort((a, b) => a.displayName.localeCompare(b.displayName));
		const addedFolders: Map<string, IBuildFilePicker> = new Map<string, IBuildFilePicker>();
		for (const buildType of buildTypeArray) {
			const uris = groupByBuildTool.get(buildType);
			for (const uri of uris) {
				const containingFolder = path.dirname(uri.fsPath);
				if (addedFolders.has(containingFolder)) {
					const picker = addedFolders.get(containingFolder);
					if (!picker.buildTypeAndUri.has(buildType)) {
						picker.detail += `, ./${workspace.asRelativePath(uri)}`;
						picker.description += `, ${buildType.displayName}`;
						picker.buildTypeAndUri.set(buildType, uri);
					}
				} else {
					addedFolders.set(containingFolder, {
						label: path.basename(containingFolder),
						detail: `./${workspace.asRelativePath(uri)}`,
						description: buildType.displayName,
						buildTypeAndUri: new Map<IBuildTool, Uri>([[buildType, uri]]),
						picked: true,
					});
				}
			}
		}

		const pickers: IBuildFilePicker[] = Array.from(addedFolders.values());
		return this.addSeparator(pickers);
	}

	/**
	 * Add a separator pickers between pickers that belong to different workspace folders.
	 */
	private addSeparator(pickers: IBuildFilePicker[]): IBuildFilePicker[] {
		// group pickers by their containing workspace folder
		const workspaceFolders = new Map<WorkspaceFolder, IBuildFilePicker[]>();
		for (const picker of pickers) {
			const folder = workspace.getWorkspaceFolder(picker.buildTypeAndUri.values().next().value);
			if (!folder) {
				continue;
			}
			if (!workspaceFolders.has(folder)) {
				workspaceFolders.set(folder, []);
			}
			workspaceFolders.get(folder)?.push(picker);
		}

		const newPickers: IBuildFilePicker[] = [];
		const folderArray = Array.from(workspaceFolders.keys());
		folderArray.sort((a, b) => a.name.localeCompare(b.name));
		for (const folder of folderArray) {
			const pickersInFolder = workspaceFolders.get(folder);
			newPickers.push({
				label: folder.name,
				kind: QuickPickItemKind.Separator,
				buildTypeAndUri: null
			});
			newPickers.push(...this.sortPickers(pickersInFolder));
		}
		return newPickers;
	}

	private sortPickers(pickers: IBuildFilePicker[]): IBuildFilePicker[] {
		return pickers.sort((a, b) => {
			const pathA = path.dirname(a.buildTypeAndUri.values().next().value.fsPath);
			const pathB = path.dirname(b.buildTypeAndUri.values().next().value.fsPath);
			return pathA.localeCompare(pathB);
		});
	}

	/**
	 * Ask user to choose a build tool when there are multiple build tools in the same folder.
	 */
	private async eliminateBuildToolConflict(choice?: IBuildFilePicker[]): Promise<string[]> {
		if (!choice) {
			return [];
		}
		const conflictBuildTypeAndUris = new Map<IBuildTool, Uri[]>();
		const result: string[] = [];
		for (const picker of choice) {
			if (picker.buildTypeAndUri.size > 1) {
				for (const [buildType, uri] of picker.buildTypeAndUri) {
					if (!conflictBuildTypeAndUris.has(buildType)) {
						conflictBuildTypeAndUris.set(buildType, []);
					}
					conflictBuildTypeAndUris.get(buildType)?.push(uri);
				}
			} else {
				result.push(picker.buildTypeAndUri.values().next().value.toString());
			}
		}

		if (conflictBuildTypeAndUris.size > 0) {
			const conflictItems: IConflictItem[] = [];
			for (const buildType of conflictBuildTypeAndUris.keys()) {
				conflictItems.push({
					title: buildType.displayName,
					uris: conflictBuildTypeAndUris.get(buildType),
				});
			}
			conflictItems.sort((a, b) => a.title.localeCompare(b.title));
			conflictItems.push({
				title: "Skip",
				isCloseAffordance: true,
			});

			const choice = await window.showInformationMessage<IConflictItem>(
				"Which build tool would you like to use for the workspace?",
				{
					modal: true,
				},
				...conflictItems
			);

			if (choice?.title !== "Skip" && choice?.uris) {
				result.push(...choice.uris.map(uri => uri.toString()));
			}
		}
		return result;
	}
}

interface IBuildTool {
	displayName: string;
	buildFileNames: string[];
}

interface IConflictItem extends MessageItem {
	uris?: Uri[];
}

interface IBuildFilePicker extends QuickPickItem {
	buildTypeAndUri: Map<IBuildTool, Uri>;
}

export function cleanupProjectPickerCache(context: ExtensionContext) {
	context.workspaceState.update(PICKED_BUILD_FILES, undefined);
}
