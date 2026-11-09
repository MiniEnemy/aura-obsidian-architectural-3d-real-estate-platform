import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { usePropertyContext } from '../../context/PropertyContext';
import { useViewerContext } from '../../context/ViewerContext';
import { PropertySceneBuilder, SceneInteractiveNodes } from '../../three/PropertySceneBuilder';
import { AvatarFigure } from '../../three/AvatarFigure';
import { MaterialsLibrary } from '../../three/MaterialsLibrary';
import { configureRenderer, createPostFX, setupSkyAndSun, TimeOfDay } from '../../three/RealismKit';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, MousePointer, Move3d } from 'lucide-react';

interface ThreeDViewerProps {
  onCameraMove?: (x: number, z: number, rotation: number) => void;
}

type Point = { x: number; y: number; z: number };

const easeInOutCubic = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

const toTimeOfDay = (mode: string): TimeOfDay =>
  mode === 'morning' ? 'golden' : mode === 'evening' || mode === 'night' ? 'dusk' : 'day';

const toVector = (point: Point) => new THREE.Vector3(point.x, point.y, point.z);

type WalkObstacle = { minX: number; maxX: number; minZ: number; maxZ: number; minY: number; maxY: number };

const OBISIDIAN_WALK_OBSTACLES: WalkObstacle[] = [
  // Ground floor furnishings and built-ins. The circular player footprint keeps a small buffer.
  { minX: -6.95, maxX: -6.05, minZ: -4.0, maxZ: 0, minY: 0, maxY: 3.3 }, // fireplace
  { minX: -5.9, maxX: -1.1, minZ: -1.45, maxZ: 1.7, minY: 0, maxY: 1.5 }, // sectional
  { minX: -4.35, maxX: -2.0, minZ: -1.75, maxZ: -0.25, minY: 0, maxY: 0.8 }, // coffee table
  { minX: -2.4, maxX: -1.1, minZ: 1.15, maxZ: 2.5, minY: 0, maxY: 1.4 }, // lounge chair
  { minX: 1.65, maxX: 3.35, minZ: -6.45, maxZ: -1.95, minY: 0, maxY: 1.5 }, // island
  { minX: 2.7, maxX: 4.9, minZ: -2.75, maxZ: 0.75, minY: 0, maxY: 1.3 }, // dining setting
  { minX: 9.2, maxX: 10.5, minZ: -7.5, maxZ: -0.9, minY: 0, maxY: 3.4 }, // kitchen cabinetry
  // The three upstairs beds.
  { minX: -4.85, maxX: -2.15, minZ: -4.85, maxZ: -2.15, minY: 3.4, maxY: 5.2 },
  { minX: 3.25, maxX: 5.75, minZ: -4.85, maxZ: -2.15, minY: 3.4, maxY: 5.2 },
  { minX: 3.25, maxX: 5.75, minZ: 1.65, maxZ: 4.35, minY: 3.4, maxY: 5.2 },
  // Upper floor partitions. Door gaps are intentionally left at the ends of each segment.
  { minX: 0.25, maxX: 2.2, minZ: 0.07, maxZ: 0.23, minY: 3.6, maxY: 6.5 },
  { minX: 3.5, maxX: 10.75, minZ: 0.07, maxZ: 0.23, minY: 3.6, maxY: 6.5 },
  { minX: 2.12, maxX: 2.28, minZ: -8.2, maxZ: -4.2, minY: 3.6, maxY: 6.5 },
  { minX: 2.12, maxX: 2.28, minZ: -2.8, maxZ: 2.4, minY: 3.6, maxY: 6.5 },
  { minX: 2.12, maxX: 2.28, minZ: 3.7, maxZ: 9.1, minY: 3.6, maxY: 6.5 },
  { minX: -10.75, maxX: -6.8, minZ: 0.07, maxZ: 0.23, minY: 3.6, maxY: 6.5 },
  { minX: -5.4, maxX: -4.3, minZ: 0.07, maxZ: 0.23, minY: 3.6, maxY: 6.5 },
  { minX: -3.0, maxX: -1.95, minZ: 0.07, maxZ: 0.23, minY: 3.6, maxY: 6.5 },
  { minX: -0.65, maxX: -0.25, minZ: 0.07, maxZ: 0.23, minY: 3.6, maxY: 6.5 }
];

const intersectsWalkObstacle = (x: number, z: number, groundY: number, radius: number) =>
  OBISIDIAN_WALK_OBSTACLES.some((obstacle) => {
    if (groundY + 1.6 < obstacle.minY || groundY + 0.2 > obstacle.maxY) return false;
    const nearestX = THREE.MathUtils.clamp(x, obstacle.minX, obstacle.maxX);
    const nearestZ = THREE.MathUtils.clamp(z, obstacle.minZ, obstacle.maxZ);
    return (x - nearestX) ** 2 + (z - nearestZ) ** 2 < radius ** 2;
  });

const isUpperWalkway = (x: number, z: number) =>
  (x >= -10.45 && x <= -0.2 && z >= -8.2 && z <= 2.2) ||
  (x >= 0.2 && x <= 10.45 && z >= -8.2 && z <= 9.1) ||
  (x >= -1.8 && x <= 1.8 && z >= -0.65 && z <= 1.65);

