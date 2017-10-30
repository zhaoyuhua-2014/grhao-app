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
		//展示商品信息
		$('.gd_goodName').html(data.data.goodsInfo.goodsName);
		$('.gd_specification').html(data.data.goodsInfo.specInfo);		
		$('.gd_price').html('<span>￥'+data.data.goodsInfo.nowPrice+'</span>&nbsp;&nbsp;<del>￥'+data.data.goodsInfo.nomalPrice+'</del>');
		if (data.data.goodsInfo.status == "1") {
			if (data.data.goodsInfo.packageNum <= 0) {
				$('.gd_number button').addClass("float_right").html("换购光了");
			} else{
				$('.gd_number button').addClass("float_right1").html("立即换购");
			}
		} else{
			$('.gd_number button').hide();
		};
		if (data.data.goodsInfo.goodsContext) {
			$('.goodsDetails_box2_').show().html(data.data.goodsInfo.goodsContext);
		}
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
    //获取秒杀次数
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
    };
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
    if (common.getIslogin()) {
    	getSkillCount(userId,sign,source)
    };    
	//判断是否可以秒杀
	$('.gd_number').on('click',".float_right1",function(){
		if (common.getIslogin()) {
			if(count>0){
			    localStorage.setItem("orderType","2");
			    sessionStorage.setItem("setBack","4");
				window.location.href='order_set_charge.html';
			}else{
				common.prompt('购物满69元才有机会哟!');
			}
		}else{
			localStorage.setItem("jumpMake","3");
			window.location.href="login.html";
		}
	});
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
