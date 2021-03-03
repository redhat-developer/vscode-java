# Change Log

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
 * other - Improve tracing capability of m2e through m2e.logback.configuration.. See [JLS#1589](https://github.com/eclipse/eclipse.jdt.ls/pull/1589).
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
* bug fixed  - add Java 13 support for Gradle projects. See [JLS#1196](https://github.com/eclipse/eclipse.jdt.ls/issues/1196).
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
