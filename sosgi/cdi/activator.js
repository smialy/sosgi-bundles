(function($framework, $cdi) {

    $cdi.Activator = function() {

        var tracker, register, manager;
        this.start = function(ctx) {
            register = new $cdi.ComponentsRegister(ctx);
            tracker = new $framework.tracker.BundleTracker(ctx, $framework.bundle.ACTIVE | $framework.bundle.REGISTERED, {
                addingBundle: function(bundle) {
                    var configs = bundle.meta.components || [];
                    var metadata, manager;

                    for (var i = 0; i < configs.length; i++) {
                        try {
                            metadata = $cdi.metadata(configs[i]);
                            manager = new $cdi.ComponentsManager(ctx, bundle, metadata);
                            register.register(manager);
                            manager.open();
                        } catch (e) {
                            console.error(bundle.toString(), e);
                        }
                    }
                },
                removedBundle: function(bundle) {
                    register.removeBundle(bundle.id);
                },
                modifiedBundle: function(bundle) {}
            }).open();
        };
        this.stop = function(ctx) {
            if (tracker) {
                tracker.close();
            }
            if (register) {
                register.close();
            }
        };
    };

})(sosgi.framework, sosgi.cdi);
