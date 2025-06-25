import { useState, useEffect } from "react";
// import { supabase } from "../supabase"; // Descomenta y ajusta según tu proyecto

export default function AdminCanalesPanel() {
  // Estado para el formulario
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    tipo: "public",
    permisos_publicar: "todos",
    permisos_comentar: "todos",
    membresia_requerida: "",
  });
  // Estado para la lista de canales y membresías
  const [canales, setCanales] = useState([]);
  const [membresias, setMembresias] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  // Simula community_id (reemplaza por tu lógica real)
  const community_id = "AQUI_UUID_DE_LA_COMUNIDAD";

  // Cargar canales y membresías (simulado)
  useEffect(() => {
    // Aquí deberías hacer fetch a supabase para canales y membresías
    // setCanales([...]);
    // setMembresias([...]);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje("");
    // Aquí va la lógica real de inserción en supabase
    // const { error } = await supabase.from("canales_comunidad").insert([{ ...form, community_id }]);
    setLoading(false);
    setMensaje("¡Canal creado exitosamente!");
    // Recarga la lista de canales aquí
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-black">
      {/* Sidebar: ya la tienes */}
      <aside className="w-full md:w-1/5 bg-gray-900 p-4">
        {/* ...sidebar existente... */}
      </aside>
      {/* Main */}
      <main className="flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-yellow-400 mb-2">Gestión de Canales</h1>
          <p className="text-gray-300 mb-8">Crea, edita y administra los canales de tu comunidad</p>
          {/* Formulario */}
          <form
            onSubmit={handleSubmit}
            className="bg-gray-900 border-2 border-yellow-400 rounded-lg p-6 mb-10"
          >
            <h2 className="text-xl text-yellow-400 font-bold mb-4">Crear Canal</h2>
            <div className="mb-4">
              <label className="block text-yellow-400 mb-1">Nombre del canal</label>
              <input
                name="nombre"
                className="w-full p-2 rounded bg-black text-white border border-yellow-400"
                value={form.nombre}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-yellow-400 mb-1">Descripción</label>
              <textarea
                name="descripcion"
                className="w-full p-2 rounded bg-black text-white border border-yellow-400"
                value={form.descripcion}
                onChange={handleChange}
              />
            </div>
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-yellow-400 mb-1">Tipo</label>
                <select
                  name="tipo"
                  className="w-full p-2 rounded bg-black text-white border border-yellow-400"
                  value={form.tipo}
                  onChange={handleChange}
                >
                  <option value="public">Público</option>
                  <option value="private">Privado</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-yellow-400 mb-1">Membresía requerida</label>
                <select
                  name="membresia_requerida"
                  className="w-full p-2 rounded bg-black text-white border border-yellow-400"
                  value={form.membresia_requerida}
                  onChange={handleChange}
                >
                  <option value="">Ninguna</option>
                  {/* {membresias.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))} */}
                </select>
              </div>
            </div>
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-yellow-400 mb-1">Permisos para publicar</label>
                <select
                  name="permisos_publicar"
                  className="w-full p-2 rounded bg-black text-white border border-yellow-400"
                  value={form.permisos_publicar}
                  onChange={handleChange}
                >
                  <option value="todos">Todos</option>
                  <option value="admin_mod">Admin/Mod</option>
                  <option value="solo_admin">Solo Admin</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-yellow-400 mb-1">Permisos para comentar</label>
                <select
                  name="permisos_comentar"
                  className="w-full p-2 rounded bg-black text-white border border-yellow-400"
                  value={form.permisos_comentar}
                  onChange={handleChange}
                >
                  <option value="todos">Todos</option>
                  <option value="admin_mod">Admin/Mod</option>
                  <option value="solo_admin">Solo Admin</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-yellow-400 text-black font-bold py-2 rounded hover:bg-yellow-300 transition"
              disabled={loading}
            >
              {loading ? "Creando..." : "Crear Canal"}
            </button>
            {mensaje && (
              <div className="mt-2 text-center text-yellow-400">{mensaje}</div>
            )}
          </form>
          {/* Listado de canales */}
          <div className="bg-gray-900 border-2 border-yellow-400 rounded-lg p-6">
            <h2 className="text-xl text-yellow-400 font-bold mb-4">Canales existentes</h2>
            <table className="w-full text-white">
              <thead>
                <tr className="text-yellow-400">
                  <th className="p-2">Nombre</th>
                  <th className="p-2">Tipo</th>
                  <th className="p-2">Permisos Publicar</th>
                  <th className="p-2">Permisos Comentar</th>
                  <th className="p-2">Membresía</th>
                  <th className="p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {canales.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-400 py-4">
                      No hay canales aún.
                    </td>
                  </tr>
                ) : (
                  canales.map((canal) => (
                    <tr key={canal.id} className="border-t border-yellow-900">
                      <td className="p-2">{canal.nombre}</td>
                      <td className="p-2">{canal.tipo === "public" ? "Público" : "Privado"}</td>
                      <td className="p-2">{canal.permisos_publicar}</td>
                      <td className="p-2">{canal.permisos_comentar}</td>
                      <td className="p-2">{canal.membresia_requerida || "Ninguna"}</td>
                      <td className="p-2">
                        {/* Botones de editar/eliminar aquí */}
                        <button className="text-yellow-400 hover:underline mr-2">Editar</button>
                        <button className="text-red-400 hover:underline">Eliminar</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
} 