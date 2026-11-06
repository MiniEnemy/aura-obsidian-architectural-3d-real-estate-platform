import React, { createContext, useContext, useState, useEffect } from 'react';
import { CameraMode, LightingMode, Vector3D } from '../types/property';
import { ActiveMeasurement, ViewerTool } from '../types/viewer';
import { usePropertyContext } from './PropertyContext';

interface ViewerContextType {
  currentFloorId: string;
  setCurrentFloorId: (id: string) => void;
  currentRoomId: string | null;
  setCurrentRoomId: (id: string | null) => void;
  cameraMode: CameraMode;
  setCameraMode: (mode: CameraMode) => void;
  isExterior: boolean;
  setIsExterior: (ext: boolean) => void;
  lightingMode: LightingMode;
  setLightingMode: (mode: LightingMode) => void;
  isFurnished: boolean;
  setIsFurnished: React.Dispatch<React.SetStateAction<boolean>>;
  toggleFurnished: () => void;
  activeTool: ViewerTool;
  setActiveTool: (tool: ViewerTool) => void;
  // Interactive nodes state
  doorsOpenState: Record<string, boolean>;
  toggleDoor: (id: string) => void;
  lightsOnState: Record<string, boolean>;
  toggleLight: (id: string) => void;
  curtainsOpenState: Record<string, boolean>;
  toggleCurtain: (id: string) => void;
  // Guided tour
  isTourPlaying: boolean;
  currentTourStopIndex: number;
  startTour: () => void;
  pauseTour: () => void;
  resumeTour: () => void;
  nextTourStop: () => void;
  prevTourStop: () => void;
  exitTour: () => void;
  // Measurements
  isMeasuringActive: boolean;
  setIsMeasuringActive: (active: boolean) => void;
  measurements: ActiveMeasurement[];
  activeMeasurementPoints: Vector3D[];
  addMeasurementPoint: (point: Vector3D) => void;
  clearMeasurements: () => void;
  // Inspected object
  selectedObject: {
    id: string;
    name: string;
    type: string;
    description: string;
    details?: {
      designer?: string;
      material?: string;
      spec?: string;
    };
  } | null;
  setSelectedObject: (obj: any | null) => void;
  // Viewport & modes
  quality: 'high' | 'medium' | 'low';
  setQuality: (q: 'high' | 'medium' | 'low') => void;
  showRoomLabels: boolean;
  setShowRoomLabels: React.Dispatch<React.SetStateAction<boolean>>;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  is360Mode: boolean;
  setIs360Mode: (val: boolean) => void;
  // Camera trigger request
  targetCameraPosition: Vector3D | null;
  targetCameraLookAt: Vector3D | null;
  jumpToRoom: (roomId: string) => void;
  jumpToFloor: (floorId: string) => void;
  resetToExterior: () => void;
  enterHome: () => void;
}

const ViewerContext = createContext<ViewerContextType | undefined>(undefined);

