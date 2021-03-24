import * as path from 'path';
import { runTests } from 'vscode-test';
import * as fse from 'fs-extra';

async function main() {
	const testProjectOriginPath: string = path.join(__dirname, '..', '..', 'test', 'resources', 'projects', 'maven', 'salut');
	const testProjectPath: string = path.join(__dirname, '..', '..', 'test-temp');
	const settingsJsonPath: string = path.join(testProjectPath, '.vscode', 'settings.json');
	try {
		// The folder containing the Extension Manifest package.json
		// Passed to `--extensionDevelopmentPath`
		const extensionDevelopmentPath = path.resolve(__dirname, '../..');

		// run tests for standard mode
		await fse.copy(testProjectOriginPath, testProjectPath);
		await fse.ensureDir(path.join(testProjectPath, '.vscode'));
		await fse.writeJSON(settingsJsonPath, {
			"java.server.launchMode": "Standard",
			"java.configuration.updateBuildConfiguration": "automatic"
		});

		await runTests({
			extensionDevelopmentPath,
			extensionTestsPath: path.resolve(__dirname, './standard-mode-suite'),
			launchArgs: [
				testProjectPath,
				'--disable-extensions',
			]
		});

		// run tests for lightweight mode
		console.log("setup settings.json for lightweight mode...");
		await fse.writeJSON(settingsJsonPath, {
			"java.server.launchMode": "LightWeight",
		});

		console.log("running lightweight cases...");
		await runTests({
			extensionDevelopmentPath,
			extensionTestsPath: path.resolve(__dirname, './lightweight-mode-suite'),
			launchArgs: [
				testProjectPath,
				'--disable-extensions',
			]
		});
	} catch (err) {
		console.error(`Failed to run tests: ${err}`);
		process.exit(1);
	} finally {
		await fse.remove(testProjectPath);
	}
}

main();
