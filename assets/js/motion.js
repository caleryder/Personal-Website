/* Motion and header menu: line rise on load, image flash, collapsing header with hamburger menu, About page glide. */
(function(){
if(window.__pg) return; window.__pg=true;
var REDUCED=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var S={t:'rise',trigger:'load',speed:0.6};
var TREAT=[
 {k:'off',n:'Off',d:'The site as it is today.'},
 {k:'rise',n:'1. Line rise',d:'Each line lifts out from behind a mask. Editorial and calm.'},
 {k:'fade',n:'2. Soft fade-up',d:'Opacity and a short upward drift, block by block.'},
 {k:'focus',n:'3. Focus pull',d:'Blur resolves to sharp, like a lens settling.'},
 {k:'snap',n:'4. Snap cascade',d:'Fast with a slight overshoot. Rows slide in from the left.'},
 {k:'words',n:'5. Word flow',d:'Words arrive in reading order. Rows wipe in left to right.'}
];
var $=function(s){return [].slice.call(document.querySelectorAll(s));};
function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;}

var running=[], restores=[], ios=[];
function cancelAll(){
  $('.pg-item').forEach(function(e){e.classList.remove('pg-item');}); document.body.classList.remove('pg-hold');
  running.forEach(function(a){try{a.cancel();}catch(e){}}); running=[];
  ios.forEach(function(o){o.disconnect();}); ios=[];
  restores.forEach(function(f){f();}); restores=[];
}

function once(f){var d=false;var w=function(){if(d)return;d=true;f();};return w;}
/* ---- text splitting (restored afterwards, so layout is never left altered) ---- */
function tokens(node){
  /* words, with hyphenated compounds split after the hyphen so line breaks match the browser's */
  var txt=node.textContent, out=[], re=/\S+?-(?=\S)|\S+/g, m;
  while((m=re.exec(txt))){ var end=m.index+m[0].length; out.push({t:m[0],sp:/\s/.test(txt.charAt(end))}); }
  return out;
}
function splitLines(node){
  if(node.children.length) return null;
  var html=node.innerHTML, toks=tokens(node);
  if(!toks.length) return null;
  node.textContent='';
  var spans=toks.map(function(k){var s=el('span',null,k.t);node.appendChild(s);if(k.sp)node.appendChild(document.createTextNode(' '));return s;});
  var lines=[],lastTop=null;
  spans.forEach(function(s,i){var t=Math.round(s.offsetTop);if(lastTop===null||Math.abs(t-lastTop)>3){lines.push('');lastTop=t;}lines[lines.length-1]+=toks[i].t+(toks[i].sp?' ':'');});
  node.textContent='';
  var inner=lines.map(function(txt){var w=el('span','pg-l'),i=el('span','pg-li',txt.replace(/\s+$/,''));w.appendChild(i);node.appendChild(w);return i;});
  restores.push(once(function(){node.innerHTML=html;}));
  return inner;
}
function splitWords(node){
  if(node.children.length) return null;
  var html=node.innerHTML, toks=tokens(node);
  if(!toks.length) return null;
  node.textContent='';
  var out=toks.map(function(k){var s=el('span','pg-w',k.t);node.appendChild(s);if(k.sp)node.appendChild(document.createTextNode(' '));return s;});
  restores.push(once(function(){node.innerHTML=html;}));
  return out;
}

/* ---- items in reading order, grouped by region of the page ---- */
var PAGE_SEL='h1, .cs-subhead, .lede, .cs-section-label, .section-title, .values-label, .pillar-full h3, .pillar-full > .pillar-body, .pillar-build, .pillar-content .pillar-body, .pillar-detail, .pillar-quote p, .pillar-quote-attribution, .cs-section p, .body-copy p, .leadership-block p, .stat-row, .hero-img, .img-placeholder, .pg-about-copy p, .pg-about-img, .case-study-cta';
var BLOCK_SEL='.stat-row, .hero-img, .img-placeholder, .pg-about-img';
function leaf(n){ while(n.children.length===1 && n.textContent.trim()===n.children[0].textContent.trim()) n=n.children[0]; return n; }
function pageGroups(){
  var c=document.getElementById('content'); if(!c) return [];
  var items=[];
  if(c.querySelector('.cs-headline')){
    var h=c.querySelector('.cs-headline'); items.push({el:h,kind:'text'});
    [].slice.call(c.querySelectorAll('.role-meta > div')).forEach(function(d){items.push({el:d,kind:'text'});});
  }else if(c.querySelector('.pg-about-copy')){
    [].slice.call(c.querySelectorAll('.pg-about-copy p, .pg-about-img:not(.dup)')).forEach(function(e){items.push({el:e,kind:e.matches('.pg-about-img')?'block':'text'});});
  }
  return items.length?[{root:items[0].el,items:items}]:[];
}
function groups(){
  if(!document.querySelector('.home-bio')) return pageGroups();
  var g=[], hero=[];
  var k=document.querySelector('.home-kicker'); if(k) hero.push({el:k,kind:'text'});
  $('.company-row').forEach(function(r){hero.push({el:r,kind:'block'});});
  g.push({root:document.querySelector('.home-hero')||k,items:hero});
  $('.home-row').forEach(function(row){
    var items=[];
    $('.home-label').filter(function(l){return row.contains(l);}).forEach(function(l){items.push({el:l,kind:'text'});});
    [].slice.call(row.querySelectorAll('.home-bio, .body-copy p')).forEach(function(p){items.push({el:p,kind:'text'});});
    g.push({root:row,items:items});
  });
  var pr=document.querySelector('.home-principles');
  if(pr) g.push({root:pr,items:[].slice.call(pr.querySelectorAll('a')).map(function(a){return {el:a,kind:'text'};})});
  return g;
}

/* ---- the five treatments. Each returns Animation objects, created paused. ---- */
var SP=function(ms){return ms/S.speed;};
function mk(node,kf,o){
  var a=node.animate(kf,{duration:SP(o.d),delay:SP(o.delay||0),easing:o.e,fill:'both'});
  a.pause(); running.push(a); a.onfinish=function(){try{a.cancel();}catch(e){}}; return a;
}
var CLIPIN='inset(-30% -5% -30% -5%)';
var T={
 rise:function(it,i){
   if(it.kind==='block'){ var ri=it.el.classList.contains('company-row')?$('.company-row').indexOf(it.el):-1; return [mk(it.el,[{clipPath:'inset(0 0 100% 0)',transform:'translateY(.5em)'},{clipPath:CLIPIN,transform:'none'}],{d:ri>-1?650:800,delay:ri>-1?260+ri*340:i*80,e:'cubic-bezier(.16,1,.3,1)'})]; }
   var lines=splitLines(leaf(it.el)); if(!lines) return T.fade(it,i);
   return lines.map(function(l,j){return mk(l,[{transform:'translateY(110%)'},{transform:'none'}],{d:900,delay:i*90+j*70,e:'cubic-bezier(.16,1,.3,1)'});});
 },
 fade:function(it,i){return [mk(it.el,[{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'none'}],{d:700,delay:i*80,e:'cubic-bezier(.22,1,.36,1)'})];},
 focus:function(it,i){return [mk(it.el,[{opacity:0,filter:'blur(10px)',transform:'scale(.985)',transformOrigin:'left center'},{opacity:1,filter:'blur(0)',transform:'none',transformOrigin:'left center'}],{d:900,delay:i*100,e:'cubic-bezier(.2,.7,.2,1)'})];},
 snap:function(it,i){
   var from=it.kind==='block'?{opacity:0,transform:'translateX(-28px)'}:(it.el.classList.contains('home-label')?{opacity:0,transform:'none'}:{opacity:0,transform:'translateY(10px)'});
   return [mk(it.el,[from,{opacity:1,transform:'none'}],{d:320,delay:i*45,e:'cubic-bezier(.2,.9,.25,1.12)'})];
 },
 words:function(it,i){
   if(it.kind==='block') return [mk(it.el,[{clipPath:'inset(0 100% 0 0)'},{clipPath:CLIPIN}],{d:750,delay:i*80,e:'cubic-bezier(.65,0,.2,1)'})];
   var ws=splitWords(leaf(it.el)); if(!ws) return T.fade(it,i);
   return ws.map(function(w,j){return mk(w,[{opacity:0,transform:'translateY(.3em)'},{opacity:1,transform:'none'}],{d:520,delay:i*60+j*26,e:'cubic-bezier(.25,.8,.3,1)'});});
 }
};


/* ---- rapid flash of each company's hover image as the rows arrive (hints that there is more under hover) ---- */
var FLASH={on:true}, flashAnims=[];
var rowTimes=[];
function flashImages(){
  flashAnims.forEach(function(a){try{a.cancel();}catch(e){}}); flashAnims=[];
  var panel=document.querySelector('.home-hover');
  if(panel){ panel.style.overflow=''; [].forEach.call(panel.querySelectorAll('.pg-strip'),function(n){n.remove();}); }
  if(!FLASH.on||REDUCED||!panel||!document.querySelector('.home-bio')) return;
  var rows=$('.company-row[data-hover]'), starts=[];
  rows.forEach(function(r,k){ var t=rowTimes[k]; starts.push(t!=null?t:SP(280+k*340)); });
  var n=rows.length; if(n<2) return;
  var step=(starts[n-1]-starts[0])/(n-1);
  /* one continuous film strip, frames separated by a small gap: the last company
     is the leading (lowest) frame, so the strip comes down from above showing
     Stori's bottom edge first, with Meta joined to Stori's top edge, and so on.
     Frame k is centred in the panel when row k's copy appears. */
  var strip=document.createElement('div'); strip.className='pg-strip';
  strip.style.cssText='position:absolute;left:0;top:0;width:100%;height:'+(n*100)+'%;display:flex;flex-direction:column;will-change:transform;';
  for(var k=n-1;k>=0;k--){
    var src=panel.querySelector('img[data-for="'+rows[k].getAttribute('data-hover')+'"]'); if(!src) continue;
    var im=document.createElement('img'); im.src=src.currentSrc||src.src; im.alt='';
    im.style.cssText='position:static;display:block;width:100%;height:'+(100/n)+'%;flex:none;object-fit:contain;clip-path:none;box-sizing:border-box;padding:2.5% 0;';
    strip.appendChild(im);
  }
  panel.appendChild(strip); panel.style.overflow='hidden';
  var a=strip.animate([{transform:'translateY(-100%)'},{transform:'translateY('+(100/n)+'%)'}],
    {duration:(n+1)*step,delay:starts[0]-step,fill:'both',easing:'linear'});
  a.onfinish=function(){ strip.remove(); panel.style.overflow=''; };
  flashAnims.push(a);
}
function play(){
  rowTimes=[];
  cancelAll();
  document.body.classList.toggle('pg-anim',S.t!=='off');
  if(S.t==='off'||REDUCED){ flashImages(); return; }
  var fn=T[S.t], gs=groups();
  gs.forEach(function(g,gi){
    var anims=[], r0=restores.length;
    g.items.forEach(function(it,i){ var ai=fn(it,i); it.__anims=ai; anims=anims.concat(ai); });
    var mine=restores.slice(r0);
    /* put the text back exactly as it was as soon as this group has finished */
    Promise.all(anims.map(function(a){return a.finished.catch(function(){});})).then(function(){mine.forEach(function(f){f();});});
    var cleanup=function(){}; 
    g.items.forEach(function(it,i2){ if(it.el.classList&&it.el.classList.contains('company-row')){ var idx=$('.company-row[data-hover]').indexOf(it.el); var tm=null; try{ var m=it.__anims&&it.__anims[0]; if(m){var t=m.effect.getTiming(); tm=(+t.delay||0)+(+t.duration||0)*0.15;} }catch(e){} if(idx>-1) rowTimes[idx]=tm; } });
    if(S.trigger==='load'){
      var off=Math.min(gi*120,900); anims.forEach(function(a){var e=a.effect.getTiming();a.effect.updateTiming({delay:e.delay+SP(off)});a.play();});
    }else{
      var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){anims.forEach(function(a){a.play();});io.disconnect();}});},{threshold:.15,rootMargin:'0px 0px -6% 0px'});
      io.observe(g.root); ios.push(io);
    }
  });
  flashImages();
}
function replay(){window.scrollTo(0,0);play();}




