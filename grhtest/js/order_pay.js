$(document).ready(function(){
	//支付方式1.表示月卡2.表示微信3.表示银行卡4.表示支付宝支付
	var pay_style='';
	//表示月卡余额是否足以支付本次订单1.表示可以支付0.表示不能支付
	var isCanPay="";
	//验证码用于验证验证码是否正确
	var verify_code="";
	//银行卡号
	var bankCard="";
	//订单编号
	var orderCode="";
	//微信支付验证
	var openId="";
	//订单类型
	var orderType='';
	var smsCode,mobile,sign,source;
	mobile=common.user_data().mobile;
	
	if (sessionStorage.orderCode) {
		orderCode=sessionStorage.orderCode;
		source='orderCode'+orderCode;
		sign=md5(source+"key"+common.secretKey()).toUpperCase();
		getOrderInfo(orderCode,sign,source);
	};
	//获取微信环境信息
	function get_weixin_code(){
		if (sessionStorage.weixin) {
			return JSON.parse(sessionStorage.weixin);
		} else{
			return 0;
		}
	};
	//给据订单编号获取订单详情
    function getOrderInfo(orderCode,sign,source){
    	////console.log(orderCode);
    	$.ajax({
			url:common.http,
	        type:"post",
	        dataType:"jsonp",
	        data:{
				method:'order_details',
				orderCode:orderCode,
				tokenId:common.tokenId(),
				sign:sign,
				source:source
			},
			success:function(data){
				//console.log(JSON.stringify(data));
				if (data.statusCode=="100000") {
					orderType=data.data.orderInfo.activityType;
					isCanPay=data.data.orderInfo.isCanPay;
					orderPayShow(data.data);
				}
			},
			error:function(data){
				common.prompt(str);
			}
		});
    };
    function orderPayShow(data){
    	//头部信息展示
    	headerShow(data);
		////console.log(JSON.stringify(data));    	
		if (data.orderInfo.payMethod=="6") {
			if (get_weixin_code().fromWX=='1') {
				openId=get_weixin_code().openId;
				$(".pay_style_line").show();
				pay_style="2";
				$('.pay_style_line .pay_style_item').eq(0).addClass("bg_select");
				$('.pay_style_line .pay_style_item').eq(1).hide();
				$(".pay_style_month").hide();
			}else{
				$('.pay_style_line .pay_style_item').eq(0).hide();
				$('.pay_style_line .pay_style_item').eq(1).show().addClass("bg_select");
				$(".pay_style_line").show();
				pay_style="4";
			}
			$('.go_pay').css("background","#fe7831").show();
		}else if(data.orderInfo.payMethod=="5" || data.orderInfo.payMethod=="0"){
    		$(".pay_style_line").hide();
			$(".pay_style_month").show();
			pay_style="1";
			$(".pay_style_month .pay_style_item").addClass("bg_select");
			if (isCanPay) {
				$('.pay_style_msg1').show();
				$('.go_pay').css("background","#fe7831").show();
			}else{
				$('.pay_style_msg').show();
				$('.go_pay').css("background","#b2b2b2").show().off("click");
			}
    	}
   };
     //头部信息展示
    function headerShow(data){
    	//console.log("1");
    	//console.log(orderType)
    	if (orderType=="1") {
    		$(".orderList_intro").html("订单已提交！");
	    	$(".orderList_details ul li").eq(0).html("订单编号:<span>"+data.orderInfo.orderCode+"</span>");
	    	$(".orderList_details ul li").eq(1).html("订单金额:<span>￥"+data.orderInfo.realPayMoney+"</span>");
	    	$(".orderList_details ul li").eq(2).html("支付成功后可以获得<b>"+data.orderInfo.killCount+"</b>次秒杀机会");
    	} else if (orderType=="3") {
    		$(".orderList_intro").html("订单已提交！");
	    	$(".orderList_details ul li").eq(0).html("秒杀商品:<span>"+data.orderInfo.orderDetailsList[0].goodsName+"</span>");
	    	$(".orderList_details ul li").eq(1).html("订单号:<span>"+data.orderInfo.orderCode+"</span>");
	    	$(".orderList_details ul li").eq(2).html("订单金额:<span>￥"+data.orderInfo.realPayMoney+"</span>");
    	} else if (orderType=="4") {
    		$(".orderList_intro").html("订单已提交！");
	    	$(".orderList_details ul li").eq(0).html("预购商品:<span>"+data.orderInfo.orderDetailsList[0].goodsName+"</span>");
	    	$(".orderList_details ul li").eq(1).html("订单号:<span>"+data.orderInfo.orderCode+"</span>");
	    	$(".orderList_details ul li").eq(2).html("预购尾款金额:<span>￥"+data.orderInfo.realPayMoney+"</span>");
    	}
    	
    };
    //点击选择支付方式
    $(".pay_style_line .pay_style_item").on("click",function(){
    	$(this).addClass("bg_select").siblings().removeClass("bg_select");
    	//console.log($(this).index())
    	if($(this).find("p").html()=="微信支付"){
    		pay_style="2";
    		$(".pay_style_input").hide();
    		//console.log("微信")
    	} else if($(this).find("p").html()=="银行卡支付"){
    		pay_style="3";
    		$(".pay_style_input").show();
    		//console.log("银行卡")
    	} else if($(this).find("p").html()=="支付宝支付"){
    		pay_style="4";
    		$(".pay_style_input").hide();
    	}
    });
    //点击返回
    $(".header_left").on("click",function(){
    	if (localStorage.orderBack=="2") {
    		localStorage.setItem("orderBack",'');
    		window.location.href="PreOrder_management.html";
    	} else if (localStorage.orderBack=="1") {
    		localStorage.setItem("orderBack",'');
    		window.location.href="order_management.html";
    	}else{
    		window.location.href="order_management.html";
    	}
    });
    //点击支付
    $(".go_pay").on("click",function(){
    	//console.log(pay_style)
    	if (pay_style=="1") {
    		smsCode=$("#verify_code1").val();
    		if (smsCode=="") {
    			common.prompt("请输入验证码");
    		} else{
    			true_pay_month(orderCode,smsCode,mobile,sign,source);
    		}
    	} else if (pay_style=="2") {
    		//console.log("调用微信支付")
    		ture_pay_weixin(orderCode,openId,sign,source);
    	} else if (pay_style=="3") {
    		//console.log($("#pay_style_card").val())
    		bankCard=$("#pay_style_card").val();
    		if (bankCard=="") {
    			common.prompt("请输入银行卡号");
    		}else{
    			//console.log("调用银行卡支付|连连支付");
    			//console.log(orderCode)
    			ture_pay_yinghangka(orderCode,bankCard,sign,source);
    		}
    	}else if(pay_style=="4") {
    		true_pay_zfb(orderCode,sign,source);
    	}
    });
    /*银行卡支付*/
	function ture_pay_yinghangka(orderCode,bankCard,sign,source){
		$.ajax({
			url:common.http,
			type:"post",
	        dataType:"jsonp",
	        data:{
				method:'order_topay_llpay',
				orderCode:orderCode,
				bankCard:bankCard,
				tokenId:common.tokenId(),
				sign:sign,
				source:source
			},
			success:function(data){
				//console.log(JSON.stringify(data))
				if (data.statusCode=='100000') {
					////console.log(JSON.stringify(data.data))
					var str=JSON.stringify(data.data);
					$('#input1').attr('value',str);
					$('#form1').submit()
				}else{
					common.prompt(data.statusStr);
				}
			},
			error:function(data){
				common.prompt(data.statusStr)
			}
		});
	};
	/*微信支付*/
	function ture_pay_weixin(orderCode,openId,sign,source){
		$.ajax({
			url:common.http,
			type:"post",
	        dataType:"jsonp",
	        data:{
	        	method:"goto_pay_weixin",
				orderCode:orderCode,
				url:common.http,
				openId:openId,
				tokenId:common.tokenId(),
				sign:sign,
				source:source
			}, 
			success:function(data){
				if(data.statusCode == '100200'){
					alert("微信提交订单异常，请重新操作!");
				}else if(data.statusCode == '100000'){
					//获取PrepayId
					//调用微信支付JSAPI
					var result = data.data;
					var prepayId = result.prepayId;
					var nonceStr = result.nonceStr;
					var timeStamp = result.timeStamp;
					var packages = result.package;//"prepay_id="+prepayId;
					var paySign = result.paySign;
					var appId = result.appId;
					var signType = result.signType;
					var configSign = result.configSign;
					var timestamp = result.timestamp;
					var noncestr = result.noncestr;						
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
				    	    success: function (res) {
				    	        //支付成功后的回调函数
								window.location.href='order_management.html';
				    	    }
				    	})
				    });
				};
			},
			error:function(data){
				alert("支付插件升级中。。。");
			}
		});
	};
	//月卡支付
	function true_pay_month(orderCode,smsCode,mobile,sign,source){
		$.ajax({
			url:common.http,
	        type:"post",
	        dataType:"jsonp",
	        data:{
				method:'order_topay_month_pay',
				orderCode:orderCode,
				smsCode:smsCode,
				mobile:mobile,
				tokenId:common.tokenId(),
				sign:sign,
				source:source
			},
			success:function(data){
				//console.log(JSON.stringify(data))
				if (data.statusCode=="100000") {
					sessionStorage.setItem("result","1");
					window.location.href="pay_result.html";
				}else if(data.statusCode=="100802"){
					common.prompt("验证码输入有误!")
				} else{
					sessionStorage.setItem("result","0")
					window.location.href="pay_result.html";
				}
			},
			error:function(data){
				common.prompt(data.statusStr)
			}
		});
	};
	//支付宝支付
	function true_pay_zfb(orderCode,sign,source){
		$.ajax({
			url:common.http,
			type:"post",
	        dataType:"jsonp",
	        data:{
				method:'order_topay_alipay',
				orderCode:orderCode,
				tokenId:common.tokenId(),
				sign:sign,
				source:source
			},
			success:function(data){
				//console.log(JSON.stringify(data))
				if (data.statusCode=='100000') {
					//console.log(JSON.stringify(data.data));
					var str=data.data;
					var html="";
					for (var i in str) {
						html +='<input type="hidden" name="'+i+'" id="" value="'+str[i]+'" />'
					}
					$("#form2").append(html);
					$("#form2").submit();
				}else{
					common.prompt(data.statusStr);
				}
			},
			error:function(data){
				common.prompt(data.statusStr)
			}
		});
	};
	//点击获取验证码
	$('#get_verify_code').on('click',function(){
		var mobile=common.user_data().mobile;
		i=59;
		$("#verify_code1").removeAttr("disabled");
		$("#get_verify_code").css("display",'none');
		$("#time").css("display","block");
		$("#time").html('(60s后重试)');
		login_verify_code(mobile);
		verify_code_time()
	});
	//获取验证码			
	function login_verify_code(mobile){
		$.ajax({
			url:common.http,
	        type:"post",
	        dataType:"jsonp",
	        data:{
				method:'send_sms',
				mobile:mobile,
				type:'3'
			},
			success:function(data){
				//console.log(JSON.stringify(data))
				verify_code=data.data;
			},
			error:function(data){
				common.prompt(data.statusStr)
			}
		});
	};
	//验证码倒计时
	function verify_code_time(){
		var id=setInterval(function(){
			if (i==0) {
				$("#time").css("display","none");
				$("#get_verify_code").css("display","block");
				$("#get_verify_code").html('重新获取');
				clearInterval(id);
			}else{
				$("#time").html("("+i+"s后可重试)");
				$("#time").css({"color":"#f76a10","background":"none"});
			}
			i--;
		},1000)
	};
})
	