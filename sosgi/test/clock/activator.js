(function($clock) {


    var Command = function(clock, params) {
        sosgi.api.Command.call(this, params);
        this.clock = clock;
    };
    Command.prototype = Object.create(sosgi.api.Command.prototype);


    $clock.Activator = function() {

        var clock;
        this.start = function(ctx) {
            clock = new $clock.Clock();
            ctx.services.register('TimerListener', function(date) {
                clock.update(date);
            });

            ctx.services.register(sosgi.dev.ui.Notify, clock);
            for (var i = 0; i < $clock.cmds.length; i++) {
                ctx.services.register(sosgi.api.Command, new Command(clock, $clock.cmds[i]));
            }
        };
        this.stop = function(ctx) {
            clock.remove();
            clock = null;
        };
    };
})(sosgi.test.clock);
