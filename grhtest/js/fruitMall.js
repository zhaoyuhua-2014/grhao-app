define(function(require, exports, module){

    require('jquery');
    var common = require('../lib/common');
    require('mdData');  

	var userId=common.user_data().cuserInfoid;
	var source="userId"+userId;
	var sign=md5(source+"key"+common.secretKey()).toUpperCase();
	//console.log(source+','+sign)
	//跳转到果币兑换记录页面
	$('.fruitMall_wrap_content_left').on('click',function(){
		window.location.href='fruit_exchange.html'
	});
	//跳转到获取果币记录页面
	$('.fruitMall_wrap_content_right').on('click',function(){
		window.location.href='fruit_get.html'
	});
	//返回到我的页面
	$('.header_left').on('click',function(){
		window.location.href='my.html'
	});	    	
	//获取用户当前果币
	function get_fruit_money(userId,sign,source){
		//console.log(userId)
		$.ajax({
			url:common.http,
			type:"post",
	        dataType:"jsonp",
	        data:{
				method:'user_score',
				userId:userId,
				tokenId:common.tokenId(),
				sign:sign,
				source:source
			},
			success:function(data){
				//console.log(JSON.stringify(data))
				if (data.statusCode="100000") {
					$(".fruitMall_wrap_top_left span").html(data.data.score);
				}else{
					$(".fruitMall_wrap_top_left span").html("0");
				}
			},
			error:function(data){
				common.prompt(data.statusStr)
			}
		});
	};
	get_fruit_money(userId,sign,source);
})