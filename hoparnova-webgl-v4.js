import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse=window.matchMedia('(pointer: coarse)').matches;
const layer=document.createElement('div');
layer.className='webgl-sonic-layer';
layer.setAttribute('aria-hidden','true');
layer.innerHTML='<div class="webgl-sonic-badge">HOPARNOVA · SONIC SCULPTURE / 04</div>';
document.body.appendChild(layer);
document.body.classList.add('webgl-active');

let renderer;
try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});}catch(e){layer.insertAdjacentHTML('afterbegin','<div class="webgl-sonic-fallback"></div>');throw e;}
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,coarse?1.35:1.8));
renderer.setSize(innerWidth,innerHeight);
renderer.setClearColor(0x000000,0);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.05;
layer.prepend(renderer.domElement);

const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(31,innerWidth/innerHeight,.1,100);
camera.position.set(0,0,13.5);
scene.add(new THREE.HemisphereLight(0xfff8ef,0x202020,2.2));
const key=new THREE.DirectionalLight(0xfff0df,4.6);key.position.set(-4,5,7);scene.add(key);
const rim=new THREE.DirectionalLight(0xe5412b,3.2);rim.position.set(5,-2,6);scene.add(rim);
const cool=new THREE.DirectionalLight(0xdde8ff,1.8);cool.position.set(4,4,-3);scene.add(cool);

const root=new THREE.Group();scene.add(root);
const metal=new THREE.MeshPhysicalMaterial({color:0xa9a49b,roughness:.18,metalness:1,clearcoat:.75,clearcoatRoughness:.12});
const dark=new THREE.MeshPhysicalMaterial({color:0x141414,roughness:.2,metalness:.86,clearcoat:.9,clearcoatRoughness:.08});
const red=new THREE.MeshPhysicalMaterial({color:0xe5412b,emissive:0x5c0a04,emissiveIntensity:.35,roughness:.16,metalness:.2,clearcoat:1,clearcoatRoughness:.05});
const glass=new THREE.MeshPhysicalMaterial({color:0xf7f1e8,roughness:.03,transmission:.95,transparent:true,opacity:.42,ior:1.5,thickness:.35,clearcoat:1,side:THREE.DoubleSide});
const redGlass=new THREE.MeshPhysicalMaterial({color:0xe5412b,roughness:.04,transmission:.82,transparent:true,opacity:.44,ior:1.45,thickness:.25,clearcoat:1,side:THREE.DoubleSide});

// Compact gyroscopic core: no oversized black disc.
const core=new THREE.Group();root.add(core);
const orb=new THREE.Mesh(new THREE.SphereGeometry(.58,64,48),red);core.add(orb);
const darkHub=new THREE.Mesh(new THREE.TorusGeometry(.86,.11,24,128),dark);darkHub.rotation.x=Math.PI/2;core.add(darkHub);
const metalRing=new THREE.Mesh(new THREE.TorusGeometry(1.18,.045,18,180),metal);metalRing.rotation.set(.78,.2,.35);core.add(metalRing);
const glassRing=new THREE.Mesh(new THREE.TorusGeometry(1.48,.036,18,180),glass);glassRing.rotation.set(1.14,-.58,-.24);core.add(glassRing);
const redRing=new THREE.Mesh(new THREE.TorusGeometry(1.72,.024,14,180),redGlass);redRing.rotation.set(.46,.88,.7);core.add(redRing);

const spindle=new THREE.Mesh(new THREE.CylinderGeometry(.075,.075,2.7,32),metal);spindle.rotation.z=.7;core.add(spindle);
const cap1=new THREE.Mesh(new THREE.SphereGeometry(.12,24,18),dark);cap1.position.set(.86,-1.02,0);core.add(cap1);
const cap2=new THREE.Mesh(new THREE.SphereGeometry(.12,24,18),dark);cap2.position.set(-.86,1.02,0);core.add(cap2);

const fins=new THREE.Group();root.add(fins);
for(let i=0;i<5;i++){
  const m=new THREE.Mesh(new THREE.BoxGeometry(.055,.58,.18),i===2?redGlass:glass);
  m.position.x=(i-2)*.18;m.position.y=-1.6+Math.abs(i-2)*.05;m.rotation.z=(i-2)*.08;fins.add(m);
}

const satellites=new THREE.Group();root.add(satellites);
const sat=[];
for(let i=0;i<9;i++){
  const m=new THREE.Mesh(new THREE.SphereGeometry(i%4===0?.055:.028,18,14),i%4===0?red:metal);
  m.userData={a:(i/9)*Math.PI*2,r:1.95+(i%3)*.12,z:(i%2?-.28:.28)};
  satellites.add(m);sat.push(m);
}

