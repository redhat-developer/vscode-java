'use strict';

import { HoverProvider, CancellationToken, Hover, Position, TextDocument, MarkdownString, MarkedString, Command } from "vscode";
import { TextDocumentPositionParams, HoverRequest } from "vscode-languageclient";
import { LanguageClient } from 'vscode-languageclient/node';
import { Commands as javaCommands } from "./commands";
import { FindLinks } from "./protocol";
import { provideHoverCommandFn } from "./extension.api";
import { logger } from "./log";

export function createClientHoverProvider(languageClient: LanguageClient): JavaHoverProvider {
    const hoverProvider: JavaHoverProvider = new JavaHoverProvider(languageClient);
    registerHoverCommand(async (params: TextDocumentPositionParams, token: CancellationToken) => {
        return await provideHoverCommand(languageClient, params, token);
    });

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

function encodeBase64(text: string): string {
    return Buffer.from(text).toString('base64');
}

const hoverCommandRegistry: provideHoverCommandFn[] = [];
export function registerHoverCommand(callback: provideHoverCommandFn): void {
    hoverCommandRegistry.push(callback);
}

class JavaHoverProvider implements HoverProvider {

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
        let contents: (MarkdownString|MarkedString)[] = [ contributed ];
        let range;
        if (serverHover && serverHover.contents) {
            contents = contents.concat(serverHover.contents);
            range = serverHover.range;
        }
        return new Hover(contents, range);
    }

    private async getContributedHoverCommands(params: TextDocumentPositionParams, token: CancellationToken): Promise<Command[]> {
        const contributedCommands: Command[] = [];
        for (const provideFn of hoverCommandRegistry) {
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
