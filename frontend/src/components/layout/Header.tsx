import { useTranslation } from 'react-i18next'
import { Globe, Wifi, WifiOff, Lock, AlertTriangle } from 'lucide-react'
import { useConnectionStore } from '@/store/connectionStore'
import { useUiStore } from '@/store/uiStore'

const stateConfig: Record<
  string,
  { icon: typeof Wifi; color: string; label: string }
> = {
  connected: { icon: Wifi, color: 'text-green-500', label: '已连接 / Connected' },
  trade_unlocked: { icon: Lock, color: 'text-green-500', label: '交易已解锁 / Trade Unlocked' },
  connecting: { icon: Wifi, color: 'text-yellow-500', label: '连接中... / Connecting...' },
  reconnecting: { icon: Wifi, color: 'text-yellow-500', label: '重连中... / Reconnecting...' },
  error: { icon: AlertTriangle, color: 'text-red-500', label: '连接错误 / Error' },
  disconnected: { icon: WifiOff, color: 'text-gray-400', label: '未连接 / Disconnected' },
}

export default function Header() {
  const { i18n } = useTranslation()
  const connectionState = useConnectionStore((s) => s.state)
  const setLocale = useUiStore((s) => s.setLocale)

  const cfg = stateConfig[connectionState] || stateConfig.disconnected
  const StatusIcon = cfg.icon

  const toggleLang = () => {
    const next = i18n.language === 'zh-CN' ? 'en' : 'zh-CN'
    i18n.changeLanguage(next)
    setLocale(next as 'zh-CN' | 'en')
  }

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <StatusIcon size={16} className={cfg.color} />
        <span className="text-sm text-gray-600">{cfg.label}</span>
      </div>

      <button
        onClick={toggleLang}
        className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
      >
        <Globe size={16} />
        {i18n.language === 'zh-CN' ? 'English' : '中文'}
      </button>
    </header>
  )
}
