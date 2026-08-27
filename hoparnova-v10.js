document.addEventListener('DOMContentLoaded',()=>{
  const root=document.documentElement;
  const body=document.body;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const loader=document.querySelector('.page-loader');
  const year=document.getElementById('year');
  if(year) year.textContent=new Date().getFullYear();

  // Branded Sound Environments: add a focused commercial doorway without turning
  // the artist site into an agency homepage.
  if(!document.querySelector('link[href*="brand-sound-v1.css"]')){
    const brandStyles=document.createElement('link');
    brandStyles.rel='stylesheet';
    brandStyles.href='brand-sound-v1.css?v=1';
    document.head.appendChild(brandStyles);
  }

  const primaryNav=document.querySelector('.nav-shell nav');
  if(primaryNav&&!primaryNav.querySelector('a[href="/brand-sound.html"]')){
    const brandsLink=document.createElement('a');
    brandsLink.href='/brand-sound.html';
    brandsLink.textContent='For Brands';
    primaryNav.appendChild(brandsLink);
  }

  const listenSection=document.querySelector('#listen');
  if(listenSection&&!document.querySelector('.brand-home')){
    const section=document.createElement('section');
    section.className='brand-home';
    section.setAttribute('aria-labelledby','brand-home-title');
    section.innerHTML=`
      <div class="brand-home-inner">
        <div class="brand-home-kicker reveal">FOR HOSPITALITY & BRANDS</div>
        <div class="brand-home-copy">
          <h2 id="brand-home-title" class="reveal">Your space can have <em>its own sound.</em></h2>
          <p class="reveal">HoparNova creates custom-composed sound environments for restaurants, cafés, hotels, lounges, retail, offices, events and brands. The music is shaped around the room, audience, time of day and identity—rather than pulled from the same public playlists everyone else can access.</p>
          <div class="brand-home-actions reveal">
            <a href="/brand-sound.html">Explore branded sound ↗</a>
            <a href="mailto:info@mirdon.com?subject=HoparNova%20Branded%20Sound%20Project">Start a project</a>
          </div>
          <div class="brand-home-note reveal">Optional brand-name vocal signatures · custom sonic motifs · venue-specific music systems · worldwide commissions</div>
        </div>
      </div>`;
    listenSection.parentNode.insertBefore(section,listenSection);
  }

  const hideLoader=()=>loader?.classList.add('hide');
  requestAnimationFrame(()=>setTimeout(hideLoader,180));
  setTimeout(hideLoader,1200);

  const progress=document.querySelector('.scroll-progress span');
  const heroShape=document.querySelector('.hero-shape');
  let ticking=false;
  const onScroll=()=>{
    if(ticking)return;
    ticking=true;
    requestAnimationFrame(()=>{
      const y=window.scrollY;
      const h=Math.max(document.documentElement.scrollHeight-window.innerHeight,1);
      if(progress)progress.style.transform=`scaleX(${Math.min(y/h,1)})`;
      if(!reduced&&window.innerWidth>760&&heroShape){
        heroShape.style.transform=`translate3d(0,${Math.min(y*.045,42)}px,0)`;
      }
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
  }else{
    revealEls.forEach(el=>el.classList.add('in'));
  }

  const records=[...document.querySelectorAll('[data-record]')];
  if('IntersectionObserver' in window){
    const recordObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>entry.target.classList.toggle('active',entry.isIntersecting));
    },{threshold:window.innerWidth<680?.16:.34,rootMargin:'-6% 0px -12% 0px'});
    records.forEach(record=>recordObserver.observe(record));
  }else{
    records.forEach(record=>record.classList.add('active'));
  }

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
    let x=0;
    let last=performance.now();
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