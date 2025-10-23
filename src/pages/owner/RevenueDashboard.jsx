import React from 'react';
// Local minimal presentational view (no shared component)

export default function RevenueDashboard() {
  const columns = [
    { key: 'event', label: 'Event' },
    { key: 'revenue', label: 'Revenue' },
    { key: 'period', label: 'Period' },
    { key: 'status', label: 'Status' },
  ];
  const data = [
    { event: 'TechFest', revenue: '₹1.1L', period: 'Sep 2025', status: 'Closed' },
    { event: 'Cultural Night', revenue: '₹42K', period: 'Oct 2025', status: 'Forecast' },
  ];
  const stats = [
    { label: 'MTD', value: '₹1.4L' },
    { label: 'YTD', value: '₹9.6L' },
    { label: 'Avg/ Event', value: '₹18K' },
    { label: 'Refunds', value: '₹3.1K' },
  ];
    return (
      <div>
        <h1>Revenue Dashboard</h1>
        <p>Platform revenue overview (dummy).</p>
        <ul>
          {stats.map((s, i) => (<li key={i}>{s.label}: {s.value}</li>))}
        </ul>
        <table>
          <thead><tr>{columns.map(c => (<th key={c.key}>{c.label}</th>))}</tr></thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx}>{columns.map(c => (<td key={c.key}>{String(row[c.key] ?? '')}</td>))}</tr>
            ))}
          </tbody>
        </table>
      </div>
    );
}
