define(function(require, exports, module){

	require('jquery');
	var common = require('../lib/common');
	require('mdData');
		    	
	var userId=common.user_data().cuserInfoid;
	var source="userId"+userId;
	var sign=md5(source+"key"+common.secretKey()).toUpperCase();
	//console.log(source+","+sign)
	//订单状态
	var prePayStatus=1;
	//订单页数
	var pageNo=common.pageNo;
	//页大小
	var pageSize=common.pageSize;
	//订单删除传值
	var obj;
	if(!sessionStorage.preColumn || sessionStorage.preColumn=='0'){
		prePayStatus=1;
		sessionStorage.setItem("preColumn",0);
		person_order(userId,prePayStatus,pageNo,pageSize,sign,source);
		$('.myOrder_man_item').eq(parseInt(sessionStorage.preColumn)).css({'color':'rgb(147,192,29)','border-bottom':'2px solid #93c01d'}).siblings().css({'color':'rgb(136,136,136)','border-bottom':'none'});
	}else{
		if (sessionStorage.preColumn=='1') {
			prePayStatus=3;
			person_order(userId,prePayStatus,pageNo,pageSize,sign,source);
		}else if (sessionStorage.preColumn=='2') {
			prePayStatus=4;
			person_order(userId,prePayStatus,pageNo,pageSize,sign,source);
		}else if (sessionStorage.preColumn=='3') {
			prePayStatus='';
			person_order(userId,prePayStatus,pageNo,pageSize,sign,source);
		}
		$('.myOrder_man_item').eq(parseInt(sessionStorage.preColumn)).css({'color':'rgb(147,192,29)','border-bottom':'2px solid #93c01d'}).siblings().css({'color':'rgb(136,136,136)','border-bottom':'none'});
	}	    		    	
	$('.myOrder_man_item').on('click',function(){
		$('.lodemore').css('display','none');
		var i=$('.myOrder_man_item').index(this);
		$('.order_manage_contain .order_manage_content').remove();
		$('.myOrder_man_item').eq(i).css({'color':'rgb(147,192,29)','border-bottom':'2px solid #93c01d'}).siblings().css({'color':'rgb(136,136,136)','border-bottom':'none'});
	    switch ($(this).index()){
				case 0:
				prePayStatus=1;//定金未支付
				sessionStorage.setItem("preColumn",0);
					break;
				case 1:
				prePayStatus=3;//定金支付等待付尾款
				sessionStorage.setItem("preColumn",1);
					break;
				case 2:
				prePayStatus=4;//待收货
				sessionStorage.setItem("preColumn",2);
					break;
				case 3:
				prePayStatus='';
				sessionStorage.setItem("preColumn",3);
					break;					    
		}
	    //console.log(userId)
	    //console.log(prePayStatus)
	    //console.log(pageNo)
	    //console.log(pageSize)        	       
	    person_order(userId,prePayStatus,pageNo,pageSize,sign,source);       	    
	})
	//点击返回
    $(".header_left").on("click",function(){
    	window.location.href='my.html';
    	sessionStorage.removeItem('preColumn');
    });
	//获取预购订单列表
	function person_order(userId,prePayStatus,pageNo,pageSize,sign,source){
		//console.log(userId+"+"+prePayStatus+"+"+pageNo+"+"+pageSize)
		//console.log(prePayStatus)
		$.ajax({
			url:common.http,
			dataType:'jsonp',
			data:{
				method:'pre_order_list',
				userId:userId,
				prePayStatus:prePayStatus,
				pageNo:pageNo,
				pageSize:pageSize,
				tokenId:common.tokenId(),
				sign:sign,
				source:source
			},
			success:function(data){
				//console.log(JSON.stringify(data))
				if (data.statusCode=='100000') {	    					
					pre_order_show(data)
				}else if(data.statusCode=='100712'){
					$('.lodemore').html('没有更多数据了').css('display','block')	
				}else{
					common.prompt(data.strStatus)
				}
			},
			error:function(data){
				common.prompt(data.strStatus)
			}
		});
	};	    		    		    		    	   		    	
	//判断订单下方提示语
	function pre_order_show(data){		    		
		preOrderDetail(data)
		isLast=data.data.isLast;	    		
		if(isLast){	    				    			
			$('.lodemore').html('没有更多数据了').show();    			
		}else{	    				    			
			$('.lodemore').html('点击加载更多数据').show();   		
		}
	};	    	
	//预购订单展示
	function preOrderDetail(data){
		var html='';
		for(var i in data.data.objects){
			html+='<div class="order_manage_content" data="'+data.data.objects[i].payStatus+'" datapreordercode="'+data.data.objects[i].orderCodeRetainage+'" dataCode="'+data.data.objects[i].orderCode+'">'
			html+='   <div class="order_manage_num clearfloat">'
			if(data.data.objects[i].orderCodeRetainage==''){
				html+='       <div class="order_num_left">订单编号：'+data.data.objects[i].orderCode+'</div>'
			}else{
				html+='       <div class="order_num_left">订单编号：'+data.data.objects[i].orderCodeRetainage+'</div>'
			}	    			
			if(data.data.objects[i].payStatus=='1'){
				html+='       <div class="order_num_right">待付订金</div>'
			}else if(data.data.objects[i].payStatus=='2' || data.data.objects[i].payStatus=='3'){		
				html+='       <div class="order_num_right">待付尾款</div>'		    				    			
			}else if(data.data.objects[i].payStatus=='4'){
				html+='       <div class="order_num_right">已完成</div>'
		    }else if(data.data.objects[i].payStatus=='-1'){
				html+='       <div class="order_num_right">已作废</div>'
			}
			html+='   </div>'
			html+='   <div class="order_manage_details">'
			html+='       <dl class="clearflaot">'
			html+='            <dt>'	
			html+='                 <img class="img_shopLogo" src="'+data.data.objects[i].goodsInfo.goodsLogo+'">'
            html+='                 <img class="img_miaoLogo" src="../img/icon_yu_s.png" alt="" />'			                
			html+='            </dt>'
			html+='            <dd>'	    			
			html+='                <div class="manage_details_top">'+data.data.objects[i].goodsInfo.goodsName+'</div>'
			html+='                <div class="manage_details_bottom clearfloat">'
			html+='                    <div class="manage_bottom_left">'
			html+='                        <div class="preOrder_bottom_price clearfloat">'
			html+='                            <div class="preOrder_bottom_specify">'+data.data.objects[i].goodsInfo.specInfo+'</div>'
			html+='                            <div class="preOrder_number" style="float: right;">X<span></xspan>'+data.data.objects[i].buyNum+'</div>'
			html+='                        </div>'
			html+='                        <div class="preOrder_bottom_money clearfloat">'
			html+='                            <div class="deposit">定金：'+data.data.objects[i].preGoods.frontMoney.toFixed(2)+'</div>'
			html+='                            <div class="payment" style="padding-left: 40px;">尾款：'+data.data.objects[i].preGoods.retainage.toFixed(2)+'</div>'
			html+='                        </div>'
			html+='                    </div>'
			html+='                    <div class="premanage_bottom_right" dataCode="'+data.data.objects[i].orderCode+'" datapreordercode="'+data.data.objects[i].orderCodeRetainage+'">'
			if(data.data.objects[i].preGoods.preStatus=='book'){
				html+='                    <div class="order_sunmit_status1">去支付</div>'		    				
			}else if(data.data.objects[i].preGoods.preStatus=='bookend'){
				html+='                    <div class="order_sunmit_status4" style="background:#f25f4f;font-size:20px">等待付尾款</div>'	
			}else if(data.data.objects[i].preGoods.preStatus=='notretainage'){
				html+='                    <div class="order_sunmit_status2">去支付</div>'	
			}else if(data.data.objects[i].preGoods.preStatus=='cancle' || data.data.objects[i].preGoods.preStatus=='expire'){
				html+='                    <div class="order_sunmit_status3" style="background:#f25f4f">删除</div>'
//	    			}else if(data.data.objects[i].preGoods.preStatus=='expire'){
//	    				html+='                    <div class="order_sunmit_status5" style="background:#f25f4f">已过期</div>'	
			}
			html+='                    </div>'
			html+='                </div>'
			html+='            </dd>'
			html+='       </dl>'
			html+='   </div>'    				    			
			html+='</div>'
		}	    				    		
		$('.order_manage_contain').append(html);
	};	    	
	//跳转到订单详情页面
	$('.order_manage_contain').on('click','.order_manage_content',function(){
		if ($(this).attr("datapreordercode")) {
			sessionStorage.orderCode=$(this).attr("datapreordercode");	    			
		}else{
			sessionStorage.orderCode=$(this).attr("dataCode");
		}
		localStorage.setItem("orderBack",'2');
		window.location.href="preOrderDetail.html";
	});	    		    	
	//支付定金跳转
	$('.order_manage_contain').on('click','.order_sunmit_status1',function(e){
		common.stopEventBubble(e);
        var preOrderCode=$(this).parent().attr('datacode');
        sessionStorage.setItem('orderCode',preOrderCode);
        localStorage.setItem("orderBack",'2');
		window.location.href='order_pay1.html';	    		
	});	    	
	//尾款支付跳转
	$('.order_manage_contain').on('click','.order_sunmit_status2',function(e){
		common.stopEventBubble(e);
		if($(this).parent().attr("datapreordercode")){
			var orderCode=$(this).parent().attr('datapreordercode');
			sessionStorage.setItem('orderCode',orderCode);
			window.location.href='order_pay.html';
		}else{
			var orderCode=$(this).parent().attr('dataCode');
			localStorage.setItem("orderType","3");
			sessionStorage.setItem('orderCode',orderCode);
			window.location.href='order_set_charge.html';
		}		       		        
        localStorage.setItem("orderBack",'2');	    			    		
	});	    	
    //点击删除
	$('.order_manage_contain').on('click','.order_sunmit_status3',function(e){
		common.stopEventBubble(e);
        var orderCode=$(this).parent().attr('datacode');
        sessionStorage.setItem('orderCode',orderCode);
        $('.order_refund,.refund_bg').css({'display':'block'});
        $("body").css("overflow-y","hidden");
        obj=$(this).parent().parent().parent().parent().parent().parent();		        	    		   		
	});	    	
	//点击确定
	$('.order_refund').on('click','.makeSure',function(){
		source='orderCode'+sessionStorage.orderCode;
		sign=md5(source+"key"+common.secretKey()).toUpperCase();
		//console.log(source+","+sign)
		if (sessionStorage.getItem("orderCode").substring(8,10)=="07") {	    			
			pre_orderDel("pre_order_del",sessionStorage.orderCode,sign,source,obj);
		} else{					
			pre_orderDel("order_del",sessionStorage.orderCode,sign,source,obj);
		}
	});	    	
	//点击弹出框取消
    $('.order_refund').on('click','.refund_cancle',function(){
    	$('.order_refund,.refund_bg').css({'display':'none'});
    	$("body").css("overflow-y","auto");
    });   
    //预购订单删除
	function pre_orderDel(method,orderCode,sign,source,obj){
		$.ajax({
			url:common.http,
			dataType:'jsonp',
			data:{
				method:method,
				orderCode:orderCode,
				tokenId:common.tokenId(),
				sign:sign,
				source:source
			},
			success:function(data){
				if(data.statusCode=='100000'){
					obj.hide();
				}else{
					common.prompt(data.strStatus)
				}
				//console.log(JSON.stringify(data))
			},
			error:function(data){
				common.prompt(data.strStatus)
			}
		});
	};	 
	//点击加载更多数据
	$('.management_contain').on('click','.lodemore',function(){				
		if ($(this).html()!='没有更多数据了') {
			pageNo++;
			person_order(userId,prePayStatus,pageNo,pageSize,sign,source);
		}				
	});       	
})