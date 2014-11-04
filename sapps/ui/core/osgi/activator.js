(function($core) {
	
	var log = sjs.log.getLogger('sapps.ui.core/activator.js');


    $core.Activator = sjs.Class({
        start: function(ctx) {
            var options = ctx.property('ui', {});
            var router = new $core.Router();
            var browser = new $core.Browser(options.browser);

            ctx.services.register(sapps.api.ui.Browser, browser, options.browser);
            
            browser.url.change(function(url){
                router.match(url);
            });
            var routes = {};
            ctx.services.tracker(sapps.api.ui.Route, {
                addingService:function(ref, service){
                    var props = ref.properties;
                    var route = routes[ref.id] = new $core.Route(props.match, props.rules, service); 
                    router.addRoute(route);
                },
                removedService:function(ref, service){
                    router.removeRoute(routes[ref.id]);
                }
            }).open();
            
        },
        stop: function(ctx) {
            routes = {};
            
        }
    });
})(sapps.ui.core);
