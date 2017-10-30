$(document).ready(function(){
	var userId=common.user_data().cuserInfoid;
	var pageNo=parseInt(common.pageNo);        	     	
	var pageSize=common.pageSize;
    var orderStatus='';             
    var source="userId"+userId;
    var sign=md5(source+"key"+common.secretKey()).toUpperCase();
    //console.log(source+","+sign)
    //删除、退款
    var sel;
    if(!sessionStorage.orderColumn || sessionStorage.orderColumn=='0'){
    	sessionStorage.setItem('orderColumn',0);
    	orderList(userId,orderStatus,pageNo,pageSize,sign,source);
    	$('.order_manage_list li').eq(parseInt(sessionStorage.orderColumn)).css({'color':'rgb(147,192,29)','border-bottom':'2px solid #93c01d'}).siblings().css({'color':'rgb(136,136,136)','border-bottom':'none'}); 
    }else{
    	if(sessionStorage.orderColumn=='1'){
    		orderStatus=1;
    		orderList(userId,orderStatus,pageNo,pageSize,sign,source);
    	}else if (sessionStorage.orderColumn=='2') {
    		orderStatus=3;
    		orderList(userId,orderStatus,pageNo,pageSize,sign,source);
    	}else if (sessionStorage.orderColumn=='3') {
    		orderStatus=4;
    		orderList(userId,orderStatus,pageNo,pageSize,sign,source);
    	}else if (sessionStorage.orderColumn=='4') {
    		orderStatus=7;
    		orderList(userId,orderStatus,pageNo,pageSize,sign,source);
    	};
    	$('.order_manage_list li').eq(parseInt(sessionStorage.orderColumn)).css({'color':'rgb(147,192,29)','border-bottom':'2px solid #93c01d'}).siblings().css({'color':'rgb(136,136,136)','border-bottom':'none'});
    };                   	
	$('.order_manage_list li').on('click',function(){
		$('.lodemore').css('display','none');
		var i=$('.order_manage_list li').index(this);
		$('.order_manage_contain .order_manage_content').remove();
		$('.order_manage_list li').eq(i).css({'color':'rgb(147,192,29)','border-bottom':'2px solid #93c01d'}).siblings().css({'color':'rgb(136,136,136)','border-bottom':'none'});
        switch ($(this).index()){
				case 0:
				orderStatus='';
				sessionStorage.setItem('orderColumn',0);
					break;
				case 1:
				orderStatus=1;
				sessionStorage.setItem('orderColumn',1);
					break;
				case 2:
				orderStatus=3;
				sessionStorage.setItem('orderColumn',2);
					break;
				case 3:
				orderStatus=4;
				sessionStorage.setItem('orderColumn',3);
					break;
			    case 4:
			    orderStatus=7;
			    sessionStorage.setItem('orderColumn',4);
			        break
		};
		//console.log(orderStatus)
		pageNo=1;
	    orderList(userId,orderStatus,pageNo,pageSize,sign,source);
	});      	        	        	        	
	//获取订单列表       	
	function orderList(userId,orderStatus,pageNo,pageSize,sign,source){
		$.ajax({
			url:common.http,
			dataType:'jsonp',
			data:{
				method:'order_list',
				userId:userId,
				orderStatus:orderStatus,
				pageNo:pageNo,
				pageSize:pageSize,
				tokenId:common.tokenId(),
				sign:sign,
				source:source
			},
			success:function(data){
				if (data.statusCode=='100000') {
					console.log(JSON.stringify(data));
					order_show(data);
				}else if(data.statusCode=='100712'){
					$('.lodemore').html('没有更多数据了').css('display','block');	
				}				    	
			},
			error:function(data){
				common.prompt(data.statusStr);
			}
		})
	};
	//判断订单下方提示语      	
	function order_show(data){        		
		isLast=data.data.isLast;   
        orderDetails(data);
        if(isLast){                	                	
        	$('.lodemore').html('没有更多数据了').show();              	
        }else{   
        	$('.lodemore').html('点击加载更多数据').show();            
        }
	};         		  
	//订单列表显示    
	function orderDetails(data){
		var html='';
		for(var i in data.data.objects){
	    	html+='<div class="order_manage_content" dataCode='+data.data.objects[i].orderCode+' dataActivityType='+data.data.objects[i].activityType+'>'
	   	    html+='   <div class="order_manage_num clearfloat">'
	   	    html+='      <div class="order_num_left">订单编号：'+data.data.objects[i].orderCode+'</div>'
	   	    if(data.data.objects[i].orderStatus=='1' || data.data.objects[i].orderStatus=='2'){
	   	        html+='      <div class="order_num_right">待支付</div>'
	   	    }else if(data.data.objects[i].orderStatus=='3'){
	   	        html+='      <div class="order_num_right">已付款</div>'	
	   	    }else if(data.data.objects[i].orderStatus=='4'){
	   	        html+='      <div class="order_num_right">待收货</div>'	
	   	    }else if(data.data.objects[i].orderStatus=='5'){
	   	    	html+='      <div class="order_num_right">待评价</div>'
	   	    }else if(data.data.objects[i].orderStatus=='6' || data.data.objects[i].orderStatus=='7'){
	   	        html+='      <div class="order_num_right">已完成</div>'	
	   	    }else if(data.data.objects[i].orderStatus=='-1'){
	   	        html+='      <div class="order_num_right">已作废</div>'	
	   	    }else if(data.data.objects[i].orderStatus=='-2'){
	   	        html+='      <div class="order_num_right">退款中</div>'	
	   	    }else if(data.data.objects[i].orderStatus=='-3'){
	   	   	    html+='      <div class="order_num_right">已退款</div>'
	   	    }
	   	    html+='   </div>'
	   	    html+='   <div class="order_manage_details">'
	   	    html+='       <dl>'
	   	    html+='           <dt dataActivityType='+data.data.objects[i].activityType+'>'
	   	    html+='                <img class="img_shopLogo" src="'+data.data.objects[i].orderLogo+'" alt="" /> '
            if(data.data.objects[i].activityType=='1'){
                html+=''	
            }else if(data.data.objects[i].activityType=='3'){
                html+='            <img class="img_miaoLogo" src="../img/icon_miao_s.png" alt="" />'	
            }
            else if(data.data.objects[i].activityType=='4'){
                 html+='           <img class="img_miaoLogo" src="../img/icon_yu_s.png" alt="" />'	
            }
	   	    html+='           </dt>'
	   	    html+='           <dd>'
	   	    html+='                <div class="manage_details_top">'+data.data.objects[i].allGoodsName+'</div>'
	   	    html+='                <div class="manage_details_bottom clearfloat">'
	   	    html+='                    <div class="manage_bottom_left">'     		   	                       
	   	    html+='                        <div class="order_bottom_money clearfloat">'
	   	    html+='                            <div class="order_bottom_money_left">￥'+data.data.objects[i].realPayMoney.toFixed(2)+'</div>'
	   	    html+='                            <div class="order_bottom_money_right">共'+data.data.objects[i].allGoodsCount +'件商品</div>'
	   	    html+='                        </div>'
	   	    html+='                    </div>'
	   	    html+='                    <div class="manage_bottom_right" dataCode='+data.data.objects[i].orderCode+' dataOrderMoney='+data.data.objects[i].goodsMoney+' dataPayMethod='+data.data.objects[i].payMethod+' dataStatus='+data.data.objects[i].orderStatus+'>'
		      		   	    if(data.data.objects[i].orderStatus=='1' || data.data.objects[i].orderStatus=='2'){
		      		   	        html+='      <div class="order_sunmit_status" style="background:#f68a42">去支付</div>'
		      		   	    }else if(data.data.objects[i].orderStatus=='3'){
		      		   	        /*html+='      <div class="order_sunmit_status" style="background:#f25f4f">退款</div>'	*/
		      		   	    }else if(data.data.objects[i].orderStatus=='4'){
		      		   	        if(data.data.objects[i].pickUpMethod=='1'){
		      		   	        	html+='  <div class="order_take_style1" style="background: #93c01d;">门店自提</div>'
		      		   	        }else if(data.data.objects[i].pickUpMethod=='2'){
		      		   	        	html+='  <div class="order_take_style2" style="background: #0398ff;">送货上门</div>'
		      		   	        }	     		   	
		      		   	    }else if(data.data.objects[i].orderStatus=='5'){
		      		   	    	html+='      <div class="order_sunmit_status" style="background:#93c01d">去评价</div>'
		      		   	    }else if(data.data.objects[i].orderStatus=='6' || data.data.objects[i].orderStatus=='7'){
		      		   	        html+=' '	
		      		   	    }else if(data.data.objects[i].orderStatus=='-1'){
		      		   	        html+='      <div class="order_sunmit_status" style="background:#f25f4f">删除</div>'	
		      		   	    }else if(data.data.objects[i].orderStatus=='-2'){
		      		   	        html+='      <div class="order_sunmit_status" style="background:#f25f4f">退款中</div>'	
		      		   	    }else if(data.data.objects[i].orderStatus=='-3'){
		      		   	   	    html+='      <div class="order_sunmit_status" style="background:#f25f4f">已退款</div>'
		      		   	    }    
	   	    html+='                    </div>'
	   	    html+='                </div>'
	   	    html+='            </dd>'
	   	    html+='        </dl>'
	   	    html+='    </div>' 
	   	    html+='</div>'
	    };   		          		    
	    $('.order_manage_contain').append(html);  
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
					sel.parent().parent().parent().parent().parent().parent().find(".order_num_right").html('退款中');
					sel.remove();
				}else{
					common.prompt(data.statusStr);
				}
			},
			error:function(data){
				common.prompt(data.statusStr);
			}
		})
	};        	   	        	
	//删除订单
	function order_del(orderCode,sign,source){
		$.ajax({
			url:common.http,
			dataType:'jsonp',
			data:{
				method:'order_del',
				orderCode:orderCode,
				tokenId:common.tokenId(),
				sign:sign,
				source:source
			},
			success:function(data){       				
				//console.log(JSON.stringify(data))  
				if (data.statusCode=='100000') {       					
					sel.parent().parent().parent().parent().parent().parent().remove();
				}else{
					common.prompt(data.statusStr);
				}
			},
			error:function(data){
				common.prompt(data.statusStr);
			}
		})
	};        	
	//根据不同状态跳转去支付页面或删除、退款
	$('.order_manage_contain').on('click','.order_sunmit_status',function(e){
		common.stopEventBubble(e);
		sessionStorage.setItem('orderCode',$(this).parent().attr('dataCode'));
	    var status=$(this).parent().attr('dataStatus');
	    sel=$(this);
	    //console.log(status)
	    if(status=='1' || status=='2'){       	    	
    	    window.location.href='order_pay.html';
	    }else if(status=='3'){
	    	$('.order_refund').css({'display':'block'});
	    	$('.order_refund_confirm').html('确定退款？');
	    	$("body").css("overflow-y","hidden");
	    }else if(status=='5'){
	    	sessionStorage.removeItem('orderColumn');
	    	window.location.href='order_evaluation.html';
	    }else if(status=='-1'){
	    	$('.order_refund').css({'display':'block'});
	    	$('.order_refund_confirm').html('确定删除？');
	    	$("body").css("overflow-y","hidden");
	    }
	});
	//点击跳转订单详情页面
	$('.order_manage_contain').on('click','.order_manage_content',function(){
		sessionStorage.setItem('orderCode',$(this).attr('dataCode'));
		sessionStorage.setItem('activity',$(this).attr('dataActivityType'));
		localStorage.setItem("orderBack",'1');    		   
	    if (sessionStorage.getItem("orderCode").substring(8,10)=="05") {				
			window.location.href='preOrderDetail.html';
		} else{				
			window.location.href='orderDetails.html';
		}
	});        	
	//点击加载更多数据
	$('.management_contain').on('click','.lodemore',function(){				
		if ($(this).html()!='没有更多数据了') {			
			pageNo++;			
			orderList(userId,orderStatus,pageNo,pageSize,sign,source);
		}
	});       	
	//点击返回上一级
	$(".header_left").on('click',function(){
		window.location.href="my.html";
		sessionStorage.removeItem('orderColumn');
	});			
	$('.order_refund_choose .makeSure').on('click',function(e){
		common.stopEventBubble(e);	    		
		var orderCode=sessionStorage.orderCode;
		source="orderCode"+orderCode;
		sign=md5(source+"key"+common.secretKey()).toUpperCase();
		//console.log(source+","+sign)
		if($('.order_refund_confirm').html()=="确定退款？") {	    			
			apply_refund(orderCode,sign,source);			        
		}else if($('.order_refund_confirm').html()=="确定删除？"){
			order_del(orderCode,sign,source);
		}
       	//setTimeout(function(){
	        $('.order_refund').hide();
        //},500)	            
    });
	$('.order_refund').on("click",function(e){
		common.stopEventBubble(e);
		if (e.target.className=="refund_cancle" || e.target.className=="refund_bg"  ) {
			$('.order_refund').hide();
			$("body").css("overflow-y","auto");
		}
	});
})