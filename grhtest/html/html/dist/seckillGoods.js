/*
	seckill scirpt for Zhangshuo Guoranhao 
	换购 | 换购详情 + 秒杀 | 秒杀详情 + 预购 | 预购详情
*/
require(['../require/config'],function () {
	require(['common','goshopCar','test','mobileUi','swiperJS'],function(common,cart){
		// 命名空间

		pub = {};
		
		pub.logined = common.isLogin();// 是否登录 
	
		pub.PAGE_INDEX = common.PAGE_INDEX; // 索引
	
		pub.PAGE_SIZE = common.PAGE_SIZE; // 页面显示数据个数
	
		pub.moduleId = $('[module-id]').attr( 'module-id' ); // 模块id
	
		pub.RULE_CODE = ['MSGZ-DESC','YGGX-DESC']; // 状态码使用说明  换购 + 预购  
	
		pub.GOODS_ID = common.getUrlParam( 'goodsId' ); // 秒杀 | 换购 | 预购    商品ID   // 获取 url 参数
	
		pub.firmId = ( common.firmId.getItem() ? common.firmId.getItem() : null)// 门店ID
		
		pub.websiteNode = common.websiteNode.getItem() ? common.websiteNode.getItem() : null;//站点
		
		common.addType.removeItem()
		
		pub.loading = $('.click_load');
		if( pub.logined ){
			pub.userId = common.user_datafn().cuserInfoid;
			pub.source = "userId" + pub.userId;
			pub.sign = md5( pub.source + "key" + common.secretKeyfn() ).toUpperCase();
			pub.tokenId = common.tokenIdfn();
	
			if( pub.moduleId == 'preBuyDetail' ){ // 预购详情加密
				pub.source = "preGoodsId" + pub.GOODS_ID + "-userId" + pub.userId;	
				pub.sign = md5( pub.source + "key" + common.secretKeyfn() ).toUpperCase();
			}
			pub.userBasicParam = {
				userId : pub.userId,
				source : pub.source,
				sign : pub.sign,
				tokenId : pub.tokenId
			};
		};
	
	
	
	/******************************************* 秒杀活动  ************************************/
	
		// 命名空间
	
		pub.seckill = {};
		var SECKILL = pub.seckill;
	
		pub.seckill.SYSTEM_TIME = null; // 系统时间
	
		pub.seckill.BARTER_TIMES = null; // 换购次数
	
		pub.seckill.GOODS_INFO = null; // 商品信息
	
		pub.goodsList = null; // 购物车清单数据
	
	
		// 必须是严格的日期模式
		pub.seckill.parseDate = function( time ){
			console.log( time)
			return new Date( time.trim().replace(/\-/g,'\/') );
		};
		// 日期格式化
		pub.seckill.dateFormat = function( time ){
			var time = Math.floor( time / 1000);
			if (time > 0) {
				var days = Math.floor( time / (3600 * 24) );
				var hous = Math.floor( (time - days * (3600 * 24)) / 3600 );
				var min = Math.floor( (time - days * (3600 * 24) - (hous * 3600) ) / 60  );
				var sec = ( time  % 60 );
				return	[days,pub.preZero(hous),pub.preZero(min),pub.preZero(sec)];
			}else{
				return [0,00,00,00];
			}
		};
		//在进行时分秒转时候，个位前面加零
		pub.preZero = function( data ){
			if( !isNaN(data) ){
				if(+data < 10 ) 
					return '0'+ data;
				return data;
			}
		};
		// 倒计时
		pub.countDown = function(serverTime,startTime,endTime){	
			var activityServerTime = null,
				 activityStartTime = null,
				 activityEndTime = null,
				 activitySeverDiffSystemTimer = 0,
				 activityTimerID = null;
			
				
			var nowTimers = new Date().getTime();
			
			activityServerTime = SECKILL.parseDate( serverTime);//"2019-02-18 13:00:52" 
			activityStartTime = SECKILL.parseDate( startTime );
			activityEndTime = SECKILL.parseDate( endTime );
			activitySeverDiffSystemTimer = activityServerTime - nowTimers;
			
			if (activityTimerID) {
				clearInterval( activityTimerID );
				activityTimerID = setInterval(pageWatchTimer,1000)
			}else{
				activityTimerID = setInterval(pageWatchTimer,1000)
			}
			pageWatchTimer()
			//获取活动状态和时间戳
			function getStateAndTimer(){
				var data = {
					state:"",
					times:0,
				};
				var simulationServerTim = new Date().getTime() + activitySeverDiffSystemTimer;
				
				//活动期间 ‘activeStart’
				if ( (simulationServerTim - activityStartTime) >= 0 && (simulationServerTim - activityEndTime) < 0 ) {
					data.state = 'activeStart';
					data.times = ( activityEndTime - simulationServerTim );
				} else {
					//活动没有开始 "activeNoStart"
					if( (simulationServerTim - activityStartTime) < 0){
						data.state = 'activeNoStart';
						data.times = ( activityStartTime - simulationServerTim );
					}
					//活动已经结束 "activeEnd"
					if ( (simulationServerTim - activityEndTime) >= 0 ) {
						data.state = 'activeEnd';
						data.times = ( simulationServerTim - activityEndTime );
					}
				};
				return data;
			}
			//页面监听及变化
			function pageWatchTimer(){
				var data = getStateAndTimer();
				var arr = SECKILL.dateFormat(data.times);
				
				if(pub.moduleId == "seckill" || pub.moduleId == "seckill_detail" ){
					var seckillTimerDom,seckillDom;
					if(pub.GOODS_ID){
						seckillTimerDom = $('.goodsDetails_countDown');
						seckillDom = $(".goodsDetails_balance");
					}else{
						seckillTimerDom = $(".count_down");
						seckillDom = $(".seckill_whole_goods.seckill_goods");
					}
						
					if ( data.state == 'activeNoStart' ) {
						if (pub.GOODS_ID) {
							seckillTimerDom.html('<p>开始倒计时：<span>'+arr[0]+'</span>天<span>'+arr[1]+'</span>小时<span>'+arr[2]+'</span>分<span>'+arr[3]+'</span>秒</p>');
							seckillDom.is(".activeNoStart") ? '' : seckillDom.removeClass("activeStart activeEnd").addClass("activeNoStart").html("<p class='text'>活动还没开始</p>")
						}else{
							seckillTimerDom.html('<p>开始倒计时：<span>'+arr[0]+'</span>天<span>'+arr[1]+'</span>小时<span>'+arr[2]+'</span>分<span>'+arr[3]+'</span>秒</p>')
							seckillDom.is(".activeNoStart") ? '' : seckillDom.removeClass("activeStart activeEnd").addClass("activeNoStart")
						}
						
					}else if ( data.state == 'activeStart' ){
						if (pub.GOODS_ID) {
							seckillTimerDom.html('<p>结束倒计时：<span>'+arr[0]+'</span>天<span>'+arr[1]+'</span>小时<span>'+arr[2]+'</span>分<span>'+arr[3]+'</span>秒</p>');
							seckillDom.is(".activeStart") ? '' : seckillDom.removeClass("activeNoStart activeEnd").addClass("activeStart").html("<p>去结算</p> <span></span>")
						}else{
							seckillTimerDom.html('<p>结束倒计时：<span>'+arr[0]+'</span>天<span>'+arr[1]+'</span>小时<span>'+arr[2]+'</span>分<span>'+arr[3]+'</span>秒</p>')
							seckillDom.is(".activeStart") ? '' : seckillDom.removeClass("activeNoStart activeEnd").addClass("activeStart")
						}
						
					}else if ( data.state == 'activeEnd' ){
						if (pub.GOODS_ID) {
							seckillTimerDom.html('<p>秒杀活动已结束</p>');
							seckillDom.is(".activeEnd") ? '' : seckillDom.removeClass("activeNoStart activeStart").addClass("activeEnd").html("<p class='text'>秒杀活动已结束</p>")
						} else{
							seckillTimerDom.html('<p>秒杀活动已结束</p>')
							seckillDom.is(".activeEnd") ? '' : seckillDom.removeClass("activeNoStart activeStart").addClass("activeEnd")
						}
						clearInterval( activityTimerID );
					}
				}else{
					
				}
			}
		};

	
		pub.seckill.apiHandle = {
			init : function(){
				pub.seckill.apiHandle.kill_goods_list.init();
			},
			// 秒杀列表
			kill_goods_list : {
				init : function(){
					common.ajaxPost({
						method : 'seckill_goods',
						firmId:pub.firmId,
						websiteNode:pub.websiteNode
					}, function( d ){
						if ( d.statusCode == "100000" ) {
							//common.shareData = d.data.customShare; // 微信分享
							//common.isWeiXin() && require.async('lib/weixin'); //判断微信环境调用分享
							pub.seckill.apiHandle.kill_goods_list.apiData( d );
						}
					})
				},
				apiData : function( d ){
					var seckillList =  d.data.sill;
					var index;
					// 轮播处理 待优化
					common.bannerShow( d.data.ad, '.seckill_whole_banner .index_banner', function( d ){ 
						var html = '', i = 0;
	 					for ( i in d ){
							html += '<div class="swiper-slide lazy"><img src="' + d[i].adLogo + '" /></div>'
						}
						return html;
					});
					if(seckillList.length && seckillList[0].id){
						var seckillActive = seckillList[0],
							seckillList = seckillActive.seckillGoods;
						//当前本地时间
					
						pub.countDown(seckillActive.nowDate,seckillActive.startTime,seckillActive.endTime);
						var html = "";
						if( seckillList.length == 0 ) return;
						$.each( seckillList, function( i, v ){
							if( +v.goodsInfo.packageNum > 0){
								html += '<dl data-id="'+ v.id +'">'
							}else{
								html += '<dl data-id="'+ v.id +'" class="sellOut">'
							}
							html +=		'<dt><img src="'+v.goodsInfo.goodsLogo+'" alt="" /></dt>'
							html +=		'<dd>'
							html +=			'<div class="goods_left">'
							html +=				 '<p class="goods_name">'+v.goodsInfo.goodsName+'</p>'
							html +=				 '<p class="goods_spec">'+v.goodsInfo.goodsDescribe+'</p>'
							html +=				 '<p class="goods_price">秒杀价￥'+ v.seckillPrice + '</p>'
							html +=				 '<del class="goods_oldprice">原价￥'+v.goodsInfo.nomalPrice+'</del>'
							html +=			 '</div>'
							html +=			 '<div class="goods_right">'
							if(v.goodsInfo.packageNum != 0){
								html +=					'<button class="seckill_whole_btn" style="background-color:#f24c4c">立即抢购</button>'
							}else{
								html +=					'<button class="seckill_whole_btn">抢光了</button>'
							}
							html +=					'</div>'
							html +=			'</dd>'
							html +=	'</dl>'
						});
						$('.seckill_goods').html( html );
						
					}else{
						$('.seckill_goods').html( "<div class='no_active'>暂无的活动</div>" );
					}
				}
			}
		};
		pub.seckill.eventHandle = {
	
			init : function(){
				//点击商品跳转到商品详情
				$(".seckill_whole_goods").on('click','dl',function(e){
					//common.jumpLinkPlain( "seckillDetail.html?goodsId=" + $(this).attr("data-id"));
					common.jsInteractiveApp({
						name:'goToNextLevel',
						parameter:{
							title:'秒杀详情',
							url:'html/seckillDetail.html?goodsId='+ $(this).attr("data-id")
						}
					})
				});
			}
		};
		pub.seckill.init = function(){
			pub.seckill.apiHandle.init();
			pub.seckill.eventHandle.init();
		};
	
	
	
		/******************************************* 商品秒杀 商品详情  ************************************/
	
	
		// 详情模块 命名空间
	
		pub.detail = {};
	
		// 秒杀 命名空间
	
		pub.detail.seckill = {};
	
		// 接口处理命名空间
		pub.detail.seckill.apiHandle = {
			init : function(){
				pub.detail.seckill.apiHandle.goods_show.init()
			},
			goods_show:{
				init:function(){
					common.ajaxPost({
						method:'kill_goods_details',
						killGoodsId:pub.GOODS_ID
					},function( d ){
						d.statusCode == "100000" && pub.detail.seckill.apiHandle.goods_show.apiData( d );
					},function( d ){
						common.prompt( d.statusStr );
					},function( d ){
			 			//pub.detail.seckill.apiHandle.goods_comment_list.init();
					});
				},
				apiData:function(d){
					pub.detail.seckill.apiHandle.goods_comment_list.init();
					var seckillData = d.data.seckillGoods  ;
					var d = seckillData.goodsInfo;
					//秒杀存储的数据
					pub.detail.seckill.seckillData = {
						goodsLogo : d.goodsLogo,
						goodsName : d.goodsName,
						nowPrice  : seckillData.seckillPrice,
						type  : seckillData.type,
						id  : seckillData.id,
						seckillId  : seckillData.secKillItemId,
						goodsId : seckillData.goodsId
					}
					
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
					
					$('.gd_goodName').css({
						'margin-top':'18px',
						'margin-bottom':'24px',
					});
					$('.gd_goodName .gd_name').text( d.goodsName )
					if(seckillData.limit != 0){
						$('.gd_goodName .limited').text('每人限购'+seckillData.limit+'件')
					}else{
						$('.gd_goodName .limited').text('每人限购1件')
					}
					$('.gd_specification').find(".float_left").html( "规格：" + d.specInfo );
					$(".gd_goodsDescribe").hide()
					$('.gd_price').html('<span>秒杀价￥' + seckillData.seckillPrice + '</span>&nbsp;&nbsp;<del>原价￥' + d.nomalPrice + '</del>')
					
					var seckillActive = seckillData;
					//当前本地时间
	//			
					pub.countDown(seckillActive.nowDate,seckillActive.startTime,seckillActive.endTime);
					var deltaTime = parseInt(seckillData.downOnTiem);
					if( d.packageNum == 0){
						$('.goodsDetails_balance').html( '<p class="text">您的手速太慢了</p>' ).addClass('active_end')
					}
					d.goodsContext && $('.goodsDetails_box2_').find('li').eq(0).html( d.goodsContext);
					
					if (seckillData.limit == '0'){$('.new_style .add_num').addClass('add_actived')}  
					
					//添加存储数据到元素
					$('.good_box1_box1').attr({
						'data-id' : d.id ,
						'data-max' : seckillData.limit,
						'data-packagenum' : d.packageNum,
						'data-type':seckillData.type,
					});
				},
			},
			goods_comment_list : {
				init : function(){
					common.ajaxPost({
						method : 'goods_comment_list',
						goodsId : pub.GOODS_ID,
						pageNo : pub.PAGE_INDEX,
						pageSize : pub.PAGE_SIZE
					},function( d ){
						if( d.statusCode == '100000' ){
							pub.detail.isLast = d.data.isLast;
							pub.detail.isLast && pub.detail.loadMore.html('没有更多数据');
							if( d.data.objects.length == 0 ){ pub.detail.loadMore.html('暂无评论').off('click'); return; }
							pub.detail.loadMore.before($('#goods-comment-data').tmpl( d.data ));
						}else{
							pub.detail.loadMore.html('暂无评论').off('click');
						}
						$('.comment-star[starNum]').each(function(){
							var 
							i,html='',
							$this = $(this),
							starNum = parseInt( +$this.attr('starNum') / 2 );
							for( i = 0; i < 5; i++ ){
								html += '<span class="' + ( i < starNum ? 'selected' : '' )+ '"></span>';
							} 
							$this.html( html );	
						});
					},function(){
						pub.detail.loadMore.hide();
					});
				}
			},
			click_kill:function(num){
				common.ajaxPost({
					method : 'click_kill',
					userId : pub.userId,
					killGoodsId : pub.GOODS_ID,
					killId: pub.detail.seckill.seckillData.seckillId,
					buyNumber:num
				},function(d){
					if( d.statusCode == '100000' ){
						common.prompt('抢购成功' )
						var obj = $.extend({},pub.detail.seckill.seckillData, {
							num:num,
						});
						localStorage.setItem('seckillData',JSON.stringify(obj));
						setTimeout(function(){
							//common.jumpLinkPlain($('.goodsDetails_balance').attr("url-data"));
							common.jsInteractiveApp({
								name:'goToNextLevel',
								parameter:{
									title:'提交订单',
									url:'html/seckillSettlement.html'
								}
							})
						},700)
					}else{
						common.prompt(d.statusStr )
					}
				})
			}
			
		};
	
		// 事件命名空间
		pub.detail.seckill.eventHandle = {
			init : function(){
				
				// 增加
				$(".zs-static-box").on('click','.add_num',function(e){
					common.stopEventBubble(e);
					var 
					goodNum,
					$this = $(this), // 定义当前节点
					node = $this.parents('[data-id]'),
					packagenum = node.attr("data-packagenum"),
					dataMax = node.attr("data-max");
					dataMax == 0 ? dataMax = 1 : dataMax;
					goodNum = $this.siblings().eq(1).text()
					if (parseInt(goodNum) < parseInt(packagenum)) {
						if(parseInt(goodNum)  < parseInt(dataMax) ){
							goodNum ++
							goodNum == dataMax && $this.addClass('add_actived')
							$this.siblings().eq(0).addClass('minus_actived')
							$this.siblings().eq(1).html( goodNum );
						}else{
							$this.addClass('add_actived')
							common.prompt( "该商品限购" + dataMax + "件" )
						}
					}else{
						common.prompt( "库存不足" )
					}
				});
				 //减少
		 		$(".zs-static-box").on('click','.minus_num',function(e){
					common.stopEventBubble(e);
					var num1 , 
					$this = $(this);
					var dataId = $this.parents('[data-id]').attr("data-id");
					num1 = $this.next().text()
					if( num1 > 1){
						num1 -- 
						$this.siblings().eq(1).hasClass('add_actived') && $this.siblings().eq(1).removeClass('add_actived')
						if(num1 == 1){
							$this.removeClass("minus_actived")
							$this.siblings().eq(1).removeClass('add_actived')
						}
						$this.next().html(num1)
					}
	            });
				
				$('.switch-tab .switch-list').click(function(){
					var $this = $(this),
					i = $this.index(),
					isCur = $this.is('actived');
					if( isCur ) return;
					$this.addClass('actived').siblings().removeClass('actived');
					$('.switch-content').find('li').eq( i ).show().siblings().hide();
				});
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
		
				
				$('.goodsDetails_balance').on('click',function(){
					var num = $('.new_style .show_num').text();
					if(pub.logined){
						if($(this).hasClass('activeStart')){
							pub.detail.seckill.apiHandle.click_kill(num);
						}
					}else{
						common.jsInteractiveApp({
							name:'goToNextLevel',
							parameter:{
								title:'登录',
								url:'html/login.html'
							}
						})
					}
				})
				
			}
		}
	
		pub.detail.seckill.init = function(){
			pub.detail.loadMore = $('#goods-comment-data-box').find('.clickmore');
			pub.detail.seckill.apiHandle.init();
			pub.detail.seckill.eventHandle.init();
		};
	/* ====================================  整件列表      ==================================*/
		pub.whole = {};
		var WHOLE = pub.whole;
		
		WHOLE.apiHandle = {
			init:function(){
				WHOLE.apiHandle.whole_list.init();
			},
			whole_list:{
				init:function(){
					common.ajaxPost({
						method : 'whole_goods',
						firmId:pub.firmId,
						websiteNode:pub.websiteNode,
						pageNo : pub.PAGE_INDEX ,
		 				pageSize : pub.PAGE_SIZE,
					}, function( d ){
						if(d.statusCode == "100000"){
							WHOLE.apiHandle.whole_list.api(d)
						}else{
							common.prompt( d.statusStr );
						}
					})
				},
				api:function(d){
					common.bannerShow( d.data.ad, '.seckill_whole_banner .index_banner', function( d ){ 
						var html = '', i = 0;
	 					for ( i in d ){
							html += '<div class="swiper-slide lazy"><img src="' + d[i].adLogo + '" /></div>'
						}
						return html;
					}, '.seckill_whole_banner .swiper-p2');
					
					
					var html = "", 
					goodsData = d.data.page.objects
					if (goodsData.length) {
						$.each( goodsData, function( i, v ){
							html += '<dl data-id="'+v.id+'">'
							if ( +v.packageNum > 0 ) {
								html += '	<dt><img src="'+v.goodsLogo+'" alt="" /></dt>'
							}else{
								html += '	<dt class="sold_out"><img src="'+v.goodsLogo+'" alt="" /></dt>'
							}
							
							html += '	<dd>'
							html += '		<div class="goods_left">'
							html += '			<p class="goods_name">'+v.goodsName+'</p>'
							html += '			<p class="goods_spec">'+v.goodsDescribe+'</p>'
							html += '			<p class="goods_price">整件价￥'+v.originalNowPrice+'</p>'
							html += '			<del class="goods_oldprice">单件购买￥'+v.nomalPrice+'</del>'
							html += '		</div>'
							html += '		<div class="goods_right">'
							if ( +v.packageNum > 0 ) {
								html += '			<button class="seckill_whole_btn">立即购买</button>'
							}else{
								html += '			<button class="seckill_whole_btn no_active">立即购买</button>'
							}
							
							
							html += '		</div>'
							html += '	</dd>'
							html += '</dl>'
						})
					}else{
						html += "<div class='no_active'>暂无的活动</div>"
					}
					$(".whole_goods").html(html)
				}
			},
			
		}
		WHOLE.eventHandle ={
			init:function(){
				//common.jumpLinkSpecial( ".header_left", "../index.html" ); // 回首页
				$(".whole_goods").on('click','dl',function(e){
					common.stopEventBubble(e);
					common.jsInteractiveApp({
						name:'goToNextLevel',
						parameter:{
							title:'商品详情',
							url:"html/goodsDetails.html?goodsId=" + $(this).attr("data-id")
						}
					})
					//common.jumpLinkPlain( "goodsDetails.html?goodsId=" + $(this).attr("data-id"));
				});
			}
		}
		WHOLE.init = function(){
			WHOLE.apiHandle.init()
			WHOLE.eventHandle.init()
		}
		
		pub.init = function(){
	 		$('.footer_item[data-content]','#foot').attr('data-content',cart.getgoodsNum());
			//pub.moduleId == 'seckill' && pub.seckill.init(); // 秒杀换购列表
			// 秒杀 换购 详情
//			if (pub.moduleId == "seckillGoodsDetail") {
//				pub.detail.method = "kill_goods_details";
//				pub.detail.init(); 
//			} else if(pub.moduleId == "barterGoodsDetail"){
//				pub.detail.method = "goods_show";
//				pub.detail.init();
//			}
//			pub.moduleId == 'preBuy' && pub.preBuy.init(); // 预购列表
//			pub.moduleId == 'preBuyDetail' && pub.preBuyDetail.init(); // 预购详情
			switch( pub.moduleId ){
 				case 'seckill' : pub.seckill.init(); break; 
	 			case 'whole' : WHOLE.init(); break; 
	 			case 'seckill_detail':pub.detail.seckill.init();break;
	 		}
			$("body").fadeIn(300)
		}
		
		pub.init();
	})
})
