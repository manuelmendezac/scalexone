import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import useNeuroState from '../store/useNeuroState';

interface Curso {
  id: string;
  nombre: string;
  descripcion: string;
  imagen: string;
  orden: number;
}

const CursosAdminPanel: React.FC = () => {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(false);
  const [nuevo, setNuevo] = useState({ nombre: '', descripcion: '', imagen: '', orden: 0 });
  const [subiendo, setSubiendo] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Verificar si el usuario es admin
  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', user.id)
        .single();
      if (data?.rol === 'admin') setIsAdmin(true);
    }
    checkAdmin();
  }, []);

  if (!isAdmin) return null;

  // Leer cursos
  useEffect(() => {
    setLoading(true);
    supabase.from('cursos').select('*').order('orden', { ascending: true })
      .then(({ data }) => {
        setCursos(data || []);
        setLoading(false);
      });
  }, []);

  // Editar curso
  const handleEdit = async (id: string, field: keyof Curso, value: string) => {
    setCursos(cursos => cursos.map(c => c.id === id ? { ...c, [field]: value } : c));
    await supabase.from('cursos').update({ [field]: value }).eq('id', id);
  };

  // Agregar curso
  const handleAdd = async () => {
    if (!nuevo.nombre) return;
    const { data, error } = await supabase.from('cursos').insert([nuevo]).select();
    if (data) setCursos([...cursos, data[0]]);
    setNuevo({ nombre: '', descripcion: '', imagen: '', orden: cursos.length + 1 });
  };

  // Eliminar curso
  const handleDelete = async (id: string) => {
    await supabase.from('cursos').delete().eq('id', id);
    setCursos(cursos => cursos.filter(c => c.id !== id));
  };

  // Subir imagen a Storage
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, id?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendo(true);
    const filePath = `cursos/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage.from('imagenes').upload(filePath, file);
    if (data) {
      const url = supabase.storage.from('imagenes').getPublicUrl(filePath).data.publicUrl;
      if (id) {
        await handleEdit(id, 'imagen', url);
      } else {
        setNuevo(n => ({ ...n, imagen: url }));
      }
    }
    setSubiendo(false);
  };

  return (
    <div className="bg-neutral-900 p-6 rounded-xl shadow-lg max-w-3xl mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4 text-white">Panel de administración de Cursos</h2>
      {loading ? <div className="text-white">Cargando...</div> : (
        <table className="w-full text-sm text-white mb-6">
          <thead>
            <tr className="border-b border-neutral-700">
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Orden</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cursos.map(curso => (
              <tr key={curso.id} className="border-b border-neutral-800">
                <td>
                  <img src={curso.imagen} alt={curso.nombre} className="w-16 h-16 object-cover rounded mb-1" />
                  <input type="file" accept="image/*" onChange={e => handleUpload(e, curso.id)} disabled={subiendo} />
                </td>
                <td>
                  <input value={curso.nombre} onChange={e => handleEdit(curso.id, 'nombre', e.target.value)} className="bg-neutral-800 text-white rounded px-2 py-1 w-32" />
                </td>
                <td>
                  <textarea value={curso.descripcion} onChange={e => handleEdit(curso.id, 'descripcion', e.target.value)} className="bg-neutral-800 text-white rounded px-2 py-1 w-48" />
                </td>
                <td>
                  <input type="number" value={curso.orden} onChange={e => handleEdit(curso.id, 'orden', e.target.value)} className="bg-neutral-800 text-white rounded px-2 py-1 w-12" />
                </td>
                <td>
                  <button onClick={() => handleDelete(curso.id)} className="text-red-400 hover:underline">Eliminar</button>
                </td>
              </tr>
            ))}
            {/* Nuevo curso */}
            <tr>
              <td>
                {nuevo.imagen && <img src={nuevo.imagen} alt="Nueva" className="w-16 h-16 object-cover rounded mb-1" />}
                <input type="file" accept="image/*" onChange={e => handleUpload(e)} disabled={subiendo} />
              </td>
              <td>
                <input value={nuevo.nombre} onChange={e => setNuevo(n => ({ ...n, nombre: e.target.value }))} className="bg-neutral-800 text-white rounded px-2 py-1 w-32" placeholder="Nombre" />
              </td>
              <td>
                <textarea value={nuevo.descripcion} onChange={e => setNuevo(n => ({ ...n, descripcion: e.target.value }))} className="bg-neutral-800 text-white rounded px-2 py-1 w-48" placeholder="Descripción" />
              </td>
              <td>
                <input type="number" value={nuevo.orden} onChange={e => setNuevo(n => ({ ...n, orden: Number(e.target.value) }))} className="bg-neutral-800 text-white rounded px-2 py-1 w-12" />
              </td>
              <td>
                <button onClick={handleAdd} className="text-green-400 hover:underline">Agregar</button>
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CursosAdminPanel; 