(function($api, $user) {

    $user.EventDispatcher = function sapps_osgi_user_EventDispatcher(ctx) {
        this._tracker = new sosgi.framework.tracker.ServiceTracker(ctx, $api.user.UserListener);
        this._tracker.open();

    };
    $user.EventDispatcher.prototype = {

        fire: function(type, user) {
            var event = new $api.user.UserEvent(type, user);
            var services = this._tracker.services;
            for (var i = 0, j = services.length; i < j; i++) {
                services[i].userEvent(event);
            }
        }
    };

})(sapps.api, sapps.core.user);
