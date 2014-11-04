(function($cdi) {

    /**
     * Wrapper for component
     */
    $cdi.ComponentsHandler = function(metadata) {
        var component = null;
        var methods = [];

        /**
         * Create and validate object
         *
         * @throw Error
         */
        this.create = function() {

            var Component;
            try {
                var Fn = Function;
                Component = (new Fn('return ' + metadata.class + ';'))();
            } catch (e) {
                throw createError('Not found definition.', e);
            }
            if (typeof Component !== 'function') {
                throw createError('Constructor is not function.');
            }

            try {
                component = new Component();
            } catch (e) {
                throw createError('Problem with creating object.', e);
            }

            if (typeof component[metadata.activate] !== 'function') {
                throw createError('Not found activate method: ' + metadata.activate);
            }
            if (typeof component[metadata.deactivate] !== 'function') {
                throw createError('Not found deactivate method: ' + metadata.deactivate);
            }

            var references = metadata.references;
            for (var i = 0; i < references.length; i++) {
                var reference = references[i];
                if (reference.bind !== null) {
                    if (typeof component[reference.bind] !== 'function') {
                        throw createError('Not found bind method: ' + reference.bind);
                    }
                    if (reference.bind === metadata.activate) {
                        throw createError('Method bind has activator name: ' + reference.bind);
                    }
                    if (reference.bind === metadata.deactivate) {
                        throw createError('Method bind has deactivator name: ' + reference.bind);
                    }
                    methods.include(reference.bind);
                }
                if (reference.unbind !== null) {
                    if (typeof component[reference.unbind] !== 'function') {
                        throw createError('Not found unbind method: ' + reference.unbind);
                    }
                    if (reference.unbind === metadata.activate) {
                        throw createError('Method unbind has activator name: ' + reference.unbind);
                    }
                    if (reference.unbind === metadata.deactivate) {
                        throw createError('Method unbind has deactivator name: ' + reference.unbind);
                    }
                    methods.include(reference.unbind);
                }
            }
            return component;
        };

        /**
         * Dispose created object
         */
        this.dispose = function() {
            component = null;
            methods = [];
        };

        /**
         * @param {String} name
         * @param {Object} reference
         * @return {Object}
         * @throw Error
         */
        this.invoke = function(name, reference, service) {
            if (component === null) {
                throw error('Not created object before invoke method.');
            }
            if (typeof component[name] !== 'function') {
                throw error('Incorect invoked method: ' + name);
            }
            if (!methods.contains(name)) {
                throw error('Not defined invoked method: ' + name);
            }
            //console.debug('cdi.HandlerComponet::invoke('+name+', service)',service);
            return component[name](reference, service);
        };

        /**
         * @param {String} name
         * @param {Object} service
         * @throw Error
         */
        this.set = function(name, service) {
            if (component === null) {
                throw error('Not created object before set variable.');
            }
            //console.debug('cdi.HandlerComponet::set('+name+', service)',service);
            //@TODO use methods
            component[name] = service;
        };

        /**
         * @param {String} name
         * @return {Object}
         * @throw Error
         */
        this.get = function(name) {
            if (component === null) {
                throw error('Not created object before get variable.');
            }
            //@TODO use methods
            return component[name] || null;
        };

        this.activate = function(ctx) {
            if (component === null) {
                throw error('Not created object before invoke activate method: ' + metadata.activate);
            }
            //console.debug('cdi.HandlerComponent::activate()');
            return component[metadata.activate](ctx);
        };
        this.deactivate = function(ctx) {
            if (component === null) {
                throw error('Not created object before invoke deactivate method: ' + metadata.deactivate);
            }
            // console.debug('cdi.HandlerComponent::deactivate()');
            return component[metadata.deactivate](ctx);
        };
        var error = function(reason, ex) {
            var name = metadata.name !== metadata.class ? metadata.name + '(' + (metadata.class) + ')' : metadata.name;
            return new Error('Some problem with component "' + name + '". ' + reason + ' (' + ex + ')', ex);
        };

        var createError = function(reason, ex) {
            component = null;
            methods = [];
            var name = metadata.name !== metadata.class ? metadata.name + '(' + (metadata.class) + ')' : metadata.name;
            return new Error('Can\'t create component "' + name + '". ' + reason + ' (' + ex + ')', ex);
        };

    };

})(sosgi.cdi);
