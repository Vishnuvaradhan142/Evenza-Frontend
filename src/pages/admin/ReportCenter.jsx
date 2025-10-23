import React, { useEffect, useState, useMemo } from "react";
import {
  FiRefreshCw,
  FiFilter,
  FiSearch,
  FiEye,
  FiCheckCircle,
  FiAlertTriangle,
  FiXCircle,
  FiClock
} from "react-icons/fi";
import "./ReportCenter.css";

const STATUS_COLORS = {
  open: "status-open",
  in_review: "status-review",
  resolved: "status-resolved",
  rejected: "status-rejected",
};

const STATUS_LABEL = {
  open: "Open",
  in_review: "In Review",
  resolved: "Resolved",
  rejected: "Rejected",
};

const TYPE_LABEL = {
  event_issue: "Event Issue",
  abuse: "Abuse",
  spam: "Spam",
  bug: "Bug",
  other: "Other",
};

const PRIORITY_LABEL = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

const ICON_FOR_STATUS = {
  open: <FiAlertTriangle />,
  in_review: <FiClock />,
  resolved: <FiCheckCircle />,
  rejected: <FiXCircle />,
};

// Dummy dataset generator
const buildDummyReports = () => {
  const now = Date.now();
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const statuses = ["open", "in_review", "resolved", "rejected"];
  const types = ["event_issue", "abuse", "spam", "bug", "other"];
  const priorities = ["low", "medium", "high", "critical"];
  const titles = [
    "Issue with event schedule",
    "Abusive chat content",
    "Spam report in comments",
    "Bug: ticket not showing",
    "Late start complaint",
    "Inappropriate media upload",
    "Performance degradation",
    "User harassment claim",
    "Wrong time zone displayed",
    "Duplicate event detected",
    "Mobile layout broken",
    "Payment not confirmed",
    "Certificate not generated",
    "Map pin showing wrong place",
    "Notification sent twice"
  ];
  return Array.from({ length: 40 }).map((_, i) => {
    const status = pick(statuses);
    const priority = pick(priorities);
    const createdOffset = Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 7); // up to 7 days
    const created_at = new Date(now - createdOffset).toISOString();
    const updated_at =
      Math.random() > 0.5
        ? new Date(new Date(created_at).getTime() + Math.random() * 1000 * 60 * 60).toISOString()
        : null;
    return {
      id: i + 1,
      status,
      type: pick(types),
      priority,
      title: pick(titles),
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. " +
        "Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor.",
      reported_by_username: "user" + ((i % 9) + 1),
      user_id: (i % 9) + 1,
      event_id: Math.random() > 0.4 ? Math.floor(Math.random() * 120) + 10 : null,
      created_at,
      updated_at,
      meta: {
        client: "web",
        agent: "Chrome",
        ip: "127.0.0." + ((i % 50) + 1),
        snapshot_ref: "snap-" + (i + 1000),
      },
    };
  });
};

