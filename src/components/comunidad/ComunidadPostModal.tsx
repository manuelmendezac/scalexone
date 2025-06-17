import React, { useEffect, useState, useRef } from 'react';
import ComunidadComentarios from './ComunidadComentarios';
import { supabase } from '../../supabase';
import ReaccionesFacebook from './ReaccionesFacebook';

const VideoWithOrientation: React.FC<{ src: string; orientacion?: string }> = ({ src, orientacion }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [detected, setDetected] = useState<'vertical' | 'horizontal' | undefined>(undefined);
  useEffect(() => {
    if (!['vertical', 'horizontal'].includes(orientacion as string) && videoRef.current) {
      const video = videoRef.current;
      const onLoaded = () => {
        if (video.videoHeight > video.videoWidth) {
          setDetected('vertical');
        } else {
          setDetected('horizontal');
        }
      };
      video.addEventListener('loadedmetadata', onLoaded);
      return () => video.removeEventListener('loadedmetadata', onLoaded);
    }
  }, [orientacion, src]);
  const finalOrient = ['vertical', 'horizontal'].includes(orientacion as string)
    ? orientacion
    : detected;
  return (
    <div className={
      finalOrient === 'vertical'
        ? 'w-[320px] h-[570px] mx-auto rounded-xl overflow-hidden mb-2 flex justify-center items-center bg-black'
        : 'w-full aspect-video rounded-xl overflow-hidden mb-2 flex justify-center items-center bg-black'
    }>
      <video ref={videoRef} controls src={src} className="w-full h-full object-contain" />
    </div>
  );
};

const CarruselImagenes: React.FC<{ imagenes: string[] }> = ({ imagenes }) => {
  const [idx, setIdx] = useState(0);
  const [descargando, setDescargando] = useState(false);
  const handleDescargar = async (url: string) => {
    setDescargando(true);
    try {
      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) throw new Error('No se pudo descargar la imagen');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = url.split('/').pop() || 'imagen.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      alert('No se pudo descargar la imagen automáticamente. Si tu navegador lo permite, mantén presionada la imagen y selecciona "Descargar".');
    }
    setDescargando(false);
  };
  return (
    <div className="relative w-full flex flex-col items-center">
      <div className="w-full flex justify-center items-center relative">
        {/* Flecha izquierda */}
        <button
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full p-1 z-10"
          onClick={() => setIdx(idx === 0 ? imagenes.length - 1 : idx - 1)}
          disabled={imagenes.length <= 1}
        >{'<'}</button>
        <img src={imagenes[idx]} alt={`carrusel-${idx}`} className="h-64 max-w-full object-contain rounded-xl border-2 border-[#e6a800]" />
        {/* Flecha derecha */}
        <button
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full p-1 z-10"
          onClick={() => setIdx(idx === imagenes.length - 1 ? 0 : idx + 1)}
          disabled={imagenes.length <= 1}
        >{'>'}</button>
      </div>
      <div className="flex gap-2 mt-2">
        {imagenes.map((url, i) => (
          <button
            key={i}
            className={`w-4 h-4 rounded-full border-2 ${i === idx ? 'bg-[#e6a800] border-[#e6a800]' : 'bg-gray-400 border-gray-400'}`}
            onClick={() => setIdx(i)}
          />
        ))}
      </div>
      <button
        className="mt-2 px-3 py-1 bg-[#e6a800] text-black rounded-xl font-bold text-xs"
        onClick={() => handleDescargar(imagenes[idx])}
        disabled={descargando}
      >
        {descargando ? 'Descargando...' : 'Descargar imagen'}
      </button>
    </div>
  );
};

interface ComunidadPostModalProps {
  post: any;
  forceRefresh?: number;
  onClose: () => void;
}

