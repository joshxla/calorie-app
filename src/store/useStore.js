import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SEED_LOGS } from '../lib/seedData'
import { RECURRING_FOODS } from '../lib/foods'
import { today as getToday } from '../lib/utils'

const useStore = create(
  persist(
    (set, get) => ({
      // ── State ────────────────────────────────────────────────────────────
      logs: [],
      goals: { calories: 1500, protein: 150 },
      foods: RECURRING_FOODS,
      initialized: false,

      // ── Bootstrap ────────────────────────────────────────────────────────
      initialize: () => {
        if (!get().initialized) {
          set({ logs: SEED_LOGS, initialized: true })
        }
      },

      // ── Selectors ────────────────────────────────────────────────────────
      getLog: (date) => get().logs.find(l => l.date === date) || null,

      getTodayLog: () => get().logs.find(l => l.date === getToday()) || null,

      getWeekLogs: (dates) =>
        dates.map(date => get().logs.find(l => l.date === date) || { date, calories: 0, protein: 0, weight: null, bf: null, notes: '', foodEntries: [] }),

      // ── Mutations ────────────────────────────────────────────────────────

      // Upsert a day log (for historical edits or weight/bf only)
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

      // Add a food entry to a day (recalculates totals from entries)
      addFoodEntry: (date, entry) => {
        set(state => {
          const idx = state.logs.findIndex(l => l.date === date)
          const newEntry = { ...entry, id: Date.now() }

          if (idx >= 0) {
            const newLogs = [...state.logs]
            const log = { ...newLogs[idx] }
            const entries = [...(log.foodEntries || []), newEntry]
            log.foodEntries = entries
            // Recalculate totals from food entries only if they exist
            log.calories = entries.reduce((s, e) => s + (e.calories || 0), 0)
            log.protein  = entries.reduce((s, e) => s + (e.protein  || 0), 0)
            newLogs[idx] = log
            return { logs: newLogs }
          }

          return {
            logs: [
              ...state.logs,
              {
                date,
                calories: entry.calories || 0,
                protein:  entry.protein  || 0,
                weight: null, bf: null, notes: '',
                foodEntries: [newEntry],
              },
            ].sort((a, b) => a.date.localeCompare(b.date)),
          }
        })
      },

      // Remove a food entry by id
      removeFoodEntry: (date, entryId) => {
        set(state => {
          const idx = state.logs.findIndex(l => l.date === date)
          if (idx < 0) return state
          const newLogs = [...state.logs]
          const log = { ...newLogs[idx] }
          const entries = (log.foodEntries || []).filter(e => e.id !== entryId)
          log.foodEntries = entries
          log.calories = entries.reduce((s, e) => s + (e.calories || 0), log.calories)
          log.protein  = entries.reduce((s, e) => s + (e.protein  || 0), 0)
          // If all entries removed, keep manual total from before
          if (entries.length === 0) {
            log.calories = 0
            log.protein  = 0
          } else {
            log.calories = entries.reduce((s, e) => s + (e.calories || 0), 0)
            log.protein  = entries.reduce((s, e) => s + (e.protein  || 0), 0)
          }
          newLogs[idx] = log
          return { logs: newLogs }
        })
      },

      // Add a custom recurring food
      addCustomFood: (food) => {
        set(state => ({
          foods: [...state.foods, { ...food, id: Date.now() }],
        }))
      },

      setGoals: (goals) => set({ goals }),
    }),
    { name: 'calorie-tracker-v1' }
  )
)

export default useStore
