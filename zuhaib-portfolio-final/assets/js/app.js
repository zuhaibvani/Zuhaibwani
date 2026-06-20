/* ============ MEDIA PROTECTION ============
   Deterrents against casual download/lifting. Note: any browser must load
   media to display it, so determined extraction is impossible to fully block
   on ANY site — real ownership protection is the embedded copyright metadata
   (EXIF/IPTC/XMP on images, tags on video) baked into every file. */
(function(){
  // block right-click / long-press context menu on images & video
  document.addEventListener('contextmenu',e=>{
    if(e.target.closest('img,video,.gcell,.fmedia,.lb,.pdfv-stage,canvas'))e.preventDefault();
  },{capture:true});
  // block drag-to-desktop on images
  document.addEventListener('dragstart',e=>{
    if(e.target.tagName==='IMG'||e.target.closest('img,video'))e.preventDefault();
  },{capture:true});
  // block common save/print shortcuts
  document.addEventListener('keydown',e=>{
    const k=e.key.toLowerCase();
    if((e.ctrlKey||e.metaKey)&&(k==='s'||k==='p'||k==='u')){
      // allow in form fields only
      if(!/input|textarea/i.test(e.target.tagName)){e.preventDefault();}
    }
  });
  // make all images non-draggable + non-selectable as they appear
  function harden(){
    document.querySelectorAll('img:not([data-h]),video:not([data-h])').forEach(el=>{
      el.setAttribute('draggable','false');
      el.setAttribute('data-h','1');
      el.style.webkitUserSelect='none';el.style.userSelect='none';
      el.style.webkitTouchCallout='none';
    });
  }
  harden();
  new MutationObserver(harden).observe(document.documentElement,{childList:true,subtree:true});
})();

/* ============ SFX ENGINE ============ */
const SFX={ctx:null,on:localStorage.getItem('zw_sfx')!=='off' && !matchMedia('(prefers-reduced-motion:reduce)').matches,
 init(){if(!this.ctx){try{this.ctx=new (AudioContext||webkitAudioContext)();}catch(e){}}},
 tone(f,d,t='sine',v=.04,slide){if(!this.on||!this.ctx)return;const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=t;o.frequency.value=f;if(slide)o.frequency.exponentialRampToValueAtTime(slide,this.ctx.currentTime+d);g.gain.setValueAtTime(v,this.ctx.currentTime);g.gain.exponentialRampToValueAtTime(.0001,this.ctx.currentTime+d);o.connect(g);g.connect(this.ctx.destination);o.start();o.stop(this.ctx.currentTime+d);},
 tick(){this.tone(1400,.04,'sine',.018)},pop(){this.tone(420,.09,'sine',.05,160)},
 whoosh(){this.tone(180,.22,'sine',.05,60)},chirp(){this.tone(640,.07,'sine',.05);setTimeout(()=>this.tone(920,.09,'sine',.05),70)},
 sw(){this.tone(300,.08,'square',.03,500)}};
addEventListener('pointerdown',()=>SFX.init(),{once:true});
let lastTick=0;
document.addEventListener('mouseover',e=>{if(e.target.closest('a,button,.card,.frow,.chip,.rec')&&Date.now()-lastTick>90){lastTick=Date.now();SFX.tick();}});
document.addEventListener('click',e=>{if(e.target.closest('a,button,.card,.frow'))SFX.pop();});
const sfxBtn=document.getElementById('sfxBtn');
function paintSfx(){sfxBtn.textContent=SFX.on?'🔊':'🔇';}
sfxBtn.addEventListener('click',()=>{SFX.on=!SFX.on;localStorage.setItem('zw_sfx',SFX.on?'on':'off');SFX.sw();paintSfx();});paintSfx();

/* ============ THEME ============ */
const themeBtn=document.getElementById('themeBtn');
let theme=localStorage.getItem('zw_theme')||'dark';
function applyTheme(){document.documentElement.dataset.theme=theme;themeBtn.textContent=theme==='dark'?'☀️':'🌙';}
themeBtn.addEventListener('click',()=>{theme=theme==='dark'?'light':'dark';localStorage.setItem('zw_theme',theme);SFX.sw();applyTheme();});
applyTheme();

/* ============ PROJECT DATA ============ */


/* ============ RENDER FEATURED ============ */
const featEl=document.getElementById('featured');
P.filter(p=>p.featured).forEach((p,i)=>{
  const r=document.createElement('article');r.className='frow reveal';
  r.innerHTML=`<div class="fmedia"><span class="idx">0${i+1}</span><img loading="lazy" src="${p.covers.all}" alt="${p.title}"/></div>
  <div class="fbody"><span class="fcat">${p.catLabel}</span><h3>${p.title}</h3><p>${p.blurb}</p>
  <div class="fmeta">${p.tools.slice(0,3).map(t=>`<span>${t}</span>`).join('')}</div>
  <span class="fgo">Open project <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></div>`;
  r.addEventListener('click',()=>openProject(p.id));
  featEl.appendChild(r);
});

/* ============ RENDER CARDS (multi-cat, swap covers) ============ */
const cardsEl=document.getElementById('cards');
P.forEach((p,i)=>{
  const hasVid=p.hero.type!=='img';
  const c=document.createElement('div');c.className='card reveal';
  c.dataset.cats=p.cats.join(',');c.dataset.id=p.id;
  c.innerHTML=`<img loading="lazy" src="${p.covers.all}" alt="${p.title}"/><div class="shade"></div>
  <span class="cidx">${String(i+1).padStart(2,'0')}</span>
  ${hasVid?'<div class="cvid"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>':''}
  <div class="cbody"><div class="ccat">${p.catLabel}</div><h3>${p.title}</h3><div class="cline"></div></div>`;
  c.addEventListener('click',()=>openProject(p.id));
  cardsEl.appendChild(c);
});
document.querySelectorAll('.fbtn').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('.fbtn').forEach(x=>x.classList.remove('active'));
  b.classList.add('active');const f=b.dataset.f;
  document.querySelectorAll('.card').forEach(c=>{
    const cats=c.dataset.cats.split(',');const show=f==='all'||cats.includes(f);
    c.classList.toggle('hide',!show);
    if(show){const p=P.find(x=>x.id===c.dataset.id);
      const src=(p.covers[f]||p.covers.all);const img=c.querySelector('img');
      if(!img.src.endsWith(src)){img.style.opacity=0;setTimeout(()=>{img.src=src;img.style.opacity=1;},220);}}
  });
}));

/* ============ MODAL v3 ============ */
const pm=document.getElementById('pm'),pmInner=document.getElementById('pminner');
let LBLIST=[],LBIDX=0;
function mediaHTML(m,idx){
  if(m.type==='yt'){const vid=(m.src.split('/embed/')[1]||'').split(/[?&]/)[0];return `<iframe src="https://www.youtube-nocookie.com/embed/${vid}?rel=0&modestbranding=1&iv_load_policy=3&playsinline=1" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowfullscreen loading="lazy" title="${m.cap||'Showreel'}"></iframe>`;}
  if(m.type==='video'){return `<video src="${m.src}" ${m.poster?`poster="${m.poster}"`:''} controls controlsList="nodownload noremoteplayback" disablePictureInPicture oncontextmenu="return false" draggable="false" playsinline preload="metadata"></video>`;}
  if(m.type==='sketchfab'){const j=m.src.includes('?')?'&':'?';return `<iframe class="sk" src="${m.src}${j}ui_infos=0&ui_inspector=0&ui_watermark_link=0&ui_help=0&ui_settings=0&ui_vr=0&ui_ar=0&dnt=1" sandbox="allow-scripts allow-same-origin allow-popups" allow="autoplay; fullscreen; xr-spatial-tracking" allowfullscreen loading="lazy" title="Interactive 3D model"></iframe>`;}
  if(m.type==='pdf')return `<a href="${m.src}" target="_blank" rel="noopener noreferrer" style="display:block;position:relative"><img loading="lazy" src="${m.poster||'assets/img/presentation-1.jpg'}" alt="Interactive PDF preview"/><span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(8,9,12,.45);color:#fff;font-family:'Space Grotesk';font-weight:600;font-size:15px;gap:9px">Open interactive PDF ↗</span></a>`;
  return `<img loading="lazy" src="${m.src}" alt="${m.cap||''}" data-lb="${idx}"/>`;
}
let PDFQUEUE=[];
/* ============ CUSTOM PDF VIEWER (PDF.js, fully controlled) ============
   Pages render to <canvas>, so there are NO browser download / print / save
   controls. Acrobat-style continuous scroll with Fit-Width / Fit-Page, page
   flipping via the on-screen arrows and the keyboard (Arrows in Fit-Page,
   PageUp/Down, Home/End), and a persistent copyright stamp. A browser must
   fetch a file to display it, so this deters casual lifting; it cannot make a
   public file un-saveable. */
