import * as THREE from 'three';
import { MaterialsLibrary } from '../MaterialsLibrary';
import { organicCanopy } from '../RealismKit';
import {
  BuildCtx, M, artFrame, barStool, bed, books, box, coffeeTable, curtain, cyl, diningChair, loungeChair, pendant, plant,
  rug, sofa, sph, table, vase
} from '../SceneKit';

/** Facade material: 8×10 window cells per tile, random lit windows in the emissive map (switch on at dusk). */
function towerMaterial(): THREE.MeshStandardMaterial {
  const cols = 12, rows = 16, cw = 24, ch = 24;
  const mk = () => { const c = document.createElement('canvas'); c.width = cols * cw; c.height = rows * ch; return c; };
  const cc = mk(), ec = mk();
  const x = cc.getContext('2d')!, e = ec.getContext('2d')!;
  x.fillStyle = '#6f7a86'; x.fillRect(0, 0, cc.width, cc.height);
  e.fillStyle = '#000'; e.fillRect(0, 0, ec.width, ec.height);
  let s = 7;
  const rnd = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const px = c * cw + 5, py = r * ch + 5, w = cw - 10, h = ch - 11;
    x.fillStyle = `rgb(${28 + rnd() * 20},${42 + rnd() * 26},${60 + rnd() * 34})`;
    x.fillRect(px, py, w, h);
    x.fillStyle = 'rgba(255,255,255,0.1)'; x.fillRect(px, py, w, 3);
    if (rnd() < 0.42) { e.fillStyle = rnd() < 0.8 ? '#ffd9a0' : '#cfe6ff'; e.globalAlpha = 0.5 + rnd() * 0.5; e.fillRect(px, py, w, h); e.globalAlpha = 1; }
  }
  const map = new THREE.CanvasTexture(cc); map.colorSpace = THREE.SRGBColorSpace;
  const em = new THREE.CanvasTexture(ec); em.colorSpace = THREE.SRGBColorSpace;
  for (const t of [map, em]) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; }
  const m = new THREE.MeshStandardMaterial({ map, emissiveMap: em, emissive: 0xffffff, roughness: 0.55, metalness: 0.25 });
  return MaterialsLibrary.registerGlow(m, 2.2);
}

function towerBox(w: number, h: number, d: number, mat: THREE.Material, x: number, z: number): THREE.Mesh {
  const geo = new THREE.BoxGeometry(w, h, d);
  const uv = geo.attributes.uv;
  const scale: Array<[number, number]> = [[d / 24, h / 32], [d / 24, h / 32], [1, 1], [1, 1], [w / 24, h / 32], [w / 24, h / 32]];
  for (let f = 0; f < 6; f++) for (let v = 0; v < 4; v++) { const i = f * 4 + v; uv.setXY(i, uv.getX(i) * scale[f][0], uv.getY(i) * scale[f][1]); }
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, h / 2, z);
  m.userData.noShadow = true;
  return m;
}

