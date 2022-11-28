import { Event, Location, Position, ProviderResult, Range, TextDocumentShowOptions, TreeDataProvider, TreeItem, TreeItemCollapsibleState, Uri } from "vscode";
import { DocumentSymbolParams, LanguageClient, TextDocumentIdentifier } from "vscode-languageclient/node";
import { getActiveLanguageClient } from "../extension";
import { getThemeIcon } from "../themeUtils";
import { SymbolItemNavigation, SymbolTreeInput, SymbolTreeModel } from "../typeHierarchy/references-view";
import { ExtendedDocumentSymbol, ExtendedDocumentSymbolsRequest } from "./protocol";

export class ExtendedOutlineTreeInput implements SymbolTreeInput<ExtendedDocumentSymbol> {
	readonly contextValue: string = "javaExtendedOutline";
	readonly title: string = "Extended Outline";
	client: LanguageClient;

	constructor(readonly location: Location) {
	}

	async resolve(): Promise<SymbolTreeModel<ExtendedDocumentSymbol>> {
		if (!this.client) {
			this.client = await getActiveLanguageClient();
		}

		const params: DocumentSymbolParams = {
			textDocument: TextDocumentIdentifier.create(this.location.uri.toString())
		};
		const symbols = await this.client.sendRequest(ExtendedDocumentSymbolsRequest.type, params);
		const treeModel: SymbolTreeModel<ExtendedDocumentSymbol> = {
			provider: new ExtendedOutlineProvider(symbols, this.client),
			message: undefined,
			navigation: new ExtendedOutlineModel()
		};
		return Promise.resolve(treeModel);
	}

	with(location: Location): SymbolTreeInput<ExtendedDocumentSymbol> {
		return new ExtendedOutlineTreeInput(location);
	}
}

export class ExtendedOutlineModel implements SymbolItemNavigation<ExtendedDocumentSymbol> {
	nearest(_uri: Uri, _position: Position): ExtendedDocumentSymbol | undefined {
		return undefined;
	}

	next(from: ExtendedDocumentSymbol): ExtendedDocumentSymbol {
		return from;
	}
	previous(from: ExtendedDocumentSymbol): ExtendedDocumentSymbol {
		return from;
	}
	location(item: ExtendedDocumentSymbol): Location {
		return new Location(Uri.parse(item.uri), new Range(new Position(item.range.start.line, item.range.start.character),
			new Position(item.range.end.line, item.range.end.character)));
	}

}

class ExtendedOutlineProvider implements TreeDataProvider<ExtendedDocumentSymbol> {
	onDidChangeTreeData?: Event<void | ExtendedDocumentSymbol>;

	constructor(readonly symbols: ExtendedDocumentSymbol[], readonly client: LanguageClient) { }

	getTreeItem(element: ExtendedDocumentSymbol): TreeItem | Thenable<TreeItem> {
		let state = TreeItemCollapsibleState.None;
		if (element.children !== undefined && element.children.length > 0) {
			state = TreeItemCollapsibleState.Collapsed;
		}

		const item: TreeItem = new TreeItem(element.name, state);
		item.description = element.detail;
		item.iconPath = getThemeIcon(element.kind - 1);
		item.command = (element.uri) ? {
			command: 'vscode.open',
			title: 'Open Symbol Definition Location',
			arguments: [
				element.uri, <TextDocumentShowOptions>{ selection: element.selectionRange }
			]
		} : undefined;
		return item;
	}

	getChildren(element?: ExtendedDocumentSymbol): ProviderResult<ExtendedDocumentSymbol[]> {
		if (element === undefined) {
			return Promise.resolve(this.symbols);
		} else {
			if (element.children !== undefined) {
				return Promise.resolve(element.children as ExtendedDocumentSymbol[]);
			}
		}
		return undefined;
	}

	getParent?(_element: ExtendedDocumentSymbol): ProviderResult<ExtendedDocumentSymbol> {
		return undefined;
	}
}