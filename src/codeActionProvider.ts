import { CodeActionProvider, CodeActionProviderMetadata, CodeActionKind } from "vscode";
import { Commands } from "./commands";

/**
 * Mapping the refactoring kind to its section id in the document
 */
export const javaRefactorKinds: Map<CodeActionKind, string> = new Map([
    [CodeActionKind.Refactor, 'java-refactoring'],
    [CodeActionKind.RefactorExtract, 'extract-to-constant'],
    [CodeActionKind.RefactorExtract.append('function'), 'extract-to-method'],
    [CodeActionKind.RefactorExtract.append('constant'), 'extract-to-constant'],
    [CodeActionKind.RefactorExtract.append('variable'), 'extract-to-local-variable'],
    [CodeActionKind.RefactorExtract.append('field'), 'extract-to-field'],
    [CodeActionKind.RefactorInline, 'inline-constant'],
    [CodeActionKind.Refactor.append('move'), 'move'],
    [CodeActionKind.Refactor.append('assign'), 'assign-to-variable'],
    [CodeActionKind.Refactor.append('introduce').append('parameter'), 'introduce-parameter']
]);

export class RefactorDocumentProvider implements CodeActionProvider {
    provideCodeActions() {
        return [{
            // The aim of this is to expose the source actions in the light bulb.
            title: "Source Actions...",
            command: "editor.action.sourceAction",
            kind: CodeActionKind.Empty,
        }];
    }

    public static readonly metadata: CodeActionProviderMetadata = {
        providedCodeActionKinds: [
            CodeActionKind.Refactor
        ],
        documentation: Array.from(javaRefactorKinds.keys()).map(kind => {
            return {
                kind,
                command: {
                    command: Commands.LEARN_MORE_ABOUT_REFACTORING,
                    title: 'Learn more about Java refactorings...',
                    arguments: [kind]
                }
            };
        }),
    };
}
