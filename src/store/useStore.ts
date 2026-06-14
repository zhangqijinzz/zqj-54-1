import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  PracticeRecord,
  WeakPoint,
  TimeLimit,
  MockExamRecord,
  MockExamQuestionResult,
  MockExamQuestionCount,
  MockExamTotalTime,
  MockExamStats,
  MOCK_EXAM_CATEGORY_RATIO,
  Category,
} from '@/data/types'
import { questions } from '@/data/questions'

interface AppState {
  practiceRecords: PracticeRecord[]
  weakPoints: WeakPoint[]
  mockExamRecords: MockExamRecord[]

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

  addMockExamRecord: (record: MockExamRecord) => void
  getMockExamRecords: () => MockExamRecord[]
  getMockExamStats: () => MockExamStats
  generateMockExamPaper: (count: MockExamQuestionCount) => string[]
}

const getToday = () => new Date().toISOString().split('T')[0]

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      practiceRecords: [],
      weakPoints: [],
      mockExamRecords: [],

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

      addMockExamRecord: (record) =>
        set((state) => ({
          mockExamRecords: [record, ...state.mockExamRecords],
        })),

      getMockExamRecords: () => {
        return get().mockExamRecords
      },

      getMockExamStats: () => {
        const records = get().mockExamRecords
        const totalExams = records.length

        if (totalExams === 0) {
          return {
            totalExams: 0,
            averageScore: 0,
            averageStuckCount: 0,
            averageTimeoutRate: 0,
            recentTrend: [],
          }
        }

        const averageScore = Math.round(records.reduce((sum, r) => sum + r.overallScore, 0) / totalExams)
        const averageStuckCount = Math.round((records.reduce((sum, r) => sum + r.totalStuckCount, 0) / totalExams) * 10) / 10
        const averageTimeoutRate = Math.round((records.reduce((sum, r) => sum + r.timeoutCount, 0) / records.reduce((sum, r) => sum + r.questionCount, 0)) * 100)
        const recentTrend = records.slice(0, 10).map((r) => r.overallScore).reverse()

        return {
          totalExams,
          averageScore,
          averageStuckCount,
          averageTimeoutRate,
          recentTrend,
        }
      },

      generateMockExamPaper: (count) => {
        const totalRatio = Object.values(MOCK_EXAM_CATEGORY_RATIO).reduce((a, b) => a + b, 0)
        const categoryCounts: Record<string, number> = {}

        Object.entries(MOCK_EXAM_CATEGORY_RATIO).forEach(([cat, ratio]) => {
          categoryCounts[cat] = Math.max(1, Math.round((count * ratio) / totalRatio))
        })

        let allocated = Object.values(categoryCounts).reduce((a, b) => a + b, 0)
        while (allocated > count) {
          const maxCat = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0][0]
          categoryCounts[maxCat]--
          allocated = Object.values(categoryCounts).reduce((a, b) => a + b, 0)
        }
        while (allocated < count) {
          const minCat = Object.entries(categoryCounts).sort((a, b) => a[1] - b[1])[0][0]
          categoryCounts[minCat]++
          allocated = Object.values(categoryCounts).reduce((a, b) => a + b, 0)
        }

        const paper: string[] = []
        Object.entries(categoryCounts).forEach(([cat, num]) => {
          const categoryQuestions = questions.filter((q) => q.category === cat)
          const shuffled = [...categoryQuestions].sort(() => Math.random() - 0.5)
          const selected = shuffled.slice(0, num)
          paper.push(...selected.map((q) => q.id))
        })

        for (let i = paper.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[paper[i], paper[j]] = [paper[j], paper[i]]
        }

        return paper
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

export function createMockExamRecord(
  questionCount: MockExamQuestionCount,
  totalTimeLimit: MockExamTotalTime,
  questions: string[],
  results: MockExamQuestionResult[]
): MockExamRecord {
  const totalActualTime = results.reduce((sum, r) => sum + r.actualTime, 0)
  const totalStuckCount = results.reduce((sum, r) => sum + r.stuckCount, 0)
  const timeoutCount = results.filter((r) => r.isTimeout).length

  const timeScore = results.reduce((sum, r) => {
    const ratio = r.actualTime / (totalTimeLimit * 60 / questionCount)
    return sum + Math.max(0, 100 - Math.max(0, (ratio - 1) * 200))
  }, 0) / results.length

  const stuckScore = Math.max(0, 100 - totalStuckCount * 15)
  const timeoutScore = Math.max(0, 100 - timeoutCount * 25)
  const overallScore = Math.round(timeScore * 0.4 + stuckScore * 0.3 + timeoutScore * 0.3)

  return {
    id: generateId(),
    questionCount,
    totalTimeLimit,
    questions,
    results,
    totalActualTime,
    totalStuckCount,
    timeoutCount,
    overallScore,
    completedAt: new Date().toISOString(),
  }
}

export function getMockExamOverallEvaluation(score: number): string {
  if (score >= 90) return '优秀！你的面试表现非常出色，继续保持！'
  if (score >= 75) return '良好！整体表现不错，还有一些细节可以优化。'
  if (score >= 60) return '及格！基本能应对面试，但需要加强练习。'
  return '需要加油！建议针对卡壳的问题进行专项训练。'
}
