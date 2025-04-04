import * as vscode from "vscode";
import { TypeHierarchyDirection, TypeHierarchyItem } from "./protocol";
import { SymbolItemNavigation, SymbolTreeInput, SymbolTreeModel } from "./references-view";
import { getActiveLanguageClient } from "../extension";
import { LanguageClient } from "vscode-languageclient/node";
import { getRootItem, resolveTypeHierarchy, typeHierarchyDirectionToContextString } from "./util";
import { CancellationToken, commands, workspace } from "vscode";
import { getThemeIcon } from "../themeUtils";

export class TypeHierarchyTreeInput implements SymbolTreeInput<TypeHierarchyItem> {
	readonly contextValue: string = "javaTypeHierarchy";
	readonly title: string;
	readonly baseItem: TypeHierarchyItem;
	private client: LanguageClient;
	private rootItem: TypeHierarchyItem;

	constructor(readonly location: vscode.Location, readonly direction: TypeHierarchyDirection, readonly token: CancellationToken, item: TypeHierarchyItem) {
		this.baseItem = item;
		const isMethodHierarchy: boolean =  item.data["method"] !== undefined;
		let methodName: string;
		if (isMethodHierarchy) {
			methodName = item.data["method_name"];
		}
		switch (direction) {
			case TypeHierarchyDirection.both:
				this.title = isMethodHierarchy ? `Method Hierarchy for ${methodName}` : "Class Hierarchy";
				break;
			case TypeHierarchyDirection.parents:
				this.title = isMethodHierarchy ? `Supertype (Method) Hierarchy for ${methodName}` : "Supertype Hierarchy";
				break;
			case TypeHierarchyDirection.children:
				this.title = isMethodHierarchy ? `Subtype (Method) Hierarchy for ${methodName}` : "Subtype Hierarchy";
				break;
			default:
				return;
		}

	}

	async resolve(): Promise<SymbolTreeModel<TypeHierarchyItem>> {
		if (!this.client) {
			this.client = await getActiveLanguageClient();
		}
		// workaround: await a second to make sure the success of reveal operation on baseItem, see: https://github.com/microsoft/vscode/issues/114989
		await new Promise<void>((resolve) => setTimeout(() => {
			resolve();
		}, 1000));

		this.rootItem = (this.direction === TypeHierarchyDirection.both) ? await getRootItem(this.client, this.baseItem, this.token) : this.baseItem;
		const model: TypeHierarchyModel = new TypeHierarchyModel(this.rootItem, this.direction, this.baseItem);
		const provider = new TypeHierarchyTreeDataProvider(model, this.client, this.token);
		const treeModel: SymbolTreeModel<TypeHierarchyItem> = {
			provider: provider,
			message: undefined,
			navigation: model,
			dispose() {
				provider.dispose();
			}
		};
		commands.executeCommand('setContext', 'typeHierarchyDirection', typeHierarchyDirectionToContextString(this.direction));
		commands.executeCommand('setContext', 'typeHierarchySymbolKind', this.baseItem.kind);
		return treeModel;
	}

	with(location: vscode.Location): TypeHierarchyTreeInput {
		return new TypeHierarchyTreeInput(location, this.direction, this.token, this.baseItem);
	}
}

export class TypeHierarchyModel implements SymbolItemNavigation<TypeHierarchyItem> {
	public readonly onDidChange = new vscode.EventEmitter<TypeHierarchyModel>();
	public readonly onDidChangeEvent = this.onDidChange.event;

	constructor(private rootItem: TypeHierarchyItem, private direction: TypeHierarchyDirection, private baseItem: TypeHierarchyItem) { }

	public getBaseItem(): TypeHierarchyItem {
		return this.baseItem;
	}

	public getDirection(): TypeHierarchyDirection {
		return this.direction;
	}

	public getRootItem(): TypeHierarchyItem {
		return this.rootItem;
	}

	location(item: TypeHierarchyItem) {
		return new vscode.Location(vscode.Uri.parse(item.uri), item.range);
	}

	nearest(uri: vscode.Uri, _position: vscode.Position): TypeHierarchyItem | undefined {
		return this.baseItem;
	}

	next(from: TypeHierarchyItem): TypeHierarchyItem {
		return from;
	}

	previous(from: TypeHierarchyItem): TypeHierarchyItem {
		return from;
	}
}

class TypeHierarchyTreeDataProvider implements vscode.TreeDataProvider<TypeHierarchyItem> {
	private readonly emitter: vscode.EventEmitter<TypeHierarchyItem> = new vscode.EventEmitter<TypeHierarchyItem>();
	private readonly modelListener: vscode.Disposable;
	private lazyLoad: boolean;
	public readonly onDidChangeTreeData: vscode.Event<TypeHierarchyItem> = this.emitter.event;

	constructor(readonly model: TypeHierarchyModel, readonly client: LanguageClient, readonly token: CancellationToken) {
		this.modelListener = model.onDidChangeEvent(e => this.emitter.fire(e instanceof TypeHierarchyItem ? e : undefined));
		this.lazyLoad = workspace.getConfiguration().get("java.typeHierarchy.lazyLoad");
	}

