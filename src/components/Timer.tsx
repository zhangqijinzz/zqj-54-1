import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TimeLimit } from '@/data/types'

interface TimerProps {
  timeLimit: TimeLimit
  isRunning: boolean
  onTimeUp: () => void
  onTick?: (remaining: number) => void
  onReset: () => void
}

export default function Timer({ timeLimit, isRunning, onTimeUp, onTick, onReset }: TimerProps) {
  const [remaining, setRemaining] = useState<number>(timeLimit)
  const [hasCalledTimeUp, setHasCalledTimeUp] = useState(false)

  useEffect(() => {
    setRemaining(timeLimit)
    setHasCalledTimeUp(false)
  }, [timeLimit])

  useEffect(() => {
    if (!isRunning) return
    setHasCalledTimeUp(false)
    const interval = setInterval(() => {
      setRemaining((prev) => {
        const next = prev - 1
        if (next <= 0) {
          clearInterval(interval)
          return 0
        }
        return next
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isRunning])

  useEffect(() => {
    onTick?.(remaining)
    if (remaining <= 0 && !hasCalledTimeUp && isRunning) {
      setHasCalledTimeUp(true)
      onTimeUp()
    }
  }, [remaining, hasCalledTimeUp, isRunning, onTimeUp, onTick])

  const progress = remaining / timeLimit
  const radius = 80
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress)

  const getColor = useCallback(() => {
    if (progress > 0.5) return '#00e676'
    if (progress > 0.25) return '#ff6b35'
    return '#ff1744'
  }, [progress])

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60)
    const secs = s % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="relative flex items-center justify-center">
      <svg width="200" height="200" className="transform -rotate-90">
        <circle cx="100" cy="100" r={radius} fill="none" stroke="#2d2d44" strokeWidth="8" />
        <motion.circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 8px ${getColor()}40)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={remaining}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="font-mono text-4xl font-bold tracking-wider"
            style={{ color: getColor(), fontFamily: 'JetBrains Mono, monospace' }}
          >
            {formatTime(remaining)}
          </motion.span>
        </AnimatePresence>
        <span className="text-white/30 text-xs mt-1">
          {isRunning ? '计时中' : remaining === timeLimit ? '准备开始' : '已结束'}
        </span>
      </div>
      {remaining <= 0 && isRunning && (
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-[#ff1744]"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}
    </div>
  )
}
