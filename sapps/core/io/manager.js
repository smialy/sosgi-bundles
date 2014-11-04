(function(io, api) {

    var log = sjs.log.getLogger('sapps.io/manger.js');

    var Connection = function(name, protocol) {
        api.IConnection.call(this);
        var queue = {};

        var fire = function(defers, method, data){
            for(var i = 0; i < defers.length;i++){
                defers[i][method](data);
            }
        };
        var fireResolve = function(name, data){
            fire(queue[name], 'resolve', data);
            delete queue[name];
        };
        var fireReject = function(name, defers, data){
            fire(queue[name], 'reject', data);
            delete queue[name];
        };

        this.send = function(method, params) {
            var defer = sjs.defer();
            var name = method+':'+io.qs.encode(params);
            if(name in queue){
                queue[name].push(defer);
            }else{
                queue[name] = [defer];
                var error = function(type, ex){
                    log.error('<'+type+'>', ex);
                    fireReject(name);
                };
                protocol.send(method, params).then(function(response) {
                    response = response || '{}';
                    try {
                        response = JSON.parse(response);
                        if(response.status === 'success'){
                            fireResolve(name, response.response);
                        }else{
                            fireReject(name, response.response);
                        }
                    } catch (e) {
                        log.exception(e);
                        error('parse',e);
                    }
                }, error);

            }
            return defer.promise;
        };
    };


    io.Manager = function(ctx) {
        this.connections = [];
        this.ctx = ctx;

        this.start();
    };
    io.Manager.prototype = {
        _prepareConnections: function() {
            var config = this.ctx.getProperty('io');
            for (var i = 0; i < config.connections.length; i++) {
                var connection = config.connections[i];

                if (connection.type in io.protocols) {
                    var protocol = io.protocols[connection.type];
                    var conn = new Connection(connection.name, protocol(connection.params));
                    this.connections.push(conn);
                } else {
                    log.error('Not found protocol type: ' + connection.type);
                }
            }

        },
        findConnection: function(method) {
            for (var i = 0; i < this._connections.length; i++) {
                if (this._connections[i].match(method)) {
                    return this._connections[i];
                }
            }

            return null;
        },
        start: function() {
            this._prepareConnections();
            this.regs = [];
            for (var i = 0; i < this.connections.length; i++) {
                this.regs.push(this.ctx.services.register(api.Connection, this.connections[i]));
            }
        },
        stop: function() {
            for (var i = 0; i < this.regs.length; i++) {
                this.regs[i].unregister();
            }

            this._connections = [];
            delete this.pool;
            delete this.reg;
        }
    };


})(sapps.core.io, sapps.api);