function pdfExitMax(){
  document.querySelectorAll('.pdfv.maxed').forEach(v=>{
    v.classList.remove('maxed');
    // move the element back to its original spot in the modal (it was portaled to <body>)
    if(v._ph && v._ph.parentNode){ v._ph.parentNode.insertBefore(v, v._ph); }
    // reset the Fullscreen button label
    const fb=v.querySelector('.fsBtn'); if(fb) fb.textContent='\u2922 Fullscreen';
    if(v._relayout) setTimeout(v._relayout,60);
  });
  document.body.classList.remove('pdf-maxed');
}
const PDF_PAD=16;
function renderPDFs(){
  if(!window.pdfjsLib){ PDFQUEUE.forEach(({id})=>{const r=document.getElementById(id);const sc=r&&r.querySelector('.pdfv-scroll');if(sc)sc.innerHTML='<div class="pdfv-err">Viewer failed to load.</div>';}); PDFQUEUE=[]; return; }
  try{ pdfjsLib.GlobalWorkerOptions.workerSrc='assets/js/vendor/pdf.worker.min.js'; }catch(e){}
  PDFQUEUE.forEach(({id,src})=>{
    const root=document.getElementById(id); if(!root) return;
    const stage=root.querySelector('.pdfv-stage');
    const scroll=root.querySelector('.pdfv-scroll');
    const fsBtn=root.querySelector('.fsBtn'), modeBtn=root.querySelector('.pmode');
    const prevBtn=root.querySelector('.pprev'), nextBtn=root.querySelector('.pnext');
    const curEl=root.querySelector('.pcur'), totEl=root.querySelector('.ptot');
    if(!scroll) return;
    let doc=null, mode='paged', pages=[], rendered=new Set(), cur=1, total=0, ready=false, lastAspect=1.3;
    let zoom=1; const ZMIN=1, ZMAX=2.5, ZSTEP=0.25;
    const canvasMeta=new Map(); // page n -> {cv, baseW, baseH}  (lets zoom resize without re-rendering)
    const zout=root.querySelector('.zout'), zin=root.querySelector('.zin'), zlabel=root.querySelector('.zlabel');
    function setZoom(z){
      z=Math.max(ZMIN,Math.min(ZMAX, Math.round(z*100)/100));
      zoom=z;
      canvasMeta.forEach(m=>{ m.cv.style.width=(m.baseW*zoom)+'px'; m.cv.style.height=(m.baseH*zoom)+'px'; });
      root.classList.toggle('zoomed', zoom>1.02);
      if(zlabel) zlabel.textContent=Math.round(zoom*100)+'%';
    }
    if(zout) zout.addEventListener('click',()=>{ setZoom(zoom-ZSTEP); SFX.tick(); });
    if(zin) zin.addEventListener('click',()=>{ setZoom(zoom+ZSTEP); SFX.tick(); });
    if(zlabel) zlabel.addEventListener('click',()=>{ setZoom(1); SFX.tick(); });
    // resolves an internal PDF link "dest" (string named-dest, or explicit dest array) to a 1-based page number
    async function resolveDest(dest){
      try{
        let d=dest;
        if(typeof d==='string') d=await doc.getDestination(d);
        if(!d||!d[0]) return null;
        const idx=await doc.getPageIndex(d[0]);
        return idx+1;
      }catch(_){ return null; }
    }
    // converts a PDF-space link rect into percentages of the page (so it tracks zoom with pure CSS, no recompute)
    function annotRectPct(vp,rect){
      const r=vp.convertToViewportRectangle(rect);
      const x1=Math.min(r[0],r[2]), x2=Math.max(r[0],r[2]);
      const y1=Math.min(r[1],r[3]), y2=Math.max(r[1],r[3]);
      return { l:x1/vp.width*100, t:y1/vp.height*100, w:(x2-x1)/vp.width*100, h:(y2-y1)/vp.height*100 };
    }
    // scale ONE page using its OWN intrinsic viewport (handles mixed page sizes/orientations)
    function scaleForPage(vp){
      const w=Math.max(40, scroll.clientWidth-PDF_PAD*2);
      if(mode==='scroll') return w/vp.width;
      const h=Math.max(40, scroll.clientHeight-PDF_PAD*2);
      return Math.min(w/vp.width, h/vp.height);
    }
    function renderPage(n){
      if(rendered.has(n)||!doc) return; rendered.add(n);
      doc.getPage(n).then(page=>{
        const vp1=page.getViewport({scale:1});           // this page's real size
        lastAspect=vp1.height/vp1.width;                 // remember real ratio for provisional sizing
        const sc=scaleForPage(vp1), dpr=window.devicePixelRatio||1;
        const cssW=vp1.width*sc, cssH=vp1.height*sc;
        const rv=page.getViewport({scale:sc*dpr});
        const wrap=pages[n-1]; if(!wrap) return;
        // canvas-plus-links live in a relative box so links overlay the page and scale with zoom
        const box=document.createElement('div'); box.className='pdfv-pagebox';
        box.style.width=(cssW*zoom)+'px'; box.style.height=(cssH*zoom)+'px';
        const cv=document.createElement('canvas');
        cv.width=Math.floor(rv.width); cv.height=Math.floor(rv.height);
        cv.style.width='100%'; cv.style.height='100%';
        box.appendChild(cv);
        if(mode==='scroll'){ wrap.style.minHeight='0px'; wrap.style.height='auto'; }
        else { wrap.style.minHeight='0px'; wrap.style.height='auto'; }
        wrap.innerHTML=''; wrap.appendChild(box);
        canvasMeta.set(n,{cv:box, baseW:cssW, baseH:cssH});  // box is what we resize on zoom
        page.render({canvasContext:cv.getContext('2d',{alpha:false}),viewport:rv});
        // ---- clickable links (TOC / index / external URLs) ----
        page.getAnnotations({intent:'display'}).then(anns=>{
          const vpL=page.getViewport({scale:1});
          anns.filter(a=>a.subtype==='Link' && (a.dest||a.url||a.action)).forEach(a=>{
            const pct=annotRectPct(vpL,a.rect);
            const el=document.createElement(a.url?'a':'button');
            el.className='pdfv-link';
            el.style.cssText=`left:${pct.l}%;top:${pct.t}%;width:${pct.w}%;height:${pct.h}%`;
            if(a.url){ el.href=a.url; el.target='_blank'; el.rel='noopener noreferrer'; el.setAttribute('aria-label','Open link'); }
            else { el.type='button'; el.setAttribute('aria-label','Go to section');
              el.addEventListener('click',async()=>{ const p=await resolveDest(a.dest); if(p){ goTo(p); SFX.tick(); } }); }
            box.appendChild(el);
          });
        }).catch(()=>{});
      }).catch(()=>{ rendered.delete(n); });
    }
    const io=new IntersectionObserver(es=>{ es.forEach(e=>{ if(e.isIntersecting) renderPage(+e.target.dataset.pg); }); },{root:scroll,rootMargin:'600px 0px'});
    function applyPaged(){
      io.disconnect(); rendered.clear(); canvasMeta.clear(); zoom=1; if(zlabel)zlabel.textContent='100%'; root.classList.remove('zoomed');
      pages.forEach((el,i)=>{ el.innerHTML=''; el.style.height='auto'; el.style.display=(i===cur-1)?'flex':'none'; });
      renderPage(cur); if(curEl)curEl.textContent=cur;
    }
    function applyScroll(){
      rendered.clear(); io.disconnect(); canvasMeta.clear(); zoom=1; if(zlabel)zlabel.textContent='100%'; root.classList.remove('zoomed');
      // provisional height per page based on the last known aspect ratio (most PDFs are uniform)
      const provW=Math.max(40, scroll.clientWidth-PDF_PAD*2);
      const provH=Math.round(provW*lastAspect);
      pages.forEach(el=>{ el.innerHTML=''; el.style.display='block'; el.style.minHeight=provH+'px'; el.style.height='auto'; io.observe(el); });
      renderPage(cur); // render the page the user is on right away so positioning is accurate
      if(curEl)curEl.textContent=cur;
    }
    function relayout(){ if(!ready||!root.isConnected) return; (mode==='paged'?applyPaged:applyScroll)(); }
    root._relayout=relayout;
    function goTo(n){
      n=Math.max(1,Math.min(total,n)); cur=n;
      if(mode==='paged'){ applyPaged(); }
      else { const el=pages[n-1]; if(el) scroll.scrollTo({top:el.offsetTop-PDF_PAD,behavior:'smooth'}); if(curEl)curEl.textContent=n; }
    }
    pdfjsLib.getDocument({url:src,isEvalSupported:false}).promise.then(d=>{ doc=d; total=d.numPages; if(totEl)totEl.textContent=total;
        for(let n=1;n<=total;n++){ const el=document.createElement('div'); el.className='pdfv-page'; el.dataset.pg=n; scroll.appendChild(el); pages.push(el); }
        ready=true; relayout();
        try{ if(root.closest('.pm')) scroll.focus({preventScroll:true}); }catch(_){}
      })
      .catch(()=>{ scroll.innerHTML='<div class="pdfv-err">Unable to display this document.</div>'; });
    let st; scroll.addEventListener('scroll',()=>{ if(mode!=='scroll')return; clearTimeout(st); st=setTimeout(()=>{
      const mid=scroll.scrollTop+scroll.clientHeight/2; let acc=0,idx=1;
      for(let i=0;i<pages.length;i++){ acc+=pages[i].offsetHeight+16; idx=i+1; if(mid<=acc) break; }
      cur=idx; if(curEl)curEl.textContent=cur;
    },70); });
    if(prevBtn)prevBtn.addEventListener('click',()=>{goTo(cur-1);SFX.tick();});
    if(nextBtn)nextBtn.addEventListener('click',()=>{goTo(cur+1);SFX.tick();});
    if(modeBtn){
      const lbl=()=>modeBtn.textContent=(mode==='paged'?'\u229f Scroll':'\u2750 Flip');
      root.classList.add('paged'); lbl();
      modeBtn.addEventListener('click',()=>{
        mode=(mode==='paged'?'scroll':'paged');
        root.classList.toggle('paged', mode==='paged'); lbl(); relayout();
        if(mode==='scroll'){ const el=pages[cur-1]; if(el) setTimeout(()=>{scroll.scrollTop=Math.max(0,el.offsetTop-PDF_PAD);},30); }
        SFX.pop();
      });
    }
    let sx=0,sy=0,sti=0;
    stage.addEventListener('touchstart',e=>{ const t=e.changedTouches[0]; sx=t.clientX; sy=t.clientY; sti=Date.now(); },{passive:true});
    stage.addEventListener('touchend',e=>{ if(mode!=='paged'||zoom>1.02||e.changedTouches.length>1)return; const t=e.changedTouches[0]; const dx=t.clientX-sx, dy=t.clientY-sy;
      if(Math.abs(dx)>42 && Math.abs(dx)>Math.abs(dy)*1.4 && Date.now()-sti<700){ goTo(cur+(dx<0?1:-1)); SFX.tick(); } },{passive:true});

    // ---- ZOOM: Ctrl/Cmd + wheel (desktop) ----
    scroll.addEventListener('wheel',e=>{ if(e.ctrlKey||e.metaKey){ e.preventDefault(); setZoom(zoom + (e.deltaY<0?ZSTEP:-ZSTEP)); } },{passive:false});

    // ---- ZOOM: pinch (mobile) + double-tap to toggle 1x/2x ----
    let pinchBase=0, lastTap=0;
    function dist(t){ const a=t[0],b=t[1]; return Math.hypot(a.clientX-b.clientX, a.clientY-b.clientY); }
    scroll.addEventListener('touchstart',e=>{ if(e.touches.length===2){ pinchBase=dist(e.touches); } },{passive:true});
    scroll.addEventListener('touchmove',e=>{ if(e.touches.length===2 && pinchBase){ e.preventDefault(); const r=dist(e.touches)/pinchBase; setZoom(zoom*r); pinchBase=dist(e.touches); } },{passive:false});
    scroll.addEventListener('touchend',e=>{ if(e.touches.length<2) pinchBase=0;
      if(e.changedTouches.length===1 && e.touches.length===0){ const now=Date.now(); if(now-lastTap<300){ setZoom(zoom>1.02?1:2); SFX.tick(); lastTap=0; } else lastTap=now; } },{passive:true});

    scroll.setAttribute('tabindex','0');
    scroll.addEventListener('keydown',e=>{
      if(e.key==='ArrowRight'||e.key==='PageDown'){e.preventDefault();goTo(cur+1);}
      else if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();goTo(cur-1);}
      else if(e.key==='Home'){e.preventDefault();goTo(1);}
      else if(e.key==='End'){e.preventDefault();goTo(total);}
    });
    scroll.addEventListener('mousedown',()=>{ try{scroll.focus({preventScroll:true});}catch(_){scroll.focus();} });
    if(fsBtn){
      fsBtn.addEventListener('click',()=>{
        const goingFull = !root.classList.contains('maxed');
        const keep=cur;
        if(goingFull){
          // A position:fixed element is trapped by the fixed #pm ancestor's containing block,
          // so it renders relative to the scrolled modal (off-screen). Portal it to <body> to escape.
          if(!root._ph){ root._ph=document.createComment('pdfv-home'); root.parentNode.insertBefore(root._ph, root); }
          document.body.appendChild(root);
          root.classList.add('maxed'); document.body.classList.add('pdf-maxed');
          fsBtn.textContent='\u2921 Exit';
        } else {
          // restore into its original place in the modal
          root.classList.remove('maxed'); document.body.classList.remove('pdf-maxed');
          if(root._ph && root._ph.parentNode){ root._ph.parentNode.insertBefore(root, root._ph); }
          fsBtn.textContent='\u2922 Fullscreen';
        }
        requestAnimationFrame(()=>{ requestAnimationFrame(()=>{
          cur=keep;
          relayout();
          if(mode==='scroll'){
            const el=pages[cur-1];
            if(el) scroll.scrollTop=Math.max(0, el.offsetTop - PDF_PAD);
          } else {
            scroll.scrollTop=0;
          }
          try{scroll.focus({preventScroll:true});}catch(_){}
        }); });
        SFX.pop();
      });
    }
    let rz; addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(relayout,160);});
  });
  PDFQUEUE=[];
}

