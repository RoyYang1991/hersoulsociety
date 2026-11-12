/* 首頁第一屏的主打活動：倒數、海報傾斜、星空。換主打活動時，改 START／END 和 index.html 的 #newyear 區塊。 */
(() => {
  const sec = document.getElementById("newyear");
  if (!sec) return;
  const $ = (id) => document.getElementById(id);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 倒數：2027-01-01 14:00 台北時間 */
  const START = Date.parse("2027-01-01T14:00:00+08:00"), END = Date.parse("2027-01-01T17:00:00+08:00");
  const pad = (n) => String(n).padStart(2, "0");
  let timer;
  const tick = () => {
    const now = Date.now();
    if (now >= START) {
      $("nyCount").innerHTML = `<span class="cl">${now < END ? "音樂會正在進行中" : "感謝每一位有緣人，這場祝福已圓滿"}</span>`;
      return clearInterval(timer);
    }
    let s = Math.floor((START - now) / 1000);
    $("cdD").textContent = Math.floor(s / 86400); s %= 86400;
    $("cdH").textContent = pad(Math.floor(s / 3600)); s %= 3600;
    $("cdM").textContent = pad(Math.floor(s / 60));
    $("cdS").textContent = pad(s % 60);
  };
  timer = setInterval(tick, 1000);
  tick();

  /* 海報跟著游標微微傾斜、反光 */
  const tilt = $("nyTilt");
  if (!reduce && matchMedia("(hover:hover)").matches) {
    tilt.addEventListener("pointermove", (e) => {
      const r = tilt.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      tilt.style.setProperty("--ry", (px - 0.5) * 10 + "deg");
      tilt.style.setProperty("--rx", (0.5 - py) * 8 + "deg");
      tilt.style.setProperty("--mx", px * 100 + "%");
      tilt.style.setProperty("--my", py * 100 + "%");
    });
    tilt.addEventListener("pointerleave", () => { tilt.style.setProperty("--rx", "0deg"); tilt.style.setProperty("--ry", "0deg"); });
  }

  /* 保險：捲動顯現若沒被觸發（部分瀏覽器），依位置自己補上，內容一定會出現 */
  const rvs = [...sec.querySelectorAll(".reveal")];
  const sweep = () => {
    const vh = innerHeight;
    for (const el of rvs) {
      if (el.classList.contains("in")) continue;
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.94 && r.bottom > 0) el.classList.add("in");
    }
  };
  addEventListener("scroll", sweep, { passive: true });
  setTimeout(sweep, 3500);

  /* 星空：閃爍星點與偶爾劃過的流星，只在這一段看得到時才畫 */
  if (reduce) return;
  const cv = $("nyStars"), ctx = cv.getContext("2d");
  let W, H, dpr, stars = [], meteor = null, visible = true, running = false;
  const size = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr;
    stars = Array.from({ length: Math.round(Math.min(120, innerWidth / 10)) }, () => ({
      x: Math.random() * W, y: Math.random() * H, r: (Math.random() * 1.3 + 0.3) * dpr,
      p: Math.random() * 6.28, s: Math.random() * 0.03 + 0.008, g: Math.random() < 0.35,
    }));
  };
  size(); addEventListener("resize", size);
  const draw = () => {
    if (!visible) { running = false; return; }
    ctx.clearRect(0, 0, W, H);
    for (const st of stars) {
      st.p += st.s;
      const a = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(st.p));
      ctx.fillStyle = st.g ? `rgba(247,226,176,${a})` : `rgba(255,255,255,${a * 0.8})`;
      ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, 6.28); ctx.fill();
    }
    if (!meteor && Math.random() < 0.004) meteor = { x: Math.random() * W * 0.7 + W * 0.3, y: Math.random() * H * 0.3, l: 0 };
    if (meteor) {
      meteor.l += 0.02;
      const len = 160 * dpr, x = meteor.x - meteor.l * W * 0.5, y = meteor.y + meteor.l * W * 0.25;
      const g = ctx.createLinearGradient(x, y, x + len, y - len / 2);
      g.addColorStop(0, `rgba(247,226,176,${1 - meteor.l})`); g.addColorStop(1, "rgba(247,226,176,0)");
      ctx.strokeStyle = g; ctx.lineWidth = 1.5 * dpr;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len, y - len / 2); ctx.stroke();
      if (meteor.l >= 1) meteor = null;
    }
    requestAnimationFrame(draw);
  };
  const start = () => { if (!running) { running = true; requestAnimationFrame(draw); } };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); }).observe(sec);
  start();
})();
