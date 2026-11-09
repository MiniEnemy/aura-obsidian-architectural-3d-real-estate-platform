import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { MaterialsLibrary } from './MaterialsLibrary';
import { organicCanopy } from './RealismKit';

export type V3 = [number, number, number];
export type Mat = THREE.Material | THREE.Material[];
export const M = (k: string) => MaterialsLibrary.get(k);

export interface BuildCtx {
  root: THREE.Group;
  furniture: THREE.Group;
  interactive: THREE.Object3D[];
  colliders: THREE.Box3[];
  lights: THREE.Light[]; // interior lights, scaled by time-of-day
  livingLight: THREE.PointLight;
  diningLight: THREE.PointLight;
  livingGlow?: THREE.Mesh;
  diningGlow?: THREE.Mesh;
  frontDoorPivot: THREE.Group;
  masterDoorPivot: THREE.Group;
  balconySlider: THREE.Group;
}

interface BoxOpts { round?: number | boolean; rot?: V3; name?: string; cast?: boolean; data?: Record<string, unknown> }

/** Box (optionally bevelled). Rounded edges catch light — the single biggest "real object" cue. */
export function box(parent: THREE.Object3D, size: V3, pos: V3, mat: Mat, o: BoxOpts = {}): THREE.Mesh {
  const [w, h, d] = size;
  const mn = Math.min(w, h, d);
  let geo: THREE.BufferGeometry;
  if (o.round) {
    const r = typeof o.round === 'number' ? o.round : mn * 0.3;
    geo = new RoundedBoxGeometry(w, h, d, mn < 0.12 ? 1 : 2, Math.max(0.001, Math.min(r, mn / 2 - 0.0005)));
  } else geo = new THREE.BoxGeometry(w, h, d);
  const m = new THREE.Mesh(geo, mat);
  m.position.set(...pos);
  if (o.rot) m.rotation.set(...o.rot);
  if (o.name) m.name = o.name;
  if (o.data) m.userData = { ...m.userData, ...o.data };
  m.castShadow = o.cast ?? Math.max(w, h, d) > 0.35; // tiny props never need to cast shadows
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

export function cyl(parent: THREE.Object3D, rTop: number, rBot: number, h: number, pos: V3, mat: THREE.Material, seg = 16, rot?: V3): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, seg), mat);
  m.position.set(...pos);
  if (rot) m.rotation.set(...rot);
  m.castShadow = Math.max(rTop, rBot) * 2 > 0.2 || h > 0.8;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

export function sph(parent: THREE.Object3D, r: number, pos: V3, mat: THREE.Material, scale: V3 = [1, 1, 1], seg = 14): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.round(seg * 0.75)), mat);
  m.position.set(...pos);
  m.scale.set(...scale);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

const grp = (parent: THREE.Object3D | null, pos: V3, ry = 0) => {
  const g = new THREE.Group();
  g.position.set(...pos);
  g.rotation.y = ry;
  parent?.add(g);
  return g;
};

/* ---------------------------- SEATING ---------------------------- */

