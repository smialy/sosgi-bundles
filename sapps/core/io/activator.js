(function(io, api) {

    var log = sjs.log.getLogger('sapps.io/activator.js');

    io.Activator = sjs.Class({
        _regs:[],
        start: function(ctx) {
            //this.manager = new io.Manager(ctx);
            var configs = ctx.property('io');
            if(configs){
            for (var i = 0; i < configs.connections.length; i++) {
                var config = configs.connections[i];
                    if (config && config.type in io) {
                        if(typeof io[config.type] === 'function'){
                            var connection = io[config.type](config.params);
                            this._regs.push(ctx.services.register([api.io.Connection, api.io.HttpConnection], connection));
                        }else{
                            log.warn('Connection type: '+config.type +' should be: "function"');
                        }
                    }else{
                        log.warn('Not found connection type: '+config.type);
                    }
                }
            }


        },
        stop: function(ctx) {
            for (var i = 0; i < this._regs.length; i++) {
                this._regs[i].unregister();
            }
            this._regs = [];
        }
    });
})(sapps.core.io, sapps.api);
