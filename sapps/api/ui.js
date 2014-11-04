(function(api) {

    api.App = function sapps_api_ui_App(){

    };
    api.App.prototype = {
        get name(){

        },
        get url(){

        },
        reload:function(){

        },
        show:function($dom){

        },
        hide:function(){
            
        }
    }

    api.Router = function sapps_api_ui_Router() {

    };
    api.Router.prototype = {
        addRoute:function(route){

        },
        removeRoute:function(route){

        }
    };
    api.Route = function sapps_api_ui_Route(){

    };
    api.Route.prototype = {
        /**
         *
         * @param {String} url
         */
        match:function(url){

        }
    };
    api.Browser = function sapps_api_ui_Browser(){

    };
    api.Browser.prototype = {
        /**
         *
         * @param {String{ url New url (when use as setter)
         * @param (boolean) replace
         */
        url:function(url, replace){

        },
        feature:function(name){

        }
    };

})(sjs.ns('sapps.api.ui'));
