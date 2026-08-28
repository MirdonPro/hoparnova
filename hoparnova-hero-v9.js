import * as THREE from 'https://esm.sh/three@0.180.0';
import { EffectComposer } from 'https://esm.sh/three@0.180.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://esm.sh/three@0.180.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://esm.sh/three@0.180.0/examples/jsm/postprocessing/UnrealBloomPass.js';
import { RoomEnvironment } from 'https://esm.sh/three@0.180.0/examples/jsm/environments/RoomEnvironment.js';

const hero = document.querySelector('.masthead');
if (!hero) throw new Error('HoparNova hero not found');

const coarse = matchMedia('(pointer:coarse)').matches;
const reduced = matchMedia('(prefers-reduced-motion:reduce)').matches;
const host = document.createElement('div');
host.className = 'hero-webgl-v9';
host.setAttribute('aria-hidden', 'true');
host.innerHTML = '<div class="hero-webgl-label">SONIC RELIC · YEREVAN / HN09</div>';
hero.prepend(host);

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: !coarse, alpha: true, powerPreference: 'high-performance' });
} catch (error) {
  host.innerHTML = '<div class="hero-webgl-fallback"></div>';
  throw error;
}

renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
host.prepend(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 40);
camera.position.set(0, 0, 9.3);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.035).texture;
pmrem.dispose();

scene.add(new THREE.HemisphereLight(0xfff2e7, 0x030303, 1.65));
const key = new THREE.DirectionalLight(0xffead7, 4.8);
key.position.set(-3.4, 4.6, 6.2);
scene.add(key);
const redLight = new THREE.PointLight(0xe5412b, 8.5, 13);
redLight.position.set(2.7, -1.1, 4.3);
scene.add(redLight);

const rig = new THREE.Group();
scene.add(rig);

const record = new THREE.Group();
rig.add(record);

const vinylMat = new THREE.MeshPhysicalMaterial({
  color: 0x070707,
  roughness: 0.13,
  metalness: 0.20,
  clearcoat: 1,
  clearcoatRoughness: 0.055,
  envMapIntensity: 1.55
});
const redMat = new THREE.MeshPhysicalMaterial({
  color: 0xe5412b,
  roughness: 0.20,
  metalness: 0.06,
  clearcoat: 1,
  clearcoatRoughness: 0.05,
  emissive: 0x5c1209,
  emissiveIntensity: 0.34
});
const metalMat = new THREE.MeshPhysicalMaterial({
  color: 0xc9c1b8,
  roughness: 0.18,
  metalness: 1,
  clearcoat: 0.55,
  clearcoatRoughness: 0.10,
  envMapIntensity: 1.5
});
const glassMat = new THREE.MeshPhysicalMaterial({
  color: 0xf6efe7,
  roughness: 0.04,
  metalness: 0,
  transmission: 0.92,
  transparent: true,
  opacity: 0.36,
  ior: 1.5,
  thickness: 0.28,
  clearcoat: 1,
  depthWrite: false
});

// Primary physical object: one floating record.
const disc = new THREE.Mesh(new THREE.CylinderGeometry(1.34, 1.34, 0.13, 128), vinylMat);
disc.rotation.x = Math.PI / 2;
record.add(disc);

const label = new THREE.Mesh(new THREE.CylinderGeometry(0.37, 0.37, 0.145, 72), redMat);
label.rotation.x = Math.PI / 2;
label.position.z = 0.018;
record.add(label);

const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.25, 24), metalMat);
hub.rotation.x = Math.PI / 2;
hub.position.z = 0.13;
record.add(hub);

// Vinyl grooves: subtle enough to read as a real record, not decoration.
const grooveMat = new THREE.MeshBasicMaterial({ color: 0x4b4b4b, transparent: true, opacity: 0.30 });
for (let i = 0; i < 10; i++) {
  const groove = new THREE.Mesh(new THREE.TorusGeometry(0.48 + i * 0.075, 0.004, 4, 128), grooveMat);
  groove.position.z = 0.073;
  record.add(groove);
}

// Ararat engraving: a precise line etched into the record surface.
const araratPoints = [
  [-0.90, -0.23], [-0.68, -0.08], [-0.48, 0.12], [-0.28, 0.38], [-0.10, 0.17],
  [0.06, 0.30], [0.22, 0.59], [0.37, 0.29], [0.55, 0.07], [0.74, -0.12], [0.94, -0.23]
].map(([x, y]) => new THREE.Vector3(x, y, 0.082));
const ararat = new THREE.Line(
  new THREE.BufferGeometry().setFromPoints(araratPoints),
  new THREE.LineBasicMaterial({ color: 0xd9d1c7, transparent: true, opacity: 0.72 })
);
ararat.scale.setScalar(0.72);
ararat.position.y = 0.035;
record.add(ararat);

// A single glass waveform orbit. It expands on tap and breathes with scroll.
const waveRing = new THREE.Mesh(new THREE.TorusGeometry(1.70, 0.033, 14, 192), glassMat);
waveRing.rotation.set(1.03, 0.14, 0.20);
rig.add(waveRing);

const pulseRingMat = new THREE.MeshBasicMaterial({
  color: 0xe5412b,
  transparent: true,
  opacity: 0,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});
