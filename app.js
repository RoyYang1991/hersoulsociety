(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (s = "") => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ── 首屏標題：逐字由霧變清晰 ── */
  const h1 = $(".split");
  let i = 0;
  h1.innerHTML = h1.dataset.text
    .split("|")
    .map((row) => `<span class="row">${[...row].map((c) => `<span class="ch" style="--i:${i++}">${c}</span>`).join("")}</span>`)
    .join("");
  h1.setAttribute("aria-label", h1.dataset.text.replace("|", ""));

  /* ── 理念小語：拆成單字，之後隨捲動逐字點亮 ── */
  const whispers = $$(".whisper").map((w) => {
    w.innerHTML = w.dataset.text
      .split("|")
      .map((row) => `<span class="row">${[...row].map((c) => `<span class="c">${c}</span>`).join("")}</span>`)
      .join("");
    w.setAttribute("aria-label", w.dataset.text.replace("|", ""));
    return { el: w, chars: $$(".c", w) };
  });

  /* ── 活動：依日期自動分成進行中／過去 ── */
  const today = new Date().toISOString().slice(0, 10);
  const events = (window.HSS_EVENTS || []).slice();
  const isPast = (e) => e.end && e.end < today;
  const fmt = (d) => d.replaceAll("-", ".");
  const dateText = (e) => e.dateText || (e.end && e.end !== e.start ? `${fmt(e.start)} – ${fmt(e.end)}` : fmt(e.start));
  const tags = (e) => (e.tags || []).map((t) => `<i>${esc(t)}</i>`).join("");
  const flag = (e) => (e.sample ? `<span class="sample-flag">示意</span>` : "");
  const link = (e) =>
    e.link ? `<a class="more" href="${esc(e.link)}"${/^https?:/.test(e.link) ? ' target="_blank" rel="noopener"' : ""}>${esc(e.linkText || "了解更多")} →</a>` : "";

  const now = events.filter((e) => !isPast(e)).sort((a, b) => !b.featured - !a.featured || !a.end - !b.end || a.start.localeCompare(b.start)); // 主打活動最前面，再來是有日期的活動，長期企劃排後面
  const past = events.filter(isPast).sort((a, b) => b.start.localeCompare(a.start));

  $("#nowList").innerHTML = now.length
    ? now
        .map(
          (e) => `
      <article class="now-card reveal">
        <div class="now-media${e.image ? " has-img" : ""}">${e.image ? `<img class="bg" src="${esc(e.image)}" alt="" aria-hidden="true" loading="lazy"><img class="poster" src="${esc(e.image)}" alt="${esc(e.title)}" loading="lazy">` : `<div class="now-date"><small>${e.start.slice(0, 4)}</small><b>${e.start.slice(5, 7)}.${e.start.slice(8)}</b><span>${esc(e.type || "")}</span></div>`}</div>
        <div class="now-body">
          <span class="badge"><i class="dot"></i>${today < e.start ? "即將開始" : "進行中"}・${esc(e.type || "活動")}</span>
          <h3>${esc(e.title)}${flag(e)}</h3>
          <div class="meta"><span>${esc(dateText(e))}</span><span>${esc(e.place || "")}</span></div>
          <p>${esc(e.summary)}</p>
          <div class="tags">${tags(e)}</div>
          ${link(e)}
        </div>
      </article>`
        )
        .join("")
    : `<div class="empty reveal">下一場活動正在醞釀中，敬請期待。</div>`;

  $("#pastList").insertAdjacentHTML(
    "beforeend",
    past.length
      ? past
          .map((e) => {
            const [y, m, d] = e.start.split("-");
            return `
      <div class="t-item reveal">
        <article class="t-card">
          <div class="t-date"><b>${m}.${d}</b>${y}</div>
          <div>
            <h3>${esc(e.title)}${flag(e)}</h3>
            <div class="meta"><span>${esc(e.type || "")}</span><span>${esc(e.place || "")}</span></div>
            <p>${esc(e.summary)}</p>
            <div class="tags">${tags(e)}</div>
            ${link(e)}
          </div>
          ${e.image ? `<div class="t-thumb"><img class="bg" src="${esc(e.image)}" alt="" aria-hidden="true" loading="lazy"><img class="poster" src="${esc(e.image)}" alt="${esc(e.title)}" loading="lazy"></div>` : ""}
        </article>
      </div>`;
          })
          .join("")
      : `<div class="empty reveal">足跡整理中，很快就會放上來。</div>`
  );

  /* ── 捲動顯現 ── */
  const io = new IntersectionObserver(
    (es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add("in"), io.unobserve(e.target))),
    { threshold: 0.15, rootMargin: "0px 0px -6% 0px" }
  );
  $$(".reveal").forEach((el) => io.observe(el));

  /* ── 導覽列目前區塊 ── */
  const links = $$(".nav nav a, .tabbar a");
  const spy = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (e.isIntersecting) links.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id));
      }),
    { rootMargin: "-45% 0px -50% 0px" }
  );
  $$("main section[id]").forEach((s) => spy.observe(s));

  /* ── 捲動連動：進度條、時間軸畫線、影片放大 ── */
  /* ── 角落輪播的小提示 ── */
  const HINTS = [
    "你會遇見這裡，不是偶然。",
    "願你找到，生命中有力量的信仰。",
    "法王加持，讓一切顯化為可能。",
    "先相信，然後看見。",
    "信仰，是心裡那盞不會熄的燈。",
    "變好，從留一個下午給自己開始。",
    "我們的心願很簡單：讓每個人變好。",
    "帶著祝福回去，把光分給身邊的人。",
  ];
  const hint = $("#hint"), hintText = $("#hintText");
  let hintOff = false, hi = 0;
  try { hintOff = sessionStorage.getItem("hss-hint-off") === "1"; } catch (e) {}
  hintText.textContent = HINTS[0];
  setInterval(() => {
    hintText.classList.add("out");
    setTimeout(() => { hintText.textContent = HINTS[(hi = (hi + 1) % HINTS.length)]; hintText.classList.remove("out"); }, 520);
  }, 6500);
  $("#hintClose").addEventListener("click", () => {
    hintOff = true; hint.classList.remove("on");
    try { sessionStorage.setItem("hss-hint-off", "1"); } catch (e) {}
  });

  const nav = $("#nav"), bar = $("#progress"), line = $(".timeline .line b"), tl = $("#pastList"), frame = $("#filmFrame");
  const clamp = (v) => Math.max(0, Math.min(1, v));
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const vh = innerHeight, y = scrollY;
    bar.style.transform = `scaleX(${clamp(y / (document.documentElement.scrollHeight - vh))})`;
    nav.classList.toggle("scrolled", y > 40);
    hint.classList.toggle("on", !hintOff && y > vh * 0.6);
    if (reduce) return;
    for (const w of whispers) {
      const r = w.el.getBoundingClientRect();
      const n = Math.round(clamp((vh * 0.9 - r.top) / (vh * 0.45)) * w.chars.length);
      w.chars.forEach((c, k) => c.classList.toggle("on", k < n));
    }
    const t = tl.getBoundingClientRect();
    line.style.transform = `scaleY(${clamp((vh * 0.7 - t.top) / t.height)})`;
    const f = frame.getBoundingClientRect();
    frame.style.setProperty("--s", 0.86 + 0.14 * clamp((vh - f.top) / (vh * 0.75)));
  };
  addEventListener("scroll", () => ticking || ((ticking = true), requestAnimationFrame(onScroll)), { passive: true });
  addEventListener("resize", onScroll);
  onScroll();

  /* ── 影片播放 ── */
  const video = $("#filmVideo");
  $("#filmPlay").addEventListener("click", () => {
    video.controls = true;
    video.play();
  });
  video.addEventListener("play", () => frame.classList.add("playing"));
  video.addEventListener("pause", () => video.ended || frame.classList.remove("playing"));
  video.addEventListener("ended", () => frame.classList.remove("playing"));

  $("#year").textContent = new Date().getFullYear();

  /* ── 頁內連結：同一頁直接平滑捲動，不蓋光幕（loading 畫面只在剛進站時出現） ── */
  const topOf = (el) => (el.id === "top" ? 0 : el.getBoundingClientRect().top + scrollY - 16);
  $$('a[href^="#"]').forEach((a) =>
    a.addEventListener("click", (ev) => {
      const target = document.getElementById(a.getAttribute("href").slice(1));
      if (!target) return;
      ev.preventDefault();
      scrollTo({ top: topOf(target), behavior: reduce ? "instant" : "smooth" });
      history.replaceState(null, "", a.getAttribute("href"));
    })
  );

  /* ── 進場畫面 ── */
  const loader = $("#loader");
  const enter = () => document.body.classList.remove("loading");
  if (reduce) { loader.hidden = true; enter(); return; }
  {
    const TIPS = ["緣分，正在靠近", "為你點一盞燈", "願一切，顯化為可能"];
    const ring = $("#lRing"), pct = $("#lPct"), tip = $("#lTip"), C = 2 * Math.PI * 92, MIN = 2800;
    let loaded = document.readyState === "complete", prog = 0, last = performance.now(), shown = 0, finished = false;
    addEventListener("load", () => (loaded = true));
    const say = (t) => { tip.classList.add("out"); setTimeout(() => { tip.textContent = t; tip.classList.remove("out"); }, 340); };
    const finish = () => {
      if (finished) return;
      finished = true;
      ring.style.strokeDashoffset = 0; pct.textContent = 100;
      say("歡迎你，有緣人");
      setTimeout(() => { loader.classList.add("done"); enter(); }, 900);
      setTimeout(() => (loader.hidden = true), 2400);
    };
    const step = (now) => {
      if (finished) return;
      prog += (now - last) / MIN; last = now;
      if (!loaded) prog = Math.min(prog, 0.9);
      const p = Math.min(1, prog), e = p * p * (3 - 2 * p);
      ring.style.strokeDashoffset = C * (1 - e);
      pct.textContent = Math.round(e * 100);
      const k = Math.min(TIPS.length - 1, Math.floor(p * TIPS.length));
      if (k !== shown) say(TIPS[(shown = k)]);
      p >= 1 ? finish() : requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    setTimeout(() => { loaded = true; }, 6000); // 圖片或字型卡住時，最多等 6 秒
    setTimeout(finish, 9000);
  }

  /* ── 跟著游標的光暈 ── */
  const glow = $("#glow");
  let gx = innerWidth / 2, gy = innerHeight / 2, tx = gx, ty = gy;
  addEventListener("pointermove", (e) => {
    tx = e.clientX; ty = e.clientY; glow.style.opacity = 1;
  });

  /* ── 卡片傾斜與光點 ── */
  $$(".now-card").forEach((c) => {
    c.addEventListener("pointermove", (e) => {
      const r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      c.style.setProperty("--mx", px * 100 + "%");
      c.style.setProperty("--my", py * 100 + "%");
      c.style.setProperty("--ry", (px - 0.5) * 5 + "deg");
      c.style.setProperty("--rx", (0.5 - py) * 4 + "deg");
    });
    c.addEventListener("pointerleave", () => {
      c.style.setProperty("--rx", "0deg");
      c.style.setProperty("--ry", "0deg");
    });
  });

  /* ── 漂浮的微光粒子 ── */
  const cv = $("#motes"), ctx = cv.getContext("2d");
  let W, H, dpr, motes = [];
  const colors = ["255,214,150", "240,160,150", "190,170,235", "255,255,255"];
  const size = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.width = innerWidth * dpr;
    H = cv.height = innerHeight * dpr;
    const n = Math.round(Math.min(70, innerWidth / 22));
    motes = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H, r: (Math.random() * 2.2 + 0.8) * dpr,
      vx: (Math.random() - 0.5) * 0.18 * dpr, vy: -(Math.random() * 0.28 + 0.06) * dpr,
      p: Math.random() * 6.28, s: Math.random() * 0.012 + 0.004, c: colors[(Math.random() * colors.length) | 0],
    }));
  };
  size();
  addEventListener("resize", size);

  const tick = () => {
    gx += (tx - gx) * 0.07; gy += (ty - gy) * 0.07;
    glow.style.transform = `translate(${gx}px,${gy}px)`;
    ctx.clearRect(0, 0, W, H);
    for (const m of motes) {
      m.x += m.vx + Math.sin(m.p) * 0.15 * dpr; m.y += m.vy; m.p += m.s;
      if (m.y < -10) { m.y = H + 10; m.x = Math.random() * W; }
      if (m.x < -10) m.x = W + 10; else if (m.x > W + 10) m.x = -10;
      const a = 0.25 + 0.45 * (0.5 + 0.5 * Math.sin(m.p * 3));
      const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 4);
      g.addColorStop(0, `rgba(${m.c},${a})`);
      g.addColorStop(1, `rgba(${m.c},0)`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(m.x, m.y, m.r * 4, 0, 6.28); ctx.fill();
    }
    requestAnimationFrame(tick);
  };
  tick();
})();
