/*
* score scirpt for Zhangshuo Guoranhao
*/ 
/*
* personal scirpt for Zhangshuo Guoranhao
*/ 
require(['../require/config'],function(){
	require(['common',"pull"],function(common){
	
		// 命名空间
		var pub = {};
		pub.muduleId = $('[module-id]').attr('module-id');
		pub.userBasicParam = null; // 用来保存必要接口参数
		pub.timer_id = null; // 定时器ID
		
		pub.PAGE_INDEX = common.PAGE_INDEX; // 索引
	
		pub.PAGE_SIZE = common.PAGE_SIZE; // 页面显示数据个数
		
		pub.domain = common.WXDOMAIN;
		pub.appid = common.WXAPPID;
		// 是否登录 
		pub.logined = common.isLogin();
	
		//!common.storeInfo.getKey() && common.jumpLinkPlain('../index.html'); 
	
		if( pub.logined ){
			pub.userData = common.user_datafn();
			pub.firmId = pub.userData.firmId;
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
		}else{
			pub.muduleId != "0" && common.isApp() ? common.goHomeApp() : common.jumpLinkPlain( 'my.html' );
		}
	
		// 父模块接口数据 
		pub.apiHandle = {}
		pub.apiHandle = {
			init : function(){
				
			}
		};
	
		// 父模块事件处理 
		pub.eventHandle = {};
		pub.eventHandle.init = function(){
			
		};
	
		
	/****************************  果币模块  ************************/
	
		// 命名空间
	
		pub.fruitCoins = {};
		var FRUIT_COINS = pub.fruitCoins;
			FRUIT_COINS.gameType = common.gameType.getItem();
		// 果币 事件命名空间
		FRUIT_COINS.apiHandle = {
			init : function(){
				var me = this;
				me.user_score.init();
				me.chance_fruit_coin_num.init();
				if (common.isAndroid()) {
					$(".score_top_box .score_icon").css({
						"top":"-16px",
						"background-position":"20px 68px"
					});
				}
			},
			user_score : {
				init : function(){
					common.ajaxPost($.extend({},pub.userBasicParam,{
						method:'user_score'
					}),function( d ){
						$(".score_top_box .score_icon").html( d.statusCode == "100000" ? d.data.score : '0' );
					});
				}
			},
			chance_fruit_coin_num : {
				init:function(){
					common.ajaxPost($.extend({},pub.userBasicParam,{
						method:'chance_fruit_coin_num'
					}),function( d ){
						if(d.statusCode == "100000"){
							$(".count span").html(d.data);
						}
					});
				},
				apiData:function(){
					
				}
			},
			game_chance_exchange : {
				init:function(){
					common.ajaxPost($.extend({},pub.userBasicParam,{
						method:'game_chance_exchange'
					}),function( d ){
						if ( d.statusCode == "100000" ) {
							common.prompt1({
								flag:1,
								msg:"兑换成功",
								callback:function(){
									$(".score_top_box .score_icon").html(d.data.score);
								}
							});
							if (common.gameType.getItem() == '1') {
		                    	common.goBackCustomApp({
		                    		title:'抽奖',
		                    		url:'html/gameTiger.html',
		                    		callBackName:'pub.gameTiger.apiHandle.game_chance.init()'
		                    	})
							}else{
								common.goBackCustomApp({
		                    		title:'',
		                    		url:'html/my.html',//
		                    		callBackName:'pub.apiHandle.userScoCouMon.init()'
		                    	})
							}
						}else{
							common.prompt1({
								flag:1,
								msg:d.statusStr
							})
						}
					});
				},
				apiData:function(){
					
				}
			}
	
		};
	
		// 果币 事件命名空间
		FRUIT_COINS.eventHandle = {
			init : function(){
				
				// 返回上一页
	    		common.jumpLinkSpecial('.header_left',function(){ 
	                if( FRUIT_COINS.gameType ){
	        			window.location.replace( 'gameTiger.html?dom=dom' + Math.floor(Math.random() * 100000 ) );
	                }else{
	                    window.location.replace('my.html');
	                }
	    		});
				$(".header_right").click(function(){
					var url = $(this).attr("data-url");
					common.jumpLinkPlain(url);
				});
				$(".score_top_box").on("click",".details",function(){
					var url = $(this).attr("data-url");
					//common.jumpLinkPlainApp("果币明细",url);
					common.jsInteractiveApp({
						name:'goToNextLevel',
						parameter:{
							title:'果币明细',
							url:url
						}
					})
				});
				$(".score_top_box").on("click",".abort_score",function(){
					var url = $(this).attr("data-url");
					//common.jumpLinkPlainApp("关于果币",url);
					common.jsInteractiveApp({
						name:'goToNextLevel',
						parameter:{
							title:'关于果币',
							url:url
						}
					})
				});
				$(".score_main_list").on("click",".exchangeBtn",function(){
					var count = parseInt($(".score_top_box .score_icon").html());
					var num = parseInt($(".count span").html());
					if (num > count) {
						common.prompt1({
							flag:1,
							msg:"果币不足"
						})
					}else{
						common.createPopup({
		                    flag: 9,
		                    icon: 'none',
		                    msg: '确定兑换"一次抽奖机会"',
		                    okText: '兑换',
		                    cancelText: '取消',
		                    onConfirm: function() {
		                    	FRUIT_COINS.apiHandle.game_chance_exchange.init();
		                    }
		                });
					}
				})
			},
		};
		// 果币模块初始化
		FRUIT_COINS.init = function(){
			FRUIT_COINS.apiHandle.init();
			FRUIT_COINS.eventHandle.init();
		};
	
	
	/****************************  兑换记录  ************************/
	
		// 命名空间
	
		pub.recordExchange = {};
		
		var RECORD_EXCHANGE = pub.recordExchange;
	
		// 果币 事件命名空间
		RECORD_EXCHANGE.apiHandle = {
			init : function(){
				var me = this;
				me.user_score.init();
			},
			user_score : {
				init : function(){
					
				}
			}
	
		};
	
		// 兑换记录 事件命名空间
		RECORD_EXCHANGE.eventHandle = {
			init : function(){
				
				common.jumpLinkSpecial('.header_left',function(){
					window.history.back();
				});
			},
		};
		// 果币模块初始化
		RECORD_EXCHANGE.init = function(){
			RECORD_EXCHANGE.apiHandle.init();
			RECORD_EXCHANGE.eventHandle.init();
		};
	
	/****************************  积分明细  ************************/
		// 命名空间
	
		pub.scoreManagement = {};
		
		var SCORE_MANAGEMENT = pub.scoreManagement;
		SCORE_MANAGEMENT.type = 0;
		// 果币 事件命名空间
		SCORE_MANAGEMENT.apiHandle = {
			init : function(){
				var me = this;
				me.fruit_coin_rcd_list.init();
			},
			fruit_coin_rcd_list : {
				init : function(){
					common.ajaxPost($.extend({
						method : 'fruit_coin_rcd_list',
						type:SCORE_MANAGEMENT.type,
						pageNo : pub.PAGE_INDEX,
						pageSize : pub.PAGE_SIZE
					},pub.userBasicParam),function( d ){
						if ( d.statusCode == "100000" ) {
							SCORE_MANAGEMENT.apiHandle.fruit_coin_rcd_list.apiData(d);
						}else{
							common.prompt( d.statusStr );
						}
					});
				},
				apiData:function(d){
					var isLast = d.data.isLast,
						lists = d.data.objects,
						isIndex = d.data.pageNo == 1 ? true :false,
						html = '';
					if(isIndex){
						$(".scoreManagement_list").html('')
					}
					
					
					if (lists.length != 0) {
						for (var i = 0,l=lists.length; i<l; i++) {
							html += '<div class="scoreManagement_list_item clearfloat">'
							html += '	<div class="float_left">'
							html += '		<p>'+lists[i].methodName+'</p>'
							html += '		<p>'+lists[i].createTime+'</p>'
							html += '	</div>'
							html += '	<div class="float_right">'
							html += '		<b>'+ getNum(lists[i].type,lists[i].coin) +'</b>'
							html += '	</div>'
							html += '</div>'
						}
					}else{
						html = ''
					}
					$(".scoreManagement_list").append(html)
					
					isLast ? (function(){
						$(".lodemore").html('没有更多数据了').show();
					})() : (function(){
						$(".lodemore").html('点击加载更多').show();
					})();
					
					function getNum(type , num){
						if (type ==  '1') {
							return '+'+num;
						}else{
							return '-'+num;
						}
					}
				}
			}
		};
	
		// 兑换记录 事件命名空间
		SCORE_MANAGEMENT.eventHandle = {
			init : function(){
				
				common.jumpLinkSpecial('.header_left',function(){
					window.history.back();
				});
				$(".scoreManagement_nav").on("click",".scoreManagement_nav_item",function(){
					var isActive = $(this).is(".actived"),
						data = $(this).attr("data-type") ;
					if (!isActive) {
						$(this).addClass("actived").siblings().removeClass("actived");
						SCORE_MANAGEMENT.type = data;
						pub.PAGE_INDEX = 1;
						SCORE_MANAGEMENT.apiHandle.fruit_coin_rcd_list.init();
					}
				});
				//  点击加载更多
				$('.scoreManagement_list_box').on('click','.lodemore',function( e ){
					common.stopEventBubble( e );
					if ($(this).html() == '点击加载更多') {
						pub.PAGE_INDEX ++ ;	
						SCORE_MANAGEMENT.apiHandle.fruit_coin_rcd_list.init();
					}
				});
			},
		};
		// 果币模块初始化
		SCORE_MANAGEMENT.init = function(){
			SCORE_MANAGEMENT.apiHandle.init();
			SCORE_MANAGEMENT.eventHandle.init();
		};
	
	/****************************  关于果币  ************************/
		// 命名空间
	
		pub.scoreAbout = {};
		
		var SCORE_ABOUT = pub.scoreAbout;
			SCORE_ABOUT.code = 'SHOP-GBSY-DESC'
		// 果币 事件命名空间
		SCORE_ABOUT.apiHandle = {
			init : function(){
				var me = this;
				me.grh_desc.init();
			},
			grh_desc : {
				init : function(){
					common.ajaxPost($.extend({
						method : 'grh_desc',
						code : SCORE_ABOUT.code
					},pub.userBasicParam),function( d ){
						if ( d.statusCode == "100000" ) {
							SCORE_ABOUT.apiHandle.grh_desc.apiData(d);
						}else{
							common.prompt( d.statusStr );
						}
					});
				},
				apiData:function(d){
					if( d.statusCode == "100000" ){
						var data = d.data;
						var str = data.desc;
						$(".main").html("<div class='rule_content'>"+str.replace(/\r\n/g, "<br />") +"</div>")
					}else{
						common.prompt( d.statusStr );
					}
				}
			}
	
		};
	
		// 关于果币 事件命名空间
		SCORE_ABOUT.eventHandle = {
			init : function(){
				common.jumpLinkSpecial('.header_left',function(){
					window.history.back();
				});
				
			},
		};
		//关于果币模块初始化
		SCORE_ABOUT.init = function(){
			SCORE_ABOUT.apiHandle.init();
			SCORE_ABOUT.eventHandle.init();
		};
	
	/*-----------------------抽奖----------------------------*/
	
		// 命名空间
	
		pub.gameTiger = {};
		
		var GAME_TIGER = pub.gameTiger;
		/*
		 GAME_TIGER.isClick  表示页面按钮的可点击状态
		 
		 1：抽奖没有进行完成时候  规则-签到-兑换-返回都是不可点击状态
		 
		 2：签到没有完成时候  抽奖按钮不可点击
		 
		 * */
		GAME_TIGER.isClick = true;
		/*
		 GAME_TIGER.isGameSuccess  表示请求成功或者失败
		 0表示初始值
		 
		 1 表示请求成功
		 
		 2表示请求失败--参数或者服务器应答的其他失败原因
		 
		 3表示请求失败---ajax调用的失败的方法
		*/
		GAME_TIGER.isGameSuccess = 0;
		// 抽奖命名空间
		GAME_TIGER.apiHandle = {
			init : function(){
				var me = this;
				me.game_activity.init();
				
				me.game_chance.init();
				me.lamp.init();
			},
			//灯闪烁效果
			lamp:{
				init:function(){
					var num = 0;
					$(".gameTiger_border").attr("class",function(){
						setInterval(function(){ 
							num++;
							if(num%2==0){
								$('.gameTiger_border').removeClass("gameTigerLamp1").addClass("gameTigerLamp2");
							}else{
								$('.gameTiger_border').removeClass("gameTigerLamp2").addClass("gameTigerLamp1");
							}
						},500);
					})
				}
			},
			//抽奖活动
			game_activity : {
				init : function(){
					common.ajaxPost($.extend({},pub.userBasicParam,{
						method:'game_activity',
						firmId:pub.firmId
					}),function( d ){
						if ( d.statusCode == "100000" ) {
							GAME_TIGER.apiHandle.game_activity.apiData(d);
						}else{
							common.prompt( d.statusStr );
							//GAME_TIGER.isGameSuccess = 2;
						}
					});
				},
				apiData:function(d){
					//抽奖活动ID
					GAME_TIGER.activityId = d.data.activity.id;
					GAME_TIGER.hasCheckIn = d.data.hasCheckIn > 0 ? true : false;
					
					var gameList = d.data.gameGoods;
					//缓存数据到dom元素
					$(".gameTiger_box_center").data("data",gameList);
					var lucks = $(".gameTiger_box_item");
						lucksFilter = lucks.sort(function(a,b){
							var indexA = $(a).attr("data-id");
							var indexB = $(b).attr("data-id");
							if (parseInt(indexA) < parseInt(indexB)) {
								return -1;
							}else{
								return 1;
							}
						});
					for (var i = 0,l=gameList.length; i<l; i++) {
						lucksFilter.eq(i).attr("id",gameList[i].id).find(".gameTiger_box_item_inner").html("<img src='"+gameList[i].logo+"' />");
					}
					
					$(".gameTiger_box_item.gameTiger_box_item0").addClass("active");
					
					//签到初始化
					if (GAME_TIGER.hasCheckIn) {
						$(".gameTiger_operateArea_sign").addClass("no")
					}
				}
			},
			//抽奖机会
			game_chance:{
				init:function(){
					/*var data = $.extend({},pub.userBasicParam,{
						method:'game_chance'
					});
					var done = function( d ){
						console.log(d);
						if ( d.statusCode == "100000" ) {
							$(".gameTiger_operateArea_sign").addClass("no")
							common.prompt1({
								flag:1,
								msg:"签到成功"
							});
						}else{
							common.prompt( d.statusStr );
							if (d.statusCode == "100201") {
								$(".gameTiger_operateArea_sign").addClass("no")
							}
						}
					};
					var fail = function(XMLHttpRequest,status){
						console.log(XMLHttpRequest);
						console.log(status)
						if(status=='timeout'){
							console.log("timeout");
							pub.Ajax.abort();
						}
					}
					var finish = function(XMLHttpRequest,status){
						//console.log('finish')
						console.log(XMLHttpRequest);
						console.log(status)
						if(status=='timeout'){
							pub.Ajax.abort();
						}
					}
					pub.Ajax = $.ajax({
						url: common.API,
						dataType: 'jsonp',
						jsonp:'callback1',
	    				jsonpCallback: 'successCallback',
						//timeout : 100, //超时时间设置，单位毫秒
						data : data,
						success : done,
						error : fail,
						complete : finish
					});
					function successCallback(data) {
					    console.log(data)
					}
					var head = document.head || $('head')[0] || document.documentElement; // code from jquery
					var script = $(head).find('script')[0];
					console.log(script)
					$(script).on("error",function(evt) {
					  alert('error');
					});*/
					
					common.ajaxPost($.extend({},pub.userBasicParam,{
						method:'game_chance'
					}),function( d ){
						if ( d.statusCode == "100000" ) {
							GAME_TIGER.apiHandle.game_chance.apiData(d);
						}else{
							common.prompt( d.statusStr );
						}
					});
				},
				apiData:function(d){
					var num = d.data;
					var doms = $(".gameTiger_bccc_number_box .gameTiger_number");
					$(".gameTiger_bccc_number_box").attr("data-num",num);
					var arr = [doms.eq(0)[0].className.split(" "),doms.eq(1)[0].className.split(" ")];
					if (num >= 0 && num < 10) {
						doms.eq(1).removeClass().addClass(arr[1][0]).addClass("number"+num);
					}else if(num < 100){
						var n1 = parseInt(num/10),
							n2 = parseInt(num%10);
						doms.eq(0).removeClass().addClass(arr[0][0]).addClass("number"+n1);
						doms.eq(1).removeClass().addClass(arr[1][0]).addClass("number"+n2);
					}else {
						
					}
					
				}
			},
			//签到
			user_check_in:{
				init:function(){
					common.ajaxPost($.extend({},pub.userBasicParam,{
						method:'user_check_in'
					}),function( d ){
						if ( d.statusCode == "100000" ) {
							GAME_TIGER.apiHandle.user_check_in.apiData(d);
						}else{
							common.prompt( d.statusStr );
							if (d.statusCode == "100201") {
								$(".gameTiger_operateArea_sign").addClass("no")
							}
							GAME_TIGER.isClick = true;
						}
					});
					/*var data = $.extend({},pub.userBasicParam,{
						method:'user_check_in'
					});
					var done = function( d ){
						if ( d.statusCode == "100000" ) {
							$(".gameTiger_operateArea_sign").addClass("no")
							common.prompt1({
								flag:1,
								msg:"签到成功",
								callback:function(){
									var o = {
										data:d.data
									};
									GAME_TIGER.apiHandle.game_chance.apiData(o);
								}
							});
						}else{
							common.prompt( d.statusStr );
							if (d.statusCode == "100201") {
								$(".gameTiger_operateArea_sign").addClass("no")
							}
						}
					};
					var fail = function(){
						console.log('fail')
					}
					var finish = function(){
						console.log('finish')
						GAME_TIGER.isClick = true;
						if ($(".gameTiger_operateArea_sign").is(".noclick")) {
							$(".gameTiger_operateArea_sign").removeClass("noclick")
						}
					}
					pub.Ajax = $.ajax({
						url: common.API,
						dataType: 'jsonp',
						//jsonp: "successCallback",
	    				//jsonpCallback: 'successCallback',
						//timeout : 100, //超时时间设置，单位毫秒
						data : data,
						success : done,
						error : fail,
						complete : finish
					});
					*/
				},
				apiData:function(d){
					$(".gameTiger_operateArea_sign").addClass("no")
					common.prompt1({
						flag:1,
						msg:"签到成功",
						callback:function(){
							GAME_TIGER.isClick = true;
							var o = {
								data:d.data
							};
							GAME_TIGER.apiHandle.game_chance.apiData(o);
						}
					});
				}
			},
			//抽奖
			game_play:{
				init:function(){
					var data = $.extend({},pub.userBasicParam,{
						method:'game_play',
						activityId:GAME_TIGER.activityId
					});
					var done = function( d ){
						if ( d.statusCode == "100000" ) {
							GAME_TIGER.apiHandle.game_play.apiData(d);
						}else{
							GAME_TIGER.data = {
								id:null,
								status:'fail',
								msg:d.statusStr
							};
							GAME_TIGER.isGameSuccess = 2;
							//common.prompt( d.statusStr );
							GAME_TIGER.isClick = true;
						}
					};
					var fail = function(){
						console.log('fail')
					};
					var finish = function(){
						if ($(".gameTiger_operateArea_sign").is(".noclick")) {
							$(".gameTiger_operateArea_sign").removeClass("noclick")
						}
					};
					pub.Ajax = $.ajax({
						url: common.API,
						dataType: 'jsonp',
						//jsonp: "successCallback",
	    				//jsonpCallback: 'successCallback',
						//timeout : 100, //超时时间设置，单位毫秒
						data : data,
						success : done,
						error : fail,
						complete : finish
					});
					var head = document.head || $('head')[0] || document.documentElement; // code from jquery
					var script = $(head).find('script')[0];
					$(script).on("error",function(evt) {
					  	GAME_TIGER.data = {
							id:null,
							status:'fail',
							msg:'网络连接异常'
						};
						GAME_TIGER.isGameSuccess = 2;
						//common.prompt( d.statusStr );
						GAME_TIGER.isClick = true;
					});
					/*
					common.ajaxPost($.extend({},pub.userBasicParam,{
						method:'game_play',
						activityId:GAME_TIGER.activityId
					}),function( d ){
						if ( d.statusCode == "100000" ) {
							GAME_TIGER.apiHandle.game_play.apiData(d);
						}else{
							GAME_TIGER.data = {
								id:null,
								status:'fail',
								msg:'失败',
								statusStr:d.statusStr
							};
							GAME_TIGER.isGameSuccess = 2;
							//common.prompt( d.statusStr );
							GAME_TIGER.isClick = true;
						}
					});*/
				},
				apiData:function(d){
					var m = d.data.chance;
					var d = d.data.gameGoods;
					GAME_TIGER.data = $.extend({},{
						prize:getIndex(d)
					}, {
						flag: d.type == 4 ? 2 : 1,
						imgUrl : d.logo,
						msg : d.type == 4 ? '很遗憾，未中奖~' : '恭喜您获得【'+d.name+'】',
						status:d.type == 4 ? '-1' : '1',
						chance : m
					});
					GAME_TIGER.isGameSuccess = 1;
					
					//获取中奖数据在整个列表里面的index；
					function getIndex (d){
						var gameList = $(".gameTiger_box_center").data("data");
						for (var i = 0,l=gameList.length; i<l; i++) {
							if (d.id == gameList[i].id) {
								return i;
							}
						}
						return null;
					}
				}
			},
			//抽奖实现
			luck : {
				index:0,	//当前转动到哪个位置，起点位置
				count:0,	//总共有多少个位置
				timer:0,	//setTimeout的ID，用clearTimeout清除
				speed:20,	//初始转动速度
				times:0,	//转动次数
				cycle:50,	//转动基本次数：即至少需要转动多少次再进入抽奖环节
				prize:-1,	//中奖位置
				init:function(id){
					if ($('.gameTiger_box_center').find(".gameTiger_box_item").length>0) {
						$luck = $('.gameTiger_box_center');
						$units = $luck.find(".gameTiger_box_item");
						this.obj = $luck;
						this.count = $units.length;
						$luck.find(".gameTiger_box_item"+this.index).addClass("active");
					};
				},
				roll:function(){
					var index = this.index;
					var count = this.count;
					var luck = this.obj;
					$(luck).find(".gameTiger_box_item"+index).removeClass("active");
					index += 1;
					if (index>count-1) {
						index = 0;
					};
					$(luck).find(".gameTiger_box_item"+index).addClass("active");
					this.index=index;
					return false;
				},
				stop:function(index){
					this.prize=index;
					return false;
				}
			},
			roll : function(){
				var luck = GAME_TIGER.apiHandle.luck;
				
				luck.times += 1;
				luck.roll();
				if (luck.times > luck.cycle+10 && luck.prize==luck.index) {
					clearTimeout(luck.timer);
					luck.prize=-1;
					luck.times=0;
					
					GAME_TIGER.isClick = true;
					if ($(".gameTiger_operateArea_start").is(".noclick")) {
						$(".gameTiger_operateArea_start").removeClass("noclick")
					}
					if (GAME_TIGER.data.status == 1) {
						var data = $.extend({},GAME_TIGER.data, {
							onConfirm : function(){
								if (common.isApp()) {
									common.goHomeApp();
								}
		                    }
						});
						common.createGamePopup(data)
					}else{
						common.createGamePopup(GAME_TIGER.data)
					}
					//重置抽奖次数
					var d = {
						data: GAME_TIGER.data.chance
					}
					GAME_TIGER.apiHandle.game_chance.apiData(d)
				}else{
					if (luck.times<luck.cycle) {
						luck.speed -= 10;
					}else if(luck.times==luck.cycle) {
						
						if (GAME_TIGER.isGameSuccess == 1) {
							luck.prize = GAME_TIGER.data.prize;	
						}else if (GAME_TIGER.isGameSuccess == 0) {
							luck.cycle = luck.cycle*2;
						}else{
							/*失败处理*/
							clearTimeout(luck.timer);
							luck.prize=-1;
							luck.times=0;
							common.prompt1({
								flag:1,
								msg:GAME_TIGER.data.msg
							});
							$(".gameTiger_operateArea_start").removeClass("noclick")
							return ;
						}
					}else{
						if (luck.times > luck.cycle+10 && ((luck.prize==0 && luck.index==7) || luck.prize==luck.index+1)) {
							luck.speed += 110;
						}else{
							luck.speed += 20;
						}
					}
					if (luck.speed<40) {
						luck.speed=40;
					};
	
					luck.timer = setTimeout(GAME_TIGER.apiHandle.roll,luck.speed);
				}
				return false;
			}
			
		};
	
		// 抽奖事件命名空间
		GAME_TIGER.eventHandle = {
			init : function(){
				common.jumpLinkSpecial('.header_left',function(){
					common.gameType.removeItem();
					window.location.replace('../index.html');
				});
				GAME_TIGER.apiHandle.luck.init();
				//抽奖
				$(".gameTiger_operateArea_start").on("click",function(){
					var dom = $(this);
					dom.addClass("down");
					setTimeout(function(){
						dom.removeClass("down")
						if (!dom.is(".noclick") && GAME_TIGER.isClick) {
							GAME_TIGER.isClick = false;
							dom.addClass("noclick");
							var num = $(".gameTiger_bccc_number_box").attr("data-num");
							if (num > 0) {
								GAME_TIGER.isGameSuccess = false;
								//调用转动的动画
								GAME_TIGER.apiHandle.luck.speed=100;
								GAME_TIGER.apiHandle.roll();
								
								GAME_TIGER.apiHandle.game_play.init();
							}else{
								common.prompt1({
									flag:1,
									msg:"您还没有抽奖机会哦！",
									callback : function(){
										dom.removeClass("noclick");
										GAME_TIGER.isClick = true;
									}
								})
							}
						}
					},200);
					
				});
				//签到
				$(".gameTiger_operateArea_sign").on("click",function(){
					var dom = $(this);
					dom.addClass("down");
					setTimeout(function(){
						dom.removeClass("down")
						if (!dom.is(".noclick") && !dom.is(".no") && GAME_TIGER.isClick) {
							GAME_TIGER.isClick = false;
							dom.addClass("noclick");
							try{
								GAME_TIGER.apiHandle.user_check_in.init();
							}catch(e){
								//TODO handle the exception
								console.log(e)
							}
						}
					},200);
				});
				//规则//兑换
				$(".gameTiger_operateArea_ruleBtn,.gameTiger_operateArea_exchange").on("click",function(){
					var dom = $(this);
					var url = dom.attr("data-url");
					if (!dom.is(".noclick") && GAME_TIGER.isClick) {
						
						dom.addClass("down").addClass("noclick");
						setTimeout(function(){
							dom.removeClass("down").removeClass("noclick");
							common.gameType.setItem("1");
							/*common.jumpLinkPlain(url)*/
							if (dom.is(".gameTiger_operateArea_ruleBtn")) {
								//common.jumpLinkPlainApp("抽奖规则" ,"html/"+url);
								common.jsInteractiveApp({
									name:'goToNextLevel',
									parameter:{
										title:'抽奖规则',
										url:"html/"+url
									}
								})
							}else if (dom.is(".gameTiger_operateArea_exchange")){
								//common.jumpLinkPlainApp("果币商城" ,"html/"+url);
								common.jsInteractiveApp({
									name:'goToNextLevel',
									parameter:{
										title:'果币商城',
										url:"html/"+url
									}
								})
							}
						},200)
					}
				});
			},
		};
		//抽奖模块初始化
		GAME_TIGER.init = function(){
			GAME_TIGER.apiHandle.init();
			GAME_TIGER.eventHandle.init();
		};
		
	/*---------------抽奖记录-----------------*/
	// 命名空间
	
		pub.gameWinRecord = {};
		
		var GAME_WIM_RECORD = pub.gameWinRecord;
		// 果币 事件命名空间
		GAME_WIM_RECORD.apiHandle = {
			init : function(){
				var me = this;
				me.user_game_rcd_list.init();
			},
			user_game_rcd_list : {
				init : function(){
					common.ajaxPost($.extend({
						method : 'user_game_rcd_list',
						pageNo : pub.PAGE_INDEX,
						pageSize : pub.PAGE_SIZE
					},pub.userBasicParam),function( d ){
						if ( d.statusCode == "100000" ) {
							GAME_WIM_RECORD.apiHandle.user_game_rcd_list.apiData(d);
						}else{
							common.prompt( d.statusStr );
						}
					});
				},
				apiData:function(d){
					var isLast = d.data.isLast,
						lists = d.data.objects,
						isIndex = d.data.pageNo == 1 ? true :false,
						html = '';
					if(isIndex){
						$(".winRecord_list").html('')
					}
					
					
					if (lists.length != 0) {
						for (var i = 0,l=lists.length; i<l; i++) {
							html += '<div class="winRecord_list_item clearfloat">'
							html += '	<div class="winRecord_item">'+lists[i].createTime+'</div>'
							html += '	<div class="winRecord_item">'+lists[i].gameGoodsName+'</div>'
							html += '</div>'
						}
					}else{
						html = ''
					}
					$(".winRecord_list").append(html)
					
					isLast ? (function(){
						$(".lodemore").html('没有更多数据了').show();
					})() : (function(){
						$(".lodemore").html('点击加载更多').show();
					})()
				}
			}
		};
	
		// 兑换记录 事件命名空间
		GAME_WIM_RECORD.eventHandle = {
			init : function(){
				common.jumpLinkSpecial('.header_left',function(){
					window.history.back();
				});
				//  点击加载更多
				$('.winRecord_list').on('click','.lodemore',function( e ){
					common.stopEventBubble( e );
					if ($(this).html() == '点击加载更多') {
						pub.PAGE_INDEX ++ ;	
						GAME_WIM_RECORD.apiHandle.user_game_rcd_list.init();
					}
				});
			},
		};
		GAME_WIM_RECORD.init = function(){
			
			GAME_WIM_RECORD.apiHandle.init();
			GAME_WIM_RECORD.eventHandle.init();
		}
	/*---------------抽奖规则-----------------*/
	// 命名空间
	
		pub.gameTigerRule = {};
		
		var GAME_TIGER_RULE = pub.gameTigerRule;
		GAME_TIGER_RULE.code = "GRH-CJGZ-DESC";
		// 抽奖规则命名空间
		GAME_TIGER_RULE.apiHandle = {
			init : function(){
				var me = this;
				
				me.grh_desc.init();
			},
			grh_desc : {
				init : function(){
					common.ajaxPost($.extend({
						method : 'grh_desc',
						code : GAME_TIGER_RULE.code
					},pub.userBasicParam),function( d ){
						if ( d.statusCode == "100000" ) {
							GAME_TIGER_RULE.apiHandle.grh_desc.apiData(d);
						}else{
							common.prompt( d.statusStr );
						}
					});
				},
				apiData:function(d){
					if( d.statusCode == "100000" ){
						var data = d.data;
						var str = data.desc;
						$(".main").html("<div class='rule_content'>"+str.replace(/\r\n/g, "<br />") +"</div>")
					}else{
						common.prompt( d.statusStr );
					}
				}
			}
		};
		// 兑换规则 事件命名空间
		GAME_TIGER_RULE.eventHandle = {
			init : function(){
				common.jumpLinkSpecial('.header_left',function(){
					window.history.back();
				});
			},
		};
		GAME_TIGER_RULE.init = function(){
			GAME_TIGER_RULE.apiHandle.init();
			GAME_TIGER_RULE.eventHandle.init();
		}
		// 换肤
		pub.apiHandle.change_app_theme = {
			init:function(){
				if (common.huanfu.getItem() && common.huanfu.getItem() != 1) {
					switch( +pub.muduleId ){
						case 0 : (function(){
							$(".main_top,.footer,.exit,.zs_address_box").addClass("skin"+sessionStorage.getItem("huanfu"))
						}()); break;
						case 1 : (function(){
							$(".zs_address_box,.zs_phone_box").addClass("skin"+sessionStorage.getItem("huanfu"))
						}()); break; // 修改个人信息
						case 2 : break; // 优惠券
						case 3 : (function(){
							$(".fruitMall_wrap_top,.fruitMall_wrap_bottom").addClass("skin"+sessionStorage.getItem("huanfu"))
						}()); break; // 果币
						case 4 : (function(){
							$(".pwd_change_reverse").addClass("skin"+sessionStorage.getItem("huanfu"))
						}()); break; // 修改密码
						case 5 : (function(){
							$(".main_tel").addClass("skin"+sessionStorage.getItem("huanfu"))
						}()); break; // 帮助中心
						case 6 : break; // 设置模块
					};
				}
			}
		}
		// 积分商户初始化函数
		pub.init = function(){
			if (!common.huanfu.getKey()) {
				common.change_app_theme();
				common.defHuanfu.done(function(){
					pub.apiHandle.change_app_theme.init();
				})
			}else{
				pub.apiHandle.change_app_theme.init();
			}
			switch( +pub.muduleId ){
				case 0 : (function(){
					pub.apiHandle.init(); // 父模块接口数据初始化
					pub.eventHandle.init(); // 父模块 事件 初始化
			 		$('.footer_item[data-content]','#foot').attr('data-content',common.getTotal());
				}()); break;
				case 1 : FRUIT_COINS.init(); break; // 果币商城
				case 2 : RECORD_EXCHANGE.init(); break; // 兑换记录
				case 3 : SCORE_MANAGEMENT.init(); break; // 果币明细
				case 4 : SCORE_ABOUT.init(); break; // 关于果币
				case 5 : GAME_TIGER.init(); break; //抽奖游戏
				case 6 : GAME_WIM_RECORD.init(); break; //抽奖记录
				case 7 : GAME_TIGER_RULE.init(); break; //抽奖规则
			};
			
		};
		pub.init();
	   	window.pub = pub;

	});
	
});