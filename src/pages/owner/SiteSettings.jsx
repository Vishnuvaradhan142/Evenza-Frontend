import React from 'react';
// Local minimal presentational view (no shared component)

export default function SiteSettings() {
  const columns = [
    { key: 'setting', label: 'Setting' },
    { key: 'value', label: 'Value' },
    { key: 'scope', label: 'Scope' },
  ];
  const data = [
    { setting: 'Brand Name', value: 'Evenza', scope: 'Global' },
    { setting: 'Timezone', value: 'IST (UTC+5:30)', scope: 'Global' },
  ];
  const stats = [
    { label: 'Groups', value: 9 },
    { label: 'Overridden', value: 2 },
    { label: 'Warnings', value: 0 },
    { label: 'Version', value: '1.0.0' },
  ];
  return (
    <div>
      <h1>Site Settings</h1>
      <p>Global platform settings (dummy).</p>
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
