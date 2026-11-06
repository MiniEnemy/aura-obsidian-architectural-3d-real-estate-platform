import * as THREE from 'three';
import { MaterialsLibrary } from './MaterialsLibrary';

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
}

export class PropertySceneBuilder {
  public static buildProperty(
    propertyId: string,
    scene: THREE.Scene
  ): SceneInteractiveNodes {
    const oldGroup = scene.getObjectByName('property-root');
    if (oldGroup) {
      scene.remove(oldGroup);
    }

    const root = new THREE.Group();
    root.name = 'property-root';
    scene.add(root);

    const furnitureGroup = new THREE.Group();
    furnitureGroup.name = 'furniture-group';
    root.add(furnitureGroup);

    const interactiveObjects: THREE.Object3D[] = [];
    const colliders: THREE.Box3[] = [];

    const frontDoorPivot = new THREE.Group();
    const masterDoorPivot = new THREE.Group();
    const balconySlider = new THREE.Group();

    // Interior Warm Lighting
    const livingLight = new THREE.PointLight(0xffe2a3, 2.4, 18);
    // Keep warm fill lighting without an expensive six-face point-light shadow map.
    livingLight.castShadow = false;
    livingLight.shadow.bias = -0.002;
    livingLight.position.set(-2, 4.6, 0);
    root.add(livingLight);

    const livingLightGlow = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 16, 16),
      MaterialsLibrary.get('glow-warm')
    );
    livingLightGlow.position.copy(livingLight.position);
    root.add(livingLightGlow);

    const diningLight = new THREE.PointLight(0xffdf99, 1.8, 14);
    diningLight.position.set(3.8, 2.7, -1.0);
    root.add(diningLight);

    const diningLightGlow = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.4, 0.1, 24),
      MaterialsLibrary.get('glow-warm')
    );
    diningLightGlow.position.copy(diningLight.position);
    root.add(diningLightGlow);

    if (propertyId === 'prop-villa-solaria') {
      this.buildVillaLumina(root, furnitureGroup, interactiveObjects);
    } else if (propertyId === 'prop-sky-residence') {
      this.buildSkyResidence(root, furnitureGroup, interactiveObjects);
    } else {
      this.buildObsidianPavilion(
        root,
        furnitureGroup,
        interactiveObjects,
        frontDoorPivot,
        masterDoorPivot,
        balconySlider,
        colliders
      );
    }

    return {
      frontDoorPivot,
      masterDoorPivot,
      balconySlider,
      livingLight,
      livingLightGlow,
      diningLight,
      diningLightGlow,
      furnitureGroup,
      interactiveObjects,
      colliders
    };
  }

  // ==========================================
  // FLAGSHIP: THE OBSIDIAN PAVILION (LUXURY VILLA)
  // ==========================================
  private static buildObsidianPavilion(
    root: THREE.Group,
    furnitureGroup: THREE.Group,
    interactiveObjects: THREE.Object3D[],
    frontDoorPivot: THREE.Group,
    masterDoorPivot: THREE.Group,
    balconySlider: THREE.Group,
    colliders: THREE.Box3[]
  ) {
    const whiteStucco = MaterialsLibrary.get('stucco-white');
    const woodSlats = MaterialsLibrary.get('wood-slats');
    const parquetFloor = MaterialsLibrary.get('parquet-oak');
    const travertine = MaterialsLibrary.get('travertine');
    const darkBronze = MaterialsLibrary.get('dark-bronze');
    const glassFacade = MaterialsLibrary.get('glass-facade');
    const glassRailing = MaterialsLibrary.get('glass-balustrade');
    const brass = MaterialsLibrary.get('champagne-bronze');
    const marble = MaterialsLibrary.get('calacatta-marble');
    const glowWarm = MaterialsLibrary.get('glow-warm');
    const poolWater = MaterialsLibrary.get('water-pool');
    const lawn = MaterialsLibrary.get('lawn');
    for (let z = 12; z <= 20; z += 1.8) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 1.2), travertine);
      step.position.set(0.8, 0.04, z);
      step.receiveShadow = true;
      root.add(step);

      // Warm ground path lights
      const marker = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.35, 12), brass);
      marker.position.set(-0.3, 0.18, z);
      root.add(marker);
      const markerGlow = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), glowWarm);
      markerGlow.position.set(-0.3, 0.36, z);
      root.add(markerGlow);
    }

    // 2. Infinity Swimming Pool (Vibrant Turquoise Water)
    const poolBasin = new THREE.Mesh(
      new THREE.BoxGeometry(18, 1.5, 7.5),
      MaterialsLibrary.get('pool-tiles')
    );
    poolBasin.position.set(0, -0.75, -11.5);
    root.add(poolBasin);

    const water = new THREE.Mesh(new THREE.BoxGeometry(17.4, 0.1, 6.9), poolWater);
    water.position.set(0, -0.1, -11.5);
    root.add(water);

    // White pool coping border
    const copingNorth = new THREE.Mesh(new THREE.BoxGeometry(18.6, 0.15, 0.6), travertine);
    copingNorth.position.set(0, 0.02, -15.4);
    root.add(copingNorth);

    // Sunken Fire Lounge with glowing embers
    const firePit = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.4, 3.6), travertine);
    firePit.position.set(10.5, 0.1, -9.5);
    root.add(firePit);

    const fireEmbers = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 0.8, 0.15, 16),
      glowWarm
    );
    fireEmbers.position.set(10.5, 0.35, -9.5);
    root.add(fireEmbers);

    // 3. Interior Flooring (Warm Herringbone Wood Parquet)
    const floorSlab = new THREE.Mesh(new THREE.BoxGeometry(22, 0.12, 18), parquetFloor);
    floorSlab.position.set(0, 0.06, 0.5);
    floorSlab.receiveShadow = true;
    root.add(floorSlab);

    // 4. Exterior Architecture: Warm Cedar Wood Slats & White Stucco Panels
    // West Wing (Garage & Powder Room) clad in warm Cedar Wood slats
    const westWoodWing = new THREE.Mesh(new THREE.BoxGeometry(0.5, 6.8, 18), woodSlats);
    westWoodWing.position.set(-11, 3.4, 0.5);
    westWoodWing.castShadow = true;
    westWoodWing.receiveShadow = true;
    root.add(westWoodWing);

    // Front Garage Wood Slat Wall
    const garageFacade = new THREE.Mesh(new THREE.BoxGeometry(8, 3.4, 0.5), woodSlats);
    garageFacade.position.set(-7, 1.7, 9.5);
    garageFacade.castShadow = true;
    root.add(garageFacade);

    // Garage glass showroom gate with bronze frame
    const garageGlass = new THREE.Mesh(new THREE.BoxGeometry(6.6, 2.9, 0.1), glassFacade);
    garageGlass.position.set(-6.5, 1.45, 9.55);
    root.add(garageGlass);

    // East Wing Structural Wall (Crisp architectural white stucco)
    const eastStuccoWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 6.8, 18), whiteStucco);
    eastStuccoWall.position.set(11, 3.4, 0.5);
    eastStuccoWall.castShadow = true;
    eastStuccoWall.receiveShadow = true;
    root.add(eastStuccoWall);

    // 5. Front Entrance & Interactive Warm Timber Pivot Door
    frontDoorPivot.position.set(0, 0, 9.5);
    const pivotDoorMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 3.2, 0.12),
      woodSlats
    );
    pivotDoorMesh.position.set(0.9, 1.6, 0);
    frontDoorPivot.add(pivotDoorMesh);

    // Bronze pull handle
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.6, 0.08), brass);
    handle.position.set(1.6, 1.6, 0.09);
    frontDoorPivot.add(handle);

    pivotDoorMesh.userData = {
      id: 'obj-front-door',
      name: 'Grand Timber Pivot Entrance Door',
      type: 'door',
      description: 'Solid teak vertical slat pivot entry door with brushed champagne brass pull.'
    };
    interactiveObjects.push(pivotDoorMesh);
    root.add(frontDoorPivot);

    // Entrance glass flanking wall
    const entryGlass = new THREE.Mesh(new THREE.BoxGeometry(4.2, 3.4, 0.08), glassFacade);
    entryGlass.position.set(3.3, 1.7, 9.5);
    root.add(entryGlass);

    // 6. Double-Height Front & Rear Glass Curtain Walls
    const northGlass = new THREE.Mesh(new THREE.BoxGeometry(20, 6.4, 0.08), glassFacade);
    northGlass.position.set(0, 3.2, -8.5);
    root.add(northGlass);

    // Architectural Bronze Mullions
    for (let x = -8; x <= 8; x += 4) {
      const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.12, 6.4, 0.2), darkBronze);
      mullion.position.set(x, 3.2, -8.5);
      root.add(mullion);

      const frontMullion = new THREE.Mesh(new THREE.BoxGeometry(0.12, 6.4, 0.2), darkBronze);
      frontMullion.position.set(x, 3.2, 9.5);
      root.add(frontMullion);
    }

    // Slim bronze rails and soft linen drapes make the glazing read like a real home window wall.
    for (const z of [-8.5, 9.5]) {
      for (const y of [1.15, 3.2, 5.25]) {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(20, 0.055, 0.14), darkBronze);
        rail.position.set(0, y, z);
        root.add(rail);
      }
    }
    const curtainFabric = MaterialsLibrary.get('fabric-ivory');
    for (const x of [-9.2, 9.2]) {
      const curtain = new THREE.Mesh(new THREE.BoxGeometry(1.1, 6.1, 0.16), curtainFabric);
      curtain.position.set(x, 3.2, -8.27);
      root.add(curtain);
      for (let fold = -4; fold <= 4; fold += 2) {
        const pleat = new THREE.Mesh(new THREE.BoxGeometry(0.045, 6.05, 0.2), MaterialsLibrary.get('fabric-sofa'));
        pleat.position.set(x + fold * 0.08, 3.2, -8.25);
        root.add(pleat);
      }
    }

    // 7. Cantilevered White Architectural Canopy & Roof
    const roofSlab = new THREE.Mesh(new THREE.BoxGeometry(26, 0.45, 22), whiteStucco);
    roofSlab.position.set(0, 6.9, 0.5);
    roofSlab.castShadow = true;
    roofSlab.receiveShadow = true;
    root.add(roofSlab);

    // Recessed roof soffit eave downlight fixtures (Glowing gold discs)
    for (let x = -9; x <= 9; x += 3) {
      const downlightDisc = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 0.04, 16),
        glowWarm
      );
      downlightDisc.position.set(x, 6.66, 10.2);
      root.add(downlightDisc);
    }

    // 8. Fireplace in Living Room (White Travertine with Glowing Hearth)
    const fireplace = new THREE.Mesh(new THREE.BoxGeometry(0.7, 6.4, 3.8), travertine);
    fireplace.position.set(-6.5, 3.2, -2.0);
    fireplace.castShadow = true;
    root.add(fireplace);

    const fireOpening = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.65, 2.5), glowWarm);
    fireOpening.position.set(-6.2, 0.7, -2.0);
    fireOpening.userData = {
      id: 'spot-fireplace',
      name: 'Linear Travertine Fireplace',
      type: 'furniture',
      description: 'Honed travertine linear fireplace with glowing natural gas ceramic embers.'
    };
    interactiveObjects.push(fireOpening);
    root.add(fireOpening);

    // Contemporary Wall Art above fireplace
    const canvasArt = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 2.2, 1.8),
      MaterialsLibrary.get('wood-slats')
    );
    canvasArt.position.set(-6.1, 4.0, -2.0);
    root.add(canvasArt);

    // 9. Floating Travertine Cantilever Staircase
    for (let i = 0; i < 16; i++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.12, 0.35), travertine);
      const stepY = 0.22 + i * 0.22;
      const stepZ = 7.0 - i * 0.32;
      step.position.set(-1.5, stepY, stepZ);
      step.castShadow = true;
      root.add(step);
    }

    const stairGlass = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.2, 5.4), glassRailing);
    stairGlass.position.set(-0.75, 2.2, 4.5);
    stairGlass.rotation.x = 0.55;
    root.add(stairGlass);

    // 10. Upper Floor Mezzanine & Bridge
    const upperEastSlab = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.3, 17.5), parquetFloor);
    upperEastSlab.position.set(5.5, 3.6, 0.5);
    upperEastSlab.receiveShadow = true;
    root.add(upperEastSlab);

    const upperWestSlab = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.3, 10.5), parquetFloor);
    upperWestSlab.position.set(-5.5, 3.6, -3.0);
    upperWestSlab.receiveShadow = true;
    root.add(upperWestSlab);

    // Bridge over double-height salon
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.3, 2.2), parquetFloor);
    bridge.position.set(0, 3.6, 0.5);
    root.add(bridge);

    const bridgeRailNorth = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.1, 0.04), glassRailing);
    bridgeRailNorth.position.set(0, 4.25, -0.6);
    root.add(bridgeRailNorth);

    const bridgeRailSouth = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.1, 0.04), glassRailing);
    bridgeRailSouth.position.set(0, 4.25, 1.6);
    root.add(bridgeRailSouth);

    // 11. Cantilevered Master Balcony Overlooking Pool
    const balconySlab = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.35, 3.8), travertine);
    balconySlab.position.set(-4.5, 3.6, -9.8);
    balconySlab.castShadow = true;
    root.add(balconySlab);

    const balcGlass = new THREE.Mesh(new THREE.BoxGeometry(7.0, 1.1, 0.04), glassRailing);
    balcGlass.position.set(-4.5, 4.25, -11.6);
    root.add(balcGlass);

    const balcCap = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.05, 0.08), brass);
    balcCap.position.set(-4.5, 4.8, -11.6);
    root.add(balcCap);

    // Balcony slider door
    balconySlider.position.set(-4.0, 3.6, -8.4);
    const sliderMesh = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.0, 0.06), glassFacade);
    sliderMesh.position.set(1.2, 1.5, 0);
    sliderMesh.userData = {
      id: 'obj-master-curtains',
      name: 'Balcony Glass Slider',
      type: 'door',
      description: 'Motorized Schuco glass slider opening to cantilevered pool deck.'
    };
    interactiveObjects.push(sliderMesh);
    balconySlider.add(sliderMesh);
    root.add(balconySlider);

    // Master Bedroom Acoustic Door
    masterDoorPivot.position.set(-1.0, 3.6, 1.8);
    const masterDoor = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.8, 1.0), woodSlats);
    masterDoor.position.set(0, 1.4, 0.5);
    masterDoor.userData = {
      id: 'obj-master-door',
      name: 'Master Suite Acoustic Door',
      type: 'door',
      description: 'Acoustic door in honey teak slats.'
    };
    interactiveObjects.push(masterDoor);
    masterDoorPivot.add(masterDoor);
    root.add(masterDoorPivot);

    // Full-height partitions divide the upper level into a master suite and two guest rooms.
    // Deliberate door openings connect each bedroom back to the stair and gallery circulation.
    const partitionY = 5.08;
    const partitionHeight = 2.65;
    const addUpperWallAcross = (minX: number, maxX: number, z: number) => {
      if (maxX <= minX) return;
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(maxX - minX, partitionHeight, 0.16),
        whiteStucco
      );
      wall.position.set((minX + maxX) / 2, partitionY, z);
      wall.castShadow = true;
      wall.receiveShadow = true;
      root.add(wall);
    };
    const addUpperWallAlong = (x: number, minZ: number, maxZ: number) => {
      if (maxZ <= minZ) return;
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, partitionHeight, maxZ - minZ),
        whiteStucco
      );
      wall.position.set(x, partitionY, (minZ + maxZ) / 2);
      wall.castShadow = true;
      wall.receiveShadow = true;
      root.add(wall);
    };

    // Guest wing: corridor doors are left open in the wall runs for clear room-to-room access.
    addUpperWallAcross(0.25, 2.2, 0.15);
    addUpperWallAcross(3.5, 10.75, 0.15);
    addUpperWallAlong(2.2, -8.2, -4.2);
    addUpperWallAlong(2.2, -2.8, 2.4);
    addUpperWallAlong(2.2, 3.7, 9.1);

    // Master suite and ensuite are separated from the upper gallery by two wide openings.
    addUpperWallAcross(-10.75, -6.8, 0.15);
    addUpperWallAcross(-5.4, -4.3, 0.15);
    addUpperWallAcross(-3.0, -1.95, 0.15);
    addUpperWallAcross(-0.65, -0.25, 0.15);

    // 12. Kitchen Calacatta Waterfall Island & Joinery
    const island = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.95, 4.2), marble);
    island.position.set(2.5, 0.48, -4.2);
    island.castShadow = true;
    island.receiveShadow = true;
    island.userData = {
      id: 'spot-marble-island',
      name: 'Calacatta Gold Waterfall Island',
      type: 'appliance',
      description: 'Monolithic slab of Italian Calacatta Gold marble with brass prep faucet.'
    };
    interactiveObjects.push(island);
    furnitureGroup.add(island);

    // Bora cooktop
    const cooktop = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.02, 1.2), darkBronze);
    cooktop.position.set(2.5, 0.96, -4.2);
    cooktop.userData = {
      id: 'obj-kitchen-cooktop',
      name: 'Bora Induction Cooktop',
      type: 'appliance',
      description: 'Flush-mount induction system with center vapor extractor.'
    };
    interactiveObjects.push(cooktop);
    furnitureGroup.add(cooktop);

    // Kitchen Wood Cabinetry Wall
    const kitchenWall = new THREE.Mesh(new THREE.BoxGeometry(1.0, 3.4, 6.2), woodSlats);
    kitchenWall.position.set(9.8, 1.7, -4.2);
    kitchenWall.castShadow = true;
    furnitureGroup.add(kitchenWall);

    // 13. High-End Furnishings (Sofas, Chairs, Beds, Tables)
    // Living Room Sectional Sofa (Ivory/Charcoal upholstery)
    const sofaMain = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 0.68, 1.2),
      MaterialsLibrary.get('fabric-sofa')
    );
    sofaMain.position.set(-3.5, 0.4, 0.5);
    sofaMain.castShadow = true;
    sofaMain.userData = {
      id: 'obj-living-sectional',
      name: 'Textured charcoal sectional sofa',
      type: 'furniture',
      description: 'Deep, woven upholstery with separate seat cushions, padded arms, and loose accent pillows.'
    };
    interactiveObjects.push(sofaMain);
    furnitureGroup.add(sofaMain);

    // Separate cushions and backrest give the sectional a recognizable, upholstered silhouette.
    const seatCushionMat = MaterialsLibrary.get('fabric-ivory');
    const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(4.05, 0.78, 0.34), MaterialsLibrary.get('fabric-sofa'));
    sofaBack.position.set(-3.5, 0.98, 1.02);
    sofaBack.castShadow = true;
    furnitureGroup.add(sofaBack);
    for (const x of [-4.8, -3.5, -2.2]) {
      const seat = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.2, 1.08), seatCushionMat);
      seat.position.set(x, 0.79, 0.42);
      seat.castShadow = true;
      furnitureGroup.add(seat);
      const backCushion = new THREE.Mesh(new THREE.BoxGeometry(1.08, 0.62, 0.22), MaterialsLibrary.get('fabric-sofa'));
      backCushion.position.set(x, 1.12, 0.8);
      backCushion.rotation.x = -0.12;
      furnitureGroup.add(backCushion);
    }
    for (const x of [-5.55, -1.45]) {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.72, 1.24), MaterialsLibrary.get('fabric-sofa'));
      arm.position.set(x, 0.7, 0.5);
      arm.castShadow = true;
      furnitureGroup.add(arm);
    }
    for (const [x, z, rotation] of [[-4.9, 0.76, -0.14], [-2.55, 0.76, 0.12]] as const) {
      const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.48, 0.2), MaterialsLibrary.get('fabric-ivory'));
      pillow.position.set(x, 1.05, z);
      pillow.rotation.z = rotation;
      furnitureGroup.add(pillow);
    }

    const sofaChaise = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.68, 2.6),
      MaterialsLibrary.get('fabric-sofa')
    );
    sofaChaise.position.set(-5.2, 0.4, -0.2);
    sofaChaise.castShadow = true;
    furnitureGroup.add(sofaChaise);
    const chaisePad = new THREE.Mesh(new THREE.BoxGeometry(1.08, 0.18, 2.42), seatCushionMat);
    chaisePad.position.set(-5.2, 0.79, -0.25);
    furnitureGroup.add(chaisePad);

    // Travertine Coffee Table
    const coffeeTable = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.35, 1.1), travertine);
    coffeeTable.position.set(-3.2, 0.25, -1.0);
    coffeeTable.castShadow = true;
    furnitureGroup.add(coffeeTable);

    // Cognac Leather Lounge Chair
    const loungeChair = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.8, 0.9),
      MaterialsLibrary.get('leather-cognac')
    );
    loungeChair.position.set(-1.8, 0.45, 1.8);
    loungeChair.rotation.y = -0.5;
    loungeChair.userData = {
      id: 'obj-eames-lounge',
      name: 'Cognac Leather Lounge Setting',
      type: 'furniture',
      description: 'Sculptural lounge chair in full-grain cognac leather.'
    };
    interactiveObjects.push(loungeChair);
    furnitureGroup.add(loungeChair);

    // Dining Table (Warm Teak & Brass)
    const diningTable = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 3.4), woodSlats);
    diningTable.position.set(3.8, 0.75, -1.0);
    diningTable.castShadow = true;
    furnitureGroup.add(diningTable);

    // Dining Chairs (8 with ivory fabric)
    for (let c = -1.2; c <= 1.2; c += 0.8) {
      const chair1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.8, 0.5),
        MaterialsLibrary.get('fabric-ivory')
      );
      chair1.position.set(3.0, 0.45, -1.0 + c);
      furnitureGroup.add(chair1);

      const chair2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.8, 0.5),
        MaterialsLibrary.get('fabric-ivory')
      );
      chair2.position.set(4.6, 0.45, -1.0 + c);
      furnitureGroup.add(chair2);
    }

    // Master Bedroom King Platform Bed
    const bedBase = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 2.2), woodSlats);
    bedBase.position.set(-3.5, 3.9, -3.5);
    furnitureGroup.add(bedBase);

    const mattress = new THREE.Mesh(
      new THREE.BoxGeometry(2.1, 0.35, 2.0),
      MaterialsLibrary.get('fabric-ivory')
    );
    mattress.position.set(-3.5, 4.3, -3.5);
    furnitureGroup.add(mattress);

    // Finished three-bedroom suite details: upholstered headboards, layered bedding, pillows and nightstands.
    const bedroomWood = MaterialsLibrary.get('wood-slats');
    const linen = MaterialsLibrary.get('fabric-ivory');
    const charcoalLinen = MaterialsLibrary.get('fabric-sofa');
    const addBedroomSet = (x: number, z: number, width: number, floorY: number, accent: THREE.Material) => {
      const headboard = new THREE.Mesh(new THREE.BoxGeometry(width + 0.24, 1.15, 0.16), bedroomWood);
      headboard.position.set(x, floorY + 0.92, z - 1.12);
      headboard.castShadow = true;
      furnitureGroup.add(headboard);

      const duvet = new THREE.Mesh(new THREE.BoxGeometry(width - 0.12, 0.16, 1.35), linen);
      duvet.position.set(x, floorY + 0.67, z + 0.28);
      duvet.castShadow = true;
      furnitureGroup.add(duvet);

      const bedThrow = new THREE.Mesh(new THREE.BoxGeometry(width - 0.14, 0.1, 0.52), accent);
      bedThrow.position.set(x, floorY + 0.79, z + 0.62);
      furnitureGroup.add(bedThrow);

      for (const side of [-1, 1]) {
        const pillow = new THREE.Mesh(new THREE.BoxGeometry(width * 0.36, 0.16, 0.42), linen);
        pillow.position.set(x + side * width * 0.22, floorY + 0.79, z - 0.58);
        furnitureGroup.add(pillow);

        const nightstand = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.55, 0.52), bedroomWood);
        nightstand.position.set(x + side * (width / 2 + 0.42), floorY + 0.28, z - 0.68);
        furnitureGroup.add(nightstand);
        const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 0.2, 12), brass);
        lampBase.position.set(x + side * (width / 2 + 0.42), floorY + 0.66, z - 0.68);
        furnitureGroup.add(lampBase);
        const lampShade = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.21, 0.26, 16), glowWarm);
        lampShade.position.set(x + side * (width / 2 + 0.42), floorY + 0.87, z - 0.68);
        furnitureGroup.add(lampShade);
      }
    };
    addBedroomSet(-3.5, -3.5, 2.4, 3.75, charcoalLinen);

    // Sculptural Soaking Tub in Master Spa
    const tub = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.55, 0.65, 24), marble);
    tub.position.set(-6.5, 4.05, 1.5);
    furnitureGroup.add(tub);

    // Guest Bedrooms Beds
    const bed2Base = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.28, 2.2), bedroomWood);
    bed2Base.position.set(4.5, 3.88, -3.5);
    furnitureGroup.add(bed2Base);
    const bed2Mattress = new THREE.Mesh(new THREE.BoxGeometry(1.86, 0.28, 2.04), linen);
    bed2Mattress.position.set(4.5, 4.27, -3.5);
    furnitureGroup.add(bed2Mattress);
    addBedroomSet(4.5, -3.5, 1.8, 3.75, charcoalLinen);

    const bed3Base = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.28, 2.2), bedroomWood);
    bed3Base.position.set(4.5, 3.88, 3.0);
    furnitureGroup.add(bed3Base);
    const bed3Mattress = new THREE.Mesh(new THREE.BoxGeometry(1.86, 0.28, 2.04), linen);
    bed3Mattress.position.set(4.5, 4.27, 3.0);
    furnitureGroup.add(bed3Mattress);
    addBedroomSet(4.5, 3.0, 1.8, 3.75, linen);

    // Poolside Sun Loungers with Ivory Cushions & Umbrella
    for (let l = -4; l <= 4; l += 3.2) {
      const loungerBase = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.25, 2.1), woodSlats);
      loungerBase.position.set(l, 0.12, -16.0);
      furnitureGroup.add(loungerBase);

      const cushion = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.12, 2.0),
        MaterialsLibrary.get('fabric-ivory')
      );
      cushion.position.set(l, 0.28, -16.0);
      furnitureGroup.add(cushion);
    }

    // Modern Pool Umbrella
    const umbrellaPole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.0, 12), brass);
    umbrellaPole.position.set(6.5, 1.5, -16.0);
    furnitureGroup.add(umbrellaPole);

    const umbrellaCanopy = new THREE.Mesh(
      new THREE.ConeGeometry(1.8, 0.6, 8),
      MaterialsLibrary.get('fabric-ivory')
    );
    umbrellaCanopy.position.set(6.5, 3.0, -16.0);
    furnitureGroup.add(umbrellaCanopy);

    // 14. Rich Landscaping: Sculptural Lush Trees, Hedges, & Planter Beds
    const treePositions = [
      { x: -14, z: 10, scale: 1.2 },
      { x: -15, z: 2, scale: 1.0 },
      { x: 13, z: 12, scale: 1.1 },
      { x: 15, z: 5, scale: 1.0 },
      { x: 13, z: -14, scale: 1.2 },
      { x: -14, z: -15, scale: 1.1 }
    ];

    treePositions.forEach((pos) => {
      // Natural textured trunk
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2 * pos.scale, 0.3 * pos.scale, 4.2 * pos.scale, 12),
        MaterialsLibrary.get('tree-bark')
      );
      trunk.position.set(pos.x, 2.1 * pos.scale, pos.z);
      trunk.castShadow = true;
      root.add(trunk);

      // Layered organic foliage spheres (looks lush, rich, and architectural!)
      const foliageGroup = new THREE.Group();
      const folMat1 = MaterialsLibrary.get('foliage-green');
      const folMat2 = MaterialsLibrary.get('foliage-olive');
      const folMat3 = MaterialsLibrary.get('foliage-emerald');

      const sphere1 = new THREE.Mesh(new THREE.SphereGeometry(1.6 * pos.scale, 16, 16), folMat1);
      sphere1.position.set(0, 3.8 * pos.scale, 0);
      foliageGroup.add(sphere1);

      const sphere2 = new THREE.Mesh(new THREE.SphereGeometry(1.3 * pos.scale, 16, 16), folMat2);
      sphere2.position.set(0.6 * pos.scale, 4.5 * pos.scale, 0.4 * pos.scale);
      foliageGroup.add(sphere2);

      const sphere3 = new THREE.Mesh(new THREE.SphereGeometry(1.2 * pos.scale, 16, 16), folMat3);
      sphere3.position.set(-0.5 * pos.scale, 4.3 * pos.scale, -0.4 * pos.scale);
      foliageGroup.add(sphere3);

      foliageGroup.position.set(pos.x, 0, pos.z);
      foliageGroup.castShadow = true;
      root.add(foliageGroup);
    });

    // Manicured Boxwood Shrub Hedges along facade base
    for (let h = -9; h <= 9; h += 2.2) {
      if (Math.abs(h) > 1.5) { // Leave entrance path clear
        const hedge = new THREE.Mesh(
          new THREE.BoxGeometry(1.8, 0.65, 0.8),
          MaterialsLibrary.get('foliage-green')
        );
        hedge.position.set(h, 0.32, 10.4);
        hedge.castShadow = true;
        root.add(hedge);
      }
    }

    // 15. Luxury Modern Sports Coupe on Driveway
    const carGroup = new THREE.Group();
    const carBody = new THREE.Mesh(
      new THREE.BoxGeometry(2.1, 0.65, 4.4),
      MaterialsLibrary.get('car-metallic')
    );
    carBody.position.set(-8.0, 0.55, 14.0);
    carGroup.add(carBody);

    const carCabin = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.48, 2.2), glassFacade);
    carCabin.position.set(-8.0, 1.05, 13.8);
    carGroup.add(carCabin);

    // Glowing LED Headlights
    const hl1 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.1), glowWarm);
    hl1.position.set(-8.6, 0.58, 16.22);
    const hl2 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.1), glowWarm);
    hl2.position.set(-7.4, 0.58, 16.22);
    carGroup.add(hl1, hl2);

    // Wheels
    for (let wz of [12.6, 15.2]) {
      for (let wx of [-9.1, -6.9]) {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.25, 16), darkBronze);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(wx, 0.35, wz);
        carGroup.add(wheel);
      }
    }
    root.add(carGroup);

    colliders.push(
      new THREE.Box3(new THREE.Vector3(-11, 0, -8.5), new THREE.Vector3(11, 7, 9.5))
    );
  }

  // ==========================================
  // PROPERTY 2: VILLA LUMINA (MEDITERRANEAN)
  // ==========================================
  private static buildVillaLumina(
    root: THREE.Group,
    furnitureGroup: THREE.Group,
    interactiveObjects: THREE.Object3D[]
  ) {
    const brass = MaterialsLibrary.get('champagne-bronze');
    const oak = MaterialsLibrary.get('parquet-oak');
    const linen = MaterialsLibrary.get('fabric-ivory');
    const olive = MaterialsLibrary.get('foliage-olive');
    const greenery = MaterialsLibrary.get('foliage-green');
    const glow = MaterialsLibrary.get('glow-warm');
    const whiteStucco = MaterialsLibrary.get('stucco-white');
    const travertine = MaterialsLibrary.get('travertine');
    const woodSlats = MaterialsLibrary.get('wood-slats');
    const poolWater = MaterialsLibrary.get('water-pool');
    const glass = MaterialsLibrary.get('glass-facade');
    const lawn = MaterialsLibrary.get('lawn');

    const lawnMesh = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), lawn);
    lawnMesh.rotation.x = -Math.PI / 2;
    lawnMesh.position.y = -0.05;
    root.add(lawnMesh);

    const platform = new THREE.Mesh(new THREE.BoxGeometry(36, 0.45, 28), travertine);
    platform.position.set(0, -0.22, 0);
    root.add(platform);

    const pool = new THREE.Mesh(new THREE.BoxGeometry(24, 0.1, 6.0), poolWater);
    pool.position.set(0, -0.1, -9);
    root.add(pool);

    const mainRoof = new THREE.Mesh(new THREE.BoxGeometry(28, 0.45, 15), whiteStucco);
    mainRoof.position.set(0, 4.0, 2);
    root.add(mainRoof);

    for (let x = -12; x <= 12; x += 4.8) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 4.0, 16), whiteStucco);
      col.position.set(x, 2.0, -4.5);
      root.add(col);
    }

    const glassWall = new THREE.Mesh(new THREE.BoxGeometry(26, 3.8, 0.06), glass);
    glassWall.position.set(0, 1.9, -4.0);
    root.add(glassWall);

    const sunkenLounge = new THREE.Mesh(
      new THREE.BoxGeometry(5.5, 0.55, 4.5),
      MaterialsLibrary.get('fabric-ivory')
    );
    sunkenLounge.position.set(-2, 0.28, 2);
    sunkenLounge.userData = {
      id: 'room-villa-living',
      name: 'Sunken Sea Lounge',
      type: 'furniture',
      description: 'Sunken seating area in white textured plaster and linen.'
    };
    interactiveObjects.push(sunkenLounge);
    furnitureGroup.add(sunkenLounge);

    const loungeBack = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.8, 0.5), linen);
    loungeBack.position.set(-2, 0.75, 3.95);
    furnitureGroup.add(loungeBack);
    const diningTable = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.55, 0.16, 32), oak);
    diningTable.position.set(6.7, 1.0, 1.3);
    furnitureGroup.add(diningTable);
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const chair = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.7, 0.55), linen);
      chair.position.set(6.7 + Math.cos(angle) * 2.0, 0.55, 1.3 + Math.sin(angle) * 2.0);
      chair.lookAt(diningTable.position);
      furnitureGroup.add(chair);
    }
    const bed = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.35, 2.2), linen);
    bed.position.set(-8.0, 0.55, 3.1);
    furnitureGroup.add(bed);
    const bedHeadboard = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.4, 0.18), woodSlats);
    bedHeadboard.position.set(-8.0, 1.1, 4.15);
    furnitureGroup.add(bedHeadboard);

    const chandelier = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.08, 12, 32), brass);
    chandelier.position.set(4.5, 3.75, 1.5);
    chandelier.userData = {
      id: 'obj-villa-lights',
      name: 'Villa Lumina Pendant Lights',
      type: 'light',
      description: 'Warm architectural pendants across the open-plan pavilion.'
    };
    interactiveObjects.push(chandelier);
    root.add(chandelier);
    const villaPointLight = new THREE.PointLight(0xffd9a0, 2.2, 14);
    villaPointLight.position.set(4.5, 3.4, 1.5);
    root.add(villaPointLight);

    const pergola = new THREE.Group();
    for (const x of [-9.5, -5.5]) {
      for (const z of [-6.8, -2.3]) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.18, 3.8, 0.18), woodSlats);
        post.position.set(x, 2.2, z);
        pergola.add(post);
      }
    }
    for (let x = -10; x <= -5; x += 0.55) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 4.8), woodSlats);
      beam.position.set(x, 4.05, -4.55);
      pergola.add(beam);
    }
    root.add(pergola);

    // Ancient Olive tree in courtyard
    const oliveTrunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.55, 3.2, 12),
      MaterialsLibrary.get('tree-bark')
    );
    oliveTrunk.position.set(6, 1.6, 3);
    root.add(oliveTrunk);

    const oliveLeaves = new THREE.Mesh(
      new THREE.SphereGeometry(2.0, 16, 16),
      MaterialsLibrary.get('foliage-olive')
    );
    oliveLeaves.position.set(6, 3.8, 3);
    root.add(oliveLeaves);
    for (const [x, y, z, scale] of [[5.2, 4.5, 2.3, 0.9], [6.8, 4.2, 3.4, 0.8], [5.8, 5.0, 3.8, 0.7]] as const) {
      const leafCluster = new THREE.Mesh(new THREE.IcosahedronGeometry(scale, 1), olive);
      leafCluster.position.set(x, y, z);
      leafCluster.castShadow = true;
      root.add(leafCluster);
    }
    for (const x of [-10.5, -8.6, 8.4, 10.2]) {
      const planter = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, 0.65, 20), travertine);
      planter.position.set(x, 0.45, -5.5);
      root.add(planter);
      const plant = new THREE.Mesh(new THREE.SphereGeometry(0.65, 12, 8), greenery);
      plant.position.set(x, 1.15, -5.5);
      root.add(plant);
    }
    for (const x of [-8, -4, 0, 4, 8]) {
      const light = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.35, 12), brass);
      light.position.set(x, 0.3, -6.8);
      root.add(light);
      const lightGlow = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), glow);
      lightGlow.position.set(x, 0.5, -6.8);
      root.add(lightGlow);
    }
  }

  // ==========================================
  // PROPERTY 3: THE SKY RESIDENCE (PENTHOUSE)
  // ==========================================
  private static buildSkyResidence(
    root: THREE.Group,
    furnitureGroup: THREE.Group,
    interactiveObjects: THREE.Object3D[]
  ) {
    const parquet = MaterialsLibrary.get('parquet-oak');
    const marble = MaterialsLibrary.get('calacatta-marble');
    const glass = MaterialsLibrary.get('glass-facade');
    const brass = MaterialsLibrary.get('champagne-bronze');
    const whiteStucco = MaterialsLibrary.get('stucco-white');

    const floor = new THREE.Mesh(new THREE.BoxGeometry(22, 0.4, 18), parquet);
    floor.position.set(0, -0.2, 0);
    root.add(floor);

    const northGlass = new THREE.Mesh(new THREE.BoxGeometry(21.8, 7.5, 0.05), glass);
    northGlass.position.set(0, 3.75, -8.9);
    root.add(northGlass);

    const southGlass = new THREE.Mesh(new THREE.BoxGeometry(21.8, 7.5, 0.05), glass);
    southGlass.position.set(0, 3.75, 8.9);
    root.add(southGlass);

    for (let x = -9; x <= 9; x += 4.5) {
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.12, 7.5, 0.12), brass);
      frame.position.set(x, 3.75, -8.88);
      root.add(frame);
    }

    const mezzanine = new THREE.Mesh(new THREE.BoxGeometry(21.5, 0.35, 7.5), parquet);
    mezzanine.position.set(0, 4.0, 4.5);
    root.add(mezzanine);

    const mezRailing = new THREE.Mesh(
      new THREE.BoxGeometry(21.5, 1.1, 0.04),
      MaterialsLibrary.get('glass-balustrade')
    );
    mezRailing.position.set(0, 4.65, 0.7);
    root.add(mezRailing);

    const ceiling = new THREE.Mesh(new THREE.BoxGeometry(22, 0.4, 18), whiteStucco);
    ceiling.position.set(0, 7.6, 0);
    root.add(ceiling);

    const greatSofa = new THREE.Mesh(
      new THREE.BoxGeometry(4.8, 0.7, 1.5),
      MaterialsLibrary.get('fabric-ivory')
    );
    greatSofa.position.set(0, 0.4, -2);
    greatSofa.userData = {
      id: 'room-sky-great',
      name: 'Double-Height Great Room',
      type: 'furniture',
      description: 'Towering volume with Central Park picture windows.'
    };
    interactiveObjects.push(greatSofa);
    furnitureGroup.add(greatSofa);

    const monolith = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.95, 4.0), marble);
    monolith.position.set(4.5, 0.48, -2.5);
    furnitureGroup.add(monolith);

    // City Skyline Cylinder
    const skylineGeo = new THREE.CylinderGeometry(50, 50, 40, 32, 1, true);
    const skylineMat = new THREE.MeshBasicMaterial({
      color: 0x223652,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.85
    });
    const skylineMesh = new THREE.Mesh(skylineGeo, skylineMat);
    skylineMesh.position.y = 8;
    root.add(skylineMesh);
  }
}
