import React, { useEffect, useMemo, useState } from 'react';
import { FiSearch, FiEdit, FiArchive, FiRefreshCw, FiTrash2, FiDownload } from 'react-icons/fi';
import API from '../../api';
import './AllEvents.css';

const SAMPLE_EVENTS = [
  { id: 201, title: 'Autumn Innovators Summit', date: '2025-11-12', location: 'London', attendees: 420, status: 'published' },
  { id: 202, title: 'React Conf - Mini', date: '2025-03-21', location: 'Remote', attendees: 780, status: 'draft' },
  { id: 203, title: 'Startup Pitch Night', date: '2025-02-14', location: 'San Francisco', attendees: 150, status: 'archived', archived_at: '2025-09-10' },
];

const STORAGE_KEY = 'allEvents_v1';

export default function AllEvents() {
  // we'll open an inline edit modal for owners instead of navigating to admin routes
  // const navigate = useNavigate();
  const [editingEvent, setEditingEvent] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', date: '', location: '', attendees: '' });
  const [events, setEvents] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : SAMPLE_EVENTS;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await API.get('/events').catch(() => null);
        if (!mounted) return;
        if (res && Array.isArray(res.data)) setEvents(res.data);
      } catch (e) {
        console.error('Error loading events:', e);
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter(ev => {
      if (filter === 'published' && ev.status !== 'published') return false;
      if (filter === 'draft' && ev.status !== 'draft') return false;
      if (filter === 'archived' && ev.status !== 'archived') return false;
      if (searchQuery && !`${ev.title} ${ev.location}`.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [events, searchQuery, filter]);

  const archiveEvent = async (id) => {
    try { await API.post(`/events/${id}/archive`).catch(() => null); } catch (e) {}
    setEvents(state => state.map(ev => (ev.id === id ? { ...ev, status: 'archived', archived_at: new Date().toISOString().slice(0, 10) } : ev)));
  };

  const restoreEvent = async (id) => {
    try { await API.post(`/events/${id}/restore`).catch(() => null); } catch (e) {}
    setEvents(state => state.map(ev => (ev.id === id ? { ...ev, status: 'published', archived_at: undefined } : ev)));
  };

  const deleteEvent = async (id) => {
    try { await API.delete(`/events/${id}`).catch(() => null); } catch (e) {}
    setEvents(state => state.filter(ev => ev.id !== id));
    setConfirmDelete(null);
  };

  const exportCSV = () => {
    const header = ['id', 'title', 'date', 'location', 'attendees', 'status', 'archived_at'].join(',');
    const rows = events.map(e => [e.id, `"${e.title.replace(/"/g, '""')}"`, e.date, `"${(e.location || '').replace(/"/g, '""')}"`, e.attendees || 0, e.status, e.archived_at || ''].join(','));
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `events-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="ae-page">
      <header className="ae-header">
        <div>
          <h2>All Events</h2>
          <p className="muted">View and manage all events across the platform.</p>
        </div>
        <div className="ae-controls">
          <div className="ae-search">
            <FiSearch />
            <input placeholder="Search events..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <select value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
          <button className="btn" onClick={exportCSV}><FiDownload /> Export</button>
        </div>
      </header>
      <div className="ae-list card">
        {loading && <div className="ae-loading">Loading events...</div>}
        {!loading && filteredEvents.length === 0 && <div className="empty">No events found.</div>}
        {filteredEvents.map(ev => (
          <div className={`ae-item ${ev.status}`} key={ev.id}>
            <div className="main">
              <div className="title">{ev.title} {ev.status === 'archived' && <span className="badge">Archived</span>}</div>
              <div className="meta muted">{ev.date} • {ev.location} • {ev.attendees || 0} attendees</div>
            </div>
            <div className="actions">
              <button className="btn" onClick={() => {
                setEditingEvent(ev);
                setEditForm({ title: ev.title||'', date: ev.date||'', location: ev.location||'', attendees: ev.attendees||0 });
              }}><FiEdit /> Edit</button>
              {ev.status !== 'archived' ? (
                <button className="btn" onClick={() => archiveEvent(ev.id)}><FiArchive /> Archive</button>
              ) : (
                <button className="btn" onClick={() => restoreEvent(ev.id)}><FiRefreshCw /> Restore</button>
              )}
              <button className="btn danger" onClick={() => setConfirmDelete(ev.id)}><FiTrash2 /> Delete</button>
            </div>
          </div>
        ))}
      </div>
      {confirmDelete && (
        <div className="ae-modal">
          <div className="ae-modal-card">
            <h3>Delete event?</h3>
            <p>This will permanently delete the event. This action cannot be undone.</p>
            <div className="row">
              <button className="btn" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn danger" onClick={() => deleteEvent(confirmDelete)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {editingEvent && (
        <div className="ae-modal">
          <div className="ae-modal-card">
            <h3>Edit event</h3>
            <div style={{display:'grid',gap:10}}>
              <label>Title
                <input value={editForm.title} onChange={e=>setEditForm(f=>({...f,title:e.target.value}))} />
              </label>
              <label>Date
                <input type="date" value={editForm.date} onChange={e=>setEditForm(f=>({...f,date:e.target.value}))} />
              </label>
              <label>Location
                <input value={editForm.location} onChange={e=>setEditForm(f=>({...f,location:e.target.value}))} />
              </label>
              <label>Attendees
                <input type="number" value={editForm.attendees} onChange={e=>setEditForm(f=>({...f,attendees:parseInt(e.target.value||0,10)}))} />
              </label>
            </div>
            <div className="row" style={{marginTop:16}}>
              <button className="btn" onClick={()=> setEditingEvent(null)}>Cancel</button>
              <button className="btn" onClick={async ()=>{
                // save changes to API if available, else update local state
                const updated = { ...editingEvent, title: editForm.title, date: editForm.date, location: editForm.location, attendees: editForm.attendees };
                try{ await API.put(`/events/${editingEvent.id}`, updated).catch(()=>null); }catch(e){}
                setEvents(s=> s.map(ev=> ev.id===editingEvent.id ? updated : ev));
                setEditingEvent(null);
              }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
