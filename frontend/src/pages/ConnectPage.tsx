import { useTranslation } from 'react-i18next'
import ConnectionForm from '@/components/connect/ConnectionForm'
import ConnectionStatusBadge from '@/components/connect/ConnectionStatusBadge'

export default function ConnectPage() {
  const { t } = useTranslation('connect')

  return (
    <div className="max-w-2xl mx-auto py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('title')}</h1>
      <p className="text-gray-500 mb-2">{t('prerequisite')}</p>

      <div className="mt-8 space-y-6">
        <ConnectionForm />
        <ConnectionStatusBadge />
      </div>
    </div>
  )
}
