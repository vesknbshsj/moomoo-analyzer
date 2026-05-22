import { Outlet, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useConnectionStore } from '@/store/connectionStore'
import { connectionApi } from '@/api/connectionApi'
import Sidebar from './Sidebar'
import Header from './Header'

export default function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export function RequireConnection({ children }: { children: React.ReactNode }) {
  const state = useConnectionStore((s) => s.state)
  const initialized = useConnectionStore((s) => s.initialized)
  const setState = useConnectionStore((s) => s.setState)
  const setTradeUnlocked = useConnectionStore((s) => s.setTradeUnlocked)
  const setInitialized = useConnectionStore((s) => s.setInitialized)

  useEffect(() => {
    connectionApi.getStatus().then((data) => {
      setState(data.state)
      setTradeUnlocked(data.trade_unlocked)
      setInitialized()
    }).catch(() => {
      setInitialized()
    })
  }, [])

  if (!initialized) {
    return null
  }
  if (state === 'disconnected') {
    return <Navigate to="/connect" replace />
  }
  return <>{children}</>
}