const arm=new THREE.Group();root.add(arm);
const armBody=new THREE.Mesh(new THREE.CylinderGeometry(.025,.04,1.75,18),metal);armBody.rotation.z=-1.02;armBody.position.set(1.38,.9,.32);arm.add(armBody);
const pivot=new THREE.Mesh(new THREE.SphereGeometry(.12,24,18),dark);pivot.position.set(2.08,1.35,.32);arm.add(pivot);
const tip=new THREE.Mesh(new THREE.ConeGeometry(.055,.2,20),red);tip.rotation.z=-1.02;tip.position.set(.7,.45,.32);arm.add(tip);

const states={
 hero:{x:2.65,y:.45,scale:.72,rx:.35,ry:-.35,rz:-.22,spread:1,fin:.15,arm:.05},
 about:{x:2.85,y:.05,scale:.66,rx:.85,ry:.48,rz:.38,spread:1.18,fin:.28,arm:.02},
 brand:{x:2.65,y:.2,scale:.68,rx:.26,ry:-.65,rz:.72,spread:1.3,fin:1,arm:.02},
 records:{x:2.9,y:.1,scale:.65,rx:1.05,ry:.06,rz:.08,spread:.9,fin:.08,arm:1},
 listen:{x:2.65,y:.2,scale:.7,rx:.46,ry:.16,rz:2.7,spread:1.02,fin:.1,arm:.08}
};

const anchors=[];
const rebuildAnchors=()=>{anchors.length=0;const max=Math.max(document.documentElement.scrollHeight-innerHeight,1);const add=(selector,key)=>{const el=document.querySelector(selector);if(el)anchors.push({p:Math.min(Math.max((el.offsetTop-innerHeight*.28)/max,0),1),key});};anchors.push({p:0,key:'hero'});add('#about','about');add('.brand-home-teaser','brand');add('#records','records');add('#listen','listen');anchors.sort((a,b)=>a.p-b.p);if(anchors.at(-1)?.p<1)anchors.push({p:1,key:'listen'});};
rebuildAnchors();
const mix=(a,b,t)=>a+(b-a)*t;const ease=t=>t*t*(3-2*t);
let target=0,smooth=0,px=0,py=0;
const updateScroll=()=>{target=Math.min(Math.max(scrollY/Math.max(document.documentElement.scrollHeight-innerHeight,1),0),1)};
addEventListener('scroll',updateScroll,{passive:true});updateScroll();
addEventListener('pointermove',e=>{if(coarse)return;px=e.clientX/innerWidth-.5;py=e.clientY/innerHeight-.5},{passive:true});
const state=()=>{let a=anchors[0],b=anchors.at(-1);for(let i=0;i<anchors.length-1;i++){if(smooth>=anchors[i].p&&smooth<=anchors[i+1].p){a=anchors[i];b=anchors[i+1];break}}const t=ease(Math.min(Math.max((smooth-a.p)/Math.max(b.p-a.p,.0001),0),1));const A=states[a.key],B=states[b.key];return Object.fromEntries(Object.keys(A).map(k=>[k,mix(A[k],B[k],t)]));};

const clock=new THREE.Clock();
const render=()=>{
 const dt=Math.min(clock.getDelta(),.05),time=clock.elapsedTime;smooth+=(target-smooth)*(reduced?1:.07);const s=state();const mobile=innerWidth<760;
 root.position.x=mobile?1.15:s.x+px*.16;root.position.y=mobile?-.25:s.y-py*.12;root.position.z=0;
 root.scale.setScalar(mobile?.43:s.scale);
 root.rotation.x=s.rx+(reduced?0:py*.05);root.rotation.y=s.ry+(reduced?0:px*.07);root.rotation.z=s.rz+(reduced?0:time*.018);
 core.rotation.z=reduced?0:time*.045;metalRing.rotation.z+=reduced?0:dt*.05;glassRing.rotation.z+=reduced?0:-dt*.07;redRing.rotation.z+=reduced?0:dt*.09;
 fins.children.forEach((m,i)=>{m.material.transparent=true;m.material.opacity=.08+s.fin*(i===2?.5:.26);m.scale.y=.25+s.fin*(.8+.12*Math.sin(time*2+i));});
 arm.visible=s.arm>.02;arm.children.forEach(c=>{c.material.transparent=true;c.material.opacity=s.arm});arm.rotation.z=(1-s.arm)*-.35;
 sat.forEach((m,i)=>{const a=m.userData.a+(reduced?0:time*(i%2?.045:-.04));const r=m.userData.r*s.spread;m.position.set(Math.cos(a)*r,Math.sin(a)*r*.55,Math.sin(a*1.6)*.45+m.userData.z);});
 renderer.render(scene,camera);requestAnimationFrame(render);
};
render();
const resize=()=>{renderer.setPixelRatio(Math.min(devicePixelRatio||1,coarse?1.35:1.8));renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();rebuildAnchors();updateScroll();};
addEventListener('resize',resize,{passive:true});