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

  useEffect(() => {
    const fetchMiembros = async () => {
      const { data, error } = await supabase
        .from("comunidad_usuario_roles")
        .select("usuario_id, rol_id, roles:nombre, niveles:nombre")
        .eq("community_id", "AQUI_UUID_DE_LA_COMUNIDAD");
      if (error) console.error("Error fetching miembros: ", error);
      else setMiembros((data || []).map((item) => ({
        id: item.usuario_id,
        nombre: "Nombre Placeholder", // Reemplazar con el nombre real si está disponible
        email: "Email Placeholder", // Reemplazar con el email real si está disponible
        rol: item.roles,
        nivel: item.niveles
      })));
    };

    fetchMiembros();
  }, []);

  const handleRoleChange = async (usuarioId: string, nuevoRol: string) => {
    const { error } = await supabase
      .from("comunidad_usuario_roles")
      .update({ rol_id: nuevoRol })
      .eq("usuario_id", usuarioId);
    if (error) setMensaje("Error al cambiar rol: " + error.message);
    else setMensaje("Rol cambiado exitosamente");
  };

  const handleNivelChange = async (usuarioId: string, nuevoNivel: string) => {
    const { error } = await supabase
      .from("comunidad_usuario_niveles")
      .update({ nivel_id: nuevoNivel })
      .eq("usuario_id", usuarioId);
    if (error) setMensaje("Error al cambiar nivel: " + error.message);
    else setMensaje("Nivel cambiado exitosamente");
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-yellow-400 mb-4">Gestión de Miembros</h1>
      {mensaje && <div className="text-yellow-400 mb-4">{mensaje}</div>}
      <table className="w-full text-white">
        <thead>
          <tr className="text-yellow-400">
            <th className="p-2">Nombre</th>
            <th className="p-2">Email</th>
            <th className="p-2">Rol</th>
            <th className="p-2">Nivel</th>
            <th className="p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {miembros.map((miembro) => (
            <tr key={miembro.id} className="border-t border-yellow-900">
              <td className="p-2">{miembro.nombre}</td>
              <td className="p-2">{miembro.email}</td>
              <td className="p-2">{miembro.rol}</td>
              <td className="p-2">{miembro.nivel}</td>
              <td className="p-2">
                <button className="text-yellow-400 hover:underline mr-2" onClick={() => handleRoleChange(miembro.id, 'nuevoRol')}>Cambiar Rol</button>
                <button className="text-yellow-400 hover:underline" onClick={() => handleNivelChange(miembro.id, 'nuevoNivel')}>Cambiar Nivel</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 