// Date helpers
export const toISODate = (d = new Date()) =>
  d.toLocaleDateString('sv-SE')

export const today = () => toISODate()

export const formatDate = (iso, opts = {}) => {
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', ...opts })
}

export const formatDay = (iso) => {
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short' })
}

export const getWeekDates = (referenceDate = new Date()) => {
  const d = new Date(referenceDate)
  const day = d.getDay()              // 0 = Sun
  const monday = new Date(d)
  monday.setDate(d.getDate() - ((day + 6) % 7))  // shift to Mon

  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(monday)
    dt.setDate(monday.getDate() + i)
    return toISODate(dt)
  })
}

// Stats helpers
export const avg = (arr) =>
  arr.length === 0 ? 0 : Math.round(arr.reduce((s, v) => s + v, 0) / arr.length)

export const clamp = (val, min, max) => Math.min(Math.max(val, min), max)

export const pct = (value, total) =>
  total === 0 ? 0 : clamp(Math.round((value / total) * 100), 0, 100)

// Color helpers
export const calColor = (calories, goal) => {
  const ratio = calories / goal
  if (ratio > 1.15) return 'var(--danger)'
  if (ratio > 1.0)  return 'var(--warning)'
  if (ratio >= 0.9) return 'var(--success)'
  return 'var(--accent)'
}

export const greet = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

// Parse <log>{...}</log> blocks from AI response
export const parseLogBlock = (text) => {
  const match = text.match(/<log>([\s\S]*?)<\/log>/)
  if (!match) return null
  try {
    return JSON.parse(match[1].trim())
  } catch {
    return null
  }
}

export const stripLogBlock = (text) =>
  text.replace(/<log>[\s\S]*?<\/log>/g, '').trim()
