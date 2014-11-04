(function($ui, $framework, $api) {

    $ui.Activator = sjs.Class($framework.IActivator, {
        start: function(ctx) {

            var browser = new $ui.Browser(ctx.property('ui.browser'));
            var router = new $ui.Router(browser);
            ctx.services.register($api.ui.Router, router);

            this.handler = browser.url.change(function(url) {
                //console.log('browser.url.change('+url+')');
            });

            ctx.services.register($api.ui.Route, function(id) {

            }, {
                pattern: 'user/:id'
            });

            var routes = {};
            ctx.services.tracker(ctx, $api.ui.Route, {
                addingService: function(reference) {
                    var props = reference.properties;
                },
                removeService: function(reference) {

                }
            });
        },
        stop: function(ctx) {
            this.handler.remove();

        }
    });
})(sosgi.ui, sosgi.framework, sosgi.api);
