require(['../require/config'],function(){
	require(['common','goshopCar','iscroll'],function(common,cart){
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
	    	$('#ul-box').on('click','.line-btn-delete',function(){
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
				pub.myScroll.refresh();
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
					$(".settle").css("background-color","#ff7b29").html("结算")
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
			//$('.order_refund').show();
			var data = {
				type:1,
				title:'确定删除？',
				canclefn:'cancleFn',
				truefn:'trueFn'
			}
			common.alertMaskApp(JSON.stringify(data));
		});
		/*$('.order_refund').bind('click',function(e){
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
				
			});
	
		};*/
		//确定方法
		pub.apiHandle = {
			trueFn:function(){
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
					pub.myScroll.refresh();
				}
				$('#all-select','#total').find('span:eq(0)').removeClass('select-dot').addClass('unselect-dot');
				cart.style_change();
				common.setShopCarNum_ShoppingCartApp(cart.getgoodsNum())
			}
		}
		//取消方法
		pub.apiHandle.cancleFn = function(){
			
		}
		//刷新问题
		pub.apiHandle.reFresh = function(){
			var goodsTotalNum = common.getTotal();
	 		if( goodsTotalNum == 0 ){
	 			$('#empty-cart').show().appendTo('#ul-box');
	 		}else{
	 			cart.car_goods();
	 		}
		};
		pub.init = function(){
	
			pub.apiHandle.reFresh()
			common.cancelDialogApp();
			cart.eventHandle.init();
			cart.style_change();
			/*common.setShopCarNum_ShoppingCartApp(cart.getgoodsNum())*/
			
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
					if ($('.settle').html() == '结算') {
						$('.settle').css("background-color","#999999").html("结算中...")
						common.orderType.setItem( "1" );
						common.sortCouponId.removeItem(); // 优惠券临时移除
						pub.shop_cart_submit.init();
					}
				}else{
					common.jumpMake.setItem('13');
					common.jumpLinkPlainApp('登录','html/login.html?type='+13);
				}
			});
				
			//pub.pickUpDeltele();
	
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
		
		$(document).ready(function(){
		 	pub.init();
		 	window.pub = pub;
		 	setTimeout(loaded(), 500);
	 		var 
			wh = document.documentElement.clientHeight;
			$("#empty-cart").height(wh-400)
			pub.info = {
				"pullDownLable":"下拉刷新...",
				"pullingDownLable":"松开刷新...",
				"pullUpLable":"下拉加载更多...",
				"pullingUpLable":"松开加载更多...",
				"loadingLable":"加载中..."
			}
			
	 		var myScroll,
			pullDownEl, pullDownOffset,
			pullUpEl, pullUpOffset,
			generatedCount = 0;
		
			function pullDownAction () {
				setTimeout(function () {
					pub.apiHandle.reFresh();
					myScroll.refresh();	
				}, 1000);	
			}
			
			function loaded() {
				pullDownEl = document.getElementById('pullDown');
				pullDownOffset = pullDownEl.offsetHeight;
				
				pub.myScroll = myScroll = new iScroll('wrapper', {
					useTransition: true,
					topOffset: pullDownOffset,
					preventDefaultException: { className: 'goods_item' },///(^|\s)formfield(\s|$)/
					deceleration:0.004,
					bounce:true,//当滚动器到达容器边界时他将执行一个小反弹动画。在老的或者性能低的设备上禁用反弹对实现平滑的滚动有帮助。
					disableMouse: true,//禁用鼠标和指针事件：
   					disablePointer: true,
   					momentum:true,//在用户快速触摸屏幕时，你可以开/关势能动画。关闭此功能将大幅度提升性能。
					//刷新的时候，加载初始化刷新更多的提示div
					onRefresh: function () {
						if(this.maxScrollY <-40){
							if (pullDownEl.className.match('loading')) {
								pullDownEl.className = '';
								pullDownEl.querySelector('.pullDownLabel').innerHTML = pub.info.pullDownLable;
								pullDownEl.querySelector('.loader').style.display="none"
								pullDownEl.style.lineHeight=pullDownEl.offsetHeight+"px";	
							}
						}
					},
					//拖动，滚动位置判断
					onScrollMove: function () {
						if (this.y > 5 && !pullDownEl.className.match('flip')) {//判断是否向下拉超过5,问题：这个单位好像不是px
							pullDownEl.className = 'flip';
							pullDownEl.querySelector('.pullDownLabel').innerHTML = pub.info.pullingDownLable;
							this.minScrollY = 0;
						} else if (this.y < 5 && pullDownEl.className.match('flip')) {
							
							pullDownEl.className = '';
							pullDownEl.querySelector('.pullDownLabel').innerHTML = pub.info.pullDownLable;
							this.minScrollY = -pullDownOffset;
						}
						
					},
					onScrollEnd: function () {
						if (pullDownEl.className.match('flip')) {
							pullDownEl.className = 'loading';
							pullDownEl.querySelector('.pullDownLabel').innerHTML = pub.info.loadingLable;
							pullDownEl.querySelector('.loader').style.display="block"
							pullDownEl.style.lineHeight="40px";	
							pullDownAction();
						}
					}
				});
				
				setTimeout(function () { document.getElementById('wrapper').style.left = '0'; myScroll.refresh(); }, 800);
				
			}
			
		
			document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
		
		})
	})
})
