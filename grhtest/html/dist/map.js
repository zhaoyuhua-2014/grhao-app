require(['../require/config'],function () {
	require(['common','mobileUi',"map1"],function(common){
		var pub = {};//{'latitude':'30.27415000','longitude':'120.15515000'}
		
		pub.logined = common.isLogin(); // 已经登录
		
	 	if( pub.logined ){
	 		pub.firmId = common.user_datafn().firmId; // 门店ID
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
	 	
		$("#container").height($(window).height())
		pub.type = common.getUrlParam("type") ? common.getUrlParam("type") : null;
		//所有门店地址
		pub.allMap = localStorage.getItem("allMap") ? JSON.parse(localStorage.getItem("allMap")) : null;
		//当前位置
		pub.locationInfo = (localStorage.getItem("location") && JSON.parse(localStorage.getItem("location")).AOIName) ? JSON.parse(localStorage.getItem("location")) : {'latitude':'30.24423873','longitude':'120.1823616'}
		//门店地址
		pub.mapData = localStorage.getItem("mapData") ? JSON.parse(localStorage.getItem("mapData")) : null;
        pub.Map = {
        	init:function(){
        		if (pub.type == "all") {
        			var  map = new AMap.Map("container", {
				        resizeEnable: true,
				        center: [pub.locationInfo.longitude, pub.locationInfo.latitude],
				        zoom: 15
				    });
				  	var data = JSON.parse(common.allMap.getItem());
        			for (var i in data) {
        				pub.Map.creatMake(map,data[i],i)
        			}
        		}else{
        			if (pub.mapData && !!pub.mapData.longitude) {
			        	var  map = new AMap.Map("container", {
					        resizeEnable: true,
					        center: [pub.mapData.longitude, pub.mapData.latitude],
					        zoom: 15
					    });
			        	var marker = new AMap.Marker({
			        		map:map,
				            icon: "../img/labelmap2.png",
				            position: [pub.mapData.longitude, pub.mapData.latitude],
				            label : { content : pub.mapData.firmName, offset : new AMap.Pixel(-40,-44) },
				        });
				        var marker1 = new AMap.Marker({
				        	map:map,
				            icon: "http://webapi.amap.com/theme/v1.3/markers/n/mark_r.png",
				            position: [pub.locationInfo.longitude, pub.locationInfo.latitude],
				            label : { content : '当前位置', offset : new AMap.Pixel(-40,-44) },
				        });
			        }else{
			        	var  map = new AMap.Map("container", {
					        resizeEnable: true,
					        center: [pub.locationInfo.longitude, pub.locationInfo.latitude],
					        zoom: 15
					    });
					    var marker1 = new AMap.Marker({
				        	map:map,
				            icon: "http://webapi.amap.com/theme/v1.3/markers/n/mark_r.png",
				            position: [pub.locationInfo.longitude, pub.locationInfo.latitude],
				            label : { content : '当前位置1', offset : new AMap.Pixel(-40,-44) }
				       });
			        }
        		}
        	},
        	creatMap:function(){
        		
        	},
        	choice_firm : {
				init : function(){
					common.ajaxPost($.extend({},pub.userBasicParam,{
						method : 'choice_firm',
						firmId : pub.firmIdTemp
					}),function( d ){
						if( d.statusCode == "100000" ){
							
							var user_data = common.user_datafn();
							user_data.firmId = pub.firmIdTemp;
							common.user_data.setItem( common.JSONStr( user_data ) );
							common.firmId.setItem(pub.firmIdTemp);
							common.good.removeItem();
							
							//common.tellRefreshAPP();
							common.jsInteractiveApp({
								name:'tellRefresh'
							});
							//common.setShopCarNumApp(0);
							common.jsInteractiveApp({
								name:'setShopCarNum',
								parameter:{
									num:'0'
								}
							});
							//common.goBackApp(2,true,'index.html');
							common.jsInteractiveApp({
								name:'goBack',
								parameter:{
									num:2,
									type:1,
									url:'index.html'
								}
							})
						}
					})
				}
			},
        	creatMake:function(map,data){
        		new AMap.Marker({
		        	map:map,
		            position: [data.longitude, data.latitude],
		            content : data.firmName,
		            offset : new AMap.Pixel(-40,-44),
		            extData : data
		        }).on("click",function(){
		        	var data = {
						type:1,
						title:'确定选择该门店?',
						canclefn:'cancleFn',
						truefn:'trueFn'
					}
					//common.alertMaskApp(JSON.stringify(data));
					common.jsInteractiveApp({
						name:'alertMask',
						parameter:{
							type:1,
							title:'确定选择该门店',
							canclefn:'cancleFn',
							truefn:'trueFn'
						}
					})
					pub.firmIdTemp = this.getExtData().id;
		        })
		        new AMap.Marker({
		        	map:map,
		            icon: "../img/labelmap2.png",
		            position: [data.longitude, data.latitude],
		        })
        	},
        	//确定方法
			trueFn:function(){
				
				if (pub.logined) {
					pub.Map.choice_firm.init();
				}else{
					//common.tellRefreshAPP();
					common.jsInteractiveApp({
						name:'tellRefresh'
					});
					common.firmId.setItem(pub.firmIdTemp);
					//common.goBackApp(2,true,'index.html');
					common.jsInteractiveApp({
						name:'goBack',
						parameter:{
							num:2,
							type:1,
							url:'index.html'
						}
					})
				}
			},
			//取消方法
			cancleFn:function(){
				pub.firmIdTemp = null;
			},
        }
		pub.init = function(){
			pub.Map.init();
			$("body").fadeIn(300)
		};
	 	pub.init();
	 	window.pub = pub;
	})
});