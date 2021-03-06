define(function(require, exports, module){
	
	require('jquery');
	var common = require('../lib/common');
	require('mdData');
	require('sha1');
	var phone=common.user_data().mobile;
	/*var petName=JSON.parse(localStorage.getItem('change_style')).petName;
	var realName=JSON.parse(localStorage.getItem('change_style')).realName;
	var sex=JSON.parse(localStorage.getItem('change_style')).sex;
	var idCard=JSON.parse(localStorage.getItem('change_style')).idCard;
	var firmId=common.user_data().firmId;*/
	var phoneInner;
	$('.phone_now').html('当前手机号：'+phone)			
	var userId=common.user_data().cuserInfoid;
	var source="userId"+userId;
	var sign=md5(source+"key"+common.secretKey()).toUpperCase();
	//console.log(source+","+sign)
	//后台返回的正确的验证码
	var verify_code;
	//用户输入的验证码
	var verify_code_inner;
	//点击获取验证码
	$('#phone_verify_code1').on('click',function(){	
		i=59;
		$("#phone_verify_code2").removeAttr("disabled");
		$("#phone_verify_code1").css("display",'none');
		$("#phone_time").css("display","block");
		$("#phone_time").html('(60s后重试)').html('(60s后重试)');					
		login_verify_code(phone);
		verify_code_time();
	});
	//获取验证码			
	function login_verify_code(phone){
		$.ajax({
			url:common.http,
	        type:"post",
	        dataType:"jsonp",
	        data:{
				method:'send_sms',
				mobile:phone,
				type:'4'
			},
			success:function(data){
				//console.log(JSON.stringify(data));
				if (data.statusCode=="100000") {
					verify_code=data.data;
				}
			}
		});
	};
	//验证码倒计时
	function verify_code_time(){
		var id=setInterval(function(){
			if (i==0) {
				$("#phone_time").css("display","none");
				$("#phone_verify_code1").css("display","block");
				$("#phone_verify_code1").html('重新获取');
				clearInterval(id)
			}else{
				$("#phone_time").html("("+i+"s后可重试)");
				$("#phone_time").css({"color":"#f76a10","background":"none"});
			}
			i--;
		},1000)
	};
	//更换手机号
	function phone_change(userId,verify_code_inner,phoneInner,sign,source){
		$.ajax({
			url:common.http,
			dataType:'jsonp',
			data:{
				method:'update_mobile',
				userId:userId,						
				smsCode:verify_code_inner,
				mobile:phoneInner,
				tokenId:common.tokenId(),
				sign:sign,
				source:source
			},
			success:function(data){
				//console.log(JSON.stringify(data))						
				if (data.statusCode=="100000") {
					change_success(data);
					var change_style={
						petName:JSON.parse(localStorage.getItem('change_style')).petName,
	    		    	realName:JSON.parse(localStorage.getItem('change_style')).realName,
	    		    	idCard:JSON.parse(localStorage.getItem('change_style')).idCard,
	    		    	sex:JSON.parse(localStorage.getItem('change_style')).sex,
						phone:phoneInner
					}
					var user_data={
					    cuserInfoid:common.user_data().cuserInfoid,
						firmId:common.user_data().firmId,
						faceImg:common.user_data().faceImg,
						petName:common.user_data().petName,
						realName:common.user_data().realName,
						idCard:common.user_data().idCard,
						mobile:phoneInner,
						sex:common.user_data().sex
					};
					localStorage.setItem('change_style',JSON.stringify(change_style));
					localStorage.setItem("user_data",JSON.stringify(user_data));
				}else{
					common.prompt(data.statusStr);
				}
			},
			error:function(data){
				common.prompt(data.statusStr)
			}
		});
	};
	//点击提交
	$('.phone_submit').on('click',function(){
		verify_code_inner=$('#phone_verify_code2').val();
		phoneInner=$('#phone_phoneNumber').val();
		if(verify_code_inner!=verify_code){
			var data='验证码输入有误';
			common.prompt(data);
		}else if(phoneInner==""){
			var data='请输入手机号';
			common.prompt(data);
		}else if(!common.phoneNumberReg.test(phoneInner)){
			var str='手机号输入有误';
			common.prompt(str);
		}else{
			phone_change(userId,verify_code_inner,phoneInner,sign,source);
		}
	});
    //更换成功显示
    function change_success(data){
    	$('.pop').show();
    	$('.pop_makeSure').on('click',function(){
			setTimeout(function(){
				window.location.href='message_change.html';
			},500)
		})
    };
	//返回上一级
	var obj=$('.header_left');
	common.callback(obj);
})