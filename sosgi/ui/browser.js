(function($ui) {
    var $a = document.createElement('a');

    var isHistory = !!(window.history && window.history.pushState);

    var lastUrl = location.href;
    var syncUrl = null;

    var urlResolve = function(url) {
        $a.setAttribute('href', url);
        return {
            href: $a.href,
            protocol: $a.protocol ? $a.protocol.replace(/:$/, '') : '',
            hostname: $a.hostname,
            host: $a.host,
            search: $a.search ? $a.search.replace(/^\?/, '') : '',
            hash: $a.hash ? $a.hash.replace(/^#/, '') : '',
            port: $a.port,
            pathname: ($a.pathname.charAt(0) === '/') ? $a.pathname : '/' + $a.pathname
        };
    };

    var LocationHistory = function(baseUrl, callback) {
        //console.log('LocationHistory(uri=' + baseUrl + ')');

        var hash = baseUrl.indexOf('#');
        if (hash !== -1) {
            baseUrl = baseUrl.substr(0, hash);
        }
        var baseRoot = baseUrl.substr(0, baseUrl.lastIndexOf('/') + 1);

        this.prepare = function(url) {
            if (url.startsWith(baseUrl)) {
                url = url.substr(baseUrl.length);
                return baseUrl + url;
            } else if (url.startsWith(baseRoot)) {
                url = url.substr(baseRoot.length);
                return baseRoot + url;
            }
            return null;
        };
        this.set = function(url, replace) {
            if (lastUrl !== url) {
                //console.log('LocationHistory::set(url=' + url + ')');
                if (replace) {
                    window.history.replace(null, '', url);
                } else {
                    history.pushState(null, '', url);
                }
                lastUrl = url;
                callback(url);
            }
        };
        this.get = function() {
            return location.href.replace(/%27/g, "'");
        };
        window.addEventListener('popstate', (function(self) {
            return function(event) {
                callback(self.get());
            };
        })(this), false);
    };

    var LocationHash = function(baseUrl) {

        this.prepare = function(url) {
            if (url.startsWith(baseUrl)) {
                url = url.substr(baseUrl.length);
                return baseUrl + url;
            } else if (url.startsWith(baseUrl)) {
                url = url.substr(baseUrl.length);
                return baseUrl + url;
            }
            return null;
        };
        this.url = function(url, replace) {
            return location.href.replace(/%27/g, "'");
        };
    };
    var getBaseUrl = function(url) {
        var baseElement = document.querySelector('base');
        if (baseElement) {
            url = baseElement.getAttribute('href');
        }
        var uri = urlResolve(url);
        return uri.protocol + '://' + uri.host + uri.pathname;
    };
    $ui.Browser = function(params) {
        params = params || {};
        var baseUrl = getBaseUrl(params.base || location.href);
        var Location = isHistory ? LocationHistory : LocationHash;
        var $location = new Location(baseUrl, function(url) {
            fireUrlChange(url);
        });

        /**
         *
         * @param {String{ url New url (when use as setter)
         * @param (boolean) replace
         */
        this.url = function(url, replace) {
            if (url) {
                $location.set(url, replace);
            } else {
                return $location.get();
            }
        };
        this.feature = function(name) {

        };
        this.url.change = function(callback) {
            if (!listeners.contains(callback)) {
                listeners.push(callback);
                callback(urlResolve($location.get()));
            }
            return {
                remove: function() {
                    listeners.remove(callback);
                }
            };
        };
        var listeners = [];
        var fireUrlChange = function(url) {
            url = urlResolve(url);
            for (var i = 0; i < listeners.length; i++) {
                listeners[i](url);
            }
        };
        document.addEventListener('click', function(e) {
            if (e.ctrlKey || e.metaKey || e.which !== 1) {
                return;
            }
            var target = e.target;
            while (target) {
                var tag = target.nodeName.toLowerCase();
                if (tag === 'body' || tag === 'html') {
                    break;
                }
                //target="_blank"
                if (target.getAttribute('target')) {
                    break;
                }

                var url = null;
                if (tag === 'a') {
                    if (target.getAttribute('href') === '#') {
                        e.preventDefault();
                        break;
                    } else {
                        url = target.href;
                    }
                } else if (target.dataset && 'href' in target.dataset) {
                    url = urlResolve(target.dataset.href).href;
                }
                if (url !== null) {
                    e.preventDefault();
                    $location.set(url);
                    break;
                }
                target = target.parentNode;
            }
        }, false);
    };
})(sosgi.ui);
