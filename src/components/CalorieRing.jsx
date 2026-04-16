import { pct } from '../lib/utils'

export default function CalorieRing({ calories, goal, size = 160 }) {
  const r        = (size / 2) * 0.72
  const cx       = size / 2
  const cy       = size / 2
  const circ     = 2 * Math.PI * r
  const progress = pct(calories, goal)
  const offset   = circ - (progress / 100) * circ
  const over     = calories > goal
  const remaining = goal - calories

  const trackColor = 'var(--border)'
  const fillColor  = over ? 'var(--danger)' : calories >= goal * 0.9 ? 'var(--success)' : 'var(--accent)'

  return (
    <div className="ring-container" style={{ gap: 8 }}>
      <svg width={size} height={size} role="img" aria-label={`${calories} of ${goal} calories`}>
        {/* Track */}
        <circle cx={cx} cy={cy} r={r}
          fill="none" stroke={trackColor} strokeWidth={size * 0.075}
        />
        {/* Fill */}
        <circle cx={cx} cy={cy} r={r}
          fill="none"
          stroke={fillColor}
          strokeWidth={size * 0.075}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={over ? 0 : offset}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: 'stroke-dashoffset 600ms cubic-bezier(0.34,1.56,0.64,1), stroke 300ms ease' }}
        />
        {/* Center text */}
        <text x={cx} y={cy - size * 0.06} textAnchor="middle"
          fill="var(--text-primary)"
          fontSize={size * 0.175}
          fontWeight="700"
          fontFamily="-apple-system, system-ui, sans-serif"
          letterSpacing="-1">
          {over ? `+${calories - goal}` : remaining}
        </text>
        <text x={cx} y={cy + size * 0.12} textAnchor="middle"
          fill="var(--text-secondary)"
          fontSize={size * 0.085}
          fontFamily="-apple-system, system-ui, sans-serif">
          {over ? 'over goal' : 'remaining'}
        </text>
        <text x={cx} y={cy + size * 0.24} textAnchor="middle"
          fill="var(--text-tertiary)"
          fontSize={size * 0.072}
          fontFamily="-apple-system, system-ui, sans-serif">
          {calories} / {goal}
        </text>
      </svg>
    </div>
  )
}
