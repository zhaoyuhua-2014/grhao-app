define(function(require, exports, module){
	require('jquery');
	var common = require('../lib/common'); 
	require('mdData');
	require('sha1');
	//用户输入的手机号码
	var phoneInner;
	//后台返回的正确的验证码
	var verify_code;
	//用户输入的验证码
	var verify_code_inner;
	//用户输入的密码和再次输入的密码
	var passwordInner,passAgain;						
	$('.regsiter_btn').on('click',function(){
		phoneInner=$('#reg_phoneNumber').val();
		verify_code_inner=$('#verify_code').val();
		passwordInner=$('#reg_password').val();
		passAgain=$('#reg_password_again').val();
		if(phoneInner==''){
			var str='请输入手机号';
			common.prompt(str);
		}else if(!common.phoneNumberReg.test(phoneInner)){
			var str='请输入正确的手机号';
			common.prompt(str);
		}else if(verify_code_inner!=verify_code){
			var str='验证码输入有误';
			common.prompt(str);
		}else if(passwordInner=='' ){
			var str='请输入密码';
		    common.prompt(str);
		}else if(!common.pwdReg.test(passwordInner)){
			var str='密码格式不正确';
		    common.prompt(str);
		}else if(passAgain==''){
			var str='请再次输入密码';				    
		    common.prompt(str);
		}else if(passAgain!=passwordInner){
			var str='两次密码输入不一致';
			common.prompt(str);
		}else{
			regsiter_data(phoneInner,verify_code_inner,passwordInner,passAgain);
		}
	});
	//用户注册
	function regsiter_data(phoneInner,verify_code_inner,passwordInner,passAgain){
		$.ajax({
			url:common.http,
		    type:"post",
		    dataType:"jsonp",
		    data:{
			    method:'regist',
			    mobile:phoneInner,					
			    smsCode:verify_code_inner,
			    pwd:pwd(passwordInner),
			    confirmPwd:pwd(passAgain),
		    },
		    success:function(data){
		    	//console.log(JSON.stringify(data))
			    if (data.statusCode=='100000') {
				    //console.log(JSON.stringify(data))
				    success_regsiter_show(data)						   
			    } else if (data.statusCode=='100510'){
				    error_regsiter_show(data)						    
			    }
		    },
		    error:function(data){
			    common.prompt(data.statusStr)
		    }
		});
	};
	//手机号已注册时点击保存时的弹出框样式
	function error_regsiter_show(data){
		$('.pop').css({'display':'block'})
		$('.pop_makeSure').on('click',function(){
			$('.pop').css({'display':'none'})
		})
	};
	//注册成功后的显示
	function success_regsiter_show(data){
		//注册成功后保存的本地数据				
		var user_data={
		    cuserInfoid:data.data.cuserInfo.id,
		    firmId:data.data.cuserInfo.firmId,
		    faceImg:data.data.cuserInfo.faceImg,
		    petName:data.data.cuserInfo.petName,
		    realName:data.data.cuserInfo.realName,
		    idCard:data.data.cuserInfo.idCard,
		    mobile:data.data.cuserInfo.mobile,
		    sex:data.data.cuserInfo.sex
		}
		localStorage.setItem("user_data",JSON.stringify(user_data));
		localStorage.setItem("tokenId",JSON.stringify(data.data.tokenID));
		localStorage.setItem("secretKey",JSON.stringify(data.data.secretKey));
		$('.regsiter_pack').css({'display':'none'})
		$('.success').css({'display':'block'})	
		var t=3;
		var time=setInterval(function(){					
			if(t==0){
				window.location.href="my.html";
				clearInterval(time);
			}else{
				$('.regsiter_time').html(t);					
			}	
			t--
		},1000)
	};
	//点击获取验证码
	$('#reg_verify_code').on('click',function(){
		phoneInner=$("#reg_phoneNumber").val();
		if (phoneInner=='') {
			var str='请输入正确的手机号';
			common.prompt(str);
		}else if(!common.phoneNumberReg.test(phoneInner)){
			var str='请输入正确的手机号';
			common.prompt(str);
		} else{
			i=59;
			$("#verify_code").removeAttr("disabled");
			$("#reg_verify_code").hide();
			$("#reg_time").show().css({"color":"#f76a10","background":"none"}).html('(60s后重试)');
			login_verify_code(phoneInner);
			verify_code_time();
		}
	});
	//获取验证码			
	function login_verify_code(phoneInner){
		$.ajax({
			url:common.http,
	        type:"post",
	        dataType:"jsonp",
	        data:{
				method:'send_sms',
				mobile:phoneInner,
				type:'1'
			},
			success:function(data){
				if (data.statusCode=="100000") {	
					verify_code=data.data;
				}
				//console.log(JSON.stringify(data))
			}
		});
	};
	//验证码倒计时
	function verify_code_time(){
		var id=setInterval(function(){
			if (i==0) {
				$("#reg_time").hide();
				$("#reg_verify_code").show().html('重新获取');
				clearInterval(id);
			}else{
				$("#reg_time").css({"color":"#f76a10","background":"none"}).html("("+i+"s后重试)");
			}
			i--;
		},1000)
	};
	function pwd(text){
    	var md=md5(text);
		var sha=$.sha1(text);
		var pwdstr= sha+ md;
		pwdstr = pwdstr.substring(0, 9) + "s" + pwdstr.substring(10, 19) + "h" + pwdstr.substring(20, 29) + "l" + pwdstr.substring(30, 39) + "s" + pwdstr.substring(40, 49) + "u" + pwdstr.substring(50, 59) + "n" + pwdstr.substring(60, 69) + "y" + pwdstr.substring(70, 72);
		pwdstr = pwdstr.substring(36, 72) + pwdstr.substring(0, 36);
		pwdstr = pwdstr.substring(0, 70);
		pwdstr = pwdstr.substring(0, 14) + "j" + pwdstr.substring(14, 28) + "x" + pwdstr.substring(28, 42) + "q" + pwdstr.substring(32, 46) + "y" + pwdstr.substring(56, 70) + "3";
		pwdstr = pwdstr.substring(40, 75) + pwdstr.substring(0, 40);
		//console.log(pwdstr)
		return pwdstr;
	};
	$('.header_left').on('click',function(){				
		window.location.href='login.html';
	});
})