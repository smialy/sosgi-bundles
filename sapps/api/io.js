(function(api) {

    /**
     * Connection
     */
    api.Connection = function sapps_api_Connection() {

    };
    api.Connection.prototype = {
        /**
         * Send reguest
         *
         * @param {String} method
         * @param {Object} params
         * @return {Promise}
         */
        send: function(method, params) {

        }
    };

    /**
     * Connection
     */
    api.HttpConnection = function sapps_api_HttpConnection() {

    };
    api.HttpConnection.prototype = Object.create(api.Connection.prototype);

        /**
         * Send reguest
         *
         * @param {String} url
         * @param {Object} params
         * @return {Promise}
         */
    api.HttpConnection.prototype.get = function(url, params) {

    };
    api.HttpConnection.prototype.post = function(url, params){

    };
    api.HttpConnection.prototype.head = function(url, params){

    };
    api.HttpConnection.prototype.delete = function(url, params){
            
    };
    api.HttpConnection.prototype.put = function(url, params){
            
    };

    api.SocketConnection = function sapps_api_SocketConnection(){
    };
    api.SocketConnection.prototype = Object.create(api.Connection.prototype);

        /**
         * Send reguest
         *
         * @param {String} url
         * @param {Object} params
         * @return {Promise}
         */
    api.SocketConnection.prototype.send = function(action, callback, bind) {

    };
    api.SocketConnection.prototype.on = function(action, callback, bind){

    };
    api.SocketConnection.prototype.off = function(action, callback, bind){

    };

})(sjs.ns('sapps.api.io'));
