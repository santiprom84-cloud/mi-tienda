'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// ─── Sub-components ───────────────────────────────────────────────────────────
function SectionTitle({ icon, title }) {
  return (
    <div className="flex items-center gap-2 border-b border-gray-700 pb-4">
      <span className="text-xl">{icon}</span>
      <h2 className="text-lg font-black text-white">{title}</h2>
    </div>
  );
}

function SaveBar({ saving, msg, label }) {
  return (
    <div className="pt-2 flex flex-col gap-3">
      {msg && (
        <div className={`px-4 py-3 rounded-xl text-sm font-bold text-center border ${
          msg.type === 'ok'
            ? 'bg-green-900/40 text-green-400 border-green-800'
            : 'bg-red-900/40 text-red-400 border-red-800'
        }`}>{msg.text}</div>
      )}
      <button
        type="submit"
        disabled={saving}
        className="w-full bg-[#FF9980] hover:bg-[#ff8060] text-gray-900 font-black py-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
      >
        {saving ? 'Guardando…' : label}
      </button>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pendiente: 'bg-yellow-900/50 text-yellow-400 border-yellow-800',
    pagado:    'bg-green-900/50  text-green-400  border-green-800',
    enviado:   'bg-blue-900/50   text-blue-400   border-blue-800',
  };
  const labels = { pendiente: 'Pendiente', pagado: 'Pagado / Preparando', enviado: 'Enviado 🚚' };
  return (
    <span className={`border px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${map[status] || 'bg-gray-700 text-gray-300 border-gray-600'}`}>
      {labels[status] || status}
    </span>
  );
}