export function buildSkySanctuary(ctx: BuildCtx) {
  const { root, furniture: furn } = ctx;
  const oak = M('white-oak'), plaster = M('stucco-white'), glass = M('glass-facade'), rail = M('glass-balustrade');
  const brass = M('champagne-bronze'), bronze = M('dark-bronze'), marble = M('calacatta-marble');
  const upholstery = M('fabric-sofa'), linen = M('fabric-ivory'), concrete = M('concrete');
  const floorOak = M('parquet-oak');
  const slab = (top: THREE.Material): THREE.Material[] => [plaster, plaster, top, plaster, plaster, plaster];
  const F1 = 4.17;

  /* --------------------------- shell --------------------------- */
  box(root, [22, 0.3, 18], [0, -0.15, 0], slab(floorOak), { cast: false });
  box(root, [22, 0.42, 18], [0, 7.58, 0], plaster, { cast: false });
  box(root, [21.5, 7.2, 0.08], [0, 3.6, -8.92], glass, { cast: false });
  box(root, [21.5, 7.2, 0.08], [0, 3.6, 8.92], glass, { cast: false });
  box(root, [0.08, 7.1, 17.4], [-10.76, 3.58, 0], glass, { cast: false });
  box(root, [0.08, 7.1, 17.4], [10.76, 3.58, 0], glass, { cast: false });
  // concrete tower frame: beams + piers (square window rhythm)
  for (const z of [-8.78, 8.78]) {
    for (const y of [0.22, 3.8, 7.34]) box(root, [21.8, 0.28, 0.34], [0, y, z], concrete);
    for (const x of [-9.6, -6.4, -3.2, 0, 3.2, 6.4, 9.6]) box(root, [0.22, 7.2, 0.34], [x, 3.6, z], concrete);
  }
  for (const x of [-10.7, 10.7]) {
    for (const y of [0.22, 3.8, 7.34]) box(root, [0.34, 0.28, 18], [x, y, 0], concrete);
    for (const z of [-8.65, -5.78, -2.9, 0, 2.9, 5.78, 8.65]) box(root, [0.34, 7.2, 0.22], [x, 3.6, z], concrete);
  }
  for (const x of [-10.85, -7.2, -3.6, 0, 3.6, 7.2, 10.85]) for (const z of [-8.88, 8.88]) box(root, [0.095, 7.2, 0.12], [x, 3.6, z], bronze);
  for (const y of [1.25, 3.6, 5.95]) for (const z of [-8.88, 8.88]) box(root, [21.5, 0.065, 0.12], [0, y, z], bronze);

  // upper duplex plate + glass guard
  box(root, [21.5, 0.34, 7.5], [0, 4.0, 4.5], slab(oak), { cast: false });
  box(root, [21.3, 1.12, 0.06], [0, F1 + 0.56, 0.78], rail, { cast: false });
  box(root, [21.5, 0.045, 0.08], [0, F1 + 1.14, 0.78], brass);
  const uw = (x: number, z: number, w: number, d: number) => box(root, [w, 2.9, d], [x, F1 + 1.45, z], plaster);
  uw(-8.8, 1.18, 3.3, 0.16); uw(-3.98, 1.18, 4.04, 0.16); uw(-1.95, 4.5, 0.16, 6.5);
  uw(2.6, 1.18, 1.8, 0.16); uw(7.6, 1.18, 5.7, 0.16);
  uw(1.7, 1.7, 0.16, 0.9); uw(1.7, 4.57, 0.16, 1.84); uw(1.7, 7.57, 0.16, 1.26);
  uw(6.1, 4.5, 8.7, 0.16); uw(6.1, 7.4, 8.7, 0.16);

  // floating oak stair
  for (let i = 0; i < 19; i++) box(root, [1.6, 0.14, 0.42], [-8.1, 0.12 + i * 0.19, 5.2 - i * 0.25], oak, { round: 0.01 });
  const ang = Math.atan2(0.19, 0.25), len = 19 * Math.hypot(0.19, 0.25);
  box(root, [0.055, 1.0, len], [-7.15, 1.9 + 0.5, 2.9], rail, { rot: [ang, 0, 0], cast: false });
  box(root, [0.05, 0.05, len], [-7.15, 1.9 + 1.0, 2.9], brass, { rot: [ang, 0, 0], round: 0.015 });

  // private elevator arrival + interactive door
  box(root, [1.05, 3.2, 0.24], [-9.175, 1.6, 7.5], plaster);
  box(root, [1.05, 3.2, 0.24], [-6.425, 1.6, 7.5], plaster);
  box(root, [1.7, 0.5, 0.24], [-7.8, 2.95, 7.5], plaster);
  for (const x of [-8.72, -6.88]) box(root, [0.09, 2.82, 0.14], [x, 1.42, 7.4], brass);
  box(root, [1.92, 0.09, 0.14], [-7.8, 2.9, 7.4], brass);
  ctx.frontDoorPivot.position.set(-8.65, 0, 7.34);
  const door = box(ctx.frontDoorPivot, [1.7, 2.72, 0.1], [0.85, 1.38, 0], oak, {
    data: { id: 'obj-front-door', name: 'Sky Sanctuary Private Entry', type: 'door', description: 'Open the white oak and bronze entrance from the private elevator vestibule.' }
  });
  box(ctx.frontDoorPivot, [0.04, 1.1, 0.09], [1.45, 1.42, 0.08], brass, { round: 0.015 });
  ctx.interactive.push(door); root.add(ctx.frontDoorPivot);
  box(furn, [2.1, 0.82, 0.62], [-5.3, 0.41, 6.25], marble, { round: 0.015 }); // arrival console
  vase(furn, [-5.3, 0.82, 6.25], 0.34);
  artFrame(root, [-5.3, 1.9, 6.5], 1.4, 1.0, 1, Math.PI);

  /* --------------------- great room, kitchen, dining --------------------- */
  rug(furn, [-2.0, 0.0, -3.4], 8.4, 6.4);
  sofa(furn, [-2.0, 0, -1.2], Math.PI, 5.2);
  const sHit = box(furn, [5.2, 0.9, 1.2], [-2.0, 0.45, -1.4], upholstery, {
    cast: false, data: { id: 'room-sky-great', name: 'Double-Height Great Room', type: 'furniture', description: 'A broad city-view salon with a tailored sectional and white-oak floor.' }
  });
  sHit.visible = false; ctx.interactive.push(sHit);
  coffeeTable(furn, [-2.0, 0, -3.2], 2.3, 1.15, 'calacatta-marble');
  books(furn, [-2.6, 0.415, -3.2], 4); vase(furn, [-1.5, 0.415, -3.1]);
  loungeChair(furn, [2.0, 0, -2.2], Math.PI + 0.6); loungeChair(furn, [3.8, 0, -2.2], Math.PI - 0.6, 'leather-cognac');
  plant(furn, [-9.6, 0, -7.6], 2.2, 'ceramic-white', 21); plant(furn, [9.6, 0, -7.6], 2.0, 'ceramic-white', 22);
  curtain(root, [-9.6, 7.0, -8.7], 1.8, 6.9, 3, 0.07); curtain(root, [9.6, 7.0, -8.7], 1.8, 6.9, 3, 0.07);
  ctx.livingLight.position.set(-1.0, 6.4, -3.8);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.07, 12, 40), MaterialsLibrary.glowClone());
  ring.position.copy(ctx.livingLight.position); ring.rotation.x = Math.PI / 2; ring.userData = { noShadow: true, id: 'obj-sky-chandelier', name: 'Bronze Ring Chandelier', type: 'light', description: 'Sculptural suspended light above the double-height salon.' };
  root.add(ring); ctx.interactive.push(ring); ctx.livingGlow = ring;
  for (const a of [0, 2.1, 4.2]) cyl(root, 0.004, 0.004, 1.0, [-1.0 + Math.sin(a) * 1.1, 7.0, -3.8 + Math.cos(a) * 1.1], M('black-steel'), 4);

  const island = box(furn, [1.65, 0.96, 4.0], [5.1, 0.48, -3.5], marble, {
    round: 0.012, data: { id: 'spot-sky-island', name: 'Calacatta Monolith Kitchen', type: 'appliance', description: 'Waterfall marble island with an integrated induction surface.' }
  });
  ctx.interactive.push(island);
  box(furn, [5.1, 2.9, 0.72], [9.9, 1.45, -3.7], oak, { round: 0.01 });
  box(furn, [4.8, 0.12, 0.86], [9.55, 2.95, -3.7], marble, { round: 0.01 });
  box(furn, [0.82, 0.012, 1.4], [5.0, 0.98, -3.8], M('black-steel'));
  for (let i = 0; i < 4; i++) barStool(furn, [3.8, 0, -5.6 + i * 1.4], 0.68, 'fabric-sofa');
  for (const dz of [-4.6, -3.5, -2.4]) pendant(ctx, root, [5.1, 7.3, dz], 3.4, 0.22);
  const dTop = table(furn, [0.9, 0, 1.3], 1.2, 3.0, 0.78, 'white-oak', 'black-steel'); dTop.rotation.y = Math.PI / 2;
  const dHit = box(furn, [1.3, 0.2, 3.1], [0.9, 0.78, 1.3], oak, { cast: false, data: { id: 'room-sky-dining', name: 'Sky Dining Room', type: 'furniture', description: 'A private dining table between the elevator vestibule and the salon.' } });
  dHit.visible = false; ctx.interactive.push(dHit);
  for (const z of [0.1, 1.2, 2.3]) { diningChair(furn, [-0.05, 0, z], Math.PI / 2, 'fabric-ivory', 'white-oak'); diningChair(furn, [1.85, 0, z], -Math.PI / 2, 'fabric-ivory', 'white-oak'); }
  ctx.diningLight.position.set(0.9, 3.0, 1.3);
  const dl = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.06, 28), MaterialsLibrary.glowClone());
  dl.position.set(0.9, 3.0, 1.3); dl.userData.noShadow = true; root.add(dl); ctx.diningGlow = dl;
  cyl(root, 0.004, 0.004, 4.4, [0.9, 5.2, 1.3], M('black-steel'), 4);
  const fl = new THREE.PointLight(0xffdca0, 5, 12, 2); fl.position.set(-2, 3.0, -2); root.add(fl); ctx.lights.push(fl);

  /* ----------------------------- bedrooms ----------------------------- */
  rug(furn, [-6.2, F1, 5.0], 4.4, 3.6, true);
  bed(furn, [-6.2, F1, 5.3], 0, 2.1);
  rug(furn, [6.1, F1, 2.9], 3.6, 3.0); bed(furn, [6.1, F1, 2.9], 0, 1.7);
  rug(furn, [6.1, F1, 6.25], 3.6, 3.0, true); bed(furn, [6.1, F1, 6.25], 0, 1.7, { head: 'fabric-ivory' });
  box(furn, [1.75, 0.58, 0.82], [-9.0, F1 + 0.29, 2.0], M('ceramic-white'), { round: 0.28 });
  box(furn, [2.8, 0.55, 0.64], [-9.0, F1 + 0.3, 7.1], marble, { round: 0.01 });
  box(furn, [0.07, 2.2, 2.0], [-10.0, F1 + 1.1, 3.0], glass, { cast: false });
  artFrame(root, [-3.0, F1 + 1.6, 4.4], 1.3, 0.9, 3, Math.PI / 2);
  plant(furn, [-0.7, F1, 7.0], 1.5, 'ceramic-white', 23);
  loungeChair(furn, [-9.5, F1, 5.8], Math.PI / 2 + 0.4);

  /* ----------------------------- sky garden ----------------------------- */
  box(root, [14.0, 0.26, 3.4], [3.5, 3.82, 9.9], oak, { cast: false });
  box(root, [12.8, 0.12, 1.85], [3.5, 3.98, 10.25], M('lawn'), { cast: false });
  box(root, [14.0, 1.05, 0.06], [3.5, 4.48, 11.58], rail, { cast: false });
  box(root, [14.0, 0.06, 0.1], [3.5, 5.03, 11.58], brass);
  for (const x of [-2.0, 2.0, 6.0, 9.0]) {
    box(root, [1.2, 0.52, 0.56], [x, 4.2, 10.45], plaster, { round: 0.02 });
    sph(root, 0.46, [x, 4.9, 10.45], M('foliage-emerald'), [1, 0.85, 0.92], 12).castShadow = true;
  }
  cyl(root, 0.1, 0.16, 1.7, [9.1, 4.9, 9.25], M('tree-bark'), 10);
  const oc = organicCanopy(0.9, M('foliage-olive'), 5); oc.position.set(9.1, 5.85, 9.25); root.add(oc);
  table(furn, [3.0, 4.0, 9.8], 0.7, 0.7, 0.72, 'black-steel', 'black-steel');
  for (const [dx, ry] of [[-0.7, Math.PI / 2], [0.7, -Math.PI / 2]] as const) diningChair(furn, [3.0 + dx, 4.0, 9.8], ry, 'fabric-sofa', 'black-steel');

  /* ----------------------- Manhattan beyond the glass ----------------------- */
  const tm = towerMaterial();
  const park = new THREE.Mesh(new THREE.BoxGeometry(13.5, 0.12, 18), new THREE.MeshStandardMaterial({ color: 0x3f6a45, roughness: 1 }));
  park.position.set(0, -0.48, -30); park.userData.noShadow = true; root.add(park);
  const pond = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.04, 5.0), M('water-pool')); pond.position.set(1.5, -0.38, -31); root.add(pond);
  for (let i = 0; i < 60; i++) {
    const a = Math.sin(i * 12.9) * 4375.5, b = Math.sin(i * 78.2) * 1234.5;
    const fx = a - Math.floor(a), fz = b - Math.floor(b);
    const tr = organicCanopy(0.9 + fx * 0.7, M('foliage-green'), i); tr.position.set(-6.5 + fx * 13, 0.3, -38.5 + fz * 17); tr.userData.noShadow = true; root.add(tr);
  }
  const sky: Array<[number, number, number, number, number]> = [
    [-28, -27, 4.2, 24, 4.0], [-22, -34, 3.4, 18, 3.2], [-17, -29, 4.4, 31, 3.8], [-12, -37, 3.5, 21, 3.2], [-8, -31, 4.0, 38, 3.6],
    [8, -34, 4.2, 29, 3.4], [13, -29, 4.6, 35, 4.0], [19, -38, 4.0, 22, 3.5], [25, -31, 4.4, 18, 3.5], [-31, -18, 3.3, 14, 3.0],
    [-24, -20, 4.0, 19, 3.2], [-16, -18, 3.2, 13, 3.0], [17, -20, 3.7, 16, 3.0], [24, -18, 3.4, 13, 3.0], [31, -23, 4.0, 20, 3.2],
    [-40, -45, 6, 44, 6], [-30, -55, 7, 58, 6], [35, -48, 6, 40, 6], [28, -60, 8, 70, 7], [-8, -62, 9, 52, 8], [8, -75, 9, 90, 8], [50, -30, 6, 34, 6], [-52, -34, 6, 38, 6]
  ];
  for (const [x, z, w, h, d] of sky) root.add(towerBox(w, h, d, tm, x, z));
  // art-deco spire
  const tw = towerBox(2.6, 27, 2.8, tm, 15.5, -26); root.add(tw);
  for (let y = 27; y <= 34; y += 2) {
    const s = new THREE.Mesh(new THREE.CylinderGeometry(1.8 - (y - 27) * 0.11, 2.0 - (y - 27) * 0.11, 1.4, 8), brass);
    s.position.set(15.5, y, -26); s.userData.noShadow = true; root.add(s);
  }
  const spire = new THREE.Mesh(new THREE.ConeGeometry(0.16, 7, 8), brass); spire.position.set(15.5, 39.5, -26); root.add(spire);
}
