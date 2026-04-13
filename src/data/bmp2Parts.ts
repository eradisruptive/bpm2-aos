import type { VehicleMode } from '../types/bmp2'
import type { VehiclePart } from '../types/bmp2'

function createPlaceholders(name: string) {
  return [
    {
      id: `${name}-study`,
      title: 'Training plate',
      caption: `Placeholder image for ${name}: front and side study reference.`,
    },
    {
      id: `${name}-maintenance`,
      title: 'Maintenance cutaway',
      caption: `Placeholder image for ${name}: service access and crew interaction concept.`,
    },
  ]
}

export const bmp2Parts: VehiclePart[] = [
  {
    id: 'hull',
    name: 'Hull and Frontal Armor',
    category: 'Structure',
    visibility: 'structure',
    description:
      'The welded steel hull protects the crew and infantry squad, carries the running gear, and provides the base platform for the turret and internal systems.',
    functionalRole:
      'Acts as the structural backbone of the BMP-2, combining protection, buoyancy support, and mounting points for combat and mobility subsystems.',
    location: 'Vehicle exterior, center mass',
    specs: ['Primary load-bearing structure', 'Low-profile armor envelope', 'Supports front transmission layout'],
    technicalSpecifications: [
      { label: 'Construction', value: 'Welded steel armored body' },
      { label: 'Training focus', value: 'Protection layout and subsystem placement' },
      { label: 'Study mode', value: 'Assembled and internal' },
    ],
    lecturePoints: [
      'Use the hull to explain how vehicle survivability and compact profile are balanced.',
      'Highlight how the hull separates the engine bay, fighting compartment, and troop area.',
      'Relate the hull shape to amphibious and cross-country operating requirements.',
    ],
    placeholderImages: createPlaceholders('hull'),
    geometry: { shape: 'box', size: [6.8, 1.6, 3.2] },
    color: '#5d6b4f',
    basePosition: [0, 1.1, 0],
    explodeDirection: [0, -0.25, 0],
    cameraOffset: [7, 4, 8],
  },
  {
    id: 'turret',
    name: 'Two-Man Turret',
    category: 'Weapon System',
    visibility: 'structure',
    description:
      'The compact turret mounts the main gun, commander and gunner optics, and allows rapid all-round engagement while keeping the crew protected.',
    functionalRole:
      'Provides protected weapon control, target observation, and rapid traverse for the commander and gunner during combat engagement.',
    location: 'Upper center hull',
    specs: ['Commander and gunner stations', '360 degree traverse', 'Supports cannon and ATGM equipment'],
    technicalSpecifications: [
      { label: 'Crew occupancy', value: 'Commander and gunner' },
      { label: 'Motion', value: 'Full traverse with elevated weapon mount' },
      { label: 'Study mode', value: 'Assembled and exploded' },
    ],
    lecturePoints: [
      'Explain turret placement as a compromise between silhouette and combat effectiveness.',
      'Use the turret to introduce crew responsibilities during target detection and firing.',
      'Connect the turret basket area with ammunition and optical subsystems.',
    ],
    placeholderImages: createPlaceholders('turret'),
    geometry: { shape: 'cylinder', size: [1.15, 1.4, 16] },
    color: '#707d5f',
    basePosition: [0.2, 2.15, -0.1],
    explodeDirection: [0, 1.2, 0],
    cameraOffset: [5, 3, 5],
  },
  {
    id: 'cannon',
    name: '30 mm 2A42 Autocannon',
    category: 'Weapon System',
    visibility: 'external',
    description:
      'The 30 mm cannon is the BMP-2 primary armament, capable of engaging light armor, infantry positions, and low-flying aerial targets.',
    functionalRole:
      'Serves as the primary direct-fire weapon for engaging personnel, light vehicles, and battlefield targets across a broad elevation envelope.',
    location: 'Turret front',
    specs: ['Dual-feed automatic cannon', 'High elevation range', 'Coaxial mounting with secondary systems'],
    technicalSpecifications: [
      { label: 'Weapon class', value: '30 mm automatic cannon' },
      { label: 'Mounting', value: 'Turret frontal trunnion mount' },
      { label: 'Study mode', value: 'Exploded and assembled' },
    ],
    lecturePoints: [
      'Use the cannon to discuss target sets and weapon employment doctrine.',
      'Show how the cannon aligns with sights, ammunition feed, and turret control.',
      'Emphasize why elevation and stabilization matter for the BMP-2 combat role.',
    ],
    placeholderImages: createPlaceholders('cannon'),
    geometry: {
      shape: 'cylinder',
      size: [0.11, 4.8, 18],
      rotation: [0, 0, Math.PI / 2],
    },
    color: '#40453d',
    basePosition: [2.65, 2.22, 0.05],
    explodeDirection: [1.7, 0.25, 0],
    cameraOffset: [4, 2, 2],
  },
  {
    id: 'tracks',
    name: 'Track Assemblies',
    category: 'Mobility',
    visibility: 'external',
    description:
      'Twin tracked running gear gives the BMP-2 cross-country mobility, trench crossing ability, and amphibious movement support.',
    functionalRole:
      'Transfers drivetrain output into traction and flotation-friendly mobility across rough terrain, soft ground, and obstacle-rich routes.',
    location: 'Left and right lower hull',
    specs: ['Distributed contact pressure', 'Supports rough terrain mobility', 'Integrated with road wheels and suspension'],
    technicalSpecifications: [
      { label: 'Arrangement', value: 'Dual track runs along lower hull sides' },
      { label: 'Purpose', value: 'Traction, steering support, obstacle crossing' },
      { label: 'Study mode', value: 'Assembled and exploded' },
    ],
    lecturePoints: [
      'Use the tracks to connect mobility theory with ground pressure and terrain handling.',
      'Discuss how track assemblies interact with transmission output and suspension behavior.',
      'Relate track maintenance to readiness and field reliability.',
    ],
    placeholderImages: createPlaceholders('tracks'),
    geometry: { shape: 'box', size: [7.2, 0.85, 4.2] },
    color: '#2f342d',
    basePosition: [0, 0.5, 0],
    explodeDirection: [0, -0.9, 0],
    cameraOffset: [8, 3, 8],
  },
  {
    id: 'engine',
    name: 'UTD-20 Diesel Engine',
    category: 'Powertrain',
    visibility: 'internal',
    description:
      'Mounted in the front-right compartment, the diesel engine powers the vehicle, drives the transmission, and supports onboard systems.',
    functionalRole:
      'Generates propulsion power for movement and supports vehicle systems through a compact front-mounted power pack arrangement.',
    location: 'Front-right engine bay',
    specs: ['Front engine layout', 'Compact power pack', 'Accessible during maintenance disassembly'],
    technicalSpecifications: [
      { label: 'Powerplant type', value: 'Compact diesel engine module' },
      { label: 'Compartment', value: 'Front-right power bay' },
      { label: 'Study mode', value: 'Internal' },
    ],
    lecturePoints: [
      'Show why the BMP-2 front engine arrangement affects internal layout and survivability.',
      'Use the engine as the entry point for powertrain and maintenance instruction.',
      'Discuss crew access and service considerations around the power pack.',
    ],
    placeholderImages: createPlaceholders('engine'),
    geometry: { shape: 'box', size: [1.45, 1.1, 1.05] },
    color: '#c07f2b',
    basePosition: [1.7, 1.0, -0.8],
    explodeDirection: [1.3, 0.2, -1.2],
    cameraOffset: [3.6, 2.2, 2.8],
  },
  {
    id: 'transmission',
    name: 'Transmission Block',
    category: 'Powertrain',
    visibility: 'internal',
    description:
      'The transmission transfers engine output to the drive sprockets and is positioned forward to support compact mechanical routing.',
    functionalRole:
      'Converts and distributes engine output to the drive elements while enabling steering response and speed control for the vehicle.',
    location: 'Front-left drivetrain bay',
    specs: ['Coupled to the engine compartment', 'Drives front sprockets', 'Critical for steering and speed control'],
    technicalSpecifications: [
      { label: 'Mechanical role', value: 'Transfers torque to the running gear' },
      { label: 'Placement', value: 'Forward drivetrain section' },
      { label: 'Study mode', value: 'Internal and exploded' },
    ],
    lecturePoints: [
      'Explain how the transmission links the power pack to track movement.',
      'Use this module to discuss steering and torque path in tracked vehicles.',
      'Highlight its compact forward placement inside the BMP-2 hull.',
    ],
    placeholderImages: createPlaceholders('transmission'),
    geometry: { shape: 'box', size: [1.2, 0.85, 0.95] },
    color: '#9d6f31',
    basePosition: [1.55, 0.95, 0.95],
    explodeDirection: [1.1, 0.15, 1.25],
    cameraOffset: [3.4, 2.1, -2.4],
  },
  {
    id: 'crew-compartment',
    name: 'Driver and Commander Stations',
    category: 'Crew Systems',
    visibility: 'internal',
    description:
      'This compartment houses the driver in the front-left position and connects to the commander and gunner workflow through observation and communication systems.',
    functionalRole:
      'Provides the primary driving controls, observation access, and command coordination space for vehicle maneuver and mission execution.',
    location: 'Front-left interior',
    specs: ['Primary control position', 'Linked to periscopes and radios', 'Access point for operational drills'],
    technicalSpecifications: [
      { label: 'Occupants', value: 'Driver and adjacent command workflow' },
      { label: 'Key systems', value: 'Controls, periscopes, communications' },
      { label: 'Study mode', value: 'Internal' },
    ],
    lecturePoints: [
      'Use this area to explain crew coordination from movement to target acquisition.',
      'Show how the BMP-2 layout gives the driver a distinct forward working position.',
      'Discuss how visibility aids and communications support command flow.',
    ],
    placeholderImages: createPlaceholders('crew-compartment'),
    geometry: { shape: 'box', size: [1.5, 0.95, 1.45] },
    color: '#5a7aa1',
    basePosition: [0.9, 0.95, 0.95],
    explodeDirection: [-1.1, 0.2, 1.2],
    cameraOffset: [3.4, 2.4, -3.2],
  },
  {
    id: 'troop-bench',
    name: 'Infantry Compartment',
    category: 'Crew Systems',
    visibility: 'internal',
    description:
      'The rear compartment seats embarked infantry, provides firing-port access, and serves as the main troop transport space during mechanized movement.',
    functionalRole:
      'Carries infantry safely to the fight while supporting rapid embarkation, debarkation, and combat readiness inside the vehicle.',
    location: 'Rear interior',
    specs: ['Rear troop seating', 'Supports rapid deployment', 'Integrated with roof hatches and side ports'],
    technicalSpecifications: [
      { label: 'Primary use', value: 'Infantry transport and deployment area' },
      { label: 'Access', value: 'Rear troop space with hatch support' },
      { label: 'Study mode', value: 'Internal' },
    ],
    lecturePoints: [
      'Use the troop space to discuss mechanized infantry integration with the BMP-2.',
      'Explain how internal ergonomics affect debarkation speed and combat readiness.',
      'Connect the troop area to the wider survivability and mobility design choices.',
    ],
    placeholderImages: createPlaceholders('troop-bench'),
    geometry: { shape: 'box', size: [2.7, 0.9, 2.2] },
    color: '#466a6e',
    basePosition: [-1.25, 0.95, 0],
    explodeDirection: [-1.6, 0.1, 0],
    cameraOffset: [5.5, 2.6, 0],
  },
  {
    id: 'ammo-rack',
    name: 'Ammunition Stowage',
    category: 'Weapon Support',
    visibility: 'internal',
    description:
      'Ammunition bins and ready-use stowage support the autocannon and coaxial weapons while balancing safety, access, and crew workflow.',
    functionalRole:
      'Stores and stages ammunition so the turret crew can sustain fire while managing safety, space, and reload access.',
    location: 'Turret basket and fighting compartment',
    specs: ['Feeds weapon systems', 'Protected storage layout', 'Important for reload and safety procedures'],
    technicalSpecifications: [
      { label: 'Purpose', value: 'Ready-use and protected ammunition storage' },
      { label: 'Compartment', value: 'Fighting compartment and turret basket area' },
      { label: 'Study mode', value: 'Internal and exploded' },
    ],
    lecturePoints: [
      'Use the stowage layout to discuss reload flow and internal safety procedures.',
      'Explain how ammunition positioning affects crew workflow inside the turret area.',
      'Relate this component to the autocannon and coaxial systems.',
    ],
    placeholderImages: createPlaceholders('ammo-rack'),
    geometry: { shape: 'box', size: [1.0, 0.75, 0.85] },
    color: '#996938',
    basePosition: [-0.15, 1.15, -1.0],
    explodeDirection: [-0.8, 0.7, -1.4],
    cameraOffset: [3.4, 2.3, 3],
  },
  {
    id: 'fuel-system',
    name: 'Fuel Tanks and Feed Lines',
    category: 'Support Systems',
    visibility: 'internal',
    description:
      'Fuel storage is distributed to support endurance while keeping routing compact around the engine and troop spaces.',
    functionalRole:
      'Supplies the engine with stored fuel and distributes capacity through the vehicle while balancing endurance and internal layout constraints.',
    location: 'Side walls and rear fuel stowage areas',
    specs: ['Feeds diesel engine', 'Distributed internal storage', 'Critical during fire and evacuation drills'],
    technicalSpecifications: [
      { label: 'System role', value: 'Stores and routes fuel to the engine' },
      { label: 'Layout', value: 'Distributed tanks and connecting feed lines' },
      { label: 'Study mode', value: 'Internal' },
    ],
    lecturePoints: [
      'Discuss how distributed fuel storage affects endurance and vulnerability.',
      'Use this system to connect maintenance, fire safety, and evacuation drills.',
      'Explain the routing relationship between tanks, feed lines, and the engine bay.',
    ],
    placeholderImages: createPlaceholders('fuel-system'),
    geometry: { shape: 'box', size: [2.0, 0.55, 0.7] },
    color: '#7b5840',
    basePosition: [-0.9, 0.85, 1.15],
    explodeDirection: [-1.1, 0.15, 1.5],
    cameraOffset: [4.5, 2.1, -2.8],
  },
  {
    id: 'optics',
    name: 'Sights and Observation Devices',
    category: 'Electro-Optics',
    visibility: 'external',
    description:
      'Optical devices provide observation, target acquisition, and gunnery support for the commander and gunner in both day and limited visibility conditions.',
    functionalRole:
      'Enables observation, target acquisition, and aiming support so the crew can detect threats and accurately employ weapons.',
    location: 'Turret roof and frontal sighting cluster',
    specs: ['Observation and aiming systems', 'Supports engagement workflow', 'Mounted around the turret roof line'],
    technicalSpecifications: [
      { label: 'Primary role', value: 'Observation and target acquisition' },
      { label: 'Mounting zone', value: 'Turret roof and frontal sight cluster' },
      { label: 'Study mode', value: 'Assembled and exploded' },
    ],
    lecturePoints: [
      'Use the optics group to discuss how detection and engagement begin before firing.',
      'Connect observation devices to commander and gunner responsibilities.',
      'Explain why optical placement on the turret matters for coverage and protection.',
    ],
    placeholderImages: createPlaceholders('optics'),
    geometry: { shape: 'box', size: [0.65, 0.42, 0.5] },
    color: '#9fb9c7',
    basePosition: [0.95, 2.6, -0.55],
    explodeDirection: [0.8, 1.3, -1.1],
    cameraOffset: [3.2, 2.4, 2],
  },
]

export const partMap = Object.fromEntries(bmp2Parts.map((part) => [part.id, part]))

export function getPartTargetPosition(part: VehiclePart, mode: VehicleMode): [number, number, number] {
  if (mode === 'exploded') {
    return [
      part.basePosition[0] + part.explodeDirection[0] * 1.15,
      part.basePosition[1] + part.explodeDirection[1] * 1.15,
      part.basePosition[2] + part.explodeDirection[2] * 1.15,
    ]
  }

  if (mode === 'internal') {
    if (part.visibility === 'internal') {
      return [
        part.basePosition[0] + part.explodeDirection[0] * 0.45,
        part.basePosition[1] + part.explodeDirection[1] * 0.45,
        part.basePosition[2] + part.explodeDirection[2] * 0.45,
      ]
    }

    if (part.visibility === 'structure') {
      return [
        part.basePosition[0] + part.explodeDirection[0] * 0.1,
        part.basePosition[1] + part.explodeDirection[1] * 0.1,
        part.basePosition[2] + part.explodeDirection[2] * 0.1,
      ]
    }
  }

  return part.basePosition
}