const formatDate = (d) =>
  new Date(d).toLocaleDateString('es-AR', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

export default function PerfilPage() {
  const { user, loadingAuth, logout } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('personal');

  // Profile data
  const [profile, setProfile] = useState({
    full_name: '', dni: '', phone: '', address: '',
    city: '', postal_code: '', bio: '', avatar_url: '',
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile,    setAvatarFile]    = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState(null);

  // Orders
  const [orders,        setOrders]        = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPwd,  setConfirmPwd]  = useState('');
  const [savingPwd,   setSavingPwd]   = useState(false);
  const [msgPwd,      setMsgPwd]      = useState(null);

  // Auth guard: redirige si no hay sesión
  useEffect(() => {
    if (!loadingAuth && !user) {
      router.push('/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loadingAuth]);

  // Carga datos del perfil y pedidos cuando el user está disponible
  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchOrders();
    } else if (!loadingAuth) {
      // No hay usuario y auth ya terminó: salimos del loading
      setLoadingProfile(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loadingAuth]);

  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      const { data } = await supabase
        .from('perfiles').select('*').eq('id', user.id).single();
      if (data) {
        setProfile({
          full_name:   data.full_name   || '',
          dni:         data.dni         || '',
          phone:       data.phone       || '',
          address:     data.address     || '',
          city:        data.city        || '',
          postal_code: data.postal_code || '',
          bio:         data.bio         || '',
          avatar_url:  data.avatar_url  || '',
        });
        if (data.avatar_url) setAvatarPreview(data.avatar_url);
      }
    } catch { /* perfil vacío */ }
    finally { setLoadingProfile(false); }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const { data } = await supabase
        .from('pedidos').select('*').eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setOrders(data || []);
    } catch { /* sin pedidos */ }
    finally { setLoadingOrders(false); }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return profile.avatar_url;
    const ext  = avatarFile.name.split('.').pop();
    const path = `${user.id}.${ext}`;
    const { error } = await supabase.storage
      .from('avatars').upload(path, avatarFile, { upsert: true });
    if (error) throw new Error('No se pudo subir la foto: ' + error.message);
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
    return publicUrl;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg(null);
    try {
      const avatar_url = await uploadAvatar();
      const { error } = await supabase.from('perfiles')
        .upsert({ id: user.id, ...profile, avatar_url, updated_at: new Date() });
      if (error) throw error;
      setProfile((p) => ({ ...p, avatar_url }));
      setAvatarFile(null);
      setMsg({ type: 'ok', text: '✅ Perfil guardado con éxito.' });
    } catch (err) {
      setMsg({ type: 'err', text: '❌ ' + err.message });
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(null), 4000);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPwd) {
      setMsgPwd({ type: 'err', text: '❌ Las contraseñas no coinciden.' }); return;
    }
    if (newPassword.length < 6) {
      setMsgPwd({ type: 'err', text: '❌ Mínimo 6 caracteres.' }); return;
    }
    setSavingPwd(true); setMsgPwd(null);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setMsgPwd({ type: 'ok', text: '✅ Contraseña actualizada.' });
      setNewPassword(''); setConfirmPwd('');
    } catch (err) {
      setMsgPwd({ type: 'err', text: '❌ ' + err.message });
    } finally {
      setSavingPwd(false);
      setTimeout(() => setMsgPwd(null), 4000);
    }
  };

  // Muestra spinner mientras auth o datos del perfil están cargando
  if (loadingAuth || (user && loadingProfile)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-[#FF9980]" />
        <p className="text-[#FF9980] font-bold animate-pulse">Cargando tu perfil…</p>
      </div>
    );
  }
  if (!user) return null;

  const tabs = [
    { id: 'personal',  label: 'Personal',   icon: '👤' },
    { id: 'envio',     label: 'Envío',       icon: '📦' },
    { id: 'pedidos',   label: 'Mis Pedidos', icon: '🛍️' },
    { id: 'seguridad', label: 'Seguridad',   icon: '🔒' },
  ];

  const initials = profile.full_name
    ? profile.full_name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : user.email[0].toUpperCase();

  const inputCls = "w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-[#FF9980] transition-colors";
  const labelCls = "block text-[#FF9980] font-black text-xs uppercase tracking-wider mb-1.5";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-24">

      {/* ── HEADER CARD ──────────────────────────────────────────── */}
      <div className="bg-gray-800 rounded-3xl border border-gray-700 shadow-2xl overflow-hidden mb-5">
        <div className="h-1.5 bg-gradient-to-r from-[#FF9980]/20 via-[#FF9980] to-[#FF9980]/20" />

        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 px-6 sm:px-8 pt-7 pb-6">

          {/* Avatar con upload */}
          <div className="relative group shrink-0 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#FF9980]/60 shadow-lg">
              {avatarPreview
                ? <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-gray-700 flex items-center justify-center text-3xl font-black text-[#FF9980]">{initials}</div>
              }
            </div>
            <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white text-xs font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Cambiar foto
            </div>
            {avatarFile && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#FF9980] rounded-full border-2 border-gray-800" />}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          {/* Info */}
          <div className="text-center sm:text-left flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight truncate">
              {profile.full_name || 'Mi Panel'}
            </h1>
            <p className="text-gray-400 text-sm font-mono mt-0.5 truncate">{user.email}</p>
            {profile.bio && <p className="text-gray-500 text-sm mt-1.5 italic line-clamp-1">"{profile.bio}"</p>}
          </div>

          {/* Logout */}
          <button
            onClick={async () => { await logout(); router.push('/'); }}
            className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-red-950/50 text-gray-400 hover:text-red-400 border border-gray-700 hover:border-red-500/40 transition-all text-sm font-bold"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Cerrar Sesión
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-gray-700 overflow-x-auto scrollbar-hide">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 min-w-fit flex items-center justify-center gap-2 py-3.5 px-4 text-sm font-bold transition-all whitespace-nowrap
                ${activeTab === t.id
                  ? 'text-[#FF9980] border-b-2 border-[#FF9980] bg-gray-900/40'
                  : 'text-gray-500 hover:text-gray-300 border-b-2 border-transparent'}`}
            >
              <span className="text-base">{t.icon}</span>
              <span className="hidden sm:block">{t.label}</span>
              {t.id === 'pedidos' && orders.length > 0 && (
                <span className="bg-[#FF9980] text-gray-900 text-xs font-black rounded-full w-5 h-5 flex items-center justify-center">{orders.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENT CARD ─────────────────────────────────────────── */}
      <div className="bg-gray-800 rounded-3xl border border-gray-700 shadow-xl overflow-hidden">

        {/* TAB: PERSONAL */}
        {activeTab === 'personal' && (
          <form onSubmit={handleSave} className="p-6 sm:p-8 flex flex-col gap-5">
            <SectionTitle icon="👤" title="Datos Personales" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Nombre y Apellido</label>
                <input type="text" value={profile.full_name} onChange={(e) => setProfile((p) => ({...p, full_name: e.target.value}))} placeholder="Juan García" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>DNI / CUIL</label>
                <input type="text" value={profile.dni} onChange={(e) => setProfile((p) => ({...p, dni: e.target.value}))} placeholder="20123456789" className={inputCls} />
              </div>
            </div>

            <div>
              <label className={labelCls}>Teléfono / WhatsApp</label>
              <input type="tel" value={profile.phone} onChange={(e) => setProfile((p) => ({...p, phone: e.target.value}))} placeholder="+54 9 351 123-4567" className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Nota para el equipo (opcional)</label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile((p) => ({...p, bio: e.target.value}))}
                rows={3}
                placeholder="Ej: Dejar en portería, timbre 3B, llamar antes de enviar…"
                className={`${inputCls} resize-none`}
              />
            </div>

            <SaveBar saving={saving} msg={msg} label="Guardar Datos Personales" />
          </form>
        )}

        {/* TAB: ENVÍO */}
        {activeTab === 'envio' && (
          <form onSubmit={handleSave} className="p-6 sm:p-8 flex flex-col gap-5">
            <SectionTitle icon="📦" title="Dirección de Envío" />

            <div>
              <label className={labelCls}>Calle y Número</label>
              <input type="text" value={profile.address} onChange={(e) => setProfile((p) => ({...p, address: e.target.value}))} placeholder="Av. Colón 1234, Depto 5B" className={inputCls} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Ciudad / Barrio</label>
                <input type="text" value={profile.city} onChange={(e) => setProfile((p) => ({...p, city: e.target.value}))} placeholder="Córdoba" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Código Postal</label>
                <input type="text" value={profile.postal_code} onChange={(e) => setProfile((p) => ({...p, postal_code: e.target.value}))} placeholder="5000" className={inputCls} />
              </div>
            </div>

            <div className="bg-blue-950/40 border border-blue-900/50 rounded-2xl p-4 text-sm text-blue-300 flex gap-3">
              <span className="text-xl shrink-0">💡</span>
              <span>Esta dirección se completará automáticamente en el checkout para agilizar tus compras.</span>
            </div>

            <SaveBar saving={saving} msg={msg} label="Guardar Dirección" />
          </form>
        )}

        {/* TAB: PEDIDOS */}
        {activeTab === 'pedidos' && (
          <div className="p-6 sm:p-8">
            <SectionTitle icon="🛍️" title="Historial de Compras" />

            {loadingOrders ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-[#FF9980]" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 bg-gray-900/50 rounded-2xl border border-dashed border-gray-700 mt-4">
                <span className="text-6xl block mb-4 opacity-40">🛒</span>
                <h3 className="text-xl font-bold text-gray-300 mb-2">Aún no tenés pedidos</h3>
                <p className="text-gray-500 text-sm">Cuando realices tu primera compra aparecerá aquí.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 mt-4 max-h-[520px] overflow-y-auto pr-1">
                {orders.map((order) => (
                  <div key={order.id} className="bg-gray-900 p-5 rounded-2xl border border-gray-700 hover:border-[#FF9980]/40 transition-colors">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
                      <div>
                        <p className="text-gray-500 text-xs font-mono">Orden #{order.id.split('-')[0].toUpperCase()}</p>
                        <p className="text-gray-200 font-bold text-sm">{formatDate(order.created_at)}</p>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="border-t border-gray-800 pt-3 flex justify-between items-center">
                      <span className="text-gray-500 text-sm">
                        <span className="text-gray-200 font-bold">{order.items?.length || 0}</span> productos
                      </span>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Total</p>
                        <p className="text-lg font-black text-[#FF9980]">${Number(order.total).toLocaleString('es-AR')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: SEGURIDAD */}
        {activeTab === 'seguridad' && (
          <div className="p-6 sm:p-8 flex flex-col gap-8">
            {/* Cambiar contraseña */}
            <form onSubmit={handlePasswordChange} className="flex flex-col gap-5">
              <SectionTitle icon="🔒" title="Cambiar Contraseña" />

              <div>
                <label className={labelCls}>Nueva Contraseña</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} placeholder="Mínimo 6 caracteres" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Repetir Nueva Contraseña</label>
                <input type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} minLength={6} placeholder="Repetí la contraseña" className={inputCls} />
              </div>

              {msgPwd && (
                <div className={`px-4 py-3 rounded-xl text-sm font-bold text-center border ${
                  msgPwd.type === 'ok' ? 'bg-green-900/40 text-green-400 border-green-800' : 'bg-red-900/40 text-red-400 border-red-800'
                }`}>{msgPwd.text}</div>
              )}

              <button type="submit" disabled={savingPwd || !newPassword} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-black py-3.5 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                {savingPwd ? 'Actualizando…' : 'Actualizar Contraseña'}
              </button>
            </form>

            {/* Email info */}
            <div className="border-t border-gray-700 pt-6">
              <SectionTitle icon="📧" title="Correo Electrónico" />
              <div className="mt-4 bg-gray-900 border border-gray-700 rounded-2xl px-5 py-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Email registrado</p>
                  <p className="text-gray-200 font-semibold text-sm">{user.email}</p>
                </div>
                <span className="bg-green-900/50 text-green-400 border border-green-800 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">Verificado ✓</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

