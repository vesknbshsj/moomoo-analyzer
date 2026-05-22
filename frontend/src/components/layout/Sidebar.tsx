import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard,
  Flame,
  TrendingUp,
  Plug,
  ChevronLeft,
  ChevronRight,
  DollarSign,
} from 'lucide-react'
import { useUiStore } from '@/store/uiStore'

const navItems = [
  { to: '/connect', icon: Plug, label: 'connect' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'dashboard' },
  { to: '/roast', icon: Flame, label: 'roast' },
  { to: '/fx-pl', icon: DollarSign, label: 'fxPl' },
  { to: '/trend', icon: TrendingUp, label: 'trend' },
]

export default function Sidebar() {
  const { t } = useTranslation()
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const toggle = useUiStore((s) => s.toggleSidebar)

  return (
    <aside
      className={`h-screen bg-slate-900 text-white flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      <div className="p-4 flex items-center justify-between border-b border-slate-700">
        {!collapsed && (
          <h1 className="text-lg font-bold whitespace-nowrap">
            {t('common:appName')}
          </h1>
        )}
        <button
          onClick={toggle}
          className="p-1 hover:bg-slate-700 rounded ml-auto"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 py-4">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 transition-colors ${
                isActive
                  ? 'bg-slate-700 text-primary-400 border-r-2 border-primary-400'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Icon size={20} />
            {!collapsed && <span>{t(`common:${label}`)}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
