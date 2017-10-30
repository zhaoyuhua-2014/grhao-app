/*
* orderSettlement scirpt for Zhangshuo Guoranhao
*/ 
define(function(require, exports, module){

	var common = require( 'lib/common.js?v=20000' );
	var cart = require( 'lib/goshopCar.js?v=20000' );
	var area = require('LArea');
	// 命名空间

	pub = {};
	pub.addrDtd = $.Deferred();
	pub.logined = common.isLogin(); // 是否登录
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
		common.jumpLinkPlain('../index.html'); // 未登录跳转首页
	}

	pub.goodsList = null; // 普通商品 购物车商品列表

	pub.hasCouponId = common.sortCouponId.getKey(); // 存在优惠券id

	pub.dom = common.getUrlParam('dom');

	if( pub.dom ){
		pub.dom = pub.dom.substr(0,3) == 'dom';
	}

	pub.location = common.location.getKey(); 

	if( pub.hasCouponId ){
		pub.couponId = common.sortCouponId.getItem();
		common.sortCouponId.removeItem();
	}else{
		pub.couponId = null;
	}
	pub.addrId = null; // 地址id
	pub.pickUpMethod = null; // 取货方式 1.门店自提，2.送货上门
	pub.orderCode = null; // 预购商品 订单编号
	pub.goodsId = null; // 预购 + 秒杀 + 换购 商品id
	pub.remarks = null; // 备注
	pub.isApp = common.isApp(); // 获取 app 环境

	pub.orderParamInfo = null;
	pub.couponInfo = [
		/*{ text : '商品总价', key : 'goodsMoney', sign : "￥" }, // 0
		{ text : '运费', key : 'postCost', sign : "￥" }, // 1
		{ text : '优惠券金额', key : 'couponMoney', sign :"-￥" }, // 2*/
		{ text : '立减优惠：', key : 'derateAmount' , sign :"-￥" }, // 3
		{ text : '折扣优惠：', key : 'derateAmount', sign : "-￥" }, // 4
		{ text : '赠送果币：', key : 'offScore', sign : "个"}, // 5
		{ text : '赠送优惠券：', key : 'derateAmount', sign : '元券'}, // 6
	];

	// 普通 命名空间
	pub.plain = {};
	// 普通 接口数据处理
	pub.plain.apiHandle = {
		init : function(){
			pub.plain.apiHandle.shop_cart_submit.init();
		},
		shop_cart_submit : {
			init : function(){
				common.ajaxPost($.extend({},{
					method : 'shop_cart_submit',
					goodsList : pub.goodsInfoApi, // 接口 所需字段
					pickUpMethod : pub.pickUpMethod,
					couponId : pub.couponId,
				},pub.userBasicParam), function( d ){
					d.statusCode == "100000" && pub.plain.apiHandle.shop_cart_submit.apiData( d );
				});
			},
			apiData : function( d ){
				var 
				orderInfo = d.data.order, // 订单商品信息
				couponInfolist = d.data.CouponInfolist, // 优惠券 
				time = d.data.time, // 时间
				calendar = d.data.calendar; // 日期
				pub.plain.apiHandle.shop_cart_submit.goodsPriceInfo( orderInfo ); // 商品价格信息

				!!calendar && !!time && pub.plain.apiHandle.shop_cart_submit.dispatchTime( calendar, time ); // 派送时间
				!!couponInfolist && pub.orderType == "1" && pub.plain.apiHandle.shop_cart_submit.couponList( couponInfolist ); // 优惠券列表
			},
			// 优惠券列表
			couponList : function( couponInfolist ){
				var  
				nodeBox = $('.set_coupon_box'),
				html = '<p data="">请选择优惠券</p>';
				if( $.isArray(couponInfolist) && couponInfolist.length != 0 ){
					couponInfolist.forEach(function( v, i ){
					 	html += '<p data="' + v.id + '">' + v.couponMoney + '元-' + v.couponName + '</p>';
					});
				}
				nodeBox.show().find('.set_coupon_box1_bottom').html( html );
				$('.set_coupon_box1_top').html( $('.set_coupon_box1_bottom [data=' + pub.couponId + ']').html() );
			},
			// 配送时间
			dispatchTime : function( cal, t ){

				var time = {}, dataFormat = function( param ){
					var arr = [];
					param.forEach(function(v,i){
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
			goodsPriceInfo : function( orderInfo ){
				var 
				listBoxNode = $(".order_set_list"),
				listNode = listBoxNode.find('li');

				listNode.eq(0).show().find(".float_right").html( "￥" + orderInfo.goodsMoney).parent() // 商品总价
				.next().show().find(".float_right").html( "￥" + orderInfo.postCost ); // 运费
				
				//优惠券金额
				(function(){
					if( pub.orderType == "3" ){
						listNode.eq(2).hide();
					}else{
						listNode.eq(2).show().find(".float_right").html( orderInfo.couponMoney > 0 ? "-￥" + orderInfo.couponMoney : "￥0" );
					}
				}());
				// 优惠券优惠价格信息
				(function(){
					if( 0 < orderInfo.couponStrategy && orderInfo.couponStrategy < 5  ){
						var couponInfo = pub.couponInfo[ +orderInfo.couponStrategy + 1 ];
						listNode.eq(3).show().find(".float_left").html( couponInfo.text ).next().show().html(function(){
							var sign = couponInfo.sign;
							if( sign == '-￥' ) 
								return sign + couponInfo[key];
							return couponInfo[key] + sign;
						});
					}else{
						listNode.eq(3).hide();
					}
				}());
				listNode.eq(5).show().find(".float_right").html( "￥" + orderInfo.realPayMoney );
				$(".order_submit_money").html( orderInfo.realPayMoney );
				listBoxNode.show();
			},
		},
	};
	// 普通商品 列表
	pub.plain.goodList = function(){
		var html = '';
		pub.goodsList.forEach(function( v, i){
			
			if( v.status == 1 ){
				html += '<dl class="gds_box clearfloat">'
				html += '   <dt>'
				html += '		<img src="' + v.logo+'"/>'
				if ( pub.orderType == "2" ) {
					html += '<img class="gds_goods_te" src="../img/icon_te_s.png"/>'
				}else{
					if( v.isspecial ){
						html += '<img class="gds_goods_te" src="../img/icon_te_s.png"/>'
					}
				}
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
			if (pub.orderType == 2) {
				html += '<dl class="gds_box clearfloat">'
				html += '   <dt>'
				html += '		<img src="' + v.logo+'"/>'
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
	pub.plain.init = function(){
		pub.goodsInfoApi = cart.goodlist1(); // 接口字段
		pub.goodsList = cart.goodlist2(); // 购物车商品列表
		pub.plain.apiHandle.init(); // 接口初始化
		pub.plain.goodList();
	};

	// 秒杀 命名空间
	pub.seckill = {};
	pub.seckill.buyNumber = "1"; // 秒杀数量设置
	pub.seckill.goodList = function(){ // 秒杀商品 列表
		pub.plain.goodList.call( this, pub.goodsList ); // 借用方法 参数在初始化函数
	};
	pub.seckill.goodsPriceInfo = function(){ // 秒杀商品 价格信息
		var 
		price = common.JSONparse( pub.goodsList[0].price ),
		listBoxNode = $( ".order_set_list" ),
		listNode = listBoxNode.find('li');

		listBoxNode.find('.group').hide(); // 优惠卷金额 + 立减优惠 + 包月卡优惠
		listNode.eq(0).show().find(".float_right").html( "￥" + price) // 总价
				.parent().next().show().find(".float_right").html("￥0"); //运费
		listNode.eq(5).show().find(".float_right").html("￥" + price ); //合计、总计
		$(".order_submit_money").html( price );
		listBoxNode.show();
	};
	pub.seckill.init = function(){ // 秒杀初始化
		pub.goodsList = common.JSONparse( common.seckillGood.getItem() ); // 秒杀商品信息;
		console.log(pub.goodsList)
		pub.goodsId = pub.goodsList[0].id; // 接收秒杀商品 id
		this.goodList(); // 秒杀商品 列表
		this.goodsPriceInfo(); // 秒杀商品 价格信息
	};

	// 预购 命名空间
	pub.pre = {};
	pub.pre.source = null; // 预购商品
	pub.pre.sign = null; // 预购商品
	// 预购接口数据处理
	pub.pre.apiHandle = {
		pre_order_details : {
			init : function(){
				common.ajaxPost({
					method : 'pre_order_details',
					tokenId : pub.tokenId,
					orderCode : pub.orderCode,
					source : pub.pre.source,
					sign : pub.pre.sign
				},function( d ){
					d.statusCode == "100000" &&  pub.pre.apiHandle.pre_order_details.apiData( d );
				});	
			},
			apiData : function( d ){
				d = d.data; // 商品信息列表
				pub.goodsId = d.preGoodsId; // 预购商品ID
				pub.pre.goodList( d ); // 预购商品信息列表
				pub.pre.apiHandle.pre_shop_cart_submit.init(); // 预购结算购物车
			}
		},
		pre_shop_cart_submit : {
			init : function(){
				var self = this;
				common.ajaxPost( $.extend({},{
					method : 'pre_shop_cart_submit',
					pickUpMethod : pub.pickUpMethod,
					preGoodsId : pub.goodsId,
				},pub.userBasicParam),function( d ){
					d.statusCode == "100000" && pub.plain.apiHandle.shop_cart_submit.apiData.call( self, d ); // 借用普通商品 
				});
			}
		}
	};
	// 预购商品 列表
	pub.pre.goodList = function( list ){
		var html = '';
		html += '<dl class="gds_box clearfloat">'
		html += '   <dt>'
		html += '		<img src="' + list.goodsInfo.goodsLogo + '"/>'
		html += '		<img class="gds_goods_te" src="../img/icon_yu_s.png"/>'
		html += '	</dt>'
	    html += '	<dd>'
		html += '	    <div class="gds_right_top">' + list.goodsInfo.goodsName + '</div>'
		html += '	    <div class="gds_right_center clearfloat">'
		html += '		    <div class="gds_goods_mess float_left">' + list.goodsInfo.specInfo + '</div>'
		html += '		    <div class="gds_num_price float_right clearfloat">'
		html += '	            <div class="gds_price float_right">X<span>' + list.buyNum + '</span></div>'
		html += '	            <div class="gds_num float_right">￥<span>' + common.toFixed( list.retainage ) + '</span></div>'
		html += '           </div>'
		html += '	    </div>'
		html += '		<div class="gds_right_bottom">'
		html += '			<p class="float_left">'
		html += '				<span>定金：</span><span class="font_color">￥' + list.preGoods.frontMoney + '</span>'
		html += '			</p>'
		html += '			<p class="float_left">'
		html += '				<span>尾款：</span><span class="font_color">￥' + list.preGoods.retainage + '</span>'
		html += '			</p>'
		html += '		</div>'
		html += '    </dd>'
	    html += '</dl>'
	    $(".order_goods_contain_details").append(html);
	};
	// 预购初始化
	pub.pre.init = function(){
		pub.orderCode = common.orderCode.getItem();
		pub.pre.source = 'preOrderCode' + pub.orderCode;
		pub.pre.sign = md5( pub.pre.source + "key" + common.secretKeyfn() ).toUpperCase();
		//pub.pre.goodList(); // 预购列表
		pub.pre.apiHandle.pre_order_details.init();
	};

	// 公共接口
	pub.apiHandle = {

		// 门店信息
		storeInfo : {
			init : function(){
				var data = { method : 'firm_default' };
				if( pub.firmId != '0' ){
					data.method = 'firm_list';
					data.firmId = pub.firmId;
				}
				common.ajaxPost( data,function( d ){
					d.statusCode == "100000" && pub.apiHandle.storeInfo.apiData( d ); 
				});
			},
			apiData : function( d ){
				var d = d.data[0] ? d.data[0] : d.data;
				node = $(".set_charge_address2");
				pub.firmId = d.id;
				$(".set_charge_con").show();
				node.find('.take_goods_phone').html( d.firmName )
					.end().find('.set_address_bottom').html( "地址：" + d.address )
					.end().find('.set_job_time').html( "营业时间：" + d.pickUpTime );
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
		pub.addrDtd.resolve(); // 触发延时对象
		pub.addrId = d.id; // 接收地址ID
		$('.set_charge_contact').attr( 'addr-id', pub.addrId ); // 暂存 ID
		$('.set_charge_address1').find('.set_address_top').show().find('.take_goods_name').html( d.consignee )
		.next().html( d.mobile ).parent().next().html( d.provinceName + d.cityName + d.countyName + d.street );
		common.addressData.getKey() && common.addressData.removeItem();
	};

	// 公共事件处理函数
	pub.eventHandle = {

		init : function(){

			// 回退
			common.jumpLinkSpecial(".header_left",function(){
				common.addType.removeItem();
				if( pub.dom ){
					window.location.replace('../index.html');
				}else{
			    	window.history.back();
				}
			});			

			// 优惠券说明 
			$("#coupon_msg").on("click",function(){
		    	$('.pop').css({'display':'block'});
		    	$("body").css("overflow-y","hidden");
		    	$(".pop_prompt").html("特价商品不参与优惠卷计算");
		   	});

		   	// 弹窗确认 关闭弹窗
			$('.pop_makeSure').on('click',function(){
				$('.pop').css({'display':'none'});
				$("body").css("overflow-y","auto");
			});

			$('.set_coupon_box1_top').on('click',function(){
				$('.set_coupon_box1_bottom').toggle();
			});

			// 优惠券
			$(".set_coupon_box1_bottom").on('click',"p",function(){
				var 
				$this = $(this),
				couponName = $this.html();
				pub.couponId = $this.attr( "data" );
				common.sortCouponId.setItem( pub.couponId ); // 存优惠券ID
				$(".set_coupon_box1_top").html( couponName ).next('.set_coupon_box1_bottom').hide();
				pub.plain.apiHandle.shop_cart_submit.init(); // 优惠券请求
			});

			// 配送方式切换
			$('.set_charge_contact li').on('click',function(){
				var 
				$this = $(this),
				isCur = $this.is('.actived'),
				index = $this.index();
				$this.addClass('actived').siblings().removeClass('actived');
				$('.set_charge_address').eq( index ).show().siblings().hide();
				var tabIndex = $('.set_charge_contact_right').find('li.actived').index();
				if( !isCur ){
					pub.addrId = index == 0 ? '' : $('.set_charge_contact').attr('addr-id');
					pub.pickUpMethod =  tabIndex == -1 ? '' : '' + ( tabIndex + 1 );
					common.addType.setItem( index );
					common.orderType.getItem() == "1" && pub.plain.apiHandle.shop_cart_submit.init(); // 普通
					common.orderType.getItem() == "3" && pub.pre.apiHandle.pre_shop_cart_submit.init(); // 预购
				} 
			});
			

			$(".set_charge_address").on("click",function(){
				if ($(this).is(".set_charge_address2")) {
					common.jumpLinkPlainApp( '门店地址',"html/store.html?store=store" );
				}
				if ($(this).is('.set_charge_address1')) {
					common.addType.setItem( "1" );
					if($(".set_charge_contact").attr("addr-id")){
						window.localStorage.setItem("addId",$(".set_charge_contact").attr("addr-id"))
					}
					common.jumpLinkPlainApp( '地址列表',"html/address_management.html" );
				}
			});
			// 提交订单
			$('.order_submit').on('click','.confirm-submit',function(){
				$(this).removeClass('confirm-submit');
				var tabIndex = $('.set_charge_contact_right').find('li.actived').index();

				pub.pickUpMethod =  tabIndex == -1 ? '' : '' + ( tabIndex + 1 );
				pub.remarks = $(".set_order_remark input").val(); // 备注
				// 普通 + 秒杀 + 预购 公共参数
				pub.orderParamInfo = {
					pickUpMethod : pub.pickUpMethod,
					addrId : pub.addrId,
					firmId : pub.firmId,
					orderFrom : pub.orderFrom,
					message : pub.remarks,
				};
				pub.orderType == "1" && pub.plain.submit(); // 普通 提交
				pub.orderType == "2" && pub.seckill.submit(); // 秒杀 提交
				pub.orderType == "3" && pub.pre.submit(); // 预购提交
			});
		},
	};

	// 普通订单提交
	pub.plain.submit = function(){
		common.ajaxPost($.extend({
			method : 'order_submit',
			couponId : pub.couponId,
			juiceDeliverTime : $('#person_area').val(),
			goodsList : pub.goodsInfoApi
		},pub.userBasicParam, pub.orderParamInfo ),function( d ){
			if ( d.statusCode == "100000" ) {
				common.orderCode.setItem( d.data.orderCode );
				common.orderBack.setItem( '1' );

				var goodsCart = common.JSONparse( common.good.getItem() );
				for(var i = 0; i < goodsCart.length; i++ ){
					if( goodsCart[i].status == 1 ){
						goodsCart.splice(i,1);
						i--;
					}
				}
				common.good.setItem( common.JSONStr( goodsCart ) ); // 存储数据

				common.first_data.removeItem();
				common.two_data.removeItem();
				common.addType.removeItem();
				common.setShopCarNumApp(0);
				common.jumpLinkPlainApp( "订单支付","html/order_pay.html" );
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
			pub.submitBtn.addClass( 'confirm-submit' );
		},function( d ){
			common.prompt( d.statusStr );
			pub.submitBtn.addClass( 'confirm-submit' );
		});
	};

	// 秒杀商品 提交
	pub.seckill.submit = function(){
		common.ajaxPost($.extend( {
			method : 'barter_order_submit',
			goodsId : pub.goodsId,
			buyNumber : pub.seckill.buyNumber,
		},pub.userBasicParam, pub.orderParamInfo ),function( d ){
			if( d.statusCode == "100000" ){
				common.orderCode.setItem( d.data.orderCode );
				common.orderBack.setItem( "1" );
				common.seckillGood.removeItem();
				common.addType.removeItem();
				common.historyReplace( 'order_management.html' );
				common.jumpLinkPlainApp( "订单支付","html/order_pay.html" );
			}else if ( d.statusCode == "100711" ) {
				common.prompt("地址不在配送范围");
			}else if ( d.statusCode == "100514" ){
				$(".order_refund_confirm").html( "月卡余额不足！请充值" );
				$(".order_refund").show();
			}else{
				common.prompt( d.statusStr );
			}
			pub.submitBtn.addClass( 'confirm-submit' );
		},function( d ){
			common.prompt( d.statusStr );
			pub.submitBtn.addClass( 'confirm-submit' );
		});
	};
	// 预购订单 提交
	pub.pre.submit = function(){
		common.ajaxPost($.extend({
			method : 'pre_order_submit',
			preOrderCode : pub.orderCode,
			couponId : pub.couponId
		}, pub.userBasicParam, pub.orderParamInfo ),function( d ){
			if ( d.statusCode == "100000" ) {
				common.orderCode.setItem( d.data.orderCode );
				common.addType.removeItem();
				common.jumpLinkPlainApp( "订单支付","html/order_pay.html" );
			}else if ( d.statusCode == "100711" ) {
				common.prompt( "地址不在配送范围" );
			}else{
				common.prompt( d.statusStr );
			}
			pub.submitBtn.addClass( 'confirm-submit' );
		},function( d ){
			common.prompt( d.statusStr );
			pub.submitBtn.addClass( 'confirm-submit' );
		});
	};

	// 模块初始化
	pub.init = function(){
		pub.orderType = common.orderType.getItem() || 1; // 接收订单类型  主要指商品类型1.普通，2.秒杀，3.预购
		pub.goodsInfoApi = cart.goodlist1(); // 接收接口所需字段
		pub.tabIndex = common.addType.getKey() ? common.addType.getItem() : 0;// 配送方式 tab 索引
		pub.orderFrom =  pub.isApp ? "APP" : 'H5'; // 生成订单来源方式
		pub.submitBtn = $('.order_submit_right'); // 提交按钮节点
		pub.firmId = pub.userData.firmId; // 获取门店ID
		// 自动选择 取货方式
		if( common.addType.getKey() ){
			pub.tabIndex == 0  && ( pub.addrId = '' );
			pub.pickUpMethod = pub.tabIndex == 0 ? '1' : '2';
			$('.set_charge_contact_right','.set_charge_contact').find('li').eq( +pub.tabIndex ).addClass('actived');
			$('.set_charge_con').find('.set_charge_address').eq( +pub.tabIndex ).show().siblings().hide();
		}

		// 用户配送地址
		if( common.addType.getKey() && common.addressData.getKey() ){
			pub.AddrInfoRender( common.JSONparse( common.addressData.getItem() ) ); // 地址数据渲染
		}else{
			pub.apiHandle.address_default_show.init(); // 地址获取
		}

		pub.addrDtd.done(function(){
			pub.orderType == "1" && pub.plain.init(); // 普通商品
			pub.orderType == "2" && pub.seckill.init(); // 秒杀
			pub.orderType == "3" && pub.pre.init();// 预购
		});

		
		pub.apiHandle.storeInfo.init(); // 门店信息
		
		pub.eventHandle.init();

	};
	module.exports = pub;
});