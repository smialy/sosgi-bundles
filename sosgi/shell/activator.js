(function($sosgi, $shell) {

    var Command = function(ctx, shell, params) {
        $sosgi.api.Command.call(this, params);
        this.shell = shell;
        this.ctx = ctx;
    };
    Command.prototype = Object.create($sosgi.api.Command.prototype);

    $shell.Activator = function() {
        var shell, tracker;
        this.start = function(ctx) {
            shell = new $shell.Shell();
            ctx.services.register(sosgi.api.Shell, shell);
            tracker = ctx.services.tracker($sosgi.api.Command, {
                addingService: function(reference) {
                    shell.addCommand(ctx.service(reference));
                },
                removedService: function(reference) {
                    shell.removeCommand(ctx.service(reference));
                }
            }).open();
            for (var i = 0; i < $shell.cmds.length; i++) {
                ctx.services.register($sosgi.api.Command, new Command(ctx, shell, $shell.cmds[i]));
            }
        };
        this.stop = function(ctx) {
            shell = null;
            tracker.close();
        };
    };

})(sosgi, sosgi.shell);
