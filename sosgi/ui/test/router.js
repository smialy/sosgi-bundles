(function($ui) {
    'use strict';

    module('sosgi.ui.Route');

    'Lorem ipsum dolor sit ame'

    test('match simple string', function() {
        var route = new $ui.Route('/lorem');
        equal(true, route.match('/lorem'));
        equal(true, route.match('/lorem/'));
        equal(false, route.match('/lorem/ipsum'));
    });
    test('match string', function() {
        var route = new $ui.Route('/a[user.name](test)');
        equal(true, route.match('/a[user.name](test)'));
        equal(true, route.match('/a[user.name](test)/'));
        equal(false, route.match('/a[user.name](test)/ipsum'));
    });
    test('match ignoring slash', function() {
        var route = new $ui.Route('/lorem/ipsum/');
        equal(true, route.match('/lorem/ipsum'));
        equal(true, route.match('/lorem/ipsum/'));
        equal(false, route.match('/lorem/ipsum/dolor'));
    });

    test('match missing begin slash', function() {
        var route = new $ui.Route('lorem/ipsum');
        equal(true, route.match('lorem/ipsum'));
        equal(true, route.match('lorem/ipsum/'));
        equal(true, route.match('/lorem/ipsum'));
    });

    test('match single param', function() {
        var route = new $ui.Route(':foo');
        equal(true, route.match('/lorem'));
        equal(true, route.match('/lorem/'));
        equal(true, route.match('lorem/'));
        equal(true, route.match('lorem'));
        equal(false, route.match('/lorem/ipsum'));
        equal(false, route.match('lorem/ipsum'));
    });
    test('match params', function() {
        var route = new $ui.Route('/lorem/:foo');
        equal(true, route.match('/lorem/ipsum'));
        equal(true, route.match('/lorem/ipsum/'));
        equal(false, route.match('/lorem/ipsum/dolor'));
    });
    test('match optional option', function() {
        var route = new $ui.Route('/lorem/:foo?');
        equal(true, route.match('/lorem'));
        equal(true, route.match('/lorem/'));
        equal(true, route.match('/lorem/ipsum'));
        equal(true, route.match('/lorem/ipsum/'));
        equal(false, route.match('/lorem/ipsum/dolor'));
    });
    test('match star option', function() {
        var route = new $ui.Route('/lorem/:foo*');
        equal(false, route.match('/lorem'));
        equal(true, route.match('/lorem/ipsum'));
        equal(true, route.match('/lorem/ipsum/'));
        equal(true, route.match('/lorem/ipsum/dolor'));
    });







})(sosgi.ui);
