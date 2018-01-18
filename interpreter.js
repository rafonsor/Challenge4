var fs = require('fs'),
	os = require('os'),
	readline = require('readline'),
	util = require('util');


var timeouts = [];
var toTrigger = 0;


// Core functions reimplementation
console.log = function() {
	var args = Array.prototype.slice.call(arguments);

	if(!args.length)
		return;

	// String log
	if(typeof args[0] === 'string') {

		// Simple message
		if(args.length === 1)
			return process.stdout.write(args[0]+os.EOL);

		// Message with arguments
		return process.stdout.write(util.format.apply(null, args)+os.EOL);
	}

	// Other types
	for(var i = 0; i<arguments.length; i++)
		process.stdout.write(util.format.apply(null, null, args)+os.EOL);
};

setTimeout = function(what, delay) {
	var args = Array.prototype.slice.call(arguments,2);

	// Ensure callback is a (parseable) function
	if(typeof what === 'string') {
		var idx = what.indexOf('{');
		var endIdx = what.lastIndexOf('}');

		var res = parseFunction(what.substr(idx+1, endIdx - idx - 1));
		if(res && res.function) {
			what = res.function;
			args = res.args;
		}
	}

	if(typeof what !== 'function')
		return console.error('Invalid timeout function...');

	// Execute immediate
	if(!delay)
		return what.apply(null, args);	

	// Store remaining timeouts
	toTrigger++;
	timeouts.push({
		what: what,
		delay: delay,
		args: args,
		start: Date.now(),
		called: false 
	});
};


// Helper functions

checkTimeouts = function() {
	if(!timeouts.length)
		return;

	for (var i = timeouts.length - 1; i >= 0; i--) {
		var to = timeouts[i];

		if(to.called)
			continue;

		if(to.start + to.delay > Date.now())
			continue;

		// Execute timeout callback
		to.what.apply(null, to.args);

		to.called = true;
		toTrigger--;
	}
}

parseFunction = function(line) {
	if(!line.length)
		return;

	line = line.trim();
	var idx = line.indexOf('(');
	var endIdx = line.lastIndexOf(')');

	var func = line.substr(0, idx);
	var params = line.substr(idx+1, endIdx-idx-1);

	switch(func) {
		case 'console.log':
			return {
				function: console.log,
				args: [params]
			};
			break;

		case 'setTimeout':
			// Retrieve function to call
			var closingIdx = params.lastIndexOf('}');
			var call = params.substr(0, closingIdx+1);

			// Retrieve timeout delay and any eventual arguments
			var delay = 0;
			var args = [];
			var argsIdx = params.indexOf(',', closingIdx+2);

			if(argsIdx !== -1) {
				delay = parseInt(params.substr(closingIdx+2, argsIdx));
				args = params.substr(argsIdx+1).split(',');
			}
			else
				delay = parseInt(params.substr(closingIdx+2));
			
			// Set timeout
			setTimeout(call, delay, args);
			break;

		default:
			console.log('Unsupported function...');
			return false;
	}
}

// Parse cli arguments

if(process.argv.length !== 3) {
	console.error('No code file specified, exiting...');
	process.exit(1);
}

var path = process.argv[2];
if(!fs.existsSync(path)) {
	console.error('Provided file was not found, exiting...');
	process.exit();
}

if(!fs.statSync(path).size) {
	console.warn('Provided file is empty, nothing to execute.');
	process.exit();
}

// Parse file
var stream = fs.createReadStream(path);
var reader = readline.createInterface({
	input: stream
});

reader.on('line', (line) => {
	checkTimeouts();

	var result = parseFunction(line);
	if(result)
		result.function.apply(null, result.args);
});

reader.on('close', () => {
	// Finished reading file or console signal received

	// Wait for all timeouts to complete
	while(toTrigger)
		checkTimeouts();

	// Exit
	process.exit();
});