/*! sosgi - v1.0.0 - 2014-11-04 */
(function() {
    'use strict';

    var framework = sjs.ns('sosgi.framework', {});

    framework.IActivator = function() {};
    framework.IActivator.prototype = {
        start: function(ctx) {
            throw new Error('Not implemented: sosgi.framework.Activator::start(ctx)');
        },
        stop: function(ctx) {
            throw new Error('Not implemented: sosgi.framework.Activator::stop(ctx)');
        }
    };

    framework.OBJECTCLASS = 'objectclass';
    framework.SERVICE_ID = 'service_id';

})();

(function($framework) {
    'use strict';

    var ldap = (function() {
        var escapeChars = '';
        var addSlashes = function(str) {
            return str.replace(/\\/g, '\\\\').
            replace(/\u0008/g, '\\b').
            replace(/\t/g, '\\t').
            replace(/\n/g, '\\n').
            replace(/\f/g, '\\f').
            replace(/\r/g, '\\r').
            replace(/'/g, '\\\'').
            replace(/"/g, '\\"');
        };

        var MATCH_ALL = 'match_all';
        var AND = 'and';
        var OR = 'or';
        var NOT = 'not';
        var EQ = 'eq';
        var LTE = 'lte';
        var GTE = 'gte';
        var APPROX = 'approx';
        var PRESENT = 'present';
        var SUBSTRING = 'substring';

        var criterias = {
            eq: function(params) {
                if (this.name in params) {
                    if (sjs.isArray(params[this.name])) {
                        return params[this.name].contains(this.value);
                    }
                    return params[this.name] === this.value;
                }
                return false;
            },
            lte: function(params) {
                return this.name in params ? params[this.name] <= this.value : false;
            },
            gte: function(params) {
                return this.name in params ? params[this.name] >= this.value : false;
            },
            approx: function(params) {
                return this.name in params ? params[this.name].indexOf(this.value) !== -1 : false;
            },
            present: function(params) {
                return this.name in params;
            },
            substring: function(params) {
                return this.name in params ? this.value.test(params[this.name]) : false;
            },
            or: function(params) {
                for (var i = 0; i < this.value.length; i++) {
                    if (this.value[i].match(params)) {
                        return true;
                    }
                }
                return false;
            },
            and: function(params) {
                for (var i = 0; i < this.value.length; i++) {
                    if (!this.value[i].match(params)) {
                        return false;
                    }
                }
                return true;
            },
            not: function(params) {
                for (var i = 0; i < this.value.length; i++) {
                    if (!this.value[i].match(params)) {
                        return true;
                    }
                }
                return false;
            },
            match_all: function(params) {
                return true;
            }
        };
        var Filter = function(opt, value, name) {
            this.opt = opt;
            this.value = value || null;
            this.name = name || '';
        };
        Filter.prototype.match = function(params) {
            return criterias[this.opt].call(this, params);
        };
        Filter.prototype.toString = function() {
            return '[Filter opt=' + this.opt + ' name=' + this.name + ' value=' + this.value + ']';
        };

        var subfilter = function(filter, start, end) {
            var checkEqual = function(pos) {
                if (filter.charAt(pos) !== '=') {
                    throw new Error('Expected <= in filter: ' + sub);
                }
            };
            var sub = filter.substring(start, end + 1);
            if (sub === '*') {
                return new Filter(MATCH_ALL);
            }
            var opt = -1;
            var endName = start;

            while (endName < end) {
                if ('=<>~*'.indexOf(filter.charAt(endName)) > -1) {
                    break;
                }
                endName++;
            }
            if (start === endName) {
                throw new Error('Not found filter name: ' + sub);
            }
            var name = filter.substring(start, endName);
            start = endName;
            switch (filter.charAt(start)) {
                case '=':
                    opt = EQ;
                    ++start;
                    break;
                case '<':
                    checkEqual(start + 1);
                    opt = LTE;
                    start += 2;
                    break;
                case '>':
                    checkEqual(start + 1);
                    opt = GTE;
                    start += 2;
                    break;
                case '~':
                    checkEqual(start + 1);
                    opt = APPROX;
                    start += 2;
                    break;
                default:
                    throw new Error('Unknowm filter operator: ' + sub);
            }
            if (start > end) {
                throw new Error('Not found filter value');
            }
            var value = filter.substring(start, end + 1);
            if (opt === EQ) {
                if (value === '*') {
                    opt = PRESENT;
                } else if (value.indexOf('*') !== -1) {
                    opt = SUBSTRING;
                    value = new RegExp('^' + value.split('*').join('.*?') + '$');
                }
            }
            return new Filter(opt, value, name);
        };
        return {
            prepare: function(filters) {
                var filter = new Filter(OR, []);
                for (var i = 0; i < filters.length; i += 1) {
                    filter.value.push(new Filter(EQ, filters[i].value, filters[i].name));
                }
                if (filter.value.length === 1) {
                    return filter.value[0];
                }
                return filter;
            },
            parse: function(filter) {
                if (!filter) {
                    return null;
                }
                if (filter instanceof Filter) {
                    return filter;
                }
                if (typeof filter !== 'string') {
                    throw new Error('Incorect filter type. Expected string');
                }
                filter = filter.trim();
                if (!filter) {
                    return null;
                }
                //add ( - ?
                if (filter.charAt(0) !== '(') {
                    throw new Error('Miss startring: (');
                }
                //add ) - ?
                if (filter.charAt(filter.length - 1) !== ')') {
                    throw new Error('Miss ending: )');
                }


                var pos = -1;
                var len = filter.length;
                var skipWhitespace = function() {
                    while (pos < len) {
                        if (!/\s/.test(filter)) {
                            return pos;
                        }
                        pos++;
                    }
                    pos = -1;
                };

                var sf = null;

                var isEscaped = false;
                var peak = '';
                var stack = [];
                while (++pos < len) {

                    if (isEscaped) {
                        isEscaped = false;
                        continue;
                    }

                    if (filter.charAt(pos) === '(') {
                        skipWhitespace();
                        switch (filter.charAt(pos + 1)) {
                            case '&':
                                stack.push(new Filter(AND, []));
                                break;
                            case '|':
                                stack.push(new Filter(OR, []));
                                break;
                            case '!':
                                stack.push(new Filter(NOT, []));
                                break;
                            default:
                                stack.push(pos + 1);
                        }
                    } else if (filter.charAt(pos) === ')') {
                        var top = stack.pop() || null;
                        var head = stack[stack.length - 1];
                        if (top instanceof Filter) {
                            if (head instanceof Filter) {
                                head.value.push(top);
                            } else {
                                sf = top;
                            }
                        } else if (head instanceof Filter) {
                            head.value.push(subfilter(filter, top, pos - 1));
                        } else {
                            sf = subfilter(filter, top, pos - 1);
                        }
                    } else if (!isEscaped && filter.charAt(pos) === '\\') {
                        isEscaped = true;
                    }

                }
                if (sf === null) {
                    throw new Error('Incorect filter: ' + filter);
                }
                return sf;
            },
            escape: function(name) {
                var sb = [];
                if ((name.length > 0) && ((name.charAt(0) === ' ') || (name.charAt(0) === '#'))) {
                    sb.push('\\');
                }

                for (var i = 0; i < name.length; i++) {
                    var curChar = name.charAt(i);
                    switch (curChar) {
                        case '\\':
                            sb.push("\\\\");
                            break;
                        case ',':
                            sb.push("\\,");
                            break;
                        case '+':
                            sb.push("\\+");
                            break;
                        case '"':
                            sb.push("\\\"");
                            break;
                        case '<':
                            sb.push("\\<");
                            break;
                        case '>':
                            sb.push("\\>");
                            break;
                        case ';':
                            sb.push("\\;");
                            break;
                        default:
                            sb.push(curChar);
                    }
                }
                if ((name.length > 1) && (name.charAt(name.length - 1) === ' ')) {
                    sb[sb.length - 1] = '\\ ';
                }
                return sb.join('');
            }
        };
    })();
    $framework.filter = ldap;

})(sosgi.framework);

(function($framework) {
    'use strict';

    var pack = function(filter) {
        if (filter.charAt(0) !== '(' && filter.charAt(filter.length - 1) !== ')') {
            return '(' + $framework.OBJECTCLASS + '=' + filter + ')';
        }
        return filter;
    };

    var utils = {
        /**
         * Prepare regoster serivce name
         *
         * @param {String|Function} name
         */
        functionName: function(name) {
            if (!name) {
                throw new Error('Incorrenct function name');
            }
            if (typeof name === 'function') {
                if (name['$$fname']) {
                    name = name['$$fname'];
                } else {
                    var fname = /function\s+(.+?)\(/.exec(name.toString());
                    fname = fname ? fname[1] : '';
                    fname = fname.replace(/_/g, '.');
                    name['$$fname'] = fname;
                    name = fname;
                }
            }
            return name;
        },
        /**
         * @param {Array|String} names
         * @return {Array}
         */
        functionNames: function(names) {
            if (!sjs.isArray(names)) {
                names = [names];
            }
            var name, buff = [];
            for (var i = 0; i < names.length; i++) {
                buff.push(utils.functionName(names[i]));
            }
            return buff;
        },
        /**
         * @param {String|Function|Filter} filter
         * @return Filter
         */
        prepareFilter: function(filter) {
            var names, filters = [],
                i;
            if (typeof filter === 'string') {
                filter = filter.trim();
                if (filter !== '*' && filter.charAt(0) !== '(' && filter.charAt(filter.length - 1) !== ')') {
                    return $framework.filter.prepare([{
                        name: $framework.OBJECTCLASS,
                        value: filter
                    }]);
                }
                names = utils.functionNames(filter);
                for (i = 0; i < names.length; i++) {
                    filters.push(pack(names[i]));
                }
                filter = filters.join('');
                if (filters.length > 1) {
                    filter = '(|' + filter + ')';
                }
                return $framework.filter.parse(filter);
            }
            if (typeof filter === 'function' || sjs.isArray(filter)) {
                names = utils.functionNames(filter);
                for (i = 0; i < names.length; i++) {
                    filters.push({
                        name: $framework.OBJECTCLASS,
                        value: names[i]
                    });
                }
                return $framework.filter.prepare(filters);
            }
            return $framework.filter.parse(filter);
        }
    };
    $framework.utils = utils;
})(sosgi.framework);

(function() {
    'use strict';

    var Class = sjs.Class;

    var IResource = Class({
        load: function(url) {
            throw new Error('Not implement: Resource::load(url)');
        },
        match: function(url) {
            throw new Error('Not implement: Resource::match(url)');
        }
    });
    var CssResource = Class(IResource, {
        match: function(location) {
            return !!location.match(/\.css$/);
        },
        load: function(location, callback) {
            var defer = sjs.defer();

            var old = document.querySelector('link[href^="' + location + '"]');
            var head = document.getElementsByTagName('head')[0];
            var link = document.createElement('link');
            link.charset = 'utf-8';
            link.type = 'text/css';
            link.rel = 'stylesheet';
            link.addEventListener('load', this._response.bind(link, 'success', location, defer), false);
            link.addEventListener('error', this._response.bind(link, 'error', location, defer), false);
            link.addEventListener('abort', this._response.bind(link, 'abort', location, defer), false);
            link.href = location + '?t=' + (new Date().getTime());
            head.appendChild(link);
            if (old) {
                old.parentNode.removeChild(old);
            }
            return defer.promise;
        },
        _response: function(status, location, defer) {
            if (status === 'success') {
                defer.resolve();
            } else {
                defer.reject('Error loading resource: ' + location);
            }
        }
    });
    var HtmlResource = Class(IResource, {
        match: function(location) {
            return !!location.match(/\.html$/);
        },
        load: function(location) {
            var defer = sjs.defer();
            var xhr = new XMLHttpRequest();
            xhr.addEventListener('load', this._response.bind(xhr, location, defer), false);
            xhr.addEventListener('error', this._response.bind(xhr, location, defer), false);
            xhr.addEventListener('abort', this._response.bind(xhr, location, defer), false);

            xhr.open("get", location + '?t=' + (new Date().getTime()), true);
            xhr.send();
            return defer.promise;
        },
        _response: function(location, defer) {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    defer.resolve(location, this.responseText);
                } else {
                    defer.reject('Error on loading  : ' + location + ' with status: ' + this.status);
                }
            }
        }
    });
    var ScriptResource = Class(IResource, {
        match: function(location) {

            return !!location.match(/\.js$/);
        },
        load: function(location) {
            var defer = sjs.defer();
            var script = document.querySelector('script[src="' + location + '"]');
            if (script) {
                script.parentNode.removeChild(script);
            }
            var head = document.getElementsByTagName('head')[0];
            script = document.createElement('script');
            script.type = 'text/javascript';
            script.charset = 'utf-8';
            script.addEventListener('load', this._response.bind(script, 'success', location, defer), false);
            script.addEventListener('error', this._response.bind(script, 'error', location, defer), false);
            script.addEventListener('abort', this._response.bind(script, 'abort', location, defer), false);
            script.src = location;
            head.appendChild(script);
            return defer.promise;
        },
        _response: function(status, location, defer) {
            if (status === 'success') {
                defer.resolve();
            } else {
                defer.reject('Error loading resource: ' + location);
            }
        }
    });
    var JsonResource = Class(IResource, {
        match: function(location) {

            return !!location.match(/\.json$/);
        },
        load: function(location) {
            var defer = sjs.defer();

            var xhr = new XMLHttpRequest();
            xhr.addEventListener('load', this._response.bind(xhr, location, defer), false);
            xhr.addEventListener('error', this._response.bind(xhr, location, defer), false);
            xhr.addEventListener('abort', this._response.bind(xhr, location, defer), false);

            xhr.open("get", location, true);
            xhr.send();
            return defer.promise;
        },
        _response: function(location, defer) {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    try {
                        var data = this.responseText;
                        var Fn = Function;
                        data = (new Fn("return " + data))();
                        defer.resolve(data);
                        return;
                    } catch (e) {
                        defer.reject(e);
                    }
                } else {
                    defer.reject('Error on loading  : ' + location + ' with status: ' + this.status);
                }
            }
        }
    });

    var Loader = Class({
        init: function(bundle, path) {
            this._bundle = bundle;
            this._path = path;
            this._bundle.loader = this;

            this._resources = [];
        },
        addResource: function(resource) {
            /* sjs.assert.instanceof(loader, BundleLoader) */
            resource.loader = this;
            this._resources.include(resource);
        },
        removeResource: function(resource) {
            this._resources.remove(resource);
        },
        resetResources: function() {
            this._resources = [];
        },
        setPath: function(path) {
            this._path = path;
        },
        getPath: function() {
            return this._path;
        },
        loadBundle: function(location) {
            return this._bundle.load(this._path + location);
        },
        loadFiles: function(location, files) {
            return this._bundle.loadFiles(this._path + location + '/', files);
        },
        load: function(location) {
            for (var i = 0, j = this._resources.length; i < j; i++) {
                var resource = this._resources[i];
                if (resource.match(location)) {
                    return resource.load(location);
                }
            }
        }
    });

    var BundleLoader = Class({
        init: function() {
            this.bundles = [];
            this._queue = [];
            this._lock = false;
        },
        load: function(location, callback) {
            var defer = sjs.defer();
            this._queue.push({
                location: location,
                defer: defer
            });
            this._load();
            return defer.promise;
        },
        _load: function() {

            if (this._lock) {
                return;
            }
            var queue = this._queue;
            var self = this;
            var nextTime = function() {
                self._lock = false;
                next();
            };
            var next = function() {
                if (queue.length && !self._lock) {
                    self._lock = true;
                    var ev = queue.shift();
                    self.loader.load(ev.location + '/bundle.json').then(function(config) {
                        //create namespace
                        if (config.namespace) {
                            sjs.ns(config.namespace, {});
                        }
                        self.loadFiles(ev.location + '/', config.files).then(function(resources) {
                            nextTime();
                            config.resources = resources;
                            ev.defer.resolve(config);
                        }, function(err) {
                            nextTime();
                            ev.defer.reject(err);
                        });
                    }, function(err) {
                        nextTime();
                        ev.defer.reject(err);
                    });
                }
            };

            next();
        },
        loadFiles: function(location, files) {
            var defer = sjs.defer();
            if (files && files.length) {
                var loader = this.loader;
                var load = function(file) {
                    return function() {
                        return loader.load(location + file);
                    };
                };
                var prepare = function() {
                    var buff = [];
                    for (var i = 0; i < files.length; i++) {
                        buff.push(load(files[i]));
                    }
                    return buff;
                };
                sjs.defer.chain(prepare()).then(function() {
                    var resources = {};
                    for (var i = 0; i < arguments.length; i++) {
                        var item = arguments[i];
                        if (item.length === 2) {
                            resources[item[0].substr(location.length)] = item[1];
                        }
                    }
                    defer.resolve(resources);
                }, defer.reject);
            } else {
                defer.resolve({});
            }
            return defer.promise;
        }
    });

    sosgi.framework.loader = {
        factor: function(path) {
            var loader = new Loader(new BundleLoader(), path);
            loader.addResource(new JsonResource());
            loader.addResource(new ScriptResource());
            loader.addResource(new CssResource());
            loader.addResource(new HtmlResource());

            return loader;
        },
        Loader: Loader,
        IResource: IResource,
        JsonResource: JsonResource,
        ScriptResource: ScriptResource,
        CssResource: CssResource
    };

})();

