import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { writeFileSync } from 'node:fs';

globalThis.FileReader = class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((result) => {
      this.result = result;
      this.onloadend?.();
    });
  }
};

const scene = new THREE.Scene();
const materials = {
  stucco: new THREE.MeshStandardMaterial({ color: 0xd9d3c5, roughness: 0.72 }),
  stone: new THREE.MeshStandardMaterial({ color: 0xb09e84, roughness: 0.82 }),
  wood: new THREE.MeshStandardMaterial({ color: 0x75421f, roughness: 0.52 }),
  oak: new THREE.MeshStandardMaterial({ color: 0x9c6335, roughness: 0.58 }),
  glass: new THREE.MeshPhysicalMaterial({ color: 0x5e9fb2, roughness: 0.08, transmission: 0.35, transparent: true, opacity: 0.42 }),
  bronze: new THREE.MeshStandardMaterial({ color: 0x4a3024, metalness: 0.78, roughness: 0.25 }),
  brass: new THREE.MeshStandardMaterial({ color: 0xd2a64e, metalness: 0.82, roughness: 0.2 }),
  water: new THREE.MeshPhysicalMaterial({ color: 0x159dcc, roughness: 0.08, transmission: 0.25, transparent: true, opacity: 0.82 }),
  grass: new THREE.MeshStandardMaterial({ color: 0x335a2f, roughness: 0.95 }),
  linen: new THREE.MeshStandardMaterial({ color: 0xc4bfb5, roughness: 0.9 }),
  foliage: new THREE.MeshStandardMaterial({ color: 0x2f5726, roughness: 0.88 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x20272d, roughness: 0.42, metalness: 0.18 })
};

function box(name, size, position, material, userData = {}) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData = userData;
  scene.add(mesh);
  return mesh;
}

function cylinder(name, radius, height, position, material, segments = 20) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 1.08, height, segments), material);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

function sphere(name, radius, position, material) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 20, 14), material);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.castShadow = true;
  scene.add(mesh);
  return mesh;
}

// Coastal site, raised limestone terrace and infinity pool.
box('Coastal lawn', [64, 0.15, 54], [0, -0.16, 0], materials.grass);
box('Travertine terrace', [30, 0.34, 25], [0, 0.02, 0], materials.stone);
box('Pool basin', [21, 1.1, 6.3], [0, -0.48, -9.2], materials.dark);
box('Infinity pool water', [20.4, 0.08, 5.7], [0, 0.08, -9.2], materials.water);
box('Pool coping', [21.5, 0.18, 0.45], [0, 0.18, -12.2], materials.stone);
box('Arrival driveway', [8.5, 0.14, 15], [-17.5, -0.02, 7.2], materials.stone);
box('Garage volume', [7.2, 3.5, 6.8], [-17.5, 1.7, 11.8], materials.stucco);
box('Garage opening', [5.4, 2.7, 0.12], [-17.5, 1.45, 8.35], materials.dark);
box('Garage door frame', [5.7, 0.14, 0.18], [-17.5, 2.85, 8.25], materials.bronze);
for (let x = -19.8; x <= -15.2; x += 0.9) box('Garage door slat', [0.08, 2.5, 0.08], [x, 1.45, 8.18], materials.wood);

// A simple but legible luxury grand tourer anchors the arrival court.
box('Grand tourer body', [2.1, 0.52, 4.3], [-17.5, 0.62, 3.4], materials.dark);
box('Grand tourer cabin', [1.72, 0.48, 2.0], [-17.5, 1.05, 3.0], materials.glass);
for (const z of [1.65, 5.05]) for (const x of [-18.35, -16.65]) cylinder('Grand tourer wheel', 0.35, 0.22, [x, 0.38, z], materials.bronze, 18).rotation.z = Math.PI / 2;
box('Arrival gate wall', [0.35, 1.8, 12], [-22.1, 0.9, 9], materials.stone);

// The villa envelope: deep roof, side wings, rear service wall and open glass front.
box('Villa floor', [22, 0.2, 13], [0, 0.28, 1.4], materials.oak);
box('Rear limestone wall west', [9.6, 3.85, 0.28], [-6.2, 2.15, 7.75], materials.stucco);
box('Rear limestone wall east', [9.6, 3.85, 0.28], [6.2, 2.15, 7.75], materials.stucco);
box('Rear limestone entry lintel', [2.8, 0.78, 0.28], [0, 3.68, 7.75], materials.stucco);
box('West wing', [0.28, 3.85, 12.7], [-11, 2.15, 1.4], materials.stucco);
box('East wing', [0.28, 3.85, 12.7], [11, 2.15, 1.4], materials.stucco);
box('Master suite divider', [0.22, 3.75, 5.7], [-3.7, 2.1, 5.0], materials.stucco);
box('Service divider', [0.22, 3.75, 5.7], [4.1, 2.1, 5.0], materials.stucco);
box('Floating roof', [27, 0.48, 16.4], [0, 4.3, 1.4], materials.stucco);
box('Roof bronze trim', [24.8, 0.1, 0.18], [0, 4.58, -5.8], materials.brass);

