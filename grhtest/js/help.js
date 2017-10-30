define(function(require, exports, module){

	require('jquery');
	var common = require('lib/common');
	//require('mdData');
	//编码
	var 
	//code,
	//var arr=['LXFS-DESC','YGGX-DESC','THH-DESC','YHQ-DESC','YHQS-DESC','GUWM-DESC'];
	obj = {
		'联系方式':'LXFS-DESC',
		'预购协议':'YGGX-DESC',
		'退换货规则':'THH-DESC',
		'优惠券使用规则':'YHQ-DESC',
		'验货与签收':'YHQS-DESC',
		'关于我们':'GUWM-DESC'
	},
	title = document.title;

	for( var i in obj ){
		if(i == title){
			contact(obj[i]);
			break;
		}
	}


	/*if(title=='联系方式'){// $('title').html()
		code=arr[0];
		contact(code);
	}else if(title=='预购协议'){
		code=arr[1];
		contact(code);
	}else if(title=='退换货规则'){
		code=arr[2];
		contact(code);
	}else if(title=='优惠券使用规则'){
		code=arr[3];
		contact(code);
	}else if(title=='验货与签收'){
		code=arr[4];
		contact(code);
	}else if(title=='关于我们'){
		code=arr[5];
		contact(code);
	}*/
	//返回上一级

	/*common.skipUrl('.header_left',function(){
		window.history.back();
	});*/

	//预购协议请求
	function contact(code){
		$.ajax({
			url:common.http,
			dataType:'jsonp',
			data:{
				method:'grh_desc',
				code:code
			},
			success:function(data){
				console.log(JSON.stringify(data))
				if (data.statusCode=='100000') {
					pageShow(data)
				}else{
					common.prompt(data.strStatus)
				}
			},
			error:function(data){
				common.prompt(data.strStatus)
			}
		});
	};	    
	//页面展示
	function pageShow(data){
		var html='';
		html+='<div class="orderDeal">'
		html+='   <div class="orderDeal_title">'+data.data.title+'</div>'
		html+='   <ul class="orderDeal_content" style="font-size: 26px;line-height: 40px;"></ul>'
		html+='</div>'
		$('.main').append(html);
		//console.log(data.data.desc)
		var str=data.data.desc;
		$('.orderDeal_content').html(str.replace(/\r\n/g, "<br>"));
	};
})