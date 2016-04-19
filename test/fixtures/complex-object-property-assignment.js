function reset() {
  if (page.container.tagName === "DIV") {
    page.container = null;
  }
}

var page = {
  ua: window.navigator.userAgent.toLowerCase(),
  container: document.getElementById('container')
};

if (page.ua === "pizza") {
  page.container.innerHTML = "Impossible!";
}
