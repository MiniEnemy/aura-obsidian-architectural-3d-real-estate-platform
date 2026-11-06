import * as THREE from 'three';

/**
 * Drop-in replacement for MaterialsLibrary.
 * - Same keys PropertySceneBuilder already calls (+ 'water-sea').
 * - All textures are procedural + tileable (no asset files needed).
 * - Materials flagged userData.worldUV = true expect UVs in METERS;
 *   finalizeScene() (RealismKit.ts) rewrites box UVs so textures keep a
 *   real-world scale (20 cm planks stay 20 cm on a 22 m floor).
 * - Call MaterialsLibrary.update(elapsedSeconds) each frame to animate water.
 */

// Keep procedural texture baking quick enough that opening a property does not stall.
const SIZE = 256;
const TAU = Math.PI * 2;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const sstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const hash = (a: number, b: number) => {
  let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

// ---------- tileable value noise ----------
const GRID = (() => {
  let s = 1337;
  const g = new Float32Array(256 * 256);
  for (let i = 0; i < g.length; i++) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    g[i] = s / 4294967296;
  }
  return g;
})();
const sm = (t: number) => t * t * (3 - 2 * t);

function vnoise(u: number, v: number, px: number, py = px, seed = 0): number {
  const x = u * px;
  const y = v * py;
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = sm(x - xi);
  const yf = sm(y - yi);
  const x0 = xi % px, x1 = (xi + 1) % px;
  const y0 = yi % py, y1 = (yi + 1) % py;
  const o = seed * 53;
  const at = (xx: number, yy: number) => GRID[(((yy + o) & 255) << 8) | ((xx + o * 7) & 255)];
  const a = at(x0, y0), b = at(x1, y0), c = at(x0, y1), d = at(x1, y1);
  return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
}

function fbm(u: number, v: number, base: number, oct = 4, seed = 0): number {
  let amp = 0.5, sum = 0, norm = 0, p = base;
  for (let o = 0; o < oct && p <= 256; o++) {
    sum += amp * vnoise(u, v, p, p, seed + o);
    norm += amp;
    amp *= 0.5;
    p *= 2;
  }
  return sum / norm;
}

// ---------- texture baking ----------
type Texel = [number, number, number, number]; // r,g,b (0-255), height (0-1)

function finish(t: THREE.CanvasTexture, srgb: boolean, repeat: number) {
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.anisotropy = 4;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Bakes a colour map + bump map in one pass. tileMeters = real-world size of one texture tile. */
function bake(fn: (u: number, v: number) => Texel, tileMeters: number, size = SIZE) {
  const mk = () => {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d')!;
    return { c, ctx, img: ctx.createImageData(size, size) };
  };
  const col = mk();
  const hgt = mk();
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const [r, g, b, h] = fn(x / size, 1 - y / size);
      const i = (y * size + x) * 4;
      col.img.data[i] = r; col.img.data[i + 1] = g; col.img.data[i + 2] = b; col.img.data[i + 3] = 255;
      const hv = h * 255;
      hgt.img.data[i] = hgt.img.data[i + 1] = hgt.img.data[i + 2] = hv; hgt.img.data[i + 3] = 255;
    }
  }
  col.ctx.putImageData(col.img, 0, 0);
  hgt.ctx.putImageData(hgt.img, 0, 0);
  const rep = 1 / tileMeters;
  return {
    map: finish(new THREE.CanvasTexture(col.c), true, rep),
    bump: finish(new THREE.CanvasTexture(hgt.c), false, rep)
  };
}

const waterNormals: THREE.Texture[] = [];
function waterNormalMap(repeat: number): THREE.Texture {
  const N = 256;
  const h = new Float32Array(N * N);
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++)
      h[y * N + x] = fbm(x / N, y / N, 4, 4, 9) + 0.5 * fbm(x / N, y / N, 16, 3, 11);
  const c = document.createElement('canvas');
  c.width = c.height = N;
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(N, N);
  const S = 7;
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const dx = h[y * N + ((x + 1) % N)] - h[y * N + ((x - 1 + N) % N)];
      const dy = h[((y + 1) % N) * N + x] - h[((y - 1 + N) % N) * N + x];
      let nx = -dx * S, ny = -dy * S, nz = 1;
      const l = Math.hypot(nx, ny, nz);
      nx /= l; ny /= l; nz /= l;
      const i = (y * N + x) * 4;
      img.data[i] = (nx * 0.5 + 0.5) * 255;
      img.data[i + 1] = (ny * 0.5 + 0.5) * 255;
      img.data[i + 2] = (nz * 0.5 + 0.5) * 255;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.anisotropy = 8;
  waterNormals.push(t);
  return t;
}

