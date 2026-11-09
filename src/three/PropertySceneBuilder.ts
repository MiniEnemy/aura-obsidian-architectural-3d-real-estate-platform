import * as THREE from 'three';
import { MaterialsLibrary } from './MaterialsLibrary';
import { finalizeScene, mergeStaticMeshes } from './RealismKit';
import { BuildCtx } from './SceneKit';
import { buildObsidianPavilion } from './scenes/ObsidianPavilion';
import { buildVillaLumina } from './scenes/VillaLumina';
import { buildSkySanctuary } from './scenes/SkySanctuary';

export interface SceneInteractiveNodes {
  frontDoorPivot: THREE.Group;
  masterDoorPivot: THREE.Group;
  balconySlider: THREE.Group;
  livingLight: THREE.PointLight;
  livingLightGlow: THREE.Mesh;
  diningLight: THREE.PointLight;
  diningLightGlow: THREE.Mesh;
  furnitureGroup: THREE.Group;
  interactiveObjects: THREE.Object3D[];
  colliders: THREE.Box3[];
  /** every interior light — hand to SkyController.setPreset() so they switch on at dusk */
  interiorLights: THREE.Light[];
}

export class PropertySceneBuilder {
  /** set true to log build stage timings */
  public static debug = false;
  public static buildProperty(propertyId: string, scene: THREE.Scene): SceneInteractiveNodes {
    const old = scene.getObjectByName('property-root');
    if (old) {
      scene.remove(old);
      old.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) m.geometry.dispose(); });
    }
    const root = new THREE.Group();
    root.name = 'property-root';
    scene.add(root);
    const furniture = new THREE.Group();
    furniture.name = 'furniture-group';
    root.add(furniture);

    const livingLight = new THREE.PointLight(0xffe2a3, 8, 14, 2);
    const diningLight = new THREE.PointLight(0xffdf99, 6, 10, 2);
    livingLight.position.set(-2.4, 2.85, -0.6);
    diningLight.position.set(3.8, 2.75, -1.0);
    root.add(livingLight, diningLight);

    const ctx: BuildCtx = {
      root, furniture, interactive: [], colliders: [], lights: [livingLight, diningLight],
      livingLight, diningLight,
      frontDoorPivot: new THREE.Group(), masterDoorPivot: new THREE.Group(), balconySlider: new THREE.Group()
    };

    const t0 = performance.now();
    if (propertyId === 'prop-villa-solaria') buildVillaLumina(ctx);
    else if (propertyId === 'prop-sky-residence') buildSkySanctuary(ctx);
    else buildObsidianPavilion(ctx);

    const fallback = () => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.01), MaterialsLibrary.glowClone()); root.add(m); return m; };
    const t1 = performance.now();
    finalizeScene(root, furniture);
    const t2 = performance.now();
    const merged = mergeStaticMeshes(root, furniture, new Set([ctx.frontDoorPivot, ctx.masterDoorPivot, ctx.balconySlider]));
    if (PropertySceneBuilder.debug) console.log(`[build ${propertyId}] geometry ${(t1 - t0).toFixed(0)}ms, finalize ${(t2 - t1).toFixed(0)}ms, merge(${merged}) ${(performance.now() - t2).toFixed(0)}ms`);
    return {
      frontDoorPivot: ctx.frontDoorPivot, masterDoorPivot: ctx.masterDoorPivot, balconySlider: ctx.balconySlider,
      livingLight, livingLightGlow: ctx.livingGlow ?? fallback(),
      diningLight, diningLightGlow: ctx.diningGlow ?? fallback(),
      furnitureGroup: furniture, interactiveObjects: ctx.interactive, colliders: ctx.colliders,
      interiorLights: ctx.lights
    };
  }
}
