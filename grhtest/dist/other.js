/*
* 	other scirpt for Zhangshuo Guoranhao
* 	评价 + 订单支付结果 + 充值说明 + 充值记录  
*/ 
require(['../require/config'],function () {
	require(['common','mobileUi'],function(common){

	// 命名空间

	pub = {};
	
	pub.websiteNode = common.websiteNode.getItem() ? common.websiteNode.getItem() : null;//站点
	pub.moduleId = $( '[module-id]' ).attr( 'module-id' );

	pub.logined = common.isLogin(); // 是否登录

	if( pub.logined ){
		pub.tokenId = common.tokenIdfn(); 
		pub.orderCode = common.orderCode.getItem();
		pub.source = "orderCode" + pub.orderCode;
		pub.sign = md5( pub.source + "key" + common.secretKeyfn() ).toUpperCase();
		pub.userBasicParam = {
			tokenId : pub.tokenId,
			sign : pub.sign,
			source : pub.source,
			orderCode: pub.orderCode,
		};
	}else{
		pub.moduleId != 'rechargeExplain' && common.jumpLinkPlain( '../index.html' ); // 未登录回到首页
	}
	pub.PAGE_INDEX = common.PAGE_INDEX; // 索引
	pub.PAGE_SIZE = common.PAGE_SIZE; // 页面显示数据个数


	pub.orderType = pub.orderCode.substring( 8, 10 ); // 订单类型
	pub.method = pub.orderType == '07' ? 'pre_order_details' : 'order_details'; // 获取接口类型
	
/******************************************* 订单评价 *************************************/

	// 命名空间

	pub.evaluate = {};
	
	// 接口处理
	pub.evaluate.apiHandle = {
		init : function(){
			var a = $.extend({
				method:pub.method
			},pub.userBasicParam);
			common.ajaxPost($.extend({},pub.userBasicParam,{
				method:pub.method
			}),function( d ){
				if( d.statusCode == "100000" ){
					pub.evaluate.data = d.data.orderInfo.orderDetailsList;
					pub.evaluate.apiHandle.apiData(pub.evaluate.data);
				}else{
					common.prompt( d.statusCode );
				}
			})
		},
		order_comment : {
			init : function(){
				common.ajaxPost($.extend({
					method : 'order_comment',
					goods : pub.evaluate.QUALITY_STARS_NUM,
					shop : pub.evaluate.SELLER_STARS_NUM,
					dispatcher : pub.evaluate.DISPATCHING_STARS_NUM,
					desc : pub.evaluate.EVALUATE_CONTENT

				},pub.userBasicParam),function( d ){
					d.statusCode == "100000" && common.goBackApp(1,true,"html/order_management.html");
				});
			}
		},
		apiData:function(d){
			var html='';
			for (var i=0;i<d.length;i++) {
				html += '<div class="comment_good_item">'
				html += '	<div class="comment_good_item_top clearfloat">'
				html += '		<dl class="float_left clearfloat">'
				html += '			<dt>'
				html += '				<img src="../img/img_0.png"/>'
				html += '			</dt>'
				html += '			<dd>商品名称</dd>'
				html += '		</dl>'
				html += '		<dl class="float_right clearfloat">'
				html += '			<dt>商品质量</dt>'
				html += '			<dd class="goods_star">'
				html += '				<span class="star" data="2"></span>'
				html += '				<span class="star" data="4"></span>'
				html += '				<span class="star" data="6"></span>'
				html += '				<span class="star" data="8"></span>'
				html += '				<span class="star" data="10"></span>'
				html += '			</dd>'
				html += '			<input type="hidden" name="stars" id="stars" value="1" />'
				html += '		</dl>'
				html += '	</div>'
				html += '	<div class="comment_good_item_bottom">'
				html += '		<textarea maxlength="50" placeholder="商品满足了你的期待吗？分享给想买的他们吧"></textarea>'
				html += '		<div class="comment_good_image_box clearfloat">'
				html += '			<div class="comment_good_image_boxs float_left">'
				html += '			</div>'
				html += '			<div class="comment_good_picter_add float_left">'
				html += '				<input type="file" accept="image/*" class="comment_good_picter" name="faceimg"/>'
				html += '			</div>'
				html += '		</div>'
				html += '	</div>'
				html += '</div>'
			}
			$(".comment_goods").append(html)
		}
	};
	// 事件处理
	pub.evaluate.eventHandle = {
		init : function(){
			$('.zs-eval').on('click','.zs-star',function(e){
				var 
				$this = $(this),
				parentNode = $this.parents('.zs-eval'),
				len = parentNode.find('.actived').size();
				len != 0 && parentNode.find('.actived').removeClass('actived');
				$this.addClass('actived').prevAll('.zs-star').addClass('actived');
				
			});
			
			$('.eval_submit').click(function(){
				console.log(this)
				var evalNode = $('.zs-eval');
				pub.evaluate.EVALUATE_CONTENT = $('.eval_intro_content').val(); // 评价内容
				pub.evaluate.QUALITY_STARS_NUM = evalNode.eq(0).find('.actived').length; // 商品
				pub.evaluate.SELLER_STARS_NUM = evalNode.eq(1).find('.actived').length; // 商家
				pub.evaluate.DISPATCHING_STARS_NUM = evalNode.eq(2).find('.actived').length; // 配送
				if( !pub.evaluate.QUALITY_STARS_NUM ){
					common.prompt('商品质量评价不能为空'); return;
				}
				if( !pub.evaluate.SELLER_STARS_NUM ){
					common.prompt('商家服务评价不能为空'); return;
				}
				if( !pub.evaluate.DISPATCHING_STARS_NUM ){
					common.prompt('配送服务评价不能为空'); return;
				}
				pub.evaluate.apiHandle.order_comment.init();
			});
			var timeout = undefined;
			
			$(".comment_goods").on('touchstart',".comment_good_image", function(e) {
				var nood = $(this).find(".del_img");
	        	timeout = setTimeout(function(e){
	            	nood.show();  
	            }, 800);  //长按时间超过800ms，则执行传入的方法  
	        });
	        $(".comment_goods").on('touchend',".comment_good_image", function(e) {  
	            clearTimeout(timeout);  //长按时间少于800ms，不会执行传入的方法  
	        });
	        $(".comment_goods").on("click",".del_img",function(e){
	        	var nood = $(this).parent();
	        	nood.remove()
	        });
	        $(".comment_goods").on("change",".comment_good_picter",function(){
	        	console.log("chenge");
	        	var nodes = $(this).parent().parent().find(".comment_good_image_boxs")
	        	var tar = this,
				files = tar.files,
				fNum = files.length,
				URL = window.URL || window.webkitURL,
				file = files[0];
				if( !file ) return;
				var fr = new FileReader();
				var span = document.createElement("span");
				span.className = "comment_good_image"
            	span.innerHTML = '<img src="../img/img_logo.png"/><b class="del_img"></b>';
            	nodes.append(span)
				fr.onload = function () {
	                var result = this.result;
	                var img = new Image();
	                img.src = result;
					var ll = imgsize(result);
	                //如果图片大小小于200kb，则直接上传
	                if (ll <= 200 *1024) {
	                    img = null;
	                    $(span).find("img").attr("src",result);
	                    //upload(result, file.type, $(li));
	                    
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
	
	                    $(span).find("img").attr("src",result);
						console.log(imgsize(data))
	                    //upload(data, file.type, $(li));
	                    img = null;
	                }
	
	            };
                fr.readAsDataURL(file);
	        })
	        $(".comment_goods").on("touchstart",".comment_good_picter",function(e){
	        	console.log("tauchstar");
	        	if ($(this).parent().parent().find(".comment_good_image").length == 3) {
	        		$(this).attr("disabled","disabled");
	        		common.prompt("每个商品最多添加三张图片！")
	        	}else{
	        		$(this).removeAttr("disabled")
	        	}
	        })
	        //评价打星
			$(".comment_goods").on("click",".goods_star .star",function(){
				var nood = $(this);
				nood.parent().parent().find("input").val(nood.attr("data"))
				nood.addClass("active");
				nood.prevAll(".star").addClass("active");
				nood.nextAll(".star").removeClass("active");
				console.log(nood.parent().parent().find("input").val());
			});
			$(".comment_order").on("click",".goods_star .star",function(){
				var nood = $(this);
				nood.parent().parent().find("input").val(nood.attr("data"))
				nood.addClass("active");
				nood.prevAll(".star").addClass("active");
				nood.nextAll(".star").removeClass("active");
				console.log(nood.parent().parent().find("input").val());
			});
	        function compress(img) {
		        var initSize = img.src.length;
		        var width = img.width;
		        var height = img.height;
				var canvas = document.createElement("canvas");
		        //如果图片大于四百万像素，计算压缩比并将大小压至400万以下
		        var ratio;
		        if ((ratio = width * height / 4000000)>1) {
		            ratio = Math.sqrt(ratio);
		            width /= ratio;
		            height /= ratio;
		        }else {
		            ratio = 1;
		        }
		
		        canvas.width = width;
		        canvas.height = height;
				var ctx = canvas.getContext("2d");
				//        铺底色
		        ctx.fillStyle = "#fff";
		        ctx.fillRect(0, 0, canvas.width, canvas.height);
		
		        //如果图片像素大于100万则使用瓦片绘制
		        var count;
		        if ((count = width * height / 1000000) > 1) {
		            count = ~~(Math.sqrt(count)+1); //计算要分成多少块瓦片
		
					//            计算每块瓦片的宽和高
		            var nw = ~~(width / count);
		            var nh = ~~(height / count);
					var tCanvas = document.createElement("canvas");
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
		            ctx.drawImage(img, 0, 0, width, height);
		        }
		
		        //进行最小压缩
		        var ndata = canvas.toDataURL('image/jpeg', 0.1);
		
		        console.log('压缩前：' + initSize);
		        console.log('压缩后：' + ndata.length);
		        console.log('压缩率：' + ~~(100 * (initSize - ndata.length) / initSize) + "%");
		
		        tCanvas.width = tCanvas.height = canvas.width = canvas.height = 0;
		
		        return ndata;
		    };
	        function upload(basestr, type, $li) {
		        var text = window.atob(basestr.split(",")[1]);
		        var buffer = new ArrayBuffer(text.length);
		        var ubuffer = new Uint8Array(buffer);
		        var pecent = 0 , loop = null;
		
		        for (var i = 0; i < text.length; i++) {
		            ubuffer[i] = text.charCodeAt(i);
		        }
		
		        var Builder = window.WebKitBlobBuilder || window.MozBlobBuilder;
		        var blob;
		
		        if (Builder) {
		            var builder = new Builder();
		            builder.append(buffer);
		            blob = builder.getBlob(type);
		        } else {
		            blob = new window.Blob([buffer], {type: type});
		        }
				var formdata = new FormData();
		        formdata.append('imagefile', blob);
		        
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
			
		}
	};

	pub.evaluate.init = function(){
		pub.evaluate.apiHandle.init()
		pub.evaluate.eventHandle.init();
	};

/**************************** 订单支付结果 模块 **********************************/
	// 命名空间

	pub.payRusult = {};

	pub.payRusult.apiHandle = {
		init : function(){
			pub.payRusult.apiHandle.unitDeal.init();
		},
		unitDeal : {
			init : function(){
				common.ajaxPost($.extend({
					method : pub.payRusult.METHOD,
				},pub.userBasicParam),function( d ){
					d.statusCode == "100000" && pub.payRusult.apiHandle.unitDeal.apiData( d );
					d.statusCode != "100000" && common.prompt( d.strStatus );
				});
			},
			apiData : function( d ){
				d = d.data.orderInfo ? d.data.orderInfo : d.data;
				if ( d.orderStatus == "3" || d.payStatus == '2' ) {
					$(".result_status").addClass("result_bg").html("订单支付成功！");
					$(".result_goto").html("查看订单").css("background","#93c01d").on("click",function(){
						d.payStatus == '2' && common.jumpLinkPlainApp( "preOrderDetail.html" );
						d.orderStatus == '3' && common.jumpLinkPlainApp( "orderDetails.html" );
			    	})
				} else{
					$(".result_status").addClass("result_bg2").html("订单支付失败！");
					$('.result_message').remove();

					$(".result_goto").html("返回重新支付").css("background","#fe7831").on("click",function(){
			    		common.jumpLinkPlainApp( 'order_pay.html' );
			    	})
				};
		    	$(".result_detail ul li").eq(0).html("订单号:" + d.orderCode ).next().html("实付款:<span class='font_color'>￥" + d.realPayMoney + "</span>");
		    	$(".result_message").show();
			}
		}
	};

	pub.payRusult.eventHandle = {
		init : function(){
			common.jumpLinkSpecial(".header_left",function(){
				 pub.payRusult.isDeposit && common.jumpLinkPlain( "PreOrder_management.html" );
				!pub.payRusult.isDeposit && common.jumpLinkPlain( "order_management.html" );
			});
		}
	};
	// 支付结果 模块 初始化
	pub.payRusult.init = function(){
		pub.payRusult.isDeposit = pub.orderCode.substring(8,10) == "07";
		pub.payRusult.METHOD = pub.payRusult.isDeposit ? 'pre_order_details' : 'order_details';
		pub.payRusult.apiHandle.init();
		pub.payRusult.eventHandle.init();
	};




/**************************** 充值说明 模块 **********************************/

	// 命名空间
	pub.payExplain = {};
	
	pub.payExplain.apiHandle = {
		init : function(){
			pub.payExplain.apiHandle.month_card_type_list.init();
		},
		month_card_type_list : {
			init : function(){
				common.ajaxPost({
					method : 'month_card_type_list',
					websiteNode:pub.websiteNode
				},function( d ){
					d.statusCode == '100000' && pub.payExplain.apiHandle.month_card_type_list.apiData( d ); 
	     			d.statusCode != '100000' && common.prompt(d.statusStr);
				})
			},
			apiData : function( d ){
					var 
					html = ''      	
					d = d.data;

			    	for(var i in d.monthCardType){
			    		html += '<div class="month_discount_detail clearfloat">'
			    		html += '    <div class="discount_detail_intr">' + d.monthCardType[i].policyName + '</div>'        		
			    		html += '    <div class="discount_detail_intr">' + d.monthCardType[i].extraMoney + '</div>'        	  
			    		html += '</div>'
			    	}

			    	!!d.grhAdDesc && $('.month_service_intro').show().html( d.grhAdDesc.desc.replace(/\r\n/g, "<br/>") );
			    	!!d.grhCouponDesc && $('.month_copon_instruction').show().html( d.grhCouponDesc.desc.replace(/\r\n/g, "<br/>") );
			    	!!d.adInfo && $('.month_service_banner').css( 'background','url(' + d.adInfo.adLogo + ')' ); 
			    	$('.month_discount_content').html( html );
			}
		}
	};
	pub.payExplain.eventHandle = {
		init : function(){
			common.jumpLinkSpecialApp('.discount_pay','',function(){
				if( pub.logined ){
					common.orderCode.removeItem();
					common.jumpLinkPlainApp( '账户充值','html/month_recharge.html?search=recharge' );
				}else{
				   	common.jumpMake.setItem( "7" );
				   	common.jumpLinkPlainApp( '登录',"html/login.html?type="+7 );
				}
			});
		}
	};

	pub.payExplain.init = function(){
		pub.payExplain.apiHandle.init();
		pub.payExplain.eventHandle.init();
	};

/**************************** 充值记录 模块 **********************************/

	pub.rechargeRecord = {};

	pub.rechargeRecord.payWay = {
		"2" : { text : '支付宝充值' },
		"3" : { text : '微信充值' },
		"4" : { text : '快捷充值' },
		"8" : { text : '系统充值' }
	};
	

	pub.rechargeRecord.apiHandle = {
		init : function(){
			pub.userId = common.user_datafn().cuserInfoid;
			pub.source = "userId" + pub.userId;
			pub.sign = md5( pub.source + "key" + common.secretKeyfn() ).toUpperCase();

			pub.rechargeRecord.apiHandle.user_recharge_rcd.init();
		},
		user_recharge_rcd : {
			init : function(){
				common.ajaxPost({
					method : 'user_recharge_rcd',
					userId : pub.userId,
					pageNo : pub.PAGE_INDEX,
					pageSize : pub.PAGE_SIZE,
					tokenId : pub.tokenId,
					sign : pub.sign,
					source : pub.source
				},function( d ){
					d.statusCode == "100000" && pub.rechargeRecord.apiHandle.user_recharge_rcd.apiData( d );
				});
			},
			apiData : function( d ){
				var html='';
				pub.isLast = d.data.lastPage;
				
		    	if( pub.isLast ){                	                	
		        	pub.lodemore.show().html('没有更多数据了');	
		        }else{   
		        	pub.lodemore.show().html('点击加载更多数据');             
		        };

		        if( !$.isArray( d.data.list ) || d.data.list.length==0 ){
		        	pub.lodemore.show().html('没有更多数据了'); return;
		        }
				d.data.list.forEach(function( v, i ){
					html += '<div class="fruit_get_content clearfloat">'
					html += '<div class="fruit_get_content_left">' + v.payTime.substring(0,10) +'</div>'
					html += '<div class="fruit_get_content_center">' + pub.rechargeRecord.payWay[ v.paymentMethod ].text + '</div>'
					html += '<div class="fruit_get_content_right">￥' + v.money + '</div>'
					html += '</div>'
				});
				$('.fruit_get_contain').append( html );
			}
		}
	};

	pub.rechargeRecord.eventHandle = {
		init : function(){

			pub.lodemore.on('click',function(){				
				if( !pub.isLast ){
					pub.PAGE_INDEX ++ ;
					pub.rechargeRecord.apiHandle.user_recharge_rcd.init();
				}				
			});
			common.jumpLinkSpecial('.header_left','month_recharge.html?search=recharge');
		}
	};


	pub.rechargeRecord.init = function(){
		pub.lodemore = $('.lodemore');
		pub.rechargeRecord.apiHandle.init();
		pub.rechargeRecord.eventHandle.init();

	};

 	pub.apiHandle = {};
	pub.eventHandle = {};
 	pub.init = function(){
 		pub.moduleId == 'evaluate' && pub.evaluate.init();
 		pub.moduleId == 'payResult' && pub.payRusult.init();
 		pub.moduleId == 'rechargeExplain' && pub.payExplain.init();
 		pub.moduleId == 'rechargeRecord' && pub.rechargeRecord.init();

 	};

	pub.init();
	})
})
