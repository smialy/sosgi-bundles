(function($clock) {
    "use strict";


    $clock.cmds = [{
        name: 'clock:format',
        execute: function(args, out) {
            this.clock.setFormat(args[0]);
        }
    }];
})(sosgi.test.clock);
