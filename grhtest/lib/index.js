/*
* 	index scirpt for Zhangshuo Guoranhao
*/ 
define(function(require, exports, module){

	
	var common = require('lib/common.js?v=20000');

	require('swiper');
	// 首页 命名空间

	var pub = {};
	
	pub.openId = common.openId.getItem();

	pub.paramListInit = function(){
				
	 	pub.logined = common.isLogin(); // 已经登录

	 	pub.logined && common.autoLogin();

	 	pub.logined && ( pub.firmId = common.user_datafn().firmId ); // 门店ID

	};
 	// 接口处理命名空间

 	pub.apiHandle = {};

 	pub.apiHandle.init = function(){
 		var me = this;
 		if( pub.logined && pub.firmId != '0' ){
 			me.firm_list.init(); // 当前用户门店
 		}else{
 			me.firm_default.init(); // 默认门店
 		}
 		if( common.timestamp.getKey() ){
 			var json = common.JSONparse( common.timestamp.getItem('timestamp') );
 			if( json.timestamp > Date.now() ){
	 			pub.apiHandle.main_page_goods.apiData( json.con );
 			}else{
 				common.timestamp.removeItem();
		 		me.main_page_goods.init();
 			}
 		}else{
	 		me.main_page_goods.init();
 		}
 	};
	
 	// 默认门店
 	pub.apiHandle.firm_default = {
 		
 		// 默认门店初始化函数
 		init : function(){
 			common.ajaxPost({
 				method : 'firm_default'
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
 		}
 	};
 	// 用户门店
 	pub.apiHandle.firm_list = {
 		init : function(){
 			//alert("llallallall")
 			common.ajaxPost({
 				method : 'firm_list',
 				firmId : pub.firmId
	 		},function(d){
	 			d.statusCode == "100000" && pub.apiHandle.firm_default.apiData.call(pub.apiHandle.firm_list,d);
	 			d.statusCode == common.SESSION_EXPIRE_CODE && common.clearData();
	 		});
 		},
 		
 	};

 	// 首页商品列表
 	pub.apiHandle.main_page_goods = {
 		init : function(){
 			var me = this;
 			common.ajaxPost({
 				method : 'main_page_goods'
	 		},function( d ){
	 			d.statusCode == "100000" && me.apiData( d );
	 			d.statusCode !== "100000" && common.cancelDialogApp();
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
			$(".index_inner").height( ( data.length / 3 ) * 320 ).html( html ).find('img[src]').addClass('fadeIn');
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


			data.adInfoList.length != 0 && common.bannerShow( data.adInfoList, '.index_banner', function( d ){
				var html = '', i = 0, link = null;
				for ( i in d ){
					link = d[i].linkUrl ? d[i].linkUrl : '';
					html += '<div class="swiper-slide"><a href="javascript:void(0)" url="'+link+'"><img src="' + d[i].adLogo + '" /></a></div>'
				}
				return html;
			});

			data.mainPageGoodsDetails.length != 0 && me.apiDataDeal( data.mainPageGoodsDetails );

			// 保存分享数据
			common.shareData = data.customShare;
		
 			common.isWeiXin() && require.async('lib/weixin.js'); //判断微信环境调用分享
		 		
 		}
 	};

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
 				console.log(dStr);
				common.isAndroid() ? android.getShare( dStr ) : window.webkit.messageHandlers.getShare.postMessage(dStr);
			}catch(e){}

 		}
 	};
 	pub.get_weixin_code  = function(){
        common.ajaxPost({
            method: 'get_weixin_code',
            weixinCode : pub.weixinCode
        },function( d ){
            if( d.statusCode == '100000' && d.data.fromWX == 1 ){
                pub.openId =  d.data.openId;
                common.openId.setItem( pub.openId ); // 存opendId
            }else{
                common.prompt( d.statusStr );
            }
        });
    };

 	// 事件处理初始化
	pub.eventHandle = {
		
		init : function(){
			//点击跳转详情页面
			$('.index_inner').on('click', "dl", function() {
				common.jumpLinkPlainApp( "商品详情", "html/goodsDetails.html?goodsId=" + $(this).attr("data") );
			});

			$(".index_center_wrap").on('click', "dl", function() {
				common.first_data.removeItem();
				common.two_data.removeItem();
				var i = $(this).attr("data");
				var pathNameTitle = ['礼盒套餐','钜惠活动','秒杀换购','预购活动']
				var pathNames = ["html/moregoods.html?type=TAO_CAN","html/moregoods.html?type=JU_HUI","html/seckill.html","html/pre.html"];
				i == "3" && common.seckill.setItem('1');
				common.jumpLinkPlainApp( pathNameTitle[i -1],pathNames[ i - 1 ] );
			});
			$(".index_center_wrap").on('click', ".index_center_center", function() {
				common.jumpLinkPlainApp("充值优惠","html/month_service.html");
			});
			$(".index_rigth").on("click",function(){
				//alert(navigator.userAgent)
				var url = '/html/search.html'
				if (common.isApp()) {
					if (common.isApple()) {
						try{
							window.webkit.messageHandlers.goToSearch.postMessage(url);
						}catch(e){
							alert("调用ios方法goToSearch出错")
						}
					} else if(common.isAndroid()){
						try{
							android.goToSearch(url);
						}catch(e){
							alert("调用ios方法goToSearch出错")
						}
					}					
				}else{
					alert("this is not grhao App!")
					common.jumpLinkPlain(url)
				}
			})
			//common.jumpLinkSpecial('.index_rigth','html/search.html'); //跳转搜索页面
			common.jumpLinkSpecialApp( '.index_tit','门店地址','html/store.html'); // 跳转到门店
			$(".swiper-wrapper").on("click",'a',function(){
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
			});
		}
		
 	};

 	// 模块初始化
 	pub.init = function(){

 		pub.paramListInit(); // 参数初始化

 		$('.footer_item[data-content]','#foot').attr('data-content', common.getTotal() );

 		pub.isApp = common.isApp();

 		pub.weixinCode = common.getUrlParam('code'); // 获取url参数

 		// 微信授权处理
		!pub.openId && common.isWeiXin() && pub.weixinCode &&  pub.get_weixin_code();

 		if( pub.isApp ){
 			if( common.appData.getKey() ){
				pub.apiHandle.system_config_constant.apiData( true );
 			}else{
	 			pub.apiHandle.system_config_constant.init(); // 是 app 调 APP 方法
 			}
 		}
 		pub.apiHandle.init(); // 模块初始化接口数据处理
 		
 		common.lazyload(); // 懒加载
 		
 		pub.eventHandle.init(); // 模块初始化事件处理




 		
 	};
 	// require.async('https://hm.baidu.com/hm.js?2a10c871d8aa53992101d3d66a7812ae'); // 百度统计
 	
	module.exports = pub;	


});	