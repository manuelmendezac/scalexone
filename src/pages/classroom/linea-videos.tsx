// Página de línea de videos para classroom, idéntica a cursos pero adaptada a las tablas de classroom
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../supabase';
import ModalFuturista from '../../components/ModalFuturista';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const LineaVideosClassroom = () => {
  const [searchParams] = useSearchParams();
  const modulo_id = searchParams.get('modulo_id');
  const navigate = useNavigate();
  const location = useLocation();
  const [modulo, setModulo] = useState<any>(null);
  const [clases, setClases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [claseActual, setClaseActual] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [completados, setCompletados] = useState<{[key:number]:boolean}>({});
  // Descripción y materiales
  const [showEditDescripcion, setShowEditDescripcion] = useState(false);
  const [descripcionHtml, setDescripcionHtml] = useState<string>('');
  const [descMsg, setDescMsg] = useState<string|null>(null);
  const [materiales, setMateriales] = useState<any[]>([]);
  const [showEditMateriales, setShowEditMateriales] = useState(false);
  const [materialTitulo, setMaterialTitulo] = useState('');
  const [materialUrl, setMaterialUrl] = useState('');
  const [materialFile, setMaterialFile] = useState<File|null>(null);
  const [materialMsg, setMaterialMsg] = useState<string|null>(null);
  const [materialLoading, setMaterialLoading] = useState(false);

  useEffect(() => {
    setIsAdmin(localStorage.getItem('adminMode') === 'true');
    if (modulo_id) fetchModuloYVideos();
  }, [modulo_id]);

  const fetchModuloYVideos = async () => {
    setLoading(true);
    // Traer datos del módulo
    const { data: mod } = await supabase.from('classroom_modulos').select('*').eq('id', modulo_id).single();
    setModulo(mod);
    // Traer videos asociados
    const { data: vids } = await supabase.from('videos_classroom_modulo').select('*').eq('modulo_id', modulo_id).order('orden', { ascending: true });
    setClases(vids || []);
    // Traer descripción
    const { data: desc } = await supabase.from('modulos_descripcion').select('*').eq('modulo_id', modulo_id).single();
    setDescripcionHtml(desc?.descripcion_html || '');
    // Traer materiales
    const { data: mats } = await supabase.from('modulos_materiales').select('*').eq('modulo_id', modulo_id);
    setMateriales(mats || []);
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

  const clasesOrdenadas = [...clases].sort((a, b) => (a.orden || 0) - (b.orden || 0));
  const videoActual = clasesOrdenadas[claseActual] || {};
  const esUltimoVideo = claseActual === clasesOrdenadas.length - 1;
  const embedUrl = toEmbedUrl(videoActual.url);

  // Guardar descripción
  async function handleSaveDescripcion() {
    if (!modulo?.id) {
      setDescMsg('Error: modulo_id vacío o inválido');
      return;
    }
    setDescMsg(null);
    try {
      // Verificar si ya existe
      const { data: existente } = await supabase
        .from('modulos_descripcion')
        .select('id')
        .eq('modulo_id', modulo.id)
        .single();
      let error;
      if (existente) {
        ({ error } = await supabase
          .from('modulos_descripcion')
          .update({ descripcion_html: descripcionHtml })
          .eq('id', existente.id));
      } else {
        ({ error } = await supabase
          .from('modulos_descripcion')
          .insert([{ modulo_id: modulo.id, descripcion_html: descripcionHtml }]));
      }
      if (error) {
        setDescMsg('Error al guardar: ' + error.message + ' | modulo_id: ' + modulo.id);
        return;
      }
      setDescMsg('¡Guardado con éxito!');
      setShowEditDescripcion(false);
    } catch (err: any) {
      setDescMsg('Error inesperado: ' + (err.message || err));
    }
  }

  // Guardar material (nuevo o archivo)
  async function handleAddMaterialV2(e: React.FormEvent) {
    e.preventDefault();
    if (!modulo?.id) {
      setMaterialMsg('Error: modulo_id vacío o inválido');
      return;
    }
    setMaterialMsg(null);
    setMaterialLoading(true);
    let url = materialUrl;
    try {
      // Si hay archivo, subirlo
      if (materialFile) {
        const ext = materialFile.name.split('.').pop();
        const fileName = `material_${modulo.id}_${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('cursos').upload(fileName, materialFile, { upsert: true });
        if (uploadError) {
          setMaterialLoading(false);
          setMaterialMsg('Error al subir archivo: ' + uploadError.message);
          return;
        }
        const { data: publicUrlData } = supabase.storage.from('cursos').getPublicUrl(fileName);
        url = publicUrlData?.publicUrl || url;
      }
      const { error } = await supabase
        .from('modulos_materiales')
        .insert([{ titulo: materialTitulo, url, modulo_id: modulo.id }]);
      if (error) {
        setMaterialMsg('Error al guardar: ' + error.message + ' | modulo_id: ' + modulo.id);
        setMaterialLoading(false);
        return;
      }
      // Recargar materiales
      const { data } = await supabase
        .from('modulos_materiales')
        .select('*')
        .eq('modulo_id', modulo.id);
      setMateriales(data || []);
      setMaterialTitulo('');
      setMaterialUrl('');
      setMaterialFile(null);
      setMaterialMsg('¡Guardado con éxito!');
      setMaterialLoading(false);
    } catch (err: any) {
      setMaterialMsg('Error inesperado: ' + (err.message || err));
      setMaterialLoading(false);
    }
  }

  // Eliminar material
  async function handleDeleteMaterial(id: string) {
    await supabase
      .from('modulos_materiales')
      .delete()
      .eq('id', id);
    setMateriales(materiales.filter(m => m.id !== id));
  }

  if (loading) return <div className="text-cyan-400 text-center py-10">Cargando módulo...</div>;

  return (
    <div className={`min-h-screen bg-black text-white flex flex-col ${fullscreen ? '' : 'md:flex-row'} px-1 sm:px-2`}>
      {/* Panel principal mejorado */}
      <div className={`flex-1 flex flex-col items-center justify-center ${fullscreen ? 'fixed inset-0 z-50 bg-black overflow-auto' : 'p-1 sm:p-2 md:p-8'} transition-all duration-300`} style={fullscreen ? {maxWidth: '100vw', maxHeight: '100vh', overflow: 'auto'} : {}}>
        <div className={`w-full ${fullscreen ? '' : 'max-w-6xl'} bg-gradient-to-br from-neutral-950 to-black rounded-3xl shadow-2xl p-0 md:p-0 flex flex-col items-center border border-cyan-900/40`} style={fullscreen ? {minHeight: '100vh', justifyContent: 'center', alignItems: 'center', display: 'flex', padding: 0} : {}}>
          {/* Video grande y protagonista, sin bordes extras */}
          <div className={`relative w-full aspect-video bg-black overflow-visible flex flex-col items-center justify-center border-b-4 border-cyan-900/30 shadow-lg`} style={fullscreen ? {position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 100, background: '#000', margin: 0, borderRadius: 0, padding: 0, minHeight: '100vh', maxHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'} : {width: '100%', minHeight: 200, maxHeight: 700, margin: 0, borderRadius: 0, background: '#000', padding: 0}}>
            {/* Flecha para volver atrás */}
            <button
              className="absolute top-2 left-2 sm:top-4 sm:left-4 z-40 bg-black/60 hover:bg-cyan-900 text-cyan-200 p-1 sm:p-2 rounded-full shadow border border-cyan-800 transition"
              style={{fontSize: 18, opacity: 0.7, minWidth: 28, minHeight: 28, display: 'flex', alignItems: 'center', justifyContent: 'center'}}
              onClick={() => window.history.back()}
              title="Volver atrás"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            {/* Botón pantalla completa y ESC */}
            <button
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-30 bg-cyan-700 hover:bg-cyan-500 text-white p-2 rounded-full shadow-lg border border-cyan-400 transition"
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
              <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-30 flex items-center gap-2 bg-black/70 px-2 sm:px-3 py-1 rounded-full text-cyan-200 text-xs sm:text-base font-bold shadow-lg">
                <span className="hidden md:inline">Presiona</span> <kbd className="bg-cyan-800 px-2 py-1 rounded text-white font-mono">ESC</kbd> <span className="hidden md:inline">para salir</span>
              </div>
            )}
            {embedUrl ? (
              <iframe
                src={embedUrl + '?autoplay=0&title=0&byline=0&portrait=0'}
                title={videoActual.titulo}
                className="w-full h-full min-h-[180px] sm:min-h-[200px] md:min-h-[400px] max-w-[100vw]"
                allow="autoplay; fullscreen"
                allowFullScreen
                style={fullscreen ? { border: 'none', width: '100vw', height: '100vh', aspectRatio: '16/9', maxHeight: '100vh', borderRadius: 0, background: '#000' } : { border: 'none', width: '100%', height: '100%', aspectRatio: '16/9', maxHeight: 700, borderRadius: 0, background: '#000' }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-cyan-400 text-lg">No hay video para mostrar</div>
            )}
          </div>
          {/* Solo mostrar el resto del layout si no está en fullscreen */}
          {!fullscreen && (
            <>
              {/* Título grande debajo del video */}
              <div className="w-full flex flex-col items-center mb-2 mt-4 sm:mb-4 sm:mt-6 px-1 sm:px-2 md:px-0">
                <div className="flex items-center gap-3">
                  <span className="text-cyan-200 text-lg sm:text-xl md:text-3xl font-bold uppercase tracking-tight text-center bg-cyan-900/20 px-2 sm:px-4 md:px-6 py-2 md:py-3 rounded-xl shadow">
                    {videoActual.titulo || 'Sin título'}
                  </span>
                  <button
                    className={`ml-2 px-3 py-1 rounded-full text-xs font-bold transition-all border ${completados[claseActual] ? 'bg-green-500 text-black border-green-600' : 'bg-neutral-800 text-cyan-300 border-cyan-700 hover:bg-cyan-900'}`}
                    onClick={() => {
                      setCompletados(prev => ({...prev, [claseActual]: true}));
                      if (claseActual < clasesOrdenadas.length - 1) {
                        setTimeout(() => setClaseActual(prev => prev + 1), 400);
                      }
                    }}
                    disabled={completados[claseActual]}
                  >
                    {completados[claseActual] ? 'Completado ✓' : 'Marcar como completado'}
                  </button>
                </div>
              </div>
              {/* Botones de navegación */}
              <div className="flex gap-4 mt-2 justify-center">
                <button
                  className="bg-cyan-700 hover:bg-cyan-500 text-white p-2 rounded-full shadow-md transition-all disabled:opacity-40"
                  onClick={() => setClaseActual((prev) => Math.max(prev - 1, 0))}
                  disabled={claseActual === 0}
                  aria-label="Anterior"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  className="bg-cyan-700 hover:bg-cyan-500 text-white p-2 rounded-full shadow-md transition-all disabled:opacity-40"
                  onClick={() => setClaseActual((prev) => Math.min(prev + 1, clasesOrdenadas.length - 1))}
                  disabled={esUltimoVideo}
                  aria-label="Siguiente"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
              {/* Sección de descripción y materiales */}
              <div className="w-full flex flex-col md:flex-row gap-6 mt-8">
                <div className="flex-1 bg-neutral-900 rounded-2xl border-2 border-cyan-700 p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-cyan-400 text-lg font-bold">Sobre este módulo</span>
                    {isAdmin && (
                      <button className="bg-cyan-700 text-white px-3 py-1 rounded text-xs font-bold" onClick={() => setShowEditDescripcion(true)}>Editar</button>
                    )}
                  </div>
                  <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: descripcionHtml }} />
                </div>
                <div className="flex-1 bg-neutral-900 rounded-2xl border-2 border-green-700 p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-400 text-lg font-bold">Material y herramientas</span>
                    {isAdmin && (
                      <button className="bg-green-700 text-white px-3 py-1 rounded text-xs font-bold" onClick={() => setShowEditMateriales(true)}>Editar</button>
                    )}
                  </div>
                  <ul className="list-disc pl-5">
                    {materiales.map((m) => (
                      <li key={m.id} className="mb-2">
                        <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-green-300 hover:underline">{m.titulo}</a>
                        {isAdmin && (
                          <button className="ml-2 text-xs text-red-400 underline" onClick={() => handleDeleteMaterial(m.id)}>Eliminar</button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      {/* Sidebar de videos */}
      {!fullscreen && (
        <div className="w-full md:w-[320px] bg-gradient-to-br from-neutral-950 to-black p-2 sm:p-4 md:p-6 flex flex-col gap-4 sm:gap-6 rounded-3xl border-l-4 border-cyan-900/30 shadow-2xl min-h-[220px] sm:min-h-[320px] md:min-h-screen transition-all duration-300">
          {/* Solo mostrar el botón de editar si es admin */}
          {isAdmin && (
            <button
              className="mb-4 sm:mb-6 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-cyan-700 hover:bg-cyan-500 text-white font-bold shadow transition-all text-base sm:text-lg w-full"
              onClick={() => navigate(`/classroom/editar-videos?modulo_id=${modulo_id}`)}
            >
              Editar videos del módulo
            </button>
          )}
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-cyan-300 tracking-tight uppercase text-center drop-shadow-glow">Clases del módulo</h3>
          {clasesOrdenadas.map((v, idx) => {
            let thumb = v.miniatura_url;
            if ((!thumb || thumb === 'null') && v.url) {
              const ytMatch = v.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
              if (ytMatch) thumb = `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
              const vimeoMatch = v.url.match(/vimeo\.com\/(\d+)/);
              if (vimeoMatch) thumb = `https://vumbnail.com/${vimeoMatch[1]}.jpg`;
            }
            return (
              <div
                key={v.id}
                className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition border-2 ${v.id === videoActual.id ? 'bg-cyan-900/30 border-cyan-400' : 'bg-neutral-900 border-neutral-800 hover:bg-cyan-900/10'} group`}
                onClick={() => setClaseActual(idx)}
                style={{ minHeight: 110 }}
              >
                <div className="flex-shrink-0 w-32 h-20 bg-black rounded-xl overflow-hidden flex items-center justify-center border-2 border-cyan-800 group-hover:border-cyan-400 transition">
                  {thumb ? (
                    <img src={thumb} alt={v.titulo} className="w-full h-full object-cover" />
                  ) : v.url && (v.url.endsWith('.mp4') || v.url.endsWith('.webm')) ? (
                    <video src={v.url} className="w-full h-full object-cover" muted playsInline preload="metadata" style={{pointerEvents:'none'}} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-cyan-400">Sin video</div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-center min-w-0">
                  <div className="font-bold text-cyan-200 text-base truncate mb-1" style={{fontSize:'1rem'}}>{v.titulo}</div>
                  <div className="text-xs text-cyan-400 opacity-70">Video</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LineaVideosClassroom;