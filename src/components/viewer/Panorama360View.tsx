import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { usePropertyContext } from '../../context/PropertyContext';
import { useViewerContext } from '../../context/ViewerContext';
import { Camera, X, Compass, RotateCcw } from 'lucide-react';

export const Panorama360View: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { activeProperty } = usePropertyContext();
  const { is360Mode, setIs360Mode } = useViewerContext();

  useEffect(() => {
    if (!is360Mode || !canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, 0.1);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // High quality architectural panorama sphere
    const sphereGeo = new THREE.SphereGeometry(50, 60, 40);
    sphereGeo.scale(-1, 1, 1);

    // Procedural interior sphere texture with architectural tones
    const textureLoader = new THREE.TextureLoader();
    const photoUrl =
      activeProperty.images.interior[0] ||
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80';

    textureLoader.load(photoUrl, (texture) => {
      const mat = new THREE.MeshBasicMaterial({ map: texture });
      const mesh = new THREE.Mesh(sphereGeo, mat);
      scene.add(mesh);
    });

    let isUserInteracting = false;
    let onPointerDownMouseX = 0;
    let onPointerDownMouseY = 0;
    let lon = 0;
    let onPointerDownLon = 0;
    let lat = 0;
    let onPointerDownLat = 0;
    let phi = 0;
    let theta = 0;

    const onPointerDown = (e: PointerEvent) => {
      isUserInteracting = true;
      onPointerDownMouseX = e.clientX;
      onPointerDownMouseY = e.clientY;
      onPointerDownLon = lon;
      onPointerDownLat = lat;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isUserInteracting) return;
      lon = (onPointerDownMouseX - e.clientX) * 0.1 + onPointerDownLon;
      lat = (e.clientY - onPointerDownMouseY) * 0.1 + onPointerDownLat;
    };

    const onPointerUp = () => {
      isUserInteracting = false;
    };

    const dom = containerRef.current;
    dom.addEventListener('pointerdown', onPointerDown);
    dom.addEventListener('pointermove', onPointerMove);
    dom.addEventListener('pointerup', onPointerUp);

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      lat = Math.max(-85, Math.min(85, lat));
      phi = THREE.MathUtils.degToRad(90 - lat);
      theta = THREE.MathUtils.degToRad(lon);

      const target = new THREE.Vector3();
      target.x = 500 * Math.sin(phi) * Math.cos(theta);
      target.y = 500 * Math.cos(phi);
      target.z = 500 * Math.sin(phi) * Math.sin(theta);

      camera.lookAt(target);
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      dom.removeEventListener('pointerdown', onPointerDown);
      dom.removeEventListener('pointermove', onPointerMove);
      dom.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      renderer.dispose();
    };
  }, [is360Mode, activeProperty.id]);

  if (!is360Mode) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-40 bg-black cursor-grab active:cursor-grabbing select-none"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Top Bar */}
      <div className="absolute top-5 left-5 right-5 flex items-center justify-between pointer-events-none z-50">
        <div className="pointer-events-auto px-4 py-2 glass-panel rounded-lg flex items-center gap-2.5 font-mono text-xs border border-[#d4af37]/30">
          <Camera className="w-4 h-4 text-[#d4af37]" />
          <span className="text-[#f5f6f8] font-semibold">360° Panorama Sphere Mode</span>
          <span className="text-[10px] text-[#9eacb8] uppercase">| Drag to look</span>
        </div>

        <button
          onClick={() => setIs360Mode(false)}
          className="pointer-events-auto px-3.5 py-2 glass-panel rounded-lg flex items-center gap-2 text-xs font-mono text-[#d4af37] border border-[#d4af37]/40 hover:bg-[#d4af37]/20 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Return to 3D Spatial Walkthrough</span>
        </button>
      </div>
    </div>
  );
};