const flag = <T extends THREE.Material>(m: T, worldUV: boolean): T => {
  m.userData.worldUV = worldUV;
  return m;
};

function fabric(r: number, g: number, b: number, sheen: number) {
  const t = bake((u, v) => {
    const w = 0.5 + 0.5 * Math.sin(u * TAU * 48);
    const h = 0.5 + 0.5 * Math.sin(v * TAU * 48);
    const k = 0.9 + 0.1 * (w * h) + (fbm(u, v, 16, 3, 3) - 0.5) * 0.1;
    return [r * k, g * k, b * k, w * h];
  }, 0.3);
  return flag(new THREE.MeshPhysicalMaterial({
    color: 0xffffff, map: t.map, bumpMap: t.bump, bumpScale: 0.8,
    roughness: 0.95, metalness: 0, sheen: 1, sheenRoughness: 0.7, sheenColor: new THREE.Color(sheen)
  }), true);
}

function foliage(r: number, g: number, b: number, seed: number) {
  const t = bake((u, v) => {
    const n = fbm(u, v, 12, 5, seed);
    const k = 0.65 + 0.7 * n;
    return [r * k, g * k, b * k, n];
  }, 1 / 3);
  return flag(new THREE.MeshStandardMaterial({
    color: 0xffffff, map: t.map, bumpMap: t.bump, bumpScale: 2, roughness: 0.82, metalness: 0
  }), false);
}

