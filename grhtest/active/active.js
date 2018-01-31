/*
* active scirpt for Zhangshuo Guoranhao
*/ 
require(['../require/config'],function(){
	require(['common'],function(common){
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
				pub.redEnvelopesRain.redpickRain.init();
				pub.redEnvelopesRain.coupon_rain.init();
				
				
				pub.redEnvelopesRain.coupon_rain_rcd_user.init();
			},
			redpickRain:{
				init:function(){
					/*定义创建红包的个数*/
					var creatRedpickNum = 1;
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
			        /*创建红包*/
			       	function creatRedpick(){
			    		var div = document.createElement("div"),
			    			redImg = document.createElement("img");
			    		redImg.src = "img/redPick.png";
			    		div.appendChild(redImg);
			    		$(div).css({
			    			width:"106px",
							height:"122px",
							position:"absolute",
						})
			    		$(div).addClass("run1")
			    		return div;
			    	}
			       	var pickBox = $(".redpick_rain");
			       	for (var i = 0; i < creatRedpickNum;i++) {
			       		var el = creatRedpick();
			       		pickBox.append(el);
			       	};
			       	
			       	/*红包运动*/
			       	function redpickRun(){
						var els = pickBox.find("div");
			       		for (var i=0;i<els.length;i++) {
			       			
//			       			redpickRun1(els[i])
			       		}
			       	}
			       	//单个运动
			       	function redpickRun1(el){
			       		var params = $(el).offset();
			       		console.log(params);
			       		console.log(clientHeight);
			       		console.log(clientWidth);
			       		console.log(params.top > clientHeight);
			       		console.log(params.left <-120);
			       		console.log(params.left > clientWidth+120)
			       		if (params.top > clientHeight || params.left <-120 || params.left > clientWidth+120) {
			       			
			       		}else{
			       			$(el).animate({
			       				top:(params.top+randomInteger(0,50))+"px",
			       				left:(params.left+randomInteger(-20,20))+"px"
			       			},10000);
			       		}
			       		
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
					pub.couponRainId = d.data.couponRain.id;
					
					pub.redEnvelopesRain.coupon_user_raffle.init();
					pub.redEnvelopesRain.coupon_rain_rcd_list.init();
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
						d.statusCode != "100000" && common.prompt( d.statusStr );
					});
				},
				apiData:function(d){
					console.log(d)
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
					
				}
			},
			coupon_rain_rcd_user:{
				init:function(){
					common.ajaxPost($.extend({},{
						method : 'coupon_rain_rcd_user',
						userId : pub.userId,
					},{}), function( d ){
						d.statusCode == "100000" && pub.redEnvelopesRain.coupon_rain_rcd_user.apiData( d );
						d.statusCode != "100000" && common.prompt( d.statusStr );
					});
				},
				apiData:function(d){
					console.log(d)
				}
			},
		}
		
		pub.init = function(){
			pub.moduleId == 'redEnvelopesRain' && pub.redEnvelopesRain.init();
		};
		pub.init();
	})
});