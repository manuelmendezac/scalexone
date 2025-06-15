// Página de línea de videos para classroom (idéntica a cursos, adaptada)
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';
import ModalFuturista from '../../components/ModalFuturista';
import { ChevronLeft, ChevronRight, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';

const ModuloClassroom = () => {
  const [searchParams] = useSearchParams();
  const modulo_id = searchParams.get('modulo_id');
  const navigate = useNavigate();
  const [modulo, setModulo] = useState<any>(null);
  const [clases, setClases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [claseActual, setClaseActual] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [videos, setVideos] = useState<any[]>([]);
  const [editorLoading, setEditorLoading] = useState(false);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [nuevoVideo, setNuevoVideo] = useState<any>({ titulo: '', descripcion: '', url: '', miniatura_url: '', orden: 0 });
  const [fullscreen, setFullscreen] = useState(false);
  const [editDescripcion, setEditDescripcion] = useState('');
  const [showEditDescripcion, setShowEditDescripcion] = useState(false);

  useEffect(() => {
    setIsAdmin(localStorage.getItem('adminMode') === 'true');
    if (modulo_id) fetchModuloYVideos();
  }, [modulo_id]);

  const fetchModuloYVideos = async () => {
    setLoading(true);
    // Traer datos del módulo
    const { data: mod } = await supabase.from('classroom_modulos').select('*').eq('id', modulo_id).single();
    setModulo(mod);
    setEditDescripcion(mod?.descripcion || '');
    // Traer videos asociados
    const { data: vids } = await supabase.from('videos_classroom_modulo').select('*').eq('modulo_id', modulo_id).order('orden', { ascending: true });
    setClases(vids || []);
    setLoading(false);
  };

  // Utilidad para transformar links normales a embed
  function toEmbedUrl(url: string): string {
    if (!url) return '';
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    return url;
  }

  function getVideoThumbnail(url: string): string | null {
    if (!url) return null;
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
    if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://vumbnail.com/${vimeoMatch[1]}.jpg`;
    return null;
  }

  const clasesOrdenadas = [...clases].sort((a, b) => (a.orden || 0) - (b.orden || 0));
  const videoActual = clasesOrdenadas[claseActual] || {};
  const videosSiguientes = clasesOrdenadas.slice(claseActual + 1);
  const esUltimoVideo = claseActual === clasesOrdenadas.length - 1;
  const embedUrl = toEmbedUrl(videoActual.url);

  // Edición de descripción del módulo (solo admin)
  const handleGuardarDescripcion = async () => {
    if (!modulo?.id) return;
    const { error } = await supabase.from('classroom_modulos').update({ descripcion: editDescripcion }).eq('id', modulo.id);
    if (!error) {
      setModulo((prev: any) => ({ ...prev, descripcion: editDescripcion }));
      setShowEditDescripcion(false);
    }
  };

  if (loading) return <div className="text-cyan-400 text-center py-10">Cargando módulo y videos...</div>;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row">
      {/* Panel principal */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-3xl bg-neutral-900 rounded-2xl shadow-xl p-6 flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-2 text-cyan-400">{videoActual.titulo || modulo?.titulo}</h2>
          <p className="mb-4 text-cyan-200">{videoActual.descripcion || modulo?.descripcion}</p>
          <div className="w-full aspect-video bg-black rounded-xl overflow-hidden mb-4 flex items-center justify-center">
            {embedUrl ? (
              <iframe
                src={embedUrl + '?autoplay=0&title=0&byline=0&portrait=0'}
                title={videoActual.titulo}
                className="w-full h-full"
                allow="autoplay; fullscreen"
                allowFullScreen
                style={{ border: 'none' }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-cyan-400 text-lg">No hay video para mostrar</div>
            )}
          </div>
          {/* Botones de navegación y ver clases */}
          <div className="flex gap-4 mt-2">
            <button
              className="bg-cyan-700 hover:bg-cyan-500 text-white px-4 py-2 rounded-full font-bold"
              onClick={() => setClaseActual((prev) => Math.max(prev - 1, 0))}
              disabled={claseActual === 0}
            >
              ← Anterior
            </button>
            <button
              className="bg-cyan-700 hover:bg-cyan-500 text-white px-4 py-2 rounded-full font-bold"
              onClick={() => setClaseActual((prev) => Math.min(prev + 1, clasesOrdenadas.length - 1))}
              disabled={esUltimoVideo}
            >
              Siguiente →
            </button>
            {isAdmin && (
              <button
                className="bg-cyan-700 hover:bg-cyan-500 text-white px-4 py-2 rounded-full font-bold"
                onClick={() => navigate(`/classroom/editar-videos?modulo_id=${modulo.id}`)}
              >
                Editar videos del módulo
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Sidebar de videos */}
      <div className="w-full md:w-96 bg-neutral-950 p-6 flex flex-col gap-4">
        <h3 className="text-xl font-bold mb-2 text-cyan-300">Clases del módulo</h3>
        {clasesOrdenadas.map((v, idx) => (
          <div
            key={v.id}
            className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition border ${v.id === videoActual.id ? 'bg-cyan-900/30 border-cyan-400' : 'bg-neutral-900 border-neutral-800 hover:bg-cyan-900/10'}`}
            onClick={() => setClaseActual(idx)}
          >
            <img src={v.miniatura_url} alt={v.titulo} className="w-20 h-14 object-cover rounded-lg" />
            <div>
              <div className="font-bold text-cyan-200 text-base">{v.titulo}</div>
              <div className="text-xs text-cyan-400">Video</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModuloClassroom; 