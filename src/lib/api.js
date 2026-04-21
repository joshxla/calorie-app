// Food-log API client — hits the Netlify proxy (server-side) so auth stays
// off the client and we avoid mixed-content blocking on the HTTP origin.
const BASE_URL = '/.netlify/functions/food-proxy'
const jsonHeaders = { 'Content-Type': 'application/json' }

/**
 * Fetch all food entries + totals for a given date.
 * Returns: { date, logs: [{ id, name, calories, protein, timestamp }], totals: { calories, protein } }
 */
export async function fetchDay(date) {
  const res = await fetch(`${BASE_URL}?date=${encodeURIComponent(date)}`)
  if (!res.ok) throw new Error(`fetchDay failed: ${res.status}`)
  return res.json()
}

/**
 * Add a food entry.
 * entry: { name, calories, protein, date }
 * Returns: { success, entry, totals, message }
 */
export async function addEntry(entry) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: jsonHeaders,
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
  const res = await fetch(`${BASE_URL}?date=${encodeURIComponent(date)}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error(`clearDay failed: ${res.status}`)
  return res.json()
}
