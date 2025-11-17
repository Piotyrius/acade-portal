import React, { useState, useMemo, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiCheck, FiX as FiClose } from 'react-icons/fi';
import './Attendance.css';
import axios from '../../api/axios'

export const Attendance = () => {
  const [attendance, setAttendance] = useState([])

  const [showModal, setShowModal] = useState(false)

  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDate, setFilterDate] = useState('')

  const [formData, setFormData] = useState({
    student: '',
    session: '',
    note: '',
    status: '',
  })


  useEffect(() => {

    const fetchAttandance = async () => {
      try{

        const res = await axios.get('attendance/attendance/')
        setAttendance(res.data.results)

      }catch(err){
        console.error(err)
      }
    }

    fetchAttandance()

  }, [])


  const handleOpenEdit = async (id) => {
    try{
      
      const res = await axios.get(`attendance/attendance/${id}/`)
      const attendance = res.data

      setFormData({
        student: attendance.student || '',
        session: attendance.session || '',
        note: attendance.note || '',
        status: attendance.status || '',
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

        const res = await axios.put(`attendance/attendance/${editingId}/`, formData)
        setAttendance(prev => prev.map(p => p.id === editingId ? { ...p, ...res.data } : p))

        setShowModal(false)
        setFormData({
          student: '',
          session: '',
          note: '',
          status: '',
        })
        setEditingId(null)

      }else{

        const res = await axios.post('attendance/attendance/', formData)
        setAttendance(prev => [...prev, res.data])

        setShowModal(false)
        setFormData({
          student: '',
          session: '',
          note: '',
          status: '',
        })

      }

    }catch(err){
      console.error(err)
    }

  }

  const handleDelete = async (id) => {
    try{

      const res = await axios.delete(`attendance/attendance/${id}/`)
      setAttendance((prev) => {
        return prev.filter(a => a !== id)
      })

    }catch(err){
      console.error(err)
    }
  }







  const handleOpenPopup = () => {
    setShowModal(true)
  }

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value})
  }



  const stats = {
    total: attendance.length,
    present: attendance.filter(r => r.status === 'PRESENT').length,
    absent: attendance.filter(r => r.status === 'absent').length,
    late: attendance.filter(r => r.status === 'late').length
  };

  return (
    <div className="attendance-container">
      <header className="attendance-header">
        <div className="header-content">
          <h1>Attendance Management</h1>
          <p className="subtitle">Track student attendance and manage records</p>
        </div>
        <button className="btn-primary" onClick={handleOpenPopup}>
          <FiPlus /> New Record
        </button>
      </header>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Records</div>
        </div>
        <div className="stat-card stat-present">
          <div className="stat-number">{stats.present}</div>
          <div className="stat-label">Present</div>
        </div>
        <div className="stat-card stat-absent">
          <div className="stat-number">{stats.absent}</div>
          <div className="stat-label">Absent</div>
        </div>
        <div className="stat-card stat-late">
          <div className="stat-number">{stats.late}</div>
          <div className="stat-label">Late</div>
        </div>
      </div>

      <div className="attendance-controls">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search by student name or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="filter-date"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
          </select>
        </div>
      </div>

      <div className="attendance-table-wrapper">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Course</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {attendance.length > 0 ? (
              attendance.map(record => (
                <tr key={record.id}>
                  <td>
                    <div className="student-name">{record.studentName}</div>
                  </td>
                  <td>{record.course}</td>
                  <td>{record.date}</td>
                  <td>{record.time}</td>
                  <td>
                    <span className={`status`}>
                      <span className="status-icon"></span>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => handleOpenEdit(record.id)}
                        title="Edit"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(record.id)}
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="empty-state">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingId ? 'Edit Record' : 'New Attendance Record'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <FiX />
              </button>
            </div>

            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Student Name *</label>
                  <input
                    type="text"
                    name="student"
                    value={formData.student}
                    onChange={handleChange}
                    placeholder="Enter student name"
                  />
                </div>

                <div className="form-group">
                  <label>Session *</label>
                  <select
                    name="course"
                    value={formData.session}
                    onChange={handleChange}
                  >
                    
                  </select>
                </div>

              </div>

              <div className="form-group">
                <label>Note *</label>

                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  placeholder="Notes"
                />

              </div>

              <div className="form-group">
                <label>Status</label>
                <div className="status-buttons">
                  <button
                    type="button"
                    className={`status-btn ${formData.status === 'PRESENT' ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, status: 'PRESENT' }))}
                  >
                    ✓ Present
                  </button>
                  <button
                    type="button"
                    className={`status-btn ${formData.status === 'LATE' ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, status: 'LATE' }))}
                  >
                    ⏱ Late
                  </button>
                  <button
                    type="button"
                    className={`status-btn ${formData.status === 'ABSENT' ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, status: 'ABSENT' }))}
                  >
                    ✕ Absent
                  </button>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {editingId ? 'Update' : 'Create'} Record
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
