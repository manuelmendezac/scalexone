import React, { useState } from 'react';
import LevelsSection from './LevelsSection';
import AvatarUploader from '../AvatarUploader';

const perfilDefault = {
  avatar: '',
  nombres: 'Manuel',
  apellidos: 'Méndez',
  correo: 'manuel@email.com',
  celular: '',
  pais: 'Perú',
  redes: { facebook: '', twitter: '', instagram: '' },
  membresia: 'Afiliado',
  rol: 'Afiliado',
  creditos: 250,
  wallet: '',
  idioma: 'Español',
  zonaHoraria: 'GMT-5',
  nivel: 3,
  cursos: ['Curso de Ventas', 'Curso de Marketing'],
  servicios: ['Soporte', 'Mentoría'],
};

function TarjetaResumen({ titulo, valor, subvalor, icono, color }: any) {
  return (
    <div style={{
      background: '#23232b',
      borderRadius: 16,
      padding: 24,
      minWidth: 220,
      minHeight: 110,
      color: '#fff',
      boxShadow: '0 2px 8px #0004',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      border: `2px solid ${color || '#FFD700'}`,
      marginRight: 24,
      marginBottom: 24
    }}>
      <div style={{ fontSize: 18, fontWeight: 600, color: color || '#FFD700', marginBottom: 8 }}>{icono} {titulo}</div>
      <div style={{ fontSize: 32, fontWeight: 700 }}>{valor}</div>
      {subvalor && <div style={{ fontSize: 14, color: '#FFD700', marginTop: 4 }}>{subvalor}</div>}
    </div>
  );
}

