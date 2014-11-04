(function(__) {
    var Class = sjs.Class;

    __.LoggerListener = sjs.Class({
        handle: function() {
            console.log(arguments);
        }
    });

    __.Logger = Class({
        init: function(ctx) {
            this.ctx = ctx;
        },
        start: function() {
            this.ctx.addFrameworkListener(this._frameworkListener);
            this.ctx.addBundleListener(this._bundleListener);
            this.ctx.addServiceListener(this._serviceListener);
        },
        stop: function() {
            this.ctx.removeFrameworkListener(this._frameworkListener);
            this.ctx.removeBundleListener(this._bundleListener);
            this.ctx.removeServiceListener(this._serviceListener);
        },
        _frameworkListener: function(event) {
            switch (event.type) {
                case sosgi.framework.event.STARTING:
                    console.log('Framework starting...');
                    break;
                case sosgi.framework.event.STARTED:
                    console.log('Framework started');
                    break;
            }
        },
        _bundleListener: function(event) {
            var bundle = event.bundle;
            switch (event.type) {
                case sosgi.framework.event.INSTALLING:
                    console.debug('Installing bundle:  ' + bundle.namespace + '(id=' + bundle.id + ')...');
                    break;
                case sosgi.framework.event.INSTALLED:
                    console.debug('Installed bundle:   ' + bundle.namespace + '(id=' + bundle.id + ')');
                    break;

                case sosgi.framework.event.STARTING:
                    console.debug('Starting bundle:    ' + bundle.namespace + '(id=' + bundle.id + ')...');
                    break;
                case sosgi.framework.event.STARTED:
                    console.debug('Started bundle:     ' + bundle.namespace + '(id=' + bundle.id + ')');
                    break;
                case sosgi.framework.event.STOPPING:
                    console.debug('Stoping bundle:     ' + bundle.namespace + '(id=' + bundle.id + ')');
                    break;
                case sosgi.framework.event.STOPPED:
                    console.debug('Stoped bundle:      ' + bundle.namespace + '(id=' + bundle.id + ')');
                    break;

                case sosgi.framework.event.UNINSTALLING:
                    console.debug('Uninstaling bundle:      ' + bundle.namespace + '(id=' + bundle.id + ')');
                    break;
                case sosgi.framework.event.UNINSTALLED:
                    console.debug('Uninstalled bundle:      ' + bundle.namespace + '(id=' + bundle.id + ')');
                    break;
            }
        },
        _serviceListener: function(event) {
            switch (event.type) {
                case sosgi.framework.event.REGISTERED:
                    console.debug('Registered service: ' + (event.reference.name));
                    break;
                case sosgi.framework.event.UNREGISTERED:
                    console.debug('Unregistered service: ' + (event.reference.name));
                    break;
            }
        }
    });

})(sapps.logger);
