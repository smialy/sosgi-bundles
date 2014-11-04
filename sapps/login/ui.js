(function($login) {

    $login.UI = function($dom, tpl) {
        
        this.tpl = tpl;
    };

    $login.UI.prototype = {
        create: function() {
            document.body.classList.add('login');
            var $div = document.createElement('div');
            $div.innerHTML = this.tpl.trim();
            this.$dom = $div.firstChild;
            document.body.appendChild(this.$dom);

            this.$login = document.querySelector('#login-box');
            var $form = document.querySelector('#login-form');
            $form.addEventListener('submit', function(e) {
                e.preventDefault();
                var login = document.querySelector('#login-box-email-input').value;
                var password = document.querySelector('#login-box-password-input').value;
                this.mediator.login(login, password);
            }.bind(this));
            
        },
        wait: function(state) {
            if (this.$login) {
                if (state) {
                    this.$login.classList.add('waiting');
                } else {
                    this.$login.classList.remove('waiting');
                }
            }
            return this;
        },
        error:function(msg){
            if(msg){
                this.$login.classList.add('errors');
            }else{
                this.$login.classList.remove('errors');
            }
            document.querySelector('#login-box-password-input').value = '';
            this.$login.querySelector('.error').innerHTML = msg;
            return this;
        },
        remove: function() {
            document.body.classList.remove('login');
            document.body.removeChild(this.$dom);
            return this;
        }
    };

})(sapps.login);
