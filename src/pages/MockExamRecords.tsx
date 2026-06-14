import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, FileText, AlertTriangle, CheckCircle, Flame, TrendingUp, Play, Calendar, ChevronDown, ChevronUp, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore, getMockExamOverallEvaluation } from '@/store/useStore'
import { questions } from '@/data/questions'
import { CATEGORY_CONFIG, MockExamRecord } from '@/data/types'

export default function MockExamRecords() {
  const navigate = useNavigate()
  const { getMockExamRecords, getMockExamStats } = useStore()
  const records = getMockExamRecords()
  const stats = getMockExamStats()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }, [expandedId])

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60)
    const secs = s % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getScoreColor = (score: number) => {
    if (score >= 75) return '#00e676'
    if (score >= 60) return '#ff6b35'
    return '#ff1744'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 75) return <CheckCircle className="w-6 h-6" />
    if (score >= 60) return <Flame className="w-6 h-6" />
    return <AlertTriangle className="w-6 h-6" />
  }

  const maxTrendValue = stats.recentTrend.length > 0 ? Math.max(...stats.recentTrend, 100) : 100

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white text-2xl font-bold mb-2">模考记录</h2>
            <p className="text-white/40 text-sm">查看历史模考成绩和趋势分析</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/mock-exam')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ff6b35] text-white text-sm font-bold hover:bg-[#ff5722] transition-colors"
          >
            <Play className="w-4 h-4" />
            开始新模考
          </motion.button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="bg-[#1a1a2e] rounded-2xl border border-white/5 p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#6366f1]/15 flex items-center justify-center">
                <FileText className="w-4 h-4 text-[#6366f1]" />
              </div>
              <span className="text-white/40 text-xs">总模考次数</span>
            </div>
            <p className="text-white text-2xl font-bold">{stats.totalExams}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#1a1a2e] rounded-2xl border border-white/5 p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#00e676]/15 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-[#00e676]" />
              </div>
              <span className="text-white/40 text-xs">平均得分</span>
            </div>
            <p className="text-white text-2xl font-bold">{stats.averageScore}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#1a1a2e] rounded-2xl border border-white/5 p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#ff6b35]/15 flex items-center justify-center">
                <Flame className="w-4 h-4 text-[#ff6b35]" />
              </div>
              <span className="text-white/40 text-xs">平均卡壳</span>
            </div>
            <p className="text-white text-2xl font-bold">{stats.averageStuckCount}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#1a1a2e] rounded-2xl border border-white/5 p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#ff1744]/15 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-[#ff1744]" />
              </div>
              <span className="text-white/40 text-xs">平均超时率</span>
            </div>
            <p className="text-white text-2xl font-bold">{stats.averageTimeoutRate}%</p>
          </motion.div>
        </div>

        {stats.recentTrend.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#1a1a2e] rounded-2xl border border-white/5 p-5"
          >
            <p className="text-white/60 text-sm font-medium mb-4">成绩趋势（最近10次）</p>
            <div className="flex items-end gap-2 h-32">
              {stats.recentTrend.map((score, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(score / maxTrendValue) * 100}%` }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                    className="w-full rounded-t-lg"
                    style={{
                      backgroundColor: getScoreColor(score) + '40',
                      minHeight: '4px'
                    }}
                  />
                  <span className="text-white/40 text-[10px]">{score}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="space-y-3">
          <p className="text-white/60 text-sm font-medium">历史记录</p>
          {records.length === 0 ? (
            <div className="text-center py-16 bg-[#1a1a2e] rounded-2xl border border-white/5">
              <FileText className="w-12 h-12 text-white/10 mx-auto mb-3" />
              <p className="text-white/30 text-sm">暂无模考记录</p>
              <p className="text-white/20 text-xs mt-1">完成一次模拟面试后，记录会显示在这里</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/mock-exam')}
                className="mt-4 px-6 py-2 rounded-xl bg-[#ff6b35] text-white text-sm font-bold"
              >
                开始模考
              </motion.button>
            </div>
          ) : (
              <AnimatePresence>
              {records.map((record, i) => {
                const isExpanded = expandedId === record.id
                const evaluation = getMockExamOverallEvaluation(record.overallScore)
                return (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-[#1a1a2e] rounded-2xl border border-white/5 overflow-hidden"
                  >
                    <div
                      className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
                      onClick={() => handleToggleExpand(record.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: getScoreColor(record.overallScore) + '20' }}
                        >
                          <div style={{ color: getScoreColor(record.overallScore) }}>
                            {getScoreIcon(record.overallScore)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="text-xl font-bold"
                              style={{ color: getScoreColor(record.overallScore) }}
                            >
                              {record.overallScore}分
                            </span>
                            <span className="text-white/30 text-xs">
                              {record.questionCount}题 · {record.totalTimeLimit}分钟
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-white/40 text-xs">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(record.totalActualTime)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Flame className="w-3 h-3 text-[#ff6b35]" />
                              卡壳{record.totalStuckCount}次
                            </span>
                            {record.timeoutCount > 0 && (
                              <span className="flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-[#ff1744]" />
                                超时{record.timeoutCount}题
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(record.completedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-white/40" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-white/40" />
                        )}
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 border-t border-white/5 space-y-3 pt-4">
                            <div className="bg-white/5 rounded-xl p-3">
                              <p className="text-white/60 text-xs mb-1">整体评价</p>
                              <p className="text-white/80 text-sm">{evaluation}</p>
                            </div>

                            <div className="space-y-2">
                              <p className="text-white/40 text-xs">题目详情</p>
                              {record.results.map((result, j) => {
                                const q = questions.find((q) => q.id === result.questionId)
                                if (!q) return null
                                const catConfig = CATEGORY_CONFIG[q.category]
                                return (
                                  <div
                                    key={j}
                                    className="bg-white/5 rounded-lg p-3"
                                  >
                                    <div className="flex items-start gap-3">
                                      <div
                                        className="w-6 h-6 rounded flex items-center justify-center shrink-0"
                                        style={{ backgroundColor: `${catConfig.color}15` }}
                                      >
                                        <span
                                          className="text-[10px] font-bold"
                                          style={{ color: catConfig.color }}
                                        >
                                          {j + 1}
                                        </span>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-white text-xs mb-1">{q.text}</p>
                                        <div className="flex items-center gap-2 text-white/30 text-[10px]">
                                          <span style={{ color: catConfig.color }}>
                                            {catConfig.label}
                                          </span>
                                          <span>
                                            用时: {result.actualTime}s
                                          </span>
                                          {result.isTimeout && (
                                            <span className="text-[#ff1744]">超时</span>
                                          )}
                                          {result.stuckCount > 0 && (
                                            <span className="text-[#ff6b35]">卡壳×{result.stuckCount}</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  )
}
