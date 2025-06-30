# Change Log

## 1.43.1 (July 1st, 2025)
* bug fix - Fix compilation issue when annotation exists on a record class. [#4096](https://github.com/redhat-developer/vscode-java/issues/4096)

## 1.43.0 (June 26th, 2025)
 * performance - "Rebuild Projects" command should be done incrementally. See [#4041](https://github.com/redhat-developer/vscode-java/pull/4041).
 * enhancement - Adopt quick fixes for various modifier corrections. See [JLS#1053](https://github.com/eclipse-jdtls/eclipse.jdt.ls/issues/1053).
   - `BodyForNativeMethod`, `MethodRequiresBody`, `OuterLocalMustBeEffectivelyFinal`,
   - `MissingSynchronizedModifierInInheritedMethod`, `MethodCanBeStatic`, `OverridingDeprecatedMethod`
 * enhancement - Add cleanups for various redundant modifiers/expressions/statements. See [#4066](https://github.com/redhat-developer/vscode-java/issues/4066).
 * enhancement - Increase default value for maximum heap size (`Xmx`) from `1G` to `2G`. See [#4062](https://github.com/redhat-developer/vscode-java/pull/4062).
 * bug fix - Fix issues with Lombok `@Builder` annotation on `record` type declarations. See [#4050](https://github.com/redhat-developer/vscode-java/issues/4050).
 * bug fix - Prevent code actions from failing with "Document does not match the AST". See [#4027](https://github.com/redhat-developer/vscode-java/issues/4027).
 * bug fix - Handle snippets when opened (empty) Java file triggers activation. See [#3940](https://github.com/redhat-developer/vscode-java/issues/3940).
 * bug fix - Remove JAXP entity limits when runtime is Java 24 or higher. See [#4071](https://github.com/redhat-developer/vscode-java/pull/4071).

## 1.42.0 (May 15th, 2025)
 * enhancement - Implement methods in newly created type from an inherited sealed class. See [JLS#1570](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/1570).
 * enhancement - Code action for "The left-hand side of an assginment must be a variable". See [JLS#3441](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/3441).
 * bug fix - Avoid `StackOverflowError` when computing Extended Outline. See [JLS#3435](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/3435).
 * bug fix - Compilation failure with primitive array comparison. See [#4020](https://github.com/redhat-developer/vscode-java/issues/4020).
 * bug fix - Avoid notifying of failures for workspace builds. See [#4032](https://github.com/redhat-developer/vscode-java/pull/4032).
 * bug fix - Report language server exiting with unsaved changes as `java.ls.error`. See [#4033](https://github.com/redhat-developer/vscode-java/pull/4033).
 * documentation - Javac-based (experimental) compilation should require latest released Java SDK (24). See [#4029](https://github.com/redhat-developer/vscode-java/issues/4029).
 * documentation - Fix return type typo in `qualifyMembers` example. See [#4026](https://github.com/redhat-developer/vscode-java/pull/4026).

## 1.41.1 (April 1st, 2025)
 * bug fix - Fix issues with preference manager by reverting "merge" behaviour. See [#3995](https://github.com/redhat-developer/vscode-java/issues/3995).
 * bug fix - Add missing "Create record" quick fix. See [#3988](https://github.com/redhat-developer/vscode-java/issues/3988).

## 1.41.0 (March 27th, 2025)
 * enhancement - Provide support for Java 24. See [#3983](https://github.com/redhat-developer/vscode-java/pull/3983).
 * enhancement - Add `Make static` refactoring. See [JLS#3400](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/3400).
 * enhancement - Adopt quick fixes for some more problems. See [JLS#3398](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/3398).
   - `MethodButWithConstructorName`, `UsingDeprecatedMethod`,
   - `VarIsNotAllowedHere`, `SwitchExpressionsReturnWithinSwitchExpression`
 * enhancement - Code action to ignore configurable compiler problems. See [#1791](https://github.com/redhat-developer/vscode-java/issues/1791).
 * bug fix - Fix indentation for snippet strings within code actions. See [#3970](https://github.com/redhat-developer/vscode-java/pull/3970).
 * bug fix - Only rename source file to match the single public type declaration. See [#3963](https://github.com/redhat-developer/vscode-java/issues/3963).
 * bug fix - Fix inherited document symbols to work for interfaces as well. See [#3972](https://github.com/redhat-developer/vscode-java/pull/3972).
 * bug fix - Detect changes to watched files that are outside of the workspace. [JLS#1765](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/1765), [JLS#3407](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/3407).
 * bug fix - Guard against `null` workspace edits (eg. for `Organize Imports`). See [#3978](https://github.com/redhat-developer/vscode-java/issues/3978).
 * bug fix - Guard against `null` completion item resolved on cancellation. See [#3973](https://github.com/redhat-developer/vscode-java/pull/3973).
 * bug fix - Fix commands test by including new commands. See [#3966](https://github.com/redhat-developer/vscode-java/pull/3966).
 * build - Fix `check_and_update_jdk` script by catching missing test URL. See [#3982](https://github.com/redhat-developer/vscode-java/pull/3982).
 * dependencies - Update serialize-javascript, mocha, sinon, css-loader. See [#3948](https://github.com/redhat-developer/vscode-java/pull/3948), [#3967](https://github.com/redhat-developer/vscode-java/pull/3967).

## 1.40.0 (February 27th, 2025)
 * enhancement - Support for inherited document symbols. See [#2342](https://github.com/redhat-developer/vscode-java/issues/2342).
 * enhancement - Introduce approximately 15 new quick fixes. See [JLS#3368](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/3368), [JLS#3372](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/3372).
 * enhancement - Introduce quick assist & cleanup converting a pattern-instanceof-if-chain to a switch statement. See [#3951](https://github.com/redhat-developer/vscode-java/pull/3951).
 * bug fix - Unicode characters not rendering correctly in decompiled file. See [#3949](https://github.com/redhat-developer/vscode-java/issues/3949).
 * bug fix - Fix a potential deadlock in search-based functionality. See [#3926](https://github.com/redhat-developer/vscode-java/issues/3926).
 * bug fix - Adopt the Lombok 1.18.36 release. See [#3939](https://github.com/redhat-developer/vscode-java/pull/3939).

## 1.39.0 (January 22nd, 2025)
 * performance - Enhance initialization of gradle projects. See [JLS#3357](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/3357).
 * enhancement - Implementation code lens for non interface/abstract base types/methods. See [JLS#3355](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/3355).
 * bug fix - Handle snippet position groups with undefined offsets (eg. `Add constructor ..`). See [#3905](https://github.com/redhat-developer/vscode-java/issues/3905).
 * bug fix - Ensure Gradle project always reacts to build configuration changes. See [#3893](https://github.com/redhat-developer/vscode-java/issues/3893).
 * bug fix - Update the `javac` build profile with new `--add-opens`. See [#3897](https://github.com/redhat-developer/vscode-java/issues/3897).
 * debt - Bump minimum required Java Execution Environment from 17 to 21. See [#3911](https://github.com/redhat-developer/vscode-java/pull/3911).

## 1.38.0 (December 19th, 2024)
 * enhancement - Add code lens for interface / abstract method implementations. See [#3813](https://github.com/redhat-developer/vscode-java/issues/3813).
   * `java.implementationCodeLens.enabled` replaced by `java.implementationCodeLens`
   *  Values for new setting are `"none"`, `"types"`, `"methods"`, `"all"`
 * enhancement - Add quick fix for sealed class within empty switch expression. See [JLS#3345](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/3345).
 * enhancement - Support code assist on unresolved types. See [#1123](https://github.com/redhat-developer/vscode-java/issues/1123).
 * bug fix - Improve rendering of Markdown Comments (JEP 467). See [JLS#3332](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/3332).
 * build - Check for updated snapshot repositories when running build. See [#3889](https://github.com/redhat-developer/vscode-java/pull/3889).
 * dependencies - Bump cross-spawn from 7.0.3 to 7.0.6. See [#3862](https://github.com/redhat-developer/vscode-java/pull/3862).
 * dependencies - Update vscode-redhat-telemetry to 0.9.1. See [#3886](https://github.com/redhat-developer/vscode-java/pull/3886).

## 1.37.0 (November 28th, 2024)
 * performance - Improve performance of code action requests. See [#3845](https://github.com/redhat-developer/vscode-java/pull/3845).
 * performance - Improve performance of all language server requests that resolve a document URI. See [JLS#3313](https://github.com/eclipse-jdtls/eclipse.jdt.ls/issues/3313).
 * enhancement - Code action for unused pattern variable, lambda parameter, etc. and the corresponding clean up. See [#3856](https://github.com/redhat-developer/vscode-java/pull/3856), [#3864](https://github.com/redhat-developer/vscode-java/pull/3864).
 * enhancement - Add setting to control inclusion of declarations in reference search. See [#3850](https://github.com/redhat-developer/vscode-java/issues/3850).
 * bug fix - Mapstruct implementation class not generated. See [#3836](https://github.com/redhat-developer/vscode-java/issues/3836).
 * bug fix - Open more requested system packages for tests with `javac` support. See [#3847](https://github.com/redhat-developer/vscode-java/pull/3847).
 * bug fix - Fix some typos in documentation. See [#3863](https://github.com/redhat-developer/vscode-java/pull/3863)
 * build - Add Maven (`-U`) flag for updating artifacts from snapshot repositories. See [#3848](https://github.com/redhat-developer/vscode-java/pull/3848).

## 1.36.0 (October 31st, 2024)
 * enhancement - Experimental support for using `javac` as the compiler. See [#3558](https://github.com/redhat-developer/vscode-java/pull/3558), [JLS#3167](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/3167).
   * `java.jdt.ls.javac.enabled`: Enables Javac-based compilation.
     * Requires running with **Java 23**. Make sure to use `java.jdt.ls.java.home` for this.
     * Defaults to `off`
   * `java.completion.engine`: Select code completion engine. (`ecj` or `dom`)
     * Requires `java.jdt.ls.javac.enabled` to be `on`
     * Defaults to `ecj`
 * enhancement - Automatically add `///` on new line when editing Markdown comments (JEP 467). See [#3801](https://github.com/redhat-developer/vscode-java/issues/3801).
 * bug fix - Re-enable dynamic code actions by fixing the URI comparison. See [#3792](https://github.com/redhat-developer/vscode-java/pull/3792).
 * bug fix - Intermittent failures to suggest Java core packages for completion & code actions. See [#3797](https://github.com/redhat-developer/vscode-java/issues/3797).
 * bug fix - `java.diagnostic.filter` is broken on Windows. See [JLS#3290](https://github.com/eclipse-jdtls/eclipse.jdt.ls/issues/3290).
 * bug fix - Type declaration snippets should respect `java.templates.typeComment`. See [JLS#3295](https://github.com/eclipse-jdtls/eclipse.jdt.ls/issues/3295).
 * bug fix - Linux release package files have excessive permissions. See [JLS#3293](https://github.com/eclipse-jdtls/eclipse.jdt.ls/issues/3293).
 * bug fix - Remove Dependency Analytics extension from being recommended. See [#3804](https://github.com/redhat-developer/vscode-java/pull/3804).
 * bug fix - Update embedded lombok library name to reflect actual version. See [#3833](https://github.com/redhat-developer/vscode-java/pull/3833).
 * dependencies - Use Node 20 in release-job only. See [#3809](https://github.com/redhat-developer/vscode-java/pull/3809).

## 1.35.1 (September 30th, 2024)
 * bug fix - Dynamic code actions fail on Windows. See [#3780](https://github.com/redhat-developer/vscode-java/issues/3780).

## 1.35.0 (September 26th, 2024)
 * performance - Consider token to limit the chains that are searched. See [JLS#2835](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/2835).
 * enhancement - Provide support for Java 23. See [#3774](https://github.com/redhat-developer/vscode-java/pull/3774).
 * enhancement - Show decompiled content directly on opened `.class` file. See [#3759](https://github.com/redhat-developer/vscode-java/issues/3759).
 * enhancement - Support dynamic code actions through LSP snippet syntax. See [#3686](https://github.com/redhat-developer/vscode-java/issues/3686).
 * enhancement - Introduce new type mismatch quickfix for constructor invocations. See [#3040](https://github.com/redhat-developer/vscode-java/issues/3040).
 * enhancement - Control scope for search operations (eg. references, call hierarchy, workspace symbols). See [#2649](https://github.com/redhat-developer/vscode-java/issues/2649).
 * enhancement - Add "Organize Imports" as a clean up. See [#3764](https://github.com/redhat-developer/vscode-java/pull/3764).
 * bug fix - Import Gradle project via. Buildship if Gradle Build Server is not available. See [JLS#3245](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/3245).
 * bug fix - Copy/paste will not escape content within String literal when code has error. See [#3761](https://github.com/redhat-developer/vscode-java/issues/3761).
 * bug fix - Respect `unwantedRecommendations`. See [#3767](https://github.com/redhat-developer/vscode-java/pull/3767).
 * dependencies - Bump webpack from 5.76.0 to 5.94.0. See [#3756](https://github.com/redhat-developer/vscode-java/pull/3756).
 * dependencies - Update vscode-redhat-telemetry to 0.9.0. See [#3778](https://github.com/redhat-developer/vscode-java/pull/3778).

## 1.34.0 (August 29th, 2024)
 * enhancement - Support custom source file extensions through `files.associations`. See [#3731](https://github.com/redhat-developer/vscode-java/pull/3731).
 * enhancement - Add telemetry for detecting language server running out of memory. See [#3743](https://github.com/redhat-developer/vscode-java/pull/3743).
 * bug fix - Fix `ClassCastException` for the file paste event. See [JLS#3239](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/3239).
 * bug fix - Invalid code actions suggested on deletion of a file. See [#3663](https://github.com/redhat-developer/vscode-java/issues/3663).
 * bug fix - Better handling when file path contains non-ASCII characters. See [#3735](https://github.com/redhat-developer/vscode-java/issues/3735).
 * bug fix - Add Gradle 8.8 to compatibility check. See [JLS#3212](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/3212).
 * documentation - Fix stale reference in "Quick Start". See [#3741](https://github.com/redhat-developer/vscode-java/pull/3741).

## 1.33.0 (August 1st, 2024)
 * performance - Clean up invalid projects during initialization to prevent build cycles. See [#3639](https://github.com/redhat-developer/vscode-java/issues/3639).
 * enhancement - Expose source actions via. the code action (light bulb) menu. See [#3714](https://github.com/redhat-developer/vscode-java/pull/3714).
 * enhancement - Use `java.diagnostic.filter` to exclude files from the "Problems" tab. See [#2150](https://github.com/redhat-developer/vscode-java/issues/2150).
 * enhancement - Clear out-of-date files under extension's global storage. See [#2597](https://github.com/redhat-developer/vscode-java/issues/2597).
 * enhancement - Add support for callees based on implementors for call hierarchy. See [JLS#2780](https://github.com/eclipse-jdtls/eclipse.jdt.ls/issues/2780).
 * bug fix - Links to classes do not appear in completion documentation. See [#3697](https://github.com/redhat-developer/vscode-java/issues/3697).
 * bug fix - Add tag property to better track kinds of stacktrace errors of interest. See [#3720](https://github.com/redhat-developer/vscode-java/pull/3720).
 * dependencies - Target platform update resulting in **loss of support for Java versions older than 1.8**. See [JLS#3227](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/3227).

## 1.32.0 (June 27th, 2024)
 * performance - Ensure every null analysis annotation has a value defined when enabled. See [#3387](https://github.com/redhat-developer/vscode-java/issues/3387).
 * enhancement - Add `final` to "Extract to local variable" quick assist if requested. See [#3308](https://github.com/redhat-developer/vscode-java/issues/3308).
 * bug fix - Fix issues with the Lombok annotation handler. See [#3561](https://github.com/redhat-developer/vscode-java/issues/3561).
 * bug fix - Revalidate project files after classpath changes when autobuild is off. See [JLS#3155](https://github.com/eclipse-jdtls/eclipse.jdt.ls/issues/3155).
 * bug fix - Code completion fails with classes that are permitted by a sealed class. See [#3636](https://github.com/redhat-developer/vscode-java/issues/3636).
 * bug fix - Perform verification on pipe name when transport kind is `default`. See [#3680](https://github.com/redhat-developer/vscode-java/pull/3680).
 * bug fix - Some code actions may fail to resolve when machine's processor count too low. See [JLS#3180](https://github.com/eclipse-jdtls/eclipse.jdt.ls/issues/3180).
 * bug fix - Support the import of multi-folder Gradle projects with same name. See [JLS#1743](https://github.com/eclipse-jdtls/eclipse.jdt.ls/issues/1743).
 * bug fix - Autobuild setting should be respected on initialization. See [JLS#3176](https://github.com/eclipse-jdtls/eclipse.jdt.ls/issues/3176).
 * bug fix - Improve chain completion by waiting for either "main" or "context" chains. See [JLS#2730](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/2730).
 * bug fix - Report only one instance of a logged error through telemetry. See [JLS#3190](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/3190).
 * build - Fix NPE when using 'Launch Extension - JDTLS Client' to local debug extension. See [#3677](https://github.com/redhat-developer/vscode-java/pull/3677).

## 1.31.0 (May 30th, 2024)
 * performance - Create the default project only when it is necessary. See [#3452](https://github.com/redhat-developer/vscode-java/issues/3452).
 * performance - Improve order of operations when importing multi-module Maven projects. See [#3637](https://github.com/redhat-developer/vscode-java/issues/3637).
 * enhancement - Support delegate API to retrieve/update active profiles of Maven projects. See [JLS#3158](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/3158).
 * enhancement - Support delegate API for updating Java project options. See [JLS#3162](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/3162).
 * bug fix - Fix indentation for new line preceded by comma. See [#3396](https://github.com/redhat-developer/vscode-java/issues/3396).
 * bug fix - Support document paste across older versions of VS Code. See [#3631](https://github.com/redhat-developer/vscode-java/issues/3631).
 * bug fix - Fall back to `stdio` transport if `pipe` is likely to fail. See [#3649](https://github.com/redhat-developer/vscode-java/issues/3649).
 * bug fix - Switch expression on a boolean value does not report error. See [JLS#3141](https://github.com/eclipse-jdtls/eclipse.jdt.ls/issues/3141).
 * bug fix - Only clean default project when building workspace if it exists. See [JLS#3153](https://github.com/eclipse-jdtls/eclipse.jdt.ls/issues/3153).
 * bug fix - Avoid sending an "empty" (lacking project data) startup event. See [#3655](https://github.com/redhat-developer/vscode-java/pull/3655).
 * dependencies - Update vscode-redhat-telemetry to 0.8.0. See [#3659](https://github.com/redhat-developer/vscode-java/pull/3659).

## 1.30.0 (April 25th, 2024)
 * enhancement - Add `final` to new declarations generated from code actions. See [#3586](https://github.com/redhat-developer/vscode-java/pull/3586).
 * bug fix - Change default client/server transport from `stdio` to `pipe`. See [#3587](https://github.com/redhat-developer/vscode-java/pull/3587).
 * bug fix - Qualifier of workspace symbol search should be wildcard search. See [JLS#3134](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/3134).
 * bug fix - Fix the document paste handling provider for VS Code 1.88.0. See [#3568](https://github.com/redhat-developer/vscode-java/issues/3568).
 * bug fix - Clear active build tool selection after cleaning the language server workspace of mixed Maven/Gradle project. See [#3567](https://github.com/redhat-developer/vscode-java/issues/3567).
 * bug fix - Static imports with wildcard should resolve all elements. See [#3564](https://github.com/redhat-developer/vscode-java/issues/3564).
 * bug fix - Language Server fails to start with multiple `--add-exports` in `java.jdt.ls.vmargs`. See [#3577](https://github.com/redhat-developer/vscode-java/issues/3577).
 * bug fix - Make `java.import.gradle.user.home` scope `machine-overridable`. See [#3569](https://github.com/redhat-developer/vscode-java/issues/3569).
 * bug fix - Disable automatic handling of `workspace/willRenameFiles`. See [#3565](https://github.com/redhat-developer/vscode-java/pull/3565).
 * build - Fix tests in release workflow. See [#3562](https://github.com/redhat-developer/vscode-java/pull/3562).

## 1.29.0 (April 3rd, 2024)
 * enhancement - Provide support for Java 22. See [#3538](https://github.com/redhat-developer/vscode-java/issues/3538).
 * enhancement - Simplify the server status item click action & add contribution point. See [#3537](https://github.com/redhat-developer/vscode-java/pull/3537), [#3548](https://github.com/redhat-developer/vscode-java/pull/3548), [#3546](https://github.com/redhat-developer/vscode-java/pull/3546).
 * enhancement - Add setting to group completion items representing overloaded methods together. See [#3492](https://github.com/redhat-developer/vscode-java/pull/3492).
 * enhancement - Renaming primary type declaration should update source file name on save. See [#3408](https://github.com/redhat-developer/vscode-java/issues/3408).
 * enhancement - Support updating whole classpath of the project in delegate commands. See [JLS#3098](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/3098).
 * enhancement - Open output channel as well when opening logs. See [#3531](https://github.com/redhat-developer/vscode-java/pull/3531).
 * enhancement - Read the server logs in order to discover early startup log messages. See [JLS#3106](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/3106).
 * enhancement - Report errors of type `dtree.ObjectNotFoundException` as `java.ls.error`. See [#3509](https://github.com/redhat-developer/vscode-java/pull/3509).
 * bug fix - Signature help should display all overloaded methods. See [JLS#3052](https://github.com/eclipse-jdtls/eclipse.jdt.ls/issues/3052).
 * bug fix - Fix issues with Unnamed classes (Java 21) (reference computation, code actions, compilation). See [JLS#3069](https://github.com/eclipse-jdtls/eclipse.jdt.ls/issues/3069), [JLS#3089](https://github.com/eclipse-jdtls/eclipse.jdt.ls/issues/3089), [JLS#3090](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/3090).
 * bug fix - Record Patterns may cause `VerifyError`. See [#3479](https://github.com/redhat-developer/vscode-java/issues/3479).
 * bug fix - Support list of patterns in case statements (Java 21). See [JLS#3043](https://github.com/eclipse-jdtls/eclipse.jdt.ls/issues/3043).
 * bug fix - Allow methods, inherited fields, inherited methods for `Generate toString()` code action. See [#2639](https://github.com/redhat-developer/vscode-java/issues/2639).
 * bug fix - Update Buildship to 3.1.10, which fixes "Marker property value is too long". See [JLS#2424](https://github.com/eclipse-jdtls/eclipse.jdt.ls/issues/2424).
 * bug fix - Set the `nullUncheckedConversion` setting to be ignored by default. See [#3501](https://github.com/redhat-developer/vscode-java/issues/3501).
 * bug fix - Fix NPE when fetching the classpath of the project. See [JLS#3115](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/3115).
 * dependencies - Bump follow-redirects from 1.15.4 to 1.15.6. See [#3534](https://github.com/redhat-developer/vscode-java/pull/3534).
 * build - Adopt the Lombok 1.18.32 release. See [#3543](https://github.com/redhat-developer/vscode-java/pull/3543).
 * build - Update various GitHub reusable workflows to v4. See [#3519](https://github.com/redhat-developer/vscode-java/pull/3519).
 * build - Update release version regular expression for `bump-jdk` workflow. See [#3552](https://github.com/redhat-developer/vscode-java/pull/3552).

## 1.28.1 (February 15th, 2024)
 * enhancement - Unnamed classes & instance `main` methods (Java 21) preview support. See [JLS#3042](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/3042).
 * enhancement - Add support for activating cleanup actions through keyboard shortcut. See [#3424](https://github.com/redhat-developer/vscode-java/issues/3424).
 * enhancement - Jump to specific position of `.class` when clicking on Javadoc link. See [#3490](https://github.com/redhat-developer/vscode-java/pull/3490).
 * bug fix - Fix startup failure on macOS (x64) 10.15 or older. See [#3484](https://github.com/redhat-developer/vscode-java/issues/3484).
 * bug fix - Support Gradle 8.5 with Java 21. See [#3470](https://github.com/redhat-developer/vscode-java/issues/3470).

## 1.27.0 (February 1st, 2024)
 * enhancement - Make the server status bar item more user friendly. See [#3473](https://github.com/redhat-developer/vscode-java/issues/3473).
 * enhancement - Support syntax highlight for embedded HTML. See [#3465](https://github.com/redhat-developer/vscode-java/pull/3465).
 * enhancement - Add Unnamed patterns and variables (Java 21) preview support. See [JLS#2963](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/2963).
 * enhancement - Add quick fixes for for suppressing warnings using `@SuppressWarnings`. See [JLS#2698](https://github.com/eclipse-jdtls/eclipse.jdt.ls/issues/2698).
 * enhancement - Add quick fixes for uninitialized `final` fields. See [JLS#1328](https://github.com/eclipse-jdtls/eclipse.jdt.ls/issues/1328).
 * enhancement - Add support for externally provided `lifecycle-mapping-metadata.xml` file. See [#3393](https://github.com/redhat-developer/vscode-java/issues/3393).
 * bug fix - Allow generic snippets to be returned when completion token is `null`. See [#3466](https://github.com/redhat-developer/vscode-java/issues/3466).
 * bug fix - Allow to import the newly created maven submodule within a multi-module project. See [#3464](https://github.com/redhat-developer/vscode-java/issues/3464).
 * bug fix - Use `source.gradle-kotlin-dsl` instead of `source.kotlin` to avoid clashes with other Kotlin grammars. See [#3463](https://github.com/redhat-developer/vscode-java/pull/3463).
 * bug fix - Log the error details when initialization fails. See [#3472](https://github.com/redhat-developer/vscode-java/pull/3472).
 * bug fix - Avoid string concatenation with `Runtime.getRuntime().exec(..)`. See [JLS#3022](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/3022).
 * dependencies - Adopt the Lombok 1.18.31 edge release. See [#3461](https://github.com/redhat-developer/vscode-java/pull/3461).
 * build - Automatically suggest updates based on JDT-LS Java language support. See [#3402](https://github.com/redhat-developer/vscode-java/pull/3402).

## 1.26.0 (January 11th, 2024)
 * performance - Reduce delegate command calls when classpath changes. See [#3439](https://github.com/redhat-developer/vscode-java/pull/3439).
 * performance - Ensure initial import of projects respect resource filter settings. See [#2972](https://github.com/redhat-developer/vscode-java/issues/2972).
 * performance - Improve the performance of "Organize Imports" when "favorite static imports" are involved. See [#3383](https://github.com/redhat-developer/vscode-java/issues/3383).
 * enhancement - Add String Templates (Java 21) preview support. See [JLS#2994](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/2994).
 * enhancement - Support syntax highlight for embedded SQL, JSON, XML & YAML languages. See [#831](https://github.com/redhat-developer/vscode-java/issues/831), [#3455](https://github.com/redhat-developer/vscode-java/pull/3455).
 * enhancement - Generate correct sources when pasting Java code into the file explorer view. See [#3323](https://github.com/redhat-developer/vscode-java/issues/3323).
 * enhancement - Quick assists converting string concatenations to `StringBuilder`, `StringBuffer`, `String.format(..)`, `MessageFormat`. See [JLS#3007](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/3007).
 * enhancement - Quick assists inverting `equals` comparison & handling of lambda expressions. See [JLS#2996](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/2996).
 * enhancement - Support "non-null" assertions by default using null analysis. See [#3431](https://github.com/redhat-developer/vscode-java/issues/3431).
 * enhancement - Make the language server status a normal status bar item for better visibility. See [#3416](https://github.com/redhat-developer/vscode-java/issues/3416).
 * bug fix - Fix multiline semantic highlighting for `implements`, `extends`, and `permits` keywords. See [JLS#2995](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/2995).
 * bug fix - Use wrapper distribution when `gradle-wrapper.properties` exists. See [JLS#3012](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/3012).
 * bug fix - Fix false positive parameter mismatch error. See [JLS#2992](https://github.com/eclipse-jdtls/eclipse.jdt.ls/issues/2992).
 * bug fix - Document pasting should defer to other contributors when there are no changes. See [#3444](https://github.com/redhat-developer/vscode-java/issues/3444).
 * bug fix - Use Lombok 1.18.31 snapshot to avoid errors for annotations with parameters. See [#3454](https://github.com/redhat-developer/vscode-java/issues/3454).
 * bug fix - Remember the choice when asking project selection on import. See [#3415](https://github.com/redhat-developer/vscode-java/issues/3415).
 * bug fix - Guard against `null` completion context and insertion text. See [#3422](https://github.com/redhat-developer/vscode-java/issues/3422).
 * bug fix - The assignment to variable `workingCopy` has no effect. See [JLS#3002](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/3002).
 * bug fix - Change scope of `java.import.gradle.home` to `machine-overridable`. See [#3430](https://github.com/redhat-developer/vscode-java/pull/3430).
 * bug fix - Filter excessive logging of artifact download from m2e in "debug mode". See [JLS#3011](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/3011).
 * dependencies - Bump follow-redirects from 1.15.2 to 1.15.4. See [#3457](https://github.com/redhat-developer/vscode-java/pull/3457).
 * debt - Remove the legacy status bar item implementation. See [#3081](https://github.com/redhat-developer/vscode-java/issues/3081).

## 1.25.1 (December 7th, 2023)
 * performance - Avoid unnecessary (Maven) project updates. See [#3411](https://github.com/redhat-developer/vscode-java/issues/3411).
 * bug fix - Out of sync editor content may report false compilation errors. See [JLS#2955](https://github.com/eclipse-jdtls/eclipse.jdt.ls/issues/2955).
 * bug fix - Improved support for textmate definition for Kotlin DSL. See [#3403](https://github.com/redhat-developer/vscode-java/issues/3403).
 * bug fix - No completion suggestions for package references when `matchCase` is set to `firstLetter`. See [JLS#2925](https://github.com/eclipse-jdtls/eclipse.jdt.ls/issues/2925).
 * bug fix - Closing Text Blocks immediately after an escaped character produces incorrect syntax highlight. See [#3384](https://github.com/redhat-developer/vscode-java/issues/3384).
 * bug fix - Fix the typo: blob -> glob. See [#3413](https://github.com/redhat-developer/vscode-java/pull/3413).

## 1.25.0 (November 30th, 2023)
 * enhancement - Provide support for Java 21. See [#3292](https://github.com/redhat-developer/vscode-java/issues/3292).
 * enhancement - Import projects by configurations. See [#3356](https://github.com/redhat-developer/vscode-java/pull/3356).
 * enhancement - Support add/remove of imported projects. See [#3398](https://github.com/redhat-developer/vscode-java/pull/3398).
 * enhancement - Host textmate definition for kotlin language. See [#3334](https://github.com/redhat-developer/vscode-java/issues/3334).
 * enhancement - Categorize the extension settings. See [#2548](https://github.com/redhat-developer/vscode-java/issues/2548).
 * enhancement - Add `maven.multiModuleProjectDirectory` property. See [#3380](https://github.com/redhat-developer/vscode-java/issues/3380).
 * enhancement - Add capability to list all VM installs and update project JDK. See [JLS#2977](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/2977).
 * bug fix - Update to `vscode-languageclient` 8.2.0-next.3 (using Node 18) to fix IPC path length limitations. See [#3371](https://github.com/redhat-developer/vscode-java/issues/3371).
 * bug fix - Avoid refreshing language server when contributing extension's dependency closure includes it. See [#3349](https://github.com/redhat-developer/vscode-java/issues/3349).
 * bug fix - Wrongly encoded semantic tokens around `class` keyword. See [JLS#2920](https://github.com/eclipse-jdtls/eclipse.jdt.ls/issues/2920).
 * bug fix - Cleanups & Organize Imports should only react to internal project preferences with `canUseInternalSettings`. See [#3399](https://github.com/redhat-developer/vscode-java/issues/3399), [#3370](https://github.com/redhat-developer/vscode-java/issues/3370), [JLS#2975](https://github.com/eclipse-jdtls/eclipse.jdt.ls/issues/2975).
 * bug fix - Fix missing prompt to select build tool for Gradle/Maven mixed project. See [#3400](https://github.com/redhat-developer/vscode-java/issues/3400).
 * bug fix - Respect the VS Code setting to disable extension recommendations. See [#3381](https://github.com/redhat-developer/vscode-java/issues/3381).
 * bug fix - `IllegalArgumentException` on `completionItem/resolve` of package declaration. See [JLS#2924](https://github.com/eclipse-jdtls/eclipse.jdt.ls/issues/2924).
 * bug fix - Add trace to understand the probability of document out-of-sync. See [JLS#2954](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/2954).
 * dependencies - Bump axios from 1.5.0 to 1.6.1. See [#3388](https://github.com/redhat-developer/vscode-java/pull/3388).
 * dependencies - Update buildship to 3.1.8. See [JLS#2974](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/2974).

## 1.24.0 (October 26th, 2023)
 * performance - Exclude certain folders (eg. `node_modules/`) from "trigger" file search on activation. [#3348](https://github.com/redhat-developer/vscode-java/pull/3348).
 * enhancement - Move snippet suggestions above matching keywords in completion list. See [#2584](https://github.com/redhat-developer/vscode-java/issues/2584).
 * enhancement - Add new alias `public static void main(String[] args)` for public main method. See [#2105](https://github.com/redhat-developer/vscode-java/issues/2105).
 * enhancement - Add aliases for `sysout`/`syserr` snippets that will see more usage. See [#3041](https://github.com/redhat-developer/vscode-java/issues/3041).
 * enhancement - Add "Surround with try/catch" code action. See [JLS#2727](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/2727).
 * enhancement - Automatically add the existing static imports in code as favorite static members. See [JLS#2903](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/2903).
 * enhancement - Provide quick fix to "Configure static import...". See [#3339](https://github.com/redhat-developer/vscode-java/pull/3339).
 * enhancement - Support named pipes for client/server communication. See [#3282](https://github.com/redhat-developer/vscode-java/issues/3282).
 * enhancement - Track the LSP request data from syntax server. See [#3278](https://github.com/redhat-developer/vscode-java/pull/3278).
 * bug fix - Re-implement smart semicolon detection through text document change API. See [#3290](https://github.com/redhat-developer/vscode-java/issues/3290).
 * bug fix - Completion returns no results for method declarations when `matchCase` set to `FIRSTLETTER`. See [#3214](https://github.com/redhat-developer/vscode-java/issues/3214), [#3186](https://github.com/redhat-developer/vscode-java/issues/3186).
 * bug fix - Allow filtering methods by parameter names, and order by number of parameters. See [JLS#2907](https://github.com/eclipse-jdtls/eclipse.jdt.ls/issues/2907), [#3206](https://github.com/redhat-developer/vscode-java/issues/3206).
 * bug fix - Reconcile AST node to provide accurate type definition snippets. See [#2250](https://github.com/redhat-developer/vscode-java/issues/2250).
 * bug fix - `BasicFileDetector` should handle inaccessible directories gracefully during project import. See [#1156](https://github.com/redhat-developer/vscode-java/issues/1156), [#3137](https://github.com/redhat-developer/vscode-java/issues/3137).
 * bug fix - Ensure line delimiter exists after the file header template. See [JLS#2906](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/2906).
 * bug fix - `o.e.core.internal.resources.ResourceException`: Invalid project description. See [JLS#2845](https://github.com/eclipse-jdtls/eclipse.jdt.ls/issues/2845).
 * bug fix - Error when parsing resource filter. See [#3345](https://github.com/redhat-developer/vscode-java/pull/3345).
 * bug fix - NPE in `SemanticTokensHandler`. See [JLS#2876](https://github.com/eclipse-jdtls/eclipse.jdt.ls/issues/2876).
 * bug fix - NPE in cleanup action handler. See [JLS#2879](https://github.com/eclipse-jdtls/eclipse.jdt.ls/issues/2879).
 * bug fix - `UnsupportedOperationException` at `org.eclipse.lsp4j.services.LanguageServer.setTrace()`. See [JLS#2891](https://github.com/eclipse-jdtls/eclipse.jdt.ls/issues/2891).
 * dependencies - Bump postcss from 8.4.21 to 8.4.31. See [#3335](https://github.com/redhat-developer/vscode-java/pull/3335).

## 1.23.0 (September 28th, 2023)
 * enhancement - Improve JDK detection on the local machine, and ensure they are registered. See [#3301](https://github.com/redhat-developer/vscode-java/pull/3301).
 * enhancement - Update current method snippet and add `static_method` snippet for interface. See [#1697](https://github.com/redhat-developer/vscode-java/issues/1697).
 * enhancement - Improve the constructor snippet for additional classes in a file. See [#725](https://github.com/redhat-developer/vscode-java/issues/725).
 * enhancement - Store the completion kinds requested by completion operation. See [JLS#2857](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/2857).
 * enhancement - Update to Lombok 1.18.30. See [#3321](https://github.com/redhat-developer/vscode-java/pull/3321).
 * enhancement - Add API `onWillRequestStart` to track request send event. See [#3316](https://github.com/redhat-developer/vscode-java/pull/3316).
 * enhancement - Report whether the project has Kotlin Gradle files. See [JLS#2859](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/2859).
 * enhancement - Track the completion kinds of completion request. See [#3307](https://github.com/redhat-developer/vscode-java/pull/3307).
 * bug fix - Fix `EmptyStackException` in `textDocument/foldingRange`. See [JLS#2865](https://github.com/eclipse-jdtls/eclipse.jdt.ls/issues/2865).
 * bug fix - Fix renaming of attribute with `@Singular` annotation. See [#3203](https://github.com/redhat-developer/vscode-java/issues/3203).
 * bug fix - `Open Java Language Server Log File` should open the correct server (standard/syntax) log. See [#3309](https://github.com/redhat-developer/vscode-java/issues/3309).
 * bug fix - Fix `URI` with query parameter. See [#3305](https://github.com/redhat-developer/vscode-java/issues/3305).
 * bug fix - Fix an error thrown during "Initialize workspace". See [JLS#2842](https://github.com/eclipse-jdtls/eclipse.jdt.ls/issues/2842).

## 1.22.1 (September 14th, 2023)
 * bug fix - Removed some improvements to JDK detection as they were causing issues on MacOS. See [#3287](https://github.com/redhat-developer/vscode-java/issues/3287). If you still see JDK class errors after upgrading to 1.22.1, please open **Command Palette** and run "**Java: Clean Java Language Server Workspace**".
 * bug fix - Log errors from project importer. See [JLS#2843](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/2843).
 * bug fix - Disable `;` key binding when smart semicolon detection is disabled. See [#3290](https://github.com/redhat-developer/vscode-java/issues/3290).

## 1.22.0 (September 12th, 2023)
 * performance - Stale code actions should be cancellable and paste actions should have higher priority. See [#3199](https://github.com/redhat-developer/vscode-java/issues/3199).
 * enhancement - Add support for smart semicolon insertion. See [#703](https://github.com/redhat-developer/vscode-java/issues/703).
 * enhancement - Introduce new snippet templates with appropriate context. See [#2867](https://github.com/redhat-developer/vscode-java/issues/2867).
 * enhancement - Improve JDK detection on the local machine, and ensure they are registered. See [#3251](https://github.com/redhat-developer/vscode-java/pull/3251).
 * enhancement - Add folding range for multiple single-line comments. See [#860](https://github.com/redhat-developer/vscode-java/issues/860).
 * enhancement - Use a more appropriate completion item image for annotation attributes and records. See [JLS#2796](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/2796).
 * enhancement - Select suitable JDK to launch Gradle. See [JLS#2812](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/2812).
 * enhancement - end-to-end performance tracking for code completion requests. See [#3165](https://github.com/redhat-developer/vscode-java/pull/3165).
 * enhancement - Track the case of language server `OutOfMemory`. See [#3273](https://github.com/redhat-developer/vscode-java/pull/3273).
 * enhancement - Record the trigger context of completion request. See [#3272](https://github.com/redhat-developer/vscode-java/pull/3272).
 * bug fix - Call hierarchy should always report the end of its progress. See [JLS#2827](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/2827).
 * bug fix - Fix multiline semantic highlighting for `class`, `interface` & `record` declarations. See [#1444](https://github.com/redhat-developer/vscode-java/issues/1444), [JLS#2807](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/2807).
 * bug fix - The type declaration snippets should generate file headers. See [JLS#2813](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/2813).
 * bug fix - Fix folding ranges for nested switch statements. See [#2751](https://github.com/redhat-developer/vscode-java/issues/2751).
 * bug fix - Fix "java.lang.VerifyError: Operand stack overflow". See [#3232](https://github.com/redhat-developer/vscode-java/issues/3232).
 * bug fix - Commands needing language server should not be activated before the service is ready . See [#3281](https://github.com/redhat-developer/vscode-java/pull/3281).
 * bug fix - Record methods are not recognized under certain conditions. See [#3233](https://github.com/redhat-developer/vscode-java/issues/3233).
 * bug fix - Fix compiler arguments parsing failure in Gradle build support. See [JLS#2781](https://github.com/eclipse-jdtls/eclipse.jdt.ls/issues/2781).
 * bug fix - Filter out excessive logging of classfile parsing from m2e in "debug mode". See [JLS#2785](https://github.com/eclipse-jdtls/eclipse.jdt.ls/pull/2785).
 * bug fix - Don't escape unicode characters when pasting string literals. See [#3181](https://github.com/redhat-developer/vscode-java/issues/3181).
 * bug fix - Enable by default syntactic null analysis for fields. See [#3255](https://github.com/redhat-developer/vscode-java/issues/3255).
 * bug fix - Rename `SERVER_PORT` environment variable to `JDTLS_SERVER_PORT`. See [#3256](https://github.com/redhat-developer/vscode-java/issues/3256), [#2507](https://github.com/redhat-developer/vscode-java/issues/2507).
 * dependencies - Update semver to latest version where possible. See [#3264](https://github.com/redhat-developer/vscode-java/pull/3264).
 * dependencies - Update vscode-redhat-telemetry to 0.7.0. See [#3262](https://github.com/redhat-developer/vscode-java/pull/3262).

## 1.21.0 (July 27th, 2023)
 * performance - Check completion proposal is compatible or not. See [JLS#2733](https://github.com/eclipse/eclipse.jdt.ls/pull/2733).
 * enhancement - Add code actions for Join/Split variable. See [JLS#2732](https://github.com/eclipse/eclipse.jdt.ls/pull/2732).
 * enhancement - Support outline view for decompiled source. See [JLS#2742](https://github.com/eclipse/eclipse.jdt.ls/pull/2742).
 * enhancement - Reload the cached classfile sources when their source attachment is updated. See [#3207](https://github.com/redhat-developer/vscode-java/pull/3207).
 * enhancement - Log error when Gradle and JDK versions are mismatched. See [JLS#2749](https://github.com/eclipse/eclipse.jdt.ls/pull/2749).
 * bug fix - Fix parameter and exception changes in method signature refactoring. See [#3098](https://github.com/redhat-developer/vscode-java/issues/3098).
 * bug fix - Fix missing completion items for fully qualified name completion. See [#3173](https://github.com/redhat-developer/vscode-java/issues/3173).
 * bug fix - Support Java text block highlight. See [#2896](https://github.com/redhat-developer/vscode-java/issues/2896).
 * bug fix - Fix incorrect syntax highlight for comment following a `throws` clause. See [#3039](https://github.com/redhat-developer/vscode-java/issues/3039).
 * bug fix - Fix incorrect syntax highlight for `new` keyword on inner class creation. See [#1195](https://github.com/redhat-developer/vscode-java/issues/1195).
 * bug fix - Fix incorrect semantic highlighting due to out-of-date AST in use. See [JLS#2709](https://github.com/eclipse/eclipse.jdt.ls/pull/2709).
 * bug fix - Prevent caching outdated AST in `CoreASTProvider`. See [JLS#2714](https://github.com/eclipse/eclipse.jdt.ls/pull/2714).
 * bug fix - Call Hierarchy resolves wrong element under certain conditions. See [JLS#2771](https://github.com/eclipse/eclipse.jdt.ls/issues/2771).
 * bug fix - `NullPointerException` during code completion of a `var` reference. See [#2758](https://github.com/redhat-developer/vscode-java/issues/2758).
 * bug fix - Do not delete the Java project nature removing a nested `.classpath` resource file. See [JLS#2750](https://github.com/eclipse/eclipse.jdt.ls/pull/2750).
 * bug fix - Unable to acquire the state change lock for the module 'buildship'. See [#3184](https://github.com/redhat-developer/vscode-java/issues/3184).
 * bug fix - Rename 'Attach Source' menu to 'Attach Source…'. See [#3202](https://github.com/redhat-developer/vscode-java/pull/3202).
 * dependencies - Bump word-wrap from 1.2.3 to 1.2.4. See [#3211](https://github.com/redhat-developer/vscode-java/pull/3211).

## 1.20.0 (June 29th, 2023)
 * performance - Set the default value of `java.completion.matchCase` to `firstLetter`. See [#3142](https://github.com/redhat-developer/vscode-java/pull/3142).
 * enhancement - Support for "Go to Declaration". See [JLS#2684](https://github.com/eclipse/eclipse.jdt.ls/issues/2684).
 * enhancement - Improve method argument guessing functionality. See [#2903](https://github.com/redhat-developer/vscode-java/issues/2903).
 * enhancement - Add code action to clean up & simplify lambda expressions. See [#3158](https://github.com/redhat-developer/vscode-java/pull/3158).
 * enhancement - Use FernFlower as the default decompiler. See [JLS#2704](https://github.com/eclipse/eclipse.jdt.ls/pull/2704).
 * enhancement - Attempt automatic JVM detection on startup. See [JLS#2731](https://github.com/eclipse/eclipse.jdt.ls/pull/2731).
 * enhancement - Support for chain completions. See [#3008](https://github.com/redhat-developer/vscode-java/pull/3008).
 * enhancement - Make reasonable guess for method name when applying "Extract Method" refactoring. See [#2011](https://github.com/redhat-developer/vscode-java/issues/2011).
 * enhancement - Add postfix completion for `sysouf`, `sysoutv`, `format`, `par`, `not`,`assert` & `optional` . See [JLS#2691](https://github.com/eclipse/eclipse.jdt.ls/pull/2691), [JLS#2697](https://github.com/eclipse/eclipse.jdt.ls/pull/2697).
 * enhancement - Use choice syntax as placeholder for constructor/method/field snippets. See [#3018](https://github.com/redhat-developer/vscode-java/pull/3018), [#3140](https://github.com/redhat-developer/vscode-java/pull/3140).
 * enhancement - The `try-catch` snippet should support being applied to a selection. See [#3103](https://github.com/redhat-developer/vscode-java/issues/3103).
 * enhancement - Track errors, exceptions, and project import success rate on server side for reliability analysis. See [#3162](https://github.com/redhat-developer/vscode-java/pull/3162), [JLS#2726](https://github.com/eclipse/eclipse.jdt.ls/pull/2726).
 * bug fix - Display package name in document symbols outline for class files. See [#3074](https://github.com/redhat-developer/vscode-java/issues/3074).
 * bug fix - Signature help should display the selected completion item. See [#3127](https://github.com/redhat-developer/vscode-java/issues/3127).
 * bug fix - Gracefully handle language server failures/crashes. See [#2036](https://github.com/redhat-developer/vscode-java/issues/2036), [#3131](https://github.com/redhat-developer/vscode-java/issues/3131).
 * bug fix - No completions on field initializer with `@Default` and `@Builder` Lombok annotations. See [JLS#2669](https://github.com/eclipse/eclipse.jdt.ls/issues/2669).
 * bug fix - `IllegalArgumentException` within a try-catch block. See [#3138](https://github.com/redhat-developer/vscode-java/issues/3138).
 * bug fix - Fix `pId` mismatch in completions. See [JLS#2681](https://github.com/eclipse/eclipse.jdt.ls/pull/2681).
 * bug fix - Typo in constant `METADATA_FILES_GENERATION`. See [#3133](https://github.com/redhat-developer/vscode-java/pull/3133).
 * build - Add enviornment variable to reference an external build of JDT-LS. See [#3151](https://github.com/redhat-developer/vscode-java/issues/3151).
 * build - Check for non-standard NPM registry in `package-lock.json` as a step in CI. See [#2876](https://github.com/redhat-developer/vscode-java/issues/2876).
 * build - Bump `semver` from 7.3.5 to 7.5.2. See [#3168](https://github.com/redhat-developer/vscode-java/pull/3168).

## 1.19.0 (June 1st, 2023)
 * performance - No need to run the reconcile operation in a workspace job. See [JLS#2660](https://github.com/eclipse/eclipse.jdt.ls/pull/2660).
 * performance - Avoid blocking the pipeline while handling `refreshLocal` during document lifecycle events. See [JLS#2659](https://github.com/eclipse/eclipse.jdt.ls/pull/2659).
 * performance - Avoid running document lifecycle in a workspace runnable unless it is necessary. See [JLS#2641](https://github.com/eclipse/eclipse.jdt.ls/pull/2641), [JLS#2637](https://github.com/eclipse/eclipse.jdt.ls/pull/2637).
 * performance - Re-validate current document if the focus is switched to a Java file. See [#3053](https://github.com/redhat-developer/vscode-java/pull/3053).
 * performance - Only append data on completion item selected. See [JLS#2639](https://github.com/eclipse/eclipse.jdt.ls/pull/2639).
 * performance - Remove some unnecessary completion item data fields. See [JLS#2638](https://github.com/eclipse/eclipse.jdt.ls/issues/2638).
 * performance - Remove `COMPLETION_EXECUTION_TIME` from the completion item response. See [JLS#2621](https://github.com/eclipse/eclipse.jdt.ls/issues/2621).
 * performance - Use separate thread to handle `didChangeWatchedFiles` events. See [JLS#2643](https://github.com/eclipse/eclipse.jdt.ls/pull/2643).
 * performance - Add option to lazily resolve the text edits. See [JLS#1864](https://github.com/eclipse/eclipse.jdt.ls/issues/1864).
 * enhancement - Add command to restart Java language server. See [#2586](https://github.com/redhat-developer/vscode-java/pull/2586).
 * enhancement - Add support for proper array completions. See [JLS#2609](https://github.com/eclipse/eclipse.jdt.ls/issues/2609).
 * enhancement - Completion items should support `InsertTextMode`. See [JLS#2577](https://github.com/eclipse/eclipse.jdt.ls/issues/2577).
 * enhancement - Use `vscode-extension-proposals` for recommendations. See [#3099](https://github.com/redhat-developer/vscode-java/issues/3099).
 * bug fix - Missing javadoc for field during completion. See [JLS#2645](https://github.com/eclipse/eclipse.jdt.ls/issues/2645).
 * bug fix - Incorrect completion text edit ranges for snippets. See [JLS#2626](https://github.com/eclipse/eclipse.jdt.ls/issues/2626).
 * bug fix - Update completion resolve data for javadoc completions. See [JLS#2636](https://github.com/eclipse/eclipse.jdt.ls/pull/2636).
 * bug fix - Prevent sending shutdown job progress report. See [JLS#2622](https://github.com/eclipse/eclipse.jdt.ls/pull/2622).
 * bug fix - On Windows, `os.execvp` does not load the executable into current process. See [JLS#2615](https://github.com/eclipse/eclipse.jdt.ls/issues/2615).
 * bug fix - Code completion for constructor is broken with `java.completion.matchCase` enabled. See [#3118](https://github.com/redhat-developer/vscode-java/issues/3118).
 * build - Gracefully recover from failure to detect the language server project in sibling directory. See [#3107](https://github.com/redhat-developer/vscode-java/issues/3107).
 * dependencies - Update to lombok 1.18.28. See [#3117](https://github.com/redhat-developer/vscode-java/pull/3117).

## 1.18.0 (April 27th, 2023)
 * performance - Completion handling should not be done in asynchronous thread pool. See [JLS#2605](https://github.com/eclipse/eclipse.jdt.ls/pull/2605).
 * performance - Support lazily resolving postfix completion items. See [#3072](https://github.com/redhat-developer/vscode-java/pull/3072), [JLS#2616](https://github.com/eclipse/eclipse.jdt.ls/issues/2616), [JLS#2584](https://github.com/eclipse/eclipse.jdt.ls/issues/2584).
 * performance - Place the URI of a document into the completion response store. See [#2614](https://github.com/eclipse/eclipse.jdt.ls/pull/2614).
 * enhancement - Provide Java 20 support. See [#3023](https://github.com/redhat-developer/vscode-java/issues/3023).
 * enhancement - Add `syserr` postfix completion. See [JLS#2620](https://github.com/eclipse/eclipse.jdt.ls/pull/2620).
 * bug fix - Ensure meaningful information is displayed by the progress reporter. See [#3082](https://github.com/redhat-developer/vscode-java/pull/3082).
 * bug fix - Respect settings in the `lombok.config` file. See [#2887](https://github.com/redhat-developer/vscode-java/issues/2887).
 * bug fix - `NullPointerException` in `signatureHelp/codeAction/inlayHint` when AST is not generated. See [JLS#2608](https://github.com/eclipse/eclipse.jdt.ls/issues/2608).
 * bug fix - `StringIndexOutOfBoundsException` on `textDocument/signatureHelp` when triggered from end of document. See [JLS#2606](https://github.com/eclipse/eclipse.jdt.ls/issues/2606).
 * bug fix - Some logged information should only be shown in debug mode. See [JLS#2603](https://github.com/eclipse/eclipse.jdt.ls/issues/2603).

## 1.17.0 (April 13th, 2023)
 * performance - Support resolving dependencies in parallel for Maven projects. See [#3030](https://github.com/redhat-developer/vscode-java/pull/3030).
 * performance - Cache and re-use type bindings for a completion invocation. See [JLS#2535](https://github.com/eclipse/eclipse.jdt.ls/pull/2535).
 * performance - Avoid retrieving AST root during diagnostic publishing. See [JLS#2574](https://github.com/eclipse/eclipse.jdt.ls/pull/2574).
 * performance - Implement `itemDefaults` for completion responses. See [JLS#2475](https://github.com/eclipse/eclipse.jdt.ls/issues/2475).
 * enhancement - Add support for decompiling class files. See [#2679](https://github.com/redhat-developer/vscode-java/issues/2679), [#3012](https://github.com/redhat-developer/vscode-java/issues/3012).
 * enhancement - Add "Change signature" refactoring. See [#2104](https://github.com/redhat-developer/vscode-java/issues/2104).
 * enhancement - Implement `labelDetails` for completion items. See [JLS#2476](https://github.com/eclipse/eclipse.jdt.ls/issues/2476).
 * enhancement - `sysout` postfix completion should be applicable to any variable. See [JLS#2559](https://github.com/eclipse/eclipse.jdt.ls/pull/2559).
 * enhancement - Add support for telemetry notifications. See [#2289](https://github.com/redhat-developer/vscode-java/issues/2289), [#3042](https://github.com/redhat-developer/vscode-java/pull/3042), [#3058](https://github.com/redhat-developer/vscode-java/pull/3058).
 * enhancement - Trace API should give indicator of response success status. See [#3010](https://github.com/redhat-developer/vscode-java/pull/3010).
 * bug fix - Single double quote should be matched appropriately. See [#3037](https://github.com/redhat-developer/vscode-java/issues/3037).
 * bug fix - Increase relevance of "Create enum". See [#2940](https://github.com/redhat-developer/vscode-java/issues/2940).
 * bug fix - Recover when `documentPaste` API is not properly registered. See [#3028](https://github.com/redhat-developer/vscode-java/pull/3028).
 * bug fix - Ensure we do not return duplicate search results for workspace symbols. See [JLS#2547](https://github.com/eclipse/eclipse.jdt.ls/pull/2547).
 * bug fix - Code action to generate accessor outside of identifier no longer available. See [JLS#2533](https://github.com/eclipse/eclipse.jdt.ls/issues/2533).
 * bug fix - Support importing multi-Maven projects with the same `artifactId`. See [JLS#2017](https://github.com/eclipse/eclipse.jdt.ls/issues/2017).
 * bug fix - Do not show `Generate Constructors` quick assist for static fields. See [JLS#2142](https://github.com/eclipse/eclipse.jdt.ls/issues/2142).
 * bug fix - Delegate commands should respect cancellation events from the client. See [JLS#2415](https://github.com/eclipse/eclipse.jdt.ls/issues/2415).
 * bug fix - Ensure `java.project.upgradeGradle` client/server commands do not clash. See [#3001](https://github.com/redhat-developer/vscode-java/issues/3001).
 * bug fix - Fix "commands test" when run locally. See [#3027](https://github.com/redhat-developer/vscode-java/pull/3027).
 * build - Exclude `.github/` and `.gitignore` from packaging. See [#3057](https://github.com/redhat-developer/vscode-java/pull/3057).
 * build - Add separate tsconfig for webview. See [#3009](https://github.com/redhat-developer/vscode-java/pull/3009).
 * debt - Support the refactoring document correctly. See [#2974](https://github.com/redhat-developer/vscode-java/issues/2974).

## 1.16.0 (March 16th, 2023)
 * performance - Allow language server to declare availability sooner by postponing autobuild. See [JLS#2527](https://github.com/eclipse/eclipse.jdt.ls/pull/2527).
 * performance - Save operations need not run in workspace runnable when project is not unmanaged. See [JLS#2449](https://github.com/eclipse/eclipse.jdt.ls/pull/2449).
 * enhancement - Implement method hierarchy through existing type hierarchy logic. See [#2991](https://github.com/redhat-developer/vscode-java/pull/2991).
 * enhancement - Declare support for inlay hints through the language server specification. See [#2965](https://github.com/redhat-developer/vscode-java/pull/2965), [JLS#2365](https://github.com/eclipse/eclipse.jdt.ls/issues/2365).
 * enhancement - Update types filter according to import declarations. See [#2943](https://github.com/redhat-developer/vscode-java/issues/2943).
 * enhancement - Update to vscode-languageclient 8.1.0, LSP4J 0.20.0 (LSP 3.17.0). See [#2474](https://github.com/redhat-developer/vscode-java/issues/2474), [JLS#2348](https://github.com/eclipse/eclipse.jdt.ls/issues/2348).
 * bug fix - Fix regression in extension startup for web-based editors. See [#2968](https://github.com/redhat-developer/vscode-java/issues/2968).
 * bug fix - No completion on generic anonymous class instance objects. See [JLS#2505](https://github.com/eclipse/eclipse.jdt.ls/issues/2505).
 * bug fix - Null Analysis does not work for Eclipse/Invisible projects. See [#2956](https://github.com/redhat-developer/vscode-java/issues/2956).
 * bug fix - Unnecessary error marker for record constructor that uses varargs. See [#2640](https://github.com/redhat-developer/vscode-java/issues/2640).
 * bug fix - Temporary fix to ensure refactoring document is displayed. See [#2975](https://github.com/redhat-developer/vscode-java/pull/2975).
 * bug fix - In progress items should always be at the bottom in the server tasks view. See [#2627](https://github.com/redhat-developer/vscode-java/issues/2627).
 * bug fix - Fix NPE in `textDocument/documentHighlight` requests. See [#2952](https://github.com/redhat-developer/vscode-java/issues/2952).
 * bug fix - Update VS Code engine to 1.74.0. See [#2950](https://github.com/redhat-developer/vscode-java/issues/2950).
 * build - Bump webpack from 5.34.0 to 5.76.0. See [#2999](https://github.com/redhat-developer/vscode-java/pull/2999).
 * other - Add API to track LSP performance at the language client. See [#2996](https://github.com/redhat-developer/vscode-java/pull/2996).

## 1.15.0 (February 20th, 2023)
 * performance - Skip generated methods when calculating document symbols. See [JLS#2446](https://github.com/eclipse/eclipse.jdt.ls/issues/2446).
 * performance - Make the debounce adaptive for the publish diagnostic job. See [JLS#2443](https://github.com/eclipse/eclipse.jdt.ls/pull/2443).
 * performance - Only perform context sensitive import rewrite when resolving completion items. See [JLS#2453](https://github.com/eclipse/eclipse.jdt.ls/pull/2453).
 * performance - Extension activation should not depend on language server being started. See [#2900](https://github.com/redhat-developer/vscode-java/issues/2900).
 * performance - Copy/paste within the same file should not trigger the paste handler for missing imports. See [JLS#2441](https://github.com/eclipse/eclipse.jdt.ls/issues/2441).
 * enhancement - Support "extract interface" refactoring. See [#761](https://github.com/redhat-developer/vscode-java/issues/761).
 * enhancement - Add "Convert String concatenation to Text Block" quick assist. See [JLS#2456](https://github.com/eclipse/eclipse.jdt.ls/pull/2456).
 * enhancement - Add clean up for using `try-with-resource`. See [#2891](https://github.com/redhat-developer/vscode-java/pull/2891).
 * enhancement - Enable formatting support in syntax server. See [#2926](https://github.com/redhat-developer/vscode-java/issues/2926).
 * enhancement - Add option to configure behaviour when mojo execution metadata not available. See [#2889](https://github.com/redhat-developer/vscode-java/issues/2889).
 * enhancement - Add option to permit usage of test resources of a Maven project as dependencies within the compile scope of other projects. See [#2569](https://github.com/redhat-developer/vscode-java/issues/2569).
 * bug fix - Change default generated method stub to throw exception. See [JLS#2366](https://github.com/eclipse/eclipse.jdt.ls/pull/2366).
 * bug fix - Prevent the paste handler for missing imports from generating overlapping text edits. See [JLS#2442](https://github.com/eclipse/eclipse.jdt.ls/issues/2442).
 * bug fix - Reference search doesn't work for fields in JDK classes. See [JLS#2405](https://github.com/eclipse/eclipse.jdt.ls/issues/2405).
 * bug fix - Paste event handling blocks pasting while project loading. See [#2924](https://github.com/redhat-developer/vscode-java/issues/2924).
 * bug fix - Avoid generating boilerplate code repeatedly in new Java file. See [#2939](https://github.com/redhat-developer/vscode-java/issues/2939).
 * bug fix - Completion results should include filtered (excluded) types if they are also present in the import declarations. See [JLS#2467](https://github.com/eclipse/eclipse.jdt.ls/pull/2467).
 * bug fix - Fix type hierarchy regression since VS Code 1.75.1. See [#2930](https://github.com/redhat-developer/vscode-java/pull/2930).
 * bug fix - Re-publish diagnostics for null analysis configuration change when auto-build is disabled. See [JLS#2447](https://github.com/eclipse/eclipse.jdt.ls/pull/2447).
 * bug fix - Dependency Analytics extension popup should respect user choice. See [#2892](https://github.com/redhat-developer/vscode-java/issues/2892).
 * bug fix - Only do full build for a configuration change when auto-build is enabled. See [JLS#2437](https://github.com/eclipse/eclipse.jdt.ls/pull/2437).
 * bug fix - The command to upgrade gradle should check for cancellation prior to updating metadata files. See [JLS#2444](https://github.com/eclipse/eclipse.jdt.ls/pull/2444).
 * bug fix - Fix incorrect ordering of completion items that use a decorator. See [#2917](https://github.com/redhat-developer/vscode-java/issues/2917).
 * bug fix - Reduce the amount of logging from `org.apache.http` bundles. See [JLS#2420](https://github.com/eclipse/eclipse.jdt.ls/pull/2420).
 * build - Do not require `org.eclipse.xtend.lib`. See [JLS#2416](https://github.com/eclipse/eclipse.jdt.ls/pull/2416).
 * build - Add Github action to detect potential duplicate issues. See [#2927](https://github.com/redhat-developer/vscode-java/pull/2927).
 * build - Use commit SHA-1 instead of branch name for third-party actions. See [#2895](https://github.com/redhat-developer/vscode-java/pull/2895).
 * documentation - Clarify the `README` quick start instructions. See [#2915](https://github.com/redhat-developer/vscode-java/pull/2915).

## 1.14.0 (January 17th, 2023)
 * enhancement - Support for shared indexes among workspaces. See [#2723](https://github.com/redhat-developer/vscode-java/issues/2723).
 * enhancement - Support pasting content into a string literal. See [#1249](https://github.com/redhat-developer/vscode-java/issues/1249).
 * enhancement - Resolve missing imports (if any) when pasting code. See [JLS#2320](https://github.com/eclipse/eclipse.jdt.ls/pull/2320).
 * enhancement - Support matching case for code completion. See [#2834](https://github.com/redhat-developer/vscode-java/pull/2834).
 * enhancement - Add code action to insert missing required attributes for an annotation. See [JLS#1860](https://github.com/eclipse/eclipse.jdt.ls/issues/1860).
 * enhancement - Create cleanup actions for adding `final` modifier where possible, converting `switch` statement to `switch` expression, using pattern matching for `instanceof` checks, and converting anonymous functions to lambda expressions. See [#2827](https://github.com/redhat-developer/vscode-java/pull/2827).
 * enhancement - Support quickfix for gradle jpms projects. See [JLS#2304](https://github.com/eclipse/eclipse.jdt.ls/pull/2304).
 * enhancement - Add the Korean translation file. See [#2802](https://github.com/redhat-developer/vscode-java/pull/2802).
 * bug fix - Fix incorrect type hierarchy on multi module Maven projects. See [#2871](https://github.com/redhat-developer/vscode-java/issues/2871).
 * bug fix - Permit output folder to be the same as a source folder. See [#2786](https://github.com/redhat-developer/vscode-java/issues/2786).
 * bug fix - Organize imports removes static imports under some conditions. See [#2861](https://github.com/redhat-developer/vscode-java/issues/2861).
 * bug fix - Fix completion issue occurring when invocation spans multiple lines. See [JLS#2387](https://github.com/eclipse/eclipse.jdt.ls/issues/2387).
 * bug fix - Fix scope calculation for "Surround with try/catch" refactoring. See [#2711](https://github.com/redhat-developer/vscode-java/issues/2711).
 * bug fix - Fix NPE occurring when completion item is selected. See [JLS#2376](https://github.com/eclipse/eclipse.jdt.ls/issues/2376).
 * bug fix - Log user friendly error if client does not support `_java.reloadBundles.command`. See [JLS#2370](https://github.com/eclipse/eclipse.jdt.ls/pull/2370).
 * bug fix - Postfix completion should not be available when editing Javadoc. See [JLS#2367](https://github.com/eclipse/eclipse.jdt.ls/issues/2367).
 * bug fix - Update m2e to latest version in order to ensure classpath resources persist. See [#2857](https://github.com/redhat-developer/vscode-java/issues/2857).
 * build - Use `instanceof` pattern matching in code base. See [JLS#2357](https://github.com/eclipse/eclipse.jdt.ls/pull/2357).
 * build - React to `vsce` renaming to `@vscode/vsce`. See [#2879](https://github.com/redhat-developer/vscode-java/pull/2879).
 * build - Work around vsce refusal to publish extensions with proposed API. See [#2854](https://github.com/redhat-developer/vscode-java/pull/2854).
 * build - Deploy the universal vsix to support all platforms without an embedded JRE. See [#2837](https://github.com/redhat-developer/vscode-java/issues/2837).
 * build - Ensure npm public registry is used for the resolved field in `package-lock.json`. See [#2874](https://github.com/redhat-developer/vscode-java/issues/2874).
 * build - Bump qs from 6.5.2 to 6.5.3 and decode-uri-component from 0.2.0 to 0.2.2. See [#2832](https://github.com/redhat-developer/vscode-java/pull/2832), [#2823](https://github.com/redhat-developer/vscode-java/pull/2823).
 * build - Move utilities out of extension.ts. See [#2824](https://github.com/redhat-developer/vscode-java/pull/2824).
 * documentation - Fix Build Status badge. See [#2847](https://github.com/redhat-developer/vscode-java/pull/2847).

## 1.13.0 (December 1st, 2022)
 * enhancement - Support "Add all missing imports". See [#2753](https://github.com/redhat-developer/vscode-java/pull/2753).
 * enhancement - Support Gradle annotation processing. See [#1039](https://github.com/redhat-developer/vscode-java/issues/1039).
 * enhancement - Add an option to configure null analysis, and set to `interactive` by default. See [#2747](https://github.com/redhat-developer/vscode-java/pull/2747), [#2790](https://github.com/redhat-developer/vscode-java/pull/2790).
 * enhancement - Add setting for clean ups to be applied when document is saved. See [#2144](https://github.com/redhat-developer/vscode-java/issues/2144), [#2803](https://github.com/redhat-developer/vscode-java/pull/2803), [#2813](https://github.com/redhat-developer/vscode-java/pull/2813).
 * enhancement - Add contribution points for completion customization. See [JLS#2110](https://github.com/eclipse/eclipse.jdt.ls/pull/2110).
 * enhancement - Allow the language server to be run without using `IApplication`. See [JLS#2311](https://github.com/eclipse/eclipse.jdt.ls/issues/2311).
 * enhancement - Improve Lombok support and renaming fields when an accessor is present. See [#2805](https://github.com/redhat-developer/vscode-java/issues/2805).
 * bug fix - Display the postfix completions at the bottom of the list. See [JLS#2343](https://github.com/eclipse/eclipse.jdt.ls/pull/2343).
 * bug fix - Display a link for `{@link ...}` expression within javadoc. See [#2810](https://github.com/redhat-developer/vscode-java/issues/2810).
 * bug fix - Do not reset existing project options when setting null analysis options. See [#2764](https://github.com/redhat-developer/vscode-java/issues/2764).
 * bug fix - Code action response may contain `null` as one of the code actions. See [JLS#2327](https://github.com/eclipse/eclipse.jdt.ls/issues/2327).
 * bug fix - Inlay hints should not show up next to Lombok annotations. See [JLS#2323](https://github.com/eclipse/eclipse.jdt.ls/issues/2323).
 * bug fix - Ensure language server always terminates. See [JLS#2302](https://github.com/eclipse/eclipse.jdt.ls/issues/2302).
 * bug fix - Prevent a deadlock during language server initialization. See [#2763](https://github.com/redhat-developer/vscode-java/issues/2763).
 * bug fix - Always send `begin` work done progress before sending `end`. See [JLS#2258](https://github.com/eclipse/eclipse.jdt.ls/pull/2258).
 * bug fix - Use existing Gradle project `.settings/` location if available. See [#2528](https://github.com/redhat-developer/vscode-java/issues/2528).
 * bug fix - Avoid re-using the same job for the "Publish Diagnostics" job. See [JLS#2356](https://github.com/eclipse/eclipse.jdt.ls/pull/2356).
 * build - Use Predicate for filter. See [JLS#2355](https://github.com/eclipse/eclipse.jdt.ls/pull/2355).
 * build - Add pre-release and platform specific publishing for OpenVSX registry. See [#2587](https://github.com/redhat-developer/vscode-java/pull/2587).
 * build - Fix issues reported by npm-audit. See [#2777](https://github.com/redhat-developer/vscode-java/pull/2777).

## 1.12.0 (October 27th, 2022)
 * performance - Improve project initialization. See [JLS#2252](https://github.com/eclipse/eclipse.jdt.ls/pull/2252).
 * performance - Re-use ExecutorService to avoid creating extra threads and resource leak. See [JLS#2041](https://github.com/eclipse/eclipse.jdt.ls/pull/2041).
 * performance - Avoid triggering full rebuild of project after import completes (on Windows). See [#793](https://github.com/redhat-developer/vscode-java/issues/793).
 * enhancement - Add support for postfix completion. See [#1455](https://github.com/redhat-developer/vscode-java/issues/1455).
 * enhancement - Add quick fix for "remove all unused imports". See [JLS#2280](https://github.com/eclipse/eclipse.jdt.ls/pull/2280).
 * enhancement - Add quick fixes for problems relating to sealed classes. See [JLS#2265](https://github.com/eclipse/eclipse.jdt.ls/pull/2265).
 * bug fix - Signature help not working correctly for parameterized types. See [#2739](https://github.com/redhat-developer/vscode-java/issues/2739).
 * bug fix - Avoid NPE for null analysis when updating classpath. See [#2712](https://github.com/redhat-developer/vscode-java/issues/2712).
 * bug fix - Check the digest of the initializiation scripts for security and to prevent duplicates. See [#2692](https://github.com/redhat-developer/vscode-java/issues/2692).
 * bug fix - Support `includeDeclaration` in `textDocument/references`. See [JLS#2148](https://github.com/eclipse/eclipse.jdt.ls/issues/2148).
 * bug fix - Provide folding for import regions in `.class` files. See [#2133](https://github.com/redhat-developer/vscode-java/issues/2133).
 * bug fix - Deadlock when using JDK 17 with Maven Java project. See [#2676](https://github.com/redhat-developer/vscode-java/issues/2676).
 * bug fix - Ignore unnamed module for split packages. See [JLS#2273](https://github.com/eclipse/eclipse.jdt.ls/pull/2273).
 * bug fix - The project preference should only persist non default values. See [JLS#2272](https://github.com/eclipse/eclipse.jdt.ls/issues/2272).
 * bug fix - Synchronize contributed bundles on demand. See [#2729](https://github.com/redhat-developer/vscode-java/pull/2729).
 * bug fix - Avoid unnecessary project updates when the default VM changes. See [JLS#2266](https://github.com/eclipse/eclipse.jdt.ls/pull/2266).
 * bug fix - Exclude non-compile scope dependencies from consideration for enabling null analysis. See [JLS#2264](https://github.com/eclipse/eclipse.jdt.ls/pull/2264).
 * bug fix - Add opportunistic support for Java/Kotlin polyglot Android projects. See [JLS#2261](https://github.com/eclipse/eclipse.jdt.ls/pull/2261).


## 1.11.0 (September 29th, 2022)
 * enhancement - Provide Java 19 preview support. See [#2650](https://github.com/redhat-developer/vscode-java/issues/2650).
 * enhancement - Enable annotation-based `null` analysis. See [#1693](https://github.com/redhat-developer/vscode-java/issues/1693).
 * enhancement - Show generate `toString()`, `hashCode()` and `equals()` quick fixes on demand. See [JLS#2213](https://github.com/eclipse/eclipse.jdt.ls/pull/2213).
 * enhancement - Enable method argument guessing (`java.completion.guessMethodArguments`) by default. See [#2621](https://github.com/redhat-developer/vscode-java/issues/2621).
 * enhancement - Enable signature help (`java.signatureHelp.enabled`) by default. See [#2063](https://github.com/redhat-developer/vscode-java/issues/2063).
 * enhancement - Support creating `module-info.java`. See [#2680](https://github.com/redhat-developer/vscode-java/pull/2680).
 * enhancement - Only add parentheses for lambda expression completions with multiple parameters. See [JLS#2100](https://github.com/eclipse/eclipse.jdt.ls/issues/2100).
 * enhancement - Add buildship auto sync preference when build configuration update is set to `automatic`. See [JLS#2224](https://github.com/eclipse/eclipse.jdt.ls/pull/2224).
 * bug fix - Show the field suggestions for the `toString()`, `hashCode()` and `equals()` generator dialogs in definition order. See [#2502](https://github.com/redhat-developer/vscode-java/issues/2502).
 * bug fix - Fix Gradle project synchorization errors when init script path contains spaces. See [JLS#2245](https://github.com/eclipse/eclipse.jdt.ls/pull/2245), [JLS#2222](https://github.com/eclipse/eclipse.jdt.ls/issues/2222), [JLS#2249](https://github.com/eclipse/eclipse.jdt.ls/pull/2249).
 * bug fix - Fix NPE in the protobuf init script. See [#2700](https://github.com/redhat-developer/vscode-java/issues/2700).
 * bug fix - Disable JVM logging by default (`-Xlog:disable`). See [#2292](https://github.com/redhat-developer/vscode-java/issues/2292).
 * bug fix - Fix type completion when type name conflicts. See [JLS#2232](https://github.com/eclipse/eclipse.jdt.ls/pull/2232).
 * bug fix - Fix gradle project classpath calculation. See [#2628](https://github.com/redhat-developer/vscode-java/issues/2628).
 * bug fix - Bad ".git" pattern in `.project` file's `filteredResources` element causes chaos. See [#2704](https://github.com/redhat-developer/vscode-java/pull/2704).
 * bug fix - Creating a new Java file won't generate package statement. See [#2687](https://github.com/redhat-developer/vscode-java/issues/2687).
 * bug fix - Improve documentation for static import order. See [#711](https://github.com/redhat-developer/vscode-java/issues/711).
 * build - Migrate from tslint to eslint. See [#2415](https://github.com/redhat-developer/vscode-java/pull/2415).

## 1.10.0 (August 31st, 2022)
 * enhancement - Search more folders to infer source roots for invisible projects. See [JLS#2176](https://github.com/eclipse/eclipse.jdt.ls/pull/2176).
 * enhancement - Experimental support for Android projects with `java.jdt.ls.androidSupport.enabled`. It is enabled by default only in VS Code Insiders. See [JLS#923](https://github.com/eclipse/eclipse.jdt.ls/issues/923).
 * enhancement - Automatically add Protobuf output source directories to classpath & generate tasks, if necessary. See [#2629](https://github.com/redhat-developer/vscode-java/pull/2629) & [JLS#2195](https://github.com/eclipse/eclipse.jdt.ls/pull/2195).
 * enhancement - Support "Sort Members" code action. See [#2139](https://github.com/redhat-developer/vscode-java/issues/2139).
 * enhancement - Add grammar for Java Properties files. See [#2636](https://github.com/redhat-developer/vscode-java/pull/2636).
 * enhancement - Always interpret the full workspace symbol query as a package name. See [JLS#2174](https://github.com/eclipse/eclipse.jdt.ls/pull/2174).
 * enhancement - Add support for Maven offline mode (`java.import.maven.offline.enabled`). See [#2617](https://github.com/redhat-developer/vscode-java/pull/2617).
 * enhancement - Add the `zh-TW` (Traditional Chinese) translation file. See [#2573](https://github.com/redhat-developer/vscode-java/pull/2573).
 * bug fix - Prevent "Header must provide a Content-Length property" failure by restricting JVM logging. See [#2577](https://github.com/redhat-developer/vscode-java/issues/2577).
 * bug fix - Infer the source root only when necessary. See [JLS#2178](https://github.com/eclipse/eclipse.jdt.ls/pull/2178).
 * bug fix - Fix inlay hints for `record` classes. See [#2414](https://github.com/redhat-developer/vscode-java/issues/2414).
 * bug fix - Fix formatting of the `new` snippets. See [#2605](https://github.com/redhat-developer/vscode-java/issues/2605).
 * bug fix - Make `java.import.gradle.java.home` property machine-overridable. See [#2624](https://github.com/redhat-developer/vscode-java/pull/2624).
 * bug fix - Set default severity of "Circular classpath" to "warning". See [#718](https://github.com/redhat-developer/vscode-java/issues/718).
 * bug fix - Permit non-JDT errors to be reported in Java files. See [JLS#2154](https://github.com/eclipse/eclipse.jdt.ls/issues/2154).
 * bug fix - Avoid naming conflicts between Gradle project modules. See [JLS#2190](https://github.com/eclipse/eclipse.jdt.ls/pull/2190).
 * bug fix - Re-fetch the extension registry when delegate command lookup fails. See [JLS#2184](https://github.com/eclipse/eclipse.jdt.ls/pull/2184).
 * bug fix - Skip the "default project" when detecting Lombok. See [#2633](https://github.com/redhat-developer/vscode-java/pull/2633).
 * bug fix - Skip security check for `java.home` and `java.jdt.ls.java.home` in trusted workspace. See [#2600](https://github.com/redhat-developer/vscode-java/issues/2600).
 * bug fix - Keep consistent style in notifications (eg. use "Reload") and use plural form for `Reload Projects` command title. See [#2585](https://github.com/redhat-developer/vscode-java/issues/2585) & [#2612](https://github.com/redhat-developer/vscode-java/pull/2612).
 * dependencies - Update to `jdk-utils@0.4.4`. See [#2601](https://github.com/redhat-developer/vscode-java/pull/2601).
 * debt - Remove stale Travis CI information from `README`. See [#2592](https://github.com/redhat-developer/vscode-java/issues/2592).

## 1.9.0 (July 21st, 2022)
 * enhancement - Package lombok into extension for use when lombok support enabled, and not on project classpath. See [#2550](https://github.com/redhat-developer/vscode-java/pull/2550).
 * enhancement - Add support for qualified workspace symbols. See [#2538](https://github.com/redhat-developer/vscode-java/pull/2538).
 * enhancement - Refresh the unmanaged project's classpath on demand. See [#1282](https://github.com/redhat-developer/vscode-java/issues/1282).
 * enhancement - Provide reload project diagnostics on demand. See [#2575](https://github.com/redhat-developer/vscode-java/pull/2575).
 * bug fix - Missing completions for fully qualified constructor names. See [JLS#2147](https://github.com/eclipse/eclipse.jdt.ls/issues/2147).
 * bug fix - Completion replacement for a type proposal is incorrect in some cases. See [#2534](https://github.com/redhat-developer/vscode-java/issues/2534).
 * bug fix - Project configuration is not updated after modifying build file. See [#2566](https://github.com/redhat-developer/vscode-java/issues/2566).
 * bug fix - Fixed language server crashing because of wrong lombok jar. See [#2542](https://github.com/redhat-developer/vscode-java/pull/2542).
 * bug fix - Do not warn about missing JDT-LS stdout/stderr log files. See [#2535](https://github.com/redhat-developer/vscode-java/issues/2535).
 * bug fix - Scan two levels of directories for activation indicators. See [#2280](https://github.com/redhat-developer/vscode-java/issues/2280).
 * bug fix - Correct typo in gradle checksum mismatch error message. See [JLS#2161](https://github.com/eclipse/eclipse.jdt.ls/pull/2161).
 * build - wrong JRE embedded in pre-release package. See [#2559](https://github.com/redhat-developer/vscode-java/issues/2559).
 * build - TypeError: `s.logFailedRequest` is not a function. See [#2480](https://github.com/redhat-developer/vscode-java/issues/2480).
 * build - Compile error in `MavenBuildSupport.update(IProject, boolean, IProgressMonitor)`. See [JLS#2150](https://github.com/eclipse/eclipse.jdt.ls/issues/2150).
 * build - Migrate to `@vscode/test-electron`. See [#2555](https://github.com/redhat-developer/vscode-java/pull/2555).
 * build - Update moment & terser packages. See [#2580](https://github.com/redhat-developer/vscode-java/pull/2580).

## 1.8.0 (June 30th, 2022)
 * enhancement - Improve the Lombok support. See [#2519](https://github.com/redhat-developer/vscode-java/pull/2519).
 * enhancement - Show `Add javadoc for` in quick assists. See [JLS#2133](https://github.com/eclipse/eclipse.jdt.ls/pull/2133).
 * enhancement - Show `Change modifiers to final` in quick assists. See [JLS#2134](https://github.com/eclipse/eclipse.jdt.ls/pull/2134).
 * enhancement - Support project reload selection. See [#2513](https://github.com/redhat-developer/vscode-java/pull/2513).
 * enhancement - Auto-select field when generating constructors. See [#2125](https://github.com/redhat-developer/vscode-java/pull/2508).
 * enhancement - Allow to build selected projects. See [#2526](https://github.com/redhat-developer/vscode-java/pull/2526).
 * enhancement - Support multiple selections for generate accessors. See [JLS#2136](https://github.com/eclipse/eclipse.jdt.ls/pull/2136).
 * bug fix - Fix NPE when triggering signature help in class file. See [JLS#2102](https://github.com/eclipse/eclipse.jdt.ls/issues/2102).
 * bug fix - Support for renaming record attributes. See [#2433](https://github.com/redhat-developer/vscode-java/issues/2433).
 * bug fix - Add logback tracing to JDT-LS. See [JLS#2108](https://github.com/eclipse/eclipse.jdt.ls/issues/2108).
 * bug fix - `Open All Log Files` should also include the standard output/error log files. See [#2367](https://github.com/redhat-developer/vscode-java/issues/2367).
 * bug fix - Verify that `java.jdt.ls.java.home` meets minimum JRE requirement. See [#2512](https://github.com/redhat-developer/vscode-java/pull/2512).
 * bug fix - Avoid repeatedly setting busy and ready for language server status. See [#2494](https://github.com/redhat-developer/vscode-java/pull/2494).
 * bug fix - Fix ParentProcessWatcher on macOS. See [#2488](https://github.com/redhat-developer/vscode-java/issues/2488).
 * bug fix - Change the order for configuration updating options. See [JLS#2135](https://github.com/eclipse/eclipse.jdt.ls/pull/2135).
 * bug fix - Show Type Hierarchy breaks in vscode-insiders. See [#2524](https://github.com/redhat-developer/vscode-java/issues/2524).
 * bug fix - TypeError: Cannot read properties of undefined (reading 'stop'). See [#2503](https://github.com/redhat-developer/vscode-java/issues/2503).
 * build - Move to Java 17. See [#2495](https://github.com/redhat-developer/vscode-java/pull/2495).
 * debt - GitHub Actions job should use Node.js 14. See [#2532](https://github.com/redhat-developer/vscode-java/pull/2532).
 * other - Adjust the order of code actions. See [JLS#2109](https://github.com/eclipse/eclipse.jdt.ls/pull/2109).
 * other - Add DCO documentation. See [#2521](https://github.com/redhat-developer/vscode-java/pull/2521).
 * other - Allow to clean workspace without pop-up notification. See [#2514](https://github.com/redhat-developer/vscode-java/pull/2514).


## 1.7.0 (June 1st, 2022)
 * enhancement - Support separate "Generate Getters" and "Generate Setters". See [#2362](https://github.com/redhat-developer/vscode-java/issues/2362).
 * enhancement - Show field type when generating accessors. See [#2459](https://github.com/redhat-developer/vscode-java/pull/2459).
 * enhancement - Show quick fixes for generating accessors in field declarations. See [JLS#2092](https://github.com/eclipse/eclipse.jdt.ls/pull/2092).
 * enhancement - Support exclusion list for inlay hints. See [#2412](https://github.com/redhat-developer/vscode-java/issues/2412).
 * enhancement - Support Gradle invalid type code error check. See [#1594](https://github.com/redhat-developer/vscode-java/issues/1594).
 * bug fix - Add support to open decompiled symbols through the symbols list. See [JLS#2087](https://github.com/eclipse/eclipse.jdt.ls/issues/2087).
 * bug fix - Add completion support for multiline comment blocks. See [#2484](https://github.com/redhat-developer/vscode-java/pull/2484).
 * bug fix - Ensure the standard server shuts down immediately after the client. See [#2471](https://github.com/redhat-developer/vscode-java/issues/2471).
 * bug fix - Fix `java.completion.importOrder`. See [#2489](https://github.com/redhat-developer/vscode-java/pull/2489).
 * other - Add a new API to wait for standard server ready. See [#2461](https://github.com/redhat-developer/vscode-java/pull/2461).
 * other - Support publishing pre-release versions. See [#2285](https://github.com/redhat-developer/vscode-java/issues/2285).

## 1.6.0 (May 5th, 2022)
 * enhancement - Trigger signature help on completion item selected. See [#2426](https://github.com/redhat-developer/vscode-java/pull/2426).
 * enhancement - Support completion insert/replace capability. Use the setting `editor.suggest.insertMode` to control whether to overwrite words when accepting completions. You can also quickly toggle between insert & replace modes with `Shift + Tab` or `Shift + Enter` (default keyboard shortcuts). See [#2427](https://github.com/redhat-developer/vscode-java/pull/2427).
 * enhancement - Add a new preference `java.signatureHelp.description.enabled` to disable/enable signature description. See [#2404](https://github.com/redhat-developer/vscode-java/pull/2404).
 * bug fix - Fix the "Manage Workspace Trust" command. See [#2431](https://github.com/redhat-developer/vscode-java/issues/2431).
 * bug fix - Improve the signature help feature by handling some special cases. See [JLS#2025](https://github.com/eclipse/eclipse.jdt.ls/issues/2025).
 * bug fix - Do not show signature help at the end of an invocation. See [JLS#2079](https://github.com/eclipse/eclipse.jdt.ls/pull/2079).
 * bug fix - Show error status when the project is not created. See [JLS#2058](https://github.com/eclipse/eclipse.jdt.ls/issues/2058).
 * bug fix - Error during importing an Eclipse project whose sources are at root. See [#2436](https://github.com/redhat-developer/vscode-java/issues/2436).
 * bug fix - Fix NPE in isCompletionInsertReplaceSupport check. See [JLS#2070](https://github.com/eclipse/eclipse.jdt.ls/pull/2070).
 * bug fix - Unexpected 'Project xxx has no explicit encoding set' warnings. See [#2416](https://github.com/redhat-developer/vscode-java/issues/2416).
 * bug fix - Fix issue where JDT-LS's logback configuration was being ignored. See [JLS#2077](https://github.com/eclipse/eclipse.jdt.ls/pull/2077).

## 1.5.0 (April 13th, 2022)
 * performance - Adopt new CompletionProposal API to ignore types before creating certain proposals. See [JLS#2034](https://github.com/eclipse/eclipse.jdt.ls/pull/2034).
 * enhancement - Provide Java 18 support. See [#2364](https://github.com/redhat-developer/vscode-java/pull/2364).
 * enhancement - Support inlay hints for parameter names. See [#2099](https://github.com/redhat-developer/vscode-java/issues/2099).
 * enhancement - Show server status through the language status item. See [#2351](https://github.com/redhat-developer/vscode-java/issues/2351).
 * enhancement - Add code action to extract lambda body to method. See [JLS#2027](https://github.com/eclipse/eclipse.jdt.ls/issues/2027).
 * enhancement - Navigate to class declaration. See [#2132](https://github.com/redhat-developer/vscode-java/pull/2132).
 * bug fix - Provide file & type comments for newly created compilation units. See [JLS#2047](https://github.com/eclipse/eclipse.jdt.ls/pull/2047).
 * bug fix - Code snippets should be usable even before LS done resolving dependencies. See [#684](https://github.com/redhat-developer/vscode-java/issues/684).
 * bug fix - Fix an occurrence of duplicate quick fixes at the line level See [#2339](https://github.com/redhat-developer/vscode-java/issues/2339).
 * bug fix - Cannot refactor in static block. See [#2370](https://github.com/redhat-developer/vscode-java/issues/2370).
 * bug fix - Make `java.configuration.runtimes` & `java.jdt.ls.vmargs` machine-overridable. See [#2001](https://github.com/redhat-developer/vscode-java/issues/2001), [#2368](https://github.com/redhat-developer/vscode-java/pull/2368).
 * bug fix - The number of method signatures cannot be displayed in some cases. See [#2341](https://github.com/redhat-developer/vscode-java/issues/2341).
 * bug fix - Ensure that client-side commands do not clash with server-side. See [#2331](https://github.com/redhat-developer/vscode-java/issues/2331).
 * bug fix - Fix issue in JDK detection logic. See [#2025](https://github.com/redhat-developer/vscode-java/issues/2025).
 * other - Increase the maximum size of client.log file. See [#2356](https://github.com/redhat-developer/vscode-java/pull/2356).

## 1.4.0 (March 3rd, 2022)
 * enhancement - Trigger completion after `new` keyword. See [#1666](https://github.com/redhat-developer/vscode-java/issues/1666).
 * enhancement - Improve occurrences highlighting. See [JLS#1941](https://github.com/eclipse/eclipse.jdt.ls/pull/1941).
 * enhancement - Autoclose multiline strings (JEP 368). See [#1428](https://github.com/redhat-developer/vscode-java/issues/1428).
 * enhancement - Provide more aliases for code snippets. See [#2314](https://github.com/redhat-developer/vscode-java/pull/2314).
 * bug fix - "Add serial version ID" should not generate empty comments. See [JLS#1899](https://github.com/eclipse/eclipse.jdt.ls/issues/1899).
 * bug fix - Convert to static import incorrectly removes import statements. See [JLS#1203](https://github.com/eclipse/eclipse.jdt.ls/issues/1203).
 * bug fix - Open Java extension log doesn't open latest file. See [#2319](https://github.com/redhat-developer/vscode-java/issues/2319).
 * bug fix - Type mismatch: cannot convert from `Object` to `Map<String,IndexType>`. See [JLS#1971](https://github.com/eclipse/eclipse.jdt.ls/issues/1971).
 * bug fix - Signature help occasionally fails on constructors and qualified method invocations. See [#2097](https://github.com/redhat-developer/vscode-java/issues/2097).
 * other - Set `java.configuration.workspaceCacheLimit` default value to 90. See [#2330](https://github.com/redhat-developer/vscode-java/pull/2330).
 * other - Deprecate `java.configuration.checkProjectSettingsExclusions`. See [#2311](https://github.com/redhat-developer/vscode-java/pull/2311).

## 1.3.0 (January 24th, 2022)
 * enhancement - Support completion for lambda expressions. See [JLS#1985](https://github.com/eclipse/eclipse.jdt.ls/issues/1985).
 * enhancement - Add "Convert to Switch Expression" code assist proposal. See [JLS#1935](https://github.com/eclipse/eclipse.jdt.ls/pull/1935).
 * enhancement - Support Gradle compatibility check. See [#2225](https://github.com/redhat-developer/vscode-java/issues/2225).
 * enhancement - Language server status bar item is not in sync with the real status. See [#2243](https://github.com/redhat-developer/vscode-java/issues/2243).
 * bug fix - Fix regression in signature help. See [JLS#1980](https://github.com/eclipse/eclipse.jdt.ls/issues/1980).
 * bug fix - Provide a way to disable embedded JRE. See [#2276](https://github.com/redhat-developer/vscode-java/issues/2276).
 * bug fix - Projects containing windows symlink directories are not recognized. See [#2264](https://github.com/redhat-developer/vscode-java/issues/2264).
 * bug fix - JDK installed via Homebrew is not detected. See [#2254](https://github.com/redhat-developer/vscode-java/issues/2254).
 * bug fix - Avoid duplicate quick fixes when showing all quick fixes on a line. See [#2236](https://github.com/redhat-developer/vscode-java/issues/2236).
 * bug fix - "Go to References" result contains inaccurate references. See [#2227](https://github.com/redhat-developer/vscode-java/issues/2227).
 * bug fix - Ensure gradle wrappers are correctly processed on project import. See [#2218](https://github.com/redhat-developer/vscode-java/issues/2218).
 * build - Fix Jenkinsfile to publish the correct generic extension version. See [#2252](https://github.com/redhat-developer/vscode-java/pull/2252).
 * other - Change minimum JDK requirement listed in documentation. See [#2275](https://github.com/redhat-developer/vscode-java/pull/2275).

## 1.2.0 (December 16th, 2021)
 * enhancement - Support platform specific extension. See [#2109](https://github.com/redhat-developer/vscode-java/issues/2109).
 * enhancement - Make the debounce adaptive for validation job. See [JLS#1973](https://github.com/eclipse/eclipse.jdt.ls/pull/1973).
 * bug fix - Fix issue where importing packages showed incorrect result. See [#1422](https://github.com/redhat-developer/vscode-java/issues/1422).
 * bug fix - Fix regression in code action for unresolved type. See [JLS#1967](https://github.com/eclipse/eclipse.jdt.ls/pull/1967).
 * bug fix - Diagnostics from changes to build configuration not reflected in opened source files. See [JLS#1963](https://github.com/eclipse/eclipse.jdt.ls/issues/1963).
 * bug fix - Java extension does not work on standalone java files. See [#2231](https://github.com/redhat-developer/vscode-java/issues/2231).
 * debt - Remove unused log4j 1.2.15 from builds. See [JLS#1972](https://github.com/eclipse/eclipse.jdt.ls/pull/1972).
 * debt - Use jdk-utils to detect installed runtimes. See [#2246](https://github.com/redhat-developer/vscode-java/pull/2246).

## 1.1.0 (November 26th, 2021)
 * enhancement - Stop generating metadata files at project's root. See [#618](https://github.com/redhat-developer/vscode-java/issues/618).
 * enhancement - Quickfixes should be available at the line level. See [#2130](https://github.com/redhat-developer/vscode-java/issues/2130).
 * enhancement - Explicitly report OutOfMemory error to user. See [#1959](https://github.com/redhat-developer/vscode-java/issues/1959).
 * enhancement - Add option to clean out cached workspace data that is unused for a specified period of time. See [#2110](https://github.com/redhat-developer/vscode-java/issues/2110).
 * enhancement - Add `Generate Constructors` to Show Fixes for type declaration. See [JLS#1937](https://github.com/eclipse/eclipse.jdt.ls/pull/1937).
 * enhancement - Add `Override/Implement methods` to Show Fixes for type declaration. See [JLS#1932](https://github.com/eclipse/eclipse.jdt.ls/pull/1932).
 * enhancement - Add "Surround With Try-With" code assist proposal. See [#2128](https://github.com/redhat-developer/vscode-java/issues/2128).
 * enhancement - Formatter should indent `case` statements within a `switch` statement by default. See [#2185](https://github.com/redhat-developer/vscode-java/issues/2185).
 * enhancement - Formatter should not join wrapped lines by default. See [#2181](https://github.com/redhat-developer/vscode-java/issues/2181).
 * enhancement - Always show `Organize imports` in Quick Fixes for import declaration. See [JLS#1936](https://github.com/eclipse/eclipse.jdt.ls/pull/1936).
 * bug fix - Java server refreshing the workspace (cleaning/building) for each restart. See [#2222](https://github.com/redhat-developer/vscode-java/issues/2222).
 * bug fix - Problem messages can get offset by frequent changes to the document. See [#1633](https://github.com/redhat-developer/vscode-java/issues/1633).
 * bug fix - Duplicate implement method quick fixes. See [JLS#1942](https://github.com/eclipse/eclipse.jdt.ls/issues/1942).
 * bug fix - Malformed semantic tokens in some case. See [JLS#1922](https://github.com/eclipse/eclipse.jdt.ls/issues/1922).
 * bug fix - Several errors reported for anonymous Object classes. See [JLS#1915](https://github.com/eclipse/eclipse.jdt.ls/issues/1915).
 * bug fix - `if` with `instanceof` pattern match and `&&` breaks completion in nested `if`. See [JLS#1855](https://github.com/eclipse/eclipse.jdt.ls/issues/1855).
 * bug fix - Java build status spinning forever. See [#2214](https://github.com/redhat-developer/vscode-java/pull/2214).
 * bug fix - Creating the formatter file fails silently if parent folder doesn't exist. See [#2189](https://github.com/redhat-developer/vscode-java/issues/2189).
 * debt - Don't use deprecated rangeLength property in handleChanged. See [JLS#1928](https://github.com/eclipse/eclipse.jdt.ls/pull/1928).

## 1.0.0 (October 19th, 2021)
 * performance - completion: optimize the index engine for the scenario "complete on type name". See [JLS#1846](https://github.com/eclipse/eclipse.jdt.ls/issues/1846).
 * enhancement - Support Java 17. See [#2102](https://github.com/redhat-developer/vscode-java/pull/2102).
 * enhancement - Add semantic token types for Records. See [#2125](https://github.com/redhat-developer/vscode-java/issues/2125).
 * enhancement - Support highlight for constructor call. See [#2124](https://github.com/redhat-developer/vscode-java/issues/2124).
 * enhancement - Add Getter and Setter to Show Fixes for type declaration. See [JLS#1883](https://github.com/eclipse/eclipse.jdt.ls/pull/1883).
 * enhancement - Add `toString()` to Show Fixes for type declaration. See [JLS#1903](https://github.com/eclipse/eclipse.jdt.ls/pull/1903).
 * enhancement - Add a `codeAction` to generate the `serialVersionUID` field. See [JLS#1892](https://github.com/eclipse/eclipse.jdt.ls/issues/1892).
 * enhancement - i18n: support Chinese. See [#2027](https://github.com/redhat-developer/vscode-java/pull/2027).
 * enhancement - Adopt new createStatusBarItem API. See [#2083](https://github.com/redhat-developer/vscode-java/pull/2083).
 * bug fix - Missing space in anonymous type completion proposal. See [#2147](https://github.com/redhat-developer/vscode-java/issues/2147).
 * bug fix - Packages are not filtered from completion despite the `java.completion.filteredTypes` configuration. See [JLS#1904](https://github.com/eclipse/eclipse.jdt.ls/issues/1904).
 * bug fix - Exclude `jdk.*`, `org.graalvm.*` and `io.micrometer.shaded.*` from completion. See [#2164](https://github.com/redhat-developer/vscode-java/pull/2164).
 * bug fix - "Project Configuration Update" is broken due to `JDTUtils.isExcludedFile()` is not working. See [JLS#1909](https://github.com/eclipse/eclipse.jdt.ls/issues/1909).
 * bug fix - NPE on `::new` method refs (Cannot invoke `org.eclipse.jdt.core.dom.IMethodBinding.isSynthetic()` because "functionalMethod" is null). See [JLS#1885](https://github.com/eclipse/eclipse.jdt.ls/issues/1885).
 * bug fix - Go to definition doesn't compute/find results on methods inside an anonymous class. See [JLS#1813](https://github.com/eclipse/eclipse.jdt.ls/issues/1813).
 * bug fix - Assign all to fields generates wrong field names in some corner cases. See [JLS#1031](https://github.com/eclipse/eclipse.jdt.ls/issues/1031).
 * bug fix - Import quickfix disappear on save. See [#2127](https://github.com/redhat-developer/vscode-java/issues/2127).
 * bug fix - Module descriptor syntax coloring should be improved. See [#1384](https://github.com/redhat-developer/vscode-java/issues/1384).
 * bug fix - Fix Open Java Formatter Settings. See [#2138](https://github.com/redhat-developer/vscode-java/pull/2138).
 * bug fix - Code is compiled with preview features for no reason, causing the project not to run. See [#1971](https://github.com/redhat-developer/vscode-java/issues/1971).
 * build - npm run watch fails with unresolved dependencies. See [#230](https://github.com/redhat-developer/vscode-java/issues/230).
 * debt - Update org.jsoup 1.9.2 to 1.14.2. See [JLS#1884](https://github.com/eclipse/eclipse.jdt.ls/pull/1884).

## 0.82.0 (September 16th, 2021)
 * performance - completion: optimize the performance of SnippetCompletionProposal. See [JLS#1838](https://github.com/eclipse/eclipse.jdt.ls/issues/1838).
 * performance - completion: listing constructors is slow. See [JLS#1836](https://github.com/eclipse/eclipse.jdt.ls/issues/1836).
 * enhancement - Support Kotlin Gradle files. See [#632](https://github.com/redhat-developer/vscode-java/issues/632) & [JLS#449](https://github.com/eclipse/eclipse.jdt.ls/issues/449).
 * enhancement - "Open Call Hierarchy" does not jump to the reference where it is invoked at. See [#2044](https://github.com/redhat-developer/vscode-java/issues/2044).
 * enhancement - Semantic highlighting is not available in lightweight mode. See [#1999](https://github.com/redhat-developer/vscode-java/issues/1999).
 * enhancement - Add additional variables for java.template snippets. See [#1987](https://github.com/redhat-developer/vscode-java/issues/1987).
 * enhancement - Add 'hashCode()' and 'equals()' to Show Fixes for type declaration. See [JLS#1842](https://github.com/eclipse/eclipse.jdt.ls/pull/1842).
 * enhancement - Permit usage of javaagent when resource is not in workspace. See [#1965](https://github.com/redhat-developer/vscode-java/issues/1965).
 * enhancement - Add functionality to exclude files that will not be tracked for changes. See [JLS#1847](https://github.com/eclipse/eclipse.jdt.ls/issues/1847).
 * bug fix - Some typeComment variables can't be parsed. See [#2052](https://github.com/redhat-developer/vscode-java/issues/2052).
 * bug fix - Generate Getters source action is broken from within a record. See [JLS#1392](https://github.com/eclipse/eclipse.jdt.ls/issues/1392).
 * bug fix - Java LS sometimes hangs while loading a gradle project. See [#2088](https://github.com/redhat-developer/vscode-java/issues/2088).
 * bug fix - java.project.exclusion is not working as expected. See [#2075](https://github.com/redhat-developer/vscode-java/issues/2075).
 * bug fix - Fix regression for Gradle project compilation. See [#2071](https://github.com/redhat-developer/vscode-java/issues/2071).
 * bug fix - Get correct Java project in multi-module case. See [JLS#1865](https://github.com/eclipse/eclipse.jdt.ls/pull/1865).
 * debt - Update target platform to 2021-09 (4.21) Release. See [JLS#1880](https://github.com/eclipse/eclipse.jdt.ls/pull/1880).
 * other - Support import from configuration files. See [JLS#1840](https://github.com/eclipse/eclipse.jdt.ls/pull/1840).
 * other - Support 3.16 semantic tokens. See [JLS#1678](https://github.com/eclipse/eclipse.jdt.ls/issues/1678).
 * other - Remove redundant use of `await` on a return. See [#2100](https://github.com/redhat-developer/vscode-java/pull/2100).
 * other - Disable extension in virtual workspaces. See [#1942](https://github.com/redhat-developer/vscode-java/pull/1942).

## 0.81.0 (August 17th, 2021)
 * enhancement - 'Create method' code action for method reference. See [JLS#1464](https://github.com/eclipse/eclipse.jdt.ls/issues/1464).
 * enhancement - Show job status via progress notification on start. See [#2022](https://github.com/redhat-developer/vscode-java/pull/2022)
 * enhancement - New setting entry to choose project type (Maven or Gradle) when ambiguous. See [#600](https://github.com/redhat-developer/vscode-java/issues/600).
 * performance - Avoid displaying (expensive) constant values in completion items. See [JLS#1835](https://github.com/eclipse/eclipse.jdt.ls/issues/1835).
 * performance - toURI is expensive on Windows for completions. See [JLS#1831](https://github.com/eclipse/eclipse.jdt.ls/issues/1831).
 * bug fix - Go to definition doesn't compute/find results on methods inside an anonymous class. See [JLS#1813](https://github.com/eclipse/eclipse.jdt.ls/issues/1813).
 * bug fix - quickfix not available where cursor lands by default on annotations. See [#1992](https://github.com/redhat-developer/vscode-java/issues/1992).
 * bug fix - Fix content assist for multiline strings. See [#1811](https://github.com/redhat-developer/vscode-java/issues/1811).
 * bug fix - Language server freezes when importing Maven project. See [#2020](https://github.com/redhat-developer/vscode-java/issues/2020).
 * bug fix - Suggest correct import quick fix in anonymous classes. See [#2034](https://github.com/redhat-developer/vscode-java/issues/2034).
 * bug fix - Organize imports generates duplicate static import statement. See [#2012](https://github.com/redhat-developer/vscode-java/issues/2012).
 * bug fix - Do not show the import notification when no projects available. See [#2056](https://github.com/redhat-developer/vscode-java/pull/2056).
 * bug fix - Make commands wait for applyEdit. See [#2042](https://github.com/redhat-developer/vscode-java/pull/2042).
 * build - Move pull request verification job to GitHub Actions. See [#2031](https://github.com/redhat-developer/vscode-java/pull/2031).
 * debt - Update eclipse-jarsigner-plugin to 1.3.2. See [JLS#1829](https://github.com/eclipse/eclipse.jdt.ls/pull/1829).
 * debt - Language server distro contains 2 Guava jars. See [JLS#1706](https://github.com/eclipse/eclipse.jdt.ls/issues/1706).
 * other - Change the default value of the setting `java.project.importOnFirstTimeStartup` to `automatic`. See [#2014](https://github.com/redhat-developer/vscode-java/issues/2014)
 * other - Disable Workspace Trust in test suite runtime. See [#2026](https://github.com/redhat-developer/vscode-java/pull/2026).
 * other - Typo in notcoveredexecution.md. See [#2033](https://github.com/redhat-developer/vscode-java/pull/2033).

## 0.80.0 (June 30th, 2021)
 * enhancement - Allow folding `static` blocks. See [JLS#1777](https://github.com/eclipse/eclipse.jdt.ls/issues/1777).
 * enhancement - Add deprecated property to CompletionItem and SymbolInformation. See [JLS#695](https://github.com/eclipse/eclipse.jdt.ls/issues/695).
 * enhancement - Support Workspace Trust. See [#1926](https://github.com/redhat-developer/vscode-java/issues/1926).
 * enhancement - Add option to ignore all proxies. See [#1947](https://github.com/redhat-developer/vscode-java/issues/1947).
 * enhancement - Provide fix suggestions for not covered Maven plugin execution in project build lifecycle. See [#1949](https://github.com/redhat-developer/vscode-java/pull/1949).
 * bug fix - Cannot make a static reference to the non-static type T. See [JLS#1781](https://github.com/eclipse/eclipse.jdt.ls/issues/1781).
 * bug fix - extract method does not seem to like var nor method references. See [#1956](https://github.com/redhat-developer/vscode-java/issues/1956).
 * bug fix - "Problem" The method methodName(ParamType) in the type ClassName is not applicable for the arguments () in lightweight syntax only mode. See [#1931](https://github.com/redhat-developer/vscode-java/issues/1931).
 * bug fix - Rename to shouldLanguageServerExitOnShutdown extended capability. See [#2008](https://github.com/redhat-developer/vscode-java/pull/2008).
 * bug fix - Syntax server no longer exits once JDT server is initialized. See [#1928](https://github.com/redhat-developer/vscode-java/issues/1928).
 * bug fix - File contents would be strange when renaming java file name (with lombok). See [JLS#1775](https://github.com/eclipse/eclipse.jdt.ls/issues/1775).
 * bug fix - Changes on the profile have no effect if there are backslashes (\\) in the format.settings.url. See [#1944](https://github.com/redhat-developer/vscode-java/issues/1944).
 * bug fix - java.project.sourcePaths doesn't refresh diagnostics. See [JLS#1769](https://github.com/eclipse/eclipse.jdt.ls/issues/1769).
 * bug fix - wrong status in 'language/progressReport' notification when processing call hierarchy requests. See [JLS#1722](https://github.com/eclipse/eclipse.jdt.ls/issues/1722).
 * build - Adjust .vscodeignore filters due to vsce@1.92 update. See [#1983](https://github.com/redhat-developer/vscode-java/pull/1983).
 * other - Bump browserslist from 4.16.4 to 4.16.6. See [#1961](https://github.com/redhat-developer/vscode-java/pull/1961).

## 0.79.2 (May 19th, 2021)
 * bug fix - Package name not recognized when opening standalone java files. See [JLS#1764](https://github.com/eclipse/eclipse.jdt.ls/issues/1764).
 * bug fix - Force Java Compilation returns error. See [#1929](https://github.com/redhat-developer/vscode-java/issues/1929).
 * bug fix - Invalid formatter profile name setting causes errors. See [JLS#1761](https://github.com/eclipse/eclipse.jdt.ls/issues/1761).
 * bug fix - Formatter doesn't load format config after update. See [#1917](https://github.com/redhat-developer/vscode-java/issues/1917).
 * bug fix - Improve handling of exported settings files. See [#1939](https://github.com/redhat-developer/vscode-java/issues/1939).
 * bug fix - A 'keyword' semantic token will sometimes appear when typing an expression. See [#1921](https://github.com/redhat-developer/vscode-java/issues/1921).
 * other - Update hosted-git-info dependency. See [#1940](https://github.com/redhat-developer/vscode-java/pull/1940).
 * other - Update lodash dependency. See [#1934](https://github.com/redhat-developer/vscode-java/pull/1934).

## 0.79.1 (May 3rd, 2021)
* bug fix - Formatter doesn't load format config after update. See [#1917](https://github.com/redhat-developer/vscode-java/issues/1917).

## 0.79.0 (April 29th, 2021)
* enhancement - Update language client to 7.0.0 to adopt LSP 3.16 features (enables lazy code action resolution). See [#1894](https://github.com/redhat-developer/vscode-java/pull/1894).

## 0.78.0 (April 29th, 2021)
 * enhancement - Add Java 16 Support. See [#1891](https://github.com/redhat-developer/vscode-java/pull/1891).
 * enhancement - java.project.referencedLibraries should resolve paths leading with ~. See [JLS#1735](https://github.com/eclipse/eclipse.jdt.ls/issues/1735).
 * enhancement - Provide support for 3rd party build types (Bazel). See [#1825](https://github.com/redhat-developer/vscode-java/issues/1825).
 * enhancement - Add setting to control method declaration lookups in source files. See [#1887](https://github.com/redhat-developer/vscode-java/pull/1887).
 * bug fix - Changes to Formatter profiles don‘t take effect in real time. See [JLS#1736](https://github.com/eclipse/eclipse.jdt.ls/issues/1736).
 * bug fix - Javadoc overriding methods not inheriting param descriptions. See [JLS#1732](https://github.com/eclipse/eclipse.jdt.ls/issues/1732).
 * bug fix - NPE in NewCUProposal.createChange(NewCUProposal.java:277). See [JLS#1723](https://github.com/eclipse/eclipse.jdt.ls/issues/1723).
 * bug fix - java.settings.url does not override default java settings. See [JLS#1741](https://github.com/eclipse/eclipse.jdt.ls/issues/1741).
 * bug fix - workspaceEdit textDocument version is always 0. See [JLS#1695](https://github.com/eclipse/eclipse.jdt.ls/issues/1695).
 * build - Bump ssri from 6.0.1 to 6.0.2. See [#1889](https://github.com/redhat-developer/vscode-java/pull/1889).

## 0.77.0 (April 15th, 2021)
 * enhancement - Refactor when moving files. See [#641](https://github.com/redhat-developer/vscode-java/issues/641).
 * enhancement - Support Type Hierarchy. See [#1790](https://github.com/redhat-developer/vscode-java/pull/1790).
 * enhancement - Expose source paths setting in VS Code for unmanaged folders. See [#1798](https://github.com/redhat-developer/vscode-java/issues/1798).
 * enhancement - Source actions should generate code at cursor location. See [#1346](https://github.com/redhat-developer/vscode-java/issues/1346).
 * enhancement - Support String formatting via delegate command. See [JLS#1702](https://github.com/eclipse/eclipse.jdt.ls/pull/1702).
 * enhancement - Add more options to query project settings. See [#1828](https://github.com/redhat-developer/vscode-java/pull/1828).
 * enhancement - Writing Java in VS CODE shows way too much warnings! See [#1657](https://github.com/redhat-developer/vscode-java/issues/1657).
 * enhancement - Enhanced IBuildSupport usage to support other build tools such as bazel. See [JLS#1694](https://github.com/eclipse/eclipse.jdt.ls/pull/1694).
 * bug fix - External tool file modifications not registered. See [JLS#1650](https://github.com/eclipse/eclipse.jdt.ls/issues/1650).
 * bug fix - Enhance the condition of inline constant. See [JLS#1672](https://github.com/eclipse/eclipse.jdt.ls/pull/1672).
 * bug fix - Java code formatter rules is ignored. See [#1640](https://github.com/redhat-developer/vscode-java/issues/1640).
 * bug fix - java.format.settings.url no longer loads project .xml file. See [#1827](https://github.com/redhat-developer/vscode-java/issues/1827).
 * bug fix - Typo When Trying to Add Folder to Java Source Path That Is Already Included By Parent. See [#1833](https://github.com/redhat-developer/vscode-java/issues/1833).
 * bug fix - Set minimum for threshold settings. See [#1868](https://github.com/redhat-developer/vscode-java/pull/1868).
 * bug fix - Invisible project forgets source paths on classpath update. See [JLS#1647](https://github.com/eclipse/eclipse.jdt.ls/issues/1647).
 * bug fix - Keep getting "Couldn't start client Language Support for Java" when opening a Java file in vscode. See [#1813](https://github.com/redhat-developer/vscode-java/issues/1813).
 * bug fix - Disable console.log for lsp trace due to performance issue. See [#1824](https://github.com/redhat-developer/vscode-java/pull/1824).
 * build - Update Target Platform to 2021-03 Release. See [JLS#1691](https://github.com/eclipse/eclipse.jdt.ls/pull/1691).
 * build - Update lsp4j to 0.11.0. See [JLS#1700](https://github.com/eclipse/eclipse.jdt.ls/pull/1700).
 * debt - Build Fails Due to Tests. See [JLS#1646](https://github.com/eclipse/eclipse.jdt.ls/issues/1646).
 * debt - Stop generating .gz artifacts during builds. See [JLS#1707](https://github.com/eclipse/eclipse.jdt.ls/issues/1707).
 * debt - Java LS Tests fail randomly. See [JLS#1684](https://github.com/eclipse/eclipse.jdt.ls/issues/1684).
 * debt - Fix vulnerabilities by 'npm audit fix'. See [#1830](https://github.com/redhat-developer/vscode-java/pull/1830).
 * other - Set org.eclipse.jdt.core.compiler.problem.missingSerialVersion to ignore by default. See [JLS#1714](https://github.com/eclipse/eclipse.jdt.ls/issues/1714).

## 0.76.0 (March 5th, 2021)
 * feature - Code actions should return textedits with proper formatting. See [JLS#1157](https://github.com/eclipse/eclipse.jdt.ls/issues/1157).
 * bug fix - Surround with try/catch reformats document. See [#1572](https://github.com/redhat-developer/vscode-java/issues/1572).
 * bug fix - Change location of .m2/ and .tooling/ from HOME. See [JLS#1654](https://github.com/eclipse/eclipse.jdt.ls/issues/1654).
 * bug fix - Issue with 'Go To Definition'. See [JLS#1634](https://github.com/eclipse/eclipse.jdt.ls/issues/1634).
 * bug fix - search for enum reference without source. See [#1665](https://github.com/redhat-developer/vscode-java/issues/1665).
 * other - Configure whether to show recommendations of external installations. See [#1816](https://github.com/redhat-developer/vscode-java/issues/1816).
 * other - Adopt the helpers from jdt.core.manipulation to deal with the CU's preferences. See [JLS#1666](https://github.com/eclipse/eclipse.jdt.ls/pull/1666).
 * debt - Upgrade infrastructure to support GLIBCXX 3.4.21. See [#1817](https://github.com/redhat-developer/vscode-java/pull/1817).
 * debt - Tests fail on Windows. See [JLS#996](https://github.com/eclipse/eclipse.jdt.ls/issues/996).

## 0.75.0 (February 11th, 2021)
 * enhancement - Specify output path for invisible project. See [#1694](https://github.com/redhat-developer/vscode-java/pull/1694).
 * enhancement - Recommend dependency analytics extension. See [#1771](https://github.com/redhat-developer/vscode-java/pull/1771).
 * bug fix - @link highlighting broken when linking to class. See [#1753](https://github.com/redhat-developer/vscode-java/issues/1753).
 * other - Remove legacy Semantic Highlighting implementation. See [JLS#1649](https://github.com/eclipse/eclipse.jdt.ls/pull/1649).
 * other - Make redhat.fabric8-analytics recommendation more compelling. See [#1788](https://github.com/redhat-developer/vscode-java/pull/1788).
 * other - use lightweight mode by default when vscode is running from web browsers. See [#1780](https://github.com/redhat-developer/vscode-java/pull/1780).
 * other - always exclude project settings files by default. See [#1779](https://github.com/redhat-developer/vscode-java/pull/1779).
 * other - Declare semantic token modifiers. See [#1760](https://github.com/redhat-developer/vscode-java/pull/1760).
 * other - semantic tokens: use 'method' instead of 'member'. See [#1713](https://github.com/redhat-developer/vscode-java/issues/1713).

## 0.74.0 (January 20th, 2021)
 * enhancement - Download sources for classes in jars with maven coordinates. See [#1664](https://github.com/redhat-developer/vscode-java/issues/1664).
 * bug fix - Some refactors are missing when the location has diagnostics. See [JLS#1642](https://github.com/eclipse/eclipse.jdt.ls/issues/1642).
 * bug fix - Should not enable preview compiler options if the tooling doesn't support the early access JDK. See [JLS#1644](https://github.com/eclipse/eclipse.jdt.ls/issues/1644).
 * bug fix - Importing projects should follow "java.import.exclusions" setting to stop scanning the specified directories. See [#1698](https://github.com/redhat-developer/vscode-java/issues/1698).
 * build - Update target platform to use Eclipse 2020-12 Release. See [JLS#1639](https://github.com/eclipse/eclipse.jdt.ls/pull/1639).
 * build - Fix some dependency vulnerabilities. See [#1772](https://github.com/redhat-developer/vscode-java/pull/1772).

## 0.73.0 (December 17th, 2020)
 * bug fix - Open a Java file from unmanaged folder, the status bar didn't show language level info. See [#1735](https://github.com/redhat-developer/vscode-java/issues/1735).
 * bug fix - Long completionItem/resolve and TimeoutException. See [JLS#1624](https://github.com/eclipse/eclipse.jdt.ls/issues/1624).
 * bug fix - Add support to INFO log level. See [JLS#1623](https://github.com/eclipse/eclipse.jdt.ls/pull/1623).
 * bug fix - Filter 'sun' packages out of completion type results. See [#1731](https://github.com/redhat-developer/vscode-java/pull/1731).
 * bug fix - Dependencies weren't recognized after being added in gradle project. See [#1714](https://github.com/redhat-developer/vscode-java/issues/1714).
 * bug fix - Detect Gradle project by settings.gradle as well. See [#1528](https://github.com/redhat-developer/vscode-java/issues/1528).

## 0.72.0 (December 2nd, 2020)
 * enhancement - Support inferSelection when extract to variable. See [#1717](https://github.com/redhat-developer/vscode-java/pull/1717).
 * enhancement - Support inferSelection when extract to field. See [#1721](https://github.com/redhat-developer/vscode-java/pull/1721).
 * bug fix - jdt.ls distro is 10MB heavier because of com.ibm.icu_64.2.0.v20190507-1337.jar. See [JLS#1351](https://github.com/eclipse/eclipse.jdt.ls/issues/1351).
 * bug fix - Java LS crashes on WSL Alpine. See [#1711](https://github.com/redhat-developer/vscode-java/issues/1711).
 * bug fix - End of File exception when opening completion in empty file. See [JLS#1611](https://github.com/eclipse/eclipse.jdt.ls/issues/1611).
 * other - Update Target Platform to use Eclipse 2020-12 M3. See [JLS#1616](https://github.com/eclipse/eclipse.jdt.ls/pull/1616).
 * other - Improve the performance of inferSelection. See [JLS#1609](https://github.com/eclipse/eclipse.jdt.ls/pull/1609).
 * other - Allow creation of `abstract class` and `@interface` from "New Java Class" command. See [#1722](https://github.com/redhat-developer/vscode-java/issues/1722).
 * other - Spelling error: Update project configuration. See [#1649](https://github.com/redhat-developer/vscode-java/issues/1649).

## 0.71.0 (November 19th, 2020)
 * bug fix - Quarkus: generated sources are not accessible. See [#1675](https://github.com/redhat-developer/vscode-java/issues/1675)
 * bug fix - Error in every java file after updating to macOS Big Sur. See [#1700](https://github.com/redhat-developer/vscode-java/issues/1700).
 * bug fix - Fix jdk detection: cover symlink folder on Linux. See [#1704](https://github.com/redhat-developer/vscode-java/pull/1704).
 * bug fix - Fix jdk detection: cover common JDK installation places on Linux. See [#1706](https://github.com/redhat-developer/vscode-java/pull/1706).
 * other - Improve tracing capability of m2e through m2e.logback.configuration. See [JLS#1589](https://github.com/eclipse/eclipse.jdt.ls/pull/1589).
 * other - Infer expressions if there is no selection range when extracting method. See [#1680](https://github.com/redhat-developer/vscode-java/pull/1680).

## 0.70.0 (November 4th, 2020)
 * enhancement - Hide inline variable/constant commands when no reference found. See [JLS#1573](https://github.com/eclipse/eclipse.jdt.ls/pull/1573) and [JLS#1575](https://github.com/eclipse/eclipse.jdt.ls/pull/1575).
 * enhancement - Convert a lambda expression to method reference. See [#1448](https://github.com/redhat-developer/vscode-java/issues/1448).
 * enhancement - Provide method for converting callstack entry to location. See [JLS#1202](https://github.com/eclipse/eclipse.jdt.ls/issues/1202).
 * enhancement - Change scope of 'java.home' to machine-overridable. See [#1676](https://github.com/redhat-developer/vscode-java/pull/1676).
 * enhancement - Declare semantic token type for modifier keywords. See [#1636](https://github.com/redhat-developer/vscode-java/pull/1636).
 * enhancement - Add the java.configuration.maven.globalSettings property. See [#1365](https://github.com/redhat-developer/vscode-java/issues/1365).
 * bug fix - GTD is not working if referenced library is updated without file name change. See [JLS#1577](https://github.com/eclipse/eclipse.jdt.ls/issues/1577).
 * bug fix - Changing java.semanticHighlighting.enabled does not consistently update semantic tokens. See [JLS#1678](https://github.com/redhat-developer/vscode-java/issues/1678).
 * bug fix - Method references are given the CompletionItemKind.Module type by the completion provider. See [#1661](https://github.com/redhat-developer/vscode-java/issues/1661).
 * other - Update Target Platform to Eclipse 2020-12 M1. See [JLS#1567](https://github.com/eclipse/eclipse.jdt.ls/issues/1567).
 * other - Pass the cancellationtoken to the client request registered by provider. See [#1668](https://github.com/redhat-developer/vscode-java/pull/1668).

## 0.69.0 (October 15th, 2020)
 * enhancement - Embed m2e 1.17. See [JLS#1562](https://github.com/eclipse/eclipse.jdt.ls/pull/1562).
 * enhancement - Add code actions to add sealed/final/non-sealed modifier on a permitted type declaration. See [JLS#1555](https://github.com/eclipse/eclipse.jdt.ls/issues/1555).
 * enhancement - Created type doesn't implement sealed interface. See [JLS#1553](https://github.com/eclipse/eclipse.jdt.ls/issues/1553).
 * enhancement - Improve semantic token modifiers. See [JLS#1539](https://github.com/eclipse/eclipse.jdt.ls/pull/1539).
 * enhancement - Find references to fields via getters/setters. See [#1646](https://github.com/redhat-developer/vscode-java/pull/1646).
 * bug fix - StringIndexOutOfBoundsException while computing hover and folding range. See [#1644](https://github.com/redhat-developer/vscode-java/issues/1644).

## 0.68.0 (September 30th, 2020)
 * enhancement - JavaFX application produce warning. See [#120](https://github.com/redhat-developer/vscode-java/issues/120).
 * enhancement - Add support for JDK 15. See [#1627](https://github.com/redhat-developer/vscode-java/issues/1627).
 * enhancement - Embed latest Java textmate grammar. See [#1637](https://github.com/redhat-developer/vscode-java/issues/1637).
 * enhancement - Change the code action kind 'Change modifiers to final where possible' to Source Action. See [#1617](https://github.com/redhat-developer/vscode-java/issues/1617).
 * enhancement - `java.configuration.runtimes` option configuration error will not prompt an error. See [#1614](https://github.com/redhat-developer/vscode-java/issues/1614).
 * enhancement - [Feature Request] Provide more code action options on save. See [#1379](https://github.com/redhat-developer/vscode-java/issues/1379).
 * bug fix - Since July update cause java highlight break. See [#1597](https://github.com/redhat-developer/vscode-java/issues/1597).
 * bug fix - Corner case in parsing major version of JDK. See [#1331](https://github.com/redhat-developer/vscode-java/issues/1331).

## 0.67.0 (September 16th, 2020)
 * enhancement - Importing mixed (maven,gradle,eclipse) projects. See [#1344](https://github.com/redhat-developer/vscode-java/issues/1344).
 * enhancement - Better expose the "Anonymous to nested class" refactoring. See [JLS#1541](https://github.com/eclipse/eclipse.jdt.ls/pull/1541).
 * enhancement - [feature request] allow `var` to be fully specified with using 'Show Fixes'. See [#1573](https://github.com/redhat-developer/vscode-java/issues/1573).
 * enhancement - Allow devs to override default snippets. See [#1470](https://github.com/redhat-developer/vscode-java/issues/1470).
 * bug fix - autocompletion on inherited interface method inserts wrong code. See [#1593](https://github.com/redhat-developer/vscode-java/issues/1593).
 * bug fix - Filename extension is .class when saving Untitled file to Java. See [#1618](https://github.com/redhat-developer/vscode-java/issues/1618).
 * build - Update TP to use Eclipse 2020-09 RC2. See [JLS#1546](https://github.com/eclipse/eclipse.jdt.ls/pull/1546).

## 0.66.0 (September 1st, 2020)
 * enhancement - new `java.import.resourceFilter` preference to filter folders when refreshing workspace. See [#1460](https://github.com/redhat-developer/vscode-java/issues/1460).
 * enhancement - enabled semantic highlighting by default. See [#1584](https://github.com/redhat-developer/vscode-java/pull/1584).
 * enhancement - Show a more detailed message about Java 11 requirement. See [#1602](https://github.com/redhat-developer/vscode-java/pull/1602).
 * enhancement - Support CancellationToken when calling LSP workspaceCommand. See [#1591](https://github.com/redhat-developer/vscode-java/pull/1591).
 * enhancement - Updated to Eclipse 2020-09-M3. See [JLS#1534](https://github.com/eclipse/eclipse.jdt.ls/pull/1534).
 * enhancement - Added `,` as signature trigger char. See [JLS#1522](https://github.com/eclipse/eclipse.jdt.ls/pull/1522).
 * enhancement - Fixed newline in snippet for new Java files. See [#1564](https://github.com/redhat-developer/vscode-java/issues/1564).
 * performance - faster source action resolution. See [JLS#1533](https://github.com/eclipse/eclipse.jdt.ls/pull/1533).
 * typo - fixed typo in notification message. See [#1570](https://github.com/redhat-developer/vscode-java/pull/1570).
 * typo - fixed Punctuation in import message. See [#1599](https://github.com/redhat-developer/vscode-java/pull/1599).
 * bug fix - Document 'Hybrid' serverMode value in api. See [#1586](https://github.com/redhat-developer/vscode-java/pull/1586).
 * bug fix - Duplicate snippets displayed in lightweight mode. See [#1579](https://github.com/redhat-developer/vscode-java/issues/1579).
 * bug fix - Incorrect semantic tokens for some wildcard import statements. See [#1545](https://github.com/redhat-developer/vscode-java/issues/1545).
 * documentation - Remove mention of java.requirements.JDK11Warning from README. See [#1603](https://github.com/redhat-developer/vscode-java/pull/1603).
 * build - Add test case for rename file. See [#1574](https://github.com/redhat-developer/vscode-java/pull/1574).
 * build - Fixed some vulnerable dependencies. See [#1576](https://github.com/redhat-developer/vscode-java/pull/1576).
 * build - Bump elliptic from 6.4.1 to 6.5.3. See [#1554](https://github.com/redhat-developer/vscode-java/pull/1554).

## 0.65.0 (July 22nd, 2020)
 * enhancement - **Require Java 11 to run the extension**. See [#1524](https://github.com/redhat-developer/vscode-java/pull/1524).
 * enhancement - Expose the `java.import.gradle.java.home` preference. See [#1536](https://github.com/redhat-developer/vscode-java/issues/1536) & [JLS#1512](https://github.com/eclipse/eclipse.jdt.ls/pull/1512).
 * enhancement - Add semantic tokens to class files. See [#1538](https://github.com/redhat-developer/vscode-java/issues/1538).
 * enhancement - Adjust the Gradle settings scope to enhance security. See [#1535](https://github.com/redhat-developer/vscode-java/pull/1535).
 * enhancement - Tune the user settings about specifying gradle distribution. See [#1534](https://github.com/redhat-developer/vscode-java/pull/1534).
 * enhancement - Prevent tab key appending asterisk for import autocompletion. See [#1532](https://github.com/redhat-developer/vscode-java/issues/1532).
 * enhancement - Do not show hint when standard server is already activated. See [#1522](https://github.com/redhat-developer/vscode-java/pull/1522).
 * enhancement - Add `Introduce Parameter...` code action. See [#1521](https://github.com/redhat-developer/vscode-java/pull/1521).
 * enhancement - Semantic highlighting improvements. See [#1488](https://github.com/redhat-developer/vscode-java/issues/1488).
 * enhancement - Add Go to Super Implementation to context menu and command palette. See [#1395](https://github.com/redhat-developer/vscode-java/pull/1395).
 * enhancement - Support refactoring documentation. See [#1334](https://github.com/redhat-developer/vscode-java/pull/1334).
 * bug fix - NPE in CodeActionHandler.getProblemId L.221. See [JLS#1502](https://github.com/eclipse/eclipse.jdt.ls/issues/1502).
 * bug fix - fixed Rename from File Explorer. See [#1517](https://github.com/redhat-developer/vscode-java/issues/1517).
 * bug fix - Incorrect semantic highlighting for complex constructor invocations. See [#1514](https://github.com/redhat-developer/vscode-java/issues/1514).
 * build - Bump lodash from 4.17.15 to 4.17.19. See [#1525](https://github.com/redhat-developer/vscode-java/pull/1525).

## 0.64.1 (July 8th, 2020)
* bug fix - No response when clicking 'Always' on import. See [#1513](https://github.com/redhat-developer/vscode-java/pull/1513).

## 0.64.0 (July 7th, 2020)
 * enhancement - Give more information in the language level status bar item. See [#1508](https://github.com/redhat-developer/vscode-java/pull/1508).
 * enhancement - Register the semantic token provider after standard server is ready. See [#1505](https://github.com/redhat-developer/vscode-java/pull/1505).
 * enhancement - Use java:serverMode to avoid conflicts. See [#1504](https://github.com/redhat-developer/vscode-java/pull/1504).
 * enhancement - delay resolution of additional text edits. See [#1503](https://github.com/redhat-developer/vscode-java/pull/1503).
 * enhancement - Ask users to import projects when opening a new folder. See [#1501](https://github.com/redhat-developer/vscode-java/pull/1501).
 * enhancement - Improve Java LS shutdown. See [JLS#1495](https://github.com/eclipse/eclipse.jdt.ls/pull/1495).
 * enhancement - Update Buildship to 3.1.5. See [JLS#1494](https://github.com/eclipse/eclipse.jdt.ls/pull/1494).
 * bug fix - Unprocessed markdown in settings. See [#1498](https://github.com/redhat-developer/vscode-java/issues/1498).
 * bug fix - Gradle 6.4 wrapper incorrectly marked as potentially malicious. See [#1492](https://github.com/redhat-developer/vscode-java/issues/1492).
 * bug fix - Prepare rename breaks if you have edited the symbol just before the call. See [JLS#1483](https://github.com/eclipse/eclipse.jdt.ls/issues/1483).
 * debt - Decouple the status bar item from each language client to a centralized one. See [#1506](https://github.com/redhat-developer/vscode-java/issues/1506).
 * build - npm audit fix. See [#1496](https://github.com/redhat-developer/vscode-java/pull/1496).

## 0.63.0 (June 18th, 2020)
 * enhancement - Avoid unnecessary Gradle re-synch on restart. See [JLS#1485](https://github.com/eclipse/eclipse.jdt.ls/pull/1485).
 * enhancement - Optimize default VM management to avoid unnecessary project updates. See [JLS#1484](https://github.com/eclipse/eclipse.jdt.ls/pull/1484).
 * enhancement - Update to Eclipse 4.16. See [JLS#1478](https://github.com/eclipse/eclipse.jdt.ls/pull/1478).
 * enhancement - Support annotations in semantic highlighting. See [JLS#1477](https://github.com/eclipse/eclipse.jdt.ls/pull/1477).
 * enhancement - Wait for jobs to complete when resolving the classpaths. See [JLS#1476](https://github.com/eclipse/eclipse.jdt.ls/pull/1476).
 * enhancement - Java runtimes should be configured before projects are imported. See [JLS#1474](https://github.com/eclipse/eclipse.jdt.ls/issues/1474).
 * enhancement - Export the public APIs in light weight mode. See [#1480](https://github.com/redhat-developer/vscode-java/issues/1480).
 * enhancement - Enable code completion for syntax server. See [#1463](https://github.com/eclipse/eclipse.jdt.ls/pull/1463).
 * enhancement - IBuildSupport extension point. See [JLS#1455](https://github.com/eclipse/eclipse.jdt.ls/pull/1455).
 * enhancement - Show VM install location on hover. See [#1464](https://github.com/redhat-developer/vscode-java/pull/1464).
 * bug fix - Fix NPE in BaseDocumentLifeCycleHandler.publishDiagnostics. See [#1473](https://github.com/eclipse/eclipse.jdt.ls/pull/1473).
 * bug fix - Organize import on save should not select ambiguous static import. See [#1459](https://github.com/eclipse/eclipse.jdt.ls/pull/1459).
 * bug fix - Link in javadoc causes an error. See [#1437](https://github.com/redhat-developer/vscode-java/issues/1437).
 * build - Improve 'launching from source' detection. See [#1473](https://github.com/redhat-developer/vscode-java/pull/1473).
 * build - Fix debug mode detection. See [#1467](https://github.com/redhat-developer/vscode-java/pull/1467).
 * build - Ignore /node_modules/ when webpack is watching sources. See [#1487](https://github.com/redhat-developer/vscode-java/pull/1487).

## 0.62.0 (May 21th, 2020)
 * enhancement - Expose import projects command. See [#746](https://github.com/redhat-developer/vscode-java/pull/746).
 * enhancement - Refactor package name. See [#823](https://github.com/redhat-developer/vscode-java/issues/823).
 * enhancement - Provide goToDefinition API . See [#1416](https://github.com/redhat-developer/vscode-java/issues/1416).
 * enhancement - Use default JVM when importing gradle project. See [#1426](https://github.com/redhat-developer/vscode-java/issues/1426).
 * enhancement - Show Java source level in the status bar. See [#1457](https://github.com/redhat-developer/vscode-java/pull/1457).
 * enhancement - Check for suspicious gradle-wrapper.jar
. See [#1440](https://github.com/redhat-developer/vscode-java/pull/1440).
 * bug fix - Highlighting is incorrect after imports are automatically inserted. See [#1423](https://github.com/redhat-developer/vscode-java/issues/1423).
 * bug fix - Get and Set method generation through intellicode generates javadoc when shouldn't. See [#1411](https://github.com/redhat-developer/vscode-java/issues/1411).
 * bug fix - Semantic highlighting doesn't like java.* packages. See [#1434](https://github.com/redhat-developer/vscode-java/issues/1434).
 * bug fix - Discard the stale workingcopies that belonged to the deleted folder. See [JLS#1439](https://github.com/eclipse/eclipse.jdt.ls/pull/1439).

## 0.61.0 (April 30th, 2020)

 * enhancement - organize imports should resolve static imports as well. See [#1386](https://github.com/redhat-developer/vscode-java/issues/1386).
 * enhancement - prompt to enable semantic hightlighting on startup. See [#1419](https://github.com/redhat-developer/vscode-java/pull/1419).
 * enhancement - refine semantic highlighting. See [JLS#1416](https://github.com/eclipse/eclipse.jdt.ls/pull/1416).
 * bug fix - code folding is buggy. See [#1419](https://github.com/eclipse/eclipse.jdt.ls/issues/1419).
 * bug fix - New File -> (module|package)-info.java should be handled properly. See [#1405](https://github.com/redhat-developer/vscode-java/issues/1405).
 * bug fix - semantic highlighting sometimes looks bad. See [#1396](https://github.com/redhat-developer/vscode-java/issues/1396).
 * bug fix - custom color for arguments used in method body. See [#1277](https://github.com/redhat-developer/vscode-java/issues/1277).
 * bug fix - missing highlight on some non-ASCII identifiers. See [#826](https://github.com/redhat-developer/vscode-java/issues/826).
 * bug fix - syntax highlighting is broken with array syntax. See [#728](https://github.com/redhat-developer/vscode-java/issues/728).
 * bug fix - highlighting is wrong. See [#707](https://github.com/redhat-developer/vscode-java/issues/707).
 * bug fix - syntax highlighting broken on import containing upper cased letters. See [#351](https://github.com/redhat-developer/vscode-java/issues/351).
 * bug fix - syntax highlighting is not working with comment. See [#338](https://github.com/redhat-developer/vscode-java/issues/338).
 * bug fix - syntax highlighting is not working on special named classes. See [#299](https://github.com/redhat-developer/vscode-java/issues/299).

## 0.60.0 (April 16th, 2020)
 * enhancement - support semantic tokens. See [#1393](https://github.com/redhat-developer/vscode-java/pull/1393).
 * enhancement - preview the updates before applying the changes caused by file rename. See [#1375](https://github.com/redhat-developer/vscode-java/pull/1375).
 * enhancement - display a warning about the impending requirement of Java 11 to run the extension. See [#1366](https://github.com/redhat-developer/vscode-java/issues/1366).
 * enhancement - organize imports with the asterisk (*) wildcard character. See [#964](https://github.com/redhat-developer/vscode-java/issues/964).
 * enhancement - update class name and references when renaming a Java file. See [#1372](https://github.com/redhat-developer/vscode-java/pull/1372).
 * enhancement - add "Generate constructor" option in "Show Fixes" options for fields. See [#1358](https://github.com/redhat-developer/vscode-java/issues/1358).
 * enhancement - make syntax server support hovering over a type. See [JLS#1403](https://github.com/eclipse/eclipse.jdt.ls/pull/1403).
 * bug fix - workspace/notify notification creates no vscode command as expected. See [#1367](https://github.com/redhat-developer/vscode-java/issues/1367).
 * bug fix - fix checkJavaVersion for Windows. See [#1360](https://github.com/redhat-developer/vscode-java/pull/1360).
 * bug fix - extracted element can not be renamed. See [#1391](https://github.com/redhat-developer/vscode-java/issues/1391).

## 0.59.1 (April 3rd, 2020)
* enhancement - sort formatter settings. See [#1359](https://github.com/redhat-developer/vscode-java/pull/1359).
* bug fix - fixed failure to start 0.59 in theia 1.0.0/dev - onDidCreateFiles is not a function in workspace. See [#1363](https://github.com/redhat-developer/vscode-java/issues/1363).

## 0.59.0 (April 1st, 2020)
 * enhancement - Enable Java 14 support. See [#1300](https://github.com/redhat-developer/vscode-java/pull/1300).
 * enhancement - Support for JDK 14 for Gradle projects. See [#1338](https://github.com/redhat-developer/vscode-java/issues/1338).
 * enhancement - Provide `record` snippet. See [JLS#1393](https://github.com/eclipse/eclipse.jdt.ls/issues/1393).
 * enhancement - No Javadoc completion for records. See [JLS#1396](https://github.com/eclipse/eclipse.jdt.ls/issues/1396).
 * enhancement - Fill in content for newly created files. See [#1222](https://github.com/redhat-developer/vscode-java/issues/1222).
 * enhancement - new `java.server.launchMode` to control whether to enable a syntax language server. See [#1329](https://github.com/redhat-developer/vscode-java/pull/1329).
 * enhancement - j.i.gradle.arguments and j.i.gradle.jvmArguments aren't properly defined. See [JLS#1387](https://github.com/eclipse/eclipse.jdt.ls/pull/1387).
 * enhancement - enable syntax mode when importing a partial folder of maven/gradle project. See [JLS#1364](https://github.com/eclipse/eclipse.jdt.ls/pull/1364).
 * enhancement - Add `java.import.gradle.user.home` preference for setting `GRADLE_USER_HOME`. See [#1310](https://github.com/redhat-developer/vscode-java/issues/1310).
 * bug fix - root path in the preference manager won't update when workspace folder changes. See [JLS#1388](https://github.com/eclipse/eclipse.jdt.ls/issues/1388).
 * bug fix - BadLocationException and diagnostic with negative line number send to client. See [JLS#1374](https://github.com/eclipse/eclipse.jdt.ls/issues/1374).

## 0.58.0 (March 5th, 2020)
* enhancement - improved support for "standalone file" use cases. See [#1270](https://github.com/redhat-developer/vscode-java/issues/1270).
* enhancement - parallel downloads of jars, for Maven projects. See [JLS#1369](https://github.com/eclipse/eclipse.jdt.ls/pull/1369).
* enhancement - allow renaming of lambda parameters. See [#1298](https://github.com/redhat-developer/vscode-java/issues/1298).
* enhancement - build workspace action can report progress to client. See [JLS#1368](https://github.com/eclipse/eclipse.jdt.ls/pull/1368).
* enhancement - VS Code Java cannot run from read-only location. See [#1301](https://github.com/redhat-developer/vscode-java/issues/1301).
* enhancement - optimize for better memory footprint management. See [#1262](https://github.com/redhat-developer/vscode-java/pull/1262)
* bug fix - fixed error on cancelling source actions. See [#1292](https://github.com/redhat-developer/vscode-java/pull/1292).

## 0.57.0 (February 19th, 2020)
* bug fix - fixed Gradle project failing to build while fetching non-existing snapshot distro. See [#1285](https://github.com/redhat-developer/vscode-java/issues/1285).
* bug fix - fixed Java suggestion details missing in some circumstances. See [#1258](https://github.com/redhat-developer/vscode-java/issues/1258).

## 0.56.0 (February 17th, 2020)
* enhancement - added `java.import.gradle.offline.enabled` preference. See [#1157](https://github.com/redhat-developer/vscode-java/issues/1157).
* enhancement - added `java.configuration.runtimes` preference for mapping Java Execution Environments to local JDK runtimes. See [#1207](https://github.com/redhat-developer/vscode-java/pull/1207).
* enhancement - align settings category name with VS Code recommendations. See [#1227](https://github.com/redhat-developer/vscode-java/issues/1227).
* enhancement - added code actions to assign statement to new variable/field. See [#1208](https://github.com/redhat-developer/vscode-java/issues/1208).
* enhancement - added code action to remove redundant interfaces. See [JLS#438](https://github.com/eclipse/eclipse.jdt.ls/issues/438).
* enhancement - added code actions to remove the `final` modifier. See [JLS#441](https://github.com/eclipse/eclipse.jdt.ls/issues/441).
* enhancement - added code action to add missing case labels in switch statements. See [JLS#1140](https://github.com/eclipse/eclipse.jdt.ls/issues/1140).
* bug fix - fixed duplicate labels in progress reports. See [#1230](https://github.com/redhat-developer/vscode-java/issues/1230).
* bug fix - don't set the -noverify flag if JDK >= 13. See [#1250](https://github.com/redhat-developer/vscode-java/pull/1250).
* bug fix - fixed Intellisense not working when attached javadoc can't be read. See [JLS#1314](https://github.com/eclipse/eclipse.jdt.ls/pull/1314).
* bug fix - added default value to `java.project.referencedLibraries`'s exclude and sources. See [JLS#1315](https://github.com/eclipse/eclipse.jdt.ls/pull/1315).

## 0.55.1 (December 23rd, 2019)
* bug fix - fixed code completion broken with IntelliCode. See [#1213](https://github.com/redhat-developer/vscode-java/issues/1213).

## 0.55.0 (December 23rd, 2019)
* enhancement - added support for Call Hierarchy. See [#650](https://github.com/redhat-developer/vscode-java/issues/650).
* enhancement - add jars to classpath via new `java.project.referencedLibraries` preference. See [#1196](https://github.com/redhat-developer/vscode-java/pull/1196).
* enhancement - completion results are now limited via `java.completion.maxResults` preference. See [JLS#1298](https://github.com/eclipse/eclipse.jdt.ls/pull/1298).
* enhancement - Remove duplicate call of getRawLocationURI(). See [JLS#1299](https://github.com/eclipse/eclipse.jdt.ls/pull/1299).
* bug fixed - fixed Java Overview breaking the import of invisible projects. See [#1198](https://github.com/redhat-developer/vscode-java/issues/1198).
* bug fixed - fixed build status reporter in multi-root workspaces. See [#1180](https://github.com/redhat-developer/vscode-java/issues/1180).
* bug fixed - fixed incorrect signatures returned by signatureHelp. See [JLS#1290](https://github.com/eclipse/eclipse.jdt.ls/issues/1290).
* bug fixed - fixed broken signatureHelp when previous string parameter has `(` or `{`. See [JLS#1293](https://github.com/eclipse/eclipse.jdt.ls/issues/1293).
* debt - relicensed project to EPL-v2.0. See [commit](https://github.com/redhat-developer/vscode-java/commit/9b0032feb75d07f46231391ae3bf11f53e152a24).


## 0.54.2 (December 5th, 2019)
* bug fix - add `java.showBuildStatusOnStart.enabled` setting for revealing build status on startup. See [#1181](https://github.com/redhat-developer/vscode-java/issues/1181).

## 0.54.1 (December 4th, 2019)
* bug fix - fixed ignored global `java.jdt.ls.vmargs` setting (broke lombok support). See [#1175](https://github.com/redhat-developer/vscode-java/issues/1175).

## 0.54.0 (December 4th, 2019)
* enhancement - new `java.maven.updateSnapshots` preference to update snapshots/releases for Maven projects. See [#1102](https://github.com/redhat-developer/vscode-java/issues/1102).
* enhancement - jump to definition on break/continue. See [#1145](https://github.com/redhat-developer/vscode-java/issues/1145).
* enhancement - added getDocumentSymbols call to extension API. See [#1151](https://github.com/redhat-developer/vscode-java/pull/1151).
* enhancement - show server tasks in terminal. See [#1153](https://github.com/redhat-developer/vscode-java/pull/1153).
* enhancement - show busy status when there are incomplete tasks. See [#1159](https://github.com/redhat-developer/vscode-java/pull/1159).
* enhancement - always show workspace status in status bar. See [#1163](https://github.com/redhat-developer/vscode-java/pull/1163).
* enhancement - add quickfix to correct access to static elements. See [JLS#439](https://github.com/eclipse/eclipse.jdt.ls/issues/439).
* enhancement - sort code actions by relevance. See [JLS#1250](https://github.com/eclipse/eclipse.jdt.ls/issues/1250).
* enhancement - no need to publish diagnostics in BuildWorkspaceHandler. See [JLS#1282](https://github.com/eclipse/eclipse.jdt.ls/pull/1282).
* bug fix - warn about sensible java preferences in project settings. See [#1154](https://github.com/redhat-developer/vscode-java/issues/1154) and [#1160](https://github.com/redhat-developer/vscode-java/pull/1160).
* bug fix - update problems when changing the name of the package folder. See [#1283](https://github.com/redhat-developer/vscode-java/issues/1152).

## 0.53.1 (November 15th, 2019)
* bug fix - fixed "Organize Imports" shortcut no longer working. See [#1142](https://github.com/redhat-developer/vscode-java/issues/1142).

## 0.53.0 (November 14th, 2019)
* enhancement - code action: add 'final' modifier where possible. See [#774](https://github.com/redhat-developer/vscode-java/issues/774).
* enhancement - update m2e to 1.14 (embeds Maven 3.6.2). See [#1103](https://github.com/redhat-developer/vscode-java/issues/1103).
* enhancement - code action: remove unnecessary cast. See [JLS#165](https://github.com/eclipse/eclipse.jdt.ls/issues/165).
* enhancement - provide better symbol details on hover. See [JLS#1227](https://github.com/eclipse/eclipse.jdt.ls/issues/1227).
* enhancement - code action: improve "Invert Condition" refactoring trigger. See [JLS#1230](https://github.com/eclipse/eclipse.jdt.ls/issues/1230).
* enhancement - refresh the extension bundles after uninstalling. See [JLS#1253](https://github.com/eclipse/eclipse.jdt.ls/pull/1253).
* bug fixed - fixed Maven import failure caused by m2e-apt unable to parse maven-compiler-plugin configuration. See [#1131](https://github.com/redhat-developer/vscode-java/issues/1131).
* bug fixed - add Java 13 support for Gradle projects. See [JLS#1196](https://github.com/eclipse/eclipse.jdt.ls/issues/1196).
* bug fixed - fixed errors reported from unrelated gradle projects outside the workspace. See [JLS#1261](https://github.com/eclipse/eclipse.jdt.ls/issues/1261).

## 0.52.0 (October 23rd, 2019)
* enhancement - define schema for `contribute/javaExtensions` in package.json. See [#1114](https://github.com/redhat-developer/vscode-java/pull/1114).
* enhancement - add text selection support in code snippet. see [JLS#1222](https://github.com/eclipse/eclipse.jdt.ls/pull/1222).
* enhancement - unused imports displayed as faded. See [JLS#1219](https://github.com/eclipse/eclipse.jdt.ls/issues/1219).
* bug fix - fixed pasting with multi-cursor. See [#1112](https://github.com/redhat-developer/vscode-java/issues/1112).
* bug fix - organize imports on paste moved to a specific command (`ctrl+shift+v` - `cmd+shift+v` on Mac). Removed `java.actionsOnPaste.organizeImports` preference. See [#1115](https://github.com/redhat-developer/vscode-java/issues/1115).
* documentation - fixed broken link in CONTRIBUTING.md. See [#1105](https://github.com/redhat-developer/vscode-java/pull/1105)

## 0.51.0 (October 16th, 2019)
* enhancement - [experimental] automatically trigger auto-import on paste. Can be disabled with `java.actionsOnPaste.organizeImports`. See [#1075](https://github.com/redhat-developer/vscode-java/issues/1075) and [#1098](https://github.com/redhat-developer/vscode-java/issues/1098).
* enhancement - allow negative patterns in `java.import.exclusions` preference, to allow folder inclusions. See [#1084](https://github.com/redhat-developer/vscode-java/issues/1084).
* enhancement - made code snippets context sensitive. See [JLS#977](https://github.com/eclipse/eclipse.jdt.ls/issues/977).
* enhancement - improve snippet documentation rendering. See [JLS#1205](https://github.com/eclipse/eclipse.jdt.ls/issues/1205).
* bug fix - fixed preview features enabled at an invalid source release level 12, preview can be enabled only at source level 13. See [#1086](https://github.com/redhat-developer/vscode-java/issues/1086).
* bug fix - don't return workspace symbols without a name. See [JLS#1204](https://github.com/eclipse/eclipse.jdt.ls/issues/1204).
* bug fix - fixed package fragments not updated when adding a new folder. See [JLS#1137](https://github.com/eclipse/eclipse.jdt.ls/issues/1137).
* bug fix - don't filter method completions from filtered types. See [JLS#1212](https://github.com/eclipse/eclipse.jdt.ls/issues/1212).

## 0.50.0 (October 1st, 2019)
* enhancement - added Java 13 support for Maven and Eclipse projects. See [JLS#1179](https://github.com/eclipse/eclipse.jdt.ls/issues/1179).
* enhancement - added support for diagnostic tags. See [#1051](https://github.com/redhat-developer/vscode-java/pull/1051).
* enhancement - code-action: fixed methods with reduced visibility. See [JLS#442](https://github.com/eclipse/eclipse.jdt.ls/issues/442).
* enhancement - code-action: inline method/variable/field. See [JLS#656](https://github.com/eclipse/eclipse.jdt.ls/issues/656) and [JLS#771](https://github.com/eclipse/eclipse.jdt.ls/issues/771).
* enhancement - provide more granularity of progress during Maven import. See [JLS#1121](https://github.com/eclipse/eclipse.jdt.ls/issues/1121).
* enhancement - update Buildship to 3.1.2. See [JLS#1195](https://github.com/eclipse/eclipse.jdt.ls/pulls/1195).
* bug - fixed wrong range for `Surround with try/multi-catch` code action. See [JLS#1189](https://github.com/eclipse/eclipse.jdt.ls/issues/1189).

## 0.49.0 (September 18th, 2019)
* enhancement - navigate to the super implementation. See [#553](https://github.com/redhat-developer/vscode-java/issues/553).
* enhancement - exclude certain packages from autocomplete/autoimport. See [#710](https://github.com/redhat-developer/vscode-java/issues/710).
* enhancement - code action: create non existing package when package declaration mismatch. See [#1030](https://github.com/redhat-developer/vscode-java/issues/1030).
* enhancement - code action: convert anonymous class to nested class. See [#1060](https://github.com/redhat-developer/vscode-java/pull/1060).
* enhancement - code action: fix non accessible references. See [JLS#440](https://github.com/eclipse/eclipse.jdt.ls/issues/440).
* enhancement - code action: convert for-loop to for-each loop. See [JLS#1166](https://github.com/eclipse/eclipse.jdt.ls/issues/1166).
* enhancement - use `vscode.env.appName` instead of hardcoding `VS Code`. See [#1066](https://github.com/redhat-developer/vscode-java/issues/1066).
* bug fix - fixed tables not properly rendered on Javadoc hover. See [#1002](https://github.com/redhat-developer/vscode-java/issues/1002).
* bug fix - extract embedded javadoc images. See [#1007](https://github.com/redhat-developer/vscode-java/issues/1007).
* bug fix - fixed extension never reaching the ready state (always spin). See [#1056](https://github.com/redhat-developer/vscode-java/issues/1056).
* bug fix - fixed wrong completion text for AnonymousDeclarationType. See [JLS#1168](https://github.com/eclipse/eclipse.jdt.ls/issues/1168).
* bug fix - fixed "No delegateCommandHandler for 'xxx'" error. See [JLS#1146](https://github.com/eclipse/eclipse.jdt.ls/issues/1146).
* bug fix - load bundle only once if same bundle occurs multiple times in different locations. See [JLS#1174](https://github.com/eclipse/eclipse.jdt.ls/pull/1174).
* bug fix - fixed incorrect `prepareRename` response when called over import. See [JLS#1175](https://github.com/eclipse/eclipse.jdt.ls/issues/1175).
* documentation - update CONTRIBUTING.md with images for setting up server and remote debugging. See [#1037](https://github.com/redhat-developer/vscode-java/pull/1037).

## 0.48.0 (September 4th, 2019)
* enhancement - ignore "Unsupported SuppressWarning" warnings by default. See [#507](https://github.com/redhat-developer/vscode-java/issues/507).
* enhancement - code action to move member to another class. See [#980](https://github.com/redhat-developer/vscode-java/issues/980).
* enhancement - code action to move class to another package. See [#1017](https://github.com/redhat-developer/vscode-java/issues/1017).
* enhancement - code action to move inner types to new class. See [#1027](https://github.com/redhat-developer/vscode-java/pull/1027).
* enhancement - code action to 'Invert local variable'. See [#997](https://github.com/redhat-developer/vscode-java/pull/997).
* enhancement - show client & server logs side by side. See [#1016](https://github.com/redhat-developer/vscode-java/issues/1016).
* enhancement - rotate client logs daily. See [#989](https://github.com/redhat-developer/vscode-java/pull/989).
* enhancement - log language client failures. See [#1015](https://github.com/redhat-developer/vscode-java/pull/1015).
* enhancement - code action to create unresolved types. See [JLS#853](https://github.com/eclipse/eclipse.jdt.ls/issues/853).
* enhancement - properly render @ApiNote in javadoc. See [JLS#1069](https://github.com/eclipse/eclipse.jdt.ls/issues/1069).
* enhancement - code action to convert lambda to anonymous class. See [JLS#1119](https://github.com/eclipse/eclipse.jdt.ls/issues/1119).
* bug fix - fixed "Java runtime could not be located" for Windows + Oracle JDK. See [#836](https://github.com/redhat-developer/vscode-java/issues/836).
* bug fix - fixed go to implementation doesn't work for method invocation. See [#886](https://github.com/redhat-developer/vscode-java/issues/886).
* bug fix - fixed find implementation doesn't work on classes. See [JLS#1098](https://github.com/eclipse/eclipse.jdt.ls/issues/1098).
* bug fix - fixed NavigateToDefinitionHandler should not return null. See [JLS#1143](https://github.com/eclipse/eclipse.jdt.ls/pull/1143).
* bug fix - fixed secondary same-line error not reported. See [JLS#1147](https://github.com/eclipse/eclipse.jdt.ls/issues/1147).

## 0.47.0 (July 18th, 2019)
* enhancement - trigger client autorename after 'extract to variable/constant/method'. See [#333](https://github.com/redhat-developer/vscode-java/issues/333).
* enhancement - added support for semantic selection. See [#780](https://github.com/redhat-developer/vscode-java/issues/780).
* enhancement - Maven projects use the latest Execution Environment when source/target is not yet supported. See [#951](https://github.com/redhat-developer/vscode-java/issues/951).
* enhancement - added code action to convert a local variable to a field. See [#971](https://github.com/redhat-developer/vscode-java/pull/971).
* enhancement - added additional Gradle preferences. See [#973](https://github.com/redhat-developer/vscode-java/pull/973).
* enhancement - added new command to open the Java extension log. See [#985](https://github.com/redhat-developer/vscode-java/issues/985).
* enhancement - prevented aggressive classpath updates when jars don't change. See [JLS#1078](https://github.com/eclipse/eclipse.jdt.ls/pull/1078).
* enhancement - new extension point to register static commands during JDT LS initialization . See [JLS#1084](https://github.com/eclipse/eclipse.jdt.ls/issues/1084).
* bug fix - fixed "Extract Variable" returning a wrong cursor position. See [#952](https://github.com/redhat-developer/vscode-java/issues/952).
* bug fix - use the default `GRADLE_USER_HOME` env var if possible, for Gradle wrappers and modules. See [JLS#1072](https://github.com/eclipse/eclipse.jdt.ls/pull/1072).
* bug fix - fixed signature help returning the wrong active parameter. See [JLS#1039](https://github.com/eclipse/eclipse.jdt.ls/issues/1039).
* bug fix - fixed signature help stopped working after using a lambda. See [JLS#1086](https://github.com/eclipse/eclipse.jdt.ls/issues/1086).
* debt - replaced vscode package with @types/vscode. See [#977](https://github.com/redhat-developer/vscode-java/issues/977).
* documentation - setup the project for development. See [#949](https://github.com/redhat-developer/vscode-java/issues/949).

## 0.46.0 (June 5th, 2019)
* enhancement - new 'try with resources' snippet, triggered by `try_resources`. See [#932](https://github.com/redhat-developer/vscode-java/pull/932).
* enhancement - new 'private field' snippet, triggered by `prf`. See [#933](https://github.com/redhat-developer/vscode-java/pull/933).
* enhancement - new spinning icon in status bar, when server is loading. Good bye rocket. See [#929](https://github.com/redhat-developer/vscode-java/pull/929).
* enhancement - added code action to generate constructors. See [#921](https://github.com/redhat-developer/vscode-java/pull/921).
* enhancement - added code action to generate delegate methods. See [#930](https://github.com/redhat-developer/vscode-java/pull/930).
* enhancement - updated buildship to 3.1.0. See [Buildship changelog](https://discuss.gradle.org/t/buildship-3-1-is-now-available/31600).
* enhancement - updated m2e to 1.12 (now embeds Maven 3.6.1). See [m2e changelog](https://projects.eclipse.org/projects/technology.m2e/releases/1.12/bugs).
* enhancement - provide more info on hover for constant fields. See [JLS#1049](https://github.com/eclipse/eclipse.jdt.ls/issues/1049).
* bug fix - fixed Signature Help not matching active parameter per type. See [JLS#1037](https://github.com/eclipse/eclipse.jdt.ls/issues/1037).
* bug fix - fixed disabling Gradle wrapper in certain cases. See [JLS#1044](https://github.com/eclipse/eclipse.jdt.ls/issues/1044).

## 0.45.0 (May 15th, 2019)
* enhancement - optionally disable loading Gradle from wrapper and use a specific Gradle version. See [#875](https://github.com/redhat-developer/vscode-java/issues/875).
* enhancement - added `Assign parameters to new fields` source actions. See [JLS#167](https://github.com/eclipse/eclipse.jdt.ls/issues/167).
* enhancement - added code action for adding non existing constructor from super class. See [JLS#767](https://github.com/eclipse/eclipse.jdt.ls/issues/767).
* enhancement - use the `java.codeGeneration.generateComments` preference to generate comments for getter and setter. See [JLS#1024](https://github.com/eclipse/eclipse.jdt.ls/pull/1024).
* bug fix - fixed extension activation conditions causing some issues. See [#914](https://github.com/redhat-developer/vscode-java/issues/914) and [#915](https://github.com/redhat-developer/vscode-java/pull/915).
* bug fix - fixed failing build caused by a bad formatter URL. See [#916](https://github.com/redhat-developer/vscode-java/issues/916).
* bug fix - fixed NPE when closing a renamed file. See [JLS#993](https://github.com/eclipse/eclipse.jdt.ls/issues/993).
* bug fix - fixed Signature Help for constructors. See [JLS#1030](https://github.com/eclipse/eclipse.jdt.ls/issues/1030).

## 0.44.0 (May 2nd, 2019)
* enhancement - show more progress details of workspace jobs. See [#896](https://github.com/redhat-developer/vscode-java/issues/896).
* enhancement - added advanced `Generate getters and setters...` source action. See [#907](https://github.com/redhat-developer/vscode-java/pull/907).
* enhancement - batch Maven project imports when available ram < 1.5GB and number of projects > 50, to reduce memory consumption. See [JLS#982](https://github.com/eclipse/eclipse.jdt.ls/issues/982).
* enhancement - tentative workaround for poor resource refresh performance on Windows. See [JLS#1001](https://github.com/eclipse/eclipse.jdt.ls/pull/1001).
* enhancement - log resource path and line number of build errors. See [JLS#1013](https://github.com/eclipse/eclipse.jdt.ls/issues/1013).
* bug fix - update classpath when jar files are modified. See [#775](https://github.com/redhat-developer/vscode-java/issues/775).
* bug fix - remove ellipsis on `Create getter and setter for` label. See [#908](https://github.com/redhat-developer/vscode-java/issues/908).
* bug fix - fixed NPE when peeking implementation on generic types. See [JLS#1004](https://github.com/eclipse/eclipse.jdt.ls/issues/1004).
* bug fix - only return signature help on method invocation and javadoc reference. See [JLS#1009](https://github.com/eclipse/eclipse.jdt.ls/issues/1009).
* bug fix - properly detect active signature in signature help. See [JLS#1017](https://github.com/eclipse/eclipse.jdt.ls/issues/1017).
* bug fix - use proper kinds for interfaces, enums and constants, in completion and document symbols. See [JLS#1012](https://github.com/eclipse/eclipse.jdt.ls/issues/1012).

## 0.43.0 (April 17th, 2019)
* enhancement - optimize server initialization. See [#869](https://github.com/redhat-developer/vscode-java/pull/869).
* enhancement - download Java sources lazily for Maven projects. See [#870](https://github.com/redhat-developer/vscode-java/pull/870).
* enhancement - added `Generate toString()...` source action. See [#873](https://github.com/redhat-developer/vscode-java/pull/873).
* enhancement - show more detailed progress report on startup. See [#883](https://github.com/redhat-developer/vscode-java/issues/883).
* bug fix - completion cache resets after file recompilation resulting in slow code completion. See [JLS#847](https://github.com/eclipse/eclipse.jdt.ls/issues/847).
* bug fix - fix jar detection on windows, for invisible projects. See [#882](https://github.com/redhat-developer/vscode-java/issues/882).

## 0.42.1 (April 1st, 2019)
* bug fix - fixed java.lang.UnsupportedClassVersionError when trying to run/test standalone code. See [#801](https://github.com/redhat-developer/vscode-java/issues/801).

## 0.42.0 (March 29th, 2019)
* enhancement - added "imports" folding support. See [#694](https://github.com/eclipse/eclipse.jdt.ls/issues/694).
* enhancement - added `Convert to static import` code actions. See [#958](https://github.com/eclipse/eclipse.jdt.ls/pull/958).
* enhancement - added Java 12 support. See [#959](https://github.com/eclipse/eclipse.jdt.ls/issues/959).
* enhancement - eliminated CPU usage when idling on Windows. See [#960](https://github.com/eclipse/eclipse.jdt.ls/issues/960).
* enhancement - added UI to manage ambiguous imports. See [#966](https://github.com/eclipse/eclipse.jdt.ls/pull/966).
* bug fix - fixed occasional NPE when navigating to class, on Linux. See [#963](https://github.com/eclipse/eclipse.jdt.ls/issues/963).

## 0.41.0 (March 15th, 2019)
* enhancement - added `Generate hashcode() and equals()...` source action. See [814](https://github.com/redhat-developer/vscode-java/pull/814).
* enhancement - added reload prompt when extension bundles changed. See [#822](https://github.com/redhat-developer/vscode-java/pull/822).
* enhancement - added status to ExtensionAPI. See [#830](https://github.com/redhat-developer/vscode-java/issues/830).
* enhancement - improved failed JDK detection diagnostic. See [#835](https://github.com/redhat-developer/vscode-java/issues/835).
* bug fix - fixed the mechanism to resolve the package name of an empty java file. See [#750](https://github.com/redhat-developer/vscode-java/issues/750).
* bug fix - fixed server stopping when idling. See [#815](https://github.com/redhat-developer/vscode-java/issues/815).
* bug fix - signature help should select the 1st parameter after the opening round bracket. See [JLS#947](https://github.com/eclipse/eclipse.jdt.ls/issues/947).
* debt - subscribe all disposables to the extension's context. See [#832](https://github.com/redhat-developer/vscode-java/pull/832).

## 0.40.0 (February 28th, 2019)
* enhancement - new source action: `Override/Implement Methods...`. See [749](https://github.com/redhat-developer/vscode-java/pull/749).
* enhancement - attaching sources now use a project relative path, when possible. See [JLS#906](https://github.com/eclipse/eclipse.jdt.ls/issues/906).
* bug fix - definitely fixed the file handle/memory leak on Windows when idling (when using Java 9+), also reduced CPU usage. See [JLS#936](https://github.com/eclipse/eclipse.jdt.ls/pull/936).

## 0.39.0 (February 21st, 2019)
* enhancement - automatically detect jars in `lib/` folder next to standalone Java files. See [#501](https://github.com/redhat-developer/vscode-java/issues/501).
* bug fix - fixed default hover/source encoding. See [#788](https://github.com/redhat-developer/vscode-java/issues/788).
* bug fix - fixed file handle/memory leak on Windows when idling. See [#789](https://github.com/redhat-developer/vscode-java/issues/789).
* build - use Eclipse 2019-03 M2 bits. See [JLS#934](https://github.com/eclipse/eclipse.jdt.ls/pull/934).

## 0.38.0 (January 31st, 2019)
* enhancement - new dialog asking to hide java project settings files on startup. See [#776](https://github.com/redhat-developer/vscode-java/pull/776).
* bug fix - pick up gradle properties updates when doing full build. See [#758](https://github.com/redhat-developer/vscode-java/issues/758).
* bug fix - fixed inactive autocompletion after inserting a snippet in some cases. See [#768](https://github.com/redhat-developer/vscode-java/issues/768).


## 0.37.0 (January 17th, 2019)
* enhancement - improve extension loading time by using webpack. See [#732](https://github.com/redhat-developer/vscode-java/issues/732).
* bug fix - fixed annotation processing for Micronaut projects. See [#693](https://github.com/redhat-developer/vscode-java/issues/693).
* bug fix - fixed regression with "Add parentheses around cast" code action. See [JLS#907](https://github.com/eclipse/eclipse.jdt.ls/issues/907).
* bug fix - ignore circular links during project import. See [JLS#911](https://github.com/eclipse/eclipse.jdt.ls/pull/911).
* documentation - Changing "JDK 8" to just "JDK" in README.md. See [#763](https://github.com/redhat-developer/vscode-java/pull/763).
* build - adopt test plan. See [#748](https://github.com/redhat-developer/vscode-java/pull/748).


## 0.36.0 (December 18th, 2018)
* enhancement - reworked standalone files support. Now maps root folders to an invisible project under the hood. See [#508](https://github.com/redhat-developer/vscode-java/issues/508), [#620](https://github.com/redhat-developer/vscode-java/issues/620), [#739](https://github.com/redhat-developer/vscode-java/issues/739).
* enhancement - added commands to add/remove/list source folders of Eclipse projects. See [#619](https://github.com/redhat-developer/vscode-java/issues/619).
* enhancement - mapped `extract` refactorings to new code action kinds (helps with key mapping). See [#714](https://github.com/redhat-developer/vscode-java/issues/714).
* enhancement - new `java.maxConcurrentBuilds` preference to set max simultaneous project builds. See [#741](https://github.com/redhat-developer/vscode-java/pull/741).
* enhancement - source action to generate Getters/Setters for all fields. See [JLS#163](https://github.com/eclipse/eclipse.jdt.ls/issues/163).
* bug fix - fixed project reference when navigating to JDK classes. See [JLS#842](https://github.com/eclipse/eclipse.jdt.ls/issues/842).
* bug fix - fixed potential NPE on hover. See [#723](https://github.com/redhat-developer/vscode-java/issues/723).
* bug fix - don't display unnecessary code actions. See [JLS#894](https://github.com/eclipse/eclipse.jdt.ls/issues/894).
* build - removed Guava 15 from the distribution, saving 2MB. See [JLS#484](https://github.com/eclipse/eclipse.jdt.ls/issues/484).
* build - migrated to Buildship 3.0. See [JLS#875](https://github.com/eclipse/eclipse.jdt.ls/issues/875).

## 0.35.0 (November 30th, 2018)
* enhancement - `Organize imports` moved to `Source Action...` menu. See [#513](https://github.com/redhat-developer/vscode-java/issues/513).
* enhancement - rename refactoring now supports file operations (rename/move file). See [JLS#43](https://github.com/eclipse/eclipse.jdt.ls/issues/43).
* bug fix - fixed broken import autocompletion. See [JLS#591](https://github.com/eclipse/eclipse.jdt.ls/issues/591).
* bug fix - fixed diagnostics not being reset after closing a file. See [JLS#867](https://github.com/eclipse/eclipse.jdt.ls/issues/867).

## 0.34.0 (November 16th, 2018)
* enhancement - add ability to attach missing sources. See [#837](https://github.com/redhat-developer/vscode-java/issues/233).
* enhancement - adopt new CodeAction and CodeActionKind. See [JLS#800](https://github.com/eclipse/eclipse.jdt.ls/pull/800).
* enhancement - resolve `~/` paths for `java.configuration.maven.userSettings`. See [715](https://github.com/redhat-developer/vscode-java/pull/715).
* bug fix - fixed import failure when parent project is missing. See [#702](https://github.com/redhat-developer/vscode-java/issues/702).
* bug fix - fixed NPE in Outline view when no source is attached. See [JLS#851](https://github.com/eclipse/eclipse.jdt.ls/pull/851).
* bug fix - fixed detection of projects under linked folders. See [JLS#831](https://github.com/eclipse/eclipse.jdt.ls/pull/836).

## 0.33.0 (October 23rd, 2018)
* enhancement - add new command to clean the server workspace. See [#655](https://github.com/redhat-developer/vscode-java/issues/655).
* enhancement - add Mockito static imports by default. See [#679](https://github.com/redhat-developer/vscode-java/pull/679).
* bug fix - fixed "Busy loop " when running Java 11. See [#664](https://github.com/redhat-developer/vscode-java/issues/664).
* bug fix - fixed Maven diagnostics showing up and disappearing on save. See [#669](https://github.com/redhat-developer/vscode-java/issues/669).
* bug fix - ignore multiple code lenses for lombok generated methods. See [#674](https://github.com/redhat-developer/vscode-java/issues/674).


## 0.32.0 (October 2nd, 2018)
* enhancement - new Java 11 support for Maven, Gradle and Eclipse projects. See [#625](https://github.com/redhat-developer/vscode-java/issues/625) and [#653](https://github.com/redhat-developer/vscode-java/issues/653).
* enhancement - cascade "Update project configuration" command to child Maven projects. See [#638](https://github.com/redhat-developer/vscode-java/issues/638).
* enhancement - bind `Project configuration is not up-to-date with pom.xml` diagnostics to pom.xml. See [JLS#797](https://github.com/eclipse/eclipse.jdt.ls/issues/797).
* enhancement - ignore `Unknown referenced nature` warnings. See [JLS#812](https://github.com/eclipse/eclipse.jdt.ls/issues/812).
* bug fix - fixed `Force Java Compilation` command failing due to `Project configuration is not up-to-date with pom.xml` errors. See [JLS#813](https://github.com/eclipse/eclipse.jdt.ls/issues/813).

## 0.31.0 (September 16th, 2018)
* enhancement - added Outline support. See [#586](https://github.com/redhat-developer/vscode-java/issues/586).
* enhancement - new `java.completion.enabled` preference to disable auto-completion. See [#631](https://github.com/redhat-developer/vscode-java/pull/631).
* enhancement - export the utility method requirements.resolveRequirements() as extension API. See [#639](https://github.com/redhat-developer/vscode-java/issues/639).
* enhancement - new code-action: Convert anonymous class to lambda expression. See [JLS#658](https://github.com/eclipse/eclipse.jdt.ls/issues/658).
* bug fix - fixed 'Updating Maven projects' showing progress above 100%. See [#605](https://github.com/redhat-developer/vscode-java/issues/605).
* bug fix - give more time to shut down the server properly. See [#628](https://github.com/redhat-developer/vscode-java/pull/628).
* bug fix - fixed BadLocationExceptions thrown during `textDocument/documentSymbol` invocations. See [JLS#794](https://github.com/eclipse/eclipse.jdt.ls/issues/794).

## 0.30.0 (August 31rd, 2018)
* enhancement - add support for `Go to implementation`. See [#446](https://github.com/redhat-developer/vscode-java/issues/446).
* enhancement - automatically generate params in Javadoc. See [#228](https://github.com/redhat-developer/vscode-java/issues/228).
* enhancement - publish diagnostic information at the project level. See [#608](https://github.com/redhat-developer/vscode-java/issues/608).
* enhancement - prevent unnecessary build when reopening workspace. See [JLS#756](https://github.com/eclipse/eclipse.jdt.ls/pull/756).
* enhancement - update m2e to 1.9.1 See [JLS#761](https://github.com/eclipse/eclipse.jdt.ls/issues/761).
* enhancement - lower severity of m2e's `Project configuration is not up-to-date...` diagnostics. See [JLS#763](https://github.com/eclipse/eclipse.jdt.ls/issues/763).
* enhancement - add quickfix for removing unused local var and all assignments. See [JLS#769](https://github.com/eclipse/eclipse.jdt.ls/issues/769).
* bug fix - fixed indentation preferences being ignored after completions/refactoring. See [557](https://github.com/redhat-developer/vscode-java/issues/557).
* bug fix - fixed timestamps in logs. See [JLS#742](https://github.com/eclipse/eclipse.jdt.ls/issues/742).
* bug fix - don't send notifications for gradle files modified under the build directory. See [JLS#768](https://github.com/eclipse/eclipse.jdt.ls/issues/768).
* bug fix - fixed Tabs being ignored during formatting requests. See [JLS#775](https://github.com/eclipse/eclipse.jdt.ls/issues/775).

## 0.29.0 (July 31rd, 2018)
* enhancement - code action: convert from `var` to the appropriate type (Java 10+). See [JLS#696](https://github.com/eclipse/eclipse.jdt.ls/issues/696).
* enhancement - code action: convert from type to `var` (Java 10+). See [JLS#697](https://github.com/eclipse/eclipse.jdt.ls/issues/697).
* enhancement - Java 9+ versions no longer leak their API by default. See [JLS#620](https://github.com/eclipse/eclipse.jdt.ls/issues/620).
* enhancement - add links to completion items' documentation. See [JLS#731](https://github.com/eclipse/eclipse.jdt.ls/issues/731).
* bug fix - fix build errors after renaming standalone Java files. See [#578](https://github.com/redhat-developer/vscode-java/issues/578).
* bug fix - fixed extracting to method incorrectly adding the `static` keyword in nested classes. See [JLS#709](https://github.com/eclipse/eclipse.jdt.ls/issues/709).


## 0.28.0 (July 3rd, 2018)
* enhancement - new `java.completion.guessMethodArguments` preference to insert best guessed arguments during method completion. See [#569](https://github.com/redhat-developer/vscode-java/pull/569).


## 0.27.0 (June 18th, 2018)
* enhancement - use more direct OpenJDK download link. See [#564](https://github.com/redhat-developer/vscode-java/issues/564).
* enhancement - code action: access non visible references by changing modifiers or through accessors. See [JLS#446](https://github.com/eclipse/eclipse.jdt.ls/issues/446).
* bug fix - fixed formatter file failing to open. See [#548](https://github.com/redhat-developer/vscode-java/issues/548).
* bug fix - fixed `class` and `interface` snippets should be proposed according to context. See [JLS#681](https://github.com/eclipse/eclipse.jdt.ls/issues/681).
* build - vscode-java-*vsix releases are now archived to http://download.jboss.org/jbosstools/static/jdt.ls/stable/. See [#552](https://github.com/redhat-developer/vscode-java/pull/552).

## 0.26.0 (May 31th, 2018)
* enhancement - now returns documentation as Markdown during completion. See [#318](https://github.com/redhat-developer/vscode-java/issues/318).
* enhancement - improved class/interface snippets, now adding the package, if necessary. See [#505](https://github.com/redhat-developer/vscode-java/issues/505).
* enhancement - added command to open/create Eclipse formatter settings. See [#521](https://github.com/redhat-developer/vscode-java/issues/521).
* bug fix - fixed `Organize imports` menu showing in the output panel. See [#539](https://github.com/redhat-developer/vscode-java/issues/539).
* bug fix - fixed missing documentation for methods with parameters, during completion. See [JLS#669](https://github.com/eclipse/eclipse.jdt.ls/issues/669).

## 0.25.0 (May 15th, 2018)
* enhancement - automatically enable Annotation Processing for Maven projects, based on [m2e-apt](https://github.com/jbosstools/m2e-apt). See [#339](https://github.com/redhat-developer/vscode-java/issues/339).
* enhancement - adds support for on-type formatting. See [#530](https://github.com/redhat-developer/vscode-java/pull/530)
* bug fix - improve JAVA_HOME detection on Windows. See [#524](https://github.com/redhat-developer/vscode-java/pull/524/).

## 0.24.0 (April 30th, 2018)
* enhancement - added support for external Eclipse formatter settings. See [#2](https://github.com/redhat-developer/vscode-java/issues/2);
* enhancement - code action: override static method from an instance method. See [JLS#444](https://github.com/eclipse/eclipse.jdt.ls/issues/444).
* enhancement - code action: override final methods. See [JLS#639](https://github.com/eclipse/eclipse.jdt.ls/pull/639).
* bug fix - fixed flaky diagnostics for TODO markers. See [#457](https://github.com/redhat-developer/vscode-java/issues/457).
* bug fix - fixed Java 10's `var`'s inferred type not shown in enhanced for-loops. See [#515](https://github.com/redhat-developer/vscode-java/issues/515).
* bug fix - fixed random exception thrown during _Code Actions_ resolution. See [JLS#642](https://github.com/eclipse/eclipse.jdt.ls/issues/642).

## 0.23.0 (April 16th, 2018)
* enhancement - added `java.completion.overwrite` preference. When set to true, code completion overwrites the current text. Else, code is simply added instead. See [#462](https://github.com/redhat-developer/vscode-java/issues/462).
* enhancement - restricted language service on file scheme, for [Live Share](https://code.visualstudio.com/visual-studio-live-share) compatibility. See [#492](https://github.com/redhat-developer/vscode-java/pull/492).
* enhancement - code actions: invalid modifiers. See [JLS#445](https://github.com/eclipse/eclipse.jdt.ls/issues/445).
* enhancement - improve build file change detection. See [JLS#547](https://github.com/eclipse/eclipse.jdt.ls/pull/547).
* enhancement - do not refresh workspace before build. See [JLS#627](https://github.com/eclipse/eclipse.jdt.ls/pull/627).
* bug fix - fixed potential NPE during completion resolution. See [JLS#629](https://github.com/eclipse/eclipse.jdt.ls/issues/629).


## 0.22.0 (April 4th, 2018)
* enhancement - add progress report for background tasks. Controlled with the `java.progressReports.enabled` preference. See [#488](https://github.com/redhat-developer/vscode-java/issues/484).
* enhancement - add experimental Java 10 support. See [#489](https://github.com/redhat-developer/vscode-java/issues/489).
* enhancement - notification mechanism for 3rd party extensions. See [JLS#595](https://github.com/eclipse/eclipse.jdt.ls/issues/595).
* enhancement - Javadoc {@links} should be functional. See [JLS#76](https://github.com/eclipse/eclipse.jdt.ls/issues/76).
* enhancement - code action: abstract classes/methods fixes. See [JLS#447](https://github.com/eclipse/eclipse.jdt.ls/issues/447).
* enhancement - watch files from all source folders. See [JLS#583](https://github.com/eclipse/eclipse.jdt.ls/issues/583).
* bug fix - fixed "Organize Import" command should not be active on non-java files. See [#489](https://github.com/redhat-developer/vscode-java/issues/473).
* bug fix - fixed test imports should not be proposed in main code. See [JLS#529](https://github.com/eclipse/eclipse.jdt.ls/issues/529).
* bug fix - fixed broken package Javadoc on Java 9/10. See [JLS#612](https://github.com/eclipse/eclipse.jdt.ls/issues/612).


## 0.21.0 (March 15th, 2018)
* enhancement - process non-java resources. See [#400](https://github.com/redhat-developer/vscode-java/issues/400).
* enhancement - code action: extract variables. See [#459](https://github.com/redhat-developer/vscode-java/issues/459).
* enhancement - [Maven] automatically update module path when required modules changes in module-info.java. See [#465](https://github.com/redhat-developer/vscode-java/issues/465).
* enhancement - should warn about unstable automatic module name in module-info.java. See [#467](https://github.com/redhat-developer/vscode-java/issues/467).
* bug fix - fixed organize import ignoring certain classes. See [JLS#552](https://github.com/eclipse/eclipse.jdt.ls/issues/552).

## 0.20.0 (February 28th, 2018)
* enhancement - incremental (i.e. faster) build triggered on startup, instead of a clean (i.e. slower) build. See [#451](https://github.com/redhat-developer/vscode-java/issues/451).
* enhancement - code action: remove unreachable code. See [JLS#437](https://github.com/eclipse/eclipse.jdt.ls/issues/437).
* bug fix - fixed `java.import.exclusions` preference being ignored during server startup. See [#444](https://github.com/redhat-developer/vscode-java/issues/444).
* bug fix - fixed stub sources being returned even though proper sources were downloaded. See [#447](https://github.com/redhat-developer/vscode-java/issues/447).
* bug fix - fixed attached javadoc being ignored on hover. See [JLS#517](https://github.com/eclipse/eclipse.jdt.ls/issues/517).
* bug fix - fixed broken `Organize imports` in module-info.java. See [JLS#549](https://github.com/eclipse/eclipse.jdt.ls/issues/549).
* bug fix - fixed multiline errors. See [JLS#567](https://github.com/eclipse/eclipse.jdt.ls/pull/567).

## 0.19.0 (February 15th, 2018)
* enhancement - added `java.projectConfiguration.update` command to the explorer menu, for build files. See [#159](https://github.com/redhat-developer/vscode-java/issues/159).
* enhancement - use `void` as default return value for method templates. See [#429](https://github.com/redhat-developer/vscode-java/pull/429).
* enhancement - new "Indexed for loop" template, triggered by the `fori` keyword. See [#434](https://github.com/redhat-developer/vscode-java/pull/434).
* enhancement - during import, only trigger "update project configuration" on Maven projects if necessary. See [JLS#544](https://github.com/eclipse/eclipse.jdt.ls/issues/544).
* bug fix - removed unnecessary files from the vscode-java distribution, reducing its size from 45MB to 34MB. See [#438](https://github.com/redhat-developer/vscode-java/issues/438).
* bug fix - fixed `Organize imports` command removing all imports in module-info.java. See [#430](https://github.com/redhat-developer/vscode-java/issues/430).
* bug fix - fixed flaky reporting of test imports in main code. See [JLS#528](https://github.com/eclipse/eclipse.jdt.ls/issues/528).
* bug fix - ignore `**/META-INF/maven/**` paths during import. See [JLS#539](https://github.com/eclipse/eclipse.jdt.ls/issues/539).

## 0.18.1 (January 31st, 2018)
* bug fix - Restore missing "Add unimplemented methods" code action. See [#426](https://github.com/redhat-developer/vscode-java/issues/426).

## 0.18.0 (January 31st, 2018)
* enhancement - New `java.completion.favoriteStaticMembers` preference to define static members to be automatically imported. See [#368](https://github.com/redhat-developer/vscode-java/issues/368).
* enhancement - Store method parameters in compiled classes, for Maven projects configured with the `-parameters` compiler parameter. See [#391](https://github.com/redhat-developer/vscode-java/issues/391).
* enhancement - New `java.saveActions.organizeImports` preference to enable `Organize imports` as a save action. See [#402](https://github.com/redhat-developer/vscode-java/pull/402).
* enhancement - New `java.autobuild.enabled` preference to enable/disable the 'auto build'. See [#406](https://github.com/redhat-developer/vscode-java/issues/406).
* enhancement - New `java.completion.importOrder` preference to customize imports order. See [#420](https://github.com/redhat-developer/vscode-java/issues/420).
* bug fix - fixed hover/navigation for types in module-info.java. See [JLS#397](https://github.com/eclipse/eclipse.jdt.ls/issues/397).
* bug fix - **fixed proper test classpath isolation**. Test classes are no longer available to main code for Maven and pure Eclipse projects. See [JLS#526](https://github.com/eclipse/eclipse.jdt.ls/issues/526).
* bug fix - fixed autocompletion/hover performance for Java 9 projects. See [#398](https://github.com/redhat-developer/vscode-java/issues/398).

## 0.17.0 (January 16th, 2018)
* enhancement - code-action: add missing serialVersionUID field. See [#401](https://github.com/redhat-developer/vscode-java/issues/401).
* enhancement - add `new` template to create a new Object. See [#407](https://github.com/redhat-developer/vscode-java/pull/407).
* bug fix - fixed autocompletion issues caused by changing the JDK used to run the server. See [#392](https://github.com/redhat-developer/vscode-java/issues/392).
* bug fix - fixed encoding issues when saving UTF-8 files containing Chinese characters. See [#394](https://github.com/redhat-developer/vscode-java/issues/394).
* bug fix - fixed server startup status never ending after an error. See [#403](https://github.com/redhat-developer/vscode-java/issues/403).


## 0.16.0 (December 15th, 2017)
* enhancement - add preferences to disable Maven (`java.import.maven.enabled`) and Gradle (`java.import.gradle.enabled`) imports (import as Eclipse instead). See [#388](https://github.com/redhat-developer/vscode-java/pull/388).
* enhancement - remove redundant diagnostics reports. See [JLS#468](https://github.com/eclipse/eclipse.jdt.ls/issues/468).
* enhancement - code action: handle unreachable catch blocks. See [JLS#381](https://github.com/eclipse/eclipse.jdt.ls/pull/481).
* bug fix - fixed `java.import.exclusions` preference should be a real array. See [#371](https://github.com/redhat-developer/vscode-java/issues/371).
* bug fix - fixed renaming/creating java files requiring a restart. See [#380](https://github.com/redhat-developer/vscode-java/issues/380).
* bug fix - fixed `-DGRADLE_HOME` parameter in `java.jdt.ls.vmargs` being ignored by jdt.ls. See [#383](https://github.com/redhat-developer/vscode-java/issues/383).
* task - removed region folding support as it's now provided by VS Code directly. See [#369](https://github.com/redhat-developer/vscode-java/issues/369).

## 0.15.0 (November 30th, 2017)
* enhancement - add Java 9 support for Gradle projects. See [#321](https://github.com/redhat-developer/vscode-java/issues/321).
* enhancement - add option to choose between full and incremental compilation. See [#364](https://github.com/redhat-developer/vscode-java/pull/364).
* enhancement - improve code completion/diagnostic reports performance. See [#381](https://github.com/redhat-developer/vscode-java/issues/381).
* enhancement - log errors when compiling standalone java files. See [#462](https://github.com/eclipse/eclipse.jdt.ls/pull/462).
* enhancement - code action: remove unused code. See [JLS#448](https://github.com/eclipse/eclipse.jdt.ls/issues/448).
* enhancement - code action: change return type of a method. See [JLS#435](https://github.com/eclipse/eclipse.jdt.ls/issues/435).
* enhancement - **significantly faster** startup for existing workspaces with Gradle projects. See[JLS#451](https://github.com/eclipse/eclipse.jdt.ls/issues/451).
* enhancement - delay symbols queries until server is ready. See [JLS#452](https://github.com/eclipse/eclipse.jdt.ls/issues/452).
* bug fix - fixed duplicate imports on "Organize imports" action. See [#253](https://github.com/redhat-developer/vscode-java/issues/253).
* bug fix - fixed autocompletion overwriting the following characters. See [#352](https://github.com/redhat-developer/vscode-java/issues/352).
* bug fix - do not report errors for Java files outside their project's classpath. See [#456](https://github.com/eclipse/eclipse.jdt.ls/pull/456).
* bug fix - fixed high CPU usage on Windows. See [JLS#378](https://github.com/eclipse/eclipse.jdt.ls/issues/378).
* bug fix - return SymbolKind.Method instead of SymbolKind.Function for methods. See [JLS#422](https://github.com/eclipse/eclipse.jdt.ls/issues/422).
* bug fix - fixed java extensions started twice. See [JLS#450](https://github.com/eclipse/eclipse.jdt.ls/issues/450).
* bug fix - fixed NPEs occurring during code action computation. See [JLS#453](https://github.com/eclipse/eclipse.jdt.ls/issues/453) and [JLS#470](https://github.com/eclipse/eclipse.jdt.ls/issues/470) .

## 0.14.0 (November 9th, 2017)
* enhancement - add CodeLens support from .class files. See [#343](https://github.com/redhat-developer/vscode-java/issues/343).
* enhancement - new multi-root support. See [#347](https://github.com/redhat-developer/vscode-java/pull/347).
* bug fix - fixed starting jdt.ls with JDK 10-ea. See [#356](https://github.com/redhat-developer/vscode-java/issues/356).
* bug fix - fixed 'java.workspace.compile' command to be invoked by the debugger. See [#357](https://github.com/redhat-developer/vscode-java/pull/357).

## 0.13.0 (November 2nd, 2017)
* enhancement - new `Force Java compilation` command (`Shift+Alt+b`). See [#277](https://github.com/redhat-developer/vscode-java/issues/277).
* enhancement - **significantly faster** startup for existing workspaces with Maven projects. See [#336](https://github.com/redhat-developer/vscode-java/issues/336).
* enhancement - new `Organize Imports` command (`Shift+Alt+o`). See [#341](https://github.com/redhat-developer/vscode-java/pull/341).
* bug fix - fixed highlight support in `module-info.java`. See [#256](https://github.com/redhat-developer/vscode-java/issues/256).
* bug fix - fixed inner pom.xml changes causing infinite update project loop. See [#331](https://github.com/redhat-developer/vscode-java/issues/331).
* bug fix - fixed keybinding for "Update project configuration" command conflicting with `AltGr+u` (now `Shift+Alt+u`). See [#348](https://github.com/redhat-developer/vscode-java/issues/348).
* bug fix - fixed autocompletion overwritting following characters. See [#352](https://github.com/redhat-developer/vscode-java/issues/352).
* bug fix - fixed hover not working when browsing *.class files. See [JLS#390](https://github.com/eclipse/eclipse.jdt.ls/issues/390).
* bug fix - fixed Java Model Exception when changing class name. See [JLS#400](https://github.com/eclipse/eclipse.jdt.ls/issues/400).

## 0.12.0 (October 17th, 2017)
* enhancement - experimental Java 9 support (for Maven and Eclipse projects). See [JLS#185](https://github.com/eclipse/eclipse.jdt.ls/issues/185).
* enhancement - add `Extract to method` refactoring. See [#303](https://github.com/redhat-developer/vscode-java/issues/303).
* enhancement - add region folding support. See [#316](https://github.com/redhat-developer/vscode-java/issues/316).
* enhancement - improved Java snippets with transformations. See [#317](https://github.com/redhat-developer/vscode-java/issues/317).
* enhancement - made Java language server output less intrusive. See [#326](https://github.com/redhat-developer/vscode-java/pull/326).
* enhancement - add 3rd party decompiler support. See [#334](https://github.com/redhat-developer/vscode-java/pull/334).
* bug fix - fixed inconsistent package error on standalone java files. See [#274](https://github.com/redhat-developer/vscode-java/issues/274).
* bug fix - fixed Javadoc not shown on hover, after saving a file. See [JLS#375](https://github.com/eclipse/eclipse.jdt.ls/issues/375).
* bug fix - fixed conflicts caused by 3rd party extensions updates. See [JLS#385](https://github.com/eclipse/eclipse.jdt.ls/pull/385);

## 0.11.0 (October 2nd, 2017)
* enhancement - external debugger now supported. See [#9](https://github.com/redhat-developer/vscode-java/issues/9).
* enhancement - code-action: handle exceptions with try/catch block or throws statement. See [#300](https://github.com/redhat-developer/vscode-java/issues/300).
* bug fix - fixed failing autocompletion when class name contains `$`. See [#301](https://github.com/redhat-developer/vscode-java/issues/301).
* bug fix - fixed OperationCanceledException on hover. See [#302](https://github.com/redhat-developer/vscode-java/issues/302).
* bug fix - fixed Index Out Of Bounds Exceptions during completion. See [#306](https://github.com/redhat-developer/vscode-java/issues/306).
* bug fix - fixed NPE in completion for package-less standalone classes. See [#312](https://github.com/redhat-developer/vscode-java/issues/312).

## 0.10.0 (September 15th, 2017)
* enhancement - enable 3rd party VS Code extensions to extend the JDT Language Server. See [#282](https://github.com/redhat-developer/vscode-java/issues/282).
* enhancement - add new `java.execute.workspaceCommand` command, for 3rd party VS Code extensions. See [#292](https://github.com/redhat-developer/vscode-java/issues/292).
* enhancement - References CodeLens disabled by default. See [#293](https://github.com/redhat-developer/vscode-java/issues/293).
* enhancement - add Types to symbols outline, to work with the [Code Outline](https://github.com/patrys/vscode-code-outline) extension. See [#294](https://github.com/redhat-developer/vscode-java/issues/294).
* bug fix - fixed content assist for Anonymous class creation. See [JLS#57](https://github.com/eclipse/eclipse.jdt.ls/issues/57).
* bug fix - fixed incorrect hover for unresolved types. See [JLS#333](https://github.com/eclipse/eclipse.jdt.ls/issues/333).

## 0.9.0 (August 31st, 2017)
* enhancement - rename symbols support (Doesn't rename files at the moment). See [#71](https://github.com/redhat-developer/vscode-java/issues/71).
* enhancement - use system's Gradle runtime when no wrapper found. See [#232](https://github.com/redhat-developer/vscode-java/issues/232).
* enhancement - code action: generate getters and setters. See [#263](https://github.com/redhat-developer/vscode-java/issues/263).
* enhancement - code action: add unimplemented methods. See [#270](https://github.com/redhat-developer/vscode-java/issues/270).
* bug fix - support 32-bit platforms. See [#201](https://github.com/redhat-developer/vscode-java/issues/201).
* bug fix - fixed implementor codelens showing `<<MISSING COMMAND>>` when typing. See [#266](https://github.com/redhat-developer/vscode-java/issues/266).
* bug fix - fixed `<<MISSING COMMAND>>` when invoking code actions. See [#288](https://github.com/redhat-developer/vscode-java/issues/288).
* bug fix - fixed `Index out of bounds` exceptions during code lens resolution, after document changes. See [JLS#340](https://github.com/eclipse/eclipse.jdt.ls/issues/340).

## 0.8.0 (July 31st, 2017)
* enhancement - generate getters and setters from autocompletion. See [#100](https://github.com/redhat-developer/vscode-java/issues/100).
* enhancement - enable/disable default Java formatter with the `java.format.enabled` preference. See [#186](https://github.com/redhat-developer/vscode-java/issues/186).
* enhancement - exclude folders from Java project detection via glob patterns with the `java.import.exclusions` preference. See [#229](https://github.com/redhat-developer/vscode-java/issues/229).
* enhancement - enable/disable signature help with the `java.signatureHelp.enabled` preference. See [#252](https://github.com/redhat-developer/vscode-java/issues/252).
* enhancement - enable/disable the implementations code lens with the `java.implementationsCodeLens.enabled` preference. See [#257](https://github.com/redhat-developer/vscode-java/issues/257	).
* bug fix - gracefully handle deleted required eclipse settings files. See [#132](https://github.com/redhat-developer/vscode-java/issues/132).
* bug fix - properly render documentation during code completion. See [#215](https://github.com/redhat-developer/vscode-java/issues/215).
* bug fix - fixed opening network folders on Windows. See [#259](https://github.com/redhat-developer/vscode-java/issues/259).
* bug fix - diagnostics mismatch after applying code actions. See [JLS#279](https://github.com/eclipse/eclipse.jdt.ls/issues/279).
* bug fix - fixed Maven support running on JDK 9 and IBM JDK. See [JLS#315](https://github.com/eclipse/eclipse.jdt.ls/issues/315).
* bug fix - keep logs clean from OperationCanceledException during code assist. See [JLS#317](https://github.com/eclipse/eclipse.jdt.ls/issues/317).

## 0.7.0 (July 4th, 2017)
* enhancement - enabled @formatter:on/off tags in source. See [#236](https://github.com/redhat-developer/vscode-java/issues/236).
* enhancement - improved error reporting in standalone java files. See [#242](https://github.com/redhat-developer/vscode-java/issues/242).
* enhancement - hover should show element signature. See [JLS#259](https://github.com/eclipse/eclipse.jdt.ls/issues/259).
* enhancement - code-action: add missing methods. See [JLS#177](https://github.com/eclipse/eclipse.jdt.ls/issues/177).
* enhancement - code-action: missing variables, fields, params. See [JLS#178](https://github.com/eclipse/eclipse.jdt.ls/issues/178).
* enhancement - code-action: organize imports. See [JLS#164](https://github.com/eclipse/eclipse.jdt.ls/issues/164).
* enhancement - code-action: rename type. See [JLS#264](https://github.com/eclipse/eclipse.jdt.ls/issues/264).
* enhancement - code-action: fix package declaration. See [JLS#265](https://github.com/eclipse/eclipse.jdt.ls/issues/265).
* enhancement - code-action: remove unnecessary Javadoc param. See [JLS#274](https://github.com/eclipse/eclipse.jdt.ls/issues/274).
* enhancement - code-action: add missing Javadoc params. See [JLS#275](https://github.com/eclipse/eclipse.jdt.ls/issues/275).
* enhancement - code-action: add missing Javadoc params. See [JLS#275](https://github.com/eclipse/eclipse.jdt.ls/issues/275).
* enhancement - code-action: fix type mismatch. See [JLS#276](https://github.com/eclipse/eclipse.jdt.ls/issues/276).
* enhancement - code-action: fix missing attribute in annotation. See [JLS#277](https://github.com/eclipse/eclipse.jdt.ls/issues/277).
* bug fix - fixed wrong URI set for diagnostics of standalone java files. See [JLS#268](https://github.com/eclipse/eclipse.jdt.ls/issues/268).
* bug fix - fixed `Error computing hover: **/package-summary.html not found in JavaDoc jar`. See [#248](https://github.com/redhat-developer/vscode-java/issues/248).
* bug fix - fixed `Invalid project description` thrown when reopening Eclipse projects. See [#244](https://github.com/redhat-developer/vscode-java/issues/244).

## 0.6.0 (June 15th, 2017)
* enhancement - reduced extension size by ~25%. See [JLS#252](https://github.com/eclipse/eclipse.jdt.ls/issues/252).
* bug fix - fixed OperationCanceledException during completion. See [JLS#240](https://github.com/eclipse/eclipse.jdt.ls/issues/240).
* bug fix - fixed changes in Eclipse settings file are ignored. See [#239](https://github.com/redhat-developer/vscode-java/pull/239).
* bug fix - `package` autocompletion should return only 1 package. See [#234](https://github.com/redhat-developer/vscode-java/pull/234).
* bug fix - autocompletion on overridden methods should create the method body. See [#85](https://github.com/redhat-developer/vscode-java/pull/85).

## 0.5.0 (May 31st, 2017)
* enhancement - enable support for CamelCase type search. See [JLS#219](https://github.com/eclipse/eclipse.jdt.ls/issues/219).
* enhancement - server startup now uses progress UI. See [#225](https://github.com/redhat-developer/vscode-java/pull/225).
* bug fix - fixed autocomplete inserting classname+package text instead of classname. See [#175](https://github.com/redhat-developer/vscode-java/issues/175).
* bug fix - fixed `Timed out while retrieving the attached javadoc.` error. See [#176](https://github.com/redhat-developer/vscode-java/issues/176).
* bug fix - fixed autocompletion not cancelled on space. See [#187](https://github.com/redhat-developer/vscode-java/issues/187).
* bug fix - fixed Gradle import failing behind corporate proxy with authentication. See [#211](https://github.com/redhat-developer/vscode-java/issues/211).
* bug fix - fixed `Unable to locate secure storage module` error. See [#212](https://github.com/redhat-developer/vscode-java/issues/212).
* bug fix - fixed CancellationException in output log. See [#213](https://github.com/redhat-developer/vscode-java/issues/213).
* bug fix - fixed `Illegal argument, contents must be defined` error on hover. See [#214](https://github.com/redhat-developer/vscode-java/issues/214).
* bug fix - fixed code snippet appearing before completion results. See [#216](https://github.com/redhat-developer/vscode-java/issues/216).
* bug fix - fixed code snippet using deprecated syntax. See [#217](https://github.com/redhat-developer/vscode-java/issues/217).
* bug fix - fixed navigation from disassembled source code. See [#222](https://github.com/redhat-developer/vscode-java/issues/222).
* bug fix - fixed Javadoc missing from inherited methods. See [#226](https://github.com/redhat-developer/vscode-java/issues/226).
* bug fix - fixed `Problems encountered while copying resources. Resource '/jdt.ls-java-project/src/pom.xml' does not exist` error. See [#244](https://github.com/eclipse/eclipse.jdt.ls/issues/244).

## 0.4.0 (May 15th, 2017)
* enhancement - new `Open Java Language Server log file` command. See [#209](https://github.com/redhat-developer/vscode-java/issues/209).
* enhancement - expand workspace symbol search to all classes from classpath. See [#204](https://github.com/redhat-developer/vscode-java/issues/204).
* bug fix - fixed outline for classes from classpath. See [#206](https://github.com/redhat-developer/vscode-java/issues/206).
* bug fix - fixed ambiguous results from class outline. See [JLS#214](https://github.com/eclipse/eclipse.jdt.ls/issues/214).

## 0.3.0 (May 4th, 2017)
* enhancement - reduce confusion about "Classpath is incomplete" warning by providing a link to the wiki page. See [#193](https://github.com/redhat-developer/vscode-java/issues/193).
* enhancement - enable String deduplication on G1 Garbage collector by default, to improve memory footprint. See [#195](https://github.com/redhat-developer/vscode-java/issues/195).

## 0.2.1 (April 24th, 2017)
* bug fix - fix excessive 'Unable to get documentation under 500ms' logging. See [#189](https://github.com/redhat-developer/vscode-java/issues/189).

## 0.2.0 (April 19th, 2017)
* enhancement - extension now embeds the Java Language Server. See [#178](https://github.com/redhat-developer/vscode-java/issues/178).
* bug fix - fixed Java Language Server status update on startup. See [#179](https://github.com/redhat-developer/vscode-java/issues/179).
* bug fix - fixed detection of nested Gradle projects. See [#165](https://github.com/redhat-developer/vscode-java/issues/165).

## 0.1.0 (March 30th, 2017)
* enhancement - support starting the Java Language Server with JDK 9. See [#43](https://github.com/redhat-developer/vscode-java/issues/43).
* enhancement - add support for build-helper-maven-plugin. See [JLS#198](https://github.com/eclipse/eclipse.jdt.ls/issues/198).
* enhancement - add support for Maven compilerIds jdt, eclipse, javac-with-errorprone. See [JLS#196](https://github.com/eclipse/eclipse.jdt.ls/issues/196).
* enhancement - log Server's stderr/sdout in VS Code's console, to help troubleshooting. See [#172](https://github.com/redhat-developer/vscode-java/pull/172/).
* bug fix - [tentative] prevent workspace corruption on shutdown. See [JLS#199](https://github.com/eclipse/eclipse.jdt.ls/pull/199).
* bug fix - opening standalone Java files fails to initialize the server. See [JLS#194](https://github.com/eclipse/eclipse.jdt.ls/issues/194).
* bug fix - intellisense fails on package-less classes. See [#166](https://github.com/redhat-developer/vscode-java/issues/166).

## 0.0.13 (March 17th, 2017)
* bug fix - java projects are no longer imported. See [#167](https://github.com/redhat-developer/vscode-java/issues/167).

## 0.0.12 (March 16th, 2017)
* enhancement - new `java.configuration.maven.userSettings` preference to set Maven's user settings.xml. See [JLS#184](https://github.com/eclipse/eclipse.jdt.ls/issues/184).
* enhancement - adopt new VS Code SnippetString API. See [#99](https://github.com/redhat-developer/vscode-java/issues/99).
* bug fix - saving a file doesn't update compilation errors on dependent classes. See [JLS#187](https://github.com/eclipse/eclipse.jdt.ls/issues/187).

## 0.0.11 (March 2nd, 2017)
* build - now uses [Eclipse &trade; JDT Language Server](https://github.com/eclipse/eclipse.jdt.ls) under the hood. See [#152](https://github.com/redhat-developer/vscode-java/issues/152).
* enhancement - maven errors are reported. See [JLS#85](https://github.com/eclipse/eclipse.jdt.ls/issues/85).
* enhancement - code Actions for adding missing quote, removing unused import and superfluous semicolon. See [JLS#15](https://github.com/eclipse/eclipse.jdt.ls/issues/15).
* bug fix - correct Javadoc highlighting. See [#94](https://github.com/redhat-developer/vscode-java/issues/94)

## 0.0.10 (February 08th, 2017)
* enhancement - improve intellisense performance. See [#121](https://github.com/redhat-developer/vscode-java/issues/121).
* enhancement - document server tracing capabilities. See [#145](https://github.com/redhat-developer/vscode-java/issues/145).
* enhancement - disable reference code lenses with `java.referencesCodeLens.enabled`. See [#148](https://github.com/redhat-developer/vscode-java/issues/148).
* bug fix - fix dubious intellisense relevance. See [#142](https://github.com/redhat-developer/vscode-java/issues/142).
* bug fix - fix broken autocompletion on constructors. See [#143](https://github.com/redhat-developer/vscode-java/issues/143).
* bug fix - fix brackets/parentheses autoclosing. See [#144](https://github.com/redhat-developer/vscode-java/issues/144).

## 0.0.9 (January 16th, 2017)
* enhancement - autoclose Javadoc statements, adding `*` on new lines. See [#139](https://github.com/redhat-developer/vscode-java/issues/139).
* bug fix - fix Error when `Go to definition` performed on non-code portion. See [#124](https://github.com/redhat-developer/vscode-java/issues/124).
* bug fix - fix saving `java.errors.incompleteClasspath.severity` preference. See [#128](https://github.com/redhat-developer/vscode-java/issues/128).
* bug fix - fix NPE occurring when clicking on comment section of a Java file. See [#131](https://github.com/redhat-developer/vscode-java/issues/131).
* bug fix - fix JAVA_HOME detection on MacOS. See [#134](https://github.com/redhat-developer/vscode-java/issues/134).
* bug fix - fix support for quoted VM arguments. See [#135](https://github.com/redhat-developer/vscode-java/issues/135).
* bug fix - don't display Code Lenses from Lombok-generated code. See [#137](https://github.com/redhat-developer/vscode-java/issues/137).
* bug fix - remove langserver.log file generation under home directory. See [#140](https://github.com/redhat-developer/vscode-java/issues/140).

## 0.0.8 (December 22nd, 2016)
* enhancement - add basic Java Gradle support (Android not supported). See [#10](https://github.com/redhat-developer/vscode-java/issues/10).
* enhancement - disable warning about `Incomplete Classpath`. See [#107](https://github.com/redhat-developer/vscode-java/issues/107).
* enhancement - new `Update project configuration` command (`Ctrl+Alt+U` or `Cmd+Alt+U` on MacOS). See [#113](https://github.com/redhat-developer/vscode-java/issues/113).
* enhancement - automatically update java classpath/configuration on build file change. See [#122](https://github.com/redhat-developer/vscode-java/issues/122).
* bug fix - fix completion on import statements. See [#68](https://github.com/redhat-developer/vscode-java/issues/68).
* bug fix - fix errors when modifying eclipse configuration files. See [#105](https://github.com/redhat-developer/vscode-java/issues/105).
* bug fix - fix errors when restoring deleted files from git. See [#109](https://github.com/redhat-developer/vscode-java/issues/109).
* bug fix - invalid locations for Workspace-wide errors. See [JLS#107](https://github.com/gorkem/java-language-server/issues/107).

## 0.0.7 (November 23rd, 2016)
* enhancement - basic Java support for standalone Java files. See [#27](https://github.com/redhat-developer/vscode-java/issues/27).
* enhancement - start Java Language Server when pom.xml is detected. See [#84](https://github.com/redhat-developer/vscode-java/issues/84).
* bug fix - fix out of synch error markers. See [#87](https://github.com/redhat-developer/vscode-java/issues/87)
* bug fix - fix missing generic types in autocompletion. See [#69](https://github.com/redhat-developer/vscode-java/issues/69).
* bug fix - fix ignored `jdt.ls.vmargs`. See [#88](https://github.com/redhat-developer/vscode-java/pull/88).

## 0.0.6 (November 1st, 2016)
* enhancement - auto-import packages referenced by code complete. See [#50](https://github.com/gorkem/java-language-server/issues/50).
* enhancement – report Java errors for all files project in the project. See [58](https://github.com/gorkem/java-language-server/issues/58).
* enhancement – display package names on code completion proposals for Types [#47] (https://github.com/gorkem/java-language-server/issues/47).
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
* enhancement - in addition to maven, we now support basic Eclipse projects. See [JLS#37](https://github.com/gorkem/java-language-server/issues/37).
* enhancement - go to Definition (<kbd>F12</kbd>) is enabled for libraries and can display Java code that is not part of project's source code
* enhancement - code complete triggers are added for `.#@` characters. See [#19](https://github.com/redhat-developer/vscode-java/issues/19).
* bug fix - opening a Maven project a 2nd time doesn't work. See [JLS#66](https://github.com/gorkem/java-language-server/issues/66).

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
