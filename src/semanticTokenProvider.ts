import * as vscode from 'vscode';
import { Commands } from './commands';
import { getJavaConfiguration, waitForDocumentChangesToEnd } from './utils';

export function registerSemanticTokensProvider(context: vscode.ExtensionContext): void {
	if (!vscode.languages.registerDocumentSemanticTokensProvider) { // in case Theia doesn't support this API
		return;
	}

	context.subscriptions.push(semanticTokensProvider);
	context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((e) => {
		if (e.affectsConfiguration('java.semanticHighlighting.enabled')) {
			if (isSemanticHighlightingEnabled()) {
				semanticTokensProvider.enable();
			}
			else {
				semanticTokensProvider.disable();
			}
		}
	}));

	if (isSemanticHighlightingEnabled()) {
		semanticTokensProvider.enable();
	}
}

function isSemanticHighlightingEnabled(): boolean {
	const config = getJavaConfiguration();
	const section = 'semanticHighlighting.enabled';
	return config.get(section);
}

class SemanticTokensProvider implements vscode.DocumentSemanticTokensProvider, vscode.Disposable {

	private disposable?: vscode.Disposable;
	private tokensChangedEmitter?: vscode.EventEmitter<void>;
	private shouldClearTokens: boolean = false;

	public get onDidChangeSemanticTokens(): vscode.Event<void> {
		return this.tokensChangedEmitter?.event;
	}

	public async provideDocumentSemanticTokens(document: vscode.TextDocument, token: vscode.CancellationToken): Promise<vscode.SemanticTokens> {
		if (this.shouldClearTokens) {
			// We can return early here to skip the request, but just to be
			// safe we should also check this case after requesting tokens,
			// in case the provider was disbled during the request itself.
			this.disable(true);
			return undefined;
		}

		const versionBeforeRequest: number = document.version;
		const response = <any> await vscode.commands.executeCommand(Commands.EXECUTE_WORKSPACE_COMMAND, Commands.PROVIDE_SEMANTIC_TOKENS, document.uri.toString());
		const versionAfterRequest: number = document.version;

		if (this.shouldClearTokens) {
			this.disable(true);
			return undefined;
		}
		if (versionBeforeRequest !== versionAfterRequest) {
			await waitForDocumentChangesToEnd(document);
			throw new Error("busy");
		}
		if (token.isCancellationRequested) {
			return undefined;
		}
		if (!response || !response.data) {
			return undefined;
		}
		return new vscode.SemanticTokens(new Uint32Array(response.data), response.resultId);
	}

	public async enable(): Promise<void> {
		this.shouldClearTokens = false;
		this.tokensChangedEmitter = new vscode.EventEmitter();
		this.disposable = vscode.languages.registerDocumentSemanticTokensProvider(
			[
				{ language: 'java', scheme: 'file' },
				{ language: 'java', scheme: 'jdt' }
			],
			this,
			await this.getSemanticTokensLegend()
		);
	}

	public disable(tokensAreCleared?: boolean): void {
		if (tokensAreCleared) {
			this.disposable?.dispose();
			this.tokensChangedEmitter?.dispose();
		}
		else {
			this.shouldClearTokens = true;
			this.tokensChangedEmitter?.fire();
		}
	}

	public dispose(): void {
		this.disable();
	}

	private async getSemanticTokensLegend(): Promise<vscode.SemanticTokensLegend | undefined> {
		const response = await vscode.commands.executeCommand(Commands.EXECUTE_WORKSPACE_COMMAND, Commands.GET_SEMANTIC_TOKENS_LEGEND) as vscode.SemanticTokensLegend;
		if (response && response.tokenModifiers !== undefined && response.tokenTypes !== undefined) {
			return new vscode.SemanticTokensLegend(response.tokenTypes, response.tokenModifiers);
		}
		return undefined;
	}

}

const semanticTokensProvider = new SemanticTokensProvider();
