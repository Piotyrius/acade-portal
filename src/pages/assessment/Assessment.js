import React, { useState, useMemo } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiTrendingUp } from 'react-icons/fi';
import './Assessment.css';

export const Assessment = () => {
  const [assessments, setAssessments] = useState([
    {
      id: 1,
      title: 'JavaScript Fundamentals Quiz',
      course: 'Web Development',
      type: 'Quiz',
      totalMarks: 100,
      date: '2025-11-12',
      status: 'completed',
      avgScore: 85
    },
    {
      id: 2,
      title: 'Python Project',
      course: 'Data Science',
      type: 'Project',
      totalMarks: 150,
      date: '2025-11-15',
      status: 'pending',
      avgScore: 0
    },
    {
      id: 3,
      title: 'React Components Test',
      course: 'Web Development',
      type: 'Test',
      totalMarks: 50,
      date: '2025-11-10',
      status: 'completed',
      avgScore: 92
    },
    {
      id: 4,
      title: 'Mobile App Assignment',
      course: 'Mobile Development',
      type: 'Assignment',
      totalMarks: 100,
      date: '2025-11-13',
      status: 'grading',
      avgScore: 0
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [formData, setFormData] = useState({
    title: '',
    course: '',
    type: 'Quiz',
    totalMarks: '',
    date: '',
    status: 'pending',
    avgScore: 0
  });

  const filteredAssessments = useMemo(() => {
    return assessments.filter(assessment => {
      const matchesSearch = 
        assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.course.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'all' || assessment.type === filterType;
      const matchesStatus = filterStatus === 'all' || assessment.status === filterStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [assessments, searchTerm, filterType, filterStatus]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddClick = () => {
    setFormData({
      title: '',
      course: '',
      type: 'Quiz',
      totalMarks: '',
      date: '',
      status: 'pending',
      avgScore: 0
    });
    setEditingId(null);
    setShowModal(true);
  };

  const handleEditClick = (assessment) => {
    setFormData(assessment);
    setEditingId(assessment.id);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.title || !formData.course || !formData.totalMarks || !formData.date) {
      alert('Please fill in all required fields');
      return;
    }

    if (editingId) {
      setAssessments(assessments.map(assessment =>
        assessment.id === editingId ? { ...formData, id: editingId } : assessment
      ));
    } else {
      setAssessments([...assessments, { ...formData, id: Date.now() }]);
    }

    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this assessment?')) {
      setAssessments(assessments.filter(assessment => assessment.id !== id));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'pending':
        return 'status-pending';
      case 'grading':
        return 'status-grading';
      default:
        return 'status-pending';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Quiz':
        return 'type-quiz';
      case 'Test':
        return 'type-test';
      case 'Assignment':
        return 'type-assignment';
      case 'Project':
        return 'type-project';
      default:
        return 'type-quiz';
    }
  };

  // Statistics
  const stats = {
    total: filteredAssessments.length,
    completed: filteredAssessments.filter(a => a.status === 'completed').length,
    pending: filteredAssessments.filter(a => a.status === 'pending').length,
    grading: filteredAssessments.filter(a => a.status === 'grading').length,
    avgOverall: filteredAssessments.length > 0 
      ? Math.round(filteredAssessments.filter(a => a.avgScore > 0).reduce((sum, a) => sum + a.avgScore, 0) / filteredAssessments.filter(a => a.avgScore > 0).length)
      : 0
  };

  return (
    <div className="assessment-container">
      <header className="assessment-header">
        <div className="header-content">
          <h1>Assessment Management</h1>
          <p className="subtitle">Create, manage and track student assessments</p>
        </div>
        <button className="btn-primary" onClick={handleAddClick}>
          <FiPlus /> New Assessment
        </button>
      </header>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Assessments</div>
        </div>
        <div className="stat-card stat-completed">
          <div className="stat-number">{stats.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card stat-pending">
          <div className="stat-number">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card stat-grading">
          <div className="stat-number">{stats.grading}</div>
          <div className="stat-label">Grading</div>
        </div>
        <div className="stat-card stat-average">
          <div className="stat-number">{stats.avgOverall}%</div>
          <div className="stat-label">Average Score</div>
        </div>
      </div>

      <div className="assessment-controls">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search by title or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="Quiz">Quiz</option>
            <option value="Test">Test</option>
            <option value="Assignment">Assignment</option>
            <option value="Project">Project</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="grading">Grading</option>
          </select>
        </div>
      </div>

      <div className="assessment-table-wrapper">
        <table className="assessment-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Course</th>
              <th>Type</th>
              <th>Total Marks</th>
              <th>Average Score</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssessments.length > 0 ? (
              filteredAssessments.map(assessment => (
                <tr key={assessment.id}>
                  <td>
                    <div className="assessment-title">{assessment.title}</div>
                  </td>
                  <td>{assessment.course}</td>
                  <td>
                    <span className={`type-badge ${getTypeColor(assessment.type)}`}>
                      {assessment.type}
                    </span>
                  </td>
                  <td>{assessment.totalMarks}</td>
                  <td>
                    <div className="score-display">
                      {assessment.avgScore > 0 ? (
                        <>
                          <FiTrendingUp className="score-icon" />
                          <span>{assessment.avgScore}%</span>
                        </>
                      ) : (
                        <span className="score-pending">-</span>
                      )}
                    </div>
                  </td>
                  <td>{assessment.date}</td>
                  <td>
                    <span className={`status ${getStatusColor(assessment.status)}`}>
                      {assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => handleEditClick(assessment)}
                        title="Edit"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(assessment.id)}
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
                <td colSpan="8" className="empty-state">
                  No assessments found
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
              <h2>{editingId ? 'Edit Assessment' : 'New Assessment'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <FiX />
              </button>
            </div>

            <form className="modal-form">
              <div className="form-group">
                <label>Assessment Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter assessment title"
                />
              </div>

              <div className="form-row">
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
                <div className="form-group">
                  <label>Type *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                  >
                    <option value="Quiz">Quiz</option>
                    <option value="Test">Test</option>
                    <option value="Assignment">Assignment</option>
                    <option value="Project">Project</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Total Marks *</label>
                  <input
                    type="number"
                    name="totalMarks"
                    value={formData.totalMarks}
                    onChange={handleInputChange}
                    placeholder="Enter total marks"
                  />
                </div>
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                  />
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
                    <option value="grading">Grading</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Average Score</label>
                  <input
                    type="number"
                    name="avgScore"
                    value={formData.avgScore}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSave}
                >
                  {editingId ? 'Update' : 'Create'} Assessment
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
