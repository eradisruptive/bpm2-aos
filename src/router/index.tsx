import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from '../pages/home'

const Vehicle = lazy(() => import('../pages/Vehicle'))
const Parts = lazy(() => import('../pages/Parts'))
const PartDetail = lazy(() => import('../pages/PartDetail'))
const Test = lazy(() => import('../pages/Test'))

function RouteFallback() {
  return <div className="route-fallback">Loading training module...</div>
}

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}>
          <Route
            path="vehicle"
            element={
              <Suspense fallback={<RouteFallback />}>
                <Vehicle />
              </Suspense>
            }
          />
          <Route
            path="parts"
            element={
              <Suspense fallback={<RouteFallback />}>
                <Parts />
              </Suspense>
            }
          />
          <Route
            path="parts/:id"
            element={
              <Suspense fallback={<RouteFallback />}>
                <PartDetail />
              </Suspense>
            }
          />
          <Route
            path="test"
            element={
              <Suspense fallback={<RouteFallback />}>
                <Test />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
