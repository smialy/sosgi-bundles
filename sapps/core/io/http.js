(function(api, io) {
    var log = sjs.log.getLogger('sapps.io/http.js');

    
function encodeUri(s){
    return encodeURIComponent(s).
        replace(/%40/gi, '@').
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',');
}

    var qs = {
        encode: function(params) {
            var buff = [];
            var val;
            for (var i in params) {
                val = params[i];
                if (val !== null && typeof val !== 'undefined') {
                    buff.push(encodeUri(i) + '=' + encodeUri(val));
                }
            }
            buff.sort();
            return buff.join('&');
        },
        decode: function(str) {
            var parts = str.split('&'),
                pair, params = {};
            for (var i = 0; i < parts.length; i++) {
                pair = parts[i].split('=', 2);
                if (pair && pair[0]) {
                    params[decodeURIComponent(pair[0])] = decodeURIComponent[pair[1]];
                }
            }
            return params;
        }
    };


function xhr(method, url, data, headers, timeout, callback) {

    method = method.toUpperCase()
    data = data || null;
    headers = headers || {};
    timeout = timeout || 0;
    callback = typeof callback === 'function' ? callback : function() {};

    var timeoutId = 0;
    var smethod = method.toLowerCase();
    var xhr = new XMLHttpRequest();
    var status = 'load';

    xhr.open(method, url, true);

    for (var name in headers) {
        if (headers[name]) {
            xhr.setRequestHeader(name, headers[name]);
        }
        //xhr.setRequestHeader('Content-Type', 'application/json');
    }
    xhr.addEventListener('load', completeRequest);
    xhr.addEventListener('error', completeRequest);
    xhr.addEventListener('abort', completeRequest);

    xhr.send(data);

    if (timeout > 0) {
        timeoutId = setTimeout(function() {
            status = 'timeout';
            xhr.abort();
        });
    }

    function completeRequest(e) {
        clearTimeout(timeoutId);
        var type = status === 'timeout' ? 'timeout' : e.type;
        callback(
            type,
            xhr.status,
            'response' in xhr ? xhr.response : xhr.responseText,
            xhr.getAllResponseHeaders(),
            xhr.statusText
        );
        xhr = null;
        timeoutId = null;
        status = null;

    }

    return function() {
        if (xhr) {
            status = 'abort';
            xhr.abort();
        }
    };
};

var _headers = {
    common:{
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json;charset=utf-8'
    }
};

function isObject(obj) {
  return obj != null && typeof obj === 'object'; 
}

function isFile(obj) {
  return toString.call(obj) === '[object File]';
}


function isBlob(obj) {
  return toString.call(obj) === '[object Blob]';
}


function parseHeaders(sheaders){
    var lines = sheaders.split('\n'), line, index, key, value;
    var buff = {};
    for(var i = 0;i<lines.length;i+=1){
        line = lines[i]
        index = line.indexOf(':');
        key = line.substr(0, index);
        value = line.substr(index+1).trim();
        if(key){
            buff[key] = buff[key] ? buff[key]+', '+value : value;
        }
    }
    return buff;
}


function prepareUrl(url, params){
    if(!params){
        return url;    
    }
    var buff = [], keys = Object.keys(params), name;
    keys.sort();
    for(var i = 0;i<keys.length;i+=1){
        name = keys[i];
        buff.push(qs.encode(name) +'='+ qs.encode(params[name]));
    }
    if(buff.length){
        var index = url.indexOf('?');
        url += (index === -1 ? '?' : (index === url.length-1 ? '' : '&') ) + buff.join('&');
    }
    return url;
}


function http(options){
    options = sjs.extend({}, {
        url:'',
        method:'GET',
        transformRequest: function(data, headers){
            return isObject(data) && !isFile(data) && !isBlob(data) ? JSON.stringify(data) : data;
        },
        transformResponse:function(data, headers){
            if(typeof data === 'string'){
                var ct = headers['Content-Type'];
                if(ct && ct.indexOf('application/json') !== -1){
                    return JSON.parse(data);
                }
            }
            return data;
        },
        params:null,
        data:null,
        headers:{},
        request:'',
        requestType:'json',
        timeout:0,
        responseType:''
    }, options || {});

    var headers = sjs.extend({}, _headers.common, options.headers || {});
    var data = options.transformRequest(options.data, headers);
    var url = prepareUrl(options.url, options.params);
    var defer = sjs.defer();
    var promise = defer.promise;

    promise.success = function(fn){
        defer.done(function(response){
            fn(response.data, response.status, response.headers);
        });
        return promise;
    };
    promise.error = function(fn){
        defer.fail(function(response){
            fn(response.data, response.status, response.headers);
        });
        return promise;
    };
    var abort = xhr(options.method, url, data, headers, options.timeout, function(type, status, response, sheaders, statusText){
        var headers = parseHeaders(sheaders);
        var response = {
            status: status,
            data:options.transformResponse(response, headers),
            headers: headers,
            statusText: statusText
        }
        if(200 <= status && status < 300){
            defer.resolve(response);
        }else{
            defer.reject(headers, status);
        }
    });
    promise.abort = abort;
    return promise;
}


    var HTTP = function(base) {
        api.io.HttpConnection.call(this);
        this.base = base;
        console.debug('Create http connection: (base=' + base + ')');
    };
    HTTP.prototype = {
        post:function(url, data){
            return this._send('post', url, data);
        },
        get: function(url, data){
            return this._send('get', url, data);
        },
        _send:function(method, url, data){
            return http({
                method: method,
                url:this.base + url, 
                data: data
            });
        }
    };

    io.http = function(properties) {
        return new HTTP(properties.base || '/');
    };

})(sapps.api, sapps.core.io);
