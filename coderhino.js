const PORT=3000;

var io = require('socket.io')(PORT);
var exec = require('child_process').exec;
var os = require('os');
var fs = require('fs');
var httpreq = require('httpreq');
var child;

io.on('connection', function(socket){
	console.log("client connected");

	socket.on('send_programNxt', function(filename){
		console.log("Command: " + os.tmpdir() + '/nbc.exe -d ' + filename);
		child = exec('cd ' + os.tmpdir() + ' && ' + os.tmpdir() + '/nbc.exe -d '+ filename, function(error, stdout, stderr){
			console.log('stdout: ' + stdout);
			console.log('stderr: ' + stderr);
			if(error !== null){
				console.log('exec error: ' + error);
				socket.emit("send_programNxtError");
			} else if(stderr){
				socket.emit("send_programNxtError");
				console.log("Cannot send program");
			} else {
				socket.emit("send_programNxtOk");
				console.log("Program sent");
			}
		});
	});

	socket.on('download', function(url, filename){
		httpreq.get(url, {binary: true}, function(err, res){
			if(err){
				socket.emit('file_downloadError', filename);
				console.log("Cannot download "+filename);
			} else {
				fs.writeFile(os.tmpdir() + '/' + filename, res.body, function(err){
					if(err){
						socket.emit('file_downloadError', filename);
						console.log("Cannot download " + filename);
					} else {
						socket.emit('file_downloaded', filename);
						console.log(filename + " downloaded");
					}
				});
			}
		});
	});

	socket.on('download_ifNotExists', function(url, filename){
		console.log("Verifying if " + filename + " exists");
		fs.stat(os.tmpdir() + '/' + filename, function(err, stat){
			if(err == null){
				socket.emit('file_downloaded', filename);
				console.log(filename + ' exists. Not downloaded.');
			} else {
				httpreq.get(url, {binary: true}, function(err, res){
					if(err){
						socket.emit('file_downloadError', filename);
						console.log("Cannot download " + filename);
					} else {
						fs.writeFile(os.tmpdir() + '/' + filename, res.body, function(err){
							if(err){
								socket.emit('file_downloadError', filename);
								console.log("Connot write " + filename + "to filesystem");
							} else {
								socket.emit('file_downloaded', filename);
								console.log(filename + " downloaded");
							}
						});
					}
				});
			}
		});
	});

	socket.on('write_tmpdir', function(content, filename){
		fs.writeFile(os.tmpdir() + '/' + filename, content, function(err){
			if(err){
				socket.emit('content_notWritten', filename);
				console.log('Connot write content to ' + filename);
			} else {
				socket.emit('content_written', filename);
				console.log(filename + ' written');
			}
		});
	});

	socket.on('disconnect', function(){
		console.log('Client disconnected');
	});
});