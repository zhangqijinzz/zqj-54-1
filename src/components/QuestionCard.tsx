import { Question, CATEGORY_CONFIG, STRUCTURE_CONFIG } from '@/data/types'
import { Star, Tag } from 'lucide-react'

interface QuestionCardProps {
  question: Question
}

export default function QuestionCard({ question }: QuestionCardProps) {
  const catConfig = CATEGORY_CONFIG[question.category]
  const structConfig = STRUCTURE_CONFIG[question.suggestedStructure]

  return (
    <div className="bg-[#1e1e30] rounded-2xl border border-white/5 overflow-hidden">
      <div className="flex">
        <div className="w-1 shrink-0" style={{ backgroundColor: catConfig.color }} />
        <div className="flex-1 p-5">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium"
              style={{ backgroundColor: `${catConfig.color}15`, color: catConfig.color }}
            >
              <Tag className="w-3 h-3" />
              {catConfig.label}
            </span>
            <span className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/5 text-white/60">
              <Star className="w-3 h-3 fill-current text-[#f59e0b]" />
              {'★'.repeat(question.difficulty)}{'☆'.repeat(3 - question.difficulty)}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#ff6b35]/10 text-[#ff6b35]/80">
              {structConfig.label}
            </span>
          </div>
          <h2 className="text-white text-lg font-semibold leading-relaxed">{question.text}</h2>
        </div>
      </div>
    </div>
  )
}
