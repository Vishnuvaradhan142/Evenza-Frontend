import React, { useEffect, useMemo, useState } from "react";
import { FiSearch, FiDownload, FiRefreshCw, FiFilter, FiChevronUp, FiChevronDown } from "react-icons/fi";
import API from "../../api";
import "./PlatformLeaderboard.css";

const SAMPLE = [
  { id: 1, name: "Alice Johnson", org: "Acme Events", points: 1420, rank: 1, events: 12, lastActive: "2025-10-20" },
  { id: 2, name: "Bob Smith", org: "BlueSky Co", points: 1190, rank: 2, events: 9, lastActive: "2025-10-21" },
  { id: 3, name: "Clara Lee", org: "Eventify", points: 1075, rank: 3, events: 8, lastActive: "2025-10-19" },
  { id: 4, name: "Derek O'Neil", org: "GatherHub", points: 900, rank: 4, events: 6, lastActive: "2025-10-18" },
  { id: 5, name: "Elena Park", org: "Spark Live", points: 755, rank: 5, events: 5, lastActive: "2025-10-22" },
];

const PlatformLeaderboard = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState({ key: "points", dir: "desc" });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [filterActive, setFilterActive] = useState("all");

  // Visual helpers: compute KPIs
  const totalPoints = useMemo(() => rows.reduce((s, r) => s + (r.points || 0), 0), [rows]);
  const avgPoints = useMemo(() => (rows.length ? Math.round(totalPoints / rows.length) : 0), [totalPoints, rows.length]);
  const totalOrganizers = rows.length;

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        // Attempt to fetch from backend if endpoint exists
        const resp = await API.get("/leaderboard").catch(() => null);
        if (mounted) setRows(resp?.data ?? SAMPLE);
      } catch (err) {
        if (mounted) setRows(SAMPLE);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => (mounted = false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    let out = rows.slice();
    if (query.trim()) {
      const q = query.toLowerCase();
      out = out.filter((r) => r.name.toLowerCase().includes(q) || r.org.toLowerCase().includes(q));
    }
    if (filterActive === "active") {
      // lastActive within 7 days
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7);
      out = out.filter((r) => new Date(r.lastActive) >= cutoff);
    }
    out.sort((a, b) => {
      const aV = a[sortBy.key];
      const bV = b[sortBy.key];
      if (aV === bV) return 0;
      return sortBy.dir === "asc" ? (aV < bV ? -1 : 1) : aV > bV ? -1 : 1;
    });
    return out;
  }, [rows, query, sortBy, filterActive]);

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const slice = filtered.slice((page - 1) * perPage, page * perPage);

  const toggleSort = (key) => {
    setSortBy((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }));
  };

  const exportCSV = () => {
    const items = filtered;
    const header = ["rank", "name", "organization", "points", "events", "lastActive"];
    const csv = [header.join(",")].concat(items.map((r) => [r.rank, JSON.stringify(r.name), JSON.stringify(r.org), r.points, r.events, r.lastActive].join(","))).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `platform-leaderboard-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pl-page">
      <header className="pl-header">
        <div className="pl-hero">
          <div>
            <h2>Platform Leaderboard</h2>
            <p className="muted">Top organizers and contributors across the platform</p>
          </div>

          <div className="pl-kpis">
            <div className="kpi-card">
              <div className="kpi-title">Total Organizers</div>
              <div className="kpi-value">{totalOrganizers}</div>
            </div>
            <div className="kpi-card accent">
              <div className="kpi-title">Total Points</div>
              <div className="kpi-value">{totalPoints}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">Avg Points</div>
              <div className="kpi-value">{avgPoints}</div>
            </div>
          </div>
        </div>

        <div className="pl-controls">
          <div className="pl-search">
            <FiSearch />
            <input placeholder="Search by organizer or organization" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="pl-actions">
            <button className="btn ghost" onClick={() => { setLoading(true); API.get("/leaderboard").then((r) => setRows(r.data)).catch(() => setRows(SAMPLE)).finally(() => setLoading(false)); }} title="Refresh">
              <FiRefreshCw />
            </button>
            <button className="btn" onClick={exportCSV} title="Export CSV"><FiDownload /> Export</button>
            <div className="filter">
              <button className="btn small" onClick={() => setFilterActive((f) => (f === "all" ? "active" : "all"))} title="Toggle active">
                <FiFilter /> {filterActive === "all" ? "Show active" : "Show all"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="pl-table card">
        <div className="pl-row header">
          <div className="col rank" onClick={() => toggleSort("rank")}># {sortBy.key === "rank" && (sortBy.dir === "asc" ? <FiChevronUp /> : <FiChevronDown />)}</div>
          <div className="col name" onClick={() => toggleSort("name")}>Organizer {sortBy.key === "name" && (sortBy.dir === "asc" ? <FiChevronUp /> : <FiChevronDown />)}</div>
          <div className="col org" onClick={() => toggleSort("org")}>Organization</div>
          <div className="col points" onClick={() => toggleSort("points")}>Points {sortBy.key === "points" && (sortBy.dir === "asc" ? <FiChevronUp /> : <FiChevronDown />)}</div>
          <div className="col events" onClick={() => toggleSort("events")}>Events</div>
          <div className="col last" onClick={() => toggleSort("lastActive")}>Last Active</div>
        </div>

        {loading ? (
          <div className="pl-loading">Loading…</div>
        ) : (
          slice.map((r, idx) => {
            // small deterministic sparkline data
            const data = [Math.max(0, r.points - 200), r.points - 120, r.points - 60, r.points - 90, r.points];
            const max = Math.max(...data);
            const points = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - Math.round((v / max) * 100)}`).join(" ");
            return (
              <div className="pl-row" key={r.id}>
                <div className="col rank">
                  {r.rank <= 3 ? (
                    <span className={`medal ${r.rank === 1 ? "gold" : r.rank === 2 ? "silver" : "bronze"}`}>{r.rank}</span>
                  ) : (
                    <div className="avatar">{r.name.split(" ")[0][0]}{r.name.split(" ")[1] ? r.name.split(" ")[1][0] : ""}</div>
                  )}
                </div>
                <div className="col name">{r.name}</div>
                <div className="col org">{r.org}</div>
                <div className="col points">{r.points}</div>
                <div className="col events">
                  <div className="spark">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                      <polyline fill="none" stroke="var(--accent-color)" strokeWidth="6" points={points} strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />
                    </svg>
                  </div>
                </div>
                <div className="col last">{r.lastActive}</div>
              </div>
            );
          })
        )}

        <footer className="pl-footer">
          <div className="left muted">{total} result{total !== 1 ? "s" : ""}</div>
          <div className="pager">
            <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
            <button className="btn small" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
            <span className="muted">{page} / {pages}</span>
            <button className="btn small" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}>Next</button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default PlatformLeaderboard;
