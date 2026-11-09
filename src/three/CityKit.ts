import * as THREE from 'three';
import { MaterialsLibrary } from './MaterialsLibrary';

/**
 * Manhattan seen from a 244 m (800 ft) penthouse. World origin = penthouse floor, +x east, -z north.
 * Street level is at y = GROUND. Whole city = 2 draw calls (instanced buildings + ground), windows are
 * generated in the fragment shader from world position, so there are no textures and no per-building UVs.
 */
export const GROUND = -244;

function cityMaterial(): THREE.MeshStandardMaterial {
  const m = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55, metalness: 0.25, emissive: 0xffd7a0 });
  MaterialsLibrary.registerGlow(m, 2.4); // lit windows scale with time-of-day
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWp; varying vec3 vNw; varying float vSeed;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        mat4 cityM = modelMatrix;
        #ifdef USE_INSTANCING
          cityM = modelMatrix * instanceMatrix;
        #endif
        vWp = (cityM * vec4(transformed, 1.0)).xyz;
        vNw = normalize(mat3(cityM) * objectNormal);
        vSeed = fract(sin(dot(cityM[3].xz, vec2(12.9898, 78.233))) * 43758.5453);`);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
        varying vec3 vWp; varying vec3 vNw; varying float vSeed;
        float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float winMask = 0.0; float winLit = 0.0;`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        {
          vec3 n = normalize(vNw);
          float wall = step(abs(n.y), 0.5);
          vec2 g = abs(n.x) > abs(n.z) ? vec2(vWp.z, vWp.y) : vec2(vWp.x, vWp.y);
          vec2 uvw = g / vec2(3.4, 3.8);
          vec2 id = floor(uvw); vec2 f = fract(uvw);
          float far = 1.0 - smoothstep(380.0, 1100.0, length(vViewPosition));
          float win = step(0.16, f.x) * step(f.x, 0.84) * step(0.24, f.y) * step(f.y, 0.76) * wall * far;
          float tone = fract(vSeed * 7.0);
          vec3 facade = mix(vec3(0.46, 0.47, 0.50), vec3(0.52, 0.46, 0.40), tone);
          facade = mix(facade, vec3(0.30, 0.32, 0.36), step(0.8, fract(vSeed * 13.0)));
          vec3 glassC = vec3(0.09, 0.13, 0.19) * (0.8 + 0.5 * h21(id + vSeed * 91.0));
          vec3 roof = vec3(0.30, 0.30, 0.31);
          vec3 base = mix(roof, facade, wall);
          base = mix(base, mix(facade * 0.9, glassC, 0.85), win);
          diffuseColor.rgb = base * vColor.rgb;
          winMask = win;
          winLit = step(0.6, h21(id * 1.7 + vSeed * 57.0));
        }`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        totalEmissiveRadiance *= winMask * winLit;`);
  };
  return m;
}

interface B { x: number; z: number; w: number; d: number; h: number; y0?: number; c?: number }

