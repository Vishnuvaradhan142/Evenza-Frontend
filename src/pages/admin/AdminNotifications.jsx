import React from 'react';
// Local minimal presentational view (no shared component)

export default function AdminNotifications() {
  const columns = [
    { key: 'time', label: 'Time' },
    { key: 'type', label: 'Type' },
    { key: 'message', label: 'Message' },
    { key: 'status', label: 'Status' },
  ];
  const data = [
    { time: '09:21', type: 'System', message: 'Daily digest generated', status: 'Delivered' },
    { time: '10:07', type: 'Event', message: 'Schedule updated: TechFest', status: 'Delivered' },
    { time: '10:33', type: 'User', message: 'New registration: John Doe', status: 'Unread' },
  ];
  const stats = [
    { label: 'Unread', value: 7 },
    { label: 'Delivered Today', value: 142 },
    { label: 'Alerts', value: 3 },
    { label: 'Muted', value: 5 },
  ];
  return (
    <div>
      <h1>Notifications</h1>
      <p>Centralized notification center with static examples.</p>
      {stats.length > 0 && (
        <ul>
          {stats.map((s, i) => (
            <li key={i}>{s.label}: {s.value}</li>
          ))}
        </ul>
      )}
      <table>
        <thead>
          <tr>
            {columns.map(c => <th key={c.key}>{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              {columns.map(c => <td key={c.key}>{String(row[c.key] ?? '')}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
