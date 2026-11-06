import * as THREE from 'three';

export class MaterialsLibrary {
  private static materials: Map<string, THREE.Material> = new Map();

  // Procedural canvas textures for realistic tactile finishes
  private static createWoodSlatTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Warm honey-cedar background
    ctx.fillStyle = '#b8834a';
    ctx.fillRect(0, 0, 512, 512);

    // Vertical architectural wood slats with subtle depth
    for (let x = 0; x < 512; x += 16) {
      // Wood slat body
      const gradient = ctx.createLinearGradient(x, 0, x + 14, 0);
      gradient.addColorStop(0, '#caa066');
      gradient.addColorStop(0.5, '#ba8b52');
      gradient.addColorStop(1, '#9a6d36');
      ctx.fillStyle = gradient;
      ctx.fillRect(x + 2, 0, 12, 512);

      // Deep shadow gap between slats
      ctx.fillStyle = '#26170d';
      ctx.fillRect(x, 0, 2, 512);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  }

  private static createParquetTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#d8af78';
    ctx.fillRect(0, 0, 512, 512);

    // Herringbone / parquet wood plank patterns
    for (let y = 0; y < 512; y += 32) {
      for (let x = 0; x < 512; x += 64) {
        ctx.fillStyle = (x + y) % 64 === 0 ? '#cb9f67' : '#e0be8a';
        ctx.fillRect(x + 1, y + 1, 62, 30);
        ctx.strokeStyle = '#8c6534';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, 64, 32);
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
  }

  private static createTravertineStoneTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#eae5db';
    ctx.fillRect(0, 0, 512, 512);

    // Large architectural travertine pavers with clean hairlines
    for (let y = 0; y < 512; y += 128) {
      for (let x = 0; x < 512; x += 128) {
        ctx.fillStyle = (x + y) % 256 === 0 ? '#f0ece3' : '#e4ded3';
        ctx.fillRect(x + 2, y + 2, 124, 124);
        // Stone texture specks
        for (let s = 0; s < 40; s++) {
          ctx.fillStyle = Math.random() > 0.5 ? '#d5cdbf' : '#f8f5ee';
          ctx.fillRect(x + Math.random() * 120, y + Math.random() * 120, 2, 2);
        }
        ctx.strokeStyle = '#b8afa0';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, 128, 128);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
  }

  private static createMarbleTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#fafafc';
    ctx.fillRect(0, 0, 512, 512);

    // Golden & charcoal Italian marble veins
    ctx.strokeStyle = '#c4b59d';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.bezierCurveTo(120, 150, 310, 260, 480, 512);
    ctx.stroke();

