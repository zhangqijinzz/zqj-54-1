import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Lightbulb } from 'lucide-react'
import { Question, STRUCTURE_CONFIG, CATEGORY_CONFIG } from '@/data/types'

interface StructureHintProps {
  question: Question
}

export default function StructureHint({ question }: StructureHintProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const config = STRUCTURE_CONFIG[question.suggestedStructure]
  const categoryConfig = CATEGORY_CONFIG[question.category]

  return (
    <div className="bg-[#1e1e30] rounded-2xl border border-white/5 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${categoryConfig.color}20` }}>
            <Lightbulb className="w-4 h-4" style={{ color: categoryConfig.color }} />
          </div>
          <div className="text-left">
            <p className="text-white/90 text-sm font-medium">推荐结构</p>
            <p className="text-white/40 text-xs">{config.label}</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-white/40" />
        ) : (
          <ChevronDown className="w-4 h-4 text-white/40" />
        )}
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
            <div className="px-4 pb-4 space-y-3">
              <p className="text-white/50 text-xs leading-relaxed">{config.description}</p>
              <div className="space-y-2">
                {config.steps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-3 items-start"
                  >
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                      style={{ backgroundColor: `${categoryConfig.color}20`, color: categoryConfig.color }}
                    >
                      {i + 1}
                    </span>
                    <p className="text-white/70 text-xs leading-relaxed">{step}</p>
                  </motion.div>
                ))}
              </div>
              <div className="pt-2 border-t border-white/5">
                <p className="text-white/30 text-[10px] uppercase tracking-wider mb-2">提示要点</p>
                {question.structureHints.map((hint, i) => (
                  <p key={i} className="text-white/50 text-xs leading-relaxed pl-2 border-l-2 border-[#ff6b35]/30 mb-1">
                    {hint}
                  </p>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
