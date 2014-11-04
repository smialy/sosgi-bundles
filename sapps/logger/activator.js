(function($framework, logger) {

    logger.Activator = sjs.Class({
        start: function(ctx) {
            if (ctx.getProperty('debug', false)) {
                //add global logger
                var log = new sjs.log.getLogger();
                log.addHandler(new sjs.log.ConsoleHandler());

                this.service = new logger.Logger(ctx);
                this.service.start();

                var listener = new logger.LoggerListener();
                this.reg = ctx.services.register('sjs.osig.LoggerListener', listener);

            }
        },
        stop: function(ctx) {
            this.service.stop();
            this.reg.unregister();
        }
    });

})(sosgi.framework, sapps.logger);
