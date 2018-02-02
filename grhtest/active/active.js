/*
* active scirpt for Zhangshuo Guoranhao
*/ 
require(['../require/config'],function(){
	require(['common',"swiperJS","pull"],function(common){
		// 命名空间
		var pub = {};
		
		pub.openId = common.openId.getItem();
	
		//pub.domain = 'http://weixin.grhao.com';
		pub.domain = 'http://wxapp.grhao.com';
		
		pub.logined = common.isLogin(); // 是否登录 
	
		pub.loading = $('.click_load');
	
		pub.websiteNode = common.websiteNode.getItem() ? common.websiteNode.getItem() : null;//站点
		pub.moduleId = $( '[module-id]' ).attr( 'module-id' );
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
	
		//红包雨
		pub.redEnvelopesRain = {
			init:function(){
				//定义红包雨可点击红包开关
				pub.redRain = true;
				//节点缓存
				//抢红包按钮
				pub.redpick_center_btn_box = $(".redpick_center_btn_box");
				//倒计时节点
				pub.redpick_center_time = $(".redpick_center_time");
				//中奖记录的节点
				pub.redpick_center_winningRecord_box = $(".redpick_center_winningRecord_box");
				//规则节点
				pub.rule_box_wrap = $(".rule_box_wrap");
				//红包雨动画节点
				pub.redpick_rain_wrap  = $(".redpick_rain_wrap");
				//中奖的弹框节点
				pub.winning_box_wrap = $(".winning_box_wrap");
				pub.redEnvelopesRain.redpickRain.init();
				pub.redEnvelopesRain.coupon_rain.init();
				
				pub.redEnvelopesRain.eventHandle.init()
			},
			redpickRain:{
				init:function(){
					/*定义创建红包的个数*/
					var creatRedpickNum = 30;
					var num = 0;
					/*获取屏幕的可见宽度*/
					var clientWidth = document.documentElement.clientWidth,
						clientHeight = document.documentElement.clientHeight;
					
					/*
			         Receives the lowest and highest values of a range and
			         returns a random integer that falls within that range.
			         */
			        function randomInteger(low, high) {
			            return low + Math.floor(Math.random() * (high - low));
			        }
			
			        /*
			         Receives the lowest and highest values of a range and
			         returns a random float that falls within that range.
			         */
			        function randomFloat(low, high) {
			            return low + Math.random() * (high - low);
			        }
			
			        /*
			         Receives a number and returns its CSS pixel value.
			         */
			        function pixelValue(value) {
			            return value + 'px';
			        }
			
			        /*
			         Returns a duration value for the falling animation.
			         */
			        function durationValue(value) {
			            return value + 's';
			        }
			        //获取红包下落速度
			        function getSpeed(){
			        	return Math.random() * (8000 - 3000) + 3000; // 下落速度
			        }
			        /*创建红包*/
			       	function creatRedpick(i){
			    		var $div = $("<div data-id="+i+"><img src='img/redPick.png'/></div>");
			    		redpickRun($div)
			    		return $div;
			    	}
			       	var pickBox = $(".redpick_rain");
			       
			       	/*for (var i = 0; i < creatRedpickNum;i++) {
			       		
			       	};*/
			       	/*做判断分时段去初始化创建红包*/
			       	var t = setInterval(function(){
			       		if (num <= creatRedpickNum) {
			       			console.log(num)
			       			var el = creatRedpick(num);
			       			pickBox.append(el);
			       			num ++;
			       			
			       		}else{
			       			clearInterval(t);
			       		}
			       	},100)
			       	
			       	/*红包运动*/
			       	function redpickRun(el){
			       		var t = randomInteger(-(clientHeight),-120),
			       			l = randomInteger(-120,720);
						el.css({
			    			width:"106px",
							height:"122px",
							position:"absolute",
							top:t+"px",
							left:l+"px"
						})
			    		el.animate({
			    			top:(clientHeight+122)+"px",
			    			left:( randomInteger(-106,106+clientWidth) )+"px"
			    		},randomInteger(4000,8000),function(){
			    			redpickRun(el)
			    		})
			       }
				},
				
			},
			coupon_rain:{
				init:function(){
					common.ajaxPost($.extend({},{
						method : 'coupon_rain',
						websiteNode : pub.websiteNode
					},{}), function( d ){
						d.statusCode == "100000" && pub.redEnvelopesRain.coupon_rain.apiData( d );
						d.statusCode != "100000" && common.prompt( d.statusStr );
					});
				},
				apiData:function(d){
					var couponRainData = d.data.couponRain,
						adInfoList = d.data.adInfoList;
					
					//果然好规则初始化
					pub.redEnvelopesRain.coupon_rain.activeRule(d.data.grhDesc);
					//果然好广告轮播处理
					if (adInfoList) {
						pub.redEnvelopesRain.coupon_rain.activeBanner(adInfoList)
					}
					//判断活动不为空
					if (couponRainData) {
						pub.couponRainId = couponRainData.id;
						//系统时间开始时间结束时间
						pub.systemTime = Date.parse(d.data.systemTime);
						pub.startTime = Date.parse(couponRainData.startTime);
						pub.stopTime = Date.parse(couponRainData.stopTime);
						
						if (pub.startTime > pub.stopTime) {
							console.log("时间设置有误")
						}else{
							if (pub.systemTime < pub.startTime) {
								var h = (pub.startTime - pub.systemTime)/1000;
								
								var arr = pub.redEnvelopesRain.coupon_rain.changeTime(h);
								pub.redpick_center_time.find('.redpick_center_time_number_box').eq(0).html(arr[0]).end().eq(1).html(arr[1]).end().eq(2).html(arr[2]).end();
								pub.redpick_center_time.removeClass("hidden")
								
								pub.redEnvelopesRain.coupon_rain.redpickTime.init();
								pub.redpick_center_btn_box.addClass("active");
								pub.redpick_center_time.attr("time",h-1);
								
							} else if (pub.systemTime >= pub.startTime && pub.systemTime <= pub.stopTime){
								
								pub.redpick_center_btn_box.removeClass("hidden").addClass("active_start");
								console.log("活动进行中")
								pub.redEnvelopesRain.coupon_rain_rcd_list.init();
							} else if (pub.systemTime > pub.stopTime){
								pub.redpick_center_btn_box.removeClass("hidden").addClass("active_end");
								console.log("活动已经结束")
								pub.redEnvelopesRain.coupon_rain_rcd_list.init();
							}
						}
						if(pub.isrefresh){
					 		pub.pullInstance.pullDownSuccess();
					 	}
					} else{
						pub.redpick_center_btn_box.html("暂无活动！").css({
							"text-align": "center",
							"font-size": "36px"
						})
						pub.redpick_center_winningRecord_box.addClass("hidden")
						if(pub.isrefresh){
					 		pub.pullInstance.pullDownSuccess();
					 	}
					}
					
					
					
				},
				//广告显示
				activeBanner:function(d){
					var html = '';
					for (var i in d) {
						html += "<div class='swiper-slide'><img src = '"+d[i].adLogo+"' /></div>"
					}
					$(".redPick_top_banner .swiper-wrapper").append(html);
					console.log(pub.swiperBanner)
					if (!pub.swiperBanner) {
						pub.swiperBanner = new Swiper(".redPick_top_banner",{
							direction: 'horizontal',
							loop: true,
					    	autoplay:5000,
						});
					}else{
						pub.swiperBanner.init();
					}
				},
				//活动规则
				activeRule:function(d){
					pub.rule_box_wrap.data("data",d);
					pub.rule_box_wrap.find(".rule_box_center").html("<p class='text'>"+d.desc+"</p>")
				},
				/*将毫秒转换为时分秒*/
				changeTime:function(a){
					var arr = [],m='';
					arr[0] = parseInt(a/3600) < 10 ? "0"+parseInt(a/3600) :  parseInt(a/3600);
					arr[1] = parseInt((a%3600)/60) < 10 ? "0"+parseInt((a%3600)/60) : parseInt((a%3600)/60);
					arr[2] = (a%3600)%60 < 10 ? "0"+(a%3600)%60 : (a%3600)%60; 
					console.log(arr);
					return arr;
				},
				redpickTime:{
					init:function(){
						var time = setInterval(function(){
							var d = pub.redpick_center_time.attr("time");
							if (d>0) {
								var arr = pub.redEnvelopesRain.coupon_rain.changeTime(d);
								pub.redpick_center_time.find('.redpick_center_time_number_box').eq(0).html(arr[0]).end().eq(1).html(arr[1]).end().eq(2).html(arr[2]);
								pub.redpick_center_time.attr("time",d-1);
							}else{
								pub.redpick_center_time.addClass("hidden");
								pub.redpick_center_btn_box.removeClass("active").addClass("active_start")
								clearInterval(time);
							}
						},1000)
						
					}
				}
			},
			coupon_user_raffle:{
				init:function(){
					common.ajaxPost($.extend({},{
						method : 'coupon_user_raffle',
						userId : pub.userId,
						couponRainId:pub.couponRainId,
					},{}), function( d ){
						d.statusCode == "100000" && pub.redEnvelopesRain.coupon_user_raffle.apiData( d );
						
						if (d.statusCode != "100000") {
							if (d.statusCode == "100803") {
								
							}else{
								common.prompt( d.statusStr );
							}
						}
						pub.redRain = true;
						pub.redEnvelopesRain.coupon_rain_rcd_list.init();
					});
				},
				apiData:function(d){
					pub.redpick_rain_wrap.addClass("hidden");
					if (d.data == 0) {
						pub.winning_box_wrap.find(".winning_box_top").html("很抱歉<br />这是一个空包哦")
					} else{
						pub.winning_box_wrap.find(".winning_box_top").html("恭喜您<br />抽中了"+d.data+"元红包")
					}
					
					pub.winning_box_wrap.removeClass("hidden")
				}
			},
			coupon_rain_rcd_list:{
				init:function(){
					common.ajaxPost($.extend({},{
						method : 'coupon_rain_rcd_list',
						couponRainId:pub.couponRainId,
						pageNo:"1",
						pageSize:"5"
					},{}), function( d ){
						d.statusCode == "100000" && pub.redEnvelopesRain.coupon_rain_rcd_list.apiData( d );
						d.statusCode != "100000" && common.prompt( d.statusStr );
					});
				},
				apiData:function(d){
					var html = '',d = d.data.objects;
					if (d && d.length != 0) {
						for (var i in d) {
							html += '<p class="swiper-slide item" >恭喜用户<span>&nbsp;&nbsp;'+d[i].cuserName+'&nbsp;&nbsp;&nbsp;&nbsp;</span>获得'+d[i].money+'元红包</p>'
						}
						$('.redpick_center_winningRecord_banner .swiper-wrapper').html(html)
						if (!pub.swiper) {
							var swiper = pub.swiper = new Swiper(".redpick_center_winningRecord_banner",{
								direction: 'vertical',
								loop: true,
						    	autoplay:5000,
						    	slidesPerView:5,
						    	height: 200,
							});
						}else{
							pub.swiper.init();
						}
						pub.redpick_center_winningRecord_box.removeClass("hidden")
					}
					
				}
			},
			eventHandle:{
				init:function(){
					//定义抢红包的状态;
					var status = 0;
					
					$(".redpick_center_top").on("click",".redPick_btn1",function(){
						var l = $(this).is(".float_left"),
							r = $(this).is(".float_right");
						if (l) {
							common.jumpLinkPlainApp("优惠卷管理","html/cuopon_management.html")
						}
						if (r) {
							pub.rule_box_wrap.removeClass("hidden");
						}
					});
					//红包规则
					$(".rule_box_wrap").on("click",function(e){
						common.stopEventBubble(e)
						$(this).addClass("hidden")
					});
					//点击抢红包按钮红包雨显示
					pub.redpick_center_btn_box.on("click",function(e){
						common.stopEventBubble(e)
						if ($(this).is(".active_start")) {
							pub.redpick_rain_wrap.removeClass("hidden");
							$(document).css({"overflow":"hidden"});
						}
						if ($(this).is(".active")) {
							console.log("活动未开始")
						}
						if ($(this).is(".active_end")) {
							console.log("活动已经结束")
						}
					});
					//红包雨中点击红包
					pub.redpick_rain_wrap.on("click","div[data-id]",function(e){
						common.stopEventBubble(e)
						if(pub.redRain){
							pub.redRain = false;
							pub.redEnvelopesRain.coupon_user_raffle.init();
							
						}
						
					});
					//红包雨点击关闭按钮
					pub.redpick_rain_wrap.on("click",".redpick_rain_del",function(e){
						common.stopEventBubble(e)
						pub.redpick_rain_wrap.addClass("hidden");
					});
					//抽红包之后点击消失
					pub.winning_box_wrap.on("click",function(e){
						common.stopEventBubble(e)
						pub.winning_box_wrap.addClass("hidden")
					})
				}
			}
		}
		
		pub.init = function(){
			pub.moduleId == 'redEnvelopesRain' && pub.redEnvelopesRain.init();
		};
		$(document).ready(function(){
		 	pub.init();
		 	window.pub = pub;
		 	setTimeout(document.getElementById('wrapper').style.left = '0', 500);
	 		var wh = document.documentElement.clientHeight;
			
			pub.info = {
				"pullDownLable":"下拉刷新...",
				"pullingDownLable":"松开刷新...",
				"pullUpLable":"下拉加载更多...",
				"pullingUpLable":"松开加载更多...",
				"loadingLable":"加载中..."
			}
			function pullDownAction () {
				setTimeout(function () {
					pub.isrefresh = true;
					pub.redEnvelopesRain.coupon_rain.init(); // 模块初始化接口数据处理
				}, 1000);	
			}
			var $listWrapper = $('.main');

	        pub.pullInstance =  pullInstance = new Pull($listWrapper, {
	            // scrollArea: window, // 滚动区域的dom对象或选择器。默认 window
	             distance: 100, // 下拉多少距离触发onPullDown。默认 50，单位px
	
	            // 下拉刷新回调方法，如果不存在该方法，则不加载下拉dom
	            onPullDown: function () {
	                pullDownAction();
	            },
	        });
			
	 	})
	})
});