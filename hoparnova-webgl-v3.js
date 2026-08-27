import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse=window.matchMedia('(pointer: coarse)').matches;
const layer=document.createElement('div');
layer.className='webgl-sonic-layer';
layer.setAttribute('aria-hidden','true');
layer.innerHTML='<div class="webgl-sonic-badge">HOPARNOVA · SONIC OBJECT / 03</div>';
document.body.appendChild(layer);
document.body.classList.add('webgl-active');

let renderer;
try{
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
}catch(e){
  layer.insertAdjacentHTML('afterbegin','<div class="webgl-sonic-fallback"></div>');
  throw e;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,coarse?1.5:2));
renderer.setSize(innerWidth,innerHeight);
renderer.setClearColor(0x000000,0);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.12;
layer.prepend(renderer.domElement);

const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(32,innerWidth/innerHeight,.1,100);
camera.position.set(0,0,12.2);

scene.add(new THREE.HemisphereLight(0xfff7eb,0x191919,2.8));
const key=new THREE.DirectionalLight(0xffefe3,5.5); key.position.set(-4,6,8); scene.add(key);
const rim=new THREE.DirectionalLight(0xff4a32,4.2); rim.position.set(5,-1,6); scene.add(rim);
const cool=new THREE.DirectionalLight(0xdde8ff,2.4); cool.position.set(4,4,-2); scene.add(cool);

const root=new THREE.Group();
const sculpture=new THREE.Group();
root.add(sculpture); scene.add(root);

const vinylMat=new THREE.MeshPhysicalMaterial({color:0x0b0b0b,roughness:.22,metalness:.52,clearcoat:1,clearcoatRoughness:.12});
const edgeMat=new THREE.MeshStandardMaterial({color:0xbdb8b0,roughness:.22,metalness:1});
const darkMetal=new THREE.MeshStandardMaterial({color:0x191919,roughness:.3,metalness:.9});
const redMat=new THREE.MeshPhysicalMaterial({color:0xe5412b,emissive:0x5b0904,emissiveIntensity:.5,roughness:.22,metalness:.28,clearcoat:1,clearcoatRoughness:.08});
const glassMat=new THREE.MeshPhysicalMaterial({color:0xf8f4ec,roughness:.05,metalness:0,transmission:.94,transparent:true,opacity:.34,ior:1.5,thickness:.7,clearcoat:1,side:THREE.DoubleSide});
const glassRed=new THREE.MeshPhysicalMaterial({color:0xe5412b,roughness:.08,transmission:.72,transparent:true,opacity:.38,ior:1.42,thickness:.45,clearcoat:1,side:THREE.DoubleSide});

const disc=new THREE.Mesh(new THREE.CylinderGeometry(2.52,2.52,.18,128,1,false),vinylMat);
disc.rotation.x=Math.PI/2;
sculpture.add(disc);

const outerRim=new THREE.Mesh(new THREE.TorusGeometry(2.54,.055,18,180),edgeMat);
sculpture.add(outerRim);

const label=new THREE.Mesh(new THREE.CylinderGeometry(.78,.78,.205,96),redMat);
label.rotation.x=Math.PI/2; label.position.z=.02; sculpture.add(label);
const spindle=new THREE.Mesh(new THREE.CylinderGeometry(.085,.085,.33,32),edgeMat);
spindle.rotation.x=Math.PI/2; spindle.position.z=.11; sculpture.add(spindle);

const grooves=new THREE.Group(); sculpture.add(grooves);
for(let i=0;i<13;i++){
  const r=.96+i*.115;
  const g=new THREE.Mesh(new THREE.TorusGeometry(r,.008,6,160),new THREE.MeshBasicMaterial({color:i%3===0?0x2b2b2b:0x171717,transparent:true,opacity:.72}));
  g.position.z=.102; grooves.add(g);
}

const rings=new THREE.Group(); root.add(rings);
const ringMeshes=[];
[
  [3.05,.026,glassMat],[3.34,.038,glassRed],[3.72,.022,glassMat]
].forEach(([r,t,m],i)=>{
  const mesh=new THREE.Mesh(new THREE.TorusGeometry(r,t,12,220),m);
  mesh.rotation.set(i===0?.72:1.14,i===1?.35:-.28,i===2?-.6:.2);
  rings.add(mesh); ringMeshes.push(mesh);
});

