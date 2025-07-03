import React, { useState, useEffect } from 'react';
import LevelsSection from './LevelsSection';
import AvatarUploader from '../AvatarUploader';
import { supabase } from '../../supabase';
import { useMenuSecundarioConfig } from '../../hooks/useMenuSecundarioConfig';
import { syncUserProfile } from '../../hooks/useSyncUserProfile';
import useNeuroState from '../../store/useNeuroState';
import SecondNavbar from '../SecondNavbar';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import useConfigStore from '../../store/useConfigStore';
import LoadingScreen from '../LoadingScreen';
import { menuItems } from './AdminSidebar';
import BannersAdminPanel from './BannersAdminPanel';
import MetodosCobroPanel from '../finanzas/MetodosCobroPanel';
import SalesHistoryPanel from '../finanzas/SalesHistoryPanel';
import TransaccionesPanel from '../finanzas/TransaccionesPanel';
import SQLExecutor from './SQLExecutor';
import { FiCopy, FiCheck } from 'react-icons/fi';
import PerfilUsuarioPanel from '../PerfilUsuarioPanel';

const perfilDefault = {
  avatar: '',
  name: '',
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
  username: '',
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

interface AdminConfigPanelProps {
  selected: string;
}

const AdminConfigPanel: React.FC<AdminConfigPanelProps> = ({ selected }) => {
  const { userConfig, loading: configLoading, fetchUserConfig } = useConfigStore();
  const [perfil, setPerfil] = useState(perfilDefault);
  const [guardando, setGuardando] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [cursosActivos, setCursosActivos] = useState<any[]>([]);
  const [serviciosActivos, setServiciosActivos] = useState<any[]>([]);
  const [loadingPerfil, setLoadingPerfil] = useState(false);
  const { userInfo, clearAllProgress } = useNeuroState();
  const community_id = userInfo?.community_id || null;
  const isAdmin = userInfo?.rol === 'admin' || userInfo?.rol === 'superadmin';
  const { menuConfig, loading: menuLoading, error, saveMenuConfig } = useMenuSecundarioConfig(community_id);
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [copied, setCopied] = useState(false);
  const [avatarAuth, setAvatarAuth] = useState('');

  useEffect(() => {
    fetchUserConfig();
  }, [fetchUserConfig]);

  // Leer datos reales del usuario
  useEffect(() => {
    async function fetchPerfil() {
      if (selected !== 'welcome') return;
      
      setLoadingPerfil(true);
      try {
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
            name: usuario.name || '',
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
            username: usuario.username || '',
          });
        }

        // Leer cursos activos
        const { data: cursosUsuario } = await supabase
          .from('usuario_curso')
          .select('curso_id, estado, cursos:curso_id (nombre, descripcion, imagen)')
          .eq('usuario_id', user.id)
          .eq('estado', 'activo');

        setCursosActivos(cursosUsuario?.map((c: any) => c.cursos) || []);
        setServiciosActivos(usuario?.servicios || []);
      } catch (error) {
        console.error('Error fetching perfil:', error);
      } finally {
        setLoadingPerfil(false);
      }
    }
    fetchPerfil();
  }, [selected]);

  // Obtener avatar del autenticador si no hay personalizado
  useEffect(() => {
    async function fetchAvatarAuth() {
      if (!perfil.avatar) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.avatar_url) {
          setAvatarAuth(user.user_metadata.avatar_url);
        } else {
          setAvatarAuth('/images/silueta-perfil.svg');
        }
      }
    }
    fetchAvatarAuth();
  }, [perfil.avatar]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setPerfil({ ...perfil, [e.target.name]: e.target.value });
  };
  const handleArrayInput = (e: React.ChangeEvent<HTMLInputElement>, key: 'cursos' | 'servicios') => {
    setPerfil({ ...perfil, [key]: e.target.value.split(',').map(s => s.trim()) });
  };
  const handleAvatar = (url: string) => {
    setPerfil({ ...perfil, avatar: url });
  };
  const handleGuardar = async () => {
    setGuardando(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Validar username antes de guardar
      const valido = await validarUsername(username);
      if (!valido) {
        setGuardando(false);
        return;
      }
      const { error } = await supabase.from('usuarios').update({
        avatar_url: perfil.avatar,
        name: perfil.name,
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
        username: username
      }).eq('id', user.id);

      if (error) {
        setGuardando(false);
        console.error('Error al guardar el perfil:', error);
        alert(`Error al guardar el perfil: ${error.message}`);
        return;
      }
      
      // Actualizar también los metadatos de autenticación del usuario
      // Esto es crucial para que el avatar y otros datos se reflejen globalmente
      const { data: updatedUser, error: updateUserError } = await supabase.auth.updateUser({
        data: { 
          avatar_url: perfil.avatar,
          name: perfil.name,
          apellidos: perfil.apellidos
        }
      });

      if (updateUserError) {
        setGuardando(false);
        console.error('Error al actualizar metadatos del usuario:', updateUserError);
        alert(`Error al actualizar metadatos: ${updateUserError.message}`);
        return;
      }
      
      setSaved(true);
      syncUserProfile();
      setTimeout(() => setSaved(false), 2000);
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

  // Función para generar username por defecto
  function generarUsernameBase(nombre: string) {
    if (!nombre) return '';
    return nombre.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 16);
  }

  // Validar unicidad de username
  async function validarUsername(uname: string) {
    setCheckingUsername(true);
    setUsernameError('');
    if (!uname) {
      setUsernameError('Elige un nombre de usuario');
      setCheckingUsername(false);
      return false;
    }
    const { data, error } = await supabase
      .from('usuarios')
      .select('id')
      .eq('username', uname)
      .single();
    if (error && error.code !== 'PGRST116') {
      setUsernameError('Error validando username');
      setCheckingUsername(false);
      return false;
    }
    // Si existe y no es el usuario actual
    const { data: { user } } = await supabase.auth.getUser();
    if (data && user && data.id !== user.id) {
      setUsernameError('Este nombre de usuario ya está en uso');
      setCheckingUsername(false);
      return false;
    }
    setCheckingUsername(false);
    setUsernameError('');
    return true;
  }

  // Al cargar perfil, autogenerar username si está vacío
  useEffect(() => {
    if (perfil && perfil.name !== undefined) {
      (async () => {
        if (!username) {
          let base = generarUsernameBase(perfil.name);
          let uname = base;
          let intento = 0;
          while (true) {
            const { data, error } = await supabase
              .from('usuarios')
              .select('id')
              .eq('username', uname)
              .single();
            if (!data || (userInfo && data.id === userInfo.id)) break;
            intento++;
            uname = base + intento;
          }
          setUsername(uname);
          // Guardar automáticamente si no existe
          if (!perfil.username) {
            await supabase.from('usuarios').update({ username: uname }).eq('id', userInfo.id);
          }
        } else {
          setUsername(perfil.username || '');
        }
      })();
    }
    // eslint-disable-next-line
  }, [perfil.name]);

  // Renderizar contenido según la opción seleccionada
  if (selected === 'welcome') {
    return (
      <div className="w-full">
        <div className="w-full bg-black rounded-lg shadow-lg md:p-10 p-6 border-2 border-yellow-500 flex flex-col gap-8">
          <h2 className="text-yellow-500 font-bold text-3xl mb-4">Mi Perfil</h2>
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 items-start">
            {/* Columna Izquierda: Avatar, Username y Link de Afiliado */}
            <div className="flex flex-col items-center gap-4 w-full max-w-xs mx-auto lg:mx-0">
              <AvatarUploader 
                onUpload={handleAvatar} 
                initialUrl={perfil.avatar || avatarAuth || '/images/silueta-perfil.svg'} 
                label="Foto de perfil" 
              />
              {/* Campo username */}
              <input
                className="input-perfil mt-2 text-center w-full"
                placeholder="Nombre de usuario único"
                value={username}
                onChange={async e => {
                  setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''));
                  await validarUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''));
                }}
                maxLength={32}
                style={{ borderColor: usernameError ? 'red' : '#FFD700' }}
              />
              {usernameError && <span style={{ color: 'red', fontSize: 13 }}>{usernameError}</span>}
              {/* Link de afiliado con botón copiar */}
              <div style={{ color: '#FFD700', fontWeight: 500, fontSize: 15, marginTop: 4, textAlign: 'center', wordBreak: 'break-all', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                Tu link de afiliado:
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                  <span style={{ color: '#fff', fontSize: 15 }}>
                    https://scalexone.app/afiliado/{username || 'usuario'}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`https://scalexone.app/afiliado/${username || 'usuario'}`);
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
              <button
                className="bg-yellow-500 text-black font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors w-full mt-4"
                onClick={() => setShowPasswordModal(true)}
              >
                Cambiar contraseña
              </button>
            </div>
            {/* Columna Derecha: Formulario de datos personales */}
            <div className="flex flex-col gap-4 min-w-0 w-full">
              {/* Campos de Nombre y Apellido */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <input className="input-perfil" placeholder="Nombre" value={perfil.name} onChange={e => setPerfil({ ...perfil, name: e.target.value })} />
                <input className="input-perfil" placeholder="Apellidos" value={perfil.apellidos} onChange={e => setPerfil({ ...perfil, apellidos: e.target.value })} />
              </div>
              {/* Campos de Contacto */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <input className="input-perfil" placeholder="Correo" value={perfil.correo} readOnly />
                <input className="input-perfil" placeholder="Celular" value={perfil.celular} onChange={e => setPerfil({ ...perfil, celular: e.target.value })} />
              </div>
              {/* Selectores */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                <select className="input-perfil" value={perfil.pais} onChange={e => setPerfil({ ...perfil, pais: e.target.value })}>
                  <option>Perú</option>
                  <option>México</option>
                  <option>Colombia</option>
                  <option>Argentina</option>
                  <option>España</option>
                  <option>Otro</option>
                </select>
                <select className="input-perfil" value={perfil.idioma} onChange={e => setPerfil({ ...perfil, idioma: e.target.value })}>
                  <option>Español</option>
                  <option>Inglés</option>
                </select>
                <select className="input-perfil" value={perfil.zona_horaria} onChange={e => setPerfil({ ...perfil, zona_horaria: e.target.value })}>
                  <option>GMT-5</option>
                  <option>GMT-6</option>
                  <option>GMT-3</option>
                  <option>GMT-8</option>
                </select>
              </div>
              {/* Wallet */}
              <input className="input-perfil" placeholder="Wallet (opcional)" value={perfil.wallet} onChange={e => setPerfil({ ...perfil, wallet: e.target.value })} />
              {/* Redes Sociales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
                <input className="input-perfil" placeholder="Facebook" value={perfil.facebook} onChange={e => setPerfil({ ...perfil, facebook: e.target.value })} />
                <input className="input-perfil" placeholder="Twitter" value={perfil.twitter} onChange={e => setPerfil({ ...perfil, twitter: e.target.value })} />
                <input className="input-perfil" placeholder="Instagram" value={perfil.instagram} onChange={e => setPerfil({ ...perfil, instagram: e.target.value })} />
                <input className="input-perfil" placeholder="TikTok" value={perfil.tiktok} onChange={e => setPerfil({ ...perfil, tiktok: e.target.value })} />
              </div>
              {/* Campos de Admin (solo lectura) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                <select className="input-perfil" value={perfil.membresia} onChange={e => setPerfil({ ...perfil, membresia: e.target.value })}>
                  <option>Afiliado</option>
                  <option>Premium</option>
                  <option>Free</option>
                </select>
                <input className="input-perfil" value={perfil.rol} readOnly />
                <input className="input-perfil" value={perfil.creditos} readOnly />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                <input className="input-perfil" value={perfil.nivel} readOnly placeholder="Nivel" />
                <input className="input-perfil" placeholder="Cursos (IDs separados por coma)" value={perfil.cursos.join(', ')} onChange={e => handleArrayInput(e, 'cursos')} />
                <input className="input-perfil" placeholder="Servicios (IDs separados por coma)" value={perfil.servicios.join(', ')} onChange={e => handleArrayInput(e, 'servicios')} />
              </div>
              {/* Botón Guardar */}
              <div className="flex items-center mt-4">
                <button className="bg-yellow-500 text-black font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors" onClick={handleGuardar} disabled={guardando}>
                  {guardando ? 'Guardando...' : 'Guardar cambios'}
                </button>
                {saved && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
          </div>
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
    );
  }

  if (selected === 'levels') {
    return <LevelsSection />;
  }

  if (selected === 'mainMenu') {
    return <MenuSecundarioTresBarras />;
  }

  if (selected === 'banners') {
    return <BannersAdminPanel />;
  }

  // Paneles de Finanzas
  if (selected === 'payments') {
    return <MetodosCobroPanel />;
  }

  if (selected === 'salesHistory') {
    return <SalesHistoryPanel />;
  }

  if (selected === 'transactions') {
    return <TransaccionesPanel />;
  }

  if (selected === 'sql-executor') {
    return <SQLExecutor />;
  }

  if (!isAdmin) {
    return <PerfilUsuarioPanel />;
  }

  // Para otras opciones, mostrar contenido básico
  return (
    <div className="w-full">
      <div className="w-full bg-black rounded-lg shadow-lg md:p-10 p-6 border-2 border-yellow-500">
        <h2 className="text-yellow-500 font-bold text-3xl mb-4">{selected}</h2>
        <div className="text-white">Contenido para {selected} (en desarrollo)</div>
      </div>
    </div>
  );
};

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

const defaultButtons = [
  { key: 'inicio', nombre: 'Inicio', ruta: '/home', icon: '🏠' },
  { key: 'comunidad', nombre: 'Comunidad', ruta: '/comunidad', icon: '👥' },
  { key: 'classroom', nombre: 'Classroom', ruta: '/classroom', icon: '🎓' },
  { key: 'cursos', nombre: 'Cursos', ruta: '/cursos', icon: '📚' },
  { key: 'launchpad', nombre: 'Launchpad', ruta: '/launchpad', icon: '🚀' },
  { key: 'clasificacion', nombre: 'Clasificación', ruta: '/clasificacion', icon: '📊' },
  { key: 'embudos', nombre: 'Embudos', ruta: '/funnels', icon: '🫧' },
  { key: 'marketplace', nombre: 'Marketplace', ruta: '/marketplace', icon: '🛒' },
  { key: 'automatizaciones', nombre: 'Automatizaciones', ruta: '/automatizaciones', icon: '⚙️' },
  { key: 'whatsappcrm', nombre: 'WhatsApp CRM', ruta: '/whatsapp-crm', icon: '💬' },
  { key: 'configuracion', nombre: 'Configuración', ruta: '/configuracion-admin', icon: '🔧' },
];

function isConfigObject(obj: any): obj is { barra_scroll_desktop: any[]; barra_scroll_movil: any[]; barra_inferior_movil: any[] } {
  return obj && typeof obj === 'object' && Array.isArray(obj.barra_scroll_desktop) && Array.isArray(obj.barra_scroll_movil) && Array.isArray(obj.barra_inferior_movil);
}

function MenuSecundarioTresBarras() {
  const { userInfo } = useNeuroState();
  const community_id = userInfo?.community_id || null;
  const isSuperAdmin = userInfo?.rol === 'superadmin';
  const isAdmin = userInfo?.rol === 'admin' || isSuperAdmin;
  const { menuConfig, loading, error, saveMenuConfig } = useMenuSecundarioConfig(community_id);

  // Estructura inicial: tres arrays separados
  const getInitialConfig = () => {
    if (isConfigObject(menuConfig)) {
      return {
        barra_scroll_desktop: menuConfig.barra_scroll_desktop,
        barra_scroll_movil: menuConfig.barra_scroll_movil,
        barra_inferior_movil: menuConfig.barra_inferior_movil,
      };
    }
    // Si es el formato viejo, migrar todo a desktop
    if (Array.isArray(menuConfig)) {
      return { barra_scroll_desktop: menuConfig, barra_scroll_movil: [], barra_inferior_movil: [] };
    }
    // Si no hay nada, usar default
    return { barra_scroll_desktop: defaultButtons, barra_scroll_movil: [], barra_inferior_movil: [] };
  };

  const [config, setConfig] = useState<{ 
    barra_scroll_desktop: any[]; 
    barra_scroll_movil: any[]; 
    barra_inferior_movil: any[];
    [key: string]: any[];
  }>(getInitialConfig());
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setConfig(getInitialConfig());
  }, [menuConfig]);

  useEffect(() => {
    let menuObj = menuConfig;
    if (Array.isArray(menuConfig)) {
      menuObj = { barra_scroll_desktop: menuConfig, barra_scroll_movil: [], barra_inferior_movil: [] };
    }
    setHasChanges(JSON.stringify(config) !== JSON.stringify(menuObj));
  }, [config, menuConfig]);

  // Drag & drop entre barras
  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const sourceBar = result.source.droppableId as keyof typeof config;
    const destBar = result.destination.droppableId as keyof typeof config;
    if (sourceBar === destBar) {
      // Reordenar dentro de la misma barra
      const items = Array.from(config[sourceBar]);
      const [removed] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, removed);
      setConfig({ ...config, [sourceBar]: items });
    } else {
      // Mover entre barras
      const sourceItems = Array.from(config[sourceBar]);
      const destItems = Array.from(config[destBar]);
      const [removed] = sourceItems.splice(result.source.index, 1);
      // Evitar duplicados
      if (destItems.find(b => b.key === removed.key)) return;
      destItems.splice(result.destination.index, 0, removed);
      setConfig({ ...config, [sourceBar]: sourceItems, [destBar]: destItems });
    }
  };

  // Quitar botón de una barra
  const removeButton = (bar: keyof typeof config, idx: number) => {
    const items = Array.from(config[bar]);
    items.splice(idx, 1);
    setConfig({ ...config, [bar]: items });
  };

  // Ocultar/mostrar botón
  const toggleVisible = (bar: keyof typeof config, idx: number) => {
    const items = Array.from(config[bar]);
    items[idx] = { ...items[idx], visible: !items[idx].visible };
    setConfig({ ...config, [bar]: items });
  };

  // Botones disponibles para agregar, con opciones solo para barras donde no está
  const allBars = ['barra_scroll_desktop', 'barra_scroll_movil', 'barra_inferior_movil'] as const;
  
  // Para cada barra, mostrar todos los botones que NO están en esa barra específica
  const getAvailableButtonsForBar = (bar: keyof typeof config) => {
    const buttonsInThisBar = config[bar].map(b => b.key);
    return defaultButtons.filter(btn => !buttonsInThisBar.includes(btn.key));
  };

  // Agregar botón a una barra específica
  const addButtonToBar = (bar: keyof typeof config, button: any) => {
    setConfig({ 
      ...config, 
      [bar]: [...config[bar], { ...button, visible: true }] 
    });
  };

  // Guardar
  const handleGuardar = async () => {
    if (!isAdmin) return;
    // Validar que no haya duplicados en la misma barra
    const allBars = ['barra_scroll_desktop', 'barra_scroll_movil', 'barra_inferior_movil'] as const;
    for (const bar of allBars) {
      const keys = config[bar].map(b => b.key);
      const setKeys = new Set(keys);
      if (setKeys.size !== keys.length) {
        alert('No puede haber botones duplicados en la misma barra: ' + bar);
        return;
      }
    }
    const result = await saveMenuConfig(config);
    if (result && result.error) {
      alert('Error al guardar: ' + result.error.message);
    } else {
      alert('Menú actualizado correctamente para la comunidad.');
      setHasChanges(false);
    }
  };

  return (
    <div style={{ background: '#23232b', borderRadius: 14, padding: 24, boxShadow: '0 2px 8px #0004' }}>
      <div style={{ marginBottom: 18, color: '#FFD700', fontWeight: 600 }}>
        Configura los botones de las barras secundarias de tu comunidad.<br/>
        <span style={{ color: '#fff', fontSize: 13 }}>community_id actual: <b>{community_id || '[null]'}</b></span>
      </div>
      {error && <div style={{ color: 'red', marginBottom: 12, fontWeight: 700 }}>Error al guardar o cargar menú: {error}</div>}
      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', marginBottom: 32 }}>
        <DragDropContext onDragEnd={onDragEnd}>
          {['barra_scroll_desktop', 'barra_scroll_movil', 'barra_inferior_movil'].map((bar, i) => (
            <Droppable droppableId={bar} key={bar}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} style={{ flex: 1, minWidth: 260 }}>
                  <h3 style={{ color: '#FFD700', fontWeight: 700, fontSize: 18, marginBottom: 12 }}>
                    {bar === 'barra_scroll_desktop' && 'Barra Scroll Desktop'}
                    {bar === 'barra_scroll_movil' && 'Barra Scroll Móvil'}
                    {bar === 'barra_inferior_movil' && 'Barra Inferior App Móvil'}
                  </h3>
                  {config[bar].length === 0 && <div style={{ color: '#fff' }}>No hay botones configurados para esta barra.</div>}
                  {config[bar].map((tab: any, idx: number) => (
                    <Draggable key={tab.key + '-' + bar} draggableId={tab.key + '-' + bar} index={idx}>
                      {(prov) => (
                        <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} style={{ display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #333', padding: '10px 0', ...prov.draggableProps.style }}>
                          <span style={{ color: '#FFD700', fontWeight: 700, minWidth: 90 }}>{tab.icon || ''} {tab.nombre}</span>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                            <input type="checkbox" checked={tab.visible !== false} onChange={() => toggleVisible(bar as keyof typeof config, idx)} style={{ accentColor: '#FFD700', width: 18, height: 18 }} />
                            <span style={{ color: tab.visible !== false ? '#FFD700' : '#888', fontWeight: 600 }}>{tab.visible !== false ? 'Visible' : 'Oculto'}</span>
                          </label>
                          <button onClick={() => removeButton(bar as keyof typeof config, idx)} style={{ background: 'transparent', border: 'none', color: '#FFD700', fontSize: 18, cursor: 'pointer' }} title="Quitar">✕</button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </DragDropContext>
      </div>
      <div style={{ marginBottom: 18 }}>
        <h4 style={{ color: '#FFD700', fontWeight: 600, fontSize: 16 }}>Botones disponibles para agregar</h4>
        {['barra_scroll_desktop', 'barra_scroll_movil', 'barra_inferior_movil'].map((bar) => {
          const availableButtons = getAvailableButtonsForBar(bar as keyof typeof config);
          return (
            <div key={bar} style={{ marginBottom: 16 }}>
              <h5 style={{ color: '#FFD700', fontWeight: 600, fontSize: 14, marginBottom: 8 }}>
                Para {bar === 'barra_scroll_desktop' ? 'Barra Scroll Desktop' : bar === 'barra_scroll_movil' ? 'Barra Scroll Móvil' : 'Barra Inferior App Móvil'}:
              </h5>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {availableButtons.length === 0 && <span style={{ color: '#fff', fontSize: 13 }}>No hay más botones disponibles para esta barra.</span>}
                {availableButtons.map(btn => (
                  <button 
                    key={btn.key} 
                    style={{ 
                      background: '#23232b', 
                      color: '#FFD700', 
                      border: '1.5px solid #FFD700', 
                      borderRadius: 6, 
                      padding: '6px 12px', 
                      fontWeight: 600, 
                      cursor: 'pointer',
                      fontSize: 12
                    }} 
                    onClick={() => addButtonToBar(bar as keyof typeof config, btn)}
                  >
                    {btn.icon} {btn.nombre}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <button style={{ ...botonGuardarEstilo, marginTop: 24, opacity: hasChanges ? 1 : 0.5, cursor: hasChanges ? 'pointer' : 'not-allowed' }} onClick={handleGuardar} disabled={!hasChanges || !isAdmin}>Guardar menú</button>
    </div>
  );
}

export default AdminConfigPanel;