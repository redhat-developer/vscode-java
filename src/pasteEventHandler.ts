import { CancellationToken, commands, DataTransfer, DocumentPasteEdit, DocumentPasteEditProvider, DocumentPasteProviderMetadata, DocumentSelector, EndOfLine, ExtensionContext, languages, Range, TextDocument, TextEditor, window, WorkspaceEdit } from "vscode";
import { LanguageClient } from "vscode-languageclient/node";
import { Commands } from "./commands";
import { JAVA_SELECTOR } from "./standardLanguageClient";

const TEXT_MIMETYPE: string = "text/plain";

const MIMETYPES: DocumentPasteProviderMetadata = {
	pasteMimeTypes: [TEXT_MIMETYPE]
};

class StringPasteEditProvider implements DocumentPasteEditProvider {

	private client: LanguageClient;
	private copiedDocumentUri: string | undefined;
	private copiedContent: string | undefined;

	constructor(client: LanguageClient) {
		this.client = client;
	}

	async prepareDocumentPaste(document: TextDocument, _ranges: readonly Range[], dataTransfer: DataTransfer, _token: CancellationToken): Promise<void> {
		const copiedContent: string = await dataTransfer.get(TEXT_MIMETYPE).asString();
		if (copiedContent) {
			this.copiedContent = copiedContent;
			this.copiedDocumentUri = document.uri.toString();
		}
	}

	async provideDocumentPasteEdits(document: TextDocument, ranges: readonly Range[], dataTransfer: DataTransfer, _token: CancellationToken): Promise<DocumentPasteEdit> {
		const insertContent: string = await dataTransfer.get(TEXT_MIMETYPE).asString();
		if (!insertContent) {
			return new DocumentPasteEdit("");
		}
		const documentPasteEdit = new DocumentPasteEdit(insertContent);
		const workspaceEdit = await commands.executeCommand(Commands.EXECUTE_WORKSPACE_COMMAND, Commands.ADD_IMPORTS_PASTE, document.uri.toString(), JSON.stringify(this.client.code2ProtocolConverter.asRange(ranges[0])), insertContent, this.copiedContent === insertContent ? this.copiedDocumentUri : null);
		if (workspaceEdit) {
			documentPasteEdit.additionalEdit = this.client.protocol2CodeConverter.asWorkspaceEdit(workspaceEdit);
		}
		return documentPasteEdit;
	}

}

export function registerPasteEventHandler(context: ExtensionContext, client: LanguageClient) {
	if (languages["registerDocumentPasteEditProvider"]){
		context.subscriptions.push(languages["registerDocumentPasteEditProvider"](JAVA_SELECTOR, new StringPasteEditProvider(client), MIMETYPES));
	}
}
