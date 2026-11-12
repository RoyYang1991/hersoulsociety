(() => {
  const $ = (s) => document.querySelector(s);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 布幕拉開後移除，避免擋住點擊 */
  setTimeout(() => $(".curtain")?.remove(), reduce ? 0 : 3000);

  /* 捲動顯現 */
  const io = new IntersectionObserver(
    (es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add("in"), io.unobserve(e.target))),
    { threshold: 0.15, rootMargin: "0px 0px -6% 0px" }
  );
  const rvs = [...document.querySelectorAll(".rv")];
  rvs.forEach((el) => io.observe(el));
  // 保險：觀察器沒觸發時（部分瀏覽器或模擬環境），用位置自己判斷，內容一定會出現
  const sweep = () => {
    const vh = innerHeight;
    rvs.forEach((el) => {
      if (el.classList.contains("in")) return;
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.94 && r.bottom > 0) el.classList.add("in");
    });
  };
  addEventListener("scroll", sweep, { passive: true });
  setTimeout(sweep, 400);

  /* 倒數：2027-01-01 14:00 台北時間 */
  const START = Date.parse("2027-01-01T14:00:00+08:00"), END = Date.parse("2027-01-01T17:00:00+08:00");
  const pad = (n) => String(n).padStart(2, "0");
  const tickCount = () => {
    const now = Date.now();
    if (now >= START) {
      $("#count").innerHTML = `<span class="cl">${now < END ? "音樂會正在進行中" : "感謝每一位有緣人，這場祝福已圓滿"}</span>`;
      return clearInterval(cdTimer);
    }
    let s = Math.floor((START - now) / 1000);
    $("#cdD").textContent = Math.floor(s / 86400); s %= 86400;
    $("#cdH").textContent = pad(Math.floor(s / 3600)); s %= 3600;
    $("#cdM").textContent = pad(Math.floor(s / 60));
    $("#cdS").textContent = pad(s % 60);
  };
  const cdTimer = setInterval(tickCount, 1000);
  tickCount();

  /* 進度條、浮動報名鈕 */
  const bar = $("#bar"), fl = $(".float-cta"), join = $("#join");
  const onScroll = () => {
    const y = scrollY, vh = innerHeight;
    bar.style.transform = `scaleX(${Math.min(1, y / (document.documentElement.scrollHeight - vh))})`;
    const j = join.getBoundingClientRect();
    fl.classList.toggle("on", y > vh * 0.8 && (j.top > vh || j.bottom < 0));
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* 海報跟著游標微微傾斜 */
  const tilt = $("#tilt");
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

  /* 星空：閃爍的星點與偶爾劃過的流星 */
  if (reduce) return;
  const cv = $("#stars"), ctx = cv.getContext("2d");
  let W, H, dpr, stars = [], meteor = null;
  const size = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr;
    stars = Array.from({ length: Math.round(Math.min(120, innerWidth / 10)) }, () => ({
      x: Math.random() * W, y: Math.random() * H, r: (Math.random() * 1.3 + 0.3) * dpr, p: Math.random() * 6.28, s: Math.random() * 0.03 + 0.008,
      g: Math.random() < 0.35,
    }));
  };
  size(); addEventListener("resize", size);
  const draw = () => {
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
  draw();
})();
