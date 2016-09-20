var $ = require("zepto");
var transModName = require("mod-path");
var console = require("console");
require("ecma5");
require("./init-data");

function parseNode(selector, current){
	var originSelector = selector;

	selector = selector.split("|");

	var baseSelector,
		baseType,
		temp;

	var result;

	if(selector.length === 1){
		result = $(selector[0]);
	}else if(selector.length === 2){
		baseSelector = selector[0];
		selector = selector[1];

		if(baseSelector){
			baseSelector = baseSelector.split(":");
			baseType = baseSelector.shift();
			baseSelector = baseSelector.join(":");
		}else{
			baseType = "self";
		}

		switch(baseType){
			case "self":
				result = selector ? current.find(selector) : current;
				break;
			case "parent":
				if(baseSelector){
					temp = current.parents(baseSelector).eq(0);
					result = selector ? temp.find(selector) : temp;
				}else{
					temp = current.parent();
					result = selector ? temp.find(selector) : temp;
				}
				break;
		}
	}

	if(!result || result.length === 0){
		console.warn("parseNode Error: " + originSelector);
		console.log(current);
	}

	return result;
}

var tool = {
	parseNode: function(selector, current){
		var result;
		try{
			selector = selector.split(",").forEach(function(selector){
				var _result = parseNode(selector, current);
				if(result){
					result = result.add(_result);
				}else{
					result = _result;
				}
			});
		}catch(e){
			result = $();
		}
		return result;
	},
	transModName: transModName,
	ready: function(node, callback){
		if(node.data("control-ready")){
			callback(node.data("control"));
		}else{
			node.on("control-ready", function(){
				callback(node.data("control"));
			});
		}
	}
};

function parseControl(container, options){
	var controlNodes = container.find("*[data-control]");
	if(options.parseContainer && container.is("[data-control]")){
		controlNodes = controlNodes.add(container);
	}

	controlNodes.each(function(index, item){
		item = $(item);

		var hideParent = item.parents(".fn-hide");
		if(hideParent.length && $.contains(container[0], hideParent[0])){
			hideParent.eq(0).on("show", function(){
				ControlLoader($(this));
			});
			return;
		}

		var control = item.data("control"),
			controlId = item.data("control-id"),
			// 别名
			alias = {},
			hasAlias = false,
			// 参数列表
			data,
			// 别名参数
			params = {},
			// 公共参数
			commonParams = {},
			paramName,
			paramValue,
			paramTemp,
			controlName,
			aliasName;


		if(typeof control === "string" && !item.data("control-init")){
			item.data("control-init", true);
			// 分割多个控件
			control = control.split("|");
			// 解析别名
			control = control.map(function(control){
				var controlName;
				var aliasName;
				if(control.indexOf("=") === -1){
					return control;
				}else{
					hasAlias = true;
					control = control.split("=");
					aliasName = control[0];
					controlName = control[1];
					alias[aliasName] = controlName;
					params[aliasName] = {};
					return aliasName;
				}
			});
			data = item.datas();
			// 解析参数
			for(paramName in data){
				paramValue = data[paramName];
				paramName = paramName.replace(/([A-Z])/g, "-$1").toLowerCase();
				if(hasAlias){
					paramTemp = paramName.split("-");
					aliasName = paramTemp.shift();
					controlName = alias[aliasName];
					if(controlName && paramTemp.length){
						params[aliasName][paramTemp.join("-")] = paramValue;
						continue;
					}
				}
				commonParams[paramName] = paramValue;
			}
			// var pageParams;
			// // 解析页面参数
			// if(Params[controlId]){
			// 	pageParams = Params[controlId];
			// }
			// 解析控件
			var controls = {},
				first = true,
				controlCount = control.length;
				item.data("controls", controls);

			try{
				control.forEach(function(aliasName){
					var controlName = alias[aliasName] || aliasName,
						path = transModName(controlName),
						isMainControl = false;
					if(first){
						first = false;
						isMainControl = true;
					}
					require.async(path, function(control){
						if(control && control.parseControl){
							control.parseControl(item, $.extend({}, commonParams, params[aliasName] || {}), tool, function(control){
								controls[aliasName] = control;
								controls[path] = control;
								if(isMainControl){
									item.data("control", control);
								}
								if(--controlCount === 0){
									item.data("control-ready", true);
									item.triggerHandler("control-ready");
								}
							});
						}else{
							console.error(path);
						}
					});
				});
			}catch(e){
				console.error(e);
			}
		}
	});
}

function parseStyle(container, options){
	var styleNodes = container.find("*[data-style]");

	if(options.parseContainer && container.is("[data-style]")){
		styleNodes = styleNodes.add(container);
	}

	styleNodes.each(function(index, item){
		item = $(item);

		var hideParent = item.parents(".fn-hide");
		if(hideParent.length && $.contains(container[0], hideParent[0])){
			return;
		}

		var path;
		if(!item.data("style-init")){
			item.data("style-init", true);

			path = transModName(item.data("style"));
			if(!/\.css$/.test(path)){
				path += ".css";
			}

			require.async(path, function(){
				item.removeClass("fn-vhide");
			});
		}
	});
}
// ☀
var ControlLoader = module.exports = function(container, options){
	container = container || $(document.body).parent();
	options = options || {
		// 是否解析容器本身
		parseContainer: false
	};

	// 解析控件
	parseControl(container, options);

	// 解析样式
	parseStyle(container, options);

	// 解析提示
	container.find("input[placeholder]").each(function(index, item){
		item = $(item);

		if(!item.data("placeholder-inited")){
			require.async(transModName("form/placeholder"), function(placeholder){
				placeholder(item);
				item.data("placeholder-inited", true);
			});
		}
	});
};

ControlLoader.tool = tool;