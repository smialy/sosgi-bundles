(function($api, $user) {

    var log = sjs.log.getLogger('sapps.user/service.js');

    var UserService = function sapps_core_user_UserService(repository, dispacher) {
        $api.user.UserManager.call(this);
        this._repository = repository;
        this._dispacher = dispacher;
        this._user = null;

        
    };
    UserService.prototype = Object.create($api.user.UserManager.prototype);
    UserService.prototype.getUser = function(){
        var defer = sjs.defer();
        if(this._user !== null){
            defer.resolve(this._user);
        }else{
            this._repository.getUser().done(function(data) {
                if(typeof data === 'string'){
                    data = JSON.parse(data);
                }
                this._user = $user.createUser(data);
                defer.resolve(this._user);
            }, this).fail(defer.reject, this);
        }
        return defer.promise;
    };
    UserService.prototype.login = function(login, password) {
        var defer = sjs.defer();
        this._repository.login(login, password).done(function(data) {
            var user = $user.createUser(data);
            if (!user.isAnonymous()) {
                this._user = user;
                this._dispacher.fire($api.user.LOGIN, user);
            }
        }, this).fail(defer.reject,this);
        return defer.promise;
    };
    UserService.prototype.logout = function() {
        var defer = sjs.defer();
        this._repository.logout().done(function() {
            var user = this._user;
            this._user = $user.createUser();
            this._dispacher.fire($api.user.LOGOUT, user);
        }, this).fail(defer.reject);
        return defer.promise;
    };
    
    $user.UserService = UserService;

})(sapps.api, sapps.core.user);
