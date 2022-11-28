import { LanguageClient } from "vscode-languageclient/node";
import { SymbolTree } from "../typeHierarchy/references-view";
import * as vscode from "vscode";
import { getActiveLanguageClient } from "../extension";
import { ExtendedOutlineTreeInput } from "./model";

export class ExtendedOutlineTree {
	private api: SymbolTree;
	private client: LanguageClient;
	public initialized: boolean;

	constructor() {
		this.initialized = false;
	}

	async initialize() {
		// It uses a new publisher id in June 2022 Update, check both old/new id for compatibility
		// See https://github.com/microsoft/vscode/pull/152213
		const referencesViewExt = vscode.extensions.getExtension<SymbolTree>('vscode.references-view')
			?? vscode.extensions.getExtension<SymbolTree>('ms-vscode.references-view');
		this.api = await referencesViewExt?.activate();
		this.client = await getActiveLanguageClient();
		this.initialized = true;
	}

	async open(uri: vscode.Uri) {
		if (!this.initialized) {
			await this.initialize();
		}

		if (!this.api) {
			return;
		}
		const input: ExtendedOutlineTreeInput = new ExtendedOutlineTreeInput(new vscode.Location(uri, new vscode.Position(0, 0)));
		this.api.setInput(input);
	}
}

export const extendedOutlineTree: ExtendedOutlineTree = new ExtendedOutlineTree();