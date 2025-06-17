import React from 'react';
import ComunidadComentarios from './ComunidadComentarios';

interface ComunidadPostModalProps {
  post: any;
  comentarios: any[];
  onClose: () => void;
}

const ComunidadPostModal: React.FC<ComunidadPostModalProps> = ({ post, onClose }) => {
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
        {/* Render post info */}
        <div className="flex items-center gap-3 mb-2">
          <img src={post.usuario?.avatar_url || `https://ui-avatars.com/api/?name=Usuario&background=e6a800&color=fff&size=96`} alt="avatar" className="w-10 h-10 rounded-full border-2 border-[#e6a800] object-cover" />
          <div>
            <span className="text-white font-bold">{post.usuario?.name || 'Usuario'}</span>
            <span className="ml-2 text-xs text-[#e6a800] font-semibold">{new Date(post.created_at).toLocaleString()}</span>
          </div>
        </div>
        <div className="text-white text-base mb-2">{post.contenido}</div>
        {post.tipo === 'imagen' && post.media_url && (
          <img src={post.media_url} alt="imagen" className="rounded-xl max-h-80 object-cover mb-2" />
        )}
        {post.tipo === 'video' && post.media_url && (
          <video src={post.media_url} controls className="rounded-xl max-h-80 object-cover mb-2" />
        )}
        {post.tipo === 'enlace' && post.media_url && (
          <a href={post.media_url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline break-all mb-2">{post.media_url}</a>
        )}
        {post.descripcion && (
          <div className="text-gray-400 text-sm mb-2">{post.descripcion}</div>
        )}
        {/* Comentarios y respuestas */}
        <div className="mt-4">
          <ComunidadComentarios postId={post.id} />
        </div>
      </div>
    </div>
  );
};

export default ComunidadPostModal; 