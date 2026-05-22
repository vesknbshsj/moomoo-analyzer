const timeframes = [
  { label: '1D', value: 'K_DAY', count: 250 },
  { label: '1W', value: 'K_WEEK', count: 104 },
  { label: '1M', value: 'K_MON', count: 60 },
  { label: '3M', value: 'K_MON', count: 120 },
  { label: '6M', value: 'K_MON', count: 240 },
  { label: '1Y', value: 'K_DAY', count: 250 },
  { label: '5Y', value: 'K_DAY', count: 1250 },
]

interface Props {
  selected: string
  onSelect: (klType: string, count: number) => void
}

export default function TimeframeSelector({ selected, onSelect }: Props) {
  return (
    <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
      {timeframes.map((tf) => (
        <button
          key={tf.label}
          onClick={() => onSelect(tf.value, tf.count)}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            selected === tf.value
              ? 'bg-white text-primary-600 shadow-sm font-medium'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {tf.label}
        </button>
      ))}
    </div>
  )
}
