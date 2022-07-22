import { SymbolKind as VSymbolKind, ThemeIcon } from "vscode";
import { SymbolKind as LSymbolKind} from "vscode-languageclient";

const themeIconIds = [
	'symbol-file', 'symbol-module', 'symbol-namespace', 'symbol-package', 'symbol-class', 'symbol-method',
	'symbol-property', 'symbol-field', 'symbol-constructor', 'symbol-enum', 'symbol-interface',
	'symbol-function', 'symbol-variable', 'symbol-constant', 'symbol-string', 'symbol-number', 'symbol-boolean',
	'symbol-array', 'symbol-object', 'symbol-key', 'symbol-null', 'symbol-enum-member', 'symbol-struct',
	'symbol-event', 'symbol-operator', 'symbol-type-parameter'
];

export function getLThemeIcon(kind:  LSymbolKind): ThemeIcon | undefined {
	const id = themeIconIds[kind - 1];
	return id ? new ThemeIcon(id) : undefined;
}

export function getThemeIcon(kind: VSymbolKind): ThemeIcon | undefined {
	const id = themeIconIds[kind];
	return id ? new ThemeIcon(id) : undefined;
}