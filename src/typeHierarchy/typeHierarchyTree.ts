import * as vscode from "vscode";
import { Position, Proposed, TextDocumentIdentifier, TextDocumentPositionParams, TypeHierarchyItem, TypeHierarchyPrepareRequest } from "vscode-languageclient";
import { LanguageClient } from "vscode-languageclient/node";
import { getActiveLanguageClient } from "../extension";
import { showNoLocationFound } from "../standardLanguageClient";
import { TypeHierarchyTreeInput } from "./model";
import { CodeTypeHierarchyItem } from "./protocol";
import { SymbolTree, SymbolTreeInput } from "./references-view";
import { toCodeTypeHierarchyItem } from "./util";

export class TypeHierarchyTree {
	private api: SymbolTree;
	private client: LanguageClient;
	private cancelTokenSource: vscode.CancellationTokenSource;
	private anchor: vscode.Location;
	public initialized: boolean;

	constructor() {
		this.initialized = false;
	}

	public async initialize() {
		// It uses a new publisher id in June 2022 Update, check both old/new id for compatibility
		// See https://github.com/microsoft/vscode/pull/152213
		const referencesViewExt = vscode.extensions.getExtension<SymbolTree>('vscode.references-view')
			?? vscode.extensions.getExtension<SymbolTree>('ms-vscode.references-view');
		this.api = await referencesViewExt?.activate();
		this.client = await getActiveLanguageClient();
		this.initialized = true;
	}

	public async setTypeHierarchy(location: vscode.Location): Promise<void> {
		if (!this.initialized) {
			await this.initialize();
		}
		if (!this.api) {
			return;
		}
		if (!this.isValidRequestPosition(location.uri, location.range.start)) {
			return;
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
		let protocolItems: TypeHierarchyItem[];
		try {
			protocolItems = await this.client.sendRequest(TypeHierarchyPrepareRequest.type, params, this.cancelTokenSource.token);
		} catch (e) {
			// operation cancelled
			return;
		}
		if (!protocolItems || protocolItems.length === 0) {
			throw new Error("No Class Hierarchy found");
		}
		const protocolItem = protocolItems[0];
		const symbolKind = this.client.protocol2CodeConverter.asSymbolKind(protocolItem.kind);
		if (symbolKind === vscode.SymbolKind.Interface) {
			throw new Error("Class Hierarchy is not available for interfaces");
		}
		const item: CodeTypeHierarchyItem = toCodeTypeHierarchyItem(this.client, protocolItem);
		const input: TypeHierarchyTreeInput = new TypeHierarchyTreeInput(location, this.cancelTokenSource.token, item);
		this.anchor = input.location;
		this.api.setInput(input);
	}

	public async setTypeHierarchyFromReferenceView(): Promise<void> {
		if (!this.initialized) {
			await this.initialize();
		}
		if (!this.api) {
			return;
		}
		const treeInput: SymbolTreeInput<unknown> = this.api.getInput();
		if (!treeInput) {
			return;
		}
		const location = treeInput.location;
		if (location) {
			await this.setTypeHierarchy(location);
		}
	}

	public getAnchor(): vscode.Location | undefined {
		return this.anchor;
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
