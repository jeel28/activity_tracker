import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import Today from './pages/Today'
import Calendar from './pages/Calendar'
import Todos from './pages/Todos'
import Monthly from './pages/Monthly'
import ManageTasks from './pages/ManageTasks'
import { format } from 'date-fns'

const ICONS = {
  today: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  todo: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  ),
  monthly: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <path d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
  ),
  manage: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <circle cx="12" cy="12" r="3" /><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M12 2v2M12 20v2M20 12h2M2 12h2M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41" />
    </svg>
  ),
}

const NAV = [
  { to: '/',        label: 'Today',    icon: ICONS.today },
  { to: '/calendar',label: 'Calendar', icon: ICONS.calendar },
  { to: '/todos',   label: 'To-do',    icon: ICONS.todo },
  { to: '/monthly', label: 'Monthly',  icon: ICONS.monthly },
  { to: '/manage',  label: 'Manage',   icon: ICONS.manage },
]

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚡</span>
          <span className="font-semibold text-base tracking-tight">ActivityTracker</span>
        </div>
        <span className="text-xs text-gray-500 font-mono">
          {format(new Date(), 'EEE, dd MMM yyyy')}
        </span>
      </header>

      {/* Main content */}
      <main className="flex-1 pb-24 px-4 pt-5 max-w-2xl mx-auto w-full">
        <Routes>
          <Route path="/"         element={<Today />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/todos"    element={<Todos />} />
          <Route path="/monthly"  element={<Monthly />} />
          <Route path="/manage"   element={<ManageTasks />} />
        </Routes>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gray-950/90 backdrop-blur border-t border-gray-800 px-2 py-2">
        <div className="max-w-2xl mx-auto flex items-center justify-around">
          {NAV.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-150 ${
                  isActive ? 'text-brand-400' : 'text-gray-500 hover:text-gray-300'
                }`
              }
            >
              {icon}
              <span className="text-[10px] font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
