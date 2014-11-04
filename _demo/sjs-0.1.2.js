/*! sjs - v0.1.2 - 2014-10-04 */
(function() {
    "use strict";

    var env = {
        browser: typeof window !== 'undefined',
        worker: typeof importScripts === 'function',
        node: typeof process === 'object' && typeof require === 'function',
    };
    var sjs = {
        env: {}
    };
    for (var type in env) {
        var value = sjs.env[type] = env[type];
        if (value) {
            sjs.env.type = type;
        }
    }
    switch (sjs.env.type) {
        case 'browser':
            sjs.global = window;
            break;
        case 'worker':
            sjs.global = self;
            break;
        case 'node':
            sjs.global = global;
            break;
    }
    sjs.global.sjs = sjs;

    sjs._uid = ['0'];

    /**
     * Extend targer object
     *
     * @method sjs.extend
     * @param {Object} target
     */
    sjs.extend = function(target) {
        if (arguments.length < 2) {
            throw new Error('Expected more than 2 arguments. (sjs.extend()');
        }
        var args, name, copy;
        for (var i = 1; i < arguments.length; i++) {
            args = arguments[i];
            for (name in args) {
                copy = args[name];
                if (copy !== undefined) {
                    target[name] = copy;
                }
            }
        }
        return target;
    };
    sjs.extend(sjs, {
        dummy: function() {},
        version: "{$version}",

        /**
         * Generate unique string
         *
         * @example
         *      > sjs.sid()
         *      'IBA1CCRQ69NIELNLBG65WHHEGNVGQPO1' (32)
         *
         *      > sjs.sid(3)
         *      'WK5' (3)
         *
         * @method sjs.sid
         * @param {Number} [len=32] Hash length
         * @return {String}
         */
        sid: function(len) {
            len = len || 32;
            //start from letter (can be use by DOM id)
            var sid = String.fromCharCode(Math.floor((Math.random() * 25) + 65));
            while (sid.length < len) {
                // between [48,57](number) + [65,90](ascii)
                var code = Math.floor((Math.random() * 42) + 48);
                if (code < 58 || code > 64) {
                    sid += String.fromCharCode(code);
                }
            }
            return sid;
        },

        /**
         * Genereate sequense hash
         *
         * @example
         *      > sjs.uid()
         *      '2c'
         *
         *      > sjs.uid()
         *      '2d'
         *
         * @method sjs.uid
         * @return {String}
         */
        uid: function() {
            var _uid = sjs._uid;
            var i = _uid.length;
            while (i--) {
                if (_uid[i] === '9') {
                    _uid[i] = 'A';
                    return _uid.join('');
                }
                if (_uid[i] === 'Z') {
                    _uid[i] = '1';
                } else {
                    _uid[i] = String.fromCharCode(_uid[i].charCodeAt(0) + 1);
                    return _uid.join('');
                }
            }
            _uid.unshift('0');
            return _uid.join('');
        },

        /*
         * Pick first value without error
         *
         * @example
         *      sjs.tr(function(){
         *          throw 1;
         *      }, function(){
         *          return 2
         *      });
         *
         * @method sjs.tr
         * @return {Object}
         */
        tr: function() {
            for (var i = 0, l = arguments.length; i < l; i++) {
                try {
                    return arguments[i]();
                } catch (e) {}
            }
            return null;
        },

        /**
         * Aliases
         *
         * @method sjs.alias
         * @param {Object} obj
         * @param {Object} map
         * @param {Boolean} force
         * @return {Object}
         */
        alias: function(obj, map, force) {
            for (var i in map) {
                obj[map[i]] = obj[i];
                if (force === true) {
                    delete obj[i];
                }
            }
            return obj;
        },

        /**
         * Camel case text
         *
         * @example
         *      > sjs.camelCase('a-b-c');
         *      aBC
         *
         * @method sjs.camelCase
         * @param {String} txt
         * @return {String}
         */
        camelCase: function(txt) {
            return txt.replace(/-(.)/g, function(_, char) {
                return char.toUpperCase();
            });
        },

        /**
         * Hyphenate text
         *
         * @example
         *      > sjs.hyphenate('aBC');
         *      a-b-c
         *
         * @method sjs.hyphenate
         * @param {String} txt
         * @return {String}
         */
        hyphenate: function(txt) {
            return txt.replace(/[A-Z]/g, function(match) {
                return '-' + match.charAt(0).toLowerCase();
            });
        },

        /**
         * Generate random number
         *
         * @example
         *      > sjs.random();
         *      0.21633313838851365
         *
         *      > sjs.random(10)
         *      [0..10]
         *
         *      > sjs.random(5, 10)
         *      [5..10]
         *
         * @method sjs.random
         * @param {Number} min
         * @param {Number} max
         * @returns {Number}
         */
        random: function(min, max) {
            var l = arguments.length;
            if (l === 0) {
                return Math.random();
            } else if (l === 1) {
                max = min;
                min = 0;
            }
            return parseInt(Math.random() * (max - min + 1) + min, 10);
        },
        /**
         * Convert to array
         *
         * @example
         *      > sjs.toArray();
         *      []
         *
         *      > sjs.toArray(NodeList)
         *      [..]
         *
         * @method sjs.toArray
         * @param {Object} arr
         * @return {Array}
         */
        toArray: function(arr) {
            if (!arr || !arr.length) {
                return [];
            }
            try {
                return Array.prototype.slice.call(arr, 0);
            } catch (e) {}
            var _ = [];
            for (var i = 0, j = arr.length; ++i < j;) {
                _.push(arr[++i]);
            }
            return _;
        },
        /**
         * Create namespace
         *
         * @example
         *      > sjs.ns('one.two.three', 'test');
         *      test
         *
         *      > global.one.two.three === 'test'
         *      true
         *
         *      > sjs.ns('a.b.c','val', one.two);
         *      true
         *
         *      > global.one.two.a.b.c === 'val'
         *      true
         *
         * @method sjs.ns
         * @param {String} name
         * @param mix [val={}]
         * @param {Object} [bind]
         */
        ns: function(name, val, bind) {
            bind = bind || sjs.global;
            var arr = name ? name.split('.') : [],
                o;
            for (var i = 0, l = arr.length; i < l; ++i) {
                o = arr[i];
                if (!bind[o]) {
                    bind[o] = (val && i + 1 === l) ? val : {};
                }
                bind = bind[o];
            }
            return bind;
        },
        /*
         * Clone object
         *
         * @example
         *              > var t1 = [1,2,3];
         *              > var t2 = t1;
         *              > t1 === t2
         *              true
         *
         *              > t2 = sjs.clone(t1);
         *              > t1 === t2
         *              false
         *
         * @method sjs.close
         * @param {Object} obj
         * @return {Object}
         */
        clone: (function() {
            var MARKER = '~~clone~~marker~~';

            var _clone = function(o, m) {

                if (!o) {
                    return o;
                }
                var t = sjs.type(o);
                if (t === 'date') {
                    return new Date(o.getTime());
                }

                if (t === 'array' || t === 'object') {
                    if (o[MARKER]) {
                        return m[o[MARKER]];
                    }
                    var clear = !m;
                    m = m || {};
                    var sid = sjs.sid();
                    o[MARKER] = sid;
                    m[sid] = o;
                    var _, i, l;
                    switch (t) {
                        case 'array':
                            _ = [];
                            for (i = 0, l = o.length; i < l; ++i) {
                                _.push(_clone(o[i], m));
                            }
                            break;
                        case 'object':
                            _ = {};
                            for (i in o) {
                                if (i !== MARKER) {
                                    _[i] = _clone(o[i], m);
                                }
                            }
                            break;
                    }

                    if (clear) {
                        for (sid in m) {
                            if (m[sid][MARKER]) {
                                m[sid][MARKER] = null;
                                delete m[sid][MARKER];
                            }
                        }
                    }
                    return _;
                }
                return t === 'date' ? new Date(o.getTime()) : o;
            };
            return function clone(o) {
                return _clone(o);
            };
        })(),
        /**
         * Format string
         *
         * @example
         *      > sjs.format('Hello {name}!!!', {name:'Bill'});
         *      'Hello Bill!!!'
         *
         * @method sjs.format
         * @param {String} txt
         * @param {Object} data
         */
        format: function(txt, data) {
            return txt.replace(/\{(.+?)\}/g, function(_, name) {
                return data[name] || '';
            });
        }
    });

})();

