import React, { useEffect, useMemo, useState } from 'react';
import './RevenueDashboard.css';
import API from '../../api';

// Small inline sparkline renderer from numeric array -> SVG polyline
function Sparkline({ data = [], color = '#2563eb', width = 220, height = 48 }){
  if(!data || data.length===0) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = width / Math.max(1, data.length - 1);
  const points = data.map((v,i)=> {
    const x = Math.round(i * step);
    const y = Math.round(height - ((v - min)/range) * height);
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg className="spark" viewBox={`0 0 ${width} ${height}`} width={width} height={height} preserveAspectRatio="none" aria-hidden>
      <polyline fill="none" stroke={color} strokeWidth="2" points={points} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function RevenueDashboard(){
  const [loading, setLoading] = useState(false);
  const [series, setSeries] = useState([]); // monthly revenue numbers
  const [invoices, setInvoices] = useState([]);

  useEffect(()=>{
    let mounted = true;
    (async ()=>{
      setLoading(true);
      try{
        // attempt to fetch revenue series from API; fallback to sample
        const res = await API.get('/reports/revenue').catch(()=>null);
        if(!mounted) return;
        if(res && Array.isArray(res.data) && res.data.length>0){
          setSeries(res.data.map(r=> r.value));
          setInvoices(res.data.map((r,i)=> ({ id:i+1, date:r.month, amount:r.value })));
        } else {
          const sample = [12000, 15800, 13200, 18600, 21400, 19800, 23500, 26200, 24800, 28000, 30000, 32800];
          setSeries(sample);
          setInvoices(sample.map((v,i)=> ({ id:i+1, date: `${i+1}/2025`, amount:v })));
        }
      }catch(e){
        // fallback
      }finally{ setLoading(false); }
    })();
    return ()=> mounted=false;
  },[]);

  const total = useMemo(()=> series.reduce((a,b)=> a+b, 0), [series]);
  const avg = useMemo(()=> series.length ? Math.round(total/series.length) : 0, [series,total]);

  const exportCSV = ()=>{
    const header = ['id','date','amount'].join(',');
    const rows = invoices.map(r=> [r.id, `"${r.date}"`, r.amount].join(','));
    const csv = [header,...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `revenue-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="rd-page">
      <header className="rd-header">
        <div>
          <h2>Revenue Dashboard</h2>
          <p className="muted">Overview of monthly revenue and invoices</p>
        </div>
        <div className="rd-actions">
          <button className="btn export" onClick={exportCSV}>Export CSV</button>
        </div>
      </header>

      <section className="rd-grid">
        <div className="rd-card kpi">
          <div className="kpi-label">Total revenue (YTD)</div>
          <div className="kpi-value">${total.toLocaleString()}</div>
          <div className="kpi-meta">Average / month: ${avg.toLocaleString()}</div>
        </div>

        <div className="rd-card chart">
          <div className="card-head">Monthly revenue</div>
          <div className="chart-body">
            {loading ? <div className="loading">Loading...</div> : (
              <Sparkline data={series} />
            )}
          </div>
        </div>

        <div className="rd-card list">
          <div className="card-head">Recent invoices</div>
          <div className="list-body">
            {invoices.map(inv=> (
              <div className="inv" key={inv.id}>
                <div className="inv-left">
                  <div className="inv-date">{inv.date}</div>
                  <div className="inv-id muted-small">#{inv.id}</div>
                </div>
                <div className="inv-right">${inv.amount.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
