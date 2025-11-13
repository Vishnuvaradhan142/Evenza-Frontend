import React, { useEffect, useMemo, useState } from 'react';
import { FiSearch, FiCalendar, FiMapPin, FiUsers } from 'react-icons/fi';
import API from '../../api';
import './AllEvents.css';

export default function AllEvents() {
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching all events for owner');
      const response = await API.get('/events/all');
      console.log('Events response:', response.data);
      setEvents(response.data || []);
    } catch (err) {
      console.error('Error loading events:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const getEventStatus = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'ongoing';
    return 'completed';
  };

  const filteredEvents = useMemo(() => {
    if (!searchQuery && statusFilter === 'all') return events;
    return events.filter(ev => {
      const searchText = `${ev.title} ${ev.description || ''} ${ev.location || ''}`.toLowerCase();
      const matchesSearch = !searchQuery || searchText.includes(searchQuery.toLowerCase());
      
      const status = getEventStatus(ev.start_time, ev.end_time);
      const matchesStatus = statusFilter === 'all' || status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [events, searchQuery, statusFilter]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const parseLocations = (locations) => {
    try {
      if (typeof locations === 'string') {
        return JSON.parse(locations);
      }
      return locations;
    } catch (e) {
      return [];
    }
  };

  const parseSessions = (sessions) => {
    try {
      if (typeof sessions === 'string') {
        return JSON.parse(sessions);
      }
      return sessions;
    } catch (e) {
      return [];
    }
  };

  const parseDocuments = (documents) => {
    try {
      if (typeof documents === 'string') {
        return JSON.parse(documents);
      }
      return documents;
    } catch (e) {
      return [];
    }
  };

  return (
    <div className="ae-page">
      <header className="ae-header">
        <div>
          <h2>All Events</h2>
          <p className="muted">View all events across the platform.</p>
        </div>
        <div className="ae-controls">
          <div className="ae-search">
            <FiSearch />
            <input 
              placeholder="Search events..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
            />
          </div>
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </header>

      <div className="ae-list card">
        {loading && <div className="ae-loading">Loading events...</div>}
        {error && <div className="empty" style={{color: '#ef4444'}}>{error}</div>}
        {!loading && !error && filteredEvents.length === 0 && <div className="empty">No events found.</div>}
        
        {!loading && !error && filteredEvents.map(ev => {
          const status = getEventStatus(ev.start_time, ev.end_time);
          return (
            <div 
              className={`ae-item ${status}`} 
              key={ev.event_id}
              onClick={() => setSelectedEvent(ev)}
              style={{ cursor: 'pointer' }}
            >
              <div className="event-main">
                <div className="event-header">
                  <h3 className="event-title">{ev.title}</h3>
                  <span className={`status-badge ${status}`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </div>
                {ev.description && (
                  <p className="event-description">{ev.description}</p>
                )}
                <div className="event-meta">
                  <div className="meta-item">
                    <FiCalendar />
                    <span>{formatDate(ev.start_time)} - {formatDate(ev.end_time)}</span>
                  </div>
                  {ev.location && (
                    <div className="meta-item">
                      <FiMapPin />
                      <span>{ev.location}</span>
                    </div>
                  )}
                  {ev.capacity && (
                    <div className="meta-item">
                      <FiUsers />
                      <span>Capacity: {ev.capacity}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="ae-modal" onClick={() => setSelectedEvent(null)}>
          <div className="ae-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedEvent.title}</h3>
              <button className="close-btn" onClick={() => setSelectedEvent(null)}>
                ×
              </button>
            </div>
            
            <div className="modal-body">
              {selectedEvent.description && (
                <div className="detail-section">
                  <h4>Description</h4>
                  <p>{selectedEvent.description}</p>
                </div>
              )}

              <div className="detail-section">
                <h4>Event Details</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <strong>Start Time:</strong>
                    <span>{formatDate(selectedEvent.start_time)}</span>
                  </div>
                  <div className="detail-item">
                    <strong>End Time:</strong>
                    <span>{formatDate(selectedEvent.end_time)}</span>
                  </div>
                  {selectedEvent.capacity && (
                    <div className="detail-item">
                      <strong>Capacity:</strong>
                      <span>{selectedEvent.capacity} attendees</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <strong>Category:</strong>
                    <span>{selectedEvent.category || 'General'}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Status:</strong>
                    <span className={`status-badge ${getEventStatus(selectedEvent.start_time, selectedEvent.end_time)}`}>
                      {getEventStatus(selectedEvent.start_time, selectedEvent.end_time).charAt(0).toUpperCase() + 
                       getEventStatus(selectedEvent.start_time, selectedEvent.end_time).slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {selectedEvent.locations && parseLocations(selectedEvent.locations).length > 0 && (
                <div className="detail-section">
                  <h4>Locations</h4>
                  {parseLocations(selectedEvent.locations).map((loc, idx) => (
                    <div key={idx} className="location-item">
                      {typeof loc === 'string' ? (
                        <p>{loc}</p>
                      ) : (
                        <>
                          <p><strong>{loc.name || `Location ${idx + 1}`}</strong></p>
                          {loc.address && <p>{loc.address}</p>}
                          {loc.city && <p>{loc.city}</p>}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {selectedEvent.sessions && parseSessions(selectedEvent.sessions).length > 0 && (
                <div className="detail-section">
                  <h4>Sessions</h4>
                  {parseSessions(selectedEvent.sessions).map((session, idx) => (
                    <div key={idx} className="session-item">
                      <p><strong>{session.title || session.name || `Session ${idx + 1}`}</strong></p>
                      {session.time && <p>Time: {session.time}</p>}
                      {session.speaker && <p>Speaker: {session.speaker}</p>}
                      {session.description && <p>{session.description}</p>}
                    </div>
                  ))}
                </div>
              )}

              {selectedEvent.documents && parseDocuments(selectedEvent.documents).length > 0 && (
                <div className="detail-section">
                  <h4>Documents</h4>
                  <div className="documents-list">
                    {parseDocuments(selectedEvent.documents).map((doc, idx) => (
                      <div key={idx} className="document-item">
                        {typeof doc === 'string' ? doc : doc.name || `Document ${idx + 1}`}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedEvent.image_path && (
                <div className="detail-section">
                  <h4>Event Image</h4>
                  <img 
                    src={selectedEvent.image_path} 
                    alt={selectedEvent.title}
                    className="event-image"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}

              <div className="detail-section">
                <h4>Additional Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <strong>Event ID:</strong>
                    <span>{selectedEvent.event_id}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Created:</strong>
                    <span>{new Date(selectedEvent.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Created By:</strong>
                    <span>User #{selectedEvent.created_by}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-close" onClick={() => setSelectedEvent(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
