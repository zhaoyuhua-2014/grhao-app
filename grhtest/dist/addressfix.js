

require(['../require/config'],function () {
	require(['common','mobileUi'],function(common){
		// 命名空间
	
	    pub = {};
	
	    // pub.moduleId = $('[module-id]').attr('module-id') == 'addr';
	
	    pub.logined = common.isLogin(); // 是否登录
		
	    if( pub.logined ){
	    	pub.userId = common.user_datafn().cuserInfoid;
	    	pub.source = "userId" + pub.userId;
	    	pub.sign = md5( pub.source + "key" + common.secretKeyfn() ).toUpperCase();
	    	pub.tokenId = common.tokenIdfn();
	    }else{
	        common.goHomeApp();
	    }
	
		pub.bool = common.addressData.getKey(); // addressData 数据存储是否存在
		
		pub.bool1 = common.addObj.getKey();
		
		pub.userBasicParam = {
			userId : pub.userId,
			source : pub.source,
			sign : pub.sign,
			tokenId : pub.tokenId
		};
	
	    pub.searchAddr = common.getUrlParam('addr');
	
	/********************** 地址修改和添加 ***********************/
		// 命名空间
	    pub.addrFix = {};
	    pub.addrFix.addrId = null; // 地址编号
	
	    pub.addrFix.param = {}; // 存用户修改参数
	    pub.addrFix.param.consignee = null; // 姓名
	    pub.addrFix.param.mobile = null; // 手机号
	    pub.addrFix.param.provinceName = null; // 省
	    pub.addrFix.param.province = null; // 省代码
	    pub.addrFix.param.cityName = null; // 市
	    pub.addrFix.param.city = null; // 市代码
	    pub.addrFix.param.countyName = null; // 区
	    pub.addrFix.param.county = null; // 区代码
	    pub.addrFix.param.street = null; // 街道
	
	    // 地址修改 接口数据处理
	    pub.addrFix.apiHandle = {
	    	init :function(addr){
	    		var consignee = addr.consignee || '',//用户名
    			mobile = addr.mobile ||'',//手机号
    			street = addr.street || '',//门牌号
    			
    			provinceName = addr.pname || addr.provinceName || '',//省provinceName
    			cityname = addr.cityname || addr.cityName || '',//市
    			countyName = addr.adname || addr.countyName || '',//县区
    			county = addr.adcode || addr.county || '',//县区编码
    			
    			latitude = (addr.location && addr.location.lat) || addr.latitude || '',//纬度
    			longitude = (addr.location && addr.location.lng) || addr.longitude || '',//经度
    			addName = addr.name || addr.addName || '',//地址的名称
    			address = addr.address || '';//地址的描述
	    		
	    		
	    		
	    		$("#person_name").val( consignee );
	            $("#person_phone").val( mobile );
	            $("#person_moreAddress").val( street );
	            //$("#person_area").val( addr.provinceName + "," + addr.cityName + "," + addr.countyName );
	           	var obj = {
	           		provinceName,
	           		cityname,
	           		countyName,
	           		county,
	           		latitude,
	           		longitude,
	           		address,
	           		addName,
	           	}
	            $("#person_area").data( "data",JSON.stringify(obj));
	            var str = (addName ? "<p class='name'>"+addName+"</p>" : '' ) + (address ?  "<p class='address'>"+address+"</p>" : '')
	            $("#person_area").html( str ? str : '请选择收货地址');
	    	},
	    	address_update : {
	    		init : function(){
	    			common.ajaxPost($.extend({
	    				method : 'address_update_two',
	    				addrId : pub.addrFix.addrId
	    			},pub.userBasicParam,pub.addrFix.param),function( d ){
	    				if ( d.statusCode == '100000' ) {
	                        $.removeData($('body')[0],'addressList');
	                        //window.location.replace( !pub.searchAddr ? 'address_management.html' : 'address_management.html?addr=' + pub.searchAddr);
	                        /*common.jumpLinkPlainApp( "地址列表",!pub.searchAddr ?'address_management.html' );*/
	                    	//common.goBackApp(1,true,!pub.searchAddr ? 'html/address_management.html' : 'html/address_management.html?addr=' + pub.searchAddr)
							common.jsInteractiveApp({
								name:'goBack',
								parameter:{
									'num':1,
									'type':1,
									'url': !pub.searchAddr ? 'html/address_management.html' : 'html/address_management.html?addr=' + pub.searchAddr
								}
							})
	    				} else{
							common.prompt( d.statusStr );
						}
	    			})
	    		}
	    	},
	    	address_add : {
	    		init : function(){
	    			common.ajaxPost($.extend({
	    				method : 'address_add_two'
	    			},pub.userBasicParam,pub.addrFix.param),function( d ){
	    				if ( d.statusCode == '100000' ) {
	                        $.removeData($('body')[0],'addressList');
	                        //window.location.replace( !pub.searchAddr ? 'address_management.html' : 'address_management.html?addr=' + pub.searchAddr);
							//common.goBackApp(1,true,!pub.searchAddr ? 'html/address_management.html' : 'html/address_management.html?addr=' + pub.searchAddr)
							common.jsInteractiveApp({
								name:'goBack',
								parameter:{
									'num':1,
									'type':1,
									'url': !pub.searchAddr ? 'html/address_management.html' : 'html/address_management.html?addr=' + pub.searchAddr
								}
							})
	    				}else{
							common.prompt( d.statusStr )
						}
	    			})
	    		}
	    	}
	    };
	
	    // 地址修改 事件处理
	    pub.addrFix.eventHandle = {
	
	    	init : function(){
	
				//点击返回按钮
				$('#btn_save').click(function(){
					var addr = JSON.parse($('#person_area').data('data'));
					
					
					pub.addrFix.param.consignee = $("#person_name").val(); //用户姓名
					pub.addrFix.param.mobile = $("#person_phone").val(); //手机号
					pub.addrFix.param.street = $("#person_moreAddress").val(), //地址的详细信息
	
					pub.addrFix.param.provinceName = addr.provinceName, // 省
					//pub.addrFix.param.province = areaCodeArr[0], // 省代码 
	
					pub.addrFix.param.cityName = addr.cityname, // 市
					//pub.addrFix.param.city = areaCodeArr[1], // 市代码 
	
					pub.addrFix.param.countyName = addr.countyName, // 区
					pub.addrFix.param.county = addr.county; // 区代码
					
					pub.addrFix.param.latitude = addr.latitude;
					pub.addrFix.param.longitude = addr.longitude
					
					pub.addrFix.param.addName = addr.addName;
					pub.addrFix.param.address = addr.address;
					
					if( pub.addrFix.param.consignee == '' ){
						common.prompt("请输入用户名"); return;
					}
					if( pub.addrFix.param.mobile == '' || !common.PHONE_NUMBER_REG.test( pub.addrFix.param.mobile ) ){
						common.prompt("请输入正确的手机号"); return;
					}
					if( !pub.addrFix.param.addName){
						common.prompt("请选择收货地址"); return;
					}
					if( pub.addrFix.param.street == '' ){
						common.prompt("请输入详细地址"); return;
					}
					var add_api = pub.addrFix.apiHandle;
					pub.bool ? add_api.address_update.init() : add_api.address_add.init();
				});
				
				$("#person_area").on("click",function(){
					/*跳转之前先将本页面的数据存储*/
					//部分地址对象
					var addr = $('#person_area').data('data');
					var consignee = $("#person_name").val(); //用户姓名
					var mobile = $("#person_phone").val(); //手机号
					var street = $("#person_moreAddress").val(); //地址的详细信息
					
					var provinceName = addr.provinceName,//省
		    			cityname = addr.cityname,//市
		    			adname = addr.adname,//县区
		    			adcode = addr.adcode,//县区编码
		    			lat = addr.lat,//纬度
		    			lng = addr.lng,//经度
		    			name = addr.name,//地址的名称
		    			address = addr.address;//地址的描述
		    		
		    		var obj = $.extend({},{
						'consignee':consignee,
						'mobile':mobile,
						'street':street
					},JSON.parse(addr));
					common.addObj.setItem(JSON.stringify(obj))
					common.jsInteractiveApp({
						name:'goToNextLevel',
						parameter:{
							title:'确认收货地址',
							url: !pub.searchAddr ? 'html/addressMap.html' : 'html/addressMap.html?addr=' + pub.searchAddr 
						}
					})
				})
	    	},
	    };
	
	
	    pub.addrFix.init = function(){
	    	
			var addObj = pub.bool1 ? JSON.parse(common.addObj.getItem()) : null;
	        var addr = {};
	        pub.bool ? (function(){
	            addr = common.JSONparse( common.addressData.getItem() );
	            pub.addrFix.addrId = addr.id;
	            
	            $('.header_title,title').html('编辑收货地址');
	        }()) : (function(){
	        	$('.header_title,title').html('新增收货地址');
	        })();
	    	var d = $.extend({}, addr , addObj);
	        //$.dtd.resolve( LAreaData, 1 );
			pub.addrFix.apiHandle.init(d);
			pub.addrFix.eventHandle.init();
	    };
	
		//换肤
		pub.apiHandle = {
			change_app_theme : {
				init:function(){
					if (common.huanfu.getItem() && common.huanfu.getItem() != 1) {
						$(".address_reverse").addClass("skin"+sessionStorage.getItem("huanfu"))
					}
				}
			}
		}
		
	    // 模块初始化
	    pub.init = function(){
	    	if (!common.huanfu.getKey()) {
				common.getChangeSkin();
				common.defHuanfu.done(function(){
					pub.apiHandle.change_app_theme.init();
				})
			}else{
				pub.apiHandle.change_app_theme.init();
			}
	    	pub.addrFix.init();  // 编辑和添加
	    	$("body").fadeIn(300)
	    };
	    pub.init();
	    window.pub = pub;
	})
})
