var page = {
  loc: typeof window !== "undefined" && window.location || undefined
};

if (typeof page.loc !== "undefined" && page.loc.host === "awesome.net") {
  page.awesome = true;
}
