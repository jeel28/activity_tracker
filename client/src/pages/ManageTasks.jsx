import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../lib/api'

const ICONS = { exercise:'🏃', reading:'📚', meditation:'🧘', study:'📖', work:'💼', health:'💊', habit:'⭐', custom:'✅' }

export default function ManageTasks() {
  const [tasks, setTasks]   = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', icon: 'habit', points: 5 })

  useEffect(() => { fetchTasks() }, [])

  async function fetchTasks() {
    setLoading(true)
    try {
      const res = await api.get('/tasks/all')
      setTasks(res.data)
    } catch { toast.error('Failed to load tasks') }
    finally { setLoading(false) }
  }

  async function saveTask() {
    if (!form.name.trim()) { toast.error('Task name is required'); return }
    try {
      if (editing) {
        const res = await api.put(`/tasks/${editing}`, form)
        setTasks(t => t.map(x => x.id === editing ? res.data : x))
        toast.success('Task updated!')
      } else {
        const res = await api.post('/tasks', { ...form, order: tasks.length })
        setTasks(t => [...t, res.data])
        toast.success('Task added!')
      }
      setForm({ name: '', icon: 'habit', points: 5 })
      setEditing(null)
    } catch { toast.error('Failed to save task') }
  }

  async function toggleActive(task) {
    try {
      const res = await api.put(`/tasks/${task.id}`, { ...task, active: !task.active })
      setTasks(t => t.map(x => x.id === task.id ? res.data : x))
    } catch { toast.error('Failed to update') }
  }

  async function deleteTask(id) {
    if (!confirm('Delete this task? All its logs will also be deleted.')) return
    try {
      await api.delete(`/tasks/${id}`)
      setTasks(t => t.filter(x => x.id !== id))
      toast.success('Task deleted')
    } catch { toast.error('Failed to delete') }
  }

  function startEdit(task) {
    setEditing(task.id)
    setForm({ name: task.name, icon: task.icon, points: task.points })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    setEditing(null)
    setForm({ name: '', icon: 'habit', points: 5 })
  }

  const active   = tasks.filter(t => t.active)
  const inactive = tasks.filter(t => !t.active)

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-5">Manage Tasks</h1>

      {/* Form */}
      <div className="card mb-5">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
          {editing ? 'Edit Task' : 'Add New Task'}
        </p>
        <input
          className="input mb-3"
          placeholder="Task name (e.g. Morning walk)"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          onKeyDown={e => e.key === 'Enter' && saveTask()}
        />
        <div className="flex gap-2 mb-3">
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">Icon</label>
            <select className="select" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}>
              {Object.entries(ICONS).map(([k, v]) => (
                <option key={k} value={k}>{v} {k.charAt(0).toUpperCase() + k.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="w-28">
            <label className="text-xs text-gray-500 mb-1 block">Points</label>
            <input
              type="number" min={1} max={100}
              className="input"
              value={form.points}
              onChange={e => setForm(f => ({ ...f, points: Number(e.target.value) }))}
            />
          </div>
        </div>

        {/* Preview */}
        <div className="flex items-center gap-3 px-4 py-3 bg-gray-800/60 rounded-xl mb-4 text-sm">
          <span className="text-lg">{ICONS[form.icon]}</span>
          <span className="flex-1 font-medium">{form.name || 'Task preview'}</span>
          <span className="badge badge-purple">{form.points} pts</span>
        </div>

        <div className="flex gap-2">
          <button onClick={saveTask} className="btn-primary flex-1">
            {editing ? 'Update Task' : 'Add Task'}
          </button>
          {editing && (
            <button onClick={cancelEdit} className="btn-ghost">Cancel</button>
          )}
        </div>
      </div>

      {/* Active tasks */}
      {loading ? (
        <div className="flex flex-col gap-2 animate-pulse">
          {[1,2,3].map(i=><div key={i} className="h-16 bg-gray-800 rounded-2xl"/>)}
        </div>
      ) : (
        <>
          <div className="card mb-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
              Active Tasks <span className="ml-1 badge badge-green">{active.length}</span>
            </p>
            {active.length === 0 ? (
              <p className="text-sm text-gray-600 py-4 text-center">No active tasks. Add one above!</p>
            ) : (
              <div className="flex flex-col gap-2">
                {active.map(task => (
                  <div key={task.id}
                    className="flex items-center gap-3 px-3 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl">
                    <span className="text-lg">{ICONS[task.icon]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{task.name}</p>
                    </div>
                    <span className="badge badge-purple">{task.points}pts</span>
                    <button onClick={() => startEdit(task)} className="btn-ghost text-xs px-2 py-1">Edit</button>
                    <button onClick={() => toggleActive(task)} className="btn-ghost text-xs px-2 py-1 text-yellow-500">Disable</button>
                    <button onClick={() => deleteTask(task.id)} className="btn-danger text-xs px-2 py-1">Del</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {inactive.length > 0 && (
            <div className="card">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
                Disabled Tasks <span className="ml-1 badge">{inactive.length}</span>
              </p>
              <div className="flex flex-col gap-2">
                {inactive.map(task => (
                  <div key={task.id}
                    className="flex items-center gap-3 px-3 py-3 bg-gray-800/20 border border-gray-800 rounded-xl opacity-50">
                    <span className="text-lg">{ICONS[task.icon]}</span>
                    <span className="flex-1 text-sm text-gray-500 line-through">{task.name}</span>
                    <button onClick={() => toggleActive(task)} className="btn-ghost text-xs px-2 py-1 text-brand-400 opacity-100">Enable</button>
                    <button onClick={() => deleteTask(task.id)} className="btn-danger text-xs px-2 py-1 opacity-100">Del</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
