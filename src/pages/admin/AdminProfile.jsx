import React from 'react';
// Local minimal presentational view (no shared component)

export default function AdminProfile() {
  const columns = [
    { key: 'field', label: 'Field' },
    { key: 'value', label: 'Value' },
  ];
  const data = [
    { field: 'Name', value: 'Admin Jane' },
    { field: 'Email', value: 'admin@example.com' },
    { field: 'Role', value: 'Super Admin' },
    { field: 'Phone', value: '+91 98765 43210' },
  ];
  const stats = [
    { label: 'Managed Events', value: 28 },
    { label: 'Teams', value: 4 },
    { label: 'Open Tasks', value: 12 },
    { label: 'Reports', value: 9 },
  ];
  return (
    <div>
      <h1>Admin Profile</h1>
      <p>Profile summary shown with static information.</p>
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