const pulseRing = new THREE.Mesh(new THREE.TorusGeometry(1.72, 0.022, 10, 192), pulseRingMat);
pulseRing.rotation.copy(waveRing.rotation);
rig.add(pulseRing);

// Minimal tonearm. Its movement gives scroll a physical meaning: "toward play".
const stylus = new THREE.Group();
rig.add(stylus);
const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.044, 1.60, 20), metalMat);
arm.rotation.z = -0.84;
arm.position.set(1.27, 0.91, 0.49);
stylus.add(arm);
const pivot = new THREE.Mesh(new THREE.SphereGeometry(0.105, 24, 18), vinylMat);
pivot.position.set(1.86, 1.51, 0.49);
stylus.add(pivot);
const head = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.10, 0.12), redMat);
head.position.set(0.67, 0.29, 0.48);
head.rotation.z = -0.84;
stylus.add(head);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), coarse ? 0.12 : 0.18, 0.30, 0.90);
composer.addPass(bloom);

const pointerTarget = new THREE.Vector2();
const pointer = new THREE.Vector2();
let visible = true;
let raf = 0;
let last = performance.now();
let scrollTarget = 0;
let scrollSmooth = 0;
let pulse = 0;
let spinBoost = 0;
let tapTilt = 0;

const updateScroll = () => {
  const rect = hero.getBoundingClientRect();
  scrollTarget = THREE.MathUtils.clamp(-rect.top / Math.max(rect.height, 1), 0, 1);
};
addEventListener('scroll', updateScroll, { passive: true });
updateScroll();

addEventListener('pointermove', (event) => {
  if (coarse) return;
  const rect = hero.getBoundingClientRect();
  pointerTarget.set(
    ((event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5) * 2,
    -((event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5) * 2
  );
}, { passive: true });

// Tap anywhere in the visual hero, except interactive controls, to "strike" the sonic relic.
hero.addEventListener('pointerdown', (event) => {
  if (event.target.closest('a,button,input,select,textarea')) return;
  pulse = 1;
  spinBoost = 1;
  tapTilt = event.clientX < innerWidth / 2 ? -1 : 1;
}, { passive: true });

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
  const t = now * 0.001;
  const mobile = innerWidth < 680;

  pointer.lerp(reduced ? new THREE.Vector2() : pointerTarget, 0.06);
  scrollSmooth += (scrollTarget - scrollSmooth) * (reduced ? 1 : 0.075);
  pulse *= reduced ? 0 : Math.pow(0.035, dt);
  spinBoost *= reduced ? 0 : Math.pow(0.065, dt);
  tapTilt *= reduced ? 0 : Math.pow(0.025, dt);

  // The object deliberately stays compact on mobile and never drifts off-screen.
  rig.position.x = mobile ? 0.92 : 2.45 + pointer.x * 0.12;
  rig.position.y = mobile ? 0.04 : 0.01 + pointer.y * 0.07;
  rig.scale.setScalar(mobile ? 0.59 : 0.90);
  rig.rotation.x = -0.16 + pointer.y * 0.07 + scrollSmooth * 0.10;
  rig.rotation.y = -0.30 + pointer.x * 0.09 - scrollSmooth * 0.09 + tapTilt * 0.10;
  rig.rotation.z = -0.055 + tapTilt * 0.025;

  if (!reduced) record.rotation.z += dt * (0.38 + scrollSmooth * 0.34 + spinBoost * 1.9);

  // Scroll choreography: ring wakes up, then stylus approaches play position.
  const ringBreath = reduced ? 0 : Math.sin(t * 1.25) * 0.018;
  const scrollRing = 1 + scrollSmooth * 0.085 + ringBreath;
  waveRing.scale.setScalar(scrollRing);
  waveRing.rotation.z = 0.18 + scrollSmooth * 0.22 + (reduced ? 0 : Math.sin(t * 0.22) * 0.03);
  glassMat.opacity = 0.24 + scrollSmooth * 0.18;

  stylus.rotation.z = -0.08 + scrollSmooth * 0.24 - pulse * 0.06;
  stylus.position.x = -scrollSmooth * 0.10;
  stylus.position.y = pulse * 0.025;

  // Tap response: one visible waveform expansion and a red-core pulse.
  const pulseScale = 1 + (1 - pulse) * 0.50;
  pulseRing.scale.setScalar(pulseScale);
  pulseRingMat.opacity = Math.min(0.75, pulse * 0.72);
  redMat.emissiveIntensity = 0.34 + pulse * 1.25 + (reduced ? 0 : Math.sin(t * 1.2) * 0.035);
  redLight.intensity = 8.5 + pulse * 8;
  bloom.strength = (coarse ? 0.12 : 0.18) + pulse * 0.14;

  composer.render();
  raf = requestAnimationFrame(loop);
}

function resize() {
  const width = hero.clientWidth;
  const height = hero.clientHeight;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, coarse ? 1.12 : 1.5));
  renderer.setSize(width, height, false);
  camera.aspect = width / Math.max(height, 1);
  camera.updateProjectionMatrix();
  composer.setSize(width, height);
}

new ResizeObserver(resize).observe(hero);
resize();
raf = requestAnimationFrame(loop);
