$(document).ready(function(){
	//本地存储的orderCode
	var orderCode=sessionStorage.getItem("orderCode");
	//console.log(orderCode)
	var source="orderCode"+orderCode;
	var sign=md5(source+"key"+common.secretKey()).toUpperCase();
	if (sessionStorage.getItem("orderCode").substring(8,10)=="07") {
		preOrderDetail('pre_order_details',orderCode,sign,source);
	} else{
		preOrderDetail('order_details',orderCode,sign,source);	
	};  
	//预购订单详情
    function preOrderDetail(preMethod,orderCode,sign,source){
    	$.ajax({
    		url:common.http,
    		dataType:'jsonp',
    		data:{
    			method:preMethod,
    			orderCode:orderCode,
    			tokenId:common.tokenId(),
    			sign:sign,
    			source:source
    		},
    		success:function(data){
    			//console.log(JSON.stringify(data))
    			if (data.statusCode=="100000") {
    				if(orderCode.substring(8,10)=="07"){
    					preOrder_show(data);
    				}else{
    					order_show(data);
    				}
    			}else{
    				common.prompt(data.strStatus);
    			}
    		},
    		error:function(data){
    			common.prompt(data.strStatus);
    		}
    	});
    };   
	//支付结果显示
	function order_show(data){
		if (data.data.orderInfo.orderStatus=="3") {
			$(".result_status").html("订单支付成功！").addClass("result_bg");
			$(".result_goto").html("查看订单").css("background","#93c01d").on("click",function(){
	    		window.location.href="orderDetails.html";
	    	})
		} else{
			$(".result_status").html("订单支付失败！").addClass("result_bg2");
			$(".result_goto").html("返回重新支付").css("background","#fe7831").on("click",function(){
	    		window.history.back();
	    	})
		}
    	$(".result_detail ul li").eq(0).html("订单号:"+data.data.orderInfo.orderCode);
    	$(".result_detail ul li").eq(1).html("实付款:<span class='font_color'>￥"+data.data.orderInfo.realPayMoney+"</span>");
    	$(".result_message").show();
	};
	function preOrder_show(data){
		if (data.data.payStatus=="2") {
			$(".result_status").html("订单支付成功！").addClass("result_bg");
			$(".result_goto").html("查看订单").css("background","#93c01d").on("click",function(){
	    		window.location.href="preOrderDetail.html";
	    	})
		} else{
			$(".result_status").html("订单支付失败！").addClass("result_bg2");
			$(".result_goto").html("返回重新支付").css("background","#fe7831").on("click",function(){
	    		window.history.back();
	    	})
		}
    	$(".result_detail ul li").eq(0).html("订单号:"+data.data.orderCode);
    	$(".result_detail ul li").eq(1).html("实付款:<span class='font_color'>￥"+data.data.frontMoney+"</span>");
    	$(".result_message").show();
	} ; 
    $(".header_left").on("click",function(){
    	if(orderCode.substring(8,10)=="07"){
			window.location.href="PreOrder_management.html";
		}else{
			window.location.href="order_management.html";
		}
    });
})
