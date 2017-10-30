define(function(require, exports, module){
	require('jquery');
	var common = require('../lib/common');
	var weixin = require('../lib/weixin');
	//require('weixin');
	require('lib/goshop_car');
	require('mdData');
	require('swiper');


	//定义系统时间
	var system_time ;
	var userId=common.user_data().cuserInfoid;
    var source="userId"+userId;
	var sign=md5(source+"key"+common.secretKey()).toUpperCase();
	var orderType=2;
	//console.log(source+","+sign)
	//定义分享数据
	var sharData = {
		/*tit:"果然好水果商城",
		link:"http://weixin.grhao.com/grhh5/html/seckill.html",
		des:"描述11111111",
		imgUrl:'http://fanyi.baidu.com/static/translation/img/header/logo_cbfea26.png'*/
	};
    //获取换购次数
    function getSkillCount(userId,sign,source){
    	$.ajax({
    		url:common.http,
    		dataType:'jsonp',
    		data:{
    			method:"user_barter_chance",
    			userId:userId/*,
    			tokenId:common.tokenId(),
    			sign:sign,
    			source:source*/
    		},
    		success:function(data){
    			console.log(JSON.stringify(data))
    			if (data.statusCode=="100000") {
    				var count="";
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
    };
    if (common.getIslogin()) {
    	getSkillCount(userId,sign,source);
    }else{
    	$('.seckill_notice span').html("0");
    };    
    //秒杀商品接口
	function seckillListData(){
		$.ajax({
			url:common.http,
	        type:"post",
	        dataType:"jsonp",
	        data:{
				method:'kill_goods_list'
			},
			success:function(data){
				//console.log(JSON.stringify(data));
				if (data.statusCode=="100000") {
					seckillShow(data);
					sharData = data.data.customShare;
					//判断微信环境调用分享
					common.isWeiXin() && weixin.weixin_config(location.href.split('#')[0]);
					
				}
			},
			error:function(data){
				common.prompt(str);
			}
		})
	};
	//换购商品接口
	function buyListData(){
		$.ajax({
			url:common.http,
	        type:"post",
	        dataType:"jsonp",
	        data:{
				method:'barter_list',
				pageSize:common.pageSize,
				pageNo:common.pageNo
			},
			success:function(data){
				console.log(JSON.stringify(data));
				if (data.statusCode=="100000") {
					buyShow(data);
					//sharData = data.data.customShare;
					//判断微信环境调用分享
					/*if (common.isWeiXin()) {
						weixin_config(location.href.split('#')[0]);
					}*/
				}
			},
			error:function(data){
				common.prompt(str);
			}
		})
	};
	//秒杀显示
	function seckillShow(data){
		//秒杀banner
		console.log(JSON.stringify(data.data.adInfoList))
		common.bannerShow(data.data.adInfoList,1);
		//console.log(JSON.stringify(data.data.killGoodsDetailList[1].goodsLogos));
        var html='',html2="";
        //console.log(data.data.pastKillGoodsDetailList instanceof Array)
        if (data.data.killGoodsDetailList instanceof Array  && data.data.killGoodsDetailList.length != 0) {
        	system_time = seckill_time(data.data.killGoodsDetailList[0].newDate)
        	for(var i in data.data.killGoodsDetailList){
	       	    html+='<ul class="seckill_main_box_tit">'
	       	    //html+=	'<li>'+data.data.killGoodsDetailList[i].startTime+'</li>'
	       	    html+=	'<li id = "cl'+i+'" time = "'+(seckill_time(data.data.killGoodsDetailList[i].startTime) - seckill_time(data.data.killGoodsDetailList[i].newDate))+'">倒计时</li>'
	       	    html+='</ul>'
	       	    html+='<div class="seckill_main_box_center">'
	       	    html+='<dl class="clearfloat" dataId="'+data.data.killGoodsDetailList[i].id+'" goodid="'+data.data.killGoodsDetailList[i].goods+'" dataSpecInfo="'+data.data.killGoodsDetailList[i].goodsInfo.specInfo+'" dataName="'+data.data.killGoodsDetailList[i].goodsInfo.goodsName+'" dataPrice="'+data.data.killGoodsDetailList[i].nowPrice+'" dataLogo="'+data.data.killGoodsDetailList[i].goodsInfo.goodsLogo+'" datasecBuyNum="'+data.data.killGoodsDetailList[i].secBuyNum+'">'
	     	    html+='<dt><img src="'+data.data.killGoodsDetailList[1].goodsLogos+'"></dt>'
	       	    html+='<dd>'
	       	    html+='<div class="sekill_good_name">'+data.data.killGoodsDetailList[i].goodsInfo.goodsName+'</div>'
	       	    html+='<div class="sekill_good_specifications">'+data.data.killGoodsDetailList[i].goodsInfo.specInfo+'</div>'
	       	    html+='<div class="sekill_good_specifications1">'+data.data.killGoodsDetailList[i].goodsInfo.goodsDescribe+'</div>'
	       	    html+='<div class="sekill_good_bottom clearfloat">'
	       	    html+='<div class="float_left">'
	       	    html+='<span class="new_price font_color">￥'+data.data.killGoodsDetailList[i].nowPrice+'</span>'
	       	    html+='<span class="old_price">￥'+data.data.killGoodsDetailList[i].otherPrice+'</span>'           	    
	       	    html+='</div>'
	       	    if (data.data.killGoodsDetailList[i].startTime.replace(/\-/g, "\/")>data.data.killGoodsDetailList[i].newDate.replace(/\-/g, "\/")) {
	       	    	html+='<div class="float_right cl'+i+'">即将开始</div>'
	       	    } else{
	       	    	if (data.data.killGoodsDetailList[i].secBuyNum <= 0) {
	       	    		html+='<div class="float_right">秒杀光了</div>'
	       	    	}else{
	       	    		html+='<div class="float_right float_right1">立即秒杀</div>'
	       	    	}
	       	    }
	       	    html+='</div>'   
	       	    html+='</dd>'
	       	    html+='</dl>'           	   
	       	    html+='</div>'
	        };
	        $(".seckill_box1 .seckill_main_box_today").show();
	        $('.seckill_box1 .seckill_main_box_today_wrap').append(html);
        } else{
        	$(".seckill_box1 .seckill_main_box_today").hide();
        };
        
        if (data.data.pastKillGoodsDetailList instanceof Array  && data.data.pastKillGoodsDetailList.length != 0) {
        	for(var i in data.data.pastKillGoodsDetailList){
	       	    html2+='<div class="seckill_main_box_tit">'+data.data.pastKillGoodsDetailList[i].startTime.substring(0,16)+'</div>'
	       	    html2+='<div class="seckill_main_box_center">'
	       	    html2+='<dl class="clearfloat" dataId="'+data.data.pastKillGoodsDetailList[i].id+'" goodid="'+data.data.pastKillGoodsDetailList[i].goods+'" dataSpecInfo="'+data.data.pastKillGoodsDetailList[i].goodsInfo.specInfo+'" dataName="'+data.data.pastKillGoodsDetailList[i].goodsInfo.goodsName+'" dataPrice="'+data.data.pastKillGoodsDetailList[i].nowPriceStr+'" dataLogo="'+data.data.pastKillGoodsDetailList[i].goodsLogos+'">'
	     	    html2+='<dt><img src="'+data.data.pastKillGoodsDetailList[i].goodsInfo.goodsLogo+'"></dt>'
	       	    html2+='<dd>'
	       	    html2+='<div class="sekill_good_name">'+data.data.pastKillGoodsDetailList[i].goodsInfo.goodsName+'</div>'
	       	    html2+='<div class="sekill_good_specifications">'+data.data.pastKillGoodsDetailList[i].goodsInfo.specInfo+'</div>'
	       	    html2+='<div class="sekill_good_specifications1">'+data.data.pastKillGoodsDetailList[i].goodsInfo.goodsDescribe+'</div>'
	       	    html2+='<div class="sekill_good_bottom clearfloat">'
	       	    html2+='<div class="float_left">'
	       	    html2+='<span class="new_price font_color">￥'+data.data.pastKillGoodsDetailList[i].nowPrice+'</span>'
	       	    html2+='<span class="old_price">￥'+data.data.pastKillGoodsDetailList[i].otherPrice+'</span>'           	    
	       	    html2+='</div>'
	       	    if (data.data.pastKillGoodsDetailList[i].startTime.replace(/\-/g, "\/")>data.data.pastKillGoodsDetailList[i].newDate.replace(/\-/g, "\/")) {
	       	    	//html2+='<div class="float_right">即将开始</div>'
	       	    } else{
	       	    	//html2+='<div class="float_right1">立即秒杀</div>'
	       	    }
	       	    html2+='</div>'   
	       	    html2+='</dd>'
	       	    html2+='</dl>'           	   
	       	    html2+='</div>'
	        };
	        $('.seckill_box1 .seckill_main_box_tomorrow').show();
	        
	        $('.seckill_box1 .seckill_main_box_tomorrow_wrap').show().append(html2);
        } else{
        	$(".seckill_box1 .seckill_main_box_tomorrow").hide();
        }
       	countDown();
	};
	//换购显示
	function buyShow(data){
		common.bannerShow(data.data.adInfoList,2);
		//console.log(JSON.stringify(data.data.pagination.objects[0].goodsLogos));
        var html='',html2="";
        //console.log(data.data.pastKillGoodsDetailList instanceof Array)
        if (data.data.pagination.objects instanceof Array  && data.data.pagination.objects.length != 0) {
        	//html2+='<div class="seckill_main_box_tit">本期换购</div>'
        	for(var i in data.data.pagination.objects){
	       	    html+='<div class="seckill_main_box_center">'
	       	    html+='<dl class="clearfloat" dataId="'+data.data.pagination.objects[i].id+'" goodid="'+data.data.pagination.objects[i].goodsId+'" dataSpecInfo="'+data.data.pagination.objects[i].specInfo+'" dataName="'+data.data.pagination.objects[i].goodsName+'" dataPrice="'+data.data.pagination.objects[i].nowPrice+'" dataLogo="'+data.data.pagination.objects[i].goodsLogo+'" datamaxNum="'+data.data.pagination.objects[i].buyNumber+'" datapackageNum="'+data.data.pagination.objects[i].packageNum+'">'
	     	    html+='<dt><img src="'+data.data.pagination.objects[i].goodsLogo+'"></dt>'
	       	    html+='<dd>'
	       	    html+='<div class="sekill_good_name">'+data.data.pagination.objects[i].goodsName+'</div>'
	       	    html+='<div class="sekill_good_specifications">'+data.data.pagination.objects[i].specInfo+'</div>'
	       	    html+='<div class="sekill_good_specifications1">'+data.data.pagination.objects[i].goodsDescribe+'</div>'
	       	    html+='<div class="sekill_good_bottom clearfloat">'
	       	    html+='<div class="float_left">'
	       	    html+='<span class="new_price font_color">￥'+data.data.pagination.objects[i].nowPrice+'</span>'
	       	    html+='<span class="old_price">￥'+data.data.pagination.objects[i].nowPrice+'</span>'           	    
	       	    html+='</div>'
	       	    if (data.data.pagination.objects[i].packageNum >= 0) {
	       	    	html+='<div class="float_right float_right1 float_right2">立即换购</div>'
	       	    }else{
	       	    	html+='<div class="float_right">没有了</div>'
	       	    }
	       	    html+='</div>'   
	       	    html+='</dd>'
	       	    html+='</dl>'           	   
	       	    html+='</div>'
	        };
	        $(".seckill_box2 .seckill_main_box_today").show();
	        $('.seckill_box2 .seckill_main_box_today_wrap').append(html);
        } else{
        	$(".seckill_box2 .seckill_main_box_today").hide();
        };
        if (data.data.oldBarterGoodsList instanceof Array  && data.data.oldBarterGoodsList.length != 0) {
        	//html2+='<div class="seckill_main_box_tit">往期换购</div>'
        	for(var i in data.data.oldBarterGoodsList){
	       	    html2+='<div class="seckill_main_box_center">'
	       	    html2+='<dl class="clearfloat" dataId="'+data.data.oldBarterGoodsList[i].id+'" goodid="'+data.data.oldBarterGoodsList[i].goods+'" dataSpecInfo="'+data.data.oldBarterGoodsList[i].specInfo+'" dataName="'+data.data.oldBarterGoodsList[i].goodsName+'" dataPrice="'+data.data.oldBarterGoodsList[i].nowPriceStr+'" dataLogo="'+data.data.oldBarterGoodsList[i].goodsLogos+'">'
	     	    html2+='<dt><img src="'+data.data.oldBarterGoodsList[i].goodsLogo+'"></dt>'
	       	    html2+='<dd>'
	       	    html2+='<div class="sekill_good_name">'+data.data.oldBarterGoodsList[i].goodsName+'</div>'
	       	    html2+='<div class="sekill_good_specifications">'+data.data.oldBarterGoodsList[i].specInfo+'</div>'
	       	    html2+='<div class="sekill_good_specifications1">'+data.data.oldBarterGoodsList[i].goodsDescribe+'</div>'
	       	    html2+='<div class="sekill_good_bottom clearfloat">'
	       	    html2+='<div class="float_left">'
	       	    html2+='<span class="new_price font_color">￥'+data.data.oldBarterGoodsList[i].nowPrice+'</span>'
	       	    html2+='<span class="old_price">￥'+data.data.oldBarterGoodsList[i].nowPrice+'</span>'           	    
	       	    html2+='</div>'
	       	    html2+='</div>'   
	       	    html2+='</dd>'
	       	    html2+='</dl>'           	   
	       	    html2+='</div>'
	        };
	        $('.seckill_box2 .seckill_main_box_tomorrow').show();
	        $('.seckill_box2 .seckill_main_box_tomorrow_wrap').show().append(html2);
        } else{
        	$(".seckill_box2 .seckill_main_box_tomorrow").hide();
        }
	}
	
	$(".seckill_box1").show();
	seckillListData();
	$(".seckill_tab_box li").on("click",function(){
		console.log($(this).index())
		$(this).css({"background":"white","color":"rgb(51,51,51)"}).siblings().css({"background":"#e7e7e7","color":"rgb(178,178,178)"});
		if ($(this).index() == 0) {
			$(".seckill_box1").show();
			$(".footer_wrap").show();
			$(".seckill_box2").hide();
			seckillListData();
		} else if($(this).index() == 1){
			$(".seckill_box1").hide();
			$(".footer_wrap").hide();
			$(".seckill_box2").show();
			buyListData();
		}
	})
	//点击跳转秒杀详情
	$('.seckill_box1 .seckill_main').on('click','dl',function(){
		sessionStorage.setItem("goodsId",$(this).attr("goodid"));
		var seckill_good=[{
		    id:$(this).attr('dataId'),
		    name:$(this).attr('dataName'),
		    price:$(this).attr('dataPrice'),
		    specifications:$(this).attr('dataSpecInfo'),
		    logo:$(this).attr('dataLogo'),
		    count:"1",
		    secBuyNum:$(this).attr('datasecBuyNum')
	    }];
		window.location.href='seckillDetail.html';
	});
	//点击跳转换购详情
	$('.seckill_box2 .seckill_main').on('click','dl',function(){
		sessionStorage.setItem("goodsId",$(this).attr("dataid"));
		var seckill_good=[{
		    id:$(this).attr('dataId'),
		    name:$(this).attr('dataName'),
		    price:$(this).attr('dataPrice'),
		    specifications:$(this).attr('dataSpecInfo'),
		    logo:$(this).attr('dataLogo'),
		    count:"1",
		    secBuyNum:$(this).attr('datasecBuyNum')
	    }];
		window.location.href='seckillDetaila.html';
	});
	//点击秒杀
	$('.seckill_box1 .seckill_main').on('click','.float_right',function(e){
		common.stopEventBubble(e);
		if ($(this).html()  == "立即秒杀") {
			if (common.getIslogin()) {
				var seckill_good={
				    id:$(this).parent().parent().parent().attr('goodId'),
				    name:$(this).parent().parent().parent().attr('dataName'),
				    price:$(this).parent().parent().parent().attr('dataPrice'),
				    specifications:$(this).parent().parent().parent().attr('dataspecinfo'),
				    logo:$(this).parent().parent().parent().attr('dataLogo'),
				    count:"1"/*,
				    secBuyNum:$(this).parent().parent().parent().attr('datasecBuyNum')*/
			    }
				var goodsId = $(this).parent().parent().parent().attr('goodId');
				console.log(seckill_good.specifications)
				seckill_submit(userId,goodsId,sign,source,seckill_good);
				/*localStorage.setItem("orderType","2");
			    sessionStorage.setItem('seckillGood',JSON.stringify(seckill_good));
			    sessionStorage.setItem("setBack","3");
			    setTimeout(function(){
					window.location.href='order_set_charge.html';
				},500);*/
			}else{
				localStorage.setItem("jumpMake","2");
				window.location.href="login.html";
			}	
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
	//点击换购
	$('.seckill_box2 .seckill_main').on('click','.float_right',function(e){
		common.stopEventBubble(e);
		var countNum=$('.seckill_notice span').html();
		//console.log(countNum)
		if (common.getIslogin()) {
			if(countNum>0){
				var seckill_good=[{
				    id:$(this).parent().parent().parent().attr('dataId'),
				    name:$(this).parent().parent().parent().attr('dataName'),
				    price:$(this).parent().parent().parent().attr('dataPrice'),
				    specifications:$(this).parent().parent().parent().attr('dataspecinfo'),
				    logo:$(this).parent().parent().parent().attr('dataLogo'),
				    count:"1"
			    }]
				localStorage.setItem("orderType","2");
			    sessionStorage.setItem('seckillGood',JSON.stringify(seckill_good));
			    sessionStorage.setItem("setBack","3");
			    setTimeout(function(){
					window.location.href='order_set_charge.html';
				},500);
			}else{
				var str="购物满69元才有机会哟!";
				common.prompt(str);
			}
		}else{
			localStorage.setItem("jumpMake","2");
			window.location.href="login.html";
		}
	});
	//点击返回
	$(".header_left").on('click',function(){
		window.location.href = "../index.html"
	});
	//换购规则请求
	contact("MSGZ-DESC");
    function contact(code){
    	$.ajax({
    		url:common.http,
			dataType:'jsonp',
    		data:{
    			method:'grh_desc',
    			code:code
    		},
    		success:function(data){
    			//console.log(JSON.stringify(data))
    			if(data.statusCode="100000"){
    				alertShow(data);
    			}
    		},
    		error:function(data){
    			common.prompt(data.strStatus);
    		}
    	})
    };
    //换购规则展示
    function alertShow(data){		    			    	
    	var str=data.data.desc;
		$('.alert_title').html(data.data.title);
		//console.log($('.alert_title').height())
		$('.alert_content').html(str.replace(/\r\n/g, "<br>"));           			    	
    };
	//点击弹出秒杀规则		
	var obj=$('.seckill_notice .float_right');
    common.alertShow(obj);
	common.alertHide();
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
		var list = $(".seckill_box .seckill_box1 .seckill_main_box_tit li[id]");
		setInterval(function(){
			var system_now_time = new Date().getTime();
			var time_difference = system_now_time - system_time;
			var time;
			list.not('.isEnd').each(function(){
				_this = $(this);
				time = _this.attr("time");
				if((time - time_difference)<0){
					_this.html("秒杀开始").css("color","red");
					_this.addClass('.isEnd');
					var str = _this.attr('id');
					$("."+str).html("立即秒杀").addClass("float_right1");
				}else{
					_this.html("倒计时："+get_time((time - time_difference))).css("color","red");
				}
			})
		},1000)
	};
	style_change()
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
	/*微信分享*/
	// weixin.weixin_config();


	/*function weixin_config(str){
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
						    link: sharData.link, // 分享链接
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
						    link: sharData.link, // 分享链接
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
						    link: sharData.link, // 分享链接
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
						    link: sharData.link, // 分享链接
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
	};*/
})
