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
	cuopon(userId,pageNo,pageSize,sign,source)            
	//获取优惠券列表
	function cuopon(userId,pageNo,pageSize,sign,source){
   	    $.ajax({
   	    	url:common.http,
    		type:'post',
    	    dataType:'jsonp',
    	    data:{
    	    	method:'couponInfo_manager',
    	    	userId:userId,
    	    	pageNo:pageNo,
    	    	pageSize:pageSize,
				tokenId:common.tokenId(),
				sign:sign,
				source:source
    	    },
    	    success:function(data){
    	    	//console.log(JSON.stringify(data))
    	    	cuopon_show(data)
    	    },
    	    error:function(data){
    	    	common.prompt(data.statusStr);
    	    }
   	    });          	   
   };
    //优惠券展示
    function cuopon_show(data){
    	var html='';
    	isLast=data.data.lastPage;
    	if(isLast){                	                	
        	$('.lodemore').html('没有更多数据了').show();
        }else{
        	$('.lodemore').html('点击加载更多数据').show();
        }
    	for(var i in data.data.list){
    		html+='<div class="cuopon_management_content clearfloat cuopon_status1'+data.data.list[i].status+'">'
    		html+='		<div class="cuopon_management_content_left">'+data.data.list[i].couponMoney+'元</div>'            
    		html+=' 	<div class="cuopon_management_content_right">'
    		html+='			<div class="cuopon_management_title">'+data.data.list[i].couponName+'</div>'
    		html+='			<ul class="cuopon_management_message">'
    		html+='				<li>有效期至:'+data.data.list[i].endTime+'</li>'
    		html+='				<li>金额要求:订单金额满'+data.data.list[i].leastOrderMoney+'元可用</li>'
    		if (data.data.list[i].howGet=='1') {
    			html+='			<li>来源:好友推荐赠送</li>'
    		}else if (data.data.list[i].howGet=='2') {
    			html+='			<li>来源:微博晒单成功赠送</li>'
    		}else if (data.data.list[i].howGet=='3') {
    			html+='			<li>来源:微信晒单成功赠送</li>'
    		}else if (data.data.list[i].howGet=='4') {
    			html+='			<li>来源:订单促销活动赠送</li>'
    		}else if (data.data.list[i].howGet=='5') {
    			html+='			<li>来源:随意赠送</li>'
    		}else if (data.data.list[i].howGet=='6') {
    			html+='			<li>来源:自助领取</li>'
    		}else{
    			html+='			<li>来源:自助领取</li>'
    		}            		
    		html+='			</ul>'
    		html+='		</div>'
    		html+='</div>'           		
    	};
    	$('.cuopon_management_contain').append(html);            	           	            	
    };
    //点击跳转到首页
    $('.cuopon_management_contain').on('click','.cuopon_status11',function(){
    	window.location.href="../index.html"
    });
    //点击加载更多
    $('.lodemore').on('click',function(){				
		if ($(this).html()!='没有更多数据了') {
			pageNo++;
			cuopon(userId,pageNo,pageSize,sign,source)
		}				
	});  
	//返回上一级
    $('.header_left').on('click',function(){
    	window.location.href='my.html'
    });           
    //跳转到在线获取优惠券页面
    $('.cuopon_management_top_left').on('click',function(){
    	window.location.href='cuopon.html'
    });            
    //编码
    var code="YHQ-DESC";				    		    
    //优惠券使用说明请求
    function contact(code){
    	$.ajax({
    		url:common.http,
			dataType:'jsonp',
    		data:{
    			method:'grh_desc',
    			code:code
    		},
    		success:function(data){
    			//console.log(JSON.stringify(data))
    			if(data.statusCode="100000"){
    				alertShow(data)
    			}else{
    				common.prompt(data.strStatus)
    			}
    		},
    		error:function(data){
    			common.prompt(data.strStatus)
    		}
    	});
    };
    //优惠券使用规则展示
    function alertShow(data){		    			    	
    	var str=data.data.desc;
		$('.alert_title').html(data.data.title)
		//console.log($('.alert_title').height())
		$('.alert_content').html(str.replace(/\r\n/g, "<br>"))            			    	
    };
    var obj=$('.cuopon_management_top_right');
    common.alertShow(obj)
	common.alertHide()
    contact(code)
})