import * as THREE from 'https://esm.sh/three@0.180.0';
import { EffectComposer } from 'https://esm.sh/three@0.180.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://esm.sh/three@0.180.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://esm.sh/three@0.180.0/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SMAAPass } from 'https://esm.sh/three@0.180.0/examples/jsm/postprocessing/SMAAPass.js';
import { OutputPass } from 'https://esm.sh/three@0.180.0/examples/jsm/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'https://esm.sh/three@0.180.0/examples/jsm/environments/RoomEnvironment.js';

const hero = document.querySelector('.masthead');
if (!hero) throw new Error('HoparNova hero not found');

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(pointer: coarse)').matches;
const host = document.createElement('div');
host.className = 'resonance-form-v11';
host.setAttribute('aria-hidden', 'true');
host.innerHTML = '<div class="resonance-signature">RESONANCE FORM / HN11</div>';
hero.prepend(host);

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance', stencil: false });
} catch (error) {
  host.innerHTML = '<div class="resonance-fallback"></div>';
  throw error;
}
renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.07;
renderer.shadowMap.enabled = !coarse;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
host.prepend(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 40);
camera.position.set(0, 0.05, 8.8);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.045).texture;
pmrem.dispose();

scene.add(new THREE.HemisphereLight(0xf8efe4, 0x020202, 0.72));
const softLeft = new THREE.RectAreaLight(0xfff3e9, 9.5, 4.8, 5.8);
softLeft.position.set(-4.8, 2.8, 4.6);
softLeft.lookAt(0, 0, 0);
scene.add(softLeft);
const coolEdge = new THREE.RectAreaLight(0xc9d9ee, 7.5, 2.4, 5.2);
coolEdge.position.set(4.2, 2.0, 2.0);
coolEdge.lookAt(0, 0, 0);
scene.add(coolEdge);
const redEdge = new THREE.RectAreaLight(0xff3b22, 7.0, 1.4, 3.2);
redEdge.position.set(2.8, -1.8, 2.6);
redEdge.lookAt(0, 0, 0);
scene.add(redEdge);

const rig = new THREE.Group();
scene.add(rig);

