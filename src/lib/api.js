// Hetzner food-log API client
const BASE_URL = import.meta.env.VITE_FOOD_API_URL || 'http://62.238.2.195:3001'
const API_KEY  = import.meta.env.VITE_FOOD_API_KEY || ''

const authHeaders = {
  'Content-Type': 'application/json',
  'x-api-key': API_KEY,
}

/**
 * Fetch all food entries + totals for a given date.
 * Returns: { date, logs: [{ id, name, calories, protein, timestamp }], totals: { calories, protein } }
 */
export async function fetchDay(date) {
  const res = await fetch(`${BASE_URL}/api/log-food?date=${date}`, {
    headers: authHeaders,
  })
  if (!res.ok) throw new Error(`fetchDay failed: ${res.status}`)
  return res.json()
}

/**
 * Add a food entry.
 * entry: { name, calories, protein, date }
 * Returns: { success, entry, totals, message }
 */
export async function addEntry(entry) {
  const res = await fetch(`${BASE_URL}/api/log-food`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(entry),
  })
  if (!res.ok) throw new Error(`addEntry failed: ${res.status}`)
  return res.json()
}

/**
 * Delete all food entries for a given date.
 * Returns: { success, deleted }
 */
export async function clearDay(date) {
  const res = await fetch(`${BASE_URL}/api/log-food?date=${date}`, {
    method: 'DELETE',
    headers: authHeaders,
  })
  if (!res.ok) throw new Error(`clearDay failed: ${res.status}`)
  return res.json()
}
