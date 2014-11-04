(function($osgi, $user) {


    $user.Activator = sjs.Class({
        start: function(ctx) {
            this.service = new $user.ServiceTracker(ctx, new $user.EventDispatcher(ctx));
            this.service.start();

        },
        stop: function(ctx) {
            this.service.stop();
        }
    });
})(sosgi.framework, sapps.core.user);
