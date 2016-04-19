function woop() {
  var chrome = ua.match(/chrome/i) !== null;
}

var ua = window.navigator.userAgent.toLowerCase();
var isiPad = ua.match(/ipad/i) !== null;
