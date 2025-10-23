import React from 'react';

export default function EventsAnalytics() {
  const columns = [
    { key: 'metric', label: 'Metric' },
    { key: 'value', label: 'Value' },
    { key: 'period', label: 'Period' },
  ];
  const data = [
    { metric: 'Total Registrations', value: 6230, period: 'Last 30 days' },
    { metric: 'Avg Engagement', value: '68%', period: 'Last 30 days' },
  ];
  const stats = [
    { label: 'Events (30d)', value: 41 },
    { label: 'Revenue (30d)', value: '₹3.2L' },
    { label: 'Active Users', value: 1240 },
    { label: 'Satisfaction', value: '4.6/5' },
  ];
    return (
      <div>
        <h1>Events Analytics</h1>
        <p>Analytics for your events (dummy).</p>
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
