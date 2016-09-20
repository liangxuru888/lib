/**
 * 日期相关操作
 */
 
 
module.exports = function(date){
	return {
		addDay: function(day){
			var _date;
			if(date){
				_date = date.split("-");
				_date = new Date(_date[0], _date[1] - 1, +_date[2] + +day);
				return [_date.getFullYear(), _date.getMonth() + 1, _date.getDate()].join("-");
			}else{
				return "";
			}
		}
	};
};