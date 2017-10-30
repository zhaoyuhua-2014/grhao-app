 define(function(require, exports, module){

    require('jquery');
    var common = require('../lib/common');
    require('mdData'); 
    require('LArea');
    require('weixin');
	var userId=common.user_data().cuserInfoid;
	var source="userId"+userId;
	var sign=md5(source+"key"+common.secretKey()).toUpperCase();
	//console.log(source+","+sign)
	var tokenId=common.tokenId();
	//支付方式 0.表示微信支付 1.表示连连支付
	var pay_style="0";
	//充值金额正则
	var moneyReg=/^[1-9]\d*$/;
	//银行卡号正则
	var cardReg=common.bankCardReg;
	//payMoney 表示充值的金额  bankCard表示充值的银行卡号
	var payMoney,bankCard;
	//微信支付验证
	var openId="";
	//获取微信环境信息
	function get_weixin_code(){
		if (sessionStorage.weixin) {
			return JSON.parse(sessionStorage.weixin)
		} else{
			return 0;
		}
	};
	if (get_weixin_code().fromWX=='1') {
		openId=get_weixin_code().openId;
		$(".month_card_recharge_item").show();
		//默认选中的支付方式
    	$(".month_card_recharge_item").eq(0).find(".month_card_recharge_item_tit").css("background","url(../img/bg_num_a.png) no-repeat right center");
    	$(".month_card_recharge_item").eq(0).find("dl").show();
    	$(".month_card_recharge_item").eq(1).hide();
    	pay_style="0";
	}else{
		$(".month_card_recharge_item").eq(1).show().find(".month_card_recharge_item_tit").css("background","url(../img/bg_num_a.png) no-repeat right center");
		$(".month_card_recharge_item").eq(1).find("dl").show();
		$(".month_card_recharge_item").eq(2).show();
		pay_style="1";
	};	
	$(".month_card_recharge_item").on("click",function(){		
		pay_style=$(this).index();
		$(this).siblings().find("dl").hide();
		$(this).siblings().find(".month_card_recharge_item_tit").css("background","url(../img/bg_num_b.png) no-repeat right center");
		$(this).find("dl").show();
		$(this).find(".month_card_recharge_item_tit").css("background","url(../img/bg_num_a.png) no-repeat right center");
	})
	//获取用户当前余额
	function get_month_money(userId,sign,source){
		$.ajax({
			url:common.http,
			type:"post",
	        dataType:"jsonp",
	        data:{
				method:'user_month_card',
				userId:userId,
				tokenId:common.tokenId(),
				sign:sign,
				source:source
			},
			success:function(data){
				//console.log(JSON.stringify(data))
				if (data.statusCode="100000") {
					if (data.data) {
						$(".month_sign2").html(data.data.systemMoney);
					}else{
						$(".month_sign2").html("0");
					}
				}else{
					
				}
			},
			error:function(data){
				common.prompt(data.statusStr)
			}
		});
	};
	get_month_money(userId,sign,source);
	//点击立即充值
	$(".rechange_now").on("click",function(){	    		
		//console.log("dianjishijan")	    		
		//微信充值
		if (pay_style=="0") {
			payMoney=$('#wx_rechange').val();
			payMoney=Number(payMoney);
			//console.log(!Number.isNaN(payMoney))
			//console.log(typeof payMoney)
			if (payMoney=="") {
				common.prompt("请输入充值金额");
				//console.log(!Number.isNaN(payMoney))
			} else if( !Number.isNaN(payMoney) && payMoney > 0){
				wx_rechange(payMoney,openId,userId,sign,source);
			}else{
				common.prompt("充值金额只能为数字且大于0");
			}
		
		} else if (pay_style=="1") {
			//支付宝支付
			payMoney=$('#zfb_rechange').val();
			payMoney=Number(payMoney);
			//console.log(!Number.isNaN(payMoney))
			//console.log(typeof payMoney)
			if (payMoney=="") {
				common.prompt("请输入充值金额");
				//console.log(!Number.isNaN(payMoney))
			} else if( !Number.isNaN(payMoney) && payMoney > 0){
				source="payMoney"+payMoney+"-userId"+userId;
				sign=md5(source+"key"+common.secretKey()).toUpperCase();
				//console.log(source+","+sign)
				zfb_rechange(payMoney,userId,sign,source);
			}else{
				common.prompt("充值金额只能为数字且大于0");
			}
		} else if (pay_style=="2") {
			//连连充值
			payMoney=$('#quick_rechange').val();
			payMoney=Number(payMoney);
			bankCard=$("#quick_idCard").val();
			//console.log(!Number.isNaN(payMoney))
			if (payMoney=="") {
				common.prompt("请输入充值金额");
			} else if(Number.isNaN(payMoney) || payMoney <= 0){
				common.prompt("充值金额只能为数字且大于0");
			}else if(!cardReg.test(bankCard)){
				common.prompt("卡号输入有误");
			}else{
				//console.log(payMoney+","+bankCard+","+userId)
				yhk_rechange(payMoney,bankCard,userId,sign,source);
			}
		}
	});
	//微信充值
	function wx_rechange(payMoney,openId,userId,sign,source){
	    $.ajax({
			url:common.http,
			type:"post",
	        dataType:"jsonp",
	        data:{
	        	method:"month_card_wx_pay",
	        	payMoney:payMoney,
				url:common.http,
				openId:openId,
				userId:userId,
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
								window.location.href='month_recharge.html';
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
	//支付宝充值
	function zfb_rechange(payMoney,userId,sign,source){
		//console.log(payMoney+","+userId)
		$.ajax({
			url:common.http,
			type:"post",
	        dataType:"jsonp",
	        data:{
				method:'month_card_ali_pay',
				payMoney:payMoney,
				userId:userId,
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
	//银行卡充值
	function yhk_rechange(payMoney,bankCard,userId,sign,source){
		$.ajax({
		    url:common.http,
		    dataType:'jsonp',
		    data:{
			    method:'month_card_ll_pay',
			    payMoney:payMoney,
			    bankCard:bankCard,
			    userId:userId,
			    tokenId:common.tokenId(),
			    sign:sign,
			    source:source
		    },
		    success:function(data){
			    //console.log(JSON.stringify(data))
			    if (data.statusCode=="100000") {
			    	var str=JSON.stringify(data.data);
					$('#input1').attr('value',str);
					$('#form1').submit()
			    }
		    },
	    	error:function(data){
			    //console.log(data.statusStr)
		    }
	   });
	};
	//点击跳转包月服务说明页面
	$('.month_pay_deal').on('click',function(){
		window.location.href='month_service.html'
	});
	$('.header_left').on('click',function(){
		window.location.href='my.html'
	});
})