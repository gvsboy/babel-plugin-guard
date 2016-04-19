function woop() {
  var chrome = typeof ua !== "undefined" && ua.match(/chrome/i) !== null;
}

var ua = typeof window !== "undefined" && window.navigator.userAgent.toLowerCase() || undefined;
var isiPad = typeof ua !== "undefined" && ua.match(/ipad/i) !== null;
