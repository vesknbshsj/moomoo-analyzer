import { create } from 'zustand'

type Locale = 'zh-CN' | 'en'

interface UiStore {
  locale: Locale
  sidebarCollapsed: boolean
  setLocale: (l: Locale) => void
  toggleSidebar: () => void
}

export const useUiStore = create<UiStore>((set) => ({
  locale: (localStorage.getItem('i18nextLng') as Locale) || 'zh-CN',
  sidebarCollapsed: false,
  setLocale: (l) => {
    localStorage.setItem('locale', l)
    set({ locale: l })
  },
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}))