(function($framework) {
    'use strict';

    var Class = sjs.Class;
    var $prepareFilter = $framework.utils.prepareFilter;

    var __ = {

        INSTALLED: 1,
        STARTED: 2,
        STOPPED: 4,
        UPDATED: 8,
        UNINSTALLED: 10,
        RESOLVED: 20,
        UNRESOLVED: 40,
        STARTING: 80,
        STOPPING: 100,

        REGISTERED: 1,
        MODIFIED: 2,
        UNREGISTERED: 4,
        MODIFIED_ENDMATCH: 8
    };

    var Event = function(type, bundle) {
        Object.defineProperties(this, {
            type: {
                value: type,
                enumerable: true
            },
            bundle: {
                value: bundle,
                enumerable: true
            }
        });
        Object.freeze(this);
    };
    Event.prototype = {
        toString: function() {
            return '[Event type=' + this.type + ']';
        }
    };
    var BundleEvent = function(type, bundle) {
        Event.call(this, type, bundle);
    };
    BundleEvent.prototype = Object.create(Event.prototype);
    BundleEvent.prototype.toString = function() {
        return '[BundleEvent type=' + this.type + ' bundle.namespace=' + this.bundle.meta.namespace + ']';
    };

    var FrameworkEvent = function(type, bundle) {
        BundleEvent.call(this, type, bundle);
    };
    FrameworkEvent.prototype = Object.create(BundleEvent.prototype);
    FrameworkEvent.prototype.toString = function() {
        return '[FrameworkEvent type=' + this.type + ']';
    };


    var ServiceEvent = function(type, ref, properties) {
        Object.defineProperties(this, {
            reference: {
                value: ref,
                enumerable: true
            },
            properties: {
                value: properties || null,
                enumerable: true
            }
        });
        Event.call(this, type, ref.bundle);
    };
    ServiceEvent.prototype = Object.create(Event.prototype);
    ServiceEvent.prototype.toString = function() {
        return '[ServiceEvent type=' + this.type + ' servie.name=' + this.reference.name + ']';
    };

    var Listener = Class();
    var IBundleListener = Class(Listener, {
        bundleEvent: function(event) {
            throw new Error('Not implements: IBundleListener::bundleEvent()');
        }
    });
    var IFrameworkListener = Class(Listener, {
        frameworkEvent: function(event) {
            throw new Error('Not implements: IFrameworkListener::frameworkEvent()');
        }
    });
    var IServiceListener = Class(Listener, {
        serviceEvent: function(event) {
            throw new Error('Not implements: IServiceListener::serviceEvent()');
        }
    });

    var Listeners = function(logger, callbackName) {
        this._logger = logger;
        this._listeners = [];
        this._callbackName = callbackName;
    };
    Listeners.prototype = {
        contains: function(bundle, listener) {
            var info;
            for (var i = 0, j = this._listeners.length; i < j; i++) {
                info = this._listeners[i];
                if (info[0] === bundle && info[1] === listener) {
                    return true;
                }
            }
            return false;
        },
        size: function() {
            return this._listeners.length;
        },
        remove: function(bundle, listener) {
            var info;
            for (var i = 0, j = this._listeners.length; i < j; i++) {
                info = this._listeners[i];
                if (info[0] === bundle && info[1] === listener) {
                    this._listeners.splice(i, 1);
                    return true;
                }
            }
            return false;
        },
        add: function(bundle, listener, filter) {
            //console.debug('Add listener' + (filter ? ': ' + filter : ''));
            filter = $prepareFilter(filter);
            var info;
            for (var i = 0, j = this._listeners.length; i < j; i++) {
                info = this._listeners[i];
                if (info[0] === bundle && info[1] === listener) {
                    return false;
                }
            }
            this._listeners.push([bundle, listener, filter]);
            return true;
        },
        fire: function(event) {

            var info, listener, cbn = this._callbackName;
            for (var i = 0, l = this._listeners.length; i < l; i++) {
                info = this._listeners[i];
                if (event instanceof ServiceEvent) {
                    if (info[2] === null || !info[2].match(event.reference.properties)) {
                        continue;
                    }
                }
                listener = info[1];

                try {
                    if (typeof listener[cbn] === 'function') {
                        listener[cbn].call(listener, event);
                    } else {
                        listener(event);
                    }
                } catch (e) {
                    this._logger.error('Error with listener', e);
                }
            }
        },
        clean: function(bundle) {
            for (var i = 0; i < this._listeners.length;) {
                if (this._listeners[i][0] === bundle) {
                    this._listeners.splice(i, 1);
                    continue;
                }
                i++;
            }
        }
    };

    var EventDispatcher = function(logger) {

        Object.defineProperties(this, {
            framework: {
                value: new Listeners(logger, 'frameworkEvent'),
                enumerable: true
            },
            bundle: {
                value: new Listeners(logger, 'bundleEvent'),
                enumerable: true
            },
            service: {
                value: new Listeners(logger, 'serviceEvent'),
                enumerable: true
            }
        });
        Object.freeze(this);
    };
    EventDispatcher.prototype = {
        fireEvent: function(event) {
            if (event instanceof BundleEvent) {
                this.bundle.fire(event);
            } else if (event instanceof FrameworkEvent) {
                this.framework.fire(event);
            } else if (event instanceof ServiceEvent) {
                this.service.fire(event);
            }
            throw new Error('Expected one of event: ServiceEvent, BundleEvent, FrameworkEvent');
        },
        removeAll: function(bundle) {
            this.framework.clean(bundle);
            this.bundle.clean(bundle);
            this.service.clean(bundle);
        }
    };

    $framework.Event = Event;
    $framework.BundleEvent = BundleEvent;
    $framework.FrameworkEvent = FrameworkEvent;
    $framework.ServiceEvent = ServiceEvent;
    $framework.IBundleListener = IBundleListener;
    $framework.IServiceListener = IServiceListener;
    $framework.IFrameworkListener = IFrameworkListener;
    $framework.EventDispatcher = EventDispatcher;
    $framework.event = __;

})(sosgi.framework);