/** Upholstered sofa, front faces +z. */
export function sofa(parent: THREE.Object3D, pos: V3, ry: number, width: number, fabric = 'fabric-sofa', cushion = 'fabric-ivory', accent = 'fabric-ivory'): THREE.Group {
  const g = grp(parent, pos, ry);
  const d = 0.98, legH = 0.12;
  const f = M(fabric), c = M(cushion), brass = M('champagne-bronze');
  box(g, [width - 0.04, 0.22, d - 0.06], [0, legH + 0.11, 0], f, { round: 0.05 });
  for (const sx of [-1, 1]) for (const sz of [-1, 1])
    cyl(g, 0.016, 0.02, legH, [sx * (width / 2 - 0.1), legH / 2, sz * (d / 2 - 0.1)], brass, 10);
  for (const sx of [-1, 1]) box(g, [0.2, 0.58, d], [sx * (width / 2 - 0.1), legH + 0.29, 0], f, { round: 0.07 });
  box(g, [width - 0.4, 0.68, 0.22], [0, legH + 0.34, -(d / 2 - 0.11)], f, { round: 0.06 });
  const n = Math.max(2, Math.round((width - 0.4) / 0.85));
  const cw = (width - 0.4) / n;
  for (let i = 0; i < n; i++) {
    const x = -((width - 0.4) / 2) + cw * (i + 0.5);
    box(g, [cw - 0.015, 0.17, d - 0.3], [x, legH + 0.31, 0.1], c, { round: 0.06 });
    box(g, [cw - 0.04, 0.44, 0.16], [x, legH + 0.55, -(d / 2 - 0.31)], c, { round: 0.07, rot: [-0.16, 0, 0] });
  }
  const pa = M(accent);
  box(g, [0.5, 0.48, 0.13], [-(width / 2 - 0.5), legH + 0.55, 0.05], pa, { round: 0.06, rot: [-0.2, 0.25, 0.05] });
  box(g, [0.46, 0.44, 0.12], [width / 2 - 0.5, legH + 0.54, 0.05], f, { round: 0.06, rot: [-0.2, -0.3, -0.05] });
  return g;
}

/** Eames-style lounge chair + ottoman. Front faces +z. */
export function loungeChair(parent: THREE.Object3D, pos: V3, ry: number, leather = 'leather-cognac'): THREE.Group {
  const g = grp(parent, pos, ry);
  const l = M(leather), dark = M('black-steel');
  cyl(g, 0.04, 0.05, 0.34, [0, 0.2, 0], dark, 16);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    box(g, [0.34, 0.03, 0.05], [Math.sin(a) * 0.17, 0.03, Math.cos(a) * 0.17], dark, { rot: [0, a, 0] });
  }
  box(g, [0.78, 0.13, 0.7], [0, 0.44, 0.02], l, { round: 0.05, rot: [0.08, 0, 0] });
  box(g, [0.76, 0.62, 0.14], [0, 0.78, -0.3], l, { round: 0.06, rot: [-0.42, 0, 0] });
  box(g, [0.66, 0.22, 0.12], [0, 1.16, -0.45], l, { round: 0.05, rot: [-0.5, 0, 0] });
  for (const sx of [-1, 1]) box(g, [0.09, 0.07, 0.56], [sx * 0.43, 0.6, -0.02], M('walnut'), { round: 0.03 });
  // ottoman
  const o = grp(g, [0, 0, 0.95]);
  cyl(o, 0.03, 0.04, 0.2, [0, 0.12, 0], dark, 12);
  box(o, [0.62, 0.14, 0.52], [0, 0.34, 0], l, { round: 0.05 });
  return g;
}

export function diningChair(parent: THREE.Object3D, pos: V3, ry: number, fabric = 'fabric-ivory', frame = 'walnut'): THREE.Group {
  const g = grp(parent, pos, ry);
  const f = M(frame);
  box(g, [0.46, 0.05, 0.46], [0, 0.46, 0], f, { round: 0.02 });
  box(g, [0.42, 0.04, 0.42], [0, 0.5, 0.01], M(fabric), { round: 0.02 });
  for (const sx of [-1, 1]) for (const sz of [-1, 1])
    cyl(g, 0.014, 0.012, 0.44, [sx * 0.2, 0.22, sz * 0.2], f, 8);
  for (const sx of [-1, 1]) cyl(g, 0.013, 0.013, 0.46, [sx * 0.2, 0.7, -0.2], f, 8, [-0.12, 0, 0]);
  box(g, [0.44, 0.22, 0.03], [0, 0.78, -0.235], M(fabric), { round: 0.012, rot: [-0.12, 0, 0] });
  return g;
}

