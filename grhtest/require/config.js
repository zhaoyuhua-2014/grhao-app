define(function(){
	require.config(
	    {
	    	urlArgs: function(id, url) {
		        var args = 'v=20200116';
		        if (url.indexOf('view.html') != -1) {
		            args = 'v=2'
		        }
		
		        return (url.indexOf('?') === -1 ? '?' : '&') + args;
		    },
	        paths: {
	            'jquery':'../outside/jquery-1.8.3.min',
	            'common':'../dist/common',
	            'mdData':'../outside/mdData',
	            'mobileUi':'../outside/mobile-util',
	            'shar1':'../outside/jquery.sha1',
	            'swiperJS':'../outside/swiper-3.3.1.min',
	            'goshopCar':'../dist/goshopCar',
	            'exif':'../outside/exif',
	            'LArea':'../outside/LArea',
	            'LAreaData':'../outside/LAreaData',
	            'iscroll':'../outside/iscroll',
	            'dropload':'../outside/dropload',
	            'pull':'../outside/pull',
	            'map1':'http://webapi.amap.com/maps?v=1.3&key=68f1f7850d75a2c422f417cc77331395',
	            'score':'../dist/score',
	            'addMap':'../dist/addMapPicker.js?v=20180606',
	            'module':'../outside/module',
	            'test':'../outside/test',
	            'shopCar':'../dist/shopCar',
	            'groupOrder':'../dist/groupOrder',
	            'seckillSettlement':'../dist/seckillSettlement',
	            
	            'farmCanves':"../dist/farmCanves",
	            'vue':"../outside/vue",
	            'pixi':"../outside/pixi"
	            
	        },
	        shim: {
			    farmCanves: {
			    	deps: ['pixi'],
			      	init: function() {
			        	return {
				          	mainView: mainView,
				          	maskView: maskView
				        }
			      	}
			    }
			}
	    }
	);
	
})