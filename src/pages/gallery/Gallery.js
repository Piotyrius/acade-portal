import React, { useState, useMemo } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiImage, FiEye } from 'react-icons/fi';
import './Gallery.css';

export const Gallery = () => {
  const [gallery, setGallery] = useState([
    {
      id: 1,
      title: 'Graduation Ceremony 2025',
      category: 'events',
      uploadDate: '2025-11-10',
      imageUrl: 'https://via.placeholder.com/300x200?text=Graduation',
      views: 245,
      photographer: 'John Smith'
    },
    {
      id: 2,
      title: 'Classroom Activity',
      category: 'classroom',
      uploadDate: '2025-11-08',
      imageUrl: 'https://via.placeholder.com/300x200?text=Classroom',
      views: 128,
      photographer: 'Sarah Davis'
    },
    {
      id: 3,
      title: 'Workshop Session',
      category: 'workshop',
      uploadDate: '2025-11-05',
      imageUrl: 'https://via.placeholder.com/300x200?text=Workshop',
      views: 89,
      photographer: 'Mike Johnson'
    },
    {
      id: 4,
      title: 'Campus Tour',
      category: 'events',
      uploadDate: '2025-11-01',
      imageUrl: 'https://via.placeholder.com/300x200?text=Campus',
      views: 342,
      photographer: 'Emma Wilson'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const [formData, setFormData] = useState({
    title: '',
    category: 'events',
    uploadDate: '',
    imageUrl: '',
    views: 0,
    photographer: ''
  });

  const filteredGallery = useMemo(() => {
    return gallery.filter(item => {
      const matchesSearch = 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.photographer.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [gallery, searchTerm, filterCategory]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddClick = () => {
    setFormData({
      title: '',
      category: 'events',
      uploadDate: '',
      imageUrl: '',
      views: 0,
      photographer: ''
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
    if (!formData.title || !formData.uploadDate || !formData.imageUrl) {
      alert('Please fill in all required fields');
      return;
    }

    if (editingId) {
      setGallery(gallery.map(item =>
        item.id === editingId ? { ...formData, id: editingId } : item
      ));
    } else {
      setGallery([...gallery, { ...formData, id: Date.now() }]);
    }

    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      setGallery(gallery.filter(item => item.id !== id));
    }
  };

  const handlePreview = (item) => {
    setPreviewImage(item);
    setShowPreview(true);
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'events':
        return 'category-events';
      case 'classroom':
        return 'category-classroom';
      case 'workshop':
        return 'category-workshop';
      default:
        return 'category-events';
    }
  };

  // Statistics
  const stats = {
    total: filteredGallery.length,
    events: gallery.filter(i => i.category === 'events').length,
    classroom: gallery.filter(i => i.category === 'classroom').length,
    workshop: gallery.filter(i => i.category === 'workshop').length,
    totalViews: gallery.reduce((sum, i) => sum + i.views, 0)
  };

  return (
    <div className="gallery-container">
      <header className="gallery-header">
        <div className="header-content">
          <h1>Photo Gallery</h1>
          <p className="subtitle">Academy memories and moments</p>
        </div>
        <button className="btn-primary" onClick={handleAddClick}>
          <FiPlus /> Upload
        </button>
      </header>

      {/* Stats Bar */}
      <div className="gallery-stats-bar">
        <div className="stat-item">
          <span className="stat-icon">📸</span>
          <div className="stat-info">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-name">Images</div>
          </div>
        </div>
        <div className="stat-item">
          <span className="stat-icon">👁️</span>
          <div className="stat-info">
            <div className="stat-value">{stats.totalViews}</div>
            <div className="stat-name">Total Views</div>
          </div>
        </div>
      </div>

      <div className="gallery-controls">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search images or photographer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            <option value="events">Events</option>
            <option value="classroom">Classroom</option>
            <option value="workshop">Workshop</option>
          </select>
        </div>
      </div>

      <div className="gallery-grid">
        {filteredGallery.length > 0 ? (
          filteredGallery.map(item => (
            <div key={item.id} className="gallery-card">
              <div className="image-container">
                <img src={item.imageUrl} alt={item.title} />
                <div className="image-overlay">
                  <button
                    className="view-btn"
                    onClick={() => handlePreview(item)}
                  >
                    <FiEye /> View
                  </button>
                </div>
                <span className={`category-tag ${getCategoryColor(item.category)}`}>
                  {item.category}
                </span>
                <div className="view-count">
                  <FiEye /> {item.views}
                </div>
              </div>

              <div className="card-footer">
                <div className="image-details">
                  <h3>{item.title}</h3>
                  <p className="photographer">By {item.photographer}</p>
                  <p className="date">{item.uploadDate}</p>
                </div>
                <div className="card-actions">
                  <button
                    className="action-btn edit"
                    onClick={() => handleEditClick(item)}
                    title="Edit"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => handleDelete(item.id)}
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <FiImage className="empty-icon" />
            <p>No images found</p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && previewImage && (
        <div className="preview-modal" onClick={() => setShowPreview(false)}>
          <div className="preview-box" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowPreview(false)}>
              <FiX />
            </button>
            <img src={previewImage.imageUrl} alt={previewImage.title} />
            <div className="preview-details">
              <h2>{previewImage.title}</h2>
              <p>By <strong>{previewImage.photographer}</strong> • {previewImage.uploadDate}</p>
              <p className="preview-views"><FiEye /> {previewImage.views} views</p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingId ? 'Edit Image' : 'Upload Image'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <FiX />
              </button>
            </div>

            <form className="modal-form">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter image title"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option value="events">Events</option>
                    <option value="classroom">Classroom</option>
                    <option value="workshop">Workshop</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Photographer</label>
                  <input
                    type="text"
                    name="photographer"
                    value={formData.photographer}
                    onChange={handleInputChange}
                    placeholder="Photographer name"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Upload Date *</label>
                  <input
                    type="date"
                    name="uploadDate"
                    value={formData.uploadDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Views</label>
                  <input
                    type="number"
                    name="views"
                    value={formData.views}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Image URL *</label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSave}
                >
                  {editingId ? 'Update' : 'Upload'}
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
