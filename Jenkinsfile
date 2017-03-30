#!/usr/bin/env groovy

def installBuildRequirements(){
	def nodeHome = tool 'nodejs-7.7.4'
	env.PATH="${env.PATH}:${nodeHome}/bin"
	sh "npm install -g typescript"
	sh "npm install -g vsce"
}

def buildVscodeExtension(){
	sh "npm install"
	sh "npm run vscode:prepublish"
}

def updateArchiveDownloadUrl(url){
	def downloadConfig = readJSON file: 'server_archive.json'
	downloadConfig.production.url = url
	writeJSON file:'server_archive.json', json: downloadConfig
}

node('rhel7'){
	stage 'Build JDT LS'
	git url: 'https://github.com/eclipse/eclipse.jdt.ls.git'
	def mvnHome = tool 'maven-3.3.9'
	sh "${mvnHome}/bin/mvn clean verify -B -U -fae -e -Pserver-distro"

	stage 'Upload Server to staging'
	def files = findFiles(glob: '**/org.eclipse.jdt.ls.product/distro/**.tar.gz')
	sh "rsync -Pzrlt --rsh=ssh --protocol=28 ${files[0].path} tools@10.5.105.197:/downloads_htdocs/jbosstools/jdt.ls/staging"
	stash name: 'server_distro',includes :files[0].path
	env.stageUrl = 'http://download.jboss.org/jbosstools/jdt.ls/staging/' + files[0].name

}

node('rhel7'){

	stage 'Checkout vscode-java code'
	deleteDir()
	git url: 'https://github.com/redhat-developer/vscode-java.git'

	stage 'Update server archive url to staging'
	updateArchiveDownloadUrl(env.stageUrl)

	stage 'install vscode-java build requirements'
	installBuildRequirements()

	stage 'Build vscode-java'
	buildVscodeExtension()

	stage 'Test vscode-java for staging'
	wrap([$class: 'Xvnc']) {
		sh "npm test --silent"
	}

	stage "Package vscode-java"
	def packageJson = readJSON file: 'package.json'
	sh "vsce package -o java-${packageJson.version}-${env.BUILD_NUMBER}.vsix"

	stage 'Upload vscode-java to staging'
	def vsix = findFiles(glob: '**.vsix')
	sh "rsync -Pzrlt --rsh=ssh --protocol=28 ${vsix[0].path} tools@10.5.105.197:/downloads_htdocs/jbosstools/jdt.ls/staging"
}

node('rhel7'){
	if(publishToMarketPlace.equals('true')){
		timeout(time:5, unit:'DAYS') {
			input message:'Approve deployment?', submitter: 'bercan'
		}
		stage 'Upload Server to release'
		unstash 'server_distro'
		def files = findFiles(glob: '**/org.eclipse.jdt.ls.product/distro/**.tar.gz')
		sh "rsync -Pzrlt --rsh=ssh --protocol=28 ${files[0].path} tools@10.5.105.197:/downloads_htdocs/tools/static/vscode"
		def prodUrl = 'http://download.jboss.org/jbosstools/static/vscode/' + files[0].name

		stage 'Checkout vscode-java for release build'
		deleteDir()
		git url: 'https://github.com/redhat-developer/vscode-java.git'

		stage 'Update server archive url to release'
		updateArchiveDownloadUrl(prodUrl)
		archive includes:"server_archive.json"

		stage 'install vscode-java build requirements'
		installBuildRequirements()

		stage 'Build vscode-java for release'
		buildVscodeExtension()

		stage 'Test vscode-java for release'
		wrap([$class: 'Xvnc']) {
			sh "npm test --silent"
		}

		stage "Publish to Marketplace"
		withCredentials([[$class: 'StringBinding', credentialsId: 'vscode_java_marketplace', variable: 'TOKEN']]) {
			sh "vsce publish -p $TOKEN"
		}
		archive includes:"**.vsix"
	}//if publishMarketPlace
}

