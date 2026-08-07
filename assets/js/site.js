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
  const allTargets = document.querySelectorAll('.cs-subhead, .cs-section p, .cs-section-label, .section-title, .stat-row, .pillar-full h3, .pillar-body, .pillar-detail, .pillar-quote p, .pillar-quote-attribution, body:not(:has(#content .home-bio)) .body-copy p, .leadership-block p, .hero-img:not(.hero-img-primary), .img-placeholder, body:has(#content .home-bio) .body-copy, body:has(#content .home-bio) .principles-list, body:has(#content .home-bio) .case-study-cta');
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

/* ---------- company row click: left, then up ----------
   The logo slides horizontally into the destination's column first, and
   only then rises -- carrying the incoming page up with it. Both move
   the same distance over the same interval, so the logo reads as
   dragging the page into place rather than racing it there.

   Everything animates transform and opacity, nothing else. The previous
   version animated left/top/width/height; those are layout properties
   and can never be composited, so every frame forced layout and paint on
   the main thread. Combined with replacing the page's innerHTML midway
   through the motion, and waiting on a fetch between the two stages, it
   could not have been smooth.

   Three things keep it smooth now:
     - the destination HTML is fetched on hover, so no network wait ever
       lands inside the animation;
     - the innerHTML swap happens in the still beat between the two
       stages, where a dropped frame is invisible;
     - stages are sequenced off Animation.finished, so none can be torn
       down before it has actually landed (the old code used setTimeout,
       which cut the clone loose early whenever a frame slipped). */

const companyPages = new Map();
let companyTransitionRunning = false;

function prefetchCompanyPage(url){
  if(companyPages.has(url)) return companyPages.get(url);
  const p = fetch(url)
    .then(r => r.ok ? r.text() : Promise.reject(new Error(r.status)))
    .then(html => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const c = doc.getElementById('content');
      return c ? {html:c.innerHTML, title:doc.title} : null;
    })
    .catch(() => null);
  companyPages.set(url, p);
  return p;
}

function initCompanyPrefetch(){
  document.querySelectorAll('.company-row[href]').forEach(row => {
    const warm = () => prefetchCompanyPage(row.getAttribute('href'));
    row.addEventListener('mouseenter', warm, {once:true, passive:true});
    row.addEventListener('touchstart', warm, {once:true, passive:true});
    row.addEventListener('focus', warm, {once:true});
  });
}

const CO_EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';
const CO_LEFT_MS = 380;
const CO_UP_MS = 440;
const CO_FADE_MS = 140;
const xy = (x, y) => 'translate3d(' + x + 'px,' + y + 'px,0)';

