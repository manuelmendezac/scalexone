import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../supabase';
import ComunidadComentarios from './ComunidadComentarios';
import ReaccionesFacebook from './ReaccionesFacebook';

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
}

const FeedComunidad = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [contenido, setContenido] = useState('');
  const [tipo, setTipo] = useState<'texto' | 'imagen' | 'video' | 'enlace'>('texto');
  const [mediaUrl, setMediaUrl] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [reaccionesPorPost, setReaccionesPorPost] = useState<Record<string, any>>({});
  const [miReaccionPorPost, setMiReaccionPorPost] = useState<Record<string, string | null>>({});
  const [usuarioId, setUsuarioId] = useState<string>('');
  const [usuarios, setUsuarios] = useState<Record<string, { avatar_url?: string; name?: string }>>({});
  const [editandoPostId, setEditandoPostId] = useState<string | null>(null);
  const [editContenido, setEditContenido] = useState('');
  const [editDescripcion, setEditDescripcion] = useState('');
  const [orientacion, setOrientacion] = useState<'vertical' | 'horizontal' | null>(null);

  useEffect(() => {
    fetchPosts();
    obtenerUsuario();
  }, []);

  const obtenerUsuario = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUsuarioId(user.id);
  };

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('comunidad_posts')
      .select('*, usuario:usuario_id ( avatar_url, name )')
      .order('created_at', { ascending: false });
    if (!error && data) {
      setPosts(data);
      // Cargar reacciones para todos los posts
      data.forEach((post: any) => cargarReacciones(post.id));
      // Guardar usuarios para lookup rápido
      const usuariosMap: Record<string, { avatar_url?: string; name?: string }> = {};
      data.forEach((post: any) => {
        if (post.usuario_id && post.usuario) {
          usuariosMap[post.usuario_id] = {
            avatar_url: post.usuario.avatar_url,
            name: post.usuario.name,
          };
        }
      });
      setUsuarios(usuariosMap);
    }
    setLoading(false);
  };

  const cargarReacciones = async (postId: string) => {
    const { data, error } = await supabase
      .from('comunidad_reacciones')
      .select('*')
      .eq('post_id', postId);
    if (!error && data) {
      const agrupadas: Record<string, { tipo: string; count: number; usuarios: string[] }> = {};
      let miReaccion: string | null = null;
      data.forEach((r: any) => {
        if (!agrupadas[r.tipo]) agrupadas[r.tipo] = { tipo: r.tipo, count: 0, usuarios: [] };
        agrupadas[r.tipo].count++;
        agrupadas[r.tipo].usuarios.push(r.usuario_id);
        if (r.usuario_id === usuarioId) miReaccion = r.tipo;
      });
      setReaccionesPorPost(prev => ({ ...prev, [postId]: Object.values(agrupadas) }));
      setMiReaccionPorPost(prev => ({ ...prev, [postId]: miReaccion }));
    }
  };

  const manejarReaccion = async (postId: string, tipo: string) => {
    if (!usuarioId) return;
    const miTipo = miReaccionPorPost[postId];
    if (miTipo === tipo) {
      await supabase
        .from('comunidad_reacciones')
        .delete()
        .eq('post_id', postId)
        .eq('usuario_id', usuarioId);
    } else if (miTipo) {
      await supabase
        .from('comunidad_reacciones')
        .update({ tipo })
        .eq('post_id', postId)
        .eq('usuario_id', usuarioId);
    } else {
      await supabase
        .from('comunidad_reacciones')
        .insert({ post_id: postId, usuario_id: usuarioId, tipo });
    }
    // Recargar reacciones y posts para refrescar nombre/avatar
    cargarReacciones(postId);
    fetchPosts();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (tipo === 'imagen' && !file.type.startsWith('image/')) {
      setError('Por favor selecciona una imagen válida.');
      return;
    }
    if (tipo === 'video' && !file.type.startsWith('video/')) {
      setError('Por favor selecciona un video válido.');
      return;
    }

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('El archivo es demasiado grande. Máximo 10MB.');
      return;
    }

    setArchivoSeleccionado(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);

    // Detectar orientación si es video
    if (tipo === 'video') {
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
    } else {
      setOrientacion(null);
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
      // Obtener el usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Debes iniciar sesión para publicar.');
        return;
      }

      let mediaUrlFinal = mediaUrl;

      // Si hay un archivo seleccionado, subirlo a Supabase Storage
      if (archivoSeleccionado) {
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

      // Insertar post con orientación
      const { error: insertError } = await supabase.from('comunidad_posts').insert({
        usuario_id: user.id,
        contenido,
        tipo,
        media_url: mediaUrlFinal || null,
        descripcion: descripcion || null,
        orientacion: orientacion || null
      });

      if (insertError) throw insertError;

      // Limpiar formulario
      setContenido('');
      setTipo('texto');
      setMediaUrl('');
      setDescripcion('');
      setPreviewUrl(null);
      setArchivoSeleccionado(null);
      setOrientacion(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      // Recargar posts
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
        <div className="flex gap-2 items-center">
          <select
            className="bg-[#18181b] text-[#e6a800] border border-[#e6a800] rounded-xl px-3 py-1"
            value={tipo}
            onChange={e => {
              setTipo(e.target.value as any);
              setMediaUrl('');
              setPreviewUrl(null);
              setArchivoSeleccionado(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            disabled={subiendo}
          >
            <option value="texto">Texto</option>
            <option value="imagen">Imagen</option>
            <option value="video">Video</option>
            <option value="enlace">Enlace</option>
          </select>
          {(tipo === 'imagen' || tipo === 'video') && (
            <div className="flex-1 flex flex-col gap-2">
              <input
                type="file"
                ref={fileInputRef}
                accept={tipo === 'imagen' ? 'image/*' : 'video/*'}
                onChange={handleFileSelect}
                className="hidden"
                disabled={subiendo}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#18181b] text-[#e6a800] border border-[#e6a800] rounded-xl px-3 py-1 hover:bg-[#e6a800] hover:text-black transition"
                disabled={subiendo}
              >
                Seleccionar {tipo}
              </button>
              {previewUrl && (
                <div className="relative">
                  {tipo === 'imagen' ? (
                    <img
                      src={previewUrl}
                      alt="preview"
                      className="max-h-40 rounded-xl object-cover"
                    />
                  ) : (
                    <div className={
                      orientacion === 'vertical'
                        ? 'w-[320px] h-[570px] mx-auto rounded-xl overflow-hidden mb-2 flex justify-center items-center bg-black'
                        : 'w-full aspect-video rounded-xl overflow-hidden mb-2 flex justify-center items-center bg-black'
                    }>
                      <video
                        src={previewUrl}
                        controls
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setPreviewUrl(null);
                      setArchivoSeleccionado(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          )}
          {tipo === 'enlace' && (
            <input
              type="url"
              className="bg-[#18181b] text-white border border-[#e6a800] rounded-xl px-3 py-1 flex-1"
              placeholder="URL del enlace"
              value={mediaUrl}
              onChange={e => setMediaUrl(e.target.value)}
              disabled={subiendo}
            />
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
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <div className="flex items-center gap-3">
          <button
            className={`bg-[#e6a800] hover:bg-[#ffb300] text-black font-bold px-6 py-2 rounded-xl transition ${subiendo ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handlePublicar}
            disabled={subiendo}
          >
            {subiendo ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </div>
      {/* Listado de publicaciones reales */}
      <div className="flex flex-col gap-6">
        {loading ? (
          <div className="text-center text-gray-400">Cargando publicaciones...</div>
        ) : posts.length === 0 ? (
          <div className="text-center text-gray-400">No hay publicaciones aún.</div>
        ) : (
          posts.map((post) => (
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
                  <div className="text-white text-base mb-2">{post.contenido}</div>
                  {post.tipo === 'imagen' && post.media_url && (
                    <img src={post.media_url} alt="imagen" className="rounded-xl max-h-80 object-cover mb-2" />
                  )}
                  {post.tipo === 'video' && post.media_url && (
                    <div className={
                      post.orientacion === 'vertical'
                        ? 'w-[320px] h-[570px] mx-auto rounded-xl overflow-hidden mb-2 flex justify-center items-center bg-black'
                        : 'w-full aspect-video rounded-xl overflow-hidden mb-2 flex justify-center items-center bg-black'
                    }>
                      <video controls src={post.media_url} className="w-full h-full object-contain" />
                    </div>
                  )}
                  {post.tipo === 'enlace' && post.media_url && (
                    <a href={post.media_url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline break-all mb-2">{post.media_url}</a>
                  )}
                  {post.descripcion && (
                    <div className="text-gray-400 text-sm mb-2">{post.descripcion}</div>
                  )}
                </>
              )}
              {/* Reacciones tipo Facebook y botones unificados */}
              <div className="flex gap-4 mt-2 items-center">
                <ReaccionesFacebook
                  postId={post.id}
                  usuarioId={usuarioId}
                  reacciones={reaccionesPorPost[post.id] || []}
                  miReaccion={miReaccionPorPost[post.id] || null}
                  onReact={tipo => manejarReaccion(post.id, tipo)}
                />
                <button className="flex items-center gap-1 px-3 py-1 rounded-full font-bold border border-gray-700 bg-black/30 hover:bg-black/50 transition text-yellow-400">
                  <span role="img" aria-label="comentar">💬</span> Comentar
                </button>
                <button className="flex items-center gap-1 px-3 py-1 rounded-full font-bold border border-gray-700 bg-black/30 hover:bg-black/50 transition text-cyan-400">
                  <span role="img" aria-label="compartir">📤</span> Compartir
                </button>
              </div>
              <ComunidadComentarios postId={post.id} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FeedComunidad; 