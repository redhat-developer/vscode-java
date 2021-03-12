import * as vscode from "vscode";
import { Range, SymbolKind } from "vscode-languageclient";

export enum TypeHierarchyDirection {
	Children,
	Parents,
	Both
}

export class LSPTypeHierarchyItem {
	name: string;
	detail: string;
	kind: SymbolKind;
	deprecated: boolean;
	uri: string;
	range: Range;
	selectionRange: Range;
	parents: LSPTypeHierarchyItem[];
	children: LSPTypeHierarchyItem[];
	data: any;
}

export class TypeHierarchyItem {
	name: string;
	detail: string;
	kind: vscode.SymbolKind;
	deprecated: boolean;
	uri: string;
	range: vscode.Range;
	selectionRange: vscode.Range;
	parents: TypeHierarchyItem[];
	children: TypeHierarchyItem[];
	data: any;
	expand: boolean;
}
