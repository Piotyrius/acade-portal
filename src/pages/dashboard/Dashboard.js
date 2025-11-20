import React from 'react'
import './Dashboard.css'
import { TbUsers, TbBooks, TbAward, TbCalendar, TbTrendingUp } from 'react-icons/tb'

export const Dashboard = () => {
  // Sample data
  const stats = [
    { label: 'Total Students', value: '1,234', icon: TbUsers, color: '#3b82f6', change: '+12%' },
    { label: 'Active Courses', value: '18', icon: TbBooks, color: '#10b981', change: '+3' },
    { label: 'Attendance Rate', value: '94.2%', icon: TbCalendar, color: '#f59e0b', change: '+2.1%' },
    { label: 'Certificates Issued', value: '156', icon: TbAward, color: '#8b5cf6', change: '+24' },
  ]

  const upcomingSessions = [
    { id: 1, title: 'Intro to Cybersecurity', date: '2025-11-20', time: '09:00 AM', instructor: 'A. Smith' },
    { id: 2, title: 'Network Fundamentals', date: '2025-11-21', time: '01:00 PM', instructor: 'B. Jones' },
    { id: 3, title: 'Web Development Basics', date: '2025-11-22', time: '10:00 AM', instructor: 'C. Brown' },
  ]

  const recentActivity = [
    { id: 1, type: 'Student Enrolled', name: 'Jane Doe', course: 'Cybersecurity', time: '2 hours ago' },
    { id: 2, type: 'Certificate Issued', name: 'John Smith', course: 'Fullstack Dev', time: '5 hours ago' },
    { id: 3, type: 'Session Completed', name: 'Cohort A', course: 'Network Basics', time: '1 day ago' },
    { id: 4, type: 'New Applicant', name: 'Alex Johnson', course: 'Cybersecurity', time: '2 days ago' },
  ]

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="subtitle">Welcome back! Here's your academy overview.</p>
      </header>

      {/* KPI Cards */}
      <section className="kpi-section">
        <div className="kpi-grid">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div key={idx} className="kpi-card">
                <div className="kpi-icon" style={{ backgroundColor: `${stat.color}15` }}>
                  <Icon size={28} color={stat.color} />
                </div>
                <div className="kpi-content">
                  <p className="kpi-label">{stat.label}</p>
                  <h3 className="kpi-value">{stat.value}</h3>
                  <span className="kpi-change" style={{ color: stat.color }}>↑ {stat.change}</span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="content-grid">
        {/* Upcoming Sessions */}
        <div className="card">
          <div className="card-header">
            <h2>Upcoming Sessions</h2>
            <TbCalendar size={20} />
          </div>
          <div className="sessions-list">
            {upcomingSessions.map(session => (
              <div key={session.id} className="session-item">
                <div className="session-time">
                  <span className="date">{session.date}</span>
                  <span className="time">{session.time}</span>
                </div>
                <div className="session-info">
                  <h4>{session.title}</h4>
                  <p>with {session.instructor}</p>
                </div>
                <button className="btn-view">View</button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h2>Recent Activity</h2>
            <TbTrendingUp size={20} />
          </div>
          <div className="activity-list">
            {recentActivity.map(activity => (
              <div key={activity.id} className="activity-item">
                <div className="activity-dot"></div>
                <div className="activity-content">
                  <div className="activity-main">
                    <span className="activity-type">{activity.type}</span>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                  <p className="activity-desc">{activity.name} • {activity.course}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <button className="action-btn">
            <span className="action-icon">👥</span>
            <span>Add Student</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">📚</span>
            <span>Create Course</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">📅</span>
            <span>Schedule Session</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">🎓</span>
            <span>Issue Certificate</span>
          </button>
        </div>
      </section>
    </div>
  )
}

export default Dashboard
