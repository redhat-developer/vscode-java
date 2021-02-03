import * as vscode from "vscode";
import { LanguageClient, Position, TextDocumentIdentifier, TextDocumentPositionParams } from "vscode-languageclient";
import { Commands } from "../commands";
import { getActiveLanguageClient } from "../extension";
import { showNoLocationFound } from "../standardLanguageClient";
import { TypeHierarchyTreeInput } from "./model";
import { LSPTypeHierarchyItem, TypeHierarchyDirection, TypeHierarchyItem } from "./protocol";
import { SymbolTree } from "./references-view";
import { ToTypeHierarchyItem } from "./util";

export class TypeHierarchyTree {
	private api: SymbolTree;
	private direction: TypeHierarchyDirection;
	private client: LanguageClient;
	private cancelTokenSource: vscode.CancellationTokenSource;
	private location: vscode.Location;
	private baseItem: TypeHierarchyItem;
	public initialized: boolean;

	constructor() {
		this.initialized = false;
	}

	public async initialize() {
		this.api = await vscode.extensions.getExtension<SymbolTree>('ms-vscode.references-view').activate();
		this.client = await getActiveLanguageClient();
		this.initialized = true;
	}

	public async setTypeHierarchy(location: vscode.Location, direction: TypeHierarchyDirection): Promise<void> {
		if (!this.initialized) {
			await this.initialize();
		}
		if (this.cancelTokenSource) {
			this.cancelTokenSource.cancel();
		}
		this.cancelTokenSource = new vscode.CancellationTokenSource();
		const textDocument: TextDocumentIdentifier = TextDocumentIdentifier.create(location.uri.toString());
		const position: Position = Position.create(location.range.start.line, location.range.start.character);
		const params: TextDocumentPositionParams = {
			textDocument: textDocument,
			position: position,
		};
		let lspItem: LSPTypeHierarchyItem;
		try {
			lspItem = await vscode.commands.executeCommand(Commands.EXECUTE_WORKSPACE_COMMAND, Commands.OPEN_TYPE_HIERARCHY, JSON.stringify(params), JSON.stringify(direction), JSON.stringify(0), this.cancelTokenSource.token);
		} catch (e) {
			// operation cancelled
			return;
		}
		if (!lspItem) {
			showNoLocationFound('No Type Hierarchy found');
			return;
		}
		const symbolKind = this.client.protocol2CodeConverter.asSymbolKind(lspItem.kind);
		if (direction === TypeHierarchyDirection.Both && symbolKind === vscode.SymbolKind.Interface) {
			direction = TypeHierarchyDirection.Children;
		}
		const item: TypeHierarchyItem = ToTypeHierarchyItem(this.client, lspItem, direction);
		const input: TypeHierarchyTreeInput = new TypeHierarchyTreeInput(location, direction, this.cancelTokenSource.token, item);
		this.location = location;
		this.direction = direction;
		this.baseItem = item;
		this.api.setInput(input);
	}

	public changeDirection(direction: TypeHierarchyDirection): void {
		if (this.cancelTokenSource) {
			this.cancelTokenSource.cancel();
		}
		this.cancelTokenSource = new vscode.CancellationTokenSource();
		this.baseItem.children = undefined;
		this.baseItem.parents = undefined;
		const input: TypeHierarchyTreeInput = new TypeHierarchyTreeInput(this.location, direction, this.cancelTokenSource.token, this.baseItem);
		this.direction = direction;
		this.api.setInput(input);
	}

	public async changeBaseItem(item: TypeHierarchyItem): Promise<void> {
		if (this.cancelTokenSource) {
			this.cancelTokenSource.cancel();
		}
		this.cancelTokenSource = new vscode.CancellationTokenSource();
		item.parents = undefined;
		item.children = undefined;
		const location: vscode.Location = new vscode.Location(vscode.Uri.parse(item.uri), item.selectionRange);
		const newLocation: vscode.Location = (await this.isValidRequestPosition(location.uri, location.range.start)) ? location : this.location;
		const input: TypeHierarchyTreeInput = new TypeHierarchyTreeInput(newLocation, this.direction, this.cancelTokenSource.token, item);
		this.location = newLocation;
		this.baseItem = item;
		this.api.setInput(input);
	}

	private async isValidRequestPosition(uri: vscode.Uri, position: vscode.Position) {
		const doc = await vscode.workspace.openTextDocument(uri);
		let range = doc.getWordRangeAtPosition(position);
		if (!range) {
			range = doc.getWordRangeAtPosition(position, /[^\s]+/);
		}
		return Boolean(range);
	}
}

export const typeHierarchyTree: TypeHierarchyTree = new TypeHierarchyTree();
