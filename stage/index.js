var Class = require("class");
var Event = require("event");
var $ = require("zepto");
var Vue = require("vue");
var dataLoad = require("data-load");
var controlLoader = require("control-loader");
var lazylist = require("async/lazylist");
var loadMask = require("load-mask");

var Stage = module.exports = Class.extend(Event).extend({
	init: function(options){
		$.extend(this, {
			container: null,
			queryUrl: ""
		}, options);

		this.newEvent("refresh");
		this.refresh();
	},
	refresh: function(){
		var self = this;

		var loadmask = loadMask(self.container);
			lazylist([function(callback){
				self.request(callback);
			}]).then(function(data){
				loadmask.close();
				self.render(data);
				self.triggerEvent("refresh");
			});
	},
	request: function(callback){
		if(/^(selector|static)\:/.test(this.queryUrl)){
			dataLoad(this.queryUrl, function(data){
				callback(data);
			}, this.container);
		} else {
			$.ajax({
				url: this.queryUrl,
				dataType: "json",
				data: this.postData,
				success: function(result){
					callback(result);
				}
			});
		}
	},
	render: function(data){
		var vm = new Vue({
			el: this.container.get(0),
			data: data
		}); 
		return vm;
	}
});

Stage.parseControl = function(node, params, tool, callback){
	callback(new Stage({
		container: node,
		queryUrl: params["query-url"]
	}));
};