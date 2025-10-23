import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCopy, FiCalendar, FiMapPin } from 'react-icons/fi';
import { useTemplate } from '../../context/TemplateContext';
import './DuplicateTemplate.css';

// Category → placeholder image (same approach as SavedEvents)
const getPlaceholderImage = (category, title) => {
  const baseUrl = 'https://via.placeholder.com/600x400';
  const colors = {
    Technology: '4a00e0/ffffff',
    Music: 'ff6a00/ffffff',
    Sports: '00b09b/ffffff',
    Art: '8e2de2/ffffff',
    Business: '00c6ff/ffffff',
    Food: 'ff4b2b/ffffff',
  };
  return `${baseUrl}/${colors[category] || 'cccccc/333333'}?text=${encodeURIComponent(title || category || 'Event')}`;
};

export default function DuplicateTemplate() {
  const navigate = useNavigate();
  const { setTemplate } = useTemplate();

  // Dummy source events to duplicate from (aligning with MyAdminEvents fields)
  const source = useMemo(() => ([
    {
      id: 101,
      title: 'TechNova Hackathon 2025',
      date: '2025-10-18',
      startTime: '09:00',
      endTime: '18:00',
      location: 'Innovation Hub',
      category: 'Technology',
      capacity: 250,
      description: '48-hour hackathon focused on AI & Robotics',
      isPublic: true,
      requiresApproval: false,
      tickets: [
        { name: 'General', price: 0, qty: 100 },
        { name: 'VIP', price: 499, qty: 20 },
      ],
      sessions: [
        { title: 'Opening Ceremony', start: '09:00', end: '09:30', desc: 'Kickoff' },
        { title: 'Coding Sprint', start: '10:00', end: '17:00', desc: 'Team work time' },
      ],
      bannerName: '',
    },
    {
      id: 102,
      title: 'Annual Cultural Extravaganza',
      date: '2025-11-12',
      startTime: '16:00',
      endTime: '22:00',
      location: 'Main Auditorium',
      category: 'Cultural',
      capacity: 500,
      description: 'Cultural performances and competitions',
      isPublic: true,
      requiresApproval: false,
      tickets: [
        { name: 'Gallery', price: 0, qty: 200 },
        { name: 'Front Row', price: 299, qty: 50 },
      ],
      sessions: [
        { title: 'Classical Dance', start: '17:00', end: '18:00', desc: '' },
        { title: 'Band Night', start: '20:00', end: '22:00', desc: '' },
      ],
      bannerName: '',
    }
  ]), []);

  const duplicate = (ev) => {
    setTemplate(ev);
    navigate('/admin/event/newevent');
  };

  return (
    <div className="saved-events-page dup-templates">
      <div className="dup-header" style={{ textAlign: 'center' }}>
        <h1 className="page-title"><FiCopy style={{ marginRight: '0.55rem', verticalAlign: 'middle' }} /> Duplicate Template</h1>
        <p className="page-subtitle">Pick an event to copy into the Add Event form</p>
      </div>
  <div className="event-grid enforce">
        {source.map(ev => (
          <div className="event-card" key={ev.id}>
            <img
              src={getPlaceholderImage(ev.category, ev.title)}
              alt={ev.title}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = `data:image/jpeg;base64,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`;
              }}
            />
            <div className="event-details">
              {ev.category && <span className="event-cat">{ev.category}</span>}
              <h3>{ev.title}</h3>
              <div className="event-meta">
                <FiCalendar />
                <span>{ev.date}{ev.startTime ? ` • ${ev.startTime}-${ev.endTime}` : ''}</span>
              </div>
              {ev.location && (
                <div className="event-meta">
                  <FiMapPin />
                  <span>{ev.location}</span>
                </div>
              )}
              <button className="remove-btn" onClick={() => duplicate(ev)}>
                <FiCopy />
                <span>Use This</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
