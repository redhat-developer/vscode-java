# Data collection

vscode-java has opt-in telemetry collection, provided by [vscode-redhat-telemetry](https://github.com/redhat-developer/vscode-redhat-telemetry).

## What's included in the vscode-java telemetry data

 * vscode-java emits telemetry events when the extension starts and stops,
   which contain the common data mentioned on the
   [vscode-redhat-telemetry page](https://github.com/redhat-developer/vscode-redhat-telemetry/blob/main/USAGE_DATA.md#common-data).
 * The name of the build tool used to import a project (eg. Maven, Gradle, Invisible (project), etc.)
 * The total number of Java projects within the workspace
 * The lowest and highest Java compiler source level used (eg. 11 & 17)
 * Whether the project(s) are being imported for the first time (eg. true)
 * The elapsed time (in milliseconds) at which the language server initialized the workspace project(s), declared as ready for requests, and completed building the project(s)
 * The number of libraries that were indexed after project initialization
 * The total size (in bytes) of libraries that were indexed after project initialization
 * The number of error markers on the project(s)
 * The number of unresolved imports within the project(s)
 * Errors relating to running the language server, such as the message & stacktrace
 * Whether there is a mismatch between the project's requested source level, and the JDK used for the project (eg. true)
 * Information about the following settings. In the case of settings that store a well defined value (eg. path/url/string), we simply collect whether the setting has been set.
   * `java.settings.url`, `java.format.settings.url`, `java.quickfix.showAt`, `java.symbols.includeSourceMethodDeclarations`, `java.completion.collapseCompletionItems`, `java.completion.guessMethodArguments`, `java.completion.postfix.enabled`, `java.cleanup.actionsOnSave`, `java.sharedIndexes.enabled`, `java.inlayHints.parameterNames.enabled`, `java.server.launchMode`, `java.autobuild.enabled`, `java.jdt.ls.javac.enabled`
 * The extension name and the choice made when a recommendation to install a 3rd party extension is proposed
 * The name of Java commands being manually executed, and any resulting errors
 * The number of results (eg. 20), whether an error occurred (eg. false), engine type (eg. 'ecj', 'dom') and duration (in milliseconds) when code assist is activated
 * Whether the language server ran out of memory and the maximum allocated memory at which that occurred (eg. 200m)
 
## What's included in the general telemetry data

Please see the
[vscode-redhat-telemetry data collection information](https://github.com/redhat-developer/vscode-redhat-telemetry/blob/HEAD/USAGE_DATA.md#usage-data-being-collected-by-red-hat-extensions)
for information on what data it collects.

## How to opt in or out

Use the `redhat.telemetry.enabled` setting in order to enable or disable telemetry collection.

This extension also abides by Visual Studio Code's telemetry level: if `telemetry.telemetryLevel` is set to `off`, then no telemetry events will be sent to Red Hat, even if `redhat.telemetry.enabled` is set to `true`. If `telemetry.telemetryLevel` is set to `error` or `crash`, only events containing an error or errors property will be sent to Red Hat.
