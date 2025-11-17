import React, { useEffect, useState } from 'react'
import './Cohorts.css'
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiChevronDown, FiUsers, FiCalendar } from 'react-icons/fi'
import axios from '../../api/axios'

export const Cohorts = () => {
  const [cohorts, setCohorts] = useState([])
  const [courses, setCourses] = useState([])
  const [lecturers, setLecturers] = useState([])
  const [form, setForm] = useState({
    name: '', 
    capacity: '', 
    start_date: '', 
    end_date: '', 
    status: '', 
    course: '',
    lecturer: '' 
  })

  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState(null)

  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {

    const fetchCohorts = async () => {
      try{

        const res = await axios.get('catalog/cohorts/')
        setCohorts(res.data.results)

      }catch(err){
        console.error(err)
      }
    }

    const fetchCourses = async () => {
      try{

        const res = await axios.get('catalog/courses/')
        setCourses(res.data.results)

      }catch(err){
        console.error(err)
      }
    }

    const fetchLecturers = async () => {
      try{

        const res = await axios.get('users/?role=LECTURER')
        setLecturers(res.data.results)
        
      }catch(err) {
        console.error(err)
      }
    }

    fetchLecturers()
    fetchCourses()
    fetchCohorts()

  }, [])

  const handleOpenEdit = async (id) => {
    try{

      const res = await axios.get(`catalog/cohorts/${id}/`)
      const cohort = res.data

      setForm({
        name: cohort.name || '', 
        capacity: cohort.capacity || '', 
        start_date: cohort.start_date || '', 
        end_date: cohort.end_date || '', 
        status: cohort.status || '', 
        course: cohort.course || '', 
        lecturer: cohort.lecturer || '', 
      })

      setEditingId(id)
      setShowModal(true)

    }catch(err){
      console.error(err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try{

      if(editingId){

        const res = await axios.put(`catalog/cohorts/${editingId}/`, form)
        setCohorts(prev => prev.map(p => p.id === editingId ? { ...p, ...res.data } : p))


        setShowModal(false)
        setEditingId(null)
        setForm({ name: '', capacity: '', start_date: '', end_date: '', status: '', course: '', lecturer: null })

      }else{

        const res = await axios.post('catalog/cohorts/', form)

        setShowModal(false)
        setEditingId(null)
        setForm({ name: '', capacity: '', start_date: '', end_date: '', status: '', course: '', lecturer: null })

      }

    }catch(err){
      console.error(err)
    }
  }

  const handleDelete = async (cohortId) => {
    try{

      const res = await axios.delete(`catalog/cohorts/${cohortId}/`)
      setCohorts(prev => prev.filter(c => c.id !== cohortId));

    }catch(err){
      console.error(err)
    }
  }

  const handlePopupOpen = () => {
    setShowModal(true)
  }

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value})
  }


  const filteredCohorts = cohorts.filter((cohort) => {
    const lowerCaseSearch = search.toLowerCase()
    return (
      cohort.name.toLowerCase().includes(lowerCaseSearch)
    )
  })

  const getCohortName = (id) => {
    const c = courses.find(course => course.id === id)
    return c ? c.title : id
  }


  return (
    <div className="cohorts-container">
      <header className="cohorts-header">
        <div className="header-content">
          <h1>Cohorts</h1>
          <p className="subtitle">Manage your student cohorts</p>
        </div>
        <button className="btn-primary" onClick={handlePopupOpen}>
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
        {filteredCohorts.length === 0 ? (
          <div className="empty-state">
            <FiUsers size={40} />
            <p>No cohorts found</p>
          </div>
        ) : (
          filteredCohorts.map(cohort => (
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
                  <p className="cohort-program">{getCohortName(cohort.course)}</p>
                </div>

                <div className="cohort-stats">
                  <div className="stat">
                    <span className="label">Capacity</span>
                    <span className="number"> {cohort.capacity} </span>
                  </div>
                </div>

                <span className={`status`}>{cohort.status}</span>

                <button className="expand-btn">
                  <FiChevronDown size={18} style={{ transform: expandedId === cohort.id ? 'rotate(180deg)' : 'rotate(0)' }} />
                </button>
              </div>


              {expandedId === cohort.id && (
                <div className="cohort-details">
                  <div className="detail-row">
                    <div className="detail-col">
                      <span className="detail-label"><FiCalendar size={14} /> Start Date</span>
                      <span className="detail-value">{new Date(cohort.start_date).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-col">
                      <span className="detail-label"><FiCalendar size={14} /> End Date</span>
                      <span className="detail-value">{new Date(cohort.end_date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="detail-actions">
                    <button className="btn-edit" onClick={() => handleOpenEdit(cohort.id)} >
                      <FiEdit2 size={16} /> Edit
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(cohort.id)} >
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
              <h2>{editingId ? 'Edit Session' : 'New Session'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form className="modal-form" onSubmit={handleSubmit}>

              <div className="form-group">
                <label>Session Name *</label>
                <input
                  required
                  type="text"
                  name='name'
                  placeholder="e.g., Frontend Evening Group"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Course *</label>
                <select
                  required
                  value={form.course}
                  name='course'
                  onChange={handleChange}
                >
                  <option value=''> Select Course </option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}> {c.title} </option>
                  ))}
                </select>
                
              </div>

              <div className="form-group">
                <label>Lecturer *</label>
                
                <select
                  required
                  value={form.lecturer}
                  name='lecturer'
                  onChange={handleChange}
                >
                  <option value=''> Select lecturer </option>
                  {lecturers.map((l) => (
                    <option key={l.id} value={l.id}> {l.first_name} {l.last_name} </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Capacity *</label>
                <input
                  required
                  type="number"
                  min="1"
                  placeholder="e.g., 25"
                  value={form.capacity}
                  name='capacity'
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    required
                    type="date"
                    value={form.start_date}
                    onChange={handleChange}
                    name='start_date'
                  />
                </div>

                <div className="form-group">
                  <label>End Date *</label>
                  <input
                    required
                    type="date"
                    value={form.end_date}
                    onChange={handleChange}
                    name='end_date'
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Status *</label>
                <select
                  required
                  value={form.status}
                  name='status'
                  onChange={handleChange}
                >
                  <option value="">Select status...</option>
                  <option value="PLANNED">Planned</option>
                  <option value="ENROLLING">Enrolling</option>
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
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
