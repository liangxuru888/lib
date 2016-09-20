/**
 * time毫秒内连续调用的方法，只执行最后一次
 * 常用于状态同步、界面渲染相关的方法
 */
 
 
module.exports = function(time){
	var handler;
	time = time || 1;
	return function(fn){
		if(handler){
			clearTimeout(handler);
		}
		var self = this;
		var argus = Array.prototype.slice.call(arguments, 1);
		handler = setTimeout(function(){
			handler = null;
			fn.apply(self, argus);
		}, time);
	};
};