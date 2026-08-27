document.getElementById('year').textContent=new Date().getFullYear();

const loader=document.querySelector('.page-loader');
window.addEventListener('load',()=>setTimeout(()=>loader?.classList.add('hide'),180));

const records=[...document.querySelectorAll('[data-record]')];
const io=new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting) entry.target.classList.add('active');
    else entry.target.classList.remove('active');
  });
},{threshold:.45});
records.forEach(record=>io.observe(record));

if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  const mast=document.querySelector('.mast-copy');
  const red=document.querySelector('.red-block');
  window.addEventListener('scroll',()=>{
    const y=window.scrollY;
    if(mast) mast.style.transform=`translateY(${Math.min(y*.09,80)}px)`;
    if(red) red.style.transform=`translateY(${Math.min(y*.05,60)}px) rotate(7deg)`;
  },{passive:true});
}
