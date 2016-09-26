# Change Log

## 0.0.4 (September 27, 2016)
* enhancement - improved Javadoc/Markdown formatting, See [#13](https://github.com/gorkem/vscode-java/issues/13). 
* enhancement - provide Java Language Server download feedback. See [#20](https://github.com/gorkem/vscode-java/issues/20).
* enhancement - provide syntax highlighting for opened `.class` files. See [#21](https://github.com/gorkem/vscode-java/issues/21).
* enhancement - provide link to Oracle JDK downloads on MacOS. See [#37](https://github.com/gorkem/vscode-java/issues/37).
* enhancement - provide better information on JDK/JAVA_HOME requirements. See [#32](https://github.com/gorkem/vscode-java/issues/32).
* bug fix - prevent java.lang.NullPointerException in DocumentLifeCycleHandler. See [#34](https://github.com/gorkem/vscode-java/issues/34).
* bug fix - fix Java Language Server downloading when using a Proxy. See [#35](https://github.com/gorkem/vscode-java/issues/35).
* bug fix - fix Java Language Server headers format. See [JLS#74](https://github.com/gorkem/java-language-server/issues/74).
* bug fix - fix project import reporting progress > 100%. See [JLS#67](https://github.com/gorkem/java-language-server/issues/67).

## 0.0.3 (September 16, 2016)
* enhancement - In addition to maven, we now support basic Eclipse projects. See [JLS#37](https://github.com/gorkem/java-language-server/issues/37).
* enhancement - Go to Definition (<kbd>F12</kbd>) is enabled for libraries and can display Java code that is not part of project's source code
* enhancement - Code complete triggers are added for `.#@` characters. See [#19](https://github.com/gorkem/vscode-java/issues/19). 
* bug fix - Opening a Maven project a 2nd time doesn't work. See [JLS#66](https://github.com/gorkem/java-language-server/issues/66).

## 0.0.2 (September 14, 2016)
* enhancement - download the Java Language Server through HTTPS.

## 0.0.1 (September 12, 2016)
* Maven pom.xml project support
* Basic Eclipse Java project support 
* As you type reporting of parsing and compilation errors
* Code completion
* Javadoc hovers 
* Code outline
* Code navigation
* Code lens (references)
* Highlights
* Code formatting