/* ---- cursor: soft translucent disc that trails the pointer ---- */
var CUR={mode:'site',size:50,follow:0.16};
var disc=el('div','pg-disc'); document.body.appendChild(disc);
var dx=-200,dy=-200,tx=-200,ty=-200,dseen=false,draf=0,pressed=false;
function discTick(){
  dx+=(tx-dx)*CUR.follow; dy+=(ty-dy)*CUR.follow;
  disc.style.transform='translate3d('+(dx-CUR.size/2).toFixed(1)+'px,'+(dy-CUR.size/2).toFixed(1)+'px,0) scale('+(pressed?0.86:1)+')';
  draf=requestAnimationFrame(discTick);
}
document.addEventListener('mousemove',function(e){tx=e.clientX;ty=e.clientY;if(!dseen){dseen=true;dx=tx;dy=ty;} if(CUR.mode==='disc') disc.classList.add('pg-on');},true);
document.addEventListener('mouseleave',function(){disc.classList.remove('pg-on');});
document.addEventListener('mouseenter',function(){if(CUR.mode==='disc')disc.classList.add('pg-on');});
document.addEventListener('mousedown',function(){pressed=true;});
document.addEventListener('mouseup',function(){pressed=false;});
function setCursor(){
  var on=CUR.mode==='disc'&&window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  document.body.classList.toggle('pg-cur-disc',on);
  disc.style.width=disc.style.height=CUR.size+'px';
  cancelAnimationFrame(draf); if(on){disc.classList.toggle('pg-on',dseen);discTick();}else disc.classList.remove('pg-on');
  [].forEach.call(document.querySelectorAll('.pg-cm'),function(b){b.setAttribute('aria-pressed',String(b.getAttribute('data-v')===CUR.mode));});
  var sub=document.getElementById('pg-cursub'); if(sub) sub.hidden=CUR.mode!=='disc';
}