const getObsidianGroundHeight = (x: number, z: number, previousGround: number) => {
  // Follow the modeled floating stair run between the lower salon and upper gallery.
  if (x >= -2.5 && x <= -0.55 && z >= 1.75 && z <= 7.35) {
    return THREE.MathUtils.clamp((7.1 - z) * 0.66, 0, 3.6);
  }
  // Keep the player on the upper plate once they leave the top stair; do not let them
  // walk through the double-height void between the two wings.
  if (previousGround > 2.8 && isUpperWalkway(x, z)) return 3.6;
  return 0;
};

const isSkyMezzanine = (x: number, z: number) =>
  (x >= -10.6 && x <= 10.6 && z >= 0.72 && z <= 8.25) ||
  (x >= -3.6 && x <= 10.6 && z > 8.25 && z <= 11.4);

const getSkyGroundHeight = (x: number, z: number, previousGround: number) => {
  // The modeled floating oak stair rises along the west side of the great room.
  if (x >= -9.0 && x <= -7.2 && z >= 0.55 && z <= 5.45) {
    return THREE.MathUtils.clamp((5.35 - z) * 0.78, 0, 4.0);
  }
  if (previousGround > 3.0 && isSkyMezzanine(x, z)) return 4.0;
  return 0;
};

const disposeObject = (object: THREE.Object3D) => {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose();
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        Object.values(material).forEach((value) => {
          if (value instanceof THREE.Texture) value.dispose();
        });
        material.dispose();
      });
    }
    if (child instanceof THREE.Line) {
      child.geometry.dispose();
      child.material.dispose();
    }
  });
};

