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
					goods : pub.evaluate.GOODS,
					service : pub.evaluate.SERVICE,
					speed : pub.evaluate.SPEED,
					goodsComments : pub.evaluate.goodsComments

				},pub.userBasicParam),function( d ){
					d.statusCode == "100000" && common.goBackApp(1,true,"html/order_management.html");
				});
			}
		},
		apiData:function(d){
			var html='';
			for (var i=0;i<d.length;i++) {
				html += '<div class="comment_good_item"  data-id = "'+d[i].goods+'">'
				html += '	<div class="comment_good_item_top clearfloat">'
				html += '		<dl class="float_left clearfloat">'
				html += '			<dt>'
				html += '				<img src="'+d[i].goodsLogo+'"/>'
				html += '			</dt>'
				html += '			<dd>'+d[i].goodsName+'</dd>'
				html += '		</dl>'
				html += '		<dl class="float_right clearfloat">'
				html += '			<dt>商品质量</dt>'
				html += '			<dd class="goods_star">'
				html += '				<span class="star active" data="2"></span>'
				html += '				<span class="star active" data="4"></span>'
				html += '				<span class="star active" data="6"></span>'
				html += '				<span class="star active" data="8"></span>'
				html += '				<span class="star active" data="10"></span>'
				html += '			</dd>'
				html += '			<input type="hidden" name="stars" id="stars" value="10" />'
				html += '		</dl>'
				html += '	</div>'
				html += '	<div class="comment_good_item_bottom">'
				html += '		<textarea maxlength="50" placeholder="商品满足了你的期待吗？分享给想买的他们吧"></textarea>'
				html += '		<div class="comment_good_image_box clearfloat">'
				html += '			<div class="comment_good_image_boxs float_left">'
				html += '			</div>'
				html += '			<div class="comment_good_picter_add float_left">'
				html += '				<input type="file" accept="image/*" class="comment_good_picter" name="faceimg"  data-id = "'+d[i].goods+'" />'
				html += '			</div>'
				html += '		</div>'
				html += '	</div>'
				html += '</div>'
			}
			$(".comment_goods").append(html)
		},
		comment_upload_img:function(data,el){
			$.ajax({
				type:"POST",
				url:common.API,
				dataType:"JSON",
				data:data,
		        processData : false, // 不处理发送的数据，因为data值是Formdata对象，不需要对数据做处理
		        contentType : false, // 不设置Content-type请求头
				success:function(d){
					console.log(JSON.stringify(d))
					if( d.statusCode == "100000" ){
						console.log(d.data)
						$(el).attr("data-src",d.data);
					}else{
						common.prompt( d.statusCode );
					}
				}
			});
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
				var nood = $(".comment_goods .comment_good_item");
				pub.evaluate.goodsComments = [];
				
				nood.each(function(i){
					var el = $(nood[i]);
					var obj = {
						goodsId : el.attr("data-id"),
						service : el.find('.comment_good_item_top input').val(),
						comment : el.find('.comment_good_item_bottom textarea').val(),
						pics : getImgStr(el.find('.comment_good_item_bottom .comment_good_image_boxs'))
					}
					pub.evaluate.goodsComments.push(obj)
				})
				pub.evaluate.goodsComments = JSON.stringify(pub.evaluate.goodsComments)
				var evalNode = $('.comment_order_star .comment_order_star_item');
				pub.evaluate.SERVICE = evalNode.eq(0).find('input').val(); // 商品
				pub.evaluate.GOODS = evalNode.eq(1).find('input').val(); // 商家
				pub.evaluate.SPEED = evalNode.eq(2).find('input').val(); // 配送
				
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
	        	console.log("deg_img")
	        	pub.evaluate.nood = $(this).parent();
	        	var data = {
					type:1,
					title:'确定删除图片吗?',
					canclefn:'cancleFn',
					truefn:'trueFn'
				}
				common.alertMaskApp(JSON.stringify(data));
	        });
	        /*$(".comment_goods").on("click",'.comment_good_image_boxs img',function(){
	        	$(this).is('.img_preview') ? $(this).removeClass("img_preview") : $(this).addClass("img_preview");
	        })*/
	        $(".comment_goods").on("change",".comment_good_picter",function(){
	        	pub.evaluate.addNode = null;
	        	if ($(this).parent().parent().find('.comment_good_image').length == 3 ) {
	        		pub.evaluate.addNode = $(this).parent();
	        		pub.evaluate.addNode.css("display","none");
	        	}
	        	var nodes = $(this).parent().parent().find(".comment_good_image_boxs");
	        	var goodid = $(this).attr("data-id")
	        	var tar = this,
				files = tar.files,
				fNum = files.length,
				URL = window.URL || window.webkitURL,
				file = files[0];
				if( !file ) return;
				EXIF.getData(files[0], function() {  
		            //alert(EXIF.pretty(this));  
		            EXIF.getAllTags(this);   
		            //alert(EXIF.getTag(this, 'Orientation'));   
		            Orientation = EXIF.getTag(this, 'Orientation');
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
		                    upload(result, file.type,goodid,span,Orientation);
		                    
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
		                    upload(data, file.type,goodid,span,Orientation);
		                    img = null;
		                }
		
		            };
	                fr.readAsDataURL(file);
			  	})
				
	        })
	        /*$(".comment_goods").on("touchstart",".comment_good_picter",function(e){
	        	console.log("tauchstar");
	        	if ($(this).parent().parent().find(".comment_good_image").length == 3) {
	        		$(this).attr("disabled","disabled");
	        		common.prompt("每个商品最多添加三张图片！")
	        	}else{
	        		$(this).removeAttr("disabled")
	        	}
	        })*/
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
		
		        console.log('压缩前：' + initSize);
		        console.log('压缩后：' + ndata.length);
		        console.log('压缩率：' + ~~(100 * (initSize - ndata.length) / initSize) + "%");
				console.log(tCanvas.width)
				console.log(tCanvas.height)
				console.log(canvas.width)
				console.log(canvas.height)
		        tCanvas.width = tCanvas.height = canvas.width = canvas.height = 0;
		
		        return ndata;
		    };
	        function upload(basestr, type, goodid,el,Orientation) {
		        var basestr = basestr.split(",")[1];
		        var type = type.split("/")[1];
				var formdata = new FormData();
		        formdata.append("method","comment_img_upload");
		        formdata.append("orderCode",pub.orderCode);
		        formdata.append("goodsId",goodid);
		       	formdata.append("imgStr",basestr);
		        formdata.append("suffix",type);
		        formdata.append("angle",Orientation);
		        pub.evaluate.apiHandle.comment_upload_img(formdata,el);
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
			//从元素上提取img地址拼接str
			function getImgStr (o){
				if (typeof o == "object") {
					var el = o.find('span');
					var str = '';
					if(el.length !=0){
						el.each(function(i){
							str += $(el[i]).attr("data-src")+"@";
						})
					}
					return str;
				}
			}
		}
	};

	pub.evaluate.init = function(){
		window.pub = pub;
		var EXIF = require(['exif'],function(){})
		pub.evaluate.apiHandle.init()
		pub.evaluate.eventHandle.init();
		pub.evaluate.trueFn = function(){
			pub.evaluate.nood.remove();
			if (pub.evaluate.addNode) {
				pub.evaluate.addNode.css("display","block")
			}
		}
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