(function($framework) {
    'use strict';

    var $event = $framework.event;
    var $prepareFilter = $framework.utils.prepareFilter;
    var $functionNames = $framework.utils.functionNames;

    /**
     * @type {sosgi.framework.service.Registry}
     */
    var Registry = function(logger, events, serviceCallback) {
        this._logger = logger;
        this._serviceCallback = serviceCallback;
        this.events = events;

        this._services = {};
        this._size = 0;
        this._sid = 0;
    };
    Registry.prototype = {
        /**
         * @param {sosgi.framework.Bundle} bundle
         * @param {string} name
         * @param {object} service
         * @return {sosgi.framework.service.Registration}
         */
        register: function(bundle, name, service, properties) {
            name = $functionNames(name);

            //prepare properties
            var sid = this._sid += 1;
            this._size += 1;
            properties = properties || {};
            properties[$framework.OBJECTCLASS] = name;
            properties[$framework.SERVICE_ID] = sid;


            var registration = new Registration(this, bundle, sid, properties);
            var bid = bundle.id;
            this._services[sid] = {
                sid: sid,
                bid: bid,
                using: [],
                name: name,
                service: service,
                registration: registration,
                reference: registration.reference,
                properties: properties
            };

            this.events.service.fire(new $framework.ServiceEvent($event.REGISTERED, registration.reference));
            return registration;
        },
        /**
         * @param {sosgi.framework.Bundle} bundle
         * @param {sosgi.framework.service.Registration} obj
         */
        unregister: function(bundle, registration) {
            if (registration instanceof Registration) {
                var sid = registration.id;
                if (sid in this._services) {
                    var opts = this._services[sid];
                    if (opts.bid === bundle.id) {
                        this.events.service.fire(new $framework.ServiceEvent($event.UNREGISTERED, opts.reference));
                        if (opts.using > 0) {
                            throw new Error('Service: "' + opts.name + '" from bundle (id=' + opts.bid + ') is using by budle(s): (id=' + opts.using.join(',') + ')');
                        }
                        delete this._services[sid];
                        this._size -= 1;
                        return true;
                    } else {
                        throw new Error('Bundle (id=' + bundle.id + ') try remove service: "' + opts.name + '" registered by bundle (id=' + opts.bid + ')');
                    }
                }
            }
            return false;
        },
        /**
         * @param {sosgi.framework.Bundle} bundle Unregister all bundle services
         */
        unregisterAll: function(bundle) {
            var bid = bundle.id;
            for (var sid in this._services) {
                if (this._services[sid].bid === bid) {
                    this.unregister(bundle, this._services[sid].registration);
                }
            }
        },
        find: function(bundle, reference) {
            var sid = reference.id;
            if (sid in this._services) {
                this._services[sid].using.include(bundle.id);
                return this._services[sid].service;
            }
            return null;
        },
        unget: function(bundle, reference) {
            var sid = reference.id;
            if (sid in this._services) {
                this._services[sid].using.remove(bundle.id);
            }
        },

        ungetAll: function(bundle) {
            var bid = bundle.id;
            for (var sid in this._services) {
                if (this._services[sid].using.indexOf(bid) !== -1) {
                    this._services[sid].using.remove(bid);
                }
            }
        },

        /**
         * @param {string} name
         * @param {(object|string)} filters
         * @return {sosgi.framework.service.Reference}
         */
        findReference: function(filter) {
            filter = $prepareFilter(filter);
            for (var sid in this._services) {
                if (filter.match(this._services[sid].properties)) {
                    return this._services[sid].reference;
                }
            }
            return null;
        },
        /**
         * @param {string} name
         * @param {(object|string)} filters
         * @return {Array} Return list of references
         */
        findReferences: function(filter) {
            filter = $prepareFilter(filter);
            var buff = [];
            for (var sid in this._services) {
                if (filter.match(this._services[sid].properties)) {
                    buff.push(this._services[sid].reference);
                }
            }
            return buff;
        },
        /**
         * @param {sosgi.framework.Bundle} bundle
         * @return {Array} bundle Retrun list of references
         */
        findBundleReferences: function(bundle) {
            var buff = [];
            var bid = bundle.id;
            for (var sid in this._services) {
                if (this._services[sid].bid === bid) {
                    buff.push(this._services[sid].reference);
                }
            }
            return buff;
        },
        findBundleReferencesInUse: function(bundle) {
            var buff = [];
            var bid = bundle.id;
            for (var sid in this._services) {
                if (this._services[sid].using.indexOf(bid) !== -1) {
                    buff.push(this._services[sid].reference);
                }
            }
            return buff;
        },

        size: function() {
            return this._size;
        },
        updateProperties: function(registration, oldProps) {
            this.events.service.fire(new $framework.ServiceEvent($event.MODIFIED, registration.reference, oldProps));
        }

    };

    /**
     * @type {sosgi.framework.service.Registration}
     */
    var Registration = function(registry, bundle, id, properties) {

        properties = Object.freeze(properties);

        var reference = Object.create(null, {
            id: {
                value: id,
                enumerable: true
            },
            bundle: {
                value: bundle,
                enumerable: true
            },
            properties: {
                get: function() {
                    return properties;
                },
                enumerable: true
            }
        });

        /**
         * @param {String} name
         * @returns {Object}
         */
        reference.property = function(name) {
            return name in properties ? properties[name] : null;
        };

        reference.toString = function() {
            return 'sosgi.service.Reference(id=' + id + ')';
        };

        Object.defineProperties(this, {
            id: {
                value: id,
                enumerable: true
            },
            reference: {
                value: reference,
                enumerable: true
            }
        });

        /**
         * Unregister service
         *
         * @return {this}
         */
        this.unregister = function() {
            registry.unregister(bundle, this);
            return this;
        };

        /**
         * Update property
         * @param {String} name
         * @param {Object} value
         */
        this.update = function(name, value) {
            var oldProps = properties;
            properties = sjs.clone(properties);
            properties[name] = value;
            Object.freeze(properties);
            registry.updateProperties(this, oldProps);
        };

        /**
         *
         * @param {Object} newProperties
         */
        this.updateAll = function(newProperties) {
            var oldProps = properties;
            properties = sjs.clone(properties);
            for (var i in newProperties) {
                if (newProperties.hasOwnProperty(i)) {
                    properties[i] = newProperties;
                }
            }
            Object.freeze(properties);
            registry.updateProperties(this, oldProps);
        };

        this.toString = function() {
            return 'sosgi.framework.service.Registration(id=' + id + ')';
        };

    };


    $framework.service = {
        Registration: Registration,
        Registry: Registry
    };
})(sosgi.framework);

