import React, { useEffect, useMemo, useState, useCallback } from "react";
import API from "../../api";
import {
  FiCalendar,
  FiClock,
  FiUsers,
  FiFileText,
  FiSend,
  FiEye,
  FiCheck,
  FiAlertCircle,
  FiX,
  FiTrash2,
  FiEdit2,
} from "react-icons/fi";
import "./EventSubmission.css";

export default function EventSubmission() {
  // drafted events come from backend drafts table (status = draft)
  const [draftedEvents, setDraftedEvents] = useState([]);

  const serverBase = useMemo(() => (API.defaults?.baseURL || '').replace(/\/api\/?$/, ''), []);
  const urlFor = useCallback((p) => {
    if (!p && p !== 0) return '';
    const s = String(p).trim();
    // allow data/blob urls through
    if (/^(https?:)?\/\//i.test(s) || s.startsWith('data:') || s.startsWith('blob:')) return s.startsWith('http') ? s : (s.startsWith('//') ? window.location.protocol + s : s);
    // ensure single leading slash between serverBase and path
    const path = s.startsWith('/') ? s : `/${s}`;
    return `${serverBase}${path}`;
  }, [serverBase]);

  // Helper to get banner image URL for a draft (fallbacks)
  const getBannerUrl = (d) => {
    if (!d) return '';
    // prefer raw/original fields when available
    const raw = d.raw || {};
    if (raw.banner) return urlFor(raw.banner);
    if (raw.banner_path) return urlFor(raw.banner_path);
    if (raw.bannerUrl) return (raw.bannerUrl || '').startsWith('http') ? raw.bannerUrl : urlFor(raw.bannerUrl);

    if (d.banner) return urlFor(d.banner);
    if (d.banner_path) return urlFor(d.banner_path);

    // gather potential attachments/images from multiple possible keys
    const att = d.attachments || d.images || d.attachments_list || d.media || raw.attachments || raw.images || raw.media || raw.files || [];
    if (Array.isArray(att) && att.length > 0) {
      let first = att[0];
      if (!first) return '';
      // If the entry is a JSON-encoded string like '"/uploads/.."', strip surrounding quotes and unescape
      if (typeof first === 'string') {
        let s = first.trim();
        // remove surrounding quotes
        if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
          s = s.slice(1, -1);
        }
        // unescape common sequences
        s = s.replace(/\\\//g, '/').replace(/\\u002F/g, '/');
        if (s) return urlFor(s);
      }
      // object cases
      if (first.preview) return (first.preview || '').startsWith('http') ? first.preview : urlFor(first.preview);
      if (first.url) return (first.url || '').startsWith('http') ? first.url : urlFor(first.url);
      if (first.path) return urlFor(first.path);
      // some APIs use object.file or object.download
      if (first.file) return urlFor(first.file);
      if (first.download) return urlFor(first.download);
    }
    return '';
  };

  // Only show events with status 'draft' (case-insensitive)
  const filteredEvents = draftedEvents.filter(event => String(event.status || '').toLowerCase() === 'draft');

  const [previewEvent, setPreviewEvent] = useState(null);
  const [submitStatus, setSubmitStatus] = useState(""); // "", "submitting", "success", "error"
  const [imagePreview, setImagePreview] = useState(null);
  const [docPreview, setDocPreview] = useState(null);
  const [editEvent, setEditEvent] = useState(null);
  const [bannerBust] = useState(0);

  // Handle clicking an event card
  const handleEventClick = (event) => {
    setPreviewEvent(event);
  };

  // Handle submitting a single event
  const submitSingleEvent = async (eventId) => {
    setSubmitStatus('submitting');
    try {
      await API.patch(`/drafts/${eventId}`, { status: 'submitted' });
      setDraftedEvents(prev => prev.map(d => (String(d.id) === String(eventId) ? { ...d, status: 'submitted' } : d)));
      setSubmitStatus('success');
      setTimeout(() => {
        setPreviewEvent(null);
        setSubmitStatus('');
      }, 1500);
    } catch (err) {
      console.error('Failed to submit draft:', err);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus(''), 2500);
    }
  };

  const closePreview = () => {
    setPreviewEvent(null);
    setImagePreview(null);
    setDocPreview(null);
  };

  const openImagePreview = (image) => {
    setImagePreview(image);
  };

  const closeImagePreview = () => {
    setImagePreview(null);
  };

  const openDocPreview = (doc) => {
    setDocPreview(doc);
  };

  const closeDocPreview = () => {
    setDocPreview(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // Format times: accept ISO or plain time strings, return locale hour:minute
  const formatTimeString = (t) => {
    if (!t && t !== 0) return '';
    // if already like '09:30' or '09:30:00', return the first 5 chars for short time
    if (typeof t === 'string' && /^\d{1,2}:\d{2}(:\d{2})?$/.test(t.trim())) {
      try { return t.trim().slice(0,5); } catch { return t; }
    }
    // try Date parse for ISO strings
    try {
      const d = new Date(t);
      if (!isNaN(d)) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      // fallthrough
    }
    // fallback to raw string
    return String(t);
  };

  // Delete event handler
  const handleDeleteEvent = (eventId) => {
    setDraftedEvents(prev => prev.filter(event => event.id !== eventId));
    (async () => {
      try { await API.delete(`/drafts/${eventId}`); } catch (e) { console.error('Failed to delete draft on server:', e); }
    })();
  };

  const handleEditEvent = (ev) => {
    // Prepare editEvent state and include JSON text for complex arrays (sessions, ticketTypes)
    setEditEvent({
      ...ev,
      sessionsText: JSON.stringify(ev.sessions || [], null, 2),
      ticketTypesText: JSON.stringify(ev.ticketTypes || [], null, 2),
    });
  };

  const saveEditEvent = (e) => {
    e.preventDefault();
    if (!editEvent) return;
    // Parse sessions/ticketTypes textareas back to arrays if possible
    let parsedSessions = editEvent.sessions || [];
    let parsedTickets = editEvent.ticketTypes || [];
    try {
      if (typeof editEvent.sessionsText === 'string') parsedSessions = JSON.parse(editEvent.sessionsText);
    } catch (err) {
      // keep original if parse fails
    }
    try {
      if (typeof editEvent.ticketTypesText === 'string') parsedTickets = JSON.parse(editEvent.ticketTypesText);
    } catch (err) {
      // keep original if parse fails
    }

    // Fields allowed to be edited (everything except images/banner and documents)
    const allowed = (({
      id,
      title,
      description,
      category,
      date,
      time,
      duration,
      venue,
      address,
      capacity,
      ticketPrice,
      contactEmail,
      contactPhone,
      status,
      createdFrom,
      lastModified,
      config,
    }) => ({
      id,
      title,
      description,
      category,
      date,
      time,
      duration,
      venue,
      address,
      capacity,
      ticketPrice,
      contactEmail,
      contactPhone,
      status,
      createdFrom,
      lastModified,
      config,
    }))(editEvent || {});

    const updated = {
      // base on existing event to preserve images/documents
      ...draftedEvents.find(d => d.id === editEvent.id),
      ...allowed,
      sessions: parsedSessions,
      ticketTypes: parsedTickets,
    };

    setDraftedEvents(prev => prev.map(ev => ev.id === editEvent.id ? updated : ev));
    setEditEvent(null);

    (async () => {
      try {
        const payload = {
          title: updated.title,
          description: updated.description,
          category: updated.category,
          start_time: updated.date && updated.time ? `${updated.date} ${updated.time}` : updated.date || undefined,
          duration: updated.duration,
          venue: updated.venue,
          address: updated.address,
          capacity: updated.capacity,
          ticket_price: updated.ticketPrice,
          contact_email: updated.contactEmail,
          contact_phone: updated.contactPhone,
          config: updated.config,
          sessions: JSON.stringify(updated.sessions || []),
          ticket_types: JSON.stringify(updated.ticketTypes || []),
        };
        await API.patch(`/drafts/${updated.id}`, payload);
      } catch (err) {
        console.error('Failed to save draft edits:', err);
      }
    })();
  };

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await API.get('/drafts/mine', { params: { status: 'draft', limit: 200 } });
        const list = Array.isArray(res.data) ? res.data : (res.data && Array.isArray(res.data.rows) ? res.data.rows : []);
        if (ignore) return;
        const mapped = list.map(d => {
          const id = String(d.draft_id || d.id || d._id || d.id);
          const title = d.title || d.name || d.event_name || '';
          const description = d.description || d.desc || '';
          const category = d.category || d.category_name || '';
          // parse start_time and end_time (if present) and compute duration in hours
          let date = '';
          let start_time = '';
          let end_time = '';
          let durationHours = '';
          if (d.start_time) {
            const s = new Date(d.start_time);
            if (!isNaN(s)) {
              date = s.toISOString().split('T')[0];
              start_time = s.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
          } else if (d.date) {
            date = d.date;
          }
          if (d.end_time) {
            const e = new Date(d.end_time);
            if (!isNaN(e)) {
              end_time = e.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
          }
          // fallback: if there's a single time column
          if (!start_time && d.time) start_time = d.time;
          // compute duration if both start and end are present
          try {
            if (d.start_time && d.end_time) {
              const s = new Date(d.start_time);
              const e = new Date(d.end_time);
              if (!isNaN(s) && !isNaN(e)) {
                const diff = (e.getTime() - s.getTime()) / (1000 * 60 * 60);
                durationHours = Math.round(diff * 100) / 100; // two decimals
              }
            } else if (d.duration) {
              durationHours = d.duration;
            }
          } catch (err) { durationHours = d.duration || ''; }
          // Normalize attachments: treat string paths and objects; separate images vs documents by extension heuristic
          const attachments = Array.isArray(d.attachments) ? d.attachments : [];
          const imagesFromAttachments = [];
          const docsFromAttachments = [];
          const imageExtRe = /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i;
          attachments.forEach((a) => {
            if (!a) return;
            if (typeof a === 'string') {
                const s = a.trim().replace(/^"|"$/g, '');
              if (imageExtRe.test(s)) {
                imagesFromAttachments.push({ id: s, name: s.split('/').pop(), preview: urlFor(s) });
              } else {
                docsFromAttachments.push({ id: s, name: s.split('/').pop(), path: s });
              }
            } else if (typeof a === 'object') {
              const p = a.preview || a.url || a.path || a.file || a.download || '';
              if (p && imageExtRe.test(String(p))) {
                imagesFromAttachments.push({ id: a.id || a.name || p, name: a.name || p.split('/').pop(), preview: p.startsWith('http') ? p : urlFor(p) });
              } else {
                docsFromAttachments.push(a);
              }
            }
          });
          const images = (Array.isArray(d.images) ? d.images.map(a=>({ id: a.id||a.name||a.path, name: a.name||a.path||'', preview: a.preview||a.url||a.path })) : []).concat(imagesFromAttachments);
          const documents = Array.isArray(d.documents) ? d.documents : (Array.isArray(d.docs) ? d.docs : []).concat(docsFromAttachments);
          const sessions = (()=>{ try { return typeof d.sessions === 'string' ? JSON.parse(d.sessions) : (d.sessions || []); } catch { return []; } })();
          const locations = (()=>{ try { return typeof d.locations === 'string' ? JSON.parse(d.locations) : (d.locations || []); } catch { return []; } })();
          const ticketTypes = (()=>{ try { return typeof d.ticket_types === 'string' ? JSON.parse(d.ticket_types) : (d.ticket_types || d.ticketTypes || []); } catch { return []; } })();
          return {
            id,
            title,
            description,
            category,
            date,
            start_time,
            end_time,
            duration: durationHours,
            venue: d.venue || '',
            address: d.address || '',
            locations,
            capacity: d.capacity || d.max_capacity || '',
            ticketPrice: d.ticket_price || d.ticketPrice || '',
            contactEmail: d.contact_email || d.contactEmail || '',
            contactPhone: d.contact_phone || d.contactPhone || '',
            status: d.status || d.state || 'draft',
            createdFrom: d.created_from || '',
            lastModified: d.updated_at || d.lastModified || d.modified_at || '',
            images,
            documents,
            sessions,
            ticketTypes,
            config: d.config || {},
            raw: d,
          };
        });
        setDraftedEvents(mapped);
      } catch (err) {
        console.error('Failed to load drafts:', err);
      }
    })();
    return () => { ignore = true; };
  }, [urlFor]);

  // current banner url for preview (used to avoid duplicating banner in Images list)
  const bannerUrlForPreview = previewEvent ? getBannerUrl(previewEvent) : '';

  return (
    <div className="event-submission-page">
      <header className="es-header">
        <div className="titles">
          <h1 className="page-title">
            <FiSend /> Event Submission Review
          </h1>
          <p className="subtitle">Review and submit your drafted events for final approval.</p>
        </div>
      </header>

      <div className="events-grid">
        {filteredEvents.length === 0 ? (
          <div className="no-events">
            <FiAlertCircle />
            <h3>No Draft Events Found</h3>
            <p>Create events in Add Events, Event Config, or Documents Upload to see them here.</p>
          </div>
        ) : (
          filteredEvents.map(event => (
            <div key={event.id} className="event-card" onClick={() => handleEventClick(event)}>
              {/* Banner */}
              {getBannerUrl(event) ? (
                <div className="card-banner">
                  <img src={getBannerUrl(event)} alt={event.title} />
                </div>
              ) : null}
              <div className="event-details">
                <span className="event-cat">{event.category}</span>
                <h3>{event.title}</h3>
                <p className="event-date">{new Date(event.date).toLocaleDateString()} • {event.time}</p>
                <p className="event-location">{event.venue}</p>
              </div>
              <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 8 }}>
                <button className="btn" title="Edit Event" onClick={e => { e.stopPropagation(); handleEditEvent(event); }}><FiEdit2 /></button>
                <button
                  className="delete-btn"
                  title="Delete Event"
                  onClick={e => { e.stopPropagation(); handleDeleteEvent(event.id); }}
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Preview Modal */}
      {previewEvent && (
        <div className="preview-modal" onClick={closePreview}>
          <div className="preview-panel" onClick={(e) => e.stopPropagation()}>
            <div className="preview-header">
              <h2>Event Preview & Submit</h2>
              <button className="close-btn" onClick={closePreview}>
                <FiX />
              </button>
            </div>
            
            <div className="preview-content">
              {(() => {
                const bannerUrl = bannerUrlForPreview;
                if (bannerUrl) {
                  return (
                    <div className="preview-banner">
                      <img
                        src={bannerUrl + (bannerBust ? (bannerUrl.includes('?') ? `&t=${bannerBust}` : `?t=${bannerBust}`) : '')}
                        alt={previewEvent.title}
                        onError={(e) => {
                          // when image fails, remove src to hide broken icon and log
                          e.currentTarget.style.display = 'none';
                          // eslint-disable-next-line no-console
                          console.warn('Banner failed to load:', bannerUrl);
                        }}
                      />
                    </div>
                  );
                }

                // Debug info to help locate banner fields when image isn't showing
                const raw = previewEvent.raw || {};
                const firstAtt = (previewEvent.images && previewEvent.images[0]) || (raw.images && raw.images[0]) || (raw.attachments && raw.attachments[0]) || null;
                return (
                  <div style={{ marginBottom: 12, padding: 12, border: '1px dashed var(--glass-border)', borderRadius: 8, background: 'color-mix(in oklab, var(--glass-bg) 30%, transparent)' }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>Banner debug</div>
                    <div style={{ fontSize: 13, color: 'var(--txt-muted)' }}>
                      <div>Computed URL: <span style={{ color: 'var(--txt)' }}>{bannerUrl || '—'}</span></div>
                      <div>previewEvent.banner: <span style={{ color: 'var(--txt)' }}>{String(previewEvent.banner || raw.banner || '-')}</span></div>
                      <div>previewEvent.banner_path: <span style={{ color: 'var(--txt)' }}>{String(previewEvent.banner_path || raw.banner_path || '-')}</span></div>
                      <div>first attachment (preview/url/path): <span style={{ color: 'var(--txt)' }}>{firstAtt ? (firstAtt.preview || firstAtt.url || firstAtt.path || JSON.stringify(firstAtt)) : '-'}</span></div>
                    </div>
                  </div>
                );
              })()}

              <div className="preview-section">
                <h3>{previewEvent.title}</h3>
                <p className="preview-category">{previewEvent.category}</p>
                <p className="preview-description">{previewEvent.description}</p>
              </div>

              <div className="preview-section">
                <h4>Event Details</h4>
                <div className="preview-details">
                  <div className="preview-detail">
                    <FiCalendar />
                    <span>{new Date(previewEvent.date).toLocaleDateString()} at {formatTimeString(previewEvent.start_time || previewEvent.time)}</span>
                  </div>
                  <div className="preview-detail">
                    <FiClock />
                    <span>{previewEvent.duration} hours</span>
                  </div>
                    {/* location removed from Event Details - will show in separate Locations section */}
                  <div className="preview-detail">
                    <FiUsers />
                    <span>{previewEvent.capacity} capacity</span>
                  </div>
                </div>
              </div>

              {/* Contact Information intentionally removed */}

              {previewEvent.locations && previewEvent.locations.length > 0 && (
                <div className="preview-section">
                  <h4>Locations ({previewEvent.locations.length})</h4>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {previewEvent.locations.map((loc, idx) => (
                      <div key={idx} style={{ padding: 12, border: '1px solid var(--glass-border)', borderRadius: 8, background: 'color-mix(in oklab, var(--glass-bg) 30%, transparent)'}}>
                        {typeof loc === 'string' ? loc : ([loc.name, loc.address].filter(Boolean).join(' — ') || JSON.stringify(loc))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(previewEvent.images || []).length > 0 && (() => {
                const imagesWithoutBanner = (previewEvent.images || []).filter(img => {
                  const p = img.preview || img.url || img.path || img;
                  const resolved = urlFor(p);
                  return resolved !== bannerUrlForPreview;
                });
                if (imagesWithoutBanner.length === 0) return null;
                return (
                <div className="preview-section">
                  <h4>Images ({imagesWithoutBanner.length})</h4>
                  <div className="preview-images">
                    {imagesWithoutBanner.map(img => (
                      <div key={img.id || img.name || img.preview} className="preview-image-container" onClick={() => openImagePreview(img)}>
                        <img 
                          src={img.preview || img.url || img.path}
                          alt={img.name}
                          className="preview-image clickable"
                        />
                        <div className="image-overlay">
                          <FiEye />
                          <span>Click to view</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                );
              })()}

              {previewEvent.documents.length > 0 && (
                <div className="preview-section">
                  <h4>Documents ({previewEvent.documents.length})</h4>
                  <div className="preview-documents">
                    {previewEvent.documents.map(doc => (
                      <div key={doc.id} className="preview-document clickable" onClick={() => openDocPreview(doc)}>
                        <FiFileText />
                        <div className="doc-info">
                          <span className="doc-name">{doc.name}</span>
                          <span className="doc-size">{formatFileSize(doc.size)}</span>
                        </div>
                        <div className="doc-preview-btn">
                          <FiEye />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {previewEvent.sessions && previewEvent.sessions.length > 0 && (
                <div className="preview-section">
                  <h4>Sessions ({previewEvent.sessions.length})</h4>
                  <div className="preview-sessions">
                    {previewEvent.sessions.map(session => (
                      <div key={session.id || session.title || Math.random()} className="session-item">
                        <div className="session-header">
                          <h5 className="session-title">{session.title}</h5>
                          <span className="session-time">{
                            // try common variants for session time and format them
                            (() => {
                              const start = session.start_time || session.time || session.startTime || session.start || session.start_at || session.starts;
                              const end = session.end_time || session.endTime || session.end || session.end_at || session.ends;
                              const s = formatTimeString(start);
                              const e = formatTimeString(end);
                              return s ? (e ? `${s} — ${e}` : s) : (s || '');
                            })()
                          }</span>
                        </div>
                        {session.speaker && (
                          <p className="session-speaker">Speaker: {session.speaker}</p>
                        )}
                        <p className="session-description">{session.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {previewEvent.ticketTypes && previewEvent.ticketTypes.length > 0 && (
                <div className="preview-section">
                  <h4>Ticket Types ({previewEvent.ticketTypes.length})</h4>
                  <div className="preview-tickets">
                    {previewEvent.ticketTypes.map(ticket => (
                      <div key={ticket.id} className="ticket-item">
                        <div className="ticket-header">
                          <h5 className="ticket-name">{ticket.name}</h5>
                          <span className="ticket-price">₹{ticket.price}</span>
                        </div>
                        <p className="ticket-description">{ticket.description}</p>
                        <div className="ticket-availability">
                          <span>Available: {ticket.available - ticket.sold}</span>
                          <span>Sold: {ticket.sold}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="preview-section">
                <h4>Configuration</h4>
                <div className="preview-config">
                  <div className="config-item">
                    <span>Capacity: {previewEvent.capacity || previewEvent.config?.maxRegistrations || '-'}</span>
                  </div>
                  <div className="config-item">
                    <span>Requires Approval: {previewEvent.config?.requiresApproval ? "Yes" : "No"}</span>
                  </div>
                  {/* Allow Waitlist removed by request */}
                </div>
              </div>

              <div className="preview-meta">
                {previewEvent.lastModified && (() => {
                  const d = new Date(previewEvent.lastModified);
                  if (!isNaN(d)) return <p><strong>Last modified:</strong> {d.toLocaleDateString()}</p>;
                  return null;
                })()}
              </div>

              <div className="preview-actions">
                {submitStatus === "success" && (
                  <div className="success-message">
                    <FiCheck /> Event submitted successfully for admin review!
                  </div>
                )}
                {submitStatus === "error" && (
                  <div className="error-message">
                    <FiAlertCircle /> Failed to submit event. Please try again.
                  </div>
                )}
                <div className="action-buttons">
                  <button className="btn secondary" onClick={closePreview}>
                    Cancel
                  </button>
                  <button 
                    className="btn primary" 
                    onClick={() => submitSingleEvent(previewEvent.id)}
                    disabled={submitStatus === "submitting"}
                  >
                    {submitStatus === "submitting" ? "Submitting..." : "Submit Event"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editEvent && (
        <div className="preview-modal" onClick={() => setEditEvent(null)}>
          <div className="preview-panel" onClick={(e) => e.stopPropagation()}>
            <div className="preview-header">
              <h2>Edit Event</h2>
              <button className="close-btn" onClick={() => setEditEvent(null)}><FiX /></button>
            </div>
            <div className="preview-content">
              <form onSubmit={saveEditEvent} style={{ display: 'grid', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <label>
                    Title
                    <input value={editEvent.title || ''} onChange={(e) => setEditEvent({ ...editEvent, title: e.target.value })} />
                  </label>
                  <label>
                    Category
                    <input value={editEvent.category || ''} onChange={(e) => setEditEvent({ ...editEvent, category: e.target.value })} />
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <label>
                    Date
                    <input type="date" value={editEvent.date || ''} onChange={(e) => setEditEvent({ ...editEvent, date: e.target.value })} />
                  </label>
                  <label>
                    Time
                    <input type="time" value={editEvent.time || ''} onChange={(e) => setEditEvent({ ...editEvent, time: e.target.value })} />
                  </label>
                  <label>
                    Duration (hrs)
                    <input type="number" min="0" value={editEvent.duration || ''} onChange={(e) => setEditEvent({ ...editEvent, duration: e.target.value })} />
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <label>
                    Venue
                    <input value={editEvent.venue || ''} onChange={(e) => setEditEvent({ ...editEvent, venue: e.target.value })} />
                  </label>
                  <label>
                    Address
                    <input value={editEvent.address || ''} onChange={(e) => setEditEvent({ ...editEvent, address: e.target.value })} />
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <label>
                    Capacity
                    <input type="number" min="0" value={editEvent.capacity || ''} onChange={(e) => setEditEvent({ ...editEvent, capacity: e.target.value })} />
                  </label>
                  <label>
                    Ticket Price
                    <input type="number" min="0" value={editEvent.ticketPrice || ''} onChange={(e) => setEditEvent({ ...editEvent, ticketPrice: e.target.value })} />
                  </label>
                  <label>
                    Last Modified
                    <input type="date" value={editEvent.lastModified || ''} onChange={(e) => setEditEvent({ ...editEvent, lastModified: e.target.value })} />
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <label>
                    Contact Email
                    <input value={editEvent.contactEmail || ''} onChange={(e) => setEditEvent({ ...editEvent, contactEmail: e.target.value })} />
                  </label>
                  <label>
                    Contact Phone
                    <input value={editEvent.contactPhone || ''} onChange={(e) => setEditEvent({ ...editEvent, contactPhone: e.target.value })} />
                  </label>
                </div>

                <label>
                  Description
                  <textarea value={editEvent.description || ''} onChange={(e) => setEditEvent({ ...editEvent, description: e.target.value })} rows={4} />
                </label>

                {/* Config toggles (kept simple) */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="checkbox" checked={!!(editEvent.config?.registrationOpen)} onChange={(e) => setEditEvent({ ...editEvent, config: { ...(editEvent.config||{}), registrationOpen: e.target.checked } })} />
                    Registration Open
                  </label>
                  <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="checkbox" checked={!!(editEvent.config?.requiresApproval)} onChange={(e) => setEditEvent({ ...editEvent, config: { ...(editEvent.config||{}), requiresApproval: e.target.checked } })} />
                    Requires Approval
                  </label>
                  <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="checkbox" checked={!!(editEvent.config?.allowWaitlist)} onChange={(e) => setEditEvent({ ...editEvent, config: { ...(editEvent.config||{}), allowWaitlist: e.target.checked } })} />
                    Allow Waitlist
                  </label>
                </div>

                {/* Sessions and ticket types (JSON edit) */}
                <label>
                  Sessions (JSON)
                  <textarea value={editEvent.sessionsText || ''} onChange={(e) => setEditEvent({ ...editEvent, sessionsText: e.target.value })} rows={6} />
                </label>

                <label>
                  Ticket Types (JSON)
                  <textarea value={editEvent.ticketTypesText || ''} onChange={(e) => setEditEvent({ ...editEvent, ticketTypesText: e.target.value })} rows={6} />
                </label>

                {/* Read-only: images (banner) and documents */}
                <div style={{ display: 'grid', gap: 8 }}>
                  <div style={{ fontWeight: 700 }}>Images (read-only)</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {(editEvent.images || []).map(img => (
                      <div key={img.id || img.name} style={{ width: 100, height: 64, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f6f7fb' }}>
                        {img.preview ? <img src={img.preview} alt={img.name || 'img'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ padding: 6, textAlign: 'center' }}>{img.name}</div>}
                      </div>
                    ))}
                  </div>

                  <div style={{ fontWeight: 700 }}>Documents (read-only)</div>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {(editEvent.documents || []).map((d, i) => (
                      <li key={i}>{d.name || d.path || d}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button type="button" className="btn" onClick={() => setEditEvent(null)}>Cancel</button>
                  <button type="submit" className="btn primary">Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {imagePreview && (
        <div className="image-preview-modal" onClick={closeImagePreview}>
          <div className="image-preview-container" onClick={(e) => e.stopPropagation()}>
            <div className="image-preview-header">
              <h3>{imagePreview.name}</h3>
              <button className="close-btn" onClick={closeImagePreview}>
                <FiX />
              </button>
            </div>
            <div className="image-preview-content">
              <img src={imagePreview.preview} alt={imagePreview.name} className="full-image" />
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {docPreview && (
        <div className="doc-preview-modal" onClick={closeDocPreview}>
          <div className="doc-preview-container" onClick={(e) => e.stopPropagation()}>
            <div className="doc-preview-header">
              <div className="doc-preview-info">
                <h3>{docPreview.name}</h3>
                <span className="doc-preview-size">{formatFileSize(docPreview.size)}</span>
              </div>
              <button className="close-btn" onClick={closeDocPreview}>
                <FiX />
              </button>
            </div>
            <div className="doc-preview-content">
              <div className="doc-preview-placeholder">
                <FiFileText />
                <h4>Document Preview</h4>
                <p>Preview for {docPreview.name}</p>
                <p className="preview-note">In a real application, this would show the actual document content using viewers for PDF, DOCX, etc.</p>
                <div className="doc-actions">
                  <button className="btn secondary">
                    <FiEye /> View Full Document
                  </button>
                  <button className="btn primary">
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}