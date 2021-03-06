/*
* 	index scirpt for Zhangshuo Guoranhao
*/ 

require(['../require/config'],function () {
	require(['common','mobileUi','swiperJS','pull'],function(common){
		
		
		
		var pub = {};
	
		pub.openId = common.openId.getItem();
		
		pub.logined = common.isLogin(); // 已经登录
		
		pub.isrefresh = false;//判断banner轮播是否是刷新操作；
		
		pub.paramListInit = function(){
				
		 	pub.logined && common.autoLogin();
		 	
		 	pub.firmId = ( common.firmId.getItem() ? common.firmId.getItem() : null)// 门店ID
		 	
		 	pub.websiteNode = common.websiteNode.getItem() ? common.websiteNode.getItem() : null;//站点
		 	
		};
		if( pub.logined ){
	 		pub.userId = common.user_datafn().cuserInfoid;
			pub.source = "userId" + pub.userId;
			pub.sign = md5( pub.source + "key" + common.secretKeyfn() ).toUpperCase();
			pub.tokenId = common.tokenIdfn();
			pub.userBasicParam = {
				userId : pub.userId,
				source : pub.source,
				sign : pub.sign,
				tokenId : pub.tokenId
			}
	 	}
	 	// 接口处理命名空间
	 	pub.apiHandle = {};
	
	 	pub.apiHandle.init = function(){
	 		var me = this;
	 		
	 		if (pub.logined) {
	 			common.DTD.done(function(){
	 				me.firm_default.init(); // 默认门店
		 			if (common.user_datafn().firmId == '0') {//注册的情况下将APP本地门店ID赋值给当前用户
		 				pub.apiHandle.choice_firm.init();
		 			}else {//登录的情况下
		 				if (common.firmId.getItem() != common.user_datafn().firmId) {
		 					var data = {
								type:1,
								title:'是否切换为已绑定门店?',
								canclefn:'cancleFn',
								truefn:'trueFn'
							}
							common.alertMaskApp(JSON.stringify(data));
		 				}
			 		}
	 			})
	 		}else{
	 			me.firm_default.init(); // 默认门店
	 			if(!common.firmId.getItem()){
	 				var data = {
						type:1,
						title:'请选择门店',
						canclefn:'cancleFn1',
						truefn:'trueFn1'
					}
					common.alertMaskApp(JSON.stringify(data));
	 			}
	 		}
	 		
	 	};
	 	// 默认门店
	 	pub.apiHandle.firm_default = {
	 		// 默认门店初始化函数
	 		init : function(){
	 			common.ajaxPost({
	 				method : 'firm_default',
	 				firmId : pub.firmId
		 		},function(d){
		 			d.statusCode == "100000" && pub.apiHandle.firm_default.apiData( d );
		 			d.statusCode == common.SESSION_EXPIRE_CODE && common.clearData();
		 		});
	 		},
	
	 		// 默认门店 + 用户门店 接口返回数据处理
	 		apiData : function( data ){
	 			var 
	 			d = data.data[0] || data.data,
		 		pNode = $('.index_tit p'),
		 		spanNode = pNode.eq(0).find("span");
		 		spanNode.eq(0).html( d.cityName ).next().html( d.countyName );
				pNode.eq(1).html( d.firmName );
				
				common.firmId.setItem(d.id);
				pub.firmId = d.id;
				common.websiteNode.setItem(d.websiteNode);
				pub.websiteNode = d.websiteNode;
				
				/*if(pub.logined){
					var user_data = common.user_datafn();
					user_data.firmId = pub.firmId;
					common.user_data.setItem( common.JSONStr( user_data ) );
				}*/
				
				
				pub.apiHandle.main_page_goods.init();
				pub.apiHandle.custom_activity_firm_list.init()
				common.firmIdType.setItem(d.type);
				var Node = $(".index_center_wrap dl");
				if (d.type == 5) {
					Node.addClass("notClick");
				}else{
					Node.removeClass("notClick");
				}
	 		}
	 	},
	 	pub.apiHandle.choice_firm = {
			init : function(){
				common.ajaxPost($.extend({},pub.userBasicParam,{
					method : 'choice_firm',
					firmId : pub.firmId
				}),function( d ){
					if( d.statusCode == "100000" ){
						var user_data = common.user_datafn();
						user_data.firmId = pub.firmId;
						common.tellRefreshAPP()
						common.user_data.setItem( common.JSONStr( user_data ) );
						/*if (common.good.getItem()) {
							console.log("切换门店清除购物车");
							common.good.removeItem();
							common.setShopCarNumApp(0)
						}*/
					}else if(d.statusCode == '100901'){
						var data = {
							type:2,
							title:'请选择门店?',
							canclefn:'cancleFn',
							truefn:'trueFn1'
						}
						common.alertMaskApp(JSON.stringify(data));
					}else{
						common.prompt(d.statusStr)
					}
				})
			}
		},
	 	// 首页商品列表
	 	pub.apiHandle.main_page_goods = {
	 		init : function(){
	 			var me = this;
	 			common.ajaxPost({
	 				method : 'main_page_goods',
	 				firmId:pub.firmId,
	 				websiteNode:pub.websiteNode
		 		},function( d ){
		 			d.statusCode == "100000" && me.apiData( d );
		 			d.statusCode != "100000" && common.cancelDialogApp();
		 			d.statusCode != "100000" && $(".index_inner,.swiper-wrapper,.swiper-pagination").html('') && common.prompt(d.statusStr);
		 			d.statusCode == common.SESSION_EXPIRE_CODE && common.clearData();
		 			
		 		});
	 		},
	 		apiDataDeal : function( data ){
				var 
				html = '',
				goodsInfo = '';
				for(var i in data) {
					goodsInfo = data[i].goodsInfo;
					var arr = [];
					goodsInfo.isHot == 1 && arr.push('isHot');
					goodsInfo.isNew == 1 && arr.push('isNew');
					goodsInfo.isRecommend == 1 && arr.push('isRecommend');
					goodsInfo.isSale == 1  && arr.push('isSale');
	
					html += '<dl data="' + goodsInfo.id + '">'
					html += '	<dt>'
	
					if( i < 6 ){
						html += '		<img src="' + goodsInfo.goodsLogo + '"/>'
						html += '<div class="box">'
						for(var k = 0; k < arr.length; k++){ html += '		<span class="goodSatce ' + arr[k] + '"></span>' }
						html += '</div>'
					}else{
						html += '		<img data-src="' + goodsInfo.goodsLogo + '"/>'
						html += '<div class="box">'
						for( var k = 0; k < arr.length; k++ ){ html += '		<span class="goodSatce ' + arr[k] + '"></span>' }
						html += '</div>'
					}
					html += '	</dt>'
					html += '	<dd>'
					html += '		<p>' + goodsInfo.goodsName + '</p>'
					html += '		<p class="clearfloat">'
					html += '			<span class="float_left" style="padding-left:20px;width:115px;text-align:left">'+ goodsInfo.specInfo + '</span>'
					html += '			<span class="float_right" style="color:rgb(254,120,49);padding-right:15px;width:118px;text-align:right;">￥'+ goodsInfo.nowPrice + '</span>'
					html += '		</p>'
					html += '	</dd>'
					html += '</dl>'
				}
				$(".index_inner").height( ( Math.ceil(data.length / 3 )) * 320 ).html( html ).find('img[src]').addClass('fadeIn');
				common.cancelDialogApp();
				
	 		},
	 		apiData : function( d ){
	 			var json = {};
	 			var 
	 			me = this,
				data = d.data;
	
	 			if( !common.timestamp.getKey() && data.adInfoList.length != 0 && data.mainPageGoodsDetails.length != 0 ){
	 				json.timestamp = Date.now() + 3 * 60 * 1000;
	 				json.con = d;
	 				common.timestamp.setItem( common.JSONStr( json ) );
	 			}
	
				
				
				data.adInfoList.length != 0 && common.bannerShow(data.adInfoList, '.index_banner', function( d ){
					var html = '', i = 0, link = null;
					for ( i in d ){
						link = getLink(d[i].linkUrl)
						html += '<div class="swiper-slide"><a href="javascript:void(0)" url="'+link+'"><img src="' + d[i].adLogo + '" /></a></div>'
					}
					return html;
				},'.swiper-pagination',pub.isrefresh);
				data.mainPageGoodsDetails.length == 0 && $(".index_inner").html("");
				data.mainPageGoodsDetails.length != 0 && me.apiDataDeal( data.mainPageGoodsDetails );
			 	//pub.myScroll.refresh();
			 	/*if (pub.isrefresh) {
			 		pub.iscroll.resetload();
                    common.lazyload(); // 懒加载
			 	}*/
			 	if(pub.isrefresh){
			 		pub.pullInstance.pullDownSuccess();
			 		common.lazyload(); // 懒加载
			 	}
			 	function getLink (link){
			 		var wxUrl = 'weixin.grhao.com';
			 		var url = '';
			 		if (link) {
			 			if (link.indexOf(wxUrl) != -1) {
			 				url = link.substr((link.indexOf(wxUrl) + wxUrl.length))
			 			}else{
			 				url = '';
			 			}
			 		}
			 		return url
			 	}
	 		}
	 	};
		
		//首页活动list
		pub.apiHandle.custom_activity_firm_list = {
			init:function(){
				common.ajaxPost({
	 				method : 'custom_activity_firm_list',
	 				firmId:pub.firmId,
	 				//websiteNode:pub.websiteNode
		 		},function( d ){
		 			d.statusCode == "100000" && pub.apiHandle.custom_activity_firm_list.apiData( d );
		 			//d.statusCode != "100000" && common.cancelDialogApp();
		 			d.statusCode != "100000" &&  common.prompt(d.statusStr);
		 			//d.statusCode == common.SESSION_EXPIRE_CODE && common.clearData();
		 			
		 		});
			},
			apiData:function(d){
				var o = d.data,html = '',link = null;
				if ( o == null || o.length == 0) {
					$(".index_center_wrap").addClass("hidden");
				} else{
					for (var i in o) {
						link = o[i].appUrl ? o[i].appUrl : '';
						html += '<dl class="swiper-slide" link = "'+link+'" tit= "'+o[i].name+'"><dt><img src="'+o[i].logo+'"/></dt><dd class="ellipsis">'+o[i].name+'</dd></dl>'
					}
				}
				$(".index_center_banner .swiper-wrapper").html(html)
				var swiper = new Swiper(".index_center_banner",{
					direction: 'horizontal',
					slidesPerView : 4,
				});
			}
		}
	 	// app 参数
	 	pub.apiHandle.system_config_constant = {
	 		init : function(){
	 			var me = this;
	 			common.ajaxPost({
	 				method:'system_config_constant'
	 			},function( d ){
	 				d.statusCode == "100000" && me.apiData( d );
	 			});
	 		},
	 		apiData : function( d ){
	 			var dStr;
	 			if( d == true ){
	 				dStr = common.appData.getItem();
	 			}else{
		 			dStr = common.JSONStr( d );
		 			common.appData.setItem( dStr ); 
	 			}
	 			try{
					common.isAndroid() ? android.getShare( dStr ) : window.webkit.messageHandlers.getShare.postMessage(dStr);
				}catch(e){}
	
	 		}
	 	};
	
		//确定方法
		pub.apiHandle.trueFn = function(){
			pub.firmId = common.user_datafn().firmId;
			common.firmId.setItem(common.user_datafn().firmId);
			common.good.removeItem();
			common.setShopCarNumApp(0);
			pub.apiHandle.firm_default.init();
		}
		pub.apiHandle.trueFn1 = function(){
			common.jumpLinkPlainApp('门店选择','html/store1.html');
		}
		//取消方法
		pub.apiHandle.cancleFn = function(){
			pub.apiHandle.choice_firm.init()
		}
	 	// 事件处理初始化
		pub.eventHandle = {
			
			init : function(){
				//点击跳转详情页面
				$('.index_inner').on('click', "dl", function() {
					common.jumpLinkPlainApp( "商品详情", "html/goodsDetails.html?goodsId=" + $(this).attr("data") );
				});
	
				/*$(".index_center_wrap").on('click', "dl", function() {
					if(!$(this).is(".notClick")){
						common.first_data.removeItem();
						common.two_data.removeItem();
						var i = $(this).attr("data");
						var pathNameTitle = ['礼盒套餐','钜惠活动','秒杀换购','预购活动']
						var pathNames = ["html/moregoods.html?type=TAO_CAN","html/moregoods.html?type=JU_HUI","html/seckill.html","html/pre.html"];
						i == "3" && common.seckill.setItem('1');
						common.jumpLinkPlainApp( pathNameTitle[i -1],pathNames[ i - 1 ] );	
					}
				});
				$(".index_center_wrap").on('click', ".index_center_center", function() {
					common.jumpLinkPlainApp("充值优惠","html/month_service.html");
				});*/
				$(".index_rigth").on("click",function(){
					var url = '/html/search.html'
					if (common.isApp()) {
						if (common.isApple()) {
							try{
								window.webkit.messageHandlers.goToSearch.postMessage(url);
							}catch(e){
								console.log("调用ios方法goToSearch出错")
							}
						} else if(common.isAndroid()){
							try{
								android.goToSearch(url);
							}catch(e){
								console.log("调用ios方法goToSearch出错")
							}
						}					
					}else{
						console.log("this is not grhao App!")
					}
				})
				//common.jumpLinkSpecial('.index_rigth','html/search.html'); //跳转搜索页面
				//common.jumpLinkSpecialApp( '.index_tit','门店选择','html/store1.html'); // 跳转到门店
				$(".index_tit").on('click',function(){
					common.jumpLinkPlainApp('门店选择','html/store1.html');
				});
				/*$(".swiper-wrapper").on("touchstart",'a',function(e){
					var _touch = e.originalEvent.targetTouches[0];
　　					pub.touch_start= _touch.pageX;
				});
				$(".swiper-wrapper").on("touchmove",'a',function(e){
					var _touch = e.originalEvent.targetTouches[0];
　　					pub.touch_move= _touch.pageX;
				});*/
				$(".index_banner .swiper-wrapper").on("click",'a',function(e){
					//if (Math.abs(pub.touch_start - pub.touch_move) < 100) {
						var urlArr = [{
							url:'goodsDetails.html',
							tit:"商品详情"
						},{
							url:"moregoods.html?type=JU_HUI",
							tit:"钜惠活动"
						},{
							url:"moregoods.html?type=TAO_CAN",
							tit:"礼盒套餐"
						},{
							url:'seckill.html',
							tit:"秒杀换购"
						},{
							url:'pre.html',
							tit:"预购活动"
						},{
							url:'seckillDetaila.html',
							tit:"换购商品详情"
						},{
							url:'seckillDetail.html',
							tit:"秒杀商品详情"
						},{
							url:'preDetails.html',
							tit:"预购商品详情"
						},{
							url:'month_service.html',
							tit:"充值优惠"
						}]
						var url = $(this).attr("url");
						if (url) {
							url = url.substr(1);
							for (var i =0; i< urlArr.length;i++) {
								if(url.indexOf(urlArr[i].url) >0){
									common.jumpLinkPlainApp(urlArr[i].tit , url);
									return ;
								}
							}
						}
					//}
				});
				$(".index_center_banner").on("click","dl",function(){
					var nood = $(this),
						link = nood.attr("link"),
						title = nood.attr("tit");
					if (link != '') {
						common.jumpLinkPlainApp(title,link);
					}
					
				})
				//取消按钮
				$(".order_refund").on("click",".refund_cancle",function(){
					$(".order_refund").hide();
					$("body").css("overflow-y","auto");
					pub.apiHandle.choice_firm.init()
				});
	
				//确定按钮
				$(".order_refund").on("click",".makeSure",function(){
					$(".order_refund").hide();
					$("body").css("overflow-y","auto");
					/*pub.firmId = common.user_datafn().firmId;
					common.firmId.setItem(common.user_datafn().firmId);
					common.good.removeItem();
					pub.apiHandle.firm_default.init();
					pub.apiHandle.main_page_goods.init();*/
					pub.apiHandle.trueFn();
					
				});
			}
	 	};
	
	 	// 模块初始化
	 	pub.init = function(){
	
	 		pub.paramListInit(); // 参数初始化
	
	 		pub.isApp = common.isApp();
	
	 		if( common.appData.getKey() && JSON.parse(common.appData.getItem()).data.order_cancel_time){
				pub.apiHandle.system_config_constant.apiData( true );
 			}else{
	 			pub.apiHandle.system_config_constant.init(); // 是 app 调 APP 方法
 			}
	
	 		pub.apiHandle.init(); // 模块初始化接口数据处理
	 		
	 		common.lazyload(); // 懒加载
	 		
	 		pub.eventHandle.init(); // 模块初始化事件处理
	 	};
	 	
	 	$(document).ready(function(){
		 	pub.init();
		 	window.pub = pub;
		 	setTimeout(document.getElementById('wrapper').style.left = '0', 500);
	 		var wh = document.documentElement.clientHeight;
			
			pub.info = {
				"pullDownLable":"下拉刷新...",
				"pullingDownLable":"松开刷新...",
				"pullUpLable":"下拉加载更多...",
				"pullingUpLable":"松开加载更多...",
				"loadingLable":"加载中..."
			}
			function pullDownAction () {
				setTimeout(function () {
					pub.isrefresh = true;
					pub.apiHandle.init(); // 模块初始化接口数据处理
				}, 1000);	
			}
			var $listWrapper = $('.main');

	        pub.pullInstance =  pullInstance = new Pull($listWrapper, {
	            // scrollArea: window, // 滚动区域的dom对象或选择器。默认 window
	             distance: 100, // 下拉多少距离触发onPullDown。默认 50，单位px
	
	            // 下拉刷新回调方法，如果不存在该方法，则不加载下拉dom
	            onPullDown: function () {
	                pullDownAction();
	            },
	        });
			
	 	})
	})
});
