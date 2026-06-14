import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { PracticeRecord, WeakPoint, TimeLimit } from '@/data/types'
import { questions } from '@/data/questions'

interface AppState {
  practiceRecords: PracticeRecord[]
  weakPoints: WeakPoint[]

  addPracticeRecord: (record: PracticeRecord) => void
  addWeakPoint: (questionId: string) => void
  markMastered: (questionId: string) => void
  clearRecords: () => void
  getWeakPointsList: () => WeakPoint[]
  getStats: () => {
    totalPractices: number
    categoryStats: Record<string, { count: number; stuckRate: number }>
    streakDays: number
  }
  getTodayPracticeCount: () => number
}

const getToday = () => new Date().toISOString().split('T')[0]

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      practiceRecords: [],
      weakPoints: [],

      addPracticeRecord: (record) =>
        set((state) => ({
          practiceRecords: [record, ...state.practiceRecords],
        })),

      addWeakPoint: (questionId) =>
        set((state) => {
          const existing = state.weakPoints.find((wp) => wp.questionId === questionId)
          if (existing) {
            return {
              weakPoints: state.weakPoints.map((wp) =>
                wp.questionId === questionId
                  ? { ...wp, stuckCount: wp.stuckCount + 1, lastPracticeAt: new Date().toISOString(), isMastered: false }
                  : wp
              ),
            }
          }
          return {
            weakPoints: [
              { questionId, stuckCount: 1, lastPracticeAt: new Date().toISOString(), isMastered: false },
              ...state.weakPoints,
            ],
          }
        }),

      markMastered: (questionId) =>
        set((state) => ({
          weakPoints: state.weakPoints.map((wp) =>
            wp.questionId === questionId ? { ...wp, isMastered: true } : wp
          ),
        })),

      clearRecords: () => set({ practiceRecords: [], weakPoints: [] }),

      getWeakPointsList: () => {
        const state = get()
        return state.weakPoints
          .filter((wp) => !wp.isMastered)
          .sort((a, b) => b.stuckCount - a.stuckCount)
      },

      getStats: () => {
        const state = get()
        const records = state.practiceRecords
        const totalPractices = records.length

        const categoryStats: Record<string, { count: number; stuckCount: number }> = {}
        records.forEach((r) => {
          const q = questions.find((q) => q.id === r.questionId)
          if (q) {
            if (!categoryStats[q.category]) {
              categoryStats[q.category] = { count: 0, stuckCount: 0 }
            }
            categoryStats[q.category].count++
            if (r.stuckCount > 0) {
              categoryStats[q.category].stuckCount++
            }
          }
        })

        const formattedCategoryStats: Record<string, { count: number; stuckRate: number }> = {}
        Object.entries(categoryStats).forEach(([cat, data]) => {
          formattedCategoryStats[cat] = {
            count: data.count,
            stuckRate: data.count > 0 ? Math.round((data.stuckCount / data.count) * 100) : 0,
          }
        })

        const uniqueDays = new Set(records.map((r) => r.completedAt.split('T')[0]))
        const sortedDays = Array.from(uniqueDays).sort().reverse()
        let streakDays = 0
        const today = getToday()
        let checkDate = new Date(today)

        for (let i = 0; i < 365; i++) {
          const dateStr = checkDate.toISOString().split('T')[0]
          if (uniqueDays.has(dateStr)) {
            streakDays++
            checkDate.setDate(checkDate.getDate() - 1)
          } else if (i === 0) {
            checkDate.setDate(checkDate.getDate() - 1)
            continue
          } else {
            break
          }
        }

        return { totalPractices, categoryStats: formattedCategoryStats, streakDays }
      },

      getTodayPracticeCount: () => {
        const state = get()
        const today = getToday()
        return state.practiceRecords.filter((r) => r.completedAt.startsWith(today)).length
      },
    }),
    {
      name: 'interview-bomb-storage',
    }
  )
)

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

export function getRandomQuestion(category?: string) {
  const pool = category ? questions.filter((q) => q.category === category) : questions
  return pool[Math.floor(Math.random() * pool.length)]
}

export function createPracticeRecord(
  questionId: string,
  answer: string,
  timeLimit: TimeLimit,
  actualTime: number,
  stuckCount: number
): PracticeRecord {
  return {
    id: generateId(),
    questionId,
    answer,
    timeLimit,
    actualTime,
    isTimeout: actualTime >= timeLimit,
    stuckCount,
    completedAt: new Date().toISOString(),
  }
}
