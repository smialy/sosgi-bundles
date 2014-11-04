(function($api, $user) {

    var User = function sapps_user_User(id, params){
        $api.user.User.call(this, id, params);

        Object.defineProperties(this, {
            id:{
                get:function(){
                    return id;
                },
                enumerable: true
            },
            name:{
                value:params.name,
                enumerable: true,
            },
            login:{
                value:params.login,
                enumerable: true,
            }
        });
        this._params = params;
    };
    
    User.prototype.serialize = function(){
        var params = sjs.clone(this._params);
        params.id = this.id;
        return params;
    };
    User.prototype.isAnonymous = function() {
        return false;
    };
    var AnonymousUser = function sapps_user_AnonymousUser() {
        User.call(this, 0, {name:'Anonymous',login:''});
    };
    AnonymousUser.prototype.isAnonymous = function() {
        return true;
    };
    AnonymousUser.prototype.getName = function(){
        return 'Anonymous';
    };

    $user.createUser = function(params) {
        params = params || {};
        return params.id ? new User(params.id, params) : new AnonymousUser();
    };


})(sapps.api, sapps.core.user);
