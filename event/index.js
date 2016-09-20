/**
	事件特性：

	全部记忆(memory-all)：
		先触发事件，后绑定事件
		场景：运动轨迹
	记忆最后一次(memory)：
		先触发事件，后绑定事件，只处理最后一次触发操作
		场景：城市切换
	只能触发一次(once)：
		场景：domready
	遇到返回值为false，停止之后的处理程序(stopOnFalse):
		场景：一系列表单验证
	返回值列表(results):
		场景：submit
	处理程序排序(level):
		让后绑定的处理程序先执行
		场景：
	异步处理(async):
		事件出发后，程序异步执行
		场景：界面显示、大计算操作
	异步处理之前的最后一次触发(onlyLast):
		场景：调整界面渲染
	执行环境(context):
		切换处理程序执行环境（this值）
		场景：DOM事件绑定
*/

var flagsCache = {};

/*
	flags:
		memory
		memory-all
		once
		stopOnFalse
		sort
*/
function createFlags(flags) {
    var object = flagsCache[flags] = {},
        i, l;
    flags = flags.split(/\s+/);
    for (i = 0, l = flags.length; i < l; i++) {
        object[flags[i]] = true;
    }
    return object;
}

// 检测事件数据存放包是否初始化
function checkEventPackage(){
	if(!this.eventPackage){
		this.eventPackage = {
			// 执行环境
			context: this,
			// 事件
			events: {},
			// 事件句柄
			handler: 0,
			// 事件句柄缓存
			handlerCache: {},
			// 事件特性
			flags: {},
			// 单次执行事件执行状态
			onceRun: {},
			// 记忆事件执行记录
			memoryCache: {},
			// 执行状态
			status: {}
		};
	}
}

function sort(list){
	list.sort(function(fn1, fn2){
		return fn2.level - fn1.level;
	});
}

// 触发事件（内部）
// 返回执行结果数组
function triggerEvent(eventName, argus){
	var eventPackage = this.eventPackage,
		fns = eventPackage.events[eventName],
		context = eventPackage.context,
		status = eventPackage.status[eventName],
		results = [],
		i, l;
	if(fns){
		//l = fns.length;
		status.firing = true;
		status.length = fns.length;
		status.callback = [];

		if(eventPackage.flags[eventName]["stopOnFalse"]){
			for( ; status.index < status.length; status.index ++){
				// 遇到返回值为false的，停止执行后续处理
				if(results.push(fns[status.index].apply(context, argus)) === false){
					break;
				}
			}
			l = status.index + 1;
			for(i = 0; i < l; i ++){
				if(fns[i].once){
					fns.splice(i, 1);
					i --;
					l --;
				}
			}
		}else{
			for(; status.index < status.length; status.index ++){
				results.push(fns[status.index].apply(context, argus));
			}
			l = status.length;
			for(i = 0; i < l; i ++){
				if(fns[i].once){
					fns.splice(i, 1);
					i --;
					l --;
				}
			}
		}

		for(i = 0, l = status.callback.length; i < l; i ++){
			status.callback[i]();
		}

		status.index = 0;
		status.firing = false;
	}
	return results;
}

