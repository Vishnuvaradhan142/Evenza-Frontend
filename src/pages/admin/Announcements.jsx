import React, { useMemo, useState } from 'react';
import { FiPlus, FiSearch, FiFilter, FiX, FiCalendar, FiSend, FiFileText } from 'react-icons/fi';
import './Announcements.css';

export default function Announcements() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [audience, setAudience] = useState('all');
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [createError, setCreateError] = useState('');
  const [detailError, setDetailError] = useState('');
  const [createStatus, setCreateStatus] = useState('Draft');
  const [editStatus, setEditStatus] = useState('Draft');

  const [items, setItems] = useState(() => [
    { id: 'a1', date: '2025-10-01', time: '09:00', audience: 'All Users', event: 'Orientation Week', title: 'Welcome Week!', status: 'Scheduled', message: 'Kick-off events all week.' },
    { id: 'a2', date: '2025-10-03', time: '', audience: 'Organizers', event: 'Tech Expo', title: 'Booth Guidelines', status: 'Draft', message: 'Review the updated booth rules.' },
    { id: 'a3', date: '2025-09-20', time: '14:00', audience: 'Attendees', event: 'App Launch', title: 'App Update', status: 'Sent', message: 'New app version with bug fixes.' },
    { id: 'a4', date: '2025-10-10', time: '10:30', audience: 'Volunteers', event: 'Volunteer Drive', title: 'Shift Sign-ups', status: 'Scheduled', message: 'Choose your preferred time slots.' },
    { id: 'a5', date: '2025-09-28', time: '12:00', audience: 'All Users', event: 'Safety Workshop', title: 'Safety Notice', status: 'Sent', message: 'Please follow campus safety guidelines.' },
  ]);

  const eventNames = useMemo(() => {
    const set = new Set(items.map(i => i.event).filter(Boolean));
    return Array.from(set);
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(i => {
      const matchQ = !q || i.title.toLowerCase().includes(q) || i.message.toLowerCase().includes(q);
      const matchS = status === 'all' || i.status.toLowerCase() === status;
      const matchA = audience === 'all' || i.event === audience;
      return matchQ && matchS && matchA;
    });
  }, [items, query, status, audience]);

  const stats = useMemo(() => {
    return {
      scheduled: items.filter(i => i.status === 'Scheduled').length,
      sent30: items.filter(i => i.status === 'Sent').length,
      events: items.length,
    };
  }, [items]);

  function openDetails(item) {
    setSelected(item);
    setEditStatus(item.status);
    setDetailError('');
  }

  function closeDetails() {
    setSelected(null);
  }

  function openDrawer() {
    setCreateStatus('Draft');
    setCreateError('');
    setDrawerOpen(true);
  }

  function handleUpdate(e) {
    e.preventDefault();
    if (!selected) return;
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());
    setDetailError('');
    const updated = {
      ...selected,
      title: (data.title ?? selected.title).trim(),
      date: data.date || selected.date,
      time: (data.time ?? selected.time ?? '').toString(),
      event: data.event || selected.event,
      status: editStatus || selected.status,
      message: (data.message ?? selected.message).trim(),
    };
    if (updated.status === 'Scheduled') {
      const dateStr = (updated.date || '').trim();
      const timeStr = (updated.time || '').trim();
      if (!dateStr || !timeStr) {
        setDetailError('Please provide both date and time for a scheduled announcement.');
        return;
      }
      const scheduledAt = new Date(`${dateStr}T${timeStr}:00`);
      const now = new Date();
      if (isNaN(scheduledAt.getTime()) || scheduledAt <= now) {
        setDetailError('Scheduled date and time must be in the future.');
        return;
      }
    }
    setItems(prev => prev.map(it => (it.id === selected.id ? updated : it)));
    setSelected(updated);
    // Keep modal open after save to confirm; alternatively close: closeDetails();
  }

  function handleCreate(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());
    setCreateError('');
    const statusSel = createStatus || data.status || 'Draft';
    if (statusSel === 'Scheduled') {
      const dateStr = (data.date || '').trim();
      const timeStr = (data.time || '').trim();
      if (!dateStr || !timeStr) {
        setCreateError('Please provide both date and time for a scheduled announcement.');
        return;
      }
      const scheduledAt = new Date(`${dateStr}T${timeStr}:00`);
      const now = new Date();
      if (isNaN(scheduledAt.getTime()) || scheduledAt <= now) {
        setCreateError('Scheduled date and time must be in the future.');
        return;
      }
    }
    const newItem = {
      id: `a${Math.random().toString(36).slice(2, 8)}`,
      date: data.date || new Date().toISOString().split('T')[0],
      time: (data.time || '').trim(),
      audience: data.audience || 'All Users',
      event: data.event || undefined,
      title: data.title?.trim() || 'Untitled Announcement',
      status: statusSel,
      message: data.message?.trim() || '',
    };
    setItems(prev => [newItem, ...prev]);
    setDrawerOpen(false);
  }

  return (
    <div className="ann-page admin-announcements">
      <div className="ann-header">
        <div className="ann-titles">
          <h1 className="page-title"><FiFileText /> Announcements</h1>
          <p className="subtitle">Compose, schedule, and review announcements for different events.</p>
        </div>
        <button className="btn-primary" onClick={openDrawer}>
          <FiPlus /> New Announcement
        </button>
      </div>

      <div className="ann-actions">
        <div className="search">
          <FiSearch />
          <input
            type="text"
            placeholder="Search title or message..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <div className="filters">
          <div className="filter-chip">
            <FiFilter />
            <select value={status} onChange={e => setStatus(e.target.value)} aria-label="Status">
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
            </select>
          </div>
          <div className="filter-chip">
            <FiCalendar />
            <select value={audience} onChange={e => setAudience(e.target.value)} aria-label="Events">
              <option value="all">All Events</option>
              {eventNames.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <button className="btn-add" onClick={openDrawer}>
            <FiPlus /> Add Announcement
          </button>
        </div>
      </div>

      <div className="ann-stats">
        <div className="card">
          <div className="icon blue"><FiCalendar /></div>
          <div className="meta">
            <span className="label">Scheduled</span>
            <span className="value">{stats.scheduled}</span>
          </div>
        </div>
        <div className="card">
          <div className="icon green"><FiSend /></div>
          <div className="meta">
            <span className="label">Sent (30d)</span>
            <span className="value">{stats.sent30}</span>
          </div>
        </div>
        <div className="card">
          <div className="icon purple"><FiFileText /></div>
          <div className="meta">
            <span className="label">Events</span>
            <span className="value">{stats.events}</span>
          </div>
        </div>
      </div>

      <div className="ann-table-container">
        <table className="ann-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Events</th>
              <th>Title</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="no-rows">No announcements found</td>
              </tr>
            ) : (
              filtered.map(row => (
                <tr key={row.id} className="row-clickable" onClick={() => openDetails(row)}>
                  <td>{row.date}</td>
                  <td>{row.event || '-'}</td>
                  <td className="title-cell">
                    <div className="title">{row.title}</div>
                    <div className="message">{row.message}</div>
                  </td>
                  <td>
                    <span className={`badge ${row.status.toLowerCase()}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Drawer */}
      {isDrawerOpen && (
        <div className="drawer" role="dialog" aria-modal="true">
          <div className="drawer__backdrop" onClick={() => setDrawerOpen(false)} />
          <div className="drawer__panel">
            <div className="drawer__header">
              <h3><FiPlus /> New Announcement</h3>
              <button className="icon-btn" onClick={() => setDrawerOpen(false)} aria-label="Close">
                <FiX />
              </button>
            </div>
            <form onSubmit={handleCreate} className="drawer__body">
              <label>
                <span>Title</span>
                <input name="title" type="text" placeholder="Title" required />
              </label>
              <label>
                <span>Date</span>
                <input name="date" type="date" />
              </label>
              {createStatus === 'Scheduled' && (
                <label>
                  <span>Time</span>
                  <input name="time" type="time" />
                </label>
              )}
              <label>
                <span>Events</span>
                <select name="event" defaultValue={eventNames[0] || 'General'}>
                  {eventNames.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </label>
              <label>
                <span>Status</span>
                <select name="status" value={createStatus} onChange={e => setCreateStatus(e.target.value)}>
                  <option>Draft</option>
                  <option>Scheduled</option>
                  <option>Sent</option>
                </select>
              </label>
              <label>
                <span>Message</span>
                <textarea name="message" rows={5} placeholder="Write your message..." />
              </label>
              {createError && <div className="form-error" role="alert">{createError}</div>}
              <div className="drawer__footer">
                <button type="button" className="btn-ghost" onClick={() => setDrawerOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary"><FiPlus /> Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selected && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal__backdrop" onClick={closeDetails} />
          <div className="modal__panel" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h3><FiFileText /> Announcement Details</h3>
              <button className="icon-btn" onClick={closeDetails} aria-label="Close">
                <FiX />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="modal__body">
              <label>
                <span>Title</span>
                <input name="title" type="text" defaultValue={selected.title} disabled={selected.status !== 'Draft'} />
              </label>
              <label>
                <span>Date</span>
                <input name="date" type="date" defaultValue={selected.date} disabled={!(selected.status === 'Draft' || selected.status === 'Scheduled')} />
              </label>
              {editStatus === 'Scheduled' && (
                <label>
                  <span>Time</span>
                  <input name="time" type="time" defaultValue={selected.time || ''} disabled={!(selected.status === 'Draft' || selected.status === 'Scheduled')} />
                </label>
              )}
              <label>
                <span>Events</span>
                <select name="event" defaultValue={selected.event || ''} disabled={selected.status !== 'Draft'}>
                  {[selected.event, ...new Set(eventNames)].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).map(ev => (
                    <option key={ev} value={ev}>{ev}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Status</span>
                <select name="status" value={editStatus} onChange={e => setEditStatus(e.target.value)} disabled={selected.status !== 'Draft'}>
                  <option>Draft</option>
                  <option>Scheduled</option>
                  <option>Sent</option>
                </select>
              </label>
              <label>
                <span>Message</span>
                <textarea name="message" rows={5} defaultValue={selected.message} disabled={selected.status !== 'Draft'} />
              </label>
              {detailError && <div className="form-error" role="alert">{detailError}</div>}
              <div className="modal__footer">
                <button type="button" className="btn-ghost" onClick={closeDetails}>Close</button>
                {selected.status === 'Draft' && (
                  <button type="submit" className="btn-primary"><FiPlus /> Save Changes</button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
