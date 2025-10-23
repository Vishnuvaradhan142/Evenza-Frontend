import React, { useMemo, useState } from 'react';
import { FiSearch, FiDownloadCloud, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import './PaymentDashboard.css';

export default function PaymentDashboard() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [range, setRange] = useState('7d');
  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState('desc');

  const rows = useMemo(
    () => [
      { txn: 'TXN-1022', user: 'Alex', event: 'TechFest', amount: 750, status: 'success', date: '2025-10-20' },
      { txn: 'TXN-1023', user: 'Riya', event: 'Cultural Night', amount: 299, status: 'pending', date: '2025-10-20' },
      { txn: 'TXN-1024', user: 'Mohit', event: 'Design Sprint', amount: 1299, status: 'success', date: '2025-10-19' },
      { txn: 'TXN-1025', user: 'Aisha', event: 'Business Workshop', amount: 999, status: 'failed', date: '2025-10-18' },
      { txn: 'TXN-1026', user: 'Karan', event: 'Hackathon', amount: 499, status: 'refund', date: '2025-10-17' },
    ],
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const dir = sortDir === 'asc' ? 1 : -1;
    const sorted = rows
      .filter(r => (status === 'all' ? true : r.status === status))
      .filter(r =>
        q ? [r.txn, r.user, r.event].some(f => String(f).toLowerCase().includes(q)) : true
      );

    const cmp = (a, b) => {
      if (sortKey === 'event') return a.event.localeCompare(b.event) * dir;
      if (sortKey === 'status') return a.status.localeCompare(b.status) * dir;
      if (sortKey === 'amount') return (a.amount - b.amount) * dir;
      // default date
      return (new Date(a.date) - new Date(b.date)) * dir;
    };
    return [...sorted].sort(cmp);
  }, [rows, status, query, sortKey, sortDir]);

  const totals = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const today = rows.filter(r => r.date === todayStr && r.status === 'success').reduce((s, r) => s + r.amount, 0);
    const success = rows.filter(r => r.status === 'success').reduce((s, r) => s + r.amount, 0);
    const pending = rows.filter(r => r.status === 'pending').length;
    const failed = rows.filter(r => r.status === 'failed').length;
    const refunds = rows.filter(r => r.status === 'refund').length;
    return { today, success, pending, failed, refunds };
  }, [rows]);

  return (
    <div className="payment-dashboard">
      <header className="pd-header">
        <div>
          <h1 className="pd-title">Payments</h1>
          <p className="pd-sub">Revenue, transactions, and payouts (mock data)</p>
        </div>
        <div className="pd-actions">
          <select value={range} onChange={(e) => setRange(e.target.value)}>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button className="btn ghost"><FiDownloadCloud /> Export CSV</button>
        </div>
      </header>

      <section className="pd-stats">
        <div className="pd-stat">
          <span className="lbl">Today</span>
          <span className="val">₹{totals.today.toLocaleString()}</span>
        </div>
        <div className="pd-stat">
          <span className="lbl">All-time Success</span>
          <span className="val">₹{totals.success.toLocaleString()}</span>
        </div>
        <div className="pd-stat">
          <span className="lbl">Pending</span>
          <span className="val">{totals.pending}</span>
        </div>
        <div className="pd-stat">
          <span className="lbl">Failed</span>
          <span className="val">{totals.failed}</span>
        </div>
        <div className="pd-stat">
          <span className="lbl">Refunds</span>
          <span className="val">{totals.refunds}</span>
        </div>
      </section>

      <div className="pd-toolbar">
        <div className="pd-search">
          <FiSearch />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search txn, user or event" />
        </div>
        <div className="pd-filters">
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refund">Refund</option>
          </select>
        </div>
        <div className="pd-sort-group">
          <select value={sortKey} onChange={(e) => setSortKey(e.target.value)} title="Sort by">
            <option value="date">Date</option>
            <option value="event">Event</option>
            <option value="status">Status</option>
            <option value="amount">Amount</option>
          </select>
          <button className="pd-sortdir" onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')} title="Toggle sort direction">
            {sortDir === 'asc' ? <FiArrowUp /> : <FiArrowDown />}
          </button>
        </div>
      </div>

      <div className="pd-table-wrap">
        <table className="pd-table">
          <thead>
            <tr>
              <th>Txn ID</th>
              <th>User</th>
              <th>Event</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td className="empty" colSpan={6}>No transactions</td></tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.txn}>
                  <td>{r.txn}</td>
                  <td>{r.user}</td>
                  <td>{r.event}</td>
                  <td>₹{r.amount.toLocaleString()}</td>
                  <td><span className={`pd-pill ${r.status}`}>{r.status}</span></td>
                  <td>{new Date(r.date).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
