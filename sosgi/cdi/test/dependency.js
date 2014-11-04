(function($cdi) {
    'use strict';

    module('sosgi.cdi.dependency', {
        setup: function() {
            $cdi.test = {};
            $cdi.test.Manager = function() {};
        },
        teardown: function() {
            $cdi.test = null;
        }
    });

    test('incorrect init', function() {



    });

})(sosgi.cdi);