(function() {

    var toStr = Object.prototype.toString;
    var list = {};
    var arr = ['Number', 'String', 'Function', 'Array', 'Object', 'Date', 'RegExp', 'Boolean', 'Arguments'];
    for (var i = 0; i < arr.length; ++i) {
        list['[object ' + arr[i] + ']'] = arr[i].toLowerCase();
    }
    arr = null;

    function stype(o) {
        if (o === null) {
            return 'null';
        }
        var type = typeof o;
        switch (type) {
            case 'function':
            case 'undefined':
            case 'string':
            case 'number':
            case 'boolean':
                return type;
        }

        if (o.nodeName) {
            if (o.nodeType === 1) {
                return 'element';
            }
            if (o.nodeType === 3) {
                return (/\S/).test(o.nodeValue) ? 'textnode' : 'whitespace';
            }
        }
        if (typeof o.length === 'number') {
            if ('callee' in o) {
                return 'arguments';
            }
            if ('item' in o) {
                return 'collection';
            }
        }
        return list[toStr.call(o)] || 'object';
    }

    function prepareType(expectType) {
        return function(o) {
            return list[toStr.call(o)] === expectType;
        };
    }
    sjs.extend(sjs, {
        /**
         * Detect object type
         *
         * @method sjs.type
         * @return {Mixed} [null,undefined,string,number,array,function,regexp,date,boolean,object]
         */
        type: stype,
        /**
         * @method sjs.isArray
         * @return {Boolean}
         */
        isArray: Array.isArray,
        /**
         * @method sjs.isNumber
         * @return {Boolean}
         */
        isNumber: function(o) {
            return typeof o === 'number';
        },
        /**
         * @method sjs.isString
         * @return {Boolean}
         */
        isString: function(o) {
            return typeof o === 'string';
        },
        /**
         * @method sjs.isFunction
         * @return {Boolean}
         */
        isFunction: function(o) {
            return typeof o === 'function';
        },
        /**
         * @method sjs.isBoolean
         * @return {Boolean}
         */
        isBoolean: function(o) {
            return typeof o === 'boolean';
        },
        /**
         * @method sjs.isObject
         * @return {Boolean}
         */
        isObject: function(o) {
            return stype(o) === 'object';
        },
        /**
         * @method sjs.isRegExp
         * @return {Boolean}
         */
        isRegExp: prepareType('regexp'),
        /**
         * @method sjs.isDate
         * @return {Boolean}
         */
        isDate: prepareType('date'),
        /**
         * @method sjs.isElement
         * @return {Boolean}
         */
        isElement: function(o) {
            return stype(o) === 'element';
        },
        /**
         * @method sjs.isTextnode
         * @return {Boolean}
         */
        isTextnode: function(o) {
            return stype(o) === 'textnode';
        },
        /**
         * @method sjs.isWhitespace
         * @return {Boolean}
         */
        isWhitespace: function(o) {
            return stype(o) === 'whitespace';
        },
        /**
         * @method sjs.isCollection
         * @return {Boolean}
         */
        isCollection: function(o) {
            return stype(o) === 'collection';
        }
    });

})();

(function() {

    /**
     * Helper for extend native object
     *
     * @param {Object} dest
     * @param {Object} source
     */
    var extend = function(dest, source) {
        for (var name in source) {
            if (!(name in dest)) {
                dest[name] = source[name];
            }
        }
    };
    /**
     * @lends Array.prototype
     */
    var array = {
        /**
         * Clear all array
         * @method Array.prototype.clear
         */
        clear: function() {
            this.length = 0;
            return this;
        },
        /**
         * Remove all item
         *
         * @param {Object} o
         */
        remove: function(o) {
            for (var i = this.length; i--;) {
                if (this[i] === o) {
                    this.splice(i, 1);
                }
            }
            return this;
        },

        /**
         * Remove item from selected position
         *
         * @param {Number} index
         */
        removeAt: function(index) {
            return this;
        },

        /**
         * If contains item
         *
         * @param {Object} o
         */
        contains: function(o) {
            return this.indexOf(o) !== -1;
        },
        extend: function(a) {
            for (var i = 0, l = a.length; i < l; ++i) {
                this.push(a[i]);
            }
            return this;
        },
        append: function() {
            for (var i = 0, j = arguments.length; i < j; i++) {
                this.push(arguments[i]);
            }
            return this;
        },
        include: function(o) {
            if (!this.contains(o)) {
                this.push(o);
            }
            return this;
        },
        each: Array.prototype.forEach,
        /**
         * Copy current array
         *
         * @param int from
         * @param int to
         */
        copy: function(from, to) {
            return this.slice(from || 0, to);
        },
        /**
         * Clone all array
         */
        clone: function() {
            return this.concat();
        },
        revers: function() {
            var tmp = [];
            for (var i = this.length; i > 0;) {
                tmp.push(this[--i]);
            }
            return tmp;
        },
        random: function() {
            return this.length ? this[sjs.random(this.length - 1)] : null;
        },

        /**
         * Return new array with unique items
         *
         * @return array
         */
        unique: function() {
            var tmp = [],
                l, item;
            for (var i = 0, j = this.length; i < j;) {
                item = this[i++];
                if (tmp.indexOf(item) === -1) {
                    tmp.push(item);
                }
            }
            return tmp;
        }
    };

    var arrayProps = {
        first: {
            get: function() {
                return this[0];
            }
        },
        last: {
            get: function() {
                return this[this.length - 1];
            }
        },

        max: {
            get: function() {
                var max = null;
                for (var i = 0; i < this.length; ++i) {
                    if (!max || max < this[i]) {
                        max = this[i];
                    }
                }
                return max;
            }
        },
        min: {
            get: function() {
                var min = null;
                for (var i = 0; i < this.length; ++i) {
                    if (!min || min > this[i]) {
                        min = this[i];
                    }
                }
                return min;
            }
        }
    };


    var string = {
        startsWith: function(s) {
            return this.indexOf(s) === 0;
        },
        endsWith: function(s) {
            s = s + '';
            var index = this.lastIndexOf(s);
            return index >= 0 && index === this.length - s.length;
        },
        contains: function(s) {
            return this.indexOf(s) !== -1;
        },
        toArray: function() {
            return this.split('');
        },
        repeat: function(count) {
            if (count < 1) {
                return '';
            }
            var result = '',
                pattern = this.valueOf();
            while (count > 0) {
                if (count & 1) {
                    result += pattern;
                }
                count >>= 1;
                //16 -> 8,4,2,1
                pattern += pattern;
            }
            return result;
        }
    };

    extend(Array.prototype, array);
    Object.defineProperties(Array.prototype, arrayProps);
    RegExp.escape = function(string) {
        return (string + '').replace(/([.*+?\^=!:${}()|\/\\\[\]])/g, '\\$1');
    };
    extend(String.prototype, string);
})();

