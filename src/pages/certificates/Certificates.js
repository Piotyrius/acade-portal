import React, { useState, useMemo, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiDownload, FiAward } from 'react-icons/fi';
import './Certificates.css';
import axios from 'axios';

export const Certificates = () => {
  const [certificates, setCertificates] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [students, setStudents] = useState([])
  const [cohorts, setCohorts] = useState([])

  const [formData, setFormData] = useState({
    pdf_file: null,
    status: "",
    revoked_at: "",
    revoked_reason: "",
    student: "",
    cohort: "",
  })

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');


  useEffect(() => {

    const fetchCertificates = async () => {
      try{

        const res = await axios.get('certificates/certificates/')
        setCertificates(res.data.results)

      }catch(err){
        console.error(err)
      }
    }

    const fetchStudents = async () => {
      try{

        const res = await axios.get('users/')
        setStudents(res.data.results.filter((u) => u.role === "STUDENT"));

      }catch(err){
        console.error(err)
      }
    }

    const fetchCohorts = async () => {
      try{

        const res = await axios.get('catalog/cohorts/')
        setCohorts(res.data.results)
        
      }catch(err){
        console.error(err)
      }
    }

    fetchCohorts()
    fetchCertificates()
    fetchStudents()

  }, [])

  const handleOpenEdit = async (id) => {
    try{

      const res = await axios.get(`certificates/certificates/${id}/`)
      const certificate = res.data

      setFormData({
        pdf_file: null,
        status: certificate.status || '',
        revoked_at: certificate.revoked_at || '',
        revoked_reason: certificate.revoked_reason || '',
        student: certificate.student || '',
        cohort: certificate.cohort || '',
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

      const fd = new FormData()
      fd.append("pdf_file", formData.pdf_file)
      fd.append("status", formData.status)
      fd.append("revoked_at", formData.revoked_at || "")
      fd.append("revoked_reason", formData.revoked_reason || "")
      fd.append("student", formData.student)
      fd.append("cohort", formData.cohort)

      if(editingId){

        try{

          const res = await axios.put(`certificates/certificates/${editingId}/`, fd, {
            headers: { "Content-Type": "multipart/form-data" }
          })
          setCertificates(prev => prev.map(p => p.id === editingId ? { ...p, ...res.data } : p))


          setShowModal(false)
          setEditingId(null)
          setFormData({
            pdf_file: null,
            status: "",
            revoked_at: "",
            revoked_reason: "",
            student: "",
            cohort: "",
          })

        }catch(err){
          console.error(err)
        }

      }else{

        try{

          const res = await axios.post('certificates/certificates/', fd, {
            headers: { "Content-Type": "multipart/form-data" }
          })
          setCertificates(prev => [...prev, res.data])

          setShowModal(false)
          setFormData({
            pdf_file: null,
            status: "",
            revoked_at: "",
            revoked_reason: "",
            student: "",
            cohort: "",
          })

        }catch(err){
          console.error(err)
        }

      }

    }catch(err){
      console.error(err)
    }
  }

  const handleDelete = async (id) => {
    try{

      const res = await axios.delete(`certificates/certificates/${id}/`)
      setCertificates((prev) => {
        return prev.filter(c => c.id !== id)
      })

    }catch(err){
      console.error(err)
    }
  }

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value})
  }

  const handleFileChange = (e) => {
    setFormData({ ...formData, pdf_file: e.target.files[0] });
  }


  const handleAddClick = () => {
    setShowModal(true)
  }



  // const stats = {
  //   total: filteredCertificates.length,
  //   active: filteredCertificates.filter(c => c.status === 'active').length,
  //   expired: filteredCertificates.filter(c => c.status === 'expired').length
  // };

  return (
    <div className="certificates-container">
      <header className="certificates-header">
        <div className="header-content">
          <h1>Certificates Management</h1>
          <p className="subtitle">Manage and issue student certificates</p>
        </div>
        <button className="btn-primary" onClick={handleAddClick}>
          <FiPlus /> Issue Certificate
        </button>
      </header>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><FiAward /></div>
          <div className="stat-content">
            {/* <div className="stat-number">{stats.total}</div> */}
            <div className="stat-label">Total Certificates</div>
          </div>
        </div>
        <div className="stat-card stat-active">
          <div className="stat-icon"><FiAward /></div>
          <div className="stat-content">
            {/* <div className="stat-number">{stats.active}</div> */}
            <div className="stat-label">Active</div>
          </div>
        </div>
        <div className="stat-card stat-expired">
          <div className="stat-icon"><FiAward /></div>
          <div className="stat-content">
            {/* <div className="stat-number"> {stats.expired} </div> */}
            <div className="stat-label">Expired</div>
          </div>
        </div>
      </div>

      <div className="certificates-controls">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search by student name, course, or certificate code..."
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
            <option value="active">Active</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      <div className="certificates-grid">
        {certificates.length > 0 ? (
          certificates.map(cert => (
            <div key={cert.id} className="certificate-card">
              
              <div className="certificate-header">
                <div className="cert-icon">
                  <FiAward />
                </div>
                <span className={`status ${cert.status === "ISSUED" ? "status-issued" : "status-revoked"}`}>
                  {cert.status === "ISSUED" ? "Issued" : "Revoked"}
                </span>
              </div>
          
              <div className="certificate-body">
          
                <div className="cert-row">
                  <span className="cert-label">Student</span>
                  <span className="cert-value">{cert.student}</span>
                </div>
          
                <div className="cert-row">
                  <span className="cert-label">Cohort</span>
                  <span className="cert-value">{cert.cohort}</span>
                </div>
          
                <div className="cert-row">
                  <span className="cert-label">PDF</span>
                  {cert.pdf_file ? (
                    <a
                      href={cert.pdf_file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cert-download-link"
                    >
                      Open PDF
                    </a>
                  ) : (
                    <span className="cert-value">No file</span>
                  )}
                </div>
                
                {cert.status === "REVOKED" && (
                  <>
                    <div className="cert-row">
                      <span className="cert-label">Revoked At</span>
                      <span className="cert-value">{cert.revoked_at || "—"}</span>
                    </div>
                
                    <div className="cert-row">
                      <span className="cert-label">Reason</span>
                      <span className="cert-value">{cert.revoked_reason || "—"}</span>
                    </div>
                  </>
                )}
              </div>
              
              <div className="certificate-footer">
                
                <a
                  href={cert.pdf_file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-download"
                  title="Download PDF"
                >
                  <FiDownload /> Download
                </a>
              
                <button
                  className="btn-edit"
                  onClick={() => handleOpenEdit(cert.id)}
                  title="Edit"
                >
                  <FiEdit2 />
                </button>
              
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(cert.id)}
                  title="Delete"
                >
                  <FiTrash2 />
                </button>
              </div>
              
            </div>
          ))
        ) : (
          <div className="empty-state">
            <FiAward className="empty-icon" />
            <p>No certificates found</p>
          </div>
        )}

      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingId ? 'Edit Certificate' : 'Issue New Certificate'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit}>

              <label>PDF File *</label>
              <input type="file" accept="application/pdf" onChange={handleFileChange} />

              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="ISSUED">ISSUED</option>
                <option value="REVOKED">REVOKED</option>
              </select>

              <label>Student *</label>
              <select name="student" value={formData.student} onChange={handleChange}>
                <option value="">Select student</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.first_name} {s.last_name}
                  </option>
                ))}
              </select>

              <label>Cohort *</label>
              <select name="cohort" value={formData.cohort} onChange={handleChange}>
                <option value="">Select cohort</option>
                {cohorts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <label>Revoked At</label>
              <input
                type="datetime-local"
                name="revoked_at"
                value={formData.revoked_at}
                onChange={handleChange}
              />

              <label>Revoked Reason</label>
              <textarea
                name="revoked_reason"
                value={formData.revoked_reason}
                onChange={handleChange}
              />

              <button className="btn-primary" type="submit">
                {editingId ? "Save Changes" : "Issue Certificate"}
              </button>
            </form>

          </div>
        </div>
      )}
    </div>
  )
}
