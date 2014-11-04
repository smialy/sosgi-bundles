(function($clock) {
    "use strict";

    $clock.format = {
        FULL: 'full',
        DATE: 'date',
        TIME: 'time'
    };
    var pad = function(num) {
        num = parseInt(num, 10);
        return num < 10 ? '0' + num : num;
    };
    var formats = {
        full: function(date) {
            return date.getFullYear() + '/' + pad(date.getMonth()) + '/' + pad(date.getDate()) + ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());
        },
        date: function(date) {
            return date.getFullYear() + '/' + pad(date.getMonth()) + '/' + pad(date.getDate());
        },
        time: function(date) {
            return date.getHours() + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());
        }
    };

    $clock.Clock = sjs.Class({
        init: function() {
            this.setFormat('full');
        },
        show: function($dom) {
            this.$dom = document.createElement('div');
            this.$dom.className = 'clock';
            $dom.appendChild(this.$dom);
            this.reset();
        },
        setFormat: function(format) {
            format = format.toLowerCase();
            if (formats[format]) {
                this._format = formats[format];
                this.update();
            } else {
                throw new Error('Incorrect formats: full, date, time');
            }
        },
        update: function(date) {
            this._date = date || this._date;

            if (this._date && this.$dom) {
                this.$dom.innerHTML = this._format(this._date);
            }
        },
        remove: function() {
            if (this.$dom) {
                this.$dom.parentNode.removeChild(this.$dom);
                this.$dom = null;
            }
        },
        reset: function() {
            if (this.$dom) {
                this.$dom.innerHTML = 'waiting for timer';
            }
        },

    });
})(sosgi.test.clock);
