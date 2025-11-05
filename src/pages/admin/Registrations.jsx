import React, { useMemo, useState, useEffect, useContext } from 'react';
import './Registrations.css';
import { 
  FiSearch, FiFilter, FiDownload, FiCheckCircle, FiXCircle, FiMail, FiClock, FiTrash2, FiRefreshCw, FiUsers
} from 'react-icons/fi';
import API from '../../api';
import { NotificationContext } from '../../context/NotificationContext';

const STATUSES = ['confirmed', 'pending', 'cancelled', 'waitlisted'];

// We'll fetch real data from backend; keep a small client-side mapper

function mapServerRowsToUI(eventsResponse) {
  // eventsResponse: { events: [ { event: {event_id, title}, registrations: [ ... ] } ] }
  const rows = [];
  for (const group of eventsResponse.events || []) {
    for (const r of group.registrations || []) {
      const id = r.registration_id;
      const userName = r.registrant_display_name || r.registrant_username || `User ${r.registrant_id || ''}`;
      const userEmail = r.registrant_email || '';
      const eventId = group.event.event_id;
      const eventTitle = group.event.title;
      const ticketType = r.ticket_type || 'General';
      const price = r.amount != null ? Number(r.amount) : 0;
      const qty = r.qty != null ? Number(r.qty) : 1;
      const total = qty * price;
      const status = (r.status || '').toLowerCase();
      const registeredAt = r.registered_at || r.registeredAt || new Date().toISOString();

      rows.push({
        id,
        userName,
        userEmail,
        eventId,
        eventTitle,
        ticketType,
        qty,
        price,
        total,
        status,
        registeredAt,
        raw: r,
      });
    }
  }
  return rows;
}