(function($framework) {
    'use strict';

    var __ = {
        UNINSTALLED: 1,
        INSTALLED: 2, //installed but not resolved
        RESOLVED: 4, //is able to start
        STARTING: 8, //actual starting
        STOPPING: 16, //actual stoping
        ACTIVE: 32 //now running
    };

    /**
     *
     * @type {sosgi.framework.Bundle}
     */
    function Bundle(id, framework, config) {

        var meta = metaValiadator(config);
        meta.fullname = meta.namespace + '.' + meta.name;

        var ctx = null;
        var state = __.INSTALLED;

        Object.defineProperties(this, {
            _framework: {
                value: framework
            },
            id: {
                value: id,
                enumerable: true
            },
            meta: {
                value: Object.freeze(meta),
                enumerable: true
            },
            state: {
                get: function() {
                    return state;
                },
                set: function(newstate) {
                    if (isState(newstate)) {
                        state = newstate;
                    }
                },
                enumerable: true
            },
            ctx: {
                get: function() {
                    return ctx;
                },
                enumerable: true
            }
        });
        this.setContext = function(_ctx) {
            ctx = _ctx;
        };
        this.unsetContext = function() {
            ctx = null;
        };

    }
    Bundle.prototype = {
        resource: function(name) {
            return name in this.meta.resources ? this.meta.resources[name] : null;
        },
        start: function() {
            return this._framework.startBundle(this);
        },
        stop: function() {
            return this._framework.stopBundle(this);
        },
        reload: function(autostart) {
            return this._framework.reloadBundle(this, autostart);
        },
        uninstall: function() {
            return this._framework.uninstallBundle(this);
        },
        toString: function() {
            return 'sosgi.framework.Bundle(id=' + this.id + ' name="' + this.meta.name + '" namespace=' + this.meta.namespace + ')';
        }
    };

    var Context = (function() {

        function bundles(framework, bundle) {
            var api = {
                exists: function(obj) {
                    return framework.hasBundle(obj);
                },
                get: function(obj) {
                    return framework.getBundle(obj);
                },
                all: function() {
                    return framework.bundles;
                },
                install: function(location, autoStart) {
                    framework.installBundle(location, autoStart);
                },
                uninstall: function(bundle) {
                    framework.uninstallBunlde(bundle);
                }
            };
            return Object.freeze(api);
        }

        function services(ctx, registry, bundle) {
            var api = {
                get: function(reference) {
                    return registry.find(bundle, reference);
                },
                unget: function(reference) {
                    return registry.unget(bundle, reference);
                },
                register: function(name, service, properties) {
                    return registry.register(bundle, name, service, properties);
                },
                tracker: function(filter, listener) {
                    return new sosgi.framework.tracker.ServiceTracker(ctx, filter, listener);
                }
            };
            return Object.freeze(api);
        }

        function events(dispacher, bundle) {
            return Object.freeze({
                add: function(listener, filter) {
                    dispacher.add(bundle, listener, filter);
                },
                remove: function(listener) {
                    dispacher.remove(bundle, listener);
                }
            });
        }

        function Context(framework, bundle) {

            this.property = function(name, def) {
                return framework.property(name, def);
            };
            this.framework = framework;
            this.bundle = bundle;
            this.bundles = bundles(framework);
            this.service = function(reference) {
                return framework.registry.find(bundle, reference);
            };
            this.services = services(this, framework.registry, bundle);
            this.references = function(name, filter) {
                return framework.registry.findReferences(name, filter);
            };
            this.reference = function(name, filter) {
                return framework.registry.findReference(name, filter);
            };
            this.on = Object.freeze({
                service: events(framework.on.service, bundle),
                bundle: events(framework.on.bundle, bundle),
                framework: events(framework.on.framework, bundle)
            });

            Object.freeze(this);

        }
        return Context;
    })();

    var isState = (function() {
        var states = [];
        var names = Object.keys(__);
        for (var i = 0; i < names.length; i += 1) {
            states.push(__[names[i]]);
        }
        return function(val) {
            return states.indexOf(val) !== -1;
        };
    })();


    var valiator = (function() {
        var types = {
            valid: function(value, name) {
                if (!value) {
                    throw new Error('Not found: ' + name + ' in config');
                }
                return value;
            },
            defaults: function(value, defaults) {
                return value ? value : defaults;
            },
            array: function(value) {
                return sjs.isArray(value) ? value : [];
            },
            object: function(value) {
                return value ? value : {};
            }
        };
        return function(config) {
            return function(obj) {
                var buff = {};
                Object.keys(obj).forEach(function(name) {
                    buff[name] = obj[name];
                });
                Object.keys(config).forEach(function(name) {
                    var conf = typeof config[name] === 'string' ? [config[name]] : config[name];
                    buff[name] = types[conf[0]](obj[name], conf[1]);
                });

                return buff;
            };
        };
    })();

    var metaValiadator = valiator({
        name: 'valid',
        namespace: 'valid',
        description: ['defaults', ''],
        version: ['defaults', '0.0.0'],
        files: 'array',
        include: 'array',
        resources: 'object',
        components: 'object'
    });

    $framework.Bundle = Bundle;
    $framework.BundleContext = Context;

    $framework.bundle = __;

})(sosgi.framework);

