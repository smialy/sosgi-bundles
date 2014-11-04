(function($sosgi, $ui) {



    $ui.Plugin = function sosgi_dev_ui_Plugin() {};
    $ui.Plugin.prototype = {
        getName: function() {

        },
        show: function() {

        },
        hide: function() {

        }
    };

    $ui.Notify = function sosgi_dev_ui_Notify() {};
    $ui.Notify.prototype = {
        show: function($dom) {

        },
        remove: function() {

        }
    };

    var PluginsView = function($dom) {

        var $plugins = $dom.querySelector('.plugins');
        var plugins = {};
        var actual = null;
        var state = false;


        var show = function(id) {
            plugins[id].show();
            actual = id;
            var $active = $plugins.querySelector('.pid-' + id);
            if ($active) {
                $active.classList.add('active');
            }
        };
        var hide = function(id) {
            plugins[id].hide();
            actual = null;
            var $active = $plugins.querySelector('.active');
            if ($active) {
                $active.classList.remove('active');
            }
        };

        var handler = function(e) {
            var $el = e.target;
            if ($el.classList.contains('plugin')) {
                var pid = $el.dataset.pid;
                if (pid === actual) {
                    if (state) {
                        hide(pid);
                    } else {
                        show(pid);
                    }
                    state = !state;
                } else {
                    if (actual) {
                        hide(actual);
                    }
                    state = true;
                    show(pid);

                }
            }
        };

        sjs.dom.on($plugins, 'click', handler);

        this.addPlugin = function(id, plugin) {
            id = id + '';
            var $plugin = document.createElement('div');
            $plugin.innerHTML = plugin.getName();
            $plugin.classList.add('plugin');
            $plugin.classList.add('pid-' + id);
            $plugin.dataset.pid = id;
            $plugins.appendChild($plugin);
            plugins[id] = plugin;
            plugin.close = function() {
                hide(id);
            };
        };
        this.removePlugin = function(id, plugin) {
            id = id + '';
            var $plugin = $plugins.querySelector('.pid-' + id);
            $plugins.removeChild($plugin);
            delete plugins[id];
            if (id === actual) {
                actual = null;
                state = false;
            }
        };
        this.remove = function() {
            sjs.dom.off($plugins, 'click', handler);
        };
    };

    var NotifyView = function($dom) {
        var $notifies = $dom.querySelector('.notifies');
        var notifies = {};
        this.addNotify = function(id, notify) {
            id = id + '';
            var $notify = document.createElement('div');
            $notify.classList.add('notify');
            $notify.classList.add('nid-' + id);
            $notify.dataset.pid = id;
            $notifies.appendChild($notify);
            notifies[id] = notify;
            notify.show($notify);
        };
        this.removeNotify = function(id, notify) {
            id = id + '';
            var $notify = $notifies.querySelector('.nid-' + id);
            $notifies.removeChild($notify);
            delete notifies[id];
            notify.remove();
        };
    };

    var createView = function(html) {
        var container = document.createElement('div');
        container.innerHTML = html.trim();
        var $dom = container.firstChild;
        document.body.appendChild($dom);
        return $dom;
    };
    $ui.core.Activator = function() {
        var plugins, notify, ptracker, ntracker;

        this.start = function(ctx) {

            var $dom = createView(ctx.bundle.resource('res/dev.html'));
            plugins = new PluginsView($dom);
            notify = new NotifyView($dom);
            ptracker = ctx.services.tracker($ui.Plugin, {
                addingService: function(reference, service) {
                    plugins.addPlugin(reference.id, service);
                },
                removedService: function(reference, service) {
                    plugins.removePlugin(reference.id, service);
                }
            }).open();

            ntracker = ctx.services.tracker($ui.Notify, {
                addingService: function(reference, service) {
                    notify.addNotify(reference.id, service);
                },
                removedService: function(reference, service) {
                    notify.removeNotify(reference.id, service);
                }
            }).open();

        };
        this.stop = function(ctx) {
            ptracker.close();
            plugins.remove();
            ntracker.close();
            notify.remove();
        };
    };

})(sosgi, sosgi.dev.ui);
