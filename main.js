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
  contentScriptFile: data.url("enter_password.js")
})

var enter_salt = require("sdk/panel").Panel({
  contentURL: data.url("enter_salt.html"),
  contentScriptFile: data.url("enter_salt.js")
})

exports.main = function(options){
  validSalt = false;

  if(options.loadReason == "install"){
    storage.storage.encSalt = '';
  }

  enter_password.on("show", function(){
    enter_password.port.emit("show");
  });

  enter_salt.on("show", function(){
    enter_salt.port.emit("show");
  });

  enter_password.port.on("password_entered", function(password){
  	var salt = '';
    try{
      salt = sjcl.decrypt(password, storage.storage.encSalt);
    } catch (err){
      if(err instanceof sjcl.exception.invalid || err instanceof sjcl.exception.corrupt)
        return;
      else
        throw err;
    }
    validSalt = true;
    loadScript(salt);
    enter_password.hide();
  });

  enter_salt.port.on("salt_entered", function(salt){
    if(salt[0] != salt[1]){
      return;
    }
    validSalt = true;
    var inter = salt[0];
    for(var i=0; i<1000; i++){
      inter = sjcl.hash.sha256.hash(inter);
    }
    hashSalt = sjcl.codec.base64.fromBits(inter, true);
    loadScript(hashSalt);
    enter_salt.hide();
    storage.storage.encSalt = sjcl.encrypt(salt[0], hashSalt);
  });

  enter_salt.on("hide", function(){
    if(validSalt) return;
    enter_salt.show();
  })

  enter_password.on("hide", function(){
    if(validSalt) return;
    enter_password.show();
  })

  if(storage.storage.encSalt){
    enter_password.show({focus:true});
  } else {
    enter_salt.show({focus:true});
  }

  function loadScript(salt){
    pageMod.PageMod({
      include:"*",
      contentScriptFile: data.url('PWhash.js'),
      contentScriptOptions: {"salt" : salt}
    });
  }
}