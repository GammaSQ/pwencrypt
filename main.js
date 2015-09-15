// Import the page-mod API
var pageMod = require("sdk/page-mod");
// Import the self API
var self = require("sdk/self");
var data = self.data;

var sjcl = require("./data/sjcl.js");

var storage = require("sdk/simple-storage");
if(!storage.storage.encSalt){
  storage.storage.encSalt = '';
}

var enter_password = require("sdk/panel").Panel({
  contentURL: data.url("enter_password.html"),
  contetScriptFile: data.url("enter_password.js")
})

var enter_salt = require("sdk/panel").Panel({
  contentURL: data.url("enter_salt.html"),
  contentScriptFile: data.url("enter_salt.js")
})

exports.main = function(options){
  enter_password.on("show", function(){
    enter_password.port.emit("show");
  });

  enter_salt.on("show", function(){
    enter_salt.port.emit("show");
  });

  enter_password.port.on("password_entered", function(password){
    //salt = encrypt(storage.storage.encSalt, password);
    loadScript(salt);
  });

  enter_salt.port.on("salt_entered", function(salt){
  	enter_salt.hide();
  	if(salt[0] != salt[1]){
  	  return enter_salt.show();
  	}
  	var inter = salt[0];
  	for(var i=0; i<1000; i++){
      inter = sjcl.hash.sha256.hash(inter);
  	}
    hashSalt = sjcl.codec.base64.fromBits(inter);
    loadScript(hashSalt);
    //storage.storage.encSalt = encrypt(hashSalt, salt);
  });

  if(storage.storage.encSalt){
    enter_password.show();
  } else {
    enter_salt.show();
  }

  function loadScript(salt){
    pageMod.PageMod({
      include:"*",
      contentScriptFile: data.url('PWhash.js'),
      contentScriptOptions: {"salt" : salt}
    });
  }
}


salt = '';



// Create a page-mod
// It will run a script whenever a ".org" URL is loaded
// The script replaces the page contents with a message
/*exports.main = function (options){
  // Import the page-mod API
  var pageMod = require("sdk/page-mod");
  // Import the self API
  var self = require("sdk/self");
  pageMod.PageMod({
    include: "*",
    contentScriptFile: self.data.url("PWhash.js")
  });
}*/