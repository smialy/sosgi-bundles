(function($osgi, $gui) {

    var Class = sjs.Class;

    var View = Class({
        init: function(tpl) {
            var div = document.createElement('div');
            div.innerHTML = tpl;
            document.body.appendChild(div);
            this.$info = div.querySelector('.info');
            this.$div = div;
        },
        info: function(msg) {
            this.$info.innerHTML = msg;
        },
        show: function() {
            this.$div.style.display = 'block';
        },
        hide: function() {
            this.$div.style.display = 'none';
        }
    });

    var Loader = Class({
        init: function(ctx, view) {
            this.ctx = ctx;
            this._view = view;
        },
        start: function() {
            this._view.show();
            this.ctx.addBundleListener(this);
        },
        stop: function() {
            this._view.hide();
            this.ctx.removeBundleListener(this);

        },
        bundleEvent: function(event) {
            var bundle = event.bundle;
            switch (event.type) {
                case sosgi.framework.event.INSTALLING:
                    this._view.info('Installing bundle:' + bundle.namespace);
                    break;
                case sosgi.framework.event.INSTALLED:
                    this._view.info('Installed bundle:' + bundle.namespace);
                    break;

                case sosgi.framework.event.STARTING:
                    this._view.info('Starting bundle: ' + bundle.namespace);
                    break;
                case sosgi.framework.event.STARTED:
                    this._view.info('Started bundle: ' + bundle.namespace);
                    if (['sapps.login','sapps.ui.main'].contains(bundle.namespace)) {
                        this._view.hide();
                    }
                    break;
            }
        }
    });


    $gui.Activator = Class({
        start: function(ctx) {
            this.service = new Loader(ctx, new View(ctx.bundle.resource('res/box.html')));
            this.service.start();
        },
        stop: function(ctx) {
            this.service.stop();
        }
    });

})(sosgi.framework, sapps.loader.gui);
