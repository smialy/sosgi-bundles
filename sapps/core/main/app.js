(function($main) {
    var log = sjs.log.getLogger('sapps.app/app.js');

    var getInnstalledBundle = function(ctx) {
        var installed = [];
        var bundles = ctx.bundles;
        for (var i = 0; i < bundles.length; i++) {
            installed.push(bundles[i]);
        }
        return installed;
    };
    var Application = function(ctx) {
        log.info('Application');
        var installed = getInnstalledBundle(ctx);

        
        this.addingService = function(ref, service) {
            log.info('Application.addingService('+ref+')', service);

            var user = service.getUser().done(function(user){
                if (user.isAnonymous()) {
                    showLogin();
                }else{
                    showApp();
                }
            }, this).fail(showLogin);
            
        },
        this.removedService = function(ref) {
            log.info('Application.removedService('+ref+')');
        };        

        this.start = function(){
            this._tracker = ctx.services.tracker(sapps.api.user.UserManager, this).open();
            this._reg = ctx.services.register(sapps.api.user.UserListener, this);
        };
        this.stop = function() {
            this._tracker.close();
        };

        this.userEvent = function(event) {
            if(event.type === sapps.api.user.LOGIN){
                showApp();
            }else if(event.type === sapps.api.user.LOGOUT){
                showLogin();
            }
        };
        var findBundleByName = function(namespace){
                var bundles = ctx.bundles.all();
                for (var i = 0; i < bundles.length; i++) {
                    var bundle = bundles[i];    
                    if(bundle.meta.namespace === namespace){
                        return bundle;
                    }
                }
                return null;
        };
        var showLogin = function() {
            log.info('showLogin()');
            var uninstall = function(name){
                var bundle = findBundleByName(name);
                if(bundle){
                    bundle.uninstall();
                }
            };
            uninstall('sapps/ui/allegro');
            uninstall('sapps/ui/dashboard');
            uninstall('sapps/ui/main');

            ctx.bundles.install('sapps/login', true);
        };
        var showApp = function(){
            log.info('showApp()');
            var bundle = findBundleByName('sapps/login');
            if(bundle){
                bundle.uninstall();  
            }
            ctx.bundles.install('sapps/ui/main', true);
            ctx.bundles.install('sapps/ui/dashboard', true);
            ctx.bundles.install('sapps/ui/allegro', true);

        };

        this.start();
        

    };
    $main.Application = Application;



})(sapps.core.main);
