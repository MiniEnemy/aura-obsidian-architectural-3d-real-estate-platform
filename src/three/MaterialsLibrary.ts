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

const SIZE = 512;
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
  t.anisotropy = 8;
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
    const w = 0.5 + 0.5 * Math.sin(u * TAU * 24);
    const h = 0.5 + 0.5 * Math.sin(v * TAU * 24);
    const k = 0.93 + 0.05 * (w * h) + (fbm(u, v, 16, 3, 3) - 0.5) * 0.12;
    return [r * k, g * k, b * k, w * h];
  }, 0.3);
  return flag(new THREE.MeshPhysicalMaterial({
    color: 0xffffff, map: t.map, bumpMap: t.bump, bumpScale: 0.229,
    roughness: 0.95, metalness: 0, sheen: 1, sheenRoughness: 0.7, sheenColor: new THREE.Color(sheen)
  }), true);
}

function foliage(r: number, g: number, b: number, seed: number) {
  const t = bake((u, v) => {
    const n = fbm(u, v, 12, 5, seed);
    const k = 0.72 + 0.5 * n;
    return [r * k, g * k, b * k, n];
  }, 1 / 3);
  return flag(new THREE.MeshStandardMaterial({
    color: 0xffffff, map: t.map, bumpMap: t.bump, bumpScale: 0.571, roughness: 0.82, metalness: 0
  }), false);
}