const builders: Record<string, () => THREE.Material> = {
  'stucco-white': () => {
    const t = bake((u, v) => {
      const n = fbm(u, v, 8, 5, 1), f = fbm(u, v, 64, 2, 2);
      const k = 0.94 + 0.07 * n - 0.025 * f;
      return [238 * k, 234 * k, 226 * k, n * 0.7 + f * 0.3];
    }, 2.0);
    return flag(new THREE.MeshStandardMaterial({
      color: 0xffffff, map: t.map, bumpMap: t.bump, bumpScale: 1.0, roughness: 0.92, metalness: 0
    }), true);
  },

  'wood-slats': () => {
    const slats = 8;
    const t = bake((u, v) => {
      const i = Math.floor(u * slats), f = u * slats - i;
      const tone = 0.8 + 0.3 * hash(i, 3);
      const grain = vnoise(u, v, 64, 6, i) * 0.6 + vnoise(u, v, 128, 24, i + 40) * 0.4;
      const gap = f < 0.05 || f > 0.95;
      const k = tone * (0.86 + 0.28 * grain);
      return gap ? [28, 20, 14, 0] : [172 * k, 120 * k, 72 * k, 0.55 + 0.4 * grain];
    }, 1.0);
    return flag(new THREE.MeshStandardMaterial({
      color: 0xffffff, map: t.map, bumpMap: t.bump, bumpScale: 1.5, roughness: 0.55, metalness: 0
    }), true);
  },

  'parquet-oak': () => {
    const rows = 12, cols = 2;
    const t = bake((u, v) => {
      const row = Math.floor(v * rows), fy = v * rows - row;
      const pu = (u + hash(row, 7)) * cols;
      const col = Math.floor(pu), fx = pu - col;
      const id = hash(row, (col % cols) + 11);
      const tone = 0.82 + 0.28 * id;
      const grain = vnoise(u, v, 8, 160, Math.floor(id * 60)) * 0.65 + vnoise(u, v, 16, 64, Math.floor(id * 60) + 80) * 0.35;
      const gap = fy < 0.05 || fy > 0.95 || fx < 0.008 || fx > 0.992;
      const k = tone * (0.88 + 0.22 * grain);
      return gap ? [58, 42, 28, 0] : [182 * k, 134 * k, 86 * k, 0.6 + 0.3 * grain];
    }, 2.4, 512);
    return flag(new THREE.MeshPhysicalMaterial({
      color: 0xffffff, map: t.map, bumpMap: t.bump, bumpScale: 0.8,
      roughness: 0.42, metalness: 0, clearcoat: 0.25, clearcoatRoughness: 0.35
    }), true);
  },

  travertine: () => {
    const t = bake((u, v) => {
      const band = vnoise(u, v, 2, 28, 4) * 0.6 + vnoise(u, v, 4, 64, 5) * 0.4;
      const pits = sstep(0.72, 0.8, fbm(u, v, 48, 2, 6));
      const joint = Math.min(Math.abs(((u * 2) % 1) - 0.5), Math.abs(((v * 2) % 1) - 0.5)) > 0.497 ? 0.8 : 1;
      const slab = 0.96 + 0.06 * hash(Math.floor(u * 2), Math.floor(v * 2));
      const k = (0.9 + 0.14 * band) * (1 - 0.28 * pits) * joint * slab;
      return [228 * k, 214 * k, 190 * k, 0.8 - 0.5 * pits - (joint < 1 ? 0.3 : 0)];
    }, 2.4, 512);
    return flag(new THREE.MeshStandardMaterial({
      color: 0xffffff, map: t.map, bumpMap: t.bump, bumpScale: 1.2, roughness: 0.62, metalness: 0
    }), true);
  },

  'calacatta-marble': () => {
    const t = bake((u, v) => {
      const wu = u + 0.12 * fbm(u, v, 4, 3, 20), wv = v + 0.12 * fbm(u, v, 4, 3, 21);
      const ridge = Math.abs(fbm(wu, wv, 3, 5, 22) - 0.5) * 2;
      const vein = 1 - sstep(0.0, 0.07, ridge);
      const fine = 1 - sstep(0.0, 0.03, Math.abs(fbm(wu, wv, 6, 4, 25) - 0.5) * 2);
      const gold = 1 - sstep(0.0, 0.05, Math.abs(fbm(wu, wv, 2, 4, 28) - 0.5) * 2);
      let r = 241, g = 239, b = 234;
      r = mix(r, 120, vein * 0.8); g = mix(g, 116, vein * 0.8); b = mix(b, 112, vein * 0.8);
      r = mix(r, 178, gold * 0.6); g = mix(g, 142, gold * 0.6); b = mix(b, 88, gold * 0.6);
      r = mix(r, 150, fine * 0.35); g = mix(g, 148, fine * 0.35); b = mix(b, 144, fine * 0.35);
      return [r, g, b, 0.5];
    }, 2.0, 512);
    return flag(new THREE.MeshPhysicalMaterial({
      color: 0xffffff, map: t.map, roughness: 0.14, metalness: 0,
      clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 1.2
    }), true);
  },

  lawn: () => {
    const t = bake((u, v) => {
      const a = fbm(u, v, 6, 4, 30), b = fbm(u, v, 96, 2, 31);
      const k = 0.7 + 0.5 * a * 0.6 + 0.3 * b;
      return [66 * k, 104 * k, 44 * k, b];
    }, 3.0);
    return flag(new THREE.MeshStandardMaterial({
      color: 0xffffff, map: t.map, bumpMap: t.bump, bumpScale: 3, roughness: 1, metalness: 0
    }), true);
  },

  'pool-tiles': () => {
    const n = 32;
    const t = bake((u, v) => {
      const i = Math.floor(u * n), j = Math.floor(v * n);
      const fx = u * n - i, fy = v * n - j;
      const grout = fx < 0.06 || fy < 0.06;
      const k = 0.85 + 0.3 * hash(i, j);
      return grout ? [190, 196, 196, 0] : [52 * k, 158 * k, 178 * k, 0.8];
    }, 1.0);
    return flag(new THREE.MeshPhysicalMaterial({
      color: 0xffffff, map: t.map, bumpMap: t.bump, bumpScale: 1.5, roughness: 0.18, metalness: 0, clearcoat: 0.6
    }), true);
  },

  'fabric-ivory': () => fabric(228, 222, 208, 0xffffff),
  'fabric-sofa': () => fabric(72, 74, 78, 0x9aa0a8),

  'leather-cognac': () => {
    const t = bake((u, v) => {
      const g = fbm(u, v, 64, 3, 40);
      const k = 0.82 + 0.3 * fbm(u, v, 6, 3, 41);
      return [124 * k, 68 * k, 34 * k, g];
    }, 0.5);
    return flag(new THREE.MeshPhysicalMaterial({
      color: 0xffffff, map: t.map, bumpMap: t.bump, bumpScale: 1.5,
      roughness: 0.48, metalness: 0, clearcoat: 0.25, clearcoatRoughness: 0.4
    }), true);
  },

  'tree-bark': () => {
    const t = bake((u, v) => {
      const n = vnoise(u, v, 16, 3, 50) * 0.6 + vnoise(u, v, 48, 8, 51) * 0.4;
      const k = 0.5 + 0.8 * n;
      return [92 * k, 74 * k, 58 * k, n];
    }, 1 / 3);
    return flag(new THREE.MeshStandardMaterial({
      color: 0xffffff, map: t.map, bumpMap: t.bump, bumpScale: 4, roughness: 1, metalness: 0
    }), false);
  },

  'foliage-green': () => foliage(70, 120, 48, 60),
  'foliage-olive': () => foliage(112, 124, 72, 70),
  'foliage-emerald': () => foliage(42, 108, 66, 80),

  'dark-bronze': () => flag(new THREE.MeshStandardMaterial({ color: 0x2a2521, metalness: 0.85, roughness: 0.38 }), false),
  'champagne-bronze': () => flag(new THREE.MeshStandardMaterial({ color: 0xc9a974, metalness: 1, roughness: 0.28 }), false),

  // Cheap physically-plausible glass (no transmission pass). Swap in `transmission: 1, thickness: 0.05`
  // on hero panes only if you want refraction; it costs a full extra scene render.
  'glass-facade': () => flag(new THREE.MeshPhysicalMaterial({
    color: 0xcfe3ea, metalness: 0, roughness: 0.03, transparent: true, opacity: 0.2,
    envMapIntensity: 1.8, ior: 1.5, depthWrite: false
  }), false),
  'glass-balustrade': () => flag(new THREE.MeshPhysicalMaterial({
    color: 0xe2f0f2, metalness: 0, roughness: 0.02, transparent: true, opacity: 0.16,
    envMapIntensity: 1.8, ior: 1.5, depthWrite: false
  }), false),

  // Emissive > 1 so the bloom pass (threshold 1.0) picks it up and nothing else.
  'glow-warm': () => flag(new THREE.MeshStandardMaterial({
    color: 0x2a1c0c, emissive: 0xffc275, emissiveIntensity: 3.2, roughness: 0.6
  }), false),

  'water-pool': () => flag(new THREE.MeshPhysicalMaterial({
    color: 0x1b9fc0, roughness: 0.04, metalness: 0, transparent: true, opacity: 0.86,
    normalMap: waterNormalMap(6), normalScale: new THREE.Vector2(0.22, 0.22),
    clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 1.9, ior: 1.33
  }), false),

  'water-sea': () => flag(new THREE.MeshPhysicalMaterial({
    color: 0x0f5f7a, roughness: 0.12, metalness: 0,
    normalMap: waterNormalMap(40), normalScale: new THREE.Vector2(0.5, 0.5),
    envMapIntensity: 1.6
  }), false),

  'car-metallic': () => flag(new THREE.MeshPhysicalMaterial({
    color: 0x1c2733, metalness: 0.9, roughness: 0.26, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.4
  }), false)
};

export class MaterialsLibrary {
  private static cache = new Map<string, THREE.Material>();

  static get(key: string): THREE.Material {
    let m = MaterialsLibrary.cache.get(key);
    if (!m) {
      const build = builders[key];
      if (!build) {
        console.warn(`[MaterialsLibrary] unknown key "${key}"`);
        m = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.8 });
      } else {
        m = build();
      }
      m.name = key;
      MaterialsLibrary.cache.set(key, m);
    }
    return m;
  }

  /** Call every frame with clock.elapsedTime. */
  static update(t: number) {
    for (const n of waterNormals) n.offset.set(t * 0.012, t * 0.007);
  }

  static dispose() {
    const textures = new Set<THREE.Texture>();
    MaterialsLibrary.cache.forEach((material) => {
      Object.values(material).forEach((value) => {
        if (value instanceof THREE.Texture) textures.add(value);
      });
      material.dispose();
    });
    textures.forEach((texture) => texture.dispose());
    MaterialsLibrary.cache.clear();
    waterNormals.length = 0;
  }
}
