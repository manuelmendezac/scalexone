import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';
import NeonSpinner from '../../components/NeonSpinner';
import { Award, Film, CheckCircle, Edit } from 'lucide-react';
import useNeuroState from '../../store/useNeuroState';

const ModulosCurso = () => {
  const { id } = useParams(); // id del curso
  const navigate = useNavigate();
  const neuro = useNeuroState();
  const [modulos, setModulos] = useState<any[]>([]);
  const [progreso, setProgreso] = useState<Record<string, string[]>>({}); // { moduloId: [videoIds] }
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const userId = neuro.userInfo?.id;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // 1. Obtener módulos del curso
      const { data: modulosData } = await supabase
        .from('modulos_curso')
        .select('*')
        .eq('curso_id', id)
        .order('orden', { ascending: true });
      setModulos(modulosData || []);

      // 2. Obtener progreso del usuario
      if (userId) {
        const { data: progresoData } = await supabase
          .from('progreso_academico_usuario')
          .select('modulos_ids, videos_ids')
          .eq('usuario_id', userId)
          .single();
        // Mapear videos completados por módulo
        const videosPorModulo: Record<string, string[]> = {};
        (modulosData || []).forEach((mod: any) => {
          videosPorModulo[mod.id] = (progresoData?.videos_ids || []).filter((vid: string) => vid.startsWith(mod.id));
        });
        setProgreso(videosPorModulo);
      }

      // 3. Verificar si es admin
      if (neuro.userInfo?.rol === 'admin' || neuro.userInfo?.rol === 'superadmin') {
        setIsAdmin(true);
      }
      setLoading(false);
    };
    fetchData();
  }, [id, userId, neuro.userInfo?.rol]);

  const handleEditModulo = (moduloId: string) => {
    navigate(`/classroom/editar-videos?modulo_id=${moduloId}`);
  };

  return (
    <div className="min-h-screen bg-black text-yellow-100 flex flex-col items-center py-8 px-2">
      <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-8 drop-shadow-lg uppercase tracking-wider">Módulos del Curso</h1>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <NeonSpinner size={64} />
        </div>
      ) : (
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">
          {modulos.map((modulo) => {
            const videosCompletados = progreso[modulo.id]?.length || 0;
            const totalVideos = modulo.videos?.length || modulo.total_videos || 0;
            const completado = totalVideos > 0 && videosCompletados === totalVideos;
            return (
              <div
                key={modulo.id}
                className="relative bg-gradient-to-br from-black via-neutral-900 to-yellow-900/30 border-2 border-yellow-700 rounded-3xl shadow-xl p-6 flex flex-col gap-4 hover:scale-[1.02] transition-transform duration-200"
              >
                {/* Botón de edición solo para admins */}
                {isAdmin && (
                  <button
                    className="absolute top-4 right-4 bg-yellow-500 hover:bg-yellow-400 text-black rounded-full p-2 shadow-lg z-10"
                    title="Editar videos del módulo"
                    onClick={() => handleEditModulo(modulo.id)}
                  >
                    <Edit size={20} />
                  </button>
                )}
                <div className="flex items-center gap-4">
                  <Award className="text-yellow-400 w-8 h-8" />
                  <h2 className="text-2xl font-bold text-yellow-300 flex-1">{modulo.titulo}</h2>
                  {completado && <CheckCircle className="text-yellow-400 w-7 h-7" />}
                </div>
                <p className="text-yellow-200/90 text-base mb-2">{modulo.descripcion}</p>
                {/* Barra de progreso dorada */}
                <div className="w-full h-3 bg-yellow-900/40 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full transition-all duration-500"
                    style={{ width: totalVideos > 0 ? `${(videosCompletados / totalVideos) * 100}%` : '0%' }}
                  />
                </div>
                <div className="flex items-center gap-4 mb-2">
                  <span className="bg-yellow-500/20 px-3 py-1 rounded-full border border-yellow-500/30 text-yellow-400 font-bold text-sm">XP: {modulo.xp || 0}</span>
                  <span className="flex items-center gap-1 bg-yellow-500/20 px-3 py-1 rounded-full border border-yellow-500/30 text-yellow-400 font-bold text-sm">
                    <img src="/images/modulos/neurocoin.svg" alt="Coin" className="w-4 h-4" />
                    {modulo.monedas || 0}
                  </span>
                  <span className="text-yellow-300 text-sm">{videosCompletados} / {totalVideos} videos</span>
                </div>
                {/* Listado de videos en tarjetas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  {(modulo.videos || []).map((video: any, idx: number) => (
                    <div
                      key={video.id || idx}
                      className={`flex items-center gap-3 bg-neutral-900/80 border border-yellow-800/40 rounded-xl p-3 shadow hover:bg-yellow-900/20 transition-colors ${progreso[modulo.id]?.includes(video.id) ? 'ring-2 ring-yellow-400' : ''}`}
                    >
                      <Film className="text-yellow-400 w-6 h-6 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-semibold text-yellow-200 text-base truncate">{video.titulo || 'Video'}</div>
                        <div className="text-yellow-300 text-xs truncate">{video.descripcion || ''}</div>
                      </div>
                      {progreso[modulo.id]?.includes(video.id) && (
                        <CheckCircle className="text-yellow-400 w-5 h-5" />
                      )}
                    </div>
                  ))}
                </div>
                <button
                  className="mt-4 w-full py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-lg shadow-lg transition"
                  onClick={() => navigate(`/cursos/${id}/modulo/${modulo.orden || 0}`)}
                >
                  {completado ? 'Revisar módulo' : 'Entrar al módulo'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ModulosCurso; 