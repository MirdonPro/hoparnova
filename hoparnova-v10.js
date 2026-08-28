document.addEventListener('DOMContentLoaded',()=>{
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const loader=document.querySelector('.page-loader');
  const year=document.getElementById('year');
  if(year) year.textContent=new Date().getFullYear();

  if(!document.querySelector('link[href*="hero-relic-v10.css"]')){
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='hero-relic-v10.css?v=10';
    document.head.appendChild(link);
  }
  import('./hero-relic-v10.js?v=10').catch(()=>{
    if(!document.querySelector('.hero-relic-v10')){
      const hero=document.querySelector('.masthead');
      if(hero){
        const fallback=document.createElement('div');
        fallback.className='hero-relic-v10';
        fallback.setAttribute('aria-hidden','true');
        fallback.innerHTML='<div class="hero-relic-fallback"></div>';
        hero.prepend(fallback);
      }
    }
  });

  const hideLoader=()=>loader?.classList.add('hide');
  requestAnimationFrame(()=>setTimeout(hideLoader,180));
  setTimeout(hideLoader,1200);

  const progress=document.querySelector('.scroll-progress span');
  let ticking=false;
  const onScroll=()=>{
    if(ticking)return;
    ticking=true;
    requestAnimationFrame(()=>{
      const y=window.scrollY;
      const h=Math.max(document.documentElement.scrollHeight-window.innerHeight,1);
      if(progress) progress.style.transform=`scaleX(${Math.min(y/h,1)})`;
      ticking=false;
    });
  };
  window.addEventListener('scroll',onScroll,{passive:true});
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