export function barStool(parent: THREE.Object3D, pos: V3, seatH = 0.68, leather = 'leather-cognac'): THREE.Group {
  const g = grp(parent, pos);
  const dark = M('black-steel');
  cyl(g, 0.17, 0.17, 0.06, [0, seatH, 0], M(leather), 28);
  cyl(g, 0.035, 0.035, seatH - 0.04, [0, seatH / 2, 0], dark, 12);
  cyl(g, 0.2, 0.2, 0.025, [0, 0.012, 0], dark, 28);
  cyl(g, 0.15, 0.15, 0.012, [0, 0.24, 0], dark, 28);
  return g;
}

/* ---------------------------- TABLES ---------------------------- */

export function table(parent: THREE.Object3D, pos: V3, w: number, d: number, h: number, top: string, leg = 'black-steel', ry = 0): THREE.Group {
  const g = grp(parent, pos, ry);
  box(g, [w, 0.06, d], [0, h - 0.03, 0], M(top), { round: 0.012 });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(g, [0.07, h - 0.06, 0.07], [sx * (w / 2 - 0.12), (h - 0.06) / 2, sz * (d / 2 - 0.15)], M(leg), { round: 0.01 });
  return g;
}

export function coffeeTable(parent: THREE.Object3D, pos: V3, w: number, d: number, topMat: string, ry = 0): THREE.Group {
  const g = grp(parent, pos, ry);
  box(g, [w, 0.07, d], [0, 0.38, 0], M(topMat), { round: 0.015 });
  box(g, [w - 0.3, 0.3, d - 0.3], [0, 0.18, 0], M('black-steel'), { round: 0.01 });
  return g;
}

/* ---------------------------- BEDS ---------------------------- */

/** Bed, headboard at -z, foot toward +z. Floor level = pos.y. */
export function bed(parent: THREE.Object3D, pos: V3, ry: number, width: number, opts: { frame?: string; head?: string; throwMat?: string } = {}): THREE.Group {
  const g = grp(parent, pos, ry);
  const L = 2.15;
  const frame = M(opts.frame ?? 'walnut'), head = M(opts.head ?? 'fabric-sofa'), linen = M('fabric-ivory');
  box(g, [width + 0.1, 0.26, L + 0.1], [0, 0.2, 0], frame, { round: 0.03 });
  box(g, [width - 0.02, 0.24, L - 0.04], [0, 0.45, 0.01], M('fabric-ivory'), { round: 0.05 });
  // duvet with a folded-back top and a throw
  box(g, [width + 0.02, 0.1, L * 0.72], [0, 0.6, 0.31], linen, { round: 0.045 });
  box(g, [width + 0.04, 0.12, 0.42], [0, 0.63, -0.15], linen, { round: 0.05 });
  box(g, [width - 0.06, 0.055, 0.55], [0, 0.67, 0.78], M(opts.throwMat ?? 'fabric-sofa'), { round: 0.025 });
  box(g, [width + 0.3, 1.1, 0.12], [0, 0.78, -(L / 2 + 0.1)], head, { round: 0.05 });
  const pw = width * 0.38;
  for (const s of [-1, 1]) {
    box(g, [pw, 0.17, 0.46], [s * width * 0.23, 0.72, -(L / 2 - 0.3)], linen, { round: 0.07, rot: [-0.22, 0, 0] });
    box(g, [pw * 0.78, 0.15, 0.36], [s * width * 0.23, 0.82, -(L / 2 - 0.42)], M('fabric-sofa'), { round: 0.06, rot: [-0.55, 0, 0] });
    nightstand(g, [s * (width / 2 + 0.42), 0, -(L / 2 - 0.1)], s);
  }
  return g;
}

export function nightstand(parent: THREE.Object3D, pos: V3, side = 1): THREE.Group {
  const g = grp(parent, pos);
  box(g, [0.46, 0.5, 0.42], [0, 0.31, 0], M('walnut'), { round: 0.02 });
  box(g, [0.44, 0.012, 0.012], [0, 0.34, 0.215], M('champagne-bronze'));
  cyl(g, 0.12, 0.12, 0.012, [0, 0.57, 0], M('champagne-bronze'), 20);
  cyl(g, 0.012, 0.012, 0.22, [0, 0.68, 0], M('champagne-bronze'), 8);
  cyl(g, 0.1, 0.15, 0.2, [0, 0.86, 0], M('lampshade'), 24);
  void side;
  return g;
}

