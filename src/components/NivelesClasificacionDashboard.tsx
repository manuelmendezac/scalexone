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

// Componente de progreso circular
const CircularProgress = ({ value, max = 100, size = 160, stroke = 8, color = '#FFD700', bg = '#23232b' }: any) => {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(1, value / max));
  return (
    <svg width={size} height={size} className="block">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={bg}
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct)}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s' }}
      />
    </svg>
  );
};

const ProgressBar = ({ value, max }: { value: number; max: number }) => {
  const percentage = Math.min(100, Math.round((value / max) * 100));
  
  return (
    <div className="relative w-full h-3 bg-black/40 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-neurolink-matrixGreen to-neurolink-cyberBlue"
        style={{ width: `${percentage}%` }}
      />
      <div className="absolute inset-0 w-full h-full">
        {/* Líneas de escaneo */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,transparent_45%,rgba(255,255,255,0.2)_50%,transparent_55%,transparent_100%)] animate-[scan_2s_linear_infinite]" />
      </div>
    </div>
  );
};

const NivelesClasificacionDashboard: React.FC = () => {
  const { userInfo } = useNeuroState();
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

        // Inicializar progreso si no existe
        if (!progresoVentasData) {
          const nivelInicialVentas = nivelesVentasData?.[0];
          if (nivelInicialVentas) {
            await supabase.from('progreso_ventas_usuario').insert({
              usuario_id: user.id,
              nivel_actual: nivelInicialVentas.id,
              ventas_acumuladas: 0
            });
            setProgresoVentas({ nivel_actual: nivelInicialVentas.id, ventas_acumuladas: 0 });
          }
        } else {
          setProgresoVentas(progresoVentasData);
        }

        if (!progresoAcademicoData) {
          const nivelInicialAcademico = nivelesAcademicosData?.[0];
          if (nivelInicialAcademico) {
            await supabase.from('progreso_academico_usuario').insert({
              usuario_id: user.id,
              nivel_actual: nivelInicialAcademico.id,
              modulos_completados: 0,
              videos_completados: 0
            });
            setProgresoAcademico({
              nivel_actual: nivelInicialAcademico.id,
              modulos_completados: 0,
              videos_completados: 0
            });
          }
        } else {
          setProgresoAcademico(progresoAcademicoData);
        }

        setNivelesVentas(nivelesVentasData || []);
        setNivelesAcademicos(nivelesAcademicosData || []);
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Panel de Niveles de Ventas */}
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-neurolink-matrixGreen">
              Nivel de Ventas: {nivelVentasActual?.nombre || 'Inicial'}
            </h2>
            <div className="text-right">
              <p className="text-sm text-gray-400">Ventas Acumuladas</p>
              <p className="text-xl text-white">${progresoVentas?.ventas_acumuladas?.toLocaleString() || '0'}</p>
            </div>
          </div>

          {nivelVentasActual && siguienteNivelVentas && (
            <div className="mb-6">
              <div className="h-4 bg-black/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-neurolink-matrixGreen"
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
        </div>

        {/* Panel de Niveles Académicos */}
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-neurolink-matrixGreen">
              Nivel Académico: {nivelAcademicoActual?.nombre || 'Inicial'}
            </h2>
            <div className="text-right">
              <p className="text-sm text-gray-400">Progreso Académico</p>
              <p className="text-xl text-white">
                {progresoAcademico?.modulos_completados || 0} módulos / {progresoAcademico?.videos_completados || 0} videos
              </p>
            </div>
          </div>

          {nivelAcademicoActual && siguienteNivelAcademico && (
            <div className="mb-6">
              <div className="h-4 bg-black/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-neurolink-matrixGreen"
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

      {/* Tabla de Niveles */}
      <div className="bg-black/50 backdrop-blur-sm rounded-lg p-6">
        <h3 className="text-xl font-bold text-neurolink-matrixGreen mb-4">Requisitos por Nivel</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="p-3 text-yellow-400">Nivel</th>
                <th className="p-3 text-yellow-400">Nombre</th>
                <th className="p-3 text-yellow-400">Ventas Requeridas</th>
                <th className="p-3 text-yellow-400">Módulos Requeridos</th>
                <th className="p-3 text-yellow-400">Videos Requeridos</th>
                <th className="p-3 text-yellow-400">Descripción</th>
              </tr>
            </thead>
            <tbody>
              {nivelesVentas.map((nivel, index) => {
                const nivelAcademico = nivelesAcademicos[index];
                return (
                  <tr key={nivel.id} className={`border-b border-gray-700/50 ${
                    nivel.id === progresoVentas?.nivel_actual ? 'bg-neurolink-matrixGreen/20' : ''
                  }`}>
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3">
                      <span className="mr-2">{nivel.icono || '🏆'}</span>
                      {nivel.nombre}
                    </td>
                    <td className="p-3">${nivel.min_ventas.toLocaleString()} - ${nivel.max_ventas.toLocaleString()}</td>
                    <td className="p-3">{nivelAcademico?.modulos_requeridos || '-'}</td>
                    <td className="p-3">{nivelAcademico?.videos_requeridos || '-'}</td>
                    <td className="p-3">{nivel.descripcion}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NivelesClasificacionDashboard; 