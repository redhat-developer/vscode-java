
[![Build Status](https://travis-ci.org/gorkem/vscode-java.svg?branch=master)](https://travis-ci.org/gorkem/vscode-java)

Language support for Java &trade; for Visual Studio Code
=====================

Provides Java &trade; language support via
[java-language-server](https://github.com/gorkem/java-language-server), which utilizes [Eclipse &trade;
JDT](http://www.eclipse.org/jdt/).

Quick Start
============
1. Install the Extension
2. If you do not have a _Java 8_ Runtime on current system path or _JAVA_HOME_ is not correctly set to point to one
    * Download and install a Java 8 compatible runtime.
3. Extension is activated when you first access a Java file.
    * Initial activation can be longer since it requires extension to download additional parts.
    * Recognizes only projects with *maven* build files on the directory hierarchy. 


Features 
=========
![ screencast ](https://github.com/gorkem/vscode-java/blob/master/images/vscode-java.0.0.1.gif)

* Maven pom.xml project support
* As you type reporting of parsing and compilation errors
* Code completion
* Javadoc hovers 
* Code outline
* Code navigation
* Code lens (references)
* Highlights
* Code formatting

Contributing
----------------------------
This is an open source project open to anyone. Contributions are extremely welcome 

For information on getting started refer to [java-language-server](https://github.com/gorkem/java-language-server/blob/master/README.md).

Feedback
---------
* File a bug in [GitHub Issues](https://github.com/gorkem/java-language-server/issues).
* [Tweet](https://twitter.com/GorkemErcan) us with other feedback.


License
-------
EPL 1.0, See [LICENSE](LICENSE) for more information.