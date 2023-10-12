import { CancellationToken, CodeAction, CodeActionContext, CodeActionKind, CodeActionProvider, Command, ExtensionContext, ProviderResult, Range, Selection, TextDocument, commands } from "vscode";
import { apiManager } from "./apiManager";

const configureStaticImportsCommand = "java.action.configureFavoriteStaticMembers";
const UNDEFINED_METHOD = "67108964";
export class ClientCodeActionProvider implements CodeActionProvider<CodeAction> {
	constructor(readonly context: ExtensionContext) {
		context.subscriptions.push(commands.registerCommand(configureStaticImportsCommand, async () => {
			commands.executeCommand("workbench.action.openSettings", "java.completion.favoriteStaticMembers");
			apiManager.fireTraceEvent({
				name: "java.ls.command",
				properties: {
					command: configureStaticImportsCommand,
				},
			});
		}));
	}

	provideCodeActions(document: TextDocument, range: Range | Selection, context: CodeActionContext, token: CancellationToken): ProviderResult<(CodeAction | Command)[]> {
		const codeActions = [];
		if (context.diagnostics?.some(diagnostic => diagnostic.code === UNDEFINED_METHOD)
			|| document.lineAt(range.start.line)?.text?.startsWith("import ")) {
			const action = new CodeAction("Configure static import...", CodeActionKind.QuickFix);
			action.command = {
				title: "Configure static import...",
				command: configureStaticImportsCommand,
			};
			codeActions.push(action);
		}
		return codeActions;
	}
}
