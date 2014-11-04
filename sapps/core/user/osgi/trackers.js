(function($api, $user) {

    var log = sjs.log.getLogger('sapps.user/osgi/trackers.js');

    $user.ServiceTracker = function sapps_core_user_ServiceTracker(ctx, dispacher) {
        this._ctx = ctx;
        this._dispacher = dispacher;
    };
    $user.ServiceTracker.prototype = {
        start: function() {
            this._tracker = this._ctx.services.tracker($api.io.HttpConnection, this).open();
        },
        stop: function() {
            this._tracker.close();
            this._reg = null;
        },
        addingService: function(ref, service) {
            this._reg = this._ctx.services.register($api.user.UserManager, new $user.UserService(new $user.Repository(service), this._dispacher));
        },
        removedService: function(ref) {
            this._reg.unregister();
            this._reg = null;
        }
    };

})(sapps.api, sapps.core.user);
