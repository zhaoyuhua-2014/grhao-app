/*
* orderSettlement scirpt for Zhangshuo Guoranhao
*/ 
require(['../require/config'],function () {
	require(['common','shopCar','LArea','mobileUi'],function(common,cart,area){
	
		var common = require( 'common' );
		var a = require( 'shopCar' );
		var cart = new a();
		var area = require('LArea');
		// 命名空间
	
		pub = {};
		pub.addrDtd = $.Deferred();
		pub.logined = common.isLogin(); // 是否登录
	
		pub.firmIdType = (common.firmIdType.getItem() ? common.firmIdType.getItem() : null) 
		
		pub.moduleId = $('[module-id]').attr( 'module-id' );  // 模块 id 
		
		if( pub.logined ){
			pub.userData = common.user_datafn();
			
			pub.userId = pub.userData.cuserInfoid;
			pub.source = "userId" + pub.userId;
			pub.sign = md5( pub.source + "key" + common.secretKeyfn() ).toUpperCase();
			pub.tokenId = common.tokenIdfn();
			pub.userBasicParam = {
				userId : pub.userId,
				source : pub.source,
				sign : pub.sign,
				tokenId : pub.tokenId
			}
		}else{
			//common.jumpLinkPlain('../index.html'); // 未登录跳转首页
			common.goHomeApp();
		}
	
	
		// pub.goodsList = null; // 普通商品 购物车商品列表
	
		pub.hasCouponId = common.sortCouponId.getKey(); // 存在优惠券id
	
		pub.dom = common.getUrlParam('dom');
	
		if( pub.dom ){
			pub.dom = pub.dom.substr(0,3) == 'dom';
		}
	
		if( pub.hasCouponId ){
			pub.couponId = common.sortCouponId.getItem();
			common.sortCouponId.removeItem();
		}else{
			pub.couponId = null;
		}
		// pub.addrId = null; // 地址id
		// pub.pickUpMethod = null; // 取货方式 1.门店自提，2.送货上门
		// pub.orderCode = null; // 预购商品 订单编号
		// pub.goodsId = null; // 预购 + 秒杀 + 换购 商品id
		// pub.remarks = null; // 备注
		pub.isApp = common.isApp(); // 获取 app 环境
	
		// pub.orderParamInfo = null;
		pub.couponInfo = [
			{ text : '立减优惠：', key : 'derateAmount' , sign :"-￥" }, // 1
			{ text : '折扣优惠：', key : 'derateAmount', sign : "-￥" }, // 2
			{ text : '赠送果币：', key : 'offScore', sign : "个"}, // 3
			{ text : '赠送优惠券：', key : 'offItemVal', sign : '元'}, // 4
		];
		// 页面box之前切换
		pub.switchInput = function( title, node1, node2, tit ){
			tit = tit || title;
			$('.header_title').html( tit );
			document.title = title;
			$( node1 ).fadeOut(100,function(){
				$( node2 ).fadeIn(200);
			});
		};
		// 普通 命名空间
		pub.plain = {};
		var PLAIN = pub.plain;
		// 普通 接口数据处理
		PLAIN.apiHandle = {
			init : function(){
				//之前是否有选择优惠券信息
				pub.couponInfo = common.couponInfo.getItem() ? JSON.parse(common.couponInfo.getItem()) : {};
				pub.couponId = pub.couponInfo.id;
				PLAIN.apiHandle.shop_cart_submit.init();
			},
			shop_cart_submit : {
				init : function(){
					common.ajaxPost($.extend({},{
						method : 'shop_cart_submit_two',
						goodsList : pub.goodsInfoApi, // 接口 所需字段
						pickUpMethod : pub.pickUpMethod,
						couponId : pub.couponId,
					},pub.userBasicParam), function( d ){
						d.statusCode == "100000" && PLAIN.apiHandle.shop_cart_submit.apiData( d );
					});
				},
				apiData : function( d ){
					var 
					orderInfo = d.data.order, // 订单商品信息
					couponInfolist = d.data.CouponInfolist, // 优惠券 
					couponInfoCount = d.data.couponCanUseCount, //可用优惠卷数量
					time = d.data.time, // 时间
					calendar = d.data.calendar; // 日期
					
					
					PLAIN.apiHandle.shop_cart_submit.goodsPriceInfo( orderInfo , couponInfolist ); // 商品价格信息
	
					!!calendar && !!time && PLAIN.apiHandle.shop_cart_submit.dispatchTime( calendar, time ); // 派送时间
					
					
					
					$(".set_coupon_box_item_text").data('data',couponInfolist).attr("couponInfoCount",couponInfoCount);
					
					if (pub.couponId) {
						$(".set_coupon_box_item_text").html("<span>"+pub.couponInfo.couponName+"</span>");
						$(".set_coupon_box_item_text").attr({"couponId":pub.couponInfo.couponId,"couponName":pub.couponInfo.couponName,"couponMoney":pub.couponInfo.couponMoney});
					}else{
						if (couponInfoCount > 0) {
							$(".set_coupon_box_item_text").html(couponInfoCount+"张可用优惠卷");
						}else{
							$(".set_coupon_box_item_text").html("无可用优惠卷").addClass("color_999");
						}
					}
					
					if (common.goodsType.getItem() == 'ZHENG_JIAN') {
						$(".set_coupon_box_item").hide();
					}
					
				},
				// 配送时间
				dispatchTime : function( cal, t ){
	
					var time = {}, dataFormat = function( param ){
						var arr = [];
						param.forEach(function( v, i ){
							var obj = {code : 'code'};
							obj.name = v;
							arr.push( obj );
						});
						return arr;
					},calendar = dataFormat( cal );
	
					time.code = dataFormat( t );
					$.dtd.resolve( [calendar,time],2 );
					$(".set_delivery_box").show();
				},
				// 商品价格信息
				goodsPriceInfo : function( orderInfo , dataList){
					/*var 
					listBoxNode = $(".order_set_list"),
					listNode = listBoxNode.find('li');
					var curNode = listNode.eq(0).show().find(".float_right").html( "￥" + orderInfo.goodsMoney).parent() // 商品总价
					pub.storeInfo.type != 5 && curNode.next().show().find(".float_right").html( "￥" + orderInfo.postCost ); // 运费
					*/
					var 
					listBoxNode = $(".order_set_list"),
					listNode = listBoxNode.find('li');
	
					listNode.eq(0).show().find(".float_right").html( "￥" + orderInfo.goodsMoney).parent() // 商品总价
					.next().show().find(".float_right").html( "￥" + orderInfo.postCost ); // 运费
					
					pub.firmIdType == 5 ? listNode.eq(1).find(".float_left").html("配送费") : listNode.eq(1).find(".float_left").html("运费");
					
					pub.pickUpMethod == 2 ? listNode.eq(1).css("display","block") : listNode.eq(1).css("display","none"); 
					//是否是首单
					if (orderInfo.orderType == "1") {
						if (orderInfo.firstOrderOff != '' && orderInfo.firstOrderOff > 0) {
							$(".order_first_free").find(".float_right").html("-￥"+orderInfo.firstOrderOff).end()
							$(".order_first_free").css("display","block")
						} 
					}
					//优惠券金额
					(function(){
						(pub.orderType == "3" || common.goodsType.getItem() == 'ZHENG_JIAN')? listNode.eq(2).hide() : (function(){
							listNode.eq(2).show().find(".float_left").html(getCouponText(dataList));
							listNode.eq(2).show().find(".float_right").html( orderInfo.couponMoney > 0 ? "-￥" + orderInfo.couponMoney : "-￥0" );
						})();
					}());
					// 优惠券优惠价格信息
					(function(){
						if( 0 < orderInfo.couponStrategy && orderInfo.couponStrategy < 5  ){
							var couponInfo = pub.couponInfo[ +orderInfo.couponStrategy - 1 ];
							listNode.eq(3).show().find(".float_left").html( couponInfo.text ).next().show().html(function(){
								var sign = couponInfo.sign;
								if( sign == '-￥' ) 
									return sign + (orderInfo[couponInfo.key] ? orderInfo[couponInfo.key] : '');
								return (orderInfo[couponInfo.key] ? orderInfo[couponInfo.key] : '') + sign;
							});
						}else{
							listNode.eq(3).hide();
						}
					}());
					listNode.eq(5).show().find(".float_right").html( "￥" + orderInfo.realPayMoney );
					$(".order_submit_money").html( orderInfo.realPayMoney );
					listBoxNode.show();
					
					
					function getCouponText (dataList){
						if (pub.couponId) {
							if(dataList && dataList.length != 0){
								for (var i in dataList) {
									if (pub.couponId == dataList[i].id) {
										return dataList[i].couponName;
									}
								}
								return "优惠卷";
							}
							
						}else{
							return "优惠卷";
						}
					}
					
				},
			},
		};
		// 普通商品 列表
		PLAIN.goodList = function(){
			var html = '';
			pub.goodsList.forEach(function( v, i){
				if( v.status == 1 ){
					html += '<dl class="gds_box clearfloat">'
					html += '   <dt>'
					html += '		<img src="' + v.logo+'"/>'
					html += v.type == 2 ? '<img class="gds_goods_te" src="../img/icon_miao_s.png"/>' : '';
					html += pub.orderType == "2" ? '<img class="gds_goods_te" src="../img/icon_te_s.png"/>' : '';
					html += '	</dt>'
				    html += '	<dd>'
					html += '	    <div class="gds_right_top">' + v.name + '</div>'
					html += '	    <div class="gds_right_center clearfloat">'
					html += '		    <div class="gds_goods_mess float_left">' + v.specifications + '</div>'
					html += '		    <div class="gds_num_price float_right clearfloat">'
					html += '	            <p class="gds_price float_right">￥<span>' + common.toFixed( v.count * v.price ) + '</span></p>'
					html += '	            <p class="gds_num float_right">X<span>' + v.count + '</span></p>'
					html += '           </div>'
					html += '	    </div>'
					html += '	    <div class="gds_right_bottom">'
					html += '			<p class="float_left"><span class="font_color">￥' + v.price + '</span></p>'
					html += '			<p class="float_left"><span class="font_color"></span></p>'
					html += '</div>'
					html += '    </dd>'
				    html += '</dl>'
			    }
			});
			$(".order_goods_contain_details").html( html );
		};
		// 普通商品初始化
		PLAIN.init = function(){
			/*
			 在进行普通商品初始化时候判断商品是否为整件商品
			*/
			if (common.goodsType.getItem() == 'ZHENG_JIAN') {
				cart.init("wholeGood");
				$('.set_charge_con .set_delivery_box').show();
			}else{
				cart.init();
			}
			pub.goodsInfoApi = JSON.stringify({
				'goodsList':cart.getGoodsDate('id','sum')
			});
			//pub.goodsInfoApi = cart.goodlist1(); // 接口字段
			pub.goodsList = cart.getGoodsDate(); // 购物车商品列表
			
			PLAIN.apiHandle.init(); // 接口初始化
			PLAIN.goodList(); 
		};
	
		// 公共接口
		pub.apiHandle = {
			// 门店信息
			storeInfo : {
				init : function(){
					var data = { method : 'firm_default',firmId: pub.firmId};
					/*if( pub.firmId != '0' ){
						data.method = 'firm_list';
						data.firmId = pub.firmId;
					}*/
					common.ajaxPost( data,function( d ){
						d.statusCode == "100000" && pub.apiHandle.storeInfo.apiData( d ); 
					});
				},
				apiData : function( d ){
					var d = d.data[0] ? d.data[0] : d.data;
					node = $(".set_charge_address2");
					pub.firmId = d.id;
					pub.firmIdType = d.type;
					$(".set_charge_con").show();
					node.css("background",'#FFFFFF').find('.take_goods_phone').html( d.firmName )
						.end().find('.set_address_bottom').html( "地址：" + d.address )
						.end().find('.set_job_time').html( "营业时间：" + d.pickUpTime );
					//watm机器处理
					pub.firmIdType == 5 && (function(){
						/*$(".set_charge_contact_right").find(".take_own").hide();
						$(".set_charge_contact_right").find(".take_others").html("自助售货机").show().addClass("actived");
						pub.pickUpMethod = 1;*/
						$(".set_charge_contact_right").find(".take_others").html("售货机自提").show();
						
					})();
					
					if (common.goodsType.getItem() == 'ZHENG_JIAN') {
						if (typeof d.wholecargoTime == 'undefined') {
							pub.apiHandle.storeInfo.init();
						}else{
							$(".set_charge_con .set_delivery_box").find("dd").html(d.wholecargoTime )
						}
						
					}else{
						$(".set_charge_con .set_delivery_box").find("dd").html(d.cargoTime)
					}
				}
			},
			// 默认地址
			address_default_show : {
				init : function(){
					common.ajaxPost($.extend({},{
						method : 'address_default_show'
					}, pub.userBasicParam ),function( d ){
						if ( d.statusCode == "100000" ) {
							pub.AddrInfoRender( d.data ); // 配送地址渲染
						} else if( d.statusCode == "100505" || d.statusCode == "100300" ) {
							$('.set_charge_address1').find('.group1').hide().next().show().html( "请选择收货地址" );
							pub.addrDtd.resolve();
						}
					},function( d ){
						pub.addrDtd.resolve();
						common.prompt( d.statusStr );
					});
				}
			}
		};
		// 地址渲染
		pub.AddrInfoRender = function( d ){
			if (!d.latitude && !d.longitude ) {
				$('.set_charge_address1').find('.group1').hide().next().show().html( "请选择收货地址" );
			} else{
				pub.addrId = d.id; // 接收地址ID
				$('.set_charge_contact').attr( 'addr-id', pub.addrId ); // 暂存 ID
				$('.set_charge_address1').find('.set_address_top').show().find('.take_goods_name').html( d.consignee )
				.next().html( d.mobile ).parent().next().html( d.provinceName + d.cityName + d.countyName + d.address + d.addName + d.street );
				
			}
			
			pub.addrDtd.resolve();
		};
		// 公共事件处理函数
		pub.eventHandle = {
			init : function(){
				// 回退
				common.jumpLinkSpecial(".header_left",function(){
					common.addType.removeItem();
					pub.dom ? window.location.replace('../index.html') : (function(){
						$(".orderSettlement").is(":hidden") ? pub.switchInput("订单结算",".select_coupon",".orderSettlement") : window.history.back() ;
					})();
				});
				
				// 优惠券说明 
				$("#coupon_msg").on("click",function(){
					if (common.isApp()) {
						var data = {
							type:2,
							title:'特价商品不参与优惠卷计算',
							canclefn:'cancleFn',
							truefn:'trueFn'
						}
						common.alertMaskApp(JSON.stringify(data));
					}else{
						common.dialog.init({btns : [{ klass : 'dialog-confirm-btn', txt : '知道了'}]}).show('特价商品不参与优惠卷计算',function(){});
					}
			   	});
				
				//优惠卷
				$('.set_coupon_box_item').on("click",".set_coupon_box_item_text",function(){
					var couponId = $(this).attr("couponId");
					common.couponInfoList.setItem(JSON.stringify($(this).data().data))
					common.jumpLinkCustomApp({
						title:'选择优惠卷',
						url:'html/selectCoupon.html',
					})
					//pub.switchInput("选择优惠卷",".orderSettlement",".select_coupon")
				})
				
				
				// 配送方式切换
				$('.set_charge_contact li').on('click',function(){
					var 
					$this = $(this),
					isCur = $this.is('.actived'),
					index = $this.index();
					$this.addClass('actived').siblings().removeClass('actived');
					$('.set_charge_address').hide().eq( index ).show();
					var tabIndex = $('.set_charge_contact_right').find('li.actived').index();
					if( !isCur ){
						pub.addrId = index == 0 ? '' : $('.set_charge_contact').attr('addr-id');
						pub.pickUpMethod =  tabIndex == -1 ? '' : '' + ( tabIndex + 1 );
						common.addType.setItem( index );
						switch( +common.orderType.getItem() ){
							case 1 : PLAIN.apiHandle.shop_cart_submit.init(); break; // 普通
							case 3 : PRE.apiHandle.pre_shop_cart_submit.init(); break; // 预购
						}
					} 
				});
	
				// 选择配送地址
				$(".set_charge_address1").on("click",function(){
					common.addType.setItem( "1" );
					if($(".set_charge_contact").attr("addr-id")){
						window.localStorage.setItem("addId",$(".set_charge_contact").attr("addr-id"))
					}
					//common.jumpLinkPlainApp( '地址列表',"html/address_management.html" );
					common.jsInteractiveApp({
						name:'goToNextLevel',
						parameter:{
							title:'地址列表',
							url:'html/address_management.html'
						}
					})
				});
	
				// 提交订单
				$('.order_submit').on('click','.confirm-submit',function(){
					/*var $this = $(this);
					$this.removeClass('confirm-submit');
					var tabIndex = $('.set_charge_contact_right').find('li.actived').index();
	
					$this.html('提交中 ...');
	
					if( pub.storeInfo.type != 5 ){ // 非机器
						pub.pickUpMethod =  tabIndex == -1 ? '' : '' + ( tabIndex + 1 );
						pub.remarks = $(".set_order_remark input").val(); // 备注
					}*/
					
					//$('.order_submit_right').removeClass('confirm-submit').css("background-color","#999").html("提交中...");
					var tabIndex = $('.set_charge_contact_right').find('li.actived').index();
	
					pub.pickUpMethod =  tabIndex == -1 ? '' : '' + ( tabIndex + 1 );
					pub.remarks = $(".set_order_remark input").val(); // 备注
					
					pub.customMobile = $(".set_contact_information input").val();
					if (common.goodsType.getItem() == 'ZHENG_JIAN') {
						pub.activityType = 7;
						if (!common.PHONE_NUMBER_REG.test( pub.customMobile )) {
							common.prompt('手机号输入错误');
							//$('.order_submit_right').addClass('confirm-submit').html('提交订单').css("background-color",'#93c01d');
							return;
						}
					}
					$('.order_submit_right').removeClass('confirm-submit').css("background-color","#999").html("提交中...");
					// 普通 + 换购 + 预购 公共参数
					pub.orderParamInfo = {
						pickUpMethod : pub.pickUpMethod,
						addrId : pub.addrId,
						firmId : pub.firmId,
						orderFrom : pub.orderFrom,
						message : pub.remarks,
					};
					switch( Number( pub.orderType ) ){
						case 1 : PLAIN.submit(); break; // 普通 提交
						case 2 : BARTER.submit(); break; // 换购 提交
						case 3 : PRE.submit(); break; // 预购提交
					}
				});
			},
		};
	
		// 普通订单提交
		PLAIN.submit = function(){
			common.ajaxPost($.extend({
				method : 'order_submit_three',
				couponId : pub.couponId,
				juiceDeliverTime : $('#person_area').val(),
				goodsList : pub.goodsInfoApi,
				activityType:pub.activityType,
				customMobile:pub.customMobile,
			},pub.userBasicParam, pub.orderParamInfo ),function( d ){
				
				if ( d.statusCode == "100000" ) {
					common.orderCode.setItem( d.data.orderCode );
					common.orderBack.setItem( '1' );
					/*
					var goodsCart = common.JSONparse( common.good.getItem() );
					for(var i = 0; i < goodsCart.length; i++ ){
						if( goodsCart[i].status == 1 ){
							goodsCart.splice(i,1);
							i--;
						}
					}*/
					cart.removeShopCar();
					//common.good.setItem( common.JSONStr( goodsCart ) ); // 存储数据
					common.addressData.getKey() && common.addressData.removeItem();
					common.first_data.removeItem();
					common.two_data.removeItem();
					common.addType.removeItem();
					//common.setShopCarNumApp(0);
					/*if (d.data.orderStatus == '3') {
						common.jumpLinkPlainApp( "订单管理","html/order_management.html" );
					}else{
						common.jumpLinkPlainApp( "订单支付","html/order_pay.html" );
					}*/
					common.jsInteractiveApp({
						name:'goToNextLevel',
						parameter: d.data.orderStatus == '3' ? {
										title:'订单管理',
										url:'html/address_management.html'
									} : {
										title:'订单支付',
										url:'html/order_pay.html'
									}
					})
					
				}else if ( d.statusCode == "100711" ) {
					common.prompt("地址不在配送范围");
				}else if ( d.statusCode == "100718" ){
					common.prompt("请选择配货时间");
				}else if ( d.statusCode == "100514" ){
					$(".order_refund_confirm").html( "月卡余额不足！请充值" );
					$(".order_refund").show();
				}else{
					common.prompt( d.statusStr );
				}
				pub.submitBtn.addClass( 'confirm-submit' ).css("background-color",'#93c01d').html("提交订单");
			},function( d ){
				common.prompt( d.statusStr );
				pub.submitBtn.addClass( 'confirm-submit' ).css("background-color",'#93c01d').html("提交订单");
			},function(){
				pub.submitBtn.addClass( 'confirm-submit' ).css("background-color",'#93c01d').html("提交订单");
			});
		};
	
		
		/*=--------选择优惠卷----------*/
		pub.selectCoupon = {};
		pub.selectCoupon.apiHandle = {
			init:function(){
				pub.selectCoupon.List = common.couponInfoList.getItem() ? JSON.parse(common.couponInfoList.getItem()) : [];
				pub.selectCoupon.Info = common.couponInfo.getItem() ? JSON.parse(common.couponInfo.getItem()) : {};
				var id = pub.selectCoupon.Info.id;
				pub.selectCoupon.apiHandle.couponList(pub.selectCoupon.List , id)
			},
			// 优惠券列表
			couponList : function( couponInfolist , couponId){
				var selectCoupon = $('.select_coupon'),
					couponBox = selectCoupon.find(".main"),
					html1 = '',
					html2 = '';
					
				if ( $.isArray(couponInfolist) && couponInfolist.length != 0) {
					couponInfolist.forEach(function( v, i ){
						if (v.isCanUse > 0) {
							if(couponId == v.id){
								html1 +='<div class="coupon_list_item active" data-name="'+v.couponName+'" data-id="'+v.id+'" data-money="'+v.couponMoney+'">'
							}else{
								html1 +='<div class="coupon_list_item" data-name="'+v.couponName+'" data-id="'+v.id+'" data-money="'+v.couponMoney+'">'
							}
							html1 +='	<div class="coupon_list_item_top clearfloat">'
							html1 +='		<div class="float_left">'
							html1 +='			<p>'+v.couponName+'</p>'
							html1 +='			<p>有效期至：'+v.endTime+'</p>'
							html1 +='		</div>'
							html1 +='		<div class="float_right"></div>'
							html1 +='	</div>'
							html1 +='	<div class="coupon_list_item_bg"><img src="../img/coupon_bg.png"></div>'
							html1 +='	<div class="coupon_list_item_bottom">'
							html1 +='		<p>'+v.applyTo+'</p>'
							
							/*
							html1 +='		<p class="color_F73A3A">不可用原因：不在当前门店</p>'
							*/
							
							html1 +='	</div>'
							html1 +='</div>'
						}else{
							html2 +='<div class="coupon_list_item">'
							html2 +='	<div class="coupon_list_item_top clearfloat">'
							html2 +='		<div class="float_left">'
							html2 +='			<p>'+v.couponName+'</p>'
							html2 +='			<p>有效期至：'+v.endTime+'</p>'
							html2 +='		</div>'
							html2 +='		<div class="float_right"></div>'
							html2 +='	</div>'
							html2 +='	<div class="coupon_list_item_bg"><img src="../img/coupon_bg.png"></div>'
							html2 +='	<div class="coupon_list_item_bottom">'
							html2 +='		<p>'+v.applyTo+'</p>'
							if (v.notApplicable) {
								html2 +='		<p class="color_F73A3A">'+v.notApplicable+'</p>'
							}
							html2 +='	</div>'
							html2 +='</div>'
						}
					});
					
					if (html1) {
						html1 = '<p class="title">可用优惠卷</p>' + html1; 
						couponBox.find(".cuopon_management_contain1").html(html1)
					}
					
					if (html2) {
						html2 = '<p class="title">不可用优惠卷</p>' + html2;
						couponBox.find(".cuopon_management_contain2").html(html2)
					}
					
					if (!couponBox.find(".cuopon_management_contain1 .coupon_list_item.active").length) {
						$(".select_coupon_top").addClass("active");
					}else{
						$(".select_coupon_top").removeClass("active");
					}
				}else{
					//couponBox.html("暂无优惠卷");	
				}
				selectCoupon.fadeIn(300)
			},
			
		}
		
		pub.selectCoupon.eventHandle = {
			init:function(){
				$(".cuopon_management_contain1").on("click",".coupon_list_item",function(){
					var _this = $(this),
						isActive = _this.is(".active"),
						couponName = _this.attr("data-name"),
						couponId = _this.attr("data-id"),
						couponMoney = _this.attr("data-money");
					if(!isActive){
						_this.addClass("active").siblings().removeClass("active");
						$(".select_coupon_top").removeClass("active");
						/*$(".set_coupon_box_item_text").html("<span>"+couponName+"</span>");
						$(".set_coupon_box_item_text").attr({"couponId":couponId,"couponName":couponName,"couponMoney":couponMoney});
						pub.couponId = couponId;
						
						PLAIN.apiHandle.shop_cart_submit.init(); // 优惠券请求
						pub.switchInput("订单结算",".select_coupon",".orderSettlement")
						*/
						common.couponInfo.setItem(JSON.stringify({
							'couponName':couponName,
							'id':couponId,
							'couponMoney':couponMoney
						}));
						//common.goBackApp(1,1,'html/orderSettlement.html');
						common.jsInteractiveApp({
							name:'goBack',
							parameter:{
								'num':1,
								'type':1,
								'url':'html/orderSettlement.html'
							}
						})
					}else{
						/*pub.switchInput("订单结算",".select_coupon",".orderSettlement")*/
					};
					
				})
				$(".select_coupon_top").on("click",function(){
					var _this = $(this),
						isActive = _this.is(".active");
					/*if (isActive) {
						var couponInfoCount = _this.attr("couponinfocount");
						if (couponInfoCount > 0) {
							$(".set_coupon_box_item_text").html(couponInfoCount+"张可用优惠卷")
						}else{
							$(".set_coupon_box_item_text").html("无可用优惠卷").addClass("color_999")
						}
					}else{
						_this.addClass("active");
					}
					pub.couponId = null;
					PLAIN.apiHandle.shop_cart_submit.init(); // 优惠券请求
					*/
					if (!isActive) {
						_this.addClass("active");
						$(".cuopon_management_contain1 .coupon_list_item.active").removeClass("active");
					}
					common.couponInfo.setItem(JSON.stringify({}))
					//common.goBackApp(1,true,'html/orderSettlement.html');
					common.jsInteractiveApp({
						name:'goBack',
						parameter:{
							'num':1,
							'type':1,
							'url':'html/orderSettlement.html'
						}
					})
				})
			}
		}
		pub.selectCoupon.init = function(){
			pub.selectCoupon.apiHandle.init();
			pub.selectCoupon.eventHandle.init();
		}
		
		// 换肤
		pub.apiHandle.change_app_theme = {
			init:function(){
				if (common.huanfu.getItem() && common.huanfu.getItem() != 1) {
					$(".order_goods_contain_details,.order_submit").addClass("skin"+sessionStorage.getItem("huanfu"))
				}
			}
		}
		// 模块初始化
		pub.init = function(){
			if (!common.huanfu.getKey()) {
				common.change_app_theme();
				common.defHuanfu.done(function(){
					pub.apiHandle.change_app_theme.init();
				})
			}else{
				pub.apiHandle.change_app_theme.init();
			}
			if (pub.moduleId == 'orderSettlement') {
				
				pub.orderType = common.orderType.getItem() || 1; // 接收订单类型  主要指商品类型1.普通，2.秒杀，3.预购
				pub.goodsInfoApi = cart.goodlist1(); // 接收接口所需字段
				pub.tabIndex = common.addType.getKey() ? common.addType.getItem() : 0;// 配送方式 tab 索引
				pub.orderFrom =  pub.isApp ? "APP" : 'H5'; // 生成订单来源方式
				pub.submitBtn = $('.order_submit_right'); // 提交按钮节点
				pub.firmId = pub.userData.firmId; // 获取门店ID
				
				pub.goodsType = common.goodsType.getItem();//商品类型
				$(".set_contact_information,.set_delivery_box").hide()
				
				
				// 自动选择 取货方式
				if( common.addType.getKey() ){
					pub.tabIndex == 0  && ( pub.addrId = '' );
					pub.pickUpMethod = pub.tabIndex == 0 ? '1' : '2';
					$('.set_charge_contact_right','.set_charge_contact').find('li').eq( +pub.tabIndex ).addClass('actived');
					$('.set_charge_con').find('.set_charge_address').hide().eq( +pub.tabIndex ).show();
				}
				// 用户配送地址
				if( common.addType.getKey() && common.addressData.getKey() ){
					pub.AddrInfoRender( common.JSONparse( common.addressData.getItem() ) ); // 地址数据渲染
				}else{
					pub.apiHandle.address_default_show.init(); // 地址获取
				}
				
				if (common.goodsType.getItem() == 'ZHENG_JIAN') {
					pub.activityType = 7;
					$(".set_contact_information,.set_charge_con .set_delivery_box").show();
				}
						
				pub.addrDtd.done(function(){
					pub.orderType == "1" && pub.plain.init(); // 普通商品
					pub.orderType == "2" && pub.seckill.init(); // 秒杀
					pub.orderType == "3" && pub.pre.init();// 预购
				});
		
				
				pub.apiHandle.storeInfo.init(); // 门店信息
				
				pub.eventHandle.init();
				$("body").fadeIn(300)
			} else if (pub.moduleId == 'selectCoupon'){
				pub.selectCoupon.init();
			}
			
			
		};
		pub.init();
	})
});