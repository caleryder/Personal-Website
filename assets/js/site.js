/* Cale Thompson portfolio — shared site behavior.
   All page content is server-rendered HTML. This file only enhances it:
   theme toggle, language toggle, scroll-reveal animation, custom cursor,
   copy-email, and the title-block reveal cascade. Nothing here is required
   for the page's text content to be present or readable. */

const EMAIL = "cale.ryder@gmail.com";

/* Some embedding contexts (e.g. sandboxed preview iframes) block storage
   access entirely, throwing on any localStorage call. Wrap it so that
   degrades to "don't persist" instead of breaking the whole script. */
function safeStorageGet(key){
  try { return localStorage.getItem(key); } catch(e){ return null; }
}
function safeStorageSet(key, value){
  try { localStorage.setItem(key, value); } catch(e){ /* ignore */ }
}

/* ---------- icons (inline SVG strings, unchanged from the original) ---------- */
function sunIcon(){
  return `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 7.99512H16" stroke="currentColor"/><path d="M0 7.99512H2" stroke="currentColor"/><path d="M7.99512 2L7.99512 0" stroke="currentColor"/><path d="M7.99512 16L7.99512 14" stroke="currentColor"/><path d="M3.75391 3.76099L2.33969 2.34677" stroke="currentColor"/><path d="M13.6533 13.6604L12.2391 12.2462" stroke="currentColor"/><path d="M3.75391 12.2461L2.33969 13.6603" stroke="currentColor"/><path d="M13.6533 2.34668L12.2391 3.76089" stroke="currentColor"/><circle cx="8" cy="7.99512" r="4" fill="currentColor"/></svg>`;
}
function moonIcon(){
  return `<svg viewBox="0 0 9 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 12C1.60766 12 0.761143 11.8045 4.76385e-08 11.4551C2.06535 10.507 3.5 8.42136 3.5 6C3.5 3.57878 2.06515 1.49406 1.00135e-06 0.545898C0.76124 0.196396 1.60751 -6.0256e-07 2.5 -5.24536e-07C5.81371 -2.34843e-07 8.5 2.68629 8.5 6C8.5 9.31371 5.81371 12 2.5 12Z" fill="currentColor"/></svg>`;
}

/* ---------- theme toggle ---------- */
let THEME = safeStorageGet('theme') || 'light';
function applyThemeToDOM(){
  document.documentElement.setAttribute('data-theme', THEME);
  document.querySelectorAll('.theme-toggle.theme-icon').forEach(btn=>{
    btn.innerHTML = THEME === 'dark' ? sunIcon() : moonIcon();
  });
}
function toggleTheme(){
  THEME = THEME === 'light' ? 'dark' : 'light';
  safeStorageSet('theme', THEME);
  applyThemeToDOM();
}

/* ---------- language toggle ---------- */
let LANG = safeStorageGet('lang') || 'en';
function t(en, es){ return LANG === 'es' ? es : en; }

function applyLangToDOM(){
  document.documentElement.lang = LANG;
  document.querySelectorAll('[data-en][data-es]').forEach(el=>{
    el.textContent = LANG === 'es' ? el.getAttribute('data-es') : el.getAttribute('data-en');
  });
  document.querySelectorAll('[data-en-html][data-es-html]').forEach(el=>{
    el.innerHTML = LANG === 'es' ? el.getAttribute('data-es-html') : el.getAttribute('data-en-html');
  });
  document.querySelectorAll('[data-en-placeholder][data-es-placeholder]').forEach(el=>{
    el.placeholder = LANG === 'es' ? el.getAttribute('data-es-placeholder') : el.getAttribute('data-en-placeholder');
  });
  document.querySelectorAll('.lang-toggle').forEach(btn=>{
    btn.textContent = LANG === 'en' ? 'ES' : 'EN';
  });
}
function toggleLang(){
  LANG = LANG === 'en' ? 'es' : 'en';
  safeStorageSet('lang', LANG);
  applyLangToDOM();
}

/* ---------- password gate (Nike) ----------
   This never checked a real password in the original site either -- it
   always just clears the field and says "Incorrect." The case study is
   simply not published; this is a deliberate "protected" presentation,
   not a real access-control mechanism. */
