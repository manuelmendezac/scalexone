import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import useNeuroState from '../store/useNeuroState';
import LoadingScreen from './LoadingScreen';

interface Nivel {
  id: number;
  nivel: number;
  titulo: string;
  descripcion: string;
  xp_requerida: number;
  recompensa_monedas: number;
  requisitos: string[];
}

interface ProgresoUsuario {
  nivel_actual: number;
  xp_actual: number;
  xp_siguiente_nivel: number;
  monedas: number;
}

const NivelesClasificacionDashboard: React.FC = () => {
  const { userInfo } = useNeuroState();
  const [niveles, setNiveles] = useState<Nivel[]>([]);
  const [progreso, setProgreso] = useState<ProgresoUsuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>("/images/silueta-perfil.svg");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError('Usuario no autenticado');
          return;
        }

        // Obtener avatar del usuario
        const { data: userData } = await supabase
          .from('usuarios')
          .select('avatar_url')
          .eq('email', user.email)
          .single();

        if (userData?.avatar_url) {
          setAvatarUrl(userData.avatar_url);
        } else if (user.user_metadata?.avatar_url) {
          setAvatarUrl(user.user_metadata.avatar_url);
        }

        // Obtener niveles
        const { data: nivelesData, error: nivelesError } = await supabase
          .from('niveles_xp')
          .select('*')
          .order('nivel', { ascending: true });

        if (nivelesError) throw nivelesError;

        // Obtener progreso del usuario
        const { data: progresoData, error: progresoError } = await supabase
          .from('progreso_usuario_xp')
          .select('*')
          .eq('usuario_id', user.id)
          .single();

        if (progresoError && progresoError.code !== 'PGRST116') throw progresoError;

        // Si no existe el progreso, crearlo
        if (!progresoData) {
          const nuevoProgreso = {
            usuario_id: user.id,
            nivel_actual: 1,
            xp_actual: 0,
            xp_siguiente_nivel: 1000,
            monedas: 0
          };

          const { data: nuevoProgresoData, error: nuevoProgresoError } = await supabase
            .from('progreso_usuario_xp')
            .insert(nuevoProgreso)
            .select()
            .single();

          if (nuevoProgresoError) throw nuevoProgresoError;
          setProgreso(nuevoProgresoData);
        } else {
          setProgreso(progresoData);
        }

        setNiveles(nivelesData || []);

      } catch (err: any) {
        console.error('Error al cargar datos:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <LoadingScreen />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-4">
        <div className="text-red-500 mb-4">⚠️ {error}</div>
        <button
          onClick={() => window.location.reload()}
          className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const nivelActual = niveles.find(n => n.nivel === progreso?.nivel_actual);
  const siguienteNivel = niveles.find(n => n.nivel === (progreso?.nivel_actual || 0) + 1);
  const porcentajeProgreso = siguienteNivel 
    ? ((progreso?.xp_actual || 0) / siguienteNivel.xp_requerida) * 100 
    : 0;

  return (
    <div className="container mx-auto p-8">
      {/* Panel Principal */}
      <div className="bg-[#1A1A1A] rounded-xl p-8 border border-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.3)]">
        <div className="flex items-center gap-8">
          {/* Círculo de Progreso y Perfil */}
          <div className="relative min-w-[180px]">
            <div className="w-44 h-44 rounded-full bg-[#2A2A2A] relative overflow-hidden border-4 border-[#FFD700]">
              {/* Círculo de Progreso */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="88"
                  cy="88"
                  r="82"
                  className="fill-none stroke-[#333333] stroke-[8]"
                />
                <circle
                  cx="88"
                  cy="88"
                  r="82"
                  className="fill-none stroke-[#FFD700] stroke-[8]"
                  strokeDasharray={`${porcentajeProgreso * 5.15} 515`}
                  style={{
                    transition: 'stroke-dasharray 0.5s ease'
                  }}
                />
              </svg>
              {/* Foto de Perfil */}
              <img
                src={avatarUrl}
                alt="Perfil"
                className="absolute inset-0 w-full h-full object-cover rounded-full p-1"
              />
              {/* Indicador de Nivel */}
              <div className="absolute -bottom-2 -right-2 bg-[#FFD700] text-black rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl border-2 border-[#1A1A1A] shadow-lg">
                {progreso?.nivel_actual || 1}
              </div>
            </div>
          </div>

          {/* Información del Usuario */}
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-white mb-2">{userInfo?.name || 'Usuario'} - Investor Nomad</h2>
            <div className="flex items-center gap-4 mb-4">
              <span className="bg-[#FFD700] text-black px-6 py-2 rounded-full font-semibold text-lg">
                {nivelActual?.titulo || `Nivel ${progreso?.nivel_actual || 1}`}
              </span>
              <span className="text-gray-400">|</span>
              <span className="text-2xl font-bold text-[#FFD700]">{progreso?.xp_actual || 0} XP</span>
            </div>
            <p className="text-gray-400 text-lg">
              {siguienteNivel ? `${siguienteNivel.xp_requerida - (progreso?.xp_actual || 0)} XP para ${siguienteNivel.titulo}` : 'Nivel máximo alcanzado'}
            </p>
          </div>
        </div>

        {/* Grid de Niveles */}
        <div className="mt-12 grid grid-cols-2 lg:grid-cols-5 gap-4">
          {niveles.map((nivel) => (
            <div 
              key={nivel.id}
              className={`relative p-4 rounded-lg ${
                nivel.nivel <= (progreso?.nivel_actual || 1)
                  ? 'bg-[#2A2A2A] border border-[#FFD700]'
                  : 'bg-[#232323] opacity-80'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  nivel.nivel <= (progreso?.nivel_actual || 1)
                    ? 'bg-[#FFD700] text-black'
                    : 'bg-[#333333] text-gray-500'
                }`}>
                  {nivel.nivel <= (progreso?.nivel_actual || 1) ? (
                    nivel.nivel
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 116 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">Nivel {nivel.nivel}</h3>
                  <h4 className="text-[#FFD700]">{nivel.titulo}</h4>
                </div>
              </div>
              <p className="text-gray-400 text-sm">{nivel.descripcion}</p>
            </div>
          ))}
        </div>

        {/* Tabla de Requisitos */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="text-[#FFD700] mr-2">⭐</span>
            Requisitos por Nivel
          </h3>
          <div className="overflow-x-auto rounded-lg border border-[#FFD700]">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#2A2A2A] border-b border-[#FFD700]">
                  <th className="p-4 text-[#FFD700]">Nivel</th>
                  <th className="p-4 text-[#FFD700]">Título</th>
                  <th className="p-4 text-[#FFD700]">XP Requerida</th>
                  <th className="p-4 text-[#FFD700]">Recompensa</th>
                  <th className="p-4 text-[#FFD700]">Requisitos</th>
                </tr>
              </thead>
              <tbody>
                {niveles.map((nivel) => (
                  <tr key={nivel.id} className="border-b border-[#333333] hover:bg-[#2A2A2A] transition-colors">
                    <td className="p-4 text-white font-semibold">{nivel.nivel}</td>
                    <td className="p-4 text-[#FFD700]">{nivel.titulo}</td>
                    <td className="p-4 text-white">{nivel.xp_requerida.toLocaleString()} XP</td>
                    <td className="p-4 text-white">{nivel.recompensa_monedas.toLocaleString()} Monedas</td>
                    <td className="p-4 text-gray-300">
                      <ul className="list-disc list-inside space-y-1">
                        {nivel.requisitos?.map((requisito, index) => (
                          <li key={index}>{requisito}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NivelesClasificacionDashboard; 