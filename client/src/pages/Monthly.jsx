import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../lib/api'

const ICONS = { exercise:'🏃', reading:'📚', meditation:'🧘', study:'📖', work:'💼', health:'💊', habit:'⭐', custom:'✅' }
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['S','M','T','W','T','F','S']

export default function Monthly() {
  const now = new Date()
  const [year, setYear]   = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchStats() }, [year, month])

  async function fetchStats() {
    setLoading(true)
    try {
      const res = await api.get(`/stats/monthly/${year}/${month}`)
      setStats(res.data)
    } catch { toast.error('Failed to load stats') }
    finally { setLoading(false) }
  }

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const firstDay = new Date(year, month - 1, 1).getDay()

  function heatColor(pct) {
    if (pct === 0) return 'bg-gray-800 text-gray-600'
    if (pct < 34) return 'bg-brand-900/60 text-brand-300'
    if (pct < 67) return 'bg-brand-700/60 text-brand-200'
    return 'bg-brand-500/80 text-white'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-semibold">Monthly Review</h1>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-800 rounded-xl transition-colors text-gray-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <span className="text-sm font-medium min-w-[120px] text-center">{MONTHS[month-1]} {year}</span>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-800 rounded-xl transition-colors text-gray-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">{[1,2,3,4].map(i=><div key={i} className="h-20 bg-gray-800 rounded-2xl"/>)}</div>
          <div className="h-48 bg-gray-800 rounded-2xl"/>
          <div className="h-48 bg-gray-800 rounded-2xl"/>
        </div>
      ) : stats ? (
        <>
          {/* Summary metrics */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="metric">
              <span className="metric-label">Total Points</span>
              <span className="metric-value text-brand-400">{stats.totalPts}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Active Days</span>
              <span className="metric-value">{stats.activeDays}</span>
              <span className="text-xs text-gray-500">of {stats.days.length} days</span>
            </div>
            <div className="metric">
              <span className="metric-label">Avg Completion</span>
              <span className="metric-value">{stats.avgPct}%</span>
            </div>
            <div className="metric">
              <span className="metric-label">Best Streak</span>
              <span className="metric-value">{stats.bestStreak}</span>
              <span className="text-xs text-gray-500">days</span>
            </div>
          </div>

          {/* Heatmap */}
          <div className="card mb-4">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Completion Heatmap</h2>
            <div className="grid grid-cols-7 mb-1 gap-1">
              {DAYS.map((d,i) => <div key={i} className="text-center text-xs text-gray-600">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array(firstDay).fill(null).map((_,i) => <div key={`p${i}`}/>)}
              {stats.days.map(day => {
                const d = parseInt(day.date.split('-')[2])
                return (
                  <div key={day.date}
                    className={`aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-all ${heatColor(day.pct)}`}
                    title={`${day.date}: ${day.pct}% (${day.pts}pts)`}>
                    {d}
                  </div>
                )
              })}
            </div>
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-800 text-xs text-gray-500">
              <span>Less</span>
              <div className="flex gap-1">
                {['bg-gray-800','bg-brand-900/60','bg-brand-700/60','bg-brand-500/80'].map((c,i)=>(
                  <div key={i} className={`w-4 h-4 rounded ${c}`}/>
                ))}
              </div>
              <span>More</span>
            </div>
          </div>

          {/* Task breakdown */}
          <div className="card">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Task Performance</h2>
            {stats.taskStats.length === 0 ? (
              <p className="text-sm text-gray-600 text-center py-6">No task data for this month.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {stats.taskStats
                  .sort((a,b) => b.pct - a.pct)
                  .map(t => (
                  <div key={t.id}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-base">{ICONS[t.icon] || '✅'}</span>
                      <span className="text-sm font-medium flex-1">{t.name}</span>
                      <span className="badge badge-purple">{t.totalPts} pts</span>
                      <span className="text-xs text-gray-500">{t.doneCount}d</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full transition-all duration-700"
                        style={{ width: `${t.pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{t.pct}% completion rate</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}
