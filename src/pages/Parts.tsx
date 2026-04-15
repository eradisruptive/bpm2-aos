import { Link } from 'react-router-dom'
import { bmp2Hierarchy } from '../data/bmp2Parts'

export default function Parts() {
  return (
    <main className="catalog-shell">
      <section className="panel catalog-header">
        <p className="eyebrow">Lecture Library</p>
        <h2>BMP-2 section and group hierarchy</h2>
        <p className="muted-text">
          Every interactive element is organized as Section → Group → Element. Open a lecture page to study function, specifications, and visual references.
        </p>
      </section>

      {bmp2Hierarchy.map(({ section, groups }) => {
        const populatedGroups = groups.filter((groupNode) => groupNode.elements.length)
        if (!populatedGroups.length) return null

        return (
          <section key={section.id} className="catalog-section">
            <article className="panel section-panel">
              <div className="catalog-card-top">
                <span className="section-pill">{section.name}</span>
              </div>
              <h2>{section.name}</h2>
              <p className="muted-text">{section.description}</p>
            </article>

            <div className="group-stack">
              {populatedGroups.map(({ group, elements }) => (
                <article key={group.id} className="panel group-panel">
                  <div className="catalog-card-top">
                    <span className="category-pill">{group.name}</span>
                  </div>
                  <p className="muted-text">{group.description}</p>

                  <div className="catalog-grid">
                    {elements.map((part) => (
                      <article key={part.id} className="panel catalog-card lecture-card">
                        <div className="catalog-card-top">
                          <span className="section-pill">{section.name}</span>
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
                  </div>
                </article>
              ))}
            </div>
          </section>
        )
      })}
    </main>
  )
}
