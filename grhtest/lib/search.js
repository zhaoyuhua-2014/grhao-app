define(function(require, exports, module){

	var common = require('lib/common.js?v=20000');


// 整体 命名空间 ( search + 门店位置 )
	pub = {};


	pub.paramListInit = function(){
		pub.logined = common.isLogin(); // 已经登录
	 	pub.firmIdTemp = null;

	 	if( pub.logined ){
	 		pub.firmId = common.user_datafn().firmId; // 门店ID
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
		pub.muduleId = $('[module-id]').attr('module-id');
		pub.muduleId == "store" && require.async('map');
	};

	function searchWithText(value){
		alert(value);
		/*pub.search.PAGE_INDEX = common.PAGE_INDEX; // 重置页码
		pub.search.keyWord = value;
		$('.search_goods').empty();// 清空列表数据
		pub.search.apiHandle.search_goods.init();*/
	}

/***************************搜索模块***************************/
	
	pub.search = {}; 
	pub.search.paramListInit = function(){

		pub.search.PAGE_SIZE = common.PAGE_SIZE; // 每页显示条数
		pub.search.PAGE_INDEX = common.PAGE_INDEX; // 页码索引
		pub.search.isEnd = false; // 有没有更多数据判断
		pub.search.keyWord = null; // 热搜词
		pub.search.hotWordbox = $('.search_star');
	};
	
	pub.search.apiHandle = {
		init : function(){
			pub.search.apiHandle.hot_search_data.init();	
		},
		hot_search_data : {
			init : function(){
				common.ajaxPost({
					method : 'hot_search_data'
				},function( d ){

					d.statusCode == "100000" && pub.search.apiHandle.hot_search_data.apiData( d );
					
				});
			},
			apiData : function( d ){

				var  
				data = d.data, 
				html = '', 
				i;
				for(i in data){ 
					html += '<li>' + data[i].keyword + '</li>';
				}
				$('.search_item_list').html( html );
			}
		},
		search_goods : {
			init : function(){
				common.ajaxPost({
					method : 'search_goods',
					keyWord : pub.search.keyWord,
					pageNo : pub.search.PAGE_INDEX,
					pageSize : pub.search.PAGE_SIZE
				},function( d ){
					d.statusCode == "100000" && pub.search.apiHandle.search_goods.apiData( d )
				})
			},
			apiData : function( d ){

				var  data = d.data, html = '', obj, i;
				pub.search.isEnd = data.isLast; // 最后一页
				if ( data.objects == 0 && pub.search.isEnd ) {
					$(".search_none").show().siblings().hide();
				} else{
					$(".search_resurt").show().siblings().hide();
					for ( i in data.objects) {
						obj = data.objects[i];
						html +='<dl class="clearfloat" data-id="' + obj.id + '" type="' + obj.activityType + '">';
						if( obj.activityType == 2 ){
							html +=		'<dt><img src="' + obj.goodsLogo + '"/><img src="../img/icon_miao_s.png" alt="" class="icon-img"/></dt>';
						}else{
							html +=		'<dt><img src="' + obj.goodsLogo + '"/></dt>';
						}
						html +=		'<dd>'
						html +=			'<p class="good_name">' + obj.goodsName + '</h3>'
						html +=			'<p class="good_describe">' + obj.specInfo + '</p>'
						html +=			'<div class="good_picre_search"><span>￥' + obj.nowPrice + '</span>&nbsp;&nbsp;&nbsp;&nbsp;<del>￥' + obj.nomalPrice + '</del></div>'
						html +=		'</dd>'
						html +='</dl>'
					};
					$(".search_goods").append( html );
					pub.search.isEnd && $('.click_load').show().html("没有更多数据了！");
					!pub.search.isEnd && $('.click_load').show().html("点击加载更多！");
				}
			}
		}
	};
	// search 事件初始化
	pub.search.eventHandle = {

		init : function(){

			var paramFn = function( value ){
				pub.search.PAGE_INDEX = common.PAGE_INDEX; // 重置页码
				pub.search.keyWord = value;
				$('.search_goods').empty();// 清空列表数据
				pub.search.apiHandle.search_goods.init();
			};

			// 点击热搜词
			$(".search_item_list").on("click","li",function(){
				var val = $(this).html();
				//$( '.search','.search_box').val( val );
				if (common.isApp()) {
					if (common.isApple()) {
						try{
							window.webkit.messageHandlers.searchHot.postMessage(val);
						}catch(e){
							alert("ios调用searchHot方法出错");
						}
					} else if(common.isAndroid()){
						try{
							android.searchHot(val);
						}catch(e){
							alert("Android调用searchHot方法出错");
						}
					}
				} else{
					alert("this is not grhao APP")
				}
				paramFn(val);

			});

			// 点击加载更多
			$('.click_load').on( 'click',function(){
				if( pub.search.isEnd ){
					pub.search.PAGE_INDEX++;
					pub.search.apiHandle.search_goods.init();
				}
			});

			// 点击搜索
			$('.search_btn').on('click',function(){
				var keyWord = $('.search').val().replace(/\s*/g,'');
				keyWord != '' && paramFn( keyWord );
			});

			// 点击删除输入框内容
			$('.search_delete').on('click',function(){
				var 
				$this = $(this),
				val = $this.prev().val();
				val != '' && $this.prev().val('');
				pub.search.hotWordbox.is(':hidden') && pub.search.hotWordbox.show().siblings().hide();
			});

			// 输入判断
			$(".search").on("input propertychange",function(){
				var val = $(this).val();
				if ( val == '' || val.replace(/\s*/g,'') == '' ) {
					$(".search_star").show().siblings().hide();
				}
			});

			//点击跳转详情
			$(".search_goods").on("click","dl",function(){
				var 
				$this = $(this),
				type = $this.attr('type'),
				pathNames = [ "seckillDetail.html", "preDetails.html", "seckillDetaila.html" ],
				goodsId = $this.attr("data-id");

				if( 1 < type && type < 5){
					common.jumpLinkPlainApp( pathNames[type-2] + '?goodsId=' + goodsId );
				}else{
					common.jumpLinkPlainApp( "goodsDetails.html?goodsId=" + goodsId );
				}

			});

			// 返回上一页

			$('.search_left').on('click',function(e){
				
				var isHide = pub.search.hotWordbox.is(':hidden');
				if( isHide ){
					$('.search_box').find('.search').val('');
					$('.search_resurt,.search_none').hide();
					pub.search.hotWordbox.show();
				}else{
					common.jumpLinkPlain("../index.html");
				}
			});

			// common.jumpLinkSpecial(".search_left","../index.html"); 
		}
	};



	pub.search.init = function(){
		pub.search.paramListInit(); // 参数初始化
		pub.search.eventHandle.init();
		pub.search.apiHandle.init();
	};




/************************************ 门店地址 *************************/
	
	// 命名空间

	pub.store = {};



	// 城市
	pub.store.citys = null;
	pub.store.cityIndex = 0;

	pub.store.countys = null;
	pub.store.countyIndex = 0;

	// 门店 接口命名空间
	pub.store.apiHandle = {
		init : function(){
			pub.store.apiHandle.firm_city_list.init();
		},

		firm_city_list : {
			init : function(){
				common.ajaxPost({
					method : 'firm_city_list'
				},function( d ){

					pub.store.countys = [];
					pub.store.countyIndex = 0;
					$(".store_area").children().length != 0 && $(".store_area").html('');
					$(".store_store").children().length != 0 && $(".store_store").html('');
					d.statusCode == "100000" && pub.store.apiHandle.firm_city_list.apiData( d );

				})
			},
			apiData : function( d ){
				var 
				html = '', 
				i,
				store_city = $(".store_city");
				
				for ( i in d.data) {
					html += '<li class="store_city_item">' + d.data[i] + '</li>'
				}
				store_city.append( html );
				store_city.find("li:eq(0)").addClass("store_city_click");
				pub.store.citys = d.data;
				pub.store.apiHandle.firm_county_list.init();
			}
		},

		firm_county_list : {
			init : function(){
				common.ajaxPost({
					method : 'firm_county_list',
					cityName : pub.store.citys[ pub.store.cityIndex ]
				},function( d ){

					$(".store_store").children().length != 0 && $(".store_store").html('');
					d.statusCode == "100000" && pub.store.apiHandle.firm_county_list.apiData( d );
				})
			},
			apiData : function( d ){
				var 
				html = '',
				i,
				store_area = $(".store_area");

				store_area.html('');
				for (var i in d.data) {
					html += '<li class="store_area_item">' + d.data[i] + '</li>'
				}
				store_area.html( html );
				store_area.find('li:eq(0)').addClass("store_area_click");
				pub.store.countys = d.data;
				pub.store.apiHandle.firm_list.init( true );
			}
		},

		firm_list : {
			init : function( symbol ){

				var obj = { method : 'firm_list' };
				arguments[0] && (obj.countyName = pub.store.countys[ pub.store.countyIndex ])

				common.ajaxPost(obj,function( d ){
					d.statusCode == "100000" && symbol && pub.store.apiHandle.firm_list.apiData( d );
					d.statusCode == "100000" && !symbol && pub.store.apiHandle.firm_list.apiData2( d );
				})
			},
			apiData : function( d ){
				
				var html = '', i;
				for ( i in d.data) {
					html += '<li class="store_store_item" data="' + d.data[i].id + '">'
					html += '	<dl class="clearfloat">'
					html += '		<dt><img src="' + d.data[i].faceImgUrl + '"/></dt>'
					html += '		<dd>'
					html += '			<p class="business_name">' + d.data[i].firmName + '</p>'
					html += '			<p class="business_address">' + d.data[i].address + '</p>'
					html += '		</dd>'
					html += '	</dl>'
					html += '	<div class="business_timer"><img src="../img/icon_clock.png"/>' + d.data[i].pickUpTime + '</div>'
					html += '</li>'
				};

				// pub.store.symbol && pub.store.bodyNode.data('key',d.data); //暂存数据

				$(".store_store").html( html );
				$('[data="' + pub.firmId + '"]').addClass('actived').find('dd').addClass('store_bg');
			},
			apiData2 : function( d ){
				var map = new AMap.Map('mapContainer', {
				    resizeEnable: true,
				    zoom:12,
				    center: [120.1823616,30.24423873]//以杭州火车站为地图中心
				});
				var markers = [];
				
				for (var i in d.data) {
					var marker;
					marker = new AMap.Marker({
					    position: [ d.data[i].longitude, d.data[i].latitude ],
						map: map
					});
					marker.setLabel({//label默认蓝框白底左上角显示，样式className为：amap-marker-label
				        offset: new AMap.Pixel(10,-10),//修改label相对于maker的位置
				        content: d.data[i].firmName
				   	});
				   	markers.push(marker);
				}
			}
		},

		choice_firm : {
			init : function(){
				common.ajaxPost($.extend({},pub.userBasicParam,{
					method : 'choice_firm',
					firmId : pub.firmIdTemp
				}),function( d ){
					if( d.statusCode == "100000" ){
						var user_data = common.user_datafn();
						user_data.firmId = pub.firmIdTemp;
						common.user_data.setItem( common.JSONStr( user_data ) );
						if( pub.store.symbol ){
							common.goBackApp(1,true,'html/order_set_charge.html');
						}else{
							common.goBackApp(1,true,'index.html');
						}
					}
				})
			}
		}
	};

	pub.store.tabSwith = function( data, callback ){
		var args = arguments[0];
		$( args[0] ).on('click', args[1], function(){
			var 
			$this = $(this),
			index = $this.index(),
			isCur = $this.is( args[2] ),
			curNodePart = args[2].substring(1);
			if( !isCur ){
				$this.addClass( curNodePart ).siblings().removeClass( curNodePart );
				callback( index );
			}
		});
	}
	// 门店 事件处理命名空间
	pub.store.eventHandle = {
		init : function(){

			// 门店 + 地图切换

			pub.store.tabSwith(['.store_top','.store_item','.color_border'],function( index ){
				$('.store_list','.store_box').eq( index ).show().siblings().hide();
				pub.store.apiHandle.firm_list.init();
			});

			// 点击切换城市
			pub.store.tabSwith([".store_city",'.store_city_item','.store_city_click'],function( index ){
				pub.store.cityIndex = index;
				pub.store.apiHandle.firm_county_list.init();
			});

			//区域点击切换事件
			pub.store.tabSwith([".store_area",'.store_area_item','.store_area_click'],function( index ){
				pub.store.countyIndex = index;
				pub.store.apiHandle.firm_list.init( true );
			});

			//点击门店记录门店信息返回首页显示
			$(".store_store").on('click','.store_store_item',function(){

				var 

				$this = $(this),
				i = $this.index(),
				isCur = $this.is('.actived');

				pub.firmIdTemp = $this.attr("data");

				if ( pub.logined ){
					if( pub.store.symbol ){
						pub.store.apiHandle.choice_firm.init();
						
					}else{
						if( !isCur ){
							$(".order_refund").show();
							$("body").css("overflow-y","hidden");
						}
					}
				}else{
					common.jumpMake.setItem("6");
					common.jumpLinkPlainApp('登录',"html/login.html?type="+6);
				}
			});

			//取消按钮
			$(".order_refund").on("click",".refund_cancle",function(){
				$(".order_refund").hide();
				$("body").css("overflow-y","auto");
				pub.firmIdTemp = null;
			});

			//确定按钮
			$(".order_refund").on("click",".makeSure",function(){
				$(".order_refund").hide();
				$("body").css("overflow-y","auto");
				pub.store.apiHandle.choice_firm.init();
			});

			// 返回上一页
			if( pub.store.symbol ){
				common.jumpLinkSpecial('.header_left',function(){
					window.history.back();
				});
			}else{
				common.jumpLinkSpecial( '.header_left',"../index.html" );
			}


		}
	};

	// 门店模块初始化
	pub.store.init = function(){

		pub.store.bodyNode = $('body');

		pub.store.symbol = common.getUrlParam('store');

		if( !pub.logined || pub.firmId == '0' ){
			pub.firmId = 1;
		}

		var winH = $(window).height();
		$('.store_box2').height( winH - 200 );
		pub.store.apiHandle.init();
		pub.store.eventHandle.init();
	}


	





	// 模块初始化
	pub.init = function(){
		pub.paramListInit(); // 参数初始化
		pub.muduleId == "search" && pub.search.init();
		pub.muduleId == "store" && pub.store.init();
	};

	module.exports = pub;
})
