# How to contribute

Contributions are essential for keeping this extension great.
We try to keep it as easy as possible to contribute changes and we are
open to suggesstions for making it even easier.
There are only a few guidelines that we need contributors to follow.

## vscode-java vs eclipse.jdt.ls

vscode-java is a Visual Studio Code extension that uses a language server for its Java language
smartness. Usually vscode-java features depend on the [Eclipse &trade; JDT Language Server](https://github.com/eclipse/eclipse.jdt.ls),
(a.k.a. eclipse.jdt.ls) and the contributions should be coordinated between the two repositories.

## First Time Setup
1. Install prerequisites:
   * latest [Visual Studio Code](https://code.visualstudio.com/)
   * [Node.js](https://nodejs.org/) v4.0.0 or higher
2. Fork and clone the repository
3. `cd vscode-java`
4. Install the dependencies:

	```bash
	$ npm install
	```
5. Open the folder in VS Code

## Building Eclipse &trade; JDT Language Server
This assumes that you are starting on the `vscode-java` directory

1. `cd ..`
2. Fork and clone the [eclipse.jdt.ls](https://github.com/eclipse/eclipse.jdt.ls) repository
3. Build server

	```bash
	$ cd ..\vscode-java
	$ npm run build-server
	```
You can run faster server builds during development by calling `./node_modules/.bin/gulp dev_server` script instead, this will build server binaries that are required by your host OS only. You can also use `npm run watch-server` which will build and place them on the extension for Java changes. These commands run Maven in offline mode, so you might need to run `build-server` at least once, to fetch all the dependencies.

This will build and place the binaries under the `server` folder. Alternately you can download and use the latest snapshot build from [Eclipse &trade; JDT Language Server](https://github.com/eclipse/eclipse.jdt.ls) project with the following

	```bash
	$ cd ..\vscode-java
	$ ./node_modules/.bin/gulp download_server
	```

## Sideloading

You can create a binary that you can sideload to your VS Code installation.

1. Fork and clone this repository
2. `cd vscode-java`
3. Install the dependencies:

	```bash
	$ npm install
	```
4. Optionally, follow the instruction to build the server.
5. See documentation on [extension installation](https://github.com/Microsoft/vscode-docs/blob/master/docs/extensions/publish-extension.md)
on ways to sideload or share.

# Reporting issues
If you encounter a problem and know it is caused by eclipse.jdt.ls, then please open a bug report over [there](https://github.com/eclipse/eclipse.jdt.ls/issues).
In doubt, you can report issues in the [vscode-java issue tracker](https://github.com/redhat-developer/vscode-java/issues).

Try to collect as much informations as you can to describe the issue and help us reproduce the problem. Head over to the [troubleshooting page](https://github.com/redhat-developer/vscode-java/wiki/Troubleshooting#enable-logging) to see how to collect useful logging informations.
