import React, { useState, useEffect } from 'react';
import LevelsSection from './LevelsSection';
import AvatarUploader from '../AvatarUploader';
import { supabase } from '../../supabase';
import { useMenuSecundarioConfig } from '../../hooks/useMenuSecundarioConfig';
import useNeuroState from '../../store/useNeuroState';
import SecondNavbar from '../SecondNavbar';

const perfilDefault = {
  avatar: '',
  nombres: '',
  apellidos: '',
  correo: '',
  celular: '',
  pais: 'Perú',
  facebook: '',
  twitter: '',
  instagram: '',
  tiktok: '',
  membresia: '',
  rol: '',
  creditos: 0,
  wallet: '',
  idioma: 'Español',
  zona_horaria: 'GMT-5',
  nivel: 1,
  cursos: [],
  servicios: [],
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
  const [perfil, setPerfil] = useState(perfilDefault);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [cursosActivos, setCursosActivos] = useState<any[]>([]);
  const [serviciosActivos, setServiciosActivos] = useState<any[]>([]); // Dummy por ahora
  const { userInfo } = useNeuroState();
  const community_id = userInfo?.community_id || null;
  const isAdmin = userInfo?.rol === 'admin' || userInfo?.rol === 'superadmin';
  const { menuConfig, loading: menuLoading, error, saveMenuConfig } = useMenuSecundarioConfig(community_id);

  // Leer datos reales del usuario
  useEffect(() => {
    async function fetchPerfil() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      // Leer datos de la tabla usuarios
      const { data: usuario } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', user.id)
        .single();
      if (usuario) {
        setPerfil({
          avatar: usuario.avatar_url || '',
          nombres: usuario.nombres || '',
          apellidos: usuario.apellidos || '',
          correo: usuario.email || '',
          celular: usuario.celular || '',
          pais: usuario.pais || 'Perú',
          facebook: usuario.facebook || '',
          twitter: usuario.twitter || '',
          instagram: usuario.instagram || '',
          tiktok: usuario.tiktok || '',
          membresia: usuario.membresia || '',
          rol: usuario.rol || '',
          creditos: usuario.creditos || 0,
          wallet: usuario.wallet || '',
          idioma: usuario.idioma || 'Español',
          zona_horaria: usuario.zona_horaria || 'GMT-5',
          nivel: usuario.nivel || 1,
          cursos: usuario.cursos || [],
          servicios: usuario.servicios || [],
        });
      }
      // Leer cursos activos (join usuario_curso y cursos)
      const { data: cursosUsuario } = await supabase
        .from('usuario_curso')
        .select('curso_id, estado, cursos:curso_id (nombre, descripcion, imagen)')
        .eq('usuario_id', user.id)
        .eq('estado', 'activo');
      setCursosActivos(cursosUsuario?.map((c: any) => c.cursos) || []);
      // Dummy servicios activos
      setServiciosActivos(usuario?.servicios || []);
      setLoading(false);
    }
    if (selected === 'welcome') fetchPerfil();
  }, [selected]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setPerfil({ ...perfil, [e.target.name]: e.target.value });
  };
  const handleArrayInput = (e: React.ChangeEvent<HTMLInputElement>, key: 'cursos' | 'servicios') => {
    setPerfil({ ...perfil, [key]: e.target.value.split(',').map(s => s.trim()) });
  };
  const handleAvatar = async (url: string) => {
    setPerfil({ ...perfil, avatar: url });
    // Guardar avatar en Supabase
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('usuarios').update({ avatar_url: url }).eq('id', user.id);
    }
  };
  const handleGuardar = async () => {
    setGuardando(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('usuarios').update({
        nombres: perfil.nombres,
        apellidos: perfil.apellidos,
        celular: perfil.celular,
        pais: perfil.pais,
        facebook: perfil.facebook,
        twitter: perfil.twitter,
        instagram: perfil.instagram,
        tiktok: perfil.tiktok,
        membresia: perfil.membresia,
        wallet: perfil.wallet,
        idioma: perfil.idioma,
        zona_horaria: perfil.zona_horaria,
        cursos: perfil.cursos,
        servicios: perfil.servicios,
      }).eq('id', user.id);
      setMensaje('¡Perfil actualizado correctamente!');
      setTimeout(() => setMensaje(''), 2000);
    }
    setGuardando(false);
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

  return (
    <main style={{ flex: 1, padding: 0, background: '#23232b', minHeight: '100vh' }}>
      {selected === 'welcome' && (
        <div style={{ width: '100%', padding: '40px 0', background: '#23232b' }}>
          <div style={{ width: '100%', maxWidth: 1400, margin: '0 auto', background: '#18181b', borderRadius: 18, boxShadow: '0 2px 12px #0006', padding: 40 }}>
            <h2 style={{ color: '#FFD700', fontWeight: 700, fontSize: 28, marginBottom: 28 }}>Mi Perfil</h2>
            {loading ? <div style={{ color: '#FFD700', fontWeight: 600 }}>Cargando...</div> : (
              <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 40, alignItems: 'flex-start', marginBottom: 32 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
                  <AvatarUploader onUpload={handleAvatar} initialUrl={perfil.avatar} label="Foto de perfil" />
                  <button style={botonEstilo} onClick={() => setShowPasswordModal(true)}>Cambiar contraseña</button>
                </div>
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
                    <input name="nombres" value={perfil.nombres} onChange={handleInput} placeholder="Nombres" style={inputEstilo} />
                    <input name="apellidos" value={perfil.apellidos} onChange={handleInput} placeholder="Apellidos" style={inputEstilo} />
                    <input name="correo" value={perfil.correo} readOnly style={{ ...inputEstilo, background: '#23232b', color: '#FFD700', fontWeight: 700 }} />
                    <input name="celular" value={perfil.celular} onChange={handleInput} placeholder="Celular" style={inputEstilo} />
                    <select name="pais" value={perfil.pais} onChange={handleInput} style={inputEstilo}>
                      <option value="Perú">Perú</option>
                      <option value="México">México</option>
                      <option value="Colombia">Colombia</option>
                      <option value="Argentina">Argentina</option>
                      <option value="Chile">Chile</option>
                      <option value="España">España</option>
                      <option value="Otro">Otro</option>
                    </select>
                    <select name="idioma" value={perfil.idioma} onChange={handleInput} style={inputEstilo}>
                      <option value="Español">Español</option>
                      <option value="Inglés">Inglés</option>
                    </select>
                    <select name="zona_horaria" value={perfil.zona_horaria} onChange={handleInput} style={inputEstilo}>
                      <option value="GMT-5">GMT-5</option>
                      <option value="GMT-6">GMT-6</option>
                      <option value="GMT-3">GMT-3</option>
                      <option value="GMT-8">GMT-8</option>
                    </select>
                    <input name="wallet" value={perfil.wallet} onChange={handleInput} placeholder="Wallet (opcional)" style={inputEstilo} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 18, marginBottom: 18 }}>
                    <input name="facebook" value={perfil.facebook} onChange={handleInput} placeholder="Facebook" style={inputEstilo} />
                    <input name="twitter" value={perfil.twitter} onChange={handleInput} placeholder="Twitter" style={inputEstilo} />
                    <input name="instagram" value={perfil.instagram} onChange={handleInput} placeholder="Instagram" style={inputEstilo} />
                    <input name="tiktok" value={perfil.tiktok} onChange={handleInput} placeholder="TikTok" style={inputEstilo} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18, marginBottom: 18 }}>
                    {/*
                      NOTA: En el futuro, aquí solo se debe mostrar la suscripción activa del usuario (no editable),
                      y los cursos/servicios deben venir de la relación real con la plataforma, no como campos editables.
                      El usuario solo podrá ver su suscripción y los cursos/servicios activos, no editarlos manualmente.
                    */}
                    <select name="membresia" value={perfil.membresia} onChange={handleInput} style={inputEstilo}>
                      <option value="Afiliado">Afiliado</option>
                      <option value="Premium">Premium</option>
                      <option value="Free">Free</option>
                    </select>
                    <input name="rol" value={perfil.rol} readOnly style={{ ...inputEstilo, background: '#23232b', color: '#FFD700', fontWeight: 700 }} />
                    <input name="creditos" value={perfil.creditos} readOnly style={{ ...inputEstilo, background: '#23232b', color: '#FFD700', fontWeight: 700 }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18, marginBottom: 18 }}>
                    <input name="nivel" value={perfil.nivel} readOnly style={{ ...inputEstilo, background: '#23232b', color: '#FFD700', fontWeight: 700 }} />
                    <input name="cursos" value={perfil.cursos.join(', ')} onChange={e => handleArrayInput(e, 'cursos')} placeholder="Cursos activos (separados por coma)" style={inputEstilo} />
                    <input name="servicios" value={perfil.servicios.join(', ')} onChange={e => handleArrayInput(e, 'servicios')} placeholder="Servicios activos (separados por coma)" style={inputEstilo} />
                  </div>
                  <button style={botonGuardarEstilo} onClick={handleGuardar} disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar cambios'}</button>
                  {mensaje && <div style={{ color: '#FFD700', marginTop: 12, fontWeight: 600 }}>{mensaje}</div>}
                </div>
              </div>
            )}
            {/* Cursos activos */}
            <div style={{ marginTop: 32 }}>
              <h3 style={{ color: '#FFD700', fontWeight: 600, fontSize: 22, marginBottom: 16 }}>Cursos Activos</h3>
              {cursosActivos.length === 0 ? (
                <div style={{ color: '#fff' }}>No tienes cursos activos.</div>
              ) : (
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  {cursosActivos.map((curso, idx) => (
                    <div key={idx} style={{ background: '#23232b', border: '1.5px solid #FFD700', borderRadius: 12, padding: 18, minWidth: 260, maxWidth: 320 }}>
                      {curso.imagen && <img src={curso.imagen} alt={curso.nombre} style={{ width: '100%', borderRadius: 8, marginBottom: 10 }} />}
                      <div style={{ color: '#FFD700', fontWeight: 700, fontSize: 18 }}>{curso.nombre}</div>
                      <div style={{ color: '#fff', fontSize: 15 }}>{curso.descripcion}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Servicios activos (dummy) */}
            <div style={{ marginTop: 32 }}>
              <h3 style={{ color: '#FFD700', fontWeight: 600, fontSize: 22, marginBottom: 16 }}>Servicios Activos</h3>
              {serviciosActivos.length === 0 ? (
                <div style={{ color: '#fff' }}>No tienes servicios activos.</div>
              ) : (
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  {serviciosActivos.map((servicio, idx) => (
                    <div key={idx} style={{ background: '#23232b', border: '1.5px solid #FFD700', borderRadius: 12, padding: 18, minWidth: 220, maxWidth: 320, color: '#FFD700', fontWeight: 600 }}>{servicio}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Modal de cambio de contraseña */}
          {showPasswordModal && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#000a', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ background: '#23232b', borderRadius: 16, padding: 32, minWidth: 340, boxShadow: '0 2px 12px #0008', color: '#fff' }}>
                <h3 style={{ color: '#FFD700', fontWeight: 700, fontSize: 22, marginBottom: 18 }}>Cambiar contraseña</h3>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Nueva contraseña" style={inputEstilo} />
                <button style={{ ...botonEstilo, width: '100%', marginTop: 16 }} onClick={handlePasswordChange}>Actualizar</button>
                {passwordMsg && <div style={{ color: passwordMsg.includes('¡Contraseña') ? '#FFD700' : 'red', marginTop: 10 }}>{passwordMsg}</div>}
                <button style={{ ...botonEstilo, background: '#23232b', color: '#FFD700', border: '1.5px solid #FFD700', marginTop: 18 }} onClick={() => setShowPasswordModal(false)}>Cerrar</button>
              </div>
            </div>
          )}
        </div>
      )}
      {selected === 'levels' && <LevelsSection />}
      {selected === 'channels' && <div style={{ color: '#fff' }}>Canales (aquí irá la gestión de canales)</div>}
      {selected === 'mainMenu' && (
        <div style={{ width: '100%', margin: 0, background: '#18181b', borderRadius: 18, boxShadow: '0 2px 12px #0006', padding: 40 }}>
          <h2 style={{ color: '#FFD700', fontWeight: 700, fontSize: 28, marginBottom: 18 }}>Menú Secundario (Barras Superior e Inferior)</h2>
          <div style={{ color: '#fff', marginBottom: 18 }}>
            Configura los botones que aparecerán en la barra superior (scroll horizontal) y en la barra inferior (app móvil). Puedes elegir la zona, el nombre, el orden y la visibilidad de cada botón.
          </div>
          <MenuSecundarioConfigurable />
        </div>
      )}
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

// --- COMPONENTE DEMO DE MENÚ SECUNDARIO ---
function MenuSecundarioConfigurable() {
  const { userInfo } = useNeuroState();
  const community_id = userInfo?.community_id || null;
  const isSuperAdmin = userInfo?.rol === 'superadmin';
  const isAdmin = userInfo?.rol === 'admin' || isSuperAdmin;
  const { menuConfig, loading, error, saveMenuConfig } = useMenuSecundarioConfig(community_id);

  // Menú por defecto con zona
  const defaultMenu = [
    { key: 'inicio', nombre: 'Inicio', visible: true, predeterminado: true, ruta: '/home', icon: '🏠', zona: 'ambas' },
    { key: 'clasificacion', nombre: 'Clasificación', visible: true, predeterminado: false, ruta: '/clasificacion', icon: '📊', zona: 'ambas' },
    { key: 'classroom', nombre: 'Classroom', visible: true, predeterminado: false, ruta: '/classroom', icon: '🎓', zona: 'ambas' },
    { key: 'cursos', nombre: 'Cursos', visible: true, predeterminado: false, ruta: '/cursos', icon: '📚', zona: 'ambas' },
    { key: 'launchpad', nombre: 'Launchpad', visible: true, predeterminado: false, ruta: '/launchpad', icon: '🚀', zona: 'ambas' },
    { key: 'comunidad', nombre: 'Comunidad', visible: true, predeterminado: false, ruta: '/comunidad', icon: '👥', zona: 'ambas' },
    { key: 'embudos', nombre: 'Embudos', visible: true, predeterminado: false, ruta: '/funnels', icon: '🫧', zona: 'ambas' },
    { key: 'ia', nombre: 'IA', visible: true, predeterminado: false, ruta: '/ia', icon: '🤖', zona: 'ambas' },
    { key: 'automatizaciones', nombre: 'Automatizaciones', visible: true, predeterminado: false, ruta: '/automatizaciones', icon: '⚙️', zona: 'ambas' },
    { key: 'whatsappcrm', nombre: 'WhatsApp CRM', visible: true, predeterminado: false, ruta: '/whatsapp-crm', icon: '💬', zona: 'ambas' },
    { key: 'configuracion', nombre: 'Configuración', visible: true, predeterminado: false, ruta: '/configuracion', icon: '🔧', zona: 'ambas' },
  ];

  // Si la config está vacía o corrupta, usar el defaultMenu
  const getInitialTabs = () => {
    if (Array.isArray(menuConfig) && menuConfig.length > 0 && menuConfig.every(tab => tab && typeof tab.key === 'string')) {
      // Si no tiene zona, asignar 'ambas' por compatibilidad
      return menuConfig.map(tab => ({ ...tab, zona: tab.zona || 'ambas' }));
    }
    return defaultMenu;
  };

  const [tabs, setTabs] = useState<any[]>(getInitialTabs());
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setTabs(getInitialTabs());
  }, [menuConfig]);

  useEffect(() => {
    setHasChanges(JSON.stringify(tabs) !== JSON.stringify(menuConfig));
  }, [tabs, menuConfig]);

  const handleToggle = (idx: number) => {
    setTabs(tabs => tabs.map((t, i) => i === idx ? { ...t, visible: !t.visible } : t));
  };
  const handleName = (idx: number, nombre: string) => {
    setTabs(tabs => tabs.map((t, i) => i === idx ? { ...t, nombre } : t));
  };
  const handlePredeterminado = (idx: number) => {
    setTabs(tabs => tabs.map((t, i) => ({ ...t, predeterminado: i === idx })));
  };
  const handleZona = (idx: number, zona: string) => {
    setTabs(tabs => tabs.map((t, i) => i === idx ? { ...t, zona } : t));
  };
  const moveTab = (from: number, to: number) => {
    if (to < 0 || to >= tabs.length) return;
    const newTabs = [...tabs];
    const [moved] = newTabs.splice(from, 1);
    newTabs.splice(to, 0, moved);
    setTabs(newTabs);
  };
  const handleAgregarTab = () => {
    if (!isSuperAdmin) return;
    setTabs([...tabs, { key: '', nombre: '', visible: true, predeterminado: false, ruta: '', icon: '', zona: 'ambas' }]);
  };
  const cleanTabs = (arr: any[]) => arr.filter(tab => tab && typeof tab.key === 'string' && tab.key.trim() && typeof tab.nombre === 'string' && tab.nombre.trim());

  const handleGuardar = async () => {
    if (!isAdmin) return;
    const cleaned = cleanTabs(tabs);
    const result = await saveMenuConfig(cleaned);
    if (result && result.error) {
      alert('Error al guardar: ' + result.error.message);
    } else {
      alert('Menú actualizado correctamente para la comunidad.');
      setHasChanges(false);
    }
  };

  if (loading) return <div style={{ color: '#FFD700' }}>Cargando menú...</div>;

  // Separar por zona
  const tabsSuperior = tabs.filter(tab => tab.zona === 'superior' || tab.zona === 'ambas');
  const tabsInferior = tabs.filter(tab => tab.zona === 'inferior' || tab.zona === 'ambas');

  return (
    <div style={{ background: '#23232b', borderRadius: 14, padding: 24, boxShadow: '0 2px 8px #0004' }}>
      <div style={{ marginBottom: 18, color: '#FFD700', fontWeight: 600 }}>
        Configura los botones de las barras secundarias de tu comunidad.<br/>
        <span style={{ color: '#fff', fontSize: 13 }}>community_id actual: <b>{community_id || '[null]'}</b></span>
      </div>
      {error && <div style={{ color: 'red', marginBottom: 12, fontWeight: 700 }}>Error al guardar o cargar menú: {error}</div>}
      <h3 style={{ color: '#FFD700', fontWeight: 700, fontSize: 20, margin: '18px 0 8px' }}>Barra Superior (scroll horizontal)</h3>
      {tabsSuperior.length === 0 && <div style={{ color: '#fff' }}>No hay botones configurados para la barra superior.</div>}
      {tabsSuperior.map((tab, idx) => (
        <div key={tab.key || idx} style={{ display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid #333', padding: '12px 0' }}>
          <span style={{ color: '#FFD700', fontWeight: tab.predeterminado ? 700 : 500, minWidth: 90 }}>
            {tab.icon || ''} {(tab.key && typeof tab.key === 'string') ? tab.key.charAt(0).toUpperCase() + tab.key.slice(1) : '[Sin clave]'}
          </span>
          <input value={typeof tab.nombre === 'string' ? tab.nombre : ''} onChange={e => handleName(tabs.indexOf(tab), e.target.value)} style={{ ...inputEstilo, width: 180, background: '#23232b', color: '#FFD700', fontWeight: 600 }} />
          <button onClick={() => handlePredeterminado(tabs.indexOf(tab))} title="Marcar como predeterminado" style={{ background: tab.predeterminado ? '#FFD700' : 'transparent', color: tab.predeterminado ? '#18181b' : '#FFD700', border: '1.5px solid #FFD700', borderRadius: 8, padding: '4px 12px', fontWeight: 700, cursor: 'pointer' }}>Predeterminado</button>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input type="checkbox" checked={!!tab.visible} onChange={() => handleToggle(tabs.indexOf(tab))} style={{ accentColor: '#FFD700', width: 18, height: 18 }} />
            <span style={{ color: tab.visible ? '#FFD700' : '#888', fontWeight: 600 }}>{tab.visible ? 'Visible' : 'Oculto'}</span>
          </label>
          <select value={tab.zona} onChange={e => handleZona(tabs.indexOf(tab), e.target.value)} style={{ ...inputEstilo, width: 120, color: '#FFD700', fontWeight: 600 }}>
            <option value="superior">Superior</option>
            <option value="inferior">Inferior</option>
            <option value="ambas">Ambas</option>
          </select>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <button onClick={() => moveTab(tabs.indexOf(tab), tabs.indexOf(tab) - 1)} style={{ background: 'transparent', border: 'none', color: '#FFD700', fontSize: 18, cursor: 'pointer' }} title="Subir">▲</button>
            <button onClick={() => moveTab(tabs.indexOf(tab), tabs.indexOf(tab) + 1)} style={{ background: 'transparent', border: 'none', color: '#FFD700', fontSize: 18, cursor: 'pointer' }} title="Bajar">▼</button>
          </div>
        </div>
      ))}
      <h3 style={{ color: '#FFD700', fontWeight: 700, fontSize: 20, margin: '28px 0 8px' }}>Barra Inferior (app móvil)</h3>
      {tabsInferior.length === 0 && <div style={{ color: '#fff' }}>No hay botones configurados para la barra inferior.</div>}
      {tabsInferior.map((tab, idx) => (
        <div key={tab.key || idx} style={{ display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid #333', padding: '12px 0' }}>
          <span style={{ color: '#FFD700', fontWeight: tab.predeterminado ? 700 : 500, minWidth: 90 }}>
            {tab.icon || ''} {(tab.key && typeof tab.key === 'string') ? tab.key.charAt(0).toUpperCase() + tab.key.slice(1) : '[Sin clave]'}
          </span>
          <input value={typeof tab.nombre === 'string' ? tab.nombre : ''} onChange={e => handleName(tabs.indexOf(tab), e.target.value)} style={{ ...inputEstilo, width: 180, background: '#23232b', color: '#FFD700', fontWeight: 600 }} />
          <button onClick={() => handlePredeterminado(tabs.indexOf(tab))} title="Marcar como predeterminado" style={{ background: tab.predeterminado ? '#FFD700' : 'transparent', color: tab.predeterminado ? '#18181b' : '#FFD700', border: '1.5px solid #FFD700', borderRadius: 8, padding: '4px 12px', fontWeight: 700, cursor: 'pointer' }}>Predeterminado</button>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input type="checkbox" checked={!!tab.visible} onChange={() => handleToggle(tabs.indexOf(tab))} style={{ accentColor: '#FFD700', width: 18, height: 18 }} />
            <span style={{ color: tab.visible ? '#FFD700' : '#888', fontWeight: 600 }}>{tab.visible ? 'Visible' : 'Oculto'}</span>
          </label>
          <select value={tab.zona} onChange={e => handleZona(tabs.indexOf(tab), e.target.value)} style={{ ...inputEstilo, width: 120, color: '#FFD700', fontWeight: 600 }}>
            <option value="superior">Superior</option>
            <option value="inferior">Inferior</option>
            <option value="ambas">Ambas</option>
          </select>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <button onClick={() => moveTab(tabs.indexOf(tab), tabs.indexOf(tab) - 1)} style={{ background: 'transparent', border: 'none', color: '#FFD700', fontSize: 18, cursor: 'pointer' }} title="Subir">▲</button>
            <button onClick={() => moveTab(tabs.indexOf(tab), tabs.indexOf(tab) + 1)} style={{ background: 'transparent', border: 'none', color: '#FFD700', fontSize: 18, cursor: 'pointer' }} title="Bajar">▼</button>
          </div>
        </div>
      ))}
      {isSuperAdmin && (
        <button style={{ ...botonGuardarEstilo, marginTop: 16, background: '#23232b', color: '#FFD700', border: '1.5px solid #FFD700' }} onClick={handleAgregarTab}>+ Agregar botón</button>
      )}
      <button style={{ ...botonGuardarEstilo, marginTop: 24, opacity: hasChanges ? 1 : 0.5, cursor: hasChanges ? 'pointer' : 'not-allowed' }} onClick={handleGuardar} disabled={!hasChanges || !isAdmin}>Guardar menú</button>
    </div>
  );
}