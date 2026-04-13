export type VehicleMode = 'assembled' | 'exploded' | 'internal'

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
  category: string
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
