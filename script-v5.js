document.addEventListener('DOMContentLoaded',()=>{
  const year=document.getElementById('year');
  if(year) year.textContent=new Date().getFullYear();

  const loader=document.querySelector('.page-loader');
  const dismiss=()=>loader?.classList.add('hide');
  requestAnimationFrame(()=>setTimeout(dismiss,160));
  setTimeout(dismiss,1400);

  const records=[...document.querySelectorAll('[data-record]')];
  if('IntersectionObserver' in window){
    const io=new IntersectionObserver((entries)=>{
      entries.forEach(entry=>entry.target.classList.toggle('active',entry.isIntersecting));
    },{threshold:window.innerWidth<650?.18:.4});
    records.forEach(record=>io.observe(record));
  }else records.forEach(record=>record.classList.add('active'));

  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reduced && window.innerWidth>700){
    const mast=document.querySelector('.mast-copy');
    const red=document.querySelector('.red-block');
    let ticking=false;
    window.addEventListener('scroll',()=>{
      if(ticking) return;
      ticking=true;
      requestAnimationFrame(()=>{
        const y=window.scrollY;
        if(mast) mast.style.transform=`translateY(${Math.min(y*.06,55)}px)`;
        if(red) red.style.transform=`translateY(${Math.min(y*.035,35)}px) rotate(7deg)`;
        ticking=false;
      });
    },{passive:true});
  }
});