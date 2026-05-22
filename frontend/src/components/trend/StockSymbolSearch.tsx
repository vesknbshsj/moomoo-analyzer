import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useStockSearch } from '@/hooks/useTrend'
import { Search } from 'lucide-react'
import type { StockInfo } from '@/types/trend'

interface Props {
  onSelect: (stock: StockInfo) => void
  selectedCode?: string
}

export default function StockSymbolSearch({ onSelect, selectedCode }: Props) {
  const { t } = useTranslation('trend')
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const { data: results } = useStockSearch(query)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={t('searchPlaceholder')}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
        />
      </div>

      {isOpen && results && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {results.map((s) => (
            <button
              key={s.code}
              onClick={() => {
                onSelect(s)
                setQuery('')
                setIsOpen(false)
              }}
              className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center justify-between ${
                selectedCode === s.code ? 'bg-primary-50' : ''
              }`}
            >
              <div>
                <span className="font-medium text-gray-900">{s.name}</span>
                <span className="text-xs text-gray-400 ml-2">{s.code}</span>
              </div>
              <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-500">
                {s.market}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
