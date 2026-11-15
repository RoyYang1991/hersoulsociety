/* 一頁式連續感：固定底圖跟著捲動慢慢變化。
   --dawn：離開主打活動（夜）之後，從 0 走到 1，玫瑰粉的破曉色調跟著淡出，變成暖金清晨。
   --p   ：整頁捲動進度，底圖跟著微微上移，像太陽慢慢升起。 */
(() => {
  const scene = document.getElementById("scene");
  if (!scene) return;
  const night = document.getElementById("newyear");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v) => Math.max(0, Math.min(1, v));
  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = innerHeight, max = Math.max(1, document.documentElement.scrollHeight - vh);
    const from = night ? night.offsetTop + night.offsetHeight - vh * 1.4 : 0; // 夜色開始化開的位置
    scene.style.setProperty("--dawn", clamp((scrollY - from) / Math.max(1, (max - from) * 0.75)).toFixed(3));
    scene.style.setProperty("--p", reduce ? 1 : clamp(scrollY / max).toFixed(3));
  };
  addEventListener("scroll", () => ticking || ((ticking = true), requestAnimationFrame(update)), { passive: true });
  addEventListener("resize", update);
  addEventListener("load", update);
  update();
})();
