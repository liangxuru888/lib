var $ = require("zepto");
var modPath = require("mod-path");
var Cache = require("cache");
var ControlLoader = require("control-loader");
var console = require("console");

var sep = ":";
var cache = new Cache(false);

var clearCacheKey = +new Date();

var readys = {};

var hostname = "http://" + location.hostname + "/";

var apiHost = "/commonapi2/";

var env = (function(hostname){
	if(/test/.test(location.hostname)){
		return "test";
	}
})(location.hostname);

var dataBase;
if(env === "test"){
	dataBase = "static:http://test.weixin.com/";
}


module.exports = function(path, callback, node, config){
	config = config || {
		noCache: false
	};
	
	if(!path){
		console.error("no path");
		return;
	}

	var transPath = path;

	path = transPath;

	var type, name;

	if(/^(url|static|selector)\:/.test(path)){
		name = path.split(sep);
		type = name.shift();
		name = name.join(sep);
	}else{
		type = "url";
		name = path;
		path = type + ":" + name;
	}

	if(type !== "url"){
		config.noCache = false;
	}

	// if(!type){
	// 	console.error("data type error:" + path);
	// }

	var absolutePath = (function(name){
		if(type === "url" && !/^\//.test(name)){
			path = location.pathname.split("/");
			path.pop();
			path.push(name);
			return "url:" + path.join("/");
		}else{
			return path;
		}
	})(name);


	var _callback = function(data){
		if(!config.noCache && absolutePath.indexOf("?") === -1){
			cache.set(absolutePath, data);
		}
		callback(data);
	};

	if(cache.has(absolutePath)){
		callback(cache.get(absolutePath));
	}else if(readys[path]){
		readys[path].push(_callback);
	}else{
		switch(type){
			case "static":
				if(!/^http:\/\//.test(name)){
					if(!/data\d?:/.test(name)){
						name = "data:" + name;
					}
					name = modPath(name);
				}
				readys[path] = [_callback];
				// 由于data2为后端程序生成，不带版本号，并且模块头为动态路径，所以添加清缓存逻辑
				if(/(^|\/)data2\//.test(name)){
					name += ".js?_=" + clearCacheKey;
				}
				require.async(name, function(data){
					//_callback(data);
					readys[path].forEach(function(item){
						item(data);
					});
					delete readys[path];
				});
				break;
			case "url":
				readys[path] = [_callback];

				$.ajax({
					url: name,
					dataType: /http\:\/\//.test(name) && name.indexOf(hostname) === -1 ? "jsonp" : "json",
					success: function(data){
						if(data.code == 200){
							data = data.value;
							//_callback(data.value);
							readys[path].forEach(function(item){
								item(data);
							});
							delete readys[path];
						}
					}
				});
				break;
			case "selector":
				(function(selector){
					var key = "data-cache:" + selector;
					if(node.data(key)){
						callback(node.data(key));
						return;
					}

					var target = ControlLoader.tool.parseNode(selector, node);
					var data = target.html();
					data = JSON.parse(data);
					if(data){
						node.data(key, data.value);
						callback(data.value);
					}
				})(name);
				break;
		}
	}
};