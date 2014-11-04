(function(__) {

    var log = sjs.log.getLogger('sapps.allegro/app.js');

    var CategoriesUI = function(callback){
        this.cids = [];
        this.callback = callback;
    };
    CategoriesUI.prototype = {
        show:function(){
            this.$dom = document.querySelector('#sapp-allegro-categories');
            sjs.dom.on(this.$dom, 'click', this.onSelect, this);
        },
        remove:function(){
            sjs.dom.off(this.$dom, 'click', this.onSelect, this);
            this.$dom = null;
        },
        update:function(data){
            var buff = [];
            if(this.cids.length){
                buff.push('<li><a href="" data-cmd="up">Back</a></li>');
            }
            for(var i = 0;i < data.length;i+=1){
                var item = data[i];
                buff.push('<li class="category"><a href="" data-cmd="'+(item[4] ? 'load': 'down')+'" data-cid="'+item[0]+'" data-pid="'+item[1]+'">'+item[2]+'</span></li>');    
            }
            this.$dom.querySelector('ul').innerHTML = buff.join('');
        },
        onSelect:function(e){
            e.stop();
            var el = e.target;
            console.log(el);
            if(el.dataset.cmd === 'up'){
                this.callback('category', this.cids.pop());
            }else if(el.dataset.cmd === 'down'){
                this.cids.push(el.dataset.pid);
                this.callback('category', el.dataset.cid);
            }else if(el.dataset.cmd === 'load'){
                this.callback('load', el.dataset.cid);
            }else if(el.dataset.cmd === 'reload'){
                 this.callback('reload');
            }
        }
    }

    var UI = function(tpl){
        this._tpl = tpl;
    };
    UI.prototype = {
        show:function($dom){
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
            this.$categories = null;  
        },
        remove:function(){
            if(this.$div){
                this.$div.parentNode.removeChild(this.$div);
                this.$div = null;
            }
        },
        reload:function(){
            console.log('refresh');
        }        
    }
    var Repository = function(http){
        this.loadCategories = function(cid){
            cid = cid || 0;
            var defer = sjs.defer();
            http.post('/categories', {cid:cid}).success(function(data){
                defer.resolve(data);
            });
            return defer.promise;
        }
    };

    __.App = function(){
    	
    };
    __.App.prototype = {
        activate:function(ctx){
            var repository = this.repository = new Repository(this.$http);
            this.ui = new UI(ctx.bundle.resource('res/allegro.html'));
            var self = this;
            this.categories = new CategoriesUI(function(action, cid){
                if(action === 'category'){
                    self.loadCategories(cid);
                }else if(action === 'load'){
                    console.log('load');
                }
                
            });
        },
        loadCategories:function(cid){
            var categories = this.categories;
            this.repository.loadCategories(cid).done(function(data){
                categories.update(data);
            });
        },
        deactivate:function(ctx){
            this.categories.remove();
            this.ui.remove();            
            this.ui = null;
            this.categories = null;
        },
        show:function($dom){
            this.ui.show($dom);
            this.categories.show();  
            this.loadCategories();          
        },
        hide:function(){
            this.ui.hide();
        },
        reload:function(){
            this.ui.reload();  
        }
    }

})(sapps.ui.allegro);