/* ---- results (stat rows on case study pages): number font, description position and weight ---- */
var NF=[
 {k:'cur',n:'Current (Cormorant Infant)',f:null},
 {k:'host',n:'Host Grotesk Bold',f:'"Host Grotesk","Helvetica Neue",Arial,sans-serif',w:700,s:1,ls:'-0.02em'},
 {k:'anton',n:'Anton',f:'"Anton",Impact,"Arial Narrow",sans-serif',w:400,s:1.5,ls:'0'},
 {k:'bebas',n:'Bebas Neue',f:'"Bebas Neue","Arial Narrow",Impact,sans-serif',w:400,s:1.75,ls:'0.01em'},
 {k:'league',n:'League Gothic',f:'"League Gothic","Arial Narrow",Impact,sans-serif',w:400,s:1.9,ls:'0'},
 {k:'oswald',n:'Oswald SemiBold',f:'"Oswald","Arial Narrow",sans-serif',w:600,s:1.3,ls:'0'},
 {k:'barlow',n:'Barlow Condensed Bold',f:'"Barlow Condensed","Arial Narrow",sans-serif',w:700,s:1.5,ls:'0'},
 {k:'six',n:'Six Caps (ultra narrow)',f:'"Six Caps","Arial Narrow",Impact,sans-serif',w:400,s:2.2,ls:'0'},
 {k:'sofia',n:'Sofia Sans Extra Condensed Black',f:'"Sofia Sans Extra Condensed","Arial Narrow",sans-serif',w:900,s:1.7,ls:'0'},
 {k:'antonio',n:'Antonio Bold',f:'"Antonio","Arial Narrow",sans-serif',w:700,s:1.6,ls:'0'},
 {k:'shoulders9',n:'Big Shoulders Black',f:'"Big Shoulders Display","Arial Narrow",sans-serif',w:900,s:1.55,ls:'0'},
 {k:'shoulders',n:'Big Shoulders Display',f:'"Big Shoulders Display","Arial Narrow",sans-serif',w:800,s:1.55,ls:'0'}
];
var DF=[
 {k:'cur',n:'Current (Host Grotesk)',f:null},
 {k:'inter',n:'Inter',f:'"Inter","Helvetica Neue",Arial,sans-serif'},
 {k:'dmsans',n:'DM Sans',f:'"DM Sans","Helvetica Neue",Arial,sans-serif'},
 {k:'space',n:'Space Grotesk',f:'"Space Grotesk","Helvetica Neue",Arial,sans-serif'},
 {k:'plex',n:'IBM Plex Sans',f:'"IBM Plex Sans","Helvetica Neue",Arial,sans-serif'},
 {k:'work',n:'Work Sans',f:'"Work Sans","Helvetica Neue",Arial,sans-serif'},
 {k:'oswald',n:'Oswald (condensed)',f:'"Oswald","Arial Narrow",sans-serif'},
 {k:'barlow',n:'Barlow Condensed',f:'"Barlow Condensed","Arial Narrow",sans-serif'}
];
var RS={font:'league',dfont:'cur',pos:'right',weight:'regular',cols:2,size:1.5};
function applyResults(){
  var root=document.documentElement,b=document.body.classList,f=NF.filter(function(x){return x.k===RS.font;})[0];
  b.toggle('pg-num',!!f.f);
  if(f.f){root.style.setProperty('--pg-nf',f.f);root.style.setProperty('--pg-nw',String(f.w));root.style.setProperty('--pg-ns',String(RS.size));root.style.setProperty('--pg-nls',f.ls);}
  var d=DF.filter(function(x){return x.k===RS.dfont;})[0]; b.toggle('pg-desc',!!d.f); if(d.f) root.style.setProperty('--pg-df',d.f);
  var ds=document.getElementById('pg-dfont'); if(ds) ds.value=RS.dfont;
  b.toggle('pg-statright',RS.pos==='right'); b.toggle('pg-statreg',RS.weight==='regular'); b.toggle('pg-statcols',RS.cols===2);
  var sz=document.getElementById('pg-nsize'); if(sz){sz.value=RS.size; document.getElementById('pg-nsizev').textContent=RS.size.toFixed(2)+'x';}
  [].forEach.call(document.querySelectorAll('[data-rk]'),function(x){x.setAttribute('aria-pressed',String(String(RS[x.getAttribute('data-rk')])===x.getAttribute('data-v')));});
  var fs=document.getElementById('pg-nfont'); if(fs) fs.value=RS.font;
}
function waitFor(sel,cb,ms){var t0=Date.now();(function p(){var e=document.querySelector(sel);if(e)return cb(e);if(Date.now()-t0<(ms||8000))setTimeout(p,150);})();}
function jumpToResults(){
  function go(){waitFor('.stat-row',function(e){e.scrollIntoView({block:'center',behavior:'smooth'});});}
  if(document.querySelector('.stat-row')) return go();
  function open(){var r=document.querySelector('.company-row[data-hover="stori"]'); if(r){r.click();go();}}
  if(document.querySelector('.company-row')) return open();
  var l=document.querySelector('.logo'); if(l) l.click(); waitFor('.company-row',open);
}



