import React, { useState, useMemo } from 'react'
import './Sessions.css'

export const Sessions = () => {
  const initialSessions = [
    { id: 1, title: 'Intro to Cybersecurity', program: 'Programs', date: '2025-11-20', start: '09:00', end: '11:00', instructor: 'A. Smith' },
    { id: 2, title: 'Network Fundamentals', program: 'Programs', date: '2025-11-22', start: '13:00', end: '15:00', instructor: 'B. Jones' },
  ]

  const [sessions, setSessions] = useState(initialSessions)
  const [query, setQuery] = useState('')
  const [filterProgram, setFilterProgram] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ title: '', program: '', date: '', start: '', end: '', instructor: '' })

  const programs = useMemo(() => {
    return Array.from(new Set(sessions.map(s => s.program))).filter(Boolean)
  }, [sessions])

  const filtered = sessions.filter(s => {
    const matchesQuery = query === '' || s.title.toLowerCase().includes(query.toLowerCase())
    const matchesProgram = !filterProgram || s.program === filterProgram
    return matchesQuery && matchesProgram
  })

  function handleChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  function handleAdd(e) {
    e.preventDefault()
    const newSession = { id: Date.now(), ...form }
    setSessions(s => [newSession, ...s])
    setForm({ title: '', program: '', date: '', start: '', end: '', instructor: '' })
    setShowForm(false)
  }

  function handleDelete(id) {
    if (!window.confirm('Delete this session?')) return
    setSessions(s => s.filter(x => x.id !== id))
  }

  function startEdit(session) {
    setEditingId(session.id)
    setForm({ title: session.title, program: session.program, date: session.date, start: session.start, end: session.end, instructor: session.instructor })
    setShowForm(true)
  }

  function saveEdit(e) {
    e.preventDefault()
    setSessions(s => s.map(x => (x.id === editingId ? { ...x, ...form } : x)))
    setEditingId(null)
    setForm({ title: '', program: '', date: '', start: '', end: '', instructor: '' })
    setShowForm(false)
  }

  function cancelEdit() {
    setEditingId(null)
    setForm({ title: '', program: '', date: '', start: '', end: '', instructor: '' })
    setShowForm(false)
  }

  function Modal({ children, onClose, title }) {
    return (
      <div className="modal-overlay" onMouseDown={onClose}>
        <div className="modal" onMouseDown={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3>{title}</h3>
            <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
          </div>
          <div className="modal-body">{children}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="sessions-container">
      <header className="sessions-header">
        <h1>Sessions</h1>
        
        <div className="controls">
          <input placeholder="Search title..." value={query} onChange={e => setQuery(e.target.value)} />
          <select value={filterProgram} onChange={e => setFilterProgram(e.target.value)}>
            <option value="">All programs</option>
            {programs.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <button className="btn" onClick={() => { setShowForm(s => !s); setEditingId(null); setForm({ title: '', program: '', date: '', start: '', end: '', instructor: '' }) }}>
            {showForm ? 'Close' : 'Add session'}
          </button>
        </div>
      </header>

      {showForm && (
        <Modal title={editingId ? 'Edit session' : 'Add session'} onClose={() => { setShowForm(false); cancelEdit() }}>
          <form className="session-form modal-form" onSubmit={editingId ? saveEdit : handleAdd}>
            <div className="form-grid">
              <label>
                <div className="label">Title</div>
                <input name="title" required placeholder="Title" value={form.title} onChange={handleChange} />
              </label>
              <label>
                <div className="label">Program</div>
                <input name="program" placeholder="Program" value={form.program} onChange={handleChange} />
              </label>
              <label>
                <div className="label">Date</div>
                <input name="date" type="date" required value={form.date} onChange={handleChange} />
              </label>
              <label>
                <div className="label">Start</div>
                <input name="start" type="time" required value={form.start} onChange={handleChange} />
              </label>
              <label>
                <div className="label">End</div>
                <input name="end" type="time" required value={form.end} onChange={handleChange} />
              </label>
              <label>
                <div className="label">Instructor</div>
                <input name="instructor" placeholder="Instructor" value={form.instructor} onChange={handleChange} />
              </label>
            </div>
            <div className="form-actions">
              <button className="btn" type="submit">{editingId ? 'Save' : 'Create'}</button>
              <button type="button" className="btn muted" onClick={() => { setShowForm(false); cancelEdit() }}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      <table className="sessions-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Program</th>
            <th>Date</th>
            <th>Time</th>
            <th>Instructor</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <tr><td colSpan={6} className="empty">No sessions found</td></tr>
          )}
          {filtered.map(s => (
            <tr key={s.id}>
              <td>{s.title}</td>
              <td>{s.program}</td>
              <td>{s.date}</td>
              <td>{s.start} - {s.end}</td>
              <td>{s.instructor}</td>
              <td className="actions">
                <button className="btn small" onClick={() => startEdit(s)}>Edit</button>
                <button className="btn small danger" onClick={() => handleDelete(s.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Sessions
