import { useEffect, useRef, useState } from 'react';
import client from '../api/client';
import { useToast } from '../components/Toast';
import { Spinner, EmptyState } from '../components/ui';
import Modal from '../components/Modal';
import PasswordInput from '../components/PasswordInput';

/* ─────────────────────── Constants ─────────────────────── */
const ROLES = [
  'Administrator','DepartmentHead','UGPC','GPC','IPC','SGC',
  'Student','GradStudent','Advisor','Examiner','Guest',
];
const PROGRAMS = ['Undergraduate','Graduate','Staff'];

const ROLE_META = {
  Administrator:  { label:'Admin',        bg:'#ede9fe', color:'#5b21b6' },
  DepartmentHead: { label:'Dept. Head',   bg:'#dbeafe', color:'#1e40af' },
  UGPC:           { label:'UG Coord.',    bg:'#d1fae5', color:'#065f46' },
  GPC:            { label:'G Coord.',     bg:'#ccfbf1', color:'#0f766e' },
  IPC:            { label:'IP Comm.',     bg:'#fef3c7', color:'#92400e' },
  SGC:            { label:'Grad Comm.',   bg:'#fde68a', color:'#78350f' },
  Student:        { label:'Student',      bg:'#e0f2fe', color:'#0369a1' },
  GradStudent:    { label:'Grad Student', bg:'#e0e7ff', color:'#3730a3' },
  Advisor:        { label:'Advisor',      bg:'#fce7f3', color:'#9d174d' },
  Examiner:       { label:'Examiner',     bg:'#f3e8ff', color:'#7e22ce' },
  Guest:          { label:'Guest',        bg:'#f1f5f9', color:'#475569' },
};

// Avatar background colours keyed by user id mod
const AVATAR_COLORS = [
  '#1a5c2a','#1e40af','#9d174d','#7e22ce',
  '#92400e','#0369a1','#065f46','#0f766e',
];

/* ─────────────────────── Sub-components ─────────────────── */

function RolePill({ role }) {
  const m = ROLE_META[role] || ROLE_META.Guest;
  return (
    <span style={{
      background: m.bg, color: m.color,
      fontWeight: 700, fontSize: 11,
      padding: '3px 10px', borderRadius: 999,
      whiteSpace: 'nowrap', letterSpacing: '.02em',
    }}>{m.label}</span>
  );
}

function UserAvatar({ user, size = 40 }) {
  const [broken, setBroken] = useState(false);
  const hasPhoto = !!user?.avatar_url && !broken;
  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase();
  const bg = AVATAR_COLORS[(user?.id || 0) % AVATAR_COLORS.length];

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      overflow: 'hidden', flexShrink: 0,
      background: hasPhoto ? 'transparent' : bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: '2px solid rgba(255,255,255,.9)',
      boxShadow: '0 2px 8px rgba(0,0,0,.15)',
      fontSize: Math.round(size * 0.36), fontWeight: 800, color: '#fff',
    }}>
      {hasPhoto ? (
        <img
          src={user.avatar_url}
          alt={initials}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={() => setBroken(true)}
        />
      ) : initials}
    </div>
  );
}

