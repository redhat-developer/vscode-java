import { DocumentSymbol, DocumentSymbolParams, RequestType } from "vscode-languageclient";

export namespace ExtendedDocumentSymbolsRequest {
	export const type = new RequestType<DocumentSymbolParams, ExtendedDocumentSymbol[], void>('java/extendedDocumentSymbols');
}

export interface ExtendedDocumentSymbol extends DocumentSymbol {
	uri: string;
}