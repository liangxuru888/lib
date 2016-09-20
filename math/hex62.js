/**
 * 62进制与10进制互转
 * 一般用于字段长度压缩
 */
 
 
var Index = [],
	i;
// 数字
for(i = 48; i < 58; i ++){
	Index.push(String.fromCharCode(i));
}
// 大写
for(i = 65; i < 91; i ++){
	Index.push(String.fromCharCode(i));
}
// 小写
for(i = 97; i < 123; i ++){
	Index.push(String.fromCharCode(i));
}
var Hash = {};
for(i = 0; i < 62; i ++){
	Hash[Index[i]] = i;
}

module.exports = {
	to62: function(num){
		if(num == 0)
			return "0";

		var result = [],
			item = 1;
		while(num >= item){
			result.unshift(Index[(num % (item * 62)) / item | 0]);
			item *= 62;
		}
		return result.join("");
	},
	to10: function(num){
		var result = 0;

		for(var i = 0, l = num.length; i < l; i ++){
			result += Hash[num.charAt(i)] * Math.pow(62, l - i - 1);
		}

		return result;
	}
};