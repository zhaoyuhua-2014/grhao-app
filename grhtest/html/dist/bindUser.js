

require(['../require/config'],function () {
	require(['common','mobileUi',],function(common){

		// 整体 命名空间 ( 绑定手机号  )
		pub = {};
		
		pub.muduleId = $('[module-id]').attr('module-id');
		
		pub.paramListInit = function(){
			pub.logined = common.isLogin(); // 已经登录
		 	pub.firmIdTemp = null;
	
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
		 	}
			
		};
		// 倒计时
		pub.time = 59;
		/************************绑定手机号***************************/
		pub.bindUser = {
			init:function(){
				var system  = localStorage.getItem('system') ? JSON.parse(localStorage.getItem('system')) : null
				if(system && system.binding_account_tips){
					
				}else{
					pub.bindUser.getSystem()
				}
			},
			getSystem:function(){
				common.ajaxPost({
	 				method:'system_config_constant'
	 			},function( d ){
	 				if(d.statusCode == "100000"){
	 					localStorage.setItem('system',JSON.stringify(d.data))
	 				}
	 			});
			},
			send_sms:{
				init:function(){
					common.ajaxPost($.extend({},pub.userBasicParam,{
						method : 'send_new_mobile',
						mobile : pub.phoneNum
					}),function(d){
						if( d.statusCode == "100000" ){
							common.prompt( '验证码已发送，请查收' );
							$('input[disabled]').removeAttr('disabled');
						}else{
							common.prompt( d.statusStr );
						} 
					},function(d){
		
					});
				}
			},
			
			countDown : function(){
				var id = setInterval(function(){
					if ( pub.time == 0 ) {
						pub.time = 59; // 重置倒计时值
						$(".zs_time").hide();
						$(".zs_get_verify_code").show().html('重新获取');
						clearInterval(id);
						id = null;
					}else{
						$(".zs_time").html("( "+pub.time+"s 后重试 )");
					}
					pub.time--;
				},1000);
			},
			binding_mobile:{
				init:function(){
					common.ajaxPost($.extend({},pub.userBasicParam,{
						method : 'binding_new_mobile',
						mobile : pub.phoneNum,
						smsCode : pub.smsCode
					}),function( d ){
						if (d.statusCode == '100000') {
							pub.bindUser.binding_mobile.apiData( d );
						} else if ( d.statusCode == '100521'){
							
							common.jsInteractiveApp({
								name:'alertMask',
								parameter:{
									type:1,
									title:JSON.parse(localStorage.getItem('system')).binding_account_tips,
									truefn:'pub.bindUser.bind_update_mobile.init()'
								}
							})
						}else{
							common.prompt( d.statusStr )
						}
					});
				},
				apiData:function(){
					
					var backUrl = '';
					if(pub.bindUser.backUrl == 'month_recharge'){
						backUrl = 'html/month_recharge.html?search=recharge'
					}
					if (pub.bindUser.backUrl == 'order_pay') {
						backUrl = 'html/order_pay.html'
					}
					common.user_data.setItem(JSON.stringify($.extend({},common.user_datafn(),{
						mobile:pub.phoneNum
					})));
					common.prompt('添加手机号成功',1000);
					var tid = setTimeout(function(){
						clearTimeout(tid)
						common.jsInteractiveApp({
							name:'goBack',
							parameter:{
								'num':1,
								'type':1,
								'url':backUrl
							}
						})
					},800)
				}
			},
			//当前手机号已经注册过账号时候调用改接口确认绑定手机号
			bind_update_mobile : {
				init:function(){
					common.ajaxPost( $.extend({},pub.userBasicParam,{
						method : 'bind_update_mobile',
						mobile : pub.phoneNum,
					}),function( d ){
						if ( d.statusCode == "100000" ) {
							pub.bindUser.binding_mobile.apiData( d );
						}else{
							common.prompt(d.statusStr);	
						}
					});
				}
			},
			eventHandle:{
				init:function(){
					// 获取验证码
					$('.zs_get_verify_code').on('click',function(){
		
						pub.phoneNum = $(".zs_phoneNumber").val();
						console.log(pub.phoneNum)
						if( pub.phoneNum == '' ){
							common.prompt('请输入手机号'); return;
						}
						if( !common.PHONE_NUMBER_REG.test( pub.phoneNum ) ){
							common.prompt('请输入正确的手机号'); return;
						}
						var userInfo = common.user_datafn();
						if(userInfo.mobile){
							if(userInfo.mobile == pub.phoneNum){
								common.prompt('输入手机号不能当前绑定手机号相同')
								return;
							}
						};
						$(".zs_get_verify_code").hide();
						$(".zs_time").show().html('( 60s 后重试)');
						pub.bindUser.countDown();// 倒计时开始
						pub.bindUser.send_sms.init(); // 请求验证码
						
						
						
					});
					//绑定手机号
					$("#btn_save").on("click",function(){
						pub.phoneNum = $(".zs_phoneNumber").val();
						pub.smsCode = $("#verify_code").val();
						if( pub.phoneNum == '' ){
							common.prompt('请输入手机号'); return;
						}
						if( !common.PHONE_NUMBER_REG.test( pub.phoneNum ) ){
							common.prompt('请输入正确的手机号'); return;
						}
						console.log(pub.smsCode)
						if (pub.smsCode == '') {
							common.prompt("请输入手机验证码");return;
						}
						pub.bindUser.binding_mobile.init();
					})
				}
			}
		};
		
		// 给AAP传数据
		pub.sendToApp = function( userInfo ){
			try{
				common.isAndroid() ? android.saveLoginInfo( userInfo ) : window.webkit.messageHandlers.saveLoginInfo.postMessage(userInfo);
			}catch(e){
				common.prompt('服务异常，请稍后重试 saveLoginInfo');
			}
		};
		//换肤
		pub.apiHandle = {
			change_app_theme : {
				init:function(){
					if (common.huanfu.getItem() && common.huanfu.getItem() != 1) {
						$(".login_main_content,.address_reverse").addClass("skin"+sessionStorage.getItem("huanfu"))
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
			pub.paramListInit(); // 参数初始化
			if (pub.muduleId == "bindUser") {
				pub.bindUser.init();
				pub.bindUser.eventHandle.init();
				pub.bindUser.backUrl = common.getUrlParam("url");
			}
			$("body").fadeIn(300)
		};
	 	pub.init();
	 	window.pub = pub;
	})
});