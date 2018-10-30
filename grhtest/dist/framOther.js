require(['../require/config'],function () {
	require(['common','vue','mobileUi'],function( common, Vue){
		
		
		// 农场命名空间
		var pub = {};
		
		pub.muduleId = $('[module-id]').attr('module-id');
		
		pub.domain = common.WXDOMAIN;
		pub.appid = common.WXAPPID;
		pub.bigSize = '100';
		pub.logined = common.isLogin(); // 登陆状态
		
		pub.firmId =  localStorage.getItem("firmId")
		pub.storeInfo =  localStorage.getItem("storeInfo")
		
		pub.farmSelectStoreInfo = localStorage.getItem("farmSelectStoreInfo")
		
		if (pub.logined) {
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
		};
		/*
		PageStatus 
		 关于页面加载的全局状态的定义
		*/
		var PageStatus = {
			Initialization:1,//数据初始化的加载阶段页面显示一个canves的加载动画
			
			interaction:2,//页面可交互状态
			
			InitializationError:-1,//初始化时候失败--（包含登陆失败，调用农场初始化接口失败）
			
			changeScene:3,//表示改变场景时候的状态
			
			changeSceneError:-3,//改变场景时候请求接口失败（土地，好友，）
			
		};
		var PageType = 0;// 更新  0 、为兑换水果/赠送水果，1 、为兑换果币  2、为兑换成功  
	
		
		/*
		 分析页面DOM数据结构
		 * */
		
		var dateModule = {
			sharData:{
				title:"果然好农场，免费种植水果送回家",
				imgUrl:'http://ximg.grhao.com/img_root/farm/farm_share.png',
				desc:'和我一起种水果吧！！！'
			}
		}
		
		
		
		/*
		使用VUe的双向数据绑定
		实现页面的状态管理
		 * */
		pub.Vue = new Vue({
			el: '#appVue',
			data: {
				PageStatus : false,
				PageType : PageType,
				isMask:false,//遮罩层的状态 true 表示显示
				
				isWx:false,//是否是微信环境
				urlParm:null,//页面URL后面拼接的参数
				isMaskData:null,//表示遮罩显示时候的----使他显示的view对象
				titleText:'',
				ruleList:[],
				fruit:{},//水果数据
				exchangeBtnStatus:1,//默认为1 不可兑换 2为可以兑换
				exchangeErrorMsg:null,//兑换的错误信息
				exchangeFruitCoinErrorMsg:null,//兑换果币的错误信息
				addressInfo:{},
				fruitNum:null,
				pageNo: common.PAGE_INDEX,
				pageSize: common.PAGE_SIZE,
				exchangeRecord:{//兑换记录列表
					list:[],
					isLast:true,
				},
				ajaxState:'wait',//默认值为wait  成功  失败 ,
				coinNum:null,
				giveFriends:{},//赠送数据
				giveNum:null,//赠送数量
				giveErrorMsg:null,//赠送错误信息
				friedsInfo:[],//好友信息列表
				num:0,// 
				successful:{},//兑换或赠送文本
				storeSelection:[],
				defaultSelectId:null,
				isLast:null
				
			},
	        beforeCreate : function(){
	        	
	        },
	        created : function(){
	        	console.log("created			//创建完成")
	        	this.isWx = common.isWeiXin();
	        	if (localStorage.getItem("farmExchangeNum")) {
	        		this.fruitNum = localStorage.getItem("farmExchangeNum");
	        	}
	        	
	        },
	        beforeMount : function(){
	        	console.log("beforeMount		//挂载之前")
	        	
	        },
	        updated : function(){
	        	console.log("updated			//数据被更新后")
	        	
	        },
	        computed: {
			    getFriedsWidth:function(){
			    	if (this.friedsInfo.length > 4) {
				      	return (this.friedsInfo.length * 150)+"px"
				    }else{
				      	return "660px"
				    }
			    },
			},
	        watch : {
	        	PageStatus:function(val,oldVal){
	        		//console.log("val="+val+",oldVal="+oldVal);
	        	},
	        	fruitNum:function(val,oldVal){
	        		//console.log("val="+val+",oldVal="+oldVal);
	        		var n = val.replace(/[^\d]/g,'');
	        		if (n == 0) {
	            		this.fruitNum='';
	            	}else{
	            		this.fruitNum=n;
	            	}
	            	if (n > parseInt(this.fruit.num /this.fruit.rate)) {
	            		this.exchangeErrorMsg = "当前已超出可兑换的数量"
	            	}else{
	            		this.exchangeErrorMsg = null;
	            	}
	            	
	        	},
	        	PageType:function(val,oldVal){
	        		//console.log("val="+val+",oldVal="+oldVal);
	        		if (val == 2 && oldVal == 1) {
	        			
	        		}
	        	},
	        	giveNum:function(val,oldVal){
	        		var n = val.replace(/[^\d]/g,'');
	        		if (n == 0) {
	            		this.giveNum='';
	            	}else{
	            		this.giveNum=n;
	            	}
	        		if( n > parseInt(this.giveFriends.num)){
	        			this.giveErrorMsg = "当前已超出可赠送数量";
	        		}else{
	        			this.giveErrorMsg = null;
	        		}
	        	},
	        	coinNum:function(val,oldVal){
	        		console.log("val="+val+",oldVal="+oldVal);
	        		console.log(typeof(val)=="string")
	        		if (typeof(val)=="string") {
	        			var n = val.replace(/[^\d]/g,'');
		        		if (n == 0) {
		            		this.coinNum='';
		            	}else{
		            		this.coinNum=n;
		            	}
		            	if (n > parseInt(this.fruit.num /this.fruit.score)) {
		            		this.exchangeFruitCoinErrorMsg = "当前已超出可兑换的数量"
		            	}else{
		            		this.exchangeFruitCoinErrorMsg = null;
		            	}
	        		}
	        		
	        	}
	        },
			methods: {
				goBack:function(item){
					/*if (item == 1) {
						window.history.back();
					}else{
						window.location.href = "../html/grhFarm.html"					
					}*/
					common.jsInteractiveApp({
						name:'goBack',
						parameter:{
							num:1,
							type:1,
							url:'html/grhFarm.html'
						}
					})
				},
				//关闭遮罩
				closeMask:function(event){
					var target = event.target;
					var view_name = target.getAttribute("data-obj");
					if (view_name == 'siginIn') {
						pub.creatDataModule.signIn(false);
					}else if (view_name == 'dynamicInfo'){
						pub.creatDataModule.dynamicInfo(false);
					}else if (view_name == 'friedsInfo'){
						pub.creatDataModule.friedsInfo(false);
					}else if (view_name == 'landInfo'){
						pub.creatDataModule.landInfo(false);
					}else if (view_name == 'storehouseInfo'){
						pub.creatDataModule.storehouseInfo(false);
					}
					pub.Vue.pageNo = 1;
				},
				contentRex:function(item){
					var str = ''
					if (typeof item == "string") {
						str = item.trim();
						str = str.replace(/\r\n/g, "<br/>")
					}else{
						str = item.toString();
					}
			    	return str;
			   	},
			   	goAddressList:function(){
			   		common.addType.setItem( "10" );
			   		if (this.fruitNum) {
			   			localStorage.setItem('farmExchangeNum',this.fruitNum)
			   		}
			   		if (common.isApp()) {
			   			common.jsInteractiveApp({
							name:'goToNextLevel',
							parameter:{
								title:'选择门店',
								url:'html/storeSelection.html'
							}
						})
			   		}else{
			   			common.jumpLinkPlain("storeSelection.html")
			   		}
			   	},
			   	exchangeFruit:function(e){
			   		var target = event.target;
			   		var isActive = $(target).is('.active');
			   		if (isActive) {
			   			farmExchange.apiHandle.exchange_fruit.init();
			   		}
			   	},
			   	clickGetMoreList:function(){
			   		if (pub.Vue.exchangeRecord.isLast) {
		      		}else{
		      			pub.Vue.pageNo += 1;
		      			farmExchangeRecord.apiHandle.exchange_fruit.init();
		      		}
			   	},
			   	goOrderDetails:function(index){
			   		console.log(index)
			   		if (this.exchangeRecord.list[index].status == 2) {
						common.orderBack.setItem( '1' );
						common.orderCode.setItem( this.exchangeRecord.list[index].orderCode ); //存储订单编号
						if (common.isApp()) {
				   			common.jsInteractiveApp({
								name:'goToNextLevel',
								parameter:{
									title:'订单详情',
									url:'html/orderDetails.html'
								}
							})
				   		}else{
				   			common.jumpLinkPlain( 'orderDetails.html' );
				   		}
						
			   		}
			   	},
			   	exchangeCoin:function(e){
			   		var target = event.target;
			   		var isActive = $(target).is('.active');
			   		if (isActive) {
			   			farmExchange.apiHandle.exchange_coin.init();
			   		}
			   },
				selectedGiveFriends:function(index){
			   		this.num = index;//this指向app
			   		console.log(this.num)
			   	},
			   	giveThings:function(){
			   		var target = event.target;
			   		var isActive = $(target).is('.active');
			   		if (isActive) {
						giveFriend.apiHandle.farm_friend_give.init();
			   		}
			   	},
			   	invitationFriend:function(){ //邀请好友弹窗
		      		setTimeout(function(){
		      			if (common.isApp()) {
		      				common.jsInteractiveApp({
								name:'gameShare',
								parameter:dateModule.shareData
							})
		      			} else{
		      				common.prompt1({
				                flag:1,
				                msg:"点击右上角，发送给指定微信好友<br/>好友点击链接后即可成为好友",
				                callback:function(){
									
				                }
				            })
		      			}
		      		},300)
		      	},
		      	storeSelected:function(index){
		      		var obj =this.storeSelection[index];
		      		localStorage.setItem('farmSelectStoreInfo',JSON.stringify(obj))
		      		
		      		if (common.isApp()) {
		      			/*common.jsInteractiveApp({
							name:'goBack',
							parameter:{
								hierarchy:1,
								reload:true,
								url:'html/storeSelection.html'
							}
						})*/
						common.jsInteractiveApp({
							name:'goBack',
							parameter:{
								num:1,
								type:1,
								url:'html/farmExchange.html'
							}
						})
		      		} else{
		      			window.location.replace( 'farmExchange.html?dom=dom' + Math.floor(Math.random() * 100000 ) );
		      		}
		      	}
			}
		})
	//	//农场接口
	//	pub.apiHandle = {
	//		init: function() {
	//			
	//		},
	//	};
		/*
		 农场规则
		 * 
		 * */
		var farmRule = {};
		
		farmRule.apiHandle = {
			init:function(){
				farmRule.apiHandle.farm_desc.init();
			},
			farm_desc:{
				init:function(){
					$.ajaxSetup({
						url: common.APIFARM,
					})
					common.ajaxPost($.extend({},{
						method: 'farm_desc',
					},pub.userBasicParam), function(d) {
						d.statusCode == "100000" ? farmRule.apiHandle.farm_desc.apiData(d) : common.prompt(d.statusStr);
					})
				},
				apiData: function(d) {
					var v = d.data;
					console.log(v);
					pub.Vue.ruleList = v;
				}
			}
		};
		farmRule.eventHandle = {
			init:function(){
				
			},
		}
		
		farmRule.init = function(){
			
			farmRule.apiHandle.init();
			farmRule.eventHandle.init();
		}
		/*
		 兑换
		 * */
		
		var farmExchange = {
			
		};
		farmExchange.apiHandle = {
			init:function(){
				pub.Vue.fruit = JSON.parse(localStorage.getItem("farmFruit"));
				
				if (pub.farmSelectStoreInfo && pub.farmSelectStoreInfo != 'undefined'){
					pub.Vue.addressInfo = JSON.parse(pub.farmSelectStoreInfo)
				}else{
					//pub.Vue.addressInfo = JSON.parse(pub.storeInfo)
					farmExchange.apiHandle.firm_default.init();
				}
				console.log(pub.Vue.addressInfo)
			},
			exchange_fruit:{
				init:function(){
					$.ajaxSetup({
						url: common.APIFARM,
					})
					common.ajaxPost($.extend({},{
						method: 'exchange_fruit',
						userId: pub.userId,
						farmFruitId:pub.Vue.fruit.id,
						fruitNum:pub.Vue.fruitNum,
						firmId:pub.Vue.addressInfo.id
					}, pub.userBasicParam ),function( d ){
						d.statusCode == "100000" ? farmExchange.apiHandle.exchange_fruit.apiData(d) : common.prompt(d.statusStr);
					},function( d ){
						common.prompt( d.statusStr );
					});
				},
				apiData:function(d){
					var v= d.data;
					pub.Vue.successful = v.operationRcd.note;
					pub.Vue.PageType = 2;
					//自定义原声返回事件
					setTimeout(function(){
           				common.goBackCustomApp({
                    		title:'果然好农场',
                    		url:'html/grhFarm.html',
                    		callBackName:'pub.apiHandle.farm_main.init()'
	                    });
           			},800)
				}
			},
			//兑换果币接口
			exchange_coin:{
				init:function(){
					$.ajaxSetup({
						url: common.APIFARM,
					})
					common.ajaxPost($.extend({},{
						method: 'exchange_score',
						userId: pub.userId,
						farmFruitId:pub.Vue.fruit.id,
						scoreNum:pub.Vue.coinNum
						
					}, pub.userBasicParam ),function( d ){
						d.statusCode == "100000" ? farmExchange.apiHandle.exchange_coin.apiData(d) : common.prompt(d.statusStr);
					},function( d ){
						common.prompt( d.statusStr );
					});
				},
				apiData:function(d){
					var v= d.data;
					pub.Vue.PageType = 2;
					pub.Vue.successful = v.operationRcd.note;
					console.log(v.operationRcd)
					//自定义原声返回事件
					setTimeout(function(){
           				common.goBackCustomApp({
                    		title:'果然好农场',
                    		url:'html/grhFarm.html',
                    		callBackName:'pub.apiHandle.farm_main.init()'
	                    });
           			},800)
				}
			},
			firm_default : {
		 		// 默认门店初始化函数
		 		init : function(){
		 			$.ajaxSetup({
						url: common.API,
					})
		 			common.ajaxPost({
		 				method : 'firm_default',
		 				firmId : pub.firmId
			 		},function(d){
			 			d.statusCode == "100000" && farmExchange.apiHandle.firm_default.apiData( d );
			 			d.statusCode == common.SESSION_EXPIRE_CODE && common.clearData();
			 		});
		 		},
		
		 		// 默认门店 + 用户门店 接口返回数据处理
		 		apiData : function( data ){
		 			var 
		 			d = data.data[0] || data.data;
		 			localStorage.setItem('storeInfo',JSON.stringify(d));
		 			pub.storeInfo = d; 
					pub.firmId = d.id;
					pub.Vue.addressInfo = d;
		 		}
		 	}
		};
		farmExchange.eventHandle = {
			init:function(){
				
			},
		}
		
		farmExchange.init = function(){
			
			farmExchange.apiHandle.init();
			farmExchange.eventHandle.init();
		}
		
		/*
		 兑换记录
		 * */
		
		var farmExchangeRecord = {
			
		};
		farmExchangeRecord.apiHandle = {
			init:function(){
				pub.Vue.ajaxState = 'wait'
				farmExchangeRecord.apiHandle.exchange_fruit.init();
			},
			exchange_fruit:{
				init:function(){
					$.ajaxSetup({
						url: common.APIFARM,
					})
					common.ajaxPost($.extend({},{
						method: 'exchange_fruit_rcd_list',
						userId: pub.userId,
						pageNo: pub.Vue.pageNo,
						pageSize: pub.Vue.pageSize
					},pub.userBasicParam),function( d ){
						d.statusCode == "100000" ? farmExchangeRecord.apiHandle.exchange_fruit.apiData(d) : function(){
							common.prompt(d.statusStr);
							pub.Vue.ajaxState = 'fail';
						};
					},function( d ){
						common.prompt( d.statusStr );
						pub.Vue.ajaxState = 'fail'
					});
				},
				apiData:function(d){
					var v= d.data;
					if (pub.Vue.pageNo == 1) {
						pub.Vue.exchangeRecord.list = v.objects;					
					}else{
						pub.Vue.exchangeRecord.list = pub.Vue.exchangeRecord.list.concat(v.objects);
					}
					pub.Vue.exchangeRecord.isLast = v.isLast;
					pub.Vue.ajaxState = 'success'
					console.log(v)
					
				}
			}
		};
		farmExchangeRecord.eventHandle = {
			init:function(){
			},
		}
		
		farmExchangeRecord.init = function(){
			farmExchangeRecord.apiHandle.init();
			farmExchangeRecord.eventHandle.init();
		}
	//	赠送好友
		var giveFriend = {};
		giveFriend.apiHandle = {
			init:function(){
				pub.Vue.giveFriends = JSON.parse(localStorage.getItem("giveFriends"));
			},
			farm_friend_give:{
				init:function(){
					$.ajaxSetup({
						url: common.APIFARM,
					})
					common.ajaxPost($.extend({},{
						method: 'farm_friend_give',
						ownId: pub.Vue.giveFriends.farmerId,
						friendId: giveFriend.eventHandle.friendId(),
						seedOrFerId:giveFriend.eventHandle.seedOrFerId(),
						num:pub.Vue.giveNum,
						type:pub.Vue.giveFriends.type
					},pub.userBasicParam),function( d ){
						d.statusCode == "100000" ? giveFriend.apiHandle.farm_friend_give.apiData(d) : (function(d){
							common.prompt(d.statusStr);
							pub.Vue.ajaxState = 'fail';
						})(d);
					},function( d ){
						common.prompt( d.statusStr );
						pub.Vue.ajaxState = 'fail'
					});
				},
				apiData: function(d) {
					var v = d.data;
					pub.Vue.PageType = 2;
					pub.Vue.successful = v[0].note;
					pub.Vue.ajaxState = 'success'
					//自定义原声返回事件
					setTimeout(function(){
           				common.goBackCustomApp({
                    		title:'果然好农场',
                    		url:'html/grhFarm.html',
                    		callBackName:'pub.apiHandle.farm_main.init()'
	                    });
           			},800)
				}
			}
			
		}
		giveFriend.eventHandle={
			//种子id和化肥id的区分
			seedOrFerId:function(){
				if(pub.Vue.giveFriends.type == 1 || pub.Vue.giveFriends.type == 3  ){
					return pub.Vue.giveFriends.seedId
				}else{
					return pub.Vue.giveFriends.fertilizerId
				}
			},
			friendId:function(){
				return $(".select_item").attr("id")
			}
		}
		 giveFriend.init = function(){
		 	giveFriend.apiHandle.init();
		 	farm_friend_list.apiHandle.init();
		 }
		 var farm_friend_list = {};
		 farm_friend_list.apiHandle = { //好友列表
				init: function() {
					$.ajaxSetup({
						url: common.APIFARM,
					})
					common.ajaxPost($.extend({},{
						method 	 : "farm_friend_list",
						ownId	 :pub.Vue.giveFriends.farmerId,
						pageNo	 :pub.Vue.pageNo,
						pageSize :pub.bigSize,
					},pub.userBasicParam), function(d) {
						d.statusCode == "100000" ? farm_friend_list.apiHandle.apiData(d) : function(d){
							common.prompt(d.statusStr);
							pub.Vue.ajaxState = 'fail';
						}
					})
				},
				apiData: function(d) {
					var v= d.data.objects;
					if (v.length > 1) {
						var owne =  v.filter(function(item){
							return item.id != pub.Vue.giveFriends.farmerId;
						});
						pub.Vue.friedsInfo = owne ;
					}else{
						pub.Vue.friedsInfo = [] ;
					}
					
					pub.Vue.PageStatus = true;
					common.isWeiXin() && (function(){
						var Url = (function(){
							var iswhy = location.href.indexOf("?")
							if (iswhy > 0) {
								return pub.getAdd() + "grhFarm.html?farmerId="+v[0].id;
							}else{
								return pub.getAdd()+"grhFarm.html?farmerId="+v[0].id;
							}
						})()
		 				common.weixin.config( location.href.split('#')[0] );
		 				var shareData = $.extend({},dateModule.sharData,{
		 					link:Url
		 				})
		 				common.weixin.share( shareData );
		 			}());
		 			common.isApp() && (function(){
		 				dateModule.sharData = $.extend({},dateModule.sharData,{
		 					'linkUrl':'http://weixin.grhao.com/html/grhFarm.html?farmerId='+ v.farm.farmerId
		 				});
		 			})()
				}
			}
	//	 售货机选择
		var storeSelection = {};
		storeSelection.init = function(){
			if (pub.farmSelectStoreInfo && pub.farmSelectStoreInfo != 'undefined'){
				pub.Vue.addressInfo = JSON.parse(pub.farmSelectStoreInfo)
			}else{
				pub.Vue.addressInfo = (function(){
					if (pub.storeInfo) {
						return JSON.parse(pub.storeInfo)
					}else{
						return {
							id:pub.firmId
						}
					}
				})()
			}
			
			storeSelection.apiHandle.init();
		}
		storeSelection.apiHandle = {
			init:function(){
				$.ajaxSetup({
						url: common.API,
					})
					common.ajaxPost({
						method 	 : "choose_firm_list",
						pageSize : pub.bigSize,
						pageNo   : pub.Vue.pageNo,
					},function(d){
						d.statusCode == "100000" ? storeSelection.apiHandle.apiData(d) : common.prompt(d.statusStr);
					})
			},
			apiData:function(data){
	//			pub.Vue.storeSelection =data.data.hasPage.objects
				pub.Vue.pageNo = data.data.hasPage.pageNo;
				pub.Vue.isLast = data.data.hasPage.isLast; 
				if(data.data.noPage.objects != 0){
					pub.Vue.storeSelection = data.data.hasPage.objects;
				}
				
				function fi(){
					
				}
			}
		}
		storeSelection.eventHandle={
			
		};
		pub.init = function(){
			switch( +pub.muduleId ){
				
				case 1 : farmRule.init(); break; // 农场规则
				case 2 : farmExchange.init(); break; // 兑换
				case 3 : farmExchangeRecord.init(); break;// 兑换记录
				case 4 : giveFriend.init();break;//赠送好友
				case 5 : storeSelection.init();break;//售货机选择
			};
		}
		pub.getAdd = function(){
			var address = window.location.href;
			var host = window.location.host;
			var n = address.indexOf("index.html");
			var m = address.indexOf(".html");
			var state = common.getUrlParam("state");
			var _n = address.indexOf("?");
			var add = '';
			if (state) {
				add = address.substr(0,_n)+"html/";
			}else{
				if (m == '-1') {
					add = address + "html/";				
				}else{
					add = address.substr(0,n)+"html/";
				}
			}
			return 'http://'+host + '/html/';
		};
		pub.init();
		window.pub = pub;
//	module.exports = pub;
	})
})