import * as THREE from 'three';
import { MaterialsLibrary } from '../MaterialsLibrary';
import { addGround, addHills, buildPool, organicCanopy } from '../RealismKit';
import {
  BuildCtx, M, artFrame, barStool, bed, books, box, coffeeTable, cyl, diningChair, loungeChair, pendant, plant,
  rug, sofa, sph, table, tree, vase
} from '../SceneKit';

/**
 * Villa Lumina Azure — single-level Riviera pavilion on the Cap d'Antibes cliff (680 m²).
 * Layout follows the room cameras in properties.ts:
 *   entry court (z +8…+12), central salon with a real sunken lounge (0,-3.7) facing the sea (z −7.8),
 *   dining colonnade east of the salon, ocean master suite west, two garden suites south,
 *   kitchen at the east end, detached two-bedroom guest pavilion at x = 17.
 */
export function buildVillaLumina(ctx: BuildCtx) {
  const { root, furniture: furn } = ctx;
  const lime = M('travertine'), plaster = M('stucco-white'), oak = M('parquet-oak'), walnut = M('walnut');
  const brass = M('champagne-bronze'), glass = M('glass-facade'), roofM = M('roof-terracotta'), concrete = M('concrete');
  const gable = new THREE.MeshStandardMaterial({ color: 0xd8caba, roughness: 0.94, side: THREE.DoubleSide });
  const FL = 0.75;       // pavilion finished floor (raised plinth so the lounge can really sink)
  const PIT = 0.3;       // sunken lounge floor
  const TOP = 0.14;      // terrace level
  const floorSides = [lime, lime, oak, lime, lime, lime];

  if (ctx.root.parent) ctx.root.parent.userData.fogScale = 0.38; // long, clear Riviera distances

  /* ------------------------ headland, sea, terrace, hills ------------------------ */
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(1800, 1200), M('water-sea'));
  sea.rotation.x = -Math.PI / 2; sea.position.set(0, -2.2, -640); sea.userData.noShadow = true;
  root.add(sea);
  // cliff face with a gap for the private sea-access stair (x 14 → 18)
  box(root, [84, 7, 14], [-28, -3.5, -29], M('cliff-rock'), { cast: false });
  box(root, [52, 7, 14], [44, -3.5, -29], M('cliff-rock'), { cast: false });
  const T0 = -18, T1 = 15;
  const pool = buildPool(root, { x: 0, z: -12.6, width: 24.4, depth: 5.8, topY: TOP, infinityNorth: true, pitDepth: 1.6, coping: 0.6 });
  const g = addGround(root, [{ x: 0, z: (T0 + T1) / 2 - 40, w: 38, d: T1 - T0 }], -0.06, 124, 'dry-grass');
  g.position.z = 40;
  const th = 2.4, tc = TOP - th / 2, hole = pool.hole;
  box(root, [38, th, T1 - (hole.z + hole.d / 2)], [0, tc, (T1 + hole.z + hole.d / 2) / 2], lime, { cast: false });
  box(root, [38, th, (hole.z - hole.d / 2) - T0], [0, tc, (T0 + hole.z - hole.d / 2) / 2], lime, { cast: false });
  for (const s of [-1, 1]) box(root, [(38 - hole.w) / 2, th, hole.d], [s * (hole.w / 2 + (38 - hole.w) / 4), tc, hole.z], lime, { cast: false });
  addHills(root, { inner: 90, outer: 900, height: 160, sector: [-1.4, 1.4], seed: 9, y: -3 });

  /* ----------------- plinth with a genuinely sunken lounge ----------------- */
  const px0 = -3, px1 = 3, pz0 = -5.9, pz1 = -1.5; // sunken lounge footprint
  const plinth = (x0: number, x1: number, z0: number, z1: number) => box(root, [x1 - x0, FL + 0.15, z1 - z0], [(x0 + x1) / 2, (FL - 0.15) / 2, (z0 + z1) / 2], floorSides, { cast: false });
  plinth(-12.2, 12.2, -8.8, pz0); plinth(-12.2, 12.2, pz1, 9.7); plinth(-12.2, px0, pz0, pz1); plinth(px1, 12.2, pz0, pz1);
  box(root, [px1 - px0, PIT + 0.15, pz1 - pz0], [0, (PIT - 0.15) / 2, (pz0 + pz1) / 2], lime, { cast: false });
  for (let i = 0; i < 2; i++) box(root, [px1 - px0 - 1.4, 0.15, 0.4], [0, PIT + 0.15 * (i + 1) - 0.075, pz1 - 0.2 - (1 - i) * 0.4 + 0.2], lime, { cast: false }); // steps down
  box(root, [5.5, 0.03, 6.0], [0.2, FL + 0.015, 2.1], lime, { cast: false }); // courtyard paving

  /* ------------------------------ walls ------------------------------ */
  const WH = 4.0;
  const wing = (x: number, z: number, w: number, d: number) => box(root, [w, WH, d], [x, WH / 2, z], plaster);
  for (const [z, depth] of [[-7.14, 1.02], [-3.6, 1.15], [0.15, 1.45], [3.9, 1.15], [7.89, 1.92]] as const) { wing(-11.8, z, 0.35, depth); wing(11.8, z, 0.35, depth); }
  wing(11.8, 0.6, 0.35, 16.5); wing(-7.6, 8.7, 8.7, 0.35); wing(7.7, 8.7, 8.5, 0.35);
  wing(-3.9, -5.3, 0.22, 4.2); wing(3.9, -5.3, 0.22, 4.2);                              // stubs framing the central salon
  wing(-11.4, -7.5, 1.0, 0.35); wing(11.4, -7.5, 1.0, 0.35);                            // corner piers; the sea side is all glass
  box(root, [22.5, 3.2, 0.06], [0, FL + 1.6 + 0.0, -7.8], glass, { cast: false });
  for (const x of [-10.5, -6.5, -2.5, 2.5, 6.5, 10.5]) box(root, [0.11, 3.3, 0.16], [x, FL + 1.65, -7.75], brass);
  box(root, [22.8, 0.08, 0.2], [0, FL + 3.25, -7.75], brass);

  // ceilings under the wings + flat teak-soffit roof over the central salon (courtyard stays open to the sky)
  for (const cx of [-7.6, 7.7]) box(root, [8.8, 0.12, 17.8], [cx, 3.86, 0.6], plaster, { cast: false });
  const flat = (w: number, d: number, x: number, z: number) => box(root, [w, 0.24, d], [x, 3.96, z], [plaster, plaster, concrete, M('wood-slats'), plaster, plaster]);
  flat(6.8, 6.9, 0, -4.35); flat(6.8, 3.5, 0, 6.85); flat(0.85, 6.0, -2.975, 2.1); flat(0.45, 6.0, 3.175, 2.1);

  /* ------------------------ gabled terracotta roofs ------------------------ */
  for (const cx of [-7.6, 7.7]) {
    const sh = new THREE.Shape();
    sh.moveTo(-4.2, 0); sh.lineTo(4.2, 0); sh.lineTo(0, 1.55); sh.closePath();
    const gf = new THREE.Mesh(new THREE.ShapeGeometry(sh), gable); gf.position.set(cx, 3.72, 8.55); gf.castShadow = true; root.add(gf);
    const gb = gf.clone(); gb.position.z = -7.55; gb.rotation.y = Math.PI; root.add(gb);
    for (const side of [-1, 1]) {
      box(root, [4.5, 0.2, 18.4], [cx + side * 2.12, 4.68, 0.58], roofM, { rot: [0, 0, side < 0 ? 0.36 : -0.36] });
      box(root, [0.18, 0.24, 18.5], [cx + side * 4.12, 3.94, 0.58], lime);
    }
    const ridge = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 18.7, 10), roofM);
    ridge.rotation.x = Math.PI / 2; ridge.position.set(cx, 5.48, 0.58); ridge.castShadow = true; root.add(ridge);
  }

  /* ------------------- shuttered windows + loggia arches ------------------- */
  const shutter = new THREE.MeshStandardMaterial({ color: 0x4a5d4c, roughness: 0.78 });
  for (const side of [-1, 1]) for (const z of [-5.4, -1.8, 2.1, 5.7]) {
    box(root, [0.12, 2.0, 2.45], [side * 11.8, 2.5, z], glass, { cast: false });
    box(root, [0.35, 1.5, 2.45], [side * 11.8, 0.75, z], plaster);
    box(root, [0.35, 0.5, 2.45], [side * 11.8, 3.75, z], plaster);
    for (const o of [-1.48, 1.48]) {
      box(root, [0.1, 1.95, 0.5], [side * 12.0, 2.5, z + o], shutter);
      for (let s = 0; s < 5; s++) box(root, [0.05, 0.03, 0.42], [side * 12.08, 1.75 + s * 0.3, z + o], shutter, { rot: [0.5, 0, 0], cast: false });
    }
    box(root, [0.55, 0.16, 2.7], [side * 11.93, 1.5, z], lime);
  }
  for (let x = -10; x <= 10; x += 4) {
    cyl(root, 0.2, 0.24, 2.0, [x, FL + 1.0, 8.1], plaster, 16);
    if (x < 10) {
      const arch = new THREE.Mesh(new THREE.TorusGeometry(1.74, 0.13, 8, 24, Math.PI), plaster);
      arch.position.set(x + 2, FL + 2.0, 8.1); arch.castShadow = true; root.add(arch);
    }
  }

  /* --------------------- arrival: pivot door, portico, garden --------------------- */
  ctx.frontDoorPivot.position.set(-0.95, FL, 8.52);
  const door = box(ctx.frontDoorPivot, [1.9, 2.9, 0.16], [0.95, 1.45, 0], walnut, {
    data: { id: 'obj-front-door', name: 'Villa Lumina Pivot Entry', type: 'door', description: 'Open the white oak pivot door beneath the covered Mediterranean loggia.' }
  });
  box(ctx.frontDoorPivot, [0.05, 1.3, 0.1], [1.62, 1.45, 0.1], brass, { round: 0.015 });
  ctx.interactive.push(door);
  root.add(ctx.frontDoorPivot);
  for (const x of [-1.08, 1.08]) box(root, [0.16, 3.05, 0.22], [x, FL + 1.52, 8.52], lime);
  box(root, [2.32, 0.22, 0.24], [0, FL + 3.0, 8.52], lime);
  box(root, [2.0, 0.35, 0.1], [0, FL + 3.35, 8.45], plaster);
  for (let s = 0; s < 5; s++) box(root, [2.65 + s * 0.25, 0.12, 0.46], [0, FL - s * 0.12 - 0.06, 8.85 + 0.23 + s * 0.46], lime, { cast: false });
  box(root, [2.4, 0.06, 4.2], [0, TOP - 0.03, 12.9], lime, { cast: false });
  for (const side of [-1, 1]) {
    box(root, [3.6, 0.1, 6.2], [side * 4.0, TOP - 0.02, 12.0], M('gravel'), { cast: false });
    const lav = new THREE.MeshStandardMaterial({ color: 0x8173a6, roughness: 0.9 });
    for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) {
      const s = sph(root, 0.3, [side * (2.9 + c * 0.42), 0.44, 9.8 + r * 1.3], c % 2 ? M('foliage-olive') : lav, [1, 0.7, 0.9], 8);
      s.castShadow = false;
    }
    for (const z of [10.0, 12.0, 14.0]) cyl(root, 0.07, 0.09, 0.38, [side * 1.75, 0.3, z], brass, 10);
  }

  /* ---------------------- central salon: sunken lounge ---------------------- */
  const SL = PIT; // seat base level inside the pit
  rug(furn, [0, SL, -3.7], 4.6, 2.8);
  sofa(furn, [0, SL, -5.1], 0, 5.6, 'fabric-ivory', 'fabric-ivory', 'fabric-sofa');          // north bench faces the room
  sofa(furn, [-2.2, SL, -3.7], Math.PI / 2, 3.0, 'fabric-ivory', 'fabric-ivory', 'fabric-sofa');
  sofa(furn, [2.2, SL, -3.7], -Math.PI / 2, 3.0, 'fabric-ivory', 'fabric-ivory', 'fabric-sofa');
  box(furn, [1.5, 0.34, 1.0], [0, SL + 0.17, -3.7], lime, { round: 0.02 });                   // floor-recessed hearth table
  box(furn, [1.1, 0.03, 0.55], [0, SL + 0.36, -3.7], MaterialsLibrary.glowClone(), { cast: false }).userData.noShadow = true;
  books(furn, [-0.4, SL + 0.37, -3.9], 2); vase(furn, [0.45, SL + 0.37, -3.6], 0.22);
  const hit = box(furn, [6.0, 0.9, 4.2], [0, SL + 0.45, -3.7], M('fabric-ivory'), {
    cast: false, data: { id: 'room-villa-living', name: 'Sunken Sea Lounge', type: 'furniture', description: 'Limestone conversation pit with deep linen cushions and a direct view to the sea.' }
  });
  hit.visible = false; ctx.interactive.push(hit);
  const hl = new THREE.PointLight(0xff9a4a, 2.2, 7, 2); hl.position.set(0, SL + 0.9, -3.7); root.add(hl); ctx.lights.push(hl);
  loungeChair(furn, [8.2, FL, 1.2], Math.PI + 0.9);
  plant(furn, [-3.2, FL, -7.0], 1.8, 'ceramic-white', 11); plant(furn, [3.2, FL, -7.0], 1.6, 'ceramic-white', 12);
  ctx.livingLight.position.set(0, 3.3, -3.7);
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 12), MaterialsLibrary.glowClone());
  lamp.position.copy(ctx.livingLight.position); lamp.userData.noShadow = true; root.add(lamp); ctx.livingGlow = lamp;
  cyl(root, 0.006, 0.006, 0.6, [0, 3.65, -3.7], M('black-steel'), 4);

  /* ------------------------ dining colonnade (east) ------------------------ */
  const dTable = table(furn, [5.3, FL, -3.4], 1.5, 4.2, 0.78, 'parquet-oak', 'black-steel'); dTable.rotation.y = Math.PI / 2;
  const dHit = box(furn, [1.6, 0.2, 4.3], [5.3, FL + 0.78, -3.4], oak, {
    cast: false, data: { id: 'room-villa-dining', name: 'Terrace Dining Colonnade', type: 'furniture', description: 'Solid oak dining table under the shaded loggia.' }
  });
  dHit.visible = false; ctx.interactive.push(dHit);
  for (const z of [-5.0, -4.1, -3.2, -2.3, -1.4]) { diningChair(furn, [4.35, FL, z], Math.PI / 2); diningChair(furn, [6.25, FL, z], -Math.PI / 2); }
  diningChair(furn, [5.3, FL, -5.85], 0); diningChair(furn, [5.3, FL, -0.95], Math.PI);
  vase(furn, [5.3, FL + 0.78, -3.4], 0.32);
  ctx.diningLight.position.set(5.3, 3.0, -3.4);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.04, 10, 40), MaterialsLibrary.glowClone());
  ring.position.set(5.3, 3.25, -3.4); ring.rotation.x = Math.PI / 2;
  ring.userData = { noShadow: true, id: 'obj-villa-lights', name: 'Villa Lumina Pendant Lights', type: 'light', description: 'Warm brass pendant over the dining colonnade.' };
  root.add(ring); ctx.interactive.push(ring); ctx.diningGlow = ring;
  for (let i = 0; i < 6; i++) box(root, [6.6, 0.1, 0.12], [5.3, 3.62, -6.0 + i * 0.95], lime, { cast: true }); // limestone louvres
  box(furn, [1.2, 0.92, 2.2], [9.0, FL + 0.46, -6.2], M('steel-brushed'), { round: 0.02 });     // teppanyaki grill counter
  box(furn, [1.0, 0.03, 1.6], [9.0, FL + 0.94, -6.2], M('black-steel'));

  /* ------------------------------- kitchen (east end) ------------------------------- */
  const island = box(furn, [1.45, 0.06, 3.4], [9.0, FL + 0.93, -2.8], M('calacatta-marble'), {
    round: 0.012, data: { id: 'spot-villa-island', name: 'Honed Calacatta Island', type: 'appliance', description: 'Waterfall stone island facing the open kitchen.' }
  });
  ctx.interactive.push(island);
  box(furn, [1.2, 0.9, 3.4], [9.0, FL + 0.45, -2.8], walnut, { round: 0.015 });
  box(furn, [0.7, 3.0, 5.2], [11.15, FL + 1.5, -2.8], walnut, { round: 0.01 });
  box(furn, [0.8, 0.012, 1.25], [9.0, FL + 0.97, -2.6], M('black-steel'));
  for (let i = 0; i < 4; i++) barStool(furn, [7.9, FL, -4.1 + i * 0.9], 0.68);
  for (const dz of [-3.7, -2.8, -1.9]) pendant(ctx, root, [9.0, 3.8, dz], 1.2, 0.2);

  /* -------------------------------- ocean master suite -------------------------------- */
  rug(furn, [-7.0, FL, -4.9], 4.0, 3.4, true);
  bed(furn, [-7.0, FL, -5.4], 0, 2.1, { head: 'fabric-sofa' });
  box(furn, [1.8, 0.38, 0.5], [-7.0, FL + 0.22, -3.8], M('fabric-sofa'), { round: 0.05 });
  loungeChair(furn, [-10.0, FL, -1.4], Math.PI / 2 + 0.5);
  // open marble wet-room: freestanding tub, double vanity, rain shower behind glass
  box(furn, [1.8, 0.58, 0.85], [-10.6, FL + 0.29, -6.4], M('ceramic-white'), { round: 0.3 });
  box(furn, [2.4, 0.55, 0.6], [-10.9, FL + 0.28, -3.2], walnut, { round: 0.01 });
  box(furn, [2.5, 0.04, 0.64], [-10.9, FL + 0.57, -3.2], M('calacatta-marble'), { round: 0.006 });
  box(furn, [1.8, 1.0, 0.03], [-11.5, FL + 1.55, -3.2], M('mirror'));
  box(furn, [0.04, 2.3, 1.7], [-9.3, FL + 1.15, -4.7], glass, { cast: false });
  cyl(furn, 0.12, 0.12, 0.03, [-9.8, FL + 2.2, -4.7], brass, 16);
  // outdoor rain shower on the pool deck + step-out
  cyl(root, 0.025, 0.025, 2.3, [-8.5, TOP + 1.15, -9.4], brass, 8);
  box(root, [1.6, 0.04, 0.04], [-8.5, TOP + 2.3, -9.4], brass, { cast: false });
  box(root, [1.4, 2.1, 0.04], [-8.5, TOP + 1.05, -9.0], glass, { cast: false });
  artFrame(root, [-7.0, FL + 1.9, -7.2], 1.4, 0.9, 2, 0);

  /* ----------------------------- garden suites (south wings) ----------------------------- */
  const suites: Array<[number, number, number, number]> = [[-8.2, 4.0, 1.7, 0], [8.2, 4.0, 1.7, 1]];
  suites.forEach(([x, z, w, i]) => { rug(furn, [x, FL, z + 0.2], w + 1.5, 3.0, !!i); bed(furn, [x, FL, z], 0, w, { head: i ? 'fabric-ivory' : 'fabric-sofa' }); });
  plant(furn, [-10.4, FL, 7.2], 1.6, 'ceramic-white', 13); plant(furn, [10.4, FL, 7.2], 1.5, 'ceramic-white', 14);
  plant(furn, [0.2, FL + 0.03, 5.6], 1.2, 'ceramic-white', 15);

  /* ---------------------------------- olive courtyard ---------------------------------- */
  cyl(root, 0.34, 0.55, 3.5, [0.2, FL + 1.75, 2.1], M('tree-bark'), 12).rotation.z = 0.05;
  for (let i = 0; i < 6; i++) {
    const a = i * 2.2;
    const c = organicCanopy(1.2 + (i % 3) * 0.3, M(i % 2 ? 'foliage-olive' : 'foliage-green'), 40 + i, 1);
    c.position.set(0.2 + Math.sin(a) * 1.3, FL + 3.4 + (i % 3) * 0.35, 2.1 + Math.cos(a) * 1.1); c.scale.set(1.2, 0.8, 1.05); root.add(c);
  }

  /* ------------------------ detached two-bedroom guest pavilion ------------------------ */
  const GF = 0.18;
  box(root, [8.5, 0.16, 13.5], [17.2, 0.1, 1.5], [lime, lime, oak, lime, lime, lime], { cast: false });
  box(root, [8.4, 0.1, 13.4], [17.2, 3.5, 1.5], plaster, { cast: false });                  // ceiling
  for (const [x, z, w, d] of [[13.0, 1.5, 0.22, 13.5], [21.4, 1.5, 0.22, 13.5], [17.2, -5.2, 8.5, 0.22], [14.75, 8.2, 3.4, 0.22], [19.65, 8.2, 3.5, 0.22]] as const) box(root, [w, 3.4, d], [x, 2.0, z], plaster);
  box(root, [1.7, 0.4, 0.22], [17.2, 3.2, 8.2], plaster);
  box(root, [0.18, 3.2, 8.2], [17.2, 1.8, -1.1], plaster);                                    // party wall between the two bedrooms
  const gs = new THREE.Shape(); gs.moveTo(-4.25, 0); gs.lineTo(4.25, 0); gs.lineTo(0, 1.2); gs.closePath();
  const gg = new THREE.Mesh(new THREE.ShapeGeometry(gs), gable); gg.position.set(17.2, 3.7, 8.32); root.add(gg);
  const gg2 = gg.clone(); gg2.position.z = -5.33; gg2.rotation.y = Math.PI; root.add(gg2);
  for (const side of [-1, 1]) box(root, [4.65, 0.2, 14.2], [17.2 + side * 2.18, 4.22, 1.5], roofM, { rot: [0, 0, side < 0 ? 0.35 : -0.35] });
  const gr = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 14.4, 10), roofM); gr.rotation.x = Math.PI / 2; gr.position.set(17.2, 5.02, 1.5); root.add(gr);
  box(root, [8.1, 2.45, 0.06], [17.2, 1.6, -5.1], glass, { cast: false });
  ctx.masterDoorPivot.position.set(16.4, GF, 8.2);
  const gdoor = box(ctx.masterDoorPivot, [1.6, 2.8, 0.12], [0.8, 1.4, 0], walnut, {
    data: { id: 'obj-master-door', name: 'Garden Pavilion Entry', type: 'door', description: 'Open the separate guest pavilion’s oak entrance from the stone garden walk.' }
  });
  ctx.interactive.push(gdoor); root.add(ctx.masterDoorPivot);
  box(root, [1.5, 0.08, 2.4], [12.4, TOP - 0.02, 1.5], lime, { cast: false });
  rug(furn, [15.1, GF, 0.3], 3.2, 3.0); bed(furn, [15.1, GF, 0.2], 0, 1.6);
  rug(furn, [19.3, GF, 0.3], 3.2, 3.0, true); bed(furn, [19.3, GF, 0.2], 0, 1.6, { head: 'fabric-ivory' });
  box(furn, [1.6, 0.5, 0.55], [15.1, GF + 0.25, -4.7], walnut, { round: 0.01 }); box(furn, [1.6, 0.5, 0.55], [19.3, GF + 0.25, -4.7], walnut, { round: 0.01 });
  plant(furn, [13.8, GF, 7.2], 1.4, 'ceramic-white', 16);

  /* ------------------ cliff-side: wine cave, sea path, fire lounge ------------------ */
  // 600-bottle wine cave behind a stone arch in the terrace face
  box(root, [2.4, 2.5, 0.14], [-9, 1.0, T0 - 0.05], M('black-steel'), { cast: false });
  const caveArch = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.16, 8, 24, Math.PI), lime);
  caveArch.position.set(-9, 2.1, T0 - 0.08); root.add(caveArch);
  for (const x of [-10.3, -7.7]) box(root, [0.3, 2.3, 0.3], [x, 1.0, T0 - 0.1], lime);
  box(root, [2.0, 2.0, 0.04], [-9, 1.0, T0 - 0.15], MaterialsLibrary.glowClone(), { cast: false }).userData.noShadow = true;
  for (let r = 0; r < 5; r++) box(root, [1.8, 0.05, 0.05], [-9, 0.3 + r * 0.38, T0 - 0.17], M('walnut'), { cast: false });
  // private stair to the sea (cut through the cliff gap)
  for (let i = 0; i < 12; i++) box(root, [3.2, 0.3, 1.0], [16, -0.2 - i * 0.18, -22.5 - i * 1.0], lime, { cast: false });
  box(root, [5.0, 0.3, 4.0], [16, -2.2, -35.5], lime, { cast: false });                       // landing / jetty
  for (const x of [14.4, 17.6]) { box(root, [0.05, 0.9, 12.5], [x, -1.4, -28.0], M('black-steel'), { cast: false, rot: [0.15, 0, 0] }); }
  // sunken fire lounge, west of the pool
  const fx = -16, fz = -12.5;
  cyl(root, 2.5, 2.5, 0.2, [fx, TOP + 0.1, fz], lime, 28);
  cyl(root, 0.85, 0.85, 0.34, [fx, TOP + 0.37, fz], lime, 20);
  cyl(root, 0.6, 0.6, 0.05, [fx, TOP + 0.56, fz], MaterialsLibrary.glowClone(), 20).userData.noShadow = true;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    box(furn, [1.5, 0.42, 0.6], [fx + Math.sin(a) * 1.8, TOP + 0.41, fz + Math.cos(a) * 1.8], lime, { round: 0.03, rot: [0, a, 0] });
    box(furn, [1.35, 0.1, 0.5], [fx + Math.sin(a) * 1.8, TOP + 0.66, fz + Math.cos(a) * 1.8], M('fabric-ivory'), { round: 0.04, rot: [0, a, 0] });
  }
  const fire = new THREE.PointLight(0xff8a3a, 3, 8, 2); fire.position.set(fx, 1.0, fz); root.add(fire); ctx.lights.push(fire);

  /* ------------------------------------ pool deck, garden ------------------------------------ */
  for (let i = 0; i < 4; i++) {
    const x = -7.5 + i * 5;
    const l = new THREE.Group(); l.position.set(x, TOP, -17.0); furn.add(l);
    box(l, [0.85, 0.1, 2.0], [0, 0.22, 0], M('black-steel'), { round: 0.01 });
    box(l, [0.8, 0.1, 1.2], [0, 0.32, 0.3], M('fabric-ivory'), { round: 0.04 });
    box(l, [0.8, 0.1, 0.9], [0, 0.55, -0.62], M('fabric-ivory'), { round: 0.04, rot: [0.7, 0, 0] });
  }
  for (const [x, z, h] of [[-17, 8, 9], [-14, -2, 7], [23, -10, 9], [20, 12, 8], [-20, 14, 8.5]] as const) {
    cyl(root, 0.14, 0.22, h * 0.3, [x, h * 0.15, z], M('tree-bark'), 8);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(1.2, h * 0.9, 9), M('foliage-emerald'));
    cone.position.set(x, h * 0.62, z); cone.castShadow = true; root.add(cone);
  }
  tree(root, 15, 16, 0.9, 3); tree(root, -15, 15, 1.0, 5);
  for (const x of [-14, -10, -6, 10, 14]) { cyl(root, 0.42, 0.5, 0.55, [x, 0.4, 8.8], lime, 16); sph(root, 0.58, [x, 0.92, 8.8], M('foliage-green'), [1, 0.9, 1], 10); }
}
