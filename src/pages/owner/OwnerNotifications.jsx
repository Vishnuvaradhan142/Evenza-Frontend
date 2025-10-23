import React from 'react';
// Local minimal presentational view (no shared component)

export default function OwnerNotifications() {
  const columns = [
    { key: 'time', label: 'Time' },
    { key: 'type', label: 'Type' },
    { key: 'message', label: 'Message' },
    { key: 'status', label: 'Status' },
  ];
  const data = [
    { time: '09:21', type: 'System', message: 'New admin invited', status: 'Delivered' },
    { time: '10:07', type: 'Event', message: 'Event reach milestone', status: 'Delivered' },
  ];
  const stats = [
    { label: 'Unread', value: 5 },
    { label: 'Delivered Today', value: 76 },
    { label: 'Alerts', value: 1 },
    { label: 'Muted', value: 2 },
  ];
  return (
    <div>
      <h1>Notifications</h1>
      <p>Owner notifications (dummy).</p>
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
