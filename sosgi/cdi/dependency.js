(function($cdi) {

    /**
     * Candinality: 0..1
     */
    var OptionalCardinality = function(dependency) {
        this._dependency = dependency;
        this._serviceCounter = 0;
        this._serviceId = null;
    };
    OptionalCardinality.prototype = {
        addingService: function(reference, service) {
            //console.debug('cdi.OptionalCardinality::addingService(reference)', reference);
            if (this._serviceId === null) {
                this._serviceId = reference.id;
                this._dependency.assignService(service);
            }
        },
        removedService: function(reference, service) {
            //console.debug('cdi.OptionalCardinality::removedService(reference)', reference);
            if (this._serviceId === reference.id) {
                this._serviceId = null;
                this._dependency.unassignService();
            }
        },
        isSatisfied: function() {
            return true;
        }
    };

    /**
     * Candinality: 1..1
     */
    var MandatoryCardinality = function(dependency) {
        this._dependency = dependency;
        this._serviceId = null;
    };
    MandatoryCardinality.prototype = {
        addingService: function(reference, service) {
            //console.debug('cdi.SingleCardinality::addingService(reference)', reference);
            if (this._serviceId === null) {
                this._serviceId = reference.id;
                this._dependency.assignService(service);
            }
        },
        removedService: function(reference, service) {
            //console.debug('cdi.SingleCardinality::removedService(reference)', reference);
            if (this._serviceId === reference.id) {
                this._serviceId = null;
                this._dependency.unassignService();
            }
        },
        isSatisfied: function() {
            return this._serviceId !== null;
        }
    };
    /**
     * Candinality: 0..n
     */
    var MultipleCardinality = function(dependency) {
        this._dependency = dependency;
    };
    MultipleCardinality.prototype = {
        addingService: function(reference, service) {
            //console.debug('cdi.MultipleCardinality::addingService(reference)', reference);
            this._dependency.bindService(reference, service);
        },
        removedService: function(reference, service) {
            //console.debug('cdi.MultipleCardinality::removedService(reference)', reference);
            this._dependency.unbindService(reference, service);
        },
        isSatisfied: function() {
            return true;
        }
    };
    /**
     * Candinality: 0..n
     */
    var MandatoryMultipleCardinality = function(dependency) {
        this._dependency = dependency;
        this._counter = 0;
    };
    MandatoryMultipleCardinality.prototype = {
        addingService: function(reference, service) {
            //console.debug('cdi.MandatoryMultipleCardinality::addingService(reference)', reference);
            this._counter++;
            this._dependency.bindService(reference, service);

        },
        removedService: function(reference, service) {
            // console.debug('cdi.MandatoryMultipleCardinality::removedService(reference)', reference);
            this._counter--;
            this._dependency.unbindService(reference, service);
        },
        isSatisfied: function() {
            return this._counter > 0;
        }
    };

    var getCardinality = function(dependency, cardinality) {
        switch (cardinality) {
            case '0..1':
                return new OptionalCardinality(dependency);
            case '1..1':
                return new MandatoryCardinality(dependency);
            case '0..n':
                return new MultipleCardinality(dependency);
            case '1..n':
                return new MandatoryMultipleCardinality(dependency);
        }
        throw new Error('Unknown candinality: ' + cardinality);
    };

    /**
     *
     * @param {sosgi.framework.BundleContext}
     * @param {sosgi.cdi.ComponentManager}
     * @param {Object} reference
     * @constructor
     */
    $cdi.DependencyManager = function(ctx, manager, reference) {
        //console.debug('sosgi.cdi.DependencyManager()');
        var cardinality = getCardinality(this, reference.cardinality);
        var tracker = ctx.services.tracker(reference.filter || reference.interface, cardinality);

        /**
         * Start dependency listener
         */
        this.open = function() {
            tracker.open();
        };

        /**
         * Stop dependency listener
         */
        this.close = function() {
            tracker.close();
        };

        /**
         *
         * @param {Object} service
         */
        this.bindService = function(ref, service) {
            manager.bindHandler(reference.bind, ref, service);
        };

        /**
         *
         * @param {Object} service
         */
        this.unbindService = function(ref, service) {
            manager.unbindHandler(reference.unbind, ref, service);
        };
        this.assignService = function(service) {
            manager.assignHandler(reference.assign, service);
        };

        /**
         *
         * @param {Object} service
         */
        this.unassignService = function(service) {
            manager.unassignHandler(reference.assign);
        };

        /**
         *
         * @returns {Boolean}
         */
        this.isSatisfied = function() {
            return cardinality.isSatisfied();
        };

    };
})(sosgi.cdi);
