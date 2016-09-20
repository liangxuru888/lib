// 状态枚举
var STATUS = {
	UNFULFILLED: 0,
	RESOLVED: 1
};

function Promise() {
	this.listeners = [];
}

Promise.prototype = {
	status: STATUS.UNFULFILLED,
	then: function(listener){
		if(this.status === STATUS.RESOLVED){
			listener.apply(this, this.resolveParams);
		}else{
			this.listeners.push(listener);
		}
		return this;
	},
	resolve: function(){
		this.resolveParams = arguments;
		this.status = STATUS.RESOLVED;
		this.listeners.forEach(function(listener){
			listener.apply(this, this.resolveParams);
		}.bind(this));
	}
};

module.exports = Promise;