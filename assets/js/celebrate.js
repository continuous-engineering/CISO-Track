/* =============================================
   CELEBRATIONS — CISO CERT TRACK
   Confetti, badges, milestone moments.
   No external libs. Pure canvas.
   ============================================= */

/* ── CONFETTI ─────────────────────────────── */
function launchConfetti(duration = 3000) {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = `
    position:fixed;top:0;left:0;width:100%;height:100%;
    pointer-events:none;z-index:9999;
  `;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#58a6ff','#3fb950','#d29922','#bc8cff','#f85149','#79c0ff'];
  const pieces = Array.from({length: 120}, () => ({
    x: Math.random() * canvas.width,
    y: -20,
    r: Math.random() * 6 + 3,
    d: Math.random() * 20 + 5,
    color: colors[Math.floor(Math.random() * colors.length)],
    tilt: Math.random() * 10 - 5,
    tiltAngle: 0,
    tiltSpeed: Math.random() * 0.1 + 0.05,
  }));

  let start = null;
  function draw(ts) {
    if (!start) start = ts;
    const elapsed = ts - start;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.tiltAngle += p.tiltSpeed;
      p.y += (Math.cos(p.d) + 1.5);
      p.x += Math.sin(p.tiltAngle) * 2;
      p.tilt = Math.sin(p.tiltAngle) * 15;
      ctx.beginPath();
      ctx.lineWidth = p.r;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
      ctx.stroke();
    });
    if (elapsed < duration) requestAnimationFrame(draw);
    else canvas.remove();
  }
  requestAnimationFrame(draw);
}

/* ── TOAST NOTIFICATION ───────────────────── */
function showToast(message, type = 'success', duration = 4000) {
  const colors = {
    success: 'var(--accent2)',
    info: 'var(--accent)',
    warning: 'var(--accent3)',
    badge: 'var(--accent5)',
  };
  const toast = document.createElement('div');
  toast.style.cssText = `
    position:fixed;bottom:2rem;right:2rem;
    background:var(--bg2);
    border:1px solid ${colors[type]};
    border-left:4px solid ${colors[type]};
    color:var(--text);
    padding:1rem 1.5rem;
    border-radius:8px;
    font-size:0.9rem;
    max-width:320px;
    z-index:10000;
    box-shadow:0 8px 32px rgba(0,0,0,0.4);
    transform:translateX(400px);
    transition:transform 0.3s cubic-bezier(0.4,0,0.2,1);
    line-height:1.5;
  `;
  toast.innerHTML = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => { toast.style.transform = 'translateX(0)'; });
  });
  setTimeout(() => {
    toast.style.transform = 'translateX(400px)';
    setTimeout(() => toast.remove(), 350);
  }, duration);
}

/* ── BADGE AWARD MODAL ────────────────────── */
function showBadgeModal(title, subtitle, emoji = '🏅') {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,0.75);
    display:flex;align-items:center;justify-content:center;
    z-index:10001;backdrop-filter:blur(4px);
  `;
  overlay.innerHTML = `
    <div style="
      background:var(--bg2);border:1px solid var(--accent5);
      border-radius:16px;padding:3rem;text-align:center;
      max-width:420px;width:90%;
      animation:badgePop 0.4s cubic-bezier(0.34,1.56,0.64,1);
    ">
      <div style="font-size:4rem;margin-bottom:1rem;">${emoji}</div>
      <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--accent5);margin-bottom:0.5rem;">Badge Earned</div>
      <div style="font-size:1.5rem;font-weight:700;color:var(--text);margin-bottom:0.5rem;">${title}</div>
      <div style="font-size:0.9rem;color:var(--text-muted);margin-bottom:2rem;">${subtitle}</div>
      <button onclick="this.closest('[style]').remove()" style="
        background:var(--accent5);color:#000;border:none;
        padding:0.6rem 2rem;border-radius:6px;font-size:0.9rem;
        font-weight:600;cursor:pointer;
      ">Awesome!</button>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
}

/* ── QUIZ PASS CELEBRATION ────────────────── */
function celebrateQuizPass(pct, domainName) {
  if (pct >= 90) {
    launchConfetti(4000);
    showToast(`<strong>Outstanding! ${pct}%</strong><br>${domainName} — Expert level performance.`, 'success', 5000);
  } else if (pct >= 80) {
    launchConfetti(2500);
    showToast(`<strong>Passed! ${pct}%</strong><br>${domainName} — Above the 80% gate. Move to next topic.`, 'success');
  } else if (pct >= 70) {
    showToast(`<strong>${pct}%</strong> — Almost there. Re-read the weak sections and retry. Gate is 80%.`, 'warning');
  } else {
    showToast(`<strong>${pct}%</strong> — Back to the study guide. Focus on what the explanations say you missed.`, 'info');
  }
}

/* ── SECTION READ CELEBRATION ─────────────── */
function celebrateSectionRead(topicName) {
  showToast(`✓ <strong>${topicName}</strong> marked as read.`, 'info', 2500);
}

/* ── DOMAIN COMPLETE BADGE ────────────────── */
function celebrateDomainBadge(domainName, cert) {
  launchConfetti(4000);
  showBadgeModal(
    `${cert} ${domainName}`,
    'All topics read and quiz passed at 80%+. Domain complete.',
    cert === 'CISM' ? '🛡️' : cert === 'CCSK' ? '☁️' : cert === 'COBIT' ? '⚙️' : '🔐'
  );
}

/* ── CERT READY BADGE ─────────────────────── */
function celebrateCertReady(certName) {
  launchConfetti(6000);
  setTimeout(() => {
    showBadgeModal(
      `${certName} EXAM READY`,
      'All domains complete. All quizzes at 80%+. Schedule your exam.',
      '🎯'
    );
  }, 500);
}

/* CSS for badge animation */
const badgeStyle = document.createElement('style');
badgeStyle.textContent = `
@keyframes badgePop {
  from { transform: scale(0.5); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
`;
document.head.appendChild(badgeStyle);
