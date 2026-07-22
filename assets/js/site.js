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
    btn.textContent = LANG === 'en' ? 'ESP' : 'ENG';
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
  // script finishing in time to be seen.
  const allTargets = document.querySelectorAll('.cs-subhead, .cs-section p, .cs-section-label, .section-title, .stat-row, .pillar-full h3, .pillar-body, .pillar-detail, .pillar-quote p, .pillar-quote-attribution, .body-copy p, .leadership-block p');
  let targets = Array.from(allTargets);
  if(targets.length === 0) return;

  function checkReveal(){
    const vh = window.innerHeight || document.documentElement.clientHeight;
    targets = targets.filter(el => {
      const rect = el.getBoundingClientRect();
      if(rect.top < vh * 0.92 && rect.bottom > 0){
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

/* All hero/case-study images stay visible immediately via CSS
   (.hero-img, .img-placeholder never get a hide-then-reveal treatment --
   see the clip-path comment in site.css for why). For text, only the
   very first headline+lede (above the fold) stay immediately visible;
   everything else fades in via initScrollReveal as the visitor scrolls
   to it, which is fine since that only affects content not yet seen. */

/* ---------- custom cursor ---------- */
function initCustomCursor(){
  const cursorEl = document.createElement('div');
  cursorEl.className = 'custom-cursor';
  document.body.appendChild(cursorEl);
  document.addEventListener('mousemove', (e) => {
    cursorEl.style.left = e.clientX + 'px';
    cursorEl.style.top = e.clientY + 'px';
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
  // The browser's native "scroll to #fragment" can fire after this script
  // runs, which would leave the page scrolled to the (now possibly moved)
  // element's position instead of the top. Defer so this wins, and apply
  // it consistently whether or not a DOM move was needed.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => window.scrollTo(0, 0));
  });
}

/* ---------- company row click: staged left-then-up clone animation ----------
   The clone and the real page content need to move in sync for the whole
   animation, not just land in the same spot. The real content can only be
   revealed by moving vertically (translateY) -- it has no way to also
   shift horizontally. So if the clone ever moves diagonally (both left
   and top changing at once) while the real content only moves
   vertically, their paths diverge for the whole animation and only meet
   at the very end -- which looks exactly like two separate icons
   converging, not one logo moving. To avoid that, horizontal and
   vertical motion are kept in two separate stages: the clone moves
   sideways FIRST (while the real content isn't visible yet at all), and
   only once it's already aligned horizontally does the vertical rise
   begin -- at which point both the clone (via `top`) and the real
   content (via `translateY`) are moving purely vertically, in sync.

   The destination position is estimated with a probe element sized to
   match the real logo exactly (same width/height as the real image) so
   the estimate is accurate up front, rather than guessing with an empty
   div and correcting later. */
function animateCompanyEnter(evt, destUrl){
  const row = evt.currentTarget;
  const logoEl = row.querySelector('.company-mark img, .company-mark .ai-native-icon-mark');
  const nameEl = row.querySelector('.company-name');
  if(!logoEl) return; // let the plain href handle navigation

  evt.preventDefault();
  evt.stopPropagation();

  const srcRect = logoEl.getBoundingClientRect();
  const isMask = logoEl.classList.contains('ai-native-icon-mark');
  const content = document.getElementById('content');
  const stagger = 450;

  // Build a probe that matches the real destination logo's own box
  // exactly (same tag, same width/height) instead of an empty div, so
  // the measured position is accurate from the start.
  const probeWrap = document.createElement('div');
  probeWrap.className = 'company-wordmark';
  let probeMark;
  if(isMask){
    probeMark = document.createElement('span');
    probeMark.className = 'ai-native-icon-mark';
  } else {
    probeMark = document.createElement('img');
    probeMark.width = 60;
    probeMark.height = 40;
  }
  probeWrap.appendChild(probeMark);
  content.insertBefore(probeWrap, content.firstChild);
  const destRect = probeMark.getBoundingClientRect();
  content.removeChild(probeWrap);
  const upDistance = srcRect.top - destRect.top;

  if(nameEl){ nameEl.style.transition = `opacity ${stagger}ms ease`; nameEl.style.opacity = '0'; }
  // Explicitly kill any transition this element might inherit from CSS
  // (e.g. a hover-state opacity transition on .company-mark img) and force
  // the browser to commit that *before* setting opacity. Without this, the
  // original icon can fade out gradually while the clone -- which starts
  // at this exact same spot -- is already sliding away, producing a
  // visible "doubled" icon for the length of that fade.
  logoEl.style.transition = 'none';
  logoEl.style.opacity = '0';
  void logoEl.offsetWidth; // force reflow so the no-transition state is committed

  let clone;
  if(isMask){
    clone = document.createElement('span');
    clone.className = 'ai-native-icon-mark';
  } else {
    clone = document.createElement('img');
    clone.src = logoEl.src;
    clone.alt = '';
    if(THEME === 'dark') clone.style.filter = 'invert(1)';
  }
  clone.style.position = 'fixed';
  clone.style.left = srcRect.left + 'px';
  clone.style.top = srcRect.top + 'px';
  clone.style.width = srcRect.width + 'px';
  clone.style.height = srcRect.height + 'px';
  clone.style.margin = '0';
  clone.style.transform = 'none';
  clone.style.zIndex = '10000';
  clone.style.pointerEvents = 'none';
  document.body.appendChild(clone);

  // STAGE 1: pure horizontal move. Width/height/top are never touched, so
  // there is no resize and no vertical drift during this phase. The real
  // page content is not shown at all yet, so there is nothing for the
  // clone to be out of sync with.
  requestAnimationFrame(() => {
    clone.style.transition = `left ${stagger}ms ease`;
    clone.style.left = destRect.left + 'px';
  });

  function applyNewContent(html, title){
    content.innerHTML = html;
    if(title) document.title = title;

    // Re-measure the real logo now that it actually exists, rather than
    // trusting the probe -- this is the actual final target for stage 2.
    // Every wordmark image now has explicit width/height, so this is
    // accurate immediately with no need to wait for the image to load.
    const realMark = content.querySelector('.company-wordmark');
    const realMarkImg = realMark ? (realMark.querySelector('img, .ai-native-icon-mark') || realMark) : null;
    const realDestRect = realMarkImg ? realMarkImg.getBoundingClientRect() : destRect;
    const realUpDistance = srcRect.top - realDestRect.top;

    content.style.transition = 'none';
    content.style.transform = `translateY(${realUpDistance}px)`;
    void content.offsetHeight; // force reflow so the transition below actually animates

    requestAnimationFrame(() => {
      // STAGE 2: the content block and the clone rise the same distance,
      // in sync -- both moving purely vertically now that stage 1 has
      // already aligned them horizontally -- so the logo and the page
      // arrive together with no divergence in their paths.
      content.style.transition = `transform ${stagger}ms ease`;
      content.style.transform = 'translateY(0)';
      clone.style.transition = `top ${stagger}ms ease`;
      clone.style.top = realDestRect.top + 'px';
      // Snap horizontal to the re-measured value too, in case it drifted
      // slightly from the probe's estimate -- this alone (with no
      // transition) can't produce a visible divergence, since it's a
      // one-time correction applied before stage 2's motion begins.
      clone.style.left = realDestRect.left + 'px';
    });

    setTimeout(() => {
      clone.remove();
      content.style.transition = '';
      content.style.transform = '';
      if(typeof applyLangToDOM === 'function') applyLangToDOM();
      if(typeof initScrollReveal === 'function') initScrollReveal();
      if(typeof reorderPillarFromHash === 'function') reorderPillarFromHash();
      if(typeof renderRoute !== 'function'){
        history.pushState({}, '', destUrl);
      }
    }, stagger + 30);
  }

  setTimeout(() => {
    // In the interactive preview, page content is already in memory.
    if(typeof ROUTES === 'object' && ROUTES[destUrl]){
      applyNewContent(ROUTES[destUrl].html, ROUTES[destUrl].title);
      return;
    }
    // In production, fetch the real destination page and lift its #content.
    fetch(destUrl).then(r => {
      if(!r.ok) throw new Error('fetch failed: ' + r.status);
      return r.text();
    }).then(html => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const newContent = doc.getElementById('content');
      applyNewContent(newContent ? newContent.innerHTML : '', doc.title);
    }).catch(() => {
      window.location.href = destUrl;
    });
  }, stagger);
}

// Keep the back/forward button correct after a pushState-based transition.
window.addEventListener('popstate', () => {
  location.reload();
});

/* ---------- init ---------- */
function initPage(){
  applyThemeToDOM();
  applyLangToDOM();
  reorderPillarFromHash();
  initCustomCursor();
  tickClock();
  setInterval(tickClock, 15000);
  initScrollReveal();
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', initPage);
} else {
  initPage();
}
