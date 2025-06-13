// Cambio fantasma para forzar build y deploy en Vercel
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';
import ModalFuturista from '../../components/ModalFuturista';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseStorage = createClient(supabaseUrl, supabaseAnonKey);

const ModuloDetalle = () => {
  const { id, moduloIdx } = useParams();
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

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // 1. Obtener la portada y los módulos embebidos
      const { data: portada } = await supabase.from('cursos_portada').select('*').eq('curso_id', id).single();
      let modArr = (portada && portada.modulos) ? portada.modulos : [];
      if (!Array.isArray(modArr)) modArr = [];
      const idx = parseInt(moduloIdx || '0', 10);
      const mod = modArr[idx] || {};
      // 2. Buscar el id real del módulo en la tabla 'modulos_curso' usando el curso y el título
      let moduloReal = null;
      if (mod.titulo) {
        let modData = null;
        let insertError = null;
        // Buscar el módulo existente
        const { data: foundMod, error: findError } = await supabase
          .from('modulos_curso')
          .select('*')
          .eq('curso_id', id)
          .eq('titulo', mod.titulo)
          .maybeSingle();
        modData = foundMod;
        if (!modData) {
          // Intentar crear el módulo si no existe
          const moduloToInsert: any = {
            curso_id: id,
            titulo: mod.titulo,
            descripcion: mod.descripcion || '',
            nivel: mod.nivel || '',
            orden: Number.isFinite(idx) ? idx : 0
          };
          const { data: newMod, error: insError } = await supabase
            .from('modulos_curso')
            .insert([moduloToInsert])
            .select()
            .maybeSingle();
          insertError = insError;
          if (insertError) {
            console.error('Error insertando módulo:', insertError);
          }
          if (newMod) {
            modData = newMod;
          }
        }
        if (!modData) {
          console.error('No se pudo obtener ni crear el módulo.');
        }
        moduloReal = modData;
      }
      // 3. Si existe, usar el id real; si no, fallback al objeto embebido
      setModulo(moduloReal ? { ...mod, id: moduloReal.id } : mod);
      // 4. Cargar videos desde la tabla videos_modulo usando el id real
      if (moduloReal?.id) {
        const { data: videosData } = await supabase
          .from('videos_modulo')
          .select('*')
          .eq('modulo_id', moduloReal.id)
          .order('orden', { ascending: true });
        setClases(videosData || []);
      } else if (Array.isArray(mod.clases) && mod.clases.length > 0) {
        setClases(mod.clases);
      } else {
        setClases([]);
      }
      setClaseActual(0);
      setLoading(false);
    }
    if (id && moduloIdx !== undefined) fetchData();
  }, [id, moduloIdx]);

  useEffect(() => {
    // Activar modo admin automáticamente
    localStorage.setItem('adminMode', 'true');
    setIsAdmin(true);
  }, []);

  useEffect(() => {
    if (!modulo?.id) return;
    setEditorLoading(true);
    supabase
      .from('videos_modulo')
      .select('*')
      .eq('modulo_id', modulo.id)
      .order('orden', { ascending: true })
      .then(({ data, error }) => {
        if (error) setEditorError('Error al cargar videos: ' + error.message);
        setVideos(data || []);
        setEditorLoading(false);
      });
  }, [modulo?.id, showEditor]);

  // Utilidad para transformar links normales a embed
  function toEmbedUrl(url: string): string {
    if (!url) return '';
    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
    if (ytMatch) {
      return `https://www.youtube.com/embed/${ytMatch[1]}`;
    }
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    // Si ya es embed o no se reconoce, devolver igual
    return url;
  }

  const clase = clases[claseActual] || {};
  const embedUrl = toEmbedUrl(clase.url);

  // Ordenar videos por el campo 'orden' antes de renderizar
  const clasesOrdenadas = [...clases].sort((a, b) => (a.orden || 0) - (b.orden || 0));

  const handleMiniaturaUpload = async (file: File, idx: number | null = null) => {
    if (!file) return;
    setEditorLoading(true);
    setEditorError(null);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2,8)}.${fileExt}`;
      const { data, error } = await supabaseStorage.storage.from('cursos').upload(fileName, file, { upsert: true });
      if (error) throw error;
      const { data: publicUrlData } = supabaseStorage.storage.from('cursos').getPublicUrl(fileName);
      if (idx === null) {
        setNuevoVideo((prev: any) => ({ ...prev, miniatura_url: publicUrlData?.publicUrl || '' }));
      } else {
        setVideos((prev) => prev.map((v, i) => i === idx ? { ...v, miniatura_url: publicUrlData?.publicUrl || '' } : v));
      }
      setSuccessMsg('Miniatura subida correctamente');
    } catch (err: any) {
      setEditorError('Error al subir miniatura: ' + (err.message || ''));
    }
    setEditorLoading(false);
  };

  const handleGuardarVideo = async (video: any, idx: number) => {
    setEditorLoading(true);
    setEditorError(null);
    setSuccessMsg(null);
    try {
      const { error } = await supabase
        .from('videos_modulo')
        .update({
          titulo: video.titulo,
          descripcion: video.descripcion,
          url: video.url,
          miniatura_url: video.miniatura_url,
          orden: video.orden,
        })
        .eq('id', video.id);
      if (error) throw error;
      setSuccessMsg('Video actualizado');
    } catch (err: any) {
      setEditorError('Error al guardar: ' + (err.message || ''));
    }
    setEditorLoading(false);
  };

  const handleEliminarVideo = async (videoId: string) => {
    setEditorLoading(true);
    setEditorError(null);
    setSuccessMsg(null);
    try {
      const { error } = await supabase.from('videos_modulo').delete().eq('id', videoId);
      if (error) throw error;
      setVideos((prev) => prev.filter((v) => v.id !== videoId));
      setSuccessMsg('Video eliminado');
    } catch (err: any) {
      setEditorError('Error al eliminar: ' + (err.message || ''));
    }
    setEditorLoading(false);
  };

  const handleAgregarVideo = async () => {
    setEditorLoading(true);
    setEditorError(null);
    setSuccessMsg(null);
    try {
      if (!nuevoVideo.titulo || !nuevoVideo.url) {
        setEditorError('El título y la URL del video son obligatorios');
        setEditorLoading(false);
        return;
      }
      if (!modulo?.id) {
        setEditorError('Error: No se encontró el ID del módulo. Intenta recargar la página o selecciona el módulo nuevamente.');
        setEditorLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('videos_modulo')
        .insert([{ ...nuevoVideo, modulo_id: modulo.id }])
        .select();
      if (error) throw error;
      setVideos((prev) => [...prev, data[0]]);
      setNuevoVideo({ titulo: '', descripcion: '', url: '', miniatura_url: '', orden: 0 });
      setSuccessMsg('Video agregado');
    } catch (err: any) {
      setEditorError('Error al agregar: ' + (err.message || ''));
    }
    setEditorLoading(false);
  };

  // Evento para salir con ESC en fullscreen
  useEffect(() => {
    if (!fullscreen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [fullscreen]);

  if (loading) return <div className="text-cyan-400 text-center py-10">Cargando módulo...</div>;

  return (
    <div className={`min-h-screen bg-black text-white flex flex-col ${fullscreen ? '' : 'md:flex-row'}`}>
      {/* Panel principal mejorado */}
      <div className={`flex-1 flex flex-col items-center justify-center ${fullscreen ? 'fixed inset-0 z-50 bg-black overflow-auto' : 'p-2 md:p-8'} transition-all duration-300`} style={fullscreen ? {maxWidth: '100vw', maxHeight: '100vh', overflow: 'auto'} : {}}>
        <div className={`w-full ${fullscreen ? '' : 'max-w-6xl'} bg-gradient-to-br from-neutral-950 to-black rounded-3xl shadow-2xl p-0 md:p-0 flex flex-col items-center border border-cyan-900/40`} style={fullscreen ? {minHeight: '100vh', justifyContent: 'center', alignItems: 'center', display: 'flex', padding: 0} : {}}>
          {/* Video grande y protagonista, sin bordes extras */}
          <div className={`relative w-full aspect-video bg-black ${fullscreen ? '' : 'rounded-t-3xl'} overflow-visible flex flex-col items-center justify-center border-b-4 border-cyan-900/30 shadow-lg`} style={fullscreen ? {minHeight: '60vh', maxHeight: '80vh', margin: 'auto', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'} : {minHeight: 400, maxHeight: 700}}>
            {/* Botón pantalla completa y ESC */}
            <button
              className="absolute top-4 right-4 z-30 bg-cyan-700 hover:bg-cyan-500 text-white p-2 rounded-full shadow-lg border border-cyan-400 transition"
              onClick={() => setFullscreen(f => !f)}
              title={fullscreen ? 'Salir de pantalla completa' : 'Ver en pantalla completa'}
              style={{boxShadow: '0 2px 12px #0008'}}
            >
              {fullscreen ? (
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19L5 23M5 23h6M5 23v-6M19 9l4-4m0 0v6m0-6h-6"/></svg>
              ) : (
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 9V5h4M19 5h4v4M5 19v4h4M19 23h4v-4"/></svg>
              )}
            </button>
            {fullscreen && (
              <div className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-black/70 px-3 py-1 rounded-full text-cyan-200 text-base font-bold shadow-lg">
                <span className="hidden md:inline">Presiona</span> <kbd className="bg-cyan-800 px-2 py-1 rounded text-white font-mono">ESC</kbd> <span className="hidden md:inline">para salir</span>
              </div>
            )}
            {embedUrl ? (
              <iframe
                src={embedUrl + '?autoplay=0&title=0&byline=0&portrait=0'}
                title={clase.titulo}
                className="w-full h-full min-h-[200px] md:min-h-[400px] max-w-[100vw] max-h-[70vh] md:max-h-[80vh] rounded-2xl"
                allow="autoplay; fullscreen"
                allowFullScreen
                style={{ border: 'none', width: '100%', height: '100%', aspectRatio: '16/9', maxHeight: fullscreen ? '70vh' : 700, borderRadius: fullscreen ? 24 : 0, background: '#000' }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-cyan-400 text-lg">No hay video para mostrar</div>
            )}
          </div>
          {/* Título grande debajo del video */}
          <div className="w-full flex flex-col items-center mb-4 mt-6 px-2 md:px-0">
            <span className="text-cyan-200 text-xl md:text-3xl font-bold uppercase tracking-tight text-center bg-cyan-900/20 px-4 md:px-6 py-2 md:py-3 rounded-xl shadow">
              {clase.titulo || 'Sin título'}
            </span>
          </div>
          {/* Botones de navegación */}
          <div className="flex gap-4 md:gap-6 mt-2 mb-8 justify-center flex-wrap px-2 md:px-0" style={fullscreen ? {marginBottom: 32, marginTop: 16, zIndex: 20} : {}}>
            <button
              className="bg-cyan-700 hover:bg-cyan-500 text-white px-6 md:px-8 py-2 md:py-3 rounded-full font-bold text-base md:text-lg shadow-md transition-all"
              onClick={() => setClaseActual((prev) => Math.max(prev - 1, 0))}
              disabled={claseActual === 0}
            >
              ← Anterior
            </button>
            <button
              className="bg-cyan-700 hover:bg-cyan-500 text-white px-6 md:px-8 py-2 md:py-3 rounded-full font-bold text-base md:text-lg shadow-md transition-all"
              onClick={() => setClaseActual((prev) => Math.min(prev + 1, clases.length - 1))}
              disabled={claseActual === clases.length - 1}
            >
              Siguiente →
            </button>
          </div>
        </div>
      </div>
      {/* Sidebar elegante y angosta, debajo en móvil */}
      <div className={`w-full md:w-[320px] bg-gradient-to-br from-neutral-950 to-black p-4 md:p-6 flex flex-col gap-6 rounded-3xl border-l-4 border-cyan-900/30 shadow-2xl min-h-[320px] md:min-h-screen transition-all duration-300 ${fullscreen ? 'hidden' : ''}`}
        style={{marginTop: fullscreen ? 0 : 24}}>
        {/* Solo mostrar el botón de editar si es admin */}
        {isAdmin && (
          <button
            className="mb-6 px-6 py-3 rounded-full bg-cyan-700 hover:bg-cyan-500 text-white font-bold shadow transition-all text-lg w-full"
            onClick={() => setShowEditor(true)}
          >
            Editar videos del módulo
          </button>
        )}
        <h3 className="text-3xl font-bold mb-6 text-cyan-300 tracking-tight uppercase text-center drop-shadow-glow">Clases del módulo</h3>
        {clasesOrdenadas.length === 0 && <div className="text-cyan-400 text-center">No hay videos cargados. Usa el editor admin para agregar clases.</div>}
        {clasesOrdenadas.map((c, idx) => (
          <div
            key={c.id || idx}
            className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition border-2 ${idx === claseActual ? 'bg-cyan-900/30 border-cyan-400 shadow-lg' : 'bg-neutral-900 border-neutral-800 hover:bg-cyan-900/10'} group`}
            onClick={() => setClaseActual(idx)}
            style={{ minHeight: 90 }}
          >
            <img
              src={c.miniatura_url || '/images/placeholder-video.png'}
              alt={c.titulo}
              className="w-16 h-12 object-cover rounded-xl border-2 border-cyan-800 group-hover:border-cyan-400 transition"
            />
            <div className="flex-1">
              <div className="font-bold text-cyan-200 text-lg uppercase tracking-tight group-hover:text-cyan-400 transition">{c.titulo}</div>
              <div className="text-xs text-cyan-400 mt-1">Video</div>
            </div>
          </div>
        ))}
      </div>
      {/* Modal de edición admin (sin cambios, ya implementado) */}
      <ModalFuturista open={showEditor} onClose={() => setShowEditor(false)}>
        <div className="p-2 w-full">
          <h3 className="text-xl font-bold text-cyan-400 mb-4 text-center">Editor de videos del módulo</h3>
          {editorLoading && <div className="text-cyan-300 mb-2">Cargando...</div>}
          {editorError && <div className="text-red-400 mb-2">{editorError}</div>}
          {successMsg && <div className="text-green-400 mb-2">{successMsg}</div>}
          {/* Listado y edición de videos existentes */}
          {videos.map((video, idx) => (
            <div key={video.id} className="mb-6 p-4 rounded-xl bg-[#101c2c] border border-cyan-900/40 flex flex-col gap-2">
              <label className="text-cyan-300 text-sm font-semibold mb-1">Título</label>
              <input
                className="px-3 py-2 rounded bg-black text-cyan-200 border border-cyan-700 mb-1"
                value={video.titulo}
                onChange={e => setVideos(videos.map((v, i) => i === idx ? { ...v, titulo: e.target.value } : v))}
                placeholder="Ej: Introducción al módulo"
              />
              <label className="text-cyan-300 text-sm font-semibold mb-1">Descripción <span className="text-cyan-500">(opcional)</span></label>
              <textarea
                className="px-3 py-2 rounded bg-black text-cyan-200 border border-cyan-700 mb-1"
                value={video.descripcion || ''}
                onChange={e => setVideos(videos.map((v, i) => i === idx ? { ...v, descripcion: e.target.value } : v))}
                placeholder="Breve descripción de la clase"
              />
              <label className="text-cyan-300 text-sm font-semibold mb-1">URL del video <span className="text-cyan-500">(Vimeo, YouTube, etc.)</span></label>
              <input
                className="px-3 py-2 rounded bg-black text-cyan-200 border border-cyan-700 mb-1"
                value={video.url}
                onChange={e => setVideos(videos.map((v, i) => i === idx ? { ...v, url: e.target.value } : v))}
                placeholder="https://vimeo.com/123456789"
              />
              <label className="text-cyan-300 text-sm font-semibold mb-1">Orden en la lista <span className="text-cyan-500" title="Determina la posición del video en la lista de clases">(1 = primero, 2 = segundo...)</span></label>
              <input
                className="px-3 py-2 rounded bg-black text-cyan-200 border border-cyan-700 mb-1"
                value={video.orden || ''}
                type="number"
                min={1}
                onChange={e => setVideos(videos.map((v, i) => i === idx ? { ...v, orden: parseInt(e.target.value) || '' } : v))}
                placeholder="Ej: 1"
              />
              <label className="text-cyan-300 text-sm font-semibold mb-1">Miniatura <span className="text-cyan-500">(opcional)</span></label>
              <div className="flex items-center gap-3 mb-2">
                {video.miniatura_url && <img src={video.miniatura_url} alt="Miniatura" className="w-20 h-14 object-cover rounded border border-cyan-700" />}
                <input type="file" accept="image/*" onChange={e => e.target.files && handleMiniaturaUpload(e.target.files[0], idx)} />
              </div>
              <div className="flex gap-3 mt-2">
                <button className="px-4 py-2 rounded bg-cyan-700 text-white font-bold" onClick={() => handleGuardarVideo(video, idx)} disabled={editorLoading}>Guardar</button>
                <button className="px-4 py-2 rounded bg-red-700 text-white font-bold" onClick={() => { if(window.confirm('¿Seguro que quieres eliminar este video?')) handleEliminarVideo(video.id); }} disabled={editorLoading}>Eliminar</button>
              </div>
            </div>
          ))}
          {/* Formulario para agregar nuevo video */}
          <div className="mt-8 p-4 rounded-xl bg-[#1a2a3f] border border-cyan-900/40 flex flex-col gap-2">
            <label className="text-cyan-300 text-sm font-semibold mb-1">Título</label>
            <input
              className="px-3 py-2 rounded bg-black text-cyan-200 border border-cyan-700 mb-1"
              value={nuevoVideo.titulo}
              onChange={e => setNuevoVideo({ ...nuevoVideo, titulo: e.target.value })}
              placeholder="Ej: Introducción al módulo"
            />
            <label className="text-cyan-300 text-sm font-semibold mb-1">Descripción <span className="text-cyan-500">(opcional)</span></label>
            <textarea
              className="px-3 py-2 rounded bg-black text-cyan-200 border border-cyan-700 mb-1"
              value={nuevoVideo.descripcion}
              onChange={e => setNuevoVideo({ ...nuevoVideo, descripcion: e.target.value })}
              placeholder="Breve descripción de la clase"
            />
            <label className="text-cyan-300 text-sm font-semibold mb-1">URL del video <span className="text-cyan-500">(Vimeo, YouTube, etc.)</span></label>
            <input
              className="px-3 py-2 rounded bg-black text-cyan-200 border border-cyan-700 mb-1"
              value={nuevoVideo.url}
              onChange={e => setNuevoVideo({ ...nuevoVideo, url: e.target.value })}
              placeholder="https://vimeo.com/123456789"
            />
            <label className="text-cyan-300 text-sm font-semibold mb-1">Orden en la lista <span className="text-cyan-500" title="Determina la posición del video en la lista de clases">(1 = primero, 2 = segundo...)</span></label>
            <input
              className="px-3 py-2 rounded bg-black text-cyan-200 border border-cyan-700 mb-1"
              value={nuevoVideo.orden || ''}
              type="number"
              min={1}
              onChange={e => setNuevoVideo((prev: any) => ({ ...prev, orden: parseInt(e.target.value) || '' }))}
              placeholder="Ej: 1"
            />
            <label className="text-cyan-300 text-sm font-semibold mb-1">Miniatura <span className="text-cyan-500">(opcional)</span></label>
            <div className="flex items-center gap-3 mb-2">
              {nuevoVideo.miniatura_url && <img src={nuevoVideo.miniatura_url} alt="Miniatura" className="w-20 h-14 object-cover rounded border border-cyan-700" />}
              <input type="file" accept="image/*" onChange={e => e.target.files && handleMiniaturaUpload(e.target.files[0], null)} />
            </div>
            <button className="px-4 py-2 rounded bg-green-700 text-white font-bold mt-2" onClick={async () => {
              // Si no se especifica orden, asignar el siguiente disponible
              let orden = nuevoVideo.orden;
              if (!orden || orden < 1) {
                orden = (videos.reduce((max, v) => v.orden > max ? v.orden : max, 0) || 0) + 1;
              }
              setNuevoVideo((prev: any) => ({ ...prev, orden }));
              await handleAgregarVideo();
            }} disabled={editorLoading}>Agregar video</button>
          </div>
          <button className="mt-8 px-4 py-2 rounded-full bg-cyan-700 hover:bg-cyan-500 text-white font-bold shadow w-full" onClick={() => setShowEditor(false)}>Cerrar</button>
        </div>
      </ModalFuturista>
    </div>
  );
};

export default ModuloDetalle; 