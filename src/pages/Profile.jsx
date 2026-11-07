import { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { RoleBadge } from '../components/ui';
import client from '../api/client';

const ROLE_LABELS = {
  Administrator:'Administrator', DepartmentHead:'Department Head',
  UGPC:'UG Coordinator', GPC:'G Coordinator', IPC:'IP Committee',
  SGC:'Graduate Committee', Student:'Student', GradStudent:'Grad Student',
  Advisor:'Advisor', Examiner:'Examiner', Guest:'Guest',
};

const GLASS = {
  background: 'rgba(5,20,10,.65)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,.08)',
  borderRadius: 16,
};

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [preview,   setPreview]   = useState(null);
  const [uploading, setUploading] = useState(false);
  const [removing,  setRemoving]  = useState(false);
  const [dragOver,  setDragOver]  = useState(false);

  function handleFileClick() { fileInputRef.current?.click(); }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function handleDrop(e) {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  function processFile(file) {
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file.'); return; }
    if (file.size > 4 * 1024 * 1024)     { toast.error('Image must be smaller than 4 MB.'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
    uploadFile(file);
  }

  async function uploadFile(file) {
    setUploading(true);
    try {
      const base64 = await fileToBase64(file);
      const { data } = await client.post('/avatar', { data: base64 }, { headers: { 'Content-Type': 'application/json' } });
      const avatarUrl = data.avatar_url.includes('?t=') ? data.avatar_url : `${data.avatar_url}?t=${Date.now()}`;
      refreshUser({ ...user, avatar_url: avatarUrl });
      setPreview(null);
      toast.success('Profile photo updated!');
    } catch (err) {
      setPreview(null);
      toast.error(err.response?.data?.message || 'Upload failed — make sure the backend server is running.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('Could not read file.'));
      reader.readAsDataURL(file);
    });
  }

  async function removePhoto() {
    if (!confirm('Remove your profile photo?')) return;
    setRemoving(true);
    try {
      await client.delete('/avatar');
      refreshUser({ ...user, avatar_url: null });
      setPreview(null);
      toast.success('Profile photo removed.');
    } catch { toast.error('Could not remove photo.'); }
    finally { setRemoving(false); }
  }

  const displayPhoto = preview || user?.avatar_url;
  const initials     = user?.initials || 'U';

  return (
    <div>
      <div className="page-head">
        <h2>👤 My Profile</h2>
        <p>View your account details and manage your profile photo.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 18, alignItems: 'start' }}>

        {/* ── Left: Photo card ── */}
        <div style={{ ...GLASS, padding: 24, textAlign: 'center' }}>

          {/* Avatar circle */}
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
            <div
              onClick={handleFileClick}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              style={{
                width: 140, height: 140, borderRadius: '50%', overflow: 'hidden',
                cursor: 'pointer', position: 'relative',
                border: dragOver ? '3px dashed #c8a800' : '3px solid rgba(200,168,0,.4)',
                background: displayPhoto ? 'transparent' : 'linear-gradient(135deg, #1a5c2a, #2d7a40)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all .2s',
                transform: dragOver ? 'scale(1.04)' : 'scale(1)',
                boxShadow: '0 0 30px rgba(200,168,0,.2), 0 8px 24px rgba(0,0,0,.4)',
              }}
            >
              {displayPhoto
                ? <img src={displayPhoto} alt="Profile" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                : <span style={{ color:'#fff', fontSize:42, fontWeight:800 }}>{initials}</span>}

              {/* Hover overlay */}
              <div style={{
                position:'absolute', inset:0, borderRadius:'50%',
                background:'rgba(0,0,0,.55)',
                display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                opacity:0, transition:'opacity .2s', color:'#fff', fontSize:12, fontWeight:700, gap:4,
              }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
              >
                <span style={{ fontSize:24 }}>📷</span>
                <span>Change Photo</span>
              </div>
            </div>

            {/* Camera badge */}
            {uploading ? (
              <div style={{ position:'absolute', bottom:4, right:4, width:32, height:32, borderRadius:'50%', background:'var(--green)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(0,0,0,.4)' }}>
                <div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin .7s linear infinite' }} />
              </div>
            ) : (
              <div onClick={handleFileClick} style={{ position:'absolute', bottom:4, right:4, width:32, height:32, borderRadius:'50%', background:'var(--green)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(0,0,0,.4)', fontSize:15, border:'2px solid rgba(200,168,0,.4)' }}>
                📷
              </div>
            )}
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleFileChange} />

          {/* Name */}
          <h3 style={{ fontSize:18, fontWeight:800, color:'#fff', margin:'0 0 4px' }}>
            {user?.salutation && <span style={{ color:'rgba(226,240,232,.5)', fontWeight:400 }}>{user.salutation} </span>}
            {user?.first_name} {user?.last_name}
          </h3>
          <p style={{ fontSize:12.5, color:'rgba(200,168,0,.8)', margin:'0 0 12px' }}>{user?.email}</p>
          <div style={{ marginBottom:6 }}><RoleBadge role={user?.role} /></div>
          <div className="badge badge-slate" style={{ marginBottom:18 }}>{user?.program}</div>

          {/* Buttons */}
          <button className="btn btn-primary btn-block" onClick={handleFileClick} disabled={uploading} style={{ marginBottom:8 }}>
            {uploading ? <>
              <span style={{ display:'inline-block', width:14, height:14, border:'2px solid rgba(255,255,255,.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin .7s linear infinite' }} />
              Uploading…
            </> : <>📷 {user?.avatar_url ? 'Change Photo' : 'Upload Photo'}</>}
          </button>
          {user?.avatar_url && (
            <button className="btn btn-ghost btn-block" onClick={removePhoto} disabled={removing} style={{ color:'#fb7185', borderColor:'rgba(159,18,57,.4)' }}>
              {removing ? 'Removing…' : '🗑️ Remove Photo'}
            </button>
          )}

          {/* Tips */}
          <div style={{ marginTop:16, padding:'12px', background:'rgba(255,255,255,.04)', borderRadius:10, border:'1px dashed rgba(255,255,255,.1)', fontSize:11.5, color:'rgba(226,240,232,.45)', lineHeight:1.7, textAlign:'left' }}>
            <strong style={{ color:'rgba(200,168,0,.7)' }}>Tips:</strong><br />
            • Click the photo or the button above<br />
            • Or drag &amp; drop an image onto the photo<br />
            • JPG, PNG, GIF or WEBP · Max 4 MB<br />
            • Square photos look best
          </div>
        </div>

        {/* ── Right: Account details ── */}
        <div style={{ ...GLASS, padding: 24 }}>
          <h3 style={{ fontSize:15, fontWeight:800, color:'#fff', marginBottom:20, paddingBottom:14, borderBottom:'1px solid rgba(255,255,255,.07)' }}>
            Account Details
          </h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <DetailField label="First Name"      value={user?.first_name} />
            <DetailField label="Middle Name"     value={user?.middle_name || '—'} />
            <DetailField label="Last Name"       value={user?.last_name} />
            <DetailField label="Gender"          value={user?.gender || '—'} />
            <DetailField label="ID Number"       value={user?.id_number} mono />
            <DetailField label="Email"           value={user?.email} />
            <DetailField label="Phone"           value={user?.phone || '—'} />
            <DetailField label="Salutation"      value={user?.salutation || '—'} />
            <DetailField label="Program"         value={user?.program} />
            <DetailField label="Role"            value={ROLE_LABELS[user?.role] || user?.role} />
            <DetailField label="Account Status"  value={user?.is_active ? '✅ Active' : '❌ Inactive'} />
          </div>

          <div style={{ marginTop:22, padding:'14px 16px', background:'rgba(30,64,175,.12)', borderRadius:12, border:'1px solid rgba(30,64,175,.25)', fontSize:13, color:'rgba(147,197,253,.85)' }}>
            <strong>ℹ️ Note:</strong> To update your account details (name, email, password), please contact the <strong>System Administrator</strong>.
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function DetailField({ label, value, mono }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
      <span style={{ fontSize:10.5, fontWeight:800, textTransform:'uppercase', letterSpacing:'.07em', color:'rgba(226,240,232,.35)' }}>
        {label}
      </span>
      <span style={{ fontSize:13.5, fontWeight:700, color:'#fff', fontFamily: mono ? 'monospace' : 'inherit' }}>
        {value || '—'}
      </span>
    </div>
  );
}
