$(document).ready(function(){
	//定义type请求类型 1套餐，2钜惠，3全部
	var type;
	//定义变量pageNo 页数 pageSize 每页个数  isEnd是否最后一页
	var isTrue=false;//true链接过来的；false本地存储
	var pageNo=common.pageNo,pageSize=common.pageSize,isEnd=false;
	var dataid,dataprice,dataname,datalogo,dataspecInfo,datamax,datapackagenum,purchaseQuantity;
	var userId;
	var typeCode;
	var test=location.href.toUpperCase();
	var words=test.split("#");	
	isLink()
	function isLink(){
		for(var i=1;i<words.length;i++){
			if(String(words[i]).indexOf('TYPE')!=-1){
				isTrue=true;			
				type=words[i].substring(words[i].indexOf('=')+1);				
				return  type;				
			}
		}
	}
	if(isTrue){		
		if (type='') {
			$(".header_title").html("全部商品");
		}else if (type="TAO_CAN") {
			$(".header_title").html("礼盒套餐");
		}else if (type="JU_HUI") {
			$(".header_title").html("钜惠活动");
		}
		moreFirstList(type);
	}else{
		if (localStorage.moreType=="3") {
			$(".header_title").html("全部商品");
			type='';
			moreFirstList(type);
		} else if (localStorage.moreType=="1") {
			$(".header_title").html("礼盒套餐");
			type="TAO_CAN";
			////console.log(type)
			moreFirstList(type);
		} else if (localStorage.moreType=="2") {
			$(".header_title").html("钜惠活动");
			type="JU_HUI";
			moreFirstList(type);
		};
	}
	//设置高度
	$('.main').height(document.documentElement.clientHeight-$('.empty').height()-$('.empty1').height());
	$('.more_bottom_left_wrap').height(document.documentElement.clientHeight-$('.empty').height()-$('.empty1').height()-$('.more_top_wrap').height());
	$('.more_bottom_right_wrap').height(document.documentElement.clientHeight-$('.empty').height()-$('.empty1').height()-$('.more_top_wrap').height());	
	
	//全部商品一级列表
	function moreFirstList(type){
		//console.log(type);
		$.ajax({
			url:common.http,
	        type:"post",
	        dataType:"jsonp",
	        data:{
				method:'goods_first_type',
				type:type
			},
			success:function(data){
				//console.log(JSON.stringify(data));
				if (data.statusCode==100000) {
					firstData(data)
				}
			},
			error:function(data){
				common.prompt(data.statusStr)
			}
		});
	};
	//展示一级列表
	function firstData(data){
		var html='';
		for (var i in data.data) {
			html +='<li class="first_item" data="'+data.data[i].typeCode+'">'+data.data[i].typeName+'</li>'
		}
		$(".more_top").append(html).width(data.data.length*156);
		var firstItem=$(".more_top .first_item");
		if (sessionStorage.first_data) {
			firstItem.each(function(){
				//console.log($(this).attr("data")+","+sessionStorage.first_data)
				if ($(this).attr("data")==sessionStorage.first_data) {
					typeCode=sessionStorage.first_data;
					moreTowList(typeCode);
					$(this).addClass("more_first_click")
				}
			})
		} else{
			firstItem.eq(0).addClass("more_first_click");
			typeCode=firstItem.eq(0).attr("data");
			sessionStorage.setItem("first_data",typeCode);
			moreTowList(typeCode)
		}
	};
	//全部商品二级列表
	function moreTowList(typeCode){
		//console.log(typeCode)
		$.ajax({
			url:common.http,
	        type:"post",
	        dataType:"jsonp",
	        data:{
				method:'goods_second_type',
				typeCode:typeCode
			},
			success:function(data){
				////console.log(JSON.stringify(data));
				if (data.statusCode==100000) {
					twoData(data);
				}
			},
			error:function(data){
				common.prompt(data.statusStr)
			}
		});
	};
	//展示二级列表
	function twoData(data){
		$(".more_bottom_left li").remove();
		var html='';
		for (var i in data.data) {
			html +='<li class="two_item" data="'+data.data[i].typeCode+'">'+data.data[i].typeName+'</li>'
		}
		$(".more_bottom_left").append(html);
		var twoItem=$(".more_bottom_left .two_item");
		if (sessionStorage.two_data) {
			twoItem.each(function(){
				//console.log($(this).attr("data")+","+sessionStorage.two_data)
				if ($(this).attr("data")==sessionStorage.two_data) {
					typeCode=sessionStorage.two_data;
					moreGoodsList(typeCode,pageNo,pageSize);
					$(this).addClass("more_two_click");
				}
			});
		} else{
			twoItem.eq(0).addClass("more_two_click").siblings().removeClass("more_two_click");
			typeCode=twoItem.eq(0).attr("data");
			sessionStorage.setItem("two_data",typeCode);
			$(".more_bottom_right dl").remove();
			moreGoodsList(typeCode,pageNo,pageSize);
		}
	};
	//全部商品商品列表
	function moreGoodsList(typeCode,pageNo,pageSize){
		//console.log(typeCode+","+pageNo+","+pageSize)
		$.ajax({
			url:common.http,
	        type:"post",
	        dataType:"jsonp",
	        data:{
				method:'goods_list',
				typeCode:typeCode,
				pageNo:pageNo,
				pageSize:pageSize
			},
			success:function(data){
				//console.log(JSON.stringify(data));
				if (data.statusCode=="100000") {
					if (data.data.objects=="" || data.data.objects.length=="0") {
						
					}else{
						goodsData(data)	
					}
				}
			},
			error:function(data){
				common.prompt(data.statusStr)
			}
		});
	};
	//展示商品列表
	function goodsData(data){
		isEnd=data.data.isLast;
		var html='';
		if (pageNo=='1') {
			$(".more_bottom_right dl").remove();
		}
		for (var i in data.data.objects) {
			//console.log(data.data.objects[i].id)
			var gdnum=callbackgoodsnumber(data.data.objects[i].id);
			//console.log(gdnum);
			html +='<dl class="goods_item clearfloat" data="'+data.data.objects[i].id+'">'
			html +='	<dt><img src="'+data.data.objects[i].goodsLogo+'"/></dt>'
			html +='	<dd>'
			html +='		<p class="good_name">'+data.data.objects[i].goodsName+'</p>'
			html +='		<p class="good_describe clearfloat">'
			html +='			<span class="float_left">'+data.data.objects[i].specInfo+'</span>'
			if (data.data.objects[i].purchaseQuantity=="" || data.data.objects[i].purchaseQuantity=="0") {
				
			}else{
				html +='			<span class="float_right">'+data.data.objects[i].purchaseQuantity+'份起售</span>'
			}
			html +='		</p>'
			html +='		<p class="good_describe1">'+data.data.objects[i].goodsDescribe+'</p>'
			html +='		<div class="good_box" data="'+data.data.objects[i].id+'" datamax="'+data.data.objects[i].maxBuyNum+'" dataname="'+data.data.objects[i].goodsName+'" datalogo="'+data.data.objects[i].goodsLogo+'" dataprice="'+data.data.objects[i].nowPrice+'" dataspecifications="'+data.data.objects[i].specInfo+'" datapackagenum="'+data.data.objects[i].packageNum+'" dataspecinfo="'+data.data.objects[i].specInfo+'" purchaseQuantity="data.data.objects[i].purchaseQuantity">'
			html +='			<div class="good_picre"><span>￥'+data.data.objects[i].nowPrice+'</span>&nbsp;&nbsp;<del>￥'+data.data.objects[i].nomalPrice+'</del></div>'
			html +='			<div class="good_number clearfloat">'
			if (gdnum) {
				html +='					<div class="minus_num"><img src="../img/btn_m.png"/></div>'
				html +='					<div class="show_num" dataid="'+data.data.objects[i].id+'">'+gdnum+'</div>'
				html +='					<div class="add_num"><img src="../img/btn_a.png"/></div>'
			} else{
				if ( data.data.objects[i].packageNum == "" || data.data.objects[i].packageNum == "0" ) {
					html += '		<div style="color:#FFFFFF,background:red,text-align:center">已售罄</div>'
				}else{
					html +='					<div class="minus_num" style="display:none"><img src="../img/btn_m.png"/></div>'
					html +='					<div class="show_num" dataid="'+data.data.objects[i].id+'" style="display:none">0</div>'
					html +='					<div class="add_num"><img src="../img/btn_a.png"/></div>'
				}
			}
			
			html +='			</div>'
			html +='		</div>'
			html +='	</dd>'
			html +='</dl>'
		}
		$(".more_bottom_right").append(html);
		if(isEnd){
			$('.click_load').show().off("click").html("没有更多数据了！");
		}else{
			$('.click_load').show().html("点击加载更多！");
		}
		style_change();
	}
	//点击一级列表
	$(".more_top").on('click','.first_item',function(){
		if ($(this).attr("data")!=sessionStorage.first_data) {
			$('.click_load').show().html("正在加载中...");
			$(this).addClass("more_first_click").siblings().removeClass("more_first_click");
			typeCode=$(this).attr("data");
			sessionStorage.setItem("first_data",typeCode);
			sessionStorage.removeItem("two_data");
			moreTowList(typeCode);
		}
	});
	//点击二级列表获取商品列表
	$(".more_bottom_left").on('click','.two_item',function(){
		if ($(this).attr("data") != sessionStorage.two_data) {
			$('.click_load').show().html("正在加载中...");
			$(this).addClass("more_two_click").siblings().removeClass("more_two_click");
			typeCode=$(this).attr('data');
			sessionStorage.setItem("two_data",typeCode);
			$(".more_bottom_right dl").remove();
			moreGoodsList(typeCode,pageNo,pageSize);
		}
	});
	//点击商品列表进行增减跳转详情
	$(".more_bottom_right").on('click','.goods_item',function(e){
		common.stopEventBubble(e);
		var goodid=$(this).attr("data");
		sessionStorage.setItem("goodid",goodid);
		//console.log("商品id"+goodid+"进行跳转详情操作");
		location.href="goodsDetails.html";
	});
	//增加
	$(".more_bottom_right").on('click','.add_num',function(e){
		common.stopEventBubble(e)
		dataid=$(this).parent().parent().attr("data");
		dataname=$(this).parent().parent().attr("dataname");
		dataprice=$(this).parent().parent().attr("dataprice");
		datalogo=$(this).parent().parent().attr("datalogo");
		dataspecInfo=$(this).parent().parent().attr("dataspecifications");
		datamax=$(this).parent().parent().attr("datamax");
		//console.log(datamax =="")
		datapackagenum=$(this).parent().parent().attr("datapackagenum");
		//console.log(dataid+','+dataprice+','+dataname+','+datalogo+','+dataspecInfo+','+datamax+','+datapackagenum)
		var goodNum=callbackgoodsnumber(dataid);
		if (goodNum<datapackagenum) {
			if(datamax != '0' && datamax !=""){
				if(goodNum<datamax){
					var num1=addgoods(dataid,dataname,dataprice,datalogo,dataspecInfo,datamax,datapackagenum);
					if (num1==1) {
						$(this).siblings().css('display','inline-block');
						$(this).siblings().eq(1).html(num1);
					}else{
						$(this).siblings().eq(1).html(num1);
					}					
					sport($(this));
				}else{
					common.prompt("该商品限购"+datamax+"件")
				}
			}else{
				var num1=addgoods(dataid,dataname,dataprice,datalogo,dataspecInfo,datamax,datapackagenum);
				if (num1==1) {
					$(this).siblings().css('display','inline-block');
				}
				$(this).siblings().eq(1).html(num1);
				sport($(this));
			}			
		} else{
			common.prompt("库存不足");
		}
	});
	//减少
	$(".more_bottom_right").on('click','.minus_num',function(e){
		common.stopEventBubble(e);
		var id=$(this).parent().parent().attr("data");
		var num1=cutgoods(id);
		////console.log(price)
		if (num1<'1') {
			$(this).siblings().eq(0).css("display","none");
			$(this).css("display","none");
		} else{
			$(this).siblings().eq(0).html(num1);
		}
		style_change();
	});
	//商品数目变化
	$(".more_bottom_right").on('DOMNodeInserted','.show_num',function(){
		if ($(this).html()==0) {
			$(this).siblings().eq(0).css('display','none');
			$(this).css('display',"none");
		} else{
			$(this).siblings().css('display','inline-block');
			$(this).css('display',"inline-block");
		}
		style_change();
	});
	//点击加载更多
	$('.click_load').on('click',function(){
		if (!isEnd) {
			var typeCode=sessionStorage.two_data;
			pageNo++;
			moreGoodsList(typeCode,pageNo,pageSize);
		}else{
			$('.click_load').show().html("没有更多数据了！");
		}
	});
	//点击提交本地购物车商品列表结算购物车
	$('.footer_car_rigth').on('click',function(){
		var goodsList=goodlist1();
		//var goodsList="{'goodsList':[{'goodsId':2,'count':2},{'goodsId':16,'count':1}]}"
		userId=common.user_data().cuserInfoid;
		var source="userId"+userId;
		var sign=md5(source+"key"+common.secretKey()).toUpperCase();
		//console.log(source+","+sign)
		//console.log(userId+","+goodsList);
		if (common.getIslogin()) {
			settlement_cart(userId,goodsList,sign,source);
		}else{
			location.href='login.html';
		}
	});
	//选好了函数
	function settlement_cart(userId,goodsList,sign,source){
		$.ajax({
			url:common.http,
	        type:"post",
	        dataType:"jsonp",
	        data:{
				method:'shop_cart_submit',
				userId:userId,
				goodsList:goodsList,
				tokenId:common.tokenId(),
				sign:sign,
				source:source
			},
			success:function(data){
				//console.log(JSON.stringify(data));
				if (data.statusCode=="100000") {
					//console.log(JSON.stringify(data));
					localStorage.setItem("orderType","1");
					sessionStorage.setItem("setBack","1");
					window.location.href="order_set_charge.html";
				}else{
					common.prompt(data.statusStr)
				}
			},
			error:function(data){
				common.prompt(data.statusStr)
			}
		});
	};	
	//根据商品总数和总价变化对应的样式
	function style_change(){
		if (getgoodsNum()=='0') {
			$('.gw_car_num').css("display","none");
			$('.footer_car_left').css("background","#494848").html("购物车是空的");
			$('.footer_car_rigth').hide();
		} else{
			$('.gw_car_num').css("display","block").html(getgoodsNum());
			$('.footer_car_left').css("background","#494848").html("共"+getgoodsMoney()+"元");
			$('.footer_car_rigth').show().html('选好了').css({'background':'#93c01d','color':'#FFF'});
		}
	};
	//点击加号按钮加入购物车动画
	function sport(obj){
		var xEnd=$(".gw_car_num").offset().left+$(".gw_car_num").width()/4;
		var yEnd=$(".gw_car_num").offset().top-$(".gw_car_num").height()/4;
		var xStar,yStar;
		xStar=obj.offset().left+obj.width()/4;
		yStar=obj.offset().top-obj.height()/4;
		var new_obj=$("<span id='add_aport'></span>");
		$('.main_wrap').append(new_obj);
		new_obj.css({
			'width': '20px',
			'height': '20px',
			'position': 'absolute',
			'background': '#f9b52c',
			"border-radius":"50%",
			'z-index':'600',
			"top":yStar,
			"left":xStar
		}).animate({
			left:xEnd,
			top:yEnd
		},800,function(){
			$('.main_wrap').find('#add_aport').remove();
		})
	};
	//点击返回首页
	$(".header_left").on('click',function(){
		sessionStorage.removeItem("first_data");
		sessionStorage.removeItem("two_data");
		window.location="../index.html";
	});
	goshoping_car();
	function goshoping_car(){
		//点击购物车
		$("#gw_car").on('click',function(){
			if ($('.goshoping_car').css("display")=='none'&&getgoodsNum()!=0) {
				$(".my_bg").show();
				//写入car
				car_goods();
				$('.goshoping_car').css("display","block");
				if($('.car_main').height()<300){
					$('.car_main').css('height',"auto");
				}else{
					$('.car_main').css({'max-height':"300px","overflow-y":"auto"});
				}
				//添加点击增加事件
				$('.car_max').on('click',function(){
					id=$(this).parent().parent().attr('data');
					packageNum=$(this).parent().parent().attr('packageNum');
					maxCount=$(this).parent().parent().attr('maxCount');
					var numList=$(this).siblings().eq(1).text();
					packageNum=parseInt(packageNum);
					numList=parseInt(numList);
					if (numList<packageNum) {
						if(maxCount != '0' && maxCount !=""){
							if(numList<maxCount){
								var num=addgoods(id)
								$('span[dataid='+id+']').html(num);
								$('div[dataid='+id+']').html(num);
								style_change();
							}else{
								var str=("该商品限购"+maxCount+"件");
								common.prompt(str);
							}
						}else{
							var num=addgoods(id);
							$('span[dataid='+id+']').html(num);
							$('div[dataid='+id+']').html(num);
							style_change();
						}
					} else{
						var str="库存不足"
						common.prompt(str)
					}
				});
				//添加减少事件
				$('.car_min').on('click',function(){
					var id=$(this).parent().parent().attr('data');
					//num1当前商品数目 numb商品总数木
					var num=cutgoods(id);
					var numb=getgoodsNum();
					if (num=='0') {
						$('span[dataid='+id+']').html(num);
						$('div[dataid='+id+']').html(num);
						if (numb<'1') {
							$(".my_bg").hide();
							$(this).parent().parent().parent().find('li').remove();
							$('.goshoping_car').css('display','none');
							$('#gw_car').animate({
								bottom:26+"px"
							},500);
							$('.footer_car_left').animate({
								'text-indent':140
							},500);
						} else{
							$(this).parent().parent().remove();
							$('#gw_car').animate({
								bottom:($('.goshoping_car').height()+97)+"px"
							},500);
						}
					} else{
						$('span[dataid='+id+']').html(num);
						$('div[dataid='+id+']').html(num);
					}
					style_change();
				});
				$('.car_clear').on('click',function(){
					$('span[dataID]').html(0);
					$('div[dataid]').html(0);
					$(".my_bg").hide();
					$('.goshoping_car .car_main ul').find('li').remove();
					$('.goshoping_car').css('display','none');
					localStorage.removeItem('good');
					$('#gw_car').animate({
						bottom:26+"px"
					},500);
					$('.footer_car_left').animate({
						'text-indent':140
					},500);
					style_change();
				})
				$(this).animate({
					bottom:($('.goshoping_car').height()+97)+"px"
				},500)
				$('.footer_car_left').animate({
					'text-indent':20
				},500)
			} else{
				$('.goshoping_car').css("display","none");
				$('.goshoping_car .car_main ul').find('li').remove();
				$(".my_bg").hide();
				$(this).animate({
					bottom:26+"px"
				},500);
				$('.footer_car_left').animate({
					'text-indent':140
				},500);
			}
			$('.my_bg').on('click',function(){
				$('.goshoping_car').css("display","none");
				$('.goshoping_car .car_main ul').find('li').remove();
				$(".my_bg").hide();
				$('#gw_car').animate({
					bottom:26+"px"
				},500);
				$('.footer_car_left').animate({
					'text-indent':140
				},500);
			});
		});
		//显示购物车中的商品
		function car_goods(){
			arr=goodlist2();
			var html='';
			for (var i in arr) {
				html += '<li class="clearfloat" data="'+arr[i].goodsId+'" packageNum="'+arr[i].packageNum+'" maxCount="'+arr[i].maxCount+'">'
				html += '	<div class="car_left">'+arr[i].name+'</div>'
				html += '	<div class="car_right car_good clearfloat">'
				html += '		<span class="car_min">'
				html += '			<img src="../img/btn_m.png"/>'
				html += '		</span>'
				html += '		<span class="car_number fontColor" dataID="'+arr[i].goodsId+'">'+arr[i].count+'</span>'
				html += '		<span class="car_max">'
				html += '			<img src="../img/btn_a.png"/>'
				html += '		</span>'
				html += '	</div>'
				html += '</li>'
			}
			$('.goshoping_car .car_main ul').append(html);
		};
	};
})
