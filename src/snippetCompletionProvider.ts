'use strict';

import { CompletionItemProvider, TextDocument, Position, CancellationToken, CompletionContext, CompletionItem, CompletionItemKind, SnippetString, MarkdownString, languages, Disposable } from "vscode";
import * as fse from 'fs-extra';
import * as path from 'path';

class SnippetCompletionProvider implements Disposable {

    private providerImpl: Disposable;

    public initialize(): SnippetCompletionProvider {
        this.providerImpl = languages.registerCompletionItemProvider({ scheme: 'file', language: 'java' }, new SnippetCompletionProviderImpl());
        return this;
    }

    public dispose(): void {
        if (this.providerImpl) {
            this.providerImpl.dispose();
        }
    }
}

class SnippetCompletionProviderImpl implements CompletionItemProvider {

    private snippets: {};

    public constructor() {
        this.snippets = fse.readJSONSync(path.join(__dirname, '..', 'snippets', 'server.json'));
    }

    public async provideCompletionItems(_document: TextDocument, _position: Position, _token: CancellationToken, _context: CompletionContext): Promise<CompletionItem[]> {

        const snippetItems: CompletionItem[] = [];
        for (const label of Object.keys(this.snippets)) {
            const snippetContent = this.snippets[label];
            if (Array.isArray(snippetContent.prefix)) {
                for (const prefix of snippetContent.prefix) {
                    snippetItems.push(this.getCompletionItem(prefix, snippetContent));
                }
            } else {
                snippetItems.push(this.getCompletionItem(snippetContent.prefix, snippetContent));
            }
        }
        return snippetItems;
    }

    private getCompletionItem(prefix: string, snippetContent: any) {
        const snippetItem: CompletionItem = new CompletionItem(prefix);
        snippetItem.kind = CompletionItemKind.Snippet;
        snippetItem.detail = snippetContent.description;
        const insertText: string = (snippetContent.body as String[]).join('\n');
        snippetItem.insertText = new SnippetString(insertText);
        snippetItem.documentation = beautifyDocument(insertText);
        return snippetItem;
    }
}

export function beautifyDocument(raw: string): MarkdownString {
    const escapedString = raw.replace(/\$\{\d\|(.*?),.*?\}/gm, '$1')
                            .replace(/\$\{\d:?(.*?)\}/gm, '$1')
                            .replace(/\$\d/gm, '')
                            .replace(/\${TM_SELECTED_TEXT:}/gm, '')
                            .replace(/\${TM_FILENAME_BASE}/gm, '');
    return new MarkdownString().appendCodeblock(escapedString, "java");
}

export const snippetCompletionProvider: SnippetCompletionProvider = new SnippetCompletionProvider();
