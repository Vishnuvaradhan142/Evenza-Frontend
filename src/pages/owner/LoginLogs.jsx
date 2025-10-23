import React from 'react';
// Local minimal presentational view (no shared component)

export default function LoginLogs() {
  const columns = [
    { key: 'time', label: 'Time' },
    { key: 'user', label: 'User' },
    { key: 'ip', label: 'IP' },
    { key: 'status', label: 'Status' },
  ];
  const data = [
    { time: '09:01', user: 'owner@evenza', ip: '10.0.0.12', status: 'OK' },
    { time: '09:22', user: 'admin@evenza', ip: '10.0.0.15', status: 'OK' },
  ];
  const stats = [
    { label: 'Today', value: 84 },
    { label: 'Failed', value: 2 },
    { label: 'Unique IPs', value: 17 },
    { label: 'MFA Enabled', value: 'Yes' },
  ];
  return (
    <div>
      <h1>Login Logs</h1>
      <p>Recent logins (dummy).</p>
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
