$(document).ready(function(){
	//删除订单方法名
    var method;	  
    //订单详情方法名
    var preMethod;
    //判断是预购定金还是尾款等订单
    var orderCode=sessionStorage.getItem('orderCode');
    var source="orderCode"+orderCode;
    var sign=md5(source+"key"+common.secretKey()).toUpperCase();
    //console.log(source+","+sign)
    if (sessionStorage.getItem("orderCode").substring(8,10)=="07") {
		preOrderDetail('pre_order_details',orderCode,sign,source);
	} else{
		preOrderDetail('order_details',orderCode,sign,source);	
	}	 
    //预购订单详情
    function preOrderDetail(preMethod,orderCode,sign,source){
    	$.ajax({
    		url:common.http,
    		dataType:'jsonp',
    		data:{
    			method:preMethod,
    			orderCode:orderCode,
    			tokenId:common.tokenId(),
    			sign:sign,
    			source:source
    		},
    		success:function(data){
    			//console.log(JSON.stringify(data))
    			if (data.statusCode=="100000") {
    				if(orderCode.substring(8,10)=="07"){
    					preOrder_show(data)
    				}else{
    					order_show(data)
    				}
    				
    			}else{
    				common.prompt(data.strStatus)
    			}
    		},
    		error:function(data){
    			common.prompt(data.strStatus)
    		}
    	});
    };	    	    	    		    
    //未提交订单时的页面展示
    function preOrder_show(data){
    	//头部信息
    	$('.create_time').html('下单时间：'+data.data.createTime);
    	$('.frontMoney_pay').html('实付定金：￥'+data.data.frontMoney.toFixed(2));
    	$('.frontMoney_time').html('定金支付时间：'+setTime(data.data.preGoods.frontMoneyStart)+'——'+setTime(data.data.preGoods.frontMoneyEnd));
    	$('.retainage_time').html('尾款支付时间：'+setTime(data.data.preGoods.retainageStart)+'——'+setTime(data.data.preGoods.retainageEnd));
    	//订单创建时间等展示
    	$('.order_set_list').show();
    	$('.preOrder_num').html('订单编号：'+data.data.orderCode);
    	if(data.data.payStatus=='1'){
    		$('.order_status').html('待付定金');
    		$('.situation_pay').show();
    		$('.my_order_list1').show().find(".order_set_list_right").html('￥'+data.data.frontMoney.toFixed(2));
    		$('.my_order_list5').show().find(".order_set_list_right").html('￥'+data.data.frontMoney.toFixed(2));
    	}else if(data.data.payStatus=='2' || data.data.payStatus=='3'){
    		$('.order_status').html('等待付尾款');
    		$('.my_order_list1').show().find(".order_set_list_right").html('￥'+data.data.frontMoney.toFixed(2));
    		$('.my_order_list5').show().find(".order_set_list_right").html('￥'+data.data.frontMoney.toFixed(2));
			if(data.data.preGoods.preStatus=='bookend'){
				$('.situation_delete2').show();
			}else if(data.data.preGoods.preStatus=='notretainage'){
				$('.situation_delete1').show();
			}else{
				$(".order_situation").hide();
			}
    	}else if(data.data.payStatus=='-1'){
    		$('.order_status').html('已作废');
    		$('.my_order_list1').show().find(".order_set_list_right").html('￥'+data.data.frontMoney.toFixed(2));
    		$('.my_order_list5').show().find(".order_set_list_right").html('￥'+data.data.frontMoney.toFixed(2));
    		$('.situation_delete').show();
    	}
        //商品展示
        var html='';
        	html += '<dl class="gds_box clearfloat">'
        	html += '    <dt>'
        	html += '         <img src="'+data.data.goodsInfo.goodsLogo+'" alt="" />' 
        	html += '         <img class="gds_goods_te" src="../img/icon_yu_s.png" alt="" />'	
        	html += '    </dt> '
        	html += '    <dd>'
        	html += '         <div class="gds_right_top">'+data.data.goodsInfo.goodsName+'</div>'
        	html += '         <div class="gds_right_center">'
        	html += '		    <div class="gds_goods_mess float_left">'+data.data.goodsInfo.specInfo+'</div>'
			html += '		    <div class="gds_num_price float_right clearfloat">'
			html += '	            <p class="gds_num float_right">X<span>'+data.data.buyNum+'</span></p>'
			html += '	            <p class="gds_num float_right"><span></span></p>'
			html += '           </div>'
        	html += '         </div>'
        	html += '       <div class="gds_right_bottom">'
        	html += '			<p class="float_left">定金：<span class="font_color">￥'+data.data.preGoods.frontMoney.toFixed(2)+'</span></p>'
			html += '			<p class="float_left">尾款：<span class="font_color">￥'+data.data.preGoods.retainage.toFixed(2)+'</span></p>'              	          	
        	html += '         </div>' 
        	html += '    </dd>'
        	html += '</dl>'
        $('.order_goods_contain_details').append(html);
		$(".gds_box").css("border-bottom","1px solid #FFF");           
    };	    	    	    
    //已提交订单后的页面展示
    function  order_show(data){
    	$('.preOrder_num').html('订单编号：'+data.data.preOrderRecord.orderCodeRetainage);	    	
    	if(data.data.preOrderRecord.payStatus=='3'){	    		
			$('.order_status').html('等待付尾款');
			$(".situation_delete1").show();
    	}else if(data.data.preOrderRecord.payStatus=='4'){
    		if(data.data.orderInfo.orderStatus=='3'){
            	$('.order_status').html('已付款');
            	$(".order_situation,.situation_delete3").show();
            }else if(data.data.orderInfo.orderStatus=='4'){
            	$('.order_status').html('待收货');          	
            }else if(data.data.orderInfo.orderStatus=='5'){
            	$('.order_status').html('已签收');
            	$('.situation_comment').css({'display':'block'})            	
            }else if(data.data.orderInfo.orderStatus=='6' || data.data.orderInfo.orderStatus=='7'){
            	$('.order_status').html('已完成');       	
            }else if(data.data.orderInfo.orderStatus=='-2'){
            	$('.order_status').html('退款中');
            	$('.order_situation').hide();
            } else if(data.data.orderInfo.orderStatus=='-3'){
            	$('.order_status').html('已退款');
            	$('.order_situation').hide();
            }
    	}else if(data.data.preOrderRecord.payStatus=='-1'){
    		$('.order_status').html('已作废');
    		$(".situation_delete").show();
    	}
    	$('.create_time').html('下单时间：'+data.data.preOrderRecord.createTime);
    	$('.frontMoney_pay').html('实付定金：￥'+data.data.preOrderRecord.frontMoney.toFixed(2));
    	$('.retainage_pay').show().html('实付尾款：￥'+data.data.preOrderRecord.retainage.toFixed(2));
    	$('.frontMoney_time').html('定金支付时间：'+setTime(data.data.preOrderRecord.preGoods.frontMoneyStart)+'——'+setTime(data.data.preOrderRecord.preGoods.frontMoneyEnd));
    	$('.retainage_time').html('尾款支付时间：'+setTime(data.data.preOrderRecord.preGoods.retainageStart)+'——'+setTime(data.data.preOrderRecord.preGoods.retainageEnd));	    		    	
    	if(data.data.orderInfo.payMethod=='0'){
        	$('.order_pay').html('支付方式：月卡支付');           	                  	           
        }else if(data.data.orderInfo.payMethod=='3'){
        	$('.order_pay').html('支付方式：微信支付');
        }else if(data.data.orderInfo.payMethod=='4'){
        	$('.order_pay').html('支付方式：连连支付');
        }else if(data.data.orderInfo.payMethod=='5'){
        	$('.order_pay').html('支付方式：月卡支付');
        }else if(data.data.orderInfo.payMethod=='6'){
        	$('.order_pay').html('支付方式：在线支付');     
        }
        $('.order_message').show().html('留言信息：'+data.data.orderInfo.message);                        
        //配送方式及地址显示           
    	$('.delivery,.take_goods_address_contain,.order_set_list').show()
    	if(data.data.orderInfo.pickUpMethod=='1'){
        	$('.deli_take_good').html('门店自提');
        	$('.take_goods_address').hide();
        	$('.set_charge_address').show();
        	$('.set_address_top').html('店名：'+data.data.firmInfo.firmName);
        	$('.set_address_bottom').html(data.data.firmInfo.address);
        	$('.set_job_time_left').html('营业时间：'+data.data.firmInfo.pickUpTime);        	
        }else if(data.data.orderInfo.pickUpMethod=='2'){
        	$('.deli_take_good').html('送货上门');
        	$('.take_goods_address').show();
         	$('.set_charge_address').hide();
        	$('.goods_person_name').html(data.data.orderInfo.customName);
        	$('.goods_person_phone').html(data.data.orderInfo.customMobile);
        	$('.goods_person_address').html(data.data.orderInfo.receiveAddress);
        }
        var html='';
    	html+='<dl class="gds_box clearfloat">'
    	html+='    <dt>'
    	html+='         <img src="'+data.data.orderInfo.orderDetailsList[0].goodsLogo+'" alt="" />'            	
    	html+='         <img class="gds_goods_te" src="../img/icon_yu_s.png" alt="" />'
    	html+='    </dt> '
    	html+='    <dd>'
    	html+='         <div class="gds_right_top">'+data.data.orderInfo.orderDetailsList[0].goodsName+'</div>'
    	html += '	    <div class="gds_right_center clearfloat">'
    	html += '		    <div class="gds_goods_mess float_left">'+data.data.orderInfo.orderDetailsList[0].specInfo+'</div>'
		html += '		    <div class="gds_num_price float_right clearfloat">'
		html += '	            <p class="gds_num float_right">X<span>'+data.data.orderInfo.orderDetailsList[0].buyNumber+'</span></p>'
		html += '	            <p class="gds_num float_right"><span></span></p>'
		html += '           </div>'
		html += '	    </div>'
    	html+='         <div class="gds_right_bottom">'
    	html += '			<p class="float_left">定金：<span class="font_color">￥'+data.data.preOrderRecord.preGoods.frontMoney.toFixed(2)+'</span></p>'
		html += '			<p class="float_left">尾款：<span class="font_color">'+data.data.preOrderRecord.preGoods.retainage.toFixed(2)+'</span></p>'              	          	
    	html+='         </div>'            	
    	html+='    </dd>'
    	html+='</dl>'
		$(".order_goods_contain_details").append(html);
		$(".gds_box").css("border-bottom","1px solid #FFF");                                   
        //订单金额详情
        $('.my_order_list1').show().find(".order_set_list_right").html('￥'+data.data.preOrderRecord.frontMoney.toFixed(2));
    	$('.my_order_list2').show().find(".order_set_list_right").html('￥'+data.data.preOrderRecord.retainage.toFixed(2));
    	$('.my_order_list3').show().find(".order_set_list_right").html('￥'+data.data.orderInfo.postCost.toFixed(2));
    	if (data.data.orderInfo.payMethod=="5") {
    		$('.my_order_list4').show().find(".order_set_list_right").html('-￥'+data.data.orderInfo.mothReduceMoney.toFixed(2));
    	}
    	$('.my_order_list5').show().find(".order_set_list_right").html('￥'+data.data.orderInfo.realPayMoney.toFixed(2));
    };	    	   
    //处理时间
	function setTime(time){
		return time.substring(5,16);
	};
	//根据状态判断执行的操作
	$('.order_situation').on('click',function(e){
		common.stopEventBubble(e);
		if(e.target.className=='sit_pay'){
			window.location.href='order_pay1.html';
		}else if(e.target.className=='situation_delete1'){
			if (sessionStorage.getItem("orderCode").substring(8,10)=="07") {
        		window.location.href='order_set_charge.html';
			} else{				
				sessionStorage.setItem('orderCode',orderCode)
        		window.location.href='order_pay.html';
			}
		}else if(e.target.className=='situation_comment'){
			localStorage.removeItem("preColumn");
			localStorage.removeItem("orderColumn");
        	window.location.href='order_pay.html';
		}else{
			$('.order_refund,.refund_bg').show();
			$("body").css("overflow-y","hidden");
			if(e.target.className=='situation_delete'){
        		$('.order_refund_confirm').html('确定删除订单？'); 
			}else if(e.target.className=='sit_cancel'){
        		$('.order_refund_confirm').html('确定取消订单？'); 	
			}else if (e.target.className=='situation_delete3') {
				$('.order_refund_confirm').html('确定退款？');  
			}
		}
	});
    //点击确定
    $('.order_refund').on('click','.makeSure',function(){
    	if($('.order_refund_confirm').html()=="确定删除订单？") {
    		//console.log(orderCode)
    		if (sessionStorage.getItem("orderCode").substring(8,10)=="07") {				
				orderDel("pre_order_del",orderCode,sign,source);
			} else{				
				orderDel("order_del",orderCode,sign,source);
			}
		}else if($('.order_refund_confirm').html()=="确定取消订单？"){    			
			orderDel("order_cancle",orderCode,sign,source);
		}else if ($('.order_refund_confirm').html()=="确定退款？") {
			apply_refund(orderCode,sign,source);
		}
    });        
    //点击弹出框取消
    $('.order_refund').on('click','.refund_cancle',function(){
    	$('.order_refund,.refund_bg').hide();
    	$("body").css("overflow-y","auto");
    });  
    //预购订单删除
	function orderDel(method,orderCode,sign,source){
		//console.log(method)
		//console.log(orderCode)
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
				console.log(JSON.stringify(data))
				if(data.statusCode=='100000'){
					window.location.href='PreOrder_management.html'
				}else{
					common.prompt(data.strStatus)
				}   				
			},
			error:function(data){
				common.prompt(data.strStatus)
			}
		});
	};
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
    //返回上一级
    $('.header_left').on('click',function(){
    	if(localStorage.orderBack=='1'){
    		window.location.href='order_management.html';
    	}else if(localStorage.orderBack=='2'){
    		window.location.href='PreOrder_management.html';
    	}
    });
})
