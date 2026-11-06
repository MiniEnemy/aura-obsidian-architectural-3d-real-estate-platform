import * as THREE from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js'; // needs three r162+. Remove AO lines on older.
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { MaterialsLibrary } from './MaterialsLibrary';

/* ------------------------------------------------------------------ */
/* 1. RENDERER                                                         */
/* ------------------------------------------------------------------ */
export function configureRenderer(
  renderer: THREE.WebGLRenderer,
  options: { pixelRatio?: number; exposure?: number; shadows?: boolean } = {}
) {
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = options.exposure ?? 1;
  renderer.shadowMap.enabled = options.shadows ?? true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.setPixelRatio(options.pixelRatio ?? Math.min(window.devicePixelRatio, 1.5));
}

/* ------------------------------------------------------------------ */
/* 2. SKY + SUN + IMAGE-BASED LIGHTING                                 */
/* ------------------------------------------------------------------ */
export function setupSkyAndSun(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  opts: {
    elevation?: number;
    azimuth?: number;
    shadowSize?: number;
    background?: boolean;
    fog?: boolean;
    lighting?: boolean;
  } = {}
) {
  const { elevation = 26, azimuth = 215, shadowSize = 1024 } = opts;

  const sky = new Sky();
  sky.scale.setScalar(10000);
  const u = sky.material.uniforms;
  u.turbidity.value = 3.5;
  u.rayleigh.value = 1.1;
  u.mieCoefficient.value = 0.004;
  u.mieDirectionalG.value = 0.82;

  const sunDir = new THREE.Vector3().setFromSphericalCoords(
    1,
    THREE.MathUtils.degToRad(90 - elevation),
    THREE.MathUtils.degToRad(azimuth)
  );
  u.sunPosition.value.copy(sunDir);

  // Bake sky -> PMREM once. Used for reflections/ambient AND as background (no far-plane issues).
  const previousEnvironment = scene.environment;
  const previousBackground = scene.background;
  const previousFog = scene.fog;
  const previousEnvironmentIntensity = (scene as any).environmentIntensity;
  const previousBackgroundBlurriness = (scene as any).backgroundBlurriness;
  const envScene = new THREE.Scene();
  envScene.add(sky);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const rt = pmrem.fromScene(envScene, 0.02);
  scene.environment = rt.texture;
  if (opts.background !== false) scene.background = rt.texture;
  (scene as any).environmentIntensity = 0.55; // r163+; interiors have no AO from env, keep it modest
  if (opts.background !== false) (scene as any).backgroundBlurriness = 0.02;
  pmrem.dispose();

  if (opts.fog !== false) scene.fog = new THREE.FogExp2(0xc3cfdb, 0.0055);

  let sun: THREE.DirectionalLight | undefined;
  let hemi: THREE.HemisphereLight | undefined;
  if (opts.lighting !== false) {
    sun = new THREE.DirectionalLight(0xfff0dc, 3.2);
    sun.position.copy(sunDir).multiplyScalar(70);
    sun.castShadow = true;
    sun.shadow.mapSize.set(shadowSize, shadowSize);
    const c = sun.shadow.camera;
    c.left = -34; c.right = 34; c.top = 34; c.bottom = -34; c.near = 1; c.far = 180;
    sun.shadow.bias = -0.0002;
    sun.shadow.normalBias = 0.035;
    sun.shadow.radius = 2.5;
    scene.add(sun, sun.target);
    hemi = new THREE.HemisphereLight(0xcfe3ff, 0x6b5f4f, 0.3);
    scene.add(hemi);
  }

  return {
    sun,
    hemi,
    dispose: () => {
      if (scene.environment === rt.texture) scene.environment = previousEnvironment;
      if (scene.background === rt.texture) scene.background = previousBackground;
      if (sun) scene.remove(sun, sun.target);
      if (hemi) scene.remove(hemi);
      if (opts.fog !== false) scene.fog = previousFog;
      (scene as any).environmentIntensity = previousEnvironmentIntensity;
      (scene as any).backgroundBlurriness = previousBackgroundBlurriness;
      rt.dispose();
    }
  };
}

