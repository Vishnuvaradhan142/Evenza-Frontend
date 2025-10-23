import React from 'react';
// Local minimal presentational view (no shared component)

export default function ReportsIssues() {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status' },
    { key: 'created', label: 'Created' },
  ];
  const data = [
    { id: 'R-1023', type: 'Bug', status: 'Open', created: '2025-09-02' },
    { id: 'R-1024', type: 'Abuse', status: 'In Review', created: '2025-09-02' },
  ];
  const stats = [
    { label: 'Open', value: 11 },
    { label: 'In Review', value: 7 },
    { label: 'Resolved', value: 38 },
    { label: 'Rejected', value: 6 },
  ];
  return (
    <div>
      <h1>Reports & Issues</h1>
      <p>Aggregated reports (dummy).</p>
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
