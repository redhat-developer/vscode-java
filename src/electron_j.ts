
'use strict';
var path = require('path');
var os = require('os');
var net = require('net');
var cp = require('child_process');

function makeRandomHexString(length) {
    var chars = ['0', '1', '2', '3', '4', '5', '6', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
    var result = '';
    for (var i = 0; i < length; i++) {
        var idx = Math.floor(chars.length * Math.random());
        result += chars[idx];
    }
    return result;
}
function generatePipeName() {
    var randomName = 'vscode-' + makeRandomHexString(5);
    if (process.platform === 'win32') {
        return '\\\\.\\pipe\\' + randomName + '-sock';
    }
    // Mac/Unix: use socket file
    return path.join(os.tmpdir(), randomName + '.sock');
}
function generatePatchedEnv(env, stdInPipeName, stdOutPipeName) {
    // Set the two unique pipe names and the electron flag as process env
    var newEnv = {};
    for (var key in env) {
        newEnv[key] = env[key];
    }
    newEnv['STDIN_PIPE_NAME'] = stdInPipeName;
    newEnv['STDOUT_PIPE_NAME'] = stdOutPipeName;
    return newEnv;
}
function fork(modulePath, args, options, callback) {
    var callbackCalled = false;
    var resolve = function (result) {
        if (callbackCalled) {
            return;
        }
        callbackCalled = true;
        callback(null, result);
    };
    var reject = function (err) {
        if (callbackCalled) {
            return;
        }
        callbackCalled = true;
        callback(err, null);
    };

    // Generate two unique pipe names
    var stdInPipeName = generatePipeName();
    var stdOutPipeName = generatePipeName();
    
    var newEnv = generatePatchedEnv(options.env || process.env, stdInPipeName, stdOutPipeName);
    var childProcess;
    let streamInfo = {writer : null,
                      reader: null} ;
    // Begin listening to stdout pipe
    var serverOut = net.createServer(function (stream) {
            streamInfo.writer = stream;
            if(streamInfo.reader !== null){
                resolve(streamInfo);
            }
    });
    
    serverOut.listen(stdOutPipeName);
    var serverIn = net.createServer(function (stream) {
            streamInfo.reader = stream;
            if(streamInfo.writer !== null ){
                resolve(streamInfo);
            }
    });
    serverIn.listen(stdInPipeName);


    var serverClosed = false;
    var closeServer = function () {
        if (serverClosed) {
            return;
        }
        serverClosed = true;
        serverOut.close();
        serverIn.close();
    };
    // Create the process
    childProcess = cp.spawn(modulePath, args, {
        silent: true,
        cwd: options.cwd,
        env: newEnv,
        execArgv: options.execArgv
    });
    childProcess.stdout.on('data', function(data) {
        console.log('stdout: ' + data);
    });
    childProcess.stderr.on('data', function(data) {
        console.log('stderr: ' + data);
    });
    childProcess.once('error', function (err) {
        closeServer();
        reject(err);
    });
    childProcess.once('exit', function (err) {
        closeServer();
        reject(err);
    });
}
exports.fork = fork;
