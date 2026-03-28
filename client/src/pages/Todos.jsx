import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../lib/api'

const PRI = { high: 'badge-red', medium: 'badge-yellow', low: 'badge-green' }
const PRI_ORDER = { high: 0, medium: 1, low: 2 }

export default function Todos() {
  const [todos, setTodos] = useState([])
  const [filter, setFilter] = useState('all')
  const [form, setForm] = useState({ text: '', priority: 'medium', dueDate: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchTodos() }, [])

  async function fetchTodos() {
    setLoading(true)
    try {
      const res = await api.get('/todos')
      setTodos(res.data)
    } catch { toast.error('Failed to load todos') }
    finally { setLoading(false) }
  }

  async function addTodo() {
    if (!form.text.trim()) return
    try {
      const res = await api.post('/todos', form)
      setTodos(t => [res.data, ...t])
      setForm({ text: '', priority: 'medium', dueDate: '' })
      toast.success('Task added!')
    } catch { toast.error('Failed to add task') }
  }

  async function toggleTodo(todo) {
    try {
      const res = await api.put(`/todos/${todo.id}`, { ...todo, done: !todo.done })
      setTodos(t => t.map(x => x.id === todo.id ? res.data : x))
    } catch { toast.error('Failed to update') }
  }

  async function deleteTodo(id) {
    try {
      await api.delete(`/todos/${id}`)
      setTodos(t => t.filter(x => x.id !== id))
    } catch { toast.error('Failed to delete') }
  }

  const filtered = todos
    .filter(t => filter === 'all' ? true : filter === 'done' ? t.done : !t.done)
    .sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1
      return PRI_ORDER[a.priority] - PRI_ORDER[b.priority]
    })

  const pending = todos.filter(t => !t.done).length
  const done    = todos.filter(t => t.done).length

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-semibold">To-do List</h1>
        <div className="flex gap-2 text-xs">
          <span className="badge badge-purple">{pending} pending</span>
          <span className="badge badge-green">{done} done</span>
        </div>
      </div>

      {/* Add form */}
      <div className="card mb-4">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Add Task</p>
        <input
          className="input mb-2"
          placeholder="What needs to be done?"
          value={form.text}
          onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
          onKeyDown={e => e.key === 'Enter' && addTodo()}
        />
        <div className="flex gap-2 mt-2">
          <select className="select flex-1" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
            <option value="high">🔴 High priority</option>
            <option value="medium">🟡 Medium priority</option>
            <option value="low">🟢 Low priority</option>
          </select>
          <input type="date" className="input flex-1" value={form.dueDate}
            onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
          <button onClick={addTodo} className="btn-primary whitespace-nowrap">Add</button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {['all','active','done'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`tab capitalize ${filter === f ? 'tab-active' : 'tab-inactive'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex flex-col gap-2 animate-pulse">
          {[1,2,3].map(i=><div key={i} className="h-16 bg-gray-800 rounded-2xl"/>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <div className="text-4xl mb-3">✅</div>
          <p className="text-sm">No tasks here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(todo => (
            <div key={todo.id}
              className={`card flex items-center gap-3 transition-all ${todo.done ? 'opacity-60' : ''}`}>
              <button
                onClick={() => toggleTodo(todo)}
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all
                  ${todo.done ? 'bg-brand-500 border-brand-500' : 'border-gray-600 hover:border-brand-500'}`}>
                {todo.done && <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} className="w-3.5 h-3.5"><path d="M20 6L9 17l-5-5"/></svg>}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${todo.done ? 'line-through text-gray-500' : ''}`}>
                  {todo.text}
                </p>
                {todo.dueDate && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    Due {format(new Date(todo.dueDate + 'T00:00:00'), 'MMM d, yyyy')}
                  </p>
                )}
              </div>
              <span className={`badge ${PRI[todo.priority]}`}>{todo.priority}</span>
              <button onClick={() => deleteTodo(todo.id)}
                className="text-gray-700 hover:text-red-400 transition-colors text-sm ml-1">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
