import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, AlertTriangle, CheckCircle, Flame, RotateCcw, ArrowRight, ListPlus } from 'lucide-react'
import { Question, CATEGORY_CONFIG } from '@/data/types'

interface ResultModalProps {
  isOpen: boolean
  onClose: () => void
  question: Question
  actualTime: number
  timeLimit: number
  isTimeout: boolean
  stuckCount: number
  onRetry: () => void
  onNext: () => void
  onAddWeakPoint: () => void
}

export default function ResultModal({
  isOpen,
  onClose,
  question,
  actualTime,
  timeLimit,
  isTimeout,
  stuckCount,
  onRetry,
  onNext,
  onAddWeakPoint,
}: ResultModalProps) {
  const catConfig = CATEGORY_CONFIG[question.category]
  const structureScore = stuckCount === 0 ? 100 : stuckCount <= 2 ? 70 : stuckCount <= 4 ? 50 : 30

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-[#1a1a2e] rounded-3xl border border-white/10 w-full max-w-md overflow-hidden shadow-2xl">
              <div className="relative p-6">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-white/60" />
                </button>

                <div className="text-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{
                      backgroundColor: isTimeout ? '#ff174420' : stuckCount > 0 ? '#ff6b3520' : '#00e67620',
                    }}
                  >
                    {isTimeout ? (
                      <AlertTriangle className="w-8 h-8 text-[#ff1744]" />
                    ) : stuckCount > 0 ? (
                      <Flame className="w-8 h-8 text-[#ff6b35]" />
                    ) : (
                      <CheckCircle className="w-8 h-8 text-[#00e676]" />
                    )}
                  </motion.div>
                  <h3 className="text-white text-xl font-bold">
                    {isTimeout ? '时间到！' : stuckCount > 0 ? '需要加强' : '表现不错！'}
                  </h3>
                  <p className="text-white/40 text-sm mt-1">
                    <span style={{ color: catConfig.color }}>{catConfig.label}</span> · {question.text.slice(0, 20)}...
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <Clock className="w-4 h-4 text-white/40 mx-auto mb-1" />
                    <p className="text-white font-bold text-lg">{actualTime}s</p>
                    <p className="text-white/30 text-[10px]">用时 / {timeLimit}s</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <AlertTriangle className="w-4 h-4 mx-auto mb-1" style={{ color: stuckCount > 0 ? '#ff6b35' : '#00e676' }} />
                    <p className="text-white font-bold text-lg">{stuckCount}</p>
                    <p className="text-white/30 text-[10px]">卡壳次数</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <CheckCircle className="w-4 h-4 mx-auto mb-1" style={{ color: structureScore >= 70 ? '#00e676' : '#ff6b35' }} />
                    <p className="text-white font-bold text-lg">{structureScore}</p>
                    <p className="text-white/30 text-[10px]">完整度分</p>
                  </div>
                </div>

                {stuckCount > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onAddWeakPoint}
                    className="w-full mb-3 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#ff6b35]/10 text-[#ff6b35] text-sm font-medium hover:bg-[#ff6b35]/20 transition-colors"
                  >
                    <ListPlus className="w-4 h-4" />
                    加入弱点列表
                  </motion.button>
                )}

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onRetry}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 text-white/70 text-sm font-medium hover:bg-white/10 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    重新练习
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onNext}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#ff6b35] text-white text-sm font-bold hover:bg-[#ff5722] transition-colors"
                  >
                    下一题
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
