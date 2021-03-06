/*
    payment javascript for Zhangshuo Guoranhao
*/
define(function(require, exports, module){

    var common = require('lib/common.js?v=20000');
    var wx = require('weixinSDK');
    
    // 命名空间

    pub = {};

    pub.logined = common.isLogin(); // 是否登录

    !pub.logined && common.jumpLinkPlain( '../index.html'); // 未登录跳转页面

    pub.weixinCode = common.getUrlParam( 'code' ); // 获取微信 code

    pub.isWinXin = common.isWeiXin(); // 判断微信环境

    pub.seachParam = common.getUrlParam('search') ? common.getUrlParam('search') : 'base'; // 获取url参数

    pub.openId = common.openId.getItem();

    pub.domain = 'http://wxapp.grhao.com';
    
    pub.timer = null;
 
    pub.isBase = pub.seachParam == 'base' ; // 基本支付
    pub.isPre = pub.seachParam == 'pre' ; // 预购支付
    pub.isRecharge = pub.seachParam == 'recharge' ; // 充值

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
        common.jumpLinkPlain('../index.html'); // 未登录跳到首页
    }

    pub.orderType = null; // 订单类型 4.尾款订单
    pub.isCanPay = null; // 1.表示能支付 2.表示不能支付
    pub.PAY_WAY = "1"; // 支付方式  1. 月卡 2.微信 3.银行卡 4.支付宝支付
    pub.dtd = $.Deferred(); // 延时对象
    pub.dtd1 = $.Deferred(); // 余额问题
    pub.loading = $(".order_refund"); // loading 
    pub.smsCode = null;

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

                // 订单信息
                (function(){
                    if( pub.isBase ){
                        if( pub.orderType == "1" ) {
                            node.eq(0).html("订单号:<span>" + orderInfo.orderCode + "</span>")
                            .next().html("订单金额:<span>￥" + orderInfo.realPayMoney + "</span>")
                            .next().html("支付成功后可以获得<b>" + orderInfo.barterCount + "</b>次换购机会");
                        }else if( pub.orderType == "4" ){
                            node.eq(0).html("预购商品:<span>" + orderInfo.orderDetailsList[0].goodsName + "</span>")
                            .next().html("订单号:<span>" + orderInfo.orderCode + "</span>")
                            .next().html("预购尾款金额:<span>￥" + orderInfo.realPayMoney + "</span>");
                        }else if( pub.orderType == "6" ){
                            node.eq(0).html("换购商品:<span>" + orderInfo.orderDetailsList[0].goodsName + "</span>")
                            .next().html("订单号:<span>" + orderInfo.orderCode + "</span>")
                            .next().html("订单金额:<span>￥" + orderInfo.realPayMoney + "</span>");
                        }
                        node.eq(3).html( '22:30前付款，预计明日送达' );
                    }else{
                        node.eq(0).html("预购商品:<span>" + orderInfo.goodsInfo.goodsName + "</span>").next().html("订单号:<span>" + orderInfo.orderCode + "</span>").next().html("预购金额:<span class='font_color'>￥" + orderInfo.frontMoney + "</span>");
                    }
                    $(".orderList_intro").html("订单已提交！");
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
                        payMoney : pub.payMoney,
                        source : tempSource,
                        sign : md5( tempSource + "key" + common.secretKeyfn() ).toUpperCase(),
                    }
                }[ pub.seachParam ];

                common.ajaxPost( $.extend(pub.weixinPayApi,{
                    tokenId : pub.tokenId,
                    openId : pub.openId
                }),function( d ){
                    pub.apiHandle.goto_pay_weixin.apiData( d );
                },function( d ){
                    pub.loading.hide();
                    alert("支付插件升级中。。。");
                })
            },
            apiData : function( d ){
                
                if( d.statusCode == '100200' ){
                    alert("微信提交订单异常，请重新操作!");
                }else if( d.statusCode == '100000' ){
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
                                //支付成功后的回调函数
                                pub.isBase && common.jumpLinkPlainApp( "订单管理",'html/order_management.html' );
                                pub.isRecharge && common.jumpLinkPlainApp( "月卡充值",'html/month_recharge.html?search=recharge' );
                                pub.isPre && common.jumpLinkPlainApp( "预购管理",'html/PreOrder_management.html' );
                            },
                            cancel:function(res){  
          						console.log("取消了微信支付！")
    						}
                        });
                    });
                }
                pub.loading.hide();
            }
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
                    }
                }[ pub.seachParam ];

                pub.isApp && ( pub.aliPayApi.isApp = '1' );
                common.ajaxPost($.extend( {},pub.userBasicParam, pub.aliPayApi ),function( d ){
                    if ( d.statusCode == '100000' ) {
                        var html = "";
                        $.each( d.data, function( i, v ){
                            html += '<input type="hidden" name="' + i + '" id="" value="' + v + '" />';
                        });
                        $("#form2").append( html ).submit();
                    }else{
                        common.prompt( d.statusStr );
                    }
                    pub.loading.hide();
                },function( d ){
                    common.prompt( d.statusStr );
                    pub.loading.hide();
                })
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
            init : function(){
                common.ajaxPost({
                    method: 'get_weixin_code',
                    weixinCode : pub.weixinCode
                },function( d ){
                    if( d.statusCode == '100000' && d.data.fromWX == 1 ){
                        pub.openId =  d.data.openId;
                        common.openId.setItem( pub.openId ); // 存opendId
                        pub.dtd.resolve();
                    }else{
                        common.prompt( d.statusStr );
                    }
                });
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
        // 充值
        if( pub.isRecharge ){
            pub.payMoney = $('#wx_rechange').val();
            if( isNaN( pub.payMoney ) || pub.payMoney < 0.01 ){
                common.prompt( "充值金额只能为数字且不小于0.01" ); return;
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
        pub.apiHandle.goto_pay_weixin.init();
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
        pub.pathName = {
            'base' : '/html/order_pay.html?search=base',
            'pre' : '/html/order_pay.html?search=pre',
            'recharge' : '/html/month_recharge.html?search=recharge'
        }[ pub.seachParam ];
        
        if( !common.openId.getKey() ){
            if( pub.weixinCode ){
                pub.apiHandle.get_weixin_code.init(); // code存在请求获取opendId
            }else{
                common.jumpLinkPlain('https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxf9dd00234aa6e921&redirect_uri=' + pub.domain + pub.pathName + '&response_type=code&scope=snsapi_userinfo&state=grhao&connect_redirect=1#wechat_redirect');
            }
            pub.dtd.done(function(){
                pub.openId = common.openId.getItem();
                pub.payWay.weixinPayTemp();
            });
        }else{
            pub.payWay.weixinPayTemp();
        }
    };
    // 微信支付 app 端
    pub.payWay.weixinAppPay = function(){
         // 充值
        if( pub.isRecharge ){
            pub.payMoney = $('#wx_rechange').val();
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

    // 事件处理
    pub.eventHandle = {
        init : function(){
            // 点击回退跳转
            common.jumpLinkSpecial(".header_left",function(){
                if( !pub.isRecharge ){
                    if( common.orderBack.getItem() == "2" ){
                        common.jumpLinkPlain( "PreOrder_management.html" );
                    }else{
                        common.jumpLinkPlain( "order_management.html" );
                    }
                    common.orderBack.removeItem();
                }else{
                    common.jumpLinkPlain( "my.html" );
                }
            });
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
            $(".pay_style_msg a").on("click",function(){
            	var tit = $(this).attr("data-title"),
            		url = $(this).attr("data-url");
            	common.jumpLinkPlainApp(tit,url)
            })
            $('#get_verify_code').on('click',function(){ // 获取验证码
                var 
                timeNode = $("#time"),
                $this = $(this),
                i = 59,
                timerId;
                $("#verify_code1").removeAttr( "disabled" );
                $this.css("display",'none').next().css("display","block").html( '(60s后重试)' );
                pub.apiHandle.send_sms2.init();
                timerId = setInterval(function(){
                    if ( i == 0 ) {
                        $this.css("display","block").html('重新获取').next().css("display","none");
                        clearInterval( timerId );
                        i = 59;
                    }else{
                        timeNode.html( "(" + ( i-- ) + "s后可重试)" ).css({"color":"#f76a10","background":"none"});
                    }
                },1000);
            });
            $(".month_pay_deal,.month_record").on("click",function(){
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
   

    module.exports = pub;
});