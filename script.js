document.getElementById('year').textContent=new Date().getFullYear();

const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const observer=new IntersectionObserver((entries)=>{entries.forEach((entry)=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}})},{threshold:.12});
document.querySelectorAll('.reveal').forEach((el)=>observer.observe(el));

if(!reduced){
  const glow=document.querySelector('.cursor-glow');
  window.addEventListener('pointermove',(e)=>{glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px';},{passive:true});

  document.querySelectorAll('[data-tilt]').forEach((card)=>{
    card.addEventListener('pointermove',(e)=>{
      if(window.innerWidth<900)return;
      const r=card.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5;
      const y=(e.clientY-r.top)/r.height-.5;
      card.style.transform=`perspective(1400px) rotateX(${y*-2.3}deg) rotateY(${x*2.3}deg)`;
    });
    card.addEventListener('pointerleave',()=>{card.style.transform='';});
  });

  window.addEventListener('scroll',()=>{
    const sun=document.querySelector('.sun');
    if(sun) sun.style.transform=`translateY(${window.scrollY*.055}px)`;
  },{passive:true});
}
