import { LightingMode, CameraMode, Vector3D } from './property';

export type ViewerTool = 'none' | 'measure' | 'floorplan' | 'rooms' | 'lighting' | 'tour' | 'inspector' | 'vr' | 'ar';

export interface MeasurementPoint {
  id: string;
  point: Vector3D;
  normal?: Vector3D;
}

export interface ActiveMeasurement {
  id: string;
  start: Vector3D;
  end: Vector3D;
  distanceMeters: number;
  label: string;
}

export interface ViewerState {
  currentFloorId: string;
  currentRoomId: string | null;
  cameraMode: CameraMode;
  isExterior: boolean;
  lightingMode: LightingMode;
  isFurnished: boolean;
  activeTool: ViewerTool;
  isTourPlaying: boolean;
  currentTourStopIndex: number;
  quality: 'high' | 'medium' | 'low';
  measurements: ActiveMeasurement[];
  isMeasuringActive: boolean;
  activeMeasurementPoints: Vector3D[];
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
  doorsOpenState: Record<string, boolean>;
  lightsOnState: Record<string, boolean>;
  curtainsOpenState: Record<string, boolean>;
  showRoomLabels: boolean;
  isFullscreen: boolean;
  isVrActive: boolean;
  isArActive: boolean;
  is360Mode: boolean;
}
