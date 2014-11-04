(function($api, $login) {

    var log = sjs.log.getLogger('sapps.login.osgi/Tracker.js');

    var Tracker = function(ctx, ui) {
        this.ctx = ctx;
        this.ui = ui;
        this.ui.mediator = this;
    };
    Tracker.prototype = {
        start: function() {
            this._tuser = this.ctx.services.tracker($api.user.UserManager, this);
            this._tuser.open();
        },
        stop: function() {
            this._tuser.close();
        },
        login: function(login, password) {
            log.info('Tracker::login(' + login + ', ****');
            if (this.service) {
                this.ui.error('').wait(true);
                this.service.login(login, password).fail(function(msg){
                        this.ui.wait(false).error(msg || 'Some unexpected error. Try again.');
                }, this);

            }
        },
        addingService: function(ref, service) {

            log.info('Tracker::addingService(' + ref.name + ')');
            this.service = service;
        },
        removedService: function(ref, service) {
            log.info('Tracker::removedService(' + ref.name + ')');
            this.service = null;
        }
    };
    $login.Tracker = Tracker;
})(sapps.api, sapps.login);
