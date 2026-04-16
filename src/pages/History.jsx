import useStore from '../store/useStore'
import { formatDate, formatDay, avg } from '../lib/utils'
import { STARTING_STATS } from '../lib/seedData'

export default function History() {
  const { logs, goals } = useStore()

  const sorted   = [...logs].sort((a, b) => b.date.localeCompare(a.date))
  const withCal  = logs.filter(l => l.calories > 0)
  const withWeight = logs.filter(l => l.weight)
  const latestWeight = withWeight.sort((a, b) => b.date.localeCompare(a.date))[0]?.weight
  const weightDelta  = latestWeight ? (latestWeight - STARTING_STATS.weight).toFixed(1) : null

  const avgCal    = avg(withCal.map(l => l.calories))
  const avgPro    = avg(withCal.map(l => l.protein))
  const daysUnder = withCal.filter(l => l.calories <= goals.calories).length
  const daysHit150 = withCal.filter(l => l.protein >= 150).length

  const calColor = (c) => {
    if (!c) return 'var(--text-tertiary)'
    if (c > goals.calories * 1.15) return 'var(--danger)'
    if (c > goals.calories) return 'var(--warning)'
    return 'var(--text-primary)'
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">All Time</div>
        <div className="page-subtitle">{logs.length} days tracked</div>
      </div>

      {/* Summary stats */}
      <div className="section">
        <div className="card" style={{ padding: '16px' }}>
          {/* Weight progress */}
          <div style={{ padding: '4px 0 16px', borderBottom: '1px solid var(--border)', marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 8 }}>
              Body Recomp Progress
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 2 }}>Start</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{STARTING_STATS.weight} lbs</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{STARTING_STATS.bf}% BF</div>
              </div>
              <div style={{ fontSize: 24, color: weightDelta < 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 800 }}>
                {weightDelta !== null ? `${weightDelta > 0 ? '+' : ''}${weightDelta} lbs` : '—'}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 2 }}>Current</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{latestWeight ?? '—'} lbs</div>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {[
              { label: 'Avg Calories',   value: avgCal },
              { label: 'Avg Protein',    value: `${avgPro}g` },
              { label: `Days ≤ ${goals.calories} cal`, value: `${daysUnder}/${withCal.length}` },
              { label: 'Days 150g+ prot',value: `${daysHit150}/${withCal.length}` },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--bg)', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ fontSize: 19, fontWeight: 700, color: 'var(--text-primary)' }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full log table */}
      <div className="section">
        <div className="section-label">Full Log</div>
        <div className="card">
          {/* Header */}
          <div style={{ display: 'flex', padding: '8px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
            <span style={{ flex: 2, fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Date</span>
            <span style={{ width: 64, textAlign: 'right', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Cal</span>
            <span style={{ width: 56, textAlign: 'right', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Prot</span>
            <span style={{ width: 64, textAlign: 'right', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Weight</span>
          </div>
          {sorted.map(log => (
            <div key={log.date} style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ flex: 2 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>
                  {formatDate(log.date)} <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>{formatDay(log.date)}</span>
                </div>
                {log.notes ? (
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>{log.notes}</div>
                ) : null}
              </div>
              <div style={{ width: 64, textAlign: 'right', fontSize: 15, fontWeight: 600, color: calColor(log.calories) }}>
                {log.calories || '—'}
              </div>
              <div style={{ width: 56, textAlign: 'right', fontSize: 13, color: log.protein >= 150 ? 'var(--success)' : 'var(--text-secondary)' }}>
                {log.protein ? `${log.protein}g` : '—'}
              </div>
              <div style={{ width: 64, textAlign: 'right', fontSize: 13, color: 'var(--text-secondary)' }}>
                {log.weight ? `${log.weight}` : '—'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