async function animateCompanyEnter(evt, destUrl){
  const row = evt.currentTarget;
  const content = document.getElementById('content');
  const logoEl = row.querySelector('.company-mark img, .company-mark .ai-native-icon-mark');

  // Anything unusual falls through to the plain href: a modifier click
  // (so open-in-new-tab still works), no logo to fly, a browser without
  // element.animate, reduced-motion, or a transition already running.
  if(!content || !logoEl || companyTransitionRunning) return;
  if(evt.metaKey || evt.ctrlKey || evt.shiftKey || evt.altKey || evt.button) return;
  if(typeof Element.prototype.animate !== 'function') return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  evt.preventDefault();
  evt.stopPropagation();
  companyTransitionRunning = true;

  // All the geometry below is viewport-relative, so pin the page to the
  // top first -- otherwise a scrolled home page would leave the
  // destination rendered at that same offset once the transform lifts.
  if(window.scrollY !== 0) window.scrollTo(0, 0);

  const srcRect = logoEl.getBoundingClientRect();
  // The destination wordmark always sits flush with the content column's
  // left edge, so the horizontal target is computable outright -- no
  // probe element, and no estimate to snap-correct later.
  const destX = content.getBoundingClientRect().left +
    parseFloat(getComputedStyle(content).paddingLeft);

  const isMask = logoEl.classList.contains('ai-native-icon-mark');
  // Dark-mode marks render white via filter:invert(1). The flying clone
  // lives on <body>, outside .company-mark, so it needs that invert
  // applied inline -- and it must be part of the cssText below, or the
  // assignment wipes it and the logo flashes black mid-flight.
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  let clone;
  if(isMask){
    clone = document.createElement('span');
    clone.className = 'ai-native-icon-mark';
  } else {
    clone = document.createElement('img');
    clone.src = logoEl.currentSrc || logoEl.src;
    clone.alt = '';
  }
  clone.setAttribute('aria-hidden', 'true');
  clone.style.cssText = 'position:fixed;left:0;top:0;margin:0;z-index:10000;' +
    'pointer-events:none;will-change:transform;width:' + srcRect.width +
    'px;height:' + srcRect.height + 'px;' +
    (isDark && !isMask ? 'filter:invert(1);' : '') +
    (isDark && isMask ? 'background-color:#BFC0C3;' : '');
  clone.style.transform = xy(srcRect.left, srcRect.top);
  document.body.appendChild(clone);

  // Kill any inherited transition before hiding the row's own logo, so it
  // cannot fade out slowly and read as a second copy beside the clone.
  logoEl.style.transition = 'none';
  logoEl.style.opacity = '0';
  const nameEl = row.querySelector('.company-name');
  if(nameEl){
    nameEl.animate([{opacity:1},{opacity:0}],
      {duration:CO_LEFT_MS, easing:'ease', fill:'forwards'});
  }

  const ready = prefetchCompanyPage(destUrl);

  // STAGE 1 -- horizontal only. The old page is still on screen and
  // untouched, so there is nothing for the clone to fall out of sync with.
  await clone.animate(
    [{transform: xy(srcRect.left, srcRect.top)},
     {transform: xy(destX, srcRect.top)}],
    {duration:CO_LEFT_MS, easing:CO_EASE, fill:'forwards'}
  ).finished;

  const data = await ready;
  if(!data){ window.location.href = destUrl; return; }

  // Swap the page in during the still beat: stage 1 has landed and stage
  // 2 has not started, so this layout cost cannot cost a frame of motion.
  content.innerHTML = data.html;
  if(data.title) document.title = data.title;

  const destMark = content.querySelector(
    '.company-wordmark img, .company-wordmark .ai-native-icon-mark');
  const destRect = destMark ? destMark.getBoundingClientRect() : null;
  const landX = destRect ? destRect.left : destX;
  const landY = destRect ? destRect.top : srcRect.top;
  const up = srcRect.top - landY;

  // Hold the real wordmark back until the clone has landed. The two are
  // not always the same size (AI Native's is wider), so they crossfade
  // instead of switching instantly.
  if(destMark) destMark.style.opacity = '0';

  // Seed the page's offset before animating so it can never paint one
  // frame at its final position first.
  content.style.willChange = 'transform';
  content.style.transform = xy(0, up);

  // STAGE 2 -- clone and page rise together, same distance, same curve.
  const pageRise = content.animate(
    [{transform: xy(0, up)}, {transform: xy(0, 0)}],
    {duration:CO_UP_MS, easing:CO_EASE, fill:'forwards'}
  );
  const logoRise = clone.animate(
    [{transform: xy(landX, srcRect.top)}, {transform: xy(landX, landY)}],
    {duration:CO_UP_MS, easing:CO_EASE, fill:'forwards'}
  );
  await Promise.all([pageRise.finished, logoRise.finished]);

  // Hand the logo over to the real element, then release the page. The
  // fill above is holding it at translate3d(0,0,0), which is already its
  // natural position, so clearing these is invisible.
  if(destMark){
    destMark.animate([{opacity:0},{opacity:1}],
      {duration:CO_FADE_MS, fill:'forwards'});
  }
  await clone.animate([{opacity:1},{opacity:0}],
    {duration:CO_FADE_MS, fill:'forwards'}).finished;
  clone.remove();
  if(destMark) destMark.style.opacity = '';
  content.style.transform = '';
  content.style.willChange = '';
  pageRise.cancel();

  history.pushState({}, '', destUrl);
  companyTransitionRunning = false;
  if(typeof applyLangToDOM === 'function') applyLangToDOM();
  if(typeof initScrollReveal === 'function') initScrollReveal();
  if(typeof reorderPillarFromHash === 'function') reorderPillarFromHash();
}

// pushState above leaves the browser's own rendering untouched, so a back
// step has to actually re-render the page it returns to.
window.addEventListener('popstate', () => { location.reload(); });


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

/* ---------- pillar toggle (collapsible values) ---------- */
function togglePillar(e){
  const button = e.currentTarget;
  const isExpanded = button.getAttribute('data-expanded') === 'true';

  if(isExpanded){
    button.setAttribute('data-expanded', 'false');
    return;
  }

  // Keep this toggle fixed in the viewport while other open sections
  // collapse (or the browser tries to scroll newly revealed content into
  // view). Without this, content above shrinking jumps everything up —
  // especially on mobile. Expanded copy should only push content below.
  const anchorTop = button.getBoundingClientRect().top;

  document.querySelectorAll('.pillar-toggle[data-expanded="true"]').forEach(otherBtn=>{
    otherBtn.setAttribute('data-expanded', 'false');
  });

  button.setAttribute('data-expanded', 'true');

  const lockScroll = ()=>{
    const delta = button.getBoundingClientRect().top - anchorTop;
    if(Math.abs(delta) > 0.5) window.scrollBy(0, delta);
  };
  lockScroll();
  const start = performance.now();
  const tick = (now)=>{
    lockScroll();
    // Cover the max-height transition (~300ms) plus a beat for mobile
    // focus/scroll adjustments.
    if(now - start < 400) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
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
  initCompanyPrefetch();
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', initPage);
} else {
  initPage();
}
