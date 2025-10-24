import React, { useEffect, useMemo, useState } from 'react';
import API from '../../api';
import { FiCalendar, FiClock, FiMapPin, FiUsers, FiUpload, FiPlus, FiTag, FiX } from 'react-icons/fi';
import './AddEvent.css';
import { useTemplate } from '../../context/TemplateContext';

// Category mapping provided by backend (module scope for stable reference)
const CATEGORIES = [
  { id: 1, name: 'Technology' },
  { id: 2, name: 'Cultural Programs' },
  { id: 3, name: 'Sports' },
  { id: 4, name: 'Workshops' },
  { id: 5, name: 'Music & Concerts' },
  { id: 6, name: 'Networking' },
];

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
    requiresApproval: true,
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
  const [bannerFile, setBannerFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');
  const [submitErr, setSubmitErr] = useState('');
  const [recentDrafts, setRecentDrafts] = useState([]);
  const [draftsLoading, setDraftsLoading] = useState(false);
  const [draftsErr, setDraftsErr] = useState('');
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [modalDraft, setModalDraft] = useState(null);
  const [modalSaving, setModalSaving] = useState(false);
  const [modalErr, setModalErr] = useState('');
  const [modalMsg, setModalMsg] = useState('');
  const [modalDate, setModalDate] = useState('');
  const [modalStart, setModalStart] = useState('');
  const [modalEnd, setModalEnd] = useState('');
  const [modalBannerFile, setModalBannerFile] = useState(null);
  const [modalBannerPreview, setModalBannerPreview] = useState('');
  const [bannerBust, setBannerBust] = useState(0);
  const [removingBanner, setRemovingBanner] = useState(false);
  const serverBase = useMemo(() => (API.defaults?.baseURL || '').replace(/\/api\/?$/, ''), []);
  const urlFor = (p) => {
    if (!p) return '';
    if (/^https?:\/\//i.test(p)) return p;
    return `${serverBase}${p}`;
  };

  // Helpers for date/time formatting
  const pad2 = (n) => String(n).padStart(2, '0');
  const toDateInput = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
  };
  const toTimeInput = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  };
  const combineDateTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return '';
    return `${dateStr} ${timeStr}:00`;
  };

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
    setBannerFile(file || null);
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
      // Accept either category name or id
      category: (() => {
        if (t.category === 0 || t.category) {
          const asString = String(t.category);
          const byId = CATEGORIES.find(c => String(c.id) === asString)?.name;
          return byId || (typeof t.category === 'string' ? t.category : 'Technology');
        }
        return 'Technology';
      })(),
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
  const meta = useMemo(() => ({
    locations: locations.filter(loc => loc.name.trim()).length,
    tickets: tickets.length,
    sessions: sessions.filter(s => s.title || s.start || s.end || s.desc).length,
    banner: Boolean(bannerName),
  }), [locations, tickets, sessions, bannerName]);

  // Load recent drafts belonging to current user
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setDraftsLoading(true);
        setDraftsErr('');
        const res = await API.get('/drafts/mine', { params: { limit: 5, status: 'draft' } });
        if (!ignore) setRecentDrafts(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        const status = e?.response?.status;
        let msg = e?.response?.data?.message || e.message || 'Failed to load drafts';
        if (status === 401 || status === 403) {
          msg = 'Sign in to view your recent drafts';
        }
        if (!ignore) setDraftsErr(msg);
      } finally {
        if (!ignore) setDraftsLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, []);

  const openDraft = async (draftId) => {
    try {
      setModalErr('');
      setModalMsg('');
      const res = await API.get(`/drafts/${draftId}`);
      const d = res.data || {};
      setModalDraft({
        draft_id: d.draft_id,
        title: d.title || '',
        description: d.description || '',
        capacity: d.capacity ?? 0,
        status: d.status || 'draft',
        submitted_at: d.submitted_at || null,
        start_time: d.start_time || null,
        end_time: d.end_time || null,
        locations: (() => {
          try {
            if (!d.locations) return [];
            if (typeof d.locations === 'string') return JSON.parse(d.locations);
            return Array.isArray(d.locations) ? d.locations : [];
          } catch { return []; }
        })(),
        sessions: (() => {
          try {
            if (!d.sessions) return [];
            if (typeof d.sessions === 'string') return JSON.parse(d.sessions);
            return Array.isArray(d.sessions) ? d.sessions : [];
          } catch { return []; }
        })(),
        attachments: Array.isArray(d.attachments) ? d.attachments : [],
      });
      setModalDate(toDateInput(d.start_time || d.end_time));
      setModalStart(toTimeInput(d.start_time));
      setModalEnd(toTimeInput(d.end_time));
      setModalBannerFile(null);
      setModalBannerPreview('');
      setShowDraftModal(true);
    } catch (e) {
      setModalErr(e?.response?.data?.message || e.message || 'Failed to load draft');
    }
  };

  const saveDraft = async () => {
    if (!modalDraft) return;
    try {
      setModalSaving(true);
      setModalErr('');
      setModalMsg('');
      const startStr = combineDateTime(modalDate, modalStart);
      const endStr = combineDateTime(modalDate, modalEnd);

      const base = {
        title: modalDraft.title,
        description: modalDraft.description,
        capacity: Number(modalDraft.capacity) || 0,
        locations: Array.isArray(modalDraft.locations)
          ? modalDraft.locations.map(l => ({ name: (l.name||'').trim(), address: (l.address||'').trim() }))
          : [],
        sessions: Array.isArray(modalDraft.sessions)
          ? modalDraft.sessions.map(s => ({ title: (s.title||'').trim(), start: s.start || '', end: s.end || '', desc: (s.desc||'').trim() }))
          : [],
        start_time: startStr || null,
        end_time: endStr || null,
      };

      let updatedDraft = null;
      if (modalBannerFile) {
        const fd = new FormData();
        fd.append('title', base.title);
        fd.append('description', base.description || '');
        fd.append('capacity', String(base.capacity || 0));
        fd.append('locations', JSON.stringify(base.locations || []));
        fd.append('sessions', JSON.stringify(base.sessions || []));
        if (base.start_time) fd.append('start_time', base.start_time);
        if (base.end_time) fd.append('end_time', base.end_time);
        fd.append('files', modalBannerFile);
        // Let Axios/browser set proper multipart boundaries automatically
        const res = await API.put(`/drafts/${modalDraft.draft_id}`, fd);
        updatedDraft = res?.data?.draft || null;
      } else {
        const res = await API.put(`/drafts/${modalDraft.draft_id}`, base);
        updatedDraft = res?.data?.draft || null;
      }
      setModalMsg('Draft updated');
      // Refresh recent drafts (current user)
      try {
        const r2 = await API.get('/drafts/mine', { params: { limit: 5, status: 'draft' } });
        setRecentDrafts(Array.isArray(r2.data) ? r2.data : []);
      } catch {}
      // Update modal draft data from server response (reflect DB state)
      if (updatedDraft) {
        setModalDraft(m => ({
          ...m,
          title: updatedDraft.title ?? m.title,
          description: updatedDraft.description ?? m.description,
          capacity: updatedDraft.capacity ?? m.capacity,
          start_time: updatedDraft.start_time ?? base.start_time,
          end_time: updatedDraft.end_time ?? base.end_time,
          locations: (() => {
            try {
              const v = updatedDraft.locations;
              if (!v) return m.locations;
              if (typeof v === 'string') return JSON.parse(v);
              return Array.isArray(v) ? v : m.locations;
            } catch { return m.locations; }
          })(),
          sessions: (() => {
            try {
              const v = updatedDraft.sessions;
              if (!v) return m.sessions;
              if (typeof v === 'string') return JSON.parse(v);
              return Array.isArray(v) ? v : m.sessions;
            } catch { return m.sessions; }
          })(),
          attachments: Array.isArray(updatedDraft.attachments) ? updatedDraft.attachments : m.attachments,
        }));
        setModalBannerFile(null);
        setModalBannerPreview('');
        setBannerBust(Date.now());
      }
    } catch (e) {
      setModalErr(e?.response?.data?.message || e.message || 'Failed to update draft');
    } finally {
      setModalSaving(false);
    }
  };

  const removeBanner = async () => {
    if (!modalDraft) return;
    try {
      setRemovingBanner(true);
      setModalErr('');
      setModalMsg('');
      const res = await API.put(`/drafts/${modalDraft.draft_id}`, { removeBanner: true });
      setModalMsg('Banner removed');
      const updated = res?.data?.draft || null;
      if (updated) {
        setModalDraft(m => ({ ...m, attachments: Array.isArray(updated.attachments) ? updated.attachments : [] }));
      }
      setModalBannerFile(null);
      setModalBannerPreview('');
      setBannerBust(Date.now());
      // refresh list
      try {
        const r2 = await API.get('/drafts/mine', { params: { limit: 5, status: 'draft' } });
        setRecentDrafts(Array.isArray(r2.data) ? r2.data : []);
      } catch {}
    } catch (e) {
      setModalErr(e?.response?.data?.message || e.message || 'Failed to remove banner');
    } finally {
      setRemovingBanner(false);
    }
  };

  const deleteDraft = async (id) => {
    if (!id) return;
    const ok = window.confirm('Delete this draft? This cannot be undone.');
    if (!ok) return;
    try {
      await API.delete(`/drafts/${id}`);
      // Refresh list
      try {
        const r2 = await API.get('/drafts/mine', { params: { limit: 5, status: 'draft' } });
        setRecentDrafts(Array.isArray(r2.data) ? r2.data : []);
      } catch {}
      // Close modal if it was the same draft
      setShowDraftModal(false);
      setModalDraft(null);
    } catch (e) {
      alert(e?.response?.data?.message || e.message || 'Failed to delete draft');
    }
  };

  // Submit to backend drafts API
  const submit = async (e) => {
    e.preventDefault();
    setSubmitMsg('');
    setSubmitErr('');
    if (!isValid) return;

    try {
      setSubmitting(true);
      // Build form data matching backend /api/drafts route (JSON arrays for locations/sessions)
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description || '');
      // capacity
      fd.append('capacity', String(form.capacity || 0));
      // locations as JSON array (filter empty)
      const locs = locations
        .map(l => ({ name: (l.name||'').trim(), address: (l.address||'').trim() }))
        .filter(l => l.name);
      fd.append('locations', JSON.stringify(locs));
      // sessions as JSON array (filter empty rows)
      const sess = sessions
        .map(s => ({ title: (s.title||'').trim(), start: s.start || '', end: s.end || '', desc: (s.desc||'').trim() }))
        .filter(s => s.title || s.start || s.end || s.desc);
      fd.append('sessions', JSON.stringify(sess));
      // require admin approval?
      fd.append('requiresApproval', String(!!form.requiresApproval));
      // Combine date + time to ISO-like MySQL friendly string
      const start = form.date && form.startTime ? `${form.date} ${form.startTime}:00` : '';
      const end = form.date && form.endTime ? `${form.date} ${form.endTime}:00` : '';
      if (start) fd.append('start_time', start);
      if (end) fd.append('end_time', end);
      // Optional fields not in UI yet
      // fd.append('latitude', '');
      // fd.append('longitude', '');
  // Category: send numeric category_id expected by backend
  const selectedCategory = CATEGORIES.find(c => c.name === form.category);
  if (selectedCategory) fd.append('category_id', String(selectedCategory.id));
      if (bannerFile) fd.append('files', bannerFile);

      await API.post('/drafts', fd, { headers: { 'Content-Type': 'multipart/form-data' } });

      setSubmitMsg('Draft created successfully');
      // Refresh recent drafts list (current user)
      try {
        const r2 = await API.get('/drafts/mine', { params: { limit: 5, status: 'draft' } });
        setRecentDrafts(Array.isArray(r2.data) ? r2.data : []);
      } catch (_) {}
      // Reset form after success
  setForm({ title: '', date: '', startTime: '', endTime: '', category: 'Technology', capacity: '', description: '', isPublic: true, requiresApproval: true });
      setLocations([{ name: '', address: '' }]);
      setTickets([{ name: 'General', price: 0, qty: 100 }]);
      setSessions([{ title: '', start: '', end: '', desc: '' }]);
      setBannerName('');
      setBannerFile(null);
    } catch (err) {
      console.error('Create draft failed', err);
      const msg = err?.response?.data?.message || err.message || 'Failed to create draft';
      setSubmitErr(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-event-page" style={{ flex: 1 }}>
      <div className="page-header" style={{ textAlign: 'center' }}>
        <h1 className="page-title"><FiCalendar /> Create Event</h1>
        <p style={{ textAlign: 'center', marginLeft: 'auto', marginRight: 'auto', transform: 'translateX(24px)' }}>
          Design an event with schedule and ticketing. On submit, we create a draft for admin review.
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
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
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
                      <FiX />
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
                  <button type="button" className="remove-btn accent" aria-label="Remove ticket" onClick={() => removeTicket(i)} title="Remove"><FiX /></button>
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
                  <button type="button" className="remove-btn accent" aria-label="Remove session" onClick={() => removeSession(i)} title="Remove"><FiX /></button>
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
          <button className="btn primary" disabled={!isValid || submitting} type="submit">{submitting ? 'Submitting…' : 'Create Event'}</button>
          <button className="btn secondary" type="button" onClick={() => {
            setForm({ title: '', date: '', startTime: '', endTime: '', category: 'Technology', capacity: '', description: '', isPublic: true, requiresApproval: true });
            setLocations([{ name: '', address: '' }]);
            setTickets([{ name: 'General', price: 0, qty: 100 }]);
            setSessions([{ title: '', start: '', end: '', desc: '' }]);
            setBannerName('');
          }}>Reset</button>
        </div>
      </form>

      {/* Submission feedback */}
      {(submitMsg || submitErr) && (
        <div className="submit-status" style={{ maxWidth: 960, margin: '24px auto 0' }}>
          {submitMsg && <div className="alert success">{submitMsg}</div>}
          {submitErr && <div className="alert error">{submitErr}</div>}
        </div>
      )}

      {/* Recent Drafts */}
      <div className="section" style={{ maxWidth: 960, margin: '24px auto' }}>
        <div className="section-header">
          <h3>Recent Drafts</h3>
        </div>
        {draftsLoading && <div className="help">Loading drafts…</div>}
        {draftsErr && <div className="alert error">{draftsErr}</div>}
        {!draftsLoading && !draftsErr && (
          recentDrafts.length === 0 ? (
            <div className="help">No drafts yet. Create your first draft above.</div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {recentDrafts.filter(d => d.status === 'draft').map(d => (
                <li key={d.draft_id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px', border: '1px solid var(--border, #e3e3e3)', borderRadius: 8,
                  marginBottom: 10, background: 'var(--card, #fff)'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <strong style={{ marginBottom: 4 }}>{d.title || 'Untitled draft'}</strong>
                    <span style={{ fontSize: 12, color: 'var(--muted, #666)' }}>
                      {(d.submitted_at ? new Date(d.submitted_at) : new Date()).toLocaleString()} • Status: {d.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" className="btn ghost" onClick={() => openDraft(d.draft_id)}>View</button>
                    <button type="button" className="btn secondary" onClick={() => deleteDraft(d.draft_id)}>Delete</button>
                  </div>
                </li>) )}
            </ul>
          )
        )}
      </div>

      {/* Draft modal */}
      {showDraftModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }} onClick={() => setShowDraftModal(false)}>
          <div style={{
            width: 'min(600px, 92vw)', background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            maxHeight: '85vh', overflowY: 'auto'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0 }}>Edit Draft</h3>
              <button className="remove-btn" aria-label="Close" onClick={() => setShowDraftModal(false)}><FiX /></button>
            </div>
            {modalErr && <div className="alert error" style={{ marginTop: 8 }}>{modalErr}</div>}
            {modalMsg && <div className="alert success" style={{ marginTop: 8 }}>{modalMsg}</div>}
            {modalDraft && (
              <div style={{ marginTop: 12, display: 'grid', gap: 12 }}>
                <div className="field">
                  <label>Title</label>
                  <input value={modalDraft.title} onChange={e => setModalDraft(m => ({ ...m, title: e.target.value }))} />
                </div>
                <div className="field">
                  <label>Description</label>
                  <textarea rows={4} value={modalDraft.description} onChange={e => setModalDraft(m => ({ ...m, description: e.target.value }))} />
                </div>
                <div className="field">
                  <label>Capacity</label>
                  <input type="number" min="0" value={modalDraft.capacity} onChange={e => setModalDraft(m => ({ ...m, capacity: e.target.value }))} />
                </div>
                <div className="field">
                  <label>Status</label>
                  <input disabled value={modalDraft.status} />
                </div>
                <div className="field">
                  <label>Submitted</label>
                  <input disabled value={modalDraft.submitted_at ? new Date(modalDraft.submitted_at).toLocaleString() : '—'} />
                </div>
                <div className="field">
                  <label><FiCalendar /> Date</label>
                  <input type="date" value={modalDate} onChange={e => setModalDate(e.target.value)} />
                </div>
                <div className="field" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label><FiClock /> Start Time</label>
                    <input type="time" value={modalStart} onChange={e => setModalStart(e.target.value)} />
                  </div>
                  <div>
                    <label><FiClock /> End Time</label>
                    <input type="time" value={modalEnd} onChange={e => setModalEnd(e.target.value)} />
                  </div>
                </div>
                {modalDraft.attachments && modalDraft.attachments.length > 0 && (
                  <div className="field">
                    <label>Banner Preview</label>
                    <div style={{ border: '1px solid var(--border,#e3e3e3)', borderRadius: 8, padding: 8 }}>
                      <img src={(modalBannerPreview || urlFor(modalDraft.attachments[0])) + (bannerBust ? `?t=${bannerBust}` : '')} alt="Banner" style={{ maxWidth: '100%', height: 'auto', borderRadius: 6 }} />
                    </div>
                    <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                      <button type="button" className="btn secondary" onClick={removeBanner} disabled={removingBanner}>{removingBanner ? 'Removing…' : 'Remove banner'}</button>
                    </div>
                  </div>
                )}
                <div className="upload-row">
                  <label className="upload">
                    <FiUpload />
                    <span>{modalBannerFile ? modalBannerFile.name : 'Change banner (optional)'}</span>
                    <input type="file" accept="image/*" onChange={(e) => {
                      const f = e.target.files?.[0];
                      setModalBannerFile(f || null);
                      setModalBannerPreview(f ? URL.createObjectURL(f) : '');
                    }} />
                  </label>
                </div>
                <div className="field">
                  <div className="section-header" style={{ padding: 0, marginBottom: 8 }}>
                    <label style={{ margin: 0 }}><FiMapPin /> Locations</label>
                    <button type="button" className="btn ghost" onClick={() => setModalDraft(m => ({ ...m, locations: [...(m.locations||[]), { name: '', address: '' }] }))}><FiPlus /> Add</button>
                  </div>
                  {(modalDraft.locations && modalDraft.locations.length > 0) ? (
                    <div className="locations-grid">
                      <div className="location-headers">
                        <span>Location Name</span>
                        <span>Address</span>
                        <span></span>
                      </div>
                      {modalDraft.locations.map((l, idx) => (
                        <div key={idx} className="location-card">
                          <div className="location-row">
                            <input
                              placeholder="e.g. Main Auditorium"
                              value={l.name || ''}
                              onChange={e => setModalDraft(m => ({
                                ...m,
                                locations: m.locations.map((x,i) => i===idx ? { ...x, name: e.target.value } : x)
                              }))}
                            />
                            <input
                              placeholder="e.g. Building A, Floor 2"
                              value={l.address || ''}
                              onChange={e => setModalDraft(m => ({
                                ...m,
                                locations: m.locations.map((x,i) => i===idx ? { ...x, address: e.target.value } : x)
                              }))}
                            />
                            {modalDraft.locations.length > 1 && (
                              <button
                                type="button"
                                className="remove-btn accent"
                                aria-label="Remove location"
                                onClick={() => setModalDraft(m => ({ ...m, locations: m.locations.filter((_,i) => i!==idx) }))}
                                title="Remove"
                              >
                                <FiX />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="help">No locations. Add one above.</div>
                  )}
                </div>

                <div className="field">
                  <div className="section-header" style={{ padding: 0, marginBottom: 8 }}>
                    <label style={{ margin: 0 }}><FiClock /> Sessions</label>
                    <button type="button" className="btn ghost" onClick={() => setModalDraft(m => ({ ...m, sessions: [...(m.sessions||[]), { title: '', start: '', end: '', desc: '' }] }))}><FiPlus /> Add</button>
                  </div>
                  {(modalDraft.sessions && modalDraft.sessions.length > 0) ? (
                    <div className="sessions-grid">
                      <div className="session-headers">
                        <span>Title</span>
                        <span>Start</span>
                        <span>End</span>
                        <span>Description</span>
                        <span></span>
                      </div>
                      {modalDraft.sessions.map((s, idx) => (
                        <div key={idx} className="session-card">
                          <div className="session-row">
                            <input placeholder="Session title" value={s.title || ''} onChange={e => setModalDraft(m => ({
                              ...m,
                              sessions: m.sessions.map((x,i) => i===idx ? { ...x, title: e.target.value } : x)
                            }))} />
                            <input type="time" value={s.start || ''} onChange={e => setModalDraft(m => ({
                              ...m,
                              sessions: m.sessions.map((x,i) => i===idx ? { ...x, start: e.target.value } : x)
                            }))} placeholder="Start" />
                            <input type="time" value={s.end || ''} onChange={e => setModalDraft(m => ({
                              ...m,
                              sessions: m.sessions.map((x,i) => i===idx ? { ...x, end: e.target.value } : x)
                            }))} placeholder="End" />
                            <textarea rows={3} placeholder="Description" value={s.desc || ''} onChange={e => setModalDraft(m => ({
                              ...m,
                              sessions: m.sessions.map((x,i) => i===idx ? { ...x, desc: e.target.value } : x)
                            }))} />
                            <button type="button" className="remove-btn accent" aria-label="Remove session" onClick={() => setModalDraft(m => ({ ...m, sessions: m.sessions.filter((_,i)=>i!==idx) }))} title="Remove"><FiX /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="help">No sessions. Add one above.</div>
                  )}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="btn secondary" onClick={() => deleteDraft(modalDraft?.draft_id)}>Delete Draft</button>
              <button className="btn" onClick={() => setShowDraftModal(false)}>Close</button>
              <button className="btn primary" disabled={modalSaving} onClick={saveDraft}>{modalSaving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
