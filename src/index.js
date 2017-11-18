/*
	- Install nodeJs on your system.
	- Open a console/terminal in "lib/" folder.
	- run "npm start" or "node <scriptname>" if the node modules are installed.
	- The archive is created in "release/" folder.
*/

/* -------------------------------------------- Includes ---------------------------------------------------- */
var request 	= require("request");
var fs 			= require('fs-extra')
var ini 		= require('ini');
var https 		= require('https');
var	query 		= require('cli-interact').getYesNo;
var extract 	= require('extract-zip');
var chalk 		= require('chalk');
var prompt 		= require('prompt');
var dir 		= require('node-dir');
var projectRoot = __dirname.replace(/\\[^\\]+\\?$/,'');
//var inquirer 	= require('inquirer');
var homeDir		= require('os').homedir();
var tempDir 	= require('os').tmpdir();
const { lstatSync, readdirSync } = require('fs-extra');
const { join } 	= require('path');

/* --------------------------------- Global variables and initilizations------------------------------------- */
var projectAppFilesDir 	= homeDir + "\\Documents\\Neversink-ItemFilter-Updater";
var downloadDest		= tempDir + "\\Neversink-ItemFilter-Updater"
var repoOwner 			= "NeverSinkDev";
var repoProject 		= "NeverSink-Filter";
var style 				= "";
var config 				= {};
fs.ensureDirSync(projectAppFilesDir);
readIni(); 


/*
var gitPath			= projectPath + ".git/";
var config 			= ini.parse(fs.readFileSync(gitPath + 'config', 'utf-8'));
var repositoryURL 	= removeGitExtension(config['remote "origin"'].url);
var repositoryURLParts = repositoryURL.split('/');
var repoOwner 		= repositoryURLParts[repositoryURLParts.length-2];
var repoProject 	= repositoryURLParts[repositoryURLParts.length-1];
var apiUrl			= "https://api.github.com/repos/" + repoOwner + "/" + repoProject + "/releases";
var versionFile 	= (repoProject.toUpperCase() == "PoE-TradeMacro".toUpperCase()) ? projectPath + "resources/VersionTrade.txt" : projectPath + "resources/Version.txt";
if (repoProject.toUpperCase() == "PoE-TradeMacro".toUpperCase()) {
	filesToDelete.push("Run_ItemInfo.ahk");	
}
var version			= "";
var downloadDest 	= projectPath + "release";
var selectedBranch	= "master";
var downloadFile 	= "/" + selectedBranch + ".zip";
var branchList		= [];
*/

downloadRelease();


function readIni() {
	if (!fs.existsSync(projectAppFilesDir + "\\config.ini")) {
		cfg = "[General]\r\nrepoOwner=NeverSinkDev\r\nrepoProject=NeverSink-Filter\r\ndefault=";
		fs.writeFileSync(projectAppFilesDir + "\\config.ini", cfg);
		repoOwner	= "NeverSinkDev";
		repoProject = "NeverSink-Filter";
	} else {
		config = ini.parse(fs.readFileSync(projectAppFilesDir + '\\config.ini', 'utf-8'));
		repoOwner	= config.General.repoOwner;
		repoProject	= config.General.repoProject;
		style		= config.General.default;
	}	
}

function downloadRelease(cb) {
	downloadUrl		= "https://codeload.github.com/" + repoOwner + "/" + repoProject + "/zip/master";		
	downloadFile	= "\\master.zip";
	dest			= downloadDest + downloadFile;	
	fs.ensureDirSync(downloadDest);
	fs.emptyDirSync(downloadDest);

	var file = fs.createWriteStream(dest);
	var request = https.get(downloadUrl, function(response) {
		response.pipe(file);
		file.on('finish', function() {
			file.close(cb);  // close() is async, call cb after close completes.
			console.log(chalk.green(" Finished download."));
			console.log("");
			handleDownloadedZipFile(dest);
		});
	}).on('error', function(err) { // Handle errors
		fs.unlink(dest); // Delete the file async. (But we don't check the result)
		console.log(chalk.red(" Error while downloading file."));		
		if (cb) cb(err.message);
		exitScript(1);
	});
}

function handleDownloadedZipFile(file) {
	extract(file, {dir: downloadDest}, function (err) {
		if(err) {
			console.log(err.message);
			copyFilterFilesToPoEUserDir();
		} else {
			console.log(chalk.green(" Extracted zip-archive") + " to "  + downloadDest + ".");
			
			// rename extracted folder.			
			var extractedFolderOld = downloadDest + "\\" + repoProject + "-master";
			var extractedFolderNew = downloadDest + "\\master";
			fs.renameSync(extractedFolderOld, extractedFolderNew);			
	
			copyFilterFilesToPoEUserDir(downloadDest + "\\master");
		}		
	})
}

function copyFilterFilesToPoEUserDir(directory) {
	if (fs.existsSync(directory)) {		
		//var files = dir.files(directory, {sync:true, recursive:false, shortName: true});
		//console.log(files);
		var files = {};
		
		var files.subDirectories = dir.subdirs(directory, function(err, subdirs) {
			if (err) throw err;
			var returnDirs = [];
			subdirs.forEach(function(name, index){
				name = name.substr(directory.length + 1, name.length);
				if (name.indexOf("\\") === -1 && name.match(/style/ig)) {
					returnDirs.push(name);
				}				
			});
			return returnDirs
		});
		
		files.subDirectories.forEach(function(name, index){
							
		});
		
		var files.files = dir.files(directory, {sync:true, recursive:false, shortName: true});
		
		
		//var files = dir.files(dire, {sync:true});
		//console.log(files);
	
		/*
		inquirer.prompt([{
			type: 'list',
			name: 'branch',
			message: 'Select remote branch:',
			choices: branchList,
			default : 'master'
		}])
		.then(function (answers) {
			selectedBranch = answers.branch;
			downloadUrl = "https://codeload.github.com/" + repoOwner + "/" + repoProject + "/zip/" + selectedBranch;		
			downloadFile = "/" + selectedBranch + ".zip";
			download(downloadUrl, downloadDest + downloadFile);
		});	
		*/
	} else {
		console.log(chalk.red(" Folder ") + downloadDest + "\\master" + chalk.red(" doesn't exist. Exiting script."));
		exitScript();
	}
}

function exitScript(code = 0) {
	fs.emptyDirSync(downloadDest);
	console.log(chalk.red(" Exiting script."));
	process.exit(code);	
}