(function(main, osgi) {

    main.Activator = sjs.Class({
        start: function(ctx) {
			this.app = new main.Application(ctx);
        },
        stop: function(ctx) {
            this.app.stop();
            delete this.app;
        }
    });
})(sapps.core.main, sosgi.framework);
