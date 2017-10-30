define(function(require, exports, module){


	require('jquery');
	var common = require('../lib/common');
	require('swiper');
	require('mdData');




	//预购列表
	function preData(){
		$.ajax({
			url:common.http,
	        type:"post",
	        dataType:"jsonp",
	        data:{
				method:'pre_goods_list'
			},
			success:function(data){
				//console.log(JSON.stringify(data));
				preShow(data)
			},
			error:function(data){
				common.prompt(str)
			}
		})
	};
	preData();
	function preShow(data){
		////console.log(JSON.stringify(data.data.adInfoList))
		common.bannerShow(data.data.adInfoList)
		//预购商品列表
		var preList=data.data.preGoodsList;
		//console.log(JSON.stringify(preList))
		preListShow(preList)
	};
	function preListShow(data){
		//console.log(data)
		var arr1=[],arr2=[];
		for (var i in data) {
			var html='';
			html += '<dl class="clearfloat" data="'+data[i].id+'">'
			html += '	<dt><img src="'+data[i].goodsInfo.goodsLogo+'"/></dt>'
			html += '	<dd>'
			html += '		<div class="pre_good_name">'+data[i].goodsInfo.goodsName+'</div>'
			html += '		<div class="pre_good_specifications">'+data[i].goodsInfo.specInfo+'</div>'
			html += '		<div class="pre_good_specifications1">'+data[i].goodsInfo.goodsDescribe+'</div>'
			html += '		<div class="pre_good_price clearfloat">'
			html += '			<p class="clearfloat"><span>定金：</span><span class="font_color">￥'+data[i].frontMoney+'</span></p>'
			html += '			<p class="clearfloat"><span>尾款：</span><span class="font_color">￥'+data[i].retainage+'</span></p>'
			html += '		</div>'
			html += '	</dd>'
			html += '</dl>'
			//console.log(data[i].preStatus)
			if (data[i].preStatus=='willbegin') {
				$('.pre_goods_box1').show();
				$('.pre_goods_box1 .pre_active_tit').html('活动未开始').css("background-color","#65a032")
				$('.pre_goods_box1 .active_goods_box').append(html);
			}
			if (data[i].preStatus=='book' || data[i].preStatus=='bookend' || data[i].preStatus=='notretainage') {
				$('.pre_goods_box2').show();
				$('.pre_goods_box2 .pre_active_tit').html('活动进行中').css("background-color","#65a032")
				$('.pre_goods_box2 .active_goods_box').append(html);
			}
			if (data[i].preStatus=='end') {
				$('.pre_goods_box3').show();
				$('.pre_goods_box3 .pre_active_tit').html('活动已结束').css("background-color","#b2b2b2")
				$('.pre_goods_box3 .active_goods_box').append(html);
			}
		}
	}
	//点击跳转预购详情	
	$(".pre_goods_box").on('click',"dl",function(){
		//console.log($(this).attr("data"));
		sessionStorage.setItem("goodid",$(this).attr("data"));
		window.location.href="preDetails.html";
	})
	//点击返回首页
	$(".header_left").on('click',function(){
		window.location.href="../index.html"
	})
})
