'use strict';
const gulp = require('gulp');
const cp = require('child_process');
const decompress = require('gulp-decompress');
const download = require('gulp-download');
const request = require('request');
const glob = require('glob');
const fse = require('fs-extra');
const path = require('path');
const url = require("url");
const argv = require('minimist')(process.argv.slice(2));
const server_dir = '../eclipse.jdt.ls';
const originalTestFolder = path.join(__dirname, 'test', 'resources', 'projects', 'maven', 'salut');
const tempTestFolder = path.join(__dirname, 'test-temp');
const testSettings = path.join(tempTestFolder, '.vscode', 'settings.json');
//...

gulp.task('clean_jre', function(done) {
	if (fse.existsSync('./jre')) {
		fse.removeSync('./jre');
	}

	done();
});

// Pls update the latest JRE if a new JDK is announced.
const LATEST_JRE = 17;

/**
 * Usage:
 * npx gulp download_jre    // Download the latest JRE for the platform of the current running machine.
 * npx gulp download_jre --target darwin-x64 --javaVersion 17  // Download the specified JRE for the specified platform.
 *
 * Supported platforms:
 *  win32-x64,
 *  linux-x64,
 *  linux-arm64,
 *  darwin-x64,
 *  darwin-arm64
 */
gulp.task('download_jre', async function(done) {
	if (fse.existsSync('./jre')) {
		fse.removeSync('./jre');
	}

	const platformMapping = {
		"linux-arm64": "linux-aarch64",
		"linux-x64": "linux-x86_64",
		"darwin-arm64": "macosx-aarch64",
		"darwin-x64": "macosx-x86_64",
		"win32-x64": "win32-x86_64"
	}

	const targetPlatform = argv.target || process.platform + "-" + process.arch;
	if (targetPlatform && Object.keys(platformMapping).includes(targetPlatform)) {
		const javaVersion = (!argv.javaVersion || argv.javaVersion === "latest") ? LATEST_JRE : argv.javaVersion;
		console.log("Downloading justj JRE " + javaVersion + " for the platform " + targetPlatform) + "...";

		const manifestUrl = `https://download.eclipse.org/justj/jres/${javaVersion}/downloads/latest/justj.manifest`;
		// Download justj.manifest file
		const manifest = await new Promise(function(resolve, reject) {
			request.get(manifestUrl, function(err, response, body) {
				if(err || response.statusCode >= 400) {
					reject(err || `${response.statusCode} returned from ${manifestUrl}`);
				} else {
					resolve(String(body));
				}
			});
		});

		if (!manifest) {
			done(new Error(`Failed to download justj.manifest, please check if the link ${manifestUrl} is valid.`))
			return;
		}

		/**
		 * Here are the contents for a sample justj.manifest file:
		 * ../20211012_0921/org.eclipse.justj.openjdk.hotspot.jre.full.stripped-17-linux-aarch64.tar.gz
		 * ../20211012_0921/org.eclipse.justj.openjdk.hotspot.jre.full.stripped-17-linux-x86_64.tar.gz
		 * ../20211012_0921/org.eclipse.justj.openjdk.hotspot.jre.full.stripped-17-macosx-aarch64.tar.gz
		 * ../20211012_0921/org.eclipse.justj.openjdk.hotspot.jre.full.stripped-17-macosx-x86_64.tar.gz
		 * ../20211012_0921/org.eclipse.justj.openjdk.hotspot.jre.full.stripped-17-win32-x86_64.tar.gz
		 */
		const javaPlatform = platformMapping[targetPlatform];
		const list = manifest.split(/\r?\n/);
		const jreIdentifier = list.find((value) => {
			return value.indexOf("org.eclipse.justj.openjdk.hotspot.jre.full.stripped") >= 0 && value.indexOf(javaPlatform) >= 0;
		});

		if (!jreIdentifier) {
			done(new Error(`justj doesn't support the jre ${javaVersion} for the platform ${javaPlatform} (${targetPlatform}), please refer to the link ${manifestUrl} for the supported platforms.`));
			return;
		}

		const jreDownloadUrl = `https://download.eclipse.org/justj/jres/${javaVersion}/downloads/latest/${jreIdentifier}`;
		const parsedDownloadUrl = url.parse(jreDownloadUrl);
		const jreFileName = path.basename(parsedDownloadUrl.pathname)
								.replace(/[\.7z|\.bz2|\.gz|\.rar|\.tar|\.zip|\.xz]*$/, "");
		const idx = jreFileName.indexOf('-');
		const jreVersionLabel = idx >= 0 ? jreFileName.substring(idx + 1) : jreFileName;
		// Download justj JRE.
		await new Promise(function(resolve, reject) {
			download(jreDownloadUrl)
				.on('error', reject)
				.pipe(decompress({strip: 0}))
				.pipe(gulp.dest('./jre/' + jreVersionLabel))
				.on('end', resolve);
		});
	} else {
		console.log("[Error] download_jre failed, please specify a valid target platform via --target argument. Here are the supported platform list:");
		for (const platform of Object.keys(platformMapping)) {
			console.log(platform);
		}
	}

	done();
});

