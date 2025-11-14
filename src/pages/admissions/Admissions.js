import React, { useState, useMemo } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX } from 'react-icons/fi';
import './Admissions.css';

export const Admissions = () => {
  const [admissions, setAdmissions] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      program: 'Web Development',
      status: 'approved',
      applicationDate: '2025-11-05',
      documents: 'Completed'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+0987654321',
      program: 'Data Science',
      status: 'pending',
      applicationDate: '2025-11-10',
      documents: 'Submitted'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      phone: '+1122334455',
      program: 'Mobile Development',
      status: 'rejected',
      applicationDate: '2025-11-08',
      documents: 'Incomplete'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    program: '',
    status: 'pending',
    applicationDate: '',
    documents: ''
  });

  const filteredAdmissions = useMemo(() => {
    return admissions.filter(admission => {
      const matchesSearch = 
        admission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admission.program.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterStatus === 'all' || admission.status === filterStatus;
      
      return matchesSearch && matchesFilter;
    });
  }, [admissions, searchTerm, filterStatus]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddClick = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      program: '',
      status: 'pending',
      applicationDate: '',
      documents: ''
    });
    setEditingId(null);
    setShowModal(true);
  };

  const handleEditClick = (admission) => {
    setFormData(admission);
    setEditingId(admission.id);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.email || !formData.program) {
      alert('Please fill in all required fields');
      return;
    }

    if (editingId) {
      setAdmissions(admissions.map(admission =>
        admission.id === editingId ? { ...formData, id: editingId } : admission
      ));
    } else {
      setAdmissions([...admissions, { ...formData, id: Date.now() }]);
    }

    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      setAdmissions(admissions.filter(admission => admission.id !== id));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'status-approved';
      case 'pending':
        return 'status-pending';
      case 'rejected':
        return 'status-rejected';
      default:
        return 'status-pending';
    }
  };

  const getDocumentsColor = (documents) => {
    switch (documents) {
      case 'Completed':
        return 'docs-completed';
      case 'Submitted':
        return 'docs-submitted';
      case 'Incomplete':
        return 'docs-incomplete';
      default:
        return 'docs-submitted';
    }
  };

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
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="admissions-table-wrapper">
        <table className="admissions-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Program</th>
              <th>Status</th>
              <th>Documents</th>
              <th>Application Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdmissions.length > 0 ? (
              filteredAdmissions.map(admission => (
                <tr key={admission.id}>
                  <td>
                    <div className="applicant-info">
                      <div className="applicant-avatar">{admission.name.charAt(0)}</div>
                      <div>
                        <div className="applicant-name">{admission.name}</div>
                        <div className="applicant-phone">{admission.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td>{admission.email}</td>
                  <td>{admission.program}</td>
                  <td>
                    <span className={`status ${getStatusColor(admission.status)}`}>
                      {admission.status.charAt(0).toUpperCase() + admission.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <span className={`documents-badge ${getDocumentsColor(admission.documents)}`}>
                      {admission.documents}
                    </span>
                  </td>
                  <td>{admission.applicationDate}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => handleEditClick(admission)}
                        title="Edit"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(admission.id)}
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
                <td colSpan="7" className="empty-state">
                  No applications found
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
              <h2>{editingId ? 'Edit Application' : 'New Application'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <FiX />
              </button>
            </div>

            <form className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="form-group">
                  <label>Program *</label>
                  <select
                    name="program"
                    value={formData.program}
                    onChange={handleInputChange}
                  >
                    <option value="">Select program</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Mobile Development">Mobile Development</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Cloud Computing">Cloud Computing</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Application Date</label>
                  <input
                    type="date"
                    name="applicationDate"
                    value={formData.applicationDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Documents Status</label>
                <select
                  name="documents"
                  value={formData.documents}
                  onChange={handleInputChange}
                >
                  <option value="">Select status</option>
                  <option value="Incomplete">Incomplete</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSave}
                >
                  {editingId ? 'Update' : 'Create'} Application
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
