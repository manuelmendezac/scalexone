import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import useNeuroState from '../store/useNeuroState';
import { Share2, Mail, Copy, Check } from 'lucide-react';

interface CommunityData {
  id: string;
  nombre: string;
  descripcion: string;
  logo_url: string;
  logo_horizontal_url: string;
  banner_url: string;
  miembros_count: number;
  cursos_count: number;
  servicios_count: number;
}

interface Usuario {
  id: string;
  name: string;
  avatar_url: string;
  email: string;
}

const CommunityProfileCard: React.FC = () => {
  const { userInfo } = useNeuroState();
  const [community, setCommunity] = useState<CommunityData | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Generar enlace de afiliado único para el usuario
  const affiliateLink = `https://scalexone.app/ref/${userInfo?.id || 'default'}`;

  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        // Obtener datos de la comunidad ScaleXone
        const { data: communityData, error: communityError } = await supabase
          .from('comunidades')
          .select('*')
          .eq('slug', 'scalexone')
          .single();

        if (!communityError && communityData) {
          // Contar miembros reales
          const { count: membersCount } = await supabase
            .from('usuarios')
            .select('*', { count: 'exact', head: true })
            .or('community_id.eq.scalexone,community_id.eq.default');

          // Obtener usuarios recientes para mostrar avatares
          const { data: recentUsers } = await supabase
            .from('usuarios')
            .select('id, name, avatar_url, email')
            .or('community_id.eq.scalexone,community_id.eq.default')
            .order('created_at', { ascending: false })
            .limit(6);

          setCommunity({
            ...communityData,
            miembros_count: membersCount || 134,
            cursos_count: 1, // Placeholder
            servicios_count: 7 // Placeholder
          });

          setUsuarios(recentUsers || []);
        }
      } catch (error) {
        console.error('Error fetching community data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunityData();
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(affiliateLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const handleShare = (platform: string) => {
    const text = `¡Únete a ScaleXOne, la plataforma de crecimiento empresarial! ${affiliateLink}`;
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(affiliateLink);

    const shareUrls = {
      whatsapp: `https://wa.me/?text=${encodedText}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent('¡Únete a ScaleXOne!')}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
    };

    if (shareUrls[platform as keyof typeof shareUrls]) {
      window.open(shareUrls[platform as keyof typeof shareUrls], '_blank');
    }
    setShowShareMenu(false);
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl p-6 border border-neutral-700 animate-pulse">
        <div className="h-32 bg-neutral-700 rounded-xl mb-4"></div>
        <div className="h-6 bg-neutral-700 rounded mb-2"></div>
        <div className="h-4 bg-neutral-700 rounded mb-4"></div>
        <div className="flex justify-around mb-4">
          <div className="h-12 w-16 bg-neutral-700 rounded"></div>
          <div className="h-12 w-16 bg-neutral-700 rounded"></div>
          <div className="h-12 w-16 bg-neutral-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!community) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl border border-neutral-700 overflow-hidden shadow-2xl">
      {/* Banner con logo */}
      <div 
        className="h-32 bg-gradient-to-r from-purple-900 via-blue-900 to-purple-900 relative overflow-hidden"
        style={{
          backgroundImage: community.banner_url ? `url(${community.banner_url})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        {/* Logo de la comunidad */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 p-1 shadow-xl">
            <div className="w-full h-full rounded-full overflow-hidden bg-neutral-900 flex items-center justify-center">
              {community.logo_url ? (
                <img 
                  src={community.logo_url} 
                  alt={community.nombre}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 pt-8">
        {/* Nombre y descripción */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">{community.nombre}</h2>
          <p className="text-yellow-400 text-sm font-medium mb-2">Comunidad pública</p>
          <p className="text-gray-300 text-sm leading-relaxed">
            {community.descripcion || 'Comunidad principal de ScaleXOne - Plataforma de crecimiento empresarial'}
          </p>
        </div>

        {/* Estadísticas */}
        <div className="flex justify-around mb-6 py-4 bg-neutral-800/50 rounded-xl">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{community.miembros_count}</div>
            <div className="text-gray-400 text-sm">Miembros</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{community.cursos_count}</div>
            <div className="text-gray-400 text-sm">Cursos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{community.servicios_count}</div>
            <div className="text-gray-400 text-sm">Servicios</div>
          </div>
        </div>

        {/* Usuarios recientes */}
        {usuarios.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-center items-center gap-2 mb-3">
              <div className="flex -space-x-2">
                {usuarios.slice(0, 6).map((usuario, index) => (
                  <div
                    key={usuario.id}
                    className="w-10 h-10 rounded-full border-2 border-neutral-700 overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg"
                    style={{ zIndex: 6 - index }}
                  >
                    {usuario.avatar_url ? (
                      <img 
                        src={usuario.avatar_url} 
                        alt={usuario.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-xs font-bold">
                        {usuario.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              {community.miembros_count > 6 && (
                <span className="text-gray-400 text-sm ml-2">
                  +{community.miembros_count - 6} más
                </span>
              )}
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-2 mb-6">
          {/* Botón de correo de soporte */}
          <button className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-white py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
            <Mail size={16} />
            <span className="text-xs font-medium">Soporte</span>
          </button>

          {/* Botón de compartir enlace de afiliado */}
          <div className="relative">
            <button 
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-lg"
            >
              <Share2 size={16} />
              <span className="text-xs">Compartir</span>
            </button>

            {/* Menú de compartir */}
            {showShareMenu && (
              <div className="absolute bottom-full right-0 mb-2 bg-neutral-800 border border-neutral-600 rounded-xl shadow-xl p-2 min-w-48 z-50">
                <div className="mb-2 p-2 border-b border-neutral-600">
                  <p className="text-white text-xs font-medium mb-1">Tu enlace de afiliado:</p>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={affiliateLink}
                      readOnly
                      className="bg-neutral-700 text-white text-xs px-2 py-1 rounded flex-1 border border-neutral-600"
                    />
                    <button 
                      onClick={handleCopyLink}
                      className="text-yellow-400 hover:text-yellow-300 p-1"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <button 
                    onClick={() => handleShare('whatsapp')}
                    className="w-full text-left px-3 py-2 text-white hover:bg-neutral-700 rounded-lg text-sm transition-colors"
                  >
                    📱 WhatsApp
                  </button>
                  <button 
                    onClick={() => handleShare('telegram')}
                    className="w-full text-left px-3 py-2 text-white hover:bg-neutral-700 rounded-lg text-sm transition-colors"
                  >
                    ✈️ Telegram
                  </button>
                  <button 
                    onClick={() => handleShare('twitter')}
                    className="w-full text-left px-3 py-2 text-white hover:bg-neutral-700 rounded-lg text-sm transition-colors"
                  >
                    🐦 Twitter
                  </button>
                  <button 
                    onClick={() => handleShare('facebook')}
                    className="w-full text-left px-3 py-2 text-white hover:bg-neutral-700 rounded-lg text-sm transition-colors"
                  >
                    📘 Facebook
                  </button>
                  <button 
                    onClick={() => handleShare('linkedin')}
                    className="w-full text-left px-3 py-2 text-white hover:bg-neutral-700 rounded-lg text-sm transition-colors"
                  >
                    💼 LinkedIn
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer con branding */}
        <div className="text-center pt-4 border-t border-neutral-700">
          <div className="flex items-center justify-center gap-2">
            <span className="text-gray-500 text-xs">Creado con</span>
            {community.logo_horizontal_url ? (
              <img 
                src={community.logo_horizontal_url} 
                alt="ScaleXone" 
                className="h-4 opacity-60"
              />
            ) : (
              <span className="text-gray-500 text-xs font-medium">ScaleXone</span>
            )}
          </div>
        </div>
      </div>

      {/* Click outside para cerrar menú de compartir */}
      {showShareMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowShareMenu(false)}
        ></div>
      )}
    </div>
  );
};

export default CommunityProfileCard;
