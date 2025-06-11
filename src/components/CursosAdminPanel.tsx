import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

interface Curso {
  id: string;
  nombre: string;
  descripcion: string;
  imagen: string;
  orden: number;
}

const CursosAdminPanel: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(false);
  const [cursosError, setCursosError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAdmin() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) {
          setAdminError('Error obteniendo usuario: ' + userError.message);
          setChecking(false);
          return;
        }
        if (!user) {
          setAdminError('No hay usuario autenticado.');
          setChecking(false);
          return;
        }
        const { data, error } = await supabase
          .from('usuarios')
          .select('rol')
          .eq('id', user.id)
          .single();
        if (error) {
          setAdminError('Error consultando rol: ' + error.message);
          setChecking(false);
          return;
        }
        if (data?.rol === 'admin') {
          setIsAdmin(true);
        } else {
          setAdminError('No tienes permisos de administrador.');
        }
        setChecking(false);
      } catch (e: any) {
        setAdminError('Error inesperado: ' + e.message);
        setChecking(false);
      }
    }
    checkAdmin();
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    setLoading(true);
    supabase.from('cursos').select('*').order('orden', { ascending: true })
      .then(({ data, error }) => {
        if (error) setCursosError('Error al cargar cursos: ' + error.message);
        setCursos(data || []);
        setLoading(false);
      });
  }, [isAdmin]);

  if (checking) return <div style={{color: 'white', padding: 24}}>Verificando permisos de administrador...</div>;
  if (adminError) return <div style={{color: 'red', padding: 24}}>{adminError}</div>;
  if (!isAdmin) return null;

  return (
    <div style={{color: 'white', padding: 24}}>
      <div style={{color: 'lime', marginBottom: 16}}>Eres admin. (Vista de cursos)</div>
      {loading && <div>Cargando cursos...</div>}
      {cursosError && <div style={{color: 'red'}}>{cursosError}</div>}
      <table style={{width: '100%', background: '#181818', borderRadius: 12, overflow: 'hidden'}}>
        <thead>
          <tr style={{background: '#222'}}>
            <th style={{padding: 8}}>Imagen</th>
            <th style={{padding: 8}}>Nombre</th>
            <th style={{padding: 8}}>Descripción</th>
            <th style={{padding: 8}}>Orden</th>
          </tr>
        </thead>
        <tbody>
          {cursos.map(curso => (
            <tr key={curso.id} style={{borderBottom: '1px solid #333'}}>
              <td style={{padding: 8}}>
                {curso.imagen && <img src={curso.imagen} alt={curso.nombre} style={{width: 60, height: 60, objectFit: 'cover', borderRadius: 8}} />}
              </td>
              <td style={{padding: 8}}>{curso.nombre}</td>
              <td style={{padding: 8, maxWidth: 300}}>{curso.descripcion}</td>
              <td style={{padding: 8, textAlign: 'center'}}>{curso.orden}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CursosAdminPanel; 