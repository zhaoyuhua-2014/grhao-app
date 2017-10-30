//请求地址公用 获取tokenId公用



define(function(require,exports,module){

var $ = require('jquery');
var common={
	//http:"http://api.grhao.com/server/api.do",
	http:"http://61.164.118.194:8090/grh_api/server/api.do",
	//http:"192.168.1.5:8080/grh_api/server/api.do",
	pageSize:'10',//请求商品每页的个数
	pageNo:'1',//请求商品是第几页
	istrue:true,
	isfalse:false,
	isalert:0,//自动登录时是否弹出异常信息
	timer:0,
	selfSetTimeout:function (fn,t){
		common.timer && clearTimeout(common.timer);
		common.timer = setTimeout(fn,t);
	},
	//密码正则
	pwdReg:/^[^\s]{6,20}$/,
	phoneNumberReg:/^(0[0-9]{2,3}\-)?([2-9][0-9]{6,7})+(\-[0-9]{1,4})?$|(^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|17[6|7|8]|18[0-9])\d{8}$)/,//判断手机号的正则表达式
	bankCardReg:/^\d{16}|\d{19}$/,
	//身份证正则
	regIdCard:/^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/,
	stopEventBubble:function (event){
		var e=event || window.event;
		if (e && e.stopPropagation){
			return e.stopPropagation();
		}else{
			return e.cancelBubble=true;
		}
	},
	isPhone:function(){//检测运行环境 1-移动设备 2-pc设备
		var 
		sUserAgent = navigator.userAgent.toLowerCase(),
		bIsIpad = sUserAgent.match(/ipad/i) == "ipad",
		bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os",
		bIsMidp = sUserAgent.match(/midp/i) == "midp",
		bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4",
		bIsUc = sUserAgent.match(/ucweb/i) == "ucweb",
		bIsAndroid = sUserAgent.match(/android/i) == "android",
		bIsCE = sUserAgent.match(/windows ce/i) == "windows ce",
		bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
        return ( bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM );
	},
	callback:function(obj){
		obj.on('click',function(){
			window.history.back();
		})
	},
	tokenId:function(){
		if (localStorage.getItem('tokenId')) {
			return JSON.parse(localStorage.tokenId);
		}
	},
	secretKey:function(){
		if (localStorage.getItem('secretKey')) {
			return JSON.parse(localStorage.secretKey)
		} 
	},
	user_data:function(data){
		if (localStorage.getItem('user_data')) {
			return user_data={
				cuserInfoid:JSON.parse(localStorage.getItem('user_data')).cuserInfoid,
				firmId:JSON.parse(localStorage.getItem('user_data')).firmId,
				faceImg:JSON.parse(localStorage.getItem('user_data')).faceImg,
				petName:JSON.parse(localStorage.getItem('user_data')).petName,
				realName:JSON.parse(localStorage.getItem('user_data')).realName,
				idCard:JSON.parse(localStorage.getItem('user_data')).idCard,
				mobile:JSON.parse(localStorage.getItem('user_data')).mobile,
				sex:JSON.parse(localStorage.getItem('user_data')).sex
			}
		}
		
	},
	prompt:function(str){
		var ele=document.createElement('div');
		ele.className='prompt';
		document.body.appendChild(ele)
		$('.prompt').html(str);
		$('.prompt').css({'left':'50%'});
		//console.log($('.prompt').width())
		$('.prompt').css("margin-left",-(($('.prompt').width())/2)+'px');
		selfSetTimeout(function(){
			//console.log($('.prompt').width()+40)
			$('.prompt').css("margin-left",-($('.prompt').width()/2 + 20)+'px');
		},10)
		//console.log($('.prompt').width())
		$('.prompt').show().animate({
			'bottom':'100'
		},300)
		selfSetTimeout(function(){
			$('.prompt').remove()
		},2000)
	},
	autoLogin:function(){
		$.ajax({
			url:common.http,
	        type:"post",
	        dataType:"jsonp",
	        data:{
				method:'auto_login',
				tokenId:common.tokenId()
			},
			success:function(data){
				console.log(JSON.stringify(data))
				if (data.statusCode=='100000') {
					var user_data={
					    cuserInfoid:data.data.cuserInfo.id,
					    firmId:data.data.cuserInfo.firmId,
					    faceImg:data.data.cuserInfo.faceImg,
					    petName:data.data.cuserInfo.petName,
					    realName:data.data.cuserInfo.realName,
					    idCard:data.data.cuserInfo.idcard,
					    mobile:data.data.cuserInfo.mobile,
					    sex:data.data.cuserInfo.sex
				   	}
					localStorage.setItem("user_data",JSON.stringify(user_data));
					localStorage.setItem("tokenId",JSON.stringify(data.data.tokenId));
					localStorage.setItem("secretKey",JSON.stringify(data.data.secretKey));
				} else{
					common.prompt(data.statusStr)
					localStorage.clear();
				}
			},
			error:function(data){
				common.prompt(str)
				localStorage.clear();
			}
		})
	},
	//判断返回是否登录
	getIslogin:function(){
		if (localStorage.getItem('user_data')) {
			return 1;
		} else{
			return 0;
		}
	},
	txq : function( ele, good_sta ){
		var self = this;
		$(ele).on("click",function(){
			self.stopEventBubble()
			var goodsId=$(this).attr("data");
			sessionStorage.setItem("goodsId",goodsId);
			sessionStorage.setItem('good_sta',good_sta);
//			window.location.href="goodsDetails.html"
		})
	},
	footjomp:function(obj){
		obj.on("click",function(){
			switch ($(this).index()){
				case 0:	
				if (common.getIslogin()) {
					window.location.href="often_shop.html";
				} else{
					window.location.href="login.html";
				}
				break;
				case 1:
				window.location.href="moreGoods.html";
				break;
				case 2:
				window.location.href="wo.html";
				break;
			}
		})
	},
	//banner展示
	bannerShow:function(data){
		console.log("11111")
		var html='';
		for (var i=0 in data){
			if (data[i].linkUrl == "") {
				html += '<div class="swiper-slide"><img src="'+data[i].adLogo+'" /></div>'
			}else{
				html += '<div class="swiper-slide"><a href="'+data[i].linkUrl+'"><img src="'+data[i].adLogo+'" /></a></div>'
			}
		}
		$(".index_banner .swiper-wrapper").append(html);
		var mySwiper = new Swiper ('.index_banner', {
		    direction: 'horizontal',
		    loop: true,
		    autoplay:5000,
		    paginationClickable:true,
		    autoplayDisableOnInteraction : false,
		    // 如果需要分页器
		    pagination: '.swiper-pagination'
		});
	},
	
	//使用规则弹出框
	alertShow:function(obj){
		obj.on('click',function(e){
    		common.stopEventBubble(e);
    		$('.alert_box,.my_bg').css({'display':'block'});
  			$("body").css("overflow-y","hidden")
    	})
	},
	alertHide:function(){
		$('.alert_delete').on('click',function(e){
    		common.stopEventBubble(e);
    		$('.alert_box,.my_bg').css({'display':'none'});
  			$("body").css("overflow-y","auto")
    	})
		$('.my_bg').on('click',function(e){
    		common.stopEventBubble(e);
    		$('.alert_box,.my_bg').css({'display':'none'});
  			$("body").css("overflow-y","auto")
    	})
	}
	
}
module.exports=common;
});