function openProject(id){
  const p=P.find(x=>x.id===id);if(!p)return;
  SFX.whoosh();LBLIST=[];let li=0;PDFQUEUE=[];
  if(Z.open)Z.toggle(false);
  const collect=m=>{if(m.type==='img'||m.type==='video'){LBLIST.push(m);return li++;}return -1;};
  const heroIdx=collect(p.hero);
  const heroTall=p.hero.ratio && p.hero.ratio!=='16/9';
  const heroIsPdf=p.hero.type==='pdf';
  // Flatten ALL gallery items (img + video) into ONE grid; collect PDFs as embedded viewers.
  const cells=[];const docs=[];
  if(heroIsPdf)docs.push({src:p.hero.src,cap:(p.title.replace(/—.*/,'').trim())+' — page through the document'});
  const heroSrc=p.hero&&p.hero.src?p.hero.src:'';
  (p.groups||[]).forEach(g=>{
    g.items.forEach(it=>{
      if(it.type==='pdf'){docs.push({src:it.src,cap:it.cap||g.name});return;}
      if(it.type==='img'&&it.src===heroSrc)return; // skip duplicate of hero
      const lbi=(it.type==='img'||it.type==='video')?collect(it):-1;
      cells.push({...it,group:g.name,lbi});
    });
  });
  const galleryHTML = cells.length?`
    <div class="pm-gallery"><div class="gtitle">Gallery <span style="color:var(--ink-3);font-weight:400;letter-spacing:0;text-transform:none">· ${cells.length} ${cells.length>1?'items':'item'}</span></div>
      <div class="ggrid">${cells.map(c=>{
        const ico=c.type==='video'?'<div class="ico">▶</div>':c.type==='sketchfab'?'<div class="ico">◆</div>':'';
        const click=(c.type==='img'||c.type==='video')?`onclick="openLB(${c.lbi})"`:`onclick="openLB(${heroIdx})"`;
        const thumb=c.type==='img'?c.src:(c.poster||p.hero.poster||p.hero.src);
        return `<div class="gcell" ${click}><img loading="lazy" src="${thumb}" alt="${c.cap||''}"/>${ico}${c.cap?`<div class="cc"><span class="cc-cap">${c.cap}</span>${c.group?`<span class="cc-grp">${c.group}</span>`:''}</div>`:''}</div>`;
      }).join('')}</div>
    </div>`:'';
  const docsHTML = docs.length?`
    <div class="pm-docs">${docs.map((d,i)=>{
      const pvid='pdfv_'+i;
      PDFQUEUE.push({id:pvid,src:d.src});
      return `<div class="pdfv" id="${pvid}" data-src="${d.src}">
        <div class="pdfv-head"><div class="di">📄</div><div class="dn">${d.cap}</div><div class="pdfv-copyright">© Zuhaib Wani</div></div>
        <div class="pdfv-stage"><div class="pdfv-scroll"></div></div>
        <div class="pdfv-bar">
          <div class="pdfv-pagectl">
            <button class="pbtn pprev" aria-label="Previous page">‹</button>
            <span class="pg"><b class="pcur">1</b> / <span class="ptot">–</span></span>
            <button class="pbtn pnext" aria-label="Next page">›</button>
          </div>
          <div class="pacts">
            <div class="pzoom">
              <button class="pbtn zout" aria-label="Zoom out">−</button>
              <button class="pbtn zlabel" aria-label="Reset zoom" title="Reset zoom">100%</button>
              <button class="pbtn zin" aria-label="Zoom in">+</button>
            </div>
            <button class="pbtn pmode">⊟ Scroll</button>
            <button class="pbtn fsBtn">⤢ Fullscreen</button>
          </div>
        </div>
      </div>`;
    }).join('')}</div>`:'';
  document.getElementById('pmBarTitle').textContent=p.title.replace(/—.*/,'').trim();
  pmInner.innerHTML=`
   <div class="pm-cat">${p.catLabel}</div><h2>${p.title}</h2>
   ${heroIsPdf?docsHTML:`<div class="pm-hero ${heroTall?'tall':''}">${mediaHTML(p.hero,heroIdx)}</div>`}
   <div class="pm-strip">
     <div class="si"><div class="k">Role</div><div class="v">${p.role}</div></div>
     <div class="si"><div class="k">Type</div><div class="v">${p.type}</div></div>
     <div class="si"><div class="k">Tools</div><div class="chips">${p.tools.map(t=>`<span>${t}</span>`).join('')}</div></div>
     <div class="si"><div class="k">Deliverables</div><div class="chips">${p.deliver.map(t=>`<span>${t}</span>`).join('')}</div></div>
   </div>
   <div class="pm-desc">${p.desc.map(d=>`<p>${d}</p>`).join('')}</div>
   ${heroIsPdf?'':docsHTML}
   ${galleryHTML}`;
  renderPDFs();
  setTimeout(()=>{const fp=document.querySelector('#pm .pdfv-scroll');if(fp){try{fp.focus({preventScroll:true});}catch(_){fp.focus();}}},160);
  pm.classList.add('open');document.body.style.overflow='hidden';document.body.classList.add('pm-open');pm.scrollTop=0;
}

function closeProject(){pdfExitMax();SFX.whoosh();pm.classList.remove('open');pmInner.innerHTML='';document.body.style.overflow='';document.body.classList.remove('pm-open');}
document.getElementById('pmclose').addEventListener('click',closeProject);
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){if(document.querySelector('.pdfv.maxed')){e.preventDefault();pdfExitMax();return;}closeProject();closeLB();}
  if(lb.classList.contains('open')){if(e.key==='ArrowRight')lbStep(1);if(e.key==='ArrowLeft')lbStep(-1);}
});

