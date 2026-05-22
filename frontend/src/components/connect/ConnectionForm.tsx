import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useConnection } from '@/hooks/useConnection'

export default function ConnectionForm() {
  const { t } = useTranslation('connect')
  const { connect, isConnecting, disconnect } = useConnection()
  const [host, setHost] = useState('127.0.0.1')
  const [port, setPort] = useState(11111)

  const handleConnect = () => {
    connect({ host, port })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 max-w-md">
      <h2 className="text-lg font-semibold mb-4">{t('title')}</h2>
      <p className="text-sm text-gray-500 mb-6">{t('subtitle')}</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('host')}
          </label>
          <input
            type="text"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('port')}
          </label>
          <input
            type="number"
            value={port}
            onChange={(e) => setPort(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {isConnecting ? t('connecting') : t('connectBtn')}
          </button>
          <button
            onClick={() => disconnect()}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t('disconnectBtn')}
          </button>
        </div>
      </div>
    </div>
  )
}
