/*
* personal scirpt for Zhangshuo Guoranhao
*/ 
require(['../require/config'],function(){
	require(['common',"pull"],function(common){
	
		// 命名空间
	
		var pub = {};
		pub.muduleId = $('[module-id]').attr('module-id');
		pub.userBasicParam = null; // 用来保存必要接口参数
		pub.timer_id = null; // 定时器ID
		
		// 是否登录 
		pub.logined = common.isLogin();
	
		if( pub.logined ){
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
		}else{
			pub.muduleId != "0" && common.goHomeApp();
		}
	
		// 父模块接口数据 
		pub.apiHandle = {}
		pub.apiHandle = {
			init : function(){
				// 登录状态 信息处理
				if( pub.logined ){
					var phone = common.user_datafn().mobile.replace( /(\d{3})\d{4}(\d{4})/,"$1****$2")
					$(".user_image").attr( "src",common.user_datafn().faceImg !="" ? common.user_datafn().faceImg + '?rom='+ Math.floor(Math.random()*1000000 ) : "../img/icon_touxiang.png" );
	
					$('.off_line_state').css({'display':'none'});
					$('.user_name').html( common.user_datafn().petName );
					$('.user_phone').html(phone)
					pub.apiHandle.userScoCouMon.init(); // 包月卡余额 + 果币 + 优惠券数量
				}else{
			        $('.off_line_state').css({'display':'block'});
				}
			},
			// 包月卡余额 + 果币 + 优惠券数量
			userScoCouMon : {
				init :function(){
					common.ajaxPost($.extend({},pub.userBasicParam,{
						method : 'userScoCouMon'
					}),function( d ){
						pub.apiHandle.userScoCouMon.apiData( d );
					});
				},
				apiData : function( d ){
					var nodeCard = $("#month_card"),nodeFruit=$("#fruit_money"),nodeCoupon=$('.wo_main_coupon');
					if ( d.statusCode == "100000" ) {
						var data = d.data;
						nodeCard.html("￥"+data.userMonthCard.systemMoney);
						nodeFruit.html(data.userAccountInfo.score+"枚");
						nodeCoupon.html(data.couponCount);
						common.cancelDialogApp();
					}else if(  d.statusCode == "100400" ){
	                        common.prompt( '登录已失效，请重新登陆' );
	                        common.setMyTimeout(function(){
	                            common.jumpLinkPlainApp( '登录','html/login.html' );
	                        },1000);
	                }else{
						nodeCard.html("￥0");
						nodeFruit.html("0枚");
						nodeCoupon.html(0);
					}
				}
			},
			// 退出登录
			logout : {
				init : function(){
					common.ajaxPost({
						method : 'logout',
						tokenId : pub.tokenId
					},function( d ){
						/*通知APP刷新页面*/
						common.tellRefreshAPP();
						/*清除本地购物车数据*/
						common.good.removeItem();
						common.setShopCarNumApp();
						common.setShopCarNum_ShoppingCartApp('0')
						/*移除用户相关信息*/
						common.tokenId.removeItem();
						common.secretKey.removeItem();
						common.user_data.removeItem();
						/*移除门店相关信息*/
						if ( d.statusCode == '100000' ) {}
						var huanfu = common.huanfu.getItem();
							common.session.clear();
							common.huanfu.setItem(huanfu);
						common.jsInteractiveApp({name:'exit1'})
						location.replace( location.href );
					},function( d ){
						common.tellRefreshAPP();
						common.good.removeItem();
						common.setShopCarNumApp();
						common.setShopCarNum_ShoppingCartApp('0')
						common.tokenId.removeItem();
						common.secretKey.removeItem();
						common.user_data.removeItem();
					});
				}
			},
			img_upload:function(data,el){
				$.ajax({
					type:"POST",
					url:common.API,
					dataType:"JSON",
					data:data,
					success:function(d){
						if( d.statusCode == "100000" ){
							var user_data = common.user_datafn();
							user_data.faceImg = d.data.faceImg;
							common.user_data.setItem( common.JSONStr( user_data ) );
							$(el).attr('src',d.data.faceImg+"?rom="+Math.floor(Math.random()*1000000 ))
							pub.apiHandle.updateUserInfo(d);
						}else{
							common.prompt( d.statusCode );
						}
					}
				});
			},
			updateUserInfo:function(d){
				var obj = {
					data:{
						cuserInfo:d.data,
						secretKey:common.secretKey.getItem(),
						tokenId:common.tokenId.getItem(),
						userAccountInfo:'',
						userMonthCard:''
					}
				}
				var data = $.extend({},d, obj);
				
				common.jsInteractiveApp({
					name:'saveLoginInfo',
					parameter:{
						str:common.JSONStr( data )
					}
				});
			}
		};
		
		// 父模块事件处理 
		pub.eventHandle = {};
		pub.eventHandle.init = function(){
	
			//common.jumpLinkSpecialApp('.main_top_right','个人信息修改','html/message_change.html'); // 进入个人信息修改
	
			// 订单管理 + 我的预购 + 优惠券 + 收货地址 + 果币商城 + 在线充值 + 修改密码 + 帮助中心 + 设置
			$('.zs_personal,.main_top_right').click(function(){
				var url = $(this).attr('data-url');
				var tit = $(this).attr("data-title");
				var right = $(this).attr("data-right");
				
				if( pub.logined ){
					common.addressData.removeItem();
					common.addType.removeItem();
					common.orderCode.removeItem();
					localStorage.removeItem("addId");
					if (right) {
						if (right == 'img') {
							var l = window.location.href.substring(0, window.location.href.indexOf("/html/"));
							var imgIcon =  l + '/img/icon_Invalid.png';
							common.jsInteractiveApp({
								name:'jumpLinkCustom',
								parameter:{
									title:tit,
									url:url,
									imgIcon: right == 'img' ? imgIcon : '',//(function(){pub.couponList.apiHandle.jumpLink()})()
									callBackName:right == 'img' ? 'pub.couponList.apiHandle.jumpLink()' : ''
								}
							})
						}
					}else{
						//common.jumpLinkPlainApp( tit,url );
						common.jsInteractiveApp({
							name:'goToNextLevel',
							parameter:{
								title:tit,
								url:url
							}
						})
					}
					
				}else{
					common.jsInteractiveApp({
						name:'goToNextLevel',
						parameter:{
							title:'登录',
							url:'html/login.html?type='+5
						}
					})
					//common.jumpLinkPlainApp('登录','html/login.html?type='+5);
				}
			});
			$(".zs_onlineChat").on("click",function(){
				if( pub.logined ){
					if (common.user_datafn().isRegOpenfire == 1) {
						common.jsInteractiveApp({
							name:'goChat'
						})
					}else{
						pub.iminfo_regist();
					}
				}else{
					common.jsInteractiveApp({
						name:'goToNextLevel',
						parameter:{
							title:'登录',
							url:'html/login.html?type='+5
						}
					})
					//common.jumpLinkPlainApp('登录','html/login.html?type='+5);
				}
			})
			
			$(".off_line_state").on("click",'a',function(){
				var nodeEle = $(this);
					tit = nodeEle.attr("tit"),
					linkUrl = nodeEle.attr("data-url")
				common.jsInteractiveApp({
					name:'goToNextLevel',
					parameter:{
						title:tit,
						url:linkUrl+'?type='+5
					}
				})
			})
			$("#imgIframe").on("load",function(){
				var value = document.getElementById("imgIframe").contentWindow.document.body.innerHTML;
				/*window.top.postMessage('123456', '*');*/
				console.log(1)
			})
			// 点击退出
			$('.exit').on('click',function(){
		    	pub.apiHandle.logout.init();
		   	});
		   	$("#loginPhoto").on("touchstart",function(e){
		   		e.stopPropagation()
		   	})
			$("#loginPhoto").on('change',function(){
				
				var Orientation = null;
				
		    	$("#cuserId").val( pub.userId );
		    	$("#tokenId").val( pub.tokenId );
		    	$("#sign").val( pub.sign );
		    	$("#source").val( pub.source );
				var tar = this,
					files = tar.files,
					fNum = files.length,
					URL = window.URL || window.webkitURL,
					file = files[0];
					if( !file ) return;
					
				require(['exif'],function(){
					EXIF.getData(files[0], function() {  
			            EXIF.getAllTags(this);   
			            Orientation = EXIF.getTag(this, 'Orientation');
			           
						var fr = new FileReader();
						
						
						fr.onload = function () {
			                var result = this.result;
			                var img = new Image();
		                	img.src = result;
							var ll = imgsize(result);
			                //如果图片大小小于200kb，则直接上传
			                if (ll <= 200 *1024) {
			                    img = null;
			                    //$(".loginPhoto").attr("src",result);
			                    
			                    upload(result, Orientation);
			                    return;
			                }
							// 图片加载完毕之后进行压缩，然后上传
			                if (img.complete) {
			                    callback();
			                } else {
			                    img.onload = callback;
			                }
			                function callback() {
			                    var data = compress(img);
			                    //$(".loginPhoto").attr("src",result)
			                    upload(data,Orientation);
			                    img = null;
			                }
			
			            };
			            /*
			            FileReader.readAsArrayBuffer()
						开始读取指定的 Blob中的内容, 一旦完成, result 属性中保存的将是被读取文件的 ArrayBuffer 数据对象.
						FileReader.readAsBinaryString() 
						开始读取指定的Blob中的内容。一旦完成，result属性中将包含所读取文件的原始二进制数据。
						FileReader.readAsDataURL()
						开始读取指定的Blob中的内容。一旦完成，result属性中将包含一个data: URL格式的字符串以表示所读取文件的内容。
						FileReader.readAsText()
						开始读取指定的Blob中的内容。一旦完成，result属性中将包含一个字符串以表示所读取的文件内容。
			            */
		                fr.readAsDataURL(file);
		                //fr.readAsText(file);
		                //fr.readAsArrayBuffer(file)
		                //fr.readAsBinaryString(file)
		                
			        });
				})
			});
			
			function compress(img) {
		        var initSize = img.src.length;
		        var w = img.width;
		        var h = img.height;
				var canvas = document.createElement("canvas");
		        //如果图片大于四百万像素，计算压缩比并将大小压至400万以下
		        var ratio;
		        if ((ratio = w * h / 4000000)>1) {
		            ratio = Math.sqrt(ratio);
		            w /= ratio;
		            h /= ratio;
		        }else {
		            ratio = 1;
		        }
		
		        canvas.width = w;
		        canvas.height = h;
				var ctx = canvas.getContext("2d");
				//        铺底色
		        ctx.fillStyle = "#fff";
		        ctx.fillRect(0, 0, canvas.width, canvas.height);
		
		        //如果图片像素大于100万则使用瓦片绘制
		        var count;
		        var tCanvas = document.createElement("canvas");
		        
		        if ((count = w * h / 1000000) > 1) {
		            count = ~~(Math.sqrt(count)+1); //计算要分成多少块瓦片
		
					//            计算每块瓦片的宽和高
		            var nw = ~~(w / count);
		            var nh = ~~(h / count);
					
					var tctx = tCanvas.getContext('2d')
		            tCanvas.width = nw;
		            tCanvas.height = nh;
		            for (var i = 0; i < count; i++) {
		                for (var j = 0; j < count; j++) {
		                    tctx.drawImage(img, i * nw * ratio, j * nh * ratio, nw * ratio, nh * ratio, 0, 0, nw, nh);
		
		                    ctx.drawImage(tCanvas, i * nw, j * nh, nw, nh);
		                }
		            }
		        } else {
		            ctx.drawImage(img, 0, 0, w, h);
		        }
		
		        //进行最小压缩
		        var ndata = canvas.toDataURL('image/jpeg', 0.1);
		
		        tCanvas.width = tCanvas.height = canvas.width = canvas.height = 0;
		
		        return ndata;
		    };
	        function upload(basestr, Orientation) {
	        
		        var basestr = basestr.split(",")[1];
		        
		       	var formdata = $.extend({},{
					"method":"face_img_upload_two",
		        	"angle":Orientation,
		        	"faceimg":basestr,
				}, pub.userBasicParam);
				
		        pub.apiHandle.img_upload(formdata , ".loginPhoto");
		        
		    };
	        //计算图片文件的大小
			function imgsize(str){
				var str=str.substring(22);
				var equalIndex= str.indexOf('=');
				if(str.indexOf('=')>0){
				    str=str.substring(0, equalIndex);
				}
				var strLength=str.length;
				var fileLength=parseInt(strLength-(strLength/8)*2);
				return fileLength
			}
			function obj2str(o){
			   var r = [];
			   if(typeof o == "string" || o == null) {
			     return o;
			   }
			   if(typeof o == "object"){
			     if(!o.sort){
			       r[0]="{"
			       for(var i in o){
			         r[r.length]=i;
			         r[r.length]=":";
			         r[r.length]=obj2str(o[i]);
			         r[r.length]=",";
			       }
			       r[r.length-1]="}"
			     }else{
			       r[0]="["
			       for(var i =0;i<o.length;i++){
			         r[r.length]=obj2str(o[i]);
			         r[r.length]=",";
			       }
			       r[r.length-1]="]"
			     }
			     return r.join("");
			   }
			   return o.toString();
			}
			/*新添加点击登录事件*/
			if (!pub.logined) {
				$('.main_top_login a').on("click",function(){
					common.jsInteractiveApp({
						name:'goToNextLevel',
						parameter:{
							title:'登录',
							url:'html/login.html?type='+5
						}
					})
					//common.jumpLinkPlainApp('登录','html/login.html?type='+5);
				})
			}
			$(".test").on("click",function(){
				common.jumpLinkPlainApp("测试专用","html/test.html");
			})
			window.addEventListener("message", function(e){
            	console.log(e);
            }, false);
		};
	
	/********************* 用户信息修改模块 *****************/
	
		// 命名空间
	
		pub.userInfoRepaired = {};
		pub.userInfoRepaired.phone = null;  // 用户手机号
		pub.userInfoRepaired.newPhoneNum = null; // 用户新号码
		pub.userInfoRepaired.petName = null; // 用户昵称
		pub.userInfoRepaired.realName = null; // 用户真实姓名
		pub.userInfoRepaired.idCard = null; // 用户身份证号码
		pub.userInfoRepaired.sex = null;  // 性别
		pub.userInfoRepaired.verify_code = null; // 用户输入的验证码
		pub.userInfoRepaired.SEX = {'男':1,'女':2};
		pub.userInfoRepaired.sex_num = null; // 接口数值
	
		// 用户信息修改 事件处理
		pub.userInfoRepaired.eventHandle = {
			init : function(){
				// 点击修改手机号码
				var bool = true;
				$('.message_phoneNumber').click(function(){
					pub.userInfoRepaired.switchInput('更换手机号码','.zs_address_box','.zs_phone_box');
					$('#phone_verify_code2').attr('disabled','disabled').val('');
					$('#phone_phoneNumber').val('');
					$('#phone_verify_code1').show().text('获取手机验证码')
					$('#phone_time').hide().text('');
					clearInterval( pub.timer_id );
					bool && window.history.pushState('','','./message_change.html');
					bool && (bool = false);
				});
				// 性别选择效果
				$('.message_sex').on('click',function(e){
					var cur = e.target.nodeName.toLowerCase() == 'li';
					cur && $('#message_sex').val( $(e.target).text() ); 
					$('.message_sex_choose').slideToggle(300);
				});
				// 点击发送验证码
				$('#phone_verify_code1').on('click',function(){
					pub.userInfoRepaired.time = 59;
					$("#phone_verify_code2").removeAttr("disabled");
					$("#phone_verify_code1").css("display",'none');
					$("#phone_time").css({"display":"block","color":"#f76a10","background":"none"}).html('(60s后重试)');
					pub.userInfoRepaired.apiHandle.send_sms.init();
					pub.userInfoRepaired.countDown(); // 验证码倒计时
				});
				// 提交手机修改信息
				$('.phone_submit').on('click',function(){
					pub.userInfoRepaired.verify_code = $('#phone_verify_code2').val();
					pub.userInfoRepaired.newPhoneNum = $('#phone_phoneNumber').val();
					if( pub.userInfoRepaired.newPhoneNum == "" ){
						common.prompt('请输入手机号'); return;
					}
					if( !common.PHONE_NUMBER_REG.test( pub.userInfoRepaired.newPhoneNum ) ){
						common.prompt('手机号输入有误'); return;
					}
					pub.userInfoRepaired.apiHandle.update_mobile.init(); // 手机号更新
				});
				// 点击保存
				$('.main_reverse').on('click',function(){
				    pub.userInfoRepaired.petName = $('#message_nick').val();
				    pub.userInfoRepaired.realName = $('#message_name').val();
				    pub.userInfoRepaired.idCard = $('#message_IDcard').val();
				    var sex = $('#message_sex').val();
				    pub.userInfoRepaired.sex_num = pub.userInfoRepaired.SEX[sex];
				    if( pub.userInfoRepaired.petName == '' ){
				    	common.prompt('请输入昵称'); return;
				    }
				    if( pub.userInfoRepaired.realName == '' ){
				    	common.prompt('请输入真实姓名'); return;
				    }
				    if( pub.userInfoRepaired.idCard == '' ){
				    	common.prompt( '请填写身份证号' ); return;
				    }
				    if(!common.ID_CARD_REG.test( pub.userInfoRepaired.idCard ) ){ 
				    	common.prompt('身份证号格式不正确'); return;
				    }
				    pub.userInfoRepaired.apiHandle.update_userinfo.init();
				});
				window.onpopstate = function(){
					pub.userInfoRepaired.switchInput('修改信息','.zs_phone_box','.zs_address_box');
				};
			}
		};
		// 用户信息修改 接口数据处理
		pub.userInfoRepaired.apiHandle = {
			init : function(){
				var me = this;
				me.show.init();
			},
		};
		// 用户基本信息展示接口
		pub.userInfoRepaired.apiHandle.show = {
			init : function(){
				var me = this;
				common.ajaxPost($.extend({},pub.userBasicParam,{
					method : 'show',
				}),function( d ){
					d.statusCode == "100000" && me.apiData( d );
				})
			},
			apiData : function( d ){
				var data = d.data;
				pub.userInfoRepaired.phone = data.mobile;
				$('#message_nick').val(data.petName);
			    $('#message_name').val(data.realName);
			    $('#message_IDcard').val(data.idcard).css({'color':'#b2b2b2'});
			   	data.idcard == '' && $('#message_IDcard').removeAttr("disabled");
			   	$('#message_sex').val(['男','女'][data.sex-1]);
			   	$('#message_phoneNumber').val(data.mobile);
			   	$('.phone_now').text('当前手机号：'+ data.mobile);
			}
		};
	
		// 验证码接口数据处理
		pub.userInfoRepaired.apiHandle.send_sms = {
			init : function(){
				common.ajaxPost($.extend({},pub.userBasicParam,{
					method : 'send_sms2',
					mobile : pub.userInfoRepaired.phone,
					type : '4'
				}),function( d ){
					d.statusCode == "100000" && common.prompt("验证码已发送，请查收"); 
					d.statusCode != "100000" && common.prompt( d.statusStr);
				})
			}
		};
	
		// 手机号更新接口接口数据处理
		pub.userInfoRepaired.apiHandle.update_mobile = {
			init : function(){
				common.ajaxPost( $.extend({},pub.userBasicParam,{
					method : 'update_mobile',
					smsCode : pub.userInfoRepaired.verify_code,
					mobile : pub.userInfoRepaired.newPhoneNum
				}),function( d ){
					if ( d.statusCode == "100000" ) {
						var user_data = common.user_datafn();
							user_data.mobile = pub.userInfoRepaired.newPhoneNum;
						common.user_data.setItem(common.JSONStr( user_data ));
						common.prompt('手机号更新成功');
						common.setMyTimeout(function(){
							pub.userInfoRepaired.switchInput('修改信息','.zs_phone_box','.zs_address_box');
						},500);
						$('#message_phoneNumber').val( pub.userInfoRepaired.newPhoneNum );
					}else{
						common.prompt(d.statusStr);	
					}
				});
			}
		};
	
		//  修改用户信息接口数据处理
		pub.userInfoRepaired.apiHandle.update_userinfo = {
			init : function(){
				common.ajaxPost($.extend({},pub.userBasicParam,{
					method : 'update_userinfo',
					petName : pub.userInfoRepaired.petName,
					realName : pub.userInfoRepaired.realName,
					idCard : pub.userInfoRepaired.idCard,
					sex : pub.userInfoRepaired.sex_num
				}),function( d ){
					if ( d.statusCode=="100000" ) {
						var user_data = common.user_datafn();
						user_data.petName = pub.userInfoRepaired.petName;
						user_data.realName = pub.userInfoRepaired.realName;
						user_data.idCard = pub.userInfoRepaired.idCard;
						user_data.sex = pub.userInfoRepaired.sex_num;
						common.user_data.setItem( common.JSONStr( user_data ) );
						common.prompt('修改成功');
						pub.apiHandle.updateUserInfo(d);
						common.setMyTimeout(function(){
							common.jsInteractiveApp({
								name:'goBack',
								parameter:{
									'num':1,
									'type':1,
									'url':'html/my.html'
								}
							})
						},600);
					}
				});
			}
		};
	
		// 个人用户信息 模块初始化 二级模块
		pub.userInfoRepaired.init = function(){
			pub.userInfoRepaired.apiHandle.init();
			pub.userInfoRepaired.eventHandle.init();
		};
	
		// 验证码倒计时
		pub.userInfoRepaired.countDown = function(){
			pub.timer_id = setInterval(function(){
				if ( pub.userInfoRepaired.time == 0 ) {
					$("#phone_time").css("display","none");
					$("#phone_verify_code1").css("display","block").html('重新获取')
					clearInterval( id );
					pub.userInfoRepaired.time = 59;
				}else{
					$("#phone_time").html("( " + pub.userInfoRepaired.time + " s后可重试 )");
				}
				pub.userInfoRepaired.time--;
			},1000);
		};
	
		// 切换 更新手机号 修改用户信息
		pub.userInfoRepaired.switchInput = function( title, node1, node2, tit ){
			tit = tit || title;
			$('.header_title').html( tit );
			document.title = title;
			$( node1 ).fadeOut(100,function(){
				$( node2 ).fadeIn(200);
			});
		};
	
		/************************* 优惠券管理模块 ***************************/
	
		// 优惠券 命名空间
		pub.coupon = {};
		pub.coupon.code = "YHQ-DESC";
	
		pub.PAGE_SIZE = common.PAGE_SIZE; // 每页显示几条
		pub.PAGE_INDEX = common.PAGE_INDEX; // 第几页
		pub.COUPON_TYPES = ['来源:好友推荐赠送','来源:微博晒单成功赠送','来源:微信晒单成功赠送','来源:订单促销活动赠送','来源:随意赠送'];
		pub.CUOPON_RECEIVE_STATUS = ['立即领取','已领取'];
		pub.coupon.sortCouponId = null;
	
		// 优惠券 接口命名空间
		pub.coupon.apiHandle = {
			init : function(){
				pub.coupon.apiHandle.couponInfo_manager.init(); // 优惠券 管理 列表
			},
			// 优惠券信息列表
			couponInfo_manager : {
				init : function(){
					common.ajaxPost($.extend({},pub.userBasicParam,{
						method : 'couponInfo_manager',
		    	    	pageNo : pub.PAGE_INDEX,
		    	    	pageSize : pub.PAGE_SIZE
					}),function( d ){
						pub.coupon.apiHandle.couponInfo_manager.apiData( d );
					})
				},
				apiData : function( d ){
					var 
					html = '',
					data = d.data,
					isLast = data.lastPage;
					$('.lodemore').html( isLast ? '没有更多数据了' : '点击加载更多数据' ).show();
				    if( data.list == 0 ){ $('.lodemore').html('没有更多数据了').show(); }
					if (data.totalCount == 0 ) { $('.lodemore').html('暂无优惠卷').show(); return}
					for(var i in data.list){
						var lst = data.list[i];
						html += '<div class="cuopon_management_content clearfloat cuopon_status1' + lst.status + '">'
						html += '		<div class="cuopon_management_content_left">' + lst.couponMoney + '元</div>'            
						html += ' 	    <div class="cuopon_management_content_right">'
						html += '			<div class="cuopon_management_title">' + lst.couponName + '</div>'
						html += '			<ul class="cuopon_management_message">'
						html += '				<li>有效期至:' + lst.endTime + '</li>'
						html += '				<li>金额要求:订单金额满' + lst.leastOrderMoney + '元可用</li>'
						if( 0 < lst.howGet && lst.howGet < 6){
							html += '			<li>' + pub.COUPON_TYPES[lst.howGet-1] + '</li>'
						}else{
							html += '			<li>来源:自助领取</li>'
						}          		
						html += '			</ul>'
						html += '		</div>'
						html += '</div>'           		
					};
					/*2018-02-06 优惠卷点击下一页覆盖问题*/
					if (data.pageNo == "1") {
						$('.cuopon_management_contain').html( html );
					} else{
						$(".cuopon_management_contain").append(html)
					}
				}
			},
			// 优惠券使用说明请求
			grh_desc : {
	
				init : function( code, callback){
					common.ajaxPost({
						method : 'grh_desc',
	    				code : code 
					},function( d ){
						callback( d );
					})
				},
				apiData : function( d ){
					if( d.statusCode == "100000" ){
						var data = d.data;
	    				var str = data.desc;
						$('.alert_title').html( data.title );
						$('.alert_content').html( str.replace(/\r\n/g, "<br />") );
	    			}else{
	    				common.prompt( d.strStatus );
	    			}
				}
			},
			// 优惠券列表
			get_sort_coupon : {
				init : function(){
					common.ajaxPost({
						method : 'get_sort_coupon',
	   	    			userId : pub.userId
					},function( d ){
						pub.coupon.apiHandle.get_sort_coupon.apiData( d );	
					})
				},
				apiData : function( d ){
					if ( d.statusCode == "100000" ) {
	   	    			pub.coupon.apiHandle.get_sort_coupon.apiDataDeal( d );	
	   	    		}else{
	   	    			common.prompt( d.statusStr );
	   	    		}
				},
				apiDataDeal : function( d ){
			    	var html = '', i = 0;
			    	if (!d.data.length) {
			    		console.log(d.data.length)
			    		$(".zs-coupon-box .cuopon_contain").html("<p>暂无在线优惠卷可以领取。</p>");
			    		$(".cuopon_contain p").css({"text-align":"center",'line-height':'300px',"font-size":'30px'})
			    		return
			    	}
			    	for( i in d.data ){
			    		var list = d.data[i];
			    		html += '<div class="cuopon_content clearfloat">'
			    		html += '<div class="cuopon_content_center">'
			    		html += '<div class="cuopon_title">' + list.sortName + '</div>'
			    		html += '<ul class="cuopon_message">'
			    		html += '<li>有效期至：' + list.endTime + '</li>'
			    		html += '<li>金额要求：单笔订单满' + list.leastOrderMoney + '元</li>'
			    		html += '</ul>'
			    		html += '</div>'
			    		html += '<div class="cuopon_content_right" dataId="' + list.id + '">'
			    		html += '<div class="cuopon_money">' + list.sortMoney + '元</div>'
			    		html += '<div class="cuopon_receive cuopon_receive' + list.flag + '">' + pub.CUOPON_RECEIVE_STATUS[ list.flag ] + '</div>' 
			    		html += '</div>'
			    		html += '</div>'
			    	};
			    	$('.cuopon_contain').append(html);
			    	$('.cuopon_receive1').css({ 'color':'rgb(51,51,51)', 'border':'none' });
				}
			},
			// 领取优惠券
			goto_coupon : {
				init : function(){
					common.ajaxPost($.extend({},pub.userBasicParam,{
						method : 'goto_coupon',
	   	    			sortCouponId : pub.coupon.sortCouponId
					}),function( d ){
						if( d.statusCode == "100000" ){
		   	    			$('.cuopon_receive0').css({'color':'rgb(51,51,51)','border':'none'}).html('已领取');
		   	    			$('.pop').find('.pop_prompt').html('优惠券领取成功');
		   	    			pub.coupon.get_sort_coupon.init(); // 优惠券列表
		    				pub.coupon.sortCouponId = null;
		   	    		}
					},function( d ){
						$('.pop').find('.pop_prompt').html('优惠券领取失败');
					});
				}
			}
		};
	
		// 优惠券 事件命名空间
		pub.coupon.eventHandle = {
			init : function(){
		    	// 点击加载更多
		    	$('.lodemore').on('click',function(){				
					if ( $(this).html() != '没有更多数据了' ) {
						pub.PAGE_INDEX++;
						pub.coupon.apiHandle.couponInfo_manager.init();
					}else{
						$(this).off('click');
					}				
				});
				// 使用规则的弹出 和 隐藏
	    		common.alertShow('.cuopon_management_top_right',function(){
	    			pub.coupon.apiHandle.grh_desc.init(pub.coupon.code,pub.coupon.apiHandle.grh_desc.apiData);
	    		});
	    		common.alertHide();
	    		// 优惠券管理 优惠券列表 切换
	    		var bool = true;
	    		$('.cuopon_management_top_left').click(function(){
	    			pub.userInfoRepaired.switchInput.call(pub.coupon,'优惠券','.zs-couponManager-box','.zs-coupon-box','在线获取优惠券');
	    			bool && pub.coupon.apiHandle.get_sort_coupon.init();
	    			bool && window.history.pushState('','','./cuopon_management.html');
	    			bool && ( bool = false );
	    		});
	    		$('.header_left').click(function(){
					var isShow = $('.zs-coupon-box').is(':visible');
					!isShow && common.jumpLinkPlain('my.html');
					isShow && pub.userInfoRepaired.switchInput.call(pub.coupon,'优惠券管理','.zs-coupon-box','.zs-couponManager-box');
				});
				window.onpopstate = function(){
					pub.userInfoRepaired.switchInput.call(pub.coupon,'优惠券管理','.zs-coupon-box','.zs-couponManager-box');
					$('.pop').hide();
				}
	
				//点击立即领取
			    $('.cuopon_contain').on('click','.cuopon_receive0',function(){
			    	var $this = $(this);
			    		pub.coupon.sortCouponId = $this.parent().attr('dataId');
			    	if ( pub.logined ) { // 判断是否登录
			    		if( $this.html() === '立即领取' ){
				    		$('.pop').css({'display':'block'});
				    		$("body").css("overflow-y","hidden");
				    		pub.coupon.apiHandle.goto_coupon.init();	
				    	}
			    	} else{
			    		common.jumpMake.setItem( "8" );
			    		common.jsInteractiveApp({
							name:'goToNextLevel',
							parameter:{
								title:'登录',
								url:"html/login.html"
							}
						})
			    	}
			    });
	
			    //点击弹出框确定
			    $('.pop_makeSure').on('click',function(){
			        $("body").css("overflow-y","auto");
			        $('.pop').css('display','none');
				}); 
				//点击遮罩层
			    $('.pop_bg').on('click',function(){
			    	$('.pop').css('display','none');
			    	$("body").css("overflow-y","auto");
			    });
			}
		};
	
		pub.coupon.init = function(){
			pub.coupon.apiHandle.init();
			pub.coupon.eventHandle.init();
		}
		
	/****************************  果币模块  ************************/
	
		// 命名空间
	
		pub.fruitCoins = {};
	
		// 果币 事件命名空间
		pub.fruitCoins.apiHandle = {
			init : function(){
				var me = this;
				me.user_score.init();
			},
			user_score : {
				init : function(){
					common.ajaxPost($.extend({},pub.userBasicParam,{
						method:'user_score'
					}),function( d ){
						if ( d.statusCode == "100000" ) {
							$(".fruitMall_wrap_top_left span").html( d.data.score );
						}else{
							$(".fruitMall_wrap_top_left span").html("0");
						}
					});
				}
			}
		};
	
		// 果币 事件命名空间
		pub.fruitCoins.eventHandle = {
			init : function(){
				$('.fruitMall_wrap_content').on("click","div",function(){
					var url = $(this).attr("data-url"),
					title = $(this).attr("data-title");
					common.jsInteractiveApp({
						name:'goToNextLevel',
						parameter:{
							title:title,
							url:url
						}
					})
				})
			},
		};
		// 果币模块初始化
		pub.fruitCoins.init = function(){
			pub.fruitCoins.apiHandle.init();
			pub.fruitCoins.eventHandle.init();
		};
	
	/****************************  修改密码模块  ************************/
	
		// 命名空间
		pub.passwordFix = {};
		pub.passwordFix.oldPwd = null; // 原密码
		pub.passwordFix.newPwd = null; // 新密码
		pub.passwordFix.confirmPwd = null; // 确认密码
		pub.passwordFix.bool = false;
		// 修改密码 接口处理
		pub.passwordFix.apiHandle = {
			init : function(){
	
			},
			update_pwd : {
				init : function(){
					common.ajaxPost($.extend({},pub.userBasicParam,{
						method : 'update_pwd',
						pwd : common.pwdEncrypt( pub.passwordFix.oldPwd ),
						newPwd : common.pwdEncrypt( pub.passwordFix.newPwd ),
						confirmPwd : common.pwdEncrypt( pub.passwordFix.confirmPwd )
					}),function( d ){
						if ( d.statusCode == '100000' ) {
					    	common.prompt( '修改成功' );
					    	common.setMyTimeout(function(){
					    		common.jsInteractiveApp({
									name:'goBack',
									parameter:{
										'num':1,
										'type':1,
										'url':'html/my.html'
									}
								})
					    	},500);
					    } else if ( d.statusCode == '100503' ){						    
						   common.prompt( '原密码错误' );
					    }else{
					    	common.prompt( d.statusStr );
					    }
						pub.passwordFix.bool = false;
					},function( d ){
						common.prompt( d.statusStr );
						pub.passwordFix.bool = false;
					});
				}
			}
		};
	
		// 修改密码事件处理
		pub.passwordFix.eventHandle = {
			init : function(){
				common.jumpLinkSpecial('.header_left','my.html'); // 返回上一页
				$('.pwd_change_reverse').on('click',function(){
				 	pub.passwordFix.oldPwd = $('.old_pwd input').val(), // 用户输入的旧密码
				    pub.passwordFix.newPwd = $('.new_pwd input').val(), // 用户输入的新密码
				    pub.passwordFix.confirmPwd = $('.confirm_pwd input').val(); // 再次确认新密码
					if( pub.passwordFix.oldPwd == '' ){
						common.prompt('请输入原始密码'); return;
					}
					if( pub.passwordFix.newPwd == '' ){
						common.prompt( '请输入新密码' ); return;
					}
					if(!common.PWD_REG.test( pub.passwordFix.newPwd )){
					    common.prompt('密码格式不正确'); return;				
					}
					if( pub.passwordFix.confirmPwd == '' ){
						common.prompt('请输入确认密码'); return;	  
				    }
				    if( pub.passwordFix.oldPwd == pub.passwordFix.newPwd ){
						common.prompt('新密码与原密码一样'); return;
					}
					if( pub.passwordFix.confirmPwd != pub.passwordFix.newPwd ){	
						common.prompt('确认密码与新密码不一致'); return;
					}
					if( pub.passwordFix.bool ){
						return;
					}
					pub.passwordFix.bool = true;
					pub.passwordFix.apiHandle.update_pwd.init();
				});
			},
		};
	
		// 修改模块密码初始化
		pub.passwordFix.init = function(){
			pub.passwordFix.apiHandle.init();
			pub.passwordFix.eventHandle.init();
		};
	
		/********************** 帮助模块 ***********************/
	
		// 命名空间
		pub.help = {};
		pub.help.code = null; // 保存 code 
		pub.help.urlParam = null; // url 参数
		pub.help.item = { // 请求的页面和对应的 code 值
			'contact':['LXFS-DESC','联系方式'],
			'pre_deal':['YGGX-DESC','预购协议'],
			'relevent':['THH-DESC','退换货规则'],
			'couponUse_rule':['YHQ-DESC','优惠券使用规则'],
			'inspection':['YHQS-DESC','验货与签收'],
			'about_us':['GUWM-DESC','关于我们']	
		}
		// 帮助模块 接口数据处理 初始化
		pub.help.apiHandle = {
			apiData : function( d ){
				if ( d.statusCode == '100000' ) {
						var html = '',
						data = d.data;
						html += '<div class="orderDeal">'
						html += '   <div class="orderDeal_title">' + data.title + '</div>'
						html += '   <ul class="orderDeal_content" style="font-size: 26px;line-height: 40px;"></ul>'
						html += '</div>'
						$('.main').append(html);
						var str = data.desc;
						$('.orderDeal_content').html( str.replace(/\r\n/g, "<br>") );
				}else{
					common.prompt( d.strStatus )
				}
			}
		};
	
		// 帮助模块 事件处理 初始化
		pub.help.eventHandle = {
			init : function(){
				pub.help.urlParam = common.getUrlParam('help'); // 接收url参数
				if( !!pub.help.urlParam ){
					pub.help.code = pub.help.item[ pub.help.urlParam ][0];
					$('.header_title,title').html( pub.help.item[ pub.help.urlParam ][1] );
					pub.coupon.apiHandle.grh_desc.init( pub.help.code, pub.help.apiHandle.apiData);
				}else{
					$(".help_wrap").on("click",'li',function(){
						var url = $(this).attr("data-url"),
						title = $(this).attr("data-title");
						common.jsInteractiveApp({
							name:'goToNextLevel',
							parameter:{
								title:title,
								url:url
							}
						})
					})
					$(".help_content").on("click",".help_chat",function(){
						if (common.user_datafn().isRegOpenfire == 1) {
							common.jsInteractiveApp({
								name:'goChat'
							})
						}else{
							pub.iminfo_regist();
						}
					})
				}
				
			},
		};
		// 帮助模块初始化
		pub.help.init = function(){
			pub.help.eventHandle.init();
		};
		
		pub.iminfo_regist=function(){
			common.ajaxPost({
	            method:'iminfo_regist',
	            userId:pub.userId
	        },function( d ){
	            if( d.statusCode == '100000' ){
	            	var v = d.data;
	            	var user_data = {
					    cuserInfoid : v.id,
					    firmId : v.firmId,
					    faceImg : v.faceImg,
					    petName : v.petName,
					    realName : v.realName,
					    idCard : v.idCard,
					    mobile : v.mobile,
					    sex : v.sex,
					    isRegOpenfire:v.isRegOpenfire
					};
					common.user_data.setItem( common.JSONStr(user_data) );
					if (common.user_datafn().isRegOpenfire != 1) {
						common.prompt( "网络异常，请点击重试");
					}else{
						pub.apiHandle.updateUserInfo(d);
						common.jsInteractiveApp({
							name:'goChat'
						})
					}
	            }else{
	                common.prompt( "网络异常，请点击重试");
	            };
	        });
		};
		
		/********************** 设置模块 ***********************/
	
		// 命名空间
		pub.settings = {};
	
		// 设置模块事件处理 命名空间
		pub.settings.eventHandle = {
			init : function(){
				var bool = true;
		       	$('.about_us').click(function(){
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
				
			},
		};
		// 设置模块接口 数据处理 命名空间
		pub.settings.apiHandle = {
			init : function(){
				if (localStorage.getItem('version')) {
					$('.my_set_middle_right').html(localStorage.getItem('version'))
				}
			},
			apiData : function( d ){
				if ( d.statusCode == '100000' ) {
						var html = '';
						$('.main','.zs-setting-aboutus').html('');
						data = d.data;
						html += '<div class="orderDeal">'
						html += '   <div class="orderDeal_title">' + data.title + '</div>'
						html += '   <ul class="orderDeal_content" style="font-size: 26px;line-height: 40px;"></ul>'
						html += '</div>'
						$('.main','.zs-setting-aboutus').append(html);
						var str = data.desc;
						$('.orderDeal_content','.zs-setting-aboutus').html( str.replace(/\r\n/g, "<br>") );
				}else{
					common.prompt( d.strStatus )
				}
			}
		};
	
		// 设置模块初始化
		pub.settings.init = function(){
	
			if( common.isApp() ){
				$('#app-clear-cache,#app-share','.zs-setting-box').show().on('click',function(){
					var isShare = $(this).is('#app-share');
					
					common.jsInteractiveApp({
						name: isShare ? 'share':'clearCache'
					})
				});
			}
			pub.settings.eventHandle.init();
			pub.settings.apiHandle.init();
		};	
		
		/************************* 新改版优惠券模块2018-06-22 ***************************/
	
		// 优惠券 命名空间
		pub.couponList = {};
		var COUPON_LIST = pub.couponList;
		COUPON_LIST.code = "YHQ-DESC";
	
		pub.PAGE_SIZE = common.PAGE_SIZE; // 每页显示几条
		pub.PAGE_INDEX = common.PAGE_INDEX; // 第几页
		pub.COUPON_TYPES = ['来源:好友推荐赠送','来源:微博晒单成功赠送','来源:微信晒单成功赠送','来源:订单促销活动赠送','来源:随意赠送'];
		pub.CUOPON_RECEIVE_STATUS = ['立即领取','已领取'];
		COUPON_LIST.sortCouponId = null;
		// 优惠券 接口命名空间
		COUPON_LIST.apiHandle = {
			init : function(){
				COUPON_LIST.apiHandle.valid_coupon.init(); // 优惠券 管理 列表
			},
			// 优惠券信息列表
			valid_coupon : {
				init : function(){
					common.ajaxPost($.extend({},pub.userBasicParam,{
						method : 'valid_coupon',
		    	    	pageNo : pub.PAGE_INDEX,
		    	    	pageSize : pub.PAGE_SIZE
					}),function( d ){
						COUPON_LIST.apiHandle.valid_coupon.apiData( d );
					})
				},
				apiData : function( d ){
					var 
					html = '',
					data = d.data,
					isLast = data.isLast,
					couponList = data.objects;
					$('.lodemore').html( isLast ? '没有更多数据了' : '点击加载更多数据' ).show()
				    if( couponList.length == 0 ){ $('.lodemore').html('没有更多数据了').show();  }
					if (d.data.pageNo == 1 && couponList.length == 0 ) { $('.lodemore').html('暂无优惠卷').show(); return}
					for(var i in couponList){
						var lst = couponList[i];
						html += '<div class="coupon_list_item">'
						html += '	<div class="coupon_list_item_top clearfloat">'
						html += '		<div class="float_left">'
						html += '			<p>'+lst.couponName+'</p><p>有效期至：'+lst.endTime+'</p>'
						html += '		</div>'
						html += '		<div class="float_right"><div class="coupon_btn">去使用</div></div>'
						html += '	</div>'
						html += '	<div class="coupon_list_item_bg"><img src="../img/coupon_bg.png"></div>'
						html += '	<div class="coupon_list_item_bottom">'
						html += '		<p>'+lst.applyTo+'</p>'
						html += '	</div>'
						html += '</div>'
					};
					$('.cuopon_management_contain').append( html );
				}
			},
			// 优惠券使用说明请求
			grh_desc : {
				init : function( code, callback){
					common.ajaxPost({
						method : 'grh_desc',
	    				code : code 
					},function( d ){
						callback( d );
					})
				},
				apiData : function( d ){
					if( d.statusCode == "100000" ){
						var data = d.data;
	    				var str = data.desc;
						$('.alert_title').html( data.title );
						$('.alert_content').html( str.replace(/\r\n/g, "<br />") );
	    			}else{
	    				common.prompt( d.statusStr );
	    			}
				}
			},
			// 优惠券列表
			get_sort_coupon : {
				init : function(){
					common.ajaxPost({
						method : 'get_sort_coupon',
	   	    			userId : pub.userId
					},function( d ){
						COUPON_LIST.apiHandle.get_sort_coupon.apiData( d );	
					})
				},
				apiData : function( d ){
					d.statusCode == "100000" ? COUPON_LIST.apiHandle.get_sort_coupon.apiDataDeal( d ) : common.prompt( d.statusStr );
				},
				apiDataDeal : function( d ){
			    	var html = '', i = 0;
			    	if (!d.data.length) {
			    		console.log(d.data.length)
			    		$(".zs-coupon-box .cuopon_contain").html("<p>暂无在线优惠卷可以领取。</p>");
			    		$(".cuopon_contain p").css({"text-align":"center",'line-height':'300px',"font-size":'30px'})
			    		return
			    	}
			    	for( i in d.data ){
			    		var list = d.data[i];
			    		html += '<div class="cuopon_content clearfloat">'
			    		html += '<div class="cuopon_content_center">'
			    		html += '<div class="cuopon_title">' + list.sortName + '</div>'
			    		html += '<ul class="cuopon_message">'
			    		html += '<li>有效期至：' + list.endTime + '</li>'
			    		html += '<li>金额要求：单笔订单满' + list.leastOrderMoney + '元</li>'
			    		html += '</ul>'
			    		html += '</div>'
			    		html += '<div class="cuopon_content_right" dataId="' + list.id + '">'
			    		html += '<div class="cuopon_money">' + list.sortMoney + '元</div>'
			    		html += '<div class="cuopon_receive cuopon_receive' + list.flag + '">' + pub.CUOPON_RECEIVE_STATUS[ list.flag ] + '</div>' 
			    		html += '</div>'
			    		html += '</div>'
			    	};
			    	$('.cuopon_contain').html(html);
			    	$('.cuopon_receive1').css({ 'color':'rgb(51,51,51)', 'border':'none' });
				}
			},
			// 领取优惠券
			goto_coupon : {
				init : function(){
					common.ajaxPost($.extend({},pub.userBasicParam,{
						method : 'goto_coupon',
	   	    			sortCouponId : COUPON_LIST.sortCouponId
					}),function( d ){
						if( d.statusCode == "100000" ){
		   	    			$('.cuopon_receive0').css({'color':'rgb(51,51,51)','border':'none'}).html('已领取');
		   	    			$('.pop').find('.pop_prompt').html('优惠券领取成功');
		   	    			COUPON_LIST.apiHandle.get_sort_coupon.init(); // 优惠券列表
		    				COUPON_LIST.sortCouponId = null;
		   	    		}
					},function( d ){
						$('.pop').find('.pop_prompt').html('优惠券领取失败');
					});
				}
			},
			jumpLink :function(){
				common.jumpLinkCustomApp({
					title:'失效劵',
					url:'html/couponListInvalid.html'
				})
			}
		};
	
		// 优惠券 事件命名空间
		COUPON_LIST.eventHandle = {
			init : function(){
				// 点击跳转到首页
			    $('.cuopon_management_contain').on('click','.coupon_btn',function(){
			    	common.goHomeApp();
			    });
		    	// 点击加载更多
		    	$('.lodemore').on('click',function(){				
					if ( $(this).html() != '没有更多数据了' ) {
						pub.PAGE_INDEX++;
						COUPON_LIST.apiHandle.valid_coupon.init();
					}else{
						$(this).off('click');
					}				
				});
				// 使用规则的弹出 和 隐藏
	    		common.alertShow('.cuopon_management_top_right',function(){
	    			COUPON_LIST.apiHandle.grh_desc.init(COUPON_LIST.code,COUPON_LIST.apiHandle.grh_desc.apiData);
	    		});
	    		common.alertHide();
	    		// 优惠券管理 优惠券列表 切换
	    		var bool = true;
	    		$('.cuopon_management_top_left').click(function(){
	    			pub.userInfoRepaired.switchInput.call(COUPON_LIST,'优惠券','.zs-couponManager-box','.zs-coupon-box','在线获取优惠券');
	    			bool && (function(){
	    				COUPON_LIST.apiHandle.get_sort_coupon.init();
	    				bool = false;
	    			}());
	    		});
	    		$('.header_left').click(function(){
	    			console.log($('.zs-coupon-box').is(':visible'))
					$('.zs-coupon-box').is(':visible') ? pub.userInfoRepaired.switchInput.call(COUPON_LIST,'优惠券管理','.zs-coupon-box','.zs-couponManager-box') : window.history.back();
				});
				$(".header_right").on("click",function(){
					var url = $(this).attr('data-url');
					common.jumpLinkPlain( url );
				})
			}
		};
	
		COUPON_LIST.init = function(){
			COUPON_LIST.apiHandle.init();
			COUPON_LIST.eventHandle.init();
		}
		
	/************************* 新改版失效优惠券模块2018-06-22 ***************************/
	
		// 优惠券 命名空间
		pub.couponListInvalid = {};
		var COUPON_LIST_INVALID = pub.couponListInvalid;
	
		// 优惠券 接口命名空间
		COUPON_LIST_INVALID.apiHandle = {
			init : function(){
				COUPON_LIST_INVALID.apiHandle.invalid_coupon.init(); // 优惠券 管理 列表
			},
			// 优惠券信息列表
			invalid_coupon : {
				init : function(){
					common.ajaxPost($.extend({},pub.userBasicParam,{
						method : 'invalid_coupon',
		    	    	pageNo : pub.PAGE_INDEX,
		    	    	pageSize : pub.PAGE_SIZE
					}),function( d ){
						COUPON_LIST_INVALID.apiHandle.invalid_coupon.apiData( d );
					})
				},
				apiData : function( d ){
					var 
					html = '',
					data = d.data,
					isLast = data.isLast;
					couponList = data.objects;
					$('.lodemore').html( isLast ? '没有更多数据了' : '点击加载更多数据' ).show()
				    if( couponList.length == 0 ){ $('.lodemore').html('没有更多数据了').show();  }
					if ( data.pageNo == 1 && couponList.length == 0 ) { $('.lodemore').html('暂无失效优惠卷').show(); return}
					for(var i in couponList){
						var lst = couponList[i];
						html += '<div class="coupon_list_item">'
						html += '	<div class="coupon_list_item_top clearfloat">'
						html += '		<div class="float_left">'
						html += '			<p>'+lst.couponName+'</p>'
						html += '			<p>有效期至：'+lst.endTime+'</p>'
						html += '		</div>'
						html += '		<div class="float_right">'
						if (lst.status == '-1') {
							html += '			<div class="coupon_btn_invalid">已过期</div>'
						} else if (lst.status == '2') {
							html += '			<div class="coupon_btn_invalid">已使用</div>'
						}
						html += '		</div>'
						html += '	</div>'
						html += '	<div class="coupon_list_item_bg"><img src="../img/coupon_bg.png"></div>'
						html += '	<div class="coupon_list_item_bottom">'
						html += '		<p>'+lst.applyTo+'</p>'
						html += '	</div>'
						html += '</div>'
					};
					$('.cuopon_management_contain').append( html );
				}
			}
		};
	
		// 优惠券 事件命名空间
		COUPON_LIST_INVALID.eventHandle = {
			init : function(){
		    	// 点击加载更多
		    	$('.lodemore').on('click',function(){				
					if ( $(this).html() != '没有更多数据了' ) {
						pub.PAGE_INDEX++;
						COUPON_LIST_INVALID.apiHandle.invalid_coupon.init();
					}else{
						$(this).off('click');
					}				
				});
			}
		};
	
		COUPON_LIST_INVALID.init = function(){
			COUPON_LIST_INVALID.apiHandle.init();
			COUPON_LIST_INVALID.eventHandle.init();
		}
		/*--------------------将score模块中的果币模块放入personal模块中（ios返回页面不能获取js执行环境）-------------------------*/
		/****************************  果币模块  ************************/
		// 命名空间
		pub.fruitCoins = {};
		var FRUIT_COINS = pub.fruitCoins;
			FRUIT_COINS.gameType = common.gameType.getItem();
		// 果币 事件命名空间
		FRUIT_COINS.apiHandle = {
			init : function(){
				var me = this;
				me.user_score.init();
				me.chance_fruit_coin_num.init();
				if (common.isAndroid()) {
					$(".score_top_box .score_icon").css({
						"top":"-16px",
						"background-position":"20px 68px"
					});
				}
			},
			user_score : {
				init : function(){
					common.ajaxPost($.extend({},pub.userBasicParam,{
						method:'user_score'
					}),function( d ){
						$(".score_top_box .score_icon").html( d.statusCode == "100000" ? d.data.score : '0' );
					});
				}
			},
			chance_fruit_coin_num : {
				init:function(){
					common.ajaxPost($.extend({},pub.userBasicParam,{
						method:'chance_fruit_coin_num'
					}),function( d ){
						if(d.statusCode == "100000"){
							$(".count span").html(d.data);
						}
					});
				},
				apiData:function(){
				}
			},
			game_chance_exchange : {
				init:function(){
					common.ajaxPost($.extend({},pub.userBasicParam,{
						method:'game_chance_exchange'
					}),function( d ){
						if ( d.statusCode == "100000" ) {
							common.prompt1({
								flag:1,
								msg:"兑换成功",
								callback:function(){
									$(".score_top_box .score_icon").html(d.data.score);
								}
							});
							if (common.gameType.getItem() == '1') {
		                    	common.goBackCustomApp({
		                    		title:'抽奖',
		                    		url:'html/gameTiger.html',
		                    		callBackName:'pub.gameTiger.apiHandle.game_chance.init()'
		                    	})
							}else{
								common.goBackCustomApp({
		                    		title:'',
		                    		url:'html/my.html',//
		                    		callBackName:'pub.apiHandle.userScoCouMon.init()'
		                    	})
							}
						}else{
							common.prompt1({
								flag:1,
								msg:d.statusStr
							})
						}
					});
				},
				apiData:function(){
				}
			}
		};
		
		pub.fruitCoins.jumpBack = function(d){
			
		}
		// 果币 事件命名空间
		FRUIT_COINS.eventHandle = {
			init : function(){
				
				// 返回上一页
	    		common.jumpLinkSpecial('.header_left',function(){ 
	                if( FRUIT_COINS.gameType ){
	        			window.location.replace( 'gameTiger.html?dom=dom' + Math.floor(Math.random() * 100000 ) );
	                }else{
	                    window.location.replace('my.html');
	                }
	    		});
				$(".header_right").click(function(){
					var url = $(this).attr("data-url");
					common.jumpLinkPlain(url);
				});
				$(".score_top_box").on("click",".details,.abort_score",function(){
					var url = $(this).attr("data-url");
					var isDetail = $(this).hasClass(".details"),
						isAboutScore = $(this).hasClass(".abort_score");
					common.jsInteractiveApp({
						name:'goToNextLevel',
						parameter:{
							title: isDetail ? '果币明细' : isAboutScore ? '关于果币' : '',
							url:url
						}
					})
				});
				$(".score_main_list").on("click",".exchangeBtn",function(){
					var count = parseInt($(".score_top_box .score_icon").html());
					var num = parseInt($(".count span").html());
					if (num > count) {
						common.prompt1({
							flag:1,
							msg:"果币不足"
						})
					}else{
						common.createPopup({
		                    flag: 9,
		                    icon: 'none',
		                    msg: '确定兑换"一次抽奖机会"',
		                    okText: '兑换',
		                    cancelText: '取消',
		                    onConfirm: function() {
		                    	FRUIT_COINS.apiHandle.game_chance_exchange.init();
		                    }
		                });
					}
				})
			},
		};
		// 果币模块初始化
		FRUIT_COINS.init = function(){
			FRUIT_COINS.apiHandle.init();
			FRUIT_COINS.eventHandle.init();
		};
		
		
		pub.apiHandle.refresh = function(){
			if (pub.logined) {
				pub.apiHandle.userScoCouMon.init();
				pub.pullInstance.pullDownSuccess();
			}else{
				pub.pullInstance.pullDownSuccess();
			}
			
		}
		// 换肤
		pub.apiHandle.change_app_theme = {
			init:function(){
				if (common.huanfu.getItem() && common.huanfu.getItem() != 1) {
					switch( +pub.muduleId ){
						case 0 : (function(){
							$(".main_top,.footer,.exit,.zs_address_box").addClass("skin"+sessionStorage.getItem("huanfu"))
						}()); break;
						case 1 : (function(){
							$(".zs_address_box,.zs_phone_box").addClass("skin"+sessionStorage.getItem("huanfu"))
						}()); break; // 修改个人信息
						case 2 : break; // 优惠券
						case 3 : (function(){
							$(".fruitMall_wrap_top,.fruitMall_wrap_bottom").addClass("skin"+sessionStorage.getItem("huanfu"))
						}()); break; // 果币
						case 4 : (function(){
							$(".pwd_change_reverse").addClass("skin"+sessionStorage.getItem("huanfu"))
						}()); break; // 修改密码
						case 5 : (function(){
							$(".main_tel").addClass("skin"+sessionStorage.getItem("huanfu"))
						}()); break; // 帮助中心
						case 6 : break; // 设置模块
					};
				}
			}
		}
		// 个人中心初始化函数
		pub.init = function(){
			if (!common.huanfu.getKey()) {
				common.getChangeSkin();
				common.defHuanfu.done(function(){
					pub.apiHandle.change_app_theme.init();
				})
			}else{
				pub.apiHandle.change_app_theme.init();
			}
			
			pub.muduleId == "1" && pub.userInfoRepaired.init(); // 修改个人信息
	
			pub.muduleId == "2" && pub.coupon.init(); // 优惠券
	
			pub.muduleId == "3" && pub.fruitCoins.init(); // 果币
	
			pub.muduleId == "4" && pub.passwordFix.init(); // 修改密码
	
			pub.muduleId == "5" && pub.help.init(); // 帮助中心
	
			pub.muduleId == "6" && pub.settings.init(); // 设置模块
	
			pub.muduleId == "21" && COUPON_LIST.init();//新增优惠劵列表页面
			pub.muduleId == "22" && COUPON_LIST_INVALID.init();//失效劵列表页面
	
			pub.muduleId == "30" && FRUIT_COINS.init();//果币模块
			
			if( pub.muduleId == "0" ){
				common.gameType.removeItem();
				pub.apiHandle.init(); // 父模块接口数据初始化
				pub.eventHandle.init(); // 父模块 事件 初始化
				common.orderColumn.removeItem();
				common.preColumn.removeItem();
			}
			$("body").fadeIn(300)
		};
		$(document).ready(function(){
		 	pub.init();
		 	window.pub = pub;
		 	setTimeout(function(){
		 		if( pub.muduleId == "0" ){
		 			load();
		 		}
		 	}, 500);
			pub.info = {
				"pullDownLable":"下拉刷新...",
				"pullingDownLable":"松开刷新...",
				"pullUpLable":"下拉加载更多...",
				"pullingUpLable":"松开加载更多...",
				"loadingLable":"加载中..."
			}
			function pullDownAction () {
				setTimeout(function () {
					pub.apiHandle.refresh();
				}, 1000);	
			}
			function load(){
				var $listWrapper = $('.main');

		        pub.pullInstance =  pullInstance = new Pull($listWrapper, {
		             distance: 100, // 下拉多少距离触发onPullDown。默认 50，单位px
		            // 下拉刷新回调方法，如果不存在该方法，则不加载下拉dom
		            onPullDown: function () {
		            	common.getNetwork(pullDownAction,pub.pullInstance.pullDownFailed.bind(pub.pullInstance))
		            },
		        });
		        $("#wrapper").css('left','0')
			}
		})
	});
	
});
