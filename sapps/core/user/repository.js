(function($api, $user) {

    $user.IRepository = function sapps_core_user_IRepository() {

    };
    $user.IRepository.prototype = {
        loadUser: function() {

        },
        login: function(login, password) {

        },
        logout: function() {

        }
    };

    $user.Repository = function sapps_core_user_Repository(http) {
        $user.IRepository.call(this);
        this._http = http;
    };
    $user.Repository.prototype = {
        getUser: function() {
            var defer = sjs.defer();
            this._http.get('/user').success(defer.resolve).error(defer.reject);
            return defer.promise;
        },
        login: function(login, password) {
            var defer = sjs.defer();
            this._http.post('/login', {
                login: login,
                password: password
            }).success(defer.resolve).fail(function(response){
                defer.reject(response && response.message || 'Unknown error');
            });
            return defer.promise;
        },
        logout: function() {
            return this._http.get('/logout');
        }
    };

})(sapps.api, sapps.core.user);
