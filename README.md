#Password Encrypter
A basic firefox addon, which uses a hashing-function on every <input type="password"> field.
On submit, the addon hashes the fields value + domain + a global salt.
The global salt is set once on install, then hashed 1000 times with SHA256 and saved encrypted. When starting the browser, the initial salt-value is used as password to decrypt the salt again.
Fields which should not be hashed can be deselected by checkbox.

TODO:
* QUESTION: Is there any insecurity in current procedure? Is using initial salt as password compromising security? (Yes, js isn't the right way to handle security, but currently this is a proof of concept and look at the point below!)
* use better crypto (currently Stanford Javascript Crypto Librabry), perhaps subtleCrypto?
* find a better solution for hashing-/password-popups.
* find a better layouting/display method to not break pages layout and to circumvent any keyloggers.
* make a user-interface for hashing manually/manipulating the hash. (eg. if the domainname changed for some reason.)
* make a button to reset/change salt.

How to use:
You need jpm, the mozilla addon- ... something. It's a node module and makes things work.

    npm install jpm -g

Then visit the pwencrypt-directory and execute

    jpm xpi

Then you can just open the newly created xpi in your favourite browser. (That should be the firefox)
A little suggestions: Run this on a different profile than what you usually use to browse the net.
If the popups are bothering you: don't worry, just browse to "about:addons" and remove the pwencrypt addon. And please let me know about the problem, adding your browser- and OS-version.
