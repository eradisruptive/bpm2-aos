import { Suspense, lazy } from 'react'
import { Link, useParams } from 'react-router-dom'
import { bmp2Parts, partMap } from '../data/bmp2Parts'

const BmpTrainingViewer = lazy(() => import('../components/vehicle/BmpTrainingViewer'))

export default function PartDetail() {
  const { id } = useParams()
  const part = id ? partMap[id] : null

  if (!part) {
    return (
      <main className="detail-shell">
        <section className="panel detail-page-panel">
          <p className="eyebrow">Lecture Lookup</p>
          <h2>Component not found</h2>
          <p className="muted-text">The requested part is not present in the current training dataset.</p>
          <Link className="inline-link" to="/parts">
            Return to lecture library
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className="detail-shell lecture-detail-shell">
      <section className="panel detail-page-panel lecture-hero-panel">
        <p className="eyebrow">Lecture Page</p>
        <h2>{part.name}</h2>
        <p className="muted-text">{part.description}</p>
        <p className="lecture-role">{part.functionalRole}</p>
        <div className="button-row">
          <Link className="primary-button" to="/vehicle">
            Study in 3D
          </Link>
          <Link className="secondary-button" to="/test">
            Go to test mode
          </Link>
        </div>
      </section>

      <section className="panel lecture-images-panel">
        <p className="eyebrow">Placeholder Imagery</p>
        <div className="lecture-image-grid">
          {part.placeholderImages.map((image, index) => (
            <article key={image.id} className="lecture-image-card" style={{ ['--image-accent' as string]: part.color }}>
              <div className="lecture-image-art">
                <span>{String(index + 1).padStart(2, '0')}</span>
              </div>
              <h3>{image.title}</h3>
              <p>{image.caption}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel detail-viewer-panel">
        <div className="canvas-header compact">
          <div>
            <p className="eyebrow">Focused View</p>
            <h2>Lecture context in 3D</h2>
          </div>
          <p className="status-text">This viewer stays locked for reference so the lecture page remains stable while you study the component.</p>
        </div>
        <Suspense fallback={<div className="viewer-shell viewer-fallback">Preparing focused 3D view...</div>}>
          <BmpTrainingViewer
            mode={part.visibility === 'internal' ? 'internal' : 'exploded'}
            selectedPartId={part.id}
            hoveredPartId={null}
            labelsEnabled={false}
            interactive={false}
            onSelectPart={() => undefined}
            onHoverPart={() => undefined}
            resetCameraSignal={0}
          />
        </Suspense>
      </section>

      <section className="panel lecture-content-panel">
        <p className="eyebrow">Technical Specifications</p>
        <div className="spec-table">
          {part.technicalSpecifications.map((item) => (
            <div key={item.label} className="spec-table-row">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="panel lecture-content-panel">
        <p className="eyebrow">Functional Role</p>
        <p className="muted-text">{part.functionalRole}</p>
        <ul className="spec-list">
          {part.lecturePoints.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="panel related-panel">
        <p className="eyebrow">Related Lecture Pages</p>
        <div className="related-links">
          {bmp2Parts
            .filter((item) => item.category === part.category && item.id !== part.id)
            .slice(0, 3)
            .map((item) => (
              <Link key={item.id} className="inline-link" to={`/parts/${item.id}`}>
                {item.name}
              </Link>
            ))}
        </div>
      </section>
    </main>
  )
}