function ensureBuilder(){ shareGradient(); }


/* ---- About me page, opened from CALE (header logo) ---- */

/* CALE opens the About page (a real page at /about/); on the About page it goes home */
function fixLogo(){ var lg=document.querySelector('#siteHeader a.logo'); if(!lg) return; lg.setAttribute('href',document.querySelector('#content .pg-about')?'/':'/about/'); }
fixLogo();

/* ---- line spacing on the home page ---- */
var LS={bio:'',lead:'',prin:''};
var LSSEL={bio:'body .home-bio',lead:'body .home-row.section-block .body-copy,body .home-row.section-block .body-copy p',prin:'body .home-principles a'};
var lsStyle=document.createElement('style'); lsStyle.id='pg-ls'; document.head.appendChild(lsStyle);
function applyLS(){
  var css=''; Object.keys(LS).forEach(function(k){ if(LS[k]) css+=LSSEL[k]+'{line-height:'+LS[k]+' !important}\n'; });
  lsStyle.textContent=css;
}


/* ---- one gradient shared by the two AI titles, running top left to bottom right across both ---- */
function pageXY(e){var x=0,y=0;while(e){x+=e.offsetLeft;y+=e.offsetTop;e=e.offsetParent;}return {x:x,y:y};}
function shareGradient(){
  var a=document.querySelector('.company-row[data-hover="ai-native"] .company-name'), b=document.querySelector('.company-row[data-hover="recourse"] .company-name');
  [a,b].forEach(function(n){ if(n){n.classList.remove('pg-sg');n.style.removeProperty('--sgx');n.style.removeProperty('--sgy');n.style.removeProperty('--sgw');n.style.removeProperty('--sgh');} });
  if(!a||!b) return;
  var pa=pageXY(a), pb=pageXY(b);
  var L=Math.min(pa.x,pb.x), T=Math.min(pa.y,pb.y), R=Math.max(pa.x+a.offsetWidth,pb.x+b.offsetWidth), B=Math.max(pa.y+a.offsetHeight,pb.y+b.offsetHeight);
  [[a,pa],[b,pb]].forEach(function(p){ var n=p[0],o=p[1]; n.classList.add('pg-sg'); n.style.setProperty('--sgx',(L-o.x)+'px'); n.style.setProperty('--sgy',(T-o.y)+'px'); n.style.setProperty('--sgw',(R-L)+'px'); n.style.setProperty('--sgh',(B-T)+'px'); });
}
window.addEventListener('resize',shareGradient); window.addEventListener('load',function(){setTimeout(shareGradient,300);});
if(document.fonts&&document.fonts.ready) document.fonts.ready.then(shareGradient);


