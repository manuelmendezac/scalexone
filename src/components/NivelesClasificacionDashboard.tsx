import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import useNeuroState from '../store/useNeuroState';
import LoadingScreen from './LoadingScreen';

interface Nivel {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  orden: number;
  porcentaje_miembros: number;
  puntos_minimos: number;
  puntos_maximos: number;
  comunidad_id: string;
}

interface ProgresoUsuario {
  nivel_actual: string;
  ventas_acumuladas: number;
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
  const [niveles, setNiveles] = useState<Nivel[]>([]);
  const [progresoUsuario, setProgresoUsuario] = useState<ProgresoUsuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener el usuario actual
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError('Usuario no autenticado');
          return;
        }

        // Obtener niveles de la comunidad
        const { data: nivelesData, error: nivelesError } = await supabase
          .from('niveles_ventas')
          .select('*')
          .eq('community_id', userInfo?.community_id || 'default')
          .order('min_ventas', { ascending: true });

        if (nivelesError) {
          console.error('Error al obtener niveles:', nivelesError);
          throw new Error('Error al cargar los niveles de clasificación');
        }

        if (!nivelesData || nivelesData.length === 0) {
          console.warn('No se encontraron niveles configurados');
          setError('No hay niveles configurados en el sistema');
          return;
        }

        // Obtener progreso del usuario
        const { data: progresoData, error: progresoError } = await supabase
          .from('progreso_ventas_usuario')
          .select('nivel_actual, ventas_acumuladas')
          .eq('usuario_id', user.id)
          .single();

        if (progresoError && progresoError.code !== 'PGRST116') {
          console.error('Error al obtener progreso:', progresoError);
          throw new Error('Error al cargar el progreso del usuario');
        }

        // Si no existe progreso, crear uno inicial
        if (!progresoData) {
          const nivelInicial = nivelesData[0];
          const { error: createError } = await supabase
            .from('progreso_ventas_usuario')
            .insert({
              usuario_id: user.id,
              nivel_actual: nivelInicial.id,
              ventas_acumuladas: 0
            });

          if (createError) {
            console.error('Error al crear progreso inicial:', createError);
            throw new Error('Error al inicializar el progreso del usuario');
          }

          setProgresoUsuario({
            nivel_actual: nivelInicial.id,
            ventas_acumuladas: 0
          });
        } else {
          setProgresoUsuario(progresoData);
        }

        // Transformar los datos de niveles
        const nivelesFormateados = nivelesData.map((nivel, index) => ({
          id: nivel.id,
          nombre: nivel.nombre,
          descripcion: nivel.descripcion || '',
          icono: nivel.icono || '🏆',
          color: nivel.color || '#FFD700',
          orden: index + 1,
          porcentaje_miembros: 0, // TODO: Calcular porcentaje real
          puntos_minimos: nivel.min_ventas,
          puntos_maximos: nivel.max_ventas,
          comunidad_id: nivel.community_id
        }));

        setNiveles(nivelesFormateados);
      } catch (err: any) {
        console.error('Error en fetchData:', err);
        setError(err.message || 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userInfo]);

  if (loading) {
    return <LoadingScreen />;
  }

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

  const nivelActual = niveles.find(n => n.id === progresoUsuario?.nivel_actual);
  const siguienteNivel = niveles.find(n => n.orden === (nivelActual?.orden || 0) + 1);

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Sección de Progreso */}
      <div className="bg-black/50 backdrop-blur-sm rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-neurolink-matrixGreen">
            Nivel {nivelActual?.orden || 1} - {nivelActual?.nombre || 'Starter'}
          </h2>
          <div className="text-right">
            <p className="text-sm text-gray-400">Ventas Acumuladas</p>
            <p className="text-xl text-white">${progresoUsuario?.ventas_acumuladas?.toLocaleString() || '0'}</p>
          </div>
        </div>

        {/* Barra de Progreso */}
        {nivelActual && siguienteNivel && (
          <div className="mb-4">
            <div className="h-4 bg-black/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-neurolink-matrixGreen"
                style={{
                  width: `${Math.min(
                    ((progresoUsuario?.ventas_acumuladas || 0) - nivelActual.puntos_minimos) /
                    (siguienteNivel.puntos_minimos - nivelActual.puntos_minimos) * 100,
                    100
                  )}%`
                }}
              />
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-400">${nivelActual.puntos_minimos.toLocaleString()}</span>
              <span className="text-gray-400">${siguienteNivel.puntos_minimos.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Lista de Niveles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {niveles.slice(0, Math.ceil(niveles.length / 2)).map((nivel) => (
            <div
              key={nivel.id}
              className={`flex items-center gap-4 p-4 rounded-lg ${
                nivel.id === progresoUsuario?.nivel_actual
                  ? 'bg-neurolink-matrixGreen/20 border border-neurolink-matrixGreen'
                  : 'bg-black/30'
              }`}
            >
              <span className="text-2xl">{nivel.icono}</span>
              <div className="flex-1">
                <h3 className="font-bold text-white">{nivel.nombre}</h3>
                <p className="text-sm text-gray-400">
                  {nivel.descripcion || `Ventas: $${nivel.puntos_minimos.toLocaleString()} - $${nivel.puntos_maximos.toLocaleString()}`}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="space-y-4">
          {niveles.slice(Math.ceil(niveles.length / 2)).map((nivel) => (
            <div
              key={nivel.id}
              className={`flex items-center gap-4 p-4 rounded-lg ${
                nivel.id === progresoUsuario?.nivel_actual
                  ? 'bg-neurolink-matrixGreen/20 border border-neurolink-matrixGreen'
                  : 'bg-black/30'
              }`}
            >
              <span className="text-2xl">{nivel.icono}</span>
              <div className="flex-1">
                <h3 className="font-bold text-white">{nivel.nombre}</h3>
                <p className="text-sm text-gray-400">
                  {nivel.descripcion || `Ventas: $${nivel.puntos_minimos.toLocaleString()} - $${nivel.puntos_maximos.toLocaleString()}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NivelesClasificacionDashboard; 