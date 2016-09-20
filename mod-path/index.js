/**
 * 模块名转换为模块地址方法
 * 例如：zepto -> lib/zepto/index
 * 		part:form -> part/form/index
 */


function getType(name){
	if(/^(\.){1,2}\//.test(name)){
		return "relative";
	}else if(/^[\w\-:]+$/.test(name)){
		return "module-name";
	}else{
		return "normal";
	}
}

function transModName(name){
	var type = getType(name);
	// 非相对地址，缺省命名空间的，默认为lib
	if(type !== "relative" && name.indexOf(":") === -1){
		name = "lib:" + name;
	}
	// 转换命名空间连接符
	name = name.replace(/:/g, "/");
	// 如果是模块名，则追加默认index入口文件路径
	if(type === "module-name"){
		return name + "/index";
	}
	return name;
}

module.exports = transModName;