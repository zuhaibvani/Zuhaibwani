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
  <div class="cbody"><div class="ccat">${p.catLabel}</div><h4>${p.title}</h4><div class="cline"></div></div>`;
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
  if(m.type==='yt')return `<iframe src="${m.src}?rel=0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy" title="${m.cap||''}"></iframe>`;
  if(m.type==='video'){return `<video src="${m.src}" ${m.poster?`poster="${m.poster}"`:''} controls playsinline preload="metadata"></video>`;}
  if(m.type==='sketchfab')return `<iframe class="sk" src="${m.src}" allow="autoplay; fullscreen; xr-spatial-tracking" allowfullscreen loading="lazy" title="Interactive 3D model"></iframe>`;
  if(m.type==='pdf')return `<a href="${m.src}" target="_blank" rel="noopener" style="display:block;position:relative"><img loading="lazy" src="${m.poster||'assets/img/presentation-1.jpg'}" alt="Interactive PDF preview"/><span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(8,9,12,.45);color:#fff;font-family:'Space Grotesk';font-weight:600;font-size:15px;gap:9px">Open interactive PDF ↗</span></a>`;
  return `<img loading="lazy" src="${m.src}" alt="${m.cap||''}" data-lb="${idx}"/>`;
}
let PDFQUEUE=[];
function renderPDFs(){
  if(!window.pdfjsLib){PDFQUEUE=[];return;}
  try{pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';}catch(e){}
  PDFQUEUE.forEach(({id,src})=>{
    const root=document.getElementById(id);if(!root)return;
    const stage=root.querySelector('.pdfv-stage'),pl=root.querySelector('.pl');
    const pgL=root.querySelector('.pg'),pv=root.querySelector('.pv'),pn=root.querySelector('.pn'),fsBtn=root.querySelector('.fsBtn');
    let cv=document.createElement('canvas');stage.appendChild(cv);
    let pdf=null,page=1,total=0,rendering=false;
    pdfjsLib.getDocument(src).promise.then(doc=>{pdf=doc;total=doc.numPages;if(pl)pl.style.display='none';draw();})
      .catch(()=>{
        if(pl){pl.innerHTML=`<div style="text-align:center;padding:30px">
          <div style="font-size:13px;color:#cfd3da;margin-bottom:12px">Preview needs a live server.</div>
          <a href="${src}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:7px;background:var(--accent);color:#fff;padding:10px 20px;border-radius:100px;font-family:'Space Grotesk';font-weight:600;font-size:13px;text-decoration:none">Open the PDF ↗</a></div>`;}
        if(pv)pv.style.display='none';if(pn)pn.style.display='none';
      });
    function draw(){
      if(rendering||!pdf)return;rendering=true;
      pdf.getPage(page).then(pg=>{
        const fs=root.classList.contains('fs');
        const avail=fs?(window.innerWidth-40):Math.min(stage.clientWidth-20,860);
        const v0=pg.getViewport({scale:1});const scale=avail/v0.width;
        const dpr=window.devicePixelRatio||1;const v=pg.getViewport({scale:scale*dpr});
        cv.width=v.width;cv.height=v.height;cv.style.width=avail+'px';cv.style.height=(v.height/dpr)+'px';
        pg.render({canvasContext:cv.getContext('2d'),viewport:v}).promise.then(()=>{
          rendering=false;if(pgL)pgL.textContent=`${page} / ${total}`;
          if(pv)pv.disabled=page<=1;if(pn)pn.disabled=page>=total;
        });
      });
    }
    if(pv)pv.addEventListener('click',()=>{if(page>1){page--;draw();SFX.tick();}});
    if(pn)pn.addEventListener('click',()=>{if(page<total){page++;draw();SFX.tick();}});
    if(fsBtn)fsBtn.addEventListener('click',()=>{
      root.classList.toggle('fs');
      fsBtn.textContent=root.classList.contains('fs')?'⤡ Exit':'⤢ Fullscreen';
      document.body.style.overflow=root.classList.contains('fs')?'hidden':'hidden';
      setTimeout(draw,60);SFX.pop();
    });
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
        <div class="pdfv-head"><div class="di">📄</div><div class="dn">${d.cap}</div></div>
        <div class="pdfv-stage"><span class="pl">Loading document…</span>
          <button class="pdfv-nav pv" disabled aria-label="Previous page">‹</button>
          <button class="pdfv-nav pn" disabled aria-label="Next page">›</button>
        </div>
        <div class="pdfv-bar">
          <span class="pg">— / —</span>
          <div class="pacts">
            <button class="pbtn fsBtn">⤢ Fullscreen</button>
            <a class="pbtn" href="${d.src}" target="_blank" rel="noopener">Open ↗</a>
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
  pm.classList.add('open');document.body.style.overflow='hidden';pm.scrollTop=0;
}

function closeProject(){SFX.whoosh();pm.classList.remove('open');pmInner.innerHTML='';document.body.style.overflow='';}
document.getElementById('pmclose').addEventListener('click',closeProject);
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){const fs=document.querySelector('.pdfv.fs');if(fs){fs.classList.remove('fs');const fb=fs.querySelector('.fsBtn');if(fb)fb.textContent='⤢ Fullscreen';return;}closeProject();closeLB();}
  if(lb.classList.contains('open')){if(e.key==='ArrowRight')lbStep(1);if(e.key==='ArrowLeft')lbStep(-1);}
});

