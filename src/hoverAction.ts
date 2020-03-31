'use strict';

import { commands, ExtensionContext, HoverProvider, languages, CancellationToken, Hover, Position, TextDocument, MarkdownString, window, Uri, MarkedString, Command } from "vscode";
import { LanguageClient, TextDocumentPositionParams, HoverRequest } from "vscode-languageclient";
import { Commands as javaCommands } from "./commands";
import { FindLinks } from "./protocol";
import { provideHoverCommandFn } from "./extension.api";
import { logger } from "./log";

export function createClientHoverProvider(languageClient: LanguageClient, context: ExtensionContext): JavaHoverProvider {
    const hoverProvider: JavaHoverProvider = new JavaHoverProvider(languageClient);
    hoverProvider.registerHoverCommand(async (params: TextDocumentPositionParams, token: CancellationToken) => {
        return await provideHoverCommand(languageClient, params, token);
    });
    context.subscriptions.push(commands.registerCommand(javaCommands.NAVIGATE_TO_SUPER_IMPLEMENTATION_COMMAND, (location: any) => {
        navigateToSuperImplementation(languageClient, location);
    }));

    return hoverProvider;
}

async function provideHoverCommand(languageClient: LanguageClient, params: TextDocumentPositionParams, token: CancellationToken): Promise<Command[] | undefined> {
    const response = await languageClient.sendRequest(FindLinks.type, {
        type: 'superImplementation',
        position: params,
    }, token);
    if (response && response.length) {
        const location = response[0];
        let tooltip;
        if (location.kind === 'method') {
            tooltip = `Go to super method '${location.displayName}'`;
        } else {
            tooltip = `Go to super implementation '${location.displayName}'`;
        }

        return [{
            title: 'Go to Super Implementation',
            command: javaCommands.NAVIGATE_TO_SUPER_IMPLEMENTATION_COMMAND,
            tooltip,
            arguments: [{
                uri: encodeBase64(location.uri),
                range: location.range,
            }],
        }];
    }
}

function navigateToSuperImplementation(languageClient: LanguageClient, location: any) {
    const range = languageClient.protocol2CodeConverter.asRange(location.range);
    window.showTextDocument(Uri.parse(decodeBase64(location.uri)), {
        preserveFocus: true,
        selection: range,
    });
}

function encodeBase64(text: string): string {
    return Buffer.from(text).toString('base64');
}

function decodeBase64(text: string): string {
    return Buffer.from(text, 'base64').toString('ascii');
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
