import React, { useState } from 'react'
import './Programs.css'
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi'

export const Programs = () => {
  const [programs, setPrograms] = useState([
    { id: 1, name: 'Cybersecurity Fundamentals', code: 'CSF-101', duration: '12 weeks', students: 45, status: 'Active' },
    { id: 2, name: 'Fullstack Web Development', code: 'FWD-202', duration: '16 weeks', students: 38, status: 'Active' },
    { id: 3, name: 'Cloud Computing Basics', code: 'CCB-303', duration: '10 weeks', students: 22, status: 'Active' },
    { id: 4, name: 'Data Science Essentials', code: 'DSE-404', duration: '14 weeks', students: 31, status: 'Planned' },
  ])

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ name: '', code: '', duration: '', students: 0, status: 'Active' })

  const filtered = programs.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  function openCreate() {
    setEditingId(null)
    setForm({ name: '', code: '', duration: '', students: 0, status: 'Active' })
    setShowModal(true)
  }

  function openEdit(program) {
    setEditingId(program.id)
    setForm(program)
    setShowModal(true)
  }

  function handleSave(e) {
    e.preventDefault()
    if (editingId) {
      setPrograms(programs.map(p => p.id === editingId ? { ...p, ...form } : p))
    } else {
      setPrograms([{ id: Date.now(), ...form }, ...programs])
    }
    setShowModal(false)
  }

  function handleDelete(id) {
    if (window.confirm('Delete this program?')) {
      setPrograms(programs.filter(p => p.id !== id))
    }
  }

  return (
    <div className="programs-container">
      <header className="programs-header">
        <div className="header-content">
          <h1>Programs</h1>
          <p className="subtitle">Manage your academy programs</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <FiPlus size={18} /> New Program
        </button>
      </header>

      <div className="programs-controls">
        <div className="search-box">
          <FiSearch size={18} />
          <input
            placeholder="Search programs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="programs-grid">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <p>No programs found</p>
          </div>
        ) : (
          filtered.map(program => (
            <div key={program.id} className="program-card">
              <div className="card-header">
                <div>
                  <h3>{program.name}</h3>
                  <span className="code">{program.code}</span>
                </div>
                <span className={`status status-${program.status.toLowerCase()}`}>{program.status}</span>
              </div>

              <div className="card-info">
                <div className="info-row">
                  <span className="label">Duration</span>
                  <span className="value">{program.duration}</span>
                </div>
                <div className="info-row">
                  <span className="label">Students</span>
                  <span className="value badge">{program.students}</span>
                </div>
              </div>

              <div className="card-actions">
                <button className="btn-action edit" onClick={() => openEdit(program)} title="Edit">
                  <FiEdit2 size={16} />
                </button>
                <button className="btn-action delete" onClick={() => handleDelete(program.id)} title="Delete">
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit Program' : 'New Program'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <form className="modal-form" onSubmit={handleSave}>
              <div className="form-group">
                <label>Program Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g., Cybersecurity Fundamentals"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Program Code *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g., CSF-101"
                  value={form.code}
                  onChange={e => setForm({ ...form, code: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Duration *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g., 12 weeks"
                  value={form.duration}
                  onChange={e => setForm({ ...form, duration: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Students</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.students}
                  onChange={e => setForm({ ...form, students: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option>Active</option>
                  <option>Planned</option>
                  <option>Completed</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingId ? 'Update' : 'Create'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Programs
