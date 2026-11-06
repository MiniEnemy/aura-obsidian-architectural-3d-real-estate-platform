export type PropertyType = 'villa' | 'family-house' | 'penthouse' | 'estate';

export type LightingMode = 'morning' | 'daytime' | 'evening' | 'night';
export type CameraMode = 'orbit' | 'first-person' | 'third-person';

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface RoomHotspot {
  id: string;
  name: string;
  position: Vector3D;
  areaSqm: number;
  description: string;
  keyFeatures: string[];
}

export interface InteractiveObject {
  id: string;
  name: string;
  type: 'door' | 'light' | 'furniture' | 'appliance' | 'window';
  position: Vector3D;
  description: string;
  state: {
    isOpen?: boolean;
    isOn?: boolean;
    activeInfo?: string;
  };
  details?: {
    designer?: string;
    material?: string;
    spec?: string;
  };
}

export interface RoomData {
  id: string;
  name: string;
  floorId: string;
  areaSqm: number;
  cameraPosition: Vector3D;
  cameraTarget: Vector3D;
  description: string;
  features: string[];
  dimensions: string; // e.g., "5.4m × 4.2m"
  hotspots?: RoomHotspot[];
  interactiveObjects?: InteractiveObject[];
}

export interface FloorData {
  id: string;
  level: number;
  label: string; // "Ground Floor", "Level 01", "Penthouse"
  elevation: number; // in meters (Y offset)
  planSvg?: string;
  rooms: RoomData[];
}

export interface AgentData {
  id: string;
  name: string;
  title: string;
  company: string;
  phone: string;
  email: string;
  avatarUrl: string;
  experienceYears: number;
  propertiesListed: number;
  rating: number;
  licenseNumber: string;
}

export interface PropertyFeature {
  icon: string;
  title: string;
  description: string;
}

export interface NearbyPlace {
  category: 'transit' | 'education' | 'dining' | 'nature' | 'wellness';
  name: string;
  distance: string;
  walkTime: string;
}

export interface GuidedTourStop {
  id: string;
  title: string;
  description: string;
  floorId: string;
  roomId?: string;
  cameraPosition: Vector3D;
  cameraTarget: Vector3D;
  narration: string;
}

export interface Property {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  location: {
    address: string;
    neighborhood: string;
    city: string;
    country: string;
    coordinates: { lat: number; lng: number };
  };
  price: number;
  currency: string;
  propertyType: PropertyType;
  bedrooms: number;
  bathrooms: number;
  totalAreaSqm: number;
  lotSizeSqm?: number;
  yearBuilt: number;
  architect?: string;
  energyRating: 'A+' | 'A' | 'B' | 'C';
  features: string[];
  description: string;
  highlights: PropertyFeature[];
  images: {
    hero: string;
    exterior: string[];
    interior: string[];
    plans: string[];
  };
  has3D: boolean;
  hasVR: boolean;
  hasAR: boolean;
  model?: {
    glbUrl: string;
    usdzUrl?: string;
    posterUrl?: string;
    scale?: number;
    fitToScene?: boolean;
  };
  floors: FloorData[];
  guidedTour: GuidedTourStop[];
  agent: AgentData;
  nearbyPlaces: NearbyPlace[];
  featured?: boolean;
  viewCount: number;
  completionDate?: string;
}

export interface ScheduledVisit {
  id: string;
  propertyId: string;
  propertyName: string;
  date: string;
  timeSlot: string;
  visitType: 'in-person' | '3d-guided' | 'virtual-video';
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes?: string;
  createdAt: string;
}

export interface InquiryMessage {
  id: string;
  propertyId: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  preferredContact: 'email' | 'phone' | 'whatsapp';
  createdAt: string;
}
