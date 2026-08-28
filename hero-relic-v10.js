import * as THREE from 'https://esm.sh/three@0.180.0';
import { EffectComposer } from 'https://esm.sh/three@0.180.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://esm.sh/three@0.180.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://esm.sh/three@0.180.0/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'https://esm.sh/three@0.180.0/examples/jsm/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'https://esm.sh/three@0.180.0/examples/jsm/environments/RoomEnvironment.js';

const hero = document.querySelector('.masthead');
if (!hero) throw new Error('HoparNova hero not found');
const coarse = matchMedia('(pointer:coarse)').matches;
const reduced = matchMedia('(prefers-reduced-motion:reduce)').matches;
const host = document.createElement('div');
host.className = 'hero-relic-v10';
host.setAttribute('aria-hidden','true');
host.innerHTML = '<div class="hero-relic-label">ARARAT TURNTABLE RELIC · HN/10</div>';
hero.prepend(host);

let renderer;
try { renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true, powerPreference:'high-performance' }); }
catch(error){ host.innerHTML='<div class="hero-relic-fallback"></div>'; throw error; }
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.08;
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.setClearColor(0x000000,0);
host.prepend(renderer.domElement);

const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(32,1,.1,60);
camera.position.set(0,.08,10.6);
const pmrem=new THREE.PMREMGenerator(renderer);
scene.environment=pmrem.fromScene(new RoomEnvironment(),.045).texture;
pmrem.dispose();
scene.add(new THREE.HemisphereLight(0xfff1e4,0x020202,1.3));
const key=new THREE.SpotLight(0xffead6,35,30,Math.PI*.22,.55,1.2); key.position.set(-4.8,5.6,7.6); key.target.position.set(.7,0,0); key.castShadow=true; scene.add(key,key.target);
const redStrip=new THREE.PointLight(0xe5412b,12,16); redStrip.position.set(4.8,-1.4,4.2); scene.add(redStrip);
const coolRim=new THREE.PointLight(0xbfd0e8,7,18); coolRim.position.set(3.4,4.5,-2.5); scene.add(coolRim);

function makeGrooveTexture(size=2048){
  const c=document.createElement('canvas'); c.width=c.height=size; const x=c.getContext('2d');
  const img=x.createImageData(size,size),d=img.data,cx=size/2,cy=size/2;
  for(let y=0;y<size;y++) for(let xx=0;xx<size;xx++){
    const dx=xx-cx,dy=y-cy,r=Math.sqrt(dx*dx+dy*dy)/cx;
    const groove=Math.sin(r*1040)*.5+.5, fine=Math.sin(r*1880+Math.sin(r*40)*1.5)*.5+.5;
    const v=Math.max(0,Math.min(255,112+groove*24+fine*12+(1-r)*8));
    const i=(y*size+xx)*4; d[i]=d[i+1]=d[i+2]=v; d[i+3]=255;
  }
  x.putImageData(img,0,0); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.NoColorSpace; return t;
}
const grooveTex=makeGrooveTexture(coarse?1024:2048);
grooveTex.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);

const vinylMat=new THREE.MeshPhysicalMaterial({color:0x050505,metalness:.08,roughness:.2,clearcoat:1,clearcoatRoughness:.055,bumpMap:grooveTex,bumpScale:.014,envMapIntensity:1.55});
const rimMat=new THREE.MeshPhysicalMaterial({color:0x9b958d,metalness:1,roughness:.18,anisotropy:.78,anisotropyRotation:Math.PI*.5,clearcoat:.28,envMapIntensity:1.85});
const lacquerMat=new THREE.MeshPhysicalMaterial({color:0xc92f21,metalness:.03,roughness:.13,clearcoat:1,clearcoatRoughness:.035,emissive:0x441008,emissiveIntensity:.18,envMapIntensity:1.5});
const glassMat=new THREE.MeshPhysicalMaterial({color:0xd7c3bc,roughness:.035,transmission:.94,thickness:.18,ior:1.46,transparent:true,opacity:.45,clearcoat:1,envMapIntensity:1.4,depthWrite:false});
const blackMetal=new THREE.MeshPhysicalMaterial({color:0x121212,metalness:.72,roughness:.2,anisotropy:.5,clearcoat:.7,clearcoatRoughness:.12});

