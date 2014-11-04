(function($shell) {
    'use strict';

    module('sosgi.shell.Shell');

    test('addCommand and incorect params', function() {
        var shell = new $shell.Shell();

        throws(function() {
            shell.addCommand();
        }, 'Add undefined command');

        throws(function() {
            shell.addCommand({});
        }, 'Add empty params');

        throws(function() {
            shell.addCommand({
                name: '',
                execute: function() {}
            });
        }, 'Add empty name');

        throws(function() {
            shell.addCommand({
                name: 'test'
            });
        }, 'Require key execute');

        throws(function() {
            shell.addCommand({
                name: 'test',
                execute: true
            });
        }, 'Execute should be function');

        throws(function() {
            shell.addCommand({
                name: 'test',
                execute: function() {},
                man: 1
            });
        }, 'Man should be string');

        throws(function() {
            shell.addCommand({
                name: 'test',
                execute: function() {},
                description: 1
            });
        }, 'Description should be string');

        throws(function() {
            shell.addCommand({
                name: 'test',
                execute: function() {},
                order: '1'
            });
        }, 'Description should be string');

        throws(function() {
            shell.addCommand({
                name: 'test',
                execute: function(context) {}
            });
            shell.addCommand({
                name: 'test',
                execute: function(context) {}
            });
        }, 'Already exists command: test');
    });

    test('removeCommand and incorect params', function() {
        var shell = new $shell.Shell();
        throws(function() {
            shell.removeCommand();
        }, 'Undefined command');

        throws(function() {
            shell.removeCommand('');
        }, 'Empty command name');

        throws(function() {
            shell.removeCommand('test');
        }, 'Not found command');

        throws(function() {
            shell.removeCommand({});
        }, 'Incorrect command type');

    });

})(sosgi.shell);
