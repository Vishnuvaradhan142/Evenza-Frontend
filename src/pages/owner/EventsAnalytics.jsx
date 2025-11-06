import React, { useEffect, useMemo, useState } from "react";
import { FiSearch, FiDownload, FiRefreshCw } from "react-icons/fi";
import API from "../../api";
import "./EventsAnalytics.css";

const SAMPLE_EVENTS = [
  { id: 1, name: "Autumn Innovators Summit", date: "2025-10-10", attendees: 420, revenue: 12500, capacity: 500, tickets_sold: 450, trend: [30,50,80,120,200,320,420] },
  { id: 2, name: "React Conf - Mini", date: "2025-09-21", attendees: 320, revenue: 8400, capacity: 350, tickets_sold: 340, trend: [10,30,60,110,160,260,320] },
  { id: 3, name: "Startup Pitch Night", date: "2025-10-05", attendees: 150, revenue: 2100, capacity: 200, tickets_sold: 160, trend: [5,20,40,70,100,130,150] },
  { id: 4, name: "Design Workshop", date: "2025-09-30", attendees: 85, revenue: 1700, capacity: 100, tickets_sold: 90, trend: [2,10,25,40,55,70,85] },
  { id: 5, name: "Community Meetup", date: "2025-10-18", attendees: 60, revenue: 600, capacity: 80, tickets_sold: 65, trend: [0,5,10,20,35,50,60] },
];

const EventsAnalytics = () => {
  const [events, setEvents] = useState(SAMPLE_EVENTS);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState(7);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await API.get("/analytics/events").catch(() => null);
        if (mounted && res && res.data && Array.isArray(res.data)) setEvents(res.data);
      } catch (err) {
        // fallback to SAMPLE_EVENTS
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => (mounted = false);
  }, []);

  const filtered = useMemo(() => {
    let out = events.slice();
    if (query.trim()) {
      const q = query.toLowerCase();
      out = out.filter((e) => e.name.toLowerCase().includes(q));
    }
    if (fromDate) out = out.filter((e) => new Date(e.date) >= new Date(fromDate));
    if (toDate) out = out.filter((e) => new Date(e.date) <= new Date(toDate));
    return out.sort((a, b) => b.attendees - a.attendees);
  }, [events, query, fromDate, toDate]);

  const kpis = useMemo(() => {
    const totalEvents = filtered.length;
    const totalAttendees = filtered.reduce((s, e) => s + (e.attendees || 0), 0);
    const totalRevenue = filtered.reduce((s, e) => s + (e.revenue || 0), 0);
    const avgAttendance = totalEvents ? Math.round(totalAttendees / totalEvents) : 0;
    const avgOccupancy = Math.round(filtered.reduce((s, e) => s + ((e.attendees / (e.capacity || 1)) * 100), 0) / (totalEvents || 1));
    return { totalEvents, totalAttendees, totalRevenue, avgAttendance, avgOccupancy };
  }, [filtered]);

  const exportCSV = () => {
    const header = ["id", "name", "date", "attendees", "revenue", "capacity", "tickets_sold"].join(",");
    const rows = filtered.map((e) => [e.id, `"${e.name.replace(/"/g, '""')}"`, e.date, e.attendees, e.revenue, e.capacity, e.tickets_sold].join(","));
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `events-analytics-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const miniSpark = (data) => {
    const max = Math.max(...data, 1);
    const pts = data.map((v, i) => `${(i/(data.length-1))*100},${100 - Math.round((v/max)*100)}`).join(" ");
    return (
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="mini-spark">
        <polyline fill="none" stroke="var(--accent-color)" strokeWidth="4" points={pts} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  return (
    <div className="ea-page">
      <header className="ea-header">
        <div>
          <h2>Events Analytics</h2>
          <p className="muted">High-level performance and per-event details.</p>
        </div>
        <div className="ea-actions">
          <div className="ea-filter-row">
            <div className="ea-search"><FiSearch /> <input placeholder="Search events..." value={query} onChange={(e) => setQuery(e.target.value)} /></div>
            <div className="ea-dates">
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
            <select value={period} onChange={(e) => setPeriod(Number(e.target.value))}>
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            <button className="btn" onClick={() => { setLoading(true); API.get('/analytics/events').then((r)=>r?.data && setEvents(r.data)).catch(()=>{}).finally(()=>setLoading(false)); }} title="Refresh"><FiRefreshCw /></button>
            <button className="btn" onClick={exportCSV} title="Export CSV"><FiDownload /> Export</button>
          </div>
        </div>
      </header>

      <section className="ea-kpis hero">
        <div className="kpi">
          <div className="kpi-title">Total Events</div>
          <div className="kpi-value">{kpis.totalEvents}</div>
        </div>
        <div className="kpi">
          <div className="kpi-title">Total Attendees</div>
          <div className="kpi-value">{kpis.totalAttendees}</div>
        </div>
        <div className="kpi">
          <div className="kpi-title">Total Revenue</div>
          <div className="kpi-value">${kpis.totalRevenue.toLocaleString()}</div>
        </div>
        <div className="kpi">
          <div className="kpi-title">Avg Attendance</div>
          <div className="kpi-value">{kpis.avgAttendance}</div>
        </div>
        <div className="kpi">
          <div className="kpi-title">Avg Occupancy</div>
          <div className="kpi-value">{kpis.avgOccupancy}%</div>
        </div>
      </section>

      <section className="ea-table card">
        <div className="ea-row header">
          <div className="col rank">#</div>
          <div className="col name">Event</div>
          <div className="col attendees">Attendees</div>
          <div className="col revenue">Revenue</div>
          <div className="col occupancy">Occupancy</div>
          <div className="col trend">Trend</div>
        </div>

        {loading ? <div className="ea-loading">Loading…</div> : filtered.map((e, i) => (
          <div className="ea-row flashy" key={e.id}>
            <div className="col rank">{i+1}</div>
            <div className="col name">{e.name}<div className="muted small">{e.date}</div></div>
            <div className="col attendees">{e.attendees}</div>
            <div className="col revenue">${e.revenue.toLocaleString()}</div>
            <div className="col occupancy">{Math.round((e.attendees/(e.capacity||1))*100)}%</div>
            <div className="col trend">{miniSpark(e.trend)}</div>
          </div>
        ))}

      </section>
    </div>
  );
};

export default EventsAnalytics;
