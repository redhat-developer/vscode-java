# Not Covered Maven Plugin Execution

## Background
Some Maven projects use 3rd party Maven plugins to generate sources or resources, and you may find that the generated code is not picked up by the project classpath, or the Maven goals are not executed by Java extension. This is a known technical issue with `m2e`, the underlying Maven integration tool for Java extension. The reason is that the Maven tooling `m2e` doesn't know if it's safe to run your Maven plugin automatically during a workspace build, so it does not run them by default and requires explicit instructions on how to handle them. Learn more about this issue from the wiki about [Execution Not Covered](https://www.eclipse.org/m2e/documentation/m2e-execution-not-covered.html).

## Workaround
- Option 1: The best thing is still to request the Maven plugin authors to provide native integration with m2e. Here is a guideline on [how to make Maven plugins compatible with m2e](https://www.eclipse.org/m2e/documentation/m2e-making-maven-plugins-compat.html).

- Option 2: Use [build-helper-maven-plugin](http://www.mojohaus.org/build-helper-maven-plugin/usage.html) to explicitly add the unrecognized source folder to classpath.

```xml
<project>
  ...
  <build>
    <plugins>
      <plugin>
        <groupId>org.codehaus.mojo</groupId>
        <artifactId>build-helper-maven-plugin</artifactId>
        <version>3.2.0</version>
        <executions>
          <execution>
            <id>add-source</id>
            <phase>generate-sources</phase>
            <goals>
              <goal>add-source</goal>
            </goals>
            <configuration>
              <sources>
                <source>some directory</source>
                ...
              </sources>
            </configuration>
          </execution>
        </executions>
      </plugin>
    </plugins>
  </build>
</project>
```

- Option 3: Configure a lifecycle mapping metadata in pom.xml that explicitly tells m2e what to do with your plugin.

For example, add [a processing instruction in the pom.xml](https://www.eclipse.org/m2e/documentation/release-notes-17.html#new-syntax-for-specifying-lifecycle-mapping-metadata) like `<?m2e execute onConfiguration?>` to execute it on every project configuration update.

You can use quick fixes to generate the inline lifecycle mapping in pom.xml, or manually configure it in pom.xml. If it's yourself that manually configure it, you have to let VS Code update the project configuration as well. The command is `"Java: Reload Project"`.

```xml
<project>
  ...
  <build>
    <plugins>
      <plugin>
        <groupId>ro.isdc.wro4j</groupId>
        <artifactId>wro4j-maven-plugin</artifactId>
        <version>1.8.0</version>
        <executions>
          <execution>
            <?m2e execute onConfiguration?>
            <phase>generate-resources</phase>
            <goals>
              <goal>run</goal>
            </goals>
          </execution>
        </executions>
      </plugin>
    </plugins>
  </build>
</project>
```

If you have multiple Maven plugins that need to configure the lifecycle mapping metadata, you can also configure them together in a dedicated `pluginManagement` section.

```xml
<project>
  ...
  <build>
    <pluginManagement>
      <plugins>
        <!-- This plugin's configuration is used to store m2e settings only.
        It has no influence on the Maven build itself. -->
        <plugin>
          <groupId>org.eclipse.m2e</groupId>
          <artifactId>lifecycle-mapping</artifactId>
          <version>1.0.0</version>
          <configuration>
            <lifecycleMappingMetadata>
              <pluginExecutions>
                <pluginExecution>
                  <pluginExecutionFilter>
                    <groupId>ro.isdc.wro4j</groupId>
                    <artifactId>wro4j-maven-plugin</artifactId>
                    <versionRange>[1.8.0,)</versionRange>
                    <goals>
                      <goal>run</goal>
                    </goals>
                  </pluginExecutionFilter>
                  <action>
                    <execute>
                      <runOnConfiguration>true</runOnConfiguration>
                    </execute>
                  </action>
                </pluginExecution>
              </pluginExecutions>
            </lifecycleMappingMetadata>
          </configuration>
        </plugin>
      </plugins>
    </pluginManagement>
  </build>
</project>
```
