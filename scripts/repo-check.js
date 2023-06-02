const fs = require("fs");

const re = new RegExp(
	String.raw`"resolved":\s*"https://repository.engineering.redhat.com/nexus/repository/`,
	"g"
);

function main(args) {
	const fix = args.some((arg) => arg === "--fix");
	const filename = args.find((arg) => !arg.startsWith("--"));
	if (filename === undefined) {
		console.error("missing path to package-lock.json file");
		return 1;
	}

	const fn = fix ? runFix : runCheck;
	return fn(filename);
}

function runCheck(filename) {
	const data = fs.readFileSync(filename, { encoding: "utf-8" });

	if (re.test(data)) {
		console.error(
			`error: found references to repository.engineering.redhat.com in ${filename}. Please fix it with 'npm run repo:fix'`
		);
		return 1;
	}

	return 0;
}

function runFix(filename) {
	const data = fs.readFileSync(filename, { encoding: "utf-8" });
	const newData = data.replace(re, "");

	if (data !== newData) {
		fs.writeFileSync(filename, data.replace(re, `"resolved": "https://`), {
			encoding: "utf-8",
		});
		console.log(`successfully fixed ${filename}`);
	} else {
		console.log("nothing to fix");
	}

	return 0;
}

if (require.main === module) {
	process.exit(main(process.argv.slice(2)));
}
