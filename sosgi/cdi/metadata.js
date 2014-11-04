(function($cdi) {

    var CARDINALITY = ['0..1', '0..n', '1..1', '1..n'];

    var prepareProperties = function(props) {
        var properties = {};
        for (var i in props) {
            Object.defineProperty(properties, i, {
                enumerable: true,
                value: props[i]
            });
        }
        return properties;
    };
    var prepareReferences = function(refs) {
        var references = [];
        for (var i = 0; i < refs.length; i++) {
            references.push(prepareReference(refs[i]));
        }
        return references;
    };

    var prepareReference = function(ref) {
        ref = sjs.extend({}, {
            "name": null,
            "assign": null,
            "interface": null,
            "cardinality": '1..1',
            "policy": null,
            "filter": '',
            "bind": null,
            "unbind": null,
            "updated": null
        }, ref);

        if (!ref.interface) {
            throw new Error('Missing "interface" in declared reference');
        }
        ref.name = ref.name || ref.interface;

        if (!CARDINALITY.contains(ref.cardinality)) {
            throw new Error('Incorect cardinality: "' + ref.cardinality + '". Should be one of: [' + CARDINALITY + ']');
        }

        var reference = {};
        for (var r in ref) {
            Object.defineProperty(reference, r, {
                enumerable: true,
                value: ref[r]
            });
        }
        return reference;
    };
    $cdi.metadata = function(config) {

        if (!config) {
            throw new Error('Missing metadata');
        }

        var error = function(reason) {
            return new Error('Component "' + (config.name || config.class) + '" validation error: ' + reason);
        };

        config = sjs.extend({
            "name": null,
            "class": null,
            "enabled": true,
            "immediate": false,
            "activate": "activate",
            "deactivate": "deactivate",
            "modified": "modified",
            "interfaces": [],
            "properties": {},
            "references": []
        }, config);

        if (!config.class) {
            throw error('Implementation "class" name missing.');
        }
        config.name = config.name || config.class;
        var metadata = {};
        try {
            for (var c in config) {
                var item = config[c];
                switch (c) {
                    case 'properties':
                        item = prepareProperties(item);
                        break;
                    case 'interfaces':
                        //copy 
                        item = item.concat();
                        break;
                    case 'references':
                        item = prepareReferences(item);
                        break;
                }
                Object.defineProperty(metadata, c, {
                    enumerable: true,
                    value: item
                });
            }
        } catch (e) {
            throw error(e);
        }
        return metadata;
    };
})(sosgi.cdi);