    ctx.strokeStyle = '#8a949e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(320, 0);
    ctx.bezierCurveTo(390, 180, 180, 340, 60, 512);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  }

  private static createLawnTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#497334';
    ctx.fillRect(0, 0, 256, 256);

    for (let i = 0; i < 400; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#5b8c42' : '#3d632b';
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 3, 4);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(12, 12);
    return texture;
  }

  private static createFabricTexture(base: string, light: string, dark: string): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, 256, 256);

    // A fine crosshatch gives upholstery a woven surface instead of a flat color.
    for (let i = 0; i < 256; i += 4) {
      ctx.strokeStyle = i % 8 === 0 ? light : dark;
      ctx.globalAlpha = 0.28;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 256);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(256, i);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 3);
    return texture;
  }

  public static get(name: string): THREE.Material {
    if (this.materials.has(name)) {
      return this.materials.get(name)!;
    }

    let mat: THREE.Material;

    switch (name) {
      // Warm exterior & interior architectural materials
      case 'wood-slats':
      case 'cedar-slats':
        mat = new THREE.MeshStandardMaterial({
          color: 0xdca66c,
          map: this.createWoodSlatTexture(),
          roughness: 0.45,
          metalness: 0.05
        });
        break;

      case 'parquet-oak':
      case 'floor-interior':
        mat = new THREE.MeshStandardMaterial({
          color: 0xdeb887,
          map: this.createParquetTexture(),
          roughness: 0.35,
          metalness: 0.05
        });
        break;

      case 'travertine':
      case 'limestone':
      case 'patio-stone':
        mat = new THREE.MeshStandardMaterial({
          color: 0xf5f1e8,
          map: this.createTravertineStoneTexture(),
          roughness: 0.4,
          metalness: 0.02
        });
        break;

      case 'stucco-white':
      case 'plaster-white':
        mat = new THREE.MeshStandardMaterial({
          color: 0xf8f7f4,
          roughness: 0.82,
          metalness: 0.02
        });
        break;

      case 'architectural-stone':
      case 'honed-sandstone':
        mat = new THREE.MeshStandardMaterial({
          color: 0xded6c8,
          roughness: 0.55,
          metalness: 0.05
        });
        break;

      case 'dark-bronze':
      case 'mullions':
      case 'trim-dark':
        mat = new THREE.MeshStandardMaterial({
          color: 0x242426,
          metalness: 0.75,
          roughness: 0.28
        });
        break;

      case 'glass-facade':
        mat = new THREE.MeshPhysicalMaterial({
          color: 0xb5d8ee,
          transparent: true,
          opacity: 0.38,
          roughness: 0.03,
          metalness: 0.1,
          transmission: 0.88,
          ior: 1.52,
          reflectivity: 0.65
        });
        break;

      case 'glass-balustrade':
        mat = new THREE.MeshPhysicalMaterial({
          color: 0xc8e4f5,
          transparent: true,
          opacity: 0.32,
          roughness: 0.02,
          transmission: 0.94
        });
        break;

      case 'champagne-bronze':
      case 'brass':
        mat = new THREE.MeshStandardMaterial({
          color: 0xdfb743,
          metalness: 0.85,
          roughness: 0.22
        });
        break;

      case 'calacatta-marble':
        mat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          map: this.createMarbleTexture(),
          roughness: 0.15,
          metalness: 0.08
        });
        break;

      case 'water-pool':
        mat = new THREE.MeshPhysicalMaterial({
          color: 0x18b8e6,
          transparent: true,
          opacity: 0.82,
          roughness: 0.04,
          metalness: 0.05,
          transmission: 0.85,
          ior: 1.33
        });
        break;

      case 'pool-tiles':
        mat = new THREE.MeshStandardMaterial({
          color: 0x1488b8,
          roughness: 0.2,
          metalness: 0.1
        });
        break;

      case 'grass':
      case 'lawn':
        mat = new THREE.MeshStandardMaterial({
          color: 0x5a883e,
          map: this.createLawnTexture(),
          roughness: 0.75,
          metalness: 0.02
        });
        break;

      case 'foliage-green':
        mat = new THREE.MeshStandardMaterial({
          color: 0x3d702d,
          roughness: 0.7,
          metalness: 0.0
        });
        break;

      case 'foliage-olive':
        mat = new THREE.MeshStandardMaterial({
          color: 0x5a753c,
          roughness: 0.75,
          metalness: 0.0
        });
        break;

      case 'foliage-emerald':
        mat = new THREE.MeshStandardMaterial({
          color: 0x2e5c24,
          roughness: 0.65,
          metalness: 0.0
        });
        break;

      case 'tree-bark':
        mat = new THREE.MeshStandardMaterial({
          color: 0x4a3b30,
          roughness: 0.85,
          metalness: 0.05
        });
        break;

      case 'fabric-sofa':
        mat = new THREE.MeshStandardMaterial({
          color: 0x36393e,
          map: this.createFabricTexture('#45474a', '#72716e', '#292b2e'),
          roughness: 0.85,
          metalness: 0.0
        });
        break;

      case 'fabric-ivory':
      case 'cushion':
        mat = new THREE.MeshStandardMaterial({
          color: 0xf5f3ee,
          map: this.createFabricTexture('#eeece5', '#ffffff', '#d2cec5'),
          roughness: 0.8,
          metalness: 0.0
        });
        break;

      case 'leather-cognac':
        mat = new THREE.MeshStandardMaterial({
          color: 0xa45a2a,
          roughness: 0.38,
          metalness: 0.08
        });
        break;

      case 'glow-warm':
      case 'eave-light':
        mat = new THREE.MeshStandardMaterial({
          color: 0xfff0cb,
          emissive: 0xffc766,
          emissiveIntensity: 2.5,
          roughness: 0.2
        });
        break;

      case 'car-metallic':
        mat = new THREE.MeshStandardMaterial({
          color: 0x1b2838,
          metalness: 0.92,
          roughness: 0.15
        });
        break;

      default:
        mat = new THREE.MeshStandardMaterial({
          color: 0xdcd8cf,
          roughness: 0.5,
          metalness: 0.1
        });
    }

    this.materials.set(name, mat);
    return mat;
  }
}
