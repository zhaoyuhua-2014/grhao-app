

require(['../require/config'],function () {
	require(['common','mobileUi','swiperJS'],function(common){

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
		};
		pub.loading = $('.click_load');
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
						method : 'hot_search_data',
						firmId:pub.firmId
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
						firmId:pub.firmId,
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
			},
			searchWithText : function( val ){
				var val = val.toString();
				if ( val == '' || val.replace(/\s*/g,'') == '') {// 
					$(".search_star").show().siblings().hide();
				}else{
					pub.search.PAGE_INDEX = common.PAGE_INDEX; // 重置页码
					pub.search.keyWord = val;
					$('.search_goods').empty();// 清空列表数据
					pub.search.apiHandle.search_goods.init();
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
					pathNameTitle = ['秒杀商品详情','预购详情','换购商品详情'],
					pathNames = [ "html/seckillDetail.html", "html/preDetails.html", "html/seckillDetaila.html" ],
					goodsId = $this.attr("data-id");
					if( 1 < type && type < 5){
						common.jumpLinkPlainApp( pathNameTitle[type - 2],pathNames[type-2] + '?goodsId=' + goodsId );
					}else{
						common.jumpLinkPlainApp( '商品详情',"html/goodsDetails.html?goodsId=" + goodsId );
					}
				});
	
			}
		};
	
		pub.search.init = function(){
			pub.firmId = ( common.firmId.getItem() ? common.firmId.getItem() : null)// 门店ID
			pub.search.paramListInit(); // 参数初始化
			pub.search.apiHandle.init();
			pub.search.eventHandle.init();
		};
	
	/************************************ 门店地址 *************************/
		
		// 命名空间
	
		pub.store = {};
		/*watm添加机器门店修改*/
		pub.store.firmType = null;
		pub.store.county = null;
		pub.store.street = null;
		pub.store.sortType = null;
		pub.store.longitude = null;
		pub.store.latitude = null;
		pub.store.pageNo = common.PAGE_INDEX;
		pub.store.pageSize = common.PAGE_SIZE;
		pub.store.isLast = null;
