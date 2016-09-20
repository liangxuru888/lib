/**
 * 信息提示框,1秒之后自动消失
 */

var $ = require("zepto");
var template = {
	success: require("./success.tpl"),
	error: require("./error.tpl")
};
require("./main.styl");

function position(node){
	node.css({
		"margin-left": -node.outerWidth() / 2 + "px",
		"margin-top": (-node.outerHeight() / 2 + 50) + "px"
	});
}

module.exports = {
	success: function(message){
		var node = $(template.success({
			message: message || ""
		})).appendTo(document.body);

		iconfont(node);

		position(node);

		setTimeout(function(){
			node.addClass("message-box-hide");
			setTimeout(function(){
				node.remove();
			}, 300);
		}, 2000);
	},
	error: function(message){
		var node = $(template.error({
			message: message || ""
		})).appendTo(document.body);

		position(node);

		setTimeout(function(){
			node.addClass("message-box-hide");
			setTimeout(function(){
				node.remove();
			}, 1000);
		}, 1000);
	}
};