/* lightbox with nav */
const lb=document.getElementById('lb'),lbimg=document.getElementById('lbimg'),lbCnt=document.getElementById('lbCnt');
function openLB(i){LBIDX=i;paintLB();lb.classList.add('open');if(!document.body.classList.contains('pm-open')){document.body.style.overflow='hidden';}document.body.classList.add('lb-open');SFX.pop();}
function paintLB(){const m=LBLIST[LBIDX];const vid=document.getElementById('lbvid');
  if(m.type==='video'){lbimg.style.display='none';lbimg.src='';vid.style.display='block';vid.src=m.src;if(m.poster)vid.poster=m.poster;vid.play().catch(()=>{});}
  else{vid.pause();vid.style.display='none';vid.src='';lbimg.style.display='block';lbimg.src=m.src;lbimg.alt=m.cap||'';}
  lbCnt.textContent=`${LBIDX+1} / ${LBLIST.length}${m.cap?' — '+m.cap:''}`;}
function lbStep(d){LBIDX=(LBIDX+d+LBLIST.length)%LBLIST.length;paintLB();SFX.tick();}
function closeLB(){lb.classList.remove('open');lbimg.src='';const vid=document.getElementById('lbvid');vid.pause();vid.src='';document.body.classList.remove('lb-open');if(!document.body.classList.contains('pm-open')){document.body.style.overflow='';}}
document.getElementById('lbPrev').addEventListener('click',()=>lbStep(-1));
document.getElementById('lbNext').addEventListener('click',()=>lbStep(1));
document.getElementById('lbClose').addEventListener('click',closeLB);
lb.addEventListener('click',e=>{if(e.target===lb)closeLB();});
lb.addEventListener('touchmove',e=>{if(e.target===lb||e.target.classList.contains('lb')){e.preventDefault();}},{passive:false});
let _lx=0,_ly=0,_lt=0;
lb.addEventListener('touchstart',e=>{const t=e.changedTouches[0];_lx=t.clientX;_ly=t.clientY;_lt=Date.now();},{passive:true});
lb.addEventListener('touchend',e=>{const t=e.changedTouches[0];const dx=t.clientX-_lx,dy=t.clientY-_ly;if(Math.abs(dx)>42&&Math.abs(dx)>Math.abs(dy)*1.4&&Date.now()-_lt<700){lbStep(dx<0?1:-1);}},{passive:true});
pmInner.addEventListener('click',e=>{const t=e.target.closest('[data-lb]');if(t&&t.dataset.lb!==''&&t.dataset.lb!=null)openLB(+t.dataset.lb);});
pm.addEventListener('dblclick',e=>{if(!/input|textarea/i.test(e.target.tagName))e.preventDefault();});

/* ============ RECS ============ */
function initials(n){return n.split(' ').filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase();}
function recCard(r,clamp){return `<div class="rec ${clamp?'clamp':''}"><div class="quote">"</div><p>${r.t}</p>${clamp?'<div class="more">Tap to read full ↓</div>':''}<div class="who"><div class="ava">${initials(r.n)}</div><div><div class="nm">${r.n}</div><div class="ti">${r.r}</div></div>${r.ig?`<a class="ig" href="https://www.instagram.com/${r.ig}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">@${r.ig}</a>`:''}</div></div>`;}
const liEl=document.getElementById('recs-li');
liEl.innerHTML=RECS_LI.map(r=>recCard(r,true)).join('')+RECS_LI.map(r=>recCard(r,true)).join('');
// Only show the "read full" prompt where the text is genuinely clamped.
// Measured AFTER web fonts load — before that, metrics are wrong and short
// quotes wrongly keep a useless "tap to read full".
function refreshRecClamps(){
  liEl.querySelectorAll('.rec').forEach(c=>{
    if(c.classList.contains('full')) return;           // user-expanded card: leave it alone
    c.classList.add('clamp');                           // keep clamping ON so overflow stays measurable
    const p=c.querySelector('p'); if(!p) return;
    const overflowing=p.scrollHeight-p.clientHeight>6;
    let m=c.querySelector('.more');
    if(overflowing){
      if(!m){ m=document.createElement('div'); m.className='more'; m.textContent='Tap to read full ↓'; c.insertBefore(m,c.querySelector('.who')); }
      else { m.style.display='block'; }
      c.style.cursor='pointer';
      if(!c._wired){
        c._wired=true;
        c.addEventListener('click',()=>{
          c.classList.toggle('full');
          document.getElementById('railWrap').classList.toggle('paused',c.classList.contains('full'));
          const mm=c.querySelector('.more'); if(mm)mm.style.display=c.classList.contains('full')?'none':'block';
          SFX.pop();
        });
      }
    } else {
      if(m) m.remove();                                  // fits → no prompt, regardless of prior state
      c.style.cursor='';
    }
  });
}
(document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(refreshRecClamps);
setTimeout(refreshRecClamps,700);
addEventListener('resize',()=>{clearTimeout(window.__recRz);window.__recRz=setTimeout(refreshRecClamps,200);});
if('ResizeObserver' in window){
  const _ro=new ResizeObserver(()=>{clearTimeout(window.__recRz);window.__recRz=setTimeout(refreshRecClamps,150);});
  _ro.observe(liEl);
  const _rw=document.getElementById('railWrap'); if(_rw)_ro.observe(_rw);
}
document.getElementById('recs-cl').innerHTML=RECS_CL.map(r=>recCard(r,false)).join('');
document.querySelectorAll('#recs-cl .rec').forEach(card=>{
  let raf;card.addEventListener('mousemove',e=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{
    const r=card.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
    card.style.transform=`rotateY(${x*7}deg) rotateX(${-y*7}deg) translateY(-4px)`;});});
  card.addEventListener('mouseleave',()=>{cancelAnimationFrame(raf);card.style.transform='';});
});

/* RAIL MANUAL NAV — pauses animation, scrolls by card width */
(function(){
  const rail=document.getElementById('railWrap'),track=document.getElementById('recs-li');
  let manual=false;
  function nudge(dir){
    if(!manual){manual=true;track.style.animation='none';
      const cs=getComputedStyle(track);const mx=new DOMMatrix(cs.transform).m41;track.style.transform=`translateX(${mx}px)`;rail.scrollLeft=-mx;track.style.transform='none';}
    rail.scrollBy({left:dir*398,behavior:'smooth'});SFX.tick();
  }
  rail.style.overflowX='hidden';
  document.getElementById('railPrev').addEventListener('click',()=>nudge(-1));
  document.getElementById('railNext').addEventListener('click',()=>nudge(1));
})();

/* SCROLL TOP + FAB HIDE ON SCROLL DOWN */
const toTop=document.getElementById('toTop'),fab=document.getElementById('zuvi-fab');
let lastY=0;
addEventListener('scroll',()=>{
  const y=scrollY;
  toTop.classList.toggle('show',y>700);
  if(y>lastY+8&&y>300){fab.style.transform='translateY(90px)';}
  else if(y<lastY-8){fab.style.transform='';}
  lastY=y;
});
toTop.addEventListener('click',()=>{scrollTo({top:0,behavior:'smooth'});SFX.pop();});

/* ZUVI BUBBLE — pops 1-2 times to explain itself */
(function(){
  const bub=document.getElementById('zuvi-bubble'),txt=document.getElementById('bubbleTxt'),bx=document.getElementById('bubbleX');
  let shown=0;const lines=["Hi! I'm <b>Zuvi</b> 👋 Ask me anything about Zuhaib.","Psst — I can open projects or grab his CV for you. Tap me!"];
  function pop(i){if(Z.open||sessionStorage.getItem('zuvi_seen'))return;txt.innerHTML=lines[i];bub.classList.add('show');SFX.chirp();
    setTimeout(()=>bub.classList.remove('show'),6000);}
  bx.addEventListener('click',()=>{bub.classList.remove('show');sessionStorage.setItem('zuvi_seen','1');});
  setTimeout(()=>pop(0),3500);
  setTimeout(()=>{if(!Z.open)pop(1);},16000);
})();

/* ============ NAV / REVEALS / HERO ============ */
const nav=document.getElementById('nav');
addEventListener('scroll',()=>{nav.classList.toggle('scrolled',scrollY>40);});
const burger=document.getElementById('burger'),nl=document.getElementById('navlinks');
function setMenu(open){burger.classList.toggle('open',open);nl.classList.toggle('open',open);document.body.classList.toggle('menu-open',open);}
burger.addEventListener('click',()=>setMenu(!nl.classList.contains('open')));
nl.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.1});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
(function(){const s=[...document.querySelectorAll('#heroBg .slide')];let i=0;setInterval(()=>{s[i].classList.remove('on');i=(i+1)%s.length;s[i].classList.add('on');},6500);})();
(function(){const l=document.getElementById('loader'),bar=document.getElementById('lbar'),pct=document.getElementById('lpct');
 if(sessionStorage.getItem('zw_loaded')){l.classList.add('done');return;}
 let p=0;
 const t=setInterval(()=>{p=Math.min(p+Math.random()*24,100);bar.style.width=p+'%';pct.textContent=Math.floor(p)+'%';
 if(p>=100){clearInterval(t);sessionStorage.setItem('zw_loaded','1');setTimeout(()=>l.classList.add('done'),250);}},110);})();
