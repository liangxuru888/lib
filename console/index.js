module.exports = typeof console === "undefined" ? {
	log: function(){},
	error: function(){},
	warn: function(){}
} : console;