export const ThreeDViewer: React.FC<ThreeDViewerProps> = ({ onCameraMove }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { activeProperty } = usePropertyContext();
  const {
    cameraMode, setCameraMode, isExterior, lightingMode, isFurnished,
    doorsOpenState, toggleDoor, lightsOnState, toggleLight,
    curtainsOpenState, toggleCurtain, isMeasuringActive, addMeasurementPoint,
    measurements, activeMeasurementPoints, setSelectedObject, quality,
    targetCameraPosition, targetCameraLookAt, showRoomLabels, jumpToRoom,
    currentRoomId, currentFloorId, setCurrentFloorId, setCurrentRoomId, clearMeasurements, setIsMeasuringActive
  } = useViewerContext();

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const skyRef = useRef<ReturnType<typeof setupSkyAndSun> | null>(null);
  const postFXRef = useRef<ReturnType<typeof createPostFX> | null>(null);
  const nodesRef = useRef<SceneInteractiveNodes | null>(null);
  const modelRootRef = useRef<THREE.Group | null>(null);
  const avatarRef = useRef<AvatarFigure | null>(null);
  const measurementGroupRef = useRef<THREE.Group | null>(null);
  const rafRef = useRef<number | null>(null);
  const visibleRef = useRef(true);
  const keysRef = useRef<Record<string, boolean>>({});
  const cameraModeRef = useRef(cameraMode);
  const currentFloorRef = useRef(currentFloorId);
  const currentRoomRef = useRef(currentRoomId);
  const fppRef = useRef({ position: new THREE.Vector3(0, 1.6, 8), velocity: new THREE.Vector3(), yaw: 0, pitch: 0 });
  const frameVectorsRef = useRef({
    input: new THREE.Vector3(),
    forward: new THREE.Vector3(),
    right: new THREE.Vector3(),
    desired: new THREE.Vector3(),
    movement: new THREE.Vector3(),
    lookAt: new THREE.Vector3(),
    lookDirection: new THREE.Vector3(),
    follow: new THREE.Vector3()
  });
  const transitionRef = useRef<{ from: THREE.Vector3; to: THREE.Vector3; fromLook: THREE.Vector3; toLook: THREE.Vector3; elapsed: number } | null>(null);
  const hoveredRef = useRef<THREE.Object3D | null>(null);
  const pointerRef = useRef({ down: false, moved: false, x: 0, y: 0, startX: 0, startY: 0 });
  const renderNeededRef = useRef(true);
  const animationUntilRef = useRef(0);
  // The animate loop lives in an effect keyed on property/quality, so reading door/curtain
  // state straight from the render closure would freeze it at mount — toggles then appeared
  // dead because the loop kept damping toward the original targets. A ref keeps it live.
  const doorStateRef = useRef({ doorsOpenState, curtainsOpenState });
  // Hover/cursor bookkeeping lives in refs: pointermove fires faster than animation frames (and
  // faster than React should re-render), so at most one raycast runs per frame, deferred from
  // the event itself, and cursor flips never touch React state.
  const pendingHoverRef = useRef<{ x: number; y: number } | null>(null);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const hoveredNameRef = useRef<string | null>(null);
  const cursorRef = useRef('grab');
  const raycasterRef = useRef<THREE.Raycaster | null>(null);
  const ndcRef = useRef<THREE.Vector2 | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('Preparing the spatial viewport');
  const [hoveredName, setHoveredName] = useState<string | null>(null);
  const [webglError, setWebglError] = useState(false);
  const [announcedRoom, setAnnouncedRoom] = useState('');

  useEffect(() => {
    cameraModeRef.current = cameraMode;
    if (avatarRef.current) avatarRef.current.visible = cameraMode === 'third-person';
    if (controlsRef.current) controlsRef.current.enabled = cameraMode === 'orbit';
  }, [cameraMode]);

  useEffect(() => {
    currentFloorRef.current = currentFloorId;
  }, [currentFloorId]);

  useEffect(() => {
    currentRoomRef.current = currentRoomId;
  }, [currentRoomId]);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    const container = containerRef.current;
    const modelUrl = activeProperty.model?.glbUrl;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: quality !== 'low', powerPreference: 'high-performance' });
    } catch {
      setWebglError(true);
      return;
    }
    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(58, width / height, 0.1, 700);
    camera.position.set(14, 7.5, 25);
    camera.lookAt(0, 2.5, 0);
    const modelRenderCap = activeProperty.model?.glbUrl ? 1.15 : 1.5;
    const maxPixelRatio = quality === 'high' ? modelRenderCap : quality === 'medium' ? 1.05 : 0.85;
    const rendererQuality = configureRenderer(renderer, quality);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
    renderer.setSize(width, height, false);
    // The architecture and sun are static between control changes; refreshing a shadow map
    // on every first-person frame was doing far more GPU work than the scene needs.
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.needsUpdate = true;
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.075;
    controls.minDistance = 3;
    controls.maxDistance = 70;
    controls.minPolarAngle = 0.18;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.target.set(0, 2.5, 0);
    controlsRef.current = controls;
    const onControlsChange = () => { renderNeededRef.current = true; };
    controls.addEventListener('change', onControlsChange);

    setLoadingProgress(18);
    setLoadingStatus('Calibrating natural light and atmosphere');
    const sky = setupSkyAndSun(renderer, scene, { preset: toTimeOfDay(lightingMode), quality: rendererQuality });
    skyRef.current = sky;
    setLoadingProgress(42);
    setLoadingStatus('Building architectural surfaces');
    const nodes = activeProperty.model?.glbUrl
      ? {
          frontDoorPivot: new THREE.Group(),
          masterDoorPivot: new THREE.Group(),
          balconySlider: new THREE.Group(),
          livingLight: new THREE.PointLight(0xffe2a3, 1.8, 18),
          livingLightGlow: new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), MaterialsLibrary.get('glow-warm')),
          diningLight: new THREE.PointLight(0xffdf99, 1.4, 14),
          diningLightGlow: new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), MaterialsLibrary.get('glow-warm')),
          furnitureGroup: new THREE.Group(),
          interactiveObjects: [],
          colliders: [],
          interiorLights: []
        }
      : PropertySceneBuilder.buildProperty(activeProperty.id, scene);
    nodesRef.current = nodes;
    sky.setPreset(toTimeOfDay(lightingMode), nodes.interiorLights);
    // RealismKit owns AO now: it allocates the pass per quality tier and only renders it when the
    // GPU has headroom. The hosted-GLB path is the one viewer-specific exception — its material
    // cost makes AO unsafe to assume. maxPixelRatio preserves the resolution caps used above.
    let postFX: ReturnType<typeof createPostFX> | null = null;
    try {
      postFX = createPostFX(renderer, scene, camera, width, height, {
        ao: !modelUrl,
        bloom: quality !== 'low',
        quality: rendererQuality,
        maxPixelRatio
      });
    } catch (error) {
      console.warn('[ThreeDViewer] Post-processing unavailable; using direct rendering.', error);
    }
    postFXRef.current = postFX;
    const avatar = new AvatarFigure();
    avatar.visible = cameraModeRef.current === 'third-person';
    scene.add(avatar);
    avatarRef.current = avatar;
    const measurementGroup = new THREE.Group();
    measurementGroup.name = 'measurement-overlays';
    scene.add(measurementGroup);
    measurementGroupRef.current = measurementGroup;
    setLoadingProgress(82);
    setLoadingStatus(modelUrl ? 'Loading high-detail residence model' : 'Registering interactive surfaces');
    const modelRoot = new THREE.Group();
    modelRoot.name = 'listing-model';
    scene.add(modelRoot);
    modelRootRef.current = modelRoot;
    let readyTimer: number | null = null;
    let warmupDone = false;
    let disposed = false;
    const finishWarmup = () => {
      if (disposed) return;
      warmupDone = true;
      renderer.shadowMap.needsUpdate = true;
      renderNeededRef.current = true;
      setLoadingProgress(100);
      setLoadingStatus('Ready to explore');
      readyTimer = window.setTimeout(() => setIsLoading(false), 250);
    };
    const finishLoading = () => {
      setLoadingStatus('Compiling architectural shaders');
      setLoadingProgress(96);
      // fx.warmup() bakes the remaining procedural textures and compiles every shader program off
      // the main thread, so the first frame after the loader drops does not stall for seconds. The
      // timeout is a safety net: a failed bake must never strand the user on the loading screen.
      const warmup = postFX ? postFX.warmup() : MaterialsLibrary.whenReady();
      const deadline = new Promise<void>((resolve) => window.setTimeout(resolve, 10000));
      Promise.race([warmup, deadline]).then(finishWarmup, (error: unknown) => {
        console.warn('[ThreeDViewer] Shader warmup skipped.', error);
        finishWarmup();
      });
    };
    if (modelUrl) {
      const loader = new GLTFLoader();
      loader.load(
        modelUrl,
        (gltf) => {
          const asset = gltf.scene;
          const bounds = new THREE.Box3().setFromObject(asset);
          const size = bounds.getSize(new THREE.Vector3());
          const maxFootprint = Math.max(size.x, size.z);
          const autoScale = activeProperty.model?.fitToScene === false
            ? 1
            : maxFootprint > 0 ? 22 / maxFootprint : 1;
          const scale = (activeProperty.model?.scale ?? 1) * autoScale;
          asset.scale.setScalar(scale);
          asset.updateMatrixWorld(true);
          const fittedBounds = new THREE.Box3().setFromObject(asset);
          const fittedCenter = fittedBounds.getCenter(new THREE.Vector3());
          asset.position.x -= fittedCenter.x;
          asset.position.z -= fittedCenter.z;
          asset.position.y -= fittedBounds.min.y;
          asset.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              const vertexCount = child.geometry.getAttribute('position')?.count ?? 0;
              child.castShadow = quality !== 'low' && vertexCount > 24 && vertexCount < 12000;
              child.receiveShadow = true;
              const materials = Array.isArray(child.material) ? child.material : [child.material];
              materials.forEach((material) => {
                if ('envMapIntensity' in material) material.envMapIntensity = 0.72;
                if (material instanceof THREE.MeshStandardMaterial && material.roughness < 0.12) material.roughness = 0.18;
              });
              if (child.userData?.id) nodes.interactiveObjects.push(child);
            }
          });
          modelRoot.add(asset);
          const proceduralRoot = scene.getObjectByName('property-root');
          if (proceduralRoot) proceduralRoot.visible = false;
          finishLoading();
        },
        (event) => {
          if (event.total > 0) setLoadingProgress(82 + Math.round((event.loaded / event.total) * 17));
        },
        () => {
          setLoadingStatus('Detailed model unavailable, using architectural preview');
          finishLoading();
        }
      );
    } else {
      finishLoading();
    }

    const resizeObserver = new ResizeObserver(() => {
      const w = Math.max(container.clientWidth, 1);
      const h = Math.max(container.clientHeight, 1);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      postFXRef.current?.setSize(w, h);
    });
    resizeObserver.observe(container);
    const visibilityObserver = new IntersectionObserver(([entry]) => { visibleRef.current = entry.isIntersecting; }, { threshold: 0.01 });
    visibilityObserver.observe(container);
    const onVisibility = () => { visibleRef.current = document.visibilityState === 'visible'; };
    visibleRef.current = document.visibilityState === 'visible';
    document.addEventListener('visibilitychange', onVisibility);
    const timer = new THREE.Timer();
    let waterFrameElapsed = 0;
    // ViewerPage feeds camera coords to the minimap HUD through React state. Signalling every
    // rendered frame re-renders the whole viewer page at frame rate, which costs more CPU than
    // the WebGL work on weaker machines; 10 Hz is plenty for a radar readout.
    let lastCameraNotify = 0;
    const hasAnimatedWater = activeProperty.id === 'prop-obsidian-flagship' || activeProperty.id === 'prop-villa-solaria';
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      if (!visibleRef.current || document.visibilityState === 'hidden') return;
      timer.update();
      const delta = Math.min(timer.getDelta(), 0.05);
      waterFrameElapsed += delta;
      if (hasAnimatedWater && waterFrameElapsed >= 1 / 20) {
        waterFrameElapsed = 0;
        renderNeededRef.current = true;
      }
      const transition = transitionRef.current;
      const cameraIsAnimated = Boolean(transition) || performance.now() < animationUntilRef.current;
      let controlsChanged = false;
      if (transition) {
        transition.elapsed += delta;
        const t = Math.min(transition.elapsed / 0.9, 1);
        const eased = easeInOutCubic(t);
        camera.position.lerpVectors(transition.from, transition.to, eased);
        controls.target.lerpVectors(transition.fromLook, transition.toLook, eased);
        camera.lookAt(controls.target);
        if (t === 1) transitionRef.current = null;
      } else if (cameraModeRef.current !== 'orbit') {
        const state = fppRef.current;
        const vectors = frameVectorsRef.current;
        const input = vectors.input.set(
          (keysRef.current.KeyD || keysRef.current.ArrowRight ? 1 : 0) - (keysRef.current.KeyA || keysRef.current.ArrowLeft ? 1 : 0),
          0,
          (keysRef.current.KeyS || keysRef.current.ArrowDown ? 1 : 0) - (keysRef.current.KeyW || keysRef.current.ArrowUp ? 1 : 0)
        );
        if (input.lengthSq()) input.normalize();
        const forward = vectors.forward.set(-Math.sin(state.yaw), 0, -Math.cos(state.yaw));
        const right = vectors.right.set(Math.cos(state.yaw), 0, -Math.sin(state.yaw));
        const desired = vectors.desired.copy(right).multiplyScalar(input.x).addScaledVector(forward, -input.z).multiplyScalar(4.2);
        state.velocity.lerp(desired, Math.min(delta * 10, 1));
        const movement = vectors.movement.copy(state.velocity).multiplyScalar(delta);
        const radius = 0.34;
        const previousGround = Math.max(state.position.y - 1.6, 0);
        const isVillaWalk = activeProperty.id === 'prop-villa-solaria';
        const isSkyWalk = activeProperty.id === 'prop-sky-residence';
        const nextX = THREE.MathUtils.clamp(
          state.position.x + movement.x,
          (isVillaWalk ? -21.2 : -10.2) + radius,
          (isVillaWalk ? 21.2 : 10.2) - radius
        );
        const nextZ = THREE.MathUtils.clamp(
          state.position.z + movement.z,
          (isVillaWalk ? -17.4 : -8.05) + radius,
          (isVillaWalk ? 17.2 : isSkyWalk ? 11.4 : 8.85) - radius
        );
        const getGroundAt = (x: number, z: number) => {
          if (activeProperty.id === 'prop-obsidian-flagship') return getObsidianGroundHeight(x, z, previousGround);
          if (activeProperty.id === 'prop-sky-residence') return getSkyGroundHeight(x, z, previousGround);
          return Math.max(0, activeProperty.floors.find((floor) => floor.id === currentFloorRef.current)?.elevation ?? 0);
        };
        const candidateGroundX = getGroundAt(nextX, state.position.z);
        if (activeProperty.id !== 'prop-obsidian-flagship' || !intersectsWalkObstacle(nextX, state.position.z, candidateGroundX, radius)) {
          state.position.x = nextX;
        }
        const candidateGroundZ = getGroundAt(state.position.x, nextZ);
        if (activeProperty.id !== 'prop-obsidian-flagship' || !intersectsWalkObstacle(state.position.x, nextZ, candidateGroundZ, radius)) {
          state.position.z = nextZ;
        }
        const ground = getGroundAt(state.position.x, state.position.z);
        if (activeProperty.id === 'prop-obsidian-flagship' || activeProperty.id === 'prop-sky-residence') {
          const walkedFloorId = activeProperty.id === 'prop-obsidian-flagship'
            ? (ground > 1.8 ? 'floor-upper' : 'floor-ground')
            : (ground > 2.5 ? 'floor-sky-73' : 'floor-sky-72');
          if (currentFloorRef.current !== walkedFloorId) {
            currentFloorRef.current = walkedFloorId;
            setCurrentFloorId(walkedFloorId);
            setCurrentRoomId(null);
            currentRoomRef.current = null;
          }
          const walkedFloor = activeProperty.floors.find((floor) => floor.id === walkedFloorId);
          const nearestRoom = walkedFloor?.rooms.reduce<{ id: string; distance: number } | null>((nearest, room) => {
            const distance = Math.hypot(room.cameraPosition.x - state.position.x, room.cameraPosition.z - state.position.z);
            return !nearest || distance < nearest.distance ? { id: room.id, distance } : nearest;
          }, null);
          const roomId = nearestRoom && nearestRoom.distance < 5 ? nearestRoom.id : null;
          if (currentRoomRef.current !== roomId) {
            currentRoomRef.current = roomId;
            setCurrentRoomId(roomId);
          }
        }
        state.position.y = ground + 1.6;
        camera.position.copy(state.position);
        camera.lookAt(vectors.lookAt.copy(state.position).add(vectors.lookDirection.set(-Math.sin(state.yaw), Math.sin(state.pitch), -Math.cos(state.yaw))));
        if (avatarRef.current) { avatarRef.current.position.set(state.position.x, ground, state.position.z); avatarRef.current.updateDirection(state.yaw); }
      } else controlsChanged = controls.update();
      const interactive = doorStateRef.current;
      const targetDoor = interactive.doorsOpenState['obj-front-door'] ? -Math.PI / 2 : 0;
      nodes.frontDoorPivot.rotation.y = THREE.MathUtils.damp(nodes.frontDoorPivot.rotation.y, targetDoor, 7, delta);
      const targetMasterDoor = interactive.doorsOpenState['obj-master-door'] ? Math.PI / 2 : 0;
      nodes.masterDoorPivot.rotation.y = THREE.MathUtils.damp(nodes.masterDoorPivot.rotation.y, targetMasterDoor, 7, delta);
      nodes.balconySlider.position.x = THREE.MathUtils.damp(nodes.balconySlider.position.x, interactive.curtainsOpenState['obj-master-curtains'] ? -1.8 : 0, 7, delta);
      if (cameraModeRef.current === 'third-person') {
        const state = fppRef.current;
        const ground = Math.max(state.position.y - 1.6, 0);
        const follow = frameVectorsRef.current.follow.set(state.position.x + Math.sin(state.yaw) * 3.6, ground + 3.5, state.position.z + Math.cos(state.yaw) * 3.6);
        camera.position.lerp(follow, 1 - Math.pow(0.001, delta));
        camera.lookAt(state.position.x, ground + 1.2, state.position.z);
      }
      // Drawing mid-warmup would synchronously compile the very shaders compileAsync() is already
      // preparing off-thread, so the first real frame is held until warmup lands. Resolution and AO
      // shedding now live in RealismKit's adaptive step(), which runs from postFX.render().
      if (!warmupDone) return;
      // At most one hover raycast per frame, from the latest pointer position (events can arrive
      // several times per frame; doing the cast in the handler made pointer moves janky).
      const pendingHover = pendingHoverRef.current;
      if (pendingHover) {
        pendingHoverRef.current = null;
        applyHover(pendingHover.x, pendingHover.y);
      }
      if (cameraModeRef.current !== 'orbit' || controlsChanged || cameraIsAnimated || renderNeededRef.current) {
        const nowMs = performance.now();
        if (nowMs - lastCameraNotify >= 100) {
          lastCameraNotify = nowMs;
          onCameraMove?.(camera.position.x, camera.position.z, camera.rotation.y);
        }
        MaterialsLibrary.update(timer.getElapsed());
        if (postFXRef.current) postFXRef.current.render();
        else renderer.render(scene, camera);
        renderNeededRef.current = false;
      }
    };
    animate();
    const onContextLost = (event: Event) => { event.preventDefault(); setWebglError(true); };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    return () => {
      disposed = true;
      if (readyTimer !== null) window.clearTimeout(readyTimer);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      controls.removeEventListener('change', onControlsChange);
      controls.dispose();
      postFXRef.current?.composer.dispose();
      postFXRef.current = null;
      disposeObject(scene);
      MaterialsLibrary.dispose();
      renderer.dispose();
      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
      controlsRef.current = null;
      nodesRef.current = null;
      modelRootRef.current = null;
      skyRef.current = null;
    };
    // quality is a rebuild trigger: it feeds renderer setup, shadow-map size, MSAA samples and
    // the AO/bloom passes at construction time, so toggling it in the toolbar must recreate
    // the pipeline (the old effect only changed the pixel ratio, so "Low" barely helped).
  }, [activeProperty.id, quality]);

  useEffect(() => {
    skyRef.current?.setPreset(toTimeOfDay(lightingMode), nodesRef.current?.interiorLights);
    if (rendererRef.current) rendererRef.current.shadowMap.needsUpdate = true;
  }, [lightingMode]);
  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    const modelRenderCap = activeProperty.model?.glbUrl ? 1.15 : 1.5;
    const ratio = Math.min(window.devicePixelRatio, quality === 'high' ? modelRenderCap : quality === 'medium' ? 1.05 : 0.85);
    renderer.setPixelRatio(ratio);
    renderer.shadowMap.enabled = quality !== 'low';
    renderer.shadowMap.needsUpdate = true;
  }, [quality]);
  useEffect(() => {
    if (nodesRef.current) nodesRef.current.furnitureGroup.visible = isFurnished;
    if (rendererRef.current) rendererRef.current.shadowMap.needsUpdate = true;
  }, [isFurnished]);
  useEffect(() => {
    const nodes = nodesRef.current;
    if (!nodes) return;
    renderNeededRef.current = true;
    animationUntilRef.current = performance.now() + 700;
    if (rendererRef.current) rendererRef.current.shadowMap.needsUpdate = true;
    const livingOn = lightsOnState['obj-living-lights'] !== false;
    const diningOn = lightsOnState['obj-dining-chandelier'] !== false;
    nodes.livingLight.intensity = livingOn ? (nodes.livingLight.userData.base ?? 1.8) : 0;
    nodes.diningLight.intensity = diningOn ? (nodes.diningLight.userData.base ?? 1.4) : 0;
    const livingGlow = nodes.livingLightGlow.material as THREE.MeshStandardMaterial;
    const diningGlow = nodes.diningLightGlow.material as THREE.MeshStandardMaterial;
    livingGlow.emissiveIntensity = livingOn ? (livingGlow.userData.baseEmissive ?? 3.2) : 0;
    diningGlow.emissiveIntensity = diningOn ? (diningGlow.userData.baseEmissive ?? 3.2) : 0;
  }, [lightsOnState, lightingMode]);

  useEffect(() => {
    doorStateRef.current = { doorsOpenState, curtainsOpenState };
    renderNeededRef.current = true;
    animationUntilRef.current = performance.now() + 900;
  }, [doorsOpenState, curtainsOpenState]);

  useEffect(() => {
    if (!targetCameraPosition || !cameraRef.current || !controlsRef.current) return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const target = targetCameraLookAt ? toVector(targetCameraLookAt) : controls.target.clone();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { camera.position.copy(toVector(targetCameraPosition)); controls.target.copy(target); camera.lookAt(target); transitionRef.current = null; }
    else transitionRef.current = { from: camera.position.clone(), to: toVector(targetCameraPosition), fromLook: controls.target.clone(), toLook: target, elapsed: 0 };
    renderNeededRef.current = true;
    animationUntilRef.current = performance.now() + 1000;
    fppRef.current.position.copy(toVector(targetCameraPosition));
    const lookDirection = toVector(target).sub(toVector(targetCameraPosition)).normalize();
    fppRef.current.yaw = Math.atan2(-lookDirection.x, -lookDirection.z);
    fppRef.current.pitch = Math.asin(THREE.MathUtils.clamp(lookDirection.y, -1, 1));
    setAnnouncedRoom(currentRoomId ? `Jumped to ${currentRoomId}` : isExterior ? 'Returned to exterior' : 'Moved to new view');
  }, [targetCameraPosition, targetCameraLookAt, currentRoomId, isExterior]);

  useEffect(() => {
    const group = measurementGroupRef.current;
    if (!group) return;
    while (group.children.length) { const child = group.children.pop(); if (child) disposeObject(child); }
    [...measurements.map((measurement) => ({ start: measurement.start, end: measurement.end })), ...(activeMeasurementPoints.length === 2 ? [{ start: activeMeasurementPoints[0], end: activeMeasurementPoints[1] }] : [])].forEach(({ start, end }) => {
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([toVector(start), toVector(end)]), new THREE.LineDashedMaterial({ color: 0xd4af37, dashSize: 0.18, gapSize: 0.1 }));
      line.computeLineDistances();
      group.add(line);
      [start, end].forEach((point) => { const marker = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 8), MaterialsLibrary.get('glow-warm')); marker.position.copy(toVector(point)); group.add(marker); });
    });
    if (activeMeasurementPoints.length === 1) { const marker = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8), MaterialsLibrary.get('glow-warm')); marker.position.copy(toVector(activeMeasurementPoints[0])); group.add(marker); }
  }, [measurements, activeMeasurementPoints]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Escape') { document.exitPointerLock?.(); if (isMeasuringActive) { clearMeasurements(); setIsMeasuringActive(false); } }
      if (event.code === 'Space' && !(event.target instanceof HTMLInputElement)) { event.preventDefault(); setCameraMode(cameraModeRef.current === 'orbit' ? 'first-person' : 'orbit'); }
      if (event.code === 'Digit1') setCameraMode('orbit');
      if (event.code === 'Digit2') setCameraMode('first-person');
      if (event.code === 'Digit3') setCameraMode('third-person');
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) event.preventDefault();
      keysRef.current[event.code] = true;
    };
    const onKeyUp = (event: KeyboardEvent) => { keysRef.current[event.code] = false; };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); };
  }, [clearMeasurements, isMeasuringActive, setCameraMode, setIsMeasuringActive]);

  const getHit = (clientX: number, clientY: number, includeSurfaces = false) => {
    if (!cameraRef.current || !containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const ndc = (ndcRef.current ??= new THREE.Vector2());
    ndc.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    const raycaster = (raycasterRef.current ??= new THREE.Raycaster());
    raycaster.setFromCamera(ndc, cameraRef.current);
    if (!includeSurfaces) return raycaster.intersectObjects(nodesRef.current?.interactiveObjects ?? [], true)[0] ?? null;
    const surfaces: THREE.Object3D[] = [];
    sceneRef.current?.traverse((child) => {
      if (child instanceof THREE.Mesh && !child.parent?.name.includes('measurement')) surfaces.push(child);
    });
    return raycaster.intersectObjects(surfaces, true)[0] ?? null;
  };
  // Runs once per animation frame with the freshest pointer position. Hover scale, tooltip and
  // cursor are updated through refs/DOM so sweeping the mouse across furniture causes no React
  // re-renders at all (the tooltip state only changes when the hovered name actually changes).
  const applyHover = (clientX: number, clientY: number) => {
    const hit = getHit(clientX, clientY);
    const object = hit?.object ?? null;
    if (hoveredRef.current && hoveredRef.current !== object) hoveredRef.current.scale.setScalar(1);
    hoveredRef.current = object;
    const name = (object?.userData?.name as string | undefined) ?? null;
    if (object && name) object.scale.setScalar(1.035);
    if (name !== hoveredNameRef.current) {
      hoveredNameRef.current = name;
      setHoveredName(name);
    }
    const nextCursor = name ? 'pointer' : pointerRef.current.down ? 'grabbing' : 'grab';
    if (nextCursor !== cursorRef.current) {
      cursorRef.current = nextCursor;
      if (canvasRef.current) canvasRef.current.style.cursor = nextCursor;
    }
  };
  const onPointerDown = (event: React.PointerEvent) => { pointerRef.current = { down: true, moved: false, x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY }; (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId); if (cameraModeRef.current === 'first-person' && event.pointerType === 'mouse') (event.currentTarget as HTMLElement).requestPointerLock?.(); };
  const onPointerMove = (event: React.PointerEvent) => {
    const state = pointerRef.current;
    if (state.down && Math.hypot(event.clientX - state.startX, event.clientY - state.startY) > 6) state.moved = true;
    const pointerLocked = cameraModeRef.current !== 'orbit' && document.pointerLockElement === event.currentTarget;
    if (pointerLocked) { fppRef.current.yaw -= event.movementX * 0.003; fppRef.current.pitch = THREE.MathUtils.clamp(fppRef.current.pitch - event.movementY * 0.003, -1.1, 1.1); }
    else if (cameraModeRef.current !== 'orbit' && state.down && event.pointerType !== 'mouse') {
      fppRef.current.yaw -= (event.clientX - state.x) * 0.006;
      fppRef.current.pitch = THREE.MathUtils.clamp(fppRef.current.pitch - (event.clientY - state.y) * 0.006, -0.8, 0.8);
      state.x = event.clientX;
      state.y = event.clientY;
    }
    lastPointerRef.current = { x: event.clientX, y: event.clientY };
    // No hover work while look-locked: the cursor is hidden and nothing can be pointed at.
    if (!pointerLocked) pendingHoverRef.current = lastPointerRef.current;
  };
  const onPointerUp = (event: React.PointerEvent) => {
    // Refresh hover once after release so the cursor leaves 'grabbing' without needing movement.
    pendingHoverRef.current = { ...lastPointerRef.current };
    const wasDrag = pointerRef.current.moved;
    pointerRef.current.down = false;
    if (wasDrag) return;
    if (isMeasuringActive) {
      const surfaceHit = getHit(event.clientX, event.clientY, true);
      if (surfaceHit) addMeasurementPoint({ x: Number(surfaceHit.point.x.toFixed(2)), y: Number(surfaceHit.point.y.toFixed(2)), z: Number(surfaceHit.point.z.toFixed(2)) });
      return;
    }
    const hit = getHit(event.clientX, event.clientY);
    if (!hit) return;
    const data = hit.object.userData;
    if (!data?.id) return;
    if (data.type === 'door') toggleDoor(data.id);
    else if (data.type === 'light') toggleLight(data.id);
    else if (data.type === 'window') toggleCurtain(data.id);
    else setSelectedObject({ id: data.id, name: data.name, type: data.type, description: data.description, details: data.details });
  };

  const setWalkKey = (code: string, pressed: boolean, event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    keysRef.current[code] = pressed;
    if (pressed) event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onDoubleClick = (event: React.MouseEvent) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pointer = new THREE.Vector2(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, cameraRef.current);
    const hit = raycaster.intersectObjects(nodesRef.current?.interactiveObjects ?? [], true)[0];
    if (!hit) return;
    const direction = cameraRef.current.position.clone().sub(hit.point).normalize();
    transitionRef.current = {
      from: cameraRef.current.position.clone(),
      to: hit.point.clone().addScaledVector(direction, 2.6),
      fromLook: controlsRef.current.target.clone(),
      toLook: hit.point.clone(),
      elapsed: 0
    };
  };

  return <div ref={containerRef} className="relative h-full w-full select-none overflow-hidden bg-[#121821]" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onDoubleClick={onDoubleClick} onPointerLeave={() => { pendingHoverRef.current = null; if (hoveredRef.current) { hoveredRef.current.scale.setScalar(1); hoveredRef.current = null; } hoveredNameRef.current = null; setHoveredName(null); }}>
    <canvas ref={canvasRef} aria-label="Interactive 3D property walkthrough" className="block h-full w-full touch-none" style={{ cursor: 'grab' }} />
    {webglError && <div className="absolute inset-0 z-50 grid place-items-center bg-[#121821] p-6 text-center text-white"><div><h2 className="text-lg font-semibold">3D preview unavailable</h2><p className="mt-2 max-w-sm text-sm text-white/65">Your browser could not start WebGL, or the graphics context was interrupted. Reload the viewer to try again.</p></div></div>}
    {isLoading && !webglError && <div className="absolute inset-0 z-40 grid place-items-center bg-[#121821]/95 p-6 text-center text-white"><div className="w-full max-w-xs"><div className="mb-5 flex items-center justify-center gap-3"><Move3d className="h-5 w-5 text-[#d4af37]" /><span className="text-sm tracking-[0.18em] text-white/75">AURA / SPATIAL</span></div><div className="h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-[#d4af37] transition-[width] duration-300" style={{ width: `${loadingProgress}%` }} /></div><p className="mt-3 text-xs text-white/60" role="status">{loadingStatus} · {loadingProgress}%</p></div></div>}
    {hoveredName && !isMeasuringActive && <div className="pointer-events-none absolute left-1/2 top-6 z-20 flex -translate-x-1/2 items-center gap-2 rounded border border-[#d4af37]/40 bg-[#121821]/90 px-3 py-2 text-xs text-[#f5d878] shadow-xl"><MousePointer className="h-3.5 w-3.5" />{hoveredName}</div>}
    {cameraMode !== 'orbit' && <div className="absolute bottom-24 right-5 z-30 grid grid-cols-3 gap-1.5 sm:hidden" aria-label="Walk controls">
      <span />
      <button aria-label="Walk forward" onPointerDown={(event) => setWalkKey('KeyW', true, event)} onPointerUp={(event) => setWalkKey('KeyW', false, event)} onPointerCancel={(event) => setWalkKey('KeyW', false, event)} onLostPointerCapture={() => { keysRef.current.KeyW = false; }} className="grid h-11 w-11 touch-none place-items-center rounded-lg border border-white/15 bg-[#121821]/90 text-white shadow-lg"><ArrowUp className="h-4 w-4" /></button>
      <span />
      <button aria-label="Walk left" onPointerDown={(event) => setWalkKey('KeyA', true, event)} onPointerUp={(event) => setWalkKey('KeyA', false, event)} onPointerCancel={(event) => setWalkKey('KeyA', false, event)} onLostPointerCapture={() => { keysRef.current.KeyA = false; }} className="grid h-11 w-11 touch-none place-items-center rounded-lg border border-white/15 bg-[#121821]/90 text-white shadow-lg"><ArrowLeft className="h-4 w-4" /></button>
      <button aria-label="Walk backward" onPointerDown={(event) => setWalkKey('KeyS', true, event)} onPointerUp={(event) => setWalkKey('KeyS', false, event)} onPointerCancel={(event) => setWalkKey('KeyS', false, event)} onLostPointerCapture={() => { keysRef.current.KeyS = false; }} className="grid h-11 w-11 touch-none place-items-center rounded-lg border border-white/15 bg-[#121821]/90 text-white shadow-lg"><ArrowDown className="h-4 w-4" /></button>
      <button aria-label="Walk right" onPointerDown={(event) => setWalkKey('KeyD', true, event)} onPointerUp={(event) => setWalkKey('KeyD', false, event)} onPointerCancel={(event) => setWalkKey('KeyD', false, event)} onLostPointerCapture={() => { keysRef.current.KeyD = false; }} className="grid h-11 w-11 touch-none place-items-center rounded-lg border border-white/15 bg-[#121821]/90 text-white shadow-lg"><ArrowRight className="h-4 w-4" /></button>
    </div>}
    {isMeasuringActive && <div className="pointer-events-none absolute left-1/2 top-6 z-20 -translate-x-1/2 rounded border border-[#d4af37]/50 bg-[#121821]/90 px-3 py-2 text-center text-xs text-white/85" role="status">Measure surfaces · {activeMeasurementPoints.length}/2 selected</div>}
    <div className="sr-only" role="status" aria-live="polite">{announcedRoom}</div>
    {showRoomLabels && !isExterior && <div className="pointer-events-none absolute inset-0 z-10"><div className="pointer-events-auto absolute bottom-24 left-1/2 flex max-w-[90%] -translate-x-1/2 gap-2 overflow-x-auto rounded-lg border border-white/10 bg-[#121821]/92 p-2">{activeProperty.floors.flatMap((floor) => floor.rooms).map((room) => <button key={room.id} onClick={() => jumpToRoom(room.id)} className={`min-h-11 shrink-0 rounded px-3 text-left text-xs focus:outline-none focus:ring-2 focus:ring-[#d4af37] ${currentRoomId === room.id ? 'bg-[#d4af37] text-[#121821]' : 'bg-white/5 text-white/75'}`} aria-label={`Jump to ${room.name}`}>{room.name}</button>)}</div></div>}
  </div>;
};
