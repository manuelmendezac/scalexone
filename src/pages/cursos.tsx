import React, { useEffect } from 'react';
import useNeuroState, { useHydration } from '../store/useNeuroState';
import CursosAdminPanel from '../components/CursosAdminPanel';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import useCursosStore from '../store/useCursosStore';
import LoadingScreen from '../components/LoadingScreen';
import GlobalLoadingSpinner from '../components/GlobalLoadingSpinner';

const CursosPage: React.FC = () => {
  const { userName, userInfo, updateUserInfo } = useNeuroState();
  const nombre = userInfo?.name || userName || 'Master';
  const primerNombre = nombre.split(' ')[0];
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = React.useState(false);
  const isHydrated = useHydration();

  const { 
    cursos, 
    cursoActivo, 
    loading, 
    error, 
    fetchCursos, 
    setCursoActivo 
  } = useCursosStore();

  useEffect(() => {
    if (!isHydrated) return;
    fetchCursos();
  }, [isHydrated, fetchCursos]);

  useEffect(() => {
    if (!isHydrated) return;
    if (typeof window !== 'undefined') {
      setIsAdmin(localStorage.getItem('adminMode') === 'true');
    }
  }, [isHydrated]);

  useEffect(() => {
    if (!isHydrated || !userInfo?.email || (userInfo.name && userInfo.name !== userInfo.email)) return;
    
    supabase
      .from('usuarios')
      .select('name, community_id')
      .eq('email', userInfo.email)
      .single()
      .then(({ data }) => {
        if (data && ((data.name && data.name !== userInfo.name) || 
            (data.community_id && data.community_id !== userInfo.community_id))) {
          updateUserInfo({
            name: data.name,
            email: userInfo.email,
            community_id: data.community_id || 'default'
          });
        }
      });
  }, [isHydrated, userInfo, updateUserInfo]);

  if (error) return <div className="min-h-screen flex items-center justify-center text-red-400">{error}</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      {isAdmin && <CursosAdminPanel />}
      {/* Header */}
      <div className="w-full flex justify-end items-center mb-8 px-2 max-w-7xl mx-auto">
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-full bg-neutral-900 text-white font-semibold border border-neutral-700">Próximamente</button>
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
              className={`px-4 py-3 rounded-lg border border-white font-black uppercase tracking-wide text-base md:text-lg bg-neutral-800 transition-all duration-200 ${cursoActivo && cursoActivo.id === curso.id ? 'bg-white' : 'text-white hover:bg-white'}`}
              style={{ minWidth: 180 }}
            >
              <span className={`transition-colors duration-200 ${cursoActivo && cursoActivo.id === curso.id ? 'text-green-400' : 'group-hover:text-green-400'}`}>{curso.nombre}</span>
            </button>
          </div>
        ))}
      </div>
      {/* Área principal de curso seleccionado */}
      {cursoActivo && (
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full max-w-4xl mb-10 mx-auto text-center">
          <img src={cursoActivo.imagen} alt={cursoActivo.nombre} className="w-64 h-64 object-cover rounded-xl border-4 border-green-400 shadow-lg bg-black mx-auto" />
          <div className="flex-1 flex flex-col items-center md:items-center">
            <div className="font-black text-2xl mb-2 text-green-400">{cursoActivo.nombre}</div>
            <div className="text-base text-neutral-200 mb-6 text-center">{cursoActivo.descripcion}</div>
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