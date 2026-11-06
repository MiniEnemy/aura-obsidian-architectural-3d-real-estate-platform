# AURA — Obsidian Architectural 3D Real Estate Platform

A next-generation spatial architectural property platform built with React, TypeScript, Three.js, and WebXR. Centered around interactive, photorealistic 3D property exploration, this platform allows patrons, developers, and architects to discover residences, inspect exterior forms, enter through doors, walk through rooms in 1:1 scale, switch floors, teleport via interactive blueprints, test solar daylight, take laser measurements, and explore in VR/AR.

---

## 1. Quick Start & Execution

```bash
# Install dependencies (this repo ships a bun lockfile; npm works too)
bun install
# or: npm install

# Start local development server (http://localhost:3000)
npm run dev

# Type-check the project
npm run lint

# Build for production
npm run build
```

---

## 2. Architecture & File Structure

```text
src/
├── types/
│   ├── property.ts             # Property, Floor, Room, Hotspot, InteractiveObject, Agent types
│   └── viewer.ts               # Viewer toolbars, measurement states, camera modes, telemetry
├── data/
│   └── propertiesData.ts       # 3 comprehensive architectural properties with rooms & features
├── three/
│   ├── PropertySceneBuilder.ts # Procedural PBR 3D architectural engine (floors, walls, glass, lights)
│   ├── MaterialsLibrary.ts     # PBR materials: travertine, basalt, glass, bronze, walnut, marble
│   ├── SkyboxGenerator.ts      # Celestial solar engine: dawn, midday, sunset, night moon & stars
│   └── AvatarFigure.ts         # Translucent obsidian architectural avatar for Third-Person Perspective
├── context/
│   ├── PropertyContext.tsx     # Marketplace state, reactive search/filters, favorites, comparison
│   └── ViewerContext.tsx       # 3D spatial state, active tool, floor/room teleport, measurements, tour
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx          # Brand header, currency switcher, saved/compare badges
│   │   ├── Footer.tsx          # Monograph architectural credits & spatial disclaimer
│   │   └── QuickCompareDrawer.tsx # Floating comparison shelf
│   ├── property/
│   │   ├── PropertyCard.tsx    # Architectural listing card with "See Inside (3D)" action
│   │   ├── PropertyFilterBar.tsx # Multi-attribute filter & search engine
│   │   ├── MortgageCalculator.tsx # Dynamic mathematical mortgage & financing tool
│   │   ├── NeighborhoodMap.tsx # Proximity matrix & nearby landmark analysis
│   │   ├── ScheduleVisitModal.tsx # Private booking flow with local persistence & confetti
│   │   ├── ContactAgentModal.tsx # Direct advisory inquiry form
│   │   └── ShareModal.tsx      # Deep link & QR code sharing interface
│   ├── viewer/
│   │   ├── ThreeDViewer.tsx    # High-performance Three.js WebGL viewport with raycasting
│   │   ├── ViewerToolbar.tsx   # Floating glass control HUD (FPP, Orbit, Avatar, Measure, Tour)
│   │   ├── FloorSelector.tsx   # Vertical/horizontal floorplate rail
│   │   ├── FloorPlanModal.tsx  # Two-way connected blueprint (click room to fly there in 3D)
│   │   ├── MiniMapHUD.tsx      # Corner radar with live camera coordinate marker & azimuth
│   │   ├── RoomSelectorDrawer.tsx # Directory of all structural rooms with area readouts
│   │   ├── LightingControlModal.tsx # Atmospheric solar simulation (Dawn, Day, Sunset, Night)
│   │   ├── GuidedTourHUD.tsx   # Automated cinematic camera walkthrough player
│   │   ├── ObjectInspectorModal.tsx # Interactive dossier for doors, chandeliers, cooktops
│   │   ├── TutorialModal.tsx   # Onboarding navigation manual
│   │   ├── VRModal.tsx         # WebXR immersive-vr detection & launch
│   │   ├── ARModal.tsx         # WebXR immersive-ar & mobile tabletop projection
│   │   └── Panorama360View.tsx # High-resolution 360-degree equirectangular panorama mode
│   └── pages/
│       ├── HomePage.tsx        # Cinematic landing hero, featured residences, spatial paradigm
│       ├── PropertiesPage.tsx  # Marketplace catalogue with active filtering
│       ├── PropertyDetailPage.tsx # Architectural monograph with signature "SEE INSIDE" CTA
│       ├── ViewerPage.tsx      # Dedicated full-bleed immersive spatial 3D experience
│       ├── ComparePage.tsx     # Side-by-side volumetric and financial comparison matrix
│       └── SavedPropertiesPage.tsx # Curated saved residences stored in LocalStorage
└── utils/
    ├── storage.ts              # LocalStorage persistence for favorites, visits, inquiries
    └── formatters.ts           # Multi-currency and metric/imperial formatters
```