/* lightbox with nav */
const lb=document.getElementById('lb'),lbimg=document.getElementById('lbimg'),lbCnt=document.getElementById('lbCnt');
function openLB(i){LBIDX=i;paintLB();lb.classList.add('open');SFX.pop();}
function paintLB(){const m=LBLIST[LBIDX];const vid=document.getElementById('lbvid');
  if(m.type==='video'){lbimg.style.display='none';lbimg.src='';vid.style.display='block';vid.src=m.src;if(m.poster)vid.poster=m.poster;vid.play().catch(()=>{});}
  else{vid.pause();vid.style.display='none';vid.src='';lbimg.style.display='block';lbimg.src=m.src;lbimg.alt=m.cap||'';}
  lbCnt.textContent=`${LBIDX+1} / ${LBLIST.length}${m.cap?' — '+m.cap:''}`;}
function lbStep(d){LBIDX=(LBIDX+d+LBLIST.length)%LBLIST.length;paintLB();SFX.tick();}
function closeLB(){lb.classList.remove('open');lbimg.src='';const vid=document.getElementById('lbvid');vid.pause();vid.src='';}
document.getElementById('lbPrev').addEventListener('click',()=>lbStep(-1));
document.getElementById('lbNext').addEventListener('click',()=>lbStep(1));
document.getElementById('lbClose').addEventListener('click',closeLB);
lb.addEventListener('click',e=>{if(e.target===lb)closeLB();});

