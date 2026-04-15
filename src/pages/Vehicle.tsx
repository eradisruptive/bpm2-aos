import { Suspense, lazy, useState } from 'react'
import { PartSidebar } from '../components/ui/PartSidebar'
import { useTrainingState } from '../hooks/useTrainingState'

const BmpTrainingViewer = lazy(() => import('../components/vehicle/BmpTrainingViewer'))

export default function Vehicle() {
  const [resetCameraSignal, setResetCameraSignal] = useState(0)
  const {
    mode,
    setMode,
    selectedPart,
    selectedPartId,
    selectPart,
    hoveredPartId,
    setHoveredPartId,
    activeStep,
    stepIndex,
    goToNextStep,
    goToPreviousStep,
    resetSelection,
    resetPartPosition,
    resetPartPositions,
    updatePartPosition,
    detachedPositions,
    detachedPartCount,
    trainingSteps,
  } = useTrainingState('hull')

  return (
    <main className="vehicle-stage">
      <Suspense fallback={<div className="viewer-shell viewer-fallback fullscreen">Preparing 3D workspace...</div>}>
        <BmpTrainingViewer
          mode={mode}
          selectedPartId={selectedPartId}
          hoveredPartId={hoveredPartId}
          detachedPositions={detachedPositions}
          fullscreen
          onSelectPart={selectPart}
          onHoverPart={setHoveredPartId}
          onUpdatePartPosition={updatePartPosition}
          onResetPartPosition={resetPartPosition}
          resetCameraSignal={resetCameraSignal}
        />
      </Suspense>

      <div className="vehicle-hud overlay-panel">
        <p className="eyebrow">3D Vehicle Workspace</p>
        <h2>BMP-2 simulator</h2>
        <p className="muted-text">Select a component to detach it, move it with the transform gizmo, and reset it when needed.</p>
      </div>

      <div className="vehicle-sidebar-wrap">
        <PartSidebar
          mode={mode}
          selectedPart={selectedPart}
          activeStep={activeStep}
          stepIndex={stepIndex}
          totalSteps={trainingSteps.length}
          detachedPartCount={detachedPartCount}
          onModeChange={setMode}
          onResetCamera={() => setResetCameraSignal((value) => value + 1)}
          onResetParts={resetPartPositions}
          onResetSelectedPart={() => {
            if (selectedPartId) {
              resetPartPosition(selectedPartId)
            }
          }}
          onClearSelection={resetSelection}
          onPreviousStep={goToPreviousStep}
          onNextStep={goToNextStep}
        />
      </div>
    </main>
  )
}

