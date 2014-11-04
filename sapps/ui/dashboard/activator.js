(function(__) {

    var log = sjs.log.getLogger('sapps.ui.dashboard/activator.js');

    __.Activator = sjs.Class({
        start: function(ctx) {
            this.app = new __.App();
            this.app.start(ctx);
            ctx.services.register(sapps.api.ui.App, this.app, {
            	name:'dashboard',
            	url:'/',
            	label:'Dashboard'
            });

        },
        stop: function(ctx) {
            this.app.stop();
            this.app = null;
        }
    });
})(sapps.ui.dashboard);
