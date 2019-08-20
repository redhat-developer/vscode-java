# How to contribute

Contributions are essential for keeping this extension great.
We try to keep it as easy as possible to contribute changes and we are
open to suggestions for making it even easier.
There are only a few guidelines that we need contributors to follow.

## vscode-java vs eclipse.jdt.ls

vscode-java is a Visual Studio Code extension that uses a language server for its Java language
smartness. Usually vscode-java features depend on the [Eclipse &trade; JDT Language Server](https://github.com/eclipse/eclipse.jdt.ls),
(a.k.a. eclipse.jdt.ls) and the contributions should be coordinated between the two repositories.

#

## Background Info

For the whole language server to get up and running it requires
two parts.

 **A)** The Client Side (this repo): [VSCode Java](https://github.com/redhat-developer/vscode-java)

**B)** The Server Side: [JDT LS](https://github.com/eclipse/eclipse.jdt.ls)

#

## Complete Setup Guide

The following will be a start to finish guide to get the entire language server up and running.

#

## **A)** Client Side Setup

1. Install the required software:
   * latest [Visual Studio Code](https://code.visualstudio.com/)
   * [Node.js](https://nodejs.org/) v4.0.0 or higher
2. Fork and clone [this repository](https://github.com/redhat-developer/vscode-java)

  	Keep in mind the final directories will look like:

	```
	PROJECT_FOLDER/
		     |
	  	     |--- vscode-java/
		     |--- eclipse.jdt.ls/

	```


3. `cd vscode-java`
4. Install the dependencies:

	```bash
	$ npm install
	```

#

## **B)** Server Side Setup
This assumes that you are starting on the `vscode-java` directory

1. `cd ..`
2. Fork and clone the [eclipse.jdt.ls](https://github.com/eclipse/eclipse.jdt.ls) repository

	Ensure the directory looks like:
	```
	PROJECT_FOLDER/
		     |
	  	     |--- vscode-java/
		     |--- eclipse.jdt.ls/

	```
3. Build server

	```bash
	$ cd ./vscode-java
	$ npm run build-server
	```

**\*Optional:**
You can run faster server builds during development by calling `./node_modules/.bin/gulp dev_server` script instead, this will build server binaries that are required by your host OS only. You can also use `npm run watch-server` which will build and place them on the extension for Java changes. These commands run Maven in offline mode, so you might need to run `build-server` at least once, to fetch all the dependencies.

This will build and place the binaries under the `server` folder. Alternately you can download and use the latest snapshot build from [Eclipse &trade; JDT Language Server](https://github.com/eclipse/eclipse.jdt.ls) project with the following

```bash
$ cd ../vscode-java
$ ./node_modules/.bin/gulp download_server
```
### Setting up the JDT Language Server in Eclipse

4. In Eclipse, import a maven project:

    ![Import Project](images/changelog/importProject.png)

    ![Import Project](images/changelog/importMavenProject.png)

    Select the `eclipse.jdt.ls` folder, then click yes/accept to all
following prompts:

    ![Import Project](images/changelog/importedMavenProject.png)

5) Now we need to use Tycho to download the dependencies,
this will get rid of the errors.

	At the top right arrow it will say `Set Target Platform`, select that and continue.

	![Import Project](images/changelog/setTargetPlatform.png)

	After it will change to `Reload Target Platform` select that:

    ![Import Project](images/changelog/reloadTargetPlatform.png)

6) Wait till the bottom right is done loading:

    ![Import Project](images/changelog/loadingTargetPlatform.png)

	once 100%:



    The errors should now be gone.

#
# Running Everything

## **C)** Run with a remote JDT language server

While developing the language server and the extension, you don't need to deploy the server every time to try out changes. Instead you can run the language server out of its Eclipse workspace:

### a) _Launch Extension - Client Side_

1. Open VSCode on the `vscode-java` folder

2. In the debug viewlet, run the launch _Launch Extension - Remote Server_
![Remote Server](images/changelog/RemoteServer.png)

3. The extension will open a socket on port 3333 and will wait for the JDT language server to connect



### b) _Setup Debug Server - Server Side_

[**\*Skip to C if this option exists\***](#c-launch-debug-server---server-side)

In Eclipse, run the JDT language server as an Eclipse application.
   1) Create a debug configuration of type _Eclipse Application_.
   		![Creation Menu](images/changelog/DebugConfigurationOpen.png)

   		![New Configuration](images/changelog/CreateNewConfiguration.png)
   2) in the main tab of the debug configuration set the product to `org.eclipse.jdt.ls.core.product`.

   		![Choose Product](./images/changelog/ChooseProduct.png)
   3) in the Environment tab, define a variable `CLIENT_PORT` with value `3333`.

   		![Define Port](images/changelog/ClientPort.png)
   4) If your workspace contains 'org.eclipse.jdt.ui', use the Plug-Ins tab in the debug configuration to exclude the plug-in. The presence of 'org.eclipse.jdt.ui' will cause the language server to hang.

### c) _Launch Debug Server - Server Side_

- With the client side **(vscode-java) running**, you can start the remote server.

	![Define Port](images/changelog/DebugRemoteServer.png)

- In the debug console of VSCode you can see if the connection was successful.
- When the server is running breakpoints can be reached and hot code replace can be used to make fixes without restarting the server.
- You can modify `launch.json` to use a different port:
    - Modify `SERVER_PORT` to specify the port the JDT LS server should connect to.

### _Launch Extension - JDTLS Client_

- start the `jdt.ls.socket-stream` launch configuration in Eclipse
- start the _Launch Extension - JDTLS Client_ in VS Code
- You can modify `launch.json` to use a different port:
    - Modify `JDTLS_CLIENT_PORT` to specify the port VS Code should connect to.

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
