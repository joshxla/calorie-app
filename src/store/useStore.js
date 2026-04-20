import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { RECURRING_FOODS } from '../lib/foods'
import { fetchDay, addEntry, clearDay } from '../lib/api'

const useStore = create(
  persist(
    (set, get) => ({
      // ── State ────────────────────────────────────────────────────────────
      logs: [],
      goals: { calories: 1500, protein: 150 },
      foods: RECURRING_FOODS,

      // ── Selectors ────────────────────────────────────────────────────────
      getLog: (date) => get().logs.find(l => l.date === date) || null,

      getTodayLog: () => {
        const today = new Date().toLocaleDateString('sv-SE')
        return get().logs.find(l => l.date === today) || null
      },

      getWeekLogs: (dates) =>
        dates.map(date => get().logs.find(l => l.date === date) || {
          date, calories: 0, protein: 0, weight: null, bf: null, notes: '', foodEntries: [],
        }),

      // ── Upsert (for weight/bf/notes — local only) ────────────────────────
      upsertLog: (date, updates) => {
        set(state => {
          const idx = state.logs.findIndex(l => l.date === date)
          if (idx >= 0) {
            const newLogs = [...state.logs]
            newLogs[idx] = { ...newLogs[idx], ...updates }
            return { logs: newLogs }
          }
          return {
            logs: [
              ...state.logs,
              { date, calories: 0, protein: 0, weight: null, bf: null, notes: '', foodEntries: [], ...updates },
            ].sort((a, b) => a.date.localeCompare(b.date)),
          }
        })
      },

      // ── Sync a day's food entries from the API ────────────────────────────
      syncDay: async (date) => {
        try {
          const data = await fetchDay(date)
          // data = { date, logs: [...], totals: { calories, protein } }
          const foodEntries = data.logs.map(e => ({
            id: e.id,
            name: e.name,
            calories: e.calories,
            protein: e.protein,
          }))
          set(state => {
            const idx = state.logs.findIndex(l => l.date === date)
            const patch = {
              date,
              foodEntries,
              calories: data.totals.calories,
              protein: data.totals.protein,
            }
            if (idx >= 0) {
              const newLogs = [...state.logs]
              newLogs[idx] = { ...newLogs[idx], ...patch }
              return { logs: newLogs }
            }
            return {
              logs: [
                ...state.logs,
                { weight: null, bf: null, notes: '', ...patch },
              ].sort((a, b) => a.date.localeCompare(b.date)),
            }
          })
        } catch (err) {
          console.error('[food-api] syncDay failed:', err)
        }
      },

      // ── Add a food entry (POST to API, then sync) ────────────────────────
      addFoodEntry: async (date, entry) => {
        try {
          await addEntry({ name: entry.name, calories: entry.calories, protein: entry.protein, date })
          await get().syncDay(date)
        } catch (err) {
          console.error('[food-api] addFoodEntry failed:', err)
        }
      },

      // ── Remove a single food entry (clear day + re-add remaining) ────────
      removeFoodEntry: async (date, entryId) => {
        // Optimistically remove from local state first
        set(state => {
          const idx = state.logs.findIndex(l => l.date === date)
          if (idx < 0) return state
          const newLogs = [...state.logs]
          const log = { ...newLogs[idx] }
          const entries = (log.foodEntries || []).filter(e => e.id !== entryId)
          log.foodEntries = entries
          log.calories = entries.reduce((s, e) => s + (e.calories || 0), 0)
          log.protein  = entries.reduce((s, e) => s + (e.protein  || 0), 0)
          newLogs[idx] = log
          return { logs: newLogs }
        })

        // Persist: delete day then re-add remaining entries
        try {
          const remaining = (get().logs.find(l => l.date === date)?.foodEntries || [])
          await clearDay(date)
          for (const e of remaining) {
            await addEntry({ name: e.name, calories: e.calories, protein: e.protein, date })
          }
          await get().syncDay(date)
        } catch (err) {
          console.error('[food-api] removeFoodEntry failed:', err)
          // Re-sync to get authoritative state
          await get().syncDay(date)
        }
      },

      // ── Add a custom recurring food ───────────────────────────────────────
      addCustomFood: (food) => {
        set(state => ({
          foods: [...state.foods, { ...food, id: Date.now() }],
        }))
      },

      setGoals: (goals) => set({ goals }),
    }),
    { name: 'calorie-tracker-v2' }
  )
)

export default useStore
