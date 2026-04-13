import type { QuizQuestion } from '../types/bmp2'
import { bmp2Parts } from './bmp2Parts'

const baseOptions = ['Assembled', 'Exploded', 'Internal'] as const

function rotateList<T>(list: T[], offset: number) {
  const normalized = ((offset % list.length) + list.length) % list.length
  return [...list.slice(normalized), ...list.slice(0, normalized)]
}

function buildChoiceSet(source: string[], correct: string, seed: number, size = 4) {
  const unique = Array.from(new Set(source.filter((item) => item !== correct)))
  const rotated = rotateList(unique, seed)
  const wrong = rotated.slice(0, Math.max(0, size - 1))
  const options = [...wrong, correct]
  const finalOptions = rotateList(options, seed + 1)
  return {
    options: finalOptions,
    correctAnswers: [finalOptions.indexOf(correct)],
  }
}

function buildMultiSet(correct: string[], pool: string[], seed: number, optionCount = 5) {
  const uniquePool = Array.from(new Set(pool.filter((item) => !correct.includes(item))))
  const wrong = rotateList(uniquePool, seed).slice(0, Math.max(0, optionCount - correct.length))
  const options = rotateList([...correct, ...wrong], seed + 2)
  const correctAnswers = correct.map((answer) => options.indexOf(answer)).sort((a, b) => a - b)
  return { options, correctAnswers }
}

const locationPool = bmp2Parts.map((part) => part.location)
const categoryPool = bmp2Parts.map((part) => part.category)
const rolePool = bmp2Parts.map((part) => part.functionalRole)
const allSpecs = bmp2Parts.flatMap((part) => part.specs)
const allLecturePoints = bmp2Parts.flatMap((part) => part.lecturePoints)
const allNames = bmp2Parts.map((part) => part.name)
const allTechnicalSpecs = bmp2Parts.flatMap((part) =>
  part.technicalSpecifications.map((spec) => `${spec.label}: ${spec.value}`),
)

function modeForPart(visibility: string) {
  if (visibility === 'internal') return 'Internal'
  if (visibility === 'external') return 'Exploded'
  return 'Assembled'
}

function relatedParts(partId: string) {
  const current = bmp2Parts.find((part) => part.id === partId)
  if (!current) return bmp2Parts

  return bmp2Parts.filter((candidate) => candidate.id !== partId && candidate.category === current.category)
}

