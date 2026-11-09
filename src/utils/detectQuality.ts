export type QualityTier = 'high' | 'medium' | 'low';

/**
 * Picks the default rendering tier before any WebGL renderer exists.
 *
 * Mirrors detectQuality() in src/three/RealismKit.ts, but sniffs the GPU string from a
 * throwaway canvas instead of an existing renderer. Keeping it dependency-free matters:
 * ViewerContext lives in the app-root bundle, and importing RealismKit here would pull
 * three.js out of the lazy ViewerPage chunk into the initial load.
 *
 * Tiers: 'low' for phones and software rasterizers, 'medium' for known-weak integrated
 * GPUs (their unsheddable costs — 4x MSAA, 4096 shadow map — would re-introduce drag the
 * adaptive governor cannot remove), and 'high' for everything else. Unknown GPU strings
 * (browsers that hide the renderer, uncommon hardware) default to 'high': defaulting them
 * to 'medium' permanently taxed machines that could afford 'high' and made the viewer look
 * soft. 'high' is a ceiling the governor retreats from at runtime if the machine cannot
 * hold ~37 fps, so it is safe to start there.
 */
export function detectInitialQuality(): QualityTier {
  if (typeof navigator === 'undefined') return 'medium';
  if (/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent)) return 'low';
  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl2') || canvas.getContext('webgl')) as WebGLRenderingContext | null;
    const ext = gl?.getExtension('WEBGL_debug_renderer_info');
    const gpu = gl && ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : '';
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    if (/swiftshader|llvmpipe|software|basic render/i.test(gpu)) return 'low';
    if (/RTX|GTX|GeForce|Radeon RX|Radeon Pro|Apple M[0-9]|Apple GPU|Arc/i.test(gpu)) return 'high';
    if (/UHD|Iris|HD Graphics|Radeon\(TM\) Vega|Radeon Vega|GeForce MX|Adreno|Mali/i.test(gpu)) return 'medium';
    return 'high';
  } catch {
    return 'high';
  }
}
