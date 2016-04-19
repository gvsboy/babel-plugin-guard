function reset() {
  if (typeof page.container !== "undefined" && page.container.tagName === "DIV") {
    page.container = null;
  }
}

var page = {
  ua: typeof window !== "undefined" && window.navigator.userAgent.toLowerCase() || undefined,
  container: typeof document !== "undefined" && document.getElementById('container') || undefined
};

if (typeof page.ua !== "undefined" && page.ua === "pizza") {
  typeof page.container !== "undefined" && (page.container.innerHTML = "Impossible!");
}
