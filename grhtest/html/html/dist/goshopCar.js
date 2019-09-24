/*
* goshopCar scirpt for Zhangshuo Guoranhao
*/ 
define(['common'],function(common){
	var goshopCar={
		memberfilter : ["goodsId",'count'], // 给后台数据 
		show : false,//购物车是否显示 默认为不显示的
		car_goods : function(){
			//显示购物车中的商品
			arr = goshopCar.goodlist2();
			var html='';
			for (var i=0;i<arr.length;i++) {
				html +='<li class="line-wrapper" data="' + arr[i].goodsId + '" packageNum="' + arr[i].packageNum + '" maxCount="' + arr[i].maxCount + '" price="' + arr[i].price + '">';
		        html +='    <div class="line-scroll-wrapper clearfloat">'
		        html +='        <dl class="line-normal-wrapper clearfloat">'
		        html +='			<dt class="sub-list select-node">'
		        html +='				<span class="select ' + ['unselect-dot','select-dot'][ arr[i].status ] + '"></span>'
		        html +='			</dt>'
	            html +='            <dd class="line-normal-avatar-wrapper">'
	            html +='            	<img src="'+arr[i].logo+'"/>'
	            html +='            </dd>'
	            html +='            <dd class="line-normal-info-wrapper">'
	            html +='				<div class="often_shop_goods_top clearfloat">'
				html +='					<p class="often_shop_goods_tit">'+arr[i].name+'</p>'
				html +='					<p class="often_shop_goods_icon">￥'+arr[i].price+'</p>'
				html +='				</div>'
	            html +='				<div class="often_shop_goods_top often_shop_show clearfloat">'
				html +='					<p class="often_shop_goods_tit">'+arr[i].specifications+'</p>'
				html +='					<p class="often_shop_goods_icon ellipsis"><del>￥'+arr[i].oldPrice+'</del></p>'
				html +='				</div>'
				html +='				<div class="oprate">'
				html +='					<span class="minus_num actived">－</span><input class="show_num" value="' + arr[i].count + '" disabled="disabled" readonly="true" dataID="'+arr[i].goodsId+'"><span class="add_num">+</span>'
				html +='				</div>'
	            html +='            </dd>'
		        html +='       </dl>'
		        html +='        <div class="line-btn-delete"><button>删除</button></div>'
		        html +='   </div>'
		        html +='</li>'
			}
			
			$('#zs-cart .ul-box').html( html );
		},
		style_change : function(n){
			//根据商品总数和总价变化对应的样式
			if (n) {
				var num = n;
			}else{
				var num = goshopCar.getgoodsNum();
			}
			if ( num == '0' ) {

				$('#empty-cart').show().appendTo('#ul-box');

				$('.totalmoney','#total').html('¥0.00' );

				$('#all-select').find('.select-dot').removeClass('select-dot').addClass('unselect-dot');

			} else{
				$('.totalmoney','#total').html('¥' + goshopCar.getgoodsMoney() );
				$('.footer_item[data-content]').attr('data-content',num );
			}
			
		},

		creat : function(id,name,price,logo,specifications,maxCount,packageNum, oldPrice,  type ,purchasequantity  ){ // 创建一个单品
			var goodsInfo = new Object();
				goodsInfo.id = parseInt(id);
				goodsInfo.type = type;//1表示普通商品2表示秒杀商品
		        goodsInfo.name = name;
		       	if (purchasequantity != '' && purchasequantity != '0') {
		       		goodsInfo.sum = purchasequantity;//商品数量
		       	}else{
		       		goodsInfo.sum = 1;//商品数量
		       	}
		        
		        goodsInfo.price = parseFloat(price);//商品价格
		        goodsInfo.logo = logo;//商品logo
		        goodsInfo.specifications = specifications;//商品描述
		        goodsInfo.maxCount = maxCount;//最大购买数量
		        goodsInfo.packageNum = packageNum;//库存数量
		        goodsInfo.status = 1;//本地商品是否选择
		        goodsInfo.updata = true;
		        goodsInfo.purchasequantity = purchasequantity;//多少起购
		        goodsInfo.oldPrice = oldPrice;//原始价格
		        goodsInfo.msg = '';//提示信息
	        return goodsInfo;
		},
		//添加商品
		addgoods : function ( id, name, price, logo, specifications, maxCount, packageNum, oldPrice,  type ,purchasequantity ) {

		    if ( typeof localStorage.good  == "undefined" ) {
				
		    	var singleGoods = goshopCar.creat(id,name,price,logo,specifications,maxCount,packageNum, oldPrice,  type ,purchasequantity  );
		    	var arr = [];
		    	arr.push(singleGoods);
		    		localStorage.good = JSON.stringify( arr );
		        return singleGoods.sum;
		    } else{

		    	var localGoodsList = JSON.parse( localStorage.good ); // 本地商品列表

		        for (var i in localGoodsList ) {
		           	if ( localGoodsList[i].id == id ) {

		            	localGoodsList[i].sum = 1 + parseInt( localGoodsList[i].sum, 10);

		            	localStorage.good = JSON.stringify( localGoodsList );
		            	
		            	return localGoodsList[i].sum;
		        	};
		        };


		        var singleGoods = goshopCar.creat( id,name,price,logo,specifications,maxCount,packageNum, oldPrice,  type ,purchasequantity  );
		        	localGoodsList.push( singleGoods );
		        	localStorage.good = JSON.stringify( localGoodsList );

	            return singleGoods.sum;
		     
		    };
		},
		// 从购物车减少商品
		cutgoods : function ( id ) {

			var localGoodsList = JSON.parse( localStorage.good ); // 本地商品列表

			for (var i in localGoodsList ) {
				if ( localGoodsList[i].id == id ) {
					if (localGoodsList[i].purchasequantity != 0) {
						if (localGoodsList[i].sum <= localGoodsList[i].purchasequantity) {
							localGoodsList.splice(i,1);
			       			localStorage.good = JSON.stringify( localGoodsList );
			       			return 0;
						}else{
							localGoodsList[i].sum = parseInt( localGoodsList[i].sum, 10 ) - 1;
			            	localStorage.good = JSON.stringify( localGoodsList );
			            	return localGoodsList[i].sum;
						}
					}else{
						//之前已经有此类商品了
			       		if ( localGoodsList[i].sum == 1 ) {
			       			localGoodsList.splice(i,1);
			       			localStorage.good = JSON.stringify( localGoodsList );
			       			return 0;
			       		} else{
			       			localGoodsList[i].sum = parseInt( localGoodsList[i].sum, 10 ) - 1;
			            	localStorage.good = JSON.stringify( localGoodsList );
			            	return localGoodsList[i].sum;
			       		};
					}
		    	};
			}
		},
		callbackgoodsnumber : function ( id ){ // 获取商品数量

			if ( typeof  localStorage.good  == "undefined" ) {
				return 0;
			}else{

				var i, localGoodsList = JSON.parse( localStorage.good );

				for ( i in localGoodsList ) {
					if ( localGoodsList[i].id == id ) {
						return localGoodsList[i].sum;
			    	};
				}
				return 0;
			};
		},
		//获取商品总数
		getgoodsNum : function  (){
			var total = 0,i;
			if( !!localStorage.good ){
				var localGoodsList = JSON.parse( localStorage.good );
		    	for ( i in localGoodsList) {
		    		total += parseInt( localGoodsList[i].sum, 10 );
		    	}
		    	return total;
			}
			return 0;

		},
		//获取商品总价格;
		getgoodsMoney : function (){
			var totalMoney = 0.00,i;
			if( !!localStorage.good ){
				var localGoodsList = JSON.parse( localStorage.good );
		    	for ( i in localGoodsList ) {
		    		if( localGoodsList[i].status == 1 ){
			    		totalMoney += parseInt( localGoodsList[i].sum, 10 )*parseFloat( localGoodsList[i].price, 10 );
		    		}
		    	}
		    	return totalMoney.toFixed(2);
			}
			return 0;
		},
		//获取商品列表 id 和 sum
		goodlist1 : function (){  // 后台字段处理

			if( !!localStorage.good ){
				var obj = {};
				var localGoodsList = [];
				// 筛选处理
				JSON.parse( localStorage.good.replace(/\"s*id\"s*/g,"\"goodsId\"").replace(/\"s*sum\"s*/g,"\"count\"") ).forEach(function(v){
					if(v.status == 1 ){
						localGoodsList.push( v );
					}
				});
				obj.goodsList = eval( JSON.stringify( localGoodsList, ['goodsId','count'] ) );
				return JSON.stringify(obj);
			}
			return 0;
		},
		//获取商品列表price sum 和 name
		goodlist2 : function (){
			
			if( !!localStorage.good ){
				return JSON.parse( localStorage.good.replace(/\"s*id\"s*/g,"\"goodsId\"").replace(/\"s*sum\"s*/g,"\"count\"") );
			}
			return 0;
		},
		allgoods : function(){
			var s = [];
			if( !!localStorage.good ){
				s = JSON.parse(localStorage.good);
			}
			return s;
		},
		allgoodsId : function (){
			if( !!localStorage.good ){
				var s = '';
				JSON.parse(localStorage.good).forEach(function(v,i){
					if (i == JSON.parse(localStorage.good).length -1) {
						s += v.id
					}else{
						s += v.id + ','
					}
				})
				return s;
			}
			return '';
		},
		htmlInit : function (){
			
			//左滑出现删除按钮
	   
	        // 设定每一行的宽度=屏幕宽度+按钮宽度
	        $(".line-scroll-wrapper").width($("#app").width() + $(".line-btn-delete").width());
	        // 设定常规信息区域宽度=屏幕宽度
	        $(".line-normal-wrapper").width($("#app").width());
	        // 设定文字部分宽度（为了实现文字过长时在末尾显示...）
	        //$(".line-normal-msg").width($(".line-normal-wrapper").width() - 280);
	        
	        setTimeout(function(){
	        	// 获取所有行，对每一行设置监听
	        	var lines = $(".line-normal-wrapper");
	        	var len = lines.length;
		        var lastX, lastXForMobile;
		        // 用于记录被按下的对象
		        var pressedObj; // 当前左滑的对象
		        var lastLeftObj; // 上一个左滑的对象
		        // 用于记录按下的点
		        var start;
		        // 网页在移动端运行时的监听
		        for(var i = 0; i < len; ++i) {
		            lines[i].addEventListener('touchstart', function(e) {
		                lastXForMobile = e.changedTouches[0].pageX;
		                pressedObj = this; // 记录被按下的对象 
		
		                // 记录开始按下时的点
		                var touches = event.touches[0];
		                start = {
		                    x: touches.pageX, // 横坐标
		                    y: touches.pageY // 纵坐标
		                };
		            });
		            lines[i].addEventListener('touchmove', function(e) {
		                // 计算划动过程中x和y的变化量
		                var touches = event.touches[0];
		                delta = {
		                    x: touches.pageX - start.x,
		                    y: touches.pageY - start.y
		                };
		
		                // 横向位移大于纵向位移，阻止纵向滚动
		                if(Math.abs(delta.x) > Math.abs(delta.y)) {
		                    event.preventDefault();
		                }
		            });
		            lines[i].addEventListener('touchend', function(e) {
		                if(lastLeftObj && pressedObj != lastLeftObj) { // 点击除当前左滑对象之外的任意其他位置
		                    $(lastLeftObj).animate({
		                        marginLeft: "0"
		                    }, 500); // 右滑
		                    lastLeftObj = null; // 清空上一个左滑的对象
		                }
		                var diffX = e.changedTouches[0].pageX - lastXForMobile;
		                if(diffX < -150) {
		                    $(pressedObj).animate({
		                        marginLeft: "-200px"
		                    }, 500); // 左滑
		                    lastLeftObj && lastLeftObj != pressedObj &&
		                        $(lastLeftObj).animate({
		                            marginLeft: "0"
		                        }, 500); // 已经左滑状态的按钮右滑
		                    lastLeftObj = pressedObj; // 记录上一个左滑的对象
		                } else if(diffX > 150) {
		                    if(pressedObj == lastLeftObj) {
		                        $(pressedObj).animate({
		                            marginLeft: "0"
		                        }, 500); // 右滑
		                        lastLeftObj = null; // 清空上一个左滑的对象
		                    }
		                }
		            });
		        }
	        },800)
	        
		}
	}
	goshopCar.eventHandle = {
		init : function(){
			//添加点击增加事件
			$('#ul-box').on('click','.add_num',function(){
				var $this = $(this), 
					parentNode = $this.parents( '.line-wrapper' ),
					goodId = parentNode.attr( 'data' ),
					packageNum = parseInt( parentNode.attr( 'packageNum' ), 10 ),
					Type = parentNode.attr( 'packageNum' ),
					maxCount = parentNode.attr( 'maxCount' ),
					numList = parseInt( $this.prev().val(), 10 );
				if(Type == 'seckill'){
					common.prompt("秒杀商品限购一份！");
					return;
				}
				if ( numList < packageNum ) {
					if( maxCount != '0' && maxCount != "" ){
						if(numList < maxCount){
							var num = goshopCar.addgoods( goodId );
							$this.prev().val( num );
							goshopCar.style_change();
							//common.setShopCarNumApp(goshopCar.getgoodsNum())
						}else{
							common.prompt( "该商品限购" + maxCount + "件" );
						}
					}else{
						var num = goshopCar.addgoods( goodId );
						$this.prev().val( num );
						goshopCar.style_change();
						//common.setShopCarNum_ShoppingCartApp(goshopCar.getgoodsNum())
					}
				} else{
					common.prompt( "库存不足" );
				}
			});

			//添加减少事件
			$('#ul-box').on('click','.minus_num',function(){
				var $this = $(this),
				parentNode = $this.parents( '.line-wrapper' ),
				id = parentNode.attr('data');

				//num当前商品数目 numb商品总数
				var numb = goshopCar.callbackgoodsnumber(id);
				if( numb == 1 ){
					return;
				}
				var num = goshopCar.cutgoods( id );
				$this.next().val( num );
				goshopCar.style_change();
				//common.setShopCarNum_ShoppingCartApp(goshopCar.getgoodsNum())
			});
			
		},
	}
	
	return goshopCar;
});