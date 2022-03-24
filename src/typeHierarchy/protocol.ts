import * as vscode from "vscode";

export const showTypeHierarchyReferenceViewCommand = "references-view.showTypeHierarchy";
export const showSupertypeHierarchyReferenceViewCommand = "references-view.showSupertypes";
export const showSubtypeHierarchyReferenceViewCommand = "references-view.showSubtypes";

export class CodeTypeHierarchyItem extends vscode.TypeHierarchyItem {
	children?: CodeTypeHierarchyItem[];
	data: any;
}