gulp.task('download_server', function(done) {
	fse.removeSync('./server');
	download("http://download.eclipse.org/jdtls/snapshots/jdt-language-server-latest.tar.gz")
		.pipe(decompress())
		.pipe(gulp.dest('./server'));
	done();
});

gulp.task('build_server', function(done) {
	fse.removeSync('./server');
	cp.execSync(mvnw() + ' -Pserver-distro clean package -Declipse.jdt.ls.skipGradleChecksums', { cwd: server_dir, stdio: [0, 1, 2] });
	gulp.src(server_dir + '/org.eclipse.jdt.ls.product/distro/*.tar.gz')
		.pipe(decompress())
		.pipe(gulp.dest('./server'));
	done();
});

gulp.task('dev_server', function(done) {
	let command = mvnw() + ' -o -pl org.eclipse.jdt.ls.core,org.eclipse.jdt.ls.target clean package -Declipse.jdt.ls.skipGradleChecksums';
	console.log('executing '+command);
	cp.execSync(command, {cwd:server_dir, stdio:[0,1,2]} );
	glob.Glob(server_dir +'/org.eclipse.jdt.ls.core/target/org.eclipse.jdt.ls.core-*-SNAPSHOT.jar',
	    (_error, sources) => {
			glob.Glob('./server/plugins/org.eclipse.jdt.ls.core_*.jar',
				(_error, targets) => {
					console.log('Copying '+sources[0]+ ' to '+targets[0]);
					fse.copy(sources[0], targets[0]);
			});
	});
	done();
});

gulp.task('watch_server',function(done) {
	gulp.watch(server_dir+'/org.eclipse.jdt.ls.core/**/*.java', gulp.series('dev_server'));
	done();
});

gulp.task('generate_standard_test_folder', function(done) {
	fse.copySync(originalTestFolder, tempTestFolder);
	fse.ensureDirSync(path.join(tempTestFolder, '.vscode'));
	fse.writeJSONSync(testSettings, {
		"java.server.launchMode": "Standard",
		"java.configuration.updateBuildConfiguration": "automatic"
	});
	done();
});

gulp.task('generate_lightweight_test_folder', function(done) {
	fse.copySync(originalTestFolder, tempTestFolder);
	fse.ensureDirSync(path.join(tempTestFolder, '.vscode'));
	fse.writeJSONSync(testSettings, {
		"java.server.launchMode": "LightWeight",
	});
	done();
});

gulp.task('clean_test_folder', function(done) {
	fse.removeSync(tempTestFolder);
	done();
});

function isWin() {
	return /^win/.test(process.platform);
}

function isMac() {
	return /^darwin/.test(process.platform);
}

function isLinux() {
	return /^linux/.test(process.platform);
}

function mvnw() {
	return isWin()?"mvnw.cmd":"./mvnw";
}
