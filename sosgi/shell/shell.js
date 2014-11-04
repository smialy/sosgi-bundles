(function($api, $shell) {

    /**
     *
     * @param {sosgi.framework.tracker.ServiceTracker}
     * @constructor
     */
    $shell.Shell = function() {
        this._commands = [];
        this._completer = new $shell.Completer(this);
    };
    $shell.Shell.prototype = {
        hasCommand: function(name) {
            for (var i = 0; i < this._commands.length; i++) {
                if (this._commands[i].name === name) {
                    return true;
                }
            }
            return false;
        },
        /**
         *
         * @param {Object|sosgi.api.Command} cmd
         */
        addCommand: function(cmd) {
            if (!cmd) {
                throw new Error('Expected argument: "cmd" in Shell::addCommand(): sosgi.api.Command | Object');
            }
            if (!(cmd instanceof $api.Command)) {
                cmd = new $api.Command(cmd);
            }
            if (this.hasCommand(cmd.name)) {
                throw new Error('Command(name= ' + cmd.name + ') is already registered');
            }
            this._commands.push(cmd);
        },
        /**
         *
         * @param {String|sosgi.api.Command} cmd Command or command name
         */
        removeCommand: function(cmd) {
            var msg = 'Expected argument: "cmd" in Shell::removeCommand(): sosgi.api.Command | String | Object';
            if (!cmd) {
                throw new Error(msg);
            }
            if (cmd instanceof $api.Command || typeof cmd.name === 'string') {
                cmd = cmd.name;
            }
            if (typeof cmd !== 'string') {
                throw new Error(msg);
            }
            for (var i = 0; this._commands.length; i++) {
                if (this._commands[i].name === cmd) {
                    this._commands.splice(i, 1);
                    return true;
                }
            }
            throw new Error('Not found command: ' + cmd);
        },
        /**
         * @return {Array} Return list of commands services
         */
        getCommands: function() {
            return this._commands.concat();
        },

        /**
         * @return {Array} Return list of commands services name
         */
        getCommandsName: function() {
            var buff = [];
            for (var i = 0, j = this._commands.length; i < j; i++) {
                buff.push(this._commands[i].name);
            }
            return buff;
        },

        /**
         * @param {String} name Command name
         */
        getCommand: function(name) {
            for (var i = 0, j = this._commands.length; i < j; i++) {
                var command = this._commands[i];
                if (command.name === name) {
                    return command;
                }
            }
            return null;
        },

        /**
         *
         * @param {String} name Command name
         * @return {String} Command usage
         */
        getCommandUsage: function(name) {
            var command = this.getCommand(name);
            if (command) {
                return command.man;
            }
            return '';
        },

        /**
         *
         * @param {String} name Command name
         * @return {String} Command description
         */
        getCommandDescription: function(name) {
            var command = this.getCommand(name);
            if (command) {
                return command.description;
            }
            return '';
        },

        /**
         *
         * @param {String} cmdLine
         * @param {Callback} out
         * @param {Callback} err
         */
        execute: function(cmdLine, out, err) {
            var args = cmdLine.split(' ');
            var cmdName = args.shift();
            if (cmdName) {
                var command = this.getCommand(cmdName);
                if (command) {
                    try {
                        command.execute(args, out, err);
                    } catch (e) {
                        err(e);
                    }
                } else {
                    err('Not found command: ' + cmdName);
                }
            } else {
                out('');
            }
        },
        complete: function(cmdLine, callback) {
            this._completer.complete(cmdLine, callback);
        }
    };

})(sosgi.api, sosgi.shell);
