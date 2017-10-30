define(function(require, exports, module){
	require('jquery');
	var common = require('lib/common');
	require('mdData');
	require('./goshop_car');
	//require('weixin');
	require('swiper');

	var userId;
	var goodNum;
	var isTrue = false;//true链接；false本地存储
	//链接返回的商品Id
	var type;
	//商品Id
	var goodsId;
	// $(".goodsDetails_img_box").height( $(".goodsDetails_img_box").width() );
	//获取链接过来的商品Id
	/*var test=location.href.toUpperCase();
	var words=test.split("#");	
	isLink()
	function isLink(){
		for(var i=1;i<words.length;i++){
			if(String(words[i]).indexOf('GOODSID')!=-1){
				isTrue=true;
				type=words[i].substring(words[i].indexOf('=') + 1);				
				return  type;
			}
		}
	}
	if (isTrue) {
		goodsDetailsData(type);
	}else{
		goodsId=sessionStorage.goodid;		
		goodsDetailsData(goodsId);
	}*/
	//商品详情数据请求
	/*function goodsDetailsData(goodsId){
		$.ajax({
			url:common.http,
	        type:"post",
	        dataType:"jsonp",
	        data:{
				method:'goods_show',
				goodsId:goodsId
			},
			success:function(data){
				//console.log(JSON.stringify(data));
				goodsDetailsShow(data)
			},
			error:function(data){
				common.prompt(str)
			}
		});
	};*/
	
	
	/*function goodsDetailsShow(data){
		//banner
		var d = data.data.goodsInfo;
		var imgArr = d.goodsPics.split('@');
		goodsBanner(imgArr);
		//本地商品数量
		goodNum = callbackgoodsnumber(d.id);
		//console.log(goodNum)
		if (goodNum) {
			$(".gd_number .minus_num").show();
			$('.gd_number .show_num').show().html(goodNum);
		} else if (goodNum == '0') {
			if (d.packageNum<="0") {
				$(".gd_number").html("已售罄").css({"color":"#FFFFFF",'background':'red','text-align':'center','line-height':$(".gd_number").height()+'px'});
			} else{
				$(".gd_number .minus_num").hide();
				$('.gd_number .show_num').hide().html(goodNum);
			}
		};
		$('.show_num').attr("dataId",d.id);
		//添加存储数据到元素
		$('.good_box1_box1').attr('data',d.id);
		$('.good_box1_box1').attr('dataname',d.goodsName);
		$('.good_box1_box1').attr('dataprice',d.nowPrice);
		$('.good_box1_box1').attr('datalogo',d.goodsLogo);
		$('.good_box1_box1').attr('dataspecInfo',d.specInfo);
		$('.good_box1_box1').attr('datamax',d.maxBuyNum);
		$('.good_box1_box1').attr('datapackagenum',d.packageNum);
		$('.good_box1_box1').attr('purchaseQuantity',d.purchaseQuantity);
		//展示商品信息
		$('.gd_goodName').html(d.goodsName);
		$('.gd_specification').find(".float_left").html("规格："+d.specInfo);
		//判断最低起售份数
		if (d.purchaseQuantity=="" || d.purchaseQuantity=="0") {
			
		}else{
			$('.gd_specification').find(".float_right").show().html(d.purchaseQuantity+"份起售").css("color","red");
		}
		$('.gd_price').html('<span>￥'+d.nowPrice+'</span>&nbsp;&nbsp;<del>￥'+d.nomalPrice+'</del>');
		$(".gd_goodsDescribe").html(d.goodsDescribe);
		if (d.goodsContext) {
			$('.goodsDetails_box2_').show().html(d.goodsContext);
			//$('.goodsDetails_box2_').find("p").css("line-height","46px");
		};
	};*/
	
	//展示商品图片
	/*function goodsBanner(imgArr){
		var html='';
		var arr1=[];
		//console.log(data.data.goodsPics.split('@').length)
		for (var i in imgArr) {
			if(imgArr[i]!=''){
				arr1.push(imgArr[i])
			};
		};
		for (var j in arr1) {
			html += '<div class="swiper-slide"><img src="'+arr1[j]+'" /></div>'
			//console.log(i)
		};
		$(".goodsDetails_img_box .swiper-wrapper").append(html);
		var mySwiper = new Swiper ('.goodsDetails_img_box', {
		    direction: 'horizontal',
		    loop: true,
		    autoplay:5000,
		    paginationClickable:true,
		    autoplayDisableOnInteraction : false,
		    // 如果需要分页器
		    pagination: '.swiper-pagination'
		});
	};*/
	
	//增加商品
	$(".good_box1_box1").on('click','.add_num',function(){
		//var data,dataprice,dataname,datalogo,dataspecInfo,datamax;
		var 
		ele = $(this).parent().parent(),
		data = ele.attr("data"),
		dataname = ele.attr("dataname"),
		dataprice = ele.attr("dataprice"),
		datalogo = ele.attr("datalogo"),
		dataspecInfo = ele.attr("dataspecInfo"),
		datamax = ele.attr("datamax"),
		//console.log(datamax)
		datapackagenum=ele.attr("datapackagenum"),
		goodNum=callbackgoodsnumber(data);
		//先判断库存和限购  在执行加操作
		if (goodNum<datapackagenum) {
			if(datamax != '0' && datamax !=""){
				if(goodNum < datamax){
					var num1=addgoods(data,dataname,dataprice,datalogo,dataspecInfo,datamax,datapackagenum);
					if (num1==1) {
						$(this).siblings().css('display','inline-block');
						$(this).siblings().eq(1).html(num1)
					}else{
						$(this).siblings().eq(1).html(num1)
					}
					sport($(this))
				}else{
					common.prompt("该商品限购"+datamax+"件")
				}
			}else{
				var num1=addgoods(data,dataname,dataprice,datalogo,dataspecInfo,datamax,datapackagenum);
				if (num1==1) {
					$(this).siblings().css('display','inline-block')
				}
				$(this).siblings().eq(1).html(num1);
				sport($(this));
			}
		} else{
			common.prompt("库存不足")
		}
	})
	//减少商品
	$(".good_box1_box1").on('click','.minus_num',function(){
		//console.log("减");
		var id=$(this).parent().parent().attr("data");
		var num1=cutgoods(id);
		//console.log(price)
		if (num1<'1') {
			$(this).siblings().eq(0).css("display","none");
			$(this).css("display","none");
		} else{
			$(this).siblings().eq(0).html(num1);
		}
		style_change();
	})
	//对商品数目的事件监听
	$('.good_box1_box1').on('DOMNodeInserted','.show_num',function(){
		if ($(this).html()==0) {
			$(this).siblings().eq(0).css('display','none');
			$(this).css('display',"none");
		} else{
			$(this).siblings().css('display','inline-block');
			$(this).css('display',"inline-block");
		}
		style_change();
	})
	
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
				};
				//添加点击增加事件
				$('.car_max').on('click',function(){
					id=$(this).parent().parent().attr('data');
					packageNum=$(this).parent().parent().attr('packageNum');
					maxCount=$(this).parent().parent().attr('maxCount');
					var numList=$(this).siblings().eq(1).text();
					packageNum=parseInt(packageNum);
					numList=parseInt(numList);
					//console.log(numList);
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
							var num=addgoods(id)
							$('span[dataid='+id+']').html(num);
							$('div[dataid='+id+']').html(num);
							style_change();
						}
					} else{
						var str="库存不足";
						common.prompt(str);
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
							},500)
						};
					} else{
						$('span[dataid='+id+']').html(num);
						$('div[dataid='+id+']').html(num);
					};
					style_change();
				})
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
				});
				$(this).animate({
					bottom:($('.goshoping_car').height()+97)+"px"
				},500);
				$('.footer_car_left').animate({
					'text-indent':20
				},500);
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
			};
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
	//点击加号按钮加入购物车动画
	function sport(obj){
		var xEnd=$(".gw_car_num").offset().left+$(".gw_car_num").width()/4;
		var yEnd=$(".gw_car_num").offset().top-$(".gw_car_num").height()/4;
		var xStar,yStar;
		xStar=obj.offset().left+obj.width()/4;
		yStar=obj.offset().top;
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
		});
	};
	//返回按钮
	/*$(".header_left").on('click',function(){
		window.history.back();
	});	*/
	//点击提交本地购物车商品列表结算购物车
	/*$('.footer_car_rigth').on('click',function(){
		var goodsList=goodlist1();
		userId=common.user_data().cuserInfoid;
		var source="userId"+userId;
		var sign=md5(source+"key"+common.secretKey()).toUpperCase();
		//console.log(source+","+sign)
		//console.log(userId+","+goodsList);
		if (common.getIslogin()) {
			localStorage.setItem("orderType","1")
			settlement_cart(userId,goodsList,sign,source);
		}else{
			location.href='login.html';
		};
	});*/
	//选好了函数
	/*function settlement_cart(userId,goodsList,sign,source){
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
					sessionStorage.setItem("setBack","2");
					window.location.href="order_set_charge.html";
				}else{
					common.prompt(data.statusStr)
				}
			},
			error:function(data){
				
			}
		});
	};*/		
	//返回顶部
	/*window.onscroll=function(){

		var scroll = document.body.scrollTop || window.pageYOffset || document.documentElement.scrollTop;
		if( scroll >= 600){				
			$('.toTop').css({'display':'block'});			
		}else{
			$('.toTop').css({'display':'none'});
		}
	};	


	$('.toTop').on('click',function(){
		$('html,body').animate({
			scrollTop : 0
		},500); 
	});*/


})