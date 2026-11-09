export type QualityTier = 'high' | 'medium' | 'low';

/**
 * Picks the default rendering tier before any WebGL renderer exists.
 *
 * Mirrors detectQuality() in src/three/RealismKit.ts, but sniffs the GPU string from a
 * throwaway canvas instead of an existing renderer. Keeping it dependency-free matters:
 * ViewerContext lives in the app-root bundle, and importing RealismKit here would pull
 * three.js out of the lazy ViewerPage chunk into the initial load.
 *
 * Without this, every device (including software renderers and phones) started at 'high'.
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
    return 'medium';
  } catch {
    return 'medium';
  }
}
