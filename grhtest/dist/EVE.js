var common = {
	EVE:true
};
(function(){
	var m = document.createElement("meta"),
		h = document.getElementsByTagName("head")[0];
		m.setAttribute("http-equiv","Content-Security-Policy");
	if (common.EVE) {
		m.setAttribute("content","script-src 'self' 'unsafe-inline' 'unsafe-eval' http://webapi.amap.com/ http://restapi.amap.com/ http://api.grhao.com/server/api.do; style-src 'self' 'unsafe-inline' 'unsafe-eval' http://webapi.amap.com/theme/v1.3/style1503546983737.css");
	}else{
		m.setAttribute("content","script-src 'self' 'unsafe-inline' 'unsafe-eval' http://restapi.amap.com/ http://webapi.amap.com/ http://61.164.118.194:8090/grh_api/server/api.do; style-src 'self' 'unsafe-inline' 'unsafe-eval' http://webapi.amap.com/theme/v1.3/style1503546983737.css");
	}
	
	var t = window.location.href;
	console.log(t.indexOf("store_map"));
	if(t.indexOf("store_map") < 0){
		h.appendChild(m)
	}
})(common);