(function() {
    /**
     * Defer service
     */
    /**
     * Promise object
     *
     * @class
     * @name Promise
     * @private
     */
    var Promise = function(defer) {

        /**
         *
         * @param {Function} done
         * @param {Function} [fail]
         * @param {Function} [progress]
         * @param {Object} [bind]
         */
        this.then = function(done, fail, progress, bind) {
            return defer.then(done, fail, progress, bind);
        };
        /**
         *
         * @param {Function} listener
         * @param {Object} [bind]
         */
        this.done = function(listener, bind) {
            return defer.done(listener, bind).promise;
        };
        /**
         *
         * @param {Function} listener
         * @param {Object} [bind]
         */
        this.fail = function(listener, bind) {
            return defer.fail(listener, bind).promise;
        };
        /**
         *
         * @param {Function} listener
         * @param {Object} [bind]
         */
        this.progress = function(listener, bind) {
            return defer.progress(listener, bind).promise;
        };
    };


    /**
     * Create defer object
     *
     * @method sjs.defer
     * @param {Callback} [callback]
     * @param {Object} [callbackBind]
     * @return {Defered}
     */
    var defer = function(callback, callbackBind) {
        var groups = {
            resolved: [],
            rejected: [],
            notified: []
        };
        var memory = null;
        var status = defer.PENDING;

        function dispatch(name, args) {
            if (name in groups) {
                var listener, listeners = groups[name];
                for (var i = 0, j = listeners.length; i < j; i++) {
                    listener = listeners[i];
                    listener[0].apply(listener[1], args);
                }
                if (name === 'resolved' || name === 'rejected') {
                    groups[name] = [];
                }
            }
        }
        /**
         * @param {Strign} name
         * @param {Function} listener
         * @param {Object} [bind]
         */
        function addListener(name, listener, bind) {
            if (typeof listener === 'function') {
                if (name in groups) {
                    groups[name].push([listener, bind]);
                }
                if (memory && name === status) {
                    dispatch(name, memory);
                }
            }
        }

        function action(name, args) {
            if (status !== defer.PENDING && name !== defer.NOTIFIED) {
                return;
            }

            if (name === defer.RESOLVED || name === defer.REJECTED) {
                status = name;
            }
            args = Array.prototype.slice.call(args);
            dispatch(name, args);
            if (name !== defer.NOTIFIED) {
                memory = args;
            }
        }
        var deferred = {
            /**
             *
             * @param {Function} listener
             * @param {Object} [bind]
             */
            done: function(listener, bind) {
                addListener(defer.RESOLVED, listener, bind || deferred);
                return this;
            },
            /**
             *
             * @param {Function} listener
             * @param {Object} [bind]
             */
            fail: function(listener, bind) {
                addListener(defer.REJECTED, listener, bind || deferred);
                return this;
            },
            /**
             *
             * @param {Function} listener
             * @param {Object} [bind]
             */
            progress: function(listener, bind) {
                addListener(defer.NOTIFIED, listener, bind || deferred);
                return this;
            },
            /**
             *
             * @param {Function} done
             * @param {Function} [fail]
             * @param {Function} [progress]
             * @param {Object} [bind]
             */
            then: function(done, fail, progress, bind) {
                return defer(function(resolve, reject, notify) {
                    deferred.done(function() {
                        if (typeof done === 'function') {
                            var returned = done.apply(bind || this, arguments);
                            if (returned) {
                                if (returned.promise) {
                                    return returned.promise.done(resolve).fail(reject).progress(notify);
                                }
                                resolve.apply(bind || deferred, [returned]);
                            }
                        }
                    });
                    deferred.fail(function() {
                        if (typeof fail === 'function') {
                            var returned = fail.apply(bind || this, arguments);
                            if (returned) {
                                if (returned.promise) {
                                    return returned.promise.done(resolve).fail(reject).progress(notify);
                                }
                                reject.apply(bind || deferred, [returned]);
                            }
                        }
                    });
                }).promise;
            },
            /**
             * Resolve
             */
            resolve: function() {
                action(defer.RESOLVED, arguments);
                return this;
            },
            /**
             * Reject
             *
             * @param {Object} value
             */
            reject: function() {
                action(defer.REJECTED, arguments);
                return this;
            },
            /**
             * Notify
             *
             * @param {Object} value
             */
            notify: function() {
                action(defer.NOTIFIED, arguments);
                return this;
            },

        };
        Object.defineProperties(deferred, {
            status: {
                get: function() {
                    return status;
                },
                enumerable: true
            },
            promise: {
                value: new Promise(deferred),
                enumerable: true
            }
        });

        if (typeof callback === 'function') {
            var bind = callbackBind || deferred;
            callback.call(bind, function() {
                action(defer.RESOLVED, arguments);
                return bind;
            }, function() {
                action(defer.REJECTED, arguments);
                return bind;
            }, function() {
                action(defer.NOTIFIED, arguments);
                return bind;
            });
        }
        return deferred;

    };

    /**
     * Run as chain
     *
     * @param {...Function} call
     */
    defer.chain = function chain(iterable) {
        var deferred = defer();
        if (arguments.length > 1) {
            iterable = Array.prototype.slice.call(arguments);
        }


        var values = [];
        (function nextCallback() {
            var callback = iterable.shift();
            var done = function() {
                if (arguments.length) {
                    values.push(arguments.length === 1 ? arguments[0] : Array.prototype.slice.call(arguments));
                }
                if (iterable.length) {
                    nextCallback();
                } else {
                    deferred.resolve.apply(deferred, values);
                }
            };
            var promise = callback.apply(null, values);
            if (promise instanceof Promise) {
                promise.progress(deferred.notify).done(done).fail(deferred.reject);
            } else {
                done();
            }
        })();


        return deferred.promise;
    };
    /**
     * Run all
     *
     * @param {...Function} call
     */
    defer.all = function all(iterable) {
        var deferred = defer();
        if (arguments.length > 1) {
            iterable = Array.prototype.slice.call(arguments);
        }
        var values = [];
        var callnum = iterable.length;
        var done = function() {
            if (arguments.length) {
                values.push(arguments.length === 1 ? arguments[0] : Array.prototype.slice.call(arguments));
            }
            if (--callnum === 0) {
                deferred.resolve.apply(deferred, values);
            }
        };
        for (var i = 0; i < iterable.length; i++) {
            var callback = iterable[i];
            if (callback) {
                var promise = callback.apply(null, values);
                if (promise instanceof Promise) {
                    promise.progress(deferred.notify).done(done).fail(deferred.reject);
                }
            }
        }
        return deferred.promise;
    };
    /**
     * @const sjs.defer.RESOLVED
     */
    defer.RESOLVED = 'resolved';

    /**
     * @const sjs.defer.REJECTED
     */
    defer.REJECTED = 'rejected';

    /**
     * @const sjs.defer.PENDING
     */
    defer.PENDING = 'pending';

    /**
     * @const sjs.defer.NOTIFIED
     */
    defer.NOTIFIED = 'notified';

    sjs.defer = defer;

})();

