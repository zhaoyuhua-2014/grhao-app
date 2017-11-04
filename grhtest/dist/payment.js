/*
    payment javascript for Zhangshuo Guoranhao
*/

require(['../require/config'],function(){
	require(['common'],function(common){
		
	    // 命名空间
	
	    pub = {};
	
	    pub.logined = common.isLogin(); // 是否登录
	
		pub.appData = JSON.parse(common.appData.getItem());
	
	    pub.seachParam = common.getUrlParam('search') ? common.getUrlParam('search') : 'base'; // 获取url参数
	
	    pub.openId = common.openId.getItem();
	    
	    pub.timer = null;
	 
	    pub.isBase = pub.seachParam == 'base' ; // 基本支付
	    pub.isPre = pub.seachParam == 'pre' ; // 预购支付
	    pub.isRecharge = pub.seachParam == 'recharge' ; // 充值
	
		if (pub.isRecharge && common.isApple()) {
			pub.seachParam = 'rechargeIos'
		}
	
	    pub.isApp = common.isApp(); // 接收 app 环境
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
	        common.jumpLinkPlainApp("登录",'html/index.html'); // 未登录跳到首页
	    }
	
	    pub.orderType = null; // 订单类型 4.尾款订单
	    pub.isCanPay = null; // 1.表示能支付 2.表示不能支付
	    pub.PAY_WAY = "1"; // 支付方式  1. 月卡 2.微信 3.银行卡 4.支付宝支付
	    pub.dtd = $.Deferred(); // 延时对象
	    pub.dtd1 = $.Deferred(); // 余额问题
	    pub.loading = $(".order_refund"); // loading 
	    pub.smsCode = null;
	
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
					pub.firmIdType = d.data.firmInfo ? d.data.firmInfo.type : pub.firmIdType;
					
	                // 订单信息
	                (function(){
	                    if( pub.isBase ){
	                        if( pub.orderType == "1" ) {
	                        	if (pub.firmIdType == '5') {
	                        		node.eq(0).html("订单号:<span>" + orderInfo.orderCode + "</span>")
		                            .next().html("订单金额:<span>￥" + orderInfo.realPayMoney + "</span>");
		                            node.eq(2).css("display","none");
		                            node.eq(3).css("display","none");
	                        	}else{
	                        		node.eq(0).html("订单号:<span>" + orderInfo.orderCode + "</span>")
		                            .next().html("订单金额:<span>￥" + orderInfo.realPayMoney + "</span>")
		                            .next().html("支付成功后可以获得<b>" + orderInfo.barterCount + "</b>次换购机会");
	                        	}
	                        }else if( pub.orderType == "4" ){
	                            node.eq(0).html("预购商品:<span>" + orderInfo.orderDetailsList[0].goodsName + "</span>")
	                            .next().html("订单号:<span>" + orderInfo.orderCode + "</span>")
	                            .next().html("预购尾款金额:<span>￥" + orderInfo.realPayMoney + "</span>");
	                        }else if( pub.orderType == "6" ){
	                            node.eq(0).html("换购商品:<span>" + orderInfo.orderDetailsList[0].goodsName + "</span>")
	                            .next().html("订单号:<span>" + orderInfo.orderCode + "</span>")
	                            .next().html("订单金额:<span>￥" + orderInfo.realPayMoney + "</span>");
	                        }
	                        pub.firmIdType != '5' && node.eq(3).html( '22:30前付款，预计明日送达' );
	                        pub.money = orderInfo.realPayMoney;
	                    }else{
	                        node.eq(0).html("预购商品:<span>" + orderInfo.goodsInfo.goodsName + "</span>").next().html("订单号:<span>" + orderInfo.orderCode + "</span>").next().html("预购金额:<span class='font_color'>￥" + orderInfo.frontMoney + "</span>");
	                    	pub.money = orderInfo.frontMoney;
	                    }
	                    $(".orderList_intro").html("订单已提交！");
	                    pub.firmIdType == '5' && $('.pay_gg').html("请于"+pub.appData.data.order_cancel_time+"分钟内完成支付，超时订单将取消！")
	                   
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
	                    		common.jumpLinkPlainApp( "我的预购","html/PreOrder_management.html" );
	                    	}else{	
	                        	common.jumpLinkPlainApp( "订单管理","html/order_management.html" );
	                    	}
	                    }else if( d.statusCode == "100802" ){
	                        common.prompt( "验证码输入有误!" );
	                    } else{
	                        common.jumpLinkPlainApp( "支付结果","html/pay_result.html" );
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
	                    'rechargeIos' : {
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
	                        if (common.isApple()) {
	                        	var data = {
	                        		orderCode:pub.orderCode || d.data.note,
	                        		productName:'果然好商品',
	                        		money:pub.money || d.data.payMoney,
	                        	};
	                        	pub.apiHandle.order_topay_alipay.apiData(data)
	                        } else{
	                        	var html = "";
		                        $.each( d.data, function( i, v ){
		                            html += '<input type="hidden" name="' + i + '" id="" value="' + v + '" />';
		                        });
		                        $("#form2").append( html ).submit();
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
	                	console.log(JSON.stringify(d))
	                    //common.isAndroid() ? android.WXPay( common.JSONStr( d ), pub.wxAppPayWay ) : window.webkit.messageHandlers.WXPay.postMessage([common.JSONStr( d ), pub.wxAppPayWay]);
	                    window.webkit.messageHandlers.AliPay.postMessage([common.JSONStr( d ), pub.wxAppPayWay]);
	                }catch(e){}
	                pub.loading.hide();
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
	                            common.jumpLinkPlainApp( 'login.html' );
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
	            }
	        }
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
	        console.log(pub.seachParam)
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
	                };
	            });
	            
	            $('#get_verify_code').on('click',function(){ // 获取验证码
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
	            $(".month_pay_deal,.month_record,.pay_style_msg a").on("click",function(){
	            	var url = $(this).attr("data-url"),
					title = $(this).attr("data-title");
					common.jumpLinkPlainApp(title , url);
	            })
	        }
	    };
	
	    // 模块初始化
	    pub.init = function(){
	
	        var nodeBox = $('#pay-way-box');
	
	        if( pub.isWinXin || pub.isApp ){
	            nodeBox.children('[pay-way="2"]').show();
	            pub.isWinXin && nodeBox.children('[pay-way="4"]').hide();// 微信环境隐藏支付宝
	            if( pub.isRecharge ){
	                nodeBox.children('[pay-way="2"]').addClass('bg_select');
	                pub.isApp && nodeBox.find('[pay-way="4"]').removeClass('bg_select').find('.content-box').hide();
	                pub.PAY_WAY = "2";
	            }
	        }else{ // 非微信 非app
	            nodeBox.children('[pay-way="2"]').hide();
	            if( pub.isRecharge ) {
	                nodeBox.children('[pay-way="4"]').addClass('bg_select'); 
	                pub.PAY_WAY = "4";
	            }
	        }
	
	        pub.logined && common.orderCode.getKey() && pub.apiHandle.init();
	        pub.eventHandle.init();
	
	        // 延时执行余额 
	        pub.dtd1.done(function(){
	            pub.apiHandle.user_month_card.init(); 
	        });
	
	        // 充值环境 执行余额
	        pub.isRecharge &&  pub.apiHandle.user_month_card.init();
	    }
	   	
	   	pub.init();
	})
})
