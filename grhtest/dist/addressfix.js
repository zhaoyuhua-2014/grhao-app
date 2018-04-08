

require(['../require/config'],function () {
	require(['common','mobileUi','LArea','LAreaData'],function(common){
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
	    	init :function(){},
	    	address_update : {
	    		init : function(){
	    			common.ajaxPost($.extend({
	    				method : 'address_update',
	    				addrId : pub.addrFix.addrId
	    			},pub.userBasicParam,pub.addrFix.param),function( d ){
	    				if ( d.statusCode == '100000' ) {
	                        $.removeData($('body')[0],'addressList');
	                        //window.location.replace( !pub.searchAddr ? 'address_management.html' : 'address_management.html?addr=' + pub.searchAddr);
	                        /*common.jumpLinkPlainApp( "地址列表",!pub.searchAddr ?'address_management.html' );*/
	                       common.goBackApp(1,true,!pub.searchAddr ? 'html/address_management.html' : 'html/address_management.html?addr=' + pub.searchAddr)
						} else{
							common.prompt( d.statusStr );
						}
	    			})
	    		}
	    	},
	    	address_add : {
	    		init : function(){
	    			common.ajaxPost($.extend({
	    				method : 'address_add'
	    			},pub.userBasicParam,pub.addrFix.param),function( d ){
	    				if ( d.statusCode == '100000' ) {
	                        $.removeData($('body')[0],'addressList');
	                        //window.location.replace( !pub.searchAddr ? 'address_management.html' : 'address_management.html?addr=' + pub.searchAddr);
							common.goBackApp(1,true,!pub.searchAddr ? 'html/address_management.html' : 'html/address_management.html?addr=' + pub.searchAddr)
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
					
					var 
					areaArr = $('#person_area').val().split(","),
					areaCodeArr = $("#value1").val().split(",");
					
					pub.addrFix.param.consignee = $("#person_name").val(); //用户姓名
					pub.addrFix.param.mobile = $("#person_phone").val(); //手机号
					pub.addrFix.param.street = $("#person_moreAddress").val(), //地址的详细信息
	
					pub.addrFix.param.provinceName = areaArr[0], // 省
					pub.addrFix.param.province = areaCodeArr[0], // 省代码 
	
					pub.addrFix.param.cityName = areaArr[1], // 市
					pub.addrFix.param.city = areaCodeArr[1], // 市代码 
	
					pub.addrFix.param.countyName = areaArr[2], // 区
					pub.addrFix.param.county = areaCodeArr[2]; // 区代码
	
					if( pub.addrFix.param.consignee == '' ){
						common.prompt("请输入用户名"); return;
					}
					if( pub.addrFix.param.mobile == '' || !common.PHONE_NUMBER_REG.test( pub.addrFix.param.mobile ) ){
						common.prompt("请输入正确的手机号"); return;
					}
					if( areaArr.length == 0 ){
						common.prompt("请选择城市"); return;
					}
					if( pub.addrFix.param.street == '' ){
						common.prompt("请输入详细地址"); return;
					}
					pub.bool && pub.addrFix.apiHandle.address_update.init();
					!pub.bool && pub.addrFix.apiHandle.address_add.init();
				});
	
	    	},
	    };
	
	
	    pub.addrFix.init = function(){
	    	if ( pub.bool ) {
	    		var addr = common.JSONparse( common.addressData.getItem() );
	    		pub.addrFix.addrId = addr.id;
				$("#person_name").val( addr.consignee );
				$("#person_phone").val( addr.mobile );
				$("#person_area").val( addr.provinceName + "," + addr.cityName + "," + addr.countyName );
				$("#value1").val( addr.province + "," + addr.city + "," + addr.county );
				$("#person_moreAddress").val( addr.street );
				
				$('.header_title,title').html('编辑收货地址');
			};
			!pub.bool && $('.header_title,title').html('新增收货地址');
	        $.dtd.resolve( LAreaData, 1 );
			pub.addrFix.apiHandle.init();
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
	    };
	    pub.init();
	    window.pub = pub;
	})
})