(function() {

    var getNamespace = function(fn) {
        var name = /function\s+(.+?)\(/.exec(fn.toString());
        name = name ? name[1] : '';
        return name.replace(/_/g, '.');
    };

    var Interface = function() {
        var _interface = function() {};
        var _prototype = Object.create(Interface.prototype);
        var namespace = '';
        var args = Array.prototype.slice.call(arguments);
        var pos = 0,
            next, type;
        var throwFactory = function(name) {
            var fn = function() {
                throw new Error('NotImplementedError: ' + namespace + '::' + name + '()');
            };
            fn.$interface = true;
            return fn;
        };

        while (args.length) {
            next = args.shift();
            if (!next) {
                continue;
            }
            type = typeof next;
            if (type === 'function' && pos === 0) {
                _interface = next;
                _prototype = Object.create(next.prototype);
                continue;
            }
            if (type === 'object') {
                if ('init' in next) {
                    _interface = next.init;
                    namespace = getNamespace(_interface);
                    delete next.init;
                }
                for (var name in next) {
                    var desc = Object.getOwnPropertyDescriptor(next, name);
                    if (desc && (desc.get || desc.set)) {
                        desc.enumerable = true;
                        if (desc.get) {
                            desc.get = throwFactory('get ' + name);
                        }
                        if (desc.set) {
                            desc.set = throwFactory('set ' + name);
                        }
                        Object.defineProperty(_prototype, name, desc);
                    } else if (typeof next[name]) {
                        _prototype[name] = throwFactory(name);
                    }
                }
            }

        }

        _interface.prototype = _prototype;
        _interface.constructor = Interface;
        return _interface;

    };
    sjs.Interface = Interface;

    function clone(obj, keys) {
        if (obj) {
            for (var i = 0, l = keys.length; i < l; i += 1) {
                var key = keys[i];
                obj[key] = sjs.clone(obj[key]);
            }
        }
    }

    function extend(prototype, variables, obj) {
        var keys = Object.keys(obj),
            key, desc;
        for (var i = 0, l = keys.length; i < l; i += 1) {
            key = keys[i];
            desc = Object.getOwnPropertyDescriptor(obj, key);
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(prototype, key, desc);
            } else if (typeof obj[key] === 'function') {
                var name = key === 'init' ? '__init__' : key;
                prototype[name] = merge(prototype[name], obj[key]);
            } else {
                if (key === '__variables__') {
                    variables.extend(obj.__variables__);
                } else {
                    prototype[key] = obj[key];
                    variables.push(key);
                }
            }
        }
    }

    function merge(prev, cur) {
        if (prev && prev !== cur) {
            var ct = typeof cur;
            var pt = typeof prev;
            if (ct === pt) {
                if (ct === 'function' && cur.toString().indexOf('$super') !== -1) {
                    var m = function() {
                        this.$super = prev;
                        return cur.apply(this, arguments);
                    };
                    return m;
                }
            }
        }
        return cur;
    }

    function Class() {

        if (this instanceof Class) {
            throw Error('Incorect using: new Class()');
        }


        var prototype = Object.create(Class.prototype);
        var constructor = Class;
        var variables = [];

        var args = sjs.toArray(arguments);
        var pos = 0,
            current, i, len;
        while (args.length) {
            current = args.shift();
            if (typeof current === 'function' && pos === 0) {
                var _prototype = Object.create(current.prototype);
                if (_prototype instanceof Class) {
                    var keys = Object.keys(current.prototype);

                    //collect all not function type variables
                    for (i = 0, len = keys.length; i < len; i += 1) {
                        var key = keys[i];
                        if (key === '__variables__') {
                            variables.extend(_prototype[key]);
                        } else if (typeof _prototype[key] !== 'function') {
                            variables.push(key);
                        }
                    }
                    prototype = _prototype;
                } else {
                    //native function
                    prototype.__init__ = current;
                    extend(prototype, [], current.prototype);
                }
                pos += 1;
                continue;

            }
            if (sjs.isObject(current)) {
                extend(prototype, variables, current);
                continue;
            }
            if (sjs.isArray(current)) {
                var item;
                for (i = 0, len = current.length; i < len; i += 1) {
                    item = current[i];
                    extend(prototype, variables, typeof item === 'function' ? item.prototype : item);
                }
                continue;
            }
            throw {
                message: 'Incorect argument. Expected: function, object, array'
            };

        }
        //base wraper
        function Klass() {
            if ('__variables__' in this) {
                clone(this, this.__variables__);
            }
            if (typeof this.__init__ === 'function') {
                return this.__init__.apply(this, arguments);
            }
            return this;
        }

        variables = variables.unique();
        if (variables.length) {
            prototype.__variables__ = variables;
        }

        Klass.prototype = prototype;
        Klass.constructor = constructor;
        return Klass;
    }
    sjs.Class = Class;
})();

(function() {
    /**
     * Events
     *
     * @namespace sjs.event
     */

    var Class = sjs.Class;
    var funcName = function(name) {
        name = 'on' + name.replace(/[\.\-](.)/g, function(_, letter) {
            return letter.toUpperCase();
        }).replace(/^([a-z])/g, function(_, letter) {
            return letter.toUpperCase();
        });
        return name;
    };


    /**
     * Listeners
     *
     * @name Event
     * @memberof sjs.event
     * @class
     * @param {String} name
     * @param {Object} obj Context
     */
    var Event = Class(
        /**
         * @lends sjs.event.Event.prototype
         */
        {
            init: function(name, obj) {
                this._isFire = false;
                this._name = name;
                this._obj = obj || null;
                this._listeners = [];
            },
            /**
             * Add listener
             *
             * @param {Function} fn
             * @param {Object} bind Context
             * @param {Object} opt
             */
            add: function(fn, bind, opt) {
                if (this._find(fn, bind) === -1) {
                    this._listeners.push([fn, bind || this._obj]);
                }
            },
            _find: function(fn, bind) {
                var l;
                bind = bind || this._obj;
                for (var i = 0, len = this._listeners.length; i < len; ++i) {
                    l = this._listeners[i];
                    if (l) {
                        if (l[0] === fn && l[1] === bind) {
                            return i;
                        }
                    }
                }
                return -1;
            },
            /**
             * Renive listener
             */
            remove: function(fn, bind) {
                var i = this._find(fn, bind);
                if (i !== -1) {
                    this._listeners.splice(i, 1);
                }
            },
            /**
             * Get nubmer of listeners
             */
            size: function() {
                return this._listeners.length;
            },
            /**
             * Remove all listeners
             */
            clear: function() {
                this._listeners = [];
            },
            /**
             * Has listener
             */
            has: function(fn, bind) {
                return this._find(fn, bind) !== -1;
            },
            /**
             * Dispach event for listeners
             */
            dispatch: function() {
                if (!this._isFire) {
                    this._isFire = true;
                    var args = Array.prototype.slice.call(arguments);
                    for (var i = 0, len = this._listeners.length; i < len; ++i) {
                        var l = this._listeners[i];

                        if (l[0].apply(l[1] || null, args) === false) {
                            this._isFire = false;
                            return false;
                        }
                    }
                    this._isFire = false;
                }
            }
        });

    /**
     * Events dispatcher
     *
     * @class
     * @name Events
     * @memberof sjs.event
     */
    var Events = Class(
        /**
         * @lends sjs.event.Events.prototype
         */

        {
            /**
             * @var {Object}
             */
            _events: {},

            /**
             * Add event listener
             */
            on: function(en, fn, bind, opt) {
                en = en.toLowerCase();
                if (!(en in this._events)) {
                    this._events[en] = new Event(en, this);
                }
                this._events[en].add(fn, bind, opt);
            },
            /**
             * Add event and remove it after fire
             */
            once: function(en, fn, bind, opt) {
                en = en.toLowerCase();
                if (!(en in this._events)) {
                    this._events[en] = new Event(en, this);
                }
                var event = this._events[en];
                var self = this;
                var _fn = function() {
                    event.remove(_fn, bind, opt);
                    if (!event.size()) {
                        self.offs(en);
                    }
                    return fn.apply(this, arguments);
                };
                event.add(_fn, bind, opt);
            },
            ons: function(en, fn, bind) {
                en = en.toLowerCase();
                var e = this._events[en];
                if (e) {
                    e.remove(fn, bind);
                    if (e.size() === 0) {
                        delete this._events[en];
                    }
                }
            },
            off: function(en, fn, bind) {
                en = en.toLowerCase();
                if (fn) {
                    this._events[en].remove(fn, bind);
                    if (this._events[en].size() === 0) {
                        delete this._events[en];
                    }
                }
            },
            offs: function(en) {
                en = en.toLowerCase();
                if (en in this._events) {
                    delete this._events[en];
                }
            },
            _hasEvent: function(en, fn, bind) {
                en = en.toLowerCase();
                if (fn === undefined) {
                    return this._events[en];
                }
                return en in this._events && this._events[en].has(fn, bind);
            },
            dispatch: function() {
                var args = Array.prototype.slice.call(arguments);
                var en = args.shift().toLowerCase();
                var e = this._events[en];
                if (e) {
                    e.dispatch.apply(e, args);
                }
            }
        });

    sjs.event = {
        Events: Events,
        Event: Event
    };
})();