export function buildManhattan(root: THREE.Object3D, opts: { towerHalf?: [number, number] } = {}) {
  const [tx, tz] = opts.towerHalf ?? [10.8, 8.9];
  let s = 20260921;
  const rnd = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
  const list: B[] = [];

  // our own tower shaft, flush with the glass, down to the street
  list.push({ x: 0, z: 0, w: tx * 2, d: tz * 2, h: -GROUND - 0.5, c: 0.5 });

  const AVE = 110, ST = 80;
  for (let gx = -1500; gx <= 2300; gx += AVE) {
    for (let gz = -2600; gz <= 2500; gz += ST) {
      if (gz < -215 && gx > -760 && gx < 360) continue;          // Central Park
      if (gx > 1040 && gx < 1420) continue;                      // East River
      if (Math.abs(gx) < 70 && Math.abs(gz) < 70) continue;      // our tower
      const midtown = gz > -300 && gz < 2200 && Math.abs(gx) < 800;
      const queens = gx >= 1420;
      for (let lot = 0; lot < 2; lot++) {
        const w = AVE / 2 - 14 - rnd() * 6, d = ST - 22 - rnd() * 8;
        const x = gx + (lot ? 1 : -1) * (AVE / 4) + (rnd() - 0.5) * 4;
        let h = queens ? 14 + rnd() * 36 : 22 + Math.pow(rnd(), 1.8) * 120;
        if (midtown) h = h * 1.5 + (rnd() < 0.07 ? 80 + rnd() * 100 : 0);
        list.push({ x, z: gz + (rnd() - 0.5) * 4, w, d, h: Math.min(h, 235), c: rnd() });
      }
    }
  }
  // landmarks (stacked setbacks)
  const tiers = (x: number, z: number, parts: Array<[number, number, number]>) => {
    let y = 0;
    for (const [w, d, h] of parts) { list.push({ x, z, w, d, h, y0: y, c: 0.3 }); y += h; }
    return y;
  };
  tiers(-520, -40, [[26, 26, 435]]);      // 111 W 57th (Steinway)
  tiers(-455, -112, [[44, 36, 472]]);     // Central Park Tower
  tiers(-330, -122, [[42, 42, 306]]);     // One57
  tiers(-300, -190, [[32, 32, 290]]);     // 220 Central Park South
  tiers(-60, 1350, [[52, 52, 427]]);      // One Vanderbilt
  tiers(-260, 1800, [[66, 52, 85], [54, 42, 120], [42, 34, 90], [30, 26, 70], [18, 16, 56], [6, 6, 22]]);          // Empire State
  tiers(130, 1200, [[34, 34, 215], [26, 26, 40], [18, 18, 28], [10, 10, 22], [3, 3, 14]]);                          // Chrysler
  for (let i = 0; i < 18; i++) list.push({ x: -900 + rnd() * 1700, z: -100 + rnd() * 1700, w: 28 + rnd() * 20, d: 28 + rnd() * 20, h: 240 + rnd() * 160, c: rnd() });

  const geo = new THREE.BoxGeometry(1, 1, 1);
  geo.translate(0, 0.5, 0);
  const mesh = new THREE.InstancedMesh(geo, cityMaterial(), list.length);
  mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(list.length * 3), 3);
  const o = new THREE.Object3D();
  const col = new THREE.Color();
  list.forEach((b, i) => {
    o.position.set(b.x, GROUND + (b.y0 ?? 0), b.z);
    o.scale.set(b.w, b.h, b.d);
    o.updateMatrix();
    mesh.setMatrixAt(i, o.matrix);
    const t = 0.85 + 0.3 * (b.c ?? 0.5);
    col.setRGB(t, t * 0.98, t * 0.95);
    mesh.setColorAt(i, col);
  });
  mesh.castShadow = false; mesh.receiveShadow = false;
  mesh.frustumCulled = false; // one huge instanced draw
  mesh.name = 'manhattan';
  root.add(mesh);

  // streets
  const street = new THREE.Mesh(new THREE.PlaneGeometry(9000, 9000), new THREE.MeshStandardMaterial({ color: 0x35383c, roughness: 0.95 }));
  street.rotation.x = -Math.PI / 2; street.position.y = GROUND; street.userData.noShadow = true; street.name = 'streets';
  root.add(street);

  // Central Park: forested relief + lawns + water
  const PX0 = -760, PX1 = 360, PZ0 = -2800, PZ1 = -215;
  const pw = PX1 - PX0, pd = PZ1 - PZ0;
  const pg = new THREE.PlaneGeometry(pw, pd, 70, 130);
  pg.rotateX(-Math.PI / 2);
  pg.translate((PX0 + PX1) / 2, GROUND, (PZ0 + PZ1) / 2);
  const p = pg.attributes.position;
  const col2 = new Float32Array(p.count * 3);
  const nz = (x: number, z: number, f: number) => 0.5 + 0.5 * Math.sin(x * f + Math.sin(z * f * 1.3) * 2.1) * Math.cos(z * f * 0.9 + 1.7);
  const lawns: Array<[number, number, number, number]> = [[-260, -1950, 330, 260], [-330, -700, 220, 150], [-90, -520, 160, 120]];
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i);
    let h = (4 + nz(x, z, 0.045) * 14) * (0.4 + 0.6 * nz(x, z, 0.012));
    let lawn = 0;
    for (const [cx, cz, rx, rz] of lawns) { const d = Math.hypot((x - cx) / rx, (z - cz) / rz); lawn = Math.max(lawn, 1 - THREE.MathUtils.smoothstep(d, 0.6, 1.0)); }
    h *= 1 - lawn;
    p.setY(i, GROUND + 0.5 + h);
    const t = nz(x, z, 0.09);
    const r = THREE.MathUtils.lerp(0.16 + 0.08 * t, 0.36, lawn), g = THREE.MathUtils.lerp(0.28 + 0.1 * t, 0.5, lawn), b = THREE.MathUtils.lerp(0.14, 0.22, lawn);
    col2[i * 3] = r; col2[i * 3 + 1] = g; col2[i * 3 + 2] = b;
  }
  pg.setAttribute('color', new THREE.BufferAttribute(col2, 3));
  pg.computeVertexNormals();
  const park = new THREE.Mesh(pg, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 }));
  park.userData.noShadow = true; park.name = 'central-park';
  root.add(park);

  const waterMat = new THREE.MeshStandardMaterial({ color: 0x2f6479, roughness: 0.06, metalness: 0.1, envMapIntensity: 1.3 });
  const lake = (x: number, z: number, w: number, d: number) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), waterMat);
    m.rotation.x = -Math.PI / 2; m.position.set(x, GROUND + 1.2, z); m.userData.noShadow = true; root.add(m);
  };
  lake(-330, -1250, 150, 190); lake(-130, -300, 70, 60); lake(-300, -2650, 280, 220);
  const river = new THREE.Mesh(new THREE.PlaneGeometry(380, 9000), waterMat);
  river.rotation.x = -Math.PI / 2; river.position.set(1230, GROUND + 0.6, 0); river.userData.noShadow = true; river.name = 'east-river';
  root.add(river);
  return mesh;
}
