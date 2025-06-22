import React, { useState, useEffect } from 'react';
import LevelsSection from './LevelsSection';
import AvatarUploader from '../AvatarUploader';
import { supabase } from '../../supabase';
import { useMenuSecundarioConfig } from '../../hooks/useMenuSecundarioConfig';
import useNeuroState from '../../store/useNeuroState';
import SecondNavbar from '../SecondNavbar';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import useConfigStore from '../../store/useConfigStore';
import LoadingScreen from '../LoadingScreen';

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

interface AdminConfigPanelProps {
  selected: string;
}

const AdminConfigPanel: React.FC<AdminConfigPanelProps> = ({ selected }) => {
  const { userConfig, loading: configLoading, fetchUserConfig } = useConfigStore();
  const [perfil, setPerfil] = useState(perfilDefault);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
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
        avatar_url: perfil.avatar,
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

  if (configLoading || loadingPerfil) {
    return <LoadingScreen message="Cargando configuración..." />;
  }

  return (
    <div className="flex-1 p-8 bg-black">
      <div className="max-w-4xl mx-auto">
        {selected === 'welcome' && (
          <div>
            <h1 className="text-2xl font-bold text-yellow-400 mb-4">Bienvenida</h1>
            {/* Contenido de bienvenida */}
          </div>
        )}
        {selected === 'welcome' && (
          <div style={{ width: '100%', padding: '40px 0', background: '#000', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto', background: '#000', borderRadius: 18, boxShadow: '0 2px 12px #0006', padding: 40, border: '2px solid #FFD700', display: 'flex', flexDirection: 'column', gap: 32 }}>
              <h2 style={{ color: '#FFD700', fontWeight: 700, fontSize: 28, marginBottom: 28 }}>Mi Perfil</h2>
              {loadingPerfil ? <div style={{ color: '#FFD700', fontWeight: 600 }}>Cargando...</div> : (
                <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 40, alignItems: 'flex-start', marginBottom: 32 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
                    <AvatarUploader onUpload={handleAvatar} initialUrl={perfil.avatar} label="Foto de perfil" />
                    <button style={botonEstilo} onClick={() => setShowPasswordModal(true)}>Cambiar contraseña</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, minWidth: 0 }}>
                      <input style={{ background: '#000', color: '#FFD700', border: '2px solid #FFD700', borderRadius: 8, padding: 12, minWidth: 0 }} placeholder="Nombres" value={perfil.nombres} onChange={e => setPerfil({ ...perfil, nombres: e.target.value })} />
                      <input style={{ background: '#000', color: '#FFD700', border: '2px solid #FFD700', borderRadius: 8, padding: 12, minWidth: 0 }} placeholder="Apellidos" value={perfil.apellidos} onChange={e => setPerfil({ ...perfil, apellidos: e.target.value })} />
                      <input style={{ background: '#000', color: '#FFD700', border: '2px solid #FFD700', borderRadius: 8, padding: 12, minWidth: 0 }} placeholder="Correo" value={perfil.correo} readOnly />
                      <input style={{ background: '#000', color: '#FFD700', border: '2px solid #FFD700', borderRadius: 8, padding: 12, minWidth: 0 }} placeholder="Celular" value={perfil.celular} onChange={e => setPerfil({ ...perfil, celular: e.target.value })} />
                      <select style={{ background: '#000', color: '#FFD700', border: '2px solid #FFD700', borderRadius: 8, padding: 12, minWidth: 0 }} value={perfil.pais} onChange={e => setPerfil({ ...perfil, pais: e.target.value })}>
                        <option value="Perú">Perú</option>
                        <option value="México">México</option>
                        <option value="Colombia">Colombia</option>
                        <option value="Argentina">Argentina</option>
                        <option value="España">España</option>
                        <option value="Otro">Otro</option>
                      </select>
                      <select style={{ background: '#000', color: '#FFD700', border: '2px solid #FFD700', borderRadius: 8, padding: 12, minWidth: 0 }} value={perfil.idioma} onChange={e => setPerfil({ ...perfil, idioma: e.target.value })}>
                        <option value="Español">Español</option>
                        <option value="Inglés">Inglés</option>
                      </select>
                      <select style={{ background: '#000', color: '#FFD700', border: '2px solid #FFD700', borderRadius: 8, padding: 12, minWidth: 0 }} value={perfil.zona_horaria} onChange={e => setPerfil({ ...perfil, zona_horaria: e.target.value })}>
                        <option value="GMT-5">GMT-5</option>
                        <option value="GMT-6">GMT-6</option>
                        <option value="GMT-3">GMT-3</option>
                        <option value="GMT-8">GMT-8</option>
                      </select>
                      <input style={{ background: '#000', color: '#FFD700', border: '2px solid #FFD700', borderRadius: 8, padding: 12, minWidth: 0 }} placeholder="Wallet (opcional)" value={perfil.wallet} onChange={e => setPerfil({ ...perfil, wallet: e.target.value })} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16, minWidth: 0 }}>
                      <input style={{ background: '#000', color: '#FFD700', border: '2px solid #FFD700', borderRadius: 8, padding: 12, minWidth: 0 }} placeholder="Facebook" value={perfil.facebook} onChange={e => setPerfil({ ...perfil, facebook: e.target.value })} />
                      <input style={{ background: '#000', color: '#FFD700', border: '2px solid #FFD700', borderRadius: 8, padding: 12, minWidth: 0 }} placeholder="Twitter" value={perfil.twitter} onChange={e => setPerfil({ ...perfil, twitter: e.target.value })} />
                      <input style={{ background: '#000', color: '#FFD700', border: '2px solid #FFD700', borderRadius: 8, padding: 12, minWidth: 0 }} placeholder="Instagram" value={perfil.instagram} onChange={e => setPerfil({ ...perfil, instagram: e.target.value })} />
                      <input style={{ background: '#000', color: '#FFD700', border: '2px solid #FFD700', borderRadius: 8, padding: 12, minWidth: 0 }} placeholder="TikTok" value={perfil.tiktok} onChange={e => setPerfil({ ...perfil, tiktok: e.target.value })} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, minWidth: 0 }}>
                      <select style={{ background: '#000', color: '#FFD700', border: '2px solid #FFD700', borderRadius: 8, padding: 12, minWidth: 0 }} value={perfil.membresia} onChange={e => setPerfil({ ...perfil, membresia: e.target.value })}>
                        <option value="Afiliado">Afiliado</option>
                        <option value="Premium">Premium</option>
                        <option value="Free">Free</option>
                      </select>
                      <input style={{ background: '#000', color: '#FFD700', border: '2px solid #FFD700', borderRadius: 8, padding: 12, minWidth: 0 }} value={perfil.rol} readOnly />
                      <input style={{ background: '#000', color: '#FFD700', border: '2px solid #FFD700', borderRadius: 8, padding: 12, minWidth: 0 }} value={perfil.creditos} readOnly />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, minWidth: 0 }}>
                      <input style={{ background: '#000', color: '#FFD700', border: '2px solid #FFD700', borderRadius: 8, padding: 12, minWidth: 0 }} value={perfil.nivel} readOnly />
                      <input style={{ background: '#000', color: '#FFD700', border: '2px solid #FFD700', borderRadius: 8, padding: 12, minWidth: 0 }} value={perfil.cursos.join(', ')} onChange={e => handleArrayInput(e, 'cursos')} />
                      <input style={{ background: '#000', color: '#FFD700', border: '2px solid #FFD700', borderRadius: 8, padding: 12, minWidth: 0 }} value={perfil.servicios.join(', ')} onChange={e => handleArrayInput(e, 'servicios')} />
                    </div>
                    <button style={botonGuardarEstilo} onClick={handleGuardar} disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar cambios'}</button>
                  </div>
                </div>
              )}
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
        )}
        {selected === 'levels' && <LevelsSection />}
        {selected === 'channels' && <div style={{ color: '#fff' }}>Canales (aquí irá la gestión de canales)</div>}
        {selected === 'mainMenu' && (
          <div style={{ width: '100%', margin: 0, background: '#18181b', borderRadius: 18, boxShadow: '0 2px 12px #0006', padding: 40 }}>
            <h2 style={{ color: '#FFD700', fontWeight: 700, fontSize: 28, marginBottom: 18 }}>Menú Secundario (Barras Desktop, Móvil Scroll, App Móvil)</h2>
            <div style={{ color: '#fff', marginBottom: 18 }}>
              Configura los botones que aparecerán en la barra scroll horizontal de desktop, la barra scroll horizontal de móvil y la barra inferior tipo app móvil. Puedes arrastrar, agregar, quitar y ocultar los botones de cada barra de forma independiente. No se permiten duplicados en la misma barra.
            </div>
            <MenuSecundarioTresBarras />
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
        {selected === 'account' && (
          <div>
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">Mi Cuenta</h2>
            {isAdmin && (
              <div className="bg-gray-800 p-4 rounded-lg my-6 border border-red-500/50">
                <h3 className="text-lg font-bold text-red-400 mb-2">Zona de Administrador</h3>
                <p className="text-sm text-gray-300 mb-4">
                  Esta acción es irreversible. Limpiará el LocalStorage y todo el progreso de gamificación (XP, monedas, videos vistos) para todos los usuarios.
                </p>
                <button
                  onClick={() => {
                    if (window.confirm('¿Estás seguro de que quieres borrar TODO el progreso de TODOS los usuarios?')) {
                      clearAllProgress();
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  Reiniciar Progreso de Gamificación
                </button>
              </div>
            )}
            {/* Otras configuraciones de la cuenta aquí */}
          </div>
        )}
        {selected === 'password' && <div style={{ color: '#fff' }}>Contraseña (aquí irá el cambio de contraseña)</div>}
        {selected === 'paymentHistory' && <div style={{ color: '#fff' }}>Historial de Pagos (aquí irá el historial de pagos)</div>}
        {selected === 'invites' && <div style={{ color: '#fff' }}>Invitados (aquí irá la gestión de invitados)</div>}
        {selected === 'commissions' && <div style={{ color: '#fff' }}>Comisiones (aquí irá la gestión de comisiones)</div>}
        {selected === 'wallet' && <div style={{ color: '#fff' }}>Billetera (aquí irá la gestión de la billetera)</div>}
        {selected === 'domain' && <div style={{ color: '#fff' }}>Dominio (aquí irá la configuración del dominio personalizado)</div>}
        {selected === 'about' && <div style={{ color: '#fff' }}>Página Pública (aquí irá la edición de la página pública de la comunidad)</div>}
        {selected === 'configuracion' && (
          <div>
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">Configuración General</h2>
            {isAdmin && (
              <div className="bg-gray-800 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-bold text-red-400 mb-2">Zona de Administrador</h3>
                <p className="text-sm text-gray-300 mb-4">
                  Esta acción es irreversible. Limpiará todo el progreso de gamificación (XP, monedas, videos vistos) para todos los usuarios y recargará la aplicación.
                </p>
                <button
                  onClick={() => {
                    if (window.confirm('¿Estás seguro de que quieres borrar TODO el progreso de TODOS los usuarios?')) {
                      clearAllProgress();
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  Reiniciar Progreso de Gamificación
                </button>
              </div>
            )}
            {/* Otras configuraciones aquí */}
          </div>
        )}
        {selected === 'niveles' && isAdmin && (
          <LevelsSection />
        )}
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
  { key: 'ia', nombre: 'IA', ruta: '/ia', icon: '🤖' },
  { key: 'automatizaciones', nombre: 'Automatizaciones', ruta: '/automatizaciones', icon: '⚙️' },
  { key: 'whatsappcrm', nombre: 'WhatsApp CRM', ruta: '/whatsapp-crm', icon: '💬' },
  { key: 'configuracion', nombre: 'Configuración', ruta: '/configuracion', icon: '🔧' },
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