/* ---------------------------- DECOR ---------------------------- */

export function rug(parent: THREE.Object3D, pos: V3, w: number, d: number, dark = false, ry = 0): THREE.Group {
  const g = grp(parent, pos, ry);
  const field = M(dark ? 'rug-dark' : 'rug-wool');
  box(g, [w, 0.022, d], [0, 0.011, 0], field, { round: 0.008, cast: false });
  const border = M(dark ? 'rug-wool' : 'rug-dark');
  const t = 0.05, inset = 0.14;
  box(g, [w - inset * 2, 0.026, t], [0, 0.012, d / 2 - inset], border, { cast: false });
  box(g, [w - inset * 2, 0.026, t], [0, 0.012, -(d / 2 - inset)], border, { cast: false });
  box(g, [t, 0.026, d - inset * 2 + t], [w / 2 - inset, 0.012, 0], border, { cast: false });
  box(g, [t, 0.026, d - inset * 2 + t], [-(w / 2 - inset), 0.012, 0], border, { cast: false });
  return g;
}

/** Framed painting. Faces +z. */
export function artFrame(parent: THREE.Object3D, pos: V3, w: number, h: number, seed: number, ry = 0): THREE.Group {
  const g = grp(parent, pos, ry);
  box(g, [w + 0.06, h + 0.06, 0.05], [0, 0, 0], M('black-steel'), { round: 0.006 });
  const canvasMesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), MaterialsLibrary.artwork(seed));
  canvasMesh.position.z = 0.027;
  canvasMesh.receiveShadow = true;
  g.add(canvasMesh);
  return g;
}

/** Potted fiddle-leaf style plant. Leaves are one InstancedMesh. */
export function plant(parent: THREE.Object3D, pos: V3, h = 1.5, potMat = 'ceramic-white', seed = 1): THREE.Group {
  const g = grp(parent, pos);
  const potH = Math.max(0.3, h * 0.22);
  cyl(g, potH * 0.55, potH * 0.4, potH, [0, potH / 2, 0], M(potMat), 28);
  cyl(g, potH * 0.52, potH * 0.52, 0.02, [0, potH - 0.01, 0], M('tree-bark'), 24);
  const trunkH = h - potH;
  cyl(g, 0.014, 0.024, trunkH, [0, potH + trunkH / 2, 0], M('tree-bark'), 8);
  const n = Math.round(14 + h * 8);
  const leaf = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), M('leaf'), n);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const a = i * 2.399 + seed;
    const y = potH + trunkH * (0.38 + 0.62 * t);
    const rad = 0.04 + 0.2 * Math.sin(Math.min(1, t * 1.4 + 0.15) * Math.PI * 0.6) + (hash01(i + seed) * 0.05);
    dummy.position.set(Math.sin(a) * rad, y, Math.cos(a) * rad);
    dummy.rotation.set(0.5 + hash01(i * 3 + seed) * 0.5, a, 0);
    const s = 0.9 + hash01(i * 7 + seed) * 0.4;
    dummy.scale.set(0.075 * s, 0.012, 0.17 * s);
    dummy.updateMatrix();
    leaf.setMatrixAt(i, dummy.matrix);
  }
  leaf.castShadow = true;
  leaf.receiveShadow = true;
  g.add(leaf);
  return g;
}

const hash01 = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

