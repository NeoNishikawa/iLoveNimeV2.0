export function initScrollFade() {
  const targets = [...document.querySelectorAll("#hero, #discover, #detail, #collection")];
  if (!targets.length) return;
  targets.forEach((element, index) => { element.classList.add("scroll-fade"); if (index === 0) element.classList.add("scroll-fade--visible"); });
  let lastY = window.scrollY;
  let direction = "down";
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add("scroll-fade--visible"); else if (direction === "down" && entry.boundingClientRect.top < 0) entry.target.classList.remove("scroll-fade--visible"); else if (direction === "up" && entry.boundingClientRect.bottom > window.innerHeight) entry.target.classList.remove("scroll-fade--visible"); }), { threshold: 0.12, rootMargin: "-8% 0px -8% 0px" });
  targets.forEach((element) => observer.observe(element));
  let ticking = false;
  window.addEventListener("scroll", () => { direction = window.scrollY >= lastY ? "down" : "up"; lastY = window.scrollY; if (!ticking) { ticking = true; requestAnimationFrame(() => { document.documentElement.dataset.scrollDirection = direction; ticking = false; }); } }, { passive: true });
}
