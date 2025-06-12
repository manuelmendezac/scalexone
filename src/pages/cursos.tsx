import React, { useState, useEffect } from 'react';
import useNeuroState from '../store/useNeuroState';
import CursosAdminPanel from '../components/CursosAdminPanel';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

const CursosPage: React.FC = () => {
  const [cursos, setCursos] = useState<any[]>([]);
  const [cursoActivo, setCursoActivo] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { userName } = useNeuroState();
  const primerNombre = userName ? userName.split(' ')[0] : 'Master';
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  // Leer cursos desde Supabase
  useEffect(() => {
    setLoading(true);
    supabase.from('cursos').select('*').order('orden', { ascending: true })
      .then(({ data, error }) => {
        if (error) setError('Error al cargar cursos');
        setCursos(data || []);
        setCursoActivo((data && data[0]) || null);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsAdmin(localStorage.getItem('adminMode') === 'true');
    }
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Cargando cursos...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-400">{error}</div>;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-start py-10 px-2">
      {isAdmin && <CursosAdminPanel />}
      {/* Header */}
      <div className="w-full flex justify-end items-center mb-8 px-2 max-w-7xl mx-auto">
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-full bg-neutral-900 text-white font-semibold border border-neutral-700">Próximamente</button>
          <button className="px-3 py-2 rounded-full bg-neutral-900 text-white font-semibold border border-neutral-700">?</button>
          <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-bold border border-neutral-700">MU</div>
        </div>
      </div>
      {/* Título */}
      <h1 className="text-2xl md:text-3xl font-light text-center mb-8">
        Hola <span className="text-yellow-400 font-bold">{primerNombre}</span>, ¿Qué quieres aprender hoy?
      </h1>
      {/* Botones de cursos */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {cursos.length === 0 && <div className="text-neutral-400">No hay cursos disponibles.</div>}
        {cursos.map((curso) => (
          <div
            key={curso.id}
            className="group"
            onMouseEnter={() => setCursoActivo(curso)}
          >
            <button
              onClick={() => navigate(`/cursos/${curso.id}`)}
              className={`px-4 py-3 rounded-lg border border-white font-black uppercase tracking-wide text-base md:text-lg bg-black transition-all duration-200 ${cursoActivo && cursoActivo.id === curso.id ? 'bg-white' : 'text-white hover:bg-white'}`}
              style={{ minWidth: 180 }}
            >
              <span className={`transition-colors duration-200 ${cursoActivo && cursoActivo.id === curso.id ? 'text-green-400' : 'group-hover:text-green-400'}`}>{curso.nombre}</span>
            </button>
          </div>
        ))}
      </div>
      {/* Área principal de curso seleccionado */}
      {cursoActivo && (
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full max-w-4xl mb-10">
          <img src={cursoActivo.imagen} alt={cursoActivo.nombre} className="w-64 h-64 object-cover rounded-xl border-4 border-green-400 shadow-lg bg-black" />
          <div className="flex-1 flex flex-col items-center md:items-start">
            <div className="font-black text-2xl mb-2 text-green-400">{cursoActivo.nombre}</div>
            <div className="text-base text-neutral-200 mb-6 text-center md:text-left">{cursoActivo.descripcion}</div>
            <button
              className="px-8 py-3 rounded-full bg-white text-black font-bold hover:bg-yellow-400 transition text-lg"
              onClick={() => navigate(`/cursos/${cursoActivo.id}`)}
            >
              Ingresar
            </button>
          </div>
        </div>
      )}
      {/* Botones secundarios */}
      <div className="flex flex-col items-center gap-3 mb-10">
        <button className="px-6 py-2 rounded-full border border-white text-white font-semibold bg-black hover:bg-neutral-900 transition">¿No sabes por dónde comenzar?</button>
        <button className="px-6 py-2 rounded-full border border-white text-white font-semibold bg-black hover:bg-neutral-900 transition flex items-center gap-2"><span role="img" aria-label="bonus">🎁</span> Bonus</button>
      </div>
      {/* Footer */}
      <footer className="w-full text-center text-neutral-400 text-sm py-4">Keep Growing.</footer>
    </div>
  );
};

export default CursosPage; 