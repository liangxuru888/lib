/**
 * 异步队列
 * 多个异步方法顺序执行
 */
 
 
module.exports = function(list, callback){
	var self = function(){
		var task;

		if(task = list.shift()){
			task(self);
		}else{
			callback && callback();
		}
	};

	self();
};