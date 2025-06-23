import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabase';
import useNeuroState from '../../store/useNeuroState';
import { Loader2 } from 'lucide-react';

interface Community {
  id: string;
  nombre: string;
  descripcion: string;
  logo_url: string;
  banner_url: string;
  is_public: boolean;
}

const BarraLateralComunidad = () => {
  const { userInfo } = useNeuroState();
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommunityData = async () => {
      // Asumimos que la comunidad a mostrar es la del usuario logueado.
      // En un futuro, esto podría cambiar si un usuario puede ver la comunidad de otro.
      if (!userInfo.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('comunidades')
          .select('*')
          // Por ahora, cada usuario solo puede tener una comunidad, así que buscamos por su ID de propietario.
          .eq('owner_id', userInfo.id)
          .single();

        if (error && error.code !== 'PGRST116') { // Ignorar error de 'no encontrado'
          throw error;
        }

        if (data) {
          setCommunity(data);
        }
      } catch (error) {
        console.error('Error fetching community data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunityData();
  }, [userInfo.id]);

  const getLogoFallback = (name: string) => {
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    return `https://ui-avatars.com/api/?name=${initials}&background=e6a800&color=fff&size=96`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48 bg-[#23232b] rounded-2xl">
        <Loader2 className="animate-spin h-8 w-8 text-yellow-400" />
      </div>
    );
  }

  const communityName = community?.nombre || 'Nombre Comunidad';
  const communityDescription = community?.descripcion || 'Descripción breve de la comunidad...';
  const communityBanner = community?.banner_url || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80';
  const communityLogo = community?.logo_url || getLogoFallback(communityName);
  const communityStatus = community?.is_public ? 'Comunidad pública' : 'Comunidad privada';

  return (
    <div className="flex flex-col gap-6">
      {/* Portada de la comunidad */}
      <div className="bg-[#23232b] rounded-2xl overflow-hidden shadow-lg mb-2">
        <div className="h-28 w-full bg-cover bg-center" style={{backgroundImage: `url(${communityBanner})`}} />
        <div className="flex flex-col items-center p-4">
          <img src={communityLogo} alt="Comunidad" className="w-20 h-20 rounded-full border-4 border-[#18181b] -mt-12 mb-2 bg-[#e6a800] object-cover" />
          <h3 className="text-xl font-bold text-white mb-1">{communityName}</h3>
          <span className="text-[#e6a800] font-semibold text-sm mb-1">{communityStatus}</span>
          <span className="text-gray-400 text-xs text-center">{communityDescription}</span>
        </div>
      </div>
      {/* Miembros, cursos, servicios */}
      <div className="bg-[#23232b] rounded-2xl p-4 flex flex-col items-center gap-2">
        <div className="flex gap-4 mb-2">
          <div className="flex flex-col items-center">
            <span className="text-white font-bold text-lg">134</span>
            <span className="text-gray-400 text-xs">Miembros</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-white font-bold text-lg">1</span>
            <span className="text-gray-400 text-xs">Cursos</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-white font-bold text-lg">7</span>
            <span className="text-gray-400 text-xs">Servicios</span>
          </div>
        </div>
        {/* Avatares de miembros */}
        <div className="flex -space-x-3 mb-2">
          <img className="w-8 h-8 rounded-full border-2 border-[#18181b]" src="https://randomuser.me/api/portraits/men/32.jpg" alt="" />
          <img className="w-8 h-8 rounded-full border-2 border-[#18181b]" src="https://randomuser.me/api/portraits/women/44.jpg" alt="" />
          <img className="w-8 h-8 rounded-full border-2 border-[#18181b]" src="https://randomuser.me/api/portraits/men/45.jpg" alt="" />
          <img className="w-8 h-8 rounded-full border-2 border-[#18181b]" src="https://randomuser.me/api/portraits/women/46.jpg" alt="" />
          <span className="w-8 h-8 rounded-full bg-[#e6a800] text-white flex items-center justify-center text-xs font-bold border-2 border-[#18181b]">+9</span>
        </div>
        {/* Botón de configuración */}
        <Link to="/configuracion-admin" className="w-full mt-2 py-2 rounded-xl bg-[#e6a800] text-black font-bold text-base hover:bg-[#ffb300] transition text-center">
          Configuración
        </Link>
      </div>
      {/* Leaderboard */}
      <div className="bg-[#23232b] rounded-2xl p-4">
        <h4 className="text-[#e6a800] font-bold mb-2 text-sm">Leaderboard</h4>
        <ol className="list-decimal list-inside text-white text-sm">
          <li>Juan Carlos (+692)</li>
          <li>Pablo Duhart (+535)</li>
          <li>York Rodriguez (+400)</li>
        </ol>
      </div>
      {/* Lista de canales/temas solo en escritorio */}
      <div className="hidden md:block bg-[#23232b] rounded-2xl p-4">
        <h4 className="text-[#e6a800] font-bold mb-2 text-sm">Canales</h4>
        <ul className="flex flex-col gap-2">
          <li className="text-white hover:text-[#e6a800] cursor-pointer">General</li>
          <li className="text-white hover:text-[#e6a800] cursor-pointer">Presentaciones</li>
          <li className="text-white hover:text-[#e6a800] cursor-pointer">Recursos</li>
          <li className="text-white hover:text-[#e6a800] cursor-pointer">Networking</li>
        </ul>
      </div>
    </div>
  );
};

export default BarraLateralComunidad; 