// Frameless sea-facing glazing with slim bronze mullions.
box('Sea glass facade', [21.8, 3.55, 0.08], [0, 2.1, -5.05], materials.glass);
for (const x of [-9.5, -4.75, 0, 4.75, 9.5]) box('Bronze glass mullion', [0.08, 3.6, 0.14], [x, 2.1, -5.1], materials.bronze);

// Covered entry and a real interactive door record for the viewer.
for (const x of [-9.5, -4.75, 0, 4.75, 9.5]) cylinder('White colonnade', 0.23, 3.85, [x, 2.15, -5.35], materials.stucco, 24);
box('Villa entry door', [1.8, 3.15, 0.14], [0, 1.95, 7.57], materials.wood, { id: 'obj-villa-entry-door', name: 'Villa Lumina Entry Door', type: 'door', description: 'French oak pivot door beneath the Mediterranean roof overhang.' });
box('Entry pull', [0.06, 1.4, 0.1], [0.63, 1.95, 7.45], materials.brass);
box('Entry canopy', [4.4, 0.22, 2.8], [0, 3.95, 8.1], materials.stucco);
box('Entry threshold', [2.8, 0.12, 1.6], [0, 0.22, 8.25], materials.stone);
box('Entry reveal west', [0.16, 3.0, 0.3], [-1.05, 1.75, 7.58], materials.bronze);
box('Entry reveal east', [0.16, 3.0, 0.3], [1.05, 1.75, 7.58], materials.bronze);
for (let z = 8.4; z <= 11.2; z += 0.75) box('Entry stair', [3.6, 0.12, 0.45], [0, 0.25 + (11.2 - z) * 0.02, z], materials.stone);
box('Entry vestibule wall', [6.0, 3.0, 0.2], [0, 1.7, 10.5], materials.stucco);
box('Entry vestibule glazing', [3.2, 2.4, 0.08], [0, 1.85, 10.38], materials.glass);

// Lounge, dining and master suite furnishings.
box('Sunken sea lounge', [5.2, 0.62, 2.1], [-2.6, 0.62, 1.7], materials.linen, { id: 'room-villa-living', name: 'Sunken Sea Lounge', type: 'furniture', description: 'Linen seating facing the Mediterranean glass wall.' });
box('Lounge back', [5.2, 0.82, 0.42], [-2.6, 1.05, 2.62], materials.linen);
cylinder('Dining table', 1.45, 0.16, [6.2, 1.0, 1.2], materials.oak, 32);
for (let i = 0; i < 8; i++) {
  const angle = (i / 8) * Math.PI * 2;
  const chair = box('Dining chair', [0.48, 0.72, 0.48], [6.2 + Math.cos(angle) * 1.9, 0.55, 1.2 + Math.sin(angle) * 1.9], materials.linen);
  chair.lookAt(6.2, 0.55, 1.2);
}
box('Master bed', [3.6, 0.38, 2.2], [-7.6, 0.62, 3.0], materials.linen);
box('Oak headboard', [3.7, 1.5, 0.16], [-7.6, 1.25, 4.08], materials.wood);
box('Kitchen island', [3.6, 0.95, 1.15], [4.7, 0.78, -1.8], materials.stone);
box('Kitchen island timber base', [3.4, 0.65, 1.02], [4.7, 0.35, -1.8], materials.wood);

// Private bedroom wing: three suites, dressing corridor and wet rooms.
box('Bedroom wing floor', [13.5, 0.2, 9.5], [-7.2, 0.28, 5.2], materials.oak);
box('Bedroom wing rear wall', [13.5, 3.8, 0.24], [-7.2, 2.15, 9.85], materials.stucco);
box('Bedroom wing west wall', [0.24, 3.8, 9.5], [-13.95, 2.15, 5.2], materials.stucco);
box('Bedroom divider one', [0.18, 3.6, 8.3], [-9.45, 2.05, 5.2], materials.stucco);
box('Bedroom divider two', [0.18, 3.6, 8.3], [-5.0, 2.05, 5.2], materials.stucco);
box('Bedroom wing roof', [14.4, 0.4, 10.4], [-7.2, 4.15, 5.2], materials.stucco);
for (const x of [-12.0, -7.2, -2.4]) box('Bedroom window', [3.2, 2.1, 0.08], [x, 2.2, 9.72], materials.glass);
for (const [x, z] of [[-11.7, 4.9], [-7.2, 4.9], [-2.7, 4.9]]) {
  box('Suite bed', [2.5, 0.38, 1.8], [x, 0.62, z], materials.linen);
  box('Suite headboard', [2.65, 1.35, 0.14], [x, 1.2, z + 1.0], materials.wood);
  box('Suite side table', [0.42, 0.5, 0.42], [x - 1.65, 0.5, z], materials.oak);
  box('Suite side table', [0.42, 0.5, 0.42], [x + 1.65, 0.5, z], materials.oak);
}

