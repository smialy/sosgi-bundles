(function($sosgi, $cm) {

    var cmds = [{
        name: 'config:set',
        man: 'config:set <name> <value>',
        description: 'Set property',
        execute: function(args, out) {
            this.manager.setProperty(args[0], args[1]);
        }
    }, {
        name: 'config:list',
        man: 'config:list',
        description: 'Properties list',
        execute: function(args, out) {
            var stringify = function(obj) {
                if (typeof obj === 'function') {
                    return obj.valueOf();
                }
                return obj + '';
            };
            var props = this.manager.getProperties(),
                s = '';
            for (var name in props) {
                s += name + ' = ' + stringify(props[name]) + '\n';
            }
            out(s);
        }
    }];
    var Command = function(manager, params) {
        $sosgi.api.Command.call(this, params);
        this.manager = manager;
    };
    Command.prototype = Object.create($sosgi.api.Command.prototype);

    var Tracker = function(ctx) {

        var props = ctx.framework.properties();

        var services = [];
        var add = function(service) {
            services.push(service);
            service.updated(props);
        };
        var remove = function(reference) {
            services.remove(reference);
        };
        this.getProperties = function() {
            return ctx.framework.properties();
        };
        this.update = function(name, value) {
            if (name in props || props[name] !== value) {
                for (var i = 0; i < services.length; i++) {
                    services[i].updated(props);
                }
            }
        };
        this.close = function() {
            tracker.close();
        };
        var tracker = ctx.services.tracker($sosgi.api.ManagerService, {
            addingService: function(reference, service) {
                add(service);
            },
            removedService: function(reference, service) {
                remove(service);
            }
        });
        tracker.open();
    };

    var Manager = function(tracker) {
        this.setProperty = function(name, value) {
            tracker.update(name, value);
        };
        this.getProperties = function() {
            return tracker.getProperties();
        };
    };

    $cm.Activator = function() {
        var manager, tracker;
        this.start = function(ctx) {
            tracker = new Tracker(ctx);
            manager = new Manager(tracker);
            for (var i = 0; i < cmds.length; i++) {
                ctx.services.register($sosgi.api.Command, new Command(manager, cmds[i]));
            }
        };
        this.stop = function(ctx) {
            tracker.close();
            tracker = null;
            manager = null;
        };
    };

})(sosgi, sosgi.cm);
