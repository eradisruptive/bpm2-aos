export type VehicleMode = 'assembled' | 'exploded' | 'internal'

export type VehicleSectionId = 'exterior' | 'interior' | 'systems'

export type VehicleGroupId =
  | 'armor-structure'
  | 'weapons-external'
  | 'mobility'
  | 'external-devices'
  | 'utility-equipment'
  | 'crew-positions'
  | 'troop-compartment'
  | 'controls'
  | 'observation-aiming'
  | 'communication'
  | 'life-support'
  | 'ammunition'
  | 'engine'
  | 'transmission'
  | 'fuel-system'
  | 'electrical-system'
  | 'weapon-systems'
  | 'protection-systems'
  | 'amphibious-system'

export interface VehicleSection {
  id: VehicleSectionId
  name: string
  description: string
}

export interface VehicleGroup {
  id: VehicleGroupId
  sectionId: VehicleSectionId
  name: string
  description: string
}

export type PartVisibility = 'external' | 'internal' | 'structure'
export type PrimitiveShape = 'box' | 'cylinder'

export interface PartGeometry {
  shape: PrimitiveShape
  size: [number, number, number]
  rotation?: [number, number, number]
}

export interface PartImage {
  id: string
  title: string
  caption: string
}

export interface TechnicalSpecification {
  label: string
  value: string
}

export interface VehiclePart {
  id: string
  name: string
  sectionId: VehicleSectionId
  groupId: VehicleGroupId
  draggable: boolean
  visibility: PartVisibility
  description: string
  functionalRole: string
  location: string
  specs: string[]
  technicalSpecifications: TechnicalSpecification[]
  lecturePoints: string[]
  placeholderImages: PartImage[]
  geometry: PartGeometry
  color: string
  basePosition: [number, number, number]
  explodeDirection: [number, number, number]
  cameraOffset?: [number, number, number]
}

export interface VehicleHierarchyGroup {
  group: VehicleGroup
  elements: VehiclePart[]
}

export interface VehicleHierarchySection {
  section: VehicleSection
  groups: VehicleHierarchyGroup[]
}

export interface TrainingStep {
  id: string
  title: string
  description: string
  partId: string
  recommendedMode: VehicleMode
}

export interface QuizQuestion {
  id: string
  type: 'single' | 'multiple'
  question: string
  options: string[]
  correctAnswers: number[]
  explanation?: string
  partId?: string
}