(function(){return; /* custom cursor disabled — kept code dormant to reduce desktop novelty overload */
 if(matchMedia('(pointer:coarse)').matches||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
 const c=document.getElementById('cursor');let x=0,y=0,cx=0,cy=0;
 addEventListener('mousemove',e=>{x=e.clientX;y=e.clientY;});
 (function loop(){cx+=(x-cx)*.16;cy+=(y-cy)*.16;c.style.left=cx+'px';c.style.top=cy+'px';requestAnimationFrame(loop);})();
 document.addEventListener('mouseover',e=>{const card=e.target.closest('.card,.frow');const link=e.target.closest('a,button,.chip,.fbtn');
 c.classList.toggle('view',!!card);c.classList.toggle('link',!card&&!!link);c.textContent=card?'VIEW':'';});})();
(function(){const c=document.getElementById('bg-canvas');if(!c)return;
 const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;const ctx=c.getContext('2d');let w,h,pts,raf;
 const N=innerWidth<760?28:54;
 function cols(){const lt=document.documentElement.dataset.theme==='light';const la=lt?'rgba(232,76,34,':'rgba(255,92,53,';const pc=lt?'rgba(60,64,75,.45)':'rgba(164,169,180,.45)';return [la,pc];}
 function size(){w=c.width=c.offsetWidth*devicePixelRatio;h=c.height=c.offsetHeight*devicePixelRatio;}
 function init(){size();pts=Array.from({length:N},()=>({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.16*devicePixelRatio,vy:(Math.random()-.5)*.16*devicePixelRatio}));}
 function draw(){const[la,pc]=cols();ctx.clearRect(0,0,w,h);
  for(let i=0;i<pts.length;i++){const p=pts[i];p.x+=p.vx;p.y+=p.vy;
   if(p.x<0||p.x>w)p.vx*=-1;if(p.y<0||p.y>h)p.vy*=-1;
   for(let j=i+1;j<pts.length;j++){const q=pts[j],dx=p.x-q.x,dy=p.y-q.y,d=Math.hypot(dx,dy),mx=130*devicePixelRatio;
    if(d<mx){ctx.strokeStyle=la+(0.10*(1-d/mx))+')';ctx.lineWidth=devicePixelRatio;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();}}
   ctx.fillStyle=pc;ctx.beginPath();ctx.arc(p.x,p.y,1.2*devicePixelRatio,0,7);ctx.fill();}
  raf=requestAnimationFrame(draw);}
 init();draw();if(reduce)cancelAnimationFrame(raf);
 addEventListener('resize',()=>{cancelAnimationFrame(raf);init();if(!reduce)draw();});})();

/* ============ ZUVI ============ */
const Z={
 open:false,
 el:document.getElementById('zuvi'),fab:document.getElementById('zuvi-fab'),
 body:document.getElementById('zBody'),chips:document.getElementById('zChips'),
 greeted:false,
 say(html,delay=600){const t=document.createElement('div');t.className='z-msg bot z-typing';t.innerHTML='<i></i><i></i><i></i>';this.body.appendChild(t);this.scroll();
  setTimeout(()=>{t.classList.remove('z-typing');t.innerHTML=html;SFX.chirp();this.scroll();},delay);},
 user(txt){const d=document.createElement('div');d.className='z-msg user';d.textContent=txt;this.body.appendChild(d);this.scroll();},
 scroll(){this.body.scrollTop=this.body.scrollHeight;},
 chipsSet(arr){this.chips.innerHTML=arr.map(c=>`<button data-q="${c}">${c}</button>`).join('');
  this.chips.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{this.ask(b.dataset.q);}));},
 ask(q){this.user(q);setTimeout(()=>this.answer(q.toLowerCase().trim(),q),350);},
 pick(arr){return arr[Math.floor(Math.random()*arr.length)];},
 answer(q,raw){
  const open=(id,nm)=>{this.say(this.pick([`Sure — opening <b>${nm}</b> now 🎬`,`On it. Here's <b>${nm}</b> 👇`,`Let me pull up <b>${nm}</b> for you.`]),400);setTimeout(()=>{this.toggle(false);openProject(id);},900);};
  const has=(...w)=>w.some(x=>q.includes(x));
  const rx=re=>re.test(q);
  const wantsOpen=rx(/\b(show|open|see|view|pull up|let me see|can i see)\b/)||q.length<22;

  // --- direct project requests (only when clearly asking to SEE one) ---
  if(rx(/ue5|unreal|real.?time|gamif/)&&(wantsOpen||has('project','environment')))return open('ue5','the UE5 Real-Time Environment');
  if(rx(/casio|edifice|watch/)&&(wantsOpen||has('film','3d')))return open('casio','the Casio product film');
  if(rx(/neura/)&&(wantsOpen||has('brand','campaign')))return open('neurasphere','NeuraSphere');
  if(rx(/\bvfx\b|drone|fantasy/)&&(wantsOpen||has('breakdown')))return open('vfx','the VFX Breakdown');
  if(rx(/samovar/))return open('samovar','the live 3D Samovar');
  if(rx(/windmill|game asset/)&&wantsOpen)return open('windmill','the Medieval Windmill game asset');
  if(rx(/postle/)&&wantsOpen)return open('postle','the Postle brand identity');
  if(rx(/kraftshala/)&&wantsOpen)return open('kraftshala','the Kraftshala landing page');

  // --- CV ---
  if(rx(/\bcv\b|resume|curriculum/)){const cv=window.__cvHref||'assets/docs/Zuhaib_Wani_CV_Neutral.pdf';return this.say(this.pick([
    `Here's his CV: <a href="${cv}" download target="_blank" rel="noopener noreferrer">📄 Download Zuhaib's CV (PDF)</a>. It covers his full experience, skills and key projects across visual, motion, 3D and real-time work.`,
    `You can download it here: <a href="${cv}" download target="_blank" rel="noopener noreferrer">📄 Zuhaib's CV (PDF)</a> — full career history, tools and achievements in one place.`]));}

  // --- OFF-TOPIC GUARD (deflect politely instead of pretending to know) ---
  if(rx(/weather|temperature|forecast|raining|snowing|cricket|football|soccer|match score|stock price|bitcoin|crypto price|capital of|who is the (president|pm|prime minister)|what.?s the time|what day is|today.?s date|\brecipe\b|translate this|movie recommend|\bsong\b|lyrics|2\s*\+\s*2|meaning of life|how old are you|your age/))
    return this.say(this.pick([
      `That's outside what I cover — I'm here specifically for <b>Zuhaib</b>: his work, skills, experience and how to get in touch. Ask me anything about those.`,
      `I'll be honest — I only know <b>Zuhaib's</b> world, so I can't help there. But ask about his projects, experience or availability and I'm all yours. The <b>✉️ Message tab</b> reaches him directly for anything else.`]));

  // --- ARE YOU AI / WHO ARE YOU (the bot itself) ---
  if(rx(/are you (a |an )?(ai|bot|robot|human|real|chatgpt|llm|gpt)|you a bot|you real|what are you\b|who made you|how do you work/))
    return this.say(this.pick([
      `I'm <b>Zuvi</b> — a small, hand-scripted guide Zuhaib built into this site. Not a live AI and no big model behind me: just curated answers about his work, so I'm fast, free and never make things up. For anything I can't cover, the <b>✉️ Message tab</b> goes straight to the real Zuhaib.`,
      `Just <b>Zuvi</b> 🙂 a lightweight scripted helper, not a live AI. Zuhaib kept me deliberately simple — I know his work, story and skills cold, and hand off to him directly for the rest.`]));

  // --- SALARY / RATE / BUDGET ---
  if(rx(/salary|\brate\b|rates|charge|how much|budget|\bprice\b|pricing|\bpay\b|compensation|\bctc\b|\blpa\b|\bfee\b|day rate|cost to hire/))
    return this.say(this.pick([
      `He keeps numbers to a real conversation — they depend on scope, mode (freelance vs full-time) and timeline. Quickest path: drop the details in the <b>✉️ Message tab</b> and he'll come back with something specific and fair.`,
      `Fair to ask — but rate and salary depend on the brief, so he talks specifics directly rather than posting a figure. Tell him what you have in mind via the <b>Message tab</b> and he'll reply quickly.`]));

  // --- AVAILABILITY / ROLES / NOTICE / FULL-TIME vs FREELANCE / REMOTE ---
  if(rx(/full.?time|freelance|contract|notice period|start date|when can he (start|join)|joining|relocat|on.?site|\bremote\b|hybrid|\broles?\b|position|opening|\bjob\b|art director|creative lead|what.*looking for|hiring him/))
    return this.say(this.pick([
      `He's open to both <b>senior creative roles</b> (Senior Designer, Creative Lead, Art Director) and <b>freelance / contract</b> work — and he's flexible on setup: <b>remote, hybrid or on-site</b> all work for him, including <b>Delhi NCR</b>. Available to start soon — that green dot up top means he's around. Use the <b>Message tab</b> to talk specifics.`,
      `Two tracks: full-time <b>senior creative / lead / art-director</b> roles, and freelance projects alongside. He's open to <b>remote, hybrid or on-site</b> (including <b>Delhi NCR</b>) and can start quickly. Drop a note via the <b>Message tab</b> and he'll line up a call.`]));

  // --- CLIENTS / WHO HAS HE WORKED FOR / REFERENCES ---
  if(rx(/clients?|worked (with|for|alongside)|companies he|brands? he|who has he work|who.?s he worked|references|testimonial|recommendation/)&&!has('culture','collaborat'))
    return this.say(this.pick([
      `A real mix — a global engineering consultancy (<b>Mott MacDonald</b>), an immersive-tech team building real-time work, and freelance brand projects for startups and names like <b>Philips / Signify</b> through an agency. Big corporate to scrappy startup, all in one CV. There are also seven named recommendations further down the page.`,
      `From multinational (<b>Mott MacDonald</b>) to immersive tech to direct freelance for founders and brands. Scroll to the <b>recommendations</b> section for what colleagues and clients actually say about working with him.`]));

  // --- EDUCATION / SELF-TAUGHT ---
  if(rx(/educat|degree|study|studied|college|university|qualif|self.?taught|how did he learn|where did he learn/))
    return this.say(this.pick([
      `Largely <b>self-taught</b> on the craft — he built the skill set himself in Sopore, far from any studio scene, alongside a Bachelor's degree from the University of Kashmir. The portfolio is the real qualification: seven years of work that speaks for itself.`,
      `A self-taught designer (with a BA from the University of Kashmir) — the kind who learned by making, not in design school. Small town, no shortcuts, global-standard output.`]));

  // --- LANGUAGES ---
  if(rx(/languages?|speaks?|multilingual|\benglish\b|\bhindi\b|\burdu\b/))
    return this.say(`He works in <b>English</b> for all professional projects, and also speaks <b>Hindi</b>, <b>Urdu</b> and <b>Kashmiri</b>. Communication has never been the bottleneck — remote teams across time zones included.`);

  // --- SPECIFIC SOFTWARE ---
  if(rx(/blender|cycles|eevee/))return this.say(`<b>Blender</b> is one of his core tools — full pipeline: modelling, PBR texturing, lighting, animation and compositing. The Casio film and the Medieval Windmill game asset are both built start-to-finish in Blender.`);
  if(rx(/after effects|\bae\b|premiere|\bediting\b/))return this.say(`Motion is a big part of his work — <b>After Effects</b> and <b>Premiere Pro</b> for motion graphics, 2D animation and editing. The Now Engage launch film shows the 2D-motion-plus-3D side.`);
  if(rx(/unreal|\bue5\b|blueprint|game engine/))return this.say(`<b>Unreal Engine 5</b> is his real-time discipline — interactive walkthroughs, environments and Blueprint logic. Open the <b>UE5 Real-Time Environment</b> project to see it.`);
  if(rx(/\bfigma\b|adobe xd|interface design/))return this.say(`For UI he works in <b>Figma</b> (and Adobe XD) — the Kraftshala landing page is a good example. UI is one tool in a broader kit rather than his whole identity.`);

  // --- FAVOURITE / BEST / MOST PROUD ---
  if(rx(/\bbest\b|favou?rite|most proud|strongest|flagship|standout|signature piece|proudest/)&&!has('contact','reach','email','way to'))
    return this.say(this.pick([
      `Hard to pick one, but the flagships are <b>NeuraSphere</b> (full brand + 3D + motion) and the <b>UE5 Real-Time Environment</b>. The <b>Casio</b> product film is the pure-craft showcase. Want me to open one?`,
      `The ones he's proudest of: <b>NeuraSphere</b> for range, the <b>UE5</b> environment for real-time, and <b>Casio Edifice</b> for sheer finish. Say the word and I'll pull one up. 🙂`]));

  // --- TEAMS / PEOPLE / COLLABORATION (the question that failed before) ---
  if(rx(/team|people|collaborat|cultures?|colleagues?|stakeholder|cross.?function|department/)&&!has('software','tool'))
    return this.say(this.pick([
      `Quite a mix, honestly. He's worked inside a global engineering consultancy alongside designers, engineers and marketing teams across 5+ countries, then with a focused immersive-tech team building real-time work — plus direct one-on-one with founders and clients on freelance brand projects. Big corporate structures, small tight pods, and solo client relationships. That range taught him to read a room fast and fit into how each team actually works.`,
      `A real spread — from large cross-functional teams at a multinational consultancy (designers, engineers, marketers, international stakeholders) to a small immersive-tech crew, to working directly with startup founders as a freelancer. Different industries, cultures and time zones. He genuinely enjoys that part; every team has its own rhythm, and fitting into each one is half the craft.`]));

  // --- JOURNEY / LOCATION / WHERE FROM ---
  if(rx(/where.*from|where.*based|location|kashmir|sopore|\bindia\b|hometown|relocat/))
    return this.say(this.pick([
      `He's from <b>Sopore</b>, a small town in North Kashmir — apple country, not exactly a design hub. He taught himself the craft there, then worked across <b>Delhi NCR</b> and <b>Hyderabad</b>, and remotely for clients worldwide. Remote-first now, so location's never the obstacle — the work travels.`,
      `Originally <b>Sopore, North Kashmir</b> — which says something, because he built a creative career far from any studio scene. Since then he's worked in <b>Noida</b> and <b>Hyderabad</b> and remotely across time zones. Short version: small town, global standard.`]));

  // --- SKILLS / TOOLS ---
  if(rx(/skill|tool|software|what can|disciplin|expert|good at|capab|stack/))
    return this.say(this.pick([
      `In one breath: <b>brand & visual design</b>, <b>motion graphics</b> (After Effects, Premiere), <b>photoreal 3D</b> (Blender), and <b>real-time work</b> in Unreal Engine 5. Plus 30+ client decks and AI-assisted workflows. The thread is that he can take an idea all the way through — concept, design, 3D, motion, final cut — without handing it off.`,
      `He's deliberately broad: identity and brand systems, 2D/3D motion, photoreal product visualization in Blender, and interactive real-time work in Unreal Engine 5. Tools are just means to an end for him — the real skill is owning the whole arc from idea to finished, moving thing.`]));

  // --- EXPERIENCE / CAREER ---
  if(rx(/experience|career|history|companies|company|sutherland|mott|atmecs|years|background|journey/))
    return this.say(this.pick([
      `Seven years, three chapters. He freelanced first, then spent ~4 years at <b>Mott MacDonald</b> (a global engineering consultancy) doing visual systems, 3D and 30+ international decks, then moved into <b>immersive tech</b> building real-time Unreal Engine experiences. Idea person and builder in the same body. The Experience section has the full timeline.`,
      `Short version: started freelance, grew into a senior creative at a multinational consultancy handling brand, 3D and presentation work for global teams, then went deeper into real-time and interactive at an immersive-tech team. Seven years of steadily widening range. Scroll to Experience for the detail.`]));

  // --- HOW HE WORKS / PROCESS / OWNERSHIP ---
  if(rx(/process|how.*work|approach|method|\bown\b|end.?to.?end|pipeline|workflow/))
    return this.say(this.pick([
      `His whole thing is owning the full arc. Most briefs get passed between a strategist, a designer, a 3D artist and an editor — he's all of those, so the original idea survives from first sketch to final frame. Remote-first, self-directing, and he leans on AI to speed up the boring parts without cutting the craft.`,
      `One person, whole brief. He'd rather carry an idea end-to-end — strategy, design, 3D, motion, delivery — than hand it around and watch it dilute. Works remote, manages himself, and holds one rule everywhere: if it doesn't communicate, it doesn't ship.`]));

  // --- WHY HIM ---
  if(rx(/why|different|special|stand out|better|unique|choose|pick|reason/))
    return this.say(this.pick([
      `Honestly? Range plus ownership. Plenty of people are great at one thing — brand, or motion, or 3D. He moves across all of them <i>and</i> into real-time Unreal Engine work, and carries a project start to finish himself. Nothing gets lost in translation between specialists. That's rarer than it sounds.`,
      `Short answer: he's the "one person, whole pipeline" type. Brand to motion to photoreal 3D to interactive real-time — under one roof, owned end-to-end, proven across very different teams and cultures. If a project needs someone who can hold the whole creative arc, that's the gap he fills.`]));

  // --- ABOUT / WHO ---
  if(rx(/who|about|himself|tell me about|introduce|describe/))
    return this.say(this.pick([
      `Zuhaib's a Senior Creative Designer — seven years across visual, motion, 3D and real-time. He grew up in Sopore, North Kashmir, taught himself the craft, and built a global-standard career from a small town. His philosophy in one line: <i>"if it doesn't communicate, it doesn't ship."</i> Owns briefs end-to-end, and is open to remote, hybrid or on-site work.`,
      `In short: a senior creative who treats a brand as one continuous problem — what it <i>says</i>, what it <i>shows</i>, and what it lets people <i>do</i>. Seven years, multiple cities, one consistent standard. Warm to work with, serious about outcomes. Ask me anything specific!`]));

  // --- CONTACT / AVAILABILITY ---
  if(rx(/contact|email|reach|message|connect|talk|available|availab|open to|get in touch|hire/))
    return this.say(this.pick([
      `Easiest way is the <b>✉️ Message tab</b> right here — it lands straight in his inbox — or <a href="mailto:Zuhaibmushtaq95@gmail.com">email him directly</a>. He's good about replying. (That green dot up top means he's around. 🟢)`,
      `Just use the <b>Message tab</b> at the top of this chat, or <a href="mailto:Zuhaibmushtaq95@gmail.com">drop him an email</a>. He reads everything and replies quickly — always up for a good conversation. 🟢`]));

  // --- PROJECTS (general) ---
  if(rx(/project|portfolio|work|show|gallery|made|created|built/))
    return this.say(this.pick([
      `There's a good range on this site — full brand builds, real-time Unreal Engine environments, photoreal 3D product films, VFX, packaging and more. Want me to open one? Say a name, or tell me what kind of work you're curious about and I'll point you to it.`,
      `Plenty to look through — brand identity, motion, 3D, real-time, VFX. Rather than dump a list, tell me what interests you (say "3D" or "real-time" or a project name) and I'll take you straight there. 🙂`]));

  // --- GREETINGS ---
  if(rx(/^(hi|hey|hello|yo|salaam|assalam|namaste|sup|good morning|good evening|hii+)\b/)||q==='hi'||q==='hey')
    return this.say(this.pick([
      `Hi! 👋 I'm Zuvi, Zuhaib's portfolio assistant. Ask me about his work, experience, skills or projects — whatever you'd like to know.`,
      `Hi there! 👋 I'm Zuvi. I know Zuhaib's work and his journey pretty well — what would you like to know?`]));

  // --- THANKS / BYE ---
  if(rx(/thank|appreciate|great|awesome|nice|cool|love|amazing|impressive|bye|goodbye|see ya/))
    return this.say(this.pick([
      `Glad that helped! 🧡 Have a look around the projects — and if something clicks, the Message tab goes straight to Zuhaib.`,
      `Anytime! If anything here catches your eye, reach out through the Message tab — he'd genuinely like to hear from you.`,
      `Appreciate that! 🙂 Feel free to explore, and don't be shy about saying hello to Zuhaib directly.`]));

  // --- JOKE ---
  if(rx(/joke|funny|fun fact|something fun|make me laugh/))
    return this.say(this.pick([
      `A fun one: his Casio Edifice render is so photoreal that people instinctively glance at their own wrist when they see it. Worth a look in the projects. ⌚`,
      `Here's one — he taught himself the entire pipeline (brand, 3D, motion, real-time) from a small town in Kashmir with no studio scene nearby. The work did the talking. 🙂`]));

  // --- AI ---
  if(rx(/\bai\b|artificial|midjourney|chatgpt|automat/))
    return this.say(`He uses AI as an accelerator, not a crutch — speeding up ideation and iteration so more time goes into craft and direction. Roughly a third faster concept-to-delivery, with final quality kept fully hand-controlled. (And yes — I'm a small scripted helper, not a live AI. Zuhaib kept me lightweight on purpose. 🙂)`);

  // --- SPECIFIC TOOLS (deep) ---
  if(rx(/substance|painter|texturing|pbr|texture/))
    return this.say(`Yes — <b>Substance Painter</b> is part of his 3D pipeline for <b>PBR texturing</b>, and he works in full physically-based workflows across Blender. The Medieval Windmill game asset and his product visualizations lean on this. Photoreal materials are a real strength.`);
  if(rx(/photoshop|illustrator|indesign|adobe|creative suite|creative cloud/))
    return this.say(`Across <b>Adobe Creative Suite</b> daily — <b>Photoshop</b> (compositing, retouching, matte work), <b>Illustrator</b> (logos, vector systems, brand-accurate assets), and <b>InDesign</b> (layouts, decks, print). For the Now Engage film he even rebuilt brand-exact task cards in Illustrator by hand with precise RGB values when AI versions weren't accurate.`);
  if(rx(/3ds max|3dsmax|\bmax\b|maya|zbrush|cinema 4d|c4d/))
    return this.say(`His main 3D tool is <b>Blender</b> (expert level), and he also works in <b>3ds Max</b>, with <b>Maya</b> and <b>ZBrush</b> in the supporting kit. Modelling, sculpting, look-dev, lighting and rendering — he covers the full 3D arc rather than one slice of it.`);
  if(rx(/omniverse|nvidia|real.?time render|render engine/))
    return this.say(`He works with <b>NVIDIA Omniverse</b> for collaborative real-time 3D, alongside Unreal Engine 5. Real-time rendering and interactive pipelines are an area he's actively deepening.`);
  if(rx(/motion|animation|animate|2d|kinetic|mograph|video edit|premiere/))
    return this.say(`Motion is a core discipline — <b>After Effects</b> and <b>Premiere Pro</b> for motion graphics, 2D animation, kinetic type and editing. He pre-composes cleanly, scripts repetitive work (ExtendScript), and even used custom .jsx automation on the Now Engage film to scatter 28 animated cards in seconds. Open that project to see the 2D-meets-3D side.`);
  if(rx(/presentation|deck|powerpoint|pitch|slides|keynote/))
    return this.say(`Presentation design is a quiet specialty — <b>30+ decks</b> for international clients at a global engineering consultancy. Not "pretty slides" but structured visual systems that carry complex engineering and business stories cleanly. It's one of the most underrated parts of his range.`);
  if(rx(/vfx|compositing|composite|green ?screen|roto|visual effects/))
    return this.say(`Yes — <b>VFX compositing</b> is in his toolkit. The "VFX Breakdown — Fantasy Drone Shot" on this site shows real footage integrated with a fantasy CG environment. Comfortable across the motion-plus-3D-plus-compositing pipeline.`);

  // --- ACHIEVEMENTS / IMPACT / METRICS ---
  if(rx(/achiev|impact|result|metric|number|accomplish|proud of|highlight|deliver/))
    return this.say(this.pick([
      `A few concrete ones: <b>50+ visual assets across 5+ countries</b> with measurable engagement lift at a global engineering consultancy, <b>30+ international presentation decks</b>, <b>20+ photoreal Blender product visualizations</b>, and AI-assisted pipelines that cut concept-to-delivery by roughly <b>30%</b>. High client retention on the freelance side too.`,
      `By the numbers: 50+ assets delivered internationally, 30+ client decks, 20+ photoreal 3D visualizations, ~30% faster delivery using AI-assisted workflows, plus reusable component systems that shortened turnaround. The Experience section breaks these down per role.`]));

  // --- SPECIFIC COMPANIES (deep) ---
  if(rx(/mott|macdonald|engineering consultancy/))
    return this.say(`At <b>Mott MacDonald</b> (a global engineering consultancy) he spent roughly <b>4 years</b> as a Visualiser / Senior Creative Designer — brand and visual systems, photoreal 3D, motion, and 30+ international presentation decks for infrastructure and engineering projects across 5+ countries. That's where his range and corporate polish were built.`);
  if(rx(/sutherland|atmecs|immersive|specialist/))
    return this.say(`At <b>ATMECS Global / Sutherland</b> he was an <b>Immersive Tech Specialist / Senior Creative Designer</b> — establishing creative direction for a real-time division, building Unreal Engine 5 experiences, Blueprint logic, gamified walkthroughs, and AI-assisted pipelines. The role ended in a business restructure; he's now actively looking for the next senior creative seat.`);
  if(rx(/pixel buzz|pixelbuzz|freelance brand|own brand/))
    return this.say(`<b>Pixel Buzz</b> is his freelance brand — where it all started and still runs alongside. Direct work with founders and businesses on brand identity, motion, 3D and campaigns, with strong client retention. Currently he's doing freelance work for <b>Philips / Signify</b> through an agency, for example.`);

  // --- WHAT'S HE LOOKING FOR / NOTICE / START / FIT ---
  if(rx(/looking for|seeking|ideal role|next role|kind of role|what does he want|notice|start date|join|when can/))
    return this.say(this.pick([
      `He's after a <b>Senior Creative Designer, Creative Lead or Art Director</b> seat where range is an asset — somewhere he can own work from idea to finished, moving, interactive thing. Open to <b>remote, hybrid or on-site</b>. Available to start soon. The <b>Message tab</b> is the fastest way to talk specifics.`,
      `Ideal fit: a team that needs one person who can carry brand, motion, 3D and real-time without handing off between specialists. Senior / lead / art-director level, any working setup (remote, hybrid, on-site). He can start quickly — reach him via the Message tab.`]));

  // --- AI TOOLS (specific list) ---
  if(rx(/midjourney|firefly|runway|generative|ai tool|ai-assist|ai assist|gen ai/))
    return this.say(`On the AI side he uses <b>Midjourney</b>, <b>Adobe Firefly</b> and <b>Runway</b> for ideation, look exploration and speeding up iteration — always as an accelerator, never the final craft. He's careful about it: on brand-exact work he rebuilds assets by hand when AI isn't precise enough. Net effect is roughly 30% faster delivery without losing control of quality.`);

  // --- UI / UX / WEB ---
  if(rx(/\bui\b|\bux\b|web design|website|landing|interface|figma|adobe xd|prototyp/))
    return this.say(`For <b>UI / interface work</b> he uses <b>Figma</b> and <b>Adobe XD</b> — the Kraftshala landing page on this site is a good example. He also hand-built this entire portfolio site himself. UI is one capable tool in a much broader kit, not the whole story.`);

  // --- GRACEFUL HUMAN FALLBACK ---
  this.chipsSet(['What is he good at?','His experience','Is he available?','Get his CV']);
  return this.say(this.pick([
    `That's a fair question — I'm a small helper here, so I might not have every answer, but I know his <b>work</b>, <b>experience</b>, <b>skills</b> and <b>story</b> well. Try me on one of those, or use the <b>✉️ Message tab</b> to ask Zuhaib himself — he'll give you a proper answer.`,
    `I may not have that specific detail, but I can tell you about his <b>projects</b>, <b>experience</b>, <b>skills</b> and <b>how he works</b>. For anything else, the <b>✉️ Message tab</b> goes straight to Zuhaib.`,
    `Good question — and an honest answer: I only really know Zuhaib's world (his work, range and path). For anything beyond that, the <b>Message tab</b> goes right to him. Happy to help with the rest though!`]));
 },
 toggle(state){this.open=state??!this.open;this.el.classList.toggle('open',this.open);
  if(this.open){SFX.chirp();if(!this.greeted){this.greeted=true;
   this.say(this.pick([`Hi, I'm <b>Zuvi</b> 👋 — Zuhaib's portfolio assistant. Ask me about his work, experience, skills or projects, or tap a question below.`,`Hello! I'm <b>Zuvi</b> 👋 I can tell you about Zuhaib's work, experience and skills — ask away, or pick one to start.`]),500);
   this.chipsSet(['Who is Zuhaib?','What tools does he use?','His experience','Is he available?','Get his CV']);}}}
};
Z.fab.addEventListener('click',()=>Z.toggle());
document.getElementById('zuviClose').addEventListener('click',()=>Z.toggle(false));
document.getElementById('zSend').addEventListener('click',()=>{const i=document.getElementById('zInput');if(i.value.trim()){Z.ask(i.value.trim());i.value='';}});
document.getElementById('zInput').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();document.getElementById('zSend').click();}});
document.querySelectorAll('.z-tabs button').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('.z-tabs button').forEach(x=>x.classList.remove('on'));b.classList.add('on');
  const msg=b.dataset.tab==='msg';
  document.getElementById('zForm').classList.toggle('on',msg);
  document.getElementById('zBody').style.display=msg?'none':'flex';
  document.getElementById('zChips').style.display=msg?'none':'flex';
  document.getElementById('zInputWrap').style.display=msg?'none':'flex';SFX.pop();
}));
document.getElementById('zForm').addEventListener('submit',async e=>{
  e.preventDefault();const f=e.target,btn=f.querySelector('button');
  const msg=(f.message.value||'').trim();
  // --- client-side spam heuristic: flags low-effort / irrelevant / test messages ---
  function spamScore(t){
    let s=0;const low=t.toLowerCase();
    if(t.length<12)s+=2;                                   // too short to be real
    if(/^(test|testing|hi+|hey+|hello+|asdf|qwerty|abc+|\.+|123+)$/i.test(t.trim()))s+=3; // pure test
    if(/\b(viagra|casino|loan|crypto airdrop|bitcoin doubl|seo service|backlinks|rank your|buy followers|click here|earn \$|work from home guarantee)\b/i.test(low))s+=3; // classic spam
    if(/(https?:\/\/[^\s]+){2,}/i.test(t))s+=2;            // multiple links
    if(/(.)\1{6,}/.test(t))s+=2;                           // repeated chars (aaaaaaa)
    const words=t.split(/\s+/).filter(Boolean);
    if(words.length<3 && t.length<20)s+=1;                 // barely any content
    if(/[A-Z]{15,}/.test(t))s+=1;                          // shouting
    return s;
  }
  const isSpam=spamScore(msg)>=3;
  // honeypot — bots fill hidden field; drop silently (show success so they don't retry)
  if(f.botcheck && f.botcheck.value){ const ok=document.getElementById('zOk'); ok.textContent='✓ Sent! Zuhaib will read it soon.'; ok.style.display='block'; f.reset(); return; }
  btn.disabled=true;btn.textContent='Sending…';
  const subject=isSpam?'[Folio-SPAM] Possible spam from website':'[Folio] New website message';
  try{
    // FormData => a "simple" CORS request (no preflight). iOS Safari chokes on the
    // JSON+custom-header version's preflight; this works across all browsers.
    const fd=new FormData();
    fd.append('access_key','3717e44f-c308-4552-8584-d5ccff34ea92');
    fd.append('subject',subject);
    fd.append('from_name','Portfolio Website');
    fd.append('name',f.name.value||'Anonymous');
    fd.append('email',f.email.value||'noreply@zuhaibwani.vercel.app');
    fd.append('message',msg);
    fd.append('flagged',isSpam?'likely-spam':'clean');
    const r=await fetch('https://api.web3forms.com/submit',{method:'POST',body:fd});
    const data=await r.json().catch(()=>({}));
    if(!data.success) throw new Error(data.message||('Error '+r.status));
    const ok=document.getElementById('zOk'); ok.style.color=''; ok.textContent='✓ Sent! Zuhaib will read it soon.'; ok.style.display='block';
    f.reset();btn.textContent='Send message';btn.disabled=false;SFX.chirp();
  }catch(err){
    btn.disabled=false;btn.textContent='Try again';
    const ok=document.getElementById('zOk'); ok.style.color='#ff7a5c';
    ok.textContent='Couldn’t send just now — please email me directly at Zuhaibmushtaq95@gmail.com';
    ok.style.display='block';
  }
});

