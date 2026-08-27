document.addEventListener('DOMContentLoaded',()=>{
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const loader=document.querySelector('.page-loader');
  const year=document.getElementById('year');
  if(year) year.textContent=new Date().getFullYear();

  if(!document.querySelector('link[href*="sonic-journey-v2.css"]')){
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='sonic-journey-v2.css?v=2';
    document.head.appendChild(link);
  }

  if(!document.querySelector('.sonic-journey')){
    const journey=document.createElement('div');
    journey.className='sonic-journey';
    journey.dataset.phase='hero';
    journey.setAttribute('aria-hidden','true');
    journey.innerHTML=`
      <div class="sj-scene">
        <div class="sj-ring a"></div><div class="sj-ring b"></div><div class="sj-ring c"></div>
        <div class="sj-disc"></div>
        <div class="sj-core"><div><b>HOPAR<br>NOVA</b><small>YEREVAN / SOUND</small></div></div>
        <div class="sj-glass"></div>
        <div class="sj-prism"></div>
        <div class="sj-wave"><i style="--h:22%"></i><i style="--h:48%"></i><i style="--h:72%"></i><i style="--h:94%"></i><i style="--h:58%"></i><i style="--h:34%"></i><i style="--h:78%"></i><i style="--h:46%"></i><i style="--h:68%"></i><i style="--h:28%"></i></div>
        <div class="sj-tonearm"></div>
        <div class="sj-orbit o1"></div><div class="sj-orbit o2"></div><div class="sj-orbit o3"></div>
      </div>
      <div class="sj-label">SONIC SYSTEM · HN/02</div>`;
    document.body.appendChild(journey);
  }

  const hideLoader=()=>loader?.classList.add('hide');
  requestAnimationFrame(()=>setTimeout(hideLoader,180));
  setTimeout(hideLoader,1200);

  const progress=document.querySelector('.scroll-progress span');
  const heroShape=document.querySelector('.hero-shape');
  const journey=document.querySelector('.sonic-journey');
  const scene=document.querySelector('.sj-scene');
  const phases=[
    {name:'hero',el:document.querySelector('.masthead')},
    {name:'about',el:document.querySelector('#about')},
    {name:'brand',el:document.querySelector('.brand-home-teaser')},
    {name:'records',el:document.querySelector('#records')},
    {name:'listen',el:document.querySelector('#listen')}
  ].filter(x=>x.el);

  let pointerX=0,pointerY=0,ticking=false;
  if(!reduced&&window.matchMedia('(pointer:fine)').matches){
    window.addEventListener('pointermove',e=>{
      pointerX=(e.clientX/window.innerWidth-.5)*8;
      pointerY=(e.clientY/window.innerHeight-.5)*-6;
    },{passive:true});
  }

  const getPhase=()=>{
    const probe=window.innerHeight*.52;
    let current=phases[0]?.name||'hero';
    for(const p of phases){
      const r=p.el.getBoundingClientRect();
      if(r.top<=probe&&r.bottom>=probe){current=p.name;break}
      if(r.top<probe) current=p.name;
    }
    return current;
  };

  const onScroll=()=>{
    if(ticking)return;
    ticking=true;
    requestAnimationFrame(()=>{
      const y=window.scrollY;
      const h=Math.max(document.documentElement.scrollHeight-window.innerHeight,1);
      const global=Math.min(Math.max(y/h,0),1);
      if(progress) progress.style.transform=`scaleX(${global})`;
      if(!reduced&&window.innerWidth>760&&heroShape){
        heroShape.style.transform=`translate3d(0,${Math.min(y*.028,28)}px,0) scale(.72)`;
      }
      if(journey){
        const phase=getPhase();
        if(journey.dataset.phase!==phase) journey.dataset.phase=phase;
        const labels={hero:'SONIC SYSTEM · HN/02',about:'PLACE → SOUND',brand:'BRAND → SIGNAL',records:'RECORD / NEEDLE',listen:'RESOLVE / LISTEN'};
        const label=journey.querySelector('.sj-label');
        if(label) label.textContent=labels[phase]||labels.hero;
      }
      if(scene&&!reduced){
        const spin=global*520;
        const rx=52-Math.sin(global*Math.PI*2)*13+pointerY;
        const ry=-10+Math.sin(global*Math.PI*3)*22+pointerX;
        const rz=-16+global*72;
        journey?.style.setProperty('--spin',`${spin}deg`);
        journey?.style.setProperty('--rx',`${rx}deg`);
        journey?.style.setProperty('--ry',`${ry}deg`);
        journey?.style.setProperty('--rz',`${rz}deg`);
      }
      ticking=false;
    });
  };
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',onScroll,{passive:true});
  onScroll();

  const revealEls=[...document.querySelectorAll('.reveal')];
  if('IntersectionObserver' in window){
    const revealObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    },{threshold:.12,rootMargin:'0px 0px -8% 0px'});
    revealEls.forEach(el=>revealObserver.observe(el));
  }else revealEls.forEach(el=>el.classList.add('in'));

  const records=[...document.querySelectorAll('[data-record]')];
  if('IntersectionObserver' in window){
    const recordObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>entry.target.classList.toggle('active',entry.isIntersecting));
    },{threshold:window.innerWidth<680?.16:.34,rootMargin:'-6% 0px -12% 0px'});
    records.forEach(record=>recordObserver.observe(record));
  }else records.forEach(record=>record.classList.add('active'));

  const navLinks=[...document.querySelectorAll('nav a[href^="#"]')];
  const navTargets=navLinks.map(link=>document.querySelector(link.getAttribute('href'))).filter(Boolean);
  if('IntersectionObserver' in window){
    const navObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          navLinks.forEach(link=>link.classList.toggle('active',link.getAttribute('href')===`#${entry.target.id}`));
        }
      });
    },{rootMargin:'-30% 0px -60% 0px',threshold:0});
    navTargets.forEach(section=>navObserver.observe(section));
  }

  const track=document.querySelector('.interlude-track');
  if(track&&!reduced){
    let x=0,last=performance.now();
    const speed=window.innerWidth<680?22:34;
    const animate=now=>{
      const dt=Math.min((now-last)/1000,.05);
      last=now;
      x-=speed*dt;
      const half=track.scrollWidth/2;
      if(Math.abs(x)>=half)x=0;
      track.style.transform=`translate3d(${x}px,0,0)`;
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }
});