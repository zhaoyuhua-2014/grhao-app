/*微信分享*/
define(function(require, exports, module){

	var common = require('lib/common.js?v=20000');
	var wx = require('weixinSDK'); // 微信SDK

	weixin = {};// 微信命名空间

	weixin.isReadyDone = false; //配置是否准备完毕
	weixin.count = 0; // 用于实时监测

	weixin.weixin_config = function ( url ){
		common.ajaxPost({
			method : 'weixin_config',
	        url : url
		}, function( d ){
			if( d.statusCode == '100200' ){
				alert("操作异常，请重新操作!");
			}else if( d.statusCode == '100000' ){
				var 
				result = d.data,
				appId = result.appId,
				signature = result.signature,
				timestamp = result.timestamp,
				nonceStr = result.nonceStr;
				wx.config({
				    debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
				    appId: appId, // 必填，公众号的唯一标识
				    timestamp : timestamp, // 必填，生成签名的时间戳
				    nonceStr: nonceStr, // 必填，生成签名的随机串
				    signature: signature,// 必填，签名，见附录1
				    jsApiList:["onMenuShareTimeline","onMenuShareAppMessage","onMenuShareQQ","onMenuShareQZone","hideMenuItems"] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
				});
				wx.ready(function(){weixin.isReadyDone = true;});
				wx.error(function(res){
					alert(common.JSONStr(res))// config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
				});
			}		
		}, function( d ){
			alert("分享插件升级中。。。");
		});
	};

	// data 为对象
	weixin.weixinShare = function( data, done, cancle ){
	   	data.url = document.location.href.split('#')[0]; // 分享后的链接地址
	    done = typeof done !== 'function' ? function(){} : done; // 判断done是否为函数 不是则默认匿名函数
	    cancle = typeof cancle !== 'function' ? function(){} : cancle;
	    if( !weixin.isReadyDone ){
	      	weixin.count++ < 5 && common.setMyTimeout(function(){ weixin.weixinShare( data, done, cancle)},1000 );
	        return;
	    }

	    weixin.count = 0;
	    wx.onMenuShareTimeline({
	        title: data.title, // 分享标题
	        link: data.url, // 分享之后的链接
	        imgUrl: data.imgUrl, // 分享图标
	        success: done,
	        cancel: cancle
	    });
	    wx.onMenuShareAppMessage({
	        title: data.title,
	        desc: data.desc,
	        link: data.url,
	        imgUrl: data.imgUrl,
	        type: '', // 分享类型,music、video或link，不填默认为link
	        dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
	        success: done,
	        cancel: cancle
	    });
	    wx.onMenuShareQQ({
	        title: data.title,
	        desc: data.desc,
	        link: data.url,
	        imgUrl: data.imgUrl, // 分享图标
	        success: done,
	        cancel: cancle
	    });
	    wx.onMenuShareWeibo({
	        title: data.title,
	        desc: data.desc,
	        link: data.url,
	        imgUrl: data.imgUrl,
	        success: done,
	        cancel: cancle
	    });
	}
	weixin.weixin_config( location.href.split('#')[0] );
	weixin.weixinShare( common.shareData );
	module.exports = weixin;
});



