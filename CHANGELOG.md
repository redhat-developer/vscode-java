# Change Log

## 0.6.0 (June 15th, 2017)
* enhancement - reduced extension size by ~25%. See [JLS#252](https://github.com/eclipse/eclipse.jdt.ls/issues/252).
* bug - fixed OperationCanceledException during completion. See [JLS#240](https://github.com/eclipse/eclipse.jdt.ls/issues/240).
* bug - fixed changes in Eclipse settings file are ignored. See [#239](https://github.com/redhat-developer/vscode-java/pull/239).
* bug - `package` autocompletion should return only 1 package. See [#234](https://github.com/redhat-developer/vscode-java/pull/234).
* bug - Autocompletion on overridden methods should create the method body. See [#85](https://github.com/redhat-developer/vscode-java/pull/85).

## 0.5.0 (May 31st, 2017)
* enhancement - Enable support for CamelCase type search. See [JLS#219](https://github.com/eclipse/eclipse.jdt.ls/issues/219).
* enhancement - Server startup now uses progress UI. See [#225](https://github.com/redhat-developer/vscode-java/pull/225).
* bug - fixed autocomplete inserting classname+package text instead of classname. See [#175](https://github.com/redhat-developer/vscode-java/issues/175).
* bug - fixed `Timed out while retrieving the attached javadoc.` error. See [#176](https://github.com/redhat-developer/vscode-java/issues/176).
* bug - fixed autocompletion not cancelled on space. See [#187](https://github.com/redhat-developer/vscode-java/issues/187).
* bug - fixed Gradle import failing behind corporate proxy with authentication. See [#211](https://github.com/redhat-developer/vscode-java/issues/211).
* bug - fixed `Unable to locate secure storage module` error. See [#212](https://github.com/redhat-developer/vscode-java/issues/212).
* bug - fixed CancellationException in output log. See [#213](https://github.com/redhat-developer/vscode-java/issues/213).
* bug - fixed `Illegal argument, contents must be defined` error on hover. See [#214](https://github.com/redhat-developer/vscode-java/issues/214).
* bug - fixed code snippet appearing before completion results. See [#216](https://github.com/redhat-developer/vscode-java/issues/216).
* bug - fixed code snippet using deprecated syntax. See [#217](https://github.com/redhat-developer/vscode-java/issues/217).
* bug - fixed navigation from disassembled source code. See [#222](https://github.com/redhat-developer/vscode-java/issues/222).
* bug - fixed Javadoc missing from inherited methods. See [#226](https://github.com/redhat-developer/vscode-java/issues/226).
* bug - fixed `Problems encountered while copying resources. Resource '/jdt.ls-java-project/src/pom.xml' does not exist` error. See [#244](https://github.com/eclipse/eclipse.jdt.ls/issues/244).

## 0.4.0 (May 15th, 2017)
* enhancement - New `Open Java Language Server log file` command. See [#209](https://github.com/redhat-developer/vscode-java/issues/209).
* enhancement - Expand workspace symbol search to all classes from classpath. See [#204](https://github.com/redhat-developer/vscode-java/issues/204).
* bug - fixed outline for classes from classpath. See [#206](https://github.com/redhat-developer/vscode-java/issues/206).
* bug - fixed ambiguous results from class outline. See [JLS#214](https://github.com/eclipse/eclipse.jdt.ls/issues/214).

## 0.3.0 (May 4th, 2017)
* enhancement - Reduce confusion about "Classpath is incomplete" warning by providing a link to the wiki page. See [#193](https://github.com/redhat-developer/vscode-java/issues/193).
* enhancement - Enable String deduplication on G1 Garbage collector by default, to improve memory footprint. See [#195](https://github.com/redhat-developer/vscode-java/issues/195).

## 0.2.1 (April 24th, 2017)
* bug - fix excessive 'Unable to get documentation under 500ms' logging. See [#189](https://github.com/redhat-developer/vscode-java/issues/189).

## 0.2.0 (April 19th, 2017)
* enhancement - Extension now embeds the Java Language Server. See [#178](https://github.com/redhat-developer/vscode-java/issues/178).
* bug - fixed Java Language Server status update on startup. See [#179](https://github.com/redhat-developer/vscode-java/issues/179).
* bug - fixed detection of nested Gradle projects. See [#165](https://github.com/redhat-developer/vscode-java/issues/165).


## 0.1.0 (March 30th, 2017)
* enhancement - Support starting the Java Language Server with JDK 9. See [#43](https://github.com/redhat-developer/vscode-java/issues/43).
* enhancement - add support for build-helper-maven-plugin. See [JLS#198](https://github.com/eclipse/eclipse.jdt.ls/issues/198).
* enhancement - add support for Maven compilerIds jdt, eclipse, javac-with-errorprone. See [JLS#196](https://github.com/eclipse/eclipse.jdt.ls/issues/196).
* enhancement - log Server's stderr/sdout in VS Code's console, to help troubleshooting. See [#172](https://github.com/redhat-developer/vscode-java/pull/172/).
* bug fix - [tentative] prevent workspace corruption on shutdown. See [JLS#199](https://github.com/eclipse/eclipse.jdt.ls/pull/199).
* bug fix - Opening standalone Java files fails to initialize the server. See [JLS#194](https://github.com/eclipse/eclipse.jdt.ls/issues/194).
* bug fix - Intellisense fails on package-less classes. See [#166](https://github.com/redhat-developer/vscode-java/issues/166).

## 0.0.13 (March 17th, 2017)
* bug fix - Java projects are no longer imported. See [#167](https://github.com/redhat-developer/vscode-java/issues/167).

## 0.0.12 (March 16th, 2017)
* enhancement - New `java.configuration.maven.userSettings` preference to set Maven's user settings.xml. See [JLS#184](https://github.com/eclipse/eclipse.jdt.ls/issues/184).
* enhancement - Adopt new VS Code SnippetString API. See [#99](https://github.com/redhat-developer/vscode-java/issues/99).
* bug fix - Saving a file doesn't update compilation errors on dependent classes. See [JLS#187](https://github.com/eclipse/eclipse.jdt.ls/issues/187).

## 0.0.11 (March 2nd, 2017)
* build - Now uses [Eclipse &trade; JDT Language Server](https://github.com/eclipse/eclipse.jdt.ls) under the hood. See [#152](https://github.com/redhat-developer/vscode-java/issues/152).
* enhancement - Maven errors are reported. See [JLS#85](https://github.com/eclipse/eclipse.jdt.ls/issues/85).
* enhancement - Code Actions for adding missing quote, removing unused import and superfluous semicolon. See [JLS#15](https://github.com/eclipse/eclipse.jdt.ls/issues/15).
* bug fix - correct Javadoc highlighting. See [#94](https://github.com/redhat-developer/vscode-java/issues/94)

## 0.0.10 (February 08th, 2017)
* enhancement - Improve intellisense performance. See [#121](https://github.com/redhat-developer/vscode-java/issues/121).
* enhancement - Document server tracing capabilities. See [#145](https://github.com/redhat-developer/vscode-java/issues/145).
* enhancement - Disable reference code lenses with `java.referencesCodeLens.enabled`. See [#148](https://github.com/redhat-developer/vscode-java/issues/148).
* bug fix - fix dubious intellisense relevance. See [#142](https://github.com/redhat-developer/vscode-java/issues/142).
* bug fix - fix broken autocompletion on constructors. See [#143](https://github.com/redhat-developer/vscode-java/issues/143).
* bug fix - fix brackets/parentheses autoclosing. See [#144](https://github.com/redhat-developer/vscode-java/issues/144).

## 0.0.9 (January 16th, 2017)
* enhancement - Autoclose Javadoc statements, adding `*` on new lines. See [#139](https://github.com/redhat-developer/vscode-java/issues/139).
* bug fix - fix Error when `Go to definition` performed on non-code portion. See [#124](https://github.com/redhat-developer/vscode-java/issues/124).
* bug fix - fix saving `java.errors.incompleteClasspath.severity` preference. See [#128](https://github.com/redhat-developer/vscode-java/issues/128).
* bug fix - fix NPE occurring when clicking on comment section of a Java file. See [#131](https://github.com/redhat-developer/vscode-java/issues/131).
* bug fix - fix JAVA_HOME detection on MacOS. See [#134](https://github.com/redhat-developer/vscode-java/issues/134).
* bug fix - fix support for quoted VM arguments. See [#135](https://github.com/redhat-developer/vscode-java/issues/135).
* bug fix - Don't display Code Lenses from Lombok-generated code. See [#137](https://github.com/redhat-developer/vscode-java/issues/137).
* bug fix - remove langserver.log file generation under home directory. See [#140](https://github.com/redhat-developer/vscode-java/issues/140).

## 0.0.8 (December 22nd, 2016)
* enhancement - Add basic Java Gradle support (Android not supported). See [#10](https://github.com/redhat-developer/vscode-java/issues/10).
* enhancement - Disable warning about `Incomplete Classpath`. See [#107](https://github.com/redhat-developer/vscode-java/issues/107).
* enhancement - new `Update project configuration` command (`Ctrl+Alt+U` or `Cmd+Alt+U` on MacOS). See [#113](https://github.com/redhat-developer/vscode-java/issues/113).
* enhancement - Automatically update java classpath/configuration on build file change. See [#122](https://github.com/redhat-developer/vscode-java/issues/122).
* bug fix - fix completion on import statements. See [#68](https://github.com/redhat-developer/vscode-java/issues/68).
* bug fix - fix errors when modifying eclipse configuration files. See [#105](https://github.com/redhat-developer/vscode-java/issues/105).
* bug fix - fix errors when restoring deleted files from git. See [#109](https://github.com/redhat-developer/vscode-java/issues/109).
* bug fix - invalid locations for Workspace-wide errors. See [JLS#107](https://github.com/gorkem/java-language-server/issues/107).

## 0.0.7 (November 23rd, 2016)
* enhancement - Basic Java support for standalone Java files. See [#27](https://github.com/redhat-developer/vscode-java/issues/27).
* enhancement - Start Java Language Server when pom.xml is detected. See [#84](https://github.com/redhat-developer/vscode-java/issues/84).
* bug fix - fix out of synch error markers. See [#87](https://github.com/redhat-developer/vscode-java/issues/87)
* bug fix - fix missing generic types in autocompletion. See [#69](https://github.com/redhat-developer/vscode-java/issues/69).
* bug fix - fix ignored `jdt.ls.vmargs`. See [#88](https://github.com/redhat-developer/vscode-java/pull/88).

## 0.0.6 (November 1st, 2016)
* enhancement - auto-import packages referenced by code complete. See [#50](https://github.com/gorkem/java-language-server/issues/50).
* enhancement – report Java errors for all files project in the project. See [58](https://github.com/gorkem/java-language-server/issues/58).
* enhancement – Display package names on code completion proposals for Types [#47] (https://github.com/gorkem/java-language-server/issues/47).
* enhancement - add support for the JDK_HOME environment variable in VS Code settings. See [#65](https://github.com/redhat-developer/vscode-java/issues/65).
* enhancement - add Java code snippets. See [#83](https://github.com/redhat-developer/vscode-java/issues/83).
* bug fix - fix errors thrown when opening a standalone file. See [#55](https://github.com/redhat-developer/vscode-java/issues/55), [#67](https://github.com/redhat-developer/vscode-java/issues/67).
* bug fix - fix JAVA_HOME detection mechanism. See [#74](https://github.com/redhat-developer/vscode-java/issues/74).


## 0.0.5 (October 13th, 2016)
* enhancement - configure extra VM arguments in VS Code settings, used to launch the Java Language Server. See [#25](https://github.com/redhat-developer/vscode-java/issues/25).
* enhancement - configure java.home property in VS Code settings. See [#28](https://github.com/redhat-developer/vscode-java/issues/28).
* enhancement - improve Javadoc formatting on hover (scrollbar). See [#31](https://github.com/redhat-developer/vscode-java/issues/31).
* enhancement - add feedback when starting the Java Language Server. See [#49](https://github.com/redhat-developer/vscode-java/issues/49).
* enhancement - add hover for package fragments. See [JLS#84](https://github.com/gorkem/java-language-server/pull/84).
* enhancement - better relevance for code completion. See [JLS#77](https://github.com/gorkem/java-language-server/pull/77).
* bug fix - fix Java Language Server downloading when using a Proxy (take 2). See [#42](https://github.com/redhat-developer/vscode-java/issues/42).
* bug fix - fix race condition on Java Language Server start. See [JLS#81](https://github.com/gorkem/java-language-server/pull/81).

## 0.0.4 (September 26th, 2016)
* enhancement - improved Javadoc/Markdown formatting. See [#13](https://github.com/redhat-developer/vscode-java/issues/13).
* enhancement - provide Java Language Server download feedback. See [#20](https://github.com/redhat-developer/vscode-java/issues/20).
* enhancement - provide syntax highlighting for opened `.class` files. See [#21](https://github.com/redhat-developer/vscode-java/issues/21).
* enhancement - provide link to Oracle JDK downloads on MacOS. See [#37](https://github.com/redhat-developer/vscode-java/issues/37).
* enhancement - provide better information on JDK/JAVA_HOME requirements. See [#32](https://github.com/redhat-developer/vscode-java/issues/32).
* bug fix - prevent java.lang.NullPointerException in DocumentLifeCycleHandler. See [#34](https://github.com/redhat-developer/vscode-java/issues/34).
* bug fix - fix Java Language Server downloading when using a Proxy. See [#35](https://github.com/redhat-developer/vscode-java/issues/35).
* bug fix - fix Java Language Server headers format. See [JLS#74](https://github.com/gorkem/java-language-server/issues/74).
* bug fix - fix project import reporting progress > 100%. See [JLS#67](https://github.com/gorkem/java-language-server/issues/67).

## 0.0.3 (September 16th, 2016)
* enhancement - In addition to maven, we now support basic Eclipse projects. See [JLS#37](https://github.com/gorkem/java-language-server/issues/37).
* enhancement - Go to Definition (<kbd>F12</kbd>) is enabled for libraries and can display Java code that is not part of project's source code
* enhancement - Code complete triggers are added for `.#@` characters. See [#19](https://github.com/redhat-developer/vscode-java/issues/19).
* bug fix - Opening a Maven project a 2nd time doesn't work. See [JLS#66](https://github.com/gorkem/java-language-server/issues/66).

## 0.0.2 (September 14th, 2016)
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
