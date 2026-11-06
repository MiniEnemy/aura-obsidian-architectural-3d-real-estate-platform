import { Property } from '../types/property';

export const PROPERTIES: Property[] = [
  {
    id: 'prop-obsidian-flagship',
    slug: 'obsidian-residence',
    name: 'The Obsidian Pavilion',
    tagline: 'Sculptural Modernist Residence with Double-Height Glass Atrium & Infinity Reflection Pool',
    location: {
      address: '742 Highland Crest Way',
      neighborhood: 'Bel Air Foothills',
      city: 'Los Angeles',
      country: 'United States',
      coordinates: { lat: 34.0837, lng: -118.4467 }
    },
    price: 8450000,
    currency: 'USD',
    propertyType: 'family-house',
    bedrooms: 3,
    bathrooms: 4.5,
    totalAreaSqm: 560,
    lotSizeSqm: 1450,
    yearBuilt: 2025,
    architect: 'Kengo Kuma & Associates Collaboratory',
    energyRating: 'A+',
    features: [
      'Cantilevered Master Suite',
      'Double-Height Glass Atrium',
      'Heated Saltwater Infinity Pool',
      'Dual-Car Concealed Showroom Garage',
      'Smart Home KNX Automation',
      'Architectural Travertine Fireplace',
      'Miele MasterCool Gourmet Kitchen',
      'Private Landscaped Zen Garden'
    ],
    description:
      'Engineered at the intersection of raw geological mass and ethereal transparency, The Obsidian Pavilion represents a masterclass in modern residential architecture. Floor-to-ceiling Schuco motorized glazing unites interior slate flooring with sweeping terrace vistas, while bespoke brushed brass fixtures and black walnut joinery infuse warmth into the monolithic basalt framework.',
    highlights: [
      {
        icon: 'Maximize2',
        title: '560 m² Living Space',
        description: 'Open-concept continuous flow across two structural levels with zero internal columns.'
      },
      {
        icon: 'Sun',
        title: 'Bespoke Solar Tracking',
        description: 'Optimized passive solar shading with automated exterior louvers and 14kW roof solar glass.'
      },
      {
        icon: 'Shield',
        title: 'Structural Steel & Basalt',
        description: 'Seismically rated titanium-reinforced steel frame with thermal travertine cladding.'
      },
      {
        icon: 'Waves',
        title: 'Hydro-Reflection Garden',
        description: 'Sunken courtyard water feature creating dynamic light refractions onto living room ceilings.'
      }
    ],
    images: {
      hero: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
      exterior: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'
      ],
      interior: [
        'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1200&q=80'
      ],
      plans: [
        'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    has3D: true,
    hasVR: true,
    hasAR: true,
    floors: [
      {
        id: 'floor-ground',
        level: 0,
        label: 'Ground Level',
        elevation: 0,
        rooms: [
          {
            id: 'room-entrance',
            name: 'Grand Entrance & Foyer',
            floorId: 'floor-ground',
            areaSqm: 24,
            dimensions: '6.0m × 4.0m',
            cameraPosition: { x: 0, y: 1.7, z: 9.5 },
            cameraTarget: { x: 0, y: 1.6, z: 2.0 },
            description: 'Monumental pivot door in oxidized blackened oak opening into a gallery vestibule with floating travertine staircase.',
            features: ['Architectural Pivot Door', 'Recessed Floor Washlights', 'Travertine Floating Stairs', 'Coat Vestibule'],
            hotspots: [
              {
                id: 'spot-pivot-door',
                name: 'Custom Pivot Entry Door',
                position: { x: 0, y: 1.5, z: 9.8 },
                areaSqm: 4,
                description: 'Floor-to-ceiling 3-meter blackened oak pivot door with motorized magnetic latch.',
                keyFeatures: ['Thermal acoustic core', 'Keyless biometrics', 'Champagne bronze pull bar']
              }
            ],
            interactiveObjects: [
              {
                id: 'obj-front-door',
                name: 'Main Entrance Pivot Door',
                type: 'door',
                position: { x: 0, y: 1.5, z: 9.8 },
                description: 'Click to swing the 3-meter oak pivot door open or closed.',
                state: { isOpen: false },
                details: { designer: 'Studio Obsidian Custom', material: 'Blackened Oak & Bronze Frame' }
              }
            ]
          },
          {
            id: 'room-living',
            name: 'Double-Height Living Salon',
            floorId: 'floor-ground',
            areaSqm: 68,
            dimensions: '10.2m × 6.6m',
            cameraPosition: { x: -3.5, y: 1.7, z: 1.5 },
            cameraTarget: { x: 0, y: 1.5, z: -3.0 },
            description: 'Expansive reception salon with 6.2m ceiling height, sculptural fireplace in honed black granite, and motorized glass wall.',
            features: ['6.2m Double-Height Volume', 'Honed Granite Linear Fireplace', 'Integrated Bowers & Wilkins Audio', 'Automated Glass Curtain Wall'],
            hotspots: [
              {
                id: 'spot-fireplace',
                name: 'Monolithic Linear Fireplace',
                position: { x: -6.5, y: 1.2, z: -2.0 },
                areaSqm: 5,
                description: 'Natural gas fireplace with ceramic riverstones encased in flame-textured volcanic basalt.',
                keyFeatures: ['Smokeless ventilation', 'Atmospheric flame modulation', 'Travertine surround']
              }
            ],
            interactiveObjects: [
              {
                id: 'obj-living-lights',
                name: 'Chandelier & Recessed Linear LEDs',
                type: 'light',
                position: { x: -2.0, y: 4.8, z: 0 },
                description: 'Toggle the warm champagne chandelier and architectural cove lighting.',
                state: { isOn: true },
                details: { designer: 'Flos Architectural', material: 'Brushed Brass & Diffused Opal Glass' }
              },
              {
                id: 'obj-eames-lounge',
                name: 'Mid-Century Lounge Chair & Ottoman',
                type: 'furniture',
                position: { x: -2.2, y: 0.5, z: 2.0 },
                description: 'Iconic lounge setting in aniline ebony leather and santos palisander veneer.',
                state: { activeInfo: 'Authentic licensed Herman Miller edition with obsidian metal base.' },
                details: { designer: 'Charles & Ray Eames', material: 'Ebony Leather & Palisander' }
              }
            ]
          },
          {
            id: 'room-dining',
            name: 'Formal Dining Pavilion',
            floorId: 'floor-ground',
            areaSqm: 36,
            dimensions: '6.0m × 6.0m',
            cameraPosition: { x: 3.5, y: 1.7, z: 2.0 },
            cameraTarget: { x: 4.0, y: 1.5, z: -2.5 },
            description: 'Intimate dining space crowned by an amber glass mobile chandelier, seating 10 guests with garden terrace views.',
            features: ['Seats 10 Guests', 'Direct Wine Cellar Access', 'Solid Walnut Table', 'Bespoke Suspended Mobile Pendant'],
            hotspots: [],
            interactiveObjects: [
              {
                id: 'obj-dining-chandelier',
                name: 'Amber Glass Halo Pendant',
                type: 'light',
                position: { x: 3.8, y: 2.7, z: -1.0 },
                description: 'Toggle the sculptural dining table illumination.',
                state: { isOn: true }
              }
            ]
          },
          {
            id: 'room-kitchen',
            name: 'Chef’s Show Kitchen & Island',
            floorId: 'floor-ground',
            areaSqm: 42,
            dimensions: '7.0m × 6.0m',
            cameraPosition: { x: 4.5, y: 1.7, z: -3.5 },
            cameraTarget: { x: 1.0, y: 1.5, z: -4.0 },
            description: 'Culinary showcase featuring 4.2m monolithic Calacatta marble waterfall island, seamless touch-to-open joinery, and Miele MasterCool suite.',
            features: ['4.2m Calacatta Waterfall Island', 'Miele MasterCool Dual Refrigeration', 'Bora Induction with Downdraft', 'Concealed Butler’s Pantry'],
            hotspots: [
              {
                id: 'spot-marble-island',
                name: 'Bookmatched Calacatta Island',
                position: { x: 2.5, y: 1.0, z: -4.2 },
                areaSqm: 8,
                description: 'Single continuous slab of honed Italian Calacatta marble with undermount champagne Franke sink.',
                keyFeatures: ['Sealed anti-stain finish', 'Integrated wireless induction charging', 'Hidden bar seating']
              }
            ],
            interactiveObjects: [
              {
                id: 'obj-kitchen-cooktop',
                name: 'Bora Professional Induction Cooktop',
                type: 'appliance',
                position: { x: 2.6, y: 1.1, z: -4.5 },
                description: 'Surface induction with motorized downdraft vapor extractor.',
                state: { activeInfo: 'Zone-less induction with solid stainless steel control dials.' },
                details: { designer: 'Bora / Miele', material: 'Ceramic Glass & Stainless Steel' }
              }
            ]
          },
          {
            id: 'room-guest-bath',
            name: 'Powder Room & Guest Bath',
            floorId: 'floor-ground',
            areaSqm: 12,
            dimensions: '4.0m × 3.0m',
            cameraPosition: { x: -4.5, y: 1.7, z: 6.5 },
            cameraTarget: { x: -5.5, y: 1.5, z: 5.0 },
            description: 'Dramatic powder room with illuminated Nero Marquina fluted marble basin and Vola floor-mount brass tapware.',
            features: ['Fluted Nero Marquina Sink', 'Vola Matt Black Tapware', 'Backlit Fluted Glass Mirror', 'Toto Neorest Smart Toilet'],
            hotspots: []
          },
          {
            id: 'room-garage',
            name: 'Showroom Dual Garage',
            floorId: 'floor-ground',
            areaSqm: 48,
            dimensions: '8.0m × 6.0m',
            cameraPosition: { x: -6.0, y: 1.7, z: 9.0 },
            cameraTarget: { x: -6.0, y: 1.4, z: 4.0 },
            description: 'Climate-controlled twin vehicle gallery with terrazzo flooring, recessed LED grid ceiling, and twin 22kW EV chargers.',
            features: ['Twin 22kW Tesla Wall Connectors', 'Epoxy Terrazzo Floor', 'Acoustic Wall Paneling', 'Concealed Workshop Storage'],
            hotspots: []
          }
        ]
      },
      {
        id: 'floor-upper',
        level: 1,
        label: 'Upper Sanctuary',
        elevation: 3.6,
        rooms: [
          {
            id: 'room-master',
            name: 'Master Penthouse Suite',
            floorId: 'floor-upper',
            areaSqm: 54,
            dimensions: '9.0m × 6.0m',
            cameraPosition: { x: -3.5, y: 5.3, z: -2.5 },
            cameraTarget: { x: 0, y: 5.1, z: -4.5 },
            description: 'Private cantilevered retreat with wraparound glass walls, custom king platform bed, fireplace, and private sundeck.',
            features: ['Floor-to-Ceiling Corner Glazing', 'Motorized Sheer & Blackout Drapes', 'Walk-Through Poliform Dressing Room', 'Private Morning Sun Terrace'],
            hotspots: [
              {
                id: 'spot-balcony-view',
                name: 'Cantilevered Glass Balcony',
                position: { x: -4.0, y: 5.1, z: -6.8 },
                areaSqm: 18,
                description: 'Cantilevered viewing deck floating 6 meters above the pool with panoramic city view.',
                keyFeatures: ['Frameless glass balustrade', 'Ipe hardwood decking', 'Recessed base uplights']
              }
            ],
            interactiveObjects: [
              {
                id: 'obj-master-curtains',
                name: 'Motorized Acoustic Linen Curtains',
                type: 'window',
                position: { x: -3.5, y: 5.0, z: -6.4 },
                description: 'Toggle motorized drapes open or closed.',
                state: { isOpen: true },
                details: { designer: 'Silent Gliss System', material: 'Belgian Sheer Linen' }
              },
              {
                id: 'obj-master-door',
                name: 'Master Suite Acoustic Door',
                type: 'door',
                position: { x: -1.2, y: 5.1, z: 1.8 },
                description: 'Click to open or close the master suite entry door.',
                state: { isOpen: false }
              }
            ]
          },
          {
            id: 'room-master-bath',
            name: 'Master Spa Ensuite',
            floorId: 'floor-upper',
            areaSqm: 26,
            dimensions: '6.5m × 4.0m',
            cameraPosition: { x: -5.5, y: 5.3, z: 2.0 },
            cameraTarget: { x: -6.5, y: 5.1, z: 0 },
            description: 'Freestanding solid surface soaking tub with unobstructed garden view, dual steam rain-showers, and heated stone floors.',
            features: ['Freestanding Solid Stone Tub', 'Dual Steam Rain Showers', 'Antonio Lupi Dual Vanities', 'Radiant Underfloor Heating'],
            hotspots: []
          },
          {
            id: 'room-bed-2',
            name: 'Suite Two (Guest Suite)',
            floorId: 'floor-upper',
            areaSqm: 28,
            dimensions: '5.6m × 5.0m',
            cameraPosition: { x: 3.5, y: 5.3, z: -3.0 },
            cameraTarget: { x: 5.0, y: 5.1, z: -4.5 },
            description: 'Generous suite with integrated walnut study desk, built-in wardrobes, and sliding access to upper terrace.',
            features: ['Built-In Walnut Desk', 'Ensuite Bathroom', 'Direct Terrace Access', 'Acoustic Soundproofing'],
            hotspots: []
          },
          {
            id: 'room-bed-3',
            name: 'Suite Three (Junior Suite)',
            floorId: 'floor-upper',
            areaSqm: 24,
            dimensions: '5.0m × 4.8m',
            cameraPosition: { x: 3.5, y: 5.3, z: 2.5 },
            cameraTarget: { x: 5.0, y: 5.1, z: 4.0 },
            description: 'Airy guest bedroom with floor-to-ceiling corner glazing overlooking the front garden and driveway.',
            features: ['Corner Bay Windows', 'Custom Joinery', 'Oak Parquet Floors', 'Ensuite Shower'],
            hotspots: []
          },
          {
            id: 'room-upper-hall',
            name: 'Upper Bridge Gallery',
            floorId: 'floor-upper',
            areaSqm: 22,
            dimensions: '7.5m × 3.0m',
            cameraPosition: { x: 0, y: 5.3, z: 0.5 },
            cameraTarget: { x: 0, y: 3.5, z: -2.0 },
            description: 'Glazed catwalk bridge overlooking the double-height salon below and connecting the east and west wings.',
            features: ['Frameless Glass Balustrade', 'Overlooks Double-Height Salon', 'Curated Art Wall Lighting'],
            hotspots: []
          }
        ]
      }
    ],
    guidedTour: [
      {
        id: 'stop-1-exterior',
        title: 'Architectural Arrival & Facade',
        description: 'Take in the cantilevered forms, honey cedar wood louvers, travertine terrace, and illuminated double-height glass.',
        floorId: 'floor-ground',
        cameraPosition: { x: 14, y: 7.5, z: 25 },
        cameraTarget: { x: 0, y: 2.5, z: 0 },
        narration: 'Welcome to The Obsidian Pavilion. Notice the warm cedar louvers, honed travertine podium, and illuminated double-height atrium.'
      },
      {
        id: 'stop-2-entrance',
        title: 'Grand Entrance & Floating Staircase',
        description: 'Step past the 3-meter blackened oak pivot door onto continuous polished limestone slabs.',
        floorId: 'floor-ground',
        roomId: 'room-entrance',
        cameraPosition: { x: 0, y: 1.7, z: 8.5 },
        cameraTarget: { x: 0, y: 1.8, z: 2.0 },
        narration: 'The entry gallery creates an immediate sense of arrival, with natural light washing down the floating travertine staircase.'
      },
      {
        id: 'stop-3-living',
        title: 'Double-Height Living Salon',
        description: 'Marvel at 6.2-meter soaring ceiling height and seamless floor-to-ceiling glass looking out to the infinity pool.',
        floorId: 'floor-ground',
        roomId: 'room-living',
        cameraPosition: { x: -3.5, y: 1.8, z: 2.0 },
        cameraTarget: { x: 0, y: 1.8, z: -4.0 },
        narration: 'The central salon serves as the gravitational core of the home, framing the pool and gardens as living artwork.'
      },
      {
        id: 'stop-4-kitchen',
        title: 'Chef’s Gourmet Kitchen',
        description: 'Discover the 4.2m bookmatched Calacatta marble island with integrated concealed luxury appliances.',
        floorId: 'floor-ground',
        roomId: 'room-kitchen',
        cameraPosition: { x: 4.5, y: 1.8, z: -2.5 },
        cameraTarget: { x: 1.5, y: 1.5, z: -4.2 },
        narration: 'Engineered for both intimate morning coffee and private catered galas, featuring German precision appliances.'
      },
      {
        id: 'stop-5-upper-bridge',
        title: 'Upper Gallery Bridge',
        description: 'Cross the suspended bridge overlooking the salon and gaze through the upper glass clerestory.',
        floorId: 'floor-upper',
        roomId: 'room-upper-hall',
        cameraPosition: { x: 0, y: 5.3, z: 1.0 },
        cameraTarget: { x: 0, y: 2.8, z: -3.0 },
        narration: 'Floating above the salon, this bridge connects the master sanctuary to the guest wings with uninterrupted spatial rhythm.'
      },
      {
        id: 'stop-6-master',
        title: 'Master Penthouse Suite',
        description: 'Relax in the master retreat with private cantilevered glass balcony overlooking the hills.',
        floorId: 'floor-upper',
        roomId: 'room-master',
        cameraPosition: { x: -3.2, y: 5.3, z: -3.5 },
        cameraTarget: { x: -1.0, y: 5.1, z: -6.5 },
        narration: 'Complete serenity. Floor-to-ceiling sliding glass opens directly to the elevated terrace with evening city lights.'
      },
      {
        id: 'stop-7-pool-terrace',
        title: 'Poolside Lounge & Evening Sunset',
        description: 'Complete the journey on the poolside terrace with sunken firepit and infinity water reflection.',
        floorId: 'floor-ground',
        cameraPosition: { x: 0, y: 2.2, z: -14 },
        cameraTarget: { x: 0, y: 2.5, z: -2 },
        narration: 'Outdoor living perfected: seamless limestone transitions, an infinity edge dropping into nature, and architectural illumination.'
      }
    ],
    agent: {
      id: 'agent-elena-vance',
      name: 'Elena Vance',
      title: 'Principal Architectural Partner',
      company: 'AURA Private Client Advisory',
      phone: '+1 (310) 849-2201',
      email: 'e.vance@aura-estates.com',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      experienceYears: 14,
      propertiesListed: 38,
      rating: 4.98,
      licenseNumber: 'DRE #01948821'
    },
    nearbyPlaces: [
      { category: 'education', name: 'The Mirman School for Gifted Minds', distance: '1.2 km', walkTime: '14 min' },
      { category: 'transit', name: 'Bel Air Helipad & Executive Transport', distance: '3.8 km', walkTime: '5 min drive' },
      { category: 'dining', name: 'Spago Beverly Hills (2-Star Michelin)', distance: '4.5 km', walkTime: '8 min drive' },
      { category: 'wellness', name: 'Bel-Air Country Club & Spa', distance: '2.1 km', walkTime: '22 min' },
      { category: 'nature', name: 'Franklin Canyon Nature Reserve', distance: '2.8 km', walkTime: '30 min' }
    ],
    featured: true,
    viewCount: 1420
  },
  {
    id: 'prop-villa-solaria',
    slug: 'villa-solaria',
    name: 'Villa Lumina Azure',
    tagline: 'Mediterranean Cliffside Sanctuary with Horizon Lap Pool & Internal Olive Courtyard',
    location: {
      address: '18 Chemin de la Calanque',
      neighborhood: 'Cap d’Antibes',
      city: 'Cannes / Antibes',
      country: 'France',
      coordinates: { lat: 43.5528, lng: 7.1278 }
    },
    price: 12800000,
    currency: 'EUR',
    propertyType: 'villa',
    bedrooms: 5,
    bathrooms: 6,
    totalAreaSqm: 680,
    lotSizeSqm: 2800,
    yearBuilt: 2024,
    architect: 'Studio Jean Nouvel Collaborator',
    energyRating: 'A',
    features: [
      '25m Heated Mineral Lap Pool',
      'Central Courtyard with Century-Old Olive Tree',
      'Sunken Outdoor Fire Lounge',
      'Temperature-Controlled 600-Bottle Wine Cave',
      'Private Direct Sea Access Pathway',
      'Separate Two-Bedroom Guest Pavilion'
    ],
    description:
      'Perched atop the rugged limestone cliffs of Cap d’Antibes, Villa Lumina Azure marries pristine white concrete colonnades with warm French oak and azure infinity water. A continuous single-level layout maximizes light and breezes, framing Mediterranean horizons through monumental frameless glass panels.',
    highlights: [
      {
        icon: 'Maximize2',
        title: '680 m² Estate Floorplate',
        description: 'Single-story pavilion design surrounding an ancient olive courtyard.'
      },
      {
        icon: 'Waves',
        title: '25-Meter Heated Lap Pool',
        description: 'Disappearing infinity edge cascading into coastal greenery.'
      },
      {
        icon: 'Sun',
        title: 'Riviera Microclimate',
        description: 'Thermal mass construction retaining cool breezes during Mediterranean summers.'
      }
    ],
    images: {
      hero: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1600&q=85',
      exterior: [
        'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
      ],
      interior: [
        'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80'
      ],
      plans: [
        'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    has3D: true,
    hasVR: true,
    hasAR: true,
    floors: [
      {
        id: 'floor-main-villa',
        level: 0,
        label: 'Pavilion Level',
        elevation: 0,
        rooms: [
          {
            id: 'room-villa-living',
            name: 'Sunken Sea Lounge',
            floorId: 'floor-main-villa',
            areaSqm: 82,
            dimensions: '12.0m × 7.0m',
            cameraPosition: { x: -2.0, y: 1.7, z: 2.0 },
            cameraTarget: { x: 0, y: 1.4, z: -4.0 },
            description: 'Sunken seating area clad in white textured plaster with 180-degree ocean views and floor-recessed hearth.',
            features: ['Sunken Lounge Pit', 'Seamless Teak Ceiling', 'Retractable Glass Facade', 'Frameless Horizon Panorama']
          },
          {
            id: 'room-villa-dining',
            name: 'Terrace Dining Colonnade',
            floorId: 'floor-main-villa',
            areaSqm: 45,
            dimensions: '7.5m × 6.0m',
            cameraPosition: { x: 3.0, y: 1.7, z: 1.0 },
            cameraTarget: { x: 3.5, y: 1.5, z: -3.0 },
            description: 'Semi-alfresco dining pergola sheltered by motorized limestone louvers, seating up to 14 guests.',
            features: ['Outdoor Teppanyaki Grill', 'Pergola Louver System', 'Stone Dining Table for 14']
          },
          {
            id: 'room-villa-master',
            name: 'Ocean Master Suite',
            floorId: 'floor-main-villa',
            areaSqm: 60,
            dimensions: '9.0m × 6.8m',
            cameraPosition: { x: -6.0, y: 1.7, z: -2.0 },
            cameraTarget: { x: -4.0, y: 1.5, z: -5.0 },
            description: 'Direct step-out access to the infinity pool deck, open marble wet-room, and private outdoor rain shower.',
            features: ['Step-Out Pool Access', 'Outdoor Rain Shower', 'Freestanding Marble Tub']
          }
        ]
      }
    ],
    guidedTour: [
      {
        id: 'tour-villa-1',
        title: 'Cliffside Perspective',
        description: 'View the horizontal cantilever floating above Mediterranean waters.',
        floorId: 'floor-main-villa',
        cameraPosition: { x: 14, y: 6, z: 14 },
        cameraTarget: { x: 0, y: 1.5, z: 0 },
        narration: 'Villa Lumina Azure harmonizes with the coastal geology of Cap d’Antibes.'
      },
      {
        id: 'tour-villa-2',
        title: 'Sunken Sea Lounge',
        description: 'Experience the transition between warm plaster, breeze, and infinite sea.',
        floorId: 'floor-main-villa',
        roomId: 'room-villa-living',
        cameraPosition: { x: -2.0, y: 1.7, z: 2.0 },
        cameraTarget: { x: 0, y: 1.4, z: -4.0 },
        narration: 'The sunken lounge brings the horizon directly into eye level.'
      }
    ],
    agent: {
      id: 'agent-marc-laurent',
      name: 'Marc Laurent',
      title: 'Côte d’Azur Regional Director',
      company: 'AURA Riviera Prestige',
      phone: '+33 4 93 34 52 10',
      email: 'm.laurent@aura-estates.com',
      avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
      experienceYears: 19,
      propertiesListed: 42,
      rating: 4.96,
      licenseNumber: 'CPI 0605 2018'
    },
    nearbyPlaces: [
      { category: 'transit', name: 'Nice Côte d’Azur International Airport', distance: '18 km', walkTime: '20 min drive' },
      { category: 'dining', name: 'Eden-Roc Restaurant (Hotel du Cap)', distance: '1.4 km', walkTime: '15 min walk' },
      { category: 'wellness', name: 'Cap d’Antibes Yacht Club', distance: '800 m', walkTime: '9 min walk' }
    ],
    featured: true,
    viewCount: 980
  },
  {
    id: 'prop-sky-residence',
    slug: 'sky-residence',
    name: 'The Sky Sanctuary Penthouse',
    tagline: 'Double-Height Glass Spire Duplex with Private Sky Terrace & 360° Urban Skyline',
    location: {
      address: '432 Park Avenue Tier 72',
      neighborhood: 'Manhattan Midtown East',
      city: 'New York',
      country: 'United States',
      coordinates: { lat: 40.7615, lng: -73.9713 }
    },
    price: 16500000,
    currency: 'USD',
    propertyType: 'penthouse',
    bedrooms: 3,
    bathrooms: 3.5,
    totalAreaSqm: 420,
    yearBuilt: 2025,
    architect: 'Rafael Viñoly Studio',
    energyRating: 'A+',
    features: [
      '72nd Floor Panoramic Corner Glazing',
      'Private High-Speed Key-Coded Elevator Vestibule',
      'Double-Height 7.5m Great Room',
      'Custom Boffi Monolith Kitchen in Calacatta Gold',
      'Private Heated Open Sky Loggia Terrace',
      '24/7 White-Glove Concierge & Valet Service'
    ],
    description:
      'Hovering 800 feet above Manhattan, The Sky Sanctuary Penthouse provides an unrivaled aerie overlooking Central Park and the East River. Minimalist architectural concrete is counterbalanced with French herringbone white oak and brushed champagne bronze structural details.',
    highlights: [
      {
        icon: 'Maximize2',
        title: '420 m² Duplex Living',
        description: 'Upper mezzanine loft gallery overlooking double-height city panorama.'
      },
      {
        icon: 'Sun',
        title: '360-Degree Manhattan Views',
        description: 'Floor-to-ceiling 3-meter square portrait windows on four exposures.'
      },
      {
        icon: 'Shield',
        title: 'Acoustic Triple Glazing',
        description: 'Zero city decibel penetration with hospital-grade filtered air circulation.'
      }
    ],
    images: {
      hero: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1600&q=85',
      exterior: [
        'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'
      ],
      interior: [
        'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
      ],
      plans: [
        'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    has3D: true,
    hasVR: true,
    hasAR: true,
    floors: [
      {
        id: 'floor-sky-72',
        level: 72,
        label: 'Level 72 (Great Room)',
        elevation: 0,
        rooms: [
          {
            id: 'room-sky-great',
            name: 'Double-Height Great Room',
            floorId: 'floor-sky-72',
            areaSqm: 110,
            dimensions: '14.0m × 8.0m',
            cameraPosition: { x: 0, y: 1.8, z: 4.5 },
            cameraTarget: { x: 0, y: 2.2, z: -5.0 },
            description: 'Towering volume with 7.5m ceilings and frameless 3m square portrait windows framing Central Park.',
            features: ['7.5m Ceiling Height', 'Herringbone French White Oak', 'Central Park North Views', 'Suspended Minimalist Chandelier']
          },
          {
            id: 'room-sky-kitchen',
            name: 'Boffi Monolith Kitchen',
            floorId: 'floor-sky-72',
            areaSqm: 38,
            dimensions: '6.5m × 5.8m',
            cameraPosition: { x: 4.5, y: 1.8, z: -2.0 },
            cameraTarget: { x: 2.0, y: 1.5, z: -3.5 },
            description: 'Custom Boffi cabinetry in fluted smoked eucalyptus with Calacatta Gold monolithic work surfaces.',
            features: ['Gaggenau 400 Series', 'Integrated Sub-Zero Wine Column', 'Fluted Smoked Eucalyptus']
          }
        ]
      },
      {
        id: 'floor-sky-73',
        level: 73,
        label: 'Level 73 (Mezzanine)',
        elevation: 4.0,
        rooms: [
          {
            id: 'room-sky-master',
            name: 'Cloud Master Suite',
            floorId: 'floor-sky-73',
            areaSqm: 65,
            dimensions: '10.0m × 6.5m',
            cameraPosition: { x: -8.3, y: 5.7, z: 4.6 },
            cameraTarget: { x: -6.2, y: 5.4, z: 5.3 },
            description: 'Private upper-level suite with a dressed king bed, dual vanity, soaking tub and park-facing corner glass.',
            features: ['Corner Skyline Views', 'Motorized Blackout Shades', 'Dressing Room with Backlit Mirrors']
          },
          {
            id: 'room-sky-bed-2',
            name: 'East Guest Suite',
            floorId: 'floor-sky-73',
            areaSqm: 32,
            dimensions: '6.0m x 5.2m',
            cameraPosition: { x: 5.0, y: 5.7, z: 2.8 },
            cameraTarget: { x: 6.1, y: 5.35, z: 2.9 },
            description: 'Guest bedroom with a queen platform bed, built-in storage and floor-to-ceiling city glazing.',
            features: ['Queen Platform Bed', 'Built-In Wardrobe', 'Acoustic Glazing']
          },
          {
            id: 'room-sky-bed-3',
            name: 'South Guest Suite',
            floorId: 'floor-sky-73',
            areaSqm: 31,
            dimensions: '6.0m x 5.0m',
            cameraPosition: { x: 5.0, y: 5.7, z: 6.3 },
            cameraTarget: { x: 6.1, y: 5.35, z: 6.25 },
            description: 'Quiet upper guest room with layered linen bedding and a private bath.',
            features: ['Queen Platform Bed', 'Private Ensuite', 'Motorized Shades']
          }
        ]
      }
    ],
    guidedTour: [
      {
        id: 'tour-sky-1',
        title: 'Elevator Arrival',
        description: 'Step directly from the private key-coded elevator into the soaring 7.5m Great Room.',
        floorId: 'floor-sky-72',
        cameraPosition: { x: 0, y: 1.8, z: 6.0 },
        cameraTarget: { x: 0, y: 2.5, z: -4.0 },
        narration: 'Floating 800 feet over Manhattan, this duplex penthouse commands the skyline.'
      },
      {
        id: 'tour-sky-2',
        title: 'Great Room Park Panorama',
        description: 'Unfiltered daylight and cloudscapes frame the entirety of Central Park.',
        floorId: 'floor-sky-72',
        roomId: 'room-sky-great',
        cameraPosition: { x: -3.0, y: 1.8, z: 2.0 },
        cameraTarget: { x: 0, y: 2.2, z: -5.0 },
        narration: '3-meter square picture windows create monumental framed portraits of the city below.'
      }
    ],
    agent: {
      id: 'agent-alexander-wright',
      name: 'Alexander Wright',
      title: 'Senior Managing Director, Ultra-Prime',
      company: 'AURA Manhattan Advisory',
      phone: '+1 (212) 694-8830',
      email: 'a.wright@aura-estates.com',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      experienceYears: 16,
      propertiesListed: 29,
      rating: 4.99,
      licenseNumber: 'NY-RE #1040129'
    },
    nearbyPlaces: [
      { category: 'nature', name: 'Central Park (South Entrance)', distance: '400 m', walkTime: '5 min walk' },
      { category: 'dining', name: 'Le Bernardin (3-Star Michelin)', distance: '900 m', walkTime: '11 min walk' },
      { category: 'transit', name: '59th St / Columbus Circle Transit Hub', distance: '600 m', walkTime: '7 min walk' }
    ],
    featured: true,
    viewCount: 1640
  }
];
