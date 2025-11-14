import React, { useState, useMemo } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiCheck, FiX as FiClose } from 'react-icons/fi';
import './Attendance.css';

export const Attendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([
    {
      id: 1,
      studentName: 'John Doe',
      course: 'Web Development',
      date: '2025-11-13',
      status: 'present',
      time: '09:00 AM'
    },
    {
      id: 2,
      studentName: 'Jane Smith',
      course: 'Data Science',
      date: '2025-11-13',
      status: 'absent',
      time: '09:15 AM'
    },
    {
      id: 3,
      studentName: 'Mike Johnson',
      course: 'Web Development',
      date: '2025-11-13',
      status: 'late',
      time: '09:45 AM'
    },
    {
      id: 4,
      studentName: 'Sarah Williams',
      course: 'Mobile Development',
      date: '2025-11-13',
      status: 'present',
      time: '09:05 AM'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');

  const [formData, setFormData] = useState({
    studentName: '',
    course: '',
    date: '',
    status: 'present',
    time: ''
  });

  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter(record => {
      const matchesSearch = 
        record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.course.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterStatus === 'all' || record.status === filterStatus;
      const matchesDate = !filterDate || record.date === filterDate;
      
      return matchesSearch && matchesFilter && matchesDate;
    });
  }, [attendanceRecords, searchTerm, filterStatus, filterDate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddClick = () => {
    setFormData({
      studentName: '',
      course: '',
      date: '',
      status: 'present',
      time: ''
    });
    setEditingId(null);
    setShowModal(true);
  };

  const handleEditClick = (record) => {
    setFormData(record);
    setEditingId(record.id);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.studentName || !formData.course || !formData.date) {
      alert('Please fill in all required fields');
      return;
    }

    if (editingId) {
      setAttendanceRecords(attendanceRecords.map(record =>
        record.id === editingId ? { ...formData, id: editingId } : record
      ));
    } else {
      setAttendanceRecords([...attendanceRecords, { ...formData, id: Date.now() }]);
    }

    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      setAttendanceRecords(attendanceRecords.filter(record => record.id !== id));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'status-present';
      case 'absent':
        return 'status-absent';
      case 'late':
        return 'status-late';
      default:
        return 'status-present';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <FiCheck />;
      case 'absent':
        return <FiClose />;
      case 'late':
        return '⏱';
      default:
        return null;
    }
  };

  // Statistics
  const stats = {
    total: filteredRecords.length,
    present: filteredRecords.filter(r => r.status === 'present').length,
    absent: filteredRecords.filter(r => r.status === 'absent').length,
    late: filteredRecords.filter(r => r.status === 'late').length
  };

  return (
    <div className="attendance-container">
      <header className="attendance-header">
        <div className="header-content">
          <h1>Attendance Management</h1>
          <p className="subtitle">Track student attendance and manage records</p>
        </div>
        <button className="btn-primary" onClick={handleAddClick}>
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
            {filteredRecords.length > 0 ? (
              filteredRecords.map(record => (
                <tr key={record.id}>
                  <td>
                    <div className="student-name">{record.studentName}</div>
                  </td>
                  <td>{record.course}</td>
                  <td>{record.date}</td>
                  <td>{record.time}</td>
                  <td>
                    <span className={`status ${getStatusColor(record.status)}`}>
                      <span className="status-icon">{getStatusIcon(record.status)}</span>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => handleEditClick(record)}
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

            <form className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Student Name *</label>
                  <input
                    type="text"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleInputChange}
                    placeholder="Enter student name"
                  />
                </div>
                <div className="form-group">
                  <label>Course *</label>
                  <select
                    name="course"
                    value={formData.course}
                    onChange={handleInputChange}
                  >
                    <option value="">Select course</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Mobile Development">Mobile Development</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Status</label>
                <div className="status-buttons">
                  <button
                    type="button"
                    className={`status-btn ${formData.status === 'present' ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, status: 'present' }))}
                  >
                    ✓ Present
                  </button>
                  <button
                    type="button"
                    className={`status-btn ${formData.status === 'late' ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, status: 'late' }))}
                  >
                    ⏱ Late
                  </button>
                  <button
                    type="button"
                    className={`status-btn ${formData.status === 'absent' ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, status: 'absent' }))}
                  >
                    ✕ Absent
                  </button>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSave}
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
