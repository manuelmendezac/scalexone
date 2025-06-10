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
  // const [cursos, setCursos] = useState<Curso[]>([]);
  // const [loading, setLoading] = useState(false);
  // const [nuevo, setNuevo] = useState({ nombre: '', descripcion: '', imagen: '', orden: 0 });
  // const [subiendo, setSubiendo] = useState(false);
  // const [isAdmin, setIsAdmin] = useState(false);
  // const [adminError, setAdminError] = useState<string | null>(null);
  // const [checking, setChecking] = useState(true);

  // Verificar si el usuario es admin
  // useEffect(() => {
  //   async function checkAdmin() {
  //     try {
  //       const { data: { user }, error: userError } = await supabase.auth.getUser();
  //       if (userError) {
  //         setAdminError('Error obteniendo usuario: ' + userError.message);
  //         setChecking(false);
  //         return;
  //       }
  //       if (!user) {
  //         setAdminError('No hay usuario autenticado.');
  //         setChecking(false);
  //         return;
  //       }
  //       const { data, error } = await supabase
  //         .from('usuarios')
  //         .select('rol')
  //         .eq('id', user.id)
  //         .single();
  //       if (error) {
  //         setAdminError('Error consultando rol: ' + error.message);
  //         setChecking(false);
  //         return;
  //       }
  //       if (data?.rol === 'admin') {
  //         setIsAdmin(true);
  //       } else {
  //         setAdminError('No tienes permisos de administrador.');
  //       }
  //       setChecking(false);
  //     } catch (e: any) {
  //       setAdminError('Error inesperado: ' + e.message);
  //       setChecking(false);
  //     }
  //   }
  //   checkAdmin();
  // }, []);

  // if (checking) return <div className="text-white">Verificando permisos de administrador...</div>;
  // if (adminError) return <div className="text-red-400 font-bold">{adminError}</div>;
  // if (!isAdmin) return null;

  // Leer cursos
  // useEffect(() => {
  //   setLoading(true);
  //   supabase.from('cursos').select('*').order('orden', { ascending: true })
  //     .then(({ data }) => {
  //       setCursos(data || []);
  //       setLoading(false);
  //     });
  // }, []);

  // Editar curso
  // const handleEdit = async (id: string, field: keyof Curso, value: string) => {
  //   setCursos(cursos => cursos.map(c => c.id === id ? { ...c, [field]: value } : c));
  //   await supabase.from('cursos').update({ [field]: value }).eq('id', id);
  // };

  // Agregar curso
  // const handleAdd = async () => {
  //   if (!nuevo.nombre) return;
  //   const { data, error } = await supabase.from('cursos').insert([nuevo]).select();
  //   if (data) setCursos([...cursos, data[0]]);
  //   setNuevo({ nombre: '', descripcion: '', imagen: '', orden: cursos.length + 1 });
  // };

  // Eliminar curso
  // const handleDelete = async (id: string) => {
  //   await supabase.from('cursos').delete().eq('id', id);
  //   setCursos(cursos => cursos.filter(c => c.id !== id));
  // };

  // Subir imagen a Storage
  // const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, id?: string) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;
  //   setSubiendo(true);
  //   const filePath = `cursos/${Date.now()}_${file.name}`;
  //   const { data, error } = await supabase.storage.from('imagenes').upload(filePath, file);
  //   if (data) {
  //     const url = supabase.storage.from('imagenes').getPublicUrl(filePath).data.publicUrl;
  //     if (id) {
  //       await handleEdit(id, 'imagen', url);
  //     } else {
  //       setNuevo(n => ({ ...n, imagen: url }));
  //     }
  //   }
  //   setSubiendo(false);
  // };

  return <div style={{color: 'white', padding: 24}}>Panel admin test</div>;
};

export default CursosAdminPanel; 