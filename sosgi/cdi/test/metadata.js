(function($cdi) {
    'use strict';

    module('sosgi.cdi.metadata');
    //Lorem ipsum dolor sit amet

    test('incorect metadata', function() {
        throws(function() {
            $cdi.metadata();
        }, 'Miss metadata');

        throws(function() {
            $cdi.metadata({
                'class': 'classname',
                references: [{}]
            });
        }, 'Raise error on missing references interface');

        throws(function() {
            $cdi.metadata({
                'class': 'classname',
                references: [{
                    'interface': ''
                }]
            });
        }, 'Raise error on missing references interface');

        throws(function() {
            $cdi.metadata({
                'class': 'classname',
                references: [{
                    'interface': 'interface',
                    'cardinality': 'test'
                }]
            });
        }, 'Raise error on incorect references cardinality');
    });

    test('default params', function() {
        var meta = $cdi.metadata({
            'class': 'classname'
        });

        equal(meta.class, 'classname');
        equal(meta.name, 'classname');
        equal(meta.enabled, true);
        equal(meta.immediate, false);
        equal(meta.activate, 'activate');
        equal(meta.deactivate, 'deactivate');
        deepEqual(meta.interfaces, []);
        deepEqual(meta.properties, {});
        deepEqual(meta.references, []);

        meta = $cdi.metadata({
            'class': 'classname',
            references: [{
                'interface': 'some_interface'
            }]
        });
        var ref = meta.references[0];
        equal(ref.interface, 'some_interface');
        equal(ref.name, 'some_interface');
        equal(ref.assign, null);
        equal(ref.cardinality, '1..1');
        equal(ref.filter, '');
        equal(ref.bind, null);
        equal(ref.unbind, null);
        equal(ref.updated, null);

    });
    test('setter', function() {
        var meta = $cdi.metadata({
            'class': 'classname',
            'name': 'name',
            'enabled': false,
            'immediate': true,
            'activate': 'onActivate',
            'deactivate': 'onDeactivate',
            'interfaces': ['a', 'b', 'c'],
            'properties': {
                a: 1,
                b: 2,
                c: 3
            },
            'references': [{
                'interface': 'interface',
                'name': 'name',
                'assign': 'assign',
                'cardinality': '0..n',
                'filter': 'filter',
                'bind': 'onBind',
                'unbind': 'onUnbind',
                'updated': 'onUpdated'

            }]
        });
        equal(meta.class, 'classname');
        equal(meta.name, 'name');
        equal(meta.enabled, false);
        equal(meta.immediate, true);
        equal(meta.activate, 'onActivate');
        equal(meta.deactivate, 'onDeactivate');
        deepEqual(meta.interfaces, ['a', 'b', 'c'], 'Set interfaces');
        deepEqual(meta.properties, {
            a: 1,
            b: 2,
            c: 3
        }, 'Set properties');

        var ref = meta.references[0];
        equal(ref.interface, 'interface');
        equal(ref.name, 'name');
        equal(ref.assign, 'assign');
        equal(ref.cardinality, '0..n');
        equal(ref.filter, 'filter');
        equal(ref.bind, 'onBind');
        equal(ref.unbind, 'onUnbind');
        equal(ref.updated, 'onUpdated');
    });


})(sosgi.cdi);
