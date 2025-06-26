import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { Search, MoreVertical, Download, UserCheck, UserX, Shield, Crown, User, Trash2, Ban, CheckCircle, X, AlertTriangle } from "lucide-react";

interface Miembro {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  nivel: string;
  avatar_url?: string;
  telefono?: string;
  estado: 'activo' | 'bloqueado' | 'suspendido';
  fecha_registro: string;
  membresias?: string[];
  descripcion?: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md border border-yellow-500">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-yellow-400">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default function MiembrosAdminPanel() {
  const [miembros, setMiembros] = useState<Miembro[]>([]);
  const [filteredMiembros, setFilteredMiembros] = useState<Miembro[]>([]);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("todos");
  const [selectedMiembro, setSelectedMiembro] = useState<Miembro | null>(null);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: string; miembro: Miembro } | null>(null);

  useEffect(() => {
    console.log("MiembrosAdminPanel mounted");
    fetchMiembros();
  }, []);

  useEffect(() => {
    filterMiembros();
  }, [miembros, searchTerm, selectedFilter]);

  const fetchMiembros = async () => {
    console.log("Fetching miembros...");
    setLoading(true);
    setError(null);
    
    try {
      const { data: usuariosData, error: usuariosError } = await supabase
        .from("usuarios")
        .select("id, name, email, rol, nivel, avatar_url, celular, created_at, membresia")
        .order('created_at', { ascending: false });
      
      console.log("Usuarios data:", usuariosData);
      console.log("Usuarios error:", usuariosError);

      if (usuariosError) {
        console.error("Error fetching usuarios:", usuariosError);
        setError(`Error al obtener usuarios: ${usuariosError.message}`);
        setMiembros([]);
        return;
      }

      if (usuariosData && usuariosData.length > 0) {
        const miembrosData = usuariosData.map((usuario) => ({
          id: usuario.id,
          nombre: usuario.name || "Sin nombre",
          email: usuario.email || "Sin email",
          rol: usuario.rol || "user",
          nivel: usuario.nivel?.toString() || "1",
          avatar_url: usuario.avatar_url,
          telefono: usuario.celular,
          estado: 'activo' as const,
          fecha_registro: new Date(usuario.created_at).toLocaleDateString(),
          membresias: usuario.membresia ? [usuario.membresia] : [],
          descripcion: ""
        }));
        
        console.log("Miembros mapped:", miembrosData);
        setMiembros(miembrosData);
      } else {
        console.log("No hay usuarios encontrados");
        setMiembros([]);
      }
    } catch (err: any) {
      console.error("Error inesperado:", err);
      setError(`Error inesperado: ${err.message}`);
      setMiembros([]);
    } finally {
      setLoading(false);
    }
  };

