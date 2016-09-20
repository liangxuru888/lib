/**
 * 局部loading蒙版
 * 用于局部数据加载时，使用带有loading图标的蒙版遮住
 */


var $ = require("zepto");
var template = require("./index.tpl");
require("./index.styl");

var cache = [];

function getMask(){
	return $(template()).appendTo(document.body);
}

module.exports = function(target, text){
	if(target.is(":hidden")){
		return {
			close: function(){}
		};
	}
	var container = target.parents(".mask-container");
	var mask = cache.pop() || getMask();
	var baseOffset = {
		left: 0,
		top: 0
	};
	if(container.length){
		mask.appendTo(container);
		baseOffset = container.offset();
		baseOffset.left -= container.scrollLeft();
		baseOffset.top -= container.scrollTop();
	}else{
		mask.appendTo(document.body);
	}

	var content = mask.find(".J-content");
	content.text(text || "").css({
		marginLeft: -content.width()
	});
	
	var bg = mask.find(".J-bg");

	var pos = target.offset();
	bg.removeClass("fn-hide");
	mask.css({
		left: pos.left - baseOffset.left,
		top: pos.top - baseOffset.top,
		width: target.width(),
		height: target.height()
	}).removeClass("fn-hide").removeClass("load-mask-hide");
	return {
		close: function(){
			mask.addClass("load-mask-hide");
			bg.addClass("fn-hide");
			setTimeout(function(){
				mask.addClass("fn-hide");
				cache.push(mask);
			}, 1000);
		}
	};
};