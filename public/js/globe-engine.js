import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ── Configuration ──
const GLOBE_RADIUS = 5;
const ARC_ALTITUDE = 1.8;
const STAR_COUNT = 4000;

const ATTACK_TYPES = {
  ddos: { id: 'ddos', name: 'حجب الخدمة', color: 0xff2244, weight: 0.3, speed: 1.2, alert: true },
  malware: { id: 'malware', name: 'برمجيات خبيثة', color: 0xa855f7, weight: 0.25, speed: 0.8, alert: false },
  phish: { id: 'phish', name: 'تصيد احتيالي', color: 0x00ffcc, weight: 0.25, speed: 1.0, alert: false },
  ransom: { id: 'ransom', name: 'فيروس فدية', color: 0xffcc00, weight: 0.1, speed: 0.9, alert: true },
  exploit: { id: 'exploit', name: 'ثغرات', color: 0x3399ff, weight: 0.1, speed: 1.5, alert: true }
};

const ACTIVE_FILTERS = new Set(Object.keys(ATTACK_TYPES));
let isPlaying = true;
let soundEnabled = false;
let heatmapEnabled = false;

// ── Data ──
const COUNTRIES = [
  { id: 'sa', name: 'السعودية', flag: '🇸🇦', lat: 24.7, lng: 46.7, rank: 12 },
  { id: 'ae', name: 'الامارات', flag: '🇦🇪', lat: 24.8, lng: 55.5, rank: 28 },
  { id: 'eg', name: 'مصر', flag: '🇪🇬', lat: 26.8, lng: 30.8, rank: 45 },
  { id: 'iq', name: 'العراق', flag: '🇮🇶', lat: 33.3, lng: 44.4, rank: 67 },
  { id: 'sy', name: 'سوريا', flag: '🇸🇾', lat: 34.8, lng: 39.0, rank: 89 },
  { id: 'ye', name: 'اليمن', flag: '🇾🇪', lat: 15.3, lng: 44.2, rank: 149 },
  { id: 'om', name: 'عمان', flag: '🇴🇲', lat: 21.0, lng: 57.0, rank: 110 },
  { id: 'sd', name: 'السودان', flag: '🇸🇩', lat: 15.6, lng: 32.5, rank: 120 },
  { id: 'ma', name: 'المغرب', flag: '🇲🇦', lat: 31.8, lng: -7.0, rank: 75 },
  { id: 'dz', name: 'الجزائر', flag: '🇩🇿', lat: 28.0, lng: 1.6, rank: 82 },
  { id: 'us', name: 'الولايات المتحدة', flag: '🇺🇸', lat: 39.8, lng: -98.5, rank: 1 },
  { id: 'cn', name: 'الصين', flag: '🇨🇳', lat: 35.8, lng: 104.1, rank: 2 },
  { id: 'ru', name: 'روسيا', flag: '🇷🇺', lat: 61.5, lng: 105.3, rank: 3 },
  { id: 'br', name: 'البرازيل', flag: '🇧🇷', lat: -14.2, lng: -51.9, rank: 4 },
  { id: 'in', name: 'الهند', flag: '🇮🇳', lat: 20.5, lng: 78.9, rank: 5 },
  { id: 'gb', name: 'بريطانيا', flag: '🇬🇧', lat: 55.3, lng: -3.4, rank: 6 },
  { id: 'de', name: 'ألمانيا', flag: '🇩🇪', lat: 51.1, lng: 10.4, rank: 7 },
  { id: 'jp', name: 'اليابان', flag: '🇯🇵', lat: 36.2, lng: 138.2, rank: 8 },
  { id: 'fr', name: 'فرنسا', flag: '🇫🇷', lat: 46.2, lng: 2.2, rank: 9 },
  { id: 'ir', name: 'إيران', flag: '🇮🇷', lat: 32.4, lng: 53.6, rank: 10 }
];

