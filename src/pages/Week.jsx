import { BarChart, Bar, XAxis, YAxis, ReferenceLine, ResponsiveContainer, Cell, Tooltip } from 'recharts'
import useStore from '../store/useStore'
import { getWeekDates, formatDay, formatDate, avg } from '../lib/utils'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 12px', fontSize: 13 }}>
      <div style={{ fontWeight: 600, marginBottom: 2 }}>{label}</div>
      <div>{payload[0].value} cal</div>
    </div>
  )
}

export default function Week() {
  const { getWeekLogs, goals } = useStore()
  const weekDates = getWeekDates()
  const weekLogs  = getWeekLogs(weekDates)

  const logged    = weekLogs.filter(l => l.calories > 0)
  const avgCal    = avg(logged.map(l => l.calories))
  const avgPro    = avg(logged.map(l => l.protein))
  const daysUnder = logged.filter(l => l.calories <= goals.calories).length
  const daysOver  = logged.filter(l => l.calories > goals.calories).length

  const chartData = weekLogs.map(l => ({
    day:      formatDay(l.date),
    date:     formatDate(l.date),
    calories: l.calories || 0,
    isToday:  l.date === new Date().toISOString().split('T')[0],
  }))

  const barColor = (val) => {
    if (val === 0)            return 'var(--border)'
    if (val > goals.calories) return 'var(--danger)'
    if (val >= goals.calories * 0.9) return 'var(--success)'
    return 'var(--accent)'
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">This Week</div>
        <div className="page-subtitle">
          {formatDate(weekDates[0])} – {formatDate(weekDates[6])}
        </div>
      </div>

      {/* Stats row */}
      <div className="section">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {[
            { value: avgCal,    label: 'Avg Cal'   },
            { value: avgPro,    label: 'Avg Prot'  },
            { value: daysUnder, label: 'Under'     },
            { value: daysOver,  label: 'Over'      },
          ].map(s => (
            <div key={s.label} className="stat-pill">
              <div className="stat-pill-value">{s.value}{s.label === 'Avg Prot' ? 'g' : ''}</div>
              <div className="stat-pill-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bar Chart */}
      <div className="section">
        <div className="card" style={{ padding: '20px 8px 12px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', padding: '0 12px 16px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
            Daily Calories
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} margin={{ top: 0, right: 8, bottom: 0, left: -20 }} barSize={28}>
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--text-secondary)', fontFamily: '-apple-system, system-ui' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)', fontFamily: '-apple-system, system-ui' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <ReferenceLine y={goals.calories} stroke="var(--accent)" strokeDasharray="4 3" strokeWidth={1.5} />
              <Bar dataKey="calories" radius={[5, 5, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={barColor(entry.calories)} opacity={entry.isToday ? 1 : 0.75} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px 0', fontSize: 11, color: 'var(--text-tertiary)' }}>
            <div style={{ width: 20, height: 2, background: 'var(--accent)', borderRadius: 1 }} />
            Goal ({goals.calories} cal)
          </div>
        </div>
      </div>

      {/* Day list */}
      <div className="section">
        <div className="section-label">Daily Breakdown</div>
        <div className="card">
          {weekLogs.map(log => {
            const isToday = log.date === new Date().toISOString().split('T')[0]
            const hasCal  = log.calories > 0
            return (
              <div key={log.date} className="list-row" style={{ background: isToday ? 'var(--accent-light)' : 'transparent' }}>
                <div style={{ width: 36, flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: isToday ? 'var(--accent)' : 'var(--text-secondary)' }}>
                    {formatDay(log.date)}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{formatDate(log.date)}</div>
                </div>
                <div style={{ flex: 1 }}>
                  {hasCal ? (
                    <>
                      <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden', marginBottom: 4 }}>
                        <div style={{
                          height: '100%', borderRadius: 3,
                          width: `${Math.min((log.calories / goals.calories) * 100, 100)}%`,
                          background: barColor(log.calories),
                        }} />
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{log.protein}g protein</div>
                    </>
                  ) : (
                    <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>—</div>
                  )}
                </div>
                <div style={{ textAlign: 'right', minWidth: 60 }}>
                  {hasCal ? (
                    <>
                      <div style={{ fontSize: 16, fontWeight: 700, color: barColor(log.calories) }}>{log.calories}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>cal</div>
                    </>
                  ) : (
                    <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>—</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
