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
			common.API = "http://61.164.113.168:8090/grh_api/server/api.do"
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
	var locals = [
		'local', // 清空所有local
		'tokenId', // 存储 tokenId
		'secretKey', // 存储 secretKey
		'user_data', // 存储用户信息
		'jumpMake', // 跳转
		'orderType', // 1.普通商品 2.秒杀商品 3.预购商品
		'good', // 购物车商品信息
		'orderBack', // 订单入口 
		'openId',
		/*ios 不支持session 改为localstorage*/
		'addressData', // 存储地址数据
		'addType', // 标记地址管理页面入口 + 订单结算 tab 切换
		'orderCode',  // 订单码 / 编号
		'seckillGood',// 秒杀商品信息
		/*2017-09-21watm机修改添加*/
		'firmId',//门店ID
		'logined', // 登录状态 
		'firmIdType',//门店类型
		'websiteNode',//站点编码
		/*2017-10-24*/
		'orderColumn',// 订单 tab 
		'preColumn',// 预购订单 tab 
		/*2017-12-14*/
		'allMap',//所有门店地址
		'mapData',//点击当前门店的地址
		// app 端字段
		'appData',// 数据存储
		'gameType', // 标记游戏页面入口 + 果币商城切换
		'couponInfoList',//app存储优惠卷列表信息，
		'couponInfo',//app存储优惠卷信息，
		'addObj',//新增地图选择地址使用
		
	].forEach(function( item ){
		common[item] = new Memory( item, 'local' );
	});
	

	// session存储
	var sessions = [
		'session',// 清空所有session
		'first_data', // 
		'two_data',
		'goodid', // 标记临时 id 
		'seckill', // 换购 + 秒杀商品信息
		'sortCouponId',
		'location',
		'timestamp', // 
		'huanfu', //换肤管理
		
	].forEach(function( item ){
		common[item] = new Memory( item, 'session' );
	});
	
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
	};
	
	common.getNetwork = function(fn1,fn2){
		var imgEl = $("#netWork");
		var reg = /index\.html/g;
		var regHtml = /\.html/g;
		if (!regHtml.test(window.location.href)) {
			var imgPath = 'img/network.jpg';
		} else{
			if (reg.test(window.location.href)) {
				var imgPath = 'img/network.jpg';
			}else{
				var imgPath = '../img/network.jpg';
			}
		}
	    var timeStamp = Date.parse(new Date());
    	imgEl.attr("src", imgPath + "?timestamp=" + timeStamp);
    	
    	imgEl.on("error",function(){
    		fn2()
    	});
    	imgEl.on("load",function(){
    		fn1();
    	})	
	};

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
			if ($node) {
				$('.prompt').remove();
			}
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
			if (common.isPhone()) {
				if (common.isApple()) {
					try{
						window.webkit.messageHandlers.goToNextLevel.postMessage(jsonObj);
					}catch(err){
						console.log("调用ios方法goToNextLevel出错");
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
			type = num || 1;
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
		},
		/*-----2018-0702----*/
		StartToScanPageApp:function(title , url){
			
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
			if (common.isPhone()) {
				if (common.isApple()) {
					try{
						window.webkit.messageHandlers.StartToScanPage.postMessage(jsonObj);
					}catch(e){
						console.log("调用ios方法StartToScanPage出错")
					}
				} else if(common.isAndroid()){
					try{
						android.StartToScanPage(JSON.stringify(jsonObj))
					}catch(e){
						console.log("调用Android方法StartToScanPage出错")
					}
				}					
			}else{
				console.log("this is not grhao App!")
			}
		},
		cancelBackApp:function(){
			
			if (common.isPhone()) {
				if (common.isApple()) {
					try{
						window.webkit.messageHandlers.cancelBack.postMessage('');
					}catch(e){
						console.log("调用ios方法cancelBack出错")
					}
				} else if(common.isAndroid()){
					try{
						android.cancelBack()
					}catch(e){
						console.log("调用Android方法cancelBack出错")
					}
				}					
			}else{
				console.log("this is not grhao App!")
			}
		},
		
		confirmBackApp:function(opt){
			var title = opt.title,
				url = opt.url || window.location.href,
				callBackName = opt.callBackName;
			var jsonObj = {'title':title,"url":'/'+url,"callBack":callBackName};
			console.log(jsonObj)
			if (common.isPhone()) {
				if (common.isApple()) {
					try{
						window.webkit.messageHandlers.confirmBack.postMessage(jsonObj);
					}catch(e){
						console.log("调用ios方法confirmBack出错")
					}
				} else if(common.isAndroid()){
					try{
						android.confirmBack(JSON.stringify(jsonObj))
					}catch(e){
						console.log("调用Android方法confirmBack出错")
					}
				}					
			}else{
				console.log("this is not grhao App!")
			}
		},
		goBackCustomApp:function(opt){
			var title = opt.title,
				url = opt.url || window.location.href,
				callBackName = opt.callBackName;
			var jsonObj = {'title':title,"url":'/'+url,"callBack":callBackName};
			console.log(jsonObj)
			if (common.isPhone()) {
				if (common.isApple()) {
					try{
						window.webkit.messageHandlers.goBackCustom.postMessage(jsonObj);
					}catch(e){
						console.log("调用ios方法goBackCustom出错")
					}
				} else if(common.isAndroid()){
					try{
						android.goBackCustom(JSON.stringify(jsonObj))
					}catch(e){
						console.log("调用Android方法goBackCustom出错")
					}
				};
			}else{
				console.log("this is not grhao App!")
			}
		},
		jumpLinkCustomApp:function(opt){
			var title = opt.title,
				url = opt.url || window.location.href,
				txt = opt.txt || '',
				imgIcon = opt.imgIcon || '',
				callBackName = opt.callBackName || '';
			var jsonObj = {'title':title,"url":'/'+url,"txt":txt,"imgIcon":imgIcon,"callBack":callBackName};
			console.log(jsonObj)
			if (common.isPhone()) {
				if (common.isApple()) {
					try{
						window.webkit.messageHandlers.jumpLinkCustom.postMessage(jsonObj);
					}catch(e){
						console.log("调用ios方法jumpLinkCustom出错")
					}
				} else if(common.isAndroid()){
					try{
						android.jumpLinkCustom(JSON.stringify(jsonObj))
					}catch(e){
						console.log("调用Android方法jumpLinkCustom出错")
					}
				}					
			}else{
				console.log("this is not grhao App!")
			}
		},
		/*2018-0703新增调用APP端数据存储获取删除方法*/
		GetJSMethodApp:function( k ){
			if (common.isPhone()) {
				if (common.isApple()) {
					try{
						return window.webkit.messageHandlers.GetJSMethod.postMessage(k);
					}catch(e){
						console.log("调用ios方法GetJSMethod出错")
					}
				} else if(common.isAndroid()){
					try{
						return android.GetJSMethod(k);
					}catch(e){
						console.log("调用Android方法GetJSMethod出错")
					}
				}
			}else{
				console.log("this is not grhao App!")
			}
		},
		SetJSMethodApp:function( k , v ){
			if (common.isPhone()) {
				if (common.isApple()) {
					try{
						window.webkit.messageHandlers.SetJSMethod.postMessage(k,v);
					}catch(e){
						console.log("调用ios方法SetJSMethod出错")
					}
				} else if(common.isAndroid()){
					try{
						android.SetJSMethod(k,v)
					}catch(e){
						console.log("调用Android方法SetJSMethod出错")
					}
				}					
			}else{
				console.log("this is not grhao App!")
			}
		},
		ClearJSMethodApp:function( k ){
			if (common.isPhone()) {
				if (common.isApple()) {
					try{
						window.webkit.messageHandlers.ClearJSMethod.postMessage(k);
					}catch(e){
						console.log("调用ios方法ClearJSMethod出错")
					}
				} else if(common.isAndroid()){
					try{
						android.ClearJSMethod(JSON.stringify(k))
					}catch(e){
						console.log("调用Android方法ClearJSMethod出错")
					}
				}					
			}else{
				console.log("this is not grhao App!")
			}
		},
		getChangeSkin:function(){
			if (common.isPhone()) {
				common.creatScript();
				if (common.isApple()) {
					try{
						window.webkit.messageHandlers.getChangeSkin.postMessage('');
					}catch(e){
						console.log("调用ios方法replaceLocation出错")
					}
				} else if(common.isAndroid()){
					try{
						android.getChangeSkin()
					}catch(e){
						console.log("调用Android方法replaceLocation出错")
					}
				}
				common.defHuanfu.resolve();
			}else{
				console.log("this is not grhao App!")
			}
		},
		/*--------------尝试将所有的APP端交互统一处理---------------*/
		jsInteractiveApp : function(opt){
			var _this = this,
				name = opt.name,
				parameter = opt.parameter;
			var info = {};
				info.name = name;
			try{
				if (common.isApple()) {
					info.eq = 'ios';
				}
				if (common.isAndroid()) {
					info.eq = "android";
				}
				
				if (common.isApp()) {
					switch (name){
						//跳转下一页 ----->参数  title 标题 url 跳转链接
						case 'goToNextLevel':
							var jsonObj = {'title':parameter.title,"url":'/'+parameter.url};
							common.isApple() ? window.webkit.messageHandlers.goToNextLevel.postMessage(jsonObj) : android.goToNextLevel(JSON.stringify(jsonObj));
							break;
						//跳转到搜索页面
						case 'goToSearch':
							var jsonObj = '/'+parameter.url;
							common.isApple() ? window.webkit.messageHandlers.goToSearch.postMessage(jsonObj) : android.goToSearch(jsonObj);
							break;
						//返回上一级 ----->参数  'hierarchy':num 返回的层级数  'reload':type 返回后是否刷新  'url':返回的url  
						case 'goBack':
							var jsonObj = {'hierarchy':parameter.num,'reload':parameter.type,'url':'/'+parameter.url};
							
							common.isApple() ? window.webkit.messageHandlers.goBack.postMessage(jsonObj) : android.goBack(JSON.stringify(jsonObj));
							break;
						//返回主页面----->参数  无
						case 'goHome':
							common.isApple() ? window.webkit.messageHandlers.goHome.postMessage('') : android.goHome();
							break;
						//设置购物车商品数量----->参数 num Number类型
						case 'setShopCarNum':
							var jsonObj = parameter.num;
							common.isApple() ? window.webkit.messageHandlers.setShopCarNum.postMessage(jsonObj) : android.setShopCarNum(jsonObj);
							break;
						//设置购物车商品数量----->参数 num Number类型
						case 'setShopCarNum_ShoppingCart':
							var jsonObj = parameter.num;
							common.isApple() ? window.webkit.messageHandlers.setShopCarNum_ShoppingCart.postMessage(jsonObj) : android.setShopCarNum_ShoppingCart(jsonObj);
							break;
						//调用APP用户登录----->参数 无
						case 'wechatLogin':
							common.isApple() ? window.webkit.messageHandlers.wechatLogin.postMessage('') : android.wechatLogin();
							break;
						//显示遮罩----->参数 无
						case 'showDialog':
							common.isApple() ? window.webkit.messageHandlers.showDialog.postMessage('') : android.showDialog();
							break;
						//取消遮罩----->参数 无
						case 'cancelDialog':
							common.isApple() ? /*window.webkit.messageHandlers.cancelDialog.postMessage('')*/ console.log("ios not cancelDialog") : android.cancelDialog();
							break;
						//刷新APP----->参数 无
						case 'tellRefresh':
							common.isApple() ? window.webkit.messageHandlers.tellRefresh.postMessage('') : android.tellRefresh();
							break;
						//显示弹出框----->参数 type:1 弹框的类型  title:弹框的文本,canclefn:取消弹框的事件,truefn:确定弹框的事件
						case 'alertMask':
							var jsonObj = {type:parameter.type,title:parameter.title,canclefn:parameter.canclefn,truefn:parameter.truefn};
							common.isApple() ? window.webkit.messageHandlers.alertMask.postMessage(JSON.stringify(jsonObj)) : android.alertMask(JSON.stringify(jsonObj));
							break;
						//定位----->参数 无
						case 'replaceLocation':
							common.isApple() ? window.webkit.messageHandlers.replaceLocation.postMessage('') : android.replaceLocation();
							break;
						//调用扫码----->参数 title 跳转到页面的标题  url 跳转页面的URl
						case 'StartToScanPage':
							var jsonObj = {title:parameter.title,url:'/'+parameter.url}
							common.isApple() ? window.webkit.messageHandlers.StartToScanPage.postMessage(jsonObj) : android.StartToScanPage(JSON.stringify(jsonObj));
							break;
						//取消返回----->参数 无
						case 'cancelBack':
							common.isApple() ? window.webkit.messageHandlers.cancelBack.postMessage('') : android.cancelBack();
							break;
						//确认返回----->参数 title返回页面的标题  url 返回页面的url  callbackname  返回页面后的回调函数
						case 'confirmBack':
							var jsonObj = {title:parameter.title,url:'/'+parameter.url,callbackname:parameter.callbackname}
							common.isApple() ? window.webkit.messageHandlers.confirmBack.postMessage(jsonObj) : android.confirmBack(JSON.stringify(jsonObj));
							break;
						//原生返回按钮自定义回调----->参数  title返回页面的标题  url 返回页面的url  callbackname  返回页面后的回调函数
						case 'goBackCustom':
							var jsonObj = {title:parameter.title,url:'/'+parameter.url,callbackname:parameter.callbackname}
							common.isApple() ? window.webkit.messageHandlers.goBackCustom.postMessage(jsonObj) : android.goBackCustom(JSON.stringify(jsonObj));
							break;
						//跳转页面自定义----->参数 {'title':title,"url":'/'+url,"txt":txt,"imgIcon":imgIcon,"callBack":callBackName}; 
						case 'jumpLinkCustom':
							var jsonObj = {title:parameter.title,url:'/'+parameter.url,txt:parameter.txt,imgIcon:parameter.imgIcon,callBack:parameter.callBackName};
							common.isApple() ? window.webkit.messageHandlers.jumpLinkCustom.postMessage(jsonObj) : android.jumpLinkCustom(JSON.stringify(jsonObj));
							break;
						//获取APP存储----->参数 key
						case 'GetJSMethod':
							var key = parameter.key;
							common.isApple() ? window.webkit.messageHandlers.GetJSMethod.postMessage(key) : android.GetJSMethod(key);
							break;
						//设置APP存储----->参数 key value
						case 'SetJSMethod':
							var key = parameter.key,
								value = parameter.value;
							common.isApple() ? window.webkit.messageHandlers.SetJSMethod.postMessage(key,value) : android.SetJSMethod(key,value);
							break;
						//清除APP存储----->参数 key
						case 'ClearJSMethodApp':
							var key = parameter.key;
							common.isApple() ? window.webkit.messageHandlers.ClearJSMethodApp.postMessage(key) : android.ClearJSMethodApp(key);
							break;
						//换肤----->参数 无
						case 'getChangeSkin':
							common.isApple() ? window.webkit.messageHandlers.getChangeSkin.postMessage('') : android.getChangeSkin();
							break;
						//公用数据传给APP----->参数 无
						case 'getShare':
							var jsonObj = parameter.str;
							common.isApple() ? window.webkit.messageHandlers.getShare.postMessage(jsonObj) : android.getShare(jsonObj);
							break;	
						//分享----->参数 无
						case 'share':
							common.isApple() ? window.webkit.messageHandlers.share.postMessage('') : android.share();
							break;	
						//清除缓存----->参数 无
						case 'clearCache':
							common.isApple() ? window.webkit.messageHandlers.clearCache.postMessage('') : android.clearCache();
							break;
						//通知刷新 ----调用之后点击原生返回按钮  返回原页面刷新----->参数 无
						case 'noticeRefresh':
							common.isApple() ? window.webkit.messageHandlers.noticeRefresh.postMessage('') : android.noticeRefresh();
							break;
						//通知刷新 ----调用之后所有以及view刷新----->参数 无
						case 'tellRefreshAPP':
							common.isApple() ? window.webkit.messageHandlers.tellRefreshAPP.postMessage('') : android.tellRefreshAPP();
							break;
						//将登录的信息传递给APP----->参数 无
						case 'saveLoginInfo':
							var jsonObj = parameter.str;
							common.isApple() ? window.webkit.messageHandlers.saveLoginInfo.postMessage(jsonObj) : android.saveLoginInfo(jsonObj);
							break;
						//退出APP ----调用之后通知APP将缓存的用户数据清除----->参数 无
						case 'exit1':
							common.isApple() ? window.webkit.messageHandlers.exit1.postMessage('') : android.exit1();
							break;
						//微信登录
						case 'wxLoginApp':
							common.isApple() ? window.webkit.messageHandlers.wechatLogin.postMessage('') : android.wxLoginApp();
							break;
						default:
							break;
					}
				}else{
					info.msg = "this is not grhao App" 
				}
				
			}catch(e){
				console.warn(info)
			}finally{
				console.log(info)
			}
			
		},
		creatScript:function(){
			var html = '';
				html += '<script>'
				html +=	'function changeSkin(d){'
				html +=	'	sessionStorage.setItem("huanfu",JSON.parse(d).type);'
				html +=	'	pub.apiHandle.change_app_theme.init();'
				html +=	'}'
				html += '<\/script>'
			$("body").append(html)
		},
		prompt1 : function(opt){
			var obj = this,
	        	flag = opt.flag,
	        	msg = opt.msg,
	        	time = opt.time || 2000,
	        	callback = null || opt.callback;
		    if (!$('#modPromptDiv').length) {
	            $('body').append('<div id="modPromptDiv" class="mod_prompt" style="display: none;"></div><div id="modPromptMask" class="mod_prompt_mask" style="display: none;"></div>');
	        }else{
	        	$('#modPromptDiv').remove();
	        	$('body').append('<div id="modPromptDiv" class="mod_prompt" style="display: none;"></div><div id="modPromptMask" class="mod_prompt_mask" style="display: none;"></div>');
	        }
		    var $el = $('#modPromptDiv')
	          , $cover = $('#modPromptMask');
		    switch (flag) {
	        case 1:
	            $el.html('<p class="text">'+msg+'</p>');
	            break;
	        }
		    setTimeout(function() {
	            $el.addClass('show fixed').fadeIn(200,function(){
	            	setTimeout(function(){
	            		$el.remove();
	            		if (callback) {
	            			callback();
	            		}
	            	},time)
	            });
	            $cover.addClass('show fixed').fadeIn(200,function(){
	            	setTimeout(function(){
	            		$cover.remove()
	            	},time)
	            });
	        }, obj.isAndroid() ? 100 : 200);
	        
		},
		createPopup	: function(opt) {
	        var obj = this,
	        	flag = opt.flag,
	        	stopMove = opt.stopMove,
	        	msg = opt.msg,
	        	noCoverEvent = opt.noCoverEvent,
	        	stopMoveFun = function(e) {
		            e.preventDefault();
		        },
		        btnClose = false,
		        btnConfirm = false,
		        btnCancel = false,
		        btnEvent = function() {
	            	obj.setDelayTime();
	            	$('#modAlertDiv,#modAlertMask').hide().removeClass(' mod_alert_info show fixed');
	        	};
	        if (!$('#modAlertDiv').length) {
	            $('body').append('<div id="modAlertDiv" class="mod_alert" style="display: none;"></div><div id="modAlertMask" class="mod_alert_mask" style="display: none;"></div>');
	        }
	        var $el = $('#modAlertDiv')
	          , $cover = $('#modAlertMask');
	        switch (flag) {
	        case 1:
	            $el.html('<i class="icon"></i><p>您还没关注京东服务号，<br>关注后才可以收到微信提醒噢~</p><div class="follow"><img src="' + JD.img.getImgUrl('//img11.360buyimg.com/jdphoto/s280x280_jfs/t3469/354/312631197/5626/21e9275b/5806d31eN2884548b.png', 180, 180) + '" alt="京东二维码"><p class="text">长按二维码关注</p></div>');
	            break;
	        case 2:
	            $el.addClass('mod_alert_info');
	            $el.html('<span class="close"></span><h3 class="title">' + opt.title + '</h3><div class="inner">' + opt.msg + '</div>');
	            btnClose = 'span.close';
	            break;
	        case 3:
	            if (opt.isNeedInfo)
	                $el.addClass('mod_alert_info');
	            $el.html('<p>' + msg + '</p><p class="btns"><a href="javascript:void(0);" class="btn btn_1">' + (opt.btnTxt || '知道了') + '</a></p>');
	            btnConfirm = 'p.btns';
	            break;
	        case 4:
	            $el.html((opt.icon != 'none' ? ('<i class="icon' + (opt.icon != 'info' ? (' icon_' + opt.icon) : '') + '"></i>') : '') + '<p>' + msg + '</p><p class="btns"><a href="javascript:;" class="btn btn_2">' + opt.cancelText + '</a><a href="javascript:;" class="btn btn_1">' + opt.okText + '</a></p>');
	            btnConfirm = 'a.btn_1';
	            btnCancel = 'a.btn_2';
	            break;
	        case 5:
	            msg = '<i class="icon"></i><p>' + msg + '</p><div class="verify_input"><input class="input" type="text" id="verifyInput"><span class="wrap"><img src="' + (obj.priceVerify.img || '//fpoimg.com/75x30') + '" alt="点击刷新" id="verifyCodeImg"></span></div><p class="warn_text" id="warnTip">验证码错误，请重新输入</p>';
	            $el.html(msg + '<p class="btns"><a href="javascript:void(0);" class="btn btn_1">提交</a></p>');
	            break;
	        case 6:
	            $el.html('<span class="close"></span><i class="icon"></i><p>' + msg + '</p><p class="small">' + opt.small + '</p><p class="btns">' + '<a href="javascript:void(0);" class="btn" style="background: #e4393c;color: #fff">' + opt.btnTxt + '</a></p>');
	            btnClose = 'span.close';
	            btnConfirm = 'p.btns';
	            break;
	        case 7:
	            $el.addClass('mod_alert_info');
	            $el.html('<span class="close"></span><h3 class="title">手机号码登录</h3><div class="verify_inputs"><div class="verify_input"><input class="input" type="tel" mark="phonenum" placeholder="请输入手机号" maxlength="11"></div><div class="verify_input"><input class="input" mark="imgcode" type="text" placeholder="请输入图形码"><span class="wrap" mark="genimgcode"><img mark="img"/></span></div><div class="verify_input"><input class="input" mark="msgcode" type="text" placeholder="请输入验证码"><div class="verify_input_btn" mark="sendcode">发送验证码</div><div class="verify_input_btn type_disabled" style="display:none;"><span mark="sendcodesed"></span>后重发</div></div></div><p class="warn_text" style="display:none;" mark="errtips"></p><p class="btns"><a href="javascript:" class="btn btn_1">登录</a></p>');
	            btnClose = 'span.close';
	            btnConfirm = 'p.btns';
	            break;
	        case 8:
	            $el.addClass('mod_alert_info');
	            $el.html('<span class="close"></span><h3 class="title">历史收货人校验</h3><p class="alignLeft">您已有京东账号，为了保障账号安全，需要对您历史已完成订单的收货人信息进行校验（任意一个即可）</p><div class="verify_input type_no_padding"><input class="input" mark="shname" type="text" placeholder="历史完成订单的收货人姓名"></div><p class="warn_text" style="display:none;" mark="errtips"></p><p class="btns"><a href="javascript:" class="btn btn_1">完成校验去结算</a></p>');
	            btnClose = 'span.close';
	            btnConfirm = 'p.btns';
	            break;
	        case 9:
	            $el.html((opt.icon != 'none' ? ('<i class="icon' + (opt.icon != 'info' ? (' icon_' + opt.icon) : '') + '"></i>') : '') + '<p>' + msg + '</p><p class="btns"><a href="javascript:;" class="btn btn_1">' + opt.okText + '</a><a href="javascript:;" class="btn btn_2">' + opt.cancelText + '</a></p>');
	            btnConfirm = 'a.btn_1';
	            btnCancel = 'a.btn_2';
	            break;
	        }
	        
	        setTimeout(function() {
	            $el.show().addClass('show fixed');
	            $cover.show().addClass('show fixed');
	            
	        }, obj.isAndroid() ? 100 : 200);
	        
	        $el.off();
	        if (btnClose) {
	            $el.on('click', btnClose, function(e) {
	                btnEvent();
	                opt.onClose && opt.onClose();
	            });
	        }
	        if (btnConfirm) {
	            $el.on('click', btnConfirm, function() {
	                var keep = false;
	                if (opt.onConfirm) {
	                    keep = !!opt.onConfirm();
	                }
	                if (keep)
	                    return;
	                btnEvent();
	            });
	        }
	        if (btnCancel) {
	            $el.on('click', btnCancel, function() {
	                btnEvent();
	                opt.onCancel && opt.onCancel();
	            });
	        }
	        if (!noCoverEvent) {
	            $cover.off().on('click', function() {
	                btnEvent();
	                opt.onClose && opt.onClose();
	            });
	        }
	        console.log(new Date())
	       
	    },
	    createGamePopup : function(opt) {
	        var obj = this,
	        	flag = opt.flag,
	        	imgUrl = opt.imgUrl,
	        	msg = opt.msg,
	        	noCoverEvent = opt.noCoverEvent,
	        	stopMoveFun = function(e) {
		            e.preventDefault();
		        },
		        btnClose = false,
		        btnConfirm = false,
		        btnCancel = false,
		        btnEvent = function() {
	            	obj.setDelayTime();
	            	$('#modGameDiv,#modGameMask').hide().removeClass(' mod_alert_info show fixed');
	        	};
	        if (!$('#modGameDiv').length) {
	            $('body').append('<div id="modGameDiv" class="mod_game" style="display: none;"></div><div id="modGameMask" class="mod_game_mask" style="display: none;"></div>');
	        }
	        var $el = $('#modGameDiv')
	          , $cover = $('#modGameMask');
	        switch (flag) {
	        case 1:
	            $el.html('<span class="close"></span><div class="icon_box"><img src="'+imgUrl+'"/></div><div class="msg">'+msg+'</div><div class="btn" data-url="index.html">去使用</div>');
	            btnClose = 'span.close';
	            btnConfirm = 'div.btn'
	            break;
	        case 2:
	            $el.html('<span class="close"></span><div class="icon_box"><img src="'+imgUrl+'"/></div><div class="msg">'+msg+'</div>');
	            btnClose = 'span.close';
	            break;  
	        }
	         setTimeout(function() {
	            $el.show().addClass('show fixed');
	            $cover.show().addClass('show fixed');
	            
	        }, obj.isAndroid() ? 100 : 200);
	        
	        $el.off();
	        if (btnClose) {
	            $el.on('click', btnClose, function(e) {
	                btnEvent();
	                opt.onClose && opt.onClose();
	            });
	        }
	        if (btnConfirm) {
	            $el.on('click', btnConfirm, function() {
	                var keep = false;
	                if (opt.onConfirm) {
	                    keep = !!opt.onConfirm();
	                }
	                if (keep)
	                    return;
	                btnEvent();
	            });
	        }
	        if (!noCoverEvent) {
	            $cover.off().on('click', function() {
	                btnEvent();
	                opt.onClose && opt.onClose();
	            });
	        }
	        
	    },
		setDelayTime : function() {
	        window.holdAction = true;
	        setTimeout(function() {
	            window.holdAction = false;
	        }, 400);
	    },
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