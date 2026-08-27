import * as THREE from 'https://esm.sh/three@0.180.0';
import { EffectComposer } from 'https://esm.sh/three@0.180.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://esm.sh/three@0.180.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://esm.sh/three@0.180.0/examples/jsm/postprocessing/UnrealBloomPass.js';
import { RoomEnvironment } from 'https://esm.sh/three@0.180.0/examples/jsm/environments/RoomEnvironment.js';

const hero = document.querySelector('.masthead');
const coarse = matchMedia('(pointer:coarse)').matches;
const reduced = matchMedia('(prefers-reduced-motion:reduce)').matches;
if (!hero) throw Error('hero');

const host = document.createElement('div');
host.className = 'hero-webgl-v8';
host.setAttribute('aria-hidden', 'true');
host.innerHTML = '<div class="hero-webgl-label">VINYL / ARARAT · HN/08</div>';
hero.prepend(host);

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: !coarse, alpha: true, powerPreference: 'high-performance' });
} catch (e) {
  host.innerHTML = '<div class="hero-webgl-fallback"></div>';
  throw e;
}
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, coarse ? 1.15 : 1.55));
renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
host.prepend(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 50);
camera.position.set(0, 0, 9.6);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
pmrem.dispose();

scene.add(new THREE.HemisphereLight(0xfff2e5, 0x040404, 1.7));
const key = new THREE.DirectionalLight(0xffead9, 4.2);
key.position.set(-3.5, 4.5, 6);
scene.add(key);
const redRim = new THREE.PointLight(0xe5412b, 8, 12);
redRim.position.set(2.6, -1.2, 4.5);
scene.add(redRim);

const rig = new THREE.Group();
scene.add(rig);

const record = new THREE.Group();
rig.add(record);

const vinylMat = new THREE.MeshPhysicalMaterial({
  color: 0x080808,
  roughness: 0.16,
  metalness: 0.16,
  clearcoat: 1,
  clearcoatRoughness: 0.08,
  envMapIntensity: 1.35
});
const edgeMat = new THREE.MeshPhysicalMaterial({
  color: 0x151515,
  roughness: 0.1,
  metalness: 0.48,
  clearcoat: 1,
  clearcoatRoughness: 0.05,
  envMapIntensity: 1.7
});
const redMat = new THREE.MeshPhysicalMaterial({
  color: 0xe5412b,
  roughness: 0.26,
  metalness: 0.08,
  clearcoat: 0.9,
  clearcoatRoughness: 0.08,
  emissive: 0x421008,
  emissiveIntensity: 0.28
});
const metalMat = new THREE.MeshPhysicalMaterial({
  color: 0xc8c1b8,
  roughness: 0.2,
  metalness: 1,
  clearcoat: 0.55,
  clearcoatRoughness: 0.12,
  envMapIntensity: 1.4
});

const disc = new THREE.Mesh(new THREE.CylinderGeometry(1.28, 1.28, 0.115, 128), vinylMat);
disc.rotation.x = Math.PI / 2;
record.add(disc);

const edge = new THREE.Mesh(new THREE.TorusGeometry(1.275, 0.021, 12, 180), edgeMat);
edge.position.z = 0.063;
record.add(edge);

const label = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.128, 72), redMat);
label.rotation.x = Math.PI / 2;
label.position.z = 0.014;
record.add(label);

const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.24, 24), metalMat);
hub.rotation.x = Math.PI / 2;
hub.position.z = 0.12;
record.add(hub);

const grooveMat = new THREE.MeshBasicMaterial({ color: 0x3f3f3f, transparent: true, opacity: 0.46 });
for (let i = 0; i < 11; i++) {
  const g = new THREE.Mesh(new THREE.TorusGeometry(0.48 + i * 0.068, 0.0045, 5, 128), grooveMat);
  g.position.z = 0.066;
  record.add(g);
}

