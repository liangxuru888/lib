/**
 * 等待多个异步方法执行完毕后执行某个方法
 */

var Promise = require("async/promise");


module.exports = function(list){
	var count = list.length,
		results = [];

	var promise = new Promise();

	if(list && count > 0){
		list.forEach(function(item, index){
			item(function(result){
				results[index] = result;
				count --;
				if(count === 0){
					promise.resolve.apply(promise, results);
				}
			});
		});
	}else{
		promise.resolve();
	}

	return promise;
};