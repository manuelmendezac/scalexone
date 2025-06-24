import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../supabase';
import ComunidadComentarios from './ComunidadComentarios';
import ReaccionesFacebook from './ReaccionesFacebook';
import ComunidadPostModal from './ComunidadPostModal';
import useCommunityStore from '../../store/useCommunityStore';
import LoadingScreen from '../LoadingScreen';

interface Post {
  id: string;
  usuario_id: string;
  contenido: string;
  tipo: string;
  media_url: string | null;
  descripcion: string | null;
  created_at: string;
  orientacion?: 'vertical' | 'horizontal';
  usuario?: {
    avatar_url?: string;
    name?: string;
  };
  imagenes_urls?: string[] | null;
}

const FeedComunidad = () => {
  const { 
    posts,
    reaccionesPorPost,
    miReaccionPorPost,
    usuarios,
    loading,
    fetchPosts,
    cargarReacciones,
    reaccionar
  } = useCommunityStore();

  const [contenido, setContenido] = useState('');
  const [tipo, setTipo] = useState<'texto' | 'imagen' | 'video' | 'enlace'>('texto');
  const [mediaUrl, setMediaUrl] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [usuarioId, setUsuarioId] = useState<string>('');
  const [usuarioCargando, setUsuarioCargando] = useState(true);
  const [editandoPostId, setEditandoPostId] = useState<string | null>(null);
  const [editContenido, setEditContenido] = useState('');
  const [editDescripcion, setEditDescripcion] = useState('');
  const [orientacion, setOrientacion] = useState<'vertical' | 'horizontal' | undefined>(undefined);
  const [imagenesSeleccionadas, setImagenesSeleccionadas] = useState<File[]>([]);
  const [imagenesPreview, setImagenesPreview] = useState<string[]>([]);
  const [comentariosPorPost, setComentariosPorPost] = useState<Record<string, any[]>>({});
  const [mostrarTodosComentarios, setMostrarTodosComentarios] = useState<Record<string, boolean>>({});
  const [modalPost, setModalPost] = useState<any | null>(null);
  const [showShareMenu, setShowShareMenu] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    let mounted = true;
    const obtenerUsuario = async () => {
      setUsuarioCargando(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (mounted) {
        setUsuarioId(user?.id || '');
        setUsuarioCargando(false);
      }
    };
    obtenerUsuario();
    
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUsuarioId(session?.user?.id || '');
        setUsuarioCargando(false);
      }
    });
    
    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (tipo === 'imagen') {
      const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
      const optimizedFiles: File[] = [];
      for (const file of validFiles) {
        if (typeof window !== 'undefined') {
          try {
            const imageCompression = (await eval("import('browser-image-compression')")).default;
            const compressed = await imageCompression(file, {
              maxWidthOrHeight: 1280,
              maxSizeMB: 1,
              useWebWorker: true,
              fileType: 'image/webp',
              initialQuality: 0.7
            });
            optimizedFiles.push(new File([compressed], file.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' }));
          } catch (err) {
            optimizedFiles.push(file);
          }
        } else {
          optimizedFiles.push(file);
        }
      }
      setImagenesSeleccionadas(optimizedFiles);
      setImagenesPreview(optimizedFiles.map(file => URL.createObjectURL(file)));
      setArchivoSeleccionado(null);
      setPreviewUrl(null);
      setOrientacion(undefined);
      return;
    } else if (tipo === 'video') {
      const file = files[0];
      if (!file.type.startsWith('video/')) {
        setError('Por favor selecciona un video válido.');
        return;
      }
      setArchivoSeleccionado(file);
      setPreviewUrl(URL.createObjectURL(file));
      setImagenesSeleccionadas([]);
      setImagenesPreview([]);
      // Detectar orientación...
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = function () {
        if (video.videoHeight > video.videoWidth) {
          setOrientacion('vertical');
        } else {
          setOrientacion('horizontal');
        }
      };
      video.src = URL.createObjectURL(file);
    }
  };

  const handlePublicar = async () => {
    setError(null);
    if (!contenido.trim() && tipo === 'texto') {
      setError('El contenido no puede estar vacío.');
      return;
    }
    setSubiendo(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Debes iniciar sesión para publicar.');
        return;
      }
      let mediaUrlFinal = mediaUrl;
      let imagenesUrls: string[] = [];
      if (tipo === 'imagen' && imagenesSeleccionadas.length > 0) {
        for (const file of imagenesSeleccionadas) {
          const fileExt = file.name.split('.').pop();
          const fileName = `imagen_${Date.now()}_${Math.random().toString(36).substr(2, 6)}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from('comunidad-media')
            .upload(fileName, file, {
              contentType: file.type,
              upsert: true
            });
          if (uploadError) throw uploadError;
          const { data: publicUrlData } = supabase.storage
            .from('comunidad-media')
            .getPublicUrl(fileName);
          if (publicUrlData?.publicUrl) imagenesUrls.push(publicUrlData.publicUrl);
        }
      }
      if (tipo === 'video' && archivoSeleccionado) {
        const fileExt = archivoSeleccionado.name.split('.').pop();
        const fileName = `${tipo}_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('comunidad-media')
          .upload(fileName, archivoSeleccionado, {
            contentType: archivoSeleccionado.type,
            upsert: true
          });
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage
          .from('comunidad-media')
          .getPublicUrl(fileName);
        mediaUrlFinal = publicUrlData.publicUrl;
      }
      // Insertar post
      const { error: insertError } = await supabase.from('comunidad_posts').insert({
        usuario_id: user.id,
        contenido,
        tipo,
        media_url: mediaUrlFinal || null,
        descripcion: descripcion || null,
        orientacion: orientacion ?? null,
        imagenes_urls: imagenesUrls.length > 0 ? imagenesUrls : null
      });
      if (insertError) throw insertError;
      setContenido('');
      setTipo('texto');
      setMediaUrl('');
      setDescripcion('');
      setPreviewUrl(null);
      setArchivoSeleccionado(null);
      setOrientacion(undefined);
      setImagenesSeleccionadas([]);
      setImagenesPreview([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchPosts();
    } catch (err: any) {
      setError('Error al publicar: ' + err.message);
    } finally {
      setSubiendo(false);
    }
  };

  const handleEditar = (post: Post) => {
    setEditandoPostId(post.id);
    setEditContenido(post.contenido);
    setEditDescripcion(post.descripcion || '');
  };

  const handleGuardarEdicion = async (post: Post) => {
    await supabase
      .from('comunidad_posts')
      .update({ contenido: editContenido, descripcion: editDescripcion })
      .eq('id', post.id);
    setEditandoPostId(null);
    fetchPosts();
  };

  const handleCancelarEdicion = () => {
    setEditandoPostId(null);
  };

  const handleEliminar = async (post: Post) => {
    if (window.confirm('¿Seguro que quieres eliminar este post?')) {
      await supabase
        .from('comunidad_posts')
        .delete()
        .eq('id', post.id);
      fetchPosts();
    }
  };

  // Nueva función para obtener comentarios por post
  const fetchComentariosPorPost = async (postId: string) => {
    const { data, error } = await supabase
      .from('comunidad_comentarios')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (!error && data) {
      setComentariosPorPost(prev => ({ ...prev, [postId]: data }));
    }
  };

  // Llama a fetchComentariosPorPost para cada post cuando se cargan los posts
  useEffect(() => {
    if (posts.length > 0) {
      posts.forEach(post => fetchComentariosPorPost(post.id));
    }
  }, [posts]);

  const handleReaccionar = async (postId: string, tipo: string) => {
    await reaccionar(postId, tipo);
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8">
      {/* Caja para crear nueva publicación */}
      <div className="bg-[#23232b] rounded-2xl p-6 shadow-lg flex flex-col gap-4 mb-4">
        <textarea
          className="w-full bg-[#18181b] text-white rounded-xl p-3 resize-none min-h-[60px] focus:outline-none focus:ring-2 focus:ring-[#e6a800]"
          placeholder="Comparte algo con la comunidad..."
          value={contenido}
          onChange={e => setContenido(e.target.value)}
          disabled={subiendo}
        />
        <div className="flex gap-2 items-center justify-between">
          <select
            className="bg-[#18181b] text-[#e6a800] border border-[#e6a800] rounded-xl px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[#e6a800] transition"
            value={tipo}
            onChange={e => {
              setTipo(e.target.value as any);
              setMediaUrl('');
              setPreviewUrl(null);
              setArchivoSeleccionado(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            disabled={subiendo}
            style={{ minWidth: 80 }}
          >
            <option value="texto">Texto</option>
            <option value="imagen">Imagen</option>
            <option value="video">Video</option>
            <option value="enlace">Enlace</option>
          </select>
          <button
            className={`flex items-center gap-1 bg-[#e6a800] hover:bg-[#ffb300] text-black font-bold px-3 py-1 rounded-full shadow transition text-xs ${subiendo ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handlePublicar}
            disabled={subiendo}
            style={{ minHeight: 32 }}
          >
            <span role="img" aria-label="publicar">🚀</span> {subiendo ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
        {tipo === 'imagen' && (
          <div className="flex-1 flex flex-col gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={subiendo}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#18181b] text-[#e6a800] border border-[#e6a800] rounded-xl px-3 py-1 hover:bg-[#e6a800] hover:text-black transition"
              disabled={subiendo}
            >
              Seleccionar imágenes
            </button>
            {imagenesPreview.length > 0 && (
              <div className="flex gap-2 overflow-x-auto py-2">
                {imagenesPreview.map((url, idx) => (
                  <div key={idx} className="relative">
                    <img src={url} alt={`preview-${idx}`} className="h-24 w-24 object-cover rounded-xl border-2 border-[#e6a800]" width="96" height="96" loading="lazy" />
                    <button
                      onClick={() => {
                        setImagenesPreview(prev => prev.filter((_, i) => i !== idx));
                        setImagenesSeleccionadas(prev => prev.filter((_, i) => i !== idx));
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {tipo === 'video' && (
          <div className="flex-1 flex flex-col gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={subiendo}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#18181b] text-[#e6a800] border border-[#e6a800] rounded-xl px-3 py-1 hover:bg-[#e6a800] hover:text-black transition"
              disabled={subiendo}
            >
              Seleccionar video
            </button>
            {previewUrl && (
              <video src={previewUrl} controls className="h-40 rounded-xl border-2 border-[#e6a800] mt-2" />
            )}
          </div>
        )}
        {(tipo === 'imagen' || tipo === 'video' || tipo === 'enlace') && (
          <input
            type="text"
            className="bg-[#18181b] text-white border border-[#e6a800] rounded-xl px-3 py-1 flex-1"
            placeholder="Descripción (opcional)"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            disabled={subiendo}
          />
        )}
        {error && <div className="text-red-500 text-sm">{error}</div>}
      </div>
      {/* Listado de publicaciones reales */}
      <div className="flex flex-col gap-6">
        {loading ? (
          <div className="text-center text-gray-400">Cargando publicaciones...</div>
        ) : posts.length === 0 ? (
          <div className="text-center text-gray-400">No hay publicaciones aún.</div>
        ) : (
          posts.map((post) => {
            const comentarios = comentariosPorPost[post.id] || [];
            const totalComentarios = comentarios.length;
            const mostrarTodos = mostrarTodosComentarios[post.id];
            const primerComentario = comentarios[0];
            console.log('Reacciones para post', post.id, reaccionesPorPost[post.id]);
            return (
              <div key={post.id} className="bg-[#23232b] rounded-2xl p-6 shadow flex flex-col gap-2">
                <div className="flex items-center gap-3 mb-2">
                  <img src={usuarios[post.usuario_id]?.avatar_url || `https://ui-avatars.com/api/?name=Usuario&background=e6a800&color=fff&size=96`} alt="avatar" className="w-10 h-10 rounded-full border-2 border-[#e6a800] object-cover" />
                  <div>
                    <span className="text-white font-bold">{usuarios[post.usuario_id]?.name || 'Usuario'}</span>
                    <span className="ml-2 text-xs text-[#e6a800] font-semibold">{new Date(post.created_at).toLocaleString()}</span>
                  </div>
                  {/* Botones de editar/eliminar solo para el autor */}
                  {post.usuario_id === usuarioId && (
                    <div className="flex gap-2 ml-4">
                      {editandoPostId === post.id ? null : (
                        <>
                          <button onClick={() => handleEditar(post)} className="text-xs px-2 py-1 rounded bg-yellow-500 text-black font-bold hover:bg-yellow-400 transition">Editar</button>
                          <button onClick={() => handleEliminar(post)} className="text-xs px-2 py-1 rounded bg-red-600 text-white font-bold hover:bg-red-500 transition">Eliminar</button>
                        </>
                      )}
                    </div>
                  )}
                </div>
                {/* Edición en línea */}
                {editandoPostId === post.id ? (
                  <div className="flex flex-col gap-2 mb-2">
                    <textarea
                      className="w-full bg-[#18181b] text-white rounded-xl p-3 resize-none min-h-[60px] focus:outline-none focus:ring-2 focus:ring-[#e6a800]"
                      value={editContenido}
                      onChange={e => setEditContenido(e.target.value)}
                    />
                    <input
                      type="text"
                      className="bg-[#18181b] text-white border border-[#e6a800] rounded-xl px-3 py-1"
                      placeholder="Descripción (opcional)"
                      value={editDescripcion}
                      onChange={e => setEditDescripcion(e.target.value)}
                    />
                    <div className="flex gap-2 mt-1">
                      <button onClick={() => handleGuardarEdicion(post)} className="px-4 py-1 rounded bg-green-500 text-white font-bold hover:bg-green-400 transition">Guardar</button>
                      <button onClick={handleCancelarEdicion} className="px-4 py-1 rounded bg-gray-600 text-white font-bold hover:bg-gray-500 transition">Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Mostrar siempre el texto/título del post con enlaces clickeables o preview visual */}
                    {(() => {
                      const { parts } = renderPostContentWithLinks(post.contenido || '');
                      return (
                        <div className="text-white text-base mb-2 flex flex-col gap-2">
                          {parts.map((part, i) => typeof part === 'string' ? <span key={i}>{part}</span> : part)}
                        </div>
                      );
                    })()}
                  </>
                )}
                {post.tipo === 'imagen' && post.media_url && (
                  <img src={post.media_url} alt="imagen" className="rounded-xl max-h-80 object-cover mb-2" width="600" height="400" loading="lazy" />
                )}
                {post.tipo === 'video' && post.media_url && (
                  <VideoWithOrientation src={post.media_url} orientacion={post.orientacion} />
                )}
                {post.tipo === 'enlace' && post.media_url && (
                  getEmbedUrl(post.media_url) ? (
                    <div className="w-full flex justify-center my-2">
                      <iframe
                        src={getEmbedUrl(post.media_url)!.embedUrl}
                        className={`w-full ${getEmbedUrl(post.media_url)!.isInstagramReel ? 'aspect-[9/16] max-w-xs' : 'max-w-xl aspect-video'} rounded-xl border-2 border-[#e6a800]`}
                        allow="autoplay; encrypted-media; fullscreen"
                        allowFullScreen
                        loading="lazy"
                        title="Video embed"
                      />
                    </div>
                  ) : (
                    <a href={post.media_url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline break-all mb-2 block">{post.media_url}</a>
                  )
                )}
                {post.descripcion && (
                  <div className="text-gray-400 text-sm mb-2">{post.descripcion}</div>
                )}
                {post.tipo === 'imagen' && post.imagenes_urls && post.imagenes_urls.length > 0 && (
                  <CarruselImagenes imagenes={post.imagenes_urls} />
                )}
                {/* Reacciones tipo Facebook y botones unificados */}
                <div className="mt-4 flex items-center gap-4">
                  <ReaccionesFacebook
                    postId={post.id}
                    usuarioId={usuarioId}
                    reacciones={reaccionesPorPost[post.id] || []}
                    miReaccion={miReaccionPorPost[post.id] || null}
                    onReact={(tipo) => handleReaccionar(post.id, tipo)}
                  />
                  {/* Ícono de comentar con contador */}
                  <button
                    className="relative flex items-center justify-center w-9 h-9 rounded-full border border-gray-700 bg-black/30 hover:bg-black/50 transition text-yellow-400"
                    onClick={() => setModalPost(post)}
                  >
                    <span role="img" aria-label="comentar" className="text-xl">💬</span>
                    {totalComentarios > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#e6a800] text-black text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center border border-black">
                        {totalComentarios}
                      </span>
                    )}
                  </button>
                  {/* Ícono de compartir */}
                  <button
                    className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-700 bg-black/30 hover:bg-black/50 transition text-cyan-400 relative"
                    onClick={() => setShowShareMenu(post.id)}
                  >
                    <span role="img" aria-label="compartir" className="text-xl">📤</span>
                    {showShareMenu === post.id && (
                      <ShareMenu
                        url={`${window.location.origin}/comunidad/${post.id}`}
                        title={post.contenido?.slice(0, 80) || 'Post de la comunidad'}
                        onClose={() => setShowShareMenu(null)}
                      />
                    )}
                  </button>
                </div>
                {/* Mostrar solo el primer comentario y el contador */}
                {totalComentarios > 0 && !mostrarTodos && (
                  <div className="mt-2">
                    <div className="text-white text-sm mb-1">
                      <b>{primerComentario?.texto}</b>
                    </div>
                    <button
                      className="text-xs text-[#e6a800] hover:underline"
                      onClick={() => setModalPost(post)}
                    >
                      Ver los {totalComentarios} comentarios
                    </button>
                  </div>
                )}
                {/* Mostrar todos los comentarios al hacer clic */}
                {mostrarTodos && (
                  <ComunidadComentarios postId={post.id} />
                )}
                {/* Si no hay comentarios, muestra el input para comentar */}
                {totalComentarios === 0 && (
                  <ComunidadComentarios postId={post.id} />
                )}
              </div>
            );
          })
        )}
      </div>
      {/* Modal de post y comentarios */}
      {modalPost && (
        <ComunidadPostModal
          post={modalPost}
          forceRefresh={Date.now()}
          onClose={() => setModalPost(null)}
        />
      )}
    </div>
  );
};