function createShellGeometry(side = 1) {
  const ny = coarse ? 64 : 96;
  const nz = coarse ? 30 : 44;
  const positions = [];
  const uvs = [];
  const indices = [];

  for (let iy = 0; iy <= ny; iy++) {
    const fy = iy / ny;
    const y = THREE.MathUtils.lerp(-1.48, 1.48, fy);
    const yn = y / 1.48;
    const silhouette = Math.pow(Math.max(0, 1 - yn * yn), 0.42);
    for (let iz = 0; iz <= nz; iz++) {
      const fz = iz / nz;
      const zN = fz * 2 - 1;
      const depth = 0.58 * Math.sin(zN * Math.PI * 0.5) * (0.92 + 0.08 * silhouette);
      const crown = Math.pow(1 - Math.abs(zN), 0.72);
      const seam = 0.065 + 0.035 * (1 - silhouette);
      const width = silhouette * (0.92 + 0.22 * crown);
      const asymmetry = 0.06 * Math.sin((fy - 0.5) * Math.PI * 1.7) * crown;
      const x = side * (seam + width + asymmetry * side);
      const z = depth + 0.05 * Math.cos(fy * Math.PI * 2.0) * crown;
      positions.push(x, y, z);
      uvs.push(fy, fz);
    }
  }

  for (let iy = 0; iy < ny; iy++) {
    for (let iz = 0; iz < nz; iz++) {
      const a = iy * (nz + 1) + iz;
      const b = a + nz + 1;
      const c = b + 1;
      const d = a + 1;
      if (side > 0) indices.push(a, b, d, b, c, d);
      else indices.push(a, d, b, b, d, c);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function createMicroTexture(size = 768) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = 116 + Math.random() * 24;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = n;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 7);
  tex.colorSpace = THREE.NoColorSpace;
  tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  return tex;
}

const micro = createMicroTexture(coarse ? 512 : 768);
const titanium = new THREE.MeshPhysicalMaterial({
  color: 0x101114,
  metalness: 0.94,
  roughness: 0.17,
  anisotropy: 0.62,
  anisotropyRotation: Math.PI * 0.5,
  clearcoat: 0.34,
  clearcoatRoughness: 0.10,
  bumpMap: micro,
  bumpScale: 0.012,
  envMapIntensity: 1.8,
  side: THREE.DoubleSide
});

const leftShell = new THREE.Mesh(createShellGeometry(-1), titanium);
const rightShell = new THREE.Mesh(createShellGeometry(1), titanium.clone());
rig.add(leftShell, rightShell);

// Thin inner membrane: this is the only luminous element.
const membraneGeo = new THREE.PlaneGeometry(0.42, 2.42, 48, 160);
const membraneUniforms = {
  uTime: { value: 0 },
  uPulse: { value: -10 },
  uEnergy: { value: 0.18 },
  uOpen: { value: 0 }
};
const membraneMat = new THREE.ShaderMaterial({
  uniforms: membraneUniforms,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  vertexShader: `
    uniform float uTime;
    uniform float uPulse;
    uniform float uEnergy;
    uniform float uOpen;
    varying vec2 vUv;
    varying float vWave;
    void main(){
      vUv = uv;
      vec3 p = position;
      float d = abs(uv.y - uPulse);
      float impulse = exp(-d * 24.0) * sin(d * 62.0 - uTime * 7.0);
      float breathing = sin(uv.y * 12.0 + uTime * 1.15) * 0.012 * uEnergy;
      p.z += impulse * 0.085 * uEnergy + breathing;
      p.x *= 0.72 + uOpen * 0.34;
      vWave = impulse;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    varying float vWave;
    uniform float uEnergy;
    uniform float uOpen;
    void main(){
      float edge = smoothstep(0.0,0.22,vUv.x) * smoothstep(0.0,0.22,1.0-vUv.x);
      float vertical = smoothstep(0.0,0.08,vUv.y) * smoothstep(0.0,0.08,1.0-vUv.y);
      float glow = 0.38 + abs(vWave) * 1.7 + uEnergy * 0.30;
      vec3 color = mix(vec3(0.34,0.018,0.008), vec3(1.0,0.12,0.045), glow);
      float alpha = edge * vertical * (0.30 + uOpen * 0.34 + abs(vWave) * 0.38);
      gl_FragColor = vec4(color, alpha);
    }
  `
});
const membrane = new THREE.Mesh(membraneGeo, membraneMat);
membrane.position.z = -0.10;
rig.add(membrane);

// A narrow internal reflector makes the slit feel physically deep without adding visual clutter.
const innerGlass = new THREE.Mesh(
  new THREE.PlaneGeometry(0.52, 2.56, 1, 1),
  new THREE.MeshPhysicalMaterial({
    color: 0x240604,
    roughness: 0.10,
    metalness: 0.0,
    transmission: 0.62,
    thickness: 0.35,
    ior: 1.46,
    transparent: true,
    opacity: 0.35,
    envMapIntensity: 1.2,
    depthWrite: false
  })
);
innerGlass.position.z = -0.17;
rig.add(innerGlass);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.22 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -1.88;
floor.receiveShadow = true;
scene.add(floor);
leftShell.castShadow = rightShell.castShadow = !coarse;

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), coarse ? 0.16 : 0.22, 0.42, 0.90);
composer.addPass(bloom);
const smaa = new SMAAPass(1, 1);
composer.addPass(smaa);
composer.addPass(new OutputPass());

const state = {
  pointerTarget: new THREE.Vector2(),
  pointer: new THREE.Vector2(),
  scrollTarget: 0,
  scroll: 0,
  tap: 0,
  pulseY: -10,
  open: 0,
  quality: Math.min(devicePixelRatio || 1, coarse ? 1.65 : 2.0),
  fpsAvg: 60
};

addEventListener('pointermove', (event) => {
  if (coarse) return;
  const r = hero.getBoundingClientRect();
  state.pointerTarget.set(
    ((event.clientX - r.left) / Math.max(r.width, 1) - 0.5) * 2,
    -((event.clientY - r.top) / Math.max(r.height, 1) - 0.5) * 2
  );
}, { passive: true });

function updateScroll() {
  const r = hero.getBoundingClientRect();
  state.scrollTarget = THREE.MathUtils.clamp((-r.top) / Math.max(r.height * 0.72, 1), 0, 1);
}
addEventListener('scroll', updateScroll, { passive: true });
updateScroll();

hero.addEventListener('pointerdown', (event) => {
  if (event.target.closest('a,button,input,select,textarea')) return;
  state.tap = 1;
  const r = hero.getBoundingClientRect();
  state.pulseY = THREE.MathUtils.clamp(1 - ((event.clientY - r.top) / Math.max(r.height, 1)), 0.08, 0.92);
}, { passive: true });

