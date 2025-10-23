import React from 'react';
// Local minimal presentational view (no shared component)

export default function OwnerProfile() {
  const columns = [
    { key: 'field', label: 'Field' },
    { key: 'value', label: 'Value' },
  ];
  const data = [
    { field: 'Name', value: 'Owner Raj' },
    { field: 'Email', value: 'owner@evenza' },
    { field: 'Organization', value: 'Evenza HQ' },
  ];
  const stats = [
    { label: 'Teams', value: 5 },
    { label: 'Owned Events', value: 41 },
    { label: 'Members', value: 32 },
    { label: 'Open Tasks', value: 14 },
  ];
  return (
    <div>
      <h1>Owner Profile</h1>
      <p>Static profile overview.</p>
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