  const filterMiembros = () => {
    let filtered = miembros;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(miembro => 
        miembro.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        miembro.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por categoría
    switch (selectedFilter) {
      case "admins":
        filtered = filtered.filter(m => m.rol === "admin" || m.rol === "superadmin");
        break;
      case "partners":
        filtered = filtered.filter(m => m.rol === "partner");
        break;
      case "mods":
        filtered = filtered.filter(m => m.rol === "mod");
        break;
      case "users":
        filtered = filtered.filter(m => m.rol === "user");
        break;
      case "bloqueados":
        filtered = filtered.filter(m => m.estado === "bloqueado");
        break;
      default:
        // "todos" - no filtrar
        break;
    }

    setFilteredMiembros(filtered);
  };

  const handleRoleChange = async (usuarioId: string, nuevoRol: string) => {
    console.log(`Changing role for user ${usuarioId} to ${nuevoRol}`);
    
    try {
      const { error } = await supabase
        .from("usuarios")
        .update({ rol: nuevoRol })
        .eq("id", usuarioId);
        
      if (error) {
        console.error("Error changing role:", error);
        setMensaje("Error al cambiar rol: " + error.message);
      } else {
        console.log("Role changed successfully");
        setMensaje("Rol cambiado exitosamente");
        fetchMiembros();
      }
    } catch (err: any) {
      console.error("Unexpected error changing role:", err);
      setMensaje("Error inesperado al cambiar rol: " + err.message);
    }
  };

  const handleBlockUser = async (usuario: Miembro) => {
    try {
      // Aquí podrías actualizar un campo 'estado' en la base de datos
      console.log(`Blocking user ${usuario.id}`);
      setMensaje(`Usuario ${usuario.nombre} bloqueado exitosamente`);
      fetchMiembros();
    } catch (err: any) {
      setMensaje("Error al bloquear usuario: " + err.message);
    }
  };

  const handleRemoveUser = async (usuario: Miembro) => {
    try {
      const { error } = await supabase
        .from("usuarios")
        .delete()
        .eq("id", usuario.id);
        
      if (error) {
        setMensaje("Error al eliminar usuario: " + error.message);
      } else {
        setMensaje(`Usuario ${usuario.nombre} eliminado exitosamente`);
        fetchMiembros();
      }
    } catch (err: any) {
      setMensaje("Error inesperado al eliminar usuario: " + err.message);
    }
  };

  const handleGrantAccess = async (usuario: Miembro, membresia: string) => {
    try {
      const { error } = await supabase
        .from("usuarios")
        .update({ membresia: membresia })
        .eq("id", usuario.id);
        
      if (error) {
        setMensaje("Error al otorgar acceso: " + error.message);
      } else {
        setMensaje(`Acceso a ${membresia} otorgado a ${usuario.nombre}`);
        fetchMiembros();
      }
    } catch (err: any) {
      setMensaje("Error inesperado al otorgar acceso: " + err.message);
    }
  };

  const confirmActionHandler = () => {
    if (!confirmAction) return;
    
    const { type, miembro } = confirmAction;
    
    switch (type) {
      case 'block':
        handleBlockUser(miembro);
        break;
      case 'remove':
        handleRemoveUser(miembro);
        break;
      case 'makeAdmin':
        handleRoleChange(miembro.id, 'admin');
        break;
      case 'makePartner':
        handleRoleChange(miembro.id, 'partner');
        break;
    }
    
    setShowConfirmModal(false);
    setConfirmAction(null);
    setShowActionMenu(null);
  };

  const getRoleIcon = (rol: string) => {
    switch (rol) {
      case 'admin':
      case 'superadmin':
        return <Shield className="w-4 h-4 text-red-500" />;
      case 'partner':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'mod':
        return <UserCheck className="w-4 h-4 text-blue-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleBadge = (rol: string) => {
    const colors = {
      admin: 'bg-red-500',
      superadmin: 'bg-red-600',
      partner: 'bg-yellow-500',
      mod: 'bg-blue-500',
      user: 'bg-gray-500'
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${colors[rol as keyof typeof colors] || colors.user}`}>
        {getRoleIcon(rol)}
        <span className="ml-1 capitalize">{rol}</span>
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 bg-black">
        <div className="w-full bg-gray-900/50 rounded-lg p-6">
          <h1 className="text-3xl font-bold text-yellow-400 mb-4">Gestión de Miembros</h1>
          <div className="text-white">Cargando miembros...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-black">
      <div className="w-full bg-gray-900/50 rounded-lg p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-yellow-400 mb-2">Miembros</h1>
            <p className="text-gray-400">Aquí podrás ver la lista de todos los miembros de tu comunidad.</p>
          </div>
          <button className="flex items-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold hover:bg-yellow-600 transition-colors">
            <Download size={20} />
            Descargar
          </button>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar miembros..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-yellow-500 focus:outline-none"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'todos', label: 'Miembros', count: miembros.length },
              { key: 'admins', label: 'Admins', count: miembros.filter(m => m.rol === 'admin' || m.rol === 'superadmin').length },
              { key: 'partners', label: 'Partners', count: miembros.filter(m => m.rol === 'partner').length },
              { key: 'mods', label: 'Mods', count: miembros.filter(m => m.rol === 'mod').length },
              { key: 'users', label: 'Users', count: miembros.filter(m => m.rol === 'user').length }
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => setSelectedFilter(filter.key)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedFilter === filter.key
                    ? 'bg-yellow-500 text-black'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {filter.label} <span className="ml-1">{filter.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-300 p-4 rounded mb-4">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {mensaje && (
          <div className="text-yellow-400 mb-4 p-4 bg-yellow-900/20 rounded border border-yellow-500">
            {mensaje}
          </div>
        )}

        {/* Members List */}
        {filteredMiembros.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No se encontraron miembros con los filtros aplicados.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMiembros.map((miembro) => (
              <div key={miembro.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center overflow-hidden">
                      {miembro.avatar_url ? (
                        <img src={miembro.avatar_url} alt={miembro.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-gray-300" />
                      )}
                    </div>
                    
                    {/* Info */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold">{miembro.nombre}</h3>
                        {getRoleBadge(miembro.rol)}
                      </div>
                      <p className="text-gray-400 text-sm">+{miembro.telefono || 'Sin teléfono'} • {miembro.email}</p>
                      {miembro.membresias && miembro.membresias.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {miembro.membresias.map((membresia, idx) => (
                            <span key={idx} className="inline-flex items-center px-2 py-1 bg-blue-500 text-white text-xs rounded">
                              {membresia}
                            </span>
                          ))}
                        </div>
                      )}
                      {miembro.descripcion && (
                        <p className="text-gray-300 text-sm mt-1">{miembro.descripcion}</p>
                      )}
                      <p className="text-gray-500 text-xs mt-1">Solicitó acceso {miembro.fecha_registro}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="relative">
                    <button
                      onClick={() => setShowActionMenu(showActionMenu === miembro.id ? null : miembro.id)}
                      className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700 transition-colors"
                    >
                      <MoreVertical size={20} />
                    </button>
                    
                    {showActionMenu === miembro.id && (
                      <div className="absolute right-0 top-full mt-1 w-56 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-10">
                        <div className="py-2">
                          <button
                            onClick={() => {
                              setConfirmAction({ type: 'makeAdmin', miembro });
                              setShowConfirmModal(true);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-white hover:bg-gray-700 transition-colors"
                          >
                            <Shield size={16} />
                            Hacer Admin
                          </button>
                          <button
                            onClick={() => {
                              setConfirmAction({ type: 'makePartner', miembro });
                              setShowConfirmModal(true);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-white hover:bg-gray-700 transition-colors"
                          >
                            <Crown size={16} />
                            Remover Partner
                          </button>
                          <button
                            onClick={() => handleGrantAccess(miembro, 'Premium')}
                            className="w-full flex items-center gap-3 px-4 py-2 text-white hover:bg-gray-700 transition-colors"
                          >
                            <CheckCircle size={16} />
                            Otorgar Acceso Premium
                          </button>
                          <div className="border-t border-gray-600 my-1"></div>
                          <button
                            onClick={() => {
                              setConfirmAction({ type: 'block', miembro });
                              setShowConfirmModal(true);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-yellow-400 hover:bg-gray-700 transition-colors"
                          >
                            <Ban size={16} />
                            Bloquear Miembro
                          </button>
                          <button
                            onClick={() => {
                              setConfirmAction({ type: 'remove', miembro });
                              setShowConfirmModal(true);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-gray-700 transition-colors"
                          >
                            <Trash2 size={16} />
                            Eliminar Miembro
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-6 text-sm text-gray-400">
          Mostrando {filteredMiembros.length} de {miembros.length} miembros
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirmar Acción"
      >
        {confirmAction && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-white">
                  ¿Estás seguro de que quieres {
                    confirmAction.type === 'block' ? 'bloquear' :
                    confirmAction.type === 'remove' ? 'eliminar' :
                    confirmAction.type === 'makeAdmin' ? 'hacer admin' :
                    confirmAction.type === 'makePartner' ? 'hacer partner' : 'realizar esta acción'
                  } a <strong>{confirmAction.miembro.nombre}</strong>?
                </p>
                <p className="text-gray-400 text-sm mt-1">Esta acción no se puede deshacer.</p>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmActionHandler}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
} 