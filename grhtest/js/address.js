 define(function(require, exports, module){

    require('jquery');
    var common = require('../lib/common');
    require('mdData'); 
    require('LArea');
    // var LAreaData = require('LAreaData');
	var area1 = new LArea();
	area1.init({
		'trigger': '#person_area', //触发选择控件的文本框，同时选择完毕后name属性输出到该位置
		'valueTo': '#value1', //选择完毕后id属性输出到该位置
		'keys': {
			id: 'code',
			name: 'name'
		}, //绑定数据源相关字段 id对应valueTo的value属性输出 name对应trigger的value属性输出
		'type': 1, //数据源类型
		'data': LAreaData //数据源
	});
	area1.value=[0,0,0];//控制初始位置，注意：该方法并不会影响到input的value
	
	//给据是否存储有addressData判断是否是修改地址
	if (sessionStorage.addressData) {
		//console.log("xiugaisizhi ");
		var addressData=sessionStorage.addressData;
		addressData=JSON.parse(addressData)
		addressData=JSON.parse(addressData)
		$("#person_name").val(addressData.consignee);
		$("#person_phone").val(addressData.mobile);
		$("#person_area").val(addressData.provinceName+","+addressData.cityName+","+addressData.countyName);
		$("#value1").val(addressData.province+","+addressData.city+","+addressData.county);
		$("#person_moreAddress").val(addressData.street);
		$("#btn_save").attr("dataid",addressData.id);
	};
	$('.person_message input[type=text]').on("blur",function(){
		//console.log($(this).val())
	});
	//点击保存
	$('#btn_save').on('click',function(){
		//地址id
		var addrId;
		//用户ＩＤ
		var userId=common.user_data().cuserInfoid;
		var source="userId"+userId;
		var sign=md5(source+"key"+common.secretKey()).toUpperCase();
		//console.log(source+","+sign)
		//用户民
		var consignee=$("#person_name").val();
		//手机号
		var mobile=$("#person_phone").val();
		//省市县名称
		var Area=$('#person_area').val();
		//省市县的编码
		var AreaCode=$("#value1").val();
		//地址的详细信息
		var street=$("#person_moreAddress").val();
		//城市名数组arr1城市编码数组arr2
		var arr1=new Array(),arr2 = new Array();
		arr1=Area.split(",");
		arr2=AreaCode.split(",");
		//省的名字、编码
		var provinceName=arr1[0];
		var province=arr2[0];
		//市的名字、编码
		var cityName=arr1[1];
		var city=arr2[1];
		//区的名字、编码
		var countyName=arr1[2];
		var county=arr2[2];
		
		//console.log(userId+","+consignee+","+mobile+","+Area+","+AreaCode+","+street);
		//console.log(common.phoneNumberReg.test(mobile))
		if (consignee=='') {
			common.prompt("请输入用户名")
		} else if (mobile=='' || !common.phoneNumberReg.test(mobile) ) {
			common.prompt("请输入正确的手机号")
		} else if (Area=='') {
			common.prompt("请选择城市")
		} else if (street=='') {
			common.prompt("请输入详细地址")
		} else{
			//console.log("addrId"+addrId+",userId"+userId+",consignee"+consignee+",mobile"+mobile+",province"+province+",provinceName"+provinceName+",city"+city+",cityName"+cityName+",county"+county+",countyName"+countyName+",street"+street)								
			//console.log(sessionStorage.addressData)
			if (sessionStorage.addressData) {
				addrId=$(this).attr("dataid");
				changeAddress(userId,addrId,consignee,mobile,province,provinceName,city,cityName,county,countyName,street,sign,source)
			} else{
				addAddress(userId,consignee,mobile,province,provinceName,city,cityName,county,countyName,street,sign,source);
			}
			
		}
	});
	//添加地址请求
	function addAddress(userId,consignee,mobile,province,provinceName,city,cityName,county,countyName,street,sign,source){
		$.ajax({
			url:common.http,
			type:'post',
	        dataType:"jsonp",
	        data:{
				method:'address_add',
				userId:userId,
				consignee:consignee,
				mobile:mobile,
				province:province,
				provinceName:provinceName,
				city:city,
				cityName:cityName,
				county:county,
				countyName:countyName,
				street:street,
				tokenId:common.tokenId(),
				sign:sign,
				source:source
			},
			success:function(data){
				//console.log(JSON.stringify(data))
				if (data.statusCode=='100000') {
					//console.log(JSON.stringify(data));
					window.history.back();
				} else{
					common.prompt(data.statusStr)
				}
			},
			error: function(data){
				common.prompt(data.statusStr)
			}
		});
	};
	//修改地址请求
	function changeAddress(userId,addrId,consignee,mobile,province,provinceName,city,cityName,county,countyName,street,sign,source){
		//console.log("addrId"+addrId+",userId"+userId+",consignee"+consignee+",mobile"+mobile+",province"+province+",provinceName"+provinceName+",city"+city+",cityName"+cityName+",county"+county+",countyName"+countyName+",street"+street)
		$.ajax({
			url:common.http,
			type:'post',
	        dataType:"jsonp",
	        data:{
				method:'address_update',
				userId:userId,
				addrId:addrId,
				consignee:consignee,
				mobile:mobile,
				province:province,
				provinceName:provinceName,
				city:city,
				cityName:cityName,
				county:county,
				countyName:countyName,
				street:street,
				tokenId:common.tokenId(),
				sign:sign,
				source:source
			},
			success:function(data){
				//console.log(JSON.stringify(data))
				if (data.statusCode=='100000') {
					//console.log(JSON.stringify(data));
					window.history.back();
					sessionStorage.removeItem("addressData")
				} else{
					common.prompt(data.statusStr)
				}
			},
			error: function(data){
				common.prompt(data.statusStr)
			}
		});
	};
	//点击返回按钮
	$('.header_left').on('click',function(){
		window.history.back();
		sessionStorage.removeItem("addressData")
	});
})