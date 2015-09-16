var salt1 = document.getElementById("salt1");
var salt2 = document.getElementById("salt2")
var saltForm = document.getElementById("salt_form");
saltForm.addEventListener("submit", function submission(event){
	self.port.emit("salt_entered", [salt1.value, salt2.value]);
}, true);
self.port.on("show", function onShow(){
	salt1.focus();
});