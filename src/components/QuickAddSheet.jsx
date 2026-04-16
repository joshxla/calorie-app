import { useState } from 'react'
import useStore from '../store/useStore'
import { today } from '../lib/utils'

export default function QuickAddSheet({ onClose }) {
  const { foods, addFoodEntry, addCustomFood } = useStore()
  const [query,    setQuery]    = useState('')
  const [tab,      setTab]      = useState('search')   // 'search' | 'custom'
  const [name,     setName]     = useState('')
  const [calories, setCalories] = useState('')
  const [protein,  setProtein]  = useState('')

  const filtered = foods.filter(f =>
    f.name.toLowerCase().includes(query.toLowerCase())
  )

  const logFood = (food) => {
    addFoodEntry(today(), { name: food.name, calories: food.calories, protein: food.protein })
    onClose()
  }

  const logCustom = () => {
    const cal = parseInt(calories) || 0
    const pro = parseInt(protein)  || 0
    if (!name.trim() && !cal) return
    const food = { name: name.trim() || 'Custom entry', calories: cal, protein: pro }
    addFoodEntry(today(), food)
    // Offer to save to library
    if (name.trim()) addCustomFood(food)
    onClose()
  }

  return (
    <div className="sheet-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sheet">
        <div className="sheet-handle" />
        <div className="sheet-title">Add Food</div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, padding: '0 20px 12px', flexShrink: 0 }}>
          {['search', 'custom'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '8px 0', border: 'none',
                background: tab === t ? 'var(--accent)' : 'var(--bg-elevated)',
                color: tab === t ? '#fff' : 'var(--text-secondary)',
                fontWeight: 500, fontSize: 14,
                borderRadius: t === 'search' ? '8px 0 0 8px' : '0 8px 8px 0',
                borderRight: t === 'search' ? '1px solid var(--border)' : 'none',
                cursor: 'pointer',
              }}>
              {t === 'search' ? '🔍 My Foods' : '✏️ Custom'}
            </button>
          ))}
        </div>

        <div className="sheet-body" style={{ padding: '0 20px' }}>
          {tab === 'search' ? (
            <>
              <input className="input" placeholder="Search foods…"
                value={query} onChange={e => setQuery(e.target.value)}
                style={{ marginBottom: 12 }}
                autoFocus
              />
              <div className="card">
                {filtered.length === 0 && (
                  <div className="list-row" style={{ color: 'var(--text-tertiary)', fontSize: 14 }}>
                    No matches — try the Custom tab
                  </div>
                )}
                {filtered.map(food => (
                  <button key={food.id} className="list-row"
                    style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                    onClick={() => logFood(food)}>
                    <span className="list-row-label">{food.name}</span>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{food.calories} cal</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{food.protein}g protein</div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input className="input" placeholder="Food name (optional)"
                value={name} onChange={e => setName(e.target.value)} />
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Calories</label>
                  <input className="input" type="number" inputMode="numeric" placeholder="0"
                    value={calories} onChange={e => setCalories(e.target.value)} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Protein (g)</label>
                  <input className="input" type="number" inputMode="numeric" placeholder="0"
                    value={protein} onChange={e => setProtein(e.target.value)} />
                </div>
              </div>
              <button className="btn btn-primary btn-full" onClick={logCustom}>
                Log Entry
              </button>
              <p style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center' }}>
                Named entries are auto-saved to My Foods
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
