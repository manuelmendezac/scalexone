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

const AdminConfigPanel: React.FC = () => {
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
  const [selected, setSelected] = useState('welcome');
  const sidebarItems = menuItems;

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
  const handleAvatar = (url: string) => {
    setPerfil({ ...perfil, avatar: url });
  };
  const handleGuardar = async () => {
    setGuardando(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from('usuarios').update({
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
          nombres: perfil.nombres,
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

  function renderComponent() {
    switch (selected) {
      case 'welcome':
        // Aquí va el contenido del perfil/restaurado
        return (
          <div className="w-full bg-black rounded-lg shadow-lg md:p-10 p-6 border-2 border-yellow-500 flex flex-col gap-8">
            <h2 className="text-yellow-500 font-bold text-3xl mb-4">Mi Perfil</h2>
            {/* Aquí puedes poner el formulario de perfil, avatar, etc. */}
            {/* ... reutiliza el contenido anterior de welcome ... */}
          </div>
        );
      case 'levels':
        return <LevelsSection />;
      case 'mainMenu':
        return <MenuSecundarioTresBarras />;
      // Agrega más casos según las opciones del menú
      default:
        return <div className="text-white">Selecciona una opción del menú.</div>;
    }
  }

  if (configLoading || loadingPerfil) {
    return <LoadingScreen message="Cargando configuración..." />;
  }

  return (
    <div className="w-full min-h-screen flex bg-[#0a0a12]">
      {/* Sidebar */}
      <aside className="w-64 min-h-screen bg-[#181824] text-yellow-400 flex flex-col shadow-lg">
        <div className="p-6 border-b border-yellow-900">
          <h2 className="text-2xl font-bold font-orbitron tracking-wide">Panel Admin</h2>
        </div>
        <nav className="mt-4 flex-1">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setSelected(item.key)}
              className={`flex items-center w-full px-5 py-3 my-1 rounded-lg font-semibold transition-all text-lg
                ${selected === item.key ? 'bg-yellow-400 text-[#181824]' : 'hover:bg-yellow-900 text-yellow-200'}`}
              style={{ fontFamily: 'Orbitron, Inter, Arial, sans-serif' }}
            >
              {item.icon}
              <span className="ml-3">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>
      {/* Contenido principal */}
      <main className="flex-1 flex flex-col items-center justify-start p-8 bg-[#0a0a12] min-h-screen overflow-x-auto">
        {renderComponent()}
      </main>
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