const rig=new THREE.Group(); scene.add(rig);
const platter=new THREE.Group(); rig.add(platter);
const disc=new THREE.Mesh(new THREE.CylinderGeometry(1.52,1.52,.16,192),vinylMat); disc.rotation.x=Math.PI/2; disc.castShadow=true; disc.receiveShadow=true; platter.add(disc);
const bevel=new THREE.Mesh(new THREE.TorusGeometry(1.505,.045,18,240),rimMat); bevel.position.z=.085; platter.add(bevel);
const label=new THREE.Mesh(new THREE.CylinderGeometry(.41,.41,.175,96),lacquerMat); label.rotation.x=Math.PI/2; label.position.z=.018; platter.add(label);
const spindle=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.28,32),rimMat); spindle.rotation.x=Math.PI/2; spindle.position.z=.14; platter.add(spindle);
const araratPts=[[-.89,-.26],[-.68,-.12],[-.49,.08],[-.31,.36],[-.12,.13],[.03,.28],[.18,.58],[.35,.26],[.53,.04],[.72,-.15],[.92,-.27]].map(([x,y])=>new THREE.Vector3(x*.83,y*.83,.092));
const ararat=new THREE.Line(new THREE.BufferGeometry().setFromPoints(araratPts),new THREE.LineBasicMaterial({color:0xe4ddd3,transparent:true,opacity:.84})); platter.add(ararat);

const halo=new THREE.Mesh(new THREE.TorusGeometry(1.87,.026,20,256),glassMat); halo.rotation.set(1.06,.16,.19); rig.add(halo);
const pulseMat=new THREE.MeshBasicMaterial({color:0xe5412b,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});
const pulseRing=new THREE.Mesh(new THREE.TorusGeometry(1.9,.018,10,256),pulseMat); pulseRing.rotation.copy(halo.rotation); rig.add(pulseRing);

const stylus=new THREE.Group(); rig.add(stylus);
const base=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,.18,48),blackMetal); base.rotation.x=Math.PI/2; base.position.set(1.95,1.43,.53); stylus.add(base);
const arm=new THREE.Mesh(new THREE.CylinderGeometry(.028,.038,1.86,28),rimMat); arm.rotation.z=-.81; arm.position.set(1.29,.78,.53); stylus.add(arm);
const cartridge=new THREE.Mesh(new THREE.BoxGeometry(.19,.12,.15),lacquerMat); cartridge.position.set(.59,.17,.52); cartridge.rotation.z=-.81; stylus.add(cartridge);
const needle=new THREE.Mesh(new THREE.CylinderGeometry(.008,.012,.24,12),rimMat); needle.rotation.x=Math.PI*.5; needle.position.set(.54,.10,.39); stylus.add(needle);

const shadowMat=new THREE.ShadowMaterial({color:0x000000,opacity:.36});
const floor=new THREE.Mesh(new THREE.PlaneGeometry(9,7),shadowMat); floor.rotation.x=-Math.PI/2; floor.position.set(1.2,-2.05,-.7); floor.receiveShadow=true; scene.add(floor);

const composer=new EffectComposer(renderer); composer.addPass(new RenderPass(scene,camera));
const bloom=new UnrealBloomPass(new THREE.Vector2(1,1),coarse?.11:.16,.28,.92); composer.addPass(bloom); composer.addPass(new OutputPass());

