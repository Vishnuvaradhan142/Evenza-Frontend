import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiEye, FiSend, FiX } from "react-icons/fi";
import API from "../../api";
import "./AdminEventsList.css";

const CATEGORIES = [
  { id: 1, name: 'Technology' },
  { id: 2, name: 'Cultural Programs' },
  { id: 3, name: 'Sports' },
  { id: 4, name: 'Workshops' },
  { id: 5, name: 'Music & Concerts' },
  { id: 6, name: 'Networking' },
];

export default function MyAdminEvents() {
  const [query, setQuery] = useState("");
  const [view, setView] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [drafts, setDrafts] = useState([]);
  const serverBase = useMemo(() => (API.defaults?.baseURL || '').replace(/\/api\/?$/, ''), []);
  const urlFor = (p) => {
    if (!p) return '';
    if (/^https?:\/\//i.test(p)) return p;
    return `${serverBase}${p}`;
  };

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        setError("");
        // Fetch up to 50 drafts for current admin (all statuses)
        const res = await API.get('/drafts/mine', { params: { limit: 50 } });
        if (!ignore) setDrafts(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        if (!ignore) setError(e?.response?.data?.message || e.message || 'Failed to load drafts');
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, []);

  const rows = useMemo(() => {
    const mapCategory = (cid) => CATEGORIES.find(c => String(c.id) === String(cid))?.name || '—';
    return (drafts || []).map(d => ({
      id: String(d.draft_id),
      name: d.title || 'Untitled draft',
      category: mapCategory(d.category_id),
      date: d.start_time || d.submitted_at || null,
      status: d.status || 'draft',
      createdBy: 'Me',
      raw: d,
    }));
  }, [drafts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = rows.filter((e) =>
      [e.name, e.category, e.createdBy, e.id, e.status].some((f) => String(f).toLowerCase().includes(q))
    );
    // Newest first: prefer submitted_at, then start_time
    out.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    return out;
  }, [rows, query]);

  return (
    <div className="admin-events-table-page">
      <header className="aelp-header">
        <h1 className="aelp-title">My Events</h1>
        <p className="aelp-desc">Your drafts and submissions from the draft events pipeline.</p>
      </header>

      <div className="aelp-toolbar">
        <div className="aelp-search">
          <FiSearch />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, category, status, or ID"
          />
        </div>
        <div className="aelp-actions">
          <Link to="/admin/event/event-submission" className="btn primary">
            <FiSend /> Go to Event Submission
          </Link>
        </div>
      </div>

      {loading && <div className="help" style={{ marginTop: 8 }}>Loading…</div>}
      {error && <div className="alert error" style={{ marginTop: 8 }}>{error}</div>}

      {/* Full-width responsive grid replacing the table */}
      {(!loading && !error && filtered.length === 0) ? (
        <div className="empty">No drafts found</div>
      ) : (
        <div className="aelp-grid">
          {filtered.map((e) => (
            <div className="aelp-card" key={e.id}>
              <div className="aelp-card__head">
                <span className={`pill status ${e.status.toLowerCase()}`}>{e.status}</span>
              </div>
              <div className="aelp-card__body">
                <h3 className="aelp-card__title">{e.name}</h3>
                <div className="aelp-card__meta">
                  <span className="meta"><strong>Category:</strong> {e.category}</span>
                  <span className="meta"><strong>Date:</strong> {e.date ? new Date(e.date).toLocaleString() : '—'}</span>
                  <span className="meta"><strong>Owner:</strong> {e.createdBy}</span>
                </div>
              </div>
              <div className="aelp-card__actions">
                <button className="btn full" title="View details" onClick={() => setView(e)}><FiEye /> View</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {view && (
        <div className="events-modal" onClick={() => setView(null)}>
          <div
            className="modal-card"
            style={{ maxHeight: '85vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>{view.name}</h3>
              <button className="modal-close" onClick={() => setView(null)} aria-label="Close"><FiX /></button>
            </div>
            <div className="modal-body">
              {/* Basic Info */}
              <div className="modal-row"><span className="muted">Draft ID</span><span>{view.id}</span></div>
              <div className="modal-row"><span className="muted">Category</span><span>{view.category}</span></div>
              <div className="modal-row"><span className="muted">Status</span><span className={`pill status ${view.status.toLowerCase()}`}>{view.status}</span></div>
              <div className="modal-row"><span className="muted">Requires Approval</span><span>{String(view.raw?.requires_approval) === '1' || view.raw?.requires_approval === 1 || view.raw?.requires_approval === true ? 'Yes' : 'No'}</span></div>
              <div className="modal-row"><span className="muted">Submitted At</span><span>{view.raw?.submitted_at ? new Date(view.raw.submitted_at).toLocaleString() : '—'}</span></div>
              <div className="modal-row"><span className="muted">Created By</span><span>{view.createdBy}</span></div>

              {/* Schedule */}
              <div className="modal-row"><span className="muted">Start Time</span><span>{view.raw?.start_time ? new Date(view.raw.start_time).toLocaleString() : '—'}</span></div>
              <div className="modal-row"><span className="muted">End Time</span><span>{view.raw?.end_time ? new Date(view.raw.end_time).toLocaleString() : '—'}</span></div>

              {/* Capacity */}
              <div className="modal-row"><span className="muted">Capacity</span><span>{view.raw?.capacity ?? '—'}</span></div>

              {/* Description */}
              {view.raw?.description && (
                <div className="modal-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span className="muted">Description</span>
                  <p style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{view.raw.description}</p>
                </div>
              )}

              {/* Locations */}
              {(() => {
                try {
                  const v = view.raw?.locations;
                  const arr = !v ? [] : (typeof v === 'string' ? JSON.parse(v) : (Array.isArray(v) ? v : []));
                  return Array.isArray(arr) && arr.length > 0 ? (
                    <div className="modal-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                      <span className="muted">Locations</span>
                      <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                        {arr.map((l, idx) => (
                          <li key={idx}>{[l?.name, l?.address].filter(Boolean).join(' — ') || '—'}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null;
                } catch { return null; }
              })()}

              {/* Sessions */}
              {(() => {
                try {
                  const v = view.raw?.sessions;
                  const arr = !v ? [] : (typeof v === 'string' ? JSON.parse(v) : (Array.isArray(v) ? v : []));
                  return Array.isArray(arr) && arr.length > 0 ? (
                    <div className="modal-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                      <span className="muted">Sessions</span>
                      <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                        {arr.map((s, idx) => (
                          <li key={idx}>
                            <strong>{s?.title || 'Session'}</strong>
                            {` — ${s?.start || ''}${s?.end ? ' to ' + s.end : ''}`}
                            {s?.desc ? ` — ${s.desc}` : ''}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null;
                } catch { return null; }
              })()}

              {/* Attachments */}
              {Array.isArray(view.raw?.attachments) && view.raw.attachments.length > 0 && (
                <div className="modal-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span className="muted">Attachments</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8, width: '100%' }}>
                    {view.raw.attachments.map((a, idx) => (
                      <img key={idx} alt={`attachment-${idx}`} src={urlFor(a)} style={{ width: '100%', height: 'auto', borderRadius: 8, objectFit: 'cover' }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-actions">
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
