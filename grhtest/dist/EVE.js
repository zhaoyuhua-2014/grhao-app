var common = {
	EVE:true
};
(function(){
	var m = document.createElement("meta"),
		h = document.getElementsByTagName("head")[0];
		m.setAttribute("http-equiv","Content-Security-Policy");
	if (common.EVE) {
		m.setAttribute("content","script-src 'self' 'unsafe-inline' 'unsafe-eval' http://api.grhao.com/server/api.do; style-src 'self' 'unsafe-inline' 'unsafe-eval' ");
	}else{
		m.setAttribute("content","script-src 'self' 'unsafe-inline' 'unsafe-eval' http://61.164.113.168:8090/grh_api/server/api.do; style-src 'self' 'unsafe-inline' 'unsafe-eval'");
	}
	
	var t = window.location.href;
	if(t.indexOf("store_map") < 0){
		h.appendChild(m)
	}
})(common);
