import type { TrainingStep } from '../types/bmp2'

export const trainingSteps: TrainingStep[] = [
  {
    id: 'step-1',
    title: 'Start with the protective shell',
    description: 'Review the hull layout and note how it supports the turret, engine bay, and troop compartment.',
    partId: 'hull',
    recommendedMode: 'assembled',
  },
  {
    id: 'step-2',
    title: 'Inspect the turret system',
    description: 'Shift attention to the turret to understand crew placement, traverse, and how weapons are mounted.',
    partId: 'turret',
    recommendedMode: 'assembled',
  },
  {
    id: 'step-3',
    title: 'Disassemble the main armament',
    description: 'Move into exploded view to isolate the cannon and its relation to the sights and ammunition flow.',
    partId: 'cannon',
    recommendedMode: 'exploded',
  },
  {
    id: 'step-4',
    title: 'Open the power compartment',
    description: 'Focus on the front-right engine installation and examine how the power pack is separated for service access.',
    partId: 'engine',
    recommendedMode: 'internal',
  },
  {
    id: 'step-5',
    title: 'Trace drivetrain flow',
    description: 'Inspect the transmission and then compare its position to the tracks that receive the vehicle output.',
    partId: 'transmission',
    recommendedMode: 'internal',
  },
  {
    id: 'step-6',
    title: 'Study crew and troop ergonomics',
    description: 'Move through the driver station, commander workflow, and rear infantry compartment to finish the guided overview.',
    partId: 'troop-bench',
    recommendedMode: 'internal',
  },
]
