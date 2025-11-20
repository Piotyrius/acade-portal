  import React, { useState, useEffect, useMemo } from 'react';
  import './Sessions.css';
  import axios from '../../api/axios';
  import { FiPlus, FiSearch, FiEdit2, FiTrash2 } from 'react-icons/fi';

  export const Sessions = () => {


    const [sessions, setSessions] = useState([]);
    const [cohorts, setCohorts] = useState([]);

    const [showModal, setShowModal] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [search, setSearch] = useState('')

    const [form, setForm] = useState({
      start_at: '',
      end_at: '',
      location: '',
      online_link: '',
      is_cancelled: false,
      cancellation_reason: '',
      cohort: ''
    })


    useEffect(() => {

      const fetchSessions = async () => {
        try {

          const res = await axios.get('catalog/sessions/')
          setSessions(res.data.results)
          
        } catch(err){
          console.error(err)
        }
      }

      const fetchCohort = async () => {
        try{

          const res = await axios.get('catalog/cohorts/')
          setCohorts(res.data.results)
          
        }catch(err){
          console.error(err)
        }
      }
      
      fetchCohort()
      fetchSessions()

    }, [])


    const handleOpenEdit = async (id) => {
      try{

        const res = await axios.get(`catalog/sessions/${id}/`)
        const session = res.data

        setForm({
          start_at: session.start_at || '',
          end_at: session.end_at || '',
          location: session.location || '',
          online_link: session.online_link || '',
          cohort: session.cohort || '',
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

          try{

            const res = await axios.put(`catalog/sessions/${editingId}/`, form)
            setSessions(prev =>
              prev.map(s => (s.id === editingId ? res.data : s))
            )


            setShowModal(false)
            setEditingId(null)
            setForm({    
              start_at: '',
              end_at: '',
              location: '',
              online_link: '',
              cohort: ''
            })

          }catch(err){
            console.error(err.response?.data || err.message);
          }

        }else{

          try{

            const res = await axios.post('catalog/sessions/', form)
            setSessions(prev => [...prev, res.data])
            

            setShowModal(false)
            setForm({    
              start_at: '',
              end_at: '',
              location: '',
              online_link: '',
              cohort: ''
            })
            
          }catch(err){
            console.error(err.response?.data || err.message);
          }

        }

      }catch(err){
        console.error(err.response?.data || err.message);
      }
    }


    const handleDelete = async (id) => {
      try{    

        const res = await axios.delete(`catalog/sessions/${id}/`)
        setSessions(prev => prev.filter(s => s.id !== id))

      }catch(err){
        console.error(err.response?.data || err.message);
      }
    }

    const filteredSessions = useMemo(() => {
      if (!search.trim()) return sessions
    
      const lower = search.toLowerCase()
    
      return sessions.filter(s =>
        s.location?.toLowerCase().includes(lower) ||
        s.online_link?.toLowerCase().includes(lower) ||
        s.cohort?.toLowerCase().includes(lower)
      )
    }, [sessions, search])


    const handleOpenPopup = () => {
      setShowModal(true)
      }

    const closeModal = () => {
      setShowModal(false)
      setEditingId(null)
    }

    const handleChange = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value });
    }

    const getCohortName = (id) => {
      const c = cohorts.find(cohort => cohort.id === id)
      return c ? c.name : id
    }

    return (
      <div className="sessions-container">
        <div className="sessions-header">
          <h1>Sessions</h1>
          <button className="btn-primary" onClick={handleOpenPopup}>
            <FiPlus size={18} /> New Session
          </button>
        </div>

        <div className="sessions-controls">
          <div className="search-box">
            <FiSearch size={18} />
            <input
              placeholder="Search sessions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

        </div>

        {/* SESSIONS GRID */}
        <div className="sessions-grid">
          {filteredSessions.length === 0 ? (
            <div className="empty-state">No sessions found</div>
          ) : (
            filteredSessions.map(session => (
              <div className="session-card" key={session.id}>
                <div className="card-header">
                  <h3>
                    Session {new Date(session.start_at).toLocaleDateString()}
                  </h3>
                  <span className="status-badge">{session.status}</span>
                </div>

                <div className="card-info">
                  <p><strong>Cohort:</strong> {getCohortName(session.cohort)}</p>
                  <p><strong>Start:</strong> {new Date(session.start_at).toLocaleString()}</p>
                  <p><strong>End:</strong> {new Date(session.end_at).toLocaleString()}</p>
                </div>

                {session.online_link && (
                  <p  className='online_link'><span>Online Link:</span> <a href={session.online_link} target="_blank">Join</a></p>
                )}

                {session.location && (
                  <p className='session_location'><span>Location:</span> {session.location}</p>
                )}

                <div className="card-actions">
                  <button className="btn-action edit" onClick={() => handleOpenEdit(session.id)}>
                    <FiEdit2 size={16} />
                  </button>
                  <button className="btn-action delete" onClick={() => handleDelete(session.id)}>
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* MODAL */}
        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingId ? 'Edit Session' : 'New Session'}</h2>
                <button className="close-btn" onClick={closeModal}>×</button>
              </div>

              <form className="modal-form" onSubmit={handleSubmit}>

                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date *</label>
                    <input type="datetime-local" name="start_at" value={form.start_at} onChange={handleChange} required />
                  </div>

                  <div className="form-group">
                    <label>End Date *</label>
                    <input type="datetime-local" name="end_at" value={form.end_at} onChange={handleChange} required />
                  </div>
                </div>

                <div className="form-group">
                  <label>Cohort *</label>
                  <select name="cohort" value={form.cohort} onChange={handleChange} required>
                    <option value="">Select Cohort...</option>
                    {cohorts.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Location</label>
                    <input type="text" name="location" value={form.location} onChange={handleChange}  />
                  </div>

                  <div className="form-group">
                    <label>Online link</label>
                    <input type="text" name="online_link" value={form.online_link} onChange={handleChange} />
                  </div>
                </div>


                <div className="form-actions">
                  <button className="btn-primary" type="submit">
                    {editingId ? 'Update' : 'Create'}
                  </button>
                  <button className="btn-secondary" onClick={closeModal} type="button">
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

  export default Sessions;
