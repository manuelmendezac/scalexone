// Dashboard de niveles de clasificación - Sistema de niveles
// Forzando nuevo deploy - 2024
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import useNeuroState from '../store/useNeuroState';
import LoadingScreen from './LoadingScreen';

type TipoNivel = 'ventas' | 'academico';

interface NivelVentas {
  id: string;
  nombre: string;
  min_ventas: number;
  max_ventas: number;
  descripcion: string;
  icono: string;
  color: string;
}

interface NivelAcademico {
  id: string;
  nombre: string;
  modulos_requeridos: number;
  videos_requeridos: number;
  xp_requerido?: number;
  descripcion: string;
  icono: string;
  color: string;
}

interface ProgresoUsuario {
  nivel_actual_ventas: string | null;
  nivel_actual_academico: string | null;
  ventas_actuales: number;
  modulos_completados: number;
  videos_completados: number;
  xp_actual: number;
}

const NivelesClasificacionDashboard: React.FC = () => {
  const { userInfo } = useNeuroState();
  const [tipoNivel, setTipoNivel] = useState<TipoNivel>('academico');
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
          .order('modulos_requeridos', { ascending: true })
          .order('videos_requeridos', { ascending: true });

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

  const renderRequisitos = (nivel: NivelVentas | NivelAcademico) => {
    if (tipoNivel === 'ventas') {
      const n = nivel as NivelVentas;
      return (
        <div className="mt-4">
          <h3 className="font-bold text-lg text-white mb-2">Requisitos del Nivel</h3>
          <ul className="list-disc list-inside text-gray-300 space-y-1">
            <li>{n.min_ventas} Ventas Mínimas</li>
          </ul>
        </div>
      );
    } else {
      const n = nivel as NivelAcademico;
      const requisitos = [
        `${n.modulos_requeridos} Módulos Completados`,
        `${n.videos_requeridos} Vídeos Vistos`
      ];
      if (n.xp_requerido && n.xp_requerido > 0) {
        requisitos.push(`${n.xp_requerido} XP Obtenidos`);
      }
      return (
        <div className="mt-4">
          <h3 className="font-bold text-lg text-white mb-2">Requisitos del Nivel</h3>
          <ul className="list-disc list-inside text-gray-300 space-y-1">
            {requisitos.map((req, i) => <li key={i}>{req}</li>)}
          </ul>
        </div>
      );
    }
  };

  const renderProgressBar = () => {
    if (!progreso || !siguienteNivel) return null;

    if (tipoNivel === 'ventas') {
      const nivelVentasActual = nivelActual as NivelVentas;
      const siguienteNivelVentas = siguienteNivel as NivelVentas;
      const minVentas = nivelVentasActual?.min_ventas ?? 0;
      const meta = siguienteNivelVentas.min_ventas;
      const progresoActual = progreso.ventas_actuales - minVentas;
      const totalParaNivel = meta - minVentas;
      const porcentaje = totalParaNivel > 0 ? (progresoActual / totalParaNivel) * 100 : 0;

      return (
        <div>
          <span className="text-white text-sm">{`Progreso: ${progreso.ventas_actuales.toFixed(0)} / ${meta} ventas`}</span>
          <div className="w-full bg-gray-700 rounded-full h-2.5 mt-1">
            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${Math.min(porcentaje, 100)}%` }}></div>
          </div>
        </div>
      );
    } else {
      const siguienteNivelAcademico = siguienteNivel as NivelAcademico;
      const progresoModulos = siguienteNivelAcademico.modulos_requeridos > 0 ? (progreso.modulos_completados / siguienteNivelAcademico.modulos_requeridos) * 100 : 0;
      const progresoVideos = siguienteNivelAcademico.videos_requeridos > 0 ? (progreso.videos_completados / siguienteNivelAcademico.videos_requeridos) * 100 : 0;
      const progresoXP = (siguienteNivelAcademico.xp_requerido ?? 0) > 0 ? (progreso.xp_actual / (siguienteNivelAcademico.xp_requerido ?? 1)) * 100 : 0;

      return (
        <div className="space-y-3">
          <div>
            <span className="text-white text-sm">{`Módulos: ${progreso.modulos_completados} / ${siguienteNivelAcademico.modulos_requeridos}`}</span>
            <div className="w-full bg-gray-700 rounded-full h-2.5 mt-1">
              <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${Math.min(progresoModulos, 100)}%` }}></div>
            </div>
          </div>
          <div>
            <span className="text-white text-sm">{`Vídeos: ${progreso.videos_completados} / ${siguienteNivelAcademico.videos_requeridos}`}</span>
            <div className="w-full bg-gray-700 rounded-full h-2.5 mt-1">
              <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: `${Math.min(progresoVideos, 100)}%` }}></div>
            </div>
          </div>
          {(siguienteNivelAcademico.xp_requerido ?? 0) > 0 && (
             <div>
              <span className="text-white text-sm">{`XP: ${progreso.xp_actual} / ${siguienteNivelAcademico.xp_requerido}`}</span>
              <div className="w-full bg-gray-700 rounded-full h-2.5 mt-1">
                <div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: `${Math.min(progresoXP, 100)}%` }}></div>
              </div>
            </div>
          )}
        </div>
      );
    }
  };
  
  const niveles = tipoNivel === 'ventas' ? nivelesVentas : nivelesAcademicos;

  return (
    <div className="container mx-auto p-4 bg-gray-900 text-white rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Clasificación y Niveles</h1>
        <div className="flex items-center space-x-4">
          <span className="text-lg font-semibold">{userInfo?.name || 'Usuario'}</span>
          <img src={avatarUrl} alt="Avatar" className="w-12 h-12 rounded-full object-cover" />
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex border-b border-gray-700">
          <button 
            onClick={() => setTipoNivel('academico')}
            className={`py-2 px-4 text-lg font-semibold transition-colors duration-300 ${tipoNivel === 'academico' ? 'border-b-2 border-yellow-400 text-yellow-400' : 'text-gray-400 hover:text-white'}`}
          >
            Educación
          </button>
          <button 
            onClick={() => setTipoNivel('ventas')}
            className={`py-2 px-4 text-lg font-semibold transition-colors duration-300 ${tipoNivel === 'ventas' ? 'border-b-2 border-yellow-400 text-yellow-400' : 'text-gray-400 hover:text-white'}`}
          >
            Ventas
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold mb-4">Niveles de {tipoNivel === 'ventas' ? 'Ventas' : 'Educación'}</h2>
          <div className="space-y-4">
            {niveles.map((nivel, index) => {
              const esNivelActual = nivel.id === (tipoNivel === 'ventas' ? progreso?.nivel_actual_ventas : progreso?.nivel_actual_academico);
              const esNivelBloqueado = currentIndex < index && !esNivelActual;

              return (
                <div key={nivel.id} className={`p-4 rounded-lg transition-all duration-300 ${esNivelActual ? 'bg-gray-700 border-2 border-yellow-400 shadow-lg' : 'bg-gray-800'} ${esNivelBloqueado ? 'opacity-50' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-4xl">{nivel.icono}</span>
                      <div>
                        <h3 className="text-xl font-bold">{nivel.nombre}</h3>
                        <p className="text-sm text-gray-400">{nivel.descripcion}</p>
                      </div>
                    </div>
                    {esNivelActual && <span className="text-sm font-bold bg-yellow-400 text-gray-900 px-3 py-1 rounded-full">Nivel Actual</span>}
                    {esNivelBloqueado && <span className="text-2xl">🔒</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Tu Progreso</h2>
          {nivelActual ? (
            <div>
              <h3 className="text-xl font-semibold text-yellow-400">{nivelActual.nombre}</h3>
              <p className="text-gray-400 mb-4">{nivelActual.descripcion}</p>
              
              {siguienteNivel && (
                <div className="my-6">
                  <h4 className="font-bold text-lg text-white mb-2">Próximo Nivel: {siguienteNivel.nombre}</h4>
                  {renderProgressBar()}
                </div>
              )}

              {renderRequisitos(nivelActual)}
            </div>
          ) : (
            <p className="text-gray-400">No has iniciado tu progreso en esta área.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NivelesClasificacionDashboard; 