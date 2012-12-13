#!/usr/bin/env node

var stamp = require('stamp-stream');
var optimist = require('optimist');
var fs = require('fs');

var argv = optimist
	.usage('Usage: $0 filename [options]\n\nPipe to stdout by setting filename to -\nSend SIGHUP to reset the log stream after rotating log files')
	.alias('c', 'colors')
	.describe('c', 'use ansi colors in the log')
	.alias('e', 'error')
	.describe('e', 'is an error stream')
	.alias('n', 'name')
	.describe('n', 'include a custom name in log')
	.alias('p', 'pidfile')
	.describe('p', 'save pid to a pidfile')
	.alias('r', 'raw')
	.describe('r', 'do not stamp the log messages')
	.alias('h', 'help')
	.describe('h', 'show this help')
	.argv;

if (argv.help || !argv._.length) return optimist.showHelp();

var FILE = argv._[0] !== '-' && argv._[0];
var NAME = argv.name === true ? require('os').hostname() : argv.name;
var OUTPUT_TYPE = argv.error ? 'err' : 'out';
var OUTPUT_COLOR = argv.error ? '31' : '32';

var prefix = ' ';

prefix +=  argv.colors ? '\x1B['+OUTPUT_COLOR+'m'+OUTPUT_TYPE+'\x1B[39m' : OUTPUT_TYPE;
prefix += ' ';

if (argv.name) prefix += (argv.colors ? '\x1B[36m'+NAME+'\x1B[39m' : NAME)+' ';

prefix += ' ';

var pad = function(n) {
	return n < 10 ? '0'+n : ''+n;
};

var time = function(d) {
	var str = d.getUTCFullYear()+'-'+pad(d.getUTCMonth()+1)+'-'+pad(d.getUTCDate())+
		' '+pad(d.getUTCHours())+':'+pad(d.getUTCMinutes())+':'+pad(d.getUTCSeconds());

	return argv.colors ? '\x1B[90m'+str+'\x1B[39m' : str;
};

var secs = function(d) {
	return Math.floor(d.getTime() / 1000);
};

var then;
var cached;

var s = stamp(!argv.raw && function() {
	var now = new Date();

	if (then && secs(now) === secs(then)) return cached;

	then = now;
	cached = new Buffer(time(now)+prefix);

	return cached;
});

var out;
var pipe = function() {
	if (!FILE) return s.pipe(process.stdout);
	if (out) out.end();
	out = fs.createWriteStream(FILE, {flags:'a'});
	s.pipe(out);
};

process.stdin.pipe(s);

if (argv.pidfile) fs.writeFile(argv.pidfile, ''+process.pid);
if (FILE) process.on('SIGHUP', pipe);

pipe();
