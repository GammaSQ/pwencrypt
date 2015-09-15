var password = document.getElementById("password");
var pwForm = document.getElementById("pw_form");
pwForm.addEventListener("submit", function submission(event){
	self.port.emit("password_entered", password.value);
}, true);

self.port.on("show", function onShow(){
	password.focus();
});