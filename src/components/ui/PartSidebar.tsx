import { Link } from 'react-router-dom'
import type { TrainingStep, VehicleMode, VehiclePart } from '../../types/bmp2'

type PartSidebarProps = {
  mode: VehicleMode
  selectedPart: VehiclePart | null
  hoveredPart: VehiclePart | null
  activeStep: TrainingStep | null
  stepIndex: number
  totalSteps: number
  detachedPartCount: number
  onModeChange: (mode: VehicleMode) => void
  onResetCamera: () => void
  onResetParts: () => void
  onResetSelectedPart: () => void
  onClearSelection: () => void
  onPreviousStep: () => void
  onNextStep: () => void
}

const modes: { id: VehicleMode; label: string; description: string }[] = [
  { id: 'assembled', label: 'Assembled', description: 'Study the BMP-2 as a complete combat vehicle.' },
  { id: 'exploded', label: 'Exploded', description: 'Separate major systems to inspect relationships between parts.' },
  { id: 'internal', label: 'Internal', description: 'Reveal the engine bay, crew spaces, and support systems.' },
]

export function PartSidebar({
  mode,
  selectedPart,
  hoveredPart,
  activeStep,
  stepIndex,
  totalSteps,
  detachedPartCount,
  onModeChange,
  onResetCamera,
  onResetParts,
  onResetSelectedPart,
  onClearSelection,
  onPreviousStep,
  onNextStep,
}: PartSidebarProps) {
  const visiblePart = selectedPart ?? hoveredPart

  return (
    <aside className="panel sidebar-panel overlay-panel">
      <section className="panel-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Viewer Modes</p>
            <h2>Scene control</h2>
          </div>
          <span className="step-pill">Detached: {detachedPartCount}</span>
        </div>
        <div className="mode-list">
          {modes.map((item) => (
            <button
              key={item.id}
              className={item.id === mode ? 'mode-chip active' : 'mode-chip'}
              type="button"
              onClick={() => onModeChange(item.id)}
            >
              <strong>{item.label}</strong>
              <span>{item.description}</span>
            </button>
          ))}
        </div>

        <div className="button-row">
          <button type="button" className="secondary-button" onClick={onResetCamera}>
            Reset camera
          </button>
          <button type="button" className="secondary-button" onClick={onResetSelectedPart}>
            Reset selected part
          </button>
          <button type="button" className="secondary-button" onClick={onResetParts}>
            Reset all parts
          </button>
          <button type="button" className="secondary-button" onClick={onClearSelection}>
            Clear focus
          </button>
        </div>
      </section>

      <section className="panel-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Guided Training</p>
            <h2>{activeStep?.title ?? 'Guided review'}</h2>
          </div>
          <span className="step-pill">{stepIndex + 1}/{totalSteps}</span>
        </div>
        <p className="muted-text">{activeStep?.description}</p>
        <div className="button-row">
          <button type="button" className="secondary-button" onClick={onPreviousStep} disabled={stepIndex === 0}>
            Previous
          </button>
          <button type="button" className="primary-button" onClick={onNextStep} disabled={stepIndex >= totalSteps - 1}>
            Next step
          </button>
        </div>
      </section>

      <section className="panel-section detail-panel">
        <p className="eyebrow">Selected Component</p>
        {visiblePart ? (
          <>
            <h2>{visiblePart.name}</h2>
            <p className="muted-text">{visiblePart.description}</p>
            <p className="lecture-role-preview compact">{visiblePart.functionalRole}</p>
            <dl className="detail-list">
              <div>
                <dt>Category</dt>
                <dd>{visiblePart.category}</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>{visiblePart.location}</dd>
              </div>
            </dl>
            <ul className="spec-list compact">
              {visiblePart.specs.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <Link className="inline-link" to={`/parts/${visiblePart.id}`}>
              Open lecture page
            </Link>
          </>
        ) : (
          <p className="muted-text">
            Hover or select a part in the scene to inspect it. Selecting detaches the component and activates a transform gizmo for free movement.
          </p>
        )}
      </section>
    </aside>
  )
}
