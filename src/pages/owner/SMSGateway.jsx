import React, { useEffect, useState } from "react";
import "./SMSGateway.css";

const STORAGE_KEY = "owner_sms_v1";

const SAMPLE = {
  enabled: false,
  provider: "twilio",
  providers: {
    twilio: { accountSid: "", authToken: "", from: "+10000000000" },
    nexmo: { apiKey: "", apiSecret: "", from: "+10000000000" }
  }
};

export default function SMSGateway() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(SAMPLE);
  const [testPhone, setTestPhone] = useState("");
  const [testMessage, setTestMessage] = useState("Test message from Evenza");
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch("/api/sms/settings");
        if (!res.ok) throw new Error("no api");
        const data = await res.json();
        if (mounted) {
          setSettings(data);
          setLoading(false);
        }
      } catch (e) {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setSettings(JSON.parse(saved));
        setLoading(false);
      }
    };
    load();
    return () => { mounted = false };
  }, []);

  const save = async (next) => {
    setSettings(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    try {
      await fetch("/api/sms/settings", { method: "PUT", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) });
    } catch (e) {
      // swallow; local fallback applied
    }
  };

  const updateProviderField = (provider, key, value) => {
    const next = { ...settings, providers: { ...settings.providers, [provider]: { ...settings.providers[provider], [key]: value } } };
    save(next);
  };

  const toggleEnabled = () => {
    const next = { ...settings, enabled: !settings.enabled };
    save(next);
  };

  const importSettings = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        save(parsed);
        setFeedback({ type: 'success', msg: 'Imported settings' });
      } catch (err) {
        setFeedback({ type: 'error', msg: 'Invalid JSON' });
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const exportSettings = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sms-settings.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const sendTest = async () => {
    if (!testPhone) { setFeedback({ type: 'error', msg: 'Enter phone number' }); return; }
    setFeedback({ type: 'info', msg: 'Sending...' });
    try {
      const res = await fetch('/api/sms/send-test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: testPhone, message: testMessage }) });
      if (!res.ok) throw new Error('failed');
      setFeedback({ type: 'success', msg: 'Test sent (check logs/console)' });
    } catch (e) {
      setFeedback({ type: 'error', msg: 'Send failed (using local fallback)' });
    }
  };

  if (loading) return <div className="sms-container"><h3>Loading SMS Gateway settings…</h3></div>;

  return (
    <div className="sms-container">
      <div className="sms-header">
        <h2>SMS Gateway</h2>
        <div className="sms-controls">
          <label className="switch">
            <input type="checkbox" checked={settings.enabled} onChange={toggleEnabled} />
            <span className="slider" />
          </label>
          <button className="btn" onClick={exportSettings}>Export</button>
          <label className="btn file-btn">
            Import
            <input type="file" accept="application/json" onChange={importSettings} />
          </label>
        </div>
      </div>

      <div className="sms-body">
        <div className="sms-column">
          <h4>Provider</h4>
          <select value={settings.provider} onChange={e=>save({ ...settings, provider: e.target.value })}>
            <option value="twilio">Twilio</option>
            <option value="nexmo">Nexmo (Vonage)</option>
          </select>

          <div className="provider-form">
            {settings.provider === 'twilio' && (
              <>
                <label>Account SID</label>
                <input value={settings.providers.twilio.accountSid} onChange={e=>updateProviderField('twilio','accountSid',e.target.value)} />
                <label>Auth Token</label>
                <input value={settings.providers.twilio.authToken} onChange={e=>updateProviderField('twilio','authToken',e.target.value)} />
                <label>From (E.164)</label>
                <input value={settings.providers.twilio.from} onChange={e=>updateProviderField('twilio','from',e.target.value)} />
              </>
            )}

            {settings.provider === 'nexmo' && (
              <>
                <label>API Key</label>
                <input value={settings.providers.nexmo.apiKey} onChange={e=>updateProviderField('nexmo','apiKey',e.target.value)} />
                <label>API Secret</label>
                <input value={settings.providers.nexmo.apiSecret} onChange={e=>updateProviderField('nexmo','apiSecret',e.target.value)} />
                <label>From</label>
                <input value={settings.providers.nexmo.from} onChange={e=>updateProviderField('nexmo','from',e.target.value)} />
              </>
            )}
          </div>
        </div>

        <div className="sms-column">
          <h4>Test SMS</h4>
          <label>To (E.164)</label>
          <input value={testPhone} onChange={e=>setTestPhone(e.target.value)} placeholder="+15551234567" />
          <label>Message</label>
          <textarea value={testMessage} onChange={e=>setTestMessage(e.target.value)} />
          <div className="sms-actions">
            <button className="btn primary" onClick={sendTest}>Send Test SMS</button>
            <button className="btn" onClick={()=>{ setTestPhone(''); setTestMessage('Test message from Evenza'); setFeedback(null); }}>Reset</button>
          </div>

          {feedback && (
            <div className={`sms-feedback ${feedback.type}`}>{feedback.msg}</div>
          )}
        </div>
      </div>
    </div>
  );
}

