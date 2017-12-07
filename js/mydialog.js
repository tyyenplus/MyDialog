;(function(undefined) {
    var _global;

    // 合并对象
	function extend(obj,newobj) {
	    for(var key in newobj){
	        if(newobj.hasOwnProperty(key) && (obj.hasOwnProperty(key))){
	            obj[key] = newobj[key];
	        }
	    }
	    return obj;
	}
    // addClass
    function addClass(obj,clsName) {
		var cur = obj.className;
		var clsArr = clsName.split(' ');
		for(var i = 0, len = clsArr.length; i < len; i++) {
			if(!(cur.indexOf(clsArr[i]) > -1)) {
				cur += ' ' + clsArr[i];
			}
		}
		obj.className = cur;
		return obj;
	}
    // removeClass
    function removeClass(obj,clsName) {
		var curArr = obj.className.split(' ');
		var clsArr = clsName.split(' ');
		var clsobj = {};
		var newCls = '';
		for(var i = 0, len = curArr.length; i < len; i++) {
			clsobj[curArr[i]] = curArr[i];
		}
		for(var i = 0, len = clsArr.length; i < len; i++) {
			if(clsobj[clsArr[i]]) {
				clsobj[clsArr[i]] = '';
			}
		}
		for(var i in clsobj) {
			if(clsobj[i]) {
				newCls += ' ' + clsobj[i];
			}
		}
		obj.className = newCls.trim();
		return obj;
	}
    // 通过class查找dom
    if(!('getElementsByClass' in HTMLElement)){
        HTMLElement.prototype.getElementsByClass = function(n){
            var el = [],
                _el = this.getElementsByTagName('*');
            for (var i=0; i<_el.length; i++ ) {
                if (!!_el[i].className && (typeof _el[i].className == 'string') && _el[i].className.indexOf(n) > -1 ) {
                    el.push(_el[i]);
                }
            }
            return el;
        };
        ((typeof HTMLDocument !== 'undefined') ? HTMLDocument : Document).prototype.getElementsByClass = HTMLElement.prototype.getElementsByClass;
    }

    var title, winW, winH;
    function myDialog(opt) {
        var defaults = {
            type : 'alert',     // alert、confirm、info
            titleText : '信息提示',
            showTitle : true,
            contentHtml : '',
            dialogClass : '',
            autoClose : false,
            maskClose : false,
            drag : false,

            buttonText : {
                ok : '确定',
                cancel : '取消',
                delete : '删除'
            },
            buttonClass : {
                ok : '',
                cancel : '',
                delete : ''
            },

            infoText : '',      // working in info type
            infoType : '',      // working in info type

            onClickOk : function(){},
            onClickCancel : function(){},
            onClickClose : function(){},

            onBeforeShow : function(){},
            onShow : function(){},
            onBeforeClosed : function(){},
            onClosed : function(){}
        };

        this.options = extend(defaults,opt);

        this.timed;
        this.result;
        this.dialog;

        this._init();
    }

    myDialog.prototype = {
        _init: function() {
            wW = window.clientWidth || document.documentElement.clientWidth || document.body.clientWidth;
            wH = window.clientWidth || document.documentElement.clientHeight || document.documentbody.clientHeight;
            this._show();
            console.log(this.options.maskClose)
            if(this.options.maskClose) this._maskClose();
        },
        _createDom: function() {
            var me = this;
            var doc = document;
            // dialog wrap
            me.dialog = doc.getElementsByClass('dialog-wrap');

            me.dialog = doc.createElement('div');
            me.dialog.className = 'dialog-wrap ' + me.options.dialogClass;
            doc.body.appendChild(me.dialog);
            // dialog mask
            var overlay = doc.createElement('div');
            overlay.className = 'dialog-masklay';
            me.dialog.appendChild(overlay);

            var opt = me.options;
            me.dialog = me._dialogType(opt)
            // me._Event();

            return me.dialog;
        },
        _dialogType: function(opt) {
            var me = this;
            var doc = document;
            // dialog container
            var content = doc.createElement('div');
            content.className = 'dialog-content';
            me.dialog.appendChild(content);
            switch(opt.type) {
                case 'alert':
                    if(opt.showTitle) {
                        title = doc.createElement('div');
                        title.className = 'dialog-content-hd';
                        title.innerHTML = '<h4 class="dialog-content-title">'+ opt.titleText +'</h4>';
                        content.appendChild(title);
                    }
                    contentBd = doc.createElement('div');
                    contentBd.className = 'dialog-content-bd';
                    contentBd.innerHTML = opt.contentHtml;
                    content.appendChild(contentBd);

                    contentFt = doc.createElement('div');
                    contentFt.className = 'dialog-content-ft';
                    okBtn = doc.createElement('a');
                    okBtn.setAttribute('href','javascript:;');
                    okBtn.className = 'dialog-btn dialog-btn-ok '+ opt.buttonClass.ok;
                    okBtn.innerHTML = opt.buttonText.ok;
                    contentFt.appendChild(okBtn)
                    content.appendChild(contentFt);
                    me._Event(okBtn,'click',function() {
                        opt.onClickOk();
                        me._autoClose();
                    });
                    removeClass(me.dialog,'dialog-wrap-info');
                    break;
                case 'confirm':
                    if(opt.showTitle) {
                        title = doc.createElement('div');
                        title.className = 'dialog-content-hd';
                        title.innerHTML = '<h4 class="dialog-content-title">'+ opt.titleText +'</h4>';
                        content.appendChild(title);
                    }
                    contentBd = doc.createElement('div');
                    contentBd.className = 'dialog-content-bd';
                    contentBd.innerHTML = opt.contentHtml;
                    content.appendChild(contentBd);

                    contentFt = doc.createElement('div');
                    contentFt.className = 'dialog-content-ft';
                    okBtn = doc.createElement('a');
                    okBtn.setAttribute('href','javascript:;');
                    okBtn.className = 'dialog-btn dialog-btn-ok '+ opt.buttonClass.ok;
                    okBtn.innerHTML = opt.buttonText.ok;
                    cancelBtn = doc.createElement('a')
                    cancelBtn.setAttribute('href','javascript:;');
                    cancelBtn.className = 'dialog-btn dialog-btn-cancel ' + opt.buttonClass.cancel
                    cancelBtn.innerHTML = opt.buttonText.cancel;
                    contentFt.appendChild(okBtn);
                    contentFt.appendChild(cancelBtn)
                    content.appendChild(contentFt);
                    me._Event(okBtn,'click',function() {
                        opt.onClickOk();
                        me._autoClose();
                    });
                    me._Event(cancelBtn,'click',function() {
                        opt.onClickCancel();
                        me._autoClose();
                    });
                    removeClass(me.dialog,'dialog-wrap-info');
                    break;
                case 'info':
                    var infostr;
                    switch (opt.infoType) {
                        case 'loading':
                            infostr = '<div class="info-pic">' + loading.load1() + '</div><p class="info-text">'+ opt.infoText +'</p>'
                            break;
                        case 'success':
                            infostr = '<div class="info-pic">' + loading.successLoad() + '</div><p class="info-text">'+ opt.infoText +'</p>';
                            break;
                        case 'error':
                            infostr = '<div class="info-pic"><img class="info-icon" src="images/icon/fail.png" alt="' + opt.infoText + '" /></div><p class="info-text">'+ opt.infoText +'</p>';
                            break;
                        default:
                            break;
                    }
                    var infoContent = opt.contentHtml || infostr;
                    contentBd = doc.createElement('div');
                    contentBd.className = 'dialog-content-bd';
                    contentBd.innerHTML =infoContent;
                    content.appendChild(contentBd);
                    addClass(me.dialog,'dialog-wrap-info');
                    addClass(content,'dialog-content-info');
                    break;
                default:
                    break;
            }
            return me.dialog;
        },
        _renderDom: function() {
            if(!this.result) {
                return this.result = this._createDom();
            }
            return this.result;
        },
        _css: function() {
            var dialog = this.dialog.getElementsByClass('dialog-content')[0];
            var dw, dh;
            dw =  dialog.offsetWidth;
            dh =  dialog.offsetHeight;
            var csstxt = 'position:fixed;width:' + dw + 'px;height:' + dh + 'px;left:' + (wW-dw)/2 + 'px;top:' + (wH-dh)/2 + 'px';
            dialog.style.cssText = csstxt;
        },
        _Event: function(obj,type,fn) {
            if(window.addEventListener) {
                obj.addEventListener(type,fn,false);
            } else if (window.attachEvent,fn,false) {
                obj.attachEvent('on' + type,fn,false);
            } else {
                obj['on' + type] = fn;
            }
        },
        _show: function() {
            var _this = this;
            _this.dialog = _this._renderDom();
            _this._css();
            _this.options.onBeforeShow();
            setTimeout(function(){
                addClass(_this.dialog,'dialog-wrap-show');
                _this.options.onShow();
            }, 10);
            if(this.options.autoClose) {
                clearTimeout(_this.timed);
                _this.timed = setTimeout(function() {
                    _this._autoClose();
                }, _this.options.autoClose);
            }
        },
        _autoClose: function() {
            var _this = this;
            clearTimeout(_this.timed);
            _this.options.onBeforeClosed();
            removeClass(_this.dialog,'dialog-wrap-show');
            setTimeout(function() {
                if(document.getElementsByClass('dialog-wrap')[0]) document.body.removeChild(_this.dialog);
                _this.options.onClosed();
            }, 300);
        },
        _maskClose: function() {
            var _this = this;
            var overlay = this.dialog.getElementsByClass('dialog-masklay')[0];
            console.log(overlay)
            _this._Event(overlay,'click',function() {
                _this._autoClose();
            })
        },
        update: function(opt) {
            var _this = this;
            // console.log(_this.dialog);
            var dialog = _this.dialog;
            dialog.removeChild(document.getElementsByClass('dialog-content')[0]);
            console.log(dialog)
            opt = extend(_this.options, opt);
            dialog = _this._dialogType(opt);
            _this._css();
            _this.timed = setTimeout(function() {
                _this._autoClose();
            }, opt.autoClose);
        },
    }




















    _global = (function(){ return this || (0, eval)('this'); }());
    !('myDialog' in _global) && (_global.myDialog = myDialog);
})();
// loading
var loading = {
    load1: function() {
        // var div = document.createElement('div');
        // div.className = 'loading1';
        var div = '<div class="loading1"><div class="rect1"></div><div class="rect2"></div><div class="rect3"></div><div class="rect4"></div><div class="rect5"></div></div>';
        return div;
    },
    load2: function() {
        var div = '<div class="loading2"><div><span></span></div><div><span></span></div><div><span></span></div></div>';
        return div;
    },
    successLoad: function() {
        var div = '<div class="animate-container"><span class="sa-line sa-tip animateSuccessTip"></span><span class="sa-line sa-long animateSuccessLong"></span></div>'
        return div;
    }
}
