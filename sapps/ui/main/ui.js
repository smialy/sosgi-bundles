(function($main) {

    var Event = function(){
        this._listeners = [];
    };
    Event.prototype = {
        add:function(callback, bind){
            bind = bind || null;
            this._listeners.push([callback, bind])
        },
        remove:function(callback, bind){
            bind = bind || null;
            for(var i = this._listeners.length-1;i>=0; i-=1){
                var listener = this._listeners[i];
                if(listener[0] === callback && (!bind || bind === listener[1])){
                    this._listeners.splice(i, 1);
                }
            }
        },
        fire:function(args){
            for(var i = 0, l = this._listeners.length; i < l; i+=1){
                var listener = this._listeners[i];
                listener[0].apply(listener[1], args || []);
            }
        }
    };

    $main.UI = function(tpl) {
        this.tpl = tpl;
        this.on = {
            select:new Event(),
            reload:new Event()
        }
    };

    $main.UI.prototype = {
        create: function(user) {
            document.body.classList.add('main');

            var div = document.createElement('div');
            div.innerHTML = this.tpl.trim();
            this.$div = div.firstChild;
            
            document.body.appendChild(this.$div);
            document.querySelector('#x-sapps-usernav-name').innerHTML = user.name;
            this.$showMore = document.querySelector('#sapps-nav-apps-more');
            this.$appList = document.querySelector('#sapps-apps-list');
            this.$container = document.querySelector('#sapps-container');
            this.$currentAppLabel = document.querySelector('#sapps-nav-apps-current');
            
            
            sjs.dom.on(this.$currentAppLabel, 'click', this.onReloadApp, this);
            sjs.dom.on(this.$showMore, 'click', this.onShowAppList, this);
            sjs.dom.on(this.$appList, 'click', this.onSelectApp, this);
            div = null;
        },
        remove: function() {
            if(this.$div){
                this.$div.parentNode.removeChild(this.$div);
            }
            
            sjs.dom.off(this.$currentAppLabel, 'click', this.onReloadApp, this);
            sjs.dom.off(this.$showMore, 'click', this.onShowAppList, this);
            sjs.dom.off(this.$appList, 'click', this.onSelectApp, this);

            this.$showMore = null;
            this.$appList = null;
            this.$div = null;
            this.$container = null;
            this.$currentAppLabel = null;
            
            document.body.classList.remove('main');
        },
        addApp:function(id, props){
            var $div = sjs.dom('<a href="'+props.url+'" class="app app-sid-'+id+'" data-sid='+id+'">'+props.label+'</a>');
            this.$appList.appendChild($div);
        },
        removeApp:function(id){
            var $div = this.$appList.querySelector('.app-sid-'+id);
            this.$appList.removeChild($div);
        },
        selectApp:function(id, props){
            this.$currentAppLabel.innerHTML = props.label;
            var $div = this.$appList.querySelector('.selected');
            if($div){
                $div.classList.remove('selected');
            }
            $div = this.$appList.querySelector('.app-sid-'+id);
            $div.classList.add('selected');
            
        },
        onShowAppList:function(e){
            e.stop();
            if(this.$div.classList.contains('show-list')){
                this.$div.classList.remove('show-list');
            }else{
                this.$div.classList.add('show-list');
            }
        },
        onSelectApp:function(e){
            this.$div.classList.remove('show-list');
            var id = parseInt(e.target.dataset.sid, 10);
            this.on.select.fire([id]);
        },
        onReloadApp:function(){
            this.on.reload.fire();  
        }
    };

})(sapps.ui.main);
