define(function(require, exports, module){
	
	require('jquery');
	var common = require('../lib/common');
	require('mdData');
	require('sha1');

	//昵称
	var petName;
	//真实姓名
	var realName;
	//身份证号
	var idCard;  
	//性别
	var sex; 
	var userId=common.user_data().cuserInfoid;	
	var source="userId"+userId;
	var sign=md5(source+"key"+common.secretKey()).toUpperCase();
	//console.log(source+","+sign)
	/*$('.header_left').on('click',function(){
		localStorage.removeItem('change_style');
		window.location.href='my.html';
	});*/   			    	
	//判断信息是从本地存储中获取还是从个人信息接口中获取
	if(!localStorage.getItem('change_style')){
		message_show(userId,sign,source); 				
    }else{
    	$('#message_nick').val(JSON.parse(localStorage.getItem('change_style')).petName);
        $('#message_name').val(JSON.parse(localStorage.getItem('change_style')).realName);
        $('#message_IDcard').val(JSON.parse(localStorage.getItem('change_style')).idCard);  
        $('#message_sex').val(JSON.parse(localStorage.getItem('change_style')).sex);
    	$('#message_phoneNumber').val(JSON.parse(localStorage.getItem('change_style')).phone);
    };
	//判断身份证号是否可以填写
	$('#message_IDcard').on('click',function(){
		if($('#message_IDcard').val()==''|| !common.regIdCard.test(idCard)){
			$('#message_IDcard').removeAttr('disabled');
		}else{
			$('#message_IDcard').attr("disabled","disabled");
		}
	});
	//点击保存
	$('.main_reverse').on('click',function(){
	    petName=$('#message_nick').val();
	    realName=$('#message_name').val();
	    idCard=$('#message_IDcard').val();   
	    sex=$('#message_sex').val();  
	    if(sex=='男'){
	    	sex=1;
	    }else{
	    	sex=2;
	    }
	    var mobile=$('#message_phoneNumber').val(); 
	    source="idCard"+idCard+"-userId"+userId;
	    sign=md5(source+"key"+common.secretKey()).toUpperCase();
	    //console.log(source+","+sign)
	    if(petName==''){
	    	var str='请输入昵称';
	    	common.prompt(str);
	    }else if(realName==''){
	    	var str='请输入真实姓名';
	    	common.prompt(str);
	    }else if(idCard==''){
//  		    	$('#message_IDcard').removeAttr('disabled')
	    	var str='请填写身份证号';
	    	common.prompt(str);
	    }else if(!common.regIdCard.test(idCard)){    		    	
	    	var str='身份证号格式不正确';
	    	common.prompt(str);
	    }else{
	    	messageChange(userId,petName,realName,idCard,sex,sign,source);
	    	localStorage.removeItem('change_style');
	    }    		        		   
	});   		
	//选择性别
	$('.message_sex').on('click',function(){
		$('.message_sex_choose').toggle(300);
		/*if($('.message_sex_choose').css("display") == "none"){
		    $('.message_sex_choose').css({'display':'block'});   				
			$('.message_sex').animate({'height':'261px'},500);
		}else{   				
			$('.message_sex').animate({'height':'87px'},500,function(){
				$('.message_sex_choose').css({'display':'none'});
			});  				       				
		}*/
	});
	$('.message_sex_choose li').on('click',function(){
		var tab=$('.message_sex_choose li').index(this);
		//console.log(tab)
		if(tab==0){
			$('#message_sex').val('男');
		}else if(tab==1){
			$('#message_sex').val('女');
		}			        			
	});    		
	//手机号跳转
	$('.message_phoneNumber').on('click',function(){
		var petName=$('#message_nick').val();
	    var realName=$('#message_name').val();
	    var idCard=$('#message_IDcard').val();   
	    var sex=$('#message_sex').val(); 
	    var mobile=$('#message_phoneNumber').val(); 
	    var change_style={
	    	petName:petName,
	    	realName:realName,
	    	idCard:idCard,
	    	sex:sex,
	    	phone:mobile
	    };
	    localStorage.setItem('change_style',JSON.stringify(change_style));
		window.location.href='phoneChange.html';
	});   		    		
	//个人信息展示
	function message_show(userId,sign,source){
		$.ajax({
			url:common.http,
			dataType:'jsonp',
			data:{
				method:'show',
				userId:userId,
				tokenId:common.tokenId(),
				sign:sign,
				source:source
			},
			success:function(data){
				//console.log(JSON.stringify(data));
				if (data.statusCode=="100000") {
					message_person(data)
				}
			},
			error:function(data){
				common.prompt(data.statusStr);
			}
		});
	};     		
    function message_person(data){
		$('#message_nick').val(data.data.petName);
	    $('#message_name').val(data.data.realName);
	    $('#message_IDcard').val(data.data.idcard);  
	    $('#message_IDcard').css({
		    'color':'#b2b2b2'
	    })
	    if(data.data.idcard==''){
		    $('#message_IDcard').removeAttr("disabled");
	    }
	    if(data.data.sex==1){
	     	$('#message_sex').val('男');
	    }else if(data.data.sex==2){
		    $('#message_sex').val('女');
	    }    					
	    $('#message_phoneNumber').val(data.data.mobile);
	};
	//修改个人信息
	function messageChange(userId,petName,realName,idCard,sex,sign,source){
		$.ajax({
			url:common.http,
			dataType:'jsonp',
			data:{
				method:'update_userinfo',
				userId:userId,    					
				petName:petName,
				realName:realName,
				idCard:idCard,
				sex:sex,
				tokenId:common.tokenId(),
				sign:sign,
				source:source
			},
			success:function(data){
				//console.log(JSON.stringify(data));
				if (data.statusCode=="100000") {
					success_reverse(data);
					//console.log();
					var user_data={
					    cuserInfoid:common.user_data().cuserInfoid,
					    firmId:common.user_data().firmId,
					    faceImg:common.user_data().faceImg,
					    petName:petName,
					    realName:realName,
					    idCard:idCard,
					    mobile:common.user_data().mobile,
					    sex:sex
					};
					//console.log(JSON.stringify(user_data));
					localStorage.setItem("user_data",JSON.stringify(user_data));
				}
			},
			error:function(data){
				common.prompt(data.statusStr);
			}
		});
	};
	//保存成功时的显示
	function success_reverse(data){
		$('.pop').css({'display':'block'})
		$('.pop_makeSure').on('click',function(){
			setTimeout(function(){
				window.location.href='my.html'
			},500)
		});
	};
})