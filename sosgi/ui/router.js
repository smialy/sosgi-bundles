(function($ui) {

    var isRegExp = function(val) {
        return '[object RegExp]' === Object.prototype.toString.call(val);
    };
    var trim = function(url) {
        return (url || '').replace(/^\/+|\/+$/g, '');
    };

    $ui.Router = function() {
        var routes = [];
        var path = '';

        var matchRoute = function(route) {
            var params = route.match(path);
            if (params !== null) {
                route.callback(params);
            }
        };

        this.match = function(_path) {
            path = _path;
            //console.log('ui.Router::match('+path+')');
            var route;
            for (var i = 0; i < routes.length; i++) {
                matchRoute(routes[i]);

            }
        };
        this.addRoute = function(route) {
            //console.log('ui.Router::addRoute('+route+')');
            if (!routes.contains(route)) {
                routes.push(route);
                matchRoute(route);
            }
        };
        this.removeRoute = function(route) {
            //console.log('ui.Router::removeRoute('+route+')');
            if (routes.contains(route)) {
                routes.remove(route);
            }
        };
    };
    var matcher = function(pattern, rules) {
        var keys = [];
        var preparePattern = function(pattern) {
            if (isRegExp(pattern)) {
                return pattern;
            }
            pattern = trim(pattern);

            var sreg = pattern.replace(/[\[\]\(\)]/g, '\\$&').replace(/(?:(\/)?:(\w+)(\*|\?)?)/g, function(_, slash, key, option) {

                slash = slash || '';
                var star = option === '*';
                var optional = option === '?';
                keys.push(key);
                return '' + (optional ? '' : slash) + '(?:' + (optional ? slash : '') + (star ? '(.+?)' : '([^\/]+)') + ')' + (optional ? '?' : '');
            }).replace(/\*/g, function() {
                return '.+?';
            });
            return new RegExp('^' + sreg + '$', 'i');
        };
        var reg = preparePattern(pattern);
        return function(url) {
            url = trim(url);
            var m = reg.exec(url);
            if (m !== null) {
                return true;
            }
            return false;
        };
    };
    $ui.Route = function sosgi_ui_Route(pattern, rules, callback) {
        this.$matcher = matcher(pattern, rules);
        this.callback = callback;
    };
    $ui.Route.prototype = {
        match: function(url) {
            return this.$matcher(url);
        }
    };

})(sosgi.ui);
