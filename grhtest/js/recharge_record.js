define(function(require, exports, module){

    require('jquery');
    var common = require('../lib/common');
    require('mdData');  
	var userId=common.user_data().cuserInfoid;
	var source="userId"+userId;
	var sign=md5(source+"key"+common.secretKey()).toUpperCase();
	//console.log(source+","+sign)
	var pageNo=common.pageNo;
	var pageSize=common.pageSize;
	record(userId,pageNo,pageSize,sign,source);
	//请求用户充值记录数据
	function record(userId,pageNo,pageSize,sign,source){
		$.ajax({
			url:common.http,
			dataType:'jsonp',
			data:{
			    method:'user_recharge_rcd',
				userId:userId,
				pageNo:pageNo,
				pageSize:pageSize,
				tokenId:common.tokenId(),
				sign:sign,
				source:source
			},
			success:function(data){	    				
				//console.log(JSON.stringify(data));
				if (data.statusCode=="100000") {
					recharge_show(data)
				}
			},
			error:function(data){
				common.prompt(data.statusStr);
			}
		});
	};
	//充值记录展示
	function recharge_show(data){
		var html='';
		isLast=data.data.lastPage;
    	if(isLast){                	                	
        	$('.lodemore').html('没有更多数据了').show();	
        }else{   
        	$('.lodemore').show().html('点击加载更多数据')              
        }
		for(var i in data.data.list){
			html+='<div class="fruit_get_content clearfloat">'
			html+='<div class="fruit_get_content_left">'+data.data.list[i].payTime.substring(0,10)+'</div>'	    			
			if(data.data.list[i].paymentMethod==2){
				html+='<div class="fruit_get_content_center">支付宝充值</div>'
			}else if(data.data.list[i].paymentMethod==3){
				html+='<div class="fruit_get_content_center">返利充值</div>'
			}else if(data.data.list[i].paymentMethod==4){
				html+='<div class="fruit_get_content_center">系统充值</div>'
			}else if(data.data.list[i].paymentMethod==5){
				html+='<div class="fruit_get_content_center">充值卡充值</div>'
			}else if(data.data.list[i].paymentMethod==6){
				html+='<div class="fruit_get_content_center">快捷充值</div>'
			}else if(data.data.list[i].paymentMethod==7){
				html+='<div class="fruit_get_content_center">微信充值</div>'
			}else{
				html+='<div class="fruit_get_content_center">其它充值</div>'
			}
			html+='<div class="fruit_get_content_right">￥'+data.data.list[i].money+'</div>'
			html+='</div>'
		}
		$('.fruit_get_contain').append(html);
	};	
	//点击加载更多
    $('.lodemore').on('click',function(){				
		if ($(this).html()!='没有更多数据了') {
			pageNo++;
			record(userId,pageNo,pageSize,sign,source);
		}				
	});
	$('.header_left').on('click',function(){
    	window.location.href='month_recharge.html'
   });
})