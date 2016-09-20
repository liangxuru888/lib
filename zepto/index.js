var zepto = require("./core");

zepto._ajax = zepto.ajax;

zepto.ajax = function(options){
	var success = options.success || function(){},
		error = options.error || function(){},
		complete = options.complete || function(){};

	options.dataType = options.dataType || "json";
	
	if(options.dataType === "json"){
		if(options.data){
			options.type = "POST";
			if(options.postDataType === "json"){
				options.data = JSON.stringify(options.data);
				options.contentType = "application/json;charset=utf-8";
			}
		}
		
		options.success = function(result){
			var code = result.status;
			if(code >= 200 && code < 300 || code == 304){
				success(result.data);
			}else if(code >= 500 && code < 600){
				require.async("message/index", function(message){
					message.error(result.data || result.data);
				});
				error(result);
			}else if(code == 302){
			}else{
				error();
			}
		};
	}
	return zepto._ajax(options);
};

zepto.fn.datas = function () {
	var data = new Array(),
		elem = this[0],
		attrs = elem && elem.attributes,
		i = attrs.length;
		while ( i-- ) {
			if ( attrs[ i ] ) {
				name = attrs[ i ].name;
				if ( name.indexOf( "data-" ) === 0 ) {
					name = zepto.camelCase( name.slice(5) );
					data[name] = attrs[ i ].value;
				}
			}
		}
	return data;
}

zepto.fn.is = function(selector){
	return ($(this).css('visibility') == 'hidden' || $(this).css('display') == 'none');
}

module.exports = zepto;