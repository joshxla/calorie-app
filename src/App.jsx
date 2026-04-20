import { useState, useEffect } from 'react'
import BottomNav from './components/BottomNav'
import Today     from './pages/Today'
import Week      from './pages/Week'
import History   from './pages/History'
import AIChat    from './pages/AIChat'
import useStore  from './store/useStore'
import './styles/global.css'

export default function App() {
  const [tab, setTab] = useState('today')
  const { syncDay }   = useStore()

  // Sync today's food log from the API on app load
  useEffect(() => {
    const today = new Date().toLocaleDateString('sv-SE')
    syncDay(today)
  }, [])

  return (
    <div className="app">
      <main>
        {tab === 'today'   && <Today   />}
        {tab === 'week'    && <Week    />}
        {tab === 'history' && <History />}
        {tab === 'ai'      && <AIChat  />}
      </main>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  )
}
