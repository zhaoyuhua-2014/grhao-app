$(document).ready(function(){
	var firmId,userId;
	userId=common.user_data().cuserInfoid;
	var source="userId"+userId;
	var sign=md5(source+"key"+common.secretKey()).toUpperCase();
	//console.log(source+","+sign)
	if (common.getIslogin() && common.user_data().firmId !='0') {
		firmId=common.user_data().firmId;
	} else{
		firmId=1;
	}
	//获取设备高度计算地图的高度
	$('.store_box2').css("height",(document.documentElement.clientHeight-200)+"px")
	//门店一级城市列表请求
	function storeCityDate(){
		$.ajax({
			url:common.http,
	        type:"post",
	        dataType:"jsonp",
	        data:{
				method:'firm_city_list'
			},
			success:function(data){
				//console.log(JSON.stringify(data));
				if (data.statusCode=="100000") {
					storeCityShow(data);
				}
			},
			error:function(data){
				common.prompt(str)
			}
		});
	};
	//城市列表展示
	function storeCityShow(data){
		var html='';
		for (var i in data.data) {
			html +='<li class="store_city_item">'+data.data[i]+'</li>'
		}
		$(".store_city").append(html);
		$(".store_city li").eq(0).addClass("store_city_click");
		//console.log($(".store_city li").eq(0).html())
		storeAreaDate($(".store_city li").eq(0).html());
	};
	storeCityDate();
	//门店区域列表请求
	function storeAreaDate(cityName){
		$.ajax({
			url:common.http,
	        type:"post",
	        dataType:"jsonp",
	        data:{
				method:'firm_county_list',
				cityName:cityName
			},
			success:function(data){
				//console.log(JSON.stringify(data));
				if (data.statusCode=="100000") {
					storeAreaShow(data)
				}
			},
			error:function(data){
				common.prompt(str)
			}
		});
	};
	//区域列表展示
	function storeAreaShow(data){
		$(".store_area li").remove();
		var html='';
		for (var i in data.data) {
			html +='<li class="store_area_item">'+data.data[i]+'</li>'
		}
		$(".store_area").append(html);
		$(".store_area li").eq(0).addClass("store_area_click");
		//console.log($(".store_area li").eq(0).html())
		storeListDate($(".store_area li").eq(0).html());
	};
	//门店列表请求
	function storeListDate(countyName){
		$.ajax({
			url:common.http,
	        type:"post",
	        dataType:"jsonp",
	        data:{
				method:'firm_list',
				countyName:countyName
			},
			success:function(data){
				//console.log(JSON.stringify(data));
				if (data.statusCode=="100000") {
					storeListShow(data)
				}
			},
			error:function(data){
				common.prompt(str)
			}
		});
	};
	//门店列表展示
	function storeListShow(data){
		$(".store_store li").remove();
		var html='';
		for (var i in data.data) {
			html += '<li class="store_store_item" data="'+data.data[i].id+'">'
			html += '	<dl class="clearfloat">'
			html += '		<dt><img src="'+data.data[i].faceImgUrl+'"/></dt>'
			html += '		<dd>'
			html += '			<p class="business_name">'+data.data[i].firmName+'</p>'
			html += '			<p class="business_address">'+data.data[i].address+'</p>'
			html += '		</dd>'
			html += '	</dl>'
			html += '	<div class="business_timer"><img src="../img/icon_clock.png"/>'+data.data[i].pickUpTime+'</div>'
			html += '</li>'
		}
		$(".store_store").append(html);
		$(".store_store .store_store_item").each(function(){
			if ($(this).attr("data")==firmId) {
				//console.log($(this).attr("data"))
				$(this).find("dd").attr("id","store_bg");
			}
		})
	};
	/*事件*/
	//门店地图切换事件
	$('.store_top').on('click','.store_item',function(){
		//console.log($(this).index());
		if ($(this).index()) {
			$(".store_box1").hide();
			$("#mapContainer").show();
			storeListDate1();
			//showMap(str)
		} else{
			$("#mapContainer").hide();
			$(".store_box1").show();
		}
		$(this).addClass("color_border").siblings().removeClass('color_border');
	});
	//城市点击切换事件
	$(".store_city").on('click','.store_city_item',function(){
		//console.log($(this).html());
		$(this).addClass('store_city_click').siblings().removeClass('store_city_click');
		var cityName=$(this).html();
		storeAreaDate(cityName);
	});
	//区域点击切换事件
	$(".store_area").on('click','.store_area_item',function(){
		//console.log($(this).html());
		$(this).addClass('store_area_click').siblings().removeClass('store_area_click');
		var countyName=$(this).html();
		storeListDate(countyName);
	});
	//点击门店记录门店信息返回首页显示
	$(".store_store").on('click','.store_store_item',function(){
		firmId1=$(this).attr("data");
		if (common.getIslogin()) {
			$(".order_refund").show();
			$("body").css("overflow-y","hidden");
		}else{
			window.location.href="login.html";
		}
	});
	//取消按钮
	$(".order_refund").on("click",".refund_cancle",function(){
		$(".order_refund").hide();
		$("body").css("overflow-y","auto");
	});
	//确定按钮
	$(".order_refund").on("click",".makeSure",function(){			
		changStore(userId,firmId1,sign,source);
		$(".order_refund").hide();
		$("body").css("overflow-y","auto");
	});
	//更改门店
	function changStore(userId,firmId1,sign,source){
		//console.log(firmId1);
		$.ajax({
			url:common.http,
	        type:"post",
	        dataType:"jsonp",
	        data:{
				method:'choice_firm',
				userId:userId,
				firmId:firmId1,
				tokenId:common.tokenId(),
				sign:sign,
				source:source
			},
			success:function(data){
				//console.log(JSON.stringify(data));
				if (data.statusCode=="100000") {
					var user_data={
					    cuserInfoid:JSON.parse(localStorage.user_data).cuserInfoid,
					    firmId:firmId1,
					    petName:JSON.parse(localStorage.user_data).petName,
					    realName:JSON.parse(localStorage.user_data).realName,
					    idCard:JSON.parse(localStorage.user_data).idCard,
					    mobile:JSON.parse(localStorage.user_data).mobile,
					    sex:JSON.parse(localStorage.user_data).sex
					};
					//console.log(JSON.stringify(user_data));
					localStorage.setItem("user_data",JSON.stringify(user_data));
					localStorage.firmId=firmId1;
					window.location.href="../index.html";
				}
			},
			error:function(data){
				common.prompt(str);
			}
		});
	};
	//返回首页事件
	$('.header_left').on('click',function(){
		window.location="../index.html";
	});
	//高德地图显示
	function showMap(data) {
		//console.log(JSON.stringify(data))
		var map = new AMap.Map('mapContainer', {
		    resizeEnable: true,
		    zoom:12,
		    center: [120.1823616,30.24423873]//以杭州火车站为地图中心
		});
		var markers=[];
		//console.log(data.data)
		for (var i in data.data) {
			var marker;
			marker = new AMap.Marker({
			    position: [data.data[i].longitude,data.data[i].latitude],
				map: map
			});
			marker.setLabel({//label默认蓝框白底左上角显示，样式className为：amap-marker-label
		        offset: new AMap.Pixel(10,-10),//修改label相对于maker的位置
		        content: data.data[i].firmName
		   	});
		   	markers.push(marker);
		}
	};
	/*获取所有门店地图坐标*/
	function storeListDate1(){
		$.ajax({
			url:common.http,
	        type:"post",
	        dataType:"jsonp",
	        data:{
				method:'firm_list'
			},
			success:function(data){
				//console.log(JSON.stringify(data));
				if (data.statusCode=="100000") {
					showMap(data);
				}
			},
			error:function(data){
				common.prompt(str)
			}
		});
	};
})
