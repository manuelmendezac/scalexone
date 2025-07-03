import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { FiCopy, FiCheck } from 'react-icons/fi';
import AvatarUploader from './AvatarUploader';
import useNeuroState from '../store/useNeuroState';

const PerfilUsuarioPanel: React.FC = () => {
  const { userInfo } = useNeuroState();
  const [perfil, setPerfil] = useState<any>({});
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [copied, setCopied] = useState(false);
  const [userAuthAvatar, setUserAuthAvatar] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [codigoAfiliado, setCodigoAfiliado] = useState('');

  useEffect(() => {
    async function fetchPerfil() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: usuario } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', user.id)
        .single();
      setPerfil(usuario || {});
      setUsername(usuario?.username || '');
      // Avatar autenticador
      if (user.user_metadata?.avatar_url) {
        setUserAuthAvatar(user.user_metadata.avatar_url);
      } else {
        setUserAuthAvatar('');
      }
    }
    fetchPerfil();
  }, []);

  useEffect(() => {
    async function fetchCodigoAfiliado() {
      if (!userInfo?.id) return;
      const { data: codigo } = await supabase
        .from('codigos_afiliado')
        .select('codigo')
        .eq('user_id', userInfo.id)
        .eq('activo', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (codigo) setCodigoAfiliado(codigo.codigo);
    }
    fetchCodigoAfiliado();
  }, [userInfo?.id]);

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
    if (data && data.id !== perfil.id) {
      setUsernameError('Este nombre de usuario ya está en uso');
      setCheckingUsername(false);
      return false;
    }
    setCheckingUsername(false);
    setUsernameError('');
    return true;
  }

  async function handleUsernameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '');
    setUsername(value);
    await validarUsername(value);
    if (await validarUsername(value)) {
      await supabase.from('usuarios').update({ username: value }).eq('id', perfil.id);
    }
  }

  const handleAvatar = async (url: string) => {
    setPerfil({ ...perfil, avatar_url: url });
    await supabase.from('usuarios').update({ avatar_url: url }).eq('id', perfil.id);
  };

  const handlePasswordChange = async () => {
    setPasswordMsg('');
    if (!newPassword || newPassword.length < 6) {
      setPasswordMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) setPasswordMsg(error.message);
    else setPasswordMsg('¡Contraseña actualizada!');
  };

  // Determinar el avatar a mostrar
  const avatarToShow = perfil.avatar_url || userAuthAvatar || '/images/silueta-perfil.svg';

  return (
    <div className="w-full bg-black rounded-lg shadow-lg md:p-10 p-6 border-2 border-yellow-500 flex flex-col gap-8">
      <h2 className="text-yellow-500 font-bold text-3xl mb-4">Mi Perfil</h2>
      <div className="flex flex-col items-center gap-4 w-full max-w-xs mx-auto lg:mx-0">
        <AvatarUploader
          onUpload={handleAvatar}
          initialUrl={avatarToShow}
          label="Foto de perfil"
        />
        {codigoAfiliado && (
          <div style={{ color: '#FFD700', fontWeight: 500, fontSize: 15, marginTop: 4, textAlign: 'center', wordBreak: 'break-all', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            Tu link de afiliado:
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
              <span style={{ color: '#fff', fontSize: 15 }}>
                https://scalexone.app/afiliado/{codigoAfiliado}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`https://scalexone.app/afiliado/${codigoAfiliado}`);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? '#0f0' : '#FFD700', fontSize: 20 }}
                title="Copiar link"
              >
                {copied ? <FiCheck /> : <FiCopy />}
              </button>
            </div>
            {copied && <span style={{ color: '#0f0', fontSize: 13, marginTop: 2 }}>¡Copiado!</span>}
          </div>
        )}
        <button
          className="bg-yellow-500 text-black font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors w-full mt-4"
          onClick={() => setShowPasswordModal(true)}
        >
          Cambiar contraseña
        </button>
      </div>
      {/* Modal de cambio de contraseña */}
      {showPasswordModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#000a', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#23232b', borderRadius: 16, padding: 32, minWidth: 340, boxShadow: '0 2px 12px #0008', color: '#fff' }}>
            <h3 style={{ color: '#FFD700', fontWeight: 700, fontSize: 22, marginBottom: 18 }}>Cambiar contraseña</h3>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Nueva contraseña" className="input-perfil" />
            <button className="bg-yellow-500 text-black font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors w-full mt-4" onClick={handlePasswordChange}>Actualizar</button>
            {passwordMsg && <div style={{ color: passwordMsg.includes('¡Contraseña') ? '#FFD700' : 'red', marginTop: 10 }}>{passwordMsg}</div>}
            <button className="bg-black text-yellow-500 border border-yellow-500 rounded-lg py-2 px-4 mt-4 w-full" onClick={() => setShowPasswordModal(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerfilUsuarioPanel; 