/* ============ AVAILABILITY ENGINE ============ */
const AVAIL = {
  files:{
    remote:'assets/docs/Zuhaib_Wani_CV_Remote.pdf',
    delhi:'assets/docs/Zuhaib_Wani_CV_DelhiNCR.pdf',
    combined:'assets/docs/Zuhaib_Wani_CV_Combined.pdf',
    freelance:'assets/docs/Zuhaib_Wani_CV_Freelance.pdf',
    neutral:'assets/docs/Zuhaib_Wani_CV_Neutral.pdf'
  },
  norm(cfg){ cfg=cfg||{}; return {remote:!!cfg.remote, delhi:!!cfg.delhi, freelance:!!cfg.freelance}; },
  // CV: full-time states win; freelance only decides the CV when it is the only thing on
  pickCV(r,d,f){
    if(r&&d) return this.files.combined;
    if(r)    return this.files.remote;
    if(d)    return this.files.delhi;
    if(f)    return this.files.freelance;
    return this.files.neutral;
  },
  // banner text per combination (null = no banner)
  pickLine(r,d,f){
    return ({
      R:'Open to remote roles, worldwide',
      D:'Open to full-time, Delhi NCR',
      RD:'Open to full-time — remote or Delhi NCR',
      F:'Open for freelance',
      RF:'Open for freelance + remote roles',
      DF:'Open for freelance + full-time, Delhi NCR',
      RDF:'Open for freelance + full-time roles',
      '':null
    })[(r?'R':'')+(d?'D':'')+(f?'F':'')];
  },
  apply(cfg){
    const {remote:r,delhi:d,freelance:f}=this.norm(cfg);
    const tag=document.getElementById('availTag');
    const bar=document.getElementById('availBar');
    const txt=this.pickLine(r,d,f);
    // desktop inline tag
    if(tag){ if(txt){tag.textContent=txt;tag.hidden=false;}else{tag.hidden=true;tag.textContent='';} }
    // mobile bar below nav
    if(bar){ if(txt){bar.textContent=txt;bar.hidden=false;document.documentElement.classList.add('avail-active');}else{bar.hidden=true;bar.textContent='';document.documentElement.classList.remove('avail-active');} }
    const cv=this.pickCV(r,d,f);
    document.querySelectorAll('.cv-link').forEach(a=>a.setAttribute('href',cv));
    window.__cvHref=cv;
  }
};
// Apply live config on load (new {availability:{...}} schema, with legacy availabilityMode fallback)
(function(){
  let cfg=window.SITE_CONFIG&&window.SITE_CONFIG.availability;
  if(!cfg && window.SITE_CONFIG && window.SITE_CONFIG.availabilityMode){
    const m=window.SITE_CONFIG.availabilityMode;
    cfg={remote:(m==='fulltime'||m==='both'),delhi:(m==='fulltime'||m==='both'),freelance:(m==='freelance'||m==='both')};
  }
  AVAIL.apply(cfg||{});
})();

