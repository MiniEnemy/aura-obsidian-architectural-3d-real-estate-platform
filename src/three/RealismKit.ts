import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js'; // needs three r162+. Remove AO lines on older.
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { MaterialsLibrary } from './MaterialsLibrary';

/* ------------------------------------------------------------------ */
/* 1. QUALITY + RENDERER                                               */
/* ------------------------------------------------------------------ */
export type Quality = 'high' | 'medium' | 'low';

export function detectQuality(renderer?: THREE.WebGLRenderer): Quality {
  const mobile = /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);
  if (mobile) return 'low';
  let gpu = '';
  try {
    const gl = renderer?.getContext();
    const ext = gl?.getExtension('WEBGL_debug_renderer_info');
    if (gl && ext) gpu = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL));
  } catch { /* ignore */ }
  if (/swiftshader|llvmpipe|software|basic render/i.test(gpu)) return 'low';
  if (/RTX|GTX 1[0-9]|GeForce|Radeon RX|Radeon Pro|Apple M[0-9]|Apple GPU|Arc/i.test(gpu)) return 'high';
  return 'medium';
}
const Q = {
  high:   { shadow: 4096, pixelRatio: 2,    ao: true,  aoSamples: 16 },
  medium: { shadow: 2048, pixelRatio: 1.5,  ao: false, aoSamples: 8 },
  low:    { shadow: 1024, pixelRatio: 1.25, ao: false, aoSamples: 0 }
} as const;

export function configureRenderer(renderer: THREE.WebGLRenderer, quality: Quality = detectQuality(renderer)) {
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, Q[quality].pixelRatio));
  return quality;
}

/* ------------------------------------------------------------------ */
/* 2. SKY + SUN + IBL, with time-of-day presets                        */
/* ------------------------------------------------------------------ */
export type TimeOfDay = 'day' | 'golden' | 'dusk';

interface Preset {
  elevation: number; azimuth: number; sunColor: number; sunIntensity: number; exposure: number;
  env: number; hemi: number; fog: number; fogDensity: number; glow: number; interior: number;
  zenith: number; horizon: number; skyGlow: number; ground: number; haze: number;
}
const PRESETS: Record<TimeOfDay, Preset> = {
  day:    { elevation: 38, azimuth: 40, sunColor: 0xfff3e2, sunIntensity: 3.4, exposure: 0.9, env: 0.85, hemi: 0.12, fog: 0xbfd0e0, fogDensity: 0.0026, glow: 0.22, interior: 0.12,  zenith: 0x3b74c4, horizon: 0xc9dcee, skyGlow: 0xfff1d8, ground: 0xc9bca6, haze: 0.5 },
  golden: { elevation: 9,  azimuth: 58, sunColor: 0xffc48a, sunIntensity: 4.2, exposure: 0.9,  env: 0.5,  hemi: 0.22, fog: 0xe3cdb4, fogDensity: 0.0058, glow: 0.55, interior: 0.35, zenith: 0x41669f, horizon: 0xf0c9a0, skyGlow: 0xffb066, ground: 0x9a8264, haze: 0.7 },
  dusk:   { elevation: 2.5, azimuth: 70, sunColor: 0xff9a5c, sunIntensity: 0.9, exposure: 1.3, env: 0.45,  hemi: 0.2, fog: 0x6b7490, fogDensity: 0.006, glow: 1.15, interior: 1,   zenith: 0x16254f, horizon: 0x8b86a8, skyGlow: 0xff8a52, ground: 0x3d3852, haze: 0.8 }
};

export interface SkyController {
  sun: THREE.DirectionalLight;
  hemi: THREE.HemisphereLight;
  /** Switch time of day. Pass the scene's interior lights so they come on at dusk. */
  setPreset: (name: TimeOfDay, interiorLights?: THREE.Light[]) => void;
}