(function() {
    /**
     * Simple tempalte
     *
     * @class
     * @memberof sjs
     * @param {String} html
     * @throw Error
     * @constructor
     */
    var Template = function Template(html) {
        if (!html) {
            throw new Error('Not found template.');
        }
        //some cleaning
        html = html.replace(/"/g, '\\"').replace(/\n/g, '').replace(/%7B/g, '{').replace(/%7D/g, '}').replace(/[\t\n\r]+|[\t\n\r]+$/, '');

        /**
         * Prepare render function
         * @return {Callback}
         */
        var prepare = function() {
            var s = 'with(data){ __buff="' + html + '"; };';
            s = s.replace(/\{\{(.+?)\}\}/gi, function(match, val) {
                return '"+' + val + '+"';
            });
            s = s.replace(/\{%(.*?)%\}/gi, function(match, val) {
                return '";' + val + '__buff+="';
            });
            s = 'var __buff="";' + s.replace(/(__buff\+?="";)/gi, '') + 'return __buff;';
            var fn = Function;
            return new fn('data', s);
        };

        var render = null;
        /**
         * Render
         *
         * @param {Object} data
         * @return {String}
         */
        this.render = function(data) {
            if (render === null) {
                render = prepare();
            }
            return render(data || {});
        };
    };
    sjs.Template = Template;

    /**
     * @method sjs.tpl
     * @param {String} html
     * @return {Callback}
     */
    sjs.tpl = function(html) {
        var tpl = new Template(html);
        return function(data) {
            return tpl.render(data);
        };
    };
})();

(function() {
    /**
     * Log service
     *
     * @namespace sjs.log
     */

    /**
     * Record of log data
     *
     * @typedef {Object} Record
     * @property {String} name
     * @property {String} levelName
     * @property {String} msg
     * @property {Object} ex Error object
     * @property {Number} mask
     * @property {Number} level
     * @memberof sjs.log
     */

    var Class = sjs.Class;

    /*
     * Enum for logger
     *
     * @readonly
     * @enum
     * @memberof sjs.log
     */
    var log = sjs.log = {
        ALL: 1024,
        FATAL: 16,
        CRITICAL: 16,
        ERROR: 8,
        WARNING: 4,
        WARN: 4,
        INFO: 2,
        DEBUG: 1,
        NOTSET: 0
    };

    /**
     * @const sjs.log.ALL
     */
    /**
     * @const sjs.log.CRITICAL
     */
    /**
     * @const sjs.log.ERROR
     */
    /**
     * @const sjs.log.WARM
     */
    /**
     * @const sjs.log.WARMING
     */
    /**
     * @const sjs.log.INFO
     */
    /**
     * @const sjs.log.DEBUG
     */
    /**
     * @const sjs.log.NOTSET
     */



    var _levelNames = {
        FATAL: log.FATAL,
        ERROR: log.ERROR,
        WARNING: log.WARN,
        WARN: log.WARN,
        INFO: log.INFO,
        DEBUG: log.DEBUG,
        NOTSET: log.NOTSET,
        16: 'FATAL',
        8: 'ERROR',
        4: 'WARN',
        2: 'INFO',
        1: 'DEBUG',
        0: 'NOTSET'

    };
    /**
     * Return level as number
     *
     * @param {Number|String} level
     * @return {Number}
     * @throw TypeError
     */
    var _checkLevel = function(level) {
        if (level in _levelNames) {
            if (typeof level === 'string') {
                return _levelNames[level];
            }
            return level;
        }
        throw new TypeError('Unknown level: ' + level);
    };

    var _checkMask = function(level) {
        return level === log.NOTSET ? log.NOTSET : level * 2 - 1;
    };

    /**
     * Mask rpresentation
     *
     * @class
     * @name Mask
     * @memberof sjs.log
     */
    log.Mask = Class(
        /**
         * @lends sjs.log.Mask.prototype
         */
        {
            _mask: 0,

            /**
             * Setter for level [set level()]
             *
             * @param {Number} level
             * @type {Number}
             */
            set level(level) {
                this._mask = _checkMask(level);
            },
            /**
             * Getter for level [get level()]
             *
             * @return {Number} level
             * @type {Number}
             */
            get level() {
                return null;
            },
            /**
             * Getter for mask [get mask()]
             *
             * @return {Number} mask
             * @type {Number}
             */
            get mask() {
                return this._mask;
            },
            /**
             * Setter for mask [set mask()]
             *
             * @param {Number} mask
             * @type {Number}
             */
            set mask(mask) {
                this._mask = mask;
            }
        });
    /**
     * Filter
     *
     * @class
     * @name Filter
     * @memberof sjs.log
     */
    log.Filter = Class(
        /**
         * @lends sjs.log.Filter.prototype
         */
        {
            /**
             * @abstract
             * @param {Record} record
             */
            filter: function(record) {
                throw new Error('Not implement Filter.filter(record)');
            }
        });

    /**
     * Filter
     *
     * @class
     * @name Filterer
     * @memberof sjs.log
     * @extends sjs.log.Mask
     */
    log.Filterer = Class(log.Mask,
        /**
         * @lends sjs.log.Filterer.prototype
         */
        {

            /**
             * @var {Array}
             */
            _filters: [],

            /**
             * @param {sjs.log.Filter} filter
             */
            addFilter: function(filter) {
                if (!(filter instanceof log.Filter)) {
                    throw new Error('Excpected Filter');
                }
                this._filters.include(filter);
            },
            /**
             * @param {sjs.log.Filter} filter
             */
            removeFilter: function(filter) {
                this._filters.remove(filter);
            },
            /**
             * @param {Record} record
             * @return {Boolean}
             */
            filter: function(record) {

            }
        });

    /**
     * Handler
     *
     * @class
     * @name Handler
     * @memberof sjs.log
     * @extends sjs.log.Filterer
     */
    log.Handler = Class(log.Filterer,
        /**
         * @lends sjs.log.Handler.prototype
         */
        {
            init: function(level) {
                this.level = level || log.ALL;
            },
            /**
             * @param {Record} record
             */
            handle: function(record) {}
        });


    /**
     *
     * @class
     * @name ConsoleHandler
     * @memberof sjs.log
     * @extends sjs.log.Handler
     */
    log.ConsoleHandler = Class(log.Handler,
        /**
         * @lends sjs.log.ConsoleHandler.prototype
         */
        {
            /**
         * @param {Record} record Log object with all collected data

         */
            handle: function(record) {
                console.log('[' + record.name + '] ::' + record.levelName + ':: ' + record.msg);
                if (record.ex) {
                    console.error(record.ex);
                }
            }
        });

    /**
     * Logger instance
     *
     * @name Logger
     * @memberof sjs.log
     * @extends sjs.log.Filterer
     * @param {String} name
     * @param {Number|String} level
     * @class
     */
    log.Logger = Class(log.Filterer,
        /**
         * @lends sjs.log.Logger.prototype
         */
        {
            parent: null,
            propagate: true,
            init: function(name, level) {
                this.level = level || log.NOTSET;
                this.name = name;
                this._handlers = [];
            },
            /**
             *
             * @param {sjs.log.Handler}
             */
            addHandler: function(handler) {
                if (!(handler instanceof log.Handler)) {
                    throw new Error('Expected log.Handler');
                }
                this._handlers.include(handler);
                return this;
            },
            /**
             * @param {sjs.log.Handler}
             */
            removeHandler: function(handler) {
                this._handlers.remove(handler);
                return this;
            },
            /**
             * @return {Boolean}
             */
            hasHandlers: function() {
                return this._handler.length;
            },
            /**
             *
             * @param {String} msg
             * @param {Error} ex
             */
            fatal: function(msg, ex) {
                this.log(log.FATAL, msg, ex);
            },
            /**
             *
             * @param {String} msg
             * @param {Error} ex
             */
            critical: function(msg, ex) {
                this.log(log.FATAL, msg, ex);
            },
            /**
             *
             * @param {String} msg
             * @param {Error} ex
             */
            error: function(msg, ex) {
                this.log(log.ERROR, msg, ex);
            },
            /**
             *
             * @param {String} msg
             * @param {Error} ex
             */
            warn: function(msg, ex) {
                this.log(log.WARN, msg, ex);
            },
            /**
             *
             * @param {String} msg
             * @param {Error} ex
             */
            warning: function(msg, ex) {
                this.log(log.WARN, msg, ex);
            },
            /**
             *
             * @param {String} msg
             */
            info: function(msg) {
                this.log(log.INFO, msg);
            },
            /**
             *
             * @param {String} msg
             */
            debug: function(msg) {
                this.log(log.DEBUG, msg);
            },
            /**
             *
             * @param {Error} ex
             */
            exception: function(ex) {
                this.log(log.ERROR, ex.message, ex);
            },
            /**
             *
             * @param {Number} level
             * @param {String} msg
             * @param {Error} ex
             */
            log: function(level, msg, ex) {
                level = _checkLevel(level);

                if (!this.manager || (this.manager && this.manager.mask & level)) {
                    if (this._getParentMask() & level) {
                        var record = {
                            name: this.name,
                            level: level,
                            levelName: _levelNames[level],
                            mask: _checkMask(level),
                            msg: msg,
                            ex: ex
                        };
                        this.handle(record);
                    }
                }
            },
            _getParentMask: function() {
                var logger = this;
                while (logger) {
                    if (logger._mask) {
                        return logger._mask;
                    }
                    logger = logger.parent;
                }
                return log.NOTSET;
            },
            /**
             *
             * @param {Record} record
             */
            handle: function(record) {
                var handler, p = this;
                while (p) {
                    for (var i = 0, j = p._handlers.length; i < j; i++) {
                        handler = p._handlers[i];
                        if (handler.mask & record.level) {
                            handler.handle(record);
                        }
                    }
                    p = p.propagate ? p.parent : null;
                }
            }
        });

    /**
     * @class
     * @extends sjs.log.Mask
     */
    var Manager = Class(log.Mask,
        /**
         * @lends sjs.log.Manager.prototype
         */
        {

            /**
             * @constructs
             */
            init: function() {

                this._loggers = {};
                this.level = log.ALL;
                this.getLogger().level = log.ALL;
            },

            /**
             * Find logger by name. Create is not exits
             *
             * @param {String} name
             * @return {sjs.log.Logger}
             */
            getLogger: function(name) {
                name = name || 'root';
                if (!this._loggers[name]) {
                    var logger = new log.Logger(name);
                    this._fixTree(logger);
                    logger.manager = this;
                    this._loggers[name] = logger;
                }
                return this._loggers[name];
            },

            _fixTree: function(logger) {
                var parts = logger.name.split('.');
                while (parts.length) {
                    parts.pop();
                    var parent = this._loggers[parts.join('.') || 'root'];
                    if (parent) {
                        logger.parent = parent;
                        break;
                    }
                }
                if (logger.parent) {
                    for (var i in this._loggers) {
                        var item = this._loggers[i];
                        if (item.parent && item.parent === logger.parent) {
                            var name = item.name;
                            if (item.name.substr(0, logger.name.length) === logger.name) {
                                item.parent = logger;
                            }
                        }
                    }
                }
            }
        });
    log.Manager = Manager;
    /**
     * @var {sjs.log.Manager} manager Default manager
     * @private
     */
    var manager = new Manager();

    /**
     * @var {sjs.log.Logger} root Default logger
     * @private
     */
    var root = manager.getLogger();

    /**
     * Return logger for global manager
     *
     * @method sjs.log.getLogger
     * @param {String} name
     * @return {sjs.log.Logger}
     */
    log.getLogger = function(name) {
        return manager.getLogger(name);
    };
    /**
     * Return current global mask
     *
     * @method sjs.log.mask
     * @return {Number}
     */
    log.mask = function() {
        return manager.mask;
    };

    /**
     * @method sjs.log.fatal
     * @param {String} msg
     * @param {Object} ex
     */
    log.fatal = function(msg, ex) {
        root.fatal(msg, ex);
    };
    /**
     * @method sjs.log.error
     * @param {String} msg
     * @param {Object} ex
     */
    log.error = function(msg, ex) {
        root.error(msg, ex);
    };
    /**
     * @method sjs.log.critical
     * @param {String} msg
     * @param {Object} ex
     */
    log.critical = function(msg, ex) {
        root.critical(msg, ex);
    };
    /**
     * @method sjs.log.warn
     * @param {String} msg
     * @param {Object} ex
     */
    log.warn = function(msg, ex) {
        root.warn(msg, ex);
    };
    /**
     * @method sjs.log.warning
     * @param {String} msg
     * @param {Object} ex
     */
    log.warning = function(msg, ex) {
        root.warning(msg, ex);
    };
    /**
     * @method sjs.log.info
     * @param {String} msg
     */
    log.info = function(msg) {
        root.info(msg);
    };
    /**
     * @method sjs.log.debug
     * @param {String} msg
     */
    log.debug = function(msg) {
        root.debug(msg);
    };

})();

(function(root) {

    //html tag name finder
    var reTag = /^<(\w+)\s*\/?>$/;

    /**
     *
     * @namespace sjs.dom
     */
    var dom = root.dom = function(name, attrs, context) {
        attrs = attrs || {};
        if (context === undefined || typeof context.createElement !== 'function') {
            context = document;
        }
        var $dom = null;
        if (typeof name === 'string') {
            name = name.trim();
            if (name.length > 1) {
                if (name.charAt(0) === '<' && name.charAt(name.length - 1) === '>') {
                    if (name.length > 2) {
                        var m = reTag.exec(name);
                        if (m) {
                            $dom = context.createElement(m[1]);
                        } else {
                            var fragment = context.createElement('div');
                            fragment.innerHTML = name;
                            $dom = fragment.firstChild;
                        }
                    }
                } else {
                    $dom = context.createElement(name);
                }
                if ($dom !== null) {
                    if (attrs) {
                        dom.setAttrs($dom, attrs);
                    }
                }
            }
        }
        return $dom;
    };
    dom.uid = (function() {
        var uid = 0;
        return function($element) {
            return $element.$$sjsdomuid || ($element.$$sjsdomuid = uid += 1);
        };
    })();


    dom.setStyles = function($element, styles) {
        for (var name in styles) {
            dom.setStyle($element, name, styles[name]);
        }
    };

    dom.setStyle = function($element, name, value) {
        name = name === 'float' ? 'cssFloat' : sjs.camelCase(name);
        $element.style[name] = value;
    };
    dom.getStyle = function($element, name) {
        name = name === 'float' ? 'cssFloat' : sjs.camelCase(name);
    };

    var ATTRS = {
        'class': 'className',
        'for': 'htmlFor',
        'html': 'innerHTML',
        'style': 'cssText'
    };
    var ATTRS_BOOL = ["autofocus", "autoplay", "checked", "compact", "controls", "declare", "defaultChecked", "defer", "disabled", "ismap", "loop", "multiple", "noresize", "noshade", "nowrap", "readOnly", "selected"];


    dom.setAttrs = function($element, attrs) {
        for (var name in attrs) {
            dom.setAttr($element, name, attrs[name]);
        }
    };
    dom.setAttr = function($element, name, value) {
        //trim string
        if (typeof value === 'string') {
            value = value.trim();
        }
        switch (name) {
            case 'id':
                $element.id = value;
                break;
            case 'class':
                $element.className = value.split(' ').unique().join(' ');
                break;
            case 'css':
            case 'on':
                dom.event.ons($element, value);
                break;
            default:
                if (name in ATTRS) {
                    name = ATTRS[name];
                } else if (ATTRS_BOOL.indexOf(name) !== -1) {
                    value = !!value;
                }

        }

        $element[name] = value;
    };

    /**
     * Return element position
     *
     * @param {HTMLElement} el
     * @returns {Object}
     */
    root.dom.position = function(el) {
        var rect = el.getBoundingClientRect();
        rect.x = rect.left;
        rect.y = rect.top;
        if (typeof rect.width === 'undefined') {
            rect.width = rect.right - rect.left;
            rect.height = rect.bottom - rect.top;
        }
        return rect;
    };
})(sjs);

(function() {
    var stories = {};
    var makeStore = function(uid) {
        var buff = {};
        return {
            set: function(name, value) {
                buff[name] = value;
                return this;
            },
            get: function(name, _default) {
                if (!(name in buff) && typeof _default !== 'undefined') {
                    buff[name] = _default;
                }
                return buff[name];
            },
            reset: function() {
                buff = {};
                return this;
            },
            remove: function(name) {
                delete buff[name];
                return this;
            }
        };
    };

    sjs.dom.store = function($element) {
        var uid = sjs.dom.uid($element);
        if (uid in stories) {
            return stories[uid];
        }
        stories[uid] = makeStore(uid);
        return stories[uid];
    };
})();

(function(root) {
    //base on moolools :)

    var isEventSupport = (function() {
        if (!sjs.env.browser) {
            return function() {
                return false;
            };
        }
        var el = document.createElement('div');
        var cacheSupport = {};

        return function(name) {
            if (name in cacheSupport) {
                return true;
            }
            var el = window;
            var ename = 'on' + name.toLowerCase();
            var isSupport = false;
            if (ename in el) {

                isSupport = true;
            } else {
                if (el.setAttribute) {
                    el.setAttribute(ename, 'return;');
                    isSupport = typeof el[ename] === 'function';
                    el.removeAttribute(ename);
                }
            }
            cacheSupport[name] = isSupport;
            return isSupport;
        };
    })();

    var $nativeTypes = ['unload', 'beforeunload', 'resize', 'DOMContentLoaded', 'hashchange', 'popstate', 'error', 'abort', 'scroll', 'message'];

    var CODES = {
        38: 'up',
        39: 'right',
        40: 'down',
        37: 'left',
        16: 'shift',
        17: 'control',
        18: 'alt',
        9: 'tab',
        13: 'enter',
        36: 'home',
        35: 'end',
        33: 'pageup',
        34: 'pagedown',
        45: 'insert',
        46: 'delete',
        27: 'escape',
        32: 'space',
        8: 'backspace'
    };
    var customEvent = function(e, ctype) {

        var target = e.target;
        while (target && target.nodeType === 3) {
            target = target.parentNode;
        }

        var api = {
            e: e,
            type: ctype || e.type,
            shift: e.shiftKey,
            control: e.ctrlKey,
            alt: e.altKey,
            meta: e.metaKey,
            target: e.target,
            related: e.relatedTarget,
            page: null,
            client: null
        };
        var type = e.type;
        if (type.indexOf('key') === 0) {
            var code = e.which || e.keyCode;
            if (CODES[code]) {
                api.key = CODES[code];
            } else if (type === 'keydown' || type === 'keyup') {
                if (code > 111 && code < 124) {
                    api.key = 'f' + (code - 111);
                } else if (code > 95 && code < 106) {
                    api.key = code - 96;
                } else {
                    api.key = String.fromCharCode(code).toLowerCase();
                }
            }
        } else if (type === 'click' || type === 'dbclick' || type.indexOf('mouse') === 0 || type === 'DOMMouseScroll' || type === 'wheel' || type === 'contextmenu') {
            var doc = (!document.compatMode || document.compatMode === 'CSS1Compat') ? document.html : document.body;
            api.page = {
                x: (e.pageX !== null) ? e.pageX : e.clientX + doc.scrollLeft,
                y: (e.pageY !== null) ? e.pageY : e.clientY + doc.scrollTop
            };
            api.client = {
                x: (e.pageX !== null) ? e.pageX - window.pageXOffset : e.clientX,
                y: (e.pageY !== null) ? e.pageY - window.pageYOffset : e.clientY
            };
            api.isRight = (e.which === 3 || e.button === 2);
            if (type === 'mouseover' || type === 'mouseout') {

            } else if (e.type === 'mousewheel' || e.type === 'DOMMouseScroll' || e.type === 'wheel') {
                api.wheel = (e.wheelDelta) ? e.wheelDelta / 120 : -(e.detail || 0) / 3;
                if (e.axis) {
                    if (e.axis === e.HORIZONTAL_AXIS) {
                        api.axis = "horizontal";
                    } else {
                        api.axis = "vertical";
                    }
                } else if (e.wheelDeltaX && e.wheelDeltaX === e.wheelDelta) {
                    api.axis = "horizontal";
                } else {
                    api.axis = "vertical";
                }
            }
        } else if (type.indexOf('touch') === 0 || type.indexOf('gesture') === 0) {
            api.touch = {
                rotation: e.rotation,
                scale: e.scale,
                target: e.targetTouches,
                changed: e.changedTouches,
                touches: e.touches,
            };
            var touches = e.touches;
            if (touches && touches[0]) {
                var touch = touches[0];
                api.touch.page = {
                    x: touch.pageX,
                    y: touch.pageY
                };
                api.touch.client = {
                    x: touch.clientX,
                    y: touch.clientY
                };
            }
        }
        api.preventDefault = e.preventDefault.bind(e);
        api.stopPropagation = e.stopPropagation.bind(e);
        api.stop = function() {
            e.preventDefault();
            e.stopPropagation();
        };
        return api;
    };



    var getType = function(type) {
        if (type === 'mousewheel') {
            if (!isEventSupport('mousewheel')) {
                type = 'DOMMouseScroll';
            }
        }
        return type;
    };


    var listeners = (function() {

        var $group = {};

        return {
            target: function(uid) {
                var buff = [];
                for (var name in $group) {
                    if (name.indexOf(uid) === 1) {
                        buff.extend($group[name]);
                    }
                }
                return buff;
            },
            type: function(uid, type) {
                var sid = '_' + uid + '_' + type;
                if (!(sid in $group)) {
                    $group[sid] = [];
                }
                return {
                    findAll: function() {
                        return $group[sid].concat();
                    },
                    contains: function(callback) {
                        var listeners = $group[sid];
                        for (var i = 0; i < listeners.length; i += 1) {
                            if (listeners[i].callback === callback) {
                                return true;
                            }
                        }

                        return false;
                    },
                    find: function(callback) {

                        var listeners = $group[sid];
                        for (var i = 0; i < listeners.length; i += 1) {
                            if (listeners[i].callback === callback) {
                                return listeners[i];
                            }
                        }
                        return null;
                    },
                    remove: function(callback) {
                        var listeners = $group[sid];
                        for (var i = 0; i < listeners.length; i += 1) {
                            if (listeners[i].callback === callback) {
                                var tmp = listeners[i];
                                listeners.splice(i, 1);
                                return tmp;
                            }
                        }
                        return null;
                    },
                    add: function(type, callback, handler, bind) {
                        if (!this.contains(callback)) {
                            $group[sid].push({
                                type: type,
                                callback: callback,
                                handler: handler,
                                bind: bind
                            });
                        }
                    }
                };
            }
        };
    })();


    var addEvent = function(target, type, callback, bind) {
        bind = bind || null;

        var listeners = removeEvent(target, type, callback);
        var handler = $nativeTypes.contains(type) ? callback.bind(bind) : function(e) {
            callback.call(bind, customEvent(e, type));
        };

        target.addEventListener(getType(type), handler, false);
        listeners.add(type, callback, handler, bind);

        return {
            remove: function() {
                removeEvent(target, type, callback);
            }
        };
    };


    var removeEvent = function(target, type, callback) {
        var items = listeners.type(sjs.dom.uid(target), type);
        var listener = items.remove(callback);
        if (listener !== null) {
            target.removeEventListener(getType(type), listener.handler, false);
        }
        return items;
    };

    root.dom.on = function(target, type, callback, bind) {
        return addEvent(target, type, callback, bind);
    };
    root.dom.ons = function(target, items) {
        for (var name in items) {
            addEvent(target, name, items[name]);
        }
    };
    root.dom.once = function(target, type, callback, bind) {
        var handler = addEvent(target, type, function(e) {
            callback(e);
            handler.remove();
        }, bind);
        return handler;
    };

    root.dom.off = function(target, type, callback, bind) {
        removeEvent(target, type, callback, bind);
    };

    root.dom.offs = function(target, types) {
        var items = [];
        var uid = sjs.dom.uid(target);
        if (typeof types === 'undefined') {
            items = listeners.target(uid);
        } else {
            if (typeof types === 'string') {
                types = types.trim().split(' ').unique();
            }
            for (var t = 0; t < types.length; t += 1) {
                items.extend(listeners.type(uid, types[t]).findAll());
            }
        }
        for (var i = 0; i < items.length; i += 1) {
            removeEvent(target, items[i].type, items[i].callback);
        }
    };


})(sjs);

(function() {
    /**
     * Cookie options
     *
     * @typedef {Object} CookieOptions
     * @property {String} path
     * @property {String} domain
     * @property {Number} expires In days
     * @property {Boolean} secure Only HTTPS
     * @property {HTMLDocument} document
     * @property {Boolean} encode Encode value by encodeURIComponent method
     * @memberof sjs.dom.cookie
     */

    /**
     * @namespace sjs.dom.cookie
     */

    /**
     * @param {String} name
     * @param {CookieOptions} options
     */
    var cookie = function(name, options) {
        options = sjs.extend({
            path: '/',
            domain: false,
            expires: false,
            secure: false,
            document: sjs.dom.cookie.document,
            encode: true
        }, options || {});
        return {
            set: function(value) {
                value = typeof value === 'undefined' ? '' : value;

                if (options.encode) {
                    value = encodeURIComponent(value);
                }
                if (options.domain) {
                    value += '; domain=' + options.domain;
                }
                if (options.path) {
                    value += '; path=' + options.path;
                }
                if (options.expires) {
                    var date = new Date();
                    date.setTime(date.getTime() + options.expires * 86400000); //24 * 60 * 60 * 1000 - 1 day
                    value += '; expires=' + date.toGMTString();
                }
                if (options.secure) {
                    value += '; secure';
                }
                options.document.cookie = name + '=' + value;
            },
            get: function() {
                var value = options.document.cookie.match('(?:^|;)\\s*' + name + '=([^;]*)');
                return value ? decodeURIComponent(value[1]) : null;
            },
            remove: function() {
                cookie(name, sjs.extend({}, options, {
                    expires: -1
                })).set();
            }
        };
    };
    sjs.dom.cookie = {};
    /**
     * @const {HTMLDocument}
     */
    sjs.dom.cookie.document = sjs.env.browser ? window.document : {};

    /**
     * @method sjs.dom.cookie.set
     * @param {String} name
     * @param {CookieOptions} options
     */
    sjs.dom.cookie.set = function(name, value, options) {
        cookie(name, options).set(value);
    };

    /**
     * @method sjs.dom.cookie.get
     * @param {String} name
     * @param {CookieOptions} options
     */
    sjs.dom.cookie.get = function(name, options) {
        return cookie(name, options).get();
    };

    /**
     * @method sjs.dom.cookie.remove
     * @param {String} name
     * @param {CookieOptions} options
     */
    sjs.dom.cookie.remove = function(name, options) {
        return cookie(name, options).remove();
    };
})();
