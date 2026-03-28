/* =============================================
   MOBILE BOTTOM NAV — CERT STUDY GUIDES
   Self-contained module. No dependencies.
   Injects bottom nav on mobile (≤768px) only.
   ============================================= */

(function () {
  'use strict';

  /* ── CONFIG ─────────────────────────────────── */

  const MOBILE_BREAKPOINT = 768;

  const CLOUD_LINKS = [
    { label: 'CCSK v5',      href: '/ccsk/index.html',         badge: 'ccsk' },
    { label: 'AWS Security', href: '/aws-security/index.html', badge: 'aws' },
    { label: 'AZ-500',       href: '/azure-security/index.html', badge: 'azure' },
    { label: 'GCP Security', href: '/gcp-security/index.html', badge: 'gcp' },
    { label: 'COBIT 2019',   href: '/cobit/index.html',        badge: 'cobit' },
  ];

  const MORE_LINKS = [
    { label: 'CISSP',            href: '/cissp/index.html',     badge: 'cissp' },
    { label: 'Stats & Progress', href: '/index.html#stats',     badge: 'stats' },
    { label: 'Shared Concepts',  href: '/shared/index.html',    badge: 'shared' },
    { label: 'Exam Dates',       href: '/exam-dates.html',      badge: 'dates' },
    { label: 'Study Schedule',   href: '/schedule.html',        badge: 'schedule' },
  ];

  /* ── SVG ICONS ──────────────────────────────── */

  const ICONS = {
    home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z"/>
      <polyline points="9 21 9 12 15 12 15 21"/>
    </svg>`,

    schedule: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8"  y1="2" x2="8"  y2="6"/>
      <line x1="3"  y1="10" x2="21" y2="10"/>
      <line x1="8"  y1="14" x2="8"  y2="14" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="12" y1="14" x2="12" y2="14" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="16" y1="14" x2="16" y2="14" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`,

    cism: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6l-8-4z"/>
    </svg>`,

    cloud: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
    </svg>`,

    more: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="5"  cy="5"  r="1.25" fill="currentColor" stroke="none"/>
      <circle cx="12" cy="5"  r="1.25" fill="currentColor" stroke="none"/>
      <circle cx="19" cy="5"  r="1.25" fill="currentColor" stroke="none"/>
      <circle cx="5"  cy="12" r="1.25" fill="currentColor" stroke="none"/>
      <circle cx="12" cy="12" r="1.25" fill="currentColor" stroke="none"/>
      <circle cx="19" cy="12" r="1.25" fill="currentColor" stroke="none"/>
      <circle cx="5"  cy="19" r="1.25" fill="currentColor" stroke="none"/>
      <circle cx="12" cy="19" r="1.25" fill="currentColor" stroke="none"/>
      <circle cx="19" cy="19" r="1.25" fill="currentColor" stroke="none"/>
    </svg>`,
  };

  /* ── BADGE COLOR MAP ────────────────────────── */

  const BADGE_COLORS = {
    ccsk:     '#3fb950',
    aws:      '#ff9900',
    azure:    '#0078d4',
    gcp:      '#4285f4',
    cobit:    '#d29922',
    cissp:    '#bc8cff',
    stats:    '#58a6ff',
    shared:   '#8b949e',
    dates:    '#f85149',
    schedule: '#58a6ff',
  };

  /* ── STATE ──────────────────────────────────── */

  let openDrawer = null;   // 'cloud' | 'more' | null
  let navEl      = null;
  let overlayEl  = null;
  let cloudDrawer = null;
  let moreDrawer  = null;

  /* ── HELPERS ────────────────────────────────── */

  function isMobile() {
    return window.innerWidth <= MOBILE_BREAKPOINT ||
      ('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0);
  }

  function getPathname() {
    // Normalise: strip query/hash, lowercase
    return window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
  }

  function isActive(href) {
    const path = getPathname();
    const target = href.toLowerCase().replace(/\/+$/, '');
    // Exact match or "current path starts with target directory"
    if (target === '' || target === '/index.html' || target === '/') {
      return path === '/' || path === '/index.html' || path.endsWith('/index.html') && !path.includes('/cism') && !path.includes('/ccsk') && !path.includes('/cobit') && !path.includes('/cissp') && !path.includes('/aws') && !path.includes('/azure') && !path.includes('/gcp');
    }
    return path === target || path.startsWith(target.replace('/index.html', '/'));
  }

  function isCismPage() {
    return getPathname().includes('/cism');
  }

  /* ── BUILD DRAWER HTML ──────────────────────── */

  function buildDrawer(id, title, links) {
    const items = links.map(({ label, href, badge }) => {
      const color = BADGE_COLORS[badge] || 'var(--accent)';
      return `
        <a href="${href}" class="mbn-drawer-link" data-badge="${badge}">
          <span class="mbn-drawer-badge" style="background:${color}22;color:${color};">${badge.toUpperCase()}</span>
          <span class="mbn-drawer-label">${label}</span>
          <svg class="mbn-drawer-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </a>`;
    }).join('');

    return `
      <div id="${id}" class="mbn-drawer" role="dialog" aria-label="${title}" aria-hidden="true">
        <div class="mbn-drawer-handle"></div>
        <div class="mbn-drawer-title">${title}</div>
        <nav class="mbn-drawer-links">${items}</nav>
      </div>`;
  }

  /* ── BUILD NAV HTML ─────────────────────────── */

  function buildNav() {
    const cismActive = isCismPage();
    const path = getPathname();

    const homeActive     = path === '/' || path === '/index.html' || (path.endsWith('/index.html') && !path.match(/\/(cism|ccsk|cobit|cissp|aws|azure|gcp)\//));
    const scheduleActive = path.includes('/schedule');

    return `
      <nav class="mobile-bottom-nav" id="mbn-root" role="navigation" aria-label="Main navigation">

        <a href="/index.html" class="mbn-item${homeActive ? ' active' : ''}" aria-label="Home">
          ${ICONS.home}
          <span>Home</span>
        </a>

        <a href="/schedule.html" class="mbn-item${scheduleActive ? ' active' : ''}" aria-label="Schedule">
          ${ICONS.schedule}
          <span>Schedule</span>
        </a>

        <a href="/cism/index.html" class="mbn-item mbn-cism${cismActive ? ' active' : ''}" aria-label="CISM">
          ${ICONS.cism}
          <span>CISM</span>
        </a>

        <button type="button" class="mbn-item mbn-drawer-trigger" id="mbn-cloud-btn" aria-label="Cloud certifications" aria-expanded="false" aria-controls="mbn-drawer-cloud">
          ${ICONS.cloud}
          <span>Cloud</span>
        </button>

        <button type="button" class="mbn-item mbn-drawer-trigger" id="mbn-more-btn" aria-label="More pages" aria-expanded="false" aria-controls="mbn-drawer-more">
          ${ICONS.more}
          <span>More</span>
        </button>

      </nav>

      <!-- Drawers -->
      ${buildDrawer('mbn-drawer-cloud', 'Cloud Certs', CLOUD_LINKS)}
      ${buildDrawer('mbn-drawer-more',  'More',        MORE_LINKS)}

      <!-- Overlay -->
      <div id="mbn-overlay" class="mbn-overlay" aria-hidden="true"></div>
    `;
  }

  /* ── INJECT STYLES ──────────────────────────── */

  function injectStyles() {
    if (document.getElementById('mbn-styles')) return;
    const style = document.createElement('style');
    style.id = 'mbn-styles';
    style.textContent = `
      /* ---- Bottom nav shell ---- */
      .mobile-bottom-nav {
        position: fixed;
        bottom: 0; left: 0; right: 0;
        height: calc(60px + env(safe-area-inset-bottom, 0px));
        background: var(--bg2, #161b22);
        border-top: 1px solid var(--border, #30363d);
        border-radius: 0;
        z-index: 400;
        display: flex;
        align-items: stretch;
        padding-bottom: env(safe-area-inset-bottom, 0px);
      }

      /* ---- Nav items ---- */
      .mbn-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 3px;
        color: var(--text-muted, #8b949e);
        text-decoration: none;
        min-height: 44px;
        padding: 6px 4px;
        background: none;
        border: none;
        cursor: pointer;
        font-family: inherit;
        transition: color 0.15s, background-color 0.15s;
        position: relative;
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
        user-select: none;
      }

      .mbn-item:hover,
      .mbn-item.active {
        color: var(--accent, #58a6ff);
        text-decoration: none;
      }

      .mbn-item.mbn-cism.active {
        color: var(--cism, #58a6ff);
      }

      .mbn-item.active {
        background-color: rgba(88, 166, 255, 0.07);
      }

      .mbn-item.mbn-cism.active {
        background-color: rgba(88, 166, 255, 0.07);
      }

      .mbn-item svg {
        width: 22px;
        height: 22px;
        flex-shrink: 0;
      }

      .mbn-item > span {
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        line-height: 1;
      }

      /* Active dot */
      .mbn-item.active::after {
        content: '';
        position: absolute;
        top: 4px;
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: currentColor;
      }

      /* Drawer open state */
      .mbn-item.drawer-open {
        color: var(--accent, #58a6ff);
        background-color: rgba(88, 166, 255, 0.07);
      }

      /* ---- Overlay ---- */
      .mbn-overlay {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        z-index: 390;
        -webkit-tap-highlight-color: transparent;
      }

      .mbn-overlay.visible {
        display: block;
        animation: mbn-fade-in 0.18s ease;
      }

      @keyframes mbn-fade-in {
        from { opacity: 0; }
        to   { opacity: 1; }
      }

      /* ---- Drawers ---- */
      .mbn-drawer {
        position: fixed;
        bottom: calc(60px + env(safe-area-inset-bottom, 0px));
        left: 0; right: 0;
        background: var(--bg2, #161b22);
        border: 1px solid var(--border, #30363d);
        border-bottom: none;
        border-radius: 12px 12px 0 0;
        z-index: 410;
        padding: 0 0 0.75rem;
        transform: translateY(110%);
        transition: transform 0.28s cubic-bezier(0.32, 0.72, 0, 1);
        max-height: 60vh;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;
      }

      .mbn-drawer.open {
        transform: translateY(0);
      }

      .mbn-drawer-handle {
        width: 36px;
        height: 4px;
        background: var(--border, #30363d);
        border-radius: 2px;
        margin: 0.75rem auto 0.5rem;
        flex-shrink: 0;
      }

      .mbn-drawer-title {
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--text-muted, #8b949e);
        padding: 0.25rem 1.25rem 0.75rem;
        border-bottom: 1px solid var(--border, #30363d);
      }

      .mbn-drawer-links {
        display: flex;
        flex-direction: column;
        padding: 0.5rem 0;
      }

      .mbn-drawer-link {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.85rem 1.25rem;
        color: var(--text, #c9d1d9);
        text-decoration: none;
        transition: background-color 0.12s, color 0.12s;
        min-height: 52px;
        -webkit-tap-highlight-color: transparent;
      }

      .mbn-drawer-link:hover,
      .mbn-drawer-link:active {
        background: var(--bg3, #1c2330);
        text-decoration: none;
        color: var(--text, #c9d1d9);
      }

      .mbn-drawer-badge {
        display: inline-block;
        padding: 0.2rem 0.55rem;
        border-radius: 4px;
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        line-height: 1.5;
        flex-shrink: 0;
        min-width: 56px;
        text-align: center;
      }

      .mbn-drawer-label {
        flex: 1;
        font-size: 1rem;
        line-height: 1.4;
      }

      .mbn-drawer-chevron {
        width: 16px;
        height: 16px;
        color: var(--text-muted, #8b949e);
        flex-shrink: 0;
      }
    `;
    document.head.appendChild(style);
  }

  /* ── DRAWER CONTROL ─────────────────────────── */

  function openDrawerById(id) {
    const drawer = document.getElementById(id);
    if (!drawer) return;
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    overlayEl.classList.add('visible');
    openDrawer = id;
  }

  function closeAllDrawers() {
    ['mbn-drawer-cloud', 'mbn-drawer-more'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.remove('open');
        el.setAttribute('aria-hidden', 'true');
      }
    });
    if (overlayEl) overlayEl.classList.remove('visible');

    // Reset button states
    ['mbn-cloud-btn', 'mbn-more-btn'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.classList.remove('drawer-open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });

    openDrawer = null;
  }

  /* ── EVENT WIRING ───────────────────────────── */

  function wireEvents() {
    const cloudBtn = document.getElementById('mbn-cloud-btn');
    const moreBtn  = document.getElementById('mbn-more-btn');

    cloudBtn.addEventListener('click', () => {
      if (openDrawer === 'mbn-drawer-cloud') {
        closeAllDrawers();
        return;
      }
      closeAllDrawers();
      openDrawerById('mbn-drawer-cloud');
      cloudBtn.classList.add('drawer-open');
      cloudBtn.setAttribute('aria-expanded', 'true');
    });

    moreBtn.addEventListener('click', () => {
      if (openDrawer === 'mbn-drawer-more') {
        closeAllDrawers();
        return;
      }
      closeAllDrawers();
      openDrawerById('mbn-drawer-more');
      moreBtn.classList.add('drawer-open');
      moreBtn.setAttribute('aria-expanded', 'true');
    });

    overlayEl.addEventListener('click', closeAllDrawers);

    // Close on Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && openDrawer) closeAllDrawers();
    });

    // Close drawer when a drawer link is tapped (navigation happening)
    document.querySelectorAll('.mbn-drawer-link').forEach(link => {
      link.addEventListener('click', () => {
        closeAllDrawers();
      });
    });
  }

  /* ── BODY PADDING ───────────────────────────── */

  function applyBodyPadding() {
    // CSS already handles this via @media max-width:768px body rule in style.css,
    // but we also add the class for explicit control
    document.body.classList.add('has-bottom-nav');
  }

  /* ── INIT ───────────────────────────────────── */

  function init() {
    if (!isMobile()) return;

    // Don't double-inject
    if (document.getElementById('mbn-root')) return;

    injectStyles();

    const wrapper = document.createElement('div');
    wrapper.innerHTML = buildNav();

    // Append all children to body
    while (wrapper.firstChild) {
      document.body.appendChild(wrapper.firstChild);
    }

    navEl      = document.getElementById('mbn-root');
    overlayEl  = document.getElementById('mbn-overlay');
    cloudDrawer = document.getElementById('mbn-drawer-cloud');
    moreDrawer  = document.getElementById('mbn-drawer-more');

    applyBodyPadding();
    wireEvents();
  }

  /* ── RESIZE GUARD ───────────────────────────── */

  // If user rotates to landscape on a tablet, re-evaluate
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const navExists = !!document.getElementById('mbn-root');
      if (!isMobile() && navExists) {
        // Hide via CSS already handles this; nothing to destroy
        closeAllDrawers();
      } else if (isMobile() && !navExists) {
        init();
      }
    }, 250);
  });

  /* ── BOOT ───────────────────────────────────── */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
