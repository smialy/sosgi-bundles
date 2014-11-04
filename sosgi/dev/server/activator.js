(function($server) {

    var NAME = 'watchdog';

    $server.Activator = function() {

        this.start = function(ctx) {

            this.conn = new $server.Connection('ws://localhost:8000/dev/ws');
            this.conn.on.message.add(function(data) {
                var request = JSON.parse(data);
                if (request.action === 'reload') {
                    switch (request.body.type) {
                        case 'css':
                            var url = request.body.url;
                            var $head = document.querySelector('head');
                            var $oldLink = document.querySelector('link[href*="' + url + '"]');

                            var $link = document.createElement('link');
                            $link.charset = 'utf-8';
                            $link.type = 'text/css';
                            $link.rel = 'stylesheet';
                            $link.href = url + '?t=' + (new Date().getTime());
                            $head.appendChild($link);
                            if ($oldLink) {
                                $oldLink.parentNode.removeChild($oldLink);
                            }
                            break;
                        case 'bundle':
                            var namespace = request.body.namespace;
                            var bundle = ctx.getBundle(namespace);
                            if (bundle) {
                                bundle.uninstall();
                                ctx.installBundle(namespace.replace(/\./g, '/'), true);
                            } else {
                                ctx.installBundle(namespace.replace(/\./g, '/'));
                            }
                            break;
                    }
                }
            });
            this.conn.start();
        };

        this.stop = function(ctx) {
            if (this.conn) {
                this.conn.stop();
                this.conn = null;
            }
        };
    };

})(sosgi.dev.server);