const ComunidadPostModal: React.FC<ComunidadPostModalProps> = ({ post, onClose, forceRefresh }) => {
  const [postCompleto, setPostCompleto] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [reacciones, setReacciones] = useState<any[]>([]);
  const [miReaccion, setMiReaccion] = useState<string | null>(null);
  const [usuarioId, setUsuarioId] = useState<string>('');
  const modalContentRef = useRef<HTMLDivElement>(null);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Cerrar modal al hacer clic fuera del área del modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalContentRef.current && !modalContentRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('comunidad_posts')
        .select('*, usuario:usuario_id ( avatar_url, name )')
        .eq('id', post.id)
        .single();
      if (!error && data) {
        setPostCompleto(data);
      }
      setLoading(false);
    };
    fetchPost();
  }, [post.id]);

  useEffect(() => {
    const obtenerUsuario = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUsuarioId(user?.id || '');
    };
    obtenerUsuario();
  }, []);

  useEffect(() => {
    const fetchReacciones = async () => {
      if (!post.id) return;
      const { data, error } = await supabase
        .from('comunidad_reacciones')
        .select('*')
        .eq('post_id', post.id);
      if (!error && data) {
        const agrupadas: Record<string, { tipo: string; count: number; usuarios: string[] }> = {};
        let miReaccionLocal: string | null = null;
        data.forEach((r: any) => {
          if (!agrupadas[r.tipo]) agrupadas[r.tipo] = { tipo: r.tipo, count: 0, usuarios: [] };
          agrupadas[r.tipo].count++;
          agrupadas[r.tipo].usuarios.push(r.usuario_id);
          if (r.usuario_id === usuarioId) miReaccionLocal = r.tipo;
        });
        setReacciones(Object.values(agrupadas));
        setMiReaccion(miReaccionLocal);
      }
    };
    fetchReacciones();
  }, [post.id, usuarioId]);

  const manejarReaccion = async (tipo: string) => {
    if (!usuarioId) {
      alert('Debes iniciar sesión para reaccionar.');
      return;
    }
    const { error: errorInsert } = await supabase
      .from('comunidad_reacciones')
      .insert({ post_id: post.id, usuario_id: usuarioId, tipo, comentario_id: null });
    if (errorInsert) {
      alert('Error al insertar reacción: ' + (errorInsert.message || JSON.stringify(errorInsert)));
      return;
    }
    // Refrescar reacciones
    const { data, error } = await supabase
      .from('comunidad_reacciones')
      .select('*')
      .eq('post_id', post.id);
    if (!error && data) {
      const agrupadas: Record<string, { tipo: string; count: number; usuarios: string[] }> = {};
      let miReaccionLocal: string | null = null;
      data.forEach((r: any) => {
        if (!agrupadas[r.tipo]) agrupadas[r.tipo] = { tipo: r.tipo, count: 0, usuarios: [] };
        agrupadas[r.tipo].count++;
        agrupadas[r.tipo].usuarios.push(r.usuario_id);
        if (r.usuario_id === usuarioId) miReaccionLocal = r.tipo;
      });
      setReacciones(Object.values(agrupadas));
      setMiReaccion(miReaccionLocal);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70" onClick={handleBackdropClick}>
      <div ref={modalContentRef} className="bg-[#23232b] rounded-2xl shadow-lg max-w-lg w-full p-0 relative max-h-[80vh] flex flex-col">
        {/* Header sticky */}
        <div className="sticky top-0 z-10 bg-[#23232b] px-6 pt-6 pb-2 flex items-start justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            {postCompleto && (
              <>
                <img src={postCompleto.usuario?.avatar_url || `https://ui-avatars.com/api/?name=Usuario&background=e6a800&color=fff&size=96`} alt="avatar" className="w-10 h-10 rounded-full border-2 border-[#e6a800] object-cover" />
                <div>
                  <span className="text-white font-bold">{postCompleto.usuario?.name || 'Usuario'}</span>
                  <span className="ml-2 text-xs text-[#e6a800] font-semibold">{new Date(postCompleto.created_at).toLocaleString()}</span>
                </div>
              </>
            )}
          </div>
          <button
            className="text-2xl text-[#e6a800] font-bold bg-transparent border-none shadow-none p-0 m-0 hover:scale-110 transition-transform cursor-pointer"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            ×
          </button>
        </div>
        {/* Contenido scrollable */}
        <div className="flex-1 px-6 pb-6 pt-2 overflow-y-auto max-h-[65vh]">
          {loading || !postCompleto ? (
            <div className="text-center text-white py-10">Cargando publicación...</div>
          ) : (
            <>
              <div className="text-white text-base mb-2">{postCompleto.contenido}</div>
              {postCompleto.tipo === 'imagen' && postCompleto.media_url && (
                <img src={postCompleto.media_url} alt="imagen" className="rounded-xl max-h-80 object-cover mb-2" />
              )}
              {postCompleto.tipo === 'video' && postCompleto.media_url && (
                <VideoWithOrientation src={postCompleto.media_url} orientacion={postCompleto.orientacion} />
              )}
              {postCompleto.tipo === 'enlace' && postCompleto.media_url && (
                <a href={postCompleto.media_url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline break-all mb-2">{postCompleto.media_url}</a>
              )}
              {postCompleto.descripcion && (
                <div className="text-gray-400 text-sm mb-2">{postCompleto.descripcion}</div>
              )}
              {postCompleto.tipo === 'imagen' && postCompleto.imagenes_urls && postCompleto.imagenes_urls.length > 0 && (
                <CarruselImagenes imagenes={postCompleto.imagenes_urls} />
              )}
              <div className="flex gap-4 mt-2 items-center">
                <ReaccionesFacebook
                  postId={postCompleto.id}
                  usuarioId={usuarioId}
                  reacciones={reacciones}
                  miReaccion={miReaccion}
                  onReact={manejarReaccion}
                />
                <button
                  className="relative flex items-center justify-center w-9 h-9 rounded-full border border-gray-700 bg-black/30 hover:bg-black/50 transition text-yellow-400"
                  onClick={() => {
                    const input = document.querySelector<HTMLInputElement>(
                      '.modal-comentario-input'
                    );
                    if (input) input.focus();
                  }}
                >
                  <span role="img" aria-label="comentar" className="text-xl">💬</span>
                </button>
                <button
                  className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-700 bg-black/30 hover:bg-black/50 transition text-cyan-400"
                >
                  <span role="img" aria-label="compartir" className="text-xl">📤</span>
                </button>
              </div>
              <div className="mt-4">
                {postCompleto.id && (
                  <ComunidadComentarios 
                    postId={postCompleto.id} 
                    key={postCompleto.id + '-' + (forceRefresh || '')}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComunidadPostModal; 