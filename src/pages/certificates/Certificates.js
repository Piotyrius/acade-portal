import React, { useState, useMemo } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiDownload, FiAward } from 'react-icons/fi';
import './Certificates.css';

export const Certificates = () => {
  const [certificates, setCertificates] = useState([
    {
      id: 1,
      studentName: 'John Doe',
      course: 'Web Development Masterclass',
      issueDate: '2025-10-15',
      expiryDate: '2026-10-15',
      status: 'active',
      certificateCode: 'CERT-2025-001',
      score: 92
    },
    {
      id: 2,
      studentName: 'Jane Smith',
      course: 'Advanced Python',
      issueDate: '2025-09-20',
      expiryDate: '2026-09-20',
      status: 'active',
      certificateCode: 'CERT-2025-002',
      score: 88
    },
    {
      id: 3,
      studentName: 'Mike Johnson',
      course: 'React Advanced Patterns',
      issueDate: '2025-08-10',
      expiryDate: '2026-08-10',
      status: 'active',
      certificateCode: 'CERT-2025-003',
      score: 95
    },
    {
      id: 4,
      studentName: 'Sarah Williams',
      course: 'Data Science Basics',
      issueDate: '2024-10-15',
      expiryDate: '2025-10-15',
      status: 'expired',
      certificateCode: 'CERT-2024-001',
      score: 85
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [formData, setFormData] = useState({
    studentName: '',
    course: '',
    issueDate: '',
    expiryDate: '',
    status: 'active',
    certificateCode: '',
    score: ''
  });

  const filteredCertificates = useMemo(() => {
    return certificates.filter(cert => {
      const matchesSearch = 
        cert.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.certificateCode.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterStatus === 'all' || cert.status === filterStatus;
      
      return matchesSearch && matchesFilter;
    });
  }, [certificates, searchTerm, filterStatus]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddClick = () => {
    setFormData({
      studentName: '',
      course: '',
      issueDate: '',
      expiryDate: '',
      status: 'active',
      certificateCode: '',
      score: ''
    });
    setEditingId(null);
    setShowModal(true);
  };

  const handleEditClick = (cert) => {
    setFormData(cert);
    setEditingId(cert.id);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.studentName || !formData.course || !formData.issueDate || !formData.certificateCode) {
      alert('Please fill in all required fields');
      return;
    }

    if (editingId) {
      setCertificates(certificates.map(cert =>
        cert.id === editingId ? { ...formData, id: editingId } : cert
      ));
    } else {
      setCertificates([...certificates, { ...formData, id: Date.now() }]);
    }

    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this certificate?')) {
      setCertificates(certificates.filter(cert => cert.id !== id));
    }
  };

  const handleDownload = (cert) => {
    alert(`Downloading certificate: ${cert.certificateCode}`);
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'status-active' : 'status-expired';
  };

  // Statistics
  const stats = {
    total: filteredCertificates.length,
    active: filteredCertificates.filter(c => c.status === 'active').length,
    expired: filteredCertificates.filter(c => c.status === 'expired').length
  };

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
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Certificates</div>
          </div>
        </div>
        <div className="stat-card stat-active">
          <div className="stat-icon"><FiAward /></div>
          <div className="stat-content">
            <div className="stat-number">{stats.active}</div>
            <div className="stat-label">Active</div>
          </div>
        </div>
        <div className="stat-card stat-expired">
          <div className="stat-icon"><FiAward /></div>
          <div className="stat-content">
            <div className="stat-number">{stats.expired}</div>
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
        {filteredCertificates.length > 0 ? (
          filteredCertificates.map(cert => (
            <div key={cert.id} className="certificate-card">
              <div className="certificate-header">
                <div className="cert-icon">
                  <FiAward />
                </div>
                <span className={`status ${getStatusColor(cert.status)}`}>
                  {cert.status === 'active' ? 'Active' : 'Expired'}
                </span>
              </div>

              <div className="certificate-body">
                <h3 className="cert-code">{cert.certificateCode}</h3>
                <p className="student-name">{cert.studentName}</p>
                <p className="course-name">{cert.course}</p>

                <div className="cert-details">
                  <div className="detail-item">
                    <span className="detail-label">Issued</span>
                    <span className="detail-value">{cert.issueDate}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Expires</span>
                    <span className="detail-value">{cert.expiryDate}</span>
                  </div>
                  {cert.score && (
                    <div className="detail-item">
                      <span className="detail-label">Score</span>
                      <span className="detail-value score">{cert.score}%</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="certificate-footer">
                <button
                  className="btn-download"
                  onClick={() => handleDownload(cert)}
                  title="Download"
                >
                  <FiDownload /> Download
                </button>
                <button
                  className="btn-edit"
                  onClick={() => handleEditClick(cert)}
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

            <form className="modal-form">
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
                <input
                  type="text"
                  name="course"
                  value={formData.course}
                  onChange={handleInputChange}
                  placeholder="Enter course name"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Certificate Code *</label>
                  <input
                    type="text"
                    name="certificateCode"
                    value={formData.certificateCode}
                    onChange={handleInputChange}
                    placeholder="e.g., CERT-2025-001"
                  />
                </div>
                <div className="form-group">
                  <label>Score</label>
                  <input
                    type="number"
                    name="score"
                    value={formData.score}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Issue Date *</label>
                  <input
                    type="date"
                    name="issueDate"
                    value={formData.issueDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSave}
                >
                  {editingId ? 'Update' : 'Issue'} Certificate
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
