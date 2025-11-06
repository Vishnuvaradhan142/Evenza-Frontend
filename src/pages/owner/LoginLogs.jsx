import React, { useState, useMemo } from "react";
import {
  FiSearch,
  FiCheckCircle,
  FiXCircle,
  FiDownload,
  FiFilter,
  FiChevronUp,
  FiChevronDown,
  FiBarChart,
  FiTrendingUp,
} from "react-icons/fi";
import "./LoginLogs.css";

const parseDate = (ts) => new Date(ts.replace(" ", "T"));

const LoginLogs = () => {
  const [logs] = useState([
    { id: 1, user: "John Doe", email: "john@example.com", status: "Success", timestamp: "2025-10-08 14:32", ip: "192.168.0.12" },
    { id: 2, user: "Jane Smith", email: "jane@example.com", status: "Failed", timestamp: "2025-10-08 13:45", ip: "192.168.0.44" },
    { id: 3, user: "Alice Johnson", email: "alice@example.com", status: "Success", timestamp: "2025-10-07 18:20", ip: "192.168.0.21" },
    { id: 4, user: "Bob Brown", email: "bob@example.com", status: "Failed", timestamp: "2025-10-07 17:10", ip: "192.168.0.33" },
  ]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sort, setSort] = useState({ key: "timestamp", dir: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const filtered = useMemo(() => {
    return logs
      .filter(l => {
        if (statusFilter !== "All" && l.status !== statusFilter) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          if (![l.user, l.email, l.status, l.ip].some(v => v.toLowerCase().includes(q))) return false;
        }
        if (fromDate && parseDate(l.timestamp) < new Date(fromDate)) return false;
        if (toDate) {
          const end = new Date(toDate);
            end.setHours(23,59,59,999);
          if (parseDate(l.timestamp) > end) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const dir = sort.dir === "asc" ? 1 : -1;
        let av = a[sort.key];
        let bv = b[sort.key];
        if (sort.key === "timestamp") {
          av = parseDate(a.timestamp).getTime();
          bv = parseDate(b.timestamp).getTime();
        } else {
          av = av.toString().toLowerCase();
          bv = bv.toString().toLowerCase();
        }
        if (av < bv) return -1 * dir;
        if (av > bv) return 1 * dir;
        return 0;
      });
  }, [logs, search, statusFilter, fromDate, toDate, sort]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const success = filtered.filter(l => l.status === "Success").length;
    const failed = filtered.filter(l => l.status === "Failed").length;
    return { total, success, failed, successRate: total ? Math.round((success / total) * 100) : 0 };
  }, [filtered]);

  // Unique trend chart data
  const trendData = useMemo(() => {
    const days = 7;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayLogs = filtered.filter(l => parseDate(l.timestamp).toDateString() === d.toDateString());
      data.push({ date: d.toLocaleDateString(), success: dayLogs.filter(l => l.status === "Success").length, failed: dayLogs.filter(l => l.status === "Failed").length });
    }
    return data;
  }, [filtered]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;
  const pageData = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const allOnPageSelected = pageData.length > 0 && pageData.every(r => selectedIds.has(r.id));
  const someOnPageSelected = !allOnPageSelected && pageData.some(r => selectedIds.has(r.id));

  const toggleOne = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const togglePage = () => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        pageData.forEach(r => next.delete(r.id));
      } else {
        pageData.forEach(r => next.add(r.id));
      }
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const toggleSort = (key) => {
    setSort(s => s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" });
  };

  const iconSort = (key) => {
    if (sort.key !== key) return <FiChevronDown className="sort-indicator inactive" />;
    return sort.dir === "asc" ? <FiChevronUp className="sort-indicator" /> : <FiChevronDown className="sort-indicator" />;
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  const exportCSV = () => {
    const headers = ["User","Email","Status","Timestamp","IP"];
    const rows = filtered.map(l => [l.user,l.email,l.status,l.timestamp,l.ip]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `login_logs_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="login-logs-page pro unique">
      <div className="hero-section">
        <div className="hero-content">
          <FiBarChart className="hero-icon" />
          <div>
            <h1>Login Activity Insights</h1>
            <p className="subtitle">Monitor and analyze authentication patterns with advanced analytics.</p>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Logs</span>
          </div>
          <div className="stat-item success">
            <span className="stat-value">{stats.success}</span>
            <span className="stat-label">Successful</span>
          </div>
          <div className="stat-item failed">
            <span className="stat-value">{stats.failed}</span>
            <span className="stat-label">Failed</span>
          </div>
          <div className="stat-item rate">
            <span className="stat-value">{stats.successRate}%</span>
            <span className="stat-label">Success Rate</span>
          </div>
        </div>
      </div>

      <div className="trend-chart">
        <h3><FiTrendingUp /> Login Trends (Last 7 Days)</h3>
        <div className="chart-container">
          <svg className="trend-svg" viewBox="0 0 700 200">
            <defs>
              <linearGradient id="successGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: "var(--status-confirmed-text)", stopOpacity: 0.8 }} />
                <stop offset="100%" style={{ stopColor: "var(--status-confirmed-text)", stopOpacity: 0.2 }} />
              </linearGradient>
              <linearGradient id="failedGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: "var(--status-cancelled-text)", stopOpacity: 0.8 }} />
                <stop offset="100%" style={{ stopColor: "var(--status-cancelled-text)", stopOpacity: 0.2 }} />
              </linearGradient>
            </defs>
            {trendData.map((d, i) => {
              const x = (i / (trendData.length - 1)) * 600 + 50;
              const ySuccess = 150 - (d.success / Math.max(...trendData.map(t => t.success), 1)) * 120;
              const yFailed = 150 - (d.failed / Math.max(...trendData.map(t => t.failed), 1)) * 120;
              return (
                <g key={i}>
                  <circle cx={x} cy={ySuccess} r="4" fill="var(--status-confirmed-text)" />
                  <circle cx={x} cy={yFailed} r="4" fill="var(--status-cancelled-text)" />
                  <text x={x} y={170} textAnchor="middle" fontSize="10" fill="var(--subtitle-color)">{d.date.slice(0,5)}</text>
                </g>
              );
            })}
            <polyline
              fill="url(#successGrad)"
              stroke="var(--status-confirmed-text)"
              strokeWidth="2"
              points={trendData.map((d, i) => {
                const x = (i / (trendData.length - 1)) * 600 + 50;
                const y = 150 - (d.success / Math.max(...trendData.map(t => t.success), 1)) * 120;
                return `${x},${y}`;
              }).join(" ")}
            />
            <polyline
              fill="none"
              stroke="var(--status-cancelled-text)"
              strokeWidth="2"
              strokeDasharray="5,5"
              points={trendData.map((d, i) => {
                const x = (i / (trendData.length - 1)) * 600 + 50;
                const y = 150 - (d.failed / Math.max(...trendData.map(t => t.failed), 1)) * 120;
                return `${x},${y}`;
              }).join(" ")}
            />
            <text x="50" y="20" fontSize="12" fill="var(--status-confirmed-text)">Success</text>
            <text x="50" y="35" fontSize="12" fill="var(--status-cancelled-text)">Failed</text>
          </svg>
        </div>
      </div>

      <div className="filters-panel">
        <div className="filter search">
          <FiSearch />
          <input
            placeholder="Search user, email, status, IP..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <div className="filter">
          <label>Status</label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          >
            <option>All</option>
            <option>Success</option>
            <option>Failed</option>
          </select>
        </div>
        <div className="filter">
          <label>From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => { setFromDate(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <div className="filter">
          <label>To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => { setToDate(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <div className="filter">
          <label>Rows</label>
          <select
            value={rowsPerPage}
            onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
          >
            {[5,10,20,50].map(n => <option key={n}>{n}</option>)}
          </select>
        </div>
      </div>

      <div className="card table-card">
        <div className="table-head-inline">
          <h3>Login Activity</h3>
          <span className="count-tag">{filtered.length} records</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: ".4rem" }}>
            <button className="page-btn" onClick={exportCSV}><FiDownload /> Export</button>
            <button className="page-btn" onClick={resetFilters}><FiFilter /> Reset</button>
          </div>
        </div>
        <div className="table-wrapper">
          <table className="logs-table pro">
            <thead>
              <tr>
                <th>#</th>
                <th className="select-col">
                  <div className={`chk-wrapper ${someOnPageSelected ? "indeterminate":""}`}>
                    <input
                      type="checkbox"
                      aria-label="Select visible rows"
                      checked={allOnPageSelected}
                      ref={el => { if (el) el.indeterminate = someOnPageSelected; }}
                      onChange={togglePage}
                    />
                    <span className="chk-custom"></span>
                  </div>
                </th>
                <th onClick={() => toggleSort("user")} className="sortable">User {iconSort("user")}</th>
                <th onClick={() => toggleSort("email")} className="sortable">Email {iconSort("email")}</th>
                <th onClick={() => toggleSort("status")} className="sortable">Status {iconSort("status")}</th>
                <th onClick={() => toggleSort("timestamp")} className="sortable">Timestamp {iconSort("timestamp")}</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {pageData.map((log, i) => {
                const dt = parseDate(log.timestamp);
                const checked = selectedIds.has(log.id);
                return (
                  <tr key={log.id} className={checked ? "row-selected" : ""}>
                    <td>{(currentPage - 1) * rowsPerPage + i + 1}</td>
                    <td className="select-col">
                      <div className="chk-wrapper">
                        <input
                          type="checkbox"
                          aria-label={`Select ${log.user}`}
                          checked={checked}
                          onChange={() => toggleOne(log.id)}
                        />
                        <span className="chk-custom"></span>
                      </div>
                    </td>
                    <td className="cell-user">
                      <span className="user-name">{log.user}</span>
                    </td>
                    <td className="mono">{log.email}</td>
                    <td>
                      <span className={`status-badge ${log.status.toLowerCase()}`}>
                        {log.status === "Success" ? <FiCheckCircle /> : <FiXCircle />} {log.status}
                      </span>
                    </td>
                    <td title={dt.toLocaleString()}>
                      <span className="dt-main">{log.timestamp}</span>
                    </td>
                    <td className="mono small">{log.ip}</td>
                  </tr>
                );
              })}
              {pageData.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty">No login records match current filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination-bar">
          <div className="page-info">
            Showing {pageData.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}–
            {(currentPage - 1) * rowsPerPage + pageData.length} of {filtered.length}
            {selectedIds.size > 0 && (
              <span className="selection-info">
                • {selectedIds.size} selected
                <button className="link-clear" onClick={clearSelection}>Clear</button>
              </span>
            )}
          </div>
          <div className="pager">
            <button
              className="page-btn"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <span className="page-num">Page {currentPage} / {totalPages}</span>
            <button
              className="page-btn"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginLogs;