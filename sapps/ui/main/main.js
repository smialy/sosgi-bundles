(function($api, $main) {
    
    var log = sjs.log.getLogger('sapps.ui.main/main.js');



    $main.MainUI = function() {
        this._apps = {};
    };

    $main.MainUI.prototype = {
        activate: function(ctx) {
            log.debug('MainUI::activate()');
            this.ui = new $main.UI(ctx.bundle.resource('res/main.html'));
            
            this.ui.on.select.add(this.onSelectApp, this);
            this.ui.on.reload.add(this.onReloadApp, this);

            this.$users.getUser().done(function(user){
                this.ui.create(user);
            }, this);
            var self = this;

            ctx.services.register($api.ui.Route, function(){
                self.$users.logout();
                self.$browser.url('/login');
            },{
                match:'/logout'
            });
        },
        deactivate: function(ctx) {
            log.debug('MainUI::deactivate()');  
            this.ui.remove();
            this.ui = null;
        },
        addApp:function(ref, app){
            log.debug('MainUI::addApp('+ref.id +','+app.name+')');
            this._apps[ref.id] = {
                app:app,
                properties:ref.properties
            };
            if(this.ui){
                this.ui.addApp(ref.id, ref.properties);
            }            
        },
        removeApp:function(ref, app){
            var props = ref.properties
            log.debug('MainUI::removeApp('+ref.id +','+app.name+')');
            if(app === this._apps[ref.id].app){
                var $browser = this.$browser;
                setTimeout(function(){
                    $browser.url('/');
                    $browser = null;
                });
            }
            delete this._apps[ref.id];
            if(this.ui){
                this.ui.removeApp(ref.id);    
            }
        },
        onSelectApp:function(id){
            if(id in this._apps){
                var app = this._apps[id].app;
                if(!this.currentApp || this.currentApp !== app){
                    if(this.currentApp){
                        this.currentApp.hide();
                    }
                    this.ui.selectApp(id, this._apps[id].properties);
                    app.show(this.ui.$container);
                    this.currentApp = app;
                    
                }
            }
        },
        onReloadApp:function(id){
            if(this.currentApp){
                this.currentApp.reload();
            }
        }
    };
    
})(sapps.api, sapps.ui.main);
