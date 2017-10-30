 define(function(require, exports, module){

    require('jquery');
    var common = require('../lib/common');
    require('mdData');      	
  	var userId=common.user_data().cuserInfoid;
  	var source="userId"+userId;
	var sign=md5(source+"key"+common.secretKey()).toUpperCase();
	//console.log(source+","+sign)
    //返回上一级
    $('.header_left').on('click',function(){
    	window.location.href='cuopon_management.html'
    });    	    
    //优惠券
    var sel;       	    
    //优惠券列表
    function cuopon(userId){
   	    $.ajax({
   	    	url:common.http,
   	    	dataType:'jsonp',
   	    	data:{
   	    		method:'get_sort_coupon',
   	    		userId:userId       	   	    		
   	    	},
   	    	success:function(data){
   	    		//console.log(JSON.stringify(data))
   	    		if (data.statusCode=="100000") {
   	    			cuopon_show(data);
   	    		}else{
   	    			common.prompt(data.statusStr)
   	    		}
   	    	},
   	    	error:function(data){
   	    		commom.prompt(data.statusStr)
   	    	}
   	    });
    };      	           	   
    //优惠券展示
    function cuopon_show(data){
    	var html='';
    	for(var i=0 in data.data){
    		html+='<div class="cuopon_content clearfloat">'
    		html+='<div class="cuopon_content_center">'
    		html+='<div class="cuopon_title">'+data.data[i].sortName+'</div>'
    		html+='<ul class="cuopon_message">'
    		html+='<li>有效期至：'+data.data[i].endTime+'</li>'
    		html+='<li>金额要求：单个订单大于'+data.data[i].leastOrderMoney+'元</li>'
    		html+='</ul>'
    		html+='</div>'
    		html+='<div class="cuopon_content_right" dataId="'+data.data[i].id+'">'
    		html+='<div class="cuopon_money">'+data.data[i].sortMoney+'元</div>'     	    		
    		if(data.data[i].flag==0){
    			html+='<div class="cuopon_receive cuopon_receive'+data.data[i].flag+'">立即领取</div>'
    		}else if(data.data[i].flag==1){
    			html+='<div class="cuopon_receive cuopon_receive'+data.data[i].flag+'">已领取</div>'
    		}
    		html+='</div>'
    		html+='</div>'
    	};
    	$('.cuopon_contain').append(html);
    	$('.cuopon_receive1').css({
    		'color':'rgb(51,51,51)',
    		'border':'none'
    	})       	    	      	    	
    };      	    
    cuopon(userId);      	           	           	    
    //点击领取优惠券
    function click_own(userId,sortCouponId,sign,source,sel){
    	$.ajax({
   	    	url:common.http,
   	    	dataType:'jsonp',
   	    	data:{
   	            method:'goto_coupon',
   	    		userId:userId,
   	    		sortCouponId:sortCouponId,
				tokenId:common.tokenId(),
				sign:sign,
				source:source
   	    	},
   	    	success:function(data){
   	    		//console.log(sortCouponId)
   	    		//console.log(JSON.stringify(data))
   	    		if(data.statusCode=="100000"){
   	    			sel.css({'color':'rgb(51,51,51)','border':'none'});
    				sel.html('已领取');
    				$('.pop').css({'display':'none'})	
   	    		}
   	    	},
   	    	error:function(data){
   	    		commom.prompt(data.statusStr)
   	    	}
   	    });
    };     	    
    //点击立即领取
    $('.cuopon_contain').on('click','.cuopon_receive0',function(){
    	sel=$(this);
    	sessionStorage.setItem('sortCouponId',$(this).parent().attr('dataId'))    	    	
    	if($(this).html()==='立即领取'){
    		$('.pop').css({'display':'block'});
    		$("body").css("overflow-y","auto")
    	}
    });
    //点击弹出框确定
    $('.pop_makeSure').on('click',function(){
    	sortCouponId=sessionStorage.sortCouponId;      	    	
        click_own(userId,sortCouponId,sign,source,sel);
        $("body").css("overflow-y","auto")
	}); 
	//点击遮罩层
    $('.pop_bg').on('click',function(){
    	$('.pop').css({'display':'none'});
    	$("body").css("overflow-y","auto")
    });     	   
})