let visible = true;
let raf = 0;
let last = performance.now();
let fpsTimer = 0;
let fpsFrames = 0;

new IntersectionObserver(([entry]) => {
  visible = entry.isIntersecting;
  if (visible && !raf) {
    last = performance.now();
    raf = requestAnimationFrame(loop);
  }
}, { threshold: 0.02 }).observe(hero);

document.addEventListener('visibilitychange', () => {
  if (!document.hidden && visible && !raf) {
    last = performance.now();
    raf = requestAnimationFrame(loop);
  }
});

function loop(now) {
  raf = 0;
  if (!visible || document.hidden) return;

  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  fpsFrames++;
  fpsTimer += dt;

  state.pointer.lerp(reduced ? new THREE.Vector2() : state.pointerTarget, 0.055);
  state.scroll += (state.scrollTarget - state.scroll) * (reduced ? 1 : 0.065);
  state.tap *= reduced ? 0 : Math.pow(0.018, dt);

  // Apple-style choreography: the main transformation happens early, then resolves.
  const reveal = THREE.MathUtils.smoothstep(Math.min(state.scroll / 0.62, 1), 0, 1);
  state.open += (reveal - state.open) * (reduced ? 1 : 0.075);

  const mobile = innerWidth < 680;
  rig.scale.setScalar(mobile ? 0.62 : 0.98);
  rig.position.set(
    mobile ? 1.03 : 2.45 + state.pointer.x * 0.08,
    mobile ? 0.02 : -0.02 + state.pointer.y * 0.055,
    0
  );
  rig.rotation.x = -0.05 + state.pointer.y * 0.035 - state.open * 0.025;
  rig.rotation.y = -0.16 + state.pointer.x * 0.055 + state.open * 0.13;
  rig.rotation.z = -0.035;

  const opening = state.open * (mobile ? 0.16 : 0.24) + state.tap * 0.035;
  leftShell.position.x = -opening;
  rightShell.position.x = opening;
  leftShell.rotation.y = -state.open * 0.09 - state.tap * 0.018;
  rightShell.rotation.y = state.open * 0.09 + state.tap * 0.018;

  membraneUniforms.uTime.value = now * 0.001;
  membraneUniforms.uPulse.value = state.pulseY;
  membraneUniforms.uEnergy.value = 0.16 + state.open * 0.52 + state.tap * 1.35;
  membraneUniforms.uOpen.value = state.open;
  membraneMat.opacity = 0.64 + state.open * 0.30;
  redEdge.intensity = 4.5 + state.open * 4.0 + state.tap * 7.0;
  bloom.strength = (coarse ? 0.16 : 0.22) + state.tap * 0.12;

  // The tap wave travels vertically through the form, then disappears cleanly.
  if (state.tap > 0.025) state.pulseY -= dt * 0.34;
  else state.pulseY = -10;

  // Tiny idle drift, never enough to compete with the typography.
  if (!reduced) {
    rig.position.y += Math.sin(now * 0.00042) * 0.018;
    rig.rotation.x += Math.sin(now * 0.00031) * 0.006;
  }

  composer.render();

  if (fpsTimer > 1.25) {
    const fps = fpsFrames / fpsTimer;
    state.fpsAvg = state.fpsAvg * 0.65 + fps * 0.35;
    const max = Math.min(devicePixelRatio || 1, coarse ? 1.65 : 2.0);
    let next = state.quality;
    if (state.fpsAvg < 46) next = Math.max(1.20, next - 0.15);
    else if (state.fpsAvg > 57 && next < max) next = Math.min(max, next + 0.10);
    if (Math.abs(next - state.quality) > 0.04) {
      state.quality = next;
      resize();
    }
    fpsTimer = 0;
    fpsFrames = 0;
  }

  raf = requestAnimationFrame(loop);
}

function resize() {
  const cssW = Math.max(hero.clientWidth, 1);
  const cssH = Math.max(hero.clientHeight, 1);
  const dpr = state.quality;
  const renderW = Math.max(1, Math.floor(cssW * dpr));
  const renderH = Math.max(1, Math.floor(cssH * dpr));
  renderer.setPixelRatio(1);
  renderer.setSize(renderW, renderH, false);
  camera.aspect = cssW / cssH;
  camera.updateProjectionMatrix();
  composer.setSize(renderW, renderH);
  smaa.setSize(renderW, renderH);
}

new ResizeObserver(resize).observe(hero);
resize();
raf = requestAnimationFrame(loop);
