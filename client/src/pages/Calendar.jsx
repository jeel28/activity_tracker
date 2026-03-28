import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday, parseISO } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../lib/api'

const ICONS = { exercise:'🏃', reading:'📚', meditation:'🧘', study:'📖', work:'💼', health:'💊', habit:'⭐', custom:'✅' }
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function Calendar() {
  const [current, setCurrent] = useState(new Date())
  const [selected, setSelected] = useState(new Date())
  const [logs, setLogs] = useState({})
  const [tasks, setTasks] = useState([])
  const [dayLogs, setDayLogs] = useState([])
  const [events, setEvents] = useState([])
  const [monthEvents, setMonthEvents] = useState({})
  const [newEvt, setNewEvt] = useState({ text: '', time: '' })
  const [loading, setLoading] = useState(false)

  const year  = current.getFullYear()
  const month = current.getMonth()

  useEffect(() => { fetchMonthData() }, [current])
  useEffect(() => { fetchDayDetail() }, [selected])

  async function fetchMonthData() {
    try {
      const [tRes, evtRes] = await Promise.all([
        api.get('/tasks'),
        api.get(`/events/month/${year}/${month + 1}`),
      ])
      setTasks(tRes.data)
      // Group events by date
      const em = {}
      evtRes.data.forEach(e => { em[e.date] = true })
      setMonthEvents(em)

      // Fetch logs for whole month
      const from = format(startOfMonth(current), 'yyyy-MM-dd')
      const to   = format(endOfMonth(current), 'yyyy-MM-dd')
      const lRes = await api.get(`/logs/range/${from}/${to}`)
      const lm = {}
      lRes.data.forEach(l => {
        if (!lm[l.date]) lm[l.date] = []
        lm[l.date].push(l)
      })
      setLogs(lm)
    } catch { toast.error('Failed to load calendar') }
  }

  async function fetchDayDetail() {
    const dateKey = format(selected, 'yyyy-MM-dd')
    setLoading(true)
    try {
      const [lRes, eRes] = await Promise.all([
        api.get(`/logs/${dateKey}`),
        api.get(`/events/${dateKey}`),
      ])
      setDayLogs(lRes.data)
      setEvents(eRes.data)
    } catch { toast.error('Failed to load day') }
    finally { setLoading(false) }
  }

  async function addEvent() {
    if (!newEvt.text.trim()) return
    const dateKey = format(selected, 'yyyy-MM-dd')
    try {
      const res = await api.post('/events', { date: dateKey, text: newEvt.text, time: newEvt.time })
      setEvents(e => [...e, res.data])
      setMonthEvents(m => ({ ...m, [dateKey]: true }))
      setNewEvt({ text: '', time: '' })
      toast.success('Reminder added!')
    } catch { toast.error('Failed to add reminder') }
  }

  async function deleteEvent(id) {
    try {
      await api.delete(`/events/${id}`)
      setEvents(e => e.filter(ev => ev.id !== id))
    } catch { toast.error('Failed to delete') }
  }

  const days = eachDayOfInterval({ start: startOfMonth(current), end: endOfMonth(current) })
  const startPad = getDay(startOfMonth(current))

  function getDayPct(dateStr) {
    const dayLog = logs[dateStr] || []
    const done = dayLog.filter(l => l.done).length
    return tasks.length ? Math.round(done / tasks.length * 100) : 0
  }

  const selectedKey = format(selected, 'yyyy-MM-dd')
  const doneLogs = dayLogs.filter(l => l.done)

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-5">Calendar</h1>
      <div className="card mb-4">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCurrent(d => new Date(d.getFullYear(), d.getMonth()-1,1))}
            className="p-2 rounded-xl hover:bg-gray-800 transition-colors text-gray-400 hover:text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <span className="font-semibold">{MONTHS[month]} {year}</span>
          <button onClick={() => setCurrent(d => new Date(d.getFullYear(), d.getMonth()+1,1))}
            className="p-2 rounded-xl hover:bg-gray-800 transition-colors text-gray-400 hover:text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map(d => <div key={d} className="text-center text-xs text-gray-500 py-1">{d}</div>)}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array(startPad).fill(null).map((_, i) => <div key={`pad-${i}`} />)}
          {days.map(day => {
            const key = format(day, 'yyyy-MM-dd')
            const pct = getDayPct(key)
            const isSel = isSameDay(day, selected)
            const today = isToday(day)
            const hasEvt = monthEvents[key]
            const alpha = pct > 0 ? 0.15 + (pct / 100) * 0.5 : 0
            return (
              <button
                key={key}
                onClick={() => setSelected(day)}
                className={`relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition-all
                  ${isSel ? 'ring-2 ring-brand-400 bg-brand-900/40' : 'hover:bg-gray-800'}
                  ${today ? 'font-semibold text-brand-400' : 'text-gray-300'}
                `}
                style={pct > 0 && !isSel ? { background: `rgba(22,176,126,${alpha})` } : {}}
              >
                {day.getDate()}
                {hasEvt && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-orange-400" />}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-800 text-xs text-gray-500">
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-brand-700/60" /> Tasks done</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-400" /> Reminder</div>
        </div>
      </div>

      {/* Day detail */}
      <div className="card">
        <h2 className="font-semibold mb-4">{format(selected, 'EEEE, MMMM d, yyyy')}</h2>
        {loading ? (
          <div className="animate-pulse flex flex-col gap-2">
            {[1,2,3].map(i=><div key={i} className="h-10 bg-gray-800 rounded-xl"/>)}
          </div>
        ) : (
          <>
            {/* Task logs for this day */}
            {tasks.length > 0 && (
              <div className="mb-5">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Tasks</p>
                <div className="flex flex-col gap-1.5">
                  {tasks.map(t => {
                    const log = dayLogs.find(l => l.taskId === t.id)
                    const done = log?.done
                    return (
                      <div key={t.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm border
                        ${done ? 'bg-brand-900/20 border-brand-800/40 text-gray-300' : 'bg-gray-800/40 border-gray-700/40 text-gray-500'}`}>
                        <span>{done ? '✓' : '○'}</span>
                        <span>{ICONS[t.icon]} {t.name}</span>
                        {done && <span className="ml-auto badge badge-green">{t.points}pts</span>}
                      </div>
                    )
                  })}
                </div>
                {doneLogs.length > 0 && (
                  <p className="text-xs text-brand-400 mt-2">
                    {doneLogs.length}/{tasks.length} tasks · {doneLogs.reduce((s,l)=>s+(tasks.find(t=>t.id===l.taskId)?.points||0),0)} pts
                  </p>
                )}
              </div>
            )}

            {/* Reminders */}
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Reminders</p>
              {events.length === 0 && <p className="text-sm text-gray-600 mb-3">No reminders for this day.</p>}
              <div className="flex flex-col gap-1.5 mb-3">
                {events.map(e => (
                  <div key={e.id} className="flex items-center gap-3 px-3 py-2.5 bg-orange-950/30 border border-orange-900/40 rounded-xl text-sm">
                    <span className="text-orange-400">🔔</span>
                    <span className="flex-1 text-gray-300">{e.text}</span>
                    {e.time && <span className="text-xs text-gray-500 font-mono">{e.time}</span>}
                    <button onClick={() => deleteEvent(e.id)} className="text-gray-600 hover:text-red-400 transition-colors text-xs">✕</button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className="input flex-1 text-sm"
                  placeholder="Add reminder..."
                  value={newEvt.text}
                  onChange={e => setNewEvt(p => ({ ...p, text: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && addEvent()}
                />
                <input
                  type="time"
                  className="input w-28 text-sm"
                  value={newEvt.time}
                  onChange={e => setNewEvt(p => ({ ...p, time: e.target.value }))}
                />
                <button onClick={addEvent} className="btn-primary">Add</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
