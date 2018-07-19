
require(['../require/config'],function(){
	require(['goshopCar','common','mobileUi','swiperJS','pull'],function(cart,common){
		
		/************************************商品管理模块***********************/

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
	
		pub.firmId = ( common.firmId.getItem() ? common.firmId.getItem() : null)// 门店ID
		pub.firmIdType = ( common.firmIdType.getItem() ? common.firmIdType.getItem() : null)// 门店类型
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
						type : pub.goods.type ? pub.goods.type : (pub.firmIdType == "5"? "WATM":"") ,
						firmId: pub.firmId
					},function( d ){
						if ( d.statusCode == "100000" ) {
							pub.goods.apiHandle.goods_first_type.apiData( d );
						}else{
							common.prompt( d.statusStr );
							//common.cancelDialogApp();
							common.jsInteractiveApp({
								name:'cancelDialog'
							});
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
	
					for ( i = 0, l = data.length; i < l; i++) {
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
	
				}
			},
			goods_second_type : {
				init : function(){
					common.ajaxPost({
						method : 'goods_second_type',
						typeCode : pub.goods.typeCode,
						firmId: pub.firmId
					},function( d ){
						if(d.statusCode == "100000") {
							pub.goods.apiHandle.goods_second_type.apiData( d );
						} else{
							//common.cancelDialogApp();
							common.jsInteractiveApp({
								name:'cancelDialog'
							});
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
	
					for (var i = 0, l = d.length; i < l; i++) {
						html += '<li class="two_item" id="_more_" data="' + d[i].typeCode + '">' + d[i].typeName + '</li>'
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
					}
					pub.goods.apiHandle.goods_list.init();
				}
			},
			goods_list : {
				init : function(){
					common.ajaxPost({
						method : 'goods_list',
						typeCode : pub.goods.typeCode,
						firmId: pub.firmId,
						pageNo : pub.PAGE_INDEX,
						pageSize : pub.PAGE_SIZE
					},function( d ){
						if (d.statusCode == "100000") {
							pub.goods.isEnd = d.data.isLast
							if (d.data.objects != "" && d.data.objects.length !="0" ) {
								pub.goods.apiHandle.goods_list.apiData( d );
							} else if(d.data.objects.length == '0' ){
								pub.loading.show().html("没有更多数据了！");
							}
						} else{
							//common.cancelDialogApp();
							common.jsInteractiveApp({
								name:'cancelDialog'
							});
						}
					});
				},
				apiData : function( d ){
					d = d.data;
					pub.goods.isEnd = d.isLast;
					if (pub.PAGE_INDEX == 1) {
						$(".more_bottom_right").html('');
					}
					var html = '',i;
					for (var i = 0, l = d.objects.length; i < l; i++) {
						var obj = d.objects[i]
						var gdnum = cart.callbackgoodsnumber( obj.id );
						
						html += '<dl class="goods_item clearfloat lazyload" data="' + obj.id + '" id="_more_">'
						// if( -1 < i && i < 7){
							html += '	<dt id="_more_"><img id="_more_" src="' + obj.goodsLogo + '"/></dt>'
						// }else{
						// 	html += '	<dt><img data-src="' + obj.goodsLogo + '"/></dt>'
						// }
						
						html += '	<dd id="_more_">'
						html += '		<p class="good_name" id="_more_">' + obj.goodsName + '</p>'
						html += '		<p class="good_describe clearfloat" id="_more_">'
						html += '			<span class="float_left" id="_more_">' + obj.specInfo + '</span>'
						if( obj.purchaseQuantity != 0 ) html += '			<span class="float_right" id="_more_">' + obj.purchaseQuantity + '份起售</span>'  
						
						html += '		</p>'
						html += '		<p class="good_describe1" id="_more_">' + obj.goodsDescribe + '</p>'
						html += '		<div id="_more_" class="good_box" data-id="' + obj.id + '" data-max="' + obj.maxBuyNum + '" data-name="' + obj.goodsName + '" data-logo="' + obj.goodsLogo + '" data-price="' + obj.nowPrice + '" data-packagenum="' + obj.packageNum + '" data-specinfo="' + obj.specInfo + '" data-oldprice ="' + obj.nomalPrice + '"  data-purchaseQuantity = "' + obj.purchaseQuantity + '">'
						html += '			<span class="good_picre" id="_more_"><span id="_more_">￥' + obj.nowPrice + '</span>&nbsp;<del>￥' + obj.nomalPrice + '</del></span>'
						html += '			<span class="good_number clearfloat" id="_more_">'
						if ( gdnum ) {
							html += '					<div class="minus_num" id="_more_"></div>'
							html += '					<div class="show_num" zs-goodsId="' + obj.id + '" id="_more_">' + gdnum + '</div>'
							html += '					<div class="add_num" id="_more_"></div>'
						} else{
							if ( obj.packageNum <= 0) {
								html +=  '		<div style="color:#FFFFFF;background:red;text-align:center" id="_more_">已售罄</div>'
							}else{
								html += '					<div class="minus_num" id="_more_" style="display:none"></div>'
								html += '					<div class="show_num" id="_more_" style="display:none" zs-goodsId="' + obj.id + '">0</div>'
								html += '					<div class="add_num" id="_more_"></div>'
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
					//common.cancelDialogApp();
					common.jsInteractiveApp({
						name:'cancelDialog'
					});
					if (pub.isrefresh) {
						pub.pullInstance1.pullDownSuccess();
					}
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
						$this.addClass("more_first_click").siblings().removeClass("more_first_click");
						pub.loading.show().html("正在加载中...");
						pub.goods.typeCode = dataItem;
						common.first_data.setItem( pub.goods.typeCode );
						common.two_data.removeItem();
						pub.goods.apiHandle.goods_second_type.init();
					}
				});
	
				//点击二级列表获取商品列表
				$(".more_bottom_left").on('click','.two_item',function(e){
					e.stopPropagation();
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
						pub.loading.show().html("正在加载中...");
						$this.addClass("more_two_click").siblings().removeClass("more_two_click");
						pub.goods.typeCode = $this.attr('data');
						common.two_data.setItem( pub.goods.typeCode );
						$('.more_bottom_right').html('');
						pub.PAGE_INDEX = 1;
						pub.goods.apiHandle.goods_list.init();
					}
				});
				$(".more_bottom_left").on("touchmove",".two_item",function(e){
					e.stopPropagation()
				})
	
				//点击加载更多
				pub.loading.on('touchend',function(e){
					/*e.stopPropagation()*/
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
					common.jsInteractiveApp({
						name:'goToNextLevel',
						parameter:{
							title:'商品详情',
							url:'html/goodsDetails.html?goodsId='+ goodsId
						}
					})
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
	
			$('.main').height( wh );
			pub.scrollH = wh -$('.more_top_wrap').height();
			$('.more_bottom_left_wrap,.more_bottom_right_wrap').height( pub.scrollH );
	
			// common.lazyload();
	
			pub.goods.apiHandle.init();
			pub.goods.eventHandle.init();
		}
	
	
		/************************************************** 商品详情模块 ******************************/
	
		// 命名空间
	
		pub.goodsDetail = {};
		pub.goodsDetail.isEnd = null;
	
		// 商品详情 接口处理
		pub.goodsDetail.apiHandle = {
			init : function(){
				pub.goodsDetail.apiHandle.goods_show.init();
				pub.goodsDetail.apiHandle.good_comment.init();
			},
			goods_show : {
				init : function(){
					common.ajaxPost({
						method : 'goods_show',
						goodsId : pub.goodsDetail.goodsId
					},function( d ){
						d.statusCode == '100000' && pub.goodsDetail.apiHandle.goods_show.apiData( d );
						d.statusCode != '100000' && common.prompt(d.statusStr)
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
						
						for ( var i = 0, l = imgArr.length; i < l; i++) {
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
					if ( d.purchaseQuantity != 0 ) {
						$('.gd_specification').find(".float_right").show().html( d.purchaseQuantity + "份起售" );
					}
					$('.gd_price').html('<span>￥' + d.nowPrice + '</span>&nbsp;&nbsp;<del>￥' + d.nomalPrice + '</del>');
					$(".gd_goodsDescribe").html( d.goodsDescribe );
	
					d.goodsContext && $('.goodsDetails_box2_').show().html( d.goodsContext);
					
				}
			},
			good_comment:{
				init:function(){
					common.ajaxPost({
						method : 'goods_comment_list',
						goodsId : pub.goodsDetail.goodsId,
						pageNo : pub.PAGE_INDEX,
						pageSize : pub.PAGE_SIZE
					},function( d ){
						if (d.statusCode == '100000') {
							pub.goods.isEnd = d.data.isLast
							if (d.data.objects != "" && d.data.objects.length !="0" ) {
								pub.goodsDetail.apiHandle.good_comment.apiData( d );
							} else if(d.data.objects.length == '0' ){
								if (pub.PAGE_INDEX == 1) {
									pub.loading.show().html("暂无评论信息！").css("text-align","left");
								}else{
									pub.loading.show().html("没有更多数据了！");
								}
								
							}
						}else{
							common.prompt(d.statusStr)
						}
					})
				},
				apiData:function(d){
					d = d.data;
					pub.goods.isEnd = d.isLast;
					if (pub.PAGE_INDEX == 1) {
						$(".goodsDetails_box2_comment_box").html('');
					}
					var html = '',i;
					for ( var i = 0, l = d.objects.length; i < l; i++) {
						html +='<div class="comment_item">'
						html +='	<dl class="comment_item_top clearfloat">'
						html +='		<dt class="float_left"><img src="'+d.objects[i].userFaceImg+'"/></dt>'
						html +='		<dd	class="float_left">'
						html +='			<p class="comment_time">'+d.objects[i].createTime.split(" ")[0]+'</p>'
						html +='			<p class="comment_name">'+d.objects[i].userName+'</p>'
						html +='		</dd>'
						html +='		<dd class="goods_star float_right">'
						for (var n=2;n<=10;n+=2) {
							if (n<=d.objects[i].service) {
								html +='			<span class="star active" data="'+n+'"></span>'		
							} else{
								html +='			<span class="star" data="'+n+'"></span>'		
							}
						}
						html +='		</dd>'
						html +='		<input type="hidden" name="stars" id="stars" value="'+d.objects[i].service+'" />'
						html +='	</dl>'
						html +='	<div class="comment_item_bottom">'
						html +='		<p class="comment_content">'+d.objects[i].comment+'</p>'
						html +='		<div class="comment_goods_picter_box clearfloat">'
						for (var m in d.objects[i].pics.split("@")) {
							if (d.objects[i].pics.split("@")[m]) {
								html +='			<div class="comment_goods_picter_item"><img src="'+d.objects[i].pics.split("@")[m]+'"/></div>'
							}
						}
						html +='		</div>'
						html +='	</div>'
						html +='</div>'
					}
					$(".goodsDetails_box2_comment_box").append(html);
					if( pub.goods.isEnd ){
						pub.loading.show().html("没有更多数据了！");
					}else{
						pub.loading.show().html("点击加载更多！");
					};
				}
			}
		};
	
		// 商品详情 事件处理
		pub.goodsDetail.eventHandle = {};
		pub.goodsDetail.eventHandle.init = function(){
	
			// 设置轮播高度
			$(".goodsDetails_img_box").height(function(){return $(this).width(); });
		};
	
	
		pub.goodsDetail.init = function(){
	
			pub.goodsDetail.goodsId = common.getUrlParam('goodsId');
			var 
			wh = document.documentElement.clientHeight;
			//返回顶部
			window.onscroll=function(e){
				var scroll = document.body.scrollTop || window.pageYOffset || document.documentElement.scrollTop;
				var scroll1 = $('.goodsDetails_box2_top').offset().top
				var h = $(".goodsDetails_img_box").height() + $(".goodsDetails_box1").height() +40;
				if( scroll >= 600){				
					$('.toTop').css({'display':'block'});			
				}else{
					$('.toTop').css({'display':'none'});
				}
				if (scroll >= h) {
					$(".goodsDetails_box2_top").addClass("goodsDetails_box2_top_fixed");
					$(".goodsDetails_box2_top_empty").show()
				}else{
					$(".goodsDetails_box2_top").removeClass("goodsDetails_box2_top_fixed")
					$(".goodsDetails_box2_top_empty").hide()
				}
			};
			$('.toTop').on('click',function(){
				$('html,body').animate({
					scrollTop : 0
				},500); 
			});
			$(".goodsDetails_box2_top li").on("click",function(){
				var index = $(this).index();
				$(this).addClass("active").siblings().removeClass("active");
				$(".goodsDetails_box2_bottom .goodsDetails_box2_bottom_item").eq(index).show().siblings().hide();
			});
			$(".goodsDetails_box2_comment").on("click",".comment_goods_picter_box img",function(){
				//$(this).is(".img_preview") ? $(this).removeClass("img_preview") : $(this).addClass("img_preview");
				var nood = $(this).parent().parent();
				pub.apiHandle.pre_img(nood,$(this));
			})
			//点击加载更多
			pub.loading.on('click',function(e){
				/*e.stopPropagation()*/
				if (!pub.goods.isEnd) {
					pub.PAGE_INDEX ++;
					pub.goodsDetail.apiHandle.good_comment.init();
				}else{
					pub.loading.show().html("没有更多数据了！");
				}
			});
			$('.show_num').attr( 'zs-goodsId',pub.goodsDetail.goodsId );
			pub.goodsDetail.apiHandle.init();
			pub.goodsDetail.eventHandle.init();
		};
	
		// console.log(pub,'pub');
	
		// 父模块
		pub.eventHandle = {
			init : function(){
				// 增加
				$(".zs-static-box").on('click','.add_num',function(e){
					// var offset = $(this).offset();
					common.stopEventBubble(e);
					e.stopPropagation()
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
					purchasequantity = node.attr("data-purchasequantity"),
					
					goodNum = cart.callbackgoodsnumber( dataId );
					
					//if ( goodNum < dataPackagenum ) { // 库存
						if( +dataMax != 0 ){ // 限购
							if( goodNum < dataMax ){
								var num1 = cart.addgoods( dataId, dataName, dataPrice, dataLogo, dataSpecInfo, dataMax, dataPackagenum, dataOldPrice , 1 ,purchasequantity );
								$this.siblings().eq(1).html( num1 );
								common.tip();
								//common.setShopCarNumApp(cart.getgoodsNum())
								common.jsInteractiveApp({
									name:'setShopCarNum',
									parameter:{
										num:cart.getgoodsNum()
									}
								});
								//$('.footer_item[data-content]','#foot').attr('data-content',cart.getgoodsNum());
							}else{
								common.prompt( "该商品限购" + dataMax + "件" )
							}
						}else{
							var num1 = cart.addgoods( dataId, dataName, dataPrice, dataLogo, dataSpecInfo, dataMax, dataPackagenum, dataOldPrice , 1 ,purchasequantity);
							$this.siblings().eq(1).html( num1 );
							common.tip();
							//common.setShopCarNumApp(cart.getgoodsNum())
							common.jsInteractiveApp({
								name:'setShopCarNum',
								parameter:{
									num:cart.getgoodsNum()
								}
							});
							//$('.footer_item[data-content]','#foot').attr('data-content',cart.getgoodsNum());
						}
						cart.style_change();
					/*} else{
						common.prompt( "库存不足" );
					}*/
				});
				//减少
				$(".zs-static-box").on('click','.minus_num',function(e){
					common.stopEventBubble(e);
					e.stopPropagation()
					var $this = $(this);
					var dataId = $this.parents('[data-id]').attr("data-id");
	                var num1 = cart.cutgoods( dataId );
	                if ( num1 < '1' ) {
	                	$this.next().html( '0' );
	                	$this.hide().next().hide();
	                } else{
	                    $this.next().html( num1 );
	            	}
	                //common.setShopCarNumApp(cart.getgoodsNum())
	                common.jsInteractiveApp({
						name:'setShopCarNum',
						parameter:{
							num:cart.getgoodsNum()
						}
					});
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
	
			},
			pre_img:function(el,me){
				var imgUrl = me.attr("src"),imgIndex=0;
				var nood = el.find("img"),l=nood.length,arrImg=[];
				var div = $("<div class='img_preview'  style='display:none'><div id='swiper_content' class='swiper_content' style='transition-duration: 0.5s; transform: translateX(0px);'></div></div>");
				$("body").append(div);
				var html = '';
				Array.prototype.forEach.call(nood, function(ele, index) {
					if (imgUrl == $(ele).attr("src")) {
						imgIndex = index;
					}
				    html += '<div class="slide"><img src= "'+$(ele).attr("src")+'" /></div>'
				})
				var noodpar = $(".img_preview"),w = noodpar.width();
				
				noodpar.find(".swiper_content").append(html).width(nood.length * w);
				//noodpar.css({"display":"block","background":"#000000"}).find(".slide").width(w);
				$("body").css("overflow-y","hidden")
				var moveX,endX,cout = 0,moveDir;
				var movebox = document.querySelector(".img_preview .swiper_content");
				movebox.style.transform = "translateX(" + (-imgIndex * w) + "px)";
				cout = imgIndex;
				noodpar.css({"background":"#000000"}).find(".slide").width(w);
				setTimeout(function(){
					noodpar.show();
				},100)
				movebox.addEventListener("touchstart", boxTouchStart, false);
	            movebox.addEventListener("touchmove", boxTouchMove, false);
	            movebox.addEventListener("touchend", boxTouchEnd, false);
	            movebox.addEventListener("click", boxClick, false);
	            function boxClick(e){
	            	movebox.parentNode.remove();
	            	$("body").css("overflow-y","auto");
	            }
				function boxTouchStart(e){
	                var touch = e.touches[0];
	                startX = touch.pageX;
	                endX = parseInt(movebox.style.transform.replace("translateX(",""));
	           }
	            function boxTouchMove(e){
	                var touch = e.touches[0];
	                moveX = touch.pageX - startX; 
					if(cout == 0 && moveX > 0){
						return false;
					}
					if(cout == l-1 && moveX < 0){	
						return false;
					}
					movebox.style.transform = "translateX(" + (endX + moveX) + "px)";
	            }
	            function boxTouchEnd(e){
	                moveDir = moveX < 0 ? true : false;
					if(moveDir){
						if(cout<l-1){
	                        movebox.style.transform = "translateX(" + (endX-w) + "px)";
	                        cout++;
	                   }
	               	}else{
	                    if(cout == 0){
	                        return false;
	                    }else{
							movebox.style.transform = "translateX(" + (endX+w) + "px)";
							cout--;
						}
	                }
	            }
			}
		};
		// 换肤
		pub.apiHandle.change_app_theme = {
			init:function(){
				if (common.huanfu.getItem() && common.huanfu.getItem() != 1) {
					$(".more_top_wrap,.more_bottom_wrap,.goodsDetails_box1,.goodsDetails_box2").addClass("skin"+sessionStorage.getItem("huanfu"))
				}
			}
		}
	
		pub.init = function(){
			if (!common.huanfu.getKey()) {
				common.getChangeSkin();
				common.defHuanfu.done(function(){
					pub.apiHandle.change_app_theme.init();
				})
			}else{
				pub.apiHandle.change_app_theme.init();
			}
			pub.moduleId == "goods" && pub.goods.init();
			pub.moduleId == "goodsDetail" && pub.goodsDetail.init();
			pub.eventHandle.init();
			$("body").fadeIn(300)
			
	
		}
		
		$(document).ready(function(){
		 	pub.init();
		 	window.pub = pub;
		 	setTimeout(function(){
		 		if (pub.moduleId == "goods") {
		 			load();
		 		}
		 	}, 500);
		 	pub.info = {
				"pullDownLable":"下拉刷新...",
				"pullingDownLable":"松开刷新...",
				"pullUpLable":"下拉加载更多...",
				"pullingUpLable":"松开加载更多...",
				"loadingLable":"加载中..."
			}
	 		var 
			wh = document.documentElement.clientHeight;
			$("#iscroll").css("min-height",wh)
			
			function pullDownAction () {
				setTimeout(function () {
					
					if(pub.moduleId == "goods"){
						pub.PAGE_INDEX = common.PAGE_INDEX;
						pub.goods.apiHandle.init();
						/*pub.myscroll.refresh();*/
						//pub.pullInstance.pullDownSuccess();
					}
				}, 1000);	
			}
			function pullDownAction1 () {
				setTimeout(function () {
					if(pub.moduleId == "goods"){
						pub.isrefresh = true;
						pub.PAGE_INDEX = common.PAGE_INDEX;
						pub.goods.apiHandle.goods_list.init();
					}
				}, 1000);	
			}
			function load(){
		        var $listWrapper1 = $('._more_');

		        pub.pullInstance1 =  pullInstance1 = new Pull($listWrapper1, {
		             scrollArea: $('.more_bottom_right_wrap'), // 滚动区域的dom对象或选择器。默认 window
		             distance: 100, // 下拉多少距离触发onPullDown。默认 50，单位px
		
		            // 下拉刷新回调方法，如果不存在该方法，则不加载下拉dom
		            onPullDown: function () {
		            	common.getNetwork(pullDownAction1,pub.pullInstance1.pullDownFailed.bind(pub.pullInstance1))
		                /*if (window.navigator.onLine) {
		            		pullDownAction1();	            		
		            	}else{
		            		pub.pullInstance1.pullDownFailed()
		            	}*/
		            },
		        });
		        
			}
	        
		})
	})
})











