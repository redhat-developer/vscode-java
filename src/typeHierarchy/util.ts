import { CancellationToken, SymbolKind } from "vscode";
import { LanguageClient, TypeHierarchyItem, TypeHierarchySupertypesRequest } from "vscode-languageclient/node";
import { CodeTypeHierarchyItem } from "./protocol";

export function toCodeTypeHierarchyItem(client: LanguageClient, item: TypeHierarchyItem): CodeTypeHierarchyItem {
	if (!item) {
		return undefined;
	}
	const codeItem = client.protocol2CodeConverter.asTypeHierarchyItem(item);
	return codeItem as CodeTypeHierarchyItem;
}

export async function getRootItem(client: LanguageClient, typeHierarchyItem: CodeTypeHierarchyItem, token: CancellationToken): Promise<CodeTypeHierarchyItem> {
	if (!typeHierarchyItem) {
		return undefined;
	}
	const supertypeItems = await client.sendRequest(TypeHierarchySupertypesRequest.type, {
		item: client.code2ProtocolConverter.asTypeHierarchyItem(typeHierarchyItem)
	}, token);
	if (supertypeItems.length === 0) {
		return typeHierarchyItem;
	} else {
		for (const supertypeItem of supertypeItems) {
			const symbolKind = client.protocol2CodeConverter.asSymbolKind(supertypeItem.kind);
			if (symbolKind === SymbolKind.Class || symbolKind === SymbolKind.Null) {
				const codeItem = toCodeTypeHierarchyItem(client, supertypeItem);
				codeItem.children = [typeHierarchyItem];
				return getRootItem(client, codeItem, token);
			}
		}
		return typeHierarchyItem;
	}
}