/* ---- palette icon options ---- */
var PI={
 palette:null,
 swatches:'<svg viewBox="0 0 14 14" fill="none" aria-hidden="true"><rect x="5.5" y="5.5" width="8" height="8" stroke="currentColor"/><rect x="0.5" y="0.5" width="8" height="8" fill="currentColor" stroke="currentColor"/></svg>',
 wheel:'<svg viewBox="0 0 14 14" aria-hidden="true"><foreignObject x="0" y="0" width="14" height="14"><div xmlns="http://www.w3.org/1999/xhtml" style="width:14px;height:14px;border-radius:50%;background:conic-gradient(from 0deg,#FACD74,#ED6A39,#C13488,#6058A6,#3A78F9,#5DAF6A,#FACD74)"></div></foreignObject></svg>',
 dropper:'<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M10.4 1.6a1.6 1.6 0 0 1 2.3 0l1.7 1.7a1.6 1.6 0 0 1 0 2.3l-1.9 1.9-4-4zM8.5 3.5l4 4M8.9 6.1l-6.2 6.2c-.3.3-.5.7-.5 1.1v1.1h1.1c.4 0 .8-.2 1.1-.5l6.2-6.2" stroke="currentColor" stroke-linejoin="round"/></svg>',
 half:'<svg viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="6.3" stroke="currentColor"/><path d="M7 .7a6.3 6.3 0 0 1 0 12.6z" fill="currentColor"/></svg>'
};
var PIORIG=null;
function applyPalIcon(k){
  var ic=document.querySelector('.pal-icon'); if(!ic) return;
  if(PIORIG===null) PIORIG=ic.innerHTML;
  ic.innerHTML=PI[k]||PIORIG;
}

