

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
		pub.weixinAppId = common.openId.getItem();
		if (pub.weixinAppId) {
			
		}else{
			common.jumpLinkPlainApp("登录","../html/login.html");
		}
		pub.key = null;// 图片验证码编号
		// 倒计时
		pub.time = 59;
		/************************绑定手机号***************************/
		pub.bindUser = {
			init:function(){
				pub.send_sms_type = "5";//5表示动态登录
				pub.bindUser.verification.init();
			},
			send_sms:{
				init:function(){
					common.ajaxPost({
						method : 'send_sms',
						mobile: pub.phoneNum,
						type : pub.send_sms_type,
						key : pub.key,
						authcode : pub.imgCode
					},function(d){
						if( d.statusCode == "100000" ){
							common.prompt( '验证码已发送，请查收' );
							$('input[disabled]').removeAttr('disabled');
						}else{
							common.prompt( d.statusStr );
						} 
					},function(d){
		
					});
				},
				apiData:function(d){
					var o = d.data,html='';
					
				}
			},
			verification : {
				init:function(){
					common.ajaxPost({
						method : 'verification'
					},function( d ){
						if( d.statusCode == '100000' ){
							$('.imgCode_box .img_code').attr( 'src','data:image/jpeg;base64,' + d.data.code );
							pub.key =  d.data.key;
						}else{
							common.prompt( d.statusStr );
						}
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
			weixin_binding_mobile:{
				init:function(){
					common.ajaxPost({
						method : 'weixin_binding_mobile',
						openId : pub.weixinAppId,
						mobile : pub.phoneNum,
						smsCode : pub.smsCode
					},function( d ){
						d.statusCode == "100000" && pub.bindUser.weixin_binding_mobile.apiData( d );
						d.statusCode != "100000" && common.prompt(d.statusStr)
					});
				},
				apiData:function(){
					pub.bindUser.weixin_login.init();
				}
			},
			weixin_login:{
				init:function(){
					common.ajaxPost({
						method:"weixin_login",
						openId:pub.weixinAppId,
						flag:'app',
					},function(d){
						d.statusCode == "100000" && pub.bindUser.weixin_login.apiData( d );
						d.statusCode != "100000" && common.prompt(d.statusStr)
					})
				},
				apiData:function(d){
					var 
					infor = d.data.cuserInfo,
					user_data = {
					    cuserInfoid : infor.id,
					    firmId : infor.firmId,
					    faceImg : infor.faceImg,
					    petName : infor.petName,
					    realName : infor.realName,
					    idCard : infor.idcard,
					    mobile : infor.mobile,
					    sex : infor.sex
					};
					// 给app端传用户信息 分享使用
					common.isApp() && pub.sendToApp( common.JSONStr( d ) ); // 传数据给 APP 端
					common.user_data.setItem( common.JSONStr(user_data) );
					localStorage.setItem('tokenId',d.data.tokenId)
					//common.tokenId.setItem( d.data.tokenId );
					common.secretKey.setItem( d.data.secretKey );
					common.tellRefreshAPP();
					common.goHomeApp();
				}
			},
			eventHandle:{
				init:function(){
					// 获取图片验证码
					$('.imgCode_box .img_code').click(function(){
						pub.bindUser.verification.init();
					});
					// 获取验证码
					$('.zs_get_verify_code').on('click',function(){
		
						pub.phoneNum = $(".zs_phoneNumber").val();
						pub.imgCode = $('#img_code').val();
						console.log(pub.phoneNum)
						if( pub.phoneNum == '' ){
							common.prompt('请输入手机号'); return;
						}
						if( !common.PHONE_NUMBER_REG.test( pub.phoneNum ) ){
							common.prompt('请输入正确的手机号'); return;
						}
						if( pub.imgCode == '' ){
							common.prompt('请输入图片验证码'); return;
						}
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
						pub.bindUser.weixin_binding_mobile.init();
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
						$(".login_main_content,.address_reverse").addClass("skin"+localStorage.getItem("huanfu"))
					}
				}
			}
		}
		// 模块初始化
		pub.init = function(){
			if (!common.huanfu.getKey()) {
				common.change_app_theme();
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
			}
		};
	 	pub.init();
	 	window.pub = pub;
	})
});