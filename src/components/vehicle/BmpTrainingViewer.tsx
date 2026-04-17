import { Suspense, memo, useCallback, useEffect, useMemo, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { CameraControls, ContactShadows, Environment, Grid, Html, PerspectiveCamera } from '@react-three/drei'
import type { CameraControls as CameraControlsImpl } from '@react-three/drei'
import { Euler, Matrix4 } from 'three'
import { bmp2Parts, getPartTargetPosition, partMap } from '../../data/bmp2Parts'
import { usePartDrag, type DragReleaseBehavior } from '../../hooks/usePartDrag'
import type { VehicleMode, VehiclePart } from '../../types/bmp2'
import { BmpPartObject } from './BmpPartObject'

type DetachedPositions = Record<string, [number, number, number]>
const FLOOR_Y = 0
const MAX_VISUAL_SCALE = 1.12
const FLOOR_EPSILON = 0.001

function getHalfExtents(part: VehiclePart): [number, number, number] {
  if (part.geometry.shape === 'box') {
    return [part.geometry.size[0] / 2, part.geometry.size[1] / 2, part.geometry.size[2] / 2]
  }

  // Cylinder local AABB extents (x/z radius, y half-height)
  return [part.geometry.size[0], part.geometry.size[1] / 2, part.geometry.size[0]]
}

function getWorldYHalfExtent(part: VehiclePart) {
  const [hx, hy, hz] = getHalfExtents(part)
  const rotation = part.geometry.rotation
  if (!rotation) return hy

  const matrix = new Matrix4().makeRotationFromEuler(new Euler(rotation[0], rotation[1], rotation[2], 'XYZ'))
  const elements = matrix.elements
  return Math.abs(elements[1]) * hx + Math.abs(elements[5]) * hy + Math.abs(elements[9]) * hz
}

function getPartMinCenterY(part: VehiclePart) {
  return FLOOR_Y + getWorldYHalfExtent(part) * MAX_VISUAL_SCALE + FLOOR_EPSILON
}

const partMinCenterYMap = Object.fromEntries(bmp2Parts.map((part) => [part.id, getPartMinCenterY(part)])) as Record<string, number>

function clampPartPosition(partId: string, position: [number, number, number]): [number, number, number] {
  const minCenterY = partMinCenterYMap[partId] ?? FLOOR_Y
  return [position[0], Math.max(minCenterY, position[1]), position[2]]
}

type BmpTrainingViewerProps = {
  mode: VehicleMode
  selectedPartId: string | null
  hoveredPartId: string | null
  detachedPositions?: DetachedPositions
  labelsEnabled?: boolean
  interactive?: boolean
  fullscreen?: boolean
  dragReleaseBehavior?: DragReleaseBehavior
  onSelectPart: (partId: string | null) => void
  onHoverPart: (partId: string | null) => void
  onUpdatePartPosition?: (partId: string, position: [number, number, number]) => void
  onResetPartPosition?: (partId: string) => void
  resetCameraSignal: number
}

const defaultCameraByMode: Record<VehicleMode, { position: [number, number, number]; target: [number, number, number] }> = {
  assembled: { position: [10, 5.2, 9], target: [0, 1.1, 0] },
  exploded: { position: [12, 7.2, 11], target: [0, 1.3, 0] },
  internal: { position: [8, 4.6, 7.2], target: [0, 1.1, 0] },
}

function FocusRig({
  mode,
  selectedPartId,
  detachedPositions,
  resetCameraSignal,
  controlsEnabled,
}: {
  mode: VehicleMode
  selectedPartId: string | null
  detachedPositions: DetachedPositions
  resetCameraSignal: number
  controlsEnabled: boolean
}) {
  const controlsRef = useRef<CameraControlsImpl | null>(null)

  const selectedPart = useMemo(() => (selectedPartId ? partMap[selectedPartId] ?? null : null), [selectedPartId])

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls || !controlsEnabled) return

    if (selectedPart) {
      const [tx, ty, tz] = detachedPositions[selectedPart.id] ?? getPartTargetPosition(selectedPart, mode)
      const [ox, oy, oz] = selectedPart.cameraOffset ?? [4, 2.4, 4]
      void controls.setLookAt(tx + ox, ty + oy, tz + oz, tx, ty, tz, true)
      return
    }

    const preset = defaultCameraByMode[mode]
    void controls.setLookAt(
      preset.position[0],
      preset.position[1],
      preset.position[2],
      preset.target[0],
      preset.target[1],
      preset.target[2],
      true,
    )
  }, [controlsEnabled, detachedPositions, mode, selectedPart])

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return

    const preset = defaultCameraByMode[mode]
    void controls.setLookAt(
      preset.position[0],
      preset.position[1],
      preset.position[2],
      preset.target[0],
      preset.target[1],
      preset.target[2],
      true,
    )
  }, [mode, resetCameraSignal])

  return (
    <CameraControls ref={controlsRef} makeDefault enabled={controlsEnabled} minDistance={4} maxDistance={24} smoothTime={0.8} />
  )
}

