import React, { useState, useEffect } from 'react'
import './Cources.css'
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiBook } from 'react-icons/fi'
import axios from '../../api/axios'

export const Cources = () => {
  const [courses, setCourses] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    title: '', 
    code: '', 
    hours: '', 
    credits: '',
    syllabus_version: '',
    description: '',
    program: ''
  })
  const [programs, setPrograms] = useState([])
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState(null)


  useEffect(() => {

    const fetchCourses = async () => {
      try{

        const res = await axios.get('catalog/courses/')
        setCourses(res.data.results)

      }catch(err){
        console.error(err)
      }
    }

    const fetchPrograms = async () => {
      try{

        const res = await axios.get('catalog/programs/')
        setPrograms(res.data.results)

      }catch(err){
        console.error(err)
      }
    }

    fetchPrograms()
    fetchCourses()
  }, [])

  const openEdit = async (id) => {
    try{

      const res = await axios.get(`catalog/courses/${id}/`)
      const course = res.data

      setForm({
        title: course.title || '', 
        code: course.code || '', 
        hours: course.hours || 0, 
        credits: course.credits || 0, 
        syllabus_version: course.syllabus_version || '', 
        description: course.description || '', 
        program: course.program || ''
      })

      setEditingId(id)
      setShowModal(true)

    }catch(err){
      console.error('Error fetching course for edit:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try{

      if(editingId){

        try{
          
          const res = await axios.put(`catalog/courses/${editingId}/`, form)
          setCourses(prev => prev.map(p => p.id === editingId ? { ...p, ...res.data } : p))

          setForm({
            title: '', 
            code: '', 
            hours: '',
            credits: '0', 
            syllabus_version: '',
            description: '',
            program: ''
          })
          setShowModal(false)

        }catch(err){
          console.err(err

          )
        }

      }else{

        const res = await axios.post('catalog/courses/', form)
        setCourses(prev => [...prev, res.data])


        setForm({
          title: '', 
          code: '', 
          hours: '',
          credits: '', 
          syllabus_version: '',
          description: '',
          program: '',
        })
        setShowModal(false)

      }

    }catch(err){
      console.error(err)
    }
  }

  const handleDelete = async (id) => {
    try{
      const res = await axios.delete(`catalog/courses/${id}/`)
      setCourses(prev => prev.filter(course => course.id !== id))
    }catch(err){
      console.error('Error deleting course:', err)
    }
  }

  const openCreate = () => {
    setForm({
      title: '', 
      code: '', 
      hours: 0, 
      credits: 0, 
      syllabus_version: '',
      description: '',
      program: '',
    })
    setEditingId(null)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
    setForm({
      title: '', 
      code: '', 
      hours: 0, 
      credits: 0, 
      syllabus_version: '',
      description: '',
      program: '',
    })
  }

  const handleChange = (e) => {
    const { name, value, type } = e.target
    let finalValue = value
    
    if (type === 'number') {
      finalValue = value === '' ? 0 : parseInt(value) || 0
    }
    
    setForm({...form, [name]: finalValue})
  }

  const filteredCourses = courses.filter((course) => {
    const lowerCaseSearch = search.toLowerCase()
    return (
      course.title?.toLowerCase().includes(lowerCaseSearch) ||
      course.code?.toLowerCase().includes(lowerCaseSearch)
    )
  })



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
        {filteredCourses.length === 0 ? (
          <div className="empty-state">
            <FiBook size={40} />
            <p>No courses found</p>
          </div>
        ) : (
          filteredCourses.map(course => (
            <div key={course.id} className="course-card">
              <div className="card-header">
                <div className="card-header-content">
                  <h3 title={course.title}>{course.title || 'N/A'}</h3>
                  <span className="code" title={course.code}>{course.code || 'N/A'}</span>
                </div>
              </div>

              <div className="card-info">
                <div className="info-row">
                  <span className="label">Hours</span>
                  <span className="value" title={course.hours?.toString()}>
                    {course.hours || 0}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Credits</span>
                  <span className="value" title={course.credits?.toString()}>
                    {course.credits || 0}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Syllabus Version</span>
                  <span className="value" title={course.syllabus_version}>
                    {course.syllabus_version || 'N/A'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Description</span>
                  <span className="value" title={course.description}>
                    {course.description || 'No description provided'}
                  </span>
                </div>
              </div>

              <div className="card-actions">
                <button 
                  className="btn-action edit" 
                  onClick={() => openEdit(course.id)} 
                  title="Edit"
                >
                  <FiEdit2 size={16} />
                </button>
                <button 
                  className="btn-action delete" 
                  onClick={() => handleDelete(course.id)} 
                  title="Delete"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit Course' : 'New Course'}</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Course Title *</label>
                <input
                  name="title"
                  required
                  type="text"
                  placeholder="e.g., Intro to Cybersecurity"
                  value={form.title}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Course Code *</label>
                <input
                  name="code"
                  required
                  type="text"
                  placeholder="e.g., CS-101"
                  value={form.code}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Hours *</label>
                  <input
                    name="hours"
                    required
                    type="number"
                    min="0"
                    placeholder="e.g., 40"
                    value={form.hours}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Credits *</label>
                  <input
                    name="credits"
                    required
                    type="number"
                    min="0"
                    placeholder="e.g., 3"
                    value={form.credits}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Syllabus Version</label>
                <input
                  name="syllabus_version"
                  type="text"
                  placeholder="e.g., v1.0"
                  value={form.syllabus_version}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  placeholder="Briefly describe the course."
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label>Programs</label>
                <select value={form.program} name='program' onChange={handleChange} required>
                  <option value=''> Select program </option>
                  {programs.map((pro) => (
                    <option key={pro.id} value={pro.id}> {pro.name} </option>
                  ))}
                </select>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingId ? 'Update' : 'Create'}
                </button>
                <button type="button" className="btn-secondary" onClick={closeModal}>
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
