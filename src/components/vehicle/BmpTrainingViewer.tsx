import { Suspense, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import {
  CameraControls,
  ContactShadows,
  Environment,
  Grid,
  Html,
  PerspectiveCamera,
  TransformControls,
} from '@react-three/drei'
import type { CameraControls as CameraControlsImpl } from '@react-three/drei'
import type { Group } from 'three'
import { bmp2Parts, getPartTargetPosition, partMap } from '../../data/bmp2Parts'
import type { VehicleMode } from '../../types/bmp2'
import { BmpPartObject } from './BmpPartObject'

type DetachedPositions = Record<string, [number, number, number]>

type BmpTrainingViewerProps = {
  mode: VehicleMode
  selectedPartId: string | null
  hoveredPartId: string | null
  detachedPositions?: DetachedPositions
  labelsEnabled?: boolean
  interactive?: boolean
  fullscreen?: boolean
  onSelectPart: (partId: string) => void
  onHoverPart: (partId: string | null) => void
  onUpdatePartPosition?: (partId: string, position: [number, number, number]) => void
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

const SceneContent = memo(function SceneContent({
  mode,
  selectedPartId,
  hoveredPartId,
  detachedPositions = {},
  labelsEnabled = true,
  interactive = true,
  onSelectPart,
  onHoverPart,
  onUpdatePartPosition,
  resetCameraSignal,
}: BmpTrainingViewerProps) {
  const [isTransforming, setIsTransforming] = useState(false)
  const selectedObjectRef = useRef<Group | null>(null)

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

  const selectedPart = useMemo(
    () => visibleParts.find((part) => part.id === selectedPartId) ?? null,
    [selectedPartId, visibleParts],
  )

  const regularParts = useMemo(
    () => visibleParts.filter((part) => !interactive || part.id !== selectedPartId),
    [interactive, selectedPartId, visibleParts],
  )

  const resolvePosition = useCallback(
    (partId: string) => {
      const detached = detachedPositions[partId]
      if (detached) return detached
      return getPartTargetPosition(partMap[partId], mode)
    },
    [detachedPositions, mode],
  )

  const handleObjectChange = useCallback(() => {
    if (!selectedPart || !selectedObjectRef.current || !onUpdatePartPosition) return

    const { x, y, z } = selectedObjectRef.current.position
    onUpdatePartPosition(selectedPart.id, [x, y, z])
  }, [onUpdatePartPosition, selectedPart])

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

      <Suspense
        fallback={
          <Html center>
            <div className="canvas-loading">Loading 3D scene...</div>
          </Html>
        }
      >
        {regularParts.map((part) => (
          <BmpPartObject
            key={part.id}
            part={part}
            position={resolvePosition(part.id)}
            isSelected={selectedPartId === part.id}
            isHovered={hoveredPartId === part.id}
            isDetached={Boolean(detachedPositions[part.id])}
            labelsEnabled={labelsEnabled}
            onSelect={onSelectPart}
            onHover={onHoverPart}
          />
        ))}

        {interactive && selectedPart ? (
          <TransformControls
            mode="translate"
            size={0.85}
            onMouseDown={() => setIsTransforming(true)}
            onMouseUp={() => setIsTransforming(false)}
            onObjectChange={handleObjectChange}
          >
            <group ref={selectedObjectRef} position={resolvePosition(selectedPart.id)}>
              <BmpPartObject
                part={selectedPart}
                position={[0, 0, 0]}
                isSelected
                isHovered={hoveredPartId === selectedPart.id}
                isDetached
                labelsEnabled={labelsEnabled}
                onSelect={onSelectPart}
                onHover={onHoverPart}
              />
            </group>
          </TransformControls>
        ) : selectedPart ? (
          <BmpPartObject
            part={selectedPart}
            position={resolvePosition(selectedPart.id)}
            isSelected
            isHovered={hoveredPartId === selectedPart.id}
            isDetached={Boolean(detachedPositions[selectedPart.id])}
            labelsEnabled={labelsEnabled}
            onSelect={onSelectPart}
            onHover={onHoverPart}
          />
        ) : null}

        <Environment preset="sunset" />
      </Suspense>

      <Grid
        position={[0, 0, 0]}
        args={[40, 40]}
        cellColor="#36503a"
        sectionColor="#688d68"
        fadeDistance={32}
        fadeStrength={1.5}
      />
      <ContactShadows position={[0, 0.01, 0]} opacity={0.45} width={20} height={20} blur={2.4} far={10} />
      <FocusRig
        mode={mode}
        selectedPartId={selectedPartId}
        detachedPositions={detachedPositions}
        resetCameraSignal={resetCameraSignal}
        controlsEnabled={!isTransforming}
      />
    </>
  )
})

export function BmpTrainingViewer({ fullscreen = false, ...props }: BmpTrainingViewerProps) {
  return (
    <div className={fullscreen ? 'viewer-shell fullscreen' : 'viewer-shell'}>
      <Canvas shadows dpr={[1, 1.8]}>
        <SceneContent {...props} />
      </Canvas>
    </div>
  )
}

export default memo(BmpTrainingViewer)
