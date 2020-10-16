'use strict';

import { CompletionItemProvider, TextDocument, Position, CancellationToken, CompletionContext, CompletionItem, CompletionItemKind, SnippetString, MarkdownString } from "vscode";
import * as fse from 'fs-extra';
import * as path from 'path';
import { apiManager } from "./apiManager";
import { ClientStatus } from "./extension.api";

export class SnippetCompletionProvider implements CompletionItemProvider {

    private snippets: {};

    public constructor() {
        this.snippets = fse.readJSONSync(path.join(__dirname, '..', 'snippets', 'server.json'));
    }

    public async provideCompletionItems(_document: TextDocument, _position: Position, _token: CancellationToken, _context: CompletionContext): Promise<CompletionItem[]> {
        if (apiManager.getApiInstance().status === ClientStatus.Started) {
            return [];
        }

        const snippetItems: CompletionItem[] = [];
        for (const label of Object.keys(this.snippets)) {
            const snippetContent = this.snippets[label];
            const snippetItem: CompletionItem = new CompletionItem(snippetContent.prefix);
            snippetItem.kind = CompletionItemKind.Snippet;
            snippetItem.detail = snippetContent.description;
            const insertText: string = (snippetContent.body as String[]).join('\n');
            snippetItem.insertText = new SnippetString(insertText);
            snippetItem.documentation = beautifyDocument(insertText);
            snippetItems.push(snippetItem);
        }
        return snippetItems;
    }
}

export function beautifyDocument(raw: string): MarkdownString {
    const escapedString = raw.replace(/\$\{\d:?(.*?)\}/gm, '$1').replace(/\$\d/gm, '');
    return new MarkdownString().appendCodeblock(escapedString, "java");
}
