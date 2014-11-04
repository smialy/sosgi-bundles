(function($login, osgi) {


    $login.Activator = sjs.Class({
        start: function(ctx) {

            this.ui = new $login.UI(document.querySelector('body'), ctx.bundle.resource('res/login.html'));
            this.tracker = new $login.Tracker(ctx, this.ui);
            this.tracker.start();
            this.ui.create();
        },
        stop: function(ctx) {
            this.tracker.stop();
            this.ui.remove();
            delete this.ui;
            delete this.tracker;
        }
    });
})(sapps.login, sosgi.framework);
