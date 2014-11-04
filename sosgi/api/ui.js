(function($api) {
    $api.ui = {
        URL_CHANGE: 'url.change'
    };
    $api.ui.Browser = function sosgi_api_ui_Browser(params) {

    };
    $api.ui.Browser.prototype = {
        url: function(url, replace) {

        },
        feature: function(name) {

        }
    };

    $api.ui.Route = function sosgi_api_ui_Route(rule, callback) {

    };
    $api.ui.Route.prototype = {
        match: function(url) {

        },
        run: function() {

        }
    };
    $api.ui.Router = function sosgi_api_ui_Router() {

    };
    $api.ui.Router.prototype = {
        addRoute: function(route) {

        },
        removeRoute: function(route) {

        }
    };
})(sosgi.api);
