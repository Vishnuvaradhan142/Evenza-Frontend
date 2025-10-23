import React, { useMemo, useState } from 'react';
import './Registrations.css';
import { 
  FiSearch, FiFilter, FiDownload, FiCheckCircle, FiXCircle, FiMail, FiClock, FiTrash2, FiRefreshCw, FiUsers
} from 'react-icons/fi';

const STATUSES = ['confirmed', 'pending', 'cancelled', 'waitlisted'];

function makeMockData() {
  const events = [
    { id: 101, title: 'AI Workshop' },
    { id: 102, title: 'TechFest Hackathon' },
    { id: 103, title: 'Startup Pitch Day' },
    { id: 104, title: 'Design Sprint' },
    { id: 105, title: 'Sports Meet' },
  ];
  const names = ['Pranav', 'Sneha', 'Aarav', 'Ishita', 'Rohan', 'Meera', 'Vikram', 'Nisha', 'Kabir', 'Diya'];
  const tickets = ['General', 'VIP', 'Student', 'Early Bird'];
  const sources = ['website', 'mobile', 'referral', 'qr'];
  const rand = (n) => Math.floor(Math.random() * n);
  const randFrom = (arr) => arr[rand(arr.length)];
  const randomDateWithin30 = () => {
    const now = Date.now();
    const days = rand(30);
    const past = now - days * 24 * 3600 * 1000;
    return new Date(past).toISOString();
  };
  const list = [];
  for (let i = 0; i < 48; i++) {
    const ev = randFrom(events);
    const qty = 1 + rand(3);
    const price = [0, 199, 299, 499, 999][rand(5)];
    const status = randFrom(STATUSES);
    list.push({
      id: 1000 + i,
      userName: randFrom(names) + ' ' + ['K','S','R','M'][rand(4)] + '.',
      userEmail: `user${i}@mail.com`,
      eventId: ev.id,
      eventTitle: ev.title,
      ticketType: randFrom(tickets),
      qty,
      price,
      total: qty * price,
      status,
      registeredAt: randomDateWithin30(),
      checkIn: Math.random() > 0.7,
      notes: '',
      source: randFrom(sources),
    });
  }
  return list;
}

export default function Registrations() {
  const [rows, setRows] = useState(() => makeMockData());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState([]); // multi-select
  const [sortBy, setSortBy] = useState('registeredAt');
  const [sortDir, setSortDir] = useState('desc');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());
  const [selectedEventId, setSelectedEventId] = useState('all');

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

  const applyStatusToSelected = (newStatus) => {
    if (selected.size === 0) return;
    setRows(prev => prev.map(r => selected.has(r.id) ? { ...r, status: newStatus } : r));
    setSelected(new Set());
  };
  const deleteSelected = () => {
    if (selected.size === 0) return;
    setRows(prev => prev.filter(r => !selected.has(r.id)));
    setSelected(new Set());
  };

  const quickAction = (id, action) => {
    setRows(prev => prev.map(r => {
      if (r.id !== id) return r;
      if (action === 'confirm') return { ...r, status: 'confirmed' };
      if (action === 'cancel') return { ...r, status: 'cancelled' };
      if (action === 'waitlist') return { ...r, status: 'waitlisted' };
      return r;
    }));
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