export function setupSkyAndSun(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  opts: { preset?: TimeOfDay; quality?: Quality } = {}
): SkyController {
  const quality = opts.quality ?? detectQuality();
  // Analytic sky dome (own shader: Sky.js left a hard seam between cube faces at low sun).
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    uniforms: {
      sunDir: { value: new THREE.Vector3(0, 1, 0) }, zenith: { value: new THREE.Color() }, horizon: { value: new THREE.Color() },
      glow: { value: new THREE.Color() }, ground: { value: new THREE.Color() }, haze: { value: 0.5 }
    },
    vertexShader: 'varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader: `varying vec3 vDir; uniform vec3 sunDir, zenith, horizon, glow, ground; uniform float haze;
      void main(){
        vec3 d = normalize(vDir);
        float t = clamp(d.y, 0.0, 1.0);
        vec3 c = mix(horizon, zenith, pow(t, 0.45));
        float s = max(dot(d, sunDir), 0.0);
        float low = pow(1.0 - t, 2.5);
        c = mix(c, glow, pow(s, 2.5) * low * haze);
        c += glow * (pow(s, 14.0) * 0.22 + pow(s, 900.0) * 6.0);
        if (d.y < 0.0) c = mix(horizon * 0.85, ground, clamp(-d.y * 5.0, 0.0, 1.0));
        gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(40, 48, 24), skyMat);
  const envScene = new THREE.Scene();
  envScene.add(sky);
  // Visible sky: a camera-following dome in the main scene. (The PMREM cube used as scene.background
  // showed a hard face seam, so PMREM is only used for lighting/reflections.)
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), skyMat);
  dome.name = 'sky-dome'; dome.renderOrder = -1000; dome.frustumCulled = false;
  dome.userData.noShadow = true;
  dome.onBeforeRender = (_r, _s, cam) => { dome.position.copy(cam.position); dome.scale.setScalar(Math.min(((cam as THREE.PerspectiveCamera).far || 1000) * 0.9, 4000)); };
  skyMat.depthTest = false;
  scene.add(dome);
  const pmrem = new THREE.PMREMGenerator(renderer);
  let envRT: THREE.WebGLRenderTarget | null = null;

  const sun = new THREE.DirectionalLight(0xffffff, 3);
  sun.castShadow = true;
  sun.shadow.mapSize.set(Q[quality].shadow, Q[quality].shadow);
  const c = sun.shadow.camera;
  c.left = -34; c.right = 34; c.top = 34; c.bottom = -34; c.near = 1; c.far = 200;
  sun.shadow.bias = -0.0002;
  sun.shadow.normalBias = 0.035;
  sun.shadow.radius = 2.5;
  scene.add(sun, sun.target);
  const hemi = new THREE.HemisphereLight(0xdfeaff, 0x8a7358, 0.3);
  scene.add(hemi);
  const bounce = new THREE.AmbientLight(0xffe4c4, 0.3); // warm interior bounce light the sky IBL can't provide
  scene.add(bounce);
  scene.fog = new THREE.FogExp2(0xc6d2de, 0.0042);

  const setPreset = (name: TimeOfDay, interiorLights: THREE.Light[] = []) => {
    const p = PRESETS[name];
    const dir = new THREE.Vector3().setFromSphericalCoords(1, THREE.MathUtils.degToRad(90 - p.elevation), THREE.MathUtils.degToRad(p.azimuth));
    const u = skyMat.uniforms;
    u.sunDir.value.copy(dir);
    u.zenith.value.setHex(p.zenith); u.horizon.value.setHex(p.horizon); u.glow.value.setHex(p.skyGlow); u.ground.value.setHex(p.ground); u.haze.value = p.haze;
    envRT?.dispose();
    envRT = pmrem.fromScene(envScene, 0.02);
    scene.environment = envRT.texture;
    scene.background = null;
    (scene as any).environmentIntensity = p.env;
    (scene as any).backgroundBlurriness = 0;
    (scene as any).backgroundIntensity = name === 'dusk' ? 0.9 : 1;
    sun.color.setHex(p.sunColor);
    sun.intensity = p.sunIntensity;
    sun.position.copy(dir).multiplyScalar(80);
    hemi.intensity = p.hemi;
    bounce.intensity = name === 'day' ? 0.5 : name === 'golden' ? 0.3 : 0.14;
    (scene.fog as THREE.FogExp2).color.setHex(p.fog);
    (scene.fog as THREE.FogExp2).density = p.fogDensity * ((scene.userData.fogScale as number) ?? 1);
    renderer.toneMappingExposure = p.exposure;
    renderer.shadowMap.needsUpdate = true;
    MaterialsLibrary.setGlow(p.glow);
    for (const l of interiorLights) {
      l.userData.base ??= l.intensity;
      l.intensity = l.userData.base * p.interior;
      l.visible = p.interior > 0.01;
    }
  };
  setPreset(opts.preset ?? 'day');
  return { sun, hemi, setPreset };
}

