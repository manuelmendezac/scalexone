import React, { useEffect, useState } from 'react';
import { Trophy, Star, Coins } from 'lucide-react';
import '../styles/gamification.css';
import { supabase } from '../supabase';
import { useGamification } from '../hooks/useGamification';

interface EstadisticasXPProps {
  xpTotal: number;
  monedas: number;
  nivel: number;
  titulo: string;
  siguienteNivel: {
    xpRequerida: number;
    titulo: string;
    recompensaMonedas: number;
  };
}

interface Estadisticas {
  totalVideos: number;
  totalModulos: number;
  totalCursos: number;
  tiempoTotal: number;
  xpPorTipo: {
    [key: string]: number;
  };
}

const EstadisticasXP: React.FC<EstadisticasXPProps> = ({
  xpTotal,
  monedas,
  nivel,
  titulo,
  siguienteNivel
}) => {
  const { xp, nivel: userNivel, monedas: userMonedas } = useGamification();
  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    totalVideos: 0,
    totalModulos: 0,
    totalCursos: 0,
    tiempoTotal: 0,
    xpPorTipo: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Obtener estadísticas de videos
        const { data: videosData } = await supabase
          .from('actividad_videos_usuario')
          .select('*')
          .eq('usuario_id', user.id)
          .eq('completado', true);

        // Obtener estadísticas de módulos
        const { data: modulosData } = await supabase
          .from('actividad_modulos_usuario')
          .select('*')
          .eq('usuario_id', user.id)
          .eq('completado', true);

        // Obtener estadísticas de cursos
        const { data: cursosData } = await supabase
          .from('actividad_cursos_usuario')
          .select('*')
          .eq('usuario_id', user.id)
          .eq('completado', true);

        // Obtener XP por tipo de actividad
        const { data: historialXP } = await supabase
          .from('historial_xp')
          .select('tipo_actividad, xp_ganado')
          .eq('usuario_id', user.id);

        // Calcular XP por tipo
        const xpPorTipo = (historialXP || []).reduce((acc: any, item) => {
          acc[item.tipo_actividad] = (acc[item.tipo_actividad] || 0) + item.xp_ganado;
          return acc;
        }, {});

        // Calcular tiempo total de visualización
        const tiempoTotal = (videosData || []).reduce((total, video) => total + (video.tiempo_visto || 0), 0);

        setEstadisticas({
          totalVideos: videosData?.length || 0,
          totalModulos: modulosData?.length || 0,
          totalCursos: cursosData?.length || 0,
          tiempoTotal,
          xpPorTipo
        });
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarEstadisticas();
  }, []);

  const formatTiempo = (segundos: number) => {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    return `${horas}h ${minutos}m`;
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-48 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Estadísticas de Aprendizaje
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="text-center">
          <div className="text-3xl font-bold text-indigo-600 mb-1">
            {estadisticas.totalVideos}
          </div>
          <div className="text-sm text-gray-600">Videos Completados</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600 mb-1">
            {estadisticas.totalModulos}
          </div>
          <div className="text-sm text-gray-600">Módulos Completados</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {estadisticas.totalCursos}
          </div>
          <div className="text-sm text-gray-600">Cursos Completados</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600 mb-1">
            {formatTiempo(estadisticas.tiempoTotal)}
          </div>
          <div className="text-sm text-gray-600">Tiempo Total</div>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        Distribución de XP
      </h3>
      <div className="space-y-4">
        {Object.entries(estadisticas.xpPorTipo).map(([tipo, xpGanado]) => (
          <div key={tipo} className="relative">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>{tipo.charAt(0).toUpperCase() + tipo.slice(1)}</span>
              <span>{xpGanado} XP</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500"
                style={{ width: `${(xpGanado / xp) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EstadisticasXP; 