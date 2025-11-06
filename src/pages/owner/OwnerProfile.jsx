import React, { useEffect, useState } from 'react';
import API from '../../api';
import './OwnerProfile.css';

const KEY = 'owner_profile_v1';

export default function OwnerProfile(){
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    organization: '',
    phone: '',
    avatar: '',
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwords, setPasswords] = useState({ current:'', new:'', confirm:'' });
  const [message, setMessage] = useState(null);

  useEffect(()=>{
    let mounted = true;
    (async ()=>{
      setLoading(true);
      try{
        const res = await API.get('/owner/profile').catch(()=>null);
        if(!mounted) return;
        if(res && res.data) return setProfile(res.data);
        const raw = localStorage.getItem(KEY);
        if(raw) setProfile(JSON.parse(raw));
        else setProfile({ name:'Owner Name', email:'owner@example.com', organization:'My Organization', phone:'', avatar:'' });
      }catch(e){/* ignore */}
      finally{ setLoading(false); }
    })();
    return ()=> mounted = false;
  },[]);

  useEffect(()=>{
    localStorage.setItem(KEY, JSON.stringify(profile));
  }, [profile]);

  const onSave = async ()=>{
    setLoading(true); setMessage(null);
    try{
      await API.put('/owner/profile', profile).catch(()=>null);
      setEditing(false);
      setMessage({type:'success', text:'Profile saved'});
    }catch(e){ setMessage({type:'error', text:'Save failed'}); }
    finally{ setLoading(false); }
  };

  const onAvatarChange = (file)=>{
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ()=> setProfile(p=> ({...p, avatar: reader.result}));
    reader.readAsDataURL(file);
  };

  const onPasswordChange = async ()=>{
    if(passwords.new !== passwords.confirm){ setMessage({type:'error', text:'New passwords do not match'}); return; }
    try{ await API.post('/owner/change-password', passwords).catch(()=>null); setPasswordOpen(false); setMessage({type:'success', text:'Password updated'}); }
    catch(e){ setMessage({type:'error', text:'Password update failed'}); }
  };

  const recentActivity = [
    { id:1, text:'Published event "Spring Meetup"', at:'2025-09-10' },
    { id:2, text:'Updated theme variables', at:'2025-09-05' },
    { id:3, text:'Approved 3 reviews', at:'2025-08-30' },
  ];

  return (
    <div className="op-page">
      <div className="op-header">
        <div>
          <h2>Profile</h2>
          <p className="muted">Manage your account and organization settings.</p>
        </div>
        <div className="op-actions">
          {!editing && <button className="btn" onClick={()=> setEditing(true)}>Edit profile</button>}
          <button className="btn" onClick={()=> setPasswordOpen(true)}>Change password</button>
        </div>
      </div>

      <div className="op-grid">
        <section className="card op-left">
          <div className="avatar-row">
            <div className="avatar-wrap">
              {profile.avatar ? <img src={profile.avatar} alt="avatar"/> : <div className="avatar-fallback">{(profile.name||'O').charAt(0)}</div>}
            </div>
            <div className="avatar-controls">
              <label className="btn small">
                Upload
                <input type="file" accept="image/*" onChange={e=> onAvatarChange(e.target.files && e.target.files[0])} style={{display:'none'}} />
              </label>
              <button className="btn small" onClick={()=> setProfile(p=> ({...p, avatar:''}))}>Remove</button>
            </div>
          </div>

          <div className="fields">
            <label>Name</label>
            <input value={profile.name} onChange={e=> setProfile(p=> ({...p, name:e.target.value}))} disabled={!editing} />

            <label>Email</label>
            <input value={profile.email} onChange={e=> setProfile(p=> ({...p, email:e.target.value}))} disabled={!editing} />

            <label>Organization</label>
            <input value={profile.organization} onChange={e=> setProfile(p=> ({...p, organization:e.target.value}))} disabled={!editing} />

            <label>Phone</label>
            <input value={profile.phone} onChange={e=> setProfile(p=> ({...p, phone:e.target.value}))} disabled={!editing} />

            <div className="row" style={{marginTop:12}}>
              {editing ? (
                <>
                  <button className="btn" onClick={onSave} disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
                  <button className="btn" onClick={()=> setEditing(false)}>Cancel</button>
                </>
              ) : (
                <button className="btn" onClick={()=> setEditing(true)}>Edit</button>
              )}
            </div>

            {message && <div className={`op-msg ${message.type}`}>{message.text}</div>}
          </div>
        </section>

        <aside className="card op-right">
          <h4>Recent activity</h4>
          <ul className="activity-list">
            {recentActivity.map(a=> (
              <li key={a.id}><div className="act-text">{a.text}</div><div className="act-date muted">{a.at}</div></li>
            ))}
          </ul>
          <hr/>
          <div className="help muted">Profile information is used across events, invoices and notifications.</div>
        </aside>
      </div>

      {passwordOpen && (
        <div className="op-modal">
          <div className="op-modal-card">
            <h3>Change password</h3>
            <label>Current password</label>
            <input type="password" value={passwords.current} onChange={e=> setPasswords(s=> ({...s, current:e.target.value}))} />
            <label>New password</label>
            <input type="password" value={passwords.new} onChange={e=> setPasswords(s=> ({...s, new:e.target.value}))} />
            <label>Confirm new password</label>
            <input type="password" value={passwords.confirm} onChange={e=> setPasswords(s=> ({...s, confirm:e.target.value}))} />
            <div className="row">
              <button className="btn" onClick={()=> setPasswordOpen(false)}>Cancel</button>
              <button className="btn" onClick={onPasswordChange}>Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