(function($framework) {
    'use strict';

    var Class = sjs.Class;
    var $event = $framework.event;

    /**
     * @type {sosgi.framework.tracker.ServiceTrackerListener}
     */
    var ServiceTrackerListener = Class({
        /**
         *
         * @param {sosgi.framework.service.Reference} reference
         */
        addingService: function(reference) {

        },
        /**
         *
         * @param {sosgi.framework.service.Reference} reference
         */
        modifiedService: function(reference) {

        },
        /**
         *
         * @param {sosgi.framework.service.Reference} reference
         */
        removedService: function(reference) {

        }
    });
    /**
     * @type {sosgi.framework.tracker.BundleTrackerListener}
     */
    var BundleTrackerListener = Class({
        /**
         *
         * @param {sosgi.framework.Bundle} bundle
         */
        addingBundle: function(bundle) {

        },

        /**
         *
         * @param {sosgi.framework.Bundle} bundle
         */
        modifiedBundle: function(bundle) {

        },

        /**
         *
         * @param {sosgi.framework.Bundle} bundle
         */
        removedBundle: function(bundle) {

        }
    });

    /**
     * @type {sosgi.framework.tracker.Tracked}
     */
    var Tracked = Class({
        _tracked: [],
        track: function(item) {
            if (this._tracked.contains(item)) {
                this.modified(item);
            } else {
                this._tracked.push(item);
                this.adding(item);
            }
        },
        untrack: function(item) {
            if (this._tracked.contains(item)) {
                this._tracked.remove(item);
                this.removed(item);
            }
        },
        close: function() {
            var items = this._tracked.concat();
            for (var i = 0, j = items.length; i < j; i += 1) {
                this.untrack(items[i]);
            }
        },
        removed: function(item) {

        },
        adding: function(item) {

        },
        modified: function(item) {

        },
        size: function() {
            return this._tracked.length;
        },
        getItems: function() {
            return this._tracked.concat();
        }
    });

    /**
     * @type {sosgi.framework.tracker.ServiceTracked}
     */
    var ServiceTracked = Class(Tracked, {
        init: function(tracker) {
            this.tracker = tracker;
        },
        serviceEvent: function(event) {
            switch (event.type) {
                case $event.REGISTERED:
                case $event.MODIFIED:
                    this.track(event.reference);
                    break;
                case $event.UNREGISTERED:
                    this.untrack(event.reference);
                    break;
            }
        },
        removed: function(reference) {
            this.tracker.removedService(reference);
        },
        adding: function(reference) {
            this.tracker.addingService(reference);
        },
        modified: function(reference) {
            this.tracker.modifiedService(reference);
        }
    });

    /**
     * @type {sosgi.framework.tracker.ServiceTracker}
     */
    var ServiceTracker = Class({
        init: function(ctx, filter, listener) {
            if (!ctx) {
                throw new Error('Not set bundle context');
            }
            if (!filter) {
                throw new Error('Not set filter');
            }
            this._ctx = ctx;
            this._filter = filter;
            this._listener = listener;
            this._tracked = null;
        },
        open: function() {
            if (this._tracked === null) {
                this._tracked = new ServiceTracked(this);
                this._ctx.on.service.add(this._tracked, this._filter);
                var refs = this._ctx.references(this._filter);
                for (var i = 0, j = refs.length; i < j; i++) {
                    this._tracked.track(refs[i]);
                }
            }
            return this;
        },
        close: function() {
            if (this._tracked !== null) {
                this._ctx.on.service.remove(this._tracked);
                this._tracked.close();
                this._tracked = null;
            }
            return this;
        },
        /**
         *
         * @param {sosgi.framework.service.Reference} reference
         */
        addingService: function(reference) {
            if (this._listener) {
                this._listener.addingService(reference, this._ctx.service(reference));
            }
        },
        /**
         *
         * @param {sosgi.framework.service.Reference} reference
         */
        modifiedService: function(reference) {
            if (this._listener) {
                this._listener.modifiedService(reference, this._ctx.service(reference));
            }
        },
        /**
         *
         * @param {sosgi.framework.service.Reference} reference
         */
        removedService: function(reference) {
            if (this._listener) {
                this._listener.removedService(reference, this._ctx.service(reference));
            }
            this._ctx.services.unget(reference);
        },
        get size() {
            return this._tracked !== null ? this._tracked.size() : 0;
        },
        get reference() {
            if (this._tracked !== null) {
                var items = this._tracked.getItems();
                if (items.length) {
                    return items[0];
                }
            }
            return null;
        },
        get references() {
            return this._tracked !== null ? this._tracked.getItems() : [];
        },
        get service() {
            var ref = this.reference;
            return ref === null ? null : this._ctx.service(ref);
        },
        get services() {
            var buff = [];
            var refs = this.references;
            for (var i = 0, j = refs.length; i < j; i++) {
                buff.push(this._ctx.service(refs[i]));
            }
            return buff;
        }
    });

    /**
     * @type {sosgi.framework.tracker.BundleTracked}
     */
    var BundleTracked = Class(Tracked, {
        init: function(mask, listener) {
            this.listener = listener || null;
            this.mask = mask;
        },
        bundleEvent: function(event) {
            if (event.bundle.state & this.mask) {
                this.track(event.bundle);
            } else {
                this.untrack(event.bundle);
            }
        },
        removed: function(bundle) {
            if (this.listener !== null) {
                this.listener.removedBundle(bundle);
            }
        },
        adding: function(bundle) {
            if (this.listener !== null) {
                this.listener.addingBundle(bundle);
            }
        },
        modified: function(bundle) {
            if (this.listener !== null) {
                this.listener.modifiedBundle(bundle);
            }
        }
    });

    /**
     * @type {sosgi.framework.tracker.BundleTracker}
     * @constructor
     */
    var BundleTracker = Class({
        init: function(ctx, mask, listener) {
            this._ctx = ctx;
            if (!mask) {
                throw new Error('Not set mask for bundles');
            }
            this._mask = mask;
            this._listener = listener;
            this._tracked = null;
        },
        open: function() {
            if (this._tracked === null) {
                this._tracked = new BundleTracked(this._mask, this._listener || this);
                this._ctx.on.bundle.add(this._tracked);
                var bundles = this._ctx.bundles.all();
                for (var i = 0, j = bundles.length; i < j; i++) {
                    if (bundles[i].state && this._tracked.mask) {
                        this._tracked.track(bundles[i]);
                    }
                }
            }
            return this;
        },
        close: function() {
            if (this._tracked !== null) {
                this._ctx.on.bundle.remove(this._tracked);
                this._tracked.close();
                this._tracked = null;
            }
            return this;
        },
        get size() {
            return this._tracked !== null ? this._tracked.size() : 0;
        },
        get bundles() {
            return this._tracked !== null ? this._tracked.getItems() : [];
        },
        addingBundle: function(bundle) {

        },

        /**
         *
         * @param {sosgi.framework.Bundle} bundle
         */
        modifiedBundle: function(bundle) {

        },

        /**
         *
         * @param {sosgi.framework.Bundle} bundle
         */
        removedBundle: function(bundle) {

        }
    });

    $framework.tracker = {
        ServiceTracker: ServiceTracker,
        BundleTracker: BundleTracker,
        ServiceTrackerListener: ServiceTrackerListener,
        BundleTrackerListener: BundleTrackerListener
    };
})(sosgi.framework);

