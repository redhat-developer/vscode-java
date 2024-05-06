import { CancellationToken, commands, DataTransfer, DocumentPasteEdit as VDocumentPasteEdit, DocumentPasteEditProvider, DocumentPasteProviderMetadata, ExtensionContext, languages, Range, TextDocument, window, DocumentPasteEditContext, ProviderResult, DocumentPasteEdit, version } from "vscode";
import { FormattingOptions, Location, WorkspaceEdit as PWorkspaceEdit } from "vscode-languageclient";
import { LanguageClient } from "vscode-languageclient/node";
import { Commands } from "./commands";
import { JAVA_SELECTOR } from "./standardLanguageClient";
import * as semver from 'semver';

const TEXT_MIMETYPE: string = "text/plain";
const MIMETYPES: DocumentPasteProviderMetadata = {
	pasteMimeTypes: [TEXT_MIMETYPE],
	providedPasteEditKinds: []
};

/**
 * Parameters for `Commands.HANDLE_PASTE_EVENT`
 */
interface PasteEventParams {
	location: Location;
	text: string;
	formattingOptions: FormattingOptions;
	copiedDocumentUri?: string;
}

/**
 * Response from jdt.ls for `Commands.HANDLE_PASTE_EVENT` that's similar, but not identical, to VS Code's paste edit.
 *
 * @see VDocumentPasteEdit
 */
interface PDocumentPasteEdit {
	insertText: string;
	additionalEdit: PWorkspaceEdit;
}

/**
 * Registers the vscode-java DocumentPasteEditProviders and sets them up to be disposed.
 *
 * @param context the extension context
 */
export function registerPasteEventHandler(context: ExtensionContext, languageClient: LanguageClient) {
	if (languages["registerDocumentPasteEditProvider"]) {
		context.subscriptions.push(languages["registerDocumentPasteEditProvider"](JAVA_SELECTOR, new PasteEditProvider(languageClient), MIMETYPES));
	}
}

/**
 * `DocumentPasteEditProvider` that delegates to jdt.ls to make any changes necessary to the pasted text and add any additional workspace edits.
 */
class PasteEditProvider implements DocumentPasteEditProvider {

	private languageClient: LanguageClient;
	private copiedContent: string | undefined;
	private copiedDocumentUri: string | undefined;

	constructor(languageClient: LanguageClient) {
		this.languageClient = languageClient;
	}

	async prepareDocumentPaste?(document: TextDocument, _ranges: readonly Range[], dataTransfer: DataTransfer, _token: CancellationToken): Promise<void> {
		const copiedContent: string = await dataTransfer.get(TEXT_MIMETYPE).asString();
		if (copiedContent) {
			this.copiedDocumentUri = document.uri.toString();
			this.copiedContent = copiedContent;
		}
	}

	async provideDocumentPasteEdits?(document: TextDocument, ranges: readonly Range[], dataTransfer: DataTransfer, context: DocumentPasteEditContext, token: CancellationToken): Promise<any> {


		const insertText: string = await dataTransfer.get(TEXT_MIMETYPE).asString();

		// don't try to provide for multi character inserts; the implementation will get messy and the feature won't be that helpful
		if (!insertText || (!!token && token.isCancellationRequested) || ranges.length !== 1) {
			return null;
		}

		const range = ranges[0];

		const location: Location = {
			range: this.languageClient.code2ProtocolConverter.asRange(range),
			uri: document.uri.toString(),
		};

		const activeTextEditor = window.activeTextEditor;

		const pasteEventParams: PasteEventParams = {
			location: location,
			text: insertText,
			copiedDocumentUri: this.copiedContent === insertText ? this.copiedDocumentUri : undefined,
			formattingOptions: {
				insertSpaces: <boolean>activeTextEditor.options.insertSpaces,
				tabSize: <number>activeTextEditor.options.tabSize
			}
		};

		try {
			const pasteResponse: PDocumentPasteEdit = await commands.executeCommand(Commands.EXECUTE_WORKSPACE_COMMAND, Commands.HANDLE_PASTE_EVENT, JSON.stringify(pasteEventParams));
			if (pasteResponse) {
				const pasteEdit = {
					insertText: pasteResponse.insertText,
					additionalEdit: pasteResponse.additionalEdit ? await this.languageClient.protocol2CodeConverter.asWorkspaceEdit(pasteResponse.additionalEdit) : undefined
				};
				if (semver.lt(version, '1.88.0')) {
					return pasteEdit as DocumentPasteEdit;
				} else {
					return [ pasteEdit ] as DocumentPasteEdit[];
				}
			}
		} catch (e) {
			// Do nothing
		}
		// either the handler returns null or encounters problems, fall back to return undefined to let VS Code ignore this handler
		return undefined;
	}

}
