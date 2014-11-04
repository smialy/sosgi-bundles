(function($terminal) {


    $terminal.Event = function() {
        var listeners = {};
        var sid = 1;

        var indexOf = function(listener, bind) {
            for (var i in listeners) {
                if (listener === listeners[i][0] && bind === listeners[i][1]) {
                    return i;
                }
            }
            return null;
        };
        var contains = function(listener, bind) {
            return indexOf(listener, bind) !== null;
        };
        this.add = function(listener, bind) {
            if (typeof listener !== 'function') {
                throw new Error('Argument assert error: listener: Function');
            }
            bind = bind || null;
            if (!contains(listener, bind)) {
                var id = sid++;
                listeners[id] = [listener, bind];
                return {
                    remove: function() {
                        if (id in listeners) {
                            delete listeners[id];
                        }
                    }
                };
            }
        };
        this.remove = function(listener, bind) {
            bind = bind || null;
            var index = indexOf(listener, bind);
            if (index !== null) {
                delete listeners[index];
            }
        };
        this.trigger = function(data) {
            for (var i in listeners) {
                listeners[i][0].call(listeners[i][1], data);
            }
        };
    };

})(sosgi.dev.ui.terminal);
