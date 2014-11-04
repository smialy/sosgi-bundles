(function($cdi) {
    'use strict';

    module('sosgi.cdi.component', {
        setup: function() {
            $cdi.test = {};
            $cdi.test.Simple = function() {
                this.test = function(data) {
                    return 'test:' + data;
                };
                this.activate = function() {
                    return 'test:activate';
                };
                this.deactivate = function() {
                    return 'test:deactivate';
                };
                this.oactivate = {};
                this.odeactivate = {};
            };
            $cdi.test.Error = function() {
                throw new Error('error');
            };
        },
        teardown: function() {
            $cdi.test = null;
        }
    });

    test('incorect init', function() {

        throws(function() {
            var component = new $cdi.ComponentsHandler();
            component.create();
        }, 'Miss metadata');

        throws(function() {
            var component = new $cdi.ComponentsHandler({});
            component.create();
        }, 'Miss metadata data');

        throws(function() {
            var component = new $cdi.ComponentsHandler({
                'class': 'sosgi.cdi.test'
            });
            component.create();
        }, 'Class should be function');

        throws(function() {
            var component = new $cdi.ComponentsHandler({
                'class': 'sosgi.cdi.test.Error'
            });
            component.create();
        }, 'Error constructor ');

        throws(function() {
            var component = new $cdi.ComponentsHandler({
                'class': 'sosgi.cdi.test.Simple',
                'activate': 'miss'
            });
            component.create();
        }, 'Miss activate methods');

        throws(function() {
            var component = new $cdi.ComponentsHandler({
                'class': 'sosgi.cdi.test.Simple',
                'activate': 'activate',
                'deactivate': 'miss'
            });
            component.create();
        }, 'Miss deactivate methods');

        throws(function() {
            var component = new $cdi.ComponentsHandler({
                'class': 'sosgi.cdi.test.Simple',
                'activate': 'oactivate',
                'deactivate': 'deactivate'
            });
            component.create();
        }, 'Activate methods should be function');

        throws(function() {
            var component = new $cdi.ComponentsHandler({
                'class': 'sosgi.cdi.test.Simple',
                'activate': 'activate',
                'deactivate': 'odeactivate',
                'references': []
            });
            component.create();
        }, 'Deactivate methods should be function');

        throws(function() {
            var component = new $cdi.ComponentsHandler({
                'class': 'sosgi.cdi.test.Simple',
                'activate': 'activate',
                'deactivate': 'deactivate',
                'references': [{
                    'bind': 'miss',
                }]
            });
            component.create();
        }, 'Miss bind methods');

        throws(function() {
            var component = new $cdi.ComponentsHandler({
                'class': 'sosgi.cdi.test.Simple',
                'activate': 'activate',
                'deactivate': 'deactivate',
                'references': [{
                    'bind': 'activate',
                    'unbind': 'test'
                }]
            });
            component.create();
        }, 'Bind methods has activator name');
        throws(function() {
            var component = new $cdi.ComponentsHandler({
                'class': 'sosgi.cdi.test.Simple',
                'activate': 'activate',
                'deactivate': 'deactivate',
                'references': [{
                    'bind': 'deactivate',
                    'unbind': 'test'
                }]
            });
            component.create();
        }, 'Bind methods has deactivator name');

        throws(function() {
            var component = new $cdi.ComponentsHandler({
                'class': 'sosgi.cdi.test.Simple',
                'activate': 'activate',
                'deactivate': 'deactivate',
                'references': [{
                    'bind': 'test',
                    'unbind': 'deactivate'
                }]
            });
            component.create();
        }, 'Unbind methods has deactivator name');
        throws(function() {
            var component = new $cdi.ComponentsHandler({
                'class': 'sosgi.cdi.test.Simple',
                'activate': 'activate',
                'deactivate': 'deactivate',
                'references': [{
                    'bind': 'test',
                    'unbind': 'activate'
                }]
            });
            component.create();
        }, 'Unbind methods has activator name');

        throws(function() {
            var component = new $cdi.ComponentsHandler({
                'class': 'sosgi.cdi.test.Simple',
                'activate': 'activate',
                'deactivate': 'deactivate',
                'references': [{
                    'unbind': 'miss',
                }]
            });
            component.create();
        }, 'Miss unbind methods');

        throws(function() {
            var component = new $cdi.ComponentsHandler({
                'class': 'sosgi.cdi.test.Simple',
                'activate': 'activate',
                'deactivate': 'deactivate',
                'references': []
            });
            component.invoke('miss');
        }, 'Invoke method before create object');
    });
    test('invoke not exits methods', function() {
        throws(function() {
            var component = new $cdi.ComponentsHandler({
                'class': 'sosgi.cdi.test.Simple',
                'activate': 'activate',
                'deactivate': 'deactivate',
                'references': []
            });
            component.create();
            component.invoke('miss');
        }, 'Not exits method');

        throws(function() {
            var component = new $cdi.ComponentsHandler({
                'class': 'sosgi.cdi.test.Simple',
                'activate': 'activate',
                'deactivate': 'deactivate',
                'references': []
            });
            component.create();
            component.invoke('test');
        }, 'Invoke not defined in reference');
    });
    test('invoke methods', function() {
        var component = new $cdi.ComponentsHandler({
            'class': 'sosgi.cdi.test.Simple',
            'activate': 'activate',
            'deactivate': 'deactivate',
            'references': [{
                'bind': 'test',
                'unbind': null
            }]
        });
        component.create();
        equal(component.invoke('test', 'variable'), 'test:variable');

        equal(component.activate(), 'test:activate');
        equal(component.deactivate(), 'test:deactivate');
    });
    test('assing variable', function() {

        throws(function() {
            var component = new $cdi.ComponentsHandler({
                'class': 'sosgi.cdi.test.Simple',
                'activate': 'activate',
                'deactivate': 'deactivate',
                'references': []
            });
            component.set('miss', 1);
        }, 'Assing variable before create object');


        throws(function() {
            var component = new $cdi.ComponentsHandler({
                'class': 'sosgi.cdi.test.Simple',
                'activate': 'activate',
                'deactivate': 'deactivate',
                'references': []
            });
            component.get('miss');
        }, 'Getting variable before create object');

        var component = new $cdi.ComponentsHandler({
            'class': 'sosgi.cdi.test.Simple',
            'activate': 'activate',
            'deactivate': 'deactivate',
            'references': []
        });
        component.create();
        component.set('$variable', 'test');
        equal(component.get('$variable'), 'test');

    });

})(sosgi.cdi);
