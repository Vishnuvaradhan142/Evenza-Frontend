import React from 'react';
// Local minimal presentational view (no shared component)

export default function ActivityLogs() {
  const columns = [
    { key: 'time', label: 'Time' },
    { key: 'actor', label: 'Actor' },
    { key: 'action', label: 'Action' },
    { key: 'entity', label: 'Entity' },
  ];
  const data = [
    { time: '09:12', actor: 'Owner Raj', action: 'Updated settings', entity: 'Site' },
    { time: '09:44', actor: 'Anita', action: 'Approved request', entity: 'AdminRequests' },
  ];
  const stats = [
    { label: 'Today', value: 112 },
    { label: 'Admins', value: 8 },
    { label: 'Changes', value: 42 },
    { label: 'Warnings', value: 0 },
  ];
  return (
    <div>
      <h1>Activity Logs</h1>
      <p>Audit events across the platform (dummy).</p>
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
