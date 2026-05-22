import { useTranslation } from 'react-i18next'
import { useConnection } from '@/hooks/useConnection'
import { useState } from 'react'
import { useConnectionStore } from '@/store/connectionStore'

export default function ConnectionStatusBadge() {
  const { t } = useTranslation('connect')
  const { status, unlockTrade, isUnlocking } = useConnection()
  const [password, setPassword] = useState('')
  const [showUnlock, setShowUnlock] = useState(false)
  const tradeUnlocked = useConnectionStore((s) => s.tradeUnlocked)

  if (!status) return null

  const stateColors: Record<string, string> = {
    disconnected: 'bg-gray-100 text-gray-600',
    connecting: 'bg-yellow-100 text-yellow-700',
    connected: 'bg-green-100 text-green-700',
    trade_unlocked: 'bg-green-100 text-green-700',
    error: 'bg-red-100 text-red-700',
    reconnecting: 'bg-yellow-100 text-yellow-700',
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 max-w-md">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-700">{t('status')}</span>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            stateColors[status.state] || stateColors.disconnected
          }`}
        >
          {t(status.state)}
        </span>
      </div>

      {status.message && (
        <p className="text-sm text-gray-500 mb-4">{status.message}</p>
      )}

      {status.state === 'connected' && !tradeUnlocked && (
        <div className="mt-4 border-t pt-4">
          {showUnlock ? (
            <div className="flex gap-2">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('tradePassword')}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') unlockTrade(password)
                }}
              />
              <button
                onClick={() => unlockTrade(password)}
                disabled={isUnlocking || !password}
                className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {isUnlocking ? '...' : t('unlockBtn')}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowUnlock(true)}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              {t('tradeUnlock')} →
            </button>
          )}
        </div>
      )}
    </div>
  )
}
