

require(['../require/config'],function(){
	require(['common','mobileUi','pull'],function(common){

		// 命名空间
	
		pub = {};
	
		pub.logined = common.isLogin(); // 是否登录
	
		pub.PAGE_INDEX = common.PAGE_INDEX; // 索引
	
		pub.PAGE_SIZE = common.PAGE_SIZE; // 页面显示数据个数
	
		pub.moduleId = $('[module-id]').attr( 'module-id' );  // 模块 id // preOrderManagement
	
		pub.toFixed = common.toFixed;
	
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
		};
	
		// 命名空间
		
		pub.preOrderManagement = {};
	
		pub.preOrderManagement.paramListInit = function(){
	
			pub.preOrderManagement.preOrderStatusHash = [ 1, 3, 4, '' ]; // ''，全部，1，定金未支付，3，定金支付待付尾款，4，待收货 tab
	
			pub.preOrderManagement.tabIndex = common.preColumn.getItem() ? common.preColumn.getItem() : '0'; //  tab切换
	
			pub.preOrderManagement.preOrderStatus = null; // 订单状态
	
			pub.preOrderManagement.lodemore = $('.lodemore'); // 将节点全局
	
			pub.preOrderManagement.listNode = null; // 列表 item 节点
	
			pub.preOrderManagement.orderCode = null; // 订单编号
	
			pub.preOrderManagement.isLast = null;
	
			pub.preOrderManagement.prePayStatus = ['已作废','','待付订金','待付尾款','待付尾款','已完成']; // 订单支付状态
	
			pub.preOrderManagement.orderStatus = {
				'book':[ 1, '去支付' ],// 支付定金
				'notretainage':[ 2, '去支付'], // 支付尾款
				'cancle':[ 3, '删除' ], // 
				'expire':[ 3, '删除' ], // 
				'bookend':[ 4, '等待付尾款' ], // 
				'end':[5,'已完成']
			};
	
			pub.preOrderManagement.source = null; // source
			pub.preOrderManagement.sign = null; // sign
			pub.preOrderManagement.apiHandle.init();
		};
	
		pub.preOrderManagement.apiHandle = {
	
			init : function(){
				$(".myOrder_management_top li").eq(pub.preOrderManagement.tabIndex).addClass("actived");
				pub.preOrderManagement.preOrderStatus = pub.preOrderManagement.preOrderStatusHash[ pub.preOrderManagement.tabIndex ];
				pub.PAGE_INDEX = 1; // 页码重置

				pub.preOrderManagement.apiHandle.pre_order_list.init();
			},
			pre_order_list : {
				init : function(){
					common.ajaxPost($.extend({},pub.userBasicParam,{
						method : 'pre_order_list',
						prePayStatus : pub.preOrderManagement.preOrderStatus,
						pageNo : pub.PAGE_INDEX,
						pageSize : pub.PAGE_SIZE,
					}),function( d ){
						if ( d.statusCode == '100000' ) {
							pub.preOrderManagement.apiHandle.pre_order_list.apiData( d );
						}else if( d.statusCode == '100712' ){
							pub.preOrderManagement.lodemore.html('没有更多数据了').css('display','block');
						}else{
							common.prompt( d.strStatus );
						}
					});
				},
				apiData : function( d ){
					
					pub.preOrderManagement.isLast = d.data.isLast;
					if(pub.PAGE_INDEX == 1){
						$(".order_manage_contain").html("")
					}
					var html='';
					d.data.objects.forEach(function( v, i ){
	
						var orderCode = v.orderCodeRetainage ? v.orderCodeRetainage : v.orderCode; // 接收订单编号
	
						html += '<div class="order_manage_content" data="' + v.payStatus + '"  dataCode="' + orderCode + '">'
						html += '   <div class="order_manage_num clearfloat">'
						 
						html += '       <div class="order_num_left">订单编号：' + orderCode + '</div>'
	
						html += '       <div class="order_num_right">' + pub.preOrderManagement.prePayStatus[ +v.payStatus + 1 ] + '</div>'     			
						
						html += '   </div>'
						html += '   <div class="order_manage_details">'
						html += '       <dl class="clearflaot">'
						html += '            <dt>'	
						html += '                 <img class="img_shopLogo" src="' + (v.goodsInfo ? v.goodsInfo.goodsLogo : '') + '">'
			            html += '                 <img class="img_miaoLogo" src="../img/icon_yu_s.png" alt="" />'			                
						html += '            </dt>'
						html += '            <dd>'	    			
						html += '                <div class="manage_details_top">' + (v.goodsInfo ? v.goodsInfo.goodsName : '') + '</div>'
						html += '                <div class="manage_details_bottom clearfloat">'
						html += '                    <div class="manage_bottom_left">'
						html += '                        <div class="preOrder_bottom_price clearfloat">'
						html += '                            <div class="preOrder_bottom_specify">' + (v.goodsInfo ? v.goodsInfo.specInfo : '') + '</div>'
						html += '                            <div class="preOrder_number" style="float: right;">X<span></xspan>' + v.buyNum + '</div>'
						html += '                        </div>'
						html += '                        <div class="preOrder_bottom_money clearfloat">'
						html += '                            <div class="deposit">定金：' + pub.toFixed( v.preGoods.frontMoney ) + '</div>'
						html += '                            <div class="payment" style="padding-left: 24px;">尾款：' + pub.toFixed( v.preGoods.retainage ) + '</div>'
						html += '                        </div>'
						html += '                    </div>'
						html += '                    <div class="premanage_bottom_right" dataCode="' + orderCode + '" datapreordercode="' + v.orderCodeRetainage + '">'
						
						html += '<div class="order_sunmit_status' + pub.preOrderManagement.orderStatus[ v.preGoods.preStatus ][0] + '">' + pub.preOrderManagement.orderStatus[ v.preGoods.preStatus ][1] + '</div>'
						
						html += '                    </div>'
						html += '                </div>'
						html += '            </dd>'
						html += '       </dl>'
						html += '   </div>'    				    			
						html += '</div>'
					});
					$('.order_manage_contain').append( html ); 
			        pub.preOrderManagement.isLast && pub.preOrderManagement.lodemore.removeClass('loadMore').html('没有更多数据了').show();
			        !pub.preOrderManagement.isLast && pub.preOrderManagement.lodemore.addClass('loadMore').html('点击加载更多数据').show();
					/*console.log("refersh")
					setTimeout(function(){
						pub.myScroll.refresh()
					},1000)*/
					if (pub.isrefresh) {
				 		//pub.iscroll.resetload();
				 		pub.pullInstance.pullDownSuccess();
				 	}
				}
			},
			order_del : {
				init : function(){
					common.ajaxPost({
						method : pub.preOrderManagement.orderType == '07' ? 'pre_order_del' : 'order_del',
						orderCode : pub.preOrderManagement.orderCode,
						tokenId : pub.tokenId,
						sign : pub.preOrderManagement.sign,
						source : pub.preOrderManagement.source
					},function( d ){
						if( d.statusCode == '100000' ){
							var node = pub.preOrderManagement.listNode.remove();
							node = null;
							$('.order_refund,.refund_bg').css({'display':'none'});
						}else{
							common.prompt( d.strStatus );
						}
					})
				}
			},
			trueFn : function(){
				pub.preOrderManagement.source = 'orderCode' +  pub.preOrderManagement.orderCode;
	
				pub.preOrderManagement.sign = md5( pub.preOrderManagement.source + "key" + common.secretKeyfn() ).toUpperCase();
				
				pub.preOrderManagement.apiHandle.order_del.init();
			}
		};
	
		pub.preOrderManagement.eventHandle = {
			init : function(){
				$('.myOrder_man_item','.myOrder_management_top').on('click',function(e){
	
					var 
					$this = $(this),
					i = $this.index(),
					isCur = $this.is('.actived');
					pub.preOrderManagement.tabIndex = i;
					if( !isCur ){
	
						$('.order_manage_contain').empty();
						pub.preOrderManagement.lodemore.is(':visible') && pub.preOrderManagement.lodemore.hide();
	
						$('.order_manage_contain').html(); // 清空数据
	
						$this.addClass('actived').siblings().removeClass('actived');
	
						pub.preOrderManagement.preOrderStatus = pub.preOrderManagement.preOrderStatusHash[ i ];
	
						common.preColumn.setItem( i );
	
						pub.PAGE_INDEX = 1; // 页码重置
	
						pub.preOrderManagement.apiHandle.pre_order_list.init();
					}
				});
				//$('.myOrder_man_item','.myOrder_management_top').eq( +pub.preOrderManagement.tabIndex ).trigger('click'); // 触发点击事件
	
			    // 点击加载更多
			    $('.management_contain').on('click','.lodemore.loadMore',function(e){				
	    			common.stopEventBubble( e );
	    			pub.PAGE_INDEX++;
	    			pub.preOrderManagement.apiHandle.pre_order_list.init();
		    	});
	
		    	//跳转到订单详情页面
	    		$('.order_manage_contain').on('click','.order_manage_content',function(){
	    			var	
	    			$this = $(this),
	    			orderCode = $this.attr( 'dataCode' );
	    			common.orderCode.setItem( orderCode );
	    			common.orderBack.setItem( '2' );
	    			common.jumpLinkPlainApp( "订单详情","html/preOrderDetail.html" );
	    		});	
	
	    		//支付定金跳转
				$('.order_manage_contain').on('click','.order_sunmit_status1',function(e){
					common.stopEventBubble(e);
			        common.orderCode.setItem( $(this).parent().attr('datacode') );
			        common.orderBack.setItem( '2' );
			        common.jumpLinkPlainApp( "订单支付",'html/order_pay.html?search=pre' );
				});	
	
				//尾款支付跳转
				$('.order_manage_contain').on('click','.order_sunmit_status2',function(e){
	
					common.stopEventBubble(e);
					var 
					$this = $(this),
					datacode = $this.parent().attr("datapreordercode"), // 尾款订单
					orderCode = datacode ? datacode : $this.parent().attr( 'dataCode' );
					common.orderCode.setItem( orderCode );
				    common.orderBack.setItem( '2' );
			        if( !!datacode ){
			        	common.jumpLinkPlainApp( "订单支付",'html/order_pay.html' );
			        }else{
			        	common.orderType.setItem( "3" );
						common.jumpLinkPlainApp( "订单结算",'html/order_set_charge.html' );
			        } 			    		
				});
	
				//点击删除
				$('.order_manage_contain').on('click','.order_sunmit_status3',function(e){
					common.stopEventBubble(e);
					var $this = $(this);
			        pub.preOrderManagement.orderCode = $this.parent().attr('datacode'); // 支付定金订单 订单号
			        pub.preOrderManagement.orderType = pub.preOrderManagement.orderCode.substring( 8, 10 ); // 订单类型
			        pub.preOrderManagement.listNode = $this.parents('.order_manage_content');
			        /*$('.order_refund,.refund_bg').css({'display':'block'});
			        $("body").css("overflow-y","hidden");*/
			       var data = {
						type:1,
						title:'确定删除？',
						canclefn:'cancleFn',
						truefn:'trueFn'
					}
					common.alertMaskApp(JSON.stringify(data));
				});	
	
				//点击已完成
				$('.order_manage_contain').on('click','.order_sunmit_status5',function(e){
	    			common.stopEventBubble(e);
	    			return;
	    		});
				//点击确定
				/*$('.order_refund').on('click','.makeSure',function(){
	
					pub.preOrderManagement.source = 'orderCode' +  pub.preOrderManagement.orderCode;
	
					pub.preOrderManagement.sign = md5( pub.preOrderManagement.source + "key" + common.secretKeyfn() ).toUpperCase();
					// !!pub.preOrderManagement.orderCode && ( pub.preOrderManagement.method = 'pre_order_del' );// 判断支付定金编号是否存在
					// !pub.preOrderManagement.orderCode && ( pub.preOrderManagement.method = 'order_del' );
	
					pub.preOrderManagement.apiHandle.order_del.init();
	
				});	*/
	
				//点击弹出框取消
			   /* $('.order_refund').on('click','.refund_cancle,.refund_bg',function(){
			    	$('.order_refund,.refund_bg').css({'display':'none'});
			    	$("body").css("overflow-y","auto");
			    });*/
	
			}
		};
		// 预购订单管理初始化
		pub.preOrderManagement.init = function(){
			pub.preOrderManagement.paramListInit(); // 初始化参数列表
			pub.preOrderManagement.eventHandle.init(); 
		};
	
	
		/************************************ 订单详情模块 ***************************************/
	
		// 命名空间
	
		pub.preOrderDetail = {};
	
		pub.preOrderDetail.paramListInit = function(){
	
			pub.preOrderDetail.orderCode = common.orderCode.getItem(); // 订单编号
	
			pub.preOrderDetail.orderType = pub.preOrderDetail.orderCode.substring( 8, 10 ); // 订单类型
	
			pub.preOrderDetail.method = pub.preOrderDetail.orderType == '07' ? 'pre_order_details' : 'order_details'; // 获取接口类型
			
			pub.preOrderDetail.DelMethod = pub.preOrderDetail.orderType == '07' ? 'pre_order_del' : 'order_del'; // 获取删除订单的接口类型
	
			pub.preOrderDetail.source = "orderCode" + pub.preOrderDetail.orderCode;
	
			pub.preOrderDetail.sign = md5( pub.preOrderDetail.source + "key" + common.secretKeyfn() ).toUpperCase();
	
			// 不同状态 不同操作 定金支付订单 , 需要增加其他状态在这里配置参数即可
			pub.preOrderDetail.OPERATE = [
		    	{ text : '已作废',     className : 'delete-btn',    btnText : '删除'},
		    	{ text :'',            className : 'hide',          btnText : ''},
		    	{ text : '待付定金',   className : 'unpay-operate', btnText : ''},
		    	{ text : '等待付尾款', className : '',              btnText : '', bookend : {className : 'wait-pay-btn', btnText : '等待付尾款'}, notretainage : {className : 'pay-left-btn', btnText : '支付尾款'} },
		    	{ text : '等待付尾款', className : '',              btnText : '', bookend : {className : 'wait-pay-btn', btnText : '等待付尾款'}, notretainage : {className : 'pay-left-btn', btnText : '支付尾款'} }
			];
			// 订单支付方式
			pub.preOrderDetail.PAYWAY = ['支付方式：账户余额','','','支付方式：微信支付','支付方式：连连支付','支付方式：账户余额','支付方式：在线支付'];
	
			// 提示信息处理    弹窗 apiMethod 存方法
			pub.preOrderDetail.TIP_MESSAGE = { 
				'refundBtn' : { text : '确定退款？', apiMethod : 'order_refund' }, 
				'unpayOperate' : { text : '确定取消订单？', apiMethod : 'order_cancle' }, 
				'deleteBtn' : { text : '确定删除订单？', apiMethod : pub.preOrderDetail.DelMethod }
			};
	
			pub.preOrderDetail.API_METHOD = null; // 存储接口方法
	
			pub.preOrderDetail.URL_RELATED = {
				'order_refund' : 'html/orderDetails.html',
				'order_cancle' : 'html/PreOrder_management.html',
				'order_del' : 'html/PreOrder_management.html',
				'pre_order_del': 'html/PreOrder_management.html'
			};
	
	
		};
	
		pub.preOrderDetail.substr = function ( str ){ 
			return ( str + '' ).substring(5,16); 
		};
		pub.preOrderDetail.apiHandle = {
			init : function(){
				pub.preOrderDetail.apiHandle.order_details.init();
			},
			order_details : {
				init : function(){
					common.ajaxPost({
						method : pub.preOrderDetail.method,
						orderCode : pub.preOrderDetail.orderCode,
						tokenId : pub.tokenId,
						sign : pub.preOrderDetail.sign,
						source : pub.preOrderDetail.source
					},function( d ){
						pub.preOrderDetail.orderType == '07' && pub.preOrderDetail.apiHandle.order_details.apiData( d );
						pub.preOrderDetail.orderType != '07' && pub.preOrderDetail.apiHandle.order_details.apiData1( d );
						//pub.preOrderDetail.apiHandle.order_details.apiData(  );
					});
				},
				apiData : function( d ){
					
					d = d.data;
					
			    	//头部信息
			    	$('.create_time').html('下单时间：' + d.createTime );
			    	$('.frontMoney_pay').html('实付定金：￥' + common.toFixed( d.frontMoney ) );
			    	$('.frontMoney_time').html('定金支付时间：' + pub.preOrderDetail.substr( d.preGoods.frontMoneyStart ) + '——' + pub.preOrderDetail.substr( d.preGoods.frontMoneyEnd ) );
			    	$('.retainage_time').html('尾款支付时间：' + pub.preOrderDetail.substr( d.preGoods.retainageStart ) + '——' + pub.preOrderDetail.substr( d.preGoods.retainageEnd ) );
			    	//订单创建时间等展示
			    	$('.order_set_list').show();
			    	$('.preOrder_num').html('订单编号：' + d.orderCode );
	
			    	// 不同状态 对应不同操作处理
			    	(function(){
			    		var curStatus = pub.preOrderDetail.OPERATE[ d.payStatus + 1 ];
			    		$('.order_status').html( curStatus.text );
			    		$('.order_situation').addClass( curStatus.className ).find( '.oprate-btn' ).text( curStatus.btnText );
			    		if ( d.preGoods.preStatus == "expire" || d.payStatus == '-1') {
			    			$('.order_situation').addClass( pub.preOrderDetail.OPERATE[ 0 ].className ).find( '.oprate-btn' ).text( pub.preOrderDetail.OPERATE[ 0 ].btnText );
			    			$('.order_situation.show.unpay-operate .situation_pay').hide();
			    		}else{
				    		if( d.payStatus == '2' || d.payStatus == '3' ){
				    			$('.order_situation').addClass( curStatus[ d.preGoods.preStatus ].className ).find( '.oprate-btn' ).text( curStatus[ d.preGoods.preStatus ].btnText );
				    		}
			    		}
			    		$('.group1').show().find(".order_set_list_right").html('￥' + common.toFixed( d.frontMoney ) );
			    	})();
	
			    	pub.preOrderDetail.apiHandle.order_details.htmlRender( d ); // 渲染商品信息
			    	if (pub.isrefresh) {
				 		//pub.iscroll.resetload();
				 		pub.pullInstance.pullDownSuccess();
				 	}
				},
				apiData1 : function( d ){ // 尾款订单
	
					d = d.data;
					console.log(d)
					// 状态 操作 直接配置相应的参数
					pub.preOrderDetail.OPERATE = [
						{ text : '已作废', className : 'delete-btn', btnText : '删除' },
						{ text : '', 	   className : 'hide',           btnText : ''},
						{ text : '',       className : 'hide',           btnText : ''},
						{ text : '',       className : 'hide',           btnText : ''},
						{ text : '等待付尾款', className : 'pay-left-btn', btnText : '支付尾款'},
						{ text: '' ,           className : '', 
							payStatus : [
								{text : '已退款', className : 'hide', btnText : ''}, // -3
								{text : '退款中', className : 'hide', btnText : ''}, // -2
								{text : '', className : 'hide', btnText : ''},
								{text : '', className : 'hide', btnText : ''},
								{text : '', className : 'hide', btnText : ''},
								{text : '', className : 'hide', btnText : ''},
								{text : '已付款', className : 'refund-btn', btnText : '退款'}, // 3
								{text : '待收货', className : '', btnText : ''}, // 4
								{text : '已签收', className : 'comment-btn', btnText : '评价'}, // 5
								{text : '已完成', className : '', btnText : ''}, // 6
								{text : '已完成', className : '', btnText : ''} // 7
							]
						}
					];
	
			    	$('.preOrder_num').html('订单编号：' + d.preOrderRecord.orderCodeRetainage);
			    	// 订单状态  用户操作处理
			    	(function(){
			    		var 
			    		payStatus = d.preOrderRecord.payStatus,
			    		operate = pub.preOrderDetail.OPERATE,
			    		orderStatus = d.orderInfo.orderStatus;
				    	$('.order_status').html( operate[ +payStatus + 1 ].text );
				    	$('.order_situation').addClass(  operate[ +payStatus + 1 ].className ).find('.oprate-btn').text( operate[ +payStatus + 1 ].btnText );
				    	if( payStatus == '4' ){
				    		$('.order_status').html( operate[ +payStatus + 1 ].payStatus[ +orderStatus +3 ].text );
				    		$('.order_situation').addClass( operate[ +payStatus + 1 ].payStatus[ +orderStatus +3 ].className ).find('.oprate-btn').text( operate[ +payStatus + 1 ].payStatus[ +orderStatus +3 ].btnText );
				    	}
			    	}());
	
	
			    	$('.create_time').html('下单时间：' + d.preOrderRecord.createTime);
			    	$('.frontMoney_pay').html('实付定金：￥' + common.toFixed( d.preOrderRecord.frontMoney ) );
			    	$('.retainage_pay').show().html('实付尾款：￥' + common.toFixed( d.preOrderRecord.retainage ) );
			    	$('.frontMoney_time').html('定金支付时间：' + pub.preOrderDetail.substr( d.preOrderRecord.preGoods.frontMoneyStart ) + '——' + pub.preOrderDetail.substr( d.preOrderRecord.preGoods.frontMoneyEnd ));
			    	$('.retainage_time').html('尾款支付时间：' + pub.preOrderDetail.substr( d.preOrderRecord.preGoods.retainageStart ) + '——' + pub.preOrderDetail.substr( d.preOrderRecord.preGoods.retainageEnd ) );	    		    	
			    	
			    	$('.order_pay').html( pub.preOrderDetail.PAYWAY[ +d.orderInfo.payMethod ] ); // 支付方式
	
			        $('.order_message').show().html('留言信息：' + d.orderInfo.message ); 
	
			        //配送方式及地址显示           
			    	$('.delivery,.take_goods_address_contain,.order_set_list').show();
	
			    	if( d.orderInfo.pickUpMethod == '1' ){
			        	$('.deli_take_good').html('门店自提');
			        	$('.take_goods_address').hide().next('.set_charge_address').show();
			        	$('.set_address_top').html('店名：' + d.firmInfo.firmName);
			        	$('.set_address_bottom').html( d.firmInfo.address );
			        	$('.set_job_time_left').html('营业时间：' + d.firmInfo.pickUpTime);        	
			        }else if( d.orderInfo.pickUpMethod == '2' ){
			        	$('.deli_take_good').html('送货上门');
			        	$('.take_goods_address').show().next('.set_charge_address').hide();
			        	$('.goods_person_name').html(d.orderInfo.customName);
			        	$('.goods_person_phone').html(d.orderInfo.customMobile);
			        	$('.goods_person_address').html(d.orderInfo.receiveAddress);
			        };
			   
			        pub.preOrderDetail.apiHandle.order_details.htmlRender( d ); // 渲染商品信息
			        //订单金额详情 
			        $('.my_order_list1').show().find(".order_set_list_right").html( '￥' + common.toFixed( d.preOrderRecord.frontMoney ))
			        	.next('.my_order_list2').show().find(".order_set_list_right").html( '￥' + common.toFixed( d.preOrderRecord.retainage ))
			        	.next('.my_order_list3').show().find(".order_set_list_right").html( '￥' + common.toFixed( d.orderInfo.postCost ));
	
			    	if ( d.orderInfo.payMethod == "5" ) {
			    		$('.my_order_list4').show().find(".order_set_list_right").html('-￥' + common.toFixed( d.orderInfo.mothReduceMoney ));
			    	};
			    	$('.my_order_list5').show().find(".order_set_list_right").html('￥' + common.toFixed( d.orderInfo.realPayMoney ));
					if (pub.isrefresh) {
				 		//pub.iscroll.resetload();
				 		pub.pullInstance.pullDownSuccess();
				 	}
				},
				htmlRender :function( d ){
					if( d.orderInfo ){ //尾款订单
						var 
						orderInfo = d.orderInfo.orderDetailsList[0],
						goodsLogo = orderInfo.goodsLogo,
						goodsName = orderInfo.goodsName,
						specInfo = orderInfo.specInfo,
						buyNum = orderInfo.buyNumber, // 购买的数量
						frontMoney = d.preOrderRecord.preGoods.frontMoney, // 定金
						retainage = d.preOrderRecord.preGoods.retainage; // 尾款
					}else{ // 定金订单
						var 
						goodsInfo = d.goodsInfo,
						goodsLogo = goodsInfo.goodsLogo,
						goodsName = goodsInfo.goodsName,
						specInfo = goodsInfo.specInfo,
						buyNum = d.buyNum,
						frontMoney = d.preGoods.frontMoney,
						retainage = d.preGoods.retainage;
					}
			        //商品展示
		        	var html = '';
		        	html += '<dl class="gds_box clearfloat">'
		        	html += '    <dt>'
		        	html += '         <img src="' + goodsLogo + '" alt="" />' 
		        	html += '         <img class="gds_goods_te" src="../img/icon_yu_s.png" alt="" />'	
		        	html += '    </dt> '
		        	html += '    <dd>'
		        	html += '         <div class="gds_right_top">' + goodsName + '</div>'
		        	html += '         <div class="gds_right_center">'
		        	html += '		    <div class="gds_goods_mess float_left">' + specInfo + '</div>'
					html += '		    <div class="gds_num_price float_right clearfloat">'
					html += '	            <p class="gds_num float_right">X<span>' + buyNum + '</span></p>'
					html += '	            <p class="gds_num float_right"><span></span></p>'
					html += '           </div>'
		        	html += '         </div>'
		        	html += '       <div class="gds_right_bottom">'
		        	html += '			<p class="float_left">定金：<span class="font_color">￥' + common.toFixed( frontMoney ) + '</span></p>'
					html += '			<p class="float_left">尾款：<span class="font_color">￥' + common.toFixed( retainage )+ '</span></p>'              	          	
		        	html += '         </div>' 
		        	html += '    </dd>'
		        	html += '</dl>'
			        $('.order_goods_contain_details').html( html );
					$(".gds_box").css("border-bottom","1px solid #FFF"); 
				}
			},
			unite_deal : {
				init : function(){
					common.ajaxPost({
						method : pub.preOrderDetail.API_METHOD,
						orderCode : pub.preOrderDetail.orderCode,
						tokenId : pub.tokenId,
						sign : pub.preOrderDetail.sign,
						source : pub.preOrderDetail.source
					},function( d ){
	
						if (d.statusCode == '100000') {
							if(pub.preOrderDetail.API_METHOD == 'order_refund'){
								location.replace( location.href );
							}else{
								common.goBackApp(1,true,"html/PreOrder_management.html")
							}
						}else{
							common.prompt( d.strStatus );
						}
						
					})
				}
			},
			
		};
		pub.preOrderDetail.eventHandle = {
			init : function(){
				/*// 返回上一级
				common.jumpLinkSpecial('.header_left',function(){
					var 
					orderBack = common.orderBack.getItem();
					orderBack == '1' && common.jumpLinkPlainApp( 'order_management.html' );
					orderBack == '2' && common.jumpLinkPlainApp( 'PreOrder_management.html' );
				});*/
	
				$('.order_situation').click(function( e ){
					common.stopEventBubble(e);
					var 
					key ,
					$this = $(this),
					commentBtn = $this.is('.comment-btn'),
					payLeftBtn = $this.is('.pay-left-btn'),
					className = /unite-deal/.test( e.target.className );
	
					!$this.is('.delete-btn') || ( key = 'deleteBtn' );
					!$this.is('.refund-btn') || ( key = 'refundBtn' );
					!$this.is('.unpay-operate') || ( key = 'unpayOperate' );
					if( className ){
						if( commentBtn ){ // 是评论
							common.preColumn.removeItem();
							common.orderColumn.removeItem();
							common.jumpLinkPlainApp( "订单评价",'html/order_evaluation.html' );
						}else if( payLeftBtn ){ // 支付尾款
							var orderType = pub.preOrderDetail.orderCode.substring( 8, 10 );
							if( orderType == '07' ){ // 尾款 下单
								common.orderType.setItem("3");
								common.jumpLinkPlainApp( "订单结算",'html/order_set_charge.html' );
							}else{
				                common.jumpLinkPlainApp( "订单支付",'html/order_pay.html' );
							}
						}else {
							$('.order_refund_confirm').html( pub.preOrderDetail.TIP_MESSAGE[ key ].text );
							pub.preOrderDetail.API_METHOD = pub.preOrderDetail.TIP_MESSAGE[ key ].apiMethod; // 接收方法
							/*$('.order_refund,.refund_bg').show();
	        				$("body").css("overflow-y","hidden");*/
	        				var data = {
								type:1,
								title:pub.preOrderDetail.TIP_MESSAGE[ key ].text,
								canclefn:'cancleFn',
								truefn:'trueFn'
							}
							common.alertMaskApp(JSON.stringify(data));
						}
					}
					/paying/.test( e.target.className ) && common.jumpLinkPlainApp( "订单支付",'html/order_pay.html?search=pre' ); // 去支付
				});
	
			    //点击确定
			    $('.order_refund').on('click','.makeSure',function(e){
			    	common.stopEventBubble(e);
			    	pub.preOrderDetail.apiHandle.unite_deal.init();
			    }); 
	
			    //点击弹出框取消
			    $('.order_refund').on('click','.refund_cancle',function(){
			    	$('.order_refund,.refund_bg').hide();
			    	$("body").css("overflow-y","auto");
			    });
			}
		};
	
		pub.preOrderDetail.init = function(){
			pub.preOrderDetail.paramListInit();// 参数初始化
			pub.preOrderDetail.apiHandle.init();
			pub.preOrderDetail.eventHandle.init();
		};
	
		// 父模块 事件处理
		pub.eventHandle = {};
		
		// 父模块 几口数据处理
		pub.apiHandle = {};
	
		// 
		//换肤
		pub.apiHandle.change_app_theme = {
			init:function(){
				if (common.huanfu.getItem() && common.huanfu.getItem() != 1) {
					switch( pub.moduleId ){
						case 'preOrderManagement' : (function(){
							$(".myOrder_management_top,.management_contain").addClass("skin"+sessionStorage.getItem("huanfu"))
						})(); break;
						case 'preOrderDetail' :  (function(){
							$(".order_details,.pickUpcode-box,.position-label-box,.delivery,.take_goods_address_contain,.order_goods_contain_details,.order_set_list").addClass("skin"+sessionStorage.getItem("huanfu"))
						})();  break;
					}
					
				}
			}
		}
		pub.init = function(){
			if (!common.huanfu.getKey()) {
				common.getChangeSkin();
				common.defHuanfu.done(function(){
					pub.apiHandle.change_app_theme.init();
				})
			}else{
				pub.apiHandle.change_app_theme.init();
			}
			pub.moduleId == 'preOrderManagement' && pub.preOrderManagement.init();
			pub.moduleId == 'preOrderDetail' && pub.preOrderDetail.init();
		};
		
		$(document).ready(function(){
		 	pub.init();
		 	window.pub = pub;
		 	setTimeout(loaded(), 500);
	 		var 
			wh = document.documentElement.clientHeight;
			
			pub.info = {
				"pullDownLable":"下拉刷新...",
				"pullingDownLable":"松开刷新...",
				"pullUpLable":"下拉加载更多...",
				"pullingUpLable":"松开加载更多...",
				"loadingLable":"加载中..."
			}
			
	 		var myScroll,
			pullDownEl, pullDownOffset,
			pullUpEl, pullUpOffset,
			generatedCount = 0;
		
			function pullDownAction () {
				setTimeout(function () {
					pub.isrefresh = true;
					console.log(pub.moduleId)
					if (pub.moduleId == 'preOrderManagement') {
						pub.PAGE_INDEX = common.PAGE_INDEX; // 索引
						pub.preOrderManagement.apiHandle.init();
					} if (pub.moduleId == 'preOrderDetail') {
						pub.preOrderDetail.init()
					}
				}, 1000);
			}
			function loaded() {
				var $listWrapper = $('.main');
	
		        pub.pullInstance =  pullInstance = new Pull($listWrapper, {
		            // scrollArea: window, // 滚动区域的dom对象或选择器。默认 window
		             distance: 100, // 下拉多少距离触发onPullDown。默认 50，单位px
		
		            // 下拉刷新回调方法，如果不存在该方法，则不加载下拉dom
		            onPullDown: function () {
		                pullDownAction();
		            },
		        });
		        $('#wrapper').css("left","0")
			}
		})
	})
})
