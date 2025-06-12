import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';

// Reutilizamos el tipo de video
interface VideoComplementario {
  id: string;
  curso_id: string;
  categoria: string;
  titulo: string;
  ponente: string;
  imagen: string;
  video_url: string;
  orden: number;
  modulo_idx?: number;
}

const ModulosCurso = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [modulos, setModulos] = useState<any[]>([]);
  const [videos, setVideos] = useState<VideoComplementario[]>([]);
  const [loading, setLoading] = useState(true);
  const [moduloActivo, setModuloActivo] = useState<number>(0);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // Obtener módulos
      const { data: portada } = await supabase.from('cursos_portada').select('*').eq('curso_id', id).single();
      let modArr = (portada && portada.modulos) ? portada.modulos : [];
      if (!Array.isArray(modArr)) modArr = [];
      setModulos(modArr);
      // Obtener videos
      const { data: videosData } = await supabase.from('videos_complementarios').select('*').eq('curso_id', id);
      setVideos((videosData as VideoComplementario[]) || []);
      setLoading(false);
    }
    if (id) fetchData();
  }, [id]);

  if (loading) return <div className="text-cyan-400 text-center py-10">Cargando módulos...</div>;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-cyan-400 mb-8">Módulos del Curso</h1>
      {/* Barra de navegación de módulos */}
      <div className="flex flex-wrap gap-3 mb-10 justify-center">
        {modulos.map((mod, idx) => (
          <button
            key={idx}
            className={`px-5 py-2 rounded-full border font-bold transition-all text-base ${moduloActivo === idx ? 'bg-cyan-400 text-black border-cyan-400' : 'bg-black text-cyan-300 border-cyan-700 hover:bg-cyan-900/20'}`}
            onClick={() => setModuloActivo(idx)}
          >
            Módulo {idx + 1}
          </button>
        ))}
      </div>
      {/* Contenido del módulo activo */}
      {modulos.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-2">{modulos[moduloActivo].titulo}</h2>
          <p className="text-white/80 mb-6">{modulos[moduloActivo].descripcion}</p>
          <div className="grid md:grid-cols-2 gap-8">
            {videos.filter(v => v.modulo_idx === moduloActivo).length === 0 && (
              <div className="text-cyan-300 col-span-2">No hay videos en este módulo.</div>
            )}
            {videos.filter(v => v.modulo_idx === moduloActivo).map(video => (
              <div key={video.id} className="bg-neutral-900 rounded-2xl p-8 shadow-xl flex flex-col min-h-[260px] justify-between border border-neutral-800">
                <div className="flex items-center gap-4 mb-4">
                  <img src={video.imagen} alt={video.titulo} className="w-16 h-16 object-cover rounded-full border-2 border-cyan-400 bg-black" />
                  <div>
                    <div className="text-lg font-bold text-cyan-200 mb-1">{video.titulo}</div>
                    <div className="text-green-400 text-sm">{video.ponente}</div>
                  </div>
                </div>
                <a href={video.video_url} target="_blank" rel="noopener noreferrer" className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 rounded-full mt-auto text-center transition">Iniciar</a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModulosCurso; 