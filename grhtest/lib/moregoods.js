define(function(require, exports, module){


	var common = require( 'lib/common.js?v=20000' );
	var cart = require( 'lib/goshopCar.js?v=20000' );
	require( 'swiper' );

/************************************商品管理模块************************/

	// 命名空间

	pub = {};
	
	pub.logined = common.isLogin(); // 是否登录 

	pub.PAGE_INDEX = common.PAGE_INDEX; // 索引

	pub.PAGE_SIZE = common.PAGE_SIZE; // 页面显示数据个数

	pub.loading = $('.click_load');

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

	// 商品

	pub.goods = {};

	pub.moduleId = $('[module-id]').attr( 'module-id' );

	pub.goods.type = common.getUrlParam( 'type' ); // 轮播入口，首页商品 

	pub.goods.typeCode = null; // 一级类别，二级类别

	pub.goods.GOODS_TYPE = ['TAO_CAN','JU_HUI',''];

	pub.goods.TITLE = ['礼盒套餐','钜惠活动','全部商品']; // 标题

	pub.goods.isEnd = null; // 是否为最后一页

	pub.goodsList = null;


	// 公共方法

	// 商品接口处理
	pub.goods.apiHandle = {
		init : function(){
			pub.goods.apiHandle.goods_first_type.init();
		},
		goods_first_type : {
			init : function(){
				common.ajaxPost({
					method : 'goods_first_type',
					type : pub.goods.type ? pub.goods.type : '' 
				},function( d ){
					if ( d.statusCode == "100000" ) {
						pub.goods.apiHandle.goods_first_type.apiData( d );
					}else{
						common.prompt( d.statusStr );
						common.cancelDialogApp();
					}
				})
			},
			apiData : function( d ){
				var 
				data = d.data.firstType,
				html = '', i = 0,
				nodeBox = $(".more_top");

				nodeBox.empty();
				if( !$.isArray( data ) || data.length == 0 ){
					pub.loading.html('没有更多数据了！');return;
				}

				for ( i in data) {
					html +='<li class="first_item" data="' + data[i].typeCode + '">' + data[i].typeName + '</li>'
				}
				nodeBox.append( html ).width( data.length * 156 + 20 );

				if ( common.first_data.getKey() ) { //存储了一级目录
					pub.goods.typeCode = common.first_data.getItem();
					$('.first_item[data="' + pub.goods.typeCode + '"]','.more_top').addClass('more_first_click');
				} else{
					var firstItemNode = $('.first_item','.more_top').eq(0);
						firstItemNode.addClass("more_first_click");
						pub.goods.typeCode = firstItemNode.attr('data');
				}
				// 调二级接口
				pub.goods.apiHandle.goods_second_type.init();

				common.shareData = data.customShare;
				
		 		common.isWeiXin() && require.async('lib/weixin'); //判断微信环境调用分享
			}
		},
		goods_second_type : {
			init : function(){
				common.ajaxPost({
					method : 'goods_second_type',
					typeCode : pub.goods.typeCode
				},function( d ){
					if(d.statusCode == "100000") {
						pub.goods.apiHandle.goods_second_type.apiData( d );
					} else{
						common.cancelDialogApp();
					}
				})
			},
			apiData : function( d ){
				d = d.data;
				var 
				nodeBox = $(".more_bottom_left"),
				html = '';
				nodeBox.empty();

				if( !$.isArray( d ) || d.length == 0 ){ // 判断数据时否为空
					pub.loading.html('没有更多数据了！');return;
				}

				for (var i in d) {
					html += '<li class="two_item" data="' + d[i].typeCode + '">' + d[i].typeName + '</li>'
				}

				nodeBox.append(html);

				var twoItem = $(".more_bottom_left .two_item");

				if( common.two_data.getKey() ){
					pub.goods.typeCode = common.two_data.getItem();
					$('.two_item[data="' + pub.goods.typeCode + '"]').addClass('more_two_click');
				}else{
					var twoItem=$(".more_bottom_left .two_item");
					twoItem.eq(0).addClass("more_two_click").siblings().removeClass("more_two_click");
					pub.goods.typeCode = twoItem.eq(0).attr( "data" );
					$(".more_bottom_right").html('');
				}
				pub.goods.apiHandle.goods_list.init();
			}
		},
		goods_list : {
			init : function(){
				common.ajaxPost({
					method : 'goods_list',
					typeCode : pub.goods.typeCode,
					pageNo : pub.PAGE_INDEX,
					pageSize : pub.PAGE_SIZE
				},function( d ){
					if (d.statusCode == "100000") {
						d.data.objects != "" && d.data.objects.length !="0" && pub.goods.apiHandle.goods_list.apiData( d );
					} else{
						common.cancelDialogApp();
					}
				});
			},
			apiData : function( d ){
				d = d.data;
				pub.goods.isEnd = d.isLast;
				var html = '',i;
				for ( i in d.objects ) {
					var obj = d.objects[i]
					var gdnum = cart.callbackgoodsnumber( obj.id );
					
					html += '<dl class="goods_item clearfloat lazyload" data="' + obj.id + '">'
					// if( -1 < i && i < 7){
						html += '	<dt><img src="' + obj.goodsLogo + '"/></dt>'
					// }else{
					// 	html += '	<dt><img data-src="' + obj.goodsLogo + '"/></dt>'
					// }
					
					html += '	<dd>'
					html += '		<p class="good_name">' + obj.goodsName + '</p>'
					html += '		<p class="good_describe clearfloat">'
					html += '			<span class="float_left">' + obj.specInfo + '</span>'
					if( +obj.purchaseQuantity != 0 ) html += '			<span class="float_right">' + obj.purchaseQuantity + '份起售</span>'  
					
					html += '		</p>'
					html += '		<p class="good_describe1">' + obj.goodsDescribe + '</p>'
					html += '		<div class="good_box" data-id="' + obj.id + '" data-max="' + obj.maxBuyNum + '" data-name="' + obj.goodsName + '" data-logo="' + obj.goodsLogo + '" data-price="' + obj.nowPrice + '" data-packagenum="' + obj.packageNum + '" data-specinfo="' + obj.specInfo + '" data-oldprice ="' + obj.nomalPrice + '"  data-purchaseQuantity = "' + obj.purchaseQuantity + '">'
					html += '			<span class="good_picre"><span>￥' + obj.nowPrice + '</span>&nbsp;<del>￥' + obj.nomalPrice + '</del></span>'
					html += '			<span class="good_number clearfloat">'
					if ( gdnum ) {
						console.log(gdnum)
						html += '					<div class="minus_num"><img src="../img/btn_m.png"/></div>'
						html += '					<div class="show_num" zs-goodsId="' + obj.id + '">' + gdnum + '</div>'
						html += '					<div class="add_num"><img src="../img/btn_a.png"/></div>'
					} else{
						if ( +obj.packageNum == 0) {
							html +=  '		<div style="color:#FFFFFF,background:red,text-align:center">已售罄</div>'
						}else{
							html += '					<div class="minus_num" style="display:none"><img src="../img/btn_m.png"/></div>'
							html += '					<div class="show_num" style="display:none" zs-goodsId="' + obj.id + '">0</div>'
							html += '					<div class="add_num"><img src="../img/btn_a.png"/></div>'
						}
					}
					html += '			</span>'
					html += '		</div>'
					html += '	</dd>'
					html += '</dl>'
				}
				
				$(".more_bottom_right").append(html).find('.goods_item:last dd').css("border-bottom","1px solid #FFF");
				if( pub.goods.isEnd ){
					pub.loading.show().html("没有更多数据了！");
				}else{
					pub.loading.show().html("点击加载更多！");
				};
				common.cancelDialogApp();
			}
		},
		shop_cart_submit : {
			init : function(){
				common.ajaxPost( $.extend({},pub.userBasicParam,{
					method : 'shop_cart_submit',
					goodsList : pub.goodsList,
					pickUpMethod :common.PICK_UP_METHOD,
					payMethod : common.PAY_METHOD
				}),function( d ){
					if ( d.statusCode == "100000" ) {
						common.orderType.setItem("1");
						common.jumpLinkPlainApp( "order_set_charge.html" );
					}else if( d.statusCode == common.SESSION_EXPIRE_CODE ){
						common.clearData();
						common.prompt( '省份验证过期，请重新登录' );
						common.setMyTimeout(function(){
							common.jumpLinkPlain( 'login.html' );
						},1000);
					}
					else{
						common.prompt( d.statusStr );
					}
				})
			}
		}

	};

	// 商品事件处理
	pub.goods.eventHandle = {
		init : function(){

			//点击一级列表
			$(".more_top").on('click','.first_item',function(){
				common.showDialogApp();
				var 
				$this = $(this),
				dataItem = $this.attr('data'),
				baseLeft = $this.offset().left - $this.scrollLeft(),
				isCur = $this.is('.more_first_click');

				!isCur && $('.more_top_wrap').stop().animate({
					scrollLeft :  baseLeft - 300 
				}, 200);

				if( dataItem != common.first_data.getItem() ){
					pub.PAGE_INDEX = common.PAGE_INDEX;
					$this.addClass("more_first_click").siblings().removeClass("more_first_click");
					pub.loading.show().html("正在加载中...");
					pub.goods.typeCode = dataItem;
					common.first_data.setItem( pub.goods.typeCode );
					common.two_data.removeItem();
					pub.goods.apiHandle.goods_second_type.init();
				}
			});

			//点击二级列表获取商品列表
			$(".more_bottom_left").on('click','.two_item',function(){
				common.showDialogApp();
				var 
				$this = $(this),
				j = $(this).index(),
				dataItem = $this.attr('data'),
				isCur = $this.is('.more_two_click');
				!isCur && $('.more_bottom_left_wrap').stop().animate({
					scrollTop :( 101 * ( j+1 ) - pub.scrollH/2 )
				}, 300);
				
				if ( dataItem != common.two_data.getItem() ) {
					pub.PAGE_INDEX = common.PAGE_INDEX;
					pub.loading.show().html("正在加载中...");
					$this.addClass("more_two_click").siblings().removeClass("more_two_click");
					pub.goods.typeCode = $this.attr('data');
					common.two_data.setItem( pub.goods.typeCode );
					$('.more_bottom_right').html('');
					pub.goods.apiHandle.goods_list.init();
				}
			});


			//点击加载更多
			pub.loading.on('click',function(){

				if (!pub.goods.isEnd) {
					common.showDialogApp();
					pub.goods.typeCode = common.two_data.getItem();
					pub.PAGE_INDEX ++;
					pub.goods.apiHandle.goods_list.init();
				}else{
					pub.loading.show().html("没有更多数据了！");
				}
			});

			//点击商品列表进行增减跳转详情
			$(".more_bottom_right").on('click','.goods_item',function(e){
				var goodsId = $(this).attr("data");
				common.jumpLinkPlainApp( "商品详情","html/goodsDetails.html?goodsId=" + goodsId );
			});
			
		}
	};

	pub.goods.init = function(){

		!pub.goods.type && $("title,.header_title").html( pub.goods.TITLE[ 2 ] );
		pub.goods.type == pub.goods.GOODS_TYPE[0] && $("title,.header_title").html( pub.goods.TITLE[ 0 ] );
		pub.goods.type == pub.goods.GOODS_TYPE[1] && $("title,.header_title").html( pub.goods.TITLE[ 1 ] );
		

		//设置高度
		var 
		wh = document.documentElement.clientHeight,
		emptyH = $('.empty').height() + $('.empty1').height();

		$('.main').height( wh - emptyH );
		pub.scrollH = wh - emptyH -$('.more_top_wrap').height();
		$('.more_bottom_left_wrap,.more_bottom_right_wrap').height( pub.scrollH );

		// common.lazyload();

		pub.goods.apiHandle.init();
		pub.goods.eventHandle.init();
	}


	/************************************************** 商品详情模块 ******************************/

	// 命名空间

	pub.goodsDetail = {};

	
	

	// 商品详情 接口处理
	pub.goodsDetail.apiHandle = {
		init : function(){
			pub.goodsDetail.apiHandle.goods_show.init();
		},
		goods_show : {
			init : function(){
				common.ajaxPost({
					method : 'goods_show',
					goodsId : pub.goodsDetail.goodsId
				},function( d ){
					pub.goodsDetail.apiHandle.goods_show.apiData( d );
				})
			},
			apiData : function( d ){
				d = d.data.goodsInfo;
				common.bannerShow( d, '.goodsDetails_img_box', function( data ){
					var 
					i,
					html = '',
					imgArr = data.goodsPics.trim().split(/\s*@\s*/);
					imgArr[ imgArr.length - 1 ] == '' && imgArr.pop();
					
					for ( i in imgArr ) {
						html += '<div class="swiper-slide "><img src="' + imgArr[ i ] + '" width="100%" /></div>'
					}
					return html;
				});
				var goodsNum = cart.callbackgoodsnumber( d.id ); // 获取本地商品数量
				if ( d.status != "1" ) {
					$(".gd_number").html( "商品已下架" );
				}else{
					if( !!goodsNum ){
						$(".gd_number .minus_num").show();
						$('.gd_number .show_num').show().html( goodsNum );
					}else{
						if ( d.packageNum <= "0" ) {
							$(".gd_number").html("已售罄").css({"color":"#FFFFFF",'background':'red','text-align':'center','line-height':$(".gd_number").height()+'px'});
						} else{
							$(".gd_number .minus_num").hide();
							$('.gd_number .show_num').hide().html( goodsNum );
						}
					}
				} 
				//添加存储数据到元素
				$('.good_box1_box1').attr({
					'data-id' : d.id,
					'data-name' : d.goodsName,
					'data-price' : d.nowPrice,
					'data-logo' : d.goodsLogo,
					'data-specInfo' : d.specInfo,
					'data-max' : d.maxBuyNum,
					'data-oldprice' : d.nomalPrice,
					'data-packagenum' : d.packageNum,
					'data-purchaseQuantity' : d.purchaseQuantity
				});

				//展示商品信息
				$('.gd_goodName').html( d.goodsName );
				$('.gd_specification').find(".float_left").html( "规格：" + d.specInfo );
				//判断最低起售份数
				if ( +d.purchaseQuantity != 0 ) {
					$('.gd_specification').find(".float_right").show().html( d.purchaseQuantity + "份起售" );
				}
				$('.gd_price').html('<span>￥' + d.nowPrice + '</span>&nbsp;&nbsp;<del>￥' + d.nomalPrice + '</del>');
				$(".gd_goodsDescribe").html( d.goodsDescribe );

				d.goodsContext && $('.goodsDetails_box2_').show().html( d.goodsContext);
				common.shareData = {
					title : d.goodsName,
					desc : d.goodsDescribe +"\n￥" + d.nowPrice + "/" + d.specInfo ,
				    link : window.location.href, // 分享链接
				    imgUrl : d.goodsLogo
				};
				common.isWeiXin() && require.async('lib/weixin'); //判断微信环境调用分享
			}
		}
	};

	// 商品详情 事件处理
	pub.goodsDetail.eventHandle = {};
	pub.goodsDetail.eventHandle.init = function(){

		// 设置轮播高度
		$(".goodsDetails_img_box").height(function(){ $(this).width(); });
	};


	pub.goodsDetail.init = function(){

		pub.goodsDetail.goodsId = common.getUrlParam('goodsId');
		//返回顶部
		window.onscroll=function(){
			var scroll = document.body.scrollTop || window.pageYOffset || document.documentElement.scrollTop;
			if( scroll >= 600){				
				$('.toTop').css({'display':'block'});			
			}else{
				$('.toTop').css({'display':'none'});
			}
		};
		$('.toTop').on('click',function(){
			$('html,body').animate({
				scrollTop : 0
			},500); 
		});

		$('.show_num').attr( 'zs-goodsId',pub.goodsDetail.goodsId );
		pub.goodsDetail.apiHandle.init();
		pub.goodsDetail.eventHandle.init();
	};

	// console.log(pub,'pub');

	// 父模块
	pub.eventHandle = {
		init : function(){

			// 点击提交本地购物车商品列表结算购物车
			$('.footer_car_rigth').on('click',function(){
				pub.goodsList = cart.goodlist1();
				if ( pub.logined ) {
					pub.goods.apiHandle.shop_cart_submit.init();
					common.sortCouponId.removeItem(); // 优惠券临时移除
					// pub.moduleId == "goodsDetail" && pub.goodsDetail.apiHandle.shop_cart_submit.init();
				}else{

					if( pub.moduleId == "goods" ){
						!pub.goods.type && common.jumpMake.setItem("1");
						pub.goods.type == 'TAO_CAN' && common.jumpMake.setItem("10");
						pub.goods.type == 'JU_HUI' && common.jumpMake.setItem("11");
					}else{
						common.jumpMake.setItem( "9" );
						common.goodid.setItem( pub.goodsDetail.goodsId );
					}
					common.jumpLinkPlainApp('login.html');
				}
			});
			// 增加
			$(".zs-static-box").on('click','.add_num',function(e){
				// var offset = $(this).offset();
				common.stopEventBubble(e);
				var 
				$this = $(this), // 定义当前节点
				node = $this.parents('[data-id]'),
				dataId = node.attr("data-id"),
				dataName = node.attr("data-name"),
				dataPrice = node.attr("data-price"),
				dataLogo = node.attr("data-logo"),
				dataSpecInfo = node.attr("data-specinfo"),
				dataMax = node.attr("data-max"),
				dataPackagenum = node.attr("data-packagenum"),
				dataOldPrice = node.attr("data-oldprice"), 
				goodNum = cart.callbackgoodsnumber( dataId );

				if ( goodNum < dataPackagenum ) { // 库存
					if( +dataMax != 0 ){ // 限购
						if( goodNum < dataMax ){
							var num1 = cart.addgoods( dataId, dataName, dataPrice, dataLogo, dataSpecInfo, dataMax, dataPackagenum, dataOldPrice );
							common.tip();
							common.setShopCarNumApp(cart.getgoodsNum())
							$this.siblings().eq(1).html( num1 );
							$('.footer_item[data-content]','#foot').attr('data-content',cart.getgoodsNum());
							
						}else{
							common.prompt( "该商品限购" + dataMax + "件" )
						}
					}else{
						var num1 = cart.addgoods( dataId, dataName, dataPrice, dataLogo, dataSpecInfo, dataMax, dataPackagenum, dataOldPrice);
						common.tip();
						common.setShopCarNumApp(cart.getgoodsNum())
						$this.siblings().eq(1).html( num1 );
						$('.footer_item[data-content]','#foot').attr('data-content',cart.getgoodsNum());
					}			
				} else{
					common.prompt( "库存不足" );
				}
			});
			//减少
			$(".zs-static-box").on('click','.minus_num',function(e){
				common.stopEventBubble(e);
				var $this = $(this);
				var dataId = $this.parents('[data-id]').attr("data-id");
                var num1 = cart.cutgoods( dataId );
                if ( num1 < '1' ) {
                	$this.hide().next().hide();
                } else{
                    $this.next().html( num1 );
            	}
                common.setShopCarNumApp(cart.getgoodsNum())
                cart.style_change();
            });
            $(".zs-static-box").on('DOMNodeInserted','.show_num',function(){
               	var $this = $(this);
               	if ( $this.html() == 0 ) {
                    $this.hide().prev().hide();
               	} else{
                    $this.css('display',"inline-block").siblings().css('display','inline-block');
               	};
               	cart.style_change();
           	});
		}
	};
	// 接口
	pub.apiHandle = {
		init : function(){

		}
	};


	pub.init = function(){

		pub.moduleId == "goods" && pub.goods.init();
			
		pub.moduleId == "goodsDetail" && pub.goodsDetail.init();

		pub.eventHandle.init();
 		
 		$('.footer_item[data-content]','#foot').attr('data-content',cart.getgoodsNum());
	};
	module.exports = pub;		
	

})