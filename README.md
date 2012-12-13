# Logfile

A simple node program for writing and rotating logfile

	$ npm install -g logfile

The npm command will install a new program on your system called `logfile`

	$ logfile # print the help
	$ echo hello | logfile - # log hello to stdout

Basically `logfile` assumes someone is logging to its input stream. 
Per default it will stamp all of these log messages with a timestamp and an input type like so

	yyyy-mm-dd hh:mm:ss out  (the log message from stdin)

If the input stream consists of error logs you should use the `-e` option.
This will replace `out` with `err` in the above example.
If you think the log is too dull looking you can use the `-c` option to add some colors to it.

When you start the program you specify a filename you want to log to (use `-` if you want to log to stdout)

	$ logfile myapp.log

After a while you might want to rotate this log file as it gets bigger. Using logfile this is simple.
First move your current log (logfile will keep logging to the moved file).

	$ mv myapp.log myapp.log.backup

Then find the pid of your logfile process and send `SIGHUP` to it.
If you used the `-p` pidfile option you can find the pid there.

	$ kill -2 $(cat my-pidfile) # -2 is SIGHUP

Logfile will now start logging to `myapp.log` again and you can take `myapp.log.backup`
and move to a different location.
