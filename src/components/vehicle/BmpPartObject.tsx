import { memo, useEffect, useMemo, useRef } from 'react'
import { animated, useSpring } from '@react-spring/three'
import { Html } from '@react-three/drei'
import type { Group } from 'three'
import type { VehiclePart } from '../../types/bmp2'

type BmpPartObjectProps = {
  part: VehiclePart
  position: [number, number, number]
  isSelected: boolean
  isHovered: boolean
  isDetached: boolean
  labelsEnabled: boolean
  onSelect: (partId: string) => void
  onHover: (partId: string | null) => void
}

function getVisualState(part: VehiclePart, isSelected: boolean, isHovered: boolean) {
  const emphasized = isSelected || isHovered

  if (part.visibility === 'structure') {
    return {
      opacity: isSelected ? 0.52 : 0.26,
      roughness: 0.52,
      metalness: 0.12,
      emissiveIntensity: emphasized ? 0.34 : 0.08,
    }
  }

  return {
    opacity: 1,
    roughness: emphasized ? 0.22 : 0.38,
    metalness: 0.18,
    emissiveIntensity: emphasized ? 0.56 : 0.1,
  }
}

export const BmpPartObject = memo(function BmpPartObject({
  part,
  position,
  isSelected,
  isHovered,
  isDetached,
  labelsEnabled,
  onSelect,
  onHover,
}: BmpPartObjectProps) {
  const groupRef = useRef<Group>(null)
  const targetScale = isSelected ? 1.08 : isHovered ? 1.04 : 1
  const visualState = useMemo(() => getVisualState(part, isSelected, isHovered), [isHovered, isSelected, part])

  const springs = useSpring({
    positionX: position[0],
    positionY: position[1],
    positionZ: position[2],
    uniformScale: targetScale,
    config: { mass: 1.2, tension: 220, friction: 24 },
  })

  useEffect(() => {
    if (!groupRef.current) return
    groupRef.current.renderOrder = isSelected ? 4 : isHovered ? 3 : 1
  }, [isHovered, isSelected])

  return (
    <animated.group
      ref={groupRef}
      position-x={isDetached ? position[0] : springs.positionX}
      position-y={isDetached ? position[1] : springs.positionY}
      position-z={isDetached ? position[2] : springs.positionZ}
      scale-x={springs.uniformScale}
      scale-y={springs.uniformScale}
      scale-z={springs.uniformScale}
      rotation={part.geometry.rotation}
      onPointerEnter={(event) => {
        event.stopPropagation()
        onHover(part.id)
      }}
      onPointerLeave={(event) => {
        event.stopPropagation()
        onHover(null)
      }}
      onClick={(event) => {
        event.stopPropagation()
        onSelect(part.id)
      }}
    >
      <mesh castShadow receiveShadow>
        {part.geometry.shape === 'box' ? (
          <boxGeometry args={part.geometry.size} />
        ) : (
          <cylinderGeometry
            args={[part.geometry.size[0], part.geometry.size[0], part.geometry.size[1], part.geometry.size[2]]}
          />
        )}
        <meshStandardMaterial
          color={part.color}
          emissive={isSelected ? '#ffd166' : isHovered ? '#8bd3dd' : '#000000'}
          emissiveIntensity={visualState.emissiveIntensity}
          transparent={visualState.opacity < 1}
          opacity={visualState.opacity}
          metalness={visualState.metalness}
          roughness={visualState.roughness}
        />
      </mesh>

      {labelsEnabled && (isSelected || isHovered) ? (
        <Html
          position={[0, part.geometry.shape === 'box' ? part.geometry.size[1] * 0.7 : part.geometry.size[1] * 0.55, 0]}
          center
          distanceFactor={10}
        >
          <div className="part-label">
            <strong>{part.name}</strong>
            <span>{isDetached ? 'Detached component' : part.category}</span>
          </div>
        </Html>
      ) : null}
    </animated.group>
  )
})
