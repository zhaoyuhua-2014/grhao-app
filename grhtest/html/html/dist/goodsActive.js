require(['../require/config'],function(){
	require(['common'],function(common,Vue){
		
	    // 命名空间
	
	    pub = {};
	
	    pub.logined = common.isLogin(); // 是否登录
	
		pub.appData = JSON.parse(common.appData.getItem());
	
	
	    pub.openId = common.openId.getItem();
	    
	    pub.timer = null;
	    
	    
	    if( pub.logined ){
	        pub.tokenId = common.tokenIdfn(); 
	        pub.userData = common.user_datafn(); // 用户信息
	        pub.userId = pub.userData.cuserInfoid;
	        pub.source = "userId" + pub.userId 
	      
	
	        pub.sign = md5( pub.source + "key" + common.secretKeyfn() ).toUpperCase();
	
	        pub.mobile = pub.userData.mobile;
	        pub.userBasicParam = {
	            source : pub.source,
	            sign : pub.sign,
	            tokenId : pub.tokenId
	        };
	    }else{
	        
	    }
			
	    // 模块初始化
	    pub.init = function(){
	    	
	        
	        $("body").fadeIn(300)
	        $("body").on("click","a",function(){
	        	var aDom = $(this);
	        	
	        	common.jsInteractiveApp({
					name:'goToNextLevel',
					parameter:{
						title:'商品详情',
						url:'html/'+aDom.attr("a_href")
					}
				})
	        })
	    }
	   	
	   	pub.init();
	})
})
