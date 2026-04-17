import { useCallback, useEffect, useRef, useState } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { Plane, Vector3 } from 'three'

export type DragReleaseBehavior = 'persist' | 'snap-back'

type DragContext = {
  partId: string
  viewDepth: number
  grabOffset: Vector3
}

type UsePartDragOptions = {
  enabled: boolean
  holdDelayMs?: number
  dragReleaseBehavior?: DragReleaseBehavior
  minY?: number
  getPartMinY?: (partId: string) => number
  isPartDraggable: (partId: string) => boolean
  getPartPosition: (partId: string) => [number, number, number]
  onSelectPart: (partId: string) => void
  onUpdatePartPosition: (partId: string, position: [number, number, number]) => void
  onResetPartPosition?: (partId: string) => void
}

const DEFAULT_HOLD_DELAY_MS = 140
const DRAG_SMOOTHING_TIME_SECONDS = 0.06

export function usePartDrag({
  enabled,
  holdDelayMs = DEFAULT_HOLD_DELAY_MS,
  dragReleaseBehavior = 'persist',
  minY = 0,
  getPartMinY,
  isPartDraggable,
  getPartPosition,
  onSelectPart,
  onUpdatePartPosition,
  onResetPartPosition,
}: UsePartDragOptions) {
  const activeDragRef = useRef<DragContext | null>(null)
  const pendingDragRef = useRef<DragContext | null>(null)
  const pendingTimerRef = useRef<number | null>(null)
  const smoothedPositionRef = useRef<Vector3 | null>(null)
  const lastMoveTimestampRef = useRef<number | null>(null)
  const suppressNextClickRef = useRef(false)
  const dragPlaneRef = useRef(new Plane())
  const dragNormalRef = useRef(new Vector3())
  const dragPlanePointRef = useRef(new Vector3())
  const dragHitPointRef = useRef(new Vector3())
  const [draggingPartId, setDraggingPartId] = useState<string | null>(null)

  const clearPendingTimer = useCallback(() => {
    if (pendingTimerRef.current !== null) {
      window.clearTimeout(pendingTimerRef.current)
      pendingTimerRef.current = null
    }
  }, [])

  const cancelPendingDrag = useCallback(() => {
    clearPendingTimer()
    pendingDragRef.current = null
  }, [clearPendingTimer])

  const beginDragFromPending = useCallback(() => {
    const pending = pendingDragRef.current
    if (!pending || !enabled) return

    clearPendingTimer()
    pendingDragRef.current = null

    onSelectPart(pending.partId)
    activeDragRef.current = pending

    const partMinY = getPartMinY?.(pending.partId) ?? minY
    const [x, y, z] = getPartPosition(pending.partId)
    const clampedStart = new Vector3(x, Math.max(y, partMinY), z)
    smoothedPositionRef.current = clampedStart
    lastMoveTimestampRef.current = null
    if (clampedStart.y !== y) {
      onUpdatePartPosition(pending.partId, [clampedStart.x, clampedStart.y, clampedStart.z])
    }
    setDraggingPartId(pending.partId)
  }, [clearPendingTimer, enabled, getPartMinY, getPartPosition, minY, onSelectPart, onUpdatePartPosition])

  const finishDrag = useCallback(
    (suppressClick: boolean) => {
      const activeDrag = activeDragRef.current
      if (!activeDrag) return

      if (dragReleaseBehavior === 'snap-back' && onResetPartPosition) {
        onResetPartPosition(activeDrag.partId)
      }

      activeDragRef.current = null
      smoothedPositionRef.current = null
      lastMoveTimestampRef.current = null
      setDraggingPartId(null)

      if (suppressClick) {
        suppressNextClickRef.current = true
      }
    },
    [dragReleaseBehavior, onResetPartPosition],
  )

  const handlePartPointerDown = useCallback(
    (partId: string, event: ThreeEvent<PointerEvent>) => {
      if (!enabled || !isPartDraggable(partId)) return

      event.stopPropagation()

      const normal = new Vector3()
      event.camera.getWorldDirection(normal)
      normal.normalize()

      const [x, y, z] = getPartPosition(partId)
      const partPosition = new Vector3(x, y, z)
      const viewDepth = normal.dot(event.point) - normal.dot(event.camera.position)
      const grabOffset = partPosition.sub(event.point)

      pendingDragRef.current = { partId, viewDepth, grabOffset }
      clearPendingTimer()

      if (holdDelayMs <= 0) {
        beginDragFromPending()
        return
      }

      pendingTimerRef.current = window.setTimeout(beginDragFromPending, holdDelayMs)
    },
    [beginDragFromPending, clearPendingTimer, enabled, getPartPosition, holdDelayMs, isPartDraggable],
  )

  const handleScenePointerMove = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      const activeDrag = activeDragRef.current
      if (!activeDrag) return

      event.stopPropagation()

      const dragNormal = dragNormalRef.current
      const dragPlanePoint = dragPlanePointRef.current
      const dragHitPoint = dragHitPointRef.current
      const dragPlane = dragPlaneRef.current

      event.camera.getWorldDirection(dragNormal)
      dragNormal.normalize()
      dragPlanePoint.copy(event.camera.position).addScaledVector(dragNormal, activeDrag.viewDepth)
      dragPlane.setFromNormalAndCoplanarPoint(dragNormal, dragPlanePoint)

      const hasIntersection = event.ray.intersectPlane(dragPlane, dragHitPoint)
      if (!hasIntersection) return

      const partMinY = getPartMinY?.(activeDrag.partId) ?? minY
      const targetX = dragHitPoint.x + activeDrag.grabOffset.x
      const targetY = Math.max(dragHitPoint.y + activeDrag.grabOffset.y, partMinY)
      const targetZ = dragHitPoint.z + activeDrag.grabOffset.z

      if (!smoothedPositionRef.current) {
        smoothedPositionRef.current = new Vector3(targetX, targetY, targetZ)
      } else {
        const now = performance.now()
        const previousTimestamp = lastMoveTimestampRef.current ?? now
        const deltaSeconds = Math.max(1 / 240, Math.min((now - previousTimestamp) / 1000, 0.12))
        lastMoveTimestampRef.current = now
        const alpha = 1 - Math.exp(-deltaSeconds / DRAG_SMOOTHING_TIME_SECONDS)
        const smoothed = smoothedPositionRef.current

        smoothed.x += (targetX - smoothed.x) * alpha
        smoothed.y += (targetY - smoothed.y) * alpha
        smoothed.z += (targetZ - smoothed.z) * alpha
        smoothed.y = Math.max(smoothed.y, partMinY)
      }

      const smoothed = smoothedPositionRef.current
      onUpdatePartPosition(activeDrag.partId, [smoothed.x, smoothed.y, smoothed.z])
    },
    [getPartMinY, minY, onUpdatePartPosition],
  )

  const handleScenePointerUp = useCallback(() => {
    clearPendingTimer()

    if (activeDragRef.current) {
      finishDrag(true)
      return
    }

    pendingDragRef.current = null
  }, [clearPendingTimer, finishDrag])

  const consumeSuppressedClick = useCallback(() => {
    if (!suppressNextClickRef.current) return false
    suppressNextClickRef.current = false
    return true
  }, [])

  useEffect(() => {
    if (!enabled) return

    const handleWindowPointerUp = () => {
      clearPendingTimer()

      if (activeDragRef.current) {
        finishDrag(true)
        return
      }

      pendingDragRef.current = null
    }

    window.addEventListener('pointerup', handleWindowPointerUp)
    return () => {
      window.removeEventListener('pointerup', handleWindowPointerUp)
      cancelPendingDrag()
      activeDragRef.current = null
      smoothedPositionRef.current = null
      lastMoveTimestampRef.current = null
    }
  }, [cancelPendingDrag, clearPendingTimer, enabled, finishDrag])

  return {
    draggingPartId,
    isDragging: draggingPartId !== null,
    handlePartPointerDown,
    handleScenePointerMove,
    handleScenePointerUp,
    consumeSuppressedClick,
  }
}