/* ---- panel ---- */
var panel=el('div','pg-panel'); panel.id='pg';
var head=el('button','pg-head'); head.innerHTML='Playground <span>show</span>'; head.setAttribute('aria-expanded','false'); panel.classList.add('pg-closed');
var body=el('div','pg-body'); panel.appendChild(head); panel.appendChild(body);
head.onclick=function(){var c=panel.classList.toggle('pg-closed');head.lastChild.textContent=c?'show':'hide';head.setAttribute('aria-expanded',String(!c));};
document.addEventListener('mousedown',function(e){if(!panel.classList.contains('pg-closed')&&!panel.contains(e.target)&&!(e.target.closest&&e.target.closest('.pg-pal,.pg-pal-icon'))){panel.classList.add('pg-closed');head.lastChild.textContent='show';head.setAttribute('aria-expanded','false');}},true);
body.appendChild(el('div','pg-title','Image flash on load'));
var fseg=el('div','pg-seg'); [['on','On'],['off','Off']].forEach(function(o,k){var b=el('button',null,o[1]); b.type='button'; b.setAttribute('aria-pressed',String(k===0)); b.onclick=function(){
  FLASH.on=o[0]==='on';
  [].forEach.call(fseg.children,function(x,j){x.setAttribute('aria-pressed',String(j===k));});
  if(FLASH.on){ flashImages(); } else { flashAnims.forEach(function(a){try{a.cancel();}catch(e){}}); flashAnims=[]; }
}; fseg.appendChild(b);}); body.appendChild(fseg);
body.appendChild(el('div','pg-title','Line rise speed'));
var sr=el('div','pg-row'); var sl=el('span',null,'Speed'); var sv=el('span','pg-val','0.7x'); sr.appendChild(sl); sr.appendChild(sv); body.appendChild(sr);
var rg=el('input','pg-range'); rg.type='range'; rg.min='0.5'; rg.max='2'; rg.step='0.1'; rg.value='0.7'; rg.setAttribute('aria-label','Speed');
rg.oninput=function(){S.speed=+rg.value;sv.textContent=S.speed.toFixed(1)+'x';}; rg.onchange=function(){replay();}; body.appendChild(rg);
var ar=el('div','pg-actrow'); var rp=el('button','pg-act','Replay'); rp.type='button'; rp.onclick=replay; ar.appendChild(rp); body.appendChild(ar);
function applyCursorMode(){
  document.body.classList.toggle('pg-cur-arrow',CUR.mode==='off');
  setCursor();
}
/* ---- header collapses into a hamburger menu ---- */
var HM={mode:'off',open:false,top:18,right:40,force:false};
var hb=el('button','pg-hb'); hb.type='button'; hb.setAttribute('aria-label','Menu'); hb.setAttribute('aria-expanded','false');
var HB_ICON='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true"><path d="M4.5 9H19.5M10.5 15H19.5" stroke="currentColor" stroke-width="2" stroke-linecap="square"/></svg>';
var X_ICON='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true"><path d="M6 6L18 18M18 6L6 18" stroke="currentColor" stroke-width="1.4"/></svg>';
hb.innerHTML=HB_ICON;
var menu=el('div','pg-menu'); menu.setAttribute('role','menu');
document.body.appendChild(hb); document.body.appendChild(menu);
var HOME_ICON='<svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true"><path d="M1.5 7.2L8 1.8l6.5 5.4V14.5h-4.3V9.6H5.8v4.9H1.5V7.2z" stroke="currentColor" stroke-width="1"/></svg>';
function q1(s){return document.querySelector(s);}
function isES(){return document.documentElement.lang==='es';}
function copyColor(){
  var e=q1('#content .home-bio')||q1('#content .cs-headline')||q1('#content .pg-about-copy p')||q1('#content p')||q1('#content h1');
  var col=e?getComputedStyle(e).color:''; if(col&&!/rgba\(0, 0, 0, 0\)/.test(col)) document.documentElement.style.setProperty('--pg-copy',col);
  var bgc=getComputedStyle(document.body).backgroundColor; if(bgc&&!/rgba\(0, 0, 0, 0\)/.test(bgc)) document.documentElement.style.setProperty('--pg-pagebg',bgc);
}
function posHB(){ copyColor();
  var tr=q1('#siteHeader .top-row'), rg=q1('#siteHeader .top-row-right'); if(!tr||!rg) return;
  var cs=getComputedStyle(tr), r=rg.getBoundingClientRect();
  HM.right=parseFloat(cs.paddingRight)||40;
  if(r.height>0) HM.top=Math.max(8,r.top+r.height/2-22);
  document.documentElement.style.setProperty('--hb-right',HM.right+'px');
  document.documentElement.style.setProperty('--hb-top',HM.top+'px');
}
function setOpen(o){ copyColor();
  HM.open=!!o; hb.setAttribute('aria-expanded',String(HM.open));
  hb.innerHTML=HB_ICON;
  document.body.classList.toggle('pg-menu-open',HM.open);
  menu.classList.toggle('is-open',HM.open);
  if(HM.open){ buildMenu(); }
}
function fitIcon(v){ if(!v) return; var vb=v.getAttribute('viewBox'); if(!vb) return; var p=vb.trim().split(/[ ,]+/).map(Number), w=p[2], h=p[3], k=18/Math.max(w,h); v.setAttribute('width',(w*k).toFixed(2)); v.setAttribute('height',(h*k).toFixed(2)); v.style.width=(w*k).toFixed(2)+'px'; v.style.height=(h*k).toFixed(2)+'px'; }
function mItem(opts){
  var words=HM.mode==='words';
  var a=el(opts.href?'a':'button','pg-mi'); if(opts.href){a.href=opts.href; if(opts.blank){a.target='_blank'; a.rel='noopener';}} else a.type='button';
  a.setAttribute('role','menuitem'); if(opts.active) a.classList.add('is-active');
  if(words){ var dot=el('span','pg-mdot'); a.appendChild(dot); }
  var slot=el('span','pg-mslot'); if(opts.text){slot.textContent=opts.text; slot.classList.add('is-text');} else { slot.innerHTML=opts.icon; fitIcon(slot.querySelector('svg')); } a.appendChild(slot);
  if(words){ a.appendChild(el('span','pg-mlab',opts.label)); }
  else a.setAttribute('aria-label',opts.label);
  a.onclick=function(e){ if(opts.fn){ e.preventDefault(); opts.fn(a); } if(opts.close) setOpen(false); };
  return a;
}
function buildMenu(){
  var words=HM.mode==='words', es=isES(), dark=document.documentElement.getAttribute('data-theme')==='dark';
  menu.innerHTML=''; menu.className='pg-menu'+(words?' is-words':' is-icons')+(HM.open?' is-open':'');
  var home=!!q1('#content .home-bio'), about=!!q1('#content .pg-about');
  var L=es?{home:'Inicio',cale:'Acerca de',mail:'Correo',res:'Currículum',pal:'Paleta',light:'Modo claro',dark:'Modo oscuro',lang:'Español'}:{home:'Home',cale:'About',mail:'Email',res:'Resume',pal:'Colour palette',light:'Light mode',dark:'Dark mode',lang:'English'};
  var ic=function(s){var e=q1(s+' svg'); return e?e.outerHTML:'';};
  var themeBtn=q1('.theme-toggle.theme-icon');
  var items=[];
  var h=mItem({href:'/',icon:HOME_ICON,label:L.home,active:home&&!about,close:true});
  items.push(h);
  items.push(about?mItem({text:'ME',label:L.cale,active:true,close:true,fn:function(){window.scrollTo(0,0);}}):mItem({text:'ME',label:L.cale,href:'/about/'}));
  var liA=q1('.linkedin-box'), reA=q1('.resume-icon-btn'); var reH=reA?reA.getAttribute('href'):''; if(reH.charAt(0)==='/') reH='https://calethompson.com'+reH; if(reA) reA.href=reH;
  items.push(mItem({href:liA?liA.href:'https://www.linkedin.com/in/cale~thompson/',blank:true,icon:ic('.linkedin-box'),label:'LinkedIn',close:true}));
  items.push(mItem({icon:ic('.mail-icon-btn'),label:L.mail,fn:function(a){var b=q1('.mail-icon-btn'); if(b) b.click(); var cp=es?'COPIADO':'COPIED';
    a.classList.add('is-copied'); var sl=a.querySelector('.pg-mslot'), lb=a.querySelector('.pg-mlab');
    if(HM.mode==='words'){ if(lb) lb.textContent=es?'Correo copiado':'Email copied'; } else { sl.className='pg-mslot is-text'; sl.textContent=cp; }
    setTimeout(function(){ setOpen(false); },1400); }}));
  items.push(mItem({href:reH,blank:true,icon:ic('.resume-icon-btn'),label:L.res,close:true}));
  var pb=q1('.pal-icon');
  var pitem=mItem({icon:pb?pb.innerHTML:'',label:L.pal,fn:function(a){var o=!menu.classList.contains('sw-open'); menu.dataset.sw=o?'1':'0'; menu.classList.toggle('sw-open',o);}});
  var noPal=false;
  if(!noPal) items.push(pitem);
  var sw=el('div','pg-msw');
  [].forEach.call(document.querySelectorAll('.pal-sw'),function(s){
    var d=el('button','pg-msw-b'); d.type='button'; d.style.background=getComputedStyle(s).getPropertyValue('--c')||s.style.getPropertyValue('--c');
    d.style.setProperty('--c',s.style.getPropertyValue('--c')); d.style.background=s.style.getPropertyValue('--c');
    d.setAttribute('aria-label',s.getAttribute('aria-label')); d.setAttribute('aria-pressed',s.getAttribute('aria-pressed'));
    d.onclick=function(e){e.stopPropagation(); s.click(); menu.dataset.sw='0'; setOpen(false);};
    sw.appendChild(d);
  });
  if(!noPal) items.push(sw);
  items.push(mItem({icon:themeBtn?themeBtn.innerHTML:'',label:dark?L.light:L.dark,fn:function(){if(themeBtn) themeBtn.click();},close:true}));
  var lb=q1('.lang-toggle');
  items.push(mItem({text:lb?lb.textContent:'ENG',label:L.lang,fn:function(){if(lb) lb.click();},close:true}));
  items.forEach(function(i){menu.appendChild(i);});
  menu.classList.toggle('sw-open',menu.dataset.sw==='1');
}
hb.onclick=function(e){e.stopPropagation(); setOpen(!HM.open);};
window.addEventListener('click',function(e){ if(!e.isTrusted) return; var pth=e.composedPath?e.composedPath():[]; if(HM.open&&!MV.pin&&pth.indexOf(menu)<0&&pth.indexOf(hb)<0) setOpen(false); });
window.addEventListener('keydown',function(e){ if(e.key==='Escape'&&HM.open) setOpen(false); });
function checkCol(){
  var y=window.pageYOffset||document.documentElement.scrollTop||0;
  var on=HM.mode!=='off'&&(y>40||HM.force);
  if(!on&&y<=40) posHB();
  document.body.classList.toggle('pg-col',on);
  if(!on&&HM.open) setOpen(false);
}
window.addEventListener('scroll',checkCol,{passive:true});
new MutationObserver(function(){setTimeout(copyColor,60);}).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme','data-palette','class']});
new MutationObserver(function(){setTimeout(copyColor,120);}).observe(document.getElementById('content')||document.body,{childList:true});
window.addEventListener('resize',function(){posHB();});
function setHM(m){
  HM.mode=m; document.body.classList.toggle('pg-hm',m!=='off');
  document.body.classList.toggle('pg-hm-words',m==='words');
  if(m==='off'){ setOpen(false); document.body.classList.remove('pg-col'); }
  else { posHB(); checkCol(); if(HM.open) buildMenu(); }
}

