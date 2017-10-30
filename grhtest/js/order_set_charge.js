$(document).ready(function(){
	//用户ID	
	var userId;
	userId=common.user_data().cuserInfoid;
	//加密
	var source="userId"+userId;
	var sign=md5(source+"key"+common.secretKey()).toUpperCase();
	var source1,sign1;
	//商品列表
	var goodsList=goodlist1();
	//优惠卷 ID 默认为空
	var couponId='';
	//提货方式 默认为2.送货上门
	var pickUpMethod="2";
	//地址id
	var addrId="";
	//门店ID
	var firmId="";
	//支付方式5.表示月卡支付6.表示在线支付
	var payMethod="5";
	//用户留言信息
	var message="";
	//预购商品订单编号
	var preOrderCode='';
	//预购商品的ID
	var preGoodsId="";
	//判断是否点击过提交订单
	var isClick = true;
	//console.log(localStorage.orderType)
	//商品展示首先需要判断是从哪个页面跳转到提交订单页面的定义字段为orderType 1.普通商品 2.秒杀商品 3.预购商品 采用本地存储  使用时取出
	if (localStorage.orderType=="1") {
		//console.log(localStorage.orderType);
		settlement_cart(userId,goodsList,couponId,pickUpMethod,payMethod,sign,source);
		setGoodsShow(goodlist2());
	} else if (localStorage.orderType=="2") {			
		//console.log(sessionStorage.seckillGood)
		setGoodsShow(JSON.parse(sessionStorage.seckillGood));
		order_price_change_miao ();
	} else if (localStorage.orderType=="3") {
		preOrderCode=sessionStorage.orderCode;
		source1='preOrderCode'+preOrderCode;
		sign1=md5(source1+"key"+common.secretKey()).toUpperCase();
		pre_order_details(preOrderCode,sign1,source1);
	};
	//获取地址
	if (common.user_data().firmId !='0') {
		//console.log(localStorage.firmId)
		userStoreData(common.user_data().firmId);
	} else{
		//console.log("2")
		defaultStoreData();
	};
	//结算购物车接口(普通商品)
	function settlement_cart(userId,goodsList,couponId,pickUpMethod,payMethod,sign,source){
		$.ajax({
			url:common.http,
	        type:"post",
	        dataType:"jsonp",
	        data:{
				method:'shop_cart_submit',
				userId:userId,
				goodsList:goodsList,
				couponId:couponId,
				pickUpMethod:pickUpMethod,
				payMethod:payMethod,
				tokenId:common.tokenId(),
				sign:sign,
				source:source
			},
			success:function(data){
				//console.log(JSON.stringify(data));
				if (data.statusCode=="100000") {
					gw_submit_show(data);
				}
			},
			error:function(data){
				common.prompt(str);
			}
		});
	};
	//欲购详情请求
	function pre_order_details(orderCode,sign1,source1){
		//console.log(orderCode)
		$.ajax({
			url:common.http,
			dataType:'jsonp',
			data:{
				method:'pre_order_details',
				orderCode:orderCode,
				tokenId:common.tokenId(),
				sign:sign1,
				source:source1
			},
			success:function(data){
				//console.log(JSON.stringify(data));
				if (data.statusCode=="100000") {
					//console.log(data.data.preGoodsId);
    				preGoodsId=data.data.preGoodsId;
    				settlement_cart_pre(userId,preGoodsId,couponId,pickUpMethod,payMethod,sign,source);
    				pre_setGoodsShow(data.data);
				}
			},
			error:function(data){
				common.prompt(data.statusStr);
			}
		});
	};
	//结算预购商品购物车接口
	function settlement_cart_pre(userId,preGoodsId,couponId,pickUpMethod,payMethod,sign,source){
		//console.log(userId+","+preGoodsId+","+couponId+","+pickUpMethod+","+payMethod)
		$.ajax({
			url:common.http,
	        type:"post",
	        dataType:"jsonp",
	        data:{
				method:'pre_shop_cart_submit',
				userId:userId,
				preGoodsId:preGoodsId,
				couponId:couponId,
				pickUpMethod:pickUpMethod,
				payMethod:payMethod,
				tokenId:common.tokenId(),
				sign:sign,
				source:source
			},
			success:function(data){
				//console.log(JSON.stringify(data));
				if (data.statusCode=="100000") {
					gw_submit_show(data);
				}
			},
			error:function(data){
				common.prompt(str)
			}
		});
	};
	//解析提交购物车返回的数据
	function gw_submit_show(data){
		var order=data.data.order;
		order_price_change(order);
		var copon=data.data.CouponInfolist;
		if(copon==undefined){
			
		}else{
			if (localStorage.orderType=="1") {
				addCoupon(copon);
			}
		}
	};
	//解析预购购物车和上边可共用
	//切换提货方式
	$('.set_charge_contact li').eq(0).css({'background':'url(../img/bg_num_a.png) no-repeat 0 center'})
	$('.set_charge_contact li').on('click',function(){
		var tab=$('.set_charge_contact li').index(this);
		$(this).css({'background':'url(../img/bg_num_a.png) no-repeat 0 center'}).siblings().css({'background':'url(../img/bg_num_b.png) no-repeat 0 center'})
		$('.set_charge_address').eq(tab).css({'display':'block'}).siblings().css({'display':'none'});
		if (tab) {
			pickUpMethod="1";
			addrId='';
			if (localStorage.orderType=="1") {
				//console.log("userId="+userId+",pickUpMethod="+pickUpMethod+",couponId="+couponId+",goodsList="+goodsList+",payMethod="+payMethod)
				settlement_cart(userId,goodsList,couponId,pickUpMethod,payMethod,sign,source);
			}else if (localStorage.orderType=="3") {
				settlement_cart_pre(userId,preGoodsId,couponId,pickUpMethod,payMethod,sign,source);
			}
		} else{
			pickUpMethod="2";
			addrId=$('.set_charge_address1').attr("addrid");
			
			if (localStorage.orderType=="1") {
				//console.log("userId="+userId+",pickUpMethod="+pickUpMethod+",couponId="+couponId+",goodsList="+goodsList+",payMethod="+payMethod)
				settlement_cart(userId,goodsList,couponId,pickUpMethod,payMethod,sign,source);
			}else if (localStorage.orderType=="3") {
				settlement_cart_pre(userId,preGoodsId,couponId,pickUpMethod,payMethod,sign,source);
			}
		}
	});
	//获取默认门店数据
	function defaultStoreData(){
		$.ajax({
			url:common.http,
	        type:"post",
	        dataType:"jsonp",
	        data:{
				method:'firm_default'
			},
			success:function(data){
				//console.log(JSON.stringify(data));
				if(data.statusCode=="100000"){
					storeShow(data)
				}
			},
			error:function(data){
				common.prompt(str)
			}
		});
	};
	//获取当前用户门店
	function userStoreData(firmId){
		$.ajax({
			url:common.http,
	        type:"post",
	        dataType:"jsonp",
	        data:{
				method:'firm_list',
				firmId:firmId
			},
			success:function(data){
				//console.log(JSON.stringify(data));
				if(data.statusCode=="100000"){
					storeShow1(data)
				}
			},
			error:function(data){
				common.prompt(str)
			}
		});
	};
	//门店信息显示
	function storeShow(data){
		firmId=data.data.id;
		$(".set_charge_con").show();
		$(".set_charge_address2").attr("firmid",data.data.id);
		$(".set_charge_address2 .take_goods_phone").html(data.data.firmName);
		$(".set_charge_address2 .set_address_bottom").html("地址："+data.data.address);
		$(".set_charge_address2 .set_job_time").html("营业时间："+data.data.pickUpTime);
	};
	//门店信息显示
	function storeShow1(data){
		//console.log(JSON.stringify(data));
		firmId=data.data[0].id;
		$(".set_charge_con").show();
		$(".set_charge_address2").attr("firmid",data.data[0].id);
		$(".set_charge_address2 .take_goods_phone").html(data.data[0].firmName);
		$(".set_charge_address2 .set_address_bottom").html("地址："+data.data[0].address);
		$(".set_charge_address2 .set_job_time").html("营业时间："+data.data[0].pickUpTime);
	};
	//切换支付方式
	$('.set_charge_style li').eq(0).css({'background':'url(../img/bg_num_a.png) no-repeat 0 center'})
	$('.set_charge_style li').on('click',function(){
		var tab=$('.set_charge_style li').index(this);
		//console.log(tab);
		$(this).css({'background':'url(../img/bg_num_a.png) no-repeat 0 center'}).siblings().css({'background':'url(../img/bg_num_b.png) no-repeat 0 center'});
		if (tab) {
			payMethod="6";
			
			if (localStorage.orderType=="1") {
				//console.log("userId="+userId+",pickUpMethod="+pickUpMethod+",couponId="+couponId+",goodsList="+goodsList+",payMethod="+payMethod)
				settlement_cart(userId,goodsList,couponId,pickUpMethod,payMethod,sign,source);
			}else if (localStorage.orderType=="3") {
				settlement_cart_pre(userId,preGoodsId,couponId,pickUpMethod,payMethod,sign,source);
			}
		} else{
			payMethod="5";
			if (localStorage.orderType=="1") {
				//console.log("userId="+userId+",pickUpMethod="+pickUpMethod+",couponId="+couponId+",goodsList="+goodsList+",payMethod="+payMethod)
				settlement_cart(userId,goodsList,couponId,pickUpMethod,payMethod,sign,source);
			}else if (localStorage.orderType=="3") {
				settlement_cart_pre(userId,preGoodsId,couponId,pickUpMethod,payMethod,sign,source);
			}
		}
		//console.log(payMethod)
	});
	//优惠卷展示
	function addCoupon(data){
		//console.log(data)
		
		$(".set_coupon_box").show();
		var html='<p data="">请选择优惠券</p>';
		$('.set_coupon_box1_bottom').find("p").remove();
		for (var i in data) {
			html += '<p data="'+data[i].id+'">'+data[i].couponMoney+'元-'+data[i].couponName+'</p>'
		}
		$('.set_coupon_box1_bottom').append(html);
		
	};
	//点击选择优惠卷
	$('.set_coupon_box1_top').on('click',function(){
		$('.set_coupon_box1_bottom').toggle();
	})
	$(".set_coupon_box1_bottom").on('click',"p",function(){
		couponId=$(this).attr("data");
		var couponName=$(this).html();
		$(".set_coupon_box1_top").attr("data",couponId);
		$(".set_coupon_box1_top").html(couponName);
		$(".set_coupon_box1_bottom").hide();
		settlement_cart(userId,goodsList,couponId,pickUpMethod,payMethod,sign,source);
	});
	//优惠及商品价格展示-普通商品
	function order_price_change (data){
		//console.log(JSON.stringify(data))
		$(".order_set_list").show();
		//总价
		$(".order_set_list li").eq(0).show().find(".float_right").html("￥"+data.goodsMoney);
		//运费
		$(".order_set_list li").eq(1).show().find(".float_right").html("￥"+data.postCost);
		//优惠卷金额
		if (localStorage.orderType=="3") {
			$(".order_set_list li").eq(2).hide();
		}else{
			$(".order_set_list li").eq(2).show().find(".float_right").html("￥"+data.couponMoney);
		}
		//优惠策略
		if (data.couponStrategy=="1") {
			$(".order_set_list li").eq(3).show().find(".float_left").html("立减优惠");
			$(".order_set_list li").eq(3).show().find(".float_right").html("-￥"+data.derateAmount);
		} else if(data.couponStrategy=="2"){
			$(".order_set_list li").eq(3).show().find(".float_left").html("折扣优惠");
			$(".order_set_list li").eq(3).show().find(".float_right").html("-￥"+data.derateAmount);
		} else if(data.couponStrategy=="3"){
			$(".order_set_list li").eq(3).show().find(".float_left").html("赠送果币");
			$(".order_set_list li").eq(3).show().find(".float_right").html(data.offScore+"个");
		} else if(data.couponStrategy=="4"){
			$(".order_set_list li").eq(3).show().find(".float_left").html("赠送优惠卷");
			$(".order_set_list li").eq(3).show().find(".float_right").html(data.derateAmount+"元卷");
		} else{
			$(".order_set_list li").eq(3).hide();
		}
		//包月卡优惠
		$(".order_set_list li").eq(4).show().find(".float_right").html("-￥"+data.mothReduceMoney);
		//合计、总计
		$(".order_set_list li").eq(5).show().find(".float_right").html("￥"+data.realPayMoney);
		//
		$(".order_submit_money").html(data.realPayMoney);
	}
	//优惠及商品价格展示-秒杀商品
	function order_price_change_miao (){
		$(".order_set_list").show();
		//总价
		$(".order_set_list li").eq(0).show().find(".float_right").html("￥"+JSON.parse(sessionStorage.seckillGood)[0].price);
		//运费
		$(".order_set_list li").eq(1).show().find(".float_right").html("￥"+"0");
		//优惠卷金额
		$(".order_set_list li").eq(2).hide();
		//立减优惠
		$(".order_set_list li").eq(3).hide();
		//包月卡优惠
		$(".order_set_list li").eq(4).hide();
		//合计、总计
		$(".order_set_list li").eq(5).show().find(".float_right").html("￥"+JSON.parse(sessionStorage.seckillGood)[0].price);
		$(".order_submit_money").html(JSON.parse(sessionStorage.seckillGood)[0].price);
	}
	//商品列表
	function setGoodsShow(data){
		//console.log(data)
		var html='';
		for (var i in data) {
			html += '<dl class="gds_box clearfloat">'
			html += '   <dt>'
			html += '		<img src="'+data[i].logo+'"/>'
			if (localStorage.orderType=="2") {
				html +='<img class="gds_goods_te" src="../img/icon_miao_s.png"/>'
			}else{
				if (data[i].isspecial) {
					html +='<img class="gds_goods_te" src="../img/icon_te_s.png"/>'
				}
			}
			html += '	</dt>'
		    html += '	<dd>'
			html += '	    <div class="gds_right_top">'+data[i].name+'</div>'
			html += '	    <div class="gds_right_center clearfloat">'
			html += '		    <div class="gds_goods_mess float_left">'+data[i].specifications+'</div>'
			html += '		    <div class="gds_num_price float_right clearfloat">'
			html += '	            <p class="gds_price float_right">￥<span>'+(data[i].count*data[i].price).toFixed(2)+'</span></p>'
			html += '	            <p class="gds_num float_right">X<span>'+data[i].count+'</span></p>'
			html += '           </div>'
			html += '	    </div>'
			html += '	    <div class="gds_right_bottom">'
			html += '			<p class="float_left"><span class="font_color">￥'+data[i].price+'</span></p>'
			html += '			<p class="float_left"><span class="font_color"></span></p>'
			html += '</div>'
			html += '    </dd>'
		    html += '</dl>'
		}
		$(".order_goods_contain_details").append(html);
		$(".gds_box").eq(data.length-1).css("border-bottom","1px solid #FFF");
	}
	//预购商品列表
	function pre_setGoodsShow(data){
		var html='';
		html += '<dl class="gds_box clearfloat">'
		html += '   <dt>'
		html += '		<img src="'+data.goodsInfo.goodsLogo+'"/>'
		html += '		<img class="gds_goods_te" src="../img/icon_yu_s.png"/>'
		html += '	</dt>'
	    html += '	<dd>'
		html += '	    <div class="gds_right_top">'+data.goodsInfo.goodsName+'</div>'
		html += '	    <div class="gds_right_center clearfloat">'
		html += '		    <div class="gds_goods_mess float_left">'+data.goodsInfo.specInfo+'</div>'
		html += '		    <div class="gds_num_price float_right clearfloat">'
		html += '	            <div class="gds_price float_right">X<span>'+data.buyNum+'</span></div>'
		html += '	            <div class="gds_num float_right">￥<span>'+(data.retainage).toFixed(2)+'</span></div>'
		html += '           </div>'
		html += '	    </div>'
		html += '		<div class="gds_right_bottom">'
		html += '			<p class="float_left">'
		html += '				<span>定金：</span><span class="font_color">￥'+data.preGoods.frontMoney+'</span>'
		html += '			</p>'
		html += '			<p class="float_left">'
		html += '				<span>尾款：</span><span class="font_color">￥'+data.preGoods.retainage+'</span>'
		html += '			</p>'
		html += '		</div>'
		html += '    </dd>'
	    html += '</dl>'
	    $(".order_goods_contain_details").append(html);
	    $(".gds_box").css("border-bottom","1px solid #FFF");
	}
	//请求默认地址
	if (sessionStorage.addressData==undefined || sessionStorage.addressData=="") {
		getDefaultAdd(userId,sign,source);
	} else{
		$('.set_charge_address1').attr("addrid",JSON.parse(sessionStorage.addressData).id);
		addrId=JSON.parse(sessionStorage.addressData).id;
		$('.set_charge_address1 .set_address_top').show();
		$('.set_charge_address1 .take_goods_name').html(JSON.parse(sessionStorage.addressData).consignee);
		$('.set_charge_address1 .take_goods_phone').html(JSON.parse(sessionStorage.addressData).mobile);
		$('.set_charge_address1 .set_address_bottom').show().html(JSON.parse(sessionStorage.addressData).provinceName+JSON.parse(sessionStorage.addressData).cityName+JSON.parse(sessionStorage.addressData).countyName+JSON.parse(sessionStorage.addressData).street)
	}
	function getDefaultAdd(userId,sign,source){
		//console.log(userId)
		$.ajax({
			url:common.http,
	        type:"post",
	        dataType:"jsonp",
	        data:{
				method:'address_default_show',
				userId:userId,
				tokenId:common.tokenId(),
				sign:sign,
				source:source
			},
			success:function(data){
				//console.log(JSON.stringify(data));
				if (data.statusCode=="100000") {
					$('.set_charge_address1').attr("addrid",data.data.id);
					addrId=data.data.id;
					$('.set_charge_address1 .set_address_top').show();
					$('.set_charge_address1 .take_goods_name').html(data.data.consignee);
					$('.set_charge_address1 .take_goods_phone').html(data.data.mobile);
					$('.set_charge_address1 .set_address_bottom').show().html(data.data.provinceName+data.data.cityName+data.data.countyName+data.data.street)
				} else if(data.statusCode=="100505") {
					//console.log("1")
					$('.set_charge_address1 .set_address_top').hide();
					$('.set_charge_address1 .set_address_bottom').hide();
					$(".set_charge_address1 .set_address_select").show().html("请选择收货地址");
				}
			},
			error:function(data){
				common.prompt(str)
			}
		});
	};
	//点击切换地址
	$('.set_charge_address1').on('click',function(){
		sessionStorage.setItem("addType","1");
		window.location.href="address_management.html";
	});
	//点击提交订单
	$(".order_submit_right").on('click',function(){
		//用户ID userId
		//送货方式  1门店自提 2送货上门 pickUpMethod=1;
		//地址id addrId=$(".set_charge_address1").attr("addrid");
		//门店ID  var firmId=firmId="1";
		message=$(".set_order_remark input").val();
		if (isClick) {
			isClick = false;
			if (localStorage.orderType=="1") {
				//console.log("userId="+userId+",pickUpMethod="+pickUpMethod+",addrId="+addrId+",firmId"+firmId+",couponId="+couponId+",message="+message+",goodsList="+goodsList+",payMethod="+payMethod)
				submit_order(userId,pickUpMethod,addrId,firmId,couponId,message,goodsList,payMethod,sign,source)
			} else if (localStorage.orderType=="2") {
				var killGoodsId=JSON.parse(sessionStorage.seckillGood)[0].id;
				var buyNumber="1";
				//console.log("userId="+userId+",pickUpMethod="+pickUpMethod+",addrId="+addrId+",firmId"+firmId+",message="+message+",killGoodsId="+killGoodsId+",buyNumber="+buyNumber+",payMethod="+payMethod)
				submit_order_miao(userId,pickUpMethod,addrId,firmId,message,killGoodsId,buyNumber,payMethod,sign,source)
			} else if (localStorage.orderType=="3") {
				preOrderCode=sessionStorage.orderCode;
				//console.log("userId="+userId+",pickUpMethod="+pickUpMethod+",addrId="+addrId+",firmId"+firmId+",message="+message+",couponId="+couponId+",preOrderCode="+preOrderCode+",payMethod="+payMethod)
				submit_order_yu(userId,pickUpMethod,addrId,firmId,message,couponId,preOrderCode,payMethod,sign,source)
			}
		}
	});
	//普通订单提交
	function submit_order(userId,pickUpMethod,addrId,firmId,couponId,message,goodsList,payMethod,sign,source){
		$.ajax({
			url:common.http,
	        type:"post",
	        dataType:"jsonp",
	        data:{
				method:'order_submit',
				userId:userId,
				pickUpMethod:pickUpMethod,
				addrId:addrId,
				firmId:firmId,
				couponId:couponId,
				message:message,
				goodsList:goodsList,
				payMethod:payMethod,
				tokenId:common.tokenId(),
				sign:sign,
				source:source
			},
			success:function(data){
				//console.log(JSON.stringify(data));
				if (data.statusCode=="100000") {
					sessionStorage.setItem("orderCode",data.data.orderCode);
					localStorage.setItem("orderBack",'1');
					localStorage.removeItem("good");
					sessionStorage.removeItem("first_data");
					sessionStorage.removeItem("two_data");
					window.location.href="order_pay.html";
					isClick = true;
				}else if (data.statusCode=="100711") {
					common.prompt("地址不在配送范围");
					isClick = true;
				}else{
					common.prompt(data.statusStr);
					isClick = true;
				}
			},
			error:function(data){
				common.prompt(data.statusStr);
				isClick = true;
			}
		});
	};
	//秒杀订单提交
	function submit_order_miao(userId,pickUpMethod,addrId,firmId,message,killGoodsId,buyNumber,payMethod,sign,source){
		$.ajax({
			url:common.http,
	        type:"post",
	        dataType:"jsonp",
	        data:{
				method:'kill_order_submit',
				userId:userId,
				pickUpMethod:pickUpMethod,
				addrId:addrId,
				firmId:firmId,
				message:message,
				killGoodsId:killGoodsId,
				buyNumber:buyNumber,
				payMethod:payMethod,
				tokenId:common.tokenId(),
				sign:sign,
				source:source
			},
			success:function(data){
				//console.log(JSON.stringify(data));
				if(data.statusCode=="100000"){
					sessionStorage.setItem("orderCode",data.data.orderCode);
					localStorage.setItem("orderBack",'1');
					window.location.href="order_pay.html";
					isClick = true;
				}else if (data.statusCode=="100711") {
					common.prompt("地址不在配送范围");
					isClick = true;
				}else{
					common.prompt(data.statusStr);
					isClick = true;
				}
			},
			error:function(data){
				common.prompt(data.statusStr);
				isClick = true;
			}
		});
	};
	//预购订单提交
	function submit_order_yu(userId,pickUpMethod,addrId,firmId,message,couponId,preOrderCode,payMethod,sign,source){
		$.ajax({
			url:common.http,
	        type:"post",
	        dataType:"jsonp",
	        data:{
				method:'pre_order_submit',
				userId:userId,
				pickUpMethod:pickUpMethod,
				addrId:addrId,
				firmId:firmId,
				message:message,
				couponId:couponId,
				preOrderCode:preOrderCode,
				payMethod:payMethod,
				tokenId:common.tokenId(),
				sign:sign,
				source:source
			},
			success:function(data){
				//console.log(JSON.stringify(data));
				if (data.statusCode=="100000") {
					sessionStorage.setItem("orderCode",data.data.orderCode);
					window.location.href="order_pay.html";
					isClick = true;
				}else if (data.statusCode=="100711") {
					common.prompt("地址不在配送范围");
					isClick = true;
				}else{
					common.prompt(data.statusStr);
					isClick = true;
				}
			},
			error:function(data){
				common.prompt(data.statusStr)
			}
		});
	};
	//点击返回
    $(".header_left").on("click",function(){
    	window.history.back();
    });
    //优惠卷提示
	$("#coupon_msg").on("click",function(){
    	$('.pop').css({'display':'block'});
    	$("body").css("overflow-y","hidden")
    	$(".pop_prompt").html("特价商品不参与优惠卷计算")
		$('.pop_makeSure').on('click',function(){
			$('.pop').css({'display':'none'})
			$("body").css("overflow-y","auto")
		})
   });
	//支付方式提示
	$("#pay_msg").on("click",function(){
    	$('.pop').css({'display':'block'});
    	$("body").css("overflow-y","hidden")
    	$(".pop_prompt").html("特价商品不参与包月卡优惠计算")
		$('.pop_makeSure').on('click',function(){
			$('.pop').css({'display':'none'})
			$("body").css("overflow-y","auto")
		})
    });
})