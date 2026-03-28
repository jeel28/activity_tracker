import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../lib/api'

const ICONS = { exercise:'🏃', reading:'📚', meditation:'🧘', study:'📖', work:'💼', health:'💊', habit:'⭐', custom:'✅' }

export default function Today() {
  const todayKey = format(new Date(), 'yyyy-MM-dd')
  const [tasks, setTasks]   = useState([])
  const [logs, setLogs]     = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      const [tRes, lRes] = await Promise.all([
        api.get('/tasks'),
        api.get(`/logs/${todayKey}`),
      ])
      setTasks(tRes.data)
      const logMap = {}
      lRes.data.forEach(l => { logMap[l.taskId] = l.done })
      setLogs(logMap)
    } catch {
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  async function toggle(taskId) {
    const prev = { ...logs }
    setLogs(l => ({ ...l, [taskId]: !l[taskId] }))
    try {
      const res = await api.post('/logs/toggle', { taskId, date: todayKey })
      setLogs(l => ({ ...l, [taskId]: res.data.done }))
    } catch {
      setLogs(prev)
      toast.error('Failed to update')
    }
  }

  const doneTasks  = tasks.filter(t => logs[t.id])
  const totalPts   = doneTasks.reduce((s, t) => s + t.points, 0)
  const pct        = tasks.length ? Math.round(doneTasks.length / tasks.length * 100) : 0
  const allPts     = tasks.reduce((s, t) => s + t.points, 0)

  if (loading) return <Skeleton />

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-semibold mb-0.5">Good {greeting()}!</h1>
        <p className="text-gray-400 text-sm">{format(new Date(), 'EEEE, MMMM d')}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="metric">
          <span className="metric-label">Points</span>
          <span className="metric-value text-brand-400">{totalPts}</span>
          <span className="text-xs text-gray-500">of {allPts}</span>
        </div>
        <div className="metric">
          <span className="metric-label">Done</span>
          <span className="metric-value">{doneTasks.length}/{tasks.length}</span>
          <span className="text-xs text-gray-500">tasks</span>
        </div>
        <div className="metric">
          <span className="metric-label">Progress</span>
          <span className="metric-value">{pct}%</span>
          <span className="text-xs text-gray-500">complete</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-800 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-brand-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Task list */}
      <div className="card">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Daily Tasks</h2>
        {tasks.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <div className="text-3xl mb-2">📋</div>
            <p className="text-sm">No tasks yet. Go to <span className="text-brand-400">Manage</span> to add some.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {tasks.map(task => {
              const done = !!logs[task.id]
              return (
                <button
                  key={task.id}
                  onClick={() => toggle(task.id)}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left w-full
                    ${done
                      ? 'bg-brand-900/30 border-brand-800/50'
                      : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600'
                    }`}
                >
                  {/* Checkbox */}
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                    ${done ? 'bg-brand-500 border-brand-500' : 'border-gray-600'}`}>
                    {done && <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} className="w-3.5 h-3.5"><path d="M20 6L9 17l-5-5"/></svg>}
                  </div>
                  <span className="text-lg">{ICONS[task.icon] || '✅'}</span>
                  <span className={`flex-1 text-sm font-medium ${done ? 'line-through text-gray-500' : ''}`}>
                    {task.name}
                  </span>
                  <span className={`badge ${done ? 'badge-green' : 'badge-purple'}`}>
                    {task.points} pts
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {pct === 100 && (
        <div className="mt-4 text-center p-4 bg-brand-900/30 border border-brand-800/50 rounded-2xl">
          <div className="text-2xl mb-1">🎉</div>
          <p className="text-brand-300 font-medium text-sm">All tasks done! You earned {totalPts} points today.</p>
        </div>
      )}
    </div>
  )
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

function Skeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-800 rounded w-48 mb-2" />
      <div className="h-4 bg-gray-800 rounded w-32 mb-6" />
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-800 rounded-2xl" />)}
      </div>
      <div className="h-2 bg-gray-800 rounded-full mb-6" />
      <div className="card flex flex-col gap-3">
        {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-gray-800 rounded-xl" />)}
      </div>
    </div>
  )
}
