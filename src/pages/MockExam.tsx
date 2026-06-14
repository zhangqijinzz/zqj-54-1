import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, AlertOctagon, Send, Clock, AlertTriangle, CheckCircle, Flame, ArrowRight, Home, FileText, RotateCcw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore, generateId, createMockExamRecord, getMockExamOverallEvaluation } from '@/store/useStore'
import { questions } from '@/data/questions'
import {
  CATEGORY_CONFIG,
  MOCK_EXAM_QUESTION_COUNT_OPTIONS,
  MOCK_EXAM_TOTAL_TIME_OPTIONS,
  MockExamQuestionCount,
  MockExamTotalTime,
  MockExamQuestionResult,
  Question,
} from '@/data/types'
import QuestionCard from '@/components/QuestionCard'

type Phase = 'config' | 'ready' | 'answering' | 'report'

export default function MockExam() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>('config')
  const [questionCount, setQuestionCount] = useState<MockExamQuestionCount>(5)
  const [totalTimeLimit, setTotalTimeLimit] = useState<MockExamTotalTime>(5)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [examQuestions, setExamQuestions] = useState<string[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [results, setResults] = useState<MockExamQuestionResult[]>([])
  const [answer, setAnswer] = useState('')
  const [stuckCount, setStuckCount] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const startTimeRef = useRef<number>(0)
  const timerIntervalRef = useRef<number | null>(null)
  const overallStartTimeRef = useRef<number>(0)

  const { generateMockExamPaper, addMockExamRecord } = useStore()

  const perQuestionTime = Math.round((totalTimeLimit * 60) / questionCount)
  const totalQuestions = examQuestions.length
  const remainingQuestions = totalQuestions - currentQuestionIndex - 1

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [])

  const handleStartExam = useCallback(() => {
    const paper = generateMockExamPaper(questionCount)
    setExamQuestions(paper)
    setResults([])
    setCurrentQuestionIndex(0)
    overallStartTimeRef.current = Date.now()
    if (paper.length > 0) {
      const q = questions.find((q) => q.id === paper[0])
      if (q) {
        setCurrentQuestion(q)
        setAnswer('')
        setStuckCount(0)
        setElapsedTime(0)
        setPhase('ready')
      }
    }
  }, [questionCount, generateMockExamPaper])

  const handleBeginAnswer = useCallback(() => {
    setPhase('answering')
    setIsTimerRunning(true)
    startTimeRef.current = Date.now()
    setElapsedTime(0)

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
    }
    timerIntervalRef.current = window.setInterval(() => {
      const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000)
      setElapsedTime(elapsed)
    }, 100)
  }, [])

  const handleSubmitQuestion = useCallback(() => {
    setIsTimerRunning(false)
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }

    const actualTime = Math.round((Date.now() - startTimeRef.current) / 1000)
    const result: MockExamQuestionResult = {
      questionId: currentQuestion!.id,
      answer,
      actualTime,
      isTimeout: actualTime >= perQuestionTime,
      stuckCount,
      order: currentQuestionIndex,
    }

    const newResults = [...results, result]
    setResults(newResults)

    if (currentQuestionIndex < examQuestions.length - 1) {
      const nextIndex = currentQuestionIndex + 1
      setCurrentQuestionIndex(nextIndex)
      const nextQ = questions.find((q) => q.id === examQuestions[nextIndex])
      if (nextQ) {
        setCurrentQuestion(nextQ)
        setAnswer('')
        setStuckCount(0)
        setElapsedTime(0)
        setPhase('ready')
      }
    } else {
      const record = createMockExamRecord(
        questionCount,
        totalTimeLimit,
        examQuestions,
        newResults
      )
      addMockExamRecord(record)
      setPhase('report')
    }
  }, [currentQuestion, answer, stuckCount, perQuestionTime, currentQuestionIndex, results, examQuestions, questionCount, totalTimeLimit, addMockExamRecord])

  const handleStuck = useCallback(() => {
    setStuckCount((prev) => prev + 1)
  }, [])

  const handleTimeUp = useCallback(() => {
    handleSubmitQuestion()
  }, [handleSubmitQuestion])

  useEffect(() => {
    if (isTimerRunning && elapsedTime >= perQuestionTime) {
      handleTimeUp()
    }
  }, [isTimerRunning, elapsedTime, perQuestionTime, handleTimeUp])

  const handleRestart = useCallback(() => {
    setPhase('config')
    setCurrentQuestionIndex(0)
    setExamQuestions([])
    setCurrentQuestion(null)
    setResults([])
    setAnswer('')
    setStuckCount(0)
    setElapsedTime(0)
  }, [])

  const progress = 1 - elapsedTime / perQuestionTime
  const radius = 60
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress)

  const getTimerColor = () => {
    if (progress > 0.5) return '#00e676'
    if (progress > 0.25) return '#ff6b35'
    return '#ff1744'
  }

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60)
    const secs = s % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getFinalRecord = () => {
    if (results.length !== examQuestions.length) return null
    return createMockExamRecord(questionCount, totalTimeLimit, examQuestions, results)
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      <div className="max-w-6xl mx-auto p-6">
        {phase === 'config' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-white text-2xl font-bold mb-2">模拟面试</h2>
              <p className="text-white/40 text-sm">模拟真实面试环境，连续作答，体验完整面试流程</p>
            </div>

            <div className="bg-[#1a1a2e] rounded-2xl border border-white/5 p-6 space-y-6">
              <div>
                <p className="text-white/60 text-sm font-medium mb-3">选择题目数量</p>
                <div className="grid grid-cols-3 gap-3">
                  {MOCK_EXAM_QUESTION_COUNT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setQuestionCount(opt.value)}
                      className={`py-4 rounded-xl text-lg font-bold transition-all duration-200 ${
                        questionCount === opt.value
                          ? 'bg-[#ff6b35] text-white shadow-lg shadow-[#ff6b35]/20'
                          : 'bg-white/5 text-white/50 hover:bg-white/10'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-white/60 text-sm font-medium mb-3">选择总时长</p>
                <div className="grid grid-cols-4 gap-3">
                  {MOCK_EXAM_TOTAL_TIME_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setTotalTimeLimit(opt.value)}
                      className={`py-4 rounded-xl text-lg font-bold transition-all duration-200 ${
                        totalTimeLimit === opt.value
                          ? 'bg-[#ff6b35] text-white shadow-lg shadow-[#ff6b35]/20'
                          : 'bg-white/5 text-white/50 hover:bg-white/10'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-white/60 text-sm mb-2">本次组卷说明</p>
                <div className="space-y-1">
                  <p className="text-white/40 text-xs">• 从四个分类按比例随机抽取题目</p>
                  <p className="text-white/40 text-xs">• 每题平均答题时间：{perQuestionTime}秒</p>
                  <p className="text-white/40 text-xs">• 答题过程中不展示结构提示</p>
                  <p className="text-white/40 text-xs">• 不可回退上一题，全部完成后统一出分</p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStartExam}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#ff6b35] to-[#ff3d00] text-white font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-[#ff6b35]/20 hover:shadow-[#ff6b35]/30 transition-shadow"
              >
                <Play className="w-5 h-5" />
                开始模拟面试
              </motion.button>
            </div>
          </motion.div>
        )}

        {(phase === 'ready' || phase === 'answering') && currentQuestion && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-white/40 text-sm">第 {currentQuestionIndex + 1} / {totalQuestions} 题</span>
                <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#ff6b35]"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-white/40 text-sm">剩余 {remainingQuestions} 题</span>
            </div>

            {phase === 'ready' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center space-y-6"
              >
                <div className="py-6">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.1 }}
                  >
                    <QuestionCard question={currentQuestion} />
                  </motion.div>
                </div>

                <div className="text-center">
                  <p className="text-white/40 text-sm mb-2">
                    本题建议答题时间：<span className="text-[#ff6b35] font-bold">{perQuestionTime}秒</span>
                  </p>
                  <p className="text-white/30 text-xs">准备好了吗？点击开始后计时立即启动</p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBeginAnswer}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#ff6b35] to-[#ff3d00] text-white font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-[#ff6b35]/20"
                >
                  <Play className="w-5 h-5" />
                  开始作答
                </motion.button>
              </motion.div>
            )}

            {phase === 'answering' && (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="relative flex items-center justify-center">
                    <svg width="160" height="160" className="transform -rotate-90">
                      <circle cx="80" cy="80" r={radius} fill="none" stroke="#2d2d44" strokeWidth="6" />
                      <motion.circle
                        cx="80"
                        cy="80"
                        r={radius}
                        fill="none"
                        stroke={getTimerColor()}
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        style={{ filter: `drop-shadow(0 0 6px ${getTimerColor()}40)` }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <AnimatePresence mode="popLayout">
                        <motion.span
                          key={elapsedTime}
                          initial={{ scale: 1.1, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="font-mono text-3xl font-bold tracking-wider"
                          style={{ color: getTimerColor(), fontFamily: 'JetBrains Mono, monospace' }}
                        >
                          {formatTime(elapsedTime)}
                        </motion.span>
                      </AnimatePresence>
                      <span className="text-white/30 text-xs mt-1">/ {formatTime(perQuestionTime)}</span>
                    </div>
                    {elapsedTime >= perQuestionTime - 5 && elapsedTime < perQuestionTime && (
                      <motion.div
                        className="absolute inset-0 rounded-full border-4 border-[#ff1744]"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      />
                    )}
                  </div>
                </div>

                <QuestionCard question={currentQuestion} />

                <div className="space-y-4">
                  <div className="relative">
                    <textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="在此输入你的回答..."
                      className="w-full h-48 bg-[#1e1e30] border border-white/10 rounded-xl p-4 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#ff6b35]/50 resize-none transition-colors"
                    />
                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                      <span className="text-white/20 text-xs">{answer.length}字</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleStuck}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#ff1744]/10 text-[#ff1744] text-sm font-medium hover:bg-[#ff1744]/20 transition-colors"
                    >
                      <AlertOctagon className="w-4 h-4" />
                      卡壳了 ({stuckCount})
                    </motion.button>
                    <div className="flex-1" />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubmitQuestion}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00e676]/15 text-[#00e676] text-sm font-bold hover:bg-[#00e676]/25 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      {remainingQuestions > 0 ? '提交并下一题' : '提交并完成'}
                    </motion.button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {phase === 'report' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {(() => {
              const record = getFinalRecord()
              if (!record) return null
              const evaluation = getMockExamOverallEvaluation(record.overallScore)

              return (
                <>
                  <div className="text-center space-y-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.2 }}
                      className="w-24 h-24 rounded-full mx-auto flex items-center justify-center"
                      style={{
                        backgroundColor: record.overallScore >= 75 ? '#00e67620' : record.overallScore >= 60 ? '#ff6b3520' : '#ff174420',
                      }}
                    >
                      {record.overallScore >= 75 ? (
                        <CheckCircle className="w-12 h-12 text-[#00e676]" />
                      ) : record.overallScore >= 60 ? (
                        <Flame className="w-12 h-12 text-[#ff6b35]" />
                      ) : (
                        <AlertTriangle className="w-12 h-12 text-[#ff1744]" />
                      )}
                    </motion.div>
                    <h2 className="text-white text-3xl font-bold">
                      综合得分：<span style={{ color: record.overallScore >= 75 ? '#00e676' : record.overallScore >= 60 ? '#ff6b35' : '#ff1744' }}>{record.overallScore}</span>
                    </h2>
                    <p className="text-white/60 text-sm">{evaluation}</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-[#1a1a2e] rounded-2xl border border-white/5 p-4 text-center"
                    >
                      <Clock className="w-5 h-5 text-white/40 mx-auto mb-2" />
                      <p className="text-white text-xl font-bold">{formatTime(record.totalActualTime)}</p>
                      <p className="text-white/30 text-xs">总用时 / {totalTimeLimit}分钟</p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-[#1a1a2e] rounded-2xl border border-white/5 p-4 text-center"
                    >
                      <FileText className="w-5 h-5 text-white/40 mx-auto mb-2" />
                      <p className="text-white text-xl font-bold">{record.questionCount}</p>
                      <p className="text-white/30 text-xs">总题数</p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-[#1a1a2e] rounded-2xl border border-white/5 p-4 text-center"
                    >
                      <Flame className="w-5 h-5 text-[#ff6b35] mx-auto mb-2" />
                      <p className="text-white text-xl font-bold">{record.totalStuckCount}</p>
                      <p className="text-white/30 text-xs">总卡壳次数</p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-[#1a1a2e] rounded-2xl border border-white/5 p-4 text-center"
                    >
                      <AlertTriangle className="w-5 h-5 text-[#ff1744] mx-auto mb-2" />
                      <p className="text-white text-xl font-bold">{record.timeoutCount}</p>
                      <p className="text-white/30 text-xs">超时题数</p>
                    </motion.div>
                  </div>

                  <div className="bg-[#1a1a2e] rounded-2xl border border-white/5 p-5 space-y-4">
                    <p className="text-white/60 text-sm font-medium">每道题详情</p>
                    <div className="space-y-3">
                      {record.results.map((result, i) => {
                        const q = questions.find((q) => q.id === result.questionId)
                        if (!q) return null
                        const catConfig = CATEGORY_CONFIG[q.category]
                        return (
                          <motion.div
                            key={result.questionId}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 * i }}
                            className="bg-white/5 rounded-xl p-4"
                          >
                            <div className="flex items-start gap-4">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                style={{ backgroundColor: `${catConfig.color}15` }}
                              >
                                <span className="text-xs font-bold" style={{ color: catConfig.color }}>
                                  {i + 1}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium mb-2">{q.text}</p>
                                <div className="flex items-center gap-3 flex-wrap">
                                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${catConfig.color}15`, color: catConfig.color }}>
                                    {catConfig.label}
                                  </span>
                                  <span className="text-white/40 text-xs">
                                    用时：{result.actualTime}s / {perQuestionTime}s
                                  </span>
                                  {result.isTimeout && (
                                    <span className="text-[#ff1744] text-xs">超时</span>
                                  )}
                                  {result.stuckCount > 0 && (
                                    <span className="text-[#ff6b35] text-xs">卡壳×{result.stuckCount}</span>
                                  )}
                                </div>
                              </div>
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                style={{ backgroundColor: result.isTimeout ? '#ff174415' : result.stuckCount > 0 ? '#ff6b3515' : '#00e67615' }}
                              >
                                {result.isTimeout ? (
                                  <AlertTriangle className="w-4 h-4 text-[#ff1744]" />
                                ) : result.stuckCount > 0 ? (
                                  <Flame className="w-4 h-4 text-[#ff6b35]" />
                                ) : (
                                  <CheckCircle className="w-4 h-4 text-[#00e676]" />
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/')}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 text-white/70 text-sm font-medium hover:bg-white/10 transition-colors"
                    >
                      <Home className="w-4 h-4" />
                      返回首页
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/mock-exam/records')}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 text-white/70 text-sm font-medium hover:bg-white/10 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      查看历史
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleRestart}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#ff6b35] text-white text-sm font-bold hover:bg-[#ff5722] transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      再来一次
                    </motion.button>
                  </div>
                </>
              )
            })()}
          </motion.div>
        )}
      </div>
    </div>
  )
}
