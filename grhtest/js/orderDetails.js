define(function(require, exports, module){

    require('jquery');
    var common = require('../lib/common');
    require('mdData');

	var orderCode=sessionStorage.getItem('orderCode');
    var source="orderCode"+orderCode;
    var sign=md5(source+"key"+common.secretKey()).toUpperCase();
    //console.log(source+","+sign)
    //订单详情   
    function orderDetail(orderCode,sign,source){
	    $.ajax({
		    url:common.http,		       
	        dataType:"jsonp",
	        data:{
		        method:'order_details',
		        orderCode:orderCode,
		        tokenId:common.tokenId(),
		        sign:sign,
		        source:source
		    },
			success:function(data){
				if (data.statusCode=="100000") {
					pageShow(data)
				}else{
					common.prompt(str)
				}
			},
			error:function(data){
				common.prompt(str)
			}
	    });
    };              
    orderDetail(orderCode,sign,source);               
    function pageShow(data){       
        //订单order_detail展示
        //console.log(JSON.stringify(data))
        $('.orderDetails_no').html('订单编号：'+data.data.orderInfo.orderCode);          
        $('.create_time').html('下单时间：'+data.data.orderInfo.createTime);
        $('.order_money').html('订单金额：￥'+data.data.orderInfo.realPayMoney.toFixed(2));
        $('.order_message').html('留言信息：'+data.data.orderInfo.message);
        if (data.data.orderInfo.paytime!="") {
        	$(".paytime").show().html("支付时间"+data.data.orderInfo.paytime);
        }
        //console.log(data.data.orderInfo.realSendTime)
        if (data.data.orderInfo.realSendTime!="") {
        	$(".sendGood_time").show().html("发货时间"+data.data.orderInfo.realSendTime);
        }


        var arr = ['支付方式：月卡支付','支付方式：微信支付']
        $('.order_pay').html(arr[data.data.orderInfo.payMethod])

        /*if(data.data.orderInfo.payMethod=='0'){
        	$('.order_pay').html('支付方式：月卡支付');              	
        }else if(data.data.orderInfo.payMethod=='3'){           	
        	$('.order_pay').html('支付方式：微信支付');
        }else if(data.data.orderInfo.payMethod=='4'){
        	$('.order_pay').html('支付方式：连连支付');            	
        }else if(data.data.orderInfo.payMethod=='5'){
        	$('.order_pay').html('支付方式：月卡支付');            	
        }else if(data.data.orderInfo.payMethod=='6'){
        	$('.order_pay').html('支付方式：在线支付');           	
        }; */                   
        //配送方式及地址显示
        $('.delivery,.order_goods_contain_details').css({'display':'block'})
        if(data.data.orderInfo.pickUpMethod=='1'){            	
        	$('.deli_take_good').html('门店自提');
        	$('.take_goods_address').css({'display':'none'});
        	$('.set_charge_address').css({'display':'block'});
        	$('.set_address_top').html('店名：'+data.data.firmInfo.firmName);
        	$('.set_address_bottom').html(data.data.firmInfo.address);
        	$('.set_job_time_left').html('营业时间：'+data.data.firmInfo.pickUpTime);          	
        }else if(data.data.orderInfo.pickUpMethod=='2'){
        	$('.deli_take_good').html('送货上门');
         	$('.set_charge_address').css({'display':'none'});
         	$('.take_goods_address').css({'display':'block'});
        	$('.goods_person_name').html(data.data.orderInfo.customName);
        	$('.goods_person_phone').html(data.data.orderInfo.customMobile);
        	$('.goods_person_address').html(data.data.orderInfo.receiveAddress);
        };                                                           
        //商品展示
        var html='';
        for(var i in data.data.orderInfo.orderDetailsList){
        	html+='<dl class="gds_box clearfloat">'
        	html+='    <dt>'
        	html+='         <img src="'+data.data.orderInfo.orderDetailsList[i].goodsLogo+'" alt="" />'            	
        	if(sessionStorage.activity=='1'){
                if (data.data.orderInfo.orderDetailsList[i].isspecial) {
					html +='<img class="gds_goods_te" src="../img/icon_te_s.png"/>'
				}
            }else if(sessionStorage.activity=='3'){
                html+='     <img class="gds_goods_te" src="../img/icon_miao_s.png" alt="" />'	
            }
            else if(sessionStorage.activity=='4'){
                html+='     <img class="gds_goods_te" src="../img/icon_yu_s.png" alt="" />'	
            }
        	html+='    </dt> '
        	html+='    <dd>'
        	html+='         <div class="gds_right_top">'+data.data.orderInfo.orderDetailsList[i].goodsName+'</div>'
        	html += '	    <div class="gds_right_center clearfloat">'
        	html += '		    <div class="gds_goods_mess float_left">'+data.data.orderInfo.orderDetailsList[i].specInfo+'</div>'
			html += '		    <div class="gds_num_price float_right clearfloat">'
			html += '	            <p class="gds_num float_right">X<span>'+data.data.orderInfo.orderDetailsList[i].buyNumber+'</span></p>'
			html += '	            <p class="gds_num float_right"><span></span></p>'
			html += '           </div>'
			html += '	    </div>'
        	html+='         <div class="gds_right_bottom">'
        	html += '			<p class="float_left"><span class="font_color">￥'+data.data.orderInfo.orderDetailsList[i].nowPrice.toFixed(2)+'</span></p>'
			html += '			<p class="float_left"><span class="font_color"></span></p>'              	          	
        	html+='         </div>'            	
        	html+='    </dd>'
        	html+='</dl>'
        };
		$(".order_goods_contain_details").append(html);
		$(".gds_box").eq(data.data.orderInfo.orderDetailsList.length-1).css("border-bottom","1px solid #FFF");			
        //支付金额运算详情
        if (sessionStorage.getItem("orderCode").substring(8,10)=="02") {
        	$('.order_set_list,.my_order_list1,.my_order_list7').show();
        	$('.my_order_list1 .order_set_list_right').html('￥'+data.data.orderInfo.orderDetailsList[0].goodsAllMoney.toFixed(2));
        	$('.my_order_list7 .order_set_list_right').html('￥'+data.data.orderInfo.realPayMoney.toFixed(2));
        } else{
        	$('.order_set_list,.my_order_list1,.my_order_list2,.my_order_list3,.my_order_list5,.my_order_list7').show();
            $('.my_order_list1 .order_set_list_right').html('￥'+data.data.orderInfo.orderDetailsList[0].goodsAllMoney.toFixed(2));
            $('.my_order_list2 .order_set_list_right').html('￥'+data.data.orderInfo.postCost.toFixed(2));
            $('.my_order_list3 .order_set_list_right').html('￥'+data.data.orderInfo.couponMoney.toFixed(2)); 
            if (data.data.orderInfo.couponStrategy=="1") {
    			$(".my_order_list5 .order_set_list_left").html("立减优惠");
    			$(".my_order_list5 .order_set_list_right").html("-￥"+data.data.orderInfo.derateAmount);
    		} else if(data.data.orderInfo.couponStrategy=="2"){
    			$(".my_order_list5 .order_set_list_left").html("折扣优惠");
    			$(".my_order_list5 .order_set_list_right").html("-￥"+data.data.orderInfo.derateAmount);
    		} else if(data.data.orderInfo.couponStrategy=="3"){
    			$(".my_order_list5 .order_set_list_left").html("赠送果币");
    			$(".my_order_list5 .order_set_list_right").html(data.data.orderInfo.offScore+"个");
    		} else if(data.data.orderInfo.couponStrategy=="4"){
    			$(".my_order_list5 .order_set_list_left").html("赠送优惠卷");
    			$(".my_order_list5 .order_set_list_right").html(data.data.orderInfo.derateAmount+"张");
    		} else{
    			$(".my_order_list5").hide();
    		} 
    		if(data.data.orderInfo.payMethod=='5'){
    			$('.my_order_list6').show()
    			$('.my_order_list6 .order_set_list_right').html('-￥'+data.data.orderInfo.mothReduceMoney.toFixed(2))
    		}	            
            $('.my_order_list7 .order_set_list_right').html('￥'+data.data.orderInfo.realPayMoney.toFixed(2))
    	};                                     
        //根据订单不同状态显示的样式
        if(data.data.orderInfo.orderStatus=='1' || data.data.orderInfo.orderStatus=='2'){
        	$('.order_status').html('待支付');
        	$('.situation_pay').css({'display':'block'});           	
        }else if(data.data.orderInfo.orderStatus=='3'){
        	if(data.data.orderInfo.pickUpMethod=='1'){
        		$('.order_status').html('待自提');         		
        	}else if(data.data.orderInfo.pickUpMethod=='2'){
        		$('.order_status').html('已付款');
        		$('.situation_fefund').css({'display':'block'});            		            		
        	}
        }else if(data.data.orderInfo.orderStatus=='4'){
        	$('.order_status').html('待收货');          	
        }else if(data.data.orderInfo.orderStatus=='5'){
        	$('.order_status').html('已签收');
        	$('.situation_comment').css({'display':'block'});            	
        }else if(data.data.orderInfo.orderStatus=='6' || data.data.orderInfo.orderStatus=='7'){
        	$('.order_status').html('已完成');       	
        }else if(data.data.orderInfo.orderStatus=='-1'){
        	$('.order_status').html('已作废');
        	$('.situation_delete').css({'display':'block'});
        	$('.order_situation').show();
        }else if(data.data.orderInfo.orderStatus=='-2'){
        	$('.order_status').html('退款中');
        	$('.order_situation').hide();
        } else if(data.data.orderInfo.orderStatus=='-3'){
        	$('.order_status').html('已退款');
        	$('.order_situation').hide();
        }            
    };
    //点击触发去评价，去支付，删除，取消，退款
    $('.order_situation').on('click',function(e){
    	common.stopEventBubble(e)
    	//console.log(e.target.className);
    	if (e.target.className=="situation_comment") {
    		sessionStorage.removeItem('orderColumn')
    		window.location.href='order_evaluation.html';
    	} else if (e.target.className=="sit_pay") {
    		window.location.href='order_pay.html';
    	} else {
    		$('.order_refund,.refund_bg').show();
        	$("body").css("overflow-y","hidden");
        	if (e.target.className=="situation_delete") {
        		$('.order_refund_confirm').html('确定删除订单？');  
        	} else if (e.target.className=="sit_cancel") {
        		$('.order_refund_confirm').html('确定取消订单？');  
        	} else if (e.target.className=="situation_fefund") {
        		$('.order_refund_confirm').html('确定退款？');
        	}
    	}
    });
    //返回上一级
    $('.header_left').on('click',function(){
    	window.history.back();
    });
    
    //点击确定
    $('.order_refund_choose .makeSure').on('click',function(e){
	    common.stopEventBubble(e);
	    if($('.order_refund_confirm').html()=='确定取消订单？'){  		    	
        	order_del("order_cancle",orderCode,sign,source);
	    }else if($('.order_refund_confirm').html()=='确定删除订单？'){  		    	 		         		     		   	    		
    		order_del("order_del",orderCode,sign,source);	    				    
	    }else if($('.order_refund_confirm').html()=='确定退款？'){
    		apply_refund(orderCode,sign,source);	    				    
	    } 		    	            
	});        
    //点击取消
	$('.order_refund_choose .refund_cancle').on('click',function(){
	    $('.order_refund').css({'display':'none'});
	    $("body").css("overflow-y","auto");
	});
	//点击遮罩
	$('.refund_bg').on('click',function(){
	    $('.order_refund').css({'display':'none'});
	    $("body").css("overflow-y","auto");
	}); 		
	                    
    //申请退款
    function apply_refund(orderCode,sign,source){
    	$.ajax({
    		url:common.http,
    		dataType:'jsonp',
    		data:{
    			method:'order_refund',
    			orderCode:orderCode,
    			tokenId:common.tokenId(),
    			sign:sign,
    			source:source
    		},
    		success:function(data){        			
    			//console.log(JSON.stringify(data)) 
    			if (data.statusCode=='100000') { 
    				window.location.href='orderDetails.html' 
    			}else{
    				common.prompt(data.statusStr)
    			}
    		},
    		error:function(data){
    			common.prompt(data.statusStr)
    		}
    	});
    };        	        	        	        	
    //取消订单
    //删除订单
    function order_del(method,orderCode,sign,source){
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
    			//console.log(JSON.stringify(data))
    			if (data.statusCode=='100000') { 
    				window.location.href="order_management.html"
    			}else{
    				common.prompt(data.statusStr)
    			}
    		},
    		error:function(data){
    			common.prompt(data.statusStr)
    		}
    	});
    };
})
