import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";
import globals from "globals";
import stylistic from "@stylistic/eslint-plugin";

export default defineConfig([globalIgnores([
	"out",
	"server",
	"node_modules",
	"*.vsix",
	".DS_Store",
	".vscode-test",
	"undefined",
	"target",
	"dist",
	"jre",
	"lombok",
	"bin/",
	".settings",
	".classpath",
	".project",
	"test/resources/projects/**/.vscode",
	"test/resources/projects/maven/salut/testGradle",
	"test-temp",
	"vscode*.d.ts",
]), {
	files: ["src/**"],

	plugins: {
		"@typescript-eslint": tseslint.plugin,
		"stylistic": stylistic,
	},

	languageOptions: {
		globals: {
			...globals.node,
		},

		parser: tseslint.parser,
		ecmaVersion: "latest",
		sourceType: "commonjs",

		parserOptions: {
			project: ["tsconfig.webview.json", "tsconfig.json"],
		},
	},

	rules: {
		"stylistic/member-delimiter-style": ["error", {
			multiline: {
				delimiter: "semi",
				requireLast: true,
			},

			singleline: {
				delimiter: "semi",
				requireLast: false,
			},
		}],

		"@typescript-eslint/naming-convention": "error",
		"@typescript-eslint/prefer-for-of": "error",
		"stylistic/semi": ["error", "always"],
		"stylistic/type-annotation-spacing": "error",
		curly: ["error", "multi-line"],
		eqeqeq: ["error", "always"],

		"id-denylist": [
			"error",
			"any",
			"Number",
			"number",
			"String",
			"string",
			"Boolean",
			"boolean",
			"Undefined",
			"undefined",
		],

		"id-match": "error",
		"no-debugger": "error",
		"no-multiple-empty-lines": "error",
		"no-trailing-spaces": "error",
		"no-underscore-dangle": "error",
		"no-var": "error",

		"prefer-arrow-callback": ["error", {
			allowNamedFunctions: true,
		}],

		"prefer-const": "error",
		"prefer-template": "error",
		"quote-props": ["error", "as-needed"],
		semi: "error",

		"spaced-comment": ["error", "always", {
			markers: ["/"],
		}],
	},
}, {
	files: ["**/*.js", "**/*.mjs"],

	plugins: {
		"@typescript-eslint": tseslint.plugin,
	},

	languageOptions: {
		globals: {
			...globals.node,
		},

		parser: tseslint.parser,
		ecmaVersion: "latest",
		sourceType: "commonjs",
	},

	rules: {
		"@typescript-eslint/no-var-requires": "off",
		"@typescript-eslint/naming-convention": "off",
		"stylistic/semi": "off",
		"prefer-arrow/prefer-arrow-functions": "off",
		"prefer-arrow-callback": "off",
		"no-useless-escape": "off",
		"spaced-comment": "off",
		semi: "off",
		"prefer-template": "off",
		"prefer-const": "off",
	},
}, {
	files: ["**/*.test.ts"],

	languageOptions: {
		globals: {
			...globals.node,
		},

		parser: tseslint.parser,
		ecmaVersion: "latest",
		sourceType: "commonjs",
	},

	rules: {
		"prefer-arrow-callback": "off",
	},
}]);