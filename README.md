Language support for Java &trade; for Visual Studio Code
=====================

[![Visual Studio Marketplace](https://img.shields.io/visual-studio-marketplace/v/redhat.java?style=for-the-badge&label=VS%20Marketplace&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=redhat.java)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/redhat.java?style=for-the-badge)](https://marketplace.visualstudio.com/items?itemName=redhat.java)
[![Join the chat at https://gitter.im/redhat-developer/vscode-java](https://img.shields.io/gitter/room/redhat-developer/vscode-java?style=for-the-badge&logo=gitter)](https://gitter.im/redhat-developer/vscode-java)
[![Build Status](https://img.shields.io/github/actions/workflow/status/redhat-developer/vscode-java/pr-verify.yml?branch=master&style=for-the-badge&logo=github)](https://github.com/redhat-developer/vscode-java/actions?query=workflow:pr-verify)
[![License](https://img.shields.io/github/license/redhat-developer/vscode-java?style=for-the-badge&logo=eclipse)](https://github.com/redhat-developer/vscode-java/blob/master/LICENSE)

Provides Java &trade; language support via
[Eclipse &trade; JDT Language Server](https://github.com/eclipse/eclipse.jdt.ls), which utilizes
[Eclipse &trade; JDT](http://www.eclipse.org/jdt/), [M2Eclipse](http://www.eclipse.org/m2e/) and [Buildship](https://github.com/eclipse/buildship).

Quick Start
============
1. Install the Extension
2. On the following platforms, the extension should activate without any setup : `win32-x64`, `darwin-x64`, `darwin-arm64`, `linux-x64`, `linux-arm64`.\
If on another platform, or using the "universal" version, you can [set](#setting-the-jdk) a _Java_ Development Kit. It must be Java 17 or above.
3. Optionally, download and install a Java Development Kit for your project (Java 1.5 or above is supported). See [Project JDKs](#project-jdks) for more details
4. Extension is activated when you first access a Java file
    * Recognizes projects with *Maven* or *Gradle* build files in the directory hierarchy.

Features
=========
![ screencast ](https://raw.githubusercontent.com/redhat-developer/vscode-java/master/images/vscode-java.0.0.1.gif)

* Supports code from Java 1.8 to Java 22
* Maven pom.xml project support
* Gradle project support (with experimental Android project import support)
* Standalone Java files support
* As-you-type reporting of parsing and compilation errors
* Code completion
* Code/Source actions / Refactoring
* Javadoc hovers
* Organize imports
	- triggered manually or on save
	- when pasting code into a java file with `Ctrl+Shift+v` (`Cmd+Shift+v` on Mac).
* Type search
* Code outline
* Code folding
* Code navigation
* Code lens (references/implementations)
* Highlights
* Code formatting (on-type/selection/file)
* Code snippets
* Annotation processing support (automatic for Maven projects)
* Semantic selection
* Diagnostic tags
* Call Hierarchy
* Type Hierarchy

To launch and debug your Java programs, it's recommended you install *[Java Debug Extension for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-java-debug)*.

See the [changelog](CHANGELOG.md) for the latest release. You might also find useful information in the project [Wiki](https://github.com/redhat-developer/vscode-java/wiki).

Setting the JDK
===============
## Java Tooling JDK
Now that Java extension will publish platform specific versions, it will embed a JRE for supported platforms such as `win32-x64`, `linux-x64`, `linux-arm64`, `darwin-x64`, `darwin-arm64`. The embedded JRE is used to launch the Language Server for Java. Users are only responsible for configuring [Project JDKs](#project-jdks) to compile your Java projects.

The following part is only kept for the universal version without embedded JRE.

>The tooling JDK will be used to launch the Language Server for Java. And by default, will also be used to compile your projects. Java 17 is the minimum required version.\
\
The path to the Java Development Kit can be specified by the `java.jdt.ls.java.home` setting in VS Code settings (workspace/user settings). If not specified, it is searched in the following order until a JDK meets current minimum requirement.
>- the `JDK_HOME` environment variable
>- the `JAVA_HOME` environment variable
>- on the current system path

## Project JDKs
If you need to compile your projects against a different JDK version, it's recommended you configure the `java.configuration.runtimes` property in your user settings, eg:

```json
"java.configuration.runtimes": [
  {
    "name": "JavaSE-1.8",
    "path": "/path/to/jdk-8",
  },
  {
    "name": "JavaSE-11",
    "path": "/path/to/jdk-11",
  },
  {
    "name": "JavaSE-22",
    "path": "/path/to/jdk-22",
    "default": true
  },
]
```
The default runtime will be used when you open standalone Java files.

Available commands
==========================
The following commands are available:
- `Switch to Standard Mode`: switches the Java Language Server to `Standard` mode. This command is only available when the Java Language Server is in `LightWeight` mode.
- `Java: Reload Projects` (`Shift+Alt+U`): It forces project configuration / classpath updates (eg. dependency changes or Java compilation level), according to the project build descriptor.
- `Java: Import Java Projects into Workspace`: detects and imports all the Java projects into the Java Language Server workspace.
- `Java: Open Java Language Server Log File`: opens the Java Language Server log file, useful for troubleshooting problems.
- `Java: Open Java Extension Log File`: opens the Java extension log file, useful for troubleshooting problems.
- `Java: Open All Log Files`: opens both the Java Language Server log file and the Java extension log file.
- `Java: Force Java Compilation` (`Shift+Alt+B`): manually triggers compilation of the workspace.
- `Java: Rebuild Projects`: manually triggers a full build of the selected projects.
- `Java: Open Java Formatter Settings`: opens the Eclipse formatter settings. Creates a new settings file if none exists.
- `Java: Clean Java Language Server Workspace`: cleans the Java language server workspace.
- `Java: Attach Source`: attaches a jar/zip source to the currently opened binary class file. This command is only available in the editor context menu.
- `Java: Add Folder to Java Source Path`: adds the selected folder to its project source path. This command is only available in the file explorer context menu and only works for unmanaged folders.
- `Java: Remove Folder from Java Source Path`: removes the selected folder from its project source path. This command is only available in the file explorer context menu and only works for unmanaged folders.
- `Java: List All Java Source Paths`: lists all the Java source paths recognized by the Java Language Server workspace.
- `Java: Show Build Job Status`: shows the Java Language Server job status in Visual Studio Code terminal.
- `Java: Go to Super Implementation`: goes to the super implementation for the current selected symbol in editor.
- `Java: Restart Java Language Server`: restarts the Java language server.

Supported VS Code settings
==========================
The following settings are supported:

* `java.home` : **Deprecated, please use 'java.jdt.ls.java.home' instead.** Absolute path to JDK home folder used to launch the Java Language Server. Requires VS Code restart.
* `java.jdt.ls.lombokSupport.enabled`: Whether to enable lombok support. Defaults to `true`.
* `java.jdt.ls.vmargs` : Extra VM arguments used to launch the Java Language Server. Requires VS Code restart.
* `java.errors.incompleteClasspath.severity` : Specifies the severity of the message when the classpath is incomplete for a Java file. Supported values are `ignore`, `info`, `warning`, `error`.
* `java.trace.server` : Traces the communication between VS Code and the Java language server.
* `java.configuration.updateBuildConfiguration` : Specifies how modifications on build files update the Java classpath/configuration. Supported values are `disabled` (nothing happens), `interactive` (asks about updating on every modification), `automatic` (updating is automatically triggered).
* `java.configuration.maven.userSettings` : Path to Maven's user settings.xml.
* `java.configuration.checkProjectSettingsExclusions`: **Deprecated, please use 'java.import.generatesMetadataFilesAtProjectRoot' to control whether to generate the project metadata files at the project root. And use 'files.exclude' to control whether to hide the project metadata files from the file explorer.** Controls whether to exclude extension-generated project settings files (`.project`, `.classpath`, `.factorypath`, `.settings/`) from the file explorer. Defaults to `false`.
* `java.referencesCodeLens.enabled` : Enable/disable the references code lenses.
* `java.implementationsCodeLens.enabled` : Enable/disable the implementations code lenses.
* `java.signatureHelp.enabled` : Enable/disable signature help support (triggered on `(`).
* `java.signatureHelp.description.enabled` : Enable/disable to show the description in signature help. Defaults to `false`.
* `java.contentProvider.preferred` : Preferred content provider (see 3rd party decompilers available in [vscode-java-decompiler](https://github.com/dgileadi/vscode-java-decompiler)).
* `java.import.exclusions` : Exclude folders from import via glob patterns. Use `!` to negate patterns to allow subfolders imports. You have to include a parent directory. The order is important.
* `java.import.gradle.enabled` : Enable/disable the Gradle importer.
* Specify the Gradle distribution used by the Java extension:
  * `java.import.gradle.wrapper.enabled`: Use Gradle from the 'gradle-wrapper.properties' file. Defaults to `true`.
  * `java.import.gradle.version`: Use Gradle from the specific version if the Gradle wrapper is missing or disabled.
  * `java.import.gradle.home`: Use Gradle from the specified local installation directory or GRADLE_HOME if the Gradle wrapper is missing or disabled and no 'java.import.gradle.version' is specified.
* `java.import.gradle.arguments`: Arguments to pass to Gradle.
* `java.import.gradle.jvmArguments`: JVM arguments to pass to Gradle.
* `java.import.gradle.user.home`: setting for GRADLE_USER_HOME.
* `java.import.gradle.offline.enabled`: Enable/disable the Gradle offline mode. Defaults to `false`.
* `java.import.maven.enabled` : Enable/disable the Maven importer.
* `java.autobuild.enabled` : Enable/disable the 'auto build'.
* `java.maxConcurrentBuilds`: Set max simultaneous project builds.
* `java.completion.enabled` : Enable/disable code completion support.
* `java.completion.guessMethodArguments` : Specify how the arguments will be filled during completion. Defaults to `auto`.
  - `auto`: Use `off` only when using Visual Studio Code - Insiders, other platform will defaults to `insertBestGuessedArguments`.
  - `off`: Method arguments will not be inserted during completion.
  - `insertParameterNames`: The parameter names will be inserted during completion.
  - `insertBestGuessedArguments`: The best guessed arguments will be inserted during completion according to the code context.
* `java.completion.filteredTypes`: Defines the type filters. All types whose fully qualified name matches the selected filter strings will be ignored in content assist or quick fix proposals and when organizing imports. For example 'java.awt.*' will hide all types from the awt packages.
* `java.completion.favoriteStaticMembers` : Defines a list of static members or types with static members.
* `java.completion.importOrder` : Defines the sorting order of import statements.
* `java.format.enabled` : Enable/disable the default Java formatter.
* `java.format.settings.url` : Specifies the url or file path to the [Eclipse formatter xml settings](https://github.com/redhat-developer/vscode-java/wiki/Formatter-settings).
* `java.format.settings.profile` : Optional formatter profile name from the Eclipse formatter settings.
* `java.format.comments.enabled` : Includes the comments during code formatting.
* `java.format.onType.enabled` : Enable/disable on-type formatting (triggered on `;`, `}` or `<return>`).
* `java.foldingRange.enabled`: Enable/disable smart folding range support. If disabled, it will use the default indentation-based folding range provided by VS Code.
* `java.maven.downloadSources`: Enable/disable download of Maven source artifacts as part of importing Maven projects.
* `java.maven.updateSnapshots`: Force update of Snapshots/Releases. Defaults to `false`.
* `java.codeGeneration.hashCodeEquals.useInstanceof`: Use 'instanceof' to compare types when generating the hashCode and equals methods. Defaults to `false`.
* `java.codeGeneration.hashCodeEquals.useJava7Objects`: Use Objects.hash and Objects.equals when generating the hashCode and equals methods. This setting only applies to Java 7 and higher. Defaults to `false`.
* `java.codeGeneration.useBlocks`: Use blocks in 'if' statements when generating the methods. Defaults to `false`.
* `java.codeGeneration.generateComments`: Generate method comments when generating the methods. Defaults to `false`.
* `java.codeGeneration.toString.template`: The template for generating the toString method. Defaults to `${object.className} [${member.name()}=${member.value}, ${otherMembers}]`.
* `java.codeGeneration.toString.codeStyle`: The code style for generating the toString method. Defaults to `STRING_CONCATENATION`.
* `java.codeGeneration.toString.skipNullValues`: Skip null values when generating the toString method. Defaults to `false`.
* `java.codeGeneration.toString.listArrayContents`: List contents of arrays instead of using native toString(). Defaults to `true`.
* `java.codeGeneration.toString.limitElements`: Limit number of items in arrays/collections/maps to list, if 0 then list all. Defaults to `0`.
* `java.selectionRange.enabled`: Enable/disable Smart Selection support for Java. Disabling this option will not affect the VS Code built-in word-based and bracket-based smart selection.
* `java.showBuildStatusOnStart.enabled`: Automatically show build status on startup, defaults to `notification`.
  - `notification`: Show the build status via progress notification.
  - `terminal`: Show the build status via terminal.
  - `off`: Do not show any build status.
  > For backward compatibility, this setting also accepts boolean value, where `true` has the same meaning as `notification` and `false` has the same meaning as `off`.
* `java.project.outputPath`: A relative path to the workspace where stores the compiled output. `Only` effective in the `WORKSPACE` scope. The setting will `NOT` affect Maven or Gradle project.
* `java.project.referencedLibraries`: Configure glob patterns for referencing local libraries to a Java project.
* `java.completion.maxResults`: Maximum number of completion results (not including snippets). `0` (the default value) disables the limit, all results are returned. In case of performance problems, consider setting a sensible limit.
* `java.configuration.runtimes`: Map Java Execution Environments to local JDKs.
* `java.server.launchMode`:
  - `Standard`: Provides full features such as intellisense, refactoring, building, Maven/Gradle support etc.
  - `LightWeight`: Starts a syntax server with lower start-up cost. Only provides syntax features such as outline, navigation, javadoc, syntax errors. The lightweight mode won't load thirdparty extensions, such as java test runner, java debugger, etc.
  - `Hybrid`: Provides full features with better responsiveness. It starts a standard language server and a secondary syntax server. The syntax server provides syntax features until the standard server is ready. And the syntax server will be shutdown automatically after the standard server is fully ready.

  Default launch mode is `Hybrid`. Legacy mode is `Standard`
* `java.sources.organizeImports.starThreshold`: Specifies the number of imports added before a star-import declaration is used, default is 99.
* `java.sources.organizeImports.staticStarThreshold`: Specifies the number of static imports added before a star-import declaration is used, default is 99.
* `java.imports.gradle.wrapper.checksums`: Defines allowed/disallowed SHA-256 checksums of Gradle Wrappers.
* `java.project.importOnFirstTimeStartup`: Specifies whether to import the Java projects, when opening the folder in Hybrid mode for the first time. Supported values are `disabled` (never imports), `interactive` (asks to import or not), `automatic` (always imports). Default to `automatic`.
* `java.project.importHint`: Enable/disable the server-mode switch information, when Java projects import is skipped on startup. Defaults to `true`.
* `java.import.gradle.java.home`: Specifies the location to the JVM used to run the Gradle daemon.
* `java.project.resourceFilters`: Excludes files and folders from being refreshed by the Java Language Server, which can improve the overall performance. For example, ["node_modules","\.git"] will exclude all files and folders named 'node_modules' or '.git'. Pattern expressions must be compatible with `java.util.regex.Pattern`. Defaults to ["node_modules","\.git"].
* `java.templates.fileHeader`: Specifies the file header comment for new Java file. Supports configuring multi-line comments with an array of strings, and using ${variable} to reference the [predefined variables](https://github.com/redhat-developer/vscode-java/wiki/Predefined-Variables-for-Java-Template-Snippets).
* `java.templates.typeComment`: Specifies the type comment for new Java type. Supports configuring multi-line comments with an array of strings, and using ${variable} to reference the [predefined variables](https://github.com/redhat-developer/vscode-java/wiki/Predefined-Variables-for-Java-Template-Snippets).
* `java.references.includeAccessors`: Include getter, setter and builder/constructor when finding references. Default to true.
* `java.configuration.maven.globalSettings` : Path to Maven's global settings.xml.
* `java.configuration.maven.lifecycleMappings` : Path to Maven's lifecycle mappings xml.
* `java.eclipse.downloadSources` : Enable/disable download of Maven source artifacts for Eclipse projects.
* `java.references.includeDecompiledSources` : Include the decompiled sources when finding references. Default to true.
* `java.project.sourcePaths`: Relative paths to the workspace where stores the source files. `Only` effective in the `WORKSPACE` scope. The setting will `NOT` affect Maven or Gradle project.
* `java.typeHierarchy.lazyLoad`: Enable/disable lazy loading the content in type hierarchy. Lazy loading could save a lot of loading time but every type should be expanded manually to load its content.
* `java.codeGeneration.insertionLocation`: Specifies the insertion location of the code generated by source actions. Defaults to `afterCursor`.
  - `afterCursor`: Insert the generated code after the member where the cursor is located.
  - `beforeCursor`: Insert the generated code before the member where the cursor is located.
  - `lastMember`: Insert the generated code as the last member of the target type.
* `java.codeGeneration.addFinalForNewDeclaration`: Whether to generate the 'final' modifer for code actions that create new declarations. Defaults to `none`.
  - `none`: Do not generate final modifier
  - `fields`: Generate 'final' modifier only for new field declarations
  - `variables`: Generate 'final' modifier only for new variable declarations
  - `all`: Generate 'final' modifier for all new declarations
* `java.settings.url` : Specifies the url or file path to the workspace Java settings. See [Setting Global Preferences](https://github.com/redhat-developer/vscode-java/wiki/Settings-Global-Preferences)
* `java.symbols.includeSourceMethodDeclarations` : Include method declarations from source files in symbol search. Defaults to `false`.
* `java.quickfix.showAt` : Show quickfixes at the problem or line level.
* `java.configuration.workspaceCacheLimit` : The number of days (if enabled) to keep unused workspace cache data. Beyond this limit, cached workspace data may be removed.
* `java.import.generatesMetadataFilesAtProjectRoot` : Specify whether the project metadata files(.project, .classpath, .factorypath, .settings/) will be generated at the project root. Defaults to `false`.
* `java.inlayHints.parameterNames.enabled`: Enable/disable inlay hints for parameter names. Supported values are: `none`(disable parameter name hints), `literals`(Enable parameter name hints only for literal arguments) and `all`(Enable parameter name hints for literal and non-literal arguments). Defaults to `literals`.
* `java.compile.nullAnalysis.nonnull`: Specify the Nonnull annotation types to be used for null analysis. If more than one annotation is specified, then the topmost annotation will be used first if it exists in your project dependencies. This setting will be ignored if `java.compile.nullAnalysis.mode` is set to `disabled`.
* `java.compile.nullAnalysis.nullable`: Specify the Nullable annotation types to be used for null analysis. If more than one annotation is specified, then the topmost annotation will be used first if it exists in your project dependencies. This setting will be ignored if `java.compile.nullAnalysis.mode` is set to `disabled`.
* `java.compile.nullAnalysis.nonnullbydefault`: Specify the NonNullByDefault annotation types to be used for null analysis. If more than one annotation is specified, then the topmost annotation will be used first if it exists in your project dependencies. This setting will be ignored if `java.compile.nullAnalysis.mode` is set to `disabled`.
* `java.import.maven.offline.enabled`: Enable/disable the Maven offline mode. Defaults to `false`.
* `java.codeAction.sortMembers.avoidVolatileChanges`: Reordering of fields, enum constants, and initializers can result in semantic and runtime changes due to different initialization and persistence order. This setting prevents this from occurring. Defaults to `true`.
* `java.jdt.ls.protobufSupport.enabled`: Specify whether to automatically add Protobuf output source directories to the classpath. **Note:** Only works for Gradle `com.google.protobuf` plugin `0.8.4` or higher. Defaults to `true`.
* `java.jdt.ls.androidSupport.enabled`: [Experimental] Specify whether to enable Android project importing. When set to `auto`, the Android support will be enabled in Visual Studio Code - Insiders. **Note:** Only works for Android Gradle Plugin `3.2.0` or higher. Defaults to `auto`.
* `java.completion.postfix.enabled`: Enable/disable postfix completion support. Defaults to `true`.
* `java.completion.chain.enabled`: Enable/disable chain completion support. Defaults to `false`.
* `java.completion.matchCase`: Specify whether to match case for code completion. Defaults to `firstLetter`.
* `java.compile.nullAnalysis.mode`: Specify how to enable the annotation-based null analysis. Supported values are `disabled` (disable the null analysis), `interactive` (asks when null annotation types are detected), `automatic` (automatically enable null analysis when null annotation types are detected). Defaults to `interactive`.
* `java.cleanup.actionsOnSave`: **Deprecated, please use 'java.cleanup.actions' instead.** The list of clean ups to be run on the current document when it's saved. Clean ups can automatically fix code style or programming mistakes. [Click here](document/_java.learnMoreAboutCleanUps.md#java-clean-ups) to learn more about what each clean up does.
* `java.cleanup.actions`: The list of clean ups to be run on the current document when it's saved or when the cleanup command is issued. Clean ups can automatically fix code style or programming mistakes. [Click here](document/_java.learnMoreAboutCleanUps.md#java-clean-ups) to learn more about what each clean up does.
* `java.saveActions.cleanup`: Enable/disable cleanup actions on save.
* `java.import.gradle.annotationProcessing.enabled`: Enable/disable the annotation processing on Gradle projects and delegate to JDT APT. Only works for Gradle 5.2 or higher.
* `java.sharedIndexes.enabled`: [Experimental] Specify whether to share indexes between different workspaces. Defaults to `auto` and the shared indexes is automatically enabled in Visual Studio Code - Insiders.
  - auto
  - on
  - off
* `java.sharedIndexes.location`: Specifies a common index location for all workspaces. See default values as follows:
  - Windows: First use `"$APPDATA\\.jdt\\index"`, or `"~\\.jdt\\index"` if it does not exist
  - macOS: `"~/Library/Caches/.jdt/index"`
  - Linux: First use `"$XDG_CACHE_HOME/.jdt/index"`, or `"~/.cache/.jdt/index"` if it does not exist
* `java.refactoring.extract.interface.replace`: Specify whether to replace all the occurrences of the subtype with the new extracted interface. Defaults to `true`.
* `java.import.maven.disableTestClasspathFlag` : Enable/disable test classpath segregation. When enabled, this permits the usage of test resources within a Maven project as dependencies within the compile scope of other projects. Defaults to `false`.
* `java.configuration.maven.defaultMojoExecutionAction` : Specifies default mojo execution action when no associated metadata can be detected. Defaults to `ignore`.
* `java.completion.lazyResolveTextEdit.enabled`: [Experimental] Enable/disable lazily resolving text edits for code completion. Defaults to `true`.
* `java.edit.validateAllOpenBuffersOnChanges`: Specifies whether to recheck all open Java files for diagnostics when editing a Java file. Defaults to `false`.
* `java.editor.reloadChangedSources`: Specifies whether to reload the sources of the open class files when their source jar files are changed. Defaults to `ask`.
  - `ask`: Ask to reload the sources of the open class files
  - `auto`: Automatically reload the sources of the open class files
  - `manual`: Manually reload the sources of the open class files
* `java.edit.smartSemicolonDetection.enabled`: Defines the `smart semicolon` detection. Defaults to `false`.
* `java.configuration.detectJdksAtStart`: Automatically detect JDKs installed on local machine at startup. If you have specified the same JDK version in `java.configuration.runtimes`, the extension will use that version first. Defaults to `true`.
* `java.completion.collapseCompletionItems`: Enable/disable the collapse of overloaded methods in completion items. Overrides `java.completion.guessMethodArguments`. Defaults to `false`.
* `java.diagnostic.filter`: Specifies a list of file patterns for which matching documents should not have their diagnostics reported (eg. '**/Foo.java').

Semantic Highlighting
===============
[Semantic Highlighting](https://github.com/redhat-developer/vscode-java/wiki/Semantic-Highlighting) fixes numerous syntax highlighting issues with the default Java Textmate grammar. However, you might experience a few minor issues, particularly a delay when it kicks in, as it needs to be computed by the Java Language server, when opening a new file or when typing. Semantic highlighting can be disabled for all languages using the `editor.semanticHighlighting.enabled` setting, or for Java only using [language-specific editor settings](https://code.visualstudio.com/docs/getstarted/settings#_languagespecific-editor-settings).

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

Also, you can contribute your own VS Code extension to enhance the existing features by following the instructions [here](https://github.com/redhat-developer/vscode-java/wiki/Contribute-a-Java-Extension).

Feedback
===============
* Have a question? Start a discussion on [GitHub Discussions](https://github.com/redhat-developer/vscode-java/discussions),
* File a bug in [GitHub Issues](https://github.com/redhat-developer/vscode-java/issues),
* Chat with us on [Gitter](https://gitter.im/redhat-developer/vscode-java),
* [Tweet us](https://twitter.com/VSCodeJava/) with other feedback.


License
===============
EPL 2.0, See [LICENSE](LICENSE) for more information.