export default function AdminConfigPanel({ selected }: { selected: string }) {
  // Simulación de datos de usuario afiliado
  const [perfil, setPerfil] = useState(perfilDefault);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setPerfil({ ...perfil, [e.target.name]: e.target.value });
  };
  const handleRedSocial = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPerfil({ ...perfil, redes: { ...perfil.redes, [e.target.name]: e.target.value } });
  };
  const handleAvatar = (url: string) => {
    setPerfil({ ...perfil, avatar: url });
  };
  const handleGuardar = () => {
    setGuardando(true);
    setTimeout(() => {
      setGuardando(false);
      setMensaje('¡Perfil actualizado correctamente!');
      setTimeout(() => setMensaje(''), 2000);
    }, 1200);
  };

  return (
    <main style={{ flex: 1, padding: 40, background: '#23232b', minHeight: '100vh' }}>
      {selected === 'welcome' && (
        <>
          <div style={{
            background: '#18181b',
            borderRadius: 18,
            padding: 32,
            color: '#fff',
            maxWidth: 700,
            margin: '0 auto',
            boxShadow: '0 2px 12px #0006',
            marginBottom: 32
          }}>
            <h2 style={{ color: '#FFD700', fontWeight: 700, fontSize: 26, marginBottom: 18 }}>Mi Perfil</h2>
            <div style={{ display: 'flex', gap: 32, alignItems: 'center', marginBottom: 24 }}>
              <AvatarUploader onUpload={handleAvatar} initialUrl={perfil.avatar} label="Foto de perfil" />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <input name="nombres" value={perfil.nombres} onChange={handleInput} placeholder="Nombres" style={inputEstilo} />
                  <input name="apellidos" value={perfil.apellidos} onChange={handleInput} placeholder="Apellidos" style={inputEstilo} />
                </div>
                <input name="correo" value={perfil.correo} onChange={handleInput} placeholder="Correo" style={{ ...inputEstilo, marginTop: 10 }} />
                <input name="celular" value={perfil.celular} onChange={handleInput} placeholder="Celular" style={{ ...inputEstilo, marginTop: 10 }} />
                <select name="pais" value={perfil.pais} onChange={handleInput} style={{ ...inputEstilo, marginTop: 10 }}>
                  <option value="Perú">Perú</option>
                  <option value="México">México</option>
                  <option value="Colombia">Colombia</option>
                  <option value="Argentina">Argentina</option>
                  <option value="Chile">Chile</option>
                  <option value="España">España</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <input name="facebook" value={perfil.redes.facebook} onChange={handleRedSocial} placeholder="Facebook" style={inputEstilo} />
              <input name="twitter" value={perfil.redes.twitter} onChange={handleRedSocial} placeholder="Twitter" style={inputEstilo} />
              <input name="instagram" value={perfil.redes.instagram} onChange={handleRedSocial} placeholder="Instagram" style={inputEstilo} />
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <select name="membresia" value={perfil.membresia} onChange={handleInput} style={inputEstilo}>
                <option value="Afiliado">Afiliado</option>
                <option value="Premium">Premium</option>
                <option value="Free">Free</option>
              </select>
              <input name="rol" value={perfil.rol} readOnly style={{ ...inputEstilo, background: '#23232b', color: '#FFD700', fontWeight: 700 }} />
              <input name="creditos" value={perfil.creditos} readOnly style={{ ...inputEstilo, background: '#23232b', color: '#FFD700', fontWeight: 700 }} />
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <input name="wallet" value={perfil.wallet} onChange={handleInput} placeholder="Wallet (opcional)" style={inputEstilo} />
              <select name="idioma" value={perfil.idioma} onChange={handleInput} style={inputEstilo}>
                <option value="Español">Español</option>
                <option value="Inglés">Inglés</option>
              </select>
              <select name="zonaHoraria" value={perfil.zonaHoraria} onChange={handleInput} style={inputEstilo}>
                <option value="GMT-5">GMT-5</option>
                <option value="GMT-6">GMT-6</option>
                <option value="GMT-3">GMT-3</option>
                <option value="GMT-8">GMT-8</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <input name="nivel" value={perfil.nivel} readOnly style={{ ...inputEstilo, background: '#23232b', color: '#FFD700', fontWeight: 700 }} />
              <input name="cursos" value={perfil.cursos.join(', ')} readOnly style={{ ...inputEstilo, background: '#23232b', color: '#FFD700', fontWeight: 700 }} />
              <input name="servicios" value={perfil.servicios.join(', ')} readOnly style={{ ...inputEstilo, background: '#23232b', color: '#FFD700', fontWeight: 700 }} />
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
              <button style={botonEstilo} onClick={() => alert('Funcionalidad de cambio de contraseña próximamente')}>Cambiar contraseña</button>
            </div>
            <button style={botonGuardarEstilo} onClick={handleGuardar} disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar cambios'}</button>
            {mensaje && <div style={{ color: '#FFD700', marginTop: 12, fontWeight: 600 }}>{mensaje}</div>}
          </div>
        </>
      )}
      {selected === 'levels' && <LevelsSection />}
      {selected === 'channels' && <div style={{ color: '#fff' }}>Canales (aquí irá la gestión de canales)</div>}
      {selected === 'mainMenu' && <div style={{ color: '#fff' }}>Menú Principal (aquí irá la configuración del menú principal)</div>}
      {selected === 'members' && <div style={{ color: '#fff' }}>Miembros (aquí irá la gestión de miembros)</div>}
      {selected === 'events' && <div style={{ color: '#fff' }}>Eventos (aquí irá la gestión de eventos)</div>}
      {selected === 'chats' && <div style={{ color: '#fff' }}>Chats (aquí irá la gestión de chats)</div>}
      {selected === 'affiliates' && <div style={{ color: '#fff' }}>Afiliados (aquí irá la gestión de afiliados)</div>}
      {selected === 'payments' && <div style={{ color: '#fff' }}>Métodos de Cobro (aquí irá la gestión de métodos de cobro)</div>}
      {selected === 'salesHistory' && <div style={{ color: '#fff' }}>Historial de Ventas (aquí irá el historial de ventas)</div>}
      {selected === 'transactions' && <div style={{ color: '#fff' }}>Transacciones (aquí irá la gestión de transacciones)</div>}
      {selected === 'cryptoTransactions' && <div style={{ color: '#fff' }}>Transacciones Crypto (aquí irá la gestión de transacciones cripto)</div>}
      {selected === 'profile' && <div style={{ color: '#fff' }}>Perfil (aquí irá la configuración del perfil)</div>}
      {selected === 'account' && <div style={{ color: '#fff' }}>Cuenta (aquí irá la configuración de la cuenta)</div>}
      {selected === 'password' && <div style={{ color: '#fff' }}>Contraseña (aquí irá el cambio de contraseña)</div>}
      {selected === 'paymentHistory' && <div style={{ color: '#fff' }}>Historial de Pagos (aquí irá el historial de pagos)</div>}
      {selected === 'invites' && <div style={{ color: '#fff' }}>Invitados (aquí irá la gestión de invitados)</div>}
      {selected === 'commissions' && <div style={{ color: '#fff' }}>Comisiones (aquí irá la gestión de comisiones)</div>}
      {selected === 'wallet' && <div style={{ color: '#fff' }}>Billetera (aquí irá la gestión de la billetera)</div>}
      {selected === 'domain' && <div style={{ color: '#fff' }}>Dominio (aquí irá la configuración del dominio personalizado)</div>}
      {selected === 'about' && <div style={{ color: '#fff' }}>Página Pública (aquí irá la edición de la página pública de la comunidad)</div>}
    </main>
  );
}

const inputEstilo = {
  background: '#23232b',
  color: '#fff',
  border: '1.5px solid #FFD700',
  borderRadius: 8,
  padding: '10px 14px',
  fontSize: 16,
  marginBottom: 0,
  outline: 'none',
  width: '100%',
  fontWeight: 500,
};
const botonEstilo = {
  background: '#FFD700',
  color: '#18181b',
  border: 'none',
  borderRadius: 8,
  padding: '10px 18px',
  fontWeight: 700,
  fontSize: 16,
  cursor: 'pointer',
  boxShadow: '0 2px 8px #FFD70044',
};
const botonGuardarEstilo = {
  ...botonEstilo,
  width: '100%',
  marginTop: 8,
  fontSize: 18,
}; 