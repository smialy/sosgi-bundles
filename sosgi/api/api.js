(function($api) {

    $api.ManagerService = function sosgi_api_ManagerService() {

    };


    $api.Shell = function sosgi_api_Shell() {

    };
    $api.Shell.prototype = {

    };

    var COMMAND_PARAMS = [{
        name: 'name',
        require: true,
        type: 'string'
    }, {
        name: 'description',
        require: false
    }, {
        name: 'man',
        require: false
    }, {
        name: 'params',
        require: false,
        type: 'object'
    }, {
        name: 'order',
        require: false,
        type: 'number'
    }, {
        name: 'execute',
        require: true,
        type: 'function'
    }, {
        name: 'complete',
        require: false,
        type: 'function'
    }];

    var validateArguments = function(cmd, params) {
        var param, name, type, require, value;
        for (var i = 0; i < COMMAND_PARAMS.length; i++) {
            param = COMMAND_PARAMS[i];
            name = param.name;
            type = param.type || 'string';
            require = param.require || false;
            if (name in params) {
                value = params[name];
                if (type && typeof params[name] !== type) {
                    throw new Error('Variable "' + name + '" should be "' + type + '"');
                }
                if (type === 'function') {
                    cmd[name] = params[name];
                    continue;
                }
                if (require && type === 'string' && !value) {
                    throw new Error('Empty variable "' + name + '"');
                }
                Object.defineProperty(cmd, name, {
                    value: params[name],
                    enumerable: true
                });
            } else if (require) {
                throw new Error('Variable "' + name + '" is require in command definition');
            }
        }
    };

    $api.Command = function sosgi_api_Command(params) {
        validateArguments(this, params);

    };
})(sosgi.api);
