 define(function(require, exports, module){

    require('jquery');
    var common = require('../lib/common');
    require('mdData'); 
    require('sha1');
	$('.header_left').on('click',function(){
		window.location.href='my.html'
	})	    
	var userId=common.user_data().cuserInfoid;
	var source="userId"+userId;
	var sign=md5(source+"key"+common.secretKey()).toUpperCase();
	//console.log(source+","+sign)
    //console.log(userId)
    //密码正则
	var pwdReg=/^[^\s]{6,20}$/;
	$('.pwd_change_reverse').on('click',function(){
		//用户输入的旧密码
	    var oldPwd=$('.old_pwd input').val();
	    //用户输入的新密码
	    var newPwd=$('.new_pwd input').val();
	    //再次确认新密码
	    var confirmPwd=$('.confirm_pwd input').val();
		if(oldPwd==''){
			var str='请输入原始密码';
			common.prompt(str);
		}else if(newPwd==''){
			var str='请输入新密码';
			common.prompt(str);
		}else if(!pwdReg.test(newPwd)){
			var str='密码格式不正确';
		    common.prompt(str);				
		}else if(confirmPwd==''){
			var str='请输入确认密码';
			common.prompt(str);	  
	    }else if(oldPwd==newPwd){
			var str='新密码与原密码一样';
			common.prompt(str);
		}else if(confirmPwd!=newPwd){	
			var str='确认密码与新密码不一致';
			common.prompt(str);
		}else{
			pwd_change(userId,oldPwd,newPwd,confirmPwd,sign,source);
		}
	});
	//修改密码接口
	function pwd_change(userId,oldPwd,newPwd,confirmPwd,sign,source){
		$.ajax({
			url:common.http,
			type:'post',
			dataType:'jsonp',
			data:{
				method:'update_pwd',
				userId:userId,	    				
				pwd:pwd(oldPwd),
				newPwd:pwd(newPwd),
				confirmPwd:pwd(confirmPwd),
				tokenId:common.tokenId(),
				sign:sign,
				source:source
			},
			success:function(data){
				if (data.statusCode=='100000') {
				    //console.log(JSON.stringify(data))
				    change_success(data)
			    } else if (data.statusCode=='100503'){						    
				    pwd_error(data)
			    }else{
			    	common.prompt(data.statusStr)
			    }
			},
			error:function(data){
				comon.prompt(data.statusStr)
			}
		});
	};	    		    		    		        
    //修改成功时的显示
    function change_success(data){
    	$('.pop').css({'display':'block'});	
    	$('.pop_prompt').html('修改成功');
    	$('.pop_makeSure').on('click',function(){
    		window.location.href='my.html';
    	})
    };	        
    //原密码错误弹出框
    function pwd_error(data){
    	$('.pop').css({'display':'block'});
    	$('.pop_prompt').html('原密码错误');
    	$('.pop_makeSure').on('click',function(){
    		$('.pop').css({'display':'none'});
    	})
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
	}
})