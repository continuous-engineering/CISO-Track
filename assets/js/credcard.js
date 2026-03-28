/* =============================================
   CREDCARD.JS — Credential card renderer
   Shared between login.html and settings.html
   ============================================= */

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function buildCredCanvas(codename, dateStr, site) {
  const W = 900, H = 480;
  const canvas = document.createElement('canvas');
  canvas.width = W * 2; canvas.height = H * 2;
  const ctx = canvas.getContext('2d');
  ctx.scale(2, 2);

  const C = {
    bg:     '#0d1117', bg2: '#161b22', border: '#21262d',
    text:   '#e6edf3', muted: '#8b949e',
    accent: '#58a6ff', green: '#3fb950', purple: '#bc8cff',
  };

  // Background
  ctx.fillStyle = C.bg;
  roundRect(ctx, 0, 0, W, H, 16);
  ctx.fill();

  // Dot grid
  ctx.fillStyle = 'rgba(255,255,255,0.025)';
  for (let x = 20; x < W; x += 24) {
    for (let y = 20; y < H; y += 24) {
      ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill();
    }
  }

  // Top gradient bar
  const grad = ctx.createLinearGradient(0, 0, W, 0);
  grad.addColorStop(0, C.accent); grad.addColorStop(0.5, C.green); grad.addColorStop(1, C.purple);
  ctx.fillStyle = grad; ctx.fillRect(0, 0, W, 5);

  // Border glow
  ctx.strokeStyle = 'rgba(88,166,255,0.25)'; ctx.lineWidth = 1;
  roundRect(ctx, 0.5, 0.5, W - 1, H - 1, 16); ctx.stroke();

  // CE badge
  const markGrad = ctx.createLinearGradient(40, 36, 68, 64);
  markGrad.addColorStop(0, C.accent); markGrad.addColorStop(1, C.purple);
  ctx.fillStyle = markGrad; roundRect(ctx, 40, 36, 32, 32, 8); ctx.fill();
  ctx.fillStyle = '#000'; ctx.font = 'bold 11px system-ui,sans-serif';
  ctx.textAlign = 'center'; ctx.fillText('CE', 56, 57);

  // Issuer
  ctx.textAlign = 'left';
  ctx.fillStyle = C.accent; ctx.font = 'bold 14px system-ui,sans-serif';
  ctx.fillText('continuous.engineering', 82, 52);
  ctx.fillStyle = C.muted; ctx.font = '11px system-ui,sans-serif';
  ctx.fillText('Cert Study Guides  \u00B7  Study Credential', 82, 66);

  // Separator
  ctx.strokeStyle = C.border; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(40, 90); ctx.lineTo(W - 40, 90); ctx.stroke();

  // Codename label
  ctx.fillStyle = C.muted; ctx.font = '700 10px system-ui,sans-serif';
  ctx.fillText('YOUR CODENAME', 40, 120);

  // Codename — colour-split at second capital letter
  const split = codename.search(/[A-Z]/, 1);
  const part1 = split > 0 ? codename.slice(0, split) : codename;
  const part2 = split > 0 ? codename.slice(split) : '';
  ctx.font = 'bold 58px system-ui,sans-serif';
  ctx.fillStyle = C.text;
  const p1w = ctx.measureText(part1).width;
  ctx.fillText(part1, 40, 185);
  ctx.fillStyle = C.accent;
  ctx.fillText(part2, 40 + p1w, 185);

  // Separator
  ctx.strokeStyle = C.border; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(40, 215); ctx.lineTo(W - 40, 215); ctx.stroke();

  // Passphrase
  ctx.fillStyle = C.muted; ctx.font = '700 10px system-ui,sans-serif';
  ctx.fillText('PASSPHRASE', 40, 245);
  ctx.fillStyle = C.accent; ctx.font = '600 18px ui-monospace,monospace';
  ctx.fillText('continuous.engineering', 40, 270);

  // Site
  ctx.fillStyle = C.muted; ctx.font = '700 10px system-ui,sans-serif';
  ctx.fillText('SITE', 440, 245);
  ctx.fillStyle = C.text; ctx.font = '600 16px ui-monospace,monospace';
  ctx.fillText(site || 'continuous.engineering', 440, 270);

  // Warning
  ctx.fillStyle = '#d29922'; ctx.font = '600 12px system-ui,sans-serif';
  ctx.fillText('Save this. There is no recovery without your codename.', 40, 315);

  // Footer bar
  ctx.fillStyle = C.bg2; ctx.fillRect(0, H - 52, W, 52);
  ctx.strokeStyle = C.border; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, H - 52); ctx.lineTo(W, H - 52); ctx.stroke();
  ctx.fillStyle = C.muted; ctx.font = '11px system-ui,sans-serif';
  ctx.fillText('Powered by continuous.engineering  \u00B7  continuia.ai', 40, H - 22);
  ctx.textAlign = 'right';
  ctx.fillText('Issued ' + dateStr, W - 40, H - 22);

  // Clip to rounded rect
  ctx.globalCompositeOperation = 'destination-in';
  ctx.fillStyle = '#fff'; roundRect(ctx, 0, 0, W, H, 16); ctx.fill();
  ctx.globalCompositeOperation = 'source-over';

  return canvas;
}

function downloadCredCard(codename, dateStr, site) {
  const canvas = buildCredCanvas(codename, dateStr, site);
  const link = document.createElement('a');
  link.download = 'CertStudyGuides-' + codename + '.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

/* Render card as an <img> into a container element */
function renderCredCardInto(container, codename, dateStr, site) {
  const canvas = buildCredCanvas(codename, dateStr, site);
  const img = document.createElement('img');
  img.src = canvas.toDataURL('image/png');
  img.style.cssText = 'width:100%;height:auto;display:block;border-radius:12px;';
  img.alt = 'Credential card for ' + codename;
  container.innerHTML = '';
  container.appendChild(img);
}