// Spa pavilion and fitness room behind the main living volume.
box('Spa pavilion floor', [8.0, 0.2, 6.8], [7.0, 5.1, 0.1], materials.stone);
box('Spa pavilion rear wall', [8.0, 3.4, 0.2], [7.0, 6.8, 3.4], materials.stucco);
box('Spa pavilion east wall', [0.2, 3.4, 6.8], [11.0, 6.8, 0.1], materials.stucco);
box('Spa pavilion roof', [8.6, 0.35, 7.5], [7.0, 8.55, 0.1], materials.stucco);
box('Spa glass wall', [7.3, 2.8, 0.07], [7.0, 6.7, -3.3], materials.glass);
box('Spa soaking tub', [2.2, 0.7, 1.15], [7.3, 0.65, 0.7], materials.stone, { id: 'obj-villa-spa', name: 'Calacatta Spa Bath', type: 'furniture', description: 'Freestanding stone soaking tub in the private spa pavilion.' });
box('Fitness bench', [2.6, 0.45, 0.55], [8.3, 0.5, 2.4], materials.dark);

// Service court and guest pavilion make the estate feel occupied beyond the hero room.
box('Guest pavilion floor', [8.2, 0.2, 6.8], [16.0, 0.28, 2.0], materials.oak);
box('Guest pavilion rear wall', [8.2, 3.4, 0.24], [16.0, 2.1, 5.25], materials.stucco);
box('Guest pavilion west wall', [0.24, 3.4, 6.8], [12.0, 2.1, 2.0], materials.stucco);
box('Guest pavilion roof', [8.8, 0.4, 7.5], [16.0, 4.0, 2.0], materials.stucco);
box('Guest pavilion glass', [7.4, 2.8, 0.07], [16.0, 2.0, -1.35], materials.glass);
box('Guest bed', [2.5, 0.38, 1.8], [16.0, 0.62, 2.4], materials.linen);
box('Guest desk', [1.8, 0.72, 0.55], [18.3, 0.65, 0.3], materials.wood);

// Long circulation spine and a sculptural stair to the roof terrace.
box('Gallery spine floor', [4.2, 0.18, 15.5], [0.0, 0.38, 2.0], materials.stone);
for (let i = 0; i < 12; i++) box('Floating stair', [1.6, 0.14, 0.52], [-0.8, 0.45 + i * 0.2, 6.8 - i * 0.38], materials.stone);
box('Stair glass balustrade', [0.06, 1.45, 5.2], [0.15, 1.8, 4.8], materials.glass);

// Courtyard water rill, fire lounge and repeated stone paving details.
box('Courtyard water rill', [2.2, 0.12, 7.5], [2.0, 0.2, 4.0], materials.water);
box('Fire lounge plinth', [3.6, 0.45, 3.6], [9.0, 0.38, -6.2], materials.stone);
cylinder('Fire bowl', 0.78, 0.18, [9.0, 0.72, -6.2], materials.brass, 24);
for (let z = -1.5; z <= 5.8; z += 1.2) box('Courtyard paver', [1.0, 0.06, 0.7], [-1.0, 0.43, z], materials.stone);

// Timber pergola on the pool side.
for (const x of [-9.2, -5.3]) for (const z of [-6.9, -2.4]) box('Pergola post', [0.18, 3.8, 0.18], [x, 2.15, z], materials.wood);
for (let x = -9.6; x <= -4.9; x += 0.6) box('Pergola slat', [0.14, 0.15, 4.8], [x, 4.05, -4.65], materials.wood);

// Mediterranean planting and olive courtyard.
cylinder('Olive trunk', 0.42, 3.1, [6.4, 1.65, 3.1], materials.wood, 16);
for (const [x, y, z, r] of [[5.2, 4.25, 2.4, 1.3], [6.7, 4.55, 3.2, 1.4], [7.5, 4.0, 2.4, 1.05], [5.9, 5.0, 3.8, 0.9]]) sphere('Olive crown', r, [x, y, z], materials.foliage);
for (const x of [-10, -8.2, 8.2, 10]) {
  cylinder('Limestone planter', 0.44, 0.65, [x, 0.5, -5.8], materials.stone);
  sphere('Coastal shrub', 0.62, [x, 1.15, -5.8], materials.foliage);
}

// Warm architectural lighting markers.
for (const x of [-8, -4, 0, 4, 8]) {
  cylinder('Brass path light', 0.08, 0.35, [x, 0.38, -6.8], materials.brass, 12);
}
box('Villa pendant light', [0.35, 0.12, 0.35], [4.5, 3.75, 1.3], materials.brass, { id: 'obj-villa-lights', name: 'Villa Lumina Pendant Lights', type: 'light', description: 'Warm pendant lighting across the open-plan pavilion.' });

const exporter = new GLTFExporter();
exporter.parse(scene, (result) => {
  writeFileSync('public/models/villa-lumina-azure.glb', Buffer.from(result));
  console.log('Wrote public/models/villa-lumina-azure.glb');
}, (error) => {
  console.error(error);
  process.exitCode = 1;
}, { binary: true, onlyVisible: true });
