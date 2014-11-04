(function($api, $terminal) {


    var CommandAdapter = function(terminal, shell) {

        var on = this.on = new $terminal.Event();


        this.execute = function(line) {
            shell.execute(line, function(res) {
                on.trigger({
                    type: 'success',
                    value: res
                });
            }, function(err) {
                on.trigger({
                    type: 'error',
                    value: err
                });
            });
        };
        this.complete = function(line) {
            shell.complete(line, function(input, options) {
                on.trigger({
                    type: 'complete',
                    input: input,
                    output: options.join(' ')
                });
            });
        };
        this.close = function() {
            if (typeof terminal.close === 'function') {
                terminal.close();
            }
        };
    };



    $terminal.Terminal = function() {

    };
    $terminal.Terminal.prototype = {
        getName: function() {
            return 'Terminal';
        },
        show: function() {
            if (this.view) {
                this.view.show();
            }
        },
        hide: function() {
            if (this.view) {
                this.view.hide();
            }
        },
        activate: function(ctx) {
            var adapter = new CommandAdapter(this, this.$shell);
            this.view = new $terminal.View(adapter, createView(ctx.bundle.resource('res/terminal.html')));
            this.view.create();
        },
        deactivate: function(ctx) {
            this.view.dispose();
            this.view = null;
        }
    };
    var createView = function(html) {
        var container = document.createElement('div');
        container.innerHTML = html.trim();
        return container.firstChild;
    };
})(sosgi.api, sosgi.dev.ui.terminal);
