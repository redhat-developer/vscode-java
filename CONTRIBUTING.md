# How to contribute

Contributions are essential for keeping this extension great.
We try to keep it as easy as possible to contribute changes and we are 
open to suggesstions for making it even easier.  
There are only a few guidelines that we need contributors to follow.

## vscode-java vs java-language-server

vscode-java is a Visual Studio Code extension that uses a language server for its java language 
smartness. Usually vscode-java features depend on [java-language-server](https://github.com/gorkem/java-language-server),
and the contributions should be coordinated between the two repositories.

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

## Building java-language-server
This assumes that you are starting on the `vscdoe-java` directory

1. `cd ..`
2. Fork and clone the [java-language-server](https://github.com/gorkem/java-language-server) repository
3. Build server

	```bash
	$ cd ..\vscode-java
	$ npm run-script build-server
	```
	
This will build and place the binaries under the `server` folder. Alternately you can download
and unzip a pre-built server. For pre-built server information refer to java-language-server 
project.
    
## Sideloading

You can create a binary that you can sideload to your VS Code installation. 

1. Fork and clone this repository
2. `cd vscode-java`
3. Install the dependencies:

	```bash
	$ npm install
	```
4. Optionally, follow the instruction to build the server. 
5. See documentation on [extension installation](https://github.com/Microsoft/vscode-docs/blob/master/docs/extensions/install-extension.md) 
on ways to sideload or share.