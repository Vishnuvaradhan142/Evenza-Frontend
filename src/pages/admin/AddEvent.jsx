import React, { useEffect, useMemo, useState } from 'react';
import { FiCalendar, FiClock, FiMapPin, FiUsers, FiUpload, FiPlus, FiTag } from 'react-icons/fi';
import './AddEvent.css';
import { useTemplate } from '../../context/TemplateContext';

export default function AddEvent() {
  const { template, clearTemplate } = useTemplate();
  const [form, setForm] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
  category: 'Technology',
    capacity: '',
    description: '',
    isPublic: true,
    requiresApproval: false,
  });
  const [locations, setLocations] = useState([
    { name: '', address: '' },
  ]);
  const [tickets, setTickets] = useState([
    { name: 'General', price: 0, qty: 100 },
  ]);
  const [sessions, setSessions] = useState([
    { title: '', start: '', end: '', desc: '' },
  ]);
  const [dragIndex, setDragIndex] = useState(null);
  const [bannerName, setBannerName] = useState('');
  const [events, setEvents] = useState([]); // local preview list only

  const isValid = useMemo(() => {
    return (
      form.title.trim() &&
      form.date &&
      form.startTime &&
      form.endTime &&
      locations.some(loc => loc.name.trim()) &&
      Number(form.capacity) > 0 &&
      tickets.every(t => t.name.trim() && Number(t.price) >= 0 && Number(t.qty) > 0)
    );
  }, [form, locations, tickets]);

  const errors = {
    title: form.title.trim() ? '' : 'Title is required',
    date: form.date ? '' : 'Date is required',
    startTime: form.startTime ? '' : 'Start time is required',
    endTime: form.endTime ? '' : 'End time is required',
    locations: locations.some(loc => loc.name.trim()) ? '' : 'At least one location is required',
    capacity: Number(form.capacity) > 0 ? '' : 'Capacity must be greater than 0',
  };

  const updateField = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const addLocation = () => setLocations(l => [...l, { name: '', address: '' }]);
  const removeLocation = (idx) => setLocations(l => l.filter((_, i) => i !== idx));
  const updateLocation = (idx, key, value) => setLocations(l => l.map((row, i) => i === idx ? { ...row, [key]: value } : row));

  const addTicket = () => setTickets(t => [...t, { name: '', price: 0, qty: 0 }]);
  const removeTicket = (idx) => setTickets(t => t.filter((_, i) => i !== idx));
  const updateTicket = (idx, key, value) => setTickets(t => t.map((row, i) => i === idx ? { ...row, [key]: value } : row));

  const addSession = () => setSessions(s => [...s, { title: '', start: '', end: '', desc: '' }]);
  const removeSession = (idx) => setSessions(s => s.filter((_, i) => i !== idx));
  const updateSession = (idx, key, value) => setSessions(s => s.map((row, i) => i === idx ? { ...row, [key]: value } : row));

  // Drag & drop handlers for sessions reordering
  const handleSessionDragStart = (index) => setDragIndex(index);
  const handleSessionDragOver = (e, index) => {
    e.preventDefault();
  };
  const handleSessionDrop = (index) => {
    if (dragIndex === null || dragIndex === index) return;
    setSessions(prev => {
      const arr = [...prev];
      const [moved] = arr.splice(dragIndex, 1);
      arr.splice(index, 0, moved);
      return arr;
    });
    setDragIndex(null);
  };
  const handleSessionDragEnd = () => setDragIndex(null);

  const handleBanner = (e) => {
    const file = e.target.files?.[0];
    setBannerName(file ? file.name : '');
  };

  // If a template is present, prefill and then clear it
  useEffect(() => {
    if (!template) return;
    const t = template;
    setForm(f => ({
      ...f,
      title: t.title || '',
      date: t.date || '',
      startTime: t.startTime || '',
      endTime: t.endTime || '',
      category: t.category || 'Technology',
      capacity: String(t.capacity ?? ''),
      description: t.description || '',
      isPublic: t.isPublic ?? true,
      requiresApproval: t.requiresApproval ?? false,
    }));
    if (Array.isArray(t.locations) && t.locations.length) {
      setLocations(t.locations.map(x => ({ name: x.name || '', address: x.address || '' })));
    } else if (t.location) {
      // Handle legacy single location
      setLocations([{ name: t.location, address: '' }]);
    }
    if (Array.isArray(t.tickets) && t.tickets.length) setTickets(t.tickets.map(x => ({ name: x.name || '', price: Number(x.price||0), qty: Number(x.qty||0) })));
    if (Array.isArray(t.sessions) && t.sessions.length) setSessions(t.sessions.map(x => ({ title: x.title||'', start: x.start||'', end: x.end||'', desc: x.desc||'' })));
    if (t.bannerName) setBannerName(t.bannerName);
    clearTemplate();
  }, [template, clearTemplate]);

  const submit = (e) => {
    e.preventDefault();
    if (!isValid) return;
    // Build local event object
    const eventObj = {
      id: Date.now(),
      ...form,
      locations: locations.filter(loc => loc.name.trim()),
      tickets: tickets.map(t => ({ ...t, price: Number(t.price), qty: Number(t.qty) })),
      sessions,
      bannerName,
    };
    setEvents(list => [eventObj, ...list]);
    // Reset
  setForm({ title: '', date: '', startTime: '', endTime: '', category: 'Technology', capacity: '', description: '', isPublic: true, requiresApproval: false });
    setLocations([{ name: '', address: '' }]);
    setTickets([{ name: 'General', price: 0, qty: 100 }]);
    setSessions([{ title: '', start: '', end: '', desc: '' }]);
    setBannerName('');
  };

  const meta = useMemo(() => ({
    locations: locations.filter(loc => loc.name.trim()).length,
    tickets: tickets.length,
    sessions: sessions.filter(s => s.title || s.start || s.end || s.desc).length,
    banner: Boolean(bannerName),
  }), [locations, tickets, sessions, bannerName]);

  return (
    <div className="add-event-page" style={{ flex: 1 }}>
      <div className="page-header" style={{ textAlign: 'center' }}>
        <h1 className="page-title"><FiCalendar /> Create Event</h1>
        <p style={{ textAlign: 'center', marginLeft: 'auto', marginRight: 'auto', transform: 'translateX(24px)' }}>
          Design an event with schedule and ticketing. No backend calls are made.
        </p>
        <div className="chips">
          <span className="chip"><FiMapPin /> Locations: {meta.locations}</span>
          <span className="chip"><FiTag /> Tickets: {meta.tickets}</span>
          <span className="chip"><FiClock /> Sessions: {meta.sessions}</span>
          <span className="chip"><FiUpload /> Banner: {meta.banner ? 'Selected' : 'None'}</span>
        </div>
      </div>

      <form className="event-form" onSubmit={submit}>
        <div className="form-grid">
          <div className="field">
            <label>Title</label>
            <input value={form.title} onChange={e => updateField('title', e.target.value)} placeholder="e.g. TechFest Hackathon" />
            {errors.title && <div className="help error-msg">{errors.title}</div>}
          </div>
          <div className="field">
            <label><FiCalendar /> Date</label>
            <input type="date" value={form.date} onChange={e => updateField('date', e.target.value)} />
            {errors.date && <div className="help error-msg">{errors.date}</div>}
          </div>
          <div className="field">
            <label><FiClock /> Start Time</label>
            <input type="time" value={form.startTime} onChange={e => updateField('startTime', e.target.value)} />
            {errors.startTime && <div className="help error-msg">{errors.startTime}</div>}
          </div>
          <div className="field">
            <label><FiClock /> End Time</label>
            <input type="time" value={form.endTime} onChange={e => updateField('endTime', e.target.value)} />
            {errors.endTime && <div className="help error-msg">{errors.endTime}</div>}
          </div>

          <div className="field">
            <label>Category</label>
            <select value={form.category} onChange={e => updateField('category', e.target.value)}>
              <option>Technology</option>
              <option>Cultural</option>
              <option>Sports</option>
              <option>Business</option>
              <option>Workshop</option>
            </select>
            <div className="help">Choose a category to help users find your event.</div>
          </div>
          <div className="field">
            <label><FiUsers /> Capacity</label>
            <input type="number" min="1" value={form.capacity} onChange={e => updateField('capacity', e.target.value)} placeholder="250" />
            {errors.capacity && <div className="help error-msg">{errors.capacity}</div>}
          </div>
        </div>

        <div className="field">
          <label>Description</label>
          <textarea rows={4} value={form.description} onChange={e => updateField('description', e.target.value)} placeholder="Describe the event, goals, audience..." />
          <div className="help">Add key details: who is it for, what to expect, any prerequisites.</div>
        </div>

        <div className="section">
          <div className="section-header">
            <h3><FiMapPin /> Event Locations</h3>
            <button type="button" className="btn ghost" onClick={addLocation}><FiPlus /> Add Location</button>
          </div>
          {errors.locations && <div className="help error-msg">{errors.locations}</div>}
          <div className="locations-grid">
            <div className="location-headers">
              <span>Location Name</span>
              <span>Address</span>
              <span></span>
            </div>
            {locations.map((loc, i) => (
              <div key={i} className="location-card">
                <div className="location-row">
                  <input 
                    placeholder="e.g. Main Auditorium" 
                    value={loc.name} 
                    onChange={e => updateLocation(i, 'name', e.target.value)} 
                  />
                  <input 
                    placeholder="e.g. Building A, Floor 2" 
                    value={loc.address} 
                    onChange={e => updateLocation(i, 'address', e.target.value)} 
                  />
                  {locations.length > 1 && (
                    <button 
                      type="button" 
                      className="remove-btn accent" 
                      aria-label="Remove location" 
                      onClick={() => removeLocation(i)} 
                      title="Remove"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="options-row">
          <label className="checkbox">
            <input type="checkbox" checked={form.isPublic} onChange={e => updateField('isPublic', e.target.checked)} />
            Public Event
          </label>
          <label className="checkbox">
            <input type="checkbox" checked={form.requiresApproval} onChange={e => updateField('requiresApproval', e.target.checked)} />
            Require Admin Approval
          </label>
        </div>

        <div className="section">
          <div className="section-header">
            <h3><FiTag /> Ticket Types</h3>
            <button type="button" className="btn ghost" onClick={addTicket}><FiPlus /> Add Ticket</button>
          </div>
          <div className="tickets-grid">
            <div className="ticket-headers">
              <span>Name</span>
              <span>Price</span>
              <span>Qty</span>
              <span></span>
            </div>
            {tickets.map((t, i) => (
              <div key={i} className="ticket-card">
                <div className="row">
                  <input placeholder="Name" value={t.name} onChange={e => updateTicket(i, 'name', e.target.value)} />
                  <input type="number" min="0" placeholder="Price" value={t.price} onChange={e => updateTicket(i, 'price', e.target.value)} />
                  <input type="number" min="0" placeholder="Quantity" value={t.qty} onChange={e => updateTicket(i, 'qty', e.target.value)} />
                  <button type="button" className="remove-btn accent" aria-label="Remove ticket" onClick={() => removeTicket(i)} title="Remove">Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="section">
          <div className="section-header">
            <h3><FiClock /> Agenda / Sessions</h3>
            <button type="button" className="btn ghost" onClick={addSession}><FiPlus /> Add Session</button>
          </div>
          <div className="sessions-grid">
            <div className="session-headers">
              <span>Title</span>
              <span>Start</span>
              <span>End</span>
              <span>Description</span>
              <span></span>
            </div>
            {sessions.map((s, i) => (
              <div
                key={i}
                className={`session-card ${dragIndex === i ? 'dragging' : ''}`}
                draggable
                onDragStart={() => handleSessionDragStart(i)}
                onDragOver={(e) => handleSessionDragOver(e, i)}
                onDrop={() => handleSessionDrop(i)}
                onDragEnd={handleSessionDragEnd}
                title="Drag to reorder"
              >
                <div className="session-row">
                  <input placeholder="Session title" value={s.title} onChange={e => updateSession(i, 'title', e.target.value)} />
                  <input type="time" value={s.start} onChange={e => updateSession(i, 'start', e.target.value)} placeholder="Start" />
                  <input type="time" value={s.end} onChange={e => updateSession(i, 'end', e.target.value)} placeholder="End" />
                  <textarea rows={3} placeholder="Description" value={s.desc} onChange={e => updateSession(i, 'desc', e.target.value)} />
                  <button type="button" className="remove-btn accent" aria-label="Remove session" onClick={() => removeSession(i)} title="Remove">Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="upload-row">
          <label className="upload">
            <FiUpload />
            <span>{bannerName || 'Upload banner (optional)'}</span>
            <input type="file" accept="image/*" onChange={handleBanner} />
          </label>
        </div>
        <div className="help">Use a 16:9 image for best results. Max ~2MB recommended.</div>

        <div className="actions">
          <button className="btn primary" disabled={!isValid} type="submit">Create Event</button>
          <button className="btn secondary" type="button" onClick={() => {
            setForm({ title: '', date: '', startTime: '', endTime: '', category: 'Technology', capacity: '', description: '', isPublic: true, requiresApproval: false });
            setLocations([{ name: '', address: '' }]);
            setTickets([{ name: 'General', price: 0, qty: 100 }]);
            setSessions([{ title: '', start: '', end: '', desc: '' }]);
            setBannerName('');
          }}>Reset</button>
        </div>
      </form>

      <div className="preview-section">
        <h2>Recently Created (Local Preview)</h2>
        {events.length === 0 ? (
          <div className="empty">No events yet. Create your first event above.</div>
        ) : (
          <div className="cards">
            {events.map(ev => (
              <div key={ev.id} className="event-card">
                <div className="event-card-header">
                  <h4>{ev.title}</h4>
                  <span className={`pill ${ev.isPublic ? 'green' : 'gray'}`}>{ev.isPublic ? 'Public' : 'Private'}</span>
                </div>
                <div className="meta">
                  <span><FiCalendar /> {ev.date}</span>
                  <span><FiClock /> {ev.startTime || '—'} - {ev.endTime || '—'}</span>
                  <span><FiMapPin /> {ev.locations?.length > 0 ? `${ev.locations.length} location${ev.locations.length > 1 ? 's' : ''}` : 'No locations'}</span>
                  <span><FiUsers /> {ev.capacity}</span>
                </div>
                <div className="desc">{ev.description || '—'}</div>
                <div className="divider" />
                <div className="subgrid">
                  <div>
                    <strong>Locations:</strong>
                    <ul>
                      {ev.locations?.map((loc, idx) => (
                        <li key={idx}>
                          {loc.name}
                          {loc.address && ` — ${loc.address}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong>Tickets:</strong>
                    <ul>
                      {ev.tickets.map((t, idx) => (
                        <li key={idx}>{t.name} — ₹{t.price} × {t.qty}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong>Sessions:</strong>
                    <ul>
                      {ev.sessions.filter(s => s.title || s.start || s.end || s.desc).map((s, idx) => (
                        <li key={idx}>{s.title || '—'} — {s.start || '—'} - {s.end || '—'}{s.desc ? ` — ${s.desc}` : ''}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