function handleGateSubmit(btn){
  const input = document.getElementById('gatePasswordInput');
  if(!input) return;
  input.value = '';
  input.placeholder = t('Incorrect. Try again please.','Incorrecto. Intenta de nuevo, por favor.');
  input.focus();
}

/* ---------- copy email ---------- */
function headerCopyEmail(el){
  const original = el.innerHTML;
  const done = () => {
    el.innerHTML = '<span style="font-size:11px; font-weight:300; letter-spacing:0.04em; white-space:nowrap;">' + t('COPIED','COPIADO') + '</span>';
    setTimeout(()=>{ el.innerHTML = original; }, 2000);
  };
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(EMAIL).then(done).catch(done);
  } else {
    done();
  }
}

/* ---------- clock (footer) ---------- */
function clockParts(){
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).formatToParts(new Date());
  let h='', m='', ap='';
  parts.forEach(p=>{
    if(p.type==='hour') h=p.value;
    if(p.type==='minute') m=p.value;
    if(p.type==='dayPeriod') ap=p.value.toUpperCase();
  });
  return `${h}:${m} ${ap}`;
}
function tickClock(){
  const el = document.getElementById('clockDisplay');
  if(el) el.textContent = clockParts();
}

/* ---------- scroll reveal ---------- */
function initScrollReveal(){
  // The page's headline and lede are handled entirely by CSS defaults --
  // always visible immediately, no fade -- so they're intentionally not
  // queried here at all. Above-the-fold content must not depend on a
  // script finishing in time to be seen. Same reasoning for
  // .hero-img-primary (the header/top image on each page), excluded
  // below alongside the text elements.
  const allTargets = document.querySelectorAll('.cs-subhead, .cs-section p, .cs-section-label, .section-title, .stat-row, .pillar-full h3, .pillar-body, .pillar-detail, .pillar-quote p, .pillar-quote-attribution, body:not(:has(#content .home-bio)) .body-copy p, .leadership-block p, .hero-img:not(.hero-img-primary), .img-placeholder, body:has(#content .home-bio) .body-copy, body:has(#content .home-bio) .case-study-cta');
  let targets = Array.from(allTargets);
  if(targets.length === 0) return;

  function checkReveal(){
    const vh = window.innerHeight || document.documentElement.clientHeight;
    targets = targets.filter(el => {
      const rect = el.getBoundingClientRect();
      if(rect.top < vh * 0.9 && rect.bottom > 0){
        el.classList.add('is-visible');
        return false;
      }
      return true;
    });
    if(targets.length === 0){
      window.removeEventListener('scroll', checkReveal);
      window.removeEventListener('resize', checkReveal);
    }
  }

  requestAnimationFrame(()=>{
    requestAnimationFrame(()=>{
      checkReveal();
      window.addEventListener('scroll', checkReveal, {passive:true});
      window.addEventListener('resize', checkReveal);
    });
  });
}

/* Only the primary/header image on each page (.hero-img-primary) and the
   very first headline+lede stay immediately visible via CSS defaults --
   above-the-fold content must not depend on a script finishing in time
   to be seen. Everything else -- text and images alike -- fades/wipes
   in via initScrollReveal as the visitor scrolls to it, which is fine
   since that only affects content not yet seen. See the clip-path
   comment in site.css for the image reveal's specific mechanics. */

/* ---------- custom cursor ---------- */
/* Adapts to whatever's actually beneath it: dark cursor over light
   backgrounds, light cursor over dark backgrounds. An earlier version
   used mix-blend-mode:difference for this, which is unreliable against
   this site's actual colors -- it mathematically produces almost no
   visible contrast against colors close to white (this site's cream
   background), and it only blends correctly within a single stacking
   context, which many elements on this page (position:relative,
   transforms) break out of. This version instead directly samples the
   real pixel color under the cursor -- the page's theme when over plain
   background, the actual image pixel when over an image -- and switches
   an explicit class based on what it measures, giving verifiable
   control instead of relying on browser blend-mode compositing. */
