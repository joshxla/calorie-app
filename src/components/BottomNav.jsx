export default function BottomNav({ active, onChange }) {
  const tabs = [
    { id: 'today',   icon: '◎',  label: 'Today'   },
    { id: 'week',    icon: '▦',  label: 'Week'    },
    { id: 'history', icon: '≡',  label: 'All Time' },
    { id: 'ai',      icon: '✦',  label: 'AI'      },
  ]

  return (
    <nav className="bottom-nav" role="tablist">
      {tabs.map(t => (
        <button
          key={t.id}
          role="tab"
          aria-selected={active === t.id}
          className={`nav-btn${active === t.id ? ' active' : ''}`}
          onClick={() => onChange(t.id)}
        >
          <span className="nav-icon" aria-hidden>{t.icon}</span>
          <span className="nav-label">{t.label}</span>
        </button>
      ))}
    </nav>
  )
}
