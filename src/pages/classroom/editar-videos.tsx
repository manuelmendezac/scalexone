// Página de edición de videos para classroom
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';
import ModalFuturista from '../../components/ModalFuturista';
import { HexColorPicker } from 'react-colorful';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import type { DropResult } from 'react-beautiful-dnd';

const EditarVideosClassroom = () => {
  const { modulo_id } = useParams();
  const navigate = useNavigate();
  const [modulo, setModulo] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editorLoading, setEditorLoading] = useState(false);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [nuevoVideo, setNuevoVideo] = useState<any>({ titulo: '', descripcion: '', url: '', miniatura_url: '', orden: 0 });

  useEffect(() => {
    setIsAdmin(localStorage.getItem('adminMode') === 'true');
    if (modulo_id) fetchModuloYVideos();
  }, [modulo_id]);

  const fetchModuloYVideos = async () => {
    setLoading(true);
    try {
      const { data: mod, error: modError } = await supabase
        .from('classroom_modulos')
        .select('*')
        .eq('id', modulo_id)
        .maybeSingle();

      if (modError) throw modError;

      if (!mod) {
        setEditorError(`No se encontró ningún módulo con el ID: ${modulo_id}`);
        setLoading(false);
        return;
      }
      
      setModulo(mod);
      
      const { data: vids, error: vidsError } = await supabase
        .from('videos_classroom_modulo')
        .select('*')
        .eq('modulo_id', modulo_id)
        .order('orden', { ascending: true });

      if (vidsError) throw vidsError;

      setVideos(vids || []);
    } catch (err: any) {
      console.error("Error al cargar datos del módulo:", err);
      setEditorError(err.message || "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
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

  const handleMiniaturaUpload = async (file: File, idx: number | null = null) => {
    if (!file) return;
    setEditorLoading(true);
    setEditorError(null);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2,8)}.${fileExt}`;
      const { data, error } = await supabase.storage.from('classroom-videos').upload(fileName, file, { upsert: true });
      if (error) throw error;
      const { data: publicUrlData } = supabase.storage.from('classroom-videos').getPublicUrl(fileName);
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
        .from('videos_classroom_modulo')
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
      const { error } = await supabase.from('videos_classroom_modulo').delete().eq('id', videoId);
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
        .from('videos_classroom_modulo')
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

  if (loading) return <div className="text-cyan-400 text-center py-10">Cargando módulo y videos...</div>;

  if (editorError) {
    return (
      <div className="min-h-screen w-full py-12 px-2 flex flex-col items-center justify-center text-center" style={{ background: '#10192b' }}>
        <h1 className="text-2xl font-bold text-red-500 mb-4">Error al cargar</h1>
        <p className="text-red-400 mb-6">{editorError}</p>
        <button className="px-4 py-2 rounded bg-cyan-700 text-white font-bold shadow hover:bg-cyan-500 transition" onClick={() => navigate(-1)}>Volver</button>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full py-12 px-2" style={{ background: '#10192b' }}>
      <h1 className="text-3xl font-bold text-white text-center mb-8">Editar videos del módulo: <span className="text-cyan-400">{modulo?.titulo}</span></h1>
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <button className="mb-6 px-4 py-2 rounded bg-cyan-700 text-white font-bold shadow hover:bg-cyan-500 transition" onClick={() => navigate(-1)}>Volver</button>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Videos del módulo</h2>
        {videos.length === 0 && <div className="text-gray-500 mb-4">No hay videos agregados aún.</div>}
        {videos.map((video, idx) => (
          <div key={video.id} className="mb-6 p-4 rounded-xl bg-[#101c2c] border border-cyan-900/40 flex flex-col gap-2">
            <label className="text-cyan-300 text-sm font-semibold mb-1">Título</label>
            <input className="px-3 py-2 rounded bg-black text-cyan-200 border border-cyan-700 mb-1" value={video.titulo} onChange={e => setVideos(videos.map((v, i) => i === idx ? { ...v, titulo: e.target.value } : v))} placeholder="Ej: Introducción al módulo" />
            <label className="text-cyan-300 text-sm font-semibold mb-1">Descripción <span className="text-cyan-500">(opcional)</span></label>
            <textarea className="px-3 py-2 rounded bg-black text-cyan-200 border border-cyan-700 mb-1" value={video.descripcion || ''} onChange={e => setVideos(videos.map((v, i) => i === idx ? { ...v, descripcion: e.target.value } : v))} placeholder="Breve descripción de la clase" />
            <label className="text-cyan-300 text-sm font-semibold mb-1">URL del video <span className="text-cyan-500">(Vimeo, YouTube, etc.)</span></label>
            <input className="px-3 py-2 rounded bg-black text-cyan-200 border border-cyan-700 mb-1" value={video.url} onChange={e => setVideos(videos.map((v, i) => i === idx ? { ...v, url: e.target.value } : v))} placeholder="https://vimeo.com/123456789" />
            <label className="text-cyan-300 text-sm font-semibold mb-1">Orden en la lista <span className="text-cyan-500" title="Determina la posición del video en la lista de clases">(1 = primero, 2 = segundo...)</span></label>
            <input className="px-3 py-2 rounded bg-black text-cyan-200 border border-cyan-700 mb-1" value={video.orden || ''} type="number" min={1} onChange={e => setVideos(videos.map((v, i) => i === idx ? { ...v, orden: parseInt(e.target.value) || '' } : v))} placeholder="Ej: 1" />
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
          <input className="px-3 py-2 rounded bg-black text-cyan-200 border border-cyan-700 mb-1" value={nuevoVideo.titulo} onChange={e => setNuevoVideo({ ...nuevoVideo, titulo: e.target.value })} placeholder="Ej: Introducción al módulo" />
          <label className="text-cyan-300 text-sm font-semibold mb-1">Descripción <span className="text-cyan-500">(opcional)</span></label>
          <textarea className="px-3 py-2 rounded bg-black text-cyan-200 border border-cyan-700 mb-1" value={nuevoVideo.descripcion} onChange={e => setNuevoVideo({ ...nuevoVideo, descripcion: e.target.value })} placeholder="Breve descripción de la clase" />
          <label className="text-cyan-300 text-sm font-semibold mb-1">URL del video <span className="text-cyan-500">(Vimeo, YouTube, etc.)</span></label>
          <input className="px-3 py-2 rounded bg-black text-cyan-200 border border-cyan-700 mb-1" value={nuevoVideo.url} onChange={e => setNuevoVideo({ ...nuevoVideo, url: e.target.value })} placeholder="https://vimeo.com/123456789" />
          <label className="text-cyan-300 text-sm font-semibold mb-1">Orden en la lista <span className="text-cyan-500" title="Determina la posición del video en la lista de clases">(1 = primero, 2 = segundo...)</span></label>
          <input className="px-3 py-2 rounded bg-black text-cyan-200 border border-cyan-700 mb-1" value={nuevoVideo.orden || ''} type="number" min={1} onChange={e => setNuevoVideo((prev: any) => ({ ...prev, orden: parseInt(e.target.value) || '' }))} placeholder="Ej: 1" />
          <label className="text-cyan-300 text-sm font-semibold mb-1">Miniatura <span className="text-cyan-500">(opcional)</span></label>
          <div className="flex items-center gap-3 mb-2">
            {nuevoVideo.miniatura_url && <img src={nuevoVideo.miniatura_url} alt="Miniatura" className="w-20 h-14 object-cover rounded border border-cyan-700" />}
            <input type="file" accept="image/*" onChange={e => e.target.files && handleMiniaturaUpload(e.target.files[0], null)} />
          </div>
          <button className="px-4 py-2 rounded bg-green-700 text-white font-bold mt-2" onClick={async () => {
            let orden = nuevoVideo.orden;
            if (!orden || orden < 1) {
              orden = (videos.reduce((max, v) => v.orden > max ? v.orden : max, 0) || 0) + 1;
            }
            setNuevoVideo((prev: any) => ({ ...prev, orden }));
            await handleAgregarVideo();
          }} disabled={editorLoading}>Agregar video</button>
        </div>
        {editorError && <div className="text-red-400 mt-4">{editorError}</div>}
        {successMsg && <div className="text-green-400 mt-4">{successMsg}</div>}
      </div>
    </div>
  );
};

export default EditarVideosClassroom; 