/*
* shopCar scirpt for Zhangshuo Guoranhao
*/ 
define('shopCar',function(require, exports, module){

	var shopCar=function(){
		
		this.name = 'good';
		this.init = function(name){
			this.name = name || 'good';
			if (localStorage.shopCar) {
				var shopCarList = (localStorage.shopCar).split(",");
				if (shopCarList.indexOf(this.name) == -1) {
					shopCarList.push(this.name);
					localStorage.shopCar = shopCarList.join(',');
				}
			}else{
				localStorage.shopCar = this.name;
			}
		}
		this.car_goods = function(){
			//显示购物车中的商品
			arr = this.getGoodsDate();
			var html='';
			for (var i = 0; i < arr.length; i++) {
				console.log(arr[i])
				html += '<li class="clearfloat" data="'+arr[i].goodsId+'" packageNum="'+arr[i].packageNum+'" maxCount="'+arr[i].maxCount+'" >'
				html += '	<div class="car_left float_left">'+arr[i].name+'</div>'
				html += '	<div class="msg float_left" >'+arr[i].msg+'</div>'
				html += '	<div class="good_number clearfloat">'
				html += '		<div class="minus_num zs-goods-icon"></div>'
				html += '		<div class="show_num" zs-goodsid="'+arr[i].goodsId+'">'+arr[i].count+'</div>'
				html += '		<div class="add_num zs-goods-icon"></div>'
				html += '	</div>'
				html += '</li>'
			}
			$('.footer_car .car_main ul').html( html );
		};
		this.style_change = function(){
			var num = this.getgoodsNum();
			if ( num == '0' ) {
				$(".cart_message").html("购物车是空的");
				$(".footer-rigth").removeClass("isClick");
				$("#goodsNum").hide();
				$('.icon_cart[data-content]').attr('data-content',0 ).removeClass("true");
			} else{
				if (num > 99) {
					num = '99+'	
				}
				$(".footer-rigth").addClass("isClick");
				$(".cart_message").html("￥总计："+this.getgoodsMoney())
				$("#goodsNum").html(num).show();
				$('.icon_cart[data-content]').attr('data-content',num).addClass("true");
			}
		};
		this.creat = function( id, name, price, logo, specifications, maxCount, packageNum, oldPrice, type ,purchasequantity ){ // 创建一个单品
			var goodsInfo = new Object();
				goodsInfo.id = parseInt(id);//商品id
				goodsInfo.type = type;//1表示普通商品2表示秒杀商品
		        goodsInfo.name = name;//商品名称
		        console.log(purchasequantity != 0)
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
		};
		//添加商品
		this.addgoods = function ( id, name, price, logo, specifications, maxCount, packageNum, oldPrice, type , purchasequantity) {
		    if ( typeof localStorage[this.name]  == "undefined" ) {
		    	var singleGoods = this.creat( id, name, price, logo, specifications, maxCount, packageNum, oldPrice, type ,purchasequantity);
		    	var arr = [];
		    	arr.push(singleGoods);
		    		localStorage[this.name] = JSON.stringify( arr );
		        return parseInt(singleGoods.sum);
		    } else{
		    	var localGoodsList = JSON.parse( localStorage[this.name] ); // 本地商品列表
		        for (var i in localGoodsList ) {
		           	if ( localGoodsList[i].id == id ) {
		            	localGoodsList[i].sum = 1 + parseInt( localGoodsList[i].sum, 10);
		            	localStorage[this.name] = JSON.stringify( localGoodsList );
		            	return parseInt(localGoodsList[i].sum);
		        	};
		        };
		        var singleGoods = this.creat( id, name, price, logo, specifications, maxCount, packageNum, oldPrice, type ,purchasequantity);
		        	localGoodsList.push( singleGoods );
		        	localStorage[this.name] = JSON.stringify( localGoodsList );
	            return parseInt(singleGoods.sum);
		    };
		};
		// 从购物车减少商品
		this.cutgoods = function ( id ) {
			var localGoodsList = JSON.parse( localStorage[this.name] ); // 本地商品列表
			for (var i in localGoodsList ) {
				if ( localGoodsList[i].id == id ) {
					if (localGoodsList[i].purchasequantity != 0) {
						if (localGoodsList[i].sum <= localGoodsList[i].purchasequantity) {
							localGoodsList.splice(i,1);
			       			localStorage[this.name] = JSON.stringify( localGoodsList );
			       			return 0;
						}else{
							localGoodsList[i].sum = parseInt( localGoodsList[i].sum, 10 ) - 1;
			            	localStorage[this.name] = JSON.stringify( localGoodsList );
			            	return localGoodsList[i].sum;
						}
					}else{
						//之前已经有此类商品了
			       		if ( localGoodsList[i].sum == 1 ) {
			       			localGoodsList.splice(i,1);
			       			localStorage[this.name] = JSON.stringify( localGoodsList );
			       			return 0;
			       		} else{
			       			localGoodsList[i].sum = parseInt( localGoodsList[i].sum, 10 ) - 1;
			            	localStorage[this.name] = JSON.stringify( localGoodsList );
			            	return localGoodsList[i].sum;
			       		};
					}
		    	};
			}
		};
		//从购物车增加商品
		this.addCartGood=function(id){
			var localGoodsList = JSON.parse( localStorage[this.name] ); // 本地商品列表
			for (var i in localGoodsList ) {
				if ( localGoodsList[i].id == id ) {
					localGoodsList[i].sum = parseInt( localGoodsList[i].sum, 10 ) + 1;
	            	localStorage[this.name] = JSON.stringify( localGoodsList );
	            	return localGoodsList[i].sum;
		    	};
			}
		};
		//获取商品列表 id 和 sum
		this.goodlist1 = function (){  // 后台字段处理
			if( !!localStorage[this.name] ){
				var obj = {};
				var localGoodsList = [];
				// 筛选处理
				JSON.parse( localStorage[this.name].replace(/\"\s*id\"\s*/g,"\"goodsId\"").replace(/\"\s*sum\"\s*/g,"\"count\"") ).forEach(function(v){
					if(v.status == 1 ){
						localGoodsList.push( v );
					}
				});
				obj.goodsList = eval( JSON.stringify( localGoodsList, ['goodsId','count'] ) );
				return JSON.stringify(obj);
			}
			return 0;
		};
		//获取商品列表price sum 和 name
		this.goodlist2 = function (){
			if( !!localStorage[this.name] ){
				return JSON.parse( localStorage[this.name].replace(/\"\s*id\"\s*/g,"\"goodsId\"").replace(/\"\s*sum\"\s*/g,"\"count\"") );
			}
			return [];
		};
		/*更新商品*/
		this.updataList = function(UpdataList){
			if (!!localStorage[this.name]) {
				localStorage[this.name] = JSON.stringify( UpdataList ).replace(/\"\s*goodsId\"\s*/g,"\"id\"").replace(/\"\s*count\"\s*/g,"\"sum\"");
			}
		};
		/*
		获取商品价格
		当参数为空时候返回本地的商品总价格
		当传入的参数为一个id的时候，返回当前商品的总价格，如果本地没有这个id的商品则抛出错误
		
		*/
		this.getgoodsMoney = function(){
			var totalMoney = 0.00,//表示商品数量
				args = arguments,//参数列表
				l = args.length;//参数个数
			if( !!localStorage[this.name] ){
				var localGoodsList = JSON.parse( localStorage[this.name] );
				for ( i in localGoodsList ) {
		    		if( localGoodsList[i].status == 1 ){
			    		if (l) {
			    			for (var j in args) {
			    				if(args[j] == localGoodsList[i].id){
			    					totalMoney += parseInt( localGoodsList[i].sum, 10 )*parseFloat( localGoodsList[i].price, 10 );
			    				}
			    			}
			    		}else{
			    			totalMoney += parseInt( localGoodsList[i].sum, 10 )*parseFloat( localGoodsList[i].price, 10 );
			    		}
		    		}
		    	}
				return totalMoney.toFixed(2);
			}
			return 0;
		};
		/*
		获取商品个数
		当参数为空时候返回本地的商品总数
		当传入的参数为一个id的时候，返回当前商品的个数，如果本地没有这个id的商品则抛出错误
		
		*/
		this.getgoodsNum = function(){
			var total = 0,//表示商品数量
				args = arguments,//参数列表
				l = args.length;//参数个数
			if( !!localStorage[this.name] ){
				var localGoodsList = JSON.parse( localStorage[this.name] );
				for ( i in localGoodsList ) {
		    		if( localGoodsList[i].status == 1 ){
			    		if (l) {
			    			for (var j in args) {
			    				if(args[j] == localGoodsList[i].id){
			    					total += parseInt( localGoodsList[i].sum, 10 )
			    				}
			    			}
			    		}else{
			    			total += parseInt( localGoodsList[i].sum, 10 )
			    		}
		    		}
		    	}
				return total;
			}
			return 0;
		};
		/*
		 获取商品数据
		当参数为空时候返回本地的商品所有数据
		当传入的参数为一个'id'的时候，返回当前所有的商品的id列表
		当为多个参数的时候，返回list其中的每一个item包含所有的参数属性
		例如 参数为id,name,count
		则返回：[{id:1,name:a,count:2},{id:2,name:b,count:2},{id:3,name:c:count:2}]
		*/
		this.getGoodsDate = function(){
			var list = [],//表示商品列表
				item = {},//表示每个商品对象
				args = arguments,//参数列表
				l = args.length;//参数个数
			if( !!localStorage[this.name] ){
				var localGoodsList = JSON.parse( localStorage[this.name] );
				for ( i in localGoodsList ) {
					item = {};
		    		if( localGoodsList[i].status == 1 ){
			    		if (l) {
			    			for (var j in args) {
			    				var str = args[j];
			    				if (str == 'id') {
			    					str1 = 'goodsId'
			    				}else if (str == 'sum') {
			    					str1 = 'count'
			    				}else{
			    					str1 = str
			    				}
			    				item[str1] = localGoodsList[i][str]
			    			}
			    			list.push(item);
			    		}else{
			    			return JSON.parse( localStorage[this.name].replace(/\"\s*id\"\s*/g,"\"goodsId\"").replace(/\"\s*sum\"\s*/g,"\"count\"") );
			    		}
		    		}
		    	}
			}
			return list;
		};
		/*
		 返回本地购物车列表
		 * */
		this.getShopCarName = function(){
			if (!!localStorage.shopCar) {
				return (localStorage.shopCar).split(",");
			}
			return [];
		}
		/*
		删除购物车
		没有参数时候默认删除所有购物车
		有参数时候清除指定的购物车数据
		*/
		this.removeShopCar = function(t){
			var total = 0,//表示商品数量
				args = arguments,//参数列表
				l = args.length;//参数个数
			var item = t || this.name;
			/*if (!!localStorage.shopCar) {
				var list = (localStorage.shopCar).split(",");
				for (var i in list) {
					if (l) {
						for (var j in args) {
							if (list[i] == args[j]) {
								localStorage.removeItem(args[j])
							}
						}
					}else{
						localStorage.removeItem(list[i])
					}
				}
			}*/
			localStorage.removeItem(item);
		}
	}
	
	module.exports = shopCar;

});