import { Routes, Route, Navigate } from 'react-router-dom'
import AppShell, { RequireConnection } from './components/layout/AppShell'
import ConnectPage from './pages/ConnectPage'
import DashboardPage from './pages/DashboardPage'
import RoastPage from './pages/RoastPage'
import FxPlPage from './pages/FxPlPage'
import TrendPage from './pages/TrendPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<Navigate to="/connect" replace />} />
        <Route path="connect" element={<ConnectPage />} />
        <Route
          path="dashboard"
          element={
            <RequireConnection>
              <DashboardPage />
            </RequireConnection>
          }
        />
        <Route
          path="roast"
          element={
            <RequireConnection>
              <RoastPage />
            </RequireConnection>
          }
        />
        <Route
          path="fx-pl"
          element={
            <RequireConnection>
              <FxPlPage />
            </RequireConnection>
          }
        />
        <Route
          path="trend"
          element={
            <RequireConnection>
              <TrendPage />
            </RequireConnection>
          }
        />
        <Route
          path="trend/:code"
          element={
            <RequireConnection>
              <TrendPage />
            </RequireConnection>
          }
        />
      </Route>
    </Routes>
  )
}