const shardGroup=new THREE.Group(); root.add(shardGroup);
const shard=new THREE.Mesh(new THREE.OctahedronGeometry(.78,0),glassMat); shard.scale.set(.58,1.55,.58); shard.position.set(2.45,.15,.5); shard.rotation.set(.25,.55,.4); shardGroup.add(shard);
const shard2=new THREE.Mesh(new THREE.TetrahedronGeometry(.56,0),glassRed); shard2.position.set(-2.6,-.85,.65); shard2.rotation.set(.4,-.2,.8); shardGroup.add(shard2);

const waveform=new THREE.Group(); root.add(waveform);
const waveBars=[];
for(let i=0;i<13;i++){
  const h=.32+Math.abs(Math.sin(i*.73))*1.18;
  const mat=i===6?redMat:edgeMat;
  const b=new THREE.Mesh(new THREE.BoxGeometry(.09,h,.09),mat);
  b.position.x=(i-6)*.19; b.position.y=-2.95+h*.5; b.position.z=.5;
  waveform.add(b); waveBars.push(b);
}

const arm=new THREE.Group(); root.add(arm);
const armBody=new THREE.Mesh(new THREE.CylinderGeometry(.045,.065,3.45,24),edgeMat); armBody.rotation.z=-.95; armBody.position.set(2.45,1.55,.72); arm.add(armBody);
const armPivot=new THREE.Mesh(new THREE.SphereGeometry(.22,32,24),darkMetal); armPivot.position.set(3.84,2.39,.72); arm.add(armPivot);
const stylus=new THREE.Mesh(new THREE.ConeGeometry(.085,.32,24),redMat); stylus.rotation.z=-.95; stylus.position.set(1.03,.69,.72); arm.add(stylus);

const particles=new THREE.Group(); root.add(particles);
const particleMeshes=[];
for(let i=0;i<16;i++){
  const m=new THREE.Mesh(new THREE.SphereGeometry(i%5===0?.075:.035,18,14),i%5===0?redMat:edgeMat);
  const a=(i/16)*Math.PI*2;
  m.userData={a,base:3.35+(i%4)*.18,y:(i%3-1)*.34};
  particles.add(m); particleMeshes.push(m);
}

const halo=new THREE.Mesh(new THREE.RingGeometry(3.85,4.22,160),new THREE.MeshBasicMaterial({color:0xe5412b,transparent:true,opacity:.055,side:THREE.DoubleSide}));
halo.position.z=-.7; root.add(halo);

const states={
  hero:{x:2.75,y:.05,z:0,scale:1,rx:.56,ry:-.32,rz:-.18,ring:1,wave:0,arm:0,shard:.28,spread:1,body:0x0b0b0b},
  about:{x:2.95,y:.1,z:-.1,scale:.94,rx:.94,ry:.48,rz:.5,ring:1.7,wave:.18,arm:0,shard:.72,spread:1.35,body:0x131313},
  brand:{x:2.7,y:.05,z:-.2,scale:.9,rx:.28,ry:-.7,rz:.9,ring:1.22,wave:1,arm:0,shard:1,spread:1.5,body:0x181818},
  records:{x:2.9,y:.0,z:-.12,scale:.9,rx:1.13,ry:.06,rz:.04,ring:.72,wave:.12,arm:1,shard:.2,spread:.88,body:0x0d0d0d},
  listen:{x:2.65,y:.0,z:0,scale:.98,rx:.48,ry:.2,rz:Math.PI*.92,ring:1.02,wave:0,arm:.08,shard:.34,spread:1.08,body:0x101010}
};

const anchors=[];
const rebuildAnchors=()=>{
  anchors.length=0;
  const max=Math.max(document.documentElement.scrollHeight-innerHeight,1);
  const add=(selector,key)=>{const el=document.querySelector(selector);if(el)anchors.push({p:Math.min(Math.max((el.offsetTop-innerHeight*.28)/max,0),1),key});};
  anchors.push({p:0,key:'hero'}); add('#about','about'); add('.brand-home-teaser','brand'); add('#records','records'); add('#listen','listen');
  anchors.sort((a,b)=>a.p-b.p);
  if(anchors.at(-1)?.p<1)anchors.push({p:1,key:'listen'});
};
rebuildAnchors();

