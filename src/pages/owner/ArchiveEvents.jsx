import React, { useEffect, useMemo, useState } from "react";
import { FiSearch, FiRefreshCw, FiTrash2, FiDownload } from "react-icons/fi";
import API from "../../api";
import './ArchiveEvents.css';

const SAMPLE = [
  { id: 101, title: "Autumn Innovators Summit", date: "2024-11-12", location: "London", attendees: 420, archived_at: "2025-09-01" },
  { id: 102, title: "React Conf - Mini", date: "2025-03-21", location: "Remote", attendees: 780, archived_at: "2025-08-20" },
  { id: 103, title: "Startup Pitch Night", date: "2025-02-14", location: "San Francisco", attendees: 150, archived_at: "2025-06-10" },
];

const KEY = 'archivedEvents';

export default function ArchiveEvents(){
  const [events, setEvents] = useState(() => {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : SAMPLE;
  });
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    // try fetch from API
    let mounted = true;
    (async () => {
      try{
        setLoading(true);
        const res = await API.get('/events?archived=1').catch(() => null);
        if(!mounted) return;
        if(res && res.data && Array.isArray(res.data)){
          setEvents(res.data);
        }
      }catch(e){}
      finally{ setLoading(false); }
    })();
    return ()=> mounted=false;
  }, []);

  const filtered = useMemo(()=>{
    return events.filter(ev=>{
      if(filter!=='all'){
        if(filter==='recent') return new Date(ev.archived_at) > new Date(Date.now() - 1000*60*60*24*30);
      }
      if(q){
        const hay = `${ev.title} ${ev.location}`.toLowerCase();
        if(!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  },[events,q,filter]);

  const restore = async (id)=>{
    // call API then update local state
    try{ await API.post(`/events/${id}/restore`).catch(()=>null); }catch(e){}
    setEvents(s=>s.filter(x=>x.id!==id));
  };

  const [confirmDelete, setConfirmDelete] = useState(null);
  const remove = async (id)=>{
    setConfirmDelete(id);
  };

  const doDelete = async (id) => {
    try{ await API.delete(`/events/${id}`).catch(()=>null); }catch(e){}
    setEvents(s=>s.filter(x=>x.id!==id));
    setConfirmDelete(null);
  };

  const exportCSV = ()=>{
    const header = ['id','title','date','location','attendees','archived_at'].join(',');
    const rows = events.map(e=>[e.id, `"${e.title.replace(/"/g,'""')}"`, e.date, `"${e.location.replace(/"/g,'""')}"`, e.attendees||0, e.archived_at].join(','));
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `archived-events-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="ae-page">
      <div className="ae-header">
        <div>
          <h2>Archived Events</h2>
          <p className="muted">Manage events that have been archived. You can restore them or remove permanently.</p>
        </div>
        <div className="ae-controls">
          <div className="ae-search"><FiSearch /> <input placeholder="Search archived events" value={q} onChange={e=>setQ(e.target.value)} /></div>
          <select value={filter} onChange={e=>setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="recent">Archived in 30 days</option>
          </select>
          <button className="btn" onClick={exportCSV}><FiDownload /> Export</button>
        </div>
      </div>

      <div className="ae-list card">
        {loading && <div className="ae-loading">Loading archived events...</div>}
        {!loading && filtered.length===0 && <div className="empty">No archived events found.</div>}
        {filtered.map(ev=> (
          <div className="ae-item" key={ev.id}>
            <div className="main">
              <div className="title">{ev.title}</div>
              <div className="meta muted">{ev.date} • {ev.location} • {ev.attendees} attendees</div>
            </div>
            <div className="actions">
              <button className="btn" title="Restore" onClick={()=>restore(ev.id)}><FiRefreshCw /> Restore</button>
              <button className="btn danger" title="Delete" onClick={()=>remove(ev.id)}><FiTrash2 /> Delete</button>
            </div>
          </div>
        ))}
      </div>
      {confirmDelete && (
        <div className="ae-modal">
          <div className="ae-modal-card">
            <h3>Delete archived event?</h3>
            <p>This will permanently delete the archived event. This action cannot be undone.</p>
            <div className="row">
              <button className="btn" onClick={()=>setConfirmDelete(null)}>Cancel</button>
              <button className="btn danger" onClick={()=>doDelete(confirmDelete)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
