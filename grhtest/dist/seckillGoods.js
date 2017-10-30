/*
	seckill scirpt for Zhangshuo Guoranhao 
	换购 | 换购详情 + 秒杀 | 秒杀详情 + 预购 | 预购详情
*/
require(['../require/config'],function () {
	require(['common','goshopCar','mobileUi','swiperJS'],function(common,cart){
		// 命名空间

		pub = {};
		
		pub.logined = common.isLogin();// 是否登录 
	
		pub.PAGE_INDEX = common.PAGE_INDEX; // 索引
	
		pub.PAGE_SIZE = common.PAGE_SIZE; // 页面显示数据个数
	
		pub.moduleId = $('[module-id]').attr( 'module-id' ); // 模块id
	
		pub.RULE_CODE = ['MSGZ-DESC','YGGX-DESC']; // 状态码使用说明  换购 + 预购  
	
		pub.GOODS_ID = common.getUrlParam( 'goodsId' ); // 秒杀 | 换购 | 预购    商品ID   // 获取 url 参数
	
		pub.firmId = ( common.firmId.getItem() ? common.firmId.getItem() : null)// 门店ID
		
		pub.websiteNode = common.websiteNode.getItem() ? common.websiteNode.getItem() : null;//站点
		
		if( pub.logined ){
			pub.userId = common.user_datafn().cuserInfoid;
			pub.source = "userId" + pub.userId;
			pub.sign = md5( pub.source + "key" + common.secretKeyfn() ).toUpperCase();
			pub.tokenId = common.tokenIdfn();
	
			if( pub.moduleId == 'preBuyDetail' ){ // 预购详情加密
				pub.source = "preGoodsId" + pub.GOODS_ID + "-userId" + pub.userId;	
				pub.sign = md5( pub.source + "key" + common.secretKeyfn() ).toUpperCase();
			}
			pub.userBasicParam = {
				userId : pub.userId,
				source : pub.source,
				sign : pub.sign,
				tokenId : pub.tokenId
			};
		};
	
	
	
	/******************************************* 商品秒杀 + 换购 ************************************/
	
		// 命名空间
	
		pub.seckill = {};
	
		pub.seckill.SYSTEM_TIME = null; // 系统时间
	
		pub.seckill.BARTER_TIMES = null; // 换购次数
	
		pub.seckill.GOODS_INFO = null; // 商品信息
	
		pub.goodsList = null; // 购物车清单数据
	
	
		// 必须是严格的日期模式
		pub.seckill.parseDate = function( time ){
			return new Date( time.trim().replace(/\-/g,'\/') );
		};
		// 日期格式化
		pub.seckill.dateFormat = function( time ){
			if (time > 0) {
				var days = Math.floor(time/(24*60*60*1000));
				var hous = Math.floor(time/(60*60*1000)) - days * 24;
				var min = Math.floor(time/(60*1000)) - days*24*60 - hous * 60;
				var sec = Math.floor(time/1000) - days*24*60*60 -hous*60*60 -min*60;
				return days + "天" + hous + "小时" + min + "分" + sec + "秒";
			}
		};
		// 倒计时
		pub.seckill.countDown = function(){
			var time,_this,cle;
			var list = $(".zs-list");
			var timeDeal = function(){
				var clientTime = new Date().getTime();
				var time_difference = clientTime - pub.seckill.SYSTEM_TIME;
				var time;
				list.length == $('.isEnd').length && clearTimeout( timer );
	
				list.not('.isEnd').each(function(){
					_this = $(this);
					time = _this.attr("time");
					if( (time - time_difference)<0){
						$(this).addClass('isEnd');
						_this.html("秒杀活动已经开始").css("color","red");
						var str = _this.attr('id');
						$("."+str).html("立即秒杀").addClass("float_right1");
					}else{
						_this.html("秒杀开始：" + pub.seckill.dateFormat((time - time_difference))).css("color","red");
					}
				})
			}
			timeDeal();
			var timer = setInterval( timeDeal, 1000 );
		};
	
		pub.seckill.apiHandle = {
			init : function(){
				pub.seckill.apiHandle.grh_desc.init( pub.RULE_CODE[0] ); // 换购说明
			},
			user_barter_chance : {
	
				init : function(){
					common.ajaxPost($.extend({},pub.userBasicParam,{
						method : 'user_barter_chance',
						firmId:pub.firmId
					}),function( d ){
						if ( d.statusCode == "100000" ) {
		    				if ( d.data ) {
					    		pub.seckill.BARTER_TIMES = d.data.count;
					    	}else{
					    		pub.seckill.BARTER_TIMES = "0";
					    	}
					    	$('.seckill_notice span').html( pub.seckill.BARTER_TIMES );
		    			}
					});
				}
			},
			// 换购列表
			barter_list :{
				init : function(){
					common.ajaxPost({
						method : 'barter_list',
						firmId:pub.firmId,
						websiteNode:pub.websiteNode
					},function( d ){
						d.statusCode == "100000" && pub.seckill.apiHandle.barter_list.apiData( d );
					})
				},
				apiData : function( d ){
					var adInfoList = d.data.adInfoList;
					common.bannerShow( adInfoList, ".seckill_box2 .index_banner", function( d ){
	 					var html = '', i = 0;
	 					for ( i in d ){
							var link = d[i].linkUrl;
							link == "" ? link = 'javascript:void(0)' : link = d[i].linkUrl;
							html += '<div class="swiper-slide lazy" ><a href="' + link + '"><img src="' + d[i].adLogo + '" /></a></div>'
						}
						return html;
					},'.seckill_box1 .swiper-p2');
	
			        var 
			        html = '',
			        bool1 = true,
			        bool2 = true,
			        pagination = d.data.pagination,
			        old = !$.isArray( d.data.oldBarterGoodsList ) ? [] : d.data.oldBarterGoodsList; // 确保返回值为空
	
			        pagination = !$.isArray( pagination ) ? []  : pagination;
			       
			        var mergeData = pagination.concat( old );
	
			        if( old.length == 0 && pagination.length == 0 ){
			        	$('.seckill_main_box_wrap').html('暂无活动商品！').css({'fontSize':'30px','text-align':'center'});
			        	return;
			        }
			        
			        $.each( mergeData,function( i, v ){
			        	if( v.status == 1 ){
			        		if( bool1 ){
				        		html += '<div class="seckill_main_box_today_tit">本期换购</div>';
				        		bool1 = false;
			        		}
			        	}else{
			        		if( bool2 ){
				        		html += '<div class="seckill_main_box_tomorrow_tit">往期回顾</div>';
				        		bool2 = false;
			        		}
			        	}
			        		html += '<div class="seckill_main_box_center">'
			        	if( v.status == 1 ){
				       	    html += '<dl class="clearfloat" data-id="' + v.id + '" goods-id="' + v.goodsId + '" data-spec-info="' + v.specInfo + '" data-name="' + v.goodsName + '" data-price="' + v.nowPrice + '" data-logo="' + v.goodsLogo + '" data-max-num="' + v.buyNumber + '" data-package-num="' + v.packageNum + '">'
				     	}else{
				     		html += '<dl class="clearfloat" data-id="' + v.id + '" >'
				     	}    
				     	    html += '<dt><img src="' + v.goodsLogo + '"></dt>'
				       	    html += '<dd>'
				       	    html += '<div class="sekill_good_name">'
				       	    html += '<span class="float_left">' + v.goodsName + '</span>'
				       	if( v.status == 1 ){
				       	    html += '<span class="float_right stock">剩余' + ( v.initNum - v.saleNum ) + '件</span>'
				       	}
				       	    html += '</div>'
				       	    html += '<div class="sekill_good_specifications">' + v.specInfo + '</div>'
				       	    html += '<div class="sekill_good_specifications1">' + v.goodsDescribe + '</div>'
				       	    html += '<div class="sekill_good_bottom clearfloat">'
				       	    html += '<div class="float_left">'
				       	    html += '<span class="new_price font_color">￥' + v.nowPrice + '</span>'
				       	    html += '<span class="old_price">￥' + v.nomalPrice + '</span>'           	    
				       	    html += '</div>'
				       	if( v.status == 1 ){
				       	    if ( v.packageNum >= 0 ) {
				       	    	html += '<div class="float_right float_right1 float_right2 zs-barter">立即换购</div>'
				       	    }else{
				       	    	html += '<div class="float_right">没有了</div>'
				       	    }
				       	}
				       	    html += '</div>'   
				       	    html += '</dd>'
				       	    html += '</dl>'           	   
				       	    html += '</div>'
			        });
			        $('.seckill_box2 .seckill_main_box_wrap').html( html );
				}
			},
			grh_desc : {
				init : function( RULE_CODE ){
					common.ajaxPost({
						method : 'grh_desc',
						code : RULE_CODE,
						firmId:pub.firmId,
					},function( d ){
						if( d.statusCode = "100000" ){
							var str = d.data.desc;
							$('.alert_title').html( d.data.title );
							$('.alert_content').html( str.replace(/\r\n/g, "<br>") );  
		    			}
					});
				}
			},
			// 秒杀列表
			kill_goods_list : {
				init : function(){
					common.ajaxPost({
						method : 'kill_goods_list',
						firmId:pub.firmId,
						websiteNode:pub.websiteNode
					}, function( d ){
						if ( d.statusCode == "100000" ) {
							common.shareData = d.data.customShare; // 微信分享
							common.isWeiXin() && require.async('lib/weixin'); //判断微信环境调用分享
							pub.seckill.apiHandle.kill_goods_list.apiData( d );
						}
					})
				},
				apiData : function( d ){
					// 轮播处理 待优化
					common.bannerShow( d.data.adInfoList, '.seckill_box1 .index_banner', function( d ){ 
						var html = '', i = 0;
	 					for ( i in d ){
							var link = d[i].linkUrl;
							link == "" ? link = 'javascript:void(0)' : link = d[i].linkUrl;
							html += '<div class="swiper-slide lazy"><a href="' + link + '"><img src="' + d[i].adLogo + '" /></a></div>'
						}
						return html;
					}, '.seckill_box1 .swiper-p1');
	
					$.isArray(killGoodsDetailList) && ( pub.seckill.SYSTEM_TIME = pub.seckill.parseDate( d.data.killGoodsDetailList[0].newDate ) );
					var 
					killGoodsDetailList = d.data.killGoodsDetailList,
					pastKillGoodsDetailList = !$.isArray( d.data.pastKillGoodsDetailList ) ? [] : d.data.pastKillGoodsDetailList,
					html = '',
					bool1 = true,
					bool2 = true;
	
					killGoodsDetailList = !$.isArray(killGoodsDetailList) ? [] : killGoodsDetailList;
					var mergeData = killGoodsDetailList.concat( pastKillGoodsDetailList );
					if( mergeData.length == 0 ){ // 接口数据返回为空
						return;
					}
	
					$.each( mergeData, function( i, v ){
							if( v.status == 1 ){
								if( bool1 ){
					        		html += '<div class="seckill_main_box_today_tit">本周秒杀</div>';
					        		bool1 = false;
								}
				        	}else{
				        		if( bool2 ){
					        		html += '<div class="seckill_main_box_tomorrow_tit">往期回顾</div>';
					        		bool2 = false;
				        		}
				        	}
					        	html += '<div class="seckill_main_box_today_wrap">'
					        if( v.status == 1 ){
					        	html += 	'<ul class="seckill_main_box_tit">'
					        	html +=			'<li id = "cl' + i + '" time = "' + ( pub.seckill.parseDate( v.startTime ) - pub.seckill.SYSTEM_TIME ) + '" data-startTime="' + v.startTime + '" class="zs-list">秒杀开始</li>'
					        	html += 	'</ul>'
					        }else{
					        	html +='<div class="seckill_main_box_tit">' + v.startTime.substring(0,16)+'</div>'	
					        }
					        	html += 	'<div class="seckill_main_box_center">'
				        	if( v.status == 1 ){
				        		html += 		'<dl class="clearfloat" data-id="' + v.goods + '" goods-id="' + v.id + '" data-spec-info="' + v.goodsInfo.specInfo + '" data-name="' + v.goodsInfo.goodsName + '" data-price="' + v.nowPrice + '" data-logo="' + v.goodsInfo.goodsLogo + '" data-odePrice="' + v.goodsInfo.nomalPrice + '">'
				        	}else{	
				        		html += 		'<dl class="clearfloat" data-id="' + v.goods + '" >'
				        	}
			        		    html += 			'<dt><img src="' + v.goodsInfo.goodsLogo + '"></dt>'
			        	  	    html += 			'<dd>'
			        	  	    html += 				'<div class="sekill_good_name">' + v.goodsInfo.goodsName + '</div>'
			        	  	    html += 				'<div class="sekill_good_specifications">' + v.goodsInfo.specInfo + '</div>'
			        	  	    html += 				'<div class="sekill_good_specifications1">' + v.goodsInfo.goodsDescribe + '</div>'
			        	  	    html +=					'<div class="sekill_good_bottom clearfloat">'
			        	  	    html +=						'<div class="float_left">'
			        	  	    html += 						'<span class="new_price font_color">￥' + v.nowPrice + '</span>'
			        	  	    html += 						'<span class="old_price">￥' + v.otherPrice + '</span>'           	    
			        	  	    html +=						'</div>'
					        if( v.status == 1 ){  	    
					        	if ( pub.seckill.parseDate( v.startTime ) > pub.seckill.parseDate( v.newDate ) ) {
					        	  	    html += 				'<div class="float_right cl' + i + '">即将开始</div>'
					        	} else{
					        	  	if ( v.secBuyNum <= 0) {
					        	  	    html += 				'<div class="float_right">秒杀光了</div>'
					        	  	}else{
					        	  	    html += 				'<div class="float_right float_right1 enableKill">立即秒杀</div>'
					        	  	}
					        	}
					        }
			        	  	    html += 				'</div>'   
			        	  	    html += 			'</dd>'
			        	  	    html += 		'</dl>'           	   
			        	  	    html += 	'</div>'
				        		html += '</div>'
					});
					$('.seckill_box1 .seckill_main_box_wrap').html( html );
			        $('.seckill_main_box_today_tit')[0] && pub.seckill.countDown();
				}
			},
			// 秒杀
			click_kill : {
				init : function(){
					common.ajaxPost($.extend( {},pub.userBasicParam, {
	
						method : 'click_kill',
		    			goodsId : pub.GOODS_ID,
		    			
					}),function( d ){
						if( d.statusCode == "100000" ){
							var goodsInfo = pub.seckill.GOODS_INFO;
							cart.addgoods( goodsInfo.id, goodsInfo.name, goodsInfo.price, goodsInfo.logo, goodsInfo.specifications, goodsInfo.maxCount, goodsInfo.packageNum, goodsInfo.oldPrice );
							common.setShopCarNumApp(cart.getgoodsNum())
							cart.style_change();
							common.prompt( "秒杀成功！" );
						}else{
							common.prompt( d.statusStr )
						}
					});
				}
			},
	
			// 提交购物车清单
			shop_cart_submit : {
				init : function(){
					common.ajaxPost($.extend({}, pub.userBasicParam, {
						method : 'shop_cart_submit',
						goodsList : pub.goodsList
					}),function( d ){
						if ( d.statusCode == "100000" ) {
							common.orderType.setItem( '1' );
							common.jumpLinkPlainApp( "order_set_charge.html" );
						}else{
							common.prompt( d.statusStr );
						}
					})
				}
			}
	
		};
		pub.seckill.eventHandle = {
	
			init : function(){
	
				var tabNum = common.seckill.getItem(); // 获取存储的tab
	
				// tab 切换
				$('.seckill_tab_box').on('click','li.tab_list',function(){
					var 
					$this = $(this),
					isCur = $this.is('.actived'),
					index = $this.index();
					if( !isCur ){
						$this.addClass('actived').siblings().removeClass('actived');
	
						common.seckill.setItem( index + 1 + '');
						$('.seckill_box > div').eq( index ).fadeIn( 300 ).siblings().hide();
						if( index == 1 ){
							$(".footer_wrap").fadeIn( 300 );
							pub.seckill.apiHandle.kill_goods_list.init(); // 秒杀列表
						}else if( index ==0 ){
							pub.seckill.apiHandle.barter_list.init(); // 换购列表
							$(".footer_wrap").hide();
						}
					}
				});
	
				
				$('.seckill_tab_box .tab_list').eq( tabNum - 1 ).trigger('click'); 
	
	    		common.alertShow( '.seckill_notice .float_right' ); // 弹窗
				common.alertHide();
				common.jumpLinkSpecial( ".header_left", "../index.html" ); // 回首页
	
				//点击商品跳转到商品详情
				$(document).on('click','dl',function(e){
					common.stopEventBubble(e);
					var index = $('.seckill_tab_box li.actived').index();
					var pathNameTitle = ['换购商品详情','秒杀商品详情'][index];
					var pathName = ['html/seckillDetaila.html?goodsId=','html/seckillDetail.html?goodsId='][index];
					common.jumpLinkPlainApp( pathNameTitle , pathName + $(this).attr("data-id") );
				});
	
				
				// 可以秒杀
				$('.seckill_box1 .seckill_main').on('click','.enableKill',function(e){
					common.stopEventBubble(e);
					if ( pub.logined ) {
						var $this = $(this),
						node = $this.parents('[data-id]')
						goodsId = node.attr('data-id');
						pub.seckill.GOODS_INFO = {
						    id : goodsId,
						    name : node.attr('data-name'),
						    price : node.attr('data-price'),
						    logo : node.attr('data-logo'),
						    specifications : node.attr('data-spec-info'),
						    maxCount:'seckill',
						    packageNum:'seckill',
						    oldPrice:node.attr("data-odeprice")
					    };
					    pub.GOODS_ID = goodsId;
					   	
					    pub.seckill.apiHandle.click_kill.init();
					}else{
						common.jumpLinkPlainApp( '登录',"html/login.html?type=2" );
					}	
					
				});
				// 提交购物车清单
				pub.seckill.eventHandle.submitGoodsList();
	
				// 点击换购
				pub.seckill.eventHandle.clickBarter(); 
			},
			submitGoodsList : function(){
				// 提交购物车
				$('.footer_car_rigth').on('click',function(){
	
					pub.goodsList = cart.goodlist1();  // 购物车清单
	
					if ( pub.logined ) {
						common.orderType.setItem( "1" );
						common.sortCouponId.removeItem(); // 优惠券临时移除
						pub.seckill.apiHandle.shop_cart_submit.init();
					}else{
						common.jumpLinkPlainApp( "登录",'html/login.html?type=9' );
					};
				});
			},
			clickBarter : function(){
	
				//点击换购
				$('.zs-box').on('click','.zs-barter',function(e){
					common.stopEventBubble(e);
					if ( pub.logined ) {
						if( pub.seckill.BARTER_TIMES > 0 ){ // 换购次数
	
							var seckill_good = [];
	
							if( pub.moduleId == 'seckill' ){ // 换购列表
								var $this = $(this),
								node = $this.parents('[data-id]');
	
								seckill_good = [{
								    id : node.attr( 'data-id' ),
								    name : node.attr( 'data-name' ),
								    price : node.attr( 'data-price' ),
								    specifications : node.attr( 'data-spec-info' ),
								    logo : node.attr( 'data-logo' ),
								    count : "1"
							    }];
	
							}else{
								seckill_good.push( pub.seckill.GOODS_INFO );
							}
	
						    common.orderType.setItem( '2' );
						    common.seckillGood.setItem( common.JSONStr( seckill_good ) );
						    common.setMyTimeout(function(){
						    	common.jumpLinkPlainApp( "订单结算",'html/order_set_charge.html' );
						    },500);
	
						}else{
							common.prompt( "购物满99元才有机会哟!" );
						}
					}else{
						if ( pub.moduleId != 'seckill' ){
							common.goodid.setItem( pub.GOODS_ID );
							common.jumpLinkPlainApp( "登录","html/login.html?type=12" );
						}else{
							common.jumpLinkPlainApp( "登录","html/login.html?type=2" );
						}
						
					}
				});
			}
		};
		pub.seckill.init = function(){
	
			pub.seckill.apiHandle.barter_list.init(); // 换购列表
	
			pub.logined && pub.seckill.apiHandle.user_barter_chance.init();  // 换购机会  
			!pub.logined && $('.seckill_notice span').html( "0" );
	
			// 购物车初始化
			cart.eventHandle.init();
			cart.style_change();
	
			
			pub.seckill.apiHandle.init();
			pub.seckill.eventHandle.init();
		};
	
	
	
		/******************************************* 商品秒杀 商品详情  ************************************/
	
	
		// 详情模块 命名空间
	
		pub.detail = {};
	
		// 秒杀 命名空间
	
		pub.detail.seckill = {};
	
		// 接口处理命名空间
		pub.detail.seckill.apiHandle = {
			init : function(){
	
			}
			
		};
	
		// 事件命名空间
		pub.detail.seckill.eventHandle = {
			init : function(){
				
				pub.seckill.eventHandle.submitGoodsList(); // 购物车 清单提交
	
				// 点击秒杀
				$('.goodsDetails_box1').on('click',".float_right1",function(e){
	
					common.stopEventBubble(e);
	
					if ( pub.logined ) {
						pub.seckill.apiHandle.click_kill.init(); // 点击秒杀 调用接口
					}else{
						common.goodid.setItem( pub.GOODS_ID );
						common.jumpLinkPlainApp( "登录","html/login.html?type=3" );
					}
				});
			}
		}
	
	
	
		pub.detail.seckill.init = function(){
			pub.detail.seckill.apiHandle.init();
			pub.detail.seckill.eventHandle.init();
		};
	
	
	
	
		
	
		/******************************************* 换购  商品详情 ************************************/
	
		// 换购 详情命名空间
	
		pub.detail.barter = {};
	
		// 接口数据处理
		pub.detail.barter.apiHandle = {
			init : function(){
	
			},
	
		};
	
		// 事件处理
		pub.detail.barter.eventHandle = {
			init : function(){
				pub.seckill.eventHandle.clickBarter(); // 点击换购
			},
	
		};
	
	
	
		pub.detail.barter.init = function(){
			pub.logined && pub.seckill.apiHandle.user_barter_chance.init();  // 换购机会  
			!pub.logined && $('.seckill_notice span').html( "0" );
			pub.detail.barter.eventHandle.init();
			pub.detail.barter.apiHandle.init();
		};
	
	
		pub.detail.eventHandle = {
			init : function(){
				pub.detail.eventHandle.tempInit(); // 临时处理  
				// 返回上一页
				common.jumpLinkSpecial(".header_left",function(){
					window.history.back();
				});
			},
			tempInit : function(){
				//返回顶部
				window.onscroll = function(){
					var scroll = document.body.scrollTop || window.pageYOffset || document.documentElement.scrollTop;
					var isHide = $('.toTop').is(':hidden');
					if( scroll >= 600 ){
						isHide && $('.toTop').show();			
					}else{
						!isHide && $('.toTop').hide();
					}
				};
	
				$('.toTop').on('click', function(){
					$('html,body').animate({
						scrollTop : 0
					},500) 
				});
			}
	
	
	
		};
	
		// 秒杀 和 换购 共同接口 详情
		pub.detail.apiHandle = {
			init : function(){
				pub.detail.apiHandle.goods_show.init();
			},
			goods_show : {
				init : function(){
					common.ajaxPost({
						method : 'goods_show',
						goodsId : pub.GOODS_ID
					},function( d ){
	
						if ( d.statusCode == "100000" ) {
	
//							var goodsInfo = d.data.goodsInfo;
//							common.shareData = {
//								title : goodsInfo.goodsName,
//								desc : goodsInfo.goodsDescribe + "\n￥" + goodsInfo.nowPrice + "/" + goodsInfo.specInfo ,
//							    link : window.location.href, // 分享链接
//							    imgUrl : goodsInfo.goodsLogo
//							}
//							common.isWeiXin() && require.async('lib/weixin'); //判断微信环境调用分享
							pub.detail.apiHandle.goods_show.apiData( d );
						}
					})
				},
				apiData : function( d ){
					var goodsInfo = d.data.goodsInfo,
						killGoodsDetail = d.data.killGoodsDetail;
						// 轮播 秒杀 + 换购
						common.bannerShow( goodsInfo, '.goodsDetails_img_box', function( data ){
	
							var i,  html = '', imgArr = data.goodsPics.trim().split(/\s*@\s*/);
	
							imgArr[ imgArr.length - 1 ] == '' && imgArr.pop();
							
							for ( i in imgArr ) {
								html += '<div class="swiper-slide lazy"><img src="' + imgArr[ i ] + '" width="100%" /></div>'
							}
							return html;
						});
					  
						pub.seckill.GOODS_INFO =  {
							id : goodsInfo.id,
							name : goodsInfo.goodsName,
							price : goodsInfo.nowPrice,
							specifications : goodsInfo.specInfo,
							logo : goodsInfo.goodsLogo,
							maxCount:'seckill',
						    packageNum:'seckill',
						    oldPrice:goodsInfo.nomalPrice
						};
	
					if( pub.moduleId == 'seckillGoodsDetail' ){
						
						if ( killGoodsDetail ) {
							pub.seckill.SYSTEM_TIME = pub.seckill.parseDate( killGoodsDetail.newDate );
							$(".zs-list").attr("time", pub.seckill.parseDate( killGoodsDetail.startTime ) - pub.seckill.SYSTEM_TIME );
							if ( killGoodsDetail.startTime.replace(/\-/g, "\/") > killGoodsDetail.newDate.replace(/\-/g, "\/")) {
								$('.gd_number button').addClass("float_right").html("即将开始");
							} else{
								$('.gd_number button').addClass("float_right1").html("立即秒杀");
							};
							pub.seckill.countDown();
						}else{
							$(".zs-list").attr("time",0).html("活动已結束").css("color","red");;
						}
						//展示商品信息
						$('.gd_goodName').html( goodsInfo.goodsName );
						// $('.gd_specification').html( goodsInfo.specInfo );		
						// $('.gd_price').html('<span>￥' + goodsInfo.nowPrice + '</span>&nbsp;&nbsp;<del>￥' + goodsInfo.nomalPrice + '</del>');
						cart.style_change();
					}else{
	
						// $('.gd_specification').html( goodsInfo.specInfo );		
						// $('.gd_price').html('<span>￥' + goodsInfo.nowPrice + '</span>&nbsp;&nbsp;<del>￥' +  goodsInfo.nomalPrice + '</del>');
						if ( goodsInfo.status == "1" ) {
							$('.gd_goodName').find(".float_left").html( goodsInfo.goodsName );
							$('.gd_goodName').find(".float_right.stock").html("剩余" + ( goodsInfo.initNum -  goodsInfo.saleNum) + "件")
							if ( goodsInfo.packageNum <= 0) {
								$('.gd_number button').addClass("float_right").html("换购光了");
							} else{
								$('.gd_number button').addClass("float_right1 zs-barter").html("立即换购");
							}
						} else{
							$('.gd_goodName').html( goodsInfo.goodsName );
							$('.gd_number button').hide();
						};
					}
	
					goodsInfo.goodsContext && $('.goodsDetails_box2_').show().html( goodsInfo.goodsContext );
					$('.gd_specification').html( goodsInfo.specInfo );		
					$('.gd_price').html('<span>￥' + goodsInfo.nowPrice + '</span>&nbsp;&nbsp;<del>￥' +  goodsInfo.nomalPrice + '</del>');	
	
				}
			}
		};
	
	
		pub.detail.init = function(){
	
			pub.moduleId == 'barterGoodsDetail' && pub.detail.barter.init(); // 换购详情初始化 
	
			if( pub.moduleId == 'seckillGoodsDetail' ){
			 	pub.detail.seckill.init(); // 秒杀详情初始化
			 	cart.eventHandle.init();// 购物车初始化
				cart.style_change();
			}
	
			
	
			pub.detail.apiHandle.init();
			pub.detail.eventHandle.init();
		}
	
	
	
	
	/******************************************** 预购模块 *************************************/
		
		// 命名空间
	
		pub.preBuy = {};
	
		// 预购列表 
		pub.preBuy.ACTIVITY_STATUS = { 
			'willbegin' : [1,'活动未开始','#65a032'],
			'book' : [2,'活动进行中','#65a032'],
			'bookend' : [2,'活动进行中','#65a032'],
			'notretainage' : [2,'活动进行中','#65a032'],
			'end' : [3,'活动已结束','#b2b2b2']
		};
	
		pub.preBuy.apiHandle = {
			init : function(){
				pub.preBuy.apiHandle.pre_goods_list.init();
			},
	
			// 预购商品列表
			pre_goods_list : {
				init : function(){
					common.ajaxPost({
						method : 'pre_goods_list',
						firmId:pub.firmId,
						websiteNode:pub.websiteNode
					},function( d ){
						if( d.statusCode == '100000' ){
							common.shareData = d.data.customShare;
							pub.preBuy.apiHandle.pre_goods_list.apiData( d );
						}
					})
				},
				apiData : function( d ){
					// 轮播
					var data = d.data;
	 				data.adInfoList != "" && data.adInfoList.length != "0" && common.bannerShow( data.adInfoList, '.index_banner', function( d ){
	 					var html = '', i = 0;
	 					for ( i in d ){
							var link = d[i].linkUrl;
							link == "" ? link = 'javascript:void(0)' : link = d[i].linkUrl;
							html += '<div class="swiper-slide lazy"><a href="' + link + '"><img src="' + d[i].adLogo + '" /></a></div>'
						}
						return html;
	 				});
	
	 				var i = 0;
	 				var preGoodsList = !$.isArray( d.data.preGoodsList ) ? [] : d.data.preGoodsList;
	
	 				if( preGoodsList == 0 ){ return; }
	 				
	 				preGoodsList.forEach(function(v ,i){
	 					var html = '';
	 					html += '<dl class="clearfloat" data="' + v.id + '">'
	 					html += '	<dt><img src="' + v.goodsInfo.goodsLogo + '"/></dt>'
	 					html += '	<dd>'
	 					html += '		<div class="pre_good_name">' + v.goodsInfo.goodsName+'</div>'
	 					html += '		<div class="pre_good_specifications">' + v.goodsInfo.specInfo + '</div>'
	 					html += '		<div class="pre_good_specifications1">' + v.goodsInfo.goodsDescribe + '</div>'
	 					html += '		<div class="pre_good_price clearfloat">'
	 					html += '			<p class="clearfloat"><span>定金：</span><span class="font_color">￥' + v.frontMoney + '</span></p>'
	 					html += '			<p class="clearfloat"><span>尾款：</span><span class="font_color">￥' + v.retainage + '</span></p>'
	 					html += '		</div>'
	 					html += '	</dd>'
	 					html += '</dl>'
	
	 					var 
	 					preStatus = pub.preBuy.ACTIVITY_STATUS[ preGoodsList[i].preStatus ];
	 					boxNode = $('.pre_goods_box' + preStatus[0] );
	 					boxNode.show().find('.pre_active_tit').html( preStatus[1] ).css("background-color",preStatus[2]);
		 				boxNode.find('.active_goods_box').append( html );
	
	 				});
				}
			}
	
		};
	
		pub.preBuy.eventHandle = {
	
			init : function(){
				common.jumpLinkSpecial(".header_left","../index.html"); //点击返回首页
				$(".pre_goods_box").on('click',"dl",function(){
					common.jumpLinkPlainApp( "预购商品详情","html/preDetails.html?goodsId=" + $(this).attr("data") );
				});
			},
		};
		pub.preBuy.init = function(){
	
			pub.preBuy.apiHandle.init();
			pub.preBuy.eventHandle.init();
			
		}
	
	/******************************************** 预购详情模块 *************************************/	
	
		// 命名空间
	
		pub.preBuyDetail = {};
	
		pub.preBuyDetail.PRE_GOODS_COUNT = 1; // 预购商品数量
	
		// 预购详情  状态
		pub.preBuyDetail.PRE_STATUS = {
			'willbegin' : ['活动未开始','#b2b2b2'],
			'book' : ['支付定金','#fe7831'],
			'bookend' : ['等待付尾款','#b2b2b2'],
			'notretainage' : ['支付尾款','#fe7831'],
			'end' : ['活动结束','#b2b2b2']
		};
	
		// 预购详情接口数据处理
		pub.preBuyDetail.apiHandle = {
			init : function(){
				pub.seckill.apiHandle.grh_desc.init.call( pub.preBuyDetail.apiHandle.grh_desc, pub.RULE_CODE[1] ); // 规则
				pub.preBuyDetail.apiHandle.pre_good_show.init(); // 详情信息列表展示
			},
			pre_good_show : {
				init : function(){
					common.ajaxPost({
						method : 'pre_good_show',
						preGoodsId : pub.GOODS_ID, // 商品id
						firmId:pub.firmId
					},function( d ){
						if ( d.statusCode == "100000" ) {
	
							var 
							preGoods = d.data.preGoods,
							goodsInfo = preGoods.goodsInfo;
	
							common.bannerShow( goodsInfo, '.goodsDetails_img_box', function( data ){
								var i, html = '',
								imgArr = data.goodsPics.trim().split(/\s*@\s*/);
	
								imgArr[ imgArr.length - 1 ] == '' && imgArr.pop();
								
								for ( i in imgArr ) {
									html += '<div class="swiper-slide lazy"><img src="' + imgArr[ i ] + '" width="100%" /></div>'
								}
								return html;
							});
	
							//本地商品数量
							$(".gd_number .minus_num").show().next('.show_num').show().html("1").attr("dataId",goodsInfo.id);
							//添加存储数据到元素
							$('.good_box1_box11').attr({
								'data' : goodsInfo.id,
								'dataname' : goodsInfo.goodsName,
								'dataprice' : goodsInfo.nowPrice,
								'datalogo' : goodsInfo.goodsLogo,
								'dataspecInfo' : goodsInfo.specInfo,
								'datamax' : goodsInfo.perBuyNum,
								'datapackagenum' : goodsInfo.packageNum
							});	
	
							function substr( str ){ // 临时函数
								return ( str + '' ).substring(5,16);
							}
	
							//展示商品信息
							$('.gd_goodName').html( goodsInfo.goodsName );
							$('.gd_specification').html( goodsInfo.specInfo );
							$('.pre_gd_price').html('定金：<span class="font_color">￥' + preGoods.frontMoney + '</span>&nbsp;&nbsp;&nbsp;&nbsp;尾款：<span class="font_color">￥' + preGoods.retainage + '</span>');		
							$(".pre_goods_details dl").eq(0).find("dd").html( substr( preGoods.frontMoneyStart ) + "-" + substr( preGoods.frontMoneyEnd ) );
							$(".pre_goods_details dl").eq(1).find("dd").html( substr( preGoods.retainageStart ) + "-" + substr( preGoods.retainageEnd ) );
							if ( goodsInfo.goodsContext ) {
								$('.goodsDetails_box2_').show().html(goodsInfo.goodsContext);
							};
	
	
							var tempData = pub.preBuyDetail.PRE_STATUS[ preGoods.preStatus ]; 
	
							!tempData && ( preGoods.preStatus = 'end' ); // 查找不到 给默认值end
							
							$('.pre_pay_btn').html(tempData[0]).css("background",tempData[1]).addClass( preGoods.preStatus );
	
						}
					})
				},
				apiData : function(){
	
				}
			},
			save_pre_order_rcd : { // 生成支付订单
				init : function(){
					common.ajaxPost($.extend({},pub.userBasicParam,{
						method : 'save_pre_order_rcd',
						preGoodsId : pub.GOODS_ID,
						buyNum : '' + pub.preBuyDetail.PRE_GOODS_COUNT,
					}),function( d ){
	
						if ( d.statusCode == "100000" ) {
	
							common.orderCode.setItem( d.data.orderCode );
	
							common.jumpLinkPlainApp("订单支付", 'html/order_pay.html?search=pre' ); //跳转到支付页面
							
						}else if( d.statusCode == "100716" ){
	
							common.prompt("已有预购订单");	
							
						}
					},function( d ){
						common.prompt( d.statusStr );
					});
				}
			},
			pre_shop_cart_submit : {
				init : function(){
					common.ajaxPost($.extend({},pub.userBasicParam,{
						method : 'pre_shop_cart_submit',
						pickUpMethod : common.PICK_UP_METHOD,
						preGoodsId : pub.GOODS_ID
					}),function( d ){
						if ( d.statusCode == "100000" ) {
							pub.preBuyDetail.apiHandle.pre_shop_cart_submit.apiData( d );
							// pre_order(data);
						} else if( d.statusCode == "100713" ){
							common.prompt( "未参与预购活动" );
						}else {
							common.prompt( d.statusStr );
						}
					})
				},
				apiData : function( d ){
	
					if ( d.data.order.isSavePreOrder == "0" ) {
						common.orderCode.setItem( d.data.order.preOrderCode );
						common.jumpLinkPlainApp( "订单提交","html/order_set_charge.html" );
					} else if( d.data.order.isSavePreOrder == "1" ){
						common.orderCode.setItem( d.data.order.preOrderCode );
						common.jumpLinkPlainApp( "订单支付","html/order_pay.html" );
					}
					common.orderType.setItem( "3" );
				}
			}
	
		};
	
		// 预购详情事件处理
		pub.preBuyDetail.eventHandle = {
			init : function(){
				pub.detail.eventHandle.tempInit.call( pub.preBuyDetail.eventHandle ); // 继承秒杀换购方法
				// 返回上一页
				common.jumpLinkSpecial(".header_left","pre.html");
	
				common.alertShow( '.pre_rule' ); // 规则弹窗
				common.alertHide();
	
				$('.pre_pay_btn').on('click',function(){
	
					var $this = $(this),
					bool = $this.is('.willbegin') || $this.is('.bookend') || $this.is('.end');
	
					if( bool ){
						$this.off('click');
						return;
					}
					if( pub.logined ){
						$this.is('.book') && pub.preBuyDetail.apiHandle.save_pre_order_rcd.init(); // 生成支付订单
						$this.is('.notretainage') && pub.preBuyDetail.apiHandle.pre_shop_cart_submit.init();  // 支付尾款
					}else{
						common.goodid.setItem( pub.GOODS_ID );
						common.jumpLinkPlainApp("登录",'html/login.html?type=4');
					}
				});
	
	
				//增加商品
				$(".add_num").on('click',function(){
					var 
					$this = $(this),
					node = $this.parents('[datamax]'),
					datamax = node.attr("datamax"), //限购
					datapackagenum = node.attr("datapackagenum"); //库存
					
					if ( pub.preBuyDetail.PRE_GOODS_COUNT < datapackagenum ) { // 库存
	
						if( +datamax != 0 ){ // 限购
	
							if( pub.preBuyDetail.PRE_GOODS_COUNT < datamax ){
	
								$this.prev('.show_num').html( pub.preBuyDetail.PRE_GOODS_COUNT ++ );
								$('.footer_item[data-content]','#foot').attr('data-content',cart.getgoodsNum());
	
							}else{
								common.prompt( "该商品限购" + datamax + "件" );
							}
						}else{
	
							$this.prev('.show_num').html( pub.preBuyDetail.PRE_GOODS_COUNT ++ );
							$('.footer_item[data-content]','#foot').attr('data-content',cart.getgoodsNum());
	
						}
					} else{
						common.prompt( "库存不足" );
					}
				});
	
				//减少商品
				$('.minus_num').on('click',function(){
					pub.preBuyDetail.PRE_GOODS_COUNT > 1 &&  $(this).next('.show_num').html( pub.preBuyDetail.PRE_GOODS_COUNT -- );
				});
	
			}
		};
	
		pub.preBuyDetail.init = function(){
	
			pub.preBuyDetail.apiHandle.init();
			pub.preBuyDetail.eventHandle.init();
		}
	
		// 父模块
		pub.apiHandle = {
			init : function(){
	
			}
		};
	
		pub.eventHandle = {
			init : function(){
	
			}
		}
	
		pub.init = function(){
	 		$('.footer_item[data-content]','#foot').attr('data-content',cart.getgoodsNum());
			pub.moduleId == 'seckill' && pub.seckill.init(); // 秒杀换购列表
			pub.moduleId != 'seckill' && pub.moduleId != 'preBuy' && pub.detail.init(); // 秒杀 换购 详情
			pub.moduleId == 'preBuy' && pub.preBuy.init(); // 预购列表
			pub.moduleId == 'preBuyDetail' && pub.preBuyDetail.init(); // 预购详情
			
		}
		
		pub.init();
	})
})
