import React, { useEffect, useState } from 'react'
import './Programs.css'
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi'
import axios from '../../api/axios'

export const Programs = () => {
  const [programs, setPrograms] = useState([])
  const [form, setForm] = useState({ name: '', code: '', description: '', version: '', active: true, })
  const [showModal, setShowModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedProgram, setSelectedProgram] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    const fetchPrograms = async () => {
      try{

        const res = await axios.get('catalog/programs/')
        setPrograms(res.data.results)

      }catch(err){
        console.error(err)
      }
    }

    fetchPrograms()
  }, [])

  const fetchProgramById = async (programId) => {
    setLoadingDetail(true)
    try{
      const res = await axios.get(`catalog/programs/${programId}/`)
      setSelectedProgram(res.data)
      setShowDetailModal(true)
    }catch(err){
      console.error('Error fetching program details:', err)
    }finally{
      setLoadingDetail(false)
    }
  }


  const handleDelete = async (programId) => {
    try{

      const res = await axios.delete(`catalog/programs/${programId}/`)
      setPrograms(prev => prev.filter(d => d.id !== programId))

    }catch(err){
      console.error(err)
    }
  }

  // Function to open edit mode - fetches program data and populates the form
  const openEdit = async (programId) => {
    try {
      const res = await axios.get(`catalog/programs/${programId}/`)
      const program = res.data
      
      setForm({
        name: program.name || '',
        code: program.code || '',
        description: program.description || '',
        version: program.version || '',
        active: program.active !== undefined ? program.active : true
      })
      
      setEditingId(programId)
      setShowModal(true)
      
    } catch (err) {
      console.error('Error fetching program for edit:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try{

      if(editingId){

        const res = await axios.put(`catalog/programs/${editingId}/`, form)
        setPrograms(prev => prev.map(p => p.id === editingId ? { ...p, ...res.data } : p))

        setShowModal(false)
        setEditingId(null)
        setForm({ name: '', code: '', description: '', version: '', active: true })

      }else{
        
        const res = await axios.post('catalog/programs/', form)
        setPrograms(prev => [...prev, res.data])

        setShowModal(false)
        setForm({ name: '', code: '', description: '', version: '', active: true })

      }

    }catch(err){
      console.error(err)
    }
  }

  const handleChange = (e) => {
    const { name, value, type } = e.target
    let finalValue = value
    
    if (name === 'active') {
      finalValue = value === 'true' || value === true
    }
    
    setForm({...form, [name]: finalValue})
  }

  const handleCardClick = (programId, e) => {
    if(e.target.closest('.card-actions') || e.target.closest('.btn-action')) {
      return
    }
    fetchProgramById(programId)
  }

  const filteredPrograms = programs.filter((program) => {
    const lowerCaseSearch = search.toLowerCase();
    return (
      program.name.toLowerCase().includes(lowerCaseSearch) ||
      program.code.toLowerCase().includes(lowerCaseSearch)
    )
  })

  const openCreate = () => {
    setForm({ name: '', code: '', description: '', version: '', active: true })
    setEditingId(null)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
    setForm({ name: '', code: '', description: '', version: '', active: true })
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
        {filteredPrograms.length === 0 ? (
          <div className="empty-state">
            <p>No programs found</p>
          </div>
        ) : (
          filteredPrograms.map(program => (
            <div 
              key={program.id} 
              className="program-card"
              onClick={(e) => handleCardClick(program.id, e)}
              style={{ cursor: 'pointer' }}
            >
              <div className="card-header">
                <div className="card-header-content">
                  <h3 title={program.name}>{program.name}</h3>
                  <span className="code" title={program.code}>{program.code}</span>
                </div>
                <span className='program_version' title={program.version}>{program.version}</span>
              </div>

              <div className="card-info">
                <div className="info-row">
                  <span className="label">Description</span>
                  <span className="value" title={program.description || 'No description provided'}>
                    {program.description || 'No description provided'}
                  </span>
                </div>
              </div>

              <div className="card-actions">
                <button 
                  className="btn-action edit" 
                  title="Edit"
                  onClick={(e) => {
                    e.stopPropagation()
                    openEdit(program.id)
                  }}
                >
                  <FiEdit2 size={16} />
                </button>
                <button 
                  className="btn-action delete" 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(program.id)
                  }} 
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
              <h2>{editingId ? 'Edit Program' : 'New Program'}</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            
            <form className="modal-form" onSubmit={handleSubmit} >
              <div className="form-group">
                <label>Program Name *</label>
                <input
                  name='name'
                  required
                  type="text"
                  placeholder="e.g., Cybersecurity Fundamentals"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Program Code *</label>
                <input
                  name='code'
                  required
                  type="text"
                  placeholder="e.g., CSF-101"
                  value={form.code}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={form.description}
                  required
                  placeholder="Briefly describe the program."
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>version</label>
                <input
                  name='version'
                  type="text"
                  placeholder="Enter version"
                  value={form.version}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select name="active" value={form.active.toString()} onChange={handleChange}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
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

      {showDetailModal && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Program Details</h2>
              <button className="close-btn" onClick={() => setShowDetailModal(false)}>×</button>
            </div>
            
            {loadingDetail ? (
              <div className="modal-body">
                <p>Loading...</p>
              </div>
            ) : selectedProgram ? (
              <div className="modal-body">
                <div className="detail-section">
                  <div className="detail-row">
                    <span className="detail-label">Program Name</span>
                    <span className="detail-value">{selectedProgram.name}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Program Code</span>
                    <span className="detail-value">{selectedProgram.code}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Version</span>
                    <span className="detail-value">{selectedProgram.version || 'N/A'}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Status</span>
                    <span className="detail-value">
                      <span className={`status-badge ${selectedProgram.active ? 'active' : 'inactive'}`}>
                        {selectedProgram.active ? 'Active' : 'Inactive'}
                      </span>
                    </span>
                  </div>
                  
                  <div className="detail-row full-width">
                    <span className="detail-label">Description</span>
                    <div className="detail-description">
                      {selectedProgram.description || 'No description provided'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="modal-body">
                <p>No program data available</p>
              </div>
            )}

            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setShowDetailModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Programs
