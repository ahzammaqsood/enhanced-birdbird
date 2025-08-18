
// Lightweight performance & mobile UX patches (non-invasive)
(function () {
  // Mobile nav toggle (ARIA-friendly)
  const btn = document.querySelector('.hamburger');
  const nav = document.getElementById('nav');
  if (btn && nav) {
    btn.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(isOpen));
      document.documentElement.classList.toggle('nav-open', isOpen);
    });
  }

  // Canvas DPR scaling for crisper yet cheaper rendering (caps at 2x)
  const canvas = document.getElementById('gameCanvas');
  function resizeCanvas() {
    if (!canvas) return;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width * DPR));
    const h = Math.max(1, Math.round(rect.height * DPR));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (ctx && ctx.setTransform) ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
  }
  if (canvas) {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });
    window.addEventListener('orientationchange', resizeCanvas, { passive: true });
  }

  // Passive listeners for smoother scrolling/touch
  ['touchstart','touchmove','wheel'].forEach(ev => {
    window.addEventListener(ev, function(){}, { passive: true });
  });

  // Auto-pause when tab is hidden (broadcast custom events)
  document.addEventListener('visibilitychange', () => {
    window.dispatchEvent(new CustomEvent(document.hidden ? 'game:pause' : 'game:resume'));
  });

  // Defer AdSense until first interaction to improve INP/LCP
  function initAds() {
    const ads = document.querySelectorAll('ins.adsbygoogle');
    if (!ads.length) return;
    try {
      ads.forEach(() => { (window.adsbygoogle = window.adsbygoogle || []).push({}); });
    } catch (e) { /* ignore */ }
    window.removeEventListener('pointerdown', initAds);
    window.removeEventListener('touchstart', initAds);
    window.removeEventListener('keydown', initAds);
  }
  window.addEventListener('pointerdown', initAds, { once: true });
  window.addEventListener('touchstart', initAds, { once: true, passive: true });
  window.addEventListener('keydown', initAds, { once: true });

  // Optional: lower work on ultra-high DPR phones
  if (window.devicePixelRatio > 2.5) {
    document.documentElement.classList.add('dpr-high');
  }
})();
