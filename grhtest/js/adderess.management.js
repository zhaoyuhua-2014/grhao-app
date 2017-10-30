define(function(require, exports, module){

    require('jquery');
    var common = require('../lib/common');
    require('mdData');  
	//设置默认地址的元素
	var sel="";
	var userId=common.user_data().cuserInfoid;
	var source="userId"+userId;
	var sign=md5(source+"key"+common.secretKey()).toUpperCase();
	//console.log(source+","+sign)
	//删除地址
	var addrId1,obj1;
	//console.log(userId)
	getAddressList(userId,sign,source);
	//获取地址列表
	function getAddressList(userId,sign,source){
		$.ajax({
			url:common.http,
	        type:"post",
	        dataType:"jsonp",
	        data:{
				method:'address_manager',
				userId:userId,
				tokenId:common.tokenId(),
				sign:sign,
				source:source
			},
			success:function(data){
				//console.log(JSON.stringify(data));
				if (data.statusCode=="100000") {
					addressListShow(data)
				}
			},
			error:function(data){
				common.prompt(str)
			}
		});
	};
	//地址列表展示
	function addressListShow(data){
		var html = '';
		for (var i in data.data) {
			html += '<div class="contain_address">'
			html += '	<div class="management_address" data='+JSON.stringify(data.data[i])+' >'
			html += '        <div class="management_address_top clearfloat">'
			html += '	         <div class="management_address_name">'+data.data[i].consignee+'</div>'
			html += '	         <div class="management_address_phone">'+data.data[i].mobile+'</div>'
			html += '        </div>'
			html += '        <div class="management_address_bottom">'+data.data[i].provinceName+data.data[i].cityName+data.data[i].countyName+data.data[i].street+'</div>'
		    html += '    </div>'
			html += '	<div class="address_set clearfloat" dataid="'+data.data[i].id+'" data='+JSON.stringify(data.data[i])+'>'
			//console.log(data.data[i].isDefault)
			if (data.data[i].isDefault=="1") {
				html += '		<div class="default_address default_bg">默认地址</div>'
			} else if(data.data[i].isDefault=="-1"){
				html += '		<div class="default_address">默认地址</div>'
			}
			html += '		<div class="editor_address">编辑</div>'
			html += '		<div class="delete_address">删除</div>'
			html += '	</div>'
			html += '</div>'
		}
		$(".address_management").append(html);
		$(".add_address").show();
	};
	//设为默认地址
	$(".address_management").on('click',".default_address",function(){
		var addrId=$(this).parent().attr("dataid");   		
		sel= $(this)
		//console.log(userId+","+addrId)
		setDefaultAddress(userId,addrId,sign,source,sel);
	});
	function setDefaultAddress(userId,addrId,sign,source,sel){
		$.ajax({
			url:common.http,
	        type:"post",
	        dataType:"jsonp",
	        data:{
				method:'address_default',
				userId:userId,
				addrId:addrId,
				tokenId:common.tokenId(),
				sign:sign,
				source:source
			},
			success:function(data){
				//console.log(JSON.stringify(data));
				if (data.statusCode=="100000") {
					$(".default_address").removeClass("default_bg");
					sel.addClass("default_bg");
				} else{
					common.prompt(data.statusStr)
				}
			},
			error:function(data){
				common.prompt(data.statusStr)
			}
		});
	};
	//编辑地址
	$(".address_management").on('click',".editor_address",function(){
		var addrId=$(this).parent().attr("dataid");
		var data=$(this).parent().attr("data");
		data=JSON.stringify(data);
		sessionStorage.setItem("addressData",data);
		window.location.href="address.html";
	});
	//删除地址
	$(".address_management").on('click',".delete_address",function(){
		addrId1=$(this).parent().attr("dataid");
		obj1=$(this).parent().parent();
		$(".order_refund").show();
		$("body").css("overflow-y","hidden")
	});
	//取消按钮
	$(".order_refund").on("click",".refund_cancle",function(){
		$(".order_refund").hide();
		$("body").css("overflow-y","auto")
	});
	//确定按钮
	$(".order_refund").on("click",".makeSure",function(){
		//console.log(addrId1+","+obj1)			
		$(".order_refund").hide();
		$("body").css("overflow-y","auto")
		deleteAddress(addrId1,sign,source,obj1)
	});
	function deleteAddress(addrId,sign,source,obj){
		//console.log(addrId+","+obj)
		$.ajax({
			url:common.http,
	        type:"post",
	        dataType:"jsonp",
	        data:{
				method:'address_delete',
				addrId:addrId,
				tokenId:common.tokenId(),
				sign:sign,
				source:source
			},
			success:function(data){
				//console.log(JSON.stringify(data));
				if (data.statusCode=="100000") {
					obj.remove();
				}
			},
			error:function(data){
				common.prompt(str)
			}
		});
	};
	//点击地址带回订单结算页面
	$(".address_management").on('click',".management_address",function(){
		var data=$(this).attr("data");
		//console.log(data)
		sessionStorage.setItem("addressData",data);
		if (sessionStorage.addType=="1") {
			sessionStorage.setItem("addType","");
			window.history.back();
		}
	});
	//点击添加地址
	$(".add_address").on('click',function (){
		sessionStorage.setItem("addressData","")
		window.location.href="address.html";
	});
	//点击返回按钮
	$('.header_left').on('click',function(){
		window.history.back();
	});
})