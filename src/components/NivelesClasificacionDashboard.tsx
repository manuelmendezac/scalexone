import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import useNeuroState from '../store/useNeuroState';
import LoadingScreen from './LoadingScreen';

interface NivelVentas {
  id: number;
  nombre: string;
  descripcion: string;
  min_ventas: number;
  max_ventas: number;
  icono?: string;
  color?: string;
}

interface NivelAcademico {
  id: number;
  nombre: string;
  descripcion: string;
  modulos_requeridos: number;
  videos_requeridos: number;
  icono?: string;
  color?: string;
}

interface ProgresoVentas {
  nivel_actual: number;
  ventas_acumuladas: number;
}

interface ProgresoAcademico {
  nivel_actual: number;
  modulos_completados: number;
  videos_completados: number;
}

type TipoNivel = 'ventas' | 'educacion';

const NivelesClasificacionDashboard: React.FC = () => {
  const { userInfo } = useNeuroState();
  const [tipoNivel, setTipoNivel] = useState<TipoNivel>('ventas');
  const [nivelesVentas, setNivelesVentas] = useState<NivelVentas[]>([]);
  const [nivelesAcademicos, setNivelesAcademicos] = useState<NivelAcademico[]>([]);
  const [progresoVentas, setProgresoVentas] = useState<ProgresoVentas | null>(null);
  const [progresoAcademico, setProgresoAcademico] = useState<ProgresoAcademico | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        // Obtener niveles de ventas
        const { data: nivelesVentasData, error: nivelesVentasError } = await supabase
          .from('niveles_ventas')
          .select('*')
          .order('min_ventas', { ascending: true });

        if (nivelesVentasError) throw nivelesVentasError;

        // Obtener niveles académicos
        const { data: nivelesAcademicosData, error: nivelesAcademicosError } = await supabase
          .from('niveles_academicos')
          .select('*')
          .order('modulos_requeridos', { ascending: true });

        if (nivelesAcademicosError) throw nivelesAcademicosError;

        // Obtener progreso de ventas
        const { data: progresoVentasData, error: progresoVentasError } = await supabase
          .from('progreso_ventas_usuario')
          .select('nivel_actual, ventas_acumuladas')
          .eq('usuario_id', user.id)
          .single();

        if (progresoVentasError && progresoVentasError.code !== 'PGRST116') throw progresoVentasError;

        // Obtener progreso académico
        const { data: progresoAcademicoData, error: progresoAcademicoError } = await supabase
          .from('progreso_academico_usuario')
          .select('nivel_actual, modulos_completados, videos_completados')
          .eq('usuario_id', user.id)
          .single();

        if (progresoAcademicoError && progresoAcademicoError.code !== 'PGRST116') throw progresoAcademicoError;

        setNivelesVentas(nivelesVentasData || []);
        setNivelesAcademicos(nivelesAcademicosData || []);
        setProgresoVentas(progresoVentasData || { nivel_actual: nivelesVentasData?.[0]?.id, ventas_acumuladas: 0 });
        setProgresoAcademico(progresoAcademicoData || { 
          nivel_actual: nivelesAcademicosData?.[0]?.id, 
          modulos_completados: 0,
          videos_completados: 0
        });

      } catch (err: any) {
        console.error('Error en fetchData:', err);
        setError(err.message || 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userInfo]);

  if (loading) return <LoadingScreen />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-4">
        <div className="text-red-500 mb-4">⚠️ {error}</div>
        <button
          onClick={() => window.location.reload()}
          className="bg-neurolink-matrixGreen text-black px-4 py-2 rounded hover:bg-neurolink-matrixGreen/80"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const nivelVentasActual = nivelesVentas.find(n => n.id === progresoVentas?.nivel_actual);
  const siguienteNivelVentas = nivelesVentas.find(n => n.min_ventas > (nivelVentasActual?.max_ventas || 0));
  
  const nivelAcademicoActual = nivelesAcademicos.find(n => n.id === progresoAcademico?.nivel_actual);
  const siguienteNivelAcademico = nivelesAcademicos.find(n => 
    n.modulos_requeridos > (nivelAcademicoActual?.modulos_requeridos || 0) ||
    n.videos_requeridos > (nivelAcademicoActual?.videos_requeridos || 0)
  );

  return (
    <div className="container mx-auto p-4 space-y-8">
      {/* Perfil y Progreso */}
      <div className="bg-black/50 backdrop-blur-sm rounded-lg p-6">
        <div className="flex items-center gap-6">
          {/* Foto de perfil */}
          <div className="relative">
            <img
              src="/images/silueta-perfil.svg"
              alt="Perfil"
              className="w-24 h-24 rounded-full border-2 border-neurolink-matrixGreen"
            />
            <div className="absolute -bottom-2 -right-2 bg-neurolink-matrixGreen text-black rounded-full w-8 h-8 flex items-center justify-center font-bold">
              {tipoNivel === 'ventas' ? nivelVentasActual?.id : nivelAcademicoActual?.id}
            </div>
          </div>

          {/* Información de nivel */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-neurolink-matrixGreen mb-2">
              {tipoNivel === 'ventas' ? nivelVentasActual?.nombre : nivelAcademicoActual?.nombre}
            </h2>
            <div className="text-sm text-gray-400 mb-4">
              {tipoNivel === 'ventas' 
                ? `Ventas Acumuladas: $${progresoVentas?.ventas_acumuladas?.toLocaleString() || '0'}`
                : `Módulos: ${progresoAcademico?.modulos_completados || 0} / Videos: ${progresoAcademico?.videos_completados || 0}`
              }
            </div>

            {/* Barra de progreso */}
            {tipoNivel === 'ventas' && nivelVentasActual && siguienteNivelVentas && (
              <div className="w-full">
                <div className="h-4 bg-black/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-neurolink-matrixGreen transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        ((progresoVentas?.ventas_acumuladas || 0) - nivelVentasActual.min_ventas) /
                        (siguienteNivelVentas.min_ventas - nivelVentasActual.min_ventas) * 100,
                        100
                      )}%`
                    }}
                  />
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-400">${nivelVentasActual.min_ventas.toLocaleString()}</span>
                  <span className="text-gray-400">${siguienteNivelVentas.min_ventas.toLocaleString()}</span>
                </div>
              </div>
            )}

            {tipoNivel === 'educacion' && nivelAcademicoActual && siguienteNivelAcademico && (
              <div className="w-full">
                <div className="h-4 bg-black/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-neurolink-matrixGreen transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        ((progresoAcademico?.modulos_completados || 0) / siguienteNivelAcademico.modulos_requeridos) * 100,
                        100
                      )}%`
                    }}
                  />
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-400">{nivelAcademicoActual.modulos_requeridos} módulos</span>
                  <span className="text-gray-400">{siguienteNivelAcademico.modulos_requeridos} módulos</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selector de tipo de nivel */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setTipoNivel('ventas')}
          className={`px-6 py-2 rounded-full transition-all duration-300 ${
            tipoNivel === 'ventas'
              ? 'bg-neurolink-matrixGreen text-black font-bold'
              : 'bg-black/30 text-gray-400 hover:bg-black/50'
          }`}
        >
          Niveles de Ventas
        </button>
        <button
          onClick={() => setTipoNivel('educacion')}
          className={`px-6 py-2 rounded-full transition-all duration-300 ${
            tipoNivel === 'educacion'
              ? 'bg-neurolink-matrixGreen text-black font-bold'
              : 'bg-black/30 text-gray-400 hover:bg-black/50'
          }`}
        >
          Niveles Académicos
        </button>
      </div>

      {/* Tabla de Niveles */}
      <div className="bg-black/50 backdrop-blur-sm rounded-lg p-6">
        <h3 className="text-xl font-bold text-neurolink-matrixGreen mb-4">
          {tipoNivel === 'ventas' ? 'Niveles de Ventas' : 'Niveles Académicos'}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="p-3 text-yellow-400">Nivel</th>
                <th className="p-3 text-yellow-400">Nombre</th>
                {tipoNivel === 'ventas' ? (
                  <th className="p-3 text-yellow-400">Ventas Requeridas</th>
                ) : (
                  <>
                    <th className="p-3 text-yellow-400">Módulos Requeridos</th>
                    <th className="p-3 text-yellow-400">Videos Requeridos</th>
                  </>
                )}
                <th className="p-3 text-yellow-400">Descripción</th>
              </tr>
            </thead>
            <tbody>
              {(tipoNivel === 'ventas' ? nivelesVentas : nivelesAcademicos).map((nivel, index) => (
                <tr 
                  key={nivel.id} 
                  className={`border-b border-gray-700/50 ${
                    (tipoNivel === 'ventas' ? progresoVentas?.nivel_actual : progresoAcademico?.nivel_actual) === nivel.id
                      ? 'bg-neurolink-matrixGreen/20'
                      : ''
                  }`}
                >
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">
                    <span className="mr-2">{nivel.icono || '🏆'}</span>
                    {nivel.nombre}
                  </td>
                  {tipoNivel === 'ventas' ? (
                    <td className="p-3">
                      ${(nivel as NivelVentas).min_ventas.toLocaleString()} - ${(nivel as NivelVentas).max_ventas.toLocaleString()}
                    </td>
                  ) : (
                    <>
                      <td className="p-3">{(nivel as NivelAcademico).modulos_requeridos}</td>
                      <td className="p-3">{(nivel as NivelAcademico).videos_requeridos}</td>
                    </>
                  )}
                  <td className="p-3">{nivel.descripcion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NivelesClasificacionDashboard; 