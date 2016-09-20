/**
 * 将大的循环拆分成单位为unit的小循环
 * 防止大循环执行过久，卡页面，影响用户操作
 */
 
 
module.exports = function(list, fn, callback, unit){
	unit = unit || 100;
	var length = list.length,
		stop = false;

	(function(start){
		if(stop)
			return;

		for(var end = Math.min(length, start + unit); start < end; start ++){
			fn(list[start], start);
		}
		if(start < length){
			var self = arguments.callee;
			setTimeout(function(){
				self(start);
			}, 50);
		}else{
			callback && callback();
		}
	})(0);

	return {
		stop: function(){
			stop = true;
			callback && callback();
		}
	};
};