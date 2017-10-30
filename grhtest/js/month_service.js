define(function(require, exports, module){

    require('jquery');
    var common = require('../lib/common');
    require('mdData');  
	//返回上一级
    $('.header_left').on('click',function(){
    	window.history.back();
    });       
    //包月服务接口请求
    function month_service(){
     	$.ajax({
     		url:common.http,
     		dataType:'jsonp',
     		data:{
     			method:'month_card_type_list'
     		},
     		success:function(data){
     			//console.log(JSON.stringify(data))  
     			if (data.statusCode=='100000') {
     				discount_show(data)
     			} else{
     				common.prompt(data.strStatus)
     			}        			
     		},
     		error:function(data){
     			common.prompt(data.strStatus)
     		}
     	});
    };                
    //充值折扣展示
    function discount_show(data){
    	var html='',html1='';        	
    	for(var i in data.data.monthCardType){
    		html+='<div class="month_discount_detail clearfloat">'
    		html+='    <div class="discount_detail_intr">'+data.data.monthCardType[i].policyName+'</div>'        		
    		html+='    <div class="discount_detail_intr">'+data.data.monthCardType[i].discountName+'</div>'        	  
    		html+='</div>'
    	}    
    	if(data.data.adInfo==null){
    		html+=''
    	}else{
    		html1+='<img src="'+data.data.adInfo.adLogo+'" alt="" />' 
    	}         	          	
    	if(data.data.grhAdDesc==null){
    		$('.month_service_intro').css({'display':'none'});        		
    	}else{
    		$('.month_service_intro').html(data.data.grhAdDesc.desc.replace(/\r\n/g, "<br/>"));
    	}
    	if(data.data.grhCouponDesc==null){
    		$('.month_service_instruction').css({'display':'none'});
    	}else{       		
    		$('.month_copon_instruction').html(data.data.grhCouponDesc.desc.replace(/\r\n/g, "<br/>"));
    	}        	
    	$('.month_service_banner').append(html1);
    	$('.month_discount_content').append(html);
    }
    month_service();       
    //点击跳转到包月充值页面
    $('.discount_pay').on('click',function(){
    	if(common.getIslogin()){
    		window.location.href='month_recharge.html';
    	}else{
    		window.location.href="login.html"
    	}
    	
    });
})
