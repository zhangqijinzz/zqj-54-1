export type Category = 'self-intro' | 'project' | 'conflict' | 'resignation'
export type StructureType = 'STAR' | 'compare' | 'conclusion-first'
export type Difficulty = 1 | 2 | 3
export type TimeLimit = 30 | 60 | 90
export type MockExamQuestionCount = 3 | 5 | 8
export type MockExamTotalTime = 3 | 5 | 8 | 10

export interface Question {
  id: string
  category: Category
  text: string
  difficulty: Difficulty
  suggestedStructure: StructureType
  structureHints: string[]
  examplePoints: string[]
}

export interface PracticeRecord {
  id: string
  questionId: string
  answer: string
  timeLimit: TimeLimit
  actualTime: number
  isTimeout: boolean
  stuckCount: number
  completedAt: string
}

export interface WeakPoint {
  questionId: string
  stuckCount: number
  lastPracticeAt: string
  isMastered: boolean
}

export interface PracticeStats {
  totalPractices: number
  categoryStats: Record<string, { count: number; stuckRate: number }>
  streakDays: number
}

export interface MockExamQuestionResult {
  questionId: string
  answer: string
  actualTime: number
  isTimeout: boolean
  stuckCount: number
  order: number
}

export interface MockExamRecord {
  id: string
  questionCount: MockExamQuestionCount
  totalTimeLimit: MockExamTotalTime
  questions: string[]
  results: MockExamQuestionResult[]
  totalActualTime: number
  totalStuckCount: number
  timeoutCount: number
  overallScore: number
  completedAt: string
}

export interface MockExamStats {
  totalExams: number
  averageScore: number
  averageStuckCount: number
  averageTimeoutRate: number
  recentTrend: number[]
}

export const CATEGORY_CONFIG: Record<Category, { label: string; color: string; icon: string }> = {
  'self-intro': { label: '自我介绍', color: '#6366f1', icon: 'User' },
  'project': { label: '项目经历', color: '#f59e0b', icon: 'FolderKanban' },
  'conflict': { label: '冲突处理', color: '#ef4444', icon: 'Swords' },
  'resignation': { label: '离职原因', color: '#10b981', icon: 'DoorOpen' },
}

export const STRUCTURE_CONFIG: Record<StructureType, { label: string; steps: string[]; description: string }> = {
  'STAR': {
    label: 'STAR 法则',
    steps: ['S - 情境：描述当时的背景和情境', 'T - 任务：你面临的具体任务或挑战', 'A - 行动：你采取了哪些具体行动', 'R - 结果：最终取得了什么成果'],
    description: '适用于项目经历和冲突处理类问题，用具体案例展示能力',
  },
  'compare': {
    label: '对比法',
    steps: ['过去状态：描述之前的情况或限制', '期望方向：说明你追求的目标或价值', '行动转变：你做出的关键改变', '当前收获：改变后带来的积极影响'],
    description: '适用于离职原因类问题，用前后对比展现成长意愿',
  },
  'conclusion-first': {
    label: '结论前置',
    steps: ['核心标签：一句话亮出最核心的身份标签', '分层展开：按维度逐层展开（经历/能力/特质）', '证据支撑：每个维度用1-2个具体事实佐证', '价值呼应：回归到对目标岗位的价值匹配'],
    description: '适用于自我介绍类问题，先给结论再展开，快速建立印象',
  },
}

export const TIME_LIMIT_OPTIONS: { value: TimeLimit; label: string }[] = [
  { value: 30, label: '30秒' },
  { value: 60, label: '60秒' },
  { value: 90, label: '90秒' },
]

export const MOCK_EXAM_QUESTION_COUNT_OPTIONS: { value: MockExamQuestionCount; label: string }[] = [
  { value: 3, label: '3题' },
  { value: 5, label: '5题' },
  { value: 8, label: '8题' },
]

export const MOCK_EXAM_TOTAL_TIME_OPTIONS: { value: MockExamTotalTime; label: string }[] = [
  { value: 3, label: '3分钟' },
  { value: 5, label: '5分钟' },
  { value: 8, label: '8分钟' },
  { value: 10, label: '10分钟' },
]

export const MOCK_EXAM_CATEGORY_RATIO: Record<Category, number> = {
  'self-intro': 1,
  'project': 2,
  'conflict': 1,
  'resignation': 1,
}
