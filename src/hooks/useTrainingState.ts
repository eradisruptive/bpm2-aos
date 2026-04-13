import { useCallback, useMemo, useState } from 'react'
import { bmp2Parts, getPartTargetPosition, partMap } from '../data/bmp2Parts'
import { trainingSteps } from '../data/trainingSteps'
import type { VehicleMode } from '../types/bmp2'

type PartPositionMap = Record<string, [number, number, number]>

export function useTrainingState(initialPartId?: string, initialMode: VehicleMode = 'assembled') {
  const [mode, setModeState] = useState<VehicleMode>(initialMode)
  const [selectedPartId, setSelectedPartId] = useState<string | null>(initialPartId ?? null)
  const [hoveredPartId, setHoveredPartId] = useState<string | null>(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [detachedPositions, setDetachedPositions] = useState<PartPositionMap>({})

  const selectedPart = selectedPartId ? partMap[selectedPartId] ?? null : null
  const hoveredPart = hoveredPartId ? partMap[hoveredPartId] ?? null : null
  const activeStep = trainingSteps[stepIndex] ?? null

  const visibleParts = useMemo(() => {
    return bmp2Parts.filter((part) => {
      if (mode === 'internal') {
        return part.visibility !== 'external'
      }

      return true
    })
  }, [mode])

  const getPartPosition = useCallback(
    (partId: string) => {
      const detached = detachedPositions[partId]
      if (detached) return detached

      const part = partMap[partId]
      return part ? getPartTargetPosition(part, mode) : [0, 0, 0]
    },
    [detachedPositions, mode],
  )

  const detachPart = useCallback(
    (partId: string) => {
      const part = partMap[partId]
      if (!part) return

      setDetachedPositions((current) => {
        if (current[partId]) return current
        return {
          ...current,
          [partId]: getPartTargetPosition(part, mode),
        }
      })
    },
    [mode],
  )

  const updatePartPosition = useCallback((partId: string, position: [number, number, number]) => {
    setDetachedPositions((current) => ({
      ...current,
      [partId]: position,
    }))
  }, [])

  const resetPartPosition = useCallback((partId: string) => {
    setDetachedPositions((current) => {
      if (!(partId in current)) return current
      const nextState = { ...current }
      delete nextState[partId]
      return nextState
    })
  }, [])

  const resetPartPositions = useCallback(() => {
    setDetachedPositions({})
  }, [])

  const setMode = useCallback((nextMode: VehicleMode) => {
    setModeState(nextMode)
  }, [])

  const selectPart = useCallback(
    (partId: string | null) => {
      setSelectedPartId(partId)
      if (partId) {
        detachPart(partId)
      }
    },
    [detachPart],
  )

  const focusStep = useCallback(
    (index: number) => {
      const nextStep = trainingSteps[index]
      if (!nextStep) return

      setStepIndex(index)
      setModeState(nextStep.recommendedMode)
      setSelectedPartId(nextStep.partId)
      setDetachedPositions((current) => {
        if (current[nextStep.partId]) return current
        return {
          ...current,
          [nextStep.partId]: getPartTargetPosition(partMap[nextStep.partId], nextStep.recommendedMode),
        }
      })
    },
    [],
  )

  const goToNextStep = useCallback(() => {
    setStepIndex((current) => {
      const nextIndex = Math.min(current + 1, trainingSteps.length - 1)
      const nextStep = trainingSteps[nextIndex]
      if (nextStep) {
        setModeState(nextStep.recommendedMode)
        setSelectedPartId(nextStep.partId)
        setDetachedPositions((positions) => {
          if (positions[nextStep.partId]) return positions
          return {
            ...positions,
            [nextStep.partId]: getPartTargetPosition(partMap[nextStep.partId], nextStep.recommendedMode),
          }
        })
      }
      return nextIndex
    })
  }, [])

  const goToPreviousStep = useCallback(() => {
    setStepIndex((current) => {
      const nextIndex = Math.max(current - 1, 0)
      const nextStep = trainingSteps[nextIndex]
      if (nextStep) {
        setModeState(nextStep.recommendedMode)
        setSelectedPartId(nextStep.partId)
        setDetachedPositions((positions) => {
          if (positions[nextStep.partId]) return positions
          return {
            ...positions,
            [nextStep.partId]: getPartTargetPosition(partMap[nextStep.partId], nextStep.recommendedMode),
          }
        })
      }
      return nextIndex
    })
  }, [])

  const resetSelection = useCallback(() => {
    setSelectedPartId(null)
    setHoveredPartId(null)
  }, [])

  return {
    mode,
    setMode,
    selectedPartId,
    selectedPart,
    selectPart,
    hoveredPartId,
    hoveredPart,
    setHoveredPartId,
    visibleParts,
    stepIndex,
    activeStep,
    focusStep,
    goToNextStep,
    goToPreviousStep,
    resetSelection,
    detachedPositions,
    detachedPartCount: Object.keys(detachedPositions).length,
    getPartPosition,
    detachPart,
    updatePartPosition,
    resetPartPosition,
    resetPartPositions,
    trainingSteps,
    allParts: bmp2Parts,
  }
}
