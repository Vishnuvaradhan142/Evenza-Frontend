import React, { useState, useEffect } from 'react';
import { 
  FiUsers, FiCalendar, FiDollarSign,
  FiBell, FiEdit, FiTrash2, FiEye,
  FiSearch, FiGrid, FiList,
  FiPlus, FiFilter, FiDownload, FiTrendingUp,
  FiActivity, FiTarget,
  FiClock, FiMapPin, FiTrendingDown, FiGlobe
} from 'react-icons/fi';
import { AiOutlineRise, AiOutlineFall } from 'react-icons/ai';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Enhanced stats data
  const stats = [
    { 
      label: 'Total Users', 
      count: '12,430', 
      change: '+12.5%', 
      trend: 'up', 
      icon: <FiUsers />,
      color: '#6366f1',
      bgColor: 'rgba(99, 102, 241, 0.1)',
      description: 'Active registered users'
    },
    { 
      label: 'Active Events', 
      count: '248', 
      change: '+23.1%', 
      trend: 'up', 
      icon: <FiCalendar />,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      description: 'Currently running events'
    },
    { 
      label: 'Monthly Revenue', 
      count: '$124,500', 
      change: '+8.2%', 
      trend: 'up', 
      icon: <FiDollarSign />,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      description: 'Total earnings this month'
    },
    { 
      label: 'Engagement Rate', 
      count: '89.3%', 
      change: '+5.7%', 
      trend: 'up', 
      icon: <FiTrendingUp />,
      color: '#ec4899',
      bgColor: 'rgba(236, 72, 153, 0.1)',
      description: 'User engagement metrics'
    },
  ];

  // Quick statistics for sidebar
  const quickStats = [
    { 
      label: 'Conversion Rate', 
      value: '23.8%', 
      icon: <FiTarget />,
      trend: '+2.3%'
    },
    { 
      label: 'Avg Session', 
      value: '4m 32s', 
      icon: <FiClock />,
      trend: '+12s'
    },
    { 
      label: 'Bounce Rate', 
      value: '34.2%', 
      icon: <FiTrendingDown />,
      trend: '-1.5%'
    },
    { 
      label: 'Global Reach', 
      value: '47 Countries', 
      icon: <FiGlobe />,
      trend: '+3'
    }
  ];

  // Enhanced events data
  const recentEvents = [
    { 
      id: 1, 
      name: 'AI & Machine Learning Summit 2025', 
      participants: 1420, 
      registered: 1650,
      date: 'Aug 28, 2025', 
      time: '09:00 AM',
      status: 'active',
      revenue: '$24,500',
      category: 'Technology',
      location: 'San Francisco',
      completion: 85,
      description: 'Explore the latest trends in AI and ML',
      organizer: 'TechEvents Inc.'
    },
    { 
      id: 2, 
      name: 'Digital Design Masterclass', 
      participants: 890, 
      registered: 950,
      date: 'Sept 12, 2025', 
      time: '02:00 PM',
      status: 'pending',
      revenue: '$18,200',
      category: 'Design',
      location: 'New York',
      completion: 60,
      description: 'Advanced techniques for modern design',
      organizer: 'Creative Studios'
    },
    { 
      id: 3, 
      name: 'DevOps & Cloud Architecture Workshop', 
      participants: 1150, 
      registered: 1200,
      date: 'Sept 25, 2025', 
      time: '10:30 AM',
      status: 'active',
      revenue: '$31,800',
      category: 'Technology',
      location: 'Seattle',
      completion: 92,
      description: 'Hands-on DevOps and cloud solutions',
      organizer: 'CloudTech Solutions'
    },
    { 
      id: 4, 
      name: 'UX Research & Analytics Workshop', 
      participants: 650, 
      registered: 720,
      date: 'Oct 8, 2025', 
      time: '01:00 PM',
      status: 'pending',
      revenue: '$12,400',
      category: 'Research',
      location: 'Austin',
      completion: 45,
      description: 'Data-driven UX research methods',
      organizer: 'UX Research Lab'
    },
    { 
      id: 5, 
      name: 'Blockchain & Cryptocurrency Conference', 
      participants: 2100, 
      registered: 2200,
      date: 'Oct 15, 2025', 
      time: '09:00 AM',
      status: 'pending',
      revenue: '$45,600',
      category: 'Finance',
      location: 'Miami',
      completion: 30,
      description: 'Future of digital currencies',
      organizer: 'CryptoEvents Global'
    },
    { 
      id: 6, 
      name: 'Sustainable Energy Innovation Summit', 
      participants: 1800, 
      registered: 1900,
      date: 'Oct 22, 2025', 
      time: '08:30 AM',
      status: 'ended',
      revenue: '$38,400',
      category: 'Environment',
      location: 'Portland',
      completion: 100,
      description: 'Green technology and renewable energy',
      organizer: 'GreenTech Alliance'
    }
  ];

  // Recent activities data
  const recentActivities = [
    { 
      id: 1,
      action: 'New user registration', 
      user: 'Alex Martinez', 
      time: '2 minutes ago',
      type: 'user',
      avatar: 'AM'
    },
    { 
      id: 2,
      action: 'Event updated', 
      user: 'Sarah Johnson', 
      time: '15 minutes ago',
      type: 'event',
      avatar: 'SJ'
    },
    { 
      id: 3,
      action: 'Payment processed', 
      user: 'System', 
      time: '1 hour ago',
      type: 'payment',
      avatar: 'SY'
    },
    { 
      id: 4,
      action: 'New event created', 
      user: 'Michael Chen', 
      time: '2 hours ago',
      type: 'event',
      avatar: 'MC'
    },
    { 
      id: 5,
      action: 'User profile updated', 
      user: 'Emma Wilson', 
      time: '3 hours ago',
      type: 'user',
      avatar: 'EW'
    }
  ];

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { 
        class: 'status-active', 
        text: 'Live', 
        color: '#10b981' 
      },
      pending: { 
        class: 'status-pending', 
        text: 'Upcoming', 
        color: '#f59e0b' 
      },
      ended: { 
        class: 'status-ended', 
        text: 'Completed', 
        color: '#ef4444' 
      }
    };

    const statusInfo = statusMap[status];
    
    return (
      <span 
        className={`status-badge ${statusInfo.class}`}
        style={{ 
          backgroundColor: `${statusInfo.color}20`,
          color: statusInfo.color,
          border: `1px solid ${statusInfo.color}40`
        }}
      >
        <span 
          className="status-dot" 
          style={{ backgroundColor: statusInfo.color }}
        ></span>
        {statusInfo.text}
      </span>
    );
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredEvents = recentEvents.filter(event =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-dashboard-content">
      {/* Dashboard Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Analytics Dashboard</h1>
            <p className="header-subtitle">
              Welcome back! Here's what's happening with your events today.
            </p>
          </div>
          
          <div className="header-actions">
            <div className="search-bar">
              <FiSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search events, users, analytics..." 
                className="search-input"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            
            <div className="header-buttons">
              <button className="header-btn secondary">
                <FiFilter /> Filter
              </button>
              <button className="header-btn primary">
                <FiPlus /> New Event
              </button>
            </div>
            
            <div className="action-buttons">
              <button className="action-btn notification-btn" title="Notifications">
                <FiBell />
                <span className="badge">7</span>
                <span className="pulse"></span>
              </button>
              <button className="action-btn" title="Download Report">
                <FiDownload />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          {stats.map((stat, i) => (
            <div 
              className="stat-card" 
              key={i}
              style={{
                borderLeft: `4px solid ${stat.color}`
              }}
            >
              <div className="stat-header">
                <div 
                  className="stat-icon"
                  style={{
                    backgroundColor: stat.bgColor,
                    color: stat.color
                  }}
                >
                  {stat.icon}
                </div>
                <div className={`trend ${stat.trend}`}>
                  {stat.change}
                  {stat.trend === 'up' ? <AiOutlineRise /> : <AiOutlineFall />}
                </div>
              </div>
              <div className="stat-content">
                <h3>{stat.count}</h3>
                <p>{stat.label}</p>
                <div className="stat-progress">
                  <div 
                    className="progress-bar"
                    style={{
                      backgroundColor: stat.color,
                      width: '75%'
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Events Section */}
        <section className="events-section">
          <div className="section-header">
            <div>
              <h2>Recent Events</h2>
              <p className="section-subtitle">
                Manage your upcoming and ongoing events
              </p>
            </div>
            <div className="section-actions">
              <div className="view-controls">
                <button 
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                >
                  <FiGrid />
                </button>
                <button 
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="List View"
                >
                  <FiList />
                </button>
              </div>
              <button className="view-all-btn">
                View All ({recentEvents.length})
              </button>
            </div>
          </div>

          {/* Grid View */}
          {viewMode === 'grid' ? (
            <div className="events-grid">
              {filteredEvents.slice(0, 4).map(event => (
                <div className="event-card" key={event.id}>
                  <div className="event-header">
                    <div className="event-title">
                      <h3>{event.name}</h3>
                      <span className="event-category">{event.category}</span>
                    </div>
                    {getStatusBadge(event.status)}
                  </div>
                  <div className="event-details">
                    <div className="detail-row">
                      <div className="detail-item">
                        <FiUsers className="detail-icon" />
                        <div>
                          <span>Participants</span>
                          <strong>{event.participants.toLocaleString()}</strong>
                        </div>
                      </div>
                      <div className="detail-item">
                        <FiCalendar className="detail-icon" />
                        <div>
                          <span>Date & Time</span>
                          <strong>{event.date}</strong>
                        </div>
                      </div>
                    </div>
                    <div className="detail-row">
                      <div className="detail-item">
                        <FiDollarSign className="detail-icon" />
                        <div>
                          <span>Revenue</span>
                          <strong>{event.revenue}</strong>
                        </div>
                      </div>
                      <div className="detail-item">
                        <FiMapPin className="detail-icon" />
                        <div>
                          <span>Location</span>
                          <strong>{event.location}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="event-progress">
                    <div className="progress-info">
                      <span>Completion</span>
                      <span>{event.completion}%</span>
                    </div>
                    <div className="progress-track">
                      <div 
                        className="progress-fill"
                        style={{ width: `${event.completion}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="event-actions">
                    <button className="action-btn view">
                      <FiEye /> View
                    </button>
                    <button className="action-btn edit">
                      <FiEdit /> Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Table View */
            <div className="events-table-container">
              <table className="events-table">
                <thead>
                  <tr>
                    <th>Event Name</th>
                    <th>Category</th>
                    <th>Participants</th>
                    <th>Date</th>
                    <th>Revenue</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map(event => (
                    <tr key={event.id}>
                      <td>
                        <div className="table-event-name">
                          <strong>{event.name}</strong>
                          <span>{event.location} • {event.time}</span>
                        </div>
                      </td>
                      <td>
                        <span className="category-tag">{event.category}</span>
                      </td>
                      <td>
                        {event.participants.toLocaleString()}
                        <span style={{ color: '#64748b', fontSize: '0.8rem', display: 'block' }}>
                          of {event.registered.toLocaleString()} registered
                        </span>
                      </td>
                      <td>{event.date}</td>
                      <td><strong>{event.revenue}</strong></td>
                      <td>{getStatusBadge(event.status)}</td>
                      <td>
                        <div className="table-actions">
                          <button className="table-btn view" title="View Details">
                            <FiEye />
                          </button>
                          <button className="table-btn edit" title="Edit Event">
                            <FiEdit />
                          </button>
                          <button className="table-btn delete" title="Delete Event">
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Sidebar Panels */}
        <aside className="sidebar-panels">
          {/* Quick Stats Panel */}
          <div className="panel quick-stats">
            <div className="panel-header">
              <h3>📊 Quick Stats</h3>
              <div className="time-display">
                {formatTime(currentTime)}
              </div>
            </div>
            <div className="quick-stats-grid">
              {quickStats.map((stat, i) => (
                <div className="quick-stat" key={i}>
                  <div className="quick-stat-icon">{stat.icon}</div>
                  <div>
                    <div className="quick-stat-value">{stat.value}</div>
                    <div className="quick-stat-label">{stat.label}</div>
                    <div style={{ 
                      fontSize: '0.7rem', 
                      color: stat.trend.startsWith('+') ? '#10b981' : '#ef4444',
                      fontWeight: '500'
                    }}>
                      {stat.trend}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Feed Panel */}
          <div className="panel activity-feed">
            <h3>🔔 Recent Activity</h3>
            <div className="activity-list">
              {recentActivities.map((activity) => (
                <div className="activity-item" key={activity.id}>
                  <div className="activity-dot"></div>
                  <div className="activity-content">
                    <div className="activity-text">{activity.action}</div>
                    <div className="activity-user">
                      by {activity.user}
                      {activity.avatar && (
                        <span style={{
                          display: 'inline-block',
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #667eea, #764ba2)',
                          color: 'white',
                          fontSize: '0.6rem',
                          textAlign: 'center',
                          lineHeight: '16px',
                          marginLeft: '0.5rem',
                          fontWeight: '600'
                        }}>
                          {activity.avatar}
                        </span>
                      )}
                    </div>
                    <div className="activity-time">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="view-all-activity">
              View All Activity
            </button>
          </div>

          {/* Performance Panel */}
          <div className="panel">
            <h3>📈 Performance</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '0.75rem',
                background: 'rgba(16, 185, 129, 0.1)',
                borderRadius: '10px'
              }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>This Month</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#10b981' }}>
                    +23.5%
                  </div>
                </div>
                <FiTrendingUp style={{ color: '#10b981', fontSize: '1.5rem' }} />
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '0.75rem',
                background: 'rgba(245, 158, 11, 0.1)',
                borderRadius: '10px'
              }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Event Success</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#f59e0b' }}>
                    94.2%
                  </div>
                </div>
                <FiTarget style={{ color: '#f59e0b', fontSize: '1.5rem' }} />
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '0.75rem',
                background: 'rgba(99, 102, 241, 0.1)',
                borderRadius: '10px'
              }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>User Satisfaction</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#6366f1' }}>
                    4.8/5.0
                  </div>
                </div>
                <FiActivity style={{ color: '#6366f1', fontSize: '1.5rem' }} />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AdminDashboard;