(function($shell) {

    $shell.cmds = [];
    $shell.cmds.push({
        name: 'shutdown',
        description: 'Shutdown application',
        man: 'shutdown <bundle.id>',
        execute: function(context) {

        }
    });

    $shell.cmds.push({
        name: 'install',
        description: 'Install bundle',
        man: 'install <bundle.namespace> (--autostart, -a)',
        execute: function(args) {
            var autostart = args.length === 2 ? args[1] === '-a' || args[1] === '--autostart' : false;
            this.ctx.bundles.install(args[0], autostart);
        }
    });
    $shell.cmds.push({
        name: 'reload',
        description: 'Reload bundle',
        man: 'reload <bundle.id> [-a, --auto-start]',
        execute: function(args, out, err) {
            if (args.length) {
                var sid = args.shift();
                if (!/([^0-9])/.test(sid)) {
                    sid = parseInt(sid, 10);
                }
                var autostart = false;
                if (args.length) {
                    var next = args.shift();
                    if (next === '-a' || next === '--auto-start') {
                        autostart = true;
                    } else {
                        err(this.getName() + ': Incorect option: ' + next);
                        return;
                    }
                }
                this.ctx.bundles.get(sid).reload(autostart);
            } else {
                err('Expected bundle: "id" or "namespace"');

            }

        }
    });
    $shell.cmds.push({
        name: 'uninstall',
        description: 'Uninstall bundle',
        man: 'uninstall <bundle.id>',
        execute: function(args, out) {
            var sid = args.shift();
            if (!/([^0-9])/.test(sid)) {
                sid = parseInt(sid, 10);
            }
            var bundle = this.ctx.bundles.get(sid);
            bundle.uninstall();
            out('Bundle: ' + bundle.meta.name + '(id=' + bundle.id + ' namespace=' + bundle.meta.namespace + ') unistalled');
        },
        complete: function(args, callback) {
            var ctx = this.ctx;
            var getNames = function() {
                var bundles = ctx.bundles.all();
                var buff = [];
                for (var i = 0; i < bundles.length; i++) {
                    buff.push(bundles[i].meta.namespace);
                }
                return buff;
            };
            if (args.length === 0) {
                callback(getNames());
                return;
            } else if (args.length === 1) {
                var name = args[0],
                    bnames = getNames(),
                    founded = [],
                    bname;
                for (var i = 0; i < bnames.length; i++) {
                    bname = bnames[i];
                    if (bname.indexOf(name) === 0) {
                        founded.push(bname);
                    }
                }
                callback(founded);
            }
        }
    });
    $shell.cmds.push({
        name: 'start',
        man: 'start <bundle.id>',
        description: 'Start bundle',
        execute: function(args, out) {
            var sid = args.shift();
            if (!/([^0-9])/.test(sid)) {
                sid = parseInt(sid, 10);
            }
            var bundle = this.ctx.bundles.get(sid);
            bundle.start();
            out('Bundle: ' + bundle.meta.name + '(id=' + bundle.id + ' namespace=' + bundle.meta.namespace + ') started');
        }
    });
    $shell.cmds.push({
        name: 'stop',
        description: 'Stop bundle',
        man: 'stop <bundle.id>',
        execute: function(args, out, err) {
            if (args.length) {
                var bid = args.shift();
                if (!/([^0-9])/.test(bid)) {
                    bid = parseInt(bid, 10);
                }
                var bundle = this.ctx.bundles.get(bid);
                bundle.stop();
                out('Bundle: ' + bundle.meta.name + '(id=' + bundle.id + ' namespace=' + bundle.meta.namespace + ') stopped');
            } else {
                err('Not found param: <bundle_id>');
            }
        }
    });
    $shell.cmds.push({
        name: 'ls',
        description: 'List of bundles',
        man: 'ls',
        execute: function(args, out, err) {
            var status = {
                1: 'UNINSTALLED',
                2: 'INSTALLED',
                4: 'RESOLVED',
                8: 'STARTING',
                16: 'STOPPING',
                32: 'ACTIVE'

            };
            var lengths = {
                id: 5,
                name: 20,
                version: 10,
                status: 10,
                namespace: 20
            };
            var space = function(len) {
                var s = '';
                while (len--) {
                    s += '=';
                }
                return s;
            };
            var pad = function(str, type) {
                var len = lengths[type] || 10;
                str += '';
                while (str.length < len) {
                    str += ' ';
                }
                return str;
            };
            var line = function(id, name, version, status, namespace) {
                return pad(id, 'id') + ' ' + pad(name, 'name') + ' ' + pad(version, 'version') + ' ' + pad(status, 'status') + ' ' + pad(namespace, 'namespace') + '\n';
            };
            var bundles = this.ctx.bundles.all(),
                bundle, i, j;
            for (i = 0, j = bundles.length; i < j; i++) {
                bundle = bundles[i];
                lengths['id'] = Math.max(lengths['id'], (bundle.id + '').length);
                lengths['name'] = Math.max(lengths['name'], bundle.meta.name.length);
                lengths['version'] = Math.max(lengths['version'], bundle.meta.version.length);
                lengths['status'] = Math.max(lengths['status'], status[bundle.state].length);
                lengths['namespace'] = Math.max(lengths['namespace'], bundle.meta.namespace.length);
            }
            var s = line('ID', 'Name', 'Version', 'Status', 'Namespace');
            s += space(s.length) + '\n';
            for (i = 0, j = bundles.length; i < j; i++) {
                bundle = bundles[i];
                s += line(bundle.id, bundle.meta.name, bundle.meta.version, status[bundle.state] || 'Unknown', bundle.meta.namespace);
            }
            out(s);
        }
    });

    $shell.cmds.push({
        name: 'help',
        description: 'Show help for command',
        man: 'help [bundle.name]',
        execute: function(args, out, err) {
            var s = '';
            if (args.length === 1) {
                var name = args[0];
                var cmds = this.shell.getCommands();
                for (var i = 0, j = cmds.length; i < j; i++) {
                    var cmd = cmds[i];
                    if (cmd.name === name) {
                        s = cmd.name + ' - ' + cmd.description + '\nUsage: \n  > ' + cmd.man + '\n';
                        break;
                    }
                }
            } else {
                s = 'Use: help <command>';
            }
            out(s);
        },
        complete: function(args, callback) {
            if (args.length === 0) {
                callback(this.shell.getCommandsName());
                return;
            } else if (args.length === 1) {
                var name = args[0];
                var cnames = this.shell.getCommandsName(),
                    founded = [],
                    cname;
                for (var i = 0; i < cnames.length; i++) {
                    cname = cnames[i];
                    if (cname.indexOf(name) === 0) {
                        founded.push(cname);
                    }
                }
                callback(founded);
            }
        }
    });

})(sosgi.shell);
