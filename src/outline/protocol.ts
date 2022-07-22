import { DocumentSymbol, DocumentSymbolParams, RequestType } from "vscode-languageclient";

export namespace ExtendedDocumentSymbolRequest {
	export const type = new RequestType<DocumentSymbolParams, ExtendedDocumentSymbol[], void>('java/extendedDocumentSymbol');
}

export interface ExtendedDocumentSymbol extends DocumentSymbol {
	uri: string;
	children?: ExtendedDocumentSymbol[];
}