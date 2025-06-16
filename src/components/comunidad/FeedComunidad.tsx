import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../supabase';
import ComunidadComentarios from './ComunidadComentarios';

interface Post {
  id: string;
  usuario_id: string;
  contenido: string;
  tipo: string;
  media_url: string | null;
  descripcion: string | null;
  created_at: string;
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

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('comunidad_posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setPosts(data);
    setLoading(false);
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

      // Insertar post
      const { error: insertError } = await supabase.from('comunidad_posts').insert({
        usuario_id: user.id,
        contenido,
        tipo,
        media_url: mediaUrlFinal || null,
        descripcion: descripcion || null
      });

      if (insertError) throw insertError;

      // Limpiar formulario
      setContenido('');
      setTipo('texto');
      setMediaUrl('');
      setDescripcion('');
      setPreviewUrl(null);
      setArchivoSeleccionado(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      // Recargar posts
      fetchPosts();
    } catch (err: any) {
      setError('Error al publicar: ' + err.message);
    } finally {
      setSubiendo(false);
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
                    <video
                      src={previewUrl}
                      controls
                      className="max-h-40 rounded-xl"
                    />
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
                <img src={`https://ui-avatars.com/api/?name=Usuario&background=e6a800&color=fff&size=96`} alt="avatar" className="w-10 h-10 rounded-full border-2 border-[#e6a800]" />
                <div>
                  <span className="text-white font-bold">Usuario</span>
                  <span className="ml-2 text-xs text-[#e6a800] font-semibold">{new Date(post.created_at).toLocaleString()}</span>
                </div>
              </div>
              <div className="text-white text-base mb-2">{post.contenido}</div>
              {/* Mostrar media si existe */}
              {post.tipo === 'imagen' && post.media_url && (
                <img src={post.media_url} alt="imagen" className="rounded-xl max-h-80 object-cover mb-2" />
              )}
              {post.tipo === 'video' && post.media_url && (
                <video controls src={post.media_url} className="rounded-xl max-h-80 object-cover mb-2" />
              )}
              {post.tipo === 'enlace' && post.media_url && (
                <a href={post.media_url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline break-all mb-2">{post.media_url}</a>
              )}
              {post.descripcion && (
                <div className="text-gray-400 text-sm mb-2">{post.descripcion}</div>
              )}
              {/* Aquí irán reacciones, comentarios y compartir */}
              <div className="flex gap-4 mt-2">
                <button className="text-[#e6a800] font-bold hover:underline opacity-50 cursor-not-allowed">Reacciones</button>
                <button className="text-[#e6a800] font-bold hover:underline opacity-50 cursor-not-allowed">Comentar</button>
                <button className="text-[#e6a800] font-bold hover:underline opacity-50 cursor-not-allowed">Compartir</button>
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