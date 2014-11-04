(function($osgi, $ui) {

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
            this.ctx.on.bundle.add(this);
        },
        stop: function() {
            this._view.hide();
            this.ctx.on.bundle.remove(this);

        },
        bundleEvent: function(event) {
            var bundle = event.bundle;
            switch (event.type) {
                case sosgi.framework.event.INSTALLING:
                    this._view.info('Installing bundle:' + bundle.meta.namespace);
                    break;
                case sosgi.framework.event.INSTALLED:
                    this._view.info('Installed bundle:' + bundle.meta.namespace);
                    break;

                case sosgi.framework.event.STARTING:
                    this._view.info('Starting bundle: ' + bundle.meta.namespace);
                    break;
                case sosgi.framework.event.STARTED:
                    this._view.info('Started bundle: ' + bundle.meta.namespace);
                    if (['sapps.login','sapps.ui.main'].contains(bundle.meta.namespace)) {
                        this._view.hide();
                    }
                    break;
            }
        }
    });


    $ui.Activator = Class({
        start: function(ctx) {
            this.service = new Loader(ctx, new View(ctx.bundle.resource('res/box.html')));
            this.service.start();
        },
        stop: function(ctx) {
            this.service.stop();
        }
    });

})(sosgi.framework, sapps.ui.loader);
