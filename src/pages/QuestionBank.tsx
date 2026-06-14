import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Star, Tag, BookOpen, ChevronRight } from 'lucide-react'
import { questions } from '@/data/questions'
import { CATEGORY_CONFIG, STRUCTURE_CONFIG, Category, Difficulty } from '@/data/types'

export default function QuestionBank() {
  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 0>(0)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return questions.filter((q) => {
      if (selectedCategory !== 'all' && q.category !== selectedCategory) return false
      if (selectedDifficulty !== 0 && q.difficulty !== selectedDifficulty) return false
      if (searchText && !q.text.includes(searchText)) return false
      return true
    })
  }, [searchText, selectedCategory, selectedDifficulty])

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    Object.keys(CATEGORY_CONFIG).forEach((key) => {
      counts[key] = questions.filter((q) => q.category === key).length
    })
    return counts
  }, [])

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div>
          <h2 className="text-white text-2xl font-bold mb-2">题库弹药库</h2>
          <p className="text-white/40 text-sm">浏览全部 {questions.length} 道面试题，按分类和难度筛选</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedCategory('all')}
            className={`p-5 rounded-2xl border text-left transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#ff6b35]/10 border-[#ff6b35]/30'
                : 'bg-[#1a1a2e] border-white/5 hover:border-white/10'
            }`}
          >
            <BookOpen className={`w-6 h-6 mb-2 ${selectedCategory === 'all' ? 'text-[#ff6b35]' : 'text-white/30'}`} />
            <p className={`text-sm font-bold ${selectedCategory === 'all' ? 'text-[#ff6b35]' : 'text-white/70'}`}>全部题目</p>
            <p className="text-white/30 text-xs mt-1">{questions.length} 题</p>
          </motion.button>
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedCategory(key as Category)}
              className={`p-5 rounded-2xl border text-left transition-all ${
                selectedCategory === key
                  ? 'border-opacity-30'
                  : 'bg-[#1a1a2e] border-white/5 hover:border-white/10'
              }`}
              style={
                selectedCategory === key
                  ? { backgroundColor: `${config.color}10`, borderColor: `${config.color}30` }
                  : {}
              }
            >
              <p className={`text-sm font-bold ${selectedCategory === key ? '' : 'text-white/70'}`} style={selectedCategory === key ? { color: config.color } : {}}>
                {config.label}
              </p>
              <p className="text-white/30 text-xs mt-1">{categoryCounts[key]} 题</p>
            </motion.button>
          ))}
        </div>

        <div className="flex gap-3 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="搜索面试问题..."
              className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#ff6b35]/50 transition-colors"
            />
            {searchText && (
              <button onClick={() => setSearchText('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-white/30 hover:text-white/60" />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {[0, 1, 2, 3].map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDifficulty(d as Difficulty | 0)}
                className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  selectedDifficulty === d
                    ? 'bg-[#ff6b35] text-white'
                    : 'bg-white/5 text-white/40 hover:bg-white/10'
                }`}
              >
                {d === 0 ? '全部' : '★'.repeat(d)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-white/30 text-sm">共 {filtered.length} 道题目</p>
        </div>

        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((q, i) => {
              const catConfig = CATEGORY_CONFIG[q.category]
              const structConfig = STRUCTURE_CONFIG[q.suggestedStructure]
              const isExpanded = expandedId === q.id

              return (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: i * 0.02 }}
                  className="bg-[#1a1a2e] rounded-xl border border-white/5 overflow-hidden hover:border-white/10 transition-colors"
                >
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : q.id)}
                    className="w-full flex items-center gap-4 p-4 text-left"
                  >
                    <div className="w-1 h-10 rounded-full shrink-0" style={{ backgroundColor: catConfig.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{q.text}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: `${catConfig.color}15`, color: catConfig.color }}>
                          <Tag className="w-2.5 h-2.5" />
                          {catConfig.label}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/50">
                          {'★'.repeat(q.difficulty)}{'☆'.repeat(3 - q.difficulty)}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ff6b35]/10 text-[#ff6b35]/70">
                          {structConfig.label}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-white/20 transition-transform shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-0 ml-5 space-y-4">
                          <div>
                            <p className="text-white/40 text-xs font-medium mb-2">推荐结构 · {structConfig.label}</p>
                            <div className="space-y-1.5">
                              {structConfig.steps.map((step, si) => (
                                <div key={si} className="flex gap-2 items-start">
                                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5" style={{ backgroundColor: `${catConfig.color}15`, color: catConfig.color }}>
                                    {si + 1}
                                  </span>
                                  <p className="text-white/50 text-xs leading-relaxed">{step}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-white/40 text-xs font-medium mb-2">示例要点</p>
                            {q.examplePoints.map((point, pi) => (
                              <p key={pi} className="text-white/50 text-xs leading-relaxed pl-2 border-l-2 border-[#ff6b35]/20 mb-1">
                                {point}
                              </p>
                            ))}
                          </div>
                          <div>
                            <p className="text-white/40 text-xs font-medium mb-2">答题提示</p>
                            {q.structureHints.map((hint, hi) => (
                              <p key={hi} className="text-white/50 text-xs leading-relaxed pl-2 border-l-2 border-white/5 mb-1">
                                {hint}
                              </p>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Search className="w-12 h-12 text-white/10 mx-auto mb-3" />
              <p className="text-white/30 text-sm">没有找到匹配的题目</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
