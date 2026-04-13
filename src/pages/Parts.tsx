import { Link } from 'react-router-dom'
import { bmp2Parts } from '../data/bmp2Parts'

export default function Parts() {
  return (
    <main className="catalog-shell">
      <section className="panel catalog-header">
        <p className="eyebrow">Lecture Library</p>
        <h2>BMP-2 system theory pages</h2>
        <p className="muted-text">
          Open each lecture page to study function, technical specifications, and visual placeholders before entering the simulator or test mode.
        </p>
      </section>

      <section className="catalog-grid">
        {bmp2Parts.map((part) => (
          <article key={part.id} className="panel catalog-card lecture-card">
            <div className="catalog-card-top">
              <span className="category-pill">{part.category}</span>
              <span className="color-chip" style={{ backgroundColor: part.color }} aria-hidden="true" />
            </div>
            <h2>{part.name}</h2>
            <p className="muted-text">{part.description}</p>
            <p className="catalog-location">{part.location}</p>
            <p className="lecture-role-preview">{part.functionalRole}</p>
            <div className="mini-image-strip">
              {part.placeholderImages.map((image) => (
                <div key={image.id} className="mini-image-placeholder">
                  <strong>{image.title}</strong>
                </div>
              ))}
            </div>
            <Link className="inline-link" to={`/parts/${part.id}`}>
              Open lecture page
            </Link>
          </article>
        ))}
      </section>
    </main>
  )
}