export default function Registrations() {
  const { addNotification } = useContext(NotificationContext) || { addNotification: () => {} };
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState([]); // multi-select
  const [sortBy, setSortBy] = useState('registeredAt');
  const [sortDir, setSortDir] = useState('desc');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());
  const [selectedEventId, setSelectedEventId] = useState('all');

  // Fetch registrations owned by the logged-in user
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const resp = await API.get('/registrations/mine');
        if (!mounted) return;
        const uiRows = mapServerRowsToUI(resp.data);
        setRows(uiRows);
      } catch (err) {
        console.error('Failed to load registrations:', err);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const stats = useMemo(() => {
    const total = rows.length;
    const by = Object.fromEntries(STATUSES.map(s => [s, rows.filter(r => r.status === s).length]));
    const revenue = rows.filter(r => r.status === 'confirmed').reduce((acc, r) => acc + r.total, 0);
    return { total, ...by, revenue };
  }, [rows]);

  const events = useMemo(() => {
    const map = new Map();
    for (const r of rows) {
      if (!map.has(r.eventId)) {
        map.set(r.eventId, { id: r.eventId, title: r.eventTitle, total: 0, confirmed: 0, pending: 0, cancelled: 0, waitlisted: 0 });
      }
      const e = map.get(r.eventId);
      e.total += 1;
      e[r.status] += 1;
    }
    return Array.from(map.values()).sort((a,b)=> a.title.localeCompare(b.title));
  }, [rows]);

  const filtered = useMemo(() => {
    let out = rows;
    if (selectedEventId !== 'all') {
      out = out.filter(r => r.eventId === selectedEventId);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      out = out.filter(r =>
        r.userName.toLowerCase().includes(q) ||
        r.userEmail.toLowerCase().includes(q) ||
        r.eventTitle.toLowerCase().includes(q)
      );
    }
    if (statusFilter.length) {
      out = out.filter(r => statusFilter.includes(r.status));
    }
    out = [...out].sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortBy === 'registeredAt') {
        return (new Date(a.registeredAt) - new Date(b.registeredAt)) * dir;
      }
      if (sortBy === 'userName') return a.userName.localeCompare(b.userName) * dir;
      if (sortBy === 'userEmail') return a.userEmail.localeCompare(b.userEmail) * dir;
      if (sortBy === 'eventTitle') return a.eventTitle.localeCompare(b.eventTitle) * dir;
      if (sortBy === 'status') return a.status.localeCompare(b.status) * dir;
      if (sortBy === 'total') return (a.total - b.total) * dir;
      return 0;
    });
    return out;
  }, [rows, search, statusFilter, sortBy, sortDir, selectedEventId]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleStatus = (s) => {
    setPage(1);
    setStatusFilter(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const toggleAll = (checked) => {
    if (checked) setSelected(new Set(pageData.map(r => r.id)));
    else setSelected(new Set());
  };
  const toggleOne = (id) => setSelected(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const applyStatusToSelected = async (newStatus) => {
    if (selected.size === 0) return;
    const ids = Array.from(selected);
    // optimistic update
    const prevRows = rows;
    setRows(prev => prev.map(r => ids.includes(r.id) ? { ...r, status: newStatus } : r));
    try {
      await API.patch('/registrations/status/bulk', { ids, status: newStatus });
      addNotification && addNotification({ type: 'success', text: `Updated ${ids.length} registrations to ${newStatus}` });
    } catch (err) {
      console.error('Bulk status update failed:', err);
      // rollback on failure
      setRows(prevRows);
      addNotification && addNotification({ type: 'error', text: `Failed to update ${ids.length} registrations` });
    } finally {
      setSelected(new Set());
    }
  };
  const deleteSelected = () => {
    if (selected.size === 0) return;
    setRows(prev => prev.filter(r => !selected.has(r.id)));
    setSelected(new Set());
  };

  const quickAction = async (id, action) => {
    const mapAction = {
      confirm: 'confirmed',
      cancel: 'cancelled',
      waitlist: 'waitlisted',
    };
    const newStatus = mapAction[action];
    if (!newStatus) return;
    const prevRows = rows;
    // optimistic update
    setRows(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    try {
      await API.patch(`/registrations/status/${id}`, { status: newStatus });
      addNotification && addNotification({ type: 'success', text: `Status set to ${newStatus}` });
    } catch (err) {
      console.error('Status update failed:', err);
      // rollback
      setRows(prevRows);
      addNotification && addNotification({ type: 'error', text: `Failed to set status: ${newStatus}` });
    }
  };

  const exportCSV = () => {
    const headers = ['ID','Username','Email','Event','Ticket','Price','Total','Status','RegisteredAt'];
    const lines = [headers.join(',')];
    filtered.forEach(r => {
      const row = [r.id, r.userName, r.userEmail, r.eventTitle, r.ticketType, r.price, r.total, r.status, r.registeredAt]
        .map(val => typeof val === 'string' && val.includes(',') ? `"${val.replace(/"/g,'""')}"` : val);
      lines.push(row.join(','));
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registrations_export.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const Th = ({ label, sortKey }) => (
    <th
      onClick={() => {
        if (sortBy === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortBy(sortKey); setSortDir('asc'); }
      }}
      className={sortBy === sortKey ? `sorted ${sortDir}` : ''}
    >
      {label}
    </th>
  );

  const currentEvent = selectedEventId === 'all' ? null : events.find(e => e.id === selectedEventId) || null;

  return (
    <div className="registrations-page">
      <div className="registrations-wrapper">
        <aside className="reg-sidebar">
          <div className="sidebar-header">
            <h2>Events</h2>
          </div>
          <ul className="events-list">
            <li className={`event-item ${selectedEventId==='all' ? 'active': ''}`} onClick={() => { setSelectedEventId('all'); setPage(1); }}>
              <div className="event-row">
                <div className="event-name">All events</div>
                <div className="event-count">{stats.total}</div>
              </div>
            </li>
            {events.map(ev => (
              <li key={ev.id} className={`event-item ${selectedEventId===ev.id ? 'active': ''}`} onClick={() => { setSelectedEventId(ev.id); setPage(1); }}>
                <div className="event-row">
                  <div className="event-name">{ev.title}</div>
                  <div className="event-badges">
                    <span className="mini-pill green" title="Confirmed">{ev.confirmed}</span>
                    <span className="mini-pill amber" title="Pending">{ev.pending}</span>
                    <span className="mini-pill red" title="Cancelled">{ev.cancelled}</span>
                  </div>
                </div>
              </li>
            ))}
            {events.length === 0 && (
              <li className="no-events">No events yet</li>
            )}
          </ul>
        </aside>

        <main className="reg-main">
          <div className="page-header">
            <h1 className="page-title"><FiUsers className="title-icon" /> Registration Tracking</h1>
            <p>Per-event view like chatrooms: pick an event on the left and manage its registrations.</p>
            <div className="chips">
              <span className="chip">Total: {stats.total}</span>
              <span className="chip green"><FiCheckCircle /> Confirmed: {stats.confirmed}</span>
              <span className="chip amber"><FiClock /> Pending: {stats.pending}</span>
              <span className="chip red"><FiXCircle /> Cancelled: {stats.cancelled}</span>
              <span className="chip purple">Waitlisted: {stats.waitlisted}</span>
              <span className="chip"><FiDownload /> Rev: ₹{stats.revenue}</span>
            </div>
          </div>

          <header className="reg-main-header">
            <div>
              <h3>{currentEvent ? currentEvent.title : 'All events'}</h3>
              {currentEvent && (
                <div className="muted">{currentEvent.total} registrations • {currentEvent.confirmed} confirmed</div>
              )}
            </div>
          </header>

          <div className="toolbar">
            <div className="search">
              <FiSearch />
              <input
                placeholder={currentEvent ? `Search within ${currentEvent.title}...` : 'Search name, email, or event...'}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <div className="filters">
              <button className={`chip ${statusFilter.length===0 ? 'active' : ''}`} onClick={() => setStatusFilter([])}><FiFilter /> All</button>
              {STATUSES.map(s => (
                <button key={s} className={`chip pill ${statusFilter.includes(s) ? 'active' : ''}`} onClick={() => toggleStatus(s)}>
                  {s}
                </button>
              ))}
            </div>
            <div className="spacer" />
            <div className="actions">
              <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>
                {[10,20,50].map(n => <option key={n} value={n}>{n}/page</option>)}
              </select>
              <button className="btn ghost" onClick={exportCSV}><FiDownload /> Export CSV</button>
            </div>
          </div>

          <div className="bulk-bar">
            <div>
              <input type="checkbox" checked={selected.size===pageData.length && pageData.length>0}
                    onChange={e => toggleAll(e.target.checked)} />
              <span className="help">Select page</span>
            </div>
            <div className="bulk-actions">
              <button className="btn small" onClick={() => applyStatusToSelected('confirmed')}><FiCheckCircle /> Confirm</button>
              <button className="btn small" onClick={() => applyStatusToSelected('cancelled')}><FiXCircle /> Cancel</button>
              <button className="btn small" onClick={() => applyStatusToSelected('waitlisted')}><FiClock /> Waitlist</button>
              <button className="btn small danger" onClick={deleteSelected}><FiTrash2 /> Delete</button>
            </div>
          </div>

          <div className="table-wrap">
            <table className="reg-table">
              <thead>
                <tr>
                  <th style={{width: 36}}></th>
                  <Th label="Name" sortKey="userName" />
                  <Th label="Email" sortKey="userEmail" />
                  {!currentEvent && <Th label="Event" sortKey="eventTitle" />}
                  <th>Ticket</th>
                  <Th label="Total" sortKey="total" />
                  <Th label="Status" sortKey="status" />
                  <Th label="Registered" sortKey="registeredAt" />
                  <th style={{width: 180}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageData.length === 0 ? (
                  <tr>
                    <td colSpan={9}>
                      <div className="empty">No registrations match your filters.</div>
                    </td>
                  </tr>
                ) : (
                  pageData.map(r => (
                    <tr key={r.id}>
                      <td>
                        <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleOne(r.id)} />
                      </td>
                      <td>{r.userName}</td>
                      <td className="muted">{r.userEmail}</td>
                      {!currentEvent && <td>{r.eventTitle}</td>}
                      <td>{r.ticketType}</td>
                      <td>₹{r.total}</td>
                      <td>
                        <span className={`pill status ${r.status}`}>{r.status}</span>
                      </td>
                      <td>{new Date(r.registeredAt).toLocaleString()}</td>
                      <td>
                        <div className="row-actions">
                          <button className="icon-btn" title="Confirm" onClick={() => quickAction(r.id,'confirm')}><FiCheckCircle /></button>
                          <button className="icon-btn" title="Cancel" onClick={() => quickAction(r.id,'cancel')}><FiXCircle /></button>
                          <button className="icon-btn" title="Move to waitlist" onClick={() => quickAction(r.id,'waitlist')}><FiClock /></button>
                          <button className="icon-btn" title="Message (no-op)"><FiMail /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="pager">
            <button className="btn small" disabled={page===1} onClick={() => setPage(p => Math.max(1, p-1))}><FiRefreshCw style={{transform:'rotate(90deg)'}} /> Prev</button>
            <span>Page {page} of {totalPages}</span>
            <button className="btn small" disabled={page===totalPages} onClick={() => setPage(p => Math.min(totalPages, p+1))}>Next <FiRefreshCw style={{transform:'rotate(-90deg)'}} /></button>
          </div>
        </main>
      </div>
    </div>
  );
}