function initCustomCursor(){
  const cursorEl = document.createElement('div');
  cursorEl.className = 'custom-cursor';
  document.body.appendChild(cursorEl);

  // One small offscreen canvas per image, drawn once and reused for
  // every subsequent sample -- cheap to read from on every mousemove.
  const imageSamplers = new WeakMap();
  function getSampler(img){
    if(imageSamplers.has(img)) return imageSamplers.get(img);
    const w = 64;
    const h = Math.max(1, Math.round(w * (img.naturalHeight / img.naturalWidth || 1)));
    let ctx = null;
    try{
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      ctx = c.getContext('2d', {willReadFrequently:true});
      ctx.drawImage(img, 0, 0, w, h);
    } catch(e){ ctx = null; } // e.g. image not yet decoded
    const sampler = {ctx, w, h};
    imageSamplers.set(img, sampler);
    return sampler;
  }

  document.addEventListener('mousemove', (e) => {
    cursorEl.style.left = e.clientX + 'px';
    cursorEl.style.top = e.clientY + 'px';

    let overDark = document.documentElement.getAttribute('data-theme') === 'dark';

    const imgEl = e.target.closest('img');
    if(imgEl && imgEl.complete && imgEl.naturalWidth > 0){
      const sampler = getSampler(imgEl);
      if(sampler.ctx){
        const rect = imgEl.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width;
        const relY = (e.clientY - rect.top) / rect.height;
        const sx = Math.min(sampler.w - 1, Math.max(0, Math.floor(relX * sampler.w)));
        const sy = Math.min(sampler.h - 1, Math.max(0, Math.floor(relY * sampler.h)));
        try{
          const px = sampler.ctx.getImageData(sx, sy, 1, 1).data;
          const luminance = 0.299*px[0] + 0.587*px[1] + 0.114*px[2];
          overDark = luminance < 140;
        } catch(e){ /* fall back to page-theme default already set above */ }
      }
    }

    cursorEl.classList.toggle('cursor-on-dark', overDark);
  });
  document.addEventListener('mouseover', (e) => {
    if(e.target.closest('a, button, input')){
      cursorEl.classList.add('cursor-hover');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if(e.target.closest('a, button, input')){
      cursorEl.classList.remove('cursor-hover');
    }
  });
}

/* ---------- pillar reorder (values page) ---------- */
function reorderPillarFromHash(){
  const hash = location.hash.replace('#', '');
  if(!hash) return;
  const target = document.getElementById(hash);
  if(!target || !target.classList.contains('pillar-full')) return;
  const container = target.parentElement;
  const firstPillar = container.querySelector('.pillar-full');
  if(firstPillar !== target){
    container.insertBefore(target, firstPillar);
  }
  // The browser's native "scroll to #fragment" doesn't reliably happen at
  // one predictable moment. On mobile Safari in particular, it can fire
  // again later than expected -- e.g. after web fonts finish loading and
  // the page reflows -- well after an early double-rAF guard has already
  // run and moved on, leaving the target pillar's heading scrolled to the
  // very top of the screen, hiding the header and page title above it.
  // Reassert scroll-to-top at several points instead of trusting a single
  // early attempt to win.
  function forceScrollTop(){ window.scrollTo(0, 0); }
  requestAnimationFrame(() => {
    requestAnimationFrame(forceScrollTop);
  });
  setTimeout(forceScrollTop, 100);
  setTimeout(forceScrollTop, 400);
  setTimeout(forceScrollTop, 800);
  window.addEventListener('load', forceScrollTop, {once:true});
}

/* The company-logo transition between the home page and each case
   study is handled entirely in CSS via view-transition-name (see the
   top of site.css). The rows are plain links -- no JS involved. */


/* ---------- persistent header ---------- */
function initHeaderScroll(){
  const header = document.getElementById('siteHeader');
  if(!header) return;
  function checkScroll(){
    header.classList.toggle('scrolled', window.scrollY > 40);
  }
  checkScroll(); // in case the page loads already scrolled (e.g. back/forward nav)
  window.addEventListener('scroll', checkScroll, {passive:true});
}

/* ---------- CT contrast-adaptive color ----------
   Now that the header background is transparent, real page content
   (text, images, different section colors) scrolls directly behind the
   fixed CT logo. This detects what's actually behind CT's on-screen
   position as the page scrolls and only overrides CT's color when that
   background is genuinely too close in tone to stay legible -- CT keeps
   its normal page-default color (orange on home, maroon/light-gray
   elsewhere) the rest of the time. Reuses the same per-image pixel
   sampling approach as the custom cursor (see initCustomCursor), since
   the same problem -- "what color is really behind this fixed point,
   including inside arbitrary photos/screenshots" -- applies here too. */
function initHeaderContrast(){
  const logo = document.querySelector('.logo');
  if(!logo) return;

  function luminance(r,g,b){ return 0.299*r + 0.587*g + 0.114*b; }

  function parseRGB(colorStr){
    const m = colorStr && colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    return m ? [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])] : null;
  }

  // CT's true default color for the current page/theme -- deliberately
  // not read via getComputedStyle, since that could already reflect an
  // override from a previous check, creating a feedback loop.
  function defaultLogoColor(){
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const isHome = !!document.querySelector('#content .home-bio');
    if(isHome) return [254, 60, 1]; // var(--pink)
    return isDark ? [232, 232, 232] : [72, 28, 30]; // #E8E8E8 : #481C1E
  }

  const imageSamplers = new WeakMap();
  function getSampler(img){
    if(imageSamplers.has(img)) return imageSamplers.get(img);
    const w = 32;
    const h = Math.max(1, Math.round(w * (img.naturalHeight / img.naturalWidth || 1)));
    let ctx = null;
    try{
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      ctx = c.getContext('2d', {willReadFrequently:true});
      ctx.drawImage(img, 0, 0, w, h);
    } catch(e){ ctx = null; }
    const sampler = {ctx, w, h};
    imageSamplers.set(img, sampler);
    return sampler;
  }

  function colorBehindLogo(x, y){
    const stack = document.elementsFromPoint ? document.elementsFromPoint(x, y) : [];
    const behind = stack.find(el => !el.closest('#siteHeader'));
    if(!behind) return null;

    const imgEl = behind.tagName === 'IMG' ? behind : behind.closest('img');
    if(imgEl && imgEl.complete && imgEl.naturalWidth > 0){
      const sampler = getSampler(imgEl);
      if(sampler.ctx){
        const rect = imgEl.getBoundingClientRect();
        const relX = (x - rect.left) / rect.width;
        const relY = (y - rect.top) / rect.height;
        const sx = Math.min(sampler.w - 1, Math.max(0, Math.floor(relX * sampler.w)));
        const sy = Math.min(sampler.h - 1, Math.max(0, Math.floor(relY * sampler.h)));
        try{
          const px = sampler.ctx.getImageData(sx, sy, 1, 1).data;
          return [px[0], px[1], px[2]];
        } catch(e){ /* fall through to background-color walk */ }
      }
    }

    // Not an image: walk up for the nearest real (non-transparent)
    // background-color.
    let el = behind;
    while(el && el !== document.documentElement){
      const bg = getComputedStyle(el).backgroundColor;
      const rgb = parseRGB(bg);
      if(rgb && bg !== 'rgba(0, 0, 0, 0)') return rgb;
      el = el.parentElement;
    }
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return isDark ? [33, 33, 33] : [251, 246, 230];
  }

  function checkContrast(){
    const rect = logo.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const bg = colorBehindLogo(x, y);
    if(!bg) return;

    const bgLum = luminance(bg[0], bg[1], bg[2]);
    const fg = defaultLogoColor();
    const fgLum = luminance(fg[0], fg[1], fg[2]);

    const lowContrast = Math.abs(bgLum - fgLum) < 60;
    if(lowContrast){
      logo.classList.toggle('logo-contrast-dark', bgLum >= 128);
      logo.classList.toggle('logo-contrast-light', bgLum < 128);
    } else {
      logo.classList.remove('logo-contrast-dark', 'logo-contrast-light');
    }
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if(!ticking){
      requestAnimationFrame(() => { checkContrast(); ticking = false; });
      ticking = true;
    }
  }, {passive:true});
  checkContrast();
}

/* ---------- init ---------- */
function initPage(){
  applyThemeToDOM();
  applyLangToDOM();
  reorderPillarFromHash();
  initCustomCursor();
  initHeaderScroll();
  initHeaderContrast();
  tickClock();
  setInterval(tickClock, 15000);
  initScrollReveal();
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', initPage);
} else {
  initPage();
}
