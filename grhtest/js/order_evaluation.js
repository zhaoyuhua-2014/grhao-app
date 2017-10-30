$(document).ready(function(){
	//获取要评价的订单编码
	var orderCode=sessionStorage.getItem('orderCode');
	var source="orderCode"+orderCode;
	var sign=md5(source+"key"+common.secretKey()).toUpperCase();
	//console.log(source+","+sign)
	//goods商品质量shop商家服务dispatcher配送服务desc评价留言
	var goods=0,shop=0,dispatcher=0,desc="";
	//商品质量评价
	$('.eval_goods_quality').on('click',"img",function(){
	    var i=$('.eval_goods_quality img').index(this);       	           	   
	    if($('.eval_goods_quality img').eq(i).src='../img/img_xingxing_b.png'){
	    	for(var y=0;y<=i;y++){
	    	    $('.eval_goods_quality img').eq(y).attr('src','../img/img_xingxing_a.png');
	        }  
	    }
	    if($('.eval_goods_quality img').eq(i).src='../img/img_xingxing_a.png'){
	    	for(var z=4;z>i;z--){
	    	    $('.eval_goods_quality img').eq(z).attr('src','../img/img_xingxing_b.png');
	        }  
	    } 
	    goods=i+1;
   });
	//商品服务评价
	$('.eval_service img').on('click',function(){
	    var i=$('.eval_service img').index(this);
	    if($('.eval_service img').eq(i).src='../img/img_xingxing_b.png'){
	    	for(var y=0;y<=i;y++){
	    	    $('.eval_service img').eq(y).attr('src','../img/img_xingxing_a.png');
	        }  
	    }
	    if($('.eval_service img').eq(i).src='../img/img_xingxing_a.png'){
	    	for(var z=4;z>i;z--){
	    	    $('.eval_service img').eq(z).attr('src','../img/img_xingxing_b.png');
	        }  
	    }  
	    shop=i+1;
   });
	//商品配送评价
	$('.eval_distribution img').on('click',function(){
	    var i=$('.eval_distribution img').index(this);
	    if($('.eval_distribution img').eq(i).src='../img/img_xingxing_b.png'){
	    	for(var y=0;y<=i;y++){
	    	    $('.eval_distribution img').eq(y).attr('src','../img/img_xingxing_a.png');
	       }  
	    }
	    if($('.eval_distribution img').eq(i).src='../img/img_xingxing_a.png'){
	    	for(var z=4;z>i;z--){
	    	    $('.eval_distribution img').eq(z).attr('src','../img/img_xingxing_b.png');
	        }  
	    }  
	    dispatcher=i+1;
    });
	//评价提交
	function comment(orderCode,goods,shop,dispatcher,desc,sign,source){
		$.ajax({
			url:common.http,
			dataType:'jsonp',
			data:{
				method:'order_comment',
				orderCode:orderCode,
				goods:goods,
				shop:shop,
				dispatcher:dispatcher,
				desc:desc,
				tokenId:common.tokenId(),
				sign:sign,
				source:source
			},
			success:function(data){
               //console.log(JSON.stringify(data))
               if(data.statusCode="100000"){
               		window.location.href='order_management.html'
               }
			},
			error:function(data){
				commnon.prompt(data.strStatus)
			}
		});
	};
	//点击提交评价
	$('.eval_submit').on('click',function(){
		desc=$('.eval_intro_content').val();
		if(goods=='0'){
			common.prompt('商品质量评价不能为空')
		}else if(shop=='0'){
			common.prompt('商家服务评价不能为空')
		}else if(dispatcher=='0'){
			common.prompt('配送服务评价不能为空')
		}else{
			//console.log("orderCode="+orderCode+",goods="+goods+",shop"+shop+",dispatcher="+dispatcher+",desc="+desc)
			comment(orderCode,goods,shop,dispatcher,desc,sign,source)
		}		
	});
	//返回上一级
	$('.header_left').on('click',function(){
		window.location.href='order_management.html'
	});
})