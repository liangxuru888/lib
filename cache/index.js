var Class = require("class");
var $ = require("zepto");

// 是否支持
var hasSessionStorage = false;
try {
	hasSessionStorage = ('sessionStorage' in window) && window['sessionStorage'] !== null;
} catch (ex) { }

// ctrl + F5 清空
if(hasSessionStorage){
	$(document).on("keydown", function(e){
		if(e.keyCode == 116 && e.ctrlKey){
			sessionStorage.clear();
		}
	});
}

module.exports = Class.extend({
	init: function(isGlobal){
		this.cache = {};
		this.isGlobal = hasSessionStorage && isGlobal;
		// 判断是否禁用
		if(this.isGlobal && this.get("disabled-session-storage")){
			this.isGlobal = false;
		}
	},
	has: function(key){
		var value;

		if(this.isGlobal){
			value = this.get(key);
			return value !== null && typeof value !== "undefined" || (key in this.cache);
		}else{
			return key in this.cache;
		}
	},
	get: function(key){
		var value;
		var head;
		if(this.isGlobal){
			value = sessionStorage.getItem(key);

			if((value === null || typeof value === "undefined") && (key in this.cache)){
				value = this.cache[key];
			}

			if(value){
				value = value.split("@");
				if(value.length > 1){
					head = value.shift().split(":");
					value = value.join("@");

					if(+new Date() > +head[1]){
						this.remove(key);
						return;
					}

					if(head[0] === "json"){
						value = JSON.parse(value);
					}

					// if(/^json:/.test(value)){
					// 	value = JSON.parse(value.replace(/^json:/, ""));
					// }else{
					// 	value = value.replace(/^string:/, "");
					// }
				}else{
					this.remove(key);
					return;
				}
			}
			return value;
		}else{
			return this.cache[key];
		}
	},
	set: function(key, value){
		var type, expires;

		if(this.isGlobal){
			if(typeof value === "string"){
				//value = "string:" + value;
				type = "string";
			}else{
				//value = "json:" + JSON.stringify(value);
				type = "json";
				value = JSON.stringify(value);
			}

			if(!value){
				return;
			}

			// 默认隔天失效
			expires = new Date();
			expires = +new Date(expires.getFullYear(), expires.getMonth(), expires.getDate() + 1);

			value = [[type, expires].join(":"), value].join("@");

			try{
				sessionStorage.setItem(key,value);
			}catch(e){
				this.cache[key] = value;
			}
		}else{
			this.cache[key] = value;
		}
	},
	remove: function(key){
		if(this.isGlobal){
			sessionStorage.removeItem(key);
		}else{
			delete this.cache[key];
		}
	}
});