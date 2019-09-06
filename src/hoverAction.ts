'use strict';

import { commands, ExtensionContext, HoverProvider, languages, CancellationToken, Hover, Position, TextDocument, MarkdownString, window, Uri, MarkedString, Command} from "vscode";
import { LanguageClient, TextDocumentPositionParams, HoverRequest } from "vscode-languageclient";
import { MethodOverride } from "./protocol";
import { registerHoverCommand, provideHoverCommandFn } from "./extension.api";
import { logger } from "./log";

const NAVIGATE_TO_OVERRIDE_COMMAND = 'java.action.navigateToOverride';

export function registerClientHoverProvider(languageClient: LanguageClient, context: ExtensionContext): registerHoverCommand {
    const hoverProvider: JavaHoverProvider = new JavaHoverProvider(languageClient);
    hoverProvider.registerHoverCommand(async (params: TextDocumentPositionParams, token: CancellationToken) => {
        return await provideOverrideHoverCommand(languageClient, params, token);
    });
    context.subscriptions.push(languages.registerHoverProvider('java', hoverProvider));
    context.subscriptions.push(commands.registerCommand(NAVIGATE_TO_OVERRIDE_COMMAND, (location: any) => {
        navigateToOverride(languageClient, location);
    }));
    context.subscriptions.push()

    return hoverProvider.registerHoverCommand;
}

async function provideOverrideHoverCommand(languageClient: LanguageClient, params: TextDocumentPositionParams, token: CancellationToken): Promise<Command[] | undefined> {
    const response = await languageClient.sendRequest(MethodOverride.type, params, token);
    if (response && response.length) {
        const location = response[0];
        return [{
            title: 'Go To Override',
            command: NAVIGATE_TO_OVERRIDE_COMMAND,
            tooltip: `Go to override method '${location.declaringTypeName}.${location.methodName}'`,
            arguments: [ location ],
        }];
    }
}

function navigateToOverride(languageClient: LanguageClient, location: any) {
    const range = languageClient.protocol2CodeConverter.asRange(location.range);
    window.showTextDocument(Uri.parse(location.uri), {
        preserveFocus: true,
        selection: range,
    });
}

class JavaHoverProvider implements HoverProvider {
    private _hoverRegistry: provideHoverCommandFn[] = [];

    constructor(readonly languageClient: LanguageClient) {
    }

    async provideHover(document: TextDocument, position: Position, token: CancellationToken): Promise<Hover> {
        const params = {
            textDocument: this.languageClient.code2ProtocolConverter.asTextDocumentIdentifier(document),
            position: this.languageClient.code2ProtocolConverter.asPosition(position),
        };

        // Fetch the javadoc from Java language server.
        const hoverResponse = await this.languageClient.sendRequest(HoverRequest.type, params, token);
        const serverHover = this.languageClient.protocol2CodeConverter.asHover(hoverResponse);

        // Fetch the contributed hover commands from third party extensions.
        const contributedCommands: Command[] = await this.getContributedHoverCommands(params, token);
        if (!contributedCommands.length) {
            return serverHover;
        }

        const contributed = new MarkdownString(contributedCommands.map((command) => this.convertCommandToMarkdown(command)).join(' | '));
        contributed.isTrusted = true;
        let contents: MarkedString[] = [ contributed ];
        let range;
        if (serverHover && serverHover.contents) {
            contents = contents.concat(serverHover.contents);
            range = serverHover.range;
        }
        return new Hover(contents, range);
    }

    registerHoverCommand(callback: provideHoverCommandFn) {
        this._hoverRegistry.push(callback);
    }

    private async getContributedHoverCommands(params: TextDocumentPositionParams, token: CancellationToken): Promise<Command[]> {
        const contributedCommands: Command[] = [];
        for (const provideFn of this._hoverRegistry) {
            try {
                if (token.isCancellationRequested) {
                    break;
                }

                const commands = (await provideFn(params, token)) || [];
                commands.forEach((command) => {
                    contributedCommands.push(command);
                });
            } catch (error) {
                logger.error(`Failed to provide hover command ${String(error)}`);
            }
        }

        return contributedCommands;
    }

    private convertCommandToMarkdown(command: Command): string {
        return `[${command.title}](command:${command.command}?${encodeURIComponent(JSON.stringify(command.arguments || []))} "${command.tooltip || command.command}")`;
    }
}
