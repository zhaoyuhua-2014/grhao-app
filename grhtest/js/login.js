$(document).ready(function(){
	$(".login_main_top li").on("click",function(){
		$(this).css({"background":"white","color":"rgb(51,51,51)"}).siblings().css({"background":"#e7e7e7","color":"rgb(178,178,178)"});
		if ($(this).index()==0) {
			$(".login_msg").css("display","block").siblings().css("display","none");
		} else{
			$(".login_count").css("display","block").siblings().css("display","none");
		}
	});
	//用户输入的手机号码
	var phoneInner1,phoneInner2;
	//后台返回的正确的验证码
	var verify_code;
	//用户输入的验证码
	var verify_code_inner;
	//用户输入的密码
	var passwordInner;			
	//点击登录
	$('.login_btn').on('click',function(){
		var phoneInner1=$("#login_phoneNumber1").val();
		var phoneInner2=$("#login_phoneNumber2").val();
		var passwordInner=$('#login_password').val();
		var verify_code_inner=$('#verify_code').val();
		//账号密码登录
		if($(".login_msg").is(':visible')){
			if (phoneInner1=='') {
				var str='请输入手机号';
				common.prompt(str);
			}else if(!common.phoneNumberReg.test(phoneInner1)){
				var str='请输入正确的手机号';
				common.prompt(str);
			}else{
				if(passwordInner==""){
					var data="请输入密码";
					common.prompt(data);
				}else{
					login_data(phoneInner1,passwordInner);
				}
			}
		}else{
			if(phoneInner2==''){
				var str='请输入手机号';
				common.prompt(str);
			}else if(!common.phoneNumberReg.test(phoneInner2)){
				var str='请输入正确的手机号';
				common.prompt(str);
			}else{
				if(verify_code_inner!=verify_code){
					var data='验证码输入有误';
					common.prompt(data);
				}else{
					login_data1(phoneInner2,verify_code_inner);
				}
			}
		}
	});
    //账号密码登陆
	function login_data(phoneInner1,passwordInner){
		//console.log(pwd(passwordInner))
		$.ajax({
			url:common.http,
			type:'post',
	        dataType:"jsonp",
	        data:{
				method:'login',
				mobile:phoneInner1,
				password:pwd(passwordInner)
			},
			success:function(data){
				//console.log(JSON.stringify(data))
				if (data.statusCode=='100000') {
					//console.log(JSON.stringify(data))
					loginOk(data)
				} else{
					common.prompt(data.statusStr)
				}
			},
			error: function(data){
				common.prompt(data.statusStr)
			}
		});
	};



    //动态登录请求
	function login_data1(phoneInner2,verify_code_inner){
		$.ajax({
			url:common.http,
	        type:"post",
	        dataType:"jsonp",
	        data:{
				method:'dynamic_login',
				mobile:phoneInner2,
				smsCode:verify_code_inner
			},
			success:function(data){
				//console.log(data);
				if (data.statusCode=='100000') {
//							console.log(JSON.stringify(data))
					loginOk(data)
				} else{
					common.prompt(data.statusStr)
				}
			},
			error:function(data){
				common.prompt(data.statusStr)
			}
		});
	};
	//点击获取验证码
	$('#get_verify_code').on('click',function(){
		phoneInner2=$("#login_phoneNumber2").val();
		if (phoneInner2=='') {
			var str='请输入手机号';
			common.prompt(str);
		}else if(!common.phoneNumberReg.test(phoneInner2)){
			var str='请输入正确的手机号';
			common.prompt(str);
		} else{
			i=59;
			$("#verify_code").removeAttr("disabled");
			$("#get_verify_code").hide();
			$("#time").show().css({"color":"#f76a10","background":"none"}).html('(60s后重试)');
			login_verify_code(phoneInner2);
			verify_code_time();
		}
	});
	//获取验证码			
	function login_verify_code(phoneInner2){
		$.ajax({
			url:common.http,
	        type:"post",
	        dataType:"jsonp",
	        data:{
				method:'send_sms',
				mobile:phoneInner2,
				type:'5'
			},
			success:function(data){
				//console.log(JSON.stringify(data))
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
				$("#time").hide();
				$("#get_verify_code").show().html('重新获取');
				clearInterval(id);
			}else{
				$("#time").css({"color":"#f76a10","background":"none"}).html("("+i+"s后重试)");
			}
			i--;
		},1000);
	};
	//登录成功后本地存储添加数据
	function loginOk(data){
		var user_data={
		    cuserInfoid:data.data.cuserInfo.id,
		    firmId:data.data.cuserInfo.firmId,
		    faceImg:data.data.cuserInfo.faceImg,
		    petName:data.data.cuserInfo.petName,
		    realName:data.data.cuserInfo.realName,
		    idCard:data.data.cuserInfo.idcard,
		    mobile:data.data.cuserInfo.mobile,
		    sex:data.data.cuserInfo.sex
		}
		localStorage.setItem("user_data",JSON.stringify(user_data));
		localStorage.setItem("tokenId",JSON.stringify(data.data.tokenId));
		localStorage.setItem("secretKey",JSON.stringify(data.data.secretKey));
		//setTimeout(function(){
			window.location.href="../index.html"
		//},500)
	};
	function pwd(text){
    	var md=md5(text);
		var sha=$.sha1(text);
		var pwdstr= sha + md;
		pwdstr = pwdstr.substring(0, 9) + "s" + pwdstr.substring(10, 19) + "h" + pwdstr.substring(20, 29) + "l" + pwdstr.substring(30, 39) + "s" + pwdstr.substring(40, 49) + "u" + pwdstr.substring(50, 59) + "n" + pwdstr.substring(60, 69) + "y" + pwdstr.substring(70, 72);
		pwdstr = pwdstr.substring(36, 72) + pwdstr.substring(0, 36);
		pwdstr = pwdstr.substring(0, 70);
		pwdstr = pwdstr.substring(0, 14) + "j" + pwdstr.substring(14, 28) + "x" + pwdstr.substring(28, 42) + "q" + pwdstr.substring(32, 46) + "y" + pwdstr.substring(56, 70) + "3";
		pwdstr = pwdstr.substring(40, 75) + pwdstr.substring(0, 40);
		//console.log(pwdstr)
		return pwdstr;
	};
	$('.header_left').on('click',function(){				
		window.location.href='../index.html';
	});
})