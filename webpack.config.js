// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

//@ts-check
const ESLintWebpackPlugin = require('eslint-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

/**@type {import('webpack').Configuration}*/
const config = {
	watchOptions: {
		ignored: /node_modules/
	},
	target: 'node', // vscode extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
	node: {
		__dirname: false,
		__filename: false,
	},
	entry: './src/extension.ts', // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
	output: { // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
		path: path.resolve(__dirname, 'dist'),
		filename: 'extension.js',
		libraryTarget: "commonjs2",
		devtoolModuleFilenameTemplate: "../[resource-path]",
	},
	externals: {
		vscode: "commonjs vscode", // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
		fsevents: "require('fsevents')", // https://github.com/yan-foto/electron-reload/issues/71#issuecomment-588988382
	},
	devtool: 'source-map',
	resolve: { // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
		extensions: ['.ts', '.js'],
	},
	module: {
		rules: [{
			test: /\.ts$/,
			exclude: /node_modules/,
			use: [{
				loader: 'ts-loader',
			}]
		}]
	},
	plugins: [
		new ESLintWebpackPlugin({
			extensions: [
				".ts",
				".js"
			]
		})
	],
	infrastructureLogging: {
		level: 'log',
	},
}

const configAssets = {
	name: 'assets',
	mode: 'none',
	entry: {
		changeSignature: './src/webview/changeSignature/index.tsx',
	},
	module: {
		rules: [{
			test: /\.ts(x?)$/,
			exclude: /node_modules/,
			loader: 'ts-loader',
			options: {
				configFile: 'tsconfig.webview.json'
			}
		}, {
			test: /\.(css)$/,
			use: [{
				loader: 'style-loader'
			}, {
				loader: 'css-loader'
			}]
		}, {
			test: /\.(ttf)$/,
			type: 'asset/inline',
		}]
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'dist'),
		publicPath: '/',
		devtoolModuleFilenameTemplate: "../[resource-path]"
	},
	plugins: [
		new webpack.ProvidePlugin({
			process: 'process/browser',
		}),
	],
	devtool: 'source-map',
	resolve: {
		extensions: ['.js', '.ts', '.tsx']
	}
}
module.exports = [config, configAssets];
