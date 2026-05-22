interface Props {
  score: number
}

export default function RoastScoreGauge({ score }: Props) {
  const rotation = (score / 100) * 180 - 90

  const color =
    score < 30
      ? '#ef4444'
      : score < 50
        ? '#f59e0b'
        : score < 70
          ? '#06b6d4'
          : '#22c55e'

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-24 overflow-hidden">
        <div className="absolute bottom-0 w-48 h-48 rounded-full bg-gray-200" />
        <div
          className="absolute bottom-0 w-48 h-48 rounded-full transition-colors"
          style={{
            background: `conic-gradient(from 180deg, ${color} 0deg, ${color} ${(score / 100) * 180}deg, transparent ${(score / 100) * 180}deg)`,
          }}
        />
        <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 w-36 h-36 rounded-full bg-white" />
      </div>
      <div className="-mt-4 text-center">
        <div className="text-5xl font-extrabold" style={{ color }}>
          {score}
        </div>
        <div className="text-sm text-gray-400 mt-1">/ 100</div>
      </div>
    </div>
  )
}
