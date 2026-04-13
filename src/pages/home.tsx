import { NavLink, Outlet, useLocation } from 'react-router-dom'

const routeItems = [
  { to: '/', label: 'Overview', end: true },
  { to: '/vehicle', label: '3D Trainer' },
  { to: '/parts', label: 'Lectures' },
  { to: '/test', label: 'Testing' },
]

function Navigation() {
  return (
    <nav className="top-nav" aria-label="Primary navigation">
      {routeItems.map((item) => (
        <NavLink key={item.to} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} to={item.to} end={item.end}>
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

export default function Home() {
  const location = useLocation()
  const isVehicleRoute = location.pathname.startsWith('/vehicle')

  if (isVehicleRoute) {
    return (
      <div className="vehicle-route-shell">
        <div className="vehicle-route-nav overlay-panel">
          <p className="eyebrow">BMP-2 Training Platform</p>
          <Navigation />
        </div>
        <Outlet />
      </div>
    )
  }

  return (
    <div className="app-shell">
      <header className="hero-shell">
        <div>
          <p className="eyebrow">Automated Training System</p>
          <h1>BMP-2 interactive study platform</h1>
          <p className="hero-copy">
            Explore the vehicle layout in 3D, open lecture pages for each subsystem, and run randomized knowledge checks with single-choice and multiple-choice questions.
          </p>
        </div>

        <div className="hero-actions">
          <Navigation />
        </div>
      </header>

      <section className="dashboard-grid">
        <article className="panel overview-card">
          <p className="eyebrow">Simulator</p>
          <h2>Fullscreen 3D training scene</h2>
          <p className="muted-text">
            Enter a full-viewport BMP-2 trainer with exploded, internal, and assembled study modes plus detachable components.
          </p>
        </article>

        <article className="panel overview-card">
          <p className="eyebrow">Lectures</p>
          <h2>Per-component theory pages</h2>
          <p className="muted-text">
            Each part page now includes functional role, detailed notes, placeholder imagery, and technical specifications sourced from the shared dataset.
          </p>
        </article>

        <article className="panel overview-card accent-card">
          <p className="eyebrow">Assessment</p>
          <h2>Randomized testing flow</h2>
          <p className="muted-text">
            Launch a 20-question mixed quiz drawn from a larger question bank designed for future growth toward a full training inventory.
          </p>
        </article>
      </section>

      <Outlet />
    </div>
  )
}