// Initialize Country Stats
const countryStats = {};
COUNTRIES.forEach(c => {
  countryStats[c.id] = { ddos: 0, malware: 0, phish: 0, ransom: 0, exploit: 0, total: 0 };
});

const globalStats = { ddos: 1054320, malware: 453210, phish: 890120, ransom: 54300, exploit: 120500, total: 2572450 };

let selectedCountry = null;

// ── Utility ──
function latLngToVec3(lat, lng, r = GLOBE_RADIUS) {
  const phi = (90 - lat) * Math.PI / 180;
  const theta = (lng + 180) * Math.PI / 180;
  return new THREE.Vector3(
    -(r * Math.sin(phi) * Math.cos(theta)),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

// ── Audio System (Simple Web Audio API Synth) ──
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playAlertSound(type) {
  if (!soundEnabled || audioCtx.state === 'suspended') return;
  
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  if (type === 'ddos') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
  } else {
    osc.type = 'square';
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.setValueAtTime(800, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
  }
  
  osc.start();
  osc.stop(audioCtx.currentTime + 0.3);
}

// ── Scene Setup ──
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

const target = latLngToVec3(24, 45, GLOBE_RADIUS);
const camPos = latLngToVec3(10, 40, GLOBE_RADIUS * 3.5);
camera.position.copy(camPos);
camera.lookAt(target);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = GLOBE_RADIUS * 1.5;
controls.maxDistance = GLOBE_RADIUS * 6;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;

// ── Lighting ──
scene.add(new THREE.AmbientLight(0x112233, 0.8));
const dirLight = new THREE.DirectionalLight(0x00ffc8, 0.5);
dirLight.position.set(5, 3, 5);
scene.add(dirLight);

// ── Stars ──
function createStars() {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(STAR_COUNT * 3);
  for(let i=0; i<STAR_COUNT*3; i++) pos[i] = (Math.random() - 0.5) * 200;
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1, transparent: true, opacity: 0.6 });
  scene.add(new THREE.Points(geo, mat));
}

// ── Globe Core ──
const globeGroup = new THREE.Group();
scene.add(globeGroup);

// Main Sphere Shader
const globeGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);
const globeMat = new THREE.ShaderMaterial({
  uniforms: { 
    time: { value: 0 },
    heatmapMode: { value: 0.0 }
  },
  vertexShader: `
    varying vec3 vPos; varying vec3 vNormal;
    void main(){ vPos = position; vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
  `,
  fragmentShader: `
    varying vec3 vPos; varying vec3 vNormal;
    uniform float time; uniform float heatmapMode;
    void main(){
      float lat = asin(vPos.y / length(vPos)); float lng = atan(vPos.z, vPos.x);
      float grid = max(smoothstep(0.96,1.0,abs(sin(lat*18.0))), smoothstep(0.96,1.0,abs(sin(lng*18.0))));
      vec3 base = mix(vec3(0.008, 0.015, 0.02), vec3(0.05, 0.0, 0.0), heatmapMode);
      vec3 gridC = mix(vec3(0.02, 0.08, 0.06), vec3(0.2, 0.0, 0.0), heatmapMode);
      vec3 col = mix(base, gridC, grid * 0.4);
      float fresnel = pow(1.0 - max(dot(vNormal, normalize(cameraPosition - vPos)), 0.0), 3.0);
      col += mix(vec3(0.0, 0.15, 0.12), vec3(0.3, 0.0, 0.0), heatmapMode) * fresnel * 0.4;
      gl_FragColor = vec4(col, 1.0);
    }
  `
});
const globeMesh = new THREE.Mesh(globeGeo, globeMat);
globeGroup.add(globeMesh);

