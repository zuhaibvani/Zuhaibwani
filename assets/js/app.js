/* ============ SFX ENGINE ============ */
const SFX={ctx:null,on:localStorage.getItem('zw_sfx')==='on' && !matchMedia('(prefers-reduced-motion:reduce)').matches,
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
  if(m.type==='video'){return `<video src="${m.src}" ${m.poster?`poster="${m.poster}"`:''} controls controlsList="nodownload noremoteplayback" disablePictureInPicture draggable="false" playsinline preload="metadata"></video>`;}
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
    const fb=v.querySelector('.fsBtn'); if(fb) fb.textContent='⤢ Fullscreen';
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
    let zoom=1; const ZMAX=2.5, ZSTEP=0.25;
    const zMin=()=> (mode==='scroll' ? 0.1 : 1);   // flip: never below fit; scroll: down to 10%
    const canvasMeta=new Map(); // page n -> {cv, baseW, baseH}  (lets zoom resize without re-rendering)
    const zout=root.querySelector('.zout'), zin=root.querySelector('.zin'), zlabel=root.querySelector('.zlabel');
    function setZoom(z){
      z=Math.max(zMin(),Math.min(ZMAX, Math.round(z*100)/100));
      zoom=z;
      canvasMeta.forEach(m=>{ m.cv.style.width=(m.baseW*zoom)+'px'; m.cv.style.height=(m.baseH*zoom)+'px'; });
      root.classList.toggle('zoomed', zoom>1.02);      // bigger than fit → enable panning
      root.classList.toggle('zoomedout', zoom<0.98);   // smaller than fit → keep centered
      if(zlabel) zlabel.textContent=Math.round(zoom*100)+'%';
    }
    if(zout) zout.addEventListener('click',()=>{ setZoom(zoom-ZSTEP); SFX.tick(); });
    if(zin) zin.addEventListener('click',()=>{ setZoom(zoom+ZSTEP); SFX.tick(); });
    if(zlabel) zlabel.addEventListener('click',()=>{ setZoom(1); SFX.tick(); });
    // resolves an internal PDF link "dest" (string named-dest, or explicit dest array) to a 1-based page number
    async function resolveDest(dest){
      try{
        let d=dest;
        if(typeof d==='string'){
          // try the proper named-destination lookup first
          try{ d=await doc.getDestination(d); }catch(_){ d=null; }
          // InDesign exports like "file.indd:Bookmark 3:3" — the trailing :N is the 1-based page
          if(!d){
            const m=String(dest).match(/:(\d+)\s*$/);
            if(m){ const pg=parseInt(m[1],10); if(pg>=1) return pg; }
            return null;
          }
        }
        if(!d||!d[0]) return null;
        const idx=await doc.getPageIndex(d[0]);
        return idx+1;
      }catch(_){
        const m=String(dest).match(/:(\d+)\s*$/);
        return m?parseInt(m[1],10):null;
      }
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
          anns.filter(a=>(a.subtype==='Link'||a.subtype==='Widget') && (a.dest||a.url||a.action) && a.rect).forEach(a=>{
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
      io.disconnect(); rendered.clear(); canvasMeta.clear(); zoom=1; if(zlabel)zlabel.textContent='100%'; root.classList.remove('zoomed','zoomedout');
      pages.forEach((el,i)=>{ el.innerHTML=''; el.style.height='auto'; el.style.display=(i===cur-1)?'flex':'none'; });
      renderPage(cur); if(curEl)curEl.textContent=cur;
    }
    function applyScroll(){
      rendered.clear(); io.disconnect(); canvasMeta.clear(); zoom=1; if(zlabel)zlabel.textContent='100%'; root.classList.remove('zoomed','zoomedout');
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
      const lbl=()=>modeBtn.textContent=(mode==='paged'?'⊟ Scroll':'❐ Flip');
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
          fsBtn.textContent='⤡ Exit';
        } else {
          // restore into its original place in the modal
          root.classList.remove('maxed'); document.body.classList.remove('pdf-maxed');
          if(root._ph && root._ph.parentNode){ root._ph.parentNode.insertBefore(root, root._ph); }
          fsBtn.textContent='⤢ Fullscreen';
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
        const lbTarget=(c.type==='img'||c.type==='video')?c.lbi:heroIdx;
        const thumb=c.type==='img'?c.src:(c.poster||p.hero.poster||p.hero.src);
        return `<div class="gcell" data-open-lb="${lbTarget}"><img loading="lazy" src="${thumb}" alt="${c.cap||''}"/>${ico}${c.cap?`<div class="cc"><span class="cc-cap">${c.cap}</span>${c.group?`<span class="cc-grp">${c.group}</span>`:''}</div>`:''}</div>`;
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
pmInner.addEventListener('click',e=>{
  const g=e.target.closest('[data-open-lb]');
  if(g&&g.dataset.openLb!==''&&g.dataset.openLb!=null){openLB(+g.dataset.openLb);return;}
  const t=e.target.closest('[data-lb]');if(t&&t.dataset.lb!==''&&t.dataset.lb!=null)openLB(+t.dataset.lb);
});
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
const toTop=document.getElementById('toTop');
addEventListener('scroll',()=>{
  const y=scrollY;
  toTop.classList.toggle('show',y>700);
});
toTop.addEventListener('click',()=>{scrollTo({top:0,behavior:'smooth'});SFX.pop();});

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
