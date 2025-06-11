import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import ModalFuturista from './ModalFuturista';

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
  const [modal, setModal] = useState<'add' | 'edit' | 'delete' | null>(null);
  const [cursoSeleccionado, setCursoSeleccionado] = useState<Curso | null>(null);
  const [form, setForm] = useState<Partial<Curso>>({});
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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

  // Handlers para abrir modales
  const abrirAgregar = () => { setForm({}); setCursoSeleccionado(null); setModal('add'); };
  const abrirEditar = (curso: Curso) => { setForm(curso); setCursoSeleccionado(curso); setModal('edit'); };
  const abrirEliminar = (curso: Curso) => { setCursoSeleccionado(curso); setModal('delete'); };
  const cerrarModal = () => { setModal(null); setCursoSeleccionado(null); setForm({}); setFormError(null); };

  // Handlers de formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      if (modal === 'add') {
        const { error } = await supabase.from('cursos').insert([{ ...form }]);
        if (error) throw error;
      } else if (modal === 'edit' && cursoSeleccionado) {
        const { error } = await supabase.from('cursos').update({ ...form }).eq('id', cursoSeleccionado.id);
        if (error) throw error;
      }
      cerrarModal();
      // Refrescar cursos
      setLoading(true);
      const { data, error } = await supabase.from('cursos').select('*').order('orden', { ascending: true });
      if (error) setCursosError('Error al cargar cursos: ' + error.message);
      setCursos(data || []);
      setLoading(false);
    } catch (err: any) {
      setFormError(err.message || 'Error desconocido');
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!cursoSeleccionado) return;
    setFormLoading(true);
    setFormError(null);
    try {
      const { error } = await supabase.from('cursos').delete().eq('id', cursoSeleccionado.id);
      if (error) throw error;
      cerrarModal();
      // Refrescar cursos
      setLoading(true);
      const { data, error: error2 } = await supabase.from('cursos').select('*').order('orden', { ascending: true });
      if (error2) setCursosError('Error al cargar cursos: ' + error2.message);
      setCursos(data || []);
      setLoading(false);
    } catch (err: any) {
      setFormError(err.message || 'Error desconocido');
      setFormLoading(false);
    }
  };

  if (checking) return <div style={{color: 'white', padding: 24}}>Verificando permisos de administrador...</div>;
  if (adminError) return <div style={{color: 'red', padding: 24}}>{adminError}</div>;
  if (!isAdmin) return null;

  return (
    <div style={{color: 'white', padding: 24, maxWidth: 900, margin: '0 auto'}}>
      <div style={{color: 'lime', marginBottom: 16}}>Eres admin. (Vista de cursos)</div>
      {loading && <div>Cargando cursos...</div>}
      {cursosError && <div style={{color: 'red'}}>{cursosError}</div>}
      <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: 16}}>
        <button onClick={abrirAgregar} style={{background: '#3ec6f7', color: '#101c2c', fontWeight: 700, border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 18, cursor: 'pointer', boxShadow: '0 2px 8px #3ec6f755'}}>+ Agregar curso</button>
      </div>
      <div style={{overflowX: 'auto'}}>
        <table style={{width: '100%', minWidth: 600, background: '#181818', borderRadius: 12, overflow: 'hidden', fontSize: 16}}>
          <thead>
            <tr style={{background: '#222'}}>
              <th style={{padding: 8, width: 80, textAlign: 'center'}}>Imagen</th>
              <th style={{padding: 8}}>Nombre</th>
              <th style={{padding: 8}}>Descripción</th>
              <th style={{padding: 8, width: 60, textAlign: 'center'}}>Orden</th>
              <th style={{padding: 8, width: 120, textAlign: 'center'}}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cursos.map(curso => (
              <tr key={curso.id} style={{borderBottom: '1px solid #333', verticalAlign: 'middle'}}>
                <td style={{padding: 8, textAlign: 'center'}}>
                  {curso.imagen ? (
                    <img
                      src={curso.imagen}
                      alt={curso.nombre}
                      style={{width: 60, height: 60, objectFit: 'cover', borderRadius: 8, background: '#222'}}
                      onError={e => {
                        (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/60x60?text=No+Img';
                      }}
                    />
                  ) : (
                    <img src="https://placehold.co/60x60?text=No+Img" alt="Sin imagen" style={{width: 60, height: 60, borderRadius: 8, background: '#222'}} />
                  )}
                </td>
                <td style={{padding: 8, fontWeight: 600, color: '#fff'}}>{curso.nombre}</td>
                <td style={{padding: 8, maxWidth: 320, color: '#ccc'}}>{curso.descripcion}</td>
                <td style={{padding: 8, textAlign: 'center', fontWeight: 500}}>{curso.orden}</td>
                <td style={{padding: 8, textAlign: 'center'}}>
                  <button onClick={() => abrirEditar(curso)} style={{marginRight: 8, background: '#ffe93c', color: '#101c2c', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 600, cursor: 'pointer'}}>Editar</button>
                  <button onClick={() => abrirEliminar(curso)} style={{background: '#ff3c3c', color: 'white', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 600, cursor: 'pointer'}}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Modal para agregar/editar */}
      <ModalFuturista open={modal === 'add' || modal === 'edit'} onClose={cerrarModal}>
        <form onSubmit={handleSubmit} style={{width: 340, display: 'flex', flexDirection: 'column', gap: 18}}>
          <div style={{fontWeight: 700, fontSize: 22, color: '#3ec6f7', marginBottom: 8}}>{modal === 'add' ? 'Agregar curso' : 'Editar curso'}</div>
          <input name="nombre" placeholder="Nombre" value={form.nombre || ''} onChange={handleChange} required style={{padding: 10, borderRadius: 8, border: '1px solid #333', fontSize: 16}} />
          <textarea name="descripcion" placeholder="Descripción" value={form.descripcion || ''} onChange={handleChange} required style={{padding: 10, borderRadius: 8, border: '1px solid #333', fontSize: 16, minHeight: 60}} />
          <input name="imagen" placeholder="URL de imagen" value={form.imagen || ''} onChange={handleChange} style={{padding: 10, borderRadius: 8, border: '1px solid #333', fontSize: 16}} />
          <input name="orden" placeholder="Orden" type="number" value={form.orden || ''} onChange={handleChange} required style={{padding: 10, borderRadius: 8, border: '1px solid #333', fontSize: 16}} />
          {formError && <div style={{color: 'red', fontWeight: 600}}>{formError}</div>}
          <button type="submit" disabled={formLoading} style={{background: '#3ec6f7', color: '#101c2c', fontWeight: 700, border: 'none', borderRadius: 8, padding: '12px 0', fontSize: 18, marginTop: 8, cursor: 'pointer'}}>{formLoading ? 'Guardando...' : (modal === 'add' ? 'Agregar' : 'Guardar cambios')}</button>
          <button type="button" onClick={cerrarModal} style={{background: 'transparent', color: '#3ec6f7', border: 'none', fontWeight: 600, marginTop: 4, cursor: 'pointer'}}>Cancelar</button>
        </form>
      </ModalFuturista>
      {/* Modal para eliminar */}
      <ModalFuturista open={modal === 'delete'} onClose={cerrarModal}>
        <div style={{width: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
          <div style={{fontWeight: 700, fontSize: 22, color: '#ff3c3c', marginBottom: 8}}>¿Eliminar curso?</div>
          <div style={{color: '#fff', textAlign: 'center'}}>Esta acción no se puede deshacer.<br />¿Seguro que quieres eliminar <b>{cursoSeleccionado?.nombre}</b>?</div>
          {formError && <div style={{color: 'red', fontWeight: 600}}>{formError}</div>}
          <button onClick={handleDelete} disabled={formLoading} style={{background: '#ff3c3c', color: 'white', fontWeight: 700, border: 'none', borderRadius: 8, padding: '12px 0', fontSize: 18, width: '100%', marginTop: 8, cursor: 'pointer'}}>{formLoading ? 'Eliminando...' : 'Eliminar'}</button>
          <button onClick={cerrarModal} style={{background: 'transparent', color: '#3ec6f7', border: 'none', fontWeight: 600, marginTop: 4, cursor: 'pointer'}}>Cancelar</button>
        </div>
      </ModalFuturista>
    </div>
  );
};

export default CursosAdminPanel; 