import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, Flame, Trophy, Clock, ArrowRight, CheckCircle2, XCircle, Play, Zap, BarChart3 } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { questions } from '@/data/questions'
import { CATEGORY_CONFIG } from '@/data/types'
import { useNavigate } from 'react-router-dom'

export default function Review() {
  const { getWeakPointsList, getStats, practiceRecords, markMastered, getTodayPracticeCount } = useStore()
  const navigate = useNavigate()
  const weakPoints = getWeakPointsList()
  const stats = getStats()
  const todayCount = getTodayPracticeCount()
  const [activeTab, setActiveTab] = useState<'weak' | 'stats'>('weak')
  const [intensiveMode, setIntensiveMode] = useState(false)
  const [intensiveIndex, setIntensiveIndex] = useState(0)

  const intensiveList = weakPoints.slice(0, 5)

  const handleStartIntensive = useCallback(() => {
    if (intensiveList.length === 0) return
    setIntensiveMode(true)
    setIntensiveIndex(0)
  }, [intensiveList.length])

  const handleMarkMastered = useCallback(
    (questionId: string) => {
      markMastered(questionId)
    },
    [markMastered]
  )

  const recentRecords = practiceRecords.slice(0, 10)

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div>
          <h2 className="text-white text-2xl font-bold mb-2">弱点复盘台</h2>
          <p className="text-white/40 text-sm">回顾卡壳问题，针对性强化练习</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="bg-[#1a1a2e] rounded-2xl border border-white/5 p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#ff6b35]/15 flex items-center justify-center">
                <Zap className="w-4 h-4 text-[#ff6b35]" />
              </div>
              <span className="text-white/40 text-xs">今日练习</span>
            </div>
            <p className="text-white text-2xl font-bold">{todayCount}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#1a1a2e] rounded-2xl border border-white/5 p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#6366f1]/15 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-[#6366f1]" />
              </div>
              <span className="text-white/40 text-xs">累计练习</span>
            </div>
            <p className="text-white text-2xl font-bold">{stats.totalPractices}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#1a1a2e] rounded-2xl border border-white/5 p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#ff1744]/15 flex items-center justify-center">
                <Target className="w-4 h-4 text-[#ff1744]" />
              </div>
              <span className="text-white/40 text-xs">待强化</span>
            </div>
            <p className="text-white text-2xl font-bold">{weakPoints.length}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#1a1a2e] rounded-2xl border border-white/5 p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#00e676]/15 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-[#00e676]" />
              </div>
              <span className="text-white/40 text-xs">连续天数</span>
            </div>
            <p className="text-white text-2xl font-bold">{stats.streakDays}</p>
          </motion.div>
        </div>

        {Object.keys(stats.categoryStats).length > 0 && (
          <div className="bg-[#1a1a2e] rounded-2xl border border-white/5 p-5">
            <p className="text-white/60 text-sm font-medium mb-4">分类卡壳率</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                const catStat = stats.categoryStats[key]
                return (
                  <div key={key} className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-2">
                      <svg width="64" height="64" className="transform -rotate-90">
                        <circle cx="32" cy="32" r="28" fill="none" stroke="#2d2d44" strokeWidth="4" />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          fill="none"
                          stroke={config.color}
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 28}
                          strokeDashoffset={2 * Math.PI * 28 * (1 - (catStat?.stuckRate || 0) / 100)}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                        {catStat ? `${catStat.stuckRate}%` : '-'}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: config.color }}>{config.label}</p>
                    <p className="text-white/30 text-[10px]">{catStat ? `${catStat.count}次` : '暂无'}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('weak')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'weak' ? 'bg-[#ff6b35]/15 text-[#ff6b35]' : 'text-white/40 hover:text-white/60'
            }`}
          >
            卡壳问题 ({weakPoints.length})
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'stats' ? 'bg-[#ff6b35]/15 text-[#ff6b35]' : 'text-white/40 hover:text-white/60'
            }`}
          >
            最近记录
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'weak' && (
            <motion.div
              key="weak"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              {weakPoints.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleStartIntensive}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#ff6b35]/20 to-[#ff3d00]/20 border border-[#ff6b35]/20 text-[#ff6b35] text-sm font-bold hover:from-[#ff6b35]/30 hover:to-[#ff3d00]/30 transition-all"
                >
                  <Flame className="w-4 h-4" />
                  开始强化练习（前{Math.min(5, weakPoints.length)}个弱点）
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              )}

              {intensiveMode && intensiveList.length > 0 && (
                <div className="bg-[#1e1e30] rounded-2xl border border-[#ff6b35]/20 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[#ff6b35] text-sm font-bold">🔥 强化练习 #{intensiveIndex + 1}</p>
                    <span className="text-white/30 text-xs">{intensiveIndex + 1} / {intensiveList.length}</span>
                  </div>
                  {(() => {
                    const wp = intensiveList[intensiveIndex]
                    const q = questions.find((q) => q.id === wp.questionId)
                    if (!q) return null
                    return (
                      <div>
                        <p className="text-white text-base font-medium mb-2">{q.text}</p>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${CATEGORY_CONFIG[q.category].color}15`, color: CATEGORY_CONFIG[q.category].color }}>
                            {CATEGORY_CONFIG[q.category].label}
                          </span>
                          <span className="text-white/30 text-xs">卡壳 {wp.stuckCount} 次</span>
                        </div>
                        <div className="flex gap-3">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              const ids = intensiveList.map((wp) => wp.questionId).join(',')
                              navigate(`/?qid=${wp.questionId}&intensiveIds=${ids}&intensiveIndex=${intensiveIndex}`)
                            }}
                            className="flex-1 py-2.5 rounded-xl bg-[#ff6b35] text-white text-sm font-bold flex items-center justify-center gap-2"
                          >
                            <Play className="w-4 h-4" />
                            去训练
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              markMastered(wp.questionId)
                              if (intensiveIndex < intensiveList.length - 1) {
                                setIntensiveIndex(intensiveIndex + 1)
                              } else {
                                setIntensiveMode(false)
                              }
                            }}
                            className="flex-1 py-2.5 rounded-xl bg-[#00e676]/15 text-[#00e676] text-sm font-bold flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            已掌握
                          </motion.button>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}

              {weakPoints.length === 0 ? (
                <div className="text-center py-16">
                  <Trophy className="w-12 h-12 text-white/10 mx-auto mb-3" />
                  <p className="text-white/30 text-sm">暂无卡壳记录</p>
                  <p className="text-white/20 text-xs mt-1">开始训练后，卡壳的问题会出现在这里</p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/')}
                    className="mt-4 px-6 py-2 rounded-xl bg-[#ff6b35] text-white text-sm font-bold"
                  >
                    开始训练
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-2">
                  {weakPoints.map((wp, i) => {
                    const q = questions.find((q) => q.id === wp.questionId)
                    if (!q) return null
                    return (
                      <motion.div
                        key={wp.questionId}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-[#1a1a2e] rounded-xl border border-white/5 p-4 flex items-center gap-4 hover:border-white/10 transition-colors"
                      >
                        <div className="w-1 h-10 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_CONFIG[q.category].color }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{q.text}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${CATEGORY_CONFIG[q.category].color}15`, color: CATEGORY_CONFIG[q.category].color }}>
                              {CATEGORY_CONFIG[q.category].label}
                            </span>
                            <span className="text-white/30 text-xs">最近: {new Date(wp.lastPracticeAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full bg-[#ff1744]/10 text-[#ff1744] text-xs font-bold">
                            ×{wp.stuckCount}
                          </span>
                          <button
                            onClick={() => handleMarkMastered(wp.questionId)}
                            className="w-8 h-8 rounded-lg bg-[#00e676]/10 hover:bg-[#00e676]/20 flex items-center justify-center transition-colors"
                            title="标记已掌握"
                          >
                            <CheckCircle2 className="w-4 h-4 text-[#00e676]" />
                          </button>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-2"
            >
              {recentRecords.length === 0 ? (
                <div className="text-center py-16">
                  <Clock className="w-12 h-12 text-white/10 mx-auto mb-3" />
                  <p className="text-white/30 text-sm">暂无练习记录</p>
                </div>
              ) : (
                recentRecords.map((record, i) => {
                  const q = questions.find((q) => q.id === record.questionId)
                  if (!q) return null
                  return (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-[#1a1a2e] rounded-xl border border-white/5 p-4 flex items-center gap-4"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: record.isTimeout ? '#ff174415' : record.stuckCount > 0 ? '#ff6b3515' : '#00e67615' }}
                      >
                        {record.isTimeout ? (
                          <XCircle className="w-4 h-4 text-[#ff1744]" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-[#00e676]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{q.text}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs" style={{ color: CATEGORY_CONFIG[q.category].color }}>
                            {CATEGORY_CONFIG[q.category].label}
                          </span>
                          <span className="text-white/30 text-xs">{record.actualTime}s / {record.timeLimit}s</span>
                          {record.stuckCount > 0 && (
                            <span className="text-[#ff1744] text-xs">卡壳×{record.stuckCount}</span>
                          )}
                        </div>
                      </div>
                      <span className="text-white/20 text-xs shrink-0">
                        {new Date(record.completedAt).toLocaleDateString()}
                      </span>
                    </motion.div>
                  )
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