/** Stack of books / decor objects on a surface. */
export function books(parent: THREE.Object3D, pos: V3, n = 3, ry = 0): THREE.Group {
  const g = grp(parent, pos, ry);
  const cols = [0xd9d2c3, 0x2f3b45, 0x8a4b3a, 0xb9ac94, 0x4d5a4c];
  let y = 0;
  for (let i = 0; i < n; i++) {
    const h = 0.03 + hash01(i + pos[0] * 3) * 0.025;
    box(g, [0.28 - i * 0.015, h, 0.2], [hash01(i) * 0.02, y + h / 2, 0], new THREE.MeshStandardMaterial({ color: cols[(((i + Math.floor(pos[0] * 3)) % cols.length) + cols.length) % cols.length], roughness: 0.75 }), { round: 0.003, rot: [0, (hash01(i + 9) - 0.5) * 0.3, 0] });
    y += h;
  }
  return g;
}

/** Cylindrical decorative vase with a few stems. */
export function vase(parent: THREE.Object3D, pos: V3, h = 0.28): THREE.Group {
  const g = grp(parent, pos);
  const lathe = new THREE.LatheGeometry([0.0, 0.07, 0.085, 0.07, 0.04, 0.035, 0.05].map((r, i, a) => new THREE.Vector2(r, (i / (a.length - 1)) * h)), 24);
  const v = new THREE.Mesh(lathe, M('ceramic-white'));
  v.castShadow = true;
  g.add(v);
  for (let i = 0; i < 5; i++) {
    const a = i * 1.3;
    cyl(g, 0.004, 0.004, 0.4, [Math.sin(a) * 0.03, h + 0.18, Math.cos(a) * 0.03], M('tree-bark'), 4, [Math.sin(a) * 0.25, 0, Math.cos(a) * 0.25]);
  }
  return g;
}

/** Pendant lamp: cord + dome shade + glowing underside. Optionally adds a real light. */
export function pendant(ctx: BuildCtx, parent: THREE.Object3D, pos: V3, drop: number, r = 0.22, light = false): THREE.Group {
  const g = grp(parent, pos);
  cyl(g, 0.004, 0.004, drop, [0, -drop / 2, 0], M('black-steel'), 6);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(r, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), M('champagne-bronze'));
  dome.position.y = -drop;
  dome.castShadow = true;
  g.add(dome);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(r * 0.92, 24), M('glow-warm'));
  disc.rotation.x = Math.PI / 2;
  disc.position.y = -drop + 0.01;
  disc.userData.noShadow = true;
  g.add(disc);
  if (light) {
    const pl = new THREE.PointLight(0xffd9a0, 6, 7, 2);
    pl.position.set(0, -drop - 0.15, 0);
    g.add(pl);
    ctx.lights.push(pl);
  }
  return g;
}

/** Pleated curtain (sine-displaced plane). Spans x in [-w/2, w/2], hangs from y=0 down to -h. */
export function curtain(parent: THREE.Object3D, pos: V3, w: number, h: number, folds = 7, amp = 0.07, ry = 0): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(w, h, Math.round(folds * 12), 1);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    p.setZ(i, Math.sin((x / w) * Math.PI * 2 * folds) * amp);
  }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, M('curtain-linen'));
  m.position.set(pos[0], pos[1] - h / 2, pos[2]);
  m.rotation.y = ry;
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  // rod
  cyl(parent, 0.012, 0.012, w + 0.1, [pos[0], pos[1] + 0.02, pos[2]], M('black-steel'), 8, [0, 0, Math.PI / 2]);
  return m;
}

/** Wall run helper: thin wall between two points on the XZ plane. Returns the mesh. */
export function wallBetween(parent: THREE.Object3D, a: [number, number], b: [number, number], y0: number, h: number, t: number, mat: Mat): THREE.Mesh {
  const dx = b[0] - a[0], dz = b[1] - a[1];
  const len = Math.hypot(dx, dz);
  const m = box(parent, [len, h, t], [(a[0] + b[0]) / 2, y0 + h / 2, (a[1] + b[1]) / 2], mat);
  m.rotation.y = -Math.atan2(dz, dx);
  return m;
}

