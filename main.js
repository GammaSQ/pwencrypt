// Import the page-mod API
var pageMod = require("sdk/page-mod");
// Import the self API
var self = require("sdk/self");
var data = self.data;

var panels = require("sdk/panel");

var tabs = require("sdk/tabs");

var sjcl = require("./data/sjcl.js");

var URL = require("sdk/url").URL;

var buttons = require("sdk/ui/button/action");

var clipboard = require("sdk/clipboard");

var button = buttons.ActionButton({
  id: "hash-my-input",
  label: "Generate a hashed password",
  icon: {
    "16": "./hash-icon-16.png",
    "32": "./hash-icon-32.png",
    "64": "./hash-icon-64.png",
    "128": "./hash-icon-128.png"
  },
  onClick: getHash
});

function getHash(state) {
  hashing_popup = panels.Panel({
    contentURL: data.url("hashing_popup.html"),
    contentScriptFile: data.url("hashing_popup.js")
  });

  hashing_popup.port.on("hash_me", function(vals){
  	var hash = sjcl.codec.base64.fromBits(sjcl.hash.sha256.hash(vals.host+vals.password+validSalt), true)
  	clipboard.set(hash);
  	hashing_popup.hide();
  });
  hashing_popup.show();
  hashing_popup.port.emit("init_host", URL(tabs.activeTab.url).host || '');
}

var storage = require("sdk/simple-storage");
if(!storage.storage.encSalt){
  storage.storage.encSalt = '';
}

var enter_password = panels.Panel({
  contentURL: data.url("enter_password.html"),
  contentScriptFile: data.url("enter_password.js")
})

var enter_salt = panels.Panel({
  contentURL: data.url("enter_salt.html"),
  contentScriptFile: data.url("enter_salt.js"),
  contextMenu:true,
  contentSryle:"position:static;"
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
    validSalt = salt;
    loadScript(salt);
    enter_password.hide();
  });

  enter_salt.port.on("salt_entered", function(salt){
    if(salt[0] != salt[1]){
      return;
    }
    var inter = salt[0];
    for(var i=0; i<1000; i++){
      inter = sjcl.hash.sha256.hash(inter);
    }
    hashSalt = sjcl.codec.base64.fromBits(inter, true);
    validSalt = hashSalt;
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
      contentScriptOptions: {"salt" : salt},
      contentScriptWhen:"ready"
    });
  }
}