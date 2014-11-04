(function(api) {
    api.user = {};
    api.user.LOGOUT = 'sapps.api.user.LOGOUT';
    api.user.LOGIN = 'sapps.api.user.LOGIN';
    api.user.UPDATE = 'sapps.api.user.UPDATE';

    api.user.User = function sapps_api_user_User(id, params) {
        
    };
    api.user.User.prototype = {
        get id(){

        }
    };

    api.user.User.prototype.isAnonymous = function() {
        return false;
    };
    

    api.user.UserManager = function sapps_api_user_UserManager() {

    };
    
    api.user.UserManager.prototype = {
        getUser: function() {

        },
        login: function(login, password) {

        },
        logout: function() {

        },
        update:function(data){

        }
    };
    
    api.user.UserEvent = function sapps_api_user_UserEvent(type, user) {
        Object.defineProperties(this, {
            user:{
                value:user
            },
            type:{
                value:type
            }
        });

    };

    api.user.UserListener = function sapps_api_user_UserListener() {
    };
    api.user.UserListener.prototype = {
        /**
         * @param {UserEvent} event
         */
        userEvent: function(event) {

        }
    };


api.user.AuthEvent = function sapps_api_AuthEvent(type, data) {
        this.type = type;
        this.data = data;
    };
    /**
     * Auth Listener
     */
    api.user.IAuthListener = function sapps_api_IAuthListener() {

    };
    api.user.IAuthListener.prototype = {
        /**
         * @param {AuthEvent} event
         */
        authEvent: function(event) {

        }
    };


    api.user.IAuthManager = function sapps_api_IAuthManager() {

    };
    api.user.IAuthManager.prototype = {
        /**
         * Authenticate user
         *
         * @param {String} login
         * @param {String} password
         */
        login: function(login, password) {

        },
        /**
         * Logout user
         */
        logout: function() {

        }
    };
})(sapps.api);
