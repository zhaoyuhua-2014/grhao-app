require(['../require/config'],function(){
	require(['common'],function(common){
		
		pub = {};
		pub.addrDtd = $.Deferred();
		pub.logined = common.isLogin(); // 是否登录
		pub.orderFrom = 'APP'; // 生成订单来源方式
		pub.tabIndex = common.addType.getKey() ? common.addType.getItem() : 0;// 配送方式 tab 索引
		pub.pickUpMethod = "" //是否选择配送方式
		pub.goodsInfoApi={} //秒杀商品 数据
	
		//!common.storeInfo.getKey() && common.jumpLinkPlain('../index.html'); 
		
		pub.dom = common.getUrlParam('dom');
	
		if( pub.dom ){
			pub.dom = pub.dom.substr(0,3) == 'dom';
		}
		
		if( pub.logined ){
			pub.userData = common.user_datafn();
			pub.userId = pub.userData.cuserInfoid;
			pub.source = "userId" + pub.userId;
			pub.sign = common.encrypt.md5( pub.source + "key" + common.secretKeyfn() ).toUpperCase();
			pub.tokenId = common.tokenIdfn();
			pub.userBasicParam = {
				userId : pub.userId,
				source : pub.source,
				sign : pub.sign,
				tokenId : pub.tokenId
			}
		}else{
			//common.jumpLinkPlain('../index.html'); // 未登录跳转首页
			common.goHomeApp();
		}
			
		//	*************************************************订单结算**********************************************
		pub.order_settlement = {}
		ORDER_SET = pub.order_settlement 
		
		ORDER_SET.seckill_data = JSON.parse(localStorage.getItem('seckillData'))  // 秒杀详情数据
		
		pub.seckillId = ORDER_SET.seckill_data.seckillId ? ORDER_SET.seckill_data.seckillId  : "" // 秒杀商品id
		
		pub.goods_type = ORDER_SET.seckill_data.type // 秒杀商品类型
		
		ORDER_SET.apiHandle = {
			init:function(){
				
				$('.way_self_show').show()
				//配送费  配送说明  联系电话 送货上门地址 隐藏
				$('.way_delivers_show , .set_delivery_box ,.delivery_cost,.user_phone_number').hide();
				ORDER_SET.apiHandle.storeInfo.init();
				
				var html = "";
				// 自动选择 取货方式
				if( common.addType.getKey() ){
					pub.tabIndex == 0  && ( pub.addrId = '' );
					pub.pickUpMethod = pub.tabIndex == 0 ? '1' : '2';
					$(".goods_way").find("span").eq( +pub.pickUpMethod -1 ).addClass("active")
					$('.user_address_info').find('.set_charge_address').eq( +pub.pickUpMethod -1 ).show().siblings().hide();
				}
				// 用户配送地址
				if( common.addType.getKey() && common.addressData.getKey() ){
					pub.AddrInfoRender( common.JSONparse( common.addressData.getItem() ) ); // 地址数据渲染
				}else{
					ORDER_SET.apiHandle.address_default_show.init() // 地址获取
				}
				
				 
				
				var total = parseInt(ORDER_SET.seckill_data.num)*parseInt(ORDER_SET.seckill_data.nowPrice)
				html += "<dl>"
				html += "	<dt><img src='"+ORDER_SET.seckill_data.goodsLogo+"' /></dt>"
				html += "	<dd>"+ORDER_SET.seckill_data.goodsName+"</dd>"
				html += "	<dd>"
				html += "		<span>x"+ORDER_SET.seckill_data.num+"</span>"
				html += "		<span>￥"+ORDER_SET.seckill_data.nowPrice+"</span>"
				html += "	</dd>"
				html += "</dl>"
				$('.order_goods').html(html)
				$('.goods_total span').html('￥'+ total)
				
				
				if( pub.goods_type == '2' ){
					pub.activityType = 7;
					$(".user_phone_number").show();
				}else{
					pub.activityType = 1;
				}
				// 商品转换为对象 参数
				if(!!ORDER_SET.seckill_data){
					var orderSet =  JSON.stringify([ORDER_SET.seckill_data]); 
					var obj = {};
					var localGoodsList = [];
					// 筛选处理
					JSON.parse( orderSet.replace(/\"\s*id\"\s*/g,"\"goodsId\"").replace(/\"\s*num\"\s*/g,"\"count\"")).forEach(function(v){
						localGoodsList.push( v );
					});
					obj.goodsList = eval( JSON.stringify( localGoodsList, ['goodsId','count'] ) );
					
					pub.goodsInfoApi =  JSON.stringify(obj);
						
				}
				
				ORDER_SET.apiHandle.shop_cart_submit_two()
			},
			storeInfo:{
				init:function(){
					if (!ORDER_SET.info) {
						ORDER_SET.apiHandle.storeInfo.api();
					}else{
						pub.firmId = ORDER_SET.info.id // 门店id
						var userStoreDom = $(".user_address_info")
						userStoreDom.find('.order_place').html( ORDER_SET.info.firmName)
						userStoreDom.find('.order_address').html(ORDER_SET.info.address)
						userStoreDom.find('.order_explain').html(ORDER_SET.info.pickUpTime)
						if( pub.goods_type == '2' ){
							if ( typeof ORDER_SET.info.wholecargoTime == 'undefined') {
								ORDER_SET.apiHandle.storeInfo.api();
							} else{
								if(ORDER_SET.info.wholecargoTime){
									userStoreDom.find(".set_delivery_box").show()
									userStoreDom.find(".set_delivery_box dd").html( ORDER_SET.info.wholecargoTime)
								}else{
									userStoreDom.find(".set_delivery_box").hide()
								}
								
							}
						}
					}
					//ORDER_SET.info = common.getStoreInfo() // 门店信息获取
					
				},
				api:function(){
					common.ajaxPost({
		 				method : 'firm_default',
		 				firmId : pub.firmId
			 		},function(d){
			 			if ( d.statusCode == "100000" ) {
			 				ORDER_SET.info = d.data;
			 				//common.storeInfo.setItem(JSON.stringify(d.data));
			 				ORDER_SET.apiHandle.storeInfo.init();
			 			}else{
			 				common.prompt( d.statusStr );
			 			}
			 		});
				}
			},
			shop_cart_submit_two:function(){
				common.ajaxPost($.extend({
					method: 'shop_cart_submit_two',
					goodsList: pub.goodsInfoApi,
					couponId: "",
					killId:ORDER_SET.seckill_data.id,
					pickUpMethod: pub.pickUpMethod
				},pub.userBasicParam),function(d){
					if(d.statusCode == "100000"){
						var cost = d.data.order.postCost,
							goodsMoney = d.data.order.goodsMoney,
							realPayMoney = d.data.order.realPayMoney;
							
						$('.delivery_cost span').html('￥'+cost)
						$(".goods_total span").html('￥'+goodsMoney)
						$(".all_total span,.order_total").html('￥'+realPayMoney )
						
						$('.delivery_cost').show();
					}
				})
			},
			order_submit:function(){
				common.ajaxPost($.extend({
					method : 'order_submit_three',
					activityType:pub.activityType,
					couponId : '',
					juiceDeliverTime :"",
					customMobile:pub.customMobile,
					goodsList : pub.goodsInfoApi,
					killId:ORDER_SET.seckill_data.id,
				},pub.userBasicParam, pub.orderParamInfo ),function( d ){
					switch( +d.statusCode ){
						case 100000 : (function(){
							common.orderCode.setItem( d.data.orderCode );
							common.orderBack.setItem( '1' );
							localStorage.removeItem("seckillData");
							common.jsInteractiveApp({
								name:'goToNextLevel',
								parameter:  {
									title:'订单支付',
									url:'html/order_pay.html'
								}
							})
//							common.historyReplace( 'order_management.html' );
//							common.jumpLinkPlain( "order_pay.html" );
						}()); break;
						case 100711 : common.prompt("地址不在配送范围"); break;
						case 100718 : common.prompt("请选择配货时间"); break;
						default : common.prompt( d.statusStr );
					}
				},function( d ){
					common.prompt( d.statusStr );
				});
			},
			// 默认地址
			address_default_show : {
				init : function(){
					common.ajaxPost($.extend({},{
						method : 'address_default_show'
					}, pub.userBasicParam ),function( d ){
						switch( +d.statusCode ){
							case 100000 : pub.AddrInfoRender( d.data ); break; // 配送地址渲染
							case 100300 : 
							case 100505 : $('.way_delivers_show').find('.group1').hide().next().show().html( "请选择收货地址" ); break;
						};
					},function( d ){
						common.prompt( d.statusStr );
					});
				}
			}
		};
		// 地址渲染
		pub.AddrInfoRender = function( d ){
			if (!d.latitude && !d.longitude ) {
				$('.way_delivers_show').find('.group1').hide().next().show().html( "请选择收货地址" );
			}else{
				pub.addrId = d.id; // 接收地址ID
				$('.goods_way').attr( 'addr-id', pub.addrId ); // 暂存 ID
				$('.way_delivers_show').find('.set_address_top').show().find('.take_goods_name').html( d.consignee )
				.next().html( d.mobile ).parent().next().html( d.provinceName + d.cityName + d.countyName + d.address + d.addName + d.street );
			}
		//	common.addressData.getKey() && common.addressData.removeItem();
		//	pub.addrDtd.resolve();
		};
		ORDER_SET.eventHandle = {
			init:function(){
//				common.jumpLinkSpecial(".header_left",function(){
//					sessionStorage.removeItem('seckillData');
//					common.addType.removeItem();
//					pub.dom ? window.location.replace('../index.html') : (function(){
//						window.history.back() ;
//					})();
//				});
				$('.footer_order .order_get').on('click',function(){
					var $this = $(this);
					pub.remarks = $(".order_remarks input").val(); // 备注
					// 公共参数
					pub.orderParamInfo = {
						pickUpMethod : pub.pickUpMethod,
						addrId : pub.addrId,
						firmId : pub.firmId,
						orderFrom : pub.orderFrom,
						message : pub.remarks,
					};
					
					$this.html('提交中 ...');
				  	var userNumber = $(".user_phone_number input").val()
					if(!pub.pickUpMethod){
						common.prompt('请选择一种配货方式')
						$this.html('提交订单');
					}else if($('.user_phone_number').is(':visible')){
						if(userNumber != ""){
							if (!common.PHONE_NUMBER_REG.test( userNumber )) {
								common.prompt('手机号输入错误');
								$this.html('提交订单');
							}else{
								pub.customMobile = userNumber; 
								ORDER_SET.apiHandle.order_submit()	
							}
						}else{
							common.prompt('请输入联系方式')
							$this.html('提交订单');
						}
					}else{
						pub.customMobile = "";
						ORDER_SET.apiHandle.order_submit()	
					}
					
				})
				$('.goods_way span').on('click',function(){
					var 
					$this = $(this),
					isCur = $this.is('.actived'),
					index = $this.index();
					$this.addClass('active').siblings().removeClass('active');
					$('.set_charge_address').hide().eq( index ).show();
					var tabIndex = $('.goods_way').find('span.active').index();
					if( !isCur ){
							pub.addrId = index == 0 ? '' : $('.goods_way').attr('addr-id');
							pub.pickUpMethod =  tabIndex == -1 ? '' : '' + ( tabIndex + 1 );
							common.addType.setItem( index == 0 ? '0' : '2' );
							
							if(index == 0){
								$('.delivery_cost').hide()
							}else{
								$('.delivery_cost').show()
							}
							ORDER_SET.apiHandle.shop_cart_submit_two()
						} 
				})
				// 选择配送地址
//				common.jumpLinkSpecial('.way_delivers_show',function(){
//					common.addType.setItem( "2" );
//					common.jumpLinkPlain( "address_management.html" );
//				});
				$(".way_delivers_show").on("click",function(){
					common.addType.setItem( "1" );
					if($(".goods_way").attr("addr-id")){
						window.localStorage.setItem("addId",$(".goods_way").attr("addr-id"))
					}
					//common.jumpLinkPlainApp( '地址列表',"html/address_management.html" );
					common.jsInteractiveApp({
						name:'goToNextLevel',
						parameter:{
							title:'地址列表',
							url:'html/address_management.html'
						}
					})
				})
				
			}
		}
		
		ORDER_SET.init = function(){
			
			pub.firmId = pub.userData.firmId; // 获取门店ID
			
			ORDER_SET.apiHandle.init()
			ORDER_SET.eventHandle.init()
		}
		pub.init = function(){
			ORDER_SET.init()
		}
		pub.init();
	})
})