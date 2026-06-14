import { NavLink } from 'react-router-dom'
import { Bomb, Target, BookOpen } from 'lucide-react'

const navItems = [
  { path: '/', label: '拆弹训练场', icon: Bomb },
  { path: '/review', label: '弱点复盘台', icon: Target },
  { path: '/bank', label: '题库弹药库', icon: BookOpen },
]

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-[#12121f] border-r border-white/5 flex flex-col">
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff6b35] to-[#ff3d00] flex items-center justify-center">
            <Bomb className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">拆弹桌</h1>
            <p className="text-white/40 text-xs">面试回答训练</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-[#ff6b35]/15 text-[#ff6b35]'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-white/5">
        <div className="px-4 py-3 rounded-xl bg-[#ff6b35]/5 border border-[#ff6b35]/10">
          <p className="text-[#ff6b35] text-xs font-medium">💡 小贴士</p>
          <p className="text-white/40 text-xs mt-1">每天练习3道题，30天成为面试高手</p>
        </div>
      </div>
    </aside>
  )
}
