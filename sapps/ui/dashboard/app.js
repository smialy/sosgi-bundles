(function(__) {

    var log = sjs.log.getLogger('sapps.ui.dashboard/app.js');
    
    var UI = function(tpl){
        this._tpl = tpl;
    };
    UI.prototype = {
        show:function($dom){
            console.log('show', $dom);
            if(!this.$dom){
                var div = document.createElement('div');
                div.innerHTML = this._tpl.trim();
                this.$div = div.firstChild;
                $dom.appendChild(this.$div);
            }
            this.$div.classList.add('show');
        },
        hide:function(){
            this.$div.parentNode.removeChild(this.$div);
            this.$div = null;
        },
        remove:function(){
            console.log('remove');
            if(this.$div){
                this.$div.parentNode.removeChild(this.$div);
                this.$div = null;
            }
        },
        reload:function(){
            console.log('refresh');
        }
    }
    __.App = function(){
    	
    };
    __.App.prototype = {
        start:function(ctx){
            this.ui = new UI(ctx.bundle.resource('res/dashboard.html'));
        },
        stop:function(){
            this.ui.remove();
            this.ui = null;
        },
        show:function($dom){
            console.log('Show dashboard');
            this.ui.show($dom);
        },
        hide:function(){
            console.log('Hide dashboard');
            this.ui.hide();
        },
        reload:function(){
            console.log('Reload dashboard');
            this.ui.reload();  
        }
    }

})(sapps.ui.dashboard);
