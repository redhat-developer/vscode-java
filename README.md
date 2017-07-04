
[![Build Status](https://travis-ci.org/redhat-developer/vscode-java.svg?branch=master)](https://travis-ci.org/redhat-developer/vscode-java) [![Waffle.io](https://img.shields.io/waffle/label/redhat-developer/vscode-java/in%20progress.svg?maxAge=2592000?style=plastic)](https://waffle.io/redhat-developer/vscode-java) [![Marketplace Version](https://vsmarketplacebadge.apphb.com/version/redhat.java.svg "Current Release")](https://marketplace.visualstudio.com/items?itemName=redhat.java)
Language support for Java &trade; for Visual Studio Code
=====================

Provides Java &trade; language support via
[Eclipse &trade; JDT Language Server](https://github.com/eclipse/eclipse.jdt.ls), which utilizes
[Eclipse &trade; JDT](http://www.eclipse.org/jdt/), [M2Eclipse](http://www.eclipse.org/m2e/) and [Buildship](https://github.com/eclipse/buildship).

Quick Start
============
1. Install the Extension
2. If you do not have a _Java 8_ Development Kit correctly [set](#setting-the-jdk)
    * Download and install a Java 8 compatible development kit.
3. Extension is activated when you first access a Java file
    * Recognizes projects with *maven* or *gradle* build files in the directory hierarchy, or to a lesser extent, simple Eclipse projects, i.e. containing .project and .classpath files.

Features
=========
![ screencast ](https://raw.githubusercontent.com/redhat-developer/vscode-java/master/images/vscode-java.0.0.1.gif)

* Maven pom.xml project support
* Basic Eclipse Java project support
* Basic Gradle Java project support
* As you type reporting of parsing and compilation errors
* Code completion
* Javadoc hovers
* Type search
* Code outline
* Code navigation
* Code lens (references)
* Highlights
* Code formatting
* Code snippets

Please note that [Gradle-based Android projects are not supported](https://github.com/redhat-developer/vscode-java/issues/10#issuecomment-268834749).

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
The following command is available:
- `Java:Update Project configuration` (`Ctrl+Alt+U` or `Cmd+Alt+U` on MacOS):  is available when the editor is focused on a Maven pom.xml or a Gradle file. It forces project configuration / classpath updates (eg. dependency changes or Java compilation level), according to the project build descriptor.
- `Java:Open Java Language Server log file` (since 0.4.0): opens the Java Language Server log file, useful for troubleshooting problems.

Supported VS Code settings
==========================
The following settings are supported:

* `java.home` : Absolute path to JDK 8 home folder used to launch the Java Language Server. Requires VS Code restart.
* `java.jdt.ls.vmargs` : Extra VM arguments used to launch the Java Language Server. Requires VS Code restart.
* `java.configuration.updateBuildConfiguration` : Specifies how modifications on build files update the Java classpath/configuration. Supported values are `disabled` (nothing happens), `interactive` (asks about updating on every modification), `automatic` (updating is automatically triggered).
* `java.errors.incompleteClasspath.severity` : Specifies the severity of the message when the classpath is incomplete for a Java file. Supported values are `ignore`, `info`, `warning`, `error`.
* `java.trace.server` : Traces the communication between VS Code and the Java language server.
* `java.referencesCodeLens.enabled` : Enable/disable the references code lens.
* `java.signatureHelp.enabled` : Enable/disable the signature help.
* `java.configuration.maven.userSettings` : Absolute path to Maven's settings.xml.


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

For information on getting started, refer to the [CONTRIBUTING.md instructions](CONTRIBUTING.md).

Continuous Integration builds can be installed from http://download.jboss.org/jbosstools/jdt.ls/staging/. Download the most recent `java-<version>.vsix` file and install it by following the instructions [here](https://code.visualstudio.com/docs/editor/extension-gallery#_install-from-a-vsix).

Feedback
===============
* File a bug in [GitHub Issues](https://github.com/redhat-developer/vscode-java/issues).
* [Tweet](https://twitter.com/GorkemErcan) [us](https://twitter.com/fbricon) with other feedback.


License
===============
EPL 1.0, See [LICENSE](LICENSE) for more information.