const araratPoints = [
  [-0.92, -0.30], [-0.69, -0.12], [-0.48, 0.12], [-0.28, 0.39], [-0.11, 0.15],
  [0.06, 0.34], [0.22, 0.62], [0.38, 0.28], [0.56, 0.05], [0.78, -0.18], [0.96, -0.31]
].map(([x, y]) => new THREE.Vector3(x, y, 0.078));
const araratGeo = new THREE.BufferGeometry().setFromPoints(araratPoints);
const ararat = new THREE.Line(araratGeo, new THREE.LineBasicMaterial({ color: 0xd8d1c8, transparent: true, opacity: 0.66 }));
ararat.scale.setScalar(0.72);
ararat.position.y = 0.04;
record.add(ararat);

const stylus = new THREE.Group();
rig.add(stylus);
const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 1.72, 20), metalMat);
arm.rotation.z = -0.82;
arm.position.set(1.30, 0.96, 0.48);
stylus.add(arm);
const pivot = new THREE.Mesh(new THREE.SphereGeometry(0.11, 24, 18), edgeMat);
pivot.position.set(1.91, 1.58, 0.48);
stylus.add(pivot);
const head = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.11, 0.12), redMat);
head.position.set(0.66, 0.31, 0.47);
head.rotation.z = -0.82;
stylus.add(head);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), coarse ? 0.12 : 0.18, 0.32, 0.9));

const pointerTarget = new THREE.Vector2();
const pointer = new THREE.Vector2();
let visible = true;
let raf = 0;
let last = performance.now();
let scrollTarget = 0;
let scrollSmooth = 0;

addEventListener('pointermove', (e) => {
  if (coarse) return;
  const b = hero.getBoundingClientRect();
  pointerTarget.set(
    ((e.clientX - b.left) / Math.max(b.width, 1) - 0.5) * 2,
    -((e.clientY - b.top) / Math.max(b.height, 1) - 0.5) * 2
  );
}, { passive: true });

const updateScroll = () => {
  const r = hero.getBoundingClientRect();
  scrollTarget = THREE.MathUtils.clamp((-r.top) / Math.max(r.height, 1), 0, 1);
};
addEventListener('scroll', updateScroll, { passive: true });
updateScroll();

new IntersectionObserver(([entry]) => {
  visible = entry.isIntersecting;
  if (visible && !raf) {
    last = performance.now();
    raf = requestAnimationFrame(loop);
  }
}, { threshold: 0.02 }).observe(hero);

function loop(now) {
  raf = 0;
  if (!visible || document.hidden) return;

  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  pointer.lerp(reduced ? new THREE.Vector2() : pointerTarget, 0.065);
  scrollSmooth += (scrollTarget - scrollSmooth) * (reduced ? 1 : 0.07);

  const t = now * 0.001;
  const mobile = innerWidth < 680;

  rig.position.x = mobile ? 1.05 : 2.55 + pointer.x * 0.13;
  rig.position.y = mobile ? 0.16 : 0.02 + pointer.y * 0.08;
  rig.scale.setScalar(mobile ? 0.64 : 0.94);
  rig.rotation.x = -0.16 + pointer.y * 0.07 + scrollSmooth * 0.10;
  rig.rotation.y = -0.28 + pointer.x * 0.09 - scrollSmooth * 0.08;
  rig.rotation.z = -0.06;

  if (!reduced) record.rotation.z += dt * (0.46 + scrollSmooth * 0.28);
  stylus.rotation.z = -0.05 + scrollSmooth * 0.20 + (reduced ? 0 : Math.sin(t * 0.42) * 0.015);
  stylus.position.x = scrollSmooth * -0.08;
  redMat.emissiveIntensity = 0.25 + (reduced ? 0 : 0.06 * (0.5 + 0.5 * Math.sin(t * 1.2)));

  composer.render();
  raf = requestAnimationFrame(loop);
}

function resize() {
  const w = hero.clientWidth;
  const h = hero.clientHeight;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, coarse ? 1.15 : 1.55));
  renderer.setSize(w, h, false);
  camera.aspect = w / Math.max(h, 1);
  camera.updateProjectionMatrix();
  composer.setSize(w, h);
}
new ResizeObserver(resize).observe(hero);
resize();
raf = requestAnimationFrame(loop);
