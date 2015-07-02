const PORT=3000;

var io = require('socket.io')(PORT);
var exec = require('child_process').exec;
var os = require('os');
var fs = require('fs');
var httpreq = require('httpreq');
var child;

io.on('connection', function(socket){
	console.log("client connected");

	socket.on('send_program', function(filename){
		child = exec(os.tmpdir() + '/nbc -d ' + os.tmpdir() + '/' + filename, function(error, stdout, stderr){
			console.log('stdout: ' + stdout);
			console.log('stderr: ' + stderr);
			if(error !== null){
				console.log('exec error: ' + error);
				socket.emit("send_programError");
			} else if(stderr){
				socket.emit("send_programError");
				console.log("Cannot send program");
			} else {
				socket.emit("send_programOk");
				console.log("Program sent");
			}
		});
	});

	socket.on('nbc_exists', function(){
		console.log('Verifying if nbc exists');
		fs.stat(os.tmpdir()+'/nbc', function(err, stat){
			if(err == null){
				socket.emit('nbc_ok');
				console.log("Nbc exists");
			} else {
				httpreq.get("http://www.roboeduc.com.br/nbc_linux_x64/nbc", {binary: true}, function(err, res){
					if(err){
						socket.emit('nbc_downloadError');
						console.log("Cannot download nbc");
					} else {
						fs.writeFile(os.tmpdir() + '/nbc', res.body, function(err){
							if(err){
								socket.emit('nbc_downloadError');
								console.log("Connot write nbc file");
							} else {
								socket.emit('nbc_ok');
								console.log("Nbc downloaded");
							}
						});
					}
				});
			}
		});
	});

	socket.on('program_download', function(program, filename){
		fs.writeFile(os.tmpdir() + '/' + filename, program, function(err){
			if(err){
				socket.emit('program_downloadError');
				console.log('Connot write program file');
			} else {
				socket.emit('program_ok');
				console.log('Program downloaded');
			}
		});
	});

	socket.on('disconnect', function(){
		console.log('client disconnected');
	});
});