(function($timer) {
    "use strict";

    $timer.Timer = sjs.Class({
        init: function() {
            this._time = 0;
            this._listeners = [];
        },
        start: function() {
            this._t = setInterval(this._interval.bind(this), 100);
        },
        stop: function() {
            if (this._t) {
                clearInterval(this._t);
            }
            this._listeners = [];
        },
        addListener: function(listener) {
            this._listeners.include(listener);
        },
        removeListener: function(listener) {
            this._listeners.remove(listener);
        },
        _interval: function() {
            var date = new Date();
            var time = parseInt(date.getTime() / 1000, 10);
            if (this._time !== time) {
                for (var i = 0; i < this._listeners.length; i++) {
                    this._listeners[i](date);
                }
                this._time = time;
            }
        }
    });
})(sosgi.test.timer);