/* ------------------------------------------------------------------ */
/* 3. POST FX: MSAA → GTAO → bloom → tone-map → grade                  */
/* ------------------------------------------------------------------ */
const GradeShader = {
  uniforms: { tDiffuse: { value: null }, vignette: { value: 0.28 }, contrast: { value: 0.22 }, warmth: { value: 0.03 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float vignette, contrast, warmth; varying vec2 vUv;
    void main(){
      vec4 c = texture2D(tDiffuse, vUv); vec3 col = c.rgb;
      col = mix(col, col*col*(3.0-2.0*col), contrast);
      col *= vec3(1.0+warmth, 1.0, 1.0-warmth);
      vec2 d = (vUv-0.5)*vec2(1.0,0.85);
      col *= 1.0 - smoothstep(0.32, 0.95, length(d))*vignette;
      gl_FragColor = vec4(col, c.a);
    }`
};

export function createPostFX(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  width: number,
  height: number,
  opts: { quality?: Quality; ao?: boolean; bloom?: boolean; grade?: boolean; adaptive?: boolean; maxPixelRatio?: number } = {}
) {
  const quality = opts.quality ?? detectQuality(renderer);
  const { bloom = true, grade = true, adaptive = true } = opts;
  const wantAO = opts.ao ?? true;
  // far plane must reach the skyline/hills; also keeps the sky dome inside the frustum
  if ((camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
    const pc = camera as THREE.PerspectiveCamera;
    if (pc.far < 4500) { pc.far = 4500; pc.updateProjectionMatrix(); }
  }
  // Static scene: shadow maps are refreshed at ~6 Hz instead of every frame.
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;

  // Adaptive scaling never exceeds the caller's cap (the viewer caps resolution per quality tier
  // and per hosted-GLB load); without this it would silently reset to Q's higher ceiling.
  const maxPR = Math.min(opts.maxPixelRatio ?? Infinity, Q[quality].pixelRatio);
  let pr = Math.min(window.devicePixelRatio, maxPR);
  let cssW = width, cssH = height;
  const target = new THREE.WebGLRenderTarget(cssW * pr, cssH * pr, { type: THREE.HalfFloatType, samples: quality === 'high' ? 4 : 2 });
  const composer = new EffectComposer(renderer, target);
  composer.addPass(new RenderPass(scene, camera));

  let gtao: GTAOPass | undefined;
  if (wantAO && quality !== 'low') {
    gtao = new GTAOPass(scene, camera, cssW * pr, cssH * pr);
    gtao.updateGtaoMaterial({ radius: 0.7, distanceExponent: 1.4, thickness: 1.6, scale: 1.15, samples: Q[quality].aoSamples });
    gtao.enabled = Q[quality].ao; // medium/low start without AO; it is switched on if the GPU has headroom
    composer.addPass(gtao);
  }
  if (bloom) composer.addPass(new UnrealBloomPass(new THREE.Vector2(cssW, cssH), 0.32, 0.55, 1.0));
  composer.addPass(new OutputPass());
  if (grade) composer.addPass(new ShaderPass(GradeShader));

  const applyRes = () => {
    renderer.setPixelRatio(pr);
    composer.setPixelRatio(pr);
    composer.setSize(cssW, cssH);
  };
  applyRes();

  // ---- adaptive quality: watches real frame time, trades resolution/AO for smoothness ----
  let last = performance.now(), ema = 16, frame = 0, cooldown = 0, dirty = false;
  const step = () => {
    if (!adaptive) return;
    if (frame < 45 || --cooldown > 0) return;
    if (ema > 27) {                                   // < ~37 fps: shed load
      if (gtao?.enabled) { gtao.enabled = false; }
      else if (pr > 0.7) { pr = Math.max(0.7, pr - 0.25); applyRes(); }
      cooldown = 40; ema = 20;
    } else if (ema < 11) {                            // lots of headroom: add quality back
      if (gtao && !gtao.enabled && quality !== 'low') { gtao.enabled = true; cooldown = 90; ema = 16; }
      else if (pr < Math.min(window.devicePixelRatio, maxPR)) { pr = Math.min(Math.min(window.devicePixelRatio, maxPR), pr + 0.25); applyRes(); cooldown = 90; ema = 16; }
    }
  };

  return {
    composer,
    /** Call once per animation frame instead of renderer.render(). */
    render: () => {
      const now = performance.now();
      const dt = now - last; last = now;
      if (dt < 250) ema = ema * 0.92 + dt * 0.08;
      frame++;
      if (dirty || frame % 10 === 0) { renderer.shadowMap.needsUpdate = true; dirty = false; }
      step();
      composer.render();
    },
    setSize: (w: number, h: number) => { cssW = w; cssH = h; applyRes(); },
    /**
     * Compile every shader program off the main thread (KHR_parallel_shader_compile) and wait for the
     * procedural textures. `await fx.warmup()` once after buildProperty(), before the first frame, to avoid
     * a multi-second first-frame stall.
     */
    warmup: async () => {
      await MaterialsLibrary.whenReady();
      const rr = renderer as THREE.WebGLRenderer & { compileAsync?: (s: THREE.Object3D, c: THREE.Camera) => Promise<void> };
      if (rr.compileAsync) await rr.compileAsync(scene, camera); else renderer.compile(scene, camera);
    },
    /** Call after moving a light/mesh that should re-cast shadows immediately. */
    invalidateShadows: () => { dirty = true; },
    get pixelRatio() { return pr; },
    get aoEnabled() { return !!gtao?.enabled; }
  };
}

/* ------------------------------------------------------------------ */
/* 4. SCENE FINALIZER — run once after building a property             */
/*    - correct shadows on every mesh                                  */
/*    - bevelled edges on furniture (real objects never have 90° edges)*/
/*    - world-scale UVs so wood/stone/fabric keep real-world size      */
/* ------------------------------------------------------------------ */
function boxProjectUVs(geo: THREE.BufferGeometry) {
  if (geo.userData.worldUV) return;
  const pos = geo.attributes.position;
  const nor = geo.attributes.normal;
  if (!nor) return;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    const ax = Math.abs(nor.getX(i)), ay = Math.abs(nor.getY(i)), az = Math.abs(nor.getZ(i));
    if (ax >= ay && ax >= az) { uv[i * 2] = pos.getZ(i); uv[i * 2 + 1] = pos.getY(i); }
    else if (ay >= az) { uv[i * 2] = pos.getX(i); uv[i * 2 + 1] = pos.getZ(i); }
    else { uv[i * 2] = pos.getX(i); uv[i * 2 + 1] = pos.getY(i); }
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  geo.userData.worldUV = true;
}

export function finalizeScene(root: THREE.Object3D, furnitureGroup?: THREE.Object3D) {
  const furniture = new Set<THREE.Object3D>();
  furnitureGroup?.traverse((o) => furniture.add(o));

  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mats = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) as THREE.Material[];
    const mat = mats[0];

    const ghost = mats.every((m) => m.transparent) || ((mat as any).emissiveIntensity ?? 0) > 1 || mesh.userData.noShadow;
    if ((mesh as any).isInstancedMesh) {
      mesh.receiveShadow = true; // keep the builder's castShadow choice (skylines stay flat)
      return;
    }
    mesh.castShadow = !ghost && mesh.castShadow !== false;
    mesh.receiveShadow = !mat.transparent;

    if (furniture.has(mesh) && mesh.geometry.type === 'BoxGeometry' && !(mesh.geometry instanceof RoundedBoxGeometry)) {
      const p = (mesh.geometry as THREE.BoxGeometry).parameters;
      const r = THREE.MathUtils.clamp(Math.min(p.width, p.height, p.depth) * 0.3, 0.004, 0.035);
      mesh.geometry.dispose();
      mesh.geometry = new RoundedBoxGeometry(p.width, p.height, p.depth, 3, r);
    }
    if (mats.some((m) => m.userData.worldUV)) boxProjectUVs(mesh.geometry);
  });
}

/* ------------------------------------------------------------------ */
/* 4b. STATIC MERGE — ~900 meshes -> a few dozen draw calls            */
/* ------------------------------------------------------------------ */
/**
 * Bakes every static mesh that shares a material into one mesh. Skipped (stay separate):
 * interactive objects (userData.id), anything inside `keep` (door/slider pivots), lamp glow clones,
 * instanced meshes, invisible pick proxies, material arrays. Furniture stays inside furnitureGroup
 * so "hide furniture" toggles keep working.
 */
export function mergeStaticMeshes(root: THREE.Object3D, furniture: THREE.Object3D | undefined, keep: Set<THREE.Object3D>) {
  root.updateMatrixWorld(true);
  const inside = (o: THREE.Object3D, set: Set<THREE.Object3D> | THREE.Object3D | undefined) => {
    if (!set) return false;
    for (let p: THREE.Object3D | null = o; p; p = p.parent) if (set instanceof Set ? set.has(p) : p === set) return true;
    return false;
  };
  const buckets = new Map<string, { mat: THREE.Material; cast: boolean; recv: boolean; furn: boolean; geos: THREE.BufferGeometry[]; meshes: THREE.Mesh[] }>();
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh || (m as any).isInstancedMesh || Array.isArray(m.material) || m.children.length || !m.visible) return;
    if (m.userData.id || m.userData.noMerge || m.material.userData.baseEmissive !== undefined || inside(m, keep)) return;
    const geo = m.geometry;
    const furn = inside(m, furniture);
    const key = `${m.material.uuid}|${Object.keys(geo.attributes).sort().join(',')}${geo.index ? 'i' : 'n'}|${m.castShadow}|${m.receiveShadow}|${furn}`;
    let b = buckets.get(key);
    if (!b) buckets.set(key, (b = { mat: m.material, cast: m.castShadow, recv: m.receiveShadow, furn, geos: [], meshes: [] }));
    b.geos.push(geo.clone().applyMatrix4(m.matrixWorld));
    b.meshes.push(m);
  });
  let merged = 0;
  for (const b of buckets.values()) {
    if (b.geos.length < 2) { b.geos.forEach((g) => g.dispose()); continue; }
    const g = mergeGeometries(b.geos, false);
    b.geos.forEach((x) => x.dispose());
    if (!g) continue;
    const mesh = new THREE.Mesh(g, b.mat);
    mesh.castShadow = b.cast; mesh.receiveShadow = b.recv; mesh.name = `merged:${b.mat.name || b.mat.type}`;
    mesh.userData.noShadow = !b.cast;
    (b.furn && furniture ? furniture : root).add(mesh);
    for (const m of b.meshes) { m.parent?.remove(m); m.geometry.dispose(); }
    merged += b.meshes.length;
  }
  return merged;
}

/* ------------------------------------------------------------------ */
/* 5. REAL POOL (open-top basin, tiled walls, coping, water surface)   */
/*    The old pool was a solid box with the water INSIDE it, so you    */
/*    never saw the water. Villa had the same z-fight with its rim.    */
/* ------------------------------------------------------------------ */
export function buildPool(
  root: THREE.Object3D,
  o: {
    x: number; z: number; width: number; depth: number; // inner water dimensions
    pitDepth?: number; coping?: number; copingMat?: THREE.Material; infinityNorth?: boolean; topY?: number;
  }
) {
  const { x, z, width, depth, pitDepth = 1.5, coping = 0.5, infinityNorth = false } = o;
  const tiles = MaterialsLibrary.get('pool-tiles');
  const copingMat = o.copingMat ?? MaterialsLibrary.get('travertine');
  const water = MaterialsLibrary.get('water-pool');
  const g = new THREE.Group();
  g.name = 'pool';
  const T = 0.3;
  const top = o.topY ?? 0.02;
  const waterY = top - 0.1;
  const box = (w: number, h: number, d: number, px: number, py: number, pz: number, m: THREE.Material) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.position.set(px, py, pz);
    g.add(mesh);
    return mesh;
  };

  box(width + 2 * T, 0.2, depth + 2 * T, x, -pitDepth - 0.1, z, tiles); // floor
  const wallH = pitDepth + top;
  const wallY = (top - pitDepth) / 2;
  const halfD = depth / 2 + T / 2;
  const halfW = width / 2 + T / 2;
  box(width + 2 * T, wallH, T, x, wallY, z + halfD, tiles); // south wall
  box(T, wallH, depth, x - halfW, wallY, z, tiles);         // west wall
  box(T, wallH, depth, x + halfW, wallY, z, tiles);         // east wall
  if (infinityNorth) {
    const lipH = pitDepth + waterY - 0.03;
    box(width + 2 * T, lipH, T, x, (waterY - 0.03 - pitDepth) / 2, z - halfD, tiles);
  } else {
    box(width + 2 * T, wallH, T, x, wallY, z - halfD, tiles);
  }

  // coping frame
  const cy = top - 0.04;
  const outerW = width + 2 * T + 2 * coping;
  const cz = z + halfD + coping / 2;
  box(outerW, 0.08, coping, x, cy, cz, copingMat);
  box(coping, 0.08, depth, x - halfW - coping / 2, cy, z, copingMat);
  box(coping, 0.08, depth, x + halfW + coping / 2, cy, z, copingMat);
  if (!infinityNorth) box(outerW, 0.08, coping, x, cy, z - halfD - coping / 2, copingMat);

  // water surface
  const wDepth = infinityNorth ? depth + T : depth;
  const surf = new THREE.Mesh(new THREE.PlaneGeometry(width, wDepth), water);
  surf.rotation.x = -Math.PI / 2;
  surf.position.set(x, waterY, z - (infinityNorth ? T / 2 : 0));
  surf.name = 'pool-water';
  g.add(surf);

  root.add(g);
  return {
    group: g,
    /** footprint to cut out of any ground plane */
    hole: { x, z, w: outerW, d: depth + 2 * T + 2 * coping }
  };
}

/* ------------------------------------------------------------------ */
/* 6. SITE — the Obsidian scene had NO ground (house floated in sky).  */
/* ------------------------------------------------------------------ */
export function addGround(
  root: THREE.Object3D,
  holes: { x: number; z: number; w: number; d: number }[] = [],
  y = -0.04,
  size = 260,
  materialKey = 'lawn'
) {
  // Built from strips around the (single) hole so we can use a fine grid with vertex-colour
  // variation: no visible texture tiling, and the pool opening stays exact.
  const h = holes[0];
  const S = size / 2;
  const rects: Array<[number, number, number, number]> = h
    ? [[-S, S, h.z + h.d / 2 - 0.02, S], [-S, S, -S, h.z - h.d / 2 + 0.02],
       [-S, h.x - h.w / 2 + 0.02, h.z - h.d / 2, h.z + h.d / 2], [h.x + h.w / 2 - 0.02, S, h.z - h.d / 2, h.z + h.d / 2]]
    : [[-S, S, -S, S]];
  const mat = (MaterialsLibrary.get(materialKey) as THREE.MeshStandardMaterial).clone();
  mat.vertexColors = true;
  mat.userData.worldUV = true;
  const g = new THREE.Group();
  g.name = 'ground';
  const field = (x: number, z: number) =>
    0.5 + 0.5 * (0.6 * Math.sin(x * 0.045 + 1.3) * Math.sin(z * 0.037 + 0.4) + 0.4 * Math.sin(x * 0.11 + z * 0.09 + 2.0));
  for (const [x0, x1, z0, z1] of rects) {
    const w = x1 - x0, d = z1 - z0;
    if (w <= 0.05 || d <= 0.05) continue;
    const geo = new THREE.PlaneGeometry(w, d, Math.max(1, Math.ceil(w / 3)), Math.max(1, Math.ceil(d / 3)));
    geo.rotateX(-Math.PI / 2);
    geo.translate((x0 + x1) / 2, 0, (z0 + z1) / 2);
    const p = geo.attributes.position;
    const col = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i++) {
      const t = field(p.getX(i), p.getZ(i));
      col[i * 3] = 0.8 + 0.34 * t; col[i * 3 + 1] = 0.84 + 0.24 * t; col[i * 3 + 2] = 0.78 + 0.08 * t;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const m = new THREE.Mesh(geo, mat);
    m.position.y = y;
    m.receiveShadow = true;
    m.castShadow = false;
    g.add(m);
  }
  root.add(g);
  return g;
}

export function addDriveway(root: THREE.Object3D, x: number, z0: number, z1: number, width = 7) {
  const len = Math.abs(z1 - z0);
  const slab = new THREE.Mesh(new THREE.BoxGeometry(width, 0.05, len), MaterialsLibrary.get('travertine'));
  slab.position.set(x, -0.015, (z0 + z1) / 2);
  slab.receiveShadow = true;
  root.add(slab);
}

/* ------------------------------------------------------------------ */
/* 6b. DISTANT TERRAIN — a real backdrop instead of empty sky          */
/* ------------------------------------------------------------------ */
export function addHills(
  root: THREE.Object3D,
  o: { inner?: number; outer?: number; height?: number; sector?: [number, number]; seed?: number; y?: number } = {}
) {
  const { inner = 110, outer = 520, height = 85, sector, seed = 3, y = -2 } = o;
  const N = 150;
  const geo = new THREE.PlaneGeometry(outer * 2, outer * 2, N, N);
  geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position;
  const col = new Float32Array(p.count * 3);
  const rn = (x: number, z: number) => {
    const a = Math.sin(x * 0.011 + seed) * Math.cos(z * 0.009 + seed * 2);
    const b = Math.sin(x * 0.027 + z * 0.019 + seed * 3) * 0.5;
    const c = Math.sin(x * 0.071 - z * 0.053 + seed) * 0.22;
    return a + b + c;
  };
  const near = new THREE.Color(0x4a5a34), far = new THREE.Color(0x7a8f94), rock = new THREE.Color(0x7d7157);
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i);
    const r = Math.hypot(x, z);
    let mask = THREE.MathUtils.smoothstep(r, inner, inner + 120);
    if (sector) {
      const ang = Math.atan2(x, z);
      const [a0, a1] = sector;
      const d = Math.min(Math.abs(THREE.MathUtils.euclideanModulo(ang - a0 + Math.PI, Math.PI * 2) - Math.PI), 99);
      const inSec = THREE.MathUtils.euclideanModulo(ang - a0, Math.PI * 2) <= THREE.MathUtils.euclideanModulo(a1 - a0, Math.PI * 2);
      mask *= inSec ? 1 : 0;
      void d;
    }
    const h = mask * (12 + (rn(x, z) * 0.5 + 0.5) * height * (0.35 + 0.65 * THREE.MathUtils.smoothstep(r, inner, outer * 0.8)));
    p.setY(i, y + h);
    const t = THREE.MathUtils.clamp((r - inner) / (outer - inner), 0, 1);
    const c = near.clone().lerp(rock, THREE.MathUtils.clamp(h / height - 0.35, 0, 1) * 0.8).lerp(far, t * 0.7);
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0 }));
  m.name = 'distant-hills';
  m.castShadow = false;
  m.receiveShadow = true;
  m.userData.noShadow = true;
  root.add(m);
  return m;
}

/* ------------------------------------------------------------------ */
/* 7. ORGANIC CANOPY — replaces perfect foliage spheres                */
/* ------------------------------------------------------------------ */
export function organicCanopy(radius: number, material: THREE.Material, seed = 1, detail = 2): THREE.Mesh {
  let g: THREE.BufferGeometry = new THREE.IcosahedronGeometry(radius, detail);
  g.deleteAttribute('normal');
  g.deleteAttribute('uv');
  g = mergeVertices(g);
  const p = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).normalize();
    const n =
      0.18 * Math.sin(v.x * 3.1 + seed) * Math.sin(v.y * 2.7 + seed * 2.0) +
      0.10 * Math.sin(v.z * 6.3 + v.x * 4.1 + seed) +
      0.05 * Math.sin(v.y * 11.0 + v.z * 9.0 + seed * 3.0);
    v.multiplyScalar(radius * (1 + n));
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  // spherical UVs for the foliage texture
  const uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).normalize();
    uv[i * 2] = Math.atan2(v.z, v.x) / (Math.PI * 2) + 0.5;
    uv[i * 2 + 1] = v.y * 0.5 + 0.5;
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  const m = new THREE.Mesh(g, material);
  m.scale.y = 0.86;
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}
