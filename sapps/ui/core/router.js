(function($core) {


    var isRegExp = function(val) {
        return '[object RegExp]' === Object.prototype.toString.call(val);
    };
    var trim = function(url) {
        return (url || '').replace(/^\/+|\/+$/g, '');
    };

    $core.Router = function(browser) {
        var routes = [];
        var path = '';

        var matchRoute = function(route){
            var params = route.match(path);
            if(params !== null){
                route.callback(params);
            }
        };

        this.match = function(_path){
            path = _path;
            console.log('ui.Router::match('+path+')');
            var route;
            for(var i = 0;i<routes.length;i++){
                matchRoute(routes[i]);

            }
        };
        this.addRoute = function(route){
            console.log('ui.Router::addRoute('+route+')');
            if(!routes.contains(route)){
                routes.push(route);
                matchRoute(route);
            }
        };
        this.removeRoute = function(route){
            console.log('ui.Router::removeRoute('+route+')');
            if(routes.contains(route)){
                routes.remove(route);
            }
        };
    };

    var preparePattern = function(pattern) {
        var keys = [];
        if (!isRegExp(pattern)) {
        
        pattern = trim(pattern);
        var sreg = pattern.replace(/(?:(\/)?:(\w+)(\*|\?)?)/g, function(_, slash, key, option) {

            slash = slash || '';
            var star = option === '*';
            var optional = option === '?';
            keys.push(key);
            return '' + '(?:' + (optional ? slash : '') + (star ? '(.+?)' : '([^\/]+)') + ')' + (optional ? '?' : '');
        }).replace(/\*/g, function() {
                return '.+?';
            });
            pattern = new RegExp('^' + sreg + '$', 'i');
        }

        return {
            pattern: pattern,
            keys:keys
        };
    };

    var matcher = function(pattern, rules) {
        var match = preparePattern(pattern);
        return function(url) {
            url = trim(url);
            var m = match.pattern.exec(url);
            if (m !== null) {
                return true;
            }
            return null;
        };
    };
    $core.Route = function sosgi_ui_Route(pattern, rules, callback) {
        this._pattern = pattern;
        this.$matcher = matcher(pattern, rules);
        this.callback = callback;
    };
    $core.Route.prototype = {
        match: function(url) {
            return this.$matcher(url);
        },
        toString: function(){
            return '<Route match='+this._pattern+'>';
        }
    };

})(sapps.ui.core);