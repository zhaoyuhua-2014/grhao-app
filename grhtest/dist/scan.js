

require(['../require/config'],function(){
	require(['common','mobileUi','pull'],function(common){
		// 命名空间

		pub = {};
		 
		pub.logined = common.isLogin(); // 是否登录
	
		pub.PAGE_INDEX = common.PAGE_INDEX; // 索引
	
		pub.PAGE_SIZE = common.PAGE_SIZE; // 页面显示数据个数
	
		pub.moduleId = $('[module-id]').attr( 'module-id' );  // 模块 id 
	
		if( pub.logined ){
			pub.userId = common.user_datafn().cuserInfoid;
			pub.source = "userId" + pub.userId;
			pub.sign = md5( pub.source + "key" + common.secretKeyfn() ).toUpperCase();
			pub.tokenId = common.tokenIdfn();
			pub.userBasicParam = {
				userId : pub.userId,
				source : pub.source,
				sign : pub.sign,
				tokenId : pub.tokenId
			}
		}else{
			common.goHomeApp(); // 未登录跳转
		}
	
		pub.toFixed = common.toFixed; 
	
		//  命名空间   订单管理
		pub.orderManagement = {};
	
		pub.orderManagement.orderStatusHash = [ '', 1, 3, 4, 7 ,8]; // ''，全部，1，待支付，3，已付款，4，待收货，7，已完成 处理 tab -----0531新增8.取货中
		
		//订单状态
		//-3已退款、-2退款中、-1已作废、1，2待支付、3已付款、4待收货，5待评价、6已评价、6,7已完成
		//2017-11-27和彭哥核对订单状态
		/*
		 7-为已完成对应为去评价的操作
		 6-为评价完成对应订单完成的操作
		 
		 * */
		//watm添加-4已过期
		pub.orderManagement.orderStatus = null; // 存储当前状态  处理 tab
	
		pub.orderManagement.isLast = null; // 最后一页 
	
		pub.orderManagement.tabIndex = common.orderColumn.getItem(); 
	
		!pub.orderManagement.tabIndex && ( pub.orderManagement.tabIndex = '0' ); // tab 不存在默认设置为 0
	
		pub.orderManagement.orderStatusLabel = ['订单超时','已退款','退款中','已作废','','待支付','待支付','已付款','待收货','已完成','已完成','待评价','取货中']; // 订单状态标签
	
		pub.orderManagement.orderCode = null;  // 订单编号
	
		pub.orderManagement.orderItemStatus = null; // 某一订单的状态
	
		pub.orderManagement.userBasicParam = {
			userId : pub.userId,
			tokenId : pub.tokenId
		}
	
		pub.orderManagement.apiHandle = {
			init : function(){
				
				$(".order_manage_list li").eq(pub.orderManagement.tabIndex).addClass("actived");
				pub.orderManagement.orderStatus = pub.orderManagement.orderStatusHash[ pub.orderManagement.tabIndex ];
				pub.PAGE_INDEX = 1; // 页码重置

				pub.orderManagement.apiHandle.order_list.init();
			},
			order_list : { // 订单列表
				init : function(){
					common.ajaxPost($.extend({
						method : 'order_list',
						orderStatus : pub.orderManagement.orderStatus,
						pageNo : pub.PAGE_INDEX,
						pageSize : pub.PAGE_SIZE
					},pub.userBasicParam),function( d ){
						if ( d.statusCode == '100000' ) {
							pub.orderManagement.apiHandle.order_list.apiData( d );
						}else if( d.statusCode == common.SESSION_EXPIRE_CODE ){
							common.clearData();
							common.prompt( '省份验证过期，请重新登录' );
							common.setMyTimeout(function(){
								common.jumpLinkPlain( 'login.html' );
							},1000);
						}else if( d.statusCode == '100712' ){
							$('.lodemore').html('没有更多数据了').show();	
						}	
					});
				},
				apiData : function( d ){
					pub.orderManagement.isLast = d.data.isLast;
		       		var html = '', i = 0;
		       		if (pub.PAGE_INDEX == 1) {
		       			$(".order_manage_contain").html("")
		       		}
		       		$.each( d.data.objects, function( i, v ){
		       	    	html += '<div class="order_manage_content" dataCode=' + v.orderCode + ' dataActivityType=' + v.activityType + '>'
		       	   	    html += '   <div class="order_manage_num clearfloat">'
		       	   	    html += '      <div class="order_num_left">订单编号：' + v.orderCode + '</div>'
	
		       	   	    html += '      <div class="order_num_right">' + pub.orderManagement.orderStatusLabel[ v.orderStatus + 4 ] + '</div>'
	
		       	   	    html += '   </div>'
		       	   	    html += '   <div class="order_manage_details">'
		       	   	    html += '       <dl>'
		       	   	    html += '           <dt dataActivityType=' + v.activityType + '>'
		       	   	    html += '                <img class="img_shopLogo" src="' + v.orderLogo + '" alt="" /> '
	
	                    v.activityType == '1' && ( html += '' ) 	
	                   	v.activityType == '3' && ( html += '            <img class="img_miaoLogo" src="../img/icon_miao_s.png" alt="" />' )	
	                   	v.activityType == '4' && ( html += '           <img class="img_miaoLogo" src="../img/icon_yu_s.png" alt="" />' )
	
		       	   	    html += '           </dt>'
		       	   	    html += '           <dd>'
		       	   	    html += '                <div class="manage_details_top">' + v.allGoodsName + '</div>'
		       	   	    html += '                <div class="manage_details_bottom clearfloat">'
		       	   	    html += '                    <div class="manage_bottom_left">'     		   	                       
		       	   	    html += '                        <div class="order_bottom_money clearfloat">'
		       	   	    html += '                            <div class="order_bottom_money_left">￥' + pub.toFixed( Number(v.realPayMoney) ) +'</div>'
		       	   	    html += '                            <div class="order_bottom_money_right">共' + v.allGoodsCount + '件商品</div>'
		       	   	    html += '                        </div>'
		       	   	    html += '                    </div>'
		       	   	    html += '                    <div class="manage_bottom_right" dataCode=' + v.orderCode + ' dataOrderMoney=' + v.goodsMoney + ' dataPayMethod=' + v.payMethod + ' dataStatus=' + v.orderStatus + '>'
		       		    
		       		    if ( v.orderStatus == '1'  || v.orderStatus == '2' )  html += '      <div class="order_sunmit_status" style="background:#f68a42">去支付</div>'  
		       		    v.orderStatus == '4'  && v.pickUpMethod == '1' && ( html += '  <div class="order_take_style1" style="background: #93c01d;">门店自提</div>' )
		       		    v.orderStatus == '4'  && v.pickUpMethod == '2' && ( html += '  <div class="order_take_style2" style="background: #0398ff;">送货上门</div>' )
		       		    v.orderStatus == '7'  && ( html += '      <div class="order_sunmit_status" style="background:#93c01d">去评价</div>' )
		       		   	v.orderStatus == '-1' && ( html += '      <div class="order_sunmit_status" style="background:#f25f4f">删除</div>' ) 
		       		      
		       	   	    html += '                    </div>'
		       	   	    html += '                </div>'
		       	   	    html += '            </dd>'
		       	   	    html += '        </dl>'
		       	   	    html += '    </div>' 
		       	   	    html += '</div>'
		       	    }); 
	
			       	$('.order_manage_contain').append( html ); 
			        pub.orderManagement.isLast && $('.lodemore').removeClass('loadMore').html('没有更多数据了').show();
			        !pub.orderManagement.isLast && $('.lodemore').addClass('loadMore').html('点击加载更多数据').show();
			        //pub.myScroll.refresh();
			        if (pub.isrefresh) {
				 		//pub.iscroll.resetload();
				 		pub.pullInstance.pullDownSuccess();
				 	}
				}
			},
	
			order_del : { // 订单删除
	
				init : function(){
					common.ajaxPost($.extend({
						method : 'order_del',
						orderCode : pub.orderManagement.orderCode,
					},pub.orderManagement.userBasicParam),function( d ){
						if( d.statusCode == '100000' ){
							$('.order_manage_content[datacode=' + pub.orderManagement.orderCode + ']').remove();
						}else if( d.statusCode == common.SESSION_EXPIRE_CODE ){
							common.clearData();
							common.prompt( '身份验证过期，请重新登录' );
							common.setMyTimeout(function(){
								common.jumpLinkPlain( 'login.html' );
							},1000);
						} 
						d.statusCode != '100000' && common.prompt( d.statusStr );
						
					})
				}
			},
			trueFn : function(){
				var 
				source = pub.orderManagement.userBasicParam.source = "orderCode" + pub.orderManagement.orderCode;

				pub.orderManagement.userBasicParam.sign = md5( source + "key" + common.secretKeyfn() ).toUpperCase();

				pub.orderManagement.apiHandle.order_del.init();
			}
		};
	
	
		pub.orderManagement.eventHandle = {
	
			init : function(){
				// tab切换
				$('.order_manage_list li').on('click',function(){
	
					var 
					lodemore = $('.lodemore'),
					$this = $(this),
					i = $this.index(),
					isCur = $this.is('.actived');
					pub.orderManagement.tabIndex = i;
					
					if( !isCur ){
	
						$('.order_manage_contain').empty();// 清空数据
	
						lodemore.is(':visible') && lodemore.hide();
	
						$this.addClass('actived').siblings().removeClass('actived');
	
						pub.orderManagement.orderStatus = pub.orderManagement.orderStatusHash[ i ];
	
						common.orderColumn.setItem( i );
	
						pub.PAGE_INDEX = 1; // 页码重置
	
						pub.orderManagement.apiHandle.order_list.init();
					}
	
				});
	
				//$('.order_manage_list li').eq( +pub.orderManagement.tabIndex ).trigger('click'); // 触发点击事件
	
				//  点击加载更多
				$('.management_contain').on('click','.loadMore.lodemore',function( e ){
					common.stopEventBubble( e );
					pub.PAGE_INDEX ++ ;	
					pub.orderManagement.apiHandle.order_list.init();
				});
	
				// 订单操作处理
				$('.order_manage_contain').on('click','.order_sunmit_status',function(e){
					common.stopEventBubble(e);
	
					var $this = $(this);
	
					pub.orderManagement.orderCode = $this.parent().attr('dataCode');
	
					common.orderCode.setItem( pub.orderManagement.orderCode );
	
				 	var status = pub.orderManagement.orderItemStatus = $this.parent().attr('dataStatus');
	
	
				    if( status == '1' || status == '2' ){   // 去支付
	
			    	    common.jumpLinkPlainApp( "订单支付",'html/order_pay.html' );
	
				    }else if( status == '7' ){ // 评价
	
				    	common.orderColumn.removeItem();
				    	common.jumpLinkPlainApp( '订单评价','html/order_evaluation.html' );
	
				    }else if( status == '-1' ){
	
				    	var data = {
							type:1,
							title:'确定删除？',
							canclefn:'cancleFn',
							truefn:'trueFn'
						}
						common.alertMaskApp(JSON.stringify(data));
	
				    }
				});
	
	
			    //点击跳转订单详情页面
				$('.order_manage_contain').on('click','.order_manage_content',function(){
	
					var $this = $(this),
					activityType = $this.attr('dataactivitytype');
	
					common.orderBack.setItem( '1' );
					common.orderCode.setItem( $this.attr('dataCode') ); //存储订单编号
	
				    activityType == 5  && common.jumpLinkPlainApp( '订单详情','html/preOrderDetail.html' ); // 预购订单详情
				    activityType != 5 && common.jumpLinkPlainApp( '订单详情','html/orderDetails.html' ); // 普通订单详情
	
				}); 
			},
		};
	
		// 订单列表入口
		pub.orderManagement.init = function(){
			pub.orderManagement.apiHandle.init()
			pub.orderManagement.eventHandle.init();  // 事件初始化
		};
	
	/************************************* 订单详情模块 **************************/
		
		// 命名空间
	
		pub.orderDetail = {};
	
		pub.orderDetail.orderCode = common.orderCode.getItem(); // 订单编号
	
		pub.orderDetail.source = "orderCode" + pub.orderDetail.orderCode;
	
		pub.orderDetail.sign = md5( pub.orderDetail.source + "key" + common.secretKeyfn()).toUpperCase();
	
		pub.orderDetail.userBasicParam = {
			userId : pub.userId,
			tokenId : pub.tokenId,
			source : pub.orderDetail.source,
			sign : pub.orderDetail.sign
		}
	
		// 支付方式
		pub.orderDetail.PAY_METHODS = [ '支付方式：支付宝支付', '支付方式：微信支付', '支付方式：快捷支付', '支付方式：账户余额', '', '支付方式：现金支付' ];
	
		// 优惠方式
		pub.orderDetail.COUPON_TYPE = [
			{ text : '立减优惠', label :'-￥', derateAmount : 'derateAmount'},
			{ text : '折扣优惠', label :'-￥', derateAmount : 'derateAmount'},
			{ text : '赠送果币', label : "个", derateAmount : 'offScore'},
			{ text : '赠送优惠卷', label : '元', derateAmount : 'offItemVal'}];
	
		// 费用详情
		pub.orderDetail.MONEY_DETAIL = [ 'goodsMoney', 'postCost', 'couponMoney' ];
	
		// 提示信息处理
		pub.orderDetail.TIP_MESSAGE = { 
			'refundBtn' : { text : '确定退款？', apiMethod : 'order_refund' }, 
			'unpayOperate' : { text : '确定取消订单？', apiMethod : 'order_cancle' }, 
			'deleteBtn' : { text : '确定删除订单？', apiMethod : 'order_del' }
		};
	
		// 不同状态 用户操作数据结构
		pub.orderDetail.OPERATE = [
	    	{ text : '订单超时', className : 'delete-btn',btnText : '删除'}, // -4
	    	{ text : '已退款', className : 'hide', btnText : '' }, // -3
	    	{ text : '退款中', className : 'hide', btnText : '' }, // -2
	    	{ text : '已作废', className : 'delete-btn', btnText : '删除'}, // -1
	    	{ text : '',       className : 'hide', btnText : '' }, // 0 
	    	{ text : '待支付', className : 'unpay-operate', btnText : '' }, // 1
	    	{ text : '待支付', className : 'unpay-operate', btnText : '' }, // 2
	    	{ text : '',       className : 'refund-btn', btnText : '退款', pickUpMethod : ['待自提','已付款']}, // 3
	    	{ text : '待收货', className : 'hide', btnText : ''}, // 4
	    	{ text : '已完成', className : 'hide', btnText : '评论'}, // 5
	    	{ text : '已完成', className : 'hide', btnText : ''}, // 6
	    	{ text : '已完成', className : 'comment-btn', btnText : '评论'}, // 7
			{ text : '取货中', className : 'hide', btnText : ''}]; // 8
	
	    pub.orderDetail.METHOD = null; // 接收方法
	
	    // 删除成功后 地址关联
	    pub.orderDetail.URL_RELATED = {
	    	'order_refund' : 'html/orderDetails.html',
	    	'order_cancle' : 'html/order_management.html',
	    	'order_del' : 'html/order_management.html'
	    };
		pub.orderDetail.TIT_RELATED = {
	    	'order_refund' : '订单详情',
	    	'order_cancle' : '订单管理',
	    	'order_del' : '订单管理'
	    };
	   
	
		// 详情接口处理
		pub.orderDetail.apiHandle = {
			init : function(){
				pub.orderDetail.apiHandle.order_details.init();
			},
			order_details : {
				init : function(){
					common.ajaxPost($.extend({},pub.orderDetail.userBasicParam,{
						method : 'order_details',
						orderCode : pub.orderDetail.orderCode
					}),function( d ){
	
						if( d.statusCode == "100000" ){
							pub.orderDetail.apiHandle.order_details.apiData( d );
						}else if( d.statusCode == common.SESSION_EXPIRE_CODE ){
							common.clearData();
							common.prompt( '省份验证过期，请重新登录' );
							common.setMyTimeout(function(){
								common.jumpLinkPlainApp( "登录",'html/login.html' );
							},1000);
						}else{
							common.prompt( d.statusCode );
						}
					})
				},
				apiData : function( d ){
					var orderInfo = d.data.orderInfo;
					var firmInfo = d.data.firmInfo,
						firmIdType = firmInfo.type;
					pub.isMachineGoods = orderInfo.isMachineGoods == 1;
					
			        $('.orderDetails_no').html( '订单编号：' + orderInfo.orderCode );          
			        $('.create_time').html( '下单时间：' + orderInfo.createTime );
			        $('.order_money').html( '订单金额：￥' + pub.toFixed( Number(orderInfo.realPayMoney) ) );
			        if (firmIdType == '5') {
			        	$('.delivery,.take_goods_address_contain,.order_message').addClass("hidden")
			        	$('.machine_address_wrap').removeClass("hidden");
			        	if (orderInfo.orderStatus == 1 || orderInfo.orderStatus == 2 || orderInfo.orderStatus == -4) {
			        		
			        	}else{
			        		$('.watm_info_wrap').removeClass("hidden");
			        		
			        		$(".watm_info").html("<p>订单号后五位："+orderInfo.orderCode.substring(orderInfo.orderCode.length - 5 ,orderInfo.orderCode.length)+"</p><p>提货码："+ orderInfo.pickUpCode +"</p>");
			        		if (orderInfo.orderStatus == 3) {
			        			$(".watm_info").html("<p>订单号后五位："+orderInfo.orderCode.substring(orderInfo.orderCode.length - 5 ,orderInfo.orderCode.length)+"</p><p>提货码："+ orderInfo.pickUpCode +"</p><div id='scanQRCode' class='scanQRCode' style='display:block'></div>");
			        		}
			        		if (orderInfo.orderStatus == 3 && $(".watm_info_wrap").find('p.msg').length == 0) {
			        			$(".watm_info_wrap").append("<p class='msg' style='color:#df3a1f;font-size:26px;line-height:40px;text-align:center'>请于今日24点前去售货机取货，过时自动取消订单，支付金额将原路退回。</p>")
			        		}
			        		if (orderInfo.orderStatus == 7 || orderInfo.orderStatus == 8) {
			        			var i = ''
			        			if(orderInfo.watmStatus == '1'){
			        				
			        				$(".watm_info").html("商品全部取货成功。")/*.css('background','#EEEEEE url(../img/success.png) right top no-repeat')*/
			        				i = '<img class="watmStatusTag" src="../img/success.png" />'
			        			}else{
			        				
				        			var html = ''
			        				$.each(orderInfo.orderDetailsList, function(i,v) {
			        					if (parseInt(v.buyNumber) != parseInt(v.takeAwayNum)) {
			        						html +=  (parseInt(v.buyNumber) - parseInt(v.takeAwayNum))+'件'+v.goodsName+"<br/>"
			        					}
			        				});
			        				if (orderInfo.watmStatus == '-1') {
			        					$(".watm_info").html(html +"取货未成功，请联系客服处理！")
				        				i = '<img class="watmStatusTag" src="../img/question.png" />'
			        				}
				        			if (orderInfo.watmStatus == '2') {
				        				$(".watm_info").html(html +"取货未成功，商家已退款！")/*.css('background','#EEEEEE url(../img/resolve.png) right top no-repeat')*/
				        				i = '<img class="watmStatusTag" src="../img/resolve.png" />'
				        			}
			        			}
			        			$('.watm_info').append(i)
			        			
			        		}
			        	}
			        	$('.machine_address').html(firmInfo.address ).data({"latitude":firmInfo.latitude,'longitude':firmInfo.longitude,'firmName':firmInfo.firmName});
			        	
			        }else{
			        	$('.order_message').html( '留言信息：' + orderInfo.message );
			        }
			        orderInfo.paytime != "" && $(".paytime").show().html( "支付时间" + orderInfo.paytime );
			        orderInfo.realSendTime != "" && $(".sendGood_time").show().html( "发货时间" + orderInfo.realSendTime );
			        // 支付方式
			        (function(){
						( 1 < orderInfo.payMethod && orderInfo.payMethod < 7 ) && $('.order_pay').html( pub.orderDetail.PAY_METHODS[ orderInfo.payMethod - 2 ] );
			        	( orderInfo.payMethod < 2 || 6 < orderInfo.payMethod ) && $('.order_pay').hide();
			        })();
			        // 待处理
			        if( orderInfo.pickUpMethod == '1' ){ 
	
			        	$('.deli_take_good').html('门店自提');
	
			        	$('.take_goods_address').hide().next().show();
	
			        	$('.set_address_top').html( '店名：' + firmInfo.firmName );
			        	$('.set_address_bottom').html( firmInfo.address );
			        	$('.set_job_time_left').html('营业时间：' + firmInfo.pickUpTime ); 
	
			        }else if( orderInfo.pickUpMethod == '2' ){
	
			        	$('.deli_take_good').html( '送货上门' );
	
			         	$('.take_goods_address').show().next().hide();
	
			        	$('.goods_person_name').html( orderInfo.customName );
			        	$('.goods_person_phone').html( orderInfo.customMobile );
			        	$('.goods_person_address').html( orderInfo.receiveAddress );
			        };
	
			        //商品展示
			        var html = '';
			        $.each(orderInfo.orderDetailsList,function( i, v){
			        
			        	html += '<dl class="gds_box clearfloat">'
			        	html += '    <dt>'
			        	html += '         <img src="' + v.goodsLogo + '" alt="" />'
	
			        	v.activityType == '1' && v.isspecial && ( html += '<img class="gds_goods_te" src="../img/icon_te_s.png"/>' )
			            v.activityType == '3' && ( html += '     <img class="gds_goods_te" src="../img/icon_miao_s.png" alt="" />' )
			            v.activityType == '4' && ( html += '     <img class="gds_goods_te" src="../img/icon_yu_s.png" alt="" />' )
	
			        	html += '    </dt> '
			        	html += '    <dd>'
			        	html += '         <div class="gds_right_top">' + v.goodsName + '</div>'
			        	html += '	    <div class="gds_right_center clearfloat">'
			        	html += '		    <div class="gds_goods_mess float_left">' + v.specInfo + '</div>'
						html += '		    <div class="gds_num_price float_right clearfloat">'
						html += '	            <p class="gds_num float_right">X<span>' + v.buyNumber +'</span></p>'
						html += '           </div>'
						html += '	    </div>'
			        	html += '         <div class="gds_right_bottom">'
			        	html += '			<p class="float_left"><span class="font_color">￥' + pub.toFixed( Number(v.nowPrice) ) + '</span></p>'
			        	html += '         </div>'            	
			        	html += '    </dd>'
			        	html += '</dl>'
			        });
	
					$(".order_goods_contain_details").html(html);
	
			        //支付金额运算详情
			        if ( orderInfo.activityType == 2 ) { // 秒杀
			        	$('.list-group1','.order_set_list').show();
			        	$('.my_order_list1 .order_set_list_right').html( '￥' + pub.toFixed( Number(orderInfo.orderDetailsList[0].goodsAllMoney) ) );
			        	$('.my_order_list7 .order_set_list_right').html( '￥' + pub.toFixed( Number(orderInfo.realPayMoney) ) );
			        } else{
						
			        	$('.list-group2','.order_set_list').show();
			        	//是否是首单
						if (orderInfo.orderType == "1") {
							if (orderInfo.firstOrderOff != '' && orderInfo.firstOrderOff > 0) {
								$(".order_first_free").find(".float_right").html("-￥"+orderInfo.firstOrderOff).end()
								$(".order_first_free").css("display","block")
							} 
						}
			        	// 优惠券
			        	(function(){
			        		if( 0 < orderInfo.couponStrategy && orderInfo.couponStrategy < 5){
					           	var object = pub.orderDetail.COUPON_TYPE[ +orderInfo.couponStrategy - 1 ];
					           	$(".my_order_list5 .order_set_list_left").html( object.text ).next().html(function(){
					             	return object.label == '-￥' ? ( object.label + orderInfo[ object.derateAmount ] ) : ( orderInfo[ object.derateAmount ] + object.label );
					            });
				           	}else{
				           		$(".my_order_list5").hide();
				           	}
				        })();
				        // 费用详细
				        (function(){
				        	
							pub.orderDetail.MONEY_DETAIL.forEach(function( v, i ){
			        			$('.my_order_list' + ( i + 1 ) + ' .order_set_list_right').html( '￥' + pub.toFixed( Number(orderInfo[ v ] )) );
			        		});
			        		
			        		//orderInfo.payMethod == '5' && $('.my_order_list6').show().find('.order_set_list_right').html( pub.toFixed( orderInfo.mothReduceMoney ) == 0 ? '￥' + pub.toFixed( orderInfo.mothReduceMoney ):'-￥' + pub.toFixed( orderInfo.mothReduceMoney ) );
			            	$('.my_order_list7 .order_set_list_right').html( '￥' + pub.toFixed( Number(orderInfo.realPayMoney) ) );
			        	})();
			    	} 
			    	// 用户操作处理
			    	/*(function(){
			    		var 
			    		text = pub.orderDetail.OPERATE[ +orderInfo.orderStatus + 3 ].text, 
			    		className = pub.orderDetail.OPERATE[ +orderInfo.orderStatus + 3 ].className;
			    		$('.order_status').html( text );
			    		$('.order_situation').addClass( className ).find( '.oprate-btn' ).text( pub.orderDetail.OPERATE[ +orderInfo.orderStatus + 3 ].btnText);
			    		if( +orderInfo.orderStatus + 3  == 6 ){
			    			firmIdType == '5' ? $(".order_status").html("待取货"): $('.order_status').html( pub.orderDetail.OPERATE[ +orderInfo.orderStatus + 3 ].pickUpMethod[ orderInfo.pickUpMethod - 1 ] );
			    		}
			    		switch( +orderInfo.orderStatus + 3 ){
			    			case 6 : 
				    			(orderInfo.realPayMoney == 0 || orderInfo.realPayMoney == '') ?  $(".order_situation").css("display","none") : ''; break;
			    		}
			    		
			    	})();*/
			    	// 用户操作处理
			    	(function(){
			    		var 
			    		text = pub.orderDetail.OPERATE[ +orderInfo.orderStatus + 4 ].text, 
			    		className = pub.orderDetail.OPERATE[ +orderInfo.orderStatus + 4 ].className;
			    		$('.order_status').html( text );
			    		$('.order_situation').addClass( className ).find( '.oprate-btn' ).text( pub.orderDetail.OPERATE[ +orderInfo.orderStatus + 4 ].btnText);
			    		switch( +orderInfo.orderStatus + 3 ){
			    			case 6 : 
				    			(orderInfo.realPayMoney == 0 || orderInfo.realPayMoney == '') ?  $(".order_situation").css("display","none") : ''; break;
			    			case 7 : 
				    			 $('.order_status').html( (pub.isMachineGoods ? '待取货' : pub.orderDetail.OPERATE[ +orderInfo.orderStatus + 4 ].pickUpMethod[ orderInfo.pickUpMethod - 1 ]) ); break;
			    		}
			    	})();
			    	//添加watm后价格信息显示
			    	if (firmIdType == '5') {
			    		$(".my_order_list2").css("display","none");
			    		orderInfo.orderStatus == '3' && $('.order_situation').css("display","none");
			    	}
			    	//pub.myScroll.refresh();
			    	if (pub.isrefresh) {
				 		//pub.iscroll.resetload();
				 		pub.pullInstance.pullDownSuccess();
				 	}
				}
			},
			// 合并接口 统一处理函数
			unify_deal : { // order_refund,order_cancle,order_del
				init : function(){
					common.ajaxPost($.extend( {},pub.orderDetail.userBasicParam,{
						method : pub.orderDetail.METHOD,
						orderCode : pub.orderDetail.orderCode
					}),function( d ){
						if ( d.statusCode == '100000' ){
							//if(pub.orderDetail.METHOD == 'order_del'){
							common.goBackApp(1,true,"html/order_management.html")
							//}
							//common.jumpLinkPlainApp( pub.orderDetail.TIT_RELATED[pub.orderDetail.METHOD],pub.orderDetail.URL_RELATED[ pub.orderDetail.METHOD ] );
						}else if( d.statusCode == common.SESSION_EXPIRE_CODE ){
							common.clearData();
							common.prompt( '省份验证过期，请重新登录' );
							common.setMyTimeout(function(){
								common.jumpLinkPlainApp( 'login.html' );
							},1000);
						}else{
							common.prompt( d.statusStr );
						} 
					})
				}
			}
	
		};
	
		// 详情事件
		pub.orderDetail.eventHandle = {
	
			init : function(){
				$('.order_situation').click(function(e){
					common.stopEventBubble(e);
					var 
					key ,
					$this = $(this),
					commentBtn = $this.is('.comment-btn'),
					className = /unite-deal/.test(e.target.className);
	
					!$this.is('.delete-btn') || ( key = 'deleteBtn' );
					!$this.is('.refund-btn') || ( key = 'refundBtn' );
					!$this.is('.unpay-operate') || ( key = 'unpayOperate' );
	
					if( className ){
						if( commentBtn ){ 
							common.orderColumn.removeItem();
							common.jumpLinkPlainApp( "评价",'html/order_evaluation.html' );
	
						}else if( key ){
	
							$('.order_refund_confirm').html( pub.orderDetail.TIP_MESSAGE[ key ].text );
	
							pub.orderDetail.METHOD = pub.orderDetail.TIP_MESSAGE[ key ].apiMethod; // 接口方法
	
							/*$('.order_refund,.refund_bg').show();
	        				$("body").css("overflow-y","hidden");*/
	        				var data = {
								type:1,
								title:pub.orderDetail.TIP_MESSAGE[ key ].text,
								canclefn:'cancleFn',
								truefn:'trueFn'
							}
							common.alertMaskApp(JSON.stringify(data));
						}
					}
	
					/paying/.test(e.target.className) && common.jumpLinkPlainApp( "订单支付",'html/order_pay.html' ); // 去支付
				});
	
			    //点击确定
			   /* $('.order_refund_choose .makeSure').on('click',function(e){
				    common.stopEventBubble(e);
				    pub.orderDetail.apiHandle.unify_deal.init();		    	            
				});*/
	
			    //点击取消//点击遮罩
				/*$('.order_refund_choose .refund_cancle,.refund_bg').on('click',function(){
				    $('.order_refund').css({'display':'none'});
				    $("body").css("overflow-y","auto");
				});*/
	
				$(".machine_address_wrap .machine_address").on("click",function(){
					localStorage.setItem("mapData",JSON.stringify($(this).data()));
					common.jumpLinkPlainApp("门店位置","html/store_map.html")
				});
				//点击扫码
				$(".watm_info").on("click",".scanQRCode",function(){
					
				})
			}
		};
	
		// 订单详情 入口
		pub.orderDetail.init = function(){
			
			pub.orderDetail.apiHandle.init(); // 接口初始化
			pub.orderDetail.eventHandle.init(); // 事件初始化
		}
		// 公共模块
	
		// 接口处理
		pub.apiHandle = {};
	
		// 事件处理
		pub.eventHandle = {};
		/*------扫码处理-------*/
		pub.scan = {
			
		}
		pub.scan.scanQRCodeData = {
			
		};
		pub.scan.apiHandle = {
			init:function(){
				//alert("scan-apiHandle 初始化")
				//pub.scan.apiHandle.scan_pick_up.apiData('1');
			},
			scan_login_pick_up : {
				init:function(){
					common.ajaxPost($.extend({},pub.orderDetail.userBasicParam,{
						method : 'scan_login_pick_up',
						uniqueCode : pub.scan.scanQRCodeData.IMEI,//
						randomCode : pub.scan.scanQRCodeData.UUID,//
						orderCode : pub.scan.scanQRCodeData.orderCode
					}),function( d ){
						$(".watmPickUpGoods").show();
						switch( +d.statusCode ){
							case 100000 : pub.scan.apiHandle.scan_login_pick_up.apiData( d ); break;
							case 100400 : (function(){
								common.clearData();
								common.prompt( '身份验证过期，请重新登录' );
								common.setMyTimeout(function(){
									common.jumpLinkPlainApp( '登录' , 'login.html' );
								},2000);
							}()); break;
							default : common.prompt( d.statusStr );
						}
					})
				},
				apiData:function(d){
					$(".watmPickUpGoods").show();
					/*var data = {
	           			title:"扫描二维码提货",
	           			node1:".orderDetails",
	           			node2:".watmPickUpGoods"
	           		};
	           		pub.switchInput("扫描二维码提货" , ".orderDetails" , ".watmPickUpGoods");*/
	           		alert("扫描二维码成功且调用后台成功");
	           		var  opt = {
	           			title:"订单详情",
	           			url:'html/orderDetails.html',
	           			callBackName:"pub.alert('2')"
	           		}
	           		common.confirmBackApp()
				}
			},
			scan_pick_up : {
				init:function(){
					common.ajaxPost($.extend({},pub.orderDetail.userBasicParam,{
						//2018-06-29 scan_pick_up ---> scan_confirm_pick_up
						method : 'scan_confirm_pick_up',
						uniqueCode : pub.scan.scanQRCodeData.IMEI,
						randomCode : pub.scan.scanQRCodeData.UUID,
						orderCode : pub.scan.scanQRCodeData.orderCode
					}),function( d ){
						switch( +d.statusCode ){
							case 100000 : pub.scan.apiHandle.scan_pick_up.apiData( d ); break;
							case 100400 : (function(){
								common.clearData();
								common.prompt( '身份验证过期，请重新登录' );
								common.setMyTimeout(function(){
									common.jumpLinkPlainApp( '登录','login.html' );
								},2000);
							}()); break;
							default : common.prompt( d.statusStr );
						}
					})
				},
				apiData:function(d){
					/*OD.apiHandle.init();
					var data = {
	           			title:"订单详情",
	           			node1:".orderDetails",
	           			node2:"#watmPickUpGoods"
	           		};
	           		common.switchInput(data);
	           		pub.switchInput("订单详情" , ".watmPickUpGoods" , ".orderDetails");*/
	           		
	           		var  opt = {
	           			title:"订单详情",
	           			url:'html/orderDetails.html',
	           			callBackName:"pub.alert('1')"
	           		}
	           		common.confirmBackApp(opt)
				}
			},
			
		}
		pub.alert = function(d){
			alert(d);
		}
		pub.scan.eventHandle = {
			init:function(){
				/*提货按钮*/
				$(".watmPickUpGoods").on("click",".btn_box p",function(){
					var className = $(this)[0].className;
					
					if (className == 'confirm_btn') {
						alert("确定")
						pub.scan.apiHandle.scan_pick_up.init();
						
					} else if (className == 'cancle_btn'){
						
						common.cancelBackApp();
					}
				})
			}
		};
		pub.scan.getScan = function(d){
			if (common.isAndroid()) {
				console.log(d)
			}else{
				alert(d);
			}
			
			var str = d.substr(1,d.length -2);
            var arr = str.split(",");
            var h = "{"
            for (var i in arr ) {
            	var n = arr[i].split("=");
            	h += '"'+ String(n[0]).trim() + '":"'+ String(n[1]).trim() + '",'
            }
            h = h.substr(0,h.length -1);
            h += "}";
            pub.scan.scanQRCodeData = $.extend({},{
            	orderCode : pub.orderDetail.orderCode
            },JSON.parse(h))
           	
           	if (pub.scan.scanQRCodeData && pub.scan.scanQRCodeData.NAME == 'PUP') {
           		pub.scan.apiHandle.scan_login_pick_up.init();
           		
           	}else{
           		alert(JSON.stringify(pub.scan.scanQRCodeData))
           	}
		}
		//扫码入口
		pub.scan.init = function(){
			pub.scan.apiHandle.init();
			pub.scan.eventHandle.init();
		}
		
		//换肤
		pub.apiHandle.change_app_theme = {
			init:function(){
				if (common.huanfu.getItem() && common.huanfu.getItem() != 1) {
					switch( pub.moduleId ){
						case 'orderManagement' : (function(){
							$(".order_manage_list,.management_contain").addClass("skin"+sessionStorage.getItem("huanfu"))
						})(); break;
						case 'orderDetail' :  (function(){
							$(".order_details,.pickUpcode-box,.position-label-box,.delivery,.machine_address_wrap,.take_goods_address_contain,.order_goods_contain_details,.order_set_list").addClass("skin"+sessionStorage.getItem("huanfu"))
						})();  break;
					}
					
				}
			}
		}
		// 初始化
		pub.init = function(){
			if (!common.huanfu.getKey()) {
				common.getChangeSkin();
				common.defHuanfu.done(function(){
					pub.apiHandle.change_app_theme.init();
				})
			}else{
				pub.apiHandle.change_app_theme.init();
			}
			pub.moduleId == 'orderManagement' && pub.orderManagement.init();
			pub.moduleId == 'orderDetail' && pub.orderDetail.init();
			pub.moduleId == 'scan' && pub.scan.init();
			$("body").fadeIn(300)
		};
		
		$(document).ready(function(){
		 	pub.init();
		 	window.pub = pub;
		 	
		})
	})
})