export const testQuestions: QuizQuestion[] = bmp2Parts.flatMap((part, index) => {
  const partRelated = relatedParts(part.id)
  const partner = partRelated[0] ?? bmp2Parts[(index + 1) % bmp2Parts.length]
  const specChoices = buildMultiSet(part.specs.slice(0, 2), allSpecs, index, 5)
  const lectureChoices = buildMultiSet(part.lecturePoints.slice(0, 2), allLecturePoints, index + 1, 5)
  const technicalLabels = part.technicalSpecifications.map((item) => `${item.label}: ${item.value}`)
  const techChoices = buildMultiSet(technicalLabels.slice(0, 2), allTechnicalSpecs, index + 2, 5)
  const roleChoices = buildChoiceSet(rolePool, part.functionalRole, index)
  const locationChoices = buildChoiceSet(locationPool, part.location, index + 3)
  const categoryChoices = buildChoiceSet(categoryPool, part.category, index + 4)
  const nameChoices = buildChoiceSet(allNames, part.name, index + 5)
  const modeChoices = buildChoiceSet([...baseOptions], modeForPart(part.visibility), index + 6, 3)
  const partnerChoices = buildChoiceSet(allNames, partner.name, index + 7)
  const visualCueChoices = buildMultiSet([part.location, part.specs[0]], [...locationPool, ...allSpecs], index + 8, 5)
  const roleLocationChoices = buildMultiSet([part.functionalRole, part.location], [...rolePool, ...locationPool], index + 9, 5)

  return [
    {
      id: `${part.id}-q1`,
      type: 'single',
      partId: part.id,
      question: `Which BMP-2 component matches this description: ${part.description}`,
      options: nameChoices.options,
      correctAnswers: nameChoices.correctAnswers,
      explanation: `${part.name} is identified by its location and role inside the BMP-2 training model.`,
    },
    {
      id: `${part.id}-q2`,
      type: 'single',
      partId: part.id,
      question: `Where is the ${part.name} primarily located?`,
      options: locationChoices.options,
      correctAnswers: locationChoices.correctAnswers,
      explanation: `${part.name} is studied in the ${part.location}.`,
    },
    {
      id: `${part.id}-q3`,
      type: 'single',
      partId: part.id,
      question: `What is the main functional role of the ${part.name}?`,
      options: roleChoices.options,
      correctAnswers: roleChoices.correctAnswers,
      explanation: part.functionalRole,
    },
    {
      id: `${part.id}-q4`,
      type: 'multiple',
      partId: part.id,
      question: `Select the statements that correctly describe the ${part.name}.`,
      options: specChoices.options,
      correctAnswers: specChoices.correctAnswers,
      explanation: `The correct statements are drawn from the core study notes for ${part.name}.`,
    },
    {
      id: `${part.id}-q5`,
      type: 'single',
      partId: part.id,
      question: `Which viewing mode is most appropriate when introducing the ${part.name}?`,
      options: modeChoices.options,
      correctAnswers: modeChoices.correctAnswers,
      explanation: `${part.name} is most naturally introduced in ${modeForPart(part.visibility)} mode based on visibility and layout.`,
    },
    {
      id: `${part.id}-q6`,
      type: 'single',
      partId: part.id,
      question: `To which category does the ${part.name} belong?`,
      options: categoryChoices.options,
      correctAnswers: categoryChoices.correctAnswers,
      explanation: `${part.name} belongs to the ${part.category} category.`,
    },
    {
      id: `${part.id}-q7`,
      type: 'multiple',
      partId: part.id,
      question: `Which lecture points should be associated with the ${part.name}?`,
      options: lectureChoices.options,
      correctAnswers: lectureChoices.correctAnswers,
      explanation: `These lecture points help explain how ${part.name} is taught in theory sessions.`,
    },
    {
      id: `${part.id}-q8`,
      type: 'single',
      partId: part.id,
      question: `Which component would most naturally be studied alongside the ${part.name}?`,
      options: partnerChoices.options,
      correctAnswers: partnerChoices.correctAnswers,
      explanation: `${partner.name} shares a close category or subsystem relationship with ${part.name}.`,
    },
    {
      id: `${part.id}-q9`,
      type: 'multiple',
      partId: part.id,
      question: `Which technical specification entries belong to the ${part.name}?`,
      options: techChoices.options,
      correctAnswers: techChoices.correctAnswers,
      explanation: `These are the technical specification lines attached to ${part.name}.`,
    },
    {
      id: `${part.id}-q10`,
      type: 'single',
      partId: part.id,
      question: `Which component name should you choose if you want to inspect ${part.functionalRole.toLowerCase()}?`,
      options: nameChoices.options,
      correctAnswers: nameChoices.correctAnswers,
      explanation: `${part.name} is the subsystem responsible for that role.`,
    },
    {
      id: `${part.id}-q11`,
      type: 'single',
      partId: part.id,
      question: `During a lecture on ${part.category.toLowerCase()}, which BMP-2 element is the best match?`,
      options: nameChoices.options,
      correctAnswers: nameChoices.correctAnswers,
      explanation: `${part.name} is one of the key ${part.category.toLowerCase()} study items.`,
    },
    {
      id: `${part.id}-q12`,
      type: 'multiple',
      partId: part.id,
      question: `Select the cues that would help a trainee visually identify the ${part.name}.`,
      options: visualCueChoices.options,
      correctAnswers: visualCueChoices.correctAnswers,
      explanation: `Location and signature features make ${part.name} easier to identify in the simulator.`,
    },
    {
      id: `${part.id}-q13`,
      type: 'single',
      partId: part.id,
      question: `Which answer best describes the instructional purpose of the ${part.name}?`,
      options: roleChoices.options,
      correctAnswers: roleChoices.correctAnswers,
      explanation: `This question checks whether the trainee understands the function of ${part.name}.`,
    },
    {
      id: `${part.id}-q14`,
      type: 'single',
      partId: part.id,
      question: `If a trainee opens the lecture page for ${part.name}, what major role should they expect to study?`,
      options: roleChoices.options,
      correctAnswers: roleChoices.correctAnswers,
      explanation: part.functionalRole,
    },
    {
      id: `${part.id}-q15`,
      type: 'single',
      partId: part.id,
      question: `Which location clue corresponds to the ${part.name}?`,
      options: locationChoices.options,
      correctAnswers: locationChoices.correctAnswers,
      explanation: `${part.name} is associated with ${part.location}.`,
    },
    {
      id: `${part.id}-q16`,
      type: 'multiple',
      partId: part.id,
      question: `Select the study notes that belong to the ${part.name} lecture page.`,
      options: specChoices.options,
      correctAnswers: specChoices.correctAnswers,
      explanation: `${part.name} includes these notes as part of its lecture summary.`,
    },
    {
      id: `${part.id}-q17`,
      type: 'single',
      partId: part.id,
      question: `Which subsystem is most closely tied to the ${part.name} in the current training dataset?`,
      options: partnerChoices.options,
      correctAnswers: partnerChoices.correctAnswers,
      explanation: `${partner.name} is the closest linked study item for ${part.name}.`,
    },
    {
      id: `${part.id}-q18`,
      type: 'multiple',
      partId: part.id,
      question: `Which two pieces of information are valid technical or functional identifiers for the ${part.name}?`,
      options: techChoices.options,
      correctAnswers: techChoices.correctAnswers,
      explanation: `These entries define the technical identity of ${part.name}.`,
    },
    {
      id: `${part.id}-q19`,
      type: 'single',
      partId: part.id,
      question: `Which vehicle mode change would most likely help reveal the ${part.name} for study?`,
      options: modeChoices.options,
      correctAnswers: modeChoices.correctAnswers,
      explanation: `The best study mode for ${part.name} is ${modeForPart(part.visibility)}.`,
    },
    {
      id: `${part.id}-q20`,
      type: 'multiple',
      partId: part.id,
      question: `Choose the correct statements about the ${part.name} role and placement.`,
      options: roleLocationChoices.options,
      correctAnswers: roleLocationChoices.correctAnswers,
      explanation: `This combines role and placement knowledge for ${part.name}.`,
    },
  ]
})

export function pickRandomQuestions(questionCount: number) {
  const shuffled = [...testQuestions].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, questionCount)
}