const mix=(a,b,t)=>a+(b-a)*t;
const ease=t=>t*t*(3-2*t);
let scrollTarget=0,scrollSmooth=0,pointerX=0,pointerY=0;
const updateScroll=()=>{scrollTarget=Math.min(Math.max(scrollY/Math.max(document.documentElement.scrollHeight-innerHeight,1),0),1)};
window.addEventListener('scroll',updateScroll,{passive:true}); updateScroll();
window.addEventListener('pointermove',e=>{if(coarse)return;pointerX=(e.clientX/innerWidth-.5);pointerY=(e.clientY/innerHeight-.5)} ,{passive:true});

const currentState=()=>{
  let a=anchors[0],b=anchors[anchors.length-1];
  for(let i=0;i<anchors.length-1;i++){if(scrollSmooth>=anchors[i].p&&scrollSmooth<=anchors[i+1].p){a=anchors[i];b=anchors[i+1];break}}
  const span=Math.max(b.p-a.p,.0001); const t=ease(Math.min(Math.max((scrollSmooth-a.p)/span,0),1));
  const A=states[a.key],B=states[b.key];
  return {x:mix(A.x,B.x,t),y:mix(A.y,B.y,t),z:mix(A.z,B.z,t),scale:mix(A.scale,B.scale,t),rx:mix(A.rx,B.rx,t),ry:mix(A.ry,B.ry,t),rz:mix(A.rz,B.rz,t),ring:mix(A.ring,B.ring,t),wave:mix(A.wave,B.wave,t),arm:mix(A.arm,B.arm,t),shard:mix(A.shard,B.shard,t),spread:mix(A.spread,B.spread,t),body:t<.5?A.body:B.body};
};

const clock=new THREE.Clock();
const render=()=>{
  const dt=Math.min(clock.getDelta(),.05); const time=clock.elapsedTime;
  scrollSmooth+=((reduced?scrollTarget:scrollTarget)-scrollSmooth)*(reduced?1:.065);
  const s=currentState();
  const mobile=innerWidth<760;
  root.position.x=mobile?0:s.x+pointerX*.26; root.position.y=mobile?-1.05:s.y-pointerY*.18; root.position.z=s.z;
  root.scale.setScalar((mobile?.68:s.scale));
  root.rotation.x=s.rx+(reduced?0:pointerY*.08); root.rotation.y=s.ry+(reduced?0:pointerX*.1); root.rotation.z=s.rz+(reduced?0:time*.035);
  vinylMat.color.setHex(s.body);
  sculpture.rotation.z=reduced?0:time*.08;
  ringMeshes.forEach((r,i)=>{const k=s.ring*(1+i*.055);r.scale.setScalar(k);if(!reduced)r.rotation.z+=dt*(i%2?-.12:.09)});
  waveform.scale.setScalar(.65+.35*s.wave); waveform.children.forEach((b,i)=>{b.scale.y=.04+s.wave*(.8+.25*Math.sin(time*2.2+i*.72));b.material.transparent=true;b.material.opacity=.12+.88*s.wave});
  waveform.visible=s.wave>.025;
  arm.scale.setScalar(.75+.25*s.arm); arm.visible=s.arm>.025; arm.children.forEach(c=>{c.material.transparent=true;c.material.opacity=s.arm}); arm.rotation.z=(1-s.arm)*-.45;
  shardGroup.children.forEach((m,i)=>{m.material.opacity=.06+s.shard*(i? .38:.28);m.scale.multiplyScalar(1);if(!reduced)m.rotation.y+=dt*(i?-.22:.16)});
  particleMeshes.forEach((p,i)=>{const d=p.userData.base*s.spread;const a=p.userData.a+(reduced?0:time*(i%2?.055:-.045));p.position.set(Math.cos(a)*d,Math.sin(a)*d*.68+p.userData.y,Math.sin(a*1.7)*.8);});
  halo.material.opacity=.035+.06*Math.max(s.wave,s.arm*.45);
  renderer.render(scene,camera);
  requestAnimationFrame(render);
};
render();

const resize=()=>{
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,coarse?1.5:2)); renderer.setSize(innerWidth,innerHeight); camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); rebuildAnchors(); updateScroll();
};
window.addEventListener('resize',resize,{passive:true});
