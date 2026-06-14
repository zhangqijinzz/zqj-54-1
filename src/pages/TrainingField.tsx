import { useState, useCallback, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shuffle, Play, AlertOctagon, Send, CheckCircle2 } from 'lucide-react'
import Timer from '@/components/Timer'
import QuestionCard from '@/components/QuestionCard'
import StructureHint from '@/components/StructureHint'
import ResultModal from '@/components/ResultModal'
import { useStore, getRandomQuestion, createPracticeRecord } from '@/store/useStore'
import { questions } from '@/data/questions'
import { CATEGORY_CONFIG, TIME_LIMIT_OPTIONS, TimeLimit, Question } from '@/data/types'

type Phase = 'select' | 'ready' | 'answering' | 'result'

export default function TrainingField() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [phase, setPhase] = useState<Phase>('select')
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [timeLimit, setTimeLimit] = useState<TimeLimit>(60)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [answer, setAnswer] = useState('')
  const [stuckCount, setStuckCount] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const startTimeRef = useRef<number>(0)
  const qidRef = useRef<string | null>(null)
  const intensiveIdsRef = useRef<string[]>([])
  const intensiveIndexRef = useRef<number>(-1)

  const { addPracticeRecord, addWeakPoint } = useStore()

  useEffect(() => {
    const qid = searchParams.get('qid')
    const intensiveIds = searchParams.get('intensiveIds')
    const intensiveIndex = searchParams.get('intensiveIndex')

    if (intensiveIds) {
      intensiveIdsRef.current = intensiveIds.split(',')
      intensiveIndexRef.current = intensiveIndex ? parseInt(intensiveIndex, 10) : -1
    }

    if (qid && qid !== qidRef.current) {
      qidRef.current = qid
      const q = questions.find((q) => q.id === qid)
      if (q) {
        setCurrentQuestion(q)
        setAnswer('')
        setStuckCount(0)
        setElapsedTime(0)
        setShowHint(false)
        setPhase('ready')
      }
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const pickQuestion = useCallback(() => {
    const cat = selectedCategory === 'all' ? undefined : selectedCategory
    const q = getRandomQuestion(cat)
    setCurrentQuestion(q)
    setAnswer('')
    setStuckCount(0)
    setElapsedTime(0)
    setShowHint(false)
    return q
  }, [selectedCategory])

  const handleStart = useCallback(() => {
    const q = pickQuestion()
    if (q) {
      setPhase('ready')
    }
  }, [pickQuestion])

  const handleBeginAnswer = useCallback(() => {
    setPhase('answering')
    setIsTimerRunning(true)
    startTimeRef.current = Date.now()
  }, [])

  const handleTimeUp = useCallback(() => {
    setIsTimerRunning(false)
    const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000)
    setElapsedTime(elapsed)
    setPhase('result')
  }, [])

  const handleSubmit = useCallback(() => {
    setIsTimerRunning(false)
    const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000)
    setElapsedTime(elapsed)
    setPhase('result')
  }, [])

  const handleStuck = useCallback(() => {
    setStuckCount((prev) => prev + 1)
  }, [])

  const handleTimerTick = useCallback((remaining: number) => {
    setElapsedTime(timeLimit - remaining)
  }, [timeLimit])

  const handleRetry = useCallback(() => {
    setAnswer('')
    setStuckCount(0)
    setElapsedTime(0)
    setPhase('ready')
  }, [])

  const handleNext = useCallback(() => {
    const ids = intensiveIdsRef.current
    const idx = intensiveIndexRef.current
    if (ids.length > 0 && idx >= 0 && idx + 1 < ids.length) {
      const nextQid = ids[idx + 1]
      intensiveIndexRef.current = idx + 1
      const q = questions.find((q) => q.id === nextQid)
      if (q) {
        setCurrentQuestion(q)
        setAnswer('')
        setStuckCount(0)
        setElapsedTime(0)
        setShowHint(false)
        setPhase('ready')
        return
      }
    }
    intensiveIdsRef.current = []
    intensiveIndexRef.current = -1
    handleStart()
    setPhase('ready')
  }, [handleStart])

  const handleSaveRecord = useCallback(() => {
    if (!currentQuestion) return
    const record = createPracticeRecord(
      currentQuestion.id,
      answer,
      timeLimit,
      elapsedTime,
      stuckCount
    )
    addPracticeRecord(record)
    if (stuckCount > 0) {
      addWeakPoint(currentQuestion.id)
    }
  }, [currentQuestion, answer, timeLimit, elapsedTime, stuckCount, addPracticeRecord, addWeakPoint])

  const handleAddWeakPoint = useCallback(() => {
    if (!currentQuestion) return
    addWeakPoint(currentQuestion.id)
  }, [currentQuestion, addWeakPoint])

  const handleResultClose = useCallback(() => {
    handleSaveRecord()
    setPhase('select')
    setCurrentQuestion(null)
  }, [handleSaveRecord])

  const handleResultRetry = useCallback(() => {
    handleSaveRecord()
    handleRetry()
  }, [handleSaveRecord, handleRetry])

  const handleResultNext = useCallback(() => {
    handleSaveRecord()
    handleNext()
  }, [handleSaveRecord, handleNext])

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      <div className="max-w-6xl mx-auto p-6">
        {phase === 'select' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-white text-2xl font-bold mb-2">拆弹训练场</h2>
              <p className="text-white/40 text-sm">选择分类和倒计时时长，开始限时作答训练</p>
            </div>

            <div className="bg-[#1a1a2e] rounded-2xl border border-white/5 p-6 space-y-6">
              <div>
                <p className="text-white/60 text-sm font-medium mb-3">选择问题分类</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`p-4 rounded-xl border transition-all duration-200 ${
                      selectedCategory === 'all'
                        ? 'bg-[#ff6b35]/15 border-[#ff6b35]/30 text-[#ff6b35]'
                        : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    <Shuffle className="w-5 h-5 mx-auto mb-2" />
                    <p className="text-sm font-medium">随机</p>
                    <p className="text-xs opacity-60 mt-1">{questions.length}题</p>
                  </button>
                  {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                    const count = questions.filter((q) => q.category === key).length
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedCategory(key)}
                        className={`p-4 rounded-xl border transition-all duration-200 ${
                          selectedCategory === key
                            ? 'border-opacity-30'
                            : 'bg-white/5 border-white/5 hover:bg-white/10'
                        }`}
                        style={
                          selectedCategory === key
                            ? { backgroundColor: `${config.color}15`, borderColor: `${config.color}30`, color: config.color }
                            : { color: '#ffffff80' }
                        }
                      >
                        <p className="text-sm font-medium">{config.label}</p>
                        <p className="text-xs opacity-60 mt-1">{count}题</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <p className="text-white/60 text-sm font-medium mb-3">倒计时时长</p>
                <div className="flex gap-3">
                  {TIME_LIMIT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setTimeLimit(opt.value)}
                      className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        timeLimit === opt.value
                          ? 'bg-[#ff6b35] text-white shadow-lg shadow-[#ff6b35]/20'
                          : 'bg-white/5 text-white/50 hover:bg-white/10'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStart}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#ff6b35] to-[#ff3d00] text-white font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-[#ff6b35]/20 hover:shadow-[#ff6b35]/30 transition-shadow"
              >
                <Play className="w-5 h-5" />
                开始训练
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
            {phase === 'ready' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center space-y-6"
              >
                <div className="py-8">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.1 }}
                  >
                    <QuestionCard question={currentQuestion} />
                  </motion.div>
                </div>
                <StructureHint question={currentQuestion} />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBeginAnswer}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#ff6b35] to-[#ff3d00] text-white font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-[#ff6b35]/20"
                >
                  <Play className="w-5 h-5" />
                  开始倒计时
                </motion.button>
              </motion.div>
            )}

            {phase === 'answering' && (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <Timer
                    timeLimit={timeLimit}
                    isRunning={isTimerRunning}
                    onTimeUp={handleTimeUp}
                    onTick={handleTimerTick}
                    onReset={() => {}}
                  />
                </div>

                <QuestionCard question={currentQuestion} />

                <div className="flex gap-4">
                  <div className="flex-1 space-y-4">
                    <div className="relative">
                      <textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="在此输入你的回答..."
                        className="w-full h-40 bg-[#1e1e30] border border-white/10 rounded-xl p-4 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#ff6b35]/50 resize-none transition-colors"
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
                      <button
                        onClick={() => setShowHint(!showHint)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 text-white/50 text-sm font-medium hover:bg-white/10 transition-colors"
                      >
                        💡 提示
                      </button>
                      <div className="flex-1" />
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSubmit}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00e676]/15 text-[#00e676] text-sm font-bold hover:bg-[#00e676]/25 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        完成作答
                      </motion.button>
                    </div>
                  </div>

                  {showHint && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 320, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      className="shrink-0 overflow-hidden"
                    >
                      <StructureHint question={currentQuestion} />
                    </motion.div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {currentQuestion && (
          <ResultModal
            isOpen={phase === 'result'}
            onClose={handleResultClose}
            question={currentQuestion}
            actualTime={elapsedTime}
            timeLimit={timeLimit}
            isTimeout={elapsedTime >= timeLimit}
            stuckCount={stuckCount}
            onRetry={handleResultRetry}
            onNext={handleResultNext}
            onAddWeakPoint={handleAddWeakPoint}
          />
        )}
      </div>
    </div>
  )
}