/** Baseboard around a rectangle (inside faces). */
export function baseboard(parent: THREE.Object3D, x0: number, z0: number, x1: number, z1: number, y: number, skip: Array<[string, number, number]> = []) {
  const mat = M('paint-white');
  const H = 0.11, T = 0.02;
  const run = (axis: 'x' | 'z', c: number, a0: number, a1: number, side: number, key: string) => {
    let segs: Array<[number, number]> = [[a0, a1]];
    for (const [k, s0, s1] of skip) if (k === key) segs = segs.flatMap(([p, q]) => (s1 <= p || s0 >= q ? [[p, q] as [number, number]] : [[p, Math.max(p, s0)] as [number, number], [Math.min(q, s1), q] as [number, number]])).filter(([p, q]) => q - p > 0.01);
    for (const [p, q] of segs) {
      if (axis === 'x') box(parent, [q - p, H, T], [(p + q) / 2, y + H / 2, c + side * T / 2], mat, { cast: false });
      else box(parent, [T, H, q - p], [c + side * T / 2, y + H / 2, (p + q) / 2], mat, { cast: false });
    }
  };
  run('x', z0, x0, x1, 1, 'z0');
  run('x', z1, x0, x1, -1, 'z1');
  run('z', x0, z0, z1, 1, 'x0');
  run('z', x1, z0, z1, -1, 'x1');
}

/** Wheel with tyre, rim and brake disc. Axis along x. */
function wheel(parent: THREE.Object3D, pos: V3, r: number, w: number, left: boolean) {
  const g = grp(parent, pos);
  const tyre = new THREE.Mesh(new THREE.TorusGeometry(r - w * 0.35, w * 0.38, 14, 36), M('rubber'));
  tyre.rotation.y = Math.PI / 2;
  tyre.castShadow = true;
  g.add(tyre);
  cyl(g, r - w * 0.55, r - w * 0.55, w * 0.7, [0, 0, 0], M('rubber'), 32, [0, 0, Math.PI / 2]);
  const rim = cyl(g, r * 0.66, r * 0.66, 0.03, [left ? -w * 0.32 : w * 0.32, 0, 0], M('steel-brushed'), 32, [0, 0, Math.PI / 2]);
  rim.castShadow = false;
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    box(g, [0.025, r * 0.62, 0.05], [left ? -w * 0.34 : w * 0.34, Math.cos(a) * r * 0.3, Math.sin(a) * r * 0.3], M('steel-brushed'), { rot: [a, 0, 0], cast: false });
  }
  cyl(g, r * 0.5, r * 0.5, 0.02, [left ? -w * 0.1 : w * 0.1, 0, 0], M('black-steel'), 28, [0, 0, Math.PI / 2]);
}

