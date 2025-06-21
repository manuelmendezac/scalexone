// Dashboard de niveles de clasificación - Sistema de niveles
// Forzando nuevo deploy - 2024
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import useNeuroState from '../store/useNeuroState';
import LoadingScreen from './LoadingScreen';

interface NivelVentas {
  id: string;
  nombre: string;
  min_ventas: number;
  max_ventas: number;
  descripcion: string;
}

interface NivelAcademico {
  id: string;
  nombre: string;
  modulos_requeridos: number;
  videos_requeridos: number;
  xp_requerido?: number;
  descripcion: string;
}

interface ProgresoUsuario {
  nivel_actual_ventas: string | null;
  nivel_actual_academico: string | null;
  ventas_actuales: number;
  modulos_completados: number;
  videos_completados: number;
  xp_actual: number;
}

type TipoNivel = 'ventas' | 'educacion';

const NivelesClasificacionDashboard: React.FC = () => {
  const { userInfo, userXP, userCoins } = useNeuroState();
  const [tipoNivel, setTipoNivel] = useState<TipoNivel>('educacion');
  const [nivelesVentas, setNivelesVentas] = useState<NivelVentas[]>([]);
  const [nivelesAcademicos, setNivelesAcademicos] = useState<NivelAcademico[]>([]);
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
          setLoading(false);
          return;
        }

        // Obtener avatar y datos del usuario
        const { data: userData } = await supabase
          .from('usuarios')
          .select('avatar_url')
          .eq('id', user.id)
          .single();

        if (userData?.avatar_url) {
          setAvatarUrl(userData.avatar_url);
        } else if (user.user_metadata?.avatar_url) {
          setAvatarUrl(user.user_metadata.avatar_url);
        }

        // Obtener niveles de ventas
        const { data: nivelesVentasData, error: nivelesVentasError } = await supabase
          .from('niveles_ventas')
          .select('*')
          .order('min_ventas', { ascending: true });

        if (nivelesVentasError) throw nivelesVentasError;
        setNivelesVentas(nivelesVentasData || []);

        // Obtener niveles académicos
        const { data: nivelesAcademicosData, error: nivelesAcademicosError } = await supabase
          .from('niveles_academicos')
          .select('*')
          .order('modulos_requeridos', { ascending: true });

        if (nivelesAcademicosError) throw nivelesAcademicosError;
        setNivelesAcademicos(nivelesAcademicosData || []);

        // Obtener progreso del usuario
        const { data: progresoVentasData } = await supabase
          .from('progreso_ventas_usuario')
          .select('nivel_actual, ventas_acumuladas')
          .eq('usuario_id', user.id)
          .single();

        const { data: progresoAcademicoData } = await supabase
          .from('progreso_academico_usuario')
          .select('nivel_actual, modulos_completados, videos_completados')
          .eq('usuario_id', user.id)
          .single();
        
        const { data: progresoXPData } = await supabase
          .from('progreso_usuario_xp')
          .select('xp_actual')
          .eq('usuario_id', user.id)
          .single();

        setProgreso({
          nivel_actual_ventas: progresoVentasData?.nivel_actual || null,
          nivel_actual_academico: progresoAcademicoData?.nivel_actual || null,
          ventas_actuales: progresoVentasData?.ventas_acumuladas || 0,
          modulos_completados: progresoAcademicoData?.modulos_completados || 0,
          videos_completados: progresoAcademicoData?.videos_completados || 0,
          xp_actual: progresoXPData?.xp_actual || 0,
        });

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
  
  const nivelActual = tipoNivel === 'ventas'
    ? nivelesVentas.find(n => n.id === progreso?.nivel_actual_ventas)
    : nivelesAcademicos.find(n => n.id === progreso?.nivel_actual_academico);

  const currentIndex = nivelActual
    ? (tipoNivel === 'ventas'
      ? nivelesVentas.findIndex(n => n.id === nivelActual.id)
      : nivelesAcademicos.findIndex(n => n.id === nivelActual.id))
    : -1;

  const siguienteNivel = (currentIndex !== -1)
    ? (tipoNivel === 'ventas'
      ? (currentIndex < nivelesVentas.length - 1 ? nivelesVentas[currentIndex + 1] : null)
      : (currentIndex < nivelesAcademicos.length - 1 ? nivelesAcademicos[currentIndex + 1] : null))
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-[#1a1a1a] p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Sistema de Niveles */}
        <div className="bg-black/40 border border-[#FFD700]/30 rounded-xl p-4 sm:p-8">
          {/* Selector de tipo de nivel - Versión móvil mejorada */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 mb-8">
            <button
              onClick={() => setTipoNivel('ventas')}
              className={`px-6 py-4 rounded-xl font-bold text-lg transition-all ${
                tipoNivel === 'ventas'
                  ? 'bg-[#FFD700] text-black shadow-lg shadow-[#FFD700]/20'
                  : 'bg-black/40 text-[#FFD700] border border-[#FFD700]/30'
              }`}
            >
              Niveles por Ventas
            </button>
            <button
              onClick={() => setTipoNivel('educacion')}
              className={`px-6 py-4 rounded-xl font-bold text-lg transition-all ${
                tipoNivel === 'educacion'
                  ? 'bg-[#FFD700] text-black shadow-lg shadow-[#FFD700]/20'
                  : 'bg-black/40 text-[#FFD700] border border-[#FFD700]/30'
              }`}
            >
              Niveles por Educación
            </button>
          </div>

          {/* Perfil y Progreso - Versión móvil mejorada */}
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
            {/* Círculo de Progreso y Perfil */}
            <div className="relative w-32 sm:w-44 mb-4 sm:mb-0">
              <div className="aspect-square rounded-full bg-[#2A2A2A] relative overflow-hidden border-4 border-[#FFD700]">
                <img
                  src={avatarUrl}
                  alt="Perfil"
                  className="absolute inset-0 w-full h-full object-cover rounded-full p-1"
                />
                <div className="absolute -bottom-2 -right-2 bg-[#FFD700] text-black rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl border-2 border-[#1A1A1A] shadow-lg">
                  {currentIndex + 1 > 0 ? currentIndex + 1 : '1'}
                </div>
              </div>
            </div>

            {/* Información del Usuario */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">{userInfo?.name || 'Usuario'} - Investor Nomad</h2>
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                <span className="bg-[#FFD700] text-black px-6 py-2 rounded-full font-semibold text-lg w-full sm:w-auto text-center">
                  {nivelActual?.nombre || `Nivel 1`}
                </span>
                <span className="hidden sm:block text-gray-400">|</span>
                {tipoNivel === 'ventas' ? (
                  <span className="text-xl sm:text-2xl font-bold text-[#FFD700]">{progreso?.ventas_actuales || 0} Ventas</span>
                ) : (
                  <div className="flex flex-wrap justify-center sm:justify-start items-center gap-x-4 gap-y-2">
                    <span className="text-lg sm:text-xl font-bold text-[#FFD700]">{progreso?.modulos_completados || 0} Módulos</span>
                    <span className="hidden sm:block text-gray-400">|</span>
                    <span className="text-lg sm:text-xl font-bold text-[#FFD700]">{progreso?.videos_completados || 0} Videos</span>
                     <span className="hidden sm:block text-gray-400">|</span>
                    <span className="text-lg sm:text-xl font-bold text-[#FFD700]">{progreso?.xp_actual || 0} XP</span>
                  </div>
                )}
              </div>
              <p className="text-gray-400 text-base sm:text-lg text-center sm:text-left">
                {siguienteNivel ? (
                  tipoNivel === 'ventas' ?
                  `Faltan ${(siguienteNivel as NivelVentas).min_ventas - (progreso?.ventas_actuales || 0)} ventas para ${siguienteNivel.nombre}`
                  :
                  `Faltan ${(siguienteNivel as NivelAcademico).modulos_requeridos - (progreso?.modulos_completados || 0)} módulos, ${
                    (siguienteNivel as NivelAcademico).videos_requeridos - (progreso?.videos_completados || 0)
                  } videos y ${
                    ((siguienteNivel as NivelAcademico).xp_requerido || 0) - (progreso?.xp_actual || 0)
                  } XP para ${siguienteNivel.nombre}`
                ) : (
                  '¡Nivel máximo alcanzado!'
                )}
              </p>
            </div>
          </div>

          {/* Grid de Niveles - Versión móvil mejorada */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {(tipoNivel === 'ventas' ? nivelesVentas : nivelesAcademicos).map((nivel, index) => {
              const esDesbloqueado = currentIndex >= index;
              return (
              <div 
                key={nivel.id}
                className={`relative p-4 rounded-lg ${
                  esDesbloqueado
                    ? 'bg-[#2A2A2A] border border-[#FFD700] shadow-lg shadow-[#FFD700]/10'
                    : 'bg-[#232323] opacity-80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    esDesbloqueado
                      ? 'bg-[#FFD700] text-black'
                      : 'bg-[#333333] text-gray-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-lg">Nivel {index + 1}</h3>
                    <h4 className="text-[#FFD700]">{nivel.nombre}</h4>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mt-2">{nivel.descripcion}</p>
                {!esDesbloqueado && <div className="absolute top-2 right-2 text-2xl">🔒</div>}
              </div>
            )})}
          </div>

          {/* Tabla de Requisitos */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="text-[#FFD700] mr-2">⭐</span>
              Requisitos por Nivel
            </h3>
            <div className="overflow-x-auto rounded-lg border border-[#FFD700]">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#2A2A2A] border-b border-[#FFD700]">
                    <th className="p-4 text-[#FFD700]">Nivel</th>
                    <th className="p-4 text-[#FFD700]">Nombre</th>
                    {tipoNivel === 'ventas' ? (
                      <>
                        <th className="p-4 text-[#FFD700]">Ventas Mínimas</th>
                        <th className="p-4 text-[#FFD700]">Ventas Máximas</th>
                      </>
                    ) : (
                      <>
                        <th className="p-4 text-[#FFD700]">Módulos Requeridos</th>
                        <th className="p-4 text-[#FFD700]">Videos Requeridos</th>
                        <th className="p-4 text-[#FFD700]">XP Requerido</th>
                      </>
                    )}
                    <th className="p-4 text-[#FFD700]">Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {(tipoNivel === 'ventas' ? nivelesVentas : nivelesAcademicos).map((nivel, index) => (
                    <tr key={nivel.id} className="border-b border-[#333333] hover:bg-[#2A2A2A] transition-colors">
                      <td className="p-4 text-white font-semibold">{index + 1}</td>
                      <td className="p-4 text-[#FFD700]">{nivel.nombre}</td>
                      {tipoNivel === 'ventas' ? (
                        <>
                          <td className="p-4 text-white">{(nivel as NivelVentas).min_ventas}</td>
                          <td className="p-4 text-white">{(nivel as NivelVentas).max_ventas}</td>
                        </>
                      ) : (
                        <>
                          <td className="p-4 text-white">{(nivel as NivelAcademico).modulos_requeridos}</td>
                          <td className="p-4 text-white">{(nivel as NivelAcademico).videos_requeridos}</td>
                          <td className="p-4 text-white">{(nivel as NivelAcademico).xp_requerido || 0}</td>
                        </>
                      )}
                      <td className="p-4 text-gray-300">{nivel.descripcion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sistema de XP y Monedas */}
        <div className="space-y-8">
          {/* Cards de Nivel, XP y Monedas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card de Nivel */}
            <div className="bg-black/40 border border-[#FFD700]/30 rounded-xl p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[#FFD700] text-2xl">🏆</span>
                <span className="text-white font-bold">Nivel {currentIndex +1 > 0 ? currentIndex + 1 : '1' }</span>
              </div>
              <div className="text-sm text-white/70">
                {progreso?.xp_actual || 0} / {siguienteNivel ? (siguienteNivel as NivelAcademico).xp_requerido || 1000 : '∞'} XP
              </div>
            </div>

            {/* Card de Experiencia Total */}
            <div className="bg-black/40 border border-[#FFD700]/30 rounded-xl p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[#FFD700] text-2xl">⭐</span>
                <span className="text-white font-bold">Experiencia Total</span>
              </div>
              <div className="text-[#FFD700] text-2xl font-bold">
                {userXP} XP
              </div>
            </div>

            {/* Card de Monedas */}
            <div className="bg-black/40 border border-[#FFD700]/30 rounded-xl p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[#FFD700] text-2xl">💰</span>
                <span className="text-white font-bold">Monedas</span>
              </div>
              <div className="text-[#FFD700] text-2xl font-bold">
                {userCoins}
              </div>
            </div>
          </div>

          {/* Barra de progreso del usuario */}
          <div className="bg-black/40 border border-[#FFD700]/30 rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <img 
                src={avatarUrl}
                alt="Avatar" 
                className="w-12 h-12 rounded-full border-2 border-[#FFD700]"
              />
              <div>
                <h3 className="text-white font-bold">{userInfo?.name || 'Usuario'}</h3>
                <div className="text-sm text-white/70">Nivel {currentIndex + 1 > 0 ? currentIndex + 1 : '1'}</div>
              </div>
            </div>
            <div className="w-full bg-black/60 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-[#FFD700] h-full rounded-full transition-all duration-500"
                style={{ width: `${siguienteNivel ? ((progreso?.xp_actual || 0) / ((siguienteNivel as NivelAcademico).xp_requerido || 1)) * 100 : 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-white/70">
              <span>{progreso?.xp_actual || 0} XP</span>
              <span>{siguienteNivel ? (siguienteNivel as NivelAcademico).xp_requerido || 1000 : '∞'} XP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NivelesClasificacionDashboard; 