function Field({ label, required, children, span }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, gridColumn: span ? '1/-1' : undefined }}>
      <label style={{
        fontSize: 11, fontWeight: 700, color: '#374151',
        textTransform: 'uppercase', letterSpacing: '.06em',
      }}>
        {label}{required && <span style={{ color: '#e11d48', marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function emptyForm() {
  return {
    first_name: '', middle_name: '', last_name: '', gender: 'Male',
    id_number: '', email: '', phone: '', program: 'Undergraduate',
    role: 'Student', salutation: '', password: '', password_confirmation: '',
    is_active: true,
  };
}

/* ─────────────────────── Main Component ─────────────────── */

export default function ManageUsers() {
  const toast = useToast();
  const fileRef = useRef(null);

  const [users,       setUsers]       = useState(null);
  const [search,      setSearch]      = useState('');
  const [roleFilter,  setRoleFilter]  = useState('');
  const [modal,       setModal]       = useState(null);
  const [form,        setForm]        = useState(emptyForm());
  const [saving,      setSaving]      = useState(false);
  const [editUser,    setEditUser]    = useState(null); // full user object for edit
  const [avatarPrev,  setAvatarPrev]  = useState(null); // base64 preview
  const [avatarB64,   setAvatarB64]   = useState(null); // base64 to upload
  const [uploadingPic, setUploadingPic] = useState(false);

  useEffect(() => { load(); }, [search, roleFilter]);

  function load() {
    const params = {};
    if (search)     params.search = search;
    if (roleFilter) params.role   = roleFilter;
    client.get('/users', { params })
      .then(({ data }) => setUsers(data))
      .catch(() => setUsers({ data: [] }));
  }

  function openCreate() {
    setForm(emptyForm());
    setEditUser(null);
    setAvatarPrev(null);
    setAvatarB64(null);
    setModal({ mode: 'create' });
  }

  function openEdit(u) {
    setForm({ ...u, password: '', password_confirmation: '' });
    setEditUser(u);
    setAvatarPrev(null);
    setAvatarB64(null);
    setModal({ mode: 'edit', user: u });
  }

  /* Pick a new photo in the edit modal */
  function handlePhotoPick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Select an image file.'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarPrev(ev.target.result);
      setAvatarB64(ev.target.result); // data URI
    };
    reader.readAsDataURL(file);
  }

  /* Upload photo for a specific user (admin action) */
  async function saveUserPhoto() {
    if (!avatarB64 || !editUser) return;
    setUploadingPic(true);
    try {
      const { data } = await client.post(
        `/users/${editUser.id}/avatar`,
        { data: avatarB64 },
        { headers: { 'Content-Type': 'application/json' } }
      );
      // Update the user list so avatar shows immediately
      setUsers((prev) => {
        const updated = { ...prev };
        updated.data = prev.data.map((u) =>
          u.id === editUser.id ? { ...u, avatar_url: data.avatar_url } : u
        );
        return updated;
      });
      setEditUser((eu) => ({ ...eu, avatar_url: data.avatar_url }));
      setAvatarPrev(null);
      setAvatarB64(null);
      toast.success('Profile photo updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Photo upload failed.');
    } finally {
      setUploadingPic(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  /* Remove photo for a specific user */
  async function removeUserPhoto() {
    if (!editUser) return;
    if (!confirm('Remove this user\'s profile photo?')) return;
    try {
      await client.delete(`/users/${editUser.id}/avatar`);
      setUsers((prev) => {
        const updated = { ...prev };
        updated.data = prev.data.map((u) =>
          u.id === editUser.id ? { ...u, avatar_url: null } : u
        );
        return updated;
      });
      setEditUser((eu) => ({ ...eu, avatar_url: null }));
      setAvatarPrev(null);
      setAvatarB64(null);
      toast.success('Profile photo removed.');
    } catch (err) {
      toast.error('Failed to remove photo.');
    }
  }

  async function save() {
    setSaving(true);
    try {
      if (modal.mode === 'create') {
        const { data } = await client.post('/users', form);
        toast.success('User account created!');
        // If a photo was picked during create, upload it now
        if (avatarB64 && data.user?.id) {
          await client.post(`/users/${data.user.id}/avatar`, { data: avatarB64 }, { headers: { 'Content-Type': 'application/json' } });
        }
      } else {
        const payload = { ...form };
        if (!payload.password) { delete payload.password; delete payload.password_confirmation; }
        await client.put(`/users/${modal.user.id}`, payload);
        toast.success('User account updated!');
      }
      setModal(null);
      load();
    } catch (err) {
      const msg = err.response?.data?.message
        || Object.values(err.response?.data?.errors || {})[0]?.[0]
        || 'Operation failed.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  async function destroy(user) {
    if (!confirm(`Delete "${user.first_name} ${user.last_name}"?\nThis cannot be undone.`)) return;
    try {
      await client.delete(`/users/${user.id}`);
      toast.success('User deleted.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete.');
    }
  }

  if (!users) return <Spinner label="Loading users…" />;
  const list = users.data || [];

  /* ── Stats bar ── */
  const byRole = ROLES.reduce((acc, r) => {
    acc[r] = list.filter((u) => u.role === r).length;
    return acc;
  }, {});

  return (
    <div>
      {/* ── Page header ── */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0d2e15', margin: 0 }}>
          Manage Users
        </h2>
        <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>
          {list.length} registered account{list.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* ── Stats pills ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
        {ROLES.filter((r) => byRole[r] > 0).map((r) => {
          const m = ROLE_META[r];
          return (
            <button
              key={r}
              onClick={() => setRoleFilter(roleFilter === r ? '' : r)}
              style={{
                padding: '5px 12px', borderRadius: 999, border: 'none',
                background: roleFilter === r ? m.color : m.bg,
                color: roleFilter === r ? '#fff' : m.color,
                fontWeight: 700, fontSize: 12, cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all .15s',
              }}
            >
              {m.label} <span style={{ opacity: .8 }}>({byRole[r]})</span>
            </button>
          );
        })}
        {roleFilter && (
          <button onClick={() => setRoleFilter('')}
            style={{ padding: '5px 12px', borderRadius: 999, border: '1px solid #e2e8f0', background: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', color: '#64748b' }}>
            ✕ Clear filter
          </button>
        )}
      </div>

      {/* ── Toolbar ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 15 }}>🔍</span>
          <input
            style={{ width: '100%', padding: '10px 14px 10px 38px', border: '1.5px solid #e2e8f0', borderRadius: 12, fontSize: 13, fontFamily: 'inherit', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
            placeholder="Search name, email or ID number…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={openCreate}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', background: 'linear-gradient(135deg, #1a5c2a, #2d7a40)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(26,92,42,.3)', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
        >
          <span style={{ fontSize: 20, lineHeight: 1 }}>＋</span> Add User
        </button>
      </div>

      {/* ── Table ── */}
      <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(26,92,42,.07)', overflow: 'hidden' }}>
        {list.length === 0 ? (
          <div style={{ padding: 48 }}>
            <EmptyState icon="👥" title="No users found" subtitle="Try adjusting your search or filters." />
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #f0f9f4, #f8fafc)' }}>
                  {['', 'User', 'ID Number', 'Role', 'Program', 'Status', 'Actions'].map((h, i) => (
                    <th key={i} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.07em', color: '#64748b', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.map((u, i) => (
                  <tr
                    key={u.id}
                    style={{ borderBottom: i < list.length - 1 ? '1px solid #f1f5f9' : 'none', transition: 'background .1s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fff9')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Avatar */}
                    <td style={{ padding: '10px 8px 10px 16px', width: 52 }}>
                      <UserAvatar user={u} size={42} />
                    </td>

                    {/* Name + email */}
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 13 }}>
                        {u.salutation ? <span style={{ color: '#94a3b8', fontWeight: 500 }}>{u.salutation} </span> : null}
                        {u.first_name} {u.last_name}
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: 11.5, marginTop: 1 }}>{u.email}</div>
                      {u.phone && <div style={{ color: '#cbd5e1', fontSize: 11 }}>{u.phone}</div>}
                    </td>

                    {/* ID */}
                    <td style={{ padding: '10px 14px' }}>
                      <code style={{ background: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: 6, fontSize: 11.5 }}>
                        {u.id_number}
                      </code>
                    </td>

                    {/* Role */}
                    <td style={{ padding: '10px 14px' }}><RolePill role={u.role} /></td>

                    {/* Program */}
                    <td style={{ padding: '10px 14px', color: '#64748b', fontWeight: 500, fontSize: 12 }}>{u.program}</td>

                    {/* Status */}
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: u.is_active ? '#dcfce7' : '#f1f5f9', color: u.is_active ? '#166534' : '#64748b' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: u.is_active ? '#16a34a' : '#94a3b8', display: 'inline-block' }} />
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => openEdit(u)}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', background: '#f0f9f4', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#166534', cursor: 'pointer', fontFamily: 'inherit' }}
                        >✏️ Edit</button>
                        <button
                          onClick={() => destroy(u)}
                          style={{ padding: '6px 10px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
                        >🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Create / Edit Modal ── */}
      <Modal
        open={!!modal}
        title={modal?.mode === 'create' ? '➕ Create User Account' : `✏️ Edit — ${modal?.user?.first_name || ''} ${modal?.user?.last_name || ''}`}
        onClose={() => setModal(null)}
        wide
        footer={
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
            <button
              onClick={save}
              disabled={saving}
              style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #1a5c2a, #2d7a40)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: saving ? .7 : 1 }}
            >
              {saving ? 'Saving…' : modal?.mode === 'create' ? 'Create Account' : 'Save Changes'}
            </button>
          </div>
        }
      >
        {/* ── Photo section (edit only) ── */}
        {modal?.mode === 'edit' && editUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '0 0 18px', borderBottom: '1px solid #f1f5f9', marginBottom: 18 }}>
            {/* Avatar with click-to-change */}
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => fileRef.current?.click()}>
              <UserAvatar user={{ ...editUser, avatar_url: avatarPrev || editUser.avatar_url }} size={68} />
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(26,92,42,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity .2s', fontSize: 20 }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}>
                📷
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoPick} />

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#0d2e15' }}>{editUser.first_name} {editUser.last_name}</div>
              <div style={{ color: '#64748b', fontSize: 13 }}>{editUser.email}</div>
              <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  style={{ padding: '6px 14px', background: '#f0f9f4', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#166534', cursor: 'pointer', fontFamily: 'inherit' }}
                >📷 {editUser.avatar_url ? 'Change Photo' : 'Upload Photo'}</button>

                {avatarB64 && (
                  <button
                    type="button"
                    onClick={saveUserPhoto}
                    disabled={uploadingPic}
                    style={{ padding: '6px 14px', background: 'linear-gradient(135deg, #1a5c2a, #2d7a40)', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', opacity: uploadingPic ? .7 : 1 }}
                  >
                    {uploadingPic ? 'Saving…' : '✓ Save Photo'}
                  </button>
                )}

                {editUser.avatar_url && !avatarB64 && (
                  <button
                    type="button"
                    onClick={removeUserPhoto}
                    style={{ padding: '6px 14px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#be123c', cursor: 'pointer', fontFamily: 'inherit' }}
                  >🗑️ Remove Photo</button>
                )}
              </div>
              {avatarB64 && <p style={{ fontSize: 11, color: '#f59e0b', marginTop: 6 }}>⚠ Click "Save Photo" to apply this photo</p>}
            </div>
          </div>
        )}

        {/* ── For create modal: photo picker ── */}
        {modal?.mode === 'create' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '0 0 16px', borderBottom: '1px solid #f1f5f9', marginBottom: 16 }}>
            <div
              onClick={() => fileRef.current?.click()}
              style={{ width: 60, height: 60, borderRadius: '50%', background: avatarPrev ? 'transparent' : '#e2e8f0', border: '2px dashed #94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 24, overflow: 'hidden' }}
            >
              {avatarPrev ? <img src={avatarPrev} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : '📷'}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoPick} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Profile Photo <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span></div>
              <button type="button" onClick={() => fileRef.current?.click()}
                style={{ marginTop: 6, padding: '5px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', color: '#475569' }}>
                {avatarPrev ? '↻ Change' : '+ Choose photo'}
              </button>
            </div>
          </div>
        )}

        {/* ── Form fields ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="First Name" required>
            <input className="input" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} placeholder="e.g. Melkamu" />
          </Field>
          <Field label="Middle Name">
            <input className="input" value={form.middle_name || ''} onChange={(e) => setForm({ ...form, middle_name: e.target.value })} placeholder="Optional" />
          </Field>
          <Field label="Last Name" required>
            <input className="input" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} placeholder="e.g. Sime" />
          </Field>
          <Field label="Salutation">
            <select className="select" value={form.salutation || ''} onChange={(e) => setForm({ ...form, salutation: e.target.value })}>
              <option value="">None</option>
              {['Mr.','Ms.','Mrs.','Dr.','Prof.'].map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="ID Number" required>
            <input className="input" value={form.id_number} onChange={(e) => setForm({ ...form, id_number: e.target.value })} placeholder="e.g. UGR/70043/14" />
          </Field>
          <Field label="Email" required>
            <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@gmail.com" />
          </Field>
          <Field label="Phone">
            <input className="input" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+251 9xx xxx xxx" />
          </Field>
          <Field label="Gender">
            <select className="select" value={form.gender || 'Male'} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              <option>Male</option><option>Female</option>
            </select>
          </Field>
          <Field label="Program" required>
            <select className="select" value={form.program} onChange={(e) => setForm({ ...form, program: e.target.value })}>
              {PROGRAMS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Role" required>
            <select className="select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {ROLES.map((r) => <option key={r} value={r}>{ROLE_META[r]?.label || r}</option>)}
            </select>
          </Field>
          <Field label={modal?.mode === 'create' ? 'Password *' : 'New Password (leave blank to keep)'}>
            <PasswordInput value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" required={modal?.mode === 'create'} />
          </Field>
          <Field label="Confirm Password">
            <PasswordInput value={form.password_confirmation} onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })} placeholder="Repeat password" />
          </Field>
          <Field label="Account Status" span>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                style={{ width: 16, height: 16, accentColor: '#1a5c2a' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#374151' }}>Account Active</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>Inactive accounts cannot log in</div>
              </div>
            </label>
          </Field>
        </div>
      </Modal>
    </div>
  );
}
