var media = "(min-width: 360px)";

if (typeof window !== "undefined" && (!media || !window.matchMedia || window.matchMedia && window.matchMedia(media).matches)) {
  typeof window !== "undefined" && (window.name = "Hooray");
}