	dispose(): void {
		this.emitter.dispose();
		this.modelListener.dispose();
	}

	async getTreeItem(element: TypeHierarchyItem): Promise<vscode.TreeItem> {
		if (!element) {
			return undefined;
		}
		const treeItem: vscode.TreeItem = (element === this.model.getBaseItem()) ? new vscode.TreeItem({ label: element.name, highlights: [[0, element.name.length]] }) : new vscode.TreeItem(element.name);
		treeItem.contextValue = (element === this.model.getBaseItem() || !element.uri) ? "false" : "true";
		treeItem.description = element.detail;
		treeItem.iconPath = getThemeIcon(element.kind);
		treeItem.command = (element.uri) ? {
			command: 'vscode.open',
			title: 'Open Type Definition Location',
			arguments: [
				vscode.Uri.parse(element.uri), <vscode.TextDocumentShowOptions>{ selection: element.selectionRange }
			]
		} : undefined;
		// workaround: set a specific id to refresh the collapsible state for treeItems, see: https://github.com/microsoft/vscode/issues/114614#issuecomment-763428052
		treeItem.id = `${element.data["element"]}${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)}`;
		if (element.expand) {
			treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
		} else if (this.model.getDirection() === TypeHierarchyDirection.children || this.model.getDirection() === TypeHierarchyDirection.both) {
			// For an unresolved baseItem, will make it collapsed to show it early. It will be automatically expanded by model.nearest()
			if (element === this.model.getBaseItem()) {
				if (!element.children) {
					treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
				} else if (element.children.length === 0) {
					treeItem.collapsibleState = vscode.TreeItemCollapsibleState.None;
				} else {
					treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
				}
			} else {
				if (!element.children) {
					if (this.lazyLoad) {
						treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
						return treeItem;
					}
					const resolvedItem = await resolveTypeHierarchy(this.client, element, this.model.getDirection(), this.token);
					if (!resolvedItem) {
						return undefined;
					}
					element.children = resolvedItem.children;
				}
				treeItem.collapsibleState = (element.children.length === 0) ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Collapsed;
			}
		} else if (this.model.getDirection() === TypeHierarchyDirection.parents) {
			if (element === this.model.getBaseItem()) {
				if (!element.parents) {
					treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
				} else if (element.parents.length === 0) {
					treeItem.collapsibleState = vscode.TreeItemCollapsibleState.None;
				} else {
					treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
				}
			} else {
				if (!element.parents) {
					if (this.lazyLoad) {
						treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
						return treeItem;
					}
					const resolvedItem = await resolveTypeHierarchy(this.client, element, this.model.getDirection(), this.token);
					if (!resolvedItem) {
						return undefined;
					}
					element.parents = resolvedItem.parents;
				}
				treeItem.collapsibleState = (element.parents.length === 0) ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Collapsed;
			}
		}
		return treeItem;
	}

	async getChildren(element?: TypeHierarchyItem | undefined): Promise<TypeHierarchyItem[]> {
		if (!element) {
			return [this.model.getRootItem()];
		}
		if (this.model.getDirection() === TypeHierarchyDirection.children || this.model.getDirection() === TypeHierarchyDirection.both) {
			if (!element.children) {
				if (TypeHierarchyTreeDataProvider.isAllowedType(element)) {
					return [TypeHierarchyTreeDataProvider.getFakeItem(element)];
				}
				const resolvedItem = await resolveTypeHierarchy(this.client, element, this.model.getDirection(), this.token);
				if (!resolvedItem) {
					return undefined;
				}
				element.children = resolvedItem.children;
				if (element.children.length === 0) {
					this.emitter.fire(element);
				}
			}
			return element.children;
		} else if (this.model.getDirection() === TypeHierarchyDirection.parents) {
			if (!element.parents) {
				const resolvedItem = await resolveTypeHierarchy(this.client, element, this.model.getDirection(), this.token);
				if (!resolvedItem) {
					return undefined;
				}
				element.parents = resolvedItem.parents;
				if (element.parents.length === 0) {
					this.emitter.fire(element);
				}
			}
			return element.parents;
		}
		return undefined;
	}

	private static isAllowedType(item: TypeHierarchyItem): boolean {
		if (item.name === "Object" && item.detail === "java.lang") {
			return true;
		}
		return false;
	}

	private static getFakeItem(item: TypeHierarchyItem): TypeHierarchyItem {
		let message: string;
		if (item.name === "Object" && item.detail === "java.lang") {
			message = "All classes are subtypes of java.lang.Object.";
		}
		return {
			name: message,
			kind: undefined,
			children: [],
			parents: [],
			detail: undefined,
			uri: undefined,
			range: undefined,
			selectionRange: undefined,
			data: undefined,
			deprecated: false,
			expand: false,
		};
	}
}
