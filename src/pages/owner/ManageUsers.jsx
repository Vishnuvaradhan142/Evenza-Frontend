import React from 'react';
// Local minimal presentational view (no shared component)

export default function ManageUsers() {
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'registrations', label: 'Registrations' },
    { key: 'status', label: 'Status' },
  ];
  const data = [
    { name: 'Rahul', email: 'rahul@example.com', registrations: 3, status: 'Active' },
    { name: 'Sara', email: 'sara@example.com', registrations: 1, status: 'Active' },
  ];
  const stats = [
    { label: 'Users', value: 2412 },
    { label: 'Active Today', value: 184 },
    { label: 'New (7d)', value: 216 },
    { label: 'Suspended', value: 4 },
  ];
  return (
    <div>
      <h1>Manage Users</h1>
      <p>User management (dummy).</p>
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
