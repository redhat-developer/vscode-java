# Metadata Files Generation

We use the setting `java.import.generatesMetadataFilesAtProjectRoot` to control where the project metadata files(.project, .classpath, .factorypath, .settings/) will be generated:
- `true`: Metadata files will be generated at the project's root.
- `false`: Metadata files will be generated at the workspace storage. To be specifc, the path will be: `<WORKSPACE_STORAGE_PATH>/redhat.java/jdt_ws/.metadata/.plugins/org.eclipse.core.resources/.projects/<PROJECT_NAME>/`.

By default, the setting is set to `false`.

> If the metadata files exist in both the project root and the workspace storage, the extension will pick the files in the project root.

## Change the setting value

Depending on how you change the setting, some extra steps need to be taken to make the change take effect.

### Change from `false` to `true`
You need to restart the client.

### Change from `true` to `false`
1. Close the client.
2. Remove the metadata files in the project by your own.
3. Open the client.
