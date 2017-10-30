$(document).ready(function(){
	var userId=common.user_data().cuserInfoid;
	var source="userId"+userId;
	var sign=md5(source+"key"+common.secretKey()).toUpperCase();
	var preGoodsId='';
	//console.log(source+","+sign)
	//商品的id
	var goodsId;
	var type;//链接返回的goodsId
	var isTrue=false;//true链接；false本地存储
	var test=location.href.toUpperCase();
	var words=test.split('#');
	isLink();
	function isLink(){
		for(var i=1;i<words.length;i++){
			if(String(words[i]).indexOf('GOODSID')!=-1){				
				isTrue=true;
				type=words[i].substring(words[i].indexOf('=')+1);			
				return type
			}
		}
	};
	if(isTrue){
		goodsDetailsData(type);
	}else{
		goodsId=sessionStorage.goodid;
		goodsDetailsData(goodsId);
	}	
	//console.log(goodsId);	
	var goodNum="1";
	//商品详情数据请求
	function goodsDetailsData(goodsId){
		$.ajax({
			url:common.http,
	        type:"post",
	        dataType:"jsonp",
	        data:{
				method:'pre_good_show',
				preGoodsId:goodsId
			},
			success:function(data){
				//console.log(JSON.stringify(data));
				goodsDetailsShow(data)
			},
			error:function(data){
				common.prompt(str)
			}
		});
	};
	var html='';
	function goodsDetailsShow(data){
		preGoodsId=data.data.id;
		//banner
		var imgArr=data.data.goodsInfo.goodsPics.split('@');
		goodsBanner(imgArr);
		//本地商品数量
		$(".gd_number .minus_num").show();
		$('.gd_number .show_num').show().html("1");
		$('.show_num').attr("dataId",data.data.goodsInfo.id)
		//添加存储数据到元素
		$('.good_box1_box11').attr('data',data.data.goodsInfo.id);
		$('.good_box1_box11').attr('dataname',data.data.goodsInfo.goodsName);
		$('.good_box1_box11').attr('dataprice',data.data.goodsInfo.nowPrice);
		$('.good_box1_box11').attr('datalogo',data.data.goodsInfo.goodsLogo);
		$('.good_box1_box11').attr('dataspecInfo',data.data.goodsInfo.specInfo);
		$('.good_box1_box11').attr('datamax',data.data.perBuyNum);
		$('.good_box1_box11').attr('datapackagenum',data.data.goodsInfo.packageNum);
		
		//展示商品信息
		$('.gd_goodName').html(data.data.goodsInfo.goodsName);
		$('.gd_specification').html(data.data.goodsInfo.specInfo);
		$('.pre_gd_price').html('定金：<span class="font_color">￥'+data.data.frontMoney+'</span>&nbsp;&nbsp;&nbsp;&nbsp;尾款：<span class="font_color">￥'+data.data.retainage+'</span>')
		
		$(".pre_goods_details dl").eq(0).find("dd").html(setTime(data.data.frontMoneyStart)+"-"+setTime(data.data.frontMoneyEnd));
		$(".pre_goods_details dl").eq(1).find("dd").html(setTime(data.data.retainageStart)+"-"+setTime(data.data.retainageEnd));
		if (data.data.goodsInfo.goodsContext) {
			$('.goodsDetails_box2_').show().html(data.data.goodsInfo.goodsContext);
		}
		//preStatus=willbegin-即将开始，book-预够时间，bookend-支付尾款未开始，notretainage-支付尾款开始 ，end-活动结束 ，
		//data.data.preStatus="book"
		if (data.data.preStatus=="willbegin") {
			$('.pre_pay_btn').html("活动未开始").css("background","#b2b2b2");
		} else if (data.data.preStatus=="book") {
			$('.pre_pay_btn').html("支付定金").css("background","#fe7831").on("click",function(){
				if (common.getIslogin()) {
					var buyNum=$(".show_num").html();
					source="preGoodsId"+preGoodsId+"-userId"+userId;
					sign=md5(source+"key"+common.secretKey()).toUpperCase();
					//console.log(source+","+sign)
					//console.log("userId="+userId+",preGoodsId="+preGoodsId+",buyNum="+buyNum)
					save_pre(userId,preGoodsId,buyNum,sign,source)
				}else{
					window.location.href='login.html';
				}
			});
		} else if (data.data.preStatus=="bookend") {
			$('.pre_pay_btn').html("等待付尾款").css("background","#b2b2b2");
		} else if (data.data.preStatus=="notretainage") {
			$('.pre_pay_btn').html("支付尾款").css("background","#fe7831").on("click",function(){
				if (common.getIslogin()) {
					source="preGoodsId"+preGoodsId+"-userId"+userId;
					sign=md5(source+"key"+common.secretKey()).toUpperCase();
					//console.log(source+","+sign+","+common.secretKey())
					//console.log("userId="+userId+",preGoodsId="+preGoodsId)
					pre_order_submit(userId,preGoodsId,sign,source)
				}else{
					window.location.href='login.html';
				}
			});
				
		} else if (data.data.preStatus=="end") {
			$('.pre_pay_btn').html("活动结束").css("background","#b2b2b2");
		}else{
			$('.pre_pay_btn').html("活动结束").css("background","#b2b2b2");
		}
		$('.goodsDetails_box3').html();
	};
	//展示商品图片
	function goodsBanner(imgArr){
		var arr1=[];
		//console.log(data.data.goodsPics.split('@').length)
		for (var i in imgArr) {
			if(imgArr[i]!=''){
				arr1.push(imgArr[i])
			}
		}
		for (var j in arr1) {
			html += '<div class="swiper-slide"><img src="'+arr1[j]+'" /></div>'
			//console.log(i)
		}
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
	};
	//增加商品
	$(".add_num").on('click',function(){
		var data,dataprice,dataname,datalogo,dataspecInfo,datamax;
		//限购
		datamax=$(this).parent().parent().attr("datamax");
		//console.log(datamax=="")
		//库存
		datapackagenum=$(this).parent().parent().attr("datapackagenum");
		//先判断库存和限购  在执行加操作
		if (goodNum<datapackagenum) {
			if(datamax != "0" && datamax !=""){
				if(goodNum<datamax){
					goodNum = parseInt(goodNum)+1;
					$(this).siblings().eq(1).html(goodNum);
				}else{
					common.prompt("该商品限购"+datamax+"件");
				}
			}else{
				goodNum = parseInt(goodNum)+1;
				$(this).siblings().eq(1).html(goodNum);
			}
		} else{
			common.prompt("库存不足")
		}
	});
	//减少商品
	$('.minus_num').on('click',function(){
		if ($(this).siblings().eq(0).html()=='1') {
			$(this).siblings().eq(0).html("1")
		}else{
			goodNum =$(this).siblings().eq(0).html();
			goodNum = parseInt(goodNum)-1
			$(this).siblings().eq(0).html(goodNum);
		}
	});
	//对商品数目的事件监听
	$('.show_num').on('DOMNodeInserted',function(){
		$(".pre_pay_btn").attr("count",$(this).html());
	});
	//返回按钮
	$(".header_left").on('click',function(){
		window.history.back();
	});
	//支付定金保存预购记录
	function save_pre(userId,preGoodsId,buyNum,sign,source){
		//console.log("userId="+userId+",preGoodsId="+preGoodsId+",buyNum="+buyNum,sign,source)
		$.ajax({
			url:common.http,
	        type:"post",
	        dataType:"jsonp",
	        data:{
				method:'save_pre_order_rcd',
				userId:userId,
				preGoodsId:preGoodsId,
				buyNum:buyNum,
				tokenId:common.tokenId(),
				sign:sign,
				source:source
			},
			success:function(data){
				//console.log(JSON.stringify(data));
				if (data.statusCode=="100000") {
					sessionStorage.setItem("orderCode",data.data.orderCode);
					window.location.href='order_pay1.html';
					//跳转到支付页面
				}else if(data.statusCode=="100716"){
					common.prompt("已有预购订单")	
				}
			},
			error:function(data){
				common.prompt(str);
			}
		});
	};
	//支付尾调用的函数
	function pre_order_submit(userId,preGoodsId,sign,source){
		$.ajax({
			url:common.http,
	        type:"post",
	        dataType:"jsonp",
	        data:{
				method:'pre_shop_cart_submit',
				userId:userId,
				preGoodsId:preGoodsId,
				tokenId:common.tokenId(),
				sign:sign,
				source:source
			},
			success:function(data){
				//console.log(JSON.stringify(data));
				if (data.statusCode=="100000") {
					pre_order(data);
				} else if(data.statusCode=="100713"){
					common.prompt("未参与预购活动");
				}else {
					common.prompt(data.statusStr);
				}
			},
			error:function(data){
				common.prompt(str)
			}
		});
	};
	function pre_order(data){
		if (data.data.order.isSavePreOrder=="0") {
			//console.log(data.data.order.preOrderCode)
			sessionStorage.setItem("orderCode",data.data.order.preOrderCode);
			localStorage.setItem("orderType","3");
			sessionStorage.setItem("setBack","5");
			window.location.href="order_set_charge.html";
		} else if(data.data.order.isSavePreOrder=="1"){
			localStorage.setItem("orderType","3");
			sessionStorage.setItem("orderCode",data.data.order.orderCode);
			window.location.href="order_pay.html";
		}
	};
	//处理时间
	function setTime(time){
		return time.substring(5,16);
	};
	//返回顶部
	window.onscroll=function(){
		var scroll=document.body.scrollTop || window.pageYOffset || document.documentElement.scrollTop;
		if(scroll>=600){				
			$('.toTop').css({'display':'block'})			
		}else{
			$('.toTop').css({'display':'none'})
		}
	};	
	$('.toTop').on('click',function(){
		$('html,body').animate({
			scrollTop:0
		},500) 
	});
	 //编码
    var code="YGGX-DESC";				    		    
    //预购规则说明请求
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
    				alertShow(data)
    			}else{
    				common.prompt(data.strStatus)
    			}
    		},
    		error:function(data){
    			common.prompt(data.strStatus)
    		}
    	});
    };
    //优惠券使用规则展示
    function alertShow(data){		    			    	
    	var str=data.data.desc;
		$('.alert_title').html(data.data.title);
		//console.log($('.alert_title').height())
		$('.alert_content').html(str.replace(/\r\n/g, "<br>")) ;           			    	
    };    	  	
	var obj=$('.pre_rule');
    common.alertShow(obj);
	common.alertHide();
	contact(code);
})