/* ============ RECS ============ */
function initials(n){return n.split(' ').filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase();}
function recCard(r,clamp){return `<div class="rec ${clamp?'clamp':''}"><div class="quote">"</div><p>${r.t}</p>${clamp?'<div class="more">Tap to read full ↓</div>':''}<div class="who"><div class="ava">${initials(r.n)}</div><div><div class="nm">${r.n}</div><div class="ti">${r.r}</div></div>${r.ig?`<a class="ig" href="https://www.instagram.com/${r.ig}" target="_blank" rel="noopener" onclick="event.stopPropagation()">@${r.ig}</a>`:''}</div></div>`;}
const liEl=document.getElementById('recs-li');
liEl.innerHTML=RECS_LI.map(r=>recCard(r,true)).join('')+RECS_LI.map(r=>recCard(r,true)).join('');
// Only keep the "read full" prompt + expand behaviour where the text is genuinely clamped.
requestAnimationFrame(()=>{
  liEl.querySelectorAll('.rec').forEach(c=>{
    const p=c.querySelector('p');const more=c.querySelector('.more');
    const overflowing=p && p.scrollHeight-p.clientHeight>4;
    if(!overflowing){ if(more)more.remove(); c.classList.remove('clamp'); }
    else {
      c.style.cursor='pointer';
      c.addEventListener('click',()=>{
        c.classList.toggle('full');
        document.getElementById('railWrap').classList.toggle('paused',c.classList.contains('full'));
        if(more)more.style.display=c.classList.contains('full')?'none':'block';
        SFX.pop();
      });
    }
  });
});
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
burger.addEventListener('click',()=>{burger.classList.toggle('open');nl.classList.toggle('open');});
nl.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{burger.classList.remove('open');nl.classList.remove('open');}));
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
    `Of course — here's his CV: <a href="${cv}" download target="_blank" rel="noopener">📄 Download Zuhaib's CV</a>. Two pages, no padding.`,
    `Grab it here: <a href="${cv}" download target="_blank" rel="noopener">📄 Zuhaib's CV (PDF)</a>. Everything that matters, nothing that doesn't.`]));}

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
      `Zuhaib's a Senior Creative Designer — seven years across visual, motion, 3D and real-time. He grew up in Sopore, North Kashmir, taught himself the craft, and built a global-standard career from a small town. His philosophy in one line: <i>"if it doesn't communicate, it doesn't ship."</i> Owns briefs end-to-end, works remote-first.`,
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
      `Hey! 👋 I'm Zuvi — think of me as Zuhaib's stand-in here. Ask me about his work, his story, what he's good at, anything. What's on your mind?`,
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
      `Zuhaib's idea of a horror story: <i>"The client loved it — but can we try it in Comic Sans?"</i> 😱 He survived. Barely.`,
      `Fun fact: he renders watches so carefully that people instinctively check their own wrist. The Casio project is the main offender. ⌚😄`]));

  // --- AI ---
  if(rx(/\bai\b|artificial|midjourney|chatgpt|automat/))
    return this.say(`He uses AI as an accelerator, not a crutch — speeding up ideation and iteration so more time goes into craft and direction. Roughly a third faster concept-to-delivery, with final quality kept fully hand-controlled. (And yes — I'm a small scripted helper, not a live AI. Zuhaib kept me lightweight on purpose. 🙂)`);

  // --- GRACEFUL HUMAN FALLBACK ---
  return this.say(this.pick([
    `That's a fair question — I'm a small helper here, so I might not have every answer, but I know his <b>work</b>, <b>experience</b>, <b>skills</b> and <b>story</b> well. Try me on one of those, or use the <b>✉️ Message tab</b> to ask Zuhaib himself — he'll give you a proper answer.`,
    `Hmm, I might be out of my depth on that one 🙂 But ask me about his <b>projects</b>, <b>journey</b>, <b>how he works</b>, or what he's <b>good at</b> — or send it straight to Zuhaib via the Message tab and he'll reply.`,
    `Good question — and an honest answer: I only really know Zuhaib's world (his work, range and path). For anything beyond that, the <b>Message tab</b> goes right to him. Happy to help with the rest though!`]));
 },
 toggle(state){this.open=state??!this.open;this.el.classList.toggle('open',this.open);
  if(this.open){SFX.chirp();if(!this.greeted){this.greeted=true;
   this.say(this.pick([`Hey, I'm <b>Zuvi</b> 👋 — Zuhaib's stand-in here. Ask me anything about his work, his story, or how he thinks. Or just tap a question below.`,`Hi! I'm <b>Zuvi</b> 👋 I know Zuhaib's work and journey well — ask away, or pick one of these to start.`]),500);
   this.chipsSet(['Who is Zuhaib?','What is he good at?','Who has he worked with?','Why work with him?','Get his CV']);}}}
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
  btn.disabled=true;btn.textContent='Sending…';
  const subject=isSpam?'[Folio-SPAM] Possible spam from website':'[Folio] New website message';
  try{
    const r=await fetch('https://formsubmit.co/ajax/Pixocad@gmail.com',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},
      body:JSON.stringify({name:f.name.value||'Anonymous',email:f.email.value||'not given',message:msg,
        _subject:subject,_template:'table',_captcha:'false',
        source:'portfolio-website',flagged:isSpam?'likely-spam':'clean'})});
    if(!r.ok)throw 0;
    document.getElementById('zOk').style.display='block';f.reset();btn.textContent='Send message';btn.disabled=false;SFX.chirp();
  }catch(_){btn.disabled=false;btn.textContent='Send message';
    location.href=`mailto:Pixocad@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(msg)}`;}
});