const ReportCenter = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [showFilters, setShowFilters] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastFetched, setLastFetched] = useState(null);

  // Initialize dummy data
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setReports(buildDummyReports());
      setLastFetched(new Date());
      setLoading(false);
    }, 400); // simulate load
  }, []);

  // Manual refresh regenerates the dataset
  const refreshDummy = () => {
    setLoading(true);
    setTimeout(() => {
      setReports(buildDummyReports());
      setLastFetched(new Date());
      setLoading(false);
    }, 350);
  };

  // Auto refresh (simulate)
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => {
      // Light mutation to simulate status progress
      setReports((prev) =>
        prev.map((r) => {
          if (Math.random() > 0.92) {
            const progression = {
              open: "in_review",
              in_review: Math.random() > 0.5 ? "resolved" : "rejected",
              resolved: "resolved",
              rejected: "rejected",
            };
            const newStatus = progression[r.status] || r.status;
            if (newStatus !== r.status) {
              return {
                ...r,
                status: newStatus,
                updated_at: new Date().toISOString(),
              };
            }
          }
          return r;
        })
      );
      setLastFetched(new Date());
    }, 8000);
    return () => clearInterval(id);
  }, [autoRefresh]);

  // Local status update
  const updateStatus = (id, newStatus) => {
    setUpdatingId(id);
    setTimeout(() => {
      setReports((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, status: newStatus, updated_at: new Date().toISOString() }
            : r
        )
      );
      if (selected && selected.id === id) {
        setSelected((s) => ({ ...s, status: newStatus, updated_at: new Date().toISOString() }));
      }
      setUpdatingId(null);
    }, 300);
  };

  const filtered = useMemo(() => {
    return reports
      .filter((r) => (filterStatus === "all" ? true : r.status === filterStatus))
      .filter((r) => (filterType === "all" ? true : r.type === filterType))
      .filter((r) => (filterPriority === "all" ? true : r.priority === filterPriority))
      .filter((r) =>
        search.trim()
          ? (r.title || "").toLowerCase().includes(search.toLowerCase()) ||
            (r.description || "").toLowerCase().includes(search.toLowerCase()) ||
            (r.reported_by_username || "").toLowerCase().includes(search.toLowerCase())
          : true
      )
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [reports, filterStatus, filterType, filterPriority, search]);

  const counts = useMemo(
    () =>
      reports.reduce(
        (acc, r) => {
          acc.total++;
          acc[r.status] = (acc[r.status] || 0) + 1;
          return acc;
        },
        { total: 0 }
      ),
    [reports]
  );

  return (
    <div className="report-center-container">
      <div className="rc-header">
        <div>
          <h1 className="rc-title">Report Center</h1>
          <p className="rc-subtitle">
            Dummy data mode (replace with API later).
          </p>
        </div>
        <div className="rc-header-actions">
          <button className="btn ghost" onClick={refreshDummy} disabled={loading}>
            <FiRefreshCw /> {loading ? "Refreshing..." : "Refresh"}
          </button>
          <button className="btn ghost" onClick={() => setShowFilters((s) => !s)}>
            <FiFilter /> {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
          <label className="rc-autorefresh">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />{" "}
            Auto
          </label>
        </div>
      </div>

      <div className="rc-stats-grid">
        <div className="stat-card">
          <span className="sc-label">Total</span>
            <span className="sc-value">{counts.total}</span>
        </div>
        <div className="stat-card">
          <span className="sc-label">Open</span>
          <span className="sc-value">{counts.open || 0}</span>
        </div>
        <div className="stat-card">
          <span className="sc-label">In Review</span>
          <span className="sc-value">{counts.in_review || 0}</span>
        </div>
        <div className="stat-card">
          <span className="sc-label">Resolved</span>
          <span className="sc-value">{counts.resolved || 0}</span>
        </div>
        <div className="stat-card">
          <span className="sc-label">Rejected</span>
          <span className="sc-value">{counts.rejected || 0}</span>
        </div>
      </div>

      {showFilters && (
        <div className="rc-filters">
          <div className="filter-row">
            <div className="filter-item">
              <label>Status</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">All</option>
                <option value="open">Open</option>
                <option value="in_review">In Review</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="filter-item">
              <label>Type</label>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="all">All</option>
                <option value="event_issue">Event Issue</option>
                <option value="abuse">Abuse</option>
                <option value="spam">Spam</option>
                <option value="bug">Bug</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="filter-item">
              <label>Priority</label>
              <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
                <option value="all">All</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="filter-item search-box">
              <label>Search</label>
              <div className="search-wrapper">
                <FiSearch />
                <input
                  placeholder="Title / user / text..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="rc-table-wrapper">
        <table className="rc-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Status</th>
              <th>Type</th>
              <th>Priority</th>
              <th>Title</th>
              <th>Reported By</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && !loading && (
              <tr>
                <td colSpan={8} className="empty-cell">
                  No reports found
                </td>
              </tr>
            )}
            {filtered.map((r) => (
              <tr key={r.id} className={selected?.id === r.id ? "row-active" : ""}>
                <td>{r.id}</td>
                <td>
                  <span className={`status-chip ${STATUS_COLORS[r.status] || ""}`}>
                    {ICON_FOR_STATUS[r.status] || null} {STATUS_LABEL[r.status] || r.status}
                  </span>
                </td>
                <td>{TYPE_LABEL[r.type] || r.type}</td>
                <td>
                  <span className={`priority-tag p-${r.priority}`}>
                    {PRIORITY_LABEL[r.priority] || r.priority}
                  </span>
                </td>
                <td className="truncate-cell">{r.title || "(untitled)"}</td>
                <td>{r.reported_by_username || r.user_id || "-"}</td>
                <td>{r.created_at ? new Date(r.created_at).toLocaleString() : "-"}</td>
                <td>
                  <button className="btn tiny" onClick={() => setSelected(r)}>
                    <FiEye />
                  </button>
                </td>
              </tr>
            ))}
            {loading && (
              <tr>
                <td colSpan={8} className="loading-cell">
                  Loading...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="rc-modal-overlay" onClick={() => setSelected(null)}>
          <div className="rc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rc-modal-header">
              <h2>
                Report #{selected.id} – {STATUS_LABEL[selected.status] || selected.status}
              </h2>
              <button className="close-btn" onClick={() => setSelected(null)}>
                ×
              </button>
            </div>
            <div className="rc-modal-body">
              <div className="rc-detail-grid">
                <div>
                  <span className="d-label">Title</span>
                  <p>{selected.title || "(untitled)"}</p>
                </div>
                <div>
                  <span className="d-label">Type</span>
                  <p>{TYPE_LABEL[selected.type] || selected.type}</p>
                </div>
                <div>
                  <span className="d-label">Priority</span>
                  <p>{PRIORITY_LABEL[selected.priority] || selected.priority}</p>
                </div>
                <div>
                  <span className="d-label">Status</span>
                  <p>{STATUS_LABEL[selected.status] || selected.status}</p>
                </div>
                <div>
                  <span className="d-label">Reported By</span>
                  <p>{selected.reported_by_username || selected.user_id || "-"}</p>
                </div>
                <div>
                  <span className="d-label">Created At</span>
                  <p>
                    {selected.created_at
                      ? new Date(selected.created_at).toLocaleString()
                      : "-"}
                  </p>
                </div>
                {selected.updated_at && (
                  <div>
                    <span className="d-label">Updated At</span>
                    <p>{new Date(selected.updated_at).toLocaleString()}</p>
                  </div>
                )}
                {selected.event_id && (
                  <div>
                    <span className="d-label">Event ID</span>
                    <p>{selected.event_id}</p>
                  </div>
                )}
              </div>
              <div className="rc-section">
                <span className="d-label">Description</span>
                <div className="rc-desc-box">
                  {selected.description || "No description"}
                </div>
              </div>
              {selected.meta && (
                <div className="rc-section">
                  <span className="d-label">Metadata</span>
                  <pre className="rc-meta-pre">
                    {typeof selected.meta === "string"
                      ? selected.meta
                      : JSON.stringify(selected.meta, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            <div className="rc-modal-footer">
              <div className="rc-status-actions">
                {["open", "in_review", "resolved", "rejected"].map((st) => (
                  <button
                    key={st}
                    disabled={updatingId === selected.id || selected.status === st}
                    className={`btn status-btn ${
                      st === selected.status ? "active" : ""
                    }`}
                    onClick={() => updateStatus(selected.id, st)}
                  >
                    {STATUS_LABEL[st]}
                  </button>
                ))}
              </div>
              <button className="btn secondary" onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rc-footer-info">
        <span>
          Showing {filtered.length} of {reports.length} reports
        </span>
        {lastFetched && (
          <span>Last updated: {lastFetched.toLocaleTimeString()}</span>
        )}
      </div>
    </div>
  );
};

export default ReportCenter;
