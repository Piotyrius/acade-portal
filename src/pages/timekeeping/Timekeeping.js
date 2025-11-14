import React, { useState, useMemo } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import './Timekeeping.css';

export const Timekeeping = () => {
  const [timekeeping, setTimekeeping] = useState([
    {
      id: 1,
      name: 'Ahmed Hassan',
      date: '2025-11-14',
      checkIn: '08:30',
      checkOut: '17:00',
      status: 'present',
      hours: 8.5,
      department: 'Administration'
    },
    {
      id: 2,
      name: 'Fatima Ali',
      date: '2025-11-14',
      checkIn: '08:15',
      checkOut: '17:15',
      status: 'present',
      hours: 9.0,
      department: 'Teaching'
    },
    {
      id: 3,
      name: 'Mohammed Saleh',
      date: '2025-11-14',
      checkIn: '10:30',
      checkOut: null,
      status: 'late',
      hours: null,
      department: 'Support'
    },
    {
      id: 4,
      name: 'Sara Ahmed',
      date: '2025-11-14',
      checkIn: null,
      checkOut: null,
      status: 'absent',
      hours: 0,
      department: 'Teaching'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('2025-11-14');

  const [formData, setFormData] = useState({
    name: '',
    date: '',
    checkIn: '',
    checkOut: '',
    status: 'present',
    department: ''
  });

  const filteredRecords = useMemo(() => {
    return timekeeping.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      const matchesDate = filterDate === 'all' || item.date === filterDate;
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [timekeeping, searchTerm, filterStatus, filterDate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return null;
    const [inHour, inMin] = checkIn.split(':').map(Number);
    const [outHour, outMin] = checkOut.split(':').map(Number);
    const inTotal = inHour + inMin / 60;
    const outTotal = outHour + outMin / 60;
    return (outTotal - inTotal).toFixed(2);
  };

  const handleAddClick = () => {
    setFormData({
      name: '',
      date: '',
      checkIn: '',
      checkOut: '',
      status: 'present',
      department: ''
    });
    setEditingId(null);
    setShowModal(true);
  };

  const handleEditClick = (item) => {
    setFormData(item);
    setEditingId(item.id);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.date || !formData.checkIn) {
      alert('Please fill in required fields (Name, Date, Check In)');
      return;
    }

    const hours = calculateHours(formData.checkIn, formData.checkOut);

    if (editingId) {
      setTimekeeping(timekeeping.map(item =>
        item.id === editingId ? { ...formData, id: editingId, hours } : item
      ));
    } else {
      setTimekeeping([...timekeeping, { ...formData, id: Date.now(), hours }]);
    }

    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      setTimekeeping(timekeeping.filter(item => item.id !== id));
    }
  };

  const stats = {
    total: filteredRecords.length,
    present: timekeeping.filter(i => i.status === 'present').length,
    late: timekeeping.filter(i => i.status === 'late').length,
    absent: timekeeping.filter(i => i.status === 'absent').length,
    avgHours: (filteredRecords.reduce((sum, i) => sum + (i.hours || 0), 0) / filteredRecords.length).toFixed(1)
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <FiCheckCircle className="status-icon present" />;
      case 'late':
        return <FiAlertCircle className="status-icon late" />;
      case 'absent':
        return <FiX className="status-icon absent" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'status-present';
      case 'late':
        return 'status-late';
      case 'absent':
        return 'status-absent';
      default:
        return '';
    }
  };

  return (
    <div className="timekeeping-container">
      <header className="timekeeping-header">
        <div className="header-content">
          <h1>Timekeeping</h1>
          <p className="subtitle">Manage employee attendance and work hours</p>
        </div>
        <button className="btn-primary" onClick={handleAddClick}>
          <FiPlus /> Record
        </button>
      </header>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Today's Records</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.present}</div>
          <div className="stat-label">Present</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.late}</div>
          <div className="stat-label">Late</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.absent}</div>
          <div className="stat-label">Absent</div>
        </div>
      </div>

      {/* Controls */}
      <div className="timekeeping-controls">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="present">Present</option>
            <option value="late">Late</option>
            <option value="absent">Absent</option>
          </select>

          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="date-filter"
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="timekeeping-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Date</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Hours</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length > 0 ? (
              filteredRecords.map(record => (
                <tr key={record.id}>
                  <td className="name-cell">
                    <div className="name-badge">
                      {record.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span>{record.name}</span>
                  </td>
                  <td>{record.department}</td>
                  <td>{record.date}</td>
                  <td className="time-cell">
                    {record.checkIn ? (
                      <span className="time-badge checkin">{record.checkIn}</span>
                    ) : (
                      <span className="time-badge empty">—</span>
                    )}
                  </td>
                  <td className="time-cell">
                    {record.checkOut ? (
                      <span className="time-badge checkout">{record.checkOut}</span>
                    ) : (
                      <span className="time-badge empty">—</span>
                    )}
                  </td>
                  <td className="hours-cell">
                    {record.hours ? (
                      <span className="hours-badge">{record.hours}h</span>
                    ) : (
                      <span className="hours-badge empty">—</span>
                    )}
                  </td>
                  <td className="status-cell">
                    <div className={`status-badge ${getStatusColor(record.status)}`}>
                      {getStatusIcon(record.status)}
                      <span>{record.status}</span>
                    </div>
                  </td>
                  <td className="actions-cell">
                    <button
                      className="action-btn edit"
                      onClick={() => handleEditClick(record)}
                      title="Edit"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDelete(record.id)}
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="empty-row">
                  <div className="empty-state">
                    <FiClock className="empty-icon" />
                    <p>No records found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingId ? 'Edit Record' : 'Add Record'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <FiX />
              </button>
            </div>

            <form className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Employee name"
                  />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    placeholder="Department"
                  />
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
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="present">Present</option>
                    <option value="late">Late</option>
                    <option value="absent">Absent</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Check In *</label>
                  <input
                    type="time"
                    name="checkIn"
                    value={formData.checkIn}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Check Out</label>
                  <input
                    type="time"
                    name="checkOut"
                    value={formData.checkOut}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSave}
                >
                  {editingId ? 'Update' : 'Add'}
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

export default Timekeeping;

