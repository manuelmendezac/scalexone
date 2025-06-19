import React, { useEffect, useState } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
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
  nivel_actual: number;
  puntos_totales: number;
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
  const session = useSession();
  const { userInfo } = useNeuroState();
  const [niveles, setNiveles] = useState<Nivel[]>([]);
  const [progresoUsuario, setProgresoUsuario] = useState<ProgresoUsuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return;
      
      try {
        setLoading(true);
        setError(null);

        // Obtener niveles
        const { data: nivelesData, error: nivelesError } = await supabase
          .from('niveles_ventas')
          .select('*')
          .eq('community_id', userInfo?.community_id || 'default')
          .order('min_ventas', { ascending: true });

        if (nivelesError) throw nivelesError;

        // Obtener progreso del usuario
        const { data: progresoData, error: progresoError } = await supabase
          .from('progreso_ventas_usuario')
          .select('*')
          .eq('usuario_id', session.user.id)
          .single();

        if (progresoError && progresoError.code !== 'PGRST116') throw progresoError;

        // Transformar los datos
        const nivelesFormateados = nivelesData?.map((nivel, index) => ({
          id: nivel.id,
          nombre: nivel.nombre,
          descripcion: nivel.descripcion || '',
          icono: nivel.icono || '🏆',
          color: nivel.color || '#FFD700',
          orden: index + 1,
          porcentaje_miembros: 0,
          puntos_minimos: nivel.min_ventas,
          puntos_maximos: nivel.max_ventas,
          comunidad_id: nivel.community_id
        })) || [];

        setNiveles(nivelesFormateados);
        setProgresoUsuario(progresoData || { nivel_actual: 1, puntos_totales: 0 });

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session?.user?.id, userInfo?.community_id]);

  if (loading) {
    return <LoadingScreen message="Cargando niveles..." />;
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-8 bg-black/50 rounded-lg">
        <p>Error: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-neurolink-matrixGreen text-black rounded hover:bg-neurolink-matrixGreen/80"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Panel de Nivel Actual */}
      <div className="bg-black/50 backdrop-blur-sm rounded-lg p-6">
        <h2 className="text-2xl font-bold text-neurolink-matrixGreen mb-4">
          Nivel {progresoUsuario?.nivel_actual || 1}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {niveles.slice(0, Math.min(5, niveles.length)).map((nivel) => (
              <div
                key={nivel.id}
                className={`flex items-center gap-4 p-4 rounded-lg ${
                  nivel.orden === progresoUsuario?.nivel_actual 
                    ? 'bg-neurolink-matrixGreen/20 border border-neurolink-matrixGreen' 
                    : 'bg-black/30'
                }`}
              >
                <span className="text-2xl">{nivel.icono}</span>
                <div>
                  <h3 className="font-bold text-white">{nivel.nombre}</h3>
                  <p className="text-sm text-gray-400">{nivel.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="space-y-4">
            {niveles.slice(5, Math.min(10, niveles.length)).map((nivel) => (
              <div 
                key={nivel.id} 
                className={`flex items-center gap-4 p-4 rounded-lg ${
                  nivel.orden === progresoUsuario?.nivel_actual 
                    ? 'bg-neurolink-matrixGreen/20 border border-neurolink-matrixGreen' 
                    : 'bg-black/30'
                }`}
              >
                <span className="text-2xl">{nivel.icono}</span>
                <div>
                  <h3 className="font-bold text-white">{nivel.nombre}</h3>
                  <p className="text-sm text-gray-400">{nivel.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NivelesClasificacionDashboard; 