type SceneContentProps = {
  mode: VehicleMode
  selectedPartId: string | null
  hoveredPartId: string | null
  detachedPositions: DetachedPositions
  labelsEnabled: boolean
  dragEnabled: boolean
  draggingPartId: string | null
  isDragging: boolean
  onSelectPart: (partId: string) => void
  onHoverPart: (partId: string | null) => void
  onPartPointerDown: (partId: string, event: ThreeEvent<PointerEvent>) => void
  onPartPointerMove: (partId: string, event: ThreeEvent<PointerEvent>) => void
  onPartPointerUp: (partId: string, event: ThreeEvent<PointerEvent>) => void
  onBackgroundClick: () => void
  resolvePosition: (partId: string) => [number, number, number]
  resetCameraSignal: number
}

const SceneContent = memo(function SceneContent({
  mode,
  selectedPartId,
  hoveredPartId,
  detachedPositions,
  labelsEnabled,
  dragEnabled,
  draggingPartId,
  isDragging,
  onSelectPart,
  onHoverPart,
  onPartPointerDown,
  onPartPointerMove,
  onPartPointerUp,
  onBackgroundClick,
  resolvePosition,
  resetCameraSignal,
}: SceneContentProps) {
  const visibleParts = useMemo(
    () =>
      bmp2Parts.filter((part) => {
        if (mode === 'internal') {
          return part.visibility !== 'external'
        }

        return true
      }),
    [mode],
  )

  return (
    <>
      <color attach="background" args={['#0f1511']} />
      <fog attach="fog" args={['#0f1511', 15, 32]} />

      <PerspectiveCamera makeDefault position={defaultCameraByMode[mode].position} fov={42} />
      <ambientLight intensity={0.9} />
      <hemisphereLight intensity={0.82} groundColor="#20261d" color="#d8ead1" />
      <directionalLight
        castShadow
        intensity={1.75}
        position={[7, 12, 6]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <mesh
        receiveShadow
        position={[0, FLOOR_Y - 0.1, 0]}
        onClick={(event) => {
          event.stopPropagation()
          onBackgroundClick()
        }}
      >
        <boxGeometry args={[80, 0.2, 80]} />
        <meshStandardMaterial color="#1f2a20" roughness={0.92} metalness={0.03} />
      </mesh>

      <Suspense
        fallback={
          <Html center>
            <div className="canvas-loading">Loading 3D scene...</div>
          </Html>
        }
      >
        {visibleParts.map((part) => (
          <BmpPartObject
            key={part.id}
            part={part}
            position={resolvePosition(part.id)}
            draggable={dragEnabled && part.draggable}
            isSelected={selectedPartId === part.id}
            isHovered={hoveredPartId === part.id}
            isDragging={draggingPartId === part.id}
            isDetached={Boolean(detachedPositions[part.id]) || draggingPartId === part.id}
            labelsEnabled={labelsEnabled}
            onSelect={onSelectPart}
            onPressStart={onPartPointerDown}
            onPressMove={onPartPointerMove}
            onPressEnd={onPartPointerUp}
            onHover={onHoverPart}
          />
        ))}

        <Environment preset="sunset" />
      </Suspense>

      <Grid
        position={[0, FLOOR_Y, 0]}
        args={[40, 40]}
        cellColor="#36503a"
        sectionColor="#688d68"
        fadeDistance={32}
        fadeStrength={1.5}
      />
      <ContactShadows position={[0, FLOOR_Y + 0.01, 0]} opacity={0.45} width={20} height={20} blur={2.4} far={10} />
      <FocusRig
        mode={mode}
        selectedPartId={selectedPartId}
        detachedPositions={detachedPositions}
        resetCameraSignal={resetCameraSignal}
        controlsEnabled={!isDragging}
      />
    </>
  )
})

export function BmpTrainingViewer({
  mode,
  selectedPartId,
  hoveredPartId,
  detachedPositions = {},
  labelsEnabled = true,
  interactive = true,
  fullscreen = false,
  dragReleaseBehavior = 'persist',
  onSelectPart,
  onHoverPart,
  onUpdatePartPosition,
  onResetPartPosition,
  resetCameraSignal,
}: BmpTrainingViewerProps) {
  const resolvePosition = useCallback(
    (partId: string) => {
      const detached = detachedPositions[partId]
      if (detached) {
        return clampPartPosition(partId, detached)
      }

      const target = getPartTargetPosition(partMap[partId], mode)
      return clampPartPosition(partId, target)
    },
    [detachedPositions, mode],
  )

  const updatePartPosition = useCallback(
    (partId: string, position: [number, number, number]) => {
      if (!onUpdatePartPosition) return
      onUpdatePartPosition(partId, clampPartPosition(partId, position))
    },
    [onUpdatePartPosition],
  )

  const dragEnabled = interactive && Boolean(onUpdatePartPosition)

  const {
    draggingPartId,
    isDragging,
    handlePartPointerDown,
    handleScenePointerMove,
    handleScenePointerUp,
    consumeSuppressedClick,
  } = usePartDrag({
    enabled: dragEnabled,
    dragReleaseBehavior,
    minY: FLOOR_Y,
    getPartMinY: (partId) => partMinCenterYMap[partId] ?? FLOOR_Y,
    isPartDraggable: (partId) => Boolean(partMap[partId]?.draggable),
    getPartPosition: resolvePosition,
    onSelectPart,
    onUpdatePartPosition: updatePartPosition,
    onResetPartPosition,
  })

  const handleSelectPart = useCallback(
    (partId: string) => {
      if (consumeSuppressedClick()) return
      if (selectedPartId === partId) {
        onSelectPart(null)
        return
      }

      onSelectPart(partId)
    },
    [consumeSuppressedClick, onSelectPart, selectedPartId],
  )

  const handleHoverPart = useCallback(
    (partId: string | null) => {
      if (isDragging) return
      onHoverPart(partId)
    },
    [isDragging, onHoverPart],
  )

  useEffect(() => {
    if (!isDragging) return
    onHoverPart(null)
  }, [isDragging, onHoverPart])

  const handlePartPointerMove = useCallback(
    (_partId: string, event: ThreeEvent<PointerEvent>) => {
      handleScenePointerMove(event)
    },
    [handleScenePointerMove],
  )

  const handlePartPointerUp = useCallback(() => {
    handleScenePointerUp()
  }, [handleScenePointerUp])

  const handleBackgroundClick = useCallback(() => {
    if (isDragging) return
    if (consumeSuppressedClick()) return

    onHoverPart(null)
    onSelectPart(null)
  }, [consumeSuppressedClick, isDragging, onHoverPart, onSelectPart])

  return (
    <div className={fullscreen ? 'viewer-shell fullscreen' : 'viewer-shell'}>
      <Canvas
        shadows
        dpr={[1, 1.8]}
        onPointerMissed={(event) => {
          event.stopPropagation()
          handleBackgroundClick()
        }}
      >
        <SceneContent
          mode={mode}
          selectedPartId={selectedPartId}
          hoveredPartId={hoveredPartId}
          detachedPositions={detachedPositions}
          labelsEnabled={labelsEnabled}
          dragEnabled={dragEnabled}
          draggingPartId={draggingPartId}
          isDragging={isDragging}
          onSelectPart={handleSelectPart}
          onHoverPart={handleHoverPart}
          onPartPointerDown={handlePartPointerDown}
          onPartPointerMove={handlePartPointerMove}
          onPartPointerUp={handlePartPointerUp}
          onBackgroundClick={handleBackgroundClick}
          resolvePosition={resolvePosition}
          resetCameraSignal={resetCameraSignal}
        />
      </Canvas>
    </div>
  )
}

export default memo(BmpTrainingViewer)
