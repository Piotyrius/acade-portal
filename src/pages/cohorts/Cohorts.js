import React, { useState } from 'react'
import './Cohorts.css'
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiChevronDown, FiUsers, FiCalendar } from 'react-icons/fi'

export const Cohorts = () => {
  const [cohorts, setCohorts] = useState([
    { id: 1, name: 'Cohort A - 2025', program: 'Cybersecurity', startDate: '2025-11-01', endDate: '2026-02-01', students: 42, status: 'Active' },
    { id: 2, name: 'Cohort B - 2025', program: 'Fullstack Dev', startDate: '2025-12-01', endDate: '2026-03-01', students: 38, status: 'Active' },
    { id: 3, name: 'Cohort C - 2026', program: 'Cloud Computing', startDate: '2026-01-15', endDate: '2026-04-15', students: 0, status: 'Planned' },
  ])

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ name: '', program: '', startDate: '', endDate: '', students: 0, status: 'Active' })

  const filtered = cohorts.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.program.toLowerCase().includes(search.toLowerCase())
  )

  function openCreate() {
    setEditingId(null)
    setForm({ name: '', program: '', startDate: '', endDate: '', students: 0, status: 'Active' })
    setShowModal(true)
  }

  function openEdit(cohort) {
    setEditingId(cohort.id)
    setForm(cohort)
    setShowModal(true)
  }

  function handleSave(e) {
    e.preventDefault()
    if (editingId) {
      setCohorts(cohorts.map(c => c.id === editingId ? { ...c, ...form } : c))
    } else {
      setCohorts([{ id: Date.now(), ...form }, ...cohorts])
    }
    setShowModal(false)
  }

  function handleDelete(id) {
    if (window.confirm('Delete this cohort?')) {
      setCohorts(cohorts.filter(c => c.id !== id))
    }
  }

  const getDurationDays = (start, end) => {
    const d1 = new Date(start)
    const d2 = new Date(end)
    const days = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24))
    return days > 0 ? `${days} days` : '-'
  }

  const getStatusBg = (status) => {
    return status === 'Active' ? 'active' : status === 'Planned' ? 'planned' : 'completed'
  }

  return (
    <div className="cohorts-container">
      <header className="cohorts-header">
        <div className="header-content">
          <h1>Cohorts</h1>
          <p className="subtitle">Manage your student cohorts</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <FiPlus size={18} /> New Cohort
        </button>
      </header>

      <div className="cohorts-controls">
        <div className="search-box">
          <FiSearch size={18} />
          <input
            placeholder="Search cohorts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="cohorts-list">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <FiUsers size={40} />
            <p>No cohorts found</p>
          </div>
        ) : (
          filtered.map(cohort => (
            <div key={cohort.id} className="cohort-item">
              <div 
                className="cohort-summary"
                onClick={() => setExpandedId(expandedId === cohort.id ? null : cohort.id)}
              >
                <div className="cohort-icon">
                  <FiUsers size={20} />
                </div>
                
                <div className="cohort-main">
                  <h3>{cohort.name}</h3>
                  <p className="cohort-program">{cohort.program}</p>
                </div>

                <div className="cohort-stats">
                  <div className="stat">
                    <span className="label">Students</span>
                    <span className="number">{cohort.students}</span>
                  </div>
                  <div className="stat">
                    <span className="label">Duration</span>
                    <span className="number">{getDurationDays(cohort.startDate, cohort.endDate)}</span>
                  </div>
                </div>

                <span className={`status ${getStatusBg(cohort.status)}`}>{cohort.status}</span>

                <button className="expand-btn" onClick={e => { e.stopPropagation(); setExpandedId(expandedId === cohort.id ? null : cohort.id) }}>
                  <FiChevronDown size={18} style={{ transform: expandedId === cohort.id ? 'rotate(180deg)' : 'rotate(0)' }} />
                </button>
              </div>

              {expandedId === cohort.id && (
                <div className="cohort-details">
                  <div className="detail-row">
                    <div className="detail-col">
                      <span className="detail-label"><FiCalendar size={14} /> Start Date</span>
                      <span className="detail-value">{new Date(cohort.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-col">
                      <span className="detail-label"><FiCalendar size={14} /> End Date</span>
                      <span className="detail-value">{new Date(cohort.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="detail-actions">
                    <button className="btn-edit" onClick={() => openEdit(cohort)}>
                      <FiEdit2 size={16} /> Edit
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(cohort.id)}>
                      <FiTrash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit Cohort' : 'New Cohort'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <form className="modal-form" onSubmit={handleSave}>
              <div className="form-group">
                <label>Cohort Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g., Cohort A - 2025"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Program *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g., Cybersecurity"
                  value={form.program}
                  onChange={e => setForm({ ...form, program: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    required
                    type="date"
                    value={form.startDate}
                    onChange={e => setForm({ ...form, startDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>End Date *</label>
                  <input
                    required
                    type="date"
                    value={form.endDate}
                    onChange={e => setForm({ ...form, endDate: e.target.value })}
                  />
                </div>
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

export default Cohorts