/* ---- menu legibility dials ---- */
var MV={bg:36,ic:0,pin:false};
function applyMV(){
  if(!MV.touched) return;
  var r=document.documentElement.style;
  var bgc=MV.bg>=0?'#fff':'#000';
  r.setProperty('--pg-mbg','color-mix(in srgb,'+bgc+' '+Math.abs(MV.bg)+'%,var(--cream))');
  r.setProperty('--pg-mic',MV.ic?'color-mix(in srgb,#fff '+MV.ic+'%,var(--pg-copy,var(--pink)))':'var(--pg-copy,var(--pink))');
}
function dial(label,min,max,key,fmt){
  var row=el('div','pg-row'); var l=el('span',null,label); var v=el('span','pg-val',fmt(MV[key])); row.appendChild(l); row.appendChild(v); body.appendChild(row);
  var g=el('input','pg-range'); g.type='range'; g.min=min; g.max=max; g.step='2'; g.value=MV[key]; g.setAttribute('aria-label',label);
  g.oninput=function(){MV[key]=+g.value; MV.touched=true; v.textContent=fmt(MV[key]); applyMV();}; body.appendChild(g);
}
applyMV();
setHM('icons');
posHB();

applyCursorMode();
applyResults();
ensureBuilder();
function sync(){}
sync();
/* coming back to the home page from another page plays the current treatment */
function tagItems(){ groups().forEach(function(g){g.items.forEach(function(it){it.el.classList.add('pg-item');});}); }
function waitIdle(n){ if(typeof companyTransitionRunning!=='undefined'&&companyTransitionRunning&&n<200) return setTimeout(function(){waitIdle(n+1);},50); requestAnimationFrame(play); }
new MutationObserver(function(){
  requestAnimationFrame(function(){
    ensureBuilder(); fixLogo();
    if(S.t==='off'||REDUCED){ document.body.classList.remove('pg-anim'); return; }
    cancelAll(); tagItems(); document.body.classList.add('pg-hold'); waitIdle(0);
  });
}).observe(document.getElementById('content'),{childList:true});
setTimeout(play,60);
})();
