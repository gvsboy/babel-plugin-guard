var element = null;

if (typeof window !== "undefined" && window.name === "cheese") {
  typeof document !== "undefined" && (element = document.querySelector(".cheese"));
}
