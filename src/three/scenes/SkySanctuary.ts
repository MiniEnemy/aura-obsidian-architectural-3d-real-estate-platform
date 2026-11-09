import * as THREE from 'three';
import { buildManhattan } from '../CityKit';
import { MaterialsLibrary } from '../MaterialsLibrary';
import { organicCanopy } from '../RealismKit';
import {
  BuildCtx, M, artFrame, barStool, bed, books, box, coffeeTable, curtain, cyl, diningChair, loungeChair, pendant, plant,
  rug, sofa, sph, table, vase
} from '../SceneKit';

/**
 * The Sky Sanctuary Penthouse — duplex on levels 72/73 of a slender tower (432 Park Ave), 800 ft above Midtown.
 * Layout follows the room cameras in properties.ts:
 *   L72 (y=0):  great room + open kitchen + dining; private elevator vestibule at the south-west.
 *   L73 (y=4):  master suite (west), east guest suite (north), south guest suite, open-sky planted loggia (south).
 */
export function buildSkySanctuary(ctx: BuildCtx) {
  const { root, furniture: furn } = ctx;
  const oak = M('white-oak'), plaster = M('stucco-white'), glass = M('glass-facade'), rail = M('glass-balustrade');
  const brass = M('champagne-bronze'), bronze = M('dark-bronze'), marble = M('calacatta-marble'), concrete = M('concrete');
  const floorOak = M('parquet-oak');
  const slab = (top: THREE.Material): THREE.Material[] => [plaster, plaster, top, plaster, plaster, plaster];
  const F1 = 4.0; // level 73 finished floor (elevation from properties.ts)

  // a 244 m-high view needs a long, hazy atmosphere (fog is scaled per property in setPreset)
  if (ctx.root.parent) ctx.root.parent.userData.fogScale = 0.26;

  /* ============================ shell ============================ */
  box(root, [22, 0.3, 18], [0, -0.15, 0], slab(floorOak), { cast: false });
  box(root, [22, 0.42, 18], [0, 7.58, 0], [plaster, plaster, concrete, plaster, plaster, plaster], { cast: false });
  box(root, [21.5, 7.2, 0.08], [0, 3.6, -8.92], glass, { cast: false });
  box(root, [21.5, 4.0, 0.08], [0, 2.0, 8.92], glass, { cast: false });           // south, level 72
  box(root, [8.8, 3.2, 0.08], [-6.35, 5.6, 8.92], glass, { cast: false });        // south, level 73 master side only
  box(root, [0.08, 7.1, 17.4], [-10.76, 3.58, 0], glass, { cast: false });
  box(root, [0.08, 7.1, 17.4], [10.76, 3.58, 0], glass, { cast: false });
  for (const z of [-8.78, 8.78]) {
    for (const y of [0.22, 3.8, 7.34]) box(root, [21.8, 0.28, 0.34], [0, y, z], concrete);
    for (const x of [-9.6, -6.4, -3.2, 0, 3.2, 6.4, 9.6]) if (z < 0 || x < -2 || x > 9) box(root, [0.22, 7.2, 0.34], [x, 3.6, z], concrete);
  }
  for (const x of [-10.7, 10.7]) {
    for (const y of [0.22, 3.8, 7.34]) box(root, [0.34, 0.28, 18], [x, y, 0], concrete);
    for (const z of [-8.65, -5.78, -2.9, 0, 2.9, 5.78, 8.65]) box(root, [0.34, 7.2, 0.22], [x, 3.6, z], concrete);
  }
  for (const x of [-10.85, -7.2, -3.6, 0, 3.6, 7.2, 10.85]) { box(root, [0.095, 7.2, 0.12], [x, 3.6, -8.88], bronze); if (x < 0) box(root, [0.095, 7.2, 0.12], [x, 3.6, 8.88], bronze); }
  for (const y of [1.25, 3.6, 5.95]) box(root, [21.5, 0.065, 0.12], [0, y, -8.88], bronze);
  box(root, [21.5, 0.065, 0.12], [0, 1.25, 8.88], bronze);

  /* ======================= level 73 plate with stairwell ======================= */
  // plate z 0.75 → 8.75; stair slot x −10.45 → −9.25, z 0.75 → 6.5
  const plateY = F1 - 0.17;
  box(root, [20.0, 0.34, 8.0], [0.75, plateY, 4.75], slab(oak), { cast: false });            // x −9.25 … 10.75
  box(root, [0.3, 0.34, 8.0], [-10.6, plateY, 4.75], slab(oak), { cast: false });             // x −10.75 … −10.45
  box(root, [1.2, 0.34, 2.25], [-9.85, plateY, 7.625], slab(oak), { cast: false });           // landing z 6.5 … 8.75
  const guard = (x: number, z: number, w: number, d: number, y = F1) => {
    box(root, [w, 1.05, d], [x, y + 0.55, z], rail, { cast: false });
    box(root, [Math.max(w, 0.06), 0.045, Math.max(d, 0.06)], [x, y + 1.08, z], brass, { cast: false });
  };
  guard(-4.3, 0.78, 9.9, 0.04); guard(5.5, 0.78, 10.5, 0.04);     // balcony edge over the great room
  guard(-9.25, 3.6, 0.04, 5.7); guard(-10.45, 3.6, 0.04, 5.7);     // stair slot

  // floating oak stair rising south through the slot (23 risers)
  const rise = F1 / 23, run = 0.26;
  for (let i = 0; i < 23; i++) box(root, [1.2, 0.12, 0.34], [-9.85, (i + 1) * rise - 0.06, 0.5 + i * run], oak, { round: 0.01 });

  /* ===================== level 73 partitions (full height) ===================== */
  const uw = (x: number, z: number, w: number, d: number) => box(root, [w, 2.95, d], [x, F1 + 1.48, z], plaster);
  uw(-8.1, 1.18, 3.3, 0.16); uw(-4.2, 1.18, 3.7, 0.16);                                         // master north wall (door gap)
  uw(-1.95, 4.75, 0.16, 6.0);                                                                    // master | gallery
  uw(1.7, 1.7, 0.16, 0.9); uw(1.7, 4.57, 0.16, 1.84); uw(1.7, 7.57, 0.16, 1.26);                 // gallery | guest suites
  uw(6.1, 4.5, 8.7, 0.16); uw(6.1, 7.4, 8.7, 0.16);                                              // suite split + bath wall

  // private elevator vestibule + interactive door (L72)
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
  box(furn, [2.1, 0.82, 0.62], [-4.9, 0.41, 8.3], marble, { round: 0.015 });
  vase(furn, [-4.9, 0.82, 8.3], 0.34);
  artFrame(root, [-4.9, 1.9, 8.75], 1.4, 1.0, 1, Math.PI);

  /* =============================== great room =============================== */
  rug(furn, [-3, 0, -4.4], 6.4, 4.4);
  sofa(furn, [-3, 0, -2.3], Math.PI, 4.8);
  const sHit = box(furn, [4.8, 0.9, 1.2], [-3, 0.45, -2.3], M('fabric-sofa'), {
    cast: false, data: { id: 'room-sky-great', name: 'Double-Height Great Room', type: 'furniture', description: 'A broad city-view salon with a tailored sectional and white-oak floor.' }
  });
  sHit.visible = false; ctx.interactive.push(sHit);
  coffeeTable(furn, [-3, 0, -4.3], 2.3, 1.15, 'calacatta-marble');
  books(furn, [-3.6, 0.415, -4.3], 4); vase(furn, [-2.4, 0.415, -4.2]);
  loungeChair(furn, [-6.5, 0, -4.4], Math.PI / 2 + 0.2);
  loungeChair(furn, [0.5, 0, -4.4], -Math.PI / 2 - 0.2, 'leather-cognac');
  box(furn, [0.55, 0.5, 0.55], [-6.4, 0.25, -2.6], marble, { round: 0.02 });
  plant(furn, [-9.4, 0, -7.6], 2.2, 'ceramic-white', 21); plant(furn, [9.4, 0, -7.6], 2.0, 'ceramic-white', 22);
  plant(furn, [-0.3, 0, 7.8], 1.7, 'ceramic-white', 24);
  curtain(root, [-10.0, 7.0, -8.7], 1.6, 6.9, 3, 0.07);
  ctx.livingLight.position.set(-3, 6.0, -4.3);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.07, 12, 40), MaterialsLibrary.glowClone());
  ring.position.copy(ctx.livingLight.position); ring.rotation.x = Math.PI / 2;
  ring.userData = { noShadow: true, id: 'obj-sky-chandelier', name: 'Bronze Ring Chandelier', type: 'light', description: 'Sculptural suspended light above the double-height salon.' };
  root.add(ring); ctx.interactive.push(ring); ctx.livingGlow = ring;
  for (const a of [0, 2.1, 4.2]) cyl(root, 0.004, 0.004, 1.5, [-3 + Math.sin(a) * 1.1, 6.85, -4.3 + Math.cos(a) * 1.1], M('black-steel'), 4);

  /* ============================= kitchen (open) ============================= */
  const island = box(furn, [1.65, 0.96, 4.0], [2.7, 0.48, -4.0], marble, {
    round: 0.012, data: { id: 'spot-sky-island', name: 'Calacatta Monolith Kitchen', type: 'appliance', description: 'Waterfall marble island with an integrated induction surface.' }
  });
  ctx.interactive.push(island);
  box(furn, [0.82, 0.012, 1.4], [2.55, 0.98, -3.6], M('black-steel'));
  for (let i = 0; i < 4; i++) barStool(furn, [4.0, 0, -5.4 + i * 1.15], 0.68, 'fabric-sofa');
  box(root, [6.4, 3.3, 0.2], [3.4, 1.65, -6.9], plaster);
  box(furn, [6.2, 0.88, 0.66], [3.4, 0.44, -6.55], oak, { round: 0.01 });
  box(furn, [6.2, 0.04, 0.7], [3.4, 0.9, -6.55], marble, { round: 0.006 });
  box(furn, [6.2, 1.1, 0.01], [3.4, 1.5, -6.78], marble, { cast: false });
  box(furn, [0.9, 2.5, 0.66], [0.55, 1.25, -6.55], M('steel-brushed'), { round: 0.01 });
  box(furn, [0.9, 2.5, 0.66], [1.5, 1.25, -6.55], M('steel-brushed'), { round: 0.01 });
  for (const x of [2.7, 4.0, 5.3]) box(furn, [1.2, 0.9, 0.38], [x, 2.35, -6.7], oak, { round: 0.01 });
  box(furn, [0.9, 0.12, 0.55], [3.4, 1.9, -6.55], M('black-steel'));
  for (const dz of [-5.0, -4.0, -3.0]) pendant(ctx, root, [2.7, 3.7, dz], 3.1, 0.22);
  ctx.diningLight.position.set(2.0, 3.0, 1.4);

  /* ================================ dining ================================ */
  const dTop = table(furn, [2.0, 0, 1.5], 1.2, 3.0, 0.78, 'white-oak', 'black-steel'); dTop.rotation.y = Math.PI / 2;
  const dHit = box(furn, [1.3, 0.2, 3.1], [2.0, 0.78, 1.5], oak, { cast: false, data: { id: 'room-sky-dining', name: 'Sky Dining Room', type: 'furniture', description: 'A private dining table between the elevator vestibule and the salon.' } });
  dHit.visible = false; ctx.interactive.push(dHit);
  for (const z of [0.3, 1.5, 2.7]) { diningChair(furn, [1.15, 0, z], Math.PI / 2, 'fabric-ivory', 'white-oak'); diningChair(furn, [2.85, 0, z], -Math.PI / 2, 'fabric-ivory', 'white-oak'); }
  vase(furn, [2.0, 0.78, 1.5], 0.32);
  const dl = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.06, 28), MaterialsLibrary.glowClone());
  dl.position.set(2.0, 3.0, 1.5); dl.userData.noShadow = true; root.add(dl); ctx.diningGlow = dl;
  cyl(root, 0.004, 0.004, 4.5, [2.0, 5.25, 1.5], M('black-steel'), 4);
  const fl = new THREE.PointLight(0xffdca0, 5, 12, 2); fl.position.set(-2, 3.0, -2); root.add(fl); ctx.lights.push(fl);
  const fl2 = new THREE.PointLight(0xffdca0, 4, 10, 2); fl2.position.set(6, F1 + 2.4, 4.5); root.add(fl2); ctx.lights.push(fl2);

  /* ================================ level 73 ================================ */
  rug(furn, [-6.2, F1, 5.3], 4.2, 3.6, true);
  bed(furn, [-6.2, F1, 5.3], -Math.PI / 2, 2.1);
  box(furn, [0.5, 0.38, 1.9], [-8.55, F1 + 0.22, 5.3], M('fabric-sofa'), { round: 0.05 });
  box(furn, [1.75, 0.58, 0.82], [-7.4, F1 + 0.29, 2.2], M('ceramic-white'), { round: 0.28 });
  box(furn, [2.8, 0.55, 0.64], [-5.2, F1 + 0.3, 8.35], marble, { round: 0.01 });
  box(furn, [0.07, 2.2, 1.8], [-5.2, F1 + 1.1, 3.0], glass, { cast: false });
  loungeChair(furn, [-8.4, F1, 7.6], Math.PI + 0.7);
  plant(furn, [-3.0, F1, 8.2], 1.5, 'ceramic-white', 23);
  artFrame(root, [-3.0, F1 + 1.6, 4.4], 1.3, 0.9, 3, Math.PI / 2);
  box(furn, [3.6, 2.6, 0.55], [-4.2, F1 + 1.3, 1.55], oak, { round: 0.01 });
  box(furn, [0.4, 0.8, 2.0], [0.0, F1 + 0.4, 4.9], marble, { round: 0.015 });
  artFrame(root, [-1.85, F1 + 1.7, 4.8], 1.3, 0.9, 2, Math.PI / 2);
  rug(furn, [6.1, F1, 2.9], 3.6, 3.0); bed(furn, [6.1, F1, 2.9], -Math.PI / 2, 1.7);
  rug(furn, [6.1, F1, 6.25], 3.6, 3.0, true); bed(furn, [6.1, F1, 6.25], -Math.PI / 2, 1.7, { head: 'fabric-ivory' });
  box(furn, [1.8, 0.04, 0.6], [8.9, F1 + 0.74, 1.3], oak, { round: 0.01 });
  box(furn, [0.05, 0.72, 0.5], [8.1, F1 + 0.37, 1.3], M('black-steel')); box(furn, [0.05, 0.72, 0.5], [9.7, F1 + 0.37, 1.3], M('black-steel'));
  diningChair(furn, [8.9, F1, 2.0], Math.PI, 'fabric-sofa', 'black-steel');
  plant(furn, [10.0, F1, 4.2], 1.5, 'ceramic-white', 25);
  artFrame(root, [10.65, F1 + 1.6, 6.3], 1.2, 0.9, 0, -Math.PI / 2);

  /* ========================= open-sky planted loggia ========================= */
  box(root, [12.8, 0.34, 2.9], [4.35, F1 - 0.17, 10.2], slab(oak), { cast: false });
  box(root, [12.2, 0.12, 1.5], [4.35, F1 + 0.06, 10.55], M('lawn'), { cast: false });
  box(root, [12.8, 1.05, 0.06], [4.35, F1 + 0.53, 11.62], rail, { cast: false });
  box(root, [12.8, 0.05, 0.08], [4.35, F1 + 1.06, 11.62], brass, { cast: false });
  box(root, [0.06, 1.05, 2.9], [10.75, F1 + 0.53, 10.2], rail, { cast: false });
  for (const x of [-1.0, 3.0, 7.0, 9.8]) {
    box(root, [1.2, 0.52, 0.56], [x, F1 + 0.26, 10.8], plaster, { round: 0.02 });
    sph(root, 0.46, [x, F1 + 0.95, 10.8], M('foliage-emerald'), [1, 0.85, 0.92], 12);
  }
  cyl(root, 0.1, 0.16, 1.7, [9.1, F1 + 0.85, 9.5], M('tree-bark'), 10);
  const oc = organicCanopy(0.95, M('foliage-olive'), 5, 1); oc.position.set(9.1, F1 + 1.95, 9.5); root.add(oc);
  table(furn, [3.0, F1, 9.9], 0.7, 0.7, 0.72, 'black-steel', 'black-steel');
  for (const [dx, ry] of [[-0.75, Math.PI / 2], [0.75, -Math.PI / 2]] as const) diningChair(furn, [3.0 + dx, F1, 9.9], ry, 'fabric-sofa', 'black-steel');
  box(furn, [2.2, 0.4, 0.9], [6.2, F1 + 0.2, 9.4], M('fabric-ivory'), { round: 0.05 });
  box(furn, [2.2, 0.5, 0.2], [6.2, F1 + 0.55, 9.05], M('fabric-ivory'), { round: 0.05 });

  /* ================================ Manhattan ================================ */
  buildManhattan(root, { towerHalf: [10.8, 8.95] });
}