---

## 3. How Property Data & Rooms Are Structured

Every property in `src/data/propertiesData.ts` conforms to the `Property` interface:

```typescript
interface Property {
  id: string;
  slug: string;
  name: string;
  price: number;
  totalAreaSqm: number;
   model?: {
      glbUrl: string;
      usdzUrl?: string;
      posterUrl?: string;
      scale?: number;
   };
  floors: FloorData[];
  guidedTour: GuidedTourStop[];
  agent: AgentData;
  nearbyPlaces: NearbyPlace[];
  // ...
}
```

Each floor contains defined rooms with exact 3D camera coordinates:
```typescript
interface RoomData {
  id: string;
  name: string;
  floorId: string;
  areaSqm: number;
  dimensions: string; // e.g., "10.2m × 6.6m"
  cameraPosition: { x: number; y: number; z: number };
  cameraTarget: { x: number; y: number; z: number };
  description: string;
  features: string[];
}
```

---

## 4. How 3D Interactivity Works

1. **Two-Way Connected Blueprint**:
   - Clicking a room in `FloorPlanModal` or `MiniMapHUD` invokes `jumpToRoom(roomId)`.
   - The 3D camera smoothly cubic-lerps to the room's preset camera coordinates and look-at point.
   - In reverse, walking inside a room dynamically highlights that room on the blueprint and radar.

2. **Interactive Objects**:
   - Front Pivot Door & Master Suite Door: Click to swing open/close (smooth Three.js hinge pivot interpolation).
   - Architectural Lights: Click chandeliers or linear LEDs to turn point lights on/off and toggle emissive bloom.
   - Furniture & Kitchen Island: Click to inspect designer specifications (Bora cooktop, Herman Miller Eames lounge, Calacatta marble).

3. **Euclidean Laser Measurement Tool**:
   - Activate the measurement tool in the viewer toolbar.
   - Click any two 3D architectural surfaces (snapped using Three.js raycasting).
   - Generates laser lines, endpoint markers, and calculates exact real-world distance in meters (e.g., `4.28 m`).

4. **Day / Night Solar Engine**:
   - Changes sun elevation, azimuth, sunlight color temperature, ambient light, fog, starfield particles, and pool/garden accent lighting.

5. **WebXR VR & AR Detection**:
   - Detects `navigator.xr?.isSessionSupported('immersive-vr')` and `immersive-ar`.
   - When supported, launches real WebXR sessions.
   - When unsupported on conventional screens, provides graceful fallback guidance.

---

## 5. Adding or Replacing a Property

1. Open `src/data/propertiesData.ts`.
2. Add your property object or modify existing attributes (price, name, rooms, coordinates).
3. To customize the 3D procedural architecture, add a scene builder method in `src/three/PropertySceneBuilder.ts`.
4. For a scanned or artist-built residence, add a licensed CDN-hosted model through the optional `model` field:

```typescript
model: {
   // Generated local Villa Lumina asset.
   glbUrl: '/models/villa-lumina-azure.glb',
   scale: 1
}
```

The generated Villa Lumina asset lives at `public/models/villa-lumina-azure.glb` and can be rebuilt with `npm run export:villa`. The viewer loads GLB/GLTF with `GLTFLoader`, reports download progress, auto-centers and grounds the asset, and preserves the procedural scene if the asset is missing or unavailable. Store production models in object storage or a CDN with CORS enabled; do not commit large binary models to the repository. `usdzUrl` is reserved for a future iOS Quick Look launch, while the in-browser walkthrough uses GLB/GLTF.
