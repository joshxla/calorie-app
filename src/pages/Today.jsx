import { useState, useEffect } from 'react'
import CalorieRing from '../components/CalorieRing'
import QuickAddSheet from '../components/QuickAddSheet'
import useStore from '../store/useStore'
import { today, formatDate, greet, pct } from '../lib/utils'

export default function Today() {
  const { getTodayLog, upsertLog, removeFoodEntry, syncDay, goals } = useStore()
  const log = getTodayLog()
  const [showAdd,    setShowAdd]    = useState(false)
  const [editWeight, setEditWeight] = useState(false)
  const [weightVal,  setWeightVal]  = useState('')

  // Refresh food entries from API when this view is shown
  useEffect(() => {
    syncDay(today())
  }, [])

  const calories    = log?.calories    || 0
  const protein     = log?.protein     || 0
  const weight      = log?.weight
  const entries     = log?.foodEntries || []
  const proteinPct  = pct(protein, goals.protein)

  const saveWeight = () => {
    const w = parseFloat(weightVal)
    if (!isNaN(w) && w > 0) {
      upsertLog(today(), { weight: w })
      setWeightVal('')
      setEditWeight(false)
    }
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div className="page-title">{greet()}</div>
        <div className="page-subtitle">{formatDate(today(), { weekday: 'long', month: 'long', day: 'numeric' })}</div>
      </div>

      {/* Calorie Ring */}
      <div className="section">
        <div className="card" style={{ padding: '24px 16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <CalorieRing calories={calories} goal={goals.calories} size={172} />
          </div>

          {/* Protein bar */}
          <div style={{ marginTop: 20, padding: '0 4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>PROTEIN</span>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                {protein}g <span style={{ color: 'var(--text-tertiary)' }}>/ {goals.protein}g</span>
              </span>
            </div>
            <div className="prog-track">
              <div className="prog-fill"
                style={{
                  width: `${proteinPct}%`,
                  background: proteinPct >= 100 ? 'var(--success)' : proteinPct >= 66 ? 'var(--warning)' : 'var(--accent)',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Weight card */}
      <div className="section">
        <div className="card">
          <div className="list-row">
            <span style={{ fontSize: 20 }}>⚖️</span>
            <span className="list-row-label">Weight today</span>
            {weight ? (
              <button className="btn-ghost" style={{ fontSize: 15, fontWeight: 600, background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
                onClick={() => { setWeightVal(String(weight)); setEditWeight(true) }}>
                {weight} lbs
              </button>
            ) : (
              <button className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: 14 }}
                onClick={() => setEditWeight(true)}>
                + Log weight
              </button>
            )}
          </div>
          {editWeight && (
            <div style={{ padding: '0 16px 14px', display: 'flex', gap: 8 }}>
              <input className="input" type="number" inputMode="decimal" placeholder="lbs"
                value={weightVal} onChange={e => setWeightVal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveWeight()}
                autoFocus style={{ flex: 1 }} />
              <button className="btn btn-primary" style={{ padding: '10px 16px' }} onClick={saveWeight}>Save</button>
              <button className="btn btn-secondary" style={{ padding: '10px 16px' }} onClick={() => setEditWeight(false)}>✕</button>
            </div>
          )}
        </div>
      </div>

      {/* Food Log */}
      <div className="section">
        <div className="section-label">Today's Log</div>
        <div className="card">
          {entries.length === 0 ? (
            <div className="list-row" style={{ color: 'var(--text-tertiary)', fontSize: 15, justifyContent: 'center' }}>
              Nothing logged yet — tap + to add
            </div>
          ) : (
            entries.map(entry => (
              <div key={entry.id} className="list-row">
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15 }}>{entry.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                    {entry.calories} cal · {entry.protein}g protein
                  </div>
                </div>
                <button onClick={() => removeFoodEntry(today(), entry.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', fontSize: 18, padding: 4, cursor: 'pointer', minWidth: 32, minHeight: 32 }}>
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* FAB */}
      <button className="fab" onClick={() => setShowAdd(true)} aria-label="Add food">
        +
      </button>

      {showAdd && <QuickAddSheet onClose={() => setShowAdd(false)} />}
    </div>
  )
}
