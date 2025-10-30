function getCookie(name){const v=`; ${document.cookie}`;const p=v.split(`; ${name}=`);if(p.length===2)return p.pop().split(';').shift();}

/* Modal */
function openModal(){document.getElementById('book-modal').setAttribute('aria-hidden','false');document.body.classList.add('modal-open');}
function closeModal(){document.getElementById('book-modal').setAttribute('aria-hidden','true');document.body.classList.remove('modal-open');}
function wireDemo(){
  document.querySelectorAll('.js-open-demo,.explore,.cta-pill').forEach(el=>{
    el.addEventListener('click', e=>{e.preventDefault();openModal();});
  });
  document.querySelectorAll('#book-modal [data-close]').forEach(el=>el.addEventListener('click', closeModal));
  const form=document.getElementById('book-form');
  if(form){
    form.addEventListener('submit', async e=>{
      e.preventDefault();
      document.querySelectorAll('#book-form .error').forEach(el=>el.textContent='');
      try{
        const fd=new FormData(form);
        const res=await fetch('/book-demo/',{method:'POST',headers:{'X-CSRFToken':getCookie('csrftoken')||''},body:fd});
        const data=await res.json();
        if(data.ok){document.getElementById('book-success').style.display='block';setTimeout(()=>{window.location.href=data.redirect||'/';},700);}
        else if(data.errors){Object.entries(data.errors).forEach(([f,msgs])=>{const h=document.querySelector(`#book-form [data-err="${f}"]`);if(h)h.textContent=msgs.join(' ');});}
      }catch(err){console.error(err);}
    });
  }
  document.addEventListener('keydown', e=>{if(e.key==='Escape') closeModal();});
}

/* anchors + Explore */
function wireSmoothAnchors(){
  const isInternal = a => a.hash && document.querySelector(a.hash);
  const links = [...document.querySelectorAll('a[href^="#"], .explore-link')];
  links.forEach(a=>{
    if(a.classList.contains('explore-link')){ a.addEventListener('click', e=>{e.preventDefault(); document.querySelector('#services')?.scrollIntoView({behavior:'smooth'});}); return; }
    if(!isInternal(a)) return;
    a.addEventListener('click', e=>{
      e.preventDefault();
      document.querySelector(a.hash)?.scrollIntoView({behavior:'smooth'});
    });
  });
}

/* progress */
function wireScrollProgress(){
  const bar=document.getElementById('scroll-progress');
  function onScroll(){const sc=window.scrollY;const docH=document.documentElement.scrollHeight-window.innerHeight;bar.style.width=(docH>0?(sc/docH)*100:0)+'%';}
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();
}

/* counters */
function animateCounters(){
  const els=[...document.querySelectorAll('.num[data-target]')]; if(!els.length) return;
  const fmt=n=>n.toLocaleString(); const once=new WeakSet();
  const obs=new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(!e.isIntersecting||once.has(e.target)) return; once.add(e.target);
      const el=e.target; const target=Number(el.dataset.target||0); const suffix=el.dataset.suffix||''; const dur=1400; const start=performance.now();
      function tick(t){const k=Math.min(1,(t-start)/dur);const eased=k*k*(3-2*k);el.textContent=fmt(Math.floor(target*eased))+suffix;if(k<1) requestAnimationFrame(tick);}
      requestAnimationFrame(tick);
    });
  },{threshold:.5});
  els.forEach(el=>obs.observe(el));
}

/* reveal */
function revealOnScroll(){
  const els=document.querySelectorAll('.reveal');
  const obs=new IntersectionObserver((entries)=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('revealed');obs.unobserve(e.target);}});
  },{threshold:.2});
  els.forEach(el=>obs.observe(el));
}

/* mouse lights + parallax */
(function(){
  const root=document.documentElement;
  window.addEventListener('mousemove', (e)=>{
    const x=(e.clientX/window.innerWidth)*100; const y=(e.clientY/window.innerHeight)*100;
    root.style.setProperty('--mx',x.toFixed(2)+'%'); root.style.setProperty('--my',y.toFixed(2)+'%');
  }, {passive:true});
  const layers=[...document.querySelectorAll('.hero .l1,.hero .l2,.hero .l3')];
  const parallaxEls=[...document.querySelectorAll('.parallax')];
  window.addEventListener('mousemove', (e)=>{
    const cx=e.clientX/window.innerWidth-.5, cy=e.clientY/window.innerHeight-.5;
    layers.forEach((el,i)=>{const d=(i+1)*6; el.style.transform=`translate(${(-cx*d)}px, ${(-cy*d)}px)`;});
    parallaxEls.forEach((el,i)=>{const d=(i+1)*3; el.style.transform=`translate3d(${(-cx*d)}px, ${(-cy*d)}px,0)`;});
  }, {passive:true});
})();

document.addEventListener('DOMContentLoaded', ()=>{
  wireDemo();
  wireSmoothAnchors();
  wireScrollProgress();
  animateCounters();
  revealOnScroll();
});
