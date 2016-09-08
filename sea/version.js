;(function(){
  var seaData = seajs.data;
  var version = seaData.version = {};
  // 配置版本文件
  seajs.version = function(groupName, _version){
    for(var modName in _version){
      version[[groupName, modName].join("/")] = _version[modName];
    }
  };

  seajs.on("load", function(uris){
    for(var i = 0, l = uris.length; i < l; i ++){
      uris[i] = addVersion(uris[i]);
    }
  });

  seajs.on("fetch", function(data){
    data.uri = addVersion(data.uri);
  });

  function addVersion(uri){
    var groupAndMod = uri.replace(seaData.base, "").replace(/^\/+/, "").split("/").slice(0, 2).join("/"),
      v;
    if(v = version[groupAndMod]){
      return uri.replace(groupAndMod, [groupAndMod, v].join("/"));
    }
    return uri;
  }
})();