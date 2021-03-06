$(document).ready(function(){
	//初始化的值
	var pageNo=common.pageNo,pageSize=common.pageSize,keyWord,isEnd=false;
	//热门列表请求
	function searchWordsData(){
		$.ajax({
			url:common.http,
	        type:"post",
	        dataType:"jsonp",
	        data:{
				method:'hot_search_data'
			},
			success:function(data){
				//console.log(JSON.stringify(data));
				if (data.statusCode="100000") {
					searchWordsShow(data)
				}
			},
			error:function(data){
				common.prompt(str)
			}
		});
	};
	//热门列表展示
	function searchWordsShow(data){
		var html='';
		for (var i in data.data) {
			if (i%3==2) {
				html +='<li>'+data.data[i].keyword+'</li>'
			} else{
				html +='<li class="margin_right30">'+data.data[i].keyword+'</li>'
			}
		}
		$(".search_item_list").append(html);
	};
	searchWordsData();
	//请求搜索商品的数据
	function searchWords(keyWord,pageNo,pageSize){
		$.ajax({
			url:common.http,
	        type:"post",
	        dataType:"jsonp",
	        data:{
				method:'search_goods',
				keyWord:keyWord,
				pageNo:pageNo,
				pageSize:pageSize
			},
			success:function(data){
				//console.log(JSON.stringify(data));
				searchGoodsShow(data)
			},
			error:function(data){
				common.prompt(str)
			}
		});
	};
	//点击加载更多
	$('.click_load').on('click',function(){
		if (!isEnd) {
			//console.log(keyWord)
			pageNo++;
			searchWords(keyWord,pageNo,pageSize);
		}else{
			$('.click_load').show().html("没有更多数据了！");
		}
	});
	//搜索结果展示
	function searchGoodsShow(data){
		//console.log(data.data.objects.length)
		isEnd=data.data.isLast;
		if (data.data.pageNo=="1") {
			$(".search_goods dl").remove();
		}
		var html = '';
		if (data.data.objects==0 && data.data.pageNo=="1") {
			$(".search_none").css("display","block").siblings().css("display","none")
		} else{
			$(".search_resurt").css("display","block").siblings().css("display","none");
			for (var i in data.data.objects) {
				html +='<dl class="clearfloat" data="'+data.data.objects[i].id+'">'
				html +=		'<dt><img src="'+data.data.objects[i].goodsLogo+'"/></dt>'
				html +=		'<dd>'
				html +=			'<p class="good_name">'+data.data.objects[i].goodsName+'</h3>'
				html +=			'<p class="good_describe">'+data.data.objects[i].specInfo+'</p>'
				html +=			'<div class="good_picre"><span>￥'+data.data.objects[i].nowPrice+'</span>&nbsp;&nbsp;&nbsp;&nbsp;<del>￥'+data.data.objects[i].nomalPrice+'</del></div>'
				html +=		'</dd>'
				html +='</dl>'
			}
			$(".search_goods").append(html);
			if(isEnd){
				$('.click_load').show().html("没有更多数据了！");
			}else{
				$('.click_load').show().html("点击加载更多！");
			}
		}
	};
	/*事件*/
	//点击热搜词语搜索
	$(".search_item_list").on("click","li",function(){
		//console.log($(this).html());
		pageNo=common.pageNo;
		keyWord=$(this).html();
		$(".search").val(keyWord);
		searchWords(keyWord,pageNo,pageSize);
	});
	//点击搜索搜索
	$('.search_btn').on('click',function(){
		if ($(".search").val() != '' && $(".search").val().replace(/\s*/g,'') != '') {
			keyWord=$(".search").val();
			pageNo=common.pageNo;
			searchWords(keyWord,pageNo,pageSize);
		}
	});
	//点击删除
	$('.search_delete').on('click',function(){
		$(".search").val('');
		if ($(".search_star").hide()) {
			$(".search_star").css("display","block").siblings().css("display","none");
		}
	});
	//搜索框判断事件
	$(".search").on("input propertychange",function(){
		if ($(".search").val() == '' || $(".search").val().replace(/\s*/g,'') == '') {
			$(".search_star").css("display","block").siblings().css("display","none");
		}
	});
	//点击跳转详情
	$(".search_goods").on("click","dl",function(){
		sessionStorage.setItem("goodid",$(this).attr("data"));
		window.location.href="goodsDetails.html";
	});
	//返回事件
	$(".search_left").on("click",function(){
		window.location.href="../index.html";
	});
})