(function($framework) {
    'use strict';

    var Class = sjs.Class;

    var _bundle = $framework.bundle;
    var _event = $framework.event;

    var Framework = Class($framework.Bundle, {

        _SID: 0,
        _bundles: [],
        _bundlesMap: {},
        _loader: null,
        _logger: null,

        init: function(properties) {
            this._properties = properties || {};

            this.$super(this._nextId(), this, {
                name: 'SOSGI Framework',
                namespace: 'sosgi.framework'
            });

            this._bundles.push(this);
            this._bundlesMap[this.id] = this;
            this._bundleActivators = {};

            this._logger = sjs.log.getLogger('sosgi');

            this.on = new sosgi.framework.EventDispatcher(this._logger);
            this.registry = new sosgi.framework.service.Registry(this._logger, this.on);
        },
        _nextId: function() {
            return this._SID++;
        },
        /**
         * Return selected property
         *
         * @param {String} name
         * @param {Object} def Default value
         */
        property: function(name, def) {
            if (name in this._properties) {
                return this._properties[name];
            }
            if (typeof def !== 'undefined') {
                return def;
            }
            return null;
        },
        /**
         * @return {sjs.osig.bundle.Config}
         */
        properties: function() {
            return sjs.clone(this._properties);
        },
        start: function() {

            if (this.state === _bundle.ACTIVE || this.state === _bundle.STARTING) {
                return true;
            }
            if (this.state === _bundle.STOPPING) {
                throw new Error('Cannot start stoping bundle');
            }
            this._fireBundleEvent(_event.STARTING, this);
            this.state = _bundle.ACTIVE;
            for (var i = 1, l = this._bundles.length; i < l; ++i) {
                try {
                    this.startBundle(this._bundles[i]);
                } catch (e) {
                    this._logger.exception(e);
                }
            }
            this._fireBundleEvent(_event.STARTED, this);
        },
        stop: function() {
            if (this.state !== _bundle.ACTIVE) {
                return false;
            }
            this.state = _bundle.STOPPING;
            this._fireBundleEvent(_event.STOPPING, this);

            this.state = _bundle.RESOLVED;

            for (var i = this._bundles.length - 1; i > 0; --i) {
                try {
                    this.stopBundle(this._bundles[i]);
                } catch (e) {
                    this._logger.exception(e);
                }
            }
            this._fireBundleEvent(_event.STOPPED, this);
        },
        uninstall: function() {
            throw new Error('Not allowed uninstall framework');
        },
        update: function() {
            if (this.state === _bundle.ACTIVE) {
                this.stop();
                this.start();
                this._fireFrameworkEvent(_event.UPDATED, this);
            }
        },
        getLoader: function() {
            if (this._loader === null) {
                this._loader = sosgi.framework.loader.factor('');
            }
            return this._loader;
        },
        setLoader: function(loader) {
            this._loader = loader;
        },
        getLogger: function() {
            if (this._logger === null) {
                this._logger = this.property('logger') || new sjs.log.getLogger('osgi');
            }
            return this._logger;
        },
        hasBundle: function(obj) {
            if (typeof obj === 'number') {
                if (this._bundlesMap[obj]) {
                    return true;
                }
            } else if (typeof obj === 'string') {
                for (var i = 0, l = this._bundles.length; i < l; ++i) {
                    if (this._bundles[i].meta.namespace === obj) {
                        return true;
                    }
                }
            }
            return false;
        },
        getBundle: function(obj) {
            if (typeof obj === 'number') {
                if (this._bundlesMap[obj]) {
                    return this._bundlesMap[obj];
                }
                throw new Error('Not found: Bundle(id=' + obj + ')');
            } else if (typeof obj === 'string') {
                for (var i = 0, l = this._bundles.length; i < l; ++i) {
                    if (this._bundles[i].meta.namespace === obj) {
                        return this._bundles[i];
                    }
                }
                throw new Error('Not found: Bundle(namespace=' + obj + ')');
            }
            throw new Error('Incorect bundle identifier: ' + obj);
        },
        get bundles() {
            return this._bundles.concat();
        },
        /**
         * @param {string} locaction
         * @param {boolean} autoStart
         */
        installBundle: function(location, autoStart) {
            var self = this;
            var install = function(config) {
                try {
                    var bundle = new sosgi.framework.Bundle(this._nextId(), this, config);
                    if (!this._bundlesMap[bundle.id]) {
                        this._bundles.push(bundle);
                        this._bundlesMap[bundle.id] = bundle;
                        this._fireBundleEvent(_event.INSTALLED, bundle);
                        if (autoStart) {
                            bundle.start();
                        }
                    } else {
                        this._logger.error('Bundle: ' + location + ' is installed');
                    }
                } catch (e) {
                    this._logger.error('Instaling bundle: ' + location + '', e);
                }
            }.bind(this);

            if (typeof location === 'string') {
                this.getLoader().loadBundle(location).then(function(config) {
                    install(config);
                }, function(err) {
                    this._logger.error('Installing bundle: ' + location + '. Find error: ' + err, err instanceof Error ? err : null);
                }, null, this);
            } else {
                install(location);
            }

        },
        loadBundle: function(bundle) {
            this.getLoader().loadBundle(bundle);
        },
        startBundle: function(bundle) {
            if (bundle.id === 0) {
                throw new Error('Cannot start framework bundle: ' + bundle.meta.fullname);
            }

            if (bundle.state === _bundle.ACTIVE) {
                this._logger.warn('Bundle already active');
                return true;
            }
            if (bundle.state === _bundle.STARTING) {
                throw new Error('Bundle ' + bundle.meta.fullname + ' cannot be started, since it is stopping');
            }
            if (bundle.state === _bundle.UNINSTALLED) {
                throw new Error('Cannot start uninstalled bundle: ' + bundle.meta.fullname);
            }

            if (!this._checkIncludeDependency(bundle)) {
                throw new Error('Bundle: ' + bundle + ' has problem with start. Require: ' + bundle.meta.include);
            }
            var prevState = bundle.state;

            bundle.setContext(new sosgi.framework.BundleContext(this, bundle));
            bundle.state = _bundle.STARTING;
            this._fireBundleEvent(_event.STARTING, bundle);

            try {
                this._startActivator(bundle);

                bundle.state = _bundle.ACTIVE;
                this._fireBundleEvent(_event.STARTED, bundle);
            } catch (e) {
                bundle.unsetContext();
                bundle.state = prevState;
                this.registry.unregisterAll(bundle);
                this.registry.ungetAll(bundle);
                this.on.removeAll(bundle);
                throw e;
            }
            return true;
        },
        stopBundle: function(bundle) {
            if (bundle.id === 0) {
                throw new Error('Cannot stop framework bundle: ' + bundle.meta.fullname);
            }

            if (bundle.state === _bundle.UNINSTALLED) {
                throw new Error('Cannot stop uninstalled bundle: ' + bundle.meta.fullname);
            }
            if (bundle.state === _bundle.STOPPING) {
                throw new Error('Bundle: ' + bundle.meta.fullname + ' cannot be stopped since it is already stopping');
            }

            if (bundle.state !== _bundle.ACTIVE) {
                return true;
            }

            var prevState = bundle.state;
            bundle.state = _bundle.STOPPING;
            this._fireBundleEvent(_event.STOPPING, bundle);
            try {
                this._stopActivator(bundle);
                bundle.unsetContext();
                bundle.state = _bundle.RESOLVED;
                this.registry.unregisterAll(bundle);
                this.registry.ungetAll(bundle);
                this.on.removeAll(bundle);
                this._fireBundleEvent(_event.STOPPED, bundle);
            } catch (e) {
                bundle.state = prevState;
                this._logger.error('Activator stop error in : ' + bundle.meta.fullname, e);
                return false;
            }
            return true;
        },
        _startActivator: function(bundle) {

            var activator = bundle.meta.activator || null;
            if (activator) {
                var Fn = Function; //jshint hack
                var Activator = (new Fn('return ' + activator + ';'))();

                if (typeof Activator === 'undefined') {
                    throw new Error('Not found activator: ' + activator);
                }
                if (typeof Activator === 'function') {
                    activator = new Activator();
                } else {
                    activator = activator;
                }

                activator.start(bundle.ctx);
                this._bundleActivators[bundle.id] = activator;
            }

        },
        _stopActivator: function(bundle) {
            var bid = bundle.id;
            if (bid in this._bundleActivators) {
                this._bundleActivators[bid].stop(bundle.ctx);
                delete this._bundleActivators[bid];
            }
        },
        _checkIncludeDependency: function(bundle) {
            var include = bundle.meta.include;
            var namespaces = this._bundles.map(function(bundle) {
                return bundle.meta.namespace;
            });
            return include.every(function(namespace) {
                return namespaces.indexOf(namespace) !== -1;
            });
        },


        reloadBundle: function(bundle, autostart) {
            if (this.uninstallBundle(bundle)) {
                this.installBundle(bundle.meta.namespace, autostart);
            }

        },
        uninstallBundle: function(bundle) {
            if (bundle.id === 0) {
                this._logger.error('Cannot uninstall framework bundle: ' + bundle.meta.fullname);
                return false;
            }
            if (bundle.state !== _bundle.UNINSTALLED) {
                for (var i = 0, l = this._bundles.length; i < l; ++i) {
                    if (this._bundles[i].id === bundle.id) {
                        this._bundles.splice(i, 1);
                        this.stopBundle(bundle);
                        delete this._bundlesMap[bundle.id];
                        bundle.state = _bundle.UNINSTALLED;
                        this._fireBundleEvent(_event.UNINSTALLED, bundle);
                        break;
                    }
                }
            }
            return true;
        },
        _fireBundleEvent: function(type, bundle) {
            if (this === bundle) {
                this.on.framework.fire(new $framework.FrameworkEvent(type, bundle));
            }
            this.on.bundle.fire(new $framework.BundleEvent(type, bundle));
        },
        _fireServiceEvent: function(type, ref) {
            this.on.service.fite(new $framework.ServiceEvent(type, ref));
        },
        _fireFrameworkEvent: function(type) {
            this.on.framework.fire(new $framework.FrameworkEvent(type, this));
        }
    });

    var FrameworkFactory = function() {

    };
    /**
     * Create a new Framework instance.
     * @param {Object} config
     * @return New configured Framework
     */

    FrameworkFactory.prototype.create = function(config) {

        var frame = new Framework(config);
        if (config.path) {
            frame.getLoader().setPath(config.path);
        }
        return frame;
    };

    $framework.Framework = Framework;
    $framework.FrameworkFactory = FrameworkFactory;

})(sosgi.framework);
