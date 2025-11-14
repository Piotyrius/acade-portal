import React, { useState } from 'react'
import './Cources.css'
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiBook } from 'react-icons/fi'

export const Cources = () => {
  const [courses, setCourses] = useState([
    { id: 1, title: 'Intro to Cybersecurity', code: 'CS-101', credits: 3, instructor: 'Dr. Smith', level: 'Beginner', status: 'Active' },
    { id: 2, title: 'Network Fundamentals', code: 'NET-201', credits: 4, instructor: 'Prof. Jones', level: 'Intermediate', status: 'Active' },
    { id: 3, title: 'Web Development Basics', code: 'WEB-102', credits: 3, instructor: 'Mr. Brown', level: 'Beginner', status: 'Active' },
    { id: 4, title: 'Advanced Python', code: 'PY-301', credits: 4, instructor: 'Dr. Lee', level: 'Advanced', status: 'Planned' },
  ])

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ title: '', code: '', credits: 3, instructor: '', level: 'Beginner', status: 'Active' })

  const filtered = courses.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) || 
    c.code.toLowerCase().includes(search.toLowerCase())
  )

  function openCreate() {
    setEditingId(null)
    setForm({ title: '', code: '', credits: 3, instructor: '', level: 'Beginner', status: 'Active' })
    setShowModal(true)
  }

  function openEdit(course) {
    setEditingId(course.id)
    setForm(course)
    setShowModal(true)
  }

  function handleSave(e) {
    e.preventDefault()
    if (editingId) {
      setCourses(courses.map(c => c.id === editingId ? { ...c, ...form } : c))
    } else {
      setCourses([{ id: Date.now(), ...form }, ...courses])
    }
    setShowModal(false)
  }

  function handleDelete(id) {
    if (window.confirm('Delete this course?')) {
      setCourses(courses.filter(c => c.id !== id))
    }
  }

  const getLevelColor = (level) => {
    const colors = { Beginner: '#10b981', Intermediate: '#f59e0b', Advanced: '#ef4444' }
    return colors[level] || '#6b7280'
  }

  return (
    <div className="courses-container">
      <header className="courses-header">
        <div className="header-content">
          <h1>Courses</h1>
          <p className="subtitle">Manage your academy courses</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <FiPlus size={18} /> New Course
        </button>
      </header>

      <div className="courses-controls">
        <div className="search-box">
          <FiSearch size={18} />
          <input
            placeholder="Search courses..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="courses-grid">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <FiBook size={40} />
            <p>No courses found</p>
          </div>
        ) : (
          filtered.map(course => (
            <div key={course.id} className="course-card">
              <div className="card-top">
                <div className="card-header">
                  <h3>{course.title}</h3>
                  <span className="code">{course.code}</span>
                </div>
                <span className={`status status-${course.status.toLowerCase()}`}>{course.status}</span>
              </div>

              <div className="card-info">
                <div className="info-row">
                  <span className="label">Level</span>
                  <span className="level-badge" style={{ backgroundColor: `${getLevelColor(course.level)}20`, color: getLevelColor(course.level) }}>
                    {course.level}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Credits</span>
                  <span className="value">{course.credits}</span>
                </div>
                <div className="info-row">
                  <span className="label">Instructor</span>
                  <span className="value">{course.instructor}</span>
                </div>
              </div>

              <div className="card-actions">
                <button className="btn-action edit" onClick={() => openEdit(course)} title="Edit">
                  <FiEdit2 size={16} />
                </button>
                <button className="btn-action delete" onClick={() => handleDelete(course.id)} title="Delete">
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
              <h2>{editingId ? 'Edit Course' : 'New Course'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <form className="modal-form" onSubmit={handleSave}>
              <div className="form-group">
                <label>Course Title *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g., Intro to Cybersecurity"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Course Code *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g., CS-101"
                  value={form.code}
                  onChange={e => setForm({ ...form, code: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Credits *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    max="6"
                    placeholder="3"
                    value={form.credits}
                    onChange={e => setForm({ ...form, credits: parseInt(e.target.value) || 1 })}
                  />
                </div>

                <div className="form-group">
                  <label>Level *</label>
                  <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Instructor</label>
                <input
                  type="text"
                  placeholder="e.g., Dr. Smith"
                  value={form.instructor}
                  onChange={e => setForm({ ...form, instructor: e.target.value })}
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

export default Cources
