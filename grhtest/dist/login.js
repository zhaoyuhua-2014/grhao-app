/*
* login scirpt for Zhangshuo Guoranhao
*/ 
require(['../require/config'],function(){
	require(['common'],function(common){
		// 命名空间
	
		var pub = {};
		
		pub.openId = common.openId.getItem();
	
		//pub.domain = 'http://weixin.grhao.com';
		pub.domain = 'http://wxapp.grhao.com';
		
		pub.weixinCode = common.getUrlParam('code'); // 获取url参数
	
		pub.openId = common.openId.getKey();
		pub.jumpMake = common.getUrlParam("type");
	
		// 属性
		$.extend(pub,{
			
			phoneNum : null, // 手机号
			
			password : null, // 密码
					
			verify_code : null, // 用户输入验证码值
	
			login_type : null, // 存储登录方式
	
			send_sms_type : null, // 存储登录或注册 验证码类型
	
		});
	
		// 获取验证码类型
		pub.send_sms_type = $('[data-sms-type]').attr('data-sms-type');
	
		pub.key = null;// 图片验证码编号
	
		// 倒计时
		pub.time = 59;
		pub.countDown = function(){
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
		};
	
		// 发送验证码
		pub.send_sms = {
			init : function(){
	
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
			}
		};
	
		// 动态登录 + 账户登录
		pub.login = {};
		// 给AAP传数据
		pub.sendToApp = function( userInfo ){
			try{
				common.isAndroid() ? android.saveLoginInfo( userInfo ) : window.webkit.messageHandlers.saveLoginInfo.postMessage(userInfo);
			}catch(e){
				common.prompt('服务异常，请稍后重试 saveLoginInfo');
			}
		};
	
		pub.get_weixin_code  = function(){
	        common.ajaxPost({
	            method: 'get_weixin_code',
	            weixinCode : pub.weixinCode
	        },function( d ){
	            if( d.statusCode == '100000' && d.data.fromWX == 1 ){
	                pub.openId =  d.data.openId;
	                common.openId.setItem( pub.openId ); // 存opendId
	            }else{
	                common.prompt( d.statusStr );
	            }
	        });
	    };
		
		pub.login.apiHandle = {
			init : function( node ){
				common.ajaxPost( pub.login_type, function( d ){
					if ( d.statusCode == '100000' ) {
						pub.login.apiHandle.apiData( d );
					} else{
						common.prompt(d.statusStr);
					}
					node.removeClass('clicked');
				},function(){
					node.removeClass('clicked');
				});
			},
			apiData : function( d ){
				
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
				common.tellRefreshAPP()
				common.setMyTimeout(function(){
					var 
					bool = common.goodid.getKey(),
					goodsId = bool ? "?goodsId=" + common.goodid.getItem() : '',
					pathNames = [
						"html/moregoods.html",
						"html/seckill.html",
						"html/seckillDetail.html" + goodsId,
						"html/preDetails.html" + goodsId,
						"html/my.html",
						"html/store.html",
						"html/month_service.html",
						"html/cuopon.html",
						"html/goodsDetails.html" + goodsId,
						"html/moregoods.html?type=TAO_CAN",
						"html/moregoods.html?type=JU_HUI",
						"html/seckillDetaila.html" + goodsId,
						"html/cart.html"
					];
					if (common.firmId.getItem() == infor.firmId) {
						if( 0 < pub.jumpMake && pub.jumpMake < 14 ){
							bool && common.goodid.removeItem();
							common.jumpMake.removeItem();
							
							pub.jumpMake  == 3 && common.goBackApp(1,true,'html/seckill.html' ); // 秒杀详情 -> 秒杀换购 列表
							pub.jumpMake  == 4 && common.goBackApp( 1,true,'html/pre.html' ); // 预购详情 -> 预购列表
							pub.jumpMake  == 12 && common.goBackApp( 1,true,'html/seckill.html' ); // 换购详情 -> 秒杀换购 列表
							pub.jumpMake  == 9 && common.goBackApp( 1,true,'html/moregoods.html' ); // 商品详情 -> 商品详情列表
		
							common.goBackApp(  1,true,pathNames[ pub.jumpMake-1 ] );
						}else{
							common.goHomeApp();
						}
					}else{
						bool && common.goodid.removeItem();
						common.goHomeApp();
					}
				},500);
			},
			
		};
		// 图片验证码
		pub.verification = {
			init : function(){
	
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
		};
		/*
		typedef NS_ENUM(NSInteger, UMSocialPlatformErrorType) {
		    UMSocialPlatformErrorType_Unknow            = 2000,            // 未知错误
		    UMSocialPlatformErrorType_NotSupport        = 2001,            // 不支持（url scheme 没配置，或者没有配置-ObjC， 或则SDK版本不支持或则客户端版本不支持）
		    UMSocialPlatformErrorType_AuthorizeFailed   = 2002,            // 授权失败
		    UMSocialPlatformErrorType_ShareFailed       = 2003,            // 分享失败
		    UMSocialPlatformErrorType_RequestForUserProfileFailed = 2004,  // 请求用户信息失败
		    UMSocialPlatformErrorType_ShareDataNil      = 2005,             // 分享内容为空
		    UMSocialPlatformErrorType_ShareDataTypeIllegal = 2006,          // 分享内容不支持
		    UMSocialPlatformErrorType_CheckUrlSchemaFail = 2007,            // schemaurl fail
		    UMSocialPlatformErrorType_NotInstall        = 2008,             // 应用未安装
		    UMSocialPlatformErrorType_Cancel            = 2009,             // 取消操作
		    UMSocialPlatformErrorType_NotNetWork        = 2010,             // 网络异常
		    UMSocialPlatformErrorType_SourceError       = 2011,             // 第三方错误
		
		    UMSocialPlatformErrorType_ProtocolNotOverride = 2013,   // 对应的    UMSocialPlatformProvider的方法没有实现
		    UMSocialPlatformErrorType_NotUsingHttps      = 2014,   // 没有用https的请求,@see UMSocialGlobal isUsingHttpsWhenShareContent
		
		}; * */
		//微信自动登录成功回调函数
		pub.login.apiHandle.trueFn = function(d){
			
			//sessionStorage.setItem("weixinAppId",d);
			//common.jumpLinkPlainApp("绑定账号","../html/bindUser.html");
			var d = JSON.parse(d);
			pub.weixin_login.init(d.openid);
		};
		//微信自动登录失败回调函数
		pub.login.apiHandle.cancleFn = function(d){
			var d = d.toString();
			if(d.indexOf('2000') != '-1'){
				str = '未知错误';
				common.prompt(str);
				return;
			}else if(d.indexOf('2002') != '-1'){
				str = '授权失败';
				common.prompt(str);
				return;
			}else if(d.indexOf('2008') != '-1'){
				str = '应用未安装';
				common.prompt(str);
				return;
			}else if(d.indexOf('2009') != '-1'){
				str = '取消操作';
				common.prompt(str);
				return;
			}else if(d.indexOf('2010') != '-1'){
				str = '网络异常';
				common.prompt(str);
				return;
			}else if(d.indexOf('2011') != '-1'){
				str = '第三方错误';
				common.prompt(str);
				return;
			}else if(d.indexOf('2004') != '-1'){
				str = '请求用户信息失败';
				common.prompt(str);
				return;
			}else{
				str = '服务异常';
				common.prompt(str);
				return;
			}
		};
		//
		
		pub.login.apiHandle.failFn = function(d){
			pub.login.apiHandle.cancleFn(d);
		}
		// 登录事件初始化函数
		pub.login.eventHandle = { 
	
			init : function(){
				// 登录方式切换
				$(".login_main_top li").on("click",function(){
					var 
					$this = $(this),
					i = $this.index(),
					isCur = $this.is('.actived');
					if( !isCur ){
						$this.addClass('actived').siblings().removeClass('actived');
						$('.login_main_content').find('ul').eq(i).addClass('show').show().siblings().removeClass('show').hide();
						i == 1 && pub.onceRun();
					}
				});
	
				// 登录
				$('.login_btn').click(function(){
	
					var 
					box = $('.login_main_content .show'),
					index = box.index(),
					$this = $(this);
					if($this.hasClass('clicked')){
						return;
					}
	
					pub.phoneNum = box.find('.zs_phoneNumber').val();// 获取活动 tab 的手机号
					
					if(!common.PHONE_NUMBER_REG.test( pub.phoneNum )){
						common.prompt('手机号输入错误');return;
					}
	
					if( index == 0 ){
						pub.password = $('#login_password').val();
						if( pub.password == '' ){
							common.prompt('请输入密码'); return;
						}
						pub.login_type = {
							method:'login',
							mobile:pub.phoneNum,
							password : common.pwdEncrypt( pub.password )
						}
					}else{
						pub.verify_code = $('#verify_code').val();
						pub.login_type = {
							method : 'dynamic_login',
							mobile : pub.phoneNum,
							smsCode : pub.verify_code
						}
					}
					$this.addClass('clicked');
					pub.login.apiHandle.init($this);
					
				});
				//微信登录
				$(".quick_login_center").on("click","dl",function(){
					var nood = $(this),
						iswx = nood.is(".login_wx");
					if (iswx) {
						common.wxLoginApp();
					}
				})
				
				//点击跳转注册
				$(".login_regsiter a").on("click",function(){
					common.jumpLinkPlainApp("注册","html/regsiter.html")
				})
				pub.onceRun = common.onceRun( pub.verification.init, pub );
			}
		};
		//使用 openId 自动登录
		pub.weixin_login = {
			init:function(openId){
				common.ajaxPost({
		            method: 'weixin_login',
		            openId : openId,
		            flag:'app',
		       },function( d ){
		            if( d.statusCode == '100000'){
						pub.login.apiHandle.apiData(d);		                
		            }else if(d.statusCode == '100200'){
		        		common.openId.setItem( openId ); // 存opendId
		        		common.jumpLinkPlainApp("绑定注册","html/bindUser.html");
		            }else{
		            	common.prompt( d.statusStr );
		            }
		        });
			},
			apiData:function(){
				
			}
		}
		//* 微信认证 method : weixin_binding
		pub.weixin_binding = {
			init:function(){
				common.ajaxPost({
		            method: 'weixin_binding',
		            openId:openId,
		            userId:userId,
		        },function( d ){
		            if( d.statusCode == '100000' && d.data.fromWX == 1 ){
		                pub.openId =  d.data.openId;
		                common.openId.setItem( pub.openId ); // 存opendId
		            }else{
		                common.prompt( d.statusStr );
		            }
		        });
			},
			apiData:function(){
				
			}
		}
		
		/**
			以下注册模块
		*/
		// 注册 命名空间
	
		pub.register = {};
	
		pub.repeatPassword = null; // 重复密码
	
		// 注册事件处理
		pub.register.eventHandle = {
	
			init : function(){
				$('.regsiter_btn').on('click',function(){
					var $this = $(this);
					if( $this.hasClass('clicked') ){
						return;
					}
					pub.phoneNum = $('#reg_phoneNumber').val();
					pub.verify_code = $('#verify_code').val();
					pub.password = $('#reg_password').val();
					pub.repeatPassword = $('#reg_password_again').val();
					
					if( !common.PHONE_NUMBER_REG.test( pub.phoneNum ) ){
						common.prompt('手机号输入错误'); return;
					}
					if( pub.verify_code == '' ){
						common.prompt('请输入图形验证码'); return;
					}
					if( pub.password == '' ){
					    common.prompt('请输入密码'); return;
					}
					if( !common.PWD_REG.test( pub.password ) ){
					    common.prompt('密码格式不正确'); return;
					}
					if( pub.repeatPassword == '' ){
					    common.prompt('请再次输入密码'); return;
					}
					if(pub.password != pub.repeatPassword ){
						common.prompt('两次密码输入不一致'); return;
					}
					$this.addClass('clicked');
					pub.register.regist.init( $this );
				});
				common.jumpLinkSpecial('.header_left','login.html');
	
				pub.verification.init(); // 获取图片验证码
			},
			
		};
		
	
		// 注册接口
		pub.register.regist = {
	
			init : function( node ){
				var data = {
					method:'regist',
				    mobile:pub.phoneNum,					
				    smsCode:pub.verify_code,
				    pwd:common.pwdEncrypt( pub.password ),
				    confirmPwd:common.pwdEncrypt( pub.repeatPassword )
				};
				common.ajaxPost( data, function( d ){
	
					if ( d.statusCode == '100000' ) {
					    pub.register.regist.apiData( d );					   
				    } else if ( d.statusCode == '100510' ){
					    $('.pop').css({'display':'block'});
						$('.pop_makeSure').on('click',function(){
							$('.pop').css({'display':'none'});
						})					    
				    }else{
				    	common.prompt( d.statusStr );
				    }
				    node.removeClass('clicked');
				},function(){
					node.removeClass('clicked');
				});	
			},
			apiData : function(d){
	
				var data = d.data.cuserInfo,
				user_data = {
				    cuserInfoid : data.id,
				    firmId : data.firmId,
				    faceImg : data.faceImg,
				    petName : data.petName,
				    realName : data.realName,
				    idCard : data.idCard,
				    mobile : data.mobile,
				    sex : data.sex
				};
				common.user_data.setItem( common.JSONStr(user_data) );
				common.tokenId.setItem( d.data.tokenID );
				common.secretKey.setItem( d.data.secretKey );
				$('.regsiter_pack').css({'display':'none'});
				$('.success').css({'display':'block'});
	
				common.isApp() && pub.sendToApp( common.JSONStr( d ) ); // 传数据给 APP 端
	
				var t = 3,time = setInterval(function(){					
					if( t == 0 ){
						clearInterval(time);
						time = null;
						common.tellRefreshAPP();
						common.goHomeApp();
					}else{
						$('.regsiter_time').html( t );					
					}
					t--;
				},1000);
				
			}
		};
	
		pub.eventHandle = {
	
			init : function(){
				// 获取验证码
				$('.zs_get_verify_code').on('click',function(){
	
					pub.phoneNum = $(".show .zs_phoneNumber").val();
					pub.imgCode = $('#img_code').val();
	
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
					pub.countDown();// 倒计时开始
					pub.send_sms.init(); // 请求验证码
				});
				
				$('.imgCode_box .img_code').click(function(){
					pub.verification.init(); // 获取图片验证码
				});
			}
		};
	
		pub.init = function(){
	
			pub.eventHandle.init(); // 公共模块
			
			pub.send_sms_type == '5' && pub.login.eventHandle.init(); // 登录初始化
			
			pub.send_sms_type == '1' && pub.register.eventHandle.init(); // 注册初始化
		};
		pub.init();
		window.pub = pub;
	})
});
