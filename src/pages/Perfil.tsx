import React, { useState } from 'react';
import useNeuroState from '../store/useNeuroState';
import { supabase } from '../supabase';

const Perfil = () => {
  const { userName, userInfo, avatarUrl } = useNeuroState();
  const [showChangePass, setShowChangePass] = useState(false);
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Simulación de tipo de suscripción
  const tipoSuscripcion = 'Free'; // Cambia esto según tu lógica

  const handleChangePass = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) setError(error.message);
    else setSuccess('Contraseña actualizada');
    setShowChangePass(false);
    setNewPass('');
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) setError(error.message);
    else setSuccess('Correo actualizado, revisa tu email para confirmar.');
    setShowChangeEmail(false);
    setNewEmail('');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a1a2f', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 420, background: '#181828', borderRadius: 16, padding: 32, boxShadow: '0 0 32px #0ff2', color: '#fff', margin: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
          <img src={avatarUrl || '/avatar.png'} alt="avatar" style={{ width: 90, height: 90, borderRadius: '50%', border: '3px solid #0ff', marginBottom: 12, objectFit: 'cover' }} />
          <div style={{ fontSize: 22, fontWeight: 700, color: '#0ff', marginBottom: 4, textAlign: 'center' }}>{userName}</div>
          <div style={{ fontSize: 15, color: '#b6eaff', marginBottom: 2, textAlign: 'center' }}>{userInfo.email}</div>
        </div>
        <div style={{ background: '#10131e', borderRadius: 10, padding: 16, marginBottom: 18 }}>
          <div style={{ fontWeight: 600, color: '#9EFFC9', marginBottom: 6 }}>Tipo de suscripción</div>
          <div style={{ fontWeight: 700, color: tipoSuscripcion === 'Free' ? '#0ff' : '#FFD700' }}>{tipoSuscripcion}</div>
          <button style={{ marginTop: 10, width: '100%', background: '#0ff', color: '#000', border: 'none', borderRadius: 6, padding: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
            Mejorar mi plan
          </button>
        </div>
        <div style={{ background: '#10131e', borderRadius: 10, padding: 16, marginBottom: 18 }}>
          <div style={{ fontWeight: 600, color: '#9EFFC9', marginBottom: 6 }}>Seguridad</div>
          <button onClick={() => setShowChangePass(v => !v)} style={{ width: '100%', background: '#23272F', color: '#0ff', border: 'none', borderRadius: 6, padding: 10, fontWeight: 600, fontSize: 15, marginBottom: 8, cursor: 'pointer' }}>
            Cambiar contraseña
          </button>
          {showChangePass && (
            <form onSubmit={handleChangePass} style={{ marginBottom: 8 }}>
              <input type="password" placeholder="Nueva contraseña" value={newPass} onChange={e => setNewPass(e.target.value)} style={{ width: '100%', marginBottom: 8, padding: 8, borderRadius: 6, border: 'none', background: '#181828', color: '#fff' }} required />
              <button type="submit" style={{ width: '100%', background: '#0ff', color: '#000', border: 'none', borderRadius: 6, padding: 8, fontWeight: 700, fontSize: 15 }}>Actualizar</button>
            </form>
          )}
          <button onClick={() => setShowChangeEmail(v => !v)} style={{ width: '100%', background: '#23272F', color: '#0ff', border: 'none', borderRadius: 6, padding: 10, fontWeight: 600, fontSize: 15, marginBottom: 8, cursor: 'pointer' }}>
            Cambiar correo electrónico
          </button>
          {showChangeEmail && (
            <form onSubmit={handleChangeEmail} style={{ marginBottom: 8 }}>
              <input type="email" placeholder="Nuevo correo" value={newEmail} onChange={e => setNewEmail(e.target.value)} style={{ width: '100%', marginBottom: 8, padding: 8, borderRadius: 6, border: 'none', background: '#181828', color: '#fff' }} required />
              <button type="submit" style={{ width: '100%', background: '#0ff', color: '#000', border: 'none', borderRadius: 6, padding: 8, fontWeight: 700, fontSize: 15 }}>Actualizar</button>
            </form>
          )}
        </div>
        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        {success && <div style={{ color: '#0f0', marginBottom: 8 }}>{success}</div>}
      </div>
    </div>
  );
};

export default Perfil; 