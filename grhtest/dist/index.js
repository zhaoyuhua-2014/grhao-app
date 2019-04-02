/*
* 	index scirpt for Zhangshuo Guoranhao
*/ 

require(['../require/config'],function () {
	require(['common','test','mobileUi','swiperJS','pull',],function(common){
		
		
		var pub = {};
	
		pub.openId = common.openId.getItem();
		
		pub.logined = common.isLogin(); // 已经登录
		
		pub.pageDone = $.Deferred()//页面数据加载完成数据对象
		
		pub.isLocation = localStorage.getItem("isLocation");
		
		pub.count = 0;//调用app定位次数
		
		pub.timer = null;//定时器id管理
		
		
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
		//定义那些页面是需要登陆才能进入的
		pub.linkUrls = [
			'gameTiger.html',//老虎机页面
			'red_package_rain.html',//红包雨页面
			'grhFarm.html',//农场游戏页面
			'month_service.html',//充值优惠页面
			'rechange_activity.html'//充值活动
		];
		pub.locationVersion = localStorage.getItem("version");
	 	// 接口处理命名空间
	 	pub.apiHandle = {};
	
	 	pub.apiHandle.init = function(){
	 		var me = this;
	 		
	 		if (pub.logined) {
	 			common.DTD.done(function(){
	 				pub.firmId = common.user_datafn().firmId;
	 				me.firm_default.init(); // 默认门店
	 				
	 			}).fail(function(){
	 				me.firm_default.init();
	 			})
	 		}else{
	 			me.firm_default.init(); // 默认门店
	 			
	 		};
	 		/* 处理首页定位问题 */
	 		pub.pageDone.done(function(){
	 			var isApiSwitch = false;
	 			try{
	 				var version = getLocationVersion();
	 			}catch(e){
	 				//TODO handle the exception
	 				console.warn("get app version error!")
	 			}
	 			
	 			 
	 			function getAppLocation(){
	 				var locationDate = localStorage.getItem("location");
	 				pub.locationDate = locationDate ? JSON.parse(locationDate) : null;
					if (pub.locationDate && pub.locationDate.longitude) {
						pub.longitude = pub.locationDate.longitude;
						pub.latitude = pub.locationDate.latitude;
						if (!isApiSwitch) {
							pub.locationInfo.init();
							isApiSwitch = true;
						}else{
							console.log("已经调用过一次了")
						}
					}else{
						if(pub.count < 2){
							//根据获取的APP版本来确定是否调用从新定位功能；确保之前的APP版本不会出现重复显示定位弹框。
							if ( version ) {
								if (common.isAndroid()) {
									if (version > 116) {
										common.replaceLocationApp();
									}
								}else if(common.isApple()){
									if (version > 134) {
										common.replaceLocationApp();
									}
								}
							}else{
								common.replaceLocationApp();
							}
							clearTimeout(pub.timer);
							pub.timer = setTimeout(function(){
								getAppLocation()
								pub.count++
							},3000)
						}else{
							console.log("定位失败")
						}
					}
	 			}
	 			
	 			getAppLocation();
	 			
	 			//对于版本号的获取处理
	 			function getLocationVersion (){
	 				var locationVerison = localStorage.getItem("version");
	 				if (locationVerison) {
	 					var version = locationVerison.split(".").join('');
						return  (version ? parseInt(version) : 0);
	 				} else{
	 					return 0;
	 				}
	 			}
	 			
	 		})
	 	};
	 	// 默认门店
	 	pub.apiHandle.firm_default = {
	 		// 默认门店初始化函数
	 		init : function(){
	 			common.ajaxPost({
	 				method : 'firm_default',
	 				firmId : pub.firmId
		 		},function(d){
		 			if (d.statusCode == "100000") {
		 				pub.apiHandle.firm_default.apiData( d );
		 			} else if (d.statusCode == "100901"){
		 				common.jsInteractiveApp({
							name:'alertMask',
							parameter:{
								type:2,
								title:'请选择门店',
								canclefn:'',
								truefn:'pub.apiHandle.trueFn1()'
							}
						})
		 			} else if (d.statusCode == common.SESSION_EXPIRE_CODE){
		 				common.clearData();
		 			}
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
						
						common.user_data.setItem( common.JSONStr( user_data ) );
						pub.apiHandle.firm_default.init();
					}else if(d.statusCode == '100901'){
						common.jsInteractiveApp({
							name:'alertMask',
							parameter:{
								type:2,
								title:'请选择门店',
								canclefn:'',
								truefn:'pub.apiHandle.trueFn1()'
							}
						})
					}else{
						common.prompt(d.statusStr)
					}
				})
			}
		},
	 	// 首页商品列表
	 	/* 0320 
	 	 method main_page_goods ==> activity_goods_list
	 	 * */
	 	pub.apiHandle.main_page_goods = {
	 		init : function(){
	 			var me = this;
	 			common.ajaxPost({
	 				method : 'activity_goods_list',
	 				firmId:pub.firmId,
	 				websiteNode:pub.websiteNode
		 		},function( d ){
		 			d.statusCode == "100000" && me.apiData( d );
		 			d.statusCode != "100000" && common.cancelDialogApp();
		 			d.statusCode != "100000" && $(".index_inner,.swiper-wrapper,.swiper-pagination").html('') && common.prompt(d.statusStr);
		 			d.statusCode == common.SESSION_EXPIRE_CODE && common.clearData();
		 			
		 		});
	 		},
//	 		apiDataDeal : function( data ){
//				var 
//				html = '',
//				goodsInfo = '';
//				for(var i = 0,l = data.length; i < l ; i++) {
//					goodsInfo = data[i].goodsInfo;
//					var arr = [];
//					goodsInfo.isHot == 1 && arr.push('isHot');
//					goodsInfo.isNew == 1 && arr.push('isNew');
//					goodsInfo.isRecommend == 1 && arr.push('isRecommend');
//					goodsInfo.isSale == 1  && arr.push('isSale');
//	
//					html += '<dl data="' + goodsInfo.id + '">'
//					html += '	<dt>'
//	
//					if( i < 6 ){
//						html += '		<img src="' + goodsInfo.goodsLogo + '"/>'
//						html += '<div class="box">'
//						for(var k = 0; k < arr.length; k++){ html += '		<span class="goodSatce ' + arr[k] + '"></span>' }
//						html += '</div>'
//					}else{
//						html += '		<img data-src="' + goodsInfo.goodsLogo + '"/>'
//						html += '<div class="box">'
//						for( var k = 0; k < arr.length; k++ ){ html += '		<span class="goodSatce ' + arr[k] + '"></span>' }
//						html += '</div>'
//					}
//					html += '	</dt>'
//					html += '	<dd>'
//					html += '		<p>' + goodsInfo.goodsName + '</p>'
//					html += '		<p class="clearfloat">'
//					html += '			<span class="float_left">'+ goodsInfo.specInfo + '</span>'
//					html += '			<span class="float_right">￥'+ goodsInfo.nowPrice + '</span>'
//					html += '		</p>'
//					html += '	</dd>'
//					html += '</dl>'
//				}
//				$(".index_inner").height( ( Math.ceil(data.length / 3 )) * 320 ).html( html ).find('img[src]').addClass('fadeIn');
//				
//				try{
//					common.cancelDialogApp();
//					
//				}catch(e){
//					console.log(e)
//				}
//	 		},
	 		apiDataDeal : function( data ){
	 			console.log(data)
				var 
				html = '',
				goodsInfo = '';
				html += '<div class="index_common lazyload index_inner3">'
				html += '	<div class="goods_area hidden"></div>'
				for(var i in data) {
					
					goodsInfo = data[i].goodsInfo;
					var arr = [];
					if(!goodsInfo.tagConfigs || goodsInfo.tagConfigs.length == 0){
						goodsInfo.isHot == 1 && arr.push('isHot');
						goodsInfo.isNew == 1 && arr.push('isNew');
						goodsInfo.isRecommend == 1 && arr.push('isRecommend');
						goodsInfo.isSale == 1  && arr.push('isSale');
					}
					html += '<dl data="' + goodsInfo.id + '" goods-box="goods-box" class="'+ (goodsInfo.packageNum <=0 ? "sellOut" : "") +'">'
					html += '	<dt>'
					html += '		<img ' + ( i < 6 ? 'src' : 'data-src'  ) + '=' + goodsInfo.goodsLogo  + ' class="fadeIn"/>'
					if(!goodsInfo.tagConfigs || goodsInfo.tagConfigs.length == 0){
						html += '<div class="box">'
						for(var k = 0; k < arr.length; k++){ html += '<span class="goodSatce ' + arr[k] + '"></span>' }
						html += '</div>'
					}else{
						html += '<div class="tag_box_top" >'
						for(var t = 0 ; t < goodsInfo.tagConfigs.length; t++){
							var tagStyle = 'background:url('+goodsInfo.tagConfigs[t].background+') no-repeat 100%/100%;color:'+goodsInfo.tagConfigs[t].nameColour +';'
							if(goodsInfo.tagConfigs[t].site == 1){
								tagStyle += 'float: left;'; 
								html += '<span class="tagStatus " style="'+ tagStyle  +'">'+goodsInfo.tagConfigs[t].name+'</span>'
							}else if(goodsInfo.tagConfigs[t].site == 2){
								tagStyle += 'float: right;'; 
								html += '<span class="tagStatus " style="'+ tagStyle  +'">'+goodsInfo.tagConfigs[t].name+'</span>'
							}
						}
						html += '</div>'
						html += '<div class="tag_box_bottom" >'
						for(var t = 0 ; t < goodsInfo.tagConfigs.length; t++){
							var tagStyle = 'background:url('+goodsInfo.tagConfigs[t].background+') no-repeat 100%/100%;color:'+goodsInfo.tagConfigs[t].nameColour +';'
							if(goodsInfo.tagConfigs[t].site == 3){
								tagStyle += 'float: left;'; 
								html += '<span class="tagStatus " style="'+ tagStyle  +'">'+goodsInfo.tagConfigs[t].name+'</span>'
							}else if(goodsInfo.tagConfigs[t].site == 4){
								tagStyle += 'float: right;'; 
								html += '<span class="tagStatus " style="'+ tagStyle  +'">'+goodsInfo.tagConfigs[t].name+'</span>'
							}
							
						}
						html += '</div>'
					}
					html += '	</dt>'
					html += '	<dd>'
					html += '		<p class="goodName">' + goodsInfo.goodsName + '</p>'
					html += '		<p class="clearfloat">'
					html += '			<span class="index_price">'+ goodsInfo.nowPrice + '</span>'
					html += '			<del class="index_old_price">￥'+ goodsInfo.nomalPrice + '</del>'
					html += '		</p>'
					html += '	</dd>'
					html += '</dl>'
				}
				html += '</div>'
				$(".home_goods_show").html( html );
				try{
					common.cancelDialogApp();
					
				}catch(e){
					console.log(e)
				}
	 		},
	 		apiActiveDataDeal : function( data ){
				var 
				html = '',
				goodsInfo = '',
				activityInfo = "";
				for(var i in data) {
					activityInfo = data[i].activityDetails;
					html += '<div class="index_common lazyload index_inner'+data[i].goodsNum +'">'
					if (!!data[i].actvityLogo) {
						link = pub.apiHandle.getActiveUrl(data[i].linkUrl);
						html += '<div class="goods_area" link="'+ link + '" tit="活动"><img src="'+data[i].actvityLogo+'" alt="" /></div>'	
					}else{
						html += '<div class="goods_area hidden"></div>'	
					}
					for(var j in activityInfo)	{
						var arr = [];
						goodsInfo = activityInfo[j].goodsInfo
						if(!goodsInfo.tagConfigs || goodsInfo.tagConfigs.length == 0){
							goodsInfo.isHot == 1 && arr.push('isHot');
							goodsInfo.isNew == 1 && arr.push('isNew');
							goodsInfo.isRecommend == 1 && arr.push('isRecommend');
							goodsInfo.isSale == 1  && arr.push('isSale');
						}
						html += '<dl data="' + goodsInfo.id + '" goods-box="goods-box" class="'+ (goodsInfo.packageNum <=0 ? "sellOut" : "") +'">'
						html += '	<dt>'
						html += '		<img ' + ( i < 6 ? 'src' : 'data-src'  ) + '=' + goodsInfo.goodsLogo  + ' class="fadeIn"/>'
						if(!goodsInfo.tagConfigs || goodsInfo.tagConfigs.length == 0){
							html += '<div class="box">'
							for(var k = 0; k < arr.length; k++){ html += '<span class="goodSatce ' + arr[k] + '"></span>' }
							html += '</div>'
						}else{
							html += '<div class="tag_box_top" >'
							for(var t = 0 ; t < goodsInfo.tagConfigs.length; t++){
								var tagStyle = 'background:url('+goodsInfo.tagConfigs[t].background+') no-repeat 100%/100%;color:'+goodsInfo.tagConfigs[t].nameColour +';'
								if(goodsInfo.tagConfigs[t].site == 1){
									tagStyle += 'float: left;'; 
									html += '<span class="tagStatus " style="'+ tagStyle  +'">'+goodsInfo.tagConfigs[t].name+'</span>'
								}else if(goodsInfo.tagConfigs[t].site == 2){
									tagStyle += 'float: right;'; 
									html += '<span class="tagStatus " style="'+ tagStyle  +'">'+goodsInfo.tagConfigs[t].name+'</span>'
								}
							}
							html += '</div>'
							html += '<div class="tag_box_bottom" >'
							for(var t = 0 ; t < goodsInfo.tagConfigs.length; t++){
								var tagStyle = 'background:url('+goodsInfo.tagConfigs[t].background+') no-repeat 100%/100%;color:'+goodsInfo.tagConfigs[t].nameColour +';'
								if(goodsInfo.tagConfigs[t].site == 3){
									tagStyle += 'float: left;'; 
									html += '<span class="tagStatus " style="'+ tagStyle  +'">'+goodsInfo.tagConfigs[t].name+'</span>'
								}else if(goodsInfo.tagConfigs[t].site == 4){
									tagStyle += 'float: right;'; 
									html += '<span class="tagStatus " style="'+ tagStyle  +'">'+goodsInfo.tagConfigs[t].name+'</span>'
								}
								
							}
							html += '</div>'
						}
						html += '	</dt>'
						if(data[i].goodsNum == 1){
							html += '	<dd>'
							html += '		<p class="good_name">'+goodsInfo.goodsName +'</p>'
							html += '		<p class="good_des">'+goodsInfo.goodsDescribe+'</p>'
							html += '		<div class="bottom_area">'
							html += '			<div class="price_area">'
							html += '				<p class="good_price">￥'+goodsInfo.nowPrice+'</p>'
							html += '				<del class="good_old_price">￥'+goodsInfo.nomalPrice+'</del>'
							html += '			</div>'
							html += '			<button class="buy_btn">立即购买</button>'
							html += '		</div>'
							html += '	</dd>'
						}else{
							html += '	<dd>'
							html += '		<p class="goodName">' + goodsInfo.goodsName + '</p>'
							html += '		<p class="clearfloat">'
							html += '			<span class="index_price">￥'+goodsInfo.nowPrice + '</span>'
							html += '			<del class="index_old_price">￥'+ goodsInfo.nomalPrice + '</del>'
							html += '		</p>'
							html += '	</dd>'
						}
						html += '</dl>'
					}
					html += '</div>'		
					
				}
				$(".home_goods_show").html( html );
				try{
					common.cancelDialogApp();
					
				}catch(e){
					console.log(e)
				}
	 		},
	 		apiData : function( d ){
	 			var json = {};
	 			var 
	 			me = this,
				data = d.data;
	
	 			if( !common.timestamp.getKey() && data.adInfoList.length != 0 ){
	 				json.timestamp = Date.now() + 3 * 60 * 1000;
	 				json.con = d;
	 				common.timestamp.setItem( common.JSONStr( json ) );
	 			}
	
				
				
				data.adInfoList.length != 0 && common.bannerShow(data.adInfoList, '.index_banner', function( d ){
					var html = '', i = 0, link = null;
					for ( i =0,l=d.length; i< l; i++ ){
						link = d[i].linkUrl ? pub.apiHandle.getActiveUrl(d[i].linkUrl) : '';
						html += '<div class="swiper-slide"><a href="javascript:void(0)" data-title="'+d[i].note+'" url="'+link+'"><img src="' + d[i].adLogo + '" /></a></div>'
					}
					return html;
				},'.swiper-pagination',pub.isrefresh);
				
//				data.mainPageGoodsDetails.length == 0 && $(".index_inner").html("");
//				data.mainPageGoodsDetails.length != 0 && me.apiDataDeal( data.mainPageGoodsDetails );
				$(".home_goods_show").empty();
				if (data.appMainActivities && data.appMainActivities.length ) {
					me.apiActiveDataDeal(data.appMainActivities );
				}
				if (data.mainPageGoodsDetails && data.mainPageGoodsDetails.length ) {
					me.apiDataDeal(data.mainPageGoodsDetails );
				}
			 	if(pub.isrefresh){
			 		pub.pullInstance.pullDownSuccess();
			 		common.lazyload(); // 懒加载
			 	}
			 	pub.pageDone.resolve();
	 		}
	 	};
		
		//首页活动list
		/*
		 20190320
		 method custom_activity_firm_list==>custom_activity_firm_list_two
		 * */
		pub.apiHandle.custom_activity_firm_list = {
			init:function(){
				common.ajaxPost({
	 				method : 'custom_activity_firm_list_two',
	 				firmId:pub.firmId,
		 		},function( d ){
		 			d.statusCode == "100000" && pub.apiHandle.custom_activity_firm_list.apiData( d );
		 			d.statusCode != "100000" &&  common.prompt(d.statusStr);
		 			
		 		});
			},
			apiData:function(d){
				if( d.statusCode == "100000"){
 					if (d.data.cas && d.data.cas.length) {
 						var activeOne = d.data.cas,link='',html=''; 
 						for (var i in activeOne ) {
 							link = pub.apiHandle.getActiveUrl(activeOne[i].h5Url);
 							html += '<li class="swiper-slide" link="'+link+'" tit="'+activeOne[i].name+'">'
							html += '	<div class="shop-active-content-box" >'
							html += '		<p class="pic"><img src="'+activeOne[i].logo+'"></p>'
							html += '		<p class="txt">'+activeOne[i].name+'</p>'
							html += '	</div>'
							html += '</li>'
 						}
   						$('#shop-active-data-box').html( html );
		 				var swiper = new Swiper('.shop-active-container', {
					     	slidesPerView: 4,
					      	spaceBetween: 30,
						});
 					}else{
 						$(".shop-active-container").hide();
 					}
	 				
					/*
					 活动2
					*/
					var activeTwoDom = $(".index_active_wrap");
					var activeTwo = d.data.castwo;
					if (activeTwo && activeTwo.length) {
						var html = ''.link='';
						activeTwo.forEach(function(item){
							/*
							 type
							 5--表示左边区域
							 4--表示右下角的区域
							 6--表示左上角区域
							*/
							link = pub.apiHandle.getActiveUrl( item.h5Url );
							html = '<img src="'+item.logo+'">'
							if (item.type == 4) {
								activeTwoDom.find(".active_bottom").html(html).attr({'link':link,'tit':item.name})
							} else if ( item.type == 5) {
								activeTwoDom.find(".active_left").html(html).attr({'link':link,'tit':item.name})
							} else if ( item.type == 6) {
								activeTwoDom.find(".active_top").html(html).attr({'link':link,'tit':item.name})
							}
							html = '';
						})
						activeTwoDom.show();
					}
 				}else{
 					$('.shop-active-container').css('padding','6px');
 				}
			}
		};
		//获取正确的URL地址
		pub.apiHandle.getActiveUrl = function(d){
			var locationObj = document.location;
			if (d) {
				if (common.isLogin()) {
					var urlParameter = d.indexOf('?') > 1 ? d.split('?')[1] : null;
					var arr = d.split("/"),
						l = arr.length;
					
					return "html/"+arr[l-1];
				}else{
					var arr = d.split("/"),
						l = arr.length;
					
					for (var i in pub.linkUrls) {
						if (arr[l-1].indexOf(pub.linkUrls[i]) > -1) {
							return "html/login.html";
						}
					}
					
					return "html/"+arr[l-1];
				}
				
			}else{
				return '';
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
	 			common.jsInteractiveApp({
					name:'getShare',
					parameter:{
						str:dStr
					}
				})
	
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
			common.jsInteractiveApp({
				name:'goToNextLevel',
				parameter:{
					title:'门店选择',
					url:'html/store1.html'
				}
			})
		}
		pub.apiHandle.trueFn2 = function(){
			try{
				pub.firmId = pub.locationFirmInfo.id;
				common.firmId.setItem(pub.locationFirmInfo.id);
				common.good.removeItem();
				common.setShopCarNumApp(0);
				if (pub.logined) {
					pub.apiHandle.choice_firm.init();					
				}else{
					pub.apiHandle.firm_default.init();
				}
				
			}catch(e){
				console.log(e)
			}
			
		}
		//取消方法
		pub.apiHandle.cancleFn = function(){
			pub.apiHandle.choice_firm.init()
		}
		//换肤
		pub.apiHandle.change_app_theme = {
			init:function(){
				if (common.huanfu.getItem() && common.huanfu.getItem() != 1) {
					$(".index_header,.index_inner,.footer").addClass("skin"+sessionStorage.getItem("huanfu"))
				}
			}
		}
		//app 换肤
		pub.apiHandle.changeSkin = function (){
			
		}
	 	// 事件处理初始化
		pub.eventHandle = {
			
			init : function(){
				//点击跳转详情页面
				$('.home_goods_show').on('click', "dl", function() {
					common.jsInteractiveApp({
						name:'goToNextLevel',
						parameter:{
							title:'商品详情',
							url:'html/goodsDetails.html?goodsId=' + $(this).attr("data")
						}
					})
					
				});
				$(".home_goods_show").on("click",".goods_area",function(){
					var nood = $(this),
						link = nood.attr("link"),
						title = nood.attr("tit");
					common.jsInteractiveApp({
						name:'goToNextLevel',
						parameter:{
							title:title,
							url:link
						}
					})
				})
				$(".index_rigth").on("click",function(){
					var url = 'html/search.html';
					common.jsInteractiveApp({
						name:'goToSearch',
						parameter:{
							url:url
						}
					});
				})
				$(".index_tit").on('click',function(){
					common.jsInteractiveApp({
						name:'goToNextLevel',
						parameter:{
							title:'门店选择',
							url:'html/store1.html'
						}
					})
					/*1*/
				});
				$(".index_banner .swiper-wrapper").on("click",'a',function(e){
					var url = $(this).attr("url"),
						title = $(this).attr("data-title");
					if (url) {
						common.jsInteractiveApp({
							name:'goToNextLevel',
							parameter:{
								title:url.indexOf("html/login.html") > -1 ? '登陆' : title,
								url:url
							}
						})
					}
				});
				
				//活动事件
				$(".shop-active-box").on("click","li.swiper-slide",function(){
					var nood = $(this),
						link = nood.attr("link"),
						title = nood.attr("tit");
					if (link != '') {
						common.jsInteractiveApp({
							name:'goToNextLevel',
							parameter:{
								title:link.indexOf("html/login.html") > -1 ? '登陆' : title,
								url:link
							}
						})
					}
				});
				/*  - 首页秒杀充值整件活动  - */
				$(".index_active_wrap").on("click",".activeJump",function(){
					var nood = $(this),
						link = nood.attr("link"),
						title = nood.attr("tit");
					if (link != '') {
						if (link.indexOf("whole") != -1) {
							common.jsInteractiveApp({
								name:'goFirstView',
								parameter:{
									navIndex:2
								}
							})
						}else{
							common.jsInteractiveApp({
								name:'goToNextLevel',
								parameter:{
									title:link.indexOf("html/login.html") > -1 ? '登陆' : title,
									url:link
								}
							})
						}
						
					}
				});
				//确定按钮 -- //取消按钮
				$(".order_refund").on("click",".makeSure,.refund_cancle",function(){
					$(".order_refund").hide();
					$("body").css("overflow-y","auto");
					if ($(this).is(".makeSure")) {
						pub.apiHandle.trueFn();						
					}else{
						pub.apiHandle.choice_firm.init()
					}
				});
			}
	 	};
		//定位全局存储处理
		pub.appInteractive = {
			setFn:function(d){
				console.log("sucess");
			},
			getFn:function(d){
				console.log("getFn");
				if (!d) {
					pub.locationInfo.api()
				}else{
					
				}
			}
			
		}
		
		//定位处理
		pub.locationInfo = {
			init:function(){
				pub.locationInfo.data = {
	    			method:'position_verify',
	    			longitude:pub.longitude,
	    			latitude:pub.latitude,
	    			firmId:pub.firmId,
	    		}
				common.jsInteractiveApp({
					name:'getGlobalVariable',
					parameter:{
						key:'appKey',
						callBackName:'pub.appInteractive.getFn'
					}
				})
			},
			api:function(){
				common.ajaxPost(pub.locationInfo.data,function(d){
	    			if(d.statusCode == '100000'){
	    				pub.locationInfo.apiData(d);
	    			}else{
						common.prompt(d.statusStr);
	    			}
	    		})
			},
			apiData:function(d){
				var firmInfo =  d.data.firmInfo;
				if (!d.data.bool) {
					pub.locationFirmInfo = firmInfo;
		 			var note = '定位到附近存在'
		 			if (firmInfo.type == 5) {
		 				note += firmInfo.firmName +"自动售货机"
		 			} else {
		 				note += firmInfo.firmName +"门店"
		 			}
		 			note += ' 。是否切换？'
		 			
		 			common.jsInteractiveApp({
						name:'alertMask',
						parameter:{
							type:1,
							title:note,
							canclefn:'',
							truefn:'pub.apiHandle.trueFn2()'
						}
					})
				}
				common.jsInteractiveApp({
					name:'setGlobalVariable',
					parameter:{
						key:'appKey',
						value:'appVal',
						callBackName:'pub.appInteractive.setFn'
					}
				})
			}
		}
	 	// 模块初始化
	 	pub.init = function(){
	 		
	 		if (!common.huanfu.getKey()) {
				common.getChangeSkin();
				common.defHuanfu.done(function(){
					pub.apiHandle.change_app_theme.init();
				})
			}else{
				pub.apiHandle.change_app_theme.init();
			}
	
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
	 		$("body").fadeIn(300)
	 	};
	 	
	 	$(document).ready(function(){
	 		try{
	 			pub.init();
	 		}catch(e){
	 			//TODO handle the exception
	 			console.log(e)
	 		}
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
			var timer = null;
			function pullDownAction () {
				clearTimeout(timer);
				timer =  setTimeout(function () {
					pub.isrefresh = true;
					console.log("走一次")
					pub.apiHandle.init(); // 模块初始化接口数据处理
					clearTimeout(timer);
				}, 1000);	
			}
			var $listWrapper = $('.main');

	        pub.pullInstance =  pullInstance = new Pull($listWrapper, {
	            distance: 100, // 下拉多少距离触发onPullDown。默认 50，单位px
	
	            // 下拉刷新回调方法，如果不存在该方法，则不加载下拉dom
	            onPullDown: function () {
	            	common.getNetwork(pullDownAction,pub.pullInstance.pullDownFailed.bind(pub.pullInstance))
	            },
	        });
			
	 	})
	})
});
