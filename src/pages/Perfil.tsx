import React, { useState, useEffect, useRef } from 'react';
import useNeuroState from '../store/useNeuroState';
import { supabase } from '../supabase';

const Perfil = () => {
  const { userName, userInfo, avatarUrl, setAvatarUrl } = useNeuroState();
  const [showChangePass, setShowChangePass] = useState(false);
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  // Username
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [checkingUsername, setCheckingUsername] = useState(false);
  const usernameInputRef = useRef<HTMLInputElement>(null);

  // Simulación de tipo de suscripción
  const tipoSuscripcion = 'Free'; // Cambia esto según tu lógica

  // Validación de contraseña fuerte
  const isStrongPassword = (pass: string) =>
    pass.length >= 8 && /[A-Z]/.test(pass) && /[a-z]/.test(pass) && /[0-9]/.test(pass);

  const handleChangePass = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!isStrongPassword(newPass)) {
      setError('La contraseña debe tener al menos 8 caracteres, mayúsculas, minúsculas y números.');
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) setError(error.message);
    else setSuccess('Contraseña actualizada');
    setShowChangePass(false);
    setNewPass('');
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!newEmail.includes('@') || !newEmail.includes('.')) {
      setError('Ingresa un correo válido.');
      return;
    }
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) setError(error.message);
    else setSuccess('Correo actualizado, revisa tu email para confirmar.');
    setShowChangeEmail(false);
    setNewEmail('');
  };

  // Autogenerar username si está vacío
  useEffect(() => {
    async function fetchUsername() {
      if (!userInfo?.id) return;
      const { data: usuario } = await supabase
        .from('usuarios')
        .select('username, name')
        .eq('id', userInfo.id)
        .single();
      if (usuario) {
        if (!usuario.username) {
          // Generar username base
          let base = (usuario.name || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 16);
          let uname = base;
          let intento = 0;
          while (true) {
            const { data } = await supabase
              .from('usuarios')
              .select('id')
              .eq('username', uname)
              .single();
            if (!data || data.id === userInfo.id) break;
            intento++;
            uname = base + intento;
          }
          setUsername(uname);
          await supabase.from('usuarios').update({ username: uname }).eq('id', userInfo.id);
        } else {
          setUsername(usuario.username);
        }
      }
    }
    fetchUsername();
    // eslint-disable-next-line
  }, [userInfo?.id]);

  // Validar unicidad de username
  async function validarUsername(uname: string) {
    setCheckingUsername(true);
    setUsernameError('');
    if (!uname) {
      setUsernameError('Elige un nombre de usuario');
      setCheckingUsername(false);
      return false;
    }
    const { data } = await supabase
      .from('usuarios')
      .select('id')
      .eq('username', uname)
      .single();
    if (data && data.id !== userInfo.id) {
      setUsernameError('Este nombre de usuario ya está en uso');
      setCheckingUsername(false);
      return false;
    }
    setCheckingUsername(false);
    setUsernameError('');
    return true;
  }

  // Guardar username al cambiar
  async function handleUsernameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '');
    setUsername(value);
    await validarUsername(value);
    // Guardar automáticamente si es válido
    if (await validarUsername(value)) {
      await supabase.from('usuarios').update({ username: value }).eq('id', userInfo.id);
    }
  }

  useEffect(() => {
    setAvatarUrl('');
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#0a1a2f', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 420, background: '#181828', borderRadius: 16, padding: 32, boxShadow: '0 0 32px #0ff2', color: '#fff', margin: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
          <img src={avatarUrl || '/avatar.png'} alt="avatar" style={{ width: 90, height: 90, borderRadius: '50%', border: '3px solid #0ff', marginBottom: 12, objectFit: 'cover' }} />
          <div style={{ fontSize: 22, fontWeight: 700, color: '#0ff', marginBottom: 4, textAlign: 'center' }}>{userName}</div>
          <div style={{ fontSize: 15, color: '#b6eaff', marginBottom: 2, textAlign: 'center' }}>{userInfo.email}</div>
          {/* Username editable y link de afiliado */}
          <input
            ref={usernameInputRef}
            className="input-perfil mt-2"
            placeholder="Nombre de usuario único"
            value={username}
            onChange={handleUsernameChange}
            maxLength={32}
            style={{ borderColor: usernameError ? 'red' : '#0ff', marginTop: 12, marginBottom: 4, width: '100%', padding: 8, borderRadius: 6, border: '1.5px solid', background: '#23272F', color: '#fff', fontSize: 15 }}
          />
          {usernameError && <span style={{ color: 'red', fontSize: 13 }}>{usernameError}</span>}
          <div style={{ color: '#0ff', fontWeight: 500, fontSize: 15, marginTop: 4 }}>
            Tu link de afiliado:<br />
            <span style={{ color: '#fff' }}>https://scalexone.app/afiliado/{username || 'usuario'}</span>
          </div>
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
          <button onClick={() => { setShowChangePass(v => !v); setShowChangeEmail(false); setError(''); setSuccess(''); }} style={{ width: '100%', background: '#23272F', color: '#0ff', border: 'none', borderRadius: 6, padding: 10, fontWeight: 600, fontSize: 15, marginBottom: 8, cursor: 'pointer' }}>
            Cambiar contraseña
          </button>
          {showChangePass && (
            <form onSubmit={handleChangePass} style={{ marginBottom: 8, transition: 'all 0.3s', background: '#181828', borderRadius: 8, padding: 10 }}>
              <div style={{ position: 'relative', marginBottom: 8 }}>
                <input type={showPass ? 'text' : 'password'} placeholder="Nueva contraseña" value={newPass} onChange={e => setNewPass(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 6, border: 'none', background: '#23272F', color: '#fff', fontSize: 15 }} required />
                <span onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: 12, top: 10, cursor: 'pointer', color: '#0ff', fontSize: 18 }}>{showPass ? '🙈' : '👁️'}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" disabled={!isStrongPassword(newPass)} style={{ flex: 1, background: isStrongPassword(newPass) ? '#0ff' : '#444', color: isStrongPassword(newPass) ? '#000' : '#888', border: 'none', borderRadius: 6, padding: 10, fontWeight: 700, fontSize: 15, cursor: isStrongPassword(newPass) ? 'pointer' : 'not-allowed' }}>Actualizar</button>
                <button type="button" onClick={() => { setShowChangePass(false); setNewPass(''); setError(''); setSuccess(''); }} style={{ flex: 1, background: '#23272F', color: '#0ff', border: '1px solid #0ff', borderRadius: 6, padding: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>Cancelar</button>
              </div>
              <div style={{ fontSize: 12, color: isStrongPassword(newPass) ? '#0f0' : '#ff8080', marginTop: 4 }}>
                La contraseña debe tener al menos 8 caracteres, mayúsculas, minúsculas y números.
              </div>
            </form>
          )}
          <button onClick={() => { setShowChangeEmail(v => !v); setShowChangePass(false); setError(''); setSuccess(''); }} style={{ width: '100%', background: '#23272F', color: '#0ff', border: 'none', borderRadius: 6, padding: 10, fontWeight: 600, fontSize: 15, marginBottom: 8, cursor: 'pointer' }}>
            Cambiar correo electrónico
          </button>
          {showChangeEmail && (
            <form onSubmit={handleChangeEmail} style={{ marginBottom: 8, transition: 'all 0.3s', background: '#181828', borderRadius: 8, padding: 10 }}>
              <input type="email" placeholder="Nuevo correo" value={newEmail} onChange={e => setNewEmail(e.target.value)} style={{ width: '100%', marginBottom: 8, padding: 8, borderRadius: 6, border: 'none', background: '#23272F', color: '#fff', fontSize: 15 }} required />
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" disabled={!newEmail.includes('@') || !newEmail.includes('.')} style={{ flex: 1, background: newEmail.includes('@') && newEmail.includes('.') ? '#0ff' : '#444', color: newEmail.includes('@') && newEmail.includes('.') ? '#000' : '#888', border: 'none', borderRadius: 6, padding: 10, fontWeight: 700, fontSize: 15, cursor: newEmail.includes('@') && newEmail.includes('.') ? 'pointer' : 'not-allowed' }}>Actualizar</button>
                <button type="button" onClick={() => { setShowChangeEmail(false); setNewEmail(''); setError(''); setSuccess(''); }} style={{ flex: 1, background: '#23272F', color: '#0ff', border: '1px solid #0ff', borderRadius: 6, padding: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>Cancelar</button>
              </div>
            </form>
          )}
        </div>
        {error && <div style={{ color: 'red', marginBottom: 8, textAlign: 'center', fontWeight: 600 }}>{error}</div>}
        {success && <div style={{ color: '#0f0', marginBottom: 8, textAlign: 'center', fontWeight: 600 }}>{success}</div>}
      </div>
    </div>
  );
};

export default Perfil; 