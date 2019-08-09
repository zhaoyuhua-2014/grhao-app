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
	
		pub.couponInfo = [
			{ text : '立减优惠：', key : 'derateAmount' , sign :"-￥" }, // 1
			{ text : '折扣优惠：', key : 'derateAmount', sign : "-￥" }, // 2
			{ text : '果币', key : 'offScore', sign : "个"}, // 3
			{ text : '优惠券', key : 'offItemVal', sign : '元'}, // 4
		];
		
		pub.firmIdType = common.firmIdType.getItem();
	    // 接口数据处理
	    pub.apiHandle = {
	        init : function(){
	            !pub.isRecharge && pub.apiHandle.order_details.init();
	        },
	        order_details : {
	            init : function(){
	                order_detailsApi = {
	                    'base' : { method : 'order_details' },
	                    'pre' : {  method : 'pre_order_details' }
	                }[ pub.seachParam ];
	                common.ajaxPost($.extend( {
	                    orderCode : pub.orderCode
	                },pub.userBasicParam,order_detailsApi),function( d ){
	                    pub.dtd1.resolve();
	                    d.statusCode == "100000" && pub.apiHandle.order_details.apiData( d );
	                },function( d ){
	                    common.prompt( d.statusStr );
	                    pub.dtd1.resolve();
	                });
	            },
	            apiData : function( d ){
	                var 
	                orderInfo = d.data.orderInfo ? d.data.orderInfo : d.data,
	                node = $(".orderList_details ul li");
	                pub.orderType = orderInfo.activityType;
	                pub.isCanPay = orderInfo.isCanPay;
	                pub.isMachineGoods = orderInfo.isMachineGoods == 1;
					pub.firmIdType = d.data.firmInfo ? d.data.firmInfo.type : pub.firmIdType;
					
					pub.couponStrategy = orderInfo.couponStrategy;//优惠方案3-4分别为赠送果币和优惠卷
	                
	                pub.couponStrategyText = (pub.couponStrategy ==3 || pub.couponStrategy ==4) ? (function(){
	                	return pub.couponInfo[(pub.couponStrategy-1)].text + orderInfo[pub.couponInfo[(pub.couponStrategy-1)].key] + pub.couponInfo[(pub.couponStrategy-1)].sign
	                })() : null;
	                
	                pub.allText =  (!!pub.couponStrategyText ||  (!pub.isMachineGoods && orderInfo.barterCount != 0) ) ? (function(){
	                	pub.barterText = (!pub.isMachineGoods && orderInfo.barterCount != 0) ?  "<b>" + orderInfo.barterCount + "</b>次换购机会" : "";
	                	
	                	return "支付成功后可以获得" + ( (!!pub.couponStrategyText && pub.barterText) ? pub.couponStrategyText + "<br/>" +pub.barterText : (function(){
	                		return (!!pub.couponStrategyText) ? pub.couponStrategyText : '' + 
	                				(pub.barterText) ? pub.barterText : '';
	                	})() )
	                })(): '';
	                
	                // 订单信息
	                (function(){
	                    
	                    if( pub.isBase ){
							pub.money = orderInfo.realPayMoney;
	                        var json = {
	                            1 : ["订单号:<span>" + orderInfo.orderCode + "</span>","订单金额:<span>￥" + orderInfo.realPayMoney + "</span>",pub.allText],
	                            4 : ["预购商品:<span>" + orderInfo.orderDetailsList[0].goodsName + "</span>","订单号:<span>" + orderInfo.orderCode + "</span>","预购尾款金额:<span>￥" + orderInfo.realPayMoney + "</span>"],
	                            6 : ["换购商品:<span>" + orderInfo.orderDetailsList[0].goodsName + "</span>","订单号:<span>" + orderInfo.orderCode + "</span>","订单金额:<span>￥" + orderInfo.realPayMoney + "</span>"],
	                        	7 : ["订单号:<span>" + orderInfo.orderCode + "</span>","订单金额:<span>￥" + orderInfo.realPayMoney + "</span>",pub.allText],
                            	2 : ["订单号:<span>" + orderInfo.orderCode + "</span>","订单金额:<span>￥" + orderInfo.realPayMoney + "</span>",pub.allText],
	                        }[ Number( pub.orderType) ];
	
	                        node.eq(0).html( json[0] ).next().html( json[1] ).next().html( json[2] );
	
	                        node.eq(3).html( '22:30前付款，预计明日送达' );
	
	                        var pay_gg = node.parent().next();
	                        if( pub.isMachineGoods ){
	                            $('.pay_gg').html("请于"+pub.appData.data.order_cancel_time+"分钟内完成支付，超时订单将取消！");
	                            
	                            node.eq(1).css("margin-bottom",'10px');
	                        }else{
	                            pay_gg.html('请于2小时内完成支付，超时订单将取消！');
	                            node.eq(3).show().html( '22:30前付款，预计明日送达' );
	                        } 
							if (Number(pub.orderType == 1)) {
								if (pub.allText) {
									node.eq(2).css({"margin-top":"20px","border-top":"1px solid #b2b2b2","padding-top":"20px"})
									node.eq(3).css({"padding-bottom":"20px"});
								}else{
									if (!pub.isMachineGoods) {
										node.eq(3).show().html( '22:30前付款，预计明日送达' ).css({"margin-top":"20px","border-top":"1px solid #b2b2b2","padding":"20px 0"});
									}
								}
							}
	                    }else{
	                    	pub.money = orderInfo.frontMoney;
	                        node.eq(0).html("预购商品:<span>" + orderInfo.goodsInfo.goodsName + "</span>").next().html("订单号:<span>" + orderInfo.orderCode + "</span>").next().html("预购金额:<span class='font_color'>￥" + orderInfo.frontMoney + "</span>");
	                    }
	                    $(".orderList_intro").html("订单已提交！");
	                   	if (pub.isMachineGoods) {
							node.eq(3).hide();
						}
	                }());
	
	                // 支付方式
	                (function(){
	                    if( pub.isBase){
	                        if ( pub.isCanPay == '1' ) {
	                            $('.msg3').show();
	                        } else if ( pub.isCanPay == '2'){
	                            $(".msg2").show();
	                        }
	                    }
	                    if( pub.isPre ){
	                        $('.msg1,.msg2').hide();
	                        $('.msg3').show();
	                    }
	                }());
	            }
	        },
	        // 月卡
	        order_topay_month_pay : {
	            init : function(){
	                // 方法处理
	                pub.vipCardPayApi = {
	                    'base' : { method : 'order_topay_month_pay' },
	                    'pre' : {  method : 'pre_order_month_pay'}
	                }[ pub.seachParam ];
	                common.ajaxPost( $.extend({
	                    orderCode : pub.orderCode,
	                    smsCode : pub.smsCode,
	                    mobile : pub.mobile
	                },pub.userBasicParam,pub.vipCardPayApi),function( d ){
	                    if ( d.statusCode == "100000" ) {
	                    	if (pub.seachParam == "pre") {
	                    		common.jsInteractiveApp({
									name:'goToNextLevel',
									parameter:{
										title:'我的预购',
										url:'html/PreOrder_management.html'
									}
								})
	                    	}else{
	                        	if ( pub.orderType == 2) {
	                        		common.jsInteractiveApp({
										name:'goToNextLevel',
										parameter:{
											title:'拼单详情',
											url:'html/groupBuying_orderDetails.html'
										}
									})
	                        	}else{
	                        		common.jsInteractiveApp({
										name:'goToNextLevel',
										parameter:{
											title:'订单管理',
											url:'html/order_management.html'
										}
									})
	                        	}
	                    	}
	                    }else if( d.statusCode == "100802" ){
	                        common.prompt( "验证码输入有误!" );
	                    } else{
	                    	common.jsInteractiveApp({
								name:'goToNextLevel',
								parameter:{
									title:'支付结果',
									url:'html/pay_result.html'
								}
							})
	                    }
	                    pub.loading.hide();
	                });
	                
	            }
	        },
	        // 微信
	        goto_pay_weixin : {
	            
	        },
	        // 支付宝
	        order_topay_alipay : {
	
	            init : function(){
	                pub.aliPayApi = {
	                    'base' : {
	                        method : 'order_topay_alipay',
	                        orderCode : pub.orderCode
	                    },
	                    'pre' : {
	                        method : 'pre_order_ali_pay',
	                        orderCode : pub.orderCode
	                    },
	                    'recharge' : {
	                        method : 'month_card_ali_pay',
	                        payMoney : pub.payMoney,
	                        userId : pub.userId,
	                    },
	                    'rechargeApp' : {
	                    	method : 'month_card_ali_pay2',
	                        payMoney : pub.payMoney,
	                        userId : pub.userId,
	                    }
	                }[ pub.seachParam ];
					
					// app 传参
	                pub.wxAppPayWay = pub.isRecharge ? '3' : pub.isBase ? '1' : pub.isPre ? '2' : undefined; // 3充值，1普通商品支付，2预购商品
	                pub.isApp && ( pub.aliPayApi.isApp = '1' );
	                common.ajaxPost($.extend( {},pub.userBasicParam, pub.aliPayApi ),function( d ){
	                    if ( d.statusCode == '100000' ) {
	                        if (pub.isApp) {
	                        	var data = {
	                        		orderCode:pub.orderCode || d.data.note,
	                        		productName:'果然好商品',
	                        		money:pub.money || d.data.payMoney,
	                        	};
	                        	pub.apiHandle.order_topay_alipay.apiData(data)
	                        } else{
	                        	var html = "";
	                    		html = d.data;
		                    	$("body").append(html)
		                        $("form[name = 'punchout_form' ]").submit();
	                        }
	                    }else{
	                        common.prompt( d.statusStr );
	                    }
	                    pub.loading.hide();
	                },function( d ){
	                    common.prompt( d.statusStr );
	                    pub.loading.hide();
	                })
	            },
	            init1: function(){
	            },
	            apiData : function( d ){
	                try{
	                	
	                    common.isAndroid() ? android.GoAliPay( common.JSONStr( d ), pub.wxAppPayWay ) : window.webkit.messageHandlers.AliPay.postMessage([common.JSONStr( d ), pub.wxAppPayWay]);
	                    //window.webkit.messageHandlers.AliPay.postMessage([common.JSONStr( d ), pub.wxAppPayWay]);
	                }catch(e){}
	                pub.loading.hide();
	            },
	           	alipay_result : function (d){
	           		/*
	           		 方法名 aliPayResult
					参数值1个：成功9000  失败7000  取消8000
	           		 * */
	           		if (d) {
	           			if (d == 9000) {
	           				if (pub.wxAppPayWay == 1) {
			           			//common.jumpLinkPlainApp( "订单管理","html/order_management.html" );
//			           			common.jsInteractiveApp({
//									name:'goToNextLevel',
//									parameter:{
//										title:'订单管理',
//										url:'html/order_management.html'
//									}
//								})
			           			if ( pub.orderType == 2) {
	                        		common.jsInteractiveApp({
										name:'goToNextLevel',
										parameter:{
											title:'拼单详情',
											url:'html/groupBuying_orderDetails.html'
										}
									})
	                        	}else{
	                        		common.jsInteractiveApp({
										name:'goToNextLevel',
										parameter:{
											title:'订单管理',
											url:'html/order_management.html'
										}
									})
	                        	}
			           		} else if (pub.wxAppPayWay == 2) {
			           			//common.jumpLinkPlainApp( "我的预购","html/PreOrder_management.html" );
			           			common.jsInteractiveApp({
									name:'goToNextLevel',
									parameter:{
										title:'我的预购',
										url:'html/PreOrder_management.html'
									}
								})
			           		} else if (pub.wxAppPayWay == 3) {
			           			//window.location.reload();
			           			
			           			if ( pub.isApp ) {
			           				if (common.isAndroid()) {
			           					pub.apiHandle.user_month_card.init();
			           					setTimeout(function(){
					           				common.goBackCustomApp({
					                    		title:'',
					                    		url:'html/my.html',
					                    		callBackName:'pub.apiHandle.userScoCouMon.init()'
						                    });
					           			},800)
			           				}else{
			           					window.location.reload();
			           				}
			           			}
			           		}
	           			} else if (d == 7000 ) {
	           				common.prompt("支付失败，请重新支付");
	           			} else if (d == 8000) {
	           				common.prompt("取消支付");
	           			} else {
	           				console.log("app端传回的参数为"+d)
	           			}
	           		}else{
	           			console.log("app端传回的参数为"+d)
	           		}
	           	}
	        },
	        // 银行卡
	        order_topay_llpay : {
	            init : function(){
	                pub.bankPayApi = {
	                    'base' : {
	                        method : 'order_topay_llpay',
	                        orderCode : pub.orderCode
	                    },
	                    'pre' : {
	                        method :  'pre_order_ll_pay',
	                        orderCode : pub.orderCode
	                    },
	                    'recharge' : {
	                        method : 'month_card_ll_pay',
	                        payMoney : pub.payMoney,
	                        userId : pub.userId
	                    },
	                    'rechargeApp' : {
	                        method : 'month_card_ll_pay',
	                        payMoney : pub.payMoney,
	                        userId : pub.userId
	                    }
	                }[ pub.seachParam ];
	
	                pub.isApp && ( pub.bankPayApi.isApp = '1' ); // app支付
	
	                common.ajaxPost( $.extend({
	                    bankCard : pub.bankCardNum
	                },pub.userBasicParam, pub.bankPayApi),function( d ){
	                    if ( d.statusCode == '100000' ) {
	                        $('#input1').attr('value', common.JSONStr( d.data ) );
	                        $('#form1').submit();
	                    }else{
	                        common.prompt( d.statusStr );
	                    }
	                },function( d ){
	                    common.prompt( d.statusStr );
	                });
	            }
	        },
	        send_sms2 : {
	            init : function(){
	                common.ajaxPost($.extend({},pub.userBasicParam,{
	                    method :  'send_sms2',
	                    mobile : pub.mobile,
	                    type : '3'
	                }),function( d ){
	                    d.statusCode != '100000' && common.prompt( d.statusStr );
	                });
	            }
	        },
	        user_month_card : {
	            init : function(){
	                common.ajaxPost($.extend({},pub.userBasicParam,{
	                    method : 'user_month_card',
	                    userId : pub.userId,
	                    tokenId : pub.tokenId,
	                }),function( d ){
	                    if ( d.statusCode == "100000" ) {
	                        var 
	                        nodeBox = $(".count-left-money em");
	                        d.data && nodeBox.html( d.data.systemMoney );
	                        !d.data && nodeBox.html("0");
	                    }else if(  d.statusCode == "100400" ){
	                        common.prompt( '登录已失效，请重新登陆' );
	                        common.setMyTimeout(function(){
	                            common.jumpLinkPlainApp( '登录','html/login.html' );
	                        },1000);
	                    }
	
	                });
	            }
	        },
	        get_weixin_code : {
	            
	        },
	        // 微信 app 支付
	        wx_pay_app : {
	
	            init : function(){
	                pub.wx_pay_appApi = {
	                    'base' : {
	                        method : "goto_pay_weixin_app",
	                        orderCode : pub.orderCode
	                    },
	                    'pre' : {
	                        method : "pre_order_wx_pay_app",
	                        orderCode : pub.orderCode,
	                    },
	                    'recharge' : {
	                        method : "month_card_wx_pay_app",
	                        payMoney : pub.payMoney,
	                        userId : pub.userId,
	                    },
	                    'rechargeApp' : {
	                        method : "month_card_wx_pay_app",
	                        payMoney : pub.payMoney,
	                        userId : pub.userId,
	                    }
	                }[ pub.seachParam ];
	                // app 传参
	                pub.wxAppPayWay = pub.isRecharge ? '3' : pub.isBase ? '1' : pub.isPre ? '2' : undefined; // 3充值，1普通商品支付，2预购商品
	
	                common.ajaxPost($.extend({},pub.userBasicParam,pub.wx_pay_appApi),function( d ){
	                    d.statusCode == "100000" && pub.apiHandle.wx_pay_app.apiData( d );
	                },function( d ){
	                    alert("支付插件升级中。。。");
	                });
	            },
	            apiData : function( d ){
	                try{
	                    common.isAndroid() ? android.WXPay( common.JSONStr( d ), pub.wxAppPayWay ) : window.webkit.messageHandlers.WXPay.postMessage([common.JSONStr( d ), pub.wxAppPayWay]);
	                }catch(e){}
	                pub.loading.hide();
	            },
	            wxpay_result : function(d){
	            	/*
	           		 方法名 aliPayResult
					参数值1个：成功9000  失败7000  取消8000
	           		 * */
	           		if (d) {
	           			if (d == 9000) {
	           				if (pub.wxAppPayWay == 1) {
			           			//common.jumpLinkPlainApp( "订单管理","html/order_management.html" );
//			           			common.jsInteractiveApp({
//									name:'goToNextLevel',
//									parameter:{
//										title:'订单管理',
//										url:'html/order_management.html'
//									}
//								})
								if ( pub.orderType == 2) {
	                        		common.jsInteractiveApp({
										name:'goToNextLevel',
										parameter:{
											title:'拼单详情',
											url:'html/groupBuying_orderDetails.html'
										}
									})
	                        	}else{
	                        		common.jsInteractiveApp({
										name:'goToNextLevel',
										parameter:{
											title:'订单管理',
											url:'html/order_management.html'
										}
									})
	                        	}
			           		} else if (pub.wxAppPayWay == 2) {
			           			//common.jumpLinkPlainApp( "我的预购","html/PreOrder_management.html" );
			           			common.jsInteractiveApp({
									name:'goToNextLevel',
									parameter:{
										title:'我的预购',
										url:'html/PreOrder_management.html'
									}
								})
			           		} else if (pub.wxAppPayWay == 3) {
			           			//window.location.reload();
			           			pub.apiHandle.user_month_card.init();
			           			setTimeout(function(){
			           				common.goBackCustomApp({
			                    		title:'',
			                    		url:'html/my.html',
			                    		callBackName:'pub.apiHandle.userScoCouMon.init()'
				                    });
			           			},800)
			           			
			           		}
	           			} else if (d == 7000 ) {
	           				common.prompt("支付失败，请重新支付");
	           			} else {
	           				console.log("app端传回的参数为"+d)
	           			}
	           		}else{
	           			console.log("app端传回的参数为"+d)
	           		}
	            }
	        },
	        ExchangeRechargeableCard:{
	        	init:function(){//pub.userBasicParam
	        		common.ajaxPost($.extend({},pub.userBasicParam,{
	                    method : 'card_pay_wallet',
	                    userId : pub.userId,
	                    cardNum : pub.rechargeCard,
	                    cardPwd : pub.exchargeCode
	                }),function( d ){
	                    d.statusCode != '100000' && common.prompt( d.statusStr );
	                    d.statusCode == '100000' && pub.apiHandle.ExchangeRechargeableCard.apiData(d)
	                });
	        	},
	        	apiData:function(d){
	        		var v = d.data;
	        		common.createGamePopup({
	        			flag:2,
	        			imgUrl:'../img/icon_recharge_suc.png',
	        			msg:'充值成功',
	        			
	        		});
	        		$("#rechange_card,#rechange_exchangeCode").val('');
	        		var 
	                nodeBox = $(".count-left-money em");
	                v ? nodeBox.html( v.systemMoney ) : nodeBox.html("0");
	        		
	        	}
	        },
	    };
	    // 支付方式
	    pub.payWay = {};
	    // 微信支付的临时函数
	    pub.payWay.weixinPayTemp = function(){
	        
	    };
	
	    // 月卡支付
	    pub.payWay.vipCardPay = function(){
	
	        pub.smsCode = $("#verify_code1").val();
	        if( pub.isCanPay == 2 ){
	            common.prompt( "账户余额不足,请先充值" ); return;
	        }
	        if( !/^\d{6}$/.test( pub.smsCode ) ){ 
	            common.prompt( "请输入正确的验证码" ); return; 
	        }
	        pub.loading.show();
	        pub.timer = setTimeout(function(){
	        	if (!pub.loading.is(":hidden")) {
	        		pub.loading.hide();
	        		common.prompt("网路延迟，请稍后重试")
	        	}
	        	clearTimeout(pub.timer)
	        },10000)
	        pub.apiHandle.order_topay_month_pay.init();
	    };
	    // 微信支付
	    pub.payWay.weixinPay = function(){
	       
	    };
	    // 微信支付 app 端
	    pub.payWay.weixinAppPay = function(){
	         // 充值
	        if( pub.isRecharge ){
	            pub.money = pub.payMoney = $('#wx_rechange').val();
	            if( isNaN( pub.payMoney ) || pub.payMoney < 0.01 ){
	                common.prompt( "充值金额只能为数字且不小于0.01元" ); return;
	            } 
	        }
	        pub.loading.show();
	        pub.timer = setTimeout(function(){
	        	if (!pub.loading.is(":hidden")) {
	        		pub.loading.hide();
	        		common.prompt("网路延迟，请稍后重试")
	        	}
	        	clearTimeout(pub.timer)
	        },10000)
	        pub.apiHandle.wx_pay_app.init(); // 初始化 app 微信支付
	    };
	    // 支付宝支付
	    pub.payWay.aliPay = function(){
	        // 充值
	        if( pub.isRecharge ){
	            pub.payMoney = $('#zfb_rechange').val();
	            if( isNaN( pub.payMoney ) || pub.payMoney < 0.01 ){
	                common.prompt( "充值金额只能为数字且不小于0.01元" ); return;
	            }
	        }
	        pub.loading.show();
	        pub.timer = setTimeout(function(){
	        	if (!pub.loading.is(":hidden")) {
	        		pub.loading.hide();
	        		common.prompt("网路延迟，请稍后重试")
	        	}
	        	clearTimeout(pub.timer)
	        },10000)
	        pub.apiHandle.order_topay_alipay.init();
	    };
	    
	    // 银行卡支付
	    pub.payWay.bankPay = function(){
	        pub.bankCardNum = $("#pay_style_card").val();
	
	        if( !common.BANK_CARD_REG.test( pub.bankCardNum ) ) {
	            common.prompt( "请输入正确的银行卡号" ); return;
	        }
	        // 充值
	        if( pub.isRecharge ){
	            pub.payMoney = $('#quick_rechange').val();
	            if( isNaN( pub.payMoney ) || pub.payMoney < 0.01 ){
	                common.prompt( "充值金额只能为数字且不小于0.01元" ); return;
	            } 
	        }
	        
	        pub.loading.show();
	        pub.timer = setTimeout(function(){
	        	if (!pub.loading.is(":hidden")) {
	        		pub.loading.hide();
	        		common.prompt("网路延迟，请稍后重试")
	        	}
	        	clearTimeout(pub.timer)
	        },10000)
	        pub.apiHandle.order_topay_llpay.init();
	    };
		//充值卡充值
		pub.payWay.rechangeCardPay = function(){
			pub.rechargeCard = $("#rechange_card").val();
			pub.exchargeCode = $("#rechange_exchangeCode").val();
			var reg_card = /^[0-9]{12}$/;
			var reg_exchange = /^[0-9A-Za-z]{4}$/;
			if( !reg_card.test( pub.rechargeCard ) ) {
	            common.prompt( "请输入正确的充值卡号" ); return;
	        }
	        // 充值
	       	if( !reg_exchange.test( pub.exchargeCode ) ) {
	            common.prompt( "请输入正确的兑换码" ); return;
	        }
	        pub.apiHandle.ExchangeRechargeableCard.init();
		}
	    // 事件处理
	    pub.eventHandle = {
	        init : function(){
	            // 支付方式切换 
	            $('.zs-pay-way').click(function(){
	                var 
	                $this = $(this),
	                index = $this.index(),
	                isCur = $this.is( '.bg_select' );
	                if( !isCur ){
	                    var 
	                    childNode = $this.find( '.content-box' ),
	                    nodeBox = $this.siblings().find( '.content-box' ),
	                    isVisible = nodeBox.is( ':visible' );
	                    $this.addClass( 'bg_select' ).siblings().removeClass( 'bg_select' );
	                    pub.PAY_WAY = $this.attr( 'pay-way' );
	                    childNode[0] && childNode.slideDown( 300 );
	                    isVisible && nodeBox.slideUp( 300 );
	                }
	            });
	            //点击支付
	            $(".zs-pay").on("click",function(){
	            	
	                switch( Number( pub.PAY_WAY ) ){
	                    case 1 : pub.payWay.vipCardPay(); break; // 月卡
	                    case 2 : !pub.isApp ? pub.payWay.weixinPay() : pub.payWay.weixinAppPay(); break; // 微信
	                    case 3 : pub.payWay.bankPay(); break; // 银行卡
	                    case 4 : pub.payWay.aliPay(); break; // 支付宝
	                    case 5 : pub.payWay.rechangeCardPay(); break; // 充值卡
	                };
	            });
	            
	            $('#get_verify_code').on('click',function(){ // 获取验证码
	            	
	            	var userInfo = common.user_datafn();
					if(!userInfo.mobile){
						common.jsInteractiveApp({
							name:'alertMask',
							parameter:{
								type:1,
								title:'充值涉及账户安全,请先绑定手机号！',
								truefn:'pub.jumpLinkPlain1()'
							}
						})
						return;
					};
					
	                var 
	                timeNode = $("#time"),
	                $this = $(this),
	                i = 59,
	                timerId;
	                $("#verify_code1").removeAttr( "disabled" );
	                $this.css("display",'none').next().css("display","block").html( '( 60s 后重试)' );
	                pub.apiHandle.send_sms2.init();
	                timerId = setInterval(function(){
	                    if ( i == 0 ) {
	                        $this.css("display","block").html('重新获取').next().css("display","none");
	                        clearInterval( timerId );
	                        i = 59;
	                    }else{
	                        timeNode.html( "(" + ( i-- ) + "s后可重试)" );
	                    }
	                },1000);
	            });
	            $(".pay_style_msg a").on("click",function(){
	            	var url = $(this).attr("data-url"),
					title = $(this).attr("data-title");
					var userInfo = common.user_datafn();
					if(!userInfo.mobile){
						common.jsInteractiveApp({
							name:'alertMask',
							parameter:{
								type:1,
								title:'充值涉及账户安全,请先绑定手机号！',
								truefn:'pub.jumpLinkPlain1()'
							}
						})
						return;
					};
					common.jsInteractiveApp({
						name:'goToNextLevel',
						parameter:{
							title:title,
							url:url
						}
					})
	            })
	        }
	    };
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
				pub.rechange.eventHandle.init();
				pub.rechange.api.init();
				pub.rechange.Vue = new Vue({
					el: '#vueApp',
					data: {
						rechargeMode:{
							type:0,
							list:['在线充值','充值卡充值']
						},
						money:'0.00',
						rechargeList:[],
						rechargeListIndex:0,
						rechangeCard:'',
						rechangeExchangeCode:'',
						payType:0,//支付方式
						isWX:pub.isWinXin,
						inputfocus:false,
						isMask:false,
						isApp : pub.isApp
					},
			        beforeCreate : function(){
			        	this.isPhone = common.isPhone();
			        },
			        created : function(){
			        	console.log("created			//创建完成");
			        	if(pub.isApp ){
			        		this.payType = 0
			        	}else{
			        		this.payType = 1;
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
					    	if (this.rechargeMode.type == 0) {
					    		return true;
					    	}else{
					    		var reg_card = /^[0-9]{12}$/;
								var reg_exchange = /^[0-9A-Za-z]{4}$/;
								if( reg_card.test( this.rechangeCard ) && reg_exchange.test( this.rechangeExchangeCode ) ){
						            return true;
						        }else{
						        	return false;
						        }
					    	}
					    },
					    btnIsShow:function(){
					    	if (this.isPhone) {
					    		if (this.inputfocus) {
					    			return false;
					    		}else{
					    			return true;
					    		}
					    	}else{
					    		return true;
					    	}
					    },
					    btnText:function(){
					    	if (this.rechargeMode.type == 0) {
					    		if (this.rechargeList.length) {
						    		return '需支付' + this.rechargeList[this.rechargeListIndex].limit + '元';
						    	}else{
						    		return false;
						    	}
					    		
					    	}else{
					    		return '立即支付';
					    	}
					    }
					},
					watch:{
						rechangeExchangeCode:function(newVal,oldVal){
							var reg_exchange = /^[0-9A-Za-z]{1,4}$/;
							if(newVal){
								if (newVal.length > 4) {
									this.rechangeExchangeCode = oldVal;
								}else{
									if(!reg_exchange.test( newVal )){
										this.rechangeExchangeCode = oldVal;
									}
								}
							}
						},
						rechangeCard:function(newVal,oldVal){
							var reg_card = /^[0-9]{1,12}$/;
							
							if(newVal){
								if (newVal.length > 12) {
									this.rechangeCard = oldVal;
								}else{
									if(!reg_card.test( newVal )){
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
								//在线充值
								if (this.rechargeMode.type == 0) {
									pub.payMoney = this.rechargeList[this.rechargeListIndex].limit;
									pub.rechargeId = this.rechargeList[this.rechargeListIndex].id;
									if (this.payType == 0) {
										this.isMask = true;
										if (pub.isApp) {
											pub.rechange.wx_pay_app.init();
											return;
										}
										//PW.weixinPay(); break; // 微信
										// 微信支付
									   pub.pathName = {
								            'base' : '/html/order_pay.html?search=base',
								            'pre' : '/html/order_pay.html?search=pre',
								            'recharge' : '/html/month_recharge.html?search=recharge'
								        }[ pub.seachParam ];
								        
								        if( !common.openId.getKey() ){
								            if( pub.weixinCode ){
								                pub.apiHandle.get_weixin_code.init(); // code存在请求获取opendId
								            }else{
								                common.jumpLinkPlain('https://open.weixin.qq.com/connect/oauth2/authorize?appid='+pub.appid+'&redirect_uri=' + pub.domain + pub.pathName + '&response_type=code&scope=snsapi_userinfo&state=grhao&connect_redirect=1#wechat_redirect');
								            }
								            pub.dtd.done(function(){
								                pub.openId = common.openId.getItem();
								                pub.rechange.goto_pay_weixin.init();
								            });
								        }else{
								            pub.rechange.goto_pay_weixin.init();
								        }
									}else if (this.payType == 1) {
										this.isMask = true;
										pub.rechange.order_topay_alipay.init();
									}
								} else{
									//充值卡充值
									this.isMask = true;
									pub.rechargeCard = this.rechangeCard;
									pub.exchargeCode = this.rechangeExchangeCode;
									pub.rechange.card_pay_wallet.init();
								}
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
					pub.rechange.api.recharge_config.init();
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
		        },
		        recharge_config : {
		        	init:function(){
		        		common.ajaxPost($.extend({},pub.userBasicParam,{
		                    method : 'recharge_config',
		                    tokenId : pub.tokenId,
		                }),function( d ){
		                    if ( d.statusCode == "100000" ) {
		                    	pub.rechange.Vue.rechargeList = d.data;
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
			order_topay_alipay : {
	            init : function(){
	            	pub.aliPayApi = {
	                    'base' : {
	                        method : 'order_topay_alipay',
	                        orderCode : pub.orderCode
	                    },
	                    'pre' : {
	                        method : 'pre_order_ali_pay',
	                        orderCode : pub.orderCode
	                    },
	                    'recharge' : {
	                        method : 'month_card_ali_pay',
	                        payMoney : pub.payMoney,
	                        rechargeId : pub.rechargeId,
	                        userId : pub.userId,
	                    },
	                    'rechargeApp' : {
	                    	method : 'month_card_ali_pay2',
	                    	rechargeId : pub.rechargeId,
	                        payMoney : pub.payMoney,
	                        userId : pub.userId,
	                    }
	                }[ pub.seachParam ];
					
					// app 传参
	                pub.wxAppPayWay = pub.isRecharge ? '3' : pub.isBase ? '1' : pub.isPre ? '2' : undefined; // 3充值，1普通商品支付，2预购商品
	                pub.isApp && ( pub.aliPayApi.isApp = '1' );
	                common.ajaxPost($.extend( {},pub.userBasicParam, pub.aliPayApi ),function( d ){
	                    if ( d.statusCode == '100000' ) {
	                        if (pub.isApp) {
	                        	var data = {
	                        		orderCode:pub.orderCode || d.data.note,
	                        		productName:'果然好商品',
	                        		money:pub.money || d.data.payMoney,
	                        	};
	                        	pub.rechange.order_topay_alipay.apiData(data)
	                        } else{
	                        	var html = "";
	                    		html = d.data;
		                    	$("body").append(html)
		                        $("form[name = 'punchout_form' ]").submit();
	                        }
	                    }else{
	                        common.prompt( d.statusStr );
	                    }
	                    pub.rechange.Vue.isMask = false;
	                    pub.loading.hide();
	                },function( d ){
	                    common.prompt( d.statusStr );
	                    pub.loading.hide();
	                    pub.rechange.Vue.isMask = false;
	                })
	            },
	            apiData:function( d ){
	            	 try{
	                	
	                    common.isAndroid() ? android.GoAliPay( common.JSONStr( d ), pub.wxAppPayWay ) : window.webkit.messageHandlers.AliPay.postMessage([common.JSONStr( d ), pub.wxAppPayWay]);
	                    //window.webkit.messageHandlers.AliPay.postMessage([common.JSONStr( d ), pub.wxAppPayWay]);
	                }catch(e){}
	                pub.loading.hide();
	                pub.rechange.Vue.isMask = false;
	            },
	           	alipay_result : function (d){
	           		/*
	           		 方法名 aliPayResult
					参数值1个：成功9000  失败7000  取消8000
	           		 * */
	           		if (d) {
	           			if (d == 9000) {
	           				if (pub.wxAppPayWay == 1) {
			           			//common.jumpLinkPlainApp( "订单管理","html/order_management.html" );
			           			common.jsInteractiveApp({
									name:'goToNextLevel',
									parameter:{
										title:'订单管理',
										url:'html/order_management.html'
									}
								})
			           		} else if (pub.wxAppPayWay == 2) {
			           			//common.jumpLinkPlainApp( "我的预购","html/PreOrder_management.html" );
			           			common.jsInteractiveApp({
									name:'goToNextLevel',
									parameter:{
										title:'我的预购',
										url:'html/PreOrder_management.html'
									}
								})
			           		} else if (pub.wxAppPayWay == 3) {
			           			//window.location.reload();
			           			
			           			if ( pub.isApp ) {
			           				pub.rechange.api.user_month_card.init();
//			           				if (common.isAndroid()) {
//			           					pub.rechange.api.user_month_card.init();
//			           					setTimeout(function(){
//					           				common.goBackCustomApp({
//					                    		title:'',
//					                    		url:'html/my.html',
//					                    		callBackName:'pub.apiHandle.userScoCouMon.init()'
//						                    });
//					           			},800)
//			           				}else{
//			           					window.location.reload();
//			           				}
			           			}
			           		}
	           			} else if (d == 7000 ) {
	           				common.prompt("支付失败，请重新支付");
	           			} else if (d == 8000) {
	           				common.prompt("取消支付");
	           			} else {
	           				console.log("app端传回的参数为"+d)
	           			}
	           		}else{
	           			console.log("app端传回的参数为"+d)
	           		}
	           		pub.rechange.Vue.isMask = false;
	           	}
	        },
	        // 微信
	        goto_pay_weixin : {
	            init : function(){
	                var tempSource = "payMoney" + pub.payMoney + "-userId" + pub.userId;
	                pub.weixinPayApi = {
	                    'base' : { 
	                        method : 'goto_pay_weixin', 
	                        url : common.API,
	                        orderCode : pub.orderCode ,
	                        source : pub.source,
	                        sign : pub.sign
	                    },
	                    'pre' : { 
	                        method : 'pre_order_wx_pay', 
	                        url : common.API,
	                        orderCode : pub.orderCode,
	                        source : pub.source,
	                        sign : pub.sign
	                    },
	                    'recharge' : {  
	                        method : 'month_card_wx_pay',
	                        url : common.API, 
	                        userId : pub.userId, 
	                        rechargeId : pub.rechargeId,
	                        payMoney : pub.payMoney,
	                        source : tempSource,
	                        sign : common.encrypt.md5( tempSource + "key" + common.secretKeyfn() ).toUpperCase(),
	                    }
	                }[ pub.seachParam ];
	
	                common.ajaxPost( $.extend(pub.weixinPayApi,{
	                    tokenId : pub.tokenId,
	                    openId : pub.openId
	                }),function( d ){
	                    pub.rechange.goto_pay_weixin.apiData( d );
	                },function( d ){
	                    pub.rechange.Vue.isMask = false;
	                    alert("支付插件升级中。。。");
	                })
	            },
	            apiData : function( d ){
	
	                if( d.statusCode == '100000' ){
	                    //调用微信支付JSAPI
	                    var 
	                    result = d.data,
	                    prepayId = result.prepayId,
	                    nonceStr = result.nonceStr,
	                    timeStamp = result.timeStamp,
	                    packages = result.package, //"prepay_id="+prepayId,
	                    paySign = result.paySign,
	                    appId = result.appId,
	                    signType = result.signType,
	                    configSign = result.configSign,
	                    timestamp = result.timestamp,
	                    noncestr = result.noncestr;
	                    wx.config({
	                        debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
	                        appId: appId, // 必填，公众号的唯一标识
	                        timestamp:timestamp, // 必填，生成签名的时间戳
	                        nonceStr: noncestr, // 必填，生成签名的随机串
	                        signature: configSign,// 必填，签名，见附录1
	                        jsApiList: ["chooseWXPay"] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
	                    });
	                    wx.ready(function(){
	                        wx.chooseWXPay({
	                            timestamp: timeStamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
	                            nonceStr: nonceStr, // 支付签名随机串，不长于 32 位
	                            package: packages, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=***）
	                            signType: signType, // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
	                            paySign: paySign, // 支付签名
	                            success: function ( res ) {
	                                var urlStr = { 'base' : 'order_management.html', 'pre' : 'PreOrder_management', 'recharge' : 'month_recharge.html?search=recharge'}[ pub.seachParam ];
	                                common.jumpLinkPlain( urlStr );
	                            }
	                        });
	                    });
	                }else{
	                    common.prompt( d.statusStr );
	                }
	                pub.rechange.Vue.isMask = false;
	            }
	        },
	        // 微信 app 支付
	        wx_pay_app : {
	
	            init : function(){
	                pub.wx_pay_appApi = {
	                    'base' : {
	                        method : "goto_pay_weixin_app",
	                        orderCode : pub.orderCode
	                    },
	                    'pre' : {
	                        method : "pre_order_wx_pay_app",
	                        orderCode : pub.orderCode,
	                    },
	                    'recharge' : {
	                        method : "month_card_wx_pay_app",
	                        payMoney : pub.payMoney,
	                        rechargeId : pub.rechargeId,
	                        userId : pub.userId,
	                    },
	                    'rechargeApp' : {
	                        method : "month_card_wx_pay_app",
	                        rechargeId : pub.rechargeId,
	                        payMoney : pub.payMoney,
	                        userId : pub.userId,
	                    }
	                }[ pub.seachParam ];
	                // app 传参
	                pub.wxAppPayWay = pub.isRecharge ? '3' : pub.isBase ? '1' : pub.isPre ? '2' : undefined; // 3充值，1普通商品支付，2预购商品
	
	                common.ajaxPost($.extend({},pub.userBasicParam,pub.wx_pay_appApi),function( d ){
	                    d.statusCode == "100000" && pub.rechange.wx_pay_app.apiData( d );
	                },function( d ){
	                    alert("支付插件升级中。。。");
	                    pub.rechange.Vue.isMask = false;
	                });
	            },
	            apiData : function( d ){
	                try{
	                    common.isAndroid() ? android.WXPay( common.JSONStr( d ), pub.wxAppPayWay ) : window.webkit.messageHandlers.WXPay.postMessage([common.JSONStr( d ), pub.wxAppPayWay]);
	                }catch(e){}
	                pub.loading.hide();
	                pub.rechange.Vue.isMask = false;
	            },
	            wxpay_result : function(d){
	            	/*
	           		 方法名 aliPayResult
					参数值1个：成功9000  失败7000  取消8000
	           		 * */
	           		if (d) {
	           			if (d == 9000) {
	           				if (pub.wxAppPayWay == 1) {
			           			//common.jumpLinkPlainApp( "订单管理","html/order_management.html" );
			           			common.jsInteractiveApp({
									name:'goToNextLevel',
									parameter:{
										title:'订单管理',
										url:'html/order_management.html'
									}
								})
			           		} else if (pub.wxAppPayWay == 2) {
			           			//common.jumpLinkPlainApp( "我的预购","html/PreOrder_management.html" );
			           			common.jsInteractiveApp({
									name:'goToNextLevel',
									parameter:{
										title:'我的预购',
										url:'html/PreOrder_management.html'
									}
								})
			           		} else if (pub.wxAppPayWay == 3) {
			           			//window.location.reload();
			           			pub.rechange.api.user_month_card.init();
//			           			pub.apiHandle.user_month_card.init();
//			           			setTimeout(function(){
//			           				common.goBackCustomApp({
//			                    		title:'',
//			                    		url:'html/my.html',
//			                    		callBackName:'pub.apiHandle.userScoCouMon.init()'
//				                    });
//			           			},800)
			           			
			           		}
	           			} else if (d == 7000 ) {
	           				common.prompt("支付失败，请重新支付");
	           			} else {
	           				console.log("app端传回的参数为"+d)
	           			}
	           		}else{
	           			console.log("app端传回的参数为"+d)
	           		}
	           		pub.rechange.Vue.isMask = false;
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
		pub.rechange.eventHandle={
			init:function(){
				var rechargeType = $(".recharge_nav li"),
					rechargeBox = $(".recharge_box .recharge_box_item")
				/*$(".recharge_nav li").on("click",function(){
					var isActive = $(this).is(".active"),
						index = $(this).index();
					if (!isActive) {
						$(this).addClass("active").siblings().removeClass("active");
						rechargeBox.eq(index).addClass("active").siblings().removeClass("active");
					}
					
				})*/
			}
		}
	
	
		/*
		 充值方式数据结构
		 * */
		pub.rechargeMethods = {
			type:'5',//当前选择的支付方式
			list:[
				{
					name:"充值卡充值",
					type:'5',
					isShow:true,
					childreds:[
						{
							name:'卡号',
							msg:"请输入卡号"
						},{
							name:'兑换码',
							msg:'请输入兑换码'
						}
					]
				},
				{
					name:"微信充值",
					type:'1',
					isShow:false,
					childreds:[
						{
							name:'充值金额',
							msg:"请输入充值金额"
						}
					]
				},{
					name:"支付宝充值",
					type:'2',
					isShow:false,
					childreds:[
						{
							name:'充值金额',
							msg:"请输入充值金额"
						}
					]
				},{
					name:"银行卡充值",
					type:'3',
					isShow:false,
					childreds:[
						{
							name:'充值金额',
							msg:"请输入充值金额"
						},{
							name:'银行卡号',
							msg:'请输入银行卡号'
						}
					]
				},
			]
			
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
	
	        var nodeBox = $('#pay-way-box');
	
	        if( pub.isWinXin || pub.isApp ){
	            nodeBox.children('[pay-way="2"]').show();
	            pub.isWinXin && nodeBox.children('[pay-way="4"]').hide();// 微信环境隐藏支付宝
	            if( pub.isRecharge ){
	            	nodeBox.children('[pay-way="5"]').addClass('bg_select');
	                pub.isApp && nodeBox.find('[pay-way="4"]').removeClass('bg_select').find('.content-box').hide();
	                pub.PAY_WAY = "5";
	                /*nodeBox.children('[pay-way="2"]').addClass('bg_select');
	                pub.isApp && nodeBox.find('[pay-way="4"]').removeClass('bg_select').find('.content-box').hide();
	                pub.PAY_WAY = "2";*/
	            }
	        }else{ // 非微信 非app
	            nodeBox.children('[pay-way="2"]').hide();
	            if( pub.isRecharge ) {
	            	nodeBox.children('[pay-way="5"]').addClass('bg_select'); 
	                pub.PAY_WAY = "5";
	                /*nodeBox.children('[pay-way="4"]').addClass('bg_select');
	                pub.PAY_WAY = "4";*/
	            }
	        }
	
	        pub.logined && common.orderCode.getKey() && pub.apiHandle.init();
	        pub.eventHandle.init();
	
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
