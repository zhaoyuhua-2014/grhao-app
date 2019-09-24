/*
    payment javascript for Zhangshuo Guoranhao
*/

require(['../require/config'],function(){
	require(['common','vue'],function(common,Vue){
		
	    // 命名空间
	
	    pub = {};
	
	    pub.logined = common.isLogin(); // 是否登录
	
		pub.appData = JSON.parse(common.appData.getItem());
	
	    pub.seachParam = common.getUrlParam('search') ? common.getUrlParam('search') : 'base'; // 获取url参数
	
	    pub.openId = common.openId.getItem();
	    
	    pub.timer = null;
	 
	    pub.isBase = pub.seachParam == 'base' ; // 基本支付
	    pub.isPre = pub.seachParam == 'pre' ; // 预购支付
	    pub.isGroup = pub.seachParam == 'group'//团购支付
	    pub.isRecharge = pub.seachParam == 'recharge' ; // 充值
	    
	    pub.reg_card = /^[0-9]{14}$/;
		pub.reg_card_ = /^[0-9]{1,14}$/;
		pub.reg_exchange = /^[0-9A-Za-z]{16}$/;
		pub.reg_exchange_ = /^[0-9A-Za-z]{1,16}$/;
	    
	    pub.urlParam = {
	    	'base':1,
	    	'pre':2,
	    	'recharge':3,
	    	'group':4
	    }
	    //common.isApp() = true
	    pub.isApp =  common.isApp() ; // 接收 app 环境
		if (pub.isRecharge && pub.isApp ) {
			pub.seachParam = 'rechargeApp'
		}
	
	    
	    if( pub.logined ){
	        pub.tokenId = common.tokenIdfn(); 
	        pub.userData = common.user_datafn(); // 用户信息
	        pub.userId = pub.userData.cuserInfoid;
	        pub.orderCode = common.orderCode.getItem(); // 订单编号
	        pub.isRecharge && ( pub.source = "userId" + pub.userId );
	        if( common.orderCode.getKey() ){
	            pub.isBase && ( pub.source = 'orderCode' + pub.orderCode );
	            pub.isPre && ( pub.source = "preOrderCode" + pub.orderCode );
	        }
	
	        pub.sign = md5( pub.source + "key" + common.secretKeyfn() ).toUpperCase();
	
	        pub.mobile = pub.userData.mobile;
	        pub.userBasicParam = {
	            source : pub.source,
	            sign : pub.sign,
	            tokenId : pub.tokenId
	        };
	    }else{
	        //common.jumpLinkPlainApp("登录",'html/index.html'); // 未登录跳到首页
	        common.jsInteractiveApp({
				name:'goHome'
			})
	    }
	
	    pub.orderType = null; // 订单类型 4.尾款订单
	    pub.isCanPay = null; // 1.表示能支付 2.表示不能支付
	    pub.PAY_WAY = "1"; // 支付方式  1. 月卡 2.微信 3.银行卡 4.支付宝支付
	    pub.dtd = $.Deferred(); // 延时对象
	    pub.dtd1 = $.Deferred(); // 余额问题
	    pub.loading = $(".order_refund"); // loading 
	    pub.smsCode = null;
	
		pub.firmIdType = common.firmIdType.getItem();
	    pub.apiHandle = {};
		//换肤
		pub.apiHandle.change_app_theme = {
			init:function(){
				if (common.huanfu.getItem() && common.huanfu.getItem() != 1) {
					$(".month_recharge_content,.month_pay_style,.zs-pay,.pay_style_box").addClass("skin"+sessionStorage.getItem("huanfu"))
				}
			}
		}
		
		pub.rechange ={
			init:function(){
				pub.rechange.api.init();
				pub.rechange.Vue = new Vue({
					el: '#vueApp',
					data: {
						rechargeMode:{
							type:0,
							list:['充值卡充值']
						},
						money:'0.00',
						rechangeCard:'',
						rechangeExchangeCode:'',
						isWX:pub.isWinXin,
						inputfocus:false,
						isMask:false,
						isApp : pub.isApp,
						screenHeight:document.body.clientHeight || document.documentElement.clientHeight ,//页面默认（初始化）高度
					},
			        beforeCreate : function(){
			        	this.isPhone = common.isPhone();
			        	this.isAndroid = common.isAndroid();
			        },
			        created : function(){
			        	console.log("created			//创建完成");
			        	if(pub.isApp ){
			        		this.payType = 0
			        	}else{
			        		this.payType = 1;
			        	}
			        },
			        mounted : function(){
			        	var _this = this;
			            window.onresize = function(){
			            	var sh = document.body.clientHeight || document.documentElement.clientHeight;
			            	console.log(sh)
			            	console.log(_this.screenHeight)
			            	if( +sh < +_this.screenHeight ){
			            		_this.inputfocus = true;
			            	}else{
			            		_this.inputfocus = false;
			            	}
			            }
			        },
			        beforeMount : function(){
			        	console.log("beforeMount		//挂载之前")
			        },
			        updated : function(){
			        	console.log("updated			//数据被更新后")
			        },
			        computed: {
					    btnIsActive:function(){
					    	if( pub.reg_card.test( this.rechangeCard ) && pub.reg_exchange.test( this.rechangeExchangeCode ) ){
					            return true;
					        }else{
					        	return false;
					        }
					    },
					    btnIsShow:function(){
					    	if (this.isPhone && this.isAndroid) {
								return !this.inputfocus;
					    	}else{
					    		return true;
					    	}
					    },
					    btnText:function(){
					    	return '立即支付';
					    }
					},
					watch:{
						rechangeExchangeCode:function(newVal,oldVal){
							if(newVal){
								if (newVal.length > 16) {
									this.rechangeExchangeCode = oldVal;
								}else{
									if(!pub.reg_exchange_.test( newVal )){
										this.rechangeExchangeCode = oldVal;
									}
								}
							}
						},
						rechangeCard:function(newVal,oldVal){
							if(newVal){
								if (newVal.length > 14) {
									this.rechangeCard = oldVal;
								}else{
									if(!pub.reg_card_.test( newVal )){
										this.rechangeCard = oldVal;
									}
								}
							}
						}
					},
					methods: {
						getIsRechargeModeType:function(index){
							return index == this.rechargeMode.type;
						},
						getRechargeListIndex:function(index){
							return index == this.rechargeListIndex;
						},
						rechargeModeClick:function(index){
							this.rechargeMode.type = index;
						},
						rechargeListClick:function(index){
							this.rechargeListIndex = index;
						},
						delRechangeCard:function(){
							this.rechangeCard = ''
						},
						delRechangeExchangeCode:function(){
							this.rechangeExchangeCode = ''
						},
						changePayType:function(index){
							this.payType = index;
						},
						recharge:function(){
							if (this.btnIsActive) {
								//pub.isRecharge
								
								
								var userInfo = common.user_datafn();
								if(!userInfo.mobile){
									common.jsInteractiveApp({
										name:'alertMask',
										parameter:{
											type:1,
											title:'充值涉及账户安全,请先绑定手机号！',
											truefn:'pub.jumpLinkPlain()'
										}
									})
									return;
								};
								
								//充值卡充值
								this.isMask = true;
								pub.rechargeCard = this.rechangeCard;
								pub.exchargeCode = this.rechangeExchangeCode;
								pub.rechange.card_pay_wallet.init();
							}
						},
						inputBlur:function(){
							this.inputfocus = false;
						},
						inputFocus:function(){
							this.inputfocus = true;
						},
						jumpPage:function(e){
							window.location.href="recharge_record.html"
						},
						goBack:function(){
							window.history.back();
						}
					},
					
				})
			},
			api:{
				init:function(){
					pub.rechange.api.user_month_card.init();
				},
				user_month_card : {
		            init : function(){
		                common.ajaxPost($.extend({},pub.userBasicParam,{
		                    method : 'user_month_card',
		                    userId : pub.userId,
		                    tokenId : pub.tokenId,
		                }),function( d ){
		                    if ( d.statusCode == "100000" ) {
		                        pub.rechange.Vue.money = d.data.systemMoney;
		                    }else if(  d.statusCode == "100400" ){
		                        common.prompt( '登录已失效，请重新登陆' );
		                        common.setMyTimeout(function(){
		                            common.jumpLinkPlain( 'login.html' );
		                        },1000);
		                    }
		                });
		            }
		        }
			},
			card_pay_wallet:{
				init:function(){//pub.userBasicParam
	        		common.ajaxPost($.extend({},pub.userBasicParam,{
	                    method : 'card_pay_wallet',
	                    userId : pub.userId,
	                    cardNum : pub.rechargeCard,
	                    cardPwd : pub.exchargeCode
	                }),function( d ){
	                	if (d.statusCode != '100000') {
	                		pub.rechange.Vue.isMask = false;
	                		common.prompt( d.statusStr )
	                	}	
	                    d.statusCode == '100000' && pub.rechange.card_pay_wallet.apiData(d)
	                });
	        	},
	        	apiData:function(d){
	        		pub.rechange.Vue.isMask = false;
	        		var v = d.data;
	        		common.createGamePopup({
	        			flag:2,
	        			imgUrl:'../img/icon_recharge_suc.png',
	        			msg:'充值成功',
	        			
	        		});
	        		var mon = (v ? v.systemMoney : 0 );
	        		pub.rechange.Vue.money = mon.toFixed(2);
	        		pub.rechange.Vue.rechangeCard = '';
	        		pub.rechange.Vue.rechangeExchangeCode = '';
	                
	        	}
			},
			goRechangeHistory(){
	        	common.jsInteractiveApp({
					name:'goToNextLevel',
					parameter:{
						title:'充值记录',
						url:'html/recharge_record.html'
					}
				})
	        }
		}
	
	
		
	    // 模块初始化
	    pub.init = function(){
	    	if (!common.huanfu.getKey()) {
				common.getChangeSkin();
				common.defHuanfu.done(function(){
					pub.apiHandle.change_app_theme.init();
				})
			}else{
				pub.apiHandle.change_app_theme.init();
			}
	
	        // 延时执行余额 
	        pub.dtd1.done(function(){
	            pub.apiHandle.user_month_card.init(); 
	        });
	
	        // 充值环境 执行余额
	        //pub.isRecharge &&  pub.apiHandle.user_month_card.init();
	        pub.isRecharge && pub.rechange.init();
	        
	        $("body").fadeIn(300)
	        //充值
	        pub.jumpLinkPlain = function (  ) {
		   		common.jsInteractiveApp({
					name:'goToNextLevel',
					parameter:{
						title:'绑定手机号',
						url:'html/bindUser.html?url=month_recharge'
					}
				})
		   	}
	        //支付
	        pub.jumpLinkPlain1 = function (  ) {
		   		common.jsInteractiveApp({
					name:'goToNextLevel',
					parameter:{
						title:'绑定手机号',
						url:'html/bindUser.html?url=order_pay'
					}
				})
		   	}
	        
	    }
	   	pub.init();
	   	
	   	
	   	window.pub = pub;
	})
})
