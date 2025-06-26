import { useState, useEffect } from "react";
import { supabase } from "../supabase";

interface Miembro {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  nivel: string;
}

export default function MiembrosAdminPanel() {
  const [miembros, setMiembros] = useState<Miembro[]>([]);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("MiembrosAdminPanel mounted");
    fetchMiembros();
  }, []);

  const fetchMiembros = async () => {
    console.log("Fetching miembros...");
    setLoading(true);
    setError(null);
    
    try {
      // Primero intentemos obtener datos de la tabla usuarios
      const { data: usuariosData, error: usuariosError } = await supabase
        .from("usuarios")
        .select("id, name, email, rol, nivel");
      
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
          nivel: usuario.nivel?.toString() || "1"
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
        // Recargar datos
        fetchMiembros();
      }
    } catch (err: any) {
      console.error("Unexpected error changing role:", err);
      setMensaje("Error inesperado al cambiar rol: " + err.message);
    }
  };

  const handleNivelChange = async (usuarioId: string, nuevoNivel: string) => {
    console.log(`Changing level for user ${usuarioId} to ${nuevoNivel}`);
    
    try {
      const { error } = await supabase
        .from("usuarios")
        .update({ nivel: parseInt(nuevoNivel) })
        .eq("id", usuarioId);
        
      if (error) {
        console.error("Error changing level:", error);
        setMensaje("Error al cambiar nivel: " + error.message);
      } else {
        console.log("Level changed successfully");
        setMensaje("Nivel cambiado exitosamente");
        // Recargar datos
        fetchMiembros();
      }
    } catch (err: any) {
      console.error("Unexpected error changing level:", err);
      setMensaje("Error inesperado al cambiar nivel: " + err.message);
    }
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
        <h1 className="text-3xl font-bold text-yellow-400 mb-4">Gestión de Miembros</h1>
        
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-300 p-4 rounded mb-4">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {mensaje && (
          <div className="text-yellow-400 mb-4 p-4 bg-yellow-900/20 rounded">
            {mensaje}
          </div>
        )}
        
        {miembros.length === 0 ? (
          <div className="text-white p-4">
            No se encontraron miembros en la base de datos.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-white border-collapse">
              <thead>
                <tr className="text-yellow-400 border-b border-yellow-900">
                  <th className="p-3 text-left">Nombre</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Rol</th>
                  <th className="p-3 text-left">Nivel</th>
                  <th className="p-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {miembros.map((miembro) => (
                  <tr key={miembro.id} className="border-t border-yellow-900 hover:bg-gray-800/50">
                    <td className="p-3">{miembro.nombre}</td>
                    <td className="p-3">{miembro.email}</td>
                    <td className="p-3">
                      <select 
                        value={miembro.rol} 
                        onChange={(e) => handleRoleChange(miembro.id, e.target.value)}
                        className="bg-gray-800 text-white border border-gray-600 rounded px-2 py-1"
                      >
                        <option value="user">User</option>
                        <option value="mod">Mod</option>
                        <option value="admin">Admin</option>
                        <option value="partner">Partner</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <select 
                        value={miembro.nivel} 
                        onChange={(e) => handleNivelChange(miembro.id, e.target.value)}
                        className="bg-gray-800 text-white border border-gray-600 rounded px-2 py-1"
                      >
                        {Array.from({length: 10}, (_, i) => i + 1).map(nivel => (
                          <option key={nivel} value={nivel}>{nivel}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3">
                      <button 
                        className="text-yellow-400 hover:underline mr-2 px-2 py-1 border border-yellow-400 rounded"
                        onClick={() => fetchMiembros()}
                      >
                        Actualizar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="mt-4 text-sm text-gray-400">
          Total de miembros: {miembros.length}
        </div>
      </div>
    </div>
  );
} 