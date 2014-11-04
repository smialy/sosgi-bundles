(function($cdi) {

    $cdi.ComponentsManager = function(ctx, bundle, metadata) {
        this.bundle = bundle;

        var deps = [];
        var register = null;
        var reference, dep;
        var isActivate = false;

        var registration;
        var handler = new $cdi.ComponentsHandler(metadata);
        var component = handler.create();

        for (var i = 0; i < metadata.references.length; i++) {
            reference = metadata.references[i];
            //console.log('Create cdi.DependencyManager(name=' + reference.name + ') for component: ' + metadata.name + '[' + metadata.class + ']');
            dep = new $cdi.DependencyManager(ctx, this, reference);
            deps.push(dep);
        }

        var error = function(reason, ex) {
            console.error('Component "' + metadata.name + (metadata.name !== metadata.class ? '(' + metadata.class + ')' : '') + '" error: ' + reason, ex);
        };

        this.open = function() {
            for (var i = 0; i < deps.length; i++) {
                deps[i].open();
            }
        };
        this.close = function() {
            for (var i = 0; i < deps.length; i++) {
                deps[i].close();
            }
            deps = [];
            toggle(false);
            handler.dispose();

        };
        var isSatisfied = function() {
            for (var i = 0; i < deps.length; i++) {
                if (!deps[i].isSatisfied()) {
                    return false;
                }
            }
            return true;
        };
        var toggle = function(state) {
            if (state) {
                if (!isActivate) {
                    isActivate = true;
                    try {
                        handler.activate(bundle.ctx);
                    } catch (e) {
                        error('component.activate()', e);
                    }
                    registration = ctx.services.register(metadata.interfaces, component, metadata.properties);
                }
            } else {
                if (isActivate) {
                    isActivate = false;
                    try {
                        handler.deactivate(bundle.ctx);
                    } catch (e) {
                        error('component.deactivate()', e);
                    }
                    if (registration) {
                        registration.unregister();
                        registration = null;
                    }
                }


            }
        };
        var checkDependency = function() {
            toggle(isSatisfied());
        };
        this.assignHandler = function(name, service) {
            handler.set(name, service);
            checkDependency();
        };
        this.unassignHandler = function(name) {
            checkDependency();
            handler.set(name, null);
        };
        this.bindHandler = function(name, reference, service) {
            try {
                handler.invoke(name, reference, service);
                checkDependency();
            } catch (e) {
                error('component.bindHandler(' + name + ')', e);
            }
        };
        this.unbindHandler = function(name, reference, service) {
            checkDependency();
            try {
                handler.invoke(name, reference, service);
            } catch (e) {
                error('component.unbindHandler(' + name + ')', e);
            }
        };

        if (deps.length === 0 || metadata.immediate) {
            toggle(true);
        }
    };

})(sosgi.cdi);
