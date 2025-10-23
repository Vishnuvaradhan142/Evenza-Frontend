import React from 'react';
// Local minimal presentational view (no shared component)

export default function SMSGateway() {
  const columns = [
    { key: 'provider', label: 'Provider' },
    { key: 'senderId', label: 'Sender ID' },
    { key: 'status', label: 'Status' },
    { key: 'messages', label: 'Messages (30d)' },
  ];
  const data = [
    { provider: 'Twilio', senderId: 'EVENZA', status: 'Active', messages: 1840 },
    { provider: 'MSG91', senderId: 'EVENZA', status: 'Standby', messages: 0 },
  ];
  const stats = [
    { label: 'Providers', value: 2 },
    { label: 'Delivered (30d)', value: 1780 },
    { label: 'Failed (30d)', value: 22 },
    { label: 'Cost (30d)', value: '₹1,240' },
  ];
  return (
    <div>
      <h1>SMS Gateway</h1>
      <p>SMS providers and status (dummy).</p>
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
