var media = "(min-width: 360px)";

if (!media || !window.matchMedia || (window.matchMedia && window.matchMedia(media).matches)) {
  window.name = "Hooray";
}
