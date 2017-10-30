/*
* 	other scirpt for Zhangshuo Guoranhao
* 	评价 + 订单支付结果 + 充值说明 + 充值记录  
*/ 
define(function(require, exports, module){

	var common = require('lib/common.js?v=20000');

	// 命名空间

	pub = {};

	pub.moduleId = $( '[module-id]' ).attr( 'module-id' );

	pub.logined = common.isLogin(); // 是否登录

	if( pub.logined ){
		pub.tokenId = common.tokenIdfn(); 
		pub.orderCode = common.orderCode.getItem();
		pub.source = "orderCode" + pub.orderCode;
		pub.sign = md5( pub.source + "key" + common.secretKeyfn() ).toUpperCase();
		pub.userBasicParam = {
			tokenId : pub.tokenId,
			sign : pub.sign,
			source : pub.source,
			orderCode: pub.orderCode,
		};
	}else{
		pub.moduleId != 'rechargeExplain' && common.jumpLinkPlain( '../index.html' ); // 未登录回到首页
	}
	pub.PAGE_INDEX = common.PAGE_INDEX; // 索引
	pub.PAGE_SIZE = common.PAGE_SIZE; // 页面显示数据个数

/******************************************* 订单评价 *************************************/

	// 命名空间

	pub.evaluate = {};
	
	// 接口处理
	pub.evaluate.apiHandle = {
		init : function(){
		},
		order_comment : {
			init : function(){
				common.ajaxPost($.extend({
					method : 'order_comment',
					goods : pub.evaluate.QUALITY_STARS_NUM,
					shop : pub.evaluate.SELLER_STARS_NUM,
					dispatcher : pub.evaluate.DISPATCHING_STARS_NUM,
					desc : pub.evaluate.EVALUATE_CONTENT

				},pub.userBasicParam),function( d ){
					d.statusCode == "100000" && common.goBackApp(1,true,"html/order_management.html");
				});
			}
		}
	};
	// 事件处理
	pub.evaluate.eventHandle = {
		init : function(){
			$('.zs-eval').on('click','.zs-star',function(e){
				var 
				$this = $(this),
				parentNode = $this.parents('.zs-eval'),
				len = parentNode.find('.actived').size();
				len != 0 && parentNode.find('.actived').removeClass('actived');
				$this.addClass('actived').prevAll('.zs-star').addClass('actived');
			});
			$('.eval_submit').click(function(){
				var evalNode = $('.zs-eval');
				pub.evaluate.EVALUATE_CONTENT = $('.eval_intro_content').val(); // 评价内容
				pub.evaluate.QUALITY_STARS_NUM = evalNode.eq(0).find('.actived').length; // 商品
				pub.evaluate.SELLER_STARS_NUM = evalNode.eq(1).find('.actived').length; // 商家
				pub.evaluate.DISPATCHING_STARS_NUM = evalNode.eq(2).find('.actived').length; // 配送
				if( !pub.evaluate.QUALITY_STARS_NUM ){
					common.prompt('商品质量评价不能为空'); return;
				}
				if( !pub.evaluate.SELLER_STARS_NUM ){
					common.prompt('商家服务评价不能为空'); return;
				}
				if( !pub.evaluate.DISPATCHING_STARS_NUM ){
					common.prompt('配送服务评价不能为空'); return;
				}
				pub.evaluate.apiHandle.order_comment.init();
			});
		},
	};

	pub.evaluate.init = function(){
		pub.evaluate.eventHandle.init();
	};

/**************************** 订单支付结果 模块 **********************************/
	// 命名空间

	pub.payRusult = {};

	pub.payRusult.apiHandle = {
		init : function(){
			pub.payRusult.apiHandle.unitDeal.init();
		},
		unitDeal : {
			init : function(){
				common.ajaxPost($.extend({
					method : pub.payRusult.METHOD,
				},pub.userBasicParam),function( d ){
					d.statusCode == "100000" && pub.payRusult.apiHandle.unitDeal.apiData( d );
					d.statusCode != "100000" && common.prompt( d.strStatus );
				});
			},
			apiData : function( d ){
				d = d.data.orderInfo ? d.data.orderInfo : d.data;
				if ( d.orderStatus == "3" || d.payStatus == '2' ) {
					$(".result_status").addClass("result_bg").html("订单支付成功！");
					$(".result_goto").html("查看订单").css("background","#93c01d").on("click",function(){
						d.payStatus == '2' && common.jumpLinkPlainApp( "preOrderDetail.html" );
						d.orderStatus == '3' && common.jumpLinkPlainApp( "orderDetails.html" );
			    	})
				} else{
					$(".result_status").addClass("result_bg2").html("订单支付失败！");
					$('.result_message').remove();

					$(".result_goto").html("返回重新支付").css("background","#fe7831").on("click",function(){
			    		common.jumpLinkPlainApp( 'order_pay.html' );
			    	})
				};
		    	$(".result_detail ul li").eq(0).html("订单号:" + d.orderCode ).next().html("实付款:<span class='font_color'>￥" + d.realPayMoney + "</span>");
		    	$(".result_message").show();
			}
		}
	};

	pub.payRusult.eventHandle = {
		init : function(){
			common.jumpLinkSpecial(".header_left",function(){
				 pub.payRusult.isDeposit && common.jumpLinkPlain( "PreOrder_management.html" );
				!pub.payRusult.isDeposit && common.jumpLinkPlain( "order_management.html" );
			});
		}
	};
	// 支付结果 模块 初始化
	pub.payRusult.init = function(){
		pub.payRusult.isDeposit = pub.orderCode.substring(8,10) == "07";
		pub.payRusult.METHOD = pub.payRusult.isDeposit ? 'pre_order_details' : 'order_details';
		pub.payRusult.apiHandle.init();
		pub.payRusult.eventHandle.init();
	};




/**************************** 充值说明 模块 **********************************/

	// 命名空间
	pub.payExplain = {};
	
	pub.payExplain.apiHandle = {
		init : function(){
			pub.payExplain.apiHandle.month_card_type_list.init();
		},
		month_card_type_list : {
			init : function(){
				common.ajaxPost({
					method : 'month_card_type_list'
				},function( d ){
					d.statusCode == '100000' && pub.payExplain.apiHandle.month_card_type_list.apiData( d ); 
	     			d.statusCode != '100000' && common.prompt(data.strStatus);
				})
			},
			apiData : function( d ){
					var 
					html = ''      	
					d = d.data;

			    	for(var i in d.monthCardType){
			    		html += '<div class="month_discount_detail clearfloat">'
			    		html += '    <div class="discount_detail_intr">' + d.monthCardType[i].policyName + '</div>'        		
			    		html += '    <div class="discount_detail_intr">' + d.monthCardType[i].extraMoney + '</div>'        	  
			    		html += '</div>'
			    	}

			    	!!d.grhAdDesc && $('.month_service_intro').show().html( d.grhAdDesc.desc.replace(/\r\n/g, "<br/>") );
			    	!!d.grhCouponDesc && $('.month_copon_instruction').show().html( d.grhCouponDesc.desc.replace(/\r\n/g, "<br/>") );
			    	!!d.adInfo && $('.month_service_banner').css( 'background','url(' + d.adInfo.adLogo + ')' ); 
			    	$('.month_discount_content').html( html );
			}
		}
	};
	pub.payExplain.eventHandle = {
		init : function(){
			common.jumpLinkSpecialApp('.discount_pay','',function(){
				if( pub.logined ){
					common.orderCode.removeItem();
					common.jumpLinkPlainApp( '账户充值','html/month_recharge.html?search=recharge' );
				}else{
				   	common.jumpMake.setItem( "7" );
				   	common.jumpLinkPlainApp( '登录',"html/login.html?type="+7 );
				}
			});
		}
	};

	pub.payExplain.init = function(){
		pub.payExplain.apiHandle.init();
		pub.payExplain.eventHandle.init();
	};

/**************************** 充值记录 模块 **********************************/

	pub.rechargeRecord = {};

	pub.rechargeRecord.payWay = {
		"2" : { text : '支付宝充值' },
		"3" : { text : '微信充值' },
		"4" : { text : '快捷充值' },
		"8" : { text : '系统充值' }
	};
	

	pub.rechargeRecord.apiHandle = {
		init : function(){
			pub.userId = common.user_datafn().cuserInfoid;
			pub.source = "userId" + pub.userId;
			pub.sign = md5( pub.source + "key" + common.secretKeyfn() ).toUpperCase();

			pub.rechargeRecord.apiHandle.user_recharge_rcd.init();
		},
		user_recharge_rcd : {
			init : function(){
				common.ajaxPost({
					method : 'user_recharge_rcd',
					userId : pub.userId,
					pageNo : pub.PAGE_INDEX,
					pageSize : pub.PAGE_SIZE,
					tokenId : pub.tokenId,
					sign : pub.sign,
					source : pub.source
				},function( d ){
					d.statusCode == "100000" && pub.rechargeRecord.apiHandle.user_recharge_rcd.apiData( d );
				});
			},
			apiData : function( d ){
				var html='';
				pub.isLast = d.data.lastPage;
				
		    	if( pub.isLast ){                	                	
		        	pub.lodemore.show().html('没有更多数据了');	
		        }else{   
		        	pub.lodemore.show().html('点击加载更多数据');             
		        };

		        if( !$.isArray( d.data.list ) || d.data.list.length==0 ){
		        	pub.lodemore.show().html('没有更多数据了'); return;
		        }
				d.data.list.forEach(function( v, i ){
					html += '<div class="fruit_get_content clearfloat">'
					html += '<div class="fruit_get_content_left">' + v.payTime.substring(0,10) +'</div>'
					html += '<div class="fruit_get_content_center">' + pub.rechargeRecord.payWay[ v.paymentMethod ].text + '</div>'
					html += '<div class="fruit_get_content_right">￥' + v.money + '</div>'
					html += '</div>'
				});
				$('.fruit_get_contain').append( html );
			}
		}
	};

	pub.rechargeRecord.eventHandle = {
		init : function(){

			pub.lodemore.on('click',function(){				
				if( !pub.isLast ){
					pub.PAGE_INDEX ++ ;
					pub.rechargeRecord.apiHandle.user_recharge_rcd.init();
				}				
			});
			common.jumpLinkSpecial('.header_left','month_recharge.html?search=recharge');
		}
	};


	pub.rechargeRecord.init = function(){
		pub.lodemore = $('.lodemore');
		pub.rechargeRecord.apiHandle.init();
		pub.rechargeRecord.eventHandle.init();

	};

 	pub.apiHandle = {};
	pub.eventHandle = {};
 	pub.init = function(){
 		pub.moduleId == 'evaluate' && pub.evaluate.init();
 		pub.moduleId == 'payResult' && pub.payRusult.init();
 		pub.moduleId == 'rechargeExplain' && pub.payExplain.init();
 		pub.moduleId == 'rechargeRecord' && pub.rechargeRecord.init();

 	};

	module.exports = pub;	

});	