/** Sleek coupe from an extruded side profile. Faces +z (nose at +z). Origin at ground centre. */
export function coupe(parent: THREE.Object3D, pos: V3, ry: number, paint = 'car-metallic'): THREE.Group {
  const g = grp(parent, pos, ry);
  const L = 4.5, W = 1.9;
  // side profile in (z, y); z from -L/2 (tail) to +L/2 (nose)
  const s = new THREE.Shape();
  const z0 = -L / 2, z1 = L / 2;
  s.moveTo(z0, 0.25);
  s.lineTo(z0 + 0.05, 0.62); s.quadraticCurveTo(z0 + 0.1, 0.88, z0 + 0.55, 0.95);          // tail → deck
  s.quadraticCurveTo(z0 + 1.0, 1.0, z0 + 1.35, 1.2);                                           // rear glass rise
  s.quadraticCurveTo(z0 + 1.7, 1.33, z0 + 2.25, 1.28);                                          // roof
  s.quadraticCurveTo(z0 + 2.85, 1.2, z0 + 3.35, 0.96);                                          // windscreen
  s.quadraticCurveTo(z0 + 3.9, 0.86, z1 - 0.12, 0.74);                                          // bonnet
  s.quadraticCurveTo(z1, 0.6, z1, 0.42);                                                        // nose
  s.lineTo(z1 - 0.05, 0.25);
  s.lineTo(z0, 0.25);
  const geo = new THREE.ExtrudeGeometry(s, { depth: W - 0.3, bevelEnabled: true, bevelThickness: 0.14, bevelSize: 0.13, bevelSegments: 5, curveSegments: 24 });
  geo.translate(0, 0, -(W - 0.3) / 2);
  geo.rotateY(-Math.PI / 2); // shape x(z) → world z, extrusion → world x
  const body = new THREE.Mesh(geo, M(paint));
  body.position.y = 0.12;
  body.castShadow = true;
  body.receiveShadow = true;
  g.add(body);
  // greenhouse glass (inset, slightly smaller profile)
  const gl = new THREE.Shape();
  gl.moveTo(z0 + 1.2, 0.98);
  gl.quadraticCurveTo(z0 + 1.7, 1.2, z0 + 2.25, 1.17);
  gl.quadraticCurveTo(z0 + 2.8, 1.1, z0 + 3.2, 0.93);
  gl.lineTo(z0 + 1.2, 0.93);
  const glassGeo = new THREE.ExtrudeGeometry(gl, { depth: W - 0.28, bevelEnabled: false });
  glassGeo.translate(0, 0, -(W - 0.28) / 2);
  glassGeo.rotateY(-Math.PI / 2);
  const glass = new THREE.Mesh(glassGeo, new THREE.MeshStandardMaterial({ color: 0x0b1118, metalness: 0.4, roughness: 0.05, envMapIntensity: 1.6 }));
  glass.position.y = 0.2;
  glass.castShadow = false;
  g.add(glass);
  for (const sx of [-1, 1]) {
    wheel(g, [sx * (W / 2 - 0.12), 0.36, 1.45], 0.36, 0.28, sx < 0);
    wheel(g, [sx * (W / 2 - 0.1), 0.37, -1.4], 0.37, 0.3, sx < 0);
    box(g, [0.35, 0.07, 0.05], [sx * 0.62, 0.62, L / 2 - 0.04], M('glow-warm'), { cast: false, round: 0.02 }).userData.noShadow = true;
    box(g, [0.5, 0.05, 0.05], [sx * 0.6, 0.78, -L / 2 + 0.06], new THREE.MeshStandardMaterial({ color: 0x300000, emissive: 0xff1010, emissiveIntensity: 1.2 }), { cast: false, round: 0.02 });
  }
  return g;
}

/** Round-ish tree: tapered trunk, 4–5 organic canopy lobes. */
export function tree(parent: THREE.Object3D, x: number, z: number, scale = 1, seed = 1, y = 0): THREE.Group {
  const g = grp(parent, [x, y, z]);
  const trunkH = 3.4 * scale;
  const t = cyl(g, 0.12 * scale, 0.28 * scale, trunkH, [0, trunkH / 2, 0], M('tree-bark'), 12);
  t.rotation.z = (hash01(seed) - 0.5) * 0.08;
  // two forks into the crown
  for (const s of [-1, 1]) cyl(g, 0.06 * scale, 0.11 * scale, 1.9 * scale, [s * 0.35 * scale, trunkH + 0.6 * scale, 0], M('tree-bark'), 8, [0, 0, -s * 0.38]);
  const mats = ['foliage-green', 'foliage-olive', 'foliage-emerald'];
  const N = 6;
  for (let i = 0; i < N; i++) {
    const a = i * 2.4 + seed, rr = (0.3 + hash01(i + seed * 5) * 1.4) * scale;
    const r = (0.8 + hash01(i * 3 + seed) * 0.75) * scale;
    const c = organicCanopy(r, M(mats[(i + seed) % 3]), seed * 7 + i);
    c.position.set(Math.sin(a) * rr, (4.1 + hash01(i * 5 + seed) * 1.9) * scale, Math.cos(a) * rr);
    g.add(c);
  }
  return g;
}

export function addCollider(ctx: BuildCtx, min: V3, max: V3) {
  ctx.colliders.push(new THREE.Box3(new THREE.Vector3(...min), new THREE.Vector3(...max)));
}
