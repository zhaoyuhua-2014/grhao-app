

require(['../require/config'],function () {
	
		var pub = {
			UA : navigator.userAgent.toLowerCase(),
			// 判断环境是否为微信
			isWeiXin : function(){
				return this.UA.match(/MicroMessenger/i) == 'micromessenger';
			},
			// 判断是否为移动设备
			isPhone : function(){
				var 
				ua = this.UA,
		        bIsIpad = ua.match(/ipad/i) == "ipad",
		        bIsIphoneOs = ua.match(/iphone os/i) == "iphone os",
		        bIsMidp = ua.match(/midp/i) == "midp",
		        bIsUc7 = ua.match(/rv:1\.2\.3\.4/i) == "rv:1.2.3.4",
		        bIsUc = ua.match(/ucweb/i) == "ucweb",
		        bIsAndroid = ua.match(/android/i) == "android",
		        bIsCE = ua.match(/windows ce/i) == "windows ce",
		        bIsWM = ua.match(/windows mobile/i) == "windows mobile";
	
			    return bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM;
			},
			// APP
			isApp : function(){
				return this.UA.match(/grh_app/i) == 'grh_app';
			},
			// 安卓设备
			isAndroid : function(){
				return this.UA.match(/android/i) == "android";
			},
			isApple : function(){
				return this.UA.match(/iphone os/i) == "iphone os";
			},
			getUrlParam : function ( mid ) {
	            var reg = new RegExp("(^|&)" + mid + "=([^&]*)(&|$)");
	            var r = window.location.search.substr(1).match(reg);
	            if ( r != null ) 
	            	return decodeURIComponent(r[2]); 
	            return null;
	        }
		};
		if (pub.isWeiXin()) {
			pub.wx = require('weixinSDK')['myFn'](window);
		}
		pub.searchAddr = pub.getUrlParam('addr');
		// 统一接口处理函数
		pub.ajaxPost = function(data, done, fail, finish ){
			done = typeof done !== 'function' ? function(){} : done;
			fail = typeof fail !== 'function' ? function( d ){d.status == 0 ? (function(){
				!window.navigator.onLine && pub.prompt("网络连接异常")
			})() : '' } : fail;
			finish = typeof finish !== 'function' ? function(XMLHttpRequest,status){
				if(status=='timeout'){console.log("finish");}
				//超时,status还有success,error等值的情况ajaxTimeoutTest.abort();alert("超时");
			} : finish;
			$.ajax({
				url: "http://61.164.113.168:8090/grh_api/server/api.do",
				dataType: 'jsonp',
				data : data,
				success : done,
				error : fail,
				complete : finish
			});
		};
		//弹出提示
		pub.prompt = function( str, t ){
			var 
			promptNode = $('#prompt-node'),
			t = t || 2300;

			promptNode[0] && promptNode.remove();

			var promptNode = $('<div class="prompt" id="prompt-node"></div>').appendTo('body');

			promptNode.html( '<p>' + str + '</p>' )
			.css("margin-left",- promptNode.outerWidth() / 2 )
			.fadeIn(300);

			this.setMyTimeout(function(){
				promptNode.remove();
			},t);
		};
		pub.confirmBackApp = function(opt){
			var title = opt.title,
				url = opt.url || window.location.href,
				callBackName = opt.callBackName;
			var jsonObj = {'title':title,"url":'/'+url,"callBack":callBackName};
			
			if (pub.isPhone()) {
				if (pub.isApple()) {
					try{
						window.webkit.messageHandlers.confirmBack.postMessage(jsonObj);
					}catch(e){
						console.log("调用ios方法confirmBack出错")
					}
				} else if(pub.isAndroid()){
					try{
						android.confirmBack(JSON.stringify(jsonObj))
					}catch(e){
						console.log("调用Android方法confirmBack出错")
					}
				}					
			}else{
				console.log("this is not grhao App!")
			}
		};
		pub.goBackApp = function(opt){
			num = opt.num || 1,
			type = opt.type || 1,
			url = opt.url;
			var jsonObj = {'hierarchy':num,'reload':type,'url':'/'+url};
			if (pub.isApp()) {
				if (pub.isApple()) {
					try{
						window.webkit.messageHandlers.goBack.postMessage(jsonObj);
					}catch(e){
						console.log("调用ios方法goBack出错")
					}
				} else if(pub.isAndroid()){
					try{
						android.goBack(JSON.stringify(jsonObj))
					}catch(e){
						console.log("调用Android方法goBack出错")
					}
				}					
			}else{
				console.log("this is not grhao App!")
			}
		};
		pub.confirmBackApp = function(opt){
			var title = opt.title,
				url = opt.url || window.location.href,
				callBackName = opt.callBackName;
			var jsonObj = {'title':title,"url":'/'+url,"callBack":callBackName};
			console.log(jsonObj)
			if (pub.isPhone()) {
				if (pub.isApple()) {
					try{
						window.webkit.messageHandlers.confirmBack.postMessage(jsonObj);
					}catch(e){
						console.log("调用ios方法confirmBack出错")
					}
				} else if(pub.isAndroid()){
					try{
						android.confirmBack(JSON.stringify(jsonObj))
					}catch(e){
						console.log("调用Android方法confirmBack出错")
					}
				}					
			}else{
				console.log("this is not grhao App!")
			}
		};
		pub.replaceLocationApp = function(){
			if (pub.isApp()) {
				if (pub.isApple()) {
					try{
						window.webkit.messageHandlers.replaceLocation.postMessage('');
					}catch(e){
						console.log("调用ios方法replaceLocation出错")
					}
				} else if(pub.isAndroid()){
					try{
						android.replaceLocation()
					}catch(e){
						console.log("调用Android方法replaceLocation出错")
					}
				}					
			}else{
				console.log("this is not grhao App!")
			}
		};
		pub.wxConfig = {
			init:function(){
				var url = location.href.split('#')[0];
				
				pub.ajaxPost({
					method : 'weixin_config',
			        url : url
				}, function( d ){
					if( d.statusCode == '100200' ){
						alert("操作异常，请重新操作!");
					}else if( d.statusCode == '100000' ){
						var 
						result = d.data,
						appId = result.appId,
						signature = result.signature,
						timestamp = result.timestamp,
						nonceStr = result.nonceStr;
	
						pub.wx.config({
	
						    debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
						    appId: appId, // 必填，公众号的唯一标识
						    timestamp : timestamp, // 必填，生成签名的时间戳
						    nonceStr: nonceStr, // 必填，生成签名的随机串
						    signature: signature,// 必填，签名，见附录1
	
						    jsApiList:["getLocation"] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
						});
						pub.wx.ready(function(){ 
							pub.wx.checkJsApi({
				            	jsApiList: ['getLocation'],
				            	success: function (res) {
				 					LightNavi.mapApp();
				            	}
				            })
						});
						pub.wx.error(function(res){
							LightNavi.mapApp();
							// alert(common.JSONStr(res))// config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
						});
					}		
				}, function( d ){
					alert("分享插件升级中。。。");
				});	
			}
		};
	
		/*! AutoNavi light map - v0.2.22 - 2017-06-09 03:06:40 Copyright (c) 2017 AutoNavi CO.,LTD; */
		var Zepto = function() {
			function a(a) {
				return null == a ? String(a) : V[W.call(a)] || "object"
			}
		
			function b(b) {
				return "function" == a(b)
			}
		
			function c(a) {
				return null != a && a == a.window
			}
		
			function d(a) {
				return null != a && a.nodeType == a.DOCUMENT_NODE
			}
		
			function e(b) {
				return "object" == a(b)
			}
		
			function f(a) {
				return e(a) && !c(a) && Object.getPrototypeOf(a) == Object.prototype
			}
		
			function g(a) {
				return a instanceof Array
			}
		
			function h(a) {
				return "number" == typeof a.length
			}
		
			function i(a) {
				return E.call(a, function(a) {
					return null != a
				})
			}
		
			function j(a) {
				return a.length > 0 ? y.fn.concat.apply([], a) : a
			}
		
			function k(a) {
				return a.replace(/::/g, "/").replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2").replace(/([a-z\d])([A-Z])/g, "$1_$2").replace(/_/g, "-").toLowerCase()
			}
		
			function l(a) {
				return a in H ? H[a] : H[a] = new RegExp("(^|\\s)" + a + "(\\s|$)")
			}
		
			function m(a, b) {
				return "number" != typeof b || I[k(a)] ? b : b + "px"
			}
		
			function n(a) {
				var b, c;
				return G[a] || (b = F.createElement(a), F.body.appendChild(b), c = getComputedStyle(b, "").getPropertyValue("display"), b.parentNode.removeChild(b), "none" == c && (c = "block"), G[a] = c), G[a]
			}
		
			function o(a) {
				return "children" in a ? D.call(a.children) : y.map(a.childNodes, function(a) {
					return 1 == a.nodeType ? a : void 0
				})
			}
		
			function p(a, b, c) {
				for(x in b) c && (f(b[x]) || g(b[x])) ? (f(b[x]) && !f(a[x]) && (a[x] = {}), g(b[x]) && !g(a[x]) && (a[x] = []), p(a[x], b[x], c)) : b[x] !== w && (a[x] = b[x])
			}
		
			function q(a, b) {
				return null == b ? y(a) : y(a).filter(b)
			}
		
			function r(a, c, d, e) {
				return b(c) ? c.call(a, d, e) : c
			}
		
			function s(a, b, c) {
				null == c ? a.removeAttribute(b) : a.setAttribute(b, c)
			}
		
			function t(a, b) {
				var c = a.className,
					d = c && c.baseVal !== w;
				return b === w ? d ? c.baseVal : c : void(d ? c.baseVal = b : a.className = b)
			}
		
			function u(a) {
				var b;
				try {
					return a ? "true" == a || ("false" == a ? !1 : "null" == a ? null : /^0/.test(a) || isNaN(b = Number(a)) ? /^[\[\{]/.test(a) ? y.parseJSON(a) : a : b) : a
				} catch(c) {
					return a
				}
			}
		
			function v(a, b) {
				b(a);
				for(var c in a.childNodes) v(a.childNodes[c], b)
			}
			var w, x, y, z, A, B, C = [],
				D = C.slice,
				E = C.filter,
				F = window.document,
				G = {},
				H = {},
				I = {
					"column-count": 1,
					columns: 1,
					"font-weight": 1,
					"line-height": 1,
					opacity: 1,
					"z-index": 1,
					zoom: 1
				},
				J = /^\s*<(\w+|!)[^>]*>/,
				K = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
				L = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
				M = /^(?:body|html)$/i,
				N = /([A-Z])/g,
				O = ["val", "css", "html", "text", "data", "width", "height", "offset"],
				P = ["after", "prepend", "before", "append"],
				Q = F.createElement("table"),
				R = F.createElement("tr"),
				S = {
					tr: F.createElement("tbody"),
					tbody: Q,
					thead: Q,
					tfoot: Q,
					td: R,
					th: R,
					"*": F.createElement("div")
				},
				T = /complete|loaded|interactive/,
				U = /^[\w-]*$/,
				V = {},
				W = V.toString,
				X = {},
				Y = F.createElement("div"),
				Z = {
					tabindex: "tabIndex",
					readonly: "readOnly",
					"for": "htmlFor",
					"class": "className",
					maxlength: "maxLength",
					cellspacing: "cellSpacing",
					cellpadding: "cellPadding",
					rowspan: "rowSpan",
					colspan: "colSpan",
					usemap: "useMap",
					frameborder: "frameBorder",
					contenteditable: "contentEditable"
				};
			return X.matches = function(a, b) {
				if(!b || !a || 1 !== a.nodeType) return !1;
				var c = a.webkitMatchesSelector || a.mozMatchesSelector || a.oMatchesSelector || a.matchesSelector;
				if(c) return c.call(a, b);
				var d, e = a.parentNode,
					f = !e;
				return f && (e = Y).appendChild(a), d = ~X.qsa(e, b).indexOf(a), f && Y.removeChild(a), d
			}, A = function(a) {
				return a.replace(/-+(.)?/g, function(a, b) {
					return b ? b.toUpperCase() : ""
				})
			}, B = function(a) {
				return E.call(a, function(b, c) {
					return a.indexOf(b) == c
				})
			}, X.fragment = function(a, b, c) {
				var d, e, g;
				return K.test(a) && (d = y(F.createElement(RegExp.$1))), d || (a.replace && (a = a.replace(L, "<$1></$2>")), b === w && (b = J.test(a) && RegExp.$1), b in S || (b = "*"), g = S[b], g.innerHTML = "" + a, d = y.each(D.call(g.childNodes), function() {
					g.removeChild(this)
				})), f(c) && (e = y(d), y.each(c, function(a, b) {
					O.indexOf(a) > -1 ? e[a](b) : e.attr(a, b)
				})), d
			}, X.Z = function(a, b) {
				return a = a || [], a.__proto__ = y.fn, a.selector = b || "", a
			}, X.isZ = function(a) {
				return a instanceof X.Z
			}, X.init = function(a, c) {
				var d;
				if(!a) return X.Z();
				if("string" == typeof a)
					if(a = a.trim(), "<" == a[0] && J.test(a)) d = X.fragment(a, RegExp.$1, c), a = null;
					else {
						if(c !== w) return y(c).find(a);
						d = X.qsa(F, a)
					}
				else {
					if(b(a)) return y(F).ready(a);
					if(X.isZ(a)) return a;
					if(g(a)) d = i(a);
					else if(e(a)) d = [a], a = null;
					else if(J.test(a)) d = X.fragment(a.trim(), RegExp.$1, c), a = null;
					else {
						if(c !== w) return y(c).find(a);
						d = X.qsa(F, a)
					}
				}
				return X.Z(d, a)
			}, y = function(a, b) {
				return X.init(a, b)
			}, y.extend = function(a) {
				var b, c = D.call(arguments, 1);
				return "boolean" == typeof a && (b = a, a = c.shift()), c.forEach(function(c) {
					p(a, c, b)
				}), a
			}, X.qsa = function(a, b) {
				var c, e = "#" == b[0],
					f = !e && "." == b[0],
					g = e || f ? b.slice(1) : b,
					h = U.test(g);
				return d(a) && h && e ? (c = a.getElementById(g)) ? [c] : [] : 1 !== a.nodeType && 9 !== a.nodeType ? [] : D.call(h && !e ? f ? a.getElementsByClassName(g) : a.getElementsByTagName(b) : a.querySelectorAll(b))
			}, y.contains = function(a, b) {
				return a !== b && a.contains(b)
			}, y.type = a, y.isFunction = b, y.isWindow = c, y.isArray = g, y.isPlainObject = f, y.isEmptyObject = function(a) {
				var b;
				for(b in a) return !1;
				return !0
			}, y.inArray = function(a, b, c) {
				return C.indexOf.call(b, a, c)
			}, y.camelCase = A, y.trim = function(a) {
				return null == a ? "" : String.prototype.trim.call(a)
			}, y.uuid = 0, y.support = {}, y.expr = {}, y.map = function(a, b) {
				var c, d, e, f = [];
				if(h(a))
					for(d = 0; d < a.length; d++) c = b(a[d], d), null != c && f.push(c);
				else
					for(e in a) c = b(a[e], e), null != c && f.push(c);
				return j(f)
			}, y.each = function(a, b) {
				var c, d;
				if(h(a)) {
					for(c = 0; c < a.length; c++)
						if(b.call(a[c], c, a[c]) === !1) return a
				} else
					for(d in a)
						if(b.call(a[d], d, a[d]) === !1) return a;
				return a
			}, y.grep = function(a, b) {
				return E.call(a, b)
			}, window.JSON && (y.parseJSON = JSON.parse), y.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(a, b) {
				V["[object " + b + "]"] = b.toLowerCase()
			}), y.fn = {
				forEach: C.forEach,
				reduce: C.reduce,
				push: C.push,
				sort: C.sort,
				indexOf: C.indexOf,
				concat: C.concat,
				map: function(a) {
					return y(y.map(this, function(b, c) {
						return a.call(b, c, b)
					}))
				},
				slice: function() {
					return y(D.apply(this, arguments))
				},
				ready: function(a) {
					return T.test(F.readyState) && F.body ? a(y) : F.addEventListener("DOMContentLoaded", function() {
						a(y)
					}, !1), this
				},
				get: function(a) {
					return a === w ? D.call(this) : this[a >= 0 ? a : a + this.length]
				},
				toArray: function() {
					return this.get()
				},
				size: function() {
					return this.length
				},
				remove: function() {
					return this.each(function() {
						null != this.parentNode && this.parentNode.removeChild(this)
					})
				},
				each: function(a) {
					return C.every.call(this, function(b, c) {
						return a.call(b, c, b) !== !1
					}), this
				},
				filter: function(a) {
					return b(a) ? this.not(this.not(a)) : y(E.call(this, function(b) {
						return X.matches(b, a)
					}))
				},
				add: function(a, b) {
					return y(B(this.concat(y(a, b))))
				},
				is: function(a) {
					return this.length > 0 && X.matches(this[0], a)
				},
				not: function(a) {
					var c = [];
					if(b(a) && a.call !== w) this.each(function(b) {
						a.call(this, b) || c.push(this)
					});
					else {
						var d = "string" == typeof a ? this.filter(a) : h(a) && b(a.item) ? D.call(a) : y(a);
						this.forEach(function(a) {
							d.indexOf(a) < 0 && c.push(a)
						})
					}
					return y(c)
				},
				has: function(a) {
					return this.filter(function() {
						return e(a) ? y.contains(this, a) : y(this).find(a).size()
					})
				},
				eq: function(a) {
					return -1 === a ? this.slice(a) : this.slice(a, +a + 1)
				},
				first: function() {
					var a = this[0];
					return a && !e(a) ? a : y(a)
				},
				last: function() {
					var a = this[this.length - 1];
					return a && !e(a) ? a : y(a)
				},
				find: function(a) {
					var b, c = this;
					return b = "object" == typeof a ? y(a).filter(function() {
						var a = this;
						return C.some.call(c, function(b) {
							return y.contains(b, a)
						})
					}) : 1 == this.length ? y(X.qsa(this[0], a)) : this.map(function() {
						return X.qsa(this, a)
					})
				},
				closest: function(a, b) {
					var c = this[0],
						e = !1;
					for("object" == typeof a && (e = y(a)); c && !(e ? e.indexOf(c) >= 0 : X.matches(c, a));) c = c !== b && !d(c) && c.parentNode;
					return y(c)
				},
				parents: function(a) {
					for(var b = [], c = this; c.length > 0;) c = y.map(c, function(a) {
						return(a = a.parentNode) && !d(a) && b.indexOf(a) < 0 ? (b.push(a), a) : void 0
					});
					return q(b, a)
				},
				parent: function(a) {
					return q(B(this.pluck("parentNode")), a)
				},
				children: function(a) {
					return q(this.map(function() {
						return o(this)
					}), a)
				},
				contents: function() {
					return this.map(function() {
						return D.call(this.childNodes)
					})
				},
				siblings: function(a) {
					return q(this.map(function(a, b) {
						return E.call(o(b.parentNode), function(a) {
							return a !== b
						})
					}), a)
				},
				empty: function() {
					return this.each(function() {
						this.innerHTML = ""
					})
				},
				pluck: function(a) {
					return y.map(this, function(b) {
						return b[a]
					})
				},
				show: function() {
					return this.each(function() {
						"none" == this.style.display && (this.style.display = ""), "none" == getComputedStyle(this, "").getPropertyValue("display") && (this.style.display = n(this.nodeName))
					})
				},
				replaceWith: function(a) {
					return this.before(a).remove()
				},
				wrap: function(a) {
					var c = b(a);
					if(this[0] && !c) var d = y(a).get(0),
						e = d.parentNode || this.length > 1;
					return this.each(function(b) {
						y(this).wrapAll(c ? a.call(this, b) : e ? d.cloneNode(!0) : d)
					})
				},
				wrapAll: function(a) {
					if(this[0]) {
						y(this[0]).before(a = y(a));
						for(var b;
							(b = a.children()).length;) a = b.first();
						y(a).append(this)
					}
					return this
				},
				wrapInner: function(a) {
					var c = b(a);
					return this.each(function(b) {
						var d = y(this),
							e = d.contents(),
							f = c ? a.call(this, b) : a;
						e.length ? e.wrapAll(f) : d.append(f)
					})
				},
				unwrap: function() {
					return this.parent().each(function() {
						y(this).replaceWith(y(this).children())
					}), this
				},
				clone: function() {
					return this.map(function() {
						return this.cloneNode(!0)
					})
				},
				hide: function() {
					return this.css("display", "none")
				},
				toggle: function(a) {
					return this.each(function() {
						var b = y(this);
						(a === w ? "none" == b.css("display") : a) ? b.show(): b.hide()
					})
				},
				prev: function(a) {
					return y(this.pluck("previousElementSibling")).filter(a || "*")
				},
				next: function(a) {
					return y(this.pluck("nextElementSibling")).filter(a || "*")
				},
				html: function(a) {
					return 0 === arguments.length ? this.length > 0 ? this[0].innerHTML : null : this.each(function(b) {
						var c = this.innerHTML;
						y(this).empty().append(r(this, a, b, c))
					})
				},
				text: function(a) {
					return 0 === arguments.length ? this.length > 0 ? this[0].textContent : null : this.each(function() {
						this.textContent = a === w ? "" : "" + a
					})
				},
				attr: function(a, b) {
					var c;
					return "string" == typeof a && b === w ? 0 == this.length || 1 !== this[0].nodeType ? w : "value" == a && "INPUT" == this[0].nodeName ? this.val() : !(c = this[0].getAttribute(a)) && a in this[0] ? this[0][a] : c : this.each(function(c) {
						if(1 === this.nodeType)
							if(e(a))
								for(x in a) s(this, x, a[x]);
							else s(this, a, r(this, b, c, this.getAttribute(a)))
					})
				},
				removeAttr: function(a) {
					return this.each(function() {
						1 === this.nodeType && s(this, a)
					})
				},
				prop: function(a, b) {
					return a = Z[a] || a, b === w ? this[0] && this[0][a] : this.each(function(c) {
						this[a] = r(this, b, c, this[a])
					})
				},
				data: function(a, b) {
					var c = this.attr("data-" + a.replace(N, "-$1").toLowerCase(), b);
					return null !== c ? u(c) : w
				},
				val: function(a) {
					return 0 === arguments.length ? this[0] && (this[0].multiple ? y(this[0]).find("option").filter(function() {
						return this.selected
					}).pluck("value") : this[0].value) : this.each(function(b) {
						this.value = r(this, a, b, this.value)
					})
				},
				offset: function(a) {
					if(a) return this.each(function(b) {
						var c = y(this),
							d = r(this, a, b, c.offset()),
							e = c.offsetParent().offset(),
							f = {
								top: d.top - e.top,
								left: d.left - e.left
							};
						"static" == c.css("position") && (f.position = "relative"), c.css(f)
					});
					if(0 == this.length) return null;
					var b = this[0].getBoundingClientRect();
					return {
						left: b.left + window.pageXOffset,
						top: b.top + window.pageYOffset,
						width: Math.round(b.width),
						height: Math.round(b.height)
					}
				},
				css: function(b, c) {
					if(arguments.length < 2) {
						var d = this[0],
							e = getComputedStyle(d, "");
						if(!d) return;
						if("string" == typeof b) return d.style[A(b)] || e.getPropertyValue(b);
						if(g(b)) {
							var f = {};
							return y.each(g(b) ? b : [b], function(a, b) {
								f[b] = d.style[A(b)] || e.getPropertyValue(b)
							}), f
						}
					}
					var h = "";
					if("string" == a(b)) c || 0 === c ? h = k(b) + ":" + m(b, c) : this.each(function() {
						this.style.removeProperty(k(b))
					});
					else
						for(x in b) b[x] || 0 === b[x] ? h += k(x) + ":" + m(x, b[x]) + ";" : this.each(function() {
							this.style.removeProperty(k(x))
						});
					return this.each(function() {
						this.style.cssText += ";" + h
					})
				},
				index: function(a) {
					return a ? this.indexOf(y(a)[0]) : this.parent().children().indexOf(this[0])
				},
				hasClass: function(a) {
					return a ? C.some.call(this, function(a) {
						return this.test(t(a))
					}, l(a)) : !1
				},
				addClass: function(a) {
					return a ? this.each(function(b) {
						z = [];
						var c = t(this),
							d = r(this, a, b, c);
						d.split(/\s+/g).forEach(function(a) {
							y(this).hasClass(a) || z.push(a)
						}, this), z.length && t(this, c + (c ? " " : "") + z.join(" "))
					}) : this
				},
				removeClass: function(a) {
					return this.each(function(b) {
						return a === w ? t(this, "") : (z = t(this), r(this, a, b, z).split(/\s+/g).forEach(function(a) {
							z = z.replace(l(a), " ")
						}), void t(this, z.trim()))
					})
				},
				toggleClass: function(a, b) {
					return a ? this.each(function(c) {
						var d = y(this),
							e = r(this, a, c, t(this));
						e.split(/\s+/g).forEach(function(a) {
							(b === w ? !d.hasClass(a) : b) ? d.addClass(a): d.removeClass(a)
						})
					}) : this
				},
				scrollTop: function(a) {
					if(this.length) {
						var b = "scrollTop" in this[0];
						return a === w ? b ? this[0].scrollTop : this[0].pageYOffset : this.each(b ? function() {
							this.scrollTop = a
						} : function() {
							this.scrollTo(this.scrollX, a)
						})
					}
				},
				scrollLeft: function(a) {
					if(this.length) {
						var b = "scrollLeft" in this[0];
						return a === w ? b ? this[0].scrollLeft : this[0].pageXOffset : this.each(b ? function() {
							this.scrollLeft = a
						} : function() {
							this.scrollTo(a, this.scrollY)
						})
					}
				},
				position: function() {
					if(this.length) {
						var a = this[0],
							b = this.offsetParent(),
							c = this.offset(),
							d = M.test(b[0].nodeName) ? {
								top: 0,
								left: 0
							} : b.offset();
						return c.top -= parseFloat(y(a).css("margin-top")) || 0, c.left -= parseFloat(y(a).css("margin-left")) || 0, d.top += parseFloat(y(b[0]).css("border-top-width")) || 0, d.left += parseFloat(y(b[0]).css("border-left-width")) || 0, {
							top: c.top - d.top,
							left: c.left - d.left
						}
					}
				},
				offsetParent: function() {
					return this.map(function() {
						for(var a = this.offsetParent || F.body; a && !M.test(a.nodeName) && "static" == y(a).css("position");) a = a.offsetParent;
						return a
					})
				}
			}, y.fn.detach = y.fn.remove, ["width", "height"].forEach(function(a) {
				var b = a.replace(/./, function(a) {
					return a[0].toUpperCase()
				});
				y.fn[a] = function(e) {
					var f, g = this[0];
					return e === w ? c(g) ? g["inner" + b] : d(g) ? g.documentElement["scroll" + b] : (f = this.offset()) && f[a] : this.each(function(b) {
						g = y(this), g.css(a, r(this, e, b, g[a]()))
					})
				}
			}), P.forEach(function(b, c) {
				var d = c % 2;
				y.fn[b] = function() {
					var b, e, f = y.map(arguments, function(c) {
							return b = a(c), "object" == b || "array" == b || null == c ? c : X.fragment(c)
						}),
						g = this.length > 1;
					return f.length < 1 ? this : this.each(function(a, b) {
						e = d ? b : b.parentNode, b = 0 == c ? b.nextSibling : 1 == c ? b.firstChild : 2 == c ? b : null, f.forEach(function(a) {
							if(g) a = a.cloneNode(!0);
							else if(!e) return y(a).remove();
							v(e.insertBefore(a, b), function(a) {
								null == a.nodeName || "SCRIPT" !== a.nodeName.toUpperCase() || a.type && "text/javascript" !== a.type || a.src || window.eval.call(window, a.innerHTML)
							})
						})
					})
				}, y.fn[d ? b + "To" : "insert" + (c ? "Before" : "After")] = function(a) {
					return y(a)[b](this), this
				}
			}), X.Z.prototype = y.fn, X.uniq = B, X.deserializeValue = u, y.zepto = X, y
		}();
		window.Zepto = Zepto, 
		void 0 === window.$ && (window.$ = Zepto),
			function(a) {
				function b(a) {
					return a._zid || (a._zid = m++)
				}
		
				function c(a, c, f, g) {
					if(c = d(c), c.ns) var h = e(c.ns);
					return(q[b(a)] || []).filter(function(a) {
						return a && (!c.e || a.e == c.e) && (!c.ns || h.test(a.ns)) && (!f || b(a.fn) === b(f)) && (!g || a.sel == g)
					})
				}
		
				function d(a) {
					var b = ("" + a).split(".");
					return {
						e: b[0],
						ns: b.slice(1).sort().join(" ")
					}
				}
		
				function e(a) {
					return new RegExp("(?:^| )" + a.replace(" ", " .* ?") + "(?: |$)")
				}
		
				function f(a, b) {
					return a.del && !s && a.e in t || !!b
				}
		
				function g(a) {
					return u[a] || s && t[a] || a
				}
		
				function h(c, e, h, i, k, m, n) {
					var o = b(c),
						p = q[o] || (q[o] = []);
					e.split(/\s/).forEach(function(b) {
						if("ready" == b) return a(document).ready(h);
						var e = d(b);
						e.fn = h, e.sel = k, e.e in u && (h = function(b) {
							var c = b.relatedTarget;
							return !c || c !== this && !a.contains(this, c) ? e.fn.apply(this, arguments) : void 0
						}), e.del = m;
						var o = m || h;
						e.proxy = function(a) {
							if(a = j(a), !a.isImmediatePropagationStopped()) {
								a.data = i;
								var b = o.apply(c, a._args == l ? [a] : [a].concat(a._args));
								return b === !1 && (a.preventDefault(), a.stopPropagation()), b
							}
						}, e.i = p.length, p.push(e), "addEventListener" in c && c.addEventListener(g(e.e), e.proxy, f(e, n))
					})
				}
		
				function i(a, d, e, h, i) {
					var j = b(a);
					(d || "").split(/\s/).forEach(function(b) {
						c(a, b, e, h).forEach(function(b) {
							delete q[j][b.i], "removeEventListener" in a && a.removeEventListener(g(b.e), b.proxy, f(b, i))
						})
					})
				}
		
				function j(b, c) {
					return(c || !b.isDefaultPrevented) && (c || (c = b), a.each(y, function(a, d) {
						var e = c[a];
						b[a] = function() {
							return this[d] = v, e && e.apply(c, arguments)
						}, b[d] = w
					}), (c.defaultPrevented !== l ? c.defaultPrevented : "returnValue" in c ? c.returnValue === !1 : c.getPreventDefault && c.getPreventDefault()) && (b.isDefaultPrevented = v)), b
				}
		
				function k(a) {
					var b, c = {
						originalEvent: a
					};
					for(b in a) x.test(b) || a[b] === l || (c[b] = a[b]);
					return j(c, a)
				}
				var l, m = (a.zepto.qsa, 1),
					n = Array.prototype.slice,
					o = a.isFunction,
					p = function(a) {
						return "string" == typeof a
					},
					q = {},
					r = {},
					s = "onfocusin" in window,
					t = {
						focus: "focusin",
						blur: "focusout"
					},
					u = {
						mouseenter: "mouseover",
						mouseleave: "mouseout"
					};
				r.click = r.mousedown = r.mouseup = r.mousemove = "MouseEvents", a.event = {
					add: h,
					remove: i
				}, a.proxy = function(c, d) {
					if(o(c)) {
						var e = function() {
							return c.apply(d, arguments)
						};
						return e._zid = b(c), e
					}
					if(p(d)) return a.proxy(c[d], c);
					throw new TypeError("expected function")
				}, a.fn.bind = function(a, b, c) {
					return this.on(a, b, c)
				}, a.fn.unbind = function(a, b) {
					return this.off(a, b)
				}, a.fn.one = function(a, b, c, d) {
					return this.on(a, b, c, d, 1)
				};
				var v = function() {
						return !0
					},
					w = function() {
						return !1
					},
					x = /^([A-Z]|returnValue$|layer[XY]$)/,
					y = {
						preventDefault: "isDefaultPrevented",
						stopImmediatePropagation: "isImmediatePropagationStopped",
						stopPropagation: "isPropagationStopped"
					};
				a.fn.delegate = function(a, b, c) {
					return this.on(b, a, c)
				}, a.fn.undelegate = function(a, b, c) {
					return this.off(b, a, c)
				}, a.fn.live = function(b, c) {
					return a(document.body).delegate(this.selector, b, c), this
				}, a.fn.die = function(b, c) {
					return a(document.body).undelegate(this.selector, b, c), this
				}, a.fn.on = function(b, c, d, e, f) {
					var g, j, m = this;
					return b && !p(b) ? (a.each(b, function(a, b) {
						m.on(a, c, d, b, f)
					}), m) : (p(c) || o(e) || e === !1 || (e = d, d = c, c = l), (o(d) || d === !1) && (e = d, d = l), e === !1 && (e = w), m.each(function(l, m) {
						f && (g = function(a) {
							return i(m, a.type, e), e.apply(this, arguments)
						}), c && (j = function(b) {
							var d, f = a(b.target).closest(c, m).get(0);
							return f && f !== m ? (d = a.extend(k(b), {
								currentTarget: f,
								liveFired: m
							}), (g || e).apply(f, [d].concat(n.call(arguments, 1)))) : void 0
						}), h(m, b, e, d, c, j || g)
					}))
				}, a.fn.off = function(b, c, d) {
					var e = this;
					return b && !p(b) ? (a.each(b, function(a, b) {
						e.off(a, c, b)
					}), e) : (p(c) || o(d) || d === !1 || (d = c, c = l), d === !1 && (d = w), e.each(function() {
						i(this, b, d, c)
					}))
				}, a.fn.trigger = function(b, c) {
					return b = p(b) || a.isPlainObject(b) ? a.Event(b) : j(b), b._args = c, this.each(function() {
						"dispatchEvent" in this ? this.dispatchEvent(b) : a(this).triggerHandler(b, c)
					})
				}, a.fn.triggerHandler = function(b, d) {
					var e, f;
					return this.each(function(g, h) {
						e = k(p(b) ? a.Event(b) : b), e._args = d, e.target = h, a.each(c(h, b.type || b), function(a, b) {
							return f = b.proxy(e), e.isImmediatePropagationStopped() ? !1 : void 0
						})
					}), f
				}, "focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select keydown keypress keyup error".split(" ").forEach(function(b) {
					a.fn[b] = function(a) {
						return a ? this.bind(b, a) : this.trigger(b)
					}
				}), ["focus", "blur"].forEach(function(b) {
					a.fn[b] = function(a) {
						return a ? this.bind(b, a) : this.each(function() {
							try {
								this[b]()
							} catch(a) {}
						}), this
					}
				}), a.Event = function(a, b) {
					p(a) || (b = a, a = b.type);
					var c = document.createEvent(r[a] || "Events"),
						d = !0;
					if(b)
						for(var e in b) "bubbles" == e ? d = !!b[e] : c[e] = b[e];
					return c.initEvent(a, d, !0), j(c)
				}
			}(Zepto),
			function(a) {
				function b(b, c, d) {
					var e = a.Event(c);
					return a(b).trigger(e, d), !e.isDefaultPrevented()
				}
		
				function c(a, c, d, e) {
					return a.global ? b(c || s, d, e) : void 0
				}
		
				function d(b) {
					b.global && 0 === a.active++ && c(b, null, "ajaxStart")
				}
		
				function e(b) {
					b.global && !--a.active && c(b, null, "ajaxStop")
				}
		
				function f(a, b) {
					var d = b.context;
					return b.beforeSend.call(d, a, b) === !1 || c(b, d, "ajaxBeforeSend", [a, b]) === !1 ? !1 : void c(b, d, "ajaxSend", [a, b])
				}
		
				function g(a, b, d, e) {
					var f = d.context,
						g = "success";
					d.success.call(f, a, g, b), e && e.resolveWith(f, [a, g, b]), c(d, f, "ajaxSuccess", [b, d, a]), i(g, b, d)
				}
		
				function h(a, b, d, e, f) {
					var g = e.context;
					e.error.call(g, d, b, a), f && f.rejectWith(g, [d, b, a]), c(e, g, "ajaxError", [d, e, a || b]), i(b, d, e)
				}
		
				function i(a, b, d) {
					var f = d.context;
					d.complete.call(f, b, a), c(d, f, "ajaxComplete", [b, d]), e(d)
				}
		
				function j() {}
		
				function k(a) {
					return a && (a = a.split(";", 2)[0]), a && (a == x ? "html" : a == w ? "json" : u.test(a) ? "script" : v.test(a) && "xml") || "text"
				}
		
				function l(a, b) {
					return "" == b ? a : (a + "&" + b).replace(/[&?]{1,2}/, "?")
				}
		
				function m(b) {
					b.processData && b.data && "string" != a.type(b.data) && (b.data = a.param(b.data, b.traditional)), !b.data || b.type && "GET" != b.type.toUpperCase() || (b.url = l(b.url, b.data), b.data = void 0)
				}
		
				function n(b, c, d, e) {
					var f = !a.isFunction(c);
					return {
						url: b,
						data: f ? c : void 0,
						success: f ? a.isFunction(d) ? d : void 0 : c,
						dataType: f ? e || d : d
					}
				}
		
				function o(b, c, d, e) {
					var f, g = a.isArray(c),
						h = a.isPlainObject(c);
					a.each(c, function(c, i) {
						f = a.type(i), e && (c = d ? e : e + "[" + (h || "object" == f || "array" == f ? c : "") + "]"), !e && g ? b.add(i.name, i.value) : "array" == f || !d && "object" == f ? o(b, i, d, c) : b.add(c, i)
					})
				}
				var p, q, r = 0,
					s = window.document,
					t = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
					u = /^(?:text|application)\/javascript/i,
					v = /^(?:text|application)\/xml/i,
					w = "application/json",
					x = "text/html",
					y = /^\s*$/;
				a.active = 0, a.ajaxJSONP = function(b, c) {
					if(!("type" in b)) return a.ajax(b);
					var d, e, i = b.jsonpCallback,
						j = (a.isFunction(i) ? i() : i) || "jsonp" + ++r,
						k = s.createElement("script"),
						l = window[j],
						m = function(b) {
							a(k).triggerHandler("error", b || "abort")
						},
						n = {
							abort: m
						};
					return c && c.promise(n), a(k).on("load error", function(f, i) {
						clearTimeout(e), a(k).off().remove(), "error" != f.type && d ? g(d[0], n, b, c) : h(null, i || "error", n, b, c), window[j] = l, d && a.isFunction(l) && l(d[0]), l = d = void 0
					}), f(n, b) === !1 ? (m("abort"), n) : (window[j] = function() {
						d = arguments
					}, k.src = b.url.replace(/=\?/, "=" + j), s.head.appendChild(k), b.timeout > 0 && (e = setTimeout(function() {
						m("timeout")
					}, b.timeout)), n)
				}, a.ajaxSettings = {
					type: "GET",
					beforeSend: j,
					success: j,
					error: j,
					complete: j,
					context: null,
					global: !0,
					xhr: function() {
						return new window.XMLHttpRequest
					},
					accepts: {
						script: "text/javascript, application/javascript, application/x-javascript",
						json: w,
						xml: "application/xml, text/xml",
						html: x,
						text: "text/plain"
					},
					crossDomain: !1,
					timeout: 0,
					processData: !0,
					cache: !0
				}, a.ajax = function(b) {
					var c = a.extend({}, b || {}),
						e = a.Deferred && a.Deferred();
					for(p in a.ajaxSettings) void 0 === c[p] && (c[p] = a.ajaxSettings[p]);
					d(c), c.crossDomain || (c.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(c.url) && RegExp.$2 != window.location.host), c.url || (c.url = window.location.toString()), m(c), c.cache === !1 && (c.url = l(c.url, "_=" + Date.now()));
					var i = c.dataType,
						n = /=\?/.test(c.url);
					if("jsonp" == i || n) return n || (c.url = l(c.url, c.jsonp ? c.jsonp + "=?" : c.jsonp === !1 ? "" : "callback=?")), a.ajaxJSONP(c, e);
					var o, r = c.accepts[i],
						s = {},
						t = function(a, b) {
							s[a.toLowerCase()] = [a, b]
						},
						u = /^([\w-]+:)\/\//.test(c.url) ? RegExp.$1 : window.location.protocol,
						v = c.xhr(),
						w = v.setRequestHeader;
					if(e && e.promise(v), c.crossDomain || t("X-Requested-With", "XMLHttpRequest"), t("Accept", r || "*/*"), (r = c.mimeType || r) && (r.indexOf(",") > -1 && (r = r.split(",", 2)[0]), v.overrideMimeType && v.overrideMimeType(r)), (c.contentType || c.contentType !== !1 && c.data && "GET" != c.type.toUpperCase()) && t("Content-Type", c.contentType || "application/x-www-form-urlencoded"), c.headers)
						for(q in c.headers) t(q, c.headers[q]);
					if(v.setRequestHeader = t, v.onreadystatechange = function() {
							if(4 == v.readyState) {
								v.onreadystatechange = j, clearTimeout(o);
								var b, d = !1;
								if(v.status >= 200 && v.status < 300 || 304 == v.status || 0 == v.status && "file:" == u) {
									i = i || k(c.mimeType || v.getResponseHeader("content-type")), b = v.responseText;
									try {
										"script" == i ? (1, eval)(b) : "xml" == i ? b = v.responseXML : "json" == i && (b = y.test(b) ? null : a.parseJSON(b))
									} catch(f) {
										d = f
									}
									d ? h(d, "parsererror", v, c, e) : g(b, v, c, e)
								} else h(v.statusText || null, v.status ? "error" : "abort", v, c, e)
							}
						}, f(v, c) === !1) return v.abort(), h(null, "abort", v, c, e), v;
					if(c.xhrFields)
						for(q in c.xhrFields) v[q] = c.xhrFields[q];
					var x = "async" in c ? c.async : !0;
					v.open(c.type, c.url, x, c.username, c.password);
					for(q in s) w.apply(v, s[q]);
					return c.timeout > 0 && (o = setTimeout(function() {
						v.onreadystatechange = j, v.abort(), h(null, "timeout", v, c, e)
					}, c.timeout)), v.send(c.data ? c.data : null), v
				}, a.get = function(b, c, d, e) {
					return a.ajax(n.apply(null, arguments))
				}, a.post = function(b, c, d, e) {
					var f = n.apply(null, arguments);
					return f.type = "POST", a.ajax(f)
				}, a.getJSON = function(b, c, d) {
					var e = n.apply(null, arguments);
					return e.dataType = "json", a.ajax(e)
				}, a.fn.load = function(b, c, d) {
					if(!this.length) return this;
					var e, f = this,
						g = b.split(/\s/),
						h = n(b, c, d),
						i = h.success;
					return g.length > 1 && (h.url = g[0], e = g[1]), h.success = function(b) {
						f.html(e ? a("<div>").html(b.replace(t, "")).find(e) : b), i && i.apply(f, arguments)
					}, a.ajax(h), this
				};
				var z = encodeURIComponent;
				a.param = function(a, b) {
					var c = [];
					return c.add = function(a, b) {
						this.push(z(a) + "=" + z(b))
					}, o(c, a, b), c.join("&").replace(/%20/g, "+")
				}
			}(Zepto),
			function(a) {
				a.fn.serializeArray = function() {
					var b, c = [];
					return a([].slice.call(this.get(0).elements)).each(function() {
						b = a(this);
						var d = b.attr("type");
						"fieldset" != this.nodeName.toLowerCase() && !this.disabled && "submit" != d && "reset" != d && "button" != d && ("radio" != d && "checkbox" != d || this.checked) && c.push({
							name: b.attr("name"),
							value: b.val()
						})
					}), c
				}, a.fn.serialize = function() {
					var a = [];
					return this.serializeArray().forEach(function(b) {
						a.push(encodeURIComponent(b.name) + "=" + encodeURIComponent(b.value))
					}), a.join("&")
				}, a.fn.submit = function(b) {
					if(b) this.bind("submit", b);
					else if(this.length) {
						var c = a.Event("submit");
						this.eq(0).trigger(c), c.isDefaultPrevented() || this.get(0).submit()
					}
					return this
				}
			}(Zepto),
			function(a) {
				"__proto__" in {} || a.extend(a.zepto, {
					Z: function(b, c) {
						return b = b || [], a.extend(b, a.fn), b.selector = c || "", b.__Z = !0, b
					},
					isZ: function(b) {
						return "array" === a.type(b) && "__Z" in b
					}
				});
				try {
					getComputedStyle(void 0)
				} catch(b) {
					var c = getComputedStyle;
					window.getComputedStyle = function(a) {
						try {
							return c(a)
						} catch(b) {
							return null
						}
					}
				}
			}(Zepto),
			function(a, b) {
				function c(a) {
					return a.replace(/([a-z])([A-Z])/, "$1-$2").toLowerCase()
				}
		
				function d(a) {
					return e ? e + a : a.toLowerCase()
				}
				var e, f, g, h, i, j, k, l, m, n, o = "",
					p = {
						Webkit: "webkit",
						Moz: "",
						O: "o"
					},
					q = window.document,
					r = q.createElement("div"),
					s = /^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i,
					t = {};
				a.each(p, function(a, c) {
					return r.style[a + "TransitionProperty"] !== b ? (o = "-" + a.toLowerCase() + "-", e = c, !1) : void 0
				}), f = o + "transform", t[g = o + "transition-property"] = t[h = o + "transition-duration"] = t[j = o + "transition-delay"] = t[i = o + "transition-timing-function"] = t[k = o + "animation-name"] = t[l = o + "animation-duration"] = t[n = o + "animation-delay"] = t[m = o + "animation-timing-function"] = "", a.fx = {
					off: e === b && r.style.transitionProperty === b,
					speeds: {
						_default: 400,
						fast: 200,
						slow: 600
					},
					cssPrefix: o,
					transitionEnd: d("TransitionEnd"),
					animationEnd: d("AnimationEnd")
				}, a.fn.animate = function(c, d, e, f, g) {
					return a.isFunction(d) && (f = d, e = b, d = b), a.isFunction(e) && (f = e, e = b), a.isPlainObject(d) && (e = d.easing, f = d.complete, g = d.delay, d = d.duration), d && (d = ("number" == typeof d ? d : a.fx.speeds[d] || a.fx.speeds._default) / 1e3), g && (g = parseFloat(g) / 1e3), this.anim(c, d, e, f, g)
				}, a.fn.anim = function(d, e, o, p, q) {
					var r, u, v, w = {},
						x = "",
						y = this,
						z = a.fx.transitionEnd,
						A = !1;
					if(e === b && (e = a.fx.speeds._default / 1e3), q === b && (q = 0), a.fx.off && (e = 0), "string" == typeof d) w[k] = d, w[l] = e + "s", w[n] = q + "s", w[m] = o || "linear", z = a.fx.animationEnd;
					else {
						u = [];
						for(r in d) s.test(r) ? x += r + "(" + d[r] + ") " : (w[r] = d[r], u.push(c(r)));
						x && (w[f] = x, u.push(f)), e > 0 && "object" == typeof d && (w[g] = u.join(", "), w[h] = e + "s", w[j] = q + "s", w[i] = o || "linear")
					}
					return v = function(b) {
						if("undefined" != typeof b) {
							if(b.target !== b.currentTarget) return;
							a(b.target).unbind(z, v)
						} else a(this).unbind(z, v);
						A = !0, a(this).css(t), p && p.call(this)
					}, e > 0 && (this.bind(z, v), setTimeout(function() {
						A || v.call(y)
					}, 1e3 * e + 25)), this.size() && this.get(0).clientLeft, this.css(w), 0 >= e && setTimeout(function() {
						y.each(function() {
							v.call(this)
						})
					}, 0), this
				}, r = null
			}(Zepto),
			function(a, b) {
				function c(c, d, e, f, g) {
					"function" != typeof d || g || (g = d, d = b);
					var h = {
						opacity: e
					};
					return f && (h.scale = f, c.css(a.fx.cssPrefix + "transform-origin", "0 0")), c.animate(h, d, null, g)
				}
		
				function d(b, d, e, f) {
					return c(b, d, 0, e, function() {
						g.call(a(this)), f && f.call(this)
					})
				}
				var e = window.document,
					f = (e.documentElement, a.fn.show),
					g = a.fn.hide,
					h = a.fn.toggle;
				a.fn.show = function(a, d) {
					return f.call(this), a === b ? a = 0 : this.css("opacity", 0), c(this, a, 1, "1,1", d)
				}, a.fn.hide = function(a, c) {
					return a === b ? g.call(this) : d(this, a, "0,0", c)
				}, a.fn.toggle = function(c, d) {
					return c === b || "boolean" == typeof c ? h.call(this, c) : this.each(function() {
						var b = a(this);
						b["none" == b.css("display") ? "show" : "hide"](c, d)
					})
				}, a.fn.fadeTo = function(a, b, d) {
					return c(this, a, b, null, d)
				}, a.fn.fadeIn = function(a, b) {
					var c = this.css("opacity");
					return c > 0 ? this.css("opacity", 0) : c = 1, f.call(this).fadeTo(a, c, b)
				}, a.fn.fadeOut = function(a, b) {
					return d(this, a, null, b)
				}, a.fn.fadeToggle = function(b, c) {
					return this.each(function() {
						var d = a(this);
						d[0 == d.css("opacity") || "none" == d.css("display") ? "fadeIn" : "fadeOut"](b, c)
					})
				}
			}(Zepto),
			function(a) {
				function b(b, d) {
					var i = b[h],
						j = i && e[i];
					if(void 0 === d) return j || c(b);
					if(j) {
						if(d in j) return j[d];
						var k = g(d);
						if(k in j) return j[k]
					}
					return f.call(a(b), d)
				}
		
				function c(b, c, f) {
					var i = b[h] || (b[h] = ++a.uuid),
						j = e[i] || (e[i] = d(b));
					return void 0 !== c && (j[g(c)] = f), j
				}
		
				function d(b) {
					var c = {};
					return a.each(b.attributes || i, function(b, d) {
						0 == d.name.indexOf("data-") && (c[g(d.name.replace("data-", ""))] = a.zepto.deserializeValue(d.value))
					}), c
				}
				var e = {},
					f = a.fn.data,
					g = a.camelCase,
					h = a.expando = "Zepto" + +new Date,
					i = [];
				a.fn.data = function(d, e) {
					return void 0 === e ? a.isPlainObject(d) ? this.each(function(b, e) {
						a.each(d, function(a, b) {
							c(e, a, b)
						})
					}) : 0 == this.length ? void 0 : b(this[0], d) : this.each(function() {
						c(this, d, e)
					})
				}, a.fn.removeData = function(b) {
					return "string" == typeof b && (b = b.split(/\s+/)), this.each(function() {
						var c = this[h],
							d = c && e[c];
						d && a.each(b || d, function(a) {
							delete d[b ? g(this) : a]
						})
					})
				}, ["remove", "empty"].forEach(function(b) {
					var c = a.fn[b];
					a.fn[b] = function() {
						var a = this.find("*");
						return "remove" === b && (a = a.add(this)), a.removeData(), c.call(this)
					}
				})
			}(Zepto),
			function(a) {
				function b(a, b, c, d) {
					return Math.abs(a - b) >= Math.abs(c - d) ? a - b > 0 ? "Left" : "Right" : c - d > 0 ? "Up" : "Down"
				}
		
				function c() {
					k = null, m.last && (m.el.trigger("longTap"), m = {})
				}
		
				function d() {
					k && clearTimeout(k), k = null
				}
		
				function e() {
					h && clearTimeout(h), i && clearTimeout(i), j && clearTimeout(j), k && clearTimeout(k), h = i = j = k = null, m = {}
				}
		
				function f(a) {
					return("touch" == a.pointerType || a.pointerType == a.MSPOINTER_TYPE_TOUCH) && a.isPrimary
				}
		
				function g(a, b) {
					return a.type == "pointer" + b || a.type.toLowerCase() == "mspointer" + b
				}
				var h, i, j, k, l, m = {},
					n = 750;
				a(document).ready(function() {
					var o, p, q, r, s = 0,
						t = 0;
					"MSGesture" in window && (l = new MSGesture, l.target = document.body), a(document).bind("MSGestureEnd", function(a) {
						var b = a.velocityX > 1 ? "Right" : a.velocityX < -1 ? "Left" : a.velocityY > 1 ? "Down" : a.velocityY < -1 ? "Up" : null;
						b && (m.el.trigger("swipe"), m.el.trigger("swipe" + b))
					}).on("touchstart", function(b) {
						(!(r = g(b, "down")) || f(b)) && (q = r ? b : b.touches[0], b.touches && 1 === b.touches.length && m.x2 && (m.x2 = void 0, m.y2 = void 0), o = Date.now(), p = o - (m.last || o), m.el = a("tagName" in q.target ? q.target : q.target.parentNode), h && clearTimeout(h), m.x1 = q.pageX, m.y1 = q.pageY, p > 0 && 250 >= p && (m.isDoubleTap = !0), m.last = o, k = setTimeout(c, n), l && r && l.addPointer(b.pointerId))
					}).on("touchmove", function(a) {
						(!(r = g(a, "move")) || f(a)) && (q = r ? a : a.touches[0], d(), m.x2 = q.pageX, m.y2 = q.pageY, s += Math.abs(m.x1 - m.x2), t += Math.abs(m.y1 - m.y2))
					}).on("touchend", function(c) {
						(!(r = g(c, "up")) || f(c)) && (d(), m.x2 && Math.abs(m.x1 - m.x2) > 30 || m.y2 && Math.abs(m.y1 - m.y2) > 30 ? j = setTimeout(function() {
							m.el.trigger("swipe"), m.el.trigger("swipe" + b(m.x1, m.x2, m.y1, m.y2)), m = {}
						}, 0) : "last" in m && (30 > s && 30 > t ? i = setTimeout(function() {
							var b = a.Event("tap");
							b.cancelTouch = e, m.el.trigger(b), m.isDoubleTap ? (m.el && m.el.trigger("doubleTap"), m = {}) : h = setTimeout(function() {
								h = null, m.el && m.el.trigger("singleTap"), m = {}
							}, 250)
						}, 0) : m = {}), s = t = 0)
					}).on("touchcancel MSPointerCancel pointercancel", e), a(window).on("scroll", e)
				}), ["swipe", "swipeLeft", "swipeRight", "swipeUp", "swipeDown", "doubleTap", "tap", "singleTap", "longTap"].forEach(function(b) {
					a.fn[b] = function(a) {
						return this.on(b, a)
					}
				})
			}(Zepto),
			function(a) {
				a.fn.slideDown = function(b, c) {
					c = c || a.noop;
					var d = this.css("position");
					this.show(), this.css({
						position: "absolute",
						visibility: "hidden"
					});
					var e = this.css("margin-top"),
						f = this.css("margin-bottom"),
						g = this.css("padding-top"),
						h = this.css("padding-bottom"),
						i = this.css("height");
					this.css({
						position: d,
						visibility: "visible",
						overflow: "hidden",
						height: 0,
						marginTop: 0,
						marginBottom: 0,
						paddingTop: 0,
						paddingBottom: 0
					});
					var j = this;
					setTimeout(function() {
						j.animate({
							height: i,
							marginTop: e,
							marginBottom: f,
							paddingTop: g,
							paddingBottom: h
						}, {
							duration: b,
							complete: c
						})
					}, 5)
				}, a.fn.slideUp = function(b, c) {
					if(c = c || a.noop, this.height() > 0) {
						var d = this,
							e = (d.css("position"), d.css("height")),
							f = d.css("margin-top"),
							g = d.css("margin-bottom"),
							h = d.css("padding-top"),
							i = d.css("padding-bottom");
						this.css({
							visibility: "visible",
							overflow: "hidden",
							height: e,
							marginTop: f,
							marginBottom: g,
							paddingTop: h,
							paddingBottom: i
						}), d.animate({
							height: 0,
							marginTop: 0,
							marginBottom: 0,
							paddingTop: 0,
							paddingBottom: 0
						}, {
							duration: b,
							queue: !1,
							complete: function() {
								d.hide(), d.css({
									visibility: "visible",
									overflow: "hidden",
									height: e,
									marginTop: f,
									marginBottom: g,
									paddingTop: h,
									paddingBottom: i
								}), c()
							}
						})
					}
				}, a.fn.slideToggle = function(b, c) {
					c = c || a.noop, 0 == this.height() ? this.slideDown(b, c) : this.slideUp(b, c)
				}
			}(Zepto), Zepto.noop = function() {},
			function(a) {
				function b(a) {
					var b, d;
					b = "undefined" != typeof a.touches[0].pageX ? a.touches[0].pageX : a.pageX, d = "undefined" != typeof a.touches[0].pageY ? a.touches[0].pageY : a.pageY,
						l = m, l.start = {
							x: b,
							y: d,
							time: a.timeStamp
						}, l.delta.prevPos = {
							x: b,
							y: d
						}, c(a), r && k()
				}
		
				function c(a) {
					var b, c;
					b = "undefined" != typeof a.touches[0].pageX ? a.touches[0].pageX : a.pageX, c = "undefined" != typeof a.touches[0].pageY ? a.touches[0].pageY : a.pageY;
					var d, e, f = b,
						g = c,
						h = b - l.start.x,
						i = c - l.start.y;
					d = b > l.delta.prevPos.x ? 1 : b < l.delta.prevPos.x ? -1 : 0, e = c > l.delta.prevPos.y ? 1 : c < l.delta.prevPos.y ? -1 : 0, l.delta.prevPos = {
						x: f,
						y: g
					}, l.delta.dist = {
						x: h,
						y: i
					}, l.delta.dir = {
						x: d,
						y: e
					}, r && k()
				}
		
				function d(b) {
					var c = a(this),
						d = c.data("preventDefaultAxis"),
						e = "both" === d || "x" === d,
						f = "both" === d || "y" === d,
						g = e && Math.abs(l.delta.dist.y) >= q,
						h = f && Math.abs(l.delta.dist.x) >= q;
					(g || h) && b.preventDefault()
				}
		
				function e(a) {
					var b = a.timeStamp - l.start.time,
						c = Math.abs(Math.round(l.delta.dist.x / b * 100) / 100),
						d = Math.abs(Math.round(l.delta.dist.y / b * 100) / 100),
						e = l.delta.dir.x,
						f = l.delta.dir.y,
						g = 0,
						h = 0;
					c > p ? g = Math.abs(l.delta.dist.x) >= q ? e : 0 : d > p && (h = Math.abs(l.delta.dist.y) >= q ? f : 0), l.end.duration = b, l.end.speed = {
						x: c,
						y: d
					}, l.end.flick = {
						x: g,
						y: h
					}, r && (j("Touch end"), k())
				}
		
				function f(a, b) {
					return "x" !== b && "y" !== b && (b = a.height() > a.width() ? "y" : "x"), b
				}
		
				function g(a, b) {
					if(!parseInt(b)) {
						var b, c = a.data("segments"),
							d = f(a, a.data("flickDirection"));
						b = "y" == d ? a.height() / c : a.width() / c
					}
					return b
				}
		
				function h(a) {
					var b = document.createElement("div"),
						c = "Khtml Ms O Moz Webkit".split(" "),
						d = c.length;
					return function(a) {
						if(a in b.style) return !0;
						for(a = a.replace(/^[a-z]/, function(a) {
								return a.toUpperCase()
							}); d--;)
							if(c[d] + a in b.style) return !0;
						return !1
					}
				}
		
				function i() {
					if(!a("#flickableDebugger").length) {
						r = !0, l = m, l.eventLog = [];
						var b = '<div id="flickableDebugger" style="position: fixed; bottom: 0; margin: 0 auto; padding: 10px; width: 100%; background: #000; color: #fff; font-family: courier, sans-serif;">Debugger</div>';
						a("body").append(b)
					}
				}
		
				function j(a) {
					r && (console.log(a), l.eventLog.splice(0, 0, a), k())
				}
		
				function k() {
					for(var b = "", c = 0; 3 > c; c++) b += l.eventLog[c] + " | ";
					var d = "<pre> 		last 3 events: " + b + "<br /> 		start: {x:" + l.start.x + ", y:" + l.start.y + ",time: " + l.start.time + "}<br /> 			delta: {<br /> 			prevPos: {" + l.delta.prevPos.x + ", " + l.delta.prevPos.y + "}<br /> 			dist: {" + l.delta.dist.x + ", " + l.delta.dist.y + "}<br /> 			dir: {" + l.delta.dir.x + ", " + l.delta.dir.y + "}<br /> 			}<br /> 		end: {<br /> 			speed: {" + l.end.speed.x + ", " + l.end.speed.y + "}<br /> 			flick: {" + l.end.flick.x + ", " + l.end.flick.y + "}<br /> 			duration: " + l.end.duration + "<br /> 		} 		</pre>";
					a("#flickableDebugger").html(d)
				}
				var l, m = {
						start: {
							x: 0,
							y: 0,
							time: 0
						},
						delta: {
							prevPos: {
								x: 0,
								y: 0
							},
							dist: {
								x: 0,
								y: 0
							},
							dir: {
								x: 0,
								y: 0
							}
						},
						end: {
							duration: 0,
							speed: {
								x: 0,
								y: 0
							},
							flick: {
								x: 0,
								y: 0
							}
						}
					},
					n = !1,
					o = 0,
					p = .7,
					q = 5,
					r = !1,
					s = {
						init: function(j) {
							var k = a.extend({
								enableDebugger: !1,
								segments: 5,
								snapSpeed: .3,
								flickSnapSpeed: .3,
								flickThreshold: !1,
								segmentPx: "auto",
								flickDirection: "auto",
								preventDefault: !0,
								preventDefaultAxis: "both",
								onCreate: !1,
								onFlick: !1,
								onFlickLeft: !1,
								onFlickRight: !1,
								onFlickUp: !1,
								onFlickDown: !1,
								onScroll: !1,
								onScrollNext: !1,
								onScrollPrev: !1,
								onMove: !1,
								onStart: !1,
								onEnd: !1
							}, j);
							return this.each(function() {
								var j = a(this),
									l = j.data("isAlive");
								if(!l) {
									var m = k.segments,
										o = f(j, k.flickDirection);
									j.data("isAlive", !0).data("pos", 0).data("snapSpeed", parseFloat(k.snapSpeed)).data("flickSnapSpeed", parseFloat(k.flickSnapSpeed)).data("segment", 0).data("segments", m).data("flickDirection", o).data("segmentPx", g(j, k.segmentPx)).data("preventDefaultAxis", k.preventDefaultAxis), a(j).bind({
										onStart: function() {
											a(this).flickable("start", k.onStart)
										},
										onMove: function() {
											a(this).flickable("move", k.onMove)
										},
										onEnd: function() {
											a(this).flickable("finished", k.onEnd)
										},
										onScroll: function() {
											a(this).flickable("scrollToSegment", k.onScroll)
										},
										onScrollPrev: function() {
											a(this).flickable("prevSegment", k.onScrollPrev)
										},
										onScrollNext: function() {
											a(this).flickable("nextSegment", k.onScrollNext)
										},
										onFlick: function() {
											a(this).flickable("flick", k.onFlick)
										},
										onFlickLeft: function() {
											a(this).flickable("flickLeft", k.onFlickLeft)
										},
										onFlickRight: function() {
											a(this).flickable("flickRight", k.onFlickRight)
										},
										onFlickUp: function() {
											a(this).flickable("flickUp", k.onFlickUp)
										},
										onFlickDown: function() {
											a(this).flickable("flickDown", k.onFlickDown)
										},
										touchstart: function(c) {
											b(c), a(this).trigger("onStart")
										},
										touchmove: function(b) {
											c(b), k.preventDefault && d.call(this, b), a(this).trigger("onMove")
										},
										touchend: function(b) {
											e(b), a(this).trigger("onEnd")
										}
									}), h("transform") || (n = !0), parseInt(k.flickThreshold) && (p = parseInt(k.flickThreshold)), (r || k.enableDebugger) && i(), j.flickable("create", k.onCreate)
								}
							})
						},
						create: function(b) {
							var c = a(this);
							l = m, o++, j("It's alive!"), c.attr("id") || c.attr("id", "flickable" + o), c.flickable("scrollToSegment"), "function" == typeof b && b.call(this, o)
						},
						start: function(b) {
							j("Touch start");
							var c = a(this),
								d = parseInt(c.data("segment")),
								e = parseInt(c.data("segmentPx")),
								f = -(e * d);
							c.data("anchor", f), "function" == typeof b && b.call(this, l)
						},
						segment: function(b) {
							var c = a(this),
								d = parseInt(c.data("segments")),
								e = parseInt(c.data("segment"));
							return "undefined" != typeof b && (b >= d ? b = d - 1 : 0 > b && (b = 0), b !== e ? c.data("segment", b).trigger("onScroll") : c.flickable("scrollToSegment")), parseInt(c.data("segment"))
						},
						move: function(b) {
							var c, d, e = a(this),
								f = e.data("flickDirection"),
								g = parseInt(e.data("anchor")),
								c = g + l.delta.dist[f];
							n ? "y" == f ? e.css("top", c) : e.css("left", c) : (d = "y" == f ? "(0," + c + "px,0)" : "(" + c + "px,0,0)", "undefined" != typeof document.getElementById(e.attr("id")).style.webkitTransform ? document.getElementById(e.attr("id")).style.webkitTransform = "translate3d" + d : "undefined" != typeof document.getElementById(e.attr("id")).style.mozTransform ? document.getElementById(e.attr("id")).style.mozTransform = "translate3d" + d : document.getElementById(e.attr("id")).style.transform = "translate3d" + d), a(this).data("pos", c), "function" == typeof b && b.call(this, l)
						},
						scrollNext: function() {
							a(this).trigger("onScrollNext")
						},
						scrollPrev: function() {
							a(this).trigger("onScrollPrev")
						},
						nextSegment: function(b) {
							j("Next segment");
							var c = a(this),
								d = parseInt(c.data("segment")) + 1;
							c.flickable("segment", d), "function" == typeof b && b.call(this, l, d)
						},
						prevSegment: function(b) {
							j("Previous segment");
							var c = a(this),
								d = parseInt(c.data("segment")) - 1;
							c.flickable("segment", d), "function" == typeof b && b.call(this, l, d)
						},
						flick: function(b) {
							j("You flicked");
							var c = a(this);
							switch(l.end.flick.x) {
								case -1:
									c.trigger("onFlickLeft");
									break;
								case 1:
									c.trigger("onFlickRight")
							}
							switch(l.end.flick.y) {
								case -1:
									c.trigger("onFlickUp");
									break;
								case 1:
									c.trigger("onFlickDown")
							}
							"function" == typeof b && b.call(this, l)
						},
						flickLeft: function(b) {
							j("Flicked left");
							var c = a(this),
								d = parseInt(c.data("segment"));
							c.trigger("onScrollNext"), "function" == typeof b && b.call(this, l, d)
						},
						flickRight: function(b) {
							j("Flicked right");
							var c = a(this),
								d = parseInt(c.data("segment"));
							c.trigger("onScrollPrev"), "function" == typeof b && b.call(this, l, d)
						},
						flickUp: function(b) {
							j("Flicked up");
							var c = a(this),
								d = parseInt(c.data("segment"));
							c.trigger("onScrollNext"), "function" == typeof b && b.call(this, l, d)
						},
						flickDown: function(b) {
							j("Flicked down");
							var c = a(this),
								d = parseInt(c.data("segment"));
							c.trigger("onScrollPrev"), "function" == typeof b && b.call(this, l, d)
						},
						scrollToSegment: function(b) {
							var c, d = a(this),
								e = d.data("flickDirection"),
								f = parseFloat(d.data("snapSpeed")),
								g = parseFloat(d.data("flickSnapSpeed")),
								h = (parseInt(d.data("segments")), parseInt(d.data("segment"))),
								i = parseInt(d.data("segmentPx")),
								k = -(i * h),
								m = "ease-out";
							j("Sliding to segment " + h), (l.end.flick.x || l.end.flick.y) && (f = g, m = "cubic-bezier(0, .70, .35, 1)"), d.data("anchor", k).data("pos", k).data("segment", h), n ? "y" == e ? d.anim({
								top: k
							}, f, m) : d.anim({
								left: k
							}, f, m) : (c = "y" == e ? "0px, " + k + "px, 0px" : k + "px, 0px, 0px", d.anim({
								translate3d: c
							}, f, m)), "function" == typeof b && b.call(this, l, h)
						},
						finished: function(b) {
							var c, d = a(this),
								e = d.data("flickDirection"),
								f = (parseInt(d.data("segments")), parseInt(d.data("segment"))),
								g = parseInt(d.data("segmentPx")),
								h = (parseInt(d.data("anchor")), parseInt(d.data("pos")));
							return c = 0 > h ? Math.abs(Math.round(h / g)) : 0, j("Nearest segment is " + c), "function" == typeof b && b.call(this, l, f), f == c && l.end.flick[e] ? d.trigger("onFlick") : void(c == f + 1 ? d.trigger("onScrollNext") : c == f - 1 ? d.trigger("onScrollPrev") : d.flickable("segment", c))
						}
					};
				a.fn.flickable = function(b) {
					return s[b] ? s[b].apply(this, Array.prototype.slice.call(arguments, 1)) : "object" != typeof b && b ? void a.error("Method " + b + " does not exist") : s.init.apply(this, arguments)
				}
			}(Zepto),
			function() {
				var a = this,
					b = a._,
					c = {},
					d = Array.prototype,
					e = Object.prototype,
					f = Function.prototype,
					g = d.push,
					h = d.slice,
					i = d.concat,
					j = e.toString,
					k = e.hasOwnProperty,
					l = d.forEach,
					m = d.map,
					n = d.reduce,
					o = d.reduceRight,
					p = d.filter,
					q = d.every,
					r = d.some,
					s = d.indexOf,
					t = d.lastIndexOf,
					u = Array.isArray,
					v = Object.keys,
					w = f.bind,
					x = function(a) {
						return a instanceof x ? a : this instanceof x ? void(this._wrapped = a) : new x(a)
					};
				//"undefined" != typeof exports ? ("undefined" != typeof module && module.exports && (exports = module.exports = x), exports._ = x) : a._ = x, x.VERSION = "1.6.0";
				a._ = x, x.VERSION = "1.6.0";
				var y = x.each = x.forEach = function(a, b, d) {
					if(null == a) return a;
					if(l && a.forEach === l) a.forEach(b, d);
					else if(a.length === +a.length) {
						for(var e = 0, f = a.length; f > e; e++)
							if(b.call(d, a[e], e, a) === c) return
					} else
						for(var g = x.keys(a), e = 0, f = g.length; f > e; e++)
							if(b.call(d, a[g[e]], g[e], a) === c) return;
					return a
				};
				x.map = x.collect = function(a, b, c) {
					var d = [];
					return null == a ? d : m && a.map === m ? a.map(b, c) : (y(a, function(a, e, f) {
						d.push(b.call(c, a, e, f))
					}), d)
				};
				var z = "Reduce of empty array with no initial value";
				x.reduce = x.foldl = x.inject = function(a, b, c, d) {
					var e = arguments.length > 2;
					if(null == a && (a = []), n && a.reduce === n) return d && (b = x.bind(b, d)), e ? a.reduce(b, c) : a.reduce(b);
					if(y(a, function(a, f, g) {
							e ? c = b.call(d, c, a, f, g) : (c = a, e = !0)
						}), !e) throw new TypeError(z);
					return c
				}, x.reduceRight = x.foldr = function(a, b, c, d) {
					var e = arguments.length > 2;
					if(null == a && (a = []), o && a.reduceRight === o) return d && (b = x.bind(b, d)), e ? a.reduceRight(b, c) : a.reduceRight(b);
					var f = a.length;
					if(f !== +f) {
						var g = x.keys(a);
						f = g.length
					}
					if(y(a, function(h, i, j) {
							i = g ? g[--f] : --f, e ? c = b.call(d, c, a[i], i, j) : (c = a[i], e = !0)
						}), !e) throw new TypeError(z);
					return c
				}, x.find = x.detect = function(a, b, c) {
					var d;
					return A(a, function(a, e, f) {
						return b.call(c, a, e, f) ? (d = a, !0) : void 0
					}), d
				}, x.filter = x.select = function(a, b, c) {
					var d = [];
					return null == a ? d : p && a.filter === p ? a.filter(b, c) : (y(a, function(a, e, f) {
						b.call(c, a, e, f) && d.push(a)
					}), d)
				}, x.reject = function(a, b, c) {
					return x.filter(a, function(a, d, e) {
						return !b.call(c, a, d, e)
					}, c)
				}, x.every = x.all = function(a, b, d) {
					b || (b = x.identity);
					var e = !0;
					return null == a ? e : q && a.every === q ? a.every(b, d) : (y(a, function(a, f, g) {
						return(e = e && b.call(d, a, f, g)) ? void 0 : c
					}), !!e)
				};
				var A = x.some = x.any = function(a, b, d) {
					b || (b = x.identity);
					var e = !1;
					return null == a ? e : r && a.some === r ? a.some(b, d) : (y(a, function(a, f, g) {
						return e || (e = b.call(d, a, f, g)) ? c : void 0
					}), !!e)
				};
				x.contains = x.include = function(a, b) {
					return null == a ? !1 : s && a.indexOf === s ? -1 != a.indexOf(b) : A(a, function(a) {
						return a === b
					})
				}, x.invoke = function(a, b) {
					var c = h.call(arguments, 2),
						d = x.isFunction(b);
					return x.map(a, function(a) {
						return(d ? b : a[b]).apply(a, c)
					})
				}, x.pluck = function(a, b) {
					return x.map(a, x.property(b))
				}, x.where = function(a, b) {
					return x.filter(a, x.matches(b))
				}, x.findWhere = function(a, b) {
					return x.find(a, x.matches(b))
				}, x.max = function(a, b, c) {
					if(!b && x.isArray(a) && a[0] === +a[0] && a.length < 65535) return Math.max.apply(Math, a);
					var d = -(1 / 0),
						e = -(1 / 0);
					return y(a, function(a, f, g) {
						var h = b ? b.call(c, a, f, g) : a;
						h > e && (d = a, e = h)
					}), d
				}, x.min = function(a, b, c) {
					if(!b && x.isArray(a) && a[0] === +a[0] && a.length < 65535) return Math.min.apply(Math, a);
					var d = 1 / 0,
						e = 1 / 0;
					return y(a, function(a, f, g) {
						var h = b ? b.call(c, a, f, g) : a;
						e > h && (d = a, e = h)
					}), d
				}, x.shuffle = function(a) {
					var b, c = 0,
						d = [];
					return y(a, function(a) {
						b = x.random(c++), d[c - 1] = d[b], d[b] = a
					}), d
				}, x.sample = function(a, b, c) {
					return null == b || c ? (a.length !== +a.length && (a = x.values(a)), a[x.random(a.length - 1)]) : x.shuffle(a).slice(0, Math.max(0, b))
				};
				var B = function(a) {
					return null == a ? x.identity : x.isFunction(a) ? a : x.property(a)
				};
				x.sortBy = function(a, b, c) {
					return b = B(b), x.pluck(x.map(a, function(a, d, e) {
						return {
							value: a,
							index: d,
							criteria: b.call(c, a, d, e)
						}
					}).sort(function(a, b) {
						var c = a.criteria,
							d = b.criteria;
						if(c !== d) {
							if(c > d || void 0 === c) return 1;
							if(d > c || void 0 === d) return -1
						}
						return a.index - b.index
					}), "value")
				};
				var C = function(a) {
					return function(b, c, d) {
						var e = {};
						return c = B(c), y(b, function(f, g) {
							var h = c.call(d, f, g, b);
							a(e, h, f)
						}), e
					}
				};
				x.groupBy = C(function(a, b, c) {
					x.has(a, b) ? a[b].push(c) : a[b] = [c]
				}), x.indexBy = C(function(a, b, c) {
					a[b] = c
				}), x.countBy = C(function(a, b) {
					x.has(a, b) ? a[b]++ : a[b] = 1
				}), x.sortedIndex = function(a, b, c, d) {
					c = B(c);
					for(var e = c.call(d, b), f = 0, g = a.length; g > f;) {
						var h = f + g >>> 1;
						c.call(d, a[h]) < e ? f = h + 1 : g = h
					}
					return f
				}, x.toArray = function(a) {
					return a ? x.isArray(a) ? h.call(a) : a.length === +a.length ? x.map(a, x.identity) : x.values(a) : []
				}, x.size = function(a) {
					return null == a ? 0 : a.length === +a.length ? a.length : x.keys(a).length
				}, x.first = x.head = x.take = function(a, b, c) {
					return null == a ? void 0 : null == b || c ? a[0] : 0 > b ? [] : h.call(a, 0, b)
				}, x.initial = function(a, b, c) {
					return h.call(a, 0, a.length - (null == b || c ? 1 : b))
				}, x.last = function(a, b, c) {
					return null == a ? void 0 : null == b || c ? a[a.length - 1] : h.call(a, Math.max(a.length - b, 0))
				}, x.rest = x.tail = x.drop = function(a, b, c) {
					return h.call(a, null == b || c ? 1 : b)
				}, x.compact = function(a) {
					return x.filter(a, x.identity)
				};
				var D = function(a, b, c) {
					return b && x.every(a, x.isArray) ? i.apply(c, a) : (y(a, function(a) {
						x.isArray(a) || x.isArguments(a) ? b ? g.apply(c, a) : D(a, b, c) : c.push(a)
					}), c)
				};
				x.flatten = function(a, b) {
					return D(a, b, [])
				}, x.without = function(a) {
					return x.difference(a, h.call(arguments, 1))
				}, x.partition = function(a, b) {
					var c = [],
						d = [];
					return y(a, function(a) {
						(b(a) ? c : d).push(a)
					}), [c, d]
				}, x.uniq = x.unique = function(a, b, c, d) {
					x.isFunction(b) && (d = c, c = b, b = !1);
					var e = c ? x.map(a, c, d) : a,
						f = [],
						g = [];
					return y(e, function(c, d) {
						(b ? d && g[g.length - 1] === c : x.contains(g, c)) || (g.push(c), f.push(a[d]))
					}), f
				}, x.union = function() {
					return x.uniq(x.flatten(arguments, !0))
				}, x.intersection = function(a) {
					var b = h.call(arguments, 1);
					return x.filter(x.uniq(a), function(a) {
						return x.every(b, function(b) {
							return x.contains(b, a)
						})
					})
				}, x.difference = function(a) {
					var b = i.apply(d, h.call(arguments, 1));
					return x.filter(a, function(a) {
						return !x.contains(b, a)
					})
				}, x.zip = function() {
					for(var a = x.max(x.pluck(arguments, "length").concat(0)), b = new Array(a), c = 0; a > c; c++) b[c] = x.pluck(arguments, "" + c);
					return b
				}, x.object = function(a, b) {
					if(null == a) return {};
					for(var c = {}, d = 0, e = a.length; e > d; d++) b ? c[a[d]] = b[d] : c[a[d][0]] = a[d][1];
					return c
				}, x.indexOf = function(a, b, c) {
					if(null == a) return -1;
					var d = 0,
						e = a.length;
					if(c) {
						if("number" != typeof c) return d = x.sortedIndex(a, b), a[d] === b ? d : -1;
						d = 0 > c ? Math.max(0, e + c) : c
					}
					if(s && a.indexOf === s) return a.indexOf(b, c);
					for(; e > d; d++)
						if(a[d] === b) return d;
					return -1
				}, x.lastIndexOf = function(a, b, c) {
					if(null == a) return -1;
					var d = null != c;
					if(t && a.lastIndexOf === t) return d ? a.lastIndexOf(b, c) : a.lastIndexOf(b);
					for(var e = d ? c : a.length; e--;)
						if(a[e] === b) return e;
					return -1
				}, x.range = function(a, b, c) {
					arguments.length <= 1 && (b = a || 0, a = 0), c = arguments[2] || 1;
					for(var d = Math.max(Math.ceil((b - a) / c), 0), e = 0, f = new Array(d); d > e;) f[e++] = a, a += c;
					return f
				};
				var E = function() {};
				x.bind = function(a, b) {
					var c, d;
					if(w && a.bind === w) return w.apply(a, h.call(arguments, 1));
					if(!x.isFunction(a)) throw new TypeError;
					return c = h.call(arguments, 2), d = function() {
						if(!(this instanceof d)) return a.apply(b, c.concat(h.call(arguments)));
						E.prototype = a.prototype;
						var e = new E;
						E.prototype = null;
						var f = a.apply(e, c.concat(h.call(arguments)));
						return Object(f) === f ? f : e
					}
				}, x.partial = function(a) {
					var b = h.call(arguments, 1);
					return function() {
						for(var c = 0, d = b.slice(), e = 0, f = d.length; f > e; e++) d[e] === x && (d[e] = arguments[c++]);
						for(; c < arguments.length;) d.push(arguments[c++]);
						return a.apply(this, d)
					}
				}, x.bindAll = function(a) {
					var b = h.call(arguments, 1);
					if(0 === b.length) throw new Error("bindAll must be passed function names");
					return y(b, function(b) {
						a[b] = x.bind(a[b], a)
					}), a
				}, x.memoize = function(a, b) {
					var c = {};
					return b || (b = x.identity),
						function() {
							var d = b.apply(this, arguments);
							return x.has(c, d) ? c[d] : c[d] = a.apply(this, arguments)
						}
				}, x.delay = function(a, b) {
					var c = h.call(arguments, 2);
					return setTimeout(function() {
						return a.apply(null, c)
					}, b)
				}, x.defer = function(a) {
					return x.delay.apply(x, [a, 1].concat(h.call(arguments, 1)))
				}, x.throttle = function(a, b, c) {
					var d, e, f, g = null,
						h = 0;
					c || (c = {});
					var i = function() {
						h = c.leading === !1 ? 0 : x.now(), g = null, f = a.apply(d, e), d = e = null
					};
					return function() {
						var j = x.now();
						h || c.leading !== !1 || (h = j);
						var k = b - (j - h);
						return d = this, e = arguments, 0 >= k ? (clearTimeout(g), g = null, h = j, f = a.apply(d, e), d = e = null) : g || c.trailing === !1 || (g = setTimeout(i, k)), f
					}
				}, x.debounce = function(a, b, c) {
					var d, e, f, g, h, i = function() {
						var j = x.now() - g;
						b > j ? d = setTimeout(i, b - j) : (d = null, c || (h = a.apply(f, e), f = e = null))
					};
					return function() {
						f = this, e = arguments, g = x.now();
						var j = c && !d;
						return d || (d = setTimeout(i, b)), j && (h = a.apply(f, e), f = e = null), h
					}
				}, x.once = function(a) {
					var b, c = !1;
					return function() {
						return c ? b : (c = !0, b = a.apply(this, arguments), a = null, b)
					}
				}, x.wrap = function(a, b) {
					return x.partial(b, a)
				}, x.compose = function() {
					var a = arguments;
					return function() {
						for(var b = arguments, c = a.length - 1; c >= 0; c--) b = [a[c].apply(this, b)];
						return b[0]
					}
				}, x.after = function(a, b) {
					return function() {
						return --a < 1 ? b.apply(this, arguments) : void 0
					}
				}, x.keys = function(a) {
					if(!x.isObject(a)) return [];
					if(v) return v(a);
					var b = [];
					for(var c in a) x.has(a, c) && b.push(c);
					return b
				}, x.values = function(a) {
					for(var b = x.keys(a), c = b.length, d = new Array(c), e = 0; c > e; e++) d[e] = a[b[e]];
					return d
				}, x.pairs = function(a) {
					for(var b = x.keys(a), c = b.length, d = new Array(c), e = 0; c > e; e++) d[e] = [b[e], a[b[e]]];
					return d
				}, x.invert = function(a) {
					for(var b = {}, c = x.keys(a), d = 0, e = c.length; e > d; d++) b[a[c[d]]] = c[d];
					return b
				}, x.functions = x.methods = function(a) {
					var b = [];
					for(var c in a) x.isFunction(a[c]) && b.push(c);
					return b.sort()
				}, x.extend = function(a) {
					return y(h.call(arguments, 1), function(b) {
						if(b)
							for(var c in b) a[c] = b[c]
					}), a
				}, x.pick = function(a) {
					var b = {},
						c = i.apply(d, h.call(arguments, 1));
					return y(c, function(c) {
						c in a && (b[c] = a[c])
					}), b
				}, x.omit = function(a) {
					var b = {},
						c = i.apply(d, h.call(arguments, 1));
					for(var e in a) x.contains(c, e) || (b[e] = a[e]);
					return b
				}, x.defaults = function(a) {
					return y(h.call(arguments, 1), function(b) {
						if(b)
							for(var c in b) void 0 === a[c] && (a[c] = b[c])
					}), a
				}, x.clone = function(a) {
					return x.isObject(a) ? x.isArray(a) ? a.slice() : x.extend({}, a) : a
				}, x.tap = function(a, b) {
					return b(a), a
				};
				var F = function(a, b, c, d) {
					if(a === b) return 0 !== a || 1 / a == 1 / b;
					if(null == a || null == b) return a === b;
					a instanceof x && (a = a._wrapped), b instanceof x && (b = b._wrapped);
					var e = j.call(a);
					if(e != j.call(b)) return !1;
					switch(e) {
						case "[object String]":
							return a == String(b);
						case "[object Number]":
							return a != +a ? b != +b : 0 == a ? 1 / a == 1 / b : a == +b;
						case "[object Date]":
						case "[object Boolean]":
							return +a == +b;
						case "[object RegExp]":
							return a.source == b.source && a.global == b.global && a.multiline == b.multiline && a.ignoreCase == b.ignoreCase
					}
					if("object" != typeof a || "object" != typeof b) return !1;
					for(var f = c.length; f--;)
						if(c[f] == a) return d[f] == b;
					var g = a.constructor,
						h = b.constructor;
					if(g !== h && !(x.isFunction(g) && g instanceof g && x.isFunction(h) && h instanceof h) && "constructor" in a && "constructor" in b) return !1;
					c.push(a), d.push(b);
					var i = 0,
						k = !0;
					if("[object Array]" == e) {
						if(i = a.length, k = i == b.length)
							for(; i-- && (k = F(a[i], b[i], c, d)););
					} else {
						for(var l in a)
							if(x.has(a, l) && (i++, !(k = x.has(b, l) && F(a[l], b[l], c, d)))) break;
						if(k) {
							for(l in b)
								if(x.has(b, l) && !i--) break;
							k = !i
						}
					}
					return c.pop(), d.pop(), k
				};
				x.isEqual = function(a, b) {
					return F(a, b, [], [])
				}, x.isEmpty = function(a) {
					if(null == a) return !0;
					if(x.isArray(a) || x.isString(a)) return 0 === a.length;
					for(var b in a)
						if(x.has(a, b)) return !1;
					return !0
				}, x.isElement = function(a) {
					return !(!a || 1 !== a.nodeType)
				}, x.isArray = u || function(a) {
					return "[object Array]" == j.call(a)
				}, x.isObject = function(a) {
					return a === Object(a)
				}, y(["Arguments", "Function", "String", "Number", "Date", "RegExp"], function(a) {
					x["is" + a] = function(b) {
						return j.call(b) == "[object " + a + "]"
					}
				}), x.isArguments(arguments) || (x.isArguments = function(a) {
					return !(!a || !x.has(a, "callee"))
				}), "function" != typeof /./ && (x.isFunction = function(a) {
					return "function" == typeof a
				}), x.isFinite = function(a) {
					return isFinite(a) && !isNaN(parseFloat(a))
				}, x.isNaN = function(a) {
					return x.isNumber(a) && a != +a
				}, x.isBoolean = function(a) {
					return a === !0 || a === !1 || "[object Boolean]" == j.call(a)
				}, x.isNull = function(a) {
					return null === a
				}, x.isUndefined = function(a) {
					return void 0 === a
				}, x.has = function(a, b) {
					return k.call(a, b)
				}, x.noConflict = function() {
					return a._ = b, this
				}, x.identity = function(a) {
					return a
				}, x.constant = function(a) {
					return function() {
						return a
					}
				}, x.property = function(a) {
					return function(b) {
						return b[a]
					}
				}, x.matches = function(a) {
					return function(b) {
						if(b === a) return !0;
						for(var c in a)
							if(a[c] !== b[c]) return !1;
						return !0
					}
				}, x.times = function(a, b, c) {
					for(var d = Array(Math.max(0, a)), e = 0; a > e; e++) d[e] = b.call(c, e);
					return d
				}, x.random = function(a, b) {
					return null == b && (b = a, a = 0), a + Math.floor(Math.random() * (b - a + 1))
				}, x.now = Date.now || function() {
					return(new Date).getTime()
				};
				var G = {
					escape: {
						"&": "&amp;",
						"<": "&lt;",
						">": "&gt;",
						'"': "&quot;",
						"'": "&#x27;"
					}
				};
				G.unescape = x.invert(G.escape);
				var H = {
					escape: new RegExp("[" + x.keys(G.escape).join("") + "]", "g"),
					unescape: new RegExp("(" + x.keys(G.unescape).join("|") + ")", "g")
				};
				x.each(["escape", "unescape"], function(a) {
					x[a] = function(b) {
						return null == b ? "" : ("" + b).replace(H[a], function(b) {
							return G[a][b]
						})
					}
				}), x.result = function(a, b) {
					if(null == a) return void 0;
					var c = a[b];
					return x.isFunction(c) ? c.call(a) : c
				}, x.mixin = function(a) {
					y(x.functions(a), function(b) {
						var c = x[b] = a[b];
						x.prototype[b] = function() {
							var a = [this._wrapped];
							return g.apply(a, arguments), M.call(this, c.apply(x, a))
						}
					})
				};
				var I = 0;
				x.uniqueId = function(a) {
					var b = ++I + "";
					return a ? a + b : b
				}, x.templateSettings = {
					evaluate: /<%([\s\S]+?)%>/g,
					interpolate: /<%=([\s\S]+?)%>/g,
					escape: /<%-([\s\S]+?)%>/g
				};
				var J = /(.)^/,
					K = {
						"'": "'",
						"\\": "\\",
						"\r": "r",
						"\n": "n",
						"	": "t",
						"\u2028": "u2028",
						"\u2029": "u2029"
					},
					L = /\\|'|\r|\n|\t|\u2028|\u2029/g;
				x.template = function(a, b, c) {
					var d;
					c = x.defaults({}, c, x.templateSettings);
					var e = new RegExp([(c.escape || J).source, (c.interpolate || J).source, (c.evaluate || J).source].join("|") + "|$", "g"),
						f = 0,
						g = "__p+='";
					a.replace(e, function(b, c, d, e, h) {
						return g += a.slice(f, h).replace(L, function(a) {
							return "\\" + K[a]
						}), c && (g += "'+\n((__t=(" + c + "))==null?'':_.escape(__t))+\n'"), d && (g += "'+\n((__t=(" + d + "))==null?'':__t)+\n'"), e && (g += "';\n" + e + "\n__p+='"), f = h + b.length, b
					}), g += "';\n", c.variable || (g = "with(obj||{}){\n" + g + "}\n"), g = "var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};\n" + g + "return __p;\n";
					try {
						d = new Function(c.variable || "obj", "_", g)
					} catch(h) {
						throw h.source = g, h
					}
					if(b) return d(b, x);
					var i = function(a) {
						return d.call(this, a, x)
					};
					return i.source = "function(" + (c.variable || "obj") + "){\n" + g + "}", i
				}, x.chain = function(a) {
					return x(a).chain()
				};
				var M = function(a) {
					return this._chain ? x(a).chain() : a
				};
				x.mixin(x), y(["pop", "push", "reverse", "shift", "sort", "splice", "unshift"], function(a) {
					var b = d[a];
					x.prototype[a] = function() {
						var c = this._wrapped;
						return b.apply(c, arguments), "shift" != a && "splice" != a || 0 !== c.length || delete c[0], M.call(this, c)
					}
				}), y(["concat", "join", "slice"], function(a) {
					var b = d[a];
					x.prototype[a] = function() {
						return M.call(this, b.apply(this._wrapped, arguments))
					}
				}), x.extend(x.prototype, {
					chain: function() {
						return this._chain = !0, this
					},
					value: function() {
						return this._wrapped
					}
				}), "function" == typeof define && define.amd && define("underscore", [], function() {
					return x
				})
			}.call(this),
			function(a, b) {
				/*console.log("undefined" != typeof exports)
				if("function" == typeof define && define.amd) define(["underscore", "jquery", "exports"], function(c, d, e) {
					console.log(a);
					console.log(e);
					console.log(c);
					console.log(d);
					
					a.Backbone = b(a, e, c, d)
				});
				else if("undefined" != typeof exports) {
					var c = require("underscore");
					console.log(a);
					console.log(exports);
					console.log(c);
					b(a, exports, c)
				} else */
				a.Backbone = b(a, {}, a._, a.jQuery || a.Zepto || a.ender || a.$)
			}(this, function(a, b, c, d) {
				var e = a.Backbone,
					f = [],
					g = (f.push, f.slice);
				f.splice;
				b.VERSION = "1.1.2", b.$ = d, b.noConflict = function() {
					return a.Backbone = e, this
				}, b.emulateHTTP = !1, b.emulateJSON = !1;
				var h = b.Events = {
						on: function(a, b, c) {
							if(!j(this, "on", a, [b, c]) || !b) return this;
							this._events || (this._events = {});
							var d = this._events[a] || (this._events[a] = []);
							return d.push({
								callback: b,
								context: c,
								ctx: c || this
							}), this
						},
						once: function(a, b, d) {
							if(!j(this, "once", a, [b, d]) || !b) return this;
							var e = this,
								f = c.once(function() {
									e.off(a, f), b.apply(this, arguments)
								});
							return f._callback = b, this.on(a, f, d)
						},
						off: function(a, b, d) {
							var e, f, g, h, i, k, l, m;
							if(!this._events || !j(this, "off", a, [b, d])) return this;
							if(!a && !b && !d) return this._events = void 0, this;
							for(h = a ? [a] : c.keys(this._events), i = 0, k = h.length; k > i; i++)
								if(a = h[i], g = this._events[a]) {
									if(this._events[a] = e = [], b || d)
										for(l = 0, m = g.length; m > l; l++) f = g[l], (b && b !== f.callback && b !== f.callback._callback || d && d !== f.context) && e.push(f);
									e.length || delete this._events[a]
								}
							return this
						},
						trigger: function(a) {
							if(!this._events) return this;
							var b = g.call(arguments, 1);
							if(!j(this, "trigger", a, b)) return this;
							var c = this._events[a],
								d = this._events.all;
							return c && k(c, b), d && k(d, arguments), this
						},
						stopListening: function(a, b, d) {
							var e = this._listeningTo;
							if(!e) return this;
							var f = !b && !d;
							d || "object" != typeof b || (d = this), a && ((e = {})[a._listenId] = a);
							for(var g in e) a = e[g], a.off(b, d, this), (f || c.isEmpty(a._events)) && delete this._listeningTo[g];
							return this
						}
					},
					i = /\s+/,
					j = function(a, b, c, d) {
						if(!c) return !0;
						if("object" == typeof c) {
							for(var e in c) a[b].apply(a, [e, c[e]].concat(d));
							return !1
						}
						if(i.test(c)) {
							for(var f = c.split(i), g = 0, h = f.length; h > g; g++) a[b].apply(a, [f[g]].concat(d));
							return !1
						}
						return !0
					},
					k = function(a, b) {
						var c, d = -1,
							e = a.length,
							f = b[0],
							g = b[1],
							h = b[2];
						switch(b.length) {
							case 0:
								for(; ++d < e;)(c = a[d]).callback.call(c.ctx);
								return;
							case 1:
								for(; ++d < e;)(c = a[d]).callback.call(c.ctx, f);
								return;
							case 2:
								for(; ++d < e;)(c = a[d]).callback.call(c.ctx, f, g);
								return;
							case 3:
								for(; ++d < e;)(c = a[d]).callback.call(c.ctx, f, g, h);
								return;
							default:
								for(; ++d < e;)(c = a[d]).callback.apply(c.ctx, b);
								return
						}
					},
					l = {
						listenTo: "on",
						listenToOnce: "once"
					};
				c.each(l, function(a, b) {
					h[b] = function(b, d, e) {
						var f = this._listeningTo || (this._listeningTo = {}),
							g = b._listenId || (b._listenId = c.uniqueId("l"));
						return f[g] = b, e || "object" != typeof d || (e = this), b[a](d, e, this), this
					}
				}), 
				h.bind = h.on, 
				h.unbind = h.off, 
				c.extend(b, h);
				var m = b.Model = function(a, b) {
					var d = a || {};
					b || (b = {}), this.cid = c.uniqueId("c"), this.attributes = {}, b.collection && (this.collection = b.collection), b.parse && (d = this.parse(d, b) || {}), d = c.defaults({}, d, c.result(this, "defaults")), this.set(d, b), this.changed = {}, this.initialize.apply(this, arguments)
				};
				c.extend(m.prototype, h, {
					changed: null,
					validationError: null,
					idAttribute: "id",
					initialize: function() {},
					toJSON: function(a) {
						return c.clone(this.attributes)
					},
					sync: function() {
						return b.sync.apply(this, arguments)
					},
					get: function(a) {
						return this.attributes[a]
					},
					escape: function(a) {
						return c.escape(this.get(a))
					},
					has: function(a) {
						return null != this.get(a)
					},
					set: function(a, b, d) {
						var e, f, g, h, i, j, k, l;
						if(null == a) return this;
						if("object" == typeof a ? (f = a, d = b) : (f = {})[a] = b, d || (d = {}), !this._validate(f, d)) return !1;
						g = d.unset, i = d.silent, h = [], j = this._changing, this._changing = !0, j || (this._previousAttributes = c.clone(this.attributes), this.changed = {}), l = this.attributes, k = this._previousAttributes, this.idAttribute in f && (this.id = f[this.idAttribute]);
						for(e in f) b = f[e], c.isEqual(l[e], b) || h.push(e), c.isEqual(k[e], b) ? delete this.changed[e] : this.changed[e] = b, g ? delete l[e] : l[e] = b;
						if(!i) {
							h.length && (this._pending = d);
							for(var m = 0, n = h.length; n > m; m++) this.trigger("change:" + h[m], this, l[h[m]], d)
						}
						if(j) return this;
						if(!i)
							for(; this._pending;) d = this._pending, this._pending = !1, this.trigger("change", this, d);
						return this._pending = !1, this._changing = !1, this
					},
					unset: function(a, b) {
						return this.set(a, void 0, c.extend({}, b, {
							unset: !0
						}))
					},
					clear: function(a) {
						var b = {};
						for(var d in this.attributes) b[d] = void 0;
						return this.set(b, c.extend({}, a, {
							unset: !0
						}))
					},
					hasChanged: function(a) {
						return null == a ? !c.isEmpty(this.changed) : c.has(this.changed, a)
					},
					changedAttributes: function(a) {
						if(!a) return this.hasChanged() ? c.clone(this.changed) : !1;
						var b, d = !1,
							e = this._changing ? this._previousAttributes : this.attributes;
						for(var f in a) c.isEqual(e[f], b = a[f]) || ((d || (d = {}))[f] = b);
						return d
					},
					previous: function(a) {
						return null != a && this._previousAttributes ? this._previousAttributes[a] : null
					},
					previousAttributes: function() {
						return c.clone(this._previousAttributes)
					},
					fetch: function(a) {
						a = a ? c.clone(a) : {}, void 0 === a.parse && (a.parse = !0);
						var b = this,
							d = a.success;
						return a.success = function(c) {
							return b.set(b.parse(c, a), a) ? (d && d(b, c, a), void b.trigger("sync", b, c, a)) : !1
						}, L(this, a), this.sync("read", this, a)
					},
					save: function(a, b, d) {
						var e, f, g, h = this.attributes;
						if(null == a || "object" == typeof a ? (e = a, d = b) : (e = {})[a] = b, d = c.extend({
								validate: !0
							}, d), e && !d.wait) {
							if(!this.set(e, d)) return !1
						} else if(!this._validate(e, d)) return !1;
						e && d.wait && (this.attributes = c.extend({}, h, e)), void 0 === d.parse && (d.parse = !0);
						var i = this,
							j = d.success;
						return d.success = function(a) {
							i.attributes = h;
							var b = i.parse(a, d);
							return d.wait && (b = c.extend(e || {}, b)), c.isObject(b) && !i.set(b, d) ? !1 : (j && j(i, a, d), void i.trigger("sync", i, a, d))
						}, L(this, d), f = this.isNew() ? "create" : d.patch ? "patch" : "update", "patch" === f && (d.attrs = e), g = this.sync(f, this, d), e && d.wait && (this.attributes = h), g
					},
					destroy: function(a) {
						a = a ? c.clone(a) : {};
						var b = this,
							d = a.success,
							e = function() {
								b.trigger("destroy", b, b.collection, a)
							};
						if(a.success = function(c) {
								(a.wait || b.isNew()) && e(), d && d(b, c, a), b.isNew() || b.trigger("sync", b, c, a)
							}, this.isNew()) return a.success(), !1;
						L(this, a);
						var f = this.sync("delete", this, a);
						return a.wait || e(), f
					},
					url: function() {
						var a = c.result(this, "urlRoot") || c.result(this.collection, "url") || K();
						return this.isNew() ? a : a.replace(/([^\/])$/, "$1/") + encodeURIComponent(this.id)
					},
					parse: function(a, b) {
						return a
					},
					clone: function() {
						return new this.constructor(this.attributes)
					},
					isNew: function() {
						return !this.has(this.idAttribute)
					},
					isValid: function(a) {
						return this._validate({}, c.extend(a || {}, {
							validate: !0
						}))
					},
					_validate: function(a, b) {
						if(!b.validate || !this.validate) return !0;
						a = c.extend({}, this.attributes, a);
						var d = this.validationError = this.validate(a, b) || null;
						return d ? (this.trigger("invalid", this, d, c.extend(b, {
							validationError: d
						})), !1) : !0
					}
				});
				var n = ["keys", "values", "pairs", "invert", "pick", "omit"];
				c.each(n, function(a) {
					m.prototype[a] = function() {
						var b = g.call(arguments);
						return b.unshift(this.attributes), c[a].apply(c, b)
					}
				});
				var o = b.Collection = function(a, b) {
						b || (b = {}), b.model && (this.model = b.model), void 0 !== b.comparator && (this.comparator = b.comparator), this._reset(), this.initialize.apply(this, arguments), a && this.reset(a, c.extend({
							silent: !0
						}, b))
					},
					p = {
						add: !0,
						remove: !0,
						merge: !0
					},
					q = {
						add: !0,
						remove: !1
					};
				c.extend(o.prototype, h, {
					model: m,
					initialize: function() {},
					toJSON: function(a) {
						return this.map(function(b) {
							return b.toJSON(a)
						})
					},
					sync: function() {
						return b.sync.apply(this, arguments)
					},
					add: function(a, b) {
						return this.set(a, c.extend({
							merge: !1
						}, b, q))
					},
					remove: function(a, b) {
						var d = !c.isArray(a);
						a = d ? [a] : c.clone(a), b || (b = {});
						var e, f, g, h;
						for(e = 0, f = a.length; f > e; e++) h = a[e] = this.get(a[e]), h && (delete this._byId[h.id], delete this._byId[h.cid], g = this.indexOf(h), this.models.splice(g, 1), this.length--, b.silent || (b.index = g, h.trigger("remove", h, this, b)), this._removeReference(h, b));
						return d ? a[0] : a
					},
					set: function(a, b) {
						b = c.defaults({}, b, p), b.parse && (a = this.parse(a, b));
						var d = !c.isArray(a);
						a = d ? a ? [a] : [] : c.clone(a);
						var e, f, g, h, i, j, k, l = b.at,
							n = this.model,
							o = this.comparator && null == l && b.sort !== !1,
							q = c.isString(this.comparator) ? this.comparator : null,
							r = [],
							s = [],
							t = {},
							u = b.add,
							v = b.merge,
							w = b.remove,
							x = !o && u && w ? [] : !1;
						for(e = 0, f = a.length; f > e; e++) {
							if(i = a[e] || {}, g = i instanceof m ? h = i : i[n.prototype.idAttribute || "id"], j = this.get(g)) w && (t[j.cid] = !0), v && (i = i === h ? h.attributes : i, b.parse && (i = j.parse(i, b)), j.set(i, b), o && !k && j.hasChanged(q) && (k = !0)), a[e] = j;
							else if(u) {
								if(h = a[e] = this._prepareModel(i, b), !h) continue;
								r.push(h), this._addReference(h, b)
							}
							h = j || h, !x || !h.isNew() && t[h.id] || x.push(h), t[h.id] = !0
						}
						if(w) {
							for(e = 0, f = this.length; f > e; ++e) t[(h = this.models[e]).cid] || s.push(h);
							s.length && this.remove(s, b)
						}
						if(r.length || x && x.length)
							if(o && (k = !0), this.length += r.length, null != l)
								for(e = 0, f = r.length; f > e; e++) this.models.splice(l + e, 0, r[e]);
							else {
								x && (this.models.length = 0);
								var y = x || r;
								for(e = 0, f = y.length; f > e; e++) this.models.push(y[e])
							}
						if(k && this.sort({
								silent: !0
							}), !b.silent) {
							for(e = 0, f = r.length; f > e; e++)(h = r[e]).trigger("add", h, this, b);
							(k || x && x.length) && this.trigger("sort", this, b)
						}
						return d ? a[0] : a
					},
					reset: function(a, b) {
						b || (b = {});
						for(var d = 0, e = this.models.length; e > d; d++) this._removeReference(this.models[d], b);
						return b.previousModels = this.models, this._reset(), a = this.add(a, c.extend({
							silent: !0
						}, b)), b.silent || this.trigger("reset", this, b), a
					},
					push: function(a, b) {
						return this.add(a, c.extend({
							at: this.length
						}, b))
					},
					pop: function(a) {
						var b = this.at(this.length - 1);
						return this.remove(b, a), b
					},
					unshift: function(a, b) {
						return this.add(a, c.extend({
							at: 0
						}, b))
					},
					shift: function(a) {
						var b = this.at(0);
						return this.remove(b, a), b
					},
					slice: function() {
						return g.apply(this.models, arguments)
					},
					get: function(a) {
						return null == a ? void 0 : this._byId[a] || this._byId[a.id] || this._byId[a.cid]
					},
					at: function(a) {
						return this.models[a]
					},
					where: function(a, b) {
						return c.isEmpty(a) ? b ? void 0 : [] : this[b ? "find" : "filter"](function(b) {
							for(var c in a)
								if(a[c] !== b.get(c)) return !1;
							return !0
						})
					},
					findWhere: function(a) {
						return this.where(a, !0);
					},
					sort: function(a) {
						if(!this.comparator) throw new Error("Cannot sort a set without a comparator");
						return a || (a = {}), c.isString(this.comparator) || 1 === this.comparator.length ? this.models = this.sortBy(this.comparator, this) : this.models.sort(c.bind(this.comparator, this)), a.silent || this.trigger("sort", this, a), this
					},
					pluck: function(a) {
						return c.invoke(this.models, "get", a)
					},
					fetch: function(a) {
						a = a ? c.clone(a) : {}, void 0 === a.parse && (a.parse = !0);
						var b = a.success,
							d = this;
						return a.success = function(c) {
							var e = a.reset ? "reset" : "set";
							d[e](c, a), b && b(d, c, a), d.trigger("sync", d, c, a)
						}, L(this, a), this.sync("read", this, a)
					},
					create: function(a, b) {
						if(b = b ? c.clone(b) : {}, !(a = this._prepareModel(a, b))) return !1;
						b.wait || this.add(a, b);
						var d = this,
							e = b.success;
						return b.success = function(a, c) {
							b.wait && d.add(a, b), e && e(a, c, b)
						}, a.save(null, b), a
					},
					parse: function(a, b) {
						return a
					},
					clone: function() {
						return new this.constructor(this.models)
					},
					_reset: function() {
						this.length = 0, this.models = [], this._byId = {}
					},
					_prepareModel: function(a, b) {
						if(a instanceof m) return a;
						b = b ? c.clone(b) : {}, b.collection = this;
						var d = new this.model(a, b);
						return d.validationError ? (this.trigger("invalid", this, d.validationError, b), !1) : d
					},
					_addReference: function(a, b) {
						this._byId[a.cid] = a, null != a.id && (this._byId[a.id] = a), a.collection || (a.collection = this), a.on("all", this._onModelEvent, this)
					},
					_removeReference: function(a, b) {
						this === a.collection && delete a.collection, a.off("all", this._onModelEvent, this)
					},
					_onModelEvent: function(a, b, c, d) {
						("add" !== a && "remove" !== a || c === this) && ("destroy" === a && this.remove(b, d), b && a === "change:" + b.idAttribute && (delete this._byId[b.previous(b.idAttribute)], null != b.id && (this._byId[b.id] = b)), this.trigger.apply(this, arguments))
					}
				});
				var r = ["forEach", "each", "map", "collect", "reduce", "foldl", "inject", "reduceRight", "foldr", "find", "detect", "filter", "select", "reject", "every", "all", "some", "any", "include", "contains", "invoke", "max", "min", "toArray", "size", "first", "head", "take", "initial", "rest", "tail", "drop", "last", "without", "difference", "indexOf", "shuffle", "lastIndexOf", "isEmpty", "chain", "sample"];
				c.each(r, function(a) {
					o.prototype[a] = function() {
						var b = g.call(arguments);
						return b.unshift(this.models), c[a].apply(c, b)
					}
				});
				var s = ["groupBy", "countBy", "sortBy", "indexBy"];
				c.each(s, function(a) {
					o.prototype[a] = function(b, d) {
						var e = c.isFunction(b) ? b : function(a) {
							return a.get(b)
						};
						return c[a](this.models, e, d)
					}
				});
				var t = b.View = function(a) {
						this.cid = c.uniqueId("view"), a || (a = {}), c.extend(this, c.pick(a, v)), this._ensureElement(), this.initialize.apply(this, arguments), this.delegateEvents()
					},
					u = /^(\S+)\s*(.*)$/,
					v = ["model", "collection", "el", "id", "attributes", "className", "tagName", "events"];
				c.extend(t.prototype, h, {
					tagName: "div",
					$: function(a) {
						return this.$el.find(a)
					},
					initialize: function() {},
					render: function() {
						return this
					},
					remove: function() {
						return this.$el.remove(), this.stopListening(), this
					},
					setElement: function(a, c) {
						return this.$el && this.undelegateEvents(), this.$el = a instanceof b.$ ? a : b.$(a), this.el = this.$el[0], c !== !1 && this.delegateEvents(), this
					},
					delegateEvents: function(a) {
						if(!a && !(a = c.result(this, "events"))) return this;
						this.undelegateEvents();
						for(var b in a) {
							var d = a[b];
							if(c.isFunction(d) || (d = this[a[b]]), d) {
								var e = b.match(u),
									f = e[1],
									g = e[2];
								d = c.bind(d, this), f += ".delegateEvents" + this.cid, "" === g ? this.$el.on(f, d) : this.$el.on(f, g, d)
							}
						}
						return this
					},
					undelegateEvents: function() {
						return this.$el.off(".delegateEvents" + this.cid), this
					},
					_ensureElement: function() {
						if(this.el) this.setElement(c.result(this, "el"), !1);
						else {
							var a = c.extend({}, c.result(this, "attributes"));
							this.id && (a.id = c.result(this, "id")), this.className && (a["class"] = c.result(this, "className"));
							var d = b.$("<" + c.result(this, "tagName") + ">").attr(a);
							this.setElement(d, !1)
						}
					}
				}), 
				b.sync = function(a, d, e) {
					var f = x[a];
					c.defaults(e || (e = {}), {
						emulateHTTP: b.emulateHTTP,
						emulateJSON: b.emulateJSON
					});
					var g = {
						type: f,
						dataType: "json"
					};
					if(e.url || (g.url = c.result(d, "url") || K()), null != e.data || !d || "create" !== a && "update" !== a && "patch" !== a || (g.contentType = "application/json", g.data = JSON.stringify(e.attrs || d.toJSON(e))), e.emulateJSON && (g.contentType = "application/x-www-form-urlencoded", g.data = g.data ? {
							model: g.data
						} : {}), e.emulateHTTP && ("PUT" === f || "DELETE" === f || "PATCH" === f)) {
						g.type = "POST", e.emulateJSON && (g.data._method = f);
						var h = e.beforeSend;
						e.beforeSend = function(a) {
							return a.setRequestHeader("X-HTTP-Method-Override", f), h ? h.apply(this, arguments) : void 0
						}
					}
					"GET" === g.type || e.emulateJSON || (g.processData = !1), "PATCH" === g.type && w && (g.xhr = function() {
						return new ActiveXObject("Microsoft.XMLHTTP")
					});
					var i = e.xhr = b.ajax(c.extend(g, e));
					return d.trigger("request", d, i, e), i
				};
				var w = !("undefined" == typeof window || !window.ActiveXObject || window.XMLHttpRequest && (new XMLHttpRequest).dispatchEvent),
					x = {
						create: "POST",
						update: "PUT",
						patch: "PATCH",
						"delete": "DELETE",
						read: "GET"
					};
				b.ajax = function() {
					return b.$.ajax.apply(b.$, arguments)
				};
				var y = b.Router = function(a) {
						a || (a = {}), a.routes && (this.routes = a.routes), this._bindRoutes(), this.initialize.apply(this, arguments)
					},
					z = /\((.*?)\)/g,
					A = /(\(\?)?:\w+/g,
					B = /\*\w+/g,
					C = /[\-{}\[\]+?.,\\\^$|#\s]/g;
				c.extend(y.prototype, h, {
					initialize: function() {},
					route: function(a, d, e) {
						c.isRegExp(a) || (a = this._routeToRegExp(a)), c.isFunction(d) && (e = d, d = ""), e || (e = this[d]);
						var f = this;
						return b.history.route(a, function(c) {
							var g = f._extractParameters(a, c);
							f.execute(e, g), f.trigger.apply(f, ["route:" + d].concat(g)), f.trigger("route", d, g), b.history.trigger("route", f, d, g)
						}), this
					},
					execute: function(a, b) {
						a && a.apply(this, b)
					},
					navigate: function(a, c) {
						return b.history.navigate(a, c), this
					},
					_bindRoutes: function() {
						if(this.routes) {
							this.routes = c.result(this, "routes");
							for(var a, b = c.keys(this.routes); null != (a = b.pop());) this.route(a, this.routes[a])
						}
					},
					_routeToRegExp: function(a) {
						return a = a.replace(C, "\\$&").replace(z, "(?:$1)?").replace(A, function(a, b) {
							return b ? a : "([^/?]+)"
						}).replace(B, "([^?]*?)"), new RegExp("^" + a + "(?:\\?([\\s\\S]*))?$")
					},
					_extractParameters: function(a, b) {
						var d = a.exec(b).slice(1);
						return c.map(d, function(a, b) {
							return b === d.length - 1 ? a || null : a ? decodeURIComponent(a) : null
						})
					}
				});
				var D = b.History = function() {
						this.handlers = [], c.bindAll(this, "checkUrl"), "undefined" != typeof window && (this.location = window.location, this.history = window.history)
					},
					E = /^[#\/]|\s+$/g,
					F = /^\/+|\/+$/g,
					G = /msie [\w.]+/,
					H = /\/$/,
					I = /#.*$/;
				D.started = !1, c.extend(D.prototype, h, {
					interval: 50,
					atRoot: function() {
						return this.location.pathname.replace(/[^\/]$/, "$&/") === this.root
					},
					getHash: function(a) {
						var b = (a || this).location.href.match(/#(.*)$/);
						return b ? b[1] : ""
					},
					getFragment: function(a, b) {
						if(null == a)
							if(this._hasPushState || !this._wantsHashChange || b) {
								a = decodeURI(this.location.pathname + this.location.search);
								var c = this.root.replace(H, "");
								a.indexOf(c) || (a = a.slice(c.length))
							} else a = this.getHash();
						return a.replace(E, "")
					},
					start: function(a) {
						if(D.started) throw new Error("Backbone.history has already been started");
						D.started = !0, this.options = c.extend({
							root: "/"
						}, this.options, a), this.root = this.options.root, this._wantsHashChange = this.options.hashChange !== !1, this._wantsPushState = !!this.options.pushState, this._hasPushState = !!(this.options.pushState && this.history && this.history.pushState);
						var d = this.getFragment(),
							e = document.documentMode,
							f = G.exec(navigator.userAgent.toLowerCase()) && (!e || 7 >= e);
						if(this.root = ("/" + this.root + "/").replace(F, "/"), f && this._wantsHashChange) {
							var g = b.$('<iframe src="javascript:0" tabindex="-1">');
							this.iframe = g.hide().appendTo("body")[0].contentWindow, this.navigate(d)
						}
						this._hasPushState ? b.$(window).on("popstate", this.checkUrl) : this._wantsHashChange && "onhashchange" in window && !f ? b.$(window).on("hashchange", this.checkUrl) : this._wantsHashChange && (this._checkUrlInterval = setInterval(this.checkUrl, this.interval)), this.fragment = d;
						var h = this.location;
						if(this._wantsHashChange && this._wantsPushState) {
							if(!this._hasPushState && !this.atRoot()) return this.fragment = this.getFragment(null, !0), this.location.replace(this.root + "#" + this.fragment), !0;
							this._hasPushState && this.atRoot() && h.hash && (this.fragment = this.getHash().replace(E, ""), this.history.replaceState({}, document.title, this.root + this.fragment))
						}
						return this.options.silent ? void 0 : this.loadUrl()
					},
					stop: function() {
						b.$(window).off("popstate", this.checkUrl).off("hashchange", this.checkUrl), this._checkUrlInterval && clearInterval(this._checkUrlInterval), D.started = !1
					},
					route: function(a, b) {
						this.handlers.unshift({
							route: a,
							callback: b
						})
					},
					checkUrl: function(a) {
						var b = this.getFragment();
						return b === this.fragment && this.iframe && (b = this.getFragment(this.getHash(this.iframe))), b === this.fragment ? !1 : (this.iframe && this.navigate(b), void this.loadUrl())
					},
					loadUrl: function(a) {
						return a = this.fragment = this.getFragment(a), c.any(this.handlers, function(b) {
							return b.route.test(a) ? (b.callback(a), !0) : void 0
						})
					},
					navigate: function(a, b) {
						if(!D.started) return !1;
						b && b !== !0 || (b = {
							trigger: !!b
						});
						var c = this.root + (a = this.getFragment(a || ""));
						if(a = a.replace(I, ""), this.fragment !== a) {
							if(this.fragment = a, "" === a && "/" !== c && (c = c.slice(0, -1)), this._hasPushState) this.history[b.replace ? "replaceState" : "pushState"]({}, document.title, c);
							else {
								if(!this._wantsHashChange) return this.location.assign(c);
								this._updateHash(this.location, a, b.replace), this.iframe && a !== this.getFragment(this.getHash(this.iframe)) && (b.replace || this.iframe.document.open().close(), this._updateHash(this.iframe.location, a, b.replace))
							}
							return b.trigger ? this.loadUrl(a) : void 0
						}
					},
					_updateHash: function(a, b, c) {
						if(c) {
							var d = a.href.replace(/(javascript:|#).*$/, "");
							a.replace(d + "#" + b)
						} else a.hash = "#" + b
					}
				}), b.history = new D;
				var J = function(a, b) {
					var d, e = this;
					d = a && c.has(a, "constructor") ? a.constructor : function() {
						return e.apply(this, arguments)
					}, c.extend(d, e, b);
					var f = function() {
						this.constructor = d
					};
					return f.prototype = e.prototype, d.prototype = new f, a && c.extend(d.prototype, a), d.__super__ = e.prototype, d
				};
				m.extend = o.extend = y.extend = t.extend = D.extend = J;
				var K = function() {
						throw new Error('A "url" property or function must be specified')
					},
					L = function(a, b) {
						var c = b.error;
						b.error = function(d) {
							c && c(a, d, b), a.trigger("error", a, d, b)
						}
					};
				return b
			}), 
			
			window.LightNavi = window.LightNavi || {};
			
			LightNavi.mapApp = function() {
				var a, b, c, d, e = Backbone.Model.extend({
						initialize: function() {
							var a = this,
								b = _.extend({}, LightNavi.config);
							b.radius <= 0 ? b.radius = "3000" : b.radius >= 5e4 ? b.radius = "50000" : b.radius || (b.radius = "1000");
							var c = parseInt(b.total) || 20;
							this.on("change:pickCenter", function() {
								var d = this.get("pickCenter"),
									e = this.get("search_key") || "",
									f = {
										pageSize: c,
										pageIndex: 1,
										extensions:'all'
									};
								AMap.service(["AMap.PlaceSearch"], function() {
									var c = new AMap.PlaceSearch(f),
										g = d;
									c.searchNearBy(e, g, b.radius, function(b, c) {
										a.set("poiData", c)
									})
								})
							}), this.on("change:search_key", function() {
								var d = this.get("pickCenter"),
									e = this.get("search_key") || "",
									f = {
										pageSize: c,
										pageIndex: 1,
										extensions:'all'
									};
								AMap.service(["AMap.PlaceSearch"], function() {
									var c = new AMap.PlaceSearch(f),
										g = d;
									c.searchNearBy(e, g, b.radius, function(b, c) {
										a.set("poiData", c)
									})
								})
							}), this.on("change:search_tips", function() {
								var b = (this.get("pickCenter"), this.get("search_tips") || "");
								AMap.service(["AMap.Autocomplete"], function() {
									var c = new AMap.Autocomplete({});
									c.search(b, function(b, c) {
										a.set("poiData_searchpage", c)
									})
								})
							})
						}
					}),
					f = Backbone.View.extend({
						el: "#light-navi-wrapper",
						events: {
							"click .J_tab": "switchTab",
							"click .J_returnLng": "resultLng",
							"click .J_commonInput": "goSearch",
							"click .back": "commonBack",
							"click .J_searchBack": "searchBack",
							"input .J_commonInput": "inputKeyword",
							"click .J_showSearch": "showSearch",
							"click .J_poiCustom": "poiCustom",
							"click .J_customBack": "customBack",
							
							"click .J_clearInput": "clearInput",
							"click #map-locate": "locateByself",
							"click #map-locate-custom": "locateByself_custom",
							"click .J_returnLngToIndex": "returnLngToIndex"
						},
						template: {
							"poi-body": _.template($("#poi-body-template").html()),
							"poi-body-tab": _.template($("#poi-bodyTab-template").html()),
							"poi-body-search": _.template($("#poiSearch-body-template").html()),
							custom_tips: _.template($("#map-view-custom-template").html())
						},
						initialize: function() {
							window.addEventListener("message", function(a) {
								b = a.origin
							}, !1), this.listenTo(this.model, "change:poiData", this.keywordsChanged), this.listenTo(this.model, "change:poiData_searchpage", this.keywordsChanged_searchpage), this.buildMapView(), this.addHeader()
						},
						resultLng: function(a) {
							var c = $(a.currentTarget),
								d = c.data("lng"),
								e = c.data("lat"),
								f = c.children().children(".poicard-name").text() || "",
								g = c.children().children(".poicard-addr").text() || "",
								h = d + "," + e;
								
								var obj = $.extend({},JSON.parse(localStorage.getItem("addObj")), c.data("data"));
								
								localStorage.setItem("addObj",JSON.stringify(obj))
								
								if (pub.isApp()) {
									try{
										pub.goBackApp({
											num:1,
											type:1,
											url:!pub.searchAddr ? 'html/address.html' : 'html/address.html?addr=' + pub.searchAddr
											//callBackName:'pub.init()'
										})
									}catch(e){
										
									}
								}else{
									//window.location.replace( 'address.html?addr=addr&dom=dom' + Math.floor(Math.random() * 100000 ) );
								}
							try {
								window.top.postMessage({
									name: f,
									location: h,
									address: g
								}, b);
								
							} catch(a) {}
						},
						keywordsChanged: function() {
							var a = this.model.toJSON(),
								b = a.poiData.poiList;
							if(b) {
								var c = this.template["poi-body"](b);
								
								$(".poi-card-main").html(c);
								$("div.back").css("display","none");
								$(".a.amap-logo").css("display","none");
							} else $(".poi-card-main").html('<div class="noresult">未找到结果</div>')
						},
						keywordsChanged_searchpage: function() {
							var a = this.model.toJSON(),
								b = a.poiData_searchpage.tips;
							if(b && b.length > 0) {
								var c = this.template["poi-body-search"]({
									tips: b
								});
								$(".search_page").html(c)
							} else $(".search_page").html('<div class="noresult J_poiCustom">没找到你的地址？<span class=""> 去手动定位> </span></div>')
						},
						showSearch: function() {
							var a = $(".J_commonInput").val();
							a ? ($(".clearBtn").css("display", "block"), this.model.set("search_tips", a)) : $(".clearBtn").css("display", "none")
						},
						buildMapView: function() {
							var a = $("#map-view");
							$("#poi-footer");
							a = $($("#map-view-template").html()).appendTo(".main-body"), this.initAMap()
						},
						locationByHTML: function(a, b) {
							
							try{
								if (pub.isWeiXin()) {
									try{
										pub.wx.getLocation({
											type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
											success: function (res) {
												var latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
												var longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
												var speed = res.speed; // 速度，以米/每秒计
												var accuracy = res.accuracy; // 位置精度
												
												a([longitude, latitude])
											},
											fail:function(err){
												console.log(err);
												
											},
											complete:function(info){
												console.log(info)
												
											}
										});
									}catch(e){
										
									}
								}else{
									
									if(pub.isApp()){
										pub.appLocation = a;
										pub.appLocationInit();
										
									}else{
										navigator.geolocation.getCurrentPosition(function(b) {
											var c = b.coords,
												d = [c.longitude, c.latitude];
											
											AMap.convertFrom(d, "gps", function(b, c) {
												if(c && c.locations) {
													var d = c.locations[0];
													a([d.lng, d.lat])
												}
											})
										}, function(a) {
											b(a)
										}, {
											enableHighAccuracy: true,
											timeout: 3e3,
											maximumAge: 6e13
										})
									}
									
								}
							}catch(e){
								//TODO handle the exception
								
							}
							
							
							
						},
						drawMarker: function(a, b) {
							if("index" == b) var e = d,
								f = '<div class="marker-point"></div>';
							else if("custom" == b) var e = c,
								f = '<div class="marker-point"></div>';
							var a = new AMap.LngLat(a[0], a[1]);
							new AMap.Marker({
								map: e,
								content: f,
								position: a,
								offset: new AMap.Pixel(-6, -6)
							});
							e.panTo(a), setTimeout(function() {
								"index" == b ? $("#map-locate").addClass("located") : $("#map-locate-custom").addClass("located")
							}, 600)
						},
						initAMap: function() {
							function b() {
								$("#map-locate").removeClass("located");
								var a = c.getCenter(),
									a = [a.getLng(), a.getLat()];
								f.set("pickCenter", a)
							}
							var c, e = this,
								f = e.model,
								g = _.extend({}, LightNavi.config),
								h = g.zoom ? parseInt(g.zoom) : 16;
							if(c = new AMap.Map("map-view", {
									level: h,
									resizeEnable: !0
								}),
								d = c, 
								c.plugin(["AMap.Scale"], function() {
									c.addControl(new AMap.Scale)
								}),
								/*c.plugin(["AMap.Geolocation"], function() {
									c.addControl(new AMap.Geolocation)
								}),*/
								g.center) {
									var i = g.center.split(",");
									e.drawMarker(i, "index"), 
									a = i, 
									f.set("pickCenter", i)
							} else {
								e.locationByHTML(function(b) {
									f.set("pickCenter", b), e.drawMarker(b, "index"), a = b
								}, function(a) {
									var b = c.getCenter(),
										b = [b.getLng(), b.getLat()];
									f.set("pickCenter", b)
								});
							}
							c.on("moveend", b)
						},
						locateByself: function() {
							var b = this;
							
							a ? (d.panTo(a), $("#map-locate").addClass("located")) : b.locationByHTML(function(c) {
								b.drawMarker(c, "index"), a = c, b.model.set("pickCenter", c)
							}, function(a) {
							})
						},
						switchTab: function(a) {
							$(".poi-card-main").scrollTop(0);
							var b = $(a.currentTarget),
								c = b.text(),
								d = "全部" === c ? "" : c;
							b.addClass("active").siblings().removeClass("active"), this.model.set("search_key", d)
						},
						addHeader: function() {
							$($("#picker-header").html()).appendTo(".main-header");
							var a = _.extend({}, LightNavi.config),
								b = a.keywords && a.keywords.split(","),
								c = "";
							b = b && b.length > 0 ? b.slice(0, 3) : ["写字楼", "小区", "学校"];
							for(var d = 0; d < b.length; d++) c += d == b.length - 1 ? b[d] + "等" : b[d] + "/";
							var e = this.template["poi-body-tab"]({
								keywordsArray: b
							});
							$(".poi-card-header").html(e), $(".J_commonInput").attr("placeholder", c)
						},
						goSearch: function() {
							$(".picker-index").addClass("active"), $(".back").addClass("J_searchBack"), $(".clearBtn").css("display", "none"), 0 == $(".search_page").length && $(".main-body").append('<div class="search_page"></div>')
						},
						inputKeyword: function() {
							var a = $(".J_commonInput").val();
							a ? ($(".clearBtn").css("display", "block"), this.model.set("search_tips", a)) : $(".clearBtn").css("display", "none")
						},
						poiCustom: function() {
							var a = $(".J_commonInput").val();
							$(".main-body").append('<div class="custom_page"></div>'), $(".picker-index").removeClass("active").addClass("custom"), $(".back").removeClass("J_searchBack").addClass("J_customBack");
							var b = this.template.custom_tips({
								paramName: a || ""
							});
							$(".custom_page").html(b), this.initAMap_custom();
							$("div.back").css("display","none");
							$("a.amap-logo").css("display","none");
						},
						initAMap_custom: function() {
							function d() {
								$("#map-locate-custom").removeClass("located")
							}
							var e = this,
								f = (e.model, config.zoom ? parseInt(config.zoom) : 15),
								g = new AMap.Map("map-view-custom", {
									level: f,
									resizeEnable: !0
								});
							if(c = g, g.plugin(["AMap.Scale"], function() {
									g.addControl(new AMap.Scale)
								}), a) {
								var h = a;
								e.drawMarker(h, "custom")
							}
							$(".J_returnLng_custom").on("click", function() {
								var a = g.getCenter(),
									c = $(".picker_custom_name").text(),
									d = a.getLng() + "," + a.getLat();
								try {
									window.top.postMessage({
										name: c,
										location: d
									}, b)
								} catch(e) {}
							}), g.on("moveend", d)
						},
						locateByself_custom: function() {
							/*var b = this;
							a ? (c.panTo(a), $("#map-locate-custom").addClass("located")) : b.locationByHTML(function(c) {
								console.log(c);
								b.drawMarker(c, "custom"), a = c
							}, function(a) {
								console.log(a.code)
							})*/
						},
						returnLngToIndex: function(a) {
							this.model.set("search_tips", "");
							var b = $(a.currentTarget),
								c = b.data("lng"),
								e = b.data("lat");
							$(".search_page").remove(), $(".picker-index").removeClass("active");
							var f = new AMap.LngLat(c, e);
							d.panTo(f), $(".poi-card-main").scrollTop(0)
						},
						commonBack: function() {
							$(".J_commonInput").val("");
							
							if(!$(".picker-index").is(".active")){
								window.location.replace( 'address.html?addr=addr&dom=dom' + Math.floor(Math.random() * 100000 ) );
							}
						},
						searchBack: function() {
							this.model.set("search_tips", ""), $(".search_page").remove(), $(".picker-index").removeClass("active"),$(".back").removeClass("J_searchBack")
						},
						customBack: function() {
							$(".back").removeClass("J_customBack").addClass("J_searchBack"), $(".picker-index").removeClass("custom").addClass("active"), $(".custom_page").remove()
						},
						clearInput: function() {
							$(".clearBtn").css("display", "none"), $(".J_commonInput").val(""), $(".search_page").children().remove()
						}
					}),
					g = null;
				return function() {
					return g || (g = new f({
						model: new e
					}))
				}
			}();
		
			
			pub.init = function (){
				
				function a() {
					if (pub.isWeiXin()) {
						pub.wxConfig.init();
					}else{
						LightNavi.mapApp();
					}
				}
		
				function b(a) {
					var b = "",
						c = {};
					return a = a || window.location.search, b = a.slice(1), _.each(b.split("&"), function(a) {
						var b;
						a && (b = a.split("="), 2 === b.length && (c[b[0]] = decodeURIComponent(b[1])))
					}), c
				}
				config = b(),
				_.extend(LightNavi, {
					config: b()
				}), 
				$(document).ready(a)
			};
			//APP调用定位
			pub.appLocationInit = function(){
				pub.replaceLocationApp()
				setTimeout(function(){
					pub.locationInfo = localStorage.getItem("location");
					
					if (pub.locationInfo && JSON.parse(pub.locationInfo).longitude) {
						pub.appLocation([JSON.parse(pub.locationInfo).longitude , JSON.parse(pub.locationInfo).latitude]);
					}else{
						try {
							pub.replaceLocationApp();
						}catch(e){
						}
					}
				},500)
			}
			//保存定位的内部函数使用
			pub.appLocation = function(){
				
			}
			pub.init();
			window.pub = pub;
})