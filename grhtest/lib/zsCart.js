define(function(require,exports,module){

	var common = require('lib/common.js?v=20000');
	var cart = require( 'lib/goshopCar.js?v=20000' );
	var pub = {};

	
	pub.cartData = common.JSONparse( common.good.getItem() ); // 读取本地数据
	pub.logined = common.isLogin(); // 是否登录

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
	};

	pub.allSelect = function(){
		var selectNode = $('.line-wrapper','#ul-box').find('.select-dot');
		if( selectNode[0] && pub.cartData.length == selectNode.size() ){
			$('#all-select','#total').find('span').eq(0).addClass('select-dot').removeClass('unselect-dot');
		}else{
			$('#all-select','#total').find('span').eq(0).addClass('unselect-dot').removeClass('select-dot');
		}
		$('#all-select','#total').bind('click',function( e ){
			var $this = $(this),
			span = $this.find('span').eq(0),
			selected = span.hasClass('select-dot');
			pub.cartData = common.JSONparse( common.good.getItem() );
			if( selected ){
				span.removeClass('select-dot').addClass('unselect-dot');
				$('.line-wrapper','#ul-box').find('.select').removeClass('select-dot').addClass('unselect-dot');
				pub.cartData.forEach(function(v,i){ v.status = 0; });
			}else{
				span.removeClass('unselect-dot').addClass('select-dot');
				$('.line-wrapper','#ul-box').find('.select').removeClass('unselect-dot').addClass('select-dot');
				pub.cartData.forEach(function(v,i){ v.status = 1; });
			}
			common.good.setItem(common.JSONStr( pub.cartData ));
			cart.style_change();
			common.setShopCarNum_ShoppingCartApp(cart.getgoodsNum())
		});
	};
	// 单选处理
	pub.pickUp = function(){
		$('#ul-box').on('click','.select-node',function(){
			pub.listLen = $('.select-node').length;
			var $this = $(this),
			selected = $this.find('.select').hasClass('select-dot'),
			id = $this.parents('.line-wrapper').attr('data');
			pub.cartData = common.JSONparse( common.good.getItem() );
			if( selected ){
				$this.find('.select').removeClass('select-dot').addClass('unselect-dot');
				$('#all-select').find('span').eq(0).removeClass('select-dot').addClass('unselect-dot');
				
				pub.cartData.forEach(function(v,i){
					if( v.id == id ){
						v.status = 0; common.good.setItem(common.JSONStr( pub.cartData )); return;
					}
				});
				cart.style_change();
				common.setShopCarNum_ShoppingCartApp(cart.getgoodsNum())
			}else{
				$this.find('.select').removeClass('unselect-dot').addClass('select-dot');
				var len = $('.select-dot').length;
				if( pub.listLen == len ){
					$('#all-select').find('span').eq(0).removeClass('unselect-dot').addClass('select-dot');
				}
				pub.cartData.forEach(function(v,i){
					if( v.id == id ){
						v.status = 1; common.good.setItem(common.JSONStr( pub.cartData )); return;
					}
				});
				cart.style_change();
				common.setShopCarNum_ShoppingCartApp(cart.getgoodsNum())
			}
		});
	};


	pub.drag = function(){
    	$('#ul-box').on('click','.delete-btn',function(){
    		var 
    		$this = $(this),
    		id = $this.parents('.line-wrapper').attr('data');
    		pub.cartData = common.JSONparse( common.good.getItem() );
    		for(var i = 0; i < pub.cartData.length; i++ ){
				if( pub.cartData[i].id == id ){
					pub.cartData.splice(i,1);
					common.good.setItem( common.JSONStr( pub.cartData ));
					pub.cartData = common.JSONparse( common.good.getItem() );
					cart.style_change();
					common.setShopCarNum_ShoppingCartApp(cart.getgoodsNum())
					break;
				}
    		}
			$this.parents('.line-wrapper').remove();
			var 
			listLen = $('.line-wrapper','#ul-box').length,
			selectDotLen = $('.select-node .select-dot','#ul-box').length;
			listLen == 0  && $('#empty-cart').show().appendTo('#ul-box');
			listLen == selectDotLen && $('#all-select','#total').find('span:eq(0)').addClass('unselect-dot').removeClass('select-dot');
			$('.footer_item[data-content]').attr('data-content',cart.getgoodsNum() );
    	});
	};

	pub.shop_cart_submit = {
		init : function(){
			common.ajaxPost($.extend({}, pub.userBasicParam, {
				method : 'shop_cart_submit',
				goodsList : pub.goodsList
			}),function( d ){
				if ( d.statusCode == "100000" ) {
					common.orderType.setItem( '1' );
					common.jumpLinkPlainApp("订单结算", "html/order_set_charge.html" );
				}else{
					common.prompt( d.statusStr );
				}
			})
		}
	};
	$('#select-delete').bind('click',function(e){
		common.stopEventBubble(e);
		pub.dataSourse = common.JSONparse( common.good.getItem() );
		pub.listNode = $('.line-wrapper','#ul-box');
		pub.dealNode = pub.listNode.find('.select-node .select-dot');
		if( pub.listNode.length == 0 ){
			common.prompt('购物车为空'); return;
		}
		if( pub.dealNode.length == 0 ){
			common.prompt('请选择商品'); return;
		}
		$('.order_refund').show();
	});
	$('.order_refund').bind('click',function(e){
		if( e.target.className == 'refund_bg' || e.target.className == "refund_cancle" || e.target.className == "makeSure" ){
			$(this).hide();
		}
	});

	$('.order_refund_choose .makeSure').on('click',function(e){

		common.stopEventBubble(e);

	    $('.order_refund').hide();
	    $("body").css("overflow-y","auto");
    });

	pub.pickUpDeltele = function(){
		$('.makeSure').bind('click',function(){
			pub.dealNode.each(function(){
				var dataId = $(this).parents('.line-wrapper').attr('data');
				for(var i = 0; i < pub.dataSourse.length; i++ ){
					if( dataId ==  pub.dataSourse[i].id ){
						pub.dataSourse.splice(i,1);i--;
					}
				}
			});
			common.good.setItem( common.JSONStr( pub.dataSourse ) );
			var removeNode = pub.dealNode.parents('.line-wrapper').remove();
			removeNode = null;
			$('.totalmoney','#total').text('¥0.00');
			if( $('.line-wrapper','#ul-box').length == 0 ){
				$('#empty-cart').show().appendTo('#ul-box');
				$('.footer_item[data-content]').attr('data-content',0)
			}
			$('#all-select','#total').find('span:eq(0)').removeClass('select-dot').addClass('unselect-dot');
			cart.style_change();
			common.setShopCarNum_ShoppingCartApp(cart.getgoodsNum())
		});

	};

	pub.init = function(){

		cart.car_goods();
		common.cancelDialogApp();
		cart.eventHandle.init();
		cart.style_change();
		common.setShopCarNum_ShoppingCartApp(cart.getgoodsNum())
		
		pub.allSelect();
		pub.pickUp();
		pub.drag();

		$('.settle','#total').bind('click',function(){
			if( $('.line-wrapper','#ul-box').length == 0 ){
				common.prompt('购物车为空'); return;
			}
			if( $('.select-node','#ul-box').find('.select-dot').length == 0 ){
				common.prompt('请选择商品'); return;
			}

			pub.goodsList = cart.goodlist1();  // 购物车清单

			if ( pub.logined ) {
				common.orderType.setItem( "1" );
				common.sortCouponId.removeItem(); // 优惠券临时移除
				pub.shop_cart_submit.init();
			}else{
				common.jumpMake.setItem('13');
				common.jumpLinkPlainApp('登录','html/login.html?type='+13);
			}
		});
			
		pub.pickUpDeltele();

		$("#empty-cart img").on("click",function(){
			if(common.isApp()){
				if (common.isApple()) {
					try{
						window.webkit.messageHandlers.changeTabBarItem.postMessage(1);
					}catch(e){
						alert("调用IOS的changeTabBarItem方法出错")
					}
				}else if(common.isAndroid()){
					try{
						android.changeTabBarItem(1);
					}catch(e){
						alert("调用Android的changeTabBarItem方法出错")
					}
				}
			}
		})
		var goodsTotalNum = common.getTotal();
 		if( goodsTotalNum != 0 ){
 			$('.footer_item[data-content]','#foot').attr('data-content',goodsTotalNum);
 		}
	};
	module.exports = pub;
});