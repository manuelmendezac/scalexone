import React, { useEffect, useState } from 'react';
import ComunidadComentarios from './ComunidadComentarios';
import { supabase } from '../../supabase';

interface ComunidadPostModalProps {
  post: any;
  onClose: () => void;
}

const ComunidadPostModal: React.FC<ComunidadPostModalProps> = ({ post, onClose }) => {
  const [postCompleto, setPostCompleto] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-[#23232b] rounded-2xl shadow-lg max-w-lg w-full p-6 relative">
        <button
          className="absolute top-4 right-4 text-2xl text-[#e6a800] font-bold z-50"
          onClick={onClose}
          aria-label="Cerrar modal"
        >
          ×
        </button>
        {loading || !postCompleto ? (
          <div className="text-center text-white py-10">Cargando publicación...</div>
        ) : (
          <>
            {/* Render post info */}
            <div className="flex items-center gap-3 mb-2">
              <img src={postCompleto.usuario?.avatar_url || `https://ui-avatars.com/api/?name=Usuario&background=e6a800&color=fff&size=96`} alt="avatar" className="w-10 h-10 rounded-full border-2 border-[#e6a800] object-cover" />
              <div>
                <span className="text-white font-bold">{postCompleto.usuario?.name || 'Usuario'}</span>
                <span className="ml-2 text-xs text-[#e6a800] font-semibold">{new Date(postCompleto.created_at).toLocaleString()}</span>
              </div>
            </div>
            <div className="text-white text-base mb-2">{postCompleto.contenido}</div>
            {postCompleto.tipo === 'imagen' && postCompleto.media_url && (
              <img src={postCompleto.media_url} alt="imagen" className="rounded-xl max-h-80 object-cover mb-2" />
            )}
            {postCompleto.tipo === 'video' && postCompleto.media_url && (
              <video src={postCompleto.media_url} controls className="rounded-xl max-h-80 object-cover mb-2" />
            )}
            {postCompleto.tipo === 'enlace' && postCompleto.media_url && (
              <a href={postCompleto.media_url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline break-all mb-2">{postCompleto.media_url}</a>
            )}
            {postCompleto.descripcion && (
              <div className="text-gray-400 text-sm mb-2">{postCompleto.descripcion}</div>
            )}
            {/* Comentarios y respuestas */}
            <div className="mt-4">
              <ComunidadComentarios postId={postCompleto.id} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ComunidadPostModal; 