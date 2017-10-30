function lozyImg(){
	var ali = $(".lazy img");
	console.log(ali)
	ali.each(function(){
		$(this).load(function(){
			$(this).fadeIn()
		})
	})
}
$(document).ready(function(){
	var goodNum;
	var userId=common.user_data().cuserInfoid;
	var source="userId"+userId;
	var sign=md5(source+"key"+common.secretKey()).toUpperCase();
	//console.log(source+","+sign)
	var goodsId = undefined;
	//console.log(goodsId);
	//系统时间
	var systemTime="";
	//秒杀次数
   	var count="";
   	//定义分享数据
	var sharData = {
		/*tit:"果然好水果商城",
		link:"http://weixin.grhao.com/grhh5/html/seckillDetails.html",
		des:"描述11111111",
		imgUrl:'http://fanyi.baidu.com/static/translation/img/header/logo_cbfea26.png'*/
	};
	var url = location.search;
	//判断链接后的参数获取code
	if (url != '') {
		var str = url.substr(1).toLocaleUpperCase(),strs = str.split("&");
		for(var i = 0; i < strs.length; i++) {
			if (strs[i].split("=")[0]=="GOODSID") {
				goodsId = strs[i].split("=")[1];
				break;
			}
		}
	};
   	if (goodsId != undefined) {
   		goodsDetailsData(goodsId);
   	}else{
   		goodsId=sessionStorage.goodsId;
   		goodsDetailsData(goodsId);
   	};
	function goodsDetailsData(goodsId){
		$.ajax({
			url:common.http,
	        type:"post",
	        dataType:"jsonp",
	        data:{
				method:'goods_show',
				goodsId:goodsId
			},
			success:function(data){
				console.log(JSON.stringify(data));
				if (data.statusCode=="100000") {
					goodsDetailsShow(data)
					sharData = {
						title:data.data.goodsInfo.goodsName,
						desc:data.data.goodsInfo.goodsDescribe +"\n￥"+data.data.goodsInfo.nowPrice +"/"+data.data.goodsInfo.specInfo ,
					    link: location.href+"?goodsId="+goodsId, // 分享链接
					    imgUrl: data.data.goodsInfo.goodsLogo
					}
					//判断微信环境调用分享
					if (common.isWeiXin()) {
						weixin_config(location.href.split('#')[0]);
					}
				}
			},
			error:function(data){
				common.prompt(str)
			}
		})
	};
	var html='',html1='';
	function goodsDetailsShow(data){
		//banner
		var imgArr=data.data.goodsInfo.goodsPics.split('@');
		goodsBanner(imgArr);
		$(".goodsDetails_box1").data({
			"goodid":data.data.goodsInfo.id,
			"dataSpecInfo":data.data.goodsInfo.specInfo,
			"dataName":data.data.goodsInfo.goodsName,
			"dataPrice":data.data.goodsInfo.nowPrice,
			"dataLogo":data.data.goodsInfo.goodsLogo,
			"datasecBuyNum":data.data.secBuyNum
		})
		//倒计时
		system_time = seckill_time(data.data.killGoodsDetail.newDate)
		$(".seckill_details_time").attr("time",(seckill_time(data.data.killGoodsDetail.startTime) - seckill_time(data.data.killGoodsDetail.newDate)));
		countDown()
		//展示商品信息
		$('.gd_goodName').html(data.data.goodsInfo.goodsName);
		$('.gd_specification').html(data.data.goodsInfo.specInfo);		
		$('.gd_price').html('<span>￥'+data.data.goodsInfo.nowPrice+'</span>&nbsp;&nbsp;<del>￥'+data.data.goodsInfo.nomalPrice+'</del>');
		if (data.data.killGoodsDetail.startTime.replace(/\-/g, "\/")>data.data.killGoodsDetail.newDate.replace(/\-/g, "\/")) {
			$('.gd_number button').addClass("float_right").html("即将开始");
		} else{
			$('.gd_number button').addClass("float_right1").html("立即秒杀");
		};
		if (data.data.goodsInfo.goodsContext) {
			$('.goodsDetails_box2_').show().html(data.data.goodsInfo.goodsContext);
		}
		style_change()
	};
	//展示商品图片
	function goodsBanner(imgArr){
		
		var arr1=[];
		//console.log(data.data.goodsInfo.goodsPics.split('@').length)
		for (var i in imgArr) {
			if(imgArr[i]!=''){
				arr1.push(imgArr[i])
			}
		};
		for (var j in arr1) {
			html += '<div class="swiper-slide lazy"><img src="'+arr1[j]+'" /></div>'
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
		lozyImg()
	};
	//返回按钮
	$(".header_left").on('click',function(){
		window.location.href = "seckill.html";
	});
	/*秒杀倒计时计算*/
	function seckill_time(time){
		return new Date(time.replace(/\-/g, "\/")).getTime();
	};
	/*给时间差计算天时分秒*/
	function get_time(time){
		if (time > 0) {
			var days = Math.floor(time/(24*60*60*1000));
			var hous = Math.floor(time/(60*60*1000)) - days * 24;
			var min = Math.floor(time/(60*1000)) - days*24*60 - hous * 60;
			var sec = Math.floor(time/1000) - days*24*60*60 -hous*60*60 -min*60;
			return days+"天"+hous+"小时"+min+"分"+sec+"秒";
		}
	}
	function countDown(){
		var time,_this,cle;
		var list = $(".seckill_details_time");
		setInterval(function(){
			var system_now_time = new Date().getTime();
			var time_difference = system_now_time - system_time;
			var time;
			list.each(function(){
				_this = $(this);
				time = _this.attr("time");
				if((time - time_difference)<0){
					_this.html("倒计时：0天0时0分0秒").css("color","red");
					var str = _this.attr('id');
					$(".goodsDetails_box1 .good_box1_box1 .float_right").html("立即秒杀").addClass("float_right1");
				}else{
					_this.html("倒计时："+get_time((time - time_difference))).css("color","red");
				}
			})
		},1000)
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
								var num=addgoods(id);
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
	//点击提交本地购物车商品列表结算购物车
	$('.footer_car_rigth').on('click',function(){
		var goodsList=goodlist1();
		userId=common.user_data().cuserInfoid;
		var source="userId"+userId;
		var sign=md5(source+"key"+common.secretKey()).toUpperCase();
		//console.log(source+","+sign)
		//console.log(userId+","+goodsList);
		if (common.getIslogin()) {
			localStorage.setItem("orderType","1");
			settlement_cart(userId,goodsList,sign,source);
		}else{
			localStorage.setItem("jumpMake","9");
			location.href='login.html';
		};
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
				console.log(JSON.stringify(data));
				if (data.statusCode=="100000") {
					//console.log(JSON.stringify(data));
					localStorage.setItem("orderType","1");
					sessionStorage.setItem("setBack","2");
					window.location.href="order_set_charge.html";
				}else{
					common.prompt(data.statusStr);
				}
			},
			error:function(data){
				
			}
		});
	};
    //获取秒杀次数
    /*function getSkillCount(userId,sign,source){
    	$.ajax({
    		url:common.http,
    		dataType:'jsonp',
    		data:{
    			method:"user_kill_chance",
    			userId:userId,
    			tokenId:common.tokenId(),
    			sign:sign,
    			source:source
    		},
    		success:function(data){
    			//console.log(JSON.stringify(data))
    			if (data.statusCode=="100000") {
    				if (data.data) {
			    		count=data.data.count;
			    	}else{
			    		count = "0";
			    	}
			    	$('.seckill_notice span').html(count);
    			}
    		},
    		error:function(data){
    	        common.comprot(data.statusStr);
    		}
    	})
    };*/
   /*if (common.getIslogin()) {
    	getSkillCount(userId,sign,source)
    };   */
    //获取系统时间
    function system(){
    	$.ajax({
    		url:common.http,
    		dataType:'jsonp',
    		data:{
    			method:"system_config_constant"
    		},
    		success:function(data){
    			if (data.statusCode=="100000") {
    				systemTime=data.data.system_current_time;
    				//console.log(systemTime)
    			}
    		},
    		error:function(data){
    	        common.comprot(data.statusStr)
    		}
    	})
    };
    
	//判断是否可以换购
	$('.goodsDetails_box1').on('click',".float_right1",function(e){
		common.stopEventBubble(e);
		if (common.getIslogin()) {
			var seckill_good={
			    id:$(".goodsDetails_box1").data('goodid'),
			    name:$(".goodsDetails_box1").data('dataName'),
			    price:$(".goodsDetails_box1").data('dataPrice'),
			    specifications:$(".goodsDetails_box1").data('dataSpecInfo'),
			    logo:$(".goodsDetails_box1").data('dataLogo'),
			    count:"1"/*,
			    secBuyNum:$(".goodsDetails_box1").getData('datasecBuyNum')*/
		    }
			var goodsId = $(".goodsDetails_box1").data("goodid");;
			console.log(goodsId)
			seckill_submit(userId,goodsId,sign,source,seckill_good);
			/*localStorage.setItem("orderType","2");
		    sessionStorage.setItem('seckillGood',JSON.stringify(seckill_good));
		    sessionStorage.setItem("setBack","3");
		    setTimeout(function(){
				window.location.href='order_set_charge.html';
			},500);*/
		}else{
			localStorage.setItem("jumpMake","3");
			window.location.href="login.html";
		}
	});
	//秒杀商品提交
	function seckill_submit(userId,goodsId,sign,source,seckill_good){
		$.ajax({
    		url:common.http,
			dataType:'jsonp',
    		data:{
    			method:'click_kill',
    			userId:userId,
    			goodsId:goodsId,
    			tokenId:common.tokenId(),
    			sign:sign,
    			source:source
    		},
    		success:function(data){
    			console.log(JSON.stringify(data))
    			if(data.statusCode == "100000"){
    				addgoods(seckill_good.id,seckill_good.name,seckill_good.price,seckill_good.logo,seckill_good.specifications,seckill_good.count);
    				console.log(goodlist2())
    				style_change()
    				common.prompt("秒杀成功！")
    			}else if (data.statusCode == "100610"){
    				common.prompt(data.statusStr)
    			}
    		},
    		error:function(data){
    			common.prompt(data.strStatus);
    		}
    	})
	}
	//返回顶部
	window.onscroll=function(){
		var scroll=document.body.scrollTop || window.pageYOffset || document.documentElement.scrollTop;
		if(scroll>=600){				
			$('.toTop').show();			
		}else{
			$('.toTop').hide();
		}
	};	
	$('.toTop').on('click',function(){
		$('html,body').animate({
			scrollTop:0
		},500) 
	});
	/*微信分享*/
	function weixin_config(str){
		$.ajax({
			url:common.http,
			type:"post",
	        dataType:"jsonp",
	        data:{
	        	method:"weixin_config",
	        	url:str
			}, 
			success:function(data){
				if(data.statusCode == '100200'){
					alert("操作异常，请重新操作!");
				}else if(data.statusCode == '100000'){
					var result = data.data;
					var appId = result.appId;
					var signature = result.signature;
					var timestamp = result.timestamp;
					var nonceStr = result.nonceStr;
					//alert("sussess"+JSON.stringify(result));
					wx.config({
					    debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
					    appId: appId, // 必填，公众号的唯一标识
					    timestamp:timestamp, // 必填，生成签名的时间戳
					    nonceStr: nonceStr, // 必填，生成签名的随机串
					    signature: signature,// 必填，签名，见附录1
					    jsApiList: ["onMenuShareTimeline","onMenuShareAppMessage","onMenuShareQQ","onMenuShareQZone","hideMenuItems"] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
					});
					wx.error(function(res){
						//alert(JSON.stringify(res))
					    // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
					});
					wx.ready(function(){
						wx.onMenuShareTimeline({	//分享到朋友圈
						    title: sharData.title, // 分享标题
						    link: sharData.link +"?goodsId="+goodsId, // 分享链接
						    imgUrl: sharData.imgUrl, // 分享图标
						    success: function () { 
						        // 用户确认分享后执行的回调函数
						        //alert("01_success")
						    },
						    cancel: function () { 
						        // 用户取消分享后执行的回调函数;
						        //alert("01_cancel")
						    }
						});
						wx.onMenuShareAppMessage({	//分享给朋友
						    title: sharData.title, // 分享标题
						    desc:sharData.desc,
						    link: sharData.link +"?goodsId="+goodsId, // 分享链接
						    imgUrl: sharData.imgUrl, // 分享图标
						    success: function () { 
						        // 用户确认分享后执行的回调函数
						        //alert("02_success")
						    },
						    cancel: function () { 
						        // 用户取消分享后执行的回调函数
						        //alert("02_cancel")
						    }
						});
						wx.onMenuShareQQ({
						   	title: sharData.title, // 分享标题
						    desc:sharData.desc,
						    link: sharData.link +"?goodsId="+goodsId, // 分享链接
						    imgUrl: sharData.imgUrl, // 分享图标
						    success: function () { 
						       // 用户确认分享后执行的回调函数
						       //alert("03_success")
						    },
						    cancel: function () { 
						       // 用户取消分享后执行的回调函数
						       //alert("03_cancel")
						    }
						});
						wx.onMenuShareQZone({
						    title: sharData.title, // 分享标题
						    desc:sharData.desc,
						    link: sharData.link +"?goodsId="+goodsId, // 分享链接
						    imgUrl: sharData.imgUrl, // 分享图标
						    success: function () { 
						       // 用户确认分享后执行的回调函数
						       //alert("04_success")
						    },
						    cancel: function () { 
						        // 用户取消分享后执行的回调函数
						        //alert("04_cancel")
						    }
						});
					});
				};
			},
			error:function(data){
				//alert("error"+JSON.stringify(data))
				alert("分享插件升级中。。。");
			}
		});
	};
})
