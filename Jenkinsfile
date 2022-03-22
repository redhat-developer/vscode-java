#!/usr/bin/env groovy

def installBuildRequirements(){
	def nodeHome = tool 'nodejs-14.19.1'
	env.PATH="${env.PATH}:${nodeHome}/bin"
	sh "npm install -g typescript"
	sh 'npm install -g "vsce"'
}

def buildVscodeExtension(){
	sh "npm install"
	sh "npm run vscode:prepublish"
}

def publishToVSCodeMarketplace(vsix){
	withCredentials([[$class: 'StringBinding', credentialsId: 'vscode_java_marketplace', variable: 'TOKEN']]) {
		// Clean up embedded jre folder from previous build
		sh 'npx gulp clean_jre'
		// Publish a generic version
		sh 'vsce publish -p ${TOKEN} --target win32-ia32 win32-arm64 linux-armhf alpine-x64 alpine-arm64'

		// Publish platform specific versions
		unstash 'platformVsix'
		def platformVsixes = findFiles(glob: '**.vsix', excludes: vsix[0].path)
		for(platformVsix in platformVsixes){
			sh 'vsce publish -p ${TOKEN}' + " --packagePath ${platformVsix.path}"
		}
	}
}

node('rhel8'){
	stage 'Build JDT LS'

	env.JAVA_HOME="${tool 'openjdk-11'}"
	env.PATH="${env.JAVA_HOME}/bin:${env.PATH}"
	sh 'java -version'

	git url: 'https://github.com/eclipse/eclipse.jdt.ls.git'
	sh "./mvnw clean verify -B -U -e -Pserver-distro -Dtycho.disableP2Mirrors=true -DskipTests -P!jboss-maven-repos,!redhat-ga-repository,!redhat-ea-repository"

	def files = findFiles(glob: '**/org.eclipse.jdt.ls.product/distro/**.tar.gz')
	stash name: 'server_distro', includes :files[0].path
}

node('rhel8'){
	env.JAVA_HOME="${tool 'openjdk-11'}"
	env.PATH="${env.JAVA_HOME}/bin:${env.PATH}"
	stage 'Checkout vscode-java code'
	deleteDir()
	git url: 'https://github.com/redhat-developer/vscode-java.git'

	stage 'install vscode-java build requirements'
	installBuildRequirements()

	stage 'Build vscode-java'
	buildVscodeExtension()
	unstash 'server_distro'
	def files = findFiles(glob: '**/org.eclipse.jdt.ls.product/distro/**.tar.gz')
	sh "rm -rf ./out"
	sh "mkdir ./server"
	sh "tar -xvzf ${files[0].path} -C ./server"

	if (!publishToMarketPlace.equals('true')) {
		sh "node ./scripts/prepare-nightly-build.js"
		sh "mv ./package.insiders.json ./package.json"
	}
	stage "Package vscode-java"
	def packageJson = readJSON file: 'package.json'
	env.EXTENSION_VERSION = "${packageJson.version}"
	sh "vsce package ${publishToMarketPlace.equals('true') ? "" : "--pre-release"} -o java-${env.EXTENSION_VERSION}-${env.BUILD_NUMBER}.vsix"

	stage 'Test vscode-java for staging'
	wrap([$class: 'Xvnc']) {
		sh "npm run compile" //compile the test code too
		env.SKIP_COMMANDS_TEST="true"
		sh "npm test --silent"
	}

	def vsix = findFiles(glob: '**.vsix')
	stash name:'vsix', includes:vsix[0].path

	// Package platform specific versions
	stage "Package platform specific vscode-java"
	def platforms = ["win32-x64", "linux-x64", "linux-arm64", "darwin-x64", "darwin-arm64"]
	def embeddedJRE = 17
	for(platform in platforms){
		sh "npx gulp download_jre --target ${platform} --javaVersion ${embeddedJRE}"
		sh "vsce package ${publishToMarketPlace.equals('true') ? "" : "--pre-release"} --target ${platform} -o java-${platform}-${env.EXTENSION_VERSION}-${env.BUILD_NUMBER}.vsix"
	}
	stash name:'platformVsix', includes:'java-win32-*.vsix,java-linux-*.vsix,java-darwin-*.vsix'

	stage 'Upload vscode-java to staging'
	def artifactDir = "java-${env.EXTENSION_VERSION}-${env.BUILD_NUMBER}"
	sh "mkdir ${artifactDir}"
	sh "mv *.vsix ${artifactDir}"

	sh "sftp ${UPLOAD_LOCATION}/jdt.ls/staging <<< \$'mkdir ${artifactDir}\nput -r ${artifactDir}'"
	// Clean up build vsix
	sh "rm -rf ${artifactDir}"
}

node('rhel8'){
	if(publishToMarketPlace.equals('true')){
		timeout(time:5, unit:'DAYS') {
			input message:'Approve deployment?', submitter: 'fbricon,rgrunber'
		}

		stage "Publish to Open-vsx Marketplace"
		unstash 'vsix'
		def vsix = findFiles(glob: '**.vsix')
		// Open-vsx Marketplace
		sh 'npm install -g "ovsx@<0.3.0"'
		withCredentials([[$class: 'StringBinding', credentialsId: 'open-vsx-access-token', variable: 'OVSX_TOKEN']]) {
			sh 'ovsx publish -p ${OVSX_TOKEN}' + " ${vsix[0].path}"
		}

		stage "Publish to VS Code Marketplace"
		// VS Code Marketplace
		publishToVSCodeMarketplace(vsix)

		stage "Publish to http://download.jboss.org/jbosstools/static/jdt.ls/stable/"
		def artifactDir = "java-${env.EXTENSION_VERSION}"
		sh "mkdir ${artifactDir}"
		sh "mv *.vsix ${artifactDir}"

		archive includes:"${artifactDir}/**/*.*"

		// copy this stable build to Akamai-mirrored /static/ URL, so staging can be cleaned out more easily
		sh "sftp ${UPLOAD_LOCATION}/static/jdt.ls/stable/ <<< \$'mkdir ${artifactDir}\nput -r ${artifactDir}'"
	} else {
		stage "Publish pre release to VS Code Marketplace"
		unstash 'vsix'
		def vsix = findFiles(glob: '**.vsix')
		publishToVSCodeMarketplace(vsix)
	}
}