/* ============ HIDDEN ADMIN PANEL ============ */
(function(){
  const panel=document.getElementById('adminPanel');
  if(!panel)return;
  const $=id=>document.getElementById(id);
  function liveCfg(){
    let c=window.SITE_CONFIG&&window.SITE_CONFIG.availability;
    if(!c && window.SITE_CONFIG && window.SITE_CONFIG.availabilityMode){
      const m=window.SITE_CONFIG.availabilityMode;
      c={remote:(m==='fulltime'||m==='both'),delhi:(m==='fulltime'||m==='both'),freelance:(m==='freelance'||m==='both')};
    }
    return AVAIL.norm(c);
  }
  const LIVE=liveCfg();
  const baseName=p=>p.split('/').pop();

  function cfgFromToggles(){ return {remote:$('apRemote').checked, delhi:$('apDelhi').checked, freelance:$('apFree').checked}; }
  function syncToggles(c){ c=AVAIL.norm(c); $('apRemote').checked=c.remote; $('apDelhi').checked=c.delhi; $('apFree').checked=c.freelance; }
  function updatePreview(c){
    c=AVAIL.norm(c);
    const banner=AVAIL.pickLine(c.remote,c.delhi,c.freelance);
    const cv=baseName(AVAIL.pickCV(c.remote,c.delhi,c.freelance));
    $('apPreview').innerHTML=`<b>Banner:</b> ${banner||'<i>(no banner shown)</i>'}<br><b>CV:</b> ${cv}`;
  }
  function flash(msg,ok=true){
    const s=$('apStatus');
    s.textContent=msg;s.style.color=ok?'var(--accent-3,#3ad07a)':'#ff5c35';s.style.opacity=1;
    setTimeout(()=>{s.style.opacity=0;},2600);
  }
  function refresh(){ const c=cfgFromToggles(); AVAIL.apply(c); updatePreview(c); }
  function openPanel(){syncToggles(LIVE);updatePreview(LIVE);panel.hidden=false;}
  if(location.hash==='#zwadmin')openPanel();
  let buf='';
  addEventListener('keydown',e=>{
    if(/input|textarea/i.test(e.target.tagName))return;
    buf=(buf+e.key.toLowerCase()).slice(-3);
    if(buf==='zwa')openPanel();
  });
  ['apRemote','apDelhi','apFree'].forEach(id=>$(id).addEventListener('change',refresh));
  $('apClose').addEventListener('click',()=>{panel.hidden=true;AVAIL.apply(LIVE);});
  $('apReset').addEventListener('click',()=>{syncToggles(LIVE);refresh();flash('Reset to current live setting');});

  function configText(c){
    c=AVAIL.norm(c);
    return `/* ============================================================
   SITE CONFIG — toggle availability, then re-upload to Vercel.
   true = ON (advertised on site) · false = OFF
   ============================================================ */
window.SITE_CONFIG = {
  availability: {
    remote: ${c.remote},     // Open to remote roles, worldwide
    delhi: ${c.delhi},      // Open to full-time, Delhi NCR
    freelance: ${c.freelance}   // Open for freelance
  }
};
`;
  }

  // ── DOWNLOAD config.js ──
  $('apDownload').addEventListener('click',()=>{
    const a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob([configText(cfgFromToggles())],{type:'application/javascript'}));
    a.download='config.js';a.click();URL.revokeObjectURL(a.href);
    flash('Downloaded config.js — replace in folder, re-upload to Vercel');
  });

  // ── COPY contents ──
  $('apCopy').addEventListener('click',()=>{
    navigator.clipboard.writeText(configText(cfgFromToggles()))
      .then(()=>flash('Copied config.js contents'))
      .catch(()=>flash('Copy failed — use Download instead',false));
  });
})();
addEventListener('load',()=>{document.querySelectorAll('.featured,.cards').forEach(el=>{try{el.scrollLeft=0;}catch(_){}}); });
