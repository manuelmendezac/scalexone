import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';

interface Comentario {
  id: string;
  post_id: string;
  usuario_id: string;
  texto: string;
  respuesta_a: string | null;
  created_at: string;
  usuario?: {
    avatar_url?: string;
    nombre?: string;
  };
}

interface Props {
  postId: string;
}

const ComunidadComentarios: React.FC<Props> = ({ postId }) => {
  console.log('[ComunidadComentarios] Renderizando componente para postId:', postId);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [respondiendoA, setRespondiendoA] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (postId) {
      console.log('[ComunidadComentarios] Consultando comentarios para postId:', postId);
      fetchComentarios();
    } else {
      console.warn('[ComunidadComentarios] postId no válido:', postId);
    }
  }, [postId]);

  const fetchComentarios = async () => {
    setLoading(true);
    // Traer comentarios y datos de usuario
    try {
      const { data, error } = await supabase
        .from('comunidad_comentarios')
        .select('*, usuario:usuario_id ( avatar_url, name )')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      if (error) {
        setError('Error al cargar comentarios: ' + error.message);
        console.error('[ComunidadComentarios] Error al consultar comentarios:', error);
      } else {
        setComentarios(data || []);
        console.log('[ComunidadComentarios] Comentarios recibidos:', data);
      }
    } catch (e) {
      setError('Error inesperado al cargar comentarios.');
      console.error('[ComunidadComentarios] Error inesperado:', e);
    }
    setLoading(false);
  };

  const handleComentar = async (respuestaA: string | null = null) => {
    setError(null);
    if (!nuevoComentario.trim()) {
      setError('El comentario no puede estar vacío.');
      return;
    }
    setSubiendo(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Debes iniciar sesión para comentar.');
      setSubiendo(false);
      return;
    }
    const { error: insertError } = await supabase.from('comunidad_comentarios').insert({
      post_id: postId,
      usuario_id: user.id,
      texto: nuevoComentario,
      respuesta_a: respuestaA
    });
    if (insertError) {
      setError('Error al comentar: ' + insertError.message);
    } else {
      setNuevoComentario('');
      setRespondiendoA(null);
      fetchComentarios();
    }
    setSubiendo(false);
  };

  // Organiza los comentarios en árbol
  const buildTree = (items: Comentario[], respuestaA: string | null = null): Comentario[] => {
    return items
      .filter(c => c.respuesta_a === respuestaA)
      .map(c => ({ ...c, children: buildTree(items, c.id) }));
  };
  const comentariosTree = buildTree(comentarios);

  // Renderiza comentarios recursivamente
  const renderComentarios = (items: any[], nivel = 0) => (
    <div className={nivel > 0 ? 'pl-6 border-l border-[#e6a800]/30' : ''}>
      {items.map(comentario => {
        const [mostrarTodasRespuestas, setMostrarTodasRespuestas] = useState(false);
        const children = comentario.children || [];
        const mostrarRespuestas = mostrarTodasRespuestas ? children : children.slice(0, 2);
        return (
          <div key={comentario.id} className="mb-3">
            <div className="flex items-center gap-2 mb-1">
              <img
                src={comentario.usuario?.avatar_url || `https://ui-avatars.com/api/?name=U&background=e6a800&color=fff&size=96`}
                alt="avatar"
                className="w-8 h-8 rounded-full border-2 border-[#e6a800]"
              />
              <span className="text-white font-semibold text-sm">{comentario.usuario?.name || comentario.usuario?.nombre || 'Usuario'}</span>
              <span className="text-xs text-gray-400 ml-2">{new Date(comentario.created_at).toLocaleString()}</span>
            </div>
            <div className="text-white text-sm mb-1 ml-10">{comentario.texto}</div>
            <div className="flex gap-2 ml-10">
              <button
                className="text-xs text-[#e6a800] hover:underline"
                onClick={() => setRespondiendoA(comentario.id)}
              >
                Responder
              </button>
            </div>
            {/* Respuesta a este comentario */}
            {respondiendoA === comentario.id && (
              <div className="flex items-center gap-2 mt-2 ml-10">
                <input
                  type="text"
                  className="flex-1 bg-[#18181b] text-white border border-[#e6a800] rounded-xl px-3 py-1"
                  placeholder="Escribe una respuesta..."
                  value={nuevoComentario}
                  onChange={e => setNuevoComentario(e.target.value)}
                  disabled={subiendo}
                />
                <button
                  className="bg-[#e6a800] text-black font-bold px-3 py-1 rounded-xl transition"
                  onClick={() => handleComentar(comentario.id)}
                  disabled={subiendo}
                >
                  {subiendo ? 'Enviando...' : 'Responder'}
                </button>
                <button
                  className="text-xs text-gray-400 ml-2"
                  onClick={() => setRespondiendoA(null)}
                >
                  Cancelar
                </button>
              </div>
            )}
            {/* Renderiza hijos con ver más respuestas */}
            {children.length > 0 && (
              <div className="ml-10 mt-2">
                {renderComentarios(mostrarRespuestas, nivel + 1)}
                {children.length > 2 && !mostrarTodasRespuestas && (
                  <button
                    className="text-xs text-[#e6a800] hover:underline mt-1"
                    onClick={() => setMostrarTodasRespuestas(true)}
                  >
                    Ver {children.length - 2} respuestas más
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="mt-4">
      <div className="font-bold text-[#e6a800] mb-2 text-sm">Comentarios</div>
      {loading ? (
        <div className="text-gray-400 text-sm">Cargando comentarios...</div>
      ) : comentarios.length === 0 ? (
        <div className="text-gray-400 text-sm">Sé el primero en comentar.</div>
      ) : (
        renderComentarios(comentariosTree)
      )}
      {/* Input para comentar al post (no respuesta) */}
      {respondiendoA === null && (
        <div className="flex items-center gap-2 mt-4">
          <input
            type="text"
            className="flex-1 bg-[#18181b] text-white border border-[#e6a800] rounded-xl px-3 py-1"
            placeholder="Escribe un comentario..."
            value={nuevoComentario}
            onChange={e => setNuevoComentario(e.target.value)}
            disabled={subiendo}
          />
          <button
            className="bg-[#e6a800] text-black font-bold px-3 py-1 rounded-xl transition"
            onClick={() => handleComentar(null)}
            disabled={subiendo}
          >
            {subiendo ? 'Enviando...' : 'Comentar'}
          </button>
        </div>
      )}
      {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
    </div>
  );
};

export default ComunidadComentarios; 