

require(['../require/config'],function () {
	require(['common','mobileUi','swiperJS','pull',],function(common){

		// 命名空间
	
		pub = {};
		
		pub.logined = common.isLogin();// 是否登录 
	
		pub.PAGE_INDEX = common.PAGE_INDEX; // 索引
	
		pub.PAGE_SIZE = common.PAGE_SIZE; // 页面显示数据个数
	
		pub.moduleId = $('[module-id]').attr( 'module-id' ); // 模块id
	
		pub.GOODS_ID = common.getUrlParam( 'goodsId' ); // 拼团商品ID   // 获取 url 参数
	
		pub.weixin = common.isWeiXin();
		
		pub.orderFrom = 'H5'; // 生成订单来源方式
		
	
		// !common.storeInfo.getKey() && common.jumpLinkPlain('../index.html'); 
	
		//pub.storeInfo = common.getStoreInfo(); // 获取门店信息
		pub.firmId = ( common.firmId.getItem() ? common.firmId.getItem() : null)// 门店ID
		
		pub.websiteNode = common.websiteNode.getItem() ? common.websiteNode.getItem() : null;//站点
	
		if( pub.logined ){
			pub.userId = common.user_datafn().cuserInfoid;
			pub.source = "userId" + pub.userId;
			pub.sign = common.encrypt.md5( pub.source + "key" + common.secretKeyfn() ).toUpperCase();
			pub.tokenId = common.tokenIdfn();
	
			if( pub.moduleId == 'preBuyDetail' ){ // 预购详情加密
				pub.source = "preGoodsId" + pub.GOODS_ID + "-userId" + pub.userId;	
				pub.sign = common.encrypt.md5( pub.source + "key" + common.secretKeyfn() ).toUpperCase();
			}
			pub.userBasicParam = {
				userId : pub.userId,
				source : pub.source,
				sign : pub.sign,
				tokenId : pub.tokenId
			};
		};
	/******************************************* 倒计时逻辑 ************************************/	
		// 必须是严格的日期模式 将时间转换为时间戳
		pub.parseDate = function( time ){
			try{
				//加上replace兼容ios new Date('2017-08-11 12:00:00') 不能解析中文-符号。解析结果为valid Date。
				return new Date(time.trim().replace(/-/g, "/")).getTime();
			}catch(e){
				new Error("Time is not in the right format!")
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
		// 日期格式化
		pub.dateFormat = function( time ){
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
		pub.countDown = function(serverTime,endTime,length){	
			var activityServerTime = null,
				activityEndTime = null,
				activitySeverDiffSystemTimer = 0,
				activityTimerID = null;
			var nowTimers = new Date().getTime();
				
				
			activityServerTime = pub.parseDate( serverTime);//"2019-02-18 13:00:52" 
			activitySeverDiffSystemTimer = activityServerTime - nowTimers;
			
			if (activityTimerID) {
				clearInterval( activityTimerID );
				activityTimerID = setInterval(pageWatchTimer,1000)
			}else{
				activityTimerID = setInterval(pageWatchTimer,1000)
			}
			pageWatchTimer()
	
			function pageWatchTimer(){
				var nTime = new Date().getTime()
				var simulationServerTim =nTime   + activitySeverDiffSystemTimer;
				for(var i = 0 ;i < length ;i++){
					var dom,btnDom,
						end = pub.parseDate( endTime[i] ),
						timeEnd = (end - simulationServerTim),
						arr = pub.dateFormat(timeEnd);
						
						
						
					if( pub.GOODS_ID){
						dom = document.getElementById('group_count_down')
						btnDom = document.getElementById('group_join')
					}else{
						dom = document.getElementById("timer"+i),
						btnDom = document.getElementById("btn_color"+i);
					}
					if ( timeEnd > 0 ) {
						if(pub.GOODS_ID){
							dom.innerHTML = '倒计时<span>'+arr[0]+'</span>天<span>'+arr[1]+'</span>时<span>'+arr[2]+'</span>分<span>'+arr[3]+'</span>秒'
							btnDom.innerText = "去参团"
						}else{
							dom.innerHTML='倒计时<span>'+arr[0]+'</span>天<span>'+arr[1]+'</span>:<span>'+arr[2]+'</span>:<span>'+arr[3]+'</span>'
							btnDom.innerText = "去参团"
						}
						 btnDom.classList.contains('actived') != true  &&  btnDom.classList.add('actived')
					} else if(timeEnd <= 0) {
						if(pub.GOODS_ID){
							dom.innerHTML = '<p>活动已结束</p>'
							btnDom.innerText = "活动已结束"
						}else{
							dom.innerHTML='倒计时<span>00</span>天<span>00</span>:<span>00</span>:<span>00</span>'
							btnDom.innerText = "已结束"
						}
						btnDom.classList.contains('actived') == true  && btnDom.classList.remove('actived')
					};
				}
			}
		};
		
		
		
		
		
		
		
		
	/******************************************* 拼团列表 ************************************/
		pub.groupBuying = {}
		var GROUP = pub.groupBuying
		
		
		GROUP.apiHandle = {
			init:function(){
				GROUP.apiHandle.group_goods.init();
			},
			group_goods:{
				init:function(){
					common.ajaxPost({
						method : 'group_goods',
						firmId : pub.firmId,
						pageNo : pub.PAGE_INDEX ,
		 				pageSize : pub.PAGE_SIZE,
		 				websiteNode:pub.websiteNode
					},function(d){
						if(d.statusCode == "100000"){
							GROUP.apiHandle.group_goods.api(d)
						}else{
							common.prompt( d.statusStr );
						}
					})
				},
				api:function(d){
					var groupGoods = d.data.page.objects,
						html = "";
	
					if(groupGoods.length){
						$.each(groupGoods, function(i,v) {
							html     += '<dl data-id = '+v.id+'>'
							html	 +=		'<dt><img src="'+v.goodsLogo +'" alt="" /></dt>'
							html	 +=		'<dd>'
							html	 +=			'<div class="goods_left">'
							html	 +=				'<p class="goods_name">'+ v.goodsName+'</p>'
							html	 +=				'<p class="goods_spec">'+ v.goodsDescribe +'</p>'
							html	 +=				'<p class="goods_price"><span class="number">'+v.num +'人拼</span>￥'+v.nowPrice +'</p>'
							html	 +=				'<p id="timer'+i+'" class="count_down">倒计时<span>00</span>天<span>00</span>:<span>00</span>:<span>00</span></p>'
							html	 +=			'</div>'
							html	 +=			'<div class="goods_right">'
							html	 +=				'<button id="btn_color'+i+'" class="seckill_whole_btn ">已结束</button>'
							html	 +=			'</div>'
							html	 +=		'</dd>'
							html	 +=	'</dl>' 
						});
					}else{
						html += "<div class='no_active'>暂无的活动</div>"
					}
					$('.group_buying').html(html)
					if (groupGoods.length) {
						var reformattedArray = groupGoods.map(function(obj) {return obj.groupEndTime });
						pub.countDown(groupGoods[0].nowDate,reformattedArray,groupGoods.length)
					}
				}
				
			},
			
			
		}
		GROUP.eventHandle = {
			init:function(){
				common.jumpLinkSpecial( ".header_left",  function(){
					common.jumpLinkPlain("../index.html")
				}); // 回首页
	
				//点击商品跳转到商品详情
				$(".group_buying").on('click','dl',function(e){
					
					//common.jumpLinkPlain( "groupBuyingDetails.html?goodsId=" + $(this).attr("data-id"));
					common.jsInteractiveApp({
						name:'goToNextLevel',
						parameter:{
							title:'商品详情',
							url:'html/groupBuyingDetails.html?goodsId=' + $(this).attr("data-id")
						}
					})
				});
			}
		}
		
		
		GROUP.init = function(){
			// 购物车初始化
			GROUP.apiHandle.init();
			GROUP.eventHandle.init();
		};
		
	/******************************************* 拼团商品详情 ************************************/
		pub.groupBuyingDetails = {}
		var GROUP_DETAILS = pub.groupBuyingDetails
		GROUP_DETAILS.ruleData = null;
		
		GROUP_DETAILS.switchInput = function( title, node1, node2, tit ){
			tit = tit || title;
			$('.header_title').html( tit );
			$( node1 ).fadeOut(100,function(){
				$( node2 ).fadeIn(200);
			});
		};
		GROUP_DETAILS.apiHandle = {
			init:function(){
				GROUP_DETAILS.apiHandle.group_details.init();
			},
			group_details:{
				init:function(){
					common.ajaxPost({
						method:'group_goods_details',
						goodsId:pub.GOODS_ID
					},function( d ){
						d.statusCode == "100000" && GROUP_DETAILS.apiHandle.group_details.apiData( d );
					},function( d ){
						common.prompt( d.statusStr );
					},function( d ){
			 			//GROUP_DETAILS.apiHandle.goods_comment_list.init();
					})
				},
				apiData:function(d){
					GROUP_DETAILS.apiHandle.goods_comment_list.init();
					var groupData = d.data.goodsInfo;
					var group = d.data.groups
					var imgHtml = "";
					common.bannerShow( groupData, '.goodsDetails_img_box', function( data ){
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
					var data = group.groupBuyers
					for(var i = 0; i < group.num;i++ ){
							if(data[i]){
								imgHtml += '<li class="imgLogo">'
								imgHtml += '<img src="'+data[i].logo+'" alt="" />'
							}else{
								imgHtml += '<li>'
								imgHtml += '<img src="" alt="" />'
							}
							imgHtml += '</li>'
					}
					$('.user_img_list').html(imgHtml)
					
					groupData.goodsContext && $('.goodsDetails_box2_').find('li').eq(0).html( groupData.goodsContext);
					
					$('.gd_goodName').html( groupData.goodsName+'<span class="group_number">'+groupData.num+'人拼</span>')
					$('.gd_specification').text(groupData.goodsDescribe)
					$('.gd_goodsPrice').html('<span class="group_price">拼团价￥'+groupData.nowPrice+'</span>')
					$('#group_join').attr('data_id',groupData.id)
					var timerD = []
					timerD[0] =groupData.groupEndTime
					pub.countDown(groupData.nowDate, timerD, 1)
				}
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
							GROUP_DETAILS.isLast = d.data.isLast;
							GROUP_DETAILS.isLast && GROUP_DETAILS.loadMore.html('没有更多数据');
							if( d.data.objects.length == 0 ){ GROUP_DETAILS.loadMore.html('暂无评论').off('click'); return; }
							GROUP_DETAILS.loadMore.before($('#goods-comment-data').tmpl( d.data ));
						}else{
							GROUP_DETAILS.loadMore.html('暂无评论').off('click');
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
						GROUP_DETAILS.loadMore.hide();
					});
				}
			},
			group_goods_sponsor:{
				init:function(){
					common.ajaxPost($.extend({}, pub.userBasicParam, {
						method : 'group_goods_sponsor',
						goodsList : pub.goodsListStr
					}),function( d ){
						if ( d.statusCode == "100000" ) {
							//common.jumpLinkPlain('groupSettlement.html')
							common.jsInteractiveApp({
								name:'goToNextLevel',
								parameter:{
									title:'提交订单',
									url:'html/groupSettlement.html'
								}
							})
						}else{
							common.prompt( d.statusStr );
						}
					})
				}
			},
			group_play:{
				init:function(){
					common.ajaxPost({
						method : 'group_play',
					},function(d){
						if ( d.statusCode == "100000" ){
							GROUP_DETAILS.ruleData = d.data;
							GROUP_DETAILS.apiHandle.group_play.apiData()
						}else{
							common.prompt( d.statusStr );
						}
					})
				},
				apiData:function(){
					$('.group_title').text(GROUP_DETAILS.ruleData.title)
					$('.group_content').text(GROUP_DETAILS.ruleData.desc)
				}
			},
			// 切换 更新手机号 修改用户信息
		
				
	
			
		}
		GROUP_DETAILS.eventHandle = {
			init:function(){
			
		       	$('.group_rule_click').click(function(){		
					var url = $(this).attr("data-url"),
					title = $(this).attr("data-title");
					common.jsInteractiveApp({
						name:'goToNextLevel',
						parameter:{
							title:title,
							url:url
						}
					})
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
				$('.footer_menu_wrap').on('click',function(){
					var id = $('#group_join').attr('data_id')
					var sum = 1
					pub.goodsList = [{"goodsId":id,"count":sum}]
					pub.goodsListStr = JSON.stringify({
						'goodsList':pub.goodsList
					})
					if(pub.logined){
						if($(this).hasClass('actived')){
							GROUP_DETAILS.apiHandle.group_goods_sponsor.init();
							localStorage.setItem('groupData',pub.goodsListStr)
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
		
		
		GROUP_DETAILS.init = function(){
			GROUP_DETAILS.loadMore = $('#goods-comment-data-box').find('.clickmore');
			GROUP_DETAILS.apiHandle.init();
			GROUP_DETAILS.eventHandle.init();
		};
	/******************************************* 拼团订单结算 ************************************/
		pub.groupSettlement = {}
		var GROUP_SETTLEMENT = pub.groupSettlement
		
		
		GROUP_SETTLEMENT.info = null;
		GROUP_SETTLEMENT.data =  localStorage.getItem('groupData')
		GROUP_SETTLEMENT.pickUpMethod = 1;
		
		GROUP_SETTLEMENT.apiHandle={
			init:function(){
				GROUP_SETTLEMENT.apiHandle.group_goods_sponsor.init()
				
			},
			group_goods_sponsor:{
				init:function(){
					common.ajaxPost($.extend({}, pub.userBasicParam, {
						method : 'group_goods_sponsor',
						goodsList : GROUP_SETTLEMENT.data
					}),function( d ){
						if ( d.statusCode == "100000" ) {
							GROUP_SETTLEMENT.apiHandle.group_goods_sponsor.apiData(d)
						}else{
							common.prompt( d.statusStr );
						}
					})
				},
				apiData:function(d){
					var data = d.data.order
					var html="";
					
					
					
					html += "<dl>"
					html += "	<dt><img src='"+data.orderDetailsList[0].goodsLogo+"' /></dt>"
					html += "	<dd>"+data.orderDetailsList[0].goodsName+"</dd>"
					html += "	<dd>"
					html += "		<span>x"+data.orderDetailsList[0].buyNumber+"</span>"
					html += "		<span>￥"+data.orderDetailsList[0].nowPrice+"</span>"
					html += "	</dd>"
					html += "</dl>"
					$('.order_goods').html(html)
					$('.goods_total span').html('￥'+data.realPayMoney )
					$('.footer_order .order_total').html('￥'+data.realPayMoney )
	//				pub.firmId = data.firmId
					GROUP_SETTLEMENT.firmId = data.firmId;
					GROUP_SETTLEMENT.apiHandle.firm_default.init()
				}
			},
			group_goods_submit:{
				init:function(){
					common.ajaxPost($.extend({
						method: 'group_goods_submit',
						activityType: "",
						couponId: "",
						juiceDeliverTime: "",
						customMobile: pub.customMobile,
						goodsList: GROUP_SETTLEMENT.data,
					},pub.userBasicParam, pub.orderParamInfo),function(d){
						switch( +d.statusCode ){
							case 100000 : (function(){
								common.orderCode.setItem( d.data.orderCode );
								common.orderBack.setItem( '1' );
								//sessionStorage.removeItem("seckillData");
//								common.historyReplace( 'order_management.html' );
//								common.jumpLinkPlain( "order_pay.html" );
								common.jsInteractiveApp({
									name:'goToNextLevel',
									parameter:{
										title:'订单支付',
										url:'html/order_pay.html'
									}
								})
							}()); break;
							case 100711 : common.prompt("地址不在配送范围"); break;
							case 100718 : common.prompt("请选择配货时间"); break;
							default : common.prompt( d.statusStr );
						}
					})
				}
			},
			firm_default:{
				init:function(){
					common.ajaxPost({
		 				method : 'firm_default',
		 				firmId : GROUP_SETTLEMENT.firmId
			 		},function(d){
			 			if ( d.statusCode == "100000" ) {
			 				var data = d.data;
			 				GROUP_SETTLEMENT.info = data;
				 			$('.order_place').html(data.firmName)
							$('.order_address').html(data.address)
							$('.order_explain').html(data.groupscargoTime) 
			 			}else{
			 				common.prompt( d.statusStr );
			 			}
			 		});
				}
			}
			
		}
		GROUP_SETTLEMENT.eventHandle={
			init:function(){
				
				$('.footer_order .order_get').on('click',function(){
					var $this = $(this);
					pub.remarks = $(".order_remarks input").val(); // 备注
					// 公共参数
					pub.orderParamInfo = {
						pickUpMethod : GROUP_SETTLEMENT.pickUpMethod,
						addrId : "",
						firmId :GROUP_SETTLEMENT.info.id,
						orderFrom : pub.orderFrom,
						message : pub.remarks,
					};
					
					$this.html('提交中 ...');
				  	var userNumber = $(".user_phone_number input").val()
					if(userNumber != ""){
						if (!common.PHONE_NUMBER_REG.test( userNumber )) {
							common.prompt('手机号输入错误');
							$this.html('提交订单');
						}else{
							pub.customMobile = userNumber; 
							GROUP_SETTLEMENT.apiHandle.group_goods_submit.init()	
						}
					}else{
						common.prompt('请输入联系方式')
						$this.html('提交订单');
					}
				})
			}
		}
		
		GROUP_SETTLEMENT.init = function(){
			GROUP_SETTLEMENT.apiHandle.init();
			GROUP_SETTLEMENT.eventHandle.init();
		};
		
		
		// 父模块
		pub.init = function(){
	 		switch( pub.moduleId ){
	   			case 'group_buying' : GROUP.init(); break; 
	   			case 'group_buying_details' : GROUP_DETAILS.init(); break; 
	   			case 'group_settlement' : GROUP_SETTLEMENT.init(); break; 
	 		}
	//		common.addType.removeItem();
		}
		pub.init();
	})
});
