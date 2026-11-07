import * as THREE from 'three';
import { MaterialsLibrary } from '../MaterialsLibrary';
import { addDriveway, addGround, addHills, buildPool } from '../RealismKit';
import {
  BuildCtx, M, V3, addCollider, artFrame, barStool, bed, books, box, coffeeTable, coupe, curtain, cyl, diningChair,
  loungeChair, pendant, plant, rug, sofa, sph, table, tree, vase
} from '../SceneKit';

const F0 = 0.12; // ground floor finished level
const F1 = 3.75; // upper floor finished level

export function buildObsidianPavilion(ctx: BuildCtx) {
  const { root, furniture: furn } = ctx;
  const stucco = M('stucco-white'), cedar = M('wood-slats'), oak = M('parquet-oak'), trav = M('travertine');
  const bronze = M('dark-bronze'), brass = M('champagne-bronze'), glass = M('glass-facade'), rail = M('glass-balustrade');
  const marble = M('calacatta-marble'), walnut = M('walnut'), concrete = M('concrete'), paint = M('paint-white');
  const glowMat = M('glow-warm');
  // [+x, -x, +y, -y, +z, -z]
  const slab = (top: THREE.Material): THREE.Material[] => [stucco, stucco, top, stucco, stucco, stucco];

  /* ============================ SITE ============================ */
  const pool = buildPool(root, { x: 0, z: -12.6, width: 17, depth: 5.4, topY: 0.1, infinityNorth: true });
  addGround(root, [pool.hole]);
  addHills(root, { inner: 90, outer: 520, height: 95, seed: 4 });
  addDriveway(root, -8, 11, 36, 7);
  // podium + rear deck at pool level
  box(root, [24, 0.2, 20.1], [0, 0, 0.95], trav, { cast: false });
  box(root, [26, 0.2, 4.6], [0, 0, -18.4], trav, { cast: false });
  box(root, [3.0, 0.2, 5.4 + 1.6 + 1.0], [-13.5, 0, -12.6], trav, { cast: false });
  box(root, [3.0, 0.2, 5.4 + 1.6 + 1.0], [13.5, 0, -12.6], trav, { cast: false });
  // entry path + guide lights
  box(root, [2.2, 0.06, 12], [0.9, -0.01, 17], trav, { cast: false });
  for (let z = 12.5; z <= 22; z += 2.4) {
    cyl(root, 0.045, 0.055, 0.42, [-0.5, 0.2, z], brass, 12);
    const g = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), M('glow-warm'));
    g.position.set(-0.5, 0.43, z); g.userData.noShadow = true; root.add(g);
  }

  /* ========================= SHELL / FLOORS ========================= */
  box(root, [21.5, 0.12, 18], [0, 0.06, 0.5], slab(oak), { cast: false });
  // entry hall: travertine with brass threshold inlay
  box(root, [6.4, 0.012, 5.4], [0, F0 + 0.004, 6.8], trav, { cast: false });
  box(root, [6.4, 0.016, 0.025], [0, F0 + 0.006, 4.1], brass, { cast: false });
  // garage: polished concrete
  box(root, [7.75, 0.012, 5.8], [-6.9, F0 + 0.004, 6.35], concrete, { cast: false });

  // west wall: cedar outside, plaster inside. east wall: plaster.
  box(root, [0.5, 6.8, 18], [-11, 3.4, 0.5], [stucco, cedar, stucco, stucco, stucco, stucco]);
  box(root, [0.5, 6.8, 18], [11, 3.4, 0.5], stucco);
  // rear piers beside the glass wall
  box(root, [0.75, 6.8, 0.4], [-10.625, 3.4, -8.5], stucco);
  box(root, [0.75, 6.8, 0.4], [10.625, 3.4, -8.5], stucco);

  // roof: concrete top, cedar-slat soffit (reads as a timber ceiling inside + overhang)
  box(root, [26, 0.45, 22], [0, 6.9, 0.5], [stucco, stucco, concrete, cedar, stucco, stucco]);
  // metal roof edge flashing
  box(root, [26.1, 0.14, 0.12], [0, 7.18, 11.5], bronze);
  box(root, [26.1, 0.14, 0.12], [0, 7.18, -10.5], bronze);
  box(root, [0.12, 0.14, 22.1], [-13, 7.18, 0.5], bronze);
  box(root, [0.12, 0.14, 22.1], [13, 7.18, 0.5], bronze);
  // PV array
  for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) {
    box(root, [2.6, 0.05, 1.8], [-8 + i * 3.1, 7.45, -4 + j * 3.2], new THREE.MeshPhysicalMaterial({ color: 0x0f1a2a, metalness: 0.4, roughness: 0.22, clearcoat: 1 }), { rot: [0.18, 0, 0] });
  }
  // recessed downlights under front overhang
  for (let x = -9; x <= 9; x += 3) {
    const d = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 16), glowMat);
    d.position.set(x, 6.65, 10.4); d.userData.noShadow = true; root.add(d);
  }

  /* ========================= FRONT FACADE ========================= */
  // garage block (cedar) with a framed glass overhead door
  box(root, [0.8, 6.8, 0.5], [-10.6, 3.4, 9.5], [stucco, stucco, stucco, stucco, cedar, stucco]);
  box(root, [1.0, 6.8, 0.5], [-3.5, 3.4, 9.5], [stucco, stucco, stucco, stucco, cedar, stucco]);
  box(root, [6.2, 3.7, 0.5], [-7.1, 4.95, 9.5], [stucco, stucco, stucco, stucco, cedar, stucco]);
  box(root, [6.2, 3.0, 0.06], [-7.1, 1.62, 9.42], glass, { cast: false });
  for (let i = 0; i <= 4; i++) box(root, [6.3, 0.07, 0.12], [-7.1, 0.2 + i * 0.75, 9.45], bronze);
  for (const x of [-10.2, -8.65, -7.1, -5.55, -4.0]) box(root, [0.07, 3.1, 0.12], [x, 1.67, 9.45], bronze);

  // entrance: bronze frame + timber pivot door + transom
  ctx.frontDoorPivot.position.set(0, 0, 9.5);
  const door = box(ctx.frontDoorPivot, [1.8, 3.1, 0.1], [0.9, 1.67, 0], cedar, {
    data: { id: 'obj-front-door', name: 'Grand Timber Pivot Entrance Door', type: 'door', description: 'Solid teak vertical slat pivot entry door with brushed champagne brass pull.' }
  });
  box(ctx.frontDoorPivot, [0.04, 1.5, 0.07], [1.6, 1.45, 0.08], brass, { round: 0.015 });
  box(ctx.frontDoorPivot, [0.04, 1.5, 0.07], [1.6, 1.45, -0.08], brass, { round: 0.015 });
  ctx.interactive.push(door);
  root.add(ctx.frontDoorPivot);
  box(root, [0.1, 3.3, 0.22], [-0.05, 1.77, 9.5], bronze);
  box(root, [0.1, 3.3, 0.22], [1.85, 1.77, 9.5], bronze);
  box(root, [1.9, 0.1, 0.22], [0.9, 3.37, 9.5], bronze);
  // curtain wall: left of door, right of door, transom
  box(root, [2.9, 6.4, 0.06], [-1.55, 3.32, 9.5], glass, { cast: false });
  box(root, [9.1, 6.4, 0.06], [6.45, 3.32, 9.5], glass, { cast: false });
  box(root, [1.8, 3.0, 0.06], [0.9, 4.9, 9.5], glass, { cast: false });
  for (const x of [-3, 1.85, 3.4, 4.9, 6.4, 7.9, 9.4, 10.9]) box(root, [0.1, 6.4, 0.2], [x, 3.32, 9.5], bronze);
  for (const y of [3.62, 5.3]) box(root, [14, y === 3.62 ? 0.28 : 0.07, 0.22], [4, y, 9.5], y === 3.62 ? stucco : bronze);

  /* ======================= REAR GLASS WALL ======================= */
  box(root, [20, 6.4, 0.06], [0, 3.32, -8.5], glass, { cast: false });
  for (let x = -10; x <= 10; x += 2.5) box(root, [0.1, 6.4, 0.2], [x, 3.32, -8.5], bronze);
  box(root, [20.2, 0.28, 0.24], [0, 3.62, -8.5], bronze);
  for (const y of [1.2, 5.3]) box(root, [20, 0.06, 0.16], [0, y, -8.5], bronze);
  for (const x of [-1.4, 1.4]) box(root, [0.035, 1.3, 0.05], [x, 1.1, -8.42], brass, { round: 0.012 });

  // master suite sliding glass (interactive) and cantilevered balcony
  ctx.balconySlider.position.set(-4.0, F1, -8.38);
  const slider = box(ctx.balconySlider, [2.4, 2.6, 0.05], [1.2, 1.3, 0], glass, {
    cast: false, data: { id: 'obj-master-curtains', name: 'Balcony Glass Slider', type: 'door', description: 'Motorized Schuco glass slider opening to cantilevered pool deck.' }
  });
  box(ctx.balconySlider, [2.5, 0.05, 0.08], [1.2, 2.62, 0], bronze);
  box(ctx.balconySlider, [2.5, 0.05, 0.08], [1.2, 0.03, 0], bronze);
  box(ctx.balconySlider, [0.05, 2.6, 0.08], [0.02, 1.3, 0], bronze);
  box(ctx.balconySlider, [0.05, 2.6, 0.08], [2.38, 1.3, 0], bronze);
  ctx.interactive.push(slider);
  root.add(ctx.balconySlider);
  box(root, [7, 0.35, 3.8], [-4.5, 3.6, -9.8], [trav, trav, trav, stucco, trav, trav]);
  box(root, [7, 1.1, 0.04], [-4.5, 4.3, -11.6], rail, { cast: false });
  box(root, [0.04, 1.1, 3.1], [-8.0, 4.3, -10.05], rail, { cast: false });
  box(root, [0.04, 1.1, 3.1], [-1.0, 4.3, -10.05], rail, { cast: false });
  box(root, [7.05, 0.04, 0.07], [-4.5, 4.86, -11.6], brass, { round: 0.015 });
  box(root, [0.07, 0.04, 3.15], [-8.0, 4.86, -10.05], brass, { round: 0.015 });
  box(root, [0.07, 0.04, 3.15], [-1.0, 4.86, -10.05], brass, { round: 0.015 });
  // balcony bistro set
  table(furn, [-6.2, F1 + 0.3 - 0.3, -10.1], 0.7, 0.7, 0.72, 'travertine', 'black-steel');
  for (const [dx, dz, ry] of [[-0.7, 0, Math.PI / 2], [0.7, 0, -Math.PI / 2]] as const) diningChair(furn, [-6.2 + dx, F1 - 0.3 + 0.3 - 0.3, -10.1 + dz], ry, 'fabric-sofa', 'black-steel');

  /* ===================== UPPER FLOOR SLABS & GUARDS ===================== */
  box(root, [10.5, 0.3, 17.5], [5.5, 3.6, 0.5], slab(oak), { cast: false });
  box(root, [10.5, 0.3, 10.5], [-5.5, 3.6, -3.0], slab(oak), { cast: false });
  box(root, [3.5, 0.3, 2.2], [0, 3.6, 0.5], slab(oak), { cast: false });
  const guard = (x: number, z: number, w: number, d: number) => {
    box(root, [w, 1.05, d], [x, F1 + 0.55, z], rail, { cast: false });
    box(root, [Math.max(w, 0.06), 0.045, Math.max(d, 0.06)], [x, F1 + 1.08, z], brass, { round: 0.015 });
  };
  guard(0.25, -4.4, 0.04, 7.7);           // east slab inner edge (north of bridge)
  guard(0.25, 5.45, 0.04, 7.7);           // (south of bridge)
  guard(-0.25, -4.4, 0.04, 7.7);          // west slab inner edge
  guard(-0.25, 2.0, 0.04, 0.5);
  guard(-6.5, 2.25, 8.5, 0.04);           // west slab front edge
  guard(-0.5, 2.25, 0.5, 0.04);
  guard(0, -0.6, 3.5, 0.04); guard(0, 1.6, 3.5, 0.04); // bridge rails

  // stair: floating travertine treads, glass guard + brass rail
  const rise = 0.22, run = 0.32;
  for (let i = 0; i < 16; i++) {
    box(root, [1.4, 0.14, 0.42], [-1.5, 0.2 + i * rise, 7.0 - i * run], trav, { round: 0.01 });
  }
  const ang = Math.atan2(rise, run);
  const len = 16 * Math.hypot(rise, run);
  const gl = box(root, [0.04, 1.0, len], [-0.78, 1.95 + 0.55, 4.6], rail, { cast: false, rot: [ang, 0, 0] });
  void gl;
  box(root, [0.05, 0.05, len], [-0.78, 2.0 + 1.05, 4.6], brass, { rot: [ang, 0, 0], round: 0.015 });
  // wall-side steel stringer (hint of support)
  box(root, [0.06, 0.12, len], [-2.22, 1.88, 4.6], bronze, { rot: [ang, 0, 0] });

  /* ================ UPPER PARTITIONS (full height, plaster) ================ */
  const PY = F1 + 1.45, PH = 2.9;
  const wallX = (a: number, b: number, z: number) => { if (b > a) box(root, [b - a, PH, 0.16], [(a + b) / 2, PY, z], stucco); };
  const wallZ = (x: number, a: number, b: number) => { if (b > a) box(root, [0.16, PH, b - a], [x, PY, (a + b) / 2], stucco); };
  wallX(0.25, 2.2, 0.15); wallX(3.5, 10.75, 0.15);
  wallZ(2.2, -8.2, -4.2); wallZ(2.2, -2.8, 2.4); wallZ(2.2, 3.7, 9.1);
  wallX(-10.75, -6.8, 0.15); wallX(-5.4, -4.3, 0.15); wallX(-3.0, -1.95, 0.15); wallX(-0.65, -0.25, 0.15);

  // master door aligned to the real opening (x −1.95 → −0.65)
  ctx.masterDoorPivot.position.set(-1.95, F1, 0.15);
  const mDoor = box(ctx.masterDoorPivot, [1.25, 2.6, 0.06], [0.65, 1.3, 0], cedar, {
    data: { id: 'obj-master-door', name: 'Master Suite Acoustic Door', type: 'door', description: 'Acoustic door in honey teak slats.' }
  });
  box(ctx.masterDoorPivot, [0.03, 0.9, 0.05], [1.12, 1.05, 0.05], brass, { round: 0.012 });
  ctx.interactive.push(mDoor);
  root.add(ctx.masterDoorPivot);

  /* ========================== GROUND FLOOR LIVING ========================== */
  // fireplace monolith with firebox glow, stone surround and a mantel ledge
  const fp = box(root, [0.7, 3.33, 3.8], [-6.5, 1.78, -2.0], [trav, trav, trav, trav, trav, trav]);
  box(root, [0.02, 0.7, 2.6], [-6.14, 0.62, -2.0], M('black-steel'), { cast: false });
  const fire = box(root, [0.04, 0.4, 2.4], [-6.14, 0.58, -2.0], MaterialsLibrary.glowClone(), {
    cast: false, data: { id: 'spot-fireplace', name: 'Linear Travertine Fireplace', type: 'furniture', description: 'Honed travertine linear fireplace with glowing natural gas ceramic embers.' }
  });
  ctx.interactive.push(fire);
  box(root, [0.3, 0.07, 3.0], [-6.0, 1.22, -2.0], trav, { round: 0.01 });
  const fireLight = new THREE.PointLight(0xff9a4a, 2.2, 7, 2);
  fireLight.position.set(-5.6, 0.8, -2.0); root.add(fireLight); ctx.lights.push(fireLight);
  void fp;

  // living: rug, sofa, chairs, tables
  rug(furn, [-3.4, F0, -1.7], 5.8, 4.2);
  const sofaMesh = sofa(furn, [-3.4, F0, -0.4], Math.PI, 4.2);
  const hit = box(furn, [4.2, 0.9, 1.0], [-3.4, F0 + 0.45, -0.4], M('fabric-sofa'), {
    cast: false, data: { id: 'obj-living-sectional', name: 'Textured charcoal sectional sofa', type: 'furniture', description: 'Deep, woven upholstery with separate seat cushions, padded arms, and loose accent pillows.' }
  });
  hit.visible = false; // invisible pick proxy: raycasts resolve to the data id without altering the visuals
  ctx.interactive.push(hit);
  void sofaMesh;
  coffeeTable(furn, [-3.4, F0, -2.2], 1.9, 1.0, 'travertine');
  books(furn, [-3.7, F0 + 0.415, -2.2], 3);
  vase(furn, [-3.0, F0 + 0.415, -2.15]);
  const lounge = loungeChair(furn, [-1.0, F0, -2.4], Math.PI + 0.9);
  const loungeHit = box(furn, [0.9, 0.9, 1.2], [-1.0, F0 + 0.5, -2.4], M('leather-cognac'), {
    cast: false, data: { id: 'obj-eames-lounge', name: 'Cognac Leather Lounge Setting', type: 'furniture', description: 'Sculptural lounge chair in full-grain cognac leather.' }
  });
  loungeHit.visible = false;
  ctx.interactive.push(loungeHit);
  void lounge;
  box(furn, [0.5, 0.5, 0.5], [-5.5, F0 + 0.25, -3.3], marble, { round: 0.02 }); // side table
  plant(furn, [-9.2, F0, -7.4], 1.9, 'ceramic-white', 1);
  plant(furn, [9.2, F0, -7.4], 1.7, 'ceramic-white', 2);
  plant(furn, [-0.5, F0, 5.2], 1.4, 'ceramic-white', 3);
  curtain(root, [-9.3, 6.2, -8.28], 1.5, 6.0, 3, 0.07);
  curtain(root, [9.3, 6.2, -8.28], 1.5, 6.0, 3, 0.07);
  // living chandelier (viewer toggles this light) — cluster of globes under the slab
  const livingLight = ctx.livingLight;
  livingLight.position.set(-2.4, 2.85, -0.6);
  const lcl = new THREE.Group(); lcl.position.copy(livingLight.position); root.add(lcl);
  cyl(lcl, 0.006, 0.006, 0.6, [0, 0.3, 0], M('black-steel'), 6);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const g = sph(lcl, 0.085, [Math.sin(a) * 0.32, -0.04 + (i % 2) * 0.1, Math.cos(a) * 0.32], MaterialsLibrary.glowClone(), [1, 1, 1], 14);
    g.userData.noShadow = true;
    cyl(lcl, 0.004, 0.004, 0.5, [Math.sin(a) * 0.16, 0.2, Math.cos(a) * 0.16], brass, 4);
  }
  ctx.livingGlow = lcl.children.find((c) => (c as THREE.Mesh).isMesh && (c as THREE.Mesh).geometry.type === 'SphereGeometry') as THREE.Mesh;

  // recessed ceiling downlights under the upper slab
  for (const [x, z] of [[-8.5, -5], [-5.5, -5], [-2.5, -5], [-8.5, -1.2], [-3.4, 0.9], [-0.9, -3.2], [-0.9, 0.8], [2.3, -6.4], [2.3, -2.4], [2.3, 1.2], [5.5, -6.4], [5.5, 1.2], [8.5, -6.4], [8.5, -2.4], [8.5, 1.2]] as const) {
    const d = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.02, 16), glowMat);
    d.position.set(x, 3.44, z); d.userData.noShadow = true; root.add(d);
  }

  /* ====================== DINING + KITCHEN ====================== */
  table(furn, [3.8, F0, -1.0], 1.3, 3.4, 0.75, 'walnut', 'black-steel', Math.PI / 2 * 0 + 0);
  // table() lays its long axis along x; rotate so the long side runs along z
  furn.children[furn.children.length - 1].rotation.y = Math.PI / 2;
  for (let i = 0; i < 4; i++) {
    const z = -2.2 + i * 0.8 + 0.0;
    diningChair(furn, [3.0, F0, z + 0.2], Math.PI / 2);
    diningChair(furn, [4.6, F0, z + 0.2], -Math.PI / 2);
  }
  diningChair(furn, [3.8, F0, -2.95], 0);
  diningChair(furn, [3.8, F0, 0.95], Math.PI);
  vase(furn, [3.8, F0 + 0.75, -1.0], 0.3);
  const dLight = ctx.diningLight;
  dLight.position.set(3.8, 2.75, -1.0);
  const halo = new THREE.Group(); halo.position.set(3.8, 2.75, -1.0); root.add(halo);
  const haloGlow = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.025, 12, 56), MaterialsLibrary.glowClone());
  haloGlow.rotation.x = Math.PI / 2; haloGlow.userData.noShadow = true; halo.add(haloGlow);
  const haloShell = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.05, 12, 56, Math.PI * 2), brass);
  haloShell.rotation.x = Math.PI / 2; haloShell.position.y = 0.04; halo.add(haloShell);
  for (const a of [0, 2.1, 4.2]) cyl(halo, 0.004, 0.004, 0.7, [Math.sin(a) * 0.55, 0.38, Math.cos(a) * 0.55], M('black-steel'), 4);
  ctx.diningGlow = haloGlow;

  // kitchen island: waterfall marble over walnut base, stools, pendants, cooktop, sink
  const baseI = box(furn, [1.2, 0.86, 4.0], [2.5, F0 + 0.43, -4.2], walnut, { round: 0.015 });
  void baseI;
  const topI = box(furn, [1.5, 0.06, 4.2], [2.5, F0 + 0.89, -4.2], marble, {
    round: 0.012, data: { id: 'spot-marble-island', name: 'Calacatta Gold Waterfall Island', type: 'appliance', description: 'Monolithic slab of Italian Calacatta Gold marble with brass prep faucet.' }
  });
  ctx.interactive.push(topI);
  box(furn, [0.06, 0.88, 4.2], [1.72, F0 + 0.44, -4.2], marble, { round: 0.012 });
  box(furn, [0.06, 0.88, 4.2], [3.28, F0 + 0.44, -4.2], marble, { round: 0.012 });
  const cook = box(furn, [0.62, 0.012, 1.15], [2.7, F0 + 0.925, -3.7], M('black-steel'), {
    data: { id: 'obj-kitchen-cooktop', name: 'Bora Induction Cooktop', type: 'appliance', description: 'Flush-mount induction system with center vapor extractor.' }
  });
  ctx.interactive.push(cook);
  for (const dz of [-0.35, 0.35]) cyl(furn, 0.12, 0.12, 0.003, [2.7, F0 + 0.93, -3.7 + dz], M('rubber'), 24);
  box(furn, [0.45, 0.012, 0.8], [2.55, F0 + 0.925, -5.2], M('steel-brushed'), { round: 0.004 });
  cyl(furn, 0.014, 0.014, 0.3, [2.5, F0 + 1.05, -5.2 + 0.28], brass, 10);
  box(furn, [0.02, 0.02, 0.18], [2.5, F0 + 1.2, -5.2 + 0.2], brass, { round: 0.006 });
  for (let i = 0; i < 4; i++) barStool(furn, [1.15, F0, -5.4 + i * 0.95], 0.66);
  for (const dz of [-5.0, -4.2, -3.4]) pendant(ctx, root, [2.5, 3.45, dz], 1.3, 0.2);
  // fruit bowl + books
  const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M('ceramic-white'));
  bowl.position.set(2.2, F0 + 1.02, -2.7); bowl.rotation.x = Math.PI; bowl.scale.y = 0.55; furn.add(bowl);
  for (let i = 0; i < 4; i++) sph(furn, 0.045, [2.2 + (i - 1.5) * 0.06, F0 + 0.96 + (i % 2) * 0.02, -2.7 + (i % 3) * 0.04], new THREE.MeshStandardMaterial({ color: i % 2 ? 0xb8c24a : 0xd24a2f, roughness: 0.45 }), [1, 0.9, 1], 10);

  // cabinetry wall on the east side: base units, tall units, steel appliances, uppers
  const cab = (w: number, h: number, y: number, z: number, mat: THREE.Material = walnut, d = 0.65, x = 10.4) => box(furn, [d, h, w], [x, y, z], mat, { round: 0.008 });
  cab(6.2, 0.88, F0 + 0.44, -4.2);
  box(furn, [0.7, 0.04, 6.2], [10.38, F0 + 0.9, -4.2], marble, { round: 0.006 });
  box(furn, [0.04, 0.7, 6.2], [10.72, F0 + 1.27, -4.2], marble, { cast: false });
  for (const z of [-6.4, -5.2]) cab(0.9, 1.15, F0 + 2.1, z, cedar, 0.4, 10.55);
  cab(0.9, 2.55, F0 + 1.3, -7.15 + 0.1, M('steel-brushed'), 0.65, 10.4);  // fridge column
  cab(0.9, 2.55, F0 + 1.3, -6.05 + 0.1, M('steel-brushed'), 0.65, 10.4);  // freezer column
  cab(0.9, 0.75, F0 + 1.7, -2.6, M('steel-brushed'), 0.66, 10.4);  // oven stack
  for (const z of [-1.8, -3.4]) cab(1.5, 1.15, F0 + 2.1, z, cedar, 0.4, 10.55);
  box(furn, [0.55, 0.08, 1.0], [10.45, F0 + 1.68, -4.15], M('black-steel')); // hood
  for (let i = -5; i <= 5; i++) box(furn, [0.012, 0.82, 0.01], [10.07, F0 + 0.44, -4.2 + i * 0.56], bronze, { cast: false });
  // skirting boards along walls that exist
  const sk = (x: number, z0: number, z1: number, face: number) => box(root, [0.02, 0.11, z1 - z0], [x + face * 0.01, F0 + 0.055, (z0 + z1) / 2], paint, { cast: false });
  sk(10.75, -8.3, 9.3, -1);
  sk(-10.75, -8.3, 9.3, 1);

  /* ============================ UPPER LEVEL ============================ */
  // master suite
  rug(furn, [-3.5, F1, -3.4], 4.2, 3.6, true);
  bed(furn, [-3.5, F1, -3.5], 0, 2.1);
  box(furn, [1.9, 0.38, 0.5], [-3.5, F1 + 0.22, -1.9], M('fabric-sofa'), { round: 0.05 });
  loungeChair(furn, [-8.0, F1, -4.4], Math.PI - 0.6);
  box(furn, [0.5, 0.5, 0.5], [-7.0, F1 + 0.25, -4.9], marble, { round: 0.02 });
  plant(furn, [-9.6, F1, -7.3], 1.7, 'ceramic-white', 5);
  box(furn, [4.4, 2.7, 0.6], [-8.0, F1 + 1.35, -0.45], walnut, { round: 0.01 });
  for (let i = 0; i < 8; i++) box(furn, [0.01, 2.6, 0.01], [-9.95 + i * 0.55 + 0.0, F1 + 1.35, -0.14], bronze, { cast: false });
  artFrame(root, [-3.5, F1 + 1.6, -0.0], 1.6, 1.0, 1, Math.PI);
  curtain(root, [-5.6, F1 + 2.9, -8.28], 3.4, 2.8, 5, 0.05);
  // ensuite
  const tub = box(furn, [1.75, 0.56, 0.82], [-6.5, F1 + 0.28, 1.25], M('ceramic-white'), { round: 0.28 });
  void tub;
  cyl(furn, 0.012, 0.012, 0.6, [-5.5, F1 + 0.4, 1.25], brass, 8);
  box(furn, [2.4, 0.52, 0.5], [-9.4, F1 + 0.34, 1.85], walnut, { round: 0.01 });
  box(furn, [2.5, 0.04, 0.56], [-9.4, F1 + 0.62, 1.85], marble, { round: 0.006 });
  for (const dx of [-0.55, 0.55]) { sph(furn, 0.17, [-9.4 + dx, F1 + 0.64, 1.85], M('ceramic-white'), [1, 0.35, 1], 20); cyl(furn, 0.01, 0.01, 0.2, [-9.4 + dx, F1 + 0.74, 2.05], brass, 8); }
  box(furn, [2.0, 1.0, 0.03], [-9.4, F1 + 1.55, 2.12], M('mirror'));
  box(furn, [0.04, 2.1, 1.7], [-7.6, F1 + 1.1, 0.7], glass, { cast: false });

  // guest suite two (north) + suite three (south)
  rug(furn, [4.6, F1, -3.2], 3.4, 3.0);
  bed(furn, [4.5, F1, -3.5], 0, 1.7);
  rug(furn, [4.6, F1, 3.3], 3.4, 3.0, true);
  bed(furn, [4.5, F1, 3.0], 0, 1.7, { head: 'fabric-ivory' });
  box(furn, [1.8, 0.04, 0.6], [8.4, F1 + 0.74, -6.9], walnut, { round: 0.01 }); // built-in desk
  box(furn, [0.04, 0.74, 0.5], [7.6, F1 + 0.37, -6.9], M('black-steel'));
  box(furn, [0.04, 0.74, 0.5], [9.2, F1 + 0.37, -6.9], M('black-steel'));
  diningChair(furn, [8.4, F1, -6.2], Math.PI, 'fabric-sofa', 'black-steel');
  plant(furn, [10.0, F1, -4.2], 1.5, 'ceramic-white', 6);
  plant(furn, [10.0, F1, 6.0], 1.6, 'ceramic-white', 7);
  box(furn, [1.5, 0.78, 0.48], [8.6, F1 + 0.4, 8.8], walnut, { round: 0.01 }); // dresser
  artFrame(root, [2.1, F1 + 1.7, -6.2], 1.3, 0.9, 2, -Math.PI / 2);
  artFrame(root, [2.1, F1 + 1.7, -5.0], 0.8, 0.8, 3, -Math.PI / 2);
  artFrame(root, [6.5, F1 + 1.55, 9.0], 1.4, 1.0, 0, Math.PI);
  curtain(root, [6.0, F1 + 2.8, 9.3], 5.0, 2.7, 6, 0.05, Math.PI);

  /* =========================== POOL TERRACE =========================== */
  for (let i = 0; i < 3; i++) {
    const x = -5 + i * 3.4;
    const g = new THREE.Group(); g.position.set(x, 0.1, -18.2); furn.add(g);
    box(g, [0.8, 0.1, 2.0], [0, 0.22, 0], M('black-steel'), { round: 0.01 });
    box(g, [0.76, 0.1, 1.2], [0, 0.32, 0.3], M('fabric-ivory'), { round: 0.04 });
    box(g, [0.76, 0.1, 0.9], [0, 0.55, -0.62], M('fabric-ivory'), { round: 0.04, rot: [0.7, 0, 0] });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(g, 0.02, 0.02, 0.2, [sx * 0.34, 0.1, sz * 0.9], M('black-steel'), 8);
    if (i < 2) box(furn, [0.45, 0.4, 0.45], [x + 1.7, 0.3, -18.2], marble, { round: 0.02 });
  }
  // umbrella
  cyl(furn, 0.03, 0.03, 2.7, [8.0, 1.45, -18.2], M('black-steel'), 10);
  const canopy = new THREE.Mesh(new THREE.ConeGeometry(1.9, 0.5, 16, 1, true), M('curtain-linen'));
  canopy.position.set(8.0, 2.7, -18.2); canopy.castShadow = true; furn.add(canopy);
  // fire lounge (sunken pit with ember glow and seating)
  const firePit = box(root, [3.6, 0.24, 3.6], [11.5, 0.04, -12.5], trav, { cast: false });
  void firePit;
  cyl(root, 0.9, 0.9, 0.34, [11.5, 0.22, -12.5], trav, 28);
  cyl(root, 0.62, 0.62, 0.05, [11.5, 0.42, -12.5], MaterialsLibrary.glowClone(), 24).userData.noShadow = true;
  for (const [dx, dz, w, d] of [[0, 2.25, 3.2, 0.7], [-2.25, 0, 0.7, 3.2], [0, -2.25, 3.2, 0.7]] as const) {
    box(furn, [w, 0.4, d], [11.5 + dx, 0.32, -12.5 + dz], trav, { round: 0.02 });
    box(furn, [w - 0.1, 0.1, d - 0.1], [11.5 + dx, 0.57, -12.5 + dz], M('fabric-ivory'), { round: 0.04 });
  }
  const pitLight = new THREE.PointLight(0xff8a3a, 3, 8, 2);
  pitLight.position.set(11.5, 0.9, -12.5); root.add(pitLight); ctx.lights.push(pitLight);

  /* ============================ LANDSCAPE ============================ */
  const treeAt: Array<[number, number, number, number]> = [
    [-14.5, 10, 1.15, 1], [-16, 2, 1.0, 2], [14.5, 12, 1.1, 3], [16, 5, 1.0, 4], [15, -14, 1.2, 5], [-15, -16, 1.1, 6],
    [-20, -8, 1.3, 7], [21, -4, 1.25, 8], [-22, 14, 1.35, 9], [24, 16, 1.3, 10]
  ];
  for (const [x, z, s, seed] of treeAt) tree(root, x, z, s, seed);
  // clipped boxwood hedge + shrubs along the facade
  for (let x = -9.4; x <= 10.4; x += 1.1) {
    if (x > -2.6 && x < 2.6) continue;
    const b = box(root, [1.0, 0.7, 0.9], [x, 0.38, 10.7], M('foliage-green'), { round: 0.3 });
    b.userData.noShadow = false;
  }
  for (const x of [-3.2, 3.2]) { const s = sph(root, 0.55, [x, 0.55, 10.7], M('foliage-olive'), [1, 0.85, 1], 18); s.castShadow = true; }
  // gravel bed + ornamental grass tufts
  box(root, [18, 0.03, 1.6], [0.5, 0.0, 10.7], M('gravel'), { cast: false });
  const tufts = new THREE.InstancedMesh(new THREE.ConeGeometry(0.035, 0.7, 4), M('foliage-olive'), 700);
  const dm = new THREE.Object3D();
  for (let i = 0; i < 700; i++) {
    const r1 = Math.sin(i * 12.9898) * 43758.5453, r2 = Math.sin(i * 78.233) * 12345.678;
    const a = r1 - Math.floor(r1), b = r2 - Math.floor(r2);
    const onBack = i % 2 === 0;
    dm.position.set(onBack ? -14 + a * 28 : -12 + a * 24, 0.3, onBack ? -21 - b * 3 : 11.4 + b * 1.2);
    dm.rotation.set((b - 0.5) * 0.5, a * 6, (a - 0.5) * 0.5);
    dm.scale.setScalar(0.7 + b * 0.9);
    dm.updateMatrix(); tufts.setMatrixAt(i, dm.matrix);
  }
  tufts.castShadow = false; root.add(tufts);

  // cars: one on the drive, one in the glass garage
  coupe(root, [-8, 0, 16], Math.PI + 0.12);
  coupe(root, [-6.6, F0, 6.3], 0, 'car-pearl');
  for (const x of [-10.35, -3.45]) box(root, [0.18, 0.5, 0.1], [x, 1.3 + 0.0, 5.0], M('black-steel')); // EV chargers

  addCollider(ctx, [-11, 0, -8.5], [11, 7, 9.5]);
}