// Atmosphere
const atmosMat = new THREE.ShaderMaterial({
  uniforms: { heatmapMode: { value: 0.0 } },
  vertexShader: `varying vec3 vNormal; void main(){ vNormal=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
  fragmentShader: `
    varying vec3 vNormal; uniform float heatmapMode;
    void main(){
      float i = pow(0.65 - dot(vNormal, vec3(0,0,1)), 2.5);
      vec3 col = mix(vec3(0.0, 1.0, 0.7), vec3(1.0, 0.2, 0.0), heatmapMode);
      gl_FragColor = vec4(col, 1.0) * i * 0.5;
    }
  `,
  blending: THREE.AdditiveBlending, side: THREE.BackSide, transparent: true, depthWrite: false
});
globeGroup.add(new THREE.Mesh(new THREE.SphereGeometry(GLOBE_RADIUS * 1.02, 64, 64), atmosMat));

// ── Borders ──
async function loadBorders() {
  try {
    const [topoResp, topoClientResp] = await Promise.all([
      fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'),
      import('https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/+esm')
    ]);
    const topo = await topoResp.json();
    const countries = topoClientResp.feature(topo, topo.objects.countries);
    const borderMat = new THREE.LineBasicMaterial({ color: 0x00ffaa, transparent: true, opacity: 0.3 });
    countries.features.forEach(feature => {
      const coords = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates;
      coords.forEach(poly => {
        poly.forEach(ring => {
          const pts = ring.map(([lng, lat]) => latLngToVec3(lat, lng, GLOBE_RADIUS * 1.001));
          if(pts.length < 2) return;
          globeGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), borderMat));
        });
      });
    });
  } catch (e) { console.warn('Borders load failed', e); }
}

// ── Hitboxes & Markers ──
const hitboxGroup = new THREE.Group();
globeGroup.add(hitboxGroup);
const countryMeshes = [];

function createGlowTexture(color) {
  const c = document.createElement('canvas'); c.width = 64; c.height = 64;
  const ctx = c.getContext('2d');
  const grad = ctx.createRadialGradient(32,32,0, 32,32,32);
  const col = new THREE.Color(color);
  grad.addColorStop(0, \`rgba(\${col.r*255},\${col.g*255},\${col.b*255},1)\`);
  grad.addColorStop(0.4, \`rgba(\${col.r*255},\${col.g*255},\${col.b*255},0.4)\`);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad; ctx.fillRect(0,0,64,64);
  return new THREE.CanvasTexture(c);
}

const defaultHitboxMat = new THREE.MeshBasicMaterial({ visible: false }); // Invisible hitboxes
COUNTRIES.forEach(c => {
  const pos = latLngToVec3(c.lat, c.lng, GLOBE_RADIUS * 1.01);
  
  // Invisible hitbox for raycasting
  const hitbox = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), defaultHitboxMat);
  hitbox.position.copy(pos);
  hitbox.userData = c;
  hitboxGroup.add(hitbox);
  countryMeshes.push(hitbox);

  // Visible Label
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.font = '600 32px Cairo'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = 'rtl';
  ctx.shadowColor = '#000'; ctx.shadowBlur = 4;
  ctx.fillStyle = '#fff'; ctx.fillText(c.name, 128, 32);
  
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true, depthTest: false }));
  sprite.position.copy(latLngToVec3(c.lat, c.lng, GLOBE_RADIUS * 1.05));
  sprite.scale.set(0.8, 0.2, 1);
  globeGroup.add(sprite);
});

// ── Raycaster (Hover/Click) ──
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const tooltip = document.getElementById('tooltip');

window.addEventListener('mousemove', (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(countryMeshes);
  
  if (intersects.length > 0) {
    document.body.style.cursor = 'pointer';
    const c = intersects[0].object.userData;
    tooltip.style.opacity = 1;
    tooltip.style.left = (e.clientX + 15) + 'px';
    tooltip.style.top = (e.clientY + 15) + 'px';
    tooltip.innerHTML = \`\${c.flag} \${c.name}\`;
    controls.autoRotate = false;
  } else {
    document.body.style.cursor = 'default';
    tooltip.style.opacity = 0;
    if(isPlaying) controls.autoRotate = true;
  }
});

window.addEventListener('click', () => {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(countryMeshes);
  if (intersects.length > 0) {
    selectedCountry = intersects[0].object.userData;
    updateDashboard();
  } else {
    // Close dashboard if clicking empty space
    document.getElementById('info-widget').classList.remove('visible');
    selectedCountry = null;
  }
});

// ── Arcs Engine ──
const arcsGroup = new THREE.Group();
globeGroup.add(arcsGroup);
let activeArcs = [];

function spawnAttack() {
  if (!isPlaying || ACTIVE_FILTERS.size === 0) return;

  // Pick random type based on weights
  const rand = Math.random();
  let selectedType = null;
  let cumulative = 0;
  for (const [key, type] of Object.entries(ATTACK_TYPES)) {
    if (!ACTIVE_FILTERS.has(key)) continue;
    cumulative += type.weight;
    if (rand <= cumulative) { selectedType = type; break; }
  }
  if (!selectedType) return;

  // Source and Dest
  const src = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
  let dst = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
  while (src.id === dst.id) dst = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];

  createArc(src, dst, selectedType);
  
  // Update Stats
  countryStats[dst.id][selectedType.id]++;
  countryStats[dst.id].total++;
  globalStats[selectedType.id]++;
  globalStats.total++;
  
  updateGlobalCounters();
  if (selectedCountry && dst.id === selectedCountry.id) updateDashboard();

  if (selectedType.alert) {
    playAlertSound(selectedType.id);
    showToastAlert(dst.name, selectedType.name);
  }
}

function createArc(src, dst, typeData) {
  const p1 = latLngToVec3(src.lat, src.lng, GLOBE_RADIUS * 1.002);
  const p2 = latLngToVec3(dst.lat, dst.lng, GLOBE_RADIUS * 1.002);
  const mid = p1.clone().add(p2).multiplyScalar(0.5).normalize().multiplyScalar(GLOBE_RADIUS + ARC_ALTITUDE);
  
  const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
  const points = curve.getPoints(50);
  
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  const colors = new Float32Array(points.length * 3);
  const col = new THREE.Color(typeData.color);
  for(let i=0; i<points.length; i++) {
    const t = i / points.length;
    colors[i*3] = col.r * t; colors[i*3+1] = col.g * t; colors[i*3+2] = col.b * t;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  
  const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending }));
  arcsGroup.add(line);

  // Moving Head Particle
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), new THREE.MeshBasicMaterial({ color: typeData.color }));
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: createGlowTexture(typeData.color), transparent: true, blending: THREE.AdditiveBlending }));
  glow.scale.set(0.6, 0.6, 1);
  head.add(glow);
  arcsGroup.add(head);

  activeArcs.push({ curve, line, head, progress: 0, speed: typeData.speed * 0.015 });
}

// ── UI Logic ──
function updateDashboard() {
  if (!selectedCountry) return;
  const w = document.getElementById('info-widget');
  document.getElementById('w-flag').innerText = selectedCountry.flag;
  document.getElementById('w-name').innerText = selectedCountry.name;
  document.getElementById('w-rank').innerText = selectedCountry.rank;
  
  const stats = countryStats[selectedCountry.id];
  document.getElementById('w-ddos').innerText = stats.ddos.toLocaleString();
  document.getElementById('w-malware').innerText = stats.malware.toLocaleString();
  document.getElementById('w-phish').innerText = stats.phish.toLocaleString();
  document.getElementById('w-ransom').innerText = stats.ransom.toLocaleString();
  document.getElementById('w-exploit').innerText = stats.exploit.toLocaleString();
  
  const d = new Date();
  document.getElementById('w-time').innerText = d.toLocaleTimeString('ar-SA');
  
  w.classList.add('visible');
}

function updateGlobalCounters() {
  document.getElementById('g-ddos').innerText = globalStats.ddos.toLocaleString();
  document.getElementById('g-malware').innerText = globalStats.malware.toLocaleString();
  document.getElementById('g-phish').innerText = globalStats.phish.toLocaleString();
  document.getElementById('g-ransom').innerText = globalStats.ransom.toLocaleString();
  document.getElementById('g-exploit').innerText = globalStats.exploit.toLocaleString();
  document.getElementById('g-total').innerText = globalStats.total.toLocaleString();
}

function showToastAlert(country, attackName) {
  if (!isPlaying) return;
  const container = document.getElementById('alerts-container');
  const toast = document.createElement('div');
  toast.className = 'alert-toast';
  toast.innerText = \`تحذير: هجوم \${attackName} يستهدف \${country}\`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// Controls
document.getElementById('w-close').onclick = () => {
  document.getElementById('info-widget').classList.remove('visible');
  selectedCountry = null;
};

document.getElementById('btn-zoom-in').onclick = () => { camera.position.multiplyScalar(0.8); };
document.getElementById('btn-zoom-out').onclick = () => { camera.position.multiplyScalar(1.2); };
document.getElementById('btn-reset').onclick = () => { 
  controls.reset();
  camera.position.copy(camPos);
  camera.lookAt(target);
};

document.getElementById('btn-play-pause').onclick = (e) => {
  isPlaying = !isPlaying;
  e.target.classList.toggle('active');
  e.target.innerText = isPlaying ? '⏸' : '▶';
  controls.autoRotate = isPlaying;
};

document.getElementById('btn-sound').onclick = (e) => {
  soundEnabled = !soundEnabled;
  if(soundEnabled && audioCtx.state === 'suspended') audioCtx.resume();
  e.target.classList.toggle('active');
  e.target.innerText = soundEnabled ? '🔊' : '🔇';
};

document.getElementById('btn-heatmap').onclick = (e) => {
  heatmapEnabled = !heatmapEnabled;
  e.target.classList.toggle('active');
  // Transition handled in render loop
};

// Filters
document.querySelectorAll('.filter-item').forEach(item => {
  item.onclick = () => {
    const type = item.getAttribute('data-type');
    if (ACTIVE_FILTERS.has(type)) {
      ACTIVE_FILTERS.delete(type);
      item.classList.remove('active');
    } else {
      ACTIVE_FILTERS.add(type);
      item.classList.add('active');
    }
  };
});

// ── Boot ──
createStars();
loadBorders();
updateGlobalCounters();

setInterval(spawnAttack, 400); // Spawn attacks continuously

// ── Animation Loop ──
let currentHeatmapVal = 0;

function animate() {
  requestAnimationFrame(animate);
  
  // Heatmap transition
  const targetHeatmap = heatmapEnabled ? 1.0 : 0.0;
  currentHeatmapVal += (targetHeatmap - currentHeatmapVal) * 0.05;
  globeMat.uniforms.heatmapMode.value = currentHeatmapVal;
  atmosMat.uniforms.heatmapMode.value = currentHeatmapVal;

  // Animate Arcs
  for (let i = activeArcs.length - 1; i >= 0; i--) {
    const a = activeArcs[i];
    if (isPlaying) a.progress += a.speed;
    
    if (a.progress >= 1) {
      arcsGroup.remove(a.line);
      arcsGroup.remove(a.head);
      a.line.geometry.dispose();
      a.line.material.dispose();
      a.head.geometry.dispose();
      a.head.material.dispose();
      activeArcs.splice(i, 1);
    } else {
      a.head.position.copy(a.curve.getPoint(a.progress));
      // Fade out trailing end
      a.line.material.opacity = 1 - Math.pow(a.progress, 3);
    }
  }

  controls.update();
  renderer.render(scene, camera);
}

// Window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Hide loader
setTimeout(() => { document.getElementById('loader').classList.add('hidden'); }, 1500);

animate();
