(function($framework, $cdi) {

    $cdi.ComponentsRegister = function() {
        this._managers = [];
    };
    $cdi.ComponentsRegister.prototype = {

        /**
         * @param {ComponentManager} manager
         */
        register: function(manager) {
            if (!this._managers.contains(manager)) {
                this._managers.push(manager);
            }
        },
        unregister: function(manager) {
            manager.close();
            this._managers.remove(manager);
        },
        removeBundle: function(bundleId) {
            var manager;
            for (var i = this._managers.length - 1; i >= 0; i--) {
                manager = this._managers[i];
                if (manager.bundle.id === bundleId) {
                    this.unregister(manager);
                }
            }
        },
        /**
         *
         */
        close: function() {
            for (var i = 0; i < this._managers.length; i++) {
                this._managers[i].close();
            }
            this._managers = [];
        }
    };

})(sosgi.framework, sosgi.cdi);
