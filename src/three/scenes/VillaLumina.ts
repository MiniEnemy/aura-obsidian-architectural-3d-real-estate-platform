import * as THREE from 'three';
import { MaterialsLibrary } from '../MaterialsLibrary';
import { addGround, addHills, buildPool, organicCanopy } from '../RealismKit';
import {
  BuildCtx, M, artFrame, barStool, bed, books, box, coffeeTable, cyl, diningChair, loungeChair, pendant, plant,
  rug, sofa, sph, table, tree, vase
} from '../SceneKit';

export function buildVillaLumina(ctx: BuildCtx) {
  const { root, furniture: furn } = ctx;
  const lime = M('travertine'), plaster = M('stucco-white'), oak = M('parquet-oak'), walnut = M('walnut');
  const brass = M('champagne-bronze'), glass = M('glass-facade'), roofM = M('roof-terracotta');
  const gable = new THREE.MeshStandardMaterial({ color: 0xd8caba, roughness: 0.94, side: THREE.DoubleSide });
  const FL = 0.31; // finished floor level of the pavilion

  /* ------------------------ headland, sea, terrace ------------------------ */
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(900, 500), M('water-sea'));
  sea.rotation.x = -Math.PI / 2; sea.position.set(0, -2.2, -270); sea.receiveShadow = false; sea.userData.noShadow = true;
  root.add(sea);
  box(root, [140, 7, 14], [0, -3.5, -29], lime, { cast: false }); // cliff face down to the water
  const T0 = -18, T1 = 15; // terrace z extents
  const pool = buildPool(root, { x: 0, z: -12.6, width: 24.4, depth: 5.8, topY: 0.14, infinityNorth: true, pitDepth: 1.6, coping: 0.6 });
  const g = addGround(root, [{ x: 0, z: (T0 + T1) / 2 - 40, w: 38, d: T1 - T0 }], -0.06, 124);
  g.position.z = 40;
  // solid terrace around the pool (slabs reach down so the pit reads as a real excavation)
  const th = 2.4, tc = 0.14 - th / 2;
  const hole = pool.hole;
  box(root, [38, th, T1 - (hole.z + hole.d / 2)], [0, tc, (T1 + hole.z + hole.d / 2) / 2], lime, { cast: false });
  box(root, [38, th, (hole.z - hole.d / 2) - T0], [0, tc, (T0 + hole.z - hole.d / 2) / 2], lime, { cast: false });
  for (const s of [-1, 1]) box(root, [(38 - hole.w) / 2, th, hole.d], [s * (hole.w / 2 + (38 - hole.w) / 4), tc, hole.z], lime, { cast: false });
  addHills(root, { inner: 90, outer: 520, height: 110, sector: [-1.4, 1.4], seed: 9, y: -3 });

  /* ------------------------ pavilion floor and walls ------------------------ */
  box(root, [28, 0.18, 19], [0, 0.22, 0.7], [plaster, plaster, oak, plaster, plaster, plaster], { cast: false });
  box(root, [5.5, 0.08, 6.0], [0.2, 0.34, 2.1], lime, { cast: false });
  const wing = (x: number, z: number, w: number, d: number) => box(root, [w, 3.8, d], [x, 2.1, z], plaster);
  for (const [z, depth] of [[-7.14, 1.02], [-3.6, 1.15], [0.15, 1.45], [3.9, 1.15], [7.89, 1.92]] as const) { wing(-11.8, z, 0.35, depth); wing(11.8, z, 0.35, depth); }
  wing(-7.6, -7.5, 8.7, 0.35); wing(-7.6, 8.7, 8.7, 0.35); wing(11.8, 0.6, 0.35, 16.5); wing(7.7, 8.7, 8.5, 0.35); wing(7.7, -7.5, 8.5, 0.35);
  wing(-3.9, -5.3, 0.22, 4.2); wing(3.9, -5.3, 0.22, 4.2);
  box(root, [21.5, 3.4, 0.06], [0, 2.15, -7.8], glass, { cast: false });
  for (const x of [-10.5, -6.5, -2.5, 2.5, 6.5, 10.5]) box(root, [0.11, 3.55, 0.16], [x, 2.15, -7.75], brass);
  box(root, [21.8, 0.08, 0.2], [0, 3.9, -7.75], brass);

  /* ------------------------ gabled terracotta roofs ------------------------ */
  for (const cx of [-7.6, 7.7]) {
    const sh = new THREE.Shape();
    sh.moveTo(-4.2, 0); sh.lineTo(4.2, 0); sh.lineTo(0, 1.55); sh.closePath();
    const gf = new THREE.Mesh(new THREE.ShapeGeometry(sh), gable); gf.position.set(cx, 3.72, 8.55); gf.castShadow = true; root.add(gf);
    const gb = gf.clone(); gb.position.z = -7.55; gb.rotation.y = Math.PI; root.add(gb);
    for (const side of [-1, 1]) {
      const a = side < 0 ? 0.36 : -0.36;
      box(root, [4.5, 0.2, 18.4], [cx + side * 2.12, 4.68, 0.58], roofM, { rot: [0, 0, a] });
      box(root, [0.18, 0.24, 18.5], [cx + side * 4.12, 3.94, 0.58], lime);
    }
    const ridge = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 18.7, 14), M('roof-terracotta'));
    ridge.rotation.x = Math.PI / 2; ridge.position.set(cx, 5.48, 0.58); ridge.castShadow = true; root.add(ridge);
  }

  // ceilings under the wings and a flat teak-soffit roof over the central salon (courtyard stays open)
  for (const cx of [-7.6, 7.7]) box(root, [8.8, 0.12, 17.8], [cx, 3.86, 0.6], plaster, { cast: false });
  const flat = (w: number, d: number, x: number, z: number) => box(root, [w, 0.24, d], [x, 3.96, z], [plaster, plaster, M('concrete'), M('wood-slats'), plaster, plaster]);
  flat(6.8, 6.9, 0, -4.35); flat(6.8, 3.5, 0, 6.85); flat(0.85, 6.0, -2.975, 2.1); flat(0.45, 6.0, 3.175, 2.1);

  /* ------------------- shuttered windows + loggia arches ------------------- */
  const shutter = new THREE.MeshStandardMaterial({ color: 0x4a5d4c, roughness: 0.78 });
  for (const side of [-1, 1]) for (const z of [-5.4, -1.8, 2.1, 5.7]) {
    box(root, [0.12, 2.1, 2.45], [side * 11.8, 2.05, z], glass, { cast: false });
    box(root, [0.35, 0.98, 2.45], [side * 11.8, 0.49, z], plaster);
    box(root, [0.35, 0.88, 2.45], [side * 11.8, 3.56, z], plaster);
    for (const o of [-1.48, 1.48]) {
      box(root, [0.1, 1.95, 0.5], [side * 12.0, 2.05, z + o], shutter);
      for (let s = 0; s < 7; s++) box(root, [0.05, 0.03, 0.42], [side * 12.08, 1.34 + s * 0.22, z + o], shutter, { rot: [0.5, 0, 0], cast: false });
    }
    box(root, [0.55, 0.16, 2.7], [side * 11.93, 0.98, z], lime);
  }
  for (let x = -10; x <= 10; x += 4) {
    cyl(root, 0.2, 0.24, 1.9, [x, 1.26, 8.1], plaster, 20);
    if (x < 10) {
      const arch = new THREE.Mesh(new THREE.TorusGeometry(1.74, 0.13, 10, 32, Math.PI), plaster);
      arch.position.set(x + 2, 2.2, 8.1); arch.castShadow = true; root.add(arch);
    }
  }

  /* --------------------- arrival: pivot door, portico, garden --------------------- */
  ctx.frontDoorPivot.position.set(-0.95, 0, 8.52);
  const door = box(ctx.frontDoorPivot, [1.9, 3.25, 0.16], [0.95, 1.95, 0], walnut, {
    data: { id: 'obj-front-door', name: 'Villa Lumina Pivot Entry', type: 'door', description: 'Open the white oak pivot door beneath the covered Mediterranean loggia.' }
  });
  box(ctx.frontDoorPivot, [0.05, 1.3, 0.1], [1.62, 1.95, 0.1], brass, { round: 0.015 });
  ctx.interactive.push(door);
  root.add(ctx.frontDoorPivot);
  for (const x of [-1.08, 1.08]) box(root, [0.16, 3.45, 0.22], [x, 2.0, 8.52], lime);
  box(root, [2.32, 0.22, 0.24], [0, 3.76, 8.52], lime);
  for (let s = 0; s < 4; s++) box(root, [2.65 + s * 0.25, 0.12, 0.48], [0, 0.2 - s * 0.1 + 0.0, 8.85 + s * 0.46], lime, { cast: false });
  box(root, [2.4, 0.06, 4.2], [0, -0.1, 12.2], lime, { cast: false });
  for (const side of [-1, 1]) {
    box(root, [3.6, 0.18, 6.2], [side * 4.0, 0.03, 12.0], M('gravel'), { cast: false });
    const lav = new THREE.MeshStandardMaterial({ color: 0x8173a6, roughness: 0.9 });
    for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) {
      const s = sph(root, 0.3, [side * (2.9 + c * 0.42), 0.34, 9.8 + r * 1.3], c % 2 ? M('foliage-olive') : lav, [1, 0.7, 0.9], 10);
      s.castShadow = true;
    }
    for (const z of [10.0, 12.0, 14.0]) cyl(root, 0.07, 0.09, 0.38, [side * 1.75, 0.2, z], brass, 12);
  }

  /* ------------------------ living, dining, kitchen ------------------------ */
  const salon = new THREE.Group(); furn.add(salon);
  box(furn, [6.4, 0.18, 5.2], [-3.8, 0.34, 1.1], lime, { cast: false }); // sunken pit platform edge
  rug(furn, [-3.8, FL + 0.02, 0.6], 4.6, 3.2);
  sofa(furn, [-3.8, FL, 2.7], Math.PI, 5.2, 'fabric-ivory', 'fabric-ivory', 'fabric-sofa');
  sofa(furn, [-6.3, FL, 0.9], -Math.PI / 2, 3.6, 'fabric-ivory', 'fabric-ivory', 'fabric-sofa');
  loungeChair(furn, [-1.0, FL, 0.2], Math.PI / 2 + 0.3);
  coffeeTable(furn, [-3.8, FL, 0.5], 1.8, 1.0, 'travertine');
  books(furn, [-4.1, FL + 0.415, 0.5], 3); vase(furn, [-3.4, FL + 0.415, 0.5]);
  const lounge = box(furn, [5.0, 0.8, 4.0], [-3.8, FL + 0.4, 1.1], M('fabric-ivory'), {
    cast: false, data: { id: 'room-villa-living', name: 'Sunken Sea Lounge', type: 'furniture', description: 'Limestone conversation pit with deep linen cushions and a direct view to the sea.' }
  });
  lounge.visible = false; ctx.interactive.push(lounge);
  box(root, [1.2, 0.3, 2.0], [-3.8, FL + 0.15, -1.8], lime);
  box(root, [0.8, 0.03, 1.5], [-3.8, FL + 0.31, -1.8], MaterialsLibrary.glowClone(), { cast: false }).userData.noShadow = true;
  const fl = new THREE.PointLight(0xff9a4a, 2.2, 7, 2); fl.position.set(-3.8, 0.9, -1.8); root.add(fl); ctx.lights.push(fl);
  const diningTop = table(furn, [5.9, FL, 0.8], 1.5, 4.2, 0.78, 'parquet-oak', 'black-steel');
  diningTop.rotation.y = Math.PI / 2;
  const dHit = box(furn, [1.6, 0.2, 4.3], [5.9, FL + 0.78, 0.8], oak, {
    cast: false, data: { id: 'room-villa-dining', name: 'Terrace Dining Colonnade', type: 'furniture', description: 'Solid oak dining table under the shaded loggia.' }
  });
  dHit.visible = false; ctx.interactive.push(dHit);
  for (const z of [-1.1, -0.25, 0.6, 1.45, 2.3]) { diningChair(furn, [4.85, FL, z + 0.0], Math.PI / 2); diningChair(furn, [6.95, FL, z + 0.0], -Math.PI / 2); }
  diningChair(furn, [5.9, FL, -1.9], 0, 'fabric-ivory'); diningChair(furn, [5.9, FL, 3.5], Math.PI);
  vase(furn, [5.9, FL + 0.78, 0.8], 0.32);
  // pendant ring over the dining table (viewer toggles diningLight)
  ctx.diningLight.position.set(5.9, 3.0, 0.8);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.04, 12, 56), MaterialsLibrary.glowClone());
  ring.position.set(5.9, 3.2, 0.8); ring.rotation.x = Math.PI / 2; ring.userData.noShadow = true;
  ring.userData = { ...ring.userData, id: 'obj-villa-lights', name: 'Villa Lumina Pendant Lights', type: 'light', description: 'Warm brass pendant over the dining colonnade.' };
  root.add(ring); ctx.interactive.push(ring); ctx.diningGlow = ring;
  ctx.livingLight.position.set(-3.8, 3.0, 1.0);
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.3, 20, 14), MaterialsLibrary.glowClone());
  lamp.position.copy(ctx.livingLight.position); lamp.userData.noShadow = true; root.add(lamp); ctx.livingGlow = lamp;
  for (const dz of [-3.9, -3.0, -2.1]) pendant(ctx, root, [5.5, 3.6, dz], 1.2, 0.2);
  // kitchen
  box(furn, [1.45, 0.06, 3.6], [5.5, FL + 0.92, -4.0], M('calacatta-marble'), {
    round: 0.012, data: { id: 'spot-villa-island', name: 'Honed Calacatta Island', type: 'appliance', description: 'Waterfall stone island facing the open kitchen.' }
  });
  ctx.interactive.push(furn.children[furn.children.length - 1]);
  box(furn, [1.2, 0.86, 3.6], [5.5, FL + 0.45, -4.0], walnut, { round: 0.015 });
  box(furn, [5.4, 2.65, 0.8], [8.7, FL + 1.33, -4.0], walnut, { round: 0.01 });
  box(furn, [0.8, 0.012, 1.25], [5.45, FL + 0.96, -3.8], M('black-steel'));
  for (let i = 0; i < 4; i++) barStool(furn, [4.4, FL, -5.2 + i * 0.9], 0.68);

  /* ------------------------------ sleeping suites ------------------------------ */
  const suites: Array<[number, number, number, string, number]> = [[-8.2, -2.0, 2.1, 'a', 0], [-8.2, 4.0, 1.7, 'b', 0], [8.2, 4.0, 1.7, 'c', 0]];
  suites.forEach(([x, z, w], i) => {
    rug(furn, [x, FL + 0.02, z + 0.2], w + 1.4, 3.0, i % 2 === 1);
    bed(furn, [x, FL, z], 0, w, { head: i === 0 ? 'fabric-sofa' : 'fabric-ivory' });
  });
  plant(furn, [-10.2, FL, -6.2], 1.7, 'ceramic-white', 11); plant(furn, [10.0, FL, -6.2], 1.5, 'ceramic-white', 12);
  artFrame(root, [-8.2, 1.9, -3.7 - 1.45 + 0.0], 1.6, 1.0, 2, 0);
  plant(furn, [0.2, 0.38, 2.1 + 3.4], 1.2, 'ceramic-white', 13);

  /* -------------------------- detached guest pavilion -------------------------- */
  box(root, [8.5, 0.16, 13.5], [17.2, 0.1, 1.5], lime, { cast: false });
  for (const [x, z, w, d] of [[13.0, 1.5, 0.22, 13.5], [21.4, 1.5, 0.22, 13.5], [17.2, -5.2, 8.5, 0.22], [14.75, 8.2, 3.4, 0.22], [19.65, 8.2, 3.5, 0.22]] as const) box(root, [w, 3.4, d], [x, 2.0, z], plaster);
  box(root, [1.7, 0.4, 0.22], [17.2, 3.2, 8.2], plaster);
  const gs = new THREE.Shape(); gs.moveTo(-4.25, 0); gs.lineTo(4.25, 0); gs.lineTo(0, 1.2); gs.closePath();
  const gg = new THREE.Mesh(new THREE.ShapeGeometry(gs), gable); gg.position.set(17.2, 3.7, 8.32); root.add(gg);
  const gg2 = gg.clone(); gg2.position.z = -5.33; gg2.rotation.y = Math.PI; root.add(gg2);
  for (const side of [-1, 1]) box(root, [4.65, 0.2, 14.2], [17.2 + side * 2.18, 4.22, 1.5], roofM, { rot: [0, 0, side < 0 ? 0.35 : -0.35] });
  const gr = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 14.4, 12), roofM); gr.rotation.x = Math.PI / 2; gr.position.set(17.2, 5.02, 1.5); root.add(gr);
  box(root, [8.1, 2.45, 0.06], [17.2, 1.6, -5.1], glass, { cast: false });
  ctx.masterDoorPivot.position.set(16.4, 0, 8.2);
  const gdoor = box(ctx.masterDoorPivot, [1.6, 2.8, 0.12], [0.8, 1.5, 0], walnut, {
    data: { id: 'obj-master-door', name: 'Garden Pavilion Entry', type: 'door', description: 'Open the separate guest pavilion’s oak entrance from the stone garden walk.' }
  });
  ctx.interactive.push(gdoor); root.add(ctx.masterDoorPivot);
  box(root, [1.5, 0.08, 2.4], [12.4, 0.12, 1.5], lime, { cast: false });
  bed(furn, [17.2, 0.18, -1.0], 0, 1.5); bed(furn, [17.2, 0.18, 5.2], 0, 1.5);

  /* ------------------------------ garden, pool deck ------------------------------ */
  // century-old olive in the courtyard
  cyl(root, 0.34, 0.55, 3.5, [0.2, 2.1, 2.1], M('tree-bark'), 14).rotation.z = 0.05;
  for (let i = 0; i < 7; i++) {
    const a = i * 2.2;
    const c = organicCanopy(1.2 + (i % 3) * 0.3, M(i % 2 ? 'foliage-olive' : 'foliage-green'), 40 + i);
    c.position.set(0.2 + Math.sin(a) * 1.3, 4.0 + (i % 3) * 0.35, 2.1 + Math.cos(a) * 1.1); c.scale.set(1.2, 0.8, 1.05); root.add(c);
  }
  for (const [x, z, h] of [[-17, 8, 9], [-14, -2, 7], [23, -10, 9], [20, 12, 8], [-20, -12, 7], [-21, 14, 8.5]] as const) {
    cyl(root, 0.14, 0.22, h * 0.3, [x, h * 0.15, z], M('tree-bark'), 8);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(1.2, h * 0.9, 12), M('foliage-emerald'));
    cone.position.set(x, h * 0.62, z); cone.castShadow = true; root.add(cone);
  }
  tree(root, 15, 16, 0.9, 3); tree(root, -15, 15, 1.0, 5);
  for (let i = 0; i < 4; i++) {
    const x = -7.5 + i * 5;
    const l = new THREE.Group(); l.position.set(x, 0.14, -17.0); furn.add(l);
    box(l, [0.85, 0.1, 2.0], [0, 0.22, 0], M('black-steel'), { round: 0.01 });
    box(l, [0.8, 0.1, 1.2], [0, 0.32, 0.3], M('fabric-ivory'), { round: 0.04 });
    box(l, [0.8, 0.1, 0.9], [0, 0.55, -0.62], M('fabric-ivory'), { round: 0.04, rot: [0.7, 0, 0] });
  }
  for (const x of [-14, -10, -6, 10, 14]) { cyl(root, 0.42, 0.5, 0.55, [x, 0.4, 8.8], lime, 20); sph(root, 0.58, [x, 0.92, 8.8], M('foliage-green'), [1, 0.9, 1], 12); }
}
