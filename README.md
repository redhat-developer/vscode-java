Language support for Java &trade; for Visual Studio Code
=====================

[![Join the chat at https://gitter.im/redhat-developer/vscode-java](https://badges.gitter.im/redhat-developer/vscode-java.svg)](https://gitter.im/redhat-developer/vscode-java?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://travis-ci.org/redhat-developer/vscode-java.svg?branch=master)](https://travis-ci.org/redhat-developer/vscode-java) [![Marketplace Version](https://vsmarketplacebadge.apphb.com/version/redhat.java.svg "Current Release")](https://marketplace.visualstudio.com/items?itemName=redhat.java)

Provides Java &trade; language support via
[Eclipse &trade; JDT Language Server](https://github.com/eclipse/eclipse.jdt.ls), which utilizes
[Eclipse &trade; JDT](http://www.eclipse.org/jdt/), [M2Eclipse](http://www.eclipse.org/m2e/) and [Buildship](https://github.com/eclipse/buildship).

Quick Start
============
1. Install the Extension
2. If you do not have a _Java_ Development Kit correctly [set](#setting-the-jdk)
    * Download and install a Java 8, 9, 10 or 11 compatible development kit.
3. Extension is activated when you first access a Java file
    * Recognizes projects with *Maven* or *Gradle* build files in the directory hierarchy.

Features
=========
![ screencast ](https://raw.githubusercontent.com/redhat-developer/vscode-java/master/images/vscode-java.0.0.1.gif)

* Maven pom.xml project support
* Basic Gradle Java project support
* As you type reporting of parsing and compilation errors
* Code completion
* Code actions / Refactoring
* Javadoc hovers
* Organize imports
* Type search
* Code outline
* Code navigation
* Code lens (references/implementations)
* Highlights
* Code formatting (on-type/selection/file)
* Code snippets
* Annotation processing support (automatic for Maven projects)

Please note that [Gradle-based Android projects are not supported](https://github.com/redhat-developer/vscode-java/issues/10#issuecomment-268834749).

To launch and debug your Java programs, it's recommended you install *[Java Debug Extension for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-java-debug)*.

See the [changelog](CHANGELOG.md) for the latest release. You might also find useful information in the project [Wiki](https://github.com/redhat-developer/vscode-java/wiki).

Setting the JDK
===============
The path to the Java Development Kit is searched in the following order:

- the `java.home` setting in VS Code settings (workspace then user settings)
- the `JDK_HOME` environment variable
- the `JAVA_HOME` environment variable
- on the current system path

Available commands
==========================
The following commands are available:
- `Java:Update Project configuration` (`Shift+Alt+U`):  is available when the editor is focused on a Maven pom.xml or a Gradle file. It forces project configuration / classpath updates (eg. dependency changes or Java compilation level), according to the project build descriptor.
- `Java:Open Java Language Server log file`: opens the Java Language Server log file, useful for troubleshooting problems.
- `Java:Force Java compilation` (`Shift+Alt+B`): manually triggers compilation of the workspace.
- `Java:Open Java formatter settings`: Open the Eclipse formatter settings. Creates a new settings file if none exists.
- `Java:Clean the Java language server workspace`: Clean the Java language server workspace.
- `Java:Attach Source`: Attach a jar/zip source to the currently opened binary class file. This command is only available in the editor context menu.

Supported VS Code settings
==========================
The following settings are supported:

* `java.home` : Absolute path to JDK home folder used to launch the Java Language Server. Requires VS Code restart.
* `java.jdt.ls.vmargs` : Extra VM arguments used to launch the Java Language Server. Requires VS Code restart.
* `java.configuration.updateBuildConfiguration` : Specifies how modifications on build files update the Java classpath/configuration. Supported values are `disabled` (nothing happens), `interactive` (asks about updating on every modification), `automatic` (updating is automatically triggered).
* `java.errors.incompleteClasspath.severity` : Specifies the severity of the message when the classpath is incomplete for a Java file. Supported values are `ignore`, `info`, `warning`, `error`.
* `java.trace.server` : Traces the communication between VS Code and the Java language server.
* `java.configuration.maven.userSettings` : Path to Maven's settings.xml.
* `java.import.exclusions` : Exclude folders from import via glob patterns.
* `java.referencesCodeLens.enabled` : Enable/disable the references code lenses.
* `java.implementationsCodeLens.enabled` : Enable/disable the implementations code lenses.
* `java.signatureHelp.enabled` : Enable/disable signature help support (triggered on `(`).
* `java.format.enabled` : Enable/disable the default Java formatter.
* `java.contentProvider.preferred` : Preferred content provider (see 3rd party decompilers available in [vscode-java-decompiler](https://github.com/dgileadi/vscode-java-decompiler)).
* `java.import.gradle.enabled` : Enable/disable the Gradle importer.
* `java.import.maven.enabled` : Enable/disable the Maven importer.
* `java.autobuild.enabled` : Enable/disable the 'auto build'.
* `java.maxConcurrentBuilds`: Set max simultaneous project builds.
* `java.completion.favoriteStaticMembers` : Defines a list of static members or types with static members.
* `java.completion.importOrder` : Defines the sorting order of import statements.
* `java.progressReports.enabled` : [Experimental] Enable/disable progress reports from background processes on the server.
* `java.completion.overwrite` : When set to true, code completion overwrites the current text. When set to false, code is simply added instead.
* `java.format.settings.url` : Specifies the url or file path to the [Eclipse formatter xml settings](https://github.com/redhat-developer/vscode-java/wiki/Formatter-settings).
* `java.format.settings.profile` : Optional formatter profile name from the Eclipse formatter settings.
* `java.format.comments.enabled` : Includes the comments during code formatting.
* `java.format.onType.enabled` : Enable/disable on-type formatting (triggered on `;`, `}` or `<return>`).
* `java.completion.guessMethodArguments` : When set to true, method arguments are guessed when a method is selected from as list of code assist proposals.
* `java.completion.enabled` : Enable/disable code completion support.

*New in 0.38.0:*
* `java.configuration.excludeProjectSettingsFiles`: Exclude the extension generated project setting files(.classpath, .project, .settings) from the file explorer. When set to false, it will not revert the changes made on the setting.json file(s).


Troubleshooting
===============
1. Check the status of the language tools on the lower right corner (marked with A on image below).
It should show ready (thumbs up) as on the image below. You can click on the status and open the
language tool logs for further information in case of a failure.

![ status indicator ](https://raw.githubusercontent.com/redhat-developer/vscode-java/master/images/statusMarker.png)

2. Read the [troubleshooting guide](https://github.com/redhat-developer/vscode-java/wiki/Troubleshooting) for collecting informations about issues you might encounter.

3. Report any problems you face to the [project](https://github.com/redhat-developer/vscode-java/issues).

Contributing
===============
This is an open source project open to anyone. Contributions are extremely welcome!

For information on getting started, refer to the [CONTRIBUTING instructions](CONTRIBUTING.md).

Continuous Integration builds can be installed from [http://download.jboss.org/jbosstools/jdt.ls/staging/](http://download.jboss.org/jbosstools/jdt.ls/staging/?C=M;O=D). Download the most recent `java-<version>.vsix` file and install it by following the instructions [here](https://code.visualstudio.com/docs/editor/extension-gallery#_install-from-a-vsix).
Stable releases are archived under http://download.jboss.org/jbosstools/static/jdt.ls/stable/.

Also, you can contribute your own VSCode extension to enhance the existing features by following the instructions [here](https://github.com/redhat-developer/vscode-java/wiki/Contribute-a-Java-Extension).

Feedback
===============
* File a bug in [GitHub Issues](https://github.com/redhat-developer/vscode-java/issues),
* Chat with us on [Gitter](https://gitter.im/redhat-developer/vscode-java),
* [Tweet us](https://twitter.com/VSCodeJava/) with other feedback.


License
===============
EPL 1.0, See [LICENSE](LICENSE) for more information.
