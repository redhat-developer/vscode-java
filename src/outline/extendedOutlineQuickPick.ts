import { DocumentSymbolParams, LanguageClient, TextDocumentIdentifier } from "vscode-languageclient/node";
import { getActiveLanguageClient } from "../extension";
import { ExtendedDocumentSymbolRequest } from "./protocol";
import { Location, Position, QuickPick, QuickPickItem, Uri, window, workspace } from "vscode";
import { getLThemeIcon } from "../themeUtils";

export class ExtendedOutlineQuickPick {
	private api: QuickPick<QuickPickItem>;
	private client: LanguageClient;
	public initialized: boolean;

	constructor() {
		this.initialized = false;
	}

	async initialize() {
		this.api = window.createQuickPick();
		this.api.ignoreFocusOut = true;
		this.api.onDidChangeActive((items: QuickPickItem[]) => {
			if (items.length > 0) {
				const active: QuickPickItem = items[0];
				const uri = active["uri"];
				const range = active["range"];
				if (uri !== undefined) {
					workspace.openTextDocument(Uri.parse(uri)).then(doc => {
						window.showTextDocument(doc, {preserveFocus: true, selection: range});
					});
				} else {
					window.showTextDocument(window.activeTextEditor.document, {preserveFocus: true, selection: range});
				}
			}
		});
		this.api.onDidAccept(() => {
			this.api.hide();
		});
		this.client = await getActiveLanguageClient();
		this.initialized = true;
	}

	async open(uri: Uri) {
		if (!this.initialized) {
			await this.initialize();
		}

		if (!this.api) {
			return;
		}

		const location = new Location(uri, new Position(0, 0));
		const params: DocumentSymbolParams = {
			textDocument: TextDocumentIdentifier.create(location.uri.toString())
		};
		const symbols = await this.client.sendRequest(ExtendedDocumentSymbolRequest.type, params);
		let quickPickItems: QuickPickItem[] = [];
		for (const s of symbols) {
			const icon = getLThemeIcon(s.kind).id;
			const item = {
				label: `$(${icon}) ${s.name}`,
				description: s.detail.trim(),
				uri: s.uri,
				range: s.range
			};
			quickPickItems.push(item);
			if (icon === 'symbol-class') {
				const items: QuickPickItem[] = s.children.map(s => ({
					label: `$(${getLThemeIcon(s.kind).id}) ${s.name}`,
					// custom quick pick has automatic space between label & description
					description: s.detail.trim(),
					uri: s.uri,
					range: s.range
				}));
				quickPickItems = quickPickItems.concat(items);
			}
		}
		this.api.items = quickPickItems;
		this.api.activeItems = [];
		this.api.show();
	}
}

export const extendedOutlineQuickPick: ExtendedOutlineQuickPick = new ExtendedOutlineQuickPick();