/* ------------------------------------------------------------------ */
/* 3. POST FX (SSAO-class AO + subtle bloom + tone-map)                */
/* ------------------------------------------------------------------ */
export function createPostFX(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  width: number,
  height: number,
  opts: { ao?: boolean; bloom?: boolean; pixelRatio?: number } = {}
) {
  const { ao = false, bloom = true } = opts;
  const target = new THREE.WebGLRenderTarget(width, height, { type: THREE.HalfFloatType });
  const composer = new EffectComposer(renderer, target);
  composer.addPass(new RenderPass(scene, camera));
  const ownedPasses: { dispose?: () => void }[] = [];

  let gtao: GTAOPass | undefined;
  if (ao) {
    gtao = new GTAOPass(scene, camera, width, height);
    gtao.updateGtaoMaterial({ radius: 0.6, distanceExponent: 1.5, thickness: 1.5, scale: 1.1, samples: 12 });
    composer.addPass(gtao);
    ownedPasses.push(gtao);
  }
  if (bloom) {
    // threshold 1.0 => only emissive (>1) surfaces glow: lamps, embers, downlights
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 0.35, 0.6, 1.0);
    composer.addPass(bloomPass);
    ownedPasses.push(bloomPass);
  }
  const outputPass = new OutputPass();
  composer.addPass(outputPass);
  ownedPasses.push(outputPass);
  const pixelRatio = opts.pixelRatio ?? renderer.getPixelRatio();
  composer.setPixelRatio(pixelRatio);
  composer.setSize(width, height);

  return {
    composer,
    render: () => composer.render(),
    setSize: (w: number, h: number) => composer.setSize(w, h),
    setPixelRatio: (ratio: number) => composer.setPixelRatio(ratio),
    setAOEnabled: (enabled: boolean) => { if (gtao) gtao.enabled = enabled; },
    dispose: () => {
      ownedPasses.forEach((pass) => pass.dispose?.());
      composer.dispose();
    }
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
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const ghost = materials.some((mat) => mat.transparent || ((mat as THREE.Material & { emissiveIntensity?: number }).emissiveIntensity ?? 0) > 1);

    // shadows
    if ((mesh as any).isInstancedMesh) {
      mesh.receiveShadow = true; // keep the builder's castShadow choice (skyline stays flat)
      if (materials.some((mat) => mat.userData.worldUV)) boxProjectUVs(mesh.geometry);
      return;
    }
    mesh.castShadow = !ghost;
    mesh.receiveShadow = materials.every((mat) => !mat.transparent);

    // bevel furniture boxes
    if (furniture.has(mesh) && mesh.geometry.type === 'BoxGeometry') {
      const p = (mesh.geometry as THREE.BoxGeometry).parameters;
      const r = THREE.MathUtils.clamp(Math.min(p.width, p.height, p.depth) * 0.3, 0.004, 0.035);
      mesh.geometry.dispose();
      mesh.geometry = new RoundedBoxGeometry(p.width, p.height, p.depth, 3, r);
    }

    // real-world texture scale
    if (materials.some((mat) => mat.userData.worldUV)) boxProjectUVs(mesh.geometry);
  });
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
  const { x, z, width, depth, pitDepth = 1.5, coping = 0.5, infinityNorth = false, topY = 0.02 } = o;
  const tiles = MaterialsLibrary.get('pool-tiles');
  const copingMat = o.copingMat ?? MaterialsLibrary.get('travertine');
  const water = MaterialsLibrary.get('water-pool');
  const g = new THREE.Group();
  g.name = 'pool';
  const T = 0.3;
  const top = topY;
  const waterY = top - 0.1;
  const box = (w: number, h: number, d: number, px: number, py: number, pz: number, m: THREE.Material) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.position.set(px, py, pz);
    g.add(mesh);
    return mesh;
  };

  box(width + 2 * T, 0.2, depth + 2 * T, x, top - pitDepth - 0.1, z, tiles); // floor
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
  size = 260
) {
  const s = new THREE.Shape();
  s.moveTo(-size / 2, -size / 2); s.lineTo(size / 2, -size / 2);
  s.lineTo(size / 2, size / 2); s.lineTo(-size / 2, size / 2); s.closePath();
  for (const h of holes) {
    const p = new THREE.Path();
    // shape lives in XY; after rotating -90° about X, shape-y becomes -z
    p.moveTo(h.x - h.w / 2, -(h.z - h.d / 2));
    p.lineTo(h.x - h.w / 2, -(h.z + h.d / 2));
    p.lineTo(h.x + h.w / 2, -(h.z + h.d / 2));
    p.lineTo(h.x + h.w / 2, -(h.z - h.d / 2));
    p.closePath();
    s.holes.push(p);
  }
  const geo = new THREE.ShapeGeometry(s);
  // ShapeGeometry UVs are already in meters -> lawn tile repeats every 3 m
  const ground = new THREE.Mesh(geo, MaterialsLibrary.get('lawn'));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = y;
  ground.receiveShadow = true;
  ground.name = 'ground';
  root.add(ground);
  return ground;
}

export function addDriveway(root: THREE.Object3D, x: number, z0: number, z1: number, width = 7) {
  const len = Math.abs(z1 - z0);
  const slab = new THREE.Mesh(new THREE.BoxGeometry(width, 0.05, len), MaterialsLibrary.get('travertine'));
  slab.position.set(x, -0.015, (z0 + z1) / 2);
  slab.receiveShadow = true;
  root.add(slab);
}

/* ------------------------------------------------------------------ */
/* 7. ORGANIC CANOPY — replaces perfect foliage spheres                */
/* ------------------------------------------------------------------ */
export function organicCanopy(radius: number, material: THREE.Material, seed = 1): THREE.Mesh {
  let g: THREE.BufferGeometry = new THREE.IcosahedronGeometry(radius, 3);
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
