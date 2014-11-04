(function($server) {

    var log = sjs.log.getLogger('sosgi.dev.watchdog/connection.js');
    var Class = sjs.Class;


    var OPEN = 'open';
    var OPENING = 'opening';
    var CLOSE = 'close';
    var CLOSING = 'closing';
    var MESSAGE = 'message';
    var ERROR = 'error';

    var Socket = Class({
        init: function(url) {
            this._url = url;
            this._ws = null;
            this.status = CLOSE;

            this.on = {};
            this.on.open = new sjs.event.Event();
            this.on.close = new sjs.event.Event();
            this.on.error = new sjs.event.Event();
            this.on.message = new sjs.event.Event();


        },
        open: function() {
            log.debug('Socket::open()');
            if (this.status === OPEN) {
                log.warn('[Socket] Connection is already opened');
                return;
            }
            if (this.status === OPENING) {
                log.warn('[Socket] Connection is current opening');
                return;
            }
            this.status = OPENING;
            try {
                var ws = this._ws = new WebSocket(this._url);
                ws.addEventListener('open', this._onopen.bind(this));
                ws.addEventListener('close', this._onclose.bind(this));
                ws.addEventListener('message', this._onmessage.bind(this));
                ws.addEventListener('error', this._onerror.bind(this));
            } catch (e) {
                this._onerror(e);
            }
        },
        close: function() {
            log.debug('Socket::close()');
            if (this.status !== CLOSE && this.status !== CLOSING) {
                this.status = CLOSING;
                if (this._ws) {
                    this._ws.close();
                }
            }
        },
        send: function(data) {
            if (this.status === OPEN) {
                this._ws.send(data);
            }
        },
        isOpen: function() {
            return this.status === OPEN;
        },

        _onopen: function(e) {
            this.status = OPEN;
            this.on.open.dispatch(this);
        },
        _onclose: function(e) {
            this.status = CLOSE;
            this.on.close.dispatch(this);
        },
        _onmessage: function(e) {
            log.debug('Socket::_onmessage()', e.data);
            try {
                this.on.message.dispatch(e.data);
            } catch (er) {
                console.error(er);
            }
        },
        _onerror: function(e) {
            this.status = CLOSE;
            this.on.error.dispatch(e);
        }
    });

    $server.Connection = Class({
        init: function(url) {
            var _sock = this._sock = new Socket(url);

            this.on = _sock.on;
            this._handlers = [];
            this._running = false;
            this._connection = false;
            var self = this;

            var retry = function() {

                if (!self._connection) {
                    self._connection = true;
                    log.debug('Try establish connection');
                    setTimeout(function() {
                        self._connection = false;
                        self._sock.open();
                    }, 5000);
                }
            };
            _sock.on.close.add(retry);
            _sock.on.error.add(retry);
        },
        start: function() {
            log.debug('Connection::start()');
            this._sock.open();
            this._running = true;
        },
        status: function() {
            return this._sock.status;
        },
        stop: function() {
            log.debug('Connection::stop()');
            this._running = false;
            this._sock.close();

        },
        send: function(data) {
            this._sock.send(data);
        }
    });

})(sosgi.dev.server);