const builders: Record<string, () => THREE.Material> = {
  'stucco-white': () => {
    const t = bake((u, v) => {
      const n = fbm(u, v, 8, 5, 1), f = fbm(u, v, 64, 2, 2);
      const k = 0.94 + 0.07 * n - 0.025 * f;
      return [214 * k, 210 * k, 202 * k, n * 0.7 + f * 0.3];
    }, 2.0);
    return flag(new THREE.MeshStandardMaterial({
      color: 0xffffff, map: t.map, bumpMap: t.bump, bumpScale: 0.286, roughness: 0.92, metalness: 0
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
      color: 0xffffff, map: t.map, bumpMap: t.bump, bumpScale: 0.429, roughness: 0.55, metalness: 0
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
      const gap = fy < 0.03 || fy > 0.97 || fx < 0.006 || fx > 0.994;
      const k = tone * (0.88 + 0.22 * grain);
      return gap ? [104, 78, 54, 0.1] : [186 * k, 138 * k, 90 * k, 0.6 + 0.3 * grain];
    }, 2.4, 1024);
    return flag(new THREE.MeshPhysicalMaterial({
      color: 0xffffff, map: t.map, bumpMap: t.bump, bumpScale: 0.229,
      roughness: 0.42, metalness: 0, clearcoat: 0.25, clearcoatRoughness: 0.35
    }), true);
  },

  travertine: () => {
    const t = bake((u, v) => {
      const band = vnoise(u, v, 2, 28, 4) * 0.6 + vnoise(u, v, 4, 64, 5) * 0.4;
      const pits = sstep(0.8, 0.9, fbm(u, v, 96, 2, 6));
      const joint = Math.min(Math.abs(((u * 2) % 1) - 0.5), Math.abs(((v * 2) % 1) - 0.5)) > 0.497 ? 0.8 : 1;
      const slab = 0.96 + 0.06 * hash(Math.floor(u * 2), Math.floor(v * 2));
      const k = (0.9 + 0.14 * band) * (1 - 0.16 * pits) * joint * slab;
      return [206 * k, 192 * k, 166 * k, 0.8 - 0.5 * pits - (joint < 1 ? 0.3 : 0)];
    }, 2.4, 1024);
    return flag(new THREE.MeshStandardMaterial({
      color: 0xffffff, map: t.map, bumpMap: t.bump, bumpScale: 0.343, roughness: 0.62, metalness: 0
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
    }, 2.0, 1024);
    return flag(new THREE.MeshPhysicalMaterial({
      color: 0xffffff, map: t.map, roughness: 0.14, metalness: 0,
      clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 1.2
    }), true);
  },

  lawn: () => {
    const t = bake((u, v) => {
      const macro = fbm(u, v, 3, 4, 30), a = fbm(u, v, 12, 4, 33), b = fbm(u, v, 128, 2, 31);
      const k = 0.62 + 0.45 * a + 0.25 * b;
      const dry = 0.15 * macro;
      return [mix(50, 92, dry) * k, mix(76, 92, dry) * k, mix(34, 48, dry) * k, a * 0.4 + b * 0.6];
    }, 6.0, 1024);
    return flag(new THREE.MeshStandardMaterial({ color: 0xffffff, map: t.map, bumpMap: t.bump, bumpScale: 0.714, roughness: 1, metalness: 0 }), true);
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
      color: 0xffffff, map: t.map, bumpMap: t.bump, bumpScale: 0.429, roughness: 0.18, metalness: 0, clearcoat: 0.6
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
      color: 0xffffff, map: t.map, bumpMap: t.bump, bumpScale: 0.429,
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
      color: 0xffffff, map: t.map, bumpMap: t.bump, bumpScale: 1.143, roughness: 1, metalness: 0
    }), false);
  },

  'foliage-green': () => foliage(54, 88, 38, 60),
  'foliage-olive': () => foliage(92, 104, 58, 70),
  'foliage-emerald': () => foliage(36, 82, 52, 80),


  'paint-white': () => flag(new THREE.MeshStandardMaterial({ color: 0xf3f1ec, roughness: 0.86, metalness: 0 }), false),

  concrete: () => {
    const t = bake((u, v) => {
      const n = fbm(u, v, 6, 5, 90), p = sstep(0.74, 0.82, fbm(u, v, 64, 2, 91));
      const k = (0.86 + 0.2 * n) * (1 - 0.25 * p);
      return [178 * k, 176 * k, 170 * k, n * 0.6 + (1 - p) * 0.4];
    }, 2.4);
    return flag(new THREE.MeshStandardMaterial({ color: 0xffffff, map: t.map, bumpMap: t.bump, bumpScale: 0.4, roughness: 0.9 }), true);
  },

  gravel: () => {
    const t = bake((u, v) => {
      const a = fbm(u, v, 96, 2, 92), b = hash(Math.floor(u * 128), Math.floor(v * 128));
      const k = 0.55 + 0.6 * a + 0.25 * b;
      return [172 * k, 164 * k, 150 * k, a * 0.5 + b * 0.5];
    }, 1.0);
    return flag(new THREE.MeshStandardMaterial({ color: 0xffffff, map: t.map, bumpMap: t.bump, bumpScale: 1.143, roughness: 1 }), true);
  },

  walnut: () => {
    const t = bake((u, v) => {
      const g = vnoise(u, v, 10, 110, 93) * 0.6 + vnoise(u, v, 24, 220, 94) * 0.4;
      const k = 0.78 + 0.45 * g;
      return [96 * k, 64 * k, 42 * k, g];
    }, 1.2);
    return flag(new THREE.MeshPhysicalMaterial({
      color: 0xffffff, map: t.map, bumpMap: t.bump, bumpScale: 0.2, roughness: 0.48, clearcoat: 0.2, clearcoatRoughness: 0.4
    }), true);
  },

  'white-oak': () => {
    const t = bake((u, v) => {
      const g = vnoise(u, v, 8, 120, 95) * 0.6 + vnoise(u, v, 20, 240, 96) * 0.4;
      const k = 0.88 + 0.28 * g;
      return [214 * k, 186 * k, 148 * k, g];
    }, 1.2);
    return flag(new THREE.MeshPhysicalMaterial({
      color: 0xffffff, map: t.map, bumpMap: t.bump, bumpScale: 0.171, roughness: 0.5, clearcoat: 0.15
    }), true);
  },

  'rug-wool': () => {
    const t = bake((u, v) => {
      const n = fbm(u, v, 24, 4, 97), f = fbm(u, v, 128, 2, 98);
      const k = 0.88 + 0.2 * n + 0.05 * f;
      return [212 * k, 205 * k, 192 * k, n * 0.4 + f * 0.6];
    }, 1.0);
    return flag(new THREE.MeshStandardMaterial({ color: 0xffffff, map: t.map, bumpMap: t.bump, bumpScale: 0.914, roughness: 1 }), true);
  },
  'rug-dark': () => {
    const t = bake((u, v) => {
      const n = fbm(u, v, 24, 4, 99), f = fbm(u, v, 128, 2, 100);
      const k = 0.85 + 0.25 * n + 0.06 * f;
      return [86 * k, 84 * k, 82 * k, n * 0.4 + f * 0.6];
    }, 1.0);
    return flag(new THREE.MeshStandardMaterial({ color: 0xffffff, map: t.map, bumpMap: t.bump, bumpScale: 0.914, roughness: 1 }), true);
  },

  'curtain-linen': () => {
    const t = bake((u, v) => {
      const slub = vnoise(u, v, 8, 64, 101) * 0.6 + vnoise(u, v, 64, 8, 102) * 0.4;
      const k = 0.86 + 0.14 * slub;
      return [226 * k, 218 * k, 202 * k, slub];
    }, 0.4);
    return flag(new THREE.MeshPhysicalMaterial({
      color: 0xffffff, map: t.map, bumpMap: t.bump, bumpScale: 0.171, roughness: 0.95, side: THREE.DoubleSide,
      sheen: 1, sheenRoughness: 0.8, sheenColor: new THREE.Color(0xffffff)
    }), false);
  },

  leaf: () => {
    const t = bake((u, v) => {
      const n = fbm(u, v, 10, 4, 102);
      const vein = 1 - sstep(0.0, 0.04, Math.abs(((u * 6) % 1) - 0.5) - 0.0) * 0;
      const k = 0.6 + 0.8 * n;
      return [44 * k, 96 * k, 40 * k, n + vein * 0];
    }, 0.5);
    return flag(new THREE.MeshStandardMaterial({
      color: 0xffffff, map: t.map, bumpMap: t.bump, bumpScale: 0.429, roughness: 0.5, side: THREE.DoubleSide
    }), false);
  },

  'ceramic-white': () => flag(new THREE.MeshPhysicalMaterial({ color: 0xf6f5f1, roughness: 0.14, clearcoat: 1, clearcoatRoughness: 0.05 }), false),
  'steel-brushed': () => flag(new THREE.MeshStandardMaterial({ color: 0xc2c6ca, metalness: 1, roughness: 0.36 }), false),
  'black-steel': () => flag(new THREE.MeshStandardMaterial({ color: 0x1c1c1e, metalness: 0.9, roughness: 0.42 }), false),
  mirror: () => flag(new THREE.MeshStandardMaterial({ color: 0xe9eff1, metalness: 1, roughness: 0.025, envMapIntensity: 1.3 }), false),
  rubber: () => flag(new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.85 }), false),
  lampshade: () => flag(new THREE.MeshStandardMaterial({
    color: 0xf2e6cf, emissive: 0xffd8a0, emissiveIntensity: 0.9, roughness: 0.9, side: THREE.DoubleSide
  }), false),

  'roof-terracotta': () => {
    // UV = meters. Barrel tiles run down-slope (local x); ribs vary across the slope (local z).
    const t = bake((u, v) => {
      const rib = 0.5 + 0.5 * Math.cos(v * TAU * 5);       // 5 ribs per 1.2 m tile ~ 24 cm pitch
      const course = (u * 3) % 1;                          // tile length 40 cm
      const joint = course < 0.04 ? 0.55 : 1;
      const id = hash(Math.floor(v * 5), Math.floor(u * 3));
      const wear = fbm(u, v, 12, 4, 103);
      const k = (0.68 + 0.4 * rib) * joint * (0.88 + 0.22 * id) * (0.9 + 0.2 * wear);
      return [186 * k, 96 * k, 66 * k, rib * joint];
    }, 1.2);
    return flag(new THREE.MeshStandardMaterial({ color: 0xffffff, map: t.map, bumpMap: t.bump, bumpScale: 0.857, roughness: 0.82 }), true);
  },

  'dark-bronze': () => flag(new THREE.MeshStandardMaterial({ color: 0x2a2521, metalness: 0.85, roughness: 0.38 }), false),
  'champagne-bronze': () => flag(new THREE.MeshStandardMaterial({ color: 0xc9a974, metalness: 1, roughness: 0.28 }), false),

  // Cheap physically-plausible glass (no transmission pass). Swap in `transmission: 1, thickness: 0.05`
  // on hero panes only if you want refraction; it costs a full extra scene render.
  'glass-facade': () => flag(new THREE.MeshPhysicalMaterial({
    color: 0x9bbdc8, metalness: 0, roughness: 0.03, transparent: true, opacity: 0.14,
    envMapIntensity: 0.9, ior: 1.5, depthWrite: false
  }), false),
  'glass-balustrade': () => flag(new THREE.MeshPhysicalMaterial({
    color: 0xcfe4e8, metalness: 0, roughness: 0.02, transparent: true, opacity: 0.12,
    envMapIntensity: 0.9, ior: 1.5, depthWrite: false
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

  'car-pearl': () => flag(new THREE.MeshPhysicalMaterial({ color: 0xe9e8e4, metalness: 0.7, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 1.3 }), false),
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

  /** 0 = lamps off, 1 = dusk-level. Scales every emissive "lamp" material (bloom only triggers above ~1). */
  static setGlow(level: number) {
    MaterialsLibrary.glowLevel = level;
    const g = MaterialsLibrary.get('glow-warm') as THREE.MeshStandardMaterial;
    g.emissiveIntensity = 3.2 * level;
    const l = MaterialsLibrary.get('lampshade') as THREE.MeshStandardMaterial;
    l.emissiveIntensity = 0.9 * level;
    for (const m of MaterialsLibrary.glowClones) m.emissiveIntensity = m.userData.baseEmissive * level;
  }
  private static glowLevel = 0.22;
  private static glowClones = new Set<THREE.MeshStandardMaterial>();

  /** Make any emissive material follow the time-of-day glow level (e.g. lit tower windows). */
  static registerGlow(m: THREE.MeshStandardMaterial, base: number) {
    m.userData.baseEmissive = base;
    m.emissiveIntensity = base * MaterialsLibrary.glowLevel;
    MaterialsLibrary.glowClones.add(m);
    return m;
  }

  /** Private emissive material for a lamp the viewer toggles individually; still follows time-of-day. */
  static glowClone(base = 'glow-warm'): THREE.MeshStandardMaterial {
    const m = (MaterialsLibrary.get(base) as THREE.MeshStandardMaterial).clone();
    m.userData.baseEmissive = 3.2;
    m.emissiveIntensity = 3.2 * MaterialsLibrary.glowLevel;
    MaterialsLibrary.glowClones.add(m);
    return m;
  }

  /** Procedural abstract painting (colour-field / soft shapes). Cached per seed. */
  static artwork(seed: number): THREE.Material {
    const key = `art-${seed}`;
    let m = MaterialsLibrary.cache.get(key);
    if (m) return m;
    const c = document.createElement('canvas');
    c.width = 512; c.height = 384;
    const x = c.getContext('2d')!;
    const palettes = [
      ['#e9e2d4', '#c8553d', '#2f4858', '#f2c14e'], ['#efece6', '#6b7f6a', '#b9a590', '#2b2b2b'],
      ['#f1e9dc', '#d97b4a', '#8a9a8f', '#40424a'], ['#e8e6e1', '#3b5b73', '#c9b79c', '#a63d40']
    ];
    const pal = palettes[seed % palettes.length];
    const r = (n: number) => hash(seed * 31 + n, n * 7 + 3);
    x.fillStyle = pal[0]; x.fillRect(0, 0, 512, 384);
    for (let i = 0; i < 5; i++) {
      x.globalAlpha = 0.55 + 0.4 * r(i);
      x.fillStyle = pal[1 + (i % 3)];
      const w = 120 + r(i + 10) * 260, h = 80 + r(i + 20) * 220;
      const px = r(i + 30) * (512 - w), py = r(i + 40) * (384 - h);
      if (i % 2) { x.beginPath(); x.ellipse(px + w / 2, py + h / 2, w / 2, h / 2, r(i) * 3, 0, TAU); x.fill(); }
      else x.fillRect(px, py, w, h);
    }
    x.globalAlpha = 1;
    const id = x.getImageData(0, 0, 512, 384);
    for (let i = 0; i < id.data.length; i += 4) {          // canvas-weave grain
      const n = (hash(i, seed) - 0.5) * 16;
      id.data[i] += n; id.data[i + 1] += n; id.data[i + 2] += n;
    }
    x.putImageData(id, 0, 0);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    m = flag(new THREE.MeshStandardMaterial({ map: t, roughness: 0.8 }), false);
    MaterialsLibrary.cache.set(key, m);
    return m;
  }

  /** Call every frame with clock.elapsedTime. */
  static update(t: number) {
    for (const n of waterNormals) n.offset.set(t * 0.012, t * 0.007);
  }

  static dispose() {
    MaterialsLibrary.cache.forEach((m) => m.dispose());
    MaterialsLibrary.cache.clear();
    MaterialsLibrary.glowClones.clear();
    waterNormals.length = 0;
  }
}