/* ============ AVAILABILITY ENGINE ============ */
const AVAIL = {
  // CV per mode
  cv:{
    fulltime:'assets/docs/Zuhaib_Wani_CV_Fulltime.pdf',
    freelance:'assets/docs/Zuhaib_Wani_CV_Freelance.pdf',
    both:'assets/docs/Zuhaib_Wani_CV_Fulltime.pdf',
    none:'assets/docs/Zuhaib_Wani_CV_Neutral.pdf'
  },
  // banner text per mode (null = hidden)
  line:{
    fulltime:'Open to full-time — Delhi NCR / Remote',
    freelance:'Open for freelance',
    both:'Open to full-time or freelance',
    none:null
  },
  apply(mode){
    mode = ['fulltime','freelance','both','none'].includes(mode)?mode:'none';
    // availability tag
    const tag=document.getElementById('availTag');
    const txt=this.line[mode];
    if(txt){tag.textContent=txt;tag.hidden=false;} else {tag.hidden=true;tag.textContent='';}
    // CV links
    document.querySelectorAll('.cv-link').forEach(a=>a.setAttribute('href',this.cv[mode]));
    // also update Zuvi's CV answer link target
    window.__cvHref=this.cv[mode];
  }
};
// Apply live config on load
(function(){
  const mode=(window.SITE_CONFIG&&window.SITE_CONFIG.availabilityMode)||'none';
  AVAIL.apply(mode);
})();

/* ============ HIDDEN ADMIN PANEL ============ */
(function(){
  const panel=document.getElementById('adminPanel');
  if(!panel)return;
  const liveMode=(window.SITE_CONFIG&&window.SITE_CONFIG.availabilityMode)||'none';
  const labels={fulltime:"Open to full-time — Delhi NCR / Remote",freelance:"Open for freelance",both:"Open to full-time or freelance",none:"(no banner shown)"};
  const cvs={fulltime:"Zuhaib_Wani_CV_Fulltime.pdf",freelance:"Zuhaib_Wani_CV_Freelance.pdf",both:"Zuhaib_Wani_CV_Fulltime.pdf",none:"Zuhaib_Wani_CV_Neutral.pdf"};

  function modeFromToggles(){
    const f=document.getElementById('apFull').checked, r=document.getElementById('apFree').checked;
    if(f&&r)return'both'; if(f)return'fulltime'; if(r)return'freelance'; return'none';
  }
  function syncToggles(mode){
    document.getElementById('apFull').checked=(mode==='fulltime'||mode==='both');
    document.getElementById('apFree').checked=(mode==='freelance'||mode==='both');
  }
  function updatePreview(m){
    const pre=document.getElementById('apPreview');
    pre.innerHTML=`<span class="pv-mode">${m}</span><b>Banner:</b> ${labels[m]}<br><b>CV:</b> ${cvs[m]}`;
  }
  function flash(msg,ok=true){
    const s=document.getElementById('apStatus');
    s.textContent=msg;s.style.color=ok?'var(--accent-3,#3ad07a)':'#ff5c35';s.style.opacity=1;
    setTimeout(()=>{s.style.opacity=0;},2600);
  }
  function refresh(){
    const m=modeFromToggles();
    AVAIL.apply(m);
    updatePreview(m);
  }
  function openPanel(){syncToggles(liveMode);updatePreview(liveMode);panel.hidden=false;}
  if(location.hash==='#zwadmin')openPanel();
  let buf='';
  addEventListener('keydown',e=>{
    if(/input|textarea/i.test(e.target.tagName))return;
    buf=(buf+e.key.toLowerCase()).slice(-3);
    if(buf==='zwa')openPanel();
  });
  document.getElementById('apFull').addEventListener('change',refresh);
  document.getElementById('apFree').addEventListener('change',refresh);
  document.getElementById('apClose').addEventListener('click',()=>{panel.hidden=true;AVAIL.apply(liveMode);});
  document.getElementById('apReset').addEventListener('click',()=>{syncToggles(liveMode);refresh();flash('Reset to current live setting');});

  // ── DOWNLOAD config.js ──
  document.getElementById('apDownload').addEventListener('click',()=>{
    const m=modeFromToggles();
    const content=`/* ============================================================
   SITE CONFIG — edit availabilityMode to update availability.
   Values: 'fulltime' | 'freelance' | 'both' | 'none'
   After changing: re-upload to Vercel to go live.
   ============================================================ */
window.SITE_CONFIG = {
  availabilityMode: '${m}'
};
`;
    const a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob([content],{type:'application/javascript'}));
    a.download='config.js';a.click();URL.revokeObjectURL(a.href);
    flash(`Downloaded config.js (mode: ${m}) — replace in folder, re-upload to Vercel`);
  });

  // ── COPY value ──
  document.getElementById('apCopy').addEventListener('click',()=>{
    const m=modeFromToggles();
    navigator.clipboard.writeText(`availabilityMode: '${m}'`)
      .then(()=>flash(`Copied: availabilityMode: '${m}'`))
      .catch(()=>flash(`Mode is: '${m}' — copy manually`,false));
  });
})();