export const ViewerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeProperty } = usePropertyContext();

  const [currentFloorId, setCurrentFloorId] = useState<string>('floor-ground');
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [cameraMode, setCameraMode] = useState<CameraMode>('orbit');
  const [isExterior, setIsExterior] = useState<boolean>(true);
  const [lightingMode, setLightingMode] = useState<LightingMode>('daytime');
  const [isFurnished, setIsFurnished] = useState<boolean>(true);
  const [activeTool, setActiveTool] = useState<ViewerTool>('none');
  const [quality, setQuality] = useState<'high' | 'medium' | 'low'>('high');
  const [showRoomLabels, setShowRoomLabels] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [is360Mode, setIs360Mode] = useState<boolean>(false);

  // Doors & lights & curtains
  const [doorsOpenState, setDoorsOpenState] = useState<Record<string, boolean>>({
    'obj-front-door': false,
    'obj-master-door': false
  });
  const [lightsOnState, setLightsOnState] = useState<Record<string, boolean>>({
    'obj-living-lights': true,
    'obj-dining-chandelier': true
  });
  const [curtainsOpenState, setCurtainsOpenState] = useState<Record<string, boolean>>({
    'obj-master-curtains': true
  });

  // Guided tour
  const [isTourPlaying, setIsTourPlaying] = useState<boolean>(false);
  const [currentTourStopIndex, setCurrentTourStopIndex] = useState<number>(0);

  // Measurement
  const [isMeasuringActive, setIsMeasuringActive] = useState<boolean>(false);
  const [measurements, setMeasurements] = useState<ActiveMeasurement[]>([]);
  const [activeMeasurementPoints, setActiveMeasurementPoints] = useState<Vector3D[]>([]);

  // Inspected object
  const [selectedObject, setSelectedObject] = useState<any | null>(null);

  // Camera targets
  const [targetCameraPosition, setTargetCameraPosition] = useState<Vector3D | null>(null);
  const [targetCameraLookAt, setTargetCameraLookAt] = useState<Vector3D | null>(null);

  // Reset defaults when active property changes
  useEffect(() => {
    if (activeProperty && activeProperty.floors.length > 0) {
      setCurrentFloorId(activeProperty.floors[0].id);
      setCurrentRoomId(null);
      setIsExterior(true);
      setCameraMode('orbit');
      setIsTourPlaying(false);
      setCurrentTourStopIndex(0);
      setDoorsOpenState({ 'obj-front-door': false, 'obj-master-door': false });
      setLightsOnState({ 'obj-living-lights': true, 'obj-dining-chandelier': true });
      setCurtainsOpenState({ 'obj-master-curtains': true });
      setSelectedObject(null);
      setActiveMeasurementPoints([]);
      setTargetCameraPosition({ x: 14, y: 7.5, z: 25 });
      setTargetCameraLookAt({ x: 0, y: 2.5, z: 0 });
    }
  }, [activeProperty.id]);

  const toggleFurnished = () => {
    setIsFurnished((prev) => !prev);
  };

  const toggleDoor = (id: string) => {
    setDoorsOpenState((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleLight = (id: string) => {
    setLightsOnState((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleCurtain = (id: string) => {
    setCurtainsOpenState((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const jumpToRoom = (roomId: string) => {
    for (const fl of activeProperty.floors) {
      const rm = fl.rooms.find((r) => r.id === roomId);
      if (rm) {
        setCurrentFloorId(fl.id);
        setCurrentRoomId(rm.id);
        setIsExterior(false);
        setTargetCameraPosition(rm.cameraPosition);
        setTargetCameraLookAt(rm.cameraTarget);
        return;
      }
    }
  };

  const jumpToFloor = (floorId: string) => {
    const fl = activeProperty.floors.find((f) => f.id === floorId);
    if (fl) {
      setCurrentFloorId(floorId);
      setIsExterior(false);
      if (fl.rooms.length > 0) {
        const firstRoom = fl.rooms[0];
        setCurrentRoomId(firstRoom.id);
        setTargetCameraPosition(firstRoom.cameraPosition);
        setTargetCameraLookAt(firstRoom.cameraTarget);
      } else {
        setTargetCameraPosition({ x: 0, y: fl.elevation + 2, z: 6 });
        setTargetCameraLookAt({ x: 0, y: fl.elevation + 1.5, z: 0 });
      }
    }
  };

  const resetToExterior = () => {
    setIsExterior(true);
    setCurrentRoomId(null);
    setCameraMode('orbit');
    setTargetCameraPosition({ x: 14, y: 7.5, z: 25 });
    setTargetCameraLookAt({ x: 0, y: 2.5, z: 0 });
  };

  const enterHome = () => {
    setIsExterior(false);
    // Find entrance room
    const entrance = activeProperty.floors
      .flatMap((f) => f.rooms)
      .find((r) => r.id.includes('entrance') || r.id.includes('living') || r.id.includes('great'));
    if (entrance) {
      setCurrentRoomId(entrance.id);
      setCurrentFloorId(entrance.floorId);
      setTargetCameraPosition(entrance.cameraPosition);
      setTargetCameraLookAt(entrance.cameraTarget);
    } else {
      setTargetCameraPosition({ x: 0, y: 1.7, z: 6 });
      setTargetCameraLookAt({ x: 0, y: 1.5, z: 0 });
    }
  };

  // Guided tour controls
  const startTour = () => {
    if (activeProperty.guidedTour.length === 0) return;
    setIsTourPlaying(true);
    setCurrentTourStopIndex(0);
    const stop = activeProperty.guidedTour[0];
    applyTourStop(stop);
  };

  const pauseTour = () => {
    setIsTourPlaying(false);
  };

  const resumeTour = () => {
    setIsTourPlaying(true);
  };

  const applyTourStop = (stop: any) => {
    if (stop.roomId) {
      setCurrentRoomId(stop.roomId);
    } else {
      setCurrentRoomId(null);
    }
    if (stop.floorId) {
      setCurrentFloorId(stop.floorId);
    }
    setIsExterior(stop.id.includes('exterior'));
    setTargetCameraPosition(stop.cameraPosition);
    setTargetCameraLookAt(stop.cameraTarget);
  };

  const nextTourStop = () => {
    if (activeProperty.guidedTour.length === 0) return;
    const nextIdx = (currentTourStopIndex + 1) % activeProperty.guidedTour.length;
    setCurrentTourStopIndex(nextIdx);
    applyTourStop(activeProperty.guidedTour[nextIdx]);
  };

  const prevTourStop = () => {
    if (activeProperty.guidedTour.length === 0) return;
    const prevIdx =
      (currentTourStopIndex - 1 + activeProperty.guidedTour.length) %
      activeProperty.guidedTour.length;
    setCurrentTourStopIndex(prevIdx);
    applyTourStop(activeProperty.guidedTour[prevIdx]);
  };

  const exitTour = () => {
    setIsTourPlaying(false);
    setActiveTool('none');
  };

  // Measurement tool
  const addMeasurementPoint = (point: Vector3D) => {
    const updated = [...activeMeasurementPoints, point];
    if (updated.length === 2) {
      const p1 = updated[0];
      const p2 = updated[1];
      const dist = Math.sqrt(
        Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2) + Math.pow(p2.z - p1.z, 2)
      );
      const newMeasurement: ActiveMeasurement = {
        id: `meas-${Date.now()}`,
        start: p1,
        end: p2,
        distanceMeters: parseFloat(dist.toFixed(2)),
        label: `${dist.toFixed(2)} m`
      };
      setMeasurements((prev) => [...prev, newMeasurement]);
      setActiveMeasurementPoints([]);
    } else {
      setActiveMeasurementPoints(updated);
    }
  };

  const clearMeasurements = () => {
    setMeasurements([]);
    setActiveMeasurementPoints([]);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <ViewerContext.Provider
      value={{
        currentFloorId,
        setCurrentFloorId,
        currentRoomId,
        setCurrentRoomId,
        cameraMode,
        setCameraMode,
        isExterior,
        setIsExterior,
        lightingMode,
        setLightingMode,
        isFurnished,
        setIsFurnished,
        toggleFurnished,
        activeTool,
        setActiveTool,
        doorsOpenState,
        toggleDoor,
        lightsOnState,
        toggleLight,
        curtainsOpenState,
        toggleCurtain,
        isTourPlaying,
        currentTourStopIndex,
        startTour,
        pauseTour,
        resumeTour,
        nextTourStop,
        prevTourStop,
        exitTour,
        isMeasuringActive,
        setIsMeasuringActive,
        measurements,
        activeMeasurementPoints,
        addMeasurementPoint,
        clearMeasurements,
        selectedObject,
        setSelectedObject,
        quality,
        setQuality,
        showRoomLabels,
        setShowRoomLabels,
        isFullscreen,
        toggleFullscreen,
        is360Mode,
        setIs360Mode,
        targetCameraPosition,
        targetCameraLookAt,
        jumpToRoom,
        jumpToFloor,
        resetToExterior,
        enterHome
      }}
    >
      {children}
    </ViewerContext.Provider>
  );
};

export const useViewerContext = () => {
  const ctx = useContext(ViewerContext);
  if (!ctx) throw new Error('useViewerContext must be used within ViewerProvider');
  return ctx;
};
