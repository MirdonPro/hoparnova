document.addEventListener('DOMContentLoaded',()=>{
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const loader=document.querySelector('.page-loader');
  const year=document.getElementById('year');
  if(year) year.textContent=new Date().getFullYear();

  // The homepage now owns its For Brands link and teaser in HTML.
  // Do not inject duplicate navigation or duplicate brand sections here.

  const masthead=document.querySelector('.masthead');
  if(masthead&&!masthead.querySelector('.sonic-stage')){
    const stage=document.createElement('div');
    stage.className='sonic-stage';
    stage.setAttribute('aria-hidden','true');
    stage.innerHTML=`
      <div class="sonic-object">
        <div class="sonic-ring r1"></div>
        <div class="sonic-ring r2"></div>
        <div class="sonic-ring r3"></div>
        <div class="sonic-disc">
          <div class="sonic-core"><div><b>HOPAR<br>NOVA</b><small>YEREVAN / SOUND</small></div></div>
        </div>
        <div class="sonic-glass"></div>
      </div>
      <div class="sonic-caption">SONIC OBJECT · 001</div>`;
    const mastBottom=masthead.querySelector('.mast-bottom');
    masthead.insertBefore(stage,mastBottom||null);
    masthead.classList.add('has-sonic-object');
  }

  const hideLoader=()=>loader?.classList.add('hide');
  requestAnimationFrame(()=>setTimeout(hideLoader,180));
  setTimeout(hideLoader,1200);

  const progress=document.querySelector('.scroll-progress span');
  const heroShape=document.querySelector('.hero-shape');
  const sonicObject=document.querySelector('.sonic-object');
  const sonicStage=document.querySelector('.sonic-stage');
  let pointerX=0,pointerY=0;
  let ticking=false;

  if(sonicStage&&!reduced&&window.matchMedia('(pointer:fine)').matches){
    sonicStage.addEventListener('pointermove',e=>{
      const r=sonicStage.getBoundingClientRect();
      pointerX=((e.clientX-r.left)/r.width-.5)*8;
      pointerY=((e.clientY-r.top)/r.height-.5)*-7;
    });
    sonicStage.addEventListener('pointerleave',()=>{pointerX=0;pointerY=0});
  }

  const onScroll=()=>{
    if(ticking)return;
    ticking=true;
    requestAnimationFrame(()=>{
      const y=window.scrollY;
      const h=Math.max(document.documentElement.scrollHeight-window.innerHeight,1);
      if(progress) progress.style.transform=`scaleX(${Math.min(y/h,1)})`;
      if(!reduced&&window.innerWidth>760&&heroShape){
        heroShape.style.transform=`translate3d(0,${Math.min(y*.035,34)}px,0) scale(.8)`;
      }
      if(sonicObject&&!reduced){
        const hero=masthead?.getBoundingClientRect();
        const heroHeight=Math.max(masthead?.offsetHeight||window.innerHeight,1);
        const local=hero?Math.min(Math.max((-hero.top)/heroHeight,0),1):0;
        const spin=-18+local*132;
        const tilt=56-local*17+pointerY;
        const yaw=-10+local*24+pointerX;
        const lift=local*-18;
        sonicObject.style.transform=`translate3d(0,${lift}px,0) rotateX(${tilt}deg) rotateY(${yaw}deg) rotateZ(${spin}deg)`;
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