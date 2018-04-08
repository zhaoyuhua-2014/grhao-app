

require(['../require/config'],function () {
	require(['common','mobileUi'],function(common){
		/********************************** 地址管理 模块 ******************************* */

	    // 命名空间
	
	    pub = {};
	
	    pub.moduleId = $('[module-id]').attr('module-id') == 'addr';
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
		
		pub.addrId = null; // 地址ID
		pub.defaultBtn = null; // 默认选择按钮
	
	    // 地址列表 接口数据处理命名空间
	    pub.apiHandle = {
	    	init : function(){
	    		var me = this;
	    		me.address_manager.init();
	    	},
	    	address_manager : {
	    		init : function(){
	    			var me = this;
	    			common.ajaxPost($.extend({
	    				method:'address_manager',
	    			}, pub.userBasicParam ),function( d ){
	    				d.statusCode == "100000" && me.apiData( d );
	    			});
	    		},
	    		apiData : function( d ){
	    			var 
	    				data = d.data,
	    			 	html = '';
					for (var i in data) {
						var obj = data[i];
						html += '<div class="contain_address" addr-id="' + obj.id + '" >'
						html += '	<div class="management_address"  >'
						html += '        <div class="management_address_top clearfloat">'
						html += '	         <div class="management_address_name">' + obj.consignee + '</div>'
						html += '	         <div class="management_address_phone">' + obj.mobile + '</div>'
						html += '        </div>'
						html += '       <div class="management_address_bottom">' + obj.provinceName + obj.cityName + obj.countyName + obj.street + '</div>'
					    html += '    </div>'
						html += '	<div class="address_set clearfloat" >'
						
						html += '		<div class="default_address operate ' + ['','','default_bg'][ obj.isDefault+1 ] + '">默认地址</div>'
	
						html += '		<div class="editor_address operate">编辑</div>'
						html += '		<div class="delete_address operate">删除</div>'
						html += '	</div>'
						html += '</div>'
					}
					$(".address_management").append(html);
					$(".add_address").show();
					$.data( $('body')[0],'addressList', d.data );
	    		}
	    	},
	    	address_default : {
	    		init : function(){
	    			common.ajaxPost($.extend({
	    				method:'address_default',
	    				addrId : pub.addrId
	    			},pub.userBasicParam),function( d ){
	    				if ( d.statusCode == "100000" ) {
							$(".default_bg",".address_management").removeClass("default_bg");
							pub.defaultBtn.addClass("default_bg");
						} else{
							common.prompt( d.statusStr )
						}
	    			});
	    		}
	    	},
	    	address_delete : {
	    		init : function(){
	    			common.ajaxPost($.extend({
	    				method : 'address_delete',
	    				addrId : pub.addrId,	
	    			},pub.userBasicParam),function( d ){
	    				if( d.statusCode == "100000" ){
	                       $( '[addr-id="' + pub.addrId + '"]' ).remove();
	                       pub.bool && $('[addr-id]').length == 0 && common.addressData.removeItem();
	                       if (!!common.addType.getItem() && localStorage.getItem("addId") == pub.addrId) {
	                    	if (common.isApp()) {
	                    		if (common.isApple()) {
	                    			try{
		                    			window.webkit.messageHandlers.noticeRefresh.postMessage('');
		                    		}catch(e){
		                    			alert("调用IOS的方法失败")
		                    		}
	                    		}else if (common.isAndroid()) {
	                    			try{
		                    			android.noticeRefresh()
		                    		}catch(e){
		                    			alert("调用Android的方法失败")
		                    		}
	                    		}
	                    	}
	                       }
	                    }
	    			});
	    		}
	    	},
	    	trueFn:function(){
				var arr = $.data($("body")[0],"addressList");
				$(".order_refund").hide();
				$("body").css("overflow-y","auto");
				arr.splice(pub.index,1)
				pub.apiHandle.address_delete.init();  // 删除
	    	}
	    };
	
	    // 事件处理 
	    pub.eventHandle = {
	    	init : function(){
	    		// 选择默认地址
	    		$(".address_management").on('click',".operate",function(){
	
	    			var 
	    			$this = $(this),
	    			isEditor = $this.is('.editor_address'),
	    			isDelete = $this.is('.delete_address'),
	    			isDefault = $this.is('.default_address'),
	    			isCur = $this.is('.default_bg');
	
	    			pub.addrId = $this.parents('.contain_address').attr('addr-id');
	    			// 默认地址选择
	    			if( isDefault && !isCur ){ 
	    				pub.defaultBtn = $this;
	    				pub.apiHandle.address_default.init(); 
	    				return;
	    			} 
	    			// 删除
	    			if( isDelete ){  
	    				pub.index = $this.parents('.contain_address').index();
	    				/*$(".order_refund").show().attr("index",index);
						$("body").css("overflow-y","hidden");
						return;*/
						var data = {
							type:1,
							title:'确认删除?',
							canclefn:'cancleFn',
							truefn:'trueFn'
						}
						common.alertMaskApp(JSON.stringify(data));
						
	    			}
	
	    			if( isEditor ){
	    				var 
	    				index = $this.parents('.contain_address').index(),
	    				addrInfo = common.JSONStr( $.data($('body')[0],'addressList')[index] );
	
						common.addressData.setItem( addrInfo );
						//setTimeout(function(){
							common.jumpLinkPlainApp( "地址列表",!pub.searchAddr ? 'html/address.html' : 'html/address.html?addr=' + pub.searchAddr );
						//},1000)
	    			}
				});
	
				/*
				$(".order_refund").on("click",".makeSure",function(){ // 确认按钮
					var index = $(".order_refund").attr("index"),
					arr = $.data($("body")[0],"addressList");
					$(".order_refund").hide();
					$("body").css("overflow-y","auto");
					arr.splice(index,1)
					pub.apiHandle.address_delete.init();  // 删除
				});*/
	
				/*$(".order_refund").on("click",".refund_cancle",function(){ // 取消按钮
					$(".order_refund").hide();
					$("body").css("overflow-y","auto");
				});*/
				// 点击添加
				/*common.jumpLinkSpecial(".add_address",function(){
					pub.bool && common.addressData.removeItem();
	                !pub.searchAddr ? 'html/address.html' : 'html/address.html?addr=' + pub.searchAddr
				});*/
				$(".add_address").on("click",function(){
					common.addressData.removeItem();
	                //setTimeout(function(){
	                	common.jumpLinkPlainApp( "地址列表",!pub.searchAddr ? 'html/address.html' : 'html/address.html?addr=' + pub.searchAddr );
	                //},1000)
				})
	
				
	
	    		$(".address_management").on('click',".management_address",function(){
	    			var 
	    			index = $(this).parents('.contain_address').index(),
	    			addrInfo = common.JSONStr( $.data($('body')[0],'addressList')[index] ); // 取出数据并存储
					common.addressData.setItem( addrInfo );
	                common.goBackApp(1,true,'html/order_set_charge.html')
				});
	    		!common.addType.getItem() && $('.address_management').off('click','.management_address'); // 判断是否从订单进入
	    	},
	    };
	    
		//换肤
		pub.apiHandle.change_app_theme = {
			init:function(){
				if (common.huanfu.getItem() && common.huanfu.getItem() != 1) {
					$(".add_address").addClass("skin"+localStorage.getItem("huanfu"))
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
			pub.apiHandle.init();
			pub.eventHandle.init();
	    };
	    pub.init();
	    window.pub = pub;
	})
})