module.exports = {
	// 设置事件处理环境
	setEventContext: function(context){
		checkEventPackage.call(this);
		
		this.eventPackage.context = context;
	},
	/**
		新建事件
	*/
	newEvent: function(eventName, flags){
		checkEventPackage.call(this);

		var eventPackage = this.eventPackage;
		// 设置事件特性
		eventPackage.flags[eventName] = flags = flags ? (flagsCache[flags] || createFlags(flags)) : {};
		// 初始化单次执行状态
		if(flags["once"]){
			eventPackage.onceRun[eventName] = true;
		}
		// 初始化记忆缓存
		if(flags["memory"] || flags["memory-all"]){
			eventPackage.memoryCache[eventName] = [];
		}

		eventPackage.status[eventName] = {
			index: 0,
			length: 0,
			firing: false,
			callback: []
		};
	},
	/** 添加事件
		eventName  事件名
		fn  事件处理函数
		level  事件执行顺序 level值越大越优先执行
	*/
	addEvent: function(eventName, fn, level, once){
		if(!this.eventPackage || !this.eventPackage.flags[eventName])
			return;

		var eventPackage = this.eventPackage,
			events = eventPackage.events,
			flags = eventPackage.flags[eventName],
			context = eventPackage.context,
			status = eventPackage.status[eventName];

		if(flags["memory"] || flags["memory-all"]){
			var memoryCache = eventPackage.memoryCache[eventName],
				l = memoryCache.length;
			if(l){
				if(once){
					fn.apply(context, memoryCache[0]);
					return -1;
				}
				for(var i = 0; i < l; i ++){
					fn.apply(context, memoryCache[i]);
				}
			}
		}

		(events[eventName] || (events[eventName] = [])).push(fn);
		if(status.firing){
			status.length ++;
		}

		if(once){
			fn.once = true;
		}

		if(flags["sort"]){
			fn.level = level || 0;
			if(status.firing){
				status.callback.push(function(){
					sort(events[eventName]);
				});
			}else{
				sort(events[eventName]);
			}
		}

		eventPackage.handlerCache[++ eventPackage.handler] = [eventName, fn];
		return eventPackage.handler;
	},
	onceEvent: function(eventName, fn, level){
		return this.addEvent(eventName, fn, level, true);
	},
	/** 添加异步事件
		onlyLast 异步处理函数执行时，只执行之前最后一次事件触发
	*/
	addEventAsync: function(eventName, fn, onlyLast, level, once){
		// 异步事件处理程序
		var cache = this.eventPackage.handlerCache,
			handler;

		return handler = this.addEvent(eventName, function(){
			var cacheHandler = cache[handler];
			if(onlyLast && cacheHandler.asyncHandler){
				clearTimeout(cacheHandler.asyncHandler);
			}
			var argus = arguments,
				_this = this,
				result = {
					type: "asyncResult",
					value: null,
					list: [],
					get: function(fn){
						if(this.list){
							this.list.push(fn);
						}else{
							fn(this.value);
						}
					},
					set: function(value){
						this.value = value;
						for(var i = 0, l = this.list.length; i < l; i ++){
							this.list[i](value);
						}
						delete this.list;
					}
				};
			cacheHandler.asyncHandler = setTimeout(function(){
				delete cacheHandler.asyncHandler;
				result.set(fn.apply(_this, argus));
			}, 1);
			return result;
		}, level, once);
	},
	onceEventAsync: function(eventName, fn, onlyLast, level){
		return this.addEventAsync(eventName, fn, onlyLast, level, true);
	},
	/** 移除事件
		1、number  移除事件句柄等于number的事件
		2、string function  移除事件名等于string和处理函数等于function的事件
		3、string  移除事件名等于string的所有事件
		4、undefined  移除所有事件
	*/
	removeEvent: function(){
		var eventPackage;
		
        if (!(eventPackage = this.eventPackage)){
        	return false;
        }

        var events = eventPackage.events,
        	cache = eventPackage.handlerCache,
        	status,
        	argus0 = arguments[0],
        	argus0type = typeof argus0,
        	argus1 = arguments[1],
        	argus1type = typeof argus1;

        var i, l, key, fns;
        // 通过事件绑定句柄移除事件
        if (argus0type === "number") {
            if(cache[argus0]){
            	arguments.callee.apply(this, cache[argus0]);
            }
        }
        // 通过事件名和处理函数移除事件
        else if (argus0type === "string" && argus1type === "function") {
            fns = events[argus0];
            if(!fns){
            	return false;
            }
            for(i = 0, l = fns.length; i < l; i ++){
            	if(argus1 === fns[i]){
            		fns.splice(i, 1);
            		break;
            	}
            }
            // 移除句柄缓存
            for(key in cache){
            	if(argus0 === cache[key][0] && argus1 === cache[key][1]){
            		delete cache[key];
            		break;
            	}
            }
            status = eventPackage.status[argus0];
            if(status.firing){
            	if(i < status.length){
            		status.length --;
            	}
            	if(i <= status.index){
            		status.index --;
            	}
            }
        }
        // 移除事件名等于eventName的所有事件
        else if (argus0type === "string" && argus1type === "undefined") {
            events[argus0] = [];
            // 移除句柄缓存
            for(key in cache){
            	if(argus0 === cache[key][0]){
            		delete cache[key];
            	}
            }
            status = eventPackage.status[argus0];
            if(status.firing){
            	status.length = status.index = 0;
            }
        }
        // 移除所有事件
        else if (argus0type === "undefined") {
            for(key in eventPackage.flags){
            	arguments.callee.call(this, key);
            }
        }
	},
	// 触发事件
	// 返回执行结果数组
	triggerEvent: function(eventName){
		if(!this.eventPackage || !this.eventPackage.flags[eventName])
			return;
		var argus = Array.prototype.slice.call(arguments, 1),
			run = true,
			eventPackage = this.eventPackage,
			flags = eventPackage.flags[eventName];

		if(flags["once"]){
			if(eventPackage.onceRun[eventName]){
				delete eventPackage.onceRun[eventName];
			
				if(flags["memory"] || flags["memory-all"]){
					eventPackage.memoryCache[eventName] = [argus];
				}
			}else{
				run = false;
			}
		}else{
			if(flags["memory"]){
				eventPackage.memoryCache[eventName] = [argus];
			}else if(flags["memory-all"]){
				eventPackage.memoryCache[eventName].push(argus);
			}
		}

		var result = [];
		if(run){
			result = triggerEvent.call(this, eventName, argus);
		}

		return result;
	},
	// 清除事件记忆
	clearEventMemory: function(eventName){
		var memoryCache = this.eventPackage.memoryCache;
		if(eventName){
			memoryCache[eventName] = [];
		}else{
			for(eventName in memoryCache)
				memoryCache[eventName] = [];
		}
	}
};