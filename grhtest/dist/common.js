/*
* commom scirpt for Zhangshuo Guoranhao
*/ 
define(['jquery','mdData','shar1'],function($){
	// 命名空间 common = Zhangshuo
	var common = {};

	$.extend(common,{
		//EVE 作为正式环境和测试环境的开关，为true时为正式环境，为false时为测试环境
		EVE:false,
		//API : "http://api.grhao.com/server/api.do", // 接口地址
		//API : "http://61.164.118.194:8090/grh_api/server/api.do", // 测试地址
		// 每页显示的个数
		PAGE_SIZE : 10,
		// 页码索引
		PAGE_INDEX : 1,

		IS_TRUE : true,
		IS_FALSE : false,
		IS_ALERT : 0,
		SESSION_EXPIRE_CODE : '100400', // 过期状态码
		PAY_METHOD : 5, // 支付方式5.表示月卡支付 6.表示在线支付
		PICK_UP_METHOD : 1, //提货方式  默认为 1.门店自提，2.送货上门
		// 用户代理
		UA : navigator.userAgent.toLowerCase(),
		// 定时器ID
		TIMER_ID : null,
		// 密码 正则
		PWD_REG : /^[^\s]{6,20}$/,
		// 
		BANK_CARD_REG : /^\d{16}|\d{19}$/,
		// 手机号正则
		PHONE_NUMBER_REG : /^(13[0-9]|14[5|7]|15[0-9]|17[0-9]|18[0-9])\d{8}$/,
		// 身份证 正则
		ID_CARD_REG : /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/,
		//全局的延时函数
		DTD : $.Deferred(),
		//更新日期
		DATE:"0408",
	});
	//换肤延时对象
	common.defHuanfu = $.Deferred();
	
	(function(){
		if (common.EVE) {
			common.API = "http://api.grhao.com/server/api.do";
		}else{//http://61.164.118.194:8090/grh_api/server/api.do/192.168.1.3:80/192.168.1.8:8080
			common.API = "http://61.164.118.194:8090/grh_api/server/api.do"
		}
	})(common)

	// 构造HTML5存储方式 
	function Memory( key, way ){
	    this.way = way;
	    this.key = key;
	};
	Memory.prototype = {
		constructor : Memory,
	    map : {
	        'session' : window.sessionStorage,
	        'local' : window.localStorage
	    },
	    setItem : function( value ){
	        this.map[this.way].setItem( this.key, value )
	    },
	    getItem : function(){
	        return this.map[this.way].getItem( this.key );
	    },
	    removeItem : function(){
	        this.map[this.way].removeItem( this.key );
	    },
	    clear : function(){
	        this.map[this.way].clear();
	    },
	    getKey : function(){
	        return this.key in this.map[this.way];
	    }
	};

	/**
	 *	数据存储 统一管理
	*/
	
	var Local = [
		'local', // 清空所有local
		'tokenId', // 存储 tokenId
		'secretKey', // 存储 secretKey
		'user_data', // 存储用户信息
		'jumpMake', // 跳转
		'orderType', // 1.普通商品 2.秒杀商品 3.预购商品
		'good', // 购物车商品信息
		'orderBack', // 订单入口 
		'openId',
		'userId',
		'storeInfo', // 存数据信息
		'accountRelatived' // 账户关联
	]
	common.local = new Memory('clear','local'); // 清空所有local
	common.session = new Memory('clear','session'); // 清空所有session

	// local存储
	common.tokenId = new Memory('tokenId','local'); // 存储 tokenId
	common.secretKey = new Memory('secretKey','local'); // 存储 secretKey
	common.user_data = new Memory('user_data','local'); // 存储用户信息
	common.jumpMake = new Memory('jumpMake','local'); // 跳转
	common.orderType = new Memory('orderType','local'); // 1.普通商品 2.秒杀商品 3.预购商品
	common.good = new Memory('good','local'); // 购物车商品信息
	common.orderBack = new Memory('orderBack','local'); // 订单入口 
	
	common.openId = new Memory('openId','local'); //  
	/*ios 不支持session 改为localstorage*/
	common.addressData = new Memory('addressData','local'); // 存储地址数据
	common.addType = new Memory('addType','local');  // 标记地址管理页面入口 + 订单结算 tab 切换
	common.orderCode = new Memory('orderCode','local'); // 订单码 / 编号
	common.seckillGood = new Memory('seckillGood','local'); // 秒杀商品信息
	
	/*2017-09-21watm机修改添加*/
	common.firmId = new Memory('firmId','local')//门店ID
	common.logined = new Memory('logined','local'); // 登录状态 
	common.firmIdType = new Memory('firmIdType','local')//门店类型
	common.websiteNode = new Memory('websiteNode','local')//站点编码
	/*2017-10-24*/
	common.orderColumn = new Memory('orderColumn','local'); // 订单 tab 
	common.preColumn = new Memory('preColumn','local'); // 预购订单 tab 
	/*2017-12-14*/
	common.allMap = new Memory("allMap","local");//所有门店地址
	common.mapData = new Memory("mapData","local");//点击当前门店的地址

	// session存储
	common.first_data = new Memory('first_data','session'); //
	common.two_data = new Memory('two_data','session'); //
	common.goodid = new Memory('goodid','session'); // 标记临时 id 
	common.seckill = new Memory('seckill','session'); // 换购 + 秒杀
	//common.logined = new Memory('logined','session'); // 登录状态 
	common.sortCouponId = new Memory('sortCouponId','session');
	//common.addType = new Memory('addType','session');  // 标记地址管理页面入口 + 订单结算 tab 切换
	//common.addressData = new Memory('addressData','session'); // 存储地址数据

	//common.seckillGood = new Memory('seckillGood','session'); // 秒杀商品信息
	//common.orderCode = new Memory('orderCode','session'); // 订单码 / 编号

	//common.orderColumn = new Memory('orderColumn','session'); // 订单 tab 
	//common.preColumn = new Memory('preColumn','session'); // 预购订单 tab 

	common.location = new Memory('location','session');

	// app 端字段
	common.appData = new Memory('appData','local'); // 数据存储

	common.timestamp = new Memory('timestamp','session'); 

	common.huanfu = new Memory('huanfu','session');
	// 获取 tokenId 的值
	common.tokenIdfn = function(){
		if( this.tokenId.getKey() ){
			return this.tokenId.getItem();
		}
	};

	// 获取 secretKey 的值
	common.secretKeyfn = function(){
		if(this.secretKey.getKey()){
			return this.secretKey.getItem();
		}
	};

	// 全局设置ajax请求
	$.ajaxSetup({
		url: common.API,
		type: 'POST',
		dataType: 'jsonp'
	});

	// 统一接口处理函数
	common.ajaxPost = function(data, done, fail){
		done = typeof done !== 'function' ? function( d ){} : done;
		fail = typeof fail !== 'function' ? function( d ){common.prompt(d.statusStr);} : fail;
		$.ajax({
			data : data,
			success : done,
			error : fail
		});
	};

	common.autoLogin = function(){
		var data = {
			method : 'auto_login',
			tokenId : common.tokenIdfn()
		};
		common.ajaxPost(data,function(d){
			if ( d.statusCode != '100000' ) {
				common.prompt( d.statusStr );
				common.tokenId.removeItem();
				common.secretKey.removeItem();
				common.user_data.removeItem();
				common.session.clear();
			}else{
				var 
				infor = d.data.cuserInfo,
				user_data = {
				    cuserInfoid : infor.id,
				    firmId : infor.firmId,
				    faceImg : infor.faceImg,
				    petName : infor.petName,
				    realName : infor.realName,
				    idCard : infor.idcard,
				    mobile : infor.mobile,
				    sex : infor.sex
				};
				common.user_data.setItem( common.JSONStr(user_data) );
				localStorage.setItem('tokenId',d.data.tokenId)
				common.secretKey.setItem( d.data.secretKey );
				common.logined.setItem('logined');
			}
			common.DTD.resolve();

		},function(d){
			common.prompt(d.statusStr);
			common.tokenId.removeItem();
			common.secretKey.removeItem();
			common.user_data.removeItem();
			common.session.clear();
		});
	};
	common.change_app_theme = function(){
		common.ajaxPost({
			method : 'change_app_theme'
		},function( d ){
			if (d.statusCode == '100000') {
				sessionStorage.setItem("huanfu",d.data.type)
				common.defHuanfu.resolve();
			}
		});
	}

	$.extend(common,{

		// 自定义定时器
		setMyTimeout : function( fn, t ){
			this.TIMER_ID && clearTimeout(this.TIMER_ID);
			this.TIMER_ID = null;
			this.TIMER_ID = setTimeout( fn, t );
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
		// 判断环境是否为微信
		isWeiXin : function(){
			return this.UA.match(/MicroMessenger/i) == 'micromessenger';
		},
		// JSONstring to jsonObject
		JSONparse : function( jsonStr ){ 
			return JSON.parse( jsonStr );
		},

		// jsonObject to JSONstring
		JSONStr : function( json ){ 
			return JSON.stringify( json );
		},

		// 处理普通的页面跳转
		jumpLinkPlain : function( url ){
			url = url || window.location.href;
			window.location.href = url;
			return true; 
		},

		// 处理需要事件触发
		jumpLinkSpecial : function( ele, callback ){ 
			$( ele ).on('click',function(){
				typeof callback === 'function' ? callback() : common.jumpLinkPlain(callback);
			});
		},

		// 组织冒泡
		stopEventBubble : function(e){
			return e.stopPropagation();
		},

		// 判断是否已经登录
		isLogin : function(){
			return this.tokenId.getKey();
		},

		// banner轮播图
		bannerShow : function( data, box, callback, pagination ,isrefresh){
			isrefresh = isrefresh || false;
			pagination = pagination || '.swiper-pagination';
			var html = callback( data );
			$( box + " .swiper-wrapper" ).html( html );
			if(!isrefresh){
				window.mySwiper = mySwiper = new Swiper (box, {
				    direction: 'horizontal',
				    loop: true,
				    autoplay:5000,
				    autoplayDisableOnInteraction : false,
				    
				    pagination: pagination, // 如果需要分页器
				});
			}else{
				window.mySwiper.init();
			}
		},

		alertShow : function( ele, callback){
			$(ele).on('click',function(e){
	    		common.stopEventBubble(e);
	    		$('.alert_box,.my_bg').css({'display':'block'});
	  			$("body").css("overflow-y","hidden");
	  			if( typeof callback == "function" )  callback();
	    	});
		},

		alertHide : function(){
			$('.alert_delete').on('click',function(e){
	    		common.stopEventBubble(e);
	    		$('.alert_box,.my_bg').css({'display':'none'});
	  			$("body").css("overflow-y","auto")
	    	});
			$('.my_bg').on('click',function(e){
	    		common.stopEventBubble(e);
	    		$('.alert_box,.my_bg').css({'display':'none'});
	  			$("body").css("overflow-y","auto");
	    	});
		},

		// 弹窗
		nodeTemp : null,

		prompt : function( str, t ){
			var 
			promptNode = $('#prompt-node'),
			t = t || 2300;

			promptNode[0] && promptNode.remove();

			var promptNode = $('<div class="prompt" id="prompt-node"></div>').appendTo('body');

			promptNode.html( '<p>' + str + '</p>' )
			.css("margin-left",- promptNode.outerWidth() / 2 )
			.fadeIn(300);

			this.setMyTimeout(function(){
				common.nodeTemp = promptNode.remove();
				common.nodeTemp = null; 
			},t);
		},
		tip : function(str){
			var $node = $('.prompt');
			str = str || '已加入购物车';
			if($node[0]){
				return;
			}
			$('<div class="prompt" id="prompt-node"></div>').html('<p>' + str + '</p>').appendTo('body').show().css('margin-left',-92);
			this.setMyTimeout(function(){
				common.nodeTemp = $('.prompt').remove();
				common.nodeTemp = null; 
			},600);
		},
		getTotal : function(){
			var total = 0,i;
			if( !!localStorage.good ){
				var localGoodsList = JSON.parse( localStorage.good );
		    	for ( i in localGoodsList) {
		    		total += parseInt( localGoodsList[i].sum, 10 );
		    	}
		    	return total;
			}
			return 0;
		},
		getUrlParam : function ( mid ) {
            var reg = new RegExp("(^|&)" + mid + "=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if ( r != null ) 
            	return decodeURIComponent(r[2]); 
            return null;
        },

        user_datafn : function(){

			if ( common.user_data.getKey() ) {
				var userInfo = common.JSONparse( common.user_data.getItem() );
				return {
					cuserInfoid : userInfo.cuserInfoid,
					firmId : userInfo.firmId,
					faceImg : userInfo.faceImg,
					petName : userInfo.petName,
					realName : userInfo.realName,
					idCard : userInfo.idCard,
					mobile : userInfo.mobile,
					sex : userInfo.sex
				}
			}
		},

		// 懒加载
		lazyload : function(){

			var height = $(window).height();

			$(window).on('scroll',function(){
				var 
				len = $('.lazyload img[data-src]').length,
				top = $(this).scrollTop();
				len == 0 && $(window).off('scroll');

				$('.lazyload img[data-src]').each(function(){
					var
					$this = $(this), 
					offsetTop = $this.parents('dl').offset().top;
					$this.addClass('fadeIn');
					if( height + top > offsetTop  ){
						var dataSrc = $this.attr('data-src');
						$this.attr('src',dataSrc);
						$this.removeAttr('data-src');
					}					
				});
			});
		},

		// 加密
		pwdEncrypt : function(  val ){
			if( !val && val == 0  ) return;
			var md=md5(val);
			var sha=$.sha1(val);
			var pwdstr= sha + md;
			pwdstr = pwdstr.substring(0, 9) + "s" + pwdstr.substring(10, 19) + "h" + pwdstr.substring(20, 29) + "l" + pwdstr.substring(30, 39) + "s" + pwdstr.substring(40, 49) + "u" + pwdstr.substring(50, 59) + "n" + pwdstr.substring(60, 69) + "y" + pwdstr.substring(70, 72);
			pwdstr = pwdstr.substring(36, 72) + pwdstr.substring(0, 36);
			pwdstr = pwdstr.substring(0, 70);
			pwdstr = pwdstr.substring(0, 14) + "j" + pwdstr.substring(14, 28) + "x" + pwdstr.substring(28, 42) + "q" + pwdstr.substring(32, 46) + "y" + pwdstr.substring(56, 70) + "3";
			pwdstr = pwdstr.substring(40, 75) + pwdstr.substring(0, 40);
			return pwdstr
		},
		footerNav : function( fn ){
			$("#foot .footer_item").on('click',function(){
				var 
				i = $(this).index(),
				cur = $("#foot").find('.actived').index();
				if( i == cur ) return;
				fn(i);
		    });
		},
		toFixed : function( num, several){
			several = several || 2;
			if( typeof num != 'number') 
				return 0;
			return Number( num ).toFixed( several );
		},

		onceRun : function( fn, context ){
			return function(){
				if( typeof fn === 'function' ){
					fn.apply( context || this, arguments );
					fn = null;
				}
			}
		},
		historyReplace : function( pathName, data, title ){ 
			data = data || '';
			title = title || '';
			return window.history.replaceState( data, title, pathName );
		},
		fadeIn : function( el, t, fn ){
			el = el || 'body';
			t = t || 300;
			fn = typeof fn === 'function' ? fn : undefined;
			$( el ).fadeIn( t, fn );
		},
		clearData : function(){
			this.tokenId.removeItem();
			this.user_data.removeItem();
			this.secretKey.removeItem();
			this.session.clear();
		},
		getLink :function  (link){
			var wxUrl = '';
			if (common.EVE) {
				var wxUrl = 'weixin.grhao.com';
			}else{
				
			}
	 		var url = '';
	 		if (link) {
	 			if (link.indexOf(wxUrl) != -1) {
	 				url = link.substr((link.indexOf(wxUrl) + wxUrl.length))
	 				
	 			}else{
	 				url = '';
	 			}
	 		}
	 		return url
	 	},
		/*新添加的两个方法将所有页面的跳转改为此方法*/
		// 处理普通的页面跳转
		jumpLinkPlainApp : function( title , url ){
			url = url || window.location.href;
			if (common.DATE) {
				if (url.indexOf("?")>0) {
					url = url + "&v="+common.DATE;
				}else{
					url = url + "?v="+common.DATE;
				}
			}
			var jsonObj = {'title':title,"url":'/'+url};
			console.log(jsonObj)
			if (common.isApp()) {
				if (common.isApple()) {
					try{
						window.webkit.messageHandlers.goToNextLevel.postMessage(jsonObj);
					}catch(e){
						console.log("调用ios方法goToNextLevel出错")
					}
				} else if(common.isAndroid()){
					try{
						android.goToNextLevel(JSON.stringify(jsonObj))
					}catch(e){
						console.log("调用Android方法goToNextLevel出错");
					}
				}					
			}else{
				console.log("this is not grhao App!")
			}
		},
		// 处理需要事件触发
		jumpLinkSpecialApp : function( ele, title , callback ){ 
			$( ele ).on('click',function(){
				typeof callback === 'function' ? callback() : common.jumpLinkPlainApp( title , callback);
			});
		},
		historyReplaceApp:function(){
			
		},
		goBackApp:function(num,type,url){
			num = num || 1,
			type = num || true;
			var jsonObj = {'hierarchy':num,'reload':type,'url':'/'+url};
			if (common.isPhone()) {
				if (common.isApple()) {
					try{
						window.webkit.messageHandlers.goBack.postMessage(jsonObj);
					}catch(e){
						console.log("调用ios方法goBack出错")
					}
				} else if(common.isAndroid()){
					try{
						android.goBack(JSON.stringify(jsonObj))
					}catch(e){
						console.log("调用Android方法goBack出错")
					}
				}					
			}else{
				console.log("this is not grhao App!")
			}
		},
		goHomeApp:function(){
			if (common.isPhone()) {
				if (common.isApple()) {
					try{
						window.webkit.messageHandlers.goHome.postMessage('');
					}catch(e){
						console.log("调用ios方法goHome出错")
					}
				} else if(common.isAndroid()){
					try{
						android.goHome()
					}catch(e){
						console.log("调用Android方法goHome出错")
					}
				}					
			}else{
				console.log("this is not grhao App!")
			}
		},
		setShopCarNumApp:function(num){
			if (common.isPhone()) {
				if (common.isApple()) {
					try{
						window.webkit.messageHandlers.setShopCarNum.postMessage(num);
					}catch(e){
						console.log("调用ios方法setShopCarNum出错")
					}
				} else if(common.isAndroid()){
					try{
						android.setShopCarNum(num)
					}catch(e){
						console.log("调用Android方法setShopCarNum出错")
					}
				}					
			}else{
				console.log("this is not grhao App!")
			}
		},
		setShopCarNum_ShoppingCartApp:function(num){
			if (common.isPhone()) {
				if (common.isApple()) {
					try{
						window.webkit.messageHandlers.setShopCarNum_ShoppingCart.postMessage(num);
					}catch(e){
						console.log("调用ios方法setShopCarNum_ShoppingCart出错")
					}
				} else if(common.isAndroid()){
					try{
						android.setShopCarNum_ShoppingCart(num)
					}catch(e){
						console.log("调用Android方法setShopCarNum_ShoppingCart出错")
					}
				}					
			}else{
				console.log("this is not grhao App!")
			}
		},
		wxLoginApp:function(){
			if (common.isPhone()) {
				if (common.isApple()) {
					try{
						window.webkit.messageHandlers.wechatLogin.postMessage('');
					}catch(e){
						console.log("调用ios方法wxLoginApp出错")
					}
				} else if(common.isAndroid()){
					try{
						android.wxLoginApp()
					}catch(e){
						console.log("调用Android方法wxLoginApp出错")
					}
				}					
			}else{
				console.log("this is not grhao App!")
			}
		},
		showDialogApp:function(){
			if (common.isPhone()) {
				if (common.isApple()) {
					try{
						//window.webkit.messageHandlers.showDialog.postMessage();
					}catch(e){
						//console.log("调用ios方法showDialog出错")
					}
				} else if(common.isAndroid()){
					try{
						android.showDialog()
					}catch(e){
						console.log("调用Android方法showDialog出错")
					}
				}					
			}else{
				console.log("this is not grhao App!")
			}
		},
		cancelDialogApp:function(){
			if (common.isPhone()) {
				if (common.isApple()) {
					try{
						//window.webkit.messageHandlers.cancelDialog.postMessage();
					}catch(e){
						console.log("调用ios方法cancelDialog出错")
					}
				} else if(common.isAndroid()){
					try{
						android.cancelDialog()
					}catch(e){
						console.log("调用Android方法cancelDialog出错")
					}
				}					
			}else{
				console.log("this is not grhao App!")
			}
		},
		tellRefreshAPP:function (){
			if (common.isPhone()) {
				if (common.isApple()) {
					try{
						window.webkit.messageHandlers.tellRefresh.postMessage('');
					}catch(e){
						console.log("调用IOS方法tellRefresh失败")
					}
				}else if (common.isAndroid()){
					try{
						android.tellRefresh();
					}catch(e){
						console.log("调用Android方法tellRefresh失败")
					}
				}
			}else{
				console.log("this is not grhao App!")
			}
		},
		alertMaskApp:function(str){
			if (common.isPhone()) {
				if (common.isApple()) {
					try{
						window.webkit.messageHandlers.alertMask.postMessage(str);
					}catch(e){
						console.log("调用ios方法alertMask出错")
					}
				} else if(common.isAndroid()){
					try{
						android.alertMask(str)
					}catch(e){
						console.log("调用Android方法alertMask出错")
					}
				}					
			}else{
				console.log("this is not grhao App!")
			}
		},
		replaceLocationApp:function(){
			if (common.isPhone()) {
				if (common.isApple()) {
					try{
						window.webkit.messageHandlers.replaceLocation.postMessage('');
					}catch(e){
						console.log("调用ios方法replaceLocation出错")
					}
				} else if(common.isAndroid()){
					try{
						android.replaceLocation()
					}catch(e){
						console.log("调用Android方法replaceLocation出错")
					}
				}					
			}else{
				console.log("this is not grhao App!")
			}
		}
	});

	$(document).on('click','#prompt-node',function(){
		var nodeTemp = $(this).remove();
		nodeTemp = null;
	});
	/*(function(){
		var m = document.createElement("meta"),
			h = document.getElementsByTagName("head")[0];
			m.setAttribute("http-equiv","Content-Security-Policy");
		if (common.EVE) {
			m.setAttribute("content","script-src 'self' 'unsafe-inline' 'unsafe-eval' http://webapi.amap.com/ http://restapi.amap.com/ http://api.grhao.com/server/api.do; style-src 'self' 'unsafe-inline' 'unsafe-eval' http://webapi.amap.com/theme/v1.3/style1503546983737.css");
		}else{
			m.setAttribute("content","script-src 'self' 'unsafe-inline' 'unsafe-eval' http://restapi.amap.com/ http://webapi.amap.com/ http://61.164.118.194:8090/grh_api/server/api.do; style-src 'self' 'unsafe-inline' 'unsafe-eval' http://webapi.amap.com/theme/v1.3/style1503546983737.css");
		}
		
		var t = window.location.href;
		console.log(t.indexOf("store_map"));
		if(t.indexOf("store_map") < 0){
			h.appendChild(m)
		}
	})(common)*/
	return common;
});