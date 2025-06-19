// Componente de Niveles de Clasificación - v1.0.0
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import useNeuroState from '../store/useNeuroState';
import LoadingScreen from './LoadingScreen';

interface NivelVentas {
  id: number;
  nombre: string;
  min_ventas: number;
  max_ventas: number;
  descripcion: string;
}

interface NivelAcademico {
  id: number;
  nombre: string;
  modulos_requeridos: number;
  videos_requeridos: number;
  descripcion: string;
}

interface ProgresoUsuario {
  nivel_actual_ventas: number;
  nivel_actual_academico: number;
  ventas_actuales: number;
  modulos_completados: number;
  videos_completados: number;
}

type TipoNivel = 'ventas' | 'educacion';

const NivelesClasificacionDashboard: React.FC = () => {
  const { userInfo } = useNeuroState();
  const [tipoNivel, setTipoNivel] = useState<TipoNivel>('ventas');
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
          return;
        }

        // Obtener avatar y datos del usuario
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

        // Obtener niveles de ventas
        const { data: nivelesVentasData, error: nivelesVentasError } = await supabase
          .from('niveles_ventas')
          .select('*')
          .order('id', { ascending: true });

        if (nivelesVentasError) throw nivelesVentasError;
        setNivelesVentas(nivelesVentasData || []);

        // Obtener niveles académicos
        const { data: nivelesAcademicosData, error: nivelesAcademicosError } = await supabase
          .from('niveles_academicos')
          .select('*')
          .order('id', { ascending: true });

        if (nivelesAcademicosError) throw nivelesAcademicosError;
        setNivelesAcademicos(nivelesAcademicosData || []);

        // Obtener progreso del usuario
        const { data: progresoVentasData } = await supabase
          .from('progreso_ventas_usuario')
          .select('nivel_actual, ventas_actuales')
          .eq('usuario_id', user.id)
          .single();

        const { data: progresoAcademicoData } = await supabase
          .from('progreso_academico_usuario')
          .select('nivel_actual, modulos_completados, videos_completados')
          .eq('usuario_id', user.id)
          .single();

        setProgreso({
          nivel_actual_ventas: progresoVentasData?.nivel_actual || 1,
          nivel_actual_academico: progresoAcademicoData?.nivel_actual || 1,
          ventas_actuales: progresoVentasData?.ventas_actuales || 0,
          modulos_completados: progresoAcademicoData?.modulos_completados || 0,
          videos_completados: progresoAcademicoData?.videos_completados || 0
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

  const siguienteNivel = tipoNivel === 'ventas'
    ? nivelesVentas.find(n => n.id === (progreso?.nivel_actual_ventas || 0) + 1)
    : nivelesAcademicos.find(n => n.id === (progreso?.nivel_actual_academico || 0) + 1);

  const calcularPorcentajeProgreso = () => {
    if (tipoNivel === 'ventas' && siguienteNivel) {
      const nivelVentas = siguienteNivel as NivelVentas;
      const ventasActuales = progreso?.ventas_actuales || 0;
      return (ventasActuales / nivelVentas.min_ventas) * 100;
    } else if (tipoNivel === 'educacion' && siguienteNivel) {
      const nivelAcademico = siguienteNivel as NivelAcademico;
      const modulosCompletados = progreso?.modulos_completados || 0;
      const videosCompletados = progreso?.videos_completados || 0;
      const porcentajeModulos = (modulosCompletados / nivelAcademico.modulos_requeridos) * 100;
      const porcentajeVideos = (videosCompletados / nivelAcademico.videos_requeridos) * 100;
      return (porcentajeModulos + porcentajeVideos) / 2;
    }
    return 0;
  };

  const porcentajeProgreso = calcularPorcentajeProgreso();

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-[#1a1a1a] p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Sistema Original de Niveles */}
        <div className="bg-black/40 border border-[#FFD700]/30 rounded-xl p-8">
          {/* Selector de tipo de nivel */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setTipoNivel('ventas')}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                tipoNivel === 'ventas'
                  ? 'bg-[#FFD700] text-black'
                  : 'bg-black/40 text-[#FFD700] border border-[#FFD700]/30'
              }`}
            >
              Niveles por Ventas
            </button>
            <button
              onClick={() => setTipoNivel('educacion')}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                tipoNivel === 'educacion'
                  ? 'bg-[#FFD700] text-black'
                  : 'bg-black/40 text-[#FFD700] border border-[#FFD700]/30'
              }`}
            >
              Niveles por Educación
            </button>
          </div>

          {/* Perfil y Progreso */}
          <div className="flex items-center gap-8 mb-12">
            {/* Círculo de Progreso y Perfil */}
            <div className="relative min-w-[180px]">
              <div className="w-44 h-44 rounded-full bg-[#2A2A2A] relative overflow-hidden border-4 border-[#FFD700]">
                <img
                  src={avatarUrl}
                  alt="Perfil"
                  className="absolute inset-0 w-full h-full object-cover rounded-full p-1"
                />
                <div className="absolute -bottom-2 -right-2 bg-[#FFD700] text-black rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl border-2 border-[#1A1A1A] shadow-lg">
                  {tipoNivel === 'ventas' ? progreso?.nivel_actual_ventas : progreso?.nivel_actual_academico}
                </div>
              </div>
            </div>

            {/* Información del Usuario */}
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-2">{userInfo?.name || 'Usuario'} - Investor Nomad</h2>
              <div className="flex items-center gap-4 mb-4">
                <span className="bg-[#FFD700] text-black px-6 py-2 rounded-full font-semibold text-lg">
                  {nivelActual?.nombre || `Nivel ${tipoNivel === 'ventas' ? progreso?.nivel_actual_ventas : progreso?.nivel_actual_academico}`}
                </span>
                <span className="text-gray-400">|</span>
                {tipoNivel === 'ventas' ? (
                  <span className="text-2xl font-bold text-[#FFD700]">{progreso?.ventas_actuales || 0} Ventas</span>
                ) : (
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-bold text-[#FFD700]">{progreso?.modulos_completados || 0} Módulos</span>
                    <span className="text-gray-400">|</span>
                    <span className="text-xl font-bold text-[#FFD700]">{progreso?.videos_completados || 0} Videos</span>
                  </div>
                )}
              </div>
              <p className="text-gray-400 text-lg">
                {tipoNivel === 'ventas' && siguienteNivel ? (
                  `${(siguienteNivel as NivelVentas).min_ventas - (progreso?.ventas_actuales || 0)} ventas para ${siguienteNivel.nombre}`
                ) : siguienteNivel ? (
                  `Necesitas ${(siguienteNivel as NivelAcademico).modulos_requeridos - (progreso?.modulos_completados || 0)} módulos y ${
                    (siguienteNivel as NivelAcademico).videos_requeridos - (progreso?.videos_completados || 0)
                  } videos para ${siguienteNivel.nombre}`
                ) : (
                  'Nivel máximo alcanzado'
                )}
              </p>
            </div>
          </div>

          {/* Grid de Niveles */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
            {(tipoNivel === 'ventas' ? nivelesVentas : nivelesAcademicos).map((nivel, index) => (
              <div 
                key={nivel.id}
                className={`relative p-4 rounded-lg ${
                  nivel.id <= (tipoNivel === 'ventas' ? progreso?.nivel_actual_ventas || 1 : progreso?.nivel_actual_academico || 1)
                    ? 'bg-[#2A2A2A] border border-[#FFD700]'
                    : 'bg-[#232323] opacity-80'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    nivel.id <= (tipoNivel === 'ventas' ? progreso?.nivel_actual_ventas || 1 : progreso?.nivel_actual_academico || 1)
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
                <p className="text-gray-400 text-sm">{nivel.descripcion}</p>
              </div>
            ))}
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
                <span className="text-white font-bold">Nivel 1</span>
              </div>
              <div className="text-sm text-white/70">
                0 / 1000 XP
              </div>
            </div>

            {/* Card de Experiencia Total */}
            <div className="bg-black/40 border border-[#FFD700]/30 rounded-xl p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[#FFD700] text-2xl">⭐</span>
                <span className="text-white font-bold">Experiencia Total</span>
              </div>
              <div className="text-[#FFD700] text-2xl font-bold">
                0 XP
              </div>
            </div>

            {/* Card de Monedas */}
            <div className="bg-black/40 border border-[#FFD700]/30 rounded-xl p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[#FFD700] text-2xl">💰</span>
                <span className="text-white font-bold">Monedas</span>
              </div>
              <div className="text-[#FFD700] text-2xl font-bold">
                0
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
                <div className="text-sm text-white/70">Nivel 1</div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-[#FFD700]">🔥</span>
                <span className="text-white">1 días seguidos</span>
              </div>
            </div>
            <div className="w-full bg-black/60 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-[#FFD700] h-full rounded-full transition-all duration-500"
                style={{ width: '0%' }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-white/70">
              <span>0 XP</span>
              <span>1000 XP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NivelesClasificacionDashboard; 