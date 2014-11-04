(function($shell) {

    $shell.Completer = function(shell) {
        this.shell = shell;
    };
    $shell.Completer.prototype = {
        complete: function(line, callback) {
            var args = line.trim().split(' ');
            //for one argument
            if (args.length === 0) {
                return;
            }
            var name = args.shift();
            var cnames = this.shell.getCommandsName();

            //all commands
            if (!name) {
                callback('', cnames);
                return;
            }

            var command = this.shell.getCommand(name);
            if (command) {
                if (typeof command.complete === 'function') {
                    command.complete(args, function(options) {
                        if (options.length === 1) {
                            callback(name + ' ' + options[0], []);
                        } else if (options.length > 1) {
                            callback(name + ' ' + intersection(options), options);
                        }

                    });
                }
            } else {
                //need suggest something
                var founded = [],
                    cname;
                for (var i = 0; i < cnames.length; i++) {
                    cname = cnames[i];
                    if (cname.indexOf(name) === 0) {
                        founded.push(cname);
                    }
                }
                callback(intersection(founded), founded.length > 1 ? founded : []);
            }
        }
    };

    /**
     *
     * @param {Array} items
     * @returns {String}
     */
    var intersection = function(items) {
        if (items.length === 0) {
            return '';
        }
        if (items.length === 1) {
            return items[0] + ' ';
        }

        var buff = '';
        var pos = 0;

        //more secure in loop - find shortes item
        var min = items[0].length;
        var i;
        for (i = 1; i < items.length; i++) {
            if (items[i].length < min) {
                min = items[i].length;
            }
        }
        while (pos < min) {
            var letter = null;
            for (i = 0; i < items.length; i++) {
                if (letter === null) {
                    letter = items[i].charAt(pos);
                    continue;
                }
                if (letter !== items[i].charAt(pos)) {
                    pos = min; //stop while
                    letter = '';
                    break;
                }

            }
            buff += letter;
            ++pos;
        }
        return buff;
    };
})(sosgi.shell);