const state={scroll:0,scrollSmooth:0,pointer:new THREE.Vector2(),pointerTarget:new THREE.Vector2(),tap:0,spinBoost:0,quality:coarse?1.72:1.95,fps:60};
let visible=true,raf=0,last=performance.now(),fpsAccum=0,fpsFrames=0,lastQualityCheck=performance.now();
function updateScroll(){const r=hero.getBoundingClientRect(); state.scroll=THREE.MathUtils.clamp(-r.top/Math.max(r.height,1),0,1);} addEventListener('scroll',updateScroll,{passive:true}); updateScroll();
addEventListener('pointermove',e=>{if(coarse)return;const r=hero.getBoundingClientRect();state.pointerTarget.set(((e.clientX-r.left)/Math.max(r.width,1)-.5)*2,-((e.clientY-r.top)/Math.max(r.height,1)-.5)*2)},{passive:true});
hero.addEventListener('pointerdown',e=>{if(e.target.closest('a,button,input,select,textarea'))return;state.tap=1;state.spinBoost=1;},{passive:true});
new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible&&!raf){last=performance.now();raf=requestAnimationFrame(loop)}},{threshold:.02}).observe(hero);
function resize(){const w=Math.max(hero.clientWidth,1),h=Math.max(hero.clientHeight,1),q=Math.min(state.quality,window.devicePixelRatio||1),rw=Math.max(1,Math.floor(w*q)),rh=Math.max(1,Math.floor(h*q));renderer.setPixelRatio(1);renderer.setSize(rw,rh,false);renderer.domElement.style.width=w+'px';renderer.domElement.style.height=h+'px';camera.aspect=w/h;camera.updateProjectionMatrix();composer.setSize(rw,rh);}
function adjustQuality(now,dt){fpsAccum+=dt;fpsFrames++;if(now-lastQualityCheck<1800)return;state.fps=fpsFrames/Math.max(fpsAccum,.001);fpsAccum=0;fpsFrames=0;lastQualityCheck=now;const old=state.quality;if(state.fps<46)state.quality=Math.max(1.25,state.quality-.18);else if(state.fps>57)state.quality=Math.min(coarse?1.82:2,state.quality+.08);if(Math.abs(old-state.quality)>.03)resize();}
function loop(now){raf=0;if(!visible||document.hidden)return;const dt=Math.min((now-last)/1000,.05);last=now;adjustQuality(now,dt);state.pointer.lerp(reduced?new THREE.Vector2():state.pointerTarget,.055);state.scrollSmooth+=(state.scroll-state.scrollSmooth)*(reduced?1:.07);state.tap*=reduced?0:Math.pow(.025,dt);state.spinBoost*=reduced?0:Math.pow(.045,dt);const s=state.scrollSmooth,t=now*.001,mobile=innerWidth<680;rig.position.set(mobile?.82:2.42+state.pointer.x*.1,mobile?.1:state.pointer.y*.06,0);rig.scale.setScalar(mobile?.62:.92);rig.rotation.set(-.13+state.pointer.y*.055+s*.09,-.34+state.pointer.x*.07-s*.07,-.045);if(!reduced)platter.rotation.z+=dt*(.30+s*.42+state.spinBoost*2.1);const wake=THREE.MathUtils.smoothstep(s,.12,.72);halo.scale.setScalar(1+wake*.11+state.tap*.12);halo.rotation.z=.19+s*.25+(reduced?0:Math.sin(t*.2)*.024);glassMat.opacity=.18+wake*.30+state.tap*.08;stylus.rotation.z=-.11+THREE.MathUtils.smoothstep(s,.22,.78)*.29-state.tap*.055;stylus.position.x=-s*.12;stylus.position.y=state.tap*.035;pulseRing.scale.setScalar(1+(1-state.tap)*.52);pulseMat.opacity=Math.min(.75,state.tap*.72);lacquerMat.emissiveIntensity=.18+state.tap*1.1+(reduced?0:(.03+.025*Math.sin(t*1.1)));redStrip.intensity=12+state.tap*8;bloom.strength=(coarse?.11:.16)+state.tap*.12;composer.render();raf=requestAnimationFrame(loop);}
new ResizeObserver(resize).observe(hero);resize();raf=requestAnimationFrame(loop);
