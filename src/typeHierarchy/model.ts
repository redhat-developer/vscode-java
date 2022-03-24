import * as vscode from "vscode";
import { CodeTypeHierarchyItem } from "./protocol";
import { SymbolItemNavigation, SymbolTreeInput, SymbolTreeModel } from "./references-view";
import { getActiveLanguageClient } from "../extension";
import { LanguageClient, Proposed, TypeHierarchySubtypesParams, TypeHierarchySubtypesRequest } from "vscode-languageclient/node";
import { getRootItem, toCodeTypeHierarchyItem } from "./util";
import { CancellationToken, commands } from "vscode";

export class TypeHierarchyTreeInput implements SymbolTreeInput<CodeTypeHierarchyItem> {
	readonly contextValue: string = "javaTypeHierarchy";
	readonly title: string;
	readonly baseItem: CodeTypeHierarchyItem;
	private client: LanguageClient;
	private rootItem: CodeTypeHierarchyItem;

	constructor(readonly location: vscode.Location, readonly token: CancellationToken, item: CodeTypeHierarchyItem) {
		this.baseItem = item;
		const isMethodHierarchy: boolean =  item.data["method"] !== undefined;
		let methodName: string;
		if (isMethodHierarchy) {
			methodName = item.data["method_name"];
		}
		this.title = isMethodHierarchy ? `Method Hierarchy for ${methodName}` : "Class Hierarchy";
	}

	async resolve(): Promise<SymbolTreeModel<CodeTypeHierarchyItem>> {
		if (!this.client) {
			this.client = await getActiveLanguageClient();
		}

		this.rootItem = await getRootItem(this.client, this.baseItem, this.token);
		const model: TypeHierarchyModel = new TypeHierarchyModel(this.rootItem, this.baseItem);
		const provider = new TypeHierarchyTreeDataProvider(model, this.client, this.token);
		const treeModel: SymbolTreeModel<CodeTypeHierarchyItem> = {
			provider: provider,
			message: undefined,
			navigation: model,
			dispose() {
				provider.dispose();
			}
		};
		return treeModel;
	}

	with(location: vscode.Location): TypeHierarchyTreeInput {
		return new TypeHierarchyTreeInput(location, this.token, this.baseItem);
	}
}

export class TypeHierarchyModel implements SymbolItemNavigation<CodeTypeHierarchyItem> {
	public readonly onDidChange = new vscode.EventEmitter<TypeHierarchyModel>();
	public readonly onDidChangeEvent = this.onDidChange.event;

	constructor(private rootItem: CodeTypeHierarchyItem, private baseItem: CodeTypeHierarchyItem) { }

	public getBaseItem(): CodeTypeHierarchyItem {
		return this.baseItem;
	}

	public getRootItem(): CodeTypeHierarchyItem {
		return this.rootItem;
	}

	location(item: CodeTypeHierarchyItem) {
		return new vscode.Location(item.uri, item.range);
	}

	nearest(uri: vscode.Uri, _position: vscode.Position): CodeTypeHierarchyItem | undefined {
		return this.baseItem;
	}

	next(from: CodeTypeHierarchyItem): CodeTypeHierarchyItem {
		return from;
	}

	previous(from: CodeTypeHierarchyItem): CodeTypeHierarchyItem {
		return from;
	}
}

class TypeHierarchyTreeDataProvider implements vscode.TreeDataProvider<CodeTypeHierarchyItem> {
	private readonly emitter = new vscode.EventEmitter<CodeTypeHierarchyItem | undefined>();
	private readonly modelListener: vscode.Disposable;
	public readonly onDidChangeTreeData: vscode.Event<CodeTypeHierarchyItem> = this.emitter.event;

	constructor(readonly model: TypeHierarchyModel, readonly client: LanguageClient, readonly token: CancellationToken) {
		this.modelListener = model.onDidChangeEvent(e => this.emitter.fire(e instanceof CodeTypeHierarchyItem ? e : undefined));
	}

	dispose(): void {
		this.emitter.dispose();
		this.modelListener.dispose();
	}

	async getTreeItem(element: CodeTypeHierarchyItem): Promise<vscode.TreeItem> {
		if (!element) {
			return undefined;
		}
		const treeItem: vscode.TreeItem = (element === this.model.getBaseItem()) ? new vscode.TreeItem({ label: element.name, highlights: [[0, element.name.length]] }) : new vscode.TreeItem(element.name);
		treeItem.contextValue = "java-type-item";
		treeItem.description = element.detail;
		treeItem.iconPath = TypeHierarchyTreeDataProvider.getThemeIcon(element.kind);
		treeItem.command = (element.uri) ? {
			command: 'vscode.open',
			title: 'Open Type Definition Location',
			arguments: [
				element.uri, <vscode.TextDocumentShowOptions>{ selection: element.selectionRange }
			]
		} : undefined;
		// workaround: set a specific id to refresh the collapsible state for treeItems, see: https://github.com/microsoft/vscode/issues/114614#issuecomment-763428052
		treeItem.id = `${element.data["element"]}${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)}`;
		if (element.children) {
			treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
		} else {
			treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
		}
		return treeItem;
	}

	async getChildren(element?: CodeTypeHierarchyItem | undefined): Promise<CodeTypeHierarchyItem[]> {
		if (!element) {
			return [this.model.getRootItem()];
		}
		if (element.children) {
			return element.children;
		}
		const params: TypeHierarchySubtypesParams = {
			item: this.client.code2ProtocolConverter.asTypeHierarchyItem(element),
		};
		const children = await this.client.sendRequest(TypeHierarchySubtypesRequest.type, params, this.token);
		const childrenCodeItems = [];
		for (const child of children) {
			childrenCodeItems.push(toCodeTypeHierarchyItem(this.client, child));
		}
		return childrenCodeItems;
	}

	private static themeIconIds = [
		'symbol-file', 'symbol-module', 'symbol-namespace', 'symbol-package', 'symbol-class', 'symbol-method',
		'symbol-property', 'symbol-field', 'symbol-constructor', 'symbol-enum', 'symbol-interface',
		'symbol-function', 'symbol-variable', 'symbol-constant', 'symbol-string', 'symbol-number', 'symbol-boolean',
		'symbol-array', 'symbol-object', 'symbol-key', 'symbol-null', 'symbol-enum-member', 'symbol-struct',
		'symbol-event', 'symbol-operator', 'symbol-type-parameter'
	];

	private static getThemeIcon(kind: vscode.SymbolKind): vscode.ThemeIcon | undefined {
		const id = TypeHierarchyTreeDataProvider.themeIconIds[kind];
		return id ? new vscode.ThemeIcon(id) : undefined;
	}
}