const isOrientation = (val: any): val is 'vertical' | 'horizontal' => val === 'vertical' || val === 'horizontal';

const VideoWithOrientation: React.FC<{ src: string; orientacion?: string }> = ({ src, orientacion }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [detected, setDetected] = useState<'vertical' | 'horizontal' | undefined>(undefined);

  useEffect(() => {
    if (!isOrientation(orientacion) && videoRef.current) {
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

  const finalOrient: 'vertical' | 'horizontal' | undefined = isOrientation(orientacion)
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

  // Forzar descarga automática usando fetch/blob
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
        {imagenes.length > 1 && (
          <button
            onClick={() => setIdx(i => (i - 1 + imagenes.length) % imagenes.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-[#e6a800] hover:bg-[#ffb300] text-black rounded-full p-1 shadow-md z-10 flex items-center justify-center"
            style={{ width: 32, height: 32 }}
            aria-label="Anterior"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
        )}
        {/* Imagen principal */}
        <div className="relative flex justify-center items-center w-full" style={{ maxWidth: 600 }}>
          <img
            src={imagenes[idx]}
            alt={`img-${idx}`}
            className="rounded-xl object-contain border-2 border-[#e6a800] mx-auto"
            width="600"
            height="400"
            loading="lazy"
            style={{ maxWidth: '100%', maxHeight: '70vh', width: 'auto', height: 'auto', display: 'block' }}
          />
          {/* Botón de descarga */}
          <button
            onClick={() => handleDescargar(imagenes[idx])}
            className="absolute top-2 right-2 bg-[#e6a800] hover:bg-[#ffb300] text-black rounded-full p-1 shadow-md z-10 flex items-center justify-center opacity-80 hover:opacity-100"
            style={{ width: 28, height: 28 }}
            title="Descargar imagen"
            disabled={descargando}
          >
            {descargando ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" strokeDasharray="40" strokeDashoffset="20"><animate attributeName="stroke-dashoffset" values="40;0" dur="1s" repeatCount="indefinite" /></circle></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            )}
          </button>
        </div>
        {/* Flecha derecha */}
        {imagenes.length > 1 && (
          <button
            onClick={() => setIdx(i => (i + 1) % imagenes.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#e6a800] hover:bg-[#ffb300] text-black rounded-full p-1 shadow-md z-10 flex items-center justify-center"
            style={{ width: 32, height: 32 }}
            aria-label="Siguiente"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        )}
      </div>
      {imagenes.length > 1 && (
        <div className="flex gap-2 mt-2">
          {imagenes.map((_, i) => (
            <span key={i} className={`w-2 h-2 rounded-full ${i === idx ? 'bg-[#e6a800]' : 'bg-gray-400'} inline-block`} />
          ))}
        </div>
      )}
    </div>
  );
};

// Función utilitaria para obtener la URL de embed de varios servicios
function getEmbedUrl(url: string): { embedUrl: string, isInstagramReel?: boolean, isTikTok?: boolean } | null {
  if (!url) return null;
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
  if (ytMatch) return { embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}` };
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return { embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  // Loom
  const loomMatch = url.match(/loom\.com\/share\/([\w-]+)/);
  if (loomMatch) return { embedUrl: `https://www.loom.com/embed/${loomMatch[1]}` };
  // Facebook Video
  const fbMatch = url.match(/facebook\.com\/.+\/videos\/(\d+)/);
  if (fbMatch) return { embedUrl: `https://www.facebook.com/video/embed?video_id=${fbMatch[1]}` };
  // TikTok (solo formato largo)
  const tiktokMatch = url.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/);
  if (tiktokMatch) return { embedUrl: `https://www.tiktok.com/embed/v2/${tiktokMatch[1]}`, isTikTok: true };
  // Instagram Reel
  const igReelMatch = url.match(/instagram\.com\/reel\/([\w-]+)/);
  if (igReelMatch) return { embedUrl: `https://www.instagram.com/reel/${igReelMatch[1]}/embed`, isInstagramReel: true };
  // Instagram Post
  const igPostMatch = url.match(/instagram\.com\/p\/([\w-]+)/);
  if (igPostMatch) return { embedUrl: `https://www.instagram.com/p/${igPostMatch[1]}/embed` };
  return null;
}

// Componente para previsualización de enlaces usando Microlink
const LinkPreview: React.FC<{ url: string }> = ({ url }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`)
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success') {
          setData(res.data);
        } else {
          setError(true);
        }
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [url]);

  if (loading) return <div className="bg-[#23232b] rounded-xl p-4 text-gray-400">Cargando previsualización...</div>;
  if (error || !data) return <a href={url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline break-all inline-block">{url}</a>;

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block bg-[#23232b] rounded-xl border-2 border-[#e6a800] overflow-hidden shadow-md hover:scale-[1.02] transition-all max-w-md">
      <div className="relative">
        {data.image && (
          <img src={data.image.url || data.image} alt={data.title || 'preview'} className="w-full h-48 object-cover" width="600" height="192" loading="lazy" />
        )}
        {data.video && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-black/60 rounded-full p-3">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="font-bold text-white text-base mb-1 line-clamp-1">{data.title}</div>
        <div className="text-gray-400 text-sm mb-2 line-clamp-2">{data.description}</div>
        <div className="flex items-center gap-2">
          {data.logo && <img src={data.logo.url || data.logo} alt="logo" className="w-5 h-5 rounded" width="20" height="20" loading="lazy" />}
          <span className="text-xs text-[#e6a800]">{data.publisher || data.url?.split('/')[2]}</span>
        </div>
      </div>
    </a>
  );
};

// Componente para lazy load de iframes de YouTube/redes sociales
const LazyEmbed: React.FC<{ embedUrl: string; type: 'youtube' | 'instagram' | 'tiktok' | 'facebook'; videoId?: string }> = ({ embedUrl, type, videoId }) => {
  const [showIframe, setShowIframe] = useState(false);
  let thumbnail = '';
  if (type === 'youtube' && videoId) {
    thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
  // Puedes agregar lógica para thumbnails de otras redes si lo deseas
  return (
    <div className="w-full flex justify-center my-2 relative" style={{ minHeight: 200 }}>
      {!showIframe ? (
        <div className="w-full max-w-xl aspect-video rounded-xl border-2 border-[#e6a800] bg-black flex items-center justify-center cursor-pointer relative overflow-hidden" onClick={() => setShowIframe(true)}>
          {thumbnail && <img src={thumbnail} alt="preview" className="absolute inset-0 w-full h-full object-cover opacity-80" loading="lazy" width="600" height="338" />}
          <button className="z-10 relative bg-[#e6a800] text-black font-bold px-6 py-2 rounded-full shadow-lg hover:bg-[#ffb300] transition text-lg">Ver video</button>
        </div>
      ) : (
        <iframe
          src={embedUrl}
          className="w-full max-w-xl aspect-video rounded-xl border-2 border-[#e6a800]"
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
          loading="lazy"
          title="Video embed"
        />
      )}
    </div>
  );
};

// Utilidad para renderizar texto con enlaces clickeables y/o preview visual
function renderPostContentWithLinks(text: string) {
  const urlRegex = /(https?:\/\/[\w./?=&%-]+)/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  while ((match = urlRegex.exec(text)) !== null) {
    const url = match[0];
    // Texto antes del enlace
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    // Si es un enlace de YouTube, mostrar embed
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
    if (youtubeMatch) {
      const videoId = youtubeMatch[1];
      parts.push(
        <LazyEmbed key={url + match.index} embedUrl={`https://www.youtube.com/embed/${videoId}`} type="youtube" videoId={videoId} />
      );
    } else if (/instagram\.com|tiktok\.com|facebook\.com/.test(url)) {
      // Mostrar preview visual para otras redes
      parts.push(<LinkPreview key={url + match.index} url={url} />);
    } else {
      // Si no, mostrar como link normal
      parts.push(
        <a key={url + match.index} href={url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline break-all inline-block">{url}</a>
      );
    }
    lastIndex = match.index + url.length;
  }
  // Texto restante
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return { parts };
}

// Componente de menú flotante para compartir
const ShareMenu: React.FC<{ url: string; title?: string; onClose: () => void }> = ({ url, title, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [ShareComponents, setShareComponents] = useState<any>(null);
  useEffect(() => {
    let mounted = true;
    import('react-share').then(mod => {
      if (mounted) setShareComponents(mod);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  function handleCopy() {
    navigator.clipboard.writeText(url);
    onClose();
  }

  if (!ShareComponents) {
    return <div className="p-4 text-gray-400">Cargando opciones...</div>;
  }
  const { WhatsappShareButton, FacebookShareButton, TwitterShareButton, LinkedinShareButton, TelegramShareButton, WhatsappIcon, FacebookIcon, TwitterIcon, LinkedinIcon, TelegramIcon } = ShareComponents;

  return (
    <div ref={ref} className="absolute z-50 top-10 right-0 bg-[#23232b] border border-[#e6a800] rounded-xl shadow-lg p-3 flex flex-col gap-2 min-w-[180px]">
      <WhatsappShareButton url={url} title={title} className="flex items-center gap-2 rounded hover:bg-[#e6a800]/20 p-1">
        <WhatsappIcon size={32} round /> <span className="text-white text-sm">WhatsApp</span>
      </WhatsappShareButton>
      <FacebookShareButton url={url} quote={title} className="flex items-center gap-2 rounded hover:bg-[#e6a800]/20 p-1">
        <FacebookIcon size={32} round /> <span className="text-white text-sm">Facebook</span>
      </FacebookShareButton>
      <TwitterShareButton url={url} title={title} className="flex items-center gap-2 rounded hover:bg-[#e6a800]/20 p-1">
        <TwitterIcon size={32} round /> <span className="text-white text-sm">Twitter/X</span>
      </TwitterShareButton>
      <LinkedinShareButton url={url} title={title} className="flex items-center gap-2 rounded hover:bg-[#e6a800]/20 p-1">
        <LinkedinIcon size={32} round /> <span className="text-white text-sm">LinkedIn</span>
      </LinkedinShareButton>
      <TelegramShareButton url={url} title={title} className="flex items-center gap-2 rounded hover:bg-[#e6a800]/20 p-1">
        <TelegramIcon size={32} round /> <span className="text-white text-sm">Telegram</span>
      </TelegramShareButton>
      <button onClick={handleCopy} className="flex items-center gap-2 rounded hover:bg-[#e6a800]/20 p-1">
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path fill="#e6a800" d="M16 1a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0V3H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h2a1 1 0 1 1 0 2H7a4 4 0 0 1-4-4V5a4 4 0 0 1 4-4h9Zm3 6a1 1 0 0 1 1 1v11a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8a1 1 0 0 1 1-1h13Zm-1 2H6v10a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2V8Z"/></svg>
        <span className="text-white text-sm">Copiar enlace</span>
      </button>
    </div>
  );
};

export default FeedComunidad; 