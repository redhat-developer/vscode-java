'use strict';

import * as assert from 'assert';
import { getJavaConfiguration, getBuildFilePatterns, getInclusionPatternsFromNegatedExclusion, getExclusionGlob, convertToGlob } from '../../src/utils';
import { WorkspaceConfiguration } from 'vscode';
import { listJdks } from '../../src/jdkUtils';
import { platform } from 'os';

let exclusion: string[];
let isMavenImporterEnabled: boolean;
let isGradleImporterEnabled: boolean;

const config: WorkspaceConfiguration = getJavaConfiguration();
const IMPORT_EXCLUSION: string = "import.exclusions";
const IMPORT_MAVEN_ENABLED: string = "import.maven.enabled";
const IMPORT_GRADLE_ENABLED: string = "import.gradle.enabled";

suite('Utils Test', () => {

	suiteSetup(async function() {
		exclusion = config.get<string[]>(IMPORT_EXCLUSION, []);
		isMavenImporterEnabled = config.get<boolean>(IMPORT_MAVEN_ENABLED, true);
		isGradleImporterEnabled = config.get<boolean>(IMPORT_GRADLE_ENABLED, true);
	});

	test('getBuildFilePatterns() - Maven importer is enabled', async function () {
		await config.update(IMPORT_MAVEN_ENABLED, true);
		await config.update(IMPORT_GRADLE_ENABLED, false);

		const result: string[] = getBuildFilePatterns();

		assert.deepEqual(result, ["**/pom.xml"]);
	});

	test('getBuildFilePatterns() - all importers are enabled', async function () {
		await config.update(IMPORT_MAVEN_ENABLED, true);
		await config.update(IMPORT_GRADLE_ENABLED, true);

		const result: string[] = getBuildFilePatterns();

		assert.deepEqual(result, ["**/pom.xml", "**/*.gradle", "**/*.gradle.kts"]);
	});

	test('getBuildFilePatterns() - no importers is enabled', async function () {
		await config.update(IMPORT_MAVEN_ENABLED, false);
		await config.update(IMPORT_GRADLE_ENABLED, false);

		const result: string[] = getBuildFilePatterns();

		assert.deepEqual(result, []);
	});

	test('getInclusionPatternsFromNegatedExclusion() - no negated exclusions', async function () {
		await config.update(IMPORT_EXCLUSION, [
			"**/node_modules/**",
			"**/.metadata/**",
			"**/archetype-resources/**",
			"**/META-INF/maven/**"
		]);

		const result: string[] = getInclusionPatternsFromNegatedExclusion();

		assert.deepEqual(result, []);
	});

	test('getInclusionPatternsFromNegatedExclusion() - has negated exclusions', async function () {
		await config.update(IMPORT_EXCLUSION, [
			"**/node_modules/**",
			"!**/node_modules/test/**",
			"**/.metadata/**",
			"**/archetype-resources/**",
			"**/META-INF/maven/**"
		]);

		const result: string[] = getInclusionPatternsFromNegatedExclusion();

		assert.deepEqual(result, ["**/node_modules/test/**"]);
	});

	test('getExclusionGlob() - no negated exclusions', async function () {
		await config.update(IMPORT_EXCLUSION, [
			"**/node_modules/**",
			"**/.metadata/**",
			"**/archetype-resources/**",
			"**/META-INF/maven/**"
		]);

		const result: string = getExclusionGlob();

		assert.equal(result, "{**/node_modules/**,**/.metadata/**,**/archetype-resources/**,**/META-INF/maven/**}");
	});

	test('getExclusionGlob() - has negated exclusions', async function () {
		await config.update(IMPORT_EXCLUSION, [
			"**/node_modules/**",
			"!**/node_modules/test/**",
			"**/.metadata/**",
			"**/archetype-resources/**",
			"**/META-INF/maven/**"
		]);

		const result: string = getExclusionGlob();

		assert.equal(result, "{**/node_modules/**,**/.metadata/**,**/archetype-resources/**,**/META-INF/maven/**}");
	});

	test('convertToGlob() - no file patterns', async function () {
		const result: string = convertToGlob([]);
		assert.equal(result, "");
	});

	test('convertToGlob() - no base patterns', async function () {
		const result: string = convertToGlob(["**/pom.xml", "**/build.gradle"]);
		assert.equal(result, "{**/pom.xml,**/build.gradle}");
	});

	test('convertToGlob() - has base patterns', async function () {
		const result: string = convertToGlob(["**/pom.xml"], ["**/node_modules/test/**"]);
		assert.equal(result, "{**/node_modules/test/**/**/pom.xml}");
	});

	test('listJdks() - no /usr as Java home on macOS', async function () {
		// Skip this test if it's not macOS.
		if (platform() !== "darwin") {
			this.skip();
		}

		const jdks = await listJdks();
		assert.ok(jdks.every(jdk => jdk.homedir !== "/usr"));
	});

	teardown(async function() {
		await recover();
	});
});

async function recover(): Promise<void> {
	await config.update(IMPORT_EXCLUSION, exclusion);
	await config.update(IMPORT_MAVEN_ENABLED, isMavenImporterEnabled);
	await config.update(IMPORT_GRADLE_ENABLED, isGradleImporterEnabled);
}