//		var arr11= [120.21937542,30.25924446];
//		pub.store.longitude = arr11[0];
//		pub.store.latitude = arr11[1];
		pub.store.filter_area = [];
	
		// 城市
		pub.store.citys = null;
		pub.store.cityIndex = 0;
	
		pub.store.countys = null;
		pub.store.countyIndex = 0;
	
		pub.store.Node = $(".store_list");
		// 门店 接口命名空间
		pub.store.apiHandle = {
			init : function(){
				pub.store.Node.html("");
				pub.store.apiHandle.firm_list.init();
				pub.store.apiHandle.firm_area.init();
			},
			firm_list : {
				init : function( symbol ){
					common.ajaxPost({
						method : 'choose_firm_list',
						firmType : pub.store.firmType,
						county : pub.store.county,
						street : pub.store.street,
						sortType : pub.store.sortType,
						longitude : pub.store.longitude,
						latitude : pub.store.latitude,
						pageNo : pub.store.pageNo,
						pageSize : pub.store.pageSize
					},function( d ){
						d.statusCode == "100000" && pub.store.apiHandle.firm_list.apiData( d );
						d.statusCode != "100000" && common.prompt(d.statusStr);
					})
				},
				apiData : function( d ){
					var o = d.data.hasPage.objects;
					pub.store.isLast = d.data.hasPage.isLast;
					$(".location_content").data("allMap",pub.store.apiHandle.filter_data(d.data.noPage));
					var html = '', i;
					for ( i in o) {
						html += '<div class="store_store_item" data1="' + o[i].id + '">'
						html += '	<dl class="clearfloat" data="' + o[i].id + '">'
						html += '		<dt><img src="' + o[i].faceImgUrl + '"/></dt>'
						html += '		<dd>'
						html += '			<p class="business_name">' + o[i].firmName + '</p>'
						html += '			<p class="business_address">' + o[i].address + '</p>'
						html += '		</dd>'
						html += '	</dl>'
						html += '	<div class="business_timer" data-longitude = "'+o[i].longitude+'" data-latitude = "'+o[i].latitude+'" data-firmName = "'+o[i].firmName+'"><p>' +(o[i].distance == -1 ? "" : o[i].streetName+" "+pub.store.apiHandle.distance_number( o[i].distance ) )+ '</p></div>'
						if (o[i].type == 5) {
							html += '<div class = "icon machine"></div>'
						} else{
							html += '<div class = "icon store"></div>'
						}
						html += '</div>'
					};
					pub.store.Node.append( html );
					$('[data1="' + pub.firmId + '"]').addClass('active');
					if( pub.store.isLast){
						pub.loading.show().html("没有更多数据了！");
					}else{
						pub.loading.show().html("点击加载更多！");
					};
				},
				apiData2 : function( d ){
					 require(['map'],function(){
						mapObj = new AMap.Map('mapContainer');
						mapObj.plugin('AMap.Geolocation', function () {
						    geolocation = new AMap.Geolocation({
						        enableHighAccuracy: true,//是否使用高精度定位，默认:true
						        timeout: 10000,          //超过10秒后停止定位，默认：无穷大
						        maximumAge: 0,           //定位结果缓存0毫秒，默认：0
						        convert: true,           //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
						        showButton: true,        //显示定位按钮，默认：true
						        buttonPosition: 'LB',    //定位按钮停靠位置，默认：'LB'，左下角
						        buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
						        showMarker: true,        //定位成功后在定位到的位置显示点标记，默认：true
						        showCircle: true,        //定位成功后用圆圈表示定位精度范围，默认：true
						        panToLocation: true,     //定位成功后将定位到的位置作为地图中心点，默认：true
						        zoomToAccuracy:true      //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
						    });
						    mapObj.addControl(geolocation);
						    geolocation.getCurrentPosition();
						    AMap.event.addListener(geolocation, 'complete', function(e){
						    	console.log(e);
						    	alert(e.type)
						    });//onComplete返回定位信息
						    AMap.event.addListener(geolocation, 'error',function(e){
						    	console.log(e);
						    	alert(e.type)
						    } );      //onError返回定位出错信息
						});
					});
				}
			},
			firm_area :	{
				init : function(){
					common.ajaxPost({
						method : 'area_show' 
					},function(d){
						d.statusCode == '100000' && pub.store.apiHandle.firm_area.apiData(d);
						d.statusCode != '100000' && common.prompt(d.statusStr)
					})
				},
				apiData:function(d){
					var d = d.data,arr = [];
					for (i in d) {
						arr = arr.concat(d[i])
					}
					var html = '<span class="active area1" data-data = '+JSON.stringify(arr)+'>全部</span>';
					var area1Node = $('.filter_area1');
					for (var i in d) {
						html += '<span class = "area1" data-id = '+JSON.parse(i).id+' data-data = '+JSON.stringify(d[i])+'>'+JSON.parse(i).name+'</span>'
					}
					area1Node.html(html);
					pub.store.filter_area =  JSON.parse(area1Node.find("span").eq(0).addClass('active').attr("data-data"));
					
					pub.store.apiHandle.firm_area.apiData2();
				},
				apiData2:function(n){
					
					var html = '<span class=" area2" data-code = "">全部</span>';
					var area2Node = $('.filter_area2');
					for (var i in pub.store.filter_area) {
						html += '<span class = "area2" data-id = '+pub.store.filter_area[i].id+' data-code = '+pub.store.filter_area[i].code+'>'+pub.store.filter_area[i].name+'</span>'
					}
					area2Node.html(html);
					if(n != undefined){
						area2Node.find("span").eq(n).addClass('active')
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
							common.tellRefreshAPP()
							var user_data = common.user_datafn();
							user_data.firmId = pub.firmIdTemp;
							common.user_data.setItem( common.JSONStr( user_data ) );
							common.firmId.setItem(pub.firmIdTemp);
							common.good.removeItem();
							common.setShopCarNumApp(0);
							common.goBackApp(1,true,'index.html');
						}
					})
				}
			},
			distance_number : function (n){
				if (typeof n == 'number') {
					if (n == 2147483647 || n == -1) {
						return '';
					}else if(n>=0 && n<= 20000){
						return ""+(parseFloat(n/1000).toFixed(2))+"km";
					}else{
						return ">20km";
					}
					/*else if (n>=1000 && n<=10000) {
						return "距离:"+(parseFloat(n/1000).toFixed(2))+"km";
					}else if(n>10000 && n<=20000){
						return "距离:>10km";
					}else if(n>20000 && n<=50000){
						return "距离:>20km";
					}else if(n>50000 && n<=100000){
						return "距离:>50km";
					}*/
				}
			},
			//确定方法
			trueFn:function(){
				common.tellRefreshAPP();
				if (pub.logined) {
					pub.store.apiHandle.choice_firm.init();
				}else{
					common.firmId.setItem(pub.firmIdTemp);
					common.goBackApp(1,true,'index.html');
				}
			},
			//取消方法
			cancleFn:function(){
				pub.firmIdTemp = null;
			},
			//过滤门店数据 空的经纬度不展示
			filter_data:function(d){
				var arr = [],obj={};
				for (var i in d) {
					if (d[i].longitude && d[i].latitude) {
						obj = {'longitude':d[i].longitude,'latitude':d[i].latitude,'firmName':d[i].firmName,"id":d[i].id};
						arr.push(obj);
						obj = null;
					}
				}
				return arr;
			}
		};
		pub.store.locationInfoFn = function(){
			pub.store.locationInfo = localStorage.getItem("location");
			if (pub.store.locationInfo && JSON.parse(pub.store.locationInfo).longitude) {
				$(".location_content").find("span").html(JSON.parse(pub.store.locationInfo).POIName).end().find("em").html("当前位置");
				pub.store.longitude = JSON.parse(pub.store.locationInfo).longitude;
				pub.store.latitude = JSON.parse(pub.store.locationInfo).latitude;
			}else{
				$(".location_content").find("span").html("定位失败").end().find("em").html("点击重新定位").on("click",function(){
					common.replaceLocationApp();
				})
			}
		}
		// 门店 事件处理命名空间
		pub.store.eventHandle = {
			init : function(){
				var tabNodes = $('.fillter_tab .store_item'),
					contentNodes = $(".fillter_content .filter_panel"),
					taskNode = $(".filter_shadow");
				//tab切换
				tabNodes.on("click",function(){
					var index = $(this).attr('data-item');
					$(this).is('.active') ? $(this).removeClass("active") : $(this).addClass('active').siblings().removeClass('active');
					if($(this).is('.active') ){
						contentNodes.eq(index).removeClass('hidden').siblings().addClass('hidden');
						taskNode.is('.hidden') && taskNode.removeClass("hidden") && $('body').css("overflow-y",'hidden');
					}else{
						contentNodes.addClass('hidden');
						taskNode.addClass('hidden');
						$('body').css("overflow-y",'auto')
					}
				})
				//点击遮罩
				taskNode.on('click',function(){
					tabNodes.removeClass("active");
					contentNodes.addClass('hidden');
					taskNode.addClass('hidden');
					$('body').css("overflow-y",'auto');
					pub.store.pageNo = common.PAGE_INDEX;
					pub.store.Node.html("");
					pub.store.apiHandle.firm_list.init();
				})
				//点击筛选条件
				contentNodes.on("click",'span',function(){
					$(this).addClass("active").siblings().removeClass("active");
					//筛选
					if ($(this).is('.screen')) {
						pub.store.firmType = $(this).attr('data-type');
						$(".filter_panel1 .filter_panel_right span").eq($(this).index()).addClass('active').siblings().removeClass("active");
						$(".filter_panel1 .filter_panel_left span").eq($(this).index()).addClass('active').siblings().removeClass("active");
						//点击遮罩重置逻辑
						tabNodes.removeClass("active");
						contentNodes.addClass('hidden');
						taskNode.addClass('hidden');
						$('body').css("overflow-y",'auto');
						pub.store.pageNo = common.PAGE_INDEX;
						pub.store.Node.html("");
						pub.store.apiHandle.firm_list.init();
					//智能排序
					} else if ($(this).is('.sort')){
						pub.store.sortType = $(this).attr('data-type');
						$(".filter_panel3 .filter_panel_right span").eq($(this).index()).addClass('active').siblings().removeClass("active");
						$(".filter_panel3 .filter_panel_left span").eq($(this).index()).addClass('active').siblings().removeClass("active");
						//点击遮罩重置逻辑
						tabNodes.removeClass("active");
						contentNodes.addClass('hidden');
						taskNode.addClass('hidden');
						$('body').css("overflow-y",'auto');
						pub.store.pageNo = common.PAGE_INDEX;
						pub.store.Node.html("");
						pub.store.apiHandle.firm_list.init();
					//区域
					} else{
						if ($(this).is('.area1')) {
							pub.store.filter_area = JSON.parse($(this).attr('data-data'));
							pub.store.apiHandle.firm_area.apiData2($(this).attr('data-index'));
							pub.store.county = $(this).attr('data-id');
							console.log("county"+ $(this).attr('data-id'));
							pub.store.street = null;
						} else if ($(this).is('.area2')){
							pub.store.street = $(this).attr('data-code');
							$(".filter_area1 span.active").attr("data-index",$(".filter_area2 span.active").index());
							$(".filter_area1 span").each(function(i){
								if(!$(".filter_area1 span").eq(i).is(".active")){
									$(".filter_area1 span").eq(i).removeAttr("data-index")
								}
							})
							
							
							//点击遮罩重置逻辑
							tabNodes.removeClass("active");
							contentNodes.addClass('hidden');
							taskNode.addClass('hidden');
							$('body').css("overflow-y",'auto');
							pub.store.pageNo = common.PAGE_INDEX;
							pub.store.Node.html("");
							pub.store.apiHandle.firm_list.init();
						}
					}
				})
	
				//点击门店记录门店信息返回首页显示
				$(".store_list").on('click','dl.clearfloat',function(){
	
					var 
					$this = $(this),
					i = $this.index(),
					isCur = $this.parent().is('.active');
	
					pub.firmIdTemp = $this.attr("data");
					
					if( !isCur ){
						/*$(".order_refund").show();
						$("body").css("overflow-y","hidden");*/
						var data = {
							type:1,
							title:'确定选择该门店?',
							canclefn:'cancleFn',
							truefn:'trueFn'
						}
						common.alertMaskApp(JSON.stringify(data));
					}
				});
				//点击进入地图页面
				$(".store_list").on('click','.business_timer',function(){
					var longitude = $(this).attr("data-longitude"),
						latitude = $(this).attr("data-latitude"),
						firmName = $(this).attr("data-firmName");
					var mapData = {
						'longitude':longitude,
						'latitude':latitude,
						'firmName':firmName
					}
					common.allMap.removeItem();
					common.mapData.setItem(JSON.stringify(mapData))
					common.jumpLinkPlainApp("门店位置","html/store_map.html")
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
					common.tellRefreshAPP();
					if (pub.logined) {
						pub.store.apiHandle.choice_firm.init();
					}else{
						common.firmId.setItem(pub.firmIdTemp);
						common.goBackApp(1,true,'index.html');
					}
				});
				//点击加载更多
				pub.loading.on('click',function(){
	
					if (!pub.store.isLast) {
						pub.store.pageNo ++ ;
						pub.store.apiHandle.firm_list.init();
					}else{
						pub.loading.show().html("没有更多数据了！");
					}
				});
				//点击进入地图总页面
				$(".location_content .float_right").on("click",function(){
					common.mapData.removeItem();
					common.allMap.setItem(JSON.stringify($(".location_content").data("allMap")));
					common.jumpLinkPlainApp("门店位置","html/store_map.html?type=all")
				})
			}
		};
	
		// 门店模块初始化
		pub.store.init = function(){
	
			pub.store.bodyNode = $('body');
	
			pub.store.symbol = common.getUrlParam('store');
	
			if( !pub.logined ){
				pub.firmId = common.firmId.getItem();
			}
			pub.store.locationInfoFn();
			pub.store.apiHandle.init();
			pub.store.eventHandle.init();
		}
		// 换肤
		pub.apiHandle = {
			change_app_theme : {
				init:function(){
					if (common.huanfu.getItem() && common.huanfu.getItem() != 1) {
						$(".store_box,.store_top,.header_contain").addClass("skin"+sessionStorage.getItem("huanfu"))
					}
				}
			}
		};
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
			pub.muduleId == "search" && pub.search.init();
			pub.muduleId == "store" && pub.store.init();
			$("body").fadeIn(300)
		};
	 	pub.init();
	 	window.pub = pub;
	})
});