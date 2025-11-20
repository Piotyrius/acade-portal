import React, { useState, useMemo, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX } from 'react-icons/fi';
import './Admissions.css';
import axios from '../../api/axios';

export const Admissions = () => {
  const [admissions, setAdmissions] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    schedule_pref: '',
    experience_level: '',
    referral_source: '',
    status: '',
    notes: '',
    program: ''
  });
  const [programs, setPrograms] = useState([])
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');


  const [editingId, setEditingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');



  useEffect(() => {
    const fetchAdmissions = async () => {
      try{

        const res = await axios.get('admissions/applications/')
        setAdmissions(res.data.results)

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
    fetchAdmissions()
  }, [])

  const handlePostAdmissions = async () => {
    try{

      const res = await axios.post('admissions/applications/', formData)

      window.location.reload(true)
      setShowModal(false)
      setFormData({
        name: '',
        email: '',
        phone: '',
        program: '',
        status: '',
        schedule_pref: '',
        experience_level: '',
        referral_source: '',
        notes: ''
      })

      setAdmissions([...admissions, res.data])

    }catch(err){
      console.error(err)
    }
  }

  const handleDeleteAdmissions = async (id) => {
    try{

      const res = await axios.delete(`admissions/applications/${id}/`)

      setAdmissions((prev) => {
        return prev.filter(admission => admission.id !== id)
      })

    }catch(err){
      console.error(err)
    }
  }

  const handleOpenEdit = async (id) => {
    try{

      const res = await axios.get(`admissions/applications/${id}/`)
      const admission = res.data

      setFormData({
        name: admission.name || '',
        email: admission.email || '',
        phone: admission.phone || '',
        program: admission.program || '',
        status: admission.status || '',
        schedule_pref: admission.schedule_pref || '',
        experience_level: admission.experience_level || '',
        referral_source: admission.referral_source || '',
        notes: admission.notes || ''
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

        const res = await axios.put(`admissions/applications/${editingId}/`, formData)
        setAdmissions(prev => prev.map(a => a.id === editingId ? { ...a, ...res.data } : a))

        setShowModal(false)
        setEditingId(null)
        setFormData({
          name: '',
          email: '',
          phone: '',
          program: '',
          status: '',
          schedule_pref: '',
          experience_level: '',
          referral_source: '',
          notes: ''
        })

      }else{

        const res = await axios.post('admissions/applications/', formData)
        setAdmissions(prev => [...prev, res.data])
        setShowModal(false)

      }

    }catch(err){
      console.error(err)
    }
  }


  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value})
  };

  const handleAddClick = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      program: '',
      status: 'pending',
      schedule_pref: '',
      experience_level: '',
      referral_source: '',
      notes: ''
    });
    setEditingId(null);
    setShowModal(true);
  };

  const filteredAdmissions = useMemo(() => {
    return admissions.filter(admission => {
      const matchesSearch = searchTerm === '' || 
        admission.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admission.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admission.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        programs.find(p => p.id === admission.program)?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = filterStatus === 'all' || 
        admission.status?.toLowerCase() === filterStatus.toLowerCase()
      
      return matchesSearch && matchesStatus
    })
  }, [admissions, searchTerm, filterStatus, programs])



  return (
    <div className="admissions-container">
      <header className="admissions-header">
        <div className="header-content">
          <h1>Admissions Management</h1>
          <p className="subtitle">Manage student applications and admissions</p>
        </div>
        <button className="btn-primary" onClick={handleAddClick}>
          <FiPlus /> New Application
        </button>
      </header>

      <div className="admissions-controls">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search by name, email, or program..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="NEW">New</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      <div className="admissions-grid">
        {filteredAdmissions.length === 0 ? (
          <div className="empty-state">
            <p>No applications found</p>
          </div>
        ) : (
          filteredAdmissions.map(admission => (
            <div key={admission.id} className="admission-card">
              <div className="card-header">
                <div className="card-header-content">
                  <div className="applicant-avatar">{admission.name?.charAt(0) || '?'}</div>
                  <div>
                    <h3 title={admission.name}>{admission.name || 'N/A'}</h3>
                    <span className="applicant-email" title={admission.email}>
                      {admission.email || 'No email'}
                    </span>
                  </div>
                </div>
                <span className={`status-badge status-${admission.status?.toLowerCase() || 'pending'}`}>
                  {admission.status || 'Pending'}
                </span>
              </div>

              <div className="card-info">
                <div className="info-row">
                  <span className="label">Phone</span>
                  <span className="value" title={admission.phone}>
                    {admission.phone || 'N/A'}
                  </span>
                </div>

                <div className="info-row">
                  <span className="label">Program</span>
                  <span className="value" title={programs.find(p => p.id === admission.program)?.name}>
                    {programs.find(p => p.id === admission.program)?.name || 'N/A'}
                  </span>
                </div>

                <div className="info-row">
                  <span className="label">Schedule Preference</span>
                  <span className="value" title={admission.schedule_pref}>
                    {admission.schedule_pref || 'N/A'}
                  </span>
                </div>

                <div className="info-row">
                  <span className="label">Experience Level</span>
                  <span className="value" title={admission.experience_level}>
                    {admission.experience_level || 'N/A'}
                  </span>
                </div>

                <div className="info-row">
                  <span className="label">Referral Source</span>
                  <span className="value" title={admission.referral_source}>
                    {admission.referral_source || 'N/A'}
                  </span>
                </div>

                <div className="info-row">
                  <span className="label">Notes</span>
                  <span className="value" title={admission.notes}>
                    {admission.notes || 'No notes provided'}
                  </span>
                </div>
              </div>

              <div className="card-actions">
                <button 
                  className="btn-action edit" 
                  title="Edit"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleOpenEdit(admission.id)
                  }}
                >
                  <FiEdit2 size={16} />
                </button>
                <button 
                  className="btn-action delete" 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteAdmissions(admission.id)
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
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingId ? 'Edit Application' : 'New Application'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <FiX />
              </button>
            </div>

            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    name="name"
                    type="text"
                    onChange={handleChange}
                    value={formData.name}
                    required
                    placeholder="Enter full name"
                  />
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <input
                    name="phone"
                    type="tel"
                    onChange={handleChange}
                    value={formData.phone}
                    required
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    name="email"
                    type="email"
                    onChange={handleChange}
                    value={formData.email}
                    required
                    placeholder="Enter email address"
                  />
                </div>

                <div className="form-group">
                  <label>Program</label>
                  <select name='program' value={formData.program} onChange={handleChange} required> 
                    <option value="">Select program...</option>
                    {programs.map((p) => (
                      <option key={p.id} value={p.id} > {p.name} </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Schedule Pref</label>
                  <input
                    name="schedule_pref"
                    type="text"
                    onChange={handleChange}
                    value={formData.schedule_pref}
                    placeholder="Preferred schedule (e.g., evenings)"
                  />
                </div>

                <div className="form-group">
                  <label>Experience</label>
                  <input
                    name="experience_level"
                    type="text"
                    onChange={handleChange}
                    value={formData.experience_level}
                    placeholder="Experience level (e.g., beginner)"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Referral Source</label>
                  <input
                    name="referral_source"
                    type="text"
                    onChange={handleChange}
                    value={formData.referral_source}
                    placeholder="How did they hear about us?"
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select name="status" value={formData.status} onChange={handleChange}>
                    <option value="NEW">New</option>
                    <option value="IN_REVIEW">In Review</option>
                    <option value="ACCEPTED">Accepted</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>

              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  onChange={handleChange}
                  value={formData.notes}
                  placeholder="Optional notes"
                  rows={4}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">{editingId ? 'Update' : 'Save'}</button>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
