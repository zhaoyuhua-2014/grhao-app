define(function(require, exports, module){

	require('jquery');
	var common = require('../lib/common');
	require('mdData');
	//var tokenId=common.tokenId();
	var userId=common.user_data().cuserInfoid;
	var source="userId"+userId;
	var sign=md5(source+"key"+common.secretKey()).toUpperCase();
	//底部跳转
	$("#foot .footer_item").on('click',function(){
	    switch ($(this).index()){
		    case 0:	
		    window.location.href="../index.html";
		    break;
		    case 1:	
		    localStorage.setItem("moreType", "3");
		    window.location.href="moregoods.html";
		    break;
		    case 2:				   
 			//window.location.href="my.html";
		    break;
	    }
    });
	$('.main_top_right').on('click',function(){
		window.location.href='message_change.html';
	});
	//跳转到订单管理、预购订单管理、优惠券管理页面
	$('.main_center dl').on("click",function(){
		if(!common.getIslogin()){
			window.location.href='login.html'
		}else{
			switch ($(this).index()){
	            case 0:	
	            window.location.href="order_management.html";
	            break;
	            case 1:
	            window.location.href="PreOrder_management.html";
	            break;
	            case 2:
	            window.location.href="cuopon_management.html";
	            break;			            
            }
		}					
	});
	//跳转到帮助中心等页面
	$('.main_bottom dl').on("click",function(){
		if(!common.getIslogin()){
			window.location.href='login.html'
		}else{
			switch ($(this).index()){
	            case 0:	
	            localStorage.setItem("addType",2);
	            window.location.href="address_management.html";
	            break;
	            case 1:
	            window.location.href="fruitMall.html";
	            break;
	            case 2:
	            window.location.href="month_recharge.html";
	            break;
	            case 3:
	            window.location.href="pwd_change.html";
	            break;
	            case 4:
	            window.location.href="help.html";
	            break;
	            case 5:
	            window.location.href="my_settlement.html";
	            break;
            }
		}					
	});
    //判断是否登录以及不同情况下显示的页面            
	if(!common.getIslogin()){            		
        $('.main_top_right,.exit').css({'display':'none'});	 
        $('.my_nologin').css({'display':'block'});	 
	}else{
		//console.log(common.user_data().faceImg=="");
		
		$(".loginPhoto").attr("src",common.user_data().faceImg !="" ? common.user_data().faceImg+"?"+Math.random() : "../img/icon_touxiang.png")
		$('.my_islogin,.main_top_right,.exit').css({'display':'block'});	    			    			    			    		
		$('.my_name').html(common.user_data().petName);
		//console.log(userId+","+sign+","+source)
        //cuopon(userId,sign,source);
        //get_month_money(common.user_data().cuserInfoid,sign,source);
        //get_fruit_money(common.user_data().cuserInfoid,sign,source);
        get_userScoCouMon(userId,sign,source)
    };
    //点击退出
    function exit(){
		$.ajax({
			url:common.http,
			type:'post',
			dataType:'jsonp',
			data:{
				method:'logout',
				tokenId:common.tokenId()
			},
			success:function(data){
				if (data.statusCode=='100000') {
					//console.log(JSON.stringify(data))
					localStorage.clear();
					location.replace(location.href);
				} else{
					common.prompt(data.statusStr);
				}
			},
			error: function(data){
				common.prompt(data.statusStr);
			}
		});
	};
    $('.exit').on('click',function(){
    	exit();
    });  
    //获取包月卡余额、果币、优惠券数量    
	function get_userScoCouMon(userId,sign,source){
		$.ajax({
			url:common.http,
			type:"post",
	        dataType:"jsonp",
	        data:{
				method:'userScoCouMon',
				userId:userId,
				tokenId:common.tokenId(),
				sign:sign,
				source:source

			},
			success:function(data){
				//console.log(JSON.stringify(data))
				if (data.statusCode="100000") {
					$("#month_card").html("￥"+data.data.userMonthCard.systemMoney);
					$("#fruit_money").html(data.data.userAccountInfo.score+"枚");
					$('.wo_main_coupon').html(data.data.couponCount)
				}else{
					$("#month_card").html("￥0");
					$("#fruit_money").html("0枚");
					$('.wo_main_coupon').html(0)
				}
			},
			error:function(data){
				common.prompt(data.statusStr)
			}
		});
	};
    //点击返回首页
    $(".main_top_left").on("click",function(){
    	window.location.href="../index.html";
    });
    //点击上传头像
    $("#loginPhoto").on('change',function(){
    	$("#cuserId").val(common.user_data().cuserInfoid);
    	$("#tokenId").val(common.tokenId());
    	$("#sign").val(sign);
    	$("#source").val(source);
		var tar = this,
		files = tar.files,
		fNum = files.length,
		URL = window.URL || window.webkitURL;
		//console.log(this)
		if(!files[0])return;
		for(var i=0;i<fNum;i++){
			if(files[i].type.search(/image/)>=0){
				var blob = URL.createObjectURL(files[i]);
				document.getElementsByClassName('loginPhoto')[0].src=blob;
			}
		};
		//console.log(files[0])
		//console.log(files[0].type.substr(6))
		$("#form2").submit();
	});
})