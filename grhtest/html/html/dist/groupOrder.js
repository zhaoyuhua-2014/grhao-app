require(['../require/config'],function(){
	require(['common'],function(common){

		// 命名空间
	
		pub = {};
		 
		var wx = common.wx;
		
		pub.logined = common.isLogin(); // 是否登录
	
		pub.PAGE_INDEX = common.PAGE_INDEX; // 索引
	
		pub.PAGE_SIZE = common.PAGE_SIZE; // 页面显示数据个数
	
		pub.moduleId = $('[module-id]').attr( 'module-id' );  // 模块 id 
		
		pub.isWeiXin = common.isWeiXin();
		pub.isApp = common.isApp()
		
		pub.sharDataDefault = $.Deferred(); //分享数据延时对象。
	
		if( pub.logined ){
			pub.userId = common.user_datafn().cuserInfoid;
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
			if (pub.moduleId != 'groupDetailShare') {
				 common.goHomeApp(); // 未登录跳转
			}
		}
	
	
		pub.toFixed = common.toFixed; 
		// 页面box之前切换
		pub.switchInput = function( title, node1, node2, tit ){
			tit = tit || title;
			$('.header_title').html( tit );
			$( node1 ).fadeOut(100,function(){
				$( node2 ).fadeIn(200);
			});
		};
		// 公共模块
	
		// 接口处理
		pub.apiHandle = {};
		
		
		
		//  命名空间   订单管理
		pub.groupList = {};
		var OM = pub.groupList;
	
		OM.orderStatusHash = [ 0, 1, 2, 3]; // 0，全部，1，团进行中，3，已成功，4，已失败，
	
		OM.orderStatus = null; // 存储当前状态  处理 tab
		
		OM.groupType = null;// 存储当前状态  处理 tab
	
		OM.isLast = null; // 最后一页 
	
		OM.tabIndex = common.orderColumn.getItem(); 
	
		!OM.tabIndex && ( OM.tabIndex = '0' ); // tab 不存在默认设置为 0
	
	
		OM.orderCode = null;  // 订单编号
	
	
		OM.userBasicParam = {
			userId : pub.userId,
			tokenId : pub.tokenId
		}
	
		pub.orderArr = [];
	
		OM.apiHandle = {
			init : function(){
	
			},
			order_list : { // 团购列表
				init : function(){
					common.ajaxPost($.extend({
						method : 'group_order_list',
						type : OM.groupType,
						pageNo : pub.PAGE_INDEX,
						pageSize : pub.PAGE_SIZE
					},pub.userBasicParam),function( d ){
						switch( +d.statusCode ){
							case 100000 : OM.apiHandle.order_list.apiData( d ); break;
							case 100400 : (function(){
								common.clearData();
								common.prompt( '身份验证过期，请重新登录' );
								common.setMyTimeout(function(){
									//common.jumpLinkPlain( 'login.html' );
									common.jsInteractiveApp({
										name:'goToNextLevel',
										parameter:{
											title:'登录',
											url:'html/login.html'
										}
									})
								},2000);
							}()); break; 
							case 100712 : $('.lodemore').html('没有更多数据了').show(); break;
						}	
					});
				},
				apiData : function( d ){
					OM.isLast = d.data.lastPage;
					
					pub.orderArr = d.data.list;
		       		var html = '', i = 0;
		       		
		       		for (var i = 0,l = pub.orderArr.length; i < l; i++) {
		       			if (pub.orderArr[i].groups.groupStatus == 2) {
		       				//成功
		       				html += '<div class="groupListItem successStatus">'
		       			}else if(pub.orderArr[i].groups.groupStatus == 3){
		       				//失败
		       				html += '<div class="groupListItem failStatus">'
		       			}else{
		       				html += '<div class="groupListItem ">'	       				
		       			}
		       			html += '		<span class="status"></span>'	
		       			html += '	<div class="groupListItemTop clearfloat" dataOrderCode="'+pub.orderArr[i].orderInfo.orderCode+'">'
						html += '		<div class="groupListItemImg float_left">'
						html += '			<img src="'+pub.orderArr[i].orderInfo.orderLogo+'"/>'
						html += '		</div>'
						html += '		<div class="groupListItemContent float_left">'
						html += '			<h5 class="groupGoodsName ellipsis">'+pub.orderArr[i].orderInfo.allGoodsName+'</h5>'//[0].goodsName+pub.orderArr[i].groupId+
						html += '			<p class="groupDescribe ellipsis">'+pub.orderArr[i].orderInfo.orderDetailsList[0].goodsDescribe+'</p>'
						html += '			<div class="groupPeoplePrice clearfloat">'
						html += '				<span class="float_left groupPeople">'+pub.orderArr[i].groups.num+'人拼</span>'
						html += '				<span class="float_left groupPrice">￥'+pub.orderArr[i].orderInfo.goodsMoney+'</span>'//orderDetailsList[0].nowPrice
						html += '			</div>'
						html += '		</div>'
						html += '	</div>'
						html += '	<div class="groupListItemBottom clearfloat">'
						
						if(pub.orderArr[i].groups.groupStatus == 2){
		       				//成功
							html += '		<div class="groupTimeBox float_left">'+pub.orderArr[i].orderInfo.groupfinishTime+'</div>'
						}
						html += '		<div class="groupBthBox float_right clearfloat">'
						/*if(pub.orderArr[i].groups.groupStatus == 1){
		       				//失败
		       				html += '			<div class="groupBtn invitation" dataGroupId="'+pub.orderArr[i].id+'">邀请好友</div>'
		       			}else{
		       				html += '			<div class="groupBtn invitation hidden">邀请好友</div>'
		       			}*/
		       			html += '			<div class="groupBtn invitation hidden">邀请好友</div>'
						html += '			<div class="groupBtn group" dataOrderCode="'+pub.orderArr[i].orderInfo.orderCode+'">拼团详情</div>'
						if(pub.orderArr[i].groups.groupStatus == 2){
		       				//成功
		       				html += '			<div class="groupBtn order" dataOrderCode="'+pub.orderArr[i].orderInfo.orderCode+'">订单详情</div>'
		       			}else{
		       				html += '			<div class="groupBtn order hidden" dataOrderCode="'+pub.orderArr[i].orderInfo.orderCode+'">订单详情</div>'
		       			}
						
						html += '		</div>'
						html += '	</div>'
						html += '</div>'
		       		}
		       		
			       	$('.order_manage_contain').append( html ); 
			       	var arr = OM.isLast ? ['removeClass','没有更多数据了'] : ['addClass','点击加载更多数据'];
			       	$('.lodemore').show()[arr[0]]('loadMore').html(arr[1]);
				}
			},
		};
	
	
		OM.eventHandle = {
	
			init : function(){
				var lodemoreDom = $('.lodemore')
				// tab切换
				$('.order_manage_list.groupListNav li').on('click',function(){
	
					var 
					$this = $(this),
					i = $this.index(),
					isCur = $this.is('.actived');
	
					if( !isCur ){
						$('.order_manage_contain').empty();// 清空数据
	
						lodemoreDom.is(':visible') && lodemoreDom.hide();
	
						$this.addClass('active').siblings().removeClass('active');
	
						OM.groupType = OM.orderStatusHash[ i ];
	
						common.orderColumn.setItem( i );
	
						pub.PAGE_INDEX = 1; // 页码重置
	
						OM.apiHandle.order_list.init();
					}
	
				});
	
				$('.order_manage_list li').eq( +OM.tabIndex ).trigger('click'); // 触发点击事件
	
				//  点击加载更多
				$('.management_contain').on('click','.lodemore',function( e ){
					common.stopEventBubble( e );
					if ($(this).html() == '点击加载更多数据') {
						pub.PAGE_INDEX ++ ;	
						OM.apiHandle.order_list.init();
					}
				});
				$('.management_contain').on('click','.groupListItem .groupListItemTop',function( e ){
					var $this = $(this);
					
					//console.log($this)
					//common.groupId.setItem( $this.attr('datagroupid') ); //存储订单编号
					//common.jumpLinkPlain( 'groupBuying_orderDetails.html' );
					common.orderCode.setItem( $this.attr('dataOrderCode') ); //存储订单编号
					//common.jumpLinkPlain( 'groupBuying_orderDetails.html' );
					common.jsInteractiveApp({
						name:'goToNextLevel',
						parameter:{
							title:'拼团详情',
							url:'html/groupBuying_orderDetails.html'
						}
					})
				});
			    //点击跳转订单详情页面
				$('.order_manage_contain').on('click',".groupBtn",function(){
					var $this = $(this);
					var DomClassName = $this[0].className;
					
					common.orderBack.setItem( '1' );
					common.orderCode.setItem( $this.attr('dataOrderCode') ); //存储订单编号
					if (DomClassName.indexOf('order') >= 0) {
						common.jsInteractiveApp({
							name:'goToNextLevel',
							parameter:{
								title:'订单详情',
								url:'html/orderDetails.html'
							}
						})
					}else{
						common.jsInteractiveApp({
							name:'goToNextLevel',
							parameter:{
								title:'拼团详情',
								url:'html/groupBuying_orderDetails.html'
							}
						})
					}
					
				}); 
			},
		};
	
		// 订单列表入口
		OM.init = function(){
			OM.eventHandle.init();  // 事件初始化
		};
	
	/************************************* 团购详情模块 **************************/
		
		// 命名空间
		pub.groupDetail = {};
		var OD = pub.groupDetail;
	
		OD.orderCode = common.orderCode.getItem(); // 订单编号
	
		OD.source = "orderCode" + OD.orderCode;
	
		OD.sign = common.encrypt.md5( OD.source + "key" + common.secretKeyfn()).toUpperCase();
	
		OD.userBasicParam = {
			userId : pub.userId,
			tokenId : pub.tokenId,
			source : OD.source,
			sign : OD.sign
		}
		// 不同状态 用户操作数据结构
		OD.OPERATE = [
			{ text : '我要参团', className : 'joinGroupBtn',btnText : '删除'}, // 0
	    	{ text : '邀请好友参团', className : 'invitationGroupBtn', btnText : '' },// 1
	    	{ text : '查看订单', className : 'successGroupBtn', btnText : '' }, // 2
	    	{ text : '去看看其他拼团商品', className : 'failGroupBtn', btnText : '删除'}]; // 3
	
	    OD.METHOD = null; // 接收方法
	
		// 详情接口处理
		OD.apiHandle = {
			init : function(){
				if (pub.GOODS_ID) {
					OD.apiHandle.group_goods_details.init();
				}else{
					OD.apiHandle.order_details.init();
				}
				//微信环境的初始化微信sdk
		 		pub.isWeiXin && (function(){
					common.weixin.config( location.href.split('#')[0] );
					
					//微信sdk 及分享数据初始化完成在调用微信分享
					$.when(pub.sharDataDefault , common.weixinDefault).done(function(data,type){
						//alert('weixinSDK初始化'+type);
						//alert('weixin分享初始化');
						common.weixin.share( data );
					});
					
				}());
			},
			order_details : {
				init : function(){
					common.ajaxPost($.extend({},OD.userBasicParam,{
						method : 'group_order_details',
						orderCode : OD.orderCode
					}),function( d ){
						switch( +d.statusCode ){
							
							case 100000 : OD.apiHandle.order_details.apiData( d ); break;
							case 100400 : (function(){
								common.clearData();
								common.prompt( '身份验证过期，请重新登录' );
								common.setMyTimeout(function(){
									//common.jumpLinkPlain( 'login.html' );
									common.jsInteractiveApp({
										name:'goToNextLevel',
										parameter:{
											title:'登录',
											url:'html/login.html'
										}
									})
								},2000);
							}()); break;
							default : common.prompt( d.statusStr );
						}
					})
				},
				apiData : function( d ){
					var groupBuyer = d.data.groupBuyer,
						groupBuyers = d.data.groupBuyers;
					
					var btnInfo = OD.OPERATE[groupBuyer.groups.groupStatus];
					
					var activeInfo = {
						beginTime : groupBuyer.groups.beginTime,
						endTime : groupBuyer.groups.endTime,
						nowDate : groupBuyer.groups.nowDate,
						num : groupBuyer.groups.num,
						len : groupBuyers.length,
						groupMembers:groupBuyers,
						groupStatus : groupBuyer.groups.groupStatus
					};
					var goodsInfo = {
						goodsLogo:groupBuyer.orderInfo.orderLogo,
						goodsName:groupBuyer.orderInfo.allGoodsName,
						goodsDescribe:groupBuyer.orderInfo.orderDetailsList[0].goodsDescribe,
						goodsMoney:groupBuyer.orderInfo.goodsMoney,
						goodsId:groupBuyer.orderInfo.orderDetailsList[0].goods,
					}
			       	OD.apiHandle.detailsUI( btnInfo , activeInfo , goodsInfo , groupBuyer.orderInfo.orderCode , d.data.customShare)
			       	//团购为当前状态时候显示分享
			       	if (groupBuyer.groups.groupStatus == 1) {
			       		
			       		var linkUrl = d.data.customShare.link
			       		var sharObj = {
			       			android_download_uri: linkUrl,
			       			ios_download_uri: linkUrl,
			       			share_app_strs: goodsInfo.goodsName+"@"+goodsInfo.goodsDescribe+"\n￥"+goodsInfo.goodsMoney,
			       		};
			       		var obj = {
			       			"statusCode":"100000",
			       			"statusStr":"请求成功",
			       			"data":sharObj
			       		};
			       		common.jsInteractiveApp({
							name:'getShare',
							parameter:{
								str:JSON.stringify(obj)
							}
						})
			       	}
			       	
				}
			},
			group_goods_details:{
				init:function(){
					common.ajaxPost({
						method:'group_goods_details',
						goodsId:pub.GOODS_ID
					},function( d ){
						d.statusCode == "100000" && OD.apiHandle.group_goods_details.apiData( d );
					},function( d ){
						common.prompt( d.statusStr );
					})
				},
				apiData:function( d ){
					
					
					var goodsInfoAll = d.data.goodsInfo;
					var groups = d.data.groups;
					
					var btnInfo = OD.OPERATE[groups.groupStatus];
					
					var activeInfo = {
						beginTime : groups.beginTime,
						endTime : groups.endTime,
						nowDate : groups.nowDate,
						num : groups.num,
						len : groups.groupBuyers.length,
						groupMembers:groups.groupBuyers,
						groupStatus : groups.groupStatus
					};
					var goodsInfo = {
						goodsLogo:goodsInfoAll.goodsLogo,
						goodsName:goodsInfoAll.goodsName,
						goodsDescribe:goodsInfoAll.goodsDescribe,
						goodsMoney:goodsInfoAll.nowPrice,
						goodsId:goodsInfoAll.id,
					}
			       	OD.apiHandle.detailsUI( btnInfo , activeInfo , goodsInfo , null , d.data.customShare)
			       	//团购为当前状态时候显示分享
			       	if (groupBuyer.groups.groupStatus == 1) {
			       		var linkUrl = d.data.customShare.link ;
			       		var sharObj = {
			       			android_download_uri: linkUrl,
			       			ios_download_uri: linkUrl,
			       			share_app_strs: goodsInfo.goodsName+"@"+goodsInfo.goodsDescribe+"\n￥"+goodsInfo.goodsMoney,
			       		};
			       		var obj = {
			       			"statusCode":"100000",
			       			"statusStr":"请求成功",
			       			"data":sharObj
			       		};
			       		common.jsInteractiveApp({
							name:'getShare',
							parameter:{
								str:JSON.stringify(obj)
							}
						})
			       	}
				}
			},
			detailsUI:function( btnInfo , activeInfo , goodsInfo ,orderCode , shareData){
				
				var down = new common.CountDown();
				
				down.init({
					startTime:activeInfo.beginTime,
					endTime:activeInfo.endTime,
					serverTime:activeInfo.nowDate,
					targetDom:$(".groupResultMsg"),
					num: +activeInfo.num - activeInfo.len,
					groupStatus:activeInfo.groupStatus
				});
				var activeState = down.getStateAndTimer();
				
				//商品展示
		        var html = '';
		        if (pub.moduleId == 'groupDetailShare') {
		        	if (activeState.state == 'activeEnd') {
						html += '<span class="status endStatus" ></span>'
					}
		        }else{
		        	if (activeInfo.groupStatus == 2) {
		        		html += '<span class="status successStatus" ></span>'
		        	}else if (activeInfo.groupStatus == 3){
		        		html += '<span class="status failStatus" ></span>'
		        	}	        	
		        }
		        html += '<div class="groupListItemImg float_left">'
		        html += '	<img src="'+goodsInfo.goodsLogo+'"/>'
		        html += '</div>'
		        html += '<div class="groupListItemContent float_left">'
		        html += '	<h5 class="groupGoodsName ellipsis">'+goodsInfo.goodsName+'</h5>'
		        html += '	<p class="groupDescribe ellipsis">'+goodsInfo.goodsDescribe+'</p>'
		        html += '	<div class="groupPeoplePrice clearfloat">'
		        html += '		<span class="float_left groupPeople">'+activeInfo.num+'人拼</span>'
		        html += '		<span class="float_left groupPrice">￥'+goodsInfo.goodsMoney+'</span>'
		        html += '	</div>'
				html += '</div>'
				$(".groupDetail .groupListItem").html(html)
				
				
				var isJoinActive= false;
				var resultBox = $(".groupResultBox"),
					userBoxDom = resultBox.find(".groupMember .groupMemberList"),
					btnDom = $(".groupDetailBtnBox .groupDetailBtn");
				
				var str = '',j=0,len = activeInfo.num;
				userBoxDom.width(len*120);
				for (var j=0;j<len;j++) {
					var isActive ='';
					if (activeInfo.groupMembers[j] && activeInfo.groupMembers[j].buyerId == pub.userId) {
						isActive = "active";
						isJoinActive = true;
					}
					str += '<div class="float_left memberItem '+isActive+'">'
					if ( activeInfo.groupMembers[j] ) {
						str += '	<img src="'+ activeInfo.groupMembers[j].logo +'" />'
					}
					str += '</div>'
				}
				userBoxDom.html(str)
				
				if (!isJoinActive) {
					btnInfo = OD.OPERATE[0];
				}
				if (pub.moduleId == 'groupDetailShare') {
		        	if (activeState.state == 'activeEnd') {
						btnInfo = OD.OPERATE[3];
					}
		        }
				
				btnDom.html(btnInfo.text).addClass(btnInfo.className);
				btnDom.attr({
					goodsId:goodsInfo.goodsId,
					orderCode:orderCode,
				});
				
				if (shareData) {
					//分享链接处理
					if (!shareData.title) {
						shareData.title = goodsInfo.goodsName;
					}
					if (!shareData.desc ) {
						shareData.desc = goodsInfo.goodsDescribe+"\n￥"+goodsInfo.goodsMoney;
					}
					shareData.link = shareData.link + "?goodsId="+goodsInfo.goodsId;
					
					if(!shareData.imgUrl){
						shareData.imgUrl = goodsInfo.goodsLogo || "http://ximg.grhao.com/img_root/firm_logo/1/20170228203111.png";				
					}
				}else{
					
				}
				pub.isWeiXin && (function(){
	 				pub.sharDataDefault.resolve( shareData )
	 			}());
				
			},
			group_play:{
				init:function(){
					common.ajaxPost({
						method : 'group_play',
					},function(d){
						if ( d.statusCode == "100000" ){
							pub.ruleData = d.data;
							OD.apiHandle.group_play.apiData()
						}else{
							common.prompt( d.statusStr );
						}
					})
				},
				apiData:function(d){
					$('.group_title').text(pub.ruleData.title)
					$('.group_content').text(pub.ruleData.desc)
				}
			},
			group_goods_sponsor:{
				init:function(){
					common.ajaxPost($.extend({}, pub.userBasicParam, {
						method : 'group_goods_sponsor',
						goodsList : pub.goodsListStr
					}),function( d ){
						if ( d.statusCode == "100000" ) {
							
							common.jsInteractiveApp({
								name:'goToNextLevel',
								parameter:{
									title:'提交订单',
									url:'html/groupSettlement.html'
								}
							})
							//common.jumpLinkPlain('groupSettlement.html')
						}else{
							common.prompt( d.statusStr );
						}
					})
				}
			},
		};
	
		// 详情事件
		OD.eventHandle = {
	
			init : function(){
				var bool = true;
				//返回上一级
//				common.jumpLinkSpecial('.header_left',function(){
//					var mapBox = $('.zs_group_aboutus'),
//					isHide= mapBox.is(':hidden');
//					if( !isHide ){
//						pub.switchInput('拼单详情','.zs_group_aboutus','.groupDetail');
//					}else{
//	//					window.history.back();
//						common.jumpLinkPlain('groupBuying_orderManagement.html' )
//					}
//				});
				$('.groupDetailBtn').click(function(e){
					common.stopEventBubble(e);
					var 
					$this = $(this),
					isJoin = $this.is('.joinGroupBtn'),
					isSuccess = $this.is('.successGroupBtn'),
					isFail = $this.is('.failGroupBtn'),
					isInvitation = $this.is('.invitationGroupBtn');
	
					if ( isJoin ){
						if (pub.isWeiXin) {
							//调用参团接口
							var sum = 1;
							
							pub.goodsList = [{"goodsId":$this.attr("goodsId"),"count":sum}]
							pub.goodsListStr = JSON.stringify({
								'goodsList':pub.goodsList
							})
							if(pub.logined){
								localStorage.setItem('groupData',pub.goodsListStr)
								OD.apiHandle.group_goods_sponsor.init();
							}else{
								//common.jumpLinkPlain('login.html')
								common.jsInteractiveApp({
									name:'goToNextLevel',
									parameter:{
										title:'登录',
										url:'html/login.html'
									}
								})
							}
						}else{
							
						}
					}
					if ( isInvitation ) {
						if(pub.isApp){
							common.jsInteractiveApp({
								name:'share',
								parameter:{
									list:['WeChat','WeChatSpace']
								}
							})
						}else{
							common.prompt('不在app环境');
						}
						
					}
					if ( isSuccess ) {
						//跳转订单详情
						common.orderCode.setItem( $this.attr('orderCode') ); //存储订单编号
						//common.jumpLinkPlain( 'orderDetails.html' );
						common.jsInteractiveApp({
							name:'goToNextLevel',
							parameter:{
								title:'订单详情',
								url:'html/orderDetails.html'
							}
						})
					}
					if ( isFail ) {
						
						//跳转拼团商品列表
						common.jsInteractiveApp({
							name:'goToNextLevel',
							parameter:{
								title:'团购商品',
								url:'html/groupBuying.html'
							}
						})
						//common.jumpLinkPlain( 'groupBuying.html' ); // 去支付
					}
				});
//				$('.groupIntroduce ').click(function(){
//	    			pub.switchInput('拼团玩法','.groupDetail','.zs_group_aboutus');
//	    			bool && (function(){
//	    				if(!pub.ruleData){
//	    					OD.apiHandle.group_play.init()
//	    				}else{
//	    					OD.apiHandle.group_play.apiData()
//	    				}
//	    				bool = false;
//	    			}());
//	    		});
	    		$('.group_rule_click').click(function(){		
					var url = $(this).attr("data-url"),
					title = $(this).attr("data-title");
					common.jsInteractiveApp({
						name:'goToNextLevel',
						parameter:{
							title:title,
							url:url
						}
					})
	    		});
		       	
			}
		};
	
		// 团购详情 入口
		OD.init = function( str ){
			
			OD.apiHandle.init(str); // 接口初始化
			OD.eventHandle.init(); // 事件初始化
		}
		
		
		pub.get_weixin_code  = function(){
	        common.ajaxPost({
	            method: 'get_weixin_code',
	            weixinCode : pub.weixinCode
	        },function( d ){
	            if( d.statusCode == '100000' && d.data.fromWX == 1 ){
	                pub.openId =  d.data.openId;
					//pub.openId = 'oLC2v0vzHkVYsoMKzSec5w78rfSs'
	                common.openId.setItem( pub.openId ); // 存opendId
	                //pub.accountRelative.resolve(); // 触发账户关联接口
	                //获取openId后台判断如果注册的情况下就返回用户信息   没有注册的情况下后台默认注册
	                pub.apiHandle.scan_qrcode_login.init()
	            }else{
	                common.prompt( d.statusStr );
	            }
	        });
	    };
		//微信自动登录
		pub.apiHandle.scan_qrcode_login = {
			init:function(){
				common.ajaxPost({
		            method: 'scan_qrcode_login',
		            openId : pub.openId
		    	},function( d ){
		            if( d.statusCode == '100000'){
						pub.apiHandle.scan_qrcode_login.apiData(d);		                
		            }else{
		            	common.prompt( d.statusStr );
		            }
		        });
			},
			apiData:function(d){
				var infor = d.data.cuserInfo,
					user_data = {
					    cuserInfoid : infor.id,
					    firmId : infor.firmId,
					    faceImg : infor.faceImg,
					    petName : infor.petName,
					    realName : infor.realName,
					    idCard : infor.idcard,
					    mobile : infor.mobile,
					    sex : infor.sex,
					    isRegOpenfire:infor.isRegOpenfire
					};
				common.user_data.setItem( common.JSONStr(user_data) );
				localStorage.setItem('tokenId',d.data.tokenId)
				common.secretKey.setItem( d.data.secretKey );
				
				
				pub.logined = common.isLogin(); // 是否登录
				if( pub.logined ){
					pub.userId = common.user_datafn().cuserInfoid;
					pub.source = "userId" + pub.userId;
					pub.sign = common.encrypt.md5( pub.source + "key" + common.secretKeyfn() ).toUpperCase();
					pub.tokenId = common.tokenIdfn();
					pub.userBasicParam = {
						userId : pub.userId,
						source : pub.source,
						sign : pub.sign,
						tokenId : pub.tokenId
					}
				}
				OD.init(); // 模块初始化接口数据处理
	    	},
	    };
		function groupDetailShare () {
			pub.GOODS_ID = common.getUrlParam("goodsId");
			
			pub.domain = common.WXDOMAIN;
	 		pub.appid = common.WXAPPID;
	 		
	 		if (pub.isWeiXin) {
	 			pub.weixinCode = common.getUrlParam('code'); // 获取url参数
				pub.state = common.getUrlParam("state");//获取url机器编码参数
				if (!pub.GOODS_ID) {
					pub.GOODS_ID = pub.state;
				}
				if (pub.logined) {
					OD.init(); // 模块初始化接口数据处理
				}else{
					//state 微信后面参数  重定向后会带上state参数，开发者可以填写a-zA-Z0-9的参数值，最多128字节
					// 自定义参数
					var state = 'state='+(pub.GOODS_ID);
					
		 			pub.weixinCode ? pub.get_weixin_code() : common.jumpLinkPlain("https://open.weixin.qq.com/connect/oauth2/authorize?appid="+pub.appid+"&redirect_uri=" + pub.domain + "/html/groupBuying_share.html&response_type=code&scope=snsapi_userinfo&"+ state+ "&connect_redirect=1#wechat_redirect");
				}
	 		}else{
	 			OD.init(); // 模块初始化接口数据处理
	 		}
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
							$(".order_details,.pickUpcode-box,.position-label-box,.delivery,.take_goods_address_contain,.order_goods_contain_details,.order_set_list").addClass("skin"+sessionStorage.getItem("huanfu"))
						})();  break;
					}
					
				}
			}
		}
		
		
		// 事件处理
		pub.eventHandle = {};
		// 初始化
		pub.init = function(){
			if (!common.huanfu.getKey()) {
				common.change_app_theme();
				common.defHuanfu.done(function(){
					pub.apiHandle.change_app_theme.init();
				})
			}else{
				pub.apiHandle.change_app_theme.init();
			}
			switch( pub.moduleId ){
				case 'groupList' : OM.init(); break;
				case 'groupDetail' : OD.init(); break;
				case 'groupDetailShare' : groupDetailShare();break;
				
			}
		};
		pub.init();
	});
})