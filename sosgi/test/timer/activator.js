(function($timer) {


    $timer.Activator = function() {

        var timer = new $timer.Timer();
        var tracker;
        this.start = function(ctx) {
            timer.start();
            tracker = ctx.services.tracker('TimerListener', {
                addingService: function(reference, service) {
                    timer.addListener(service);
                },
                removedService: function(reference, service) {
                    timer.removeListener(service);
                }
            }).open();

        };
        this.stop = function(ctx) {
            timer.stop();
            if (tracker) {
                tracker.close();
            }
        };
    };
})(